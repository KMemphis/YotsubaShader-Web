// Shared by tts.mjs (docs audio) and the video narration script.
//   synthesize()  Gemini speech API -> raw 24 kHz 16-bit mono PCM
//   analyse()     pauses and speech start/end of a PCM buffer
//   alignChunk()  sentence timings for a chunk of paragraphs (see the comment on the function)
export const RATE = 24000; // the API answers 24 kHz, 16-bit, mono

/* ---------------------------------------------------------------- API */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Raw 16-bit PCM from a WAV buffer (reads the 'data' chunk; trusts 24 kHz mono like the API documents). */
export function wavToPcm(buf) {
  if (buf.toString('ascii', 0, 4) !== 'RIFF') return buf; // already raw PCM
  let p = 12;
  while (p + 8 <= buf.length) {
    const id = buf.toString('ascii', p, p + 4);
    const size = buf.readUInt32LE(p + 4);
    if (id === 'data') return buf.subarray(p + 8, size >= buf.length ? undefined : p + 8 + size);
    p += 8 + size + (size % 2);
  }
  throw new Error('WAV without data chunk');
}

export async function synthesize(text, key, { model, voice }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const body = {
    contents: [{ role: 'user', parts: [{ text }] }],
    generationConfig: {
      responseModalities: ['audio'],
      speech_config: { voice_config: { prebuilt_voice_config: { voice_name: voice } } },
    },
  };
  let lastErr;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': key }, body: JSON.stringify(body) });
      if (res.status === 429 || res.status >= 500) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!res.ok) throw Object.assign(new Error(json.error?.message || `HTTP ${res.status}`), { fatal: true });
      const part = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
      if (!part) throw new Error('no audio in response: ' + (json.candidates?.[0]?.finishReason || 'unknown'));
      return wavToPcm(Buffer.from(part.inlineData.data, 'base64'));
    } catch (e) {
      lastErr = e;
      if (e.fatal) break;
      await sleep(1500 * 2 ** attempt);
    }
  }
  throw lastErr;
}

/* ---------------------------------------------------------------- audio analysis */
/** Pauses (>= minMs of near silence) as [startSec, endSec] pairs, plus where speech starts and ends. */
export function analyse(pcm, minMs = 170) {
  const samples = new Int16Array(pcm.buffer, pcm.byteOffset, Math.floor(pcm.length / 2));
  const frame = Math.round(RATE * 0.02);
  const n = Math.floor(samples.length / frame);
  const rms = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let j = i * frame; j < (i + 1) * frame; j++) sum += samples[j] * samples[j];
    rms[i] = Math.sqrt(sum / frame);
  }
  const sorted = [...rms].sort((a, b) => a - b);
  const loud = sorted[Math.floor(sorted.length * 0.9)] || 1;
  const thr = Math.max(60, loud * 0.05);
  const quiet = [...rms].map((v) => v < thr);
  const first = quiet.indexOf(false);
  const last = quiet.lastIndexOf(false);
  const pauses = [];
  const minFrames = Math.ceil(minMs / 20);
  for (let i = Math.max(first, 0); i <= last; ) {
    if (!quiet[i]) { i++; continue; }
    let j = i;
    while (j <= last && quiet[j]) j++;
    if (j - i >= minFrames) pauses.push([i * 0.02, j * 0.02]);
    i = j;
  }
  return { pauses, start: Math.max(first, 0) * 0.02, end: (last + 1) * 0.02, duration: n * 0.02 };
}

/**
 * Time of every sentence of a chunk. blocks = [{ text }].
 * Returns, per block, segments [startSec, endSec, fractionOfBlockTextWhereItEnds].
 *
 * The audio has pauses after sentences (longer after paragraphs) and after some commas. We choose which pauses
 * are sentence ends with a small dynamic program: the time between two chosen pauses should match the number of
 * characters between them at the speaking rate, longer pauses are more likely to be sentence ends, and skipping
 * a sentence end (it gets interpolated) costs a little. This keeps errors local instead of accumulating.
 */
export function alignChunk(blocks, pcm) {
  const a = analyse(pcm, 150);
  const P = a.pauses;
  // sentences
  const units = [];
  blocks.forEach((b, bi) => {
    const parts = b.text.split(/(?<=[.!?:…])\s+/).filter((s) => s.trim());
    parts.forEach((t, k) => units.push({ bi, chars: t.length, blockEnd: k === parts.length - 1 }));
  });
  const m = units.length;
  const cc = []; // characters up to and including unit i
  units.reduce((acc, u, i) => (cc[i] = acc + u.chars), 0);
  const totalChars = cc[m - 1];
  const speech = Math.max(a.end - a.start - P.reduce((s, p) => s + (p[1] - p[0]), 0), 0.1);
  const rate = speech / totalChars; // seconds per character, pauses excluded
  const SKIP = 0.6; // cost of a sentence end with no pause assigned
  const seg = (dur, chars) => { const e = rate * chars; return ((dur - e) * (dur - e)) / (e + 1); };
  const assign = (i, k) => {
    const len = P[k][1] - P[k][0];
    return -Math.min(Math.max(len - 0.15, 0), 0.6) * 1.5 - (units[i].blockEnd && len > 0.45 ? 0.4 : 0);
  };
  // f[i][k]: best cost with boundary i (end of unit i) sitting on pause k
  const f = Array.from({ length: m - 1 }, () => new Float64Array(P.length).fill(Infinity));
  const from = Array.from({ length: m - 1 }, () => new Int32Array(P.length).fill(-1)); // encoded i'*P+k', -2 = start
  for (let i = 0; i < m - 1; i++) {
    for (let k = 0; k < P.length; k++) {
      let best = Infinity, arg = -1;
      // from the start of the speech
      let c = seg(P[k][0] - a.start, cc[i]) + SKIP * i;
      if (c < best) { best = c; arg = -2; }
      for (let i2 = Math.max(0, i - 6); i2 < i; i2++) {
        for (let k2 = 0; k2 < k; k2++) {
          if (f[i2][k2] === Infinity) continue;
          c = f[i2][k2] + seg(P[k][0] - P[k2][1], cc[i] - cc[i2]) + SKIP * (i - i2 - 1);
          if (c < best) { best = c; arg = i2 * P.length + k2; }
        }
      }
      if (arg !== -1) { f[i][k] = best + assign(i, k); from[i][k] = arg; }
    }
  }
  // close at the end of the speech
  let bestEnd = seg(a.end - a.start, totalChars) + SKIP * (m - 1), endArg = -2;
  for (let i = Math.max(0, m - 8); i < m - 1; i++)
    for (let k = 0; k < P.length; k++) {
      if (f[i][k] === Infinity) continue;
      const c = f[i][k] + seg(a.end - P[k][1], totalChars - cc[i]) + SKIP * (m - 2 - i);
      if (c < bestEnd) { bestEnd = c; endArg = i * P.length + k; }
    }
  // backtrack the anchors
  const anchor = new Map(); // boundary index -> pause index
  for (let code = endArg; code >= 0; ) {
    const i = Math.floor(code / P.length), k = code % P.length;
    anchor.set(i, k);
    code = from[i][k] >= 0 ? from[i][k] : -2;
  }
  // time at each boundary: [endOfUnit, startOfNextUnit]
  const bound = [];
  let prev = { t: a.start, c: 0 };
  const list = [...anchor.keys()].sort((x, y) => x - y);
  const nextAnchor = (idx) => { const i = list[idx]; return i === undefined ? { t: a.end, c: totalChars } : { t: P[anchor.get(i)][0], c: cc[i] }; };
  let li = 0;
  for (let i = 0; i < m - 1; i++) {
    if (anchor.has(i)) {
      const k = anchor.get(i);
      bound[i] = [P[k][0], P[k][1]];
      prev = { t: P[k][1], c: cc[i] };
      li++;
    } else {
      const nx = nextAnchor(li);
      const t = prev.t + ((nx.t - prev.t) * (cc[i] - prev.c)) / Math.max(nx.c - prev.c, 1);
      bound[i] = [t, t];
    }
  }
  // assemble per-block segments
  const out = blocks.map(() => []);
  const blockChars = blocks.map((b) => units.filter((u, i) => u.bi === blocks.indexOf(b)).reduce((s, u) => s + u.chars, 0));
  const doneChars = blocks.map(() => 0);
  units.forEach((u, i) => {
    const start = i === 0 ? a.start : bound[i - 1][1];
    const end = i === m - 1 ? a.end : bound[i][0];
    doneChars[u.bi] += u.chars;
    out[u.bi].push([start, Math.max(end, start), doneChars[u.bi] / blockChars[u.bi]]);
  });
  return out;
}


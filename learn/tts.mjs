#!/usr/bin/env node
// Generates the "listen to this page" audio with the Gemini speech API.
//
//   GEMINI_API_KEY=...  node tts.mjs                 every page, es + en
//   node tts.mjs --lang es --only get-started/colors  one language / pages whose key contains the text
//   node tts.mjs --dry                                 only count characters, no API calls
//   node tts.mjs --voice Fola --model gemini-3.8-flash-tts
//   node tts.mjs --batch                               send every missing chunk as ONE Batch API job (separate quota,
//                                                      half price, takes minutes to hours), then build the pages
//
// The key is read from the GEMINI_API_KEY environment variable or from learn/.env (git-ignored).
// Run `node build.mjs` first: it writes .tts/<lang>/<page>.json with the exact text of each page.
// Output (commit or upload it): audio/<lang>/<section>/<page>.mp3 and .json (the word timing for the player).
//
// How the highlight timing works: the API returns audio only, with no word timestamps. Each page is read in chunks
// of a few paragraphs. For every chunk we know the real duration, we find the pauses in the audio, and we pin each
// paragraph start to the nearest pause. Inside a paragraph the player spreads the time over the words by length.
// Results are cached in audio-cache/ (keyed by text + voice), so re-running only pays for text that changed.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { RATE, synthesize, alignChunk, wavToPcm } from './lib/speech.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DUMP = path.join(ROOT, '.tts');
const OUT = path.join(ROOT, 'audio');
const CACHE = path.join(ROOT, 'audio-cache');

const argv = process.argv.slice(2);
const opt = (name, def) => { const i = argv.indexOf('--' + name); return i >= 0 ? argv[i + 1] : def; };
const flag = (name) => argv.includes('--' + name);
const MODEL = opt('model', 'gemini-2.5-flash-preview-tts');
const VOICE = opt('voice', 'Charon');
const LANG = opt('lang', '');
const ONLY = opt('only', '');
const LIMIT = +opt('limit', 0);
const CONCURRENCY = +opt('concurrency', 1);
const PACE_MS = +opt('pace', 6500); // the 2.5 TTS free tier allows 10 requests per minute
const CHUNK_CHARS = +opt('chunk', 800);
const BATCH_POLL_MS = 30000;
const BATCH_SIZE = 12;
const PAUSE_BETWEEN_CHUNKS = 0.35; // seconds of silence added between chunks

/* ---------------------------------------------------------------- key */
function loadKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  const envFile = path.join(ROOT, '.env');
  if (fs.existsSync(envFile)) {
    const m = fs.readFileSync(envFile, 'utf8').match(/^\s*GEMINI_API_KEY\s*=\s*(.+?)\s*$/m);
    if (m) return m[1].replace(/^["']|["']$/g, '');
  }
  return '';
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------------------------------------------------------------- per page */
function planChunks(blocks) {
  const chunks = [];
  let cur = null;
  blocks.forEach((text, index) => {
    if (!text.trim()) return;
    if (!cur || cur.chars + text.length > CHUNK_CHARS) chunks.push((cur = { items: [], chars: 0 }));
    cur.items.push({ index, text });
    cur.chars += text.length;
  });
  return chunks;
}

async function pool(items, size, fn) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: size }, async () => {
    while (next < items.length) { const i = next++; results[i] = await fn(items[i], i); }
  }));
  return results;
}

// Respellings so the voice says these words correctly (the page keeps the written form).
const SAY = { en: [['C#', 'C sharp'], ['Yotsuba', 'Yot soo ba']], es: [['C#', 'Ce sharp'], ['Yotsuba', 'Yot su ba']] };
const say = (t, lang) => (SAY[lang] || []).reduce((x, [a, b]) => x.split(a).join(b), t);

function chunkInfo(chunk, lang) {
  const text = say(chunk.items.map((b) => b.text).join('\n\n'), lang);
  const id = crypto.createHash('sha1').update(`${MODEL}|${VOICE}|${text}`).digest('hex');
  return { text, id, file: path.join(CACHE, id + '.pcm') };
}

async function chunkAudio(chunk, key, lang) {
  const { text, file } = chunkInfo(chunk, lang);
  if (fs.existsSync(file)) return { pcm: fs.readFileSync(file), cached: true };
  await sleep(PACE_MS);
  const pcm = await synthesize(text, key, { model: MODEL, voice: VOICE });
  const seconds = pcm.length / 2 / RATE;
  // sanity: ~10-18 characters per second of speech; anything far outside means the model skipped or invented text
  const cps = text.length / seconds;
  if (cps < 5 || cps > 32) console.warn(`  ! suspicious length: ${text.length} chars -> ${seconds.toFixed(1)} s`);
  fs.mkdirSync(CACHE, { recursive: true });
  fs.writeFileSync(file, pcm);
  return { pcm, cached: false };
}

function encodeMp3(pcm, file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 's16le', '-ar', String(RATE), '-ac', '1', '-i', 'pipe:0', '-codec:a', 'libmp3lame', '-b:a', '40k', file], { input: pcm, maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new Error('ffmpeg failed: ' + (r.stderr?.toString() || r.error));
}

async function doPage(dump, key) {
  const chunks = planChunks(dump.blocks);
  const results = await pool(chunks, CONCURRENCY, (c) => chunkAudio(c, key, dump.lang));
  const silence = Buffer.alloc(Math.round(RATE * PAUSE_BETWEEN_CHUNKS) * 2);
  const parts = [];
  const timings = new Array(dump.blocks.length).fill(null);
  let offset = 0;
  chunks.forEach((c, i) => {
    const { pcm } = results[i];
    const t = alignChunk(c.items, pcm);
    c.items.forEach((b, k) => { timings[b.index] = t[k].map(([s, e, f]) => [+(offset + s).toFixed(2), +(offset + e).toFixed(2), +f.toFixed(3)]); });
    parts.push(pcm, silence);
    offset += (pcm.length + silence.length) / 2 / RATE;
  });
  const rel = dump.key;
  encodeMp3(Buffer.concat(parts), path.join(OUT, rel + '.mp3'));
  const meta = { hash: dump.hash, voice: VOICE, model: MODEL, duration: +offset.toFixed(2), src: `/audio/${rel}.mp3`, blocks: timings };
  fs.writeFileSync(path.join(OUT, rel + '.json'), JSON.stringify(meta));
  return { chunks: chunks.length, cached: results.filter((r) => r.cached).length, seconds: offset };
}

/* ---------------------------------------------------------------- batch */
// Sends every chunk that is not cached yet as one Batch API job and stores the answers in the same cache
// the normal path uses. The job name is saved so an interrupted run can pick the same job up again.
async function runBatch(pages, key) {
  const wanted = new Map();
  for (const d of pages) for (const c of planChunks(d.blocks)) {
    const i = chunkInfo(c, d.lang);
    if (!fs.existsSync(i.file)) wanted.set(i.id, i);
  }
  if (!wanted.size) { console.log('Batch: nothing missing from the cache.'); return; }
  const api = 'https://generativelanguage.googleapis.com/v1beta';
  const headers = { 'content-type': 'application/json', 'x-goog-api-key': key };
  fs.mkdirSync(CACHE, { recursive: true });
  const stateFile = path.join(CACHE, 'pending-batch.json');
  // Responses carry the audio twice as base64 JSON; Node cannot read a body over ~500 MB, so send small jobs.
  const all = [...wanted.values()];
  if (all.length > BATCH_SIZE) {
    for (let i = 0; i < all.length; i += BATCH_SIZE) await runBatchJob(all.slice(i, i + BATCH_SIZE), key);
    return;
  }
  await runBatchJob(all, key);
}

// Network hiccups (ECONNRESET, DNS) are common while downloading a large batch result: retry instead of dying.
async function retry(fn, tries = 8) {
  for (let i = 0; ; i++) {
    try { return await fn(); } catch (e) { if (i >= tries - 1) throw e; await sleep(Math.min(60000, 3000 * 2 ** i)); }
  }
}

async function runBatchJob(list, key) {
  const wanted = new Map(list.map((i) => [i.id, i]));
  const api = 'https://generativelanguage.googleapis.com/v1beta';
  const headers = { 'content-type': 'application/json', 'x-goog-api-key': key };
  const stateFile = path.join(CACHE, 'pending-batch.json');
  let name;
  if (fs.existsSync(stateFile)) {
    const st = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    if (st.model === MODEL && st.voice === VOICE) { name = st.name; console.log(`Batch: resuming ${name}`); }
  }
  if (!name) {
    const requests = [...wanted.values()].map((i) => ({
      request: {
        contents: [{ role: 'user', parts: [{ text: i.text }] }],
        generationConfig: { responseModalities: ['audio'], speech_config: { voice_config: { prebuilt_voice_config: { voice_name: VOICE } } } },
      },
      metadata: { key: i.id },
    }));
    const { res, j } = await retry(async () => { const res = await await fetch(`${api}/models/${MODEL}:batchGenerateContent`, { method: 'POST', headers, body: JSON.stringify({ batch: { display_name: 'yotsuba-tts', input_config: { requests: { requests } } } }) }); return { res, j: await res.json() }; });
    if (!res.ok) throw new Error(`batch create failed: ${j.error?.message || res.status}`);
    name = j.name;
    fs.writeFileSync(stateFile, JSON.stringify({ name, model: MODEL, voice: VOICE }));
    console.log(`Batch: ${requests.length} chunks sent as ${name}`);
  }
  let job;
  for (;;) {
    job = await retry(async () => (await fetch(`${api}/${name}`, { headers })).json());
    const state = job.metadata?.state || '';
    const st = job.metadata?.batchStats || {};
    console.log(`  ${state} (${st.successfulRequestCount || 0} ok, ${st.failedRequestCount || 0} failed, ${st.pendingRequestCount || 0} pending)`);
    if (/SUCCEEDED|FAILED|CANCELLED|EXPIRED/.test(state)) break;
    await sleep(BATCH_POLL_MS);
  }
  fs.rmSync(stateFile, { force: true });
  const out = job.response?.inlinedResponses?.inlinedResponses || job.metadata?.output?.inlinedResponses?.inlinedResponses || [];
  let saved = 0;
  for (const r of out) {
    const part = r.response?.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
    const id = r.metadata?.key;
    if (!part || !wanted.has(id)) { console.warn(`  ! ${id}: ${r.error?.message || 'no audio'}`); continue; }
    fs.writeFileSync(wanted.get(id).file, wavToPcm(Buffer.from(part.inlineData.data, 'base64')));
    saved++;
  }
  console.log(`Batch: ${saved} of ${wanted.size} chunks saved to the cache.`);
}

/* ---------------------------------------------------------------- main */
function listDumps(dir = DUMP) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const f = path.join(dir, e.name);
    return e.isDirectory() ? listDumps(f) : e.name.endsWith('.json') ? [f] : [];
  });
}

const dumps = listDumps().map((f) => JSON.parse(fs.readFileSync(f, 'utf8')))
  .filter((d) => (!LANG || d.lang === LANG) && (!ONLY || d.key.includes(ONLY)))
  .sort((a, b) => a.key.localeCompare(b.key));
const todo = dumps.filter((d) => {
  const f = path.join(OUT, d.key + '.json');
  return !(fs.existsSync(f) && JSON.parse(fs.readFileSync(f, 'utf8')).hash === d.hash) || flag('force');
});
const selected = LIMIT ? todo.slice(0, LIMIT) : todo;

if (!dumps.length) { console.error('No pages found. Run `node build.mjs` first.'); process.exit(1); }
const chars = selected.reduce((a, d) => a + d.blocks.reduce((x, b) => x + b.length, 0), 0);
console.log(`${dumps.length} pages match, ${todo.length} need audio, doing ${selected.length} (${chars.toLocaleString()} characters)`);
if (flag('dry')) process.exit(0);

const key = loadKey();
if (!key) { console.error('Set GEMINI_API_KEY (environment variable or learn/.env).'); process.exit(1); }

if (flag('batch')) await runBatch(selected, key);

let done = 0, quota = 0;
for (const d of selected) {
  if (quota >= 2) { console.log('Stopping: the daily quota looks exhausted. Run again later; finished chunks are cached.'); break; }
  process.stdout.write(`[${++done}/${selected.length}] ${d.key} … `);
  try {
    const r = await doPage(d, key);
    quota = 0;
    console.log(`${r.chunks} chunks (${r.cached} cached), ${(r.seconds / 60).toFixed(1)} min`);
  } catch (e) {
    console.log('FAILED: ' + e.message);
    quota = /429/.test(e.message) ? quota + 1 : 0;
  }
}

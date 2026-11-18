#!/usr/bin/env node
// Voice-over for episode 1. One Gemini call per scene, cached by text, then:
//   - trims the dead air around each scene, adds fixed gaps, masters loudness (-16 LUFS)
//   - writes remotion/public/ep01/voice.wav and ep01/timing.json (scene -> sentence -> word times)
//
//   node automation/ep01-narration.mjs            all scenes (key from GEMINI_API_KEY or ../learn/.env)
//   node automation/ep01-narration.mjs --only s05 only scenes whose id contains the text (still rebuilds the timeline)
//
// Reuses the speech helpers of the docs site (learn/lib/speech.mjs).

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { RATE, synthesize, analyse, alignChunk } from '../../learn/lib/speech.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EPID = process.argv.includes('--ep') ? process.argv[process.argv.indexOf('--ep') + 1] : 'ep01';
const ESTIMATE = process.argv.includes('--estimate'); // no API: timings guessed from the word count, silent track (to build visuals before the voice exists)
const EP = path.join(ROOT, EPID);
const CACHE = path.join(ROOT, '../.local/promo-video', EPID, 'cache'); // not committed
const PUBLIC = path.join(ROOT, 'remotion/public', EPID);
const LANG = process.argv.includes('--lang') ? process.argv[process.argv.indexOf('--lang') + 1] : 'en';
const SUF = LANG === 'en' ? '' : '.' + LANG; // script.es.json, voice.es.wav, timing.es.json
const script = JSON.parse(fs.readFileSync(path.join(EP, `script${SUF}.json`), 'utf8'));
const MODEL = script.model;
const VOICE = script.voice;
const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : '';

const LEAD_IN = 0.6; // seconds of silence before the first word
const GAP = 0.8; // seconds between scenes: room for the picture to change
const GAP_AFTER = { 's01-hook': 1.4, 'v2-s01-hook': 1.4 }; // a longer breath after the opening
const PAD_BEFORE = 0.06, PAD_AFTER = 0.14; // keep a little room around the trimmed speech
const FIX = script.captionReplace || []; // spoken form -> written form for subtitles

function key() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  const f = path.resolve(ROOT, '../learn/.env');
  const m = fs.existsSync(f) && fs.readFileSync(f, 'utf8').match(/^\s*GEMINI_API_KEY\s*=\s*(.+?)\s*$/m);
  if (m) return m[1].replace(/^["']|["']$/g, '');
  console.error('Set GEMINI_API_KEY (environment or ../learn/.env).');
  process.exit(1);
}

// Respellings so the voice says these words correctly (captions keep the written form).
const SAY = LANG === 'en' ? [['C#', 'C sharp'], ['Yotsuba', 'Yot soo ba']] : [['C#', 'Ce sharp'], ['Yotsuba', 'Yot su ba']];
const say = (t) => SAY.reduce((x, [a, b]) => x.split(a).join(b), t);

async function scenePcm(scene, k) {
  const id = crypto.createHash('sha1').update(`${MODEL}|${scene.voice || VOICE}|${say(scene.narration)}`).digest('hex');
  const file = path.join(CACHE, id + '.pcm');
  if (fs.existsSync(file)) return { pcm: fs.readFileSync(file), cached: true };
  if (only && !scene.id.includes(only)) throw new Error(`no cached audio for ${scene.id}`);
  const pcm = await synthesize(say(scene.narration), k, { model: MODEL, voice: scene.voice || VOICE });
  fs.mkdirSync(CACHE, { recursive: true });
  fs.writeFileSync(file, pcm);
  return { pcm, cached: false };
}

const caption = (t) => FIX.reduce((s, [a, b]) => s.split(a).join(b), t);

// The voice is brisk for someone learning from zero: slow it a little (pitch is preserved by atempo).
const TEMPO = 0.93;
function stretch(pcm) {
  const r = spawnSync('ffmpeg', ['-loglevel', 'error', '-f', 's16le', '-ar', String(RATE), '-ac', '1', '-i', 'pipe:0', '-af', `atempo=${TEMPO}`, '-f', 's16le', '-ar', String(RATE), '-ac', '1', 'pipe:1'], { input: pcm, maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new Error('ffmpeg atempo: ' + r.stderr);
  return r.stdout;
}

const k = key();
const raw = []; // PCM pieces of the final voice track
const timing = { duration: 0, leadIn: LEAD_IN, scenes: [] };
let t = LEAD_IN;
raw.push(Buffer.alloc(Math.round(RATE * LEAD_IN) * 2));

for (const scene of script.scenes) {
  process.stdout.write(`${scene.id} … `);
  const { pcm: original, cached } = ESTIMATE ? { pcm: Buffer.alloc(Math.round(RATE * 2 * (scene.narration.split(/\s+/).length * 0.36 + 0.5))), cached: true } : await scenePcm(scene, k);
  const pcm = ESTIMATE ? original : stretch(original);
  const a = ESTIMATE ? { start: 0.1, end: pcm.length / 2 / RATE - 0.2, duration: pcm.length / 2 / RATE } : analyse(pcm, 150);
  // keep only the speech (plus a little air) so scene gaps are exact
  const from = Math.max(a.start - PAD_BEFORE, 0), to = Math.min(a.end + PAD_AFTER, a.duration);
  const i0 = Math.round(from * RATE) * 2, i1 = Math.round(to * RATE) * 2;
  const piece = pcm.subarray(i0, i1);
  // sentence times, relative to the trimmed piece
  const spoken = scene.narration.split(/(?<=[.!?:…])\s+/).filter((s) => s.trim());
  const seg = ESTIMATE
    ? (() => { const parts = scene.narration.split(/(?<=[.!?:…])\s+/).filter((x) => x.trim()); const tot = parts.reduce((n, x) => n + x.length, 0); let acc = 0; return parts.map((x) => { const a0 = a.start + ((a.end - a.start) * acc) / tot; acc += x.length; return [a0, a.start + ((a.end - a.start) * acc) / tot - 0.25]; }); })()
    : alignChunk([{ text: scene.narration }], pcm)[0];
  if (seg.length !== spoken.length) throw new Error(`${scene.id}: ${seg.length} segments for ${spoken.length} sentences`);
  const sentences = spoken.map((text, n) => {
    const s0 = Math.max(seg[n][0] - from, 0), s1 = Math.max(seg[n][1] - from, s0 + 0.2);
    const words = caption(text).split(/\s+/).filter(Boolean);
    const total = words.reduce((x, w) => x + w.length + 1, 0);
    let acc = 0;
    return {
      text: caption(text),
      start: +(t + s0).toFixed(3),
      end: +(t + s1).toFixed(3),
      words: words.map((w) => {
        const ws = t + s0 + ((s1 - s0) * acc) / total;
        acc += w.length + 1;
        return { w, start: +ws.toFixed(3), end: +(t + s0 + ((s1 - s0) * acc) / total).toFixed(3) };
      }),
    };
  });
  const dur = piece.length / 2 / RATE;
  timing.scenes.push({ id: scene.id, start: +t.toFixed(3), end: +(t + dur).toFixed(3), sentences });
  raw.push(piece);
  const gap = GAP_AFTER[scene.id] ?? GAP;
  raw.push(Buffer.alloc(Math.round(RATE * gap) * 2));
  t += dur + gap;
  console.log(`${dur.toFixed(1)} s${cached ? ' (cached)' : ''}`);
}
timing.duration = +t.toFixed(3);

fs.mkdirSync(PUBLIC, { recursive: true });
fs.mkdirSync(CACHE, { recursive: true });
const rawFile = path.join(CACHE, 'voice.raw.pcm');
fs.writeFileSync(rawFile, Buffer.concat(raw));
// two-pass loudness: measure, then apply a linear gain so the result lands on -16 LUFS / -1.5 dBTP
const inArgs = ['-f', 's16le', '-ar', String(RATE), '-ac', '1', '-i', rawFile];
const pass1 = ESTIMATE ? { stderr: Buffer.from('{"input_i":"-30","input_tp":"-5","input_lra":"3","input_thresh":"-40","target_offset":"0"}') } : spawnSync('ffmpeg', ['-hide_banner', ...inArgs, '-af', 'highpass=f=70,loudnorm=I=-16:TP=-1.5:LRA=9:print_format=json', '-f', 'null', '-']);
const m = JSON.parse(pass1.stderr.toString().match(/\{[\s\S]*?\}/)[0]);
const r = ESTIMATE ? spawnSync('ffmpeg', ['-y', '-loglevel', 'error', ...inArgs, '-ar', '48000', '-ac', '2', path.join(PUBLIC, `voice${SUF}.wav`)]) : spawnSync('ffmpeg', ['-y', '-loglevel', 'error', ...inArgs, '-af',
  `highpass=f=70,loudnorm=I=-16:TP=-1.5:LRA=9:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`,
  '-ar', '48000', '-ac', '2', path.join(PUBLIC, `voice${SUF}.wav`)]);
if (r.status !== 0) throw new Error('ffmpeg: ' + r.stderr);
fs.writeFileSync(path.join(EP, `timing${SUF}.json`), JSON.stringify(timing, null, 1));
fs.mkdirSync(path.join(ROOT, 'remotion/src/ep01'), { recursive: true });
fs.writeFileSync(path.join(ROOT, `remotion/src/ep01/timing${EPID === 'ep01' ? '' : '.' + EPID}${SUF}.json`), JSON.stringify(timing)); // imported by the composition
const words = script.scenes.reduce((n, s) => n + s.narration.split(/\s+/).length, 0);
console.log(`\nvoice: ${(timing.duration / 60).toFixed(2)} min (${words} words)  ->  ep01/timing${SUF}.json, voice${SUF}.wav`);

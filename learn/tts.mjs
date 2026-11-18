#!/usr/bin/env node
// Generates the "listen to this page" audio with the Gemini speech API.
//
//   GEMINI_API_KEY=...  node tts.mjs                 every page, es + en
//   node tts.mjs --lang es --only get-started/colors  one language / pages whose key contains the text
//   node tts.mjs --dry                                 only count characters, no API calls
//   node tts.mjs --voice Fola --model gemini-3.8-flash-tts
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
import { RATE, synthesize, alignChunk } from './lib/speech.mjs';

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

async function chunkAudio(chunk, key, lang) {
  const text = say(chunk.items.map((b) => b.text).join('\n\n'), lang);
  const id = crypto.createHash('sha1').update(`${MODEL}|${VOICE}|${text}`).digest('hex');
  const file = path.join(CACHE, id + '.pcm');
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

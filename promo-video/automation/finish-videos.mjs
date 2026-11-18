#!/usr/bin/env node
// One command to finish videos 1 and 2 once the Gemini daily quota is available:
//   node automation/finish-videos.mjs
// For each episode/language: voice (retries on quota errors) -> subtitles -> thumbnail -> render -> publish.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const run = (cmd, args) => spawnSync(cmd, args, { cwd: root, stdio: 'inherit' }).status === 0;
const sleep = (s) => spawnSync('sleep', [String(s)]);

const JOBS = [
  { ep: 'ep02', lang: 'en', comp: 'Ep02-en', title: 'How a shader is built' },
  { ep: 'ep02', lang: 'es', comp: 'Ep02-es', title: 'Cómo se construye un shader' },
  { ep: 'ep01', lang: 'en', comp: 'Ep01-en', title: 'What is a shader?' },
  { ep: 'ep01', lang: 'es', comp: 'Ep01-es', title: '¿Qué es un shader?' },
];
const THUMB_SCENE = { ep01: 's01-hook', ep02: 'v2-s01-hook' }; // the title card sits at the end of the hook

for (const j of JOBS) {
  const N = j.ep.replace(/^ep/, 'Ep');
  const out = path.join(root, '../.local/promo-video/out', j.ep);
  fs.mkdirSync(out, { recursive: true });
  const sufNarr = j.lang === 'en' ? [] : ['--lang', j.lang];
  // 1) voice, retrying while the quota is exhausted (up to ~5 h)
  let ok = false;
  for (let i = 0; i < 200 && !ok; i++) {
    ok = run('node', ['automation/ep01-narration.mjs', '--ep', j.ep, ...sufNarr]);
    if (!ok) { console.log(`[${j.ep} ${j.lang}] voice not ready, retrying in 90 s (${i + 1})`); sleep(90); }
  }
  if (!ok) { console.error('giving up on voice for', j.ep, j.lang); process.exit(1); }
  // 2) subtitles
  if (!run('node', ['automation/ep01-export.mjs', '--ep', j.ep, ...sufNarr])) process.exit(1);
  // 3) thumbnail: a frame of the title card, from the real timing
  const tj = JSON.parse(fs.readFileSync(path.join(root, j.ep, `timing${j.lang === 'en' ? '' : '.' + j.lang}.json`), 'utf8'));
  const sc = tj.scenes.find((x) => x.id === THUMB_SCENE[j.ep]);
  const frame = Math.round((sc.end - 3) * 60);
  run('npx', ['remotion', 'still', 'remotion/index.ts', j.comp, path.join(out, j.lang === 'en' ? `${N}_thumbnail.png` : `${N}_thumbnail_${j.lang}.png`), `--frame=${frame}`, '--public-dir=remotion/public']);
  // 4) render
  if (!run('npx', ['remotion', 'render', 'remotion/index.ts', j.comp, path.join(out, `${N}_${j.lang}_1080p60.mp4`), '--public-dir=remotion/public', '--codec=h264', '--crf=16', '--pixel-format=yuv420p', '--audio-codec=aac', '--audio-bitrate=320k', '--timeout=120000'])) process.exit(1);
  // 5) publish to the docs
  if (!run('node', ['automation/publish-video.mjs', j.ep, j.title, j.lang])) process.exit(1);
}
console.log('done: videos 1 and 2 rendered and published. Now: add `video: ep02` to how-a-shader-is-built (en/es) and run `node build.mjs` in learn/.');

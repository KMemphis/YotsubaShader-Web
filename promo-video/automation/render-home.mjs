#!/usr/bin/env node
// Renders the home-page film (Home-en, Home-es) in 4K / 60 fps into ../.local/promo-video/home/.
//   node automation/render-home.mjs [en|es ...]
// Uses its own port so it never talks to a dev server that is already running on the default one.
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.resolve(root, '../.local/promo-video/home');
fs.mkdirSync(out, { recursive: true });
const langs = process.argv.slice(2).length ? process.argv.slice(2) : ['en', 'es'];
const serveUrl = await bundle({ entryPoint: path.join(root, 'remotion/index.ts'), publicDir: path.join(root, 'remotion/public') });
for (const lang of langs) {
  const composition = await selectComposition({ serveUrl, id: `Home-${lang}`, port: 3457 });
  await renderMedia({
    composition, serveUrl, codec: 'h264', crf: 15, pixelFormat: 'yuv420p', scale: 2, port: 3457,
    outputLocation: path.join(out, `Home_${lang}_4K60.mp4`),
  });
  console.log(`\n${lang} done`);
}

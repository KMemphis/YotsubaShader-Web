#!/usr/bin/env node
// Publishes a rendered episode to the docs site: web-friendly mp4 (faststart), subtitles, poster and a small json.
//   node automation/publish-video.mjs ep01 "What is a shader?" en
//   node automation/publish-video.mjs ep01 "¿Qué es un shader?" es
// Reads Web/.local/promo-video/out/<ep>/Ep01_<lang>_1080p60.mp4 (+ .vtt, thumbnail) and writes learn/videos/<lang>/<ep>.{mp4,vtt,jpg,json}.
// The chapter that shows it has `video: <ep>` in its frontmatter.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const [ep, title, lang] = process.argv.slice(2);
if (!ep || !title || !lang) { console.error('usage: publish-video.mjs <ep01> "<title>" <en|es>'); process.exit(1); }
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, '../.local/promo-video/out', ep);
const N = ep.replace(/^ep/, 'Ep');
const src = path.join(out, `${N}_${lang}_1080p60.mp4`);
const dst = path.resolve(root, '../learn/videos', lang);
if (!fs.existsSync(src)) { console.error('missing ' + src); process.exit(1); }
fs.mkdirSync(dst, { recursive: true });

// 1080p at 60 fps, but a web bitrate: ~3x smaller than the master, same look
const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', src, '-c:v', 'libx264', '-crf', '21', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', path.join(dst, ep + '.mp4')]);
if (r.status !== 0) { console.error(String(r.stderr)); process.exit(1); }
fs.copyFileSync(path.join(out, `${N}_${lang}.vtt`), path.join(dst, ep + '.vtt'));
const thumb = path.join(out, lang === 'en' ? `${N}_thumbnail.png` : `${N}_thumbnail_${lang}.png`);
spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', thumb, '-q:v', '3', path.join(dst, ep + '.jpg')]);
const dur = parseFloat(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path.join(dst, ep + '.mp4')]).stdout.toString());
fs.writeFileSync(path.join(dst, ep + '.json'), JSON.stringify({ title, minutes: Math.round(dur / 60), duration: Math.round(dur) }));
console.log(`${lang}/${ep}: ${(fs.statSync(path.join(dst, ep + '.mp4')).size / 1e6).toFixed(1)} MB, ${Math.round(dur)} s`);

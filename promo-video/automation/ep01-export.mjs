// Exports Ep01_<lang>.srt and .vtt (--lang es for Spanish) from ep01/timing.json, paged exactly like the burned-in captions.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LANG = process.argv.includes('--lang') ? process.argv[process.argv.indexOf('--lang') + 1] : 'en';
const SUF = LANG === 'en' ? '' : '.' + LANG;
const EP = process.argv.includes('--ep') ? process.argv[process.argv.indexOf('--ep') + 1] : 'ep01';
const N = EP.replace(/^ep/, 'Ep');
const timing = JSON.parse(fs.readFileSync(path.join(root, `${EP}/timing${SUF}.json`), 'utf8'));
const out = path.join(root, '../.local/promo-video/out', EP);
fs.mkdirSync(out, { recursive: true });

const MAX_CHARS = 72;
const SOFT_BREAK = 38;

const pages = [];
for (const sc of timing.scenes) {
  for (const sen of sc.sentences) {
    let cur = [];
    let len = 0;
    const flush = () => { if (cur.length) pages.push({ start: cur[0].start, end: cur[cur.length - 1].end, words: cur }); cur = []; len = 0; };
    sen.words.forEach((w, i) => {
      if (cur.length && len + 1 + w.w.length > MAX_CHARS) flush();
      cur.push(w);
      len += (len ? 1 : 0) + w.w.length;
      if (i !== sen.words.length - 1 && len >= SOFT_BREAK && /[,;:]$/.test(w.w)) flush();
    });
    flush();
    const n = pages.length;
    if (n >= 2 && pages[n - 1].words.length === 1 && pages[n - 2].end >= sen.start) {
      const prev = pages[n - 2], last = pages[n - 1];
      const total = prev.words.reduce((a, w) => a + w.w.length + 1, 0) + last.words[0].w.length;
      if (total <= MAX_CHARS + 10) { prev.words.push(last.words[0]); prev.end = last.end; pages.pop(); }
    }
  }
}

const ts = (s, sep) => {
  const ms = Math.round(s * 1000);
  const p = (n, l = 2) => String(n).padStart(l, '0');
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)}${sep}${p(ms % 1000, 3)}`;
};

// show a little before the first word, hold a little after the last, never overlap the next cue
const cues = pages.map((p, i) => {
  const next = pages[i + 1];
  const start = Math.max(0, p.start - 0.1);
  let end = p.end + 0.3;
  if (next) end = Math.min(end, next.start - 0.1 - 0.02);
  return { start, end: Math.max(end, start + 0.4), text: p.words.map((w) => w.w).join(' ') };
});

fs.writeFileSync(path.join(out, `${N}_${LANG}.srt`), cues.map((c, i) => `${i + 1}\n${ts(c.start, ',')} --> ${ts(c.end, ',')}\n${c.text}\n`).join('\n'));
fs.writeFileSync(path.join(out, `${N}_${LANG}.vtt`), 'WEBVTT\n\n' + cues.map((c) => `${ts(c.start, '.')} --> ${ts(c.end, '.')}\n${c.text}\n`).join('\n'));
console.log(`${cues.length} cues -> Web/.local/promo-video/out/${EP}/${N}_${LANG}.srt, .vtt`);

#!/usr/bin/env node
// Turns a built tutorial chapter + its audio timing into the data a chapter video is made from.
//   node chapter-data.mjs en get-started/what-is-a-shader
// Reads Web/learn/dist/<lang>/<page>/index.html and Web/learn/audio/<lang>/<page>.json,
// writes remotion/src/chapters/data/<lang>.<page>.json and copies the mp3 to remotion/public/chapters/.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LEARN = path.join(HERE, '..', '..', 'learn');
const [lang, page] = process.argv.slice(2);
const slug = page.split('/').pop();

const ENT = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' };
const dec = (s) => s.replace(/&(?:amp|lt|gt|quot|#39|nbsp);/g, (m) => ENT[m]);
const strip = (s) => dec(s.replace(/<[^>]+>/g, ''));

const html = fs.readFileSync(path.join(LEARN, 'dist', lang, page, 'index.html'), 'utf8');
const art = html.slice(html.indexOf('<article'), html.indexOf('</article>'));
const audio = JSON.parse(fs.readFileSync(path.join(LEARN, 'audio', lang, page + '.json'), 'utf8'));

// code groups (style groups and output tabs) hold nested divs: cut them out with a balanced scan first
const groups = [];
let art2 = '';
{
  let i = 0;
  while (true) {
    const j = art.indexOf('<div class="code-group"', i);
    if (j < 0) { art2 += art.slice(i); break; }
    art2 += art.slice(i, j);
    let depth = 0, k = j;
    const tag = /<\/?div\b[^>]*>/g;
    tag.lastIndex = j;
    let mm;
    while ((mm = tag.exec(art))) { depth += mm[0][1] === '/' ? -1 : 1; if (depth === 0) { k = tag.lastIndex; break; } }
    const g = art.slice(j, k);
    const styled = /data-styles="([^"]*)"/.exec(g);
    const panels = [...g.matchAll(/<div class="code-panel"[^>]*?(?:data-style="([^"]*)")?[^>]*>([\s\S]*?)<\/pre>/g)].map((x) => ({ style: x[1], code: strip((x[2].match(/<pre[^>]*>([\s\S]*)$/) || [, ''])[1]).replace(/\n$/, '') }));
    const labels = [...g.matchAll(/<button role="tab"[^>]*>([\s\S]*?)<\/button>/g)].map((x) => strip(x[1]));
    const title = strip((g.match(/<div class="code-title">([\s\S]*?)<\/div>/) || [, ''])[1]);
    groups.push(styled ? { kind: 'styles', styles: panels.map((x, n) => ({ style: x.style || styled[1].split(' ')[n], code: x.code })), title } : { kind: 'tabs', tabs: panels.map((x, n) => ({ label: labels[n] || '', code: x.code })) });
    art2 += `<codegroup n="${groups.length - 1}"></codegroup>`;
    i = k;
  }
}
const items = [];
const re = /<(h[23])[^>]*>([\s\S]*?)<\/\1>|<(p|li)(\s[^>]*)?>([\s\S]*?)<\/\3>|<pre[^>]*>([\s\S]*?)<\/pre>|<table[\s\S]*?<\/table>|<img[^>]*>|<div class="code-title">([\s\S]*?)<\/div>|<codegroup n="(\d+)"><\/codegroup>/g;
let m;
let title = '';
while ((m = re.exec(art2))) {
  if (m[1]) {
    const b = (m[2].match(/data-b="(\d+)"/) || [])[1];
    items.push({ kind: m[1], block: b === undefined ? null : +b, text: strip(m[2]).replace(/#$/, '').trim() });
  } else if (m[3]) {
    const b = (m[5].match(/data-b="(\d+)"/) || [])[1];
    const cls = ((m[4] || "").match(/class="([^"]*)"/) || [])[1] || '';
    if (/<img/.test(m[5]) && b === undefined) items.push({ kind: 'img', ...imgOf(m[5]) });
    else items.push({ kind: cls.includes('say') ? 'say' : m[3], block: b === undefined ? null : +b, text: strip(m[5]).trim() });
  } else if (m[6] !== undefined) items.push({ kind: 'code', title, code: strip(m[6]).replace(/^Copy/, '').replace(/\n$/, '') }), (title = '');
  else if (m[0].startsWith('<table')) {
    const rows = [...m[0].matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((r) => [...r[1].matchAll(/<t[hd]>([\s\S]*?)<\/t[hd]>/g)].map((c) => strip(c[1]).trim()));
    items.push({ kind: 'table', rows });
  } else if (m[0].startsWith('<img')) items.push({ kind: 'img', ...imgOf(m[0]) });
  else if (m[7] !== undefined) title = strip(m[7]);
  else if (m[8] !== undefined) items.push(groups[+m[8]]);
}
function imgOf(s) { return { src: (s.match(/src="([^"]*)"/) || [])[1], alt: dec((s.match(/alt="([^"]*)"/) || [])[1] || '') }; }

// the same block can appear once as a heading/paragraph; attach sentences with times
const dedupe = new Set();
const out = [];
for (const it of items) {
  if (it.block != null) {
    if (dedupe.has(it.block)) continue;
    dedupe.add(it.block);
    const segs = audio.blocks[it.block];
    if (!segs) { out.push({ ...it, silent: true }); continue; }
    const text = it.text;
    // sentences: split on the sentence marks when the count matches the audio, otherwise cut by character fraction at a space
    const parts = text.split(/(?<=[.!?:])\s+(?=\S)/);
    if (parts.length === segs.length) it.sentences = segs.map(([s, e], k) => ({ start: s, end: e, text: parts[k] }));
    else {
      let prev = 0;
      it.sentences = segs.map(([s, e, f], k) => {
        let cut = k === segs.length - 1 ? text.length : Math.round(text.length * f);
        const sp = text.indexOf(' ', cut);
        const sb = text.lastIndexOf(' ', cut);
        if (k < segs.length - 1) cut = sp < 0 ? sb : sb < 0 ? sp : (cut - sb <= sp - cut ? sb : sp);
        const t = text.slice(prev, cut).trim();
        prev = cut;
        return { start: s, end: e, text: t };
      });
    }
    if (it.kind === 'h2' || it.kind === 'h3') it.sentences = [{ start: segs[0][0], end: segs[segs.length - 1][1], text }];
    it.start = segs[0][0];
    it.end = segs[segs.length - 1][1];
  }
  out.push(it);
}
const pageTitle = (html.match(/<title>([^<]*?)(?: ·[^<]*)?<\/title>/) || [, slug])[1];
const data = { lang, page, title: dec(pageTitle), duration: audio.duration, items: out };
const pubAssets = path.join(HERE, '..', 'remotion', 'public', 'chapters');
for (const it of out) if (it.kind === 'img' && it.src) {
  const from = path.join(LEARN, 'dist', it.src);
  if (fs.existsSync(from)) { const to = path.join(pubAssets, it.src); fs.mkdirSync(path.dirname(to), { recursive: true }); fs.copyFileSync(from, to); }
}
const dir = path.join(HERE, '..', 'remotion', 'src', 'chapters', 'data');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, `${lang}.${slug}.json`), JSON.stringify(data, null, 1));
const pub = path.join(HERE, '..', 'remotion', 'public', 'chapters');
fs.mkdirSync(pub, { recursive: true });
fs.copyFileSync(path.join(LEARN, 'audio', lang, page + '.mp3'), path.join(pub, `${lang}.${slug}.mp3`));
for (const it of out) {
  const head = (it.text || it.code || it.src || (it.rows ? 'table' : '') || it.kind).toString().replace(/\s+/g, ' ').slice(0, 70);
  console.log(String(it.block ?? '-').padStart(3), it.kind.padEnd(5), it.start != null ? `${it.start.toFixed(1)}-${it.end.toFixed(1)}` : ''.padEnd(9), head);
}
console.log('duration', audio.duration, 'items', out.length);

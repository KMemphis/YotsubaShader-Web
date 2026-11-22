// The listen "stage": motion graphics shown next to the text while a page is read aloud (static/js/stage.js draws them).
// Scenes are written in stage/<section>/<page>.mjs (default export: an array of scenes) and placed in the text with
// `> [!SCENE] id` cues. This module loads those files and turns them into the JSON the page carries:
//  - { en: '…', es: '…' } becomes the text of the page's language
//  - {{var}} is replaced with the route's vars (engine name, …)
//  - { code: '…', lang: 'csharp' } gets `lines`: the code highlighted line by line, with the same tok-* classes as the article
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { highlight } from './highlight.mjs';

/** stage dir -> Map('get-started/what-is-a-shader' -> scenes). Imported fresh every time so the dev server sees edits. */
export async function loadStages(dir) {
  const out = new Map();
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir, { recursive: true })) {
    if (!String(f).endsWith('.mjs')) continue;
    const mod = await import(pathToFileURL(path.join(dir, f)).href + '?t=' + Date.now());
    out.set(String(f).replace(/\\/g, '/').replace(/\.mjs$/, ''), mod.default);
  }
  return out;
}

export function resolveStage(scenes, lang, langs, vars = {}, route = null) {
  const errors = [];
  const isText = (o) => { const k = Object.keys(o); return k.length > 0 && k.every((x) => langs.includes(x)); };
  const sub = (s) => s.replace(/\{\{\s*(\w+)\s*\}\}/g, (m, k) => (k in vars ? vars[k] : (errors.push(`unknown var {{${k}}}`), m)));
  const walk = (v) => {
    if (typeof v === 'string') return sub(v);
    if (Array.isArray(v)) return v.map(walk);
    if (!v || typeof v !== 'object') return v;
    if (isText(v)) return walk(v[lang] ?? v.en);
    // { route: { godot: …, default: … } }: the value for the page's route (Get Started has one page per engine)
    if (Object.keys(v).length === 1 && v.route && typeof v.route === 'object') return walk(route && route in v.route ? v.route[route] : v.route.default);
    const o = Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)]));
    if (typeof o.code === 'string' && typeof o.lang === 'string') o.lines = o.code.replace(/\n$/, '').split('\n').map((l) => highlight(o.lang || '', l) || ' ');
    return o;
  };
  const ids = new Set();
  for (const s of scenes) {
    if (!s.id || !Array.isArray(s.items)) errors.push(`scene without id or items: ${JSON.stringify(s).slice(0, 80)}`);
    if (ids.has(s.id)) errors.push(`scene "${s.id}" is defined twice`);
    ids.add(s.id);
  }
  return { scenes: walk(scenes), errors };
}

// Writes the 100 examples (20 per style) to ../examples/<style>/<id>.cs, a wrapped copy for the compile check in
// ../examples-check/gen, and ../data/examples.json for the MCP server.
//   node tools/build-examples.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RECIPES } from './recipes.mjs';
import { STYLES, STYLE_IDS, render } from './styles.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const playgroundDir = path.join(root, '..', 'src', 'playground-examples');

// The shaders of the playground keep the style they are written in. The recipes fill each style up to 20.
const PLAYGROUND = [
  { file: 'aurora', style: 'glsl', title: ['Aurora', 'Aurora'], desc: ['Northern lights ribbons over a starry night sky.', 'Cintas de aurora boreal sobre un cielo estrellado.'], tags: ['playground', 'sky', 'animated'] },
  { file: 'bricks', style: 'glsl', title: ['Bricks', 'Ladrillos'], desc: ['A brick wall with mortar, lit by a moving light.', 'Un muro de ladrillos con mortero, iluminado por una luz en movimiento.'], tags: ['playground', 'procedural', 'lighting'] },
  { file: 'fractal', style: 'glsl', title: ['Fractal', 'Fractal'], desc: ['An animated fractal zoom.', 'Un zoom fractal animado.'], tags: ['playground', 'fractal'] },
  { file: 'mandelbulb', style: 'glsl', title: ['Mandelbulb', 'Mandelbulb'], desc: ['The 3D Mandelbulb fractal, raymarched.', 'El fractal Mandelbulb en 3D, con raymarching.'], tags: ['playground', 'fractal', 'raymarching'] },
  { file: 'mesh-gradient', style: 'glsl', title: ['Mesh gradient', 'Degradado de malla'], desc: ['Five soft colour sources drifting into a mesh gradient.', 'Cinco fuentes de color suaves que se funden en un degradado de malla.'], tags: ['playground', 'gradient', 'animated'] },
  { file: 'orbs', style: 'glsl', title: ['Orbs', 'Orbes'], desc: ['Glowing spheres orbiting in a raymarched scene.', 'Esferas brillantes en órbita en una escena con raymarching.'], tags: ['playground', 'raymarching', 'lighting'] },
  { file: 'pool', style: 'glsl', title: ['Pool', 'Piscina'], desc: ['Water caustics on the bottom of a pool.', 'Cáusticas de agua en el fondo de una piscina.'], tags: ['playground', 'water', 'animated'] },
  { file: 'ocean', style: 'hlsl', title: ['Ocean', 'Océano'], desc: ['A raymarched ocean with waves, sky and sun.', 'Un océano con raymarching, con olas, cielo y sol.'], tags: ['playground', 'water', 'raymarching'] },
];

const NOTES = {
  'glsl-bricks': 'Uses sampler2D (a texture with its sampler included): it compiles to every target except WGSL, which has no such type.',
  'glsl-pool': 'Uses sampler2D (a texture with its sampler included): it compiles to every target except WGSL, which has no such type.',
};
const pascal = (id) => id.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join('');
const entries = [];
const add = (e) => entries.push(e);

for (const pg of PLAYGROUND) {
  add({ id: `${pg.style}-${pg.file}`, style: pg.style, title: pg.title, description: pg.desc, tags: pg.tags, credit: 'Example of the Yotsuba Shader playground.', source: 'playground', notes: NOTES[`${pg.style}-${pg.file}`], code: fs.readFileSync(path.join(playgroundDir, `${pg.file}.cs`), 'utf8') });
}
for (const style of STYLE_IDS) {
  const have = entries.filter((e) => e.style === style).length;
  let need = 20 - have;
  for (const r of RECIPES) {
    if (need === 0) break;
    add({ id: `${style}-${r.id}`, style, title: r.title, description: r.desc, tags: r.tags, credit: r.credit, source: 'recipe', code: render(r, style) });
    need--;
  }
}

// Output
const outDir = path.join(root, 'examples');
const genDir = path.join(root, 'examples-check', 'gen');
for (const d of [outDir, genDir]) fs.rmSync(d, { recursive: true, force: true });
const wrap = (code, ns) => {
  const lines = code.replace(/\n+$/, '').split('\n');
  const scoped = lines.findIndex((l) => /^namespace\s+[\w.]+;\s*$/.test(l));
  if (scoped >= 0) { lines[scoped] = `namespace ${ns};`; return lines.join('\n') + '\n'; }
  let last = -1;
  lines.forEach((l, i) => { if (/^using\s/.test(l)) last = i; });
  return [...lines.slice(0, last + 1), `namespace ${ns}`, '{', ...lines.slice(last + 1).map((l) => (l ? '    ' + l : l)), '}', ''].join('\n');
};
for (const e of entries) {
  fs.mkdirSync(path.join(outDir, e.style), { recursive: true });
  fs.mkdirSync(path.join(genDir, e.style), { recursive: true });
  fs.writeFileSync(path.join(outDir, e.style, `${e.id.slice(e.style.length + 1)}.cs`), e.code);
  fs.writeFileSync(path.join(genDir, e.style, `${e.id.slice(e.style.length + 1)}.cs`), wrap(e.code, `Ex_${e.style}_${e.id.slice(e.style.length + 1).replace(/-/g, '_')}`));
}
fs.mkdirSync(path.join(root, 'data'), { recursive: true });
fs.writeFileSync(path.join(root, 'data', 'examples.json'), JSON.stringify(entries.map((e) => ({ ...e, label: STYLES[e.style].label })), null, 1) + '\n');
for (const s of STYLE_IDS) console.log(s, entries.filter((e) => e.style === s).length);
console.log('total', entries.length);

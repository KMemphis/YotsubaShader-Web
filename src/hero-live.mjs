// The live demo of the home page hero: the Procedural Ocean of the playground, split in two files (OceanShader.cs and
// MethodHelpers.cs, written by tools/hero-shader.mjs, which compiles them exactly as they are shown). The C# types itself,
// runs next to it (WebGL, with the GLSL ES the compiler wrote) and has two of its constants edited.
// Without JavaScript the card shows the finished C# and a still gradient.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { highlight } from './highlight.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'src', 'data', 'hero-shader.json');

const TABS = [
  ['cs', 'OceanShader.cs'],
  ['helpers', 'MethodHelpers.cs'],
];
const STYLES = [
  ['hlsl', 'HLSL Style'],
  ['glsl', 'GLSL Style'],
];

const json = (v) => JSON.stringify(v).replace(/</g, '\\u003c');

export function heroLive() {
  const data = fs.existsSync(DATA) ? JSON.parse(fs.readFileSync(DATA, 'utf8')) : null;
  // the page shows the very files the compiler read (tools/hero-shader.mjs), in both styles, so they are complete and they compile
  const files = Object.fromEntries(Object.entries(data?.files || {}).map(([style, f]) => [style, {
    // the two numbers the demo edits are marked so the script can change them in place
    cs: highlight('csharp', f.cs.trimEnd())
      .replace('<span class="tok-n">0.38f</span>', '<span class="tok-n" data-edit="drag">0.38f</span>')
      .replace('<span class="tok-n">1.0f</span>', '<span class="tok-n" data-edit="depth">1.0f</span>'),
    helpers: highlight('csharp', f.helpers.trimEnd()),
  }]));
  const variants = (data?.variants || []).map((v) => ({ drag: v.drag, depth: v.depth }));
  const cs = files.hlsl?.cs || '';
  return `
<div class="live" data-live aria-label="Live demo: a C# shader and the result it draws">
  <div class="live-bar">
    <span class="live-dots" aria-hidden="true"><i></i><i></i><i></i></span>
    <span class="live-run" aria-hidden="true">WebGL</span>
  </div>
  <div class="live-view">
    <canvas class="live-canvas" width="560" height="200" aria-hidden="true"></canvas>
  </div>
  <div class="live-tabs">
    <div class="live-files" role="tablist" aria-label="File">
      ${TABS.map(([id, label], i) => `<button type="button" role="tab" data-tab="${id}" aria-selected="${i === 0}"${i === 0 ? ' class="is-active"' : ''}>${label}</button>`).join('')}
    </div>
    <div class="live-style" role="group" aria-label="Syntax style">
      ${STYLES.map(([id, label], i) => `<button type="button" data-style="${id}" aria-pressed="${i === 0}"${i === 0 ? ' class="is-active"' : ''}>${label}</button>`).join('')}
    </div>
  </div>
  <pre class="live-code"><code>${cs}</code></pre>
</div>
<script type="application/json" id="live-data">${json({ variants, files, gles: data?.gles || null })}</script>`;
}

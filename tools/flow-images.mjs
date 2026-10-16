// Draws the "C# -> SPIR-V -> shader formats" figure of the home page as images, one pair (wide and tall) per language.
// Run it again after changing the text or the list of formats:
//   node tools/flow-images.mjs
// Needs rsvg-convert, dwebp and cwebp on the PATH (macOS: brew install librsvg webp).
//
// Output: src/static/img/l10n/<lang>/flow-wide.webp and flow-tall.webp (the site serves the folder that matches the page
// language) and src/flow-sizes.json (their pixel sizes, read by src/diagram.mjs).

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { BACKENDS, SPIRV_LOGO } from '../src/backends.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IMG = path.join(ROOT, 'src', 'static', 'img');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'flow-'));

const TEXT = {
  en: {
    step1: 'Write it in C#',
    step2: 'Compile to SPIR-V',
    step3: 'Get your format',
    note3: 'SPIR-V, plus the formats made from it',
    hub: 'Yotsuba Shader',
  },
  es: {
    step1: 'Escríbelo en C#',
    step2: 'Se compila a SPIR-V',
    step3: 'Obtén tu formato',
    note3: 'SPIR-V y los formatos que salen de él',
    hub: 'Yotsuba Shader',
  },
};

const COLOR = { text: '#f5f5f7', dim: '#86868b', accent: '#2997ff', card: '#101012', line: '#38383a', chip: '#1c1c1e', light: '#f5f5f7', dark: '#1d1d1f' };
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const MONO = "Menlo, 'SF Mono', Monaco, monospace";
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* ---------------------------------------------------------------- assets */
const dataUri = (file, mime) => `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
const png = path.join(TMP, 'yotsuba.png');
execFileSync('dwebp', [path.join(IMG, 'yotsuba-shader.webp'), '-o', png], { stdio: 'ignore' });
const YOTSUBA = dataUri(png, 'image/png');
const svgLogo = (logo) => dataUri(path.join(ROOT, 'src', 'static', logo.replace(/^\//, '')), 'image/svg+xml');

const OUTPUTS = [
  { format: 'SPIR-V', logo: SPIRV_LOGO.src, ratio: SPIRV_LOGO.ratio, only: true },
  ...BACKENDS.filter((b) => b.format !== 'SPIR-V').map((b) => ({ format: b.format, logo: b.logo, ratio: b.ratio, iconOnly: b.iconOnly })),
];

const fit = (ratio, boxW, boxH) => {
  const w = Math.min(boxW, boxH * ratio);
  return { w, h: w / ratio };
};

/* ---------------------------------------------------------------- pieces */
const DEFS = `<defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 1 L9 5 L1 9" fill="none" stroke="${COLOR.accent}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>`;

const arrow = (d, soft = false) => `<path d="${d}" fill="none" stroke="${COLOR.accent}" stroke-opacity="${soft ? 0.55 : 1}" stroke-width="3" marker-end="url(#ah)"/>`;

function step(n, text, x, y, size = 32) {
  return `<circle cx="${x + 20}" cy="${y - 11}" r="20" fill="${COLOR.accent}"/>`
    + `<text x="${x + 20}" y="${y - 2}" text-anchor="middle" font-family="${SANS}" font-size="24" font-weight="700" fill="#fff">${n}</text>`
    + `<text x="${x + 54}" y="${y}" font-family="${SANS}" font-size="${size}" font-weight="600" fill="${COLOR.text}">${esc(text)}</text>`;
}

const CODE = [
  [['attr', '[ShaderStage(Stage.Fragment)]']],
  [['kw', 'public'], ['', ' '], ['ty', 'Vector4'], ['', ' Fragment('], ['ty', 'VertexOutput'], ['', ' input)']],
  [['', '{']],
  [['', '    '], ['kw', 'return'], ['', ' '], ['kw', 'new'], ['', ' '], ['ty', 'Vector4'], ['', '('], ['num', '1'], ['', ', '], ['num', '0.4f'], ['', ', '], ['num', '0.7f'], ['', ', '], ['num', '1'], ['', ');']],
  [['', '}']],
];
const TOKEN = { attr: '#ffa14f', kw: '#ff7ab2', ty: '#6bdfff', num: '#d9c97c', '': '#e5e5e7' };

function codeCard(x, y, w, size, lineH) {
  const bar = 46;
  const h = bar + CODE.length * lineH + 26;
  const lines = CODE.map((line, i) => {
    const spans = line.map(([k, t]) => `<tspan fill="${TOKEN[k]}">${esc(t)}</tspan>`).join('');
    return `<text x="${x + 26}" y="${y + bar + 14 + (i + 1) * lineH - lineH * 0.25}" font-family="${MONO}" font-size="${size}" xml:space="preserve">${spans}</text>`;
  }).join('');
  return {
    h,
    svg: `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="${COLOR.card}" stroke="${COLOR.line}" stroke-width="1.5"/>`
      + `<line x1="${x}" y1="${y + bar}" x2="${x + w}" y2="${y + bar}" stroke="${COLOR.line}" stroke-width="1.5"/>`
      + `<text x="${x + 26}" y="${y + 30}" font-family="${SANS}" font-size="20" fill="${COLOR.dim}">Triangle.cs</text>`
      + lines,
  };
}

/** A format chip: the name on the left and, where the owner publishes one, its logo on the right. SPIR-V is only its logo. */
function chip(o, x, cy, w, h, scale = 1) {
  const y = cy - h / 2;
  const logo = o.logo;
  const light = Boolean(logo);
  let out = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="${light ? COLOR.light : COLOR.chip}" ${light ? '' : `stroke="${COLOR.line}" stroke-width="1.5"`}/>`;
  if (o.only) {
    const l = fit(o.ratio, w - 40, h * 0.5);
    return out + `<image href="${svgLogo(logo)}" x="${x + (w - l.w) / 2}" y="${cy - l.h / 2}" width="${l.w}" height="${l.h}"/>`;
  }
  out += `<text x="${x + 26 * scale}" y="${cy + 10 * scale}" font-family="${SANS}" font-size="${33 * scale}" font-weight="600" fill="${light ? COLOR.dark : COLOR.text}">${esc(o.format)}</text>`;
  if (logo) {
    const l = o.iconOnly ? fit(o.ratio, 52 * scale, h * 0.62) : fit(o.ratio, 112 * scale, h * 0.5);
    out += `<image href="${svgLogo(logo)}" x="${x + w - 20 * scale - l.w}" y="${cy - l.h / 2}" width="${l.w}" height="${l.h}"/>`;
  }
  return out;
}

const spirvNode = (x, cy, w, h) => {
  const l = fit(SPIRV_LOGO.ratio, w - 36, h * 0.5);
  return `<rect x="${x}" y="${cy - h / 2}" width="${w}" height="${h}" rx="16" fill="${COLOR.light}"/>`
    + `<image href="${svgLogo(SPIRV_LOGO.src)}" x="${x + (w - l.w) / 2}" y="${cy - l.h / 2}" width="${l.w}" height="${l.h}"/>`;
};

/* ---------------------------------------------------------------- wide */
function wide(t) {
  const W = 1720;
  const rows = OUTPUTS.length;
  const ROW0 = 184;
  const ROW_H = 90;
  const H = ROW0 + (rows - 1) * ROW_H + 74;
  const CY = ROW0 + ((rows - 1) * ROW_H) / 2;
  const cardH = codeCard(0, 0, 680, 23, 40).h;
  const c = codeCard(0, CY - cardH / 2, 680, 23, 40);

  const HUB = { x: 748, size: 130 };
  const SP = { x: 970, w: 190, h: 80 };
  const OUT = { x: 1296, w: 380, h: 68 };
  const parts = [DEFS];

  parts.push(step(1, t.step1, 0, 56));
  parts.push(step(2, t.step2, HUB.x - 12, 56));
  parts.push(step(3, t.step3, OUT.x, 56));
  parts.push(`<text x="${OUT.x}" y="100" font-family="${SANS}" font-size="21" fill="${COLOR.dim}">${esc(t.note3)}</text>`);

  parts.push(c.svg);
  parts.push(arrow(`M692 ${CY} H ${HUB.x - 12}`));
  parts.push(`<image href="${YOTSUBA}" x="${HUB.x}" y="${CY - HUB.size / 2 - 14}" width="${HUB.size}" height="${HUB.size}"/>`);
  parts.push(`<text x="${HUB.x + HUB.size / 2}" y="${CY + HUB.size / 2 + 26}" text-anchor="middle" font-family="${SANS}" font-size="25" font-weight="600" fill="${COLOR.text}">${esc(t.hub)}</text>`);
  parts.push(arrow(`M${HUB.x + HUB.size + 10} ${CY - 14} H ${SP.x - 12}`));
  parts.push(spirvNode(SP.x, CY - 14, SP.w, SP.h));

  const sr = SP.x + SP.w + 10;
  OUTPUTS.forEach((o, i) => {
    const cy = ROW0 + i * ROW_H;
    parts.push(arrow(`M${sr} ${CY - 14} C ${sr + 70} ${CY - 14}, ${OUT.x - 80} ${cy}, ${OUT.x - 10} ${cy}`, true));
    parts.push(chip(o, OUT.x, cy, OUT.w, OUT.h));
  });

  return { W, H, svg: parts.join('\n') };
}

/* ---------------------------------------------------------------- tall (phones) */
function tall(t) {
  const W = 750;
  const parts = [DEFS];
  let y = 46;
  parts.push(step(1, t.step1, 30, y));
  y += 26;
  const card = codeCard(30, y, 690, 23, 38);
  parts.push(card.svg);
  y += card.h + 14;
  parts.push(arrow(`M375 ${y} V ${y + 50}`));
  y += 50 + 56;

  parts.push(step(2, t.step2, 30, y));
  y += 40;
  const rowCy = y + 46;
  parts.push(`<image href="${YOTSUBA}" x="30" y="${rowCy - 46}" width="92" height="92"/>`);
  parts.push(`<text x="134" y="${rowCy + 8}" font-family="${SANS}" font-size="26" font-weight="600" fill="${COLOR.text}">${esc(t.hub)}</text>`);
  parts.push(arrow(`M338 ${rowCy} H 400`));
  parts.push(spirvNode(412, rowCy, 308, 84));
  y = rowCy + 46 + 14;
  parts.push(arrow(`M566 ${y} V ${y + 50}`));
  y += 50 + 56;

  parts.push(step(3, t.step3, 30, y));
  parts.push(`<text x="30" y="${y + 38}" font-family="${SANS}" font-size="21" fill="${COLOR.dim}">${esc(t.note3)}</text>`);
  y += 70;
  OUTPUTS.forEach((o, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    parts.push(chip(o, 30 + col * 360, y + row * 92 + 36, 330, 72, 0.95));
  });
  const H = y + Math.ceil(OUTPUTS.length / 2) * 92 + 14;
  return { W, H, svg: parts.join('\n') };
}

/* ---------------------------------------------------------------- output */
function write(lang, kind, { W, H, svg }) {
  const file = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">\n${svg}\n</svg>`;
  const svgPath = path.join(TMP, `${lang}-${kind}.svg`);
  const pngPath = path.join(TMP, `${lang}-${kind}.png`);
  const outDir = path.join(IMG, 'l10n', lang);
  fs.mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, `flow-${kind}.webp`);
  fs.writeFileSync(svgPath, file);
  execFileSync('rsvg-convert', ['-w', String(W), svgPath, '-o', pngPath]);
  if (process.env.FLOW_REVIEW) execFileSync('rsvg-convert', ['-b', '#000000', '-w', String(W), svgPath, '-o', path.join(process.env.FLOW_REVIEW, `${lang}-${kind}.png`)]);
  execFileSync('cwebp', ['-quiet', '-lossless', '-z', '9', pngPath, '-o', out]);
  console.log(`${path.relative(ROOT, out)}  ${W}x${H}  ${(fs.statSync(out).size / 1024).toFixed(0)} KB`);
  return { W, H };
}

const sizes = {};
for (const [lang, t] of Object.entries(TEXT)) {
  sizes.wide = write(lang, 'wide', wide(t));
  sizes.tall = write(lang, 'tall', tall(t));
}
fs.writeFileSync(path.join(ROOT, 'src', 'flow-sizes.json'), JSON.stringify(sizes) + '\n');
fs.rmSync(TMP, { recursive: true, force: true });

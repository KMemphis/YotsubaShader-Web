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
    step3: 'Transpile with Yotsuba ShaderCross',
    step4: 'Get your format',
    note4: 'SPIR-V, plus the formats transpiled from it',
    hub1: 'Yotsuba Shader',
    hub2: 'Yotsuba ShaderCross',
  },
  es: {
    step1: 'Escríbelo en C#',
    step2: 'Compila a SPIR-V',
    step3: 'Transpila con Yotsuba ShaderCross',
    step4: 'Obtén tu formato',
    note4: 'SPIR-V y los formatos que salen de él',
    hub1: 'Yotsuba Shader',
    hub2: 'Yotsuba ShaderCross',
  },
};

const COLOR = {
  text: '#f5f5f7',
  dim: '#86868b',
  accent: '#FA679F',
  emerald: '#00B89F',
  card: '#121212',
  chip: '#18181b',
  line: '#38383a',
};
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const MONO = "Menlo, 'SF Mono', Monaco, monospace";
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* ---------------------------------------------------------------- assets */
const dataUri = (file, mime) => `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
const png = path.join(TMP, 'yotsuba.png');
execFileSync('dwebp', [path.join(IMG, 'yotsuba-shader.webp'), '-o', png], { stdio: 'ignore' });
const YOTSUBA = dataUri(png, 'image/png');

const svgLogo = (logo, dark = true) => {
  const filePath = path.join(ROOT, 'src', 'static', logo.replace(/^\//, ''));
  let svgContent = fs.readFileSync(filePath, 'utf8');
  if (dark) {
    if (logo.includes('spirv')) {
      svgContent = svgContent.replace(/#004BA9/gi, '#FFFFFF');
    } else if (logo.includes('opengl')) {
      svgContent = svgContent.replace(/#5586A4/gi, '#FFFFFF');
    } else if (logo.includes('webgl')) {
      svgContent = svgContent.replace(/#990000/gi, '#FFFFFF');
    } else if (logo.includes('webgpu')) {
      svgContent = svgContent
        .replace(/#005a9c/gi, '#2997ff')
        .replace(/#0066b0/gi, '#4ba7ff')
        .replace(/#0076cc/gi, '#6eb7ff')
        .replace(/#0086e8/gi, '#91c7ff')
        .replace(/#0093ff/gi, '#b8dbff');
    }
  }
  return `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
};

const OUTPUTS = [
  { format: 'SPIR-V', logo: SPIRV_LOGO.src, ratio: SPIRV_LOGO.ratio },
  ...BACKENDS.filter((b) => b.format !== 'SPIR-V').map((b) => ({
    format: b.format,
    logo: b.logo,
    ratio: b.ratio,
    iconOnly: b.iconOnly,
  })),
];

const fit = (ratio, boxW, boxH) => {
  const w = Math.min(boxW, boxH * ratio);
  return { w, h: w / ratio };
};

/* ---------------------------------------------------------------- pieces */
const DEFS = `<defs>
  <filter id="surface-shadow" x="-10%" y="-18%" width="120%" height="144%">
    <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#000" flood-opacity=".28"/>
  </filter>
  <linearGradient id="output-chip-bg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#242426"/>
    <stop offset="1" stop-color="#1b1b1d"/>
  </linearGradient>
  <filter id="output-chip-shadow" x="-12%" y="-24%" width="124%" height="164%">
    <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#000" flood-opacity=".3"/>
  </filter>
  <marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 1 L9 5 L1 9" fill="none" stroke="${COLOR.accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></marker>
  <marker id="ahe" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 1 L9 5 L1 9" fill="none" stroke="${COLOR.emerald}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></marker>
  <filter id="cross-filter">
    <feColorMatrix type="hueRotate" values="180"/>
    <feColorMatrix type="saturate" values="1.2"/>
  </filter>
</defs>`;

const arrow = (d, opacity = 1) => `<path d="${d}" fill="none" stroke="${COLOR.accent}" stroke-opacity="${opacity}" stroke-width="3" marker-end="url(#ah)"/>`;
const arrowEmerald = (d, opacity = 1) => `<path d="${d}" fill="none" stroke="${COLOR.emerald}" stroke-opacity="${opacity}" stroke-width="3" marker-end="url(#ahe)"/>`;

function step(n, text, x, y, size = 26) {
  return `<circle cx="${x + 18}" cy="${y - 10}" r="18" fill="${COLOR.accent}"/>`
    + `<text x="${x + 18}" y="${y - 2}" text-anchor="middle" font-family="${SANS}" font-size="21" font-weight="700" fill="#fff">${n}</text>`
    + `<text x="${x + 46}" y="${y}" font-family="${SANS}" font-size="${size}" font-weight="600" fill="${COLOR.text}">${esc(text)}</text>`;
}

const CODE = [
  [['', '['], ['attrName', 'ShaderStage'], ['', '('], ['ty', 'Stage'], ['', '.'], ['enum', 'Vertex'], ['', ')]']],
  [['kw', 'public'], ['', ' '], ['ty', 'VertexOutput'], ['', ' Vertex('], ['ty', 'VertexInput'], ['', ' input)']],
  [['', '{']],
  [['', '    '], ['kw', 'return'], ['', ' '], ['kw', 'new'], ['', ' '], ['ty', 'VertexOutput']],
  [['', '    {']],
  [['', '        Position = '], ['kw', 'new'], ['', ' '], ['ty', 'Vector4'], ['', '(input.Position, '], ['num', '0f'], ['', ', '], ['num', '1f'], ['', '),']],
  [['', '        Color = input.Color']],
  [['', '    };']],
  [['', '}']],
  [['', '']],
  [['', '['], ['attrName', 'ShaderStage'], ['', '('], ['ty', 'Stage'], ['', '.'], ['enum', 'Fragment'], ['', ')]']],
  [['kw', 'public'], ['', ' '], ['ty', 'Vector4'], ['', ' Fragment('], ['ty', 'VertexOutput'], ['', ' input)']],
  [['', '{']],
  [['', '    '], ['kw', 'return'], ['', ' input.Color;']],
  [['', '}']],
  [['', '']],
  [['', '['], ['attrName', 'ShaderStage'], ['', '('], ['ty', 'Stage'], ['', '.'], ['enum', 'Compute'], ['', ')]']],
  [['kw', 'public'], ['', ' '], ['kw', 'void'], ['', ' Compute('], ['ty', 'uint3'], ['', ' id)']],
  [['', '{']],
  [['', '    uint index = id.X;']],
  [['', '    Output[index] = Input[index] * '], ['num', '2.0f'], ['', ';']],
  [['', '}']],
];
// Keep the site's existing syntax palette, with realistic separation inside attributes.
const TOKEN = { attrName: '#DCDCAA', enum: '#4FC1FF', kw: '#ff7ab2', ty: '#6bdfff', num: '#d9c97c', comment: '#6A9955', '': '#e5e5e7' };

function codeCard(x, y, w, size, lineH) {
  const bar = 46;
  const longestLine = Math.max(...CODE.map((line) => line.map(([, text]) => text).join('').length));
  // Keep the longest source line inside the editor at every rendered size.
  const codeSize = Math.min(size, (w - 52) / (longestLine * 0.61));
  const h = bar + CODE.length * lineH + 26;
  const lines = CODE.map((line, i) => {
    const spans = line.map(([k, t]) => `<tspan fill="${TOKEN[k]}">${esc(t)}</tspan>`).join('');
    return `<text x="${x + 26}" y="${y + bar + 14 + (i + 1) * lineH - lineH * 0.25}" font-family="${MONO}" font-size="${codeSize.toFixed(2)}" xml:space="preserve">${spans}</text>`;
  }).join('');
  return {
    h,
    svg: `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="#1c1c1e" filter="url(#surface-shadow)"/>`
      + `<rect x="${x + 0.75}" y="${y + 0.75}" width="${w - 1.5}" height="${h - 1.5}" rx="21.25" fill="none" stroke="#fff" stroke-opacity=".1" stroke-width="1.5"/>`
      + `<line x1="${x}" y1="${y + bar}" x2="${x + w}" y2="${y + bar}" stroke="#fff" stroke-opacity=".1" stroke-width="1.5"/>`
      + `<text x="${x + 26}" y="${y + 30}" font-family="${SANS}" font-size="20" fill="${COLOR.dim}">Triangle.cs</text>`
      + lines,
  };
}

/** A format chip in dark mode: format name on the left, logo on the right. */
function chip(o, x, cy, w, h, scale = 1) {
  const y = cy - h / 2;
  const logo = o.logo;
  const radius = 20;
  let out = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="url(#output-chip-bg)" filter="url(#output-chip-shadow)"/>`;
  out += `<rect x="${x + 0.75}" y="${y + 0.75}" width="${w - 1.5}" height="${h - 1.5}" rx="${radius - 0.75}" fill="none" stroke="#fff" stroke-opacity=".11" stroke-width="1.5"/>`;
  out += `<text x="${x + 26 * scale}" y="${cy + 9 * scale}" font-family="${SANS}" font-size="${29 * scale}" font-weight="500" letter-spacing="-.25" fill="${COLOR.text}">${esc(o.format)}</text>`;
  if (logo) {
    const l = o.iconOnly ? fit(o.ratio, 50 * scale, h * 0.6) : fit(o.ratio, 105 * scale, h * 0.48);
    out += `<image href="${svgLogo(logo, true)}" x="${x + w - 24 * scale - l.w}" y="${cy - l.h / 2}" width="${l.w}" height="${l.h}" opacity=".92"/>`;
  }
  return out;
}

const spirvNode = (x, cy, w, h) => {
  const l = fit(SPIRV_LOGO.ratio, w - 36, h * 0.52);
  const y = cy - h / 2;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="20" fill="#1c1c1e" filter="url(#surface-shadow)"/>`
    + `<rect x="${x + 0.75}" y="${y + 0.75}" width="${w - 1.5}" height="${h - 1.5}" rx="19.25" fill="none" stroke="#fff" stroke-opacity=".1" stroke-width="1.5"/>`
    + `<image href="${svgLogo(SPIRV_LOGO.src, true)}" x="${x + (w - l.w) / 2}" y="${cy - l.h / 2}" width="${l.w}" height="${l.h}"/>`;
};

/* ---------------------------------------------------------------- wide */
function wide(t) {
  const W = 2160;
  const rows = OUTPUTS.length; // 6 formats
  const ROW0 = 176;
  const ROW_H = 88;
  const H = ROW0 + (rows - 1) * ROW_H + 92;
  const CY_TRANSPILE = ROW0 + 3 * ROW_H; // row 3 is WGSL (middle of rows 1..5)
  const CY_ALL = ROW0 + ((rows - 1) * ROW_H) / 2;

  const cardH = codeCard(0, 0, 620, 23, 23).h;
  const c = codeCard(50, CY_ALL - cardH / 2, 620, 23, 23);

  const HUB = { x: 740, size: 116 };
  const SP = { x: 935, w: 180, h: 78 };
  const CROSS = { x: 1300, size: 116 };
  const OUT = { x: 1740, w: 360, h: 68 };
  const parts = [DEFS];

  // Step headers
  parts.push(step(1, t.step1, 50, 56, 26));
  parts.push(step(2, t.step2, HUB.x - 12, 56, 26));
  parts.push(step(3, t.step3, CROSS.x - 48, 56, 24));
  parts.push(step(4, t.step4, OUT.x, 56, 26));
  parts.push(`<text x="${OUT.x}" y="100" font-family="${SANS}" font-size="20" fill="${COLOR.dim}">${esc(t.note4)}</text>`);

  // Step 1: Code card
  parts.push(c.svg);

  // Arrow: Code card -> Yotsuba Shader
  parts.push(arrow(`M670 ${CY_ALL} H ${HUB.x - 12}`));

  // Step 2: Yotsuba Shader hub
  parts.push(`<image href="${YOTSUBA}" x="${HUB.x}" y="${CY_ALL - HUB.size / 2 - 16}" width="${HUB.size}" height="${HUB.size}"/>`);
  parts.push(`<text x="${HUB.x + HUB.size / 2}" y="${CY_ALL + HUB.size / 2 + 20}" text-anchor="middle" font-family="${SANS}" font-size="22" font-weight="600" fill="${COLOR.text}">${esc(t.hub1)}</text>`);

  // Arrow: Yotsuba Shader -> SPIR-V bytecode node
  parts.push(arrow(`M${HUB.x + HUB.size + 12} ${CY_ALL - 14} H ${SP.x - 12}`));

  // Step 2: SPIR-V bytecode node
  parts.push(spirvNode(SP.x, CY_ALL - 14, SP.w, SP.h));

  const spRight = SP.x + SP.w + 10;
  const spCenterY = CY_ALL - 14;

  // Arrow 1: Direct from SPIR-V bytecode to SPIR-V final format chip (ROW 0)
  const spirvChipY = ROW0;
  parts.push(arrow(`M${spRight} ${spCenterY - 14} C ${spRight + 120} ${spCenterY - 14}, ${OUT.x - 140} ${spirvChipY}, ${OUT.x - 12} ${spirvChipY}`));

  // Arrow 2: From SPIR-V bytecode to YotsubaShaderCross
  const crossCenterY = CY_TRANSPILE - 14;
  parts.push(arrow(`M${spRight} ${spCenterY + 14} C ${spRight + 80} ${spCenterY + 14}, ${CROSS.x - 70} ${crossCenterY}, ${CROSS.x - 12} ${crossCenterY}`));

  // Step 3: YotsubaShaderCross node
  parts.push(`<image href="${YOTSUBA}" filter="url(#cross-filter)" x="${CROSS.x}" y="${crossCenterY - CROSS.size / 2}" width="${CROSS.size}" height="${CROSS.size}"/>`);
  parts.push(`<text x="${CROSS.x + CROSS.size / 2}" y="${crossCenterY + CROSS.size / 2 + 24}" text-anchor="middle" font-family="${SANS}" font-size="22" font-weight="600" fill="${COLOR.text}">${esc(t.hub2)}</text>`);

  // Step 4: Arrows from YotsubaShaderCross branching into transpiled formats (rows 1..5)
  const crossRight = CROSS.x + CROSS.size + 12;
  for (let i = 1; i < OUTPUTS.length; i++) {
    const cy = ROW0 + i * ROW_H;
    parts.push(arrowEmerald(`M${crossRight} ${crossCenterY} C ${crossRight + 80} ${crossCenterY}, ${OUT.x - 90} ${cy}, ${OUT.x - 12} ${cy}`, 0.9));
  }

  // Step 4: All output format chips
  OUTPUTS.forEach((o, i) => {
    const cy = ROW0 + i * ROW_H;
    parts.push(chip(o, OUT.x, cy, OUT.w, OUT.h));
  });

  return { W, H, svg: parts.join('\n') };
}

/* ---------------------------------------------------------------- tall (phones) */
function tall(t) {
  const W = 750;
  const parts = [DEFS];
  let y = 44;

  // Step 1: Write it in C#
  parts.push(step(1, t.step1, 30, y, 26));
  y += 28;
  const card = codeCard(30, y, 690, 22, 26);
  parts.push(card.svg);
  y += card.h + 16;
  parts.push(arrow(`M375 ${y} V ${y + 46}`));
  y += 46 + 48;

  // Step 2: Compile to SPIR-V
  parts.push(step(2, t.step2, 30, y, 26));
  y += 38;
  const rowCy2 = y + 44;
  parts.push(`<image href="${YOTSUBA}" x="30" y="${rowCy2 - 44}" width="88" height="88"/>`);
  parts.push(`<text x="130" y="${rowCy2 + 8}" font-family="${SANS}" font-size="24" font-weight="600" fill="${COLOR.text}">${esc(t.hub1)}</text>`);
  parts.push(arrow(`M305 ${rowCy2} H 365`));
  parts.push(spirvNode(375, rowCy2, 345, 78));
  const y2Bottom = rowCy2 + 39 + 14;

  // Arrow down from Step 2 to Step 3:
  // 1) From SPIR-V left to YotsubaShaderCross
  parts.push(arrow(`M450 ${y2Bottom} C 450 ${y2Bottom + 30}, 210 ${y2Bottom + 20}, 210 ${y2Bottom + 48}`));
  // 2) Direct arrow down right side from SPIR-V to format chip SPIR-V in Step 4
  const yChipsTarget = y2Bottom + 48 + 44 + 38 + 44 + 39 + 14 + 48 + 44 + 64;
  parts.push(arrow(`M555 ${y2Bottom} V ${yChipsTarget - 12}`));

  y = y2Bottom + 48 + 44;

  // Step 3: Transpile with YotsubaShaderCross
  parts.push(step(3, t.step3, 30, y, 22));
  y += 38;
  const rowCy3 = y + 44;
  parts.push(`<image href="${YOTSUBA}" filter="url(#cross-filter)" x="30" y="${rowCy3 - 44}" width="88" height="88"/>`);
  parts.push(`<text x="130" y="${rowCy3 + 8}" font-family="${SANS}" font-size="23" font-weight="600" fill="${COLOR.text}">${esc(t.hub2)}</text>`);
  const y3Bottom = rowCy3 + 44 + 14;
  // Arrow from YotsubaShaderCross down to transpiled formats
  parts.push(arrowEmerald(`M210 ${y3Bottom} V ${yChipsTarget - 12}`));

  y = y3Bottom + 48 + 44;

  // Step 4: Get your format
  parts.push(step(4, t.step4, 30, y, 26));
  parts.push(`<text x="30" y="${y + 36}" font-family="${SANS}" font-size="20" fill="${COLOR.dim}">${esc(t.note4)}</text>`);
  y += 64;

  // Chips in 2 columns:
  // Col 0: HLSL, MSL, GLSL (transpiled)
  // Col 1: SPIR-V (direct binary at top), WGSL, GLSL ES
  const grid = [
    { col: 1, row: 0, o: OUTPUTS[0] }, // SPIR-V
    { col: 0, row: 0, o: OUTPUTS[1] }, // HLSL
    { col: 0, row: 1, o: OUTPUTS[2] }, // MSL
    { col: 1, row: 1, o: OUTPUTS[3] }, // WGSL
    { col: 0, row: 2, o: OUTPUTS[4] }, // GLSL
    { col: 1, row: 2, o: OUTPUTS[5] }, // GLSL ES
  ];

  grid.forEach(({ col, row, o }) => {
    parts.push(chip(o, 30 + col * 360, y + row * 92 + 36, 330, 72, 0.95));
  });

  const H = y + 3 * 92 + 20;
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
  // Rasterize at 2× while keeping the logical dimensions in flow-sizes.json.
  // This prevents text and thin arrows from becoming soft on high-density displays.
  execFileSync('rsvg-convert', ['-w', String(W * 2), svgPath, '-o', pngPath]);
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

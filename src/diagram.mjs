// "Write once, compile for any backend" diagram: a C# shader -> Yotsuba Shader -> shader format -> graphics API.
// Inline SVG on wide screens; a code block plus a plain list on phones.

import { BACKENDS, SPIRV_LOGO } from './backends.mjs';
import { icon, code } from './components.mjs';
import { highlight, esc } from './highlight.mjs';
import { STYLE_TRIANGLE } from './snippets.mjs';

/** A complete graphics + compute shader: this is what the diagram compiles. */
export const SHADER_SOURCE = STYLE_TRIANGLE.hlsl;

const W = 1120;
const ROW0 = 62;
const ROW_H = 100;
const ROWS = BACKENDS.length;
const H = ROW0 + (ROWS - 1) * ROW_H + 64;
const CY = ROW0 + ((ROWS - 1) * ROW_H) / 2;

const X = { code: 0, codeW: 410, hub: 500, fmt: 680, fmtW: 112, api: 890, apiW: 200 };
const hubR = X.hub + 56;
const fmtC = X.fmt + X.fmtW / 2;
const apiC = X.api + X.apiW / 2;

function fit(ratio, boxW, boxH) {
  const w = Math.min(boxW, boxH * ratio);
  return { w, h: w / ratio };
}

export function flowDiagram() {
  const parts = [];

  parts.push(`<text class="fl-head" x="${X.code + X.codeW / 2}" y="22" text-anchor="middle">Your C# shader</text>`);
  parts.push(`<text class="fl-head" x="${fmtC}" y="22" text-anchor="middle">Shader format</text>`);
  parts.push(`<text class="fl-head" x="${apiC}" y="22" text-anchor="middle">Graphics API</text>`);

  // the shader source, as real highlighted code
  const boxH = H - 78;
  parts.push(`<foreignObject x="${X.code}" y="40" width="${X.codeW}" height="${boxH}"><div class="fl-code"><div class="fl-code-bar">Triangle.cs</div><pre><code>${highlight('csharp', SHADER_SOURCE)}</code></pre></div></foreignObject>`);
  parts.push(`<path class="fl-curve" d="M${X.code + X.codeW + 8} ${CY} H ${X.hub - 14}" marker-end="url(#fl-head)"/>`);

  // hub
  parts.push(`<image href="/img/yotsuba-shader.webp" x="${X.hub}" y="${CY - 48}" width="96" height="96"/>`);
  parts.push(`<text class="fl-hub" x="${X.hub + 48}" y="${CY + 80}" text-anchor="middle">Yotsuba Shader</text>`);
  parts.push(`<text class="fl-sub" x="${X.hub + 48}" y="${CY + 102}" text-anchor="middle">C# → IR → formats</text>`);

  BACKENDS.forEach((b, i) => {
    const y = ROW0 + i * ROW_H;

    parts.push(`<path class="fl-curve" d="M${hubR} ${CY} C ${hubR + 60} ${CY}, ${X.fmt - 70} ${y}, ${X.fmt - 8} ${y}" marker-end="url(#fl-head)"/>`);

    if (b.format === 'SPIR-V') {
      const l = fit(SPIRV_LOGO.ratio, 92, 28);
      parts.push(`<rect class="fl-box fl-box--light" x="${X.fmt}" y="${y - 24}" width="${X.fmtW}" height="48" rx="12"/>`);
      parts.push(`<image href="${SPIRV_LOGO.src}" x="${fmtC - l.w / 2}" y="${y - l.h / 2}" width="${l.w}" height="${l.h}"/>`);
    } else {
      parts.push(`<rect class="fl-box" x="${X.fmt}" y="${y - 24}" width="${X.fmtW}" height="48" rx="12"/>`);
      parts.push(`<text class="fl-fmt" x="${fmtC}" y="${y + 6}" text-anchor="middle">${esc(b.format)}</text>`);
    }

    parts.push(`<path class="fl-arrow" d="M${X.fmt + X.fmtW + 10} ${y} H ${X.api - 12}" marker-end="url(#fl-head)"/>`);

    // API cell: owner's logo on a light chip; the W3C mark is icon-only so the name sits beside it;
    // Apple and Microsoft do not license logos to third parties, so those are plain text.
    if (b.logo && b.iconOnly) {
      const l = fit(b.ratio, 40, 34);
      parts.push(`<rect class="fl-box fl-box--light" x="${X.api}" y="${y - 28}" width="${X.apiW}" height="56" rx="12"/>`);
      parts.push(`<image href="${b.logo}" x="${X.api + 26}" y="${y - l.h / 2}" width="${l.w}" height="${l.h}"/>`);
      parts.push(`<text class="fl-api fl-api--dark" x="${X.api + 26 + l.w + 12}" y="${y + 7}">${esc(b.name)}</text>`);
    } else if (b.logo) {
      const l = fit(b.ratio, 150, 34);
      parts.push(`<rect class="fl-box fl-box--light" x="${X.api}" y="${y - 28}" width="${X.apiW}" height="56" rx="12"/>`);
      parts.push(`<image href="${b.logo}" x="${apiC - l.w / 2}" y="${y - l.h / 2}" width="${l.w}" height="${l.h}"/>`);
    } else {
      parts.push(`<rect class="fl-box" x="${X.api}" y="${y - 28}" width="${X.apiW}" height="56" rx="12"/>`);
      parts.push(`<text class="fl-api" x="${apiC}" y="${y + 7}" text-anchor="middle">${esc(b.name)}</text>`);
    }
  });

  const svg = `<svg class="flow-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="A C# shader with vertex, fragment and compute stages is compiled by Yotsuba Shader to SPIR-V, DXIL, DXBC, MSL, WGSL, GLSL and GLSL ES, for Vulkan, Direct3D 12 and 11, Metal, WebGPU, OpenGL and WebGL.">
<defs><marker id="fl-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M1 1 L9 5 L1 9" fill="none" stroke="#2997ff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>
${parts.join('\n')}
</svg>`;

  const list = `${code('csharp', SHADER_SOURCE, 'Triangle.cs').replace('class="code"', 'class="code flow-code-m"')}<ul class="flow-list">${BACKENDS.map(
    (b) => `<li><span class="fl-chip">${esc(b.format)}</span>${icon('arrow-right')}<span class="fl-target">${
      b.logo ? `<span class="api-logo"><img src="${b.logo}" alt="${esc(b.name)}" loading="lazy"></span>` : ''
    }<strong>${esc(b.name)}</strong></span></li>`,
  ).join('')}</ul>`;

  return `<div class="flow">${svg}${list}</div>`;
}

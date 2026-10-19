// "Write once, compile for any backend" figure: a C# shader -> Yotsuba Shader -> SPIR-V -> the shader formats.
// It is an image, drawn by tools/flow-images.mjs, in two shapes: wide for desktop and tall for phones.
// The English paths below are rewritten to the page language by the localizer (src/i18n/index.mjs).

import fs from 'node:fs';

const sizes = JSON.parse(fs.readFileSync(new URL('./flow-sizes.json', import.meta.url), 'utf8'));
const DIR = '/img/l10n/en';

export function flowDiagram() {
  return `<figure class="flow" role="img" aria-label="A C# shader is compiled by Yotsuba Shader to SPIR-V. SPIR-V is one of the outputs, and Yotsuba ShaderCross translates it to HLSL, MSL, WGSL, GLSL and GLSL ES.">
  <picture>
    <source media="(max-width: 760px)" srcset="${DIR}/flow-tall.webp" width="${sizes.tall.W}" height="${sizes.tall.H}">
    <img src="${DIR}/flow-wide.webp" width="${sizes.wide.W}" height="${sizes.wide.H}" alt="" loading="lazy" decoding="async">
  </picture>
</figure>`;
}

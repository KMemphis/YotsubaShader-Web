#!/usr/bin/env node
// Writes every C# example of the tutorial in the five authoring styles of Yotsuba Shader
// (GLSL, HLSL, MSL, WGSL and SPIR-V) from the GLSL version, so the page can switch between them.
//
//   node lib/to-styles.mjs            report only
//   node lib/to-styles.mjs --write    rewrite the Markdown files
//
// What changes between styles is the vocabulary of the interface and the resources (attributes and using lines).
// The math, the vector types and the rest of the C# stay the same in every style.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const WRITE = process.argv.includes('--write');

export const STYLE_ORDER = ['glsl', 'hlsl', 'msl', 'wgsl', 'spirv'];
const NS = { glsl: 'Glsl', hlsl: 'Hlsl', msl: 'Msl', wgsl: 'Wgsl', spirv: 'Spirv' };

/** concept -> attribute text of each style */
const slot = {
  glsl: (n) => `location(${n})`,
  hlsl: (n) => `TEXCOORD(${n})`,
  msl: (n) => `attribute(${n})`,
  wgsl: (n) => `location(${n})`,
  spirv: (n) => `Location(${n})`,
};
const colorOut = {
  glsl: (n) => `location(${n})`,
  hlsl: (n) => (+n === 0 ? 'SV_Target' : `SV_Target(${n})`),
  msl: (n) => `color(${n})`,
  wgsl: (n) => `location(${n})`,
  spirv: (n) => `Location(${n})`,
};
const position = { glsl: 'gl_Position', hlsl: 'SV_Position', msl: 'position', wgsl: 'builtin_position', spirv: 'BuiltIn_Position' };
const uniform = {
  glsl: (s, b) => `uniform, layout(${s}, ${b})`,
  hlsl: (s, b) => (+s === 0 ? `cbuffer, register("b${b}")` : `cbuffer, register(RegisterPrefix.b, ${b}, ${s})`),
  msl: (_s, b) => `constant, buffer(${b})`,
  wgsl: (s, b) => `uniform, @group(${s}), @binding(${b})`,
  spirv: (s, b) => `Uniform, DescriptorSet(${s}), Binding(${b})`,
};

export function toStyle(code, style) {
  let out = code
    .replace(/\[return:\s*location\((\d+)\)\]/g, (_, n) => `[return: ${colorOut[style](n)}]`)
    .replace(/\[gl_Position\]/g, () => `[${position[style]}]`)
    .replace(/\[uniform,\s*layout\((\d+),\s*(\d+)\)\]/g, (_, s, b) => `[${uniform[style](s, b)}]`)
    .replace(/\[location\((\d+)\)\]/g, (_, n) => `[${slot[style](n)}]`);
  if (style !== 'glsl') {
    out = out
      .replace(/using YotsubaShader\.GlslSyntax\.Resources;/g, `using YotsubaShader.${NS[style]}Syntax.Resources;`)
      .replace(/using YotsubaShader\.GlslSyntax;/g, `using YotsubaShader.${NS[style]}Syntax;`);
  }
  return out;
}

const TRIGGER = /\[location\(\d+\)\]|\[gl_Position\]|\[uniform,\s*layout\(|using YotsubaShader\.GlslSyntax(\.Resources)?;/;
const SKIP = /sampler2D|sampler3D|samplerCube|\btexture\(/; // reading textures is not supported by the compiler yet

/** split the lines of a file into text lines and fenced blocks */
function parse(lines) {
  const items = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^```(\S*)\s*(.*)$/);
    if (m && m[1]) {
      let j = i + 1;
      while (j < lines.length && !/^```\s*$/.test(lines[j])) j++;
      items.push({ t: 'code', lang: m[1], attrs: m[2], code: lines.slice(i + 1, j), at: i, end: j });
      i = j;
    } else items.push({ t: 'line', text: lines[i], at: i });
  }
  return items;
}

const attrOf = (raw, key) => (raw.match(new RegExp(`\\b${key}=(?:"[^"]*"|\\S+)`)) || [])[0];
const withoutStyle = (raw) => raw.replace(/\bstyle=\S+/g, '').replace(/\s+/g, ' ').trim();

function convertFile(file) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  const items = parse(lines);
  const out = [];
  const report = { converted: 0, skipped: [], pairs: 0 };
  for (let k = 0; k < items.length; k++) {
    const it = items[k];
    if (it.t === 'line') { out.push(it.text); continue; }
    const isStyled = /\bstyle=/.test(it.attrs);
    // an existing group: consecutive styled fences (only blank lines between them)
    if (isStyled) {
      const group = [it];
      let n = k;
      while (true) {
        let p = n + 1;
        while (items[p]?.t === 'line' && items[p].text.trim() === '') p++;
        if (items[p]?.t === 'code' && /\bstyle=/.test(items[p].attrs)) { group.push(items[p]); n = p; } else break;
      }
      const base = group.find((g) => /\bstyle=glsl\b/.test(g.attrs)) || group[0];
      const raw = withoutStyle(base.attrs);
      emit(out, base.lang, raw, base.code.join('\n'));
      report.pairs++;
      k = n;
      continue;
    }
    const code = it.code.join('\n');
    if (it.lang === 'csharp' && !/\btab=/.test(it.attrs) && TRIGGER.test(code)) {
      if (SKIP.test(code)) { report.skipped.push(it.at + 1); out.push('```' + it.lang + (it.attrs ? ' ' + it.attrs : ''), ...it.code, '```'); continue; }
      emit(out, it.lang, it.attrs.trim(), code);
      report.converted++;
    } else out.push('```' + it.lang + (it.attrs ? ' ' + it.attrs : ''), ...it.code, '```');
  }
  return { text: out.join('\n'), report };
}

function emit(out, lang, rawAttrs, code) {
  STYLE_ORDER.forEach((style, n) => {
    if (n) out.push('');
    out.push('```' + lang + ' style=' + style + (rawAttrs ? ' ' + rawAttrs : ''));
    out.push(...toStyle(code, style).split('\n'));
    out.push('```');
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  let total = 0;
  for (const lang of ['en', 'es']) {
    const dir = path.join(ROOT, 'content', lang, 'get-started');
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.md'))) {
      const file = path.join(dir, f);
      const { text, report } = convertFile(file);
      total += report.converted;
      if (report.converted || report.pairs || report.skipped.length)
        console.log(`${lang}/${f}: ${report.converted} converted, ${report.pairs} groups rebuilt${report.skipped.length ? `, left as GLSL (textures) at lines ${report.skipped.join(', ')}` : ''}`);
      if (WRITE) fs.writeFileSync(file, text);
    }
  }
  console.log(`${total} blocks ${WRITE ? 'converted' : 'would be converted'}`);
}

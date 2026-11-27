// Compiles the Procedural Ocean of the playground (src/playground-examples/ocean.cs) with the real CLI, once per variant,
// split in two files (OceanShader.cs, MethodHelpers.cs) that are written to src/hero-ocean.cs and src/hero-helpers.cs.
// The home hero types them and edits two constants. The files are compiled exactly as shown, in every format, and the
// tool fails if they do not compile. It also stores the GLSL ES that the compiler wrote, which the hero runs in WebGL2.
//
//   node tools/hero-shader.mjs
//
// Needs the `yotsuba` tool (dotnet tool install --global YotsubaShader.Compiler.CLI) and spirv-dis (SPIRV-Tools).

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VERSION = process.env.YOTSUBA_VERSION || '0.9.5';
const ORIGINAL = fs.readFileSync(path.join(ROOT, 'src', 'playground-examples', 'ocean.cs'), 'utf8');

/** The same shader, in the order a reader can follow: structs, fields, stages, and the helper methods below. */
function reorder(src) {
  const lines = src.split('\n');
  const open = lines.findIndex((l) => /^public class /.test(l));
  const close = lines.length - 1 - [...lines].reverse().findIndex((l) => l === '}');
  const head = lines.slice(0, open + 2); // up to the class line and its brace
  const chunks = [];
  let cur = [], depth = 0;
  for (const l of lines.slice(open + 2, close)) {
    if (!l.trim() && depth === 0) { if (cur.length) chunks.push(cur); cur = []; continue; }
    cur.push(l);
    depth += (l.match(/\{/g) || []).length - (l.match(/\}/g) || []).length;
  }
  if (cur.length) chunks.push(cur);
  const kept = chunks.filter((c) => !c.every((l) => /^\s*\/\/ -{5,}/.test(l)));
  const fields = kept.filter((c) => /^\s*(const |\[Uniform\])/.test(c[0]));
  const stages = kept.filter((c) => c.some((l) => /\[ShaderStage/.test(l)));
  // the vector and math helpers written by hand in the playground are the intrinsics of `Methods.Math` in the hero
  const OWN = /^\s*static float3? (Saturate|Frac|Lerp3?|SmoothStep|Dot3|Length3|Distance3|Normalize3|Cross3|Reflect3)\(/;
  const helpers = kept.filter((c) => !fields.includes(c) && !stages.includes(c) && !c.some((l) => OWN.test(l)));
  const section = (name, cs) => [`    // ${name}`, ...cs.flatMap((c, i) => (i ? ['', ...c] : c))].join('\n');
  const ns = lines.findIndex((l) => /^namespace /.test(l));
  const usings = lines.slice(0, ns + 1).join('\n');
  // the structs stay above the class, as they are in the playground; the dividers are replaced by one comment per block
  const structs = lines.slice(ns + 1, open).join('\n').replace(/\/\/ -{5,}[^\n]*\n/g, '').replace(/^\s*\n/, '');
  const classLine = lines[open].replace('public class', 'public partial class');
  return {
    // OceanShader.cs: what the GPU receives and the two stages
    main: `${usings}\n\n// structs\n${structs.trimEnd()}\n\n${classLine}\n{\n${section('fields', fields)}\n\n${section('stages', stages)}\n}\n`,
    // MethodHelpers.cs: everything the stages call
    helpers: `${usings}\n\n${classLine}\n{\n${section('helpers', helpers)}\n}\n`,
  };
}

/** The arguments of the call that opens at text[open] (the "(" itself), split at the top-level commas. */
function callArgs(text, open) {
  const args = [];
  let depth = 0, start = open + 1;
  for (let i = open; i < text.length; i++) {
    const c = text[i];
    if (c === '(') depth++;
    else if (c === ')' && --depth === 0) { args.push(text.slice(start, i)); return { args, end: i }; }
    else if (c === ',' && depth === 1) { args.push(text.slice(start, i)); start = i + 1; }
  }
  throw new Error('unbalanced call');
}

/** Calls to the hand-written helpers and to System.Math become the HLSL intrinsics (using static ...Methods.Math).
 *  HLSL's lerp takes the weight as a vector too, so the scalar weight of Lerp3 is widened with float3(t). */
function toIntrinsics(text, { widen }) {
  let t = text;
  if (widen) {
    for (let at = t.indexOf('Lerp3('); at >= 0; at = t.indexOf('Lerp3(', at + 1)) {
      const { args, end } = callArgs(t, at + 5);
      t = `${t.slice(0, at)}Lerp3(${args[0]},${args[1]}, float3(${args[2].trim()})${t.slice(end)}`;
    }
  }
  return t
    .replace('using System;\n', '')
    .replace('using YotsubaShader.SpirvSyntax.Resources;', `using YotsubaShader.SpirvSyntax.Resources;\nusing static YotsubaShader.HlslSyntax.Methods.Math;${widen ? '\nusing static YotsubaShader.HlslSyntax.Methods.Constructors;' : ''}`)
    .replace(/\bSaturate\(/g, 'saturate(').replace(/\bFrac\(/g, 'frac(').replace(/\bLerp3?\(/g, 'lerp(').replace(/\bSmoothStep\(/g, 'smoothstep(')
    .replace(/\bDot3\(/g, 'dot(').replace(/\bLength3\(/g, 'length(').replace(/\bDistance3\(/g, 'distance(')
    .replace(/\bNormalize3\(/g, 'normalize(').replace(/\bCross3\(/g, 'cross(').replace(/\bReflect3\(/g, 'reflect(')
    .replace(/MathF\.(Abs|Cos|Exp|Floor|Max|Min|Pow|Sin|Sqrt)\(/g, (_, f) => `${f.toLowerCase()}(`)
    .replace(/Math\.Clamp\(/g, 'clamp(');
}

/** The same two files in GLSL style: vec types, lower-case intrinsics and the attributes of that syntax. */
function toGlslStyle(text) {
  let t = text
    .replace('using YotsubaShader.HlslSyntax.Types;', 'using YotsubaShader.GlslSyntax.Types;')
    .replace('using YotsubaShader.HlslSyntax;', 'using YotsubaShader.GlslSyntax;')
    .replace('using YotsubaShader.SpirvSyntax.Resources;', 'using YotsubaShader.GlslSyntax.Resources;')
    .replace('using static YotsubaShader.HlslSyntax.Methods.Math;', 'using static YotsubaShader.GlslSyntax.Methods.Math;')
    .replace(/\bfloat([234])\b/g, 'vec$1')
    .replace(/\blerp\(/g, 'mix(').replace(/\bfrac\(/g, 'fract(')
    // GLSL has no saturate: a one-line helper
    .replace(/\bsaturate\(/g, 'Saturate(')
    .replace('    // helpers\n', '    // helpers\n    static float Saturate(float x)\n    {\n        return clamp(x, 0f, 1f);\n    }\n\n')
    .replace('[POSITION]', '[location(0)]')
    .replace('[SV_Position]', '[gl_Position]')
    .replace('[TEXCOORD(0)] public vec2 TexCoord;\n}\n\npublic struct VSOutput', '[location(1)] public vec2 TexCoord;\n}\n\npublic struct VSOutput')
    .replace(/\[TEXCOORD\(0\)\]/g, '[location(0)]')
    .replace('[Uniform] [DescriptorSet(0)] [Binding(0)]', '[uniform, layout(0, 0)]')
    .replace('[return: SV_Target]', '[return: location(0)]')
    // in GLSL style the fragment stage cannot receive gl_Position: it has its own input struct
    .replace(/public partial class ProceduralOcean(?=[\s\S]*MainPS)/, 'public struct PSInput\n{\n    [location(0)] public vec2 TexCoord;\n}\n\npublic partial class ProceduralOcean')
    .replace('MainPS(VSOutput input)', 'MainPS(PSInput input)');
  return t;
}

// in the hero the sky runs faster than in the playground: day and night alternate every 5 seconds (half a turn of 2*PI / 0.6283 = 10 s)
const FAST = 'float cycle = Globals.Time * 0.09f + 0.2f + phaseOffset;';
if (!ORIGINAL.includes(FAST)) throw new Error('the day/night cycle line of ocean.cs changed');
const HLSL0 = reorder(ORIGINAL.replace(FAST, '// day and night alternate every 5 seconds\n        float cycle = Globals.Time * 0.6283f + 0.2f + phaseOffset;'));
const HLSL = { main: toIntrinsics(HLSL0.main, { widen: true }), helpers: toIntrinsics(HLSL0.helpers, { widen: true }) };
const GLSL = { main: toGlslStyle(toIntrinsics(HLSL0.main, { widen: false })), helpers: toGlslStyle(toIntrinsics(HLSL0.helpers, { widen: false })) };
const STYLES = { hlsl: HLSL, glsl: GLSL };
const FILES = HLSL;
fs.writeFileSync(path.join(ROOT, 'src', 'hero-ocean.cs'), FILES.main);
fs.writeFileSync(path.join(ROOT, 'src', 'hero-helpers.cs'), FILES.helpers);
fs.writeFileSync(path.join(ROOT, 'src', 'hero-ocean.glsl.cs'), GLSL.main);
fs.writeFileSync(path.join(ROOT, 'src', 'hero-helpers.glsl.cs'), GLSL.helpers);

// each variant changes one constant of the previous one: drag, then depth, then drag again, then depth again
export const VARIANTS = [
  { drag: 0.38, depth: 1.0 },
  { drag: 0.75, depth: 1.0 },
  { drag: 0.75, depth: 2.0 },
  { drag: 0.38, depth: 2.0 },
];
const SENTINEL = { drag: 0.123456, depth: 7.654321 };

const num = (n) => (Number.isInteger(n) ? n.toFixed(1) : String(n));
const withConstants = (text, v) => text
  .replace(/const float DRAG_MULT = [\d.]+f;/, `const float DRAG_MULT = ${num(v.drag)}f;`)
  .replace(/const float WATER_DEPTH = [\d.]+f;/, `const float WATER_DEPTH = ${num(v.depth)}f;`);

const work = fs.mkdtempSync(path.join(os.tmpdir(), 'hero-'));
const PACKAGES = {
  hlsl: ['YotsubaShader.HlslSyntax', 'YotsubaShader.SpirvSyntax'],
  glsl: ['YotsubaShader.GlslSyntax'],
};
const csproj = (style) => `<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><TargetFramework>net8.0</TargetFramework><OutputType>Library</OutputType></PropertyGroup><ItemGroup>${PACKAGES[style].map((p) => `<PackageReference Include="${p}" Version="${VERSION}" />`).join('')}</ItemGroup></Project>`;
// compiles the two files exactly as the page shows them (with the given constants); a failure stops the tool
const compile = (v, targets, style = 'hlsl') => {
  const dir = path.join(work, style);
  fs.mkdirSync(dir, { recursive: true });
  const proj = path.join(dir, 'Ocean.csproj');
  fs.writeFileSync(proj, csproj(style));
  fs.writeFileSync(path.join(dir, 'OceanShader.cs'), withConstants(STYLES[style].main, v));
  fs.writeFileSync(path.join(dir, 'MethodHelpers.cs'), withConstants(STYLES[style].helpers, v));
  fs.rmSync(path.join(dir, 'out'), { recursive: true, force: true });
  try {
    execFileSync('yotsuba', ['compile', proj, ...targets.flatMap((t) => ['--target', t]), '--output', path.join(dir, 'out')], { stdio: 'pipe' });
  } catch (e) {
    throw new Error(`the ${style} style code shown on the home page does not compile:\n${e.stdout || ''}${e.stderr || ''}`);
  }
  return path.join(dir, 'out', 'Ocean');
};

// 1. the files as they are shown, to every format the compiler writes
const shown = compile(VARIANTS[0], ['spirv', 'glsl', 'gles:300', 'hlsl', 'wgsl', 'msl']);
for (const f of ['ProceduralOcean.spv', 'ProceduralOcean.wgsl', 'ProceduralOcean.Fragment.glsl', 'ProceduralOcean.Fragment.gles', 'ProceduralOcean.Fragment.hlsl', 'ProceduralOcean.Fragment.msl']) {
  if (!fs.existsSync(path.join(shown, f))) throw new Error(`missing output ${f}`);
}
// 2. every edited variant must compile too, and so must the GLSL style, in every format
for (const v of VARIANTS.slice(1)) compile(v, ['glsl']);
for (const v of VARIANTS) {
  const out = compile(v, ['spirv', 'glsl', 'gles:300', 'hlsl', 'wgsl', 'msl'], 'glsl');
  if (!fs.readdirSync(out).length) throw new Error('the GLSL style produced no output');
}

// 3. the GLSL ES the preview runs: compiled once with marker values, which the page replaces with the edited ones
const gl = compile(SENTINEL, ['gles:300']);
let frag = fs.readFileSync(path.join(gl, 'ProceduralOcean.Fragment.gles'), 'utf8');
const vert = fs.readFileSync(path.join(gl, 'ProceduralOcean.Vertex.gles'), 'utf8');
const mark = (re, name) => {
  let n = 0;
  frag = frag.replace(re, () => { n++; return name; });
  if (!n) throw new Error(`marker ${name} not found in the GLSL ES`);
  return n;
};
const nDrag = mark(/0\.1234560\d*/g, '@DRAG@');
const nDepth = mark(/7\.6543\d*/g, '@DEPTH@');

fs.rmSync(work, { recursive: true, force: true });
const file = path.join(ROOT, 'src', 'data', 'hero-shader.json');
fs.writeFileSync(file, JSON.stringify({ version: VERSION, gles: { frag, vert }, variants: VARIANTS, files: Object.fromEntries(Object.entries(STYLES).map(([k, v]) => [k, { cs: v.main, helpers: v.helpers }])) }) + '\n');
console.log(`compiled OK: 2 styles x 2 files x 6 formats, ${VARIANTS.length} variants; markers ${nDrag}x drag / ${nDepth}x depth -> src/data/hero-shader.json (${(fs.statSync(file).size / 1024).toFixed(0)} KB)`);

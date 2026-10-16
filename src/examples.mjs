// C# examples generated from the language data (BUILTIN_MAP and the scanned attribute sources), one per style.
// The reference pages use them instead of tables: every concept is shown as code.
import { BUILTIN_MAP } from './reference.mjs';

const COL = { hlsl: 1, glsl: 2, metal: 3, vulkan: 4, wgsl: 5 };
const NS = { hlsl: 'HlslStyle', glsl: 'GlslStyle', metal: 'MetalStyle', vulkan: 'VulkanStyle', wgsl: 'WgslStyle' };

const TYPE_OF = [
  [/position|coordinate/i, 'Vector4'],
  [/front-facing|helper/i, 'bool'],
  [/barycentric/i, 'Vector3'],
  [/sample position/i, 'Vector2'],
  [/clip distance|depth/i, 'float'],
];
const typeFor = (concept) => (TYPE_OF.find(([re]) => re.test(concept)) || [, 'uint'])[1];

const pascal = (concept) =>
  concept
    .replace(/\([^)]*\)/g, '')
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join('');

const attrText = (name) => `[${name}]`;

/** Sections of BUILTIN_MAP by stage: [{ stage, rows: [[concept, ...names]] }] */
function stages() {
  const out = [];
  for (const row of BUILTIN_MAP) {
    if (row[1] === null) out.push({ stage: row[0], rows: [] });
    else out[out.length - 1].rows.push(row);
  }
  return out;
}

const WG = { hlsl: 'numthreads(8, 8, 1)', glsl: 'layout_local_size(8, 8, 1)', wgsl: '@workgroup_size(8, 8, 1)' };

/** Every built-in value of the style, grouped by stage, as C#. */
export function builtinValuesCode(id) {
  const c = COL[id];
  const parts = [`using YotsubaShader.Language;\nusing YotsubaShader.Language.StylesAttributes.${NS[id]};\n`];
  for (const { stage, rows } of stages()) {
    const members = [];
    let method = '';
    for (const row of rows) {
      const concept = row[0];
      const raw = row[c];
      if (!raw) continue;
      if (/method attribute/.test(concept)) {
        method = `    // ${concept}\n    [ShaderStage(Stage.Compute)]\n    [${WG[id]}]\n    public void Compute() { }\n`;
        continue;
      }
      const names = raw.split(' / ');
      names.forEach((n, i) => {
        const member = pascal(concept) + (i ? String(i + 1) : '');
        members.push(`    // ${concept}\n    ${attrText(n)} public ${typeFor(concept)} ${member};`);
      });
    }
    const kind = stage.replace(' stage', '');
    const isCompute = stage.startsWith('Compute');
    const body = members.join('\n\n') + (isCompute && method ? `\n\n${method.replace(/\n$/, '')}` : '');
    parts.push(`${stage === 'Vertex stage' ? '' : '\n'}// ${stage}\npublic ${isCompute ? 'class' : 'struct'} ${kind}BuiltIns\n{\n${body}\n}`);
  }
  return parts.join('\n');
}

/* --------------------------------------------------------------------------- per-style attribute reference */
const sampleArgs = (params) => {
  if (!params) return '';
  const args = [];
  for (const part of params.split(/,\s*(?![^()]*\))/)) {
    if (/=/.test(part)) continue; // optional arguments are omitted
    const m = /^(\S+)\s+(\w+)$/.exec(part.trim());
    if (!m) continue;
    const [, type, name] = m;
    if (type === 'RegisterPrefix') args.push('RegisterPrefix.b');
    else if (type === 'storage_use') args.push('storage_use.read_write');
    else if (type === 'string') args.push('"b0"');
    else if (type === 'bool') args.push('false');
    else if (type === 'uint') args.push({ x: '8', y: '8', z: '1' }[name] || '0');
    else args.push('0');
  }
  return args.length ? `(${args.join(', ')})` : '';
};

const member = (name) => name.replace(/^@/, '').replace(/\W/g, '_').replace(/^(\d)/, '_$1');
const cap = (s) => s[0].toUpperCase() + s.slice(1);

/** One group of attributes of a style (Input, Output, Method, Resource, Type) used on real members. */
export function attributeGroupCode(id, items, group) {
  const list = items.filter((i) => i.kind === group);
  if (!list.length) return '';
  const ns = `using YotsubaShader.Language;\nusing YotsubaShader.Language.StylesAttributes.${NS[id]};\n\n`;
  const conceptOf = (name) => {
    const row = BUILTIN_MAP.find((r) => r[1] !== null && [r[1], r[2], r[3], r[4], r[5]].some((v) => v && v.split(' / ').map((x) => x.replace(/N$/, '')).includes(name)));
    return row ? row[0] : null;
  };
  if (group === 'Method') {
    return (
      ns +
      `public class MethodExamples\n{\n` +
      list
        .map((i) => `    [ShaderStage(Stage.Compute)]\n    [${i.display}${sampleArgs(i.params)}]\n    public void ${cap(member(i.display))}Example() { }`)
        .join('\n\n') +
      '\n}'
    );
  }
  if (group === 'Type') {
    const lines = list.map((i) => {
      const n = i.display;
      if (/^\w+<T>$/.test(n)) return `    public ${n.replace('<T>', '<float>')} ${n.replace('<T>', '')}Value;`;
      return `    public ${n} ${cap(n)}Value;`;
    });
    return ns + `public class Types\n{\n${lines.join('\n')}\n}`;
  }
  const holder = group === 'Resource' ? 'class' : 'struct';
  const used = new Map();
  const lines = list.map((i, index) => {
    const concept = conceptOf(i.name || i.display);
    const type = group === 'Resource' ? 'float' : concept ? typeFor(concept) : 'Vector4';
    const attr = `${i.display === 'Binding' ? '@Binding' : i.display}${sampleArgs(i.params)}`;
    let name = concept ? pascal(concept) : `Value${index + 1}`;
    const n = (used.get(name) || 0) + 1;
    used.set(name, n);
    if (n > 1) name += n;
    const one = `[${attr}] public ${type} ${name};`;
    const body = one.length > 60 ? `[${attr}]\n    public ${type} ${name};` : one;
    const extra = i.display === 'register' ? `\n\n    // The string overload: letter + number\n    [register("b1")]\n    public float Value${index + 2};` : '';
    return `${concept ? `    // ${concept}\n` : ''}    ${body}${extra}`;
  });
  return ns + `public ${holder} ${group.replace(/\W+/g, '')}Examples\n{\n${lines.join('\n')}\n}`;
}

const TEX_BIND = {
  hlsl: ['[register(RegisterPrefix.t, 0)]', '[register("s0")]'],
  glsl: ['[layout(0, 0)]', '[layout(0, 1)]'],
  metal: ['[texture(0)]', '[sampler(0)]'],
  vulkan: ['[DescriptorSet(0), @Binding(0)]', '[DescriptorSet(0), @Binding(1)]'],
  wgsl: ['[@group(0), @binding(0)]', '[@group(0), @binding(1)]'],
};

/** A texture and a sampler bound to their slots, in the style's own spelling. */
export const textureBindingCode = (id) => `using YotsubaShader.Language.StylesAttributes.${NS[id]};

public class Surface
{
    ${TEX_BIND[id][0]}
    public Texture2D Albedo;
${id === 'hlsl' ? '\n    // The same register, written as a string: letter + number\n' : '\n'}    ${TEX_BIND[id][1]}
    public SamplerState Sampler;
}`;
export const STYLE_IDS = Object.keys(NS);

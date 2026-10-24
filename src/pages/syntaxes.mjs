import { icon, code, table, note, cardLink, styleTabs } from '../components.mjs';
import { STYLE_TRIANGLE, STYLE_RESOURCES } from '../snippets.mjs';
import { SYNTAX_META, BUILTIN_MAP, syntaxUsing, resUsing } from '../reference.mjs';

const COL = { hlsl: 1, glsl: 2, msl: 3, spirv: 4, wgsl: 5 };

const FIT = {
  hlsl: {
    for: 'Teams coming from Direct3D and HLSL.',
    why: 'System-value semantics (<code>SV_Position</code>, <code>SV_VertexID</code>, <code>SV_DispatchThreadID</code>) read clearly, and the relationship between stages, inputs, position and fragment color is easy to see. It is a good first choice when you are starting fresh.',
    quirk: 'Compute workgroup size is a method attribute: <code>[numthreads(x, y, z)]</code>. Resources use <code>cbuffer</code> and <code>register(RegisterPrefix.b, n)</code>.',
  },
  glsl: {
    for: 'Teams coming from OpenGL and Vulkan GLSL.',
    why: 'The <code>gl_*</code> built-ins (<code>gl_Position</code>, <code>gl_VertexIndex</code>, <code>gl_GlobalInvocationID</code>) and <code>layout(set, binding)</code> carry over directly.',
    quirk: 'Workgroup size is <code>[layout_local_size(x, y, z)]</code>. Some attributes carry extension suffixes, such as <code>gl_BaryCoordEXT</code> and <code>gl_FragStencilRefARB</code>.',
  },
  msl: {
    for: 'Teams coming from the Metal Shading Language.',
    why: 'MSL attribute names (<code>position</code>, <code>vertex_id</code>, <code>thread_position_in_grid</code>) and the argument-index style resources <code>buffer(n)</code>, <code>texture(n)</code> and <code>sampler(n)</code>.',
    quirk: 'Address-space style resources are <code>constant</code> and <code>device</code>; workgroup size is exposed as the built-in <code>threads_per_threadgroup</code> rather than a method attribute.',
  },
  spirv: {
    for: 'Teams that think in SPIR-V and Vulkan descriptors.',
    why: 'Names mirror the SPIR-V <code>BuiltIn</code> decorations (<code>BuiltIn_Position</code>, <code>BuiltIn_GlobalInvocationId</code>), so the mapping to the binary is the most literal of the five.',
    quirk: 'Resources use <code>Uniform</code>, <code>StorageBuffer</code>, <code>DescriptorSet(s)</code> and <code>Binding(n)</code>.',
  },
  wgsl: {
    for: 'Teams coming from WebGPU and WGSL.',
    why: 'The <code>@builtin(...)</code>, <code>@group</code> and <code>@binding</code> vocabulary. In C# the names carry an <code>@</code> in the identifier, as in <code>[@builtin_position]</code>, and remain valid C#.',
    quirk: 'Workgroup size is <code>[@workgroup_size(x, y = 1, z = 1)]</code>. Storage access uses <code>storage(storage_use.read)</code> or <code>storage_use.read_write</code>.',
  },
};

const KEY_ROWS = [
  'Clip-space position (vertex output)',
  'Vertex index',
  'Instance index',
  'Fragment coordinate',
  'Global invocation id',
  'Workgroup size (method attribute)',
];


/* ----------------------------------------------------------- C# examples per syntax */
const attr = (n) => (n.startsWith('@') ? `[${n}]` : `[${n}]`);
const WG = { hlsl: 'numthreads(8, 8, 1)', glsl: 'layout_local_size(8, 8, 1)', wgsl: '@workgroup_size(8, 8, 1)' };
const row = (label, col) => BUILTIN_MAP.find((r) => r[0] === label)[col];

/** The common built-in values, used inside a real shader (one example per syntax). */
export function builtinsCode(id) {
  const c = COL[id];
  const wg = WG[id]
    ? `    // Workgroup size (method attribute)\n    [${WG[id]}]\n`
    : '    // No method attribute: the workgroup size is a built-in value\n';
  return `using YotsubaShader.Language;
${syntaxUsing(id)}

public struct VertexOutput
{
    // Clip-space position (vertex output)
    [${row('Clip-space position (vertex output)', c)}]
    public Vector4 Position;
}

public class BuiltIns
{
    [ShaderStage(Stage.Vertex)]
    public VertexOutput Vertex(
        // Vertex index
        [${row('Vertex index', c)}] uint vertex,
        // Instance index
        [${row('Instance index', c)}] uint instance)
    {
        VertexOutput output = new VertexOutput();
        output.Position = new Vector4(vertex, instance, 0, 1);
        return output;
    }

    [ShaderStage(Stage.Fragment)]
    public Vector4 Fragment(
        // Fragment coordinate
        [${row('Fragment coordinate', c)}] Vector4 coord)
    {
        return new Vector4(coord.X, coord.Y, 0, 1);
    }

    [ShaderStage(Stage.Compute)]
${wg}    public void Compute(
        // Global invocation id
        [${row('Global invocation id', c)}] uint id)
    {
        uint index = id;
    }
}`;
}

/** Uniform and storage buffers with their binding slots (one example per syntax). */
export function resourcesCode(id) {
  const body = {
    hlsl: [
      '[cbuffer, register(RegisterPrefix.b, 0)]\n    public Material Material;',
      '[register(RegisterPrefix.u, 0)]\n    public RWStructuredBuffer<float> Output;',
      '[register("t0")]\n    public StructuredBuffer<float> Input;',
    ],
    glsl: ['[uniform, layout(0, 0)]\n    public Material Material;', '[buffer, layout(0, 1)]\n    public float[] Output;', '[buffer, layout(0, 2)]\n    public float[] Input;'],
    msl: ['[constant, buffer(0)]\n    public Material Material;', '[device, buffer(1)]\n    public float[] Output;', '[device(readOnly: true), buffer(2)]\n    public float[] Input;'],
    spirv: [
      '[Uniform, DescriptorSet(0), @Binding(0)]\n    public Material Material;',
      '[StorageBuffer, DescriptorSet(0), @Binding(1)]\n    public float[] Output;',
      '[StorageBuffer, DescriptorSet(0), @Binding(2)]\n    public float[] Input;',
    ],
    wgsl: [
      '[uniform, @group(0), @binding(0)]\n    public Material Material;',
      '[storage(storage_use.read_write), @group(0), @binding(1)]\n    public float[] Output;',
      '[storage(storage_use.read), @group(0), @binding(2)]\n    public float[] Input;',
    ],
  }[id];
  const same = id === 'glsl' || id === 'spirv' ? 'Read-only storage buffer (same attribute)' : 'Read-only storage buffer';
  return `using YotsubaShader.Language;
${syntaxUsing(id)}
${resUsing(id)}

public struct Material
{
    public float Exposure;
}

public class Resources
{
    // Uniform buffer, with its binding slot
    ${body[0]}

    // Read/write storage buffer
    ${body[1]}

    // ${same}
    ${body[2]}
}`;
}
const BUILTINS = Object.fromEntries(Object.keys(COL).map((id) => [id, builtinsCode(id)]));

export default function syntaxes(ctx) {
  const counts = Object.fromEntries(Object.entries(ctx.syntaxes).map(([k, v]) => [k, v.total]));

  const overview = {
    path: '/syntaxes/',
    section: 'syntaxes',
    title: 'Syntaxes',
    description: 'Five equivalent attribute vocabularies for writing shaders in C#: HLSL, GLSL, MSL, SPIR-V and WGSL.',
    body: `
<section class="hero hero--compact">
  <div class="container">
    <h1 class="h-xl">One shader. Five ways to write it.</h1>
    <p class="lead">The five syntax projects declare C# attributes inspired by HLSL, GLSL, MSL, SPIR-V, and WGSL. Their concepts are intended to share an output path; the complete compiler pipeline is still in development. WGSL authoring attributes exist, while WGSL output is planned for 2027.</p>
  </div>
  <hr class="hero-rule">
</section>

<section class="section">
  <div class="container">
    ${styleTabs(STYLE_TRIANGLE)}
    ${note('important', 'The HLSL syntax does not require an HLSL target, and the WGSL syntax does not require WebGPU. The syntax is an authoring choice; the compilation targets are selected separately.')}
    ${note('note', 'Each syntax is its own package, <code>YotsubaShader.HlslSyntax</code>, <code>YotsubaShader.GlslSyntax</code>, <code>YotsubaShader.MslSyntax</code>, <code>YotsubaShader.SpirvSyntax</code> or <code>YotsubaShader.WgslSyntax</code>, with a namespace of the same name. They all build on <code>YotsubaShader.Language</code>, the neutral core that engines and frameworks use internally. Add only the syntax you write with.')}
  </div>
</section>

<section class="section section--rule">
  <div class="container">
    <h2 class="h-lg center">Choose your vocabulary</h2>
    <div class="grid grid-3 mt-48">
      ${Object.entries(SYNTAX_META)
        .map(([id, m]) =>
          cardLink({
            href: `/syntaxes/${id}/`,
            icon: 'braces',
            title: m.name,
            body: `${FIT[id].for} ${counts[id] || '—'} attributes.`,
          }),
        )
        .join('')}
      ${cardLink({ href: '/documentation/yotsuba-shader/builtin-values-across-syntaxes/', icon: 'list', title: 'Side-by-side reference', body: 'Every built-in value in all five syntaxes in one table.' })}
    </div>
  </div>
</section>

<section class="section section--rule">
  <div class="container">
    <h2 class="h-lg center">The same concept, five spellings</h2>
    <div class="mt-48">${styleTabs(BUILTINS)}</div>
    <p class="center"><a class="link-more" href="/documentation/yotsuba-shader/builtin-values-across-syntaxes/">Full built-in reference ${icon('chevron-right')}</a></p>
  </div>
</section>`,
  };

  const page = ([id, m]) => {
    const f = FIT[id];
    const col = COL[id];
    return {
      path: `/syntaxes/${id}/`,
      section: 'syntaxes',
      title: m.name,
      description: `The attributes of the ${m.name} in Yotsuba Shader, inspired by ${m.inspired}.`,
      body: `
<section class="hero hero--compact">
  <div class="container">
    <h1 class="h-xl">${m.name}</h1>
    <p class="lead">${f.for} Inspired by ${m.inspired}.</p>
    <p class="hero-meta">Package and namespace <code>${m.namespace}</code> · ${counts[id] || '—'} attributes</p>
  </div>
  <hr class="hero-rule">
</section>

<section class="section">
  <div class="container container--narrow prose">
    <h2>Why choose it</h2>
    <p>${f.why}</p>
    <p>${f.quirk}</p>
    <h2>The same shader</h2>
    ${code('csharp', STYLE_TRIANGLE[id], 'Triangle.cs')}
    <h2>Common built-ins</h2>
    ${code('csharp', builtinsCode(id), 'BuiltIns.cs')}
    <h2>Resources</h2>
    ${code('csharp', resourcesCode(id), 'Resources.cs')}
    ${note('note', 'The syntax never determines the output target. Every syntax resolves to the same IR slots.')}
    <p><a class="link-more" href="/documentation/yotsuba-shader/${id}-syntax-attributes/">All ${m.name} attributes ${icon('chevron-right')}</a></p>
    <p>Other syntaxes: ${Object.entries(SYNTAX_META)
      .filter(([o]) => o !== id)
      .map(([o, mm]) => `<a href="/syntaxes/${o}/">${mm.name}</a>`)
      .join(' · ')}</p>
  </div>
</section>`,
    };
  };

  return [overview, ...Object.entries(SYNTAX_META).map(page)];
}

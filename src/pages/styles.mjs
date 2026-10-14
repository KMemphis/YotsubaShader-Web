import { icon, code, table, note, cardLink, styleTabs } from '../components.mjs';
import { STYLE_TRIANGLE, STYLE_RESOURCES } from '../snippets.mjs';
import { STYLE_META, BUILTIN_MAP, RESOURCE_MAP } from '../reference.mjs';

const COL = { hlsl: 1, glsl: 2, metal: 3, vulkan: 4, wgsl: 5 };

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
  metal: {
    for: 'Teams coming from the Metal Shading Language.',
    why: 'MSL attribute names (<code>position</code>, <code>vertex_id</code>, <code>thread_position_in_grid</code>) and the argument-index style resources <code>buffer(n)</code>, <code>texture(n)</code> and <code>sampler(n)</code>.',
    quirk: 'Address-space style resources are <code>constant</code> and <code>device</code>; workgroup size is exposed as the built-in <code>threads_per_threadgroup</code> rather than a method attribute.',
  },
  vulkan: {
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

export default function styles(ctx) {
  const counts = Object.fromEntries(Object.entries(ctx.styles).map(([k, v]) => [k, v.total]));

  const overview = {
    path: '/styles/',
    section: 'styles',
    title: 'Styles',
    description: 'Five equivalent attribute vocabularies for writing shaders in C#: HLSL, GLSL, Metal, Vulkan and WGSL.',
    body: `
<section class="hero hero--compact">
  <div class="container">
    <h1 class="h-xl">One shader. Five ways to write it.</h1>
    <p class="lead">You can write the same shader using the names of HLSL, GLSL, Metal, Vulkan or WGSL. Choose the one you already know. The result is the same.</p>
  </div>
  <hr class="hero-rule">
</section>

<section class="section">
  <div class="container">
    ${styleTabs(STYLE_TRIANGLE)}
    ${note('important', 'An HLSL-like style does not require an HLSL target, and a WGSL-like style does not require WebGPU. Style is an authoring choice; the compilation target is selected separately.')}
  </div>
</section>

<section class="section section--rule">
  <div class="container">
    <h2 class="h-lg center">Choose your vocabulary</h2>
    <div class="grid grid-3 mt-48">
      ${Object.entries(STYLE_META)
        .map(([id, m]) =>
          cardLink({
            href: `/styles/${id}/`,
            icon: 'braces',
            title: m.name,
            body: `${FIT[id].for} ${counts[id] || '—'} attributes.`,
          }),
        )
        .join('')}
      ${cardLink({ href: '/documentation/yotsuba-shader/builtin-values-across-styles/', icon: 'list', title: 'Side-by-side reference', body: 'Every built-in value in all five vocabularies in one table.' })}
    </div>
  </div>
</section>

<section class="section section--rule">
  <div class="container container--narrow">
    <h2 class="h-lg">The same concept, five spellings</h2>
    ${table(
      ['Concept', 'HLSL', 'GLSL', 'Metal', 'Vulkan', 'WGSL'],
      BUILTIN_MAP.filter((r) => KEY_ROWS.includes(r[0])).map((r) => [
        r[0],
        ...r.slice(1).map((v) => (v ? `<code>${v}</code>` : '<span class="muted">—</span>')),
      ]),
      { cls: 'table--map' },
    )}
    <p><a class="link-more" href="/documentation/yotsuba-shader/builtin-values-across-styles/">Full built-in reference ${icon('chevron-right')}</a></p>
  </div>
</section>`,
  };

  const page = ([id, m]) => {
    const f = FIT[id];
    const col = COL[id];
    const rows = BUILTIN_MAP.filter((r) => KEY_ROWS.includes(r[0]) && r[col]).map((r) => [r[0], `<code>${r[col]}</code>`]);
    const resRows = RESOURCE_MAP.map((r) => [r[0], `<code>${r[col]}</code>`]);
    return {
      path: `/styles/${id}/`,
      section: 'styles',
      title: m.name,
      description: `The ${m.name} attribute vocabulary of Yotsuba Shader, inspired by ${m.inspired}.`,
      body: `
<section class="hero hero--compact">
  <div class="container">
    <h1 class="h-xl">${m.name}</h1>
    <p class="lead">${f.for} Inspired by ${m.inspired}.</p>
    <p class="hero-meta"><code>${m.namespace}</code> · ${counts[id] || '—'} attributes</p>
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
    <h2>Resources</h2>
    ${code('csharp', STYLE_RESOURCES[id], 'Lighting.cs')}
    <h2>Common built-ins</h2>
    ${table(['Concept', 'Attribute'], rows)}
    <h2>Resource attributes</h2>
    ${table(['Concept', 'Attribute'], resRows)}
    ${note('note', 'The attribute style never determines the output target. Every style resolves to the same IR slots.')}
    <p><a class="link-more" href="/documentation/yotsuba-shader/${id}-style-attributes/">All ${m.name} attributes ${icon('chevron-right')}</a></p>
    <p>Other styles: ${Object.entries(STYLE_META)
      .filter(([o]) => o !== id)
      .map(([o, mm]) => `<a href="/styles/${o}/">${mm.name}</a>`)
      .join(' · ')}</p>
  </div>
</section>`,
    };
  };

  return [overview, ...Object.entries(STYLE_META).map(page)];
}

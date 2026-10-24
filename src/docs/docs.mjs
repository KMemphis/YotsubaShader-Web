// Documentation set: sidebar tree, landing page and hub.
import essentials from './essentials.mjs';
import compilerDocs from './compiler.mjs';
import { cardLink, icon, note } from '../components.mjs';

export const SET = { slug: 'yotsuba-shader', title: 'Yotsuba Shader' };

export default function buildDocs(ctx) {
  const { core, reference, project } = compilerDocs(ctx);
  const internalArticles = new Set(['shader-discovery', 'intermediate-representation', 'building-spirv-modules', 'spirv-operation-generator', 'repository-architecture']);
  const articles = [...essentials, ...core, ...reference, ...project].filter(a => !internalArticles.has(a.slug));
  const bySlug = new Map(articles.map((a) => [a.slug, a]));
  const slugs = (...list) => list.filter((s) => {
    if (!bySlug.has(s)) throw new Error(`Unknown doc slug in tree: ${s}`);
    return true;
  });

  const tree = [
    { items: slugs('understanding-yotsuba-shader', 'writing-your-first-shader', 'reusing-your-types-and-libraries', 'types-for-engines-and-frameworks', 'shader-parameters-for-your-engine', 'choosing-a-syntax') },
    {
      label: 'Language',
      groups: [
        { title: 'Stages and interfaces', items: slugs('shader-stages', 'interface-slots-and-locations') },
        {
          title: 'Resources and types',
          items: slugs('uniforms-and-storage-buffers', 'textures-and-samplers', 'vectors-matrices-and-arrays'),
        },
        { title: 'In your game', items: slugs('using-shaders-in-your-game') },
      ],
    },
    {
      label: 'Compiler',
      groups: [
        {
          title: 'Compilation',
          items: slugs(
            'compilation-pipeline',
            'generating-shader-binaries',
            'shader-diagnostics-in-your-ide',
            'transpiling-spirv',
          ),
        },
      ],
    },
    {
      label: 'Reference',
      groups: [
        {
          title: 'Attribute reference',
          items: slugs(
            'builtin-values-across-syntaxes',
            'resource-attributes-across-syntaxes',
            'hlsl-syntax-attributes',
            'glsl-syntax-attributes',
            'msl-syntax-attributes',
            'spirv-syntax-attributes',
            'wgsl-syntax-attributes',
          ),
        },
      ],
    },
    {
      label: 'Project',
      groups: [{ title: 'About Yotsuba Shader', items: slugs('licensing') }],
    },
  ];

  // Reading order for previous/next.
  const order = tree.flatMap((b) => (b.items ? b.items : b.groups.flatMap((g) => g.items)));

  const topics = tree
    .map((b) => {
      const blocks = b.items ? [{ title: b.label || 'Start here', items: b.items }] : b.groups;
      return blocks
        .map(
          (g) => `<h3>${g.title}</h3><div class="topic-grid">${g.items
            .map((s) => {
              const a = bySlug.get(s);
              return cardLink({ href: `/documentation/${SET.slug}/${s}/`, icon: a.icon || 'doc', title: a.title, body: a.summary });
            })
            .join('')}</div>`,
        )
        .join('');
    })
    .join('');

  const landing = {
    slug: 'index',
    title: 'Yotsuba Shader',
    kind: 'Framework and compiler',
    heroKind: 'topic',
    icon: 'braces',
    summary: 'Write shaders in C# with familiar attributes, and compile them to SPIR-V through a shared intermediate representation.',
    body: `
<h2>Overview</h2>
<p class="lead-p">Yotsuba Shader is a shader framework and compiler for C#. Your team writes shaders using the types, structures and libraries of its own project, described with attributes. The compiler interprets their interfaces and stages, lowers them to a shared intermediate representation, and generates output for the selected backend.</p>
<p>The syntax you write with does not determine the output target. HLSL, GLSL, MSL, SPIR-V and WGSL provide equivalent authoring vocabularies; choose the one your team knows best.</p>
<h2>Topics</h2>
${topics}`,
  };

  const full = [landing, ...articles];
  const withNav = full.map((a) => {
    const i = order.indexOf(a.slug);
    const prev = a.slug === 'index' ? null : i > 0 ? bySlug.get(order[i - 1]) : landing;
    const next = a.slug === 'index' ? bySlug.get(order[0]) : i < order.length - 1 ? bySlug.get(order[i + 1]) : null;
    return { ...a, body: note('important', "Pre-release API reference, reviewed against the checkout on 23 October 2026. The C# \u2192 IR \u2192 SPIR-V pipeline is incomplete; authoring declarations and planned workflows are distinguished below.") + a.body, prev, next };
  });

  const hub = {
    path: '/documentation/',
    section: 'documentation',
    title: 'Documentation',
    description: 'Documentation for the Yotsuba Shader framework, compiler and intermediate representation.',
    body: `
<section class="hero hero--compact">
  <div class="container">
    <h1 class="h-xl">Documentation</h1>
    <p class="lead">Articles, tutorials and reference for the Yotsuba Shader framework, the compiler and the intermediate representation.</p>
    <div class="hero-actions">
      <button class="btn btn-secondary" type="button" data-search-open>${icon('search')} Search the documentation</button>
    </div>
  </div>
  <hr class="hero-rule">
</section>
<section class="section">
  <div class="container">
    <h2 class="h-md">Technologies</h2>
    <div class="grid grid-2 mt-24">
      ${cardLink({ href: `/documentation/${SET.slug}/`, icon: 'braces', title: 'Yotsuba Shader', body: `${articles.length} articles covering the language, the compiler and the attribute reference.` })}
    </div>
    <h2 class="h-md" style="margin-top:56px">Start here</h2>
    <div class="grid grid-3 mt-24">
      ${['understanding-yotsuba-shader', 'writing-your-first-shader', 'choosing-a-syntax', 'shader-diagnostics-in-your-ide', 'builtin-values-across-syntaxes', 'generating-shader-binaries']
        .map((s) => {
          const a = bySlug.get(s);
          return cardLink({ href: `/documentation/${SET.slug}/${s}/`, icon: a.icon || 'doc', title: a.title, body: a.summary });
        })
        .join('')}
    </div>
  </div>
</section>`,
  };

  return { set: SET, tree, articles: withNav, bySlug, hub };
}

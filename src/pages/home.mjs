import { icon, code, styleTabs, cardLink, ideWindow } from '../components.mjs';
import { STYLE_TRIANGLE } from '../snippets.mjs';
import { SITE } from '../site.mjs';
import { flowDiagram } from '../diagram.mjs';

const home = {
  path: '/',
  section: 'home',
  title: 'Yotsuba Shader',
  fullTitle: 'Yotsuba Shader - Write shaders in C#',
  description:
    'Yotsuba Shader is a shader framework and compiler for C#. Write shaders with the types from your own project and external libraries, and compile for the backend you choose.',
  body: `
<section class="hero hero--film">
  <div class="container">
    <div class="hero-intro">
      <div class="hero-copy">
        <h1 class="h-xl">Write Shaders in C#.</h1>
        <p class="lead"><span class="lead-u">Yotsuba Shader is a shader framework and compiler for C#.</span> Write shaders with the types from your own project and the libraries you already use, then compile for Spirv and other formats with Yotsuba ShaderCross.</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="/playground/">Try Playground ${icon('arrow-right')}</a>
          <a class="btn btn-secondary" href="/get-started/first-shader/">Write your first shader</a>
        </div>
      </div>
      <div class="film" data-film>
        <video class="film-video" preload="none" playsinline poster="/video/poster-__FILM_LANG__.webp" aria-label="Yotsuba Shader introduction film">
          <source src="/video/promo-__FILM_LANG__-2160.mp4" media="(min-width: 1700px)" type="video/mp4">
          <source src="/video/promo-__FILM_LANG__-1080.mp4" type="video/mp4">
        </video>
        <button class="film-play" type="button"><span class="film-ico">${'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" fill="currentColor"/></svg>'}</span><span>Watch the film</span></button>
      </div>
    </div>
  </div>
  <hr class="hero-rule">
</section>

<section class="section section--rule">
  <div class="container">
    <div class="center">
      <h2 class="h-lg">Write shaders once. Compile for any backend.</h2>
      <p class="lead">Author in the vocabulary your team knows. A Roslyn-based frontend and a shared intermediate representation turn it into the shader format each graphics API expects, such as SPIR-V for Vulkan.</p>
    </div>
    ${flowDiagram()}
  </div>
</section>

<section class="section stages-home" aria-labelledby="stages-home-title">
  <div class="container">
    <div class="center stages-home-header">
      <p class="eyebrow">SHADER STAGES</p>
      <h2 class="h-lg" id="stages-home-title">The pipeline today. The stages coming next.</h2>
      <p class="lead">Vertex, Fragment and Compute are declared in the current API; full compilation is in development. Geometry, Hull and Domain are planned for March 2027.</p>
    </div>
    <div class="stages-timeline">
      <article class="stages-timeline-item stages-timeline-item--now">
        <div class="stages-timeline-copy">
          <p class="stages-timeline-date">Now</p>
          <h3><span lang="en">Vertex</span>, <span lang="en">Fragment</span>, <span lang="en">Compute</span></h3>
          <p>Authoring declarations exist today. Complete GPU compilation is still in development.</p>
        </div>
        <figure class="stages-timeline-media">
          <img src="/img/stages/rasterization.svg" alt="A triangle being rasterized into a grid of pixels" width="450" height="450" loading="lazy">
          <figcaption>Rasterization diagram by Wojciech Mula, via <a href="https://commons.wikimedia.org/wiki/File:Rasterisation-triangle_example.svg" target="_blank" rel="noopener">Wikimedia Commons</a> · Public domain</figcaption>
        </figure>
      </article>
      <article class="stages-timeline-item stages-timeline-item--roadmap">
        <div class="stages-timeline-copy">
          <p class="stages-timeline-date">March 2027</p>
          <h3><span lang="en">Geometry</span>, <span lang="en">Hull</span>, <span lang="en">Domain</span></h3>
          <p>Planned support for geometry processing and GPU tessellation.</p>
        </div>
        <figure class="stages-timeline-media">
          <img src="/img/stages/tessellation.svg" alt="A tessellation pipeline turning a cube into a smooth shaded sphere" width="351" height="214" loading="lazy">
          <figcaption>Tessellation diagram by Romainbehar and Mark Viking, via <a href="https://commons.wikimedia.org/wiki/File:Tesselation_pipeline.svg" target="_blank" rel="noopener">Wikimedia Commons</a> · <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener">CC BY-SA 3.0</a></figcaption>
        </figure>
      </article>
      <article class="stages-timeline-item stages-timeline-item--ray">
        <div class="stages-timeline-copy">
          <p class="stages-timeline-date">October 2027</p>
          <h3>4. Ray tracing pipeline</h3>
          <p>Planned support for the programmable stages that make ray tracing extensible.</p>
          <ul class="stages-timeline-stage-list">
            <li>Ray Generation</li>
            <li>Intersection</li>
            <li>Any-Hit</li>
            <li>Closest-Hit</li>
            <li>Miss</li>
            <li>Callable</li>
          </ul>
        </div>
        <figure class="stages-timeline-media">
          <img src="/img/stages/ray-tracing.svg" alt="Rays traveling from a camera to a scene object and a light source" width="875" height="582" loading="lazy">
          <figcaption>Ray-tracing diagram by Henrik, via <a href="https://commons.wikimedia.org/wiki/File:Ray_trace_diagram.svg" target="_blank" rel="noopener">Wikimedia Commons</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">CC BY-SA 4.0</a></figcaption>
        </figure>
      </article>
    </div>
  </div>
</section>

<section class="section sponsors-home" aria-labelledby="sponsors-home-title">
  <div class="container">
    <div class="center sponsors-home-header">
      <p class="eyebrow"><span lang="en">SPONSORS</span></p>
      <h2 class="h-lg" id="sponsors-home-title">Sponsors help decide what comes next.</h2>
      <p class="lead">Yotsuba Shader is free for everyone. Sponsorship pays for the time that keeps it maintained, and gives you a say in where that time goes.</p>
    </div>
    <div class="grid grid-4 sponsors-home-grid">
      <article class="card sponsor-home-card">
        <div class="sponsor-home-media"><img src="/img/sponsors/roadmap.webp" alt="" width="960" height="540" loading="lazy"></div>
        <div class="sponsor-home-copy">
          <h3 class="card-title">Shape the roadmap</h3>
          <p class="card-body">Vote on which backend or integration comes next, and send feature ideas to <a href="mailto:sponsor-roadmap@yotsubashader.com">sponsor-roadmap@yotsubashader.com</a>. Every $50/month gives you 1 request per year.</p>
        </div>
      </article>
      <article class="card sponsor-home-card">
        <div class="sponsor-home-media"><img src="/img/sponsors/devlog.webp" alt="" width="960" height="540" loading="lazy"></div>
        <div class="sponsor-home-copy">
          <h3 class="card-title">Follow the work</h3>
          <p class="card-body">Get the sponsors-only devlog and a private channel to talk to me directly.</p>
        </div>
      </article>
      <article class="card sponsor-home-card">
        <div class="sponsor-home-media"><img src="/img/sponsors/visibility.webp" alt="" width="960" height="540" loading="lazy"></div>
        <div class="sponsor-home-copy">
          <h3 class="card-title">Get visibility</h3>
          <p class="card-body">Your name, link or logo on the Sponsors page, the README and the website, plus a mention in major release announcements.</p>
        </div>
      </article>
      <article class="card sponsor-home-card">
        <div class="sponsor-home-media"><img src="/img/sponsors/engine-integration.webp" alt="" width="960" height="540" loading="lazy"></div>
        <div class="sponsor-home-copy">
          <h3 class="card-title">Build it into your engine</h3>
          <p class="card-body">Partners get a dedicated integration session to bring Yotsuba Shader into their environment.</p>
        </div>
      </article>
    </div>
    <p class="sponsors-home-note">Sponsoring never unlocks features or changes the license. Everyone gets the same code.</p>
    <div class="sponsors-home-actions">
      <a class="btn btn-primary" href="https://github.com/sponsors/KMemphis" target="_blank" rel="noopener">Become a sponsor ${icon('external')}</a>
      <a class="btn btn-secondary" href="/donations/">See all tiers</a>
    </div>
  </div>
</section>

<section class="section section--home-value">
  <div class="container">
    <p class="center lead home-value-copy">
      Vertex, fragment and compute stages, described in plain C#. Your project's own vector, matrix and texture types become native GPU types, and your shaders can build on external libraries, so there is no second language to learn and no duplicated types: if you can write C#, you can write shaders.
    </p>
    <div class="home-value-grid">
      <a class="home-value-card" href="/playground/"><span class="home-value-kicker">Explore</span><strong>Try it in the Playground</strong><span>Start from working C# shader code.</span>${icon('arrow-right')}</a>
      <a class="home-value-card" href="/documentation/yotsuba-shader/shader-diagnostics-in-your-ide/"><span class="home-value-kicker">Validate</span><strong>Catch errors in your IDE</strong><span>See current validation limits and planned checks.</span>${icon('arrow-right')}</a>
      <a class="home-value-card" href="/technologies/spir-v/"><span class="home-value-kicker">Target</span><strong>Compile for every backend</strong><span>Use one shader source across graphics APIs.</span>${icon('arrow-right')}</a>
    </div>
  </div>
</section>

<section class="section section--rule">
  <div class="container">
    <div class="center" style="margin-bottom:36px">
      <h2 class="h-lg">One shader. Five ways to write it.</h2>
      <p class="lead">Five attribute vocabularies describe shader concepts in C#. Their intended output path is shared; complete lowering is in development, and WGSL output remains planned.</p>
    </div>
    ${styleTabs(STYLE_TRIANGLE)}
    <p class="center"><a class="link-more" href="/documentation/yotsuba-shader/choosing-a-syntax/">Choosing a syntax ${icon('chevron-right')}</a></p>
  </div>
</section>

<section class="section section--rule"><div class="container container--narrow">
<h2 class="h-lg">Shader diagnostics: planned</h2>
<p class="lead">The playground exposes C# diagnostics and shader discovery today. Shader-specific IDE diagnostics and backend compatibility analysis are planned.</p>
<p><a class="link-more" href="/documentation/yotsuba-shader/shader-diagnostics-in-your-ide/">Read the current validation status ${icon('chevron-right')}</a></p>
</div></section>

<section class="section section--rule"><div class="container container--narrow">
<h2 class="h-lg">Build integration: in development</h2>
<p class="lead">The existing generator builds the SPIR-V instruction table. A source generator that compiles your shaders, and a shader compilation CLI, are planned.</p>
<p><a class="link-more" href="/documentation/yotsuba-shader/generating-shader-binaries/">Explore current binary generation ${icon('chevron-right')}</a></p>
</div></section>

<section class="section section--rule">
  <div class="container feature">
    <div>
      <h2 class="h-lg">Every interface declared. Validated before the GPU.</h2>
      <p>Inputs, outputs, resources, locations, bindings and stages are written down with attributes, never inferred from naming conventions. That is what lets the compiler check a shader long before any driver sees it.</p>
      <ul class="checks">
        <li>${icon('check')}<span>Locations and built-in values on every stage boundary</span></li>
        <li>${icon('check')}<span>Uniforms, storage buffers, textures and samplers with explicit bindings</span></li>
        <li>${icon('check')}<span>Vertex, fragment and compute entry points in one C# class</span></li>
      </ul>
      <p class="mt-24"><a class="link-more" href="/documentation/yotsuba-shader/interface-slots-and-locations/">Interface slots and locations ${icon('chevron-right')}</a></p>
    </div>
    <div>${code('csharp', `using Microsoft.Xna.Framework;
using YotsubaShader.HlslSyntax;
using YotsubaShader.HlslSyntax.Resources;

public struct VertexOutput
{
    [SV_Position]
    public Vector4 Position;  // built-in

    [COLOR]
    public Vector4 Color;     // to the fragment
}

public sealed class Material
{
    [cbuffer, register(RegisterPrefix.b, 0)]
    public float Exposure;
}`, 'Interfaces.cs')}</div>
  </div>
</section>

<section class="section section--rule">
  <div class="container">
    <div class="center" style="margin-bottom:36px">
      <h2 class="h-lg">Everything a shader needs, in C#.</h2>
    </div>
    <div class="grid grid-4">
      ${cardLink({ href: '/documentation/yotsuba-shader/shader-stages/', icon: 'layers', title: 'Stages', body: 'Vertex, fragment and compute entry points with [ShaderStage].' })}
      ${cardLink({ href: '/documentation/yotsuba-shader/interface-slots-and-locations/', icon: 'list', title: 'Interfaces', body: 'Locations and built-in values across stage boundaries.' })}
      ${cardLink({ href: '/documentation/yotsuba-shader/uniforms-and-storage-buffers/', icon: 'box', title: 'Resources', body: 'Uniforms, storage buffers, textures and samplers.' })}
      ${cardLink({ href: '/documentation/yotsuba-shader/vectors-matrices-and-arrays/', icon: 'code', title: 'Native types', body: 'Scalars, vectors, matrices, arrays and structs.' })}
    </div>
  </div>
</section>

<section class="section section--rule">
  <div class="container feature feature--rev">
    <div>
      <h2 class="h-lg">Use your own types. Bring your own libraries.</h2>
      <p>Your shaders are part of your C# project, so they share its types. Mark the vectors, matrices and textures you already have with an attribute and they become native GPU types, with no parallel set of shader-only structs to keep in sync.</p>
      <ul class="checks">
        <li>${icon('check')}<span>Map your project's CPU types to native GPU types with attributes</span></li>
        <li>${icon('check')}<span>Build shaders on external libraries and NuGet packages</span></li>
        <li>${icon('check')}<span>One codebase for CPU and GPU: the same types on both sides</span></li>
      </ul>
      <p class="mt-24"><a class="link-more" href="/documentation/yotsuba-shader/reusing-your-types-and-libraries/">Reusing your types and libraries ${icon('chevron-right')}</a></p>
    </div>
    <div>${code('csharp', `// Your own type, as a GPU vector
[Vector]
public struct Vector3
{
    [VectorComponent(0)] public float X;
    [VectorComponent(1)] public float Y;
    [VectorComponent(2)] public float Z;
}

// ...and used directly by a shader
[ShaderStage(Stage.Vertex)]
public VertexOutput Vertex(
    Vector3 position) { /* ... */ }`, 'Types.cs')}</div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="banner">
      <h2>A portable shader library ecosystem for your framework or engine.</h2>
      <p>Shaders are ordinary C#, so a shader library is just a .NET library. Reuse your own types, use libraries from others, and share yours as a package on <a href="https://www.nuget.org/" rel="noopener">NuGet</a>, like any other C# code.</p>
      <code class="banner-code"><span class="tok-k">dotnet</span> add package Acme.Shaders.Lighting</code>
      <a class="link-more" href="/get-started/">Get started ${icon('chevron-right')}</a>
    </div>
  </div>
</section>

<section class="section section--rule">
  <div class="container">
    <div class="grid grid-3">
      ${cardLink({ href: '/community/licensing/', icon: 'scale', title: 'Open source', body: 'Free under the Microsoft Public License (MS-PL). Read the repository, build it, and contribute.' })}
      ${cardLink({ href: '/donations/', icon: 'heart', title: 'Support the project', body: 'Sponsorship keeps Yotsuba Shader maintained and free for everyone.' })}
      ${cardLink({ href: '/community/contributing/', icon: 'users', title: 'Join the community', body: 'Propose attributes, backends and shaders. Design changes start as an issue.' })}
    </div>
  </div>
</section>

<section class="cta">
  <div class="container">
    <h2 class="h-lg">Ready to write your first shader?</h2>
    <p class="lead" style="margin:16px auto 0">Build the repository, read the walkthrough, and see how a C# class becomes a shader stage.</p>
    <div class="hero-actions">
      <a class="btn btn-primary" href="/get-started/first-shader/">Your first shader ${icon('arrow-right')}</a>
      <a class="btn btn-secondary" href="${SITE.repo}" rel="noopener">${icon('github')} View on GitHub</a>
    </div>
  </div>
</section>`,
};

/* ------------------------------------------------------------ What's New */
const entry = (title, body, detail, link) => `
<section class="whatsnew">
  <div class="container">
    <h2>${title}</h2>
    <p class="body">${body}</p>
    ${detail ? `<div class="detail">${detail}</div>` : ''}
    ${link ? `<p class="mt-24"><a class="link-more" href="${link[1]}">${link[0]} ${icon('chevron-right')}</a></p>` : ''}
  </div>
</section>`;

const whatsNew = {
  path: '/whats-new/',
  section: 'home',
  title: "What's New",
  description: 'The latest updates to the Yotsuba Shader framework, compiler and related technologies.',
  scripts: ['/js/subscribe.js'],
  body: `
<section class="hero hero--compact">
  <div class="container">
    <h1 class="h-xl">What’s new in Yotsuba Shader</h1>
    <p class="lead">Explore the latest updates in the language, the compiler and related technologies.</p>
  </div>
  <hr class="hero-rule">
</section>

<section class="section" id="subscribe">
  <div class="container container--narrow">
    <div class="panel">
      <h2 class="h-md" style="margin-bottom:10px">Get every change</h2>
      <p class="card-body" style="margin:0 0 20px">Leave your email and you will get a note from ${SITE.newsEmail} when there is a new release or a notable change. Nothing else. Your address is kept in the project's contact list and used only for these updates, and you can reply "unsubscribe" at any time.</p>
      <form class="sub-form" id="sub-form" data-endpoint="${SITE.subscribeEndpoint}" novalidate>
        <label class="sub-label" for="sub-email">Email</label>
        <input id="sub-email" name="email" type="email" required autocomplete="email" placeholder="you@example.com">
        <input class="sub-trap" name="website" type="text" tabindex="-1" autocomplete="off" aria-hidden="true">
        <button class="btn btn-primary" type="submit">Subscribe</button>
      </form>
      <p class="sub-msg sub-msg--ok" id="sub-ok" role="status" hidden>Thanks! You are on the list.</p>
      <p class="sub-msg sub-msg--err" id="sub-err" role="alert" hidden>That did not work. Please check the address and try again, or write to ${SITE.email}.</p>
      <p class="don-note">No email? Follow the changes with a feed reader: <a href="${SITE.feedReleases}" rel="noopener">releases (Atom)</a> · <a href="${SITE.feedCommits}" rel="noopener">every change (Atom)</a>. On GitHub you can also choose Watch → Custom → Releases.</p>
    </div>
  </div>
</section>

${entry(
  'Shader errors in your IDE',
  'Live shader diagnostics and per-backend checks are planned. Current C# diagnostics are available through the playground.',
  `<p>The repository does not yet implement <code>YotsubaTargets</code> or a backend compatibility analyzer. See the documentation for the current API and planned workflows.</p>`,
  ['Shader diagnostics in your IDE', '/documentation/yotsuba-shader/shader-diagnostics-in-your-ide/'],
)}

${entry(
  'One package per syntax',
  'The HLSL, GLSL, MSL, SPIR-V and WGSL vocabularies are now separate packages: <code>YotsubaShader.HlslSyntax</code>, <code>YotsubaShader.GlslSyntax</code>, <code>YotsubaShader.MslSyntax</code>, <code>YotsubaShader.SpirvSyntax</code> and <code>YotsubaShader.WgslSyntax</code>.',
  `<p>Use <code>YotsubaShader.HlslSyntax</code> for HLSL attributes and <code>YotsubaShader.HlslSyntax.Resources</code> for resources. The numbered <code>Location</code> attribute belongs to <code>YotsubaShader.SpirvSyntax</code>. These are source projects; published NuGet availability is not established here.</p>`,
  ['Choosing a syntax', '/documentation/yotsuba-shader/choosing-a-syntax/'],
)}

${entry(
  'Do more with five syntaxes',
  'The HLSL, GLSL, MSL, SPIR-V and WGSL syntaxes now share the same semantic model. Choose the names your team knows; the compiler resolves them to the same IR built-ins.',
  `<p>The frontend maps <code>SV_Position</code>, <code>gl_Position</code>, <code>position</code>, <code>BuiltIn_Position</code> and <code>@builtin_position</code> to the same position slot, and does the same for the vertex index. Interface slots declared with <code>[Location(n)]</code> work in every syntax.</p>`,
  ['Choosing a syntax', '/documentation/yotsuba-shader/choosing-a-syntax/'],
)}

${entry(
  'Textures and samplers in the language',
  'Describe a texture precisely: dimension, component type, usage, depth, format, arrays and multisampling. Samplers get their own attribute.',
  `<p><code>TextureAttribute</code> takes a <code>TextureDimension</code> (<code>D1</code>, <code>D2</code>, <code>D3</code>, <code>Cube</code>) and <code>TextureComponentTypes</code> (<code>Float</code>, <code>Int</code>, <code>Uint</code>), with optional <code>Usage</code>, <code>Depth</code>, <code>Format</code>, <code>Arrayed</code> and <code>Multisampled</code> settings. The IR carries the same fields so each backend can lower them faithfully.</p>`,
  ['Textures and samplers', '/documentation/yotsuba-shader/textures-and-samplers/'],
)}

${entry(
  'Roslyn-based shader discovery',
  'The frontend finds your shaders by symbol, not by text, so aliases, <code>using</code> directives and long or short attribute names all just work.',
  `<p><code>ShaderDiscovery.Find</code> walks the types of your project, returns each class with its entry points in declaration order, and exposes parameters and return types to the rest of the compiler. A test suite covers discovery and analysis.</p>`,
  ['Shader discovery', '/documentation/yotsuba-shader/shader-discovery/'],
)}

${entry(
  'Resource attributes for every syntax',
  'Uniform buffers, storage buffers, textures, samplers and binding slots are available in each syntax.',
  `<p>Each syntax has its own resource attributes. SPIR-V uses separate <code>DescriptorSet(n)</code> and <code>Binding(n)</code>; its <code>StorageBuffer</code> marker has no access-mode property.</p>`,
  ['Uniforms and storage buffers', '/documentation/yotsuba-shader/uniforms-and-storage-buffers/'],
)}

${entry(
  'Stricter vector and matrix declarations',
  'Vector types declare their components with attributes, and invalid declarations fail with clear exceptions.',
  `<p>Mixing component types in one vector throws <code>InconsistentVectorComponentTypeException</code>; an unsupported component type throws <code>VectorComponentTypeNotValidException</code>. Matrices declare columns with <code>[MatrixColumn]</code>.</p>`,
  ['Vectors, matrices and arrays', '/documentation/yotsuba-shader/vectors-matrices-and-arrays/'],
)}

${entry(
  'SPIR-V 1.6 module construction',
  'Build modules explicitly with <code>SpirVModule</code> and encode them to a valid binary with <code>SpirVCompiler</code>.',
  `<p>The operation table is generated from the official Khronos grammar, so every instruction, capability, execution model and decoration is available as a typed value.</p>`,
  ['Building SPIR-V modules', '/documentation/yotsuba-shader/building-spirv-modules/'],
)}

${entry(
  'Free and open source under the MS-PL',
  'Yotsuba Shader is released under the Microsoft Public License (MS-PL): use it in any project, commercial or not, with no fee.',
  `<p>That includes proprietary game engines, frameworks and editors. The shaders you write and the binaries generated from them are yours.</p>`,
  ['Licensing', '/community/licensing/'],
)}`,
};

/* -------------------------------------------------------------- Resources */
const res = (title, body, href) =>
  `<a class="card card--link" href="${href}"${href.startsWith('http') ? ' rel="noopener" target="_blank"' : ''}>
  <span class="card-title">${title} ${href.startsWith('http') ? icon('external') : ''}</span>
  <span class="card-body">${body}</span>
</a>`;

const resources = {
  path: '/resources/',
  section: 'home',
  title: 'Resources',
  description: 'Repository, specifications and tools related to Yotsuba Shader.',
  body: `
<section class="hero hero--compact">
  <div class="container">
    <h1 class="h-xl">Resources</h1>
    <p class="lead">Everything you need to work with Yotsuba Shader: the repository, the specifications behind each backend, and the tools around SPIR-V.</p>
  </div>
</section>
<section class="section">
  <div class="container">
    <h2 class="h-md">Project</h2>
    <div class="grid grid-3 mt-24">
      ${res('GitHub repository', 'Source code, issues and the README with the full authoring examples.', SITE.repo)}
      ${res('Documentation', 'Articles and reference for the language, the compiler and the intermediate representation.', '/documentation/')}
      ${res('Get started', 'Install the SDK, build the solution and read your first shader.', '/get-started/')}
    </div>

    <h2 class="h-md" style="margin-top:56px">Guides</h2>
    <div class="grid grid-3 mt-24">
      ${res('Types for engines and frameworks', 'Current type annotations and integration limits.', '/documentation/yotsuba-shader/types-for-engines-and-frameworks/')}
      ${res('Current attribute reference', 'Attribute declarations read from the current source projects.', '/documentation/yotsuba-shader/builtin-values-across-syntaxes/')}
      ${res('Current validation status', 'Implemented checks and planned backend diagnostics.', '/documentation/yotsuba-shader/shader-diagnostics-in-your-ide/')}
    </div>

    <h2 class="h-md" style="margin-top:56px">Specifications</h2>
    <div class="grid grid-3 mt-24">
      ${res('SPIR-V specification', 'The Khronos binary intermediate language that Yotsuba Shader emits.', 'https://registry.khronos.org/SPIR-V/')}
      ${res('Vulkan', 'The Khronos graphics API that consumes SPIR-V directly.', 'https://www.vulkan.org/')}
      ${res('Metal', 'Apple’s graphics and compute framework, and its shading language.', 'https://developer.apple.com/metal/')}
      ${res('WGSL specification', 'The WebGPU Shading Language, from the W3C.', 'https://www.w3.org/TR/WGSL/')}
      ${res('HLSL reference', 'Microsoft documentation for the High-Level Shader Language.', 'https://learn.microsoft.com/windows/win32/direct3dhlsl/dx-graphics-hlsl')}
      ${res('GLSL specification', 'The OpenGL Shading Language specification from Khronos.', 'https://registry.khronos.org/OpenGL/specs/gl/GLSLangSpec.4.60.pdf')}
    </div>

    <h2 class="h-md" style="margin-top:56px">Tools</h2>
    <div class="grid grid-3 mt-24">
      ${res('SPIRV-Tools', 'Validate and disassemble modules with <code>spirv-val</code> and <code>spirv-dis</code>.', 'https://github.com/KhronosGroup/SPIRV-Tools')}
      ${res('.NET 8 SDK', 'Required to build the solution.', 'https://dotnet.microsoft.com/download/dotnet/8.0')}
      ${res('Roslyn', 'The .NET compiler platform that powers shader discovery and analysis.', 'https://github.com/dotnet/roslyn')}
    </div>
  </div>
</section>`,
};

export default [home, whatsNew, resources];

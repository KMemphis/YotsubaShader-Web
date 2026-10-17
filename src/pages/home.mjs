import { icon, code, styleTabs, cardLink, wordmark } from '../components.mjs';
import { STYLE_TRIANGLE, GEN_CSPROJ, GEN_OUTPUT, GEN_USE, CLI_SNIPPET } from '../snippets.mjs';
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
    <div class="film" data-film>
      <video class="film-video" preload="none" playsinline poster="/video/poster-__FILM_LANG__.webp" aria-label="Yotsuba Shader introduction film">
        <source src="/video/promo-__FILM_LANG__-2160.mp4" media="(min-width: 1700px)" type="video/mp4">
        <source src="/video/promo-__FILM_LANG__-1080.mp4" type="video/mp4">
      </video>
      <button class="film-play" type="button"><span class="film-ico">${'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" fill="currentColor"/></svg>'}</span><span>Watch the film</span></button>
    </div>
    <h1 class="h-xl">Write shaders in C#.</h1>
    <p class="lead">Yotsuba Shader is a shader framework and compiler for C#. Write shaders with the types from your own project and the libraries you already use, then compile for the backend you choose.</p>
  </div>
  <hr class="hero-rule">
</section>

<section class="section">
  <div class="container">
    <div class="card card--wide">
      <div class="cw-brand">
        <img class="cw-mark" src="/img/yotsuba-shader.webp" alt="" loading="lazy">
        <div class="cw-name">${wordmark({ size: 'card', mark: false })}</div>
      </div>
      <div class="cw-copy">
        <h2 class="card-title">Write your Shaders in C#</h2>
        <p class="card-body">Write your shaders in C#. Yotsuba Shader compiles them into SPIR-V, and many other formats, to target every graphics backend.</p>
        <a class="btn btn-primary" href="/playground/">Try Playground ${icon('arrow-right')}</a>
      </div>
    </div>
    <p class="center lead mt-48" style="max-width:820px;margin-inline:auto;font-size:19px">
      Vertex, fragment and compute stages, described in plain C#. Your project's own vector, matrix and texture types become native GPU types, and your shaders can build on external libraries, so there is no second language to learn and no duplicated types: if you can write C#, you can write shaders.
    </p>
    <div class="hero-actions">
      <a class="btn btn-primary" href="/get-started/">Get started</a>
      <a class="btn btn-secondary" href="/documentation/">Read the documentation</a>
    </div>
  </div>
</section>

<section class="section section--rule">
  <div class="container">
    <div class="center" style="margin-bottom:36px">
      <h2 class="h-lg">One shader. Five ways to write it.</h2>
      <p class="lead">You can write the same shader using the names of HLSL, GLSL, Metal, Vulkan or WGSL. Choose the one you already know. The result is the same.</p>
    </div>
    ${styleTabs(STYLE_TRIANGLE)}
    <p class="center"><a class="link-more" href="/documentation/yotsuba-shader/choosing-an-authoring-style/">Choosing an authoring style ${icon('chevron-right')}</a></p>
  </div>
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

<section class="section section--rule">
  <div class="container">
    <div class="center" style="margin-bottom:40px">
      <h2 class="h-lg">Generate it where you already work.</h2>
      <p class="lead">Two ways to get the binary for each platform into your project. The first one needs nothing but a build.</p>
    </div>

    <div class="gen-main">
      <div class="gen-copy">
        <h3>A source generator, at build time.</h3>
        <p>Add one package and mark your shader class <code>partial</code>. When you build, Yotsuba Shader compiles every <code>[ShaderStage]</code> method and writes <strong>every binary you ask for</strong> into that class, with the reflection to use them. The shaders ship inside your assembly, and shader errors show up as compiler errors.</p>
        <ul class="checks">
          <li>${icon('check')}<span>No files to copy and no extra step in your pipeline</span></li>
          <li>${icon('check')}<span>Every format you ask for: SPIR-V, HLSL, MSL, WGSL, GLSL, GLSL ES</span></li>
          <li>${icon('check')}<span>The same two fields on every shader, so engines can read any of them</span></li>
        </ul>
        <p class="mt-24"><a class="link-more" href="/documentation/yotsuba-shader/generating-shader-binaries/">How it works ${icon('chevron-right')}</a></p>
      </div>
      <div class="gen-code">
        ${code('xml', GEN_CSPROJ, 'YourGame.csproj')}
        ${code('csharp', GEN_OUTPUT, 'Triangle.g.cs')}
        ${code('csharp', GEN_USE, 'Renderer.cs')}
      </div>
    </div>

    <div class="panel panel--wide mt-24">
      <div>
        <h3 class="h-md" style="margin:14px 0 10px">Command line</h3>
        <p class="card-body" style="margin:0">For CI, content pipelines and build scripts. Pass it your <code>.csproj</code> and get one <code>.spv</code> per entry point.</p>
      </div>
      <div>${code('bash', CLI_SNIPPET, 'Terminal')}</div>
    </div>
  </div>
</section>

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
    <div>${code('csharp', `public struct VertexOutput
{
    [SV_Position]
    public Vector4 Position;  // built-in

    [Location(0)]
    public Vector4 Color;     // to the fragment
}

public sealed class Material
{
    [Uniform]
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
      ${cardLink({ href: '/community/licensing/', icon: 'scale', title: 'Open source', body: 'Free under the MIT License. Read the repository, build it, and contribute.' })}
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
  'Do more with five authoring styles',
  'HLSL, GLSL, Metal, Vulkan and WGSL vocabularies now share the same semantic model. Choose the names your team knows; the compiler resolves them to the same IR built-ins.',
  `<p>The frontend maps <code>SV_Position</code>, <code>gl_Position</code>, <code>position</code>, <code>BuiltIn_Position</code> and <code>@builtin_position</code> to the same position slot, and does the same for the vertex index. Interface slots declared with <code>[Location(n)]</code> work in every style.</p>`,
  ['Choosing an authoring style', '/documentation/yotsuba-shader/choosing-an-authoring-style/'],
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
  'Resource attributes for every style',
  'Uniform buffers, storage buffers, textures, samplers and binding slots are available in each vocabulary.',
  `<p>From <code>cbuffer</code> and <code>register</code> to <code>layout(set, binding)</code>, <code>buffer(n)</code>, <code>DescriptorSet</code> and <code>@group</code>/<code>@binding</code>, plus shared <code>[Uniform]</code> and <code>[StorageBuffer]</code> attributes with a <code>ResourceAccess</code> mode.</p>`,
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
  'Free and open source under the MIT License',
  'Yotsuba Shader is released under the MIT License: use it in any project, commercial or not, with no fee.',
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
      ${res('Integrating Yotsuba Shader into your engine (PDF)', 'A step-by-step guide for engine and framework authors: types, resources, compilation, typed parameters, loading, tests and packaging.', '/downloads/yotsuba-shader-engine-guide-__FILM_LANG__.pdf')}
      ${res('Editable source of the guide', 'The guide is written in Typst. Edit it, translate it or adapt it to your engine. It includes both editions and every code listing.', '/downloads/yotsuba-shader-engine-guide-source.zip')}
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

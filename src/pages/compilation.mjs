import { code } from '../components.mjs';
import { BASIC_COLOR } from '../snippets.mjs';

const outputs = [
  ['GLSL ES', 'Android · OpenGL ES · WebGL', 'Portable shader source for OpenGL ES applications on Android and for WebGL.', '/img/compilation/glsles.webp'],
  ['GLSL', 'OpenGL', 'Shader source for an OpenGL rendering pipeline.', '/img/compilation/glsl.webp'],
  ['MSL', 'Metal', 'Metal Shading Language source for Apple platforms.', '/img/compilation/msl.webp'],
  ['HLSL', 'Direct3D 11 / 12', 'Shader source to compile with a Direct3D shader compiler such as DXC.', '/img/compilation/hlsl.webp'],
  ['WGSL', 'WebGPU', 'Planned for 2027. WGSL output is not available yet.', '/img/compilation/wgsl.webp'],
];

const steps = [
  ['01', 'C# shader code', 'Your types, functions, and shader logic.', '/img/sponsors/devlog.webp'],
  ['02', 'Yotsuba Shader', 'Roslyn analysis → Yotsuba IR → SPIR-V generation.', '/img/compilation/compiler.webp', '/img/yotsuba-shader.webp'],
  ['03', 'SPIR-V', 'A binary shader module shared by the output paths.', '/img/backends/spirv.svg'],
  ['04', 'Yotsuba ShaderCross', 'Translate the SPIR-V module into the target shader language.', '/img/compilation/shadercross.webp', '/img/yotsuba-shadercross.webp'],
];

export default [{
  path: '/technologies/compilation/',
  section: 'technologies',
  title: 'Compilation process',
  description: 'Follow a C# shader through Yotsuba Shader, SPIR-V, and Yotsuba ShaderCross to its target shader language.',
  body: `
<section class="hero hero--compact compilation-hero">
  <div class="container">
    <p class="eyebrow">COMPILATION PROCESS</p>
    <h1 class="h-xl">One shader.<br>From C# to your graphics API.</h1>
    <p class="lead">Write your shader logic in C#. Yotsuba Shader produces SPIR-V, then Yotsuba ShaderCross translates it into the shader language your application needs.</p>
    <a class="compilation-text-link" href="/syntaxes/">Explore the C# authoring syntaxes →</a>
  </div>
</section>

<section class="section compilation-section">
  <div class="container">
    <h2 class="h-lg">The compilation journey</h2>
    <p class="compilation-intro">Lighting, procedural patterns, texture sampling, and reusable functions start in the same C# project. The compiler works with the supported shader subset of C#.</p>
    <ol class="compilation-flow">
      ${steps.map(([n, title, detail, image, logo]) => `<li class="compilation-step"><div class="compilation-card-media${image.endsWith('.svg') ? ' compilation-card-media--brand' : ''}"><img src="${image}" alt="" width="800" height="500" loading="lazy" decoding="async">${logo ? `<img class="compilation-product-logo" src="${logo}" alt="" width="1024" height="1024" loading="lazy" decoding="async">` : ''}</div><div class="compilation-step-copy"><span class="compilation-number" aria-hidden="true">${n}</span><h3>${title}</h3><p>${detail}</p></div></li>`).join('')}
    </ol>
    <div class="compilation-branch" aria-hidden="true">↓</div>
    <h3 class="compilation-output-heading">Choose the output language</h3>
    <div class="compilation-outputs">
      ${outputs.map(([format, api, detail, image]) => `<article class="compilation-output${format === 'WGSL' ? ' compilation-output--planned' : ''}"><div class="compilation-card-media"><img src="${image}" alt="" width="800" height="500" loading="lazy" decoding="async"></div><div class="compilation-output-copy"><div class="compilation-output-title"><h4>${format}</h4>${format === 'WGSL' ? '<span class="compilation-badge">Planned</span>' : ''}</div><p class="compilation-api">${api}</p><p>${detail}</p></div></article>`).join('')}
    </div>
    <p class="compilation-imagery-note">Illustrative imagery by independent photographers and 3D artists.</p>
    <p class="compilation-status"><strong>In development.</strong> This diagram describes the intended compilation pipeline. The complete C# → IR → SPIR-V path is still being assembled. WGSL output is planned for 2027.</p>
  </div>
</section>

<section class="section compilation-details">
  <div class="container">
    <div class="compilation-detail">
      <div><p class="eyebrow">YOTSUBA SHADER</p><h2 class="h-lg">Start with the shader you want to write.</h2><p>The vertex stage receives a position and color, converts the position to homogeneous clip-space coordinates, and passes the color to the fragment stage. The fragment stage returns the interpolated color.</p><p class="compilation-caption">This example contains the shader code for both stages. The application configures the graphics pipeline, supplies vertex data, and issues draw calls.</p></div>
      ${code('csharp', BASIC_COLOR, 'BasicColorShader.cs')}
    </div>
    <div class="compilation-detail compilation-detail--text">
      <div><p class="eyebrow">SPIR-V</p><h2 class="h-lg">One intermediate module.</h2><p>SPIR-V stores shader instructions, types, entry points, and resource bindings in a binary module. A Vulkan application can use a compatible module directly; other output paths pass it to Yotsuba ShaderCross.</p></div>
      <div><p class="eyebrow">YOTSUBA SHADERCROSS</p><h2 class="h-lg">Generate the source for your target.</h2><p>ShaderCross reads SPIR-V and emits GLSL ES, GLSL, MSL, or HLSL source. WGSL is a planned output. Your engine or graphics API then compiles the generated source as required by the target platform.</p><p>Android is a platform, not a shader format: use GLSL ES for an OpenGL ES renderer, or SPIR-V for a Vulkan renderer. WebGL uses GLSL ES; WebGPU uses WGSL.</p></div>
    </div>
  </div>
</section>`,
}];

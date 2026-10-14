import { icon, code, table, note, cardLink } from '../components.mjs';
import { BASIC_COLOR, GEN_USE } from '../snippets.mjs';
import { SITE } from '../site.mjs';

const overview = {
  path: '/get-started/',
  section: 'get-started',
  title: 'Get Started',
  description: 'Add Yotsuba Shader to your .NET project, write your first C# shader and build it.',
  body: `
<section class="hero hero--compact">
  <div class="container">
    <h1 class="h-xl">Get started with Yotsuba Shader</h1>
    <p class="lead">Add the package, write a shader in C# and build your project. It takes a few minutes.</p>
    <div class="hero-actions">
      <a class="btn btn-primary" href="/get-started/first-shader/">Your first shader ${icon('arrow-right')}</a>
      <a class="btn btn-secondary" href="/get-started/build-from-source/">Build from source</a>
    </div>
  </div>
  <hr class="hero-rule">
</section>

<section class="section">
  <div class="container container--narrow">
    <h2 class="h-lg">Before you begin</h2>
    <p class="lead mt-24">Yotsuba Shader is a NuGet package for any .NET 8 project. You can also build it from source.</p>
    ${table(
      ['Requirement', 'Details'],
      [
        ['<strong>.NET 8 SDK</strong>', 'The solution targets <code>net8.0</code>; <code>global.json</code> asks for SDK 8.0 and rolls forward to the latest minor version.'],
        ['<strong>Operating system</strong>', 'macOS, Linux or Windows with a compatible SDK.'],
        ['<strong>Git</strong>', 'To clone the repository.'],
        ['<strong>SPIRV-Tools</strong> <span class="muted">(optional)</span>', 'Provides <code>spirv-val</code> to validate generated modules.'],
      ],
    )}
  </div>
</section>

<section class="section section--rule">
  <div class="container container--narrow">
    <h2 class="h-lg">Four steps</h2>
    <ol class="steps mt-32">
      <li><div><h3>Add the package</h3><p>Reference the source generator from your project.</p>${code('bash', 'dotnet add package YotsubaShader.SourceGenerator')}</div></li>
      <li><div><h3>Write a shader</h3><p>Mark a class <code>partial</code> and add <code>[ShaderStage]</code> methods, with the types you already use.</p><a class="link-more" href="/get-started/first-shader/">Your first shader ${icon('chevron-right')}</a></div></li>
      <li><div><h3>Build</h3><p>Every stage is compiled during the build, and the binaries and their reflection are added to your class.</p>${code('bash', 'dotnet build')}</div></li>
      <li><div><h3>Use it</h3><p>Read the binary for your graphics API from the class.</p>${code('csharp', GEN_USE, 'Renderer.cs')}</div></li>
    </ol>
  </div>
</section>

<section class="section section--rule">
  <div class="container">
    <h2 class="h-lg center">Where to go next</h2>
    <div class="grid grid-3 mt-48">
      ${cardLink({ href: '/documentation/yotsuba-shader/understanding-yotsuba-shader/', icon: 'book', title: 'Understand the model', body: 'The language, the IR and the compiler stages in one article.' })}
      ${cardLink({ href: '/documentation/yotsuba-shader/choosing-an-authoring-style/', icon: 'braces', title: 'Pick an authoring style', body: 'HLSL, GLSL, Metal, Vulkan or WGSL vocabulary. Same semantics.' })}
      ${cardLink({ href: '/technologies/', icon: 'layers', title: 'See the technologies', body: 'The language, the Roslyn frontend, the IR and the SPIR-V compiler.' })}
    </div>
  </div>
</section>`,
};

const firstShader = {
  path: '/get-started/first-shader/',
  section: 'get-started',
  title: 'Your First Shader',
  description: 'A complete vertex and fragment shader in C#, explained attribute by attribute.',
  body: `
<section class="hero hero--compact">
  <div class="container">
    <h1 class="h-xl">Your first shader</h1>
    <p class="lead">A color shader in C#: the vertex stage receives a position and a color per vertex, passes the color along, and the fragment stage returns it.</p>
  </div>
  <hr class="hero-rule">
</section>

<section class="section">
  <div class="container container--narrow prose">
    <p>The HLSL-like style is a good place to start because the relationship between stages, inputs, position and fragment color is easy to see.</p>
    ${code('csharp', BASIC_COLOR, 'BasicColorShader.cs')}
    <h2>What each piece does</h2>
    <ul>
      <li><code>VertexInput</code> defines the data supplied by the engine.</li>
      <li><code>[Location(0)]</code> and <code>[Location(1)]</code> identify the pipeline inputs: position and color.</li>
      <li><code>VertexOutput</code> defines what the vertex shader passes to the next stage.</li>
      <li><code>[SV_Position]</code> marks the position required by the GPU.</li>
      <li><code>[ShaderStage]</code> identifies the vertex and fragment stages.</li>
      <li>The second <code>[Location(0)]</code> carries the color between those stages.</li>
    </ul>
    ${note('note', 'An HLSL-like style does not require an HLSL target. These are C# authoring choices; the compilation target is selected separately.')}
    <h2>What the compiler sees</h2>
    <p>The compiler starts by finding <code>BasicColorShader</code>, because two of its methods have <code>[ShaderStage]</code>. For each one it reads which stage it is, what it receives and what it returns.</p>
    <p>The attributes tell it what each piece of data is for: <code>[Location(n)]</code> marks what passes from one stage to the next, and <code>[SV_Position]</code> marks the position where the vertex is drawn. You can write the same shader with <code>[gl_Position]</code>, <code>[position]</code>, <code>[BuiltIn_Position]</code> or <code>[@builtin_position]</code>, and the compiler understands it the same way.</p>
    <h2>Grow it</h2>
    <p>The same class can grow to include uniforms, textures, buffers and other stages. Add a <code>[Uniform]</code> field for per-frame data, or a <code>[ShaderStage(Stage.Compute)]</code> method for GPU compute.</p>
    <p><a class="link-more" href="/documentation/yotsuba-shader/writing-your-first-shader/">Read the full article ${icon('chevron-right')}</a></p>
  </div>
</section>`,
};

const build = {
  path: '/get-started/build-from-source/',
  section: 'get-started',
  title: 'Build from Source',
  description: 'Build and test the Yotsuba Shader solution and understand how the projects fit together.',
  body: `
<section class="hero hero--compact">
  <div class="container">
    <h1 class="h-xl">Build from source</h1>
    <p class="lead">Build the solution, run the tests and validate the SPIR-V module the example produces.</p>
  </div>
  <hr class="hero-rule">
</section>

<section class="section">
  <div class="container container--narrow prose">
    <h2>Build</h2>
    ${code('bash', 'dotnet build YotsubaShader.sln')}
    <h2>Run the example</h2>
    <p>The example project assembles a fragment-shader module instruction by instruction with <code>SpirVModule</code> and encodes it with <code>SpirVCompiler</code>.</p>
    ${code('bash', 'dotnet run --project YotsubaShader.Example/YotsubaShader.Example.csproj')}
    <p>This creates <code>mi modulo spirv.spv</code> in the working directory.</p>
    <h2>Validate the module</h2>
    <p>If you have SPIRV-Tools installed, validate and disassemble the output:</p>
    ${code('bash', `spirv-val "mi modulo spirv.spv"
spirv-dis "mi modulo spirv.spv"`)}
    <h2>Run the tests</h2>
    <p>The frontend test project covers shader discovery and analysis.</p>
    ${code('bash', 'dotnet test YotsubaShader.Frontend.Tests')}
    <h2>Repository architecture</h2>
    ${table(
      ['Project', 'Role'],
      [
        ['<code>YotsubaShader.Language</code>', 'Authoring layer: stages, attributes, resources and the types you map to the GPU.'],
        ['<code>YotsubaShader.Frontend</code>', 'Discovery and semantic analysis of C# shaders.'],
        ['<code>YotsubaShader.IR</code>', 'Shared model between the frontend and backends.'],
        ['<code>YotsubaShader.Compiler</code>', 'SPIR-V module construction and encoding.'],
        ['<code>YotsubaShader.Generator</code>', 'SPIR-V operation table generated from the Khronos grammar.'],
        ['<code>YotsubaShader.Example</code>', 'Executable example of low-level SPIR-V assembly.'],
        ['<code>YotsubaShader.Frontend.Tests</code>', 'Frontend discovery and analysis tests.'],
      ],
    )}
    ${note('tip', 'Changing the compiler or the language? Open an issue first with your proposal and a motivating shader. See <a href="/community/contributing/">Contributing</a>.')}
  </div>
</section>`,
};

export default [overview, firstShader, build];

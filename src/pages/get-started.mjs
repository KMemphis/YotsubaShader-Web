import { icon, code, table, note, cardLink } from '../components.mjs';
import { BASIC_COLOR } from '../snippets.mjs';
import { SITE } from '../site.mjs';

const overview = {
  path: '/get-started/',
  section: 'get-started',
  title: 'Get Started',
  description: 'Explore the pre-release authoring API and build the current source checkout.',
  body: `
<section class="hero hero--compact">
  <div class="container">
    <h1 class="h-xl">Get started with Yotsuba Shader</h1>
    <p class="lead">Explore C# shader declarations and the current compiler components.</p>
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
    <p class="lead mt-24">The source projects target .NET 8. This checkout does not establish the availability of a published, production-ready NuGet package.</p>
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

<section class="section section--rule section--flush-top">
  <div class="container container--narrow">
    <h2 class="h-lg">Explore the current API</h2>
    <p>Start with the source checkout, its authoring examples, and shader discovery. Complete shader compilation, build-time shader generation, and engine adapters are still in development.</p>
    <a class="link-more" href="/get-started/build-from-source/">Build from source ${icon('chevron-right')}</a>
  </div>
</section>

<section class="section section--rule">
  <div class="container">
    <h2 class="h-lg center">Where to go next</h2>
    <div class="grid grid-3 mt-48">
      ${cardLink({ href: '/documentation/yotsuba-shader/understanding-yotsuba-shader/', icon: 'book', title: 'Understand the model', body: 'The language, the IR and the compiler stages in one article.' })}
      ${cardLink({ href: '/documentation/yotsuba-shader/choosing-a-syntax/', icon: 'braces', title: 'Pick a syntax', body: 'HLSL, GLSL, MSL, SPIR-V or WGSL syntax. Same semantics.' })}
      ${cardLink({ href: '/documentation/yotsuba-shader/shader-diagnostics-in-your-ide/', icon: 'check', title: 'See errors in your IDE', body: 'Current validation limits and planned shader diagnostics.' })}
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
    <p>The HLSL syntax is a good place to start because the relationship between stages, inputs, position and fragment color is easy to see.</p>
    ${code('csharp', BASIC_COLOR, 'BasicColorShader.cs')}
    <h2>What each piece does</h2>
    <ul>
      <li><code>VertexInput</code> defines the data supplied by the engine.</li>
      <li><code>[POSITION]</code> and <code>[COLOR]</code> identify the vertex inputs.</li>
      <li><code>VertexOutput</code> defines what the vertex shader passes to the next stage.</li>
      <li><code>[SV_Position]</code> marks the position required by the GPU.</li>
      <li><code>[ShaderStage]</code> identifies the vertex and fragment stages.</li>
      <li><code>[COLOR]</code> carries color between the stages; <code>[return: SV_Target(0)]</code> identifies the fragment color output.</li>
    </ul>
    ${note('note', 'The HLSL syntax does not require an HLSL target. These are C# authoring choices; the compilation targets are selected separately.')}
    <h2>What the compiler sees</h2>
    <p>The compiler starts by finding <code>BasicColorShader</code>, because two of its methods have <code>[ShaderStage]</code>. For each one it reads which stage it is, what it receives and what it returns.</p>
    <p>The attributes describe user semantics and built-ins. <code>[Location(n)]</code> is available separately from <code>YotsubaShader.SpirvSyntax</code>. Syntax declarations cover more concepts than the current processor can lower.</p>
    <h2>Grow it</h2>
    <p>Resources use the namespace of the chosen syntax, for example <code>YotsubaShader.SpirvSyntax.Resources</code>. Compute declarations exist, while complete shader body compilation remains unfinished.</p>
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
        ['<code>YotsubaShader.Roslyn</code>', 'Discovery and semantic analysis of C# shaders.'],
        ['<code>YotsubaShader.IR</code>', 'Shared model between the frontend and backends.'],
        ['<code>YotsubaShader.Compiler.SpirV</code>', 'SPIR-V module construction and encoding.'],
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

import { icon, code, table, note, cardLink } from '../components.mjs';
import { SYNTAX_META } from '../reference.mjs';
import { BACKENDS, SPIRV_LOGO } from '../backends.mjs';

const HOW = {
  vulkan: 'Compiler output',
  d3d: '<code>CompilerHLSL</code> (YotsubaShaderCross); compile the resulting HLSL with a target compiler',
  metal: '<code>CompilerMSL</code> (YotsubaShaderCross)',
  webgpu: 'Planned for 2027; no WGSL emitter is implemented',
  opengl: '<code>CompilerGLSL</code> (YotsubaShaderCross)',
  webgl: '<code>CompilerGLSL</code> with <code>options.es = true</code>',
};

export default function technologies(ctx) {
  const counts = Object.fromEntries(Object.entries(ctx.syntaxes).map(([k, v]) => [k, v.total]));
  const totalAttrs = Object.values(counts).reduce((a, b) => a + b, 0);

  const overview = {
    path: '/technologies/',
    section: 'technologies',
    title: 'Technologies',
    description: 'The language, frontend, intermediate representation and SPIR-V compiler behind Yotsuba Shader.',
    body: `
<section class="hero hero--compact">
  <div class="container">
    <h1 class="h-xl">Modern technologies, one pipeline.</h1>
    <p class="lead">Yotsuba Shader is built from four layers: a C# shader framework, a Roslyn frontend, a shared intermediate representation and a SPIR-V compiler.</p>
  </div>
  <hr class="hero-rule">
</section>

<section class="section">
  <div class="container">
    <div class="grid grid-2">
      ${cardLink({ href: '/technologies/language/', icon: 'braces', title: 'Language', body: 'Stages, interface slots, resources and native types, described with C# attributes in five vocabularies.' })}
      ${cardLink({ href: '/technologies/compiler/', icon: 'search', title: 'Compiler', body: 'A Roslyn-based frontend discovers shaders by symbol and analyses entry points, parameters and types.' })}
      ${cardLink({ href: '/technologies/intermediate-representation/', icon: 'layers', title: 'Intermediate Representation', body: 'A backend-neutral model of shaders, functions, storage kinds, interface slots and types.' })}
      ${cardLink({ href: '/technologies/spir-v/', icon: 'cpu', title: 'SPIR-V', body: 'Typed module construction and binary encoding of SPIR-V 1.6, with an operation table generated from the Khronos grammar.' })}
    </div>

    <h2 class="h-lg center" style="margin-top:96px">From C# to a binary module</h2>
    <div class="pipeline" role="list">
      <div class="pipe-step" role="listitem"><span class="pipe-ico">${icon('code')}</span><b>Language</b><span><code>YotsubaShader.Language</code></span></div>
      <div class="pipe-step" role="listitem"><span class="pipe-ico">${icon('search')}</span><b>Frontend</b><span><code>YotsubaShader.Roslyn</code></span></div>
      <div class="pipe-step" role="listitem"><span class="pipe-ico">${icon('layers')}</span><b>IR</b><span><code>YotsubaShader.IR</code></span></div>
      <div class="pipe-step" role="listitem"><span class="pipe-ico">${icon('cpu')}</span><b>Compiler</b><span><code>YotsubaShader.Compiler.SpirV</code></span></div>
      <div class="pipe-step" role="listitem"><span class="pipe-ico">${icon('box')}</span><b>SPIR-V module</b><span><code>.spv</code></span></div>
    </div>
    <p class="pipeline-note">Each stage is its own project, so a backend can be added without touching how shaders are written.</p>
  </div>
</section>`,
  };

  const language = {
    path: '/technologies/language/',
    section: 'technologies',
    title: 'Language',
    description: 'The Yotsuba Shader framework: stages, attributes, resources, native types and your own project types in C#.',
    body: `
<section class="hero hero--compact">
  <div class="container">
    <h1 class="h-xl">Language</h1>
    <p class="lead">Shaders are ordinary C# classes. Attributes describe what the GPU needs to know: stages, interface slots, resources and native types.</p>
  </div>
  <hr class="hero-rule">
</section>
<section class="section">
  <div class="container container--narrow prose">
    <h2>Stages</h2>
    <p>A method becomes a pipeline stage with <code>[ShaderStage]</code>. The <code>Stage</code> enum has three values: <code>Vertex</code>, <code>Fragment</code> and <code>Compute</code>.</p>
    ${code('csharp', `[ShaderStage(Stage.Vertex)]
public VertexOutput Vertex(VertexInput input) { /* ... */ }

[ShaderStage(Stage.Fragment)]
public Vector4 Fragment(VertexOutput input) => input.Color;`)}
    <h2>Interface slots</h2>
    <p><code>[Location(n)]</code> marks input and output fields or properties. Built-in values (position, vertex index, global invocation id and many more) are expressed with the attribute vocabulary of your chosen syntax.</p>
    <h2>Resources</h2>
    <p>Resources are declared in each syntax namespace. For SPIR-V use <code>[Uniform]</code> or <code>[StorageBuffer]</code> with separate <code>[DescriptorSet(n)]</code> and <code>[Binding(n)]</code>. The current attributes have no <code>ResourceAccess</code> property.</p>
    <h2>Your types, mapped to the GPU</h2>
    <p>Shaders live inside your C# project, so they use its types. Attributes map the vectors, matrices and textures you already have to native GPU types, and your shaders can build on external libraries and NuGet packages instead of redefining everything.</p>
    <p><a class="link-more" href="/documentation/yotsuba-shader/reusing-your-types-and-libraries/">Reusing your types and libraries ${icon('chevron-right')}</a></p>
    <h2>Native types</h2>
    ${table(
      ['Attribute', 'Applies to', 'Purpose'],
      [
        ['<code>[Vector]</code> + <code>[VectorComponent(i)]</code>', 'struct', 'Declare a vector type and its ordered components.'],
        ['<code>[Matrix]</code> + <code>[MatrixColumn(i)]</code>', 'struct', 'Declare a matrix type and its columns.'],
        ['<code>[Texture(dimension, componentTypes)]</code>', 'class, struct', 'Declare a texture: dimension, component type, usage, depth, format, arrayed, multisampled.'],
        ['<code>[Sampler]</code>', 'class, struct', 'Declare a sampler type.'],
      ],
    )}
    <p>XNA-style <code>Vector2</code>, <code>Vector3</code> and <code>Vector4</code> from <code>Microsoft.Xna.Framework</code> are the types the examples use for positions and colors.</p>
    <h2>Five vocabularies</h2>
    <p>The attribute names deliberately resemble their source languages. Across the five syntaxes the language ships <strong>${totalAttrs}</strong> attributes.</p>
    ${table(
      ['Syntax', 'Inspired by', 'Attributes', 'Package and namespace'],
      Object.entries(SYNTAX_META).map(([id, m]) => [
        `<strong>${m.name}</strong>`,
        m.inspired,
        counts[id] || '—',
        `<code>${m.namespace}</code>`,
      ]),
    )}
    <p><a class="link-more" href="/documentation/yotsuba-shader/builtin-values-across-syntaxes/">Built-in values across syntaxes ${icon('chevron-right')}</a></p>
  </div>
</section>`,
  };

  const compiler = {
    path: '/technologies/compiler/',
    section: 'technologies',
    title: 'Compiler',
    description: 'The Roslyn-based frontend and the compilation pipeline of Yotsuba Shader.',
    body: `
<section class="hero hero--compact">
  <div class="container">
    <h1 class="h-xl">Compiler</h1>
    <p class="lead">The frontend reads your C# with Roslyn, discovers shaders by symbol and builds the intermediate representation that the backends consume.</p>
  </div>
  <hr class="hero-rule">
</section>
<section class="section">
  <div class="container container--narrow prose">
    <h2>Discovery</h2>
    <p><code>ShaderDiscovery.Find(compilation)</code> walks the types declared in <em>your</em> project (not the referenced assemblies) and returns a <code>ShaderInfo</code> for every class that has at least one <code>[ShaderStage]</code> method. It works with symbols, so it does not matter how the attribute is written: alias, <code>using</code>, long or short name.</p>
    ${code('csharp', `ImmutableArray<ShaderInfo> shaders = ShaderDiscovery.Find(compilation);

foreach (ShaderInfo shader in shaders)
{
    Console.WriteLine(shader.FullName);           // e.g. Game.MegaShader
    foreach (EntryPointInfo entry in shader.EntryPoints)
        Console.WriteLine($"  {entry.Stage}: {entry.Name}");
}`)}
    <p>The caller must make sure the compilation has no C# errors before calling it.</p>
    <h2>Roslyn</h2>
    <p>The frontend depends only on <code>Microsoft.CodeAnalysis.CSharp</code> and uses syntax trees, compilations, symbols, the semantic model and operations. It does not use Workspaces or MEF. Roslyn runs in the build, so your application does not need it: see <a href="/documentation/yotsuba-shader/generating-shader-binaries/">Generating shader binaries</a>.</p>
    <h2>Analysis</h2>
    <p><code>ShaderProcessor.Process</code> turns each entry point into an IR <code>Function</code>: it resolves the stage, converts every parameter into a <code>Storage</code> (with its interface slot) and recognises the built-in attributes of all five syntaxes.</p>
    <h2>Entry points</h2>
    <p>Shader build integration and a shader compilation CLI are planned. The existing generator only produces the SPIR-V operation table.</p>

    <p>There is no implemented C# shader command-line contract to document yet.</p>
  </div>
</section>`,
  };

  const ir = {
    path: '/technologies/intermediate-representation/',
    section: 'technologies',
    title: 'Intermediate Representation',
    description: 'The Yotsuba IR: shaders, functions, storage, interface slots and types.',
    body: `
<section class="hero hero--compact">
  <div class="container">
    <h1 class="h-xl">Intermediate Representation</h1>
    <p class="lead">A shared, backend-neutral model between the frontend and every backend.</p>
  </div>
  <hr class="hero-rule">
</section>
<section class="section">
  <div class="container container--narrow prose">
    <h2>The model</h2>
    ${code('csharp', `public readonly record struct Shader(
    IReadOnlyList<Function> Functions);

public readonly record struct Function(
    string HumanName,
    Stage Stage,                       // None, Fragment, Vertex, Compute
    IReadOnlyList<Storage> Inputs,
    IReadOnlyList<Storage> Outputs,
    IReadOnlyList<Statement> Body);

public abstract record class Storage(
    string HumanName,
    StorageKind Kind,
    InterfaceSlot? Slot);`, 'YotsubaShader.IR')}
    <h2>Storage kinds</h2>
    <p><code>Input</code>, <code>Output</code>, <code>Uniform</code>, <code>StorageBuffer</code>, <code>PushConstant</code>, <code>Texture</code>, <code>Sampler</code> and <code>Local</code>.</p>
    <h2>Interface slots</h2>
    ${table(
      ['Slot', 'Meaning'],
      [
        ['<code>LocationSlot(int Location)</code>', 'A numbered pipeline location.'],
        ['<code>BuiltInSlot(BuiltIn BuiltIn)</code>', 'A system value such as position, vertex index or global invocation id.'],
        ['<code>VertexSlot(VertexSemantic Semantic)</code>', 'A vertex semantic (position, color, texture coordinate, normal …) that the backend resolves to a location.'],
      ],
    )}
    <h2>Types</h2>
    <p>Each type is a <code>Storage</code> record: <code>Bool</code>, <code>Int</code> (bits and signedness), <code>Float</code> (32-bit), <code>Double</code> (64-bit), <code>Vector</code> (float, int or uint components), <code>Matrix</code> (float or double; rows × columns), <code>Array</code>, <code>CustomStruct</code>, <code>Texture</code> and <code>Sampler</code>.</p>
    <h2>Why an IR</h2>
    <p>The language vocabulary (five syntaxes) and the output (SPIR-V and the formats derived from it) meet in the middle. Adding a syntax means mapping its attributes to existing slots; adding a backend means consuming the same model. Neither change touches the other side.</p>
    <p><a class="link-more" href="/documentation/yotsuba-shader/intermediate-representation/">IR in the documentation ${icon('chevron-right')}</a></p>
  </div>
</section>`,
  };

  const spirv = {
    path: '/technologies/spir-v/',
    section: 'technologies',
    title: 'SPIR-V',
    description: 'SPIR-V 1.6 module construction and encoding in Yotsuba Shader.',
    body: `
<section class="hero hero--compact">
  <div class="container">
    <span class="spirv-chip" style="margin-bottom:22px"><img src="${SPIRV_LOGO.src}" alt="SPIR-V"></span>
    <h1 class="h-xl">SPIR-V</h1>
    <p class="lead">Build SPIR-V 1.6 modules with typed helpers and encode them to a binary the Vulkan ecosystem understands.</p>
  </div>
  <hr class="hero-rule">
</section>
<section class="section">
  <div class="container container--narrow prose">
    <h2>Building a module</h2>
    <p><code>SpirVModule</code> collects instructions. <code>AddLine</code> adds an instruction without a result; <code>AddResultLine</code> adds one with a result id and guarantees each id is defined exactly once.</p>
    ${code('csharp', `var module = new SpirVModule();

module.AddLine(SpirVOpTable.OpCapability,
    SpirVInstructionParameter.Enumerant(SpirVCapability.Shader));

module.AddLine(SpirVOpTable.OpMemoryModel, new[]
{
    SpirVInstructionParameter.Enumerant(SpirVAddressingModel.Logical),
    SpirVInstructionParameter.Enumerant(SpirVMemoryModel.GLSL450)
});

// ... types, constants, the entry point, OpStore, OpReturn ...

byte[] spirV = new SpirVCompiler().Compile(module);
File.WriteAllBytes("mi modulo spirv.spv", spirV);`, 'Program.cs')}
    <h2>Encoding</h2>
    <p><code>SpirVCompiler.Compile</code> writes the five-word module header (magic number <code>0x07230203</code>, version 1.6, generator, id bound, schema) and then every instruction. Word counts are filled in once all operands are written.</p>
    <h2>Generated operation table</h2>
    <p><code>YotsubaShader.Generator</code> is an incremental source generator. It reads the official <code>spirv.core.grammar.json</code> from Khronos and generates <code>SpirVOpTable</code>, so instructions are strongly typed instead of magic numbers.</p>
    <h2>Output targets</h2>
    <p>YotsubaShaderCross provides GLSL, HLSL, and MSL compiler classes for SPIR-V input. WGSL emission is planned. These APIs do not complete the unfinished C# frontend pipeline.</p>
    ${table(
      ['Platform', 'Shader format', 'How you get it'],
      BACKENDS.map((b) => [`<strong>${b.name}</strong>`, `<code>${b.format}</code>`, HOW[b.id]]),
    )}
    <h2>Validate</h2>
    ${code('bash', `spirv-val "mi modulo spirv.spv"
spirv-dis "mi modulo spirv.spv"`)}
    <p><a class="link-more" href="/documentation/yotsuba-shader/building-spirv-modules/">Building SPIR-V modules in the documentation ${icon('chevron-right')}</a></p>
  </div>
</section>`,
  };

  return [overview, language, compiler, ir, spirv];
}

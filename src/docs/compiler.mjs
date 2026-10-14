// Documentation articles: compiler, reference and project.
import { icon, code, table, note } from '../components.mjs';
import { builtinMapTable, resourceMapTable, STYLE_META } from '../reference.mjs';
import { SITE } from '../site.mjs';
import { GEN_CSPROJ, GEN_INPUT, GEN_OUTPUT, GEN_TYPES, GEN_USE, CLI_SNIPPET, LIB_SNIPPET, TRANSPILE_USE, TRANSPILE_WINDOWS } from '../snippets.mjs';

const D = '/documentation/yotsuba-shader/';

const styleArticle = (ctx, id) => {
  const meta = STYLE_META[id];
  const items = (ctx.styles[id] && ctx.styles[id].items) || [];
  const groups = ['Input', 'Input / Output', 'Output', 'Method', 'Resource', 'Type'];
  const titles = {
    Input: 'Input attributes',
    'Input / Output': 'Input and output attributes',
    Output: 'Output attributes',
    Method: 'Method attributes',
    Resource: 'Resource attributes',
    Type: 'Supporting types',
  };
  const blurb = {
    Input: 'Apply to fields, parameters and properties that receive values from the pipeline.',
    'Input / Output': 'Apply to values that can be received or produced, depending on the stage.',
    Output: 'Apply to fields, parameters and return values the stage produces.',
    Method: 'Apply to methods, for example to set a compute workgroup size.',
    Resource: 'Declare uniforms, buffers, textures, samplers and binding slots.',
    Type: 'Structs, classes and enums used together with the attributes.',
  };
  const sections = groups
    .map((g) => {
      const list = items.filter((i) => i.kind === g);
      if (!list.length) return '';
      const rows = list.map((i) => [
        `<code>${i.attribute ? '[' : ''}${i.display}${i.attribute ? ']' : ''}</code>`,
        i.params ? `<code>(${i.params.replace(/</g, '&lt;').replace(/>/g, '&gt;')})</code>` : '<span class="muted">—</span>',
      ]);
      return `<h2>${titles[g]}</h2><p>${blurb[g]}</p>${table([g === 'Type' ? 'Type' : 'Attribute', 'Parameters'], rows)}`;
    })
    .join('');
  const exampleAttr = { hlsl: 'SV_Position', glsl: 'gl_Position', metal: 'position', vulkan: 'BuiltIn_Position', wgsl: '@builtin_position' }[id];
  return {
    slug: `${id}-style-attributes`,
    title: `${meta.name} attributes`,
    kind: 'Reference',
    heroKind: 'reference',
    icon: 'list',
    summary: `Every attribute in the ${meta.name} vocabulary: ${/^[A-Z][a-z]/.test(meta.summary) ? meta.summary.charAt(0).toLowerCase() + meta.summary.slice(1) : meta.summary}`,
    body: `
<h2>Overview</h2>
<p>The ${meta.name} vocabulary is inspired by <strong>${meta.inspired}</strong>. It contains ${ctx.styles[id].total} attributes in the <code>${meta.namespace}</code> namespace, generated below from the language sources.</p>
${code('csharp', `using ${meta.namespace};

public struct VertexOutput
{
    [${exampleAttr}]
    public Vector4 Position;
}`)}
<p>See the same concepts side by side in <a href="${D}builtin-values-across-styles/">Built-in values across styles</a> and <a href="${D}resource-attributes-across-styles/">Resource attributes across styles</a>.</p>
${sections || '<p class="muted">The language sources were not available when this page was built.</p>'}`,
  };
};

export default function compilerDocs(ctx) {
  const core = [
    /* ---------------------------------------------------------------- */
    {
      slug: 'compilation-pipeline',
      title: 'Compilation pipeline',
      kind: 'Article',
      icon: 'doc',
      summary: 'Follow a shader from C# source to SPIR-V: discovery, analysis, the intermediate representation and emission.',
      body: `
<h2>Overview</h2>
<p>Compilation is a sequence of small, separate steps. Each one has a project of its own, so a stage can evolve, or be replaced, independently.</p>
<div class="pipeline" role="list">
  <div class="pipe-step" role="listitem"><span class="pipe-ico">${icon('code')}</span><b>C# source</b><span>Classes, structs, attributes</span></div>
  <div class="pipe-step" role="listitem"><span class="pipe-ico">${icon('search')}</span><b>Discovery</b><span><code>ShaderDiscovery</code></span></div>
  <div class="pipe-step" role="listitem"><span class="pipe-ico">${icon('doc')}</span><b>Analysis</b><span><code>ShaderProcessor</code></span></div>
  <div class="pipe-step" role="listitem"><span class="pipe-ico">${icon('layers')}</span><b>IR</b><span><code>Shader</code>, <code>Function</code></span></div>
  <div class="pipe-step" role="listitem"><span class="pipe-ico">${icon('cpu')}</span><b>SPIR-V</b><span><code>SpirVModule</code></span></div>
</div>

<h2>Step by step</h2>
<ol>
  <li><strong>Discovery.</strong> <a href="${D}shader-discovery/">ShaderDiscovery</a> finds classes with <code>[ShaderStage]</code> methods using Roslyn symbols.</li>
  <li><strong>Analysis.</strong> <code>ShaderProcessor</code> converts each entry point: stage, inputs and outputs as <code>Storage</code> with interface slots, and the function body.</li>
  <li><strong>Intermediate representation.</strong> The result is a <code>Shader</code> made of <code>Function</code> records. See <a href="${D}intermediate-representation/">Intermediate representation</a>.</li>
  <li><strong>Emission.</strong> A backend consumes the IR. For SPIR-V, <a href="${D}building-spirv-modules/">SpirVModule</a> collects instructions and <code>SpirVCompiler</code> encodes the binary.</li>
</ol>

<h2>Entry points</h2>
<p>The command-line compiler is made for builds, CI and content tools; the library for engines that want to compile without starting a separate process. Both share compilation behavior, diagnostics, validation and configuration.</p>
${code('bash', CLI_SNIPPET, 'Terminal')}
<p><code>--target</code> selects the backend independently of the attributes used to write the shader.</p>`,
    },

    /* ---------------------------------------------------------------- */
    {
      slug: 'generating-shader-binaries',
      title: 'Generating shader binaries',
      kind: 'Article',
      icon: 'doc',
      summary: 'Three ways to get SPIR-V and the other formats into your project: a source generator, a command line and a library.',
      body: `
<h2>Overview</h2>
<p class="lead-p">A shader is only useful once its binary reaches the graphics API. Yotsuba Shader produces it in three ways. They share the same compiler core; they differ in <em>where</em> in your workflow it runs.</p>

<h2>1. A source generator, at build time</h2>
<p>This is the primary workflow. A Roslyn source generator runs as part of <code>dotnet build</code>: it receives your project's compilation, finds every <code>[ShaderStage]</code> method, compiles it and writes the result back into your code as the other half of a <strong><code>partial</code> class</strong>: every binary you specified, plus its reflection.</p>
<p>You opt in by referencing the generator and choosing the targets:</p>
${code('xml', GEN_CSPROJ, 'YourGame.csproj')}
<p>and by declaring the shader class <code>partial</code>:</p>
${code('csharp', GEN_INPUT, 'Triangle.cs')}
<p>The generator adds the other half of the class. It declares two fields and fills them with code it generates:</p>
${code('csharp', GEN_OUTPUT, 'Triangle.g.cs')}
<p>Both fields carry <code>[ShaderIgnore]</code>, which tells Yotsuba Shader not to treat them as part of the shader. The generated half adds no base class, so your own inheritance never conflicts with it.</p>
<p>Every shader exposes the same two types, so any tool or engine can read any shader the same way:</p>
${code('csharp', GEN_TYPES, 'YotsubaShader.Runtime')}
<ul>
  <li><strong><code>ShaderCompiledCode</code></strong> holds the binaries, one per entry point and format. The key is the <strong>name of your C# method</strong>; <code>nameof(Triangle.Vertex)</code> keeps it checked by the compiler. Text formats are returned as UTF-8 bytes, and <code>GetText</code> decodes them.</li>
  <li><strong><code>ShaderReflection</code></strong> lists the <code>BinaryFormats</code> that were generated, the entry points (name, stage and the name each format uses) and the resources (name, kind, access and the slot each format uses), so you do not read the binaries to build a pipeline.</li>
</ul>
${table(
  ['Binaries', 'What it holds', 'Typical use'],
  [
    ['<code>Binaries.SpirV</code>', 'SPIR-V binary', 'Vulkan'],
    ['<code>Binaries.Dxil</code>', 'DXIL binary', 'Direct3D 12'],
    ['<code>Binaries.Dxbc</code>', 'DXBC binary', 'Direct3D 11 and 12 (Shader Model 5.x)'],
    ['<code>Binaries.Msl</code>', 'UTF-8 source text', 'Metal compiles it at run time'],
    ['<code>Binaries.Wgsl</code>', 'UTF-8 source text', 'WebGPU'],
    ['<code>Binaries.Glsl</code>, <code>Binaries.GlslEs</code>', 'UTF-8 source text', 'OpenGL, WebGL'],
  ],
)}
<p>The magic number <code>0x07230203</code> that starts every SPIR-V module is stored little-endian, which is why a SPIR-V binary begins with <code>0x03, 0x02, 0x23, 0x07</code>. The data lives as static data in your assembly, so reading it does not copy or allocate. Only the formats you list in <code>YotsubaTargets</code> are generated.</p>
${code('csharp', GEN_USE, 'Renderer.cs')}
<h3>Why it is the main path</h3>
<ul>
  <li><strong>Nothing to ship separately.</strong> The binaries live inside your assembly.</li>
  <li><strong>Errors at build time.</strong> A shader that does not compile fails the build like any C# error.</li>
  <li><strong>One way to ask.</strong> Every shader has a <code>CompiledCode</code> and a <code>Reflection</code> field, so engines and tools handle all of them the same way.</li>
  <li><strong>One target per platform.</strong> <code>spirv</code>, <code>dxil</code>, <code>dxbc</code>, <code>msl</code>, <code>wgsl</code>, <code>glsl</code> and <code>glsles</code>. Only the targets you list are generated.</li>
</ul>

<h2>2. Command line</h2>
<p>For builds, CI and content tools, you give the <code>yotsuba</code> command your project file. It loads the project's sources and references the way the C# compiler does, finds every <code>[ShaderStage]</code> method and writes one binary per entry point:</p>
${code('bash', CLI_SNIPPET, 'Terminal')}
<p>The output folder then holds <code>Triangle.Vertex.spv</code>, <code>Triangle.Fragment.spv</code> and so on. To compile a single entry point, add <code>--entry Triangle.Vertex</code>. <code>--target</code> selects the backend independently of the attribute style you wrote the shader in. This is also the easiest way to inspect output with <code>spirv-val</code> and <code>spirv-dis</code>.</p>

<h2>3. Library</h2>
<p>For editors, asset importers and hot reload, call the compiler in-process. You pass it C# source as a string and get SPIR-V back:</p>
${code('csharp', LIB_SNIPPET, 'Importer.cs')}
<p>The compiler produces <strong>only SPIR-V</strong>. For every other format Yotsuba Shader gives you a small <code>Transpile</code> API over Naga (see <a href="${D}transpiling-spirv/">Transpiling from SPIR-V</a>). The compiler itself is plain C# with no native code of its own.</p>
<h3>Translating from SPIR-V</h3>
${table(
  ['Format', 'Translator', 'Notes'],
  [
    ['<code>MSL</code>', 'Naga or SDL_ShaderCross', 'Both translate SPIR-V to Metal Shading Language.'],
    ['<code>WGSL</code>', 'Naga', 'SPIR-V in, WGSL out.'],
    ['<code>GLSL</code>, <code>GLSL ES</code>', 'Naga', 'GLSL 330+ and GLSL ES 300+.'],
    ['<code>DXIL</code>', 'SDL_ShaderCross', 'Goes through SPIRV-Cross and DXC (the DXC build must be present). Naga does not write DXIL.'],
    ['<code>DXBC</code>', 'SDL_ShaderCross', 'Naga does not write DXBC.'],
  ],
)}
<p>Both translators are native libraries. <strong>You ship them with your application</strong>, including on consoles, where the platform's own build of SDL and Naga has to be part of the package.</p>
<h3>Running Roslyn on a string, in a game</h3>
<p><strong>Yotsuba Shader uses only the subset of Roslyn that is compatible with Native AOT:</strong> syntax trees, <code>CSharpCompilation</code>, the semantic model and operations (the <code>Microsoft.CodeAnalysis.CSharp</code> package). It does not use Roslyn's Workspaces or MEF-based services, which depend on reflection. The compiler analyses your C# with Roslyn, and that works without a JIT. We built a Native AOT executable that parses a C# string, resolves its types, reports errors, and then runs <code>ShaderDiscovery</code> and <code>ShaderProcessor</code> on it. It ran correctly (macOS arm64, about 42 MB). Roslyn is not annotated for trimming, so the build prints trim warnings, and the points below are what to plan for:</p>
<ul>
  <li><strong>No code is emitted.</strong> Only the syntax and semantic analysis is used, so no <code>Reflection.Emit</code> or JIT is needed.</li>
  <li><strong>Reference assemblies must travel with the app.</strong> There is no SDK on a console, so embed the .NET reference metadata (and <code>YotsubaShader.Language</code>) as resources and load it from memory.</li>
  <li><strong>Stay inside that subset in your own tools.</strong> Roslyn's workspace and completion services rely on MEF and reflection and are not suitable for AOT. (The browser playground does use them, for editor help only; the compiler itself does not.)</li>
  <li><strong>Mind the memory.</strong> Roslyn needs far more memory than a shader needs; check the budget of your target.</li>
  <li><strong>Consoles were not tested.</strong> Their toolchains are under NDA. The behavior above comes from desktop Native AOT; verify it on your target SDK.</li>
</ul>
${note('tip', 'On consoles, prefer the <strong>source generator</strong> or the <strong>command line</strong>: compile and translate on your development machine and ship only the final bytes. Then the console build needs neither Roslyn nor the translators.')}
<p>The command line and the library share compilation behavior, diagnostics, validation and configuration.</p>

<h2>Choosing</h2>
${table(
  ['Workflow', 'Runs', 'Best for', 'Output'],
  [
    ['<strong>Source generator</strong>', 'During <code>dotnet build</code>', 'Games, engines and apps that ship shaders with the code', 'Byte arrays in a <code>partial</code> class'],
    ['<strong>Command line</strong>', 'In scripts and CI', 'Content pipelines, inspection and validation', '<code>.spv</code> files'],
    ['<strong>Library</strong>', 'Inside your tool', 'Editors, importers, hot reload', 'Bytes and diagnostics in memory'],
  ],
)}`,
    },

    /* ---------------------------------------------------------------- */
    {
      slug: 'transpiling-spirv',
      title: 'Transpiling from SPIR-V',
      kind: 'Article',
      icon: 'doc',
      summary: 'At run time the compiler produces SPIR-V; a small Transpile API turns it into HLSL, MSL, WGSL or GLSL text, with Naga underneath.',
      body: `
<h2>Overview</h2>
<p class="lead-p">The compiler produces one format: SPIR-V. When your tool or game needs another one at run time, you hand the SPIR-V to the <code>Transpile</code> API and get shader <strong>text</strong> back.</p>
<div class="pipeline" role="list">
  <div class="pipe-step" role="listitem"><span class="pipe-ico">${icon('code')}</span><b>C# string</b><span>Your shader source</span></div>
  <div class="pipe-step" role="listitem"><span class="pipe-ico">${icon('cpu')}</span><b>SPIR-V</b><span>The compiler's output</span></div>
  <div class="pipe-step" role="listitem"><span class="pipe-ico">${icon('layers')}</span><b>Transpile</b><span>Naga underneath</span></div>
  <div class="pipe-step" role="listitem"><span class="pipe-ico">${icon('doc')}</span><b>Shader text</b><span>HLSL, MSL, WGSL, GLSL</span></div>
</div>

<h2>The API</h2>
<p>One static class, one function per output format, and an options object where the format needs one:</p>
${code('csharp', TRANSPILE_USE, 'Transpile.cs')}
${table(
  ['Function', 'Output', 'Options'],
  [
    ['<code>FromSpirVToHlsl</code>', 'HLSL text', '<code>ShaderModel</code> (50, 51, 60 and up), <code>EntryPoint</code>'],
    ['<code>FromSpirVToMsl</code>', 'Metal Shading Language text', 'Metal version'],
    ['<code>FromSpirVToWgsl</code>', 'WGSL text', '—'],
    ['<code>FromSpirVToGlsl</code>', 'GLSL or GLSL ES text', '<code>Version</code>, <code>Es</code>'],
  ],
)}
<p>Every function takes the SPIR-V bytes and, where it makes sense, a binding map that says which <code>set</code> and <code>binding</code> becomes which register or slot. Without it, shaders that use textures or buffers cannot be laid out for HLSL.</p>

<h2>What it uses underneath</h2>
<p>The implementation is <strong>Naga</strong>, the shader translator of the wgpu project. It is dual licensed MIT or Apache-2.0 and written in Rust with no C or C++ dependencies of its own, so adopting it does not bring other native licenses with it (SPIRV-Cross, DXC or vkd3d). The only native piece Yotsuba Shader ships is a thin wrapper around Naga that exposes the functions above, because Naga has no C API. Because the wrapper sits behind the <code>Transpile</code> API, the code that calls it does not depend on Naga.</p>

<h2>From text to a binary</h2>
<p>Naga writes text. Turning that text into something the GPU runs is the job of the platform:</p>
${table(
  ['Target', 'Who compiles the text', 'Extra files to ship'],
  [
    ['<strong>Metal</strong>', 'The Metal framework, at run time', 'None'],
    ['<strong>WebGPU</strong>', 'The browser', 'None'],
    ['<strong>OpenGL, WebGL</strong>', 'The graphics driver', 'None'],
    ['<strong>Direct3D 11</strong> and <strong>Direct3D 12</strong> (Shader Model 5.x)', 'FXC, through <code>d3dcompiler_47.dll</code>', 'None on Windows: it is part of the operating system'],
    ['<strong>Direct3D 12</strong> (Shader Model 6, DXIL)', 'DXC and its signing library', 'Yes. Not covered by Transpile; use SDL_ShaderCross, which goes through DXC'],
  ],
)}
${code('csharp', TRANSPILE_WINDOWS, 'Windows.cs')}
<p>That is how Direct3D 11 and Direct3D 12 are covered on Windows without redistributing anything. Naga does not write DXIL or DXBC, so a compiled Direct3D 12 Shader Model 6 binary is outside this API.</p>

<h2>Where to run it</h2>
<ul>
  <li><strong>On your development machine, at build time</strong> (with the source generator or the command line): translate once and ship only the final text or binaries. This needs no Naga at all on the player's machine.</li>
  <li><strong>At run time</strong>, for editors, importers and shaders created while the program runs: this is what the API is for.</li>
  <li><strong>On consoles</strong>, prefer build time. Naga was not verified against any console toolchain, and its wrapper must be built for each platform.</li>
</ul>
<p>Next: <a href="${D}generating-shader-binaries/">Generating shader binaries</a>.</p>`,
    },

    /* ---------------------------------------------------------------- */
    {
      slug: 'shader-discovery',
      title: 'Shader discovery',
      kind: 'Article',
      icon: 'doc',
      summary: 'How the frontend finds shaders in a Roslyn compilation, by symbol rather than by text.',
      body: `
<h2>Overview</h2>
<p><code>ShaderDiscovery.Find</code> receives a Roslyn <code>Compilation</code> and returns one <code>ShaderInfo</code> per class that declares at least one <code>[ShaderStage]</code> method. It works with symbols, not text, so it does not matter how the attribute is written: through an alias, a <code>using</code> directive, or its long or short name.</p>
${code('csharp', `public static class ShaderDiscovery
{
    public const string ShaderStageAttributeMetadataName =
        "YotsubaShader.Language.ShaderStageAttribute";

    public static ImmutableArray<ShaderInfo> Find(
        Compilation compilation,
        CancellationToken cancellationToken = default);
}`, 'ShaderDiscovery.cs')}
${note('important', 'The caller must check that the compilation has no C# errors before calling <code>Find</code>.')}

<h2>The model</h2>
${code('csharp', `public sealed record ShaderInfo(
    INamedTypeSymbol Type,
    ImmutableArray<EntryPointInfo> EntryPoints)
{
    public string Name => Type.Name;
    public string FullName => /* e.g. "Game.MegaShader" */;
}

public sealed record EntryPointInfo(
    IMethodSymbol Method,
    Stage Stage,
    ImmutableArray<ParameterInfo> Parameters,
    ITypeSymbol ReturnType);

public sealed record ParameterInfo(IParameterSymbol Symbol);`, 'ShaderInfo.cs')}

<h2>Rules</h2>
<ul>
  <li>Only types of <strong>your</strong> project are inspected, not the types in referenced assemblies.</li>
  <li>Only ordinary methods count: constructors and property accessors are skipped.</li>
  <li>Entry points are returned in declaration order.</li>
  <li>Private methods work, and helper methods without <code>[ShaderStage]</code> in the same class are simply ignored.</li>
  <li>Attributes are read directly from the method; those of an overridden method are not inherited.</li>
  <li>The stage arrives as the underlying number of the enum value and is converted back to <code>Stage</code>.</li>
</ul>

<h2>Tests</h2>
<p><code>YotsubaShader.Frontend.Tests</code> checks discovery on a "mega shader" class that mixes two stages, helper methods and properties: it finds the class, returns <code>VS</code> and <code>FS</code> in order with their stages, and exposes parameter names, types and return types.</p>
${code('bash', 'dotnet test YotsubaShader.Frontend.Tests')}`,
    },

    /* ---------------------------------------------------------------- */
    {
      slug: 'intermediate-representation',
      title: 'Intermediate representation',
      kind: 'Article',
      icon: 'doc',
      summary: 'The backend-neutral model that sits between the frontend and every backend.',
      body: `
<h2>Overview</h2>
<p>The IR (<code>YotsubaShader.IR</code>) is the contract between the language and the backends. It describes <em>what a shader is</em>, not how any single API expresses it.</p>

<h2>Shader and function</h2>
${code('csharp', `public readonly record struct Shader(
    IReadOnlyList<Function> Functions,
    IReadOnlyList<Storage> Constants);

public readonly record struct Function(
    string HumanName,
    Stage Stage,                      // None, Fragment, Vertex, Compute
    IReadOnlyList<Storage> Inputs,
    IReadOnlyList<Storage> Outputs,
    IReadOnlyList<Statement> Body);`)}

<h2>Storage</h2>
<p>Every value is a <code>Storage</code> record with a name, a kind and an optional interface slot.</p>
${code('csharp', `public abstract record class Storage(
    string HumanName,
    StorageKind Kind,
    InterfaceSlot? Slot);

public enum StorageKind
{ Input, Output, Uniform, StorageBuffer, PushConstant, Texture, Sampler, Local }`)}

<h2>Types</h2>
${table(
  ['Type', 'Notable fields'],
  [
    ['<code>Bool</code>', '<code>InitialValue</code>'],
    ['<code>Int</code>', '<code>Bits</code>, <code>Signed</code>, <code>InitialValue</code>'],
    ['<code>Float</code>, <code>Double</code>', '32-bit and 64-bit, <code>InitialValue</code>'],
    ['<code>Vector</code>', '<code>ComponentsType</code> (Float, Int, Uint), <code>ComponentsLength</code>, <code>ComponentsDefaultValues</code>'],
    ['<code>Matrix</code>', '<code>ComponentsType</code> (Float, Double), <code>Rows</code>, <code>Columns</code>'],
    ['<code>Array</code>', 'Homogeneous, indexable sequence of elements.'],
    ['<code>CustomStruct</code>', '<code>Properties</code>: nested storage, each with its own slot.'],
    ['<code>Texture</code>', '<code>Dimensions</code>, <code>TextureComponentsType</code>, <code>Depth</code>, <code>Arrayed</code>, <code>Multisampled</code>, <code>Usage</code>, <code>Format</code>'],
    ['<code>Sampler</code>', 'A sampler.'],
  ],
)}

<h2>Interface slots</h2>
<p>An <code>InterfaceSlot</code> is a <code>LocationSlot</code> (a number), a <code>BuiltInSlot</code> (a system value such as position) or a <code>VertexSlot</code> (a semantic the backend resolves to a location).</p>

<h2>Function bodies</h2>
<p>A body is a list of <code>Statement</code> records built from <code>Expression</code> records: literals (bool, int, float, double, vector, matrix, array, struct), assignments, and assignment targets (a storage, a storage array element, a struct property of a storage).</p>

<h2>XNA helpers</h2>
<p><code>XnaHelper</code> offers factory methods that build IR values for XNA-style types: <code>XNA_CreateVector2</code>, <code>XNA_CreateVector3</code> (from component values) and <code>XNA_CreateTexture2D</code>. They let the frontend map <code>Vector2</code>, <code>Vector3</code> or a 2D texture to the matching IR storage.</p>`,
    },

    /* ---------------------------------------------------------------- */
    {
      slug: 'building-spirv-modules',
      title: 'Building SPIR-V modules',
      kind: 'Article',
      icon: 'doc',
      summary: 'Assemble a SPIR-V 1.6 module instruction by instruction and encode it to a binary.',
      body: `
<h2>Overview</h2>
<p>The compiler project exposes a low-level API to assemble SPIR-V explicitly. The example project uses it to build a fragment shader that writes a magenta color to its output.</p>

<h2>Instructions</h2>
<p><code>SpirVModule</code> keeps an ordered list of instructions:</p>
${table(
  ['Method', 'Use'],
  [
    ['<code>AddLine(op, params)</code>', 'An instruction without a result: <code>OpCapability</code>, <code>OpStore</code>, <code>OpReturn</code>, …'],
    ['<code>AddResultLine(id, op, params)</code>', 'An instruction with a result id: <code>%id = Op…</code>. Each id can be defined only once. When the operation has a result type, pass it as the first parameter.'],
    ['<code>DeclareType(typeof(T))</code>', 'Declare scalar and vector types once and get their id.'],
    ['<code>DeclarePointer(storageClass, type)</code>', 'Declare a pointer type in a storage class such as <code>Output</code>.'],
    ['<code>IsDefined(id)</code>', 'Check whether an id exists.'],
    ['<code>ToText()</code>', 'Render the module as text.'],
  ],
)}
<p>Operands are <code>SpirVInstructionParameter</code> values: <code>Enumerant(…)</code> for enums (capabilities, execution models, decorations …), or a value with a <code>SpirVInstructionType</code> such as <code>IdRef</code>, <code>IntValue</code>, <code>FloatValue</code> or <code>StringLiteral</code>.</p>

<h2>A module header</h2>
${code('csharp', `var module = new SpirVModule();

module.AddLine(SpirVOpTable.OpCapability,
    SpirVInstructionParameter.Enumerant(SpirVCapability.Shader));

module.AddLine(SpirVOpTable.OpMemoryModel, new[]
{
    SpirVInstructionParameter.Enumerant(SpirVAddressingModel.Logical),
    SpirVInstructionParameter.Enumerant(SpirVMemoryModel.GLSL450)
});

module.AddLine(SpirVOpTable.OpEntryPoint, new[]
{
    SpirVInstructionParameter.Enumerant(SpirVExecutionModel.Fragment),
    new SpirVInstructionParameter(SpirVTableTypesIds.FragmentMainID, SpirVInstructionType.IdRef),
    new SpirVInstructionParameter("fs_main", SpirVInstructionType.StringLiteral),
    new SpirVInstructionParameter("%f_color", SpirVInstructionType.IdRef),
});`, 'Program.cs')}

<h2>The shape of the example module</h2>
<p>The example builds, in order:</p>
${code('spirv', `; abridged; ids are illustrative
OpCapability Shader
OpMemoryModel Logical GLSL450
OpEntryPoint Fragment %main "fs_main" %f_color
OpExecutionMode %fs_main OriginUpperLeft
OpDecorate %f_color Location 0
; types: void, void function, float, vec4, pointer to vec4 in Output
%f_color = OpVariable %ptr_vec4_output Output
%float_0 = OpConstant %float 0
%float_1 = OpConstant %float 1
%magenta = OpConstantComposite %vec4 %float_1 %float_0 %float_1 %float_1
%main    = OpFunction %void None %void_fn
%entry   = OpLabel
           OpStore %f_color %magenta
           OpReturn
           OpFunctionEnd`)}

<h2>Encoding</h2>
${code('csharp', `SpirVCompiler compiler = new SpirVCompiler();
byte[] spirV = compiler.Compile(module);
File.WriteAllBytes("mi modulo spirv.spv", spirV);`)}
<p>The encoder writes the module header (magic number <code>0x07230203</code>, version 1.6, generator, id bound, schema) and then each instruction: opcode and word count, the result type when the operation has one, the result id, and the operands. A string operand takes several words, so word counts are computed after all operands are written. Ids are numbered while encoding.</p>

<h2>Validate</h2>
${code('bash', `spirv-val "mi modulo spirv.spv"
spirv-dis "mi modulo spirv.spv"`)}`,
    },

    /* ---------------------------------------------------------------- */
    {
      slug: 'spirv-operation-generator',
      title: 'SPIR-V operation generator',
      kind: 'Article',
      icon: 'doc',
      summary: 'How the operation table is generated from the official Khronos grammar.',
      body: `
<h2>Overview</h2>
<p><code>YotsubaShader.Generator</code> is a Roslyn incremental source generator. It reads <code>spirv.core.grammar.json</code>, the machine-readable description of every SPIR-V instruction published by Khronos, and generates the types the compiler uses to refer to operations.</p>

<h2>How it is wired</h2>
<ul>
  <li>The generator targets <code>netstandard2.0</code> so it can run inside the compiler.</li>
  <li><code>YotsubaShader.Compiler</code> references it as an analyzer and declares the grammar as an <code>AdditionalFile</code>.</li>
  <li>At build time it generates <code>SpirVOpTable</code>, <code>SpirVOp</code> and <code>SpirVOpClass</code>.</li>
</ul>
${note('important', 'If the grammar file is not among the <code>AdditionalFiles</code>, the generator reports a <strong>YSG0001</strong> warning and <code>SpirVOpTable</code> is not generated, so the compiler project will not build.')}

<h2>Why generate it?</h2>
<p>Hand-written tables drift from the specification. Generating from the grammar means each operation exposes its name, whether it has a result and a result type, and its header encoding, straight from the source of truth. Updating to a newer SPIR-V release is replacing one JSON file.</p>

<h2>Using the table</h2>
${code('csharp', `module.AddLine(SpirVOpTable.OpReturn);
module.AddResultLine("%entry", SpirVOpTable.OpLabel);`)}`,
    },
  ];

  /* ------------------------------------------------------------------ reference */
  const reference = [
    {
      slug: 'builtin-values-across-styles',
      wide: true,
      title: 'Built-in values across styles',
      kind: 'Reference',
      heroKind: 'reference',
      icon: 'list',
      summary: 'The same built-in value, spelled in the HLSL, GLSL, Metal, Vulkan and WGSL vocabularies.',
      body: `
<h2>Overview</h2>
<p>Each row is one concept; each column is how a style names it. A dash means the style does not provide an attribute for that concept. Names are verified against the language sources.</p>
${builtinMapTable()}
<p>For resources and binding slots, see <a href="${D}resource-attributes-across-styles/">Resource attributes across styles</a>.</p>`,
    },
    {
      slug: 'resource-attributes-across-styles',
      wide: true,
      title: 'Resource attributes across styles',
      kind: 'Reference',
      heroKind: 'reference',
      icon: 'list',
      summary: 'Uniform buffers, storage buffers and binding slots in each vocabulary.',
      body: `
<h2>Overview</h2>
${resourceMapTable()}
<h2>Shared attributes</h2>
<p>Independent of style, <code>YotsubaShader.Language</code> provides <code>[Uniform]</code>, <code>[StorageBuffer(Access = …)]</code> and <code>[Binding(set, binding)]</code>. See <a href="${D}uniforms-and-storage-buffers/">Uniforms and storage buffers</a>.</p>
<h2>Metal-style textures and samplers</h2>
<p>The Metal vocabulary adds <code>[texture(n)]</code> and <code>[sampler(n)]</code> alongside <code>[buffer(n)]</code>, <code>[constant]</code> and <code>[device(readOnly)]</code>.</p>`,
    },
    ...Object.keys(STYLE_META).map((id) => styleArticle(ctx, id)),
  ];

  /* -------------------------------------------------------------------- project */
  const project = [
    {
      slug: 'repository-architecture',
      title: 'Repository architecture',
      kind: 'Article',
      icon: 'tree',
      summary: 'The projects in the solution and how they depend on each other.',
      body: `
<h2>Projects</h2>
${table(
  ['Project', 'Role', 'Depends on'],
  [
    ['<code>YotsubaShader.Language</code>', 'Authoring layer: stages, attributes, resources and the types you map to the GPU.', '—'],
    ['<code>YotsubaShader.IR</code>', 'Shared model between the frontend and backends.', '—'],
    ['<code>YotsubaShader.Frontend</code>', 'Discovery and semantic analysis of C# shaders (Roslyn).', 'Language, IR, Compiler'],
    ['<code>YotsubaShader.Compiler</code>', 'SPIR-V module construction and encoding.', 'Generator (analyzer), MonoGame framework'],
    ['<code>YotsubaShader.Generator</code>', 'SPIR-V operation table generated from the Khronos grammar.', 'Roslyn (build time only)'],
    ['<code>YotsubaShader.Example</code>', 'Executable example of low-level SPIR-V assembly.', 'Compiler'],
    ['<code>YotsubaShader.Frontend.Tests</code>', 'Frontend discovery and analysis tests (xUnit).', 'Frontend'],
  ],
)}

<h2>Requirements</h2>
<ul>
  <li>.NET 8 SDK (<code>net8.0</code>; the generator targets <code>netstandard2.0</code>).</li>
  <li>macOS, Linux or Windows with a compatible SDK.</li>
</ul>
${code('bash', `dotnet build YotsubaShader.sln
dotnet run --project YotsubaShader.Example/YotsubaShader.Example.csproj`)}`,
    },
    {
      slug: 'licensing',
      title: 'Licensing',
      kind: 'Article',
      icon: 'doc',
      summary: 'Yotsuba Shader is released under the MIT License.',
      body: `
<h2>Overview</h2>
<p>Yotsuba Shader is released under the <strong>MIT License</strong>. You can use, copy, modify, merge, publish, distribute, sublicense and sell it, including inside proprietary engines, frameworks, editors and games, with no fee and without publishing your own source code. The only condition is to keep the copyright notice and the license text.</p>

<h2>Your shaders and their binaries</h2>
<p>The shaders you write and the binaries Yotsuba Shader generates from them belong to you. Nothing in them is subject to a copyleft requirement.</p>

<h2>Third-party components</h2>
<p>Roslyn (<code>Microsoft.CodeAnalysis</code>) and the SPIR-V grammar from the Khronos Group are used under the MIT License, and their notices are kept in the repository. Naga, used by the <code>Transpile</code> API, is licensed under MIT or Apache-2.0.</p>

<h2>Name and logo</h2>
<p>The license covers the code. The name Yotsuba Shader and its logo are not part of it.</p>

<h2>Source</h2>
<p>The binding text is the <code>LICENSE</code> file in the <a href="${SITE.repo}" rel="noopener">repository</a>.</p>`,
    },
  ];

  return { core, reference, project };
}

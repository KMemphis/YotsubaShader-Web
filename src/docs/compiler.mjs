import { apiSource } from '../current-api.mjs';
// Documentation articles: compiler, reference and project.
import { icon, code, table, note, styleTabs, ideWindow } from '../components.mjs';
import { builtinValuesCode, attributeGroupCode, textureBindingCode, STYLE_IDS } from '../examples.mjs';
import { resourcesCode } from '../pages/syntaxes.mjs';
import { builtinMapTable, resourceMapTable, SYNTAX_META } from '../reference.mjs';
import { SITE } from '../site.mjs';
import { TRANSPILE_USE } from '../snippets.mjs';

const D = '/documentation/yotsuba-shader/';

/** Download links of the two reference PDFs (syntax table and backend compatibility), in the page's language. */
export const PDF_LINKS = `<p>Use the source-generated attribute pages below as the current reference. Earlier PDF guides and their source archive have not been updated for this API and are no longer linked as current documentation.</p>`;
const BUILTIN_VALUES = Object.fromEntries(STYLE_IDS.map((id) => [id, builtinValuesCode(id)]));
const RESOURCES_BY_SYNTAX = Object.fromEntries(STYLE_IDS.map((id) => [id, resourcesCode(id)]));
const TEXTURES_BY_SYNTAX = Object.fromEntries(STYLE_IDS.map((id) => [id, textureBindingCode(id)]));

const syntaxArticle = (ctx, id) => {
  const meta = SYNTAX_META[id];
  const items = (ctx.syntaxes[id] && ctx.syntaxes[id].items) || [];
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
      return `<h2>${titles[g]}</h2><p>${blurb[g]}</p>${code('csharp', attributeGroupCode(id, items, g), `${g.replace(/\W+/g, '')}.cs`)}`;
    })
    .join('');
  const exampleAttr = { hlsl: 'SV_Position', glsl: 'gl_Position', msl: 'position', spirv: 'BuiltIn_Position', wgsl: '@builtin_position' }[id];
  return {
    slug: `${id}-syntax-attributes`,
    title: `${meta.name} attributes`,
    kind: 'Reference',
    heroKind: 'reference',
    icon: 'list',
    summary: `Every attribute of the ${meta.name}: ${/^[A-Z][a-z]/.test(meta.summary) ? meta.summary.charAt(0).toLowerCase() + meta.summary.slice(1) : meta.summary}`,
    body: `
<h2>Overview</h2>
<p>The ${meta.name} is inspired by <strong>${meta.inspired}</strong>. It contains ${ctx.syntaxes[id].total} attributes in the <code>${meta.project}</code> package, whose namespace has the same name. They are generated below from its sources.</p>
${code('csharp', `using ${meta.namespace};

public struct VertexOutput
{
    [${exampleAttr}]
    public Vector4 Position;
}`)}
<p>These pages list declared attributes. They do not imply that every concept is lowered by Roslyn or supported by every output target. Vector names in the listings require compatible project types.</p>
<p>See the same concepts side by side in <a href="${D}builtin-values-across-syntaxes/">Built-in values across syntaxes</a> and <a href="${D}resource-attributes-across-syntaxes/">Resource attributes across syntaxes</a>.</p>
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
      summary: "Current compilation stages and the boundaries between implemented APIs and planned build integration.",
      body: `
<h2>Overview</h2>
<p>The repository is in pre-release development. Attribute declarations and low-level APIs exist, but the complete C# → IR → SPIR-V pipeline is not finished. Authoring examples describe interfaces; they are not end-to-end compilation guarantees.</p>
<p>The current projects are <code>YotsubaShader.Language</code>, the five syntax projects, <code>YotsubaShader.Concepts</code>, <code>YotsubaShader.Roslyn</code>, <code>YotsubaShader.IR</code>, and <code>YotsubaShader.Compiler.SpirV</code>.</p>
<h2>Step by step</h2>
<p><code>ShaderDiscovery.Find(compilation, token)</code> finds entry points. <code>ShaderProcessor.Process(compilation, token)</code> attempts to build IR and accumulates results in its <code>Shaders</code> list. Body processing is partial: assignments, return statements, calls, and many other operations still throw <code>NotImplementedException</code>.</p>
<p><code>SpirVCompiler.Compile(SpirVModule)</code> encodes an explicitly assembled module. It does not accept a C# string or an IR <code>Shader</code>. The IR-to-SPIR-V lowering path remains unfinished.</p>
<h2>Build integration</h2>
<p>A shader compilation CLI and build-time shader source generator are planned. The existing <code>YotsubaShader.Generator</code> generates the SPIR-V instruction table, not compiled shader classes.</p>
`,
    },

    /* ---------------------------------------------------------------- */
    {
      slug: 'shader-diagnostics-in-your-ide',
      title: 'Shader diagnostics in your IDE',
      kind: 'Article',
      icon: 'doc',
      summary: "Available C# checks and exceptions, with planned IDE shader diagnostics identified explicitly.",
      body: `
<h2>Current status</h2>
<p>C# checks attribute names, constructor arguments, and allowed attribute targets. Roslyn discovery and processing also perform some checks, but processing errors currently surface as exceptions.</p>
<p>Live shader diagnostics, per-backend compatibility warnings, <code>YotsubaTargets</code>, and the previously illustrated <code>YS1003</code>, <code>YS2001</code>, and <code>YS2002</code> analyzer messages are planned; their implementation was not found in the repository.</p>
<p>The implemented source generator reports <code>YSG0001</code> when its SPIR-V grammar input is missing. That diagnostic belongs to operation-table generation, not shader validation.</p>
`,
    },
    {
      slug: 'generating-shader-binaries',
      title: 'Generating shader binaries',
      kind: 'Article',
      icon: 'doc',
      summary: "Encode manually assembled SPIR-V modules; shader source generation and the shader CLI are planned.",
      body: `
<h2>Current API</h2>
<p>The implemented binary encoder is <code>YotsubaShader.Compiler.SpirV.SpirVCompiler</code>. Its input is a manually built <code>SpirVModule</code>; its output is <code>byte[]</code>.</p>
${code('csharp', `using YotsubaShader.Compiler.SpirV;
using YotsubaShader.Compiler.SpirV.Builder;

static byte[] EncodeModule(SpirVModule module)
{
    return new SpirVCompiler().Compile(module);
}`)}
<p>The caller must supply a complete, valid module and validate the result with SPIR-V tools. Encoding a module is not the same as compiling a C# shader.</p>
<h2>Planned workflows</h2>
<p>The documented <code>yotsuba compile</code> command, <code>YotsubaTargets</code> MSBuild property, <code>YotsubaShader.SourceGenerator</code> package, and generated <code>ShaderCompiledCode</code> properties are not implemented in this checkout. No installation or usage command is provided for them.</p>
<p>The language declares <code>CompilerGeneratedCodeAttribute</code> and <code>Binaries</code>. These declarations express intended output choices; they do not implement generation or prove that each format is supported.</p>
${code('csharp', apiSource('YotsubaShader.Language/Compiler/CompilerGeneratedCodeAttribute.cs'))}
`,
    },

    /* ---------------------------------------------------------------- */
    {
      slug: 'transpiling-spirv',
      title: 'Transpiling from SPIR-V',
      kind: 'Article',
      icon: 'doc',
      summary: "Use the actual Parser and backend compiler classes of YotsubaShaderCross. WGSL remains planned.",
      body: `
<h2>Current API</h2>
<p>YotsubaShaderCross exposes <code>Parser</code>, <code>CompilerGLSL</code>, <code>CompilerHLSL</code>, <code>CompilerMSL</code>, and reflection APIs. There is no <code>YotsubaShader.Transpile</code> namespace or <code>Transpile.FromSpirVTo*</code> wrapper in this checkout.</p>
${code('csharp', TRANSPILE_USE, 'SpirvToGlsl.cs')}
<p>For GLSL ES, set <code>options.es = true</code> and choose an appropriate version, such as <code>300</code>. For HLSL or MSL, use their compiler classes and backend-specific options. The result is source text; the target graphics toolchain still compiles that text.</p>
<p>WGSL emission is planned for 2027 and has no implemented compiler class. <code>CompilerCSHARP</code> exists as a stub whose constructors throw <code>NotImplementedException</code>. Neither is a usable conversion path today.</p>
<p>The translated library targets .NET 8. Managed code alone does not establish compatibility with every console, browser, AOT environment, or GPU driver; validate your intended platform separately.</p>
`,
    },

    /* ---------------------------------------------------------------- */
    {
      slug: 'shader-discovery',
      title: 'Shader discovery',
      kind: 'Article',
      icon: 'doc',
      summary: 'How the frontend finds shaders in a Roslyn compilation, by symbol rather than by text.',
      body: `
<h2>Current API</h2>
<p><code>ShaderDiscovery.Find(Compilation, CancellationToken)</code> belongs to <code>YotsubaShader.Roslyn</code>. It inspects types declared in the current assembly and finds ordinary methods carrying <code>YotsubaShader.Language.ShaderStageAttribute</code>. Check C# compilation errors before discovery.</p>
${code('csharp', `using Microsoft.CodeAnalysis;
using YotsubaShader.Roslyn;

static void Inspect(Compilation compilation)
{
    var shaders = ShaderDiscovery.Find(compilation);
    foreach (var shader in shaders)
    foreach (var entry in shader.EntryPoints)
        System.Console.WriteLine($"{shader.FullName}.{entry.Name}: {entry.Stage}");
}`)}
<p>Private methods and nested types are inspected. Helpers without the stage attribute are not entry points. Referenced assemblies are not searched for shader classes. Discovery reads declarations; it does not establish that method bodies compile to GPU instructions.</p>
<h2>The model</h2>
${code('csharp', apiSource('YotsubaShader.Roslyn/Model/ShaderInfo.cs'))}
`,
    },

    /* ---------------------------------------------------------------- */
    {
      slug: 'intermediate-representation',
      title: 'Intermediate representation',
      kind: 'Article',
      icon: 'doc',
      summary: 'The backend-neutral model that sits between the frontend and every backend.',
      body: `
<h2>Current declarations</h2>
${code('csharp', apiSource('YotsubaShader.IR/Intermediate/Shader.cs'))}
${code('csharp', apiSource('YotsubaShader.IR/Intermediate/Function.cs'))}
${code('csharp', apiSource('YotsubaShader.IR/Intermediate/Storage.cs'))}
${code('csharp', apiSource('YotsubaShader.IR/Intermediate/StorageKind.cs'))}
<p>A <code>Shader</code> currently contains only <code>Functions</code>; its constructor has no <code>Constants</code> parameter. Storage types and interface slots describe the IR model, independently of whether frontend lowering or backend emission is implemented for each case.</p>
<h2>Function bodies</h2>
${code('csharp', apiSource('YotsubaShader.IR/Intermediate/FunctionBody/Statements/Block.cs'))}
${code('csharp', apiSource('YotsubaShader.IR/Intermediate/FunctionBody/Statements/VariableDeclaration.cs'))}
<p>Block traversal is implemented. Local declaration processing creates storage but remains unfinished; expression processing and numerous statement handlers still throw. An IR type declaration is not evidence of complete C# support.</p>
`,
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
  <li><code>YotsubaShader.Compiler.SpirV</code> references it as an analyzer and declares the grammar as an <code>AdditionalFile</code>.</li>
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
      slug: 'builtin-values-across-syntaxes',
      title: 'Built-in values across syntaxes',
      kind: 'Reference',
      heroKind: 'reference',
      icon: 'list',
      summary: 'The same built-in value, spelled in the HLSL, GLSL, MSL, SPIR-V and WGSL syntaxes.',
      body: `
<h2>Overview</h2>
<p>Every built-in value of a syntax, grouped by stage and written as C#. Pick the tab of your syntax. The comment above each member names the concept, so you can find the same value in any other tab.</p>
${styleTabs(BUILTIN_VALUES, { file: 'BuiltIns.cs' })}
<p>For resources and binding slots, see <a href="${D}resource-attributes-across-syntaxes/">Resource attributes across syntaxes</a>.</p>
<h2>Printable references</h2>
<p>The reference below describes declarations in this checkout; it does not certify backend compatibility.</p>
${PDF_LINKS}`,
    },
    {
      slug: 'resource-attributes-across-syntaxes',
      title: 'Resource attributes across syntaxes',
      kind: 'Reference',
      heroKind: 'reference',
      icon: 'list',
      summary: 'Uniform buffers, storage buffers, textures, samplers and binding slots in each syntax.',
      body: `
<h2>Uniform and storage buffers</h2>
<p>These are declaration examples with binding slots. Access markers differ by syntax; the GLSL and SPIR-V examples do not distinguish read-only access.</p>
${styleTabs(RESOURCES_BY_SYNTAX, { file: 'Resources.cs' })}

<h2>Textures and samplers</h2>
<p>A texture and a sampler bound to their slots.</p>
${styleTabs(TEXTURES_BY_SYNTAX, { file: 'Surface.cs' })}

<h2>Resource namespaces</h2>
<p>Resources belong to each syntax namespace, such as <code>YotsubaShader.HlslSyntax.Resources</code> or <code>YotsubaShader.SpirvSyntax.Resources</code>. Declarations are not proof of complete resource lowering. See the buffer tutorial for current constructors.</p>`,
    },
    ...Object.keys(SYNTAX_META).map((id) => syntaxArticle(ctx, id)),
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
    ['<code>YotsubaShader.Concepts</code>', 'Shared concept markers for syntax attributes.', '—'],
    ['<code>YotsubaShader.IR</code>', 'Shared model between the frontend and backends.', '—'],
    ['<code>YotsubaShader.Roslyn</code>', 'Discovery and semantic analysis of C# shaders (Roslyn).', 'Concepts, Language, IR, Roslyn package'],
    ['<code>YotsubaShader.Compiler.SpirV</code>', 'SPIR-V module construction and encoding.', 'IR, Generator (analyzer), MonoGame package'],
    ['<code>YotsubaShader.Generator</code>', 'SPIR-V operation table generated from the Khronos grammar.', 'Roslyn (build time only)'],
    ['<code>YotsubaShaderCross</code>', 'Managed SPIRV-Cross translation for GLSL, GLSL ES, HLSL, MSL, and reflection. WGSL is planned.', '—'],
    ['<code>YotsubaShader.Example</code>', 'Executable example of low-level SPIR-V assembly.', 'Compiler'],
    ['<code>YotsubaShader.Frontend.Tests</code>', 'Frontend discovery and analysis tests (xUnit).', 'Roslyn, Language, HlslSyntax, SpirvSyntax, MonoGame, xUnit'],
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
      summary: 'Yotsuba Shader is released under the Microsoft Public License (MS-PL).',
      body: `
<h2>Overview</h2>
<p>Yotsuba Shader is released under the <strong>Microsoft Public License (MS-PL)</strong>. You can reproduce, modify, and distribute it, including inside proprietary engines, frameworks, editors and games, with no fee and without publishing your own source code. The main condition is to retain all copyright, patent, trademark, and attribution notices. If you distribute any portion in source code form, you must do so under the MS-PL.</p>

<h2>Your shaders and their binaries</h2>
<p>The shaders you write and the binaries Yotsuba Shader generates from them belong to you. Nothing in them is subject to a copyleft requirement.</p>

<h2>Third-party components</h2>
<p>Roslyn (<code>Microsoft.CodeAnalysis</code>) and the SPIR-V grammar from the Khronos Group are used under the MIT License, and their notices are kept in the repository. Yotsuba ShaderCross is released under the MS-PL. Its translated SPIRV-Cross code retains the original copyright notices from SPIRV-Cross, which is dual-licensed under Apache-2.0 OR MIT and is used here under the MIT License.</p>

<h2>Name and logo</h2>
<p>The license covers the code. The name Yotsuba Shader and its logo are not part of it.</p>

<h2>Source</h2>
<p>The binding text is the <code>LICENSE</code> file in the <a href="${SITE.repo}" rel="noopener">repository</a>.</p>`,
    },
  ];

  return { core, reference, project };
}

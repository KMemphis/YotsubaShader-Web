import { apiSource } from '../current-api.mjs';
// Documentation articles: essentials + language.
import { icon, code, styleTabs, engineTabs, table, note } from '../components.mjs';
import { STYLE_TRIANGLE, STYLE_RESOURCES, BASIC_COLOR, TYPES_CS } from '../snippets.mjs';
import { builtinMapTable, resourceMapTable } from '../reference.mjs';
import { resourcesCode } from '../pages/syntaxes.mjs';
import { textureBindingCode, STYLE_IDS } from '../examples.mjs';

const D = '/documentation/yotsuba-shader/';

const TEXTURE_BINDINGS = Object.fromEntries(STYLE_IDS.map((id) => [id, textureBindingCode(id)]));
const RESOURCES_BY_STYLE = Object.fromEntries(STYLE_IDS.map((id) => [id, resourcesCode(id)]));


export default [
  /* ------------------------------------------------------------------ */
  {
    slug: 'understanding-yotsuba-shader',
    title: 'Understanding Yotsuba Shader',
    kind: 'Article',
    icon: 'doc',
    summary: 'Discover how a C# class becomes a shader: the language, the intermediate representation and the compiler.',
    body: `
<h2>Overview</h2>
<p class="lead-p">Yotsuba Shader is the shader authoring layer for your engine, framework or content tool. Your team writes shaders in C# using types, structures and attributes. The compiler interprets their interfaces and stages, lowers them to a shared intermediate representation, and generates output for the selected backend.</p>
<p>The central idea is simple: <strong>the syntax you write with does not determine the output target</strong>. HLSL, GLSL, MSL, SPIR-V and WGSL provide equivalent authoring vocabularies. Choose the one your team knows best, then select SPIR-V or another backend when compiling.</p>
<figure class="code" data-lang="text"><figcaption><span class="code-file">Pipeline</span></figcaption><pre><code>C# with familiar attributes
          ↓
semantic analysis and validation
          ↓
Yotsuba IR
          ↓
SPIR-V · future backends</code></pre></figure>

<h2>The three layers</h2>
<p>Yotsuba Shader is organised around three ideas that map to separate projects:</p>
<ul>
  <li><strong>Language</strong> (<code>YotsubaShader.Language</code>): the attributes and native types you write against. See <a href="${D}shader-stages/">Shader stages</a>.</li>
  <li><strong>Intermediate representation</strong> (<code>YotsubaShader.IR</code>): a backend-neutral model of functions, storage and interface slots. See <a href="${D}intermediate-representation/">Intermediate representation</a>.</li>
  <li><strong>Compiler</strong> (<code>YotsubaShader.Roslyn</code>, <code>YotsubaShader.Compiler.SpirV</code>): discovery, analysis and SPIR-V emission. See <a href="${D}compilation-pipeline/">Compilation pipeline</a>.</li>
</ul>

<h2>A shader in one glance</h2>
${code('csharp', BASIC_COLOR, 'BasicColorShader.cs')}
<p>The example uses HLSL semantics: <code>[POSITION]</code> and <code>[COLOR]</code>, plus the built-in <code>[SV_Position]</code>. Numbered <code>[Location(n)]</code> attributes belong to the separate SPIR-V syntax namespace.</p>

<h2>Why attributes?</h2>
<p>Attributes make the interface explicit: inputs, outputs, resources, locations, bindings and stages are all declared, never inferred from naming conventions. That is what lets the compiler validate a shader before any GPU is involved.</p>`,
  },

  /* ------------------------------------------------------------------ */
  {
    slug: 'writing-your-first-shader',
    title: 'Writing your first shader',
    kind: 'Tutorial',
    icon: 'braces',
    summary: 'Declare vertex inputs and outputs, then write a vertex stage and a fragment stage that pass a color through.',
    body: `
<h2>Overview</h2>
<p>This HLSL-style authoring example uses MonoGame types and reuses the vertex output as fragment input. <code>POSITION</code> and <code>COLOR</code> are HLSL user semantics; <code>SV_Position</code> is a built-in, and the return attribute <code>SV_Target(0)</code> identifies the fragment color output.</p>
${code('csharp', BASIC_COLOR, 'BasicColorShader.cs')}
<h2>What happens between stages</h2>
<p>The application supplies positions and colors. The vertex stage writes clip-space position with z = 0 and w = 1 and passes color onward. The rasterizer interpolates color for the fragment stage. The application remains responsible for vertex layout, render targets, pipeline creation, and draw calls.</p>
<p>This is an authoring example, not a successful C#-to-SPIR-V compilation test. MonoGame types without native mapping attributes are treated as ordinary structs by the current processor. Body lowering is still incomplete.</p>
`,
  },

  /* ------------------------------------------------------------------ */
  {
    slug: 'reusing-your-types-and-libraries',
    title: 'Reusing your types and libraries',
    kind: 'Article',
    icon: 'braces',
    summary: "Annotate compatible project types and understand the current limits of referenced shader libraries.",
    body: `
<h2>Map your types to the GPU</h2>
<p>Vector mapping uses <code>YotsubaShader.Language.Native.Types.Vector</code>. Mark the type with <code>[Vector]</code> and its ordered components with <code>[VectorComponent(index)]</code>. Components must share a supported scalar type.</p>
${code('csharp', `using YotsubaShader.Language.Native.Types.Vector;

[Vector]
public struct Float2
{
    [VectorComponent(0)] public float X;
    [VectorComponent(1)] public float Y;

    public Float2(float x, float y) { X = x; Y = y; }
}`)}
<p>A name such as <code>Vector2</code> does not provide native vector semantics. You can annotate types you own; an unchanged third-party assembly cannot acquire these attributes through a using directive. Unannotated structs are inspected as fields and properties.</p>
<h2>Sharing libraries</h2>
<p>You can distribute C# types and shader source through NuGet. GPU compilation of arbitrary library methods is not implemented: shader discovery only searches the current assembly, and invocation processing is unfinished. Packaging code does not establish GPU compatibility.</p>
`,
  },

  /* ------------------------------------------------------------------ */
  {
    slug: 'types-for-engines-and-frameworks',
    title: 'Types for engines and frameworks',
    kind: 'Tutorial',
    icon: 'braces',
    summary: "Current vector, matrix, texture, and sampler declarations for engine authors.",
    body: `
<h2>Current type annotations</h2>
<p>The following declarations use the current vector and matrix authoring attributes. Vector metadata is processed today. Matrix attributes exist, but their presence does not imply that matrix operations and backend lowering are implemented.</p>
${code('csharp', TYPES_CS, 'Types.cs')}
<h2>Textures and samplers</h2>
<p>Texture attributes live in <code>YotsubaShader.Language.Native.Types.Texture</code>; sampler attributes live in <code>YotsubaShader.Language.Native.Types</code>. These declarations describe types, not sampling methods or GPU resource creation.</p>
${code('csharp', `using YotsubaShader.Language.Native.Types;
using YotsubaShader.Language.Native.Types.Texture;

[Texture(TextureDimension.D2, TextureComponentTypes.Float)]
public struct Texture2D { }

[Sampler]
public struct SamplerState { }`)}
<p>Engine integration still needs explicit CPU/GPU layout rules, binding reflection, shader compilation, and runtime loading. There is no official MonoGame, Godot, or Unity adapter in this checkout.</p>
`,
  },

  /* ------------------------------------------------------------------ */
  {
    slug: 'choosing-a-syntax',
    title: 'Choosing a syntax',
    kind: 'Article',
    icon: 'braces',
    summary: 'The HLSL, GLSL, MSL, SPIR-V and WGSL syntaxes express the same intent. Pick the one your team knows.',
    body: `
<h2>Overview</h2>
<p>The five examples below are the same shader: a vertex and a fragment stage, plus a compute stage that writes to a storage buffer. Only the attribute names change. Switch between them with the tabs, or with the <strong>Syntax</strong> menu at the top of the page; your choice is remembered across the documentation.</p>
${note('important', 'The HLSL syntax does not require an HLSL target, and the WGSL syntax does not require WebGPU. These are C# authoring choices; the compilation targets are selected separately.')}
<h2>One package per syntax</h2>
<p>Each syntax is its own package with a namespace of the same name: <code>YotsubaShader.HlslSyntax</code>, <code>YotsubaShader.GlslSyntax</code>, <code>YotsubaShader.MslSyntax</code>, <code>YotsubaShader.SpirvSyntax</code> and <code>YotsubaShader.WgslSyntax</code>. Resource attributes live in its <code>.Resources</code> namespace, for example <code>YotsubaShader.HlslSyntax.Resources</code>. They reference <code>YotsubaShader.Language</code> for stage and native-type annotations and <code>YotsubaShader.Concepts</code> for shared concepts. Locations and resource attributes are supplied by syntax namespaces. Engines and frameworks build on that core; add only the syntax you write with.</p>

<h2>The same shader in five syntaxes</h2>
${styleTabs(STYLE_TRIANGLE)}
<p>These names deliberately resemble their source languages. In C#, WGSL-inspired attributes use <code>@</code> in the identifier, as in <code>[@builtin_position]</code>, while remaining valid C#.</p>

<h2>Resources in five syntaxes</h2>
<p>Uniform buffers and binding slots follow the same pattern.</p>
${styleTabs(STYLE_RESOURCES, { file: 'Lighting.cs' })}
<p>The shared <code>[Uniform]</code>, <code>[StorageBuffer]</code> and <code>[Binding]</code> attributes in <code>YotsubaShader.Language</code> work in every syntax as well.</p>

<h2>Which one should I pick?</h2>
<ul>
  <li><strong>Your team already knows a shading language:</strong> use its syntax. Nothing in the IR depends on the syntax.</li>
  <li><strong>You target a single API:</strong> the matching syntax reads most naturally (MSL for Metal, SPIR-V for Vulkan), but it is a convenience, not a requirement.</li>
  <li><strong>You are starting fresh:</strong> the HLSL syntax is a good first choice. The relationship between stages, inputs, position and fragment color is easy to see.</li>
</ul>
${note('tip', 'Several names exist in more than one syntax namespace (for example <code>uniform</code> and <code>buffer</code>). Import <strong>one</strong> syntax namespace per file to keep names unambiguous.')}

<h2>Equivalence</h2>
<p>Each syntax is meant to be semantically equivalent to the others. The frontend already maps the position and vertex-index attributes of all five syntaxes to the same IR built-ins. See the full table in <a href="${D}builtin-values-across-syntaxes/">Built-in values across syntaxes</a>.</p>`,
  },

  /* ------------------------------------------------------------------ */
  {
    slug: 'shader-stages',
    title: 'Shader stages',
    kind: 'Article',
    icon: 'doc',
    summary: 'Mark methods with [ShaderStage] to declare vertex, fragment and compute entry points.',
    body: `
<h2>Current declarations</h2>
${code('csharp', apiSource('YotsubaShader.Language/Stage.cs'))}
${code('csharp', apiSource('YotsubaShader.Language/ShaderStageAttribute.cs'))}
<p>The public authoring enum contains only <code>Vertex</code>, <code>Fragment</code>, and <code>Compute</code>. Other stages mentioned in the roadmap are not current enum values. Declaring a stage does not imply that its complete body can be compiled.</p>
${code('csharp', BASIC_COLOR, 'BasicColorShader.cs')}
<h2>Compute declarations</h2>
${code('csharp', `using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

public class ComputeShader
{
    [ShaderStage(Stage.Compute)]
    [numthreads(8, 8, 1)]
    public void Main() { }
}`)}
<p>The HLSL, GLSL, and WGSL vocabularies declare <code>numthreads</code>, <code>layout_local_size</code>, and <code>workgroup_size</code> respectively. A declared built-in or workgroup attribute may still lack processing support.</p>
`,
  },

  /* ------------------------------------------------------------------ */
  {
    slug: 'interface-slots-and-locations',
    title: 'Interface slots and locations',
    kind: 'Article',
    icon: 'doc',
    summary: 'Describe how data flows into and out of a stage with [Location] and built-in attributes.',
    body: `
<h2>Locations and user semantics</h2>
<p><code>[Location(n)]</code> is a concrete attribute in <code>YotsubaShader.SpirvSyntax</code>. <code>YotsubaShader.Concepts.LocationAttribute</code> is its concept marker and has no integer constructor. These are different types.</p>
${code('csharp', `using Microsoft.Xna.Framework;
using YotsubaShader.HlslSyntax;

public struct StageData
{
    [SV_Position] public Vector4 Position;
    [COLOR] public Vector4 Color;
}`)}
<p>For HLSL user semantics, use <code>[POSITION]</code>, <code>[COLOR]</code>, <code>[TEXCOORD]</code>, <code>[NORMAL]</code>, <code>[TANGENT]</code>, or <code>[BINORMAL]</code>, optionally with an index. The processor maps them to <code>VertexSlot</code>. Numbered locations map to <code>LocationSlot</code>.</p>
<h2>Built-in processing</h2>
<p>The current slot resolver handles position/fragment coordinates according to the stage, vertex index, numbered locations, and HLSL user semantics. The syntax packages declare many additional built-ins; declaration alone does not mean the resolver handles them.</p>
<p>Use <code>[return: SV_Target(0)]</code> for an HLSL-style fragment color return. Reusing the vertex-output struct as fragment input is allowed by the authoring model; its position semantic is interpreted for the receiving stage.</p>
`,
  },

  /* ------------------------------------------------------------------ */
  {
    slug: 'uniforms-and-storage-buffers',
    title: 'Uniforms and storage buffers',
    kind: 'Tutorial',
    icon: 'doc',
    summary: "Declare buffers and bindings using the resource namespaces and constructors that exist today.",
    body: `
<h2>Resource namespaces</h2>
<p>Resource attributes belong to each syntax project, not <code>YotsubaShader.Language.Resources</code>. The current SPIR-V vocabulary uses separate <code>DescriptorSet</code> and <code>Binding</code> attributes. There is no shared <code>Binding(set, binding)</code> constructor or <code>ResourceAccess</code> enum.</p>
${code('csharp', `using YotsubaShader.HlslSyntax.Resources;

public struct Settings
{
    public float Exposure;
}

public class Resources
{
    [cbuffer, register(RegisterPrefix.b, 0)]
    public Settings Settings;

    [register(RegisterPrefix.u, 0)]
    public RWStructuredBuffer<float> Values;
}`)}
<p><code>StorageBuffer</code> has no <code>Access</code> property. Use the syntax-specific declarations shown below; GLSL and SPIR-V use the same buffer marker for both examples and do not express a read-only choice through that marker.</p>
${styleTabs(RESOURCES_BY_STYLE, { file: 'Resources.cs' })}
<p>Resource metadata and binding concepts exist. Automatic uploading, complete field discovery, GPU array operations, and layout/reflection integration must not be assumed to work end to end.</p>
`,
  },

  /* ------------------------------------------------------------------ */
  {
    slug: 'textures-and-samplers',
    title: 'Textures and samplers',
    kind: 'Tutorial',
    icon: 'doc',
    summary: 'Declare textures and samplers, describe exactly what kind of image each one is, and bind them in the syntax you write in.',
    body: `
<h2>Texture type metadata</h2>
${code('csharp', apiSource('YotsubaShader.Language/Native/Types/Texture/TextureDimension.cs'))}
${code('csharp', apiSource('YotsubaShader.Language/Native/Types/Texture/TextureAttribute.cs'))}
<p>Mark a type with <code>[Texture(dimension, componentTypes)]</code>. The named fields are <code>Usage</code>, <code>Depth</code>, <code>Format</code>, <code>Arrayed</code>, and <code>Multisampled</code>. The sampler marker is <code>YotsubaShader.Language.Native.Types.Sampler</code>.</p>
<h2>HLSL resource types</h2>
${code('csharp', `using YotsubaShader.HlslSyntax.Resources;
using YotsubaShader.HlslSyntax.Resources.Types;

public class Surface
{
    [register(RegisterPrefix.t, 0)]
    public Texture2D Albedo;

    [register(RegisterPrefix.s, 0)]
    public SamplerState Sampler;
}`)}
<p>The current HLSL <code>Texture2D</code> and <code>SamplerState</code> are metadata structs. They do not provide a <code>Sample</code> method or a CPU texture implementation. Texture sampling, CPU emulation, and runtime resource binding require additional implementation.</p>
`,
  },

  /* ------------------------------------------------------------------ */
  {
    slug: 'vectors-matrices-and-arrays',
    title: 'Vectors, matrices and arrays',
    kind: 'Tutorial',
    icon: 'doc',
    summary: 'Use scalars, vectors, matrices, structs and arrays in a shader, and learn how each C# type becomes a GPU type.',
    body: `
<h2>Scalars and vectors</h2>
<p>The current storage processor recognizes <code>bool</code>, <code>int</code>, <code>uint</code>, <code>float</code>, and <code>double</code>, plus types carrying vector mapping attributes. Vector components can be float, int, or uint; all components must have the same type.</p>
${code('csharp', TYPES_CS, 'Types.cs')}
<h2>Matrices and arrays</h2>
<p><code>MatrixAttribute</code>, <code>MatrixColumnAttribute</code>, and the IR matrix and array records exist. Matrix annotations describe column vectors. The current Roslyn storage path does not implement a complete native matrix or array mapping; documentation comments on IR array shapes are design intent, not a support list.</p>
<p>Unannotated structs are inspected recursively, skipping static members, implicitly declared members, and indexers. This type inspection does not implement arbitrary C# methods, operators, allocations, or managed collections on the GPU.</p>
`,
  },

  /* ------------------------------------------------------------------ */
  {
    slug: 'using-shaders-in-your-game',
    title: 'Using your shader in your game',
    kind: 'Tutorial',
    icon: 'braces',
    summary: "What an engine integration still needs, and when CPU debugging of shader logic is possible.",
    body: `
<h2>Current integration boundary</h2>
<p>The shader declaration is C# source. A working game integration also needs compiled stage binaries, matching vertex layouts, resource bindings, and graphics API calls. The repository does not currently provide a complete engine adapter or automatic MGFX generation.</p>
<p>For MonoGame, obtaining HLSL text is only one step toward a valid effect. Godot and Unity have their own shader formats and integration rules; a generated GLSL or HLSL file is not automatically a complete engine shader.</p>
<h2>CPU debugging</h2>
<p>C# shader logic can run under the .NET debugger when its types and operations have executable CPU implementations. Metadata-only textures and samplers do not provide that behavior. A CPU run does not reproduce rasterization, derivatives, GPU execution ordering, or driver compilation by itself.</p>
`,
  },

  /* ------------------------------------------------------------------ */
  {
    slug: 'shader-parameters-for-your-engine',
    title: 'Typed shader parameters for your engine',
    kind: 'Tutorial',
    icon: 'braces',
    summary: "A clearly separated engine-side design example, without assuming a generated runtime parameter API.",
    body: `
<h2>Typed CPU wrappers</h2>
<p>An engine can expose typed C# properties that forward values to its existing shader-parameter API. That wrapper is engine application code, not an implemented YotsubaShader runtime or generated parameter layer.</p>
${code('csharp', `public interface IExposureParameters
{
    float Exposure { get; set; }
}

public sealed class ExposureController(IExposureParameters parameters)
{
    public void SetExposure(float value)
    {
        parameters.Exposure = value;
    }
}`)}
<p>The example defines its own interface and does not upload data or compile shaders. To connect it to a GPU resource, implement it against your engine and agree on layout and bindings. <code>ShaderIgnore</code> exists as an attribute, but comprehensive filtering of arbitrary CPU members is not implemented by the current processor.</p>
`,
  },
];

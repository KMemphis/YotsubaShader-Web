// Documentation articles: essentials + language.
import { icon, code, styleTabs, table, note } from '../components.mjs';
import { STYLE_TRIANGLE, STYLE_RESOURCES, BASIC_COLOR } from '../snippets.mjs';
import { builtinMapTable, resourceMapTable } from '../reference.mjs';

const D = '/documentation/yotsuba-shader/';

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
<p>The central idea is simple: <strong>the attribute style you use does not determine the output target</strong>. HLSL, GLSL, Metal, Vulkan and WGSL provide equivalent authoring vocabularies. Choose the one your team knows best, then select SPIR-V or another backend when compiling.</p>
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
  <li><strong>Compiler</strong> (<code>YotsubaShader.Frontend</code>, <code>YotsubaShader.Compiler</code>): discovery, analysis and SPIR-V emission. See <a href="${D}compilation-pipeline/">Compilation pipeline</a>.</li>
</ul>

<h2>A shader in one glance</h2>
${code('csharp', BASIC_COLOR, 'BasicColorShader.cs')}
<p>The class is plain C#. <code>[ShaderStage]</code> marks the entry points, <code>[Location(n)]</code> numbers the data flowing between stages, and <code>[SV_Position]</code> names the position the GPU needs. Nothing here is specific to a graphics API.</p>

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
<p>This tutorial builds a color shader step by step. The vertex stage receives a position and a color per vertex, passes the color through, and the fragment stage returns it.</p>

<h2>Declare the vertex input</h2>
<p>A struct describes the data supplied by your engine. <code>[Location(n)]</code> numbers each input.</p>
${code('csharp', `public struct VertexInput
{
    [Location(0)]
    public Vector2 Position;

    [Location(1)]
    public Vector4 Color;
}`)}

<h2>Declare the vertex output</h2>
<p>The vertex stage must produce the clip-space position the GPU needs. Any additional field with a location is passed to the next stage.</p>
${code('csharp', `public struct VertexOutput
{
    [SV_Position]
    public Vector4 Position;

    [Location(0)]
    public Vector4 Color;
}`)}

<h2>Write the stages</h2>
${code('csharp', `public class BasicColorShader
{
    [ShaderStage(Stage.Vertex)]
    public VertexOutput Vertex(VertexInput input)
    {
        VertexOutput output;

        output.Position = new Vector4(input.Position.X, input.Position.Y, 0.0f, 1.0f);
        output.Color = input.Color;

        return output;
    }

    [ShaderStage(Stage.Fragment)]
    public Vector4 Fragment(VertexOutput input)
    {
        return input.Color;
    }
}`, 'BasicColorShader.cs')}
<p>Both methods live in the same class. Instance methods are fine; the class is only a container for entry points.</p>

<h2>Add the using directives</h2>
${code('csharp', `using Microsoft.Xna.Framework;                       // Vector2, Vector4
using YotsubaShader.Language;                        // ShaderStage, Stage
using YotsubaShader.Language.Attributes;             // Location
using YotsubaShader.Language.Attributes.HlslStyle;   // SV_Position (names inspired by HLSL)`)}

<h2>What the compiler does with it</h2>
<ol>
  <li><a href="${D}shader-discovery/">Discovery</a> finds <code>BasicColorShader</code> because two of its methods carry <code>[ShaderStage]</code>.</li>
  <li>The frontend turns each parameter into a storage with an interface slot. <code>[Location(0)]</code> becomes a location slot; <code>[SV_Position]</code> becomes the position built-in.</li>
  <li>The result is an IR <code>Function</code> per entry point, ready for a backend.</li>
</ol>

<h2>Try another vocabulary</h2>
<p>Replace <code>[SV_Position]</code> with <code>[gl_Position]</code>, <code>[position]</code>, <code>[BuiltIn_Position]</code> or <code>[@builtin_position]</code> (and the matching <code>using</code>) and the IR is identical. Read <a href="${D}choosing-an-authoring-style/">Choosing an authoring style</a>.</p>`,
  },

  /* ------------------------------------------------------------------ */
  {
    slug: 'reusing-your-types-and-libraries',
    title: 'Reusing your types and libraries',
    kind: 'Article',
    icon: 'braces',
    summary: 'Map the types of your own project to native GPU types, and build shaders on external libraries instead of duplicating them.',
    body: `
<h2>Overview</h2>
<p class="lead-p">Shaders written with Yotsuba Shader are part of your C# project. They can use the same vector, matrix and texture types as the rest of your code, and they can build on libraries written by others. There is no second, shader-only set of types to maintain.</p>

<h2>Map your types to the GPU</h2>
<p>An attribute tells the compiler which native GPU type a C# type stands for. A vector declares its components in order; all components share one type (<code>float</code>, <code>int</code> or <code>uint</code>).</p>
${code('csharp', `using YotsubaShader.Language.Native.Types.Vector;

[Vector]
public struct Vector3
{
    [VectorComponent(0)] public float X;
    [VectorComponent(1)] public float Y;
    [VectorComponent(2)] public float Z;

    public Vector3(float x, float y, float z) { X = x; Y = y; Z = z; }
}`, 'Types.cs')}
<p>The same mechanism covers matrices (<code>[Matrix]</code> with <code>[MatrixColumn]</code>), textures (<code>[Texture]</code>) and samplers (<code>[Sampler]</code>). Your game or application keeps using <code>Vector3</code> on the CPU; the shader receives it as a native GPU vector.</p>

<h2>Use them in a shader</h2>
${code('csharp', `public class LitShader
{
    [ShaderStage(Stage.Vertex)]
    public VertexOutput Vertex(VertexInput input) { /* uses Vector3 like any C# type */ }
}`, 'Shader.cs')}

<h2>Build on libraries</h2>
<p>A shader library is a normal .NET library: lighting, post-processing or material code that other projects reference and extend. Share it as a <a href="https://www.nuget.org/" rel="noopener">NuGet</a> package like any other C# code. Because the types are yours, a library can describe its inputs with the types your project already defines.</p>

<h2>The playground</h2>
<p>The <a href="/playground/">playground</a> starts from this idea: a <code>Types.cs</code> file declares the GPU types, and <code>Shader.cs</code> uses them. It does not reference <code>Microsoft.Xna.Framework</code> or any other math library.</p>`,
  },

  /* ------------------------------------------------------------------ */
  {
    slug: 'choosing-an-authoring-style',
    title: 'Choosing an authoring style',
    kind: 'Article',
    icon: 'braces',
    summary: 'HLSL, GLSL, Metal, Vulkan and WGSL vocabularies express the same intent. Pick the one your team knows.',
    body: `
<h2>Overview</h2>
<p>The five examples below are the same shader: a vertex and a fragment stage, plus a compute stage that writes to a storage buffer. Only the attribute names change. Switch between them with the tabs, or with the <strong>Style</strong> menu at the top of the page; your choice is remembered across the documentation.</p>
${note('important', 'An HLSL-like style does not require an HLSL target, and a WGSL-like style does not require WebGPU. These are C# authoring choices; the compilation target is selected separately.')}

<h2>The same shader in five styles</h2>
${styleTabs(STYLE_TRIANGLE)}
<p>These names deliberately resemble their source languages. In C#, WGSL-inspired attributes use <code>@</code> in the identifier, as in <code>[@builtin_position]</code>, while remaining valid C#.</p>

<h2>Resources in five styles</h2>
<p>Uniform buffers and binding slots follow the same pattern.</p>
${styleTabs(STYLE_RESOURCES, { file: 'Lighting.cs' })}
<p>The shared <code>[Uniform]</code>, <code>[StorageBuffer]</code> and <code>[Binding]</code> attributes in <code>YotsubaShader.Language</code> work in every style as well.</p>

<h2>Which one should I pick?</h2>
<ul>
  <li><strong>Your team already knows a shading language:</strong> use its vocabulary. Nothing in the IR depends on the style.</li>
  <li><strong>You target a single API:</strong> the matching style reads most naturally (Metal-like for Metal, Vulkan-like for Vulkan), but it is a convenience, not a requirement.</li>
  <li><strong>You are starting fresh:</strong> the HLSL-like style is a good first choice. The relationship between stages, inputs, position and fragment color is easy to see.</li>
</ul>
${note('tip', 'Several names exist in more than one style namespace (for example <code>uniform</code> and <code>buffer</code>). Import <strong>one</strong> style namespace per file to keep names unambiguous.')}

<h2>Equivalence</h2>
<p>Each style is meant to be semantically equivalent to the others. The frontend already maps the position and vertex-index attributes of all five styles to the same IR built-ins. See the full table in <a href="${D}builtin-values-across-styles/">Built-in values across styles</a>.</p>`,
  },

  /* ------------------------------------------------------------------ */
  {
    slug: 'shader-stages',
    title: 'Shader stages',
    kind: 'Article',
    icon: 'doc',
    summary: 'Mark methods with [ShaderStage] to declare vertex, fragment and compute entry points.',
    body: `
<h2>Overview</h2>
<p>A shader is a class, and its entry points are methods marked with <code>[ShaderStage]</code>. The attribute takes a value of the <code>Stage</code> enum.</p>
${code('csharp', `public enum Stage
{
    Vertex,
    Fragment,
    Compute
}

[AttributeUsage(AttributeTargets.Method)]
public class ShaderStageAttribute(Stage stage) : Attribute
{
    public Stage Stage = stage;
}`, 'YotsubaShader.Language')}

<h2>Vertex and fragment</h2>
<p>A vertex stage receives per-vertex input and returns a struct that includes the clip-space position. A fragment stage receives the interpolated values and returns the color for the render target.</p>
${code('csharp', `[ShaderStage(Stage.Vertex)]
public VertexOutput Vertex(VertexInput input) { /* ... */ }

[ShaderStage(Stage.Fragment)]
public Vector4 Fragment(VertexOutput input) => input.Color;`)}

<h2>Compute</h2>
<p>Compute stages use a workgroup size method attribute, plus built-in inputs such as the global invocation id. Each style spells these in its own way.</p>
${code('csharp', `using YotsubaShader.Language.Attributes.HlslStyle;

public class Fill
{
    [ShaderStage(Stage.Compute)]
    [numthreads(8, 8, 1)]
    public void Main([SV_DispatchThreadID] uint id)
    {
        // ... write results to a storage buffer
    }
}`, 'Fill.cs')}
${table(
  ['Style', 'Workgroup size attribute'],
  [
    ['HLSL-like', '<code>[numthreads(x, y, z)]</code>'],
    ['GLSL-like', '<code>[layout_local_size(x, y = 1, z = 1)]</code>'],
    ['WGSL-like', '<code>[@workgroup_size(x, y = 1, z = 1)]</code>'],
  ],
)}
<p>Metal and Vulkan-style vocabularies expose the workgroup size as a built-in value rather than a method attribute; see <a href="${D}builtin-values-across-styles/">Built-in values across styles</a>.</p>

<h2>How entry points are found</h2>
<p>Discovery looks for ordinary methods (not constructors or property accessors) carrying the attribute, in declaration order, and it works on private methods too. A class may declare any number of stages. Read <a href="${D}shader-discovery/">Shader discovery</a>.</p>`,
  },

  /* ------------------------------------------------------------------ */
  {
    slug: 'interface-slots-and-locations',
    title: 'Interface slots and locations',
    kind: 'Article',
    icon: 'doc',
    summary: 'Describe how data flows into and out of a stage with [Location] and built-in attributes.',
    body: `
<h2>Overview</h2>
<p>Every value that crosses a stage boundary has an <em>interface slot</em>. There are two kinds you write in C#: numbered locations and built-in (system) values.</p>

<h2>Locations</h2>
<p><code>[Location(n)]</code> applies to fields and properties. The same number links an output of one stage to the input of the next.</p>
${code('csharp', `public struct VertexInput
{
    [Location(0)] public Vector2 Position;
    [Location(1)] public Vector4 Color;
}

public struct VertexOutput
{
    [SV_Position] public Vector4 Position;   // built-in
    [Location(0)] public Vector4 Color;      // carried to the fragment stage
}`)}

<h2>Built-in values</h2>
<p>Built-ins are values the pipeline provides or consumes: the clip-space position, the vertex index, the fragment coordinate, the global invocation id and more. Each style has its own names for them. They apply to inputs, outputs or both, depending on the attribute.</p>
<p>The complete mapping is in <a href="${D}builtin-values-across-styles/">Built-in values across styles</a>.</p>

<h2>In the IR</h2>
${table(
  ['Slot', 'Produced from'],
  [
    ['<code>LocationSlot(int)</code>', '<code>[Location(n)]</code>'],
    ['<code>BuiltInSlot(BuiltIn)</code>', 'A built-in attribute from any style.'],
    ['<code>VertexSlot(VertexSemantic)</code>', 'Defined for vertex semantics (position, color, texture coordinate, normal, …); the backend resolves it to a location.'],
  ],
)}
<p>The <code>BuiltIn</code> enum currently names these values: <code>Position</code>, <code>PointSize</code>, <code>VertexIndex</code>, <code>InstanceIndex</code>, <code>FragCoord</code>, <code>FrontFacing</code>, <code>FragDepth</code>, <code>GlobalInvocationId</code>, <code>LocalInvocationId</code>, <code>LocalInvocationIndex</code>, <code>WorkgroupId</code> and <code>NumWorkgroups</code>.</p>`,
  },

  /* ------------------------------------------------------------------ */
  {
    slug: 'uniforms-and-storage-buffers',
    title: 'Uniforms and storage buffers',
    kind: 'Article',
    icon: 'doc',
    summary: 'Declare uniform data, read/write buffers and binding slots with shared and style-specific attributes.',
    body: `
<h2>Overview</h2>
<p>Resources are data your engine binds before a draw or dispatch. Yotsuba Shader describes them with attributes on fields, properties or parameters.</p>

<h2>Shared attributes</h2>
<p>These live in <code>YotsubaShader.Language</code> and work with every style.</p>
${code('csharp', `using Microsoft.Xna.Framework;
using YotsubaShader.Language.Attributes;
using YotsubaShader.Language.Resources;

public sealed class Material
{
    [Uniform]
    public float Exposure;
}

public sealed class Particles
{
    [StorageBuffer(Access = ResourceAccess.ReadWrite)]
    public Vector4[] Positions;
}`)}
${table(
  ['Attribute', 'Meaning'],
  [
    ['<code>[Uniform]</code>', 'A uniform (constant) buffer value.'],
    ['<code>[StorageBuffer]</code>', 'A storage buffer. <code>Access</code> is a <code>ResourceAccess</code>: <code>ReadOnly</code>, <code>WriteOnly</code> or <code>ReadWrite</code> (default).'],
    ['<code>[Binding(set, binding)]</code>', 'The descriptor set and binding number of a resource (fields and properties).'],
  ],
)}
<p>A single resource cannot be both a uniform and a storage buffer; the frontend rejects it with an <code>InvalidOperationException</code>.</p>

<h2>Style-specific attributes</h2>
<p>Each style spells uniforms, storage buffers and binding slots the way its source language does.</p>
${resourceMapTable()}
${styleTabs(STYLE_RESOURCES, { file: 'Lighting.cs' })}
<p>HLSL-style <code>register</code> takes a <code>RegisterPrefix</code> (<code>b</code>, <code>t</code>, <code>s</code>, <code>u</code>, <code>c</code>) and an index, or a string such as <code>"b0"</code>.</p>

<h2>In the IR</h2>
<p>Resources become <code>Storage</code> records whose <code>Kind</code> is <code>Uniform</code> or <code>StorageBuffer</code>. The IR also reserves kinds for <code>PushConstant</code>, <code>Texture</code> and <code>Sampler</code>.</p>`,
  },

  /* ------------------------------------------------------------------ */
  {
    slug: 'textures-and-samplers',
    title: 'Textures and samplers',
    kind: 'Article',
    icon: 'doc',
    summary: 'Describe a texture\'s dimension, component type, usage, depth, format and sampling, and declare samplers.',
    body: `
<h2>Overview</h2>
<p>Textures and samplers are declared as types. <code>[Texture]</code> tells the compiler exactly what kind of image a type represents; <code>[Sampler]</code> marks a sampler type.</p>

<h2>TextureAttribute</h2>
${code('csharp', `[AttributeUsage(AttributeTargets.Class | AttributeTargets.Struct)]
public class TextureAttribute(TextureDimension dimension, TextureComponentTypes componentTypes) : Attribute
{
    public TextureDimension Dimension = dimension;
    public TextureComponentTypes ComponentTypes = componentTypes;

    public TextureUsage Usage = TextureUsage.Sampled;
    public TextureDepth Depth = TextureDepth.No;
    public TextureFormat Format = TextureFormat.Unknown;
    public bool Arrayed = false;
    public bool Multisampled = false;
}`, 'TextureAttribute.cs')}
${table(
  ['Setting', 'Values'],
  [
    ['<code>Dimension</code>', '<code>D1</code>, <code>D2</code>, <code>D3</code>, <code>Cube</code>'],
    ['<code>ComponentTypes</code>', '<code>Float</code>, <code>Int</code>, <code>Uint</code>'],
    ['<code>Usage</code>', '<code>Unknown</code>, <code>Sampled</code> (default), <code>Storage</code>'],
    ['<code>Depth</code>', '<code>No</code> (default), <code>Yes</code>, <code>Unknown</code>'],
    ['<code>Format</code>', '<code>TextureFormat</code>, <code>Unknown</code> by default'],
    ['<code>Arrayed</code>, <code>Multisampled</code>', 'Booleans, <code>false</code> by default'],
  ],
)}
${code('csharp', `[Texture(TextureDimension.D2, TextureComponentTypes.Float)]
public struct Texture2D;

[Texture(TextureDimension.D2, TextureComponentTypes.Float, Usage = TextureUsage.Storage)]
public struct StorageTexture2D;

[Sampler]
public struct LinearSampler;`)}

<h2>Metal-style bindings</h2>
<p>The Metal vocabulary binds them with <code>[texture(n)]</code> and <code>[sampler(n)]</code>; other styles use their descriptor set and binding attributes.</p>

<h2>In the IR</h2>
<p>The IR mirrors every setting, so each backend can lower a texture faithfully: <code>Texture</code> carries <code>Dimensions</code>, <code>TextureComponentsType</code>, <code>Depth</code>, <code>Arrayed</code>, <code>Multisampled</code>, <code>Usage</code> and <code>Format</code>. <code>Sampler</code> is its own storage type.</p>`,
  },

  /* ------------------------------------------------------------------ */
  {
    slug: 'vectors-matrices-and-arrays',
    title: 'Vectors, matrices and arrays',
    kind: 'Article',
    icon: 'doc',
    summary: 'Declare vector and matrix types with attributes, and see how scalars, arrays and structs map to the IR.',
    body: `
<h2>Overview</h2>
<p>Scalars (<code>bool</code>, <code>int</code>, <code>uint</code>, <code>float</code>, <code>double</code>) map directly to IR types. Vectors and matrices are structs described with attributes, and the XNA-style types from <code>Microsoft.Xna.Framework</code> (<code>Vector2</code>, <code>Vector3</code>, <code>Vector4</code>) are used throughout the examples.</p>

<h2>Scalars</h2>
${table(
  ['C#', 'IR type'],
  [
    ['<code>bool</code>', '<code>Bool</code>'],
    ['<code>int</code>', '<code>Int</code> (32 bits, signed)'],
    ['<code>uint</code>', '<code>Int</code> (32 bits, unsigned)'],
    ['<code>float</code>', '<code>Float</code> (32 bits)'],
    ['<code>double</code>', '<code>Double</code> (64 bits)'],
  ],
)}
<p>A parameter's default value, if it has one, becomes the IR initial value.</p>

<h2>Vectors</h2>
<p>A struct marked <code>[Vector]</code> declares its components with <code>[VectorComponent(index)]</code>. All components must share one type: <code>float</code>, <code>int</code> or <code>uint</code>.</p>
${code('csharp', `[Vector]
public struct Float3
{
    [VectorComponent(0)] public float X;
    [VectorComponent(1)] public float Y;
    [VectorComponent(2)] public float Z;
}`)}
<p>The frontend validates the declaration and fails loudly otherwise:</p>
${table(
  ['Exception', 'When'],
  [
    ['<code>InconsistentVectorComponentTypeException</code>', 'Components are declared with two different types at the same time.'],
    ['<code>VectorComponentTypeNotValidException</code>', 'A component type other than float, int or uint is used.'],
  ],
)}

<h2>Matrices</h2>
<p>A struct marked <code>[Matrix]</code> declares columns with <code>[MatrixColumn(index)]</code>. The IR <code>Matrix</code> has float or double components and a row and column count.</p>

<h2>Structs</h2>
<p>Any other struct becomes an IR <code>CustomStruct</code> whose properties are converted recursively, each with its own interface slot. Static, implicit and indexer members are skipped.</p>

<h2>Arrays</h2>
<p>The IR documents which .NET collection shapes are meant to map to GPU arrays: <code>T[]</code>, <code>Span&lt;T&gt;</code>, <code>Memory&lt;T&gt;</code> and <code>ArraySegment&lt;T&gt;</code> for read/write; <code>ReadOnlySpan&lt;T&gt;</code>, <code>ReadOnlyMemory&lt;T&gt;</code> and <code>ImmutableArray&lt;T&gt;</code> for read-only. Adding, removing and other length-changing operations are not GPU array operations.</p>`,
  },
];

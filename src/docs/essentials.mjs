// Documentation articles: essentials + language.
import { icon, code, styleTabs, table, note } from '../components.mjs';
import { STYLE_TRIANGLE, STYLE_RESOURCES, BASIC_COLOR } from '../snippets.mjs';
import { builtinMapTable, resourceMapTable } from '../reference.mjs';
import { resourcesCode } from '../pages/styles.mjs';
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

<h2>Do you have to map them?</h2>
<p>No. You can use your own structs in a shader without any attributes. They are treated as plain structs: a group of fields. Even if a struct is called <code>Vector2</code> or <code>Matrix4</code>, the GPU does not treat it as a vector or a matrix, so vector operations do not apply to it. For the GPU to treat a type as a vector, it needs the attributes shown above.</p>
<p>If you are building an engine or a framework, it is easy: take the <code>Vector2</code> you already give to programmers and add the attributes to it. <a href="/documentation/yotsuba-shader/types-for-engines-and-frameworks/">Types for engines and frameworks</a> shows how.</p>

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
    slug: 'types-for-engines-and-frameworks',
    title: 'Types for engines and frameworks',
    kind: 'Tutorial',
    icon: 'braces',
    summary: 'Step by step: map every GPU type to your engine\'s own types, so programmers reuse them when they write shaders.',
    body: `
<h2>Overview</h2>
<p class="lead-p">If you build an engine or a framework, you already expose types such as <code>Vector2</code>, <code>Matrix4</code> or <code>Texture2D</code>. You do not need a second set of types for shaders. In this tutorial you add the Yotsuba Shader attributes to the types you already have, one kind of GPU type at a time. At the end, the programmers who use your engine write shaders with the same types they use everywhere else.</p>
<p>We will build the types of an imaginary engine called <code>MyEngine</code>: vectors, matrices, textures and a sampler.</p>

<h2>1. How the GPU sees your types</h2>
<p>To the GPU, a struct without attributes is just a group of fields. The name does not matter: the first struct below is called <code>Vector2</code>, but the GPU does not treat it as a vector. The second one is a vector because of its attributes.</p>
${code('csharp', `using YotsubaShader.Language.Native.Types.Vector;

// A plain struct: a group of two floats
public struct PlainVector2
{
    public float X;
    public float Y;
}

// A GPU vector with two float components
[Vector]
public struct Vector2
{
    [VectorComponent(0)] public float X;
    [VectorComponent(1)] public float Y;
}`, 'MyEngine/PlainVsVector.cs')}
<p>Using plain structs in shaders is fine. You only add attributes to the types that must behave as a vector, a matrix, a texture or a sampler.</p>

<h2>2. Reference the language package</h2>
<p>Add <code>YotsubaShader.Language</code> to the project that defines your types. The attributes are only metadata: they do not change how your types behave, and they do not change their memory layout on the CPU.</p>
${code('xml', `<ItemGroup>
  <PackageReference Include="YotsubaShader.Language" />
</ItemGroup>`, 'MyEngine.csproj')}

<h2>3. Scalars: nothing to map</h2>
<p><code>bool</code>, <code>int</code>, <code>uint</code>, <code>float</code> and <code>double</code> are already GPU types. Use them directly, alone or inside structs.</p>
${code('csharp', `public struct Settings
{
    public bool Enabled;
    public int Count;
    public uint Seed;
    public float Exposure;
    public double Precision;
}`, 'Settings.cs')}

<h2>4. Vectors</h2>
<p>Put <code>[Vector]</code> on the struct and <code>[VectorComponent(i)]</code> on each component, starting at 0. The index is the position of the component in the GPU vector, so <code>X</code> is 0, <code>Y</code> is 1, and so on. The number of components is the number of members you mark: two, three or four.</p>
${code('csharp', `using YotsubaShader.Language.Native.Types.Vector;

namespace MyEngine;

[Vector]
public struct Vector2
{
    [VectorComponent(0)] public float X;
    [VectorComponent(1)] public float Y;

    public Vector2(float x, float y) { X = x; Y = y; }

    public static Vector2 operator +(Vector2 a, Vector2 b)
    {
        return new Vector2(a.X + b.X, a.Y + b.Y);
    }
}`, 'MyEngine/Vector2.cs')}
<p>Your constructors, operators and methods stay exactly as they are. Components can be fields or properties:</p>
${code('csharp', `[Vector]
public struct Vector3
{
    [VectorComponent(0)] public float X { get; set; }
    [VectorComponent(1)] public float Y { get; set; }
    [VectorComponent(2)] public float Z { get; set; }

    public Vector3(float x, float y, float z) { X = x; Y = y; Z = z; }
}

[Vector]
public struct Vector4
{
    [VectorComponent(0)] public float X;
    [VectorComponent(1)] public float Y;
    [VectorComponent(2)] public float Z;
    [VectorComponent(3)] public float W;

    public Vector4(float x, float y, float z, float w)
    {
        X = x; Y = y; Z = z; W = w;
    }
}`, 'MyEngine/Vector3.cs')}
<p>A vector can also have <code>int</code> or <code>uint</code> components. All the components of one vector must have the same type.</p>
${code('csharp', `[Vector]
public struct Point2
{
    [VectorComponent(0)] public int X;
    [VectorComponent(1)] public int Y;
}

[Vector]
public struct UPoint3
{
    [VectorComponent(0)] public uint X;
    [VectorComponent(1)] public uint Y;
    [VectorComponent(2)] public uint Z;
}`, 'MyEngine/Points.cs')}

<h2>5. Matrices</h2>
<p>A matrix is a struct marked with <code>[Matrix]</code> whose columns are vectors. Mark each column with <code>[MatrixColumn(i)]</code>, starting at 0. The column type is one of the vectors you declared in the previous step.</p>
${code('csharp', `using YotsubaShader.Language.Native.Types.Matrix;

[Matrix]
public struct Matrix3
{
    [MatrixColumn(0)] public Vector3 Column0;
    [MatrixColumn(1)] public Vector3 Column1;
    [MatrixColumn(2)] public Vector3 Column2;
}

[Matrix]
public struct Matrix4
{
    [MatrixColumn(0)] public Vector4 Column0;
    [MatrixColumn(1)] public Vector4 Column1;
    [MatrixColumn(2)] public Vector4 Column2;
    [MatrixColumn(3)] public Vector4 Column3;
}`, 'MyEngine/Matrices.cs')}

<h2>6. Textures</h2>
<p><code>[Texture]</code> goes on a class or a struct. It needs two values: how many dimensions the texture has (<code>D1</code>, <code>D2</code>, <code>D3</code> or <code>Cube</code>) and what kind of values it holds (<code>Float</code>, <code>Int</code> or <code>Uint</code>).</p>
${code('csharp', `using YotsubaShader.Language.Native.Types.Texture;

[Texture(TextureDimension.D1, TextureComponentTypes.Float)]
public class Texture1D { /* your engine's texture */ }

[Texture(TextureDimension.D2, TextureComponentTypes.Float)]
public class Texture2D { /* your engine's texture */ }

[Texture(TextureDimension.D3, TextureComponentTypes.Float)]
public class Texture3D { /* your engine's texture */ }

[Texture(TextureDimension.Cube, TextureComponentTypes.Float)]
public class TextureCube { /* your engine's texture */ }`, 'MyEngine/Textures.cs')}
<p>Textures of integer values use <code>Int</code> or <code>Uint</code>:</p>
${code('csharp', `[Texture(TextureDimension.D2, TextureComponentTypes.Uint)]
public class UIntTexture2D { /* ... */ }`, 'MyEngine/UIntTexture2D.cs')}
<p>The optional settings describe the rest of the texture. Set only the ones your type needs:</p>
${code('csharp', `// An array of 2D textures
[Texture(TextureDimension.D2, TextureComponentTypes.Float,
    Arrayed = true)]
public class Texture2DArray { /* ... */ }

// A multisampled texture
[Texture(TextureDimension.D2, TextureComponentTypes.Float,
    Multisampled = true)]
public class Texture2DMultisampled { /* ... */ }

// A depth texture
[Texture(TextureDimension.D2, TextureComponentTypes.Float,
    Depth = TextureDepth.Yes)]
public class DepthTexture2D { /* ... */ }

// A texture the shader writes to, with its format
[Texture(TextureDimension.D2, TextureComponentTypes.Float,
    Usage = TextureUsage.Storage, Format = TextureFormat.Rgba8)]
public class StorageTexture2D { /* ... */ }`, 'MyEngine/TextureVariants.cs')}
<p><code>Usage</code> is <code>Sampled</code> (the default) or <code>Storage</code>. <code>Depth</code> is <code>No</code> (the default), <code>Yes</code> or <code>Unknown</code>. <code>Format</code> is <code>Unknown</code> unless you set it, for example <code>Rgba8</code>, <code>Rgba16f</code>, <code>Rgba32f</code>, <code>R32f</code>, <code>R32i</code> or <code>R32ui</code>.</p>

<h2>7. Samplers</h2>
<p>A sampler is the object that decides how a texture is read. Put <code>[Sampler]</code> on the class or struct that represents it in your engine.</p>
${code('csharp', `using YotsubaShader.Language.Native.Types;

[Sampler]
public class SamplerState { /* your engine's sampler */ }`, 'MyEngine/SamplerState.cs')}

<h2>8. Structs and arrays: nothing to map</h2>
<p>Any other struct is converted field by field, including nested structs. Arrays need no attribute either. What changes is where the shader gets the data: <code>[Uniform]</code> and <code>[StorageBuffer]</code> mark values that your engine uploads before drawing.</p>
${code('csharp', `using YotsubaShader.Language.Resources;

public struct Light
{
    public Vector3 Position;
    public float Intensity;
}

public struct Scene
{
    public Matrix4 ViewProjection;
    public Light Sun;
}

public class Lighting
{
    [Uniform] public Scene Scene;
    [StorageBuffer] public float[] Weights;
}`, 'Lighting.cs')}

<h2>9. What your users write</h2>
<p>Everything above lives in your engine. This is what a programmer who uses it writes: a shader with the types they already know, imported from your namespace.</p>
${code('csharp', `using MyEngine;
using YotsubaShader.Language;
using YotsubaShader.Language.Attributes;
using YotsubaShader.Language.Attributes.HlslStyle;
using YotsubaShader.Language.Resources;

public struct Material
{
    public Vector4 Color;
    public float Roughness;
}

public struct VertexInput
{
    [Location(0)] public Vector3 Position;
    [Location(1)] public Vector2 UV;
}

public struct VertexOutput
{
    [SV_Position] public Vector4 Position;
    [Location(0)] public Vector2 UV;
}

public class LitShader
{
    [Uniform] public Matrix4 ViewProjection;
    [Uniform] public Material Material;

    public Texture2D Albedo;
    public SamplerState Sampler;

    [ShaderStage(Stage.Vertex)]
    public VertexOutput Vertex(VertexInput input)
    {
        VertexOutput output;
        output.Position = new Vector4(
            input.Position.X, input.Position.Y, input.Position.Z, 1);
        output.UV = input.UV;
        return output;
    }

    [ShaderStage(Stage.Fragment)]
    public Vector4 Fragment(VertexOutput input)
    {
        return Material.Color;
    }
}`, 'LitShader.cs')}

<h2>10. Check that it works</h2>
<p>Open the <a href="/playground/">playground</a>, paste your types in <code>Types.cs</code> and a shader like the one above in <code>Shader.cs</code>, and compile. Two things should happen: there are no errors, and the shader's entry points appear in the <strong>Shaders</strong> tab.</p>
<p>The playground reports C# errors and the entry points it finds. The rules about vectors, such as the ones in the next section, are checked when the compiler processes your shader, so run a real compilation of a shader that uses each of your types before you publish them.</p>

<h2>11. Common mistakes</h2>
${code('csharp', `// The components of a vector must have the same type.
// This throws InconsistentVectorComponentTypeException.
[Vector]
public struct MixedVector
{
    [VectorComponent(0)] public float X;
    [VectorComponent(1)] public int Y;
}

// Only float, int and uint are valid components.
// This throws VectorComponentTypeNotValidException.
[Vector]
public struct DoubleVector
{
    [VectorComponent(0)] public double X;
    [VectorComponent(1)] public double Y;
}

// Attributes go on types you control. You cannot mark
// System.Numerics.Vector3 or a type from another package.
// Define your own struct instead, and convert between the two.
[Vector]
public struct Vector3
{
    [VectorComponent(0)] public float X;
    [VectorComponent(1)] public float Y;
    [VectorComponent(2)] public float Z;

    public static implicit operator Vector3(System.Numerics.Vector3 v)
    {
        return new Vector3 { X = v.X, Y = v.Y, Z = v.Z };
    }
}`, 'Mistakes.cs')}

<h2>12. Publish your types</h2>
<p>Ship your types with your engine, for example in a NuGet package. Your users reference it and write shaders with your types, and any shader library built on them works for every user of your engine.</p>
${code('xml', `<PropertyGroup>
  <PackageId>MyEngine</PackageId>
  <Version>1.0.0</Version>
</PropertyGroup>`, 'MyEngine.csproj')}
<p>Two things to keep stable in new versions: the order of the components (index 0 is the first component, usually <code>X</code>) and the memory layout your engine uses to upload data. The attributes do not change the layout, so keep following the rules of the graphics API you use.</p>
<p>Next: <a href="/documentation/yotsuba-shader/choosing-an-authoring-style/">Choosing an authoring style</a>.</p>`,
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
    kind: 'Tutorial',
    icon: 'doc',
    summary: 'Send data from your program to a shader: single values, structs, read and write buffers, and binding slots, one step at a time.',
    body: `
<h2>Overview</h2>
<p class="lead-p">A shader does not own its data. Your engine uploads it before each draw or dispatch, and the shader reads it, and sometimes writes it. In Yotsuba Shader you declare that data as fields of your shader class and mark them with an attribute. In this tutorial you go from a single value to a complete compute shader.</p>

<h2>1. A single value: a uniform</h2>
<p>A <code>[Uniform]</code> is a value that stays the same for every invocation of a draw or dispatch, such as an exposure or a time.</p>
${code('csharp', `using YotsubaShader.Language.Resources;

public class Tonemap
{
    [Uniform] public float Exposure;
}`, 'Tonemap.cs')}

<h2>2. A group of values: a struct</h2>
<p>When you have several related values, put them in a struct and make the struct the uniform. The struct is converted field by field.</p>
${code('csharp', `public struct Material
{
    public Vector4 Color;
    public float Roughness;
    public float Metallic;
}

public class Surface
{
    [Uniform] public Material Material;
}`, 'Surface.cs')}

<h2>3. A lot of data: a storage buffer</h2>
<p>A <code>[StorageBuffer]</code> holds an array that the shader can read and write. It is the right choice for particles, results of a computation or any data too large for a uniform.</p>
${code('csharp', `public class Particles
{
    [StorageBuffer] public Vector4[] Positions;
}`, 'Particles.cs')}

<h2>4. Read-only or write-only buffers</h2>
<p>By default a storage buffer is read and write. Say so explicitly when the shader only reads it, or only writes it, with <code>Access</code>. The values are <code>ReadOnly</code>, <code>WriteOnly</code> and <code>ReadWrite</code>.</p>
${code('csharp', `public class Weights
{
    [StorageBuffer(Access = ResourceAccess.ReadOnly)]
    public float[] Values;

    [StorageBuffer(Access = ResourceAccess.WriteOnly)]
    public float[] Results;
}`, 'Weights.cs')}
<p>In C# there is another way to say "read-only": use an immutable type. The type itself tells the compiler that the shader cannot write to the data, so you do not need <code>Access</code>. The IR names <code>ImmutableArray&lt;T&gt;</code>, <code>ReadOnlyMemory&lt;T&gt;</code> and <code>ReadOnlySpan&lt;T&gt;</code> as read-only arrays.</p>
${code('csharp', `using System;
using System.Collections.Immutable;

public class ImmutableWeights
{
    // Read-only because of its type: no Access needed
    [StorageBuffer]
    public ImmutableArray<float> Values;

    [StorageBuffer]
    public ReadOnlyMemory<float> Table;
}`, 'ImmutableWeights.cs')}
<p>The mutable counterparts, <code>float[]</code>, <code>Span&lt;T&gt;</code>, <code>Memory&lt;T&gt;</code> and <code>ArraySegment&lt;T&gt;</code>, are read and write. Note that C# only allows <code>ReadOnlySpan&lt;T&gt;</code> and <code>Span&lt;T&gt;</code> as parameters and locals, not as fields of a class, so in a shader class field use <code>ImmutableArray&lt;T&gt;</code> or <code>ReadOnlyMemory&lt;T&gt;</code>.</p>

<h2>5. Tell the GPU where each resource goes: binding slots</h2>
<p>Your engine needs to know which slot each resource uses. The shared <code>[Binding(set, binding)]</code> attribute works in every style:</p>
${code('csharp', `using YotsubaShader.Language;

public class Bound
{
    [Uniform, Binding(0, 0)] public Material Material;
    [StorageBuffer, Binding(0, 1)] public Vector4[] Positions;
}`, 'Bound.cs')}
<p>Each style also has the spelling of its source language. Pick the tab of the style you write in. The three resources are the same in all of them: a uniform, a read and write storage buffer and a read-only one.</p>
${styleTabs(RESOURCES_BY_STYLE, { file: 'Resources.cs' })}
<p>In the HLSL style, <code>register</code> has two forms that mean the same: <code>register(RegisterPrefix.t, 0)</code>, with the prefix and the number apart, and <code>register("t0")</code>, with a string made of the prefix letter (<code>b</code>, <code>t</code>, <code>s</code>, <code>u</code> or <code>c</code>) followed by the number.</p>

<h2>6. Everything together</h2>
<p>A compute shader that multiplies every value of an input buffer by a scale and writes the result to an output buffer. The scale comes from a uniform.</p>
${code('csharp', `using YotsubaShader.Language;
using YotsubaShader.Language.Attributes.HlslStyle;
using YotsubaShader.Language.Resources;

public struct Settings
{
    public float Scale;
    public uint Count;
}

public class ScaleValues
{
    [Uniform] public Settings Settings;

    [StorageBuffer(Access = ResourceAccess.ReadOnly)]
    public float[] Input;

    [StorageBuffer(Access = ResourceAccess.WriteOnly)]
    public float[] Output;

    [ShaderStage(Stage.Compute)]
    [numthreads(64, 1, 1)]
    public void Compute([SV_DispatchThreadID] uint id)
    {
        if (id < Settings.Count)
        {
            Output[id] = Input[id] * Settings.Scale;
        }
    }
}`, 'ScaleValues.cs')}

<h2>7. A common mistake</h2>
${code('csharp', `public class Wrong
{
    // It cannot be both a uniform and a storage buffer.
    // This throws InvalidOperationException.
    [Uniform, StorageBuffer]
    public float[] Values;
}`, 'Wrong.cs')}
<p>Choose one: a uniform for a small value that does not change during the draw, a storage buffer for an array.</p>
<p>Next: <a href="/documentation/yotsuba-shader/textures-and-samplers/">Textures and samplers</a>.</p>`,
  },

  /* ------------------------------------------------------------------ */
  {
    slug: 'textures-and-samplers',
    title: 'Textures and samplers',
    kind: 'Tutorial',
    icon: 'doc',
    summary: 'Declare textures and samplers, describe exactly what kind of image each one is, and bind them in the style you write in.',
    body: `
<h2>Overview</h2>
<p class="lead-p">A shader reads images through two objects: a <strong>texture</strong>, which holds the pixels, and a <strong>sampler</strong>, which decides how they are read. In Yotsuba Shader both are types: you mark a class or a struct with an attribute, and use it as a field of your shader. If you are building an engine, you mark the texture types you already have (see <a href="/documentation/yotsuba-shader/types-for-engines-and-frameworks/">Types for engines and frameworks</a>).</p>

<h2>1. Declare a texture</h2>
<p><code>[Texture]</code> needs two values: how many dimensions the texture has and what kind of values it holds.</p>
${code('csharp', `using YotsubaShader.Language.Native.Types.Texture;

[Texture(TextureDimension.D2, TextureComponentTypes.Float)]
public class Texture2D { /* ... */ }`, 'Texture2D.cs')}

<h2>2. Choose the dimension</h2>
<p><code>TextureDimension</code> has four values. This is the whole enum:</p>
${code('csharp', `public enum TextureDimension
{
    D1,     // a line of pixels
    D2,     // an image
    D3,     // a volume
    Cube    // six images, one for each face of a cube
}`, 'TextureDimension.cs')}

<h2>3. Choose what the texture holds</h2>
<p>A texture holds floating point numbers, signed integers or unsigned integers. Integer textures are used for data such as indices or masks.</p>
${code('csharp', `public enum TextureComponentTypes
{
    Float,
    Int,
    Uint
}

[Texture(TextureDimension.D2, TextureComponentTypes.Uint)]
public class IndexTexture2D { /* ... */ }`, 'TextureComponentTypes.cs')}

<h2>4. Describe the rest of the texture</h2>
<p>Everything else is an optional setting. Set only what your texture needs.</p>
${code('csharp', `// An array of 2D textures
[Texture(TextureDimension.D2, TextureComponentTypes.Float,
    Arrayed = true)]
public class Texture2DArray { /* ... */ }

// A multisampled texture
[Texture(TextureDimension.D2, TextureComponentTypes.Float,
    Multisampled = true)]
public class Texture2DMultisampled { /* ... */ }

// A depth texture
[Texture(TextureDimension.D2, TextureComponentTypes.Float,
    Depth = TextureDepth.Yes)]
public class DepthTexture2D { /* ... */ }`, 'TextureVariants.cs')}
<p>A texture the shader writes to is a <em>storage</em> texture. It also needs its pixel format:</p>
${code('csharp', `[Texture(TextureDimension.D2, TextureComponentTypes.Float,
    Usage = TextureUsage.Storage, Format = TextureFormat.Rgba8)]
public class StorageTexture2D { /* ... */ }`, 'StorageTexture2D.cs')}
<p>These are the values of the three enums behind those settings:</p>
${code('csharp', `public enum TextureUsage
{
    Unknown = 0,
    Sampled = 1,    // the default: the shader reads it
    Storage = 2     // the shader writes to it
}

public enum TextureDepth
{
    No = 0,         // the default
    Yes = 1,
    Unknown = 2
}

public enum TextureFormat
{
    Unknown = 0,    // the default
    Rgba32f = 1,
    Rgba16f = 2,
    R32f = 3,
    Rgba8 = 4,
    Rgba8Snorm = 5,
    Rgba32i = 21,
    R32i = 24,
    Rgba32ui = 30,
    R32ui = 33
}`, 'TextureEnums.cs')}

<h2>5. Declare a sampler</h2>
<p>A sampler has no settings: <code>[Sampler]</code> only says that the type represents one.</p>
${code('csharp', `using YotsubaShader.Language.Native.Types;

[Sampler]
public class SamplerState { /* ... */ }`, 'SamplerState.cs')}

<h2>6. Bind them in your shader</h2>
<p>Use the texture and the sampler as fields of your shader class, and give each one its slot. The slot is spelled in the vocabulary of the style you write in. Pick its tab:</p>
${styleTabs(TEXTURE_BINDINGS, { file: 'Surface.cs' })}
<p>In the HLSL tab, the texture uses the <code>RegisterPrefix</code> form and the sampler uses the string form: both are valid for any resource.</p>
<p>The slots are only numbers: your engine decides which texture goes to which slot when it draws.</p>

<h2>7. A common mistake</h2>
${code('csharp', `// Without [Texture], this is a plain class:
// the GPU does not know it is an image.
public class Texture2D { /* ... */ }`, 'Mistake.cs')}
<p>Next: <a href="/documentation/yotsuba-shader/vectors-matrices-and-arrays/">Vectors, matrices and arrays</a>.</p>`,
  },

  /* ------------------------------------------------------------------ */
  {
    slug: 'vectors-matrices-and-arrays',
    title: 'Vectors, matrices and arrays',
    kind: 'Tutorial',
    icon: 'doc',
    summary: 'Use scalars, vectors, matrices, structs and arrays in a shader, and learn how each C# type becomes a GPU type.',
    body: `
<h2>Overview</h2>
<p class="lead-p">This tutorial walks through the data types you can use in a shader, from the simplest to the most complex. For each one you see the C# you write. If you are building the vector and matrix types of an engine, <a href="/documentation/yotsuba-shader/types-for-engines-and-frameworks/">Types for engines and frameworks</a> shows how to mark them.</p>

<h2>1. Scalars</h2>
<p>The five C# scalar types are GPU types as they are: <code>bool</code>, <code>int</code> (32 bits, signed), <code>uint</code> (32 bits, unsigned), <code>float</code> (32 bits) and <code>double</code> (64 bits).</p>
${code('csharp', `public struct Settings
{
    public bool Enabled;
    public int Count;
    public uint Seed;
    public float Exposure;
    public double Precision;
}`, 'Settings.cs')}
<p>A parameter can have a default value, and the compiler keeps it as the initial value:</p>
${code('csharp', `[ShaderStage(Stage.Fragment)]
public Vector4 Fragment(VertexOutput input, float exposure = 1.0f)
{
    return new Vector4(exposure, exposure, exposure, 1);
}`, 'Exposure.cs')}

<h2>2. Vectors</h2>
<p>A vector is a struct marked with <code>[Vector]</code>, and each component with <code>[VectorComponent(index)]</code>. Components can be <code>float</code>, <code>int</code> or <code>uint</code>, and all the components of one vector must share the same type.</p>
${code('csharp', `[Vector]
public struct Float3
{
    [VectorComponent(0)] public float X;
    [VectorComponent(1)] public float Y;
    [VectorComponent(2)] public float Z;
}

[Vector]
public struct Int2
{
    [VectorComponent(0)] public int X;
    [VectorComponent(1)] public int Y;
}`, 'Vectors.cs')}
<p>Use them like any C# struct, as fields, parameters and return values:</p>
${code('csharp', `public struct VertexInput
{
    [Location(0)] public Float3 Position;
}`, 'VertexInput.cs')}
<p>The compiler checks the declaration and stops with an exception when it is wrong:</p>
${code('csharp', `// Two different component types.
// This throws InconsistentVectorComponentTypeException.
[Vector]
public struct Mixed
{
    [VectorComponent(0)] public float X;
    [VectorComponent(1)] public int Y;
}

// double is not a valid component type.
// This throws VectorComponentTypeNotValidException.
[Vector]
public struct Wide
{
    [VectorComponent(0)] public double X;
    [VectorComponent(1)] public double Y;
}`, 'VectorErrors.cs')}

<h2>3. Matrices</h2>
<p>A matrix is a struct marked with <code>[Matrix]</code> whose columns are vectors. Each column is marked with <code>[MatrixColumn(index)]</code>.</p>
${code('csharp', `[Vector]
public struct Float4
{
    [VectorComponent(0)] public float X;
    [VectorComponent(1)] public float Y;
    [VectorComponent(2)] public float Z;
    [VectorComponent(3)] public float W;
}

[Matrix]
public struct Float4x4
{
    [MatrixColumn(0)] public Float4 Column0;
    [MatrixColumn(1)] public Float4 Column1;
    [MatrixColumn(2)] public Float4 Column2;
    [MatrixColumn(3)] public Float4 Column3;
}`, 'Float4x4.cs')}
<p>A matrix is used as a uniform, for example the one that moves the vertices to the screen:</p>
${code('csharp', `public class Camera
{
    [Uniform] public Float4x4 ViewProjection;
}`, 'Camera.cs')}

<h2>4. Structs</h2>
<p>Any struct that is not a vector or a matrix is converted field by field, and structs can contain other structs. Static members, members that the compiler generates by itself and indexers are skipped.</p>
${code('csharp', `public struct Light
{
    public Float3 Position;
    public float Intensity;


    // Skipped: it is static
    public static float DefaultIntensity = 1;

    // Skipped: it is an indexer
    public float this[int i] { get { return Intensity; } }
}

public struct Scene
{
    public Light Sun;
    public float Ambient;
}`, 'Scene.cs')}

<h2>5. Arrays</h2>
<p>An array of any of the types above becomes a GPU array. Declare it as a storage buffer (see <a href="/documentation/yotsuba-shader/uniforms-and-storage-buffers/">Uniforms and storage buffers</a>).</p>
${code('csharp', `public class Lights
{
    [StorageBuffer(Access = ResourceAccess.ReadOnly)]
    public Light[] Items;

    // The IR also names these shapes as GPU arrays:
    //   read and write: Span<T>, Memory<T>, ArraySegment<T>
    //   read only: ReadOnlySpan<T>, ReadOnlyMemory<T>,
    //              ImmutableArray<T>
    // Adding or removing elements does not exist on the GPU.
}`, 'Lights.cs')}
<p>Next: <a href="/documentation/yotsuba-shader/compilation-pipeline/">Compilation pipeline</a>.</p>`,
  },
];

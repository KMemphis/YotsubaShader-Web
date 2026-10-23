// Documentation articles: essentials + language.
import { icon, code, styleTabs, engineTabs, table, note } from '../components.mjs';
import { STYLE_TRIANGLE, STYLE_RESOURCES, BASIC_COLOR } from '../snippets.mjs';
import { builtinMapTable, resourceMapTable } from '../reference.mjs';
import { resourcesCode } from '../pages/syntaxes.mjs';
import { textureBindingCode, STYLE_IDS } from '../examples.mjs';

const D = '/documentation/yotsuba-shader/';

const TEXTURE_BINDINGS = Object.fromEntries(STYLE_IDS.map((id) => [id, textureBindingCode(id)]));
const RESOURCES_BY_STYLE = Object.fromEntries(STYLE_IDS.map((id) => [id, resourcesCode(id)]));


const BY_NAME = {
  xna: `effect.Parameters["Exposure"].SetValue(1.2f);
effect.Parameters["LightDirection"].SetValue(direction);`,
  unity: `material.SetFloat("Exposure", 1.2f);
material.SetVector("LightDirection", direction);`,
  godot: `material.SetShaderParameter("Exposure", 1.2f);
material.SetShaderParameter("LightDirection", direction);`,
  custom: `parameters.Set("Exposure", 1.2f);
parameters.Set("LightDirection", direction);`,
};

const TYPED = {
  xna: `using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using YotsubaShader.Language.Resources;

public class Lit : Effect
{
    // Wraps the effect that your game loaded
    public Lit(Effect cloneSource) : base(cloneSource) { }

    [Uniform]
    public float Exposure
    {
        get => Parameters[nameof(Exposure)].GetValueSingle();
        set => Parameters[nameof(Exposure)].SetValue(value);
    }

    [Uniform]
    public Vector3 LightDirection
    {
        get => Parameters[nameof(LightDirection)].GetValueVector3();
        set => Parameters[nameof(LightDirection)].SetValue(value);
    }

    // ... the [ShaderStage] methods
}`,
  unity: `using UnityEngine;
using YotsubaShader.Language.Compiler;
using YotsubaShader.Language.Resources;

public class Lit
{
    // CPU only: it is not part of the shader
    [ShaderIgnore]
    private readonly Material material;

    public Lit(Material material)
    {
        this.material = material;
    }

    [Uniform]
    public float Exposure
    {
        get => material.GetFloat(nameof(Exposure));
        set => material.SetFloat(nameof(Exposure), value);
    }

    [Uniform]
    public Vector3 LightDirection
    {
        get => material.GetVector(nameof(LightDirection));
        set => material.SetVector(nameof(LightDirection), value);
    }

    // ... the [ShaderStage] methods
}`,
  godot: `using Godot;
using YotsubaShader.Language.Resources;

public partial class Lit : ShaderMaterial
{
    [Uniform]
    public float Exposure
    {
        get => GetShaderParameter(nameof(Exposure)).AsSingle();
        set => SetShaderParameter(nameof(Exposure), value);
    }

    [Uniform]
    public Vector3 LightDirection
    {
        get => GetShaderParameter(nameof(LightDirection)).AsVector3();
        set => SetShaderParameter(nameof(LightDirection), value);
    }

    // ... the [ShaderStage] methods
}`,
  custom: `using System.Numerics;
using YotsubaShader.Language.Compiler;
using YotsubaShader.Language.Resources;

public class Lit
{
    // Whatever your engine uses to reach a uniform by name
    [ShaderIgnore]
    private readonly IShaderParameters parameters;

    public Lit(IShaderParameters parameters)
    {
        this.parameters = parameters;
    }

    [Uniform]
    public float Exposure
    {
        get => parameters.Get<float>(nameof(Exposure));
        set => parameters.Set(nameof(Exposure), value);
    }

    [Uniform]
    public Vector3 LightDirection
    {
        get => parameters.Get<Vector3>(nameof(LightDirection));
        set => parameters.Set(nameof(LightDirection), value);
    }

    // ... the [ShaderStage] methods
}`,
};

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
        VertexOutput output = new VertexOutput();

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
using YotsubaShader.Language;                        // ShaderStage, Stage, Location
using YotsubaShader.HlslSyntax;                      // SV_Position (names inspired by HLSL)`)}

<h2>What the compiler does with it</h2>
<ol>
  <li><a href="${D}shader-discovery/">Discovery</a> finds <code>BasicColorShader</code> because two of its methods carry <code>[ShaderStage]</code>.</li>
  <li>The frontend turns each parameter into a storage with an interface slot. <code>[Location(0)]</code> becomes a location slot; <code>[SV_Position]</code> becomes the position built-in.</li>
  <li>The result is an IR <code>Function</code> per entry point, ready for a backend.</li>
</ol>

<h2>Try another vocabulary</h2>
<p>Replace <code>[SV_Position]</code> with <code>[gl_Position]</code>, <code>[position]</code>, <code>[BuiltIn_Position]</code> or <code>[@builtin_position]</code> (and the matching <code>using</code>) and the IR is identical. Read <a href="${D}choosing-a-syntax/">Choosing a syntax</a>.</p>`,
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
${note('tip', 'The complete guide is a PDF: <a href="/downloads/yotsuba-shader-engine-guide-__FILM_LANG__.pdf">Integrating Yotsuba Shader into your engine</a>. It covers this tutorial and the steps that come after it, and the editable source is included.')}

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
using YotsubaShader.HlslSyntax;
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
        VertexOutput output = new VertexOutput();
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
<p>Next: <a href="/documentation/yotsuba-shader/shader-parameters-for-your-engine/">Typed shader parameters for your engine</a>.</p>`,
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
<p>Each syntax is its own package with a namespace of the same name: <code>YotsubaShader.HlslSyntax</code>, <code>YotsubaShader.GlslSyntax</code>, <code>YotsubaShader.MslSyntax</code>, <code>YotsubaShader.SpirvSyntax</code> and <code>YotsubaShader.WgslSyntax</code>. Resource attributes live in its <code>.Resources</code> namespace, for example <code>YotsubaShader.HlslSyntax.Resources</code>. All of them build on <code>YotsubaShader.Language</code>, the neutral core with <code>[ShaderStage]</code>, <code>[Location]</code>, the shared resource attributes and the native types. Engines and frameworks build on that core; add only the syntax you write with.</p>

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
<p>Compute stages use a workgroup size method attribute, plus built-in inputs such as the global invocation id. Each syntax spells these in its own way.</p>
${code('csharp', `using YotsubaShader.HlslSyntax;

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
  ['Syntax', 'Workgroup size attribute'],
  [
    ['HLSL', '<code>[numthreads(x, y, z)]</code>'],
    ['GLSL', '<code>[layout_local_size(x, y = 1, z = 1)]</code>'],
    ['WGSL', '<code>[@workgroup_size(x, y = 1, z = 1)]</code>'],
  ],
)}
<p>The MSL and SPIR-V syntaxes expose the workgroup size as a built-in value rather than a method attribute; see <a href="${D}builtin-values-across-syntaxes/">Built-in values across syntaxes</a>.</p>

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
<p>Built-ins are values the pipeline provides or consumes: the clip-space position, the vertex index, the fragment coordinate, the global invocation id and more. Each syntax has its own names for them. They apply to inputs, outputs or both, depending on the attribute.</p>
<p>The complete mapping is in <a href="${D}builtin-values-across-syntaxes/">Built-in values across syntaxes</a>.</p>

<h2>In the IR</h2>
${table(
  ['Slot', 'Produced from'],
  [
    ['<code>LocationSlot(int)</code>', '<code>[Location(n)]</code>'],
    ['<code>BuiltInSlot(BuiltIn)</code>', 'A built-in attribute from any syntax.'],
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
<p>Your engine needs to know which slot each resource uses. The shared <code>[Binding(set, binding)]</code> attribute works in every syntax:</p>
${code('csharp', `using YotsubaShader.Language;

public class Bound
{
    [Uniform, Binding(0, 0)] public Material Material;
    [StorageBuffer, Binding(0, 1)] public Vector4[] Positions;
}`, 'Bound.cs')}
<p>Each syntax also has the spelling of its source language. Pick the tab of the syntax you write in. The three resources are the same in all of them: a uniform, a read and write storage buffer and a read-only one.</p>
${styleTabs(RESOURCES_BY_STYLE, { file: 'Resources.cs' })}
<p>In the HLSL syntax, <code>register</code> has two forms that mean the same: <code>register(RegisterPrefix.t, 0)</code>, with the prefix and the number apart, and <code>register("t0")</code>, with a string made of the prefix letter (<code>b</code>, <code>t</code>, <code>s</code>, <code>u</code> or <code>c</code>) followed by the number.</p>

<h2>6. Everything together</h2>
<p>A compute shader that multiplies every value of an input buffer by a scale and writes the result to an output buffer. The scale comes from a uniform.</p>
${code('csharp', `using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;
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
    summary: 'Declare textures and samplers, describe exactly what kind of image each one is, and bind them in the syntax you write in.',
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
<p>Use the texture and the sampler as fields of your shader class, and give each one its slot. The slot is spelled in the syntax you write in. Pick its tab:</p>
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
<p>Next: <a href="/documentation/yotsuba-shader/using-shaders-in-your-game/">Using your shader in your game</a>.</p>`,
  },

  /* ------------------------------------------------------------------ */
  {
    slug: 'using-shaders-in-your-game',
    title: 'Using your shader in your game',
    kind: 'Tutorial',
    icon: 'braces',
    summary: 'Add CPU code to a shader class: typed properties that set the uniforms in XNA, Unity, Godot or your own engine, and work that runs once per draw instead of once per vertex.',
    body: `
<h2>Overview</h2>
<p class="lead-p">A shader class is a normal C# class. Besides the shader, it can hold the code your game runs on the CPU to use it. Yotsuba Shader compiles the shader half and skips the rest. The name and the type of each uniform are written once, and the C# compiler checks them both when you build the shader and when your game uses it.</p>
<p>If you are building an engine, <a href="${D}shader-parameters-for-your-engine/">Typed shader parameters for your engine</a> shows how to give every shader this API from a base class.</p>
<p>The idea does not depend on an engine. Every engine has a way to set a uniform, usually by name. You put that call inside a property, and the rest of your game uses the property. The examples have a tab for XNA, Unity, Godot and your own engine; the choice is remembered.</p>
${note('tip', 'The complete guide is a PDF: <a href="/downloads/yotsuba-shader-engine-guide-__FILM_LANG__.pdf">Integrating Yotsuba Shader into your engine</a>. It covers this tutorial and the steps that come after it, and the editable source is included.')}

<h2>1. The usual way: names as strings</h2>
<p>The engine sets a uniform by its name, written as a string:</p>
${engineTabs(BY_NAME, { file: 'Game.cs' })}
<p>A typo, a parameter that you renamed in the shader but not in the game, or a value of the wrong type all compile without errors. They fail when that line runs, not when you build.</p>

<h2>2. A uniform with a typed property</h2>
<p>Declare each uniform as a property and write its getter and setter yourself. Yotsuba Shader reads the name and the type of the property. What the accessors do is up to you: here they read and write the parameter of the engine. <code>nameof</code> keeps the name from being a string literal: rename the property and the parameter name follows.</p>
${engineTabs(TYPED)}
<p>Two ways to reach the engine appear in the tabs. In XNA, MonoGame, FNA and Godot the class <strong>inherits</strong> from the engine type (<code>Microsoft.Xna.Framework.Graphics.Effect</code> or <code>ShaderMaterial</code>), so <code>Parameters</code> or <code>SetShaderParameter</code> are available inside it. In Unity and in your own engine the class <strong>holds</strong> the object. A field that holds an engine object is not a GPU type, so it carries <code>[ShaderIgnore]</code>, which tells Yotsuba Shader not to treat it as part of the shader. The generated half of the class adds no base class, so inheriting does not conflict with it.</p>
<p>Now the game sets the uniforms like any other property:</p>
${code('csharp', `var lit = new Lit(/* the effect, material or parameters of your engine */);

lit.Exposure = 1.2f;
lit.LightDirection = direction;

lit.Exposure = "bright";   // error CS0029: Cannot implicitly convert type 'string' to 'float'`, 'Game.cs')}
${note('important', 'The engine object you pass must have a parameter with the same name as the property. The compiler cannot check that it was built from this shader. <code>ShaderReflection.Resources</code> lists the resources the compiler found, so you can compare.')}

<h2>3. Do work on the CPU, once per draw</h2>
<p>A shader runs its code for every vertex and every pixel. Anything that is the same for the whole draw is cheaper to compute once on the CPU. Here the game thinks in stops of light, and the class converts them to the multiplier that the shader receives. The same applies to a world-view-projection matrix: the game sets the three matrices, and the class multiplies them once. Everything you add that is not part of the shader carries <code>[ShaderIgnore]</code>.</p>
${code('csharp', `// Inside the Lit class, in any of the engines above

[ShaderIgnore]
public float Stops
{
    get => MathF.Log2(Exposure);
    set => Exposure = MathF.Pow(2, value);   // 1 stop = twice the light
}

[ShaderIgnore]
public void Dim(float factor) => Exposure *= factor;`, 'Lit.cs')}
<p>The game never has to know the multiplier:</p>
${code('csharp', `lit.Stops = 1;     // Exposure becomes 2
lit.Dim(0.5f);     // Exposure becomes 1`, 'Game.cs')}

<h2>What you gain</h2>
<ul>
  <li><strong>One declaration.</strong> The name and the type are written once. Renaming a property with your IDE renames it in the shader and in the game.</li>
  <li><strong>Errors when you build.</strong> A wrong type, a property that does not exist or a misspelled name is a C# error, not an exception during the game.</li>
  <li><strong>Completion.</strong> Typing <code>lit.</code> lists the uniforms of the shader and their types.</li>
  <li><strong>Any engine.</strong> Only the body of the getters and setters knows about the engine. The shader and the code that uses it stay the same.</li>
  <li><strong>The CPU code travels with the shader.</strong> A shader shared as a <a href="${D}reusing-your-types-and-libraries/">library</a> brings its API with it, so the people who use it do not need to know its parameter names.</li>
</ul>
<p>Next: <a href="${D}compilation-pipeline/">Compilation pipeline</a>.</p>`,
  },

  /* ------------------------------------------------------------------ */
  {
    slug: 'shader-parameters-for-your-engine',
    title: 'Typed shader parameters for your engine',
    kind: 'Tutorial',
    icon: 'braces',
    summary: 'Step by step: give your engine a base class so that every shader exposes its uniforms as typed properties, checked when the shader loads and testable without a GPU.',
    body: `
<h2>Overview</h2>
<p class="lead-p">If you build an engine, your users should not set uniforms with strings. In this tutorial you build the CPU side of Yotsuba Shader for an imaginary engine called <code>MyEngine</code>, so that a programmer writes one line per uniform and nothing else:</p>
${code('csharp', `[Uniform]
public float Exposure { get => Get<float>(); set => Set(value); }`, 'Game/Shaders/Lit.cs')}
<p>The engine does the name lookup, the type check and the upload. You will build:</p>
<ol>
  <li>a small interface that hides how each graphics API sets a uniform;</li>
  <li>a base class for every shader of the engine;</li>
  <li>a shader written on top of it;</li>
  <li>a check that runs when the shader loads;</li>
  <li>a unit test that needs no GPU.</li>
</ol>
<p>It assumes you have read <a href="${D}using-shaders-in-your-game/">Using your shader in your game</a> and, for the types, <a href="${D}types-for-engines-and-frameworks/">Types for engines and frameworks</a>.</p>
${note('tip', 'The complete guide is a PDF: <a href="/downloads/yotsuba-shader-engine-guide-__FILM_LANG__.pdf">Integrating Yotsuba Shader into your engine</a>. It covers this tutorial and the steps that come after it, and the editable source is included.')}

<h2>1. Hide how the graphics API sets a uniform</h2>
<p>Vulkan, Direct3D, Metal and OpenGL set uniforms in different ways. Put that difference behind one interface. It is the only part of this tutorial that depends on the graphics API.</p>
${code('csharp', `namespace MyEngine.Graphics;

public interface IParameterSet
{
    bool Has(string name);
    T Get<T>(string name) where T : unmanaged;
    void Set<T>(string name, in T value) where T : unmanaged;
}`, 'MyEngine/Graphics/IParameterSet.cs')}
<p>Each backend implements it once: for example, a Vulkan version writes into a uniform buffer, and an OpenGL version calls the uniform functions. Uniforms are plain data (floats, vectors, matrices), which is why <code>T</code> is <code>unmanaged</code>. Textures and samplers have their own methods and are not covered here.</p>

<h2>2. A base class for every shader</h2>
<p>The base class holds the parameter set and gives the shaders two helpers, <code>Get</code> and <code>Set</code>. The name of the uniform is not a parameter that the programmer writes: <code>[CallerMemberName]</code> makes the C# compiler fill it with the name of the property that calls the helper.</p>
${code('csharp', `using System.Runtime.CompilerServices;
using MyEngine.Graphics;
using YotsubaShader.Language.Compiler;

namespace MyEngine.Shaders;

[ShaderIgnore]
public abstract class ShaderBase
{
    [ShaderIgnore]
    private readonly IParameterSet parameters;

    protected ShaderBase(IParameterSet parameters)
    {
        this.parameters = parameters;
    }

    [ShaderIgnore]
    protected T Get<T>([CallerMemberName] string name = "") where T : unmanaged
        => parameters.Get<T>(name);

    [ShaderIgnore]
    protected void Set<T>(T value, [CallerMemberName] string name = "") where T : unmanaged
        => parameters.Set(name, value);
}`, 'MyEngine/Shaders/ShaderBase.cs')}
<p>Inside <code>public float Exposure { get => Get&lt;float&gt;(); }</code>, the name is <code>"Exposure"</code>. There is no string and no <code>nameof</code> to forget, and renaming the property renames the uniform. Everything in this class is CPU code, so it carries <code>[ShaderIgnore]</code>: it tells Yotsuba Shader not to treat it as part of the shader. The generated half of a shader class adds no base class, so your <code>ShaderBase</code> never conflicts with it.</p>

<h2>3. Write a shader on top of it</h2>
<p>A shader is a <code>partial</code> class that inherits from <code>ShaderBase</code>. Each uniform is a property with a getter and a setter that call the helpers.</p>
${code('csharp', `using MyEngine;
using MyEngine.Graphics;
using MyEngine.Shaders;
using YotsubaShader.Language;
using YotsubaShader.Language.Resources;

public partial class Lit : ShaderBase
{
    public Lit(IParameterSet parameters) : base(parameters) { }

    [Uniform]
    public float Exposure { get => Get<float>(); set => Set(value); }

    [Uniform]
    public Vector3 LightDirection { get => Get<Vector3>(); set => Set(value); }

    [ShaderStage(Stage.Fragment)]
    public Vector4 Fragment(VertexOutput input)
    {
        /* uses Exposure and LightDirection */
    }
}`, 'Game/Shaders/Lit.cs')}
<p><code>Vector3</code> is the engine's own type, mapped to the GPU with the attributes of <a href="${D}types-for-engines-and-frameworks/">Types for engines and frameworks</a>. The compiler reads the name and the type of each property, and the property has the same name and type when your game uses it.</p>

<h2>4. Put CPU logic in the same class</h2>
<p>Work that is the same for the whole draw can be done once on the CPU. Add it to the class and mark it <code>[ShaderIgnore]</code>:</p>
${code('csharp', `[ShaderIgnore]
public float Stops
{
    get => MathF.Log2(Exposure);
    set => Exposure = MathF.Pow(2, value);   // 1 stop = twice the light
}`, 'Game/Shaders/Lit.cs')}

<h2>5. Check the shader when it loads</h2>
<p>A parameter that the compiled shader does not have should fail when the shader loads, not on the first frame that draws with it. Every shader exposes <code>Reflection</code>, which lists the resources the compiler found. Pass it to the base class and compare it with the parameter set:</p>
${code('csharp', `[ShaderIgnore]
protected ShaderBase(IParameterSet parameters, ShaderReflection reflection)
{
    this.parameters = parameters;

    foreach (var resource in reflection.Resources)
    {
        if (!parameters.Has(resource.Name))
        {
            throw new InvalidOperationException(
                $"The shader has no parameter named '{resource.Name}'.");
        }
    }
}`, 'MyEngine/Shaders/ShaderBase.cs')}
<p>The shader passes its own reflection, which the generated half of the class declares as a static field:</p>
${code('csharp', `public Lit(IParameterSet parameters) : base(parameters, Reflection) { }`, 'Game/Shaders/Lit.cs')}

<h2>6. Test the CPU side without a GPU</h2>
<p>Because the shader talks to the engine through <code>IParameterSet</code>, a test can use a fake one. The logic of the class runs in your build server, where there is no graphics card.</p>
${code('csharp', `public sealed class FakeParameterSet : IParameterSet
{
    private readonly Dictionary<string, object> values = new();

    public bool Has(string name) => true;

    public T Get<T>(string name) where T : unmanaged
        => values.TryGetValue(name, out var value) ? (T)value : default;

    public void Set<T>(string name, in T value) where T : unmanaged
        => values[name] = value;
}

public class LitTests
{
    [Fact]
    public void One_stop_doubles_the_exposure()
    {
        var lit = new Lit(new FakeParameterSet());

        lit.Stops = 1;

        Assert.Equal(2f, lit.Exposure);
    }
}`, 'Tests/LitTests.cs')}

<h2>7. Use it in the game</h2>
${code('csharp', `// Your engine creates the parameter set for the compiled shader
IParameterSet parameters = device.CreateParameterSet(shaderBinary);

var lit = new Lit(parameters);
lit.Exposure = 1.2f;
lit.LightDirection = Vector3.Normalize(new Vector3(0.3f, -1f, 0.2f));

lit.Exposure = "bright";   // error CS0029: Cannot implicitly convert type 'string' to 'float'`, 'Game/Renderer.cs')}

<h2>What you built</h2>
<ul>
  <li>One interface per graphics API, and nothing else that depends on it.</li>
  <li>A base class that makes each uniform one line, with its name taken from the property.</li>
  <li>Type errors when the game is built, and missing parameters when the shader loads.</li>
  <li>CPU logic in the same class as the shader, tested without a GPU.</li>
</ul>
<p>Next: <a href="${D}choosing-a-syntax/">Choosing a syntax</a>.</p>`,
  },
];

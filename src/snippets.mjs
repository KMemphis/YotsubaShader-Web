import { resUsing } from './reference.mjs';
// Code samples shared by several pages. They mirror the README and the test fixtures in the repository.

export const BASIC_COLOR = `using Microsoft.Xna.Framework;
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax; // Attribute names inspired by HLSL.

public struct VertexInput
{
    [Location(0)]
    public Vector2 Position;

    [Location(1)]
    public Vector4 Color;
}

public struct VertexOutput
{
    [SV_Position]
    public Vector4 Position;

    [Location(0)]
    public Vector4 Color;
}

public class BasicColorShader
{
    [ShaderStage(Stage.Vertex)]
    public VertexOutput Vertex(VertexInput input)
    {
        VertexOutput output = new VertexOutput();

        output.Position = new Vector4(
            input.Position.X,
            input.Position.Y,
            0.0f,
            1.0f
        );

        output.Color = input.Color;

        return output;
    }

    [ShaderStage(Stage.Fragment)]
    public Vector4 Fragment(VertexOutput input)
    {
        return input.Color;
    }
}`;

/**
 * One complete shader (vertex, fragment and compute) in each authoring vocabulary. Attribute names come from
 * the YotsubaShader.<X>Syntax packages. The vector type is the project's own (see TYPES_CS).
 */
const triangle = ({ ns, usings = '', res = '', buffer, position, vertexId, globalId, size = '', note = '' }) => `using YotsubaShader.Language;
using YotsubaShader.${ns};${usings}${res ? '\n' + res : ''}

public struct VertexOutput
{
    [${position}]
    public Vector4 Position;
}

public class Triangle
{
${buffer}

    [ShaderStage(Stage.Vertex)]
    public VertexOutput Vertex([${vertexId}] uint id)
    {
        VertexOutput output = new VertexOutput();
        output.Position = new Vector4(0, 0, 0, 1);
        return output;
    }

    [ShaderStage(Stage.Fragment)]
    public Vector4 Fragment(VertexOutput input)
    {
        return new Vector4(1, 0.4f, 0.7f, 1);
    }

${note}    [ShaderStage(Stage.Compute)]
${size}    public void Compute([${globalId}] uint i)
    {
        Output[i] = i * 0.5f;
    }
}`;

const hostNote = '    // Workgroup size is set by the host\n';

export const STYLE_TRIANGLE = {
  hlsl: triangle({
    ns: 'HlslSyntax', usings: '\nusing YotsubaShader.Language.Resources;',
    buffer: '    [StorageBuffer] public float[] Output;',
    position: 'SV_Position', vertexId: 'SV_VertexID', globalId: 'SV_DispatchThreadID',
    size: '    [numthreads(8, 8, 1)]\n',
  }),
  glsl: triangle({
    ns: 'GlslSyntax', res: resUsing('glsl'),
    buffer: '    [buffer, layout(0, 0)]\n    public float[] Output;',
    position: 'gl_Position', vertexId: 'gl_VertexIndex', globalId: 'gl_GlobalInvocationID',
    size: '    [layout_local_size(8, 8, 1)]\n',
  }),
  msl: triangle({
    ns: 'MslSyntax', res: resUsing('msl'),
    buffer: '    [device, buffer(0)]\n    public float[] Output;',
    position: 'position', vertexId: 'vertex_id', globalId: 'thread_position_in_grid',
    note: hostNote,
  }),
  spirv: triangle({
    ns: 'SpirvSyntax', res: resUsing('spirv'),
    buffer: '    [StorageBuffer, DescriptorSet(0), @Binding(0)]\n    public float[] Output;',
    position: 'BuiltIn_Position', vertexId: 'BuiltIn_VertexIndex', globalId: 'BuiltIn_GlobalInvocationId',
    note: hostNote,
  }),
  wgsl: triangle({
    ns: 'WgslSyntax', res: resUsing('wgsl'),
    buffer: '    [storage(storage_use.read_write), @group(0), @binding(0)]\n    public float[] Output;',
    position: '@builtin_position', vertexId: '@builtin_vertex_index', globalId: '@builtin_global_invocation_id',
    size: '    [@workgroup_size(8, 8, 1)]\n',
  }),
};

/** Resource declarations (uniform + storage buffer) per vocabulary. */
export const STYLE_RESOURCES = {
  hlsl: `using YotsubaShader.HlslSyntax;
${resUsing('hlsl')}

public class Lighting
{
    [cbuffer]
    [register(RegisterPrefix.b, 0)]
    public Material Material;
}`,
  glsl: `using YotsubaShader.GlslSyntax;
${resUsing('glsl')}

public class Lighting
{
    [uniform]
    [layout(set: 0, binding: 0)]
    public Material Material;
}`,
  msl: `using YotsubaShader.MslSyntax;
${resUsing('msl')}

public class Lighting
{
    [constant]
    [buffer(0)]
    public Material Material;
}`,
  spirv: `using YotsubaShader.SpirvSyntax;
${resUsing('spirv')}

public class Lighting
{
    [Uniform]
    [DescriptorSet(0)]
    [Binding(0)]
    public Material Material;
}`,
  wgsl: `using YotsubaShader.WgslSyntax;
${resUsing('wgsl')}

public class Lighting
{
    [uniform]
    [@group(0)]
    [@binding(0)]
    public Material Material;
}`,
};

/**
 * Default project of the playground: the GPU types live in the user's own file and are mapped with the
 * attributes of YotsubaShader.Language. No Microsoft.Xna.Framework (or any other math library) is referenced.
 */
export const TYPES_CS = `using YotsubaShader.Language.Native.Types.Matrix;
using YotsubaShader.Language.Native.Types.Vector;

// Your project's own types, mapped to native GPU types with attributes.
// The same structs can be used by your CPU code and by your shaders.

[Vector]
public struct Vector2
{
    [VectorComponent(0)] public float X;
    [VectorComponent(1)] public float Y;

    public Vector2(float x, float y) { X = x; Y = y; }
}

[Vector]
public struct Vector3
{
    [VectorComponent(0)] public float X;
    [VectorComponent(1)] public float Y;
    [VectorComponent(2)] public float Z;

    public Vector3(float x, float y, float z) { X = x; Y = y; Z = z; }
}

[Vector]
public struct Vector4
{
    [VectorComponent(0)] public float X;
    [VectorComponent(1)] public float Y;
    [VectorComponent(2)] public float Z;
    [VectorComponent(3)] public float W;

    public Vector4(float x, float y, float z, float w) { X = x; Y = y; Z = z; W = w; }
}

[Matrix]
public struct Matrix4
{
    [MatrixColumn(0)] public Vector4 Column0;
    [MatrixColumn(1)] public Vector4 Column1;
    [MatrixColumn(2)] public Vector4 Column2;
    [MatrixColumn(3)] public Vector4 Column3;
}`;

/** Examples shown in the docs reference XNA-style types; in the playground those come from Types.cs instead. */
export const withoutXna = (src) => src.replace(/using Microsoft\.Xna\.Framework;\r?\n/, '');

/* Source generator workflow: SPIR-V generated at build time into a partial class. */
export const GEN_CSPROJ = `<ItemGroup>
  <PackageReference Include="YotsubaShader.SourceGenerator" />
</ItemGroup>

<PropertyGroup>
  <YotsubaTargets>
    spirv;hlsl;msl;wgsl;glsl;glsles
  </YotsubaTargets>
</PropertyGroup>`;

export const GEN_INPUT = `public partial class Triangle
{
    [ShaderStage(Stage.Vertex)]
    public VertexOutput Vertex([SV_VertexID] uint id) { /* ... */ }

    [ShaderStage(Stage.Fragment)]
    public Vector4 Fragment(VertexOutput input) { /* ... */ }
}`;

export const GEN_OUTPUT = `// <auto-generated by Yotsuba Shader />
using YotsubaShader.Language.Compilation;

public partial class Triangle
{
    [ShaderIgnore]
    public static readonly ShaderCompiledCode CompiledCode =
        /* ... Autogenerated code with all the shader binaries
           that you specified */;

    [ShaderIgnore]
    public static readonly ShaderReflection Reflection =
        /* ... Autogenerated code with the entry points and
           resources of this shader */;
}`;

/** The two types every generated class exposes (runtime package). */
export const GEN_TYPES = `public sealed class ShaderCompiledCode
{
    public bool Has(string entryPoint, Binaries format);
    public ReadOnlySpan<byte> Get(
        string entryPoint, Binaries format);
    public string GetText(string entryPoint, Binaries format);
}

public sealed class ShaderReflection
{
    public IReadOnlyList<Binaries> BinaryFormats { get; }
    public IReadOnlyList<EntryPointInfo> EntryPoints { get; }
    public IReadOnlyList<ResourceBinding> Resources { get; }
}`;

export const GEN_USE = `// One entry point, one format
var vertex = Triangle.CompiledCode.Get(
    nameof(Triangle.Vertex), Binaries.SpirV);

// Any shader, the same way
foreach (var entry in Triangle.Reflection.EntryPoints)
{
    var bytes = Triangle.CompiledCode.Get(
        entry.Name, Binaries.SpirV);

    // Every format that was generated
    foreach (var format in Triangle.Reflection.BinaryFormats)
    {
        // Console.WriteLine(format);
    }

    // ... your graphics and compute pipeline implementation
}`;

export const CLI_SNIPPET = `yotsuba compile YourGame.csproj \\
  --target spirv \\
  --output artifacts/shaders`;

export const TRANSPILE_USE = `using YotsubaShader.Transpile;

var hlslOptions = new HlslOptions
{
    ShaderModel = 51, // 50 = DirectX 11, 51 = DirectX 12
    EntryPoint = "Vertex",
};
var glslOptions = new GlslOptions { Es = true, Version = 300 };

string hlsl = Transpile.FromSpirVToHlsl(spirv, hlslOptions);
string msl  = Transpile.FromSpirVToMsl(spirv);
string wgsl = Transpile.FromSpirVToWgsl(spirv);
string glsl = Transpile.FromSpirVToGlsl(spirv, glslOptions);`;

export const TRANSPILE_HLSL = `string hlsl = Transpile.FromSpirVToHlsl(spirv, hlslOptions);

// Yotsuba Shader stops at the HLSL text. Pass it to the DXC
// (Shader Model 6) or FXC (Shader Model 5.x) you already use,
// with entry point "Vertex" and a profile such as "vs_6_0".`;

/** Types.cs of the texture example: TYPES_CS plus a texture and a sampler (the usings must stay at the top of the file). */
export const TYPES_TEXTURE_CS = TYPES_CS
  .replace('using YotsubaShader.Language.Native.Types.Matrix;', 'using YotsubaShader.Language.Native.Types;\nusing YotsubaShader.Language.Native.Types.Matrix;\nusing YotsubaShader.Language.Native.Types.Texture;')
  + `

[Texture(TextureDimension.D2, TextureComponentTypes.Float)]
public class Texture2D { }

[Sampler]
public class SamplerState { }`;

/** A shader that declares and binds a texture and a sampler (HLSL vocabulary). Reading pixels is not compiled yet. */
export const TEXTURE_BINDING = `using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;
using YotsubaShader.HlslSyntax.Resources;

public struct VertexOutput
{
    [SV_Position]
    public Vector4 Position;

    [Location(0)]
    public Vector2 Uv;
}

public class TexturedQuad
{
    // The engine decides which image goes to slot t0 when it draws.
    [register(RegisterPrefix.t, 0)]
    public Texture2D Albedo;

    [register("s0")]
    public SamplerState Sampler;

    [ShaderStage(Stage.Vertex)]
    public VertexOutput Vertex([SV_VertexID] uint id)
    {
        VertexOutput output = new VertexOutput();
        output.Position = new Vector4(0, 0, 0, 1);
        output.Uv = new Vector2(0, 0);
        return output;
    }

    [ShaderStage(Stage.Fragment)]
    public Vector4 Fragment(VertexOutput input)
    {
        return new Vector4(input.Uv.X, input.Uv.Y, 0.5f, 1);
    }
}`;

/** The shader of the IDE diagnostics example, with the problems the editor reports for it. */
export const IDE_EXAMPLE = {
  file: 'Cubemap.cs',
  src: `using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

public struct VertexOutput
{
    [SV_Position] public Vector4 Position;
    [SV_RenderTargetArrayIndex] public uint Layer;
}

public class Cubemap
{
    [ShaderStage(Stage.Fragment)]
    [numthreads(8, 8, 1)]
    public Vector4 Fragment(VertexOutput input, [SV_PrimitiveID] uint primitive)
    {
        return new Vector4(input.Position.X, input.Position.Y, 0, 1);
    }
}`,
  marks: { SV_RenderTargetArrayIndex: 'error', numthreads: 'error', SV_PrimitiveID: 'warning' },
  problems: [
    ['error', 'YS1003', '<code>[numthreads]</code> only applies to compute stages, and <code>Fragment</code> is a fragment stage.', 'Cubemap.cs(13, 6)'],
    ['error', 'YS2001', '<code>SV_RenderTargetArrayIndex</code> (render target layer) is not supported by WebGL 2 (<code>glsles</code>).', 'Cubemap.cs(7, 6)'],
    ['error', 'YS2001', '<code>SV_PrimitiveID</code> (primitive index) is not supported by WebGL 2 (<code>glsles</code>).', 'Cubemap.cs(14, 50)'],
    ['warning', 'YS2002', '<code>SV_RenderTargetArrayIndex</code> needs the <code>GL_ARB_shader_viewport_layer_array</code> extension on OpenGL (<code>glsl</code>).', 'Cubemap.cs(7, 6)'],
  ],
};

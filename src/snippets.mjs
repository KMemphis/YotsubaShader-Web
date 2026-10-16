// Code samples shared by several pages. They mirror the README and the test fixtures in the repository.

export const BASIC_COLOR = `using Microsoft.Xna.Framework;
using YotsubaShader.Language;
using YotsubaShader.Language.Attributes;
using YotsubaShader.Language.Attributes.HlslStyle; // Attribute names inspired by HLSL.

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
        VertexOutput output;

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
 * YotsubaShader.Language. The vector type is the project's own (see TYPES_CS).
 */
const triangle = ({ ns, usings = '', buffer, position, vertexId, globalId, size = '', note = '' }) => `using YotsubaShader.Language;
using YotsubaShader.Language.Attributes.${ns};${usings}

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
        VertexOutput output;
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
    ns: 'HlslStyle', usings: '\nusing YotsubaShader.Language.Resources;',
    buffer: '    [StorageBuffer] public float[] Output;',
    position: 'SV_Position', vertexId: 'SV_VertexID', globalId: 'SV_DispatchThreadID',
    size: '    [numthreads(8, 8, 1)]\n',
  }),
  glsl: triangle({
    ns: 'GlslStyle',
    buffer: '    [buffer, layout(0, 0)]\n    public float[] Output;',
    position: 'gl_Position', vertexId: 'gl_VertexIndex', globalId: 'gl_GlobalInvocationID',
    size: '    [layout_local_size(8, 8, 1)]\n',
  }),
  metal: triangle({
    ns: 'MetalStyle',
    buffer: '    [device, buffer(0)]\n    public float[] Output;',
    position: 'position', vertexId: 'vertex_id', globalId: 'thread_position_in_grid',
    note: hostNote,
  }),
  vulkan: triangle({
    ns: 'VulkanStyle',
    buffer: '    [StorageBuffer, DescriptorSet(0), @Binding(0)]\n    public float[] Output;',
    position: 'BuiltIn_Position', vertexId: 'BuiltIn_VertexIndex', globalId: 'BuiltIn_GlobalInvocationId',
    note: hostNote,
  }),
  wgsl: triangle({
    ns: 'WgslStyle',
    buffer: '    [storage(storage_use.read_write), @group(0), @binding(0)]\n    public float[] Output;',
    position: '@builtin_position', vertexId: '@builtin_vertex_index', globalId: '@builtin_global_invocation_id',
    size: '    [@workgroup_size(8, 8, 1)]\n',
  }),
};

/** Resource declarations (uniform + storage buffer) per vocabulary. */
export const STYLE_RESOURCES = {
  hlsl: `using YotsubaShader.Language.Attributes.HlslStyle;

public class Lighting
{
    [cbuffer]
    [register(RegisterPrefix.b, 0)]
    public Material Material;
}`,
  glsl: `using YotsubaShader.Language.Attributes.GlslStyle;

public class Lighting
{
    [uniform]
    [layout(set: 0, binding: 0)]
    public Material Material;
}`,
  metal: `using YotsubaShader.Language.Attributes.MetalStyle;

public class Lighting
{
    [constant]
    [buffer(0)]
    public Material Material;
}`,
  vulkan: `using YotsubaShader.Language.Attributes.VulkanStyle;

public class Lighting
{
    [Uniform]
    [DescriptorSet(0)]
    [Binding(0)]
    public Material Material;
}`,
  wgsl: `using YotsubaShader.Language.Attributes.WgslStyle;

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

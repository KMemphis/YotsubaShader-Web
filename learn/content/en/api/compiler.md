---
title: Compiler library
summary: The API of YotsubaShader.Compiler.Library: compile a Roslyn compilation to SPIR-V and translate it to GLSL, HLSL, MSL and C++.
order: 7
---

API of the `YotsubaShader.Compiler.Library` package: the compiler that the CLI runs, as a .NET library (`net8.0`). Use it to compile shaders from your own tool, build step or editor, without starting the `yotsuba` process.

```bash
dotnet add package YotsubaShader.Compiler.Library
```

The whole pipeline is one call: give it a Roslyn `Compilation` and it returns one `CompiledCode` per shader class, with the SPIR-V and the methods that translate it to the other languages.

```csharp
using Microsoft.CodeAnalysis;
using YotsubaShader.Compiler.Library;
using YotsubaShader.Extensions;
using YotsubaShader.IR.Intermediate;

List<CompiledCode> shaders = CSharpToSpirvCompiler.Compile(compilation);

foreach (CompiledCode shader in shaders)
{
    File.WriteAllBytes($"{shader.CSharpFullClassName}.spv", shader.SpirV);
    File.WriteAllText($"{shader.CSharpFullClassName}.Fragment.glsl", shader.ToGlsl(Stage.Fragment));
}
```

## Namespaces

```csharp
using YotsubaShader.Compiler.Library; // CSharpToSpirvCompiler
using YotsubaShader.Extensions;       // CompiledCode, ShaderReflection, IShaderTargetBackend
using YotsubaShader.IR.Intermediate;  // Stage, Shader, Function, Storage, StorageKind
using YotsubaShader.IR.Intermediate.Slot;       // LocationSlot, DescriptorSlot, BuiltInSlot, VertexSlot
using YotsubaShader.IR.Intermediate.Slot.Types; // BuiltIn
```

> [!IMPORTANT]
> The library uses `YotsubaShader.IR.Intermediate.Stage`. It is not the `Stage` of `YotsubaShader.Language` that you write in `[ShaderStage(Stage.Vertex)]`. In a file that imports both namespaces, write the full name.

## CSharpToSpirvCompiler

The entry point of the library.

```csharp
namespace YotsubaShader.Compiler.Library;

public sealed class CSharpToSpirvCompiler
{
    public static List<CompiledCode> Compile(Compilation compilation, CancellationToken cancellationToken = default);
}
```

### Compile

Reads every class of the compilation that has methods marked with `[ShaderStage]`, builds the intermediate representation of each one, generates its SPIR-V and returns one `CompiledCode` per class, in the order the classes were found. A compilation without shaders returns an empty list.

| Parameter | Meaning |
| --- | --- |
| `compilation` | The Roslyn compilation of the project that contains the shaders. |
| `cancellationToken` | Cancels the analysis of the compilation. |

`Compile` does not check the C# errors of the compilation. Check them first, the same as the CLI does:

```csharp
using Microsoft.Build.Locator;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.MSBuild;
using YotsubaShader.Compiler.Library;
using YotsubaShader.Extensions;

// From a .csproj, with the Microsoft.Build.Locator and
// Microsoft.CodeAnalysis.Workspaces.MSBuild packages
MSBuildLocator.RegisterDefaults();
using var workspace = MSBuildWorkspace.Create();
Project project = await workspace.OpenProjectAsync("MyShaders/MyShaders.csproj");
Compilation compilation = (await project.GetCompilationAsync())!;

Diagnostic[] errors = compilation.GetDiagnostics()
    .Where(d => d.Severity == DiagnosticSeverity.Error)
    .ToArray();

if (errors.Length != 0)
{
    foreach (Diagnostic error in errors) Console.Error.WriteLine(error);
    return;
}

List<CompiledCode> shaders = CSharpToSpirvCompiler.Compile(compilation);
```

The compilation can also be built in memory, for example in a test or an editor that keeps the source as text:

```csharp
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using YotsubaShader.Compiler.Library;
using YotsubaShader.Extensions;

string source = File.ReadAllText("Gradient.cs");

// The assemblies of the shader packages the source uses
MetadataReference[] references =
[
    MetadataReference.CreateFromFile(typeof(object).Assembly.Location),
    MetadataReference.CreateFromFile(typeof(YotsubaShader.Language.ShaderStageAttribute).Assembly.Location),
    MetadataReference.CreateFromFile(typeof(YotsubaShader.GlslSyntax.Types.vec4).Assembly.Location),
];

CSharpCompilation compilation = CSharpCompilation.Create(
    "Shaders",
    [CSharpSyntaxTree.ParseText(source)],
    references,
    new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary));

List<CompiledCode> shaders = CSharpToSpirvCompiler.Compile(compilation);
```

## CompiledCode

One compiled shader class: its SPIR-V module, its reflection and the methods that translate the module to each language.

```csharp
namespace YotsubaShader.Extensions;

public record CompiledCode(
    ShaderReflection Reflection,
    byte[] SpirV,
    string SpirVAs,
    string CSharpFullClassName)
{
    public byte[] ToSpirV(int major, int minor);

    public string ToGlsl(Stage stage, uint version = 450);
    public string ToGlslEs(Stage stage, uint version = 310);
    public string ToHlsl(Stage stage);
    public string ToHlsl(Stage stage, uint shaderModel = 50);
    public string ToMsl(Stage stage);
    public string ToMsl(Stage stage, uint? majorVersion = null, uint minorVersion = 0, uint patchVersion = 0);
    public string ToCpp(Stage stage);
}
```

### Properties

| Property | Meaning |
| --- | --- |
| `SpirV` | The SPIR-V binary module, with every stage of the class inside, in SPIR-V 1.6 and without the `SPV_GOOGLE_*` debug extensions. Load it as is in Vulkan 1.3, or write it to a `.spv` file. For an older Vulkan, use `ToSpirV`. |
| `SpirVAs` | The same module as SPIR-V assembly text, for reading and debugging. |
| `CSharpFullClassName` | The full name of the C# class, with its namespace: `MyShaders.Gradient`. |
| `Reflection` | The intermediate representation of the shader: its entry points, inputs, outputs and resources. See [ShaderReflection](#shaderreflection). |

```csharp
using YotsubaShader.Extensions;

foreach (CompiledCode shader in shaders)
{
    // MyShaders.Gradient -> MyShaders/Gradient.spv
    string path = shader.CSharpFullClassName.Replace('.', '/') + ".spv";
    Directory.CreateDirectory(Path.GetDirectoryName(path)!);
    File.WriteAllBytes(path, shader.SpirV);

    Console.WriteLine(shader.SpirVAs);
}
```

### Translation methods

Each method translates the SPIR-V of one stage and returns its source text. The stage is `Stage.Vertex`, `Stage.Fragment` or `Stage.Compute`.

| Method | Returns |
| --- | --- |
| `ToSpirV(major, minor)` | The SPIR-V module in the version you ask for, from 1.3 to 1.6. It takes no stage: the module has them all. |
| `ToGlsl(stage, version = 450)` | GLSL for OpenGL, with `void main()`. `version` is the `#version` line, from 110 to 460. |
| `ToGlslEs(stage, version = 310)` | GLSL ES for OpenGL ES and WebGL. `version` is 100, 300, 310 or 320; WebGL 2 reads 300. |
| `ToHlsl(stage)` | HLSL, shader model 5.0, with the entry point keeping the name of the C# method. |
| `ToHlsl(stage, shaderModel)` | The same with another shader model, written as 30, 40, 50, 60 and so on up to 68. |
| `ToMsl(stage)` | Metal Shading Language, version 1.2. |
| `ToMsl(stage, majorVersion, minorVersion, patchVersion)` | Metal Shading Language in the version you ask for, such as `ToMsl(stage, 2, 4)`. |
| `ToCpp(stage)` | C++. |

The overloads with one parameter, `ToHlsl(stage)` and `ToMsl(stage)`, stay on purpose: the plugins already published call them, and removing them would break those plugins when they load.

There is no `ToWgsl` in the library. The WGSL output is made by the CLI, with a native library (naga) that the package does not carry. To get WGSL from your own code, run `yotsuba compile --target wgsl`, see [the compile reference](../reference/compile.md#language-versions).

```csharp
using YotsubaShader.Extensions;
using YotsubaShader.IR.Intermediate;

string vertex = shader.ToGlsl(Stage.Vertex);
string fragment = shader.ToGlsl(Stage.Fragment);

string webFragment = shader.ToGlslEs(Stage.Fragment);
string direct3d = shader.ToHlsl(Stage.Fragment);
string metal = shader.ToMsl(Stage.Fragment);
```

The methods throw when the stage cannot be chosen:

| Exception | When |
| --- | --- |
| `ArgumentOutOfRangeException` | `stage` is `Stage.None`. |
| `InvalidOperationException` | The class has no method of that stage, or it has more than one. |

To translate only the stages a class has, read them from the reflection:

```csharp
using YotsubaShader.Extensions;
using YotsubaShader.IR.Intermediate;

IEnumerable<Stage> stages = shader.Reflection.IntermediateLanguage.Functions
    .Select(function => function.Stage)
    .Where(stage => stage != Stage.None)
    .Distinct();

foreach (Stage stage in stages)
{
    File.WriteAllText($"{shader.CSharpFullClassName}.{stage}.hlsl", shader.ToHlsl(stage));
}
```

## ShaderReflection

The intermediate representation the SPIR-V was generated from. Use it to know the entry points of a shader and the slot of every input, output and resource, for example to create the vertex layout or the descriptor sets of your renderer.

```csharp
namespace YotsubaShader.Extensions;

public record ShaderReflection(Shader IntermediateLanguage);
```

```csharp
namespace YotsubaShader.IR.Intermediate;

public readonly record struct Shader(
    IReadOnlyList<Function> Functions,
    IReadOnlyList<Storage> GlobalResources);

public readonly record struct Function(
    FunctionId Id,
    string HumanName,
    Stage Stage,
    IReadOnlyList<Storage> Inputs,
    IReadOnlyList<Storage> Outputs,
    IReadOnlyList<Statement> Body,
    FunctionExtraParams? ExtraParams = null,
    IReadOnlyList<ParameterMode>? ParameterModes = null);

public abstract record class Storage(
    string HumanName,
    StorageKind Kind,
    InterfaceSlot? Slot);
```

| Member | Meaning |
| --- | --- |
| `Shader.Functions` | Every function of the shader: the entry points (with a `Stage`) and the helper functions (`Stage.None`). |
| `Shader.GlobalResources` | The uniform buffers, storage buffers, textures and samplers of the class. |
| `Function.HumanName` | The name of the C# method. It is the entry point name in the translated code. |
| `Function.Stage` | `Vertex`, `Fragment`, `Compute`, or `None` for a helper function. |
| `Function.Inputs`, `Function.Outputs` | The values the stage receives and produces. |
| `Function.ExtraParams` | For a compute entry point, a `ComputeParams(X, Y, Z)` with the workgroup size. |
| `Storage.HumanName` | The name of the C# field, parameter or member. |
| `Storage.Kind` | What the value is. See `StorageKind` below. |
| `Storage.Slot` | Where the value is bound, or `null` when it has no slot. |

The type of a value is the subclass of `Storage`: `Float`, `Int`, `Bool`, `Half`, `Double`, `Vector`, `Matrix`, `Array`, `CustomStruct`, `Texture` or `Sampler`.

```csharp
using YotsubaShader.Extensions;
using YotsubaShader.IR.Intermediate;
using YotsubaShader.IR.Intermediate.Slot;

Shader ir = shader.Reflection.IntermediateLanguage;

foreach (Function entry in ir.Functions.Where(f => f.Stage != Stage.None))
{
    Console.WriteLine($"{entry.Stage}: {entry.HumanName}");

    foreach (Storage input in entry.Inputs)
    {
        if (input.Slot is LocationSlot location)
            Console.WriteLine($"  in  location {location.Location}: {input.HumanName}");
    }

    if (entry.ExtraParams is ComputeParams size)
        Console.WriteLine($"  workgroup {size.X} x {size.Y} x {size.Z}");
}

foreach (Storage resource in ir.GlobalResources)
{
    if (resource.Slot is DescriptorSlot slot)
        Console.WriteLine($"{resource.Kind} {resource.HumanName}: set {slot.Set}, binding {slot.Binding}");
}
```

### Stage

```csharp
namespace YotsubaShader.IR.Intermediate;

public enum Stage : uint
{
    None = 0,
    Fragment = 1,
    Vertex = 2,
    Compute = 3
}
```

### StorageKind

```csharp
namespace YotsubaShader.IR.Intermediate;

public enum StorageKind
{
    Input,         // a value the stage receives
    Output,        // a value the stage produces
    Uniform,       // a uniform buffer
    StorageBuffer, // a storage buffer
    PushConstant,  // a push constant block
    Texture,       // a texture
    Sampler,       // a sampler
    Local          // a local variable
}
```

### Slots

The `Slot` of a `Storage` is one of these records:

```csharp
namespace YotsubaShader.IR.Intermediate.Slot;

public interface InterfaceSlot { }

// [Location(n)], [location(n)], [SV_Target(n)], [attribute(n)]...
public sealed record LocationSlot(int Location) : InterfaceSlot;

// [layout(set, binding)], [register(...)], [DescriptorSet(s), Binding(n)], [@group(s), @binding(n)]...
public sealed record DescriptorSlot(int Set, int Binding) : InterfaceSlot;

// A built-in value: [SV_Position], [gl_FragCoord], [@builtin_vertex_index]...
public sealed record BuiltInSlot(BuiltIn BuiltIn) : InterfaceSlot;

// A named semantic such as [TEXCOORD(0)] or [COLOR]: the backend turns it into a location
public sealed record VertexSlot(VertexSemantic Semantic) : InterfaceSlot;
```

```csharp
namespace YotsubaShader.IR.Intermediate.Slot.Types;

public enum BuiltIn
{
    // Vertex
    Position, PointSize, VertexIndex, InstanceIndex, BaseVertex, BaseInstance,
    // Fragment
    FragCoord, FrontFacing, FragDepth, SampleId, SamplePosition, PrimitiveId, HelperInvocation,
    FragDepthGreater, FragDepthLess,
    // Compute
    GlobalInvocationId, LocalInvocationId, LocalInvocationIndex, WorkgroupId, NumWorkgroups,
}
```

## IShaderTargetBackend

The interface of a plugin: a class that turns a `CompiledCode` into the file of one more format. The CLI loads the backends of the [plugins](../reference/plugins.md) (MonoGame, KNI, FNA, Godot) through it, and your own tool can call them the same way.

```csharp
namespace YotsubaShader.Extensions;

public interface IShaderTargetBackend
{
    string Name { get; }

    byte[] Compile(CompiledCode shader, uint options);
}
```

| Member | Meaning |
| --- | --- |
| `Name` | The name of the target, the one written after `--target`. |
| `Compile` | Returns the bytes of the file for one shader. `options` is the numeric value of the plugin option (a MonoGame platform, a Godot shader type) or `0` when the plugin has none. For text formats the bytes are UTF-8 text. |

```csharp
using System.Text;
using YotsubaShader.Extensions;
using YotsubaShader.IR.Intermediate;

// A backend that writes the vertex and fragment GLSL in one text file
public sealed class GlslBundleBackend : IShaderTargetBackend
{
    public string Name => "glsl-bundle";

    public byte[] Compile(CompiledCode shader, uint options)
    {
        string text =
            "// vertex\n" + shader.ToGlsl(Stage.Vertex) +
            "\n// fragment\n" + shader.ToGlsl(Stage.Fragment);

        return Encoding.UTF8.GetBytes(text);
    }
}
```

## Related

```buttons
[CLI commands](cli.md)
[Compile in your build](../custom-engine/compile-in-your-build.md)
[Load at runtime](../custom-engine/load-at-runtime.md)
```

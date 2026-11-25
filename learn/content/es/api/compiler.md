---
title: Librería del compilador
summary: La API de YotsubaShader.Compiler.Library: compila una compilación de Roslyn a SPIR-V y tradúcela a GLSL, HLSL, MSL y C++.
order: 7
---

API del paquete `YotsubaShader.Compiler.Library`: el compilador que ejecuta la CLI, como librería de .NET (`net8.0`). Úsala para compilar shaders desde tu propia herramienta, paso de build o editor, sin arrancar el proceso `yotsuba`.

```bash
dotnet add package YotsubaShader.Compiler.Library
```

Todo el pipeline es una sola llamada: le das una `Compilation` de Roslyn y devuelve un `CompiledCode` por cada clase shader, con el SPIR-V y los métodos que lo traducen a los otros lenguajes.

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

## Espacios de nombres

```csharp
using YotsubaShader.Compiler.Library; // CSharpToSpirvCompiler
using YotsubaShader.Extensions;       // CompiledCode, ShaderReflection, IShaderTargetBackend
using YotsubaShader.IR.Intermediate;  // Stage, Shader, Function, Storage, StorageKind
using YotsubaShader.IR.Intermediate.Slot;       // LocationSlot, DescriptorSlot, BuiltInSlot, VertexSlot
using YotsubaShader.IR.Intermediate.Slot.Types; // BuiltIn
```

> [!IMPORTANT]
> La librería usa `YotsubaShader.IR.Intermediate.Stage`. No es el `Stage` de `YotsubaShader.Language` que escribes en `[ShaderStage(Stage.Vertex)]`. En un archivo que importa los dos espacios de nombres, escribe el nombre completo.

## CSharpToSpirvCompiler

El punto de entrada de la librería.

```csharp
namespace YotsubaShader.Compiler.Library;

public sealed class CSharpToSpirvCompiler
{
    public static List<CompiledCode> Compile(Compilation compilation, CancellationToken cancellationToken = default);
}
```

### Compile

Lee cada clase de la compilación que tiene métodos marcados con `[ShaderStage]`, construye la representación intermedia de cada una, genera su SPIR-V y devuelve un `CompiledCode` por clase, en el orden en que se encontraron las clases. Una compilación sin shaders devuelve una lista vacía.

| Parámetro | Significado |
| --- | --- |
| `compilation` | La compilación de Roslyn del proyecto que contiene los shaders. |
| `cancellationToken` | Cancela el análisis de la compilación. |

`Compile` no revisa los errores de C# de la compilación. Revísalos antes, igual que hace la CLI:

```csharp
using Microsoft.Build.Locator;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.MSBuild;
using YotsubaShader.Compiler.Library;
using YotsubaShader.Extensions;

// Desde un .csproj, con los paquetes Microsoft.Build.Locator y
// Microsoft.CodeAnalysis.Workspaces.MSBuild
MSBuildLocator.RegisterDefaults();
using var workspace = MSBuildWorkspace.Create();
Project project = await workspace.OpenProjectAsync("MisShaders/MisShaders.csproj");
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

La compilación también se puede crear en memoria, por ejemplo en una prueba o en un editor que guarda el código como texto:

```csharp
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using YotsubaShader.Compiler.Library;
using YotsubaShader.Extensions;

string source = File.ReadAllText("Degradado.cs");

// Los ensamblados de los paquetes de shaders que usa el código
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

Una clase shader compilada: su módulo SPIR-V, su reflexión y los métodos que traducen el módulo a cada lenguaje.

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

### Propiedades

| Propiedad | Significado |
| --- | --- |
| `SpirV` | El módulo binario SPIR-V, con todas las etapas de la clase dentro, en SPIR-V 1.6 y sin las extensiones de depuración `SPV_GOOGLE_*`. Cárgalo tal cual en Vulkan 1.3 o escríbelo en un archivo `.spv`. Para un Vulkan anterior usa `ToSpirV`. |
| `SpirVAs` | El mismo módulo como texto en ensamblador SPIR-V, para leerlo y depurar. |
| `CSharpFullClassName` | El nombre completo de la clase de C#, con su espacio de nombres: `MisShaders.Degradado`. |
| `Reflection` | La representación intermedia del shader: sus puntos de entrada, entradas, salidas y recursos. Mira [ShaderReflection](#shaderreflection). |

```csharp
using YotsubaShader.Extensions;

foreach (CompiledCode shader in shaders)
{
    // MisShaders.Degradado -> MisShaders/Degradado.spv
    string path = shader.CSharpFullClassName.Replace('.', '/') + ".spv";
    Directory.CreateDirectory(Path.GetDirectoryName(path)!);
    File.WriteAllBytes(path, shader.SpirV);

    Console.WriteLine(shader.SpirVAs);
}
```

### Métodos de traducción

Cada método traduce el SPIR-V de una etapa y devuelve su código fuente. La etapa es `Stage.Vertex`, `Stage.Fragment` o `Stage.Compute`.

| Método | Devuelve |
| --- | --- |
| `ToSpirV(major, minor)` | El módulo SPIR-V en la versión que pidas, de 1.3 a 1.6. No lleva etapa: el módulo las tiene todas. |
| `ToGlsl(stage, version = 450)` | GLSL para OpenGL, con `void main()`. `version` es la línea `#version`, de 110 a 460. |
| `ToGlslEs(stage, version = 310)` | GLSL ES para OpenGL ES y WebGL. `version` es 100, 300, 310 o 320; WebGL 2 lee 300. |
| `ToHlsl(stage)` | HLSL, shader model 5.0, con el punto de entrada con el nombre del método de C#. |
| `ToHlsl(stage, shaderModel)` | Lo mismo con otro shader model, escrito como 30, 40, 50, 60 y así hasta 68. |
| `ToMsl(stage)` | Metal Shading Language, versión 1.2. |
| `ToMsl(stage, majorVersion, minorVersion, patchVersion)` | Metal Shading Language en la versión que pidas, como `ToMsl(stage, 2, 4)`. |
| `ToCpp(stage)` | C++. |

Las sobrecargas de un solo parámetro, `ToHlsl(stage)` y `ToMsl(stage)`, se mantienen a propósito: los plugins ya publicados las llaman, y quitarlas rompería esos plugins al cargarlos.

La librería no tiene `ToWgsl`. La salida WGSL la hace la CLI, con una librería nativa (naga) que el paquete no incluye. Para obtener WGSL desde tu código, ejecuta `yotsuba compile --target wgsl`, mira [la referencia de compile](../reference/compile.md#versiones-del-lenguaje).

```csharp
using YotsubaShader.Extensions;
using YotsubaShader.IR.Intermediate;

string vertex = shader.ToGlsl(Stage.Vertex);
string fragment = shader.ToGlsl(Stage.Fragment);

string webFragment = shader.ToGlslEs(Stage.Fragment);
string direct3d = shader.ToHlsl(Stage.Fragment);
string metal = shader.ToMsl(Stage.Fragment);
```

Los métodos lanzan una excepción cuando no se puede elegir la etapa:

| Excepción | Cuándo |
| --- | --- |
| `ArgumentOutOfRangeException` | `stage` es `Stage.None`. |
| `InvalidOperationException` | La clase no tiene un método de esa etapa, o tiene más de uno. |

Para traducir solo las etapas que tiene una clase, léelas de la reflexión:

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

La representación intermedia de la que salió el SPIR-V. Úsala para conocer los puntos de entrada de un shader y la ranura de cada entrada, salida y recurso, por ejemplo para crear el layout de vértices o los descriptor sets de tu renderer.

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

| Miembro | Significado |
| --- | --- |
| `Shader.Functions` | Todas las funciones del shader: los puntos de entrada (con un `Stage`) y las funciones auxiliares (`Stage.None`). |
| `Shader.GlobalResources` | Los buffers uniformes, storage buffers, texturas y samplers de la clase. |
| `Function.HumanName` | El nombre del método de C#. Es el nombre del punto de entrada en el código traducido. |
| `Function.Stage` | `Vertex`, `Fragment`, `Compute`, o `None` para una función auxiliar. |
| `Function.Inputs`, `Function.Outputs` | Los valores que la etapa recibe y produce. |
| `Function.ExtraParams` | En un punto de entrada compute, un `ComputeParams(X, Y, Z)` con el tamaño del grupo de trabajo. |
| `Storage.HumanName` | El nombre del campo, parámetro o miembro de C#. |
| `Storage.Kind` | Qué es el valor. Mira `StorageKind` más abajo. |
| `Storage.Slot` | Dónde está enlazado el valor, o `null` cuando no tiene ranura. |

El tipo de un valor es la subclase de `Storage`: `Float`, `Int`, `Bool`, `Half`, `Double`, `Vector`, `Matrix`, `Array`, `CustomStruct`, `Texture` o `Sampler`.

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
        Console.WriteLine($"  grupo {size.X} x {size.Y} x {size.Z}");
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
    Input,         // un valor que recibe la etapa
    Output,        // un valor que produce la etapa
    Uniform,       // un buffer uniforme
    StorageBuffer, // un storage buffer
    PushConstant,  // un bloque de push constants
    Texture,       // una textura
    Sampler,       // un sampler
    Local          // una variable local
}
```

### Ranuras

El `Slot` de un `Storage` es uno de estos records:

```csharp
namespace YotsubaShader.IR.Intermediate.Slot;

public interface InterfaceSlot { }

// [Location(n)], [location(n)], [SV_Target(n)], [attribute(n)]...
public sealed record LocationSlot(int Location) : InterfaceSlot;

// [layout(set, binding)], [register(...)], [DescriptorSet(s), Binding(n)], [@group(s), @binding(n)]...
public sealed record DescriptorSlot(int Set, int Binding) : InterfaceSlot;

// Un valor integrado: [SV_Position], [gl_FragCoord], [@builtin_vertex_index]...
public sealed record BuiltInSlot(BuiltIn BuiltIn) : InterfaceSlot;

// Una semántica con nombre como [TEXCOORD(0)] o [COLOR]: el backend la convierte en una ubicación
public sealed record VertexSlot(VertexSemantic Semantic) : InterfaceSlot;
```

```csharp
namespace YotsubaShader.IR.Intermediate.Slot.Types;

public enum BuiltIn
{
    // Vértices
    Position, PointSize, VertexIndex, InstanceIndex, BaseVertex, BaseInstance,
    // Fragmentos
    FragCoord, FrontFacing, FragDepth, SampleId, SamplePosition, PrimitiveId, HelperInvocation,
    FragDepthGreater, FragDepthLess,
    // Compute
    GlobalInvocationId, LocalInvocationId, LocalInvocationIndex, WorkgroupId, NumWorkgroups,
}
```

## IShaderTargetBackend

La interfaz de un plugin: una clase que convierte un `CompiledCode` en el archivo de un formato más. La CLI carga a través de ella los backends de los [plugins](../reference/plugins.md) (MonoGame, KNI, FNA, Godot), y tu propia herramienta los puede llamar de la misma forma.

```csharp
namespace YotsubaShader.Extensions;

public interface IShaderTargetBackend
{
    string Name { get; }

    byte[] Compile(CompiledCode shader, uint options);
}
```

| Miembro | Significado |
| --- | --- |
| `Name` | El nombre del destino, el que se escribe después de `--target`. |
| `Compile` | Devuelve los bytes del archivo de un shader. `options` es el valor numérico de la opción del plugin (una plataforma de MonoGame, un tipo de shader de Godot) o `0` cuando el plugin no tiene. En los formatos de texto, los bytes son texto UTF-8. |

```csharp
using System.Text;
using YotsubaShader.Extensions;
using YotsubaShader.IR.Intermediate;

// Un backend que escribe el GLSL de vértices y de fragmentos en un solo archivo de texto
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

## Relacionado

```buttons
[Comandos de la CLI](cli.md)
[Compilar en tu build](../custom-engine/compile-in-your-build.md)
[Cargar en ejecución](../custom-engine/load-at-runtime.md)
```

---
title: The add command
summary: Compile the shaders and write them inside your project as C# methods.
order: 7
---

`add` compiles the shaders of a project and writes the result into a C# file, `YotsubaShader.g.cs`, inside that same project. Each shader class gets extension methods that return the compiled shader, so your program asks for it by name and the C# compiler checks the name.

```bash
yotsuba add MyShaders/MyShaders.csproj --target spirv
```

## Synopsis

```text
yotsuba add <project.csproj> --target <target>[:<version>] [--target <target>[:<version>] ...]
```

| Argument | Required | Meaning |
| --- | --- | --- |
| `<project.csproj>` | Yes | The project that contains the shader classes. The file is written next to it. |
| `--target <target>[:<version>]` | Yes, at least one | Plugin targets (`monogame`, `kni`, `fna`, `godot`) add their own methods, and `wgsl` adds `ToWgsl()`. The built-in ones (`spirv`, `glsl`, `gles`, `hlsl`, `msl`) are accepted, and the methods of the first table below are always generated; with a version (`gles:300`), that method returns that version. One version per target. |

## What it does

1. Opens the `.csproj` and compiles its C#. With a C# error it prints the errors and stops with exit code `1`. If the project was never restored, it runs `dotnet restore` once first. The previous `YotsubaShader.g.cs` is left out of this compilation (see [Known behavior](#known-behavior)).
2. Finds every class with `[ShaderStage]` methods and compiles it.
3. Loads the plugins named in `--target` (installing or updating them if needed).
4. Writes `YotsubaShader.g.cs` next to the `.csproj` and prints `Archivo generado: <path>`. If the content is the same as the file already there, it does not touch it and prints `Sin cambios: <path>`, so an unchanged project is not compiled again. If a plugin you asked for could not be loaded, it keeps the previous file.

## What is generated

The file declares a `static class YotsubaShader_ShadersCompilations` in the `YotsubaShader` namespace, hidden from IntelliSense. For every shader class it adds these extension methods:

| Method | Returns | For |
| --- | --- | --- |
| `ToSpirV()` | `byte[]` | Vulkan |
| `ToGlsl(Stage)` | `string` | OpenGL |
| `ToGlslEs(Stage)` | `string` | OpenGL ES and WebGL |
| `ToHlsl(Stage)` | `string` | DirectX |
| `ToMSL(Stage)` | `string` | Metal |
| `ToWgsl()` | `string` | WebGPU. Only with `--target wgsl`; it returns the whole file, with every stage |

The text methods take a `Stage` (`Stage.Vertex`, `Stage.Fragment` or `Stage.Compute`) and return that stage. They throw `ArgumentOutOfRangeException` for a stage the shader does not have.

Without a version in `--target`, each method returns the default version of its language: SPIR-V 1.6, GLSL 450, GLSL ES 310, HLSL shader model 5.0 and MSL 1.2. With `--target gles:300`, `ToGlslEs` returns GLSL ES 3.00, and the same goes for `spirv`, `glsl`, `hlsl` and `msl`. The accepted versions are in [Language versions](compile.md#language-versions).

A stage that a language cannot express (for example `double` in GLSL ES) does not stop the command. That case of the method throws `NotSupportedException` with the reason, and `add` prints it:

```text
Aviso: MyShaders.Plasma.ToGlslEs(Fragment): FP64 not supported in ES profile.
```

It is only a warning, unless you asked for that target with `--target`: then it is an error and the exit code is `1`.

Each plugin you ask for adds one more method, and the options of the plugin become an `enum` in the same namespace:

| Plugin | Method | Returns | Parameter |
| --- | --- | --- | --- |
| `monogame` | `ToMGFX(MonoGamePlatform platform)` | `byte[]` | `DesktopGL`, `WindowsDX11`, `WindowsDirectX12`, `DesktopVulkan`, `iOS`, `Android`, `GL4` |
| `kni` | `ToKNIWebGL_FX()` | `byte[]` | none |
| `fna` | `ToFNA_FX()` | `byte[]` | none |
| `godot` | `ToGodotShader(GodotShaderType type)` | `string` | `Spatial`, `CanvasItem` |

The shaders are embedded in the file: SPIR-V as a Base64 string and the text formats as raw string literals. Nothing is read from disk at run time.

## Using the methods

The methods are extension methods of your own shader classes:

```csharp
using YotsubaShader;
using YotsubaShader.Language;

var gradient = new MyShaders.Gradient();

byte[] spirv = gradient.ToSpirV();
string vertex = gradient.ToGlsl(Stage.Vertex);
string fragment = gradient.ToGlsl(Stage.Fragment);
```

With a plugin, for example `--target monogame`:

```csharp
byte[] effect = gradient.ToMGFX(MonoGamePlatform.DesktopGL);
```

If you rename or delete the `Gradient` class, your program stops compiling until you fix the places that use it.

## Run it on every build

Typing the command after each change is easy to forget. Add a `<Target>` to the `.csproj` of the shader project so that .NET runs `add` right before compiling the C#:

```xml
<Target Name="CompileShaders" BeforeTargets="CoreCompile" Condition="'$(DesignTimeBuild)' != 'true'">
  <Exec Command="yotsuba add &quot;$(MSBuildProjectFullPath)&quot; --target spirv --target monogame" />
  <ItemGroup>
    <Compile Remove="YotsubaShader.g.cs" />
    <Compile Include="YotsubaShader.g.cs" />
  </ItemGroup>
</Target>
```

- `BeforeTargets="CoreCompile"` runs it right before the C# is compiled.
- The two `<Compile>` lines add the generated file to the build, even the first time, when it did not exist.
- The `Condition` skips it while the editor analyzes the project in the background.

## Known behavior

- If you delete or rename a shader class, the old `YotsubaShader.g.cs` still names it and no longer compiles. `add` leaves that file out when it compiles the project, and ignores the errors of code that calls a generated method that does not exist yet, so it writes the new file without you deleting the old one.
- Exit codes: `0` on success (warnings included), `1` for C# errors, a plugin that fails or a target you asked for that fails, `2` for wrong arguments, including two versions of one target.

To write separate files instead, use [`compile`](compile.md).

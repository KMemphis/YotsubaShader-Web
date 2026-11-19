---
title: The CLI
summary: The compiler's commands (add, compile and plugin), the plugins for each engine, and how to make add run on its own.
order: 18
---

Throughout the tutorial you used a single command, `add`. In this chapter you see the whole CLI: what other command it has, what formats it can generate and how to stop typing the command by hand.

## The two commands

The CLI has two commands. Both compile the same thing. What changes is **where they leave the result**:

| Command | Where it leaves the result | When it suits you |
| --- | --- | --- |
| `add` | In a C# file, `YotsubaShader.g.cs`, inside your project. | When the program that uses the shaders is written in C#. This is the normal case. |
| `compile` | In separate files (`.glsl`, `.hlsl`, `.spv`...) inside a folder. | When something that is not C# will load the shaders, or when you want to open the files and look at them. |

## `add`: the result inside your project

You already know it:

```bash
dotnet yotsuba add MyShaders/MyShaders.csproj --target spirv
```

What it does, step by step:

1. It opens your `.csproj` and reads all its C# files.
2. It checks that the project compiles. If there is a C# error, it shows it and stops.
3. It looks for every class that has methods with `[ShaderStage]`.
4. It compiles each one.
5. It writes `YotsubaShader.g.cs` next to your `.csproj`.

For each shader class, that file adds these methods:

| Method | Returns | For |
| --- | --- | --- |
| `ToSpirV()` | `byte[]` | Vulkan |
| `ToGlsl(Stage)` | `string` | OpenGL |
| `ToGlslEs(Stage)` | `string` | OpenGL ES and WebGL |
| `ToHlsl(Stage)` | `string` | DirectX |
| `ToMSL(Stage)` | `string` | Metal |

The ones that ask for a `Stage` return one stage at a time: `Stage.Vertex` or `Stage.Fragment`.

The good thing about `add` is that the C# compiler looks after you. If you rename the `Gradient` class, your program stops compiling until you fix it. With separate files, you only discover a misspelled name when you run.

The first five come with the CLI. The engine methods come from **plugins**, and each one is requested with its own `--target`:

| Method | Returns | For | Asked with |
| --- | --- | --- | --- |
| `ToMGFX(MonoGamePlatform)` | `byte[]` | MonoGame | `--target monogame` |
| `ToKNIWebGL_FX()` | `byte[]` | KNI | `--target kni` |
| `ToFNA_FX()` | `byte[]` | FNA | `--target fna` |
| `ToGodotShader(GodotShaderType)` | `string` | Godot | `--target godot` |

For example, to use your shaders in {{engine}}:

```bash
dotnet yotsuba add MyShaders/MyShaders.csproj --target spirv --target {{plugin}}
```

> [!NOTE]
> The CLI requires at least one `--target` with `add` too. `spirv` is the one the tutorial uses, and the methods of the first table are generated no matter which one you choose.

### Plugins

A plugin is a small NuGet package that teaches the CLI one more format. The CLI downloads it the first time you ask for it with `--target`, and keeps it in a folder in your user account. These are the commands to manage them:

| Command | What it does |
| --- | --- |
| `dotnet yotsuba plugin list` | Shows the plugins that exist and which ones you have installed. |
| `dotnet yotsuba plugin install monogame` | Downloads a plugin before you need it. |
| `dotnet yotsuba plugin update monogame` | Fetches its latest version. Without a name, it updates all the installed ones. |
| `dotnet yotsuba plugin remove monogame` | Deletes it. |

The plugin is used only by the CLI, when it compiles. Your game does not reference it. The [MonoGame, KNI and FNA guides](../engines/index.md) show the whole path, step by step.

## `compile`: the result in files

With `compile` you choose the formats you want, by repeating `--target`, and the folder to put them in, with `--output`:

```bash
dotnet yotsuba compile MyShaders/MyShaders.csproj --target glsl --target hlsl --target msl --target spirv --output out
```

With the first two shaders of the tutorial in the project, this is what appears:

```text
MyShaders/out/MyShaders/
├── Gradient.Fragment.glsl
├── Gradient.Fragment.hlsl
├── Gradient.Fragment.msl
├── Gradient.Vertex.glsl
├── Gradient.Vertex.hlsl
├── Gradient.Vertex.msl
├── Gradient.spv
├── Mandelbrot.Fragment.glsl
├── Mandelbrot.Fragment.hlsl
├── Mandelbrot.Fragment.msl
├── Mandelbrot.Vertex.glsl
├── Mandelbrot.Vertex.hlsl
├── Mandelbrot.Vertex.msl
└── Mandelbrot.spv
```

How to read those names:

- The inner `MyShaders` folder is the `namespace` of your classes. If the class were `Game.Effects.Gradient`, the file would be in `out/Game/Effects/`.
- Text formats generate one file per stage: `Gradient.Vertex.glsl` and `Gradient.Fragment.glsl`.
- SPIR-V generates a single file per shader, with every stage inside.

Two details about `--output`:

- The path is counted from the folder of the `.csproj`, not from where you run the command. That is why `out` ended up inside `MyShaders`.
- If you leave out `--output`, the folder is called `artifacts`.

### The formats you can ask for with `--target`

| `--target` | What it generates | Extension |
| --- | --- | --- |
| `spirv` (or `spv`) | SPIR-V, for Vulkan | `.spv` |
| `glsl` | GLSL, for OpenGL | `.glsl` |
| `gles` (or `glsles`) | GLSL ES, for mobile and web | `.gles` |
| `hlsl` | HLSL, for DirectX | `.hlsl` |
| `msl` (or `metal`) | Metal, for Apple | `.msl` |
| `cpp` | C++ | `.cpp` |
| `monogame` (or `mgfx`) | MonoGame effects, one per platform. It needs the `monogame` plugin. | `.mgfx` |
| `kni` (or `kni-webgl`) | KNI effect. It needs the `kni` plugin. | `.knifx` |
| `fna` | FNA effect. It needs the `fna` plugin. | `.fxb` |
| `godot` (or `gdshader`) | Godot shaders, one per type (`spatial`, `canvas_item`). It needs the `godot` plugin. | `.gdshader` |

## Make `add` run on its own

Typing the command after every change gets tiring, and if you forget, your program uses an old shader. You can ask .NET to run `add` every time it builds the project.

Open `MyShaders/MyShaders.csproj` and add the `<Target>` block. The complete file looks like this:

```xml title="MyShaders/MyShaders.csproj"
<Project Sdk="Microsoft.NET.Sdk">

  <ItemGroup>
    <PackageReference Include="YotsubaShader.GlslSyntax" Version="0.8.1" />
  </ItemGroup>

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>

  <Target Name="CompileShaders" BeforeTargets="CoreCompile" Condition="'$(DesignTimeBuild)' != 'true'">
    <Exec Command="dotnet yotsuba add &quot;$(MSBuildProjectFullPath)&quot; --target spirv --target {{plugin}}" />
    <ItemGroup>
      <Compile Remove="YotsubaShader.g.cs" />
      <Compile Include="YotsubaShader.g.cs" />
    </ItemGroup>
  </Target>

</Project>
```

What that block says:

- `BeforeTargets="CoreCompile"`: "run this right before compiling the C#". That way `YotsubaShader.g.cs` is always up to date when it is compiled.
- `<Exec Command="...">`: the usual `add` command. `$(MSBuildProjectFullPath)` is the path of this same `.csproj`, and `&quot;` are quotes, in case the path has spaces.
- The two `<Compile>` lines make sure the freshly generated file goes into the build, even the first time, when it did not exist yet.
- `Condition="'$(DesignTimeBuild)' != 'true'"` keeps it from running while the editor analyzes the project in the background.

From now on this is all you need, and the shaders get compiled along the way:

```bash
dotnet run --project TryIt
```

Change a number in `Gradient.cs`, run that command, and the change already shows up in the console.

## When something goes wrong

The CLI prints its messages in Spanish. These are the ones you will see most, and what they mean:

| Message | What happened | How to fix it |
| --- | --- | --- |
| `Debes indicar al menos un --target.` | The format is missing. | Add `--target spirv`. |
| `Falta el proyecto .csproj.` | You did not say which project to compile. | Put the path of the `.csproj` after the command. |
| `Target desconocido 'x'.` | That format does not exist. | Use one from the formats table. |
| `Comando desconocido 'x'.` | Only `add`, `compile` and `plugin` exist. | Check how you typed it. |
| An error starting with `CS`, such as `error CS0103` | It is a normal C# error: your project does not compile. | Fix it like any C# error. The CLI does not continue until the project compiles. |
| `error CS0234` right after deleting or renaming a shader class | `YotsubaShader.g.cs` still names the old class, and `add` builds the project before rewriting it. | Delete `YotsubaShader.g.cs` and run `add` again. |
| `... no hay código disponible para compilarlo en GPU.` | You called a function that is not yours and that the GPU does not know, for example `System.Math.Sqrt`. | Use the functions in `YotsubaShader.GlslSyntax.Methods.Math` or write your own. |
| `'new ...vec4()' sin constructor declarado no está soportado para vectores.` | You created a vector with `new vec4 { ... }`. | Use `Make.Vec4(...)`, the helper from the first shader. |

If the error shows up as soon as the project is opened, before any shader is compiled, run `dotnet build MyShaders` first. The CLI needs the project to have already downloaded its dependencies.

## What you learned

- `add` leaves the result inside your project, as methods of your classes. `compile` leaves it in files.
- `--target` chooses the format and can be repeated. `--output` chooses the folder.
- MonoGame, KNI, FNA and Godot are plugins: you ask for them with `--target monogame`, `kni`, `fna` or `godot`, and the CLI downloads them the first time.
- With a `<Target>` in the `.csproj`, `add` runs on its own every time you build.

Next: [Other writing styles](how-it-works.md).

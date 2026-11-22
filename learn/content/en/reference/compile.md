---
title: The compile command
summary: Compile the shaders of a project into separate files, one per format and stage.
order: 6
---

`compile` reads a C# project, finds every class that has methods marked with `[ShaderStage]` and writes each shader as separate files in a folder. Use it when something that is not C# loads the shaders (an engine, a build pipeline, a tool), or when you want to open the files and read them.

```bash
yotsuba compile MyShaders/MyShaders.csproj --target glsl --target spirv --output out
```

## Synopsis

```text
yotsuba compile <project.csproj> --target <target> [--target <target> ...] [--output <folder>]
```

| Argument | Required | Meaning |
| --- | --- | --- |
| `<project.csproj>` | Yes | The project to compile. Only one project per call. |
| `--target <target>` | Yes, at least one | The format to generate. Repeat it to ask for several. See the table below. |
| `--output <folder>` | No | Where the files go. The path is counted from the folder of the `.csproj`, not from where you run the command. Default: `artifacts`. |

`yotsuba` is how the tool is called after `dotnet tool install --global YotsubaShader.Compiler.CLI`. If you prefer to pin its version in the project (for example in CI), install it as a local tool with `dotnet new tool-manifest` and `dotnet tool install YotsubaShader.Compiler.CLI`, and call it with `dotnet tool run yotsuba`. The same program is published as a stand-alone executable (`YotsubaShader.Compiler.CLI` on Linux and macOS, `YotsubaShader.Compiler.CLI.exe` on Windows), where the command is `yotsuba`.

## What it does

1. Opens the `.csproj` with MSBuild and compiles the C# of the project.
2. If the project has a C# error, it prints every error and stops with exit code `1`. No shader is written.
3. Finds the classes with `[ShaderStage]` methods and compiles each one to the shared intermediate representation.
4. For each shader and each `--target`, writes the files described below.
5. Plugin targets (`monogame`, `kni`, `fna`, `godot`) are loaded after the built-in ones, installing the plugin first if it is missing. See [Plugins](plugins.md).

## Targets

| `--target` | Aliases | Generates | Extension | Files per shader |
| --- | --- | --- | --- | --- |
| `spirv` | `spv` | SPIR-V (Vulkan) | `.spv` | One, with every stage inside |
| `glsl` | | GLSL (OpenGL) | `.glsl` | One per stage |
| `gles` | `glsles` | GLSL ES (mobile and web) | `.gles` | One per stage |
| `hlsl` | | HLSL (DirectX) | `.hlsl` | One per stage |
| `msl` | `metal` | Metal Shading Language | `.msl` | One per stage |
| `cpp` | | C++ | `.cpp` | One per stage |
| `monogame` | `mgfx` | MonoGame effect (plugin) | `.mgfx` | One per platform |
| `kni` | `kni-webgl` | KNI effect (plugin) | `.knifx` | One |
| `fna` | | FNA effect (plugin) | `.fxb` | One |
| `godot` | `gdshader` | Godot shader (plugin) | `.gdshader` | One per type |

A name that is not in the table is taken as a plugin name. If no plugin has that name, the CLI reports that it does not exist and lists the ones that do.

## Where the files go

The folder structure follows the `namespace` of your classes. For a class `MyShaders.Gradient` with a vertex and a fragment stage:

```text
MyShaders/out/MyShaders/
├── Gradient.Fragment.glsl
├── Gradient.Vertex.glsl
└── Gradient.spv
```

- A class in `Game.Effects` writes into `out/Game/Effects/`.
- Text formats write one file per stage: `<Class>.<Stage><extension>`, with `Vertex`, `Fragment` or `Compute` as the stage.
- SPIR-V writes `<Class>.spv`.
- A plugin with options writes one file per option, with the option in lower case before the extension: `Gradient.desktopgl.mgfx`, `Gradient.spatial.gdshader`. A plugin without options writes `<Class><extension>`.

## Exit codes and errors

| Code | When |
| --- | --- |
| `0` | Everything was written. |
| `1` | The project has C# errors, or a file or a plugin failed. The other files are still written. The message names the class and the extension that failed. |
| `2` | The arguments are wrong: no `--target`, no project, an unknown option, a second project or an unknown command. |

The CLI prints its messages in Spanish. The full list of messages is in the [Get Started chapter about the CLI](../get-started/cli.md).

## Examples

All the text formats at once:

```bash
yotsuba compile Game.Graphics/Game.Graphics.csproj \
  --target glsl --target gles --target hlsl --target msl \
  --output build/shaders
```

SPIR-V plus the Godot shaders, as part of a build script:

```bash
yotsuba compile Shaders/Shaders.csproj --target spirv --target godot --output ../Game/shaders
```

When the program that uses the shaders is written in C#, [`add`](add.md) is usually a better fit: it leaves the result inside the project as methods, and the C# compiler checks the names for you.

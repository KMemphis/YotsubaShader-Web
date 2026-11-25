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
yotsuba compile <project.csproj> --target <target>[:<version>] [--target <target>[:<version>] ...] [--output <folder>]
```

| Argument | Required | Meaning |
| --- | --- | --- |
| `<project.csproj>` | Yes | The project to compile. Only one project per call. |
| `--target <target>[:<version>]` | Yes, at least one | The format to generate, optionally with the version of its language after a colon (`glsl:430`). Repeat it to ask for several. See the tables below. |
| `--output <folder>` | No | Where the files go. The path is counted from the folder of the `.csproj`, not from where you run the command. Default: `artifacts`. |

`yotsuba` is how the tool is called after `dotnet tool install --global YotsubaShader.Compiler.CLI`. If you prefer to pin its version in the project (for example in CI), install it as a local tool with `dotnet new tool-manifest` and `dotnet tool install YotsubaShader.Compiler.CLI`, and call it with `dotnet tool run yotsuba`. The same program is published as a stand-alone executable (`YotsubaShader.Compiler.CLI` on Linux and macOS, `YotsubaShader.Compiler.CLI.exe` on Windows), where the command is `yotsuba`.

## What it does

1. Opens the `.csproj` with MSBuild and compiles the C# of the project. If the project was never restored, it runs `dotnet restore` once first.
2. If the project has a C# error, it prints every error and stops with exit code `1`. No shader is written.
3. Finds the classes with `[ShaderStage]` methods and compiles each one to the shared intermediate representation.
4. For each shader and each `--target`, writes the files described below. A stage that the language of a target cannot express (for example `double` in GLSL ES) is reported, and the other files are still written.
5. Plugin targets (`monogame`, `kni`, `fna`, `godot`) are loaded after the built-in ones, installing the plugin first if it is missing. See [Plugins](plugins.md).

## Targets

| `--target` | Aliases | Generates | Extension | Files per shader |
| --- | --- | --- | --- | --- |
| `spirv` | `spv` | SPIR-V (Vulkan) | `.spv` | One, with every stage inside |
| `glsl` | | GLSL (OpenGL) | `.glsl` | One per stage |
| `gles` | `glsles` | GLSL ES (mobile and web) | `.gles` | One per stage |
| `hlsl` | | HLSL (DirectX) | `.hlsl` | One per stage |
| `msl` | `metal` | Metal Shading Language | `.msl` | One per stage |
| `wgsl` | | WGSL (WebGPU) | `.wgsl` | One, with every stage inside |
| `cpp` | | C++ | `.cpp` | One per stage |
| `monogame` | `mgfx` | MonoGame effect (plugin) | `.mgfx` | One per platform |
| `kni` | `kni-webgl` | KNI effect (plugin) | `.knifx` | One |
| `fna` | | FNA effect (plugin) | `.fxb` | One |
| `godot` | `gdshader` | Godot shader (plugin) | `.gdshader` | One per type |

A name that is not in the table is taken as a plugin name. If no plugin has that name, the CLI reports that it does not exist and lists the ones that do.

## Language versions

Add a colon and a version to a target to choose the version of the language it writes. Without a version, the target uses its default.

| Target | Versions | Default |
| --- | --- | --- |
| `spirv` | `1.3` (Vulkan 1.1), `1.4`, `1.5` (Vulkan 1.2), `1.6` (Vulkan 1.3) | `1.6` |
| `glsl` | `110`, `120`, `130`, `140`, `150`, `330`, `400`, `410`, `420`, `430`, `440`, `450`, `460`; also written as `4.3` | `450` |
| `gles` | `100`, `300`, `310`, `320`; also written as `3.0` | `310` |
| `msl` | `1.0` to `4.x`, as `major.minor` or `major.minor.patch` (`2.4`, `3.1`) | `1.2` |
| `hlsl` | Shader model `3.0`, `4.0`, `4.1`, `5.0`, `5.1`, `6.0` to `6.8`; also written as `50`, `60` | `5.0` |

`wgsl`, `cpp` and the plugin targets take no version.

```bash
yotsuba compile MyShaders/MyShaders.csproj --target spirv:1.3 --target glsl:410 --target gles:300
```

- A version that is not in the table stops the command with code `2` and lists the ones that are:

  ```text
  SPIR-V '1.2' no está soportado. Versiones: 1.3 (Vulkan 1.1), 1.4, 1.5 (Vulkan 1.2) y 1.6 (Vulkan 1.3).
  ```

- SPIR-V is always compiled as 1.6. For `1.3` to `1.5` the module is rewritten for older drivers, and the copies of structs between a buffer and a variable (an instruction of 1.4) are written with instructions of 1.0. If the shader uses something else that does not exist in the version you asked for, that file fails with the reason.
- MSL keeps 1.2 unless you ask for another version. A shader that needs something newer (`PrimitiveId` needs 2.2, for example) fails with the reason until you ask for that version.
- GLSL ES `300` has no compute shaders: a compute stage fails and the other stages are written.
- You can ask for several versions of one target in the same command; the version then goes into the file name (see below). Asking for one target with and without a version is an error (code `2`).

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
- SPIR-V writes `<Class>.spv`, and WGSL writes `<Class>.wgsl`, with every stage in one file.
- With several versions of one target, the version goes before the extension:

  ```bash
  yotsuba compile MyShaders/MyShaders.csproj --target glsl:330 --target glsl:430 --output out
  ```

  ```text
  MyShaders/out/MyShaders/
  ├── Plasma.Fragment.330.glsl
  ├── Plasma.Fragment.430.glsl
  ├── Plasma.Vertex.330.glsl
  └── Plasma.Vertex.430.glsl
  ```

- A plugin with options writes one file per option, with the option in lower case before the extension: `Gradient.desktopgl.mgfx`, `Gradient.spatial.gdshader`. A plugin without options writes `<Class><extension>`.

## Exit codes and errors

| Code | When |
| --- | --- |
| `0` | Everything was written. |
| `1` | The project has C# errors, or a file or a plugin failed. The other files are still written. The message names the class, the stage and the target that failed. |
| `2` | The arguments are wrong: no `--target`, no project, a project that does not exist, a version that does not exist, an unknown option, a second project or an unknown command. |

A file that fails names its class, stage and target, with the reason:

```text
MyShaders.Plasma.Vertex (gles): FP64 not supported in ES profile.
```

That file is not written, and if an earlier run had written it, it is deleted: the output folder never keeps an old version next to the new ones.

The CLI prints its messages in Spanish. The full list of messages is in the [Get Started chapter about the CLI](../get-started/cli.md).

## Examples

All the text formats at once:

```bash
yotsuba compile Game.Graphics/Game.Graphics.csproj \
  --target glsl --target gles --target hlsl --target msl \
  --output build/shaders
```

Each graphics API in the version it reads (Vulkan 1.1, macOS OpenGL, WebGL 2 and WebGPU):

```bash
yotsuba compile Game.Graphics/Game.Graphics.csproj \
  --target spirv:1.3 --target glsl:410 --target gles:300 --target wgsl \
  --output build/shaders
```

SPIR-V plus the Godot shaders, as part of a build script:

```bash
yotsuba compile Shaders/Shaders.csproj --target spirv --target godot --output ../Game/shaders
```

When the program that uses the shaders is written in C#, [`add`](add.md) is usually a better fit: it leaves the result inside the project as methods, and the C# compiler checks the names for you.

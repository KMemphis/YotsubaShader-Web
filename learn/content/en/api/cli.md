---
title: CLI commands
summary: Every command of the yotsuba tool and what it does.
order: 6
---

Every command of the `yotsuba` tool (the `YotsubaShader.Compiler.CLI` package) and what it does. For every option, target and exit code of a command, follow the link at the end of each entry.

```bash
dotnet new tool-manifest
dotnet tool install YotsubaShader.Compiler.CLI
```

Installed as a local tool, every command starts with `dotnet yotsuba`. Installed globally (`dotnet tool install --global YotsubaShader.Compiler.CLI`), or with the stand-alone executable of a release, it starts with `yotsuba`.

## compile

```text
yotsuba compile <project.csproj> --target <target>[:<version>] [--target <target>[:<version>] ...] [--output <folder>]
```

Compiles the C# project, finds every class with `[ShaderStage]` methods and writes each shader as files in a folder: one file per stage for the text formats, one `.spv` per shader for SPIR-V, one `.wgsl` per shader for WGSL, and the engine files for plugin targets. The folder is `artifacts` next to the `.csproj` unless `--output` says otherwise.

| `--target` | Writes | Versions (default) |
| --- | --- | --- |
| `spirv` (`spv`) | `<Class>.spv` | `1.3` to `1.6` (`1.6`) |
| `glsl` | `<Class>.<Stage>.glsl` | `110` to `460` (`450`) |
| `gles` (`glsles`) | `<Class>.<Stage>.gles` | `100`, `300`, `310`, `320` (`310`) |
| `hlsl` | `<Class>.<Stage>.hlsl` | shader model `3.0` to `6.8` (`5.0`) |
| `msl` (`metal`) | `<Class>.<Stage>.msl` | `1.0` to `4.x` (`1.2`) |
| `wgsl` | `<Class>.wgsl` | none |
| `cpp` | `<Class>.<Stage>.cpp` | none |
| `monogame`, `kni`, `fna`, `godot` | the engine files (plugins) | none |

The version goes after a colon: `--target glsl:430`. A file that a language cannot express (for example `double` in GLSL ES) is reported with its class, stage and target; the other files are written and the exit code is `1`.

```bash
dotnet yotsuba compile MyShaders/MyShaders.csproj --target spirv --target glsl:430 --target wgsl --output out
```

Details: [The compile command](../reference/compile.md) and [Language versions](../reference/compile.md#language-versions).

## add

```text
yotsuba add <project.csproj> --target <target>[:<version>] [--target <target>[:<version>] ...]
```

Compiles the C# project and writes `YotsubaShader.g.cs` next to the `.csproj`. The file adds extension methods to every shader class, so the program gets the result from C#: `ToSpirV()`, `ToGlsl(stage)`, `ToGlslEs(stage)`, `ToHlsl(stage)`, `ToMSL(stage)`, `ToWgsl()` with `--target wgsl`, and the method of each plugin target, such as `ToMGFX(platform)` or `ToGodotShader(type)`. A version in `--target` (`gles:300`) is the version that method returns. The file is rewritten only when its content changes, and an old `YotsubaShader.g.cs` that no longer compiles (a renamed shader class) does not stop it.

```bash
dotnet yotsuba add MyShaders/MyShaders.csproj --target spirv --target monogame
```

Details: [The add command](../reference/add.md).

## plugin list

```text
yotsuba plugin list
```

Prints the plugins of the catalog, whether each one is installed and in which version.

## plugin install

```text
yotsuba plugin install <name>
```

Downloads a plugin (`monogame`, `kni`, `fna`, `godot`) before a command needs it, in the newest version compatible with the CLI: the same major and minor version, never a newer one. A `--target` of a missing plugin installs it on its own, so this command is optional.

```bash
dotnet yotsuba plugin install godot
```

## plugin update

```text
yotsuba plugin update [name]
```

With a name, fetches the newest version of that plugin that is compatible with the CLI. Without a name, updates every installed plugin.

## plugin remove

```text
yotsuba plugin remove <name>
```

Deletes an installed plugin.

Details of the four plugin commands: [Plugins](../reference/plugins.md).

## lsp

```text
yotsuba lsp <project.csproj>
```

Starts a language server over standard input and output for an editor. It opens the project with Roslyn and, while you type, publishes the C# errors and the diagnostics of the Yotsuba Shader analyzers (`YS....`). It also answers completion, hover and code actions. The editor starts it; you do not run it by hand.

## version

```text
yotsuba --version
```

Prints the version of the CLI, for example `0.9.0`. The plugins it installs have the same major and minor version.

## help

```text
yotsuba --help
yotsuba compile --help
yotsuba add --help
```

Prints the usage of every command and the list of targets. `-h` and `help` do the same.

## Environment variables

| Variable | What it does |
| --- | --- |
| `YOTSUBA_HOME` | Folder for the plugins and the copy of the catalog. Default: `~/.yotsuba`. |
| `YOTSUBA_PLUGINS_URL` | Catalog of plugins, as a URL or a file path. |
| `YOTSUBA_NUGET_SOURCE` | NuGet feed (v3 flat container) the plugins are downloaded from. |
| `YOTSUBA_NAGA_PATH` | Native library of naga for `--target wgsl`, when it is not next to the CLI. |
| `YOTSUBA_DEBUG` | Set to `1` to print the full stack of an internal error and every MSBuild warning. |

> [!NOTE]
> The CLI prints its messages in Spanish. The message list is in the [Get Started chapter about the CLI](../get-started/cli.md).

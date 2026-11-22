---
title: Compile in your build
summary: Run the compiler from CI or from your engine's content pipeline.
order: 1
---

Use the CLI from a build step. It reads the C# project, compiles every shader class and writes plain files that any engine can load.

```bash
yotsuba compile Game.Shaders.csproj \
  --target spirv --target glsl --target hlsl --target msl \
  --output shaders
```

For a class `Sweep` with a vertex and a fragment method, in the namespace `MyShaders`, this writes:

```text
shaders/MyShaders/
├── Sweep.spv
├── Sweep.Vertex.glsl
├── Sweep.Fragment.glsl
├── Sweep.Vertex.hlsl
├── Sweep.Fragment.hlsl
├── Sweep.Vertex.msl
└── Sweep.Fragment.msl
```

SPIR-V is one file with every stage inside. The text formats are one file per stage.

## Choosing targets

| Your renderer uses | Ask for | Notes |
| --- | --- | --- |
| Vulkan, WebGPU through SPIR-V tools | `spirv` | One `.spv` per shader class. |
| OpenGL 4.5 | `glsl` | `#version 450`, written with Vulkan semantics (`set` and `binding`). |
| OpenGL ES, WebGL | `gles` | Same layout as `glsl`, for ES. |
| Direct3D 11 | `hlsl` | Shader model 5.0. |
| Metal | `msl` | |
| A software renderer | `cpp` | C++ per stage. |

The output folder is counted from the folder of the `.csproj`. The folders follow the namespace of your classes.

## In a build pipeline

Run the command after the C# project builds and before your content step copies files. The exit code is `0` when everything was written and `1` when the project has C# errors, so a CI job fails on its own. The full list of options is in [The compile command](../reference/compile.md).

```bash
dotnet tool install --global YotsubaShader.Compiler.CLI
yotsuba compile Game.Shaders.csproj --target spirv --output Content/shaders
```

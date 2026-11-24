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
| Vulkan | `spirv` | One `.spv` per shader class. SPIR-V 1.6 (Vulkan 1.3); `spirv:1.3` for Vulkan 1.1 and `spirv:1.5` for Vulkan 1.2. |
| WebGPU | `wgsl` | One `.wgsl` per shader class, with every stage inside. |
| OpenGL | `glsl` | `#version 450`, with `binding` and no descriptor sets. `glsl:410` for macOS, `glsl:330` for OpenGL 3.3. |
| OpenGL ES | `gles` | `#version 310 es`. `gles:320` for ES 3.2. |
| WebGL 2 | `gles:300` | `#version 300 es`, without `binding`. |
| Direct3D 11 and 12 | `hlsl` | Shader model 5.0. `hlsl:6.0` (up to `6.8`) for shader model 6. |
| Metal | `msl` | MSL 1.2. `msl:2.4`, `msl:3.1`... when the shader needs a newer version. |
| A software renderer | `cpp` | C++ per stage. |

The number after the colon is the version of the output language, and every target has a default. The accepted versions are in [The compile command](../reference/compile.md#language-versions).

The output folder is counted from the folder of the `.csproj`. The folders follow the namespace of your classes.

## In a build pipeline

Run the command after the C# project builds and before your content step copies files. The exit code is `0` when everything was written and `1` when the project has C# errors, so a CI job fails on its own. The full list of options is in [The compile command](../reference/compile.md).

```bash
dotnet tool install --global YotsubaShader.Compiler.CLI
yotsuba compile Game.Shaders.csproj --target spirv --output Content/shaders
```

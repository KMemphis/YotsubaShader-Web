---
title: "Diagnostics"
summary: "Every error and warning of the analyzer, by validation target: what each graphics API rejects and why."
order: 10
---

The analyzer checks your shader **while you type**, in the editor and in the build, with the same rules the compiler uses: a shader without errors compiles. Each diagnostic has an id (`YS` and four digits), a severity and a message.

- **Error**: the shader would not compile for the GPU, or a graphics API you declared with `[ShaderTargets]` does not have what the shader uses.
- **Warning**: it compiles, but something is not guaranteed everywhere (an optional feature, a hardware limit, a value that is undefined on some GPUs).

To choose the graphics APIs a shader is checked against, see [Graphics APIs and engines](targets.md).

## By validation target

What a graphics API accepts depends on the target you declare. One page per API, with a table of every version and the exact message each one gives:

- [Validating for Vulkan](validate-vulkan.md)
- [Validating for OpenGL](validate-opengl.md)
- [Validating for OpenGL ES](validate-opengles.md)
- [Validating for Direct3D](validate-direct3d.md)
- [Validating for Metal](validate-metal.md)
- [Validating for WebGPU](validate-webgpu.md)

## All the diagnostics, by area

Every id with its message and a shader that triggers it. Most apply to every shader, whatever `[ShaderTargets]` says; portability is the one that depends on it:

- [Types and vectors](diagnostics-types.md): Errors about the types a shader can use and how vectors are declared.
- [Entry points](diagnostics-entry-points.md): Errors about the methods marked with [ShaderStage]: shape, stage and compute group size.
- [Stage interface](diagnostics-interface.md): Errors about the inputs and outputs of each stage: built-ins, locations and semantics.
- [Resources](diagnostics-resources.md): Errors about textures, samplers and buffers: bindings and memory layout.
- [Methods](diagnostics-methods.md): Errors about the helper functions that are compiled for the GPU.
- [C# without a translation](diagnostics-csharp.md): Errors about C# constructs that do not exist on the GPU.
- [Use per stage](diagnostics-stages.md): Errors about operations that exist in one stage only.
- [Portability](diagnostics-portability.md): Diagnostics about what only some graphics APIs have. The pages of each validation target show them version by version.


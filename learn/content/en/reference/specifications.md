---
title: Specifications
summary: The official specifications behind each syntax and graphics API: SPIR-V, WGSL, HLSL, GLSL, Vulkan and Metal.
order: 31
---

When a shader does something you did not expect, the answer is in the specification of the language or the graphics API. These are the ones Yotsuba Shader builds on.

## Languages

- [SPIR-V specification](https://registry.khronos.org/SPIR-V/): the Khronos binary intermediate language that Yotsuba Shader emits.
- [WGSL specification](https://www.w3.org/TR/WGSL/): the WebGPU Shading Language, from the W3C.
- [HLSL reference](https://learn.microsoft.com/windows/win32/direct3dhlsl/dx-graphics-hlsl): Microsoft documentation for the High-Level Shader Language.
- [GLSL specification](https://registry.khronos.org/OpenGL/specs/gl/GLSLangSpec.4.60.pdf): the OpenGL Shading Language specification from Khronos.

## Graphics APIs

- [Vulkan](https://www.vulkan.org/): the Khronos graphics API that consumes SPIR-V directly.
- [Metal](https://developer.apple.com/metal/): Apple's graphics and compute framework, and its shading language.

## Where each one shows up here

The vocabulary of every language is a syntax of Yotsuba Shader: [HLSL](hlsl.md), [GLSL](glsl.md), [MSL](msl.md), [SPIR-V](spirv.md) and [WGSL](wgsl.md). The graphics APIs are the ones you can declare with `[ShaderTargets]`, see [Graphics APIs and engines](targets.md).

```csharp
using YotsubaShader.Compiler.Metadata;

[ShaderTargets(Target.Vulkan_13 | Target.Metal_3 | Target.WebGpu)]
public class Example { /* ... */ }
```

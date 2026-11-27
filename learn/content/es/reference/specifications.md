---
title: Especificaciones
summary: Las especificaciones oficiales detrás de cada sintaxis y API gráfica: SPIR-V, WGSL, HLSL, GLSL, Vulkan y Metal.
order: 31
---

Cuando un shader hace algo que no esperabas, la respuesta está en la especificación del lenguaje o de la API gráfica. Estas son las que usa Yotsuba Shader.

## Lenguajes

- [Especificación de SPIR-V](https://registry.khronos.org/SPIR-V/): el lenguaje intermedio binario de Khronos que emite Yotsuba Shader.
- [Especificación de WGSL](https://www.w3.org/TR/WGSL/): el WebGPU Shading Language, del W3C.
- [Referencia de HLSL](https://learn.microsoft.com/windows/win32/direct3dhlsl/dx-graphics-hlsl): documentación de Microsoft sobre el High-Level Shader Language.
- [Especificación de GLSL](https://registry.khronos.org/OpenGL/specs/gl/GLSLangSpec.4.60.pdf): la especificación del OpenGL Shading Language, de Khronos.

## APIs gráficas

- [Vulkan](https://www.vulkan.org/): la API gráfica de Khronos que consume SPIR-V directamente.
- [Metal](https://developer.apple.com/metal/): el framework gráfico y de cómputo de Apple, y su lenguaje de shaders.

## Dónde aparece cada una aquí

El vocabulario de cada lenguaje es una sintaxis de Yotsuba Shader: [HLSL](hlsl.md), [GLSL](glsl.md), [MSL](msl.md), [SPIR-V](spirv.md) y [WGSL](wgsl.md). Las APIs gráficas son las que puedes declarar con `[ShaderTargets]`, mira [APIs gráficas y engines](targets.md).

```csharp
using YotsubaShader.Compiler.Metadata;

[ShaderTargets(Target.Vulkan_13 | Target.Metal_3 | Target.WebGpu)]
public class Example { /* ... */ }
```

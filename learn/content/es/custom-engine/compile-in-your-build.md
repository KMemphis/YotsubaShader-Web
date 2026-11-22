---
title: Compilar en tu build
summary: Ejecuta el compilador desde CI o desde el pipeline de contenido de tu motor.
order: 1
---

Usa la CLI en un paso del build. Lee el proyecto de C#, compila cada clase de shader y escribe archivos simples que cualquier motor puede cargar.

```bash
yotsuba compile Game.Shaders.csproj \
  --target spirv --target glsl --target hlsl --target msl \
  --output shaders
```

Para una clase `Sweep` con un método vertex y uno fragment, en el namespace `MyShaders`, escribe:

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

SPIR-V es un solo archivo con todos los stages dentro. Los formatos de texto son un archivo por stage.

## Elegir targets

| Tu renderer usa | Pide | Notas |
| --- | --- | --- |
| Vulkan, WebGPU con herramientas SPIR-V | `spirv` | Un `.spv` por clase de shader. |
| OpenGL 4.5 | `glsl` | `#version 450`, escrito con semántica Vulkan (`set` y `binding`). |
| OpenGL ES, WebGL | `gles` | Mismo layout que `glsl`, para ES. |
| Direct3D 11 | `hlsl` | Shader model 5.0. |
| Metal | `msl` | |
| Un renderer por software | `cpp` | C++ por stage. |

La carpeta de salida se cuenta desde la carpeta del `.csproj`. Las carpetas siguen el namespace de tus clases.

## En un pipeline de build

Ejecuta el comando después de compilar el proyecto de C# y antes de que tu paso de contenido copie archivos. El código de salida es `0` si todo se escribió y `1` si el proyecto tiene errores de C#, así que un job de CI falla solo. La lista completa de opciones está en [El comando compile](../reference/compile.md).

```bash
dotnet tool install --global YotsubaShader.Compiler.CLI
yotsuba compile Game.Shaders.csproj --target spirv --output Content/shaders
```

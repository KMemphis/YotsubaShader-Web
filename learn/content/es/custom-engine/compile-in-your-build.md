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
| Vulkan | `spirv` | Un `.spv` por clase de shader. SPIR-V 1.6 (Vulkan 1.3); `spirv:1.3` para Vulkan 1.1 y `spirv:1.5` para Vulkan 1.2. |
| WebGPU | `wgsl` | Un `.wgsl` por clase de shader, con todos los stages dentro. |
| OpenGL | `glsl` | `#version 450`, con `binding` y sin descriptor sets. `glsl:410` para macOS, `glsl:330` para OpenGL 3.3. |
| OpenGL ES | `gles` | `#version 310 es`. `gles:320` para ES 3.2. |
| WebGL 2 | `gles:300` | `#version 300 es`, sin `binding`. |
| Direct3D 11 y 12 | `hlsl` | Shader model 5.0. `hlsl:6.0` (hasta `6.8`) para shader model 6. |
| Metal | `msl` | MSL 1.2. `msl:2.4`, `msl:3.1`... cuando el shader necesita una versión más nueva. |
| Un renderer por software | `cpp` | C++ por stage. |

El número después de los dos puntos es la versión del lenguaje de salida, y cada target tiene una por defecto. Las versiones aceptadas están en [El comando compile](../reference/compile.md#versiones-del-lenguaje).

La carpeta de salida se cuenta desde la carpeta del `.csproj`. Las carpetas siguen el namespace de tus clases.

## En un pipeline de build

Ejecuta el comando después de compilar el proyecto de C# y antes de que tu paso de contenido copie archivos. El código de salida es `0` si todo se escribió y `1` si el proyecto tiene errores de C#, así que un job de CI falla solo. La lista completa de opciones está en [El comando compile](../reference/compile.md).

```bash
dotnet tool install --global YotsubaShader.Compiler.CLI
yotsuba compile Game.Shaders.csproj --target spirv --output Content/shaders
```

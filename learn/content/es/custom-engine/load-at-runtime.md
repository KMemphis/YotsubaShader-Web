---
title: Cargar en ejecución
summary: Lleva el shader compilado a tu renderer, desde un archivo o desde C#.
order: 3
---

Hay dos formas de entregar el shader a tu renderer. Elige la que encaje con cómo tu motor carga el contenido.

## Desde archivos

Distribuye los archivos que escribió `compile` y léelos con tu propio cargador de assets. SPIR-V es binario; los demás formatos son texto UTF-8:

```csharp
byte[] spirv = File.ReadAllBytes("shaders/MyShaders/Sweep.spv");
string hlslVertex = File.ReadAllText("shaders/MyShaders/Sweep.Vertex.hlsl");
string hlslFragment = File.ReadAllText("shaders/MyShaders/Sweep.Fragment.hlsl");
```

Pasa los bytes a `vkCreateShaderModule`, el texto a tu compilador de HLSL, GLSL o Metal, y usa los nombres de punto de entrada de [Enlazar recursos](binding-resources.md) (`Vertex`, `Fragment`).

## Desde código C#

Si el renderer está escrito en C#, `add` incrusta los shaders compilados en el proyecto como métodos. No se lee nada del disco en ejecución.

```bash
yotsuba add Game.Shaders.csproj --target spirv
```

```csharp
using Examples.Shaders;
using YotsubaShader;
using YotsubaShader.Language;

var shader = new Sweep();

byte[] spirv = shader.ToSpirV();
string vertex = shader.ToHlsl(Stage.Vertex);
string fragment = shader.ToHlsl(Stage.Fragment);
```

Los métodos son `ToSpirV()`, `ToGlsl(Stage)`, `ToGlslEs(Stage)`, `ToHlsl(Stage)` y `ToMSL(Stage)`, y también `ToWgsl()` cuando pides `--target wgsl`. Están listados en [El comando add](../reference/add.md).

## Orden de trabajo en el renderer

1. Crea el layout de vértices a partir de los campos `[location]` del struct de entrada del vertex.
2. Crea el buffer uniforme con los bytes del struct `[uniform]` y enlázalo en su `set` y `binding`.
3. Crea cada textura y sampler y enlázalos en sus números.
4. Crea el pipeline con los shaders vertex y fragment.
5. En cada frame, escribe los valores nuevos en el buffer uniforme antes de dibujar.

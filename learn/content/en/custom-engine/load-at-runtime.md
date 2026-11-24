---
title: Load at run time
summary: Get the compiled shader into your renderer, from a file or from C#.
order: 3
---

There are two ways to hand the shader to your renderer. Pick the one that fits how your engine loads content.

## From files

Ship the files that `compile` wrote and read them with your own asset loader. SPIR-V is binary, the other formats are UTF-8 text:

```csharp
byte[] spirv = File.ReadAllBytes("shaders/MyShaders/Sweep.spv");
string hlslVertex = File.ReadAllText("shaders/MyShaders/Sweep.Vertex.hlsl");
string hlslFragment = File.ReadAllText("shaders/MyShaders/Sweep.Fragment.hlsl");
```

Pass the bytes to `vkCreateShaderModule`, the text to your HLSL, GLSL or Metal compiler, and use the entry-point names from [Binding resources](binding-resources.md) (`Vertex`, `Fragment`).

## From C# code

If the renderer is written in C#, `add` embeds the compiled shaders in the project as methods. Nothing is read from disk at run time.

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

The methods are `ToSpirV()`, `ToGlsl(Stage)`, `ToGlslEs(Stage)`, `ToHlsl(Stage)` and `ToMSL(Stage)`, plus `ToWgsl()` when you ask for `--target wgsl`. They are listed in [The add command](../reference/add.md).

## Order of work in the renderer

1. Create the vertex layout from the `[location]` fields of the vertex input struct.
2. Create the uniform buffer with the bytes of the `[uniform]` struct, and bind it at its `set` and `binding`.
3. Create each texture and sampler and bind them at their numbers.
4. Create the pipeline with the vertex and fragment shaders.
5. On every frame, write the new values into the uniform buffer before the draw call.

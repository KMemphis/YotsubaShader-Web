---
title: Implement in your own engine
summary: Embed the compiler and the runtime contract in an engine you control.
order: 0
---

If you own the engine, you decide how shaders reach the GPU. Yotsuba Shader gives you the compiled shader in the format your graphics API reads, and a fixed contract that says which slot every input, output and resource takes. You write the loader once.

## Integration map

| Piece | What you do | Chapter |
| --- | --- | --- |
| Compiler | Turn the C# shaders into SPIR-V, GLSL, GLSL ES, HLSL, MSL, WGSL or C++ files | [Compile in your build](compile-in-your-build.md) |
| Interface contract | Create vertex layouts, uniform buffers and textures in the slots the shader expects | [Binding resources](binding-resources.md) |
| Runtime | Get the compiled shader into your renderer, from a file or from C# | [Load at run time](load-at-runtime.md) |

## The short version

1. Write the shader in C# in a project of its own.
2. Run `yotsuba compile` in your build, once per target your renderer needs.
3. In the renderer, create the pipeline with the vertex locations and the `set`/`binding` numbers the shader declares.
4. Load the file (or call the generated method) and hand it to the graphics API.

```bash
yotsuba compile Game.Shaders.csproj --target spirv --target hlsl --output shaders
```

---
title: Implement in your own engine
summary: Embed the compiler and the runtime contract in an engine you control.
order: 0
---

If you own the engine, you control the whole pipeline: build time, resource binding and runtime. This section explains the pieces you integrate.

## Integration map

| Piece | Responsibility | Chapter |
| --- | --- | --- |
| Compiler | Turns C# shaders into the backend format | [Compile in your build](compile-in-your-build.md) |
| Interface contract | Inputs, outputs, resources, bindings | [Binding resources](binding-resources.md) |
| Runtime | Loads the compiled output for your graphics API | [Binding resources](binding-resources.md) |

> [!IMPORTANT]
> This is an example chapter. Replace it with the real integration steps.

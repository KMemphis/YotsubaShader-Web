---
title: Documentation
summary: The five syntaxes and the three commands of the compiler.
order: 0
---

Reference material for when you know what you are looking for. For a guided path, use [Get Started](../get-started/index.md).

## Syntaxes

A syntax is the vocabulary of attributes you write shaders with. There are five, each inspired by a shading language. The one you pick does not decide the output: the same shader compiles to any target.

- [HLSL syntax](hlsl.md): `SV_Position`, `numthreads`, `cbuffer` and `register`.
- [GLSL syntax](glsl.md): `gl_*` built-ins, `layout(set, binding)`, `uniform` and `buffer`.
- [MSL syntax](msl.md): `position`, `vertex_id` and `thread_position_in_grid`, with `buffer(n)`, `texture(n)` and `sampler(n)`.
- [SPIR-V syntax](spirv.md): `BuiltIn_Position`, `DescriptorSet` and `Binding`.
- [WGSL syntax](wgsl.md): `@builtin(...)`, `@group` and `@binding`.

## The compiler

- [The compile command](compile.md): shaders as separate files, one per format and stage.
- [The add command](add.md): shaders as C# methods inside your project.
- [Plugins](plugins.md): install, update and use the plugins for MonoGame, KNI, FNA and Godot.

For the engines, each one has its own reference page in [Engines](../engines/index.md).

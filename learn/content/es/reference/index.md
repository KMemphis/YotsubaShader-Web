---
title: Documentación
summary: Las cinco sintaxis y los tres comandos del compilador.
order: 0
---

Material de referencia para cuando ya sabes lo que buscas. Para un camino guiado, usa [Get Started](../get-started/index.md).

## Sintaxis

Una sintaxis es el vocabulario de atributos con el que escribes shaders. Hay cinco, cada una inspirada en un lenguaje de shaders. La que elijas no decide el resultado: el mismo shader compila a cualquier destino.

- [Sintaxis HLSL](hlsl.md): `SV_Position`, `numthreads`, `cbuffer` y `register`.
- [Sintaxis GLSL](glsl.md): valores `gl_*`, `layout(set, binding)`, `uniform` y `buffer`.
- [Sintaxis MSL](msl.md): `position`, `vertex_id` y `thread_position_in_grid`, con `buffer(n)`, `texture(n)` y `sampler(n)`.
- [Sintaxis SPIR-V](spirv.md): `BuiltIn_Position`, `DescriptorSet` y `Binding`.
- [Sintaxis WGSL](wgsl.md): `@builtin(...)`, `@group` y `@binding`.

## El compilador

- [El comando compile](compile.md): shaders como archivos separados, uno por formato y etapa.
- [El comando add](add.md): shaders como métodos de C# dentro de tu proyecto.
- [Plugins](plugins.md): instala, actualiza y usa los plugins de MonoGame, KNI, FNA y Godot.

Cada engine tiene su propia página de referencia en [Engines](../engines/index.md).

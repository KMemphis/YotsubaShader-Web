---
title: Referencia de la API
summary: La API de los cinco paquetes de sintaxis, los comandos de la CLI y la librería del compilador.
order: 0
---

La API pública de Yotsuba Shader, entrada por entrada: cada declaración tal como la escriben los paquetes, con un ejemplo en C#. Para explicaciones y recorridos guiados, usa la [Documentación](../reference/index.md) y [Get Started](../get-started/index.md).

## Sintaxis

Los atributos y tipos de cada paquete de sintaxis. Las cinco compilan a los mismos destinos; cada entrada enlaza al mismo concepto en las otras cuatro.

```buttons
[HLSL](hlsl.md)
[GLSL](glsl.md)
[MSL](msl.md)
[SPIR-V](spirv.md)
[WGSL](wgsl.md)
```

- [API de la sintaxis HLSL](hlsl.md): `YotsubaShader.HlslSyntax`.
- [API de la sintaxis GLSL](glsl.md): `YotsubaShader.GlslSyntax`.
- [API de la sintaxis MSL](msl.md): `YotsubaShader.MslSyntax`.
- [API de la sintaxis SPIR-V](spirv.md): `YotsubaShader.SpirvSyntax`.
- [API de la sintaxis WGSL](wgsl.md): `YotsubaShader.WgslSyntax`.

## CLI

- [Comandos de la CLI](cli.md): `compile`, `add`, `plugin list | install | update | remove`, `lsp`, `--version` y `--help`, y lo que hace cada uno.

## Compilador

- [Librería del compilador](compiler.md): `YotsubaShader.Compiler.Library`. `CSharpToSpirvCompiler.Compile`, `CompiledCode`, `ShaderReflection` e `IShaderTargetBackend`.

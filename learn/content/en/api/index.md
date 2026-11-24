---
title: API Reference
summary: The API of the five syntax packages, the commands of the CLI and the compiler library.
order: 0
---

The public API of Yotsuba Shader, entry by entry: every declaration as the packages write it, with an example in C#. For explanations and guided paths, use the [Documentation](../reference/index.md) and [Get Started](../get-started/index.md).

## Syntaxes

The attributes and types of each syntax package. All five compile to the same targets; each entry links to the same concept in the other four.

```buttons
[HLSL](hlsl.md)
[GLSL](glsl.md)
[MSL](msl.md)
[SPIR-V](spirv.md)
[WGSL](wgsl.md)
```

- [HLSL syntax API](hlsl.md): `YotsubaShader.HlslSyntax`.
- [GLSL syntax API](glsl.md): `YotsubaShader.GlslSyntax`.
- [MSL syntax API](msl.md): `YotsubaShader.MslSyntax`.
- [SPIR-V syntax API](spirv.md): `YotsubaShader.SpirvSyntax`.
- [WGSL syntax API](wgsl.md): `YotsubaShader.WgslSyntax`.

## Metadata

- [Metadata attributes](metadata.md): `[ShaderTargets]`, `[ShaderEngines]`, `Target` and `GameEngine`.

## CLI

- [CLI commands](cli.md): `compile`, `add`, `plugin list | install | update | remove`, `lsp`, `--version` and `--help`, and what each one does.

## Compiler

- [Compiler library](compiler.md): `YotsubaShader.Compiler.Library`. `CSharpToSpirvCompiler.Compile`, `CompiledCode`, `ShaderReflection` and `IShaderTargetBackend`.

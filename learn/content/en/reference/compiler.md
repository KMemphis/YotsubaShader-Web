---
title: Compiler
summary: The CLI, the library and the supported targets.
order: 2
---

## CLI

```bash
dotnet yotsuba compile Game.Graphics.csproj \
  --target spirv \
  --output artifacts/
```

## Targets

| Target | Status |
| --- | --- |
| SPIR-V | Supported |
| HLSL | Supported |
| GLSL / GLSL ES | Supported |
| Metal (MSL) | Supported |
| C++ | Supported |
| WGSL output | Planned |

The compiler path covers the `Vertex`, `Fragment` and `Compute` stages and the supported subset of shader-body operations.

---
title: Compilador
summary: La CLI, la biblioteca y los destinos admitidos.
order: 2
---

## CLI

```bash
dotnet yotsuba compile Game.Graphics.csproj \
  --target spirv \
  --output artifacts/
```

## Destinos

| Destino | Estado |
| --- | --- |
| SPIR-V | Admitido |
| HLSL | Admitido |
| GLSL / GLSL ES | Admitido |
| Metal (MSL) | Admitido |
| C++ | Admitido |
| Salida WGSL | Planificado |

La ruta actual del compilador cubre las etapas `Vertex`, `Fragment` y `Compute` y el subconjunto admitido de operaciones del cuerpo del shader.

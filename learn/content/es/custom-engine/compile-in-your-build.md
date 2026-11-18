---
title: Compilar en tu build
summary: Ejecuta el compilador desde CI o desde el pipeline de contenido de tu motor.
order: 1
---

Usa la CLI en un paso de compilación, o referencia la biblioteca del compilador desde tu herramienta de contenido.

```bash
dotnet yotsuba compile Game.Graphics.csproj \
  --target spirv \
  --output artifacts/
```

## Elegir destinos

Elige los destinos que consume tu renderer. SPIR-V encaja con pipelines tipo Vulkan; HLSL, GLSL, GLSL ES y Metal cubren los lenguajes nativos.

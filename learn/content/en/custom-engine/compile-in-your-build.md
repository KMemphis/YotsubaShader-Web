---
title: Compile in your build
summary: Run the compiler from CI or from your engine's content pipeline.
order: 1
---

Use the CLI from a build step, or reference the compiler library from your content tool.

```bash
dotnet yotsuba compile Game.Graphics.csproj \
  --target spirv \
  --output artifacts/
```

## Choosing targets

Pick the targets your renderer consumes. SPIR-V suits Vulkan-style pipelines; HLSL, GLSL, GLSL ES and Metal cover the native shading languages.

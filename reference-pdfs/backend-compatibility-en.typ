// Backend compatibility: English edition. Run ./build.sh (see README.md).
#import "template.typ": *

#show: refdoc.with(
  lang: "en",
  title: "Backend compatibility",
  subtitle: "Which graphics backends support each concept of the language, verified with their shader toolchains",
  edition: "Edition 1.0 · October 2026 · Data: tools/compat/compat.json of the website repository",
)

A shader written with Yotsuba Shader is compiled to SPIR-V and translated to the format of each graphics backend. Not every backend can express every concept: WebGPU has no render target layer, WebGL 2 has no compute stage, Metal has no 64-bit floats. This document lists, concept by concept, what each backend supports. It is the rule set that the IDE uses to warn you while you write a shader.

= How to read it

#ref-table(columns: (0.9fr, 4fr), header: ("Status", "Meaning"),
  [#pill("Yes", ok-color)], [The concept works. At least one translator produced output that the backend's own compiler accepts, without extensions.],
  [#pill("Extension", ext-color)], [It works only with an extension or an optional feature, named in the details. The IDE reports a warning.],
  [#pill("Lost", bad-color)], [The output compiles, but the translator silently removed the concept. Treated as unsupported.],
  [#pill("Invalid", bad-color)], [The translator produced output, but the backend's compiler rejects it.],
  [#pill("No", bad-color)], [No translator can express the concept for this backend.],
  [#pill("No stage", na-color)], [The backend has no such shader stage (for example, compute on WebGL 2).],
)

#include "generated/compat-en.typ"

= How it was measured

Each concept is a small shader. HLSL shaders are compiled to SPIR-V with DXC, and the concepts HLSL cannot spell are written in Vulkan GLSL and compiled with glslang. Every SPIR-V module is validated with `spirv-val` (Vulkan 1.2) and then translated by two independent translators, *naga* and *SPIRV-Cross*, to HLSL (Shader Model 6), MSL, WGSL, GLSL 4.50 and GLSL ES 3.00. Each output is compiled by the backend's own tool: DXC for Direct3D 12, Apple's `metal` compiler for Metal, glslang for OpenGL and WebGL 2, and naga for WGSL. A concept is supported when at least one translator produces output that compiles.

Limits: Direct3D 11 (FXC, Shader Model 5) was not validated; no shader was run on a real device; results depend on the tool versions listed above. To regenerate the data, run `node tools/compat/run.mjs` in the website repository.

= How the IDE uses this

The targets of a project are listed once in its `.csproj`:

```xml
<PropertyGroup>
  <YotsubaTargets>spirv;hlsl;msl;wgsl;glsl;glsles</YotsubaTargets>
</PropertyGroup>
```

#ref-table(columns: (0.7fr, 1.4fr, 3fr), header: ("Target", "Backend", "Diagnostic in the editor"),
  [#c("spirv")], [Vulkan (SPIR-V)], [Error for _No_, _Invalid_ and _Lost_; warning for _Extension_.],
  [#c("hlsl")], [Direct3D 12 (HLSL SM6)], [Same rules.],
  [#c("msl")], [Metal (MSL)], [Same rules.],
  [#c("wgsl")], [WebGPU (WGSL)], [Same rules.],
  [#c("glsl")], [OpenGL 4.5 (GLSL)], [Same rules.],
  [#c("glsles")], [WebGL 2 (GLSL ES 3.00)], [Same rules, plus an error for any stage marked _No stage_.],
)

The rules are the same whatever syntax the shader is written in: `[SV_RenderTargetArrayIndex]`, `[gl_Layer]`, `[render_target_array_index]` and `[BuiltIn_Layer]` are one concept and get one diagnostic. Remove a target from `<YotsubaTargets>` and its diagnostics disappear.

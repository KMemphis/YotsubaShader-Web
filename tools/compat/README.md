# Shader compatibility harness

Builds `compat.json`: a verified table of shader concepts (built-ins, interface, resources, types, stages) × six graphics backends. Every cell comes from compiling, translating, and validating a real shader. Nothing in the table is written by hand.

The table feeds the backend-compatibility PDF and, later, the IDE analyzer that warns when a shader uses a concept that one of the project's `<YotsubaTargets>` cannot run.

## Run

From `Web/`:

```bash
node tools/compat/run.mjs
```

To run only some concepts (the other rows of `compat.json` are kept):

```bash
node tools/compat/run.mjs --only BaseVertex,Layer
```

A full run takes a few seconds. The intermediate files (SPIR-V, disassembly, every translated shader) go to `tools/compat/out/`, which Git ignores.

## Required tools

| Tool | Used for | Override |
|---|---|---|
| `dxc` | HLSL → SPIR-V, and validating HLSL output | `DXC` |
| `glslangValidator` | Vulkan GLSL → SPIR-V, and validating GLSL / GLSL ES output | `GLSLANG` |
| `spirv-val`, `spirv-dis` (SPIRV-Tools) | validating SPIR-V, reading built-ins and capabilities | `SPIRV_VAL`, `SPIRV_DIS` |
| `naga` (naga-cli, default `~/.cargo/bin/naga`) | translator 1, and validating WGSL | `NAGA` |
| `spirv-cross` | translator 2 | `SPIRV_CROSS` |
| `xcrun metal` (Xcode) | validating MSL | `XCRUN` |

The exact versions are written to `compat.json` under `tools`. The Metal check needs macOS.

## Pipeline

1. **Source.** Each concept has one tiny shader in `shaders/` (two for `Location`: a vertex and a fragment shader). The source is HLSL compiled with `dxc -spirv -fspv-target-env=vulkan1.2 -T <vs|ps|cs>_6_6`. Where HLSL cannot spell the concept (`NumWorkgroups`, `WorkgroupSize`, `SamplePosition`, `HelperInvocation`, `BaryCoordNoPerspective`, `SubgroupId`, `NumSubgroups`), the source is Vulkan GLSL compiled with `glslangValidator -V --target-env vulkan1.2`. The `source` field records which one was used.
2. **SPIR-V.** `spirv-val --target-env vulkan1.2`, then `spirv-dis` to record the `BuiltIn` decorations, capabilities, extensions, and execution modes.
3. **Translate and validate** with both naga and spirv-cross:

| Backend | Output | Validator |
|---|---|---|
| `vulkan` | the SPIR-V itself | `spirv-val` |
| `d3d12` | HLSL, shader model 6.0 first | `dxc -T <stage>_6_x -E <entry>` |
| `metal` | MSL 3.0 | `xcrun -sdk macosx metal -std=metal3.0 -c` |
| `webgpu` | WGSL (naga only; spirv-cross has no WGSL backend) | naga re-parse with WebGPU capabilities only |
| `opengl` | GLSL 4.50 core | `glslangValidator -S <stage>` |
| `webgl2` | GLSL ES 3.00 | `glslangValidator -S <stage>` |

Notes on the validators:

- **Direct3D 12:** when the SM 6.0 output fails, the harness tries again at SM 6.1 to 6.7. The first shader model that works is recorded as `requires` (for example, barycentrics need SM 6.1).
- **WebGPU:** naga's command line validates with *every* capability by default, so it accepts things WebGPU does not have, such as `f64`. The harness first re-parses the WGSL with only WebGPU's core capabilities. If that fails, it adds WebGPU's optional features one at a time (`f16`, `clip_distances`, `dual_source_blending`, `primitive_index`, `subgroups`); passing that way gives `extension`. When the output passes only with naga-specific capabilities (barycentrics, `f64`), the cell is `invalid`, and the message says that naga accepts it only with non-WebGPU capabilities.
- **Vulkan:** SPIR-V extensions that are core in Vulkan 1.2 (`SPV_KHR_shader_draw_parameters`, `SPV_EXT_shader_viewport_index_layer`, and so on) do not count as extensions. Optional device features, such as `shaderFloat64` or `geometryShader`, show up only in `capabilities`.

## Statuses

Each translator's result is one of these:

| Status | Meaning |
|---|---|
| `ok` | The output compiles in the backend compiler with no extension. |
| `extension` | The output compiles, but only with a non-core extension: a GLSL `#extension`, a WGSL `enable`, or a non-core SPIR-V `OpExtension`. The names are in `extensions`. `"unverified": true` means the compiler does not implement that extension (glslang lacks `GL_EXT_clip_cull_distance` for ES 3.00), so the output could not be compiled. |
| `dropped` | The output compiles, but the translator silently removed the concept. This is checked with the `expect` patterns in `concepts.mjs` (for example, `depth_greater` for conservative depth). |
| `invalid` | Translation succeeded, but the backend compiler rejects the output. |
| `rejected` | The translator refused the shader. |
| `n/a` | The stage does not exist on the backend (compute on WebGL 2), or the translator has no such backend (spirv-cross → WGSL). |

The backend's status is the **best** of its translators, ranked `ok` > `extension` > `dropped` > `invalid` > `rejected`. For concepts with several shaders, each translator's result is the **worst** across those shaders, because all of them must work.

Each translator entry also stores `message` (the first error line), `extensions`, `requires` (D3D12 only), `entry` (the HLSL entry point that dxc compiled), and `files` (the outputs under `out/`).

## What the table measures

A cell describes the full pipeline: SPIR-V → translator → backend compiler. It does not describe the backend API alone. For example, D3D12 supports `SV_StencilRef`, but neither naga nor spirv-cross can translate stencil export to HLSL, so `FragStencilRef` on `d3d12` is `rejected`. That pipeline view is what matters for YotsubaShader, because it compiles to SPIR-V and reaches the other formats through these translators. Read `message` to tell a translator limit from a backend limit.

A GLSL `extension` means the GLSL extension exists. It does not mean every driver, or every browser for WebGL 2, exposes it.

## Adding a concept

1. Add the shader to `shaders/`. It should use the concept and nothing else, and write the value to an output so the compiler cannot remove it.
2. Add a row to `concepts.mjs`, with `expect` patterns if a translator could drop the concept silently.
3. Run `node tools/compat/run.mjs --only <Id>`, then check the outputs in `out/<Id>/`.

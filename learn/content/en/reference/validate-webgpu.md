---
title: "Validating for WebGPU"
summary: "What the analyzer rejects when a shader declares WebGPU, version by version, with the exact message of each diagnostic."
order: 25
---

Declare WebGPU with `[ShaderTargets]` and the analyzer reports everything the shader uses that this graphics API does not have. Declare it like this: `[ShaderTargets(Target.WebGpu)]`.

```csharp
using YotsubaShader.Compiler.Metadata;

[ShaderTargets(Target.WebGpu)]
public class MyShader { /* ... */ }
```

Versions: `Target.WebGpu`.

## What each version has

`✓` guaranteed, `~` optional (a warning), `✗` not available (an error when you declare it), `·` not modeled.

| | 1.0 |
| --- | :---: |
| `double` | ✗ |
| `half` | ~ |
| 16-bit integers | ✗ |
| 64-bit integers | ✗ |
| Compute shaders | ✓ |
| Storage buffers | ✓ |
| Storage textures | ✓ |
| Storage textures without a format | ✗ |
| `uint` | ✓ |
| Bitwise operators | ✓ |
| Texel fetch (`Load`) | ✓ |
| Gather | ✓ |
| Texture offsets | ✓ |
| Texture size queries | ✓ |
| Derivatives and implicit LOD | ✓ |

**Notes**

- `double`, WebGPU 1.0: does not exist in WGSL.
- `half`, WebGPU 1.0: needs the 'shader-f16' feature.
- 16-bit integers, WebGPU 1.0: does not exist in WGSL.
- 64-bit integers, WebGPU 1.0: does not exist in WGSL.
- Storage textures without a format, WebGPU 1.0: WGSL requires the texture format.

## Limits

The limits the analyzer checks. A shader that goes over one gets a diagnostic that names the version.

| | 1.0 |
| --- | :---: |
| Render targets | 8 |
| Vertex inputs | 16 |
| Variables between stages | 16 |
| Descriptor sets | 4 |
| Uniform buffer (bytes) | 65536 |
| Compute group (invocations) | 256 |

## What happens in each case

### `double`

```csharp
public class Example
{
    [ShaderStage(Stage.Fragment)]
    [return: SV_Target]
    public float4 FS()
    {
        double d = 1.0;
        return new float4((float)d);
    }
}
```

| Version | Result |
| --- | --- |
| 1.0 | Error |

Affected versions: WebGPU 1.0

```text
error YS0701: 'double' is not available in all graphics APIs: WebGPU 1.0: does not exist in
    WGSL. Affects: WebGPU 1.0.
```

### A storage texture

```csharp
public class Example
{
    [register("u0")] public RWTexture2D<float4> Image;

    [ShaderStage(Stage.Fragment)]
    [return: SV_Target]
    public float4 FS() => new float4(1f);
}
```

| Version | Result |
| --- | --- |
| 1.0 | Error |

Affected versions: WebGPU 1.0

```text
error YS0705: 'Image' is a storage texture without a format: WebGPU 1.0: WGSL requires the
    texture format. Affects: WebGPU 1.0.
```

The diagnostic ids are described in [Diagnostics](diagnostics.md).

---
title: "Validating for OpenGL ES"
summary: "What the analyzer rejects when a shader declares OpenGL ES, version by version, with the exact message of each diagnostic."
order: 22
---

Declare OpenGL ES with `[ShaderTargets]` and the analyzer reports everything the shader uses that this graphics API does not have. Declare it like this: `[ShaderTargets(Target.OpenGLES_20)]`.

```csharp
using YotsubaShader.Compiler.Metadata;

[ShaderTargets(Target.OpenGLES_32)]
public class MyShader { /* ... */ }
```

Versions: `Target.OpenGLES_20`, `Target.OpenGLES_30`, `Target.OpenGLES_31`, `Target.OpenGLES_32`.

## What each version has

`✓` guaranteed, `~` optional (a warning), `✗` not available (an error when you declare it), `·` not modeled.

| | 2.0 | 3.0 | 3.1 | 3.2 |
| --- | :---: | :---: | :---: | :---: |
| `double` | ✗ | ✗ | ✗ | ✗ |
| `half` | ~ | ~ | ~ | ~ |
| 16-bit integers | ~ | ~ | ~ | ~ |
| 64-bit integers | ~ | ~ | ~ | ~ |
| Compute shaders | ✗ | ✗ | ✓ | ✓ |
| Storage buffers | ✗ | ✗ | ✓ | ✓ |
| Storage textures | ✗ | ✗ | ✓ | ✓ |
| Storage textures without a format | ✗ | ✗ | ✗ | ✗ |
| `uint` | ~ | ✓ | ✓ | ✓ |
| Bitwise operators | ✗ | ✓ | ✓ | ✓ |
| Texel fetch (`Load`) | ✗ | ✓ | ✓ | ✓ |
| Gather | ✗ | ✗ | ✓ | ✓ |
| Texture offsets | ✗ | ✓ | ✓ | ✓ |
| Texture size queries | ✗ | ✓ | ✓ | ✓ |
| Derivatives and implicit LOD | ~ | ✓ | ✓ | ✓ |

**Notes**

- `double`, OpenGL ES 2.0–3.2: OpenGL ES has no double.
- `half`, OpenGL ES 2.0–3.2: needs an extension.
- 16-bit integers, OpenGL ES 2.0–3.2: needs an extension.
- 64-bit integers, OpenGL ES 2.0–3.2: needs an extension.
- Compute shaders, OpenGL ES 2.0, OpenGL ES 3.0: compute shaders arrive in OpenGL ES 3.1.
- Storage buffers, OpenGL ES 2.0, OpenGL ES 3.0: storage buffers arrive in OpenGL ES 3.1.
- Storage textures, OpenGL ES 2.0, OpenGL ES 3.0: images (load/store) arrive in OpenGL ES 3.1.
- Storage textures without a format, OpenGL ES 2.0–3.2: GLSL ES requires the image format.
- `uint`, OpenGL ES 2.0: GLSL ES 1.00 has no uint; the generated shader emulates it with int.
- Bitwise operators, OpenGL ES 2.0: needs GLSL ES 3.00 (OpenGL ES 3.0).
- Texel fetch (`Load`), OpenGL ES 2.0: needs GLSL ES 3.00 (OpenGL ES 3.0).
- Gather, OpenGL ES 2.0, OpenGL ES 3.0: textureGather arrives in OpenGL ES 3.1.
- Texture offsets, OpenGL ES 2.0: needs GLSL ES 3.00 (OpenGL ES 3.0).
- Texture size queries, OpenGL ES 2.0: needs GLSL ES 3.00 (OpenGL ES 3.0).
- Derivatives and implicit LOD, OpenGL ES 2.0: needs OES_standard_derivatives.

## Limits

The limits the analyzer checks. A shader that goes over one gets a diagnostic that names the version.

| | 2.0 | 3.0 | 3.1 | 3.2 |
| --- | :---: | :---: | :---: | :---: |
| Render targets | 1 | 4 | 4 | 4 |
| Vertex inputs | 8 | 16 | 16 | 16 |
| Variables between stages | 8 | 15 | 15 | 15 |
| Uniform buffer (bytes) | · | 16384 | 16384 | 16384 |
| Compute group (invocations) | · | · | 128 | 128 |

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
| 2.0 | Error |
| 3.0 | Error |
| 3.1 | Error |
| 3.2 | Error |

Affected versions: OpenGL ES 2.0

```text
error YS0701: 'double' is not available in all graphics APIs: OpenGL ES 2.0: OpenGL ES has no
    double. Affects: OpenGL ES 2.0.
```

Affected versions: OpenGL ES 3.0

```text
error YS0701: 'double' is not available in all graphics APIs: OpenGL ES 3.0: OpenGL ES has no
    double. Affects: OpenGL ES 3.0.
```

Affected versions: OpenGL ES 3.1

```text
error YS0701: 'double' is not available in all graphics APIs: OpenGL ES 3.1: OpenGL ES has no
    double. Affects: OpenGL ES 3.1.
```

Affected versions: OpenGL ES 3.2

```text
error YS0701: 'double' is not available in all graphics APIs: OpenGL ES 3.2: OpenGL ES has no
    double. Affects: OpenGL ES 3.2.
```

### A compute shader

```csharp
public class Example
{
    [ShaderStage(Stage.Compute)]
    [numthreads(8, 8, 1)]
    public void CS() { }
}
```

| Version | Result |
| --- | --- |
| 2.0 | Error |
| 3.0 | Error |
| 3.1, 3.2 | valid |

Affected versions: OpenGL ES 2.0

```text
error YS0711: The compute shader 'CS' is not available in all graphics APIs: OpenGL ES 2.0:
    compute shaders arrive in OpenGL ES 3.1. Affects: OpenGL ES 2.0.
```

Affected versions: OpenGL ES 3.0

```text
error YS0711: The compute shader 'CS' is not available in all graphics APIs: OpenGL ES 3.0:
    compute shaders arrive in OpenGL ES 3.1. Affects: OpenGL ES 3.0.
```

### A storage buffer

```csharp
public struct Item { public float Value; }

public class Example
{
    [register("u0")] public RWStructuredBuffer<Item> Items;

    [ShaderStage(Stage.Fragment)]
    [return: SV_Target]
    public float4 FS() => new float4(Items[0].Value);
}
```

| Version | Result |
| --- | --- |
| 2.0 | Error |
| 3.0 | Error |
| 3.1, 3.2 | valid |

Affected versions: OpenGL ES 2.0

```text
error YS0711: The storage buffer 'Items' is not available in all graphics APIs: OpenGL ES 2.0:
    storage buffers arrive in OpenGL ES 3.1. Affects: OpenGL ES 2.0.
```

Affected versions: OpenGL ES 3.0

```text
error YS0711: The storage buffer 'Items' is not available in all graphics APIs: OpenGL ES 3.0:
    storage buffers arrive in OpenGL ES 3.1. Affects: OpenGL ES 3.0.
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
| 2.0 | Error |
| 3.0 | Error |
| 3.1 | Error |
| 3.2 | Error |

Affected versions: OpenGL ES 2.0

```text
error YS0711: The storage texture 'Image' is not available in all graphics APIs: OpenGL ES 2.0:
    images (load/store) arrive in OpenGL ES 3.1. Affects: OpenGL ES 2.0.
error YS0705: 'Image' is a storage texture without a format: OpenGL ES 2.0: GLSL ES requires the
    image format. Affects: OpenGL ES 2.0.
```

Affected versions: OpenGL ES 3.0

```text
error YS0711: The storage texture 'Image' is not available in all graphics APIs: OpenGL ES 3.0:
    images (load/store) arrive in OpenGL ES 3.1. Affects: OpenGL ES 3.0.
error YS0705: 'Image' is a storage texture without a format: OpenGL ES 3.0: GLSL ES requires the
    image format. Affects: OpenGL ES 3.0.
```

Affected versions: OpenGL ES 3.1

```text
error YS0705: 'Image' is a storage texture without a format: OpenGL ES 3.1: GLSL ES requires the
    image format. Affects: OpenGL ES 3.1.
```

Affected versions: OpenGL ES 3.2

```text
error YS0705: 'Image' is a storage texture without a format: OpenGL ES 3.2: GLSL ES requires the
    image format. Affects: OpenGL ES 3.2.
```

### `uint`

```csharp
public class Example
{
    [ShaderStage(Stage.Fragment)]
    [return: SV_Target]
    public float4 FS()
    {
        uint count = 3u;
        uint twice = count * 2u;
        return new float4((float)twice);
    }
}
```

| Version | Result |
| --- | --- |
| 2.0 | Warning |
| 3.0, 3.1, 3.2 | valid |

Affected versions: OpenGL ES 2.0

```text
warning YS0701: 'uint' is not available in all graphics APIs: OpenGL ES 2.0: GLSL ES 1.00 has no
    uint; the generated shader emulates it with int. Affects: OpenGL ES 2.0.
```

### A bitwise operator

```csharp
public class Example
{
    [ShaderStage(Stage.Fragment)]
    [return: SV_Target]
    public float4 FS()
    {
        int mask = 3;
        int shifted = mask << 2;
        return new float4((float)shifted);
    }
}
```

| Version | Result |
| --- | --- |
| 2.0 | Error |
| 3.0, 3.1, 3.2 | valid |

Affected versions: OpenGL ES 2.0

```text
error YS0703: 'bitwise operator' is not available in all graphics APIs: OpenGL ES 2.0: needs
    GLSL ES 3.00 (OpenGL ES 3.0). Affects: OpenGL ES 2.0.
```

### Reading a texel with `Load`

```csharp
public class Example
{
    [register("t0")] public Texture2D Tex;

    [ShaderStage(Stage.Fragment)]
    [return: SV_Target]
    public float4 FS() => Tex.Load(new int3(10, 20, 0));
}
```

| Version | Result |
| --- | --- |
| 2.0 | Error |
| 3.0, 3.1, 3.2 | valid |

Affected versions: OpenGL ES 2.0

```text
error YS0703: 'Load' is not available in all graphics APIs: OpenGL ES 2.0: needs GLSL ES 3.00
    (OpenGL ES 3.0). Affects: OpenGL ES 2.0.
```

### Gather

```csharp
public class Example
{
    [register("t0")] public Texture2D Tex;
    [register("s0")] public SamplerState Smp;

    [ShaderStage(Stage.Fragment)]
    [return: SV_Target]
    public float4 FS() => Tex.Gather(Smp, new float2(0.5f, 0.5f));
}
```

| Version | Result |
| --- | --- |
| 2.0 | Error |
| 3.0 | Error |
| 3.1, 3.2 | valid |

Affected versions: OpenGL ES 2.0

```text
error YS0703: 'Gather' is not available in all graphics APIs: OpenGL ES 2.0: textureGather
    arrives in OpenGL ES 3.1. Affects: OpenGL ES 2.0.
```

Affected versions: OpenGL ES 3.0

```text
error YS0703: 'Gather' is not available in all graphics APIs: OpenGL ES 3.0: textureGather
    arrives in OpenGL ES 3.1. Affects: OpenGL ES 3.0.
```

### A texture offset

```csharp
public class Example
{
    [register("t0")] public Texture2D Tex;
    [register("s0")] public SamplerState Smp;

    [ShaderStage(Stage.Fragment)]
    [return: SV_Target]
    public float4 FS([TEXCOORD(0)] float2 uv) => Tex.Sample(Smp, uv, new int2(1, 1));
}
```

| Version | Result |
| --- | --- |
| 2.0 | Warning, Error |
| 3.0, 3.1, 3.2 | valid |

Affected versions: OpenGL ES 2.0

```text
warning YS0703: 'Sample' is not available in all graphics APIs: OpenGL ES 2.0: needs
    OES_standard_derivatives. Affects: OpenGL ES 2.0.
error YS0703: 'Sample' is not available in all graphics APIs: OpenGL ES 2.0: needs GLSL ES 3.00
    (OpenGL ES 3.0). Affects: OpenGL ES 2.0.
```

### Asking the size of a texture

```csharp
public class Example
{
    [register("t0")] public Texture2D Tex;

    [ShaderStage(Stage.Fragment)]
    [return: SV_Target]
    public float4 FS()
    {
        uint width, height;
        Tex.GetDimensions(out width, out height);
        return new float4((float)width, (float)height, 0f, 1f);
    }
}
```

| Version | Result |
| --- | --- |
| 2.0 | Warning, Error |
| 3.0, 3.1, 3.2 | valid |

Affected versions: OpenGL ES 2.0

```text
warning YS0701: 'uint' is not available in all graphics APIs: OpenGL ES 2.0: GLSL ES 1.00 has no
    uint; the generated shader emulates it with int. Affects: OpenGL ES 2.0.
error YS0703: 'GetDimensions' is not available in all graphics APIs: OpenGL ES 2.0: needs GLSL
    ES 3.00 (OpenGL ES 3.0). Affects: OpenGL ES 2.0.
```

### A screen-space derivative

```csharp
public class Example
{
    [ShaderStage(Stage.Fragment)]
    [return: SV_Target]
    public float4 FS([TEXCOORD(0)] float x) => new float4(Intrinsic.ddx(x));
}
```

| Version | Result |
| --- | --- |
| 2.0 | Warning |
| 3.0, 3.1, 3.2 | valid |

Affected versions: OpenGL ES 2.0

```text
warning YS0703: 'ddx' is not available in all graphics APIs: OpenGL ES 2.0: needs
    OES_standard_derivatives. Affects: OpenGL ES 2.0.
```

### A large uniform buffer

```csharp
public struct Palette
{
    [ArrayLength(1100)] public float4[] Colors;   // 17 600 bytes
}

public class Example
{
    [register("b0")] public ConstantBuffer<Palette> Data;

    [ShaderStage(Stage.Fragment)]
    [return: SV_Target]
    public float4 FS() => Data.Value.Colors[0];
}
```

| Version | Result |
| --- | --- |
| 2.0 | valid |
| 3.0 | Error |
| 3.1 | Error |
| 3.2 | Error |

Affected versions: OpenGL ES 3.0

```text
error YS0713: The uniform buffer 'Data' takes 17600 bytes (std140), more than what is guaranteed
    by OpenGL ES 3.0 (16384 bytes). Affects: OpenGL ES 3.0.
```

Affected versions: OpenGL ES 3.1

```text
error YS0713: The uniform buffer 'Data' takes 17600 bytes (std140), more than what is guaranteed
    by OpenGL ES 3.1 (16384 bytes). Affects: OpenGL ES 3.1.
```

Affected versions: OpenGL ES 3.2

```text
error YS0713: The uniform buffer 'Data' takes 17600 bytes (std140), more than what is guaranteed
    by OpenGL ES 3.2 (16384 bytes). Affects: OpenGL ES 3.2.
```

### A large compute group

```csharp
public class Example
{
    [ShaderStage(Stage.Compute)]
    [numthreads(256, 1, 1)]   // 256 invocations
    public void CS() { }
}
```

| Version | Result |
| --- | --- |
| 2.0 | Error |
| 3.0 | Error |
| 3.1 | Warning |
| 3.2 | Warning |

Affected versions: OpenGL ES 2.0

```text
error YS0711: The compute shader 'CS' is not available in all graphics APIs: OpenGL ES 2.0:
    compute shaders arrive in OpenGL ES 3.1. Affects: OpenGL ES 2.0.
```

Affected versions: OpenGL ES 3.0

```text
error YS0711: The compute shader 'CS' is not available in all graphics APIs: OpenGL ES 3.0:
    compute shaders arrive in OpenGL ES 3.1. Affects: OpenGL ES 3.0.
```

Affected versions: OpenGL ES 3.1

```text
warning YS0704: The group of 256x1x1 (256 invocations) exceeds what is guaranteed by OpenGL ES
    3.1 (128 invocations, 128x128x64). Affects: OpenGL ES 3.1.
```

Affected versions: OpenGL ES 3.2

```text
warning YS0704: The group of 256x1x1 (256 invocations) exceeds what is guaranteed by OpenGL ES
    3.2 (128 invocations, 128x128x64). Affects: OpenGL ES 3.2.
```

The diagnostic ids are described in [Diagnostics](diagnostics.md).

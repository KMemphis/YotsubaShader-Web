---
title: "Validating for Direct3D"
summary: "What the analyzer rejects when a shader declares Direct3D, version by version, with the exact message of each diagnostic."
order: 23
---

Declare Direct3D with `[ShaderTargets]` and the analyzer reports everything the shader uses that this graphics API does not have. Declare it like this: `[ShaderTargets(Target.DirectX_80)]`.

```csharp
using YotsubaShader.Compiler.Metadata;

[ShaderTargets(Target.DirectX_12)]
public class MyShader { /* ... */ }
```

Versions: `Target.DirectX_80`, `Target.DirectX_81`, `Target.DirectX_90`, `Target.DirectX_90c`, `Target.DirectX_10`, `Target.DirectX_11`, `Target.DirectX_12`.

> [!NOTE]
> Direct3D 8.0, Direct3D 8.1, Direct3D 9.0: No YotsubaShader backend generates these versions; the analyzer validates them anyway, so you can declare them and compile for another language.

## What each version has

`✓` guaranteed, `~` optional (a warning), `✗` not available (an error when you declare it), `·` not modeled.

| | 8.0 | 8.1 | 9.0 | 9.0c | 10 | 11 | 12 |
| --- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `double` | ✗ | ✗ | ✗ | ✗ | ✗ | ~ | ~ |
| `half` | · | · | · | · | · | · | ~ |
| 16-bit integers | · | · | · | · | · | · | ~ |
| 64-bit integers | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ~ |
| Compute shaders | ✗ | ✗ | ✗ | ✗ | ~ | ✓ | ✓ |
| Storage buffers | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| Storage textures | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| Storage textures without a format | · | · | · | · | · | ~ | ~ |
| `uint` | ✗ | ✗ | ~ | ~ | ✓ | ✓ | ✓ |
| Bitwise operators | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| Texel fetch (`Load`) | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| Gather | ✗ | ✗ | ✗ | ✗ | ~ | ✓ | ✓ |
| Texture offsets | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| Texture size queries | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| Derivatives and implicit LOD | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |

**Notes**

- `double`, Direct3D 8.0–10: HLSL only has double since Shader Model 5.0.
- `double`, Direct3D 11, Direct3D 12: optional (D3D11_FEATURE_DOUBLES).
- `half`, Direct3D 12: needs Shader Model 6.2 with -enable-16bit-types.
- 16-bit integers, Direct3D 12: needs Shader Model 6.2 with -enable-16bit-types.
- 64-bit integers, Direct3D 8.0–11: HLSL only has 64-bit integers since Shader Model 6.0.
- 64-bit integers, Direct3D 12: needs Shader Model 6.0 and 64-bit support in the hardware.
- Compute shaders, Direct3D 8.0–9.0c: compute shaders arrive in Shader Model 4.0 (Direct3D 10).
- Compute shaders, Direct3D 10: cs_4_0 only on Direct3D 10 hardware that supports it.
- Storage buffers, Direct3D 8.0–10: read/write buffers (UAV) arrive in Shader Model 5.0 (Direct3D 11).
- Storage textures, Direct3D 8.0–10: read/write textures (UAV) arrive in Shader Model 5.0 (Direct3D 11).
- Storage textures without a format, Direct3D 11, Direct3D 12: loading typed UAVs without a format is optional.
- `uint`, Direct3D 8.0, Direct3D 8.1: needs Shader Model 4.0 (Direct3D 10).
- `uint`, Direct3D 9.0, Direct3D 9.0c: Shader Model 2/3 emulates integers with floats.
- Bitwise operators, Direct3D 8.0, Direct3D 8.1: needs Shader Model 4.0 (Direct3D 10).
- Bitwise operators, Direct3D 9.0, Direct3D 9.0c: bitwise operations need Shader Model 4.0 (Direct3D 10).
- Texel fetch (`Load`), Direct3D 8.0–9.0c: needs Shader Model 4.0 (Direct3D 10).
- Gather, Direct3D 8.0–9.0c: needs Shader Model 4.0 (Direct3D 10).
- Gather, Direct3D 10: Gather4 needs Shader Model 4.1 (Direct3D 10.1).
- Texture offsets, Direct3D 8.0–9.0c: needs Shader Model 4.0 (Direct3D 10).
- Texture size queries, Direct3D 8.0–9.0c: needs Shader Model 4.0 (Direct3D 10).
- Derivatives and implicit LOD, Direct3D 8.0, Direct3D 8.1: pixel shader 1.x has no derivatives (they arrive in ps_2_0).

## Limits

The limits the analyzer checks. A shader that goes over one gets a diagnostic that names the version.

| | 8.0 | 8.1 | 9.0 | 9.0c | 10 | 11 | 12 |
| --- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Render targets | · | · | · | 4 | 8 | 8 | 8 |
| Vertex inputs | · | · | · | 16 | 16 | 32 | 32 |
| Variables between stages | · | · | · | · | 16 | 32 | 32 |
| Uniform buffer (bytes) | 128 | 128 | 512 | 3584 | 65536 | 65536 | 65536 |

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
| 8.0 | Error |
| 8.1 | Error |
| 9.0 | Error |
| 9.0c | Error |
| 10 | Error |
| 11 | Warning |
| 12 | Warning |

Affected versions: Direct3D 8.0

```text
error YS0701: 'double' is not available in all graphics APIs: Direct3D 8.0: HLSL only has double
    since Shader Model 5.0. Affects: Direct3D 8.0.
```

Affected versions: Direct3D 8.1

```text
error YS0701: 'double' is not available in all graphics APIs: Direct3D 8.1: HLSL only has double
    since Shader Model 5.0. Affects: Direct3D 8.1.
```

Affected versions: Direct3D 9.0

```text
error YS0701: 'double' is not available in all graphics APIs: Direct3D 9.0: HLSL only has double
    since Shader Model 5.0. Affects: Direct3D 9.0.
```

Affected versions: Direct3D 9.0c

```text
error YS0701: 'double' is not available in all graphics APIs: Direct3D 9.0c: HLSL only has
    double since Shader Model 5.0. Affects: Direct3D 9.0c.
```

Affected versions: Direct3D 10

```text
error YS0701: 'double' is not available in all graphics APIs: Direct3D 10: HLSL only has double
    since Shader Model 5.0. Affects: Direct3D 10.
```

Affected versions: Direct3D 11

```text
warning YS0701: 'double' is not available in all graphics APIs: Direct3D 11: optional
    (D3D11_FEATURE_DOUBLES). Affects: Direct3D 11.
```

Affected versions: Direct3D 12

```text
warning YS0701: 'double' is not available in all graphics APIs: Direct3D 12: optional
    (D3D11_FEATURE_DOUBLES). Affects: Direct3D 12.
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
| 8.0 | Error |
| 8.1 | Error |
| 9.0 | Error |
| 9.0c | Error |
| 10 | Warning |
| 11, 12 | valid |

Affected versions: Direct3D 8.0

```text
error YS0711: The compute shader 'CS' is not available in all graphics APIs: Direct3D 8.0:
    compute shaders arrive in Shader Model 4.0 (Direct3D 10). Affects: Direct3D 8.0.
```

Affected versions: Direct3D 8.1

```text
error YS0711: The compute shader 'CS' is not available in all graphics APIs: Direct3D 8.1:
    compute shaders arrive in Shader Model 4.0 (Direct3D 10). Affects: Direct3D 8.1.
```

Affected versions: Direct3D 9.0

```text
error YS0711: The compute shader 'CS' is not available in all graphics APIs: Direct3D 9.0:
    compute shaders arrive in Shader Model 4.0 (Direct3D 10). Affects: Direct3D 9.0.
```

Affected versions: Direct3D 9.0c

```text
error YS0711: The compute shader 'CS' is not available in all graphics APIs: Direct3D 9.0c:
    compute shaders arrive in Shader Model 4.0 (Direct3D 10). Affects: Direct3D 9.0c.
```

Affected versions: Direct3D 10

```text
warning YS0711: The compute shader 'CS' is not available in all graphics APIs: Direct3D 10:
    cs_4_0 only on Direct3D 10 hardware that supports it. Affects: Direct3D 10.
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
| 8.0 | Error |
| 8.1 | Error |
| 9.0 | Error |
| 9.0c | Error |
| 10 | Error |
| 11, 12 | valid |

Affected versions: Direct3D 8.0

```text
error YS0711: The storage buffer 'Items' is not available in all graphics APIs: Direct3D 8.0:
    read/write buffers (UAV) arrive in Shader Model 5.0 (Direct3D 11). Affects: Direct3D 8.0.
```

Affected versions: Direct3D 8.1

```text
error YS0711: The storage buffer 'Items' is not available in all graphics APIs: Direct3D 8.1:
    read/write buffers (UAV) arrive in Shader Model 5.0 (Direct3D 11). Affects: Direct3D 8.1.
```

Affected versions: Direct3D 9.0

```text
error YS0711: The storage buffer 'Items' is not available in all graphics APIs: Direct3D 9.0:
    read/write buffers (UAV) arrive in Shader Model 5.0 (Direct3D 11). Affects: Direct3D 9.0.
```

Affected versions: Direct3D 9.0c

```text
error YS0711: The storage buffer 'Items' is not available in all graphics APIs: Direct3D 9.0c:
    read/write buffers (UAV) arrive in Shader Model 5.0 (Direct3D 11). Affects: Direct3D 9.0c.
```

Affected versions: Direct3D 10

```text
error YS0711: The storage buffer 'Items' is not available in all graphics APIs: Direct3D 10:
    read/write buffers (UAV) arrive in Shader Model 5.0 (Direct3D 11). Affects: Direct3D 10.
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
| 8.0 | Error |
| 8.1 | Error |
| 9.0 | Error |
| 9.0c | Error |
| 10 | Error |
| 11 | Warning |
| 12 | Warning |

Affected versions: Direct3D 8.0

```text
error YS0711: The storage texture 'Image' is not available in all graphics APIs: Direct3D 8.0:
    read/write textures (UAV) arrive in Shader Model 5.0 (Direct3D 11). Affects: Direct3D 8.0.
```

Affected versions: Direct3D 8.1

```text
error YS0711: The storage texture 'Image' is not available in all graphics APIs: Direct3D 8.1:
    read/write textures (UAV) arrive in Shader Model 5.0 (Direct3D 11). Affects: Direct3D 8.1.
```

Affected versions: Direct3D 9.0

```text
error YS0711: The storage texture 'Image' is not available in all graphics APIs: Direct3D 9.0:
    read/write textures (UAV) arrive in Shader Model 5.0 (Direct3D 11). Affects: Direct3D 9.0.
```

Affected versions: Direct3D 9.0c

```text
error YS0711: The storage texture 'Image' is not available in all graphics APIs: Direct3D 9.0c:
    read/write textures (UAV) arrive in Shader Model 5.0 (Direct3D 11). Affects: Direct3D 9.0c.
```

Affected versions: Direct3D 10

```text
error YS0711: The storage texture 'Image' is not available in all graphics APIs: Direct3D 10:
    read/write textures (UAV) arrive in Shader Model 5.0 (Direct3D 11). Affects: Direct3D 10.
```

Affected versions: Direct3D 11

```text
warning YS0705: 'Image' is a storage texture without a format: Direct3D 11: loading typed UAVs
    without a format is optional. Affects: Direct3D 11.
```

Affected versions: Direct3D 12

```text
warning YS0705: 'Image' is a storage texture without a format: Direct3D 12: loading typed UAVs
    without a format is optional. Affects: Direct3D 12.
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
| 8.0 | Error |
| 8.1 | Error |
| 9.0 | Warning |
| 9.0c | Warning |
| 10, 11, 12 | valid |

Affected versions: Direct3D 8.0

```text
error YS0701: 'uint' is not available in all graphics APIs: Direct3D 8.0: needs Shader Model 4.0
    (Direct3D 10). Affects: Direct3D 8.0.
```

Affected versions: Direct3D 8.1

```text
error YS0701: 'uint' is not available in all graphics APIs: Direct3D 8.1: needs Shader Model 4.0
    (Direct3D 10). Affects: Direct3D 8.1.
```

Affected versions: Direct3D 9.0

```text
warning YS0701: 'uint' is not available in all graphics APIs: Direct3D 9.0: Shader Model 2/3
    emulates integers with floats. Affects: Direct3D 9.0.
```

Affected versions: Direct3D 9.0c

```text
warning YS0701: 'uint' is not available in all graphics APIs: Direct3D 9.0c: Shader Model 2/3
    emulates integers with floats. Affects: Direct3D 9.0c.
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
| 8.0 | Error |
| 8.1 | Error |
| 9.0 | Error |
| 9.0c | Error |
| 10, 11, 12 | valid |

Affected versions: Direct3D 8.0

```text
error YS0703: 'bitwise operator' is not available in all graphics APIs: Direct3D 8.0: needs
    Shader Model 4.0 (Direct3D 10). Affects: Direct3D 8.0.
```

Affected versions: Direct3D 8.1

```text
error YS0703: 'bitwise operator' is not available in all graphics APIs: Direct3D 8.1: needs
    Shader Model 4.0 (Direct3D 10). Affects: Direct3D 8.1.
```

Affected versions: Direct3D 9.0

```text
error YS0703: 'bitwise operator' is not available in all graphics APIs: Direct3D 9.0: bitwise
    operations need Shader Model 4.0 (Direct3D 10). Affects: Direct3D 9.0.
```

Affected versions: Direct3D 9.0c

```text
error YS0703: 'bitwise operator' is not available in all graphics APIs: Direct3D 9.0c: bitwise
    operations need Shader Model 4.0 (Direct3D 10). Affects: Direct3D 9.0c.
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
| 8.0 | Error |
| 8.1 | Error |
| 9.0 | Error |
| 9.0c | Error |
| 10, 11, 12 | valid |

Affected versions: Direct3D 8.0

```text
error YS0703: 'Load' is not available in all graphics APIs: Direct3D 8.0: needs Shader Model 4.0
    (Direct3D 10). Affects: Direct3D 8.0.
```

Affected versions: Direct3D 8.1

```text
error YS0703: 'Load' is not available in all graphics APIs: Direct3D 8.1: needs Shader Model 4.0
    (Direct3D 10). Affects: Direct3D 8.1.
```

Affected versions: Direct3D 9.0

```text
error YS0703: 'Load' is not available in all graphics APIs: Direct3D 9.0: needs Shader Model 4.0
    (Direct3D 10). Affects: Direct3D 9.0.
```

Affected versions: Direct3D 9.0c

```text
error YS0703: 'Load' is not available in all graphics APIs: Direct3D 9.0c: needs Shader Model
    4.0 (Direct3D 10). Affects: Direct3D 9.0c.
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
| 8.0 | Error |
| 8.1 | Error |
| 9.0 | Error |
| 9.0c | Error |
| 10 | Warning |
| 11, 12 | valid |

Affected versions: Direct3D 8.0

```text
error YS0703: 'Gather' is not available in all graphics APIs: Direct3D 8.0: needs Shader Model
    4.0 (Direct3D 10). Affects: Direct3D 8.0.
```

Affected versions: Direct3D 8.1

```text
error YS0703: 'Gather' is not available in all graphics APIs: Direct3D 8.1: needs Shader Model
    4.0 (Direct3D 10). Affects: Direct3D 8.1.
```

Affected versions: Direct3D 9.0

```text
error YS0703: 'Gather' is not available in all graphics APIs: Direct3D 9.0: needs Shader Model
    4.0 (Direct3D 10). Affects: Direct3D 9.0.
```

Affected versions: Direct3D 9.0c

```text
error YS0703: 'Gather' is not available in all graphics APIs: Direct3D 9.0c: needs Shader Model
    4.0 (Direct3D 10). Affects: Direct3D 9.0c.
```

Affected versions: Direct3D 10

```text
warning YS0703: 'Gather' is not available in all graphics APIs: Direct3D 10: Gather4 needs
    Shader Model 4.1 (Direct3D 10.1). Affects: Direct3D 10.
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
| 8.0 | Error |
| 8.1 | Error |
| 9.0 | Error |
| 9.0c | Error |
| 10, 11, 12 | valid |

Affected versions: Direct3D 8.0

```text
error YS0703: 'Sample' is not available in all graphics APIs: Direct3D 8.0: pixel shader 1.x has
    no derivatives (they arrive in ps_2_0). Affects: Direct3D 8.0.
error YS0703: 'Sample' is not available in all graphics APIs: Direct3D 8.0: needs Shader Model
    4.0 (Direct3D 10). Affects: Direct3D 8.0.
```

Affected versions: Direct3D 8.1

```text
error YS0703: 'Sample' is not available in all graphics APIs: Direct3D 8.1: pixel shader 1.x has
    no derivatives (they arrive in ps_2_0). Affects: Direct3D 8.1.
error YS0703: 'Sample' is not available in all graphics APIs: Direct3D 8.1: needs Shader Model
    4.0 (Direct3D 10). Affects: Direct3D 8.1.
```

Affected versions: Direct3D 9.0

```text
error YS0703: 'Sample' is not available in all graphics APIs: Direct3D 9.0: needs Shader Model
    4.0 (Direct3D 10). Affects: Direct3D 9.0.
```

Affected versions: Direct3D 9.0c

```text
error YS0703: 'Sample' is not available in all graphics APIs: Direct3D 9.0c: needs Shader Model
    4.0 (Direct3D 10). Affects: Direct3D 9.0c.
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
| 8.0 | Error |
| 8.1 | Error |
| 9.0 | Warning, Error |
| 9.0c | Warning, Error |
| 10, 11, 12 | valid |

Affected versions: Direct3D 8.0

```text
error YS0701: 'uint' is not available in all graphics APIs: Direct3D 8.0: needs Shader Model 4.0
    (Direct3D 10). Affects: Direct3D 8.0.
error YS0703: 'GetDimensions' is not available in all graphics APIs: Direct3D 8.0: needs Shader
    Model 4.0 (Direct3D 10). Affects: Direct3D 8.0.
```

Affected versions: Direct3D 8.1

```text
error YS0701: 'uint' is not available in all graphics APIs: Direct3D 8.1: needs Shader Model 4.0
    (Direct3D 10). Affects: Direct3D 8.1.
error YS0703: 'GetDimensions' is not available in all graphics APIs: Direct3D 8.1: needs Shader
    Model 4.0 (Direct3D 10). Affects: Direct3D 8.1.
```

Affected versions: Direct3D 9.0

```text
warning YS0701: 'uint' is not available in all graphics APIs: Direct3D 9.0: Shader Model 2/3
    emulates integers with floats. Affects: Direct3D 9.0.
error YS0703: 'GetDimensions' is not available in all graphics APIs: Direct3D 9.0: needs Shader
    Model 4.0 (Direct3D 10). Affects: Direct3D 9.0.
```

Affected versions: Direct3D 9.0c

```text
warning YS0701: 'uint' is not available in all graphics APIs: Direct3D 9.0c: Shader Model 2/3
    emulates integers with floats. Affects: Direct3D 9.0c.
error YS0703: 'GetDimensions' is not available in all graphics APIs: Direct3D 9.0c: needs Shader
    Model 4.0 (Direct3D 10). Affects: Direct3D 9.0c.
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
| 8.0 | Error |
| 8.1 | Error |
| 9.0, 9.0c, 10, 11, 12 | valid |

Affected versions: Direct3D 8.0

```text
error YS0703: 'ddx' is not available in all graphics APIs: Direct3D 8.0: pixel shader 1.x has no
    derivatives (they arrive in ps_2_0). Affects: Direct3D 8.0.
```

Affected versions: Direct3D 8.1

```text
error YS0703: 'ddx' is not available in all graphics APIs: Direct3D 8.1: pixel shader 1.x has no
    derivatives (they arrive in ps_2_0). Affects: Direct3D 8.1.
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
| 8.0 | Error |
| 8.1 | Error |
| 9.0 | Error |
| 9.0c | Error |
| 10, 11, 12 | valid |

Affected versions: Direct3D 8.0

```text
error YS0713: The uniform buffer 'Data' takes 17600 bytes (std140), more than what is guaranteed
    by Direct3D 8.0 (128 bytes). Affects: Direct3D 8.0.
```

Affected versions: Direct3D 8.1

```text
error YS0713: The uniform buffer 'Data' takes 17600 bytes (std140), more than what is guaranteed
    by Direct3D 8.1 (128 bytes). Affects: Direct3D 8.1.
```

Affected versions: Direct3D 9.0

```text
error YS0713: The uniform buffer 'Data' takes 17600 bytes (std140), more than what is guaranteed
    by Direct3D 9.0 (512 bytes). Affects: Direct3D 9.0.
```

Affected versions: Direct3D 9.0c

```text
error YS0713: The uniform buffer 'Data' takes 17600 bytes (std140), more than what is guaranteed
    by Direct3D 9.0c (3584 bytes). Affects: Direct3D 9.0c.
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
| 8.0 | Error |
| 8.1 | Error |
| 9.0 | Error |
| 9.0c | Error |
| 10 | Warning |
| 11, 12 | valid |

Affected versions: Direct3D 8.0

```text
error YS0711: The compute shader 'CS' is not available in all graphics APIs: Direct3D 8.0:
    compute shaders arrive in Shader Model 4.0 (Direct3D 10). Affects: Direct3D 8.0.
```

Affected versions: Direct3D 8.1

```text
error YS0711: The compute shader 'CS' is not available in all graphics APIs: Direct3D 8.1:
    compute shaders arrive in Shader Model 4.0 (Direct3D 10). Affects: Direct3D 8.1.
```

Affected versions: Direct3D 9.0

```text
error YS0711: The compute shader 'CS' is not available in all graphics APIs: Direct3D 9.0:
    compute shaders arrive in Shader Model 4.0 (Direct3D 10). Affects: Direct3D 9.0.
```

Affected versions: Direct3D 9.0c

```text
error YS0711: The compute shader 'CS' is not available in all graphics APIs: Direct3D 9.0c:
    compute shaders arrive in Shader Model 4.0 (Direct3D 10). Affects: Direct3D 9.0c.
```

Affected versions: Direct3D 10

```text
warning YS0711: The compute shader 'CS' is not available in all graphics APIs: Direct3D 10:
    cs_4_0 only on Direct3D 10 hardware that supports it. Affects: Direct3D 10.
```

The diagnostic ids are described in [Diagnostics](diagnostics.md).

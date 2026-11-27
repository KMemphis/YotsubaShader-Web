---
title: "Validating for Vulkan"
summary: "What the analyzer rejects when a shader declares Vulkan, version by version, with the exact message of each diagnostic."
order: 20
---

Declare Vulkan with `[ShaderTargets]` and the analyzer reports everything the shader uses that this graphics API does not have. Declare it like this: `[ShaderTargets(Target.Vulkan_10)]`.

```csharp
using YotsubaShader.Compiler.Metadata;

[ShaderTargets(Target.Vulkan_14)]
public class MyShader { /* ... */ }
```

Versions: `Target.Vulkan_10`, `Target.Vulkan_11`, `Target.Vulkan_12`, `Target.Vulkan_13`, `Target.Vulkan_14`.

> [!NOTE]
> Vulkan 1.0: No YotsubaShader backend generates these versions; the analyzer validates them anyway, so you can declare them and compile for another language.

## What each version has

`✓` guaranteed, `~` optional (a warning), `✗` not available (an error when you declare it), `·` not modeled.

| | 1.0 | 1.1 | 1.2 | 1.3 | 1.4 |
| --- | :---: | :---: | :---: | :---: | :---: |
| `double` | ~ | ~ | ~ | ~ | ~ |
| `half` | ~ | ~ | ~ | ~ | ~ |
| 16-bit integers | ~ | ~ | ~ | ~ | ~ |
| 64-bit integers | ~ | ~ | ~ | ~ | ~ |
| Compute shaders | ✓ | ✓ | ✓ | ✓ | ✓ |
| Storage buffers | ✓ | ✓ | ✓ | ✓ | ✓ |
| Storage textures | ✓ | ✓ | ✓ | ✓ | ✓ |
| Storage textures without a format | ~ | ~ | ~ | ~ | ~ |
| `uint` | ✓ | ✓ | ✓ | ✓ | ✓ |
| Bitwise operators | ✓ | ✓ | ✓ | ✓ | ✓ |
| Texel fetch (`Load`) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Gather | ✓ | ✓ | ✓ | ✓ | ✓ |
| Texture offsets | ✓ | ✓ | ✓ | ✓ | ✓ |
| Texture size queries | ✓ | ✓ | ✓ | ✓ | ✓ |
| Derivatives and implicit LOD | ✓ | ✓ | ✓ | ✓ | ✓ |

**Notes**

- `double`, Vulkan 1.0–1.4: optional (shaderFloat64).
- `half`, Vulkan 1.0, Vulkan 1.1: needs VK_KHR_shader_float16_int8 and shaderFloat16.
- `half`, Vulkan 1.2–1.4: optional (shaderFloat16).
- 16-bit integers, Vulkan 1.0–1.4: optional (shaderInt16).
- 64-bit integers, Vulkan 1.0–1.4: optional (shaderInt64).
- Storage textures without a format, Vulkan 1.0–1.4: needs shaderStorageImageReadWithoutFormat/WriteWithoutFormat.

## Limits

The limits the analyzer checks. A shader that goes over one gets a diagnostic that names the version.

| | 1.0 | 1.1 | 1.2 | 1.3 | 1.4 |
| --- | :---: | :---: | :---: | :---: | :---: |
| Render targets | 4 | 4 | 4 | 4 | 4 |
| Vertex inputs | 16 | 16 | 16 | 16 | 16 |
| Variables between stages | 16 | 16 | 16 | 16 | 16 |
| Descriptor sets | 4 | 4 | 4 | 4 | 4 |
| Uniform buffer (bytes) | 16384 | 16384 | 16384 | 16384 | 16384 |
| Compute group (invocations) | 128 | 128 | 128 | 128 | 128 |

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
| 1.0 | Warning |
| 1.1 | Warning |
| 1.2 | Warning |
| 1.3 | Warning |
| 1.4 | Warning |

Affected versions: Vulkan 1.0

```text
warning YS0701: 'double' is not available in all graphics APIs: Vulkan 1.0: optional
    (shaderFloat64). Affects: Vulkan 1.0.
```

Affected versions: Vulkan 1.1

```text
warning YS0701: 'double' is not available in all graphics APIs: Vulkan 1.1: optional
    (shaderFloat64). Affects: Vulkan 1.1.
```

Affected versions: Vulkan 1.2

```text
warning YS0701: 'double' is not available in all graphics APIs: Vulkan 1.2: optional
    (shaderFloat64). Affects: Vulkan 1.2.
```

Affected versions: Vulkan 1.3

```text
warning YS0701: 'double' is not available in all graphics APIs: Vulkan 1.3: optional
    (shaderFloat64). Affects: Vulkan 1.3.
```

Affected versions: Vulkan 1.4

```text
warning YS0701: 'double' is not available in all graphics APIs: Vulkan 1.4: optional
    (shaderFloat64). Affects: Vulkan 1.4.
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
| 1.0 | Warning |
| 1.1 | Warning |
| 1.2 | Warning |
| 1.3 | Warning |
| 1.4 | Warning |

Affected versions: Vulkan 1.0

```text
warning YS0705: 'Image' is a storage texture without a format: Vulkan 1.0: needs
    shaderStorageImageReadWithoutFormat/WriteWithoutFormat. Affects: Vulkan 1.0.
```

Affected versions: Vulkan 1.1

```text
warning YS0705: 'Image' is a storage texture without a format: Vulkan 1.1: needs
    shaderStorageImageReadWithoutFormat/WriteWithoutFormat. Affects: Vulkan 1.1.
```

Affected versions: Vulkan 1.2

```text
warning YS0705: 'Image' is a storage texture without a format: Vulkan 1.2: needs
    shaderStorageImageReadWithoutFormat/WriteWithoutFormat. Affects: Vulkan 1.2.
```

Affected versions: Vulkan 1.3

```text
warning YS0705: 'Image' is a storage texture without a format: Vulkan 1.3: needs
    shaderStorageImageReadWithoutFormat/WriteWithoutFormat. Affects: Vulkan 1.3.
```

Affected versions: Vulkan 1.4

```text
warning YS0705: 'Image' is a storage texture without a format: Vulkan 1.4: needs
    shaderStorageImageReadWithoutFormat/WriteWithoutFormat. Affects: Vulkan 1.4.
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
| 1.0 | Error |
| 1.1 | Error |
| 1.2 | Error |
| 1.3 | Error |
| 1.4 | Error |

Affected versions: Vulkan 1.0

```text
error YS0713: The uniform buffer 'Data' takes 17600 bytes (std140), more than what is guaranteed
    by Vulkan 1.0 (16384 bytes). Affects: Vulkan 1.0.
```

Affected versions: Vulkan 1.1

```text
error YS0713: The uniform buffer 'Data' takes 17600 bytes (std140), more than what is guaranteed
    by Vulkan 1.1 (16384 bytes). Affects: Vulkan 1.1.
```

Affected versions: Vulkan 1.2

```text
error YS0713: The uniform buffer 'Data' takes 17600 bytes (std140), more than what is guaranteed
    by Vulkan 1.2 (16384 bytes). Affects: Vulkan 1.2.
```

Affected versions: Vulkan 1.3

```text
error YS0713: The uniform buffer 'Data' takes 17600 bytes (std140), more than what is guaranteed
    by Vulkan 1.3 (16384 bytes). Affects: Vulkan 1.3.
```

Affected versions: Vulkan 1.4

```text
error YS0713: The uniform buffer 'Data' takes 17600 bytes (std140), more than what is guaranteed
    by Vulkan 1.4 (16384 bytes). Affects: Vulkan 1.4.
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
| 1.0 | Warning |
| 1.1 | Warning |
| 1.2 | Warning |
| 1.3 | Warning |
| 1.4 | Warning |

Affected versions: Vulkan 1.0

```text
warning YS0704: The group of 256x1x1 (256 invocations) exceeds what is guaranteed by Vulkan 1.0
    (128 invocations, 128x128x64). Affects: Vulkan 1.0.
```

Affected versions: Vulkan 1.1

```text
warning YS0704: The group of 256x1x1 (256 invocations) exceeds what is guaranteed by Vulkan 1.1
    (128 invocations, 128x128x64). Affects: Vulkan 1.1.
```

Affected versions: Vulkan 1.2

```text
warning YS0704: The group of 256x1x1 (256 invocations) exceeds what is guaranteed by Vulkan 1.2
    (128 invocations, 128x128x64). Affects: Vulkan 1.2.
```

Affected versions: Vulkan 1.3

```text
warning YS0704: The group of 256x1x1 (256 invocations) exceeds what is guaranteed by Vulkan 1.3
    (128 invocations, 128x128x64). Affects: Vulkan 1.3.
```

Affected versions: Vulkan 1.4

```text
warning YS0704: The group of 256x1x1 (256 invocations) exceeds what is guaranteed by Vulkan 1.4
    (128 invocations, 128x128x64). Affects: Vulkan 1.4.
```

The diagnostic ids are described in [Diagnostics](diagnostics.md).

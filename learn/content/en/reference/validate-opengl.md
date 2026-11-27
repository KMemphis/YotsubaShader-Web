---
title: "Validating for OpenGL"
summary: "What the analyzer rejects when a shader declares OpenGL, version by version, with the exact message of each diagnostic."
order: 21
---

Declare OpenGL with `[ShaderTargets]` and the analyzer reports everything the shader uses that this graphics API does not have. Declare it like this: `[ShaderTargets(Target.OpenGL_20)]`.

```csharp
using YotsubaShader.Compiler.Metadata;

[ShaderTargets(Target.OpenGL_46)]
public class MyShader { /* ... */ }
```

Versions: `Target.OpenGL_20`, `Target.OpenGL_30`, `Target.OpenGL_31`, `Target.OpenGL_32`, `Target.OpenGL_33`, `Target.OpenGL_40`, `Target.OpenGL_41`, `Target.OpenGL_42`, `Target.OpenGL_43`, `Target.OpenGL_44`, `Target.OpenGL_45`, `Target.OpenGL_46`.

## What each version has

`✓` guaranteed, `~` optional (a warning), `✗` not available (an error when you declare it), `·` not modeled.

| | 2.0 | 3.0 | 3.1 | 3.2 | 3.3 | 4.0 | 4.1 | 4.2 | 4.3 | 4.4 | 4.5 | 4.6 |
| --- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `double` | ✗ | ✗ | ✗ | ~ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `half` | ~ | ~ | ~ | ~ | ~ | ~ | ~ | ~ | ~ | ~ | ~ | ~ |
| 16-bit integers | ~ | ~ | ~ | ~ | ~ | ~ | ~ | ~ | ~ | ~ | ~ | ~ |
| 64-bit integers | ~ | ~ | ~ | ~ | ~ | ~ | ~ | ~ | ~ | ~ | ~ | ~ |
| Compute shaders | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ~ | ✓ | ✓ | ✓ | ✓ |
| Storage buffers | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ |
| Storage textures | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Storage textures without a format | ~ | ~ | ~ | ~ | ~ | ~ | ~ | ~ | ~ | ~ | ~ | ~ |
| `uint` | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Bitwise operators | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Texel fetch (`Load`) | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Gather | ✗ | ~ | ~ | ~ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Texture offsets | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Texture size queries | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Derivatives and implicit LOD | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

**Notes**

- `double`, OpenGL 2.0–3.1: does not exist before OpenGL 4.0.
- `double`, OpenGL 3.2, OpenGL 3.3: needs ARB_gpu_shader_fp64 (offered by most drivers, not macOS).
- `half`, OpenGL 2.0–4.6: needs an extension (EXT_shader_explicit_arithmetic_types).
- 16-bit integers, OpenGL 2.0–4.6: needs an extension (EXT_shader_explicit_arithmetic_types).
- 64-bit integers, OpenGL 2.0–4.6: needs ARB_gpu_shader_int64.
- Compute shaders, OpenGL 2.0–4.1: compute shaders arrive in OpenGL 4.3.
- Compute shaders, OpenGL 4.2: needs ARB_compute_shader (offered by most 4.2 drivers, not macOS).
- Storage buffers, OpenGL 2.0–4.2: storage buffers arrive in OpenGL 4.3.
- Storage textures, OpenGL 2.0–4.1: images (load/store) arrive in OpenGL 4.2.
- Storage textures without a format, OpenGL 2.0–4.6: needs EXT_shader_image_load_formatted.
- `uint`, OpenGL 2.0: needs GLSL 1.30 (OpenGL 3.0).
- Bitwise operators, OpenGL 2.0: needs GLSL 1.30 (OpenGL 3.0).
- Texel fetch (`Load`), OpenGL 2.0: needs GLSL 1.30 (OpenGL 3.0).
- Gather, OpenGL 2.0: needs GLSL 1.30 (OpenGL 3.0).
- Gather, OpenGL 3.0–3.3: needs ARB_texture_gather.
- Texture offsets, OpenGL 2.0: needs GLSL 1.30 (OpenGL 3.0).
- Texture size queries, OpenGL 2.0: needs GLSL 1.30 (OpenGL 3.0).

## Limits

The limits the analyzer checks. A shader that goes over one gets a diagnostic that names the version.

| | 2.0 | 3.0 | 3.1 | 3.2 | 3.3 | 4.0 | 4.1 | 4.2 | 4.3 | 4.4 | 4.5 | 4.6 |
| --- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Uniform buffer (bytes) | · | · | 16384 | 16384 | 16384 | 16384 | 16384 | 16384 | 16384 | 16384 | 16384 | 16384 |

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
| 3.2 | Warning |
| 3.3 | Warning |
| 4.0, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6 | valid |

Affected versions: OpenGL 2.0

```text
error YS0701: 'double' is not available in all graphics APIs: OpenGL 2.0: does not exist before
    OpenGL 4.0. Affects: OpenGL 2.0.
```

Affected versions: OpenGL 3.0

```text
error YS0701: 'double' is not available in all graphics APIs: OpenGL 3.0: does not exist before
    OpenGL 4.0. Affects: OpenGL 3.0.
```

Affected versions: OpenGL 3.1

```text
error YS0701: 'double' is not available in all graphics APIs: OpenGL 3.1: does not exist before
    OpenGL 4.0. Affects: OpenGL 3.1.
```

Affected versions: OpenGL 3.2

```text
warning YS0701: 'double' is not available in all graphics APIs: OpenGL 3.2: needs
    ARB_gpu_shader_fp64 (offered by most drivers, not macOS). Affects: OpenGL 3.2.
```

Affected versions: OpenGL 3.3

```text
warning YS0701: 'double' is not available in all graphics APIs: OpenGL 3.3: needs
    ARB_gpu_shader_fp64 (offered by most drivers, not macOS). Affects: OpenGL 3.3.
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
| 3.1 | Error |
| 3.2 | Error |
| 3.3 | Error |
| 4.0 | Error |
| 4.1 | Error |
| 4.2 | Warning |
| 4.3, 4.4, 4.5, 4.6 | valid |

Affected versions: OpenGL 2.0

```text
error YS0711: The compute shader 'CS' is not available in all graphics APIs: OpenGL 2.0: compute
    shaders arrive in OpenGL 4.3. Affects: OpenGL 2.0.
```

Affected versions: OpenGL 3.0

```text
error YS0711: The compute shader 'CS' is not available in all graphics APIs: OpenGL 3.0: compute
    shaders arrive in OpenGL 4.3. Affects: OpenGL 3.0.
```

Affected versions: OpenGL 3.1

```text
error YS0711: The compute shader 'CS' is not available in all graphics APIs: OpenGL 3.1: compute
    shaders arrive in OpenGL 4.3. Affects: OpenGL 3.1.
```

Affected versions: OpenGL 3.2

```text
error YS0711: The compute shader 'CS' is not available in all graphics APIs: OpenGL 3.2: compute
    shaders arrive in OpenGL 4.3. Affects: OpenGL 3.2.
```

Affected versions: OpenGL 3.3

```text
error YS0711: The compute shader 'CS' is not available in all graphics APIs: OpenGL 3.3: compute
    shaders arrive in OpenGL 4.3. Affects: OpenGL 3.3.
```

Affected versions: OpenGL 4.0

```text
error YS0711: The compute shader 'CS' is not available in all graphics APIs: OpenGL 4.0: compute
    shaders arrive in OpenGL 4.3. Affects: OpenGL 4.0.
```

Affected versions: OpenGL 4.1

```text
error YS0711: The compute shader 'CS' is not available in all graphics APIs: OpenGL 4.1: compute
    shaders arrive in OpenGL 4.3. Affects: OpenGL 4.1.
```

Affected versions: OpenGL 4.2

```text
warning YS0711: The compute shader 'CS' is not available in all graphics APIs: OpenGL 4.2: needs
    ARB_compute_shader (offered by most 4.2 drivers, not macOS). Affects: OpenGL 4.2.
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
| 3.1 | Error |
| 3.2 | Error |
| 3.3 | Error |
| 4.0 | Error |
| 4.1 | Error |
| 4.2 | Error |
| 4.3, 4.4, 4.5, 4.6 | valid |

Affected versions: OpenGL 2.0

```text
error YS0711: The storage buffer 'Items' is not available in all graphics APIs: OpenGL 2.0:
    storage buffers arrive in OpenGL 4.3. Affects: OpenGL 2.0.
```

Affected versions: OpenGL 3.0

```text
error YS0711: The storage buffer 'Items' is not available in all graphics APIs: OpenGL 3.0:
    storage buffers arrive in OpenGL 4.3. Affects: OpenGL 3.0.
```

Affected versions: OpenGL 3.1

```text
error YS0711: The storage buffer 'Items' is not available in all graphics APIs: OpenGL 3.1:
    storage buffers arrive in OpenGL 4.3. Affects: OpenGL 3.1.
```

Affected versions: OpenGL 3.2

```text
error YS0711: The storage buffer 'Items' is not available in all graphics APIs: OpenGL 3.2:
    storage buffers arrive in OpenGL 4.3. Affects: OpenGL 3.2.
```

Affected versions: OpenGL 3.3

```text
error YS0711: The storage buffer 'Items' is not available in all graphics APIs: OpenGL 3.3:
    storage buffers arrive in OpenGL 4.3. Affects: OpenGL 3.3.
```

Affected versions: OpenGL 4.0

```text
error YS0711: The storage buffer 'Items' is not available in all graphics APIs: OpenGL 4.0:
    storage buffers arrive in OpenGL 4.3. Affects: OpenGL 4.0.
```

Affected versions: OpenGL 4.1

```text
error YS0711: The storage buffer 'Items' is not available in all graphics APIs: OpenGL 4.1:
    storage buffers arrive in OpenGL 4.3. Affects: OpenGL 4.1.
```

Affected versions: OpenGL 4.2

```text
error YS0711: The storage buffer 'Items' is not available in all graphics APIs: OpenGL 4.2:
    storage buffers arrive in OpenGL 4.3. Affects: OpenGL 4.2.
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
| 2.0 | Error, Warning |
| 3.0 | Error, Warning |
| 3.1 | Error, Warning |
| 3.2 | Error, Warning |
| 3.3 | Error, Warning |
| 4.0 | Error, Warning |
| 4.1 | Error, Warning |
| 4.2 | Warning |
| 4.3 | Warning |
| 4.4 | Warning |
| 4.5 | Warning |
| 4.6 | Warning |

Affected versions: OpenGL 2.0

```text
error YS0711: The storage texture 'Image' is not available in all graphics APIs: OpenGL 2.0:
    images (load/store) arrive in OpenGL 4.2. Affects: OpenGL 2.0.
warning YS0705: 'Image' is a storage texture without a format: OpenGL 2.0: needs
    EXT_shader_image_load_formatted. Affects: OpenGL 2.0.
```

Affected versions: OpenGL 3.0

```text
error YS0711: The storage texture 'Image' is not available in all graphics APIs: OpenGL 3.0:
    images (load/store) arrive in OpenGL 4.2. Affects: OpenGL 3.0.
warning YS0705: 'Image' is a storage texture without a format: OpenGL 3.0: needs
    EXT_shader_image_load_formatted. Affects: OpenGL 3.0.
```

Affected versions: OpenGL 3.1

```text
error YS0711: The storage texture 'Image' is not available in all graphics APIs: OpenGL 3.1:
    images (load/store) arrive in OpenGL 4.2. Affects: OpenGL 3.1.
warning YS0705: 'Image' is a storage texture without a format: OpenGL 3.1: needs
    EXT_shader_image_load_formatted. Affects: OpenGL 3.1.
```

Affected versions: OpenGL 3.2

```text
error YS0711: The storage texture 'Image' is not available in all graphics APIs: OpenGL 3.2:
    images (load/store) arrive in OpenGL 4.2. Affects: OpenGL 3.2.
warning YS0705: 'Image' is a storage texture without a format: OpenGL 3.2: needs
    EXT_shader_image_load_formatted. Affects: OpenGL 3.2.
```

Affected versions: OpenGL 3.3

```text
error YS0711: The storage texture 'Image' is not available in all graphics APIs: OpenGL 3.3:
    images (load/store) arrive in OpenGL 4.2. Affects: OpenGL 3.3.
warning YS0705: 'Image' is a storage texture without a format: OpenGL 3.3: needs
    EXT_shader_image_load_formatted. Affects: OpenGL 3.3.
```

Affected versions: OpenGL 4.0

```text
error YS0711: The storage texture 'Image' is not available in all graphics APIs: OpenGL 4.0:
    images (load/store) arrive in OpenGL 4.2. Affects: OpenGL 4.0.
warning YS0705: 'Image' is a storage texture without a format: OpenGL 4.0: needs
    EXT_shader_image_load_formatted. Affects: OpenGL 4.0.
```

Affected versions: OpenGL 4.1

```text
error YS0711: The storage texture 'Image' is not available in all graphics APIs: OpenGL 4.1:
    images (load/store) arrive in OpenGL 4.2. Affects: OpenGL 4.1.
warning YS0705: 'Image' is a storage texture without a format: OpenGL 4.1: needs
    EXT_shader_image_load_formatted. Affects: OpenGL 4.1.
```

Affected versions: OpenGL 4.2

```text
warning YS0705: 'Image' is a storage texture without a format: OpenGL 4.2: needs
    EXT_shader_image_load_formatted. Affects: OpenGL 4.2.
```

Affected versions: OpenGL 4.3

```text
warning YS0705: 'Image' is a storage texture without a format: OpenGL 4.3: needs
    EXT_shader_image_load_formatted. Affects: OpenGL 4.3.
```

Affected versions: OpenGL 4.4

```text
warning YS0705: 'Image' is a storage texture without a format: OpenGL 4.4: needs
    EXT_shader_image_load_formatted. Affects: OpenGL 4.4.
```

Affected versions: OpenGL 4.5

```text
warning YS0705: 'Image' is a storage texture without a format: OpenGL 4.5: needs
    EXT_shader_image_load_formatted. Affects: OpenGL 4.5.
```

Affected versions: OpenGL 4.6

```text
warning YS0705: 'Image' is a storage texture without a format: OpenGL 4.6: needs
    EXT_shader_image_load_formatted. Affects: OpenGL 4.6.
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
| 2.0 | Error |
| 3.0, 3.1, 3.2, 3.3, 4.0, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6 | valid |

Affected versions: OpenGL 2.0

```text
error YS0701: 'uint' is not available in all graphics APIs: OpenGL 2.0: needs GLSL 1.30 (OpenGL
    3.0). Affects: OpenGL 2.0.
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
| 3.0, 3.1, 3.2, 3.3, 4.0, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6 | valid |

Affected versions: OpenGL 2.0

```text
error YS0703: 'bitwise operator' is not available in all graphics APIs: OpenGL 2.0: needs GLSL
    1.30 (OpenGL 3.0). Affects: OpenGL 2.0.
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
| 3.0, 3.1, 3.2, 3.3, 4.0, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6 | valid |

Affected versions: OpenGL 2.0

```text
error YS0703: 'Load' is not available in all graphics APIs: OpenGL 2.0: needs GLSL 1.30 (OpenGL
    3.0). Affects: OpenGL 2.0.
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
| 3.0 | Warning |
| 3.1 | Warning |
| 3.2 | Warning |
| 3.3 | Warning |
| 4.0, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6 | valid |

Affected versions: OpenGL 2.0

```text
error YS0703: 'Gather' is not available in all graphics APIs: OpenGL 2.0: needs GLSL 1.30
    (OpenGL 3.0). Affects: OpenGL 2.0.
```

Affected versions: OpenGL 3.0

```text
warning YS0703: 'Gather' is not available in all graphics APIs: OpenGL 3.0: needs
    ARB_texture_gather. Affects: OpenGL 3.0.
```

Affected versions: OpenGL 3.1

```text
warning YS0703: 'Gather' is not available in all graphics APIs: OpenGL 3.1: needs
    ARB_texture_gather. Affects: OpenGL 3.1.
```

Affected versions: OpenGL 3.2

```text
warning YS0703: 'Gather' is not available in all graphics APIs: OpenGL 3.2: needs
    ARB_texture_gather. Affects: OpenGL 3.2.
```

Affected versions: OpenGL 3.3

```text
warning YS0703: 'Gather' is not available in all graphics APIs: OpenGL 3.3: needs
    ARB_texture_gather. Affects: OpenGL 3.3.
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
| 2.0 | Error |
| 3.0, 3.1, 3.2, 3.3, 4.0, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6 | valid |

Affected versions: OpenGL 2.0

```text
error YS0703: 'Sample' is not available in all graphics APIs: OpenGL 2.0: needs GLSL 1.30
    (OpenGL 3.0). Affects: OpenGL 2.0.
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
| 2.0 | Error |
| 3.0, 3.1, 3.2, 3.3, 4.0, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6 | valid |

Affected versions: OpenGL 2.0

```text
error YS0701: 'uint' is not available in all graphics APIs: OpenGL 2.0: needs GLSL 1.30 (OpenGL
    3.0). Affects: OpenGL 2.0.
error YS0703: 'GetDimensions' is not available in all graphics APIs: OpenGL 2.0: needs GLSL 1.30
    (OpenGL 3.0). Affects: OpenGL 2.0.
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
| 2.0, 3.0 | valid |
| 3.1 | Error |
| 3.2 | Error |
| 3.3 | Error |
| 4.0 | Error |
| 4.1 | Error |
| 4.2 | Error |
| 4.3 | Error |
| 4.4 | Error |
| 4.5 | Error |
| 4.6 | Error |

Affected versions: OpenGL 3.1

```text
error YS0713: The uniform buffer 'Data' takes 17600 bytes (std140), more than what is guaranteed
    by OpenGL 3.1 (16384 bytes). Affects: OpenGL 3.1.
```

Affected versions: OpenGL 3.2

```text
error YS0713: The uniform buffer 'Data' takes 17600 bytes (std140), more than what is guaranteed
    by OpenGL 3.2 (16384 bytes). Affects: OpenGL 3.2.
```

Affected versions: OpenGL 3.3

```text
error YS0713: The uniform buffer 'Data' takes 17600 bytes (std140), more than what is guaranteed
    by OpenGL 3.3 (16384 bytes). Affects: OpenGL 3.3.
```

Affected versions: OpenGL 4.0

```text
error YS0713: The uniform buffer 'Data' takes 17600 bytes (std140), more than what is guaranteed
    by OpenGL 4.0 (16384 bytes). Affects: OpenGL 4.0.
```

Affected versions: OpenGL 4.1

```text
error YS0713: The uniform buffer 'Data' takes 17600 bytes (std140), more than what is guaranteed
    by OpenGL 4.1 (16384 bytes). Affects: OpenGL 4.1.
```

Affected versions: OpenGL 4.2

```text
error YS0713: The uniform buffer 'Data' takes 17600 bytes (std140), more than what is guaranteed
    by OpenGL 4.2 (16384 bytes). Affects: OpenGL 4.2.
```

Affected versions: OpenGL 4.3

```text
error YS0713: The uniform buffer 'Data' takes 17600 bytes (std140), more than what is guaranteed
    by OpenGL 4.3 (16384 bytes). Affects: OpenGL 4.3.
```

Affected versions: OpenGL 4.4

```text
error YS0713: The uniform buffer 'Data' takes 17600 bytes (std140), more than what is guaranteed
    by OpenGL 4.4 (16384 bytes). Affects: OpenGL 4.4.
```

Affected versions: OpenGL 4.5

```text
error YS0713: The uniform buffer 'Data' takes 17600 bytes (std140), more than what is guaranteed
    by OpenGL 4.5 (16384 bytes). Affects: OpenGL 4.5.
```

Affected versions: OpenGL 4.6

```text
error YS0713: The uniform buffer 'Data' takes 17600 bytes (std140), more than what is guaranteed
    by OpenGL 4.6 (16384 bytes). Affects: OpenGL 4.6.
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
| 3.1 | Error |
| 3.2 | Error |
| 3.3 | Error |
| 4.0 | Error |
| 4.1 | Error |
| 4.2 | Warning |
| 4.3, 4.4, 4.5, 4.6 | valid |

Affected versions: OpenGL 2.0

```text
error YS0711: The compute shader 'CS' is not available in all graphics APIs: OpenGL 2.0: compute
    shaders arrive in OpenGL 4.3. Affects: OpenGL 2.0.
```

Affected versions: OpenGL 3.0

```text
error YS0711: The compute shader 'CS' is not available in all graphics APIs: OpenGL 3.0: compute
    shaders arrive in OpenGL 4.3. Affects: OpenGL 3.0.
```

Affected versions: OpenGL 3.1

```text
error YS0711: The compute shader 'CS' is not available in all graphics APIs: OpenGL 3.1: compute
    shaders arrive in OpenGL 4.3. Affects: OpenGL 3.1.
```

Affected versions: OpenGL 3.2

```text
error YS0711: The compute shader 'CS' is not available in all graphics APIs: OpenGL 3.2: compute
    shaders arrive in OpenGL 4.3. Affects: OpenGL 3.2.
```

Affected versions: OpenGL 3.3

```text
error YS0711: The compute shader 'CS' is not available in all graphics APIs: OpenGL 3.3: compute
    shaders arrive in OpenGL 4.3. Affects: OpenGL 3.3.
```

Affected versions: OpenGL 4.0

```text
error YS0711: The compute shader 'CS' is not available in all graphics APIs: OpenGL 4.0: compute
    shaders arrive in OpenGL 4.3. Affects: OpenGL 4.0.
```

Affected versions: OpenGL 4.1

```text
error YS0711: The compute shader 'CS' is not available in all graphics APIs: OpenGL 4.1: compute
    shaders arrive in OpenGL 4.3. Affects: OpenGL 4.1.
```

Affected versions: OpenGL 4.2

```text
warning YS0711: The compute shader 'CS' is not available in all graphics APIs: OpenGL 4.2: needs
    ARB_compute_shader (offered by most 4.2 drivers, not macOS). Affects: OpenGL 4.2.
```

The diagnostic ids are described in [Diagnostics](diagnostics.md).

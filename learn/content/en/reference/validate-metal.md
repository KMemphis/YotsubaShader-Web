---
title: "Validating for Metal"
summary: "What the analyzer rejects when a shader declares Metal, version by version, with the exact message of each diagnostic."
order: 24
---

Declare Metal with `[ShaderTargets]` and the analyzer reports everything the shader uses that this graphics API does not have. Declare it like this: `[ShaderTargets(Target.Metal_1)]`.

```csharp
using YotsubaShader.Compiler.Metadata;

[ShaderTargets(Target.Metal_4)]
public class MyShader { /* ... */ }
```

Versions: `Target.Metal_1`, `Target.Metal_2`, `Target.Metal_3`, `Target.Metal_4`.

## What each version has

`✓` guaranteed, `~` optional (a warning), `✗` not available (an error when you declare it), `·` not modeled.

| | 1 | 2 | 3 | 4 |
| --- | :---: | :---: | :---: | :---: |
| `double` | ✗ | ✗ | ✗ | ✗ |
| `half` | ✓ | ✓ | ✓ | ✓ |
| 16-bit integers | ✓ | ✓ | ✓ | ✓ |
| 64-bit integers | · | · | · | · |
| Compute shaders | ✓ | ✓ | ✓ | ✓ |
| Storage buffers | ✓ | ✓ | ✓ | ✓ |
| Storage textures | ✓ | ✓ | ✓ | ✓ |
| Storage textures without a format | ✓ | ✓ | ✓ | ✓ |
| `uint` | ✓ | ✓ | ✓ | ✓ |
| Bitwise operators | ✓ | ✓ | ✓ | ✓ |
| Texel fetch (`Load`) | ✓ | ✓ | ✓ | ✓ |
| Gather | ✓ | ✓ | ✓ | ✓ |
| Texture offsets | ✓ | ✓ | ✓ | ✓ |
| Texture size queries | ✓ | ✓ | ✓ | ✓ |
| Derivatives and implicit LOD | ✓ | ✓ | ✓ | ✓ |

**Notes**

- `double`, Metal 1–4: MSL has no double.

## Limits

The limits the analyzer checks. A shader that goes over one gets a diagnostic that names the version.

| | 1 | 2 | 3 | 4 |
| --- | :---: | :---: | :---: | :---: |
| Render targets | 8 | 8 | 8 | 8 |
| Vertex inputs | 31 | 31 | 31 | 31 |

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
| 1 | Error |
| 2 | Error |
| 3 | Error |
| 4 | Error |

Affected versions: Metal 1

```text
error YS0701: 'double' is not available in all graphics APIs: Metal 1: MSL has no double.
    Affects: Metal 1.
```

Affected versions: Metal 2

```text
error YS0701: 'double' is not available in all graphics APIs: Metal 2: MSL has no double.
    Affects: Metal 2.
```

Affected versions: Metal 3

```text
error YS0701: 'double' is not available in all graphics APIs: Metal 3: MSL has no double.
    Affects: Metal 3.
```

Affected versions: Metal 4

```text
error YS0701: 'double' is not available in all graphics APIs: Metal 4: MSL has no double.
    Affects: Metal 4.
```

The diagnostic ids are described in [Diagnostics](diagnostics.md).

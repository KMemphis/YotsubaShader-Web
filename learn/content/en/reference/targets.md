---
title: Graphics APIs and engines
summary: "[ShaderTargets] and [ShaderEngines]: tell the analyzer which graphics APIs and game engines your shader must run on, and see the errors while you type."
order: 9
---

A shader that works on one graphics API can fail on another: WebGPU has no `double`, OpenGL 3.3 has no compute shaders, OpenGL ES 2.0 writes one color. Yotsuba Shader checks this **while you write the shader**, in your editor and in the build, before you compile anything. You tell it which graphics APIs you care about with two attributes:

- `[ShaderTargets(Target...)]`: the graphics APIs and versions the shader must work on.
- `[ShaderEngines(GameEngine...)]`: the game engines whose own rules are checked too (today, Godot).

Both live in the `YotsubaShader.Compiler.Metadata` namespace. The package arrives by itself with any syntax package (`YotsubaShader.GlslSyntax` and the others), so there is nothing extra to install.

```csharp
using YotsubaShader.Compiler.Metadata;
```

## The default: Vulkan 1.3

Without any attribute the shader is checked against **Vulkan 1.3** only, and what Vulkan 1.3 does not guarantee is reported as a **warning**:

```csharp
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.Language;

namespace Cases;

public class Default
{
    [ShaderStage(Stage.Fragment)]
    [return: location(0)]
    public vec4 Fragment(PixelIn pixel)
    {
        double red = 1.0;   // double is optional in Vulkan (shaderFloat64)
        return new vec4((float)red, pixel.Uv.X, pixel.Uv.Y, 1f);
    }
}
```

```text
warning YS0701: 'double' is not available in all graphics APIs: Vulkan 1.3:
    optional (shaderFloat64). Affects: Vulkan 1.3.
```

`PixelIn` is the helper of the [tutorial](../get-started/index.md); any shader behaves the same. It is a warning because nothing says that you need other graphics APIs. Declaring them turns what they lack into an error.

## `[ShaderTargets]`: choose the graphics APIs

Put the attribute on the shader class. Combine graphics API versions with `|`:

```csharp
using YotsubaShader.Compiler.Metadata;
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.Language;

namespace Cases;

[ShaderTargets(Target.Vulkan_13 | Target.WebGpu)]
public class Web
{
    [ShaderStage(Stage.Fragment)]
    [return: location(0)]
    public vec4 Fragment(PixelIn pixel)
    {
        double red = 1.0;   // WebGPU has no double: error
        return new vec4((float)red, pixel.Uv.X, pixel.Uv.Y, 1f);
    }
}
```

```text
error YS0701: 'double' is not available in all graphics APIs: Vulkan 1.3:
    optional (shaderFloat64); WebGPU 1.0: does not exist in WGSL. Affects:
    Vulkan 1.3, WebGPU 1.0.
```

One diagnostic names every graphics API that fails and why. The severity depends on what each API says about the feature:

| The graphics API... | Severity of the diagnostic |
| --- | --- |
| does not have the feature (`Unavailable`) and you declared the API | **Error** |
| has it only with an extension, a driver feature or an option (`Optional`) | **Warning**, even if you declared the API |
| lacks it, but you did not declare any graphics API (the Vulkan 1.3 default) | **Warning** |

So `[ShaderTargets(Target.OpenGL_33)]` with `double` is a warning ("needs ARB_gpu_shader_fp64"), `Target.OpenGL_20` is an error, and `Target.OpenGL_46` is clean, because OpenGL 4.0 and later have `double`.

### The graphics API versions

`Target` is a `[Flags]` enum with one member per graphics API version, plus groups. Despite its name it lists graphics API versions, not output formats:

```csharp
// Vulkan
Target.Vulkan_10   Target.Vulkan_11   Target.Vulkan_12   Target.Vulkan_13   Target.Vulkan_14

// OpenGL
Target.OpenGL_20   Target.OpenGL_30   Target.OpenGL_31   Target.OpenGL_32   Target.OpenGL_33
Target.OpenGL_40   Target.OpenGL_41   Target.OpenGL_42   Target.OpenGL_43   Target.OpenGL_44
Target.OpenGL_45   Target.OpenGL_46

// OpenGL ES (and WebGL)
Target.OpenGLES_20   Target.OpenGLES_30   Target.OpenGLES_31   Target.OpenGLES_32

// DirectX (the number is the Direct3D version; DirectX_90c is Shader Model 3)
Target.DirectX_80   Target.DirectX_81   Target.DirectX_90   Target.DirectX_90c
Target.DirectX_10   Target.DirectX_11   Target.DirectX_12

// Metal
Target.Metal_1   Target.Metal_2   Target.Metal_3   Target.Metal_4

// WebGPU
Target.WebGpu

// Groups
Target.AllVulkan   Target.AllOpenGL   Target.AllOpenGLES   Target.AllDirectX   Target.AllMetal   Target.All
```

### Versions that no backend generates

Some versions exist in the enum but YotsubaShader cannot generate code for them: Vulkan 1.0 (the compiler writes SPIR-V 1.3 or later) and DirectX 8.0, 8.1 and 9.0 (the HLSL it generates starts at Shader Model 3.0). Declaring one is an error:

```csharp
[ShaderTargets(Target.Vulkan_10)]
public class Old { /* ... */ }
```

```text
error YS0712: No YotsubaShader backend generates Vulkan 1.0 (the CLI does not
    produce that language or version). Remove that version from
    [ShaderTargets] or use a later one.
```

`Target.All`, `Target.AllVulkan` and `Target.AllDirectX` include those versions, so they report YS0712 too. List the versions you want instead:

```csharp
[ShaderTargets(Target.Vulkan_11 | Target.Vulkan_12 | Target.Vulkan_13 | Target.Vulkan_14 |
               Target.OpenGL_43 | Target.OpenGLES_31 | Target.DirectX_11 | Target.DirectX_12 |
               Target.AllMetal | Target.WebGpu)]
public class Triangle { /* ... */ }
```

### One attribute for the whole project

On the assembly, the attribute applies to every shader class that has no attribute of its own. Put it in any file of the project:

```csharp
using YotsubaShader.Compiler.Metadata;

[assembly: ShaderTargets(Target.Vulkan_13 | Target.OpenGL_46 | Target.DirectX_12)]
```

The order of precedence is: the class (or the class that contains it), then the assembly, then the Vulkan 1.3 default. A class with its own `[ShaderTargets]` ignores the assembly one; it does not add to it.

## What is checked

These are the features and limits the analyzer knows for each graphics API version. A feature it does not know is never reported (the analyzer only complains about what it can prove).

```csharp
[ShaderTargets(Target.OpenGL_33 | Target.Vulkan_13)]
public class Doubler
{
    // YS0711: storage buffers arrive in OpenGL 4.3
    [buffer, layout(0, 0)]
    public float[] Values;

    // YS0711: compute shaders arrive in OpenGL 4.3
    [ShaderStage(Stage.Compute)]
    [layout_local_size(64)]
    public void Main([gl_GlobalInvocationID] uvec3 id)
    {
        Values[(int)id.X] = Values[(int)id.X] * 2f;
    }
}
```

```text
error YS0711: The storage buffer 'Values' is not available in all graphics
    APIs: OpenGL 3.3: storage buffers arrive in OpenGL 4.3. Affects: OpenGL
    3.3.
error YS0711: The compute shader 'Main' is not available in all graphics APIs:
    OpenGL 3.3: compute shaders arrive in OpenGL 4.3. Affects: OpenGL 3.3.
```

| Diagnostic | What it reports |
| --- | --- |
| `YS0701` | A type the API lacks or only has optionally: `double`, `half`, 16-bit and 64-bit integers. |
| `YS0711` | A feature the API lacks: compute shaders, storage buffers and storage textures. |
| `YS0704` | A limit: render targets, vertex inputs, variables between stages, work group size. |
| `YS0705` | A resource the API cannot take: a storage texture without a declared format, or a descriptor set number above what the API guarantees. |
| `YS0712` | A graphics API version that no backend generates. |

Limits are always a **warning**, because they are guarantees ("OpenGL ES 2.0 guarantees 1 render target"), not hard failures on every device:

```csharp
public struct TwoColors
{
    [location(0)] public vec4 Color;
    [location(1)] public vec4 Glow;   // a second render target
}

[ShaderTargets(Target.OpenGLES_20 | Target.Vulkan_13)]
public class Mrt
{
    [ShaderStage(Stage.Fragment)]
    public TwoColors Fragment(PixelIn pixel) { /* ... */ }
}
```

```text
warning YS0704: 'Fragment' uses 2 render targets; OpenGL ES 2.0 guarantees 1.
    Affects: OpenGL ES 2.0.
```

## `[ShaderEngines]`: game engines

An engine adds its own rules on top of the graphics API. Godot, for example, has no compute shaders and no storage buffers in its shading language, and a fragment writes a single color:

```csharp
using YotsubaShader.Compiler.Metadata;

[ShaderEngines(GameEngine.Godot)]
public class ForGodot
{
    [buffer, layout(0, 0)]
    public float[] Values;

    [ShaderStage(Stage.Compute)]
    [layout_local_size(64)]
    public void Main([gl_GlobalInvocationID] uvec3 id) { /* ... */ }
}
```

```text
warning YS0710: 'Values' is a storage buffer and Godot Shading Language does
    not have them; use a uniform or a texture. Affects: Godot.
warning YS0710: 'Main' is a compute shader and Godot Shading Language has no
    compute (only vertex and fragment). Affects: Godot.
```

`[ShaderEngines]` goes on a class or on the assembly, like `[ShaderTargets]`, and the two combine: a shader can declare `[ShaderTargets(Target.Vulkan_13)]` and `[ShaderEngines(GameEngine.Godot)]` at the same time. Engines that are not in `GameEngine` need nothing: MonoGame, KNI and FNA compile shaders to the API they run on, so you declare that API with `[ShaderTargets]`.

## The output format is a separate decision

`[ShaderTargets]` only controls the checks you see while you write. The **output format** (the language the compiler writes: `spirv`, `glsl`, `hlsl`...) is still what you ask for with `--target` in [`add`](add.md) and [`compile`](compile.md). That flag is called `--target`, but it takes output formats, not graphics API versions. Each shader fails on its own if it cannot be generated:

```bash
yotsuba compile MyShaders/MyShaders.csproj --target spirv --output out
```

```text
Cases.Web: no se compiló.
The shader has errors:
  Web.cs(16,16): error YS0701: 'double' is not available in all graphics APIs:
      Vulkan 1.3: optional (shaderFloat64); WebGPU 1.0: does not exist in
      WGSL. Affects: Vulkan 1.3, WebGPU 1.0.
3 shader(s) con errores; se compilaron 5.
```

The shaders with an error are skipped, the rest are written, and the exit code is `1`. A shader that only has warnings compiles.

## Change the severity

Every diagnostic can be tuned in `.editorconfig`:

```ini
# A warning you do not want
dotnet_diagnostic.YS0701.severity = none

# Treat the limits as errors
dotnet_diagnostic.YS0704.severity = error
```

## The language of the messages

The messages are written in English and translated to Spanish. They appear in Spanish when your editor or your `dotnet` run uses a Spanish interface language, and in English otherwise. The ID (`YS0701`) is the same in both. Every diagnostic has a page in [the rules list](https://github.com/KMemphis/YotsubaShader/blob/main/docs/rules/README.md).

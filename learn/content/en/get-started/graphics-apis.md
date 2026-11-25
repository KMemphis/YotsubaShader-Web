---
title: Check your shader for each graphics API
summary: Tell the analyzer which graphics APIs and game engines your shader must work on, and learn to read the errors it gives you.
order: 19.5
---

A **graphics API** is what a program uses to talk to the GPU: Vulkan, OpenGL, Direct3D, Metal, WebGPU. They are not identical. Something that exists in one may not exist in another, and your shader has to work on all the ones your players use.

Take `double`, a number with twice the precision of a `float`:

| Graphics API | Does it have `double`? |
| --- | --- |
| OpenGL 4.0 or later | Yes |
| Vulkan, Direct3D 11 | Only on some GPUs |
| OpenGL ES (phones), Metal, WebGPU | No |

A shader that uses `double` runs on your computer and fails on a phone. Yotsuba Shader warns you about that **while you type**, before the compiler writes anything. In this chapter you make it complain on purpose, to learn how to read what it says.

Three words have a fixed meaning in this chapter, because they sound alike:

- **Analyzer**: the part of Yotsuba Shader that reads your shader in your editor and in `dotnet build`, and reports problems. It writes no files.
- **Compiler**: the part that writes the shader in the format the GPU understands. You run it with `yotsuba add`.
- **Output format**: what you ask the compiler to write, with `--target` (`spirv`, `glsl`, `hlsl`...). It is **not** the same as the graphics APIs of this chapter: the output format decides what is written, the graphics APIs decide what the analyzer warns about. The attribute you will use is called `[ShaderTargets]`, but it lists graphics APIs, not output formats.

> [!NOTE]
> The attributes of this chapter arrive with version 0.9.4 of the packages. `YotsubaShader.GlslSyntax` brings them along, so you do not add any package.

## Step 1: use something not every graphics API has

Copy `Gradient.cs` as `Precise.cs`, rename the class to `Precise`, and change the `Fragment` method so that it calculates the green with a `double`:

```csharp
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.Language;

namespace MyShaders;

public class Precise
{
    [ShaderStage(Stage.Vertex)]
    public Pixel Vertex(Corner corner)
    {
        Pixel pixel;
        pixel.Position = new vec4(corner.Position.X, corner.Position.Y, 0f, 1f);
        pixel.Uv = corner.Uv;
        return pixel;
    }

    [ShaderStage(Stage.Fragment)]
    [return: location(0)]
    public vec4 Fragment(PixelIn pixel)
    {
        double green = 0.25 + 0.6 * pixel.Uv.Y;     // double, not float
        return new vec4(1f, (float)green, 0.45f, 1f);
    }
}
```

Your C# project still builds, but the analyzer underlines `double` and `dotnet build` prints a warning. In your editor it is one long line; here it is split so that it fits:

```text
warning YS0701: 'double' is not available in all graphics APIs: Vulkan 1.3:
    optional (shaderFloat64). Affects: Vulkan 1.3.
```

It says four things, in this order:

- `warning`: it does not stop the build.
- `YS0701`: the code of the problem. Every message has one, and the [list of rules](https://github.com/KMemphis/YotsubaShader/blob/main/docs/rules/README.md) explains each.
- `'double' is not available in all graphics APIs`: what you used.
- `Vulkan 1.3: optional (shaderFloat64)`: **which graphics API** fails and why. In Vulkan, `double` only exists on GPUs that declare the capability called `shaderFloat64`.

You did not tell the analyzer which graphics APIs matter to you, so it checked against **Vulkan 1.3**, the default one. When you have not said, a problem is only a warning.

## Step 2: say which graphics APIs the shader must work on

Now suppose this shader must also run on the web, with WebGPU. Add two things to `Precise.cs`: a `using` and an attribute above the class.

```csharp
using YotsubaShader.Compiler.Metadata;     // new

// ...the other usings and the namespace stay the same

[ShaderTargets(Target.Vulkan_13 | Target.WebGpu)]     // new
public class Precise
{
    // ...Vertex and Fragment stay the same
}
```

The attribute lists the graphics APIs the shader must work on: Vulkan 1.3 **and** WebGPU (`|` combines them, like any C# flags). Each member of `Target` is one version of one graphics API, such as `Target.Vulkan_13` or `Target.OpenGL_33`. The warning becomes an error:

```text
error YS0701: 'double' is not available in all graphics APIs: Vulkan 1.3:
    optional (shaderFloat64); WebGPU 1.0: does not exist in WGSL. Affects:
    Vulkan 1.3, WebGPU 1.0.
```

Now the message lists **every graphics API that fails, each with its reason**. WebGPU says `does not exist in WGSL`: its shader language has no `double` at all, so on that one there is nothing to do except not using it.

This is what decides between a warning and an error:

- The graphics API **does not have** what you use, and you listed it: **error**.
- The graphics API has it **only sometimes** (it needs an extension, or a capability the GPU may not declare): **warning**, even if you listed it.
- You listed none: always **warning**.

## Step 3: fix it

You have three ways out. Pick according to what you need:

```csharp
// 1. Use float, which every graphics API has. Almost always the right answer.
float green = 0.25f + 0.6f * pixel.Uv.Y;
```

```csharp
// 2. Stop listing WebGPU, if this shader will never go to the web.
[ShaderTargets(Target.Vulkan_13)]
```

```csharp
// 3. List only graphics APIs that have double. OpenGL has it since version 4.0.
[ShaderTargets(Target.OpenGL_46)]
```

With the third one there is nothing to report. With `Target.OpenGL_33` you would see a warning (`needs ARB_gpu_shader_fp64`: OpenGL 3.3 only has `double` through an extension), and with `Target.OpenGL_20`, an error.

## Step 4: list the graphics APIs your players use

A typical list:

```csharp
[ShaderTargets(
    Target.Vulkan_13 |      // Vulkan 1.3
    Target.OpenGL_33 |      // OpenGL 3.3
    Target.OpenGLES_30 |    // OpenGL ES 3.0 (phones and WebGL 2)
    Target.DirectX_11 |     // Direct3D 11
    Target.Metal_3 |        // Metal 3 (Apple)
    Target.WebGpu)]         // WebGPU (browser)
public class Precise { /* ... */ }
```

The more graphics APIs you list, the more the analyzer tells you. That is the point: you find out now, not when a player opens your game.

To avoid repeating the attribute on every class, put it once on the whole C# project, in any file:

```csharp
using YotsubaShader.Compiler.Metadata;

[assembly: ShaderTargets(Target.Vulkan_13 | Target.OpenGL_33 | Target.DirectX_11)]
```

A class with its own `[ShaderTargets]` ignores this one.

> [!WARNING]
> Do not use `Target.All`, `AllVulkan` or `AllDirectX`: they include versions that the compiler cannot write (Vulkan 1.0 and DirectX 8 and 9.0), so they give `error YS0712: No YotsubaShader backend generates Vulkan 1.0`. List the versions you want, as above.

## Step 5: it is not only `double`

For each graphics API you list, the analyzer also checks other things. For example, compute shaders and storage buffers only arrive in OpenGL 4.3:

```csharp
[ShaderTargets(Target.OpenGL_33)]
public class Doubler
{
    [buffer, layout(0, 0)]
    public float[] Values;       // error: storage buffers arrive in OpenGL 4.3

    [ShaderStage(Stage.Compute)]
    [layout_local_size(64)]
    public void Main([gl_GlobalInvocationID] uvec3 id)    // error: compute shaders arrive in OpenGL 4.3
    {
        Values[(int)id.X] = Values[(int)id.X] * 2f;
    }
}
```

It also checks the limits of each graphics API, such as how many colors a Fragment can return (OpenGL ES 2.0 guarantees only one). The [reference](../reference/targets.md) lists everything.

## The compiler does not change

The attribute only decides what the **analyzer** tells you. What the **compiler** writes is still decided by the output formats you ask for with `--target`, as you saw in [the CLI](cli.md). There is one link between them: the compiler does not write a shader that has errors. If `Precise` still has the WebGPU error and you run:

```bash
yotsuba add MyShaders/MyShaders.csproj --target spirv
```

the compiler prints the error, skips `Precise` and writes the rest:

```text
MyShaders.Precise: no se compiló.
The shader has errors:
  Precise.cs(25,16): error YS0701: 'double' is not available in all graphics
      APIs: Vulkan 1.3: optional (shaderFloat64); WebGPU 1.0: does not exist
      in WGSL. Affects: Vulkan 1.3, WebGPU 1.0.
1 shader(s) con errores; se compilaron 5.
```

A shader with only warnings is written. With a `double` you may also see lines such as `Aviso: Precise.ToGlslEs(Fragment): FP64 not supported in ES profile.`: `add` always writes the five formats of [the CLI](cli.md), and OpenGL ES has no `double`, so that format cannot be written for this shader. It does not stop anything.

:::godot
## Godot has its own rules

Godot is not a graphics API but a game engine with its own shading language, which does not accept everything. Declare it with `[ShaderEngines]`, next to `[ShaderTargets]`:

```csharp
[ShaderTargets(Target.Vulkan_13 | Target.OpenGL_33)]
[ShaderEngines(GameEngine.Godot)]
public class Precise { /* ... */ }
```

With `GameEngine.Godot` the analyzer warns about what Godot cannot do, such as compute shaders or storage buffers:

```text
warning YS0710: 'Main' is a compute shader and Godot Shading Language has no
    compute (only vertex and fragment). Affects: Godot.
```
:::

:::xna
## What about {{engine}}?

{{engine}} does not need an attribute of its own: it runs your shader on the graphics API your game uses. List that graphics API in `[ShaderTargets]`. For example, a game that ships an OpenGL version and a Direct3D 11 version:

```csharp
[ShaderTargets(Target.OpenGL_33 | Target.DirectX_11)]
public class Precise { /* ... */ }
```
:::

:::raylib
## What about {{engine}}?

{{engine}} does not need an attribute of its own: it runs your shader on OpenGL 3.3, the version raylib uses. List that graphics API in `[ShaderTargets]`:

```csharp
[ShaderTargets(Target.OpenGL_33)]
public class Precise { /* ... */ }
```
:::

:::silknet
## What about {{engine}}?

{{engine}} does not need an attribute of its own: it runs your shader on the graphics API you picked in the viewer chapter. List that graphics API in `[ShaderTargets]`, or all four with `|` if the same shader has to work in each of them:

```csharp
[ShaderTargets(Target.OpenGL_33 | Target.OpenGLES_30 | Target.Vulkan_13 | Target.WebGpu)]
public class Precise { /* ... */ }
```
:::

## What you learned

- Without an attribute, the analyzer checks against **Vulkan 1.3** only, and only warns.
- `[ShaderTargets(Target.A | Target.B)]` on a class (or `[assembly: ShaderTargets(...)]` on the whole C# project) lists the graphics APIs the shader must work on.
- What a graphics API does not have is an **error** if you listed it, and a **warning** if it only has it sometimes.
- A message gives the code (`YS0701`), what you used, and **which graphics API** fails and why.
- The attribute decides what the analyzer reports; `--target` decides which output formats the compiler writes.

Next: [What now?](next-steps.md).

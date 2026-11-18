---
title: Time
summary: How to make a shader move, using the clock the program hands it.
order: 12
---

So far your images are still. A real shader moves: water ripples, fire flickers, light changes. And the surprise is that, to achieve that, **you need nothing new**. You already know everything necessary.

## How something moves when it has no memory

Here is an idea worth understanding well, because it is the opposite of what you do in a normal game.

In a normal game, to move a ball, you save its position in a variable and change it a little on every frame. Your program **remembers** where it was.

A shader remembers nothing. On every frame it starts from zero: it runs, returns the color, and forgets everything. It cannot say "the ball was here and now I move it a little".

So how does something move? With a very simple trick: **the program tells it what time it is**. The shader receives a number, the seconds that have passed since it started, and computes the ball's position **from that number**. At 2 seconds, the ball is here. At 3, it is there. On every frame, the clock reads something different, and that is why the image changes.

That number is a uniform, just like the window's width and height. And you already know how it is declared.

## Step 1: add the clock

Open `MyShaders/Context.cs` and add a third field:

```csharp title="MyShaders/Context.cs"
namespace MyShaders;

public struct Context
{
    public float Width;
    public float Height;
    public float Seconds;
}
```

With that, `Data.Seconds` exists. The viewer already knows how to fill it: on every frame it looks for `Data_Seconds` and sets it to the time it has been open.

Copy `Template.cs` as `Time.cs`, change the class name to `Time` and declare the uniform, as always. At the top:

```csharp style=glsl
using YotsubaShader.GlslSyntax.Resources;
```

```csharp style=hlsl
using YotsubaShader.HlslSyntax.Resources;
```

```csharp style=msl
using YotsubaShader.MslSyntax.Resources;
```

```csharp style=wgsl
using YotsubaShader.WgslSyntax.Resources;
```

```csharp style=spirv
using YotsubaShader.SpirvSyntax.Resources;
```

And before `Vertex`:

```csharp style=glsl
    [uniform, layout(0, 0)]
    public Context Data;
```

```csharp style=hlsl
    [cbuffer, register("b0")]
    public Context Data;
```

```csharp style=msl
    [constant, buffer(0)]
    public Context Data;
```

```csharp style=wgsl
    [uniform, @group(0), @binding(0)]
    public Context Data;
```

```csharp style=spirv
    [Uniform, DescriptorSet(0), Binding(0)]
    public Context Data;
```

## Step 2: a color that comes and goes

Replace the line in `Fragment` with this one:

```csharp
float t = Data.Seconds % 1f;
return Make.Vec4(t, t, t, 1f);
```

Run the work cycle:

But first, tell the viewer about the new shader. In `Viewer/Program.cs`, add this line to the `switch`, above the `_ =>` line:

```csharp
            "Time" => new Time().ToMGFX(gl),
```

Now run it:

```bash
dotnet yotsuba add MyShaders/MyShaders.csproj --target spirv && dotnet run --project Viewer -- Time
```

The window gets lighter and lighter for one second, and suddenly goes back to black, and repeats. Why?

`Data.Seconds` grows without stopping: `0.1, 0.5, 1.2, 2.7, ...`. But `% 1f` only keeps the decimal part, as in the coordinates chapter, so `t` rises from `0` to `1` and starts over. It is the same technique as the stripes, but in time instead of space.

The abrupt jump from white to black is not very pleasant. Let us fix it so it goes up and down, without jumps.

## Step 3: up and down without jumps

If `t` rises from `0` to `1`, for it to then **go down** we can make it start going backwards once it passes the halfway point. Replace the contents with this:

```csharp
float t = Data.Seconds % 1f;
if (t > 0.5f)
{
    t = 1f - t;
}
float brightness = t * 2f;
return Make.Vec4(brightness, brightness, brightness, 1f);
```

See how `t` behaves as time passes:

| `Seconds % 1` | `t` after the `if` | `brightness` |
|---|---|---|
| 0.0 | 0.0 | 0.0 |
| 0.25 | 0.25 | 0.5 |
| 0.5 | 0.5 | 1.0 |
| 0.75 | 0.25 (because `1 - 0.75`) | 0.5 |
| 1.0 → goes back to 0 | 0.0 | 0.0 |

It rises from `0` to `1` in half a second and falls from `1` to `0` in the other half. The light **breathes**, without jumps. This up and down is called a triangle wave, because drawn on paper it looks like a row of triangles.

Change the `1f` of the `%` to `3f`, and it will breathe slower: three seconds per full turn. Change `Data.Seconds` to `Data.Seconds * 4f` and it will go four times faster. Multiplying the time is how you control the speed.

## Step 4: a bouncing ball

Now combine what you already know: a circle, and a position that depends on time. Replace `Fragment` with this:

```csharp
float aspect = Data.Width / Data.Height;
float x = pixel.Uv.X * aspect;
float y = pixel.Uv.Y;

float progress = (Data.Seconds * 0.4f) % 2f;
if (progress > 1f)
{
    progress = 2f - progress;
}
float centerX = 0.15f + progress * (aspect - 0.3f);

float dx = x - centerX;
float dy = y - 0.5f;
if (dx * dx + dy * dy < 0.12f * 0.12f)
{
    return Make.Vec4(1f, 0.5f, 0.1f, 1f);
}
return Make.Vec4(0.1f, 0.1f, 0.2f, 1f);
```

Run the work cycle and watch the ball go from one side to the other. Let us take it apart:

1. `progress` does the same as `t` in the previous step, but goes from `0` to `1` and from `1` to `0` in 5 seconds: `Seconds * 0.4` makes it take 2.5 seconds in each direction, and `% 2f` together with the `if` produces the back and forth.
2. `progress` is "what part of the trip I am on": `0` is the left end and `1` the right one.
3. `centerX = 0.15f + progress * (aspect - 0.3f)` turns that number into a position on the screen, leaving a margin of `0.15` on each side. It is a **mix** (like the one from the previous chapter): it goes from `0.15` to `aspect - 0.15`.
4. The rest is the usual circle, with its center at `centerX`.

Notice something: the shader never "moved" the ball. Every time, it simply works out **where it should be** and draws it there.

## Step 5: let it change color too

One last improvement, to practice mixing. Add this function inside the `Time` class, after `Fragment`:

```csharp
    public static float Mix(float a, float b, float t)
    {
        return a + (b - a) * t;
    }
```

And in `Fragment`, change the ball's `return` to this:

```csharp
    float green = Mix(0.3f, 0.9f, progress);
    return Make.Vec4(1f, green, 0.1f, 1f);
```

That is: the `return` line that was inside the `if` is replaced by these two. Now the green depends on `progress`, and the ball is reddish at the left end and turns yellow when it reaches the right one.

This is how it looks at three different moments:

| 0 seconds | 1.25 seconds | 2.5 seconds |
|---|---|---|
| ![The orange ball at the left end](../../assets/get-started/taller/ti3-a.png) | ![The orange ball in the center](../../assets/get-started/taller/ti3-b.png) | ![The orange ball at the right end](../../assets/get-started/taller/ti3-c.png) |

It makes sense for the color to depend on `progress`: `progress` is the only thing the shader knows about "what point of the trip am I at".

## What else can be done with time

With what you have you can already do a lot: lights that flicker, a sun that rises, bars that grow, colors that pass from one to another. And triangle waves are a good tool.

But there is a wave smoother than the triangle one, the sine (`sin`). It is the one almost all shaders use for natural movements: waves, pulses, breathing. In Yotsuba Shader you cannot use `sin` from C# yet, but it is marked as pending and you will see it in the plasma chapter. Meanwhile, the triangle wave does the same job with a little less grace.

## All together

This is the complete file of the ball that bounces and changes color:

```csharp style=glsl title="MyShaders/Time.cs"
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Resources;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.Language;

namespace MyShaders;

public class Time
{
    [uniform, layout(0, 0)]
    public Context Data;

    [ShaderStage(Stage.Vertex)]
    public Pixel Vertex(Corner corner)
    {
        Pixel pixel;
        pixel.Position = Make.Vec4(corner.Position.X, corner.Position.Y, 0f, 1f);
        pixel.Uv = corner.Uv;
        return pixel;
    }

    [ShaderStage(Stage.Fragment)]
    [return: location(0)]
    public vec4 Fragment(Pixel pixel)
    {
        float aspect = Data.Width / Data.Height;
        float x = pixel.Uv.X * aspect;
        float y = pixel.Uv.Y;

        float progress = (Data.Seconds * 0.4f) % 2f;
        if (progress > 1f)
        {
            progress = 2f - progress;
        }
        float centerX = 0.15f + progress * (aspect - 0.3f);

        float dx = x - centerX;
        float dy = y - 0.5f;
        if (dx * dx + dy * dy < 0.12f * 0.12f)
        {
            float green = Mix(0.3f, 0.9f, progress);
            return Make.Vec4(1f, green, 0.1f, 1f);
        }
        return Make.Vec4(0.1f, 0.1f, 0.2f, 1f);
    }

    public static float Mix(float a, float b, float t)
    {
        return a + (b - a) * t;
    }
}
```

```csharp style=hlsl title="MyShaders/Time.cs"
using YotsubaShader.HlslSyntax;
using YotsubaShader.HlslSyntax.Resources;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.Language;

namespace MyShaders;

public class Time
{
    [cbuffer, register("b0")]
    public Context Data;

    [ShaderStage(Stage.Vertex)]
    public Pixel Vertex(Corner corner)
    {
        Pixel pixel;
        pixel.Position = Make.Vec4(corner.Position.X, corner.Position.Y, 0f, 1f);
        pixel.Uv = corner.Uv;
        return pixel;
    }

    [ShaderStage(Stage.Fragment)]
    [return: SV_Target]
    public vec4 Fragment(Pixel pixel)
    {
        float aspect = Data.Width / Data.Height;
        float x = pixel.Uv.X * aspect;
        float y = pixel.Uv.Y;

        float progress = (Data.Seconds * 0.4f) % 2f;
        if (progress > 1f)
        {
            progress = 2f - progress;
        }
        float centerX = 0.15f + progress * (aspect - 0.3f);

        float dx = x - centerX;
        float dy = y - 0.5f;
        if (dx * dx + dy * dy < 0.12f * 0.12f)
        {
            float green = Mix(0.3f, 0.9f, progress);
            return Make.Vec4(1f, green, 0.1f, 1f);
        }
        return Make.Vec4(0.1f, 0.1f, 0.2f, 1f);
    }

    public static float Mix(float a, float b, float t)
    {
        return a + (b - a) * t;
    }
}
```

```csharp style=msl title="MyShaders/Time.cs"
using YotsubaShader.MslSyntax;
using YotsubaShader.MslSyntax.Resources;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.Language;

namespace MyShaders;

public class Time
{
    [constant, buffer(0)]
    public Context Data;

    [ShaderStage(Stage.Vertex)]
    public Pixel Vertex(Corner corner)
    {
        Pixel pixel;
        pixel.Position = Make.Vec4(corner.Position.X, corner.Position.Y, 0f, 1f);
        pixel.Uv = corner.Uv;
        return pixel;
    }

    [ShaderStage(Stage.Fragment)]
    [return: color(0)]
    public vec4 Fragment(Pixel pixel)
    {
        float aspect = Data.Width / Data.Height;
        float x = pixel.Uv.X * aspect;
        float y = pixel.Uv.Y;

        float progress = (Data.Seconds * 0.4f) % 2f;
        if (progress > 1f)
        {
            progress = 2f - progress;
        }
        float centerX = 0.15f + progress * (aspect - 0.3f);

        float dx = x - centerX;
        float dy = y - 0.5f;
        if (dx * dx + dy * dy < 0.12f * 0.12f)
        {
            float green = Mix(0.3f, 0.9f, progress);
            return Make.Vec4(1f, green, 0.1f, 1f);
        }
        return Make.Vec4(0.1f, 0.1f, 0.2f, 1f);
    }

    public static float Mix(float a, float b, float t)
    {
        return a + (b - a) * t;
    }
}
```

```csharp style=wgsl title="MyShaders/Time.cs"
using YotsubaShader.WgslSyntax;
using YotsubaShader.WgslSyntax.Resources;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.Language;

namespace MyShaders;

public class Time
{
    [uniform, @group(0), @binding(0)]
    public Context Data;

    [ShaderStage(Stage.Vertex)]
    public Pixel Vertex(Corner corner)
    {
        Pixel pixel;
        pixel.Position = Make.Vec4(corner.Position.X, corner.Position.Y, 0f, 1f);
        pixel.Uv = corner.Uv;
        return pixel;
    }

    [ShaderStage(Stage.Fragment)]
    [return: location(0)]
    public vec4 Fragment(Pixel pixel)
    {
        float aspect = Data.Width / Data.Height;
        float x = pixel.Uv.X * aspect;
        float y = pixel.Uv.Y;

        float progress = (Data.Seconds * 0.4f) % 2f;
        if (progress > 1f)
        {
            progress = 2f - progress;
        }
        float centerX = 0.15f + progress * (aspect - 0.3f);

        float dx = x - centerX;
        float dy = y - 0.5f;
        if (dx * dx + dy * dy < 0.12f * 0.12f)
        {
            float green = Mix(0.3f, 0.9f, progress);
            return Make.Vec4(1f, green, 0.1f, 1f);
        }
        return Make.Vec4(0.1f, 0.1f, 0.2f, 1f);
    }

    public static float Mix(float a, float b, float t)
    {
        return a + (b - a) * t;
    }
}
```

```csharp style=spirv title="MyShaders/Time.cs"
using YotsubaShader.SpirvSyntax;
using YotsubaShader.SpirvSyntax.Resources;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.Language;

namespace MyShaders;

public class Time
{
    [Uniform, DescriptorSet(0), Binding(0)]
    public Context Data;

    [ShaderStage(Stage.Vertex)]
    public Pixel Vertex(Corner corner)
    {
        Pixel pixel;
        pixel.Position = Make.Vec4(corner.Position.X, corner.Position.Y, 0f, 1f);
        pixel.Uv = corner.Uv;
        return pixel;
    }

    [ShaderStage(Stage.Fragment)]
    [return: Location(0)]
    public vec4 Fragment(Pixel pixel)
    {
        float aspect = Data.Width / Data.Height;
        float x = pixel.Uv.X * aspect;
        float y = pixel.Uv.Y;

        float progress = (Data.Seconds * 0.4f) % 2f;
        if (progress > 1f)
        {
            progress = 2f - progress;
        }
        float centerX = 0.15f + progress * (aspect - 0.3f);

        float dx = x - centerX;
        float dy = y - 0.5f;
        if (dx * dx + dy * dy < 0.12f * 0.12f)
        {
            float green = Mix(0.3f, 0.9f, progress);
            return Make.Vec4(1f, green, 0.1f, 1f);
        }
        return Make.Vec4(0.1f, 0.1f, 0.2f, 1f);
    }

    public static float Mix(float a, float b, float t)
    {
        return a + (b - a) * t;
    }
}
```

## What you learned

- A shader has no memory: it does not remember the previous frame.
- To animate, the program passes the time as a uniform and the shader **computes** the result from that number.
- `%` turns a time that grows without stopping into a cycle that repeats.
- With an `if` and `1 - t` you get a number that goes up and then down, without jumps.
- Multiplying the time changes the speed.

Next: [Shader 2: a fractal](mandelbrot.md).

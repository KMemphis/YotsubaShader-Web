---
title: Functions and structs
summary: How to keep order in a growing shader, by writing your own functions and your own data types.
order: 9
---

As a shader grows, it starts to repeat itself. You are going to see that problem in action by drawing a face. First you will draw it in the most direct way, you will notice the code getting heavy, and then you will fix it with functions. That is the right order to learn this: feel the problem before using the tool.

## Step 1: the sky and the measures

Copy `Template.cs` as `Face.cs` and change the class name to `Face`.

This time we are going to measure in a more comfortable way. Instead of `X` and `Y` going from `0` to `1`, we will make **the window's height measure 1** and the width measure whatever corresponds. This way a circle of radius `0.4` is round without having to compensate every time.

Since we need the window size, declare the uniform, just like in the previous chapters. At the top, with the `using` lines:

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

And inside the class, before `Vertex`:

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

Now replace `Fragment` with this:

```csharp
float aspect = Data.Width / Data.Height;
float x = pixel.Uv.X * aspect;
float y = pixel.Uv.Y;
float middle = aspect * 0.5f;

vec4 color = Make.Vec4(0.55f, 0.8f, 1f, 1f);

return color;
```

- `x` now goes from `0` to `aspect` (with an 800 by 450 window, from `0` to `1.78`), and `y` goes from `0` to `1`.
- `middle` is half the width: the center of the window horizontally.
- `color` is a variable of type `vec4`. It starts as the sky color, and we are going to **change** it if the pixel falls inside some object.

Run the work cycle:

But first, tell the viewer about the new shader. In `Viewer/Program.cs`, add this line to the `switch`, above the `_ =>` line:

```csharp
            "Face" => new Face().ToMGFX(gl),
```

Now run it:

```bash
dotnet yotsuba add MyShaders/MyShaders.csproj --target spirv && dotnet run --project Viewer -- Face
```

You will see a window of a plain sky blue. It is not much, but it is the base of everything.

## Step 2: the head

Add this **between** the `vec4 color = ...` line and the `return color;`:

```csharp
float dx = x - middle;
float dy = y - 0.5f;
if (dx * dx + dy * dy < 0.4f * 0.4f)
{
    color = Make.Vec4(1f, 0.85f, 0.2f, 1f);
}
```

It is the circle from the previous chapter: center at `(middle, 0.5)`, radius `0.4`. But with an important difference: instead of doing `return` inside the `if`, we **change the `color` variable**. This way the shader keeps going and can still paint more things on top.

Run the work cycle. You will see a yellow circle on the sky.

## Step 3: the eyes

Now two eyes. Add this right below the previous code, always before the `return color;`:

```csharp
dx = x - (middle - 0.15f);
dy = y - 0.4f;
if (dx * dx + dy * dy < 0.06f * 0.06f)
{
    color = Make.Vec4(0.1f, 0.1f, 0.1f, 1f);
}

dx = x - (middle + 0.15f);
dy = y - 0.4f;
if (dx * dx + dy * dy < 0.06f * 0.06f)
{
    color = Make.Vec4(0.1f, 0.1f, 0.1f, 1f);
}
```

Notice that we reuse `dx` and `dy` (without writing `float` again): we just give them a new value. One eye is `0.15` to the left of the center and the other `0.15` to the right.

Run the work cycle. You now have a face with two eyes. And there is another important idea hidden here: **the order in which you paint matters**. The eyes come after the head, so they are painted on top. If you put the eyes first and the head after, the head would cover them.

## Step 4: the mouth

The mouth will be a rectangle. Add this, also before the `return`:

```csharp
if (x > middle - 0.15f && x < middle + 0.15f && y > 0.65f && y < 0.7f)
{
    color = Make.Vec4(0.1f, 0.1f, 0.1f, 1f);
}
```

Run the work cycle.

![A yellow face with two black eyes and a straight mouth, on a light blue sky](../../assets/get-started/taller/fu1.png)

It works. Now take a calm look at what you wrote.

## The problem: the code repeats itself

The two eyes have **almost the same code**. And so does the head, with other numbers. If you wanted to add a nose, you would copy the block again. If you made a mistake in a calculation, you would have to fix it in three places. And the shader is already hard to read, and it only has three circles.

When you see yourself copying and pasting a block changing only a few numbers, it is the sign that a **function** is missing.

## Step 5: your first function

A function is a piece of code with a name to which you pass data and which gives you a result. You have already used several: `Make.Vec4` is one.

We are going to write one that answers the question *"is this point inside this circle?"*. Add it **inside the `Face` class, after the `Fragment` function**:

```csharp
    public static bool InCircle(float x, float y, float centerX, float centerY, float radius)
    {
        float dx = x - centerX;
        float dy = y - centerY;
        return dx * dx + dy * dy < radius * radius;
    }
```

Let us look at each part of the first line:

| Part | Meaning |
|---|---|
| `public` | It can be used from outside. Always write it. |
| `static` | The function does not depend on any data of the class. All the helper functions you write for a shader must have it. |
| `bool` | What it **returns**: true or false. |
| `InCircle` | The name you choose. |
| `(float x, float y, ...)` | What it **receives**: five named numbers. |

And the body is what you were already writing: it works out how far the point is and compares it with the radius. The `return` hands over the result: `true` if the point is inside, `false` if not.

Now use it. In `Fragment`, **delete** the three circle blocks (the head and the two eyes, with their `dx` and `dy`) and write instead:

```csharp
if (InCircle(x, y, middle, 0.5f, 0.4f))
{
    color = Make.Vec4(1f, 0.85f, 0.2f, 1f);
}
if (InCircle(x, y, middle - 0.15f, 0.4f, 0.06f))
{
    color = Make.Vec4(0.1f, 0.1f, 0.1f, 1f);
}
if (InCircle(x, y, middle + 0.15f, 0.4f, 0.06f))
{
    color = Make.Vec4(0.1f, 0.1f, 0.1f, 1f);
}
```

Run the work cycle: **the image is identical**. What matters is that now each circle takes three lines and reads at a glance: *"if it is in the circle with this center and this radius, paint it this color"*.

> [!NOTE]
> The data a function receives are called **parameters**, and they are **copies**. If inside `InCircle` you wrote `x = 0f;`, you would only change the copy, and the `x` in `Fragment` would stay the same. That is normal in C#, and in a shader it is mandatory: functions cannot modify the variables of whoever calls them. What you do is return a result with `return`.

## Step 6: another function, for the rectangle

The mouth can also be written better. Add this second function, below `InCircle`:

```csharp
    public static bool InRectangle(float x, float y, float left, float top, float right, float bottom)
    {
        return x > left && x < right && y > top && y < bottom;
    }
```

And in `Fragment` replace the mouth block with:

```csharp
if (InRectangle(x, y, middle - 0.15f, 0.65f, middle + 0.15f, 0.7f))
{
    color = Make.Vec4(0.1f, 0.1f, 0.1f, 1f);
}
```

Notice how well the call reads now. Without looking at the function, you already know what it does.

## Step 7: give the colors a name

There is another kind of repetition: the same color written three times (`Make.Vec4(0.1f, 0.1f, 0.1f, 1f)` in the eyes and the mouth). If you wanted to change the black to a brown, you would have to touch three lines.

The solution is to save each color in a variable **with a good name**, at the start. Replace the line `vec4 color = Make.Vec4(0.55f, 0.8f, 1f, 1f);` with these four:

```csharp
vec4 sky = Make.Vec4(0.55f, 0.8f, 1f, 1f);
vec4 skin = Make.Vec4(1f, 0.85f, 0.2f, 1f);
vec4 ink = Make.Vec4(0.1f, 0.1f, 0.1f, 1f);

vec4 color = sky;
```

And in each `if` change every `Make.Vec4(...)` to the name that corresponds: `color = skin;` for the head and `color = ink;` for the eyes and the mouth. Run the work cycle to check that nothing changed.

Now, if you want the face to be green, you change **a single line**.

## Step 8: your own data types

There is still something that can be improved. Each circle is described with three loose numbers (`x`, `y` and radius), and we always have to pass them to the function in the right order. It is easy to confuse the center with the radius.

C# lets you group data that goes together into a `struct`: a named box. In fact, you already use one all the time: `vec4` is a struct that holds four numbers. Now you are going to make your own.

Add this inside the `Face` class, below the functions:

```csharp
    public struct Circle
    {
        public float X;
        public float Y;
        public float Radius;
    }

    public static Circle NewCircle(float x, float y, float radius)
    {
        Circle c;
        c.X = x;
        c.Y = y;
        c.Radius = radius;
        return c;
    }

    public static bool Contains(Circle c, float x, float y)
    {
        float dx = x - c.X;
        float dy = y - c.Y;
        return dx * dx + dy * dy < c.Radius * c.Radius;
    }
```

- `Circle` is the new type: three fields.
- `NewCircle` is a function that builds it. It is the same idea as `Make.Vec4`: a `struct` has no constructor in a shader, so it is filled field by field.
- `Contains` is `InCircle` rewritten: instead of five numbers, it receives a `Circle` and a point.

Replace the contents of `Fragment` with the final version. Now the circles are **declared once** and then used:

```csharp
float aspect = Data.Width / Data.Height;
float x = pixel.Uv.X * aspect;
float y = pixel.Uv.Y;
float middle = aspect * 0.5f;

Circle head = NewCircle(middle, 0.5f, 0.4f);
Circle leftEye = NewCircle(middle - 0.15f, 0.4f, 0.06f);
Circle rightEye = NewCircle(middle + 0.15f, 0.4f, 0.06f);

vec4 sky = Make.Vec4(0.55f, 0.8f, 1f, 1f);
vec4 skin = Make.Vec4(1f, 0.85f, 0.2f, 1f);
vec4 ink = Make.Vec4(0.1f, 0.1f, 0.1f, 1f);

vec4 color = sky;

if (Contains(head, x, y))
{
    color = skin;
}
if (Contains(leftEye, x, y) || Contains(rightEye, x, y))
{
    color = ink;
}
if (InRectangle(x, y, middle - 0.15f, 0.65f, middle + 0.15f, 0.7f))
{
    color = ink;
}

return color;
```

Run the work cycle. It is the same face as before, but look at how the shader reads: first **what is there** in the scene (head, eyes, colors) and then **how it is painted**. To move an eye, you change a number on a named line. To add a third one, you copy a line.

## What cannot be done

A shader runs on the GPU, and the GPU does not allow everything your PC allows. For functions, the ones that affect you most:

- A function **cannot call itself** (recursion). If you need to repeat something, use a loop, which we will see soon.
- The data a function receives cannot be marked `ref`, `out` or `in`. To return several values, return a `struct`.
- All the functions you write must be `static`.

## All together

This is the complete file of the face with structs:

```csharp style=glsl title="MyShaders/Face.cs"
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Resources;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.Language;

namespace MyShaders;

public class Face
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
    public vec4 Fragment(PixelIn pixel)
    {
        float aspect = Data.Width / Data.Height;
        float x = pixel.Uv.X * aspect;
        float y = pixel.Uv.Y;
        float middle = aspect * 0.5f;

        Circle head = NewCircle(middle, 0.5f, 0.4f);
        Circle leftEye = NewCircle(middle - 0.15f, 0.4f, 0.06f);
        Circle rightEye = NewCircle(middle + 0.15f, 0.4f, 0.06f);

        vec4 sky = Make.Vec4(0.55f, 0.8f, 1f, 1f);
        vec4 skin = Make.Vec4(1f, 0.85f, 0.2f, 1f);
        vec4 ink = Make.Vec4(0.1f, 0.1f, 0.1f, 1f);

        vec4 color = sky;

        if (Contains(head, x, y))
        {
            color = skin;
        }
        if (Contains(leftEye, x, y) || Contains(rightEye, x, y))
        {
            color = ink;
        }
        if (InRectangle(x, y, middle - 0.15f, 0.65f, middle + 0.15f, 0.7f))
        {
            color = ink;
        }

        return color;
    }

    public struct Circle
    {
        public float X;
        public float Y;
        public float Radius;
    }

    public static Circle NewCircle(float x, float y, float radius)
    {
        Circle c;
        c.X = x;
        c.Y = y;
        c.Radius = radius;
        return c;
    }

    public static bool Contains(Circle c, float x, float y)
    {
        float dx = x - c.X;
        float dy = y - c.Y;
        return dx * dx + dy * dy < c.Radius * c.Radius;
    }

    public static bool InRectangle(float x, float y, float left, float top, float right, float bottom)
    {
        return x > left && x < right && y > top && y < bottom;
    }
}
```

```csharp style=hlsl title="MyShaders/Face.cs"
using YotsubaShader.HlslSyntax;
using YotsubaShader.HlslSyntax.Resources;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.Language;

namespace MyShaders;

public class Face
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
    public vec4 Fragment(PixelIn pixel)
    {
        float aspect = Data.Width / Data.Height;
        float x = pixel.Uv.X * aspect;
        float y = pixel.Uv.Y;
        float middle = aspect * 0.5f;

        Circle head = NewCircle(middle, 0.5f, 0.4f);
        Circle leftEye = NewCircle(middle - 0.15f, 0.4f, 0.06f);
        Circle rightEye = NewCircle(middle + 0.15f, 0.4f, 0.06f);

        vec4 sky = Make.Vec4(0.55f, 0.8f, 1f, 1f);
        vec4 skin = Make.Vec4(1f, 0.85f, 0.2f, 1f);
        vec4 ink = Make.Vec4(0.1f, 0.1f, 0.1f, 1f);

        vec4 color = sky;

        if (Contains(head, x, y))
        {
            color = skin;
        }
        if (Contains(leftEye, x, y) || Contains(rightEye, x, y))
        {
            color = ink;
        }
        if (InRectangle(x, y, middle - 0.15f, 0.65f, middle + 0.15f, 0.7f))
        {
            color = ink;
        }

        return color;
    }

    public struct Circle
    {
        public float X;
        public float Y;
        public float Radius;
    }

    public static Circle NewCircle(float x, float y, float radius)
    {
        Circle c;
        c.X = x;
        c.Y = y;
        c.Radius = radius;
        return c;
    }

    public static bool Contains(Circle c, float x, float y)
    {
        float dx = x - c.X;
        float dy = y - c.Y;
        return dx * dx + dy * dy < c.Radius * c.Radius;
    }

    public static bool InRectangle(float x, float y, float left, float top, float right, float bottom)
    {
        return x > left && x < right && y > top && y < bottom;
    }
}
```

```csharp style=msl title="MyShaders/Face.cs"
using YotsubaShader.MslSyntax;
using YotsubaShader.MslSyntax.Resources;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.Language;

namespace MyShaders;

public class Face
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
    public vec4 Fragment(PixelIn pixel)
    {
        float aspect = Data.Width / Data.Height;
        float x = pixel.Uv.X * aspect;
        float y = pixel.Uv.Y;
        float middle = aspect * 0.5f;

        Circle head = NewCircle(middle, 0.5f, 0.4f);
        Circle leftEye = NewCircle(middle - 0.15f, 0.4f, 0.06f);
        Circle rightEye = NewCircle(middle + 0.15f, 0.4f, 0.06f);

        vec4 sky = Make.Vec4(0.55f, 0.8f, 1f, 1f);
        vec4 skin = Make.Vec4(1f, 0.85f, 0.2f, 1f);
        vec4 ink = Make.Vec4(0.1f, 0.1f, 0.1f, 1f);

        vec4 color = sky;

        if (Contains(head, x, y))
        {
            color = skin;
        }
        if (Contains(leftEye, x, y) || Contains(rightEye, x, y))
        {
            color = ink;
        }
        if (InRectangle(x, y, middle - 0.15f, 0.65f, middle + 0.15f, 0.7f))
        {
            color = ink;
        }

        return color;
    }

    public struct Circle
    {
        public float X;
        public float Y;
        public float Radius;
    }

    public static Circle NewCircle(float x, float y, float radius)
    {
        Circle c;
        c.X = x;
        c.Y = y;
        c.Radius = radius;
        return c;
    }

    public static bool Contains(Circle c, float x, float y)
    {
        float dx = x - c.X;
        float dy = y - c.Y;
        return dx * dx + dy * dy < c.Radius * c.Radius;
    }

    public static bool InRectangle(float x, float y, float left, float top, float right, float bottom)
    {
        return x > left && x < right && y > top && y < bottom;
    }
}
```

```csharp style=wgsl title="MyShaders/Face.cs"
using YotsubaShader.WgslSyntax;
using YotsubaShader.WgslSyntax.Resources;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.Language;

namespace MyShaders;

public class Face
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
    public vec4 Fragment(PixelIn pixel)
    {
        float aspect = Data.Width / Data.Height;
        float x = pixel.Uv.X * aspect;
        float y = pixel.Uv.Y;
        float middle = aspect * 0.5f;

        Circle head = NewCircle(middle, 0.5f, 0.4f);
        Circle leftEye = NewCircle(middle - 0.15f, 0.4f, 0.06f);
        Circle rightEye = NewCircle(middle + 0.15f, 0.4f, 0.06f);

        vec4 sky = Make.Vec4(0.55f, 0.8f, 1f, 1f);
        vec4 skin = Make.Vec4(1f, 0.85f, 0.2f, 1f);
        vec4 ink = Make.Vec4(0.1f, 0.1f, 0.1f, 1f);

        vec4 color = sky;

        if (Contains(head, x, y))
        {
            color = skin;
        }
        if (Contains(leftEye, x, y) || Contains(rightEye, x, y))
        {
            color = ink;
        }
        if (InRectangle(x, y, middle - 0.15f, 0.65f, middle + 0.15f, 0.7f))
        {
            color = ink;
        }

        return color;
    }

    public struct Circle
    {
        public float X;
        public float Y;
        public float Radius;
    }

    public static Circle NewCircle(float x, float y, float radius)
    {
        Circle c;
        c.X = x;
        c.Y = y;
        c.Radius = radius;
        return c;
    }

    public static bool Contains(Circle c, float x, float y)
    {
        float dx = x - c.X;
        float dy = y - c.Y;
        return dx * dx + dy * dy < c.Radius * c.Radius;
    }

    public static bool InRectangle(float x, float y, float left, float top, float right, float bottom)
    {
        return x > left && x < right && y > top && y < bottom;
    }
}
```

```csharp style=spirv title="MyShaders/Face.cs"
using YotsubaShader.SpirvSyntax;
using YotsubaShader.SpirvSyntax.Resources;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.Language;

namespace MyShaders;

public class Face
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
    public vec4 Fragment(PixelIn pixel)
    {
        float aspect = Data.Width / Data.Height;
        float x = pixel.Uv.X * aspect;
        float y = pixel.Uv.Y;
        float middle = aspect * 0.5f;

        Circle head = NewCircle(middle, 0.5f, 0.4f);
        Circle leftEye = NewCircle(middle - 0.15f, 0.4f, 0.06f);
        Circle rightEye = NewCircle(middle + 0.15f, 0.4f, 0.06f);

        vec4 sky = Make.Vec4(0.55f, 0.8f, 1f, 1f);
        vec4 skin = Make.Vec4(1f, 0.85f, 0.2f, 1f);
        vec4 ink = Make.Vec4(0.1f, 0.1f, 0.1f, 1f);

        vec4 color = sky;

        if (Contains(head, x, y))
        {
            color = skin;
        }
        if (Contains(leftEye, x, y) || Contains(rightEye, x, y))
        {
            color = ink;
        }
        if (InRectangle(x, y, middle - 0.15f, 0.65f, middle + 0.15f, 0.7f))
        {
            color = ink;
        }

        return color;
    }

    public struct Circle
    {
        public float X;
        public float Y;
        public float Radius;
    }

    public static Circle NewCircle(float x, float y, float radius)
    {
        Circle c;
        c.X = x;
        c.Y = y;
        c.Radius = radius;
        return c;
    }

    public static bool Contains(Circle c, float x, float y)
    {
        float dx = x - c.X;
        float dy = y - c.Y;
        return dx * dx + dy * dy < c.Radius * c.Radius;
    }

    public static bool InRectangle(float x, float y, float left, float top, float right, float bottom)
    {
        return x > left && x < right && y > top && y < bottom;
    }
}
```

## What you learned

- If you copy and paste a block changing only a few numbers, you need a **function**.
- A function has three parts: what it returns, its name and what it receives. What it receives are copies.
- A shader's helper functions are written `public static` inside the class.
- **Order matters:** what you paint later ends up on top.
- A `struct` groups data that goes together and gives the idea a name. It is filled field by field.

Next: [Mixing and smoothing](mixing.md).

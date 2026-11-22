---
title: When something goes wrong
summary: How to find the error in a shader that does not work, and answers to the questions almost everyone asks.
order: 17
---

> [!SCENE] intro

Sooner or later, your shader will show a black screen and you will not know why. It happens to everyone, even to those who have been making shaders for years. The difference is that those who have been at it for years have a method for finding the problem. In this chapter you learn it.

> [!SCENE] console

There is one difficulty worth accepting right away: **in a shader you cannot write to the console**. There is no `Console.WriteLine`. A shader runs on the GPU, thousands of times at once, and it has nowhere to print. What you do have is color: *your only way of looking inside the shader is to paint what you want to see*.

> [!SCENE] method

## The method: four questions, in order

When something does not work, ask yourself these questions **in this order**. Almost always the answer is in one of the first ones.

1. **Does it compile?** If `add` shows an error, nothing else matters yet. Read the message.
2. **Is my shader running?** Maybe you are looking at another one, or an old one.
3. **Is the data arriving correctly?** The window size, the time, the `Uv`.
4. **Is my math right?** This is where the techniques for painting values come in.

> [!SCENE] t1

## Technique 1: a solid color

The simplest and the most useful. Put this as the **first line** of `Fragment`:

```csharp
return Make.Vec4(1f, 0f, 0f, 1f);
```

If the window comes out red, your shader runs, the rectangle is drawn and the GPU works. The problem is in your math, which comes after that line. If it does **not** come out red, the problem is deeper: look at the table below.

This trick works because it takes doubts away. When you do not know where the fault is, the first thing is to know where it is **not**.

> [!SCENE] t2

## Technique 2: paint the number

Imagine your shader draws a spot of light and everything comes out black. You do not know whether the math gives `0`, or negative, or something huge. Let us paint the number:

```csharp
float dx = pixel.Uv.X - 0.5f;
float dy = pixel.Uv.Y - 0.5f;
float light = 1f - (dx * dx + dy * dy) * 40f;

// return Make.Vec4(light, light, light, 1f);
return Make.Vec4(dx, dx, dx, 1f);
```

The original line was commented out, and `dx` is painted in its place. Now you see how it behaves: black on the left (negative values clipped) and light on the right. If something is wrong there, you now know. If it is right, paint `dy`, then `dx * dx + dy * dy`, and so on, moving through the math until you find the step where the image stops being what you expected.

Two things to remember when you interpret what you see:

| What you see | What it means |
|---|---|
| All black | The value is `0` or negative (negatives are clipped to `0`). |
| All white | The value is `1` or greater (it is also clipped). |
| Light and dark color stripes | The value changes with position. You are on the right track. |

> [!TIP]
> To see values that go outside `0`-`1`, **scale** them: if you suspect `x` goes from `0` to `10`, paint `x / 10f`. If it goes from `-1` to `1`, paint `x * 0.5f + 0.5f`. This way they fit in the visible range.

> [!SCENE] t3

## Technique 3: split and cut

If your shader has many lines, you do not know which one fails. Put a solid-color `return` **halfway through**, and see whether it looks right:

```csharp
float a = pixel.Uv.X * 2f - 1f;
float b = a * a;

return Make.Vec4(b, b, b, 1f); // try here: does b look right?

float c = 1f - b;
return Make.Vec4(c, c, c, 1f);
```

If `b` looks right, the problem is after. If it looks wrong, it is before. Move the `return` up or down until you corner the problem, like looking up a word in a dictionary.

C# will warn you that there is "unreachable code" below the `return`. It is only a warning, and in this case it is exactly what we want.

> [!SCENE] symptoms

## Symptoms and causes

This table gathers the most common problems. It is the one you will consult most.

| What you see | Probable cause | What to do |
|---|---|---|
| The window comes out **black** and nothing changes | Your `Fragment` returns black (as in `Template`) or the change did not arrive. | Run the full cycle, with `add`. Try the solid color technique. |
| `Class MyShaders.X does not exist` | The name after `--` does not match the class. | Check capital letters and that the file declares that class. |
| The window shows an **old** version | You saved but the shader was not translated again. | Run the full cycle every time, as the chapter says. |
| All **white** | A value went over `1`. | Paint the value divided down (technique 2). |
| All **black** with a light calculation | The value is negative or `0`. | Paint the value. Check signs and the order of a subtraction. |
| The circle comes out **oval** | The window is wider than tall and the shader does not take it into account. | See the [coordinates](coordinates.md) chapter. |
| The drawing comes out **upside down** | `Y` grows downward. | Use `1f - pixel.Uv.Y`. |
| A value is always `0` or always `1` | You divided two integers. | Write a decimal: `a / 6f`, not `a / 6`. |
| It looks right in the viewer and wrong in my game | The data your game delivers does not match. | Check that your game's vertex has the order of your `Corner` struct. |

:::godot
In Godot there are a few more cases:

| What you see | Probable cause | What to do |
| --- | --- | --- |
| The window is **gray** and nothing draws | The `.gdshader` file does not exist yet or failed to load. | Check that `GodotGame/yotsuba_shaders/MyShaders/` has the file and use **Project → Reload Current Project**. |
| Godot does not see a shader you just created | The addon only reads files when the editor starts or gets focus. | **Project → Reload Current Project** (it asks to stop the game if it is running). |
| `dotnet` is not found when pressing Play | On macOS, Godot does not always inherit the `PATH` of your terminal. | Open Godot from a terminal where `dotnet --version` works. |
| `yotsuba: command not found` | The tool is not installed, or you opened the terminal before installing it. | Run `dotnet tool install --global YotsubaShader.Compiler.CLI` and open a new terminal. |
| A shader with a texture draws black | The viewer has no image in **Photo**. | Drag the image to the **Photo** property of the `Viewer` node. |
:::

> [!SCENE] errors

## Common compilation errors

`add` compiles your project first, so you will see ordinary C# errors. These are the ones that show up most:

| Error | What happened | Solution |
|---|---|---|
| `CS0664` (`Literal of type double...`) | You wrote `0.5` instead of `0.5f`. | Add the `f`. |
| `CS0019` (`Operator '+' cannot be applied...`) | You added two `vec4` or multiplied a `vec2` by a number with `+` or `*`. | Vectors have no operators yet. Operate field by field, or write your own function (below). |
| `CS0165` (`Use of unassigned local variable`) | You declared a `struct` and did not fill in all its fields. | Assign every field before using it. |
| `CS1729` (`does not contain a constructor`) | You wrote `new vec4(...)`. | Use `Make.Vec4(...)`. |
| `... no hay código disponible para compilarlo en GPU` | You called `Math.Sqrt`, `Math.Sin` or similar. | They do not exist in Yotsuba Shader yet. Write them yourself or wait for the planned chapters. |
| `CS0234` after renaming a class | `YotsubaShader.g.cs` names a class that no longer exists. | Delete it and run `add` again. |

> [!SCENE] faq

## Questions everyone asks

> [!SCENE] q_plus

### Why can I not add two vectors with `+`?

In GLSL or HLSL you can, because vectors are part of the language. Here `vec3` is a C# `struct`, and C# does not know what it means to add two structs, unless someone teaches it. Meanwhile, you have two options. The most direct is to operate field by field:

```csharp
vec3 sum = Make.Vec3(a.X + b.X, a.Y + b.Y, a.Z + b.Z);
```

And if you do it often, write a function once and use it forever:

```csharp
public static vec3 Add(vec3 a, vec3 b)
{
    return Make.Vec3(a.X + b.X, a.Y + b.Y, a.Z + b.Z);
}

public static vec3 Scale(vec3 a, float k)
{
    return Make.Vec3(a.X * k, a.Y * k, a.Z * k);
}
```

With them, mixing two lights looks like this:

```csharp
vec3 red = Make.Vec3(1f, 0f, 0f);
vec3 green = Make.Vec3(0f, 1f, 0f);
vec3 blend = Add(Scale(red, pixel.Uv.X), Scale(green, pixel.Uv.Y));
return Make.Vec4(blend.X, blend.Y, blend.Z, 1f);
```

> [!SCENE] q_f

### Why do I have to put the `f` on numbers?

Because in C# a number with decimals, like `0.5`, is a `double`, another kind of number that takes more memory. And GPUs work with `float`. The `f` tells C# "this one is a `float`". Without it, it does not compile.

> [!SCENE] q_kinds

### What is the difference between vertex data, a uniform and the `Uv`?

It is the most repeated question in shader forums, and the confusion is logical: the three are "data that enters the shader", but they arrive in different ways.

| | Where it comes from | How many times it changes | Example |
|---|---|---|---|
| **Vertex data** | The list of vertices the game sends | One per vertex | `[location(0)] public vec2 Position;` in `Corner` |
| **Uniform** | The program, before drawing | **Just one** for the whole draw | `[uniform, layout(0, 0)] public Context Data;` |
| **Spread-out data** | The GPU, between `Vertex` and `Fragment` | A different one **per pixel** | `[location(0)] public vec2 Uv;` in `Pixel` |

The rule for deciding where to put a piece of data: does it change from one vertex to another? It goes in the vertex. Is it the same for the whole draw (the time, the size, a chosen color)? It is a uniform. Do you want `Fragment` to receive it smoothly spread out? It is passed from `Vertex` to `Fragment` through a door, as you did with the `Uv`.

> [!SCENE] q_neigh

### Can I ask a neighboring pixel what color it has?

No. Each pixel is computed separately and at the same time as the others, so there is no "first" or "after" among them. If you need something that depends on neighbors (a blur, for example), it is done in two passes: first a complete image is drawn, and then another shader **reads** it as a texture. It is an advanced topic, and you do not need it to get started.

> [!SCENE] q_zero

### What happens if I divide by zero?

In normal C#, dividing a `float` by zero gives infinity, or a value that is not a number (`NaN`). On the GPU there is no telling what comes out, and it usually looks like a black pixel or a flicker. If a divisor can become zero, protect it:

```csharp
float ratio = 0f;
if (width > 0f)
{
    ratio = height / width;
}
```

> [!SCENE] q_slow

### Is my shader slow?

First make sure it works. Speed is measured, not guessed. As a guide: loops with many laps and very complex `if`s are what cost the most, because every pixel runs them. If you notice it is slow, start by reducing the laps of a loop and check whether it improves.

> [!SCENE] q_tool

### I want a real tool for debugging

There are graphics debuggers, like **RenderDoc**, that let you freeze a frame and look at what the GPU received and drew. They are useful when the problem is in the data, not in the math. For what you do in this tutorial you do not need them yet.

> [!SCENE] learned

## What you learned

- In a shader you cannot print: **you paint the value** to see it.
- A solid color at the start of `Fragment` tells you whether the problem is in your math or somewhere else.
- Split and cut: a `return` halfway tells you whether the fault is before or after.
- To see values outside `0`-`1`, scale them.
- Most compilation errors have a known cause and a quick solution.

Next: [The command line](cli.md).

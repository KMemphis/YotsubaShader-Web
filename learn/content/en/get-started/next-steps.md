---
title: What now?
summary: Take your shaders to the game engine you use.
order: 20
---

> [!SCENE] intro

You finished the tutorial. You drew colors, shapes, a face, a sunset and a bouncing ball. You made five shaders, and along the way you learned:

- What a shader is and what each stage does.
- How the data that goes in and out is declared, with `[location]` and `[gl_Position]`, and why each door (game to Vertex, Vertex to Fragment, Fragment to screen) counts its slots from 0.
- To look inside a shader by painting values as color, and to find an error with a method.
- That inside a shader you can use `if`, loops, arrays and your own functions.
- How something moves when it has no memory: by computing everything from the time the program gives it.
- The GPU's math functions, such as `sqrt`, `sin` and `mix`.
- How to send data to a shader with a uniform, and how to read an image with a texture.
- How to compile with `add` and ask your own class for the result.

:::xna
> [!SCENE] x_engine

What is missing is the one thing this tutorial could not teach you in a single way: **drawing on screen**. Opening a window, sending the rectangle to the GPU, handing it the clock and the photo. That depends on what you work with.

The good news is that the starting point is always the same and you already have it: `new Gradient()` and one of the methods `add` gave it.

## Pick your game engine

```buttons
[MonoGame](../engines/monogame-reference.md)
[KNI](../engines/kni-reference.md)
[FNA](../engines/fna-reference.md)
[Godot](../engines/godot-reference.md)
[Stride](../engines/stride.md)
[Unity](../engines/unity.md)
[Silk.NET](../engines/silknet.md)
```
:::

:::godot
> [!SCENE] g_next

You already drew on screen: the viewer scene, your shaders running in Godot and even a 3D scene seen through them. What you did not see is everything Godot can do around that, and it is gathered in the [Godot reference](../engines/godot-reference.md): the names of the 14 vertex attributes and what the translator supports.

From here, the best way to learn is to take one of your shaders and use it on a real object, with `VERTEX` and `NORMAL` of a `MeshInstance3D`.
:::

:::raylib
You already drew on screen: a window of your own with raylib-cs, your shaders running in it and even a photo seen through them. What this tutorial did not show is everything raylib can do around that, and it is gathered in the [raylib-cs reference](../engines/raylib-reference.md): the viewer explained part by part and how to draw with your shaders inside a game.

From here, the best way to learn is to take one of your shaders and use it on something of your game, putting `BeginShaderMode` around the drawing you already do.
:::

:::silknet
You already drew on screen: a window of your own with the graphics API you chose and your shaders running in it. What this tutorial did not show is the other three: the [Silk.NET reference](../engines/silknet-reference.md) has the four viewers explained part by part, so you can compare how each API receives the same shader.

From here, the best way to learn is to take one of your shaders and run it with another API. The shader does not change: only the `--target` and the viewer do.
:::

> [!SCENE] own

## Do you have your own engine?

If you use Vulkan, DirectX, Metal or OpenGL directly, or you are building your own game engine, continue here:

```buttons
[Use Yotsuba Shader in your own engine](../custom-engine/index.md)
```

> [!SCENE] lookup

## For looking things up

When you want to find a specific attribute or format without rereading the tutorial:

```buttons
[Documentation](../reference/index.md)
```

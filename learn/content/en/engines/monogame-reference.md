---
title: MonoGame reference
summary: MonoGame: package, plugin, generated method, vertex declaration, uniforms and a complete game.
order: 8
---

MonoGame loads a shader as an **effect**. Yotsuba Shader compiles your C# shader into the bytes of that effect with the `monogame` plugin, the generated method `ToMGFX` returns those bytes, and your game builds an `Effect` from them. There is no `.fx` file, no Content Pipeline and no separate compile step. For the step-by-step path, use the MonoGame route of [Get Started](../get-started/index.md).

## At a glance

| | |
| --- | --- |
| Plugin and target | `monogame` (`--target monogame`) |
| Output | MonoGame effect (MGFX), one per platform |
| Generated method | `ToMGFX(MonoGamePlatform.DesktopGL)` |
| Package for the game | `MonoGame.Framework.DesktopGL` |
| Tested with | MonoGame 3.8.6 with `MonoGame.Framework.DesktopGL` |

## Build the shaders

With the compiler installed (`dotnet tool install --global YotsubaShader.Compiler.CLI`), from any folder:

```bash
yotsuba add MyShaders/MyShaders.csproj --target spirv --target monogame
```

The first run downloads the `monogame` plugin. `MyShaders/YotsubaShader.g.cs` then contains `ToMGFX` for every shader class. To run the command on every build, see [The add command](../reference/add.md); plugin management is in [Plugins](../reference/plugins.md).

## The game project

A console project is enough, because the shader reaches the game as bytes inside your shader library:

```bash
dotnet new console -n MyGame -f net8.0
dotnet add MyGame package MonoGame.Framework.DesktopGL
dotnet add MyGame reference MyShaders/MyShaders.csproj
```

`MonoGame.Framework.DesktopGL` runs on Windows, macOS and Linux and opens the window with OpenGL. Do not create the game with `dotnet new mgdesktopgl`: the template adds a Content Pipeline that this path does not use. An existing MonoGame game works too: add the reference to `MyShaders` and keep its package.

## The shader

This is the shader used below: a strip of light that crosses the screen, driven by a time uniform. It uses the support types of the tutorial (the vertex input and the vertex output):

```csharp
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Types;

namespace MyShaders;

public struct Corner
{
    [location(0)] public vec2 Position;
    [location(1)] public vec2 Uv;
}

public struct Pixel
{
    [gl_Position] public vec4 Position;
    [location(0)] public vec2 Uv;
}

public struct PixelIn
{
    [location(0)] public vec2 Uv;
}
```

```csharp
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Resources;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.Language;

namespace MyShaders;

public struct Stopwatch
{
    public float Seconds;
}

public class Sweep
{
    [uniform, layout(0, 0)]
    public Stopwatch Time;

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
        float distance = pixel.Uv.X - Time.Seconds * 0.5f;
        if (distance < 0f)
        {
            distance = -distance;
        }

        float brightness = 1f - distance * 5f;
        if (brightness < 0f)
        {
            brightness = 0f;
        }

        return new vec4(brightness, brightness * 0.5f, 0.15f + 0.35f * pixel.Uv.Y, 1f);
    }
}
```

## Vertex data: `[location(n)]` is `TextureCoordinate n`

The game sends the vertices and the shader reads them by slot. The plugin gives every `[location(n)]` of the vertex struct the usage `TextureCoordinate` with index `n`:

| In the shader | In MonoGame |
| --- | --- |
| `[location(0)]` | `VertexElementUsage.TextureCoordinate`, index `0` |
| `[location(1)]` | `VertexElementUsage.TextureCoordinate`, index `1` |
| `[location(2)]` | `VertexElementUsage.TextureCoordinate`, index `2` |

The vertex type of the game for `Corner` (two `vec2`):

```csharp
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;

public readonly struct ScreenCorner(Vector2 position, Vector2 uv) : IVertexType
{
    private static readonly VertexDeclaration Declaration = new(
        new VertexElement(0, VertexElementFormat.Vector2, VertexElementUsage.TextureCoordinate, 0),
        new VertexElement(8, VertexElementFormat.Vector2, VertexElementUsage.TextureCoordinate, 1));

    public readonly Vector2 Position = position;
    public readonly Vector2 Uv = uv;

    VertexDeclaration IVertexType.VertexDeclaration => Declaration;
}
```

Declare every field with `TextureCoordinate` and the index of its `location`, never with `VertexElementUsage.Position`: the shader reads the position from `TextureCoordinate 0`. The first argument of `VertexElement` is the byte where the field starts (two `float` take 8 bytes). The same rule applies to any vertex type you write, with more fields or other formats.

## A complete game

The shader above, drawn on a rectangle that covers the window. Everything the engine needs is here:

```csharp
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using MyShaders;
using YotsubaShader;

public class MyGame : Game
{
    private readonly GraphicsDeviceManager _graphics;
    private Effect _shader = null!;

    private readonly ScreenCorner[] _screen =
    [
        new(new Vector2(-1f,  1f), new Vector2(0f, 0f)),
        new(new Vector2( 1f,  1f), new Vector2(1f, 0f)),
        new(new Vector2(-1f, -1f), new Vector2(0f, 1f)),
        new(new Vector2( 1f, -1f), new Vector2(1f, 1f)),
    ];

    public MyGame()
    {
        _graphics = new GraphicsDeviceManager(this)
        {
            PreferredBackBufferWidth = 800,
            PreferredBackBufferHeight = 800,
        };
    }

    protected override void LoadContent()
    {
        byte[] compiled = new Sweep().ToMGFX(MonoGamePlatform.DesktopGL);
        _shader = new Effect(GraphicsDevice, compiled);
    }

    protected override void Draw(GameTime gameTime)
    {
        GraphicsDevice.RasterizerState = RasterizerState.CullNone;

        float seconds = (float)(gameTime.TotalGameTime.TotalSeconds % 2.0);
        _shader.Parameters["Time_Seconds"].SetValue(seconds);

        _shader.CurrentTechnique.Passes[0].Apply();
        GraphicsDevice.DrawUserPrimitives(PrimitiveType.TriangleStrip, _screen, 0, 2);

        base.Draw(gameTime);
    }
}
```

- `new Effect(GraphicsDevice, bytes)` has to run in `LoadContent` or later, because it needs the `GraphicsDevice`.
- The generated effect has one technique with one pass, so `CurrentTechnique.Passes[0]` is always the pass.
- `CullNone` stops the GPU from discarding triangles that face backwards; the rectangle has no back face to hide.
- `TriangleStrip` with `2` primitives draws the four corners as two triangles.
- Run it with `dotnet run --project MyGame`.

## Uniforms

A `[uniform]` struct becomes one effect parameter per field, named `<Field>_<Member>`. For `public Stopwatch Time;` with a `Seconds` member the parameter is `Time_Seconds`. Set it before `Apply()`, because `Apply()` is the moment the values travel to the GPU.

| Type in the shader | Value for `SetValue` |
| --- | --- |
| `float` | `float` |
| `int` | `int` |
| `vec2` | `Vector2` |
| `vec3` | `Vector3` |
| `vec4` | `Vector4` |
| `mat4` | `Matrix` |

`Parameters["name"]` returns `null` when the name does not exist, and then `SetValue` throws `NullReferenceException`. A shader that never reads a value does not keep its parameter, so check the name against the struct field and the member.

## Platforms

The method takes the platform, because an MGFX effect depends on the system where it runs. The game chooses it in code, not in the `.csproj`:

| `MonoGamePlatform` | Use it with |
| --- | --- |
| `DesktopGL` | `MonoGame.Framework.DesktopGL` (Windows, macOS, Linux) |
| `WindowsDX11` | `MonoGame.Framework.WindowsDX` (Windows with DirectX 11) |
| `WindowsDirectX12`, `DesktopVulkan`, `GL4` | The newer MonoGame with DirectX 12, Vulkan or OpenGL 4 |
| `Android`, `iOS` | `MonoGame.Framework.Android` and `MonoGame.Framework.iOS` |

To change platform, change the package of the game and the argument. `WindowsDX` only runs on Windows, so the game targets `net8.0-windows`:

```csharp
byte[] compiled = new Sweep().ToMGFX(MonoGamePlatform.WindowsDX11);
```

`add` already writes every platform into `YotsubaShader.g.cs`, so switching platform does not need another compile. The `DesktopGL` platform is the one tested from start to end.

## If something fails

| What you see | What it means | What to do |
| --- | --- | --- |
| `ToMGFX` does not exist | `add` ran without the plugin. | Run `add` with `--target monogame`. |
| `add` fails with a message about a shader | That shader cannot be compiled for the GPU. | Read the message: it names the shader and the reason. |
| `NotSupportedException` when the game runs | The plugin could not compile that shader; `add` leaves the method ready to report the reason. | Run `add` again and read what it prints. |
| The rectangle is deformed or missing | A field uses `VertexElementUsage.Position`. | Use `TextureCoordinate` with the index of the `location`. |
| `NullReferenceException` in `Parameters[...].SetValue` | The parameter name does not exist. | The name is `<Field>_<Member>`. |
| The window stays black | `Apply()` or `DrawUserPrimitives` is missing, or the shader returns black. | Check the game above and return a color with `1` as the last value. |
| `add` fails with a network error | The CLI is downloading the plugin and cannot reach NuGet. | Check the connection, or run `yotsuba plugin install monogame` when you are online. |


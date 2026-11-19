---
title: Referencia de KNI
summary: KNI: paquete, plugin, método generado, declaración de vértices, uniforms y un juego completo.
order: 9
---

KNI carga un shader como un **efecto**. Yotsuba Shader compila tu shader de C# a los bytes de ese efecto con el plugin `kni`, el método generado `ToKNIWebGL_FX` devuelve esos bytes, y tu juego construye un `Effect` con ellos. No hay archivo `.fx`, ni Content Pipeline, ni un paso de compilación aparte. Para el recorrido paso a paso, usa la ruta de KNI de [Get Started](../get-started/index.md).

## De un vistazo

| | |
| --- | --- |
| Plugin y destino | `kni` (`--target kni`) |
| Salida | Efecto de KNI (`.knifx`), el mismo para escritorio y navegador |
| Método generado | `ToKNIWebGL_FX()` |
| Paquete para el juego | `nkast.Kni.Platform.SDL2.GL` |
| Probado con | KNI desktop with `nkast.Kni.Platform.SDL2.GL` |

## Compilar los shaders

Desde la carpeta que tiene el manifiesto de herramientas (creado con `dotnet new tool-manifest` y `dotnet tool install YotsubaShader.Compiler.CLI`):

```bash
dotnet yotsuba add MyShaders/MyShaders.csproj --target spirv --target kni
```

La primera vez se descarga el plugin `kni`. Entonces `MyShaders/YotsubaShader.g.cs` contiene `ToKNIWebGL_FX` para cada clase de shader. Para ejecutar el comando en cada build, mira [El comando add](../reference/add.md); la gestión de plugins está en [Plugins](../reference/plugins.md).

## El proyecto del juego

Un proyecto de consola basta, porque el shader llega al juego como bytes dentro de tu biblioteca de shaders:

```bash
dotnet new console -n MyGame -f net8.0
dotnet add MyGame package nkast.Kni.Platform.SDL2.GL
dotnet add MyGame reference MyShaders/MyShaders.csproj
```

`nkast.Kni.Platform.SDL2.GL` abre la ventana con SDL2 y dibuja con OpenGL en Windows, macOS y Linux, y trae el resto de KNI. KNI tiene un paquete por plataforma; instala solo el de la que usas:

| Plataforma | Paquete | Lo soporta el plugin |
| --- | --- | --- |
| Escritorio (OpenGL) | `nkast.Kni.Platform.SDL2.GL` | Sí |
| Navegador (WebGL) | `nkast.Kni.Platform.Blazor.GL` | Sí, el mismo efecto |
| Windows con DirectX 11 | `nkast.Kni.Platform.WinForms.DX11` | No: el plugin compila solo para OpenGL y WebGL |

## El shader

Este es el shader que se usa abajo: una franja de luz que cruza la pantalla, controlada por un uniform de tiempo. Usa los tipos de apoyo del tutorial (la entrada del vértice, la salida del vértice y un pequeño ayudante para construir un `vec4`):

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

public static class Make
{
    public static vec4 Vec4(float x, float y, float z, float w)
    {
        vec4 v;
        v.X = x;
        v.Y = y;
        v.Z = z;
        v.W = w;
        return v;
    }
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
        pixel.Position = Make.Vec4(corner.Position.X, corner.Position.Y, 0f, 1f);
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

        return Make.Vec4(brightness, brightness * 0.5f, 0.15f + 0.35f * pixel.Uv.Y, 1f);
    }
}
```

## Datos de vértice: `[location(n)]` es `TextureCoordinate n`

El juego envía los vértices y el shader los lee por ranura. El plugin da a cada `[location(n)]` del struct de vértice el uso `TextureCoordinate` con índice `n`:

| En el shader | En KNI |
| --- | --- |
| `[location(0)]` | `VertexElementUsage.TextureCoordinate`, índice `0` |
| `[location(1)]` | `VertexElementUsage.TextureCoordinate`, índice `1` |
| `[location(2)]` | `VertexElementUsage.TextureCoordinate`, índice `2` |

El tipo de vértice del juego para `Corner` (dos `vec2`):

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

Declara cada campo con `TextureCoordinate` y el índice de su `location`, nunca con `VertexElementUsage.Position`: el shader lee la posición de `TextureCoordinate 0`. El primer argumento de `VertexElement` es el byte donde empieza el campo (dos `float` ocupan 8 bytes). La misma regla vale para cualquier tipo de vértice que escribas, con más campos u otros formatos.

## Un juego completo

El shader de arriba, dibujado sobre un rectángulo que cubre la ventana. Aquí está todo lo que el engine necesita:

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
        byte[] compiled = new Sweep().ToKNIWebGL_FX();
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

- `new Effect(GraphicsDevice, bytes)` tiene que ejecutarse en `LoadContent` o después, porque necesita el `GraphicsDevice`.
- El efecto generado tiene una técnica con un pase, así que `CurrentTechnique.Passes[0]` es siempre ese pase.
- `CullNone` evita que la GPU descarte los triángulos que miran hacia atrás; el rectángulo no tiene cara trasera que ocultar.
- `TriangleStrip` con `2` primitivas dibuja las cuatro esquinas como dos triángulos.
- Se ejecuta con `dotnet run --project MyGame`.

## Uniforms

Un struct `[uniform]` se convierte en un parámetro del efecto por cada campo, con el nombre `<Campo>_<Miembro>`. Para `public Stopwatch Time;` con un miembro `Seconds`, el parámetro es `Time_Seconds`. Asígnalo antes de `Apply()`, porque `Apply()` es el momento en que los valores viajan a la GPU.

| Tipo en el shader | Valor para `SetValue` |
| --- | --- |
| `float` | `float` |
| `int` | `int` |
| `vec2` | `Vector2` |
| `vec3` | `Vector3` |
| `vec4` | `Vector4` |
| `mat4` | `Matrix` |

`Parameters["nombre"]` devuelve `null` cuando el nombre no existe, y entonces `SetValue` lanza `NullReferenceException`. Un shader que nunca lee un valor no conserva su parámetro, así que revisa el nombre contra el campo del struct y el miembro.

## Escritorio y navegador

El método se llama `ToKNIWebGL_FX` y no recibe argumentos: hay un solo efecto para OpenGL de escritorio y para WebGL. Un proyecto web de KNI (el que usa `nkast.Kni.Platform.Blazor.GL`) referencia `MyShaders` igual que el juego de consola y carga el efecto con la misma línea, `new Effect(GraphicsDevice, new Sweep().ToKNIWebGL_FX())`. Todo lo demás de esta página es igual.

## Si algo falla

| Qué ves | Qué significa | Qué hacer |
| --- | --- | --- |
| `ToKNIWebGL_FX` no existe | `add` se ejecutó sin el plugin. | Ejecuta `add` con `--target kni`. |
| `add` falla con un mensaje sobre un shader | Ese shader no se puede compilar para la GPU. | Lee el mensaje: nombra el shader y el motivo. |
| `NotSupportedException` al ejecutar el juego | El plugin no pudo compilar ese shader; `add` deja el método listo para informar el motivo. | Ejecuta `add` otra vez y lee lo que imprime. |
| El rectángulo sale deformado o no aparece | Un campo usa `VertexElementUsage.Position`. | Usa `TextureCoordinate` con el índice del `location`. |
| `NullReferenceException` en `Parameters[...].SetValue` | El nombre del parámetro no existe. | El nombre es `<Campo>_<Miembro>`. |
| La ventana queda negra | Falta `Apply()` o `DrawUserPrimitives`, o el shader devuelve negro. | Revisa el juego de arriba y devuelve un color con `1` como último valor. |
| `add` falla con un error de red | La CLI está descargando el plugin y no llega a NuGet. | Revisa la conexión, o ejecuta `dotnet yotsuba plugin install kni` cuando tengas internet. |


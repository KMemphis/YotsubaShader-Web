---
title: Tu ventana para ver shaders
summary: Un visor pequeño que dibuja en una ventana el shader que elijas, para que veas cada cambio.
order: 5
---

Hasta ahora compilaste un shader y leíste su código en la consola. Pero un shader se hace para **verse**. Un shader del que no ves el resultado es como una receta que nunca cocinas: no aprendes nada.

Por eso, desde este capítulo cambia la forma de trabajar. Todo lo que sigue funciona así:

1. Escribes un poco de código.
2. Lo compilas.
3. Lo miras en una ventana.
4. Cambias un número y vuelves a mirar.

Para el paso 3 necesitas esa ventana. La vas a construir ahora, una sola vez.

## Qué es el visor

El visor es un programa de unas 70 líneas que hace tres cosas:

- Abre una ventana.
- Dibuja un rectángulo que la cubre entera (el mismo rectángulo de [Shader 1](first-shader.md)).
- Le pone encima el shader que le indiques por nombre.

Fíjate en una cosa: el visor **no forma parte de tu shader**. Tus shaders siguen en `MisShaders`, sin saber nada de ventanas. El visor es solo una herramienta de trabajo, como un banco para probar piezas. Para abrir la ventana usamos MonoGame porque es corto y funciona igual en Windows, Mac y Linux. Cuando quieras llevar tus shaders a tu juego, usarás la misma librería con el motor que prefieras.

> [!NOTE]
> No hace falta que entiendas cada línea del visor para seguir. Si te da curiosidad, la guía de [MonoGame](../engines/monogame.md) explica una por una las partes que aquí solo mencionamos.

## Paso 1: crea el proyecto

Desde la carpeta `Tutorial`:

```bash
dotnet new console -n Visor -f net8.0
dotnet add Visor package MonoGame.Framework.DesktopGL --version 3.8.6.1
dotnet add Visor reference MisShaders/MisShaders.csproj
```

- La primera línea crea un programa de consola vacío llamado `Visor`.
- La segunda le agrega MonoGame, que es quien abre la ventana.
- La tercera le dice que puede usar tus shaders. Así, cada cambio que hagas en `MisShaders` lo verá el visor sin copiar nada.

Tu carpeta queda así:

```text
Tutorial/
├── MisShaders/       tus shaders
├── Probar/           la consola del capítulo anterior
└── Visor/            nuevo: la ventana
```

## Paso 2: describe el vértice, del lado de la ventana

En [Cómo se construye un shader](how-a-shader-is-built.md) viste que el juego le entrega al shader una lista de vértices, y que cada uno trae una posición y un `Uv`. En el shader ya escribiste cómo es un vértice (el struct `Vertice`). Ahora hay que escribir **lo mismo del lado de C# normal**, para que ventana y shader se entiendan.

Crea `Visor/Esquina.cs`:

```csharp title="Visor/Esquina.cs"
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;

public readonly struct Esquina(Vector2 posicion, Vector2 uv) : IVertexType
{
    private static readonly VertexDeclaration Declaracion = new(
        new VertexElement(0, VertexElementFormat.Vector2, VertexElementUsage.TextureCoordinate, 0),
        new VertexElement(8, VertexElementFormat.Vector2, VertexElementUsage.TextureCoordinate, 1));

    public readonly Vector2 Posicion = posicion;
    public readonly Vector2 Uv = uv;

    VertexDeclaration IVertexType.VertexDeclaration => Declaracion;
}
```

Aquí lo único importante es que coincida con tu `Vertice`: primero dos números para la posición (ranura 0), luego dos para el `Uv` (ranura 1). Si algún día cambias `Vertice`, tendrás que cambiar `Esquina` igual.

## Paso 3: una ventana vacía

Reemplaza todo el contenido de `Visor/Program.cs` por esto:

```csharp title="Visor/Program.cs"
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;

string nombre = args.Length > 0 ? args[0] : "Degradado";

using var visor = new Visor(nombre);
visor.Run();

public class Visor : Game
{
    private readonly string _nombre;

    public Visor(string nombre)
    {
        _nombre = nombre;
        var graficos = new GraphicsDeviceManager(this)
        {
            PreferredBackBufferWidth = 800,
            PreferredBackBufferHeight = 450,
        };
        Window.AllowUserResizing = true;
        Window.Title = nombre;
    }

    protected override void Update(GameTime gameTime)
    {
        if (Keyboard.GetState().IsKeyDown(Keys.Escape))
        {
            Exit();
        }
        base.Update(gameTime);
    }

    protected override void Draw(GameTime gameTime)
    {
        GraphicsDevice.Clear(Color.CornflowerBlue);
        base.Draw(gameTime);
    }
}
```

Mira las tres partes:

- La primera línea toma el nombre del shader que escribas al ejecutar. Si no escribes ninguno, usa `Degradado`.
- El constructor `Visor(...)` pide una ventana de 800 por 450 píxeles. Es ancha a propósito: más adelante te ayudará a descubrir un problema típico de los shaders. Además, puedes estirarla con el ratón.
- `Update` cierra la ventana cuando pulsas **Esc**. `Draw` la pinta de azul, por ahora.

Ejecútalo:

```bash
dotnet run --project Visor
```

Debe aparecer una ventana azul. Ciérrala con **Esc**. Si la ves, MonoGame funciona en tu equipo y no te falta nada.

## Paso 4: agrega el shader

Ahora vamos a hacer que la ventana dibuje un shader en vez de pintarse de azul. Son cuatro cambios en el mismo archivo. Hazlos uno por uno.

**Cambio 1.** Agrega estas líneas arriba del todo, junto a los otros `using`:

```csharp
using MisShaders;
using YotsubaShader;
```

**Cambio 2.** Dentro de la clase `Visor`, debajo de `private readonly string _nombre;`, agrega el shader y el rectángulo:

```csharp
    private Effect _shader = null!;

    private readonly Esquina[] _pantalla =
    [
        new(new Vector2(-1f,  1f), new Vector2(0f, 0f)),
        new(new Vector2( 1f,  1f), new Vector2(1f, 0f)),
        new(new Vector2(-1f, -1f), new Vector2(0f, 1f)),
        new(new Vector2( 1f, -1f), new Vector2(1f, 1f)),
    ];
```

Son las cuatro esquinas del rectángulo. Cada una dice dónde está en la pantalla (de `-1` a `1`) y cuál es su `Uv` (de `0` a `1`). Es la misma tabla que viste en el capítulo de cómo se construye un shader.

**Cambio 3.** Entre el constructor y `Update`, agrega un método nuevo que carga tu shader:

```csharp
    protected override void LoadContent()
    {
        MonoGamePlatform gl = MonoGamePlatform.DesktopGL;

        // Una línea por cada shader del tutorial: el nombre que escribes tras `--` y su clase.
        byte[] compilado = _nombre switch
        {
            "Degradado" => new Degradado().ToMGFX(gl),
            _ => throw new Exception($"El visor no conoce ningún shader llamado \"{_nombre}\". Agrégalo al switch."),
        };

        _shader = new Effect(GraphicsDevice, compilado);
    }
```

`ToMGFX` es el método que Yotsuba Shader crea para cada una de tus clases de shader: devuelve el shader compilado para MonoGame. El `switch` elige qué clase usar según el nombre que escribes tras `--` en la terminal. Por ahora solo conoce `Degradado`. **Cada vez que crees un shader nuevo agregarás una línea aquí**, y el capítulo te lo recordará. La última línea, `_ =>`, significa "cualquier otro nombre" y te da un error claro si lo escribes mal.

**Cambio 4.** Reemplaza el método `Draw` entero por este:

```csharp
    protected override void Draw(GameTime gameTime)
    {
        GraphicsDevice.Clear(Color.Black);
        GraphicsDevice.RasterizerState = RasterizerState.CullNone;

        // Si tu shader declara estos datos, el visor se los entrega.
        _shader.Parameters["Datos_Ancho"]?.SetValue((float)GraphicsDevice.Viewport.Width);
        _shader.Parameters["Datos_Alto"]?.SetValue((float)GraphicsDevice.Viewport.Height);
        _shader.Parameters["Datos_Segundos"]?.SetValue((float)gameTime.TotalGameTime.TotalSeconds);

        _shader.CurrentTechnique.Passes[0].Apply();
        GraphicsDevice.DrawUserPrimitives(PrimitiveType.TriangleStrip, _pantalla, 0, 2);

        base.Draw(gameTime);
    }
```

Las tres líneas que empiezan con `_shader.Parameters` son un adelanto: si tu shader pide el tamaño de la ventana o el tiempo, el visor se los da. Todavía no los usamos; en unos capítulos sabrás para qué sirven. Si tu shader no los pide, esas líneas no hacen nada.

Por si algo no te cuadra, así queda el archivo completo:

```csharp title="Visor/Program.cs"
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;
using MisShaders;
using YotsubaShader;

string nombre = args.Length > 0 ? args[0] : "Degradado";

using var visor = new Visor(nombre);
visor.Run();

public class Visor : Game
{
    private readonly string _nombre;
    private Effect _shader = null!;

    private readonly Esquina[] _pantalla =
    [
        new(new Vector2(-1f,  1f), new Vector2(0f, 0f)),
        new(new Vector2( 1f,  1f), new Vector2(1f, 0f)),
        new(new Vector2(-1f, -1f), new Vector2(0f, 1f)),
        new(new Vector2( 1f, -1f), new Vector2(1f, 1f)),
    ];

    public Visor(string nombre)
    {
        _nombre = nombre;
        var graficos = new GraphicsDeviceManager(this)
        {
            PreferredBackBufferWidth = 800,
            PreferredBackBufferHeight = 450,
        };
        Window.AllowUserResizing = true;
        Window.Title = nombre;
    }

    protected override void LoadContent()
    {
        MonoGamePlatform gl = MonoGamePlatform.DesktopGL;

        // Una línea por cada shader del tutorial: el nombre que escribes tras `--` y su clase.
        byte[] compilado = _nombre switch
        {
            "Degradado" => new Degradado().ToMGFX(gl),
            _ => throw new Exception($"El visor no conoce ningún shader llamado \"{_nombre}\". Agrégalo al switch."),
        };

        _shader = new Effect(GraphicsDevice, compilado);
    }

    protected override void Update(GameTime gameTime)
    {
        if (Keyboard.GetState().IsKeyDown(Keys.Escape))
        {
            Exit();
        }
        base.Update(gameTime);
    }

    protected override void Draw(GameTime gameTime)
    {
        GraphicsDevice.Clear(Color.Black);
        GraphicsDevice.RasterizerState = RasterizerState.CullNone;

        // Si tu shader declara estos datos, el visor se los entrega.
        _shader.Parameters["Datos_Ancho"]?.SetValue((float)GraphicsDevice.Viewport.Width);
        _shader.Parameters["Datos_Alto"]?.SetValue((float)GraphicsDevice.Viewport.Height);
        _shader.Parameters["Datos_Segundos"]?.SetValue((float)gameTime.TotalGameTime.TotalSeconds);

        _shader.CurrentTechnique.Passes[0].Apply();
        GraphicsDevice.DrawUserPrimitives(PrimitiveType.TriangleStrip, _pantalla, 0, 2);

        base.Draw(gameTime);
    }
}
```

## Paso 5: ve tu primer shader

Ahora sí. Tu `Degradado` del capítulo anterior ya está compilado, así que basta con ejecutar el visor:

```bash
dotnet run --project Visor -- Degradado
```

Lo que va después de `--` es el nombre del shader que le pasas al visor.

![Un degradado de atardecer: rosa arriba, naranja en el centro y amarillo abajo](../../assets/get-started/degradado.png)

Ese es tu shader, dibujado por la GPU de tu equipo. Ciérralo con **Esc**.

## El ciclo de trabajo

Ahora vas a aprender el ciclo que usarás el resto del tutorial. Es siempre el mismo:

1. **Editas** un archivo de `MisShaders`.
2. **Compilas** con `add`, para que tus cambios se conviertan en shader.
3. **Miras** con el visor.

Los dos últimos pasos caben en una línea, unidos por `&&` (que significa "y si salió bien, sigue con esto"):

```bash
dotnet yotsuba add MisShaders/MisShaders.csproj --target spirv && dotnet run --project Visor -- Degradado
```

Pruébalo ahora con tu primer experimento. Abre `MisShaders/Degradado.cs` y busca esta línea en `Fragment`:

```csharp
float rojo = 1f;
```

Cámbiala por esta:

```csharp
float rojo = pixel.Uv.X;
```

Guarda y ejecuta el comando de arriba:

![El mismo degradado, pero el rojo crece de izquierda a derecha: a la izquierda quedan el azul oscuro y el verde, a la derecha el rosa y el amarillo de antes](../../assets/get-started/taller/degradadox.png)

El rojo ya no vale lo mismo en toda la pantalla: ahora crece de izquierda a derecha, porque `pixel.Uv.X` va de `0` en el borde izquierdo a `1` en el derecho. En el borde izquierdo no hay nada de rojo y quedan solo el verde y el azul (azul oscuro arriba, verde abajo). En el derecho vuelve el atardecer de antes.

Acabas de hacer lo que vas a hacer cientos de veces: cambiar un número y ver qué pasa. Antes de seguir, devuelve la línea a `float rojo = 1f;`.

> [!NOTE]
> El ciclo tiene un paso más la primera vez que usas un shader: su línea en el `switch` del visor. Lo haces una vez por shader, nunca más.

> [!TIP]
> Guarda el comando del ciclo en un archivo de texto o en el historial de tu terminal. Vas a ejecutarlo muchas veces, y lo único que cambia es el nombre del final.

## Un archivo de partida

Para cada capítulo siguiente vas a crear un shader nuevo. Todos arrancan igual, con el mismo `Vertex` de siempre, así que conviene tenerlo como molde. Crea `MisShaders/Plantilla.cs`:

```csharp style=glsl title="MisShaders/Plantilla.cs"
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.Language;

namespace MisShaders;

public class Plantilla
{
    [ShaderStage(Stage.Vertex)]
    public Pixel Vertex(Vertice vertice)
    {
        Pixel pixel;
        pixel.Posicion = Crear.Vec4(vertice.Posicion.X, vertice.Posicion.Y, 0f, 1f);
        pixel.Uv = vertice.Uv;
        return pixel;
    }

    [ShaderStage(Stage.Fragment)]
    [return: location(0)]
    public vec4 Fragment(PixelIn pixel)
    {
        return Crear.Vec4(0f, 0f, 0f, 1f);
    }
}
```

```csharp style=hlsl title="MisShaders/Plantilla.cs"
using YotsubaShader.HlslSyntax;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.Language;

namespace MisShaders;

public class Plantilla
{
    [ShaderStage(Stage.Vertex)]
    public Pixel Vertex(Vertice vertice)
    {
        Pixel pixel;
        pixel.Posicion = Crear.Vec4(vertice.Posicion.X, vertice.Posicion.Y, 0f, 1f);
        pixel.Uv = vertice.Uv;
        return pixel;
    }

    [ShaderStage(Stage.Fragment)]
    [return: SV_Target]
    public vec4 Fragment(PixelIn pixel)
    {
        return Crear.Vec4(0f, 0f, 0f, 1f);
    }
}
```

```csharp style=msl title="MisShaders/Plantilla.cs"
using YotsubaShader.MslSyntax;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.Language;

namespace MisShaders;

public class Plantilla
{
    [ShaderStage(Stage.Vertex)]
    public Pixel Vertex(Vertice vertice)
    {
        Pixel pixel;
        pixel.Posicion = Crear.Vec4(vertice.Posicion.X, vertice.Posicion.Y, 0f, 1f);
        pixel.Uv = vertice.Uv;
        return pixel;
    }

    [ShaderStage(Stage.Fragment)]
    [return: color(0)]
    public vec4 Fragment(PixelIn pixel)
    {
        return Crear.Vec4(0f, 0f, 0f, 1f);
    }
}
```

```csharp style=wgsl title="MisShaders/Plantilla.cs"
using YotsubaShader.WgslSyntax;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.Language;

namespace MisShaders;

public class Plantilla
{
    [ShaderStage(Stage.Vertex)]
    public Pixel Vertex(Vertice vertice)
    {
        Pixel pixel;
        pixel.Posicion = Crear.Vec4(vertice.Posicion.X, vertice.Posicion.Y, 0f, 1f);
        pixel.Uv = vertice.Uv;
        return pixel;
    }

    [ShaderStage(Stage.Fragment)]
    [return: location(0)]
    public vec4 Fragment(PixelIn pixel)
    {
        return Crear.Vec4(0f, 0f, 0f, 1f);
    }
}
```

```csharp style=spirv title="MisShaders/Plantilla.cs"
using YotsubaShader.SpirvSyntax;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.Language;

namespace MisShaders;

public class Plantilla
{
    [ShaderStage(Stage.Vertex)]
    public Pixel Vertex(Vertice vertice)
    {
        Pixel pixel;
        pixel.Posicion = Crear.Vec4(vertice.Posicion.X, vertice.Posicion.Y, 0f, 1f);
        pixel.Uv = vertice.Uv;
        return pixel;
    }

    [ShaderStage(Stage.Fragment)]
    [return: Location(0)]
    public vec4 Fragment(PixelIn pixel)
    {
        return Crear.Vec4(0f, 0f, 0f, 1f);
    }
}
```

El `Fragment` de esta plantilla devuelve negro (`0, 0, 0`). Es un shader que todavía no hace nada, listo para que tú le pongas lo suyo.

Cuando un capítulo te diga "copia `Plantilla.cs` como `Colores.cs`", haz esto:

1. Copia el archivo y llámalo `Colores.cs`.
2. Dentro, cambia `public class Plantilla` por `public class Colores`.

El nombre de la clase tiene que coincidir con lo que escribes después de `--` en el visor.

Comprueba que todo funciona ejecutando la plantilla. Primero agrega su línea al `switch` de `Visor/Program.cs`, encima de la línea `_ =>`:

```csharp
            "Plantilla" => new Plantilla().ToMGFX(gl),
```

Luego ejecuta:

```bash
dotnet yotsuba add MisShaders/MisShaders.csproj --target spirv && dotnet run --project Visor -- Plantilla
```

Debe abrirse una ventana completamente negra. Si la ves, estás listo.

## Si algo falla

| Lo que ves | Qué significa | Qué hacer |
|---|---|---|
| `El visor no conoce ningún shader llamado "Colores"` | El nombre no tiene su línea en el `switch` del visor, o lo escribiste mal. | Agrega `"Colores" => new Colores().ToMGFX(gl),` al `switch` y revisa las mayúsculas. |
| La ventana muestra el shader viejo | Cambiaste el archivo pero no ejecutaste `add`. | Usa el comando del ciclo, que hace las dos cosas. |
| `error CS0234` al ejecutar `add` | Borraste o renombraste una clase y `YotsubaShader.g.cs` todavía la nombra. | Borra `MisShaders/YotsubaShader.g.cs` y vuelve a ejecutar. |
| Error `CS` con un número y una línea | Es un error de C# normal en tu código. | Léelo, ve a esa línea y corrige. `add` no sigue hasta que compile. |
| La ventana no se abre y no hay error | A veces queda detrás de otras ventanas. | Búscala en la barra de tareas o en el Dock. |

## Lo que aprendiste

- Para ver un shader hace falta una ventana. El visor es esa ventana, y es una herramienta aparte: tus shaders no dependen de ella.
- El ciclo de trabajo es editar, compilar con `add` y mirar con el visor.
- `Plantilla.cs` es el molde de todos los shaders que vienen: un `Vertex` ya escrito y un `Fragment` que devuelve negro.

Siguiente: [Los colores](colors.md).

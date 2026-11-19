---
title: Funciones y structs
summary: Cómo ordenar un shader que crece, escribiendo tus propias funciones y tus propios tipos de datos.
order: 9
---

A medida que un shader crece, empieza a repetirse. Vas a ver ese problema en acción dibujando una cara. Primero la dibujarás de la forma más directa, notarás que el código se vuelve pesado, y luego lo arreglarás con funciones. Ese es el orden correcto para aprender esto: sentir el problema antes de usar la herramienta.

## Paso 1: el cielo y las medidas

Copia `Plantilla.cs` como `Carita.cs` y cambia el nombre de la clase por `Carita`.

Esta vez vamos a medir de una forma más cómoda. En vez de que `X` e `Y` vayan de `0` a `1`, haremos que **la altura de la ventana mida 1** y que el ancho mida lo que corresponda. Así un círculo de radio `0.4` es redondo sin tener que compensar cada vez.

Como necesitamos el tamaño de la ventana, declara el uniform, igual que en los capítulos anteriores. Arriba, con los `using`:

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

Y dentro de la clase, antes de `Vertex`:

```csharp style=glsl
    [uniform, layout(0, 0)]
    public Entorno Datos;
```

```csharp style=hlsl
    [cbuffer, register("b0")]
    public Entorno Datos;
```

```csharp style=msl
    [constant, buffer(0)]
    public Entorno Datos;
```

```csharp style=wgsl
    [uniform, @group(0), @binding(0)]
    public Entorno Datos;
```

```csharp style=spirv
    [Uniform, DescriptorSet(0), Binding(0)]
    public Entorno Datos;
```

Ahora reemplaza `Fragment` por esto:

```csharp
float aspecto = Datos.Ancho / Datos.Alto;
float x = pixel.Uv.X * aspecto;
float y = pixel.Uv.Y;
float medio = aspecto * 0.5f;

vec4 color = Crear.Vec4(0.55f, 0.8f, 1f, 1f);

return color;
```

- `x` ahora va de `0` a `aspecto` (con una ventana de 800 por 450, de `0` a `1,78`), e `y` va de `0` a `1`.
- `medio` es la mitad del ancho: el centro de la ventana en horizontal.
- `color` es una variable de tipo `vec4`. Empieza siendo el color del cielo, y vamos a ir **cambiándola** si el píxel cae dentro de algún objeto.

Ejecuta el ciclo de trabajo:

{{register Carita}}

Verás una ventana de un azul cielo liso. Es poco, pero es la base de todo.

## Paso 2: la cabeza

Agrega esto **entre** la línea de `vec4 color = ...` y el `return color;`:

```csharp
float dx = x - medio;
float dy = y - 0.5f;
if (dx * dx + dy * dy < 0.4f * 0.4f)
{
    color = Crear.Vec4(1f, 0.85f, 0.2f, 1f);
}
```

Es el círculo del capítulo anterior: centro en `(medio, 0.5)`, radio `0.4`. Pero con una diferencia importante: en vez de hacer `return` dentro del `if`, **cambiamos la variable `color`**. Así el shader sigue y todavía puede pintar más cosas encima.

Ejecuta el ciclo de trabajo. Verás un círculo amarillo sobre el cielo.

## Paso 3: los ojos

Ahora dos ojos. Agrega esto justo debajo de lo anterior, siempre antes del `return color;`:

```csharp
dx = x - (medio - 0.15f);
dy = y - 0.4f;
if (dx * dx + dy * dy < 0.06f * 0.06f)
{
    color = Crear.Vec4(0.1f, 0.1f, 0.1f, 1f);
}

dx = x - (medio + 0.15f);
dy = y - 0.4f;
if (dx * dx + dy * dy < 0.06f * 0.06f)
{
    color = Crear.Vec4(0.1f, 0.1f, 0.1f, 1f);
}
```

Fíjate en que reusamos `dx` y `dy` (sin volver a escribir `float`): solo les damos un valor nuevo. Un ojo está a `0.15` a la izquierda del centro y el otro a `0.15` a la derecha.

Ejecuta el ciclo de trabajo. Ya tienes una cara con dos ojos. Y hay otra idea importante escondida aquí: **el orden en que pintas importa**. Los ojos están después de la cabeza, así que se pintan encima. Si pusieras los ojos primero y la cabeza después, la cabeza los taparía.

## Paso 4: la boca

La boca será un rectángulo. Agrega esto, también antes del `return`:

```csharp
if (x > medio - 0.15f && x < medio + 0.15f && y > 0.65f && y < 0.7f)
{
    color = Crear.Vec4(0.1f, 0.1f, 0.1f, 1f);
}
```

Ejecuta el ciclo de trabajo.

![Una cara amarilla con dos ojos negros y una boca recta, sobre un cielo azul claro](../../assets/get-started/taller/fu1.png)

Funciona. Ahora mira con calma lo que escribiste.

## El problema: el código se repite

Los dos ojos tienen **casi el mismo código**. Y la cabeza también, con otros números. Si quisieras añadir una nariz, copiarías el bloque otra vez. Si te equivocaras en una cuenta, tendrías que corregirla en tres sitios. Y el shader ya cuesta leerlo, y solo tiene tres círculos.

Cuando ves que copias y pegas un bloque cambiando solo unos números, es la señal de que falta una **función**.

## Paso 5: tu primera función

Una función es un trozo de código con nombre al que le pasas datos y te devuelve un resultado. Ya has usado varias: `Crear.Vec4` es una.

Vamos a escribir una que responda a la pregunta *"¿este punto está dentro de este círculo?"*. Agrégala **dentro de la clase `Carita`, después de la función `Fragment`**:

```csharp
    public static bool EnCirculo(float x, float y, float centroX, float centroY, float radio)
    {
        float dx = x - centroX;
        float dy = y - centroY;
        return dx * dx + dy * dy < radio * radio;
    }
```

Veamos cada parte de la primera línea:

| Parte | Significado |
|---|---|
| `public` | Se puede usar desde fuera. Escríbelo siempre. |
| `static` | La función no depende de ningún dato de la clase. Todas las funciones que escribas para ayudar a un shader deben llevarlo. |
| `bool` | Lo que **devuelve**: verdadero o falso. |
| `EnCirculo` | El nombre que tú eliges. |
| `(float x, float y, ...)` | Lo que **recibe**: cinco números con nombre. |

Y el cuerpo es lo mismo que ya escribías: hace la cuenta de qué tan lejos está el punto y la compara con el radio. El `return` entrega el resultado: `true` si el punto está dentro, `false` si no.

Ahora úsala. En `Fragment`, **borra** los tres bloques de círculos (la cabeza y los dos ojos, con sus `dx` y `dy`) y escribe en su lugar:

```csharp
if (EnCirculo(x, y, medio, 0.5f, 0.4f))
{
    color = Crear.Vec4(1f, 0.85f, 0.2f, 1f);
}
if (EnCirculo(x, y, medio - 0.15f, 0.4f, 0.06f))
{
    color = Crear.Vec4(0.1f, 0.1f, 0.1f, 1f);
}
if (EnCirculo(x, y, medio + 0.15f, 0.4f, 0.06f))
{
    color = Crear.Vec4(0.1f, 0.1f, 0.1f, 1f);
}
```

Ejecuta el ciclo de trabajo: **la imagen es idéntica**. Lo importante es que ahora cada círculo ocupa tres líneas y se lee de un vistazo: *"si está en el círculo con centro tal y radio tal, píntalo de este color"*.

> [!NOTE]
> Los datos que recibe una función se llaman **parámetros**, y son **copias**. Si dentro de `EnCirculo` escribieras `x = 0f;`, solo cambiarías la copia, y la `x` de `Fragment` seguiría igual. Es lo normal en C#, y en un shader es obligatorio: las funciones no pueden modificar las variables de quien las llama. Lo que haces es devolver un resultado con `return`.

## Paso 6: otra función, para el rectángulo

La boca también se puede escribir mejor. Agrega esta segunda función, debajo de `EnCirculo`:

```csharp
    public static bool EnRectangulo(float x, float y, float izquierda, float arriba, float derecha, float abajo)
    {
        return x > izquierda && x < derecha && y > arriba && y < abajo;
    }
```

Y en `Fragment` reemplaza el bloque de la boca por:

```csharp
if (EnRectangulo(x, y, medio - 0.15f, 0.65f, medio + 0.15f, 0.7f))
{
    color = Crear.Vec4(0.1f, 0.1f, 0.1f, 1f);
}
```

Fíjate en lo bien que se lee ahora la llamada. Sin mirar la función, ya sabes lo que hace.

## Paso 7: ponle nombre a los colores

Hay otro tipo de repetición: el mismo color escrito tres veces (`Crear.Vec4(0.1f, 0.1f, 0.1f, 1f)` en los ojos y la boca). Si quisieras cambiar el negro por un marrón, tendrías que tocar tres líneas.

La solución es guardar cada color en una variable **con un buen nombre**, al principio. Reemplaza la línea `vec4 color = Crear.Vec4(0.55f, 0.8f, 1f, 1f);` por estas cuatro:

```csharp
vec4 cielo = Crear.Vec4(0.55f, 0.8f, 1f, 1f);
vec4 piel = Crear.Vec4(1f, 0.85f, 0.2f, 1f);
vec4 tinta = Crear.Vec4(0.1f, 0.1f, 0.1f, 1f);

vec4 color = cielo;
```

Y cambia en los `if` cada `Crear.Vec4(...)` por el nombre que corresponda: `color = piel;` para la cabeza y `color = tinta;` para los ojos y la boca. Ejecuta el ciclo de trabajo para comprobar que no cambió nada.

Ahora, si quieres que la cara sea verde, cambias **una sola línea**.

## Paso 8: tus propios tipos de datos

Todavía hay algo que se puede mejorar. Cada círculo se describe con tres números sueltos (`x`, `y` y radio), y a la función tenemos que pasárselos siempre en el orden correcto. Es fácil confundir el centro con el radio.

En C# puedes guardar en un mismo sitio los datos que van juntos. Eso es un `struct`: una caja con nombre. De hecho, ya usas uno todo el tiempo: `vec4` es un struct que guarda cuatro números. Ahora vas a hacer el tuyo.

Agrega esto dentro de la clase `Carita`, debajo de las funciones:

```csharp
    public struct Circulo
    {
        public float X;
        public float Y;
        public float Radio;
    }

    public static Circulo NuevoCirculo(float x, float y, float radio)
    {
        Circulo c;
        c.X = x;
        c.Y = y;
        c.Radio = radio;
        return c;
    }

    public static bool Contiene(Circulo c, float x, float y)
    {
        float dx = x - c.X;
        float dy = y - c.Y;
        return dx * dx + dy * dy < c.Radio * c.Radio;
    }
```

- `Circulo` es el tipo nuevo: tres campos.
- `NuevoCirculo` es una función que lo arma. Es la misma idea que `Crear.Vec4`: un `struct` no tiene constructor en un shader, así que se llena campo por campo.
- `Contiene` es `EnCirculo` reescrita: en vez de cinco números, recibe un `Circulo` y un punto.

Reemplaza el contenido de `Fragment` por la versión final. Ahora los círculos se **declaran una vez** y luego se usan:

```csharp
float aspecto = Datos.Ancho / Datos.Alto;
float x = pixel.Uv.X * aspecto;
float y = pixel.Uv.Y;
float medio = aspecto * 0.5f;

Circulo cabeza = NuevoCirculo(medio, 0.5f, 0.4f);
Circulo ojoIzquierdo = NuevoCirculo(medio - 0.15f, 0.4f, 0.06f);
Circulo ojoDerecho = NuevoCirculo(medio + 0.15f, 0.4f, 0.06f);

vec4 cielo = Crear.Vec4(0.55f, 0.8f, 1f, 1f);
vec4 piel = Crear.Vec4(1f, 0.85f, 0.2f, 1f);
vec4 tinta = Crear.Vec4(0.1f, 0.1f, 0.1f, 1f);

vec4 color = cielo;

if (Contiene(cabeza, x, y))
{
    color = piel;
}
if (Contiene(ojoIzquierdo, x, y) || Contiene(ojoDerecho, x, y))
{
    color = tinta;
}
if (EnRectangulo(x, y, medio - 0.15f, 0.65f, medio + 0.15f, 0.7f))
{
    color = tinta;
}

return color;
```

Ejecuta el ciclo de trabajo. Es la misma cara de antes, pero fíjate en cómo se lee el shader: primero **qué hay** en la escena (cabeza, ojos, colores) y después **cómo se pinta**. Para mover un ojo, cambias un número en una línea con nombre. Para añadir un tercero, copias una línea.

## Qué no se puede hacer

Un shader corre en la GPU, y la GPU no deja hacer todo lo que deja tu PC. Para las funciones, las que más te afectan:

- Una función **no puede llamarse a sí misma** (recursión). Si necesitas repetir algo, usa un bucle, que veremos pronto.
- Los datos que recibe una función no pueden llevar `ref`, `out` ni `in`. Para devolver varios valores, devuelve un `struct`.
- Todas las funciones que escribas deben ser `static`.

## Todo junto

Este es el archivo completo de la cara con structs:

```csharp style=glsl title="MisShaders/Carita.cs"
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Resources;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.Language;

namespace MisShaders;

public class Carita
{
    [uniform, layout(0, 0)]
    public Entorno Datos;

    [ShaderStage(Stage.Vertex)]
    public Pixel Vertex({{vertexType}} vertice)
    {
        Pixel pixel;
        pixel.Posicion = Crear.Vec4(vertice.{{pos}}.X, vertice.{{pos}}.Y, 0f, 1f);
        pixel.Uv = vertice.{{uv}};
        return pixel;
    }

    [ShaderStage(Stage.Fragment)]
    [return: location(0)]
    public vec4 Fragment(PixelIn pixel)
    {
        float aspecto = Datos.Ancho / Datos.Alto;
        float x = pixel.Uv.X * aspecto;
        float y = pixel.Uv.Y;
        float medio = aspecto * 0.5f;

        Circulo cabeza = NuevoCirculo(medio, 0.5f, 0.4f);
        Circulo ojoIzquierdo = NuevoCirculo(medio - 0.15f, 0.4f, 0.06f);
        Circulo ojoDerecho = NuevoCirculo(medio + 0.15f, 0.4f, 0.06f);

        vec4 cielo = Crear.Vec4(0.55f, 0.8f, 1f, 1f);
        vec4 piel = Crear.Vec4(1f, 0.85f, 0.2f, 1f);
        vec4 tinta = Crear.Vec4(0.1f, 0.1f, 0.1f, 1f);

        vec4 color = cielo;

        if (Contiene(cabeza, x, y))
        {
            color = piel;
        }
        if (Contiene(ojoIzquierdo, x, y) || Contiene(ojoDerecho, x, y))
        {
            color = tinta;
        }
        if (EnRectangulo(x, y, medio - 0.15f, 0.65f, medio + 0.15f, 0.7f))
        {
            color = tinta;
        }

        return color;
    }

    public struct Circulo
    {
        public float X;
        public float Y;
        public float Radio;
    }

    public static Circulo NuevoCirculo(float x, float y, float radio)
    {
        Circulo c;
        c.X = x;
        c.Y = y;
        c.Radio = radio;
        return c;
    }

    public static bool Contiene(Circulo c, float x, float y)
    {
        float dx = x - c.X;
        float dy = y - c.Y;
        return dx * dx + dy * dy < c.Radio * c.Radio;
    }

    public static bool EnRectangulo(float x, float y, float izquierda, float arriba, float derecha, float abajo)
    {
        return x > izquierda && x < derecha && y > arriba && y < abajo;
    }
}
```

```csharp style=hlsl title="MisShaders/Carita.cs"
using YotsubaShader.HlslSyntax;
using YotsubaShader.HlslSyntax.Resources;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.Language;

namespace MisShaders;

public class Carita
{
    [cbuffer, register("b0")]
    public Entorno Datos;

    [ShaderStage(Stage.Vertex)]
    public Pixel Vertex({{vertexType}} vertice)
    {
        Pixel pixel;
        pixel.Posicion = Crear.Vec4(vertice.{{pos}}.X, vertice.{{pos}}.Y, 0f, 1f);
        pixel.Uv = vertice.{{uv}};
        return pixel;
    }

    [ShaderStage(Stage.Fragment)]
    [return: SV_Target]
    public vec4 Fragment(PixelIn pixel)
    {
        float aspecto = Datos.Ancho / Datos.Alto;
        float x = pixel.Uv.X * aspecto;
        float y = pixel.Uv.Y;
        float medio = aspecto * 0.5f;

        Circulo cabeza = NuevoCirculo(medio, 0.5f, 0.4f);
        Circulo ojoIzquierdo = NuevoCirculo(medio - 0.15f, 0.4f, 0.06f);
        Circulo ojoDerecho = NuevoCirculo(medio + 0.15f, 0.4f, 0.06f);

        vec4 cielo = Crear.Vec4(0.55f, 0.8f, 1f, 1f);
        vec4 piel = Crear.Vec4(1f, 0.85f, 0.2f, 1f);
        vec4 tinta = Crear.Vec4(0.1f, 0.1f, 0.1f, 1f);

        vec4 color = cielo;

        if (Contiene(cabeza, x, y))
        {
            color = piel;
        }
        if (Contiene(ojoIzquierdo, x, y) || Contiene(ojoDerecho, x, y))
        {
            color = tinta;
        }
        if (EnRectangulo(x, y, medio - 0.15f, 0.65f, medio + 0.15f, 0.7f))
        {
            color = tinta;
        }

        return color;
    }

    public struct Circulo
    {
        public float X;
        public float Y;
        public float Radio;
    }

    public static Circulo NuevoCirculo(float x, float y, float radio)
    {
        Circulo c;
        c.X = x;
        c.Y = y;
        c.Radio = radio;
        return c;
    }

    public static bool Contiene(Circulo c, float x, float y)
    {
        float dx = x - c.X;
        float dy = y - c.Y;
        return dx * dx + dy * dy < c.Radio * c.Radio;
    }

    public static bool EnRectangulo(float x, float y, float izquierda, float arriba, float derecha, float abajo)
    {
        return x > izquierda && x < derecha && y > arriba && y < abajo;
    }
}
```

```csharp style=msl title="MisShaders/Carita.cs"
using YotsubaShader.MslSyntax;
using YotsubaShader.MslSyntax.Resources;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.Language;

namespace MisShaders;

public class Carita
{
    [constant, buffer(0)]
    public Entorno Datos;

    [ShaderStage(Stage.Vertex)]
    public Pixel Vertex({{vertexType}} vertice)
    {
        Pixel pixel;
        pixel.Posicion = Crear.Vec4(vertice.{{pos}}.X, vertice.{{pos}}.Y, 0f, 1f);
        pixel.Uv = vertice.{{uv}};
        return pixel;
    }

    [ShaderStage(Stage.Fragment)]
    [return: color(0)]
    public vec4 Fragment(PixelIn pixel)
    {
        float aspecto = Datos.Ancho / Datos.Alto;
        float x = pixel.Uv.X * aspecto;
        float y = pixel.Uv.Y;
        float medio = aspecto * 0.5f;

        Circulo cabeza = NuevoCirculo(medio, 0.5f, 0.4f);
        Circulo ojoIzquierdo = NuevoCirculo(medio - 0.15f, 0.4f, 0.06f);
        Circulo ojoDerecho = NuevoCirculo(medio + 0.15f, 0.4f, 0.06f);

        vec4 cielo = Crear.Vec4(0.55f, 0.8f, 1f, 1f);
        vec4 piel = Crear.Vec4(1f, 0.85f, 0.2f, 1f);
        vec4 tinta = Crear.Vec4(0.1f, 0.1f, 0.1f, 1f);

        vec4 color = cielo;

        if (Contiene(cabeza, x, y))
        {
            color = piel;
        }
        if (Contiene(ojoIzquierdo, x, y) || Contiene(ojoDerecho, x, y))
        {
            color = tinta;
        }
        if (EnRectangulo(x, y, medio - 0.15f, 0.65f, medio + 0.15f, 0.7f))
        {
            color = tinta;
        }

        return color;
    }

    public struct Circulo
    {
        public float X;
        public float Y;
        public float Radio;
    }

    public static Circulo NuevoCirculo(float x, float y, float radio)
    {
        Circulo c;
        c.X = x;
        c.Y = y;
        c.Radio = radio;
        return c;
    }

    public static bool Contiene(Circulo c, float x, float y)
    {
        float dx = x - c.X;
        float dy = y - c.Y;
        return dx * dx + dy * dy < c.Radio * c.Radio;
    }

    public static bool EnRectangulo(float x, float y, float izquierda, float arriba, float derecha, float abajo)
    {
        return x > izquierda && x < derecha && y > arriba && y < abajo;
    }
}
```

```csharp style=wgsl title="MisShaders/Carita.cs"
using YotsubaShader.WgslSyntax;
using YotsubaShader.WgslSyntax.Resources;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.Language;

namespace MisShaders;

public class Carita
{
    [uniform, @group(0), @binding(0)]
    public Entorno Datos;

    [ShaderStage(Stage.Vertex)]
    public Pixel Vertex({{vertexType}} vertice)
    {
        Pixel pixel;
        pixel.Posicion = Crear.Vec4(vertice.{{pos}}.X, vertice.{{pos}}.Y, 0f, 1f);
        pixel.Uv = vertice.{{uv}};
        return pixel;
    }

    [ShaderStage(Stage.Fragment)]
    [return: location(0)]
    public vec4 Fragment(PixelIn pixel)
    {
        float aspecto = Datos.Ancho / Datos.Alto;
        float x = pixel.Uv.X * aspecto;
        float y = pixel.Uv.Y;
        float medio = aspecto * 0.5f;

        Circulo cabeza = NuevoCirculo(medio, 0.5f, 0.4f);
        Circulo ojoIzquierdo = NuevoCirculo(medio - 0.15f, 0.4f, 0.06f);
        Circulo ojoDerecho = NuevoCirculo(medio + 0.15f, 0.4f, 0.06f);

        vec4 cielo = Crear.Vec4(0.55f, 0.8f, 1f, 1f);
        vec4 piel = Crear.Vec4(1f, 0.85f, 0.2f, 1f);
        vec4 tinta = Crear.Vec4(0.1f, 0.1f, 0.1f, 1f);

        vec4 color = cielo;

        if (Contiene(cabeza, x, y))
        {
            color = piel;
        }
        if (Contiene(ojoIzquierdo, x, y) || Contiene(ojoDerecho, x, y))
        {
            color = tinta;
        }
        if (EnRectangulo(x, y, medio - 0.15f, 0.65f, medio + 0.15f, 0.7f))
        {
            color = tinta;
        }

        return color;
    }

    public struct Circulo
    {
        public float X;
        public float Y;
        public float Radio;
    }

    public static Circulo NuevoCirculo(float x, float y, float radio)
    {
        Circulo c;
        c.X = x;
        c.Y = y;
        c.Radio = radio;
        return c;
    }

    public static bool Contiene(Circulo c, float x, float y)
    {
        float dx = x - c.X;
        float dy = y - c.Y;
        return dx * dx + dy * dy < c.Radio * c.Radio;
    }

    public static bool EnRectangulo(float x, float y, float izquierda, float arriba, float derecha, float abajo)
    {
        return x > izquierda && x < derecha && y > arriba && y < abajo;
    }
}
```

```csharp style=spirv title="MisShaders/Carita.cs"
using YotsubaShader.SpirvSyntax;
using YotsubaShader.SpirvSyntax.Resources;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.Language;

namespace MisShaders;

public class Carita
{
    [Uniform, DescriptorSet(0), Binding(0)]
    public Entorno Datos;

    [ShaderStage(Stage.Vertex)]
    public Pixel Vertex({{vertexType}} vertice)
    {
        Pixel pixel;
        pixel.Posicion = Crear.Vec4(vertice.{{pos}}.X, vertice.{{pos}}.Y, 0f, 1f);
        pixel.Uv = vertice.{{uv}};
        return pixel;
    }

    [ShaderStage(Stage.Fragment)]
    [return: Location(0)]
    public vec4 Fragment(PixelIn pixel)
    {
        float aspecto = Datos.Ancho / Datos.Alto;
        float x = pixel.Uv.X * aspecto;
        float y = pixel.Uv.Y;
        float medio = aspecto * 0.5f;

        Circulo cabeza = NuevoCirculo(medio, 0.5f, 0.4f);
        Circulo ojoIzquierdo = NuevoCirculo(medio - 0.15f, 0.4f, 0.06f);
        Circulo ojoDerecho = NuevoCirculo(medio + 0.15f, 0.4f, 0.06f);

        vec4 cielo = Crear.Vec4(0.55f, 0.8f, 1f, 1f);
        vec4 piel = Crear.Vec4(1f, 0.85f, 0.2f, 1f);
        vec4 tinta = Crear.Vec4(0.1f, 0.1f, 0.1f, 1f);

        vec4 color = cielo;

        if (Contiene(cabeza, x, y))
        {
            color = piel;
        }
        if (Contiene(ojoIzquierdo, x, y) || Contiene(ojoDerecho, x, y))
        {
            color = tinta;
        }
        if (EnRectangulo(x, y, medio - 0.15f, 0.65f, medio + 0.15f, 0.7f))
        {
            color = tinta;
        }

        return color;
    }

    public struct Circulo
    {
        public float X;
        public float Y;
        public float Radio;
    }

    public static Circulo NuevoCirculo(float x, float y, float radio)
    {
        Circulo c;
        c.X = x;
        c.Y = y;
        c.Radio = radio;
        return c;
    }

    public static bool Contiene(Circulo c, float x, float y)
    {
        float dx = x - c.X;
        float dy = y - c.Y;
        return dx * dx + dy * dy < c.Radio * c.Radio;
    }

    public static bool EnRectangulo(float x, float y, float izquierda, float arriba, float derecha, float abajo)
    {
        return x > izquierda && x < derecha && y > arriba && y < abajo;
    }
}
```

## Lo que aprendiste

- Si copias y pegas un bloque cambiando solo unos números, necesitas una **función**.
- Una función tiene tres partes: lo que devuelve, su nombre y lo que recibe. Lo que recibe son copias.
- Las funciones de ayuda de un shader se escriben `public static` dentro de la clase.
- **El orden importa:** lo que pintas después queda encima.
- Un `struct` agrupa datos que van juntos y le da nombre a la idea. Se llena campo por campo.

Siguiente: [Mezclar y suavizar](mixing.md).

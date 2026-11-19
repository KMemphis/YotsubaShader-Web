---
title: El tiempo
summary: Cómo hacer que un shader se mueva, usando el reloj que le entrega el programa.
order: 12
---

Hasta ahora tus imágenes están quietas. Un shader de verdad se mueve: el agua ondula, el fuego parpadea, la luz cambia. Y la sorpresa es que, para lograr eso, **no hace falta nada nuevo**. Ya sabes todo lo necesario.

## Cómo se mueve algo que no tiene memoria

Aquí hay una idea que conviene entender bien, porque es lo contrario de lo que haces en un juego normal.

En un juego normal, para mover una bola, guardas su posición en una variable y la cambias un poquito en cada fotograma. Tu programa **recuerda** dónde estaba.

Un shader no recuerda nada. En cada fotograma empieza de cero: se ejecuta, devuelve el color, y se olvida de todo. No puede decir "la bola estaba aquí y ahora la muevo un poco".

Entonces, ¿cómo se mueve algo? Con un truco muy simple: **el programa le dice qué hora es**. El shader recibe un número, los segundos que pasaron desde que arrancó, y calcula la posición de la bola **a partir de ese número**. A los 2 segundos, la bola está aquí. A los 3, está allá. Cada fotograma, el reloj marca algo distinto, y por eso la imagen cambia.

Ese número es un uniform, igual que el ancho y el alto de la ventana. Y ya sabes cómo se declara.

## Paso 1: agrega el reloj

Abre `MisShaders/Entorno.cs` y agrega un tercer campo:

```csharp title="MisShaders/Entorno.cs"
namespace MisShaders;

public struct Entorno
{
    public float Ancho;
    public float Alto;
    public float Segundos;
}
```

Con eso, `Datos.Segundos` existe. El visor ya sabe llenarlo: en cada fotograma busca `Datos_Segundos` y le pone el tiempo que lleva abierto.

Copia `Plantilla.cs` como `Tiempo.cs`, cambia el nombre de la clase por `Tiempo` y declara el uniform, como siempre. Arriba:

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

Y antes de `Vertex`:

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

## Paso 2: un color que va y viene

Reemplaza la línea de `Fragment` por esta:

```csharp
float t = Datos.Segundos % 1f;
return Crear.Vec4(t, t, t, 1f);
```

Ejecuta el ciclo de trabajo:

Pero primero, avisa al visor del nuevo shader. En `Visor/Program.cs`, agrega esta línea al `switch`, encima de la línea `_ =>`:

```csharp
            "Tiempo" => new Tiempo().ToMGFX(gl),
```

Ahora sí, ejecútalo:

```bash
dotnet yotsuba add MisShaders/MisShaders.csproj --target spirv && dotnet run --project Visor -- Tiempo
```

La ventana se pone cada vez más clara durante un segundo, y de golpe vuelve a negro, y repite. ¿Por qué?

`Datos.Segundos` crece sin parar: `0.1, 0.5, 1.2, 2.7, ...`. Pero `% 1f` solo se queda con la parte decimal, como en el capítulo de las coordenadas, así que `t` sube de `0` a `1` y vuelve a empezar. Es la misma técnica de las franjas, pero en el tiempo en vez de en el espacio.

El salto brusco de blanco a negro no es muy agradable. Vamos a arreglarlo para que suba y baje, sin saltos.

## Paso 3: subir y bajar sin saltos

Si `t` sube de `0` a `1`, para que luego **baje** podemos hacer que, al pasar de la mitad, empiece a ir hacia atrás. Reemplaza el contenido por esto:

```csharp
float t = Datos.Segundos % 1f;
if (t > 0.5f)
{
    t = 1f - t;
}
float brillo = t * 2f;
return Crear.Vec4(brillo, brillo, brillo, 1f);
```

Mira cómo se comporta `t` con el paso del tiempo:

| `Segundos % 1` | `t` después del `if` | `brillo` |
|---|---|---|
| 0.0 | 0.0 | 0.0 |
| 0.25 | 0.25 | 0.5 |
| 0.5 | 0.5 | 1.0 |
| 0.75 | 0.25 (porque `1 - 0.75`) | 0.5 |
| 1.0 → vuelve a 0 | 0.0 | 0.0 |

Sube de `0` a `1` en medio segundo y baja de `1` a `0` en el otro medio. La luz **respira**, sin saltos. A este sube y baja se le llama onda triangular, porque dibujado en un papel parece una fila de triángulos.

Cambia el `1f` del `%` por `3f`, y respirará más lento: tres segundos por vuelta completa. Cambia `Datos.Segundos` por `Datos.Segundos * 4f` y irá cuatro veces más rápido. Multiplicar el tiempo es la forma de controlar la velocidad.

## Paso 4: una bola que rebota

Ahora combina lo que ya sabes: un círculo, y una posición que depende del tiempo. Reemplaza `Fragment` por esto:

```csharp
float aspecto = Datos.Ancho / Datos.Alto;
float x = pixel.Uv.X * aspecto;
float y = pixel.Uv.Y;

float avance = (Datos.Segundos * 0.4f) % 2f;
if (avance > 1f)
{
    avance = 2f - avance;
}
float centroX = 0.15f + avance * (aspecto - 0.3f);

float dx = x - centroX;
float dy = y - 0.5f;
if (dx * dx + dy * dy < 0.12f * 0.12f)
{
    return Crear.Vec4(1f, 0.5f, 0.1f, 1f);
}
return Crear.Vec4(0.1f, 0.1f, 0.2f, 1f);
```

Ejecuta el ciclo de trabajo y mira cómo la bola va de un lado a otro. Vamos a desmontarlo:

1. `avance` hace lo mismo que `t` en el paso anterior, pero va de `0` a `1` y de `1` a `0` en 5 segundos: `Segundos * 0.4` hace que tarde 2,5 segundos en cada sentido, y `% 2f` junto con el `if` produce el ir y volver.
2. `avance` es "qué parte del recorrido llevo": `0` es el extremo izquierdo y `1` el derecho.
3. `centroX = 0.15f + avance * (aspecto - 0.3f)` convierte ese número en una posición de la pantalla, dejando un margen de `0.15` a cada lado. Es una **mezcla** (como la del capítulo anterior): va de `0.15` a `aspecto - 0.15`.
4. El resto es el círculo de siempre, con su centro en `centroX`.

Observa algo: el shader nunca "movió" la bola. Cada vez, simplemente calcula **dónde le toca estar** y la dibuja ahí.

## Paso 5: que también cambie de color

Una última mejora, para practicar mezclar. Agrega esta función dentro de la clase `Tiempo`, después de `Fragment`:

```csharp
    public static float Mezclar(float a, float b, float t)
    {
        return a + (b - a) * t;
    }
```

Y en `Fragment`, cambia el `return` de la bola por esto:

```csharp
    float verde = Mezclar(0.3f, 0.9f, avance);
    return Crear.Vec4(1f, verde, 0.1f, 1f);
```

Es decir: la línea `return` que estaba dentro del `if` se reemplaza por estas dos. Ahora el verde depende de `avance`, y la bola es rojiza en el extremo izquierdo y se vuelve amarilla al llegar al derecho.

Así se ve en tres momentos distintos:

| 0 segundos | 1,25 segundos | 2,5 segundos |
|---|---|---|
| ![La bola naranja en el extremo izquierdo](../../assets/get-started/taller/ti3-a.png) | ![La bola naranja en el centro](../../assets/get-started/taller/ti3-b.png) | ![La bola naranja en el extremo derecho](../../assets/get-started/taller/ti3-c.png) |

Tiene sentido que el color dependa de `avance`: `avance` es lo único que el shader sabe sobre "en qué punto del recorrido estoy".

## Qué más se puede hacer con el tiempo

Con lo que tienes ya puedes hacer mucho: luces que parpadean, un sol que sube, barras que crecen, colores que pasan de uno a otro. Y las ondas triangulares son una buena herramienta.

Pero hay una onda más suave que la triangular, la del seno (`sin`). Es la que usan casi todos los shaders para movimientos naturales: olas, pulsos, respiraciones. En Yotsuba Shader todavía no se puede usar `sin` desde C#, pero queda marcado como pendiente y lo verás en el capítulo del plasma. Mientras tanto, la triangular hace el mismo trabajo con un poco menos de gracia.

## Todo junto

Este es el archivo completo de la bola que rebota y cambia de color:

```csharp style=glsl title="MisShaders/Tiempo.cs"
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Resources;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.Language;

namespace MisShaders;

public class Tiempo
{
    [uniform, layout(0, 0)]
    public Entorno Datos;

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
        float aspecto = Datos.Ancho / Datos.Alto;
        float x = pixel.Uv.X * aspecto;
        float y = pixel.Uv.Y;

        float avance = (Datos.Segundos * 0.4f) % 2f;
        if (avance > 1f)
        {
            avance = 2f - avance;
        }
        float centroX = 0.15f + avance * (aspecto - 0.3f);

        float dx = x - centroX;
        float dy = y - 0.5f;
        if (dx * dx + dy * dy < 0.12f * 0.12f)
        {
            float verde = Mezclar(0.3f, 0.9f, avance);
            return Crear.Vec4(1f, verde, 0.1f, 1f);
        }
        return Crear.Vec4(0.1f, 0.1f, 0.2f, 1f);
    }

    public static float Mezclar(float a, float b, float t)
    {
        return a + (b - a) * t;
    }
}
```

```csharp style=hlsl title="MisShaders/Tiempo.cs"
using YotsubaShader.HlslSyntax;
using YotsubaShader.HlslSyntax.Resources;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.Language;

namespace MisShaders;

public class Tiempo
{
    [cbuffer, register("b0")]
    public Entorno Datos;

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
        float aspecto = Datos.Ancho / Datos.Alto;
        float x = pixel.Uv.X * aspecto;
        float y = pixel.Uv.Y;

        float avance = (Datos.Segundos * 0.4f) % 2f;
        if (avance > 1f)
        {
            avance = 2f - avance;
        }
        float centroX = 0.15f + avance * (aspecto - 0.3f);

        float dx = x - centroX;
        float dy = y - 0.5f;
        if (dx * dx + dy * dy < 0.12f * 0.12f)
        {
            float verde = Mezclar(0.3f, 0.9f, avance);
            return Crear.Vec4(1f, verde, 0.1f, 1f);
        }
        return Crear.Vec4(0.1f, 0.1f, 0.2f, 1f);
    }

    public static float Mezclar(float a, float b, float t)
    {
        return a + (b - a) * t;
    }
}
```

```csharp style=msl title="MisShaders/Tiempo.cs"
using YotsubaShader.MslSyntax;
using YotsubaShader.MslSyntax.Resources;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.Language;

namespace MisShaders;

public class Tiempo
{
    [constant, buffer(0)]
    public Entorno Datos;

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
        float aspecto = Datos.Ancho / Datos.Alto;
        float x = pixel.Uv.X * aspecto;
        float y = pixel.Uv.Y;

        float avance = (Datos.Segundos * 0.4f) % 2f;
        if (avance > 1f)
        {
            avance = 2f - avance;
        }
        float centroX = 0.15f + avance * (aspecto - 0.3f);

        float dx = x - centroX;
        float dy = y - 0.5f;
        if (dx * dx + dy * dy < 0.12f * 0.12f)
        {
            float verde = Mezclar(0.3f, 0.9f, avance);
            return Crear.Vec4(1f, verde, 0.1f, 1f);
        }
        return Crear.Vec4(0.1f, 0.1f, 0.2f, 1f);
    }

    public static float Mezclar(float a, float b, float t)
    {
        return a + (b - a) * t;
    }
}
```

```csharp style=wgsl title="MisShaders/Tiempo.cs"
using YotsubaShader.WgslSyntax;
using YotsubaShader.WgslSyntax.Resources;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.Language;

namespace MisShaders;

public class Tiempo
{
    [uniform, @group(0), @binding(0)]
    public Entorno Datos;

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
        float aspecto = Datos.Ancho / Datos.Alto;
        float x = pixel.Uv.X * aspecto;
        float y = pixel.Uv.Y;

        float avance = (Datos.Segundos * 0.4f) % 2f;
        if (avance > 1f)
        {
            avance = 2f - avance;
        }
        float centroX = 0.15f + avance * (aspecto - 0.3f);

        float dx = x - centroX;
        float dy = y - 0.5f;
        if (dx * dx + dy * dy < 0.12f * 0.12f)
        {
            float verde = Mezclar(0.3f, 0.9f, avance);
            return Crear.Vec4(1f, verde, 0.1f, 1f);
        }
        return Crear.Vec4(0.1f, 0.1f, 0.2f, 1f);
    }

    public static float Mezclar(float a, float b, float t)
    {
        return a + (b - a) * t;
    }
}
```

```csharp style=spirv title="MisShaders/Tiempo.cs"
using YotsubaShader.SpirvSyntax;
using YotsubaShader.SpirvSyntax.Resources;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.Language;

namespace MisShaders;

public class Tiempo
{
    [Uniform, DescriptorSet(0), Binding(0)]
    public Entorno Datos;

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
        float aspecto = Datos.Ancho / Datos.Alto;
        float x = pixel.Uv.X * aspecto;
        float y = pixel.Uv.Y;

        float avance = (Datos.Segundos * 0.4f) % 2f;
        if (avance > 1f)
        {
            avance = 2f - avance;
        }
        float centroX = 0.15f + avance * (aspecto - 0.3f);

        float dx = x - centroX;
        float dy = y - 0.5f;
        if (dx * dx + dy * dy < 0.12f * 0.12f)
        {
            float verde = Mezclar(0.3f, 0.9f, avance);
            return Crear.Vec4(1f, verde, 0.1f, 1f);
        }
        return Crear.Vec4(0.1f, 0.1f, 0.2f, 1f);
    }

    public static float Mezclar(float a, float b, float t)
    {
        return a + (b - a) * t;
    }
}
```

## Lo que aprendiste

- Un shader no tiene memoria: no recuerda el fotograma anterior.
- Para animar, el programa le pasa el tiempo como uniform y el shader **calcula** el resultado a partir de ese número.
- `%` convierte un tiempo que crece sin parar en un ciclo que se repite.
- Con un `if` y `1 - t` consigues que un número suba y luego baje, sin saltos.
- Multiplicar el tiempo cambia la velocidad.

Siguiente: [Shader 2: un fractal](mandelbrot.md).

---
title: Comprueba tu shader en cada API gráfica
summary: Dile al analizador en qué APIs gráficas y engines de juego debe funcionar tu shader, y aprende a leer los errores que te da.
order: 19.5
---

Una **API gráfica** es lo que usa un programa para hablar con la GPU: Vulkan, OpenGL, Direct3D, Metal, WebGPU. No son idénticas. Algo que existe en una puede no existir en otra, y tu shader tiene que funcionar en todas las que usen tus jugadores.

Toma `double`, un número con el doble de precisión que un `float`:

| API gráfica | ¿Tiene `double`? |
| --- | --- |
| OpenGL 4.0 o posterior | Sí |
| Vulkan, Direct3D 11 | Solo en algunas GPUs |
| OpenGL ES (teléfonos), Metal, WebGPU | No |

Un shader que usa `double` corre en tu computadora y falla en un teléfono. Yotsuba Shader te avisa de eso **mientras escribes**, antes de que el compilador escriba nada. En este capítulo lo haces quejarse a propósito, para aprender a leer lo que dice.

Tres palabras tienen aquí un significado fijo, porque suenan parecido:

- **Analizador**: la parte de Yotsuba Shader que lee tu shader en tu editor y en `dotnet build`, y avisa de los problemas. No escribe archivos.
- **Compilador**: la parte que escribe el shader en el formato que entiende la GPU. Lo ejecutas con `yotsuba add`.
- **Formato de salida**: lo que le pides al compilador que escriba, con `--target` (`spirv`, `glsl`, `hlsl`...). **No** es lo mismo que las APIs gráficas de este capítulo: el formato de salida decide lo que se escribe, y las APIs gráficas deciden de qué avisa el analizador. El atributo que vas a usar se llama `[ShaderTargets]`, pero lista APIs gráficas, no formatos de salida.

> [!NOTE]
> Los atributos de este capítulo llegan con la versión 0.9.4 de los paquetes. `YotsubaShader.GlslSyntax` los trae consigo, así que no añades ningún paquete.

## Paso 1: usa algo que no todas las APIs gráficas tienen

Copia `Gradient.cs` como `Precise.cs`, renombra la clase a `Precise` y cambia el método `Fragment` para que calcule el verde con un `double`:

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
        double green = 0.25 + 0.6 * pixel.Uv.Y;     // double, no float
        return new vec4(1f, (float)green, 0.45f, 1f);
    }
}
```

Tu proyecto de C# se sigue construyendo, pero el analizador subraya `double` y `dotnet build` imprime una advertencia. En tu editor es una sola línea larga; aquí la partimos para que quepa:

```text
warning YS0701: 'double' no está disponible en todas las APIs gráficas: Vulkan
    1.3: opcional (shaderFloat64). Afecta a: Vulkan 1.3.
```

Dice cuatro cosas, en este orden:

- `warning`: no detiene el build.
- `YS0701`: el código del problema. Todos los mensajes tienen uno, y la [lista de reglas](https://github.com/KMemphis/YotsubaShader/blob/main/docs/rules/README.md) explica cada uno.
- `'double' no está disponible en todas las APIs gráficas`: lo que usaste.
- `Vulkan 1.3: opcional (shaderFloat64)`: **qué API gráfica** falla y por qué. En Vulkan, `double` solo existe en las GPUs que declaran la capacidad llamada `shaderFloat64`.

No le dijiste al analizador qué APIs gráficas te importan, así que comprobó contra **Vulkan 1.3**, la que se usa por defecto. Cuando no has dicho nada, un problema es solo una advertencia.

> [!NOTE]
> El mensaje sale en español porque tu editor o tu `dotnet` está en español. Con otro idioma sale en inglés; el código `YS0701` es el mismo.

## Paso 2: di en qué APIs gráficas debe funcionar el shader

Ahora supón que este shader también debe correr en la web, con WebGPU. Añade dos cosas a `Precise.cs`: un `using` y un atributo encima de la clase.

```csharp
using YotsubaShader.Compiler.Metadata;     // nuevo

// ...los demás using y el namespace se quedan igual

[ShaderTargets(Target.Vulkan_13 | Target.WebGpu)]     // nuevo
public class Precise
{
    // ...Vertex y Fragment se quedan igual
}
```

El atributo lista las APIs gráficas en las que el shader debe funcionar: Vulkan 1.3 **y** WebGPU (el `|` las combina, como cualquier flag de C#). Cada miembro de `Target` es una versión de una API gráfica, como `Target.Vulkan_13` o `Target.OpenGL_33`. La advertencia pasa a ser un error:

```text
error YS0701: 'double' no está disponible en todas las APIs gráficas: Vulkan
    1.3: opcional (shaderFloat64); WebGPU 1.0: no existe en WGSL. Afecta a:
    Vulkan 1.3, WebGPU 1.0.
```

Ahora el mensaje lista **todas las APIs gráficas que fallan, cada una con su motivo**. WebGPU dice `no existe en WGSL`: su lenguaje de shaders no tiene `double`, así que en esa no hay nada que hacer salvo no usarlo.

Esto es lo que decide entre advertencia y error:

- La API gráfica **no tiene** lo que usas y la listaste: **error**.
- La API gráfica lo tiene **solo a veces** (necesita una extensión, o una capacidad que la GPU puede no declarar): **advertencia**, aunque la hayas listado.
- No listaste ninguna: siempre **advertencia**.

## Paso 3: arréglalo

Tienes tres salidas. Elige según lo que necesites:

```csharp
// 1. Usa float, que todas las APIs gráficas tienen. Casi siempre es la respuesta correcta.
float green = 0.25f + 0.6f * pixel.Uv.Y;
```

```csharp
// 2. Deja de listar WebGPU, si este shader nunca irá a la web.
[ShaderTargets(Target.Vulkan_13)]
```

```csharp
// 3. Lista solo APIs gráficas que tengan double. OpenGL lo tiene desde la versión 4.0.
[ShaderTargets(Target.OpenGL_46)]
```

Con la tercera no hay nada que avisar. Con `Target.OpenGL_33` verías una advertencia (`necesita ARB_gpu_shader_fp64`: OpenGL 3.3 solo tiene `double` mediante una extensión), y con `Target.OpenGL_20`, un error.

## Paso 4: lista las APIs gráficas que usan tus jugadores

Una lista típica:

```csharp
[ShaderTargets(
    Target.Vulkan_13 |      // Vulkan 1.3
    Target.OpenGL_33 |      // OpenGL 3.3
    Target.OpenGLES_30 |    // OpenGL ES 3.0 (teléfonos y WebGL 2)
    Target.DirectX_11 |     // Direct3D 11
    Target.Metal_3 |        // Metal 3 (Apple)
    Target.WebGpu)]         // WebGPU (navegador)
public class Precise { /* ... */ }
```

Cuantas más APIs gráficas listas, más te dice el analizador. Esa es la idea: lo descubres ahora, no cuando un jugador abre tu juego.

Para no repetir el atributo en cada clase, ponlo una vez en todo el proyecto de C#, en cualquier archivo:

```csharp
using YotsubaShader.Compiler.Metadata;

[assembly: ShaderTargets(Target.Vulkan_13 | Target.OpenGL_33 | Target.DirectX_11)]
```

Una clase con su propio `[ShaderTargets]` ignora este.

> [!WARNING]
> No uses `Target.All`, `AllVulkan` ni `AllDirectX`: incluyen versiones que el compilador no puede escribir (Vulkan 1.0 y DirectX 8 y 9.0), así que dan `error YS0712: Ningún backend de YotsubaShader genera Vulkan 1.0`. Lista las versiones que quieres, como arriba.

## Paso 5: no es solo `double`

Para cada API gráfica que listas, el analizador comprueba además otras cosas. Por ejemplo, los compute shaders y los storage buffers solo llegan en OpenGL 4.3:

```csharp
[ShaderTargets(Target.OpenGL_33)]
public class Doubler
{
    [buffer, layout(0, 0)]
    public float[] Values;       // error: los storage buffers llegan en OpenGL 4.3

    [ShaderStage(Stage.Compute)]
    [layout_local_size(64)]
    public void Main([gl_GlobalInvocationID] uvec3 id)    // error: los compute shaders llegan en OpenGL 4.3
    {
        Values[(int)id.X] = Values[(int)id.X] * 2f;
    }
}
```

También comprueba los límites de cada API gráfica, como cuántos colores puede devolver un Fragment (OpenGL ES 2.0 garantiza solo uno). La [referencia](../reference/targets.md) lista todo.

## El compilador no cambia

El atributo solo decide lo que te dice el **analizador**. Lo que escribe el **compilador** lo siguen decidiendo los formatos de salida que pides con `--target`, como viste en [la CLI](cli.md). Hay un único vínculo entre ellos: el compilador no escribe un shader que tiene errores. Si `Precise` todavía tiene el error de WebGPU y ejecutas:

```bash
yotsuba add MyShaders/MyShaders.csproj --target spirv
```

el compilador imprime el error, se salta `Precise` y escribe los demás:

```text
MyShaders.Precise: no se compiló.
The shader has errors:
  Precise.cs(25,16): error YS0701: 'double' no está disponible en todas las
      APIs gráficas: Vulkan 1.3: opcional (shaderFloat64); WebGPU 1.0: no
      existe en WGSL. Afecta a: Vulkan 1.3, WebGPU 1.0.
1 shader(s) con errores; se compilaron 5.
```

Un shader que solo tiene advertencias se escribe. Con un `double` puede que veas también líneas como `Aviso: Precise.ToGlslEs(Fragment): FP64 not supported in ES profile.`: `add` siempre escribe los cinco formatos de [la CLI](cli.md), y OpenGL ES no tiene `double`, así que ese formato no se puede escribir para este shader. No detiene nada.

:::godot
## Godot tiene sus propias reglas

Godot no es una API gráfica sino un engine de juego con su propio lenguaje de shaders, que no acepta todo. Decláralo con `[ShaderEngines]`, junto a `[ShaderTargets]`:

```csharp
[ShaderTargets(Target.Vulkan_13 | Target.OpenGL_33)]
[ShaderEngines(GameEngine.Godot)]
public class Precise { /* ... */ }
```

Con `GameEngine.Godot` el analizador avisa de lo que Godot no puede hacer, como compute shaders o storage buffers:

```text
warning YS0710: 'Main' es un compute shader y Godot Shading Language no tiene
    compute (solo vertex y fragment). Afecta a: Godot.
```
:::

:::xna
## ¿Y {{engine}}?

{{engine}} no necesita un atributo propio: ejecuta tu shader en la API gráfica que usa tu juego. Lista esa API gráfica en `[ShaderTargets]`. Por ejemplo, un juego que publica una versión con OpenGL y otra con Direct3D 11:

```csharp
[ShaderTargets(Target.OpenGL_33 | Target.DirectX_11)]
public class Precise { /* ... */ }
```
:::

:::raylib
## ¿Y {{engine}}?

{{engine}} no necesita un atributo propio: ejecuta tu shader sobre OpenGL 3.3, la versión que usa raylib. Declara esa API gráfica en `[ShaderTargets]`:

```csharp
[ShaderTargets(Target.OpenGL_33)]
public class Precise { /* ... */ }
```
:::

:::silknet
## ¿Y {{engine}}?

{{engine}} no necesita un atributo propio: ejecuta tu shader sobre la API gráfica que elegiste en el capítulo del visor. Declara esa API en `[ShaderTargets]`, o las cuatro con `|` si el mismo shader tiene que funcionar en todas:

```csharp
[ShaderTargets(Target.OpenGL_33 | Target.OpenGLES_30 | Target.Vulkan_13 | Target.WebGpu)]
public class Precise { /* ... */ }
```
:::

## Lo que aprendiste

- Sin atributo, el analizador comprueba solo contra **Vulkan 1.3**, y solo avisa.
- `[ShaderTargets(Target.A | Target.B)]` en una clase (o `[assembly: ShaderTargets(...)]` en todo el proyecto de C#) lista las APIs gráficas en las que el shader debe funcionar.
- Lo que una API gráfica no tiene es un **error** si la listaste, y una **advertencia** si solo lo tiene a veces.
- Un mensaje da el código (`YS0701`), lo que usaste y **qué API gráfica** falla y por qué.
- El atributo decide lo que avisa el analizador; `--target` decide qué formatos de salida escribe el compilador.

Siguiente: [¿Y ahora qué?](next-steps.md).

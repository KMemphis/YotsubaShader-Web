---
title: APIs gráficas y engines
summary: "[ShaderTargets] y [ShaderEngines]: dile al analizador en qué APIs gráficas y engines debe funcionar tu shader, y mira los errores mientras escribes."
order: 9
---

Un shader que funciona en una API gráfica puede fallar en otra: WebGPU no tiene `double`, OpenGL 3.3 no tiene compute shaders, OpenGL ES 2.0 escribe un solo color. Yotsuba Shader lo comprueba **mientras escribes el shader**, en tu editor y en el build, antes de compilar nada. Le dices qué APIs gráficas te importan con dos atributos:

- `[ShaderTargets(Target...)]`: las APIs gráficas y versiones en las que el shader debe funcionar.
- `[ShaderEngines(GameEngine...)]`: los engines cuyas reglas propias también se comprueban (hoy, Godot).

Los dos viven en el espacio de nombres `YotsubaShader.Compiler.Metadata`. El paquete llega solo con cualquier paquete de sintaxis (`YotsubaShader.GlslSyntax` y los demás), así que no hay nada más que instalar.

```csharp
using YotsubaShader.Compiler.Metadata;
```

## Por defecto: Vulkan 1.3

Sin ningún atributo, el shader se comprueba solo contra **Vulkan 1.3**, y lo que Vulkan 1.3 no garantiza se avisa como **advertencia**:

```csharp
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.Language;

namespace Cases;

public class Default
{
    [ShaderStage(Stage.Fragment)]
    [return: location(0)]
    public vec4 Fragment(PixelIn pixel)
    {
        double red = 1.0;   // double es opcional en Vulkan (shaderFloat64)
        return new vec4((float)red, pixel.Uv.X, pixel.Uv.Y, 1f);
    }
}
```

```text
warning YS0701: 'double' no está disponible en todas las APIs gráficas: Vulkan
    1.3: opcional (shaderFloat64). Afecta a: Vulkan 1.3.
```

`PixelIn` es el ayudante del [tutorial](../get-started/index.md); cualquier shader se comporta igual. Es una advertencia porque nada indica que necesites otras APIs gráficas. Al declararlas, lo que les falta pasa a ser un error.

## `[ShaderTargets]`: elige las APIs gráficas

Pon el atributo en la clase del shader. Combina versiones de APIs gráficas con `|`:

```csharp
using YotsubaShader.Compiler.Metadata;
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.Language;

namespace Cases;

[ShaderTargets(Target.Vulkan_13 | Target.WebGpu)]
public class Web
{
    [ShaderStage(Stage.Fragment)]
    [return: location(0)]
    public vec4 Fragment(PixelIn pixel)
    {
        double red = 1.0;   // WebGPU no tiene double: error
        return new vec4((float)red, pixel.Uv.X, pixel.Uv.Y, 1f);
    }
}
```

```text
error YS0701: 'double' no está disponible en todas las APIs gráficas: Vulkan
    1.3: opcional (shaderFloat64); WebGPU 1.0: no existe en WGSL. Afecta a:
    Vulkan 1.3, WebGPU 1.0.
```

Un solo diagnóstico nombra todas las APIs gráficas que fallan y por qué. La severidad depende de lo que diga cada API gráfica sobre la característica:

| La API gráfica... | Severidad del diagnóstico |
| --- | --- |
| no tiene la característica (`Unavailable`) y declaraste esa API gráfica | **Error** |
| la tiene solo con una extensión, una característica del driver o una opción (`Optional`) | **Advertencia**, aunque hayas declarado esa API gráfica |
| no la tiene, pero no declaraste ninguna API gráfica (el Vulkan 1.3 por defecto) | **Advertencia** |

Así, `[ShaderTargets(Target.OpenGL_33)]` con `double` es una advertencia ("necesita ARB_gpu_shader_fp64"), `Target.OpenGL_20` es un error, y `Target.OpenGL_46` no da nada, porque OpenGL 4.0 y posteriores tienen `double`.

### Las versiones de APIs gráficas

`Target` es un enum `[Flags]` con un miembro por versión de cada API gráfica, más grupos. A pesar de su nombre, lista versiones de APIs gráficas, no formatos de salida:

```csharp
// Vulkan
Target.Vulkan_10   Target.Vulkan_11   Target.Vulkan_12   Target.Vulkan_13   Target.Vulkan_14

// OpenGL
Target.OpenGL_20   Target.OpenGL_30   Target.OpenGL_31   Target.OpenGL_32   Target.OpenGL_33
Target.OpenGL_40   Target.OpenGL_41   Target.OpenGL_42   Target.OpenGL_43   Target.OpenGL_44
Target.OpenGL_45   Target.OpenGL_46

// OpenGL ES (y WebGL)
Target.OpenGLES_20   Target.OpenGLES_30   Target.OpenGLES_31   Target.OpenGLES_32

// DirectX (el número es la versión de Direct3D; DirectX_90c es Shader Model 3)
Target.DirectX_80   Target.DirectX_81   Target.DirectX_90   Target.DirectX_90c
Target.DirectX_10   Target.DirectX_11   Target.DirectX_12

// Metal
Target.Metal_1   Target.Metal_2   Target.Metal_3   Target.Metal_4

// WebGPU
Target.WebGpu

// Grupos
Target.AllVulkan   Target.AllOpenGL   Target.AllOpenGLES   Target.AllDirectX   Target.AllMetal   Target.All
```

### Versiones que ningún backend genera

Algunas versiones están en el enum, pero YotsubaShader no puede generar código para ellas: Vulkan 1.0 (el compilador escribe SPIR-V 1.3 o posterior) y DirectX 8.0, 8.1 y 9.0 (el HLSL que genera empieza en Shader Model 3.0). Declarar una **no** es un error: `[ShaderTargets]` solo dice contra qué APIs gráficas debe ser válido el shader, y el analizador las revisa igualmente. Un shader puede declarar Direct3D 9 para validarse y compilarse a otro lenguaje.

```csharp
[ShaderTargets(Target.DirectX_90c)]
public class Old { /* ... */ }
```

`Target.All`, `Target.AllVulkan` y `Target.AllDirectX` también incluyen esas versiones. La página de cada API gráfica lista, versión por versión, lo que rechaza el analizador: [Vulkan](validate-vulkan.md), [OpenGL](validate-opengl.md), [OpenGL ES](validate-opengles.md), [Direct3D](validate-direct3d.md), [Metal](validate-metal.md) y [WebGPU](validate-webgpu.md).

### Un atributo para todo el proyecto

En el ensamblado, el atributo se aplica a cada clase de shader que no tenga uno propio. Ponlo en cualquier archivo del proyecto:

```csharp
using YotsubaShader.Compiler.Metadata;

[assembly: ShaderTargets(Target.Vulkan_13 | Target.OpenGL_46 | Target.DirectX_12)]
```

El orden de prioridad es: la clase (o la clase que la contiene), luego el ensamblado y, por último, el Vulkan 1.3 por defecto. Una clase con su propio `[ShaderTargets]` ignora el del ensamblado; no se suma a él.

## Qué se comprueba

Estas son las características y límites que conoce el analizador de cada versión de API gráfica. Lo que no conoce nunca se avisa (el analizador solo se queja de lo que puede demostrar).

```csharp
[ShaderTargets(Target.OpenGL_33 | Target.Vulkan_13)]
public class Doubler
{
    // YS0711: los storage buffers llegan en OpenGL 4.3
    [buffer, layout(0, 0)]
    public float[] Values;

    // YS0711: los compute shaders llegan en OpenGL 4.3
    [ShaderStage(Stage.Compute)]
    [layout_local_size(64)]
    public void Main([gl_GlobalInvocationID] uvec3 id)
    {
        Values[(int)id.X] = Values[(int)id.X] * 2f;
    }
}
```

```text
error YS0711: El storage buffer 'Values' no está disponible en todas las APIs
    gráficas: OpenGL 3.3: los storage buffers llegan en OpenGL 4.3. Afecta a:
    OpenGL 3.3.
error YS0711: El compute shader 'Main' no está disponible en todas las APIs
    gráficas: OpenGL 3.3: los compute shaders llegan en OpenGL 4.3. Afecta a:
    OpenGL 3.3.
```

| Diagnóstico | Qué avisa |
| --- | --- |
| `YS0701` | Un tipo que la API no tiene o solo tiene de forma opcional: `double`, `half`, enteros de 16 y 64 bits. |
| `YS0711` | Una característica que la API no tiene: compute shaders, storage buffers y texturas de almacenamiento. |
| `YS0704` | Un límite: render targets, entradas de vértice, variables entre etapas, tamaño del grupo de trabajo. |
| `YS0705` | Un recurso que la API no admite: una textura de almacenamiento sin formato declarado, o un número de descriptor set mayor que el que la API garantiza. |
| `YS0712` | Un valor de `[ShaderTargets]` que no es una versión de API gráfica. |

Los límites son siempre una **advertencia**, porque son garantías ("OpenGL ES 2.0 garantiza 1 render target"), no fallos seguros en todos los dispositivos:

```csharp
public struct TwoColors
{
    [location(0)] public vec4 Color;
    [location(1)] public vec4 Glow;   // un segundo render target
}

[ShaderTargets(Target.OpenGLES_20 | Target.Vulkan_13)]
public class Mrt
{
    [ShaderStage(Stage.Fragment)]
    public TwoColors Fragment(PixelIn pixel) { /* ... */ }
}
```

```text
warning YS0704: 'Fragment' usa 2 render targets; OpenGL ES 2.0 garantiza 1.
    Afecta a: OpenGL ES 2.0.
```

## `[ShaderEngines]`: engines de juego

Un engine añade sus propias reglas sobre las de la API gráfica. Godot, por ejemplo, no tiene compute shaders ni storage buffers en su lenguaje de shaders, y un fragment escribe un solo color:

```csharp
using YotsubaShader.Compiler.Metadata;

[ShaderEngines(GameEngine.Godot)]
public class ForGodot
{
    [buffer, layout(0, 0)]
    public float[] Values;

    [ShaderStage(Stage.Compute)]
    [layout_local_size(64)]
    public void Main([gl_GlobalInvocationID] uvec3 id) { /* ... */ }
}
```

```text
warning YS0710: 'Values' es un storage buffer y Godot Shading Language no los
    tiene; usa un uniform o una textura. Afecta a: Godot.
warning YS0710: 'Main' es un compute shader y Godot Shading Language no tiene
    compute (solo vertex y fragment). Afecta a: Godot.
```

`[ShaderEngines]` va en una clase o en el ensamblado, igual que `[ShaderTargets]`, y los dos se combinan: un shader puede declarar `[ShaderTargets(Target.Vulkan_13)]` y `[ShaderEngines(GameEngine.Godot)]` a la vez. Los engines que no están en `GameEngine` no necesitan nada: MonoGame, KNI y FNA compilan los shaders para la API en la que corren, así que esa API la declaras con `[ShaderTargets]`.

## El formato de salida es otra decisión

`[ShaderTargets]` solo controla las comprobaciones que ves mientras escribes. El **formato de salida** (el lenguaje que escribe el compilador: `spirv`, `glsl`, `hlsl`...) sigue siendo lo que pides con `--target` en [`add`](add.md) y [`compile`](compile.md). Esa opción se llama `--target`, pero recibe formatos de salida, no versiones de APIs gráficas. Cada shader falla por separado si no se puede generar:

```bash
yotsuba compile MyShaders/MyShaders.csproj --target spirv --output out
```

```text
Cases.Web: no se compiló.
The shader has errors:
  Web.cs(16,16): error YS0701: 'double' no está disponible en todas las APIs
      gráficas: Vulkan 1.3: opcional (shaderFloat64); WebGPU 1.0: no existe en
      WGSL. Afecta a: Vulkan 1.3, WebGPU 1.0.
3 shader(s) con errores; se compilaron 5.
```

Los shaders con error se saltan, el resto se escribe, y el código de salida es `1`. Un shader que solo tiene advertencias compila.

## Cambia la severidad

Cada diagnóstico se ajusta en `.editorconfig`:

```ini
# Una advertencia que no quieres
dotnet_diagnostic.YS0701.severity = none

# Tratar los límites como errores
dotnet_diagnostic.YS0704.severity = error
```

## El idioma de los mensajes

Los mensajes están escritos en inglés y traducidos al español. Salen en español cuando tu editor o tu ejecución de `dotnet` usa un idioma de interfaz en español, y en inglés en los demás casos. El ID (`YS0701`) es el mismo en los dos. Cada diagnóstico tiene su página en [la lista de reglas](https://github.com/KMemphis/YotsubaShader/blob/main/docs/rules/README.md).

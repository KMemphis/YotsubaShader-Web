---
title: Referencia de Godot
summary: Godot: el addon, qué se traduce, los nombres de los datos de vértice, uniforms y cómo cargar el shader.
order: 11
---

Godot tiene su propio lenguaje de shaders, el Godot Shading Language, guardado en archivos `.gdshader`. Yotsuba Shader traduce tu shader de C# a ese lenguaje con el plugin `godot`. Godot carga el archivo de texto por sí mismo: no hay un objeto efecto que construir ni bytes que pasar. Para el recorrido paso a paso, usa la ruta de Godot de [Get Started](../get-started/index.md).

## De un vistazo

| | |
| --- | --- |
| Plugin y destino | `godot` (`--target godot`, alias `gdshader`) |
| Salida | Texto: `<Clase>.spatial.gdshader` y `<Clase>.canvasitem.gdshader` |
| Método generado (`add`) | `ToGodotShader(GodotShaderType)`, devuelve un `string` (`Spatial` o `CanvasItem`) |
| Comando que usa el addon | `yotsuba compile <proyecto> --target godot --output <carpeta>` |
| Nombres de uniforms | `<Campo>_<Miembro>`, por ejemplo `Time_Seconds` |
| Probado con | Godot 4.7.2 en macOS, estándar (GDScript) y .NET (C#) |

## El addon

El addon del editor de Godot ejecuta el comando de compilación cada vez que pulsas **Play**, así los archivos `.gdshader` están siempre al día.

1. Copia `Plugins/YotsubaShader.Extensions.Godot/addon/addons/yotsubashader` del repositorio dentro de `GodotGame/addons/`.
2. *Project → Project Settings → Plugins*: marca **YotsubaShader**.
3. *Project Settings → General*, con **Advanced Settings** activado: en la sección **Yotsuba Shader**, pon en `project` la biblioteca de shaders, por ejemplo `../MyShaders/MyShaders.csproj` (absoluta, o relativa al proyecto de Godot).

| Ajuste | Qué es | Por defecto |
| --- | --- | --- |
| `project` | Ruta al `.csproj` con tus shaders | vacío |
| `output_dir` | Dónde se escriben los archivos `.gdshader` | `res://yotsuba_shaders` |
| `shader_type` | `spatial`, `canvas_item` o `both` | `spatial` |
| `command` | El comando de yotsuba | `dotnet yotsuba` |
| `regenerate_on_run` | Regenerar al pulsar Play | activado |

El addon se ejecuta antes de que empiece el juego y también desde *Project → Tools → Regenerate YotsubaShader shaders*. Después Godot refresca su sistema de archivos. Los errores salen en el panel de salida de Godot; un fallo en un tipo de shader que no elegiste (por ejemplo `canvas_item` cuando solo usas `spatial`) no cuenta como error.

Dos requisitos:

- Godot tiene que encontrar `yotsuba`. El `command` por defecto (`dotnet yotsuba`) usa la herramienta global por sí solo; si Godot no la ve, escribe la ruta completa del ejecutable `yotsuba` en `command`.
- Godot tiene que poder encontrar `dotnet`. En macOS, un Godot abierto desde el Dock o Finder no ve el `PATH` de la terminal: ábrelo desde una terminal, o pon la ruta completa en el ajuste `command`.

## El shader

Un shader para Godot declara los datos de vértice con los nombres propios de Godot. Este es una franja de luz que cruza la pantalla, controlada por un uniform de tiempo. Usa los tipos de salida de vértice y entrada de fragment del tutorial, un pequeño ayudante para `vec4` y el struct `GodotVertex` de la sección siguiente:

```csharp
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Types;

namespace MyShaders;

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
    public Pixel Vertex(GodotVertex corner)
    {
        Pixel pixel;
        pixel.Position = Make.Vec4(corner.VERTEX.X, corner.VERTEX.Y, 0f, 1f);
        pixel.Uv = corner.UV;
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

## Qué se traduce

El método vertex de arriba queda así en `Sweep.spatial.gdshader`:

```glsl
void vertex() {
    vec3 corner_VERTEX = VERTEX;
    vec2 corner_UV = UV;
    // ... los otros doce campos leen NORMAL, TANGENT, COLOR... de la misma forma
    vec4 ys_position = vec4(0.0);
    Pixel pixel;
    pixel.Position = Vec4(corner_VERTEX.x, corner_VERTEX.y, 0.0, 1.0);
    pixel.Uv = corner_UV;
    ys_position = pixel.Position;
    v_Uv = pixel.Uv;
    POSITION = ys_position;
}
```

- `Vertex` se convierte en `void vertex()` y `Fragment` en `void fragment()`.
- Los campos de `GodotVertex` leen los valores integrados de Godot por **nombre**: `VERTEX` lee `VERTEX`, `UV` lee `UV`.
- Lo que el vertex entrega al fragment (`pixel.Uv`) se convierte en un `varying`.
- La posición que devuelves se escribe en `POSITION` y está en **clip space** (`-1` a `1`). Godot **no** aplica sus matrices de modelo, vista y proyección a un shader así; pásalas como uniforms si las necesitas.
- El color final (`[return: location(0)]`) va a `ALBEDO` y `ALPHA`.
- Un `return` a mitad de `vertex()` o `fragment()` se reescribe como un `for` de una sola vuelta con `break`, porque Godot no acepta `return` ahí.
- Los archivos `spatial` usan `render_mode unshaded, cull_disabled;`: `unshaded` porque el fragment ya calcula el color final, y `cull_disabled` porque un `ShaderMaterial` no puede desactivar el culling desde fuera.
- En `canvas_item` solo existen la posición, el color y `UV`.

## Nombres de los datos de vértice

El struct de vértice se declara con **todos** los datos que Godot entrega por vértice, con los nombres exactos de Godot:

```csharp
public struct GodotVertex
{
    [location(0)] public vec3 VERTEX;
    [location(1)] public vec3 NORMAL;
    [location(2)] public vec3 TANGENT;
    [location(3)] public vec3 BINORMAL;
    [location(4)] public vec2 UV;
    [location(5)] public vec2 UV2;
    [location(6)] public vec4 COLOR;
    [location(7)] public vec4 CUSTOM0;
    [location(8)] public vec4 CUSTOM1;
    [location(9)] public vec4 CUSTOM2;
    [location(10)] public vec4 CUSTOM3;
    [location(11)] public uvec4 BONE_INDICES;
    [location(12)] public vec4 BONE_WEIGHTS;
    [location(13)] public float POINT_SIZE;
}
```

- **El nombre decide el significado.** `UV` es la coordenada de textura y `NORMAL` es la normal. El número de `[location(n)]` es tuyo; solo tiene que ser único. El nombre manda sobre el número y sobre cualquier semántica que lleve el campo (`[POSITION]`, `[TEXCOORD(0)]`, `[attribute(0)]`).
- **Los nombres se escriben como en Godot**, en mayúsculas, en todos los idiomas de la documentación.
- **Un nombre desconocido nunca se adivina.** Si no lleva una semántica que el plugin conozca, el plugin da un error que lista los nombres válidos.
- **Una malla que no trae un atributo** da el valor por defecto de Godot para él, así un struct con los 14 campos funciona con cualquier malla.

| Nombre | Tipo en `spatial` | Tipo en `canvas_item` |
| --- | --- | --- |
| `VERTEX` | `vec3` | `vec2` |
| `NORMAL`, `TANGENT`, `BINORMAL` | `vec3` | no existe |
| `UV` | `vec2` | `vec2` |
| `UV2` | `vec2` | no existe |
| `COLOR` | `vec4` | `vec4` |
| `CUSTOM0`, `CUSTOM1` | `vec4` | `vec4` |
| `CUSTOM2`, `CUSTOM3` | `vec4` | no existe |
| `BONE_INDICES` | `uvec4` | no existe |
| `BONE_WEIGHTS` | `vec4` | no existe |
| `POINT_SIZE` | `float` | `float` |

Si declaras otro tipo de la misma familia, el plugin lo adapta: uno más corto se rellena con `0` (y `1` en la `w` de `VERTEX` y `COLOR`) y uno más largo se recorta. `VERTEX_ID` no es un campo: el índice de vértice es una variable integrada de la sintaxis que uses, y Godot lo da como `VERTEX_ID`. Un shader que lee `NORMAL` no puede ser un `canvas_item`; la CLI avisa de ese archivo y termina con código `1`, pero el `.spatial.gdshader` sí se escribe.

## Cargarlo en Godot

Construye una malla con las cuatro esquinas de un rectángulo, dale un `ShaderMaterial` y envía los uniforms en cada fotograma. La escena es un `Node3D` llamado `Viewer` con un hijo `MeshInstance3D` llamado `Screen` y una `Camera3D`, y `Screen` tiene **Extra Cull Margin** en `16384` (Godot descarta un objeto según su posición en el mundo 3D, y tu shader mueve los vértices a otro lado). El eje vertical de la pantalla va al revés en Godot, así que la esquina con `Uv = (0, 0)` tiene `Y = -1`.

```gdscript tab="GDScript"
extends Node3D

var _material := ShaderMaterial.new()

func _ready() -> void:
	var arrays := []
	arrays.resize(Mesh.ARRAY_MAX)
	arrays[Mesh.ARRAY_VERTEX] = PackedVector3Array([
		Vector3(-1, -1, 0), Vector3(1, -1, 0), Vector3(-1, 1, 0), Vector3(1, 1, 0)])
	arrays[Mesh.ARRAY_TEX_UV] = PackedVector2Array([
		Vector2(0, 0), Vector2(1, 0), Vector2(0, 1), Vector2(1, 1)])
	arrays[Mesh.ARRAY_NORMAL] = PackedVector3Array([
		Vector3(0, 0, 1), Vector3(0, 0, 1), Vector3(0, 0, 1), Vector3(0, 0, 1)])
	arrays[Mesh.ARRAY_TANGENT] = PackedFloat32Array([
		1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1])
	var mesh := ArrayMesh.new()
	mesh.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLE_STRIP, arrays)

	_material.shader = load("res://yotsuba_shaders/MyShaders/Sweep.spatial.gdshader")
	$Screen.mesh = mesh
	$Screen.material_override = _material

func _process(_delta: float) -> void:
	_material.set_shader_parameter("Time_Seconds", Time.get_ticks_msec() / 1000.0)
```
```csharp tab="C#"
using Godot;

public partial class Viewer : Node3D
{
    private readonly ShaderMaterial _material = new();

    public override void _Ready()
    {
        var arrays = new Godot.Collections.Array();
        arrays.Resize((int)Mesh.ArrayType.Max);
        arrays[(int)Mesh.ArrayType.Vertex] = new[]
        {
            new Vector3(-1, -1, 0), new Vector3(1, -1, 0), new Vector3(-1, 1, 0), new Vector3(1, 1, 0),
        };
        arrays[(int)Mesh.ArrayType.TexUV] = new[]
        {
            new Vector2(0, 0), new Vector2(1, 0), new Vector2(0, 1), new Vector2(1, 1),
        };
        arrays[(int)Mesh.ArrayType.Normal] = new[]
        {
            new Vector3(0, 0, 1), new Vector3(0, 0, 1), new Vector3(0, 0, 1), new Vector3(0, 0, 1),
        };
        arrays[(int)Mesh.ArrayType.Tangent] = new float[] { 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1 };
        var mesh = new ArrayMesh();
        mesh.AddSurfaceFromArrays(Mesh.PrimitiveType.TriangleStrip, arrays);

        _material.Shader = GD.Load<Shader>("res://yotsuba_shaders/MyShaders/Sweep.spatial.gdshader");
        var screen = GetNode<MeshInstance3D>("Screen");
        screen.Mesh = mesh;
        screen.MaterialOverride = _material;
    }

    public override void _Process(double delta)
    {
        _material.SetShaderParameter("Time_Seconds", Time.GetTicksMsec() / 1000.0);
    }
}
```

## Uniforms y texturas

- Un struct `[uniform]` se convierte en un `uniform` por campo, con el nombre `<Campo>_<Miembro>`: `public Stopwatch Time;` con `Seconds` es `Time_Seconds`. Se asigna con `set_shader_parameter("Time_Seconds", valor)` (GDScript) o `SetShaderParameter("Time_Seconds", valor)` (C#).
- Una textura o sampler combinado (`sampler2D`) se convierte en `uniform sampler2D <nombre>`. Pásale una `Texture2D` con `set_shader_parameter("Photo", textura)`. El filtrado y la repetición salen de las opciones de la textura de Godot, no de un `SamplerState` en C#. La imagen puede ser un archivo o **lo que ve una cámara**: una `ViewportTexture` de un `SubViewport` funciona como cualquier otra textura.
- Un `SubViewport` comparte el mundo de su padre; activa `own_world_3d = true` cuando deba dibujar su propia escena.

## Lo que no se soporta

El plugin avisa de esto con un error claro y nunca deja un archivo roto: shaders compute, buffers de almacenamiento (`StructuredBuffer`, `RWStructuredBuffer` o un arreglo usado como buffer), más de un render target, operaciones atómicas y variables integradas que Godot no tiene.

## Si algo falla

| Qué ves | Qué significa | Qué hacer |
| --- | --- | --- |
| La ventana está **gris** y no dibuja nada | El archivo `.gdshader` todavía no existe o no se pudo cargar. | Comprueba que `GodotGame/yotsuba_shaders/MyShaders/` tiene el archivo y usa *Project → Reload Current Project*. |
| Godot no ve un shader recién creado | El addon solo lee archivos cuando el editor arranca o recupera el foco. | *Project → Reload Current Project* (pide detener el juego si está corriendo). |
| No se encuentra `dotnet` al pulsar Play | En macOS, Godot no siempre hereda el `PATH` de tu terminal. | Abre Godot desde una terminal donde funcione `dotnet --version`, o define `command`. |
| El addon no encuentra `yotsuba` | La herramienta no está instalada, o Godot no ve la carpeta donde .NET instala las herramientas. | Ejecuta `dotnet tool install --global YotsubaShader.Compiler.CLI`, o escribe la ruta completa del ejecutable en `command`. |
| Un shader con textura se dibuja negro | No se le dio ninguna imagen al uniform de textura. | Asígnale una `Texture2D` (la propiedad `Photo` del visor del tutorial). |
| El plugin lista los nombres válidos | Un campo de vértice tiene un nombre que no es de Godot. | Usa un nombre de la tabla. |

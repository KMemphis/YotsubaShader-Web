---
title: Godot reference
summary: Godot: the addon, what gets translated, the names of the vertex data, uniforms and loading the shader.
order: 11
---

Godot has its own shader language, the Godot Shading Language, saved in `.gdshader` files. Yotsuba Shader translates your C# shader into it with the `godot` plugin. Godot loads the text file itself: there is no effect object to build and no bytes to pass. For the step-by-step path, use the Godot route of [Get Started](../get-started/index.md).

## At a glance

| | |
| --- | --- |
| Plugin and target | `godot` (`--target godot`, alias `gdshader`) |
| Output | Text: `<Class>.spatial.gdshader` and `<Class>.canvasitem.gdshader` |
| Generated method (`add`) | `ToGodotShader(GodotShaderType)`, returns a `string` (`Spatial` or `CanvasItem`) |
| Command used by the addon | `yotsuba compile <project> --target godot --output <dir>` |
| Names of uniforms | `<Field>_<Member>`, for example `Time_Seconds` |
| Tested with | Godot 4.7.2 on macOS, standard (GDScript) and .NET (C#) |

## The addon

The Godot editor addon runs the compile command every time you press **Play**, so the `.gdshader` files are always current.

1. Copy `Plugins/YotsubaShader.Extensions.Godot/addon/addons/yotsubashader` from the repository into `GodotGame/addons/`.
2. *Project → Project Settings → Plugins*: tick **YotsubaShader**.
3. *Project Settings → General*, with **Advanced Settings** on: in the **Yotsuba Shader** section, set `project` to the shader library, for example `../MyShaders/MyShaders.csproj` (absolute, or relative to the Godot project).

| Setting | What it is | Default |
| --- | --- | --- |
| `project` | Path to the `.csproj` with your shaders | empty |
| `output_dir` | Where the `.gdshader` files are written | `res://yotsuba_shaders` |
| `shader_type` | `spatial`, `canvas_item` or `both` | `spatial` |
| `command` | The yotsuba command | `dotnet yotsuba` |
| `regenerate_on_run` | Regenerate when you press Play | on |

The addon runs before the game starts and also from *Project → Tools → Regenerate YotsubaShader shaders*. Then Godot refreshes its file system. Errors show in Godot's output panel; a failure in a shader type you did not choose (for example `canvas_item` when you only use `spatial`) is not counted as an error.

Two requirements:

- Godot has to find `yotsuba`. The default `command` (`dotnet yotsuba`) falls back to the global tool by itself; if Godot cannot see it, write the full path to the `yotsuba` executable in `command`.
- Godot must be able to find `dotnet`. On macOS a Godot opened from the Dock or Finder does not see the terminal `PATH`: open it from a terminal, or put the full path in the `command` setting.

## The shader

A shader for Godot declares the vertex data with Godot's own names. This one is a strip of light that crosses the screen, driven by a time uniform. It uses the tutorial's vertex output and fragment input types and a small `vec4` helper, and the `GodotVertex` struct from the next section:

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

## What gets translated

The vertex method above becomes, in `Sweep.spatial.gdshader`:

```glsl
void vertex() {
    vec3 corner_VERTEX = VERTEX;
    vec2 corner_UV = UV;
    // ... the other twelve fields read NORMAL, TANGENT, COLOR... in the same way
    vec4 ys_position = vec4(0.0);
    Pixel pixel;
    pixel.Position = Vec4(corner_VERTEX.x, corner_VERTEX.y, 0.0, 1.0);
    pixel.Uv = corner_UV;
    ys_position = pixel.Position;
    v_Uv = pixel.Uv;
    POSITION = ys_position;
}
```

- `Vertex` becomes `void vertex()` and `Fragment` becomes `void fragment()`.
- The fields of `GodotVertex` read Godot's built-ins by **name**: `VERTEX` reads `VERTEX`, `UV` reads `UV`.
- What the vertex hands to the fragment (`pixel.Uv`) becomes a `varying`.
- The position you return is written to `POSITION` and is in **clip space** (`-1` to `1`). Godot does **not** apply its model, view and projection matrices to a shader like this; pass them as uniforms if you need them.
- The final color (`[return: location(0)]`) goes to `ALBEDO` and `ALPHA`.
- A `return` in the middle of `vertex()` or `fragment()` is rewritten as a one-pass `for` loop with `break`, because Godot does not accept `return` there.
- `spatial` files use `render_mode unshaded, cull_disabled;`: `unshaded` because the fragment already computes the final color, and `cull_disabled` because a `ShaderMaterial` cannot turn culling off from the outside.
- In `canvas_item` only the position, the color and `UV` exist.

## Vertex data names

The vertex struct is declared with **all** the data Godot delivers per vertex, named exactly as Godot names it:

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

- **The name decides the meaning.** `UV` is the texture coordinate and `NORMAL` is the normal. The `[location(n)]` number is yours; it only has to be unique. The name rules over the number and over any semantic the field carries (`[POSITION]`, `[TEXCOORD(0)]`, `[attribute(0)]`).
- **Names are written as in Godot**, in capitals, in every language of the documentation.
- **An unknown name is never guessed.** If it carries no semantic the plugin knows, the plugin reports an error that lists the valid names.
- **A mesh that does not carry an attribute** gives Godot's default value for it, so a struct with all 14 fields works with any mesh.

| Name | Type in `spatial` | Type in `canvas_item` |
| --- | --- | --- |
| `VERTEX` | `vec3` | `vec2` |
| `NORMAL`, `TANGENT`, `BINORMAL` | `vec3` | does not exist |
| `UV` | `vec2` | `vec2` |
| `UV2` | `vec2` | does not exist |
| `COLOR` | `vec4` | `vec4` |
| `CUSTOM0`, `CUSTOM1` | `vec4` | `vec4` |
| `CUSTOM2`, `CUSTOM3` | `vec4` | does not exist |
| `BONE_INDICES` | `uvec4` | does not exist |
| `BONE_WEIGHTS` | `vec4` | does not exist |
| `POINT_SIZE` | `float` | `float` |

If you declare another type of the same family, the plugin adapts it: a shorter one is padded with `0` (and `1` in the `w` of `VERTEX` and `COLOR`) and a longer one is cut. `VERTEX_ID` is not a field: the vertex index is a built-in variable of the syntax you use, and Godot provides it as `VERTEX_ID`. A shader that reads `NORMAL` cannot be a `canvas_item`; the CLI reports that file and exits with code `1`, but the `.spatial.gdshader` is still written.

## Load it in Godot

Build a mesh with the four corners of a rectangle, give it a `ShaderMaterial` and send the uniforms every frame. The scene is a `Node3D` called `Viewer` with a `MeshInstance3D` child called `Screen` and a `Camera3D`, and `Screen` has **Extra Cull Margin** set to `16384` (Godot culls an object using its position in the 3D world, and your shader moves the vertices somewhere else). The vertical axis of the screen goes the other way in Godot, so the corner with `Uv = (0, 0)` has `Y = -1`.

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

## Uniforms and textures

- A `[uniform]` struct becomes one `uniform` per field, named `<Field>_<Member>`: `public Stopwatch Time;` with `Seconds` is `Time_Seconds`. Set it with `set_shader_parameter("Time_Seconds", value)` (GDScript) or `SetShaderParameter("Time_Seconds", value)` (C#).
- A texture or combined sampler (`sampler2D`) becomes `uniform sampler2D <name>`. Give it a `Texture2D` with `set_shader_parameter("Photo", texture)`. Filtering and repeating come from the options of the Godot texture, not from a `SamplerState` in C#. The image can be a file or **what a camera sees**: a `ViewportTexture` from a `SubViewport` works as any other texture.
- A `SubViewport` shares the world of its parent; set `own_world_3d = true` when it must render its own scene.

## What is not supported

The plugin reports these with a clear error and never leaves a broken file: compute shaders, storage buffers (`StructuredBuffer`, `RWStructuredBuffer` or an array used as a buffer), more than one render target, atomic operations, and built-in variables that Godot does not have.

## If something fails

| What you see | What it means | What to do |
| --- | --- | --- |
| The window is **gray** and nothing draws | The `.gdshader` file does not exist yet or failed to load. | Check that `GodotGame/yotsuba_shaders/MyShaders/` has the file and use *Project → Reload Current Project*. |
| Godot does not see a shader you just created | The addon only reads files when the editor starts or gets focus. | *Project → Reload Current Project* (it asks to stop the game if it is running). |
| `dotnet` is not found when pressing Play | On macOS, Godot does not always inherit the `PATH` of your terminal. | Open Godot from a terminal where `dotnet --version` works, or set `command`. |
| The addon cannot find `yotsuba` | The tool is not installed, or Godot does not see the folder where .NET installs tools. | Run `dotnet tool install --global YotsubaShader.Compiler.CLI`, or write the full path to the executable in `command`. |
| A shader with a texture draws black | No image was given to the texture uniform. | Assign a `Texture2D` to it (the `Photo` property in the tutorial viewer). |
| The plugin lists the valid names | A vertex field has a name that is not Godot's. | Use one name from the table. |

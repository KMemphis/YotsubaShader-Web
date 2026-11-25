---
title: Compile for OpenGL
summary: Turn a finished C# shader into GLSL files and load them in an OpenGL program.
order: 4
---

This chapter starts from a shader that is already written. You copy it, compile it to GLSL with the CLI and load the result in OpenGL. Writing shaders is not the subject here; that is what [Get Started](../get-started/index.md) teaches.

## The shader

Install the CLI once and create a project for the shader:

```bash
dotnet tool install --global YotsubaShader.Compiler.CLI
dotnet new classlib -n MyShaders -f net8.0
dotnet add MyShaders package YotsubaShader.GlslSyntax
```

Delete the `Class1.cs` that the template creates and save this as `MyShaders/Plasma.cs`:

```csharp
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Resources;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.Language;
using static YotsubaShader.GlslSyntax.Methods.Math;

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

public struct Clock
{
    public float Seconds;
}

public class Plasma
{
    [uniform, layout(0, 0)]
    public Clock Time;

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
        float x = pixel.Uv.X * 2f - 1f;
        float y = pixel.Uv.Y * 2f - 1f;
        float t = Time.Seconds;

        float waves = sin(x * 6f + t)
                    + sin(y * 6f + t * 1.3f)
                    + sin((x + y) * 6f + t * 0.7f)
                    + sin(sqrt(x * x + y * y) * 9f - t * 2f);

        float red = 0.5f + 0.5f * sin(waves * 1.5f);
        float green = 0.5f + 0.5f * sin(waves * 1.5f + 2.1f);
        float blue = 0.5f + 0.5f * sin(waves * 1.5f + 4.2f);
        return new vec4(red, green, blue, 1f);
    }
}
```

It covers the whole screen with a moving plasma. The vertex method receives a position and a texture coordinate. The fragment method paints from `Time.Seconds`, a value your program writes into a uniform buffer on every frame.

## Which format OpenGL reads

OpenGL takes GLSL as text, one source per stage. The target is `glsl`:

```bash
yotsuba compile MyShaders/MyShaders.csproj --target glsl --output shaders
```

It prints nothing when it works and exits with code `0`. The `--output` folder is counted from the folder of the `.csproj`, and the subfolders follow the namespace:

```text
MyShaders/shaders/
└── MyShaders/
    ├── Plasma.Fragment.glsl
    └── Plasma.Vertex.glsl
```

There is one file per stage, named `<Class>.<Stage>.glsl`. This is the vertex file, exactly as the compiler wrote it:

```glsl
#version 450

struct Pixel
{
    vec4 Position;
    vec2 Uv;
};

layout(binding = 0, std140) uniform Clock
{
    float Seconds;
} Time;

layout(location = 0) in vec2 corner_Position;
layout(location = 1) in vec2 corner_Uv;
layout(location = 0) out vec2 _return_Uv;

void main()
{
    Pixel pixel;
    pixel.Position = vec4(corner_Position.x, corner_Position.y, 0.0, 1.0);
    pixel.Uv = corner_Uv;
    gl_Position = pixel.Position;
    _return_Uv = pixel.Uv;
}
```

The numbers you wrote in C# are the numbers OpenGL sees. The two vertex attributes:

```csharp
public struct Corner
{
    [location(0)] public vec2 Position;
    [location(1)] public vec2 Uv;
}
```

```glsl
layout(location = 0) in vec2 corner_Position;
layout(location = 1) in vec2 corner_Uv;
```

And the uniform buffer:

```csharp
[uniform, layout(0, 0)]
public Clock Time;
```

```glsl
layout(binding = 0, std140) uniform Clock
{
    float Seconds;
} Time;
```

`#version 450` means you need an OpenGL 4.5 context. macOS stops at OpenGL 4.1, so these files do not load there. Ask for that version with `--target glsl:410`, or use [Metal](metal.md) on that system. GLSL 4.10 has no `binding`, so tie the block to point 0 yourself before `BindBufferBase`: `gl.UniformBlockBinding(program, gl.GetUniformBlockIndex(program, "Clock"), 0);`

## Load it in OpenGL

The examples use Silk.NET, and every call has the same name in any OpenGL binding. The pointers need `<AllowUnsafeBlocks>true</AllowUnsafeBlocks>` in the `.csproj` of the project that draws. Create the window and the context as you always do (`GL gl = window.CreateOpenGL();`) and compile each file as a shader object. The text goes to the driver as the compiler wrote it:

```csharp
static uint Compile(GL gl, ShaderType type, string source)
{
    uint shader = gl.CreateShader(type);
    gl.ShaderSource(shader, source);
    gl.CompileShader(shader);

    gl.GetShader(shader, ShaderParameterName.CompileStatus, out int ok);
    if (ok == 0) throw new Exception(gl.GetShaderInfoLog(shader));
    return shader;
}

static uint CreateProgram(GL gl)
{
    string vertexSource = File.ReadAllText("shaders/MyShaders/Plasma.Vertex.glsl");
    string fragmentSource = File.ReadAllText("shaders/MyShaders/Plasma.Fragment.glsl");

    uint vertex = Compile(gl, ShaderType.VertexShader, vertexSource);
    uint fragment = Compile(gl, ShaderType.FragmentShader, fragmentSource);

    uint program = gl.CreateProgram();
    gl.AttachShader(program, vertex);
    gl.AttachShader(program, fragment);
    gl.LinkProgram(program);

    gl.GetProgram(program, ProgramPropertyARB.LinkStatus, out int linked);
    if (linked == 0) throw new Exception(gl.GetProgramInfoLog(program));

    gl.DeleteShader(vertex);
    gl.DeleteShader(fragment);
    return program;
}
```

The vertex buffer has four floats per vertex, and the attribute numbers are the `location` values from the C# struct. You do not look attributes up by name:

```csharp
float[] quad =
{
    -1f, -1f, 0f, 0f,
     1f, -1f, 1f, 0f,
    -1f,  1f, 0f, 1f,
    -1f,  1f, 0f, 1f,
     1f, -1f, 1f, 0f,
     1f,  1f, 1f, 1f,
};

uint vao = gl.GenVertexArray();
gl.BindVertexArray(vao);

uint vbo = gl.GenBuffer();
gl.BindBuffer(BufferTargetARB.ArrayBuffer, vbo);
gl.BufferData<float>(BufferTargetARB.ArrayBuffer, quad, BufferUsageARB.StaticDraw);

// [location(0)] vec2 Position
gl.EnableVertexAttribArray(0);
gl.VertexAttribPointer(0, 2, VertexAttribPointerType.Float, false, 16, (void*)0);

// [location(1)] vec2 Uv
gl.EnableVertexAttribArray(1);
gl.VertexAttribPointer(1, 2, VertexAttribPointerType.Float, false, 16, (void*)8);
```

The `Clock` block is at `binding = 0`, so the buffer goes to uniform binding point 0. A block in `std140` layout takes at least 16 bytes, which is why the buffer has 16 even though `Seconds` is a single `float`:

```csharp
uint clock = gl.GenBuffer();
gl.BindBuffer(BufferTargetARB.UniformBuffer, clock);
gl.BufferData(BufferTargetARB.UniformBuffer, 16, null, BufferUsageARB.DynamicDraw);
gl.BindBufferBase(BufferTargetARB.UniformBuffer, 0, clock);
```

On each frame, write the time and draw:

```csharp
float seconds = (float)window.Time;
gl.BindBuffer(BufferTargetARB.UniformBuffer, clock);
gl.BufferSubData(BufferTargetARB.UniformBuffer, 0, sizeof(float), &seconds);

gl.UseProgram(program);
gl.DrawArrays(PrimitiveType.Triangles, 0, 6);
```

## Embed it with `add`

If you do not want to ship the `.glsl` files, `add` writes the shaders into the project as C# methods:

```bash
yotsuba add MyShaders/MyShaders.csproj --target glsl
```

```text
Archivo generado: /home/you/Tutorial/MyShaders/YotsubaShader.g.cs
```

In the project that draws, which references `MyShaders`, ask for each stage by name. The text is the same one `compile` writes to disk:

```csharp
using MyShaders;
using YotsubaShader;
using YotsubaShader.Language;

var plasma = new Plasma();
string vertexSource = plasma.ToGlsl(Stage.Vertex);
string fragmentSource = plasma.ToGlsl(Stage.Fragment);
```

Pass those two strings to `Compile` from above. The rest of the program does not change.

## Which command to use

Use `compile` when your engine loads assets from disk, or when you want to open the GLSL and read it. Use `add` when the renderer is written in C# and you want the C# compiler to check the shader name. The options of both are in [The compile command](../reference/compile.md) and [The add command](../reference/add.md).

The same shader goes to the other graphics APIs by changing only the target: [Direct3D](direct3d.md), [Vulkan](vulkan.md), [Metal](metal.md), [WebGL](webgl.md) and [WebGPU](webgpu.md).

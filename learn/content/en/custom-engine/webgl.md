---
title: Compile for WebGL
summary: Turn a finished C# shader into GLSL ES files and load them in a WebGL 2 page.
order: 8
---

This chapter starts from a shader that is already written. You copy it, compile it to GLSL ES with the CLI and load the result in a WebGL page. Writing shaders is not the subject here; that is what [Get Started](../get-started/index.md) teaches.

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
        pixel.Position = Make.Vec4(corner.Position.X, corner.Position.Y, 0f, 1f);
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
        return Make.Vec4(red, green, blue, 1f);
    }
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

It covers the whole screen with a moving plasma. The vertex method receives a position and a texture coordinate. The fragment method paints from `Time.Seconds`, a value your page writes into a uniform buffer on every frame.

## Which format WebGL reads

WebGL takes GLSL ES as text. There is no target called `webgl`; the CLI answers with the list of what exists:

```bash
yotsuba compile MyShaders/MyShaders.csproj --target webgl
```

```text
El plugin 'webgl' no existe. Disponibles: monogame, kni, fna, godot.
```

The target for WebGL is `gles`. WebGL 2 is OpenGL ES 3.0, so ask for that version by adding `:300` to the target:

```bash
yotsuba compile MyShaders/MyShaders.csproj --target gles:300 --output shaders
```

It prints nothing when it works and exits with code `0`. The `--output` folder is counted from the folder of the `.csproj`, and the subfolders follow the namespace:

```text
MyShaders/shaders/
└── MyShaders/
    ├── Plasma.Fragment.gles
    └── Plasma.Vertex.gles
```

There is one file per stage, named `<Class>.<Stage>.gles`. Copy the two files to the folder your web server serves, next to the page. The numbers you wrote in C# are the numbers WebGL sees. The two vertex attributes:

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
layout(std140) uniform Clock
{
    float Seconds;
} Time;
```

## Why version 300

Without a version, `gles` writes `#version 310 es`, OpenGL ES 3.1, the version of phones and other OpenGL ES devices. WebGL 2 is ES 3.0 and rejects three things of 3.1, so `gles:300` writes them differently:

- The first line is `#version 300 es`.
- The uniform block has no `binding`, which does not exist in WebGL. It keeps `std140`, and you place it from JavaScript.
- The value that goes from the vertex stage to the fragment stage has no `layout(location)`, because WebGL joins the two stages by name. The CLI gives it the same name on both sides, `ys_varying0` (the `0` is its location).

In `Plasma.Vertex.gles`:

```glsl
out vec2 ys_varying0;
```

And in `Plasma.Fragment.gles`:

```glsl
in highp vec2 ys_varying0;
```

The vertex attributes keep their `layout(location)`, which ES 3.0 does accept. The files load as they are; there is nothing to edit.

## Load it in WebGL 2

Fetch each file, compile and link:

```js
const gl = document.getElementById('view').getContext('webgl2');

async function compile(type, url) {
  const source = await (await fetch(url)).text();
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(url + ': ' + gl.getShaderInfoLog(shader));
  }
  return shader;
}

const program = gl.createProgram();
gl.attachShader(program, await compile(gl.VERTEX_SHADER, 'Plasma.Vertex.gles'));
gl.attachShader(program, await compile(gl.FRAGMENT_SHADER, 'Plasma.Fragment.gles'));
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  throw new Error(gl.getProgramInfoLog(program));
}
```

The vertex buffer has four floats per vertex, and the attribute numbers are the `location` values from the C# struct. You do not look attributes up by name:

```js
const quad = new Float32Array([
  -1, -1, 0, 0,    1, -1, 1, 0,   -1, 1, 0, 1,
  -1,  1, 0, 1,    1, -1, 1, 0,    1, 1, 1, 1,
]);

const vao = gl.createVertexArray();
gl.bindVertexArray(vao);
gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

gl.enableVertexAttribArray(0);                           // [location(0)] vec2 Position
gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);
gl.enableVertexAttribArray(1);                           // [location(1)] vec2 Uv
gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);
```

The `Clock` block is the one you declared with `[uniform, layout(0, 0)]`. WebGL has no binding in the shader, so you tie the block to a binding point yourself. A block in `std140` layout takes at least 16 bytes, which is why the buffer has 16 even though `Seconds` is a single `float`:

```js
const clock = gl.createBuffer();
gl.bindBuffer(gl.UNIFORM_BUFFER, clock);
gl.bufferData(gl.UNIFORM_BUFFER, 16, gl.DYNAMIC_DRAW);

gl.uniformBlockBinding(program, gl.getUniformBlockIndex(program, 'Clock'), 0);
gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, clock);
```

On each frame, write the time and draw:

```js
function draw(seconds) {
  gl.bindBuffer(gl.UNIFORM_BUFFER, clock);
  gl.bufferSubData(gl.UNIFORM_BUFFER, 0, new Float32Array([seconds]));

  gl.useProgram(program);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

requestAnimationFrame(function frame(ms) {
  draw(ms / 1000);
  requestAnimationFrame(frame);
});
```

## Embed it with `add`

If a .NET application serves your page (ASP.NET Core, for example), you can skip the files. `add` writes the shaders into the shader project as C# methods:

```bash
yotsuba add MyShaders/MyShaders.csproj --target gles:300
```

```text
Archivo generado: /home/you/Tutorial/MyShaders/YotsubaShader.g.cs
```

In the web project, which references `MyShaders`, serve each stage as text:

```csharp
using MyShaders;
using YotsubaShader;
using YotsubaShader.Language;

var plasma = new Plasma();
var app = WebApplication.CreateBuilder(args).Build();

app.UseDefaultFiles();
app.UseStaticFiles();
app.MapGet("/shaders/plasma.vert", () => Results.Text(plasma.ToGlslEs(Stage.Vertex)));
app.MapGet("/shaders/plasma.frag", () => Results.Text(plasma.ToGlslEs(Stage.Fragment)));

app.Run();
```

In the page, change the two URLs that `compile` used for `/shaders/plasma.vert` and `/shaders/plasma.frag`. `add` uses the version you write in `--target`, so `ToGlslEs` returns the same ES 3.00 text as the files, and the rest of the page does not change.

## Which command to use

Use `compile` when your site is static and you copy the files to the server, or when you want to open the GLSL ES and read it. Use `add` when a C# application serves the page and you want the C# compiler to check the shader name. The options of both are in [The compile command](../reference/compile.md) and [The add command](../reference/add.md).

The same shader goes to the other graphics APIs by changing only the target: [OpenGL](opengl.md), [Direct3D](direct3d.md), [Vulkan](vulkan.md), [Metal](metal.md) and [WebGPU](webgpu.md).

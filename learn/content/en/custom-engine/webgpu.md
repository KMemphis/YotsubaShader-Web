---
title: Compile for WebGPU
summary: Turn a finished C# shader into a WGSL file and load it in a WebGPU page.
order: 9
---

This chapter starts from a shader that is already written. You copy it, compile it to WGSL with the CLI and load the result in a WebGPU page. Writing shaders is not the subject here; that is what [Get Started](../get-started/index.md) teaches.

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

It covers the whole screen with a moving plasma. The vertex method receives a position and a texture coordinate. The fragment method paints from `Time.Seconds`, a value your page writes into a uniform buffer on every frame.

## Which format WebGPU reads

WebGPU takes WGSL as text. The target is `wgsl`:

```bash
yotsuba compile MyShaders/MyShaders.csproj --target wgsl --output shaders
```

It prints nothing when it works and exits with code `0`. The `--output` folder is counted from the folder of the `.csproj`, and the subfolders follow the namespace:

```text
MyShaders/shaders/
└── MyShaders/
    └── Plasma.wgsl
```

Unlike GLSL or HLSL, WGSL keeps every stage of the shader in one file, named `<Class>.wgsl`. Each method marked with `[ShaderStage]` becomes an entry point with the name of the method:

```wgsl
@vertex
fn Vertex(@location(0) corner_Position: vec2<f32>, @location(1) corner_Uv: vec2<f32>) -> VertexOutput {
```

```wgsl
@fragment
fn Fragment(@location(0) pixel_Uv: vec2<f32>) -> @location(0) vec4<f32> {
```

Copy `Plasma.wgsl` to the folder your web server serves, next to the page. The numbers you wrote in C# are the numbers WebGPU sees. The two vertex attributes are the `@location` values of the `Vertex` entry point, and the uniform buffer keeps its set and binding as `@group` and `@binding`:

```csharp
[uniform, layout(0, 0)]
public Clock Time;
```

```wgsl
struct Clock {
    Seconds: f32,
}

@group(0) @binding(0)
var<uniform> Time: Clock;
```

The WGSL comes from the SPIR-V of the shader, converted by [naga](https://github.com/gfx-rs/wgpu/tree/trunk/naga), the shader translator of the Firefox and Rust WebGPU implementations. The CLI carries it inside; you install nothing else. That is why the file reads like generated code: helper names such as `Vertex_1`, and one line that changes the sign of `Position.y`. That line is there because the Y axis of WebGPU points up while the one of SPIR-V (Vulkan) points down; the image comes out the same way up in both.

Some shaders cannot be written in WGSL. The CLI then prints the reason for that class, writes the other files and exits with code `1`. The usual causes are built-in values that WebGPU does not have (`BaseVertex`, `SV_SamplePosition`) and copying a whole struct from a buffer when one of its fields is also used with atomic operations.

## Load it in WebGPU

Ask the browser for a device, configure the canvas and create one module from the file:

```js
const adapter = await navigator.gpu.requestAdapter();
const device = await adapter.requestDevice();

const context = document.getElementById('view').getContext('webgpu');
const format = navigator.gpu.getPreferredCanvasFormat();
context.configure({ device, format });

const module = device.createShaderModule({ code: await (await fetch('Plasma.wgsl')).text() });
```

The pipeline names each stage by its entry point, the name of the C# method. The vertex buffer has four floats per vertex, and `shaderLocation` is the `location` value from the C# struct:

```js
const quad = new Float32Array([
  -1, -1, 0, 0,    1, -1, 1, 0,   -1, 1, 0, 1,
  -1,  1, 0, 1,    1, -1, 1, 0,    1, 1, 1, 1,
]);

const vertices = device.createBuffer({
  size: quad.byteLength,
  usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
});
device.queue.writeBuffer(vertices, 0, quad);

const pipeline = device.createRenderPipeline({
  layout: 'auto',
  vertex: {
    module,
    entryPoint: 'Vertex',
    buffers: [{
      arrayStride: 16,
      attributes: [
        { shaderLocation: 0, offset: 0, format: 'float32x2' },   // [location(0)] vec2 Position
        { shaderLocation: 1, offset: 8, format: 'float32x2' },   // [location(1)] vec2 Uv
      ],
    }],
  },
  fragment: { module, entryPoint: 'Fragment', targets: [{ format }] },
});
```

The `Clock` buffer is the one you declared with `[uniform, layout(0, 0)]`: group `0`, binding `0`. A uniform buffer is at least 16 bytes, which is why it has 16 even though `Seconds` is a single `float`:

```js
const clock = device.createBuffer({
  size: 16,
  usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
});

const bindGroup = device.createBindGroup({
  layout: pipeline.getBindGroupLayout(0),
  entries: [{ binding: 0, resource: { buffer: clock } }],
});
```

On each frame, write the time and draw:

```js
function draw(seconds) {
  device.queue.writeBuffer(clock, 0, new Float32Array([seconds]));

  const encoder = device.createCommandEncoder();
  const pass = encoder.beginRenderPass({
    colorAttachments: [{
      view: context.getCurrentTexture().createView(),
      loadOp: 'clear',
      storeOp: 'store',
    }],
  });
  pass.setPipeline(pipeline);
  pass.setBindGroup(0, bindGroup);
  pass.setVertexBuffer(0, vertices);
  pass.draw(6);
  pass.end();
  device.queue.submit([encoder.finish()]);
}

requestAnimationFrame(function frame(ms) {
  draw(ms / 1000);
  requestAnimationFrame(frame);
});
```

## Embed it with `add`

If a .NET application serves your page (ASP.NET Core, for example), you can skip the file. With `--target wgsl`, `add` writes a `ToWgsl()` method for each shader into the shader project:

```bash
yotsuba add MyShaders/MyShaders.csproj --target wgsl
```

```text
Archivo generado: /home/you/Tutorial/MyShaders/YotsubaShader.g.cs
```

In the web project, which references `MyShaders`, serve the text:

```csharp
using MyShaders;
using YotsubaShader;

var plasma = new Plasma();
var app = WebApplication.CreateBuilder(args).Build();

app.UseDefaultFiles();
app.UseStaticFiles();
app.MapGet("/shaders/plasma.wgsl", () => Results.Text(plasma.ToWgsl()));

app.Run();
```

In the page, change the URL that `compile` used for `/shaders/plasma.wgsl`. The text is the same, so the rest of the page does not change. `ToWgsl()` takes no stage: it returns the whole file, with both entry points.

## Which command to use

Use `compile` when your site is static and you copy the file to the server, or when you want to open the WGSL and read it. Use `add` when a C# application serves the page and you want the C# compiler to check the shader name. The options of both are in [The compile command](../reference/compile.md) and [The add command](../reference/add.md).

The same shader goes to the other graphics APIs by changing only the target: [OpenGL](opengl.md), [Direct3D](direct3d.md), [Vulkan](vulkan.md), [Metal](metal.md) and [WebGL](webgl.md).

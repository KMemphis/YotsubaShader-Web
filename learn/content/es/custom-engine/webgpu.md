---
title: Compilar para WebGPU
summary: Convierte un shader de C# ya escrito en un archivo WGSL y cárgalo en una página WebGPU.
order: 9
---

Este capítulo parte de un shader que ya está escrito. Lo copias, lo compilas a WGSL con la CLI y cargas el resultado en una página WebGPU. Aquí no se aprende a escribir shaders; eso lo enseña [Get Started](../get-started/index.md).

## El shader

Instala la CLI una sola vez y crea un proyecto para el shader:

```bash
dotnet tool install --global YotsubaShader.Compiler.CLI
dotnet new classlib -n MisShaders -f net8.0
dotnet add MisShaders package YotsubaShader.GlslSyntax
```

Borra el `Class1.cs` que crea la plantilla y guarda esto como `MisShaders/Plasma.cs`:

```csharp
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Resources;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.Language;
using static YotsubaShader.GlslSyntax.Methods.Math;

namespace MisShaders;

public struct Vertice
{
    [location(0)] public vec2 Posicion;
    [location(1)] public vec2 Uv;
}

public struct Pixel
{
    [gl_Position] public vec4 Posicion;
    [location(0)] public vec2 Uv;
}

public struct PixelIn
{
    [location(0)] public vec2 Uv;
}

public struct Reloj
{
    public float Segundos;
}

public class Plasma
{
    [uniform, layout(0, 0)]
    public Reloj Tiempo;

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
        float x = pixel.Uv.X * 2f - 1f;
        float y = pixel.Uv.Y * 2f - 1f;
        float t = Tiempo.Segundos;

        float olas = sin(x * 6f + t)
                   + sin(y * 6f + t * 1.3f)
                   + sin((x + y) * 6f + t * 0.7f)
                   + sin(sqrt(x * x + y * y) * 9f - t * 2f);

        float rojo = 0.5f + 0.5f * sin(olas * 1.5f);
        float verde = 0.5f + 0.5f * sin(olas * 1.5f + 2.1f);
        float azul = 0.5f + 0.5f * sin(olas * 1.5f + 4.2f);
        return Crear.Vec4(rojo, verde, azul, 1f);
    }
}

public static class Crear
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

Cubre toda la pantalla con un plasma en movimiento. El método vertex recibe una posición y una coordenada de textura. El método fragment pinta a partir de `Tiempo.Segundos`, un valor que tu página escribe en un buffer uniform en cada frame.

## Qué formato lee WebGPU

WebGPU recibe WGSL como texto. El target es `wgsl`:

```bash
yotsuba compile MisShaders/MisShaders.csproj --target wgsl --output shaders
```

No imprime nada si todo sale bien y termina con código `0`. La carpeta de `--output` se cuenta desde la carpeta del `.csproj`, y las subcarpetas siguen el namespace:

```text
MisShaders/shaders/
└── MisShaders/
    └── Plasma.wgsl
```

A diferencia de GLSL o HLSL, WGSL guarda todos los stages del shader en un solo archivo, con el nombre `<Clase>.wgsl`. Cada método marcado con `[ShaderStage]` se convierte en un entry point con el nombre del método:

```wgsl
@vertex
fn Vertex(@location(0) vertice_Posicion: vec2<f32>, @location(1) vertice_Uv: vec2<f32>) -> VertexOutput {
```

```wgsl
@fragment
fn Fragment(@location(0) pixel_Uv: vec2<f32>) -> @location(0) vec4<f32> {
```

Copia `Plasma.wgsl` a la carpeta que sirve tu servidor web, junto a la página. Los números que escribiste en C# son los que ve WebGPU. Los dos atributos de vértice son los valores `@location` del entry point `Vertex`, y el buffer uniform conserva su set y su binding como `@group` y `@binding`:

```csharp
[uniform, layout(0, 0)]
public Reloj Tiempo;
```

```wgsl
struct Reloj {
    Segundos: f32,
}

@group(0) @binding(0)
var<uniform> Tiempo: Reloj;
```

El WGSL sale del SPIR-V del shader, convertido por [naga](https://github.com/gfx-rs/wgpu/tree/trunk/naga), el traductor de shaders de las implementaciones de WebGPU de Firefox y de Rust. La CLI lo lleva dentro; no instalas nada más. Por eso el archivo se lee como código generado: nombres auxiliares como `Vertex_1`, y una línea que cambia el signo de `Posicion.y`. Esa línea está porque el eje Y de WebGPU apunta hacia arriba y el de SPIR-V (Vulkan) hacia abajo; la imagen sale igual de derecha en los dos.

Algunos shaders no se pueden escribir en WGSL. Entonces la CLI imprime el motivo para esa clase, escribe los demás archivos y termina con código `1`. Las causas habituales son valores de sistema que WebGPU no tiene (`BaseVertex`, `SV_SamplePosition`) y copiar una struct entera de un buffer cuando uno de sus campos también se usa con operaciones atómicas.

## Cárgalo en WebGPU

Pide al navegador un dispositivo, configura el canvas y crea un módulo con el archivo:

```js
const adapter = await navigator.gpu.requestAdapter();
const device = await adapter.requestDevice();

const context = document.getElementById('view').getContext('webgpu');
const format = navigator.gpu.getPreferredCanvasFormat();
context.configure({ device, format });

const module = device.createShaderModule({ code: await (await fetch('Plasma.wgsl')).text() });
```

El pipeline nombra cada stage por su entry point, el nombre del método de C#. El buffer de vértices tiene cuatro floats por vértice, y `shaderLocation` es el valor de `location` de la struct de C#:

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
        { shaderLocation: 0, offset: 0, format: 'float32x2' },   // [location(0)] vec2 Posicion
        { shaderLocation: 1, offset: 8, format: 'float32x2' },   // [location(1)] vec2 Uv
      ],
    }],
  },
  fragment: { module, entryPoint: 'Fragment', targets: [{ format }] },
});
```

El buffer `Reloj` es el que declaraste con `[uniform, layout(0, 0)]`: grupo `0`, binding `0`. Un buffer uniform ocupa al menos 16 bytes, por eso tiene 16 aunque `Segundos` sea un solo `float`:

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

En cada frame, escribe el tiempo y dibuja:

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

## Inclúyelo con `add`

Si una aplicación .NET sirve tu página (ASP.NET Core, por ejemplo), puedes olvidarte del archivo. Con `--target wgsl`, `add` escribe un método `ToWgsl()` por shader dentro del proyecto de shaders:

```bash
yotsuba add MisShaders/MisShaders.csproj --target wgsl
```

```text
Archivo generado: /home/tu/Tutorial/MisShaders/YotsubaShader.g.cs
```

En el proyecto web, que referencia a `MisShaders`, sirve el texto:

```csharp
using MisShaders;
using YotsubaShader;

var plasma = new Plasma();
var app = WebApplication.CreateBuilder(args).Build();

app.UseDefaultFiles();
app.UseStaticFiles();
app.MapGet("/shaders/plasma.wgsl", () => Results.Text(plasma.ToWgsl()));

app.Run();
```

En la página, cambia la URL que usaba `compile` por `/shaders/plasma.wgsl`. El texto es el mismo, así que el resto de la página no cambia. `ToWgsl()` no recibe stage: devuelve el archivo entero, con los dos entry points.

## Qué comando usar

Usa `compile` cuando tu sitio es estático y copias el archivo al servidor, o cuando quieres abrir el WGSL y leerlo. Usa `add` cuando una aplicación de C# sirve la página y quieres que el compilador de C# compruebe el nombre del shader. Las opciones de los dos están en [El comando compile](../reference/compile.md) y [El comando add](../reference/add.md).

El mismo shader va a las otras APIs gráficas cambiando solo el target: [OpenGL](opengl.md), [Direct3D](direct3d.md), [Vulkan](vulkan.md), [Metal](metal.md) y [WebGL](webgl.md).

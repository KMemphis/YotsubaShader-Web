---
title: Compilar para WebGL
summary: Convierte un shader de C# ya escrito en archivos GLSL ES y cárgalos en una página WebGL 2.
order: 8
---

Este capítulo parte de un shader que ya está escrito. Lo copias, lo compilas a GLSL ES con la CLI y cargas el resultado en una página WebGL. Aquí no se aprende a escribir shaders; eso lo enseña [Get Started](../get-started/index.md).

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
        pixel.Posicion = new vec4(vertice.Posicion.X, vertice.Posicion.Y, 0f, 1f);
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
        return new vec4(rojo, verde, azul, 1f);
    }
}
```

Cubre toda la pantalla con un plasma en movimiento. El método vertex recibe una posición y una coordenada de textura. El método fragment pinta a partir de `Tiempo.Segundos`, un valor que tu página escribe en un buffer uniform en cada frame.

## Qué formato lee WebGL

WebGL recibe GLSL ES como texto. No existe un target llamado `webgl`; la CLI responde con la lista de los que existen:

```bash
yotsuba compile MisShaders/MisShaders.csproj --target webgl
```

```text
El plugin 'webgl' no existe. Disponibles: monogame, kni, fna, godot.
```

El target para WebGL es `gles`. WebGL 2 es OpenGL ES 3.0, así que pide esa versión añadiendo `:300` al target:

```bash
yotsuba compile MisShaders/MisShaders.csproj --target gles:300 --output shaders
```

No imprime nada si todo sale bien y termina con código `0`. La carpeta de `--output` se cuenta desde la carpeta del `.csproj`, y las subcarpetas siguen el namespace:

```text
MisShaders/shaders/
└── MisShaders/
    ├── Plasma.Fragment.gles
    └── Plasma.Vertex.gles
```

Hay un archivo por stage, con el nombre `<Clase>.<Stage>.gles`. Copia los dos archivos a la carpeta que sirve tu servidor web, junto a la página. Los números que escribiste en C# son los que ve WebGL. Los dos atributos de vértice:

```csharp
public struct Vertice
{
    [location(0)] public vec2 Posicion;
    [location(1)] public vec2 Uv;
}
```

```glsl
layout(location = 0) in vec2 vertice_Posicion;
layout(location = 1) in vec2 vertice_Uv;
```

Y el buffer uniform:

```csharp
[uniform, layout(0, 0)]
public Reloj Tiempo;
```

```glsl
layout(std140) uniform Reloj
{
    float Segundos;
} Tiempo;
```

## Por qué la versión 300

Sin versión, `gles` escribe `#version 310 es`, OpenGL ES 3.1, la versión de los móviles y otros dispositivos con OpenGL ES. WebGL 2 es ES 3.0 y rechaza tres cosas de 3.1, así que `gles:300` las escribe de otra forma:

- La primera línea es `#version 300 es`.
- El bloque uniform no lleva `binding`, que no existe en WebGL. Conserva `std140`, y lo colocas desde JavaScript.
- El valor que va de la etapa vertex a la etapa fragment no lleva `layout(location)`, porque WebGL une las dos etapas por nombre. La CLI le da el mismo nombre en los dos lados, `ys_varying0` (el `0` es su ubicación).

En `Plasma.Vertex.gles`:

```glsl
out vec2 ys_varying0;
```

Y en `Plasma.Fragment.gles`:

```glsl
in highp vec2 ys_varying0;
```

Los atributos de vértice conservan su `layout(location)`, que ES 3.0 sí acepta. Los archivos se cargan tal cual; no hay nada que editar.

## Cárgalo en WebGL 2

Descarga cada archivo, compila y enlaza:

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

El buffer de vértices tiene cuatro floats por vértice, y los números de atributo son los valores de `location` de la struct de C#. No buscas los atributos por nombre:

```js
const quad = new Float32Array([
  -1, -1, 0, 0,    1, -1, 1, 0,   -1, 1, 0, 1,
  -1,  1, 0, 1,    1, -1, 1, 0,    1, 1, 1, 1,
]);

const vao = gl.createVertexArray();
gl.bindVertexArray(vao);
gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

gl.enableVertexAttribArray(0);                           // [location(0)] vec2 Posicion
gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);
gl.enableVertexAttribArray(1);                           // [location(1)] vec2 Uv
gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);
```

El bloque `Reloj` es el que declaraste con `[uniform, layout(0, 0)]`. En WebGL el shader no lleva binding, así que enlazas tú el bloque a un punto de enlace. Un bloque con layout `std140` ocupa al menos 16 bytes, por eso el buffer tiene 16 aunque `Segundos` sea un solo `float`:

```js
const reloj = gl.createBuffer();
gl.bindBuffer(gl.UNIFORM_BUFFER, reloj);
gl.bufferData(gl.UNIFORM_BUFFER, 16, gl.DYNAMIC_DRAW);

gl.uniformBlockBinding(program, gl.getUniformBlockIndex(program, 'Reloj'), 0);
gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, reloj);
```

En cada frame, escribe el tiempo y dibuja:

```js
function draw(segundos) {
  gl.bindBuffer(gl.UNIFORM_BUFFER, reloj);
  gl.bufferSubData(gl.UNIFORM_BUFFER, 0, new Float32Array([segundos]));

  gl.useProgram(program);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

requestAnimationFrame(function frame(ms) {
  draw(ms / 1000);
  requestAnimationFrame(frame);
});
```

## Inclúyelo con `add`

Si una aplicación .NET sirve tu página (ASP.NET Core, por ejemplo), puedes olvidarte de los archivos. `add` escribe los shaders dentro del proyecto de shaders como métodos de C#:

```bash
yotsuba add MisShaders/MisShaders.csproj --target gles:300
```

```text
Archivo generado: /home/tu/Tutorial/MisShaders/YotsubaShader.g.cs
```

En el proyecto web, que referencia a `MisShaders`, sirve cada stage como texto:

```csharp
using MisShaders;
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

En la página, cambia las dos URL que usaba `compile` por `/shaders/plasma.vert` y `/shaders/plasma.frag`. `add` usa la versión que escribes en `--target`, así que `ToGlslEs` devuelve el mismo texto ES 3.00 que los archivos, y el resto de la página no cambia.

## Qué comando usar

Usa `compile` cuando tu sitio es estático y copias los archivos al servidor, o cuando quieres abrir el GLSL ES y leerlo. Usa `add` cuando una aplicación de C# sirve la página y quieres que el compilador de C# compruebe el nombre del shader. Las opciones de los dos están en [El comando compile](../reference/compile.md) y [El comando add](../reference/add.md).

El mismo shader va a las otras APIs gráficas cambiando solo el target: [OpenGL](opengl.md), [Direct3D](direct3d.md), [Vulkan](vulkan.md), [Metal](metal.md) y [WebGPU](webgpu.md).

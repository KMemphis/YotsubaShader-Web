---
title: Compilar para Metal
summary: Convierte un shader de C# ya escrito en archivos Metal Shading Language y cárgalos en una app Metal.
order: 7
---

Este capítulo parte de un shader que ya está escrito. Lo copias, lo compilas a Metal Shading Language con la CLI y cargas el resultado en Metal. Aquí no se aprende a escribir shaders; eso lo enseña [Get Started](../get-started/index.md).

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

Cubre toda la pantalla con un plasma en movimiento. El método vertex recibe una posición y una coordenada de textura. El método fragment pinta a partir de `Tiempo.Segundos`, un valor que tu programa escribe en un buffer en cada frame.

## Qué formato lee Metal

Metal recibe Metal Shading Language (MSL) como texto y lo compila en el dispositivo. El target es `msl`, y `metal` se acepta como otro nombre para él:

```bash
yotsuba compile MisShaders/MisShaders.csproj --target msl --output shaders
```

No imprime nada si todo sale bien y termina con código `0`. La carpeta de `--output` se cuenta desde la carpeta del `.csproj`, y las subcarpetas siguen el namespace:

```text
MisShaders/shaders/
└── MisShaders/
    ├── Plasma.Fragment.msl
    └── Plasma.Vertex.msl
```

Hay un archivo por stage, con el nombre `<Clase>.<Stage>.msl`. El método `Vertex` de C# se convierte en una función llamada `Vertex`, y `Fragment` en `Fragment`. Los dos puntos de entrada, tal como los escribió el compilador:

```text
vertex Vertex_out Vertex(Vertex_in in [[stage_in]])
```

```text
fragment Fragment_out Fragment(Fragment_in in [[stage_in]], constant Reloj& Tiempo [[buffer(0)]])
```

Los números que escribiste en C# son los que ve Metal. Los dos atributos de vértice:

```csharp
public struct Vertice
{
    [location(0)] public vec2 Posicion;
    [location(1)] public vec2 Uv;
}
```

```text
struct Vertex_in
{
    float2 vertice_Posicion [[attribute(0)]];
    float2 vertice_Uv [[attribute(1)]];
};
```

Y el buffer uniform:

```csharp
[uniform, layout(0, 0)]
public Reloj Tiempo;
```

Es `constant Reloj& Tiempo [[buffer(0)]]`. Solo la función fragment lo lee, así que solo la función fragment lo recibe. La función vertex recibe únicamente los vértices. El valor que devuelve el método fragment va a `[[color(0)]]`.

## Cárgalo en Metal

Metal se usa desde Swift y Objective-C, así que esta parte está en Swift. Lee cada archivo y pide al dispositivo que lo compile en una biblioteca; los nombres de función son los de los métodos de C#:

```swift
import Metal
import QuartzCore

let device = MTLCreateSystemDefaultDevice()!

func library(_ path: String) throws -> MTLLibrary {
    let source = try String(contentsOfFile: path, encoding: .utf8)
    return try device.makeLibrary(source: source, options: nil)
}

let vertexLibrary = try library("shaders/MisShaders/Plasma.Vertex.msl")
let fragmentLibrary = try library("shaders/MisShaders/Plasma.Fragment.msl")
```

El vertex descriptor repite los números `location` de la struct de C#. El buffer tiene cuatro floats por vértice, dos para cada atributo. Después el pipeline recibe las dos funciones:

```swift
// [location(0)] vec2 Posicion y [location(1)] vec2 Uv, en un solo buffer.
let layout = MTLVertexDescriptor()
layout.attributes[0].format = .float2
layout.attributes[0].offset = 0
layout.attributes[0].bufferIndex = 0
layout.attributes[1].format = .float2
layout.attributes[1].offset = 8
layout.attributes[1].bufferIndex = 0
layout.layouts[0].stride = 16

let descriptor = MTLRenderPipelineDescriptor()
descriptor.vertexFunction = vertexLibrary.makeFunction(name: "Vertex")
descriptor.fragmentFunction = fragmentLibrary.makeFunction(name: "Fragment")
descriptor.vertexDescriptor = layout
descriptor.colorAttachments[0].pixelFormat = .bgra8Unorm
let pipeline = try device.makeRenderPipelineState(descriptor: descriptor)
```

En `pixelFormat` usa el formato de píxel de tu vista o de tu textura. El buffer `Reloj` va a la etapa fragment en el índice 0. Un buffer de 16 bytes alcanza, ya que `Segundos` es un solo `float`:

```swift
let quad: [Float] = [
    -1, -1, 0, 0,    1, -1, 1, 0,   -1, 1, 0, 1,
    -1,  1, 0, 1,    1, -1, 1, 0,    1, 1, 1, 1,
]
let vertices = device.makeBuffer(bytes: quad, length: quad.count * 4, options: [])!
let reloj = device.makeBuffer(length: 16, options: [])!
```

En cada frame, escribe el tiempo en el buffer y codifica el dibujo:

```swift
let inicio = CACurrentMediaTime()   // una vez, antes del primer frame
// ...
var segundos = Float(CACurrentMediaTime() - inicio)
reloj.contents().copyMemory(from: &segundos, byteCount: 4)

encoder.setRenderPipelineState(pipeline)
encoder.setVertexBuffer(vertices, offset: 0, index: 0)
encoder.setFragmentBuffer(reloj, offset: 0, index: 0)
encoder.drawPrimitives(type: .triangle, vertexStart: 0, vertexCount: 6)
```

## Inclúyelo con `add`

Si tu app está escrita en C#, con .NET para macOS o iOS, `add` escribe los shaders dentro del proyecto como métodos y puedes olvidarte de los archivos:

```bash
yotsuba add MisShaders/MisShaders.csproj --target msl
```

```text
Archivo generado: /home/tu/Tutorial/MisShaders/YotsubaShader.g.cs
```

En el proyecto que dibuja, que referencia a `MisShaders`, pide cada stage por su nombre. El texto es el mismo que `compile` escribe en disco:

```csharp
using MisShaders;
using YotsubaShader;
using YotsubaShader.Language;

var plasma = new Plasma();
string vertexSource = plasma.ToMSL(Stage.Vertex);
string fragmentSource = plasma.ToMSL(Stage.Fragment);
```

Entrega cada texto al dispositivo como Swift entrega `source` a `makeLibrary(source:options:)`; en .NET el método se llama `CreateLibrary`. Las funciones se siguen llamando `Vertex` y `Fragment`.

## Qué comando usar

Usa `compile` cuando tu app carga los assets desde el bundle, o cuando quieres abrir el MSL y leerlo. Usa `add` cuando el renderer está escrito en C# y quieres que el compilador de C# compruebe el nombre del shader. Las opciones de los dos están en [El comando compile](../reference/compile.md) y [El comando add](../reference/add.md).

El mismo shader va a las otras APIs gráficas cambiando solo el target: [OpenGL](opengl.md), [Direct3D](direct3d.md), [Vulkan](vulkan.md) y [WebGL](webgl.md).

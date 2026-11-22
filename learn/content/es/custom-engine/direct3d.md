---
title: Compilar para Direct3D
summary: Convierte un shader de C# ya escrito en archivos HLSL y cárgalos en Direct3D 11 o 12.
order: 5
---

Este capítulo parte de un shader que ya está escrito. Lo copias, lo compilas a HLSL con la CLI y cargas el resultado en Direct3D. Aquí no se aprende a escribir shaders; eso lo enseña [Get Started](../get-started/index.md).

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

Cubre toda la pantalla con un plasma en movimiento. El método vertex recibe una posición y una coordenada de textura. El método fragment pinta a partir de `Tiempo.Segundos`, un valor que tu programa escribe en un constant buffer en cada frame.

## Qué formato lee Direct3D

Direct3D recibe HLSL. El target es `hlsl`:

```bash
yotsuba compile MisShaders/MisShaders.csproj --target hlsl --output shaders
```

No imprime nada si todo sale bien y termina con código `0`. La carpeta de `--output` se cuenta desde la carpeta del `.csproj`, y las subcarpetas siguen el namespace:

```text
MisShaders/shaders/
└── MisShaders/
    ├── Plasma.Fragment.hlsl
    └── Plasma.Vertex.hlsl
```

Hay un archivo por stage, con el nombre `<Clase>.<Stage>.hlsl`. El archivo está escrito para shader model 5.0, el que compila Direct3D 11. Direct3D 12 también lo compila, con DXC. El método `Vertex` de C# se convierte en una función llamada `Vertex`, y lo mismo pasa con `Fragment`. Estas son las partes de `Plasma.Vertex.hlsl` que le importan a tu programa:

```hlsl
cbuffer Reloj : register(b0)
{
    float Tiempo_Segundos : packoffset(c0);
};

struct SPIRV_Cross_Input
{
    float2 vertice_Posicion : TEXCOORD0;
    float2 vertice_Uv : TEXCOORD1;
};

struct SPIRV_Cross_Output
{
    float2 _return_Uv : TEXCOORD0;
    float4 gl_Position : SV_Position;
};

SPIRV_Cross_Output Vertex(SPIRV_Cross_Input stage_input)
```

Los números que escribiste en C# son los que ve Direct3D. Los dos atributos de vértice:

```csharp
public struct Vertice
{
    [location(0)] public vec2 Posicion;
    [location(1)] public vec2 Uv;
}
```

Llegan como `TEXCOORD0` y `TEXCOORD1`. Y el constant buffer:

```csharp
[uniform, layout(0, 0)]
public Reloj Tiempo;
```

Se convierte en `cbuffer Reloj : register(b0)`, y su campo es una constante suelta llamada `Tiempo_Segundos`. El color que devuelve el método fragment va a `SV_Target0`.

## Cárgalo en Direct3D 11

Los ejemplos usan Vortice.Windows (`Vortice.Direct3D11`, `Vortice.D3DCompiler` y `Vortice.DXGI`); las llamadas son las de la API nativa. Crea el device y el context como siempre. Compila cada archivo con el punto de entrada y el perfil de su stage:

```csharp
static Blob Compile(string source, string entryPoint, string profile)
{
    var result = Compiler.Compile(source, entryPoint, entryPoint, profile, out Blob code, out Blob errors);
    if (result.Failure) throw new Exception(errors.AsString());
    return code;
}

string vertexSource = File.ReadAllText("shaders/MisShaders/Plasma.Vertex.hlsl");
string fragmentSource = File.ReadAllText("shaders/MisShaders/Plasma.Fragment.hlsl");

Blob vertexCode = Compile(vertexSource, "Vertex", "vs_5_0");
Blob pixelCode = Compile(fragmentSource, "Fragment", "ps_5_0");

ID3D11VertexShader vertex = device.CreateVertexShader(vertexCode.AsBytes());
ID3D11PixelShader pixel = device.CreatePixelShader(pixelCode.AsBytes());
```

El input layout usa el índice de `TEXCOORD` de cada `location`. El buffer de vértices tiene cuatro floats por vértice, dos para cada atributo:

```csharp
var elements = new[]
{
    new InputElementDescription("TEXCOORD", 0, Format.R32G32_Float, 0, 0),   // [location(0)] Posicion
    new InputElementDescription("TEXCOORD", 1, Format.R32G32_Float, 8, 0),   // [location(1)] Uv
};
ID3D11InputLayout layout = device.CreateInputLayout(elements, vertexCode.AsBytes());
```

El buffer `Reloj` está en `b0`. Un constant buffer se mide en múltiplos de 16 bytes, así que ocupa 16 aunque `Segundos` sea un solo `float`. Solo lo lee el método fragment, así que va a la etapa de píxel:

```csharp
ID3D11Buffer reloj = device.CreateBuffer(new BufferDescription(16, BindFlags.ConstantBuffer));

context.VSSetShader(vertex);
context.PSSetShader(pixel);
context.IASetInputLayout(layout);
context.PSSetConstantBuffer(0, reloj);
```

En cada frame, escribe el tiempo y dibuja los seis vértices del cuadrado:

```csharp
context.UpdateSubresource(new Vector4(segundos, 0, 0, 0), reloj);
context.Draw(6, 0);
```

## Direct3D 12

Direct3D 12 compila HLSL con DXC. Los mismos archivos entran con un perfil de shader model 6, una llamada por stage. Puedes probarlo en la consola antes de escribir nada de C#:

```bash
dxc -T vs_6_0 -E Vertex MisShaders/shaders/MisShaders/Plasma.Vertex.hlsl -Fo Plasma.Vertex.dxil
dxc -T ps_6_0 -E Fragment MisShaders/shaders/MisShaders/Plasma.Fragment.hlsl -Fo Plasma.Fragment.dxil
```

`-E` es el punto de entrada. Los archivos `.dxil` son el bytecode que pasas a `CreateGraphicsPipelineState` como vertex shader y pixel shader. En la root signature, el constant buffer es el `b0` de la etapa de píxel.

## Inclúyelo con `add`

Si no quieres distribuir los archivos `.hlsl`, `add` escribe los shaders dentro del proyecto como métodos de C#:

```bash
yotsuba add MisShaders/MisShaders.csproj --target hlsl
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
string vertexSource = plasma.ToHlsl(Stage.Vertex);
string fragmentSource = plasma.ToHlsl(Stage.Fragment);
```

Pasa esos dos textos a `Compile` de arriba. El resto del programa no cambia.

## Qué comando usar

Usa `compile` cuando tu motor carga los assets desde disco, o cuando quieres abrir el HLSL y leerlo. Usa `add` cuando el renderer está escrito en C# y quieres que el compilador de C# compruebe el nombre del shader. Las opciones de los dos están en [El comando compile](../reference/compile.md) y [El comando add](../reference/add.md).

El mismo shader va a las otras APIs gráficas cambiando solo el target: [OpenGL](opengl.md), [Vulkan](vulkan.md), [Metal](metal.md) y [WebGL](webgl.md).

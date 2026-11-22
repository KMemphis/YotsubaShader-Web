---
title: Compile for Direct3D
summary: Turn a finished C# shader into HLSL files and load them in Direct3D 11 or 12.
order: 5
---

This chapter starts from a shader that is already written. You copy it, compile it to HLSL with the CLI and load the result in Direct3D. Writing shaders is not the subject here; that is what [Get Started](../get-started/index.md) teaches.

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

It covers the whole screen with a moving plasma. The vertex method receives a position and a texture coordinate. The fragment method paints from `Time.Seconds`, a value your program writes into a constant buffer on every frame.

## Which format Direct3D reads

Direct3D takes HLSL. The target is `hlsl`:

```bash
yotsuba compile MyShaders/MyShaders.csproj --target hlsl --output shaders
```

It prints nothing when it works and exits with code `0`. The `--output` folder is counted from the folder of the `.csproj`, and the subfolders follow the namespace:

```text
MyShaders/shaders/
└── MyShaders/
    ├── Plasma.Fragment.hlsl
    └── Plasma.Vertex.hlsl
```

There is one file per stage, named `<Class>.<Stage>.hlsl`. The file is written for shader model 5.0, the one Direct3D 11 compiles. Direct3D 12 compiles it too with DXC. The `Vertex` method of C# turns into a function named `Vertex`; the same goes for `Fragment`. These are the parts of `Plasma.Vertex.hlsl` that matter to your program:

```hlsl
cbuffer Clock : register(b0)
{
    float Time_Seconds : packoffset(c0);
};

struct SPIRV_Cross_Input
{
    float2 corner_Position : TEXCOORD0;
    float2 corner_Uv : TEXCOORD1;
};

struct SPIRV_Cross_Output
{
    float2 _return_Uv : TEXCOORD0;
    float4 gl_Position : SV_Position;
};

SPIRV_Cross_Output Vertex(SPIRV_Cross_Input stage_input)
```

The numbers you wrote in C# are the numbers Direct3D sees. The two vertex attributes:

```csharp
public struct Corner
{
    [location(0)] public vec2 Position;
    [location(1)] public vec2 Uv;
}
```

They arrive as `TEXCOORD0` and `TEXCOORD1`. And the constant buffer:

```csharp
[uniform, layout(0, 0)]
public Clock Time;
```

It becomes `cbuffer Clock : register(b0)`, and its field is a loose constant named `Time_Seconds`. The color the fragment method returns goes to `SV_Target0`.

## Load it in Direct3D 11

The examples use Vortice.Windows (`Vortice.Direct3D11`, `Vortice.D3DCompiler` and `Vortice.DXGI`); the calls are the ones of the native API. Create the device and the context as you always do. Compile each file with the entry point and the profile of its stage:

```csharp
static Blob Compile(string source, string entryPoint, string profile)
{
    var result = Compiler.Compile(source, entryPoint, entryPoint, profile, out Blob code, out Blob errors);
    if (result.Failure) throw new Exception(errors.AsString());
    return code;
}

string vertexSource = File.ReadAllText("shaders/MyShaders/Plasma.Vertex.hlsl");
string fragmentSource = File.ReadAllText("shaders/MyShaders/Plasma.Fragment.hlsl");

Blob vertexCode = Compile(vertexSource, "Vertex", "vs_5_0");
Blob pixelCode = Compile(fragmentSource, "Fragment", "ps_5_0");

ID3D11VertexShader vertex = device.CreateVertexShader(vertexCode.AsBytes());
ID3D11PixelShader pixel = device.CreatePixelShader(pixelCode.AsBytes());
```

The input layout uses the `TEXCOORD` index of each `location`. The vertex buffer has four floats per vertex, two for each attribute:

```csharp
var elements = new[]
{
    new InputElementDescription("TEXCOORD", 0, Format.R32G32_Float, 0, 0),   // [location(0)] Position
    new InputElementDescription("TEXCOORD", 1, Format.R32G32_Float, 8, 0),   // [location(1)] Uv
};
ID3D11InputLayout layout = device.CreateInputLayout(elements, vertexCode.AsBytes());
```

The `Clock` buffer is at `b0`. A constant buffer is sized in multiples of 16 bytes, so it is 16 bytes even though `Seconds` is a single `float`. Only the fragment method reads it, so it goes to the pixel stage:

```csharp
ID3D11Buffer clock = device.CreateBuffer(new BufferDescription(16, BindFlags.ConstantBuffer));

context.VSSetShader(vertex);
context.PSSetShader(pixel);
context.IASetInputLayout(layout);
context.PSSetConstantBuffer(0, clock);
```

On each frame, write the time and draw the six vertices of the quad:

```csharp
context.UpdateSubresource(new Vector4(seconds, 0, 0, 0), clock);
context.Draw(6, 0);
```

## Direct3D 12

Direct3D 12 compiles HLSL with DXC. The same files go in with a shader model 6 profile, one call per stage. You can run it from the console before writing any C#:

```bash
dxc -T vs_6_0 -E Vertex MyShaders/shaders/MyShaders/Plasma.Vertex.hlsl -Fo Plasma.Vertex.dxil
dxc -T ps_6_0 -E Fragment MyShaders/shaders/MyShaders/Plasma.Fragment.hlsl -Fo Plasma.Fragment.dxil
```

`-E` is the entry point. The `.dxil` files are what you pass to `CreateGraphicsPipelineState` as the vertex and pixel shader bytecode. In the root signature, the constant buffer is the `b0` of the pixel stage.

## Embed it with `add`

If you do not want to ship the `.hlsl` files, `add` writes the shaders into the project as C# methods:

```bash
yotsuba add MyShaders/MyShaders.csproj --target hlsl
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
string vertexSource = plasma.ToHlsl(Stage.Vertex);
string fragmentSource = plasma.ToHlsl(Stage.Fragment);
```

Pass those two strings to `Compile` from above. The rest of the program does not change.

## Which command to use

Use `compile` when your engine loads assets from disk, or when you want to open the HLSL and read it. Use `add` when the renderer is written in C# and you want the C# compiler to check the shader name. The options of both are in [The compile command](../reference/compile.md) and [The add command](../reference/add.md).

The same shader goes to the other graphics APIs by changing only the target: [OpenGL](opengl.md), [Vulkan](vulkan.md), [Metal](metal.md) and [WebGL](webgl.md).

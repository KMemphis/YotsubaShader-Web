---
title: Compile for Metal
summary: Turn a finished C# shader into Metal Shading Language files and load them in a Metal app.
order: 7
---

This chapter starts from a shader that is already written. You copy it, compile it to Metal Shading Language with the CLI and load the result in Metal. Writing shaders is not the subject here; that is what [Get Started](../get-started/index.md) teaches.

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

It covers the whole screen with a moving plasma. The vertex method receives a position and a texture coordinate. The fragment method paints from `Time.Seconds`, a value your program writes into a buffer on every frame.

## Which format Metal reads

Metal takes Metal Shading Language (MSL) as text and compiles it on the device. The target is `msl`, and `metal` is accepted as another name for it:

```bash
yotsuba compile MyShaders/MyShaders.csproj --target msl --output shaders
```

It prints nothing when it works and exits with code `0`. The `--output` folder is counted from the folder of the `.csproj`, and the subfolders follow the namespace:

```text
MyShaders/shaders/
└── MyShaders/
    ├── Plasma.Fragment.msl
    └── Plasma.Vertex.msl
```

There is one file per stage, named `<Class>.<Stage>.msl`. The `Vertex` method of C# turns into a function named `Vertex`, and `Fragment` into `Fragment`. The two entry points, as the compiler wrote them:

```text
vertex Vertex_out Vertex(Vertex_in in [[stage_in]])
```

```text
fragment Fragment_out Fragment(Fragment_in in [[stage_in]], constant Clock& Time [[buffer(0)]])
```

The numbers you wrote in C# are the numbers Metal sees. The two vertex attributes:

```csharp
public struct Corner
{
    [location(0)] public vec2 Position;
    [location(1)] public vec2 Uv;
}
```

```text
struct Vertex_in
{
    float2 corner_Position [[attribute(0)]];
    float2 corner_Uv [[attribute(1)]];
};
```

And the uniform buffer:

```csharp
[uniform, layout(0, 0)]
public Clock Time;
```

It is `constant Clock& Time [[buffer(0)]]`. Only the fragment function reads it, so only the fragment function receives it. The vertex function takes the vertices alone. The value the fragment method returns goes to `[[color(0)]]`.

## Load it in Metal

Metal is used from Swift and Objective-C, so this part is in Swift. Read each file and ask the device to compile it into a library; the function names are the ones of the C# methods:

```swift
import Metal
import QuartzCore

let device = MTLCreateSystemDefaultDevice()!

func library(_ path: String) throws -> MTLLibrary {
    let source = try String(contentsOfFile: path, encoding: .utf8)
    return try device.makeLibrary(source: source, options: nil)
}

let vertexLibrary = try library("shaders/MyShaders/Plasma.Vertex.msl")
let fragmentLibrary = try library("shaders/MyShaders/Plasma.Fragment.msl")
```

The vertex descriptor repeats the `location` numbers of the C# struct. The buffer has four floats per vertex, two for each attribute. Then the pipeline takes the two functions:

```swift
// [location(0)] vec2 Position and [location(1)] vec2 Uv, in one buffer.
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

Use the pixel format of your view or texture in `pixelFormat`. The `Clock` buffer goes to the fragment stage at index 0. A buffer of 16 bytes is enough, since `Seconds` is a single `float`:

```swift
let quad: [Float] = [
    -1, -1, 0, 0,    1, -1, 1, 0,   -1, 1, 0, 1,
    -1,  1, 0, 1,    1, -1, 1, 0,    1, 1, 1, 1,
]
let vertices = device.makeBuffer(bytes: quad, length: quad.count * 4, options: [])!
let clock = device.makeBuffer(length: 16, options: [])!
```

On each frame, write the time into the buffer and encode the draw:

```swift
let start = CACurrentMediaTime()   // once, before the first frame
// ...
var seconds = Float(CACurrentMediaTime() - start)
clock.contents().copyMemory(from: &seconds, byteCount: 4)

encoder.setRenderPipelineState(pipeline)
encoder.setVertexBuffer(vertices, offset: 0, index: 0)
encoder.setFragmentBuffer(clock, offset: 0, index: 0)
encoder.drawPrimitives(type: .triangle, vertexStart: 0, vertexCount: 6)
```

## Embed it with `add`

If your app is written in C#, with .NET for macOS or iOS, `add` writes the shaders into the project as methods and you can skip the files:

```bash
yotsuba add MyShaders/MyShaders.csproj --target msl
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
string vertexSource = plasma.ToMSL(Stage.Vertex);
string fragmentSource = plasma.ToMSL(Stage.Fragment);
```

Give each string to the device the way Swift gives `source` to `makeLibrary(source:options:)`; in .NET the method is `CreateLibrary`. The functions are still called `Vertex` and `Fragment`.

## Which command to use

Use `compile` when your app loads its assets from the bundle, or when you want to open the MSL and read it. Use `add` when the renderer is written in C# and you want the C# compiler to check the shader name. The options of both are in [The compile command](../reference/compile.md) and [The add command](../reference/add.md).

The same shader goes to the other graphics APIs by changing only the target: [OpenGL](opengl.md), [Direct3D](direct3d.md), [Vulkan](vulkan.md) and [WebGL](webgl.md).

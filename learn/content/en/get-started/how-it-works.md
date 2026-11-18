---
title: Other writing styles
summary: The same shaders can be written with the names of HLSL, GLSL, Metal, Vulkan or WGSL.
order: 19
---

Throughout the tutorial you wrote with GLSL names: `[gl_Position]`, `[location(0)]`, `vec4`. We chose them because they are the ones that show up most in shader tutorials. But if you or your team come from another language, you do not have to learn new names.

Yotsuba Shader comes with five "styles". Each one is a library with the same attributes, named the way they are named in a different shader language.

## The writing style is not the target

This is the most important thing on this page: the style you write with does **not** decide which graphics API the shader comes out for. You can write with HLSL names and compile to Metal, or write with GLSL names and compile to DirectX. You choose the target when compiling, as you saw in [the CLI](cli.md).

```text
C# in the style you prefer  →  compiler  →  SPIR-V · HLSL · GLSL · GLSL ES · Metal · C++
```

| Style | Library | The vertex position is marked with | Target required? |
| --- | --- | --- | --- |
| HLSL | `YotsubaShader.HlslSyntax` | `[SV_Position]` | No, any |
| GLSL | `YotsubaShader.GlslSyntax` | `[gl_Position]` | No, any |
| Metal | `YotsubaShader.MslSyntax` | `[position]` | No, any |
| Vulkan | `YotsubaShader.SpirvSyntax` | `[BuiltIn_Position]` | No, any |
| WGSL | `YotsubaShader.WgslSyntax` | `[@builtin_position]` | No, any |

> [!NOTE]
> WGSL-style *writing* is available. WGSL *output* is planned and not implemented yet.

## The same shader in five styles

This is a minimal shader, with only the Vertex stage. Use the tabs (or the style picker in the sidebar) to compare it in each style. Your choice is remembered across the whole site.

Notice that the only thing that changes from one tab to the next is the `using` and the name of two attributes. The rest is identical.

```csharp style=glsl
using YotsubaShader.Language;
using YotsubaShader.Language.Native.Types.Vector;
using YotsubaShader.GlslSyntax;

[Vector]
public struct Float4
{
    [VectorComponent(0)] public float X;
    [VectorComponent(1)] public float Y;
    [VectorComponent(2)] public float Z;
    [VectorComponent(3)] public float W;

    public Float4(float x, float y, float z, float w)
    {
        X = x;
        Y = y;
        Z = z;
        W = w;
    }
}

public struct VertexOutput
{
    [gl_Position] public Float4 Position;
}

public class Triangle
{
    [ShaderStage(Stage.Vertex)]
    public VertexOutput Vertex([gl_VertexIndex] uint vertexIndex)
    {
        VertexOutput output;
        output.Position = new Float4(0f, 0f, 0f, 1f);
        return output;
    }
}
```

```csharp style=hlsl
using YotsubaShader.Language;
using YotsubaShader.Language.Native.Types.Vector;
using YotsubaShader.HlslSyntax;

[Vector]
public struct Float4
{
    [VectorComponent(0)] public float X;
    [VectorComponent(1)] public float Y;
    [VectorComponent(2)] public float Z;
    [VectorComponent(3)] public float W;

    public Float4(float x, float y, float z, float w)
    {
        X = x;
        Y = y;
        Z = z;
        W = w;
    }
}

public struct VertexOutput
{
    [SV_Position] public Float4 Position;
}

public class Triangle
{
    [ShaderStage(Stage.Vertex)]
    public VertexOutput Vertex([gl_VertexIndex] uint vertexIndex)
    {
        VertexOutput output;
        output.Position = new Float4(0f, 0f, 0f, 1f);
        return output;
    }
}
```

```csharp style=msl
using YotsubaShader.Language;
using YotsubaShader.Language.Native.Types.Vector;
using YotsubaShader.MslSyntax;

[Vector]
public struct Float4
{
    [VectorComponent(0)] public float X;
    [VectorComponent(1)] public float Y;
    [VectorComponent(2)] public float Z;
    [VectorComponent(3)] public float W;

    public Float4(float x, float y, float z, float w)
    {
        X = x;
        Y = y;
        Z = z;
        W = w;
    }
}

public struct VertexOutput
{
    [position] public Float4 Position;
}

public class Triangle
{
    [ShaderStage(Stage.Vertex)]
    public VertexOutput Vertex([gl_VertexIndex] uint vertexIndex)
    {
        VertexOutput output;
        output.Position = new Float4(0f, 0f, 0f, 1f);
        return output;
    }
}
```

```csharp style=wgsl
using YotsubaShader.Language;
using YotsubaShader.Language.Native.Types.Vector;
using YotsubaShader.WgslSyntax;

[Vector]
public struct Float4
{
    [VectorComponent(0)] public float X;
    [VectorComponent(1)] public float Y;
    [VectorComponent(2)] public float Z;
    [VectorComponent(3)] public float W;

    public Float4(float x, float y, float z, float w)
    {
        X = x;
        Y = y;
        Z = z;
        W = w;
    }
}

public struct VertexOutput
{
    [builtin_position] public Float4 Position;
}

public class Triangle
{
    [ShaderStage(Stage.Vertex)]
    public VertexOutput Vertex([gl_VertexIndex] uint vertexIndex)
    {
        VertexOutput output;
        output.Position = new Float4(0f, 0f, 0f, 1f);
        return output;
    }
}
```

```csharp style=spirv
using YotsubaShader.Language;
using YotsubaShader.Language.Native.Types.Vector;
using YotsubaShader.SpirvSyntax;

[Vector]
public struct Float4
{
    [VectorComponent(0)] public float X;
    [VectorComponent(1)] public float Y;
    [VectorComponent(2)] public float Z;
    [VectorComponent(3)] public float W;

    public Float4(float x, float y, float z, float w)
    {
        X = x;
        Y = y;
        Z = z;
        W = w;
    }
}

public struct VertexOutput
{
    [BuiltIn_Position] public Float4 Position;
}

public class Triangle
{
    [ShaderStage(Stage.Vertex)]
    public VertexOutput Vertex([gl_VertexIndex] uint vertexIndex)
    {
        VertexOutput output;
        output.Position = new Float4(0f, 0f, 0f, 1f);
        return output;
    }
}
```

## Your own vectors

There is something in that example you had not seen: the `Float4` vector does not come from any library. It is declared right there.

A vector, for Yotsuba Shader, is any `struct` marked with `[Vector]`, where each field carries `[VectorComponent(n)]` with its position: `0` for the first, `1` for the second, and so on. It can have between 2 and 4 components, and they must all be of the same type (`float`, `int` or `uint`).

This lets you name your vectors however you like and give them the constructors you need. And since it is a type in your project, you can use it both in your shaders and in the rest of your program.

To use another style in your project, replace the reference to `YotsubaShader.GlslSyntax` with the one for the style you prefer, just as you did in [Set up your project](setup.md).

Next: [What now?](next-steps.md).

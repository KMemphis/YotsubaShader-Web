---
title: Otros estilos de escritura
summary: Los mismos shaders se pueden escribir con los nombres de HLSL, GLSL, Metal, Vulkan o WGSL.
order: 19
---

> [!SCENE] intro

En todo el tutorial escribiste con los nombres de GLSL: `[gl_Position]`, `[location(0)]`, `vec4`. Los elegimos porque son los que más aparecen en tutoriales de shaders. Pero si tú o tu equipo vienen de otro lenguaje, no tienen por qué aprender nombres nuevos.

Yotsuba Shader trae cinco "estilos". Cada uno es una librería con los mismos atributos, llamados como se llaman en un lenguaje de shaders distinto.

> [!SCENE] target

## El estilo de escritura no es el destino

Esto es lo más importante de esta página: el estilo con el que escribes **no** decide para qué API gráfica sale el shader. Puedes escribir con nombres de HLSL y compilar a Metal, o escribir con nombres de GLSL y compilar a DirectX. El destino lo eliges al compilar, como viste en [la CLI](cli.md).

```text
C# con el estilo que prefieras  →  compilador  →  SPIR-V · HLSL · GLSL · GLSL ES · Metal · C++
```

| Estilo | Librería | La posición del vértice se marca con | ¿Destino obligado? |
| --- | --- | --- | --- |
| HLSL | `YotsubaShader.HlslSyntax` | `[SV_Position]` | No, cualquiera |
| GLSL | `YotsubaShader.GlslSyntax` | `[gl_Position]` | No, cualquiera |
| Metal | `YotsubaShader.MslSyntax` | `[position]` | No, cualquiera |
| Vulkan | `YotsubaShader.SpirvSyntax` | `[BuiltIn_Position]` | No, cualquiera |
| WGSL | `YotsubaShader.WgslSyntax` | `[@builtin_position]` | No, cualquiera |

> [!NOTE]
> La *escritura* con estilo WGSL está disponible. La *salida* WGSL está planificada y todavía no está implementada.

> [!SCENE] five

## El mismo shader en cinco estilos

Este es un shader mínimo, con solo la etapa Vertex. Usa las pestañas (o el selector de estilo de la barra lateral) para compararlo en cada estilo. Tu elección se recuerda en todo el sitio.

Fíjate en que lo único que cambia de una pestaña a otra es el `using` y el nombre de dos atributos. El resto es idéntico.

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

> [!SCENE] vectors

## Tus propios vectores

En ese ejemplo hay algo que no habías visto: el vector `Float4` no viene de ninguna librería. Está declarado ahí mismo.

Un vector, para Yotsuba Shader, es cualquier `struct` marcado con `[Vector]`, donde cada campo lleva `[VectorComponent(n)]` con su posición: `0` para el primero, `1` para el segundo, y así. Puede tener entre 2 y 4 componentes, y todos deben ser del mismo tipo (`float`, `int` o `uint`).

Esto te deja llamar a tus vectores como quieras y ponerles los constructores que necesites. Y como es un tipo de tu proyecto, lo puedes usar tanto en tus shaders como en el resto de tu programa.

Para usar otro estilo en tu proyecto, cambia la referencia a `YotsubaShader.GlslSyntax` por la del estilo que prefieras, igual que hiciste en [Prepara tu proyecto](setup.md).

Siguiente: [¿Y ahora qué?](next-steps.md).

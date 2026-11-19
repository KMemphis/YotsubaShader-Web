---
title: Enlazar recursos
summary: Cómo llegan las entradas, salidas y recursos a la GPU.
order: 2
---

El contrato es el mismo en todos los formatos: los números que escribes en C# son los que usa tu renderer. Toma este shader (sintaxis GLSL):

```csharp
public struct Corner
{
    [location(0)] public vec2 Position;
    [location(1)] public vec2 Uv;
}

public class Sweep
{
    [uniform, layout(0, 0)]
    public Stopwatch Time;      // struct Stopwatch { public float Seconds; }

    [layout(0, 1)]
    public sampler2D Photo;

    [ShaderStage(Stage.Vertex)]
    public Pixel Vertex(Corner corner) { /* ... */ }

    [ShaderStage(Stage.Fragment)]
    [return: location(0)]
    public vec4 Fragment(PixelIn pixel) { /* ... */ }
}
```

## Entradas de vértice y salidas de stage

`[location(n)]` es la ranura de atributo del vertex buffer. En el GLSL compilado es el mismo número:

```glsl
layout(location = 0) in vec2 corner_Position;
layout(location = 1) in vec2 corner_Uv;
layout(location = 0) out vec2 _return_Uv;
```

La salida del vertex en `location(0)` es la entrada del fragment en `location(0)`. El valor del `[return: location(0)]` del fragment va al color target 0.

| Formato | Entrada de vértice `location(n)` | Salida de color `location(0)` |
| --- | --- | --- |
| SPIR-V, GLSL, GLSL ES | `layout(location = n)` | `layout(location = 0) out` |
| HLSL | `TEXCOORDn` | `SV_Target0` |
| MSL | `[[user(locnN)]]` | `[[color(0)]]` |

Crea tu layout de vértices con un elemento por `location`, del tipo que tiene el campo (`vec2` son dos floats, `vec4` son cuatro).

## Uniforms, texturas y buffers

`[layout(set, binding)]` coloca un recurso. Un struct `[uniform]` se vuelve un bloque uniforme con layout `std140`:

```glsl
layout(set = 0, binding = 0, std140) uniform Stopwatch
{
    float Seconds;
} Time;
```

| Recurso | GLSL / SPIR-V | HLSL | MSL |
| --- | --- | --- | --- |
| Struct uniform en `layout(0, 0)` | `set = 0, binding = 0` | `cbuffer … : register(b0)` | `constant … [[buffer(0)]]` |
| Textura `sampler2D` en `layout(0, 1)` | `set = 0, binding = 1` | `Texture2D … : register(t1)` y `SamplerState … : register(s1)` | `texture2d … [[texture(0)]]` y `sampler … [[sampler(0)]]` |

Cosas que debes saber al crear los recursos:

- En HLSL los miembros del struct uniform son constantes sueltas del `cbuffer`, con el nombre `<Campo>_<Miembro>` (`Time_Seconds`). El contenido del buffer son los mismos bytes que el struct de C#.
- En MSL los números de binding se renumeran por tipo: buffers, texturas y samplers cuentan cada uno desde 0 en orden.
- Una textura y su sampler van juntos. En GLSL son un solo `sampler2D`; en HLSL usan el mismo número de registro.

## Puntos de entrada

Cada método de stage es un punto de entrada con el nombre del método de C# (`Vertex`, `Fragment`). En GLSL el punto de entrada siempre es `main`, porque GLSL lo exige; en HLSL y MSL se conserva el nombre.

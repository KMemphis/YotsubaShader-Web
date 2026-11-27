---
title: "Validar para Direct3D"
summary: "Qué rechaza el analizador cuando un shader declara Direct3D, versión por versión, con el mensaje exacto de cada diagnóstico."
order: 23
---

Declara Direct3D con `[ShaderTargets]` y el analizador avisa de todo lo que el shader usa y esta API gráfica no tiene. Se declara así: `[ShaderTargets(Target.DirectX_80)]`.

```csharp
using YotsubaShader.Compiler.Metadata;

[ShaderTargets(Target.DirectX_12)]
public class MyShader { /* ... */ }
```

Versiones: `Target.DirectX_80`, `Target.DirectX_81`, `Target.DirectX_90`, `Target.DirectX_90c`, `Target.DirectX_10`, `Target.DirectX_11`, `Target.DirectX_12`.

> [!NOTE]
> Direct3D 8.0, Direct3D 8.1, Direct3D 9.0: Ningún backend de YotsubaShader genera estas versiones; el analizador las valida igualmente, así que puedes declararlas y compilar a otro lenguaje.

## Qué tiene cada versión

`✓` garantizada, `~` opcional (un aviso), `✗` no disponible (un error al declararla), `·` no modelada.

| | 8.0 | 8.1 | 9.0 | 9.0c | 10 | 11 | 12 |
| --- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `double` | ✗ | ✗ | ✗ | ✗ | ✗ | ~ | ~ |
| `half` | · | · | · | · | · | · | ~ |
| Enteros de 16 bits | · | · | · | · | · | · | ~ |
| Enteros de 64 bits | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ~ |
| Compute shaders | ✗ | ✗ | ✗ | ✗ | ~ | ✓ | ✓ |
| Storage buffers | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| Storage textures | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| Storage textures sin formato | · | · | · | · | · | ~ | ~ |
| `uint` | ✗ | ✗ | ~ | ~ | ✓ | ✓ | ✓ |
| Operadores de bits | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| Leer un texel (`Load`) | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| Gather | ✗ | ✗ | ✗ | ✗ | ~ | ✓ | ✓ |
| Offsets de textura | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| Consultar el tamaño de una textura | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| Derivadas y LOD implícito | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |

**Notas**

- `double`, Direct3D 8.0–10: HLSL solo tiene double desde Shader Model 5.0.
- `double`, Direct3D 11, Direct3D 12: opcional (D3D11_FEATURE_DOUBLES).
- `half`, Direct3D 12: necesita Shader Model 6.2 con -enable-16bit-types.
- Enteros de 16 bits, Direct3D 12: necesita Shader Model 6.2 con -enable-16bit-types.
- Enteros de 64 bits, Direct3D 8.0–11: HLSL solo tiene enteros de 64 bits desde Shader Model 6.0.
- Enteros de 64 bits, Direct3D 12: necesita Shader Model 6.0 y soporte de 64 bits en el hardware.
- Compute shaders, Direct3D 8.0–9.0c: los compute shaders llegan en Shader Model 4.0 (Direct3D 10).
- Compute shaders, Direct3D 10: cs_4_0 solo en hardware Direct3D 10 que lo soporte.
- Storage buffers, Direct3D 8.0–10: los buffers de lectura/escritura (UAV) llegan en Shader Model 5.0 (Direct3D 11).
- Storage textures, Direct3D 8.0–10: las texturas de lectura/escritura (UAV) llegan en Shader Model 5.0 (Direct3D 11).
- Storage textures sin formato, Direct3D 11, Direct3D 12: la carga de UAV tipados sin formato es opcional.
- `uint`, Direct3D 8.0, Direct3D 8.1: necesita Shader Model 4.0 (Direct3D 10).
- `uint`, Direct3D 9.0, Direct3D 9.0c: Shader Model 2/3 emula los enteros con floats.
- Operadores de bits, Direct3D 8.0, Direct3D 8.1: necesita Shader Model 4.0 (Direct3D 10).
- Operadores de bits, Direct3D 9.0, Direct3D 9.0c: las operaciones de bits necesitan Shader Model 4.0 (Direct3D 10).
- Leer un texel (`Load`), Direct3D 8.0–9.0c: necesita Shader Model 4.0 (Direct3D 10).
- Gather, Direct3D 8.0–9.0c: necesita Shader Model 4.0 (Direct3D 10).
- Gather, Direct3D 10: Gather4 necesita Shader Model 4.1 (Direct3D 10.1).
- Offsets de textura, Direct3D 8.0–9.0c: necesita Shader Model 4.0 (Direct3D 10).
- Consultar el tamaño de una textura, Direct3D 8.0–9.0c: necesita Shader Model 4.0 (Direct3D 10).
- Derivadas y LOD implícito, Direct3D 8.0, Direct3D 8.1: los pixel shaders 1.x no tienen derivadas (llegan en ps_2_0).

## Límites

Los límites que revisa el analizador. Un shader que se pasa de uno recibe un diagnóstico que nombra la versión.

| | 8.0 | 8.1 | 9.0 | 9.0c | 10 | 11 | 12 |
| --- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Render targets | · | · | · | 4 | 8 | 8 | 8 |
| Entradas de vértice | · | · | · | 16 | 16 | 32 | 32 |
| Variables entre etapas | · | · | · | · | 16 | 32 | 32 |
| Uniform buffer (bytes) | 128 | 128 | 512 | 3584 | 65536 | 65536 | 65536 |

## Qué pasa en cada caso

### `double`

```csharp
public class Example
{
    [ShaderStage(Stage.Fragment)]
    [return: SV_Target]
    public float4 FS()
    {
        double d = 1.0;
        return new float4((float)d);
    }
}
```

| Versión | Resultado |
| --- | --- |
| 8.0 | Error |
| 8.1 | Error |
| 9.0 | Error |
| 9.0c | Error |
| 10 | Error |
| 11 | Aviso |
| 12 | Aviso |

Versiones afectadas: Direct3D 8.0

```text
error YS0701: 'double' no está disponible en todas las APIs gráficas: Direct3D 8.0: HLSL solo
    tiene double desde Shader Model 5.0. Afecta a: Direct3D 8.0.
```

Versiones afectadas: Direct3D 8.1

```text
error YS0701: 'double' no está disponible en todas las APIs gráficas: Direct3D 8.1: HLSL solo
    tiene double desde Shader Model 5.0. Afecta a: Direct3D 8.1.
```

Versiones afectadas: Direct3D 9.0

```text
error YS0701: 'double' no está disponible en todas las APIs gráficas: Direct3D 9.0: HLSL solo
    tiene double desde Shader Model 5.0. Afecta a: Direct3D 9.0.
```

Versiones afectadas: Direct3D 9.0c

```text
error YS0701: 'double' no está disponible en todas las APIs gráficas: Direct3D 9.0c: HLSL solo
    tiene double desde Shader Model 5.0. Afecta a: Direct3D 9.0c.
```

Versiones afectadas: Direct3D 10

```text
error YS0701: 'double' no está disponible en todas las APIs gráficas: Direct3D 10: HLSL solo
    tiene double desde Shader Model 5.0. Afecta a: Direct3D 10.
```

Versiones afectadas: Direct3D 11

```text
warning YS0701: 'double' no está disponible en todas las APIs gráficas: Direct3D 11: opcional
    (D3D11_FEATURE_DOUBLES). Afecta a: Direct3D 11.
```

Versiones afectadas: Direct3D 12

```text
warning YS0701: 'double' no está disponible en todas las APIs gráficas: Direct3D 12: opcional
    (D3D11_FEATURE_DOUBLES). Afecta a: Direct3D 12.
```

### Un compute shader

```csharp
public class Example
{
    [ShaderStage(Stage.Compute)]
    [numthreads(8, 8, 1)]
    public void CS() { }
}
```

| Versión | Resultado |
| --- | --- |
| 8.0 | Error |
| 8.1 | Error |
| 9.0 | Error |
| 9.0c | Error |
| 10 | Aviso |
| 11, 12 | válido |

Versiones afectadas: Direct3D 8.0

```text
error YS0711: El compute shader 'CS' no está disponible en todas las APIs gráficas: Direct3D
    8.0: los compute shaders llegan en Shader Model 4.0 (Direct3D 10). Afecta a: Direct3D 8.0.
```

Versiones afectadas: Direct3D 8.1

```text
error YS0711: El compute shader 'CS' no está disponible en todas las APIs gráficas: Direct3D
    8.1: los compute shaders llegan en Shader Model 4.0 (Direct3D 10). Afecta a: Direct3D 8.1.
```

Versiones afectadas: Direct3D 9.0

```text
error YS0711: El compute shader 'CS' no está disponible en todas las APIs gráficas: Direct3D
    9.0: los compute shaders llegan en Shader Model 4.0 (Direct3D 10). Afecta a: Direct3D 9.0.
```

Versiones afectadas: Direct3D 9.0c

```text
error YS0711: El compute shader 'CS' no está disponible en todas las APIs gráficas: Direct3D
    9.0c: los compute shaders llegan en Shader Model 4.0 (Direct3D 10). Afecta a: Direct3D 9.0c.
```

Versiones afectadas: Direct3D 10

```text
warning YS0711: El compute shader 'CS' no está disponible en todas las APIs gráficas: Direct3D
    10: cs_4_0 solo en hardware Direct3D 10 que lo soporte. Afecta a: Direct3D 10.
```

### Un storage buffer

```csharp
public struct Item { public float Value; }

public class Example
{
    [register("u0")] public RWStructuredBuffer<Item> Items;

    [ShaderStage(Stage.Fragment)]
    [return: SV_Target]
    public float4 FS() => new float4(Items[0].Value);
}
```

| Versión | Resultado |
| --- | --- |
| 8.0 | Error |
| 8.1 | Error |
| 9.0 | Error |
| 9.0c | Error |
| 10 | Error |
| 11, 12 | válido |

Versiones afectadas: Direct3D 8.0

```text
error YS0711: El storage buffer 'Items' no está disponible en todas las APIs gráficas: Direct3D
    8.0: los buffers de lectura/escritura (UAV) llegan en Shader Model 5.0 (Direct3D 11). Afecta
    a: Direct3D 8.0.
```

Versiones afectadas: Direct3D 8.1

```text
error YS0711: El storage buffer 'Items' no está disponible en todas las APIs gráficas: Direct3D
    8.1: los buffers de lectura/escritura (UAV) llegan en Shader Model 5.0 (Direct3D 11). Afecta
    a: Direct3D 8.1.
```

Versiones afectadas: Direct3D 9.0

```text
error YS0711: El storage buffer 'Items' no está disponible en todas las APIs gráficas: Direct3D
    9.0: los buffers de lectura/escritura (UAV) llegan en Shader Model 5.0 (Direct3D 11). Afecta
    a: Direct3D 9.0.
```

Versiones afectadas: Direct3D 9.0c

```text
error YS0711: El storage buffer 'Items' no está disponible en todas las APIs gráficas: Direct3D
    9.0c: los buffers de lectura/escritura (UAV) llegan en Shader Model 5.0 (Direct3D 11).
    Afecta a: Direct3D 9.0c.
```

Versiones afectadas: Direct3D 10

```text
error YS0711: El storage buffer 'Items' no está disponible en todas las APIs gráficas: Direct3D
    10: los buffers de lectura/escritura (UAV) llegan en Shader Model 5.0 (Direct3D 11). Afecta
    a: Direct3D 10.
```

### Una storage texture

```csharp
public class Example
{
    [register("u0")] public RWTexture2D<float4> Image;

    [ShaderStage(Stage.Fragment)]
    [return: SV_Target]
    public float4 FS() => new float4(1f);
}
```

| Versión | Resultado |
| --- | --- |
| 8.0 | Error |
| 8.1 | Error |
| 9.0 | Error |
| 9.0c | Error |
| 10 | Error |
| 11 | Aviso |
| 12 | Aviso |

Versiones afectadas: Direct3D 8.0

```text
error YS0711: La textura de almacenamiento 'Image' no está disponible en todas las APIs
    gráficas: Direct3D 8.0: las texturas de lectura/escritura (UAV) llegan en Shader Model 5.0
    (Direct3D 11). Afecta a: Direct3D 8.0.
```

Versiones afectadas: Direct3D 8.1

```text
error YS0711: La textura de almacenamiento 'Image' no está disponible en todas las APIs
    gráficas: Direct3D 8.1: las texturas de lectura/escritura (UAV) llegan en Shader Model 5.0
    (Direct3D 11). Afecta a: Direct3D 8.1.
```

Versiones afectadas: Direct3D 9.0

```text
error YS0711: La textura de almacenamiento 'Image' no está disponible en todas las APIs
    gráficas: Direct3D 9.0: las texturas de lectura/escritura (UAV) llegan en Shader Model 5.0
    (Direct3D 11). Afecta a: Direct3D 9.0.
```

Versiones afectadas: Direct3D 9.0c

```text
error YS0711: La textura de almacenamiento 'Image' no está disponible en todas las APIs
    gráficas: Direct3D 9.0c: las texturas de lectura/escritura (UAV) llegan en Shader Model 5.0
    (Direct3D 11). Afecta a: Direct3D 9.0c.
```

Versiones afectadas: Direct3D 10

```text
error YS0711: La textura de almacenamiento 'Image' no está disponible en todas las APIs
    gráficas: Direct3D 10: las texturas de lectura/escritura (UAV) llegan en Shader Model 5.0
    (Direct3D 11). Afecta a: Direct3D 10.
```

Versiones afectadas: Direct3D 11

```text
warning YS0705: 'Image' es una textura de almacenamiento sin formato: Direct3D 11: la carga de
    UAV tipados sin formato es opcional. Afecta a: Direct3D 11.
```

Versiones afectadas: Direct3D 12

```text
warning YS0705: 'Image' es una textura de almacenamiento sin formato: Direct3D 12: la carga de
    UAV tipados sin formato es opcional. Afecta a: Direct3D 12.
```

### `uint`

```csharp
public class Example
{
    [ShaderStage(Stage.Fragment)]
    [return: SV_Target]
    public float4 FS()
    {
        uint count = 3u;
        uint twice = count * 2u;
        return new float4((float)twice);
    }
}
```

| Versión | Resultado |
| --- | --- |
| 8.0 | Error |
| 8.1 | Error |
| 9.0 | Aviso |
| 9.0c | Aviso |
| 10, 11, 12 | válido |

Versiones afectadas: Direct3D 8.0

```text
error YS0701: 'uint' no está disponible en todas las APIs gráficas: Direct3D 8.0: necesita
    Shader Model 4.0 (Direct3D 10). Afecta a: Direct3D 8.0.
```

Versiones afectadas: Direct3D 8.1

```text
error YS0701: 'uint' no está disponible en todas las APIs gráficas: Direct3D 8.1: necesita
    Shader Model 4.0 (Direct3D 10). Afecta a: Direct3D 8.1.
```

Versiones afectadas: Direct3D 9.0

```text
warning YS0701: 'uint' no está disponible en todas las APIs gráficas: Direct3D 9.0: Shader Model
    2/3 emula los enteros con floats. Afecta a: Direct3D 9.0.
```

Versiones afectadas: Direct3D 9.0c

```text
warning YS0701: 'uint' no está disponible en todas las APIs gráficas: Direct3D 9.0c: Shader
    Model 2/3 emula los enteros con floats. Afecta a: Direct3D 9.0c.
```

### Un operador de bits

```csharp
public class Example
{
    [ShaderStage(Stage.Fragment)]
    [return: SV_Target]
    public float4 FS()
    {
        int mask = 3;
        int shifted = mask << 2;
        return new float4((float)shifted);
    }
}
```

| Versión | Resultado |
| --- | --- |
| 8.0 | Error |
| 8.1 | Error |
| 9.0 | Error |
| 9.0c | Error |
| 10, 11, 12 | válido |

Versiones afectadas: Direct3D 8.0

```text
error YS0703: 'operador de bits' no está disponible en todas las APIs gráficas: Direct3D 8.0:
    necesita Shader Model 4.0 (Direct3D 10). Afecta a: Direct3D 8.0.
```

Versiones afectadas: Direct3D 8.1

```text
error YS0703: 'operador de bits' no está disponible en todas las APIs gráficas: Direct3D 8.1:
    necesita Shader Model 4.0 (Direct3D 10). Afecta a: Direct3D 8.1.
```

Versiones afectadas: Direct3D 9.0

```text
error YS0703: 'operador de bits' no está disponible en todas las APIs gráficas: Direct3D 9.0:
    las operaciones de bits necesitan Shader Model 4.0 (Direct3D 10). Afecta a: Direct3D 9.0.
```

Versiones afectadas: Direct3D 9.0c

```text
error YS0703: 'operador de bits' no está disponible en todas las APIs gráficas: Direct3D 9.0c:
    las operaciones de bits necesitan Shader Model 4.0 (Direct3D 10). Afecta a: Direct3D 9.0c.
```

### Leer un texel con `Load`

```csharp
public class Example
{
    [register("t0")] public Texture2D Tex;

    [ShaderStage(Stage.Fragment)]
    [return: SV_Target]
    public float4 FS() => Tex.Load(new int3(10, 20, 0));
}
```

| Versión | Resultado |
| --- | --- |
| 8.0 | Error |
| 8.1 | Error |
| 9.0 | Error |
| 9.0c | Error |
| 10, 11, 12 | válido |

Versiones afectadas: Direct3D 8.0

```text
error YS0703: 'Load' no está disponible en todas las APIs gráficas: Direct3D 8.0: necesita
    Shader Model 4.0 (Direct3D 10). Afecta a: Direct3D 8.0.
```

Versiones afectadas: Direct3D 8.1

```text
error YS0703: 'Load' no está disponible en todas las APIs gráficas: Direct3D 8.1: necesita
    Shader Model 4.0 (Direct3D 10). Afecta a: Direct3D 8.1.
```

Versiones afectadas: Direct3D 9.0

```text
error YS0703: 'Load' no está disponible en todas las APIs gráficas: Direct3D 9.0: necesita
    Shader Model 4.0 (Direct3D 10). Afecta a: Direct3D 9.0.
```

Versiones afectadas: Direct3D 9.0c

```text
error YS0703: 'Load' no está disponible en todas las APIs gráficas: Direct3D 9.0c: necesita
    Shader Model 4.0 (Direct3D 10). Afecta a: Direct3D 9.0c.
```

### Gather

```csharp
public class Example
{
    [register("t0")] public Texture2D Tex;
    [register("s0")] public SamplerState Smp;

    [ShaderStage(Stage.Fragment)]
    [return: SV_Target]
    public float4 FS() => Tex.Gather(Smp, new float2(0.5f, 0.5f));
}
```

| Versión | Resultado |
| --- | --- |
| 8.0 | Error |
| 8.1 | Error |
| 9.0 | Error |
| 9.0c | Error |
| 10 | Aviso |
| 11, 12 | válido |

Versiones afectadas: Direct3D 8.0

```text
error YS0703: 'Gather' no está disponible en todas las APIs gráficas: Direct3D 8.0: necesita
    Shader Model 4.0 (Direct3D 10). Afecta a: Direct3D 8.0.
```

Versiones afectadas: Direct3D 8.1

```text
error YS0703: 'Gather' no está disponible en todas las APIs gráficas: Direct3D 8.1: necesita
    Shader Model 4.0 (Direct3D 10). Afecta a: Direct3D 8.1.
```

Versiones afectadas: Direct3D 9.0

```text
error YS0703: 'Gather' no está disponible en todas las APIs gráficas: Direct3D 9.0: necesita
    Shader Model 4.0 (Direct3D 10). Afecta a: Direct3D 9.0.
```

Versiones afectadas: Direct3D 9.0c

```text
error YS0703: 'Gather' no está disponible en todas las APIs gráficas: Direct3D 9.0c: necesita
    Shader Model 4.0 (Direct3D 10). Afecta a: Direct3D 9.0c.
```

Versiones afectadas: Direct3D 10

```text
warning YS0703: 'Gather' no está disponible en todas las APIs gráficas: Direct3D 10: Gather4
    necesita Shader Model 4.1 (Direct3D 10.1). Afecta a: Direct3D 10.
```

### Un offset de textura

```csharp
public class Example
{
    [register("t0")] public Texture2D Tex;
    [register("s0")] public SamplerState Smp;

    [ShaderStage(Stage.Fragment)]
    [return: SV_Target]
    public float4 FS([TEXCOORD(0)] float2 uv) => Tex.Sample(Smp, uv, new int2(1, 1));
}
```

| Versión | Resultado |
| --- | --- |
| 8.0 | Error |
| 8.1 | Error |
| 9.0 | Error |
| 9.0c | Error |
| 10, 11, 12 | válido |

Versiones afectadas: Direct3D 8.0

```text
error YS0703: 'Sample' no está disponible en todas las APIs gráficas: Direct3D 8.0: los pixel
    shaders 1.x no tienen derivadas (llegan en ps_2_0). Afecta a: Direct3D 8.0.
error YS0703: 'Sample' no está disponible en todas las APIs gráficas: Direct3D 8.0: necesita
    Shader Model 4.0 (Direct3D 10). Afecta a: Direct3D 8.0.
```

Versiones afectadas: Direct3D 8.1

```text
error YS0703: 'Sample' no está disponible en todas las APIs gráficas: Direct3D 8.1: los pixel
    shaders 1.x no tienen derivadas (llegan en ps_2_0). Afecta a: Direct3D 8.1.
error YS0703: 'Sample' no está disponible en todas las APIs gráficas: Direct3D 8.1: necesita
    Shader Model 4.0 (Direct3D 10). Afecta a: Direct3D 8.1.
```

Versiones afectadas: Direct3D 9.0

```text
error YS0703: 'Sample' no está disponible en todas las APIs gráficas: Direct3D 9.0: necesita
    Shader Model 4.0 (Direct3D 10). Afecta a: Direct3D 9.0.
```

Versiones afectadas: Direct3D 9.0c

```text
error YS0703: 'Sample' no está disponible en todas las APIs gráficas: Direct3D 9.0c: necesita
    Shader Model 4.0 (Direct3D 10). Afecta a: Direct3D 9.0c.
```

### Preguntar el tamaño de una textura

```csharp
public class Example
{
    [register("t0")] public Texture2D Tex;

    [ShaderStage(Stage.Fragment)]
    [return: SV_Target]
    public float4 FS()
    {
        uint width, height;
        Tex.GetDimensions(out width, out height);
        return new float4((float)width, (float)height, 0f, 1f);
    }
}
```

| Versión | Resultado |
| --- | --- |
| 8.0 | Error |
| 8.1 | Error |
| 9.0 | Aviso, Error |
| 9.0c | Aviso, Error |
| 10, 11, 12 | válido |

Versiones afectadas: Direct3D 8.0

```text
error YS0701: 'uint' no está disponible en todas las APIs gráficas: Direct3D 8.0: necesita
    Shader Model 4.0 (Direct3D 10). Afecta a: Direct3D 8.0.
error YS0703: 'GetDimensions' no está disponible en todas las APIs gráficas: Direct3D 8.0:
    necesita Shader Model 4.0 (Direct3D 10). Afecta a: Direct3D 8.0.
```

Versiones afectadas: Direct3D 8.1

```text
error YS0701: 'uint' no está disponible en todas las APIs gráficas: Direct3D 8.1: necesita
    Shader Model 4.0 (Direct3D 10). Afecta a: Direct3D 8.1.
error YS0703: 'GetDimensions' no está disponible en todas las APIs gráficas: Direct3D 8.1:
    necesita Shader Model 4.0 (Direct3D 10). Afecta a: Direct3D 8.1.
```

Versiones afectadas: Direct3D 9.0

```text
warning YS0701: 'uint' no está disponible en todas las APIs gráficas: Direct3D 9.0: Shader Model
    2/3 emula los enteros con floats. Afecta a: Direct3D 9.0.
error YS0703: 'GetDimensions' no está disponible en todas las APIs gráficas: Direct3D 9.0:
    necesita Shader Model 4.0 (Direct3D 10). Afecta a: Direct3D 9.0.
```

Versiones afectadas: Direct3D 9.0c

```text
warning YS0701: 'uint' no está disponible en todas las APIs gráficas: Direct3D 9.0c: Shader
    Model 2/3 emula los enteros con floats. Afecta a: Direct3D 9.0c.
error YS0703: 'GetDimensions' no está disponible en todas las APIs gráficas: Direct3D 9.0c:
    necesita Shader Model 4.0 (Direct3D 10). Afecta a: Direct3D 9.0c.
```

### Una derivada de pantalla

```csharp
public class Example
{
    [ShaderStage(Stage.Fragment)]
    [return: SV_Target]
    public float4 FS([TEXCOORD(0)] float x) => new float4(Intrinsic.ddx(x));
}
```

| Versión | Resultado |
| --- | --- |
| 8.0 | Error |
| 8.1 | Error |
| 9.0, 9.0c, 10, 11, 12 | válido |

Versiones afectadas: Direct3D 8.0

```text
error YS0703: 'ddx' no está disponible en todas las APIs gráficas: Direct3D 8.0: los pixel
    shaders 1.x no tienen derivadas (llegan en ps_2_0). Afecta a: Direct3D 8.0.
```

Versiones afectadas: Direct3D 8.1

```text
error YS0703: 'ddx' no está disponible en todas las APIs gráficas: Direct3D 8.1: los pixel
    shaders 1.x no tienen derivadas (llegan en ps_2_0). Afecta a: Direct3D 8.1.
```

### Un uniform buffer grande

```csharp
public struct Palette
{
    [ArrayLength(1100)] public float4[] Colors;   // 17 600 bytes
}

public class Example
{
    [register("b0")] public ConstantBuffer<Palette> Data;

    [ShaderStage(Stage.Fragment)]
    [return: SV_Target]
    public float4 FS() => Data.Value.Colors[0];
}
```

| Versión | Resultado |
| --- | --- |
| 8.0 | Error |
| 8.1 | Error |
| 9.0 | Error |
| 9.0c | Error |
| 10, 11, 12 | válido |

Versiones afectadas: Direct3D 8.0

```text
error YS0713: El uniform buffer 'Data' ocupa 17600 bytes (std140), más de lo que garantiza
    Direct3D 8.0 (128 bytes). Afecta a: Direct3D 8.0.
```

Versiones afectadas: Direct3D 8.1

```text
error YS0713: El uniform buffer 'Data' ocupa 17600 bytes (std140), más de lo que garantiza
    Direct3D 8.1 (128 bytes). Afecta a: Direct3D 8.1.
```

Versiones afectadas: Direct3D 9.0

```text
error YS0713: El uniform buffer 'Data' ocupa 17600 bytes (std140), más de lo que garantiza
    Direct3D 9.0 (512 bytes). Afecta a: Direct3D 9.0.
```

Versiones afectadas: Direct3D 9.0c

```text
error YS0713: El uniform buffer 'Data' ocupa 17600 bytes (std140), más de lo que garantiza
    Direct3D 9.0c (3584 bytes). Afecta a: Direct3D 9.0c.
```

### Un grupo de compute grande

```csharp
public class Example
{
    [ShaderStage(Stage.Compute)]
    [numthreads(256, 1, 1)]   // 256 invocations
    public void CS() { }
}
```

| Versión | Resultado |
| --- | --- |
| 8.0 | Error |
| 8.1 | Error |
| 9.0 | Error |
| 9.0c | Error |
| 10 | Aviso |
| 11, 12 | válido |

Versiones afectadas: Direct3D 8.0

```text
error YS0711: El compute shader 'CS' no está disponible en todas las APIs gráficas: Direct3D
    8.0: los compute shaders llegan en Shader Model 4.0 (Direct3D 10). Afecta a: Direct3D 8.0.
```

Versiones afectadas: Direct3D 8.1

```text
error YS0711: El compute shader 'CS' no está disponible en todas las APIs gráficas: Direct3D
    8.1: los compute shaders llegan en Shader Model 4.0 (Direct3D 10). Afecta a: Direct3D 8.1.
```

Versiones afectadas: Direct3D 9.0

```text
error YS0711: El compute shader 'CS' no está disponible en todas las APIs gráficas: Direct3D
    9.0: los compute shaders llegan en Shader Model 4.0 (Direct3D 10). Afecta a: Direct3D 9.0.
```

Versiones afectadas: Direct3D 9.0c

```text
error YS0711: El compute shader 'CS' no está disponible en todas las APIs gráficas: Direct3D
    9.0c: los compute shaders llegan en Shader Model 4.0 (Direct3D 10). Afecta a: Direct3D 9.0c.
```

Versiones afectadas: Direct3D 10

```text
warning YS0711: El compute shader 'CS' no está disponible en todas las APIs gráficas: Direct3D
    10: cs_4_0 solo en hardware Direct3D 10 que lo soporte. Afecta a: Direct3D 10.
```

Los ids de los diagnósticos se describen en [Diagnósticos](diagnostics.md).

---
title: "Validar para OpenGL ES"
summary: "Qué rechaza el analizador cuando un shader declara OpenGL ES, versión por versión, con el mensaje exacto de cada diagnóstico."
order: 22
---

Declara OpenGL ES con `[ShaderTargets]` y el analizador avisa de todo lo que el shader usa y esta API gráfica no tiene. Se declara así: `[ShaderTargets(Target.OpenGLES_20)]`.

```csharp
using YotsubaShader.Compiler.Metadata;

[ShaderTargets(Target.OpenGLES_32)]
public class MyShader { /* ... */ }
```

Versiones: `Target.OpenGLES_20`, `Target.OpenGLES_30`, `Target.OpenGLES_31`, `Target.OpenGLES_32`.

## Qué tiene cada versión

`✓` garantizada, `~` opcional (un aviso), `✗` no disponible (un error al declararla), `·` no modelada.

| | 2.0 | 3.0 | 3.1 | 3.2 |
| --- | :---: | :---: | :---: | :---: |
| `double` | ✗ | ✗ | ✗ | ✗ |
| `half` | ~ | ~ | ~ | ~ |
| Enteros de 16 bits | ~ | ~ | ~ | ~ |
| Enteros de 64 bits | ~ | ~ | ~ | ~ |
| Compute shaders | ✗ | ✗ | ✓ | ✓ |
| Storage buffers | ✗ | ✗ | ✓ | ✓ |
| Storage textures | ✗ | ✗ | ✓ | ✓ |
| Storage textures sin formato | ✗ | ✗ | ✗ | ✗ |
| `uint` | ~ | ✓ | ✓ | ✓ |
| Operadores de bits | ✗ | ✓ | ✓ | ✓ |
| Leer un texel (`Load`) | ✗ | ✓ | ✓ | ✓ |
| Gather | ✗ | ✗ | ✓ | ✓ |
| Offsets de textura | ✗ | ✓ | ✓ | ✓ |
| Consultar el tamaño de una textura | ✗ | ✓ | ✓ | ✓ |
| Derivadas y LOD implícito | ~ | ✓ | ✓ | ✓ |

**Notas**

- `double`, OpenGL ES 2.0–3.2: OpenGL ES no tiene double.
- `half`, OpenGL ES 2.0–3.2: necesita una extensión.
- Enteros de 16 bits, OpenGL ES 2.0–3.2: necesita una extensión.
- Enteros de 64 bits, OpenGL ES 2.0–3.2: necesita una extensión.
- Compute shaders, OpenGL ES 2.0, OpenGL ES 3.0: los compute shaders llegan en OpenGL ES 3.1.
- Storage buffers, OpenGL ES 2.0, OpenGL ES 3.0: los storage buffers llegan en OpenGL ES 3.1.
- Storage textures, OpenGL ES 2.0, OpenGL ES 3.0: las imágenes (load/store) llegan en OpenGL ES 3.1.
- Storage textures sin formato, OpenGL ES 2.0–3.2: GLSL ES exige el formato de la imagen.
- `uint`, OpenGL ES 2.0: GLSL ES 1.00 no tiene uint; el shader generado lo emula con int.
- Operadores de bits, OpenGL ES 2.0: necesita GLSL ES 3.00 (OpenGL ES 3.0).
- Leer un texel (`Load`), OpenGL ES 2.0: necesita GLSL ES 3.00 (OpenGL ES 3.0).
- Gather, OpenGL ES 2.0, OpenGL ES 3.0: textureGather llega en OpenGL ES 3.1.
- Offsets de textura, OpenGL ES 2.0: necesita GLSL ES 3.00 (OpenGL ES 3.0).
- Consultar el tamaño de una textura, OpenGL ES 2.0: necesita GLSL ES 3.00 (OpenGL ES 3.0).
- Derivadas y LOD implícito, OpenGL ES 2.0: necesita OES_standard_derivatives.

## Límites

Los límites que revisa el analizador. Un shader que se pasa de uno recibe un diagnóstico que nombra la versión.

| | 2.0 | 3.0 | 3.1 | 3.2 |
| --- | :---: | :---: | :---: | :---: |
| Render targets | 1 | 4 | 4 | 4 |
| Entradas de vértice | 8 | 16 | 16 | 16 |
| Variables entre etapas | 8 | 15 | 15 | 15 |
| Uniform buffer (bytes) | · | 16384 | 16384 | 16384 |
| Grupo de compute (invocaciones) | · | · | 128 | 128 |

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
| 2.0 | Error |
| 3.0 | Error |
| 3.1 | Error |
| 3.2 | Error |

Versiones afectadas: OpenGL ES 2.0

```text
error YS0701: 'double' no está disponible en todas las APIs gráficas: OpenGL ES 2.0: OpenGL ES
    no tiene double. Afecta a: OpenGL ES 2.0.
```

Versiones afectadas: OpenGL ES 3.0

```text
error YS0701: 'double' no está disponible en todas las APIs gráficas: OpenGL ES 3.0: OpenGL ES
    no tiene double. Afecta a: OpenGL ES 3.0.
```

Versiones afectadas: OpenGL ES 3.1

```text
error YS0701: 'double' no está disponible en todas las APIs gráficas: OpenGL ES 3.1: OpenGL ES
    no tiene double. Afecta a: OpenGL ES 3.1.
```

Versiones afectadas: OpenGL ES 3.2

```text
error YS0701: 'double' no está disponible en todas las APIs gráficas: OpenGL ES 3.2: OpenGL ES
    no tiene double. Afecta a: OpenGL ES 3.2.
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
| 2.0 | Error |
| 3.0 | Error |
| 3.1, 3.2 | válido |

Versiones afectadas: OpenGL ES 2.0

```text
error YS0711: El compute shader 'CS' no está disponible en todas las APIs gráficas: OpenGL ES
    2.0: los compute shaders llegan en OpenGL ES 3.1. Afecta a: OpenGL ES 2.0.
```

Versiones afectadas: OpenGL ES 3.0

```text
error YS0711: El compute shader 'CS' no está disponible en todas las APIs gráficas: OpenGL ES
    3.0: los compute shaders llegan en OpenGL ES 3.1. Afecta a: OpenGL ES 3.0.
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
| 2.0 | Error |
| 3.0 | Error |
| 3.1, 3.2 | válido |

Versiones afectadas: OpenGL ES 2.0

```text
error YS0711: El storage buffer 'Items' no está disponible en todas las APIs gráficas: OpenGL ES
    2.0: los storage buffers llegan en OpenGL ES 3.1. Afecta a: OpenGL ES 2.0.
```

Versiones afectadas: OpenGL ES 3.0

```text
error YS0711: El storage buffer 'Items' no está disponible en todas las APIs gráficas: OpenGL ES
    3.0: los storage buffers llegan en OpenGL ES 3.1. Afecta a: OpenGL ES 3.0.
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
| 2.0 | Error |
| 3.0 | Error |
| 3.1 | Error |
| 3.2 | Error |

Versiones afectadas: OpenGL ES 2.0

```text
error YS0711: La textura de almacenamiento 'Image' no está disponible en todas las APIs
    gráficas: OpenGL ES 2.0: las imágenes (load/store) llegan en OpenGL ES 3.1. Afecta a: OpenGL
    ES 2.0.
error YS0705: 'Image' es una textura de almacenamiento sin formato: OpenGL ES 2.0: GLSL ES exige
    el formato de la imagen. Afecta a: OpenGL ES 2.0.
```

Versiones afectadas: OpenGL ES 3.0

```text
error YS0711: La textura de almacenamiento 'Image' no está disponible en todas las APIs
    gráficas: OpenGL ES 3.0: las imágenes (load/store) llegan en OpenGL ES 3.1. Afecta a: OpenGL
    ES 3.0.
error YS0705: 'Image' es una textura de almacenamiento sin formato: OpenGL ES 3.0: GLSL ES exige
    el formato de la imagen. Afecta a: OpenGL ES 3.0.
```

Versiones afectadas: OpenGL ES 3.1

```text
error YS0705: 'Image' es una textura de almacenamiento sin formato: OpenGL ES 3.1: GLSL ES exige
    el formato de la imagen. Afecta a: OpenGL ES 3.1.
```

Versiones afectadas: OpenGL ES 3.2

```text
error YS0705: 'Image' es una textura de almacenamiento sin formato: OpenGL ES 3.2: GLSL ES exige
    el formato de la imagen. Afecta a: OpenGL ES 3.2.
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
| 2.0 | Aviso |
| 3.0, 3.1, 3.2 | válido |

Versiones afectadas: OpenGL ES 2.0

```text
warning YS0701: 'uint' no está disponible en todas las APIs gráficas: OpenGL ES 2.0: GLSL ES
    1.00 no tiene uint; el shader generado lo emula con int. Afecta a: OpenGL ES 2.0.
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
| 2.0 | Error |
| 3.0, 3.1, 3.2 | válido |

Versiones afectadas: OpenGL ES 2.0

```text
error YS0703: 'operador de bits' no está disponible en todas las APIs gráficas: OpenGL ES 2.0:
    necesita GLSL ES 3.00 (OpenGL ES 3.0). Afecta a: OpenGL ES 2.0.
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
| 2.0 | Error |
| 3.0, 3.1, 3.2 | válido |

Versiones afectadas: OpenGL ES 2.0

```text
error YS0703: 'Load' no está disponible en todas las APIs gráficas: OpenGL ES 2.0: necesita GLSL
    ES 3.00 (OpenGL ES 3.0). Afecta a: OpenGL ES 2.0.
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
| 2.0 | Error |
| 3.0 | Error |
| 3.1, 3.2 | válido |

Versiones afectadas: OpenGL ES 2.0

```text
error YS0703: 'Gather' no está disponible en todas las APIs gráficas: OpenGL ES 2.0:
    textureGather llega en OpenGL ES 3.1. Afecta a: OpenGL ES 2.0.
```

Versiones afectadas: OpenGL ES 3.0

```text
error YS0703: 'Gather' no está disponible en todas las APIs gráficas: OpenGL ES 3.0:
    textureGather llega en OpenGL ES 3.1. Afecta a: OpenGL ES 3.0.
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
| 2.0 | Aviso, Error |
| 3.0, 3.1, 3.2 | válido |

Versiones afectadas: OpenGL ES 2.0

```text
warning YS0703: 'Sample' no está disponible en todas las APIs gráficas: OpenGL ES 2.0: necesita
    OES_standard_derivatives. Afecta a: OpenGL ES 2.0.
error YS0703: 'Sample' no está disponible en todas las APIs gráficas: OpenGL ES 2.0: necesita
    GLSL ES 3.00 (OpenGL ES 3.0). Afecta a: OpenGL ES 2.0.
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
| 2.0 | Aviso, Error |
| 3.0, 3.1, 3.2 | válido |

Versiones afectadas: OpenGL ES 2.0

```text
warning YS0701: 'uint' no está disponible en todas las APIs gráficas: OpenGL ES 2.0: GLSL ES
    1.00 no tiene uint; el shader generado lo emula con int. Afecta a: OpenGL ES 2.0.
error YS0703: 'GetDimensions' no está disponible en todas las APIs gráficas: OpenGL ES 2.0:
    necesita GLSL ES 3.00 (OpenGL ES 3.0). Afecta a: OpenGL ES 2.0.
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
| 2.0 | Aviso |
| 3.0, 3.1, 3.2 | válido |

Versiones afectadas: OpenGL ES 2.0

```text
warning YS0703: 'ddx' no está disponible en todas las APIs gráficas: OpenGL ES 2.0: necesita
    OES_standard_derivatives. Afecta a: OpenGL ES 2.0.
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
| 2.0 | válido |
| 3.0 | Error |
| 3.1 | Error |
| 3.2 | Error |

Versiones afectadas: OpenGL ES 3.0

```text
error YS0713: El uniform buffer 'Data' ocupa 17600 bytes (std140), más de lo que garantiza
    OpenGL ES 3.0 (16384 bytes). Afecta a: OpenGL ES 3.0.
```

Versiones afectadas: OpenGL ES 3.1

```text
error YS0713: El uniform buffer 'Data' ocupa 17600 bytes (std140), más de lo que garantiza
    OpenGL ES 3.1 (16384 bytes). Afecta a: OpenGL ES 3.1.
```

Versiones afectadas: OpenGL ES 3.2

```text
error YS0713: El uniform buffer 'Data' ocupa 17600 bytes (std140), más de lo que garantiza
    OpenGL ES 3.2 (16384 bytes). Afecta a: OpenGL ES 3.2.
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
| 2.0 | Error |
| 3.0 | Error |
| 3.1 | Aviso |
| 3.2 | Aviso |

Versiones afectadas: OpenGL ES 2.0

```text
error YS0711: El compute shader 'CS' no está disponible en todas las APIs gráficas: OpenGL ES
    2.0: los compute shaders llegan en OpenGL ES 3.1. Afecta a: OpenGL ES 2.0.
```

Versiones afectadas: OpenGL ES 3.0

```text
error YS0711: El compute shader 'CS' no está disponible en todas las APIs gráficas: OpenGL ES
    3.0: los compute shaders llegan en OpenGL ES 3.1. Afecta a: OpenGL ES 3.0.
```

Versiones afectadas: OpenGL ES 3.1

```text
warning YS0704: El grupo de 256x1x1 (256 invocaciones) supera lo que garantizan OpenGL ES 3.1
    (128 invocaciones, 128x128x64). Afecta a: OpenGL ES 3.1.
```

Versiones afectadas: OpenGL ES 3.2

```text
warning YS0704: El grupo de 256x1x1 (256 invocaciones) supera lo que garantizan OpenGL ES 3.2
    (128 invocaciones, 128x128x64). Afecta a: OpenGL ES 3.2.
```

Los ids de los diagnósticos se describen en [Diagnósticos](diagnostics.md).

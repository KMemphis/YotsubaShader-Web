---
title: "Validar para OpenGL"
summary: "Qué rechaza el analizador cuando un shader declara OpenGL, versión por versión, con el mensaje exacto de cada diagnóstico."
order: 21
---

Declara OpenGL con `[ShaderTargets]` y el analizador avisa de todo lo que el shader usa y esta API gráfica no tiene. Se declara así: `[ShaderTargets(Target.OpenGL_20)]`.

```csharp
using YotsubaShader.Compiler.Metadata;

[ShaderTargets(Target.OpenGL_46)]
public class MyShader { /* ... */ }
```

Versiones: `Target.OpenGL_20`, `Target.OpenGL_30`, `Target.OpenGL_31`, `Target.OpenGL_32`, `Target.OpenGL_33`, `Target.OpenGL_40`, `Target.OpenGL_41`, `Target.OpenGL_42`, `Target.OpenGL_43`, `Target.OpenGL_44`, `Target.OpenGL_45`, `Target.OpenGL_46`.

## Qué tiene cada versión

`✓` garantizada, `~` opcional (un aviso), `✗` no disponible (un error al declararla), `·` no modelada.

| | 2.0 | 3.0 | 3.1 | 3.2 | 3.3 | 4.0 | 4.1 | 4.2 | 4.3 | 4.4 | 4.5 | 4.6 |
| --- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `double` | ✗ | ✗ | ✗ | ~ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `half` | ~ | ~ | ~ | ~ | ~ | ~ | ~ | ~ | ~ | ~ | ~ | ~ |
| Enteros de 16 bits | ~ | ~ | ~ | ~ | ~ | ~ | ~ | ~ | ~ | ~ | ~ | ~ |
| Enteros de 64 bits | ~ | ~ | ~ | ~ | ~ | ~ | ~ | ~ | ~ | ~ | ~ | ~ |
| Compute shaders | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ~ | ✓ | ✓ | ✓ | ✓ |
| Storage buffers | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ |
| Storage textures | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Storage textures sin formato | ~ | ~ | ~ | ~ | ~ | ~ | ~ | ~ | ~ | ~ | ~ | ~ |
| `uint` | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Operadores de bits | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Leer un texel (`Load`) | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Gather | ✗ | ~ | ~ | ~ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Offsets de textura | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Consultar el tamaño de una textura | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Derivadas y LOD implícito | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

**Notas**

- `double`, OpenGL 2.0–3.1: no existe antes de OpenGL 4.0.
- `double`, OpenGL 3.2, OpenGL 3.3: necesita ARB_gpu_shader_fp64 (la ofrece la mayoría de drivers, no macOS).
- `half`, OpenGL 2.0–4.6: necesita una extensión (EXT_shader_explicit_arithmetic_types).
- Enteros de 16 bits, OpenGL 2.0–4.6: necesita una extensión (EXT_shader_explicit_arithmetic_types).
- Enteros de 64 bits, OpenGL 2.0–4.6: necesita ARB_gpu_shader_int64.
- Compute shaders, OpenGL 2.0–4.1: los compute shaders llegan en OpenGL 4.3.
- Compute shaders, OpenGL 4.2: necesita ARB_compute_shader (la ofrece la mayoría de drivers de 4.2, no macOS).
- Storage buffers, OpenGL 2.0–4.2: los storage buffers llegan en OpenGL 4.3.
- Storage textures, OpenGL 2.0–4.1: las imágenes (load/store) llegan en OpenGL 4.2.
- Storage textures sin formato, OpenGL 2.0–4.6: necesita EXT_shader_image_load_formatted.
- `uint`, OpenGL 2.0: necesita GLSL 1.30 (OpenGL 3.0).
- Operadores de bits, OpenGL 2.0: necesita GLSL 1.30 (OpenGL 3.0).
- Leer un texel (`Load`), OpenGL 2.0: necesita GLSL 1.30 (OpenGL 3.0).
- Gather, OpenGL 2.0: necesita GLSL 1.30 (OpenGL 3.0).
- Gather, OpenGL 3.0–3.3: necesita ARB_texture_gather.
- Offsets de textura, OpenGL 2.0: necesita GLSL 1.30 (OpenGL 3.0).
- Consultar el tamaño de una textura, OpenGL 2.0: necesita GLSL 1.30 (OpenGL 3.0).

## Límites

Los límites que revisa el analizador. Un shader que se pasa de uno recibe un diagnóstico que nombra la versión.

| | 2.0 | 3.0 | 3.1 | 3.2 | 3.3 | 4.0 | 4.1 | 4.2 | 4.3 | 4.4 | 4.5 | 4.6 |
| --- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Uniform buffer (bytes) | · | · | 16384 | 16384 | 16384 | 16384 | 16384 | 16384 | 16384 | 16384 | 16384 | 16384 |

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
| 3.2 | Aviso |
| 3.3 | Aviso |
| 4.0, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6 | válido |

Versiones afectadas: OpenGL 2.0

```text
error YS0701: 'double' no está disponible en todas las APIs gráficas: OpenGL 2.0: no existe
    antes de OpenGL 4.0. Afecta a: OpenGL 2.0.
```

Versiones afectadas: OpenGL 3.0

```text
error YS0701: 'double' no está disponible en todas las APIs gráficas: OpenGL 3.0: no existe
    antes de OpenGL 4.0. Afecta a: OpenGL 3.0.
```

Versiones afectadas: OpenGL 3.1

```text
error YS0701: 'double' no está disponible en todas las APIs gráficas: OpenGL 3.1: no existe
    antes de OpenGL 4.0. Afecta a: OpenGL 3.1.
```

Versiones afectadas: OpenGL 3.2

```text
warning YS0701: 'double' no está disponible en todas las APIs gráficas: OpenGL 3.2: necesita
    ARB_gpu_shader_fp64 (la ofrece la mayoría de drivers, no macOS). Afecta a: OpenGL 3.2.
```

Versiones afectadas: OpenGL 3.3

```text
warning YS0701: 'double' no está disponible en todas las APIs gráficas: OpenGL 3.3: necesita
    ARB_gpu_shader_fp64 (la ofrece la mayoría de drivers, no macOS). Afecta a: OpenGL 3.3.
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
| 3.1 | Error |
| 3.2 | Error |
| 3.3 | Error |
| 4.0 | Error |
| 4.1 | Error |
| 4.2 | Aviso |
| 4.3, 4.4, 4.5, 4.6 | válido |

Versiones afectadas: OpenGL 2.0

```text
error YS0711: El compute shader 'CS' no está disponible en todas las APIs gráficas: OpenGL 2.0:
    los compute shaders llegan en OpenGL 4.3. Afecta a: OpenGL 2.0.
```

Versiones afectadas: OpenGL 3.0

```text
error YS0711: El compute shader 'CS' no está disponible en todas las APIs gráficas: OpenGL 3.0:
    los compute shaders llegan en OpenGL 4.3. Afecta a: OpenGL 3.0.
```

Versiones afectadas: OpenGL 3.1

```text
error YS0711: El compute shader 'CS' no está disponible en todas las APIs gráficas: OpenGL 3.1:
    los compute shaders llegan en OpenGL 4.3. Afecta a: OpenGL 3.1.
```

Versiones afectadas: OpenGL 3.2

```text
error YS0711: El compute shader 'CS' no está disponible en todas las APIs gráficas: OpenGL 3.2:
    los compute shaders llegan en OpenGL 4.3. Afecta a: OpenGL 3.2.
```

Versiones afectadas: OpenGL 3.3

```text
error YS0711: El compute shader 'CS' no está disponible en todas las APIs gráficas: OpenGL 3.3:
    los compute shaders llegan en OpenGL 4.3. Afecta a: OpenGL 3.3.
```

Versiones afectadas: OpenGL 4.0

```text
error YS0711: El compute shader 'CS' no está disponible en todas las APIs gráficas: OpenGL 4.0:
    los compute shaders llegan en OpenGL 4.3. Afecta a: OpenGL 4.0.
```

Versiones afectadas: OpenGL 4.1

```text
error YS0711: El compute shader 'CS' no está disponible en todas las APIs gráficas: OpenGL 4.1:
    los compute shaders llegan en OpenGL 4.3. Afecta a: OpenGL 4.1.
```

Versiones afectadas: OpenGL 4.2

```text
warning YS0711: El compute shader 'CS' no está disponible en todas las APIs gráficas: OpenGL
    4.2: necesita ARB_compute_shader (la ofrece la mayoría de drivers de 4.2, no macOS). Afecta
    a: OpenGL 4.2.
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
| 3.1 | Error |
| 3.2 | Error |
| 3.3 | Error |
| 4.0 | Error |
| 4.1 | Error |
| 4.2 | Error |
| 4.3, 4.4, 4.5, 4.6 | válido |

Versiones afectadas: OpenGL 2.0

```text
error YS0711: El storage buffer 'Items' no está disponible en todas las APIs gráficas: OpenGL
    2.0: los storage buffers llegan en OpenGL 4.3. Afecta a: OpenGL 2.0.
```

Versiones afectadas: OpenGL 3.0

```text
error YS0711: El storage buffer 'Items' no está disponible en todas las APIs gráficas: OpenGL
    3.0: los storage buffers llegan en OpenGL 4.3. Afecta a: OpenGL 3.0.
```

Versiones afectadas: OpenGL 3.1

```text
error YS0711: El storage buffer 'Items' no está disponible en todas las APIs gráficas: OpenGL
    3.1: los storage buffers llegan en OpenGL 4.3. Afecta a: OpenGL 3.1.
```

Versiones afectadas: OpenGL 3.2

```text
error YS0711: El storage buffer 'Items' no está disponible en todas las APIs gráficas: OpenGL
    3.2: los storage buffers llegan en OpenGL 4.3. Afecta a: OpenGL 3.2.
```

Versiones afectadas: OpenGL 3.3

```text
error YS0711: El storage buffer 'Items' no está disponible en todas las APIs gráficas: OpenGL
    3.3: los storage buffers llegan en OpenGL 4.3. Afecta a: OpenGL 3.3.
```

Versiones afectadas: OpenGL 4.0

```text
error YS0711: El storage buffer 'Items' no está disponible en todas las APIs gráficas: OpenGL
    4.0: los storage buffers llegan en OpenGL 4.3. Afecta a: OpenGL 4.0.
```

Versiones afectadas: OpenGL 4.1

```text
error YS0711: El storage buffer 'Items' no está disponible en todas las APIs gráficas: OpenGL
    4.1: los storage buffers llegan en OpenGL 4.3. Afecta a: OpenGL 4.1.
```

Versiones afectadas: OpenGL 4.2

```text
error YS0711: El storage buffer 'Items' no está disponible en todas las APIs gráficas: OpenGL
    4.2: los storage buffers llegan en OpenGL 4.3. Afecta a: OpenGL 4.2.
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
| 2.0 | Error, Aviso |
| 3.0 | Error, Aviso |
| 3.1 | Error, Aviso |
| 3.2 | Error, Aviso |
| 3.3 | Error, Aviso |
| 4.0 | Error, Aviso |
| 4.1 | Error, Aviso |
| 4.2 | Aviso |
| 4.3 | Aviso |
| 4.4 | Aviso |
| 4.5 | Aviso |
| 4.6 | Aviso |

Versiones afectadas: OpenGL 2.0

```text
error YS0711: La textura de almacenamiento 'Image' no está disponible en todas las APIs
    gráficas: OpenGL 2.0: las imágenes (load/store) llegan en OpenGL 4.2. Afecta a: OpenGL 2.0.
warning YS0705: 'Image' es una textura de almacenamiento sin formato: OpenGL 2.0: necesita
    EXT_shader_image_load_formatted. Afecta a: OpenGL 2.0.
```

Versiones afectadas: OpenGL 3.0

```text
error YS0711: La textura de almacenamiento 'Image' no está disponible en todas las APIs
    gráficas: OpenGL 3.0: las imágenes (load/store) llegan en OpenGL 4.2. Afecta a: OpenGL 3.0.
warning YS0705: 'Image' es una textura de almacenamiento sin formato: OpenGL 3.0: necesita
    EXT_shader_image_load_formatted. Afecta a: OpenGL 3.0.
```

Versiones afectadas: OpenGL 3.1

```text
error YS0711: La textura de almacenamiento 'Image' no está disponible en todas las APIs
    gráficas: OpenGL 3.1: las imágenes (load/store) llegan en OpenGL 4.2. Afecta a: OpenGL 3.1.
warning YS0705: 'Image' es una textura de almacenamiento sin formato: OpenGL 3.1: necesita
    EXT_shader_image_load_formatted. Afecta a: OpenGL 3.1.
```

Versiones afectadas: OpenGL 3.2

```text
error YS0711: La textura de almacenamiento 'Image' no está disponible en todas las APIs
    gráficas: OpenGL 3.2: las imágenes (load/store) llegan en OpenGL 4.2. Afecta a: OpenGL 3.2.
warning YS0705: 'Image' es una textura de almacenamiento sin formato: OpenGL 3.2: necesita
    EXT_shader_image_load_formatted. Afecta a: OpenGL 3.2.
```

Versiones afectadas: OpenGL 3.3

```text
error YS0711: La textura de almacenamiento 'Image' no está disponible en todas las APIs
    gráficas: OpenGL 3.3: las imágenes (load/store) llegan en OpenGL 4.2. Afecta a: OpenGL 3.3.
warning YS0705: 'Image' es una textura de almacenamiento sin formato: OpenGL 3.3: necesita
    EXT_shader_image_load_formatted. Afecta a: OpenGL 3.3.
```

Versiones afectadas: OpenGL 4.0

```text
error YS0711: La textura de almacenamiento 'Image' no está disponible en todas las APIs
    gráficas: OpenGL 4.0: las imágenes (load/store) llegan en OpenGL 4.2. Afecta a: OpenGL 4.0.
warning YS0705: 'Image' es una textura de almacenamiento sin formato: OpenGL 4.0: necesita
    EXT_shader_image_load_formatted. Afecta a: OpenGL 4.0.
```

Versiones afectadas: OpenGL 4.1

```text
error YS0711: La textura de almacenamiento 'Image' no está disponible en todas las APIs
    gráficas: OpenGL 4.1: las imágenes (load/store) llegan en OpenGL 4.2. Afecta a: OpenGL 4.1.
warning YS0705: 'Image' es una textura de almacenamiento sin formato: OpenGL 4.1: necesita
    EXT_shader_image_load_formatted. Afecta a: OpenGL 4.1.
```

Versiones afectadas: OpenGL 4.2

```text
warning YS0705: 'Image' es una textura de almacenamiento sin formato: OpenGL 4.2: necesita
    EXT_shader_image_load_formatted. Afecta a: OpenGL 4.2.
```

Versiones afectadas: OpenGL 4.3

```text
warning YS0705: 'Image' es una textura de almacenamiento sin formato: OpenGL 4.3: necesita
    EXT_shader_image_load_formatted. Afecta a: OpenGL 4.3.
```

Versiones afectadas: OpenGL 4.4

```text
warning YS0705: 'Image' es una textura de almacenamiento sin formato: OpenGL 4.4: necesita
    EXT_shader_image_load_formatted. Afecta a: OpenGL 4.4.
```

Versiones afectadas: OpenGL 4.5

```text
warning YS0705: 'Image' es una textura de almacenamiento sin formato: OpenGL 4.5: necesita
    EXT_shader_image_load_formatted. Afecta a: OpenGL 4.5.
```

Versiones afectadas: OpenGL 4.6

```text
warning YS0705: 'Image' es una textura de almacenamiento sin formato: OpenGL 4.6: necesita
    EXT_shader_image_load_formatted. Afecta a: OpenGL 4.6.
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
| 2.0 | Error |
| 3.0, 3.1, 3.2, 3.3, 4.0, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6 | válido |

Versiones afectadas: OpenGL 2.0

```text
error YS0701: 'uint' no está disponible en todas las APIs gráficas: OpenGL 2.0: necesita GLSL
    1.30 (OpenGL 3.0). Afecta a: OpenGL 2.0.
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
| 3.0, 3.1, 3.2, 3.3, 4.0, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6 | válido |

Versiones afectadas: OpenGL 2.0

```text
error YS0703: 'operador de bits' no está disponible en todas las APIs gráficas: OpenGL 2.0:
    necesita GLSL 1.30 (OpenGL 3.0). Afecta a: OpenGL 2.0.
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
| 3.0, 3.1, 3.2, 3.3, 4.0, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6 | válido |

Versiones afectadas: OpenGL 2.0

```text
error YS0703: 'Load' no está disponible en todas las APIs gráficas: OpenGL 2.0: necesita GLSL
    1.30 (OpenGL 3.0). Afecta a: OpenGL 2.0.
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
| 3.0 | Aviso |
| 3.1 | Aviso |
| 3.2 | Aviso |
| 3.3 | Aviso |
| 4.0, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6 | válido |

Versiones afectadas: OpenGL 2.0

```text
error YS0703: 'Gather' no está disponible en todas las APIs gráficas: OpenGL 2.0: necesita GLSL
    1.30 (OpenGL 3.0). Afecta a: OpenGL 2.0.
```

Versiones afectadas: OpenGL 3.0

```text
warning YS0703: 'Gather' no está disponible en todas las APIs gráficas: OpenGL 3.0: necesita
    ARB_texture_gather. Afecta a: OpenGL 3.0.
```

Versiones afectadas: OpenGL 3.1

```text
warning YS0703: 'Gather' no está disponible en todas las APIs gráficas: OpenGL 3.1: necesita
    ARB_texture_gather. Afecta a: OpenGL 3.1.
```

Versiones afectadas: OpenGL 3.2

```text
warning YS0703: 'Gather' no está disponible en todas las APIs gráficas: OpenGL 3.2: necesita
    ARB_texture_gather. Afecta a: OpenGL 3.2.
```

Versiones afectadas: OpenGL 3.3

```text
warning YS0703: 'Gather' no está disponible en todas las APIs gráficas: OpenGL 3.3: necesita
    ARB_texture_gather. Afecta a: OpenGL 3.3.
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
| 2.0 | Error |
| 3.0, 3.1, 3.2, 3.3, 4.0, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6 | válido |

Versiones afectadas: OpenGL 2.0

```text
error YS0703: 'Sample' no está disponible en todas las APIs gráficas: OpenGL 2.0: necesita GLSL
    1.30 (OpenGL 3.0). Afecta a: OpenGL 2.0.
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
| 2.0 | Error |
| 3.0, 3.1, 3.2, 3.3, 4.0, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6 | válido |

Versiones afectadas: OpenGL 2.0

```text
error YS0701: 'uint' no está disponible en todas las APIs gráficas: OpenGL 2.0: necesita GLSL
    1.30 (OpenGL 3.0). Afecta a: OpenGL 2.0.
error YS0703: 'GetDimensions' no está disponible en todas las APIs gráficas: OpenGL 2.0:
    necesita GLSL 1.30 (OpenGL 3.0). Afecta a: OpenGL 2.0.
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
| 2.0, 3.0 | válido |
| 3.1 | Error |
| 3.2 | Error |
| 3.3 | Error |
| 4.0 | Error |
| 4.1 | Error |
| 4.2 | Error |
| 4.3 | Error |
| 4.4 | Error |
| 4.5 | Error |
| 4.6 | Error |

Versiones afectadas: OpenGL 3.1

```text
error YS0713: El uniform buffer 'Data' ocupa 17600 bytes (std140), más de lo que garantiza
    OpenGL 3.1 (16384 bytes). Afecta a: OpenGL 3.1.
```

Versiones afectadas: OpenGL 3.2

```text
error YS0713: El uniform buffer 'Data' ocupa 17600 bytes (std140), más de lo que garantiza
    OpenGL 3.2 (16384 bytes). Afecta a: OpenGL 3.2.
```

Versiones afectadas: OpenGL 3.3

```text
error YS0713: El uniform buffer 'Data' ocupa 17600 bytes (std140), más de lo que garantiza
    OpenGL 3.3 (16384 bytes). Afecta a: OpenGL 3.3.
```

Versiones afectadas: OpenGL 4.0

```text
error YS0713: El uniform buffer 'Data' ocupa 17600 bytes (std140), más de lo que garantiza
    OpenGL 4.0 (16384 bytes). Afecta a: OpenGL 4.0.
```

Versiones afectadas: OpenGL 4.1

```text
error YS0713: El uniform buffer 'Data' ocupa 17600 bytes (std140), más de lo que garantiza
    OpenGL 4.1 (16384 bytes). Afecta a: OpenGL 4.1.
```

Versiones afectadas: OpenGL 4.2

```text
error YS0713: El uniform buffer 'Data' ocupa 17600 bytes (std140), más de lo que garantiza
    OpenGL 4.2 (16384 bytes). Afecta a: OpenGL 4.2.
```

Versiones afectadas: OpenGL 4.3

```text
error YS0713: El uniform buffer 'Data' ocupa 17600 bytes (std140), más de lo que garantiza
    OpenGL 4.3 (16384 bytes). Afecta a: OpenGL 4.3.
```

Versiones afectadas: OpenGL 4.4

```text
error YS0713: El uniform buffer 'Data' ocupa 17600 bytes (std140), más de lo que garantiza
    OpenGL 4.4 (16384 bytes). Afecta a: OpenGL 4.4.
```

Versiones afectadas: OpenGL 4.5

```text
error YS0713: El uniform buffer 'Data' ocupa 17600 bytes (std140), más de lo que garantiza
    OpenGL 4.5 (16384 bytes). Afecta a: OpenGL 4.5.
```

Versiones afectadas: OpenGL 4.6

```text
error YS0713: El uniform buffer 'Data' ocupa 17600 bytes (std140), más de lo que garantiza
    OpenGL 4.6 (16384 bytes). Afecta a: OpenGL 4.6.
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
| 3.1 | Error |
| 3.2 | Error |
| 3.3 | Error |
| 4.0 | Error |
| 4.1 | Error |
| 4.2 | Aviso |
| 4.3, 4.4, 4.5, 4.6 | válido |

Versiones afectadas: OpenGL 2.0

```text
error YS0711: El compute shader 'CS' no está disponible en todas las APIs gráficas: OpenGL 2.0:
    los compute shaders llegan en OpenGL 4.3. Afecta a: OpenGL 2.0.
```

Versiones afectadas: OpenGL 3.0

```text
error YS0711: El compute shader 'CS' no está disponible en todas las APIs gráficas: OpenGL 3.0:
    los compute shaders llegan en OpenGL 4.3. Afecta a: OpenGL 3.0.
```

Versiones afectadas: OpenGL 3.1

```text
error YS0711: El compute shader 'CS' no está disponible en todas las APIs gráficas: OpenGL 3.1:
    los compute shaders llegan en OpenGL 4.3. Afecta a: OpenGL 3.1.
```

Versiones afectadas: OpenGL 3.2

```text
error YS0711: El compute shader 'CS' no está disponible en todas las APIs gráficas: OpenGL 3.2:
    los compute shaders llegan en OpenGL 4.3. Afecta a: OpenGL 3.2.
```

Versiones afectadas: OpenGL 3.3

```text
error YS0711: El compute shader 'CS' no está disponible en todas las APIs gráficas: OpenGL 3.3:
    los compute shaders llegan en OpenGL 4.3. Afecta a: OpenGL 3.3.
```

Versiones afectadas: OpenGL 4.0

```text
error YS0711: El compute shader 'CS' no está disponible en todas las APIs gráficas: OpenGL 4.0:
    los compute shaders llegan en OpenGL 4.3. Afecta a: OpenGL 4.0.
```

Versiones afectadas: OpenGL 4.1

```text
error YS0711: El compute shader 'CS' no está disponible en todas las APIs gráficas: OpenGL 4.1:
    los compute shaders llegan en OpenGL 4.3. Afecta a: OpenGL 4.1.
```

Versiones afectadas: OpenGL 4.2

```text
warning YS0711: El compute shader 'CS' no está disponible en todas las APIs gráficas: OpenGL
    4.2: necesita ARB_compute_shader (la ofrece la mayoría de drivers de 4.2, no macOS). Afecta
    a: OpenGL 4.2.
```

Los ids de los diagnósticos se describen en [Diagnósticos](diagnostics.md).

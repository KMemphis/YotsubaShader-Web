---
title: "Validar para Vulkan"
summary: "Qué rechaza el analizador cuando un shader declara Vulkan, versión por versión, con el mensaje exacto de cada diagnóstico."
order: 20
---

Declara Vulkan con `[ShaderTargets]` y el analizador avisa de todo lo que el shader usa y esta API gráfica no tiene. Se declara así: `[ShaderTargets(Target.Vulkan_10)]`.

```csharp
using YotsubaShader.Compiler.Metadata;

[ShaderTargets(Target.Vulkan_14)]
public class MyShader { /* ... */ }
```

Versiones: `Target.Vulkan_10`, `Target.Vulkan_11`, `Target.Vulkan_12`, `Target.Vulkan_13`, `Target.Vulkan_14`.

> [!NOTE]
> Vulkan 1.0: Ningún backend de YotsubaShader genera estas versiones; el analizador las valida igualmente, así que puedes declararlas y compilar a otro lenguaje.

## Qué tiene cada versión

`✓` garantizada, `~` opcional (un aviso), `✗` no disponible (un error al declararla), `·` no modelada.

| | 1.0 | 1.1 | 1.2 | 1.3 | 1.4 |
| --- | :---: | :---: | :---: | :---: | :---: |
| `double` | ~ | ~ | ~ | ~ | ~ |
| `half` | ~ | ~ | ~ | ~ | ~ |
| Enteros de 16 bits | ~ | ~ | ~ | ~ | ~ |
| Enteros de 64 bits | ~ | ~ | ~ | ~ | ~ |
| Compute shaders | ✓ | ✓ | ✓ | ✓ | ✓ |
| Storage buffers | ✓ | ✓ | ✓ | ✓ | ✓ |
| Storage textures | ✓ | ✓ | ✓ | ✓ | ✓ |
| Storage textures sin formato | ~ | ~ | ~ | ~ | ~ |
| `uint` | ✓ | ✓ | ✓ | ✓ | ✓ |
| Operadores de bits | ✓ | ✓ | ✓ | ✓ | ✓ |
| Leer un texel (`Load`) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Gather | ✓ | ✓ | ✓ | ✓ | ✓ |
| Offsets de textura | ✓ | ✓ | ✓ | ✓ | ✓ |
| Consultar el tamaño de una textura | ✓ | ✓ | ✓ | ✓ | ✓ |
| Derivadas y LOD implícito | ✓ | ✓ | ✓ | ✓ | ✓ |

**Notas**

- `double`, Vulkan 1.0–1.4: opcional (shaderFloat64).
- `half`, Vulkan 1.0, Vulkan 1.1: necesita VK_KHR_shader_float16_int8 y shaderFloat16.
- `half`, Vulkan 1.2–1.4: opcional (shaderFloat16).
- Enteros de 16 bits, Vulkan 1.0–1.4: opcional (shaderInt16).
- Enteros de 64 bits, Vulkan 1.0–1.4: opcional (shaderInt64).
- Storage textures sin formato, Vulkan 1.0–1.4: necesita shaderStorageImageReadWithoutFormat/WriteWithoutFormat.

## Límites

Los límites que revisa el analizador. Un shader que se pasa de uno recibe un diagnóstico que nombra la versión.

| | 1.0 | 1.1 | 1.2 | 1.3 | 1.4 |
| --- | :---: | :---: | :---: | :---: | :---: |
| Render targets | 4 | 4 | 4 | 4 | 4 |
| Entradas de vértice | 16 | 16 | 16 | 16 | 16 |
| Variables entre etapas | 16 | 16 | 16 | 16 | 16 |
| Descriptor sets | 4 | 4 | 4 | 4 | 4 |
| Uniform buffer (bytes) | 16384 | 16384 | 16384 | 16384 | 16384 |
| Grupo de compute (invocaciones) | 128 | 128 | 128 | 128 | 128 |

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
| 1.0 | Aviso |
| 1.1 | Aviso |
| 1.2 | Aviso |
| 1.3 | Aviso |
| 1.4 | Aviso |

Versiones afectadas: Vulkan 1.0

```text
warning YS0701: 'double' no está disponible en todas las APIs gráficas: Vulkan 1.0: opcional
    (shaderFloat64). Afecta a: Vulkan 1.0.
```

Versiones afectadas: Vulkan 1.1

```text
warning YS0701: 'double' no está disponible en todas las APIs gráficas: Vulkan 1.1: opcional
    (shaderFloat64). Afecta a: Vulkan 1.1.
```

Versiones afectadas: Vulkan 1.2

```text
warning YS0701: 'double' no está disponible en todas las APIs gráficas: Vulkan 1.2: opcional
    (shaderFloat64). Afecta a: Vulkan 1.2.
```

Versiones afectadas: Vulkan 1.3

```text
warning YS0701: 'double' no está disponible en todas las APIs gráficas: Vulkan 1.3: opcional
    (shaderFloat64). Afecta a: Vulkan 1.3.
```

Versiones afectadas: Vulkan 1.4

```text
warning YS0701: 'double' no está disponible en todas las APIs gráficas: Vulkan 1.4: opcional
    (shaderFloat64). Afecta a: Vulkan 1.4.
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
| 1.0 | Aviso |
| 1.1 | Aviso |
| 1.2 | Aviso |
| 1.3 | Aviso |
| 1.4 | Aviso |

Versiones afectadas: Vulkan 1.0

```text
warning YS0705: 'Image' es una textura de almacenamiento sin formato: Vulkan 1.0: necesita
    shaderStorageImageReadWithoutFormat/WriteWithoutFormat. Afecta a: Vulkan 1.0.
```

Versiones afectadas: Vulkan 1.1

```text
warning YS0705: 'Image' es una textura de almacenamiento sin formato: Vulkan 1.1: necesita
    shaderStorageImageReadWithoutFormat/WriteWithoutFormat. Afecta a: Vulkan 1.1.
```

Versiones afectadas: Vulkan 1.2

```text
warning YS0705: 'Image' es una textura de almacenamiento sin formato: Vulkan 1.2: necesita
    shaderStorageImageReadWithoutFormat/WriteWithoutFormat. Afecta a: Vulkan 1.2.
```

Versiones afectadas: Vulkan 1.3

```text
warning YS0705: 'Image' es una textura de almacenamiento sin formato: Vulkan 1.3: necesita
    shaderStorageImageReadWithoutFormat/WriteWithoutFormat. Afecta a: Vulkan 1.3.
```

Versiones afectadas: Vulkan 1.4

```text
warning YS0705: 'Image' es una textura de almacenamiento sin formato: Vulkan 1.4: necesita
    shaderStorageImageReadWithoutFormat/WriteWithoutFormat. Afecta a: Vulkan 1.4.
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
| 1.0 | Error |
| 1.1 | Error |
| 1.2 | Error |
| 1.3 | Error |
| 1.4 | Error |

Versiones afectadas: Vulkan 1.0

```text
error YS0713: El uniform buffer 'Data' ocupa 17600 bytes (std140), más de lo que garantiza
    Vulkan 1.0 (16384 bytes). Afecta a: Vulkan 1.0.
```

Versiones afectadas: Vulkan 1.1

```text
error YS0713: El uniform buffer 'Data' ocupa 17600 bytes (std140), más de lo que garantiza
    Vulkan 1.1 (16384 bytes). Afecta a: Vulkan 1.1.
```

Versiones afectadas: Vulkan 1.2

```text
error YS0713: El uniform buffer 'Data' ocupa 17600 bytes (std140), más de lo que garantiza
    Vulkan 1.2 (16384 bytes). Afecta a: Vulkan 1.2.
```

Versiones afectadas: Vulkan 1.3

```text
error YS0713: El uniform buffer 'Data' ocupa 17600 bytes (std140), más de lo que garantiza
    Vulkan 1.3 (16384 bytes). Afecta a: Vulkan 1.3.
```

Versiones afectadas: Vulkan 1.4

```text
error YS0713: El uniform buffer 'Data' ocupa 17600 bytes (std140), más de lo que garantiza
    Vulkan 1.4 (16384 bytes). Afecta a: Vulkan 1.4.
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
| 1.0 | Aviso |
| 1.1 | Aviso |
| 1.2 | Aviso |
| 1.3 | Aviso |
| 1.4 | Aviso |

Versiones afectadas: Vulkan 1.0

```text
warning YS0704: El grupo de 256x1x1 (256 invocaciones) supera lo que garantizan Vulkan 1.0 (128
    invocaciones, 128x128x64). Afecta a: Vulkan 1.0.
```

Versiones afectadas: Vulkan 1.1

```text
warning YS0704: El grupo de 256x1x1 (256 invocaciones) supera lo que garantizan Vulkan 1.1 (128
    invocaciones, 128x128x64). Afecta a: Vulkan 1.1.
```

Versiones afectadas: Vulkan 1.2

```text
warning YS0704: El grupo de 256x1x1 (256 invocaciones) supera lo que garantizan Vulkan 1.2 (128
    invocaciones, 128x128x64). Afecta a: Vulkan 1.2.
```

Versiones afectadas: Vulkan 1.3

```text
warning YS0704: El grupo de 256x1x1 (256 invocaciones) supera lo que garantizan Vulkan 1.3 (128
    invocaciones, 128x128x64). Afecta a: Vulkan 1.3.
```

Versiones afectadas: Vulkan 1.4

```text
warning YS0704: El grupo de 256x1x1 (256 invocaciones) supera lo que garantizan Vulkan 1.4 (128
    invocaciones, 128x128x64). Afecta a: Vulkan 1.4.
```

Los ids de los diagnósticos se describen en [Diagnósticos](diagnostics.md).

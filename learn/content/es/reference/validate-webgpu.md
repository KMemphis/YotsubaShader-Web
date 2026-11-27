---
title: "Validar para WebGPU"
summary: "Qué rechaza el analizador cuando un shader declara WebGPU, versión por versión, con el mensaje exacto de cada diagnóstico."
order: 25
---

Declara WebGPU con `[ShaderTargets]` y el analizador avisa de todo lo que el shader usa y esta API gráfica no tiene. Se declara así: `[ShaderTargets(Target.WebGpu)]`.

```csharp
using YotsubaShader.Compiler.Metadata;

[ShaderTargets(Target.WebGpu)]
public class MyShader { /* ... */ }
```

Versiones: `Target.WebGpu`.

## Qué tiene cada versión

`✓` garantizada, `~` opcional (un aviso), `✗` no disponible (un error al declararla), `·` no modelada.

| | 1.0 |
| --- | :---: |
| `double` | ✗ |
| `half` | ~ |
| Enteros de 16 bits | ✗ |
| Enteros de 64 bits | ✗ |
| Compute shaders | ✓ |
| Storage buffers | ✓ |
| Storage textures | ✓ |
| Storage textures sin formato | ✗ |
| `uint` | ✓ |
| Operadores de bits | ✓ |
| Leer un texel (`Load`) | ✓ |
| Gather | ✓ |
| Offsets de textura | ✓ |
| Consultar el tamaño de una textura | ✓ |
| Derivadas y LOD implícito | ✓ |

**Notas**

- `double`, WebGPU 1.0: no existe en WGSL.
- `half`, WebGPU 1.0: necesita la feature 'shader-f16'.
- Enteros de 16 bits, WebGPU 1.0: no existe en WGSL.
- Enteros de 64 bits, WebGPU 1.0: no existe en WGSL.
- Storage textures sin formato, WebGPU 1.0: WGSL exige el formato de la textura.

## Límites

Los límites que revisa el analizador. Un shader que se pasa de uno recibe un diagnóstico que nombra la versión.

| | 1.0 |
| --- | :---: |
| Render targets | 8 |
| Entradas de vértice | 16 |
| Variables entre etapas | 16 |
| Descriptor sets | 4 |
| Uniform buffer (bytes) | 65536 |
| Grupo de compute (invocaciones) | 256 |

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
| 1.0 | Error |

Versiones afectadas: WebGPU 1.0

```text
error YS0701: 'double' no está disponible en todas las APIs gráficas: WebGPU 1.0: no existe en
    WGSL. Afecta a: WebGPU 1.0.
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
| 1.0 | Error |

Versiones afectadas: WebGPU 1.0

```text
error YS0705: 'Image' es una textura de almacenamiento sin formato: WebGPU 1.0: WGSL exige el
    formato de la textura. Afecta a: WebGPU 1.0.
```

Los ids de los diagnósticos se describen en [Diagnósticos](diagnostics.md).

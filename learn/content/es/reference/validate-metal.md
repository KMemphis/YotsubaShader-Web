---
title: "Validar para Metal"
summary: "Qué rechaza el analizador cuando un shader declara Metal, versión por versión, con el mensaje exacto de cada diagnóstico."
order: 24
---

Declara Metal con `[ShaderTargets]` y el analizador avisa de todo lo que el shader usa y esta API gráfica no tiene. Se declara así: `[ShaderTargets(Target.Metal_1)]`.

```csharp
using YotsubaShader.Compiler.Metadata;

[ShaderTargets(Target.Metal_4)]
public class MyShader { /* ... */ }
```

Versiones: `Target.Metal_1`, `Target.Metal_2`, `Target.Metal_3`, `Target.Metal_4`.

## Qué tiene cada versión

`✓` garantizada, `~` opcional (un aviso), `✗` no disponible (un error al declararla), `·` no modelada.

| | 1 | 2 | 3 | 4 |
| --- | :---: | :---: | :---: | :---: |
| `double` | ✗ | ✗ | ✗ | ✗ |
| `half` | ✓ | ✓ | ✓ | ✓ |
| Enteros de 16 bits | ✓ | ✓ | ✓ | ✓ |
| Enteros de 64 bits | · | · | · | · |
| Compute shaders | ✓ | ✓ | ✓ | ✓ |
| Storage buffers | ✓ | ✓ | ✓ | ✓ |
| Storage textures | ✓ | ✓ | ✓ | ✓ |
| Storage textures sin formato | ✓ | ✓ | ✓ | ✓ |
| `uint` | ✓ | ✓ | ✓ | ✓ |
| Operadores de bits | ✓ | ✓ | ✓ | ✓ |
| Leer un texel (`Load`) | ✓ | ✓ | ✓ | ✓ |
| Gather | ✓ | ✓ | ✓ | ✓ |
| Offsets de textura | ✓ | ✓ | ✓ | ✓ |
| Consultar el tamaño de una textura | ✓ | ✓ | ✓ | ✓ |
| Derivadas y LOD implícito | ✓ | ✓ | ✓ | ✓ |

**Notas**

- `double`, Metal 1–4: MSL no tiene double.

## Límites

Los límites que revisa el analizador. Un shader que se pasa de uno recibe un diagnóstico que nombra la versión.

| | 1 | 2 | 3 | 4 |
| --- | :---: | :---: | :---: | :---: |
| Render targets | 8 | 8 | 8 | 8 |
| Entradas de vértice | 31 | 31 | 31 | 31 |

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
| 1 | Error |
| 2 | Error |
| 3 | Error |
| 4 | Error |

Versiones afectadas: Metal 1

```text
error YS0701: 'double' no está disponible en todas las APIs gráficas: Metal 1: MSL no tiene
    double. Afecta a: Metal 1.
```

Versiones afectadas: Metal 2

```text
error YS0701: 'double' no está disponible en todas las APIs gráficas: Metal 2: MSL no tiene
    double. Afecta a: Metal 2.
```

Versiones afectadas: Metal 3

```text
error YS0701: 'double' no está disponible en todas las APIs gráficas: Metal 3: MSL no tiene
    double. Afecta a: Metal 3.
```

Versiones afectadas: Metal 4

```text
error YS0701: 'double' no está disponible en todas las APIs gráficas: Metal 4: MSL no tiene
    double. Afecta a: Metal 4.
```

Los ids de los diagnósticos se describen en [Diagnósticos](diagnostics.md).

---
title: "Uso por etapa"
summary: "Errores sobre operaciones que solo existen en una etapa."
order: 17
---

Errores sobre operaciones que solo existen en una etapa. 4 diagnósticos. Valen para cualquier shader, sea cual sea la API gráfica que declares. Los ids de los diagnósticos se describen en [Diagnósticos](diagnostics.md).

## YS0601: Operación solo de fragment

**Severidad:** Error

**Mensaje:** '…' … solo existe en fragment shaders, y se usa desde el shader … '…'.

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Vertex)] [return: SV_Position] public float4 VS([POSITION] float4 p) { float d = Intrinsic.ddx(p.X); return p; } }
```

```text
error YS0601: 'ddx' (derivada en pantalla) solo existe en fragment shaders, y se usa desde el
    shader vertex 'VS'.
```

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Compute)] [numthreads(1,1,1)] public void CS() { Intrinsic.clip(1f); } }
```

```text
error YS0601: 'clip' (descarta el fragmento) solo existe en fragment shaders, y se usa desde el
    shader compute 'CS'.
```

## YS0602: Operación solo de compute

**Severidad:** Error

**Mensaje:** '…' solo existe en compute shaders, y se usa desde el shader … '…'.

*Este diagnóstico todavía no tiene un shader de ejemplo.*

## YS0603: Escritura en una entrada

**Severidad:** Error

**Mensaje:** '…' es una entrada del shader y no se puede modificar. Cópiala a una variable local.

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS([TEXCOORD(0)] float x) { x = 2f; return x; } }
```

```text
error YS0603: 'x' es una entrada del shader y no se puede modificar. Cópiala a una variable
    local.
```

## YS0604: Atómica sobre una variable local

**Severidad:** Error

**Mensaje:** La operación atómica '…' necesita un campo de un storage buffer como destino.

*Este diagnóstico todavía no tiene un shader de ejemplo.*


---
title: "Puntos de entrada"
summary: "Errores sobre los métodos marcados con [ShaderStage]: forma, etapa y tamaño de grupo de compute."
order: 12
---

Errores sobre los métodos marcados con [ShaderStage]: forma, etapa y tamaño de grupo de compute. 9 diagnósticos. Valen para cualquier shader, sea cual sea la API gráfica que declares. Los ids de los diagnósticos se describen en [Diagnósticos](diagnostics.md).

## YS0100: Punto de entrada no válido

**Severidad:** Error

**Mensaje:** '…' no puede ser un punto de entrada: ….

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public T FS<T>() { return default(T); } }
```

```text
error YS0100: 'FS' no puede ser un punto de entrada: es genérico.
```

## YS0101: Compute shader sin tamaño de grupo

**Severidad:** Error

**Mensaje:** El compute shader '…' necesita un tamaño de grupo: añade [numthreads(x, y, z)], [layout_local_size(...)] o [workgroup_size(...)].

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Compute)] public void CS() { } }
```

```text
error YS0101: El compute shader 'CS' necesita un tamaño de grupo: añade [numthreads(x, y, z)],
    [layout_local_size(...)] o [workgroup_size(...)].
```

## YS0102: Tamaño de grupo inválido

**Severidad:** Error

**Mensaje:** La dimensión … del tamaño de grupo de '…' es …; cada dimensión debe ser al menos 1.

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Compute)] [numthreads(0, 1, 1)] public void CS() { } }
```

```text
error YS0102: La dimensión x del tamaño de grupo de 'CS' es 0; cada dimensión debe ser al menos
    1.
```

## YS0103: Llamada directa a un punto de entrada

**Severidad:** Error

**Mensaje:** '…' es un punto de entrada y no puede llamarse desde código de shader. Mueve la lógica a una función auxiliar.

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS() { return Helper(); } float Helper() { return FS(); } }
```

```text
error YS0103: 'FS' es un punto de entrada y no puede llamarse desde código de shader. Mueve la
    lógica a una función auxiliar.
```

## YS0104: Tamaño de grupo demasiado grande

**Severidad:** Error

**Mensaje:** El tamaño de grupo …x…x… de '…' supera el máximo de la GPU (…).

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Compute)] [numthreads(64, 64, 1)] public void CS() { } }
```

```text
error YS0104: El tamaño de grupo 64x64x1 de 'CS' supera el máximo de la GPU (x ≤ 1024, y ≤ 1024,
    z ≤ 64 y como mucho 1024 invocaciones en total).
```

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Compute)] [numthreads(1, 1, 65)] public void CS() { } }
```

```text
error YS0104: El tamaño de grupo 1x1x65 de 'CS' supera el máximo de la GPU (x ≤ 1024, y ≤ 1024,
    z ≤ 64 y como mucho 1024 invocaciones en total).
```

## YS0105: Tamaño de grupo ignorado

**Severidad:** Aviso

**Mensaje:** El tamaño de grupo solo tiene efecto en compute shaders; '…' es un shader ….

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Fragment)] [numthreads(8, 8, 1)] public float4 FS() { return new float4(); } }
```

```text
warning YS0105: El tamaño de grupo solo tiene efecto en compute shaders; 'FS' es un shader
    fragment.
```

## YS0106: Varias etapas en un método

**Severidad:** Error

**Mensaje:** '…' tiene más de un [ShaderStage]. Un punto de entrada pertenece a una sola etapa.

*Este diagnóstico todavía no tiene un shader de ejemplo.*

## YS0107: Parámetro por referencia en un punto de entrada

**Severidad:** Error

**Mensaje:** El parámetro '…' de '…' es '…'. En un punto de entrada solo valen parámetros normales (entradas) y 'out' (salidas).

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS([TEXCOORD(0)] ref float x) { return x; } }
```

```text
error YS0107: El parámetro 'x' de 'FS' es 'ref'. En un punto de entrada solo valen parámetros
    normales (entradas) y 'out' (salidas).
```

## YS0108: Punto de entrada duplicado

**Severidad:** Error

**Mensaje:** Hay varios puntos de entrada llamados '…' en '…'. El nombre del punto de entrada debe ser único.

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS() { return 1f; } [ShaderStage(Stage.Fragment)] public float FS([TEXCOORD(0)] float x) { return x; } }
```

```text
error YS0108: Hay varios puntos de entrada llamados 'FS' en 'S'. El nombre del punto de entrada
    debe ser único.
```


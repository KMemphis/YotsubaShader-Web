---
title: "Interfaz entre etapas"
summary: "Errores sobre las entradas y salidas de cada etapa: built-ins, locations y semánticas."
order: 13
---

Errores sobre las entradas y salidas de cada etapa: built-ins, locations y semánticas. 21 diagnósticos. Valen para cualquier shader, sea cual sea la API gráfica que declares. Los ids de los diagnósticos se describen en [Diagnósticos](diagnostics.md).

## YS0201: Built-in no válido en esta etapa

**Severidad:** Error

**Mensaje:** […] (…) no existe en un shader …. Se usa en: ….

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Compute)] [numthreads(1,1,1)] public void CS([SV_Position] float4 p) { } }
```

```text
error YS0201: [SV_Position] (Position) no existe en un shader compute. Se usa en: vertex
    (salida).
```

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS([SV_VertexID] uint id) { return 1f; } }
```

```text
error YS0201: [SV_VertexID] (VertexIndex) no existe en un shader fragment. Se usa en: vertex
    (entrada).
```

## YS0202: Built-in en el sentido equivocado

**Severidad:** Error

**Mensaje:** […] (…) es … en un shader …, no ….

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Fragment)] [return: SV_Position] public float4 FS([SV_Position] float4 p) { return p; } }
```

```text
error YS0202: [SV_Position] (FragCoord) es una entrada en un shader fragment, no una salida.
```

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Vertex)] [return: SV_Position] public float4 VS([SV_Position] float4 p) { return p; } }
```

```text
error YS0202: [SV_Position] (Position) es una salida en un shader vertex, no una entrada.
```

## YS0203: Tipo incorrecto para el built-in

**Severidad:** Error

**Mensaje:** […] (…) debe ser …, pero '…' es '…'.

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Vertex)] [return: SV_Position] public float3 VS([POSITION] float3 p) { return p; } }
```

```text
error YS0203: [SV_Position] (Position) debe ser float4, pero 'return' es 'float3'.
```

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS([SV_IsFrontFace] uint f) { return 1f; } }
```

```text
error YS0203: [SV_IsFrontFace] (FrontFacing) debe ser bool, pero 'f' es 'uint'.
```

## YS0204: Built-in repetido

**Severidad:** Error

**Mensaje:** … aparece más de una vez como … de '…'. Cada built-in se declara una sola vez por etapa.

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Vertex)] public void VS([SV_Position] out float4 a, [SV_Position] out float4 b) { a = new float4(); b = new float4(); } }
```

```text
error YS0204: Position aparece más de una vez como salida de 'VS'. Cada built-in se declara una
    sola vez por etapa.
```

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Vertex)] [return: SV_Position] public float4 VS([TEXCOORD(0)] float4 a, [TEXCOORD(0)] float4 b) { return a; } }
```

```text
error YS0204: TEXCOORD0 aparece más de una vez como entrada de 'VS'. Cada built-in se declara
    una sola vez por etapa.
```

## YS0205: Location duplicada

**Severidad:** Error

**Mensaje:** La location … de '…' se solapa con '…' en las … de '…'.

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public void FS([SV_Target(1)] out float a, [SV_Target(1)] out float b) { a = 1f; b = 2f; } }
```

```text
error YS0205: La location 1 de 'b' se solapa con 'a' en las salidas de 'FS'.
```

## YS0206: Atributos de interfaz en conflicto

**Severidad:** Error

**Mensaje:** '…' tiene a la vez […] y […]. Un miembro de la interfaz lleva una sola location, semántica o built-in.

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS([TEXCOORD(0)] [SV_Position] float4 p) { return 1f; } }
```

```text
error YS0206: 'p' tiene a la vez [TEXCOORD] y [SV_Position]. Un miembro de la interfaz lleva una
    sola location, semántica o built-in.
```

## YS0207: Miembro de la interfaz sin slot

**Severidad:** Error

**Mensaje:** '…' es … de '…' y no tiene location, semántica ni built-in. Añade por ejemplo [TEXCOORD(n)], [location(n)] o un built-in.

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS(float x) { return x; } }
```

```text
error YS0207: 'x' es entrada de 'FS' y no tiene location, semántica ni built-in. Añade por
    ejemplo [TEXCOORD(n)], [location(n)] o un built-in.
```

Shader que lo provoca:

```csharp
public struct VsOut { [SV_Position] public float4 Pos; public float2 Uv; } public class S { [ShaderStage(Stage.Vertex)] public VsOut VS([POSITION] float4 p) { VsOut o; o.Pos = p; o.Uv = new float2(); return o; } }
```

```text
error YS0207: 'Uv' es salida de 'VS' y no tiene location, semántica ni built-in. Añade por
    ejemplo [TEXCOORD(n)], [location(n)] o un built-in.
```

## YS0208: bool en la interfaz

**Severidad:** Error

**Mensaje:** '…' es bool; las variables entre etapas no pueden ser bool en la GPU. Usa uint o int.

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Vertex)] [return: SV_Position] public float4 VS([POSITION] float4 p, [TEXCOORD(0)] bool flag) { return p; } }
```

```text
error YS0208: 'flag' es bool; las variables entre etapas no pueden ser bool en la GPU. Usa uint
    o int.
```

## YS0209: Location en un compute shader

**Severidad:** Error

**Mensaje:** '…' tiene […], pero un compute shader no tiene entradas ni salidas por location; solo built-ins como SV_DispatchThreadID.

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Compute)] [numthreads(1,1,1)] public void CS([TEXCOORD(0)] float x) { } }
```

```text
error YS0209: 'x' tiene [TEXCOORD], pero un compute shader no tiene entradas ni salidas por
    location; solo built-ins como SV_DispatchThreadID.
```

Shader que lo provoca:

```csharp
public class S { [TEXCOORD(0)] public float4 Uv; [ShaderStage(Stage.Compute)] [numthreads(1,1,1)] public void CS() { } }
```

```text
error YS0209: 'Uv' tiene [TEXCOORD], pero un compute shader no tiene entradas ni salidas por
    location; solo built-ins como SV_DispatchThreadID.
```

## YS0210: Render target fuera de rango

**Severidad:** Error

**Mensaje:** El render target … de '…' no existe; los índices válidos son 0 a 7.

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Fragment)] [return: SV_Target(8)] public float4 FS() { return new float4(); } }
```

```text
error YS0210: El render target 8 de 'return' no existe; los índices válidos son 0 a 7.
```

## YS0211: Índice de location negativo

**Severidad:** Error

**Mensaje:** […] en '…' usa el índice …; debe ser 0 o mayor.

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Fragment)] [return: SV_Target(-1)] public float FS() { return 1f; } }
```

```text
error YS0211: [SV_Target] en 'return' usa el índice -1; debe ser 0 o mayor.
```

## YS0212: Semántica en una salida de fragment

**Severidad:** Error

**Mensaje:** '…' usa […] como salida de un fragment shader. Las salidas de fragment son render targets: usa [SV_Target(n)] o [location(n)].

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Fragment)] [return: TEXCOORD(0)] public float4 FS() { return new float4(); } }
```

```text
error YS0212: 'return' usa [TEXCOORD] como salida de un fragment shader. Las salidas de fragment
    son render targets: usa [SV_Target(n)] o [location(n)].
```

## YS0213: Array de interfaz sin longitud

**Severidad:** Error

**Mensaje:** '…' es un array en la interfaz y su longitud no se conoce. Indica la longitud con [ArrayLength(n)].

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Vertex)] [return: SV_Position] public float4 VS([POSITION] float4 p, [TEXCOORD(0)] float[] w) { return p; } }
```

```text
error YS0213: 'w' es un array en la interfaz y su longitud no se conoce. Indica la longitud con
    [ArrayLength(n)].
```

## YS0214: Recurso en la interfaz

**Severidad:** Error

**Mensaje:** '…' es … y no puede pasar entre etapas. Decláralo como campo del shader con [Binding].

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS([TEXCOORD(0)] Texture2D t) { return 1f; } }
```

```text
error YS0214: 't' es una textura y no puede pasar entre etapas. Decláralo como campo del shader
    con [Binding].
```

## YS0215: Entrada de fragment sin salida de vertex

**Severidad:** Error

**Mensaje:** La entrada '…' (…) de '…' no la escribe ninguna salida del vertex shader '…'.

Shader que lo provoca:

```csharp
public struct VsOut { [SV_Position] public float4 Pos; [TEXCOORD(0)] public float2 Uv; }
public struct PsIn { [SV_Position] public float4 Pos; [TEXCOORD(1)] public float2 Uv; }
public class S {
    [ShaderStage(Stage.Vertex)] public VsOut VS([POSITION] float4 p) { VsOut o; o.Pos = p; o.Uv = new float2(); return o; }
    [ShaderStage(Stage.Fragment)] public float4 FS(PsIn i) { return i.Pos; }
}
```

```text
error YS0215: La entrada 'Uv' (TEXCOORD1) de 'FS' no la escribe ninguna salida del vertex shader
    'VS'.
```

## YS0216: Tipos distintos entre etapas

**Severidad:** Error

**Mensaje:** '…' es '…' en el vertex shader '…' y '…' en el fragment shader '…'.

Shader que lo provoca:

```csharp
public struct VsOut { [SV_Position] public float4 Pos; [TEXCOORD(0)] public float2 Uv; }
public struct PsIn { [SV_Position] public float4 Pos; [TEXCOORD(0)] public float3 Uv; }
public class S {
    [ShaderStage(Stage.Vertex)] public VsOut VS([POSITION] float4 p) { VsOut o; o.Pos = p; o.Uv = new float2(); return o; }
    [ShaderStage(Stage.Fragment)] public float4 FS(PsIn i) { return i.Pos; }
}
```

```text
error YS0216: 'TEXCOORD' es 'float2' en el vertex shader 'VS' y 'float3' en el fragment shader
    'FS'.
```

## YS0217: Descriptor en la interfaz

**Severidad:** Error

**Mensaje:** '…' tiene […], que es para recursos (texturas, samplers, buffers), no para entradas o salidas.

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS([Binding(0)] float x) { return x; } }
```

```text
error YS0217: 'x' tiene [Binding], que es para recursos (texturas, samplers, buffers), no para
    entradas o salidas.
```

## YS0218: Tipo no válido en la interfaz

**Severidad:** Error

**Mensaje:** '…' es '…', que no puede pasar entre etapas. Usa escalares, vectores, matrices o arrays de ellos.

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS([TEXCOORD(0)] decimal x) { return 1f; } }
```

```text
error YS0218: 'x' es 'decimal', que no puede pasar entre etapas. Usa escalares, vectores,
    matrices o arrays de ellos.
```

## YS0219: Built-in no soportado todavía

**Severidad:** Error

**Mensaje:** […] (…) todavía no está soportado por el compilador de YotsubaShader.

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS([SV_Barycentrics] float3 b) { return 1f; } }
```

```text
error YS0219: [SV_Barycentrics] (BaryCoordKHR) todavía no está soportado por el compilador de
    YotsubaShader.
```

## YS0220: Struct de interfaz anidado

**Severidad:** Error

**Mensaje:** '…' es un struct dentro de un struct de interfaz. Declara sus campos directamente en '…'.

Shader que lo provoca:

```csharp
public struct Inner { public float A; } public struct Outer { [SV_Position] public float4 P; public Inner I; } public class S { [ShaderStage(Stage.Vertex)] public Outer VS([POSITION] float4 p) { Outer o; o.P = p; o.I.A = 1f; return o; } }
```

```text
error YS0220: 'I' es un struct dentro de un struct de interfaz. Declara sus campos directamente
    en 'Outer'.
```

## YS0221: Vertex shader sin posición

**Severidad:** Aviso

**Mensaje:** El vertex shader '…' no escribe SV_Position; la GPU no podrá rasterizar sus primitivas.

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Vertex)] [return: TEXCOORD(0)] public float4 VS([POSITION] float4 p) { return p; } }
```

```text
warning YS0221: El vertex shader 'VS' no escribe SV_Position; la GPU no podrá rasterizar sus
    primitivas.
```


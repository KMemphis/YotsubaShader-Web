---
title: "Recursos"
summary: "Errores sobre texturas, samplers y buffers: bindings y layout de memoria."
order: 14
---

Errores sobre texturas, samplers y buffers: bindings y layout de memoria. 11 diagnósticos. Valen para cualquier shader, sea cual sea la API gráfica que declares. Los ids de los diagnósticos se describen en [Diagnósticos](diagnostics.md).

## YS0301: Recurso sin binding

**Severidad:** Error

**Mensaje:** '…' es … y no tiene binding. Añade [Binding(n)] (y [DescriptorSet(n)]), [register(...)] o [layout(set, binding)].

Shader que lo provoca:

```csharp
public class S { public Texture2D Tex; [ShaderStage(Stage.Fragment)] public float FS() { return 1f; } }
```

```text
error YS0301: 'Tex' es una textura y no tiene binding. Añade [Binding(n)] (y
    [DescriptorSet(n)]), [register(...)] o [layout(set, binding)].
```

Shader que lo provoca:

```csharp
public struct P { public float A; } public class S { public StructuredBuffer<P> Items; [ShaderStage(Stage.Fragment)] public float FS() { return 1f; } }
```

```text
error YS0301: 'Items' es un storage buffer y no tiene binding. Añade [Binding(n)] (y
    [DescriptorSet(n)]), [register(...)] o [layout(set, binding)].
```

## YS0302: Binding repetido

**Severidad:** Error

**Mensaje:** '…' y '…' usan el mismo set … y binding ….

Shader que lo provoca:

```csharp
public class S { [DescriptorSet(0)] [Binding(1)] public Texture2D A; [DescriptorSet(0)] [Binding(1)] public SamplerState B; [ShaderStage(Stage.Fragment)] public float FS() { return 1f; } }
```

```text
error YS0302: 'B' y 'A' usan el mismo set 0 y binding 1.
```

## YS0303: Binding negativo

**Severidad:** Error

**Mensaje:** '…' usa … …; debe ser 0 o mayor.

*Este diagnóstico todavía no tiene un shader de ejemplo.*

## YS0304: Registro HLSL de otro tipo

**Severidad:** Error

**Mensaje:** '…' es … y usa el registro '…'; para este recurso el prefijo es '…'.

Shader que lo provoca:

```csharp
public class S { [register("s0")] public Texture2D Tex; [ShaderStage(Stage.Fragment)] public float FS() { return 1f; } }
```

```text
error YS0304: 'Tex' es una textura y usa el registro 's'; para este recurso el prefijo es 't'.
```

## YS0305: Buffer que no es struct

**Severidad:** Error

**Mensaje:** '…' es un buffer y su tipo '…' no es un struct. Envuelve los datos en un struct.

Shader que lo provoca:

```csharp
public class S { [Uniform] [DescriptorSet(0)] [Binding(0)] public float Time; [ShaderStage(Stage.Fragment)] public float FS() { return 1f; } }
```

```text
error YS0305: 'Time' es un buffer y su tipo 'float' no es un struct. Envuelve los datos en un
    struct.
```

Shader que lo provoca:

```csharp
public class S { [DescriptorSet(0)] [Binding(0)] public ConstantBuffer<float> Time; [ShaderStage(Stage.Fragment)] public float FS() { return 1f; } }
```

```text
error YS0305: 'Time' es un buffer y su tipo 'float' no es un struct. Envuelve los datos en un
    struct.
```

## YS0306: Recurso declarado mal

**Severidad:** Error

**Mensaje:** '…' …. Declara los recursos como campos de instancia del shader.

Shader que lo provoca:

```csharp
public struct P { public float4 C; } public class S { [Uniform] [DescriptorSet(0)] [Binding(0)] public P Globals { get; set; } [ShaderStage(Stage.Fragment)] public float FS() { return 1f; } }
```

```text
error YS0306: 'Globals' es una propiedad. Declara los recursos como campos de instancia del
    shader.
```

## YS0307: Tipo no válido en un buffer

**Severidad:** Error

**Mensaje:** '…' en el buffer '…' es '…': ….

Shader que lo provoca:

```csharp
public struct P { public bool Flag; } public class S { [Uniform] [DescriptorSet(0)] [Binding(0)] public P Globals; [ShaderStage(Stage.Fragment)] public float FS() { return 1f; } }
```

```text
error YS0307: 'Flag' en el buffer 'Globals' es 'bool': bool no está permitido en un buffer
    compartido con la CPU; usa uint.
```

Shader que lo provoca:

```csharp
public class S { [DescriptorSet(0)] [Binding(0)] public StructuredBuffer<bool> Flags; [ShaderStage(Stage.Fragment)] public float FS() { return 1f; } }
```

```text
error YS0307: 'T' en el buffer 'Flags' es 'bool': bool no está permitido en un buffer compartido
    con la CPU; usa uint.
```

## YS0308: Escritura en un buffer de solo lectura

**Severidad:** Error

**Mensaje:** '…' es un buffer de solo lectura y no se puede escribir.

Shader que lo provoca:

```csharp
public struct D { public float[] V; } public class S { [YotsubaShader.WgslSyntax.Resources.storage(YotsubaShader.WgslSyntax.Resources.storage_use.read)] [DescriptorSet(0)] [Binding(0)] public D Data; [ShaderStage(Stage.Compute)] [numthreads(1,1,1)] public void CS() { Data.V[0] = 1f; } }
```

```text
error YS0308: 'Data' es un buffer de solo lectura y no se puede escribir.
```

## YS0309: Location en un recurso

**Severidad:** Error

**Mensaje:** '…' es un recurso y tiene […]. Los recursos se enlazan con [Binding]/[DescriptorSet], no con locations ni semánticas.

Shader que lo provoca:

```csharp
public class S { [DescriptorSet(0)] [Binding(0)] [TEXCOORD(0)] public Texture2D Tex; [ShaderStage(Stage.Fragment)] public float FS() { return 1f; } }
```

```text
error YS0309: 'Tex' es un recurso y tiene [TEXCOORD]. Los recursos se enlazan con
    [Binding]/[DescriptorSet], no con locations ni semánticas.
```

## YS0310: Campo sin significado en la GPU

**Severidad:** Error

**Mensaje:** El campo '…' no es un recurso. Para pasar valores desde la CPU agrúpalos en un struct con [Uniform] y [Binding].

Shader que lo provoca:

```csharp
public class S { public float Scale; [ShaderStage(Stage.Fragment)] public float FS() { return 1f; } }
```

```text
error YS0310: El campo 'Scale' no es un recurso. Para pasar valores desde la CPU agrúpalos en un
    struct con [Uniform] y [Binding].
```

## YS0311: Array sin tamaño en mitad del buffer

**Severidad:** Error

**Mensaje:** '…' es un array sin tamaño y no es el último miembro de '…'. Solo el último miembro de un storage buffer puede no tener tamaño.

*Este diagnóstico todavía no tiene un shader de ejemplo.*


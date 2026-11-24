---
title: API de la sintaxis WGSL
summary: Todos los atributos y tipos del paquete YotsubaShader.WgslSyntax, con su declaración, su concepto y un ejemplo.
order: 5
---

API del paquete `YotsubaShader.WgslSyntax`: los 24 atributos y los tipos de la sintaxis WGSL, inspirada en **WGSL (WebGPU)**. Cada entrada muestra la declaración tal como la escribe el paquete, el concepto que el compilador lee de ella, el mismo concepto en las otras cuatro sintaxis y un ejemplo.

Agrega el paquete al proyecto de shaders:

```bash
dotnet add package YotsubaShader.WgslSyntax
```

Para un recorrido guiado por la sintaxis, con cada valor integrado agrupado por etapa, mira la página [Sintaxis WGSL](../reference/wgsl.md) de la Documentación.

## Espacios de nombres

El paquete reparte su API en estos espacios de nombres. Los atributos comunes a todas las sintaxis (`ShaderStage`, `Location`, `Uniform`...) están en `YotsubaShader.Language`.

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax; // Valores integrados, ranuras de interfaz y atributos de método
using YotsubaShader.WgslSyntax.Resources; // Atributos de recursos y tipos de recursos
using YotsubaShader.WgslSyntax.Resources.Types; // Tipos de texturas y samplers
using YotsubaShader.WgslSyntax.Types; // Tipos de vectores, matrices y auxiliares
```

## Atributos de entrada

Campos, parámetros y propiedades que reciben un valor del pipeline.

### @builtin_front_facing

`true` cuando el fragmento pertenece a una primitiva de cara frontal.

```csharp
namespace YotsubaShader.WgslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[FrontFacingFlag]
public class @builtin_front_facing : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.WgslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `FrontFacingFlag`
- **El mismo concepto en:** HLSL [SV_IsFrontFace](hlsl.md#sv-isfrontface) · GLSL [gl_FrontFacing](glsl.md#gl-frontfacing) · MSL [front_facing](msl.md#front-facing) · SPIR-V [BuiltIn_FrontFacing](spirv.md#builtin-frontfacing)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;

// Entrada de la etapa de fragmentos
public struct FragmentInput
{
    [@builtin_front_facing] public bool IsFrontFace;
}
```

### @builtin_global_invocation_id

Posición de la invocación en todo el dispatch.

```csharp
namespace YotsubaShader.WgslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[GlobalInvocationId]
public class @builtin_global_invocation_id : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.WgslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `GlobalInvocationId`
- **El mismo concepto en:** HLSL [SV_DispatchThreadID](hlsl.md#sv-dispatchthreadid) · GLSL [gl_GlobalInvocationID](glsl.md#gl-globalinvocationid) · MSL [thread_position_in_grid](msl.md#thread-position-in-grid) · SPIR-V [BuiltIn_GlobalInvocationId](spirv.md#builtin-globalinvocationid)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;
using YotsubaShader.WgslSyntax.Types;

// Entrada de la etapa compute
public struct ComputeInput
{
    [@builtin_global_invocation_id] public vec3<uint> GlobalId;
}
```

### @builtin_instance_index

Índice de la instancia que se está dibujando.

```csharp
namespace YotsubaShader.WgslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[InstanceIndex]
public class @builtin_instance_index : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.WgslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `InstanceIndex`
- **El mismo concepto en:** HLSL [SV_InstanceID](hlsl.md#sv-instanceid) · GLSL [gl_InstanceIndex](glsl.md#gl-instanceindex) · MSL [instance_id](msl.md#instance-id) · SPIR-V [BuiltIn_InstanceIndex](spirv.md#builtin-instanceindex)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;

// Entrada de la etapa de vértices
public struct VertexInput
{
    [@builtin_instance_index] public uint InstanceIndex;
}
```

### @builtin_local_invocation_id

Posición de la invocación dentro de su grupo de trabajo.

```csharp
namespace YotsubaShader.WgslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[LocalInvocationId]
public class @builtin_local_invocation_id : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.WgslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `LocalInvocationId`
- **El mismo concepto en:** HLSL [SV_GroupThreadID](hlsl.md#sv-groupthreadid) · GLSL [gl_LocalInvocationID](glsl.md#gl-localinvocationid) · MSL [thread_position_in_threadgroup](msl.md#thread-position-in-threadgroup) · SPIR-V [BuiltIn_LocalInvocationId](spirv.md#builtin-localinvocationid)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;
using YotsubaShader.WgslSyntax.Types;

// Entrada de la etapa compute
public struct ComputeInput
{
    [@builtin_local_invocation_id] public vec3<uint> LocalId;
}
```

### @builtin_local_invocation_index

Índice aplanado de la invocación dentro de su grupo de trabajo.

```csharp
namespace YotsubaShader.WgslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[LocalInvocationIndex]
public class @builtin_local_invocation_index : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.WgslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `LocalInvocationIndex`
- **El mismo concepto en:** HLSL [SV_GroupIndex](hlsl.md#sv-groupindex) · GLSL [gl_LocalInvocationIndex](glsl.md#gl-localinvocationindex) · MSL [thread_index_in_threadgroup](msl.md#thread-index-in-threadgroup) · SPIR-V [BuiltIn_LocalInvocationIndex](spirv.md#builtin-localinvocationindex)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;

// Entrada de la etapa compute
public struct ComputeInput
{
    [@builtin_local_invocation_index] public uint LocalIndex;
}
```

### @builtin_num_subgroups

Cantidad de subgrupos del grupo de trabajo.

```csharp
namespace YotsubaShader.WgslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[NumberOfSubgroups]
public class @builtin_num_subgroups : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.WgslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `NumberOfSubgroups`
- **El mismo concepto en:** GLSL [gl_NumSubgroups](glsl.md#gl-numsubgroups) · MSL [simdgroups_per_threadgroup](msl.md#simdgroups-per-threadgroup) · SPIR-V [BuiltIn_NumSubgroups](spirv.md#builtin-numsubgroups)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;

// Entrada de la etapa compute
public struct ComputeInput
{
    [@builtin_num_subgroups] public uint SubgroupCount;
}
```

### @builtin_num_workgroups

Cantidad de grupos de trabajo del dispatch.

```csharp
namespace YotsubaShader.WgslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[NumberOfWorkgroups]
public class @builtin_num_workgroups : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.WgslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `NumberOfWorkgroups`
- **El mismo concepto en:** GLSL [gl_NumWorkGroups](glsl.md#gl-numworkgroups) · MSL [threadgroups_per_grid](msl.md#threadgroups-per-grid) · SPIR-V [BuiltIn_NumWorkgroups](spirv.md#builtin-numworkgroups)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;
using YotsubaShader.WgslSyntax.Types;

// Entrada de la etapa compute
public struct ComputeInput
{
    [@builtin_num_workgroups] public vec3<uint> GroupCount;
}
```

### @builtin_primitive_index

Índice de la primitiva a la que pertenece el fragmento.

```csharp
namespace YotsubaShader.WgslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[PrimitiveIndex]
public class @builtin_primitive_index : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.WgslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `PrimitiveIndex`
- **El mismo concepto en:** HLSL [SV_PrimitiveID](hlsl.md#sv-primitiveid) · GLSL [gl_PrimitiveID](glsl.md#gl-primitiveid) · MSL [primitive_id](msl.md#primitive-id) · SPIR-V [BuiltIn_PrimitiveId](spirv.md#builtin-primitiveid)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;

// Entrada de la etapa de fragmentos
public struct FragmentInput
{
    [@builtin_primitive_index] public uint PrimitiveId;
}
```

### @builtin_sample_index

Índice de la muestra que se está sombreando (multimuestreo).

```csharp
namespace YotsubaShader.WgslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[SampleIndex]
public class @builtin_sample_index : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.WgslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `SampleIndex`
- **El mismo concepto en:** HLSL [SV_SampleIndex](hlsl.md#sv-sampleindex) · GLSL [gl_SampleID](glsl.md#gl-sampleid) · MSL [sample_id](msl.md#sample-id) · SPIR-V [BuiltIn_SampleId](spirv.md#builtin-sampleid)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;

// Entrada de la etapa de fragmentos
public struct FragmentInput
{
    [@builtin_sample_index] public uint SampleIndex;
}
```

### @builtin_subgroup_id

Índice del subgrupo dentro del grupo de trabajo.

```csharp
namespace YotsubaShader.WgslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[SubgroupId]
public class @builtin_subgroup_id : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.WgslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `SubgroupId`
- **El mismo concepto en:** GLSL [gl_SubgroupID](glsl.md#gl-subgroupid) · MSL [simdgroup_index_in_threadgroup](msl.md#simdgroup-index-in-threadgroup) · SPIR-V [BuiltIn_SubgroupId](spirv.md#builtin-subgroupid)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;

// Entrada de la etapa compute
public struct ComputeInput
{
    [@builtin_subgroup_id] public uint SubgroupId;
}
```

### @builtin_subgroup_invocation_id

Índice de la invocación dentro de su subgrupo.

```csharp
namespace YotsubaShader.WgslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[SubgroupInvocationId]
public class @builtin_subgroup_invocation_id : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.WgslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `SubgroupInvocationId`
- **El mismo concepto en:** GLSL [gl_SubgroupInvocationID](glsl.md#gl-subgroupinvocationid) · MSL [thread_index_in_simdgroup](msl.md#thread-index-in-simdgroup) · SPIR-V [BuiltIn_SubgroupInvocationId](spirv.md#builtin-subgroupinvocationid)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;

// Entrada de la etapa compute
public struct ComputeInput
{
    [@builtin_subgroup_invocation_id] public uint SubgroupLane;
}
```

### @builtin_subgroup_size

Cantidad de invocaciones de un subgrupo.

```csharp
namespace YotsubaShader.WgslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[SubgroupSize]
public class @builtin_subgroup_size : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.WgslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `SubgroupSize`
- **El mismo concepto en:** GLSL [gl_SubgroupSize](glsl.md#gl-subgroupsize) · MSL [threads_per_simdgroup](msl.md#threads-per-simdgroup) · SPIR-V [BuiltIn_SubgroupSize](spirv.md#builtin-subgroupsize)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;

// Entrada de la etapa compute
public struct ComputeInput
{
    [@builtin_subgroup_size] public uint SubgroupSize;
}
```

### @builtin_vertex_index

Índice del vértice que se está procesando.

```csharp
namespace YotsubaShader.WgslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[VertexIndex]
public class @builtin_vertex_index : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.WgslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `VertexIndex`
- **El mismo concepto en:** HLSL [SV_VertexID](hlsl.md#sv-vertexid) · GLSL [gl_VertexIndex](glsl.md#gl-vertexindex) · MSL [vertex_id](msl.md#vertex-id) · SPIR-V [BuiltIn_VertexIndex](spirv.md#builtin-vertexindex)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;

// Entrada de la etapa de vértices
public struct VertexInput
{
    [@builtin_vertex_index] public uint VertexIndex;
}
```

### @builtin_workgroup_id

Posición del grupo de trabajo en el dispatch.

```csharp
namespace YotsubaShader.WgslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[WorkgroupId]
public class @builtin_workgroup_id : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.WgslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `WorkgroupId`
- **El mismo concepto en:** HLSL [SV_GroupID](hlsl.md#sv-groupid) · GLSL [gl_WorkGroupID](glsl.md#gl-workgroupid) · MSL [threadgroup_position_in_grid](msl.md#threadgroup-position-in-grid) · SPIR-V [BuiltIn_WorkgroupId](spirv.md#builtin-workgroupid)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;
using YotsubaShader.WgslSyntax.Types;

// Entrada de la etapa compute
public struct ComputeInput
{
    [@builtin_workgroup_id] public vec3<uint> GroupId;
}
```

## Atributos de salida

Campos, parámetros y valores de retorno que produce la etapa.

### @builtin_clip_distances

Distancia de recorte: un valor negativo recorta la primitiva contra un plano del usuario.

```csharp
namespace YotsubaShader.WgslSyntax;

[AttributeUsage(AttributeUsagesTable.Output)]
[ClipInstance]
public class @builtin_clip_distances : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.WgslSyntax`
- **Se aplica a:** campos, parámetros, valores de retorno
- **Concepto:** `ClipInstance`
- **El mismo concepto en:** HLSL [SV_ClipDistanceN](hlsl.md#sv-clipdistancen) · GLSL [gl_ClipDistance](glsl.md#gl-clipdistance) · MSL [clip_distance](msl.md#clip-distance) · SPIR-V [BuiltIn_ClipDistance](spirv.md#builtin-clipdistance)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;

// Salida de la etapa de vértices
public struct VertexOutput
{
    [@builtin_clip_distances] public float ClipDistance;
}
```

### @builtin_frag_depth

Profundidad que escribe la etapa de fragmentos, en lugar de la interpolada.

```csharp
namespace YotsubaShader.WgslSyntax;

[AttributeUsage(AttributeUsagesTable.Output)]
[FragDepth]
public class @builtin_frag_depth(string mode = "") : YotsubaShaderConcept
{
    public string Mode { get; }
}
```

- **Espacio de nombres:** `YotsubaShader.WgslSyntax`
- **Se aplica a:** campos, parámetros, valores de retorno
- **Concepto:** `FragDepth`
- **El mismo concepto en:** HLSL [SV_Depth](hlsl.md#sv-depth) · GLSL [gl_FragDepth](glsl.md#gl-fragdepth) · MSL [depth](msl.md#depth) · SPIR-V [BuiltIn_FragDepth](spirv.md#builtin-fragdepth)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;

// Salida de la etapa de fragmentos
public struct FragmentOutput
{
    [@builtin_frag_depth] public float Depth;
}
```

## Atributos de entrada y salida

Valores que una etapa puede recibir o producir. La etapa decide cuál.

### @builtin_position

Posición en espacio de recorte que escribe la etapa de vértices.

```csharp
namespace YotsubaShader.WgslSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[ClipSpacePosition, FragmentCoordinate]
public class @builtin_position : ClipSpacePosition;
```

- **Espacio de nombres:** `YotsubaShader.WgslSyntax`
- **Se aplica a:** campos, parámetros, propiedades, valores de retorno
- **Concepto:** `ClipSpacePosition`, `FragmentCoordinate`
- **El mismo concepto en:** HLSL [SV_Position](hlsl.md#sv-position), [SV_POSITION](hlsl.md#sv-position) · GLSL [gl_Position](glsl.md#gl-position), [gl_FragCoord](glsl.md#gl-fragcoord) · MSL [position](msl.md#position) · SPIR-V [BuiltIn_Position](spirv.md#builtin-position), [BuiltIn_FragCoord](spirv.md#builtin-fragcoord)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;
using YotsubaShader.WgslSyntax.Types;

// Salida de la etapa de vértices
public struct VertexOutput
{
    [@builtin_position] public vec4<float> Position;
}
```

### @builtin_sample_mask

Máscara de cobertura de las muestras del fragmento.

```csharp
namespace YotsubaShader.WgslSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[SampleMask]
public class @builtin_sample_mask : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.WgslSyntax`
- **Se aplica a:** campos, parámetros, propiedades, valores de retorno
- **Concepto:** `SampleMask`
- **El mismo concepto en:** HLSL [SV_Coverage](hlsl.md#sv-coverage) · GLSL [gl_SampleMask](glsl.md#gl-samplemask), [gl_SampleMaskIn](glsl.md#gl-samplemaskin) · MSL [sample_mask](msl.md#sample-mask) · SPIR-V [BuiltIn_SampleMask](spirv.md#builtin-samplemask)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;

// Entrada de la etapa de fragmentos
public struct FragmentInput
{
    [@builtin_sample_mask] public uint SampleMask;
}
```

### @location

Ranura numerada de la interfaz: entradas de vértice, valores que pasan entre etapas y salidas de fragmento.

```csharp
namespace YotsubaShader.WgslSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[Location]
public class @location(int n) : YotsubaShaderConcept
{
    public int N;
}
```

- **Espacio de nombres:** `YotsubaShader.WgslSyntax`
- **Se aplica a:** campos, parámetros, propiedades, valores de retorno
- **Concepto:** `Location`
- **El mismo concepto en:** HLSL [SV_Target](hlsl.md#sv-target) · GLSL [location](glsl.md#location) · MSL [attribute](msl.md#attribute), [color](msl.md#color) · SPIR-V [Location](spirv.md#location)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;
using YotsubaShader.WgslSyntax.Types;

// Salida de la etapa de vértices
public struct VertexOutput
{
    [@location(0)] public vec4<float> Color;
}
```

## Atributos de método

Atributos que se aplican a un método punto de entrada.

### @workgroup_size

Fija el tamaño del grupo de trabajo de un punto de entrada compute.

```csharp
namespace YotsubaShader.WgslSyntax;

[AttributeUsage(AttributeUsagesTable.Method)]
[WorkgroupSizeMethod]
public class @workgroup_size(uint x, uint y = 1, uint z = 1) : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.WgslSyntax`
- **Se aplica a:** métodos
- **Concepto:** `WorkgroupSizeMethod`
- **El mismo concepto en:** HLSL [numthreads](hlsl.md#numthreads) · GLSL [layout_local_size](glsl.md#layout-local-size)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;

public class Blur
{
    // Punto de entrada compute
    [ShaderStage(Stage.Compute)]
    [@workgroup_size(8)]
    public void Main() { }
}
```

## Atributos de recursos

Buffers uniformes, storage buffers y las ranuras de binding de buffers, texturas y samplers.

### @binding

Número de binding de un recurso dentro de su grupo.

```csharp
namespace YotsubaShader.WgslSyntax.Resources;

[AttributeUsage(AttributeUsagesTable.Resource)]
[BindingSlot, TextureSlot, SamplerSlot]
public class @binding(int n) : YotsubaShaderConcept
{
    public int N;
}
```

- **Espacio de nombres:** `YotsubaShader.WgslSyntax.Resources`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `BindingSlot`, `TextureSlot`, `SamplerSlot`
- **El mismo concepto en:** HLSL [register](hlsl.md#register) · GLSL [layout](glsl.md#layout) · MSL [buffer](msl.md#buffer), [sampler](msl.md#sampler), [texture](msl.md#texture) · SPIR-V [Binding](spirv.md#binding), [DescriptorSet](spirv.md#descriptorset)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;
using YotsubaShader.WgslSyntax.Resources;
using YotsubaShader.WgslSyntax.Resources.Types;

public class Surface
{
    [@group(0), @binding(0)]
    public texture_2d<float> Albedo;
}
```

### @group

Grupo de binding de un recurso. Se usa junto con `@binding`.

```csharp
namespace YotsubaShader.WgslSyntax.Resources;

[AttributeUsage(AttributeUsagesTable.Resource)]
[BindingSlot, TextureSlot, SamplerSlot]
public class @group(int s) : YotsubaShaderConcept
{
    public int S;
}
```

- **Espacio de nombres:** `YotsubaShader.WgslSyntax.Resources`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `BindingSlot`, `TextureSlot`, `SamplerSlot`
- **El mismo concepto en:** HLSL [register](hlsl.md#register) · GLSL [layout](glsl.md#layout) · MSL [buffer](msl.md#buffer), [sampler](msl.md#sampler), [texture](msl.md#texture) · SPIR-V [Binding](spirv.md#binding), [DescriptorSet](spirv.md#descriptorset)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;
using YotsubaShader.WgslSyntax.Resources;
using YotsubaShader.WgslSyntax.Resources.Types;

public class Surface
{
    [@group(0), @binding(0)]
    public texture_2d<float> Albedo;
}
```

### storage

Storage buffer. `storage_use.read` lo hace de solo lectura y `storage_use.read_write` de lectura y escritura.

```csharp
namespace YotsubaShader.WgslSyntax.Resources;

[AttributeUsage(AttributeUsagesTable.Resource)]
[RWStorageBuffer, ReadOnlyStorageBuffer]
public class storage(storage_use use) : YotsubaShaderConcept
{
    public storage_use Use;
}
```

- **Espacio de nombres:** `YotsubaShader.WgslSyntax.Resources`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `RWStorageBuffer`, `ReadOnlyStorageBuffer`
- **El mismo concepto en:** GLSL [buffer](glsl.md#buffer) · MSL [device](msl.md#device) · SPIR-V [StorageBuffer](spirv.md#storagebuffer)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;
using YotsubaShader.WgslSyntax.Resources;

public class Resources
{
    [storage(storage_use.read_write), @group(0), @binding(1)]
    public float[] Output;
}
```

### uniform

Marca el campo como un buffer uniforme (constante).

```csharp
namespace YotsubaShader.WgslSyntax.Resources;

[AttributeUsage(AttributeUsagesTable.Resource)]
[UniformBuffer]
public class uniform : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.WgslSyntax.Resources`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `UniformBuffer`
- **El mismo concepto en:** HLSL [cbuffer](hlsl.md#cbuffer) · GLSL [uniform](glsl.md#uniform) · MSL [constant](msl.md#constant) · SPIR-V [Uniform](spirv.md#uniform)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;
using YotsubaShader.WgslSyntax.Resources;

public struct Material
{
    // El contenido del buffer uniforme
    public float Exposure;
}

public class Resources
{
    [uniform, @group(0), @binding(0)]
    public Material Material;
}
```

## Tipos

Los tipos que declara el paquete. Los miembros aparecen sin su cuerpo.

### Tipos de recursos

```csharp
namespace YotsubaShader.WgslSyntax.Resources;

public enum storage_use : int { read = 0, read_write = 1 }
```

### Tipos de texturas y samplers

```csharp
namespace YotsubaShader.WgslSyntax.Resources.Types;

[Sampler]
public struct sampler;

[Sampler]
public struct sampler_comparison;

[Texture(TextureDimension.D1, TextureComponentTypes.GenericDefine)]
public struct texture_1d<T> where T : unmanaged;

[Texture(TextureDimension.D2, TextureComponentTypes.GenericDefine)]
public struct texture_2d<T> where T : unmanaged;

[Texture(TextureDimension.D2, TextureComponentTypes.GenericDefine, Arrayed = true)]
public struct texture_2d_array<T> where T : unmanaged;

[Texture(TextureDimension.D3, TextureComponentTypes.GenericDefine)]
public struct texture_3d<T> where T : unmanaged;

[Texture(TextureDimension.Cube, TextureComponentTypes.GenericDefine)]
public struct texture_cube<T> where T : unmanaged;

[Texture(TextureDimension.Cube, TextureComponentTypes.GenericDefine, Arrayed = true)]
public struct texture_cube_array<T> where T : unmanaged;

[Texture(TextureDimension.D2, TextureComponentTypes.Float, Depth = TextureDepth.Yes)]
public struct texture_depth_2d;

[Texture(TextureDimension.D2, TextureComponentTypes.Float, Depth = TextureDepth.Yes, Arrayed = true)]
public struct texture_depth_2d_array;

[Texture(TextureDimension.Cube, TextureComponentTypes.Float, Depth = TextureDepth.Yes)]
public struct texture_depth_cube;

[Texture(TextureDimension.Cube, TextureComponentTypes.Float, Depth = TextureDepth.Yes, Arrayed = true)]
public struct texture_depth_cube_array;

[Texture(TextureDimension.D2, TextureComponentTypes.Float, Depth = TextureDepth.Yes, Multisampled = true)]
public struct texture_depth_multisampled_2d;

[Texture(TextureDimension.D2, TextureComponentTypes.Float)]
public struct texture_external;

[Texture(TextureDimension.D2, TextureComponentTypes.GenericDefine, Multisampled = true)]
public struct texture_multisampled_2d<T> where T : unmanaged;

[Texture(TextureDimension.D1, TextureComponentTypes.GenericDefine, Usage = TextureUsage.Storage)]
public struct texture_storage_1d<T1, T2>;

[Texture(TextureDimension.D2, TextureComponentTypes.GenericDefine, Usage = TextureUsage.Storage)]
public struct texture_storage_2d<T1, T2>;

[Texture(TextureDimension.D2, TextureComponentTypes.GenericDefine, Arrayed = true, Usage = TextureUsage.Storage)]
public struct texture_storage_2d_array<T1, T2>;

[Texture(TextureDimension.D3, TextureComponentTypes.GenericDefine, Usage = TextureUsage.Storage)]
public struct texture_storage_3d<T1, T2>;
```

### Tipos de vectores, matrices y auxiliares

```csharp
namespace YotsubaShader.WgslSyntax.Types;

public struct __frexp_result_f16
{
    public System.Half fract;
    public int exp;
}

public struct __frexp_result_f32
{
    public float fract;
    public int exp;
}

public struct __frexp_result_vec2_f16
{
    public vec2<System.Half> fract;
    public vec2<int> exp;
}

public struct __frexp_result_vec2_f32
{
    public vec2<float> fract;
    public vec2<int> exp;
}

public struct __frexp_result_vec3_f16
{
    public vec3<System.Half> fract;
    public vec3<int> exp;
}

public struct __frexp_result_vec3_f32
{
    public vec3<float> fract;
    public vec3<int> exp;
}

public struct __frexp_result_vec4_f16
{
    public vec4<System.Half> fract;
    public vec4<int> exp;
}

public struct __frexp_result_vec4_f32
{
    public vec4<float> fract;
    public vec4<int> exp;
}

public struct __modf_result_f16
{
    public System.Half fract;
    public System.Half whole;
}

public struct __modf_result_f32
{
    public float fract;
    public float whole;
}

public struct __modf_result_vec2_f16
{
    public vec2<System.Half> fract;
    public vec2<System.Half> whole;
}

public struct __modf_result_vec2_f32
{
    public vec2<float> fract;
    public vec2<float> whole;
}

public struct __modf_result_vec3_f16
{
    public vec3<System.Half> fract;
    public vec3<System.Half> whole;
}

public struct __modf_result_vec3_f32
{
    public vec3<float> fract;
    public vec3<float> whole;
}

public struct __modf_result_vec4_f16
{
    public vec4<System.Half> fract;
    public vec4<System.Half> whole;
}

public struct __modf_result_vec4_f32
{
    public vec4<float> fract;
    public vec4<float> whole;
}

[Matrix]
public partial struct mat2x2<T> where T : unmanaged
{
    [MatrixColumn(0)]
    public vec2<T> C0;
    [MatrixColumn(1)]
    public vec2<T> C1;
}

[Matrix]
public partial struct mat2x3<T> where T : unmanaged
{
    [MatrixColumn(0)]
    public vec3<T> C0;
    [MatrixColumn(1)]
    public vec3<T> C1;
}

[Matrix]
public partial struct mat2x4<T> where T : unmanaged
{
    [MatrixColumn(0)]
    public vec4<T> C0;
    [MatrixColumn(1)]
    public vec4<T> C1;
}

[Matrix]
public partial struct mat3x2<T> where T : unmanaged
{
    [MatrixColumn(0)]
    public vec2<T> C0;
    [MatrixColumn(1)]
    public vec2<T> C1;
    [MatrixColumn(2)]
    public vec2<T> C2;
}

[Matrix]
public partial struct mat3x3<T> where T : unmanaged
{
    [MatrixColumn(0)]
    public vec3<T> C0;
    [MatrixColumn(1)]
    public vec3<T> C1;
    [MatrixColumn(2)]
    public vec3<T> C2;
}

[Matrix]
public partial struct mat3x4<T> where T : unmanaged
{
    [MatrixColumn(0)]
    public vec4<T> C0;
    [MatrixColumn(1)]
    public vec4<T> C1;
    [MatrixColumn(2)]
    public vec4<T> C2;
}

[Matrix]
public partial struct mat4x2<T> where T : unmanaged
{
    [MatrixColumn(0)]
    public vec2<T> C0;
    [MatrixColumn(1)]
    public vec2<T> C1;
    [MatrixColumn(2)]
    public vec2<T> C2;
    [MatrixColumn(3)]
    public vec2<T> C3;
}

[Matrix]
public partial struct mat4x3<T> where T : unmanaged
{
    [MatrixColumn(0)]
    public vec3<T> C0;
    [MatrixColumn(1)]
    public vec3<T> C1;
    [MatrixColumn(2)]
    public vec3<T> C2;
    [MatrixColumn(3)]
    public vec3<T> C3;
}

[Matrix]
public partial struct mat4x4<T> where T : unmanaged
{
    [MatrixColumn(0)]
    public vec4<T> C0;
    [MatrixColumn(1)]
    public vec4<T> C1;
    [MatrixColumn(2)]
    public vec4<T> C2;
    [MatrixColumn(3)]
    public vec4<T> C3;
}

[Vector]
public partial struct vec2<T> where T : unmanaged
{
    [VectorComponent(0)]
    public T X;
    [VectorComponent(1)]
    public T Y;
}

[Vector]
public partial struct vec3<T> where T : unmanaged
{
    [VectorComponent(0)]
    public T X;
    [VectorComponent(1)]
    public T Y;
    [VectorComponent(2)]
    public T Z;
}

[Vector]
public partial struct vec4<T> where T : unmanaged
{
    [VectorComponent(0)]
    public T X;
    [VectorComponent(1)]
    public T Y;
    [VectorComponent(2)]
    public T Z;
    [VectorComponent(3)]
    public T W;
}
```

> [!NOTE]
> Los listados muestran lo que declara el paquete. No todos los conceptos los traduce cada destino de salida.

## Las otras sintaxis

```buttons
[HLSL](hlsl.md)
[GLSL](glsl.md)
[MSL](msl.md)
[SPIR-V](spirv.md)
```

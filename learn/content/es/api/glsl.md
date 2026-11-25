---
title: API de la sintaxis GLSL
summary: Todos los atributos y tipos del paquete YotsubaShader.GlslSyntax, con su declaración, su concepto y un ejemplo.
order: 2
---

API del paquete `YotsubaShader.GlslSyntax`: los 35 atributos y los tipos de la sintaxis GLSL, inspirada en **GLSL (OpenGL / Vulkan GLSL)**. Cada entrada muestra la declaración tal como la escribe el paquete, el concepto que el compilador lee de ella, el mismo concepto en las otras cuatro sintaxis y un ejemplo.

Agrega el paquete al proyecto de shaders:

```bash
dotnet add package YotsubaShader.GlslSyntax
```

Para un recorrido guiado por la sintaxis, con cada valor integrado agrupado por etapa, mira la página [Sintaxis GLSL](../reference/glsl.md) de la Documentación.

## Espacios de nombres

El paquete reparte su API en estos espacios de nombres. Los atributos comunes a todas las sintaxis (`ShaderStage`, `Location`, `Uniform`...) están en `YotsubaShader.Language`.

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax; // Valores integrados, ranuras de interfaz y atributos de método
using YotsubaShader.GlslSyntax.Resources; // Atributos de recursos y tipos de recursos
using YotsubaShader.GlslSyntax.Resources.Types; // Tipos de texturas y samplers
using YotsubaShader.GlslSyntax.Types; // Tipos de vectores, matrices y auxiliares
```

## Atributos de entrada

Campos, parámetros y propiedades que reciben un valor del pipeline.

### gl_BaryCoordEXT

Coordenadas baricéntricas del fragmento dentro de su triángulo.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[BarycentricCoordinates]
public class gl_BaryCoordEXT : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.GlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `BarycentricCoordinates`
- **El mismo concepto en:** HLSL [SV_Barycentrics](hlsl.md#sv-barycentrics) · MSL [barycentric_coord](msl.md#barycentric-coord) · SPIR-V [BuiltIn_BaryCoord](spirv.md#builtin-barycoord)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Types;

// Entrada de la etapa de fragmentos
public struct FragmentInput
{
    [gl_BaryCoordEXT] public vec3 Barycentrics;
}
```

### gl_BaryCoordNoPerspEXT

Coordenadas baricéntricas sin corrección de perspectiva.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[BarycentricCoordinatesNoPerspective]
public class gl_BaryCoordNoPerspEXT : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.GlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `BarycentricCoordinatesNoPerspective`
- **El mismo concepto en:** SPIR-V [BuiltIn_BaryCoordNoPersp](spirv.md#builtin-barycoordnopersp)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Types;

// Entrada de la etapa de fragmentos
public struct FragmentInput
{
    [gl_BaryCoordNoPerspEXT] public vec3 BarycentricsNoPersp;
}
```

### gl_BaseInstance

Instancia base de la llamada de dibujo.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[BaseInstance]
public class gl_BaseInstance : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.GlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `BaseInstance`
- **El mismo concepto en:** HLSL [SV_StartInstanceLocation](hlsl.md#sv-startinstancelocation) · MSL [base_instance](msl.md#base-instance) · SPIR-V [BuiltIn_BaseInstance](spirv.md#builtin-baseinstance)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

// Entrada de la etapa de vértices
public struct VertexInput
{
    [gl_BaseInstance] public int BaseInstance;
}
```

### gl_BaseVertex

Vértice base de la llamada de dibujo.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[BaseVertex]
public class gl_BaseVertex : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.GlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `BaseVertex`
- **El mismo concepto en:** HLSL [SV_StartVertexLocation](hlsl.md#sv-startvertexlocation) · MSL [base_vertex](msl.md#base-vertex) · SPIR-V [BuiltIn_BaseVertex](spirv.md#builtin-basevertex)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

// Entrada de la etapa de vértices
public struct VertexInput
{
    [gl_BaseVertex] public int BaseVertex;
}
```

### gl_FragCoord

Coordenada en ventana del fragmento, que lee la etapa de fragmentos.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[FragmentCoordinate]
public class gl_FragCoord : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.GlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `FragmentCoordinate`
- **El mismo concepto en:** HLSL [SV_Position](hlsl.md#sv-position), [SV_POSITION](hlsl.md#sv-position) · MSL [position](msl.md#position) · SPIR-V [BuiltIn_FragCoord](spirv.md#builtin-fragcoord) · WGSL [@builtin_position](wgsl.md#builtin-position)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Types;

// Entrada de la etapa de fragmentos
public struct FragmentInput
{
    [gl_FragCoord] public vec4 FragCoord;
}
```

### gl_FrontFacing

`true` cuando el fragmento pertenece a una primitiva de cara frontal.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[FrontFacingFlag]
public class gl_FrontFacing : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.GlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `FrontFacingFlag`
- **El mismo concepto en:** HLSL [SV_IsFrontFace](hlsl.md#sv-isfrontface) · MSL [front_facing](msl.md#front-facing) · SPIR-V [BuiltIn_FrontFacing](spirv.md#builtin-frontfacing) · WGSL [@builtin_front_facing](wgsl.md#builtin-front-facing)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

// Entrada de la etapa de fragmentos
public struct FragmentInput
{
    [gl_FrontFacing] public bool IsFrontFace;
}
```

### gl_GlobalInvocationID

Posición de la invocación en todo el dispatch.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[GlobalInvocationId]
public class gl_GlobalInvocationID : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.GlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `GlobalInvocationId`
- **El mismo concepto en:** HLSL [SV_DispatchThreadID](hlsl.md#sv-dispatchthreadid) · MSL [thread_position_in_grid](msl.md#thread-position-in-grid) · SPIR-V [BuiltIn_GlobalInvocationId](spirv.md#builtin-globalinvocationid) · WGSL [@builtin_global_invocation_id](wgsl.md#builtin-global-invocation-id)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Types;

// Entrada de la etapa compute
public struct ComputeInput
{
    [gl_GlobalInvocationID] public uvec3 GlobalId;
}
```

### gl_HelperInvocation

`true` en las invocaciones auxiliares, que solo corren para calcular derivadas.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[HelperInvocation]
public class gl_HelperInvocation : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.GlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `HelperInvocation`
- **El mismo concepto en:** SPIR-V [BuiltIn_HelperInvocation](spirv.md#builtin-helperinvocation)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

// Entrada de la etapa de fragmentos
public struct FragmentInput
{
    [gl_HelperInvocation] public bool IsHelper;
}
```

### gl_InstanceIndex

Índice de la instancia que se está dibujando.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[InstanceIndex]
public class gl_InstanceIndex : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.GlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `InstanceIndex`
- **El mismo concepto en:** HLSL [SV_InstanceID](hlsl.md#sv-instanceid) · MSL [instance_id](msl.md#instance-id) · SPIR-V [BuiltIn_InstanceIndex](spirv.md#builtin-instanceindex) · WGSL [@builtin_instance_index](wgsl.md#builtin-instance-index)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

// Entrada de la etapa de vértices
public struct VertexInput
{
    [gl_InstanceIndex] public int InstanceIndex;
}
```

### gl_LocalInvocationID

Posición de la invocación dentro de su grupo de trabajo.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[LocalInvocationId]
public class gl_LocalInvocationID : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.GlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `LocalInvocationId`
- **El mismo concepto en:** HLSL [SV_GroupThreadID](hlsl.md#sv-groupthreadid) · MSL [thread_position_in_threadgroup](msl.md#thread-position-in-threadgroup) · SPIR-V [BuiltIn_LocalInvocationId](spirv.md#builtin-localinvocationid) · WGSL [@builtin_local_invocation_id](wgsl.md#builtin-local-invocation-id)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Types;

// Entrada de la etapa compute
public struct ComputeInput
{
    [gl_LocalInvocationID] public uvec3 LocalId;
}
```

### gl_LocalInvocationIndex

Índice aplanado de la invocación dentro de su grupo de trabajo.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[LocalInvocationIndex]
public class gl_LocalInvocationIndex : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.GlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `LocalInvocationIndex`
- **El mismo concepto en:** HLSL [SV_GroupIndex](hlsl.md#sv-groupindex) · MSL [thread_index_in_threadgroup](msl.md#thread-index-in-threadgroup) · SPIR-V [BuiltIn_LocalInvocationIndex](spirv.md#builtin-localinvocationindex) · WGSL [@builtin_local_invocation_index](wgsl.md#builtin-local-invocation-index)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

// Entrada de la etapa compute
public struct ComputeInput
{
    [gl_LocalInvocationIndex] public uint LocalIndex;
}
```

### gl_NumSubgroups

Cantidad de subgrupos del grupo de trabajo.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[NumberOfSubgroups]
public class gl_NumSubgroups : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.GlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `NumberOfSubgroups`
- **El mismo concepto en:** MSL [simdgroups_per_threadgroup](msl.md#simdgroups-per-threadgroup) · SPIR-V [BuiltIn_NumSubgroups](spirv.md#builtin-numsubgroups) · WGSL [@builtin_num_subgroups](wgsl.md#builtin-num-subgroups)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

// Entrada de la etapa compute
public struct ComputeInput
{
    [gl_NumSubgroups] public uint SubgroupCount;
}
```

### gl_NumWorkGroups

Cantidad de grupos de trabajo del dispatch.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[NumberOfWorkgroups]
public class gl_NumWorkGroups : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.GlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `NumberOfWorkgroups`
- **El mismo concepto en:** MSL [threadgroups_per_grid](msl.md#threadgroups-per-grid) · SPIR-V [BuiltIn_NumWorkgroups](spirv.md#builtin-numworkgroups) · WGSL [@builtin_num_workgroups](wgsl.md#builtin-num-workgroups)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Types;

// Entrada de la etapa compute
public struct ComputeInput
{
    [gl_NumWorkGroups] public uvec3 GroupCount;
}
```

### gl_PrimitiveID

Índice de la primitiva a la que pertenece el fragmento.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[PrimitiveIndex]
public class gl_PrimitiveID : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.GlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `PrimitiveIndex`
- **El mismo concepto en:** HLSL [SV_PrimitiveID](hlsl.md#sv-primitiveid) · MSL [primitive_id](msl.md#primitive-id) · SPIR-V [BuiltIn_PrimitiveId](spirv.md#builtin-primitiveid) · WGSL [@builtin_primitive_index](wgsl.md#builtin-primitive-index)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

// Entrada de la etapa de fragmentos
public struct FragmentInput
{
    [gl_PrimitiveID] public uint PrimitiveId;
}
```

### gl_SampleID

Índice de la muestra que se está sombreando (multimuestreo).

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[SampleIndex]
public class gl_SampleID : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.GlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `SampleIndex`
- **El mismo concepto en:** HLSL [SV_SampleIndex](hlsl.md#sv-sampleindex) · MSL [sample_id](msl.md#sample-id) · SPIR-V [BuiltIn_SampleId](spirv.md#builtin-sampleid) · WGSL [@builtin_sample_index](wgsl.md#builtin-sample-index)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

// Entrada de la etapa de fragmentos
public struct FragmentInput
{
    [gl_SampleID] public uint SampleIndex;
}
```

### gl_SampleMaskIn

Máscara de cobertura de las muestras del fragmento, tal como llega.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[SampleMask]
public class gl_SampleMaskIn : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.GlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `SampleMask`
- **El mismo concepto en:** HLSL [SV_Coverage](hlsl.md#sv-coverage) · MSL [sample_mask](msl.md#sample-mask) · SPIR-V [BuiltIn_SampleMask](spirv.md#builtin-samplemask) · WGSL [@builtin_sample_mask](wgsl.md#builtin-sample-mask)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

// Entrada de la etapa de fragmentos
public struct FragmentInput
{
    [gl_SampleMaskIn] public uint SampleMask;
}
```

### gl_SamplePosition

Posición de la muestra actual dentro del píxel.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[SamplePosition]
public class gl_SamplePosition : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.GlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `SamplePosition`
- **El mismo concepto en:** SPIR-V [BuiltIn_SamplePosition](spirv.md#builtin-sampleposition)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Types;

// Entrada de la etapa de fragmentos
public struct FragmentInput
{
    [gl_SamplePosition] public vec2 SamplePosition;
}
```

### gl_SubgroupID

Índice del subgrupo dentro del grupo de trabajo.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[SubgroupId]
public class gl_SubgroupID : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.GlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `SubgroupId`
- **El mismo concepto en:** MSL [simdgroup_index_in_threadgroup](msl.md#simdgroup-index-in-threadgroup) · SPIR-V [BuiltIn_SubgroupId](spirv.md#builtin-subgroupid) · WGSL [@builtin_subgroup_id](wgsl.md#builtin-subgroup-id)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

// Entrada de la etapa compute
public struct ComputeInput
{
    [gl_SubgroupID] public uint SubgroupId;
}
```

### gl_SubgroupInvocationID

Índice de la invocación dentro de su subgrupo.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[SubgroupInvocationId]
public class gl_SubgroupInvocationID : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.GlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `SubgroupInvocationId`
- **El mismo concepto en:** MSL [thread_index_in_simdgroup](msl.md#thread-index-in-simdgroup) · SPIR-V [BuiltIn_SubgroupInvocationId](spirv.md#builtin-subgroupinvocationid) · WGSL [@builtin_subgroup_invocation_id](wgsl.md#builtin-subgroup-invocation-id)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

// Entrada de la etapa compute
public struct ComputeInput
{
    [gl_SubgroupInvocationID] public uint SubgroupLane;
}
```

### gl_SubgroupSize

Cantidad de invocaciones de un subgrupo.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[SubgroupSize]
public class gl_SubgroupSize : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.GlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `SubgroupSize`
- **El mismo concepto en:** MSL [threads_per_simdgroup](msl.md#threads-per-simdgroup) · SPIR-V [BuiltIn_SubgroupSize](spirv.md#builtin-subgroupsize) · WGSL [@builtin_subgroup_size](wgsl.md#builtin-subgroup-size)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

// Entrada de la etapa compute
public struct ComputeInput
{
    [gl_SubgroupSize] public uint SubgroupSize;
}
```

### gl_VertexIndex

Índice del vértice que se está procesando.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[VertexIndex]
public class gl_VertexIndex : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.GlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `VertexIndex`
- **El mismo concepto en:** HLSL [SV_VertexID](hlsl.md#sv-vertexid) · MSL [vertex_id](msl.md#vertex-id) · SPIR-V [BuiltIn_VertexIndex](spirv.md#builtin-vertexindex) · WGSL [@builtin_vertex_index](wgsl.md#builtin-vertex-index)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

// Entrada de la etapa de vértices
public struct VertexInput
{
    [gl_VertexIndex] public int VertexIndex;
}
```

### gl_WorkGroupID

Posición del grupo de trabajo en el dispatch.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[WorkgroupId]
public class gl_WorkGroupID : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.GlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `WorkgroupId`
- **El mismo concepto en:** HLSL [SV_GroupID](hlsl.md#sv-groupid) · MSL [threadgroup_position_in_grid](msl.md#threadgroup-position-in-grid) · SPIR-V [BuiltIn_WorkgroupId](spirv.md#builtin-workgroupid) · WGSL [@builtin_workgroup_id](wgsl.md#builtin-workgroup-id)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Types;

// Entrada de la etapa compute
public struct ComputeInput
{
    [gl_WorkGroupID] public uvec3 GroupId;
}
```

### gl_WorkGroupSize

Tamaño del grupo de trabajo, leído como un valor.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[WorkgroupSizeBuiltInValue]
public class gl_WorkGroupSize : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.GlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `WorkgroupSizeBuiltInValue`
- **El mismo concepto en:** MSL [threads_per_threadgroup](msl.md#threads-per-threadgroup) · SPIR-V [BuiltIn_WorkgroupSize](spirv.md#builtin-workgroupsize)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Types;

// Entrada de la etapa compute
public struct ComputeInput
{
    [gl_WorkGroupSize] public uvec3 GroupSize;
}
```

## Atributos de salida

Campos, parámetros y valores de retorno que produce la etapa.

### gl_ClipDistance

Distancia de recorte: un valor negativo recorta la primitiva contra un plano del usuario.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Output)]
[ClipInstance]
public class gl_ClipDistance : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.GlslSyntax`
- **Se aplica a:** campos, parámetros, valores de retorno
- **Concepto:** `ClipInstance`
- **El mismo concepto en:** HLSL [SV_ClipDistanceN](hlsl.md#sv-clipdistancen) · MSL [clip_distance](msl.md#clip-distance) · SPIR-V [BuiltIn_ClipDistance](spirv.md#builtin-clipdistance) · WGSL [@builtin_clip_distances](wgsl.md#builtin-clip-distances)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

// Salida de la etapa de vértices
public struct VertexOutput
{
    [gl_ClipDistance] public float ClipDistance;
}
```

### gl_FragDepth

Profundidad que escribe la etapa de fragmentos, en lugar de la interpolada.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Output)]
[FragDepth]
public class gl_FragDepth : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.GlslSyntax`
- **Se aplica a:** campos, parámetros, valores de retorno
- **Concepto:** `FragDepth`
- **El mismo concepto en:** HLSL [SV_Depth](hlsl.md#sv-depth) · MSL [depth](msl.md#depth) · SPIR-V [BuiltIn_FragDepth](spirv.md#builtin-fragdepth) · WGSL [@builtin_frag_depth](wgsl.md#builtin-frag-depth)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

// Salida de la etapa de fragmentos
public struct FragmentOutput
{
    [gl_FragDepth] public float Depth;
}
```

### gl_FragStencilRefARB

Valor de referencia de stencil que escribe la etapa de fragmentos.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Output)]
[StencilReference]
public class gl_FragStencilRefARB : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.GlslSyntax`
- **Se aplica a:** campos, parámetros, valores de retorno
- **Concepto:** `StencilReference`
- **El mismo concepto en:** HLSL [SV_StencilRef](hlsl.md#sv-stencilref) · MSL [stencil](msl.md#stencil) · SPIR-V [BuiltIn_FragStencilRef](spirv.md#builtin-fragstencilref)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

// Salida de la etapa de fragmentos
public struct FragmentOutput
{
    [gl_FragStencilRefARB] public uint StencilRef;
}
```

### gl_SampleMask

Máscara de cobertura que escribe la etapa de fragmentos.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Output)]
[SampleMask]
public class gl_SampleMask : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.GlslSyntax`
- **Se aplica a:** campos, parámetros, valores de retorno
- **Concepto:** `SampleMask`
- **El mismo concepto en:** HLSL [SV_Coverage](hlsl.md#sv-coverage) · MSL [sample_mask](msl.md#sample-mask) · SPIR-V [BuiltIn_SampleMask](spirv.md#builtin-samplemask) · WGSL [@builtin_sample_mask](wgsl.md#builtin-sample-mask)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

// Salida de la etapa de fragmentos
public struct FragmentOutput
{
    [gl_SampleMask] public uint SampleMask;
}
```

## Atributos de entrada y salida

Valores que una etapa puede recibir o producir. La etapa decide cuál.

### gl_Layer

Capa del render target por capas que recibe la primitiva.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[RenderTargetLayer]
public class gl_Layer : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.GlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades, valores de retorno
- **Concepto:** `RenderTargetLayer`
- **El mismo concepto en:** HLSL [SV_RenderTargetArrayIndex](hlsl.md#sv-rendertargetarrayindex) · MSL [render_target_array_index](msl.md#render-target-array-index) · SPIR-V [BuiltIn_Layer](spirv.md#builtin-layer)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

// Salida de la etapa de vértices
public struct VertexOutput
{
    [gl_Layer] public uint Layer;
}
```

### gl_Position

Posición en espacio de recorte que escribe la etapa de vértices.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[ClipSpacePosition]
public class gl_Position : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.GlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades, valores de retorno
- **Concepto:** `ClipSpacePosition`
- **El mismo concepto en:** HLSL [SV_Position](hlsl.md#sv-position), [SV_POSITION](hlsl.md#sv-position) · MSL [position](msl.md#position) · SPIR-V [BuiltIn_Position](spirv.md#builtin-position) · WGSL [@builtin_position](wgsl.md#builtin-position)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Types;

// Salida de la etapa de vértices
public struct VertexOutput
{
    [gl_Position] public vec4 Position;
}
```

### gl_ViewportIndex

Viewport que recibe la primitiva.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[ViewportIndex]
public class gl_ViewportIndex : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.GlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades, valores de retorno
- **Concepto:** `ViewportIndex`
- **El mismo concepto en:** HLSL [SV_ViewportArrayIndex](hlsl.md#sv-viewportarrayindex) · MSL [viewport_array_index](msl.md#viewport-array-index) · SPIR-V [BuiltIn_ViewportIndex](spirv.md#builtin-viewportindex)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

// Salida de la etapa de vértices
public struct VertexOutput
{
    [gl_ViewportIndex] public uint ViewportIndex;
}
```

### location

Ranura numerada de la interfaz: entradas de vértice, valores que pasan entre etapas y salidas de fragmento.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[Location]
public class location(int n) : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.GlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades, valores de retorno
- **Concepto:** `Location`
- **El mismo concepto en:** HLSL [SV_Target](hlsl.md#sv-target) · MSL [attribute](msl.md#attribute), [color](msl.md#color) · SPIR-V [Location](spirv.md#location) · WGSL [@location](wgsl.md#location)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Types;

// Salida de la etapa de vértices
public struct VertexOutput
{
    [location(0)] public vec4 Color;
}
```

## Atributos de método

Atributos que se aplican a un método punto de entrada.

### layout_local_size

Fija el tamaño del grupo de trabajo de un punto de entrada compute.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Method)]
[WorkgroupSizeMethod]
public class layout_local_size(uint x, uint y = 1, uint z = 1) : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.GlslSyntax`
- **Se aplica a:** métodos
- **Concepto:** `WorkgroupSizeMethod`
- **El mismo concepto en:** HLSL [numthreads](hlsl.md#numthreads) · WGSL [@workgroup_size](wgsl.md#workgroup-size)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

public class Blur
{
    // Punto de entrada compute
    [ShaderStage(Stage.Compute)]
    [layout_local_size(8)]
    public void Main() { }
}
```

## Atributos de recursos

Buffers uniformes, storage buffers y las ranuras de binding de buffers, texturas y samplers.

### buffer

Marca el campo como un storage buffer (bloque `buffer` de GLSL), de lectura y escritura o de solo lectura.

```csharp
namespace YotsubaShader.GlslSyntax.Resources;

[AttributeUsage(AttributeUsagesTable.Resource)]
[RWStorageBuffer, ReadOnlyStorageBuffer]
public class buffer : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.GlslSyntax.Resources`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `RWStorageBuffer`, `ReadOnlyStorageBuffer`
- **El mismo concepto en:** MSL [device](msl.md#device) · SPIR-V [StorageBuffer](spirv.md#storagebuffer) · WGSL [storage](wgsl.md#storage)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Resources;

public class Resources
{
    [buffer, layout(0, 1)]
    public float[] Output;
}
```

### layout

Descriptor set y binding de un buffer, textura o sampler.

```csharp
namespace YotsubaShader.GlslSyntax.Resources;

[AttributeUsage(AttributeUsagesTable.Resource)]
[BindingSlot, TextureSlot, SamplerSlot]
public class layout(int set, int binding) : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.GlslSyntax.Resources`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `BindingSlot`, `TextureSlot`, `SamplerSlot`
- **El mismo concepto en:** HLSL [register](hlsl.md#register) · MSL [buffer](msl.md#buffer), [sampler](msl.md#sampler), [texture](msl.md#texture) · SPIR-V [Binding](spirv.md#binding), [DescriptorSet](spirv.md#descriptorset) · WGSL [@binding](wgsl.md#binding), [@group](wgsl.md#group)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Resources;
using YotsubaShader.GlslSyntax.Resources.Types;

public class Surface
{
    [layout(0, 0)]
    public sampler2D Albedo;
}
```

### uniform

Marca el campo como un buffer uniforme (constante).

```csharp
namespace YotsubaShader.GlslSyntax.Resources;

[AttributeUsage(AttributeUsagesTable.Resource)]
[UniformBuffer]
public class uniform : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.GlslSyntax.Resources`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `UniformBuffer`
- **El mismo concepto en:** HLSL [cbuffer](hlsl.md#cbuffer) · MSL [constant](msl.md#constant) · SPIR-V [Uniform](spirv.md#uniform) · WGSL [uniform](wgsl.md#uniform)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Resources;

public struct Material
{
    // El contenido del buffer uniforme
    public float Exposure;
}

public class Resources
{
    [uniform, layout(0, 0)]
    public Material Material;
}
```

## Tipos

Los tipos que declara el paquete. Los miembros aparecen sin su cuerpo.

### Tipos de texturas y samplers

```csharp
namespace YotsubaShader.GlslSyntax.Resources.Types;

[Texture(TextureDimension.D1, TextureComponentTypes.Int, Usage = TextureUsage.Storage)]
public struct iimage1D;

[Texture(TextureDimension.D2, TextureComponentTypes.Int, Usage = TextureUsage.Storage)]
public struct iimage2D;

[Texture(TextureDimension.D2, TextureComponentTypes.Int, Arrayed = true, Usage = TextureUsage.Storage)]
public struct iimage2DArray;

[Texture(TextureDimension.D2, TextureComponentTypes.Int, Multisampled = true, Usage = TextureUsage.Storage)]
public struct iimage2DMS;

[Texture(TextureDimension.D3, TextureComponentTypes.Int, Usage = TextureUsage.Storage)]
public struct iimage3D;

[Texture(TextureDimension.Cube, TextureComponentTypes.Int, Usage = TextureUsage.Storage)]
public struct iimageCube;

[Texture(TextureDimension.D1, TextureComponentTypes.Float, Usage = TextureUsage.Storage)]
public struct image1D;

[Texture(TextureDimension.D2, TextureComponentTypes.Float, Usage = TextureUsage.Storage)]
public struct image2D;

[Texture(TextureDimension.D2, TextureComponentTypes.Float, Arrayed = true, Usage = TextureUsage.Storage)]
public struct image2DArray;

[Texture(TextureDimension.D2, TextureComponentTypes.Float, Multisampled = true, Usage = TextureUsage.Storage)]
public struct image2DMS;

[Texture(TextureDimension.D3, TextureComponentTypes.Float, Usage = TextureUsage.Storage)]
public struct image3D;

[Texture(TextureDimension.Cube, TextureComponentTypes.Float, Usage = TextureUsage.Storage)]
public struct imageCube;

[Sampler, Texture(TextureDimension.D1, TextureComponentTypes.Int)]
public struct isampler1D;

[Sampler, Texture(TextureDimension.D1, TextureComponentTypes.Int, Arrayed = true)]
public struct isampler1DArray;

[Sampler, Texture(TextureDimension.D2, TextureComponentTypes.Int)]
public struct isampler2D;

[Sampler, Texture(TextureDimension.D2, TextureComponentTypes.Int, Arrayed = true)]
public struct isampler2DArray;

[Sampler, Texture(TextureDimension.D2, TextureComponentTypes.Int, Multisampled = true)]
public struct isampler2DMS;

[Sampler, Texture(TextureDimension.D2, TextureComponentTypes.Int, Arrayed = true, Multisampled = true)]
public struct isampler2DMSArray;

[Sampler, Texture(TextureDimension.D3, TextureComponentTypes.Int)]
public struct isampler3D;

[Sampler, Texture(TextureDimension.D1, TextureComponentTypes.Int)]
public struct isamplerBuffer;

[Sampler, Texture(TextureDimension.Cube, TextureComponentTypes.Int)]
public struct isamplerCube;

[Sampler, Texture(TextureDimension.Cube, TextureComponentTypes.Int, Arrayed = true)]
public struct isamplerCubeArray;

[Sampler, Texture(TextureDimension.D1, TextureComponentTypes.Float)]
public struct sampler1D;

[Sampler, Texture(TextureDimension.D1, TextureComponentTypes.Float, Arrayed = true)]
public struct sampler1DArray;

[Sampler, Texture(TextureDimension.D1, TextureComponentTypes.Float, Depth = TextureDepth.Yes, Arrayed = true)]
public struct sampler1DArrayShadow;

[Sampler, Texture(TextureDimension.D1, TextureComponentTypes.Float, Depth = TextureDepth.Yes)]
public struct sampler1DShadow;

[Sampler, Texture(TextureDimension.D2, TextureComponentTypes.Float)]
public struct sampler2D;

[Sampler, Texture(TextureDimension.D2, TextureComponentTypes.Float, Arrayed = true)]
public struct sampler2DArray;

[Sampler, Texture(TextureDimension.D2, TextureComponentTypes.Float, Depth = TextureDepth.Yes, Arrayed = true)]
public struct sampler2DArrayShadow;

[Sampler, Texture(TextureDimension.D2, TextureComponentTypes.Float, Multisampled = true)]
public struct sampler2DMS;

[Sampler, Texture(TextureDimension.D2, TextureComponentTypes.Float, Arrayed = true, Multisampled = true)]
public struct sampler2DMSArray;

[Sampler, Texture(TextureDimension.D2, TextureComponentTypes.Float, Depth = TextureDepth.Yes)]
public struct sampler2DShadow;

[Sampler, Texture(TextureDimension.D3, TextureComponentTypes.Float)]
public struct sampler3D;

[Sampler, Texture(TextureDimension.D1, TextureComponentTypes.Float)]
public struct samplerBuffer;

[Sampler, Texture(TextureDimension.Cube, TextureComponentTypes.Float)]
public struct samplerCube;

[Sampler, Texture(TextureDimension.Cube, TextureComponentTypes.Float, Arrayed = true)]
public struct samplerCubeArray;

[Sampler, Texture(TextureDimension.Cube, TextureComponentTypes.Float, Depth = TextureDepth.Yes, Arrayed = true)]
public struct samplerCubeArrayShadow;

[Sampler, Texture(TextureDimension.Cube, TextureComponentTypes.Float, Depth = TextureDepth.Yes)]
public struct samplerCubeShadow;

[Texture(TextureDimension.D1, TextureComponentTypes.Uint, Usage = TextureUsage.Storage)]
public struct uimage1D;

[Texture(TextureDimension.D2, TextureComponentTypes.Uint, Usage = TextureUsage.Storage)]
public struct uimage2D;

[Texture(TextureDimension.D2, TextureComponentTypes.Uint, Arrayed = true, Usage = TextureUsage.Storage)]
public struct uimage2DArray;

[Texture(TextureDimension.D2, TextureComponentTypes.Uint, Multisampled = true, Usage = TextureUsage.Storage)]
public struct uimage2DMS;

[Texture(TextureDimension.D3, TextureComponentTypes.Uint, Usage = TextureUsage.Storage)]
public struct uimage3D;

[Texture(TextureDimension.Cube, TextureComponentTypes.Uint, Usage = TextureUsage.Storage)]
public struct uimageCube;

[Sampler, Texture(TextureDimension.D1, TextureComponentTypes.Uint)]
public struct usampler1D;

[Sampler, Texture(TextureDimension.D1, TextureComponentTypes.Uint, Arrayed = true)]
public struct usampler1DArray;

[Sampler, Texture(TextureDimension.D2, TextureComponentTypes.Uint)]
public struct usampler2D;

[Sampler, Texture(TextureDimension.D2, TextureComponentTypes.Uint, Arrayed = true)]
public struct usampler2DArray;

[Sampler, Texture(TextureDimension.D2, TextureComponentTypes.Uint, Multisampled = true)]
public struct usampler2DMS;

[Sampler, Texture(TextureDimension.D2, TextureComponentTypes.Uint, Arrayed = true, Multisampled = true)]
public struct usampler2DMSArray;

[Sampler, Texture(TextureDimension.D3, TextureComponentTypes.Uint)]
public struct usampler3D;

[Sampler, Texture(TextureDimension.D1, TextureComponentTypes.Uint)]
public struct usamplerBuffer;

[Sampler, Texture(TextureDimension.Cube, TextureComponentTypes.Uint)]
public struct usamplerCube;

[Sampler, Texture(TextureDimension.Cube, TextureComponentTypes.Uint, Arrayed = true)]
public struct usamplerCubeArray;
```

### Tipos de vectores, matrices y auxiliares

```csharp
namespace YotsubaShader.GlslSyntax.Types;

[Vector]
public partial struct bvec2
{
    [VectorComponent(0)]
    public bool X;
    [VectorComponent(1)]
    public bool Y;
}

[Vector]
public partial struct bvec3
{
    [VectorComponent(0)]
    public bool X;
    [VectorComponent(1)]
    public bool Y;
    [VectorComponent(2)]
    public bool Z;
}

[Vector]
public partial struct bvec4
{
    [VectorComponent(0)]
    public bool X;
    [VectorComponent(1)]
    public bool Y;
    [VectorComponent(2)]
    public bool Z;
    [VectorComponent(3)]
    public bool W;
}

[Matrix]
public partial struct dmat2
{
    [MatrixColumn(0)]
    public dvec2 C0;
    [MatrixColumn(1)]
    public dvec2 C1;
}

[Matrix]
public partial struct dmat2x2
{
    [MatrixColumn(0)]
    public dvec2 C0;
    [MatrixColumn(1)]
    public dvec2 C1;
}

[Matrix]
public partial struct dmat2x3
{
    [MatrixColumn(0)]
    public dvec3 C0;
    [MatrixColumn(1)]
    public dvec3 C1;
}

[Matrix]
public partial struct dmat2x4
{
    [MatrixColumn(0)]
    public dvec4 C0;
    [MatrixColumn(1)]
    public dvec4 C1;
}

[Matrix]
public partial struct dmat3
{
    [MatrixColumn(0)]
    public dvec3 C0;
    [MatrixColumn(1)]
    public dvec3 C1;
    [MatrixColumn(2)]
    public dvec3 C2;
}

[Matrix]
public partial struct dmat3x2
{
    [MatrixColumn(0)]
    public dvec2 C0;
    [MatrixColumn(1)]
    public dvec2 C1;
    [MatrixColumn(2)]
    public dvec2 C2;
}

[Matrix]
public partial struct dmat3x3
{
    [MatrixColumn(0)]
    public dvec3 C0;
    [MatrixColumn(1)]
    public dvec3 C1;
    [MatrixColumn(2)]
    public dvec3 C2;
}

[Matrix]
public partial struct dmat3x4
{
    [MatrixColumn(0)]
    public dvec4 C0;
    [MatrixColumn(1)]
    public dvec4 C1;
    [MatrixColumn(2)]
    public dvec4 C2;
}

[Matrix]
public partial struct dmat4
{
    [MatrixColumn(0)]
    public dvec4 C0;
    [MatrixColumn(1)]
    public dvec4 C1;
    [MatrixColumn(2)]
    public dvec4 C2;
    [MatrixColumn(3)]
    public dvec4 C3;
}

[Matrix]
public partial struct dmat4x2
{
    [MatrixColumn(0)]
    public dvec2 C0;
    [MatrixColumn(1)]
    public dvec2 C1;
    [MatrixColumn(2)]
    public dvec2 C2;
    [MatrixColumn(3)]
    public dvec2 C3;
}

[Matrix]
public partial struct dmat4x3
{
    [MatrixColumn(0)]
    public dvec3 C0;
    [MatrixColumn(1)]
    public dvec3 C1;
    [MatrixColumn(2)]
    public dvec3 C2;
    [MatrixColumn(3)]
    public dvec3 C3;
}

[Matrix]
public partial struct dmat4x4
{
    [MatrixColumn(0)]
    public dvec4 C0;
    [MatrixColumn(1)]
    public dvec4 C1;
    [MatrixColumn(2)]
    public dvec4 C2;
    [MatrixColumn(3)]
    public dvec4 C3;
}

[Vector]
public partial struct dvec2
{
    [VectorComponent(0)]
    public double X;
    [VectorComponent(1)]
    public double Y;
}

[Vector]
public partial struct dvec3
{
    [VectorComponent(0)]
    public double X;
    [VectorComponent(1)]
    public double Y;
    [VectorComponent(2)]
    public double Z;
}

[Vector]
public partial struct dvec4
{
    [VectorComponent(0)]
    public double X;
    [VectorComponent(1)]
    public double Y;
    [VectorComponent(2)]
    public double Z;
    [VectorComponent(3)]
    public double W;
}

[Vector]
public partial struct ivec2
{
    [VectorComponent(0)]
    public int X;
    [VectorComponent(1)]
    public int Y;
}

[Vector]
public partial struct ivec3
{
    [VectorComponent(0)]
    public int X;
    [VectorComponent(1)]
    public int Y;
    [VectorComponent(2)]
    public int Z;
}

[Vector]
public partial struct ivec4
{
    [VectorComponent(0)]
    public int X;
    [VectorComponent(1)]
    public int Y;
    [VectorComponent(2)]
    public int Z;
    [VectorComponent(3)]
    public int W;
}

[Matrix]
public partial struct mat2
{
    [MatrixColumn(0)]
    public vec2 C0;
    [MatrixColumn(1)]
    public vec2 C1;
}

[Matrix]
public partial struct mat2x2
{
    [MatrixColumn(0)]
    public vec2 C0;
    [MatrixColumn(1)]
    public vec2 C1;
}

[Matrix]
public partial struct mat2x3
{
    [MatrixColumn(0)]
    public vec3 C0;
    [MatrixColumn(1)]
    public vec3 C1;
}

[Matrix]
public partial struct mat2x4
{
    [MatrixColumn(0)]
    public vec4 C0;
    [MatrixColumn(1)]
    public vec4 C1;
}

[Matrix]
public partial struct mat3
{
    [MatrixColumn(0)]
    public vec3 C0;
    [MatrixColumn(1)]
    public vec3 C1;
    [MatrixColumn(2)]
    public vec3 C2;
}

[Matrix]
public partial struct mat3x2
{
    [MatrixColumn(0)]
    public vec2 C0;
    [MatrixColumn(1)]
    public vec2 C1;
    [MatrixColumn(2)]
    public vec2 C2;
}

[Matrix]
public partial struct mat3x3
{
    [MatrixColumn(0)]
    public vec3 C0;
    [MatrixColumn(1)]
    public vec3 C1;
    [MatrixColumn(2)]
    public vec3 C2;
}

[Matrix]
public partial struct mat3x4
{
    [MatrixColumn(0)]
    public vec4 C0;
    [MatrixColumn(1)]
    public vec4 C1;
    [MatrixColumn(2)]
    public vec4 C2;
}

[Matrix]
public partial struct mat4
{
    [MatrixColumn(0)]
    public vec4 C0;
    [MatrixColumn(1)]
    public vec4 C1;
    [MatrixColumn(2)]
    public vec4 C2;
    [MatrixColumn(3)]
    public vec4 C3;
}

[Matrix]
public partial struct mat4x2
{
    [MatrixColumn(0)]
    public vec2 C0;
    [MatrixColumn(1)]
    public vec2 C1;
    [MatrixColumn(2)]
    public vec2 C2;
    [MatrixColumn(3)]
    public vec2 C3;
}

[Matrix]
public partial struct mat4x3
{
    [MatrixColumn(0)]
    public vec3 C0;
    [MatrixColumn(1)]
    public vec3 C1;
    [MatrixColumn(2)]
    public vec3 C2;
    [MatrixColumn(3)]
    public vec3 C3;
}

[Matrix]
public partial struct mat4x4
{
    [MatrixColumn(0)]
    public vec4 C0;
    [MatrixColumn(1)]
    public vec4 C1;
    [MatrixColumn(2)]
    public vec4 C2;
    [MatrixColumn(3)]
    public vec4 C3;
}

[Vector]
public partial struct uvec2
{
    [VectorComponent(0)]
    public uint X;
    [VectorComponent(1)]
    public uint Y;
}

[Vector]
public partial struct uvec3
{
    [VectorComponent(0)]
    public uint X;
    [VectorComponent(1)]
    public uint Y;
    [VectorComponent(2)]
    public uint Z;
}

[Vector]
public partial struct uvec4
{
    [VectorComponent(0)]
    public uint X;
    [VectorComponent(1)]
    public uint Y;
    [VectorComponent(2)]
    public uint Z;
    [VectorComponent(3)]
    public uint W;
}

[Vector]
public partial struct vec2
{
    [VectorComponent(0)]
    public float X;
    [VectorComponent(1)]
    public float Y;
}

[Vector]
public partial struct vec3
{
    [VectorComponent(0)]
    public float X;
    [VectorComponent(1)]
    public float Y;
    [VectorComponent(2)]
    public float Z;
}

[Vector]
public partial struct vec4
{
    [VectorComponent(0)]
    public float X;
    [VectorComponent(1)]
    public float Y;
    [VectorComponent(2)]
    public float Z;
    [VectorComponent(3)]
    public float W;
}
```

> [!NOTE]
> Los listados muestran lo que declara el paquete. No todos los conceptos los traduce cada destino de salida.

## Las otras sintaxis

```buttons
[HLSL](hlsl.md)
[MSL](msl.md)
[SPIR-V](spirv.md)
[WGSL](wgsl.md)
```

---
title: API de la sintaxis MSL
summary: Todos los atributos y tipos del paquete YotsubaShader.MslSyntax, con su declaración, su concepto y un ejemplo.
order: 3
---

API del paquete `YotsubaShader.MslSyntax`: los 32 atributos y los tipos de la sintaxis MSL, inspirada en **Metal Shading Language**. Cada entrada muestra la declaración tal como la escribe el paquete, el concepto que el compilador lee de ella, el mismo concepto en las otras cuatro sintaxis y un ejemplo.

Agrega el paquete al proyecto de shaders:

```bash
dotnet add package YotsubaShader.MslSyntax
```

Para un recorrido guiado por la sintaxis, con cada valor integrado agrupado por etapa, mira la página [Sintaxis MSL](../reference/msl.md) de la Documentación.

## Espacios de nombres

El paquete reparte su API en estos espacios de nombres. Los atributos comunes a todas las sintaxis (`ShaderStage`, `Location`, `Uniform`...) están en `YotsubaShader.Language`.

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax; // Valores integrados, ranuras de interfaz y atributos de método
using YotsubaShader.MslSyntax.Resources; // Atributos de recursos y tipos de recursos
using YotsubaShader.MslSyntax.Resources.Types; // Tipos de texturas y samplers
using YotsubaShader.MslSyntax.Types; // Tipos de vectores, matrices y auxiliares
```

## Atributos de entrada

Campos, parámetros y propiedades que reciben un valor del pipeline.

### attribute

Entrada de vértice que se lee del atributo `n`, `[[attribute(n)]]` en Metal.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[Location]
public class attribute(int n) : YotsubaShaderConcept
{
    public int N;
}
```

- **Espacio de nombres:** `YotsubaShader.MslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `Location`
- **El mismo concepto en:** HLSL [SV_Target](hlsl.md#sv-target) · GLSL [location](glsl.md#location) · SPIR-V [Location](spirv.md#location) · WGSL [@location](wgsl.md#location)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;
using YotsubaShader.MslSyntax.Types;

// Entrada de la etapa de fragmentos
public struct FragmentInput
{
    [attribute(0)] public float4 Color;
}
```

### barycentric_coord

Coordenadas baricéntricas del fragmento dentro de su triángulo.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[BarycentricCoordinates]
public class barycentric_coord : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.MslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `BarycentricCoordinates`
- **El mismo concepto en:** HLSL [SV_Barycentrics](hlsl.md#sv-barycentrics) · GLSL [gl_BaryCoordEXT](glsl.md#gl-barycoordext) · SPIR-V [BuiltIn_BaryCoord](spirv.md#builtin-barycoord)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;
using YotsubaShader.MslSyntax.Types;

// Entrada de la etapa de fragmentos
public struct FragmentInput
{
    [barycentric_coord] public float3 Barycentrics;
}
```

### base_instance

Instancia base de la llamada de dibujo.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[BaseInstance]
public class base_instance : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.MslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `BaseInstance`
- **El mismo concepto en:** HLSL [SV_StartInstanceLocation](hlsl.md#sv-startinstancelocation) · GLSL [gl_BaseInstance](glsl.md#gl-baseinstance) · SPIR-V [BuiltIn_BaseInstance](spirv.md#builtin-baseinstance)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;

// Entrada de la etapa de vértices
public struct VertexInput
{
    [base_instance] public uint BaseInstance;
}
```

### base_vertex

Vértice base de la llamada de dibujo.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[BaseVertex]
public class base_vertex : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.MslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `BaseVertex`
- **El mismo concepto en:** HLSL [SV_StartVertexLocation](hlsl.md#sv-startvertexlocation) · GLSL [gl_BaseVertex](glsl.md#gl-basevertex) · SPIR-V [BuiltIn_BaseVertex](spirv.md#builtin-basevertex)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;

// Entrada de la etapa de vértices
public struct VertexInput
{
    [base_vertex] public uint BaseVertex;
}
```

### front_facing

`true` cuando el fragmento pertenece a una primitiva de cara frontal.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[FrontFacingFlag]
public class front_facing : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.MslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `FrontFacingFlag`
- **El mismo concepto en:** HLSL [SV_IsFrontFace](hlsl.md#sv-isfrontface) · GLSL [gl_FrontFacing](glsl.md#gl-frontfacing) · SPIR-V [BuiltIn_FrontFacing](spirv.md#builtin-frontfacing) · WGSL [@builtin_front_facing](wgsl.md#builtin-front-facing)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;

// Entrada de la etapa de fragmentos
public struct FragmentInput
{
    [front_facing] public bool IsFrontFace;
}
```

### instance_id

Índice de la instancia que se está dibujando.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[InstanceIndex]
public class instance_id : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.MslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `InstanceIndex`
- **El mismo concepto en:** HLSL [SV_InstanceID](hlsl.md#sv-instanceid) · GLSL [gl_InstanceIndex](glsl.md#gl-instanceindex) · SPIR-V [BuiltIn_InstanceIndex](spirv.md#builtin-instanceindex) · WGSL [@builtin_instance_index](wgsl.md#builtin-instance-index)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;

// Entrada de la etapa de vértices
public struct VertexInput
{
    [instance_id] public uint InstanceIndex;
}
```

### primitive_id

Índice de la primitiva a la que pertenece el fragmento.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[PrimitiveIndex]
public class primitive_id : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.MslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `PrimitiveIndex`
- **El mismo concepto en:** HLSL [SV_PrimitiveID](hlsl.md#sv-primitiveid) · GLSL [gl_PrimitiveID](glsl.md#gl-primitiveid) · SPIR-V [BuiltIn_PrimitiveId](spirv.md#builtin-primitiveid) · WGSL [@builtin_primitive_index](wgsl.md#builtin-primitive-index)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;

// Entrada de la etapa de fragmentos
public struct FragmentInput
{
    [primitive_id] public uint PrimitiveId;
}
```

### sample_id

Índice de la muestra que se está sombreando (multimuestreo).

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[SampleIndex]
public class sample_id : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.MslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `SampleIndex`
- **El mismo concepto en:** HLSL [SV_SampleIndex](hlsl.md#sv-sampleindex) · GLSL [gl_SampleID](glsl.md#gl-sampleid) · SPIR-V [BuiltIn_SampleId](spirv.md#builtin-sampleid) · WGSL [@builtin_sample_index](wgsl.md#builtin-sample-index)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;

// Entrada de la etapa de fragmentos
public struct FragmentInput
{
    [sample_id] public uint SampleIndex;
}
```

### simdgroup_index_in_threadgroup

Índice del subgrupo dentro del grupo de trabajo.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[SubgroupId]
public class simdgroup_index_in_threadgroup : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.MslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `SubgroupId`
- **El mismo concepto en:** GLSL [gl_SubgroupID](glsl.md#gl-subgroupid) · SPIR-V [BuiltIn_SubgroupId](spirv.md#builtin-subgroupid) · WGSL [@builtin_subgroup_id](wgsl.md#builtin-subgroup-id)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;

// Entrada de la etapa compute
public struct ComputeInput
{
    [simdgroup_index_in_threadgroup] public uint SubgroupId;
}
```

### simdgroups_per_threadgroup

Cantidad de subgrupos del grupo de trabajo.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[NumberOfSubgroups]
public class simdgroups_per_threadgroup : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.MslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `NumberOfSubgroups`
- **El mismo concepto en:** GLSL [gl_NumSubgroups](glsl.md#gl-numsubgroups) · SPIR-V [BuiltIn_NumSubgroups](spirv.md#builtin-numsubgroups) · WGSL [@builtin_num_subgroups](wgsl.md#builtin-num-subgroups)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;

// Entrada de la etapa compute
public struct ComputeInput
{
    [simdgroups_per_threadgroup] public uint SubgroupCount;
}
```

### thread_index_in_simdgroup

Índice de la invocación dentro de su subgrupo.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[SubgroupInvocationId]
public class thread_index_in_simdgroup : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.MslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `SubgroupInvocationId`
- **El mismo concepto en:** GLSL [gl_SubgroupInvocationID](glsl.md#gl-subgroupinvocationid) · SPIR-V [BuiltIn_SubgroupInvocationId](spirv.md#builtin-subgroupinvocationid) · WGSL [@builtin_subgroup_invocation_id](wgsl.md#builtin-subgroup-invocation-id)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;

// Entrada de la etapa compute
public struct ComputeInput
{
    [thread_index_in_simdgroup] public uint SubgroupLane;
}
```

### thread_index_in_threadgroup

Índice aplanado de la invocación dentro de su grupo de trabajo.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[LocalInvocationIndex]
public class thread_index_in_threadgroup : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.MslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `LocalInvocationIndex`
- **El mismo concepto en:** HLSL [SV_GroupIndex](hlsl.md#sv-groupindex) · GLSL [gl_LocalInvocationIndex](glsl.md#gl-localinvocationindex) · SPIR-V [BuiltIn_LocalInvocationIndex](spirv.md#builtin-localinvocationindex) · WGSL [@builtin_local_invocation_index](wgsl.md#builtin-local-invocation-index)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;

// Entrada de la etapa compute
public struct ComputeInput
{
    [thread_index_in_threadgroup] public uint LocalIndex;
}
```

### thread_position_in_grid

Posición de la invocación en todo el dispatch.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[GlobalInvocationId]
public class thread_position_in_grid : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.MslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `GlobalInvocationId`
- **El mismo concepto en:** HLSL [SV_DispatchThreadID](hlsl.md#sv-dispatchthreadid) · GLSL [gl_GlobalInvocationID](glsl.md#gl-globalinvocationid) · SPIR-V [BuiltIn_GlobalInvocationId](spirv.md#builtin-globalinvocationid) · WGSL [@builtin_global_invocation_id](wgsl.md#builtin-global-invocation-id)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;
using YotsubaShader.MslSyntax.Types;

// Entrada de la etapa compute
public struct ComputeInput
{
    [thread_position_in_grid] public uint3 GlobalId;
}
```

### thread_position_in_threadgroup

Posición de la invocación dentro de su grupo de trabajo.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[LocalInvocationId]
public class thread_position_in_threadgroup : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.MslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `LocalInvocationId`
- **El mismo concepto en:** HLSL [SV_GroupThreadID](hlsl.md#sv-groupthreadid) · GLSL [gl_LocalInvocationID](glsl.md#gl-localinvocationid) · SPIR-V [BuiltIn_LocalInvocationId](spirv.md#builtin-localinvocationid) · WGSL [@builtin_local_invocation_id](wgsl.md#builtin-local-invocation-id)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;
using YotsubaShader.MslSyntax.Types;

// Entrada de la etapa compute
public struct ComputeInput
{
    [thread_position_in_threadgroup] public uint3 LocalId;
}
```

### threadgroup_position_in_grid

Posición del grupo de trabajo en el dispatch.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[WorkgroupId]
public class threadgroup_position_in_grid : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.MslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `WorkgroupId`
- **El mismo concepto en:** HLSL [SV_GroupID](hlsl.md#sv-groupid) · GLSL [gl_WorkGroupID](glsl.md#gl-workgroupid) · SPIR-V [BuiltIn_WorkgroupId](spirv.md#builtin-workgroupid) · WGSL [@builtin_workgroup_id](wgsl.md#builtin-workgroup-id)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;
using YotsubaShader.MslSyntax.Types;

// Entrada de la etapa compute
public struct ComputeInput
{
    [threadgroup_position_in_grid] public uint3 GroupId;
}
```

### threadgroups_per_grid

Cantidad de grupos de trabajo del dispatch.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[NumberOfWorkgroups]
public class threadgroups_per_grid : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.MslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `NumberOfWorkgroups`
- **El mismo concepto en:** GLSL [gl_NumWorkGroups](glsl.md#gl-numworkgroups) · SPIR-V [BuiltIn_NumWorkgroups](spirv.md#builtin-numworkgroups) · WGSL [@builtin_num_workgroups](wgsl.md#builtin-num-workgroups)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;
using YotsubaShader.MslSyntax.Types;

// Entrada de la etapa compute
public struct ComputeInput
{
    [threadgroups_per_grid] public uint3 GroupCount;
}
```

### threads_per_simdgroup

Cantidad de invocaciones de un subgrupo.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[SubgroupSize]
public class threads_per_simdgroup : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.MslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `SubgroupSize`
- **El mismo concepto en:** GLSL [gl_SubgroupSize](glsl.md#gl-subgroupsize) · SPIR-V [BuiltIn_SubgroupSize](spirv.md#builtin-subgroupsize) · WGSL [@builtin_subgroup_size](wgsl.md#builtin-subgroup-size)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;

// Entrada de la etapa compute
public struct ComputeInput
{
    [threads_per_simdgroup] public uint SubgroupSize;
}
```

### threads_per_threadgroup

Tamaño del grupo de trabajo, leído como un valor.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[WorkgroupSizeBuiltInValue]
public class threads_per_threadgroup : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.MslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `WorkgroupSizeBuiltInValue`
- **El mismo concepto en:** GLSL [gl_WorkGroupSize](glsl.md#gl-workgroupsize) · SPIR-V [BuiltIn_WorkgroupSize](spirv.md#builtin-workgroupsize)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;
using YotsubaShader.MslSyntax.Types;

// Entrada de la etapa compute
public struct ComputeInput
{
    [threads_per_threadgroup] public uint3 GroupSize;
}
```

### vertex_id

Índice del vértice que se está procesando.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[VertexIndex]
public class vertex_id() : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.MslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `VertexIndex`
- **El mismo concepto en:** HLSL [SV_VertexID](hlsl.md#sv-vertexid) · GLSL [gl_VertexIndex](glsl.md#gl-vertexindex) · SPIR-V [BuiltIn_VertexIndex](spirv.md#builtin-vertexindex) · WGSL [@builtin_vertex_index](wgsl.md#builtin-vertex-index)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;

// Entrada de la etapa de vértices
public struct VertexInput
{
    [vertex_id] public uint VertexIndex;
}
```

## Atributos de salida

Campos, parámetros y valores de retorno que produce la etapa.

### clip_distance

Distancia de recorte: un valor negativo recorta la primitiva contra un plano del usuario.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.Output)]
[ClipInstance]
public class clip_distance : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.MslSyntax`
- **Se aplica a:** campos, parámetros, valores de retorno
- **Concepto:** `ClipInstance`
- **El mismo concepto en:** HLSL [SV_ClipDistanceN](hlsl.md#sv-clipdistancen) · GLSL [gl_ClipDistance](glsl.md#gl-clipdistance) · SPIR-V [BuiltIn_ClipDistance](spirv.md#builtin-clipdistance) · WGSL [@builtin_clip_distances](wgsl.md#builtin-clip-distances)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;

// Salida de la etapa de vértices
public struct VertexOutput
{
    [clip_distance] public float ClipDistance;
}
```

### color

Salida del fragmento que se escribe en el color attachment `n`, `[[color(n)]]` en Metal.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.Output)]
[Location]
public class color(int n = 0) : YotsubaShaderConcept
{
    public int N;
}
```

- **Espacio de nombres:** `YotsubaShader.MslSyntax`
- **Se aplica a:** campos, parámetros, valores de retorno
- **Concepto:** `Location`
- **El mismo concepto en:** HLSL [SV_Target](hlsl.md#sv-target) · GLSL [location](glsl.md#location) · SPIR-V [Location](spirv.md#location) · WGSL [@location](wgsl.md#location)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;
using YotsubaShader.MslSyntax.Types;

// Salida de la etapa de fragmentos
public struct FragmentOutput
{
    [color] public float4 Color;
}
```

### depth

Salida de profundidad del fragmento. El modo `"any"` (por defecto) escribe cualquier profundidad; `"greater"` y `"less"` son profundidad conservadora.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.Output)]
[FragDepth, ConservativeDepth]
public class depth(string mode = "any") : YotsubaShaderConcept
{
    public string Mode { get; }
}
```

- **Espacio de nombres:** `YotsubaShader.MslSyntax`
- **Se aplica a:** campos, parámetros, valores de retorno
- **Concepto:** `FragDepth`, `ConservativeDepth`
- **El mismo concepto en:** HLSL [SV_Depth](hlsl.md#sv-depth), [SV_DepthGreaterEqual](hlsl.md#sv-depthgreaterequal), [SV_DepthLessEqual](hlsl.md#sv-depthlessequal) · GLSL [gl_FragDepth](glsl.md#gl-fragdepth) · SPIR-V [BuiltIn_FragDepth](spirv.md#builtin-fragdepth) · WGSL [@builtin_frag_depth](wgsl.md#builtin-frag-depth)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;

// Salida de la etapa de fragmentos
public struct FragmentOutput
{
    [depth] public float Depth;
}
```

### stencil

Valor de referencia de stencil que escribe la etapa de fragmentos.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.Output)]
[StencilReference]
public class stencil : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.MslSyntax`
- **Se aplica a:** campos, parámetros, valores de retorno
- **Concepto:** `StencilReference`
- **El mismo concepto en:** HLSL [SV_StencilRef](hlsl.md#sv-stencilref) · GLSL [gl_FragStencilRefARB](glsl.md#gl-fragstencilrefarb) · SPIR-V [BuiltIn_FragStencilRef](spirv.md#builtin-fragstencilref)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;

// Salida de la etapa de fragmentos
public struct FragmentOutput
{
    [stencil] public uint StencilRef;
}
```

## Atributos de entrada y salida

Valores que una etapa puede recibir o producir. La etapa decide cuál.

### position

Posición en espacio de recorte que escribe la etapa de vértices.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[ClipSpacePosition, FragmentCoordinate]
public class position : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.MslSyntax`
- **Se aplica a:** campos, parámetros, propiedades, valores de retorno
- **Concepto:** `ClipSpacePosition`, `FragmentCoordinate`
- **El mismo concepto en:** HLSL [SV_Position](hlsl.md#sv-position), [SV_POSITION](hlsl.md#sv-position) · GLSL [gl_Position](glsl.md#gl-position), [gl_FragCoord](glsl.md#gl-fragcoord) · SPIR-V [BuiltIn_Position](spirv.md#builtin-position), [BuiltIn_FragCoord](spirv.md#builtin-fragcoord) · WGSL [@builtin_position](wgsl.md#builtin-position)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;
using YotsubaShader.MslSyntax.Types;

// Salida de la etapa de vértices
public struct VertexOutput
{
    [position] public float4 Position;
}
```

### render_target_array_index

Capa del render target por capas que recibe la primitiva.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[RenderTargetLayer]
public class render_target_array_index : RenderTargetLayer;
```

- **Espacio de nombres:** `YotsubaShader.MslSyntax`
- **Se aplica a:** campos, parámetros, propiedades, valores de retorno
- **Concepto:** `RenderTargetLayer`
- **El mismo concepto en:** HLSL [SV_RenderTargetArrayIndex](hlsl.md#sv-rendertargetarrayindex) · GLSL [gl_Layer](glsl.md#gl-layer) · SPIR-V [BuiltIn_Layer](spirv.md#builtin-layer)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;

// Salida de la etapa de vértices
public struct VertexOutput
{
    [render_target_array_index] public uint Layer;
}
```

### sample_mask

Máscara de cobertura de las muestras del fragmento.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[SampleMask]
public class sample_mask : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.MslSyntax`
- **Se aplica a:** campos, parámetros, propiedades, valores de retorno
- **Concepto:** `SampleMask`
- **El mismo concepto en:** HLSL [SV_Coverage](hlsl.md#sv-coverage) · GLSL [gl_SampleMask](glsl.md#gl-samplemask), [gl_SampleMaskIn](glsl.md#gl-samplemaskin) · SPIR-V [BuiltIn_SampleMask](spirv.md#builtin-samplemask) · WGSL [@builtin_sample_mask](wgsl.md#builtin-sample-mask)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;

// Entrada de la etapa de fragmentos
public struct FragmentInput
{
    [sample_mask] public uint SampleMask;
}
```

### viewport_array_index

Viewport que recibe la primitiva.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[ViewportIndex]
public class viewport_array_index : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.MslSyntax`
- **Se aplica a:** campos, parámetros, propiedades, valores de retorno
- **Concepto:** `ViewportIndex`
- **El mismo concepto en:** HLSL [SV_ViewportArrayIndex](hlsl.md#sv-viewportarrayindex) · GLSL [gl_ViewportIndex](glsl.md#gl-viewportindex) · SPIR-V [BuiltIn_ViewportIndex](spirv.md#builtin-viewportindex)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;

// Salida de la etapa de vértices
public struct VertexOutput
{
    [viewport_array_index] public uint ViewportIndex;
}
```

## Atributos de recursos

Buffers uniformes, storage buffers y las ranuras de binding de buffers, texturas y samplers.

### buffer

Ranura de la tabla de argumentos de buffers, `[[buffer(n)]]` en Metal.

```csharp
namespace YotsubaShader.MslSyntax.Resources;

[AttributeUsage(AttributeUsagesTable.Resource)]
[BindingSlot]
public class buffer(int n) : YotsubaShaderConcept
{
    public int N;
}
```

- **Espacio de nombres:** `YotsubaShader.MslSyntax.Resources`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `BindingSlot`
- **El mismo concepto en:** HLSL [register](hlsl.md#register) · GLSL [layout](glsl.md#layout) · SPIR-V [Binding](spirv.md#binding), [DescriptorSet](spirv.md#descriptorset) · WGSL [@binding](wgsl.md#binding), [@group](wgsl.md#group)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;
using YotsubaShader.MslSyntax.Resources;

public struct Material
{
    // El contenido del buffer uniforme
    public float Exposure;
}

public class Resources
{
    [constant, buffer(0)]
    public Material Material;
}
```

### constant

Marca el campo como un buffer uniforme (constante).

```csharp
namespace YotsubaShader.MslSyntax.Resources;

[AttributeUsage(AttributeUsagesTable.Resource)]
[UniformBuffer]
public class constant : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.MslSyntax.Resources`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `UniformBuffer`
- **El mismo concepto en:** HLSL [cbuffer](hlsl.md#cbuffer) · GLSL [uniform](glsl.md#uniform) · SPIR-V [Uniform](spirv.md#uniform) · WGSL [uniform](wgsl.md#uniform)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;
using YotsubaShader.MslSyntax.Resources;

public struct Material
{
    // El contenido del buffer uniforme
    public float Exposure;
}

public class Resources
{
    [constant, buffer(0)]
    public Material Material;
}
```

### device

Storage buffer en el espacio de direcciones `device`. `readOnly: true` lo hace de solo lectura.

```csharp
namespace YotsubaShader.MslSyntax.Resources;

[AttributeUsage(AttributeUsagesTable.Resource)]
[RWStorageBuffer, ReadOnlyStorageBuffer]
public class device(bool readOnly = false) : YotsubaShaderConcept
{
    public bool ReadOnly;
}
```

- **Espacio de nombres:** `YotsubaShader.MslSyntax.Resources`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `RWStorageBuffer`, `ReadOnlyStorageBuffer`
- **El mismo concepto en:** GLSL [buffer](glsl.md#buffer) · SPIR-V [StorageBuffer](spirv.md#storagebuffer) · WGSL [storage](wgsl.md#storage)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;
using YotsubaShader.MslSyntax.Resources;

public class Resources
{
    [device, buffer(1)]
    public float[] Output;
}
```

### sampler

Ranura de la tabla de argumentos de samplers, `[[sampler(n)]]` en Metal.

```csharp
namespace YotsubaShader.MslSyntax.Resources;

[AttributeUsage(AttributeUsagesTable.Resource)]
[BindingSlot, SamplerSlot]
public class sampler(int n) : YotsubaShaderConcept
{
    public int N;
}
```

- **Espacio de nombres:** `YotsubaShader.MslSyntax.Resources`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `BindingSlot`, `SamplerSlot`
- **El mismo concepto en:** HLSL [register](hlsl.md#register) · GLSL [layout](glsl.md#layout) · SPIR-V [Binding](spirv.md#binding), [DescriptorSet](spirv.md#descriptorset) · WGSL [@binding](wgsl.md#binding), [@group](wgsl.md#group)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;
using YotsubaShader.MslSyntax.Resources;
using YotsubaShader.MslSyntax.Resources.Types;

public class Surface
{
    [sampler(0)]
    public sampler Sampler;
}
```

### texture

Ranura de la tabla de argumentos de texturas, `[[texture(n)]]` en Metal.

```csharp
namespace YotsubaShader.MslSyntax.Resources;

[AttributeUsage(AttributeUsagesTable.Resource)]
[BindingSlot, TextureSlot]
public class texture(int n) : YotsubaShaderConcept
{
    public int N;
}
```

- **Espacio de nombres:** `YotsubaShader.MslSyntax.Resources`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `BindingSlot`, `TextureSlot`
- **El mismo concepto en:** HLSL [register](hlsl.md#register) · GLSL [layout](glsl.md#layout) · SPIR-V [Binding](spirv.md#binding), [DescriptorSet](spirv.md#descriptorset) · WGSL [@binding](wgsl.md#binding), [@group](wgsl.md#group)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;
using YotsubaShader.MslSyntax.Resources;
using YotsubaShader.MslSyntax.Resources.Types;

public class Surface
{
    [texture(0)]
    public texture2d<float> Albedo;
}
```

## Tipos

Los tipos que declara el paquete. Los miembros aparecen sin su cuerpo.

### Tipos de texturas y samplers

```csharp
namespace YotsubaShader.MslSyntax.Resources.Types;

[Texture(TextureDimension.D2, TextureComponentTypes.GenericDefine, Depth = TextureDepth.Yes)]
public class depth2d<T> where T : unmanaged;

[Texture(TextureDimension.D2, TextureComponentTypes.GenericDefine, Depth = TextureDepth.Yes, Arrayed = true)]
public struct depth2d_array<T> where T : unmanaged;

[Texture(TextureDimension.Cube, TextureComponentTypes.GenericDefine, Depth = TextureDepth.Yes)]
public struct depthcube<T> where T : unmanaged;

[Texture(TextureDimension.Cube, TextureComponentTypes.GenericDefine, Depth = TextureDepth.Yes, Arrayed = true)]
public struct depthcube_array<T> where T : unmanaged;

[Sampler]
public struct sampler;

[Texture(TextureDimension.D1, TextureComponentTypes.GenericDefine)]
public struct texture1d<T> where T : unmanaged;

[Texture(TextureDimension.D1, TextureComponentTypes.GenericDefine, Arrayed = true)]
public struct texture1d_array<T> where T : unmanaged;

[Texture(TextureDimension.D2, TextureComponentTypes.GenericDefine)]
public struct texture2d<T> where T : unmanaged;

[Texture(TextureDimension.D2, TextureComponentTypes.GenericDefine, Arrayed = true)]
public struct texture2d_array<T> where T : unmanaged;

[Texture(TextureDimension.D2, TextureComponentTypes.GenericDefine, Multisampled = true)]
public struct texture2d_ms<T> where T : unmanaged;

[Texture(TextureDimension.D3, TextureComponentTypes.GenericDefine)]
public struct texture3d<T> where T : unmanaged;

[Texture(TextureDimension.Cube, TextureComponentTypes.GenericDefine)]
public struct texturecube<T> where T : unmanaged;

[Texture(TextureDimension.Cube, TextureComponentTypes.GenericDefine, Arrayed = true)]
public struct texturecube_array<T> where T : unmanaged;
```

### Tipos de vectores, matrices y auxiliares

```csharp
namespace YotsubaShader.MslSyntax.Types;

[IntrinsicOption]
public struct bias
{
    public float Value;
    public bias(float value);
}

[Vector]
public partial struct bool2
{
    [VectorComponent(0)]
    public bool X;
    [VectorComponent(1)]
    public bool Y;
}

[Vector]
public partial struct bool3
{
    [VectorComponent(0)]
    public bool X;
    [VectorComponent(1)]
    public bool Y;
    [VectorComponent(2)]
    public bool Z;
}

[Vector]
public partial struct bool4
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

[IntrinsicOption]
public struct component
{
    public int Value;
    public component(int value);
}

[Vector]
public partial struct float2
{
    [VectorComponent(0)]
    public float X;
    [VectorComponent(1)]
    public float Y;
}

[Matrix]
public partial struct float2x2
{
    [MatrixColumn(0)]
    public float2 C0;
    [MatrixColumn(1)]
    public float2 C1;
}

[Matrix]
public partial struct float2x3
{
    [MatrixColumn(0)]
    public float3 C0;
    [MatrixColumn(1)]
    public float3 C1;
}

[Matrix]
public partial struct float2x4
{
    [MatrixColumn(0)]
    public float4 C0;
    [MatrixColumn(1)]
    public float4 C1;
}

[Vector]
public partial struct float3
{
    [VectorComponent(0)]
    public float X;
    [VectorComponent(1)]
    public float Y;
    [VectorComponent(2)]
    public float Z;
}

[Matrix]
public partial struct float3x2
{
    [MatrixColumn(0)]
    public float2 C0;
    [MatrixColumn(1)]
    public float2 C1;
    [MatrixColumn(2)]
    public float2 C2;
}

[Matrix]
public partial struct float3x3
{
    [MatrixColumn(0)]
    public float3 C0;
    [MatrixColumn(1)]
    public float3 C1;
    [MatrixColumn(2)]
    public float3 C2;
}

[Matrix]
public partial struct float3x4
{
    [MatrixColumn(0)]
    public float4 C0;
    [MatrixColumn(1)]
    public float4 C1;
    [MatrixColumn(2)]
    public float4 C2;
}

[Vector]
public partial struct float4
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

[Matrix]
public partial struct float4x2
{
    [MatrixColumn(0)]
    public float2 C0;
    [MatrixColumn(1)]
    public float2 C1;
    [MatrixColumn(2)]
    public float2 C2;
    [MatrixColumn(3)]
    public float2 C3;
}

[Matrix]
public partial struct float4x3
{
    [MatrixColumn(0)]
    public float3 C0;
    [MatrixColumn(1)]
    public float3 C1;
    [MatrixColumn(2)]
    public float3 C2;
    [MatrixColumn(3)]
    public float3 C3;
}

[Matrix]
public partial struct float4x4
{
    [MatrixColumn(0)]
    public float4 C0;
    [MatrixColumn(1)]
    public float4 C1;
    [MatrixColumn(2)]
    public float4 C2;
    [MatrixColumn(3)]
    public float4 C3;
}

[IntrinsicOption]
public struct gradient2d
{
    public float2 DX;
    public float2 DY;
    public gradient2d(float2 dx, float2 dy);
}

[IntrinsicOption]
public struct gradient3d
{
    public float3 DX;
    public float3 DY;
    public gradient3d(float3 dx, float3 dy);
}

[IntrinsicOption]
public struct gradientcube
{
    public float3 DX;
    public float3 DY;
    public gradientcube(float3 dx, float3 dy);
}

[Vector]
public partial struct half2
{
    [VectorComponent(0)]
    public System.Half X;
    [VectorComponent(1)]
    public System.Half Y;
}

[Matrix]
public partial struct half2x2
{
    [MatrixColumn(0)]
    public half2 C0;
    [MatrixColumn(1)]
    public half2 C1;
}

[Matrix]
public partial struct half2x3
{
    [MatrixColumn(0)]
    public half3 C0;
    [MatrixColumn(1)]
    public half3 C1;
}

[Matrix]
public partial struct half2x4
{
    [MatrixColumn(0)]
    public half4 C0;
    [MatrixColumn(1)]
    public half4 C1;
}

[Vector]
public partial struct half3
{
    [VectorComponent(0)]
    public System.Half X;
    [VectorComponent(1)]
    public System.Half Y;
    [VectorComponent(2)]
    public System.Half Z;
}

[Matrix]
public partial struct half3x2
{
    [MatrixColumn(0)]
    public half2 C0;
    [MatrixColumn(1)]
    public half2 C1;
    [MatrixColumn(2)]
    public half2 C2;
}

[Matrix]
public partial struct half3x3
{
    [MatrixColumn(0)]
    public half3 C0;
    [MatrixColumn(1)]
    public half3 C1;
    [MatrixColumn(2)]
    public half3 C2;
}

[Matrix]
public partial struct half3x4
{
    [MatrixColumn(0)]
    public half4 C0;
    [MatrixColumn(1)]
    public half4 C1;
    [MatrixColumn(2)]
    public half4 C2;
}

[Vector]
public partial struct half4
{
    [VectorComponent(0)]
    public System.Half X;
    [VectorComponent(1)]
    public System.Half Y;
    [VectorComponent(2)]
    public System.Half Z;
    [VectorComponent(3)]
    public System.Half W;
}

[Matrix]
public partial struct half4x2
{
    [MatrixColumn(0)]
    public half2 C0;
    [MatrixColumn(1)]
    public half2 C1;
    [MatrixColumn(2)]
    public half2 C2;
    [MatrixColumn(3)]
    public half2 C3;
}

[Matrix]
public partial struct half4x3
{
    [MatrixColumn(0)]
    public half3 C0;
    [MatrixColumn(1)]
    public half3 C1;
    [MatrixColumn(2)]
    public half3 C2;
    [MatrixColumn(3)]
    public half3 C3;
}

[Matrix]
public partial struct half4x4
{
    [MatrixColumn(0)]
    public half4 C0;
    [MatrixColumn(1)]
    public half4 C1;
    [MatrixColumn(2)]
    public half4 C2;
    [MatrixColumn(3)]
    public half4 C3;
}

[Vector]
public partial struct int2
{
    [VectorComponent(0)]
    public int X;
    [VectorComponent(1)]
    public int Y;
}

[Vector]
public partial struct int3
{
    [VectorComponent(0)]
    public int X;
    [VectorComponent(1)]
    public int Y;
    [VectorComponent(2)]
    public int Z;
}

[Vector]
public partial struct int4
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

[IntrinsicOption]
public struct level
{
    public float Value;
    public level(float value);
}

[Vector]
public partial struct uint2
{
    [VectorComponent(0)]
    public uint X;
    [VectorComponent(1)]
    public uint Y;
}

[Vector]
public partial struct uint3
{
    [VectorComponent(0)]
    public uint X;
    [VectorComponent(1)]
    public uint Y;
    [VectorComponent(2)]
    public uint Z;
}

[Vector]
public partial struct uint4
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
public struct vec4<T> where T : unmanaged
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
[SPIR-V](spirv.md)
[WGSL](wgsl.md)
```

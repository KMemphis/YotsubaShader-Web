---
title: API de la sintaxis SPIR-V
summary: Todos los atributos y tipos del paquete YotsubaShader.SpirvSyntax, con su declaración, su concepto y un ejemplo.
order: 4
---

API del paquete `YotsubaShader.SpirvSyntax`: los 34 atributos y los tipos de la sintaxis SPIR-V, inspirada en **SPIR-V (Vulkan)**. Cada entrada muestra la declaración tal como la escribe el paquete, el concepto que el compilador lee de ella, el mismo concepto en las otras cuatro sintaxis y un ejemplo.

Agrega el paquete al proyecto de shaders:

```bash
dotnet add package YotsubaShader.SpirvSyntax
```

Para un recorrido guiado por la sintaxis, con cada valor integrado agrupado por etapa, mira la página [Sintaxis SPIR-V](../reference/spirv.md) de la Documentación.

## Espacios de nombres

El paquete reparte su API en estos espacios de nombres. Los atributos comunes a todas las sintaxis (`ShaderStage`, `Location`, `Uniform`...) están en `YotsubaShader.Language`.

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax; // Valores integrados, ranuras de interfaz y atributos de método
using YotsubaShader.SpirvSyntax.Resources; // Atributos de recursos y tipos de recursos
using YotsubaShader.SpirvSyntax.Resources.Type; // Tipos de vectores, matrices y auxiliares
using YotsubaShader.SpirvSyntax.Resources.Types; // Tipos de texturas y samplers
using YotsubaShader.SpirvSyntax.Types; // Tipos de vectores, matrices y auxiliares
```

## Atributos de entrada

Campos, parámetros y propiedades que reciben un valor del pipeline.

### BuiltIn_BaryCoord

Coordenadas baricéntricas del fragmento dentro de su triángulo.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[BarycentricCoordinates]
public class BuiltIn_BaryCoord : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.SpirvSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `BarycentricCoordinates`
- **El mismo concepto en:** HLSL [SV_Barycentrics](hlsl.md#sv-barycentrics) · GLSL [gl_BaryCoordEXT](glsl.md#gl-barycoordext) · MSL [barycentric_coord](msl.md#barycentric-coord)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;
using YotsubaShader.SpirvSyntax.Types;

// Entrada de la etapa de fragmentos
public struct FragmentInput
{
    [BuiltIn_BaryCoord] public vec3 Barycentrics;
}
```

### BuiltIn_BaryCoordNoPersp

Coordenadas baricéntricas sin corrección de perspectiva.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[BarycentricCoordinatesNoPerspective]
public class BuiltIn_BaryCoordNoPersp : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.SpirvSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `BarycentricCoordinatesNoPerspective`
- **El mismo concepto en:** GLSL [gl_BaryCoordNoPerspEXT](glsl.md#gl-barycoordnoperspext)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;
using YotsubaShader.SpirvSyntax.Types;

// Entrada de la etapa de fragmentos
public struct FragmentInput
{
    [BuiltIn_BaryCoordNoPersp] public vec3 BarycentricsNoPersp;
}
```

### BuiltIn_BaseInstance

Instancia base de la llamada de dibujo.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[BaseInstance]
public class BuiltIn_BaseInstance : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.SpirvSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `BaseInstance`
- **El mismo concepto en:** HLSL [SV_StartInstanceLocation](hlsl.md#sv-startinstancelocation) · GLSL [gl_BaseInstance](glsl.md#gl-baseinstance) · MSL [base_instance](msl.md#base-instance)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

// Entrada de la etapa de vértices
public struct VertexInput
{
    [BuiltIn_BaseInstance] public int BaseInstance;
}
```

### BuiltIn_BaseVertex

Vértice base de la llamada de dibujo.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[BaseVertex]
public class BuiltIn_BaseVertex : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.SpirvSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `BaseVertex`
- **El mismo concepto en:** HLSL [SV_StartVertexLocation](hlsl.md#sv-startvertexlocation) · GLSL [gl_BaseVertex](glsl.md#gl-basevertex) · MSL [base_vertex](msl.md#base-vertex)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

// Entrada de la etapa de vértices
public struct VertexInput
{
    [BuiltIn_BaseVertex] public int BaseVertex;
}
```

### BuiltIn_FragCoord

Coordenada en ventana del fragmento, que lee la etapa de fragmentos.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[FragmentCoordinate]
public class BuiltIn_FragCoord : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.SpirvSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `FragmentCoordinate`
- **El mismo concepto en:** HLSL [SV_Position](hlsl.md#sv-position), [SV_POSITION](hlsl.md#sv-position) · GLSL [gl_FragCoord](glsl.md#gl-fragcoord) · MSL [position](msl.md#position) · WGSL [@builtin_position](wgsl.md#builtin-position)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;
using YotsubaShader.SpirvSyntax.Types;

// Entrada de la etapa de fragmentos
public struct FragmentInput
{
    [BuiltIn_FragCoord] public vec4 FragCoord;
}
```

### BuiltIn_FrontFacing

`true` cuando el fragmento pertenece a una primitiva de cara frontal.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[FrontFacingFlag]
public class BuiltIn_FrontFacing : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.SpirvSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `FrontFacingFlag`
- **El mismo concepto en:** HLSL [SV_IsFrontFace](hlsl.md#sv-isfrontface) · GLSL [gl_FrontFacing](glsl.md#gl-frontfacing) · MSL [front_facing](msl.md#front-facing) · WGSL [@builtin_front_facing](wgsl.md#builtin-front-facing)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

// Entrada de la etapa de fragmentos
public struct FragmentInput
{
    [BuiltIn_FrontFacing] public bool IsFrontFace;
}
```

### BuiltIn_GlobalInvocationId

Posición de la invocación en todo el dispatch.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[GlobalInvocationId]
public class BuiltIn_GlobalInvocationId : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.SpirvSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `GlobalInvocationId`
- **El mismo concepto en:** HLSL [SV_DispatchThreadID](hlsl.md#sv-dispatchthreadid) · GLSL [gl_GlobalInvocationID](glsl.md#gl-globalinvocationid) · MSL [thread_position_in_grid](msl.md#thread-position-in-grid) · WGSL [@builtin_global_invocation_id](wgsl.md#builtin-global-invocation-id)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;
using YotsubaShader.SpirvSyntax.Types;

// Entrada de la etapa compute
public struct ComputeInput
{
    [BuiltIn_GlobalInvocationId] public uvec3 GlobalId;
}
```

### BuiltIn_HelperInvocation

`true` en las invocaciones auxiliares, que solo corren para calcular derivadas.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[HelperInvocation]
public class BuiltIn_HelperInvocation : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.SpirvSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `HelperInvocation`
- **El mismo concepto en:** GLSL [gl_HelperInvocation](glsl.md#gl-helperinvocation)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

// Entrada de la etapa de fragmentos
public struct FragmentInput
{
    [BuiltIn_HelperInvocation] public bool IsHelper;
}
```

### BuiltIn_InstanceIndex

Índice de la instancia que se está dibujando.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[InstanceIndex]
public class BuiltIn_InstanceIndex : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.SpirvSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `InstanceIndex`
- **El mismo concepto en:** HLSL [SV_InstanceID](hlsl.md#sv-instanceid) · GLSL [gl_InstanceIndex](glsl.md#gl-instanceindex) · MSL [instance_id](msl.md#instance-id) · WGSL [@builtin_instance_index](wgsl.md#builtin-instance-index)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

// Entrada de la etapa de vértices
public struct VertexInput
{
    [BuiltIn_InstanceIndex] public int InstanceIndex;
}
```

### BuiltIn_LocalInvocationId

Posición de la invocación dentro de su grupo de trabajo.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[LocalInvocationId]
public class BuiltIn_LocalInvocationId : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.SpirvSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `LocalInvocationId`
- **El mismo concepto en:** HLSL [SV_GroupThreadID](hlsl.md#sv-groupthreadid) · GLSL [gl_LocalInvocationID](glsl.md#gl-localinvocationid) · MSL [thread_position_in_threadgroup](msl.md#thread-position-in-threadgroup) · WGSL [@builtin_local_invocation_id](wgsl.md#builtin-local-invocation-id)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;
using YotsubaShader.SpirvSyntax.Types;

// Entrada de la etapa compute
public struct ComputeInput
{
    [BuiltIn_LocalInvocationId] public uvec3 LocalId;
}
```

### BuiltIn_LocalInvocationIndex

Índice aplanado de la invocación dentro de su grupo de trabajo.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[LocalInvocationIndex]
public class BuiltIn_LocalInvocationIndex : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.SpirvSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `LocalInvocationIndex`
- **El mismo concepto en:** HLSL [SV_GroupIndex](hlsl.md#sv-groupindex) · GLSL [gl_LocalInvocationIndex](glsl.md#gl-localinvocationindex) · MSL [thread_index_in_threadgroup](msl.md#thread-index-in-threadgroup) · WGSL [@builtin_local_invocation_index](wgsl.md#builtin-local-invocation-index)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

// Entrada de la etapa compute
public struct ComputeInput
{
    [BuiltIn_LocalInvocationIndex] public uint LocalIndex;
}
```

### BuiltIn_NumSubgroups

Cantidad de subgrupos del grupo de trabajo.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[NumberOfSubgroups]
public class BuiltIn_NumSubgroups : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.SpirvSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `NumberOfSubgroups`
- **El mismo concepto en:** GLSL [gl_NumSubgroups](glsl.md#gl-numsubgroups) · MSL [simdgroups_per_threadgroup](msl.md#simdgroups-per-threadgroup) · WGSL [@builtin_num_subgroups](wgsl.md#builtin-num-subgroups)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

// Entrada de la etapa compute
public struct ComputeInput
{
    [BuiltIn_NumSubgroups] public uint SubgroupCount;
}
```

### BuiltIn_NumWorkgroups

Cantidad de grupos de trabajo del dispatch.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[NumberOfWorkgroups]
public class BuiltIn_NumWorkgroups : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.SpirvSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `NumberOfWorkgroups`
- **El mismo concepto en:** GLSL [gl_NumWorkGroups](glsl.md#gl-numworkgroups) · MSL [threadgroups_per_grid](msl.md#threadgroups-per-grid) · WGSL [@builtin_num_workgroups](wgsl.md#builtin-num-workgroups)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;
using YotsubaShader.SpirvSyntax.Types;

// Entrada de la etapa compute
public struct ComputeInput
{
    [BuiltIn_NumWorkgroups] public uvec3 GroupCount;
}
```

### BuiltIn_PrimitiveId

Índice de la primitiva a la que pertenece el fragmento.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[PrimitiveIndex]
public class BuiltIn_PrimitiveId : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.SpirvSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `PrimitiveIndex`
- **El mismo concepto en:** HLSL [SV_PrimitiveID](hlsl.md#sv-primitiveid) · GLSL [gl_PrimitiveID](glsl.md#gl-primitiveid) · MSL [primitive_id](msl.md#primitive-id) · WGSL [@builtin_primitive_index](wgsl.md#builtin-primitive-index)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

// Entrada de la etapa de fragmentos
public struct FragmentInput
{
    [BuiltIn_PrimitiveId] public uint PrimitiveId;
}
```

### BuiltIn_SampleId

Índice de la muestra que se está sombreando (multimuestreo).

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[SampleIndex]
public class BuiltIn_SampleId : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.SpirvSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `SampleIndex`
- **El mismo concepto en:** HLSL [SV_SampleIndex](hlsl.md#sv-sampleindex) · GLSL [gl_SampleID](glsl.md#gl-sampleid) · MSL [sample_id](msl.md#sample-id) · WGSL [@builtin_sample_index](wgsl.md#builtin-sample-index)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

// Entrada de la etapa de fragmentos
public struct FragmentInput
{
    [BuiltIn_SampleId] public uint SampleIndex;
}
```

### BuiltIn_SamplePosition

Posición de la muestra actual dentro del píxel.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[SamplePosition]
public class BuiltIn_SamplePosition : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.SpirvSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `SamplePosition`
- **El mismo concepto en:** GLSL [gl_SamplePosition](glsl.md#gl-sampleposition)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;
using YotsubaShader.SpirvSyntax.Types;

// Entrada de la etapa de fragmentos
public struct FragmentInput
{
    [BuiltIn_SamplePosition] public vec2 SamplePosition;
}
```

### BuiltIn_SubgroupId

Índice del subgrupo dentro del grupo de trabajo.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[SubgroupId]
public class BuiltIn_SubgroupId : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.SpirvSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `SubgroupId`
- **El mismo concepto en:** GLSL [gl_SubgroupID](glsl.md#gl-subgroupid) · MSL [simdgroup_index_in_threadgroup](msl.md#simdgroup-index-in-threadgroup) · WGSL [@builtin_subgroup_id](wgsl.md#builtin-subgroup-id)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

// Entrada de la etapa compute
public struct ComputeInput
{
    [BuiltIn_SubgroupId] public uint SubgroupId;
}
```

### BuiltIn_SubgroupInvocationId

Índice de la invocación dentro de su subgrupo.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[SubgroupInvocationId]
public class BuiltIn_SubgroupInvocationId : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.SpirvSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `SubgroupInvocationId`
- **El mismo concepto en:** GLSL [gl_SubgroupInvocationID](glsl.md#gl-subgroupinvocationid) · MSL [thread_index_in_simdgroup](msl.md#thread-index-in-simdgroup) · WGSL [@builtin_subgroup_invocation_id](wgsl.md#builtin-subgroup-invocation-id)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

// Entrada de la etapa compute
public struct ComputeInput
{
    [BuiltIn_SubgroupInvocationId] public uint SubgroupLane;
}
```

### BuiltIn_SubgroupSize

Cantidad de invocaciones de un subgrupo.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[SubgroupSize]
public class BuiltIn_SubgroupSize : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.SpirvSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `SubgroupSize`
- **El mismo concepto en:** GLSL [gl_SubgroupSize](glsl.md#gl-subgroupsize) · MSL [threads_per_simdgroup](msl.md#threads-per-simdgroup) · WGSL [@builtin_subgroup_size](wgsl.md#builtin-subgroup-size)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

// Entrada de la etapa compute
public struct ComputeInput
{
    [BuiltIn_SubgroupSize] public uint SubgroupSize;
}
```

### BuiltIn_VertexIndex

Índice del vértice que se está procesando.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[VertexIndex]
public class BuiltIn_VertexIndex : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.SpirvSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `VertexIndex`
- **El mismo concepto en:** HLSL [SV_VertexID](hlsl.md#sv-vertexid) · GLSL [gl_VertexIndex](glsl.md#gl-vertexindex) · MSL [vertex_id](msl.md#vertex-id) · WGSL [@builtin_vertex_index](wgsl.md#builtin-vertex-index)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

// Entrada de la etapa de vértices
public struct VertexInput
{
    [BuiltIn_VertexIndex] public int VertexIndex;
}
```

### BuiltIn_WorkgroupId

Posición del grupo de trabajo en el dispatch.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[WorkgroupId]
public class BuiltIn_WorkgroupId : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.SpirvSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `WorkgroupId`
- **El mismo concepto en:** HLSL [SV_GroupID](hlsl.md#sv-groupid) · GLSL [gl_WorkGroupID](glsl.md#gl-workgroupid) · MSL [threadgroup_position_in_grid](msl.md#threadgroup-position-in-grid) · WGSL [@builtin_workgroup_id](wgsl.md#builtin-workgroup-id)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;
using YotsubaShader.SpirvSyntax.Types;

// Entrada de la etapa compute
public struct ComputeInput
{
    [BuiltIn_WorkgroupId] public uvec3 GroupId;
}
```

### BuiltIn_WorkgroupSize

Tamaño del grupo de trabajo, leído como un valor.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[WorkgroupSizeBuiltInValue]
public class BuiltIn_WorkgroupSize : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.SpirvSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `WorkgroupSizeBuiltInValue`
- **El mismo concepto en:** GLSL [gl_WorkGroupSize](glsl.md#gl-workgroupsize) · MSL [threads_per_threadgroup](msl.md#threads-per-threadgroup)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;
using YotsubaShader.SpirvSyntax.Types;

// Entrada de la etapa compute
public struct ComputeInput
{
    [BuiltIn_WorkgroupSize] public uvec3 GroupSize;
}
```

## Atributos de salida

Campos, parámetros y valores de retorno que produce la etapa.

### BuiltIn_FragDepth

Profundidad que escribe la etapa de fragmentos, en lugar de la interpolada.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Output)]
[FragDepth]
public class BuiltIn_FragDepth : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.SpirvSyntax`
- **Se aplica a:** campos, parámetros, valores de retorno
- **Concepto:** `FragDepth`
- **El mismo concepto en:** HLSL [SV_Depth](hlsl.md#sv-depth) · GLSL [gl_FragDepth](glsl.md#gl-fragdepth) · MSL [depth](msl.md#depth) · WGSL [@builtin_frag_depth](wgsl.md#builtin-frag-depth)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

// Salida de la etapa de fragmentos
public struct FragmentOutput
{
    [BuiltIn_FragDepth] public float Depth;
}
```

### BuiltIn_FragStencilRef

Valor de referencia de stencil que escribe la etapa de fragmentos.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Output)]
[StencilReference]
public class BuiltIn_FragStencilRef : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.SpirvSyntax`
- **Se aplica a:** campos, parámetros, valores de retorno
- **Concepto:** `StencilReference`
- **El mismo concepto en:** HLSL [SV_StencilRef](hlsl.md#sv-stencilref) · GLSL [gl_FragStencilRefARB](glsl.md#gl-fragstencilrefarb) · MSL [stencil](msl.md#stencil)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

// Salida de la etapa de fragmentos
public struct FragmentOutput
{
    [BuiltIn_FragStencilRef] public uint StencilRef;
}
```

## Atributos de entrada y salida

Valores que una etapa puede recibir o producir. La etapa decide cuál.

### BuiltIn_ClipDistance

Distancia de recorte: un valor negativo recorta la primitiva contra un plano del usuario.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[ClipInstance]
public class BuiltIn_ClipDistance : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.SpirvSyntax`
- **Se aplica a:** campos, parámetros, propiedades, valores de retorno
- **Concepto:** `ClipInstance`
- **El mismo concepto en:** HLSL [SV_ClipDistanceN](hlsl.md#sv-clipdistancen) · GLSL [gl_ClipDistance](glsl.md#gl-clipdistance) · MSL [clip_distance](msl.md#clip-distance) · WGSL [@builtin_clip_distances](wgsl.md#builtin-clip-distances)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

// Salida de la etapa de vértices
public struct VertexOutput
{
    [BuiltIn_ClipDistance] public float ClipDistance;
}
```

### BuiltIn_Layer

Capa del render target por capas que recibe la primitiva.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[RenderTargetLayer]
public class BuiltIn_Layer : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.SpirvSyntax`
- **Se aplica a:** campos, parámetros, propiedades, valores de retorno
- **Concepto:** `RenderTargetLayer`
- **El mismo concepto en:** HLSL [SV_RenderTargetArrayIndex](hlsl.md#sv-rendertargetarrayindex) · GLSL [gl_Layer](glsl.md#gl-layer) · MSL [render_target_array_index](msl.md#render-target-array-index)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

// Salida de la etapa de vértices
public struct VertexOutput
{
    [BuiltIn_Layer] public uint Layer;
}
```

### BuiltIn_Position

Posición en espacio de recorte que escribe la etapa de vértices.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[ClipSpacePosition]
public class BuiltIn_Position : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.SpirvSyntax`
- **Se aplica a:** campos, parámetros, propiedades, valores de retorno
- **Concepto:** `ClipSpacePosition`
- **El mismo concepto en:** HLSL [SV_Position](hlsl.md#sv-position), [SV_POSITION](hlsl.md#sv-position) · GLSL [gl_Position](glsl.md#gl-position) · MSL [position](msl.md#position) · WGSL [@builtin_position](wgsl.md#builtin-position)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;
using YotsubaShader.SpirvSyntax.Types;

// Salida de la etapa de vértices
public struct VertexOutput
{
    [BuiltIn_Position] public vec4 Position;
}
```

### BuiltIn_SampleMask

Máscara de cobertura de las muestras del fragmento.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[SampleMask]
public class BuiltIn_SampleMask : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.SpirvSyntax`
- **Se aplica a:** campos, parámetros, propiedades, valores de retorno
- **Concepto:** `SampleMask`
- **El mismo concepto en:** HLSL [SV_Coverage](hlsl.md#sv-coverage) · GLSL [gl_SampleMask](glsl.md#gl-samplemask), [gl_SampleMaskIn](glsl.md#gl-samplemaskin) · MSL [sample_mask](msl.md#sample-mask) · WGSL [@builtin_sample_mask](wgsl.md#builtin-sample-mask)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

// Entrada de la etapa de fragmentos
public struct FragmentInput
{
    [BuiltIn_SampleMask] public uint SampleMask;
}
```

### BuiltIn_ViewportIndex

Viewport que recibe la primitiva.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[ViewportIndex]
public class BuiltIn_ViewportIndex : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.SpirvSyntax`
- **Se aplica a:** campos, parámetros, propiedades, valores de retorno
- **Concepto:** `ViewportIndex`
- **El mismo concepto en:** HLSL [SV_ViewportArrayIndex](hlsl.md#sv-viewportarrayindex) · GLSL [gl_ViewportIndex](glsl.md#gl-viewportindex) · MSL [viewport_array_index](msl.md#viewport-array-index)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

// Salida de la etapa de vértices
public struct VertexOutput
{
    [BuiltIn_ViewportIndex] public uint ViewportIndex;
}
```

### Location

Ranura numerada de la interfaz: entradas de vértice, valores que pasan entre etapas y salidas de fragmento.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[YotsubaShader.Concepts.LocationAttribute]
public class Location(int index = 0) : YotsubaShaderConcept
{
    public int Index;
}
```

- **Espacio de nombres:** `YotsubaShader.SpirvSyntax`
- **Se aplica a:** campos, parámetros, propiedades, valores de retorno
- **Concepto:** `Location`
- **El mismo concepto en:** HLSL [SV_Target](hlsl.md#sv-target) · GLSL [location](glsl.md#location) · MSL [attribute](msl.md#attribute), [color](msl.md#color) · WGSL [@location](wgsl.md#location)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;
using YotsubaShader.SpirvSyntax.Types;

// Salida de la etapa de vértices
public struct VertexOutput
{
    [Location] public vec4 Color;
}
```

## Atributos de recursos

Buffers uniformes, storage buffers y las ranuras de binding de buffers, texturas y samplers.

### Binding

Número de binding de un recurso dentro de su descriptor set. En C# se escribe `@Binding`.

```csharp
namespace YotsubaShader.SpirvSyntax.Resources;

[AttributeUsage(AttributeUsagesTable.Resource)]
[BindingSlot, TextureSlot, SamplerSlot]
public class Binding(int n) : YotsubaShaderConcept
{
    public int N;
}
```

- **Espacio de nombres:** `YotsubaShader.SpirvSyntax.Resources`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `BindingSlot`, `TextureSlot`, `SamplerSlot`
- **El mismo concepto en:** HLSL [register](hlsl.md#register) · GLSL [layout](glsl.md#layout) · MSL [buffer](msl.md#buffer), [sampler](msl.md#sampler), [texture](msl.md#texture) · WGSL [@binding](wgsl.md#binding), [@group](wgsl.md#group)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;
using YotsubaShader.SpirvSyntax.Resources;
using YotsubaShader.SpirvSyntax.Resources.Types;

public class Surface
{
    [DescriptorSet(0), @Binding(0)]
    public sampler2D Albedo;
}
```

### DescriptorSet

Descriptor set de un recurso. Se usa junto con `Binding`.

```csharp
namespace YotsubaShader.SpirvSyntax.Resources;

[AttributeUsage(AttributeUsagesTable.Resource)]
[BindingSlot, TextureSlot, SamplerSlot]
public class DescriptorSet(int s) : YotsubaShaderConcept
{
    public int S;
}
```

- **Espacio de nombres:** `YotsubaShader.SpirvSyntax.Resources`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `BindingSlot`, `TextureSlot`, `SamplerSlot`
- **El mismo concepto en:** HLSL [register](hlsl.md#register) · GLSL [layout](glsl.md#layout) · MSL [buffer](msl.md#buffer), [sampler](msl.md#sampler), [texture](msl.md#texture) · WGSL [@binding](wgsl.md#binding), [@group](wgsl.md#group)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;
using YotsubaShader.SpirvSyntax.Resources;
using YotsubaShader.SpirvSyntax.Resources.Types;

public class Surface
{
    [DescriptorSet(0), @Binding(0)]
    public sampler2D Albedo;
}
```

### StorageBuffer

Marca el campo como un storage buffer, de lectura y escritura o de solo lectura.

```csharp
namespace YotsubaShader.SpirvSyntax.Resources;

[AttributeUsage(AttributeUsagesTable.Resource)]
[RWStorageBuffer, ReadOnlyStorageBuffer]
public class StorageBuffer : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.SpirvSyntax.Resources`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `RWStorageBuffer`, `ReadOnlyStorageBuffer`
- **El mismo concepto en:** GLSL [buffer](glsl.md#buffer) · MSL [device](msl.md#device) · WGSL [storage](wgsl.md#storage)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;
using YotsubaShader.SpirvSyntax.Resources;

public class Resources
{
    [StorageBuffer, DescriptorSet(0), @Binding(1)]
    public float[] Output;
}
```

### Uniform

Marca el campo como un buffer uniforme (constante).

```csharp
namespace YotsubaShader.SpirvSyntax.Resources;

[AttributeUsage(AttributeUsagesTable.Resource)]
[UniformBuffer]
public class Uniform : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.SpirvSyntax.Resources`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `UniformBuffer`
- **El mismo concepto en:** HLSL [cbuffer](hlsl.md#cbuffer) · GLSL [uniform](glsl.md#uniform) · MSL [constant](msl.md#constant) · WGSL [uniform](wgsl.md#uniform)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;
using YotsubaShader.SpirvSyntax.Resources;

public struct Material
{
    // El contenido del buffer uniforme
    public float Exposure;
}

public class Resources
{
    [Uniform, DescriptorSet(0), @Binding(0)]
    public Material Material;
}
```

## Tipos

Los tipos que declara el paquete. Los miembros aparecen sin su cuerpo.

### Tipos de texturas y samplers

```csharp
namespace YotsubaShader.SpirvSyntax.Resources.Types;

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
namespace YotsubaShader.SpirvSyntax.Types;

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

[Texture(TextureDimension.D1, TextureComponentTypes.GenericDefine)]
public struct Image1D<T> where T : unmanaged;

[Texture(TextureDimension.D2, TextureComponentTypes.GenericDefine)]
public struct Image2D<T> where T : unmanaged;

[Texture(TextureDimension.D3, TextureComponentTypes.GenericDefine)]
public struct Image3D<T> where T : unmanaged;

[Texture(TextureDimension.Cube, TextureComponentTypes.GenericDefine)]
public struct ImageCube<T> where T : unmanaged;

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

[Sampler]
public struct Sampler;

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
[GLSL](glsl.md)
[MSL](msl.md)
[WGSL](wgsl.md)
```

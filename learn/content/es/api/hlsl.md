---
title: API de la sintaxis HLSL
summary: Todos los atributos y tipos del paquete YotsubaShader.HlslSyntax, con su declaración, su concepto y un ejemplo.
order: 1
---

API del paquete `YotsubaShader.HlslSyntax`: los 32 atributos y los tipos de la sintaxis HLSL, inspirada en **HLSL (Direct3D)**. Cada entrada muestra la declaración tal como la escribe el paquete, el concepto que el compilador lee de ella, el mismo concepto en las otras cuatro sintaxis y un ejemplo.

Agrega el paquete al proyecto de shaders:

```bash
dotnet add package YotsubaShader.HlslSyntax
```

Para un recorrido guiado por la sintaxis, con cada valor integrado agrupado por etapa, mira la página [Sintaxis HLSL](../reference/hlsl.md) de la Documentación.

## Espacios de nombres

El paquete reparte su API en estos espacios de nombres. Los atributos comunes a todas las sintaxis (`ShaderStage`, `Location`, `Uniform`...) están en `YotsubaShader.Language`.

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax; // Valores integrados, ranuras de interfaz y atributos de método
using YotsubaShader.HlslSyntax.Resources; // Atributos de recursos y tipos de recursos
using YotsubaShader.HlslSyntax.Resources.Types; // Tipos de texturas y samplers
using YotsubaShader.HlslSyntax.Types; // Tipos de vectores, matrices y auxiliares
```

## Atributos de entrada

Campos, parámetros y propiedades que reciben un valor del pipeline.

### SV_Barycentrics

Coordenadas baricéntricas del fragmento dentro de su triángulo.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[BarycentricCoordinates]
public class SV_Barycentrics : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.HlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `BarycentricCoordinates`
- **El mismo concepto en:** GLSL [gl_BaryCoordEXT](glsl.md#gl-barycoordext) · MSL [barycentric_coord](msl.md#barycentric-coord) · SPIR-V [BuiltIn_BaryCoord](spirv.md#builtin-barycoord)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;
using YotsubaShader.HlslSyntax.Types;

// Entrada de la etapa de fragmentos
public struct FragmentInput
{
    [SV_Barycentrics] public float3 Barycentrics;
}
```

### SV_DispatchThreadID

Posición de la invocación en todo el dispatch.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[GlobalInvocationId]
public class SV_DispatchThreadID : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.HlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `GlobalInvocationId`
- **El mismo concepto en:** GLSL [gl_GlobalInvocationID](glsl.md#gl-globalinvocationid) · MSL [thread_position_in_grid](msl.md#thread-position-in-grid) · SPIR-V [BuiltIn_GlobalInvocationId](spirv.md#builtin-globalinvocationid) · WGSL [@builtin_global_invocation_id](wgsl.md#builtin-global-invocation-id)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;
using YotsubaShader.HlslSyntax.Types;

// Entrada de la etapa compute
public struct ComputeInput
{
    [SV_DispatchThreadID] public uint3 GlobalId;
}
```

### SV_GroupID

Posición del grupo de trabajo en el dispatch.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[WorkgroupId]
public class SV_GroupID : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.HlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `WorkgroupId`
- **El mismo concepto en:** GLSL [gl_WorkGroupID](glsl.md#gl-workgroupid) · MSL [threadgroup_position_in_grid](msl.md#threadgroup-position-in-grid) · SPIR-V [BuiltIn_WorkgroupId](spirv.md#builtin-workgroupid) · WGSL [@builtin_workgroup_id](wgsl.md#builtin-workgroup-id)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;
using YotsubaShader.HlslSyntax.Types;

// Entrada de la etapa compute
public struct ComputeInput
{
    [SV_GroupID] public uint3 GroupId;
}
```

### SV_GroupIndex

Índice aplanado de la invocación dentro de su grupo de trabajo.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[LocalInvocationIndex]
public class SV_GroupIndex : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.HlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `LocalInvocationIndex`
- **El mismo concepto en:** GLSL [gl_LocalInvocationIndex](glsl.md#gl-localinvocationindex) · MSL [thread_index_in_threadgroup](msl.md#thread-index-in-threadgroup) · SPIR-V [BuiltIn_LocalInvocationIndex](spirv.md#builtin-localinvocationindex) · WGSL [@builtin_local_invocation_index](wgsl.md#builtin-local-invocation-index)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

// Entrada de la etapa compute
public struct ComputeInput
{
    [SV_GroupIndex] public uint LocalIndex;
}
```

### SV_GroupThreadID

Posición de la invocación dentro de su grupo de trabajo.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[LocalInvocationId]
public class SV_GroupThreadID : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.HlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `LocalInvocationId`
- **El mismo concepto en:** GLSL [gl_LocalInvocationID](glsl.md#gl-localinvocationid) · MSL [thread_position_in_threadgroup](msl.md#thread-position-in-threadgroup) · SPIR-V [BuiltIn_LocalInvocationId](spirv.md#builtin-localinvocationid) · WGSL [@builtin_local_invocation_id](wgsl.md#builtin-local-invocation-id)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;
using YotsubaShader.HlslSyntax.Types;

// Entrada de la etapa compute
public struct ComputeInput
{
    [SV_GroupThreadID] public uint3 LocalId;
}
```

### SV_InstanceID

Índice de la instancia que se está dibujando.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[InstanceIndex]
public class SV_InstanceID : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.HlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `InstanceIndex`
- **El mismo concepto en:** GLSL [gl_InstanceIndex](glsl.md#gl-instanceindex) · MSL [instance_id](msl.md#instance-id) · SPIR-V [BuiltIn_InstanceIndex](spirv.md#builtin-instanceindex) · WGSL [@builtin_instance_index](wgsl.md#builtin-instance-index)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

// Entrada de la etapa de vértices
public struct VertexInput
{
    [SV_InstanceID] public uint InstanceIndex;
}
```

### SV_IsFrontFace

`true` cuando el fragmento pertenece a una primitiva de cara frontal.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[FrontFacingFlag]
public class SV_IsFrontFace : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.HlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `FrontFacingFlag`
- **El mismo concepto en:** GLSL [gl_FrontFacing](glsl.md#gl-frontfacing) · MSL [front_facing](msl.md#front-facing) · SPIR-V [BuiltIn_FrontFacing](spirv.md#builtin-frontfacing) · WGSL [@builtin_front_facing](wgsl.md#builtin-front-facing)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

// Entrada de la etapa de fragmentos
public struct FragmentInput
{
    [SV_IsFrontFace] public bool IsFrontFace;
}
```

### SV_PrimitiveID

Índice de la primitiva a la que pertenece el fragmento.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[PrimitiveIndex]
public class SV_PrimitiveID : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.HlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `PrimitiveIndex`
- **El mismo concepto en:** GLSL [gl_PrimitiveID](glsl.md#gl-primitiveid) · MSL [primitive_id](msl.md#primitive-id) · SPIR-V [BuiltIn_PrimitiveId](spirv.md#builtin-primitiveid) · WGSL [@builtin_primitive_index](wgsl.md#builtin-primitive-index)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

// Entrada de la etapa de fragmentos
public struct FragmentInput
{
    [SV_PrimitiveID] public uint PrimitiveId;
}
```

### SV_SampleIndex

Índice de la muestra que se está sombreando (multimuestreo).

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[SampleIndex]
public class SV_SampleIndex : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.HlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `SampleIndex`
- **El mismo concepto en:** GLSL [gl_SampleID](glsl.md#gl-sampleid) · MSL [sample_id](msl.md#sample-id) · SPIR-V [BuiltIn_SampleId](spirv.md#builtin-sampleid) · WGSL [@builtin_sample_index](wgsl.md#builtin-sample-index)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

// Entrada de la etapa de fragmentos
public struct FragmentInput
{
    [SV_SampleIndex] public uint SampleIndex;
}
```

### SV_StartInstanceLocation

Instancia base de la llamada de dibujo.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[BaseInstance]
public class SV_StartInstanceLocation : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.HlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `BaseInstance`
- **El mismo concepto en:** GLSL [gl_BaseInstance](glsl.md#gl-baseinstance) · MSL [base_instance](msl.md#base-instance) · SPIR-V [BuiltIn_BaseInstance](spirv.md#builtin-baseinstance)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

// Entrada de la etapa de vértices
public struct VertexInput
{
    [SV_StartInstanceLocation] public uint BaseInstance;
}
```

### SV_StartVertexLocation

Vértice base de la llamada de dibujo.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[BaseVertex]
public class SV_StartVertexLocation : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.HlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `BaseVertex`
- **El mismo concepto en:** GLSL [gl_BaseVertex](glsl.md#gl-basevertex) · MSL [base_vertex](msl.md#base-vertex) · SPIR-V [BuiltIn_BaseVertex](spirv.md#builtin-basevertex)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

// Entrada de la etapa de vértices
public struct VertexInput
{
    [SV_StartVertexLocation] public uint BaseVertex;
}
```

### SV_VertexID

Índice del vértice que se está procesando.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[VertexIndex]
public class SV_VertexID() : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.HlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `VertexIndex`
- **El mismo concepto en:** GLSL [gl_VertexIndex](glsl.md#gl-vertexindex) · MSL [vertex_id](msl.md#vertex-id) · SPIR-V [BuiltIn_VertexIndex](spirv.md#builtin-vertexindex) · WGSL [@builtin_vertex_index](wgsl.md#builtin-vertex-index)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

// Entrada de la etapa de vértices
public struct VertexInput
{
    [SV_VertexID] public uint VertexIndex;
}
```

## Atributos de salida

Campos, parámetros y valores de retorno que produce la etapa.

### SV_Depth

Profundidad que escribe la etapa de fragmentos, en lugar de la interpolada.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.Output)]
[FragDepth]
public class SV_Depth : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.HlslSyntax`
- **Se aplica a:** campos, parámetros, valores de retorno
- **Concepto:** `FragDepth`
- **El mismo concepto en:** GLSL [gl_FragDepth](glsl.md#gl-fragdepth) · MSL [depth](msl.md#depth) · SPIR-V [BuiltIn_FragDepth](spirv.md#builtin-fragdepth) · WGSL [@builtin_frag_depth](wgsl.md#builtin-frag-depth)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

// Salida de la etapa de fragmentos
public struct FragmentOutput
{
    [SV_Depth] public float Depth;
}
```

### SV_DepthGreaterEqual

Profundidad del fragmento que nunca es menor que la interpolada (profundidad conservadora).

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.Output)]
[ConservativeDepth]
public class SV_DepthGreaterEqual : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.HlslSyntax`
- **Se aplica a:** campos, parámetros, valores de retorno
- **Concepto:** `ConservativeDepth`
- **El mismo concepto en:** MSL [depth](msl.md#depth)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

// Salida de la etapa de fragmentos
public struct FragmentOutput
{
    [SV_DepthGreaterEqual] public float Depth;
}
```

### SV_DepthLessEqual

Profundidad del fragmento que nunca es mayor que la interpolada (profundidad conservadora).

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.Output)]
[ConservativeDepth]
public class SV_DepthLessEqual : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.HlslSyntax`
- **Se aplica a:** campos, parámetros, valores de retorno
- **Concepto:** `ConservativeDepth`
- **El mismo concepto en:** MSL [depth](msl.md#depth)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

// Salida de la etapa de fragmentos
public struct FragmentOutput
{
    [SV_DepthLessEqual] public float Depth;
}
```

### SV_StencilRef

Valor de referencia de stencil que escribe la etapa de fragmentos.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.Output)]
[StencilReference]
public class SV_StencilRef : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.HlslSyntax`
- **Se aplica a:** campos, parámetros, valores de retorno
- **Concepto:** `StencilReference`
- **El mismo concepto en:** GLSL [gl_FragStencilRefARB](glsl.md#gl-fragstencilrefarb) · MSL [stencil](msl.md#stencil) · SPIR-V [BuiltIn_FragStencilRef](spirv.md#builtin-fragstencilref)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

// Salida de la etapa de fragmentos
public struct FragmentOutput
{
    [SV_StencilRef] public uint StencilRef;
}
```

### SV_Target

Salida del fragmento que se escribe en el color target `n`.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.Output)]
[Location]
public class SV_Target(int n = 0) : YotsubaShaderConcept
{
    public int N;
}
```

- **Espacio de nombres:** `YotsubaShader.HlslSyntax`
- **Se aplica a:** campos, parámetros, valores de retorno
- **Concepto:** `Location`
- **El mismo concepto en:** GLSL [location](glsl.md#location) · MSL [attribute](msl.md#attribute), [color](msl.md#color) · SPIR-V [Location](spirv.md#location) · WGSL [@location](wgsl.md#location)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;
using YotsubaShader.HlslSyntax.Types;

// Salida de la etapa de fragmentos
public struct FragmentOutput
{
    [SV_Target] public float4 Color;
}
```

## Atributos de entrada y salida

Valores que una etapa puede recibir o producir. La etapa decide cuál.

### BINORMAL

Semántica de usuario con nombre. El backend la convierte en una ubicación numerada.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[UserSemantic]
public class BINORMAL(int index = 0) : YotsubaShaderConcept
{
    public int Index;
}
```

- **Espacio de nombres:** `YotsubaShader.HlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades, valores de retorno
- **Concepto:** `UserSemantic`
- **El mismo concepto en:** ninguna otra sintaxis

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;
using YotsubaShader.HlslSyntax.Types;

// Salida de la etapa de vértices
public struct VertexOutput
{
    [BINORMAL] public float4 Value;
}
```

### COLOR

Semántica de usuario con nombre. El backend la convierte en una ubicación numerada.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[UserSemantic]
public class COLOR(int index = 0) : YotsubaShaderConcept
{
    public int Index;
}
```

- **Espacio de nombres:** `YotsubaShader.HlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades, valores de retorno
- **Concepto:** `UserSemantic`
- **El mismo concepto en:** ninguna otra sintaxis

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;
using YotsubaShader.HlslSyntax.Types;

// Salida de la etapa de vértices
public struct VertexOutput
{
    [COLOR] public float4 Value;
}
```

### NORMAL

Semántica de usuario con nombre. El backend la convierte en una ubicación numerada.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[UserSemantic]
public class NORMAL(int index = 0) : YotsubaShaderConcept
{
    public int Index;
}
```

- **Espacio de nombres:** `YotsubaShader.HlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades, valores de retorno
- **Concepto:** `UserSemantic`
- **El mismo concepto en:** ninguna otra sintaxis

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;
using YotsubaShader.HlslSyntax.Types;

// Salida de la etapa de vértices
public struct VertexOutput
{
    [NORMAL] public float4 Value;
}
```

### POSITION

Semántica de usuario con nombre. El backend la convierte en una ubicación numerada.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[UserSemantic]
public class POSITION(int index = 0) : YotsubaShaderConcept
{
    public int Index;
}
```

- **Espacio de nombres:** `YotsubaShader.HlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades, valores de retorno
- **Concepto:** `UserSemantic`
- **El mismo concepto en:** ninguna otra sintaxis

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;
using YotsubaShader.HlslSyntax.Types;

// Salida de la etapa de vértices
public struct VertexOutput
{
    [POSITION] public float4 Value;
}
```

### SV_ClipDistanceN

Distancia de recorte: un valor negativo recorta la primitiva contra un plano del usuario.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[ClipInstance]
public class SV_ClipDistanceN : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.HlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades, valores de retorno
- **Concepto:** `ClipInstance`
- **El mismo concepto en:** GLSL [gl_ClipDistance](glsl.md#gl-clipdistance) · MSL [clip_distance](msl.md#clip-distance) · SPIR-V [BuiltIn_ClipDistance](spirv.md#builtin-clipdistance) · WGSL [@builtin_clip_distances](wgsl.md#builtin-clip-distances)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

// Salida de la etapa de vértices
public struct VertexOutput
{
    [SV_ClipDistanceN] public float ClipDistance;
}
```

### SV_Coverage

Máscara de cobertura de las muestras del fragmento.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[SampleMask]
public class SV_Coverage : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.HlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades, valores de retorno
- **Concepto:** `SampleMask`
- **El mismo concepto en:** GLSL [gl_SampleMask](glsl.md#gl-samplemask), [gl_SampleMaskIn](glsl.md#gl-samplemaskin) · MSL [sample_mask](msl.md#sample-mask) · SPIR-V [BuiltIn_SampleMask](spirv.md#builtin-samplemask) · WGSL [@builtin_sample_mask](wgsl.md#builtin-sample-mask)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

// Entrada de la etapa de fragmentos
public struct FragmentInput
{
    [SV_Coverage] public uint SampleMask;
}
```

### SV_Position

Posición en espacio de recorte que escribe la etapa de vértices.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[ClipSpacePosition, FragmentCoordinate]
public class SV_Position : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.HlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades, valores de retorno
- **Concepto:** `ClipSpacePosition`, `FragmentCoordinate`
- **El mismo concepto en:** GLSL [gl_Position](glsl.md#gl-position), [gl_FragCoord](glsl.md#gl-fragcoord) · MSL [position](msl.md#position) · SPIR-V [BuiltIn_Position](spirv.md#builtin-position), [BuiltIn_FragCoord](spirv.md#builtin-fragcoord) · WGSL [@builtin_position](wgsl.md#builtin-position)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;
using YotsubaShader.HlslSyntax.Types;

// Salida de la etapa de vértices
public struct VertexOutput
{
    [SV_Position] public float4 Position;
}
```

### SV_POSITION

Posición en espacio de recorte que escribe la etapa de vértices.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[ClipSpacePosition, FragmentCoordinate]
public class SV_POSITION : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.HlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades, valores de retorno
- **Concepto:** `ClipSpacePosition`, `FragmentCoordinate`
- **El mismo concepto en:** GLSL [gl_Position](glsl.md#gl-position), [gl_FragCoord](glsl.md#gl-fragcoord) · MSL [position](msl.md#position) · SPIR-V [BuiltIn_Position](spirv.md#builtin-position), [BuiltIn_FragCoord](spirv.md#builtin-fragcoord) · WGSL [@builtin_position](wgsl.md#builtin-position)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;
using YotsubaShader.HlslSyntax.Types;

// Salida de la etapa de vértices
public struct VertexOutput
{
    [SV_POSITION] public float4 Position;
}
```

### SV_RenderTargetArrayIndex

Capa del render target por capas que recibe la primitiva.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[RenderTargetLayer]
public class SV_RenderTargetArrayIndex : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.HlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades, valores de retorno
- **Concepto:** `RenderTargetLayer`
- **El mismo concepto en:** GLSL [gl_Layer](glsl.md#gl-layer) · MSL [render_target_array_index](msl.md#render-target-array-index) · SPIR-V [BuiltIn_Layer](spirv.md#builtin-layer)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

// Salida de la etapa de vértices
public struct VertexOutput
{
    [SV_RenderTargetArrayIndex] public uint Layer;
}
```

### SV_ViewportArrayIndex

Viewport que recibe la primitiva.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[ViewportIndex]
public class SV_ViewportArrayIndex : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.HlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades, valores de retorno
- **Concepto:** `ViewportIndex`
- **El mismo concepto en:** GLSL [gl_ViewportIndex](glsl.md#gl-viewportindex) · MSL [viewport_array_index](msl.md#viewport-array-index) · SPIR-V [BuiltIn_ViewportIndex](spirv.md#builtin-viewportindex)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

// Salida de la etapa de vértices
public struct VertexOutput
{
    [SV_ViewportArrayIndex] public uint ViewportIndex;
}
```

### TANGENT

Semántica de usuario con nombre. El backend la convierte en una ubicación numerada.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[UserSemantic]
public class TANGENT(int index = 0) : YotsubaShaderConcept
{
    public int Index;
}
```

- **Espacio de nombres:** `YotsubaShader.HlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades, valores de retorno
- **Concepto:** `UserSemantic`
- **El mismo concepto en:** ninguna otra sintaxis

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;
using YotsubaShader.HlslSyntax.Types;

// Salida de la etapa de vértices
public struct VertexOutput
{
    [TANGENT] public float4 Value;
}
```

### TEXCOORD

Semántica de usuario con nombre. El backend la convierte en una ubicación numerada.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[UserSemantic]
public class TEXCOORD(int index = 0) : YotsubaShaderConcept
{
    public int Index;
}
```

- **Espacio de nombres:** `YotsubaShader.HlslSyntax`
- **Se aplica a:** campos, parámetros, propiedades, valores de retorno
- **Concepto:** `UserSemantic`
- **El mismo concepto en:** ninguna otra sintaxis

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;
using YotsubaShader.HlslSyntax.Types;

// Salida de la etapa de vértices
public struct VertexOutput
{
    [TEXCOORD] public float4 Value;
}
```

## Atributos de método

Atributos que se aplican a un método punto de entrada.

### numthreads

Fija el tamaño del grupo de trabajo de un punto de entrada compute.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.Method)]
[WorkgroupSizeMethod]
public class numthreads(uint x, uint y, uint z) : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.HlslSyntax`
- **Se aplica a:** métodos
- **Concepto:** `WorkgroupSizeMethod`
- **El mismo concepto en:** GLSL [layout_local_size](glsl.md#layout-local-size) · WGSL [@workgroup_size](wgsl.md#workgroup-size)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

public class Blur
{
    // Punto de entrada compute
    [ShaderStage(Stage.Compute)]
    [numthreads(8, 8, 1)]
    public void Main() { }
}
```

## Atributos de recursos

Buffers uniformes, storage buffers y las ranuras de binding de buffers, texturas y samplers.

### cbuffer

Marca el campo como un buffer uniforme (constante).

```csharp
namespace YotsubaShader.HlslSyntax.Resources;

[AttributeUsage(AttributeUsagesTable.Resource)]
[UniformBuffer]
public class cbuffer : YotsubaShaderConcept;
```

- **Espacio de nombres:** `YotsubaShader.HlslSyntax.Resources`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `UniformBuffer`
- **El mismo concepto en:** GLSL [uniform](glsl.md#uniform) · MSL [constant](msl.md#constant) · SPIR-V [Uniform](spirv.md#uniform) · WGSL [uniform](wgsl.md#uniform)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;
using YotsubaShader.HlslSyntax.Resources;

public struct Material
{
    // El contenido del buffer uniforme
    public float Exposure;
}

public class Resources
{
    [cbuffer, register(RegisterPrefix.b, 0)]
    public Material Material;
}
```

### register

Ranura de binding escrita como un registro de HLSL: un prefijo (`b` buffer, `t` textura, `s` sampler, `u` lectura y escritura) y un número, con un espacio opcional, o lo mismo como texto, por ejemplo `"b0"`.

```csharp
namespace YotsubaShader.HlslSyntax.Resources;

[AttributeUsage(AttributeUsagesTable.Resource)]
[BindingSlot, TextureSlot, SamplerSlot]
public class register : YotsubaShaderConcept
{
    public register(RegisterPrefix prefix, int n);
    public register(RegisterPrefix prefix, int n, int space);
    public register(string resource);
    public static RegisterPrefix Parse(string resource, out int binding);
    public RegisterPrefix Prefix;
    public int N;
    public int Space;
}
```

- **Espacio de nombres:** `YotsubaShader.HlslSyntax.Resources`
- **Se aplica a:** campos, parámetros, propiedades
- **Concepto:** `BindingSlot`, `TextureSlot`, `SamplerSlot`
- **El mismo concepto en:** GLSL [layout](glsl.md#layout) · MSL [buffer](msl.md#buffer), [sampler](msl.md#sampler), [texture](msl.md#texture) · SPIR-V [Binding](spirv.md#binding), [DescriptorSet](spirv.md#descriptorset) · WGSL [@binding](wgsl.md#binding), [@group](wgsl.md#group)

Ejemplo:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;
using YotsubaShader.HlslSyntax.Resources;
using YotsubaShader.HlslSyntax.Resources.Types;

public struct Material
{
    // El contenido del buffer uniforme
    public float Exposure;
}

public class Resources
{
    [cbuffer, register(RegisterPrefix.b, 0)]
    public Material Material;

    [register(RegisterPrefix.t, 0)]
    public Texture2D Albedo;

    [register("s0")]
    public SamplerState Sampler;
}
```

## Tipos

Los tipos que declara el paquete. Los miembros aparecen sin su cuerpo.

### Tipos de recursos

```csharp
namespace YotsubaShader.HlslSyntax.Resources;

[UniformBuffer]
public struct ConstantBuffer<T>
{
    public T Value { get; }
}

public enum RegisterPrefix : int { b = 0, t = 1, s = 2, u = 3, c = 4 }

[RWStorageBuffer]
public struct RWStructuredBuffer<T>
{
    public ref T this[int index] { get; }
    public ref T this[uint index] { get; }
    public int Length { get; }
}

[ReadOnlyStorageBuffer]
public struct StructuredBuffer<T>
{
    public T this[int index] { get; }
    public T this[uint index] { get; }
    public int Length { get; }
}
```

### Tipos de texturas y samplers

```csharp
namespace YotsubaShader.HlslSyntax.Resources.Types;

[Texture(TextureDimension.D2, TextureComponentTypes.GenericDefine, Usage = TextureUsage.Storage)]
public struct RWTexture2D<T> where T : unmanaged;

[Sampler]
public struct SamplerComparisonState;

[Sampler]
public struct SamplerState;

[Texture(TextureDimension.D1, TextureComponentTypes.Float)]
public struct Texture1D;

[Texture(TextureDimension.D1, TextureComponentTypes.GenericDefine)]
public struct Texture1D<T> where T : unmanaged;

[Texture(TextureDimension.D2, TextureComponentTypes.Float)]
public struct Texture2D;

[Texture(TextureDimension.D2, TextureComponentTypes.GenericDefine)]
public struct Texture2D<T> where T : unmanaged;

[Texture(TextureDimension.D2, TextureComponentTypes.Float, Arrayed = true)]
public struct Texture2DArray;

[Texture(TextureDimension.D2, TextureComponentTypes.GenericDefine, Arrayed = true)]
public struct Texture2DArray<T> where T : unmanaged;

[Texture(TextureDimension.D2, TextureComponentTypes.GenericDefine, Multisampled = true)]
public struct Texture2DMS<T> where T : unmanaged;

[Texture(TextureDimension.D2, TextureComponentTypes.Float, Multisampled = true)]
public struct Texture2DMS;

[Texture(TextureDimension.D2, TextureComponentTypes.Float, Arrayed = true, Multisampled = true)]
public struct Texture2DMSArray;

[Texture(TextureDimension.D2, TextureComponentTypes.GenericDefine, Arrayed = true, Multisampled = true)]
public struct Texture2DMSArray<T> where T : unmanaged;

[Texture(TextureDimension.D3, TextureComponentTypes.Float)]
public struct Texture3D;

[Texture(TextureDimension.D3, TextureComponentTypes.GenericDefine)]
public struct Texture3D<T> where T : unmanaged;

[Texture(TextureDimension.Cube, TextureComponentTypes.Float)]
public struct TextureCube;

[Texture(TextureDimension.Cube, TextureComponentTypes.GenericDefine)]
public struct TextureCube<T> where T : unmanaged;

[Texture(TextureDimension.Cube, TextureComponentTypes.Float, Arrayed = true)]
public class TextureCubeArray;

[Texture(TextureDimension.Cube, TextureComponentTypes.GenericDefine, Arrayed = true)]
public class TextureCubeArray<T> where T : unmanaged;
```

### Tipos de vectores, matrices y auxiliares

```csharp
namespace YotsubaShader.HlslSyntax.Types;

[Vector]
public partial struct bool2
{
    [VectorComponent(0)]
    public bool X;
    [VectorComponent(1)]
    public bool Y;
}

[Matrix]
public struct bool2x2
{
    [MatrixColumn(0)]
    public bool2 C0;
    [MatrixColumn(1)]
    public bool2 C1;
}

[Matrix]
public struct bool2x3
{
    [MatrixColumn(0)]
    public bool2 C0;
    [MatrixColumn(1)]
    public bool2 C1;
    [MatrixColumn(2)]
    public bool2 C2;
}

[Matrix]
public struct bool2x4
{
    [MatrixColumn(0)]
    public bool2 C0;
    [MatrixColumn(1)]
    public bool2 C1;
    [MatrixColumn(2)]
    public bool2 C2;
    [MatrixColumn(3)]
    public bool2 C3;
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

[Matrix]
public struct bool3x2
{
    [MatrixColumn(0)]
    public bool3 C0;
    [MatrixColumn(1)]
    public bool3 C1;
}

[Matrix]
public struct bool3x3
{
    [MatrixColumn(0)]
    public bool3 C0;
    [MatrixColumn(1)]
    public bool3 C1;
    [MatrixColumn(2)]
    public bool3 C2;
}

[Matrix]
public struct bool3x4
{
    [MatrixColumn(0)]
    public bool3 C0;
    [MatrixColumn(1)]
    public bool3 C1;
    [MatrixColumn(2)]
    public bool3 C2;
    [MatrixColumn(3)]
    public bool3 C3;
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

[Matrix]
public struct bool4x2
{
    [MatrixColumn(0)]
    public bool4 C0;
    [MatrixColumn(1)]
    public bool4 C1;
}

[Matrix]
public struct bool4x3
{
    [MatrixColumn(0)]
    public bool4 C0;
    [MatrixColumn(1)]
    public bool4 C1;
    [MatrixColumn(2)]
    public bool4 C2;
}

[Matrix]
public struct bool4x4
{
    [MatrixColumn(0)]
    public bool4 C0;
    [MatrixColumn(1)]
    public bool4 C1;
    [MatrixColumn(2)]
    public bool4 C2;
    [MatrixColumn(3)]
    public bool4 C3;
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
    public float2 C0;
    [MatrixColumn(1)]
    public float2 C1;
    [MatrixColumn(2)]
    public float2 C2;
}

[Matrix]
public partial struct float2x4
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
    public float3 C0;
    [MatrixColumn(1)]
    public float3 C1;
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
    public float3 C0;
    [MatrixColumn(1)]
    public float3 C1;
    [MatrixColumn(2)]
    public float3 C2;
    [MatrixColumn(3)]
    public float3 C3;
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
    public float4 C0;
    [MatrixColumn(1)]
    public float4 C1;
}

[Matrix]
public partial struct float4x3
{
    [MatrixColumn(0)]
    public float4 C0;
    [MatrixColumn(1)]
    public float4 C1;
    [MatrixColumn(2)]
    public float4 C2;
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

[Vector]
public partial struct int2
{
    [VectorComponent(0)]
    public int X;
    [VectorComponent(1)]
    public int Y;
}

[Matrix]
public struct int2x2
{
    [MatrixColumn(0)]
    public int2 C0;
    [MatrixColumn(1)]
    public int2 C1;
}

[Matrix]
public struct int2x3
{
    [MatrixColumn(0)]
    public int2 C0;
    [MatrixColumn(1)]
    public int2 C1;
    [MatrixColumn(2)]
    public int2 C2;
}

[Matrix]
public struct int2x4
{
    [MatrixColumn(0)]
    public int2 C0;
    [MatrixColumn(1)]
    public int2 C1;
    [MatrixColumn(2)]
    public int2 C2;
    [MatrixColumn(3)]
    public int2 C3;
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

[Matrix]
public struct int3x2
{
    [MatrixColumn(0)]
    public int3 C0;
    [MatrixColumn(1)]
    public int3 C1;
}

[Matrix]
public struct int3x3
{
    [MatrixColumn(0)]
    public int3 C0;
    [MatrixColumn(1)]
    public int3 C1;
    [MatrixColumn(2)]
    public int3 C2;
}

[Matrix]
public struct int3x4
{
    [MatrixColumn(0)]
    public int3 C0;
    [MatrixColumn(1)]
    public int3 C1;
    [MatrixColumn(2)]
    public int3 C2;
    [MatrixColumn(3)]
    public int3 C3;
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

[Matrix]
public struct int4x2
{
    [MatrixColumn(0)]
    public int4 C0;
    [MatrixColumn(1)]
    public int4 C1;
}

[Matrix]
public struct int4x3
{
    [MatrixColumn(0)]
    public int4 C0;
    [MatrixColumn(1)]
    public int4 C1;
    [MatrixColumn(2)]
    public int4 C2;
}

[Matrix]
public struct int4x4
{
    [MatrixColumn(0)]
    public int4 C0;
    [MatrixColumn(1)]
    public int4 C1;
    [MatrixColumn(2)]
    public int4 C2;
    [MatrixColumn(3)]
    public int4 C3;
}

[Vector]
public partial struct uint2
{
    [VectorComponent(0)]
    public uint X;
    [VectorComponent(1)]
    public uint Y;
}

[Matrix]
public struct uint2x2
{
    [MatrixColumn(0)]
    public uint2 C0;
    [MatrixColumn(1)]
    public uint2 C1;
}

[Matrix]
public struct uint2x3
{
    [MatrixColumn(0)]
    public uint2 C0;
    [MatrixColumn(1)]
    public uint2 C1;
    [MatrixColumn(2)]
    public uint2 C2;
}

[Matrix]
public struct uint2x4
{
    [MatrixColumn(0)]
    public uint2 C0;
    [MatrixColumn(1)]
    public uint2 C1;
    [MatrixColumn(2)]
    public uint2 C2;
    [MatrixColumn(3)]
    public uint2 C3;
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

[Matrix]
public struct uint3x2
{
    [MatrixColumn(0)]
    public uint3 C0;
    [MatrixColumn(1)]
    public uint3 C1;
}

[Matrix]
public struct uint3x3
{
    [MatrixColumn(0)]
    public uint3 C0;
    [MatrixColumn(1)]
    public uint3 C1;
    [MatrixColumn(2)]
    public uint3 C2;
}

[Matrix]
public struct uint3x4
{
    [MatrixColumn(0)]
    public uint3 C0;
    [MatrixColumn(1)]
    public uint3 C1;
    [MatrixColumn(2)]
    public uint3 C2;
    [MatrixColumn(3)]
    public uint3 C3;
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

[Matrix]
public struct uint4x2
{
    [MatrixColumn(0)]
    public uint4 C0;
    [MatrixColumn(1)]
    public uint4 C1;
}

[Matrix]
public struct uint4x3
{
    [MatrixColumn(0)]
    public uint4 C0;
    [MatrixColumn(1)]
    public uint4 C1;
    [MatrixColumn(2)]
    public uint4 C2;
}

[Matrix]
public struct uint4x4
{
    [MatrixColumn(0)]
    public uint4 C0;
    [MatrixColumn(1)]
    public uint4 C1;
    [MatrixColumn(2)]
    public uint4 C2;
    [MatrixColumn(3)]
    public uint4 C3;
}
```

> [!NOTE]
> Los listados muestran lo que declara el paquete. No todos los conceptos los traduce cada destino de salida.

## Las otras sintaxis

```buttons
[GLSL](glsl.md)
[MSL](msl.md)
[SPIR-V](spirv.md)
[WGSL](wgsl.md)
```

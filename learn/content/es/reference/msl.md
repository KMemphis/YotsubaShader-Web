---
title: Sintaxis MSL
summary: Todos los atributos de la sintaxis MSL, con ejemplos en C#.
order: 3
---

La sintaxis MSL está inspirada en **the Metal Shading Language**. Tiene 32 atributos en el paquete `YotsubaShader.MslSyntax`. La sintaxis con la que escribes no decide el resultado: el mismo shader compila a cualquier destino.

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;

public struct VertexOutput
{
    [position]
    public Vector4 Position;
}
```

## Valores integrados por etapa

Todos los valores integrados que declara la sintaxis, agrupados por la etapa que los usa.

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;

// Etapa de vertex
public struct VertexBuiltIns
{
    // Posición en clip space (salida de vertex)
    [position] public Vector4 ClipSpacePosition;

    // Índice de vértice
    [vertex_id] public uint VertexIndex;

    // Índice de instancia
    [instance_id] public uint InstanceIndex;

    // Vértice base
    [base_vertex] public uint BaseVertex;

    // Instancia base
    [base_instance] public uint BaseInstance;

    // Distancia de clip
    [clip_distance] public float ClipDistance;

    // Capa del render target
    [render_target_array_index] public uint RenderTargetLayer;

    // Índice de viewport
    [viewport_array_index] public uint ViewportIndex;
}

// Etapa de fragment
public struct FragmentBuiltIns
{
    // Coordenada de fragmento
    [position] public Vector4 FragmentCoordinate;

    // Indicador de cara frontal
    [front_facing] public bool FrontFacingFlag;

    // Profundidad del fragmento (salida)
    [depth] public float FragmentDepth;

    // Profundidad conservadora
    [depth("greater")] public float ConservativeDepth;

    // Profundidad conservadora
    [depth("less")] public float ConservativeDepth2;

    // Referencia de stencil (salida)
    [stencil] public uint StencilReference;

    // Índice de muestra
    [sample_id] public uint SampleIndex;

    // Máscara de muestras
    [sample_mask] public uint SampleMask;

    // Índice de primitiva
    [primitive_id] public uint PrimitiveIndex;

    // Coordenadas baricéntricas
    [barycentric_coord] public Vector4 BarycentricCoordinates;
}

// Etapa de compute
public class ComputeBuiltIns
{
    // Id de invocación global
    [thread_position_in_grid] public UInt3 GlobalInvocationId;

    // Id de invocación local
    [thread_position_in_threadgroup] public UInt3 LocalInvocationId;

    // Índice de invocación local
    [thread_index_in_threadgroup] public uint LocalInvocationIndex;

    // Id de workgroup
    [threadgroup_position_in_grid] public UInt3 WorkgroupId;

    // Número de workgroups
    [threadgroups_per_grid] public UInt3 NumberOfWorkgroups;

    // Tamaño del workgroup (valor integrado)
    [threads_per_threadgroup] public UInt3 WorkgroupSize;

    // Tamaño del subgrupo
    [threads_per_simdgroup] public uint SubgroupSize;

    // Id de invocación del subgrupo
    [thread_index_in_simdgroup] public UInt3 SubgroupInvocationId;

    // Id del subgrupo
    [simdgroup_index_in_threadgroup] public uint SubgroupId;

    // Número de subgrupos
    [simdgroups_per_threadgroup] public uint NumberOfSubgroups;
}
```

## Recursos y ranuras

Buffers uniformes, buffers de almacenamiento, texturas y samplers, cada uno con su ranura escrita en esta sintaxis.

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;
using YotsubaShader.MslSyntax.Resources;

public struct Material
{
    public float Exposure;
}

public class Resources
{
    // Uniform buffer, con su slot de binding
    [constant, buffer(0)]
    public Material Material;

    // Storage buffer de lectura y escritura
    [device, buffer(1)]
    public float[] Output;

    // Storage buffer de solo lectura
    [device(readOnly: true), buffer(2)]
    public float[] Input;
}
```

```csharp
using YotsubaShader.MslSyntax;
using YotsubaShader.MslSyntax.Resources;

public class Surface
{
    [texture(0)]
    public Texture2D Albedo;

    [sampler(0)]
    public SamplerState Sampler;
}
```

## Equivalencias en las otras sintaxis

El mismo concepto en MSL y en las otras cuatro sintaxis. Un guion significa que esa sintaxis no tiene forma de escribirlo.

### Valores integrados

| Concepto | MSL | HLSL | GLSL | SPIR-V | WGSL |
| --- | --- | --- | --- | --- | --- |
| **Etapa de vertex** | | | | | |
| Posición en clip space (salida de vertex) | `position` | `SV_Position` | `gl_Position` | `BuiltIn_Position` | `@builtin_position` |
| Índice de vértice | `vertex_id` | `SV_VertexID` | `gl_VertexIndex` | `BuiltIn_VertexIndex` | `@builtin_vertex_index` |
| Índice de instancia | `instance_id` | `SV_InstanceID` | `gl_InstanceIndex` | `BuiltIn_InstanceIndex` | `@builtin_instance_index` |
| Vértice base | `base_vertex` | `SV_StartVertexLocation` | `gl_BaseVertex` | `BuiltIn_BaseVertex` | — |
| Instancia base | `base_instance` | `SV_StartInstanceLocation` | `gl_BaseInstance` | `BuiltIn_BaseInstance` | — |
| Distancia de clip | `clip_distance` | `SV_ClipDistanceN` | `gl_ClipDistance` | `BuiltIn_ClipDistance` | `@builtin_clip_distances` |
| Capa del render target | `render_target_array_index` | `SV_RenderTargetArrayIndex` | `gl_Layer` | `BuiltIn_Layer` | — |
| Índice de viewport | `viewport_array_index` | `SV_ViewportArrayIndex` | `gl_ViewportIndex` | `BuiltIn_ViewportIndex` | — |
| **Etapa de fragment** | | | | | |
| Coordenada de fragmento | `position` | `SV_Position` | `gl_FragCoord` | `BuiltIn_FragCoord` | `@builtin_position` |
| Indicador de cara frontal | `front_facing` | `SV_IsFrontFace` | `gl_FrontFacing` | `BuiltIn_FrontFacing` | `@builtin_front_facing` |
| Profundidad del fragmento (salida) | `depth` | `SV_Depth` | `gl_FragDepth` | `BuiltIn_FragDepth` | `@builtin_frag_depth` |
| Profundidad conservadora | `depth("greater") / depth("less")` | `SV_DepthGreaterEqual / SV_DepthLessEqual` | — | — | — |
| Referencia de stencil (salida) | `stencil` | `SV_StencilRef` | `gl_FragStencilRefARB` | `BuiltIn_FragStencilRef` | — |
| Índice de muestra | `sample_id` | `SV_SampleIndex` | `gl_SampleID` | `BuiltIn_SampleId` | `@builtin_sample_index` |
| Máscara de muestras | `sample_mask` | `SV_Coverage` | `gl_SampleMask / gl_SampleMaskIn` | `BuiltIn_SampleMask` | `@builtin_sample_mask` |
| Índice de primitiva | `primitive_id` | `SV_PrimitiveID` | `gl_PrimitiveID` | `BuiltIn_PrimitiveId` | `@builtin_primitive_index` |
| Coordenadas baricéntricas | `barycentric_coord` | `SV_Barycentrics` | `gl_BaryCoordEXT` | `BuiltIn_BaryCoord` | — |
| Coordenadas baricéntricas (sin perspectiva) | — | — | `gl_BaryCoordNoPerspEXT` | `BuiltIn_BaryCoordNoPersp` | — |
| Invocación auxiliar | — | — | `gl_HelperInvocation` | `BuiltIn_HelperInvocation` | — |
| Posición de muestra | — | — | `gl_SamplePosition` | `BuiltIn_SamplePosition` | — |
| **Etapa de compute** | | | | | |
| Id de invocación global | `thread_position_in_grid` | `SV_DispatchThreadID` | `gl_GlobalInvocationID` | `BuiltIn_GlobalInvocationId` | `@builtin_global_invocation_id` |
| Id de invocación local | `thread_position_in_threadgroup` | `SV_GroupThreadID` | `gl_LocalInvocationID` | `BuiltIn_LocalInvocationId` | `@builtin_local_invocation_id` |
| Índice de invocación local | `thread_index_in_threadgroup` | `SV_GroupIndex` | `gl_LocalInvocationIndex` | `BuiltIn_LocalInvocationIndex` | `@builtin_local_invocation_index` |
| Id de workgroup | `threadgroup_position_in_grid` | `SV_GroupID` | `gl_WorkGroupID` | `BuiltIn_WorkgroupId` | `@builtin_workgroup_id` |
| Número de workgroups | `threadgroups_per_grid` | — | `gl_NumWorkGroups` | `BuiltIn_NumWorkgroups` | `@builtin_num_workgroups` |
| Tamaño del workgroup (atributo de método) | — | `numthreads` | `layout_local_size` | — | `@workgroup_size` |
| Tamaño del workgroup (valor integrado) | `threads_per_threadgroup` | — | `gl_WorkGroupSize` | `BuiltIn_WorkgroupSize` | — |
| Tamaño del subgrupo | `threads_per_simdgroup` | — | `gl_SubgroupSize` | `BuiltIn_SubgroupSize` | `@builtin_subgroup_size` |
| Id de invocación del subgrupo | `thread_index_in_simdgroup` | — | `gl_SubgroupInvocationID` | `BuiltIn_SubgroupInvocationId` | `@builtin_subgroup_invocation_id` |
| Id del subgrupo | `simdgroup_index_in_threadgroup` | — | `gl_SubgroupID` | `BuiltIn_SubgroupId` | `@builtin_subgroup_id` |
| Número de subgrupos | `simdgroups_per_threadgroup` | — | `gl_NumSubgroups` | `BuiltIn_NumSubgroups` | `@builtin_num_subgroups` |

### Recursos

| Concepto | MSL | HLSL | GLSL | SPIR-V | WGSL |
| --- | --- | --- | --- | --- | --- |
| Uniform buffer | `constant` | `cbuffer, ConstantBuffer<T>` | `uniform` | `Uniform` | `uniform` |
| Storage buffer de lectura y escritura | `device` | `RWStructuredBuffer<T>` | `buffer` | `StorageBuffer` | `storage(storage_use.read_write)` |
| Storage buffer de solo lectura | `device(readOnly: true)` | `StructuredBuffer<T>` | `buffer` | `StorageBuffer` | `storage(storage_use.read)` |
| Binding slot | `buffer(n), texture(n), sampler(n)` | `register(RegisterPrefix.b, n)` | `layout(set, binding)` | `DescriptorSet(s) + Binding(n)` | `@group(s) + @binding(n)` |
| Texture slot | `texture(n)` | `register(RegisterPrefix.t, n)` | `layout(set, binding)` | `DescriptorSet(s) + Binding(n)` | `@group(s) + @binding(n)` |
| Sampler slot | `sampler(n)` | `register(RegisterPrefix.s, n)` | `layout(set, binding)` | `DescriptorSet(s) + Binding(n)` | `@group(s) + @binding(n)` |

## Atributos

Los atributos que declara el paquete, en grupos y aplicados a miembros reales.

### Atributos de entrada

Se aplican a campos, parámetros y propiedades que reciben valores del pipeline.

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;

public struct InputExamples
{
    [attribute(0)] public Vector4 Value1;
    // Coordenadas baricéntricas
    [barycentric_coord] public Vector4 BarycentricCoordinates;
    // Instancia base
    [base_instance] public uint BaseInstance;
    // Vértice base
    [base_vertex] public uint BaseVertex;
    // Indicador de cara frontal
    [front_facing] public bool FrontFacingFlag;
    // Índice de instancia
    [instance_id] public uint InstanceIndex;
    // Índice de primitiva
    [primitive_id] public uint PrimitiveIndex;
    // Índice de muestra
    [sample_id] public uint SampleIndex;
    // Id del subgrupo
    [simdgroup_index_in_threadgroup] public uint SubgroupId;
    // Número de subgrupos
    [simdgroups_per_threadgroup] public uint NumberOfSubgroups;
    // Id de invocación del subgrupo
    [thread_index_in_simdgroup]
    public UInt3 SubgroupInvocationId;
    // Índice de invocación local
    [thread_index_in_threadgroup]
    public uint LocalInvocationIndex;
    // Id de invocación global
    [thread_position_in_grid] public UInt3 GlobalInvocationId;
    // Id de invocación local
    [thread_position_in_threadgroup]
    public UInt3 LocalInvocationId;
    // Id de workgroup
    [threadgroup_position_in_grid] public UInt3 WorkgroupId;
    // Número de workgroups
    [threadgroups_per_grid] public UInt3 NumberOfWorkgroups;
    // Tamaño del subgrupo
    [threads_per_simdgroup] public uint SubgroupSize;
    // Tamaño del workgroup (valor integrado)
    [threads_per_threadgroup] public UInt3 WorkgroupSize;
    // Índice de vértice
    [vertex_id] public uint VertexIndex;
}
```

### Atributos de entrada y salida

Se aplican a valores que se pueden recibir o producir, según la etapa.

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;

public struct InputOutputExamples
{
    // Posición en clip space (salida de vertex)
    [position] public Vector4 ClipSpacePosition;
    // Capa del render target
    [render_target_array_index] public uint RenderTargetLayer;
    // Máscara de muestras
    [sample_mask] public uint SampleMask;
    // Índice de viewport
    [viewport_array_index] public uint ViewportIndex;
}
```

### Atributos de salida

Se aplican a campos, parámetros y valores de retorno que produce la etapa.

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;

public struct OutputExamples
{
    // Distancia de clip
    [clip_distance] public float ClipDistance;
    [color] public Vector4 Value2;
    // Profundidad del fragmento (salida)
    [depth] public float FragmentDepth;
    // Referencia de stencil (salida)
    [stencil] public uint StencilReference;
}
```

### Atributos de recurso

Declaran uniforms, buffers, texturas, samplers y ranuras.

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;
using YotsubaShader.MslSyntax.Resources;

public class ResourceExamples
{
    [buffer(0)] public float Value1;
    [constant] public float Value2;
    [device] public float Value3;
    [sampler(0)] public float Value4;
    [texture(0)] public float Value5;
}
```

### Tipos de apoyo

Structs, clases y enums que se usan junto con los atributos.

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;

public class Types
{
    public YotsubaShader.MslSyntax.Types.bias BiasValue;
    public YotsubaShader.MslSyntax.Types.bool2 Bool2Value;
    public YotsubaShader.MslSyntax.Types.bool3 Bool3Value;
    public YotsubaShader.MslSyntax.Types.bool4 Bool4Value;
    public YotsubaShader.MslSyntax.Types.component ComponentValue;
    public YotsubaShader.MslSyntax.Resources.Types.depth2d<float> depth2dGenericValue;
    public YotsubaShader.MslSyntax.Resources.Types.depth2d_array<float> depth2d_arrayGenericValue;
    public YotsubaShader.MslSyntax.Resources.Types.depthcube<float> depthcubeGenericValue;
    public YotsubaShader.MslSyntax.Resources.Types.depthcube_array<float> depthcube_arrayGenericValue;
    public YotsubaShader.MslSyntax.Types.float2 Float2Value;
    public YotsubaShader.MslSyntax.Types.float2x2 Float2x2Value;
    public YotsubaShader.MslSyntax.Types.float2x3 Float2x3Value;
    public YotsubaShader.MslSyntax.Types.float2x4 Float2x4Value;
    public YotsubaShader.MslSyntax.Types.float3 Float3Value;
    public YotsubaShader.MslSyntax.Types.float3x2 Float3x2Value;
    public YotsubaShader.MslSyntax.Types.float3x3 Float3x3Value;
    public YotsubaShader.MslSyntax.Types.float3x4 Float3x4Value;
    public YotsubaShader.MslSyntax.Types.float4 Float4Value;
    public YotsubaShader.MslSyntax.Types.float4x2 Float4x2Value;
    public YotsubaShader.MslSyntax.Types.float4x3 Float4x3Value;
    public YotsubaShader.MslSyntax.Types.float4x4 Float4x4Value;
    public YotsubaShader.MslSyntax.Types.gradient2d Gradient2dValue;
    public YotsubaShader.MslSyntax.Types.gradient3d Gradient3dValue;
    public YotsubaShader.MslSyntax.Types.gradientcube GradientcubeValue;
    public YotsubaShader.MslSyntax.Types.half2 Half2Value;
    public YotsubaShader.MslSyntax.Types.half2x2 Half2x2Value;
    public YotsubaShader.MslSyntax.Types.half2x3 Half2x3Value;
    public YotsubaShader.MslSyntax.Types.half2x4 Half2x4Value;
    public YotsubaShader.MslSyntax.Types.half3 Half3Value;
    public YotsubaShader.MslSyntax.Types.half3x2 Half3x2Value;
    public YotsubaShader.MslSyntax.Types.half3x3 Half3x3Value;
    public YotsubaShader.MslSyntax.Types.half3x4 Half3x4Value;
    public YotsubaShader.MslSyntax.Types.half4 Half4Value;
    public YotsubaShader.MslSyntax.Types.half4x2 Half4x2Value;
    public YotsubaShader.MslSyntax.Types.half4x3 Half4x3Value;
    public YotsubaShader.MslSyntax.Types.half4x4 Half4x4Value;
    public YotsubaShader.MslSyntax.Types.int2 Int2Value;
    public YotsubaShader.MslSyntax.Types.int3 Int3Value;
    public YotsubaShader.MslSyntax.Types.int4 Int4Value;
    public YotsubaShader.MslSyntax.Types.level LevelValue;
    public YotsubaShader.MslSyntax.Resources.Types.sampler SamplerValue;
    public YotsubaShader.MslSyntax.Resources.Types.texture1d<float> texture1dGenericValue;
    public YotsubaShader.MslSyntax.Resources.Types.texture1d_array<float> texture1d_arrayGenericValue;
    public YotsubaShader.MslSyntax.Resources.Types.texture2d<float> texture2dGenericValue;
    public YotsubaShader.MslSyntax.Resources.Types.texture2d_array<float> texture2d_arrayGenericValue;
    public YotsubaShader.MslSyntax.Resources.Types.texture2d_ms<float> texture2d_msGenericValue;
    public YotsubaShader.MslSyntax.Resources.Types.texture3d<float> texture3dGenericValue;
    public YotsubaShader.MslSyntax.Resources.Types.texturecube<float> texturecubeGenericValue;
    public YotsubaShader.MslSyntax.Resources.Types.texturecube_array<float> texturecube_arrayGenericValue;
    public YotsubaShader.MslSyntax.Types.uint2 Uint2Value;
    public YotsubaShader.MslSyntax.Types.uint3 Uint3Value;
    public YotsubaShader.MslSyntax.Types.uint4 Uint4Value;
    public YotsubaShader.MslSyntax.Types.vec4<float> vec4GenericValue;
}
```

> [!NOTE]
> Estos listados muestran lo que declara el paquete. No significan que todos los destinos de salida traduzcan todos los conceptos.

Las otras sintaxis: [HLSL](hlsl.md), [GLSL](glsl.md), [SPIR-V](spirv.md), [WGSL](wgsl.md).

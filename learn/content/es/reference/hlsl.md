---
title: Sintaxis HLSL
summary: Todos los atributos de la sintaxis HLSL, con ejemplos en C#.
order: 1
---

La sintaxis HLSL está inspirada en **HLSL (Direct3D)**. Tiene 31 atributos en el paquete `YotsubaShader.HlslSyntax`. La sintaxis con la que escribes no decide el resultado: el mismo shader compila a cualquier destino.

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

public struct VertexOutput
{
    [SV_Position]
    public Vector4 Position;
}
```

## Valores integrados por etapa

Todos los valores integrados que declara la sintaxis, agrupados por la etapa que los usa.

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

// Etapa de vertex
public struct VertexBuiltIns
{
    // Posición en clip space (salida de vertex)
    [SV_Position] public Vector4 ClipSpacePosition;

    // Índice de vértice
    [SV_VertexID] public uint VertexIndex;

    // Índice de instancia
    [SV_InstanceID] public uint InstanceIndex;

    // Vértice base
    [SV_StartVertexLocation] public uint BaseVertex;

    // Instancia base
    [SV_StartInstanceLocation] public uint BaseInstance;

    // Distancia de clip
    [SV_ClipDistanceN] public float ClipDistance;

    // Capa del render target
    [SV_RenderTargetArrayIndex] public uint RenderTargetLayer;

    // Índice de viewport
    [SV_ViewportArrayIndex] public uint ViewportIndex;
}

// Etapa de fragment
public struct FragmentBuiltIns
{
    // Coordenada de fragmento
    [SV_Position] public Vector4 FragmentCoordinate;

    // Indicador de cara frontal
    [SV_IsFrontFace] public bool FrontFacingFlag;

    // Profundidad del fragmento (salida)
    [SV_Depth] public float FragmentDepth;

    // Profundidad conservadora
    [SV_DepthGreaterEqual] public float ConservativeDepth;

    // Profundidad conservadora
    [SV_DepthLessEqual] public float ConservativeDepth2;

    // Referencia de stencil (salida)
    [SV_StencilRef] public uint StencilReference;

    // Índice de muestra
    [SV_SampleIndex] public uint SampleIndex;

    // Máscara de muestras
    [SV_Coverage] public uint SampleMask;

    // Índice de primitiva
    [SV_PrimitiveID] public uint PrimitiveIndex;

    // Coordenadas baricéntricas
    [SV_Barycentrics] public Vector4 BarycentricCoordinates;
}

// Etapa de compute
public class ComputeBuiltIns
{
    // Id de invocación global
    [SV_DispatchThreadID] public UInt3 GlobalInvocationId;

    // Id de invocación local
    [SV_GroupThreadID] public UInt3 LocalInvocationId;

    // Índice de invocación local
    [SV_GroupIndex] public uint LocalInvocationIndex;

    // Id de workgroup
    [SV_GroupID] public UInt3 WorkgroupId;

    // Tamaño del workgroup (atributo de método)
    [ShaderStage(Stage.Compute)]
    [numthreads(8, 8, 1)]
    public void Compute() { }
}
```

## Recursos y ranuras

Buffers uniformes, buffers de almacenamiento, texturas y samplers, cada uno con su ranura escrita en esta sintaxis.

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;
using YotsubaShader.HlslSyntax.Resources;

public struct Material
{
    public float Exposure;
}

public class Resources
{
    // Uniform buffer, con su slot de binding
    [cbuffer, register(RegisterPrefix.b, 0)]
    public Material Material;

    // Storage buffer de lectura y escritura
    [register(RegisterPrefix.u, 0)]
    public RWStructuredBuffer<float> Output;

    // Storage buffer de solo lectura
    [register("t0")]
    public StructuredBuffer<float> Input;
}
```

```csharp
using YotsubaShader.HlslSyntax;
using YotsubaShader.HlslSyntax.Resources;

public class Surface
{
    [register(RegisterPrefix.t, 0)]
    public Texture2D Albedo;

    // El mismo registro, escrito como cadena: letra + número
    [register("s0")]
    public SamplerState Sampler;
}
```

## Equivalencias en las otras sintaxis

El mismo concepto en HLSL y en las otras cuatro sintaxis. Un guion significa que esa sintaxis no tiene forma de escribirlo.

### Valores integrados

| Concepto | HLSL | GLSL | MSL | SPIR-V | WGSL |
| --- | --- | --- | --- | --- | --- |
| **Etapa de vertex** | | | | | |
| Posición en clip space (salida de vertex) | `SV_Position` | `gl_Position` | `position` | `BuiltIn_Position` | `@builtin_position` |
| Índice de vértice | `SV_VertexID` | `gl_VertexIndex` | `vertex_id` | `BuiltIn_VertexIndex` | `@builtin_vertex_index` |
| Índice de instancia | `SV_InstanceID` | `gl_InstanceIndex` | `instance_id` | `BuiltIn_InstanceIndex` | `@builtin_instance_index` |
| Vértice base | `SV_StartVertexLocation` | `gl_BaseVertex` | `base_vertex` | `BuiltIn_BaseVertex` | — |
| Instancia base | `SV_StartInstanceLocation` | `gl_BaseInstance` | `base_instance` | `BuiltIn_BaseInstance` | — |
| Distancia de clip | `SV_ClipDistanceN` | `gl_ClipDistance` | `clip_distance` | `BuiltIn_ClipDistance` | `@builtin_clip_distances` |
| Capa del render target | `SV_RenderTargetArrayIndex` | `gl_Layer` | `render_target_array_index` | `BuiltIn_Layer` | — |
| Índice de viewport | `SV_ViewportArrayIndex` | `gl_ViewportIndex` | `viewport_array_index` | `BuiltIn_ViewportIndex` | — |
| **Etapa de fragment** | | | | | |
| Coordenada de fragmento | `SV_Position` | `gl_FragCoord` | `position` | `BuiltIn_FragCoord` | `@builtin_position` |
| Indicador de cara frontal | `SV_IsFrontFace` | `gl_FrontFacing` | `front_facing` | `BuiltIn_FrontFacing` | `@builtin_front_facing` |
| Profundidad del fragmento (salida) | `SV_Depth` | `gl_FragDepth` | `depth` | `BuiltIn_FragDepth` | `@builtin_frag_depth` |
| Profundidad conservadora | `SV_DepthGreaterEqual / SV_DepthLessEqual` | — | `depth("greater") / depth("less")` | — | — |
| Referencia de stencil (salida) | `SV_StencilRef` | `gl_FragStencilRefARB` | `stencil` | `BuiltIn_FragStencilRef` | — |
| Índice de muestra | `SV_SampleIndex` | `gl_SampleID` | `sample_id` | `BuiltIn_SampleId` | `@builtin_sample_index` |
| Máscara de muestras | `SV_Coverage` | `gl_SampleMask / gl_SampleMaskIn` | `sample_mask` | `BuiltIn_SampleMask` | `@builtin_sample_mask` |
| Índice de primitiva | `SV_PrimitiveID` | `gl_PrimitiveID` | `primitive_id` | `BuiltIn_PrimitiveId` | `@builtin_primitive_index` |
| Coordenadas baricéntricas | `SV_Barycentrics` | `gl_BaryCoordEXT` | `barycentric_coord` | `BuiltIn_BaryCoord` | — |
| Coordenadas baricéntricas (sin perspectiva) | — | `gl_BaryCoordNoPerspEXT` | — | `BuiltIn_BaryCoordNoPersp` | — |
| Invocación auxiliar | — | `gl_HelperInvocation` | — | `BuiltIn_HelperInvocation` | — |
| Posición de muestra | — | `gl_SamplePosition` | — | `BuiltIn_SamplePosition` | — |
| **Etapa de compute** | | | | | |
| Id de invocación global | `SV_DispatchThreadID` | `gl_GlobalInvocationID` | `thread_position_in_grid` | `BuiltIn_GlobalInvocationId` | `@builtin_global_invocation_id` |
| Id de invocación local | `SV_GroupThreadID` | `gl_LocalInvocationID` | `thread_position_in_threadgroup` | `BuiltIn_LocalInvocationId` | `@builtin_local_invocation_id` |
| Índice de invocación local | `SV_GroupIndex` | `gl_LocalInvocationIndex` | `thread_index_in_threadgroup` | `BuiltIn_LocalInvocationIndex` | `@builtin_local_invocation_index` |
| Id de workgroup | `SV_GroupID` | `gl_WorkGroupID` | `threadgroup_position_in_grid` | `BuiltIn_WorkgroupId` | `@builtin_workgroup_id` |
| Número de workgroups | — | `gl_NumWorkGroups` | `threadgroups_per_grid` | `BuiltIn_NumWorkgroups` | `@builtin_num_workgroups` |
| Tamaño del workgroup (atributo de método) | `numthreads` | `layout_local_size` | — | — | `@workgroup_size` |
| Tamaño del workgroup (valor integrado) | — | `gl_WorkGroupSize` | `threads_per_threadgroup` | `BuiltIn_WorkgroupSize` | — |
| Tamaño del subgrupo | — | `gl_SubgroupSize` | `threads_per_simdgroup` | `BuiltIn_SubgroupSize` | `@builtin_subgroup_size` |
| Id de invocación del subgrupo | — | `gl_SubgroupInvocationID` | `thread_index_in_simdgroup` | `BuiltIn_SubgroupInvocationId` | `@builtin_subgroup_invocation_id` |
| Id del subgrupo | — | `gl_SubgroupID` | `simdgroup_index_in_threadgroup` | `BuiltIn_SubgroupId` | `@builtin_subgroup_id` |
| Número de subgrupos | — | `gl_NumSubgroups` | `simdgroups_per_threadgroup` | `BuiltIn_NumSubgroups` | `@builtin_num_subgroups` |

### Recursos

| Concepto | HLSL | GLSL | MSL | SPIR-V | WGSL |
| --- | --- | --- | --- | --- | --- |
| Uniform buffer | `cbuffer, ConstantBuffer<T>` | `uniform` | `constant` | `Uniform` | `uniform` |
| Storage buffer de lectura y escritura | `RWStructuredBuffer<T>` | `buffer` | `device` | `StorageBuffer` | `storage(storage_use.read_write)` |
| Storage buffer de solo lectura | `StructuredBuffer<T>` | `buffer` | `device(readOnly: true)` | `StorageBuffer` | `storage(storage_use.read)` |
| Binding slot | `register(RegisterPrefix.b, n)` | `layout(set, binding)` | `buffer(n), texture(n), sampler(n)` | `DescriptorSet(s) + Binding(n)` | `@group(s) + @binding(n)` |
| Texture slot | `register(RegisterPrefix.t, n)` | `layout(set, binding)` | `texture(n)` | `DescriptorSet(s) + Binding(n)` | `@group(s) + @binding(n)` |
| Sampler slot | `register(RegisterPrefix.s, n)` | `layout(set, binding)` | `sampler(n)` | `DescriptorSet(s) + Binding(n)` | `@group(s) + @binding(n)` |

## Atributos

Los atributos que declara el paquete, en grupos y aplicados a miembros reales.

### Atributos de entrada

Se aplican a campos, parámetros y propiedades que reciben valores del pipeline.

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

public struct InputExamples
{
    // Coordenadas baricéntricas
    [SV_Barycentrics] public Vector4 BarycentricCoordinates;
    // Id de invocación global
    [SV_DispatchThreadID] public UInt3 GlobalInvocationId;
    // Id de workgroup
    [SV_GroupID] public UInt3 WorkgroupId;
    // Índice de invocación local
    [SV_GroupIndex] public uint LocalInvocationIndex;
    // Id de invocación local
    [SV_GroupThreadID] public UInt3 LocalInvocationId;
    // Índice de instancia
    [SV_InstanceID] public uint InstanceIndex;
    // Indicador de cara frontal
    [SV_IsFrontFace] public bool FrontFacingFlag;
    // Índice de primitiva
    [SV_PrimitiveID] public uint PrimitiveIndex;
    // Índice de muestra
    [SV_SampleIndex] public uint SampleIndex;
    // Instancia base
    [SV_StartInstanceLocation] public uint BaseInstance;
    // Vértice base
    [SV_StartVertexLocation] public uint BaseVertex;
    // Índice de vértice
    [SV_VertexID] public uint VertexIndex;
}
```

### Atributos de entrada y salida

Se aplican a valores que se pueden recibir o producir, según la etapa.

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

public struct InputOutputExamples
{
    [BINORMAL] public Vector4 Value1;
    [COLOR] public Vector4 Value2;
    [NORMAL] public Vector4 Value3;
    [POSITION] public Vector4 Value4;
    [SV_ClipDistanceN] public Vector4 Value5;
    // Máscara de muestras
    [SV_Coverage] public uint SampleMask;
    // Posición en clip space (salida de vertex)
    [SV_Position] public Vector4 ClipSpacePosition;
    // Capa del render target
    [SV_RenderTargetArrayIndex] public uint RenderTargetLayer;
    // Índice de viewport
    [SV_ViewportArrayIndex] public uint ViewportIndex;
    [TANGENT] public Vector4 Value10;
    [TEXCOORD] public Vector4 Value11;
}
```

### Atributos de salida

Se aplican a campos, parámetros y valores de retorno que produce la etapa.

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

public struct OutputExamples
{
    // Profundidad del fragmento (salida)
    [SV_Depth] public float FragmentDepth;
    // Profundidad conservadora
    [SV_DepthGreaterEqual] public float ConservativeDepth;
    // Profundidad conservadora
    [SV_DepthLessEqual] public float ConservativeDepth2;
    // Referencia de stencil (salida)
    [SV_StencilRef] public uint StencilReference;
    [SV_Target] public Vector4 Value5;
}
```

### Atributos de método

Se aplican a métodos, por ejemplo para fijar el tamaño del grupo de trabajo de un compute.

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

public class MethodExamples
{
    [ShaderStage(Stage.Compute)]
    [numthreads(8, 8, 1)]
    public void NumthreadsExample() { }
}
```

### Atributos de recurso

Declaran uniforms, buffers, texturas, samplers y ranuras.

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;
using YotsubaShader.HlslSyntax.Resources;

public class ResourceExamples
{
    [cbuffer] public float Value1;
    [register(RegisterPrefix.b, 0)] public float Value2;

    // La sobrecarga con cadena: letra + número
    [register("b1")]
    public float Value3;
}
```

### Tipos de apoyo

Structs, clases y enums que se usan junto con los atributos.

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

public class Types
{
    public YotsubaShader.HlslSyntax.Types.bool2 Bool2Value;
    public YotsubaShader.HlslSyntax.Types.bool2x2 Bool2x2Value;
    public YotsubaShader.HlslSyntax.Types.bool2x3 Bool2x3Value;
    public YotsubaShader.HlslSyntax.Types.bool2x4 Bool2x4Value;
    public YotsubaShader.HlslSyntax.Types.bool3 Bool3Value;
    public YotsubaShader.HlslSyntax.Types.bool3x2 Bool3x2Value;
    public YotsubaShader.HlslSyntax.Types.bool3x3 Bool3x3Value;
    public YotsubaShader.HlslSyntax.Types.bool3x4 Bool3x4Value;
    public YotsubaShader.HlslSyntax.Types.bool4 Bool4Value;
    public YotsubaShader.HlslSyntax.Types.bool4x2 Bool4x2Value;
    public YotsubaShader.HlslSyntax.Types.bool4x3 Bool4x3Value;
    public YotsubaShader.HlslSyntax.Types.bool4x4 Bool4x4Value;
    public YotsubaShader.HlslSyntax.Resources.ConstantBuffer<float> ConstantBufferGenericValue;
    public YotsubaShader.HlslSyntax.Types.float2 Float2Value;
    public YotsubaShader.HlslSyntax.Types.float2x2 Float2x2Value;
    public YotsubaShader.HlslSyntax.Types.float2x3 Float2x3Value;
    public YotsubaShader.HlslSyntax.Types.float2x4 Float2x4Value;
    public YotsubaShader.HlslSyntax.Types.float3 Float3Value;
    public YotsubaShader.HlslSyntax.Types.float3x2 Float3x2Value;
    public YotsubaShader.HlslSyntax.Types.float3x3 Float3x3Value;
    public YotsubaShader.HlslSyntax.Types.float3x4 Float3x4Value;
    public YotsubaShader.HlslSyntax.Types.float4 Float4Value;
    public YotsubaShader.HlslSyntax.Types.float4x2 Float4x2Value;
    public YotsubaShader.HlslSyntax.Types.float4x3 Float4x3Value;
    public YotsubaShader.HlslSyntax.Types.float4x4 Float4x4Value;
    public YotsubaShader.HlslSyntax.Types.int2 Int2Value;
    public YotsubaShader.HlslSyntax.Types.int2x2 Int2x2Value;
    public YotsubaShader.HlslSyntax.Types.int2x3 Int2x3Value;
    public YotsubaShader.HlslSyntax.Types.int2x4 Int2x4Value;
    public YotsubaShader.HlslSyntax.Types.int3 Int3Value;
    public YotsubaShader.HlslSyntax.Types.int3x2 Int3x2Value;
    public YotsubaShader.HlslSyntax.Types.int3x3 Int3x3Value;
    public YotsubaShader.HlslSyntax.Types.int3x4 Int3x4Value;
    public YotsubaShader.HlslSyntax.Types.int4 Int4Value;
    public YotsubaShader.HlslSyntax.Types.int4x2 Int4x2Value;
    public YotsubaShader.HlslSyntax.Types.int4x3 Int4x3Value;
    public YotsubaShader.HlslSyntax.Types.int4x4 Int4x4Value;
    public YotsubaShader.HlslSyntax.Resources.RegisterPrefix RegisterPrefixValue;
    public YotsubaShader.HlslSyntax.Resources.RWStructuredBuffer<float> RWStructuredBufferGenericValue;
    public YotsubaShader.HlslSyntax.Resources.Types.RWTexture2D<float> RWTexture2DGenericValue;
    public YotsubaShader.HlslSyntax.Resources.Types.SamplerComparisonState SamplerComparisonStateValue;
    public YotsubaShader.HlslSyntax.Resources.Types.SamplerState SamplerStateValue;
    public YotsubaShader.HlslSyntax.Resources.StructuredBuffer<float> StructuredBufferGenericValue;
    public YotsubaShader.HlslSyntax.Resources.Types.Texture1D Texture1DValue;
    public YotsubaShader.HlslSyntax.Resources.Types.Texture1D<float> Texture1DGenericValue;
    public YotsubaShader.HlslSyntax.Resources.Types.Texture2D Texture2DValue;
    public YotsubaShader.HlslSyntax.Resources.Types.Texture2D<float> Texture2DGenericValue;
    public YotsubaShader.HlslSyntax.Resources.Types.Texture2DArray Texture2DArrayValue;
    public YotsubaShader.HlslSyntax.Resources.Types.Texture2DArray<float> Texture2DArrayGenericValue;
    public YotsubaShader.HlslSyntax.Resources.Types.Texture2DMS<float> Texture2DMSGenericValue;
    public YotsubaShader.HlslSyntax.Resources.Types.Texture2DMS Texture2DMSValue;
    public YotsubaShader.HlslSyntax.Resources.Types.Texture2DMSArray Texture2DMSArrayValue;
    public YotsubaShader.HlslSyntax.Resources.Types.Texture2DMSArray<float> Texture2DMSArrayGenericValue;
    public YotsubaShader.HlslSyntax.Resources.Types.Texture3D Texture3DValue;
    public YotsubaShader.HlslSyntax.Resources.Types.Texture3D<float> Texture3DGenericValue;
    public YotsubaShader.HlslSyntax.Resources.Types.TextureCube TextureCubeValue;
    public YotsubaShader.HlslSyntax.Resources.Types.TextureCube<float> TextureCubeGenericValue;
    public YotsubaShader.HlslSyntax.Resources.Types.TextureCubeArray TextureCubeArrayValue;
    public YotsubaShader.HlslSyntax.Resources.Types.TextureCubeArray<float> TextureCubeArrayGenericValue;
    public YotsubaShader.HlslSyntax.Types.uint2 Uint2Value;
    public YotsubaShader.HlslSyntax.Types.uint2x2 Uint2x2Value;
    public YotsubaShader.HlslSyntax.Types.uint2x3 Uint2x3Value;
    public YotsubaShader.HlslSyntax.Types.uint2x4 Uint2x4Value;
    public YotsubaShader.HlslSyntax.Types.uint3 Uint3Value;
    public YotsubaShader.HlslSyntax.Types.uint3x2 Uint3x2Value;
    public YotsubaShader.HlslSyntax.Types.uint3x3 Uint3x3Value;
    public YotsubaShader.HlslSyntax.Types.uint3x4 Uint3x4Value;
    public YotsubaShader.HlslSyntax.Types.uint4 Uint4Value;
    public YotsubaShader.HlslSyntax.Types.uint4x2 Uint4x2Value;
    public YotsubaShader.HlslSyntax.Types.uint4x3 Uint4x3Value;
    public YotsubaShader.HlslSyntax.Types.uint4x4 Uint4x4Value;
}
```

> [!NOTE]
> Estos listados muestran lo que declara el paquete. No significan que todos los destinos de salida traduzcan todos los conceptos.

Las otras sintaxis: [GLSL](glsl.md), [MSL](msl.md), [SPIR-V](spirv.md), [WGSL](wgsl.md).

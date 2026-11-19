---
title: Sintaxis WGSL
summary: Todos los atributos de la sintaxis WGSL, con ejemplos en C#.
order: 5
---

La sintaxis WGSL está inspirada en **WGSL (WebGPU)**. Tiene 24 atributos en el paquete `YotsubaShader.WgslSyntax`. La sintaxis con la que escribes no decide el resultado: el mismo shader compila a cualquier destino.

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;

public struct VertexOutput
{
    [@builtin_position]
    public Vector4 Position;
}
```

## Valores integrados por etapa

Todos los valores integrados que declara la sintaxis, agrupados por la etapa que los usa.

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;

// Etapa de vertex
public struct VertexBuiltIns
{
    // Posición en clip space (salida de vertex)
    [@builtin_position] public Vector4 ClipSpacePosition;

    // Índice de vértice
    [@builtin_vertex_index] public uint VertexIndex;

    // Índice de instancia
    [@builtin_instance_index] public uint InstanceIndex;

    // Distancia de clip
    [@builtin_clip_distances] public float ClipDistance;
}

// Etapa de fragment
public struct FragmentBuiltIns
{
    // Coordenada de fragmento
    [@builtin_position] public Vector4 FragmentCoordinate;

    // Indicador de cara frontal
    [@builtin_front_facing] public bool FrontFacingFlag;

    // Profundidad del fragmento (salida)
    [@builtin_frag_depth] public float FragmentDepth;

    // Índice de muestra
    [@builtin_sample_index] public uint SampleIndex;

    // Máscara de muestras
    [@builtin_sample_mask] public uint SampleMask;

    // Índice de primitiva
    [@builtin_primitive_index] public uint PrimitiveIndex;
}

// Etapa de compute
public class ComputeBuiltIns
{
    // Id de invocación global
    [@builtin_global_invocation_id] public UInt3 GlobalInvocationId;

    // Id de invocación local
    [@builtin_local_invocation_id] public UInt3 LocalInvocationId;

    // Índice de invocación local
    [@builtin_local_invocation_index] public uint LocalInvocationIndex;

    // Id de workgroup
    [@builtin_workgroup_id] public UInt3 WorkgroupId;

    // Número de workgroups
    [@builtin_num_workgroups] public UInt3 NumberOfWorkgroups;

    // Tamaño del subgrupo
    [@builtin_subgroup_size] public uint SubgroupSize;

    // Id de invocación del subgrupo
    [@builtin_subgroup_invocation_id] public UInt3 SubgroupInvocationId;

    // Id del subgrupo
    [@builtin_subgroup_id] public uint SubgroupId;

    // Número de subgrupos
    [@builtin_num_subgroups] public uint NumberOfSubgroups;

    // Tamaño del workgroup (atributo de método)
    [ShaderStage(Stage.Compute)]
    [@workgroup_size(8, 8, 1)]
    public void Compute() { }
}
```

## Recursos y ranuras

Buffers uniformes, buffers de almacenamiento, texturas y samplers, cada uno con su ranura escrita en esta sintaxis.

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;
using YotsubaShader.WgslSyntax.Resources;

public struct Material
{
    public float Exposure;
}

public class Resources
{
    // Uniform buffer, con su slot de binding
    [uniform, @group(0), @binding(0)]
    public Material Material;

    // Storage buffer de lectura y escritura
    [storage(storage_use.read_write), @group(0), @binding(1)]
    public float[] Output;

    // Storage buffer de solo lectura
    [storage(storage_use.read), @group(0), @binding(2)]
    public float[] Input;
}
```

```csharp
using YotsubaShader.WgslSyntax;
using YotsubaShader.WgslSyntax.Resources;

public class Surface
{
    [@group(0), @binding(0)]
    public Texture2D Albedo;

    [@group(0), @binding(1)]
    public SamplerState Sampler;
}
```

## Equivalencias en las otras sintaxis

El mismo concepto en WGSL y en las otras cuatro sintaxis. Un guion significa que esa sintaxis no tiene forma de escribirlo.

### Valores integrados

| Concepto | WGSL | HLSL | GLSL | MSL | SPIR-V |
| --- | --- | --- | --- | --- | --- |
| **Etapa de vertex** | | | | | |
| Posición en clip space (salida de vertex) | `@builtin_position` | `SV_Position` | `gl_Position` | `position` | `BuiltIn_Position` |
| Índice de vértice | `@builtin_vertex_index` | `SV_VertexID` | `gl_VertexIndex` | `vertex_id` | `BuiltIn_VertexIndex` |
| Índice de instancia | `@builtin_instance_index` | `SV_InstanceID` | `gl_InstanceIndex` | `instance_id` | `BuiltIn_InstanceIndex` |
| Vértice base | — | `SV_StartVertexLocation` | `gl_BaseVertex` | `base_vertex` | `BuiltIn_BaseVertex` |
| Instancia base | — | `SV_StartInstanceLocation` | `gl_BaseInstance` | `base_instance` | `BuiltIn_BaseInstance` |
| Distancia de clip | `@builtin_clip_distances` | `SV_ClipDistanceN` | `gl_ClipDistance` | `clip_distance` | `BuiltIn_ClipDistance` |
| Capa del render target | — | `SV_RenderTargetArrayIndex` | `gl_Layer` | `render_target_array_index` | `BuiltIn_Layer` |
| Índice de viewport | — | `SV_ViewportArrayIndex` | `gl_ViewportIndex` | `viewport_array_index` | `BuiltIn_ViewportIndex` |
| **Etapa de fragment** | | | | | |
| Coordenada de fragmento | `@builtin_position` | `SV_Position` | `gl_FragCoord` | `position` | `BuiltIn_FragCoord` |
| Indicador de cara frontal | `@builtin_front_facing` | `SV_IsFrontFace` | `gl_FrontFacing` | `front_facing` | `BuiltIn_FrontFacing` |
| Profundidad del fragmento (salida) | `@builtin_frag_depth` | `SV_Depth` | `gl_FragDepth` | `depth` | `BuiltIn_FragDepth` |
| Profundidad conservadora | — | `SV_DepthGreaterEqual / SV_DepthLessEqual` | — | `depth("greater") / depth("less")` | — |
| Referencia de stencil (salida) | — | `SV_StencilRef` | `gl_FragStencilRefARB` | `stencil` | `BuiltIn_FragStencilRef` |
| Índice de muestra | `@builtin_sample_index` | `SV_SampleIndex` | `gl_SampleID` | `sample_id` | `BuiltIn_SampleId` |
| Máscara de muestras | `@builtin_sample_mask` | `SV_Coverage` | `gl_SampleMask / gl_SampleMaskIn` | `sample_mask` | `BuiltIn_SampleMask` |
| Índice de primitiva | `@builtin_primitive_index` | `SV_PrimitiveID` | `gl_PrimitiveID` | `primitive_id` | `BuiltIn_PrimitiveId` |
| Coordenadas baricéntricas | — | `SV_Barycentrics` | `gl_BaryCoordEXT` | `barycentric_coord` | `BuiltIn_BaryCoord` |
| Coordenadas baricéntricas (sin perspectiva) | — | — | `gl_BaryCoordNoPerspEXT` | — | `BuiltIn_BaryCoordNoPersp` |
| Invocación auxiliar | — | — | `gl_HelperInvocation` | — | `BuiltIn_HelperInvocation` |
| Posición de muestra | — | — | `gl_SamplePosition` | — | `BuiltIn_SamplePosition` |
| **Etapa de compute** | | | | | |
| Id de invocación global | `@builtin_global_invocation_id` | `SV_DispatchThreadID` | `gl_GlobalInvocationID` | `thread_position_in_grid` | `BuiltIn_GlobalInvocationId` |
| Id de invocación local | `@builtin_local_invocation_id` | `SV_GroupThreadID` | `gl_LocalInvocationID` | `thread_position_in_threadgroup` | `BuiltIn_LocalInvocationId` |
| Índice de invocación local | `@builtin_local_invocation_index` | `SV_GroupIndex` | `gl_LocalInvocationIndex` | `thread_index_in_threadgroup` | `BuiltIn_LocalInvocationIndex` |
| Id de workgroup | `@builtin_workgroup_id` | `SV_GroupID` | `gl_WorkGroupID` | `threadgroup_position_in_grid` | `BuiltIn_WorkgroupId` |
| Número de workgroups | `@builtin_num_workgroups` | — | `gl_NumWorkGroups` | `threadgroups_per_grid` | `BuiltIn_NumWorkgroups` |
| Tamaño del workgroup (atributo de método) | `@workgroup_size` | `numthreads` | `layout_local_size` | — | — |
| Tamaño del workgroup (valor integrado) | — | — | `gl_WorkGroupSize` | `threads_per_threadgroup` | `BuiltIn_WorkgroupSize` |
| Tamaño del subgrupo | `@builtin_subgroup_size` | — | `gl_SubgroupSize` | `threads_per_simdgroup` | `BuiltIn_SubgroupSize` |
| Id de invocación del subgrupo | `@builtin_subgroup_invocation_id` | — | `gl_SubgroupInvocationID` | `thread_index_in_simdgroup` | `BuiltIn_SubgroupInvocationId` |
| Id del subgrupo | `@builtin_subgroup_id` | — | `gl_SubgroupID` | `simdgroup_index_in_threadgroup` | `BuiltIn_SubgroupId` |
| Número de subgrupos | `@builtin_num_subgroups` | — | `gl_NumSubgroups` | `simdgroups_per_threadgroup` | `BuiltIn_NumSubgroups` |

### Recursos

| Concepto | WGSL | HLSL | GLSL | MSL | SPIR-V |
| --- | --- | --- | --- | --- | --- |
| Uniform buffer | `uniform` | `cbuffer, ConstantBuffer<T>` | `uniform` | `constant` | `Uniform` |
| Storage buffer de lectura y escritura | `storage(storage_use.read_write)` | `RWStructuredBuffer<T>` | `buffer` | `device` | `StorageBuffer` |
| Storage buffer de solo lectura | `storage(storage_use.read)` | `StructuredBuffer<T>` | `buffer` | `device(readOnly: true)` | `StorageBuffer` |
| Binding slot | `@group(s) + @binding(n)` | `register(RegisterPrefix.b, n)` | `layout(set, binding)` | `buffer(n), texture(n), sampler(n)` | `DescriptorSet(s) + Binding(n)` |
| Texture slot | `@group(s) + @binding(n)` | `register(RegisterPrefix.t, n)` | `layout(set, binding)` | `texture(n)` | `DescriptorSet(s) + Binding(n)` |
| Sampler slot | `@group(s) + @binding(n)` | `register(RegisterPrefix.s, n)` | `layout(set, binding)` | `sampler(n)` | `DescriptorSet(s) + Binding(n)` |

## Atributos

Los atributos que declara el paquete, en grupos y aplicados a miembros reales.

### Atributos de entrada

Se aplican a campos, parámetros y propiedades que reciben valores del pipeline.

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;

public struct InputExamples
{
    // Indicador de cara frontal
    [@builtin_front_facing] public bool FrontFacingFlag;
    // Id de invocación global
    [@builtin_global_invocation_id]
    public UInt3 GlobalInvocationId;
    // Índice de instancia
    [@builtin_instance_index] public uint InstanceIndex;
    // Id de invocación local
    [@builtin_local_invocation_id]
    public UInt3 LocalInvocationId;
    // Índice de invocación local
    [@builtin_local_invocation_index]
    public uint LocalInvocationIndex;
    // Número de subgrupos
    [@builtin_num_subgroups] public uint NumberOfSubgroups;
    // Número de workgroups
    [@builtin_num_workgroups] public UInt3 NumberOfWorkgroups;
    // Índice de primitiva
    [@builtin_primitive_index] public uint PrimitiveIndex;
    // Índice de muestra
    [@builtin_sample_index] public uint SampleIndex;
    // Id del subgrupo
    [@builtin_subgroup_id] public uint SubgroupId;
    // Id de invocación del subgrupo
    [@builtin_subgroup_invocation_id]
    public UInt3 SubgroupInvocationId;
    // Tamaño del subgrupo
    [@builtin_subgroup_size] public uint SubgroupSize;
    // Índice de vértice
    [@builtin_vertex_index] public uint VertexIndex;
    // Id de workgroup
    [@builtin_workgroup_id] public UInt3 WorkgroupId;
}
```

### Atributos de entrada y salida

Se aplican a valores que se pueden recibir o producir, según la etapa.

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;

public struct InputOutputExamples
{
    // Posición en clip space (salida de vertex)
    [@builtin_position] public Vector4 ClipSpacePosition;
    // Máscara de muestras
    [@builtin_sample_mask] public uint SampleMask;
    [@location(0)] public Vector4 Value3;
}
```

### Atributos de salida

Se aplican a campos, parámetros y valores de retorno que produce la etapa.

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;

public struct OutputExamples
{
    // Distancia de clip
    [@builtin_clip_distances] public float ClipDistance;
    // Profundidad del fragmento (salida)
    [@builtin_frag_depth] public float FragmentDepth;
}
```

### Atributos de método

Se aplican a métodos, por ejemplo para fijar el tamaño del grupo de trabajo de un compute.

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;

public class MethodExamples
{
    [ShaderStage(Stage.Compute)]
    [@workgroup_size(8)]
    public void Workgroup_sizeExample() { }
}
```

### Atributos de recurso

Declaran uniforms, buffers, texturas, samplers y ranuras.

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;
using YotsubaShader.WgslSyntax.Resources;

public class ResourceExamples
{
    [@binding(0)] public float Value1;
    [@group(0)] public float Value2;
    [storage(storage_use.read_write)] public float Value3;
    [uniform] public float Value4;
}
```

### Tipos de apoyo

Structs, clases y enums que se usan junto con los atributos.

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;

public class Types
{
    public YotsubaShader.WgslSyntax.Types.__frexp_result_f16 __frexp_result_f16Value;
    public YotsubaShader.WgslSyntax.Types.__frexp_result_f32 __frexp_result_f32Value;
    public YotsubaShader.WgslSyntax.Types.__frexp_result_vec2_f16 __frexp_result_vec2_f16Value;
    public YotsubaShader.WgslSyntax.Types.__frexp_result_vec2_f32 __frexp_result_vec2_f32Value;
    public YotsubaShader.WgslSyntax.Types.__frexp_result_vec3_f16 __frexp_result_vec3_f16Value;
    public YotsubaShader.WgslSyntax.Types.__frexp_result_vec3_f32 __frexp_result_vec3_f32Value;
    public YotsubaShader.WgslSyntax.Types.__frexp_result_vec4_f16 __frexp_result_vec4_f16Value;
    public YotsubaShader.WgslSyntax.Types.__frexp_result_vec4_f32 __frexp_result_vec4_f32Value;
    public YotsubaShader.WgslSyntax.Types.__modf_result_f16 __modf_result_f16Value;
    public YotsubaShader.WgslSyntax.Types.__modf_result_f32 __modf_result_f32Value;
    public YotsubaShader.WgslSyntax.Types.__modf_result_vec2_f16 __modf_result_vec2_f16Value;
    public YotsubaShader.WgslSyntax.Types.__modf_result_vec2_f32 __modf_result_vec2_f32Value;
    public YotsubaShader.WgslSyntax.Types.__modf_result_vec3_f16 __modf_result_vec3_f16Value;
    public YotsubaShader.WgslSyntax.Types.__modf_result_vec3_f32 __modf_result_vec3_f32Value;
    public YotsubaShader.WgslSyntax.Types.__modf_result_vec4_f16 __modf_result_vec4_f16Value;
    public YotsubaShader.WgslSyntax.Types.__modf_result_vec4_f32 __modf_result_vec4_f32Value;
    public YotsubaShader.WgslSyntax.Types.mat2x2<float> mat2x2GenericValue;
    public YotsubaShader.WgslSyntax.Types.mat2x3<float> mat2x3GenericValue;
    public YotsubaShader.WgslSyntax.Types.mat2x4<float> mat2x4GenericValue;
    public YotsubaShader.WgslSyntax.Types.mat3x2<float> mat3x2GenericValue;
    public YotsubaShader.WgslSyntax.Types.mat3x3<float> mat3x3GenericValue;
    public YotsubaShader.WgslSyntax.Types.mat3x4<float> mat3x4GenericValue;
    public YotsubaShader.WgslSyntax.Types.mat4x2<float> mat4x2GenericValue;
    public YotsubaShader.WgslSyntax.Types.mat4x3<float> mat4x3GenericValue;
    public YotsubaShader.WgslSyntax.Types.mat4x4<float> mat4x4GenericValue;
    public YotsubaShader.WgslSyntax.Resources.Types.sampler SamplerValue;
    public YotsubaShader.WgslSyntax.Resources.Types.sampler_comparison Sampler_comparisonValue;
    public YotsubaShader.WgslSyntax.Resources.storage_use Storage_useValue;
    public YotsubaShader.WgslSyntax.Resources.Types.texture_1d<float> texture_1dGenericValue;
    public YotsubaShader.WgslSyntax.Resources.Types.texture_2d<float> texture_2dGenericValue;
    public YotsubaShader.WgslSyntax.Resources.Types.texture_2d_array<float> texture_2d_arrayGenericValue;
    public YotsubaShader.WgslSyntax.Resources.Types.texture_3d<float> texture_3dGenericValue;
    public YotsubaShader.WgslSyntax.Resources.Types.texture_cube<float> texture_cubeGenericValue;
    public YotsubaShader.WgslSyntax.Resources.Types.texture_cube_array<float> texture_cube_arrayGenericValue;
    public YotsubaShader.WgslSyntax.Resources.Types.texture_depth_2d Texture_depth_2dValue;
    public YotsubaShader.WgslSyntax.Resources.Types.texture_depth_2d_array Texture_depth_2d_arrayValue;
    public YotsubaShader.WgslSyntax.Resources.Types.texture_depth_cube Texture_depth_cubeValue;
    public YotsubaShader.WgslSyntax.Resources.Types.texture_depth_cube_array Texture_depth_cube_arrayValue;
    public YotsubaShader.WgslSyntax.Resources.Types.texture_depth_multisampled_2d Texture_depth_multisampled_2dValue;
    public YotsubaShader.WgslSyntax.Resources.Types.texture_external Texture_externalValue;
    public YotsubaShader.WgslSyntax.Resources.Types.texture_multisampled_2d<float> texture_multisampled_2dGenericValue;
    public YotsubaShader.WgslSyntax.Resources.Types.texture_storage_1d<T1, T2> Texture_storage_1d<T1, T2>Value;
    public YotsubaShader.WgslSyntax.Resources.Types.texture_storage_2d<T1, T2> Texture_storage_2d<T1, T2>Value;
    public YotsubaShader.WgslSyntax.Resources.Types.texture_storage_2d_array<T1, T2> Texture_storage_2d_array<T1, T2>Value;
    public YotsubaShader.WgslSyntax.Resources.Types.texture_storage_3d<T1, T2> Texture_storage_3d<T1, T2>Value;
    public YotsubaShader.WgslSyntax.Types.vec2<float> vec2GenericValue;
    public YotsubaShader.WgslSyntax.Types.vec3<float> vec3GenericValue;
    public YotsubaShader.WgslSyntax.Types.vec4<float> vec4GenericValue;
}
```

> [!NOTE]
> Estos listados muestran lo que declara el paquete. No significan que todos los destinos de salida traduzcan todos los conceptos.

Las otras sintaxis: [HLSL](hlsl.md), [GLSL](glsl.md), [MSL](msl.md), [SPIR-V](spirv.md).

---
title: Sintaxis SPIR-V
summary: Todos los atributos de la sintaxis SPIR-V, con ejemplos en C#.
order: 4
---

La sintaxis SPIR-V está inspirada en **SPIR-V (Vulkan)**. Tiene 34 atributos en el paquete `YotsubaShader.SpirvSyntax`. La sintaxis con la que escribes no decide el resultado: el mismo shader compila a cualquier destino.

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

public struct VertexOutput
{
    [BuiltIn_Position]
    public Vector4 Position;
}
```

## Valores integrados por etapa

Todos los valores integrados que declara la sintaxis, agrupados por la etapa que los usa.

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

// Etapa de vertex
public struct VertexBuiltIns
{
    // Posición en clip space (salida de vertex)
    [BuiltIn_Position] public Vector4 ClipSpacePosition;

    // Índice de vértice
    [BuiltIn_VertexIndex] public int VertexIndex;

    // Índice de instancia
    [BuiltIn_InstanceIndex] public int InstanceIndex;

    // Vértice base
    [BuiltIn_BaseVertex] public int BaseVertex;

    // Instancia base
    [BuiltIn_BaseInstance] public int BaseInstance;

    // Distancia de clip
    [BuiltIn_ClipDistance] public float ClipDistance;

    // Capa del render target
    [BuiltIn_Layer] public uint RenderTargetLayer;

    // Índice de viewport
    [BuiltIn_ViewportIndex] public uint ViewportIndex;
}

// Etapa de fragment
public struct FragmentBuiltIns
{
    // Coordenada de fragmento
    [BuiltIn_FragCoord] public Vector4 FragmentCoordinate;

    // Indicador de cara frontal
    [BuiltIn_FrontFacing] public bool FrontFacingFlag;

    // Profundidad del fragmento (salida)
    [BuiltIn_FragDepth] public float FragmentDepth;

    // Referencia de stencil (salida)
    [BuiltIn_FragStencilRef] public uint StencilReference;

    // Índice de muestra
    [BuiltIn_SampleId] public uint SampleIndex;

    // Máscara de muestras
    [BuiltIn_SampleMask] public uint SampleMask;

    // Índice de primitiva
    [BuiltIn_PrimitiveId] public uint PrimitiveIndex;

    // Coordenadas baricéntricas
    [BuiltIn_BaryCoord] public Vector4 BarycentricCoordinates;

    // Coordenadas baricéntricas (sin perspectiva)
    [BuiltIn_BaryCoordNoPersp] public Vector4 BarycentricCoordinates2;

    // Invocación auxiliar
    [BuiltIn_HelperInvocation] public bool HelperInvocation;

    // Posición de muestra
    [BuiltIn_SamplePosition] public Vector2 SamplePosition;
}

// Etapa de compute
public class ComputeBuiltIns
{
    // Id de invocación global
    [BuiltIn_GlobalInvocationId] public UInt3 GlobalInvocationId;

    // Id de invocación local
    [BuiltIn_LocalInvocationId] public UInt3 LocalInvocationId;

    // Índice de invocación local
    [BuiltIn_LocalInvocationIndex] public uint LocalInvocationIndex;

    // Id de workgroup
    [BuiltIn_WorkgroupId] public UInt3 WorkgroupId;

    // Número de workgroups
    [BuiltIn_NumWorkgroups] public UInt3 NumberOfWorkgroups;

    // Tamaño del workgroup (valor integrado)
    [BuiltIn_WorkgroupSize] public UInt3 WorkgroupSize;

    // Tamaño del subgrupo
    [BuiltIn_SubgroupSize] public uint SubgroupSize;

    // Id de invocación del subgrupo
    [BuiltIn_SubgroupInvocationId] public UInt3 SubgroupInvocationId;

    // Id del subgrupo
    [BuiltIn_SubgroupId] public uint SubgroupId;

    // Número de subgrupos
    [BuiltIn_NumSubgroups] public uint NumberOfSubgroups;
}
```

## Recursos y ranuras

Buffers uniformes, buffers de almacenamiento, texturas y samplers, cada uno con su ranura escrita en esta sintaxis.

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;
using YotsubaShader.SpirvSyntax.Resources;

public struct Material
{
    public float Exposure;
}

public class Resources
{
    // Uniform buffer, con su slot de binding
    [Uniform, DescriptorSet(0), @Binding(0)]
    public Material Material;

    // Storage buffer de lectura y escritura
    [StorageBuffer, DescriptorSet(0), @Binding(1)]
    public float[] Output;

    // Storage buffer de solo lectura (el mismo atributo)
    [StorageBuffer, DescriptorSet(0), @Binding(2)]
    public float[] Input;
}
```

```csharp
using YotsubaShader.SpirvSyntax;
using YotsubaShader.SpirvSyntax.Resources;

public class Surface
{
    [DescriptorSet(0), @Binding(0)]
    public Texture2D Albedo;

    [DescriptorSet(0), @Binding(1)]
    public SamplerState Sampler;
}
```

## Equivalencias en las otras sintaxis

El mismo concepto en SPIR-V y en las otras cuatro sintaxis. Un guion significa que esa sintaxis no tiene forma de escribirlo.

### Valores integrados

| Concepto | SPIR-V | HLSL | GLSL | MSL | WGSL |
| --- | --- | --- | --- | --- | --- |
| **Etapa de vertex** | | | | | |
| Posición en clip space (salida de vertex) | `BuiltIn_Position` | `SV_Position` | `gl_Position` | `position` | `@builtin_position` |
| Índice de vértice | `BuiltIn_VertexIndex` | `SV_VertexID` | `gl_VertexIndex` | `vertex_id` | `@builtin_vertex_index` |
| Índice de instancia | `BuiltIn_InstanceIndex` | `SV_InstanceID` | `gl_InstanceIndex` | `instance_id` | `@builtin_instance_index` |
| Vértice base | `BuiltIn_BaseVertex` | `SV_StartVertexLocation` | `gl_BaseVertex` | `base_vertex` | — |
| Instancia base | `BuiltIn_BaseInstance` | `SV_StartInstanceLocation` | `gl_BaseInstance` | `base_instance` | — |
| Distancia de clip | `BuiltIn_ClipDistance` | `SV_ClipDistanceN` | `gl_ClipDistance` | `clip_distance` | `@builtin_clip_distances` |
| Capa del render target | `BuiltIn_Layer` | `SV_RenderTargetArrayIndex` | `gl_Layer` | `render_target_array_index` | — |
| Índice de viewport | `BuiltIn_ViewportIndex` | `SV_ViewportArrayIndex` | `gl_ViewportIndex` | `viewport_array_index` | — |
| **Etapa de fragment** | | | | | |
| Coordenada de fragmento | `BuiltIn_FragCoord` | `SV_Position` | `gl_FragCoord` | `position` | `@builtin_position` |
| Indicador de cara frontal | `BuiltIn_FrontFacing` | `SV_IsFrontFace` | `gl_FrontFacing` | `front_facing` | `@builtin_front_facing` |
| Profundidad del fragmento (salida) | `BuiltIn_FragDepth` | `SV_Depth` | `gl_FragDepth` | `depth` | `@builtin_frag_depth` |
| Profundidad conservadora | — | `SV_DepthGreaterEqual / SV_DepthLessEqual` | — | `depth("greater") / depth("less")` | — |
| Referencia de stencil (salida) | `BuiltIn_FragStencilRef` | `SV_StencilRef` | `gl_FragStencilRefARB` | `stencil` | — |
| Índice de muestra | `BuiltIn_SampleId` | `SV_SampleIndex` | `gl_SampleID` | `sample_id` | `@builtin_sample_index` |
| Máscara de muestras | `BuiltIn_SampleMask` | `SV_Coverage` | `gl_SampleMask / gl_SampleMaskIn` | `sample_mask` | `@builtin_sample_mask` |
| Índice de primitiva | `BuiltIn_PrimitiveId` | `SV_PrimitiveID` | `gl_PrimitiveID` | `primitive_id` | `@builtin_primitive_index` |
| Coordenadas baricéntricas | `BuiltIn_BaryCoord` | `SV_Barycentrics` | `gl_BaryCoordEXT` | `barycentric_coord` | — |
| Coordenadas baricéntricas (sin perspectiva) | `BuiltIn_BaryCoordNoPersp` | — | `gl_BaryCoordNoPerspEXT` | — | — |
| Invocación auxiliar | `BuiltIn_HelperInvocation` | — | `gl_HelperInvocation` | — | — |
| Posición de muestra | `BuiltIn_SamplePosition` | — | `gl_SamplePosition` | — | — |
| **Etapa de compute** | | | | | |
| Id de invocación global | `BuiltIn_GlobalInvocationId` | `SV_DispatchThreadID` | `gl_GlobalInvocationID` | `thread_position_in_grid` | `@builtin_global_invocation_id` |
| Id de invocación local | `BuiltIn_LocalInvocationId` | `SV_GroupThreadID` | `gl_LocalInvocationID` | `thread_position_in_threadgroup` | `@builtin_local_invocation_id` |
| Índice de invocación local | `BuiltIn_LocalInvocationIndex` | `SV_GroupIndex` | `gl_LocalInvocationIndex` | `thread_index_in_threadgroup` | `@builtin_local_invocation_index` |
| Id de workgroup | `BuiltIn_WorkgroupId` | `SV_GroupID` | `gl_WorkGroupID` | `threadgroup_position_in_grid` | `@builtin_workgroup_id` |
| Número de workgroups | `BuiltIn_NumWorkgroups` | — | `gl_NumWorkGroups` | `threadgroups_per_grid` | `@builtin_num_workgroups` |
| Tamaño del workgroup (atributo de método) | — | `numthreads` | `layout_local_size` | — | `@workgroup_size` |
| Tamaño del workgroup (valor integrado) | `BuiltIn_WorkgroupSize` | — | `gl_WorkGroupSize` | `threads_per_threadgroup` | — |
| Tamaño del subgrupo | `BuiltIn_SubgroupSize` | — | `gl_SubgroupSize` | `threads_per_simdgroup` | `@builtin_subgroup_size` |
| Id de invocación del subgrupo | `BuiltIn_SubgroupInvocationId` | — | `gl_SubgroupInvocationID` | `thread_index_in_simdgroup` | `@builtin_subgroup_invocation_id` |
| Id del subgrupo | `BuiltIn_SubgroupId` | — | `gl_SubgroupID` | `simdgroup_index_in_threadgroup` | `@builtin_subgroup_id` |
| Número de subgrupos | `BuiltIn_NumSubgroups` | — | `gl_NumSubgroups` | `simdgroups_per_threadgroup` | `@builtin_num_subgroups` |

### Recursos

| Concepto | SPIR-V | HLSL | GLSL | MSL | WGSL |
| --- | --- | --- | --- | --- | --- |
| Uniform buffer | `Uniform` | `cbuffer, ConstantBuffer<T>` | `uniform` | `constant` | `uniform` |
| Storage buffer de lectura y escritura | `StorageBuffer` | `RWStructuredBuffer<T>` | `buffer` | `device` | `storage(storage_use.read_write)` |
| Storage buffer de solo lectura | `StorageBuffer` | `StructuredBuffer<T>` | `buffer` | `device(readOnly: true)` | `storage(storage_use.read)` |
| Binding slot | `DescriptorSet(s) + Binding(n)` | `register(RegisterPrefix.b, n)` | `layout(set, binding)` | `buffer(n), texture(n), sampler(n)` | `@group(s) + @binding(n)` |
| Texture slot | `DescriptorSet(s) + Binding(n)` | `register(RegisterPrefix.t, n)` | `layout(set, binding)` | `texture(n)` | `@group(s) + @binding(n)` |
| Sampler slot | `DescriptorSet(s) + Binding(n)` | `register(RegisterPrefix.s, n)` | `layout(set, binding)` | `sampler(n)` | `@group(s) + @binding(n)` |

## Atributos

Los atributos que declara el paquete, en grupos y aplicados a miembros reales.

### Atributos de entrada

Se aplican a campos, parámetros y propiedades que reciben valores del pipeline.

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

public struct InputExamples
{
    // Coordenadas baricéntricas
    [BuiltIn_BaryCoord] public Vector4 BarycentricCoordinates;
    // Coordenadas baricéntricas (sin perspectiva)
    [BuiltIn_BaryCoordNoPersp]
    public Vector4 BarycentricCoordinates2;
    // Instancia base
    [BuiltIn_BaseInstance] public int BaseInstance;
    // Vértice base
    [BuiltIn_BaseVertex] public int BaseVertex;
    // Coordenada de fragmento
    [BuiltIn_FragCoord] public Vector4 FragmentCoordinate;
    // Indicador de cara frontal
    [BuiltIn_FrontFacing] public bool FrontFacingFlag;
    // Id de invocación global
    [BuiltIn_GlobalInvocationId]
    public UInt3 GlobalInvocationId;
    // Invocación auxiliar
    [BuiltIn_HelperInvocation] public bool HelperInvocation;
    // Índice de instancia
    [BuiltIn_InstanceIndex] public int InstanceIndex;
    // Id de invocación local
    [BuiltIn_LocalInvocationId] public UInt3 LocalInvocationId;
    // Índice de invocación local
    [BuiltIn_LocalInvocationIndex]
    public uint LocalInvocationIndex;
    // Número de subgrupos
    [BuiltIn_NumSubgroups] public uint NumberOfSubgroups;
    // Número de workgroups
    [BuiltIn_NumWorkgroups] public UInt3 NumberOfWorkgroups;
    // Índice de primitiva
    [BuiltIn_PrimitiveId] public uint PrimitiveIndex;
    // Índice de muestra
    [BuiltIn_SampleId] public uint SampleIndex;
    // Posición de muestra
    [BuiltIn_SamplePosition] public Vector2 SamplePosition;
    // Id del subgrupo
    [BuiltIn_SubgroupId] public uint SubgroupId;
    // Id de invocación del subgrupo
    [BuiltIn_SubgroupInvocationId]
    public UInt3 SubgroupInvocationId;
    // Tamaño del subgrupo
    [BuiltIn_SubgroupSize] public uint SubgroupSize;
    // Índice de vértice
    [BuiltIn_VertexIndex] public int VertexIndex;
    // Id de workgroup
    [BuiltIn_WorkgroupId] public UInt3 WorkgroupId;
    // Tamaño del workgroup (valor integrado)
    [BuiltIn_WorkgroupSize] public UInt3 WorkgroupSize;
}
```

### Atributos de entrada y salida

Se aplican a valores que se pueden recibir o producir, según la etapa.

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

public struct InputOutputExamples
{
    // Distancia de clip
    [BuiltIn_ClipDistance] public float ClipDistance;
    // Capa del render target
    [BuiltIn_Layer] public uint RenderTargetLayer;
    // Posición en clip space (salida de vertex)
    [BuiltIn_Position] public Vector4 ClipSpacePosition;
    // Máscara de muestras
    [BuiltIn_SampleMask] public uint SampleMask;
    // Índice de viewport
    [BuiltIn_ViewportIndex] public uint ViewportIndex;
    [Location] public Vector4 Value6;
}
```

### Atributos de salida

Se aplican a campos, parámetros y valores de retorno que produce la etapa.

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

public struct OutputExamples
{
    // Profundidad del fragmento (salida)
    [BuiltIn_FragDepth] public float FragmentDepth;
    // Referencia de stencil (salida)
    [BuiltIn_FragStencilRef] public uint StencilReference;
}
```

### Atributos de recurso

Declaran uniforms, buffers, texturas, samplers y ranuras.

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;
using YotsubaShader.SpirvSyntax.Resources;

public class ResourceExamples
{
    [@Binding(0)] public float Value1;
    [DescriptorSet(0)] public float Value2;
    [StorageBuffer] public float Value3;
    [Uniform] public float Value4;
}
```

### Tipos de apoyo

Structs, clases y enums que se usan junto con los atributos.

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

public class Types
{
    public YotsubaShader.SpirvSyntax.Types.bvec2 Bvec2Value;
    public YotsubaShader.SpirvSyntax.Types.bvec3 Bvec3Value;
    public YotsubaShader.SpirvSyntax.Types.bvec4 Bvec4Value;
    public YotsubaShader.SpirvSyntax.Types.dmat2 Dmat2Value;
    public YotsubaShader.SpirvSyntax.Types.dmat2x2 Dmat2x2Value;
    public YotsubaShader.SpirvSyntax.Types.dmat2x3 Dmat2x3Value;
    public YotsubaShader.SpirvSyntax.Types.dmat2x4 Dmat2x4Value;
    public YotsubaShader.SpirvSyntax.Types.dmat3 Dmat3Value;
    public YotsubaShader.SpirvSyntax.Types.dmat3x2 Dmat3x2Value;
    public YotsubaShader.SpirvSyntax.Types.dmat3x3 Dmat3x3Value;
    public YotsubaShader.SpirvSyntax.Types.dmat3x4 Dmat3x4Value;
    public YotsubaShader.SpirvSyntax.Types.dmat4 Dmat4Value;
    public YotsubaShader.SpirvSyntax.Types.dmat4x2 Dmat4x2Value;
    public YotsubaShader.SpirvSyntax.Types.dmat4x3 Dmat4x3Value;
    public YotsubaShader.SpirvSyntax.Types.dmat4x4 Dmat4x4Value;
    public YotsubaShader.SpirvSyntax.Types.dvec2 Dvec2Value;
    public YotsubaShader.SpirvSyntax.Types.dvec3 Dvec3Value;
    public YotsubaShader.SpirvSyntax.Types.dvec4 Dvec4Value;
    public YotsubaShader.SpirvSyntax.Resources.Types.iimage1D Iimage1DValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.iimage2D Iimage2DValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.iimage2DArray Iimage2DArrayValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.iimage2DMS Iimage2DMSValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.iimage3D Iimage3DValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.iimageCube IimageCubeValue;
    public YotsubaShader.SpirvSyntax.Resources.Type.Image1D<float> Image1DGenericValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.image1D Image1DValue;
    public YotsubaShader.SpirvSyntax.Resources.Type.Image2D<float> Image2DGenericValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.image2D Image2DValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.image2DArray Image2DArrayValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.image2DMS Image2DMSValue;
    public YotsubaShader.SpirvSyntax.Resources.Type.Image3D<float> Image3DGenericValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.image3D Image3DValue;
    public YotsubaShader.SpirvSyntax.Resources.Type.ImageCube<float> ImageCubeGenericValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.imageCube ImageCubeValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.isampler1D Isampler1DValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.isampler1DArray Isampler1DArrayValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.isampler2D Isampler2DValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.isampler2DArray Isampler2DArrayValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.isampler2DMS Isampler2DMSValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.isampler2DMSArray Isampler2DMSArrayValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.isampler3D Isampler3DValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.isamplerBuffer IsamplerBufferValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.isamplerCube IsamplerCubeValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.isamplerCubeArray IsamplerCubeArrayValue;
    public YotsubaShader.SpirvSyntax.Types.ivec2 Ivec2Value;
    public YotsubaShader.SpirvSyntax.Types.ivec3 Ivec3Value;
    public YotsubaShader.SpirvSyntax.Types.ivec4 Ivec4Value;
    public YotsubaShader.SpirvSyntax.Types.mat2 Mat2Value;
    public YotsubaShader.SpirvSyntax.Types.mat2x2 Mat2x2Value;
    public YotsubaShader.SpirvSyntax.Types.mat2x3 Mat2x3Value;
    public YotsubaShader.SpirvSyntax.Types.mat2x4 Mat2x4Value;
    public YotsubaShader.SpirvSyntax.Types.mat3 Mat3Value;
    public YotsubaShader.SpirvSyntax.Types.mat3x2 Mat3x2Value;
    public YotsubaShader.SpirvSyntax.Types.mat3x3 Mat3x3Value;
    public YotsubaShader.SpirvSyntax.Types.mat3x4 Mat3x4Value;
    public YotsubaShader.SpirvSyntax.Types.mat4 Mat4Value;
    public YotsubaShader.SpirvSyntax.Types.mat4x2 Mat4x2Value;
    public YotsubaShader.SpirvSyntax.Types.mat4x3 Mat4x3Value;
    public YotsubaShader.SpirvSyntax.Types.mat4x4 Mat4x4Value;
    public YotsubaShader.SpirvSyntax.Resources.Type.Sampler SamplerValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.sampler1D Sampler1DValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.sampler1DArray Sampler1DArrayValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.sampler1DArrayShadow Sampler1DArrayShadowValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.sampler1DShadow Sampler1DShadowValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.sampler2D Sampler2DValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.sampler2DArray Sampler2DArrayValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.sampler2DArrayShadow Sampler2DArrayShadowValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.sampler2DMS Sampler2DMSValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.sampler2DMSArray Sampler2DMSArrayValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.sampler2DShadow Sampler2DShadowValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.sampler3D Sampler3DValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.samplerBuffer SamplerBufferValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.samplerCube SamplerCubeValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.samplerCubeArray SamplerCubeArrayValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.samplerCubeArrayShadow SamplerCubeArrayShadowValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.samplerCubeShadow SamplerCubeShadowValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.uimage1D Uimage1DValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.uimage2D Uimage2DValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.uimage2DArray Uimage2DArrayValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.uimage2DMS Uimage2DMSValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.uimage3D Uimage3DValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.uimageCube UimageCubeValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.usampler1D Usampler1DValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.usampler1DArray Usampler1DArrayValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.usampler2D Usampler2DValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.usampler2DArray Usampler2DArrayValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.usampler2DMS Usampler2DMSValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.usampler2DMSArray Usampler2DMSArrayValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.usampler3D Usampler3DValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.usamplerBuffer UsamplerBufferValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.usamplerCube UsamplerCubeValue;
    public YotsubaShader.SpirvSyntax.Resources.Types.usamplerCubeArray UsamplerCubeArrayValue;
    public YotsubaShader.SpirvSyntax.Types.uvec2 Uvec2Value;
    public YotsubaShader.SpirvSyntax.Types.uvec3 Uvec3Value;
    public YotsubaShader.SpirvSyntax.Types.uvec4 Uvec4Value;
    public YotsubaShader.SpirvSyntax.Types.vec2 Vec2Value;
    public YotsubaShader.SpirvSyntax.Types.vec3 Vec3Value;
    public YotsubaShader.SpirvSyntax.Types.vec4 Vec4Value;
}
```

> [!NOTE]
> Estos listados muestran lo que declara el paquete. No significan que todos los destinos de salida traduzcan todos los conceptos.

Las otras sintaxis: [HLSL](hlsl.md), [GLSL](glsl.md), [MSL](msl.md), [WGSL](wgsl.md).

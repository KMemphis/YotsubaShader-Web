---
title: Sintaxis GLSL
summary: Todos los atributos de la sintaxis GLSL, con ejemplos en C#.
order: 2
---

La sintaxis GLSL está inspirada en **GLSL (OpenGL / Vulkan GLSL)**. Tiene 35 atributos en el paquete `YotsubaShader.GlslSyntax`. La sintaxis con la que escribes no decide el resultado: el mismo shader compila a cualquier destino.

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

public struct VertexOutput
{
    [gl_Position]
    public Vector4 Position;
}
```

## Valores integrados por etapa

Todos los valores integrados que declara la sintaxis, agrupados por la etapa que los usa.

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

// Etapa de vertex
public struct VertexBuiltIns
{
    // Posición en clip space (salida de vertex)
    [gl_Position] public Vector4 ClipSpacePosition;

    // Índice de vértice
    [gl_VertexIndex] public int VertexIndex;

    // Índice de instancia
    [gl_InstanceIndex] public int InstanceIndex;

    // Vértice base
    [gl_BaseVertex] public int BaseVertex;

    // Instancia base
    [gl_BaseInstance] public int BaseInstance;

    // Distancia de clip
    [gl_ClipDistance] public float ClipDistance;

    // Capa del render target
    [gl_Layer] public uint RenderTargetLayer;

    // Índice de viewport
    [gl_ViewportIndex] public uint ViewportIndex;
}

// Etapa de fragment
public struct FragmentBuiltIns
{
    // Coordenada de fragmento
    [gl_FragCoord] public Vector4 FragmentCoordinate;

    // Indicador de cara frontal
    [gl_FrontFacing] public bool FrontFacingFlag;

    // Profundidad del fragmento (salida)
    [gl_FragDepth] public float FragmentDepth;

    // Referencia de stencil (salida)
    [gl_FragStencilRefARB] public uint StencilReference;

    // Índice de muestra
    [gl_SampleID] public uint SampleIndex;

    // Máscara de muestras
    [gl_SampleMask] public uint SampleMask;

    // Máscara de muestras
    [gl_SampleMaskIn] public uint SampleMask2;

    // Índice de primitiva
    [gl_PrimitiveID] public uint PrimitiveIndex;

    // Coordenadas baricéntricas
    [gl_BaryCoordEXT] public Vector4 BarycentricCoordinates;

    // Coordenadas baricéntricas (sin perspectiva)
    [gl_BaryCoordNoPerspEXT] public Vector4 BarycentricCoordinates2;

    // Invocación auxiliar
    [gl_HelperInvocation] public bool HelperInvocation;

    // Posición de muestra
    [gl_SamplePosition] public Vector2 SamplePosition;
}

// Etapa de compute
public class ComputeBuiltIns
{
    // Id de invocación global
    [gl_GlobalInvocationID] public UInt3 GlobalInvocationId;

    // Id de invocación local
    [gl_LocalInvocationID] public UInt3 LocalInvocationId;

    // Índice de invocación local
    [gl_LocalInvocationIndex] public uint LocalInvocationIndex;

    // Id de workgroup
    [gl_WorkGroupID] public UInt3 WorkgroupId;

    // Número de workgroups
    [gl_NumWorkGroups] public UInt3 NumberOfWorkgroups;

    // Tamaño del workgroup (valor integrado)
    [gl_WorkGroupSize] public UInt3 WorkgroupSize;

    // Tamaño del subgrupo
    [gl_SubgroupSize] public uint SubgroupSize;

    // Id de invocación del subgrupo
    [gl_SubgroupInvocationID] public UInt3 SubgroupInvocationId;

    // Id del subgrupo
    [gl_SubgroupID] public uint SubgroupId;

    // Número de subgrupos
    [gl_NumSubgroups] public uint NumberOfSubgroups;

    // Tamaño del workgroup (atributo de método)
    [ShaderStage(Stage.Compute)]
    [layout_local_size(8, 8, 1)]
    public void Compute() { }
}
```

## Recursos y ranuras

Buffers uniformes, buffers de almacenamiento, texturas y samplers, cada uno con su ranura escrita en esta sintaxis.

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Resources;

public struct Material
{
    public float Exposure;
}

public class Resources
{
    // Uniform buffer, con su slot de binding
    [uniform, layout(0, 0)]
    public Material Material;

    // Storage buffer de lectura y escritura
    [buffer, layout(0, 1)]
    public float[] Output;

    // Storage buffer de solo lectura (el mismo atributo)
    [buffer, layout(0, 2)]
    public float[] Input;
}
```

```csharp
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Resources;

public class Surface
{
    [layout(0, 0)]
    public Texture2D Albedo;

    [layout(0, 1)]
    public SamplerState Sampler;
}
```

## Equivalencias en las otras sintaxis

El mismo concepto en GLSL y en las otras cuatro sintaxis. Un guion significa que esa sintaxis no tiene forma de escribirlo.

### Valores integrados

| Concepto | GLSL | HLSL | MSL | SPIR-V | WGSL |
| --- | --- | --- | --- | --- | --- |
| **Etapa de vertex** | | | | | |
| Posición en clip space (salida de vertex) | `gl_Position` | `SV_Position` | `position` | `BuiltIn_Position` | `@builtin_position` |
| Índice de vértice | `gl_VertexIndex` | `SV_VertexID` | `vertex_id` | `BuiltIn_VertexIndex` | `@builtin_vertex_index` |
| Índice de instancia | `gl_InstanceIndex` | `SV_InstanceID` | `instance_id` | `BuiltIn_InstanceIndex` | `@builtin_instance_index` |
| Vértice base | `gl_BaseVertex` | `SV_StartVertexLocation` | `base_vertex` | `BuiltIn_BaseVertex` | — |
| Instancia base | `gl_BaseInstance` | `SV_StartInstanceLocation` | `base_instance` | `BuiltIn_BaseInstance` | — |
| Distancia de clip | `gl_ClipDistance` | `SV_ClipDistanceN` | `clip_distance` | `BuiltIn_ClipDistance` | `@builtin_clip_distances` |
| Capa del render target | `gl_Layer` | `SV_RenderTargetArrayIndex` | `render_target_array_index` | `BuiltIn_Layer` | — |
| Índice de viewport | `gl_ViewportIndex` | `SV_ViewportArrayIndex` | `viewport_array_index` | `BuiltIn_ViewportIndex` | — |
| **Etapa de fragment** | | | | | |
| Coordenada de fragmento | `gl_FragCoord` | `SV_Position` | `position` | `BuiltIn_FragCoord` | `@builtin_position` |
| Indicador de cara frontal | `gl_FrontFacing` | `SV_IsFrontFace` | `front_facing` | `BuiltIn_FrontFacing` | `@builtin_front_facing` |
| Profundidad del fragmento (salida) | `gl_FragDepth` | `SV_Depth` | `depth` | `BuiltIn_FragDepth` | `@builtin_frag_depth` |
| Profundidad conservadora | — | `SV_DepthGreaterEqual / SV_DepthLessEqual` | `depth("greater") / depth("less")` | — | — |
| Referencia de stencil (salida) | `gl_FragStencilRefARB` | `SV_StencilRef` | `stencil` | `BuiltIn_FragStencilRef` | — |
| Índice de muestra | `gl_SampleID` | `SV_SampleIndex` | `sample_id` | `BuiltIn_SampleId` | `@builtin_sample_index` |
| Máscara de muestras | `gl_SampleMask / gl_SampleMaskIn` | `SV_Coverage` | `sample_mask` | `BuiltIn_SampleMask` | `@builtin_sample_mask` |
| Índice de primitiva | `gl_PrimitiveID` | `SV_PrimitiveID` | `primitive_id` | `BuiltIn_PrimitiveId` | `@builtin_primitive_index` |
| Coordenadas baricéntricas | `gl_BaryCoordEXT` | `SV_Barycentrics` | `barycentric_coord` | `BuiltIn_BaryCoord` | — |
| Coordenadas baricéntricas (sin perspectiva) | `gl_BaryCoordNoPerspEXT` | — | — | `BuiltIn_BaryCoordNoPersp` | — |
| Invocación auxiliar | `gl_HelperInvocation` | — | — | `BuiltIn_HelperInvocation` | — |
| Posición de muestra | `gl_SamplePosition` | — | — | `BuiltIn_SamplePosition` | — |
| **Etapa de compute** | | | | | |
| Id de invocación global | `gl_GlobalInvocationID` | `SV_DispatchThreadID` | `thread_position_in_grid` | `BuiltIn_GlobalInvocationId` | `@builtin_global_invocation_id` |
| Id de invocación local | `gl_LocalInvocationID` | `SV_GroupThreadID` | `thread_position_in_threadgroup` | `BuiltIn_LocalInvocationId` | `@builtin_local_invocation_id` |
| Índice de invocación local | `gl_LocalInvocationIndex` | `SV_GroupIndex` | `thread_index_in_threadgroup` | `BuiltIn_LocalInvocationIndex` | `@builtin_local_invocation_index` |
| Id de workgroup | `gl_WorkGroupID` | `SV_GroupID` | `threadgroup_position_in_grid` | `BuiltIn_WorkgroupId` | `@builtin_workgroup_id` |
| Número de workgroups | `gl_NumWorkGroups` | — | `threadgroups_per_grid` | `BuiltIn_NumWorkgroups` | `@builtin_num_workgroups` |
| Tamaño del workgroup (atributo de método) | `layout_local_size` | `numthreads` | — | — | `@workgroup_size` |
| Tamaño del workgroup (valor integrado) | `gl_WorkGroupSize` | — | `threads_per_threadgroup` | `BuiltIn_WorkgroupSize` | — |
| Tamaño del subgrupo | `gl_SubgroupSize` | — | `threads_per_simdgroup` | `BuiltIn_SubgroupSize` | `@builtin_subgroup_size` |
| Id de invocación del subgrupo | `gl_SubgroupInvocationID` | — | `thread_index_in_simdgroup` | `BuiltIn_SubgroupInvocationId` | `@builtin_subgroup_invocation_id` |
| Id del subgrupo | `gl_SubgroupID` | — | `simdgroup_index_in_threadgroup` | `BuiltIn_SubgroupId` | `@builtin_subgroup_id` |
| Número de subgrupos | `gl_NumSubgroups` | — | `simdgroups_per_threadgroup` | `BuiltIn_NumSubgroups` | `@builtin_num_subgroups` |

### Recursos

| Concepto | GLSL | HLSL | MSL | SPIR-V | WGSL |
| --- | --- | --- | --- | --- | --- |
| Uniform buffer | `uniform` | `cbuffer, ConstantBuffer<T>` | `constant` | `Uniform` | `uniform` |
| Storage buffer de lectura y escritura | `buffer` | `RWStructuredBuffer<T>` | `device` | `StorageBuffer` | `storage(storage_use.read_write)` |
| Storage buffer de solo lectura | `buffer` | `StructuredBuffer<T>` | `device(readOnly: true)` | `StorageBuffer` | `storage(storage_use.read)` |
| Binding slot | `layout(set, binding)` | `register(RegisterPrefix.b, n)` | `buffer(n), texture(n), sampler(n)` | `DescriptorSet(s) + Binding(n)` | `@group(s) + @binding(n)` |
| Texture slot | `layout(set, binding)` | `register(RegisterPrefix.t, n)` | `texture(n)` | `DescriptorSet(s) + Binding(n)` | `@group(s) + @binding(n)` |
| Sampler slot | `layout(set, binding)` | `register(RegisterPrefix.s, n)` | `sampler(n)` | `DescriptorSet(s) + Binding(n)` | `@group(s) + @binding(n)` |

## Atributos

Los atributos que declara el paquete, en grupos y aplicados a miembros reales.

### Atributos de entrada

Se aplican a campos, parámetros y propiedades que reciben valores del pipeline.

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

public struct InputExamples
{
    // Coordenadas baricéntricas
    [gl_BaryCoordEXT] public Vector4 BarycentricCoordinates;
    // Coordenadas baricéntricas (sin perspectiva)
    [gl_BaryCoordNoPerspEXT]
    public Vector4 BarycentricCoordinates2;
    // Instancia base
    [gl_BaseInstance] public int BaseInstance;
    // Vértice base
    [gl_BaseVertex] public int BaseVertex;
    // Coordenada de fragmento
    [gl_FragCoord] public Vector4 FragmentCoordinate;
    // Indicador de cara frontal
    [gl_FrontFacing] public bool FrontFacingFlag;
    // Id de invocación global
    [gl_GlobalInvocationID] public UInt3 GlobalInvocationId;
    // Invocación auxiliar
    [gl_HelperInvocation] public bool HelperInvocation;
    // Índice de instancia
    [gl_InstanceIndex] public int InstanceIndex;
    // Id de invocación local
    [gl_LocalInvocationID] public UInt3 LocalInvocationId;
    // Índice de invocación local
    [gl_LocalInvocationIndex] public uint LocalInvocationIndex;
    // Número de subgrupos
    [gl_NumSubgroups] public uint NumberOfSubgroups;
    // Número de workgroups
    [gl_NumWorkGroups] public UInt3 NumberOfWorkgroups;
    // Índice de primitiva
    [gl_PrimitiveID] public uint PrimitiveIndex;
    // Índice de muestra
    [gl_SampleID] public uint SampleIndex;
    // Máscara de muestras
    [gl_SampleMaskIn] public uint SampleMask;
    // Posición de muestra
    [gl_SamplePosition] public Vector2 SamplePosition;
    // Id del subgrupo
    [gl_SubgroupID] public uint SubgroupId;
    // Id de invocación del subgrupo
    [gl_SubgroupInvocationID] public UInt3 SubgroupInvocationId;
    // Tamaño del subgrupo
    [gl_SubgroupSize] public uint SubgroupSize;
    // Índice de vértice
    [gl_VertexIndex] public int VertexIndex;
    // Id de workgroup
    [gl_WorkGroupID] public UInt3 WorkgroupId;
    // Tamaño del workgroup (valor integrado)
    [gl_WorkGroupSize] public UInt3 WorkgroupSize;
}
```

### Atributos de entrada y salida

Se aplican a valores que se pueden recibir o producir, según la etapa.

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

public struct InputOutputExamples
{
    // Capa del render target
    [gl_Layer] public uint RenderTargetLayer;
    // Posición en clip space (salida de vertex)
    [gl_Position] public Vector4 ClipSpacePosition;
    // Índice de viewport
    [gl_ViewportIndex] public uint ViewportIndex;
    [location(0)] public Vector4 Value4;
}
```

### Atributos de salida

Se aplican a campos, parámetros y valores de retorno que produce la etapa.

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

public struct OutputExamples
{
    // Distancia de clip
    [gl_ClipDistance] public float ClipDistance;
    // Profundidad del fragmento (salida)
    [gl_FragDepth] public float FragmentDepth;
    // Referencia de stencil (salida)
    [gl_FragStencilRefARB] public uint StencilReference;
    // Máscara de muestras
    [gl_SampleMask] public uint SampleMask;
}
```

### Atributos de método

Se aplican a métodos, por ejemplo para fijar el tamaño del grupo de trabajo de un compute.

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

public class MethodExamples
{
    [ShaderStage(Stage.Compute)]
    [layout_local_size(8)]
    public void Layout_local_sizeExample() { }
}
```

### Atributos de recurso

Declaran uniforms, buffers, texturas, samplers y ranuras.

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Resources;

public class ResourceExamples
{
    [buffer] public float Value1;
    [layout(0, 0)] public float Value2;
    [uniform] public float Value3;
}
```

### Tipos de apoyo

Structs, clases y enums que se usan junto con los atributos.

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

public class Types
{
    public YotsubaShader.GlslSyntax.Types.bvec2 Bvec2Value;
    public YotsubaShader.GlslSyntax.Types.bvec3 Bvec3Value;
    public YotsubaShader.GlslSyntax.Types.bvec4 Bvec4Value;
    public YotsubaShader.GlslSyntax.Types.dmat2 Dmat2Value;
    public YotsubaShader.GlslSyntax.Types.dmat2x2 Dmat2x2Value;
    public YotsubaShader.GlslSyntax.Types.dmat2x3 Dmat2x3Value;
    public YotsubaShader.GlslSyntax.Types.dmat2x4 Dmat2x4Value;
    public YotsubaShader.GlslSyntax.Types.dmat3 Dmat3Value;
    public YotsubaShader.GlslSyntax.Types.dmat3x2 Dmat3x2Value;
    public YotsubaShader.GlslSyntax.Types.dmat3x3 Dmat3x3Value;
    public YotsubaShader.GlslSyntax.Types.dmat3x4 Dmat3x4Value;
    public YotsubaShader.GlslSyntax.Types.dmat4 Dmat4Value;
    public YotsubaShader.GlslSyntax.Types.dmat4x2 Dmat4x2Value;
    public YotsubaShader.GlslSyntax.Types.dmat4x3 Dmat4x3Value;
    public YotsubaShader.GlslSyntax.Types.dmat4x4 Dmat4x4Value;
    public YotsubaShader.GlslSyntax.Types.dvec2 Dvec2Value;
    public YotsubaShader.GlslSyntax.Types.dvec3 Dvec3Value;
    public YotsubaShader.GlslSyntax.Types.dvec4 Dvec4Value;
    public YotsubaShader.GlslSyntax.Resources.Types.iimage1D Iimage1DValue;
    public YotsubaShader.GlslSyntax.Resources.Types.iimage2D Iimage2DValue;
    public YotsubaShader.GlslSyntax.Resources.Types.iimage2DArray Iimage2DArrayValue;
    public YotsubaShader.GlslSyntax.Resources.Types.iimage2DMS Iimage2DMSValue;
    public YotsubaShader.GlslSyntax.Resources.Types.iimage3D Iimage3DValue;
    public YotsubaShader.GlslSyntax.Resources.Types.iimageCube IimageCubeValue;
    public YotsubaShader.GlslSyntax.Resources.Types.image1D Image1DValue;
    public YotsubaShader.GlslSyntax.Resources.Types.image2D Image2DValue;
    public YotsubaShader.GlslSyntax.Resources.Types.image2DArray Image2DArrayValue;
    public YotsubaShader.GlslSyntax.Resources.Types.image2DMS Image2DMSValue;
    public YotsubaShader.GlslSyntax.Resources.Types.image3D Image3DValue;
    public YotsubaShader.GlslSyntax.Resources.Types.imageCube ImageCubeValue;
    public YotsubaShader.GlslSyntax.Resources.Types.isampler1D Isampler1DValue;
    public YotsubaShader.GlslSyntax.Resources.Types.isampler1DArray Isampler1DArrayValue;
    public YotsubaShader.GlslSyntax.Resources.Types.isampler2D Isampler2DValue;
    public YotsubaShader.GlslSyntax.Resources.Types.isampler2DArray Isampler2DArrayValue;
    public YotsubaShader.GlslSyntax.Resources.Types.isampler2DMS Isampler2DMSValue;
    public YotsubaShader.GlslSyntax.Resources.Types.isampler2DMSArray Isampler2DMSArrayValue;
    public YotsubaShader.GlslSyntax.Resources.Types.isampler3D Isampler3DValue;
    public YotsubaShader.GlslSyntax.Resources.Types.isamplerBuffer IsamplerBufferValue;
    public YotsubaShader.GlslSyntax.Resources.Types.isamplerCube IsamplerCubeValue;
    public YotsubaShader.GlslSyntax.Resources.Types.isamplerCubeArray IsamplerCubeArrayValue;
    public YotsubaShader.GlslSyntax.Types.ivec2 Ivec2Value;
    public YotsubaShader.GlslSyntax.Types.ivec3 Ivec3Value;
    public YotsubaShader.GlslSyntax.Types.ivec4 Ivec4Value;
    public YotsubaShader.GlslSyntax.Types.mat2 Mat2Value;
    public YotsubaShader.GlslSyntax.Types.mat2x2 Mat2x2Value;
    public YotsubaShader.GlslSyntax.Types.mat2x3 Mat2x3Value;
    public YotsubaShader.GlslSyntax.Types.mat2x4 Mat2x4Value;
    public YotsubaShader.GlslSyntax.Types.mat3 Mat3Value;
    public YotsubaShader.GlslSyntax.Types.mat3x2 Mat3x2Value;
    public YotsubaShader.GlslSyntax.Types.mat3x3 Mat3x3Value;
    public YotsubaShader.GlslSyntax.Types.mat3x4 Mat3x4Value;
    public YotsubaShader.GlslSyntax.Types.mat4 Mat4Value;
    public YotsubaShader.GlslSyntax.Types.mat4x2 Mat4x2Value;
    public YotsubaShader.GlslSyntax.Types.mat4x3 Mat4x3Value;
    public YotsubaShader.GlslSyntax.Types.mat4x4 Mat4x4Value;
    public YotsubaShader.GlslSyntax.Resources.Types.sampler1D Sampler1DValue;
    public YotsubaShader.GlslSyntax.Resources.Types.sampler1DArray Sampler1DArrayValue;
    public YotsubaShader.GlslSyntax.Resources.Types.sampler1DArrayShadow Sampler1DArrayShadowValue;
    public YotsubaShader.GlslSyntax.Resources.Types.sampler1DShadow Sampler1DShadowValue;
    public YotsubaShader.GlslSyntax.Resources.Types.sampler2D Sampler2DValue;
    public YotsubaShader.GlslSyntax.Resources.Types.sampler2DArray Sampler2DArrayValue;
    public YotsubaShader.GlslSyntax.Resources.Types.sampler2DArrayShadow Sampler2DArrayShadowValue;
    public YotsubaShader.GlslSyntax.Resources.Types.sampler2DMS Sampler2DMSValue;
    public YotsubaShader.GlslSyntax.Resources.Types.sampler2DMSArray Sampler2DMSArrayValue;
    public YotsubaShader.GlslSyntax.Resources.Types.sampler2DShadow Sampler2DShadowValue;
    public YotsubaShader.GlslSyntax.Resources.Types.sampler3D Sampler3DValue;
    public YotsubaShader.GlslSyntax.Resources.Types.samplerBuffer SamplerBufferValue;
    public YotsubaShader.GlslSyntax.Resources.Types.samplerCube SamplerCubeValue;
    public YotsubaShader.GlslSyntax.Resources.Types.samplerCubeArray SamplerCubeArrayValue;
    public YotsubaShader.GlslSyntax.Resources.Types.samplerCubeArrayShadow SamplerCubeArrayShadowValue;
    public YotsubaShader.GlslSyntax.Resources.Types.samplerCubeShadow SamplerCubeShadowValue;
    public YotsubaShader.GlslSyntax.Resources.Types.uimage1D Uimage1DValue;
    public YotsubaShader.GlslSyntax.Resources.Types.uimage2D Uimage2DValue;
    public YotsubaShader.GlslSyntax.Resources.Types.uimage2DArray Uimage2DArrayValue;
    public YotsubaShader.GlslSyntax.Resources.Types.uimage2DMS Uimage2DMSValue;
    public YotsubaShader.GlslSyntax.Resources.Types.uimage3D Uimage3DValue;
    public YotsubaShader.GlslSyntax.Resources.Types.uimageCube UimageCubeValue;
    public YotsubaShader.GlslSyntax.Resources.Types.usampler1D Usampler1DValue;
    public YotsubaShader.GlslSyntax.Resources.Types.usampler1DArray Usampler1DArrayValue;
    public YotsubaShader.GlslSyntax.Resources.Types.usampler2D Usampler2DValue;
    public YotsubaShader.GlslSyntax.Resources.Types.usampler2DArray Usampler2DArrayValue;
    public YotsubaShader.GlslSyntax.Resources.Types.usampler2DMS Usampler2DMSValue;
    public YotsubaShader.GlslSyntax.Resources.Types.usampler2DMSArray Usampler2DMSArrayValue;
    public YotsubaShader.GlslSyntax.Resources.Types.usampler3D Usampler3DValue;
    public YotsubaShader.GlslSyntax.Resources.Types.usamplerBuffer UsamplerBufferValue;
    public YotsubaShader.GlslSyntax.Resources.Types.usamplerCube UsamplerCubeValue;
    public YotsubaShader.GlslSyntax.Resources.Types.usamplerCubeArray UsamplerCubeArrayValue;
    public YotsubaShader.GlslSyntax.Types.uvec2 Uvec2Value;
    public YotsubaShader.GlslSyntax.Types.uvec3 Uvec3Value;
    public YotsubaShader.GlslSyntax.Types.uvec4 Uvec4Value;
    public YotsubaShader.GlslSyntax.Types.vec2 Vec2Value;
    public YotsubaShader.GlslSyntax.Types.vec3 Vec3Value;
    public YotsubaShader.GlslSyntax.Types.vec4 Vec4Value;
}
```

> [!NOTE]
> Estos listados muestran lo que declara el paquete. No significan que todos los destinos de salida traduzcan todos los conceptos.

Las otras sintaxis: [HLSL](hlsl.md), [MSL](msl.md), [SPIR-V](spirv.md), [WGSL](wgsl.md).

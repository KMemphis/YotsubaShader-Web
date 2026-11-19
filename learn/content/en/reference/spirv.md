---
title: SPIR-V syntax
summary: Every attribute of the SPIR-V syntax: sPIR-V BuiltIn names (BuiltIn_Position), DescriptorSet and Binding.
order: 4
---

The SPIR-V syntax is inspired by **SPIR-V (Vulkan)**. It has 34 attributes in the `YotsubaShader.SpirvSyntax` package. The syntax you write with does not decide the output: the same shader compiles to any target.

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

public struct VertexOutput
{
    [BuiltIn_Position]
    public Vector4 Position;
}
```

## Built-in values by stage

Every built-in value the syntax declares, grouped by the stage that uses it.

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

// Vertex stage
public struct VertexBuiltIns
{
    // Clip-space position (vertex output)
    [BuiltIn_Position] public Vector4 ClipSpacePosition;

    // Vertex index
    [BuiltIn_VertexIndex] public int VertexIndex;

    // Instance index
    [BuiltIn_InstanceIndex] public int InstanceIndex;

    // Base vertex
    [BuiltIn_BaseVertex] public int BaseVertex;

    // Base instance
    [BuiltIn_BaseInstance] public int BaseInstance;

    // Clip distance
    [BuiltIn_ClipDistance] public float ClipDistance;

    // Render target layer
    [BuiltIn_Layer] public uint RenderTargetLayer;

    // Viewport index
    [BuiltIn_ViewportIndex] public uint ViewportIndex;
}

// Fragment stage
public struct FragmentBuiltIns
{
    // Fragment coordinate
    [BuiltIn_FragCoord] public Vector4 FragmentCoordinate;

    // Front-facing flag
    [BuiltIn_FrontFacing] public bool FrontFacingFlag;

    // Fragment depth (output)
    [BuiltIn_FragDepth] public float FragmentDepth;

    // Stencil reference (output)
    [BuiltIn_FragStencilRef] public uint StencilReference;

    // Sample index
    [BuiltIn_SampleId] public uint SampleIndex;

    // Sample mask
    [BuiltIn_SampleMask] public uint SampleMask;

    // Primitive index
    [BuiltIn_PrimitiveId] public uint PrimitiveIndex;

    // Barycentric coordinates
    [BuiltIn_BaryCoord] public Vector4 BarycentricCoordinates;

    // Barycentric coordinates (no perspective)
    [BuiltIn_BaryCoordNoPersp] public Vector4 BarycentricCoordinates2;

    // Helper invocation
    [BuiltIn_HelperInvocation] public bool HelperInvocation;

    // Sample position
    [BuiltIn_SamplePosition] public Vector2 SamplePosition;
}

// Compute stage
public class ComputeBuiltIns
{
    // Global invocation id
    [BuiltIn_GlobalInvocationId] public UInt3 GlobalInvocationId;

    // Local invocation id
    [BuiltIn_LocalInvocationId] public UInt3 LocalInvocationId;

    // Local invocation index
    [BuiltIn_LocalInvocationIndex] public uint LocalInvocationIndex;

    // Workgroup id
    [BuiltIn_WorkgroupId] public UInt3 WorkgroupId;

    // Number of workgroups
    [BuiltIn_NumWorkgroups] public UInt3 NumberOfWorkgroups;

    // Workgroup size (built-in value)
    [BuiltIn_WorkgroupSize] public UInt3 WorkgroupSize;

    // Subgroup size
    [BuiltIn_SubgroupSize] public uint SubgroupSize;

    // Subgroup invocation id
    [BuiltIn_SubgroupInvocationId] public UInt3 SubgroupInvocationId;

    // Subgroup id
    [BuiltIn_SubgroupId] public uint SubgroupId;

    // Number of subgroups
    [BuiltIn_NumSubgroups] public uint NumberOfSubgroups;
}
```

## Resources and binding slots

Uniform buffers, storage buffers, textures and samplers, each with its slot written in this syntax.

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
    // Uniform buffer, with its binding slot
    [Uniform, DescriptorSet(0), @Binding(0)]
    public Material Material;

    // Read/write storage buffer
    [StorageBuffer, DescriptorSet(0), @Binding(1)]
    public float[] Output;

    // Read-only storage buffer (same attribute)
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

## Equivalents in the other syntaxes

The same concept in SPIR-V and in the other four syntaxes. A dash means that the syntax has no spelling for it.

### Built-in values

| Concept | SPIR-V | HLSL | GLSL | MSL | WGSL |
| --- | --- | --- | --- | --- | --- |
| **Vertex stage** | | | | | |
| Clip-space position (vertex output) | `BuiltIn_Position` | `SV_Position` | `gl_Position` | `position` | `@builtin_position` |
| Vertex index | `BuiltIn_VertexIndex` | `SV_VertexID` | `gl_VertexIndex` | `vertex_id` | `@builtin_vertex_index` |
| Instance index | `BuiltIn_InstanceIndex` | `SV_InstanceID` | `gl_InstanceIndex` | `instance_id` | `@builtin_instance_index` |
| Base vertex | `BuiltIn_BaseVertex` | `SV_StartVertexLocation` | `gl_BaseVertex` | `base_vertex` | — |
| Base instance | `BuiltIn_BaseInstance` | `SV_StartInstanceLocation` | `gl_BaseInstance` | `base_instance` | — |
| Clip distance | `BuiltIn_ClipDistance` | `SV_ClipDistanceN` | `gl_ClipDistance` | `clip_distance` | `@builtin_clip_distances` |
| Render target layer | `BuiltIn_Layer` | `SV_RenderTargetArrayIndex` | `gl_Layer` | `render_target_array_index` | — |
| Viewport index | `BuiltIn_ViewportIndex` | `SV_ViewportArrayIndex` | `gl_ViewportIndex` | `viewport_array_index` | — |
| **Fragment stage** | | | | | |
| Fragment coordinate | `BuiltIn_FragCoord` | `SV_Position` | `gl_FragCoord` | `position` | `@builtin_position` |
| Front-facing flag | `BuiltIn_FrontFacing` | `SV_IsFrontFace` | `gl_FrontFacing` | `front_facing` | `@builtin_front_facing` |
| Fragment depth (output) | `BuiltIn_FragDepth` | `SV_Depth` | `gl_FragDepth` | `depth` | `@builtin_frag_depth` |
| Conservative depth | — | `SV_DepthGreaterEqual / SV_DepthLessEqual` | — | `depth("greater") / depth("less")` | — |
| Stencil reference (output) | `BuiltIn_FragStencilRef` | `SV_StencilRef` | `gl_FragStencilRefARB` | `stencil` | — |
| Sample index | `BuiltIn_SampleId` | `SV_SampleIndex` | `gl_SampleID` | `sample_id` | `@builtin_sample_index` |
| Sample mask | `BuiltIn_SampleMask` | `SV_Coverage` | `gl_SampleMask / gl_SampleMaskIn` | `sample_mask` | `@builtin_sample_mask` |
| Primitive index | `BuiltIn_PrimitiveId` | `SV_PrimitiveID` | `gl_PrimitiveID` | `primitive_id` | `@builtin_primitive_index` |
| Barycentric coordinates | `BuiltIn_BaryCoord` | `SV_Barycentrics` | `gl_BaryCoordEXT` | `barycentric_coord` | — |
| Barycentric coordinates (no perspective) | `BuiltIn_BaryCoordNoPersp` | — | `gl_BaryCoordNoPerspEXT` | — | — |
| Helper invocation | `BuiltIn_HelperInvocation` | — | `gl_HelperInvocation` | — | — |
| Sample position | `BuiltIn_SamplePosition` | — | `gl_SamplePosition` | — | — |
| **Compute stage** | | | | | |
| Global invocation id | `BuiltIn_GlobalInvocationId` | `SV_DispatchThreadID` | `gl_GlobalInvocationID` | `thread_position_in_grid` | `@builtin_global_invocation_id` |
| Local invocation id | `BuiltIn_LocalInvocationId` | `SV_GroupThreadID` | `gl_LocalInvocationID` | `thread_position_in_threadgroup` | `@builtin_local_invocation_id` |
| Local invocation index | `BuiltIn_LocalInvocationIndex` | `SV_GroupIndex` | `gl_LocalInvocationIndex` | `thread_index_in_threadgroup` | `@builtin_local_invocation_index` |
| Workgroup id | `BuiltIn_WorkgroupId` | `SV_GroupID` | `gl_WorkGroupID` | `threadgroup_position_in_grid` | `@builtin_workgroup_id` |
| Number of workgroups | `BuiltIn_NumWorkgroups` | — | `gl_NumWorkGroups` | `threadgroups_per_grid` | `@builtin_num_workgroups` |
| Workgroup size (method attribute) | — | `numthreads` | `layout_local_size` | — | `@workgroup_size` |
| Workgroup size (built-in value) | `BuiltIn_WorkgroupSize` | — | `gl_WorkGroupSize` | `threads_per_threadgroup` | — |
| Subgroup size | `BuiltIn_SubgroupSize` | — | `gl_SubgroupSize` | `threads_per_simdgroup` | `@builtin_subgroup_size` |
| Subgroup invocation id | `BuiltIn_SubgroupInvocationId` | — | `gl_SubgroupInvocationID` | `thread_index_in_simdgroup` | `@builtin_subgroup_invocation_id` |
| Subgroup id | `BuiltIn_SubgroupId` | — | `gl_SubgroupID` | `simdgroup_index_in_threadgroup` | `@builtin_subgroup_id` |
| Number of subgroups | `BuiltIn_NumSubgroups` | — | `gl_NumSubgroups` | `simdgroups_per_threadgroup` | `@builtin_num_subgroups` |

### Resources

| Concept | SPIR-V | HLSL | GLSL | MSL | WGSL |
| --- | --- | --- | --- | --- | --- |
| Uniform buffer | `Uniform` | `cbuffer, ConstantBuffer<T>` | `uniform` | `constant` | `uniform` |
| Read/write storage buffer | `StorageBuffer` | `RWStructuredBuffer<T>` | `buffer` | `device` | `storage(storage_use.read_write)` |
| Read-only storage buffer | `StorageBuffer` | `StructuredBuffer<T>` | `buffer` | `device(readOnly: true)` | `storage(storage_use.read)` |
| Binding slot | `DescriptorSet(s) + Binding(n)` | `register(RegisterPrefix.b, n)` | `layout(set, binding)` | `buffer(n), texture(n), sampler(n)` | `@group(s) + @binding(n)` |
| Texture slot | `DescriptorSet(s) + Binding(n)` | `register(RegisterPrefix.t, n)` | `layout(set, binding)` | `texture(n)` | `@group(s) + @binding(n)` |
| Sampler slot | `DescriptorSet(s) + Binding(n)` | `register(RegisterPrefix.s, n)` | `layout(set, binding)` | `sampler(n)` | `@group(s) + @binding(n)` |

## Attributes

The attributes declared by the package, in groups, applied to real members.

### Input attributes

Apply to fields, parameters and properties that receive values from the pipeline.

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

public struct InputExamples
{
    // Barycentric coordinates
    [BuiltIn_BaryCoord] public Vector4 BarycentricCoordinates;
    // Barycentric coordinates (no perspective)
    [BuiltIn_BaryCoordNoPersp]
    public Vector4 BarycentricCoordinates2;
    // Base instance
    [BuiltIn_BaseInstance] public int BaseInstance;
    // Base vertex
    [BuiltIn_BaseVertex] public int BaseVertex;
    // Fragment coordinate
    [BuiltIn_FragCoord] public Vector4 FragmentCoordinate;
    // Front-facing flag
    [BuiltIn_FrontFacing] public bool FrontFacingFlag;
    // Global invocation id
    [BuiltIn_GlobalInvocationId]
    public UInt3 GlobalInvocationId;
    // Helper invocation
    [BuiltIn_HelperInvocation] public bool HelperInvocation;
    // Instance index
    [BuiltIn_InstanceIndex] public int InstanceIndex;
    // Local invocation id
    [BuiltIn_LocalInvocationId] public UInt3 LocalInvocationId;
    // Local invocation index
    [BuiltIn_LocalInvocationIndex]
    public uint LocalInvocationIndex;
    // Number of subgroups
    [BuiltIn_NumSubgroups] public uint NumberOfSubgroups;
    // Number of workgroups
    [BuiltIn_NumWorkgroups] public UInt3 NumberOfWorkgroups;
    // Primitive index
    [BuiltIn_PrimitiveId] public uint PrimitiveIndex;
    // Sample index
    [BuiltIn_SampleId] public uint SampleIndex;
    // Sample position
    [BuiltIn_SamplePosition] public Vector2 SamplePosition;
    // Subgroup id
    [BuiltIn_SubgroupId] public uint SubgroupId;
    // Subgroup invocation id
    [BuiltIn_SubgroupInvocationId]
    public UInt3 SubgroupInvocationId;
    // Subgroup size
    [BuiltIn_SubgroupSize] public uint SubgroupSize;
    // Vertex index
    [BuiltIn_VertexIndex] public int VertexIndex;
    // Workgroup id
    [BuiltIn_WorkgroupId] public UInt3 WorkgroupId;
    // Workgroup size (built-in value)
    [BuiltIn_WorkgroupSize] public UInt3 WorkgroupSize;
}
```

### Input and output attributes

Apply to values that can be received or produced, depending on the stage.

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

public struct InputOutputExamples
{
    // Clip distance
    [BuiltIn_ClipDistance] public float ClipDistance;
    // Render target layer
    [BuiltIn_Layer] public uint RenderTargetLayer;
    // Clip-space position (vertex output)
    [BuiltIn_Position] public Vector4 ClipSpacePosition;
    // Sample mask
    [BuiltIn_SampleMask] public uint SampleMask;
    // Viewport index
    [BuiltIn_ViewportIndex] public uint ViewportIndex;
    [Location] public Vector4 Value6;
}
```

### Output attributes

Apply to fields, parameters and return values the stage produces.

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

public struct OutputExamples
{
    // Fragment depth (output)
    [BuiltIn_FragDepth] public float FragmentDepth;
    // Stencil reference (output)
    [BuiltIn_FragStencilRef] public uint StencilReference;
}
```

### Resource attributes

Declare uniforms, buffers, textures, samplers and binding slots.

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

### Supporting types

Structs, classes and enums used together with the attributes.

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
> These listings show what the package declares. They do not mean that every concept is lowered by every output target.

The other syntaxes: [HLSL](hlsl.md), [GLSL](glsl.md), [MSL](msl.md), [WGSL](wgsl.md).

---
title: GLSL syntax
summary: Every attribute of the GLSL syntax: gl_* built-ins, layout(set, binding), uniform and buffer.
order: 2
---

The GLSL syntax is inspired by **GLSL (OpenGL / Vulkan GLSL)**. It has 35 attributes in the `YotsubaShader.GlslSyntax` package. The syntax you write with does not decide the output: the same shader compiles to any target.

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

public struct VertexOutput
{
    [gl_Position]
    public Vector4 Position;
}
```

## Built-in values by stage

Every built-in value the syntax declares, grouped by the stage that uses it.

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

// Vertex stage
public struct VertexBuiltIns
{
    // Clip-space position (vertex output)
    [gl_Position] public Vector4 ClipSpacePosition;

    // Vertex index
    [gl_VertexIndex] public int VertexIndex;

    // Instance index
    [gl_InstanceIndex] public int InstanceIndex;

    // Base vertex
    [gl_BaseVertex] public int BaseVertex;

    // Base instance
    [gl_BaseInstance] public int BaseInstance;

    // Clip distance
    [gl_ClipDistance] public float ClipDistance;

    // Render target layer
    [gl_Layer] public uint RenderTargetLayer;

    // Viewport index
    [gl_ViewportIndex] public uint ViewportIndex;
}

// Fragment stage
public struct FragmentBuiltIns
{
    // Fragment coordinate
    [gl_FragCoord] public Vector4 FragmentCoordinate;

    // Front-facing flag
    [gl_FrontFacing] public bool FrontFacingFlag;

    // Fragment depth (output)
    [gl_FragDepth] public float FragmentDepth;

    // Stencil reference (output)
    [gl_FragStencilRefARB] public uint StencilReference;

    // Sample index
    [gl_SampleID] public uint SampleIndex;

    // Sample mask
    [gl_SampleMask] public uint SampleMask;

    // Sample mask
    [gl_SampleMaskIn] public uint SampleMask2;

    // Primitive index
    [gl_PrimitiveID] public uint PrimitiveIndex;

    // Barycentric coordinates
    [gl_BaryCoordEXT] public Vector4 BarycentricCoordinates;

    // Barycentric coordinates (no perspective)
    [gl_BaryCoordNoPerspEXT] public Vector4 BarycentricCoordinates2;

    // Helper invocation
    [gl_HelperInvocation] public bool HelperInvocation;

    // Sample position
    [gl_SamplePosition] public Vector2 SamplePosition;
}

// Compute stage
public class ComputeBuiltIns
{
    // Global invocation id
    [gl_GlobalInvocationID] public UInt3 GlobalInvocationId;

    // Local invocation id
    [gl_LocalInvocationID] public UInt3 LocalInvocationId;

    // Local invocation index
    [gl_LocalInvocationIndex] public uint LocalInvocationIndex;

    // Workgroup id
    [gl_WorkGroupID] public UInt3 WorkgroupId;

    // Number of workgroups
    [gl_NumWorkGroups] public UInt3 NumberOfWorkgroups;

    // Workgroup size (built-in value)
    [gl_WorkGroupSize] public UInt3 WorkgroupSize;

    // Subgroup size
    [gl_SubgroupSize] public uint SubgroupSize;

    // Subgroup invocation id
    [gl_SubgroupInvocationID] public UInt3 SubgroupInvocationId;

    // Subgroup id
    [gl_SubgroupID] public uint SubgroupId;

    // Number of subgroups
    [gl_NumSubgroups] public uint NumberOfSubgroups;

    // Workgroup size (method attribute)
    [ShaderStage(Stage.Compute)]
    [layout_local_size(8, 8, 1)]
    public void Compute() { }
}
```

## Resources and binding slots

Uniform buffers, storage buffers, textures and samplers, each with its slot written in this syntax.

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
    // Uniform buffer, with its binding slot
    [uniform, layout(0, 0)]
    public Material Material;

    // Read/write storage buffer
    [buffer, layout(0, 1)]
    public float[] Output;

    // Read-only storage buffer (same attribute)
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

## Equivalents in the other syntaxes

The same concept in GLSL and in the other four syntaxes. A dash means that the syntax has no spelling for it.

### Built-in values

| Concept | GLSL | HLSL | MSL | SPIR-V | WGSL |
| --- | --- | --- | --- | --- | --- |
| **Vertex stage** | | | | | |
| Clip-space position (vertex output) | `gl_Position` | `SV_Position` | `position` | `BuiltIn_Position` | `@builtin_position` |
| Vertex index | `gl_VertexIndex` | `SV_VertexID` | `vertex_id` | `BuiltIn_VertexIndex` | `@builtin_vertex_index` |
| Instance index | `gl_InstanceIndex` | `SV_InstanceID` | `instance_id` | `BuiltIn_InstanceIndex` | `@builtin_instance_index` |
| Base vertex | `gl_BaseVertex` | `SV_StartVertexLocation` | `base_vertex` | `BuiltIn_BaseVertex` | — |
| Base instance | `gl_BaseInstance` | `SV_StartInstanceLocation` | `base_instance` | `BuiltIn_BaseInstance` | — |
| Clip distance | `gl_ClipDistance` | `SV_ClipDistanceN` | `clip_distance` | `BuiltIn_ClipDistance` | `@builtin_clip_distances` |
| Render target layer | `gl_Layer` | `SV_RenderTargetArrayIndex` | `render_target_array_index` | `BuiltIn_Layer` | — |
| Viewport index | `gl_ViewportIndex` | `SV_ViewportArrayIndex` | `viewport_array_index` | `BuiltIn_ViewportIndex` | — |
| **Fragment stage** | | | | | |
| Fragment coordinate | `gl_FragCoord` | `SV_Position` | `position` | `BuiltIn_FragCoord` | `@builtin_position` |
| Front-facing flag | `gl_FrontFacing` | `SV_IsFrontFace` | `front_facing` | `BuiltIn_FrontFacing` | `@builtin_front_facing` |
| Fragment depth (output) | `gl_FragDepth` | `SV_Depth` | `depth` | `BuiltIn_FragDepth` | `@builtin_frag_depth` |
| Conservative depth | — | `SV_DepthGreaterEqual / SV_DepthLessEqual` | `depth("greater") / depth("less")` | — | — |
| Stencil reference (output) | `gl_FragStencilRefARB` | `SV_StencilRef` | `stencil` | `BuiltIn_FragStencilRef` | — |
| Sample index | `gl_SampleID` | `SV_SampleIndex` | `sample_id` | `BuiltIn_SampleId` | `@builtin_sample_index` |
| Sample mask | `gl_SampleMask / gl_SampleMaskIn` | `SV_Coverage` | `sample_mask` | `BuiltIn_SampleMask` | `@builtin_sample_mask` |
| Primitive index | `gl_PrimitiveID` | `SV_PrimitiveID` | `primitive_id` | `BuiltIn_PrimitiveId` | `@builtin_primitive_index` |
| Barycentric coordinates | `gl_BaryCoordEXT` | `SV_Barycentrics` | `barycentric_coord` | `BuiltIn_BaryCoord` | — |
| Barycentric coordinates (no perspective) | `gl_BaryCoordNoPerspEXT` | — | — | `BuiltIn_BaryCoordNoPersp` | — |
| Helper invocation | `gl_HelperInvocation` | — | — | `BuiltIn_HelperInvocation` | — |
| Sample position | `gl_SamplePosition` | — | — | `BuiltIn_SamplePosition` | — |
| **Compute stage** | | | | | |
| Global invocation id | `gl_GlobalInvocationID` | `SV_DispatchThreadID` | `thread_position_in_grid` | `BuiltIn_GlobalInvocationId` | `@builtin_global_invocation_id` |
| Local invocation id | `gl_LocalInvocationID` | `SV_GroupThreadID` | `thread_position_in_threadgroup` | `BuiltIn_LocalInvocationId` | `@builtin_local_invocation_id` |
| Local invocation index | `gl_LocalInvocationIndex` | `SV_GroupIndex` | `thread_index_in_threadgroup` | `BuiltIn_LocalInvocationIndex` | `@builtin_local_invocation_index` |
| Workgroup id | `gl_WorkGroupID` | `SV_GroupID` | `threadgroup_position_in_grid` | `BuiltIn_WorkgroupId` | `@builtin_workgroup_id` |
| Number of workgroups | `gl_NumWorkGroups` | — | `threadgroups_per_grid` | `BuiltIn_NumWorkgroups` | `@builtin_num_workgroups` |
| Workgroup size (method attribute) | `layout_local_size` | `numthreads` | — | — | `@workgroup_size` |
| Workgroup size (built-in value) | `gl_WorkGroupSize` | — | `threads_per_threadgroup` | `BuiltIn_WorkgroupSize` | — |
| Subgroup size | `gl_SubgroupSize` | — | `threads_per_simdgroup` | `BuiltIn_SubgroupSize` | `@builtin_subgroup_size` |
| Subgroup invocation id | `gl_SubgroupInvocationID` | — | `thread_index_in_simdgroup` | `BuiltIn_SubgroupInvocationId` | `@builtin_subgroup_invocation_id` |
| Subgroup id | `gl_SubgroupID` | — | `simdgroup_index_in_threadgroup` | `BuiltIn_SubgroupId` | `@builtin_subgroup_id` |
| Number of subgroups | `gl_NumSubgroups` | — | `simdgroups_per_threadgroup` | `BuiltIn_NumSubgroups` | `@builtin_num_subgroups` |

### Resources

| Concept | GLSL | HLSL | MSL | SPIR-V | WGSL |
| --- | --- | --- | --- | --- | --- |
| Uniform buffer | `uniform` | `cbuffer, ConstantBuffer<T>` | `constant` | `Uniform` | `uniform` |
| Read/write storage buffer | `buffer` | `RWStructuredBuffer<T>` | `device` | `StorageBuffer` | `storage(storage_use.read_write)` |
| Read-only storage buffer | `buffer` | `StructuredBuffer<T>` | `device(readOnly: true)` | `StorageBuffer` | `storage(storage_use.read)` |
| Binding slot | `layout(set, binding)` | `register(RegisterPrefix.b, n)` | `buffer(n), texture(n), sampler(n)` | `DescriptorSet(s) + Binding(n)` | `@group(s) + @binding(n)` |
| Texture slot | `layout(set, binding)` | `register(RegisterPrefix.t, n)` | `texture(n)` | `DescriptorSet(s) + Binding(n)` | `@group(s) + @binding(n)` |
| Sampler slot | `layout(set, binding)` | `register(RegisterPrefix.s, n)` | `sampler(n)` | `DescriptorSet(s) + Binding(n)` | `@group(s) + @binding(n)` |

## Attributes

The attributes declared by the package, in groups, applied to real members.

### Input attributes

Apply to fields, parameters and properties that receive values from the pipeline.

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

public struct InputExamples
{
    // Barycentric coordinates
    [gl_BaryCoordEXT] public Vector4 BarycentricCoordinates;
    // Barycentric coordinates (no perspective)
    [gl_BaryCoordNoPerspEXT]
    public Vector4 BarycentricCoordinates2;
    // Base instance
    [gl_BaseInstance] public int BaseInstance;
    // Base vertex
    [gl_BaseVertex] public int BaseVertex;
    // Fragment coordinate
    [gl_FragCoord] public Vector4 FragmentCoordinate;
    // Front-facing flag
    [gl_FrontFacing] public bool FrontFacingFlag;
    // Global invocation id
    [gl_GlobalInvocationID] public UInt3 GlobalInvocationId;
    // Helper invocation
    [gl_HelperInvocation] public bool HelperInvocation;
    // Instance index
    [gl_InstanceIndex] public int InstanceIndex;
    // Local invocation id
    [gl_LocalInvocationID] public UInt3 LocalInvocationId;
    // Local invocation index
    [gl_LocalInvocationIndex] public uint LocalInvocationIndex;
    // Number of subgroups
    [gl_NumSubgroups] public uint NumberOfSubgroups;
    // Number of workgroups
    [gl_NumWorkGroups] public UInt3 NumberOfWorkgroups;
    // Primitive index
    [gl_PrimitiveID] public uint PrimitiveIndex;
    // Sample index
    [gl_SampleID] public uint SampleIndex;
    // Sample mask
    [gl_SampleMaskIn] public uint SampleMask;
    // Sample position
    [gl_SamplePosition] public Vector2 SamplePosition;
    // Subgroup id
    [gl_SubgroupID] public uint SubgroupId;
    // Subgroup invocation id
    [gl_SubgroupInvocationID] public UInt3 SubgroupInvocationId;
    // Subgroup size
    [gl_SubgroupSize] public uint SubgroupSize;
    // Vertex index
    [gl_VertexIndex] public int VertexIndex;
    // Workgroup id
    [gl_WorkGroupID] public UInt3 WorkgroupId;
    // Workgroup size (built-in value)
    [gl_WorkGroupSize] public UInt3 WorkgroupSize;
}
```

### Input and output attributes

Apply to values that can be received or produced, depending on the stage.

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

public struct InputOutputExamples
{
    // Render target layer
    [gl_Layer] public uint RenderTargetLayer;
    // Clip-space position (vertex output)
    [gl_Position] public Vector4 ClipSpacePosition;
    // Viewport index
    [gl_ViewportIndex] public uint ViewportIndex;
    [location(0)] public Vector4 Value4;
}
```

### Output attributes

Apply to fields, parameters and return values the stage produces.

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

public struct OutputExamples
{
    // Clip distance
    [gl_ClipDistance] public float ClipDistance;
    // Fragment depth (output)
    [gl_FragDepth] public float FragmentDepth;
    // Stencil reference (output)
    [gl_FragStencilRefARB] public uint StencilReference;
    // Sample mask
    [gl_SampleMask] public uint SampleMask;
}
```

### Method attributes

Apply to methods, for example to set a compute workgroup size.

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

### Resource attributes

Declare uniforms, buffers, textures, samplers and binding slots.

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

### Supporting types

Structs, classes and enums used together with the attributes.

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
> These listings show what the package declares. They do not mean that every concept is lowered by every output target.

The other syntaxes: [HLSL](hlsl.md), [MSL](msl.md), [SPIR-V](spirv.md), [WGSL](wgsl.md).

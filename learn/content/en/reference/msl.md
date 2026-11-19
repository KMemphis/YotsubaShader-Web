---
title: MSL syntax
summary: Every attribute of the MSL syntax: attribute names from MSL such as position, vertex_id and thread_position_in_grid, plus buffer(n), texture(n) and sampler(n).
order: 3
---

The MSL syntax is inspired by **the Metal Shading Language**. It has 32 attributes in the `YotsubaShader.MslSyntax` package. The syntax you write with does not decide the output: the same shader compiles to any target.

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;

public struct VertexOutput
{
    [position]
    public Vector4 Position;
}
```

## Built-in values by stage

Every built-in value the syntax declares, grouped by the stage that uses it.

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;

// Vertex stage
public struct VertexBuiltIns
{
    // Clip-space position (vertex output)
    [position] public Vector4 ClipSpacePosition;

    // Vertex index
    [vertex_id] public uint VertexIndex;

    // Instance index
    [instance_id] public uint InstanceIndex;

    // Base vertex
    [base_vertex] public uint BaseVertex;

    // Base instance
    [base_instance] public uint BaseInstance;

    // Clip distance
    [clip_distance] public float ClipDistance;

    // Render target layer
    [render_target_array_index] public uint RenderTargetLayer;

    // Viewport index
    [viewport_array_index] public uint ViewportIndex;
}

// Fragment stage
public struct FragmentBuiltIns
{
    // Fragment coordinate
    [position] public Vector4 FragmentCoordinate;

    // Front-facing flag
    [front_facing] public bool FrontFacingFlag;

    // Fragment depth (output)
    [depth] public float FragmentDepth;

    // Conservative depth
    [depth("greater")] public float ConservativeDepth;

    // Conservative depth
    [depth("less")] public float ConservativeDepth2;

    // Stencil reference (output)
    [stencil] public uint StencilReference;

    // Sample index
    [sample_id] public uint SampleIndex;

    // Sample mask
    [sample_mask] public uint SampleMask;

    // Primitive index
    [primitive_id] public uint PrimitiveIndex;

    // Barycentric coordinates
    [barycentric_coord] public Vector4 BarycentricCoordinates;
}

// Compute stage
public class ComputeBuiltIns
{
    // Global invocation id
    [thread_position_in_grid] public UInt3 GlobalInvocationId;

    // Local invocation id
    [thread_position_in_threadgroup] public UInt3 LocalInvocationId;

    // Local invocation index
    [thread_index_in_threadgroup] public uint LocalInvocationIndex;

    // Workgroup id
    [threadgroup_position_in_grid] public UInt3 WorkgroupId;

    // Number of workgroups
    [threadgroups_per_grid] public UInt3 NumberOfWorkgroups;

    // Workgroup size (built-in value)
    [threads_per_threadgroup] public UInt3 WorkgroupSize;

    // Subgroup size
    [threads_per_simdgroup] public uint SubgroupSize;

    // Subgroup invocation id
    [thread_index_in_simdgroup] public UInt3 SubgroupInvocationId;

    // Subgroup id
    [simdgroup_index_in_threadgroup] public uint SubgroupId;

    // Number of subgroups
    [simdgroups_per_threadgroup] public uint NumberOfSubgroups;
}
```

## Resources and binding slots

Uniform buffers, storage buffers, textures and samplers, each with its slot written in this syntax.

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
    // Uniform buffer, with its binding slot
    [constant, buffer(0)]
    public Material Material;

    // Read/write storage buffer
    [device, buffer(1)]
    public float[] Output;

    // Read-only storage buffer
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

## Equivalents in the other syntaxes

The same concept in MSL and in the other four syntaxes. A dash means that the syntax has no spelling for it.

### Built-in values

| Concept | MSL | HLSL | GLSL | SPIR-V | WGSL |
| --- | --- | --- | --- | --- | --- |
| **Vertex stage** | | | | | |
| Clip-space position (vertex output) | `position` | `SV_Position` | `gl_Position` | `BuiltIn_Position` | `@builtin_position` |
| Vertex index | `vertex_id` | `SV_VertexID` | `gl_VertexIndex` | `BuiltIn_VertexIndex` | `@builtin_vertex_index` |
| Instance index | `instance_id` | `SV_InstanceID` | `gl_InstanceIndex` | `BuiltIn_InstanceIndex` | `@builtin_instance_index` |
| Base vertex | `base_vertex` | `SV_StartVertexLocation` | `gl_BaseVertex` | `BuiltIn_BaseVertex` | — |
| Base instance | `base_instance` | `SV_StartInstanceLocation` | `gl_BaseInstance` | `BuiltIn_BaseInstance` | — |
| Clip distance | `clip_distance` | `SV_ClipDistanceN` | `gl_ClipDistance` | `BuiltIn_ClipDistance` | `@builtin_clip_distances` |
| Render target layer | `render_target_array_index` | `SV_RenderTargetArrayIndex` | `gl_Layer` | `BuiltIn_Layer` | — |
| Viewport index | `viewport_array_index` | `SV_ViewportArrayIndex` | `gl_ViewportIndex` | `BuiltIn_ViewportIndex` | — |
| **Fragment stage** | | | | | |
| Fragment coordinate | `position` | `SV_Position` | `gl_FragCoord` | `BuiltIn_FragCoord` | `@builtin_position` |
| Front-facing flag | `front_facing` | `SV_IsFrontFace` | `gl_FrontFacing` | `BuiltIn_FrontFacing` | `@builtin_front_facing` |
| Fragment depth (output) | `depth` | `SV_Depth` | `gl_FragDepth` | `BuiltIn_FragDepth` | `@builtin_frag_depth` |
| Conservative depth | `depth("greater") / depth("less")` | `SV_DepthGreaterEqual / SV_DepthLessEqual` | — | — | — |
| Stencil reference (output) | `stencil` | `SV_StencilRef` | `gl_FragStencilRefARB` | `BuiltIn_FragStencilRef` | — |
| Sample index | `sample_id` | `SV_SampleIndex` | `gl_SampleID` | `BuiltIn_SampleId` | `@builtin_sample_index` |
| Sample mask | `sample_mask` | `SV_Coverage` | `gl_SampleMask / gl_SampleMaskIn` | `BuiltIn_SampleMask` | `@builtin_sample_mask` |
| Primitive index | `primitive_id` | `SV_PrimitiveID` | `gl_PrimitiveID` | `BuiltIn_PrimitiveId` | `@builtin_primitive_index` |
| Barycentric coordinates | `barycentric_coord` | `SV_Barycentrics` | `gl_BaryCoordEXT` | `BuiltIn_BaryCoord` | — |
| Barycentric coordinates (no perspective) | — | — | `gl_BaryCoordNoPerspEXT` | `BuiltIn_BaryCoordNoPersp` | — |
| Helper invocation | — | — | `gl_HelperInvocation` | `BuiltIn_HelperInvocation` | — |
| Sample position | — | — | `gl_SamplePosition` | `BuiltIn_SamplePosition` | — |
| **Compute stage** | | | | | |
| Global invocation id | `thread_position_in_grid` | `SV_DispatchThreadID` | `gl_GlobalInvocationID` | `BuiltIn_GlobalInvocationId` | `@builtin_global_invocation_id` |
| Local invocation id | `thread_position_in_threadgroup` | `SV_GroupThreadID` | `gl_LocalInvocationID` | `BuiltIn_LocalInvocationId` | `@builtin_local_invocation_id` |
| Local invocation index | `thread_index_in_threadgroup` | `SV_GroupIndex` | `gl_LocalInvocationIndex` | `BuiltIn_LocalInvocationIndex` | `@builtin_local_invocation_index` |
| Workgroup id | `threadgroup_position_in_grid` | `SV_GroupID` | `gl_WorkGroupID` | `BuiltIn_WorkgroupId` | `@builtin_workgroup_id` |
| Number of workgroups | `threadgroups_per_grid` | — | `gl_NumWorkGroups` | `BuiltIn_NumWorkgroups` | `@builtin_num_workgroups` |
| Workgroup size (method attribute) | — | `numthreads` | `layout_local_size` | — | `@workgroup_size` |
| Workgroup size (built-in value) | `threads_per_threadgroup` | — | `gl_WorkGroupSize` | `BuiltIn_WorkgroupSize` | — |
| Subgroup size | `threads_per_simdgroup` | — | `gl_SubgroupSize` | `BuiltIn_SubgroupSize` | `@builtin_subgroup_size` |
| Subgroup invocation id | `thread_index_in_simdgroup` | — | `gl_SubgroupInvocationID` | `BuiltIn_SubgroupInvocationId` | `@builtin_subgroup_invocation_id` |
| Subgroup id | `simdgroup_index_in_threadgroup` | — | `gl_SubgroupID` | `BuiltIn_SubgroupId` | `@builtin_subgroup_id` |
| Number of subgroups | `simdgroups_per_threadgroup` | — | `gl_NumSubgroups` | `BuiltIn_NumSubgroups` | `@builtin_num_subgroups` |

### Resources

| Concept | MSL | HLSL | GLSL | SPIR-V | WGSL |
| --- | --- | --- | --- | --- | --- |
| Uniform buffer | `constant` | `cbuffer, ConstantBuffer<T>` | `uniform` | `Uniform` | `uniform` |
| Read/write storage buffer | `device` | `RWStructuredBuffer<T>` | `buffer` | `StorageBuffer` | `storage(storage_use.read_write)` |
| Read-only storage buffer | `device(readOnly: true)` | `StructuredBuffer<T>` | `buffer` | `StorageBuffer` | `storage(storage_use.read)` |
| Binding slot | `buffer(n), texture(n), sampler(n)` | `register(RegisterPrefix.b, n)` | `layout(set, binding)` | `DescriptorSet(s) + Binding(n)` | `@group(s) + @binding(n)` |
| Texture slot | `texture(n)` | `register(RegisterPrefix.t, n)` | `layout(set, binding)` | `DescriptorSet(s) + Binding(n)` | `@group(s) + @binding(n)` |
| Sampler slot | `sampler(n)` | `register(RegisterPrefix.s, n)` | `layout(set, binding)` | `DescriptorSet(s) + Binding(n)` | `@group(s) + @binding(n)` |

## Attributes

The attributes declared by the package, in groups, applied to real members.

### Input attributes

Apply to fields, parameters and properties that receive values from the pipeline.

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;

public struct InputExamples
{
    [attribute(0)] public Vector4 Value1;
    // Barycentric coordinates
    [barycentric_coord] public Vector4 BarycentricCoordinates;
    // Base instance
    [base_instance] public uint BaseInstance;
    // Base vertex
    [base_vertex] public uint BaseVertex;
    // Front-facing flag
    [front_facing] public bool FrontFacingFlag;
    // Instance index
    [instance_id] public uint InstanceIndex;
    // Primitive index
    [primitive_id] public uint PrimitiveIndex;
    // Sample index
    [sample_id] public uint SampleIndex;
    // Subgroup id
    [simdgroup_index_in_threadgroup] public uint SubgroupId;
    // Number of subgroups
    [simdgroups_per_threadgroup] public uint NumberOfSubgroups;
    // Subgroup invocation id
    [thread_index_in_simdgroup]
    public UInt3 SubgroupInvocationId;
    // Local invocation index
    [thread_index_in_threadgroup]
    public uint LocalInvocationIndex;
    // Global invocation id
    [thread_position_in_grid] public UInt3 GlobalInvocationId;
    // Local invocation id
    [thread_position_in_threadgroup]
    public UInt3 LocalInvocationId;
    // Workgroup id
    [threadgroup_position_in_grid] public UInt3 WorkgroupId;
    // Number of workgroups
    [threadgroups_per_grid] public UInt3 NumberOfWorkgroups;
    // Subgroup size
    [threads_per_simdgroup] public uint SubgroupSize;
    // Workgroup size (built-in value)
    [threads_per_threadgroup] public UInt3 WorkgroupSize;
    // Vertex index
    [vertex_id] public uint VertexIndex;
}
```

### Input and output attributes

Apply to values that can be received or produced, depending on the stage.

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;

public struct InputOutputExamples
{
    // Clip-space position (vertex output)
    [position] public Vector4 ClipSpacePosition;
    // Render target layer
    [render_target_array_index] public uint RenderTargetLayer;
    // Sample mask
    [sample_mask] public uint SampleMask;
    // Viewport index
    [viewport_array_index] public uint ViewportIndex;
}
```

### Output attributes

Apply to fields, parameters and return values the stage produces.

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;

public struct OutputExamples
{
    // Clip distance
    [clip_distance] public float ClipDistance;
    [color] public Vector4 Value2;
    // Fragment depth (output)
    [depth] public float FragmentDepth;
    // Stencil reference (output)
    [stencil] public uint StencilReference;
}
```

### Resource attributes

Declare uniforms, buffers, textures, samplers and binding slots.

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

### Supporting types

Structs, classes and enums used together with the attributes.

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
> These listings show what the package declares. They do not mean that every concept is lowered by every output target.

The other syntaxes: [HLSL](hlsl.md), [GLSL](glsl.md), [SPIR-V](spirv.md), [WGSL](wgsl.md).

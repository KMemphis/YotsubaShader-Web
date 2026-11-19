---
title: HLSL syntax
summary: Every attribute of the HLSL syntax: system-value semantics such as SV_Position and numthreads, plus cbuffer and register for resources.
order: 1
---

The HLSL syntax is inspired by **HLSL (Direct3D)**. It has 31 attributes in the `YotsubaShader.HlslSyntax` package. The syntax you write with does not decide the output: the same shader compiles to any target.

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

public struct VertexOutput
{
    [SV_Position]
    public Vector4 Position;
}
```

## Built-in values by stage

Every built-in value the syntax declares, grouped by the stage that uses it.

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

// Vertex stage
public struct VertexBuiltIns
{
    // Clip-space position (vertex output)
    [SV_Position] public Vector4 ClipSpacePosition;

    // Vertex index
    [SV_VertexID] public uint VertexIndex;

    // Instance index
    [SV_InstanceID] public uint InstanceIndex;

    // Base vertex
    [SV_StartVertexLocation] public uint BaseVertex;

    // Base instance
    [SV_StartInstanceLocation] public uint BaseInstance;

    // Clip distance
    [SV_ClipDistanceN] public float ClipDistance;

    // Render target layer
    [SV_RenderTargetArrayIndex] public uint RenderTargetLayer;

    // Viewport index
    [SV_ViewportArrayIndex] public uint ViewportIndex;
}

// Fragment stage
public struct FragmentBuiltIns
{
    // Fragment coordinate
    [SV_Position] public Vector4 FragmentCoordinate;

    // Front-facing flag
    [SV_IsFrontFace] public bool FrontFacingFlag;

    // Fragment depth (output)
    [SV_Depth] public float FragmentDepth;

    // Conservative depth
    [SV_DepthGreaterEqual] public float ConservativeDepth;

    // Conservative depth
    [SV_DepthLessEqual] public float ConservativeDepth2;

    // Stencil reference (output)
    [SV_StencilRef] public uint StencilReference;

    // Sample index
    [SV_SampleIndex] public uint SampleIndex;

    // Sample mask
    [SV_Coverage] public uint SampleMask;

    // Primitive index
    [SV_PrimitiveID] public uint PrimitiveIndex;

    // Barycentric coordinates
    [SV_Barycentrics] public Vector4 BarycentricCoordinates;
}

// Compute stage
public class ComputeBuiltIns
{
    // Global invocation id
    [SV_DispatchThreadID] public UInt3 GlobalInvocationId;

    // Local invocation id
    [SV_GroupThreadID] public UInt3 LocalInvocationId;

    // Local invocation index
    [SV_GroupIndex] public uint LocalInvocationIndex;

    // Workgroup id
    [SV_GroupID] public UInt3 WorkgroupId;

    // Workgroup size (method attribute)
    [ShaderStage(Stage.Compute)]
    [numthreads(8, 8, 1)]
    public void Compute() { }
}
```

## Resources and binding slots

Uniform buffers, storage buffers, textures and samplers, each with its slot written in this syntax.

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
    // Uniform buffer, with its binding slot
    [cbuffer, register(RegisterPrefix.b, 0)]
    public Material Material;

    // Read/write storage buffer
    [register(RegisterPrefix.u, 0)]
    public RWStructuredBuffer<float> Output;

    // Read-only storage buffer
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

    // The same register, written as a string: letter + number
    [register("s0")]
    public SamplerState Sampler;
}
```

## Equivalents in the other syntaxes

The same concept in HLSL and in the other four syntaxes. A dash means that the syntax has no spelling for it.

### Built-in values

| Concept | HLSL | GLSL | MSL | SPIR-V | WGSL |
| --- | --- | --- | --- | --- | --- |
| **Vertex stage** | | | | | |
| Clip-space position (vertex output) | `SV_Position` | `gl_Position` | `position` | `BuiltIn_Position` | `@builtin_position` |
| Vertex index | `SV_VertexID` | `gl_VertexIndex` | `vertex_id` | `BuiltIn_VertexIndex` | `@builtin_vertex_index` |
| Instance index | `SV_InstanceID` | `gl_InstanceIndex` | `instance_id` | `BuiltIn_InstanceIndex` | `@builtin_instance_index` |
| Base vertex | `SV_StartVertexLocation` | `gl_BaseVertex` | `base_vertex` | `BuiltIn_BaseVertex` | — |
| Base instance | `SV_StartInstanceLocation` | `gl_BaseInstance` | `base_instance` | `BuiltIn_BaseInstance` | — |
| Clip distance | `SV_ClipDistanceN` | `gl_ClipDistance` | `clip_distance` | `BuiltIn_ClipDistance` | `@builtin_clip_distances` |
| Render target layer | `SV_RenderTargetArrayIndex` | `gl_Layer` | `render_target_array_index` | `BuiltIn_Layer` | — |
| Viewport index | `SV_ViewportArrayIndex` | `gl_ViewportIndex` | `viewport_array_index` | `BuiltIn_ViewportIndex` | — |
| **Fragment stage** | | | | | |
| Fragment coordinate | `SV_Position` | `gl_FragCoord` | `position` | `BuiltIn_FragCoord` | `@builtin_position` |
| Front-facing flag | `SV_IsFrontFace` | `gl_FrontFacing` | `front_facing` | `BuiltIn_FrontFacing` | `@builtin_front_facing` |
| Fragment depth (output) | `SV_Depth` | `gl_FragDepth` | `depth` | `BuiltIn_FragDepth` | `@builtin_frag_depth` |
| Conservative depth | `SV_DepthGreaterEqual / SV_DepthLessEqual` | — | `depth("greater") / depth("less")` | — | — |
| Stencil reference (output) | `SV_StencilRef` | `gl_FragStencilRefARB` | `stencil` | `BuiltIn_FragStencilRef` | — |
| Sample index | `SV_SampleIndex` | `gl_SampleID` | `sample_id` | `BuiltIn_SampleId` | `@builtin_sample_index` |
| Sample mask | `SV_Coverage` | `gl_SampleMask / gl_SampleMaskIn` | `sample_mask` | `BuiltIn_SampleMask` | `@builtin_sample_mask` |
| Primitive index | `SV_PrimitiveID` | `gl_PrimitiveID` | `primitive_id` | `BuiltIn_PrimitiveId` | `@builtin_primitive_index` |
| Barycentric coordinates | `SV_Barycentrics` | `gl_BaryCoordEXT` | `barycentric_coord` | `BuiltIn_BaryCoord` | — |
| Barycentric coordinates (no perspective) | — | `gl_BaryCoordNoPerspEXT` | — | `BuiltIn_BaryCoordNoPersp` | — |
| Helper invocation | — | `gl_HelperInvocation` | — | `BuiltIn_HelperInvocation` | — |
| Sample position | — | `gl_SamplePosition` | — | `BuiltIn_SamplePosition` | — |
| **Compute stage** | | | | | |
| Global invocation id | `SV_DispatchThreadID` | `gl_GlobalInvocationID` | `thread_position_in_grid` | `BuiltIn_GlobalInvocationId` | `@builtin_global_invocation_id` |
| Local invocation id | `SV_GroupThreadID` | `gl_LocalInvocationID` | `thread_position_in_threadgroup` | `BuiltIn_LocalInvocationId` | `@builtin_local_invocation_id` |
| Local invocation index | `SV_GroupIndex` | `gl_LocalInvocationIndex` | `thread_index_in_threadgroup` | `BuiltIn_LocalInvocationIndex` | `@builtin_local_invocation_index` |
| Workgroup id | `SV_GroupID` | `gl_WorkGroupID` | `threadgroup_position_in_grid` | `BuiltIn_WorkgroupId` | `@builtin_workgroup_id` |
| Number of workgroups | — | `gl_NumWorkGroups` | `threadgroups_per_grid` | `BuiltIn_NumWorkgroups` | `@builtin_num_workgroups` |
| Workgroup size (method attribute) | `numthreads` | `layout_local_size` | — | — | `@workgroup_size` |
| Workgroup size (built-in value) | — | `gl_WorkGroupSize` | `threads_per_threadgroup` | `BuiltIn_WorkgroupSize` | — |
| Subgroup size | — | `gl_SubgroupSize` | `threads_per_simdgroup` | `BuiltIn_SubgroupSize` | `@builtin_subgroup_size` |
| Subgroup invocation id | — | `gl_SubgroupInvocationID` | `thread_index_in_simdgroup` | `BuiltIn_SubgroupInvocationId` | `@builtin_subgroup_invocation_id` |
| Subgroup id | — | `gl_SubgroupID` | `simdgroup_index_in_threadgroup` | `BuiltIn_SubgroupId` | `@builtin_subgroup_id` |
| Number of subgroups | — | `gl_NumSubgroups` | `simdgroups_per_threadgroup` | `BuiltIn_NumSubgroups` | `@builtin_num_subgroups` |

### Resources

| Concept | HLSL | GLSL | MSL | SPIR-V | WGSL |
| --- | --- | --- | --- | --- | --- |
| Uniform buffer | `cbuffer, ConstantBuffer<T>` | `uniform` | `constant` | `Uniform` | `uniform` |
| Read/write storage buffer | `RWStructuredBuffer<T>` | `buffer` | `device` | `StorageBuffer` | `storage(storage_use.read_write)` |
| Read-only storage buffer | `StructuredBuffer<T>` | `buffer` | `device(readOnly: true)` | `StorageBuffer` | `storage(storage_use.read)` |
| Binding slot | `register(RegisterPrefix.b, n)` | `layout(set, binding)` | `buffer(n), texture(n), sampler(n)` | `DescriptorSet(s) + Binding(n)` | `@group(s) + @binding(n)` |
| Texture slot | `register(RegisterPrefix.t, n)` | `layout(set, binding)` | `texture(n)` | `DescriptorSet(s) + Binding(n)` | `@group(s) + @binding(n)` |
| Sampler slot | `register(RegisterPrefix.s, n)` | `layout(set, binding)` | `sampler(n)` | `DescriptorSet(s) + Binding(n)` | `@group(s) + @binding(n)` |

## Attributes

The attributes declared by the package, in groups, applied to real members.

### Input attributes

Apply to fields, parameters and properties that receive values from the pipeline.

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

public struct InputExamples
{
    // Barycentric coordinates
    [SV_Barycentrics] public Vector4 BarycentricCoordinates;
    // Global invocation id
    [SV_DispatchThreadID] public UInt3 GlobalInvocationId;
    // Workgroup id
    [SV_GroupID] public UInt3 WorkgroupId;
    // Local invocation index
    [SV_GroupIndex] public uint LocalInvocationIndex;
    // Local invocation id
    [SV_GroupThreadID] public UInt3 LocalInvocationId;
    // Instance index
    [SV_InstanceID] public uint InstanceIndex;
    // Front-facing flag
    [SV_IsFrontFace] public bool FrontFacingFlag;
    // Primitive index
    [SV_PrimitiveID] public uint PrimitiveIndex;
    // Sample index
    [SV_SampleIndex] public uint SampleIndex;
    // Base instance
    [SV_StartInstanceLocation] public uint BaseInstance;
    // Base vertex
    [SV_StartVertexLocation] public uint BaseVertex;
    // Vertex index
    [SV_VertexID] public uint VertexIndex;
}
```

### Input and output attributes

Apply to values that can be received or produced, depending on the stage.

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
    // Sample mask
    [SV_Coverage] public uint SampleMask;
    // Clip-space position (vertex output)
    [SV_Position] public Vector4 ClipSpacePosition;
    // Render target layer
    [SV_RenderTargetArrayIndex] public uint RenderTargetLayer;
    // Viewport index
    [SV_ViewportArrayIndex] public uint ViewportIndex;
    [TANGENT] public Vector4 Value10;
    [TEXCOORD] public Vector4 Value11;
}
```

### Output attributes

Apply to fields, parameters and return values the stage produces.

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

public struct OutputExamples
{
    // Fragment depth (output)
    [SV_Depth] public float FragmentDepth;
    // Conservative depth
    [SV_DepthGreaterEqual] public float ConservativeDepth;
    // Conservative depth
    [SV_DepthLessEqual] public float ConservativeDepth2;
    // Stencil reference (output)
    [SV_StencilRef] public uint StencilReference;
    [SV_Target] public Vector4 Value5;
}
```

### Method attributes

Apply to methods, for example to set a compute workgroup size.

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

### Resource attributes

Declare uniforms, buffers, textures, samplers and binding slots.

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;
using YotsubaShader.HlslSyntax.Resources;

public class ResourceExamples
{
    [cbuffer] public float Value1;
    [register(RegisterPrefix.b, 0)] public float Value2;

    // The string overload: letter + number
    [register("b1")]
    public float Value3;
}
```

### Supporting types

Structs, classes and enums used together with the attributes.

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
> These listings show what the package declares. They do not mean that every concept is lowered by every output target.

The other syntaxes: [GLSL](glsl.md), [MSL](msl.md), [SPIR-V](spirv.md), [WGSL](wgsl.md).

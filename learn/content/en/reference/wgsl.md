---
title: WGSL syntax
summary: Every attribute of the WGSL syntax: the @builtin(...), @group and @binding vocabulary of WebGPU, written with @ identifiers that remain valid C#.
order: 5
---

The WGSL syntax is inspired by **WGSL (WebGPU)**. It has 24 attributes in the `YotsubaShader.WgslSyntax` package. The syntax you write with does not decide the output: the same shader compiles to any target.

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;

public struct VertexOutput
{
    [@builtin_position]
    public Vector4 Position;
}
```

## Built-in values by stage

Every built-in value the syntax declares, grouped by the stage that uses it.

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;

// Vertex stage
public struct VertexBuiltIns
{
    // Clip-space position (vertex output)
    [@builtin_position] public Vector4 ClipSpacePosition;

    // Vertex index
    [@builtin_vertex_index] public uint VertexIndex;

    // Instance index
    [@builtin_instance_index] public uint InstanceIndex;

    // Clip distance
    [@builtin_clip_distances] public float ClipDistance;
}

// Fragment stage
public struct FragmentBuiltIns
{
    // Fragment coordinate
    [@builtin_position] public Vector4 FragmentCoordinate;

    // Front-facing flag
    [@builtin_front_facing] public bool FrontFacingFlag;

    // Fragment depth (output)
    [@builtin_frag_depth] public float FragmentDepth;

    // Sample index
    [@builtin_sample_index] public uint SampleIndex;

    // Sample mask
    [@builtin_sample_mask] public uint SampleMask;

    // Primitive index
    [@builtin_primitive_index] public uint PrimitiveIndex;
}

// Compute stage
public class ComputeBuiltIns
{
    // Global invocation id
    [@builtin_global_invocation_id] public UInt3 GlobalInvocationId;

    // Local invocation id
    [@builtin_local_invocation_id] public UInt3 LocalInvocationId;

    // Local invocation index
    [@builtin_local_invocation_index] public uint LocalInvocationIndex;

    // Workgroup id
    [@builtin_workgroup_id] public UInt3 WorkgroupId;

    // Number of workgroups
    [@builtin_num_workgroups] public UInt3 NumberOfWorkgroups;

    // Subgroup size
    [@builtin_subgroup_size] public uint SubgroupSize;

    // Subgroup invocation id
    [@builtin_subgroup_invocation_id] public UInt3 SubgroupInvocationId;

    // Subgroup id
    [@builtin_subgroup_id] public uint SubgroupId;

    // Number of subgroups
    [@builtin_num_subgroups] public uint NumberOfSubgroups;

    // Workgroup size (method attribute)
    [ShaderStage(Stage.Compute)]
    [@workgroup_size(8, 8, 1)]
    public void Compute() { }
}
```

## Resources and binding slots

Uniform buffers, storage buffers, textures and samplers, each with its slot written in this syntax.

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
    // Uniform buffer, with its binding slot
    [uniform, @group(0), @binding(0)]
    public Material Material;

    // Read/write storage buffer
    [storage(storage_use.read_write), @group(0), @binding(1)]
    public float[] Output;

    // Read-only storage buffer
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

## Equivalents in the other syntaxes

The same concept in WGSL and in the other four syntaxes. A dash means that the syntax has no spelling for it.

### Built-in values

| Concept | WGSL | HLSL | GLSL | MSL | SPIR-V |
| --- | --- | --- | --- | --- | --- |
| **Vertex stage** | | | | | |
| Clip-space position (vertex output) | `@builtin_position` | `SV_Position` | `gl_Position` | `position` | `BuiltIn_Position` |
| Vertex index | `@builtin_vertex_index` | `SV_VertexID` | `gl_VertexIndex` | `vertex_id` | `BuiltIn_VertexIndex` |
| Instance index | `@builtin_instance_index` | `SV_InstanceID` | `gl_InstanceIndex` | `instance_id` | `BuiltIn_InstanceIndex` |
| Base vertex | — | `SV_StartVertexLocation` | `gl_BaseVertex` | `base_vertex` | `BuiltIn_BaseVertex` |
| Base instance | — | `SV_StartInstanceLocation` | `gl_BaseInstance` | `base_instance` | `BuiltIn_BaseInstance` |
| Clip distance | `@builtin_clip_distances` | `SV_ClipDistanceN` | `gl_ClipDistance` | `clip_distance` | `BuiltIn_ClipDistance` |
| Render target layer | — | `SV_RenderTargetArrayIndex` | `gl_Layer` | `render_target_array_index` | `BuiltIn_Layer` |
| Viewport index | — | `SV_ViewportArrayIndex` | `gl_ViewportIndex` | `viewport_array_index` | `BuiltIn_ViewportIndex` |
| **Fragment stage** | | | | | |
| Fragment coordinate | `@builtin_position` | `SV_Position` | `gl_FragCoord` | `position` | `BuiltIn_FragCoord` |
| Front-facing flag | `@builtin_front_facing` | `SV_IsFrontFace` | `gl_FrontFacing` | `front_facing` | `BuiltIn_FrontFacing` |
| Fragment depth (output) | `@builtin_frag_depth` | `SV_Depth` | `gl_FragDepth` | `depth` | `BuiltIn_FragDepth` |
| Conservative depth | — | `SV_DepthGreaterEqual / SV_DepthLessEqual` | — | `depth("greater") / depth("less")` | — |
| Stencil reference (output) | — | `SV_StencilRef` | `gl_FragStencilRefARB` | `stencil` | `BuiltIn_FragStencilRef` |
| Sample index | `@builtin_sample_index` | `SV_SampleIndex` | `gl_SampleID` | `sample_id` | `BuiltIn_SampleId` |
| Sample mask | `@builtin_sample_mask` | `SV_Coverage` | `gl_SampleMask / gl_SampleMaskIn` | `sample_mask` | `BuiltIn_SampleMask` |
| Primitive index | `@builtin_primitive_index` | `SV_PrimitiveID` | `gl_PrimitiveID` | `primitive_id` | `BuiltIn_PrimitiveId` |
| Barycentric coordinates | — | `SV_Barycentrics` | `gl_BaryCoordEXT` | `barycentric_coord` | `BuiltIn_BaryCoord` |
| Barycentric coordinates (no perspective) | — | — | `gl_BaryCoordNoPerspEXT` | — | `BuiltIn_BaryCoordNoPersp` |
| Helper invocation | — | — | `gl_HelperInvocation` | — | `BuiltIn_HelperInvocation` |
| Sample position | — | — | `gl_SamplePosition` | — | `BuiltIn_SamplePosition` |
| **Compute stage** | | | | | |
| Global invocation id | `@builtin_global_invocation_id` | `SV_DispatchThreadID` | `gl_GlobalInvocationID` | `thread_position_in_grid` | `BuiltIn_GlobalInvocationId` |
| Local invocation id | `@builtin_local_invocation_id` | `SV_GroupThreadID` | `gl_LocalInvocationID` | `thread_position_in_threadgroup` | `BuiltIn_LocalInvocationId` |
| Local invocation index | `@builtin_local_invocation_index` | `SV_GroupIndex` | `gl_LocalInvocationIndex` | `thread_index_in_threadgroup` | `BuiltIn_LocalInvocationIndex` |
| Workgroup id | `@builtin_workgroup_id` | `SV_GroupID` | `gl_WorkGroupID` | `threadgroup_position_in_grid` | `BuiltIn_WorkgroupId` |
| Number of workgroups | `@builtin_num_workgroups` | — | `gl_NumWorkGroups` | `threadgroups_per_grid` | `BuiltIn_NumWorkgroups` |
| Workgroup size (method attribute) | `@workgroup_size` | `numthreads` | `layout_local_size` | — | — |
| Workgroup size (built-in value) | — | — | `gl_WorkGroupSize` | `threads_per_threadgroup` | `BuiltIn_WorkgroupSize` |
| Subgroup size | `@builtin_subgroup_size` | — | `gl_SubgroupSize` | `threads_per_simdgroup` | `BuiltIn_SubgroupSize` |
| Subgroup invocation id | `@builtin_subgroup_invocation_id` | — | `gl_SubgroupInvocationID` | `thread_index_in_simdgroup` | `BuiltIn_SubgroupInvocationId` |
| Subgroup id | `@builtin_subgroup_id` | — | `gl_SubgroupID` | `simdgroup_index_in_threadgroup` | `BuiltIn_SubgroupId` |
| Number of subgroups | `@builtin_num_subgroups` | — | `gl_NumSubgroups` | `simdgroups_per_threadgroup` | `BuiltIn_NumSubgroups` |

### Resources

| Concept | WGSL | HLSL | GLSL | MSL | SPIR-V |
| --- | --- | --- | --- | --- | --- |
| Uniform buffer | `uniform` | `cbuffer, ConstantBuffer<T>` | `uniform` | `constant` | `Uniform` |
| Read/write storage buffer | `storage(storage_use.read_write)` | `RWStructuredBuffer<T>` | `buffer` | `device` | `StorageBuffer` |
| Read-only storage buffer | `storage(storage_use.read)` | `StructuredBuffer<T>` | `buffer` | `device(readOnly: true)` | `StorageBuffer` |
| Binding slot | `@group(s) + @binding(n)` | `register(RegisterPrefix.b, n)` | `layout(set, binding)` | `buffer(n), texture(n), sampler(n)` | `DescriptorSet(s) + Binding(n)` |
| Texture slot | `@group(s) + @binding(n)` | `register(RegisterPrefix.t, n)` | `layout(set, binding)` | `texture(n)` | `DescriptorSet(s) + Binding(n)` |
| Sampler slot | `@group(s) + @binding(n)` | `register(RegisterPrefix.s, n)` | `layout(set, binding)` | `sampler(n)` | `DescriptorSet(s) + Binding(n)` |

## Attributes

The attributes declared by the package, in groups, applied to real members.

### Input attributes

Apply to fields, parameters and properties that receive values from the pipeline.

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;

public struct InputExamples
{
    // Front-facing flag
    [@builtin_front_facing] public bool FrontFacingFlag;
    // Global invocation id
    [@builtin_global_invocation_id]
    public UInt3 GlobalInvocationId;
    // Instance index
    [@builtin_instance_index] public uint InstanceIndex;
    // Local invocation id
    [@builtin_local_invocation_id]
    public UInt3 LocalInvocationId;
    // Local invocation index
    [@builtin_local_invocation_index]
    public uint LocalInvocationIndex;
    // Number of subgroups
    [@builtin_num_subgroups] public uint NumberOfSubgroups;
    // Number of workgroups
    [@builtin_num_workgroups] public UInt3 NumberOfWorkgroups;
    // Primitive index
    [@builtin_primitive_index] public uint PrimitiveIndex;
    // Sample index
    [@builtin_sample_index] public uint SampleIndex;
    // Subgroup id
    [@builtin_subgroup_id] public uint SubgroupId;
    // Subgroup invocation id
    [@builtin_subgroup_invocation_id]
    public UInt3 SubgroupInvocationId;
    // Subgroup size
    [@builtin_subgroup_size] public uint SubgroupSize;
    // Vertex index
    [@builtin_vertex_index] public uint VertexIndex;
    // Workgroup id
    [@builtin_workgroup_id] public UInt3 WorkgroupId;
}
```

### Input and output attributes

Apply to values that can be received or produced, depending on the stage.

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;

public struct InputOutputExamples
{
    // Clip-space position (vertex output)
    [@builtin_position] public Vector4 ClipSpacePosition;
    // Sample mask
    [@builtin_sample_mask] public uint SampleMask;
    [@location(0)] public Vector4 Value3;
}
```

### Output attributes

Apply to fields, parameters and return values the stage produces.

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;

public struct OutputExamples
{
    // Clip distance
    [@builtin_clip_distances] public float ClipDistance;
    // Fragment depth (output)
    [@builtin_frag_depth] public float FragmentDepth;
}
```

### Method attributes

Apply to methods, for example to set a compute workgroup size.

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

### Resource attributes

Declare uniforms, buffers, textures, samplers and binding slots.

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

### Supporting types

Structs, classes and enums used together with the attributes.

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
> These listings show what the package declares. They do not mean that every concept is lowered by every output target.

The other syntaxes: [HLSL](hlsl.md), [GLSL](glsl.md), [MSL](msl.md), [SPIR-V](spirv.md).

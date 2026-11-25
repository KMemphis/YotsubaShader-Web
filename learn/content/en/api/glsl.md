---
title: GLSL syntax API
summary: Every attribute and type of the YotsubaShader.GlslSyntax package, with its declaration, its concept and an example.
order: 2
---

API of the `YotsubaShader.GlslSyntax` package: the 35 attributes and the types of the GLSL syntax, inspired by **GLSL (OpenGL / Vulkan GLSL)**. Each entry shows the declaration as the package writes it, the concept the compiler reads from it, the same concept in the other four syntaxes, and an example.

Add the package to the shader project:

```bash
dotnet add package YotsubaShader.GlslSyntax
```

For a guided tour of the syntax, with every built-in value grouped by stage, see the [GLSL syntax](../reference/glsl.md) page of the Documentation.

## Namespaces

The package splits its API in these namespaces. The attributes shared by every syntax (`ShaderStage`, `Location`, `Uniform`...) are in `YotsubaShader.Language`.

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax; // Built-in values, interface slots and method attributes
using YotsubaShader.GlslSyntax.Resources; // Resource attributes and resource types
using YotsubaShader.GlslSyntax.Resources.Types; // Texture and sampler types
using YotsubaShader.GlslSyntax.Types; // Vector, matrix and helper types
```

## Input attributes

Fields, parameters and properties that receive a value from the pipeline.

### gl_BaryCoordEXT

Barycentric coordinates of the fragment inside its triangle.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[BarycentricCoordinates]
public class gl_BaryCoordEXT : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.GlslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `BarycentricCoordinates`
- **Same concept in:** HLSL [SV_Barycentrics](hlsl.md#sv-barycentrics) · MSL [barycentric_coord](msl.md#barycentric-coord) · SPIR-V [BuiltIn_BaryCoord](spirv.md#builtin-barycoord)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Types;

// Fragment stage input
public struct FragmentInput
{
    [gl_BaryCoordEXT] public vec3 Barycentrics;
}
```

### gl_BaryCoordNoPerspEXT

Barycentric coordinates without perspective correction.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[BarycentricCoordinatesNoPerspective]
public class gl_BaryCoordNoPerspEXT : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.GlslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `BarycentricCoordinatesNoPerspective`
- **Same concept in:** SPIR-V [BuiltIn_BaryCoordNoPersp](spirv.md#builtin-barycoordnopersp)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Types;

// Fragment stage input
public struct FragmentInput
{
    [gl_BaryCoordNoPerspEXT] public vec3 BarycentricsNoPersp;
}
```

### gl_BaseInstance

Base instance of the draw call.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[BaseInstance]
public class gl_BaseInstance : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.GlslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `BaseInstance`
- **Same concept in:** HLSL [SV_StartInstanceLocation](hlsl.md#sv-startinstancelocation) · MSL [base_instance](msl.md#base-instance) · SPIR-V [BuiltIn_BaseInstance](spirv.md#builtin-baseinstance)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

// Vertex stage input
public struct VertexInput
{
    [gl_BaseInstance] public int BaseInstance;
}
```

### gl_BaseVertex

Base vertex of the draw call.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[BaseVertex]
public class gl_BaseVertex : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.GlslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `BaseVertex`
- **Same concept in:** HLSL [SV_StartVertexLocation](hlsl.md#sv-startvertexlocation) · MSL [base_vertex](msl.md#base-vertex) · SPIR-V [BuiltIn_BaseVertex](spirv.md#builtin-basevertex)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

// Vertex stage input
public struct VertexInput
{
    [gl_BaseVertex] public int BaseVertex;
}
```

### gl_FragCoord

Window coordinate of the fragment, read by the fragment stage.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[FragmentCoordinate]
public class gl_FragCoord : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.GlslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `FragmentCoordinate`
- **Same concept in:** HLSL [SV_Position](hlsl.md#sv-position), [SV_POSITION](hlsl.md#sv-position) · MSL [position](msl.md#position) · SPIR-V [BuiltIn_FragCoord](spirv.md#builtin-fragcoord) · WGSL [@builtin_position](wgsl.md#builtin-position)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Types;

// Fragment stage input
public struct FragmentInput
{
    [gl_FragCoord] public vec4 FragCoord;
}
```

### gl_FrontFacing

`true` when the fragment belongs to a front-facing primitive.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[FrontFacingFlag]
public class gl_FrontFacing : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.GlslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `FrontFacingFlag`
- **Same concept in:** HLSL [SV_IsFrontFace](hlsl.md#sv-isfrontface) · MSL [front_facing](msl.md#front-facing) · SPIR-V [BuiltIn_FrontFacing](spirv.md#builtin-frontfacing) · WGSL [@builtin_front_facing](wgsl.md#builtin-front-facing)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

// Fragment stage input
public struct FragmentInput
{
    [gl_FrontFacing] public bool IsFrontFace;
}
```

### gl_GlobalInvocationID

Position of the invocation in the whole dispatch.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[GlobalInvocationId]
public class gl_GlobalInvocationID : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.GlslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `GlobalInvocationId`
- **Same concept in:** HLSL [SV_DispatchThreadID](hlsl.md#sv-dispatchthreadid) · MSL [thread_position_in_grid](msl.md#thread-position-in-grid) · SPIR-V [BuiltIn_GlobalInvocationId](spirv.md#builtin-globalinvocationid) · WGSL [@builtin_global_invocation_id](wgsl.md#builtin-global-invocation-id)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Types;

// Compute stage input
public struct ComputeInput
{
    [gl_GlobalInvocationID] public uvec3 GlobalId;
}
```

### gl_HelperInvocation

`true` for helper invocations, which run only to compute derivatives.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[HelperInvocation]
public class gl_HelperInvocation : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.GlslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `HelperInvocation`
- **Same concept in:** SPIR-V [BuiltIn_HelperInvocation](spirv.md#builtin-helperinvocation)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

// Fragment stage input
public struct FragmentInput
{
    [gl_HelperInvocation] public bool IsHelper;
}
```

### gl_InstanceIndex

Index of the instance being drawn.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[InstanceIndex]
public class gl_InstanceIndex : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.GlslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `InstanceIndex`
- **Same concept in:** HLSL [SV_InstanceID](hlsl.md#sv-instanceid) · MSL [instance_id](msl.md#instance-id) · SPIR-V [BuiltIn_InstanceIndex](spirv.md#builtin-instanceindex) · WGSL [@builtin_instance_index](wgsl.md#builtin-instance-index)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

// Vertex stage input
public struct VertexInput
{
    [gl_InstanceIndex] public int InstanceIndex;
}
```

### gl_LocalInvocationID

Position of the invocation inside its workgroup.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[LocalInvocationId]
public class gl_LocalInvocationID : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.GlslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `LocalInvocationId`
- **Same concept in:** HLSL [SV_GroupThreadID](hlsl.md#sv-groupthreadid) · MSL [thread_position_in_threadgroup](msl.md#thread-position-in-threadgroup) · SPIR-V [BuiltIn_LocalInvocationId](spirv.md#builtin-localinvocationid) · WGSL [@builtin_local_invocation_id](wgsl.md#builtin-local-invocation-id)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Types;

// Compute stage input
public struct ComputeInput
{
    [gl_LocalInvocationID] public uvec3 LocalId;
}
```

### gl_LocalInvocationIndex

Flattened index of the invocation inside its workgroup.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[LocalInvocationIndex]
public class gl_LocalInvocationIndex : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.GlslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `LocalInvocationIndex`
- **Same concept in:** HLSL [SV_GroupIndex](hlsl.md#sv-groupindex) · MSL [thread_index_in_threadgroup](msl.md#thread-index-in-threadgroup) · SPIR-V [BuiltIn_LocalInvocationIndex](spirv.md#builtin-localinvocationindex) · WGSL [@builtin_local_invocation_index](wgsl.md#builtin-local-invocation-index)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

// Compute stage input
public struct ComputeInput
{
    [gl_LocalInvocationIndex] public uint LocalIndex;
}
```

### gl_NumSubgroups

Number of subgroups in the workgroup.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[NumberOfSubgroups]
public class gl_NumSubgroups : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.GlslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `NumberOfSubgroups`
- **Same concept in:** MSL [simdgroups_per_threadgroup](msl.md#simdgroups-per-threadgroup) · SPIR-V [BuiltIn_NumSubgroups](spirv.md#builtin-numsubgroups) · WGSL [@builtin_num_subgroups](wgsl.md#builtin-num-subgroups)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

// Compute stage input
public struct ComputeInput
{
    [gl_NumSubgroups] public uint SubgroupCount;
}
```

### gl_NumWorkGroups

Number of workgroups of the dispatch.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[NumberOfWorkgroups]
public class gl_NumWorkGroups : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.GlslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `NumberOfWorkgroups`
- **Same concept in:** MSL [threadgroups_per_grid](msl.md#threadgroups-per-grid) · SPIR-V [BuiltIn_NumWorkgroups](spirv.md#builtin-numworkgroups) · WGSL [@builtin_num_workgroups](wgsl.md#builtin-num-workgroups)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Types;

// Compute stage input
public struct ComputeInput
{
    [gl_NumWorkGroups] public uvec3 GroupCount;
}
```

### gl_PrimitiveID

Index of the primitive the fragment belongs to.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[PrimitiveIndex]
public class gl_PrimitiveID : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.GlslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `PrimitiveIndex`
- **Same concept in:** HLSL [SV_PrimitiveID](hlsl.md#sv-primitiveid) · MSL [primitive_id](msl.md#primitive-id) · SPIR-V [BuiltIn_PrimitiveId](spirv.md#builtin-primitiveid) · WGSL [@builtin_primitive_index](wgsl.md#builtin-primitive-index)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

// Fragment stage input
public struct FragmentInput
{
    [gl_PrimitiveID] public uint PrimitiveId;
}
```

### gl_SampleID

Index of the sample being shaded (multisampling).

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[SampleIndex]
public class gl_SampleID : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.GlslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `SampleIndex`
- **Same concept in:** HLSL [SV_SampleIndex](hlsl.md#sv-sampleindex) · MSL [sample_id](msl.md#sample-id) · SPIR-V [BuiltIn_SampleId](spirv.md#builtin-sampleid) · WGSL [@builtin_sample_index](wgsl.md#builtin-sample-index)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

// Fragment stage input
public struct FragmentInput
{
    [gl_SampleID] public uint SampleIndex;
}
```

### gl_SampleMaskIn

Coverage mask of the samples of the fragment, as received.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[SampleMask]
public class gl_SampleMaskIn : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.GlslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `SampleMask`
- **Same concept in:** HLSL [SV_Coverage](hlsl.md#sv-coverage) · MSL [sample_mask](msl.md#sample-mask) · SPIR-V [BuiltIn_SampleMask](spirv.md#builtin-samplemask) · WGSL [@builtin_sample_mask](wgsl.md#builtin-sample-mask)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

// Fragment stage input
public struct FragmentInput
{
    [gl_SampleMaskIn] public uint SampleMask;
}
```

### gl_SamplePosition

Position of the current sample inside the pixel.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[SamplePosition]
public class gl_SamplePosition : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.GlslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `SamplePosition`
- **Same concept in:** SPIR-V [BuiltIn_SamplePosition](spirv.md#builtin-sampleposition)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Types;

// Fragment stage input
public struct FragmentInput
{
    [gl_SamplePosition] public vec2 SamplePosition;
}
```

### gl_SubgroupID

Index of the subgroup inside the workgroup.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[SubgroupId]
public class gl_SubgroupID : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.GlslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `SubgroupId`
- **Same concept in:** MSL [simdgroup_index_in_threadgroup](msl.md#simdgroup-index-in-threadgroup) · SPIR-V [BuiltIn_SubgroupId](spirv.md#builtin-subgroupid) · WGSL [@builtin_subgroup_id](wgsl.md#builtin-subgroup-id)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

// Compute stage input
public struct ComputeInput
{
    [gl_SubgroupID] public uint SubgroupId;
}
```

### gl_SubgroupInvocationID

Index of the invocation inside its subgroup.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[SubgroupInvocationId]
public class gl_SubgroupInvocationID : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.GlslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `SubgroupInvocationId`
- **Same concept in:** MSL [thread_index_in_simdgroup](msl.md#thread-index-in-simdgroup) · SPIR-V [BuiltIn_SubgroupInvocationId](spirv.md#builtin-subgroupinvocationid) · WGSL [@builtin_subgroup_invocation_id](wgsl.md#builtin-subgroup-invocation-id)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

// Compute stage input
public struct ComputeInput
{
    [gl_SubgroupInvocationID] public uint SubgroupLane;
}
```

### gl_SubgroupSize

Number of invocations in a subgroup.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[SubgroupSize]
public class gl_SubgroupSize : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.GlslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `SubgroupSize`
- **Same concept in:** MSL [threads_per_simdgroup](msl.md#threads-per-simdgroup) · SPIR-V [BuiltIn_SubgroupSize](spirv.md#builtin-subgroupsize) · WGSL [@builtin_subgroup_size](wgsl.md#builtin-subgroup-size)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

// Compute stage input
public struct ComputeInput
{
    [gl_SubgroupSize] public uint SubgroupSize;
}
```

### gl_VertexIndex

Index of the vertex being processed.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[VertexIndex]
public class gl_VertexIndex : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.GlslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `VertexIndex`
- **Same concept in:** HLSL [SV_VertexID](hlsl.md#sv-vertexid) · MSL [vertex_id](msl.md#vertex-id) · SPIR-V [BuiltIn_VertexIndex](spirv.md#builtin-vertexindex) · WGSL [@builtin_vertex_index](wgsl.md#builtin-vertex-index)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

// Vertex stage input
public struct VertexInput
{
    [gl_VertexIndex] public int VertexIndex;
}
```

### gl_WorkGroupID

Position of the workgroup in the dispatch.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[WorkgroupId]
public class gl_WorkGroupID : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.GlslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `WorkgroupId`
- **Same concept in:** HLSL [SV_GroupID](hlsl.md#sv-groupid) · MSL [threadgroup_position_in_grid](msl.md#threadgroup-position-in-grid) · SPIR-V [BuiltIn_WorkgroupId](spirv.md#builtin-workgroupid) · WGSL [@builtin_workgroup_id](wgsl.md#builtin-workgroup-id)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Types;

// Compute stage input
public struct ComputeInput
{
    [gl_WorkGroupID] public uvec3 GroupId;
}
```

### gl_WorkGroupSize

Size of the workgroup, read as a value.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[WorkgroupSizeBuiltInValue]
public class gl_WorkGroupSize : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.GlslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `WorkgroupSizeBuiltInValue`
- **Same concept in:** MSL [threads_per_threadgroup](msl.md#threads-per-threadgroup) · SPIR-V [BuiltIn_WorkgroupSize](spirv.md#builtin-workgroupsize)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Types;

// Compute stage input
public struct ComputeInput
{
    [gl_WorkGroupSize] public uvec3 GroupSize;
}
```

## Output attributes

Fields, parameters and return values that the stage produces.

### gl_ClipDistance

Clip distance: a negative value clips the primitive against a user plane.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Output)]
[ClipInstance]
public class gl_ClipDistance : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.GlslSyntax`
- **Applies to:** fields, parameters, return values
- **Concept:** `ClipInstance`
- **Same concept in:** HLSL [SV_ClipDistanceN](hlsl.md#sv-clipdistancen) · MSL [clip_distance](msl.md#clip-distance) · SPIR-V [BuiltIn_ClipDistance](spirv.md#builtin-clipdistance) · WGSL [@builtin_clip_distances](wgsl.md#builtin-clip-distances)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

// Vertex stage output
public struct VertexOutput
{
    [gl_ClipDistance] public float ClipDistance;
}
```

### gl_FragDepth

Depth written by the fragment stage, replacing the interpolated one.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Output)]
[FragDepth]
public class gl_FragDepth : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.GlslSyntax`
- **Applies to:** fields, parameters, return values
- **Concept:** `FragDepth`
- **Same concept in:** HLSL [SV_Depth](hlsl.md#sv-depth) · MSL [depth](msl.md#depth) · SPIR-V [BuiltIn_FragDepth](spirv.md#builtin-fragdepth) · WGSL [@builtin_frag_depth](wgsl.md#builtin-frag-depth)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

// Fragment stage output
public struct FragmentOutput
{
    [gl_FragDepth] public float Depth;
}
```

### gl_FragStencilRefARB

Stencil reference value written by the fragment stage.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Output)]
[StencilReference]
public class gl_FragStencilRefARB : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.GlslSyntax`
- **Applies to:** fields, parameters, return values
- **Concept:** `StencilReference`
- **Same concept in:** HLSL [SV_StencilRef](hlsl.md#sv-stencilref) · MSL [stencil](msl.md#stencil) · SPIR-V [BuiltIn_FragStencilRef](spirv.md#builtin-fragstencilref)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

// Fragment stage output
public struct FragmentOutput
{
    [gl_FragStencilRefARB] public uint StencilRef;
}
```

### gl_SampleMask

Coverage mask written by the fragment stage.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Output)]
[SampleMask]
public class gl_SampleMask : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.GlslSyntax`
- **Applies to:** fields, parameters, return values
- **Concept:** `SampleMask`
- **Same concept in:** HLSL [SV_Coverage](hlsl.md#sv-coverage) · MSL [sample_mask](msl.md#sample-mask) · SPIR-V [BuiltIn_SampleMask](spirv.md#builtin-samplemask) · WGSL [@builtin_sample_mask](wgsl.md#builtin-sample-mask)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

// Fragment stage output
public struct FragmentOutput
{
    [gl_SampleMask] public uint SampleMask;
}
```

## Input and output attributes

Values that a stage can receive or produce. The stage decides which.

### gl_Layer

Layer of a layered render target that receives the primitive.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[RenderTargetLayer]
public class gl_Layer : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.GlslSyntax`
- **Applies to:** fields, parameters, properties, return values
- **Concept:** `RenderTargetLayer`
- **Same concept in:** HLSL [SV_RenderTargetArrayIndex](hlsl.md#sv-rendertargetarrayindex) · MSL [render_target_array_index](msl.md#render-target-array-index) · SPIR-V [BuiltIn_Layer](spirv.md#builtin-layer)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

// Vertex stage output
public struct VertexOutput
{
    [gl_Layer] public uint Layer;
}
```

### gl_Position

Clip-space position written by the vertex stage.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[ClipSpacePosition]
public class gl_Position : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.GlslSyntax`
- **Applies to:** fields, parameters, properties, return values
- **Concept:** `ClipSpacePosition`
- **Same concept in:** HLSL [SV_Position](hlsl.md#sv-position), [SV_POSITION](hlsl.md#sv-position) · MSL [position](msl.md#position) · SPIR-V [BuiltIn_Position](spirv.md#builtin-position) · WGSL [@builtin_position](wgsl.md#builtin-position)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Types;

// Vertex stage output
public struct VertexOutput
{
    [gl_Position] public vec4 Position;
}
```

### gl_ViewportIndex

Viewport that receives the primitive.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[ViewportIndex]
public class gl_ViewportIndex : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.GlslSyntax`
- **Applies to:** fields, parameters, properties, return values
- **Concept:** `ViewportIndex`
- **Same concept in:** HLSL [SV_ViewportArrayIndex](hlsl.md#sv-viewportarrayindex) · MSL [viewport_array_index](msl.md#viewport-array-index) · SPIR-V [BuiltIn_ViewportIndex](spirv.md#builtin-viewportindex)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

// Vertex stage output
public struct VertexOutput
{
    [gl_ViewportIndex] public uint ViewportIndex;
}
```

### location

Numbered interface slot: vertex inputs, values passed between stages and fragment outputs.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[Location]
public class location(int n) : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.GlslSyntax`
- **Applies to:** fields, parameters, properties, return values
- **Concept:** `Location`
- **Same concept in:** HLSL [SV_Target](hlsl.md#sv-target) · MSL [attribute](msl.md#attribute), [color](msl.md#color) · SPIR-V [Location](spirv.md#location) · WGSL [@location](wgsl.md#location)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Types;

// Vertex stage output
public struct VertexOutput
{
    [location(0)] public vec4 Color;
}
```

## Method attributes

Attributes applied to an entry point method.

### layout_local_size

Sets the workgroup size of a compute entry point.

```csharp
namespace YotsubaShader.GlslSyntax;

[AttributeUsage(AttributeUsagesTable.Method)]
[WorkgroupSizeMethod]
public class layout_local_size(uint x, uint y = 1, uint z = 1) : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.GlslSyntax`
- **Applies to:** methods
- **Concept:** `WorkgroupSizeMethod`
- **Same concept in:** HLSL [numthreads](hlsl.md#numthreads) · WGSL [@workgroup_size](wgsl.md#workgroup-size)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;

public class Blur
{
    // Compute entry point
    [ShaderStage(Stage.Compute)]
    [layout_local_size(8)]
    public void Main() { }
}
```

## Resource attributes

Uniform buffers, storage buffers and the binding slots of buffers, textures and samplers.

### buffer

Marks the field as a storage buffer (`buffer` block in GLSL), read/write or read-only.

```csharp
namespace YotsubaShader.GlslSyntax.Resources;

[AttributeUsage(AttributeUsagesTable.Resource)]
[RWStorageBuffer, ReadOnlyStorageBuffer]
public class buffer : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.GlslSyntax.Resources`
- **Applies to:** fields, parameters, properties
- **Concept:** `RWStorageBuffer`, `ReadOnlyStorageBuffer`
- **Same concept in:** MSL [device](msl.md#device) · SPIR-V [StorageBuffer](spirv.md#storagebuffer) · WGSL [storage](wgsl.md#storage)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Resources;

public class Resources
{
    [buffer, layout(0, 1)]
    public float[] Output;
}
```

### layout

Descriptor set and binding of a buffer, texture or sampler.

```csharp
namespace YotsubaShader.GlslSyntax.Resources;

[AttributeUsage(AttributeUsagesTable.Resource)]
[BindingSlot, TextureSlot, SamplerSlot]
public class layout(int set, int binding) : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.GlslSyntax.Resources`
- **Applies to:** fields, parameters, properties
- **Concept:** `BindingSlot`, `TextureSlot`, `SamplerSlot`
- **Same concept in:** HLSL [register](hlsl.md#register) · MSL [buffer](msl.md#buffer), [sampler](msl.md#sampler), [texture](msl.md#texture) · SPIR-V [Binding](spirv.md#binding), [DescriptorSet](spirv.md#descriptorset) · WGSL [@binding](wgsl.md#binding), [@group](wgsl.md#group)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Resources;
using YotsubaShader.GlslSyntax.Resources.Types;

public class Surface
{
    [layout(0, 0)]
    public sampler2D Albedo;
}
```

### uniform

Marks the field as a uniform (constant) buffer.

```csharp
namespace YotsubaShader.GlslSyntax.Resources;

[AttributeUsage(AttributeUsagesTable.Resource)]
[UniformBuffer]
public class uniform : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.GlslSyntax.Resources`
- **Applies to:** fields, parameters, properties
- **Concept:** `UniformBuffer`
- **Same concept in:** HLSL [cbuffer](hlsl.md#cbuffer) · MSL [constant](msl.md#constant) · SPIR-V [Uniform](spirv.md#uniform) · WGSL [uniform](wgsl.md#uniform)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Resources;

public struct Material
{
    // The contents of the uniform buffer
    public float Exposure;
}

public class Resources
{
    [uniform, layout(0, 0)]
    public Material Material;
}
```

## Types

The types declared by the package. Members are listed without their bodies.

### Texture and sampler types

```csharp
namespace YotsubaShader.GlslSyntax.Resources.Types;

[Texture(TextureDimension.D1, TextureComponentTypes.Int, Usage = TextureUsage.Storage)]
public struct iimage1D;

[Texture(TextureDimension.D2, TextureComponentTypes.Int, Usage = TextureUsage.Storage)]
public struct iimage2D;

[Texture(TextureDimension.D2, TextureComponentTypes.Int, Arrayed = true, Usage = TextureUsage.Storage)]
public struct iimage2DArray;

[Texture(TextureDimension.D2, TextureComponentTypes.Int, Multisampled = true, Usage = TextureUsage.Storage)]
public struct iimage2DMS;

[Texture(TextureDimension.D3, TextureComponentTypes.Int, Usage = TextureUsage.Storage)]
public struct iimage3D;

[Texture(TextureDimension.Cube, TextureComponentTypes.Int, Usage = TextureUsage.Storage)]
public struct iimageCube;

[Texture(TextureDimension.D1, TextureComponentTypes.Float, Usage = TextureUsage.Storage)]
public struct image1D;

[Texture(TextureDimension.D2, TextureComponentTypes.Float, Usage = TextureUsage.Storage)]
public struct image2D;

[Texture(TextureDimension.D2, TextureComponentTypes.Float, Arrayed = true, Usage = TextureUsage.Storage)]
public struct image2DArray;

[Texture(TextureDimension.D2, TextureComponentTypes.Float, Multisampled = true, Usage = TextureUsage.Storage)]
public struct image2DMS;

[Texture(TextureDimension.D3, TextureComponentTypes.Float, Usage = TextureUsage.Storage)]
public struct image3D;

[Texture(TextureDimension.Cube, TextureComponentTypes.Float, Usage = TextureUsage.Storage)]
public struct imageCube;

[Sampler, Texture(TextureDimension.D1, TextureComponentTypes.Int)]
public struct isampler1D;

[Sampler, Texture(TextureDimension.D1, TextureComponentTypes.Int, Arrayed = true)]
public struct isampler1DArray;

[Sampler, Texture(TextureDimension.D2, TextureComponentTypes.Int)]
public struct isampler2D;

[Sampler, Texture(TextureDimension.D2, TextureComponentTypes.Int, Arrayed = true)]
public struct isampler2DArray;

[Sampler, Texture(TextureDimension.D2, TextureComponentTypes.Int, Multisampled = true)]
public struct isampler2DMS;

[Sampler, Texture(TextureDimension.D2, TextureComponentTypes.Int, Arrayed = true, Multisampled = true)]
public struct isampler2DMSArray;

[Sampler, Texture(TextureDimension.D3, TextureComponentTypes.Int)]
public struct isampler3D;

[Sampler, Texture(TextureDimension.D1, TextureComponentTypes.Int)]
public struct isamplerBuffer;

[Sampler, Texture(TextureDimension.Cube, TextureComponentTypes.Int)]
public struct isamplerCube;

[Sampler, Texture(TextureDimension.Cube, TextureComponentTypes.Int, Arrayed = true)]
public struct isamplerCubeArray;

[Sampler, Texture(TextureDimension.D1, TextureComponentTypes.Float)]
public struct sampler1D;

[Sampler, Texture(TextureDimension.D1, TextureComponentTypes.Float, Arrayed = true)]
public struct sampler1DArray;

[Sampler, Texture(TextureDimension.D1, TextureComponentTypes.Float, Depth = TextureDepth.Yes, Arrayed = true)]
public struct sampler1DArrayShadow;

[Sampler, Texture(TextureDimension.D1, TextureComponentTypes.Float, Depth = TextureDepth.Yes)]
public struct sampler1DShadow;

[Sampler, Texture(TextureDimension.D2, TextureComponentTypes.Float)]
public struct sampler2D;

[Sampler, Texture(TextureDimension.D2, TextureComponentTypes.Float, Arrayed = true)]
public struct sampler2DArray;

[Sampler, Texture(TextureDimension.D2, TextureComponentTypes.Float, Depth = TextureDepth.Yes, Arrayed = true)]
public struct sampler2DArrayShadow;

[Sampler, Texture(TextureDimension.D2, TextureComponentTypes.Float, Multisampled = true)]
public struct sampler2DMS;

[Sampler, Texture(TextureDimension.D2, TextureComponentTypes.Float, Arrayed = true, Multisampled = true)]
public struct sampler2DMSArray;

[Sampler, Texture(TextureDimension.D2, TextureComponentTypes.Float, Depth = TextureDepth.Yes)]
public struct sampler2DShadow;

[Sampler, Texture(TextureDimension.D3, TextureComponentTypes.Float)]
public struct sampler3D;

[Sampler, Texture(TextureDimension.D1, TextureComponentTypes.Float)]
public struct samplerBuffer;

[Sampler, Texture(TextureDimension.Cube, TextureComponentTypes.Float)]
public struct samplerCube;

[Sampler, Texture(TextureDimension.Cube, TextureComponentTypes.Float, Arrayed = true)]
public struct samplerCubeArray;

[Sampler, Texture(TextureDimension.Cube, TextureComponentTypes.Float, Depth = TextureDepth.Yes, Arrayed = true)]
public struct samplerCubeArrayShadow;

[Sampler, Texture(TextureDimension.Cube, TextureComponentTypes.Float, Depth = TextureDepth.Yes)]
public struct samplerCubeShadow;

[Texture(TextureDimension.D1, TextureComponentTypes.Uint, Usage = TextureUsage.Storage)]
public struct uimage1D;

[Texture(TextureDimension.D2, TextureComponentTypes.Uint, Usage = TextureUsage.Storage)]
public struct uimage2D;

[Texture(TextureDimension.D2, TextureComponentTypes.Uint, Arrayed = true, Usage = TextureUsage.Storage)]
public struct uimage2DArray;

[Texture(TextureDimension.D2, TextureComponentTypes.Uint, Multisampled = true, Usage = TextureUsage.Storage)]
public struct uimage2DMS;

[Texture(TextureDimension.D3, TextureComponentTypes.Uint, Usage = TextureUsage.Storage)]
public struct uimage3D;

[Texture(TextureDimension.Cube, TextureComponentTypes.Uint, Usage = TextureUsage.Storage)]
public struct uimageCube;

[Sampler, Texture(TextureDimension.D1, TextureComponentTypes.Uint)]
public struct usampler1D;

[Sampler, Texture(TextureDimension.D1, TextureComponentTypes.Uint, Arrayed = true)]
public struct usampler1DArray;

[Sampler, Texture(TextureDimension.D2, TextureComponentTypes.Uint)]
public struct usampler2D;

[Sampler, Texture(TextureDimension.D2, TextureComponentTypes.Uint, Arrayed = true)]
public struct usampler2DArray;

[Sampler, Texture(TextureDimension.D2, TextureComponentTypes.Uint, Multisampled = true)]
public struct usampler2DMS;

[Sampler, Texture(TextureDimension.D2, TextureComponentTypes.Uint, Arrayed = true, Multisampled = true)]
public struct usampler2DMSArray;

[Sampler, Texture(TextureDimension.D3, TextureComponentTypes.Uint)]
public struct usampler3D;

[Sampler, Texture(TextureDimension.D1, TextureComponentTypes.Uint)]
public struct usamplerBuffer;

[Sampler, Texture(TextureDimension.Cube, TextureComponentTypes.Uint)]
public struct usamplerCube;

[Sampler, Texture(TextureDimension.Cube, TextureComponentTypes.Uint, Arrayed = true)]
public struct usamplerCubeArray;
```

### Vector, matrix and helper types

```csharp
namespace YotsubaShader.GlslSyntax.Types;

[Vector]
public partial struct bvec2
{
    [VectorComponent(0)]
    public bool X;
    [VectorComponent(1)]
    public bool Y;
}

[Vector]
public partial struct bvec3
{
    [VectorComponent(0)]
    public bool X;
    [VectorComponent(1)]
    public bool Y;
    [VectorComponent(2)]
    public bool Z;
}

[Vector]
public partial struct bvec4
{
    [VectorComponent(0)]
    public bool X;
    [VectorComponent(1)]
    public bool Y;
    [VectorComponent(2)]
    public bool Z;
    [VectorComponent(3)]
    public bool W;
}

[Matrix]
public partial struct dmat2
{
    [MatrixColumn(0)]
    public dvec2 C0;
    [MatrixColumn(1)]
    public dvec2 C1;
}

[Matrix]
public partial struct dmat2x2
{
    [MatrixColumn(0)]
    public dvec2 C0;
    [MatrixColumn(1)]
    public dvec2 C1;
}

[Matrix]
public partial struct dmat2x3
{
    [MatrixColumn(0)]
    public dvec3 C0;
    [MatrixColumn(1)]
    public dvec3 C1;
}

[Matrix]
public partial struct dmat2x4
{
    [MatrixColumn(0)]
    public dvec4 C0;
    [MatrixColumn(1)]
    public dvec4 C1;
}

[Matrix]
public partial struct dmat3
{
    [MatrixColumn(0)]
    public dvec3 C0;
    [MatrixColumn(1)]
    public dvec3 C1;
    [MatrixColumn(2)]
    public dvec3 C2;
}

[Matrix]
public partial struct dmat3x2
{
    [MatrixColumn(0)]
    public dvec2 C0;
    [MatrixColumn(1)]
    public dvec2 C1;
    [MatrixColumn(2)]
    public dvec2 C2;
}

[Matrix]
public partial struct dmat3x3
{
    [MatrixColumn(0)]
    public dvec3 C0;
    [MatrixColumn(1)]
    public dvec3 C1;
    [MatrixColumn(2)]
    public dvec3 C2;
}

[Matrix]
public partial struct dmat3x4
{
    [MatrixColumn(0)]
    public dvec4 C0;
    [MatrixColumn(1)]
    public dvec4 C1;
    [MatrixColumn(2)]
    public dvec4 C2;
}

[Matrix]
public partial struct dmat4
{
    [MatrixColumn(0)]
    public dvec4 C0;
    [MatrixColumn(1)]
    public dvec4 C1;
    [MatrixColumn(2)]
    public dvec4 C2;
    [MatrixColumn(3)]
    public dvec4 C3;
}

[Matrix]
public partial struct dmat4x2
{
    [MatrixColumn(0)]
    public dvec2 C0;
    [MatrixColumn(1)]
    public dvec2 C1;
    [MatrixColumn(2)]
    public dvec2 C2;
    [MatrixColumn(3)]
    public dvec2 C3;
}

[Matrix]
public partial struct dmat4x3
{
    [MatrixColumn(0)]
    public dvec3 C0;
    [MatrixColumn(1)]
    public dvec3 C1;
    [MatrixColumn(2)]
    public dvec3 C2;
    [MatrixColumn(3)]
    public dvec3 C3;
}

[Matrix]
public partial struct dmat4x4
{
    [MatrixColumn(0)]
    public dvec4 C0;
    [MatrixColumn(1)]
    public dvec4 C1;
    [MatrixColumn(2)]
    public dvec4 C2;
    [MatrixColumn(3)]
    public dvec4 C3;
}

[Vector]
public partial struct dvec2
{
    [VectorComponent(0)]
    public double X;
    [VectorComponent(1)]
    public double Y;
}

[Vector]
public partial struct dvec3
{
    [VectorComponent(0)]
    public double X;
    [VectorComponent(1)]
    public double Y;
    [VectorComponent(2)]
    public double Z;
}

[Vector]
public partial struct dvec4
{
    [VectorComponent(0)]
    public double X;
    [VectorComponent(1)]
    public double Y;
    [VectorComponent(2)]
    public double Z;
    [VectorComponent(3)]
    public double W;
}

[Vector]
public partial struct ivec2
{
    [VectorComponent(0)]
    public int X;
    [VectorComponent(1)]
    public int Y;
}

[Vector]
public partial struct ivec3
{
    [VectorComponent(0)]
    public int X;
    [VectorComponent(1)]
    public int Y;
    [VectorComponent(2)]
    public int Z;
}

[Vector]
public partial struct ivec4
{
    [VectorComponent(0)]
    public int X;
    [VectorComponent(1)]
    public int Y;
    [VectorComponent(2)]
    public int Z;
    [VectorComponent(3)]
    public int W;
}

[Matrix]
public partial struct mat2
{
    [MatrixColumn(0)]
    public vec2 C0;
    [MatrixColumn(1)]
    public vec2 C1;
}

[Matrix]
public partial struct mat2x2
{
    [MatrixColumn(0)]
    public vec2 C0;
    [MatrixColumn(1)]
    public vec2 C1;
}

[Matrix]
public partial struct mat2x3
{
    [MatrixColumn(0)]
    public vec3 C0;
    [MatrixColumn(1)]
    public vec3 C1;
}

[Matrix]
public partial struct mat2x4
{
    [MatrixColumn(0)]
    public vec4 C0;
    [MatrixColumn(1)]
    public vec4 C1;
}

[Matrix]
public partial struct mat3
{
    [MatrixColumn(0)]
    public vec3 C0;
    [MatrixColumn(1)]
    public vec3 C1;
    [MatrixColumn(2)]
    public vec3 C2;
}

[Matrix]
public partial struct mat3x2
{
    [MatrixColumn(0)]
    public vec2 C0;
    [MatrixColumn(1)]
    public vec2 C1;
    [MatrixColumn(2)]
    public vec2 C2;
}

[Matrix]
public partial struct mat3x3
{
    [MatrixColumn(0)]
    public vec3 C0;
    [MatrixColumn(1)]
    public vec3 C1;
    [MatrixColumn(2)]
    public vec3 C2;
}

[Matrix]
public partial struct mat3x4
{
    [MatrixColumn(0)]
    public vec4 C0;
    [MatrixColumn(1)]
    public vec4 C1;
    [MatrixColumn(2)]
    public vec4 C2;
}

[Matrix]
public partial struct mat4
{
    [MatrixColumn(0)]
    public vec4 C0;
    [MatrixColumn(1)]
    public vec4 C1;
    [MatrixColumn(2)]
    public vec4 C2;
    [MatrixColumn(3)]
    public vec4 C3;
}

[Matrix]
public partial struct mat4x2
{
    [MatrixColumn(0)]
    public vec2 C0;
    [MatrixColumn(1)]
    public vec2 C1;
    [MatrixColumn(2)]
    public vec2 C2;
    [MatrixColumn(3)]
    public vec2 C3;
}

[Matrix]
public partial struct mat4x3
{
    [MatrixColumn(0)]
    public vec3 C0;
    [MatrixColumn(1)]
    public vec3 C1;
    [MatrixColumn(2)]
    public vec3 C2;
    [MatrixColumn(3)]
    public vec3 C3;
}

[Matrix]
public partial struct mat4x4
{
    [MatrixColumn(0)]
    public vec4 C0;
    [MatrixColumn(1)]
    public vec4 C1;
    [MatrixColumn(2)]
    public vec4 C2;
    [MatrixColumn(3)]
    public vec4 C3;
}

[Vector]
public partial struct uvec2
{
    [VectorComponent(0)]
    public uint X;
    [VectorComponent(1)]
    public uint Y;
}

[Vector]
public partial struct uvec3
{
    [VectorComponent(0)]
    public uint X;
    [VectorComponent(1)]
    public uint Y;
    [VectorComponent(2)]
    public uint Z;
}

[Vector]
public partial struct uvec4
{
    [VectorComponent(0)]
    public uint X;
    [VectorComponent(1)]
    public uint Y;
    [VectorComponent(2)]
    public uint Z;
    [VectorComponent(3)]
    public uint W;
}

[Vector]
public partial struct vec2
{
    [VectorComponent(0)]
    public float X;
    [VectorComponent(1)]
    public float Y;
}

[Vector]
public partial struct vec3
{
    [VectorComponent(0)]
    public float X;
    [VectorComponent(1)]
    public float Y;
    [VectorComponent(2)]
    public float Z;
}

[Vector]
public partial struct vec4
{
    [VectorComponent(0)]
    public float X;
    [VectorComponent(1)]
    public float Y;
    [VectorComponent(2)]
    public float Z;
    [VectorComponent(3)]
    public float W;
}
```

> [!NOTE]
> The listings show what the package declares. Not every concept is lowered by every output target.

## The other syntaxes

```buttons
[HLSL](hlsl.md)
[MSL](msl.md)
[SPIR-V](spirv.md)
[WGSL](wgsl.md)
```

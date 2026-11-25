---
title: MSL syntax API
summary: Every attribute and type of the YotsubaShader.MslSyntax package, with its declaration, its concept and an example.
order: 3
---

API of the `YotsubaShader.MslSyntax` package: the 32 attributes and the types of the MSL syntax, inspired by **Metal Shading Language**. Each entry shows the declaration as the package writes it, the concept the compiler reads from it, the same concept in the other four syntaxes, and an example.

Add the package to the shader project:

```bash
dotnet add package YotsubaShader.MslSyntax
```

For a guided tour of the syntax, with every built-in value grouped by stage, see the [MSL syntax](../reference/msl.md) page of the Documentation.

## Namespaces

The package splits its API in these namespaces. The attributes shared by every syntax (`ShaderStage`, `Location`, `Uniform`...) are in `YotsubaShader.Language`.

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax; // Built-in values, interface slots and method attributes
using YotsubaShader.MslSyntax.Resources; // Resource attributes and resource types
using YotsubaShader.MslSyntax.Resources.Types; // Texture and sampler types
using YotsubaShader.MslSyntax.Types; // Vector, matrix and helper types
```

## Input attributes

Fields, parameters and properties that receive a value from the pipeline.

### attribute

Vertex input read from the attribute `n`, `[[attribute(n)]]` in Metal.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[Location]
public class attribute(int n) : YotsubaShaderConcept
{
    public int N;
}
```

- **Namespace:** `YotsubaShader.MslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `Location`
- **Same concept in:** HLSL [SV_Target](hlsl.md#sv-target) · GLSL [location](glsl.md#location) · SPIR-V [Location](spirv.md#location) · WGSL [@location](wgsl.md#location)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;
using YotsubaShader.MslSyntax.Types;

// Fragment stage input
public struct FragmentInput
{
    [attribute(0)] public float4 Color;
}
```

### barycentric_coord

Barycentric coordinates of the fragment inside its triangle.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[BarycentricCoordinates]
public class barycentric_coord : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.MslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `BarycentricCoordinates`
- **Same concept in:** HLSL [SV_Barycentrics](hlsl.md#sv-barycentrics) · GLSL [gl_BaryCoordEXT](glsl.md#gl-barycoordext) · SPIR-V [BuiltIn_BaryCoord](spirv.md#builtin-barycoord)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;
using YotsubaShader.MslSyntax.Types;

// Fragment stage input
public struct FragmentInput
{
    [barycentric_coord] public float3 Barycentrics;
}
```

### base_instance

Base instance of the draw call.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[BaseInstance]
public class base_instance : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.MslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `BaseInstance`
- **Same concept in:** HLSL [SV_StartInstanceLocation](hlsl.md#sv-startinstancelocation) · GLSL [gl_BaseInstance](glsl.md#gl-baseinstance) · SPIR-V [BuiltIn_BaseInstance](spirv.md#builtin-baseinstance)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;

// Vertex stage input
public struct VertexInput
{
    [base_instance] public uint BaseInstance;
}
```

### base_vertex

Base vertex of the draw call.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[BaseVertex]
public class base_vertex : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.MslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `BaseVertex`
- **Same concept in:** HLSL [SV_StartVertexLocation](hlsl.md#sv-startvertexlocation) · GLSL [gl_BaseVertex](glsl.md#gl-basevertex) · SPIR-V [BuiltIn_BaseVertex](spirv.md#builtin-basevertex)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;

// Vertex stage input
public struct VertexInput
{
    [base_vertex] public uint BaseVertex;
}
```

### front_facing

`true` when the fragment belongs to a front-facing primitive.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[FrontFacingFlag]
public class front_facing : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.MslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `FrontFacingFlag`
- **Same concept in:** HLSL [SV_IsFrontFace](hlsl.md#sv-isfrontface) · GLSL [gl_FrontFacing](glsl.md#gl-frontfacing) · SPIR-V [BuiltIn_FrontFacing](spirv.md#builtin-frontfacing) · WGSL [@builtin_front_facing](wgsl.md#builtin-front-facing)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;

// Fragment stage input
public struct FragmentInput
{
    [front_facing] public bool IsFrontFace;
}
```

### instance_id

Index of the instance being drawn.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[InstanceIndex]
public class instance_id : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.MslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `InstanceIndex`
- **Same concept in:** HLSL [SV_InstanceID](hlsl.md#sv-instanceid) · GLSL [gl_InstanceIndex](glsl.md#gl-instanceindex) · SPIR-V [BuiltIn_InstanceIndex](spirv.md#builtin-instanceindex) · WGSL [@builtin_instance_index](wgsl.md#builtin-instance-index)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;

// Vertex stage input
public struct VertexInput
{
    [instance_id] public uint InstanceIndex;
}
```

### primitive_id

Index of the primitive the fragment belongs to.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[PrimitiveIndex]
public class primitive_id : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.MslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `PrimitiveIndex`
- **Same concept in:** HLSL [SV_PrimitiveID](hlsl.md#sv-primitiveid) · GLSL [gl_PrimitiveID](glsl.md#gl-primitiveid) · SPIR-V [BuiltIn_PrimitiveId](spirv.md#builtin-primitiveid) · WGSL [@builtin_primitive_index](wgsl.md#builtin-primitive-index)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;

// Fragment stage input
public struct FragmentInput
{
    [primitive_id] public uint PrimitiveId;
}
```

### sample_id

Index of the sample being shaded (multisampling).

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[SampleIndex]
public class sample_id : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.MslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `SampleIndex`
- **Same concept in:** HLSL [SV_SampleIndex](hlsl.md#sv-sampleindex) · GLSL [gl_SampleID](glsl.md#gl-sampleid) · SPIR-V [BuiltIn_SampleId](spirv.md#builtin-sampleid) · WGSL [@builtin_sample_index](wgsl.md#builtin-sample-index)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;

// Fragment stage input
public struct FragmentInput
{
    [sample_id] public uint SampleIndex;
}
```

### simdgroup_index_in_threadgroup

Index of the subgroup inside the workgroup.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[SubgroupId]
public class simdgroup_index_in_threadgroup : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.MslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `SubgroupId`
- **Same concept in:** GLSL [gl_SubgroupID](glsl.md#gl-subgroupid) · SPIR-V [BuiltIn_SubgroupId](spirv.md#builtin-subgroupid) · WGSL [@builtin_subgroup_id](wgsl.md#builtin-subgroup-id)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;

// Compute stage input
public struct ComputeInput
{
    [simdgroup_index_in_threadgroup] public uint SubgroupId;
}
```

### simdgroups_per_threadgroup

Number of subgroups in the workgroup.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[NumberOfSubgroups]
public class simdgroups_per_threadgroup : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.MslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `NumberOfSubgroups`
- **Same concept in:** GLSL [gl_NumSubgroups](glsl.md#gl-numsubgroups) · SPIR-V [BuiltIn_NumSubgroups](spirv.md#builtin-numsubgroups) · WGSL [@builtin_num_subgroups](wgsl.md#builtin-num-subgroups)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;

// Compute stage input
public struct ComputeInput
{
    [simdgroups_per_threadgroup] public uint SubgroupCount;
}
```

### thread_index_in_simdgroup

Index of the invocation inside its subgroup.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[SubgroupInvocationId]
public class thread_index_in_simdgroup : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.MslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `SubgroupInvocationId`
- **Same concept in:** GLSL [gl_SubgroupInvocationID](glsl.md#gl-subgroupinvocationid) · SPIR-V [BuiltIn_SubgroupInvocationId](spirv.md#builtin-subgroupinvocationid) · WGSL [@builtin_subgroup_invocation_id](wgsl.md#builtin-subgroup-invocation-id)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;

// Compute stage input
public struct ComputeInput
{
    [thread_index_in_simdgroup] public uint SubgroupLane;
}
```

### thread_index_in_threadgroup

Flattened index of the invocation inside its workgroup.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[LocalInvocationIndex]
public class thread_index_in_threadgroup : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.MslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `LocalInvocationIndex`
- **Same concept in:** HLSL [SV_GroupIndex](hlsl.md#sv-groupindex) · GLSL [gl_LocalInvocationIndex](glsl.md#gl-localinvocationindex) · SPIR-V [BuiltIn_LocalInvocationIndex](spirv.md#builtin-localinvocationindex) · WGSL [@builtin_local_invocation_index](wgsl.md#builtin-local-invocation-index)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;

// Compute stage input
public struct ComputeInput
{
    [thread_index_in_threadgroup] public uint LocalIndex;
}
```

### thread_position_in_grid

Position of the invocation in the whole dispatch.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[GlobalInvocationId]
public class thread_position_in_grid : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.MslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `GlobalInvocationId`
- **Same concept in:** HLSL [SV_DispatchThreadID](hlsl.md#sv-dispatchthreadid) · GLSL [gl_GlobalInvocationID](glsl.md#gl-globalinvocationid) · SPIR-V [BuiltIn_GlobalInvocationId](spirv.md#builtin-globalinvocationid) · WGSL [@builtin_global_invocation_id](wgsl.md#builtin-global-invocation-id)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;
using YotsubaShader.MslSyntax.Types;

// Compute stage input
public struct ComputeInput
{
    [thread_position_in_grid] public uint3 GlobalId;
}
```

### thread_position_in_threadgroup

Position of the invocation inside its workgroup.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[LocalInvocationId]
public class thread_position_in_threadgroup : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.MslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `LocalInvocationId`
- **Same concept in:** HLSL [SV_GroupThreadID](hlsl.md#sv-groupthreadid) · GLSL [gl_LocalInvocationID](glsl.md#gl-localinvocationid) · SPIR-V [BuiltIn_LocalInvocationId](spirv.md#builtin-localinvocationid) · WGSL [@builtin_local_invocation_id](wgsl.md#builtin-local-invocation-id)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;
using YotsubaShader.MslSyntax.Types;

// Compute stage input
public struct ComputeInput
{
    [thread_position_in_threadgroup] public uint3 LocalId;
}
```

### threadgroup_position_in_grid

Position of the workgroup in the dispatch.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[WorkgroupId]
public class threadgroup_position_in_grid : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.MslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `WorkgroupId`
- **Same concept in:** HLSL [SV_GroupID](hlsl.md#sv-groupid) · GLSL [gl_WorkGroupID](glsl.md#gl-workgroupid) · SPIR-V [BuiltIn_WorkgroupId](spirv.md#builtin-workgroupid) · WGSL [@builtin_workgroup_id](wgsl.md#builtin-workgroup-id)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;
using YotsubaShader.MslSyntax.Types;

// Compute stage input
public struct ComputeInput
{
    [threadgroup_position_in_grid] public uint3 GroupId;
}
```

### threadgroups_per_grid

Number of workgroups of the dispatch.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[NumberOfWorkgroups]
public class threadgroups_per_grid : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.MslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `NumberOfWorkgroups`
- **Same concept in:** GLSL [gl_NumWorkGroups](glsl.md#gl-numworkgroups) · SPIR-V [BuiltIn_NumWorkgroups](spirv.md#builtin-numworkgroups) · WGSL [@builtin_num_workgroups](wgsl.md#builtin-num-workgroups)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;
using YotsubaShader.MslSyntax.Types;

// Compute stage input
public struct ComputeInput
{
    [threadgroups_per_grid] public uint3 GroupCount;
}
```

### threads_per_simdgroup

Number of invocations in a subgroup.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[SubgroupSize]
public class threads_per_simdgroup : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.MslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `SubgroupSize`
- **Same concept in:** GLSL [gl_SubgroupSize](glsl.md#gl-subgroupsize) · SPIR-V [BuiltIn_SubgroupSize](spirv.md#builtin-subgroupsize) · WGSL [@builtin_subgroup_size](wgsl.md#builtin-subgroup-size)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;

// Compute stage input
public struct ComputeInput
{
    [threads_per_simdgroup] public uint SubgroupSize;
}
```

### threads_per_threadgroup

Size of the workgroup, read as a value.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[WorkgroupSizeBuiltInValue]
public class threads_per_threadgroup : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.MslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `WorkgroupSizeBuiltInValue`
- **Same concept in:** GLSL [gl_WorkGroupSize](glsl.md#gl-workgroupsize) · SPIR-V [BuiltIn_WorkgroupSize](spirv.md#builtin-workgroupsize)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;
using YotsubaShader.MslSyntax.Types;

// Compute stage input
public struct ComputeInput
{
    [threads_per_threadgroup] public uint3 GroupSize;
}
```

### vertex_id

Index of the vertex being processed.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[VertexIndex]
public class vertex_id() : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.MslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `VertexIndex`
- **Same concept in:** HLSL [SV_VertexID](hlsl.md#sv-vertexid) · GLSL [gl_VertexIndex](glsl.md#gl-vertexindex) · SPIR-V [BuiltIn_VertexIndex](spirv.md#builtin-vertexindex) · WGSL [@builtin_vertex_index](wgsl.md#builtin-vertex-index)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;

// Vertex stage input
public struct VertexInput
{
    [vertex_id] public uint VertexIndex;
}
```

## Output attributes

Fields, parameters and return values that the stage produces.

### clip_distance

Clip distance: a negative value clips the primitive against a user plane.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.Output)]
[ClipInstance]
public class clip_distance : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.MslSyntax`
- **Applies to:** fields, parameters, return values
- **Concept:** `ClipInstance`
- **Same concept in:** HLSL [SV_ClipDistanceN](hlsl.md#sv-clipdistancen) · GLSL [gl_ClipDistance](glsl.md#gl-clipdistance) · SPIR-V [BuiltIn_ClipDistance](spirv.md#builtin-clipdistance) · WGSL [@builtin_clip_distances](wgsl.md#builtin-clip-distances)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;

// Vertex stage output
public struct VertexOutput
{
    [clip_distance] public float ClipDistance;
}
```

### color

Fragment output written to the color attachment `n`, `[[color(n)]]` in Metal.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.Output)]
[Location]
public class color(int n = 0) : YotsubaShaderConcept
{
    public int N;
}
```

- **Namespace:** `YotsubaShader.MslSyntax`
- **Applies to:** fields, parameters, return values
- **Concept:** `Location`
- **Same concept in:** HLSL [SV_Target](hlsl.md#sv-target) · GLSL [location](glsl.md#location) · SPIR-V [Location](spirv.md#location) · WGSL [@location](wgsl.md#location)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;
using YotsubaShader.MslSyntax.Types;

// Fragment stage output
public struct FragmentOutput
{
    [color] public float4 Color;
}
```

### depth

Fragment depth output. The mode `"any"` (default) writes any depth; `"greater"` and `"less"` are conservative depth.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.Output)]
[FragDepth, ConservativeDepth]
public class depth(string mode = "any") : YotsubaShaderConcept
{
    public string Mode { get; }
}
```

- **Namespace:** `YotsubaShader.MslSyntax`
- **Applies to:** fields, parameters, return values
- **Concept:** `FragDepth`, `ConservativeDepth`
- **Same concept in:** HLSL [SV_Depth](hlsl.md#sv-depth), [SV_DepthGreaterEqual](hlsl.md#sv-depthgreaterequal), [SV_DepthLessEqual](hlsl.md#sv-depthlessequal) · GLSL [gl_FragDepth](glsl.md#gl-fragdepth) · SPIR-V [BuiltIn_FragDepth](spirv.md#builtin-fragdepth) · WGSL [@builtin_frag_depth](wgsl.md#builtin-frag-depth)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;

// Fragment stage output
public struct FragmentOutput
{
    [depth] public float Depth;
}
```

### stencil

Stencil reference value written by the fragment stage.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.Output)]
[StencilReference]
public class stencil : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.MslSyntax`
- **Applies to:** fields, parameters, return values
- **Concept:** `StencilReference`
- **Same concept in:** HLSL [SV_StencilRef](hlsl.md#sv-stencilref) · GLSL [gl_FragStencilRefARB](glsl.md#gl-fragstencilrefarb) · SPIR-V [BuiltIn_FragStencilRef](spirv.md#builtin-fragstencilref)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;

// Fragment stage output
public struct FragmentOutput
{
    [stencil] public uint StencilRef;
}
```

## Input and output attributes

Values that a stage can receive or produce. The stage decides which.

### position

Clip-space position written by the vertex stage.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[ClipSpacePosition, FragmentCoordinate]
public class position : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.MslSyntax`
- **Applies to:** fields, parameters, properties, return values
- **Concept:** `ClipSpacePosition`, `FragmentCoordinate`
- **Same concept in:** HLSL [SV_Position](hlsl.md#sv-position), [SV_POSITION](hlsl.md#sv-position) · GLSL [gl_Position](glsl.md#gl-position), [gl_FragCoord](glsl.md#gl-fragcoord) · SPIR-V [BuiltIn_Position](spirv.md#builtin-position), [BuiltIn_FragCoord](spirv.md#builtin-fragcoord) · WGSL [@builtin_position](wgsl.md#builtin-position)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;
using YotsubaShader.MslSyntax.Types;

// Vertex stage output
public struct VertexOutput
{
    [position] public float4 Position;
}
```

### render_target_array_index

Layer of a layered render target that receives the primitive.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[RenderTargetLayer]
public class render_target_array_index : RenderTargetLayer;
```

- **Namespace:** `YotsubaShader.MslSyntax`
- **Applies to:** fields, parameters, properties, return values
- **Concept:** `RenderTargetLayer`
- **Same concept in:** HLSL [SV_RenderTargetArrayIndex](hlsl.md#sv-rendertargetarrayindex) · GLSL [gl_Layer](glsl.md#gl-layer) · SPIR-V [BuiltIn_Layer](spirv.md#builtin-layer)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;

// Vertex stage output
public struct VertexOutput
{
    [render_target_array_index] public uint Layer;
}
```

### sample_mask

Coverage mask of the samples of the fragment.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[SampleMask]
public class sample_mask : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.MslSyntax`
- **Applies to:** fields, parameters, properties, return values
- **Concept:** `SampleMask`
- **Same concept in:** HLSL [SV_Coverage](hlsl.md#sv-coverage) · GLSL [gl_SampleMask](glsl.md#gl-samplemask), [gl_SampleMaskIn](glsl.md#gl-samplemaskin) · SPIR-V [BuiltIn_SampleMask](spirv.md#builtin-samplemask) · WGSL [@builtin_sample_mask](wgsl.md#builtin-sample-mask)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;

// Fragment stage input
public struct FragmentInput
{
    [sample_mask] public uint SampleMask;
}
```

### viewport_array_index

Viewport that receives the primitive.

```csharp
namespace YotsubaShader.MslSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[ViewportIndex]
public class viewport_array_index : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.MslSyntax`
- **Applies to:** fields, parameters, properties, return values
- **Concept:** `ViewportIndex`
- **Same concept in:** HLSL [SV_ViewportArrayIndex](hlsl.md#sv-viewportarrayindex) · GLSL [gl_ViewportIndex](glsl.md#gl-viewportindex) · SPIR-V [BuiltIn_ViewportIndex](spirv.md#builtin-viewportindex)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;

// Vertex stage output
public struct VertexOutput
{
    [viewport_array_index] public uint ViewportIndex;
}
```

## Resource attributes

Uniform buffers, storage buffers and the binding slots of buffers, textures and samplers.

### buffer

Buffer argument table slot, `[[buffer(n)]]` in Metal.

```csharp
namespace YotsubaShader.MslSyntax.Resources;

[AttributeUsage(AttributeUsagesTable.Resource)]
[BindingSlot]
public class buffer(int n) : YotsubaShaderConcept
{
    public int N;
}
```

- **Namespace:** `YotsubaShader.MslSyntax.Resources`
- **Applies to:** fields, parameters, properties
- **Concept:** `BindingSlot`
- **Same concept in:** HLSL [register](hlsl.md#register) · GLSL [layout](glsl.md#layout) · SPIR-V [Binding](spirv.md#binding), [DescriptorSet](spirv.md#descriptorset) · WGSL [@binding](wgsl.md#binding), [@group](wgsl.md#group)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;
using YotsubaShader.MslSyntax.Resources;

public struct Material
{
    // The contents of the uniform buffer
    public float Exposure;
}

public class Resources
{
    [constant, buffer(0)]
    public Material Material;
}
```

### constant

Marks the field as a uniform (constant) buffer.

```csharp
namespace YotsubaShader.MslSyntax.Resources;

[AttributeUsage(AttributeUsagesTable.Resource)]
[UniformBuffer]
public class constant : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.MslSyntax.Resources`
- **Applies to:** fields, parameters, properties
- **Concept:** `UniformBuffer`
- **Same concept in:** HLSL [cbuffer](hlsl.md#cbuffer) · GLSL [uniform](glsl.md#uniform) · SPIR-V [Uniform](spirv.md#uniform) · WGSL [uniform](wgsl.md#uniform)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;
using YotsubaShader.MslSyntax.Resources;

public struct Material
{
    // The contents of the uniform buffer
    public float Exposure;
}

public class Resources
{
    [constant, buffer(0)]
    public Material Material;
}
```

### device

Storage buffer in the `device` address space. `readOnly: true` makes it read-only.

```csharp
namespace YotsubaShader.MslSyntax.Resources;

[AttributeUsage(AttributeUsagesTable.Resource)]
[RWStorageBuffer, ReadOnlyStorageBuffer]
public class device(bool readOnly = false) : YotsubaShaderConcept
{
    public bool ReadOnly;
}
```

- **Namespace:** `YotsubaShader.MslSyntax.Resources`
- **Applies to:** fields, parameters, properties
- **Concept:** `RWStorageBuffer`, `ReadOnlyStorageBuffer`
- **Same concept in:** GLSL [buffer](glsl.md#buffer) · SPIR-V [StorageBuffer](spirv.md#storagebuffer) · WGSL [storage](wgsl.md#storage)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;
using YotsubaShader.MslSyntax.Resources;

public class Resources
{
    [device, buffer(1)]
    public float[] Output;
}
```

### sampler

Sampler argument table slot, `[[sampler(n)]]` in Metal.

```csharp
namespace YotsubaShader.MslSyntax.Resources;

[AttributeUsage(AttributeUsagesTable.Resource)]
[BindingSlot, SamplerSlot]
public class sampler(int n) : YotsubaShaderConcept
{
    public int N;
}
```

- **Namespace:** `YotsubaShader.MslSyntax.Resources`
- **Applies to:** fields, parameters, properties
- **Concept:** `BindingSlot`, `SamplerSlot`
- **Same concept in:** HLSL [register](hlsl.md#register) · GLSL [layout](glsl.md#layout) · SPIR-V [Binding](spirv.md#binding), [DescriptorSet](spirv.md#descriptorset) · WGSL [@binding](wgsl.md#binding), [@group](wgsl.md#group)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;
using YotsubaShader.MslSyntax.Resources;
using YotsubaShader.MslSyntax.Resources.Types;

public class Surface
{
    [sampler(0)]
    public sampler Sampler;
}
```

### texture

Texture argument table slot, `[[texture(n)]]` in Metal.

```csharp
namespace YotsubaShader.MslSyntax.Resources;

[AttributeUsage(AttributeUsagesTable.Resource)]
[BindingSlot, TextureSlot]
public class texture(int n) : YotsubaShaderConcept
{
    public int N;
}
```

- **Namespace:** `YotsubaShader.MslSyntax.Resources`
- **Applies to:** fields, parameters, properties
- **Concept:** `BindingSlot`, `TextureSlot`
- **Same concept in:** HLSL [register](hlsl.md#register) · GLSL [layout](glsl.md#layout) · SPIR-V [Binding](spirv.md#binding), [DescriptorSet](spirv.md#descriptorset) · WGSL [@binding](wgsl.md#binding), [@group](wgsl.md#group)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;
using YotsubaShader.MslSyntax.Resources;
using YotsubaShader.MslSyntax.Resources.Types;

public class Surface
{
    [texture(0)]
    public texture2d<float> Albedo;
}
```

## Types

The types declared by the package. Members are listed without their bodies.

### Texture and sampler types

```csharp
namespace YotsubaShader.MslSyntax.Resources.Types;

[Texture(TextureDimension.D2, TextureComponentTypes.GenericDefine, Depth = TextureDepth.Yes)]
public class depth2d<T> where T : unmanaged;

[Texture(TextureDimension.D2, TextureComponentTypes.GenericDefine, Depth = TextureDepth.Yes, Arrayed = true)]
public struct depth2d_array<T> where T : unmanaged;

[Texture(TextureDimension.Cube, TextureComponentTypes.GenericDefine, Depth = TextureDepth.Yes)]
public struct depthcube<T> where T : unmanaged;

[Texture(TextureDimension.Cube, TextureComponentTypes.GenericDefine, Depth = TextureDepth.Yes, Arrayed = true)]
public struct depthcube_array<T> where T : unmanaged;

[Sampler]
public struct sampler;

[Texture(TextureDimension.D1, TextureComponentTypes.GenericDefine)]
public struct texture1d<T> where T : unmanaged;

[Texture(TextureDimension.D1, TextureComponentTypes.GenericDefine, Arrayed = true)]
public struct texture1d_array<T> where T : unmanaged;

[Texture(TextureDimension.D2, TextureComponentTypes.GenericDefine)]
public struct texture2d<T> where T : unmanaged;

[Texture(TextureDimension.D2, TextureComponentTypes.GenericDefine, Arrayed = true)]
public struct texture2d_array<T> where T : unmanaged;

[Texture(TextureDimension.D2, TextureComponentTypes.GenericDefine, Multisampled = true)]
public struct texture2d_ms<T> where T : unmanaged;

[Texture(TextureDimension.D3, TextureComponentTypes.GenericDefine)]
public struct texture3d<T> where T : unmanaged;

[Texture(TextureDimension.Cube, TextureComponentTypes.GenericDefine)]
public struct texturecube<T> where T : unmanaged;

[Texture(TextureDimension.Cube, TextureComponentTypes.GenericDefine, Arrayed = true)]
public struct texturecube_array<T> where T : unmanaged;
```

### Vector, matrix and helper types

```csharp
namespace YotsubaShader.MslSyntax.Types;

[IntrinsicOption]
public struct bias
{
    public float Value;
    public bias(float value);
}

[Vector]
public partial struct bool2
{
    [VectorComponent(0)]
    public bool X;
    [VectorComponent(1)]
    public bool Y;
}

[Vector]
public partial struct bool3
{
    [VectorComponent(0)]
    public bool X;
    [VectorComponent(1)]
    public bool Y;
    [VectorComponent(2)]
    public bool Z;
}

[Vector]
public partial struct bool4
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

[IntrinsicOption]
public struct component
{
    public int Value;
    public component(int value);
}

[Vector]
public partial struct float2
{
    [VectorComponent(0)]
    public float X;
    [VectorComponent(1)]
    public float Y;
}

[Matrix]
public partial struct float2x2
{
    [MatrixColumn(0)]
    public float2 C0;
    [MatrixColumn(1)]
    public float2 C1;
}

[Matrix]
public partial struct float2x3
{
    [MatrixColumn(0)]
    public float3 C0;
    [MatrixColumn(1)]
    public float3 C1;
}

[Matrix]
public partial struct float2x4
{
    [MatrixColumn(0)]
    public float4 C0;
    [MatrixColumn(1)]
    public float4 C1;
}

[Vector]
public partial struct float3
{
    [VectorComponent(0)]
    public float X;
    [VectorComponent(1)]
    public float Y;
    [VectorComponent(2)]
    public float Z;
}

[Matrix]
public partial struct float3x2
{
    [MatrixColumn(0)]
    public float2 C0;
    [MatrixColumn(1)]
    public float2 C1;
    [MatrixColumn(2)]
    public float2 C2;
}

[Matrix]
public partial struct float3x3
{
    [MatrixColumn(0)]
    public float3 C0;
    [MatrixColumn(1)]
    public float3 C1;
    [MatrixColumn(2)]
    public float3 C2;
}

[Matrix]
public partial struct float3x4
{
    [MatrixColumn(0)]
    public float4 C0;
    [MatrixColumn(1)]
    public float4 C1;
    [MatrixColumn(2)]
    public float4 C2;
}

[Vector]
public partial struct float4
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

[Matrix]
public partial struct float4x2
{
    [MatrixColumn(0)]
    public float2 C0;
    [MatrixColumn(1)]
    public float2 C1;
    [MatrixColumn(2)]
    public float2 C2;
    [MatrixColumn(3)]
    public float2 C3;
}

[Matrix]
public partial struct float4x3
{
    [MatrixColumn(0)]
    public float3 C0;
    [MatrixColumn(1)]
    public float3 C1;
    [MatrixColumn(2)]
    public float3 C2;
    [MatrixColumn(3)]
    public float3 C3;
}

[Matrix]
public partial struct float4x4
{
    [MatrixColumn(0)]
    public float4 C0;
    [MatrixColumn(1)]
    public float4 C1;
    [MatrixColumn(2)]
    public float4 C2;
    [MatrixColumn(3)]
    public float4 C3;
}

[IntrinsicOption]
public struct gradient2d
{
    public float2 DX;
    public float2 DY;
    public gradient2d(float2 dx, float2 dy);
}

[IntrinsicOption]
public struct gradient3d
{
    public float3 DX;
    public float3 DY;
    public gradient3d(float3 dx, float3 dy);
}

[IntrinsicOption]
public struct gradientcube
{
    public float3 DX;
    public float3 DY;
    public gradientcube(float3 dx, float3 dy);
}

[Vector]
public partial struct half2
{
    [VectorComponent(0)]
    public System.Half X;
    [VectorComponent(1)]
    public System.Half Y;
}

[Matrix]
public partial struct half2x2
{
    [MatrixColumn(0)]
    public half2 C0;
    [MatrixColumn(1)]
    public half2 C1;
}

[Matrix]
public partial struct half2x3
{
    [MatrixColumn(0)]
    public half3 C0;
    [MatrixColumn(1)]
    public half3 C1;
}

[Matrix]
public partial struct half2x4
{
    [MatrixColumn(0)]
    public half4 C0;
    [MatrixColumn(1)]
    public half4 C1;
}

[Vector]
public partial struct half3
{
    [VectorComponent(0)]
    public System.Half X;
    [VectorComponent(1)]
    public System.Half Y;
    [VectorComponent(2)]
    public System.Half Z;
}

[Matrix]
public partial struct half3x2
{
    [MatrixColumn(0)]
    public half2 C0;
    [MatrixColumn(1)]
    public half2 C1;
    [MatrixColumn(2)]
    public half2 C2;
}

[Matrix]
public partial struct half3x3
{
    [MatrixColumn(0)]
    public half3 C0;
    [MatrixColumn(1)]
    public half3 C1;
    [MatrixColumn(2)]
    public half3 C2;
}

[Matrix]
public partial struct half3x4
{
    [MatrixColumn(0)]
    public half4 C0;
    [MatrixColumn(1)]
    public half4 C1;
    [MatrixColumn(2)]
    public half4 C2;
}

[Vector]
public partial struct half4
{
    [VectorComponent(0)]
    public System.Half X;
    [VectorComponent(1)]
    public System.Half Y;
    [VectorComponent(2)]
    public System.Half Z;
    [VectorComponent(3)]
    public System.Half W;
}

[Matrix]
public partial struct half4x2
{
    [MatrixColumn(0)]
    public half2 C0;
    [MatrixColumn(1)]
    public half2 C1;
    [MatrixColumn(2)]
    public half2 C2;
    [MatrixColumn(3)]
    public half2 C3;
}

[Matrix]
public partial struct half4x3
{
    [MatrixColumn(0)]
    public half3 C0;
    [MatrixColumn(1)]
    public half3 C1;
    [MatrixColumn(2)]
    public half3 C2;
    [MatrixColumn(3)]
    public half3 C3;
}

[Matrix]
public partial struct half4x4
{
    [MatrixColumn(0)]
    public half4 C0;
    [MatrixColumn(1)]
    public half4 C1;
    [MatrixColumn(2)]
    public half4 C2;
    [MatrixColumn(3)]
    public half4 C3;
}

[Vector]
public partial struct int2
{
    [VectorComponent(0)]
    public int X;
    [VectorComponent(1)]
    public int Y;
}

[Vector]
public partial struct int3
{
    [VectorComponent(0)]
    public int X;
    [VectorComponent(1)]
    public int Y;
    [VectorComponent(2)]
    public int Z;
}

[Vector]
public partial struct int4
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

[IntrinsicOption]
public struct level
{
    public float Value;
    public level(float value);
}

[Vector]
public partial struct uint2
{
    [VectorComponent(0)]
    public uint X;
    [VectorComponent(1)]
    public uint Y;
}

[Vector]
public partial struct uint3
{
    [VectorComponent(0)]
    public uint X;
    [VectorComponent(1)]
    public uint Y;
    [VectorComponent(2)]
    public uint Z;
}

[Vector]
public partial struct uint4
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
public struct vec4<T> where T : unmanaged
{
    [VectorComponent(0)]
    public T X;
    [VectorComponent(1)]
    public T Y;
    [VectorComponent(2)]
    public T Z;
    [VectorComponent(3)]
    public T W;
}
```

> [!NOTE]
> The listings show what the package declares. Not every concept is lowered by every output target.

## The other syntaxes

```buttons
[HLSL](hlsl.md)
[GLSL](glsl.md)
[SPIR-V](spirv.md)
[WGSL](wgsl.md)
```

---
title: SPIR-V syntax API
summary: Every attribute and type of the YotsubaShader.SpirvSyntax package, with its declaration, its concept and an example.
order: 4
---

API of the `YotsubaShader.SpirvSyntax` package: the 34 attributes and the types of the SPIR-V syntax, inspired by **SPIR-V (Vulkan)**. Each entry shows the declaration as the package writes it, the concept the compiler reads from it, the same concept in the other four syntaxes, and an example.

Add the package to the shader project:

```bash
dotnet add package YotsubaShader.SpirvSyntax
```

For a guided tour of the syntax, with every built-in value grouped by stage, see the [SPIR-V syntax](../reference/spirv.md) page of the Documentation.

## Namespaces

The package splits its API in these namespaces. The attributes shared by every syntax (`ShaderStage`, `Location`, `Uniform`...) are in `YotsubaShader.Language`.

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax; // Built-in values, interface slots and method attributes
using YotsubaShader.SpirvSyntax.Resources; // Resource attributes and resource types
using YotsubaShader.SpirvSyntax.Resources.Type; // Vector, matrix and helper types
using YotsubaShader.SpirvSyntax.Resources.Types; // Texture and sampler types
using YotsubaShader.SpirvSyntax.Types; // Vector, matrix and helper types
```

## Input attributes

Fields, parameters and properties that receive a value from the pipeline.

### BuiltIn_BaryCoord

Barycentric coordinates of the fragment inside its triangle.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[BarycentricCoordinates]
public class BuiltIn_BaryCoord : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.SpirvSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `BarycentricCoordinates`
- **Same concept in:** HLSL [SV_Barycentrics](hlsl.md#sv-barycentrics) · GLSL [gl_BaryCoordEXT](glsl.md#gl-barycoordext) · MSL [barycentric_coord](msl.md#barycentric-coord)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;
using YotsubaShader.SpirvSyntax.Types;

// Fragment stage input
public struct FragmentInput
{
    [BuiltIn_BaryCoord] public vec3 Barycentrics;
}
```

### BuiltIn_BaryCoordNoPersp

Barycentric coordinates without perspective correction.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[BarycentricCoordinatesNoPerspective]
public class BuiltIn_BaryCoordNoPersp : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.SpirvSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `BarycentricCoordinatesNoPerspective`
- **Same concept in:** GLSL [gl_BaryCoordNoPerspEXT](glsl.md#gl-barycoordnoperspext)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;
using YotsubaShader.SpirvSyntax.Types;

// Fragment stage input
public struct FragmentInput
{
    [BuiltIn_BaryCoordNoPersp] public vec3 BarycentricsNoPersp;
}
```

### BuiltIn_BaseInstance

Base instance of the draw call.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[BaseInstance]
public class BuiltIn_BaseInstance : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.SpirvSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `BaseInstance`
- **Same concept in:** HLSL [SV_StartInstanceLocation](hlsl.md#sv-startinstancelocation) · GLSL [gl_BaseInstance](glsl.md#gl-baseinstance) · MSL [base_instance](msl.md#base-instance)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

// Vertex stage input
public struct VertexInput
{
    [BuiltIn_BaseInstance] public int BaseInstance;
}
```

### BuiltIn_BaseVertex

Base vertex of the draw call.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[BaseVertex]
public class BuiltIn_BaseVertex : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.SpirvSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `BaseVertex`
- **Same concept in:** HLSL [SV_StartVertexLocation](hlsl.md#sv-startvertexlocation) · GLSL [gl_BaseVertex](glsl.md#gl-basevertex) · MSL [base_vertex](msl.md#base-vertex)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

// Vertex stage input
public struct VertexInput
{
    [BuiltIn_BaseVertex] public int BaseVertex;
}
```

### BuiltIn_FragCoord

Window coordinate of the fragment, read by the fragment stage.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[FragmentCoordinate]
public class BuiltIn_FragCoord : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.SpirvSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `FragmentCoordinate`
- **Same concept in:** HLSL [SV_Position](hlsl.md#sv-position), [SV_POSITION](hlsl.md#sv-position) · GLSL [gl_FragCoord](glsl.md#gl-fragcoord) · MSL [position](msl.md#position) · WGSL [@builtin_position](wgsl.md#builtin-position)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;
using YotsubaShader.SpirvSyntax.Types;

// Fragment stage input
public struct FragmentInput
{
    [BuiltIn_FragCoord] public vec4 FragCoord;
}
```

### BuiltIn_FrontFacing

`true` when the fragment belongs to a front-facing primitive.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[FrontFacingFlag]
public class BuiltIn_FrontFacing : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.SpirvSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `FrontFacingFlag`
- **Same concept in:** HLSL [SV_IsFrontFace](hlsl.md#sv-isfrontface) · GLSL [gl_FrontFacing](glsl.md#gl-frontfacing) · MSL [front_facing](msl.md#front-facing) · WGSL [@builtin_front_facing](wgsl.md#builtin-front-facing)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

// Fragment stage input
public struct FragmentInput
{
    [BuiltIn_FrontFacing] public bool IsFrontFace;
}
```

### BuiltIn_GlobalInvocationId

Position of the invocation in the whole dispatch.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[GlobalInvocationId]
public class BuiltIn_GlobalInvocationId : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.SpirvSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `GlobalInvocationId`
- **Same concept in:** HLSL [SV_DispatchThreadID](hlsl.md#sv-dispatchthreadid) · GLSL [gl_GlobalInvocationID](glsl.md#gl-globalinvocationid) · MSL [thread_position_in_grid](msl.md#thread-position-in-grid) · WGSL [@builtin_global_invocation_id](wgsl.md#builtin-global-invocation-id)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;
using YotsubaShader.SpirvSyntax.Types;

// Compute stage input
public struct ComputeInput
{
    [BuiltIn_GlobalInvocationId] public uvec3 GlobalId;
}
```

### BuiltIn_HelperInvocation

`true` for helper invocations, which run only to compute derivatives.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[HelperInvocation]
public class BuiltIn_HelperInvocation : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.SpirvSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `HelperInvocation`
- **Same concept in:** GLSL [gl_HelperInvocation](glsl.md#gl-helperinvocation)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

// Fragment stage input
public struct FragmentInput
{
    [BuiltIn_HelperInvocation] public bool IsHelper;
}
```

### BuiltIn_InstanceIndex

Index of the instance being drawn.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[InstanceIndex]
public class BuiltIn_InstanceIndex : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.SpirvSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `InstanceIndex`
- **Same concept in:** HLSL [SV_InstanceID](hlsl.md#sv-instanceid) · GLSL [gl_InstanceIndex](glsl.md#gl-instanceindex) · MSL [instance_id](msl.md#instance-id) · WGSL [@builtin_instance_index](wgsl.md#builtin-instance-index)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

// Vertex stage input
public struct VertexInput
{
    [BuiltIn_InstanceIndex] public int InstanceIndex;
}
```

### BuiltIn_LocalInvocationId

Position of the invocation inside its workgroup.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[LocalInvocationId]
public class BuiltIn_LocalInvocationId : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.SpirvSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `LocalInvocationId`
- **Same concept in:** HLSL [SV_GroupThreadID](hlsl.md#sv-groupthreadid) · GLSL [gl_LocalInvocationID](glsl.md#gl-localinvocationid) · MSL [thread_position_in_threadgroup](msl.md#thread-position-in-threadgroup) · WGSL [@builtin_local_invocation_id](wgsl.md#builtin-local-invocation-id)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;
using YotsubaShader.SpirvSyntax.Types;

// Compute stage input
public struct ComputeInput
{
    [BuiltIn_LocalInvocationId] public uvec3 LocalId;
}
```

### BuiltIn_LocalInvocationIndex

Flattened index of the invocation inside its workgroup.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[LocalInvocationIndex]
public class BuiltIn_LocalInvocationIndex : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.SpirvSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `LocalInvocationIndex`
- **Same concept in:** HLSL [SV_GroupIndex](hlsl.md#sv-groupindex) · GLSL [gl_LocalInvocationIndex](glsl.md#gl-localinvocationindex) · MSL [thread_index_in_threadgroup](msl.md#thread-index-in-threadgroup) · WGSL [@builtin_local_invocation_index](wgsl.md#builtin-local-invocation-index)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

// Compute stage input
public struct ComputeInput
{
    [BuiltIn_LocalInvocationIndex] public uint LocalIndex;
}
```

### BuiltIn_NumSubgroups

Number of subgroups in the workgroup.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[NumberOfSubgroups]
public class BuiltIn_NumSubgroups : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.SpirvSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `NumberOfSubgroups`
- **Same concept in:** GLSL [gl_NumSubgroups](glsl.md#gl-numsubgroups) · MSL [simdgroups_per_threadgroup](msl.md#simdgroups-per-threadgroup) · WGSL [@builtin_num_subgroups](wgsl.md#builtin-num-subgroups)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

// Compute stage input
public struct ComputeInput
{
    [BuiltIn_NumSubgroups] public uint SubgroupCount;
}
```

### BuiltIn_NumWorkgroups

Number of workgroups of the dispatch.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[NumberOfWorkgroups]
public class BuiltIn_NumWorkgroups : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.SpirvSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `NumberOfWorkgroups`
- **Same concept in:** GLSL [gl_NumWorkGroups](glsl.md#gl-numworkgroups) · MSL [threadgroups_per_grid](msl.md#threadgroups-per-grid) · WGSL [@builtin_num_workgroups](wgsl.md#builtin-num-workgroups)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;
using YotsubaShader.SpirvSyntax.Types;

// Compute stage input
public struct ComputeInput
{
    [BuiltIn_NumWorkgroups] public uvec3 GroupCount;
}
```

### BuiltIn_PrimitiveId

Index of the primitive the fragment belongs to.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[PrimitiveIndex]
public class BuiltIn_PrimitiveId : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.SpirvSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `PrimitiveIndex`
- **Same concept in:** HLSL [SV_PrimitiveID](hlsl.md#sv-primitiveid) · GLSL [gl_PrimitiveID](glsl.md#gl-primitiveid) · MSL [primitive_id](msl.md#primitive-id) · WGSL [@builtin_primitive_index](wgsl.md#builtin-primitive-index)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

// Fragment stage input
public struct FragmentInput
{
    [BuiltIn_PrimitiveId] public uint PrimitiveId;
}
```

### BuiltIn_SampleId

Index of the sample being shaded (multisampling).

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[SampleIndex]
public class BuiltIn_SampleId : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.SpirvSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `SampleIndex`
- **Same concept in:** HLSL [SV_SampleIndex](hlsl.md#sv-sampleindex) · GLSL [gl_SampleID](glsl.md#gl-sampleid) · MSL [sample_id](msl.md#sample-id) · WGSL [@builtin_sample_index](wgsl.md#builtin-sample-index)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

// Fragment stage input
public struct FragmentInput
{
    [BuiltIn_SampleId] public uint SampleIndex;
}
```

### BuiltIn_SamplePosition

Position of the current sample inside the pixel.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[SamplePosition]
public class BuiltIn_SamplePosition : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.SpirvSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `SamplePosition`
- **Same concept in:** GLSL [gl_SamplePosition](glsl.md#gl-sampleposition)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;
using YotsubaShader.SpirvSyntax.Types;

// Fragment stage input
public struct FragmentInput
{
    [BuiltIn_SamplePosition] public vec2 SamplePosition;
}
```

### BuiltIn_SubgroupId

Index of the subgroup inside the workgroup.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[SubgroupId]
public class BuiltIn_SubgroupId : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.SpirvSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `SubgroupId`
- **Same concept in:** GLSL [gl_SubgroupID](glsl.md#gl-subgroupid) · MSL [simdgroup_index_in_threadgroup](msl.md#simdgroup-index-in-threadgroup) · WGSL [@builtin_subgroup_id](wgsl.md#builtin-subgroup-id)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

// Compute stage input
public struct ComputeInput
{
    [BuiltIn_SubgroupId] public uint SubgroupId;
}
```

### BuiltIn_SubgroupInvocationId

Index of the invocation inside its subgroup.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[SubgroupInvocationId]
public class BuiltIn_SubgroupInvocationId : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.SpirvSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `SubgroupInvocationId`
- **Same concept in:** GLSL [gl_SubgroupInvocationID](glsl.md#gl-subgroupinvocationid) · MSL [thread_index_in_simdgroup](msl.md#thread-index-in-simdgroup) · WGSL [@builtin_subgroup_invocation_id](wgsl.md#builtin-subgroup-invocation-id)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

// Compute stage input
public struct ComputeInput
{
    [BuiltIn_SubgroupInvocationId] public uint SubgroupLane;
}
```

### BuiltIn_SubgroupSize

Number of invocations in a subgroup.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[SubgroupSize]
public class BuiltIn_SubgroupSize : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.SpirvSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `SubgroupSize`
- **Same concept in:** GLSL [gl_SubgroupSize](glsl.md#gl-subgroupsize) · MSL [threads_per_simdgroup](msl.md#threads-per-simdgroup) · WGSL [@builtin_subgroup_size](wgsl.md#builtin-subgroup-size)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

// Compute stage input
public struct ComputeInput
{
    [BuiltIn_SubgroupSize] public uint SubgroupSize;
}
```

### BuiltIn_VertexIndex

Index of the vertex being processed.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[VertexIndex]
public class BuiltIn_VertexIndex : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.SpirvSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `VertexIndex`
- **Same concept in:** HLSL [SV_VertexID](hlsl.md#sv-vertexid) · GLSL [gl_VertexIndex](glsl.md#gl-vertexindex) · MSL [vertex_id](msl.md#vertex-id) · WGSL [@builtin_vertex_index](wgsl.md#builtin-vertex-index)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

// Vertex stage input
public struct VertexInput
{
    [BuiltIn_VertexIndex] public int VertexIndex;
}
```

### BuiltIn_WorkgroupId

Position of the workgroup in the dispatch.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[WorkgroupId]
public class BuiltIn_WorkgroupId : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.SpirvSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `WorkgroupId`
- **Same concept in:** HLSL [SV_GroupID](hlsl.md#sv-groupid) · GLSL [gl_WorkGroupID](glsl.md#gl-workgroupid) · MSL [threadgroup_position_in_grid](msl.md#threadgroup-position-in-grid) · WGSL [@builtin_workgroup_id](wgsl.md#builtin-workgroup-id)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;
using YotsubaShader.SpirvSyntax.Types;

// Compute stage input
public struct ComputeInput
{
    [BuiltIn_WorkgroupId] public uvec3 GroupId;
}
```

### BuiltIn_WorkgroupSize

Size of the workgroup, read as a value.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[WorkgroupSizeBuiltInValue]
public class BuiltIn_WorkgroupSize : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.SpirvSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `WorkgroupSizeBuiltInValue`
- **Same concept in:** GLSL [gl_WorkGroupSize](glsl.md#gl-workgroupsize) · MSL [threads_per_threadgroup](msl.md#threads-per-threadgroup)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;
using YotsubaShader.SpirvSyntax.Types;

// Compute stage input
public struct ComputeInput
{
    [BuiltIn_WorkgroupSize] public uvec3 GroupSize;
}
```

## Output attributes

Fields, parameters and return values that the stage produces.

### BuiltIn_FragDepth

Depth written by the fragment stage, replacing the interpolated one.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Output)]
[FragDepth]
public class BuiltIn_FragDepth : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.SpirvSyntax`
- **Applies to:** fields, parameters, return values
- **Concept:** `FragDepth`
- **Same concept in:** HLSL [SV_Depth](hlsl.md#sv-depth) · GLSL [gl_FragDepth](glsl.md#gl-fragdepth) · MSL [depth](msl.md#depth) · WGSL [@builtin_frag_depth](wgsl.md#builtin-frag-depth)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

// Fragment stage output
public struct FragmentOutput
{
    [BuiltIn_FragDepth] public float Depth;
}
```

### BuiltIn_FragStencilRef

Stencil reference value written by the fragment stage.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.Output)]
[StencilReference]
public class BuiltIn_FragStencilRef : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.SpirvSyntax`
- **Applies to:** fields, parameters, return values
- **Concept:** `StencilReference`
- **Same concept in:** HLSL [SV_StencilRef](hlsl.md#sv-stencilref) · GLSL [gl_FragStencilRefARB](glsl.md#gl-fragstencilrefarb) · MSL [stencil](msl.md#stencil)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

// Fragment stage output
public struct FragmentOutput
{
    [BuiltIn_FragStencilRef] public uint StencilRef;
}
```

## Input and output attributes

Values that a stage can receive or produce. The stage decides which.

### BuiltIn_ClipDistance

Clip distance: a negative value clips the primitive against a user plane.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[ClipInstance]
public class BuiltIn_ClipDistance : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.SpirvSyntax`
- **Applies to:** fields, parameters, properties, return values
- **Concept:** `ClipInstance`
- **Same concept in:** HLSL [SV_ClipDistanceN](hlsl.md#sv-clipdistancen) · GLSL [gl_ClipDistance](glsl.md#gl-clipdistance) · MSL [clip_distance](msl.md#clip-distance) · WGSL [@builtin_clip_distances](wgsl.md#builtin-clip-distances)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

// Vertex stage output
public struct VertexOutput
{
    [BuiltIn_ClipDistance] public float ClipDistance;
}
```

### BuiltIn_Layer

Layer of a layered render target that receives the primitive.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[RenderTargetLayer]
public class BuiltIn_Layer : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.SpirvSyntax`
- **Applies to:** fields, parameters, properties, return values
- **Concept:** `RenderTargetLayer`
- **Same concept in:** HLSL [SV_RenderTargetArrayIndex](hlsl.md#sv-rendertargetarrayindex) · GLSL [gl_Layer](glsl.md#gl-layer) · MSL [render_target_array_index](msl.md#render-target-array-index)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

// Vertex stage output
public struct VertexOutput
{
    [BuiltIn_Layer] public uint Layer;
}
```

### BuiltIn_Position

Clip-space position written by the vertex stage.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[ClipSpacePosition]
public class BuiltIn_Position : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.SpirvSyntax`
- **Applies to:** fields, parameters, properties, return values
- **Concept:** `ClipSpacePosition`
- **Same concept in:** HLSL [SV_Position](hlsl.md#sv-position), [SV_POSITION](hlsl.md#sv-position) · GLSL [gl_Position](glsl.md#gl-position) · MSL [position](msl.md#position) · WGSL [@builtin_position](wgsl.md#builtin-position)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;
using YotsubaShader.SpirvSyntax.Types;

// Vertex stage output
public struct VertexOutput
{
    [BuiltIn_Position] public vec4 Position;
}
```

### BuiltIn_SampleMask

Coverage mask of the samples of the fragment.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[SampleMask]
public class BuiltIn_SampleMask : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.SpirvSyntax`
- **Applies to:** fields, parameters, properties, return values
- **Concept:** `SampleMask`
- **Same concept in:** HLSL [SV_Coverage](hlsl.md#sv-coverage) · GLSL [gl_SampleMask](glsl.md#gl-samplemask), [gl_SampleMaskIn](glsl.md#gl-samplemaskin) · MSL [sample_mask](msl.md#sample-mask) · WGSL [@builtin_sample_mask](wgsl.md#builtin-sample-mask)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

// Fragment stage input
public struct FragmentInput
{
    [BuiltIn_SampleMask] public uint SampleMask;
}
```

### BuiltIn_ViewportIndex

Viewport that receives the primitive.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[ViewportIndex]
public class BuiltIn_ViewportIndex : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.SpirvSyntax`
- **Applies to:** fields, parameters, properties, return values
- **Concept:** `ViewportIndex`
- **Same concept in:** HLSL [SV_ViewportArrayIndex](hlsl.md#sv-viewportarrayindex) · GLSL [gl_ViewportIndex](glsl.md#gl-viewportindex) · MSL [viewport_array_index](msl.md#viewport-array-index)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;

// Vertex stage output
public struct VertexOutput
{
    [BuiltIn_ViewportIndex] public uint ViewportIndex;
}
```

### Location

Numbered interface slot: vertex inputs, values passed between stages and fragment outputs.

```csharp
namespace YotsubaShader.SpirvSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[YotsubaShader.Concepts.LocationAttribute]
public class Location(int index = 0) : YotsubaShaderConcept
{
    public int Index;
}
```

- **Namespace:** `YotsubaShader.SpirvSyntax`
- **Applies to:** fields, parameters, properties, return values
- **Concept:** `Location`
- **Same concept in:** HLSL [SV_Target](hlsl.md#sv-target) · GLSL [location](glsl.md#location) · MSL [attribute](msl.md#attribute), [color](msl.md#color) · WGSL [@location](wgsl.md#location)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;
using YotsubaShader.SpirvSyntax.Types;

// Vertex stage output
public struct VertexOutput
{
    [Location] public vec4 Color;
}
```

## Resource attributes

Uniform buffers, storage buffers and the binding slots of buffers, textures and samplers.

### Binding

Binding number of a resource inside its descriptor set. Written `@Binding` in C#.

```csharp
namespace YotsubaShader.SpirvSyntax.Resources;

[AttributeUsage(AttributeUsagesTable.Resource)]
[BindingSlot, TextureSlot, SamplerSlot]
public class Binding(int n) : YotsubaShaderConcept
{
    public int N;
}
```

- **Namespace:** `YotsubaShader.SpirvSyntax.Resources`
- **Applies to:** fields, parameters, properties
- **Concept:** `BindingSlot`, `TextureSlot`, `SamplerSlot`
- **Same concept in:** HLSL [register](hlsl.md#register) · GLSL [layout](glsl.md#layout) · MSL [buffer](msl.md#buffer), [sampler](msl.md#sampler), [texture](msl.md#texture) · WGSL [@binding](wgsl.md#binding), [@group](wgsl.md#group)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;
using YotsubaShader.SpirvSyntax.Resources;
using YotsubaShader.SpirvSyntax.Resources.Types;

public class Surface
{
    [DescriptorSet(0), @Binding(0)]
    public sampler2D Albedo;
}
```

### DescriptorSet

Descriptor set of a resource. Use it together with `Binding`.

```csharp
namespace YotsubaShader.SpirvSyntax.Resources;

[AttributeUsage(AttributeUsagesTable.Resource)]
[BindingSlot, TextureSlot, SamplerSlot]
public class DescriptorSet(int s) : YotsubaShaderConcept
{
    public int S;
}
```

- **Namespace:** `YotsubaShader.SpirvSyntax.Resources`
- **Applies to:** fields, parameters, properties
- **Concept:** `BindingSlot`, `TextureSlot`, `SamplerSlot`
- **Same concept in:** HLSL [register](hlsl.md#register) · GLSL [layout](glsl.md#layout) · MSL [buffer](msl.md#buffer), [sampler](msl.md#sampler), [texture](msl.md#texture) · WGSL [@binding](wgsl.md#binding), [@group](wgsl.md#group)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;
using YotsubaShader.SpirvSyntax.Resources;
using YotsubaShader.SpirvSyntax.Resources.Types;

public class Surface
{
    [DescriptorSet(0), @Binding(0)]
    public sampler2D Albedo;
}
```

### StorageBuffer

Marks the field as a storage buffer, read/write or read-only.

```csharp
namespace YotsubaShader.SpirvSyntax.Resources;

[AttributeUsage(AttributeUsagesTable.Resource)]
[RWStorageBuffer, ReadOnlyStorageBuffer]
public class StorageBuffer : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.SpirvSyntax.Resources`
- **Applies to:** fields, parameters, properties
- **Concept:** `RWStorageBuffer`, `ReadOnlyStorageBuffer`
- **Same concept in:** GLSL [buffer](glsl.md#buffer) · MSL [device](msl.md#device) · WGSL [storage](wgsl.md#storage)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;
using YotsubaShader.SpirvSyntax.Resources;

public class Resources
{
    [StorageBuffer, DescriptorSet(0), @Binding(1)]
    public float[] Output;
}
```

### Uniform

Marks the field as a uniform (constant) buffer.

```csharp
namespace YotsubaShader.SpirvSyntax.Resources;

[AttributeUsage(AttributeUsagesTable.Resource)]
[UniformBuffer]
public class Uniform : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.SpirvSyntax.Resources`
- **Applies to:** fields, parameters, properties
- **Concept:** `UniformBuffer`
- **Same concept in:** HLSL [cbuffer](hlsl.md#cbuffer) · GLSL [uniform](glsl.md#uniform) · MSL [constant](msl.md#constant) · WGSL [uniform](wgsl.md#uniform)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;
using YotsubaShader.SpirvSyntax.Resources;

public struct Material
{
    // The contents of the uniform buffer
    public float Exposure;
}

public class Resources
{
    [Uniform, DescriptorSet(0), @Binding(0)]
    public Material Material;
}
```

## Types

The types declared by the package. Members are listed without their bodies.

### Texture and sampler types

```csharp
namespace YotsubaShader.SpirvSyntax.Resources.Types;

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
namespace YotsubaShader.SpirvSyntax.Types;

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

[Texture(TextureDimension.D1, TextureComponentTypes.GenericDefine)]
public struct Image1D<T> where T : unmanaged;

[Texture(TextureDimension.D2, TextureComponentTypes.GenericDefine)]
public struct Image2D<T> where T : unmanaged;

[Texture(TextureDimension.D3, TextureComponentTypes.GenericDefine)]
public struct Image3D<T> where T : unmanaged;

[Texture(TextureDimension.Cube, TextureComponentTypes.GenericDefine)]
public struct ImageCube<T> where T : unmanaged;

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

[Sampler]
public struct Sampler;

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
[GLSL](glsl.md)
[MSL](msl.md)
[WGSL](wgsl.md)
```

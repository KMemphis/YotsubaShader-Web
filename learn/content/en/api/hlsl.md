---
title: HLSL syntax API
summary: Every attribute and type of the YotsubaShader.HlslSyntax package, with its declaration, its concept and an example.
order: 1
---

API of the `YotsubaShader.HlslSyntax` package: the 32 attributes and the types of the HLSL syntax, inspired by **HLSL (Direct3D)**. Each entry shows the declaration as the package writes it, the concept the compiler reads from it, the same concept in the other four syntaxes, and an example.

Add the package to the shader project:

```bash
dotnet add package YotsubaShader.HlslSyntax
```

For a guided tour of the syntax, with every built-in value grouped by stage, see the [HLSL syntax](../reference/hlsl.md) page of the Documentation.

## Namespaces

The package splits its API in these namespaces. The attributes shared by every syntax (`ShaderStage`, `Location`, `Uniform`...) are in `YotsubaShader.Language`.

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax; // Built-in values, interface slots and method attributes
using YotsubaShader.HlslSyntax.Resources; // Resource attributes and resource types
using YotsubaShader.HlslSyntax.Resources.Types; // Texture and sampler types
using YotsubaShader.HlslSyntax.Types; // Vector, matrix and helper types
```

## Input attributes

Fields, parameters and properties that receive a value from the pipeline.

### SV_Barycentrics

Barycentric coordinates of the fragment inside its triangle.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[BarycentricCoordinates]
public class SV_Barycentrics : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.HlslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `BarycentricCoordinates`
- **Same concept in:** GLSL [gl_BaryCoordEXT](glsl.md#gl-barycoordext) · MSL [barycentric_coord](msl.md#barycentric-coord) · SPIR-V [BuiltIn_BaryCoord](spirv.md#builtin-barycoord)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;
using YotsubaShader.HlslSyntax.Types;

// Fragment stage input
public struct FragmentInput
{
    [SV_Barycentrics] public float3 Barycentrics;
}
```

### SV_DispatchThreadID

Position of the invocation in the whole dispatch.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[GlobalInvocationId]
public class SV_DispatchThreadID : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.HlslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `GlobalInvocationId`
- **Same concept in:** GLSL [gl_GlobalInvocationID](glsl.md#gl-globalinvocationid) · MSL [thread_position_in_grid](msl.md#thread-position-in-grid) · SPIR-V [BuiltIn_GlobalInvocationId](spirv.md#builtin-globalinvocationid) · WGSL [@builtin_global_invocation_id](wgsl.md#builtin-global-invocation-id)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;
using YotsubaShader.HlslSyntax.Types;

// Compute stage input
public struct ComputeInput
{
    [SV_DispatchThreadID] public uint3 GlobalId;
}
```

### SV_GroupID

Position of the workgroup in the dispatch.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[WorkgroupId]
public class SV_GroupID : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.HlslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `WorkgroupId`
- **Same concept in:** GLSL [gl_WorkGroupID](glsl.md#gl-workgroupid) · MSL [threadgroup_position_in_grid](msl.md#threadgroup-position-in-grid) · SPIR-V [BuiltIn_WorkgroupId](spirv.md#builtin-workgroupid) · WGSL [@builtin_workgroup_id](wgsl.md#builtin-workgroup-id)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;
using YotsubaShader.HlslSyntax.Types;

// Compute stage input
public struct ComputeInput
{
    [SV_GroupID] public uint3 GroupId;
}
```

### SV_GroupIndex

Flattened index of the invocation inside its workgroup.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[LocalInvocationIndex]
public class SV_GroupIndex : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.HlslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `LocalInvocationIndex`
- **Same concept in:** GLSL [gl_LocalInvocationIndex](glsl.md#gl-localinvocationindex) · MSL [thread_index_in_threadgroup](msl.md#thread-index-in-threadgroup) · SPIR-V [BuiltIn_LocalInvocationIndex](spirv.md#builtin-localinvocationindex) · WGSL [@builtin_local_invocation_index](wgsl.md#builtin-local-invocation-index)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

// Compute stage input
public struct ComputeInput
{
    [SV_GroupIndex] public uint LocalIndex;
}
```

### SV_GroupThreadID

Position of the invocation inside its workgroup.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[LocalInvocationId]
public class SV_GroupThreadID : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.HlslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `LocalInvocationId`
- **Same concept in:** GLSL [gl_LocalInvocationID](glsl.md#gl-localinvocationid) · MSL [thread_position_in_threadgroup](msl.md#thread-position-in-threadgroup) · SPIR-V [BuiltIn_LocalInvocationId](spirv.md#builtin-localinvocationid) · WGSL [@builtin_local_invocation_id](wgsl.md#builtin-local-invocation-id)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;
using YotsubaShader.HlslSyntax.Types;

// Compute stage input
public struct ComputeInput
{
    [SV_GroupThreadID] public uint3 LocalId;
}
```

### SV_InstanceID

Index of the instance being drawn.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[InstanceIndex]
public class SV_InstanceID : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.HlslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `InstanceIndex`
- **Same concept in:** GLSL [gl_InstanceIndex](glsl.md#gl-instanceindex) · MSL [instance_id](msl.md#instance-id) · SPIR-V [BuiltIn_InstanceIndex](spirv.md#builtin-instanceindex) · WGSL [@builtin_instance_index](wgsl.md#builtin-instance-index)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

// Vertex stage input
public struct VertexInput
{
    [SV_InstanceID] public uint InstanceIndex;
}
```

### SV_IsFrontFace

`true` when the fragment belongs to a front-facing primitive.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[FrontFacingFlag]
public class SV_IsFrontFace : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.HlslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `FrontFacingFlag`
- **Same concept in:** GLSL [gl_FrontFacing](glsl.md#gl-frontfacing) · MSL [front_facing](msl.md#front-facing) · SPIR-V [BuiltIn_FrontFacing](spirv.md#builtin-frontfacing) · WGSL [@builtin_front_facing](wgsl.md#builtin-front-facing)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

// Fragment stage input
public struct FragmentInput
{
    [SV_IsFrontFace] public bool IsFrontFace;
}
```

### SV_PrimitiveID

Index of the primitive the fragment belongs to.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[PrimitiveIndex]
public class SV_PrimitiveID : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.HlslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `PrimitiveIndex`
- **Same concept in:** GLSL [gl_PrimitiveID](glsl.md#gl-primitiveid) · MSL [primitive_id](msl.md#primitive-id) · SPIR-V [BuiltIn_PrimitiveId](spirv.md#builtin-primitiveid) · WGSL [@builtin_primitive_index](wgsl.md#builtin-primitive-index)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

// Fragment stage input
public struct FragmentInput
{
    [SV_PrimitiveID] public uint PrimitiveId;
}
```

### SV_SampleIndex

Index of the sample being shaded (multisampling).

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[SampleIndex]
public class SV_SampleIndex : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.HlslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `SampleIndex`
- **Same concept in:** GLSL [gl_SampleID](glsl.md#gl-sampleid) · MSL [sample_id](msl.md#sample-id) · SPIR-V [BuiltIn_SampleId](spirv.md#builtin-sampleid) · WGSL [@builtin_sample_index](wgsl.md#builtin-sample-index)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

// Fragment stage input
public struct FragmentInput
{
    [SV_SampleIndex] public uint SampleIndex;
}
```

### SV_StartInstanceLocation

Base instance of the draw call.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[BaseInstance]
public class SV_StartInstanceLocation : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.HlslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `BaseInstance`
- **Same concept in:** GLSL [gl_BaseInstance](glsl.md#gl-baseinstance) · MSL [base_instance](msl.md#base-instance) · SPIR-V [BuiltIn_BaseInstance](spirv.md#builtin-baseinstance)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

// Vertex stage input
public struct VertexInput
{
    [SV_StartInstanceLocation] public uint BaseInstance;
}
```

### SV_StartVertexLocation

Base vertex of the draw call.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[BaseVertex]
public class SV_StartVertexLocation : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.HlslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `BaseVertex`
- **Same concept in:** GLSL [gl_BaseVertex](glsl.md#gl-basevertex) · MSL [base_vertex](msl.md#base-vertex) · SPIR-V [BuiltIn_BaseVertex](spirv.md#builtin-basevertex)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

// Vertex stage input
public struct VertexInput
{
    [SV_StartVertexLocation] public uint BaseVertex;
}
```

### SV_VertexID

Index of the vertex being processed.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[VertexIndex]
public class SV_VertexID() : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.HlslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `VertexIndex`
- **Same concept in:** GLSL [gl_VertexIndex](glsl.md#gl-vertexindex) · MSL [vertex_id](msl.md#vertex-id) · SPIR-V [BuiltIn_VertexIndex](spirv.md#builtin-vertexindex) · WGSL [@builtin_vertex_index](wgsl.md#builtin-vertex-index)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

// Vertex stage input
public struct VertexInput
{
    [SV_VertexID] public uint VertexIndex;
}
```

## Output attributes

Fields, parameters and return values that the stage produces.

### SV_Depth

Depth written by the fragment stage, replacing the interpolated one.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.Output)]
[FragDepth]
public class SV_Depth : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.HlslSyntax`
- **Applies to:** fields, parameters, return values
- **Concept:** `FragDepth`
- **Same concept in:** GLSL [gl_FragDepth](glsl.md#gl-fragdepth) · MSL [depth](msl.md#depth) · SPIR-V [BuiltIn_FragDepth](spirv.md#builtin-fragdepth) · WGSL [@builtin_frag_depth](wgsl.md#builtin-frag-depth)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

// Fragment stage output
public struct FragmentOutput
{
    [SV_Depth] public float Depth;
}
```

### SV_DepthGreaterEqual

Fragment depth that is never smaller than the interpolated one (conservative depth).

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.Output)]
[ConservativeDepth]
public class SV_DepthGreaterEqual : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.HlslSyntax`
- **Applies to:** fields, parameters, return values
- **Concept:** `ConservativeDepth`
- **Same concept in:** MSL [depth](msl.md#depth)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

// Fragment stage output
public struct FragmentOutput
{
    [SV_DepthGreaterEqual] public float Depth;
}
```

### SV_DepthLessEqual

Fragment depth that is never greater than the interpolated one (conservative depth).

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.Output)]
[ConservativeDepth]
public class SV_DepthLessEqual : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.HlslSyntax`
- **Applies to:** fields, parameters, return values
- **Concept:** `ConservativeDepth`
- **Same concept in:** MSL [depth](msl.md#depth)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

// Fragment stage output
public struct FragmentOutput
{
    [SV_DepthLessEqual] public float Depth;
}
```

### SV_StencilRef

Stencil reference value written by the fragment stage.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.Output)]
[StencilReference]
public class SV_StencilRef : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.HlslSyntax`
- **Applies to:** fields, parameters, return values
- **Concept:** `StencilReference`
- **Same concept in:** GLSL [gl_FragStencilRefARB](glsl.md#gl-fragstencilrefarb) · MSL [stencil](msl.md#stencil) · SPIR-V [BuiltIn_FragStencilRef](spirv.md#builtin-fragstencilref)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

// Fragment stage output
public struct FragmentOutput
{
    [SV_StencilRef] public uint StencilRef;
}
```

### SV_Target

Fragment output written to the color target `n`.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.Output)]
[Location]
public class SV_Target(int n = 0) : YotsubaShaderConcept
{
    public int N;
}
```

- **Namespace:** `YotsubaShader.HlslSyntax`
- **Applies to:** fields, parameters, return values
- **Concept:** `Location`
- **Same concept in:** GLSL [location](glsl.md#location) · MSL [attribute](msl.md#attribute), [color](msl.md#color) · SPIR-V [Location](spirv.md#location) · WGSL [@location](wgsl.md#location)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;
using YotsubaShader.HlslSyntax.Types;

// Fragment stage output
public struct FragmentOutput
{
    [SV_Target] public float4 Color;
}
```

## Input and output attributes

Values that a stage can receive or produce. The stage decides which.

### BINORMAL

Named user semantic. The backend turns it into a numbered location.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[UserSemantic]
public class BINORMAL(int index = 0) : YotsubaShaderConcept
{
    public int Index;
}
```

- **Namespace:** `YotsubaShader.HlslSyntax`
- **Applies to:** fields, parameters, properties, return values
- **Concept:** `UserSemantic`
- **Same concept in:** no other syntax

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;
using YotsubaShader.HlslSyntax.Types;

// Vertex stage output
public struct VertexOutput
{
    [BINORMAL] public float4 Value;
}
```

### COLOR

Named user semantic. The backend turns it into a numbered location.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[UserSemantic]
public class COLOR(int index = 0) : YotsubaShaderConcept
{
    public int Index;
}
```

- **Namespace:** `YotsubaShader.HlslSyntax`
- **Applies to:** fields, parameters, properties, return values
- **Concept:** `UserSemantic`
- **Same concept in:** no other syntax

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;
using YotsubaShader.HlslSyntax.Types;

// Vertex stage output
public struct VertexOutput
{
    [COLOR] public float4 Value;
}
```

### NORMAL

Named user semantic. The backend turns it into a numbered location.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[UserSemantic]
public class NORMAL(int index = 0) : YotsubaShaderConcept
{
    public int Index;
}
```

- **Namespace:** `YotsubaShader.HlslSyntax`
- **Applies to:** fields, parameters, properties, return values
- **Concept:** `UserSemantic`
- **Same concept in:** no other syntax

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;
using YotsubaShader.HlslSyntax.Types;

// Vertex stage output
public struct VertexOutput
{
    [NORMAL] public float4 Value;
}
```

### POSITION

Named user semantic. The backend turns it into a numbered location.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[UserSemantic]
public class POSITION(int index = 0) : YotsubaShaderConcept
{
    public int Index;
}
```

- **Namespace:** `YotsubaShader.HlslSyntax`
- **Applies to:** fields, parameters, properties, return values
- **Concept:** `UserSemantic`
- **Same concept in:** no other syntax

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;
using YotsubaShader.HlslSyntax.Types;

// Vertex stage output
public struct VertexOutput
{
    [POSITION] public float4 Value;
}
```

### SV_ClipDistanceN

Clip distance: a negative value clips the primitive against a user plane.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[ClipInstance]
public class SV_ClipDistanceN : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.HlslSyntax`
- **Applies to:** fields, parameters, properties, return values
- **Concept:** `ClipInstance`
- **Same concept in:** GLSL [gl_ClipDistance](glsl.md#gl-clipdistance) · MSL [clip_distance](msl.md#clip-distance) · SPIR-V [BuiltIn_ClipDistance](spirv.md#builtin-clipdistance) · WGSL [@builtin_clip_distances](wgsl.md#builtin-clip-distances)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

// Vertex stage output
public struct VertexOutput
{
    [SV_ClipDistanceN] public float ClipDistance;
}
```

### SV_Coverage

Coverage mask of the samples of the fragment.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[SampleMask]
public class SV_Coverage : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.HlslSyntax`
- **Applies to:** fields, parameters, properties, return values
- **Concept:** `SampleMask`
- **Same concept in:** GLSL [gl_SampleMask](glsl.md#gl-samplemask), [gl_SampleMaskIn](glsl.md#gl-samplemaskin) · MSL [sample_mask](msl.md#sample-mask) · SPIR-V [BuiltIn_SampleMask](spirv.md#builtin-samplemask) · WGSL [@builtin_sample_mask](wgsl.md#builtin-sample-mask)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

// Fragment stage input
public struct FragmentInput
{
    [SV_Coverage] public uint SampleMask;
}
```

### SV_Position

Clip-space position written by the vertex stage.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[ClipSpacePosition, FragmentCoordinate]
public class SV_Position : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.HlslSyntax`
- **Applies to:** fields, parameters, properties, return values
- **Concept:** `ClipSpacePosition`, `FragmentCoordinate`
- **Same concept in:** GLSL [gl_Position](glsl.md#gl-position), [gl_FragCoord](glsl.md#gl-fragcoord) · MSL [position](msl.md#position) · SPIR-V [BuiltIn_Position](spirv.md#builtin-position), [BuiltIn_FragCoord](spirv.md#builtin-fragcoord) · WGSL [@builtin_position](wgsl.md#builtin-position)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;
using YotsubaShader.HlslSyntax.Types;

// Vertex stage output
public struct VertexOutput
{
    [SV_Position] public float4 Position;
}
```

### SV_POSITION

Clip-space position written by the vertex stage.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[ClipSpacePosition, FragmentCoordinate]
public class SV_POSITION : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.HlslSyntax`
- **Applies to:** fields, parameters, properties, return values
- **Concept:** `ClipSpacePosition`, `FragmentCoordinate`
- **Same concept in:** GLSL [gl_Position](glsl.md#gl-position), [gl_FragCoord](glsl.md#gl-fragcoord) · MSL [position](msl.md#position) · SPIR-V [BuiltIn_Position](spirv.md#builtin-position), [BuiltIn_FragCoord](spirv.md#builtin-fragcoord) · WGSL [@builtin_position](wgsl.md#builtin-position)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;
using YotsubaShader.HlslSyntax.Types;

// Vertex stage output
public struct VertexOutput
{
    [SV_POSITION] public float4 Position;
}
```

### SV_RenderTargetArrayIndex

Layer of a layered render target that receives the primitive.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[RenderTargetLayer]
public class SV_RenderTargetArrayIndex : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.HlslSyntax`
- **Applies to:** fields, parameters, properties, return values
- **Concept:** `RenderTargetLayer`
- **Same concept in:** GLSL [gl_Layer](glsl.md#gl-layer) · MSL [render_target_array_index](msl.md#render-target-array-index) · SPIR-V [BuiltIn_Layer](spirv.md#builtin-layer)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

// Vertex stage output
public struct VertexOutput
{
    [SV_RenderTargetArrayIndex] public uint Layer;
}
```

### SV_ViewportArrayIndex

Viewport that receives the primitive.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[ViewportIndex]
public class SV_ViewportArrayIndex : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.HlslSyntax`
- **Applies to:** fields, parameters, properties, return values
- **Concept:** `ViewportIndex`
- **Same concept in:** GLSL [gl_ViewportIndex](glsl.md#gl-viewportindex) · MSL [viewport_array_index](msl.md#viewport-array-index) · SPIR-V [BuiltIn_ViewportIndex](spirv.md#builtin-viewportindex)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

// Vertex stage output
public struct VertexOutput
{
    [SV_ViewportArrayIndex] public uint ViewportIndex;
}
```

### TANGENT

Named user semantic. The backend turns it into a numbered location.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[UserSemantic]
public class TANGENT(int index = 0) : YotsubaShaderConcept
{
    public int Index;
}
```

- **Namespace:** `YotsubaShader.HlslSyntax`
- **Applies to:** fields, parameters, properties, return values
- **Concept:** `UserSemantic`
- **Same concept in:** no other syntax

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;
using YotsubaShader.HlslSyntax.Types;

// Vertex stage output
public struct VertexOutput
{
    [TANGENT] public float4 Value;
}
```

### TEXCOORD

Named user semantic. The backend turns it into a numbered location.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[UserSemantic]
public class TEXCOORD(int index = 0) : YotsubaShaderConcept
{
    public int Index;
}
```

- **Namespace:** `YotsubaShader.HlslSyntax`
- **Applies to:** fields, parameters, properties, return values
- **Concept:** `UserSemantic`
- **Same concept in:** no other syntax

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;
using YotsubaShader.HlslSyntax.Types;

// Vertex stage output
public struct VertexOutput
{
    [TEXCOORD] public float4 Value;
}
```

## Method attributes

Attributes applied to an entry point method.

### numthreads

Sets the workgroup size of a compute entry point.

```csharp
namespace YotsubaShader.HlslSyntax;

[AttributeUsage(AttributeUsagesTable.Method)]
[WorkgroupSizeMethod]
public class numthreads(uint x, uint y, uint z) : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.HlslSyntax`
- **Applies to:** methods
- **Concept:** `WorkgroupSizeMethod`
- **Same concept in:** GLSL [layout_local_size](glsl.md#layout-local-size) · WGSL [@workgroup_size](wgsl.md#workgroup-size)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

public class Blur
{
    // Compute entry point
    [ShaderStage(Stage.Compute)]
    [numthreads(8, 8, 1)]
    public void Main() { }
}
```

## Resource attributes

Uniform buffers, storage buffers and the binding slots of buffers, textures and samplers.

### cbuffer

Marks the field as a uniform (constant) buffer.

```csharp
namespace YotsubaShader.HlslSyntax.Resources;

[AttributeUsage(AttributeUsagesTable.Resource)]
[UniformBuffer]
public class cbuffer : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.HlslSyntax.Resources`
- **Applies to:** fields, parameters, properties
- **Concept:** `UniformBuffer`
- **Same concept in:** GLSL [uniform](glsl.md#uniform) · MSL [constant](msl.md#constant) · SPIR-V [Uniform](spirv.md#uniform) · WGSL [uniform](wgsl.md#uniform)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;
using YotsubaShader.HlslSyntax.Resources;

public struct Material
{
    // The contents of the uniform buffer
    public float Exposure;
}

public class Resources
{
    [cbuffer, register(RegisterPrefix.b, 0)]
    public Material Material;
}
```

### register

Binding slot written as an HLSL register: a prefix (`b` buffer, `t` texture, `s` sampler, `u` read/write) and a number, optionally with a space, or the same thing as a string such as `"b0"`.

```csharp
namespace YotsubaShader.HlslSyntax.Resources;

[AttributeUsage(AttributeUsagesTable.Resource)]
[BindingSlot, TextureSlot, SamplerSlot]
public class register : YotsubaShaderConcept
{
    public register(RegisterPrefix prefix, int n);
    public register(RegisterPrefix prefix, int n, int space);
    public register(string resource);
    public static RegisterPrefix Parse(string resource, out int binding);
    public RegisterPrefix Prefix;
    public int N;
    public int Space;
}
```

- **Namespace:** `YotsubaShader.HlslSyntax.Resources`
- **Applies to:** fields, parameters, properties
- **Concept:** `BindingSlot`, `TextureSlot`, `SamplerSlot`
- **Same concept in:** GLSL [layout](glsl.md#layout) · MSL [buffer](msl.md#buffer), [sampler](msl.md#sampler), [texture](msl.md#texture) · SPIR-V [Binding](spirv.md#binding), [DescriptorSet](spirv.md#descriptorset) · WGSL [@binding](wgsl.md#binding), [@group](wgsl.md#group)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;
using YotsubaShader.HlslSyntax.Resources;
using YotsubaShader.HlslSyntax.Resources.Types;

public struct Material
{
    // The contents of the uniform buffer
    public float Exposure;
}

public class Resources
{
    [cbuffer, register(RegisterPrefix.b, 0)]
    public Material Material;

    [register(RegisterPrefix.t, 0)]
    public Texture2D Albedo;

    [register("s0")]
    public SamplerState Sampler;
}
```

## Types

The types declared by the package. Members are listed without their bodies.

### Resource types

```csharp
namespace YotsubaShader.HlslSyntax.Resources;

[UniformBuffer]
public struct ConstantBuffer<T>
{
    public T Value { get; }
}

public enum RegisterPrefix : int { b = 0, t = 1, s = 2, u = 3, c = 4 }

[RWStorageBuffer]
public struct RWStructuredBuffer<T>
{
    public ref T this[int index] { get; }
    public ref T this[uint index] { get; }
    public int Length { get; }
}

[ReadOnlyStorageBuffer]
public struct StructuredBuffer<T>
{
    public T this[int index] { get; }
    public T this[uint index] { get; }
    public int Length { get; }
}
```

### Texture and sampler types

```csharp
namespace YotsubaShader.HlslSyntax.Resources.Types;

[Texture(TextureDimension.D2, TextureComponentTypes.GenericDefine, Usage = TextureUsage.Storage)]
public struct RWTexture2D<T> where T : unmanaged;

[Sampler]
public struct SamplerComparisonState;

[Sampler]
public struct SamplerState;

[Texture(TextureDimension.D1, TextureComponentTypes.Float)]
public struct Texture1D;

[Texture(TextureDimension.D1, TextureComponentTypes.GenericDefine)]
public struct Texture1D<T> where T : unmanaged;

[Texture(TextureDimension.D2, TextureComponentTypes.Float)]
public struct Texture2D;

[Texture(TextureDimension.D2, TextureComponentTypes.GenericDefine)]
public struct Texture2D<T> where T : unmanaged;

[Texture(TextureDimension.D2, TextureComponentTypes.Float, Arrayed = true)]
public struct Texture2DArray;

[Texture(TextureDimension.D2, TextureComponentTypes.GenericDefine, Arrayed = true)]
public struct Texture2DArray<T> where T : unmanaged;

[Texture(TextureDimension.D2, TextureComponentTypes.GenericDefine, Multisampled = true)]
public struct Texture2DMS<T> where T : unmanaged;

[Texture(TextureDimension.D2, TextureComponentTypes.Float, Multisampled = true)]
public struct Texture2DMS;

[Texture(TextureDimension.D2, TextureComponentTypes.Float, Arrayed = true, Multisampled = true)]
public struct Texture2DMSArray;

[Texture(TextureDimension.D2, TextureComponentTypes.GenericDefine, Arrayed = true, Multisampled = true)]
public struct Texture2DMSArray<T> where T : unmanaged;

[Texture(TextureDimension.D3, TextureComponentTypes.Float)]
public struct Texture3D;

[Texture(TextureDimension.D3, TextureComponentTypes.GenericDefine)]
public struct Texture3D<T> where T : unmanaged;

[Texture(TextureDimension.Cube, TextureComponentTypes.Float)]
public struct TextureCube;

[Texture(TextureDimension.Cube, TextureComponentTypes.GenericDefine)]
public struct TextureCube<T> where T : unmanaged;

[Texture(TextureDimension.Cube, TextureComponentTypes.Float, Arrayed = true)]
public class TextureCubeArray;

[Texture(TextureDimension.Cube, TextureComponentTypes.GenericDefine, Arrayed = true)]
public class TextureCubeArray<T> where T : unmanaged;
```

### Vector, matrix and helper types

```csharp
namespace YotsubaShader.HlslSyntax.Types;

[Vector]
public partial struct bool2
{
    [VectorComponent(0)]
    public bool X;
    [VectorComponent(1)]
    public bool Y;
}

[Matrix]
public struct bool2x2
{
    [MatrixColumn(0)]
    public bool2 C0;
    [MatrixColumn(1)]
    public bool2 C1;
}

[Matrix]
public struct bool2x3
{
    [MatrixColumn(0)]
    public bool2 C0;
    [MatrixColumn(1)]
    public bool2 C1;
    [MatrixColumn(2)]
    public bool2 C2;
}

[Matrix]
public struct bool2x4
{
    [MatrixColumn(0)]
    public bool2 C0;
    [MatrixColumn(1)]
    public bool2 C1;
    [MatrixColumn(2)]
    public bool2 C2;
    [MatrixColumn(3)]
    public bool2 C3;
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

[Matrix]
public struct bool3x2
{
    [MatrixColumn(0)]
    public bool3 C0;
    [MatrixColumn(1)]
    public bool3 C1;
}

[Matrix]
public struct bool3x3
{
    [MatrixColumn(0)]
    public bool3 C0;
    [MatrixColumn(1)]
    public bool3 C1;
    [MatrixColumn(2)]
    public bool3 C2;
}

[Matrix]
public struct bool3x4
{
    [MatrixColumn(0)]
    public bool3 C0;
    [MatrixColumn(1)]
    public bool3 C1;
    [MatrixColumn(2)]
    public bool3 C2;
    [MatrixColumn(3)]
    public bool3 C3;
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

[Matrix]
public struct bool4x2
{
    [MatrixColumn(0)]
    public bool4 C0;
    [MatrixColumn(1)]
    public bool4 C1;
}

[Matrix]
public struct bool4x3
{
    [MatrixColumn(0)]
    public bool4 C0;
    [MatrixColumn(1)]
    public bool4 C1;
    [MatrixColumn(2)]
    public bool4 C2;
}

[Matrix]
public struct bool4x4
{
    [MatrixColumn(0)]
    public bool4 C0;
    [MatrixColumn(1)]
    public bool4 C1;
    [MatrixColumn(2)]
    public bool4 C2;
    [MatrixColumn(3)]
    public bool4 C3;
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
    public float2 C0;
    [MatrixColumn(1)]
    public float2 C1;
    [MatrixColumn(2)]
    public float2 C2;
}

[Matrix]
public partial struct float2x4
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
    public float3 C0;
    [MatrixColumn(1)]
    public float3 C1;
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
    public float3 C0;
    [MatrixColumn(1)]
    public float3 C1;
    [MatrixColumn(2)]
    public float3 C2;
    [MatrixColumn(3)]
    public float3 C3;
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
    public float4 C0;
    [MatrixColumn(1)]
    public float4 C1;
}

[Matrix]
public partial struct float4x3
{
    [MatrixColumn(0)]
    public float4 C0;
    [MatrixColumn(1)]
    public float4 C1;
    [MatrixColumn(2)]
    public float4 C2;
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

[Vector]
public partial struct int2
{
    [VectorComponent(0)]
    public int X;
    [VectorComponent(1)]
    public int Y;
}

[Matrix]
public struct int2x2
{
    [MatrixColumn(0)]
    public int2 C0;
    [MatrixColumn(1)]
    public int2 C1;
}

[Matrix]
public struct int2x3
{
    [MatrixColumn(0)]
    public int2 C0;
    [MatrixColumn(1)]
    public int2 C1;
    [MatrixColumn(2)]
    public int2 C2;
}

[Matrix]
public struct int2x4
{
    [MatrixColumn(0)]
    public int2 C0;
    [MatrixColumn(1)]
    public int2 C1;
    [MatrixColumn(2)]
    public int2 C2;
    [MatrixColumn(3)]
    public int2 C3;
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

[Matrix]
public struct int3x2
{
    [MatrixColumn(0)]
    public int3 C0;
    [MatrixColumn(1)]
    public int3 C1;
}

[Matrix]
public struct int3x3
{
    [MatrixColumn(0)]
    public int3 C0;
    [MatrixColumn(1)]
    public int3 C1;
    [MatrixColumn(2)]
    public int3 C2;
}

[Matrix]
public struct int3x4
{
    [MatrixColumn(0)]
    public int3 C0;
    [MatrixColumn(1)]
    public int3 C1;
    [MatrixColumn(2)]
    public int3 C2;
    [MatrixColumn(3)]
    public int3 C3;
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

[Matrix]
public struct int4x2
{
    [MatrixColumn(0)]
    public int4 C0;
    [MatrixColumn(1)]
    public int4 C1;
}

[Matrix]
public struct int4x3
{
    [MatrixColumn(0)]
    public int4 C0;
    [MatrixColumn(1)]
    public int4 C1;
    [MatrixColumn(2)]
    public int4 C2;
}

[Matrix]
public struct int4x4
{
    [MatrixColumn(0)]
    public int4 C0;
    [MatrixColumn(1)]
    public int4 C1;
    [MatrixColumn(2)]
    public int4 C2;
    [MatrixColumn(3)]
    public int4 C3;
}

[Vector]
public partial struct uint2
{
    [VectorComponent(0)]
    public uint X;
    [VectorComponent(1)]
    public uint Y;
}

[Matrix]
public struct uint2x2
{
    [MatrixColumn(0)]
    public uint2 C0;
    [MatrixColumn(1)]
    public uint2 C1;
}

[Matrix]
public struct uint2x3
{
    [MatrixColumn(0)]
    public uint2 C0;
    [MatrixColumn(1)]
    public uint2 C1;
    [MatrixColumn(2)]
    public uint2 C2;
}

[Matrix]
public struct uint2x4
{
    [MatrixColumn(0)]
    public uint2 C0;
    [MatrixColumn(1)]
    public uint2 C1;
    [MatrixColumn(2)]
    public uint2 C2;
    [MatrixColumn(3)]
    public uint2 C3;
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

[Matrix]
public struct uint3x2
{
    [MatrixColumn(0)]
    public uint3 C0;
    [MatrixColumn(1)]
    public uint3 C1;
}

[Matrix]
public struct uint3x3
{
    [MatrixColumn(0)]
    public uint3 C0;
    [MatrixColumn(1)]
    public uint3 C1;
    [MatrixColumn(2)]
    public uint3 C2;
}

[Matrix]
public struct uint3x4
{
    [MatrixColumn(0)]
    public uint3 C0;
    [MatrixColumn(1)]
    public uint3 C1;
    [MatrixColumn(2)]
    public uint3 C2;
    [MatrixColumn(3)]
    public uint3 C3;
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

[Matrix]
public struct uint4x2
{
    [MatrixColumn(0)]
    public uint4 C0;
    [MatrixColumn(1)]
    public uint4 C1;
}

[Matrix]
public struct uint4x3
{
    [MatrixColumn(0)]
    public uint4 C0;
    [MatrixColumn(1)]
    public uint4 C1;
    [MatrixColumn(2)]
    public uint4 C2;
}

[Matrix]
public struct uint4x4
{
    [MatrixColumn(0)]
    public uint4 C0;
    [MatrixColumn(1)]
    public uint4 C1;
    [MatrixColumn(2)]
    public uint4 C2;
    [MatrixColumn(3)]
    public uint4 C3;
}
```

> [!NOTE]
> The listings show what the package declares. Not every concept is lowered by every output target.

## The other syntaxes

```buttons
[GLSL](glsl.md)
[MSL](msl.md)
[SPIR-V](spirv.md)
[WGSL](wgsl.md)
```

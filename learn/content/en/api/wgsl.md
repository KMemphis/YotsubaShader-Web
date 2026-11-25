---
title: WGSL syntax API
summary: Every attribute and type of the YotsubaShader.WgslSyntax package, with its declaration, its concept and an example.
order: 5
---

API of the `YotsubaShader.WgslSyntax` package: the 24 attributes and the types of the WGSL syntax, inspired by **WGSL (WebGPU)**. Each entry shows the declaration as the package writes it, the concept the compiler reads from it, the same concept in the other four syntaxes, and an example.

Add the package to the shader project:

```bash
dotnet add package YotsubaShader.WgslSyntax
```

For a guided tour of the syntax, with every built-in value grouped by stage, see the [WGSL syntax](../reference/wgsl.md) page of the Documentation.

## Namespaces

The package splits its API in these namespaces. The attributes shared by every syntax (`ShaderStage`, `Location`, `Uniform`...) are in `YotsubaShader.Language`.

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax; // Built-in values, interface slots and method attributes
using YotsubaShader.WgslSyntax.Resources; // Resource attributes and resource types
using YotsubaShader.WgslSyntax.Resources.Types; // Texture and sampler types
using YotsubaShader.WgslSyntax.Types; // Vector, matrix and helper types
```

## Input attributes

Fields, parameters and properties that receive a value from the pipeline.

### @builtin_front_facing

`true` when the fragment belongs to a front-facing primitive.

```csharp
namespace YotsubaShader.WgslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[FrontFacingFlag]
public class @builtin_front_facing : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.WgslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `FrontFacingFlag`
- **Same concept in:** HLSL [SV_IsFrontFace](hlsl.md#sv-isfrontface) · GLSL [gl_FrontFacing](glsl.md#gl-frontfacing) · MSL [front_facing](msl.md#front-facing) · SPIR-V [BuiltIn_FrontFacing](spirv.md#builtin-frontfacing)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;

// Fragment stage input
public struct FragmentInput
{
    [@builtin_front_facing] public bool IsFrontFace;
}
```

### @builtin_global_invocation_id

Position of the invocation in the whole dispatch.

```csharp
namespace YotsubaShader.WgslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[GlobalInvocationId]
public class @builtin_global_invocation_id : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.WgslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `GlobalInvocationId`
- **Same concept in:** HLSL [SV_DispatchThreadID](hlsl.md#sv-dispatchthreadid) · GLSL [gl_GlobalInvocationID](glsl.md#gl-globalinvocationid) · MSL [thread_position_in_grid](msl.md#thread-position-in-grid) · SPIR-V [BuiltIn_GlobalInvocationId](spirv.md#builtin-globalinvocationid)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;
using YotsubaShader.WgslSyntax.Types;

// Compute stage input
public struct ComputeInput
{
    [@builtin_global_invocation_id] public vec3<uint> GlobalId;
}
```

### @builtin_instance_index

Index of the instance being drawn.

```csharp
namespace YotsubaShader.WgslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[InstanceIndex]
public class @builtin_instance_index : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.WgslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `InstanceIndex`
- **Same concept in:** HLSL [SV_InstanceID](hlsl.md#sv-instanceid) · GLSL [gl_InstanceIndex](glsl.md#gl-instanceindex) · MSL [instance_id](msl.md#instance-id) · SPIR-V [BuiltIn_InstanceIndex](spirv.md#builtin-instanceindex)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;

// Vertex stage input
public struct VertexInput
{
    [@builtin_instance_index] public uint InstanceIndex;
}
```

### @builtin_local_invocation_id

Position of the invocation inside its workgroup.

```csharp
namespace YotsubaShader.WgslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[LocalInvocationId]
public class @builtin_local_invocation_id : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.WgslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `LocalInvocationId`
- **Same concept in:** HLSL [SV_GroupThreadID](hlsl.md#sv-groupthreadid) · GLSL [gl_LocalInvocationID](glsl.md#gl-localinvocationid) · MSL [thread_position_in_threadgroup](msl.md#thread-position-in-threadgroup) · SPIR-V [BuiltIn_LocalInvocationId](spirv.md#builtin-localinvocationid)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;
using YotsubaShader.WgslSyntax.Types;

// Compute stage input
public struct ComputeInput
{
    [@builtin_local_invocation_id] public vec3<uint> LocalId;
}
```

### @builtin_local_invocation_index

Flattened index of the invocation inside its workgroup.

```csharp
namespace YotsubaShader.WgslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[LocalInvocationIndex]
public class @builtin_local_invocation_index : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.WgslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `LocalInvocationIndex`
- **Same concept in:** HLSL [SV_GroupIndex](hlsl.md#sv-groupindex) · GLSL [gl_LocalInvocationIndex](glsl.md#gl-localinvocationindex) · MSL [thread_index_in_threadgroup](msl.md#thread-index-in-threadgroup) · SPIR-V [BuiltIn_LocalInvocationIndex](spirv.md#builtin-localinvocationindex)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;

// Compute stage input
public struct ComputeInput
{
    [@builtin_local_invocation_index] public uint LocalIndex;
}
```

### @builtin_num_subgroups

Number of subgroups in the workgroup.

```csharp
namespace YotsubaShader.WgslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[NumberOfSubgroups]
public class @builtin_num_subgroups : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.WgslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `NumberOfSubgroups`
- **Same concept in:** GLSL [gl_NumSubgroups](glsl.md#gl-numsubgroups) · MSL [simdgroups_per_threadgroup](msl.md#simdgroups-per-threadgroup) · SPIR-V [BuiltIn_NumSubgroups](spirv.md#builtin-numsubgroups)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;

// Compute stage input
public struct ComputeInput
{
    [@builtin_num_subgroups] public uint SubgroupCount;
}
```

### @builtin_num_workgroups

Number of workgroups of the dispatch.

```csharp
namespace YotsubaShader.WgslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[NumberOfWorkgroups]
public class @builtin_num_workgroups : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.WgslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `NumberOfWorkgroups`
- **Same concept in:** GLSL [gl_NumWorkGroups](glsl.md#gl-numworkgroups) · MSL [threadgroups_per_grid](msl.md#threadgroups-per-grid) · SPIR-V [BuiltIn_NumWorkgroups](spirv.md#builtin-numworkgroups)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;
using YotsubaShader.WgslSyntax.Types;

// Compute stage input
public struct ComputeInput
{
    [@builtin_num_workgroups] public vec3<uint> GroupCount;
}
```

### @builtin_primitive_index

Index of the primitive the fragment belongs to.

```csharp
namespace YotsubaShader.WgslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[PrimitiveIndex]
public class @builtin_primitive_index : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.WgslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `PrimitiveIndex`
- **Same concept in:** HLSL [SV_PrimitiveID](hlsl.md#sv-primitiveid) · GLSL [gl_PrimitiveID](glsl.md#gl-primitiveid) · MSL [primitive_id](msl.md#primitive-id) · SPIR-V [BuiltIn_PrimitiveId](spirv.md#builtin-primitiveid)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;

// Fragment stage input
public struct FragmentInput
{
    [@builtin_primitive_index] public uint PrimitiveId;
}
```

### @builtin_sample_index

Index of the sample being shaded (multisampling).

```csharp
namespace YotsubaShader.WgslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[SampleIndex]
public class @builtin_sample_index : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.WgslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `SampleIndex`
- **Same concept in:** HLSL [SV_SampleIndex](hlsl.md#sv-sampleindex) · GLSL [gl_SampleID](glsl.md#gl-sampleid) · MSL [sample_id](msl.md#sample-id) · SPIR-V [BuiltIn_SampleId](spirv.md#builtin-sampleid)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;

// Fragment stage input
public struct FragmentInput
{
    [@builtin_sample_index] public uint SampleIndex;
}
```

### @builtin_subgroup_id

Index of the subgroup inside the workgroup.

```csharp
namespace YotsubaShader.WgslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[SubgroupId]
public class @builtin_subgroup_id : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.WgslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `SubgroupId`
- **Same concept in:** GLSL [gl_SubgroupID](glsl.md#gl-subgroupid) · MSL [simdgroup_index_in_threadgroup](msl.md#simdgroup-index-in-threadgroup) · SPIR-V [BuiltIn_SubgroupId](spirv.md#builtin-subgroupid)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;

// Compute stage input
public struct ComputeInput
{
    [@builtin_subgroup_id] public uint SubgroupId;
}
```

### @builtin_subgroup_invocation_id

Index of the invocation inside its subgroup.

```csharp
namespace YotsubaShader.WgslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[SubgroupInvocationId]
public class @builtin_subgroup_invocation_id : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.WgslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `SubgroupInvocationId`
- **Same concept in:** GLSL [gl_SubgroupInvocationID](glsl.md#gl-subgroupinvocationid) · MSL [thread_index_in_simdgroup](msl.md#thread-index-in-simdgroup) · SPIR-V [BuiltIn_SubgroupInvocationId](spirv.md#builtin-subgroupinvocationid)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;

// Compute stage input
public struct ComputeInput
{
    [@builtin_subgroup_invocation_id] public uint SubgroupLane;
}
```

### @builtin_subgroup_size

Number of invocations in a subgroup.

```csharp
namespace YotsubaShader.WgslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[SubgroupSize]
public class @builtin_subgroup_size : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.WgslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `SubgroupSize`
- **Same concept in:** GLSL [gl_SubgroupSize](glsl.md#gl-subgroupsize) · MSL [threads_per_simdgroup](msl.md#threads-per-simdgroup) · SPIR-V [BuiltIn_SubgroupSize](spirv.md#builtin-subgroupsize)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;

// Compute stage input
public struct ComputeInput
{
    [@builtin_subgroup_size] public uint SubgroupSize;
}
```

### @builtin_vertex_index

Index of the vertex being processed.

```csharp
namespace YotsubaShader.WgslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[VertexIndex]
public class @builtin_vertex_index : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.WgslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `VertexIndex`
- **Same concept in:** HLSL [SV_VertexID](hlsl.md#sv-vertexid) · GLSL [gl_VertexIndex](glsl.md#gl-vertexindex) · MSL [vertex_id](msl.md#vertex-id) · SPIR-V [BuiltIn_VertexIndex](spirv.md#builtin-vertexindex)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;

// Vertex stage input
public struct VertexInput
{
    [@builtin_vertex_index] public uint VertexIndex;
}
```

### @builtin_workgroup_id

Position of the workgroup in the dispatch.

```csharp
namespace YotsubaShader.WgslSyntax;

[AttributeUsage(AttributeUsagesTable.Input)]
[WorkgroupId]
public class @builtin_workgroup_id : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.WgslSyntax`
- **Applies to:** fields, parameters, properties
- **Concept:** `WorkgroupId`
- **Same concept in:** HLSL [SV_GroupID](hlsl.md#sv-groupid) · GLSL [gl_WorkGroupID](glsl.md#gl-workgroupid) · MSL [threadgroup_position_in_grid](msl.md#threadgroup-position-in-grid) · SPIR-V [BuiltIn_WorkgroupId](spirv.md#builtin-workgroupid)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;
using YotsubaShader.WgslSyntax.Types;

// Compute stage input
public struct ComputeInput
{
    [@builtin_workgroup_id] public vec3<uint> GroupId;
}
```

## Output attributes

Fields, parameters and return values that the stage produces.

### @builtin_clip_distances

Clip distance: a negative value clips the primitive against a user plane.

```csharp
namespace YotsubaShader.WgslSyntax;

[AttributeUsage(AttributeUsagesTable.Output)]
[ClipInstance]
public class @builtin_clip_distances : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.WgslSyntax`
- **Applies to:** fields, parameters, return values
- **Concept:** `ClipInstance`
- **Same concept in:** HLSL [SV_ClipDistanceN](hlsl.md#sv-clipdistancen) · GLSL [gl_ClipDistance](glsl.md#gl-clipdistance) · MSL [clip_distance](msl.md#clip-distance) · SPIR-V [BuiltIn_ClipDistance](spirv.md#builtin-clipdistance)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;

// Vertex stage output
public struct VertexOutput
{
    [@builtin_clip_distances] public float ClipDistance;
}
```

### @builtin_frag_depth

Depth written by the fragment stage, replacing the interpolated one.

```csharp
namespace YotsubaShader.WgslSyntax;

[AttributeUsage(AttributeUsagesTable.Output)]
[FragDepth]
public class @builtin_frag_depth(string mode = "") : YotsubaShaderConcept
{
    public string Mode { get; }
}
```

- **Namespace:** `YotsubaShader.WgslSyntax`
- **Applies to:** fields, parameters, return values
- **Concept:** `FragDepth`
- **Same concept in:** HLSL [SV_Depth](hlsl.md#sv-depth) · GLSL [gl_FragDepth](glsl.md#gl-fragdepth) · MSL [depth](msl.md#depth) · SPIR-V [BuiltIn_FragDepth](spirv.md#builtin-fragdepth)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;

// Fragment stage output
public struct FragmentOutput
{
    [@builtin_frag_depth] public float Depth;
}
```

## Input and output attributes

Values that a stage can receive or produce. The stage decides which.

### @builtin_position

Clip-space position written by the vertex stage.

```csharp
namespace YotsubaShader.WgslSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[ClipSpacePosition, FragmentCoordinate]
public class @builtin_position : ClipSpacePosition;
```

- **Namespace:** `YotsubaShader.WgslSyntax`
- **Applies to:** fields, parameters, properties, return values
- **Concept:** `ClipSpacePosition`, `FragmentCoordinate`
- **Same concept in:** HLSL [SV_Position](hlsl.md#sv-position), [SV_POSITION](hlsl.md#sv-position) · GLSL [gl_Position](glsl.md#gl-position), [gl_FragCoord](glsl.md#gl-fragcoord) · MSL [position](msl.md#position) · SPIR-V [BuiltIn_Position](spirv.md#builtin-position), [BuiltIn_FragCoord](spirv.md#builtin-fragcoord)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;
using YotsubaShader.WgslSyntax.Types;

// Vertex stage output
public struct VertexOutput
{
    [@builtin_position] public vec4<float> Position;
}
```

### @builtin_sample_mask

Coverage mask of the samples of the fragment.

```csharp
namespace YotsubaShader.WgslSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[SampleMask]
public class @builtin_sample_mask : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.WgslSyntax`
- **Applies to:** fields, parameters, properties, return values
- **Concept:** `SampleMask`
- **Same concept in:** HLSL [SV_Coverage](hlsl.md#sv-coverage) · GLSL [gl_SampleMask](glsl.md#gl-samplemask), [gl_SampleMaskIn](glsl.md#gl-samplemaskin) · MSL [sample_mask](msl.md#sample-mask) · SPIR-V [BuiltIn_SampleMask](spirv.md#builtin-samplemask)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;

// Fragment stage input
public struct FragmentInput
{
    [@builtin_sample_mask] public uint SampleMask;
}
```

### @location

Numbered interface slot: vertex inputs, values passed between stages and fragment outputs.

```csharp
namespace YotsubaShader.WgslSyntax;

[AttributeUsage(AttributeUsagesTable.InputOutput)]
[Location]
public class @location(int n) : YotsubaShaderConcept
{
    public int N;
}
```

- **Namespace:** `YotsubaShader.WgslSyntax`
- **Applies to:** fields, parameters, properties, return values
- **Concept:** `Location`
- **Same concept in:** HLSL [SV_Target](hlsl.md#sv-target) · GLSL [location](glsl.md#location) · MSL [attribute](msl.md#attribute), [color](msl.md#color) · SPIR-V [Location](spirv.md#location)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;
using YotsubaShader.WgslSyntax.Types;

// Vertex stage output
public struct VertexOutput
{
    [@location(0)] public vec4<float> Color;
}
```

## Method attributes

Attributes applied to an entry point method.

### @workgroup_size

Sets the workgroup size of a compute entry point.

```csharp
namespace YotsubaShader.WgslSyntax;

[AttributeUsage(AttributeUsagesTable.Method)]
[WorkgroupSizeMethod]
public class @workgroup_size(uint x, uint y = 1, uint z = 1) : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.WgslSyntax`
- **Applies to:** methods
- **Concept:** `WorkgroupSizeMethod`
- **Same concept in:** HLSL [numthreads](hlsl.md#numthreads) · GLSL [layout_local_size](glsl.md#layout-local-size)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;

public class Blur
{
    // Compute entry point
    [ShaderStage(Stage.Compute)]
    [@workgroup_size(8)]
    public void Main() { }
}
```

## Resource attributes

Uniform buffers, storage buffers and the binding slots of buffers, textures and samplers.

### @binding

Binding number of a resource inside its bind group.

```csharp
namespace YotsubaShader.WgslSyntax.Resources;

[AttributeUsage(AttributeUsagesTable.Resource)]
[BindingSlot, TextureSlot, SamplerSlot]
public class @binding(int n) : YotsubaShaderConcept
{
    public int N;
}
```

- **Namespace:** `YotsubaShader.WgslSyntax.Resources`
- **Applies to:** fields, parameters, properties
- **Concept:** `BindingSlot`, `TextureSlot`, `SamplerSlot`
- **Same concept in:** HLSL [register](hlsl.md#register) · GLSL [layout](glsl.md#layout) · MSL [buffer](msl.md#buffer), [sampler](msl.md#sampler), [texture](msl.md#texture) · SPIR-V [Binding](spirv.md#binding), [DescriptorSet](spirv.md#descriptorset)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;
using YotsubaShader.WgslSyntax.Resources;
using YotsubaShader.WgslSyntax.Resources.Types;

public class Surface
{
    [@group(0), @binding(0)]
    public texture_2d<float> Albedo;
}
```

### @group

Bind group of a resource. Use it together with `@binding`.

```csharp
namespace YotsubaShader.WgslSyntax.Resources;

[AttributeUsage(AttributeUsagesTable.Resource)]
[BindingSlot, TextureSlot, SamplerSlot]
public class @group(int s) : YotsubaShaderConcept
{
    public int S;
}
```

- **Namespace:** `YotsubaShader.WgslSyntax.Resources`
- **Applies to:** fields, parameters, properties
- **Concept:** `BindingSlot`, `TextureSlot`, `SamplerSlot`
- **Same concept in:** HLSL [register](hlsl.md#register) · GLSL [layout](glsl.md#layout) · MSL [buffer](msl.md#buffer), [sampler](msl.md#sampler), [texture](msl.md#texture) · SPIR-V [Binding](spirv.md#binding), [DescriptorSet](spirv.md#descriptorset)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;
using YotsubaShader.WgslSyntax.Resources;
using YotsubaShader.WgslSyntax.Resources.Types;

public class Surface
{
    [@group(0), @binding(0)]
    public texture_2d<float> Albedo;
}
```

### storage

Storage buffer. `storage_use.read` makes it read-only, `storage_use.read_write` read/write.

```csharp
namespace YotsubaShader.WgslSyntax.Resources;

[AttributeUsage(AttributeUsagesTable.Resource)]
[RWStorageBuffer, ReadOnlyStorageBuffer]
public class storage(storage_use use) : YotsubaShaderConcept
{
    public storage_use Use;
}
```

- **Namespace:** `YotsubaShader.WgslSyntax.Resources`
- **Applies to:** fields, parameters, properties
- **Concept:** `RWStorageBuffer`, `ReadOnlyStorageBuffer`
- **Same concept in:** GLSL [buffer](glsl.md#buffer) · MSL [device](msl.md#device) · SPIR-V [StorageBuffer](spirv.md#storagebuffer)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;
using YotsubaShader.WgslSyntax.Resources;

public class Resources
{
    [storage(storage_use.read_write), @group(0), @binding(1)]
    public float[] Output;
}
```

### uniform

Marks the field as a uniform (constant) buffer.

```csharp
namespace YotsubaShader.WgslSyntax.Resources;

[AttributeUsage(AttributeUsagesTable.Resource)]
[UniformBuffer]
public class uniform : YotsubaShaderConcept;
```

- **Namespace:** `YotsubaShader.WgslSyntax.Resources`
- **Applies to:** fields, parameters, properties
- **Concept:** `UniformBuffer`
- **Same concept in:** HLSL [cbuffer](hlsl.md#cbuffer) · GLSL [uniform](glsl.md#uniform) · MSL [constant](msl.md#constant) · SPIR-V [Uniform](spirv.md#uniform)

Example:

```csharp
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;
using YotsubaShader.WgslSyntax.Resources;

public struct Material
{
    // The contents of the uniform buffer
    public float Exposure;
}

public class Resources
{
    [uniform, @group(0), @binding(0)]
    public Material Material;
}
```

## Types

The types declared by the package. Members are listed without their bodies.

### Resource types

```csharp
namespace YotsubaShader.WgslSyntax.Resources;

public enum storage_use : int { read = 0, read_write = 1 }
```

### Texture and sampler types

```csharp
namespace YotsubaShader.WgslSyntax.Resources.Types;

[Sampler]
public struct sampler;

[Sampler]
public struct sampler_comparison;

[Texture(TextureDimension.D1, TextureComponentTypes.GenericDefine)]
public struct texture_1d<T> where T : unmanaged;

[Texture(TextureDimension.D2, TextureComponentTypes.GenericDefine)]
public struct texture_2d<T> where T : unmanaged;

[Texture(TextureDimension.D2, TextureComponentTypes.GenericDefine, Arrayed = true)]
public struct texture_2d_array<T> where T : unmanaged;

[Texture(TextureDimension.D3, TextureComponentTypes.GenericDefine)]
public struct texture_3d<T> where T : unmanaged;

[Texture(TextureDimension.Cube, TextureComponentTypes.GenericDefine)]
public struct texture_cube<T> where T : unmanaged;

[Texture(TextureDimension.Cube, TextureComponentTypes.GenericDefine, Arrayed = true)]
public struct texture_cube_array<T> where T : unmanaged;

[Texture(TextureDimension.D2, TextureComponentTypes.Float, Depth = TextureDepth.Yes)]
public struct texture_depth_2d;

[Texture(TextureDimension.D2, TextureComponentTypes.Float, Depth = TextureDepth.Yes, Arrayed = true)]
public struct texture_depth_2d_array;

[Texture(TextureDimension.Cube, TextureComponentTypes.Float, Depth = TextureDepth.Yes)]
public struct texture_depth_cube;

[Texture(TextureDimension.Cube, TextureComponentTypes.Float, Depth = TextureDepth.Yes, Arrayed = true)]
public struct texture_depth_cube_array;

[Texture(TextureDimension.D2, TextureComponentTypes.Float, Depth = TextureDepth.Yes, Multisampled = true)]
public struct texture_depth_multisampled_2d;

[Texture(TextureDimension.D2, TextureComponentTypes.Float)]
public struct texture_external;

[Texture(TextureDimension.D2, TextureComponentTypes.GenericDefine, Multisampled = true)]
public struct texture_multisampled_2d<T> where T : unmanaged;

[Texture(TextureDimension.D1, TextureComponentTypes.GenericDefine, Usage = TextureUsage.Storage)]
public struct texture_storage_1d<T1, T2>;

[Texture(TextureDimension.D2, TextureComponentTypes.GenericDefine, Usage = TextureUsage.Storage)]
public struct texture_storage_2d<T1, T2>;

[Texture(TextureDimension.D2, TextureComponentTypes.GenericDefine, Arrayed = true, Usage = TextureUsage.Storage)]
public struct texture_storage_2d_array<T1, T2>;

[Texture(TextureDimension.D3, TextureComponentTypes.GenericDefine, Usage = TextureUsage.Storage)]
public struct texture_storage_3d<T1, T2>;
```

### Vector, matrix and helper types

```csharp
namespace YotsubaShader.WgslSyntax.Types;

public struct __frexp_result_f16
{
    public System.Half fract;
    public int exp;
}

public struct __frexp_result_f32
{
    public float fract;
    public int exp;
}

public struct __frexp_result_vec2_f16
{
    public vec2<System.Half> fract;
    public vec2<int> exp;
}

public struct __frexp_result_vec2_f32
{
    public vec2<float> fract;
    public vec2<int> exp;
}

public struct __frexp_result_vec3_f16
{
    public vec3<System.Half> fract;
    public vec3<int> exp;
}

public struct __frexp_result_vec3_f32
{
    public vec3<float> fract;
    public vec3<int> exp;
}

public struct __frexp_result_vec4_f16
{
    public vec4<System.Half> fract;
    public vec4<int> exp;
}

public struct __frexp_result_vec4_f32
{
    public vec4<float> fract;
    public vec4<int> exp;
}

public struct __modf_result_f16
{
    public System.Half fract;
    public System.Half whole;
}

public struct __modf_result_f32
{
    public float fract;
    public float whole;
}

public struct __modf_result_vec2_f16
{
    public vec2<System.Half> fract;
    public vec2<System.Half> whole;
}

public struct __modf_result_vec2_f32
{
    public vec2<float> fract;
    public vec2<float> whole;
}

public struct __modf_result_vec3_f16
{
    public vec3<System.Half> fract;
    public vec3<System.Half> whole;
}

public struct __modf_result_vec3_f32
{
    public vec3<float> fract;
    public vec3<float> whole;
}

public struct __modf_result_vec4_f16
{
    public vec4<System.Half> fract;
    public vec4<System.Half> whole;
}

public struct __modf_result_vec4_f32
{
    public vec4<float> fract;
    public vec4<float> whole;
}

[Matrix]
public partial struct mat2x2<T> where T : unmanaged
{
    [MatrixColumn(0)]
    public vec2<T> C0;
    [MatrixColumn(1)]
    public vec2<T> C1;
}

[Matrix]
public partial struct mat2x3<T> where T : unmanaged
{
    [MatrixColumn(0)]
    public vec3<T> C0;
    [MatrixColumn(1)]
    public vec3<T> C1;
}

[Matrix]
public partial struct mat2x4<T> where T : unmanaged
{
    [MatrixColumn(0)]
    public vec4<T> C0;
    [MatrixColumn(1)]
    public vec4<T> C1;
}

[Matrix]
public partial struct mat3x2<T> where T : unmanaged
{
    [MatrixColumn(0)]
    public vec2<T> C0;
    [MatrixColumn(1)]
    public vec2<T> C1;
    [MatrixColumn(2)]
    public vec2<T> C2;
}

[Matrix]
public partial struct mat3x3<T> where T : unmanaged
{
    [MatrixColumn(0)]
    public vec3<T> C0;
    [MatrixColumn(1)]
    public vec3<T> C1;
    [MatrixColumn(2)]
    public vec3<T> C2;
}

[Matrix]
public partial struct mat3x4<T> where T : unmanaged
{
    [MatrixColumn(0)]
    public vec4<T> C0;
    [MatrixColumn(1)]
    public vec4<T> C1;
    [MatrixColumn(2)]
    public vec4<T> C2;
}

[Matrix]
public partial struct mat4x2<T> where T : unmanaged
{
    [MatrixColumn(0)]
    public vec2<T> C0;
    [MatrixColumn(1)]
    public vec2<T> C1;
    [MatrixColumn(2)]
    public vec2<T> C2;
    [MatrixColumn(3)]
    public vec2<T> C3;
}

[Matrix]
public partial struct mat4x3<T> where T : unmanaged
{
    [MatrixColumn(0)]
    public vec3<T> C0;
    [MatrixColumn(1)]
    public vec3<T> C1;
    [MatrixColumn(2)]
    public vec3<T> C2;
    [MatrixColumn(3)]
    public vec3<T> C3;
}

[Matrix]
public partial struct mat4x4<T> where T : unmanaged
{
    [MatrixColumn(0)]
    public vec4<T> C0;
    [MatrixColumn(1)]
    public vec4<T> C1;
    [MatrixColumn(2)]
    public vec4<T> C2;
    [MatrixColumn(3)]
    public vec4<T> C3;
}

[Vector]
public partial struct vec2<T> where T : unmanaged
{
    [VectorComponent(0)]
    public T X;
    [VectorComponent(1)]
    public T Y;
}

[Vector]
public partial struct vec3<T> where T : unmanaged
{
    [VectorComponent(0)]
    public T X;
    [VectorComponent(1)]
    public T Y;
    [VectorComponent(2)]
    public T Z;
}

[Vector]
public partial struct vec4<T> where T : unmanaged
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
[MSL](msl.md)
[SPIR-V](spirv.md)
```

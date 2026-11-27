---
title: "Resources"
summary: "Errors about textures, samplers and buffers: bindings and memory layout."
order: 14
---

Errors about textures, samplers and buffers: bindings and memory layout. 11 diagnostics. They apply to every shader, whatever graphics API you declare. The diagnostic ids are described in [Diagnostics](diagnostics.md).

## YS0301: Resource without a binding

**Severity:** Error

**Message:** '…' is … and has no binding. Add [Binding(n)] (and [DescriptorSet(n)]), [register(...)] or [layout(set, binding)].

Shader that triggers it:

```csharp
public class S { public Texture2D Tex; [ShaderStage(Stage.Fragment)] public float FS() { return 1f; } }
```

```text
error YS0301: 'Tex' is a texture and has no binding. Add [Binding(n)] (and [DescriptorSet(n)]),
    [register(...)] or [layout(set, binding)].
```

Shader that triggers it:

```csharp
public struct P { public float A; } public class S { public StructuredBuffer<P> Items; [ShaderStage(Stage.Fragment)] public float FS() { return 1f; } }
```

```text
error YS0301: 'Items' is a storage buffer and has no binding. Add [Binding(n)] (and
    [DescriptorSet(n)]), [register(...)] or [layout(set, binding)].
```

## YS0302: Duplicate binding

**Severity:** Error

**Message:** '…' and '…' use the same set … and binding ….

Shader that triggers it:

```csharp
public class S { [DescriptorSet(0)] [Binding(1)] public Texture2D A; [DescriptorSet(0)] [Binding(1)] public SamplerState B; [ShaderStage(Stage.Fragment)] public float FS() { return 1f; } }
```

```text
error YS0302: 'B' and 'A' use the same set 0 and binding 1.
```

## YS0303: Negative binding

**Severity:** Error

**Message:** '…' uses … …; it must be 0 or greater.

*This diagnostic has no example shader yet.*

## YS0304: HLSL register of another kind

**Severity:** Error

**Message:** '…' is … and uses the register '…'; the prefix for this resource is '…'.

Shader that triggers it:

```csharp
public class S { [register("s0")] public Texture2D Tex; [ShaderStage(Stage.Fragment)] public float FS() { return 1f; } }
```

```text
error YS0304: 'Tex' is a texture and uses the register 's'; the prefix for this resource is 't'.
```

## YS0305: Buffer that is not a struct

**Severity:** Error

**Message:** '…' is a buffer and its type '…' is not a struct. Wrap the data in a struct.

Shader that triggers it:

```csharp
public class S { [Uniform] [DescriptorSet(0)] [Binding(0)] public float Time; [ShaderStage(Stage.Fragment)] public float FS() { return 1f; } }
```

```text
error YS0305: 'Time' is a buffer and its type 'float' is not a struct. Wrap the data in a
    struct.
```

Shader that triggers it:

```csharp
public class S { [DescriptorSet(0)] [Binding(0)] public ConstantBuffer<float> Time; [ShaderStage(Stage.Fragment)] public float FS() { return 1f; } }
```

```text
error YS0305: 'Time' is a buffer and its type 'float' is not a struct. Wrap the data in a
    struct.
```

## YS0306: Badly declared resource

**Severity:** Error

**Message:** '…' …. Declare resources as instance fields of the shader.

Shader that triggers it:

```csharp
public struct P { public float4 C; } public class S { [Uniform] [DescriptorSet(0)] [Binding(0)] public P Globals { get; set; } [ShaderStage(Stage.Fragment)] public float FS() { return 1f; } }
```

```text
error YS0306: 'Globals' is a property. Declare resources as instance fields of the shader.
```

## YS0307: Type not valid in a buffer

**Severity:** Error

**Message:** '…' in the buffer '…' is '…': ….

Shader that triggers it:

```csharp
public struct P { public bool Flag; } public class S { [Uniform] [DescriptorSet(0)] [Binding(0)] public P Globals; [ShaderStage(Stage.Fragment)] public float FS() { return 1f; } }
```

```text
error YS0307: 'Flag' in the buffer 'Globals' is 'bool': bool is not allowed in a buffer shared
    with the CPU; use uint.
```

Shader that triggers it:

```csharp
public class S { [DescriptorSet(0)] [Binding(0)] public StructuredBuffer<bool> Flags; [ShaderStage(Stage.Fragment)] public float FS() { return 1f; } }
```

```text
error YS0307: 'T' in the buffer 'Flags' is 'bool': bool is not allowed in a buffer shared with
    the CPU; use uint.
```

## YS0308: Write to a read-only buffer

**Severity:** Error

**Message:** '…' is a read-only buffer and cannot be written.

Shader that triggers it:

```csharp
public struct D { public float[] V; } public class S { [YotsubaShader.WgslSyntax.Resources.storage(YotsubaShader.WgslSyntax.Resources.storage_use.read)] [DescriptorSet(0)] [Binding(0)] public D Data; [ShaderStage(Stage.Compute)] [numthreads(1,1,1)] public void CS() { Data.V[0] = 1f; } }
```

```text
error YS0308: 'Data' is a read-only buffer and cannot be written.
```

## YS0309: Location on a resource

**Severity:** Error

**Message:** '…' is a resource and has […]. Resources are bound with [Binding]/[DescriptorSet], not with locations or semantics.

Shader that triggers it:

```csharp
public class S { [DescriptorSet(0)] [Binding(0)] [TEXCOORD(0)] public Texture2D Tex; [ShaderStage(Stage.Fragment)] public float FS() { return 1f; } }
```

```text
error YS0309: 'Tex' is a resource and has [TEXCOORD]. Resources are bound with
    [Binding]/[DescriptorSet], not with locations or semantics.
```

## YS0310: Field with no meaning on the GPU

**Severity:** Error

**Message:** The field '…' is not a resource. To pass values from the CPU, group them in a struct with [Uniform] and [Binding].

Shader that triggers it:

```csharp
public class S { public float Scale; [ShaderStage(Stage.Fragment)] public float FS() { return 1f; } }
```

```text
error YS0310: The field 'Scale' is not a resource. To pass values from the CPU, group them in a
    struct with [Uniform] and [Binding].
```

## YS0311: Unsized array in the middle of a buffer

**Severity:** Error

**Message:** '…' is an unsized array and is not the last member of '…'. Only the last member of a storage buffer can be unsized.

*This diagnostic has no example shader yet.*


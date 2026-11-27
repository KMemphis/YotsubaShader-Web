---
title: "Entry points"
summary: "Errors about the methods marked with [ShaderStage]: shape, stage and compute group size."
order: 12
---

Errors about the methods marked with [ShaderStage]: shape, stage and compute group size. 9 diagnostics. They apply to every shader, whatever graphics API you declare. The diagnostic ids are described in [Diagnostics](diagnostics.md).

## YS0100: Invalid entry point

**Severity:** Error

**Message:** '…' cannot be an entry point: ….

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public T FS<T>() { return default(T); } }
```

```text
error YS0100: 'FS' cannot be an entry point: is generic.
```

## YS0101: Compute shader without a group size

**Severity:** Error

**Message:** The compute shader '…' needs a group size: add [numthreads(x, y, z)], [layout_local_size(...)] or [workgroup_size(...)].

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Compute)] public void CS() { } }
```

```text
error YS0101: The compute shader 'CS' needs a group size: add [numthreads(x, y, z)],
    [layout_local_size(...)] or [workgroup_size(...)].
```

## YS0102: Invalid group size

**Severity:** Error

**Message:** Dimension … of the group size of '…' is …; each dimension must be at least 1.

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Compute)] [numthreads(0, 1, 1)] public void CS() { } }
```

```text
error YS0102: Dimension x of the group size of 'CS' is 0; each dimension must be at least 1.
```

## YS0103: Direct call to an entry point

**Severity:** Error

**Message:** '…' is an entry point and cannot be called from shader code. Move the logic to a helper function.

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS() { return Helper(); } float Helper() { return FS(); } }
```

```text
error YS0103: 'FS' is an entry point and cannot be called from shader code. Move the logic to a
    helper function.
```

## YS0104: Group size too large

**Severity:** Error

**Message:** The group size …x…x… of '…' exceeds the GPU maximum (…).

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Compute)] [numthreads(64, 64, 1)] public void CS() { } }
```

```text
error YS0104: The group size 64x64x1 of 'CS' exceeds the GPU maximum (x ≤ 1024, y ≤ 1024, z ≤ 64
    and at most 1024 invocations in total).
```

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Compute)] [numthreads(1, 1, 65)] public void CS() { } }
```

```text
error YS0104: The group size 1x1x65 of 'CS' exceeds the GPU maximum (x ≤ 1024, y ≤ 1024, z ≤ 64
    and at most 1024 invocations in total).
```

## YS0105: Group size ignored

**Severity:** Warning

**Message:** The group size only has an effect in compute shaders; '…' is a … shader.

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Fragment)] [numthreads(8, 8, 1)] public float4 FS() { return new float4(); } }
```

```text
warning YS0105: The group size only has an effect in compute shaders; 'FS' is a fragment shader.
```

## YS0106: Several stages in one method

**Severity:** Error

**Message:** '…' has more than one [ShaderStage]. An entry point belongs to a single stage.

*This diagnostic has no example shader yet.*

## YS0107: Reference parameter in an entry point

**Severity:** Error

**Message:** The parameter '…' of '…' is '…'. An entry point only accepts normal parameters (inputs) and 'out' parameters (outputs).

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS([TEXCOORD(0)] ref float x) { return x; } }
```

```text
error YS0107: The parameter 'x' of 'FS' is 'ref'. An entry point only accepts normal parameters
    (inputs) and 'out' parameters (outputs).
```

## YS0108: Duplicate entry point

**Severity:** Error

**Message:** There are several entry points named '…' in '…'. The name of an entry point must be unique.

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS() { return 1f; } [ShaderStage(Stage.Fragment)] public float FS([TEXCOORD(0)] float x) { return x; } }
```

```text
error YS0108: There are several entry points named 'FS' in 'S'. The name of an entry point must
    be unique.
```


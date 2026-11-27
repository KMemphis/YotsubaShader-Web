---
title: "Use per stage"
summary: "Errors about operations that exist in one stage only."
order: 17
---

Errors about operations that exist in one stage only. 4 diagnostics. They apply to every shader, whatever graphics API you declare. The diagnostic ids are described in [Diagnostics](diagnostics.md).

## YS0601: Fragment-only operation

**Severity:** Error

**Message:** '…' … only exists in fragment shaders, and it is used from the … shader '…'.

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Vertex)] [return: SV_Position] public float4 VS([POSITION] float4 p) { float d = Intrinsic.ddx(p.X); return p; } }
```

```text
error YS0601: 'ddx' (screen-space derivative) only exists in fragment shaders, and it is used
    from the vertex shader 'VS'.
```

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Compute)] [numthreads(1,1,1)] public void CS() { Intrinsic.clip(1f); } }
```

```text
error YS0601: 'clip' (discards the fragment) only exists in fragment shaders, and it is used
    from the compute shader 'CS'.
```

## YS0602: Compute-only operation

**Severity:** Error

**Message:** '…' only exists in compute shaders, and it is used from the … shader '…'.

*This diagnostic has no example shader yet.*

## YS0603: Write to an input

**Severity:** Error

**Message:** '…' is a shader input and cannot be modified. Copy it to a local variable.

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS([TEXCOORD(0)] float x) { x = 2f; return x; } }
```

```text
error YS0603: 'x' is a shader input and cannot be modified. Copy it to a local variable.
```

## YS0604: Atomic on a local variable

**Severity:** Error

**Message:** The atomic operation '…' needs a storage buffer field as its target.

*This diagnostic has no example shader yet.*


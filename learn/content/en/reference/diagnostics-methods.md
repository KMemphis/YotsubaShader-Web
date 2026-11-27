---
title: "Methods"
summary: "Errors about the helper functions that are compiled for the GPU."
order: 15
---

Errors about the helper functions that are compiled for the GPU. 7 diagnostics. They apply to every shader, whatever graphics API you declare. The diagnostic ids are described in [Diagnostics](diagnostics.md).

## YS0401: Generic method in a shader

**Severity:** Error

**Message:** '…' is generic; shaders have no generics. Write one version per type.

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS() { return Id(1f); } T Id<T>(T x) { return x; } }
```

```text
error YS0401: 'Id' is generic; shaders have no generics. Write one version per type.
```

## YS0402: ref, in or out parameter in a helper function

**Severity:** Error

**Message:** The parameter '…' of '…' is '…'; helper functions do not support reference parameters yet. Return the value instead.

*This diagnostic has no example shader yet.*

## YS0403: params parameter in a shader

**Severity:** Error

**Message:** The parameter '…' of '…' is params; use a fixed-length array.

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS() { return Sum(1f, 2f); } float Sum(params float[] v) { return v[0]; } }
```

```text
error YS0403: The parameter 'v' of 'Sum' is params; use a fixed-length array.
```

## YS0404: Recursion

**Severity:** Error

**Message:** '…' is recursive (…). The GPU does not support recursion; rewrite it with a loop.

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS() { return F(3); } float F(int n) { return n <= 0 ? 0f : F(n - 1); } }
```

```text
error YS0404: 'F' is recursive (F → F). The GPU does not support recursion; rewrite it with a
    loop.
```

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS() { return A(3); } float A(int n) { return B(n); } float B(int n) { return A(n); } }
```

```text
error YS0404: 'A' is recursive (A → B → A). The GPU does not support recursion; rewrite it with
    a loop.
```

## YS0405: Virtual call

**Severity:** Error

**Message:** '…' is …; on the GPU there are only direct calls to concrete methods.

*This diagnostic has no example shader yet.*

## YS0406: Method without a GPU translation

**Severity:** Error

**Message:** '…' has no GPU translation. Use a YotsubaShader intrinsic or write the function in the shader.

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS() { return float.Parse("1"); } }
```

```text
error YS0406: 'float.Parse(string)' has no GPU translation. Use a YotsubaShader intrinsic or
    write the function in the shader.
```

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS() { return System.Math.BigMul(2, 3); } }
```

```text
error YS0406: 'Math.BigMul' has no GPU translation. Use a YotsubaShader intrinsic or write the
    function in the shader.
```

## YS0407: Async method or iterator

**Severity:** Error

**Message:** '…' is …; shaders have no async or iterators.

*This diagnostic has no example shader yet.*


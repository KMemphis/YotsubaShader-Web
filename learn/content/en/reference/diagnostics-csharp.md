---
title: "C# without a translation"
summary: "Errors about C# constructs that do not exist on the GPU."
order: 16
---

Errors about C# constructs that do not exist on the GPU. 8 diagnostics. They apply to every shader, whatever graphics API you declare. The diagnostic ids are described in [Diagnostics](diagnostics.md).

## YS0501: Unsupported statement

**Severity:** Error

**Message:** '…' does not exist on the GPU. …

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS() { try { return 1f; } catch { return 0f; } } }
```

```text
error YS0501: 'try/catch/finally' does not exist on the GPU. The GPU has no exceptions.
```

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS() { throw new System.Exception(); } }
```

```text
error YS0501: 'throw' does not exist on the GPU. The GPU has no exceptions; use a default value
    or discard.
```

## YS0502: Unsupported expression

**Severity:** Error

**Message:** '…' has no GPU translation. …

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS() { System.Func<float> f = () => 1f; return 1f; } }
```

```text
error YS0502: 'lambda' has no GPU translation. Shaders have no delegates; write a method.
```

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public unsafe float FS() { float x = 1f; float* p = &x; return *p; } }
```

```text
error YS0502: 'pointer' has no GPU translation. The GPU has no pointers in shader code.
```

## YS0503: Type not supported in the shader

**Severity:** Error

**Message:** '…' uses the type '…', which does not exist on the GPU.

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS() { string s = "a"; return 1f; } }
```

```text
error YS0503: 's' uses the type 'string', which does not exist on the GPU.
```

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS() { decimal d = 1m; return 1f; } }
```

```text
error YS0503: 'd' uses the type 'decimal', which does not exist on the GPU.
```

## YS0504: Unused object creation

**Severity:** Error

**Message:** The 'new …(...)' is not used; it has no effect on the GPU. Assign it or remove it.

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS() { new float4(); return 1f; } }
```

```text
error YS0504: The 'new float4(...)' is not used; it has no effect on the GPU. Assign it or
    remove it.
```

## YS0505: Mutable static field

**Severity:** Error

**Message:** '…' is a static field that is not constant. The GPU has no mutable global state; use 'const' or a resource.

Shader that triggers it:

```csharp
public class S { static float counter; [ShaderStage(Stage.Fragment)] public float FS() { counter += 1f; return counter; } }
```

```text
error YS0505: 'counter' is a static field that is not constant. The GPU has no mutable global
    state; use 'const' or a resource.
```

## YS0506: switch without a default case

**Severity:** Error

**Message:** The switch expression does not cover all values. Add a '_ => ...' arm.

*This diagnostic has no example shader yet.*

## YS0507: Unsupported array

**Severity:** Error

**Message:** …. On the GPU arrays have one dimension and a constant length.

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS([TEXCOORD(0)] int n) { float[] a = new float[n]; return 1f; } }
```

```text
error YS0507: The array length is not constant. On the GPU arrays have one dimension and a
    constant length.
```

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS() { float[,] a = new float[2, 2]; return 1f; } }
```

```text
error YS0507: Multidimensional arrays do not exist on the GPU. On the GPU arrays have one
    dimension and a constant length.
```

## YS0508: Intrinsic not supported with these arguments

**Severity:** Error

**Message:** '…' ….

*This diagnostic has no example shader yet.*


---
title: "Stage interface"
summary: "Errors about the inputs and outputs of each stage: built-ins, locations and semantics."
order: 13
---

Errors about the inputs and outputs of each stage: built-ins, locations and semantics. 21 diagnostics. They apply to every shader, whatever graphics API you declare. The diagnostic ids are described in [Diagnostics](diagnostics.md).

## YS0201: Built-in not valid in this stage

**Severity:** Error

**Message:** […] (…) does not exist in a … shader. It is used in: ….

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Compute)] [numthreads(1,1,1)] public void CS([SV_Position] float4 p) { } }
```

```text
error YS0201: [SV_Position] (Position) does not exist in a compute shader. It is used in: vertex
    (output).
```

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS([SV_VertexID] uint id) { return 1f; } }
```

```text
error YS0201: [SV_VertexID] (VertexIndex) does not exist in a fragment shader. It is used in:
    vertex (input).
```

## YS0202: Built-in in the wrong direction

**Severity:** Error

**Message:** […] (…) is … in a … shader, not ….

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Fragment)] [return: SV_Position] public float4 FS([SV_Position] float4 p) { return p; } }
```

```text
error YS0202: [SV_Position] (FragCoord) is an input in a fragment shader, not an output.
```

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Vertex)] [return: SV_Position] public float4 VS([SV_Position] float4 p) { return p; } }
```

```text
error YS0202: [SV_Position] (Position) is an output in a vertex shader, not an input.
```

## YS0203: Wrong type for the built-in

**Severity:** Error

**Message:** […] (…) must be …, but '…' is '…'.

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Vertex)] [return: SV_Position] public float3 VS([POSITION] float3 p) { return p; } }
```

```text
error YS0203: [SV_Position] (Position) must be float4, but 'return' is 'float3'.
```

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS([SV_IsFrontFace] uint f) { return 1f; } }
```

```text
error YS0203: [SV_IsFrontFace] (FrontFacing) must be bool, but 'f' is 'uint'.
```

## YS0204: Duplicate built-in

**Severity:** Error

**Message:** … appears more than once as … of '…'. Each built-in is declared only once per stage.

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Vertex)] public void VS([SV_Position] out float4 a, [SV_Position] out float4 b) { a = new float4(); b = new float4(); } }
```

```text
error YS0204: Position appears more than once as output of 'VS'. Each built-in is declared only
    once per stage.
```

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Vertex)] [return: SV_Position] public float4 VS([TEXCOORD(0)] float4 a, [TEXCOORD(0)] float4 b) { return a; } }
```

```text
error YS0204: TEXCOORD0 appears more than once as input of 'VS'. Each built-in is declared only
    once per stage.
```

## YS0205: Duplicate location

**Severity:** Error

**Message:** Location … of '…' overlaps with '…' in the … of '…'.

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public void FS([SV_Target(1)] out float a, [SV_Target(1)] out float b) { a = 1f; b = 2f; } }
```

```text
error YS0205: Location 1 of 'b' overlaps with 'a' in the outputs of 'FS'.
```

## YS0206: Conflicting interface attributes

**Severity:** Error

**Message:** '…' has both […] and […]. An interface member carries a single location, semantic or built-in.

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS([TEXCOORD(0)] [SV_Position] float4 p) { return 1f; } }
```

```text
error YS0206: 'p' has both [TEXCOORD] and [SV_Position]. An interface member carries a single
    location, semantic or built-in.
```

## YS0207: Interface member without a slot

**Severity:** Error

**Message:** '…' is … of '…' and has no location, semantic or built-in. Add for example [TEXCOORD(n)], [location(n)] or a built-in.

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS(float x) { return x; } }
```

```text
error YS0207: 'x' is input of 'FS' and has no location, semantic or built-in. Add for example
    [TEXCOORD(n)], [location(n)] or a built-in.
```

Shader that triggers it:

```csharp
public struct VsOut { [SV_Position] public float4 Pos; public float2 Uv; } public class S { [ShaderStage(Stage.Vertex)] public VsOut VS([POSITION] float4 p) { VsOut o; o.Pos = p; o.Uv = new float2(); return o; } }
```

```text
error YS0207: 'Uv' is output of 'VS' and has no location, semantic or built-in. Add for example
    [TEXCOORD(n)], [location(n)] or a built-in.
```

## YS0208: bool in the interface

**Severity:** Error

**Message:** '…' is bool; variables passed between stages cannot be bool on the GPU. Use uint or int.

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Vertex)] [return: SV_Position] public float4 VS([POSITION] float4 p, [TEXCOORD(0)] bool flag) { return p; } }
```

```text
error YS0208: 'flag' is bool; variables passed between stages cannot be bool on the GPU. Use
    uint or int.
```

## YS0209: Location in a compute shader

**Severity:** Error

**Message:** '…' has […], but a compute shader has no location inputs or outputs; only built-ins such as SV_DispatchThreadID.

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Compute)] [numthreads(1,1,1)] public void CS([TEXCOORD(0)] float x) { } }
```

```text
error YS0209: 'x' has [TEXCOORD], but a compute shader has no location inputs or outputs; only
    built-ins such as SV_DispatchThreadID.
```

Shader that triggers it:

```csharp
public class S { [TEXCOORD(0)] public float4 Uv; [ShaderStage(Stage.Compute)] [numthreads(1,1,1)] public void CS() { } }
```

```text
error YS0209: 'Uv' has [TEXCOORD], but a compute shader has no location inputs or outputs; only
    built-ins such as SV_DispatchThreadID.
```

## YS0210: Render target out of range

**Severity:** Error

**Message:** The render target … of '…' does not exist; valid indices are 0 to 7.

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Fragment)] [return: SV_Target(8)] public float4 FS() { return new float4(); } }
```

```text
error YS0210: The render target 8 of 'return' does not exist; valid indices are 0 to 7.
```

## YS0211: Negative location index

**Severity:** Error

**Message:** […] on '…' uses index …; it must be 0 or greater.

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Fragment)] [return: SV_Target(-1)] public float FS() { return 1f; } }
```

```text
error YS0211: [SV_Target] on 'return' uses index -1; it must be 0 or greater.
```

## YS0212: Semantic in a fragment output

**Severity:** Error

**Message:** '…' uses […] as the output of a fragment shader. Fragment outputs are render targets: use [SV_Target(n)] or [location(n)].

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Fragment)] [return: TEXCOORD(0)] public float4 FS() { return new float4(); } }
```

```text
error YS0212: 'return' uses [TEXCOORD] as the output of a fragment shader. Fragment outputs are
    render targets: use [SV_Target(n)] or [location(n)].
```

## YS0213: Interface array without a length

**Severity:** Error

**Message:** '…' is an array in the interface and its length is unknown. Specify the length with [ArrayLength(n)].

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Vertex)] [return: SV_Position] public float4 VS([POSITION] float4 p, [TEXCOORD(0)] float[] w) { return p; } }
```

```text
error YS0213: 'w' is an array in the interface and its length is unknown. Specify the length
    with [ArrayLength(n)].
```

## YS0214: Resource in the interface

**Severity:** Error

**Message:** '…' is … and cannot be passed between stages. Declare it as a shader field with [Binding].

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS([TEXCOORD(0)] Texture2D t) { return 1f; } }
```

```text
error YS0214: 't' is a texture and cannot be passed between stages. Declare it as a shader field
    with [Binding].
```

## YS0215: Fragment input without a vertex output

**Severity:** Error

**Message:** The input '…' (…) of '…' is not written by any output of the vertex shader '…'.

Shader that triggers it:

```csharp
public struct VsOut { [SV_Position] public float4 Pos; [TEXCOORD(0)] public float2 Uv; }
public struct PsIn { [SV_Position] public float4 Pos; [TEXCOORD(1)] public float2 Uv; }
public class S {
    [ShaderStage(Stage.Vertex)] public VsOut VS([POSITION] float4 p) { VsOut o; o.Pos = p; o.Uv = new float2(); return o; }
    [ShaderStage(Stage.Fragment)] public float4 FS(PsIn i) { return i.Pos; }
}
```

```text
error YS0215: The input 'Uv' (TEXCOORD1) of 'FS' is not written by any output of the vertex
    shader 'VS'.
```

## YS0216: Different types between stages

**Severity:** Error

**Message:** '…' is '…' in the vertex shader '…' and '…' in the fragment shader '…'.

Shader that triggers it:

```csharp
public struct VsOut { [SV_Position] public float4 Pos; [TEXCOORD(0)] public float2 Uv; }
public struct PsIn { [SV_Position] public float4 Pos; [TEXCOORD(0)] public float3 Uv; }
public class S {
    [ShaderStage(Stage.Vertex)] public VsOut VS([POSITION] float4 p) { VsOut o; o.Pos = p; o.Uv = new float2(); return o; }
    [ShaderStage(Stage.Fragment)] public float4 FS(PsIn i) { return i.Pos; }
}
```

```text
error YS0216: 'TEXCOORD' is 'float2' in the vertex shader 'VS' and 'float3' in the fragment
    shader 'FS'.
```

## YS0217: Descriptor in the interface

**Severity:** Error

**Message:** '…' has […], which is for resources (textures, samplers, buffers), not for inputs or outputs.

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS([Binding(0)] float x) { return x; } }
```

```text
error YS0217: 'x' has [Binding], which is for resources (textures, samplers, buffers), not for
    inputs or outputs.
```

## YS0218: Type not valid in the interface

**Severity:** Error

**Message:** '…' is '…', which cannot be passed between stages. Use scalars, vectors, matrices or arrays of them.

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS([TEXCOORD(0)] decimal x) { return 1f; } }
```

```text
error YS0218: 'x' is 'decimal', which cannot be passed between stages. Use scalars, vectors,
    matrices or arrays of them.
```

## YS0219: Built-in not supported yet

**Severity:** Error

**Message:** […] (…) is not supported by the YotsubaShader compiler yet.

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS([SV_Barycentrics] float3 b) { return 1f; } }
```

```text
error YS0219: [SV_Barycentrics] (BaryCoordKHR) is not supported by the YotsubaShader compiler
    yet.
```

## YS0220: Nested interface struct

**Severity:** Error

**Message:** '…' is a struct inside an interface struct. Declare its fields directly in '…'.

Shader that triggers it:

```csharp
public struct Inner { public float A; } public struct Outer { [SV_Position] public float4 P; public Inner I; } public class S { [ShaderStage(Stage.Vertex)] public Outer VS([POSITION] float4 p) { Outer o; o.P = p; o.I.A = 1f; return o; } }
```

```text
error YS0220: 'I' is a struct inside an interface struct. Declare its fields directly in
    'Outer'.
```

## YS0221: Vertex shader without a position

**Severity:** Warning

**Message:** The vertex shader '…' does not write SV_Position; the GPU will not be able to rasterize its primitives.

Shader that triggers it:

```csharp
public class S { [ShaderStage(Stage.Vertex)] [return: TEXCOORD(0)] public float4 VS([POSITION] float4 p) { return p; } }
```

```text
warning YS0221: The vertex shader 'VS' does not write SV_Position; the GPU will not be able to
    rasterize its primitives.
```


---
title: Binding resources
summary: How inputs, outputs and resources reach the GPU.
order: 2
---

The contract is the same in every format: the numbers you write in C# are the numbers your renderer uses. Take this shader (GLSL syntax):

```csharp
public struct Corner
{
    [location(0)] public vec2 Position;
    [location(1)] public vec2 Uv;
}

public class Sweep
{
    [uniform, layout(0, 0)]
    public Stopwatch Time;      // struct Stopwatch { public float Seconds; }

    [layout(0, 1)]
    public sampler2D Photo;

    [ShaderStage(Stage.Vertex)]
    public Pixel Vertex(Corner corner) { /* ... */ }

    [ShaderStage(Stage.Fragment)]
    [return: location(0)]
    public vec4 Fragment(PixelIn pixel) { /* ... */ }
}
```

## Vertex inputs and stage outputs

`[location(n)]` is the attribute slot of the vertex buffer. In the compiled GLSL it is the same number:

```glsl
layout(location = 0) in vec2 corner_Position;
layout(location = 1) in vec2 corner_Uv;
layout(location = 0) out vec2 _return_Uv;
```

The vertex output at `location(0)` is the fragment input at `location(0)`. The value of the fragment `[return: location(0)]` goes to color target 0.

| Format | Vertex input `location(n)` | Color output `location(0)` |
| --- | --- | --- |
| SPIR-V, GLSL, GLSL ES | `layout(location = n)` | `layout(location = 0) out` |
| HLSL | `TEXCOORDn` | `SV_Target0` |
| MSL | `[[user(locnN)]]` | `[[color(0)]]` |
| WGSL | `@location(n)` | `-> @location(0)` |

Create your vertex layout with one element per `location`, in the type the field has (`vec2` is two floats, `vec4` is four).

## Uniforms, textures and buffers

`[layout(set, binding)]` places a resource. A `[uniform]` struct becomes a uniform block with `std140` layout:

```glsl
layout(binding = 0, std140) uniform Stopwatch
{
    float Seconds;
} Time;
```

| Resource | GLSL | SPIR-V | HLSL | MSL | WGSL |
| --- | --- | --- | --- | --- | --- |
| Uniform struct at `layout(0, 0)` | `binding = 0` | `DescriptorSet 0`, `Binding 0` | `cbuffer … : register(b0)` | `constant … [[buffer(0)]]` | `@group(0) @binding(0) var<uniform>` |
| Texture `sampler2D` at `layout(0, 1)` | `binding = 1` | `DescriptorSet 0`, `Binding 1` | `Texture2D … : register(t1)` and `SamplerState … : register(s1)` | `texture2d … [[texture(0)]]` and `sampler … [[sampler(0)]]` | Not available: see below |

Things to know when you create the resources:

- In HLSL the members of the uniform struct are loose constants of the `cbuffer`, named `<Field>_<Member>` (`Time_Seconds`). The buffer contents are the same bytes as the C# struct.
- The GLSL is for OpenGL, which has no descriptor sets: the set number only reaches the SPIR-V (Vulkan). Below `#version 420` the GLSL has no `binding` either, and you place each resource from your program.
- In MSL the binding numbers are renumbered per kind: buffers, textures and samplers each count from 0 in order.
- A texture and its sampler travel together. In GLSL they are one `sampler2D`; in HLSL they use the same register number.
- WGSL keeps the set and the binding as `@group` and `@binding`. It has no texture with the sampler inside, so a shader with a GLSL `sampler2D` does not compile to `wgsl`: the CLI says so and names the field. Write the texture and the sampler as two fields, `Texture2D` and `SamplerState` in the HLSL style, and each one gets its own `@binding`.

## Entry points

Each stage method is an entry point with the name of the C# method (`Vertex`, `Fragment`). In GLSL the entry point is always `main`, because GLSL requires it; in HLSL and MSL the name is kept.

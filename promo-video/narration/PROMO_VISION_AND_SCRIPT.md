# YotsubaShader: Architectural Vision, Core UX & Video Production Brief

> **Document Purpose:** This document provides a complete technical, architectural, and communicative overview of **YotsubaShader** and **YotsubaShaderCross**. It is specifically structured with high contextual richness for AI agents, developers, and engine architects to understand the problem space, the software design, and the exact script/storyboard for audiovisual assets.

---

## 1. Executive Summary & Value Proposition

**YotsubaShader** is a modern, pure C# shader creation framework and compiler designed for the .NET ecosystem (targeting .NET 8+). It allows game developers and game engine creators to author **Graphics Pipelines** (Vertex and Fragment/Pixel shaders) and **Compute Pipelines** directly in idiomatic C#.

### The Core Architectural Paradigm:
1. **Shaders as First-Class C# Types:** Shaders are declared as standard C# classes, methods, and structs with full IDE autocomplete, Roslyn compile-time type validation, and zero context switching.
2. **Native Engine Type Mapping:** Game engine and framework developers can map their own existing math and resource types (`Vector2`, `Matrix4`, `Texture2D`, `SamplerState`) to native GPU types using simple attributes. Shaders use the engine's types directly, mapping 1:1 to GPU instructions (GLSL.std.450 / HLSL intrinsics) and SPIR-V types.
3. **Build-Time Compilation to SPIR-V:** At compilation (`dotnet build`), an incremental C# Source Generator compiles C# shader classes into standard binary SPIR-V, automatically injecting a partial class containing:
   - An embedded bytecode array: `public static ReadOnlySpan<byte> SpirV => ...;`
   - A complete reflection layout: `public static readonly ShaderReflection Reflection;`
4. **CLI for Asset Pipelines & CI/CD:** A companion command-line interface (`yotsuba compile`) parses `.csproj` project files, automatically discovers all shader definitions, and compiles/transpiles them into designated output directories.
5. **YotsubaShaderCross (Zero Native Dependencies):** A 1:1 managed C# transpilation of Khronos' `SPIRV-Cross` for .NET 8. It allows runtime or build-time transpilation of SPIR-V into HLSL, Metal Shading Language (MSL), WGSL, GLSL, and GLSL ES without shipping a single unmanaged C++ library, native DLL, `.so`, or `.dylib`.
6. **Open Source & Permissive:** Released under the **Microsoft Public License (MS-PL)**.

---

## 2. Target Audience Profile & Industry Pain Points

### Primary Audience:
- **Architects and Maintainers of C# Game Engines & Graphics Frameworks:** Developers maintaining or building engines on top of Vulkan, DirectX 12/11, Metal, WebGPU, or OpenGL (e.g., Silk.NET, MonoGame, Stride, FNA, FlatRedBall, custom internal studio engines).
- **Advanced Graphics Programmers & Technical Artists in .NET.**

### The 4 Major Industry Headaches YotsubaShader Solves:

1. **The Native Toolchain & P/Invoke Nightmare:**
   - *Traditional approach:* To compile or transpile shaders across platforms (Windows, macOS, Linux, iOS, Android), .NET engines must bundle native unmanaged C++ binaries (`dxc.exe`, `glslangValidator`, native `spirv-cross.dll` / `.dylib` / `.so`).
   - *The problem:* Packaging native binaries across different OSs, ABIs (x64 vs arm64), and handling interop through P/Invoke creates massive maintenance friction, runtime crashes, and bloated NuGet packages.
   - *YotsubaShader solution:* The entire pipeline—from Roslyn C# parsing to SPIR-V emission and `YotsubaShaderCross` transpilation—is **100% managed C# in .NET 8**. It installs as standard NuGet packages and runs everywhere .NET runs.

2. **Type Duplication and Data Alignment Mismatches:**
   - *Traditional approach:* Developers write a struct in C# (e.g., `VertexPositionNormalColor`) and rewrite the identical struct in HLSL/GLSL.
   - *The problem:* Subtle differences in field padding, std140/std430 packing, matrix majorness (row-major vs column-major), and field order lead to visual artifacts or silent memory corruption that only appear at runtime.
   - *YotsubaShader solution:* Shaders and engine CPU code share the **exact same C# types and structs**. The compiler checks layouts and types at build time.

3. **Manual Shader Reflection & Pipeline State Object (PSO) Boilerplate:**
   - *Traditional approach:* Engine authors must parse SPIR-V or reflect bytecode at runtime using heavy external reflection libraries to discover descriptor set layouts, uniform buffer sizes, vertex input attributes, and texture bindings.
   - *YotsubaShader solution:* The source generator emits a structured `ShaderReflection` object alongside the bytecode, allowing engine renderers to configure bindings and create PSOs in a single clean line of code.

4. **Multi-Backend Fragmentation:**
   - *Traditional approach:* Authors must either write multiple shaders per backend or build complex preprocessor pipelines.
   - *YotsubaShader solution:* Author once in C# -> compiles to universal **SPIR-V** -> `YotsubaShaderCross` transpiles to HLSL, MSL, WGSL, or GLSL on-the-fly according to the active graphics backend.

---

## 3. Deep Dive: The Native Engine Type Mapping System

Engine authors do not want their users to be forced to import external, foreign math types. YotsubaShader provides a zero-overhead metadata mapping system using C# attributes.

### 1. Vector Mapping
By decorating an engine struct with `[Vector]` and its fields with `[VectorComponent(index)]`, YotsubaShader treats that struct as a GPU vector:

```csharp
namespace MyEngine.Math;

using YotsubaShader.Language.Native.Types.Vector;

[Vector]
public struct Vector2
{
    [VectorComponent(0)]
    public float X;

    [VectorComponent(1)]
    public float Y;

    public Vector2(float x, float y) { X = x; Y = y; }
    public static Vector2 operator +(Vector2 a, Vector2 b) => new(a.X + b.X, a.Y + b.Y);
}
```

### 2. Matrix Mapping
Matrices are defined as structs marked `[Matrix]`, where each column is an engine vector marked `[MatrixColumn(index)]`:

```csharp
namespace MyEngine.Math;

using YotsubaShader.Language.Native.Types.Matrix;

[Matrix]
public struct Matrix4
{
    [MatrixColumn(0)] public Vector4 Column0;
    [MatrixColumn(1)] public Vector4 Column1;
    [MatrixColumn(2)] public Vector4 Column2;
    [MatrixColumn(3)] public Vector4 Column3;
}
```

### 3. Resource Mapping (Textures & Samplers)
Engine resource classes are mapped to GPU images and samplers:

```csharp
namespace MyEngine.Graphics;

using YotsubaShader.Language.Native.Types;
using YotsubaShader.Language.Native.Types.Texture;

[Texture(TextureDimension.D2, TextureComponentTypes.Float)]
public class Texture2D
{
    // Native engine GPU handle, width, height, etc.
}

[Sampler]
public class SamplerState
{
    // Native engine sampler descriptor
}
```

### 4. 1:1 GPU Equivalence Table

| Engine C# Declaration | SPIR-V IR Equivalent | HLSL Equivalent | Metal (MSL) Equivalent | GLSL / OpenGL Equivalent |
|---|---|---|---|---|
| `MyEngine.Vector2` | `OpTypeVector %float 2` | `float2` | `float2` | `vec2` |
| `MyEngine.Vector4` | `OpTypeVector %float 4` | `float4` | `float4` | `vec4` |
| `MyEngine.Matrix4` | `OpTypeMatrix %v4float 4` | `float4x4` | `float4x4` | `mat4` |
| `MyEngine.Texture2D` | `OpTypeImage %float 2D` | `Texture2D` | `texture2d<float>` | `sampler2D` (or combined) |
| `MyEngine.SamplerState` | `OpTypeSampler` | `SamplerState` | `sampler` | `sampler` |
| `Gl450.Dot(a, b)` | `OpDot` / GLSL450 ext | `dot(a, b)` | `dot(a, b)` | `dot(a, b)` |
| `Gl450.Normalize(v)` | `GLSL.std.450 Normalize` | `normalize(v)` | `normalize(v)` | `normalize(v)` |

---

## 4. Code Examples: Graphics & Compute Pipelines

### A. Graphics Pipeline: Vertex + Fragment Shader
Attributes are placed in their own line above each declaration in idiomatic C# formatting:

```csharp
using MyEngine.Math;
using MyEngine.Graphics;
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

namespace MyGame.Shaders;

public struct VertexData
{
    [SV_Position]
    public Vector4 Position;

    [Color]
    public Vector4 Color;

    [Location(0)]
    public Vector2 TexCoord;
}

public class LitForwardShader
{
    [Uniform]
    public Texture2D MainTexture;

    [Uniform]
    public SamplerState LinearSampler;

    [ShaderStage(Stage.Vertex)]
    public VertexData VertexStage([SV_VertexID] uint vertexId)
    {
        VertexData output;
        output.Position = new Vector4(0, 0, 0, 1);
        output.Color = new Vector4(1, 1, 1, 1);
        output.TexCoord = new Vector2(0, 0);
        return output;
    }

    [ShaderStage(Stage.Fragment)]
    public Vector4 FragmentStage(VertexData input)
    {
        Vector4 sampled = MainTexture.Sample(LinearSampler, input.TexCoord);
        return sampled * input.Color;
    }
}
```

### B. Compute Pipeline: Compute Shader
```csharp
using MyEngine.Math;
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

namespace MyGame.Shaders;

public class ParticleSimulation
{
    [StorageBuffer]
    public Vector4[] ParticlePositions;

    [NumThreads(64, 1, 1)]
    [ShaderStage(Stage.Compute)]
    public void ComputeMain([SV_DispatchThreadID] uint3 dispatchId)
    {
        uint index = dispatchId.X;
        Vector4 current = ParticlePositions[index];
        // Perform GPU compute simulation using native C# types
        ParticlePositions[index] = current + new Vector4(0, -9.8f * 0.016f, 0, 0);
    }
}
```

---

## 5. Build Artifacts & Engine Integration

### Autogenerated Partial Class (`LitForwardShader.g.cs`)
When `dotnet build` runs, the incremental source generator analyzes the syntax and produces the following partial class directly in the same compilation unit:

```csharp
// <auto-generated by Yotsuba Shader />
#nullable enable

namespace MyGame.Shaders;

public partial class LitForwardShader
{
    [ShaderIgnore]
    public static ReadOnlySpan<byte> SpirV => new byte[]
    {
        0x03, 0x02, 0x23, 0x07, 0x00, 0x00, 0x01, 0x00, // SPIR-V Magic number & Version 1.6
        /* ... Bytecode SPIR-V embebido directamente en la clase C# ... */
    };

    [ShaderIgnore]
    public static readonly ShaderReflection Reflection = new ShaderReflection(
        entryPoints: new[] { "VertexStage", "FragmentStage" },
        resources: new ShaderResourceDescription[]
        {
            new("MainTexture", ShaderResourceType.SampledImage, set: 0, binding: 0),
            new("LinearSampler", ShaderResourceType.Sampler, set: 0, binding: 1)
        }
    );
}
```

### How the Engine Consumes It:
The engine's graphics device creates pipeline state objects with zero string lookups and zero external file dependencies:

```csharp
// In the engine renderer:
var pipeline = graphicsDevice.CreateGraphicsPipeline(
    shaderBytecode: LitForwardShader.SpirV,
    reflection: LitForwardShader.Reflection
);
```

---

## 6. YotsubaShaderCross: Pure C# Transpilation

`YotsubaShaderCross` is a 1:1 managed .NET 8 reimplementation of Khronos' SPIRV-Cross:

- **100% Managed C#:** Distributed as a single NuGet package (`YotsubaShaderCross`).
- **No Unmanaged C++ Code:** Zero `.dll`, `.so`, or `.dylib` files. No P/Invoke interop overhead or cross-compilation toolchain required.
- **Runtime Transpilation API:**
  ```csharp
  using YotsubaShaderCross;

  // Transpile to the active graphics API backend:
  string hlslCode = ShaderCross.Transpile(LitForwardShader.SpirV, Target.Hlsl);
  string mslCode  = ShaderCross.Transpile(LitForwardShader.SpirV, Target.Msl);
  string wgslCode = ShaderCross.Transpile(LitForwardShader.SpirV, Target.Wgsl);
  string glslCode = ShaderCross.Transpile(LitForwardShader.SpirV, Target.Glsl);
  ```

---

## 7. Video Storyboard & UX Direction

**Video Duration:** ~60 seconds  
**Target Resolution:** 4K UHD (3840x2160) @ 60 FPS  
**Pacing:** Technical, fast-paced, authoritative, developer-to-developer. Prioritizes UX and code legibility over abstract motion graphics.

| Scene | Duration | On-Screen Visuals (UX First) | Voiceover Key Points |
|---|---|---|---|
| **1. The Problem** | 0:00 – 0:08 | Architecture diagram of a C# engine. Red callouts showing foreign `.hlsl` files, duplicated structs, and platform-specific native C++ DLL folders. | Engine authors struggling with native C++ dependencies, P/Invoke, and duplicated types between CPU and GPU. |
| **2. Engine Type Mapping** | 0:08 – 0:20 | Code editor showing `MyEngine.Vector2` with `[Vector]` & `[VectorComponent]`, alongside `Texture2D` and `SamplerState`. Side-by-side equivalence table: `MyEngine.Vector2` = `float2` (HLSL) = `vec2` (GLSL) = `OpTypeVector` (SPIR-V). | Decorate your engine's existing types once with simple attributes. Shaders use your exact types with GL450 math operations. |
| **3. Graphics & Compute** | 0:20 – 0:30 | Code editor demonstrating a full Vertex + Fragment shader class, followed by a Compute shader with `[NumThreads]`, using the engine's mapped types. | Write Graphics and Compute Pipelines directly in C# with full Roslyn compiler checks and IDE autocomplete. |
| **4. Source Generator** | 0:30 – 0:40 | Terminal executing `dotnet build`. Split screen showing `LitShader.g.cs` with `ReadOnlySpan<byte> SpirV` and `ShaderReflection`, followed by the engine consuming it in `CreateGraphicsPipeline`. | Build-time compilation embedding binary SPIR-V directly in the C# class and generating reflection to configure bindings in one line. |
| **5. CLI Alternative** | 0:40 – 0:48 | Terminal running `yotsuba compile EngineShaders.csproj --target spirv --output bin/shaders` with fast file generation. | For asset pipelines and CI/CD, the CLI discovers all shaders in a `.csproj` and outputs to disk. |
| **6. YotsubaShaderCross** | 0:48 – 0:58 | NuGet badge for `YotsubaShaderCross`. .NET 8 badge with "Zero Native Dependencies / No C++". Code snippet demonstrating runtime transpilation to HLSL, MSL, and WGSL. | 1:1 managed C# transpilation of SPIRV-Cross for .NET 8. Install via NuGet and transpile at runtime with zero native binaries. |
| **7. Outro & Call to Action** | 0:58 – 1:05 | Yotsuba Shader logo, "The Shader Toolchain for C# Game Engines", MS-PL License, GitHub URL, Web Playground, GitHub Sponsors button. | Open source under the MS-PL License. Try it in the Playground, integrate it today, and support development on GitHub Sponsors. |

---

## 8. Continuous Voiceover Scripts (for Gemini TTS)

### Spanish (Voz en off):
> "Si estás construyendo un motor de videojuegos o framework en C#, el pipeline de shaders siempre es un dolor de cabeza: dependencias nativas de C++, P/Invoke para transpilar, y tipos duplicados entre CPU y GPU.
> Yotsuba Shader te permite mapear los tipos propios de tu motor —como Vector2, Matrix4, Texture2D o SamplerState— a tipos nativos de GPU con simples atributos. Tus usuarios escriben shaders con tus mismos tipos y operaciones matemáticas GL450, mapeándose uno a uno con float2 de HLSL o vec2 de SPIR-V.
> Escribe Graphics y Compute Pipelines directamente en C# sin salir de tu solución, con autocompletado y validación de tipos en tiempo de compilación.
> Al compilar, el Source Generator crea una clase parcial con un ReadOnlySpan de byte con el SPIR-V embebido directamente en la clase C#, y un objeto de reflexión para que tu motor configure bindings, buffers y pipelines en una sola línea.
> O para tu pipeline de assets y CI, la CLI toma tu archivo csproj, descubre todos los shaders definidos y los compila al destino que elijas en tu carpeta de salida.
> ¿Y para múltiples plataformas? YotsubaShaderCross es una transpilación 1 a 1 de SPIRV-Cross a C# puro para .NET 8. Instálalo por NuGet y transpila a HLSL, Metal o WGSL en tiempo de ejecución, sin arrastrar una sola librería nativa de C++.
> El pipeline de shaders definitivo para creadores de motores en C#. De código abierto bajo licencia MS-PL. Pruébalo en el Playground e intégralo hoy, o apóyanos como sponsor para impulsar el desarrollo."

### English (Voiceover):
> "If you're building a game engine or framework in C#, handling shaders is always a headache: native C++ dependencies, P/Invoke wrappers to transpile, and duplicated types between CPU and GPU.
> Yotsuba Shader lets you map your engine's own types — like Vector2, Matrix4, Texture2D, or SamplerState — to native GPU types using simple attributes. Your users write shaders with your exact engine types and GL450 math operations, mapping one-to-one to float2 in HLSL or vec2 in SPIR-V.
> Write Graphics and Compute Pipelines directly in C# without leaving your solution, complete with editor autocomplete and compile-time type validation.
> At build time, the Source Generator creates a partial class with a ReadOnlySpan of byte with the SPIR-V embedded directly into the C# class, and a reflection object so your engine configures bindings, buffers, and pipelines in a single line.
> Or for your asset pipelines and CI, the CLI takes your csproj file, discovers all defined shaders, and compiles them to your chosen target in an output folder.
> And for multi-platform support? YotsubaShaderCross is a 1-to-1 transpilation of SPIRV-Cross into pure C# for .NET 8. Install it via NuGet and transpile to HLSL, Metal, or WGSL at runtime, without dragging a single unmanaged C++ dependency.
> The definitive shader toolchain for C# engine developers. Open source under the MS-PL License. Try it in the Playground and integrate it today, or support the project on GitHub Sponsors."

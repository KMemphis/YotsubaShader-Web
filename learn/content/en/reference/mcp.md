---
title: MCP server for AI assistants
summary: Give an AI assistant the whole reference of this site and 100 working example shaders through the Model Context Protocol.
order: 30
---

The **Yotsuba Shader MCP server** lets an AI assistant (Claude, Cursor, VS Code, Zed and any other client that speaks the [Model Context Protocol](https://modelcontextprotocol.io)) read this documentation and start from a working shader instead of guessing the syntax. It serves the pages of the [reference](/en/reference/), the [diagnostics](/en/reference/diagnostics/) and **100 example shaders: 20 for each of the five syntaxes** (HLSL, GLSL, MSL, SPIR-V and WGSL). The pages are available in English and Spanish.

Every example compiles with the analyzer and with the compiler for SPIR-V, GLSL, GLSL ES, HLSL, MSL and WGSL. The only exceptions are the two playground examples that use `sampler2D`, which has no WGSL form; their entry says so.

## Connect

The server runs on your machine and reads nothing but its own data. It ships inside the `yotsuba` tool, so if you have the compiler you already have it:

```bash
dotnet tool install --global YotsubaShader.Compiler.CLI
```

Add it to the configuration of your client:

```json
{
  "mcpServers": {
    "yotsubashader": {
      "command": "yotsuba",
      "args": ["mcp"]
    }
  }
}
```

In Claude Code the same is one command:

```bash
claude mcp add yotsubashader -- yotsuba mcp
```

> [!NOTE]
> There is also a Node build of the same server in the `mcp` folder of the web repository (`node src/stdio.mjs`). A hosted endpoint, for clients that only accept a URL, is planned.

## Tools

| Tool | What it does |
| --- | --- |
| `search_docs` | Full-text search over the reference and the diagnostics. |
| `list_docs` / `get_doc` | List the pages, and read one as Markdown. With `style`, only the code of that syntax. |
| `list_diagnostics` / `get_diagnostic` | The `YS0000` diagnostics, with message, severity and example. |
| `list_examples` / `search_examples` | Find example shaders by style, tag or technique. |
| `get_example` | The full C# source of an example. |

The server also exposes every page as a resource (`yotsuba://docs/en/hlsl`), every example (`yotsuba://examples/wgsl-plasma`) and a prompt, `write_shader`, that asks for a new shader grounded on the closest example.

## The examples

Each example is a complete fullscreen shader: a vertex stage that draws one triangle over the screen and a fragment stage that paints it, with a `Globals` uniform holding the time and the resolution. The same twenty effects exist in every syntax, so you can compare how one idea is written in each: plasma, Voronoi cells, fractal clouds, a raymarched sphere, the Mandelbrot and Julia sets, metaballs, a kaleidoscope, Truchet tiles, a checkerboard floor, a hexagonal grid, a starfield, a tunnel, fire, rainbow waves, a CRT screen, SDF shapes, moiré rings, domain warping and a sunset. The seven GLSL examples and the HLSL ocean of the [playground](https://yotsubashader.com) are included as they are.

```csharp style=hlsl
// Plasma (HLSL style)
[ShaderStage(Stage.Fragment)]
[return: SV_Target]
public float4 Fragment([SV_Position] float4 fragCoord)
{
    float t = Params.Time;
    float2 p = float2(fragCoord.X / Params.Resolution.X - 0.5f, fragCoord.Y / Params.Resolution.Y - 0.5f);
    float v = sin(p.X * 6.0f + t) + sin(p.Y * 7.0f - t * 1.3f);
    return float4(0.5f + 0.5f * sin(v), 0.5f + 0.5f * sin(v + 2.094f), 0.5f + 0.5f * sin(v + 4.188f), 1.0f);
}
```

```csharp style=glsl
// Plasma (GLSL style)
[ShaderStage(Stage.Fragment)]
public vec4 Fragment([gl_FragCoord] vec4 fragCoord)
{
    float t = Params.Time;
    vec2 p = vec2(fragCoord.X / Params.Resolution.X - 0.5f, fragCoord.Y / Params.Resolution.Y - 0.5f);
    float v = sin(p.X * 6.0f + t) + sin(p.Y * 7.0f - t * 1.3f);
    return vec4(0.5f + 0.5f * sin(v), 0.5f + 0.5f * sin(v + 2.094f), 0.5f + 0.5f * sin(v + 4.188f), 1.0f);
}
```

```csharp style=metal
// Plasma (MSL style)
[ShaderStage(Stage.Fragment)]
public float4 Fragment([position] float4 fragCoord)
{
    float t = Params.Time;
    float2 p = float2(fragCoord.X / Params.Resolution.X - 0.5f, fragCoord.Y / Params.Resolution.Y - 0.5f);
    float v = sin(p.X * 6.0f + t) + sin(p.Y * 7.0f - t * 1.3f);
    return float4(0.5f + 0.5f * sin(v), 0.5f + 0.5f * sin(v + 2.094f), 0.5f + 0.5f * sin(v + 4.188f), 1.0f);
}
```

```csharp style=vulkan
// Plasma (SPIR-V style)
[ShaderStage(Stage.Fragment)]
public vec4 Fragment([BuiltIn_FragCoord] vec4 fragCoord)
{
    float t = Params.Time;
    vec2 p = vec2(fragCoord.X / Params.Resolution.X - 0.5f, fragCoord.Y / Params.Resolution.Y - 0.5f);
    float v = Sin(p.X * 6.0f + t) + Sin(p.Y * 7.0f - t * 1.3f);
    return vec4(0.5f + 0.5f * Sin(v), 0.5f + 0.5f * Sin(v + 2.094f), 0.5f + 0.5f * Sin(v + 4.188f), 1.0f);
}
```

```csharp style=wgsl
// Plasma (WGSL style)
[ShaderStage(Stage.Fragment)]
public vec4<float> Fragment([@builtin_position] vec4<float> fragCoord)
{
    float t = Params.Time;
    vec2<float> p = vec2f(fragCoord.X / Params.Resolution.X - 0.5f, fragCoord.Y / Params.Resolution.Y - 0.5f);
    float v = sin(p.X * 6.0f + t) + sin(p.Y * 7.0f - t * 1.3f);
    return vec4f(0.5f + 0.5f * sin(v), 0.5f + 0.5f * sin(v + 2.094f), 0.5f + 0.5f * sin(v + 4.188f), 1.0f);
}
```

## Notes for assistants

- Components are `.X`, `.Y`, `.Z`, `.W`; swizzles such as `.XY` do not exist.
- `if`, `for` and local functions work, but a `break` inside a loop is better written as a condition around the body, as the Mandelbrot example does.
- In HLSL and MSL, `lerp` and `mix` of vectors take a weight per component: `lerp(a, b, float3(k))`.

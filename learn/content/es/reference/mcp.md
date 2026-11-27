---
title: Servidor MCP para asistentes de IA
summary: Dale a un asistente de IA toda la referencia de este sitio y 100 shaders de ejemplo que funcionan, mediante el Model Context Protocol.
order: 30
---

El **servidor MCP de Yotsuba Shader** permite que un asistente de IA (Claude, Cursor, VS Code, Zed y cualquier cliente que hable el [Model Context Protocol](https://modelcontextprotocol.io)) lea esta documentación y parta de un shader que funciona en vez de adivinar la sintaxis. Sirve las páginas de la [referencia](/es/reference/), los [diagnósticos](/es/reference/diagnostics/) y **100 shaders de ejemplo: 20 para cada una de las cinco sintaxis** (HLSL, GLSL, MSL, SPIR-V y WGSL). Las páginas están en español e inglés.

Cada ejemplo compila con el analizador y con el compilador para SPIR-V, GLSL, GLSL ES, HLSL, MSL y WGSL. Las únicas excepciones son los dos ejemplos del playground que usan `sampler2D`, que no tiene forma en WGSL; su ficha lo indica.

## Conectar

El servidor se ejecuta en tu máquina y solo lee sus propios datos. Viene dentro de la herramienta `yotsuba`, así que si tienes el compilador ya lo tienes:

```bash
dotnet tool install --global YotsubaShader.Compiler.CLI
```

Añádelo a la configuración de tu cliente:

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

En Claude Code es un solo comando:

```bash
claude mcp add yotsubashader -- yotsuba mcp
```

> [!NOTE]
> También hay una versión en Node del mismo servidor en la carpeta `mcp` del repo de la web (`node src/stdio.mjs`). Un endpoint alojado, para clientes que solo aceptan una URL, está planeado.

## Herramientas

| Herramienta | Qué hace |
| --- | --- |
| `search_docs` | Búsqueda de texto sobre la referencia y los diagnósticos. |
| `list_docs` / `get_doc` | Lista las páginas y lee una como Markdown. Con `style`, solo el código de esa sintaxis. |
| `list_diagnostics` / `get_diagnostic` | Los diagnósticos `YS0000`, con mensaje, gravedad y ejemplo. |
| `list_examples` / `search_examples` | Busca shaders de ejemplo por estilo, etiqueta o técnica. |
| `get_example` | El código C# completo de un ejemplo. |

El servidor también expone cada página como recurso (`yotsuba://docs/es/hlsl`), cada ejemplo (`yotsuba://examples/wgsl-plasma`) y un prompt, `write_shader`, que pide un shader nuevo apoyado en el ejemplo más parecido.

## Los ejemplos

Cada ejemplo es un shader de pantalla completa: una etapa de vértices que dibuja un triángulo sobre toda la pantalla y una etapa de fragmentos que la pinta, con un uniform `Globals` que guarda el tiempo y la resolución. Los mismos veinte efectos existen en todas las sintaxis, así que puedes comparar cómo se escribe una misma idea en cada una: plasma, celdas de Voronoi, nubes fractales, una esfera con raymarching, los conjuntos de Mandelbrot y Julia, metabolas, un caleidoscopio, teselas de Truchet, un suelo de ajedrez, una rejilla hexagonal, un campo de estrellas, un túnel, fuego, ondas arcoíris, una pantalla CRT, formas con SDF, anillos de moiré, distorsión de dominio y un atardecer. Los siete ejemplos GLSL y el océano HLSL del [playground](https://yotsubashader.com) se incluyen tal cual.

```csharp style=hlsl
// Plasma (estilo HLSL)
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
// Plasma (estilo GLSL)
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
// Plasma (estilo MSL)
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
// Plasma (estilo SPIR-V)
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
// Plasma (estilo WGSL)
[ShaderStage(Stage.Fragment)]
public vec4<float> Fragment([@builtin_position] vec4<float> fragCoord)
{
    float t = Params.Time;
    vec2<float> p = vec2f(fragCoord.X / Params.Resolution.X - 0.5f, fragCoord.Y / Params.Resolution.Y - 0.5f);
    float v = sin(p.X * 6.0f + t) + sin(p.Y * 7.0f - t * 1.3f);
    return vec4f(0.5f + 0.5f * sin(v), 0.5f + 0.5f * sin(v + 2.094f), 0.5f + 0.5f * sin(v + 4.188f), 1.0f);
}
```

## Notas para asistentes

- Los componentes son `.X`, `.Y`, `.Z`, `.W`; los swizzles como `.XY` no existen.
- `if`, `for` y las funciones locales funcionan, pero un `break` dentro de un bucle es mejor escribirlo como una condición alrededor del cuerpo, como hace el ejemplo de Mandelbrot.
- En HLSL y MSL, `lerp` y `mix` de vectores piden un peso por componente: `lerp(a, b, float3(k))`.

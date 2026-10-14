# Registro de funcionalidades — video promocional de Yotsuba Shader

Generado por `automation/verify.mjs` (resultado crudo en `verification.json`) y por inspección del repositorio.

## Verificado y grabado de verdad
| Qué se muestra | Evidencia |
|---|---|
| Escribir un shader en C# en el editor del Playground, con los tipos propios de `Types.cs` (`[Vector]`, `[VectorComponent]`) | Grabación real con Playwright (`recordings/playground*`) |
| Compilar con el pipeline de Yotsuba (Roslyn + `ShaderDiscovery` + `ShaderProcessor`, en WebAssembly) y ver los puntos de entrada `Vertex` y `Fragment` | Compilación real en ~33 ms; panel "Shaders" |
| Los 6 ejemplos del Playground (básico + los 5 estilos HLSL, GLSL, Metal, Vulkan, WGSL) compilan sin errores | `verification.json`: 6/6 sin errores, 2–3 puntos de entrada cada uno |
| El sitio web, la documentación y la página de licencia comercial | Grabaciones reales del sitio (`recordings/site-*`) |

## No existe todavía (las escenas llevan la etiqueta "CONCEPT PREVIEW")
| Funcionalidad | Estado en el repositorio |
|---|---|
| Source generator que escribe `Triangle.g.cs` con `CompiledCode` y `Reflection` | No existe. `YotsubaShader.Generator` solo genera la tabla de operaciones SPIR-V. |
| CLI `yotsuba compile` | No existe |
| API de biblioteca `YotsubaCompiler.Compile(...)` | No existe |
| `ShaderCompiledCode`, `ShaderReflection`, `Binaries` | Solo diseño (documentados en la web) |
| Emisión de SPIR-V desde C# en el Playground | `Ir` y `Spirv` devuelven `null` en `PlaygroundApi.Compile` |
| Ejecución del mismo shader en Vulkan, Metal y WebGPU | No existe; por eso el video no la muestra |
| `Transpile` (Naga) | No existe |

Las escenas "concept" usan el texto exacto de los ejemplos de la web (`../src/snippets.mjs`, sincronizado con `automation/sync-snippets.mjs`), no una salida real.

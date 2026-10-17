// Compatibilidad de backends: edición en español. Ejecuta ./build.sh (consulta README.md).
#import "template.typ": *

#show: refdoc.with(
  lang: "es",
  title: "Compatibilidad de backends",
  subtitle: "Qué backends gráficos admiten cada concepto del lenguaje, verificado con sus herramientas de shaders",
  edition: "Edición 1.0 · octubre de 2026 · Datos: tools/compat/compat.json del repositorio de la web",
)

Un shader escrito con Yotsuba Shader se compila a SPIR-V y se traduce al formato de cada backend gráfico. No todos los backends pueden expresar todos los conceptos: WebGPU no tiene capa de render target, WebGL 2 no tiene etapa de compute y Metal no tiene floats de 64 bits. Este documento indica, concepto por concepto, qué admite cada backend. Es el conjunto de reglas que usa el IDE para avisarte mientras escribes un shader.

= Cómo leerlo

#ref-table(columns: (0.9fr, 4fr), header: ("Estado", "Significado"),
  [#pill("Sí", ok-color)], [El concepto funciona. Al menos un traductor produjo una salida que el compilador propio del backend acepta, sin extensiones.],
  [#pill("Extensión", ext-color)], [Solo funciona con una extensión o una característica opcional, indicada en el detalle. El IDE muestra una advertencia.],
  [#pill("Se pierde", bad-color)], [La salida compila, pero el traductor eliminó el concepto sin avisar. Se trata como no admitido.],
  [#pill("Inválido", bad-color)], [El traductor produjo una salida, pero el compilador del backend la rechaza.],
  [#pill("No", bad-color)], [Ningún traductor puede expresar el concepto para este backend.],
  [#pill("Sin etapa", na-color)], [El backend no tiene esa etapa de shader (por ejemplo, compute en WebGL 2).],
)

#include "generated/compat-es.typ"

= Cómo se midió

Cada concepto es un shader pequeño. Los shaders HLSL se compilan a SPIR-V con DXC, y los conceptos que HLSL no puede escribir se escriben en GLSL de Vulkan y se compilan con glslang. Cada módulo SPIR-V se valida con `spirv-val` (Vulkan 1.2) y después lo traducen dos traductores independientes, *naga* y *SPIRV-Cross*, a HLSL (Shader Model 6), MSL, WGSL, GLSL 4.50 y GLSL ES 3.00. Cada salida la compila la herramienta propia del backend: DXC para Direct3D 12, el compilador `metal` de Apple para Metal, glslang para OpenGL y WebGL 2, y naga para WGSL. Un concepto se admite cuando al menos un traductor produce una salida que compila.

Límites: no se validó Direct3D 11 (FXC, Shader Model 5); ningún shader se ejecutó en un dispositivo real; los resultados dependen de las versiones de las herramientas indicadas arriba. Para regenerar los datos, ejecuta `node tools/compat/run.mjs` en el repositorio de la web.

= Cómo lo usa el IDE

Los destinos de un proyecto se indican una vez en su `.csproj`:

```xml
<PropertyGroup>
  <YotsubaTargets>spirv;hlsl;msl;wgsl;glsl;glsles</YotsubaTargets>
</PropertyGroup>
```

#ref-table(columns: (0.7fr, 1.4fr, 3fr), header: ("Destino", "Backend", "Diagnóstico en el editor"),
  [#c("spirv")], [Vulkan (SPIR-V)], [Error para _No_, _Inválido_ y _Se pierde_; advertencia para _Extensión_.],
  [#c("hlsl")], [Direct3D 12 (HLSL SM6)], [Las mismas reglas.],
  [#c("msl")], [Metal (MSL)], [Las mismas reglas.],
  [#c("wgsl")], [WebGPU (WGSL)], [Las mismas reglas.],
  [#c("glsl")], [OpenGL 4.5 (GLSL)], [Las mismas reglas.],
  [#c("glsles")], [WebGL 2 (GLSL ES 3.00)], [Las mismas reglas, más un error para cualquier etapa marcada _Sin etapa_.],
)

Las reglas son las mismas sea cual sea la sintaxis del shader: `[SV_RenderTargetArrayIndex]`, `[gl_Layer]`, `[render_target_array_index]` y `[BuiltIn_Layer]` son un mismo concepto y reciben un mismo diagnóstico. Quita un destino de `<YotsubaTargets>` y sus diagnósticos desaparecen.

// Referencia de sintaxis: edición en español. Ejecuta ./build.sh (consulta README.md).
#import "template.typ": *

#show: refdoc.with(
  lang: "es",
  title: "Referencia de sintaxis",
  subtitle: "Cada concepto del lenguaje en las sintaxis HLSL, GLSL, MSL, SPIR-V y WGSL",
  edition: "Edición 1.0 · octubre de 2026 · Generada a partir de los fuentes de atributos de los proyectos YotsubaShader.<X>Syntax",
)

Yotsuba Shader te deja escribir el mismo shader con los nombres de cinco lenguajes de shaders. Cada conjunto de nombres es una *sintaxis*, que se distribuye como un paquete propio con un namespace del mismo nombre. Todas se asocian a los mismos conceptos, así que el compilador produce la misma representación intermedia uses la que uses. La sintaxis nunca decide la salida: los destinos de compilación se eligen por separado, en la propiedad `<YotsubaTargets>` de tu proyecto.

#include "generated/syntax-es.typ"

= Notas

- *Posición y coordenada del fragmento.* `SV_Position`, `position` y `@builtin_position` son un solo atributo para ambas: en una salida del vertex es la posición en clip space y en una entrada del fragment es la coordenada del fragmento. GLSL y SPIR-V tienen un nombre para cada una (`gl_Position` / `gl_FragCoord`, `BuiltIn_Position` / `BuiltIn_FragCoord`).
- *Tamaño del grupo de trabajo.* HLSL, GLSL y WGSL lo declaran con un atributo de método (`numthreads`, `layout_local_size`, `@workgroup_size`). MSL y SPIR-V lo exponen como un valor integrado que el shader lee.
- *Varias formas en una celda* (por ejemplo `gl_SampleMask` / `gl_SampleMaskIn`) son la forma de salida y la de entrada del mismo concepto, o variantes equivalentes.
- *Una sintaxis por archivo.* Algunos nombres existen en más de una sintaxis (`uniform`, `buffer`). Importa un namespace de sintaxis por archivo para que no sean ambiguos.
- *Qué backend admite cada concepto* está en el PDF complementario, _Compatibilidad de backends_.

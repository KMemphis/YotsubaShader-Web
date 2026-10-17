// Syntax reference: English edition. Run ./build.sh (see README.md).
#import "template.typ": *

#show: refdoc.with(
  lang: "en",
  title: "Syntax reference",
  subtitle: "Every concept of the language in the HLSL, GLSL, MSL, SPIR-V and WGSL syntaxes",
  edition: "Edition 1.0 · October 2026 · Generated from the attribute sources of the YotsubaShader.<X>Syntax projects",
)

Yotsuba Shader lets you write the same shader with the names of five shading languages. Each set of names is a *syntax*, shipped as its own package with a namespace of the same name. They all map to the same concepts, so the compiler produces the same intermediate representation whichever one you use. The syntax never decides the output: the compilation targets are chosen separately, in the `<YotsubaTargets>` property of your project.

#include "generated/syntax-en.typ"

= Notes

- *Position and fragment coordinate.* `SV_Position`, `position` and `@builtin_position` are one attribute for both: on a vertex output it is the clip-space position, on a fragment input it is the fragment coordinate. GLSL and SPIR-V have a separate name for each (`gl_Position` / `gl_FragCoord`, `BuiltIn_Position` / `BuiltIn_FragCoord`).
- *Workgroup size.* HLSL, GLSL and WGSL declare it with a method attribute (`numthreads`, `layout_local_size`, `@workgroup_size`). MSL and SPIR-V expose it as a built-in value that the shader reads.
- *Several spellings in one cell* (for example `gl_SampleMask` / `gl_SampleMaskIn`) are the output and input forms of the same concept, or equivalent variants.
- *One syntax per file.* Some names exist in more than one syntax (`uniform`, `buffer`). Import one syntax namespace per file to keep them unambiguous.
- *Which backend supports each concept* is in the companion PDF, _Backend compatibility_.

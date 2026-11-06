# Website API documentation review

Reviewed against the local source checkout on 2026-11-06.

## Current documentation state

- The examples use the actual project names `YotsubaShader.Roslyn`,
  `YotsubaShader.Compiler.SpirV`, and `YotsubaShader.Example`.
- HLSL is the primary example vocabulary. Vertex, fragment, and compute entry
  points are represented by the current public `Stage` enum.
- The syntax references distinguish authoring vocabularies from output targets:
  HLSL, GLSL, MSL, SPIR-V, and WGSL-style attributes describe equivalent
  concepts, while WGSL output remains planned.
- Resource examples use the constructors and namespaces that exist in the
  syntax projects. The documentation does not present declarations as proof
  that every resource operation is lowered by every backend.
- SPIR-V translation examples use the actual `YotsubaShaderCross.Parser` and
  backend compiler classes rather than a nonexistent `Transpile.FromSpirVTo*`
  wrapper.
- The current compiler path is documented as a supported C# subset. It emits
  SPIR-V, HLSL, GLSL, GLSL ES, MSL, and C++ through the CLI and Playground
  APIs, while unsupported operations and incomplete engine integration remain
  explicit.
- The CLI `add` command is documented as the generator of
  `YotsubaShader.g.cs`, including its `ToSpirV`, `ToHlsl`, `ToGlsl`,
  `ToGlslEs`, and `ToMSL` extension methods.
- The Playground contract documents `diagnostics`, `shaders`, `spirv.text`,
  and `outputs`. It no longer promises an `ir` response field or a browser
  SPIR-V binary when the connected backend does not provide one.

## Verification

Run from the parent repository:

```sh
node Web/build.mjs --strict-i18n
python3 Web/tools/check-api-examples.py
git -C Web diff --check
```

The current verification results are:

- 61/61 shared examples, generated reference examples, and selected tutorial
  listings compile as C# against the current authoring source declarations.
- 96 localized pages build for English and Spanish, with internal links and
  Spanish translations checked by the strict build.
- The website build reflects the current Playground API: SPIR-V assembly text
  and backend source outputs are available; IR is not part of the response
  contract.

These checks do not establish complete support for arbitrary C# syntax,
resource sampling, engine runtime integration, GPU-driver compatibility, or
WGSL output. They verify that the documented examples and generated website
match the current source checkout.

## Repository build note

The parent solution build is the source-of-truth check for the compiler
projects. The current working tree also contains uncommitted changes in
`YotsubaShader.Example/TestCompilation.cs` and its project file; the example
test run currently reports failures caused by those dynamic compilation
references, so this review does not describe the test suite as fully passing.

No commit, push, deployment, or external communication was performed.

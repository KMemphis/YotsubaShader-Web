# Website API documentation review

Reviewed against the local source checkout on 2026-10-23.

## Corrections

- Updated project names to `YotsubaShader.Roslyn` and
  `YotsubaShader.Compiler.SpirV`, preserving the actual
  `YotsubaShader.Frontend.Tests` test-project name.
- Made HLSL the primary example vocabulary. Vertex output is reused as fragment
  input; the fragment return now declares `[return: SV_Target(0)]`.
- Distinguished `YotsubaShader.SpirvSyntax.Location(int)` from the parameterless
  concept marker `YotsubaShader.Concepts.LocationAttribute`.
- Replaced nonexistent shared resource APIs with syntax-specific declarations:
  HLSL `cbuffer`/`register`, SPIR-V `DescriptorSet`/`Binding`, and the actual
  constructors in the other vocabularies. Removed invented `ResourceAccess` and
  `StorageBuffer.Access` usage.
- Replaced the nonexistent `Transpile.FromSpirVTo*` wrapper with the actual
  `YotsubaShaderCross.Parser` and backend compiler API.
- Identified WGSL output and the C# conversion stub as unavailable; authoring
  vocabulary coverage is not backend implementation coverage.
- Corrected the IR `Shader` constructor and discovery model, including the
  `ParameterInfo.IsField` argument. These central declarations are now read from
  their source files during the website build.
- Distinguished SPIR-V operation-table generation from planned shader binary
  generation. Removed installation instructions for an unimplemented shader
  source-generator package and shader CLI.
- Replaced fictional IDE analyzer screenshots and diagnostic promises with the
  current status. The existing browser API provides C# diagnostics and discovery;
  its IR and SPIR-V response fields are currently null.
- Reworked engine integration, CPU debugging, native-type mapping, and library
  reuse articles to state their implementation boundaries.
- Corrected reference generation: strip constructor parameter metadata before
  printing signatures, preserve resource type namespaces, and avoid duplicate
  member names, including generic/non-generic type pairs.
- Updated English and Spanish text. Existing documentation URLs remain intact.

## Verification

Run from the parent repository:

```sh
python3 Web/tools/check-api-examples.py
node Web/build.mjs
git -C Web diff --check
```

Results for this review:

- 57/57 shared examples, generated reference examples, and selected tutorial
  listings compile as C# against the current authoring source declarations.
- The checker assembles the authoring projects into a temporary library and
  compiles independent examples against it. It does not build or modify the
  parent repository projects. Where a sample uses project vector names, the
  check supplies the website's explicitly annotated `Types.cs` definitions;
  this does not certify native mapping of unmodified MonoGame vector types.
- 112 localized pages built; all internal links resolve and all rendered Spanish
  text has translations. Older dictionary entries may remain unused.
- Documentation routes, HLSL's default tab, fragment output semantics, and removal
  of unavailable package installation instructions were checked.

These checks do **not** establish complete C# → IR → SPIR-V compilation, shader
semantic conformance, driver compatibility, or performance. The compiler source
projects were inspected, not modified or rebuilt by this review.

## Archived material

The earlier engine-guide PDFs, reference PDFs, editable ZIP, and `guide/` listings
were not regenerated. Links promoting them as current documentation were removed,
and `guide/README.md` identifies them as historical design material. Their files
remain recoverable at their existing paths. Promotional video frames and other
pre-rendered illustrations were not regenerated; the pipeline illustration now
has an explicit development-status caption.

No commit, push, deployment, or external communication was performed.

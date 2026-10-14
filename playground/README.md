# Playground compiler host (Blazor WebAssembly)

The website's playground UI (`/playground/`, `src/static/js/playground.js`) talks to the compiler through a small
backend object. This folder is the .NET side that provides it, and it is **connected**: Roslyn runs in the
browser, so C# diagnostics, completion, hover and signature help work today, before the Yotsuba pipeline is
finished.

```
Monaco (one model per file) ──► YotsubaPlayground backend ──► DotNet.invokeMethodAsync('Playground', ...)
                                                                   │  (WebAssembly)
                                                                   ▼
                                     PlaygroundApi  →  ProjectState (Roslyn AdhocWorkspace)
```

## What works

| Feature | State |
| --- | --- |
| Several `.cs` files (add, rename with double-click or F2, delete), saved in the browser, shareable link | done |
| Live C# diagnostics across files (`Analyze`) | done (Roslyn) |
| Completion, hover and signature help (`Complete`, `Hover`, `SignatureHelp`) | done (Roslyn Workspaces + Features) |
| `Compile`: diagnostics + `ShaderDiscovery.Find` + frontend validation | done |
| IR dump and SPIR-V text/binary in `Compile` | **TODO**: waits for the C# → IR → SPIR-V pipeline |

## No XNA by default

User code references only the .NET 8 reference assemblies (`Basic.Reference.Assemblies.Net80`) and
`YotsubaShader.Language`. `Microsoft.Xna.Framework` is **not** referenced. The default project has two files:

- `Types.cs`: your own `Vector2/3/4` and `Matrix4`, mapped to native GPU types with `[Vector]`, `[VectorComponent]`,
  `[Matrix]` and `[MatrixColumn]`.
- `Shader.cs`: the shader, written against those types.

`YotsubaShader.Language.dll` is embedded in the app as a resource (see `Playground.csproj`) because the runtime
cannot expose raw metadata of Webcil assemblies.

## Run it

```bash
cd Web
npm run playground      # dotnet publish + copy to src/static/playground-app/
npm run dev
```

Open http://localhost:4173/playground/ . The page finds `playground-app/_framework/blazor.boot.json` and connects by
itself. Without it, add `?demo=1` to preview the UI with sample data. The first load downloads roughly 80 MB
uncompressed (Roslyn Workspaces/Features are most of it; served compressed and cached afterwards).

## Add the pipeline output

Fill `Ir` and `Spirv` in `PlaygroundApi.Compile` once the pipeline exists:
`ShaderProcessor` for the IR dump and `SpirVModule.ToText()` / `SpirVCompiler.Compile()` for SPIR-V.

## JSON contract

Files travel as `[{ "name": "Shader.cs", "source": "..." }]`. `Compile` returns:

```jsonc
{
  "ok": true,
  "diagnostics": [{ "severity": "error|warning|info", "message": "", "line": 1, "column": 1, "id": "CS0103", "file": "Shader.cs" }],
  "shaders": [{ "name": "BasicColorShader", "fullName": "BasicColorShader",
                "entryPoints": [{ "name": "Vertex", "stage": "Vertex", "returnType": "VertexOutput",
                                  "parameters": [{ "name": "input", "type": "VertexInput", "slot": "Location(0)" }] }] }],
  "ir": "text dump of Shader / Function / Storage",
  "spirv": { "text": "OpCapability Shader ...", "base64": "optional binary for the .spv download" }
}
```

Any other backend works too: call `YotsubaPlayground.setBackend({ name, compile, analyze?, complete?, hover?, signatureHelp? })`
before the page script runs (signatures are documented at the top of `src/static/js/playground.js`).

## Notes

- `bin/`, `obj/`, `.playground-out/` and `src/static/playground-app/` are build output and are git-ignored.
- Nothing here modifies the compiler projects; they are referenced by relative path.

using YotsubaShader.Language.Compiler;

// Un punto de entrada, un formato
var vertex = Triangle.CompiledCode.Get(
    nameof(Triangle.Vertex), Binaries.SpirV);

// Cualquier shader, de la misma forma
foreach (var entry in Triangle.Reflection.EntryPoints)
{
    var bytes = Triangle.CompiledCode.Get(entry.Name, Binaries.SpirV);

    // ... la implementación de tus pipelines de gráficos y cómputo
}

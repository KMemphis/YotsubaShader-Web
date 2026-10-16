using YotsubaShader.Language.Compiler;

// One entry point, one format
var vertex = Triangle.CompiledCode.Get(
    nameof(Triangle.Vertex), Binaries.SpirV);

// Any shader, the same way
foreach (var entry in Triangle.Reflection.EntryPoints)
{
    var bytes = Triangle.CompiledCode.Get(entry.Name, Binaries.SpirV);

    // ... your graphics and compute pipeline implementation
}

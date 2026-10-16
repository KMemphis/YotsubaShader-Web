// What the source generator and the test framework provide. Only used to compile the listings.
global using Xunit;
using YotsubaShader.Language;
using YotsubaShader.Language.Compiler;
using YotsubaShader.Language.Compilation;

namespace Xunit
{
    public sealed class FactAttribute : Attribute { }

    public static class Assert
    {
        public static void Equal<T>(T expected, T actual) { if (!Equals(expected, actual)) throw new Exception($"{expected} != {actual}"); }
        public static void Contains<T>(T item, IEnumerable<T> items) { if (!items.Contains(item)) throw new Exception("missing"); }
    }
}

namespace YotsubaShader.Language.Compilation
{
    public sealed class ShaderCompiledCode
    {
        public bool Has(string entryPoint, Binaries format) => true;
        public ReadOnlySpan<byte> Get(string entryPoint, Binaries format) => default;
        public string GetText(string entryPoint, Binaries format) => "";
    }

    public sealed record EntryPointInfo(string Name, Stage Stage);

    public sealed record ResourceBinding(string Name, int Set, int Binding);

    public sealed class ShaderReflection
    {
        public IReadOnlyList<Binaries> BinaryFormats { get; } = Array.Empty<Binaries>();
        public IReadOnlyList<EntryPointInfo> EntryPoints { get; } = Array.Empty<EntryPointInfo>();
        public IReadOnlyList<ResourceBinding> Resources { get; } = Array.Empty<ResourceBinding>();
    }
}

// The generated half of Lit
public partial class Lit
{
    public static readonly ShaderCompiledCode CompiledCode = new();
    public static readonly ShaderReflection Reflection = new();
}

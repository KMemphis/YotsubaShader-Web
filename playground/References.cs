using System.Reflection;
using Microsoft.CodeAnalysis;

namespace YotsubaShader.Playground;

/// <summary>
/// References for the user's code: the .NET 8 reference assemblies plus YotsubaShader.Language.
/// Microsoft.Xna.Framework is intentionally NOT referenced; GPU types are declared in the user's own files.
/// </summary>
internal static class References
{
    public static IReadOnlyList<MetadataReference> Default { get; } = Build();

    private static List<MetadataReference> Build()
    {
        var list = new List<MetadataReference>(Basic.Reference.Assemblies.Net80.References.All);

        using var stream = typeof(References).Assembly.GetManifestResourceStream("YotsubaShader.Language.dll")
            ?? throw new InvalidOperationException("YotsubaShader.Language.dll is not embedded in the playground.");
        list.Add(MetadataReference.CreateFromStream(stream, filePath: "YotsubaShader.Language.dll"));
        return list;
    }
}

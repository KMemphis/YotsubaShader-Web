#region MS-PL License - Copyright (c) 2026 Memphis Yomael Núñez Cruz - Dominican Republic
/*
╔════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                    ║
║  ███╗   ███╗███████╗      ██████╗ ██╗                                              ║
║  ████╗ ████║██╔════╝      ██╔══██╗██║                                              ║
║  ██╔████╔██║███████╗█████╗██████╔╝██║                                              ║
║  ██║╚██╔╝██║╚════██║╚════╝██╔═══╝ ██║                                              ║
║  ██║ ╚═╝ ██║███████║      ██║     ███████╗                                         ║
║  ╚═╝     ╚═╝╚══════╝      ╚═╝     ╚══════╝                                         ║
║                                                                                    ║
╠════════════════════════════════════════════════════════════════════════════════════╣
║  Copyright (c) 2026 Memphis Yomael Núñez Cruz - Dominican Republic                 ║
╠════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                    ║
║  Microsoft Public License (MS-PL)                                                  ║
║                                                                                    ║
║  This license governs use of the accompanying software. If you use the software,   ║
║  you accept this license. If you do not accept the license, do not use the         ║
║  software.                                                                         ║
║                                                                                    ║
║  1. Definitions                                                                    ║
║  The terms "reproduce," "reproduction," "derivative works," and "distribution"     ║
║  have the same meaning here as under U.S. copyright law.                           ║
║  A "contribution" is the original software, to which copyright notices are         ║
║  attached, and any additions or changes to the software.                           ║
║  A "contributor" is any person that distributes its contribution under this        ║
║  license.                                                                          ║
║  "Licensed patents" are a contributor's patent claims that read directly on its    ║
║  contribution.                                                                     ║
║                                                                                    ║
║  2. Grant of Rights                                                                ║
║  (A) Copyright Grant- Subject to the terms of this license, including the license  ║
║  conditions and limitations in section 3, each contributor grants you a non-       ║
║  exclusive, worldwide, royalty-free copyright license to reproduce its             ║
║  contribution, prepare derivative works of its contribution, and distribute its    ║
║  contribution or any derivative works that you create.                             ║
║  (B) Patent Grant- Subject to the terms of this license, including the license     ║
║  conditions and limitations in section 3, each contributor grants you a non-       ║
║  exclusive, worldwide, royalty-free license under its licensed patents to make,    ║
║  have made, use, sell, offer for sale, import, and/or otherwise dispose of its     ║
║  contribution in the software or derivative works of the contribution in the       ║
║  software.                                                                         ║
║                                                                                    ║
║  3. Conditions and Limitations                                                     ║
║  (A) No Trademark License- This license does not grant you rights to use any       ║
║  contributors' name, logo, or trademarks.                                          ║
║  (B) If you bring a patent claim against any contributor over patents that you     ║
║  claim are infringed by the software, your patent license from such contributor    ║
║  to the software ends automatically.                                               ║
║  (C) If you distribute any portion of the software, you must retain all copyright, ║
║  patent, trademark, and attribution notices that are present in the software.      ║
║  (D) If you distribute any portion of the software in source code form, you may do ║
║  so only under this license by including a complete copy of this license with      ║
║  your distribution. If you distribute any portion of the software in compiled or   ║
║  object code form, you may only do so under a license that complies with this      ║
║  license.                                                                          ║
║  (E) The software is licensed "as-is." You bear the risk of using it. The          ║
║  contributors give no express warranties, guarantees or conditions. You may have   ║
║  additional consumer rights under your local laws which this license cannot        ║
║  change. To the extent permitted under your local laws, the contributors exclude   ║
║  the implied warranties of merchantability, fitness for a particular purpose and   ║
║  non-infringement.                                                                 ║
║                                                                                    ║
╚════════════════════════════════════════════════════════════════════════════════════╝
*/
#endregion

using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.Completion;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.QuickInfo;
using Microsoft.JSInterop;
using YotsubaShader.Roslyn;

namespace YotsubaShader.Playground;

/// <summary>
/// Entry points called from the website (Web/src/static/js/playground.js).
/// Everything takes the editor's files as JSON: [{ "name": "Shader.cs", "source": "..." }].
/// Roslyn analysis (diagnostics, completion, hover, signature help) works on plain C# today;
/// the Yotsuba pipeline (IR / SPIR-V) is added to <see cref="Compile"/> as it becomes available.
/// </summary>
public static class PlaygroundApi
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    // Namespaces hidden when attributes are displayed: YotsubaShader.Language and the five *Syntax vocabularies,
    // including their Resources sub-namespace (YotsubaShader.HlslSyntax.Resources.).
    private static readonly Regex AttributeNamespaces =
        new(@"YotsubaShader\.(?:Language|(?:Glsl|Hlsl|Msl|Spirv|Wgsl)Syntax(?:\.Resources)?)\.", RegexOptions.Compiled);

    private static async Task<IReadOnlyList<FileDto>> Load(string filesJson)
    {
        var files = JsonSerializer.Deserialize<List<FileDto>>(filesJson, Json) ?? [];
        await ProjectState.Instance.SyncAsync(files);
        return files;
    }

    /* ----------------------------------------------------------- diagnostics */

    [JSInvokable]
    public static async Task<string> Analyze(string filesJson)
    {
        await Load(filesJson);
        var compilation = await ProjectState.Instance.Project.GetCompilationAsync();
        return JsonSerializer.Serialize(new { diagnostics = Diagnostics(compilation!) }, Json);
    }

    private static List<DiagnosticDto> Diagnostics(Compilation compilation) =>
        compilation.GetDiagnostics()
            .Where(d => d.Severity != DiagnosticSeverity.Hidden && d.Location.IsInSource)
            .OrderBy(d => d.Location.SourceTree!.FilePath).ThenBy(d => d.Location.SourceSpan.Start)
            .Select(d =>
            {
                var span = d.Location.GetLineSpan();
                return new DiagnosticDto(
                    d.Severity switch { DiagnosticSeverity.Error => "error", DiagnosticSeverity.Warning => "warning", _ => "info" },
                    d.GetMessage(), span.StartLinePosition.Line + 1, span.StartLinePosition.Character + 1,
                    d.Id, span.EndLinePosition.Line + 1, span.EndLinePosition.Character + 1, d.Location.SourceTree!.FilePath);
            })
            .ToList();

    /* ------------------------------------------------------------ completion */

    [JSInvokable]
    public static async Task<string> Complete(string filesJson, string file, int offset)
    {
        await Load(filesJson);
        var doc = ProjectState.Instance.Document(file);
        var service = doc is null ? null : CompletionService.GetService(doc);
        if (doc is null || service is null) return "[]";

        var list = await service.GetCompletionsAsync(doc, offset, CompletionTrigger.Invoke);
        var items = list.ItemsList.Select(i => new CompletionDto(
            i.DisplayText, i.Tags.FirstOrDefault() ?? "", i.SortText, i.FilterText, i.InlineDescription)).ToList();
        return JsonSerializer.Serialize(items, Json);
    }

    /* ----------------------------------------------------------------- hover */

    [JSInvokable]
    public static async Task<string> Hover(string filesJson, string file, int offset)
    {
        await Load(filesJson);
        var doc = ProjectState.Instance.Document(file);
        var service = doc is null ? null : QuickInfoService.GetService(doc);
        var info = service is null ? null : await service.GetQuickInfoAsync(doc!, offset);
        if (info is null) return "null";

        var text = string.Join("\n\n", info.Sections.Select(s => string.Concat(s.TaggedParts.Select(t => t.Text))));
        return JsonSerializer.Serialize(new { text, start = info.Span.Start, length = info.Span.Length }, Json);
    }

    /* -------------------------------------------------------- signature help */

    [JSInvokable]
    public static async Task<string> SignatureHelp(string filesJson, string file, int offset)
    {
        await Load(filesJson);
        var doc = ProjectState.Instance.Document(file);
        if (doc is null) return "null";

        var root = await doc.GetSyntaxRootAsync();
        var model = await doc.GetSemanticModelAsync();
        if (root is null || model is null) return "null";

        var token = root.FindToken(Math.Max(0, offset - 1));
        var call = token.Parent?.AncestorsAndSelf().FirstOrDefault(n =>
            (n is InvocationExpressionSyntax { ArgumentList: { } a } && a.Span.Contains(offset - 1)) ||
            (n is ObjectCreationExpressionSyntax { ArgumentList: { } b } && b.Span.Contains(offset - 1)));
        if (call is null) return "null";

        var args = call switch
        {
            InvocationExpressionSyntax i => i.ArgumentList,
            ObjectCreationExpressionSyntax o => o.ArgumentList!,
            _ => null,
        };
        if (args is null) return "null";

        var info = model.GetSymbolInfo(call);
        var methods = (info.Symbol is null ? info.CandidateSymbols : [info.Symbol]).OfType<IMethodSymbol>().ToList();
        if (methods.Count == 0) return "null";

        int active = args.Arguments.GetSeparators().Count(s => s.SpanStart < offset);
        var signatures = methods.Select(m => new SignatureDto(
            m.ToDisplayString(SymbolDisplayFormat.MinimallyQualifiedFormat),
            m.Parameters.Select(p => p.ToDisplayString(SymbolDisplayFormat.MinimallyQualifiedFormat)).ToList())).ToList();
        int best = Math.Max(0, methods.FindIndex(m => m.Equals(info.Symbol, SymbolEqualityComparer.Default)));
        return JsonSerializer.Serialize(new { signatures, active, activeSignature = best }, Json);
    }

    /* --------------------------------------------------------------- compile */

    [JSInvokable]
    public static async Task<string> Compile(string filesJson, string style)
    {
        await Load(filesJson);
        var compilation = (await ProjectState.Instance.Project.GetCompilationAsync())!;
        var diagnostics = Diagnostics(compilation);
        bool ok = diagnostics.All(d => d.Severity != "error");
        var shaders = new List<ShaderDto>();

        if (ok)
        {
            try
            {
                foreach (var shader in ShaderDiscovery.Find(compilation))
                {
                    shaders.Add(new ShaderDto(shader.Name, shader.FullName, shader.EntryPoints.Select(e => new EntryPointDto(
                        e.Name, e.Stage.ToString(), e.ReturnType.ToDisplayString(SymbolDisplayFormat.MinimallyQualifiedFormat),
                        e.Parameters.Select(p => new ParameterDto(p.Name, p.Type.ToDisplayString(SymbolDisplayFormat.MinimallyQualifiedFormat),
                            string.Join(", ", p.Symbol.GetAttributes().Select(a => AttributeNamespaces.Replace(a.ToString()!, ""))))).ToList())).ToList()));
                }

                // Surface frontend validation errors (for example inconsistent vector components) as diagnostics.
                new ShaderProcessor().Process(compilation, CancellationToken.None);
            }
            catch (NotImplementedException)
            {
                // The frontend does not lower every construct yet; discovery results are still valid.
            }
            catch (Exception ex)
            {
                diagnostics.Add(new DiagnosticDto("error", ex.Message, 1, 1, ex.GetType().Name, File: null));
                ok = false;
            }
        }

        if (ok && shaders.Count == 0)
        {
            diagnostics.Add(new DiagnosticDto("info", "No shader found. Mark a method with [ShaderStage(Stage.Vertex)].", 1, 1, "YS0100", File: null));
        }

        var result = new CompileResult(ok, diagnostics, shaders, Ir: null, Spirv: null);
        return JsonSerializer.Serialize(result, Json);
    }
}

// JSON contract consumed by playground.js (camelCase on the wire).
public sealed record CompileResult(bool Ok, IReadOnlyList<DiagnosticDto> Diagnostics, IReadOnlyList<ShaderDto> Shaders, string? Ir, SpirvDto? Spirv);
public sealed record DiagnosticDto(string Severity, string Message, int Line, int Column, string? Id = null, int? EndLine = null, int? EndColumn = null, string? File = null);
public sealed record ShaderDto(string Name, string? FullName, IReadOnlyList<EntryPointDto> EntryPoints);
public sealed record EntryPointDto(string Name, string Stage, string ReturnType, IReadOnlyList<ParameterDto> Parameters);
public sealed record ParameterDto(string Name, string Type, string? Slot = null);
public sealed record SpirvDto(string Text, string? Base64 = null);
public sealed record CompletionDto(string Label, string Kind, string? SortText, string? FilterText, string? Detail);
public sealed record SignatureDto(string Label, IReadOnlyList<string> Parameters);

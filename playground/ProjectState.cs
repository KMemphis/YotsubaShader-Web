#region MIT License - Copyright (c) 2026 Memphis Yomael
/*
╔════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                    ║
║  ███╗   ███╗██╗████████╗    ██╗     ██╗ ██████╗███████╗███╗   ██╗███████╗███████╗  ║
║  ████╗ ████║██║╚══██╔══╝    ██║     ██║██╔════╝██╔════╝████╗  ██║██╔════╝██╔════╝  ║
║  ██╔████╔██║██║   ██║       ██║     ██║██║     █████╗  ██╔██╗ ██║███████╗█████╗    ║
║  ██║╚██╔╝██║██║   ██║       ██║     ██║██║     ██╔══╝  ██║╚██╗██║╚════██║██╔══╝    ║
║  ██║ ╚═╝ ██║██║   ██║       ███████╗██║╚██████╗███████╗██║ ╚████║███████║███████╗  ║
║  ╚═╝     ╚═╝╚═╝   ╚═╝       ╚══════╝╚═╝ ╚═════╝╚══════╝╚═╝  ╚═══╝╚══════╝╚══════╝  ║
║                                                                                    ║
╠════════════════════════════════════════════════════════════════════════════════════╣
║  Copyright (c) 2026 Memphis Yomael                                                 ║
╠════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                    ║
║  Permission is hereby granted, free of charge, to any person obtaining a copy      ║
║  of this software and associated documentation files (the "Software"), to deal     ║
║  in the Software without restriction, including without limitation the rights      ║
║  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell         ║
║  copies of the Software, and to permit persons to whom the Software is             ║
║  furnished to do so, subject to the following conditions:                          ║
║                                                                                    ║
║  The above copyright notice and this permission notice shall be included           ║
║  in all copies or substantial portions of the Software.                            ║
║                                                                                    ║
║  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR        ║
║  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,          ║
║  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE       ║
║  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER            ║
║  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,     ║
║  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE     ║
║  SOFTWARE.                                                                         ║
║                                                                                    ║
╚════════════════════════════════════════════════════════════════════════════════════╝
*/
#endregion

using System.Reflection;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.Host.Mef;
using Microsoft.CodeAnalysis.Text;

namespace YotsubaShader.Playground;

public sealed record FileDto(string Name, string Source);

/// <summary>An in-memory Roslyn project that mirrors the files shown in the editor.</summary>
internal sealed class ProjectState
{
    private static readonly string[] HostAssemblies =
    [
        "Microsoft.CodeAnalysis.Workspaces",
        "Microsoft.CodeAnalysis.CSharp.Workspaces",
        "Microsoft.CodeAnalysis.Features",
        "Microsoft.CodeAnalysis.CSharp.Features",
    ];

    private readonly AdhocWorkspace _workspace;
    private ProjectId _projectId;
    private readonly Dictionary<string, DocumentId> _documents = new(StringComparer.Ordinal);

    public static ProjectState Instance { get; } = new();

    private ProjectState()
    {
        // The default MEF discovery relies on probing; list the assemblies explicitly so it also works in WebAssembly.
        var assemblies = HostAssemblies.Select(n => Assembly.Load(new AssemblyName(n))).ToList();
        var host = MefHostServices.Create(assemblies);
        _workspace = new AdhocWorkspace(host);

        var options = new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary, allowUnsafe: true, nullableContextOptions: NullableContextOptions.Disable);
        var info = ProjectInfo.Create(ProjectId.CreateNewId(), VersionStamp.Create(), "Shader", "Shader", LanguageNames.CSharp,
            compilationOptions: options,
            parseOptions: new CSharpParseOptions(LanguageVersion.Latest),
            metadataReferences: References.Default);
        _projectId = _workspace.AddProject(info).Id;
    }

    /// <summary>Synchronises the workspace with the editor's files (adds, edits and removes documents).</summary>
    public async Task SyncAsync(IReadOnlyList<FileDto> files)
    {
        var wanted = files.ToDictionary(f => f.Name);

        foreach (var gone in _documents.Keys.Where(k => !wanted.ContainsKey(k)).ToList())
        {
            _workspace.TryApplyChanges(_workspace.CurrentSolution.RemoveDocument(_documents[gone]));
            _documents.Remove(gone);
        }

        foreach (var file in files)
        {
            if (_documents.TryGetValue(file.Name, out var id))
            {
                var current = await _workspace.CurrentSolution.GetDocument(id)!.GetTextAsync();
                if (current.ToString() != file.Source)
                {
                    _workspace.TryApplyChanges(_workspace.CurrentSolution.WithDocumentText(id, SourceText.From(file.Source)));
                }
            }
            else
            {
                var doc = _workspace.AddDocument(_projectId, file.Name, SourceText.From(file.Source));
                _documents[file.Name] = doc.Id;
            }
        }
    }

    public Project Project => _workspace.CurrentSolution.GetProject(_projectId)!;

    public Document? Document(string name) =>
        _documents.TryGetValue(name, out var id) ? _workspace.CurrentSolution.GetDocument(id) : null;
}

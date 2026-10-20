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

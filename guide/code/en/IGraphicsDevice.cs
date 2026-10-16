using YotsubaShader.Language;
using YotsubaShader.Language.Compilation;

namespace MyEngine.Graphics;

public interface IShaderModule : IDisposable { }

public interface IPipelineLayout : IDisposable { }

public interface IGraphicsDevice
{
    GraphicsApi Api { get; }

    IShaderModule CreateShaderModule(
        Stage stage, ReadOnlySpan<byte> code, string entryPoint);

    // One description of every resource: the API builds its own layout
    IPipelineLayout CreatePipelineLayout(
        IReadOnlyList<ResourceBinding> resources);

    IParameterSet CreateParameterSet(IPipelineLayout layout);
}

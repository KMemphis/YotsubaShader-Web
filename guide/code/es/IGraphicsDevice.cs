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

    // Una descripción de cada recurso: la API construye su propio layout
    IPipelineLayout CreatePipelineLayout(
        IReadOnlyList<ResourceBinding> resources);

    IParameterSet CreateParameterSet(IPipelineLayout layout);
}

using YotsubaShader.Language.Compiler;

namespace MyEngine.Graphics;

public enum GraphicsApi
{
    Vulkan, Direct3D11, Direct3D12, Metal, WebGpu, OpenGl, WebGl,
}

public static class ShaderFormats
{
    public static Binaries For(GraphicsApi api) => api switch
    {
        GraphicsApi.Vulkan => Binaries.SpirV,
        GraphicsApi.Direct3D11 or GraphicsApi.Direct3D12 => Binaries.Hlsl,
        GraphicsApi.Metal => Binaries.Msl,
        GraphicsApi.WebGpu => Binaries.Wgsl,
        GraphicsApi.OpenGl => Binaries.Glsl,
        GraphicsApi.WebGl => Binaries.GlslEs,
        _ => throw new ArgumentOutOfRangeException(nameof(api)),
    };
}

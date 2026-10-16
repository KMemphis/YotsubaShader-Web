using System.Runtime.CompilerServices;
using MyEngine.Graphics;
using YotsubaShader.Language.Compiler;
using YotsubaShader.Language.Compilation;

namespace MyEngine.Shaders;

[ShaderIgnore]
public abstract class ShaderBase
{
    [ShaderIgnore]
    private readonly IParameterSet parameters;

    [ShaderIgnore]
    protected ShaderBase(IParameterSet parameters, ShaderReflection reflection)
    {
        this.parameters = parameters;

        // Fail when the shader loads, not on the first frame that draws with it
        foreach (var resource in reflection.Resources)
        {
            if (!parameters.Has(resource.Name))
            {
                throw new InvalidOperationException(
                    $"The shader has no parameter named '{resource.Name}'.");
            }
        }
    }

    [ShaderIgnore]
    protected T Get<T>([CallerMemberName] string name = "") where T : unmanaged
        => parameters.Get<T>(name);

    [ShaderIgnore]
    protected void Set<T>(T value, [CallerMemberName] string name = "") where T : unmanaged
        => parameters.Set(name, value);

    [ShaderIgnore]
    protected Texture2D GetTexture([CallerMemberName] string name = "")
        => parameters.GetTexture(name)!;

    [ShaderIgnore]
    protected void SetTexture(Texture2D texture, [CallerMemberName] string name = "")
        => parameters.SetTexture(name, texture);

    [ShaderIgnore]
    protected SamplerState GetSampler([CallerMemberName] string name = "")
        => parameters.GetSampler(name)!;

    [ShaderIgnore]
    protected void SetSampler(SamplerState sampler, [CallerMemberName] string name = "")
        => parameters.SetSampler(name, sampler);
}

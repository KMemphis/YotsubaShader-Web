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

        // Falla al cargar el shader, no en el primer fotograma que dibuja con él
        foreach (var resource in reflection.Resources)
        {
            if (!parameters.Has(resource.Name))
            {
                throw new InvalidOperationException(
                    $"El shader no tiene ningún parámetro llamado '{resource.Name}'.");
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

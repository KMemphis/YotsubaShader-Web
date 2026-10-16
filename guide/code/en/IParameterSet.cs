namespace MyEngine.Graphics;

public interface IParameterSet
{
    bool Has(string name);

    // Plain data: numbers, vectors, matrices and structs of them
    T Get<T>(string name) where T : unmanaged;
    void Set<T>(string name, in T value) where T : unmanaged;

    // Resources: they are objects of your engine, not plain data
    Texture2D? GetTexture(string name);
    void SetTexture(string name, Texture2D texture);

    SamplerState? GetSampler(string name);
    void SetSampler(string name, SamplerState sampler);
}

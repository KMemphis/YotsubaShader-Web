namespace MyEngine.Graphics;

public interface IParameterSet
{
    bool Has(string name);

    // Datos simples: números, vectores, matrices y structs de ellos
    T Get<T>(string name) where T : unmanaged;
    void Set<T>(string name, in T value) where T : unmanaged;

    // Recursos: son objetos de tu motor, no datos simples
    Texture2D? GetTexture(string name);
    void SetTexture(string name, Texture2D texture);

    SamplerState? GetSampler(string name);
    void SetSampler(string name, SamplerState sampler);
}

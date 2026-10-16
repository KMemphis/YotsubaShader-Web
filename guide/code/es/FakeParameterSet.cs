public sealed class FakeParameterSet : IParameterSet
{
    private readonly Dictionary<string, object> values = new();

    public bool Has(string name) => true;

    public T Get<T>(string name) where T : unmanaged
        => values.TryGetValue(name, out var value) ? (T)value : default;

    public void Set<T>(string name, in T value) where T : unmanaged
        => values[name] = value;

    public Texture2D? GetTexture(string name)
        => values.TryGetValue(name, out var value) ? (Texture2D)value : null;

    public void SetTexture(string name, Texture2D texture) => values[name] = texture;

    public SamplerState? GetSampler(string name)
        => values.TryGetValue(name, out var value) ? (SamplerState)value : null;

    public void SetSampler(string name, SamplerState sampler) => values[name] = sampler;
}

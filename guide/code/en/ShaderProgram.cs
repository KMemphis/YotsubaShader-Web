using YotsubaShader.Language.Compilation;

namespace MyEngine.Graphics;

public sealed class ShaderProgram : IDisposable
{
    private static readonly Dictionary<(IGraphicsDevice, Type), ShaderProgram> cache = new();

    private readonly Dictionary<string, IShaderModule> modules;
    private readonly IPipelineLayout layout;

    public IParameterSet Parameters { get; }

    private ShaderProgram(
        Dictionary<string, IShaderModule> modules,
        IPipelineLayout layout,
        IParameterSet parameters)
    {
        this.modules = modules;
        this.layout = layout;
        Parameters = parameters;
    }

    public IShaderModule this[string entryPoint] => modules[entryPoint];

    // ShaderProgram.Load<Lit>(device): the generated half of Lit
    // declares two static fields, CompiledCode and Reflection.
    public static ShaderProgram Load<TShader>(IGraphicsDevice device)
    {
        var key = (device, typeof(TShader));
        if (cache.TryGetValue(key, out var loaded)) return loaded;

        var code = Read<ShaderCompiledCode>("CompiledCode");
        var reflection = Read<ShaderReflection>("Reflection");

        var format = ShaderFormats.For(device.Api);
        if (!reflection.BinaryFormats.Contains(format))
        {
            throw new NotSupportedException(
                $"{typeof(TShader).Name} was not compiled for {device.Api}: " +
                $"add '{format}' to YotsubaTargets.");
        }

        var modules = new Dictionary<string, IShaderModule>();
        foreach (var entry in reflection.EntryPoints)
        {
            modules[entry.Name] = device.CreateShaderModule(
                entry.Stage, code.Get(entry.Name, format), entry.Name);
        }

        var layout = device.CreatePipelineLayout(reflection.Resources);
        var program = new ShaderProgram(modules, layout, device.CreateParameterSet(layout));
        cache[key] = program;
        return program;

        static T Read<T>(string field) =>
            (T)typeof(TShader).GetField(field)!.GetValue(null)!;
    }

    public void Dispose()
    {
        foreach (var module in modules.Values) module.Dispose();
        layout.Dispose();
    }
}

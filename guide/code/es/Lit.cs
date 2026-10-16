using MyEngine;
using MyEngine.Graphics;
using MyEngine.Shaders;
using YotsubaShader.Language;
using YotsubaShader.Language.Resources;

public partial class Lit : ShaderBase
{
    public Lit(IParameterSet parameters) : base(parameters, Reflection) { }

    // Uniforms: una línea cada uno. El nombre sale de la propiedad.
    [Uniform, Binding(Sets.Frame, 0)]
    public FrameData Frame { get => Get<FrameData>(); set => Set(value); }

    [Uniform, Binding(Sets.Material, 0)]
    public MaterialData Material { get => Get<MaterialData>(); set => Set(value); }

    [Uniform, Binding(Sets.Object, 0)]
    public ObjectData Object { get => Get<ObjectData>(); set => Set(value); }

    // Texturas y samplers
    [Binding(Sets.Material, 1)]
    public Texture2D Albedo { get => GetTexture(); set => SetTexture(value); }

    [Binding(Sets.Material, 2)]
    public SamplerState Sampler { get => GetSampler(); set => SetSampler(value); }

    [ShaderStage(Stage.Vertex)]
    public VertexOutput Vertex(VertexInput input)
    {
        VertexOutput output;
        output.Position = new Vector4(
            input.Position.X, input.Position.Y, input.Position.Z, 1);
        output.Normal = input.Normal;
        output.UV = input.UV;
        return output;
    }

    [ShaderStage(Stage.Fragment)]
    public Vector4 Fragment(VertexOutput input)
    {
        return Material.Tint;
    }
}

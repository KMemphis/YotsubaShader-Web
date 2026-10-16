using Godot;
using YotsubaShader.Language.Resources;

public partial class Lit : ShaderMaterial
{
    [Uniform]
    public float Exposure
    {
        get => GetShaderParameter(nameof(Exposure)).AsSingle();
        set => SetShaderParameter(nameof(Exposure), value);
    }

    [Uniform]
    public Vector3 LightDirection
    {
        get => GetShaderParameter(nameof(LightDirection)).AsVector3();
        set => SetShaderParameter(nameof(LightDirection), value);
    }
}

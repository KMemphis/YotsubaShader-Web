using UnityEngine;
using YotsubaShader.Language.Compiler;
using YotsubaShader.Language.Resources;

public partial class Lit
{
    // Solo CPU: no es parte del shader
    [ShaderIgnore]
    private readonly Material material;

    public Lit(Material material) { this.material = material; }

    [Uniform]
    public float Exposure
    {
        get => material.GetFloat(nameof(Exposure));
        set => material.SetFloat(nameof(Exposure), value);
    }

    [Uniform]
    public Vector3 LightDirection
    {
        get => material.GetVector(nameof(LightDirection));
        set => material.SetVector(nameof(LightDirection), value);
    }
}

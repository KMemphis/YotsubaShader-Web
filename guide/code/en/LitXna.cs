using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using YotsubaShader.Language.Resources;

public partial class Lit : Effect
{
    // Wraps the effect that your game loaded
    public Lit(Effect cloneSource) : base(cloneSource) { }

    [Uniform]
    public float Exposure
    {
        get => Parameters[nameof(Exposure)].GetValueSingle();
        set => Parameters[nameof(Exposure)].SetValue(value);
    }

    [Uniform]
    public Vector3 LightDirection
    {
        get => Parameters[nameof(LightDirection)].GetValueVector3();
        set => Parameters[nameof(LightDirection)].SetValue(value);
    }
}

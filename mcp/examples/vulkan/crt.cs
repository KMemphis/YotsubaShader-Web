// CRT screen (SPIR-V style): A gradient seen through scanlines, an RGB mask and a vignette, like an old monitor.
// Classic CRT look, written from scratch.
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;
using YotsubaShader.SpirvSyntax.Types;
using YotsubaShader.SpirvSyntax.Resources;
using static YotsubaShader.SpirvSyntax.Methods.Math;
using static YotsubaShader.SpirvSyntax.Methods.Intrinsic;
using static YotsubaShader.SpirvSyntax.Methods.Constructors;

public struct Globals
{
    public float Time;
    public vec2 Resolution;
}

public struct VertexOutput
{
    [BuiltIn_Position]
    public vec4 Position;
}

public class Crt
{
    [Uniform] [DescriptorSet(0)] [Binding(0)]
    public Globals Params;

    // A single triangle that covers the screen, built from the vertex index.
    [ShaderStage(Stage.Vertex)]
    public VertexOutput Vertex([BuiltIn_VertexIndex] int id)
    {
        vec4 position;
        position.X = ((id << 1) & 2) * 2.0f - 1.0f;
        position.Y = (id & 2) * 2.0f - 1.0f;
        position.Z = 0.0f;
        position.W = 1.0f;

        VertexOutput output;
        output.Position = position;
        return output;
    }

    [ShaderStage(Stage.Fragment)]
    public vec4 Fragment([BuiltIn_FragCoord] vec4 fragCoord)
    {
        float aspect = Params.Resolution.X / Params.Resolution.Y;
        vec2 uv = vec2(fragCoord.X / Params.Resolution.X, fragCoord.Y / Params.Resolution.Y);
        vec2 p = vec2((uv.X - 0.5f) * aspect, uv.Y - 0.5f);
        float t = Params.Time;

        vec3 tint = vec3(0.5f + 0.5f * Sin(uv.X * 6.0f + t), 0.5f + 0.5f * Sin(uv.Y * 5.0f - t * 0.7f), 0.5f + 0.5f * Sin((uv.X + uv.Y) * 4.0f));
        float scan = 0.75f + 0.25f * Sin(fragCoord.Y * 3.14159f);
        float mask = 0.85f + 0.15f * Sin(fragCoord.X * 2.0944f);
        float vignette = 1.0f - 1.6f * OpDot(p, p) * 0.5f;
        float flicker = 0.97f + 0.03f * Sin(t * 60.0f);
        return vec4(tint * scan * mask * FClamp(vignette, 0.0f, 1.0f) * flicker, 1.0f);
    }
}

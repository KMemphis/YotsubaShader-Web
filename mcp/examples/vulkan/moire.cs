// Moiré rings (SPIR-V style): Two sets of concentric rings that interfere as their centres move.
// Moiré interference pattern, written from scratch.
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

public class Moire
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

        vec2 c1 = vec2(0.25f * Cos(t * 0.5f), 0.2f * Sin(t * 0.7f));
        vec2 c2 = vec2(-0.25f * Cos(t * 0.6f), -0.2f * Sin(t * 0.4f));
        float a = Sin(Length(p - c1) * 120.0f);
        float b = Sin(Length(p - c2) * 120.0f);
        float v = 0.5f + 0.5f * a * b;
        return vec4(vec3(v) * vec3(0.9f, 0.95f, 1.0f), 1.0f);
    }
}

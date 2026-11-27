// Hexagonal grid (SPIR-V style): Hexagon cells with a pulsing border, from the hexagonal distance function.
// Hex tiling after the usual hexagonal grid technique, written from scratch.
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

public class HexGrid
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

    vec3 Mix3(vec3 a, vec3 b, float k)
    {
        return FMix(a, b, vec3(k));
    }

    float HexDist(vec2 q)
    {
        vec2 a = vec2(FAbs(q.X), FAbs(q.Y));
        float c = OpDot(a, Normalize(vec2(1.0f, 1.7321f)));
        return FMax(c, a.X);
    }

    [ShaderStage(Stage.Fragment)]
    public vec4 Fragment([BuiltIn_FragCoord] vec4 fragCoord)
    {
        float aspect = Params.Resolution.X / Params.Resolution.Y;
        vec2 uv = vec2(fragCoord.X / Params.Resolution.X, fragCoord.Y / Params.Resolution.Y);
        vec2 p = vec2((uv.X - 0.5f) * aspect, uv.Y - 0.5f);
        float t = Params.Time;

        vec2 s = vec2(1.0f, 1.7321f);
        vec2 x = p * 6.0f;
        vec2 a = x - s * vec2(Floor(x.X / s.X + 0.5f), Floor(x.Y / s.Y + 0.5f));
        vec2 b = x - s * (vec2(Floor(x.X / s.X), Floor(x.Y / s.Y)) + vec2(0.5f));
        vec2 g = a;
        if (OpDot(b, b) < OpDot(a, a))
        {
            g = b;
        }
        float d = HexDist(g);
        float edge = SmoothStep(0.42f, 0.5f, d);
        float pulse = 0.5f + 0.5f * Sin(t * 2.0f + Length(x) * 1.5f);
        vec3 col = Mix3(vec3(0.08f, 0.12f, 0.2f) + vec3(0.25f) * pulse * (1.0f - d), vec3(0.4f, 0.9f, 1.0f), edge);
        return vec4(col, 1.0f);
    }
}

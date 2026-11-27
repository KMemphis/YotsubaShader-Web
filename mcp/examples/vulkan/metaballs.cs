// Metaballs (SPIR-V style): Five orbiting blobs whose fields add up and merge when they get close.
// Classic metaballs effect, written from scratch.
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

public class Metaballs
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

    [ShaderStage(Stage.Fragment)]
    public vec4 Fragment([BuiltIn_FragCoord] vec4 fragCoord)
    {
        float aspect = Params.Resolution.X / Params.Resolution.Y;
        vec2 uv = vec2(fragCoord.X / Params.Resolution.X, fragCoord.Y / Params.Resolution.Y);
        vec2 p = vec2((uv.X - 0.5f) * aspect, uv.Y - 0.5f);
        float t = Params.Time;

        float field = 0.0f;
        for (int i = 0; i < 5; i++)
        {
            float k = i;
            vec2 c = vec2(0.35f * Sin(t * (0.6f + 0.17f * k) + k * 1.9f), 0.25f * Cos(t * (0.5f + 0.13f * k) + k * 2.3f));
            vec2 d = p - c;
            field += 0.012f / (OpDot(d, d) + 0.001f);
        }
        float edge = SmoothStep(0.9f, 1.1f, field);
        vec3 col = Mix3(vec3(0.05f, 0.06f, 0.12f), vec3(0.3f, 0.9f, 0.7f), edge);
        col = col + vec3(0.6f, 0.2f, 0.5f) * (1.0f - SmoothStep(1.1f, 1.5f, field)) * edge;
        return vec4(col, 1.0f);
    }
}

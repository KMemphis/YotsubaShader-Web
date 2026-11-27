// Truchet tiles (SPIR-V style): Quarter-circle tiles flipped at random: endless winding paths.
// Truchet tiling (Sébastien Truchet), written from scratch.
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

public class Truchet
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

    float Hash(vec2 q)
    {
        return Fract(Sin(OpDot(q, vec2(127.1f, 311.7f))) * 43758.5453f);
    }

    [ShaderStage(Stage.Fragment)]
    public vec4 Fragment([BuiltIn_FragCoord] vec4 fragCoord)
    {
        float aspect = Params.Resolution.X / Params.Resolution.Y;
        vec2 uv = vec2(fragCoord.X / Params.Resolution.X, fragCoord.Y / Params.Resolution.Y);
        vec2 p = vec2((uv.X - 0.5f) * aspect, uv.Y - 0.5f);
        float t = Params.Time;

        vec2 x = (p + vec2(t * 0.05f, 0.0f)) * 8.0f;
        vec2 cell = vec2(Floor(x.X), Floor(x.Y));
        vec2 f = x - cell;
        if (Hash(cell) > 0.5f)
        {
            f = vec2(1.0f - f.X, f.Y);
        }
        float d1 = FAbs(Length(f) - 0.5f);
        float d2 = FAbs(Length(f - vec2(1.0f)) - 0.5f);
        float d = FMin(d1, d2);
        float line = 1.0f - SmoothStep(0.04f, 0.07f, d);
        vec3 col = Mix3(vec3(0.95f, 0.92f, 0.85f), vec3(0.12f, 0.16f, 0.35f), line);
        return vec4(col, 1.0f);
    }
}

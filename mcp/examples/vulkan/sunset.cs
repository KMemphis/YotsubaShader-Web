// Sunset (SPIR-V style): A sky gradient with a sun, banding and a dark sea that reflects it.
// Written from scratch.
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

public class Sunset
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

        float horizon = 0.0f;
        vec3 sky = Mix3(vec3(1.0f, 0.55f, 0.25f), vec3(0.15f, 0.1f, 0.35f), FClamp(p.Y * 1.8f, 0.0f, 1.0f));
        vec2 sunPos = vec2(0.0f, 0.12f + 0.02f * Sin(t * 0.5f));
        float sun = 1.0f - SmoothStep(0.17f, 0.18f, Length(p - sunPos));
        float bands = Step(0.5f, Fract(p.Y * 40.0f + 0.4f)) * Step(p.Y, 0.12f);
        sky = Mix3(sky, vec3(1.0f, 0.85f, 0.4f), sun * (1.0f - bands * 0.5f));
        if (p.Y < horizon)
        {
            float wave = 0.5f + 0.5f * Sin(p.Y * 90.0f + t * 2.0f + p.X * 4.0f);
            float glow = (1.0f - SmoothStep(0.0f, 0.3f, FAbs(p.X))) * (0.3f + 0.5f * wave);
            return vec4(vec3(0.05f, 0.05f, 0.15f) + vec3(1.0f, 0.5f, 0.2f) * glow * 0.6f, 1.0f);
        }
        return vec4(sky, 1.0f);
    }
}

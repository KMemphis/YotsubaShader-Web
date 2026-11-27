// Raymarched sphere (SPIR-V style): Sphere traced through a signed distance function with diffuse light and a bobbing animation.
// Sphere tracing after the usual SDF technique (iquilezles.org), written from scratch.
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

public class RaymarchSphere
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

    float Map(vec3 q, float time)
    {
        vec3 center = vec3(0.0f, 0.15f * Sin(time * 1.5f), 3.0f);
        return Length(q - center) - 1.0f;
    }

    [ShaderStage(Stage.Fragment)]
    public vec4 Fragment([BuiltIn_FragCoord] vec4 fragCoord)
    {
        float aspect = Params.Resolution.X / Params.Resolution.Y;
        vec2 uv = vec2(fragCoord.X / Params.Resolution.X, fragCoord.Y / Params.Resolution.Y);
        vec2 p = vec2((uv.X - 0.5f) * aspect, uv.Y - 0.5f);
        float t = Params.Time;

        vec3 ro = vec3(0.0f);
        vec3 rd = Normalize(vec3(p.X, p.Y, 1.5f));
        float dist = 0.0f;
        for (int i = 0; i < 48; i++)
        {
            float h = Map(ro + rd * dist, t);
            dist += h;
        }
        vec3 hit = ro + rd * dist;
        float e = 0.002f;
        vec3 n = Normalize(vec3(
            Map(hit + vec3(e, 0.0f, 0.0f), t) - Map(hit - vec3(e, 0.0f, 0.0f), t),
            Map(hit + vec3(0.0f, e, 0.0f), t) - Map(hit - vec3(0.0f, e, 0.0f), t),
            Map(hit + vec3(0.0f, 0.0f, e), t) - Map(hit - vec3(0.0f, 0.0f, e), t)));
        vec3 light = Normalize(vec3(-0.5f, 0.8f, -0.6f));
        float diff = FClamp(OpDot(n, light), 0.0f, 1.0f);
        vec3 bg = vec3(0.08f, 0.1f, 0.16f) + vec3(0.1f) * uv.Y;
        vec3 shade = vec3(0.9f, 0.45f, 0.3f) * (0.15f + 0.85f * diff);
        float isHit = 1.0f - SmoothStep(0.0f, 0.02f, Map(hit, t));
        return vec4(Mix3(bg, shade, isHit), 1.0f);
    }
}

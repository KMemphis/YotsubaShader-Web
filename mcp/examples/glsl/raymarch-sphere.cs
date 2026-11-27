// Raymarched sphere (GLSL style): Sphere traced through a signed distance function with diffuse light and a bobbing animation.
// Sphere tracing after the usual SDF technique (iquilezles.org), written from scratch.
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.GlslSyntax.Resources;
using static YotsubaShader.GlslSyntax.Methods.Math;
using static YotsubaShader.GlslSyntax.Methods.Intrinsic;
using static YotsubaShader.GlslSyntax.Methods.Constructors;

public struct Globals
{
    public float Time;
    public vec2 Resolution;
}

public struct VertexOutput
{
    [gl_Position]
    public vec4 Position;
}

public class RaymarchSphere
{
    [uniform, layout(0, 0)]
    public Globals Params;

    // A single triangle that covers the screen, built from the vertex index.
    [ShaderStage(Stage.Vertex)]
    public VertexOutput Vertex([gl_VertexIndex] uint id)
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
        return mix(a, b, vec3(k));
    }

    float Map(vec3 q, float time)
    {
        vec3 center = vec3(0.0f, 0.15f * sin(time * 1.5f), 3.0f);
        return length(q - center) - 1.0f;
    }

    [ShaderStage(Stage.Fragment)]
    public vec4 Fragment([gl_FragCoord] vec4 fragCoord)
    {
        float aspect = Params.Resolution.X / Params.Resolution.Y;
        vec2 uv = vec2(fragCoord.X / Params.Resolution.X, fragCoord.Y / Params.Resolution.Y);
        vec2 p = vec2((uv.X - 0.5f) * aspect, uv.Y - 0.5f);
        float t = Params.Time;

        vec3 ro = vec3(0.0f);
        vec3 rd = normalize(vec3(p.X, p.Y, 1.5f));
        float dist = 0.0f;
        for (int i = 0; i < 48; i++)
        {
            float h = Map(ro + rd * dist, t);
            dist += h;
        }
        vec3 hit = ro + rd * dist;
        float e = 0.002f;
        vec3 n = normalize(vec3(
            Map(hit + vec3(e, 0.0f, 0.0f), t) - Map(hit - vec3(e, 0.0f, 0.0f), t),
            Map(hit + vec3(0.0f, e, 0.0f), t) - Map(hit - vec3(0.0f, e, 0.0f), t),
            Map(hit + vec3(0.0f, 0.0f, e), t) - Map(hit - vec3(0.0f, 0.0f, e), t)));
        vec3 light = normalize(vec3(-0.5f, 0.8f, -0.6f));
        float diff = clamp(dot(n, light), 0.0f, 1.0f);
        vec3 bg = vec3(0.08f, 0.1f, 0.16f) + vec3(0.1f) * uv.Y;
        vec3 shade = vec3(0.9f, 0.45f, 0.3f) * (0.15f + 0.85f * diff);
        float isHit = 1.0f - smoothstep(0.0f, 0.02f, Map(hit, t));
        return vec4(Mix3(bg, shade, isHit), 1.0f);
    }
}

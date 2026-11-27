// Raymarched sphere (WGSL style): Sphere traced through a signed distance function with diffuse light and a bobbing animation.
// Sphere tracing after the usual SDF technique (iquilezles.org), written from scratch.
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;
using YotsubaShader.WgslSyntax.Types;
using YotsubaShader.WgslSyntax.Resources;
using static YotsubaShader.WgslSyntax.Methods.Math;
using static YotsubaShader.WgslSyntax.Methods.Intrinsic;
using static YotsubaShader.WgslSyntax.Methods.Constructors;

public struct Globals
{
    public float Time;
    public vec2<float> Resolution;
}

public struct VertexOutput
{
    [@builtin_position]
    public vec4<float> Position;
}

public class RaymarchSphere
{
    [uniform, @group(0), @binding(0)]
    public Globals Params;

    // A single triangle that covers the screen, built from the vertex index.
    [ShaderStage(Stage.Vertex)]
    public VertexOutput Vertex([@builtin_vertex_index] uint id)
    {
        vec4<float> position;
        position.X = ((id << 1) & 2) * 2.0f - 1.0f;
        position.Y = (id & 2) * 2.0f - 1.0f;
        position.Z = 0.0f;
        position.W = 1.0f;

        VertexOutput output;
        output.Position = position;
        return output;
    }

    vec3<float> Mix3(vec3<float> a, vec3<float> b, float k)
    {
        return mix(a, b, vec3f(k));
    }

    float Map(vec3<float> q, float time)
    {
        vec3<float> center = vec3f(0.0f, 0.15f * sin(time * 1.5f), 3.0f);
        return length(q - center) - 1.0f;
    }

    [ShaderStage(Stage.Fragment)]
    public vec4<float> Fragment([@builtin_position] vec4<float> fragCoord)
    {
        float aspect = Params.Resolution.X / Params.Resolution.Y;
        vec2<float> uv = vec2f(fragCoord.X / Params.Resolution.X, fragCoord.Y / Params.Resolution.Y);
        vec2<float> p = vec2f((uv.X - 0.5f) * aspect, uv.Y - 0.5f);
        float t = Params.Time;

        vec3<float> ro = vec3f(0.0f);
        vec3<float> rd = normalize(vec3f(p.X, p.Y, 1.5f));
        float dist = 0.0f;
        for (int i = 0; i < 48; i++)
        {
            float h = Map(ro + rd * dist, t);
            dist += h;
        }
        vec3<float> hit = ro + rd * dist;
        float e = 0.002f;
        vec3<float> n = normalize(vec3f(
            Map(hit + vec3f(e, 0.0f, 0.0f), t) - Map(hit - vec3f(e, 0.0f, 0.0f), t),
            Map(hit + vec3f(0.0f, e, 0.0f), t) - Map(hit - vec3f(0.0f, e, 0.0f), t),
            Map(hit + vec3f(0.0f, 0.0f, e), t) - Map(hit - vec3f(0.0f, 0.0f, e), t)));
        vec3<float> light = normalize(vec3f(-0.5f, 0.8f, -0.6f));
        float diff = clamp(dot(n, light), 0.0f, 1.0f);
        vec3<float> bg = vec3f(0.08f, 0.1f, 0.16f) + vec3f(0.1f) * uv.Y;
        vec3<float> shade = vec3f(0.9f, 0.45f, 0.3f) * (0.15f + 0.85f * diff);
        float isHit = 1.0f - smoothstep(0.0f, 0.02f, Map(hit, t));
        return vec4f(Mix3(bg, shade, isHit), 1.0f);
    }
}

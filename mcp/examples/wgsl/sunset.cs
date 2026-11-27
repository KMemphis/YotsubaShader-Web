// Sunset (WGSL style): A sky gradient with a sun, banding and a dark sea that reflects it.
// Written from scratch.
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

public class Sunset
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

    [ShaderStage(Stage.Fragment)]
    public vec4<float> Fragment([@builtin_position] vec4<float> fragCoord)
    {
        float aspect = Params.Resolution.X / Params.Resolution.Y;
        vec2<float> uv = vec2f(fragCoord.X / Params.Resolution.X, fragCoord.Y / Params.Resolution.Y);
        vec2<float> p = vec2f((uv.X - 0.5f) * aspect, uv.Y - 0.5f);
        float t = Params.Time;

        float horizon = 0.0f;
        vec3<float> sky = Mix3(vec3f(1.0f, 0.55f, 0.25f), vec3f(0.15f, 0.1f, 0.35f), clamp(p.Y * 1.8f, 0.0f, 1.0f));
        vec2<float> sunPos = vec2f(0.0f, 0.12f + 0.02f * sin(t * 0.5f));
        float sun = 1.0f - smoothstep(0.17f, 0.18f, length(p - sunPos));
        float bands = step(0.5f, fract(p.Y * 40.0f + 0.4f)) * step(p.Y, 0.12f);
        sky = Mix3(sky, vec3f(1.0f, 0.85f, 0.4f), sun * (1.0f - bands * 0.5f));
        if (p.Y < horizon)
        {
            float wave = 0.5f + 0.5f * sin(p.Y * 90.0f + t * 2.0f + p.X * 4.0f);
            float glow = (1.0f - smoothstep(0.0f, 0.3f, abs(p.X))) * (0.3f + 0.5f * wave);
            return vec4f(vec3f(0.05f, 0.05f, 0.15f) + vec3f(1.0f, 0.5f, 0.2f) * glow * 0.6f, 1.0f);
        }
        return vec4f(sky, 1.0f);
    }
}

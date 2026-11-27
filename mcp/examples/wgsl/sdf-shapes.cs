// SDF shapes (WGSL style): A circle and a rounded box blended with a smooth minimum, drawn with distance bands.
// 2D signed distance functions as described by Inigo Quilez, written from scratch.
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

public class SdfShapes
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

    float SdBox(vec2<float> q, vec2<float> b)
    {
        vec2<float> d = vec2f(abs(q.X) - b.X, abs(q.Y) - b.Y);
        return length(vec2f(max(d.X, 0.0f), max(d.Y, 0.0f))) + min(max(d.X, d.Y), 0.0f);
    }

    float SmoothMin(float a, float b, float k)
    {
        float h = clamp(0.5f + 0.5f * (b - a) / k, 0.0f, 1.0f);
        return mix(b, a, h) - k * h * (1.0f - h);
    }

    [ShaderStage(Stage.Fragment)]
    public vec4<float> Fragment([@builtin_position] vec4<float> fragCoord)
    {
        float aspect = Params.Resolution.X / Params.Resolution.Y;
        vec2<float> uv = vec2f(fragCoord.X / Params.Resolution.X, fragCoord.Y / Params.Resolution.Y);
        vec2<float> p = vec2f((uv.X - 0.5f) * aspect, uv.Y - 0.5f);
        float t = Params.Time;

        float circle = length(p - vec2f(0.2f * sin(t), 0.0f)) - 0.18f;
        float box = SdBox(p + vec2f(0.15f, 0.0f), vec2f(0.15f, 0.1f)) - 0.05f;
        float d = SmoothMin(circle, box, 0.12f);
        vec3<float> col = Mix3(vec3f(0.9f, 0.5f, 0.2f), vec3f(0.2f, 0.4f, 0.8f), step(0.0f, d));
        col = col * (0.8f + 0.2f * cos(d * 120.0f));
        col = Mix3(col, vec3f(1.0f), 1.0f - smoothstep(0.0f, 0.01f, abs(d)));
        return vec4f(col, 1.0f);
    }
}

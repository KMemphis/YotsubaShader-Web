// Metaballs (WGSL style): Five orbiting blobs whose fields add up and merge when they get close.
// Classic metaballs effect, written from scratch.
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

public class Metaballs
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

        float field = 0.0f;
        for (int i = 0; i < 5; i++)
        {
            float k = i;
            vec2<float> c = vec2f(0.35f * sin(t * (0.6f + 0.17f * k) + k * 1.9f), 0.25f * cos(t * (0.5f + 0.13f * k) + k * 2.3f));
            vec2<float> d = p - c;
            field += 0.012f / (dot(d, d) + 0.001f);
        }
        float edge = smoothstep(0.9f, 1.1f, field);
        vec3<float> col = Mix3(vec3f(0.05f, 0.06f, 0.12f), vec3f(0.3f, 0.9f, 0.7f), edge);
        col = col + vec3f(0.6f, 0.2f, 0.5f) * (1.0f - smoothstep(1.1f, 1.5f, field)) * edge;
        return vec4f(col, 1.0f);
    }
}

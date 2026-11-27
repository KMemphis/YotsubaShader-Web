// Voronoi cells (WGSL style): Animated Voronoi diagram: distance to the nearest of a jittered grid of points.
// Classic cellular noise (Worley), written from scratch.
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

public class Voronoi
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

    vec2<float> Hash2(vec2<float> q)
    {
        float a = dot(q, vec2f(127.1f, 311.7f));
        float b = dot(q, vec2f(269.5f, 183.3f));
        return vec2f(fract(sin(a) * 43758.5453f), fract(sin(b) * 43758.5453f));
    }

    [ShaderStage(Stage.Fragment)]
    public vec4<float> Fragment([@builtin_position] vec4<float> fragCoord)
    {
        float aspect = Params.Resolution.X / Params.Resolution.Y;
        vec2<float> uv = vec2f(fragCoord.X / Params.Resolution.X, fragCoord.Y / Params.Resolution.Y);
        vec2<float> p = vec2f((uv.X - 0.5f) * aspect, uv.Y - 0.5f);
        float t = Params.Time;

        vec2<float> x = p * 6.0f;
        vec2<float> cell = vec2f(floor(x.X), floor(x.Y));
        vec2<float> f = x - cell;
        float best = 8.0f;
        for (int j = -1; j <= 1; j++)
        {
            for (int i = -1; i <= 1; i++)
            {
                float gi = i;
                float gj = j;
                vec2<float> g = vec2f(gi, gj);
                vec2<float> o = Hash2(cell + g);
                o = vec2f(0.5f + 0.5f * sin(t + 6.2831f * o.X), 0.5f + 0.5f * sin(t + 6.2831f * o.Y));
                vec2<float> r = g + o - f;
                best = min(best, dot(r, r));
            }
        }
        float d = sqrt(best);
        vec3<float> col = vec3f(d, d * d, 1.0f - d) * 0.9f + vec3f(0.05f);
        return vec4f(col, 1.0f);
    }
}

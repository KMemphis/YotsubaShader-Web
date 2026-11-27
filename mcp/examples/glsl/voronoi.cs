// Voronoi cells (GLSL style): Animated Voronoi diagram: distance to the nearest of a jittered grid of points.
// Classic cellular noise (Worley), written from scratch.
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

public class Voronoi
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

    vec2 Hash2(vec2 q)
    {
        float a = dot(q, vec2(127.1f, 311.7f));
        float b = dot(q, vec2(269.5f, 183.3f));
        return vec2(fract(sin(a) * 43758.5453f), fract(sin(b) * 43758.5453f));
    }

    [ShaderStage(Stage.Fragment)]
    public vec4 Fragment([gl_FragCoord] vec4 fragCoord)
    {
        float aspect = Params.Resolution.X / Params.Resolution.Y;
        vec2 uv = vec2(fragCoord.X / Params.Resolution.X, fragCoord.Y / Params.Resolution.Y);
        vec2 p = vec2((uv.X - 0.5f) * aspect, uv.Y - 0.5f);
        float t = Params.Time;

        vec2 x = p * 6.0f;
        vec2 cell = vec2(floor(x.X), floor(x.Y));
        vec2 f = x - cell;
        float best = 8.0f;
        for (int j = -1; j <= 1; j++)
        {
            for (int i = -1; i <= 1; i++)
            {
                float gi = i;
                float gj = j;
                vec2 g = vec2(gi, gj);
                vec2 o = Hash2(cell + g);
                o = vec2(0.5f + 0.5f * sin(t + 6.2831f * o.X), 0.5f + 0.5f * sin(t + 6.2831f * o.Y));
                vec2 r = g + o - f;
                best = min(best, dot(r, r));
            }
        }
        float d = sqrt(best);
        vec3 col = vec3(d, d * d, 1.0f - d) * 0.9f + vec3(0.05f);
        return vec4(col, 1.0f);
    }
}

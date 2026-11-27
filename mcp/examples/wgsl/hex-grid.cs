// Hexagonal grid (WGSL style): Hexagon cells with a pulsing border, from the hexagonal distance function.
// Hex tiling after the usual hexagonal grid technique, written from scratch.
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

public class HexGrid
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

    float HexDist(vec2<float> q)
    {
        vec2<float> a = vec2f(abs(q.X), abs(q.Y));
        float c = dot(a, normalize(vec2f(1.0f, 1.7321f)));
        return max(c, a.X);
    }

    [ShaderStage(Stage.Fragment)]
    public vec4<float> Fragment([@builtin_position] vec4<float> fragCoord)
    {
        float aspect = Params.Resolution.X / Params.Resolution.Y;
        vec2<float> uv = vec2f(fragCoord.X / Params.Resolution.X, fragCoord.Y / Params.Resolution.Y);
        vec2<float> p = vec2f((uv.X - 0.5f) * aspect, uv.Y - 0.5f);
        float t = Params.Time;

        vec2<float> s = vec2f(1.0f, 1.7321f);
        vec2<float> x = p * 6.0f;
        vec2<float> a = x - s * vec2f(floor(x.X / s.X + 0.5f), floor(x.Y / s.Y + 0.5f));
        vec2<float> b = x - s * (vec2f(floor(x.X / s.X), floor(x.Y / s.Y)) + vec2f(0.5f));
        vec2<float> g = a;
        if (dot(b, b) < dot(a, a))
        {
            g = b;
        }
        float d = HexDist(g);
        float edge = smoothstep(0.42f, 0.5f, d);
        float pulse = 0.5f + 0.5f * sin(t * 2.0f + length(x) * 1.5f);
        vec3<float> col = Mix3(vec3f(0.08f, 0.12f, 0.2f) + vec3f(0.25f) * pulse * (1.0f - d), vec3f(0.4f, 0.9f, 1.0f), edge);
        return vec4f(col, 1.0f);
    }
}

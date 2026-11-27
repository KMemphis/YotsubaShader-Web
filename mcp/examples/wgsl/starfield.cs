// Starfield (WGSL style): Three layers of twinkling stars drifting at different speeds for depth.
// Classic parallax starfield, written from scratch.
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

public class Starfield
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

    float Hash(vec2<float> q)
    {
        return fract(sin(dot(q, vec2f(127.1f, 311.7f))) * 43758.5453f);
    }

    [ShaderStage(Stage.Fragment)]
    public vec4<float> Fragment([@builtin_position] vec4<float> fragCoord)
    {
        float aspect = Params.Resolution.X / Params.Resolution.Y;
        vec2<float> uv = vec2f(fragCoord.X / Params.Resolution.X, fragCoord.Y / Params.Resolution.Y);
        vec2<float> p = vec2f((uv.X - 0.5f) * aspect, uv.Y - 0.5f);
        float t = Params.Time;

        vec3<float> col = vec3f(0.01f, 0.01f, 0.04f);
        for (int layer = 0; layer < 3; layer++)
        {
            float k = layer;
            float scale = 14.0f + k * 12.0f;
            vec2<float> x = (p + vec2f(t * (0.02f + 0.02f * k), 0.0f)) * scale;
            vec2<float> cell = vec2f(floor(x.X), floor(x.Y));
            vec2<float> f = x - cell - vec2f(0.5f);
            float h = Hash(cell + vec2f(k * 31.0f));
            vec2<float> offset = vec2f(Hash(cell * 1.7f) - 0.5f, Hash(cell * 2.3f) - 0.5f) * 0.6f;
            float d = length(f - offset);
            float twinkle = 0.6f + 0.4f * sin(t * 3.0f + h * 40.0f);
            float star = step(0.9f, h) * twinkle * (1.0f - smoothstep(0.0f, 0.12f, d));
            col += vec3f(0.8f, 0.85f, 1.0f) * star;
        }
        return vec4f(col, 1.0f);
    }
}

// Starfield (GLSL style): Three layers of twinkling stars drifting at different speeds for depth.
// Classic parallax starfield, written from scratch.
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

public class Starfield
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

    float Hash(vec2 q)
    {
        return fract(sin(dot(q, vec2(127.1f, 311.7f))) * 43758.5453f);
    }

    [ShaderStage(Stage.Fragment)]
    public vec4 Fragment([gl_FragCoord] vec4 fragCoord)
    {
        float aspect = Params.Resolution.X / Params.Resolution.Y;
        vec2 uv = vec2(fragCoord.X / Params.Resolution.X, fragCoord.Y / Params.Resolution.Y);
        vec2 p = vec2((uv.X - 0.5f) * aspect, uv.Y - 0.5f);
        float t = Params.Time;

        vec3 col = vec3(0.01f, 0.01f, 0.04f);
        for (int layer = 0; layer < 3; layer++)
        {
            float k = layer;
            float scale = 14.0f + k * 12.0f;
            vec2 x = (p + vec2(t * (0.02f + 0.02f * k), 0.0f)) * scale;
            vec2 cell = vec2(floor(x.X), floor(x.Y));
            vec2 f = x - cell - vec2(0.5f);
            float h = Hash(cell + vec2(k * 31.0f));
            vec2 offset = vec2(Hash(cell * 1.7f) - 0.5f, Hash(cell * 2.3f) - 0.5f) * 0.6f;
            float d = length(f - offset);
            float twinkle = 0.6f + 0.4f * sin(t * 3.0f + h * 40.0f);
            float star = step(0.9f, h) * twinkle * (1.0f - smoothstep(0.0f, 0.12f, d));
            col += vec3(0.8f, 0.85f, 1.0f) * star;
        }
        return vec4(col, 1.0f);
    }
}

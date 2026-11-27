// Checkerboard floor (GLSL style): An infinite checkerboard plane in perspective with a fading horizon.
// Classic perspective floor, written from scratch.
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

public class Checkerboard
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

    [ShaderStage(Stage.Fragment)]
    public vec4 Fragment([gl_FragCoord] vec4 fragCoord)
    {
        float aspect = Params.Resolution.X / Params.Resolution.Y;
        vec2 uv = vec2(fragCoord.X / Params.Resolution.X, fragCoord.Y / Params.Resolution.Y);
        vec2 p = vec2((uv.X - 0.5f) * aspect, uv.Y - 0.5f);
        float t = Params.Time;

        float horizon = 0.05f;
        float h = horizon - p.Y;
        vec3 sky = Mix3(vec3(0.95f, 0.6f, 0.4f), vec3(0.2f, 0.3f, 0.6f), uv.Y);
        if (h > 0.0f)
        {
            float depth = 0.5f / h;
            float x = p.X * depth * 2.0f;
            float z = depth + t * 2.0f;
            float c = fract((floor(x) + floor(z)) * 0.5f) * 2.0f;
            vec3 floorColor = Mix3(vec3(0.1f), vec3(0.9f), c);
            float fog = clamp(1.0f - depth * 0.05f, 0.0f, 1.0f);
            return vec4(Mix3(sky, floorColor, fog), 1.0f);
        }
        return vec4(sky, 1.0f);
    }
}

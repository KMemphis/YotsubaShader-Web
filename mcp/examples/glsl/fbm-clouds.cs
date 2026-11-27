// Fractal clouds (GLSL style): Fractal Brownian motion over value noise, scrolling across a sky gradient.
// Classic fBm clouds, written from scratch.
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

public class FbmClouds
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

    float Hash(vec2 q)
    {
        return fract(sin(dot(q, vec2(127.1f, 311.7f))) * 43758.5453f);
    }

    float Noise(vec2 q)
    {
        vec2 i = vec2(floor(q.X), floor(q.Y));
        vec2 f = q - i;
        f = f * f * (vec2(3.0f) - f * 2.0f);
        float a = Hash(i);
        float b = Hash(i + vec2(1.0f, 0.0f));
        float c = Hash(i + vec2(0.0f, 1.0f));
        float d = Hash(i + vec2(1.0f, 1.0f));
        return mix(mix(a, b, f.X), mix(c, d, f.X), f.Y);
    }

    float Fbm(vec2 q)
    {
        float sum = 0.0f;
        float amp = 0.5f;
        for (int i = 0; i < 5; i++)
        {
            sum += amp * Noise(q);
            q = q * 2.03f + vec2(17.0f, 9.0f);
            amp *= 0.5f;
        }
        return sum;
    }

    [ShaderStage(Stage.Fragment)]
    public vec4 Fragment([gl_FragCoord] vec4 fragCoord)
    {
        float aspect = Params.Resolution.X / Params.Resolution.Y;
        vec2 uv = vec2(fragCoord.X / Params.Resolution.X, fragCoord.Y / Params.Resolution.Y);
        vec2 p = vec2((uv.X - 0.5f) * aspect, uv.Y - 0.5f);
        float t = Params.Time;

        float n = Fbm(p * 3.0f + vec2(t * 0.15f, 0.0f));
        float cloud = smoothstep(0.45f, 0.85f, n);
        vec3 sky = Mix3(vec3(0.25f, 0.5f, 0.95f), vec3(0.75f, 0.88f, 1.0f), uv.Y);
        vec3 col = Mix3(sky, vec3(1.0f), cloud);
        return vec4(col, 1.0f);
    }
}

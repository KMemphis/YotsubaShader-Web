// Domain warping (WGSL style): Noise that feeds its own coordinates, producing marbled, flowing colour.
// Domain warping technique (iquilezles.org), written from scratch.
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

public class DomainWarp
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

    float Hash(vec2<float> q)
    {
        return fract(sin(dot(q, vec2f(127.1f, 311.7f))) * 43758.5453f);
    }

    float Noise(vec2<float> q)
    {
        vec2<float> i = vec2f(floor(q.X), floor(q.Y));
        vec2<float> f = q - i;
        f = f * f * (vec2f(3.0f) - f * 2.0f);
        float a = Hash(i);
        float b = Hash(i + vec2f(1.0f, 0.0f));
        float c = Hash(i + vec2f(0.0f, 1.0f));
        float d = Hash(i + vec2f(1.0f, 1.0f));
        return mix(mix(a, b, f.X), mix(c, d, f.X), f.Y);
    }

    float Fbm(vec2<float> q)
    {
        float sum = 0.0f;
        float amp = 0.5f;
        for (int i = 0; i < 5; i++)
        {
            sum += amp * Noise(q);
            q = q * 2.03f + vec2f(17.0f, 9.0f);
            amp *= 0.5f;
        }
        return sum;
    }

    [ShaderStage(Stage.Fragment)]
    public vec4<float> Fragment([@builtin_position] vec4<float> fragCoord)
    {
        float aspect = Params.Resolution.X / Params.Resolution.Y;
        vec2<float> uv = vec2f(fragCoord.X / Params.Resolution.X, fragCoord.Y / Params.Resolution.Y);
        vec2<float> p = vec2f((uv.X - 0.5f) * aspect, uv.Y - 0.5f);
        float t = Params.Time;

        vec2<float> q = vec2f(Fbm(p * 2.0f + vec2f(0.0f, t * 0.1f)), Fbm(p * 2.0f + vec2f(5.2f, 1.3f - t * 0.1f)));
        vec2<float> r = vec2f(Fbm(p * 2.0f + q * 3.0f + vec2f(1.7f, 9.2f)), Fbm(p * 2.0f + q * 3.0f + vec2f(8.3f, 2.8f)));
        float f = Fbm(p * 2.0f + r * 3.0f);
        vec3<float> col = Mix3(vec3f(0.1f, 0.15f, 0.3f), vec3f(0.9f, 0.6f, 0.3f), f);
        col = Mix3(col, vec3f(0.2f, 0.7f, 0.7f), clamp(length(q), 0.0f, 1.0f) * 0.6f);
        return vec4f(col * (0.4f + 1.2f * f * f), 1.0f);
    }
}

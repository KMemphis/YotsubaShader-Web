// Domain warping (SPIR-V style): Noise that feeds its own coordinates, producing marbled, flowing colour.
// Domain warping technique (iquilezles.org), written from scratch.
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;
using YotsubaShader.SpirvSyntax.Types;
using YotsubaShader.SpirvSyntax.Resources;
using static YotsubaShader.SpirvSyntax.Methods.Math;
using static YotsubaShader.SpirvSyntax.Methods.Intrinsic;
using static YotsubaShader.SpirvSyntax.Methods.Constructors;

public struct Globals
{
    public float Time;
    public vec2 Resolution;
}

public struct VertexOutput
{
    [BuiltIn_Position]
    public vec4 Position;
}

public class DomainWarp
{
    [Uniform] [DescriptorSet(0)] [Binding(0)]
    public Globals Params;

    // A single triangle that covers the screen, built from the vertex index.
    [ShaderStage(Stage.Vertex)]
    public VertexOutput Vertex([BuiltIn_VertexIndex] int id)
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
        return FMix(a, b, vec3(k));
    }

    float Hash(vec2 q)
    {
        return Fract(Sin(OpDot(q, vec2(127.1f, 311.7f))) * 43758.5453f);
    }

    float Noise(vec2 q)
    {
        vec2 i = vec2(Floor(q.X), Floor(q.Y));
        vec2 f = q - i;
        f = f * f * (vec2(3.0f) - f * 2.0f);
        float a = Hash(i);
        float b = Hash(i + vec2(1.0f, 0.0f));
        float c = Hash(i + vec2(0.0f, 1.0f));
        float d = Hash(i + vec2(1.0f, 1.0f));
        return FMix(FMix(a, b, f.X), FMix(c, d, f.X), f.Y);
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
    public vec4 Fragment([BuiltIn_FragCoord] vec4 fragCoord)
    {
        float aspect = Params.Resolution.X / Params.Resolution.Y;
        vec2 uv = vec2(fragCoord.X / Params.Resolution.X, fragCoord.Y / Params.Resolution.Y);
        vec2 p = vec2((uv.X - 0.5f) * aspect, uv.Y - 0.5f);
        float t = Params.Time;

        vec2 q = vec2(Fbm(p * 2.0f + vec2(0.0f, t * 0.1f)), Fbm(p * 2.0f + vec2(5.2f, 1.3f - t * 0.1f)));
        vec2 r = vec2(Fbm(p * 2.0f + q * 3.0f + vec2(1.7f, 9.2f)), Fbm(p * 2.0f + q * 3.0f + vec2(8.3f, 2.8f)));
        float f = Fbm(p * 2.0f + r * 3.0f);
        vec3 col = Mix3(vec3(0.1f, 0.15f, 0.3f), vec3(0.9f, 0.6f, 0.3f), f);
        col = Mix3(col, vec3(0.2f, 0.7f, 0.7f), FClamp(Length(q), 0.0f, 1.0f) * 0.6f);
        return vec4(col * (0.4f + 1.2f * f * f), 1.0f);
    }
}

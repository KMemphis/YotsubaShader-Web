// SDF shapes (SPIR-V style): A circle and a rounded box blended with a smooth minimum, drawn with distance bands.
// 2D signed distance functions as described by Inigo Quilez, written from scratch.
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

public class SdfShapes
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

    float SdBox(vec2 q, vec2 b)
    {
        vec2 d = vec2(FAbs(q.X) - b.X, FAbs(q.Y) - b.Y);
        return Length(vec2(FMax(d.X, 0.0f), FMax(d.Y, 0.0f))) + FMin(FMax(d.X, d.Y), 0.0f);
    }

    float SmoothMin(float a, float b, float k)
    {
        float h = FClamp(0.5f + 0.5f * (b - a) / k, 0.0f, 1.0f);
        return FMix(b, a, h) - k * h * (1.0f - h);
    }

    [ShaderStage(Stage.Fragment)]
    public vec4 Fragment([BuiltIn_FragCoord] vec4 fragCoord)
    {
        float aspect = Params.Resolution.X / Params.Resolution.Y;
        vec2 uv = vec2(fragCoord.X / Params.Resolution.X, fragCoord.Y / Params.Resolution.Y);
        vec2 p = vec2((uv.X - 0.5f) * aspect, uv.Y - 0.5f);
        float t = Params.Time;

        float circle = Length(p - vec2(0.2f * Sin(t), 0.0f)) - 0.18f;
        float box = SdBox(p + vec2(0.15f, 0.0f), vec2(0.15f, 0.1f)) - 0.05f;
        float d = SmoothMin(circle, box, 0.12f);
        vec3 col = Mix3(vec3(0.9f, 0.5f, 0.2f), vec3(0.2f, 0.4f, 0.8f), Step(0.0f, d));
        col = col * (0.8f + 0.2f * Cos(d * 120.0f));
        col = Mix3(col, vec3(1.0f), 1.0f - SmoothStep(0.0f, 0.01f, FAbs(d)));
        return vec4(col, 1.0f);
    }
}

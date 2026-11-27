// Mandelbrot set (SPIR-V style): Escape-time Mandelbrot with a smooth palette and a slow zoom.
// The Mandelbrot set, written from scratch.
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

public class Mandelbrot
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

    [ShaderStage(Stage.Fragment)]
    public vec4 Fragment([BuiltIn_FragCoord] vec4 fragCoord)
    {
        float aspect = Params.Resolution.X / Params.Resolution.Y;
        vec2 uv = vec2(fragCoord.X / Params.Resolution.X, fragCoord.Y / Params.Resolution.Y);
        vec2 p = vec2((uv.X - 0.5f) * aspect, uv.Y - 0.5f);
        float t = Params.Time;

        float zoom = 1.0f + 0.5f * Sin(t * 0.3f);
        vec2 c = vec2(p.X * 2.4f / zoom - 0.6f, p.Y * 2.4f / zoom);
        vec2 z = vec2(0.0f);
        float n = 0.0f;
        for (int i = 0; i < 64; i++)
        {
            if (OpDot(z, z) < 16.0f)
            {
                z = vec2(z.X * z.X - z.Y * z.Y + c.X, 2.0f * z.X * z.Y + c.Y);
                n += 1.0f;
            }
        }
        float k = n / 64.0f;
        vec3 col = vec3(0.5f + 0.5f * Cos(6.2832f * (k + 0.0f)), 0.5f + 0.5f * Cos(6.2832f * (k + 0.33f)), 0.5f + 0.5f * Cos(6.2832f * (k + 0.67f)));
        return vec4(col * (1.0f - Step(63.5f, n)), 1.0f);
    }
}

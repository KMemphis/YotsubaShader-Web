// Mandelbrot set (MSL style): Escape-time Mandelbrot with a smooth palette and a slow zoom.
// The Mandelbrot set, written from scratch.
using YotsubaShader.Language;
using YotsubaShader.MslSyntax;
using YotsubaShader.MslSyntax.Types;
using YotsubaShader.MslSyntax.Resources;
using static YotsubaShader.MslSyntax.Methods.Math;
using static YotsubaShader.MslSyntax.Methods.Intrinsic;
using static YotsubaShader.MslSyntax.Methods.Constructors;

public struct Globals
{
    public float Time;
    public float2 Resolution;
}

public struct VertexOutput
{
    [position]
    public float4 Position;
}

public class Mandelbrot
{
    [constant, buffer(0)]
    public Globals Params;

    // A single triangle that covers the screen, built from the vertex index.
    [ShaderStage(Stage.Vertex)]
    public VertexOutput Vertex([vertex_id] uint id)
    {
        float4 position;
        position.X = ((id << 1) & 2) * 2.0f - 1.0f;
        position.Y = (id & 2) * 2.0f - 1.0f;
        position.Z = 0.0f;
        position.W = 1.0f;

        VertexOutput output;
        output.Position = position;
        return output;
    }

    [ShaderStage(Stage.Fragment)]
    public float4 Fragment([position] float4 fragCoord)
    {
        float aspect = Params.Resolution.X / Params.Resolution.Y;
        float2 uv = float2(fragCoord.X / Params.Resolution.X, fragCoord.Y / Params.Resolution.Y);
        float2 p = float2((uv.X - 0.5f) * aspect, uv.Y - 0.5f);
        float t = Params.Time;

        float zoom = 1.0f + 0.5f * sin(t * 0.3f);
        float2 c = float2(p.X * 2.4f / zoom - 0.6f, p.Y * 2.4f / zoom);
        float2 z = float2(0.0f);
        float n = 0.0f;
        for (int i = 0; i < 64; i++)
        {
            if (dot(z, z) < 16.0f)
            {
                z = float2(z.X * z.X - z.Y * z.Y + c.X, 2.0f * z.X * z.Y + c.Y);
                n += 1.0f;
            }
        }
        float k = n / 64.0f;
        float3 col = float3(0.5f + 0.5f * cos(6.2832f * (k + 0.0f)), 0.5f + 0.5f * cos(6.2832f * (k + 0.33f)), 0.5f + 0.5f * cos(6.2832f * (k + 0.67f)));
        return float4(col * (1.0f - step(63.5f, n)), 1.0f);
    }
}

// Fractal clouds (MSL style): Fractal Brownian motion over value noise, scrolling across a sky gradient.
// Classic fBm clouds, written from scratch.
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

public class FbmClouds
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

    float3 Mix3(float3 a, float3 b, float k)
    {
        return mix(a, b, float3(k));
    }

    float Hash(float2 q)
    {
        return fract(sin(dot(q, float2(127.1f, 311.7f))) * 43758.5453f);
    }

    float Noise(float2 q)
    {
        float2 i = float2(floor(q.X), floor(q.Y));
        float2 f = q - i;
        f = f * f * (float2(3.0f) - f * 2.0f);
        float a = Hash(i);
        float b = Hash(i + float2(1.0f, 0.0f));
        float c = Hash(i + float2(0.0f, 1.0f));
        float d = Hash(i + float2(1.0f, 1.0f));
        return mix(mix(a, b, f.X), mix(c, d, f.X), f.Y);
    }

    float Fbm(float2 q)
    {
        float sum = 0.0f;
        float amp = 0.5f;
        for (int i = 0; i < 5; i++)
        {
            sum += amp * Noise(q);
            q = q * 2.03f + float2(17.0f, 9.0f);
            amp *= 0.5f;
        }
        return sum;
    }

    [ShaderStage(Stage.Fragment)]
    public float4 Fragment([position] float4 fragCoord)
    {
        float aspect = Params.Resolution.X / Params.Resolution.Y;
        float2 uv = float2(fragCoord.X / Params.Resolution.X, fragCoord.Y / Params.Resolution.Y);
        float2 p = float2((uv.X - 0.5f) * aspect, uv.Y - 0.5f);
        float t = Params.Time;

        float n = Fbm(p * 3.0f + float2(t * 0.15f, 0.0f));
        float cloud = smoothstep(0.45f, 0.85f, n);
        float3 sky = Mix3(float3(0.25f, 0.5f, 0.95f), float3(0.75f, 0.88f, 1.0f), uv.Y);
        float3 col = Mix3(sky, float3(1.0f), cloud);
        return float4(col, 1.0f);
    }
}

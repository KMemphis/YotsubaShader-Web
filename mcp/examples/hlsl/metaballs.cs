// Metaballs (HLSL style): Five orbiting blobs whose fields add up and merge when they get close.
// Classic metaballs effect, written from scratch.
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;
using YotsubaShader.HlslSyntax.Types;
using YotsubaShader.HlslSyntax.Resources;
using static YotsubaShader.HlslSyntax.Methods.Math;
using static YotsubaShader.HlslSyntax.Methods.Intrinsic;
using static YotsubaShader.HlslSyntax.Methods.Constructors;

public struct Globals
{
    public float Time;
    public float2 Resolution;
}

public struct VertexOutput
{
    [SV_Position]
    public float4 Position;
}

public class Metaballs
{
    [cbuffer, register(RegisterPrefix.b, 0)]
    public Globals Params;

    // A single triangle that covers the screen, built from the vertex index.
    [ShaderStage(Stage.Vertex)]
    public VertexOutput Vertex([SV_VertexID] uint id)
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
        return lerp(a, b, float3(k));
    }

    [ShaderStage(Stage.Fragment)]
    [return: SV_Target]
    public float4 Fragment([SV_Position] float4 fragCoord)
    {
        float aspect = Params.Resolution.X / Params.Resolution.Y;
        float2 uv = float2(fragCoord.X / Params.Resolution.X, fragCoord.Y / Params.Resolution.Y);
        float2 p = float2((uv.X - 0.5f) * aspect, uv.Y - 0.5f);
        float t = Params.Time;

        float field = 0.0f;
        for (int i = 0; i < 5; i++)
        {
            float k = i;
            float2 c = float2(0.35f * sin(t * (0.6f + 0.17f * k) + k * 1.9f), 0.25f * cos(t * (0.5f + 0.13f * k) + k * 2.3f));
            float2 d = p - c;
            field += 0.012f / (dot(d, d) + 0.001f);
        }
        float edge = smoothstep(0.9f, 1.1f, field);
        float3 col = Mix3(float3(0.05f, 0.06f, 0.12f), float3(0.3f, 0.9f, 0.7f), edge);
        col = col + float3(0.6f, 0.2f, 0.5f) * (1.0f - smoothstep(1.1f, 1.5f, field)) * edge;
        return float4(col, 1.0f);
    }
}

// Checkerboard floor (HLSL style): An infinite checkerboard plane in perspective with a fading horizon.
// Classic perspective floor, written from scratch.
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

public class Checkerboard
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

        float horizon = 0.05f;
        float h = horizon - p.Y;
        float3 sky = Mix3(float3(0.95f, 0.6f, 0.4f), float3(0.2f, 0.3f, 0.6f), uv.Y);
        if (h > 0.0f)
        {
            float depth = 0.5f / h;
            float x = p.X * depth * 2.0f;
            float z = depth + t * 2.0f;
            float c = frac((floor(x) + floor(z)) * 0.5f) * 2.0f;
            float3 floorColor = Mix3(float3(0.1f), float3(0.9f), c);
            float fog = clamp(1.0f - depth * 0.05f, 0.0f, 1.0f);
            return float4(Mix3(sky, floorColor, fog), 1.0f);
        }
        return float4(sky, 1.0f);
    }
}

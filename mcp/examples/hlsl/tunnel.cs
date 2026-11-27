// Tunnel (HLSL style): Polar coordinates turned into a texture that rushes toward the viewer.
// Classic demoscene tunnel, written from scratch.
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

public class Tunnel
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

        float r = length(p) + 0.001f;
        float a = atan2(p.Y, p.X);
        float u = 0.3f / r + t * 0.8f;
        float v = a * 1.5915f + t * 0.1f;
        float checker = frac((floor(u * 4.0f) + floor(v * 6.0f)) * 0.5f) * 2.0f;
        float3 col = Mix3(float3(0.1f, 0.05f, 0.3f), float3(0.9f, 0.4f, 0.7f), checker);
        return float4(col * clamp(r * 2.5f, 0.0f, 1.0f), 1.0f);
    }
}

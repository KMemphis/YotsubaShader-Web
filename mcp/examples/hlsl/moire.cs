// Moiré rings (HLSL style): Two sets of concentric rings that interfere as their centres move.
// Moiré interference pattern, written from scratch.
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

public class Moire
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

    [ShaderStage(Stage.Fragment)]
    [return: SV_Target]
    public float4 Fragment([SV_Position] float4 fragCoord)
    {
        float aspect = Params.Resolution.X / Params.Resolution.Y;
        float2 uv = float2(fragCoord.X / Params.Resolution.X, fragCoord.Y / Params.Resolution.Y);
        float2 p = float2((uv.X - 0.5f) * aspect, uv.Y - 0.5f);
        float t = Params.Time;

        float2 c1 = float2(0.25f * cos(t * 0.5f), 0.2f * sin(t * 0.7f));
        float2 c2 = float2(-0.25f * cos(t * 0.6f), -0.2f * sin(t * 0.4f));
        float a = sin(length(p - c1) * 120.0f);
        float b = sin(length(p - c2) * 120.0f);
        float v = 0.5f + 0.5f * a * b;
        return float4(float3(v) * float3(0.9f, 0.95f, 1.0f), 1.0f);
    }
}

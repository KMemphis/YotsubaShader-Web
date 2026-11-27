// Kaleidoscope (HLSL style): Folds the plane into six mirrored wedges and paints rings over it.
// Classic polar-fold kaleidoscope, written from scratch.
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

public class Kaleidoscope
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

        float r = length(p);
        float a = atan2(p.Y, p.X) + t * 0.2f;
        float seg = 6.2832f / 6.0f;
        a = abs(a - seg * floor(a / seg) - seg * 0.5f);
        float2 q = float2(cos(a), sin(a)) * r;
        float v = sin(q.X * 18.0f - t * 2.0f) * sin(q.Y * 18.0f + t);
        float3 col = float3(0.5f + 0.5f * sin(v * 3.0f + r * 8.0f), 0.5f + 0.5f * sin(v * 3.0f + 2.0f), 0.5f + 0.5f * sin(v * 3.0f + 4.0f));
        return float4(col * (1.2f - r), 1.0f);
    }
}

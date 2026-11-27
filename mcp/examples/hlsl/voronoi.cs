// Voronoi cells (HLSL style): Animated Voronoi diagram: distance to the nearest of a jittered grid of points.
// Classic cellular noise (Worley), written from scratch.
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

public class Voronoi
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

    float2 Hash2(float2 q)
    {
        float a = dot(q, float2(127.1f, 311.7f));
        float b = dot(q, float2(269.5f, 183.3f));
        return float2(frac(sin(a) * 43758.5453f), frac(sin(b) * 43758.5453f));
    }

    [ShaderStage(Stage.Fragment)]
    [return: SV_Target]
    public float4 Fragment([SV_Position] float4 fragCoord)
    {
        float aspect = Params.Resolution.X / Params.Resolution.Y;
        float2 uv = float2(fragCoord.X / Params.Resolution.X, fragCoord.Y / Params.Resolution.Y);
        float2 p = float2((uv.X - 0.5f) * aspect, uv.Y - 0.5f);
        float t = Params.Time;

        float2 x = p * 6.0f;
        float2 cell = float2(floor(x.X), floor(x.Y));
        float2 f = x - cell;
        float best = 8.0f;
        for (int j = -1; j <= 1; j++)
        {
            for (int i = -1; i <= 1; i++)
            {
                float gi = i;
                float gj = j;
                float2 g = float2(gi, gj);
                float2 o = Hash2(cell + g);
                o = float2(0.5f + 0.5f * sin(t + 6.2831f * o.X), 0.5f + 0.5f * sin(t + 6.2831f * o.Y));
                float2 r = g + o - f;
                best = min(best, dot(r, r));
            }
        }
        float d = sqrt(best);
        float3 col = float3(d, d * d, 1.0f - d) * 0.9f + float3(0.05f);
        return float4(col, 1.0f);
    }
}

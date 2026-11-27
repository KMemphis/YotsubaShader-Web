// Hexagonal grid (MSL style): Hexagon cells with a pulsing border, from the hexagonal distance function.
// Hex tiling after the usual hexagonal grid technique, written from scratch.
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

public class HexGrid
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

    float HexDist(float2 q)
    {
        float2 a = float2(abs(q.X), abs(q.Y));
        float c = dot(a, normalize(float2(1.0f, 1.7321f)));
        return max(c, a.X);
    }

    [ShaderStage(Stage.Fragment)]
    public float4 Fragment([position] float4 fragCoord)
    {
        float aspect = Params.Resolution.X / Params.Resolution.Y;
        float2 uv = float2(fragCoord.X / Params.Resolution.X, fragCoord.Y / Params.Resolution.Y);
        float2 p = float2((uv.X - 0.5f) * aspect, uv.Y - 0.5f);
        float t = Params.Time;

        float2 s = float2(1.0f, 1.7321f);
        float2 x = p * 6.0f;
        float2 a = x - s * float2(floor(x.X / s.X + 0.5f), floor(x.Y / s.Y + 0.5f));
        float2 b = x - s * (float2(floor(x.X / s.X), floor(x.Y / s.Y)) + float2(0.5f));
        float2 g = a;
        if (dot(b, b) < dot(a, a))
        {
            g = b;
        }
        float d = HexDist(g);
        float edge = smoothstep(0.42f, 0.5f, d);
        float pulse = 0.5f + 0.5f * sin(t * 2.0f + length(x) * 1.5f);
        float3 col = Mix3(float3(0.08f, 0.12f, 0.2f) + float3(0.25f) * pulse * (1.0f - d), float3(0.4f, 0.9f, 1.0f), edge);
        return float4(col, 1.0f);
    }
}

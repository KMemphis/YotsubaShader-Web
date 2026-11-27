// Truchet tiles (MSL style): Quarter-circle tiles flipped at random: endless winding paths.
// Truchet tiling (Sébastien Truchet), written from scratch.
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

public class Truchet
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

    [ShaderStage(Stage.Fragment)]
    public float4 Fragment([position] float4 fragCoord)
    {
        float aspect = Params.Resolution.X / Params.Resolution.Y;
        float2 uv = float2(fragCoord.X / Params.Resolution.X, fragCoord.Y / Params.Resolution.Y);
        float2 p = float2((uv.X - 0.5f) * aspect, uv.Y - 0.5f);
        float t = Params.Time;

        float2 x = (p + float2(t * 0.05f, 0.0f)) * 8.0f;
        float2 cell = float2(floor(x.X), floor(x.Y));
        float2 f = x - cell;
        if (Hash(cell) > 0.5f)
        {
            f = float2(1.0f - f.X, f.Y);
        }
        float d1 = abs(length(f) - 0.5f);
        float d2 = abs(length(f - float2(1.0f)) - 0.5f);
        float d = min(d1, d2);
        float line = 1.0f - smoothstep(0.04f, 0.07f, d);
        float3 col = Mix3(float3(0.95f, 0.92f, 0.85f), float3(0.12f, 0.16f, 0.35f), line);
        return float4(col, 1.0f);
    }
}

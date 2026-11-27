// Starfield (MSL style): Three layers of twinkling stars drifting at different speeds for depth.
// Classic parallax starfield, written from scratch.
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

public class Starfield
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

        float3 col = float3(0.01f, 0.01f, 0.04f);
        for (int layer = 0; layer < 3; layer++)
        {
            float k = layer;
            float scale = 14.0f + k * 12.0f;
            float2 x = (p + float2(t * (0.02f + 0.02f * k), 0.0f)) * scale;
            float2 cell = float2(floor(x.X), floor(x.Y));
            float2 f = x - cell - float2(0.5f);
            float h = Hash(cell + float2(k * 31.0f));
            float2 offset = float2(Hash(cell * 1.7f) - 0.5f, Hash(cell * 2.3f) - 0.5f) * 0.6f;
            float d = length(f - offset);
            float twinkle = 0.6f + 0.4f * sin(t * 3.0f + h * 40.0f);
            float star = step(0.9f, h) * twinkle * (1.0f - smoothstep(0.0f, 0.12f, d));
            col += float3(0.8f, 0.85f, 1.0f) * star;
        }
        return float4(col, 1.0f);
    }
}

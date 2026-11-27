// SDF shapes (MSL style): A circle and a rounded box blended with a smooth minimum, drawn with distance bands.
// 2D signed distance functions as described by Inigo Quilez, written from scratch.
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

public class SdfShapes
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

    float SdBox(float2 q, float2 b)
    {
        float2 d = float2(abs(q.X) - b.X, abs(q.Y) - b.Y);
        return length(float2(max(d.X, 0.0f), max(d.Y, 0.0f))) + min(max(d.X, d.Y), 0.0f);
    }

    float SmoothMin(float a, float b, float k)
    {
        float h = clamp(0.5f + 0.5f * (b - a) / k, 0.0f, 1.0f);
        return mix(b, a, h) - k * h * (1.0f - h);
    }

    [ShaderStage(Stage.Fragment)]
    public float4 Fragment([position] float4 fragCoord)
    {
        float aspect = Params.Resolution.X / Params.Resolution.Y;
        float2 uv = float2(fragCoord.X / Params.Resolution.X, fragCoord.Y / Params.Resolution.Y);
        float2 p = float2((uv.X - 0.5f) * aspect, uv.Y - 0.5f);
        float t = Params.Time;

        float circle = length(p - float2(0.2f * sin(t), 0.0f)) - 0.18f;
        float box = SdBox(p + float2(0.15f, 0.0f), float2(0.15f, 0.1f)) - 0.05f;
        float d = SmoothMin(circle, box, 0.12f);
        float3 col = Mix3(float3(0.9f, 0.5f, 0.2f), float3(0.2f, 0.4f, 0.8f), step(0.0f, d));
        col = col * (0.8f + 0.2f * cos(d * 120.0f));
        col = Mix3(col, float3(1.0f), 1.0f - smoothstep(0.0f, 0.01f, abs(d)));
        return float4(col, 1.0f);
    }
}

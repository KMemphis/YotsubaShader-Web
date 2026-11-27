// Sunset (MSL style): A sky gradient with a sun, banding and a dark sea that reflects it.
// Written from scratch.
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

public class Sunset
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

    [ShaderStage(Stage.Fragment)]
    public float4 Fragment([position] float4 fragCoord)
    {
        float aspect = Params.Resolution.X / Params.Resolution.Y;
        float2 uv = float2(fragCoord.X / Params.Resolution.X, fragCoord.Y / Params.Resolution.Y);
        float2 p = float2((uv.X - 0.5f) * aspect, uv.Y - 0.5f);
        float t = Params.Time;

        float horizon = 0.0f;
        float3 sky = Mix3(float3(1.0f, 0.55f, 0.25f), float3(0.15f, 0.1f, 0.35f), clamp(p.Y * 1.8f, 0.0f, 1.0f));
        float2 sunPos = float2(0.0f, 0.12f + 0.02f * sin(t * 0.5f));
        float sun = 1.0f - smoothstep(0.17f, 0.18f, length(p - sunPos));
        float bands = step(0.5f, fract(p.Y * 40.0f + 0.4f)) * step(p.Y, 0.12f);
        sky = Mix3(sky, float3(1.0f, 0.85f, 0.4f), sun * (1.0f - bands * 0.5f));
        if (p.Y < horizon)
        {
            float wave = 0.5f + 0.5f * sin(p.Y * 90.0f + t * 2.0f + p.X * 4.0f);
            float glow = (1.0f - smoothstep(0.0f, 0.3f, abs(p.X))) * (0.3f + 0.5f * wave);
            return float4(float3(0.05f, 0.05f, 0.15f) + float3(1.0f, 0.5f, 0.2f) * glow * 0.6f, 1.0f);
        }
        return float4(sky, 1.0f);
    }
}

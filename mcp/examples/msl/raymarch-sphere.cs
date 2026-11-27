// Raymarched sphere (MSL style): Sphere traced through a signed distance function with diffuse light and a bobbing animation.
// Sphere tracing after the usual SDF technique (iquilezles.org), written from scratch.
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

public class RaymarchSphere
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

    float Map(float3 q, float time)
    {
        float3 center = float3(0.0f, 0.15f * sin(time * 1.5f), 3.0f);
        return length(q - center) - 1.0f;
    }

    [ShaderStage(Stage.Fragment)]
    public float4 Fragment([position] float4 fragCoord)
    {
        float aspect = Params.Resolution.X / Params.Resolution.Y;
        float2 uv = float2(fragCoord.X / Params.Resolution.X, fragCoord.Y / Params.Resolution.Y);
        float2 p = float2((uv.X - 0.5f) * aspect, uv.Y - 0.5f);
        float t = Params.Time;

        float3 ro = float3(0.0f);
        float3 rd = normalize(float3(p.X, p.Y, 1.5f));
        float dist = 0.0f;
        for (int i = 0; i < 48; i++)
        {
            float h = Map(ro + rd * dist, t);
            dist += h;
        }
        float3 hit = ro + rd * dist;
        float e = 0.002f;
        float3 n = normalize(float3(
            Map(hit + float3(e, 0.0f, 0.0f), t) - Map(hit - float3(e, 0.0f, 0.0f), t),
            Map(hit + float3(0.0f, e, 0.0f), t) - Map(hit - float3(0.0f, e, 0.0f), t),
            Map(hit + float3(0.0f, 0.0f, e), t) - Map(hit - float3(0.0f, 0.0f, e), t)));
        float3 light = normalize(float3(-0.5f, 0.8f, -0.6f));
        float diff = clamp(dot(n, light), 0.0f, 1.0f);
        float3 bg = float3(0.08f, 0.1f, 0.16f) + float3(0.1f) * uv.Y;
        float3 shade = float3(0.9f, 0.45f, 0.3f) * (0.15f + 0.85f * diff);
        float isHit = 1.0f - smoothstep(0.0f, 0.02f, Map(hit, t));
        return float4(Mix3(bg, shade, isHit), 1.0f);
    }
}

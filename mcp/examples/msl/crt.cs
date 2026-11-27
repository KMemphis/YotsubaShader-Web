// CRT screen (MSL style): A gradient seen through scanlines, an RGB mask and a vignette, like an old monitor.
// Classic CRT look, written from scratch.
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

public class Crt
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

    [ShaderStage(Stage.Fragment)]
    public float4 Fragment([position] float4 fragCoord)
    {
        float aspect = Params.Resolution.X / Params.Resolution.Y;
        float2 uv = float2(fragCoord.X / Params.Resolution.X, fragCoord.Y / Params.Resolution.Y);
        float2 p = float2((uv.X - 0.5f) * aspect, uv.Y - 0.5f);
        float t = Params.Time;

        float3 tint = float3(0.5f + 0.5f * sin(uv.X * 6.0f + t), 0.5f + 0.5f * sin(uv.Y * 5.0f - t * 0.7f), 0.5f + 0.5f * sin((uv.X + uv.Y) * 4.0f));
        float scan = 0.75f + 0.25f * sin(fragCoord.Y * 3.14159f);
        float mask = 0.85f + 0.15f * sin(fragCoord.X * 2.0944f);
        float vignette = 1.0f - 1.6f * dot(p, p) * 0.5f;
        float flicker = 0.97f + 0.03f * sin(t * 60.0f);
        return float4(tint * scan * mask * clamp(vignette, 0.0f, 1.0f) * flicker, 1.0f);
    }
}

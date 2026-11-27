// CRT screen (WGSL style): A gradient seen through scanlines, an RGB mask and a vignette, like an old monitor.
// Classic CRT look, written from scratch.
using YotsubaShader.Language;
using YotsubaShader.WgslSyntax;
using YotsubaShader.WgslSyntax.Types;
using YotsubaShader.WgslSyntax.Resources;
using static YotsubaShader.WgslSyntax.Methods.Math;
using static YotsubaShader.WgslSyntax.Methods.Intrinsic;
using static YotsubaShader.WgslSyntax.Methods.Constructors;

public struct Globals
{
    public float Time;
    public vec2<float> Resolution;
}

public struct VertexOutput
{
    [@builtin_position]
    public vec4<float> Position;
}

public class Crt
{
    [uniform, @group(0), @binding(0)]
    public Globals Params;

    // A single triangle that covers the screen, built from the vertex index.
    [ShaderStage(Stage.Vertex)]
    public VertexOutput Vertex([@builtin_vertex_index] uint id)
    {
        vec4<float> position;
        position.X = ((id << 1) & 2) * 2.0f - 1.0f;
        position.Y = (id & 2) * 2.0f - 1.0f;
        position.Z = 0.0f;
        position.W = 1.0f;

        VertexOutput output;
        output.Position = position;
        return output;
    }

    [ShaderStage(Stage.Fragment)]
    public vec4<float> Fragment([@builtin_position] vec4<float> fragCoord)
    {
        float aspect = Params.Resolution.X / Params.Resolution.Y;
        vec2<float> uv = vec2f(fragCoord.X / Params.Resolution.X, fragCoord.Y / Params.Resolution.Y);
        vec2<float> p = vec2f((uv.X - 0.5f) * aspect, uv.Y - 0.5f);
        float t = Params.Time;

        vec3<float> tint = vec3f(0.5f + 0.5f * sin(uv.X * 6.0f + t), 0.5f + 0.5f * sin(uv.Y * 5.0f - t * 0.7f), 0.5f + 0.5f * sin((uv.X + uv.Y) * 4.0f));
        float scan = 0.75f + 0.25f * sin(fragCoord.Y * 3.14159f);
        float mask = 0.85f + 0.15f * sin(fragCoord.X * 2.0944f);
        float vignette = 1.0f - 1.6f * dot(p, p) * 0.5f;
        float flicker = 0.97f + 0.03f * sin(t * 60.0f);
        return vec4f(tint * scan * mask * clamp(vignette, 0.0f, 1.0f) * flicker, 1.0f);
    }
}

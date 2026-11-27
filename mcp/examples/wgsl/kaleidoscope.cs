// Kaleidoscope (WGSL style): Folds the plane into six mirrored wedges and paints rings over it.
// Classic polar-fold kaleidoscope, written from scratch.
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

public class Kaleidoscope
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

        float r = length(p);
        float a = atan2(p.Y, p.X) + t * 0.2f;
        float seg = 6.2832f / 6.0f;
        a = abs(a - seg * floor(a / seg) - seg * 0.5f);
        vec2<float> q = vec2f(cos(a), sin(a)) * r;
        float v = sin(q.X * 18.0f - t * 2.0f) * sin(q.Y * 18.0f + t);
        vec3<float> col = vec3f(0.5f + 0.5f * sin(v * 3.0f + r * 8.0f), 0.5f + 0.5f * sin(v * 3.0f + 2.0f), 0.5f + 0.5f * sin(v * 3.0f + 4.0f));
        return vec4f(col * (1.2f - r), 1.0f);
    }
}

// Kaleidoscope (SPIR-V style): Folds the plane into six mirrored wedges and paints rings over it.
// Classic polar-fold kaleidoscope, written from scratch.
using YotsubaShader.Language;
using YotsubaShader.SpirvSyntax;
using YotsubaShader.SpirvSyntax.Types;
using YotsubaShader.SpirvSyntax.Resources;
using static YotsubaShader.SpirvSyntax.Methods.Math;
using static YotsubaShader.SpirvSyntax.Methods.Intrinsic;
using static YotsubaShader.SpirvSyntax.Methods.Constructors;

public struct Globals
{
    public float Time;
    public vec2 Resolution;
}

public struct VertexOutput
{
    [BuiltIn_Position]
    public vec4 Position;
}

public class Kaleidoscope
{
    [Uniform] [DescriptorSet(0)] [Binding(0)]
    public Globals Params;

    // A single triangle that covers the screen, built from the vertex index.
    [ShaderStage(Stage.Vertex)]
    public VertexOutput Vertex([BuiltIn_VertexIndex] int id)
    {
        vec4 position;
        position.X = ((id << 1) & 2) * 2.0f - 1.0f;
        position.Y = (id & 2) * 2.0f - 1.0f;
        position.Z = 0.0f;
        position.W = 1.0f;

        VertexOutput output;
        output.Position = position;
        return output;
    }

    [ShaderStage(Stage.Fragment)]
    public vec4 Fragment([BuiltIn_FragCoord] vec4 fragCoord)
    {
        float aspect = Params.Resolution.X / Params.Resolution.Y;
        vec2 uv = vec2(fragCoord.X / Params.Resolution.X, fragCoord.Y / Params.Resolution.Y);
        vec2 p = vec2((uv.X - 0.5f) * aspect, uv.Y - 0.5f);
        float t = Params.Time;

        float r = Length(p);
        float a = Atan2(p.Y, p.X) + t * 0.2f;
        float seg = 6.2832f / 6.0f;
        a = FAbs(a - seg * Floor(a / seg) - seg * 0.5f);
        vec2 q = vec2(Cos(a), Sin(a)) * r;
        float v = Sin(q.X * 18.0f - t * 2.0f) * Sin(q.Y * 18.0f + t);
        vec3 col = vec3(0.5f + 0.5f * Sin(v * 3.0f + r * 8.0f), 0.5f + 0.5f * Sin(v * 3.0f + 2.0f), 0.5f + 0.5f * Sin(v * 3.0f + 4.0f));
        return vec4(col * (1.2f - r), 1.0f);
    }
}

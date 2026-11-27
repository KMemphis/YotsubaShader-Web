// Truchet tiles (WGSL style): Quarter-circle tiles flipped at random: endless winding paths.
// Truchet tiling (Sébastien Truchet), written from scratch.
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

public class Truchet
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

    vec3<float> Mix3(vec3<float> a, vec3<float> b, float k)
    {
        return mix(a, b, vec3f(k));
    }

    float Hash(vec2<float> q)
    {
        return fract(sin(dot(q, vec2f(127.1f, 311.7f))) * 43758.5453f);
    }

    [ShaderStage(Stage.Fragment)]
    public vec4<float> Fragment([@builtin_position] vec4<float> fragCoord)
    {
        float aspect = Params.Resolution.X / Params.Resolution.Y;
        vec2<float> uv = vec2f(fragCoord.X / Params.Resolution.X, fragCoord.Y / Params.Resolution.Y);
        vec2<float> p = vec2f((uv.X - 0.5f) * aspect, uv.Y - 0.5f);
        float t = Params.Time;

        vec2<float> x = (p + vec2f(t * 0.05f, 0.0f)) * 8.0f;
        vec2<float> cell = vec2f(floor(x.X), floor(x.Y));
        vec2<float> f = x - cell;
        if (Hash(cell) > 0.5f)
        {
            f = vec2f(1.0f - f.X, f.Y);
        }
        float d1 = abs(length(f) - 0.5f);
        float d2 = abs(length(f - vec2f(1.0f)) - 0.5f);
        float d = min(d1, d2);
        float line = 1.0f - smoothstep(0.04f, 0.07f, d);
        vec3<float> col = Mix3(vec3f(0.95f, 0.92f, 0.85f), vec3f(0.12f, 0.16f, 0.35f), line);
        return vec4f(col, 1.0f);
    }
}

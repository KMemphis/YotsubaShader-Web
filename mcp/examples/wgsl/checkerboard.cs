// Checkerboard floor (WGSL style): An infinite checkerboard plane in perspective with a fading horizon.
// Classic perspective floor, written from scratch.
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

public class Checkerboard
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

    [ShaderStage(Stage.Fragment)]
    public vec4<float> Fragment([@builtin_position] vec4<float> fragCoord)
    {
        float aspect = Params.Resolution.X / Params.Resolution.Y;
        vec2<float> uv = vec2f(fragCoord.X / Params.Resolution.X, fragCoord.Y / Params.Resolution.Y);
        vec2<float> p = vec2f((uv.X - 0.5f) * aspect, uv.Y - 0.5f);
        float t = Params.Time;

        float horizon = 0.05f;
        float h = horizon - p.Y;
        vec3<float> sky = Mix3(vec3f(0.95f, 0.6f, 0.4f), vec3f(0.2f, 0.3f, 0.6f), uv.Y);
        if (h > 0.0f)
        {
            float depth = 0.5f / h;
            float x = p.X * depth * 2.0f;
            float z = depth + t * 2.0f;
            float c = fract((floor(x) + floor(z)) * 0.5f) * 2.0f;
            vec3<float> floorColor = Mix3(vec3f(0.1f), vec3f(0.9f), c);
            float fog = clamp(1.0f - depth * 0.05f, 0.0f, 1.0f);
            return vec4f(Mix3(sky, floorColor, fog), 1.0f);
        }
        return vec4f(sky, 1.0f);
    }
}

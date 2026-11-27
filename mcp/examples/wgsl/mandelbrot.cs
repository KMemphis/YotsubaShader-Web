// Mandelbrot set (WGSL style): Escape-time Mandelbrot with a smooth palette and a slow zoom.
// The Mandelbrot set, written from scratch.
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

public class Mandelbrot
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

        float zoom = 1.0f + 0.5f * sin(t * 0.3f);
        vec2<float> c = vec2f(p.X * 2.4f / zoom - 0.6f, p.Y * 2.4f / zoom);
        vec2<float> z = vec2f(0.0f);
        float n = 0.0f;
        for (int i = 0; i < 64; i++)
        {
            if (dot(z, z) < 16.0f)
            {
                z = vec2f(z.X * z.X - z.Y * z.Y + c.X, 2.0f * z.X * z.Y + c.Y);
                n += 1.0f;
            }
        }
        float k = n / 64.0f;
        vec3<float> col = vec3f(0.5f + 0.5f * cos(6.2832f * (k + 0.0f)), 0.5f + 0.5f * cos(6.2832f * (k + 0.33f)), 0.5f + 0.5f * cos(6.2832f * (k + 0.67f)));
        return vec4f(col * (1.0f - step(63.5f, n)), 1.0f);
    }
}

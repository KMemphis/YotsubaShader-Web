using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.GlslSyntax.Resources;
using static YotsubaShader.GlslSyntax.Methods.Math;
using static YotsubaShader.GlslSyntax.Methods.Intrinsic;

public struct Globals
{
    public float Time;
    public vec2 Resolution;
}

public struct VertexOutput
{
    [gl_Position]
    public vec4 Position;
}

public class MeshGradient
{
    [uniform, layout(0, 0)]
    public Globals Params;

    [ShaderStage(Stage.Vertex)]
    public VertexOutput Vertex([gl_VertexIndex] uint id)
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

    vec3 Rgb(float r, float g, float b)
    {
        vec3 color;
        color.X = r;
        color.Y = g;
        color.Z = b;
        return color;
    }

    vec3 Tint(int index)
    {
        if (index == 0) return Rgb(1.00f, 0.36f, 0.48f);
        if (index == 1) return Rgb(0.38f, 0.44f, 1.00f);
        if (index == 2) return Rgb(0.10f, 0.82f, 0.88f);
        if (index == 3) return Rgb(1.00f, 0.74f, 0.28f);
        return Rgb(0.70f, 0.32f, 0.98f);
    }

    [ShaderStage(Stage.Fragment)]
    public vec4 Fragment([gl_FragCoord] vec4 fragCoord)
    {
        float aspect = Params.Resolution.X / Params.Resolution.Y;
        float u = fragCoord.X / Params.Resolution.X;
        float v = fragCoord.Y / Params.Resolution.Y;
        float x = (u - 0.5f) * aspect;
        float y = v - 0.5f;
        float t = Params.Time * 0.35f;

        // Five soft colour sources drifting on their own paths.
        float red = 0.0f;
        float green = 0.0f;
        float blue = 0.0f;
        float weights = 0.0f;
        for (int i = 0; i < 5; i++)
        {
            float k = i;
            float dx = x - cos(t * (0.55f + 0.11f * k) + k * 2.1f) * 0.62f;
            float dy = y - sin(t * (0.43f + 0.09f * k) + k * 1.7f) * 0.38f;
            float distance2 = dx * dx + dy * dy;
            float weight = 1.0f / (distance2 * distance2 + 0.015f);

            vec3 tint = Tint(i);
            red += tint.X * weight;
            green += tint.Y * weight;
            blue += tint.Z * weight;
            weights += weight;
        }

        // A gentle sheen and a touch of grain keep the large gradients from banding.
        float sheen = 0.5f + 0.5f * sin(x * 2.2f - y * 1.6f + t);
        float gain = (0.92f + 0.12f * sheen) / weights;
        float grain = (fract(sin(u * 913.0f + v * 1731.0f) * 43758.5f) - 0.5f) * 0.012f;

        vec4 result;
        result.X = red * gain + grain;
        result.Y = green * gain + grain;
        result.Z = blue * gain + grain;
        result.W = 1.0f;
        return result;
    }
}

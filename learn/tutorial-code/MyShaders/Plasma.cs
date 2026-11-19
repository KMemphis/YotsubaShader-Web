using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Resources;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.Language;
using static YotsubaShader.GlslSyntax.Methods.Math;

namespace MyShaders;

public struct Clock
{
    public float Seconds;
}

public class Plasma
{
    [uniform, layout(0, 0)]
    public Clock Time;

    [ShaderStage(Stage.Vertex)]
    public Pixel Vertex(Corner corner)
    {
        Pixel pixel;
        pixel.Position = Make.Vec4(corner.Position.X, corner.Position.Y, 0f, 1f);
        pixel.Uv = corner.Uv;
        return pixel;
    }

    [ShaderStage(Stage.Fragment)]
    [return: location(0)]
    public vec4 Fragment(PixelIn pixel)
    {
        float x = pixel.Uv.X * 2f - 1f;
        float y = pixel.Uv.Y * 2f - 1f;
        float t = Time.Seconds;

        float waves = sin(x * 6f + t)
                   + sin(y * 6f + t * 1.3f)
                   + sin((x + y) * 6f + t * 0.7f)
                   + sin(sqrt(x * x + y * y) * 9f - t * 2f);

        return Rainbow(waves);
    }

    public static vec4 Rainbow(float value)
    {
        float red = 0.5f + 0.5f * sin(value * 1.5f);
        float green = 0.5f + 0.5f * sin(value * 1.5f + 2.1f);
        float blue = 0.5f + 0.5f * sin(value * 1.5f + 4.2f);
        return Make.Vec4(red, green, blue, 1f);
    }
}

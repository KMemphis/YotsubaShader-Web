using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Resources;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.Language;

namespace MyShaders;

public struct Stopwatch
{
    public float Seconds;
}

public class Sweep
{
    [uniform, layout(0, 0)]
    public Stopwatch Time;

    [ShaderStage(Stage.Vertex)]
    public Pixel Vertex(Corner corner)
    {
        Pixel pixel;
        pixel.Position = new vec4(corner.Position.X, corner.Position.Y, 0f, 1f);
        pixel.Uv = corner.Uv;
        return pixel;
    }

    [ShaderStage(Stage.Fragment)]
    [return: location(0)]
    public vec4 Fragment(PixelIn pixel)
    {
        float center = Time.Seconds * 0.5f;

        float distance = pixel.Uv.X - center;
        if (distance < 0f)
        {
            distance = -distance;
        }

        float brightness = 1f - distance * 5f;
        if (brightness < 0f)
        {
            brightness = 0f;
        }

        return new vec4(brightness, brightness * 0.5f, 0.15f + 0.35f * pixel.Uv.Y, 1f);
    }
}

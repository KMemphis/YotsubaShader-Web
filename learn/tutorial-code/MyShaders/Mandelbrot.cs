using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.Language;

namespace MyShaders;

public class Mandelbrot
{
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
        float cx = pixel.Uv.X * 3f - 2.2f;
        float cy = pixel.Uv.Y * 3f - 1.5f;

        int steps = CountSteps(cx, cy);

        if (steps == 100)
        {
            return Make.Vec4(0f, 0f, 0f, 1f);
        }

        float t = steps / 100f;
        return Palette(t);
    }

    public static int CountSteps(float cx, float cy)
    {
        float x = 0f;
        float y = 0f;
        int steps = 0;

        while (steps < 100)
        {
            float newX = x * x - y * y + cx;
            float newY = 2f * x * y + cy;
            x = newX;
            y = newY;

            if (x * x + y * y > 4f)
            {
                break;
            }

            steps++;
        }

        return steps;
    }

    public static vec4 Palette(float t)
    {
        float rest = 1f - t;
        float red = 9f * rest * t * t * t;
        float green = 15f * rest * rest * t * t;
        float blue = 8.5f * rest * rest * rest * t;
        return Make.Vec4(red, green, blue, 1f);
    }
}

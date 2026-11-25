using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.Language;
using static YotsubaShader.GlslSyntax.Methods.Math;

namespace MyShaders;

public class Neon
{
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
        float x = pixel.Uv.X * 2f - 1f;
        float y = pixel.Uv.Y * 2f - 1f;

        float distanceToCenter = sqrt(x * x + y * y);
        float distanceToRing = abs(distanceToCenter - 0.6f);

        float glow = clamp(0.03f / distanceToRing, 0f, 1f);

        vec3 pink = new vec3(1f, 0.2f, 0.7f);
        vec3 cyan = new vec3(0.2f, 0.8f, 1f);
        vec3 tube = mix(pink, cyan, pixel.Uv.X);

        vec3 background = new vec3(0.02f, 0.02f, 0.06f);
        vec3 color = mix(background, tube, glow);

        return new vec4(color.X, color.Y, color.Z, 1f);
    }
}

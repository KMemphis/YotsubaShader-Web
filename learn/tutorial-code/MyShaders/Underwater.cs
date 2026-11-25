using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Resources;
using YotsubaShader.GlslSyntax.Resources.Types;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.Language;
using static YotsubaShader.GlslSyntax.Methods.Intrinsic;
using static YotsubaShader.GlslSyntax.Methods.Math;

namespace MyShaders;

public class Underwater
{
    [uniform, layout(0, 0)]
    public Clock Time;

    [layout(0, 1)]
    public sampler2D Photo;

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
        float t = Time.Seconds;

        float u = pixel.Uv.X + sin(pixel.Uv.Y * 25f + t * 2f) * 0.012f;
        float v = pixel.Uv.Y + sin(pixel.Uv.X * 20f + t * 1.5f) * 0.012f;

        vec4 photo = texture(Photo, new vec2(u, v));

        vec3 original = new vec3(photo.X, photo.Y, photo.Z);
        vec3 seaBlue = new vec3(photo.X * 0.2f, photo.Y * 0.7f, photo.Z * 1f + 0.1f);
        vec3 color = mix(original, seaBlue, 0.6f);

        float shade = Vignette(pixel.Uv.X, pixel.Uv.Y);

        return new vec4(color.X * shade, color.Y * shade, color.Z * shade, 1f);
    }

    public static float Vignette(float u, float v)
    {
        float x = u * 2f - 1f;
        float y = v * 2f - 1f;
        float distance = sqrt(x * x + y * y);
        return 1f - smoothstep(0.5f, 1.4f, distance);
    }
}

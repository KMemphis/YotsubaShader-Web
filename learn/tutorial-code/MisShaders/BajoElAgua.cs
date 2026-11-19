using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Resources;
using YotsubaShader.GlslSyntax.Resources.Types;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.Language;
using static YotsubaShader.GlslSyntax.Methods.Intrinsic;
using static YotsubaShader.GlslSyntax.Methods.Math;

namespace MisShaders;

public class BajoElAgua
{
    [uniform, layout(0, 0)]
    public Reloj Tiempo;

    [layout(0, 1)]
    public sampler2D Foto;

    [ShaderStage(Stage.Vertex)]
    public Pixel Vertex(Vertice vertice)
    {
        Pixel pixel;
        pixel.Posicion = Crear.Vec4(vertice.Posicion.X, vertice.Posicion.Y, 0f, 1f);
        pixel.Uv = vertice.Uv;
        return pixel;
    }

    [ShaderStage(Stage.Fragment)]
    [return: location(0)]
    public vec4 Fragment(PixelIn pixel)
    {
        float t = Tiempo.Segundos;

        float u = pixel.Uv.X + sin(pixel.Uv.Y * 25f + t * 2f) * 0.012f;
        float v = pixel.Uv.Y + sin(pixel.Uv.X * 20f + t * 1.5f) * 0.012f;

        vec4 foto = texture(Foto, Crear.Vec2(u, v));

        vec3 original = Crear.Vec3(foto.X, foto.Y, foto.Z);
        vec3 azulMar = Crear.Vec3(foto.X * 0.2f, foto.Y * 0.7f, foto.Z * 1f + 0.1f);
        vec3 color = mix(original, azulMar, 0.6f);

        float sombra = Vineta(pixel.Uv.X, pixel.Uv.Y);

        return Crear.Vec4(color.X * sombra, color.Y * sombra, color.Z * sombra, 1f);
    }

    public static float Vineta(float u, float v)
    {
        float x = u * 2f - 1f;
        float y = v * 2f - 1f;
        float distancia = sqrt(x * x + y * y);
        return 1f - smoothstep(0.5f, 1.4f, distancia);
    }
}

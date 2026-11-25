using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.Language;
using static YotsubaShader.GlslSyntax.Methods.Math;

namespace MisShaders;

public class Neon
{
    [ShaderStage(Stage.Vertex)]
    public Pixel Vertex(Vertice vertice)
    {
        Pixel pixel;
        pixel.Posicion = new vec4(vertice.Posicion.X, vertice.Posicion.Y, 0f, 1f);
        pixel.Uv = vertice.Uv;
        return pixel;
    }

    [ShaderStage(Stage.Fragment)]
    [return: location(0)]
    public vec4 Fragment(PixelIn pixel)
    {
        float x = pixel.Uv.X * 2f - 1f;
        float y = pixel.Uv.Y * 2f - 1f;

        float distanciaAlCentro = sqrt(x * x + y * y);
        float distanciaAlAnillo = abs(distanciaAlCentro - 0.6f);

        float brillo = clamp(0.03f / distanciaAlAnillo, 0f, 1f);

        vec3 rosa = new vec3(1f, 0.2f, 0.7f);
        vec3 celeste = new vec3(0.2f, 0.8f, 1f);
        vec3 tubo = mix(rosa, celeste, pixel.Uv.X);

        vec3 fondo = new vec3(0.02f, 0.02f, 0.06f);
        vec3 color = mix(fondo, tubo, brillo);

        return new vec4(color.X, color.Y, color.Z, 1f);
    }
}

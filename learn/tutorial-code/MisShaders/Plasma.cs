using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Resources;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.Language;
using static YotsubaShader.GlslSyntax.Methods.Math;

namespace MisShaders;

public struct Reloj
{
    public float Segundos;
}

public class Plasma
{
    [uniform, layout(0, 0)]
    public Reloj Tiempo;

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
        float x = pixel.Uv.X * 2f - 1f;
        float y = pixel.Uv.Y * 2f - 1f;
        float t = Tiempo.Segundos;

        float olas = sin(x * 6f + t)
                   + sin(y * 6f + t * 1.3f)
                   + sin((x + y) * 6f + t * 0.7f)
                   + sin(sqrt(x * x + y * y) * 9f - t * 2f);

        return Arcoiris(olas);
    }

    public static vec4 Arcoiris(float valor)
    {
        float rojo = 0.5f + 0.5f * sin(valor * 1.5f);
        float verde = 0.5f + 0.5f * sin(valor * 1.5f + 2.1f);
        float azul = 0.5f + 0.5f * sin(valor * 1.5f + 4.2f);
        return Crear.Vec4(rojo, verde, azul, 1f);
    }
}

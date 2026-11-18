using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.Language;

namespace MisShaders;

public class Mandelbrot
{
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
    public vec4 Fragment(Pixel pixel)
    {
        float cx = pixel.Uv.X * 3f - 2.2f;
        float cy = pixel.Uv.Y * 3f - 1.5f;

        int pasos = ContarPasos(cx, cy);

        if (pasos == 100)
        {
            return Crear.Vec4(0f, 0f, 0f, 1f);
        }

        float t = pasos / 100f;
        return Paleta(t);
    }

    public static int ContarPasos(float cx, float cy)
    {
        float x = 0f;
        float y = 0f;
        int pasos = 0;

        while (pasos < 100)
        {
            float nuevoX = x * x - y * y + cx;
            float nuevoY = 2f * x * y + cy;
            x = nuevoX;
            y = nuevoY;

            if (x * x + y * y > 4f)
            {
                break;
            }

            pasos++;
        }

        return pasos;
    }

    public static vec4 Paleta(float t)
    {
        float resto = 1f - t;
        float rojo = 9f * resto * t * t * t;
        float verde = 15f * resto * resto * t * t;
        float azul = 8.5f * resto * resto * resto * t;
        return Crear.Vec4(rojo, verde, azul, 1f);
    }
}

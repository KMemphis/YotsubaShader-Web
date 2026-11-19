using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Types;

namespace MisShaders;

public struct Vertice
{
    [location(0)] public vec2 Posicion;
    [location(1)] public vec2 Uv;
}

public struct Pixel
{
    [gl_Position] public vec4 Posicion;
    [location(0)] public vec2 Uv;
}

public struct PixelIn
{
    [location(0)] public vec2 Uv;
}

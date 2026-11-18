using YotsubaShader.GlslSyntax.Types;

namespace MisShaders;

public static class Crear
{
    public static vec2 Vec2(float x, float y)
    {
        vec2 v;
        v.X = x;
        v.Y = y;
        return v;
    }

    public static vec3 Vec3(float x, float y, float z)
    {
        vec3 v;
        v.X = x;
        v.Y = y;
        v.Z = z;
        return v;
    }

    public static vec4 Vec4(float x, float y, float z, float w)
    {
        vec4 v;
        v.X = x;
        v.Y = y;
        v.Z = z;
        v.W = w;
        return v;
    }
}

using YotsubaShader.GlslSyntax.Types;
namespace Lab;
public static class Make
{
    public static vec4 Vec4(float x, float y, float z, float w)
    {
        vec4 v;
        v.X = x; v.Y = y; v.Z = z; v.W = w;
        return v;
    }
}

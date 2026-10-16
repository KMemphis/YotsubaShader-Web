using YotsubaShader.Language.Native.Types.Vector;

namespace MyEngine;

[Vector]
public struct Vector4
{
    [VectorComponent(0)] public float X;
    [VectorComponent(1)] public float Y;
    [VectorComponent(2)] public float Z;
    [VectorComponent(3)] public float W;

    public Vector4(float x, float y, float z, float w)
    {
        X = x; Y = y; Z = z; W = w;
    }
}

using YotsubaShader.Language.Native.Types.Vector;

namespace MyEngine;

[Vector]
public partial struct Vector3
{
    [VectorComponent(0)] public float X { get; set; }
    [VectorComponent(1)] public float Y { get; set; }
    [VectorComponent(2)] public float Z { get; set; }

    public Vector3(float x, float y, float z) { X = x; Y = y; Z = z; }

    public static Vector3 Normalize(Vector3 v)
    {
        float length = MathF.Sqrt(v.X * v.X + v.Y * v.Y + v.Z * v.Z);
        return new Vector3(v.X / length, v.Y / length, v.Z / length);
    }
}

// Integer vectors: all the components share one type
[Vector]
public struct Point2
{
    [VectorComponent(0)] public int X;
    [VectorComponent(1)] public int Y;
}

[Vector]
public struct UPoint3
{
    [VectorComponent(0)] public uint X;
    [VectorComponent(1)] public uint Y;
    [VectorComponent(2)] public uint Z;
}

using MyEngine;

public struct Light
{
    public Vector3 Direction;
    public float Intensity;
}

public struct FrameData
{
    public Matrix4 ViewProjection;
    public Vector3 CameraPosition;
    public float Time;
    public Light Sun;
}

public struct MaterialData
{
    public Vector4 Tint;
    public float Roughness;
}

public struct ObjectData
{
    public Matrix4 World;
}

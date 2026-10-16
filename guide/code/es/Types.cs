using MyEngine;
using YotsubaShader.Language;
using YotsubaShader.Language.StylesAttributes;
using YotsubaShader.Language.StylesAttributes.HlslStyle;

public struct VertexInput
{
    [Location(0)] public Vector3 Position;
    [Location(1)] public Vector3 Normal;
    [Location(2)] public Vector2 UV;
}

public struct VertexOutput
{
    [SV_Position] public Vector4 Position;
    [Location(0)] public Vector3 Normal;
    [Location(1)] public Vector2 UV;
}

using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.HlslSyntax;
using YotsubaShader.Language;

namespace Lab;

// 1) GLSL style
public class TriangleGlsl
{
    public struct Corner
    {
        [location(0)] public vec2 Position;
        [location(1)] public vec4 Color;
    }
    public struct Pixel
    {
        [gl_Position] public vec4 Position;
        [location(0)] public vec4 Color;
    }
    [ShaderStage(Stage.Vertex)]
    public Pixel Vertex(Corner corner)
    {
        Pixel pixel;
        pixel.Position = Make.Vec4(corner.Position.X, corner.Position.Y, 0f, 1f);
        pixel.Color = corner.Color;
        return pixel;
    }
    [ShaderStage(Stage.Fragment)]
    [return: location(0)]
    public vec4 Fragment(Pixel pixel)
    {
        return pixel.Color;
    }
}

// 2) HLSL style
public class TriangleHlsl
{
    public struct Corner
    {
        [POSITION] public vec2 Position;
        [COLOR] public vec4 Color;
    }
    public struct Pixel
    {
        [SV_Position] public vec4 Position;
        [TEXCOORD(0)] public vec4 Color;
    }
    [ShaderStage(Stage.Vertex)]
    public Pixel Vertex(Corner corner)
    {
        Pixel pixel;
        pixel.Position = Make.Vec4(corner.Position.X, corner.Position.Y, 0f, 1f);
        pixel.Color = corner.Color;
        return pixel;
    }
    [ShaderStage(Stage.Fragment)]
    [return: SV_Target]
    public vec4 Fragment(Pixel pixel)
    {
        return pixel.Color;
    }
}

// 3) Mixed
public class TriangleMixed
{
    public struct Corner
    {
        [POSITION] public vec2 Position;
        [location(1)] public vec4 Color;
    }
    public struct Pixel
    {
        [gl_Position] public vec4 Position;
        [TEXCOORD(0)] public vec4 Color;
    }
    [ShaderStage(Stage.Vertex)]
    public Pixel Vertex(Corner corner)
    {
        Pixel pixel;
        pixel.Position = Make.Vec4(corner.Position.X, corner.Position.Y, 0f, 1f);
        pixel.Color = corner.Color;
        return pixel;
    }
    [ShaderStage(Stage.Fragment)]
    [return: location(0)]
    public vec4 Fragment(Pixel pixel)
    {
        return pixel.Color;
    }
}

// 4) HLSL style with explicit indices everywhere
public class TriangleHlslIdx
{
    public struct Corner
    {
        [TEXCOORD(0)] public vec2 Position;
        [TEXCOORD(1)] public vec4 Color;
    }
    public struct Pixel
    {
        [SV_Position] public vec4 Position;
        [TEXCOORD(0)] public vec4 Color;
    }
    [ShaderStage(Stage.Vertex)]
    public Pixel Vertex(Corner corner)
    {
        Pixel pixel;
        pixel.Position = Make.Vec4(corner.Position.X, corner.Position.Y, 0f, 1f);
        pixel.Color = corner.Color;
        return pixel;
    }
    [ShaderStage(Stage.Fragment)]
    [return: SV_Target]
    public vec4 Fragment(Pixel pixel)
    {
        return pixel.Color;
    }
}

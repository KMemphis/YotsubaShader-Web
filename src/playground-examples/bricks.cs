using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.GlslSyntax.Resources;
using YotsubaShader.GlslSyntax.Resources.Types;
using static YotsubaShader.GlslSyntax.Methods.Math;
using static YotsubaShader.GlslSyntax.Methods.Intrinsic;

public struct Globals
{
    public float Time;
    public vec2 Resolution;
    public vec4 Mouse;
}

public struct VertexOutput
{
    [gl_Position]
    public vec4 Position;
}

public class Bricks
{
    [uniform, layout(0, 0)]
    public Globals Params;

    // Two images: the colour of the wall and a height map with its relief.
    // Red Brick by Poly Haven (polyhaven.com/a/red_brick), CC0.
    [uniform, layout(0, 1)]
    public sampler2D Albedo;

    [uniform, layout(0, 2)]
    public sampler2D Height;

    [ShaderStage(Stage.Vertex)]
    public VertexOutput Vertex([gl_VertexIndex] uint id)
    {
        vec4 position;
        position.X = ((id << 1) & 2) * 2.0f - 1.0f;
        position.Y = (id & 2) * 2.0f - 1.0f;
        position.Z = 0.0f;
        position.W = 1.0f;

        VertexOutput output;
        output.Position = position;
        return output;
    }

    vec3 Rgb(float r, float g, float b)
    {
        vec3 color;
        color.X = r;
        color.Y = g;
        color.Z = b;
        return color;
    }

    vec2 Uv(float u, float v)
    {
        vec2 uv;
        uv.X = u;
        uv.Y = v;
        return uv;
    }

    float HeightAt(float u, float v)
    {
        return texture(Height, Uv(u, v)).X;
    }

    vec3 ColorAt(float u, float v)
    {
        vec4 texel = texture(Albedo, Uv(u, v));
        return Rgb(texel.X, texel.Y, texel.Z);
    }

    // One lamp at (lampX, lampY), a little in front of the wall.
    vec3 Lamp(float x, float y, vec3 normal, vec3 albedo, float lampX, float lampY, vec3 tint, float power)
    {
        float toX = lampX - x;
        float toY = lampY - y;
        float toZ = 0.30f;
        float away = sqrt(toX * toX + toY * toY + toZ * toZ);
        vec3 l = Rgb(toX / away, toY / away, toZ / away);
        float falloff = 1.0f / (1.0f + 2.2f * away * away);

        vec3 halfway = normalize(Rgb(l.X, l.Y, l.Z + 1.0f));
        float diffuse = clamp(dot(normal, l), 0.0f, 1.0f) * falloff * power;
        float specular = pow(clamp(dot(normal, halfway), 0.0f, 1.0f), 30.0f) * falloff * 0.5f * power;

        // A small glow around the lamp itself.
        float glow = 0.004f / (away * away * 0.25f + 0.004f) * 0.05f;
        float shine = specular + glow;
        return Rgb(
            tint.X * (albedo.X * diffuse + shine),
            tint.Y * (albedo.Y * diffuse + shine),
            tint.Z * (albedo.Z * diffuse + shine));
    }

    [ShaderStage(Stage.Fragment)]
    public vec4 Fragment([gl_FragCoord] vec4 fragCoord)
    {
        float aspect = Params.Resolution.X / Params.Resolution.Y;
        float x = fragCoord.X / Params.Resolution.X * aspect;
        float y = fragCoord.Y / Params.Resolution.Y;
        float u = x * 1.15f;
        float v = y * 1.15f;

        // The slope of the height map gives the direction each brick face leans towards.
        float e = 0.0015f;
        float slopeX = HeightAt(u + e, v) - HeightAt(u - e, v);
        float slopeY = HeightAt(u, v + e) - HeightAt(u, v - e);
        vec3 normal = normalize(Rgb(-slopeX * 14.0f, -slopeY * 14.0f, 1.0f));

        // A warm light circles the wall. Press and drag inside the preview to move it yourself.
        float t = Params.Time * 0.6f;
        float lampX = (0.5f + 0.38f * cos(t)) * aspect;
        float lampY = 0.5f + 0.34f * sin(t * 1.3f);
        if (Params.Mouse.Z > 0.5f)
        {
            lampX = Params.Mouse.X / Params.Resolution.X * aspect;
            lampY = Params.Mouse.Y / Params.Resolution.Y;
        }

        vec3 albedo = ColorAt(u, v);

        // The warm lamp, and a cool one on the opposite side of the wall.
        vec3 warm = Lamp(x, y, normal, albedo, lampX, lampY, Rgb(1.00f, 0.74f, 0.42f), 2.6f);
        vec3 cool = Lamp(x, y, normal, albedo, aspect - lampX, 1.0f - lampY, Rgb(0.28f, 0.50f, 1.00f), 1.3f);

        vec4 result;
        result.X = albedo.X * 0.05f + warm.X + cool.X;
        result.Y = albedo.Y * 0.07f + warm.Y + cool.Y;
        result.Z = albedo.Z * 0.13f + warm.Z + cool.Z;
        result.W = 1.0f;
        return result;
    }
}

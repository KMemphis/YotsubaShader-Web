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
}

public struct VertexOutput
{
    [gl_Position]
    public vec4 Position;
}

public class Pool
{
    [uniform, layout(0, 0)]
    public Globals Params;

    // Marble 01 by Rob Tuytel on Poly Haven (polyhaven.com/a/marble_01), CC0.
    [uniform, layout(0, 1)]
    public sampler2D Tiles;

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

    vec3 FloorAt(float u, float v)
    {
        vec2 uv;
        uv.X = u;
        uv.Y = v;
        vec4 texel = texture(Tiles, uv);
        return Rgb(texel.X, texel.Y, texel.Z);
    }

    // A web of bright, thin lines where the waves focus the light.
    float Caustics(float x, float y, float t)
    {
        float sum = 0.0f;
        float qx = x * 15.0f;
        float qy = y * 15.0f;
        for (int i = 0; i < 4; i++)
        {
            float k = i;
            float nextX = qx + sin(qy * 1.1f + t * 0.7f + k * 1.7f) * 0.7f;
            float nextY = qy + sin(qx * 0.9f - t * 0.5f + k * 2.3f) * 0.7f;
            qx = nextX;
            qy = nextY;
            float ridge = 1.0f - abs(sin(qx) + sin(qy)) * 0.5f;
            sum += pow(clamp(ridge, 0.0f, 1.0f), 12.0f);
        }
        return sum * 0.4f;
    }

    [ShaderStage(Stage.Fragment)]
    public vec4 Fragment([gl_FragCoord] vec4 fragCoord)
    {
        float aspect = Params.Resolution.X / Params.Resolution.Y;
        float screenY = fragCoord.Y / Params.Resolution.Y;
        float x = fragCoord.X / Params.Resolution.X * aspect;
        float y = screenY;
        float t = Params.Time;

        // The surface bends the view of the tiles a little.
        float waveX = (sin(y * 7.0f + t * 1.7f) + sin((x + y) * 5.0f + t * 1.1f)) * 0.0055f;
        float waveY = (cos(x * 6.0f - t * 1.4f) + cos((y - x) * 4.5f + t * 0.9f)) * 0.0055f;

        vec3 tiles = FloorAt(x * 1.25f + waveX, y * 1.25f + waveY);
        vec3 water = mix(tiles, Rgb(0.02f, 0.72f, 0.95f), 0.36f);

        float light = Caustics(x + waveX * 6.0f, y + waveY * 6.0f, t);
        float lit = 0.85f + 0.55f * light;
        vec3 color = Rgb(
            water.X * 0.80f * lit + 0.45f * light * 0.14f,
            water.Y * 1.00f * lit + 0.95f * light * 0.14f,
            water.Z * 1.10f * lit + 1.00f * light * 0.14f);

        // Deeper and darker towards the top of the frame.
        float depth = smoothstep(0.0f, 1.0f, screenY);
        color = mix(color, Rgb(0.01f, 0.08f, 0.16f), depth * 0.45f);

        vec4 result;
        result.X = color.X;
        result.Y = color.Y;
        result.Z = color.Z;
        result.W = 1.0f;
        return result;
    }
}

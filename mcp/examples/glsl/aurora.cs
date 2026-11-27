using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.GlslSyntax.Resources;
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

public class Aurora
{
    [uniform, layout(0, 0)]
    public Globals Params;

    // One triangle that covers the whole screen, built from the vertex index.
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

    float Hash(float x, float y)
    {
        return fract(sin(x * 127.1f + y * 311.7f) * 43758.5453f);
    }

    float Noise(float x, float y)
    {
        float cellX = floor(x);
        float cellY = floor(y);
        float fx = x - cellX;
        float fy = y - cellY;
        float ux = fx * fx * (3.0f - 2.0f * fx);
        float uy = fy * fy * (3.0f - 2.0f * fy);

        float a = Hash(cellX, cellY);
        float b = Hash(cellX + 1.0f, cellY);
        float c = Hash(cellX, cellY + 1.0f);
        float d = Hash(cellX + 1.0f, cellY + 1.0f);
        return mix(mix(a, b, ux), mix(c, d, ux), uy);
    }

    // Layers of noise, each one finer and fainter than the last.
    float Fbm(float x, float y)
    {
        float sum = 0.0f;
        float amplitude = 0.5f;
        float qx = x;
        float qy = y;
        for (int i = 0; i < 5; i++)
        {
            sum += amplitude * Noise(qx, qy);
            qx = qx * 2.03f + 17.3f;
            qy = qy * 2.03f + 9.1f;
            amplitude *= 0.5f;
        }
        return sum;
    }

    // Night blue, violet, pink, then a warm peach at the brightest folds.
    vec3 Ramp(float t)
    {
        vec3 color = Rgb(0.02f, 0.03f, 0.12f);
        color = mix(color, Rgb(0.08f, 0.22f, 0.85f), smoothstep(0.00f, 0.30f, t));
        color = mix(color, Rgb(0.58f, 0.26f, 0.95f), smoothstep(0.30f, 0.55f, t));
        color = mix(color, Rgb(1.00f, 0.36f, 0.60f), smoothstep(0.55f, 0.78f, t));
        color = mix(color, Rgb(1.00f, 0.78f, 0.46f), smoothstep(0.78f, 1.00f, t));
        return color;
    }

    [ShaderStage(Stage.Fragment)]
    public vec4 Fragment([gl_FragCoord] vec4 fragCoord)
    {
        float aspect = Params.Resolution.X / Params.Resolution.Y;
        float x = (fragCoord.X / Params.Resolution.X - 0.5f) * aspect * 1.5f;
        float y = (fragCoord.Y / Params.Resolution.Y - 0.5f) * 1.5f;
        float t = Params.Time * 0.10f;

        // Warp the coordinates with noise twice to get slow, silky folds.
        float qx = Fbm(x, y + t);
        float qy = Fbm(x + 5.2f, y + 1.3f - t);
        float rx = Fbm(x + qx * 2.2f + 1.7f, y + qy * 2.2f + 9.2f + t);
        float ry = Fbm(x + qx * 2.2f + 8.3f, y + qy * 2.2f + 2.8f - t);
        float field = Fbm(x + rx * 1.6f, y + ry * 1.6f);

        float level = clamp((field - 0.12f) * 2.3f + (rx - 0.5f) * 0.4f, 0.0f, 1.0f);
        vec3 color = Ramp(level);

        // Soft vignette so the edges fall into the dark.
        vec2 centered;
        centered.X = x;
        centered.Y = y;
        float vignette = 1.0f - smoothstep(0.6f, 1.7f, length(centered) * 0.8f);
        float shade = 0.45f + 0.55f * vignette;

        vec4 result;
        result.X = color.X * shade;
        result.Y = color.Y * shade;
        result.Z = color.Z * shade;
        result.W = 1.0f;
        return result;
    }
}

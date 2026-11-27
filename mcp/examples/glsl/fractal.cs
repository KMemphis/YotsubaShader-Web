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

public class Fractal
{
    [uniform, layout(0, 0)]
    public Globals Params;

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

    vec3 Palette(float t)
    {
        vec3 color;
        color.X = 0.5f + 0.5f * cos(6.28318f * (t + 0.00f));
        color.Y = 0.5f + 0.5f * cos(6.28318f * (t + 0.10f));
        color.Z = 0.5f + 0.5f * cos(6.28318f * (t + 0.20f));
        return color;
    }

    [ShaderStage(Stage.Fragment)]
    public vec4 Fragment([gl_FragCoord] vec4 fragCoord)
    {
        float aspect = Params.Resolution.X / Params.Resolution.Y;
        float u = fragCoord.X / Params.Resolution.X;
        float v = fragCoord.Y / Params.Resolution.Y;

        // Zoom in towards the seahorse valley and back out, forever.
        float breathe = 0.5f - 0.5f * cos(Params.Time * 0.22f);
        float scale = 2.6f * exp(-5.2f * breathe);
        float cx = -0.743644f + (u - 0.5f) * aspect * scale;
        float cy = 0.131826f + (v - 0.5f) * scale;

        float x = 0.0f;
        float y = 0.0f;
        float steps = 0.0f;
        float trap = 1000.0f;
        bool escaped = false;
        for (int i = 0; i < 180; i++)
        {
            float nx = x * x - y * y + cx;
            y = 2.0f * x * y + cy;
            x = nx;
            if (x * x + y * y > 256.0f)
            {
                escaped = true;
                break;
            }
            // Remember how close the orbit came to a small circle: it colours the inside of the set.
            trap = min(trap, abs(x * x + y * y - 0.18f));
            steps += 1.0f;
        }

        vec3 color = Palette(sqrt(trap) * 1.1f + 0.62f);
        float shade = 0.5f;
        if (escaped)
        {
            // Smooth iteration count: no visible bands between the steps.
            float smoothSteps = steps - log2(log2(x * x + y * y)) + 4.0f;
            color = Palette(smoothSteps * 0.035f + Params.Time * 0.03f + 0.55f);
            shade = 0.35f + 0.65f * smoothstep(0.0f, 14.0f, smoothSteps);
        }

        vec4 result;
        result.X = color.X * shade;
        result.Y = color.Y * shade;
        result.Z = color.Z * shade;
        result.W = 1.0f;
        return result;
    }
}

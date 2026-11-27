using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.GlslSyntax.Resources;
using static YotsubaShader.GlslSyntax.Methods.Math;

namespace Ocean;

// structs
public struct OceanParams
{
    public float Time;
    public vec2 Resolution;
    public vec2 CameraAngles;   // x = yaw, y = pitch (precomputed in C#)
    public vec3 CameraPosition;
}

public struct VSInput
{
    [location(0)] public vec2 Position;
    [location(1)] public vec2 TexCoord;
}

public struct VSOutput
{
    [gl_Position] public vec4 Position;
    [location(0)] public vec2 TexCoord;
}

public struct PSInput
{
    [location(0)] public vec2 TexCoord;
}

public partial class ProceduralOcean
{
    // fields
    const float DRAG_MULT = 0.38f;
    const int ITERATIONS_RAYMARCH = 12;
    const int ITERATIONS_NORMAL = 36;
    const float WATER_DEPTH = 1.0f;

    [uniform, layout(0, 0)]
    public OceanParams Globals;

    // stages
    // Full-screen quad: the position already comes in clip space.
    [ShaderStage(Stage.Vertex)]
    public VSOutput MainVS(VSInput input)
    {
        VSOutput output;
        output.Position = new vec4(input.Position.X, input.Position.Y, 0.0f, 1.0f);
        output.TexCoord = input.TexCoord;
        return output;
    }

    [ShaderStage(Stage.Fragment)]
    [return: location(0)]
    public vec4 MainPS(PSInput input)
    {
        vec3 ray = GetRay(input.TexCoord);

        if (ray.Y >= 0.0f)
        {
            // ray going up: sky
            vec3 sky = AcesTonemap(GetAtmosphere(ray) * 2.0f);
            return new vec4(sky.X, sky.Y, sky.Z, 1.0f);
        }

        // ray going down: it hits the water
        vec3 waterPlaneHigh = new vec3(0.0f, 0.0f, 0.0f);
        vec3 waterPlaneLow = new vec3(0.0f, -WATER_DEPTH, 0.0f);
        vec3 up = new vec3(0.0f, 1.0f, 0.0f);

        vec3 origin = Globals.CameraPosition;

        float highPlaneHit = IntersectPlane(origin, ray, waterPlaneHigh, up);
        float lowPlaneHit = IntersectPlane(origin, ray, waterPlaneLow, up);
        vec3 highHitPos = origin + ray * highPlaneHit;
        vec3 lowHitPos = origin + ray * lowPlaneHit;

        float dist = RaymarchWater(origin, highHitPos, lowHitPos, WATER_DEPTH);
        vec3 waterHitPos = origin + ray * dist;

        vec3 n = WaterNormal(new vec2(waterHitPos.X, waterHitPos.Z), 0.01f, WATER_DEPTH);

        // smooths the normal with the distance to avoid high-frequency noise
        n = mix(n, up, 0.8f * min(1.0f, sqrt(dist * 0.01f) * 1.1f));

        float fresnel = 0.04f + (1.0f - 0.04f) * pow(1.0f - max(0.0f, -dot(n, ray)), 5.0f);

        // reflects the ray and forces it to bounce upwards
        vec3 r = normalize(reflect(ray, n));
        r = new vec3(r.X, abs(r.Y), r.Z);

        vec3 reflection = GetAtmosphere(r);
        vec3 scattering = new vec3(0.016f, 0.043f, 0.122f)
            * (0.085f * (0.2f + (waterHitPos.Y + WATER_DEPTH) / WATER_DEPTH));

        vec3 color = reflection * fresnel + scattering;
        vec3 mapped = AcesTonemap(color * 2.0f);
        return new vec4(mapped.X, mapped.Y, mapped.Z, 1.0f);
    }
}

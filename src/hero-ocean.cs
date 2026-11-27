using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;
using YotsubaShader.HlslSyntax.Types;
using YotsubaShader.SpirvSyntax.Resources;
using static YotsubaShader.HlslSyntax.Methods.Math;
using static YotsubaShader.HlslSyntax.Methods.Constructors;

namespace Ocean;

// structs
public struct OceanParams
{
    public float Time;
    public float2 Resolution;
    public float2 CameraAngles;   // x = yaw, y = pitch (precomputed in C#)
    public float3 CameraPosition;
}

public struct VSInput
{
    [POSITION] public float2 Position;
    [TEXCOORD(0)] public float2 TexCoord;
}

public struct VSOutput
{
    [SV_Position] public float4 Position;
    [TEXCOORD(0)] public float2 TexCoord;
}

public partial class ProceduralOcean
{
    // fields
    const float DRAG_MULT = 0.38f;
    const int ITERATIONS_RAYMARCH = 12;
    const int ITERATIONS_NORMAL = 36;
    const float WATER_DEPTH = 1.0f;

    [Uniform] [DescriptorSet(0)] [Binding(0)]
    public OceanParams Globals;

    // stages
    // Full-screen quad: the position already comes in clip space.
    [ShaderStage(Stage.Vertex)]
    public VSOutput MainVS(VSInput input)
    {
        VSOutput output;
        output.Position = new float4(input.Position.X, input.Position.Y, 0.0f, 1.0f);
        output.TexCoord = input.TexCoord;
        return output;
    }

    [ShaderStage(Stage.Fragment)]
    [return: SV_Target]
    public float4 MainPS(VSOutput input)
    {
        float3 ray = GetRay(input.TexCoord);

        if (ray.Y >= 0.0f)
        {
            // ray going up: sky
            float3 sky = AcesTonemap(GetAtmosphere(ray) * 2.0f);
            return new float4(sky.X, sky.Y, sky.Z, 1.0f);
        }

        // ray going down: it hits the water
        float3 waterPlaneHigh = new float3(0.0f, 0.0f, 0.0f);
        float3 waterPlaneLow = new float3(0.0f, -WATER_DEPTH, 0.0f);
        float3 up = new float3(0.0f, 1.0f, 0.0f);

        float3 origin = Globals.CameraPosition;

        float highPlaneHit = IntersectPlane(origin, ray, waterPlaneHigh, up);
        float lowPlaneHit = IntersectPlane(origin, ray, waterPlaneLow, up);
        float3 highHitPos = origin + ray * highPlaneHit;
        float3 lowHitPos = origin + ray * lowPlaneHit;

        float dist = RaymarchWater(origin, highHitPos, lowHitPos, WATER_DEPTH);
        float3 waterHitPos = origin + ray * dist;

        float3 n = WaterNormal(new float2(waterHitPos.X, waterHitPos.Z), 0.01f, WATER_DEPTH);

        // smooths the normal with the distance to avoid high-frequency noise
        n = lerp(n, up, float3(0.8f * min(1.0f, sqrt(dist * 0.01f) * 1.1f)));

        float fresnel = 0.04f + (1.0f - 0.04f) * pow(1.0f - max(0.0f, -dot(n, ray)), 5.0f);

        // reflects the ray and forces it to bounce upwards
        float3 r = normalize(reflect(ray, n));
        r = new float3(r.X, abs(r.Y), r.Z);

        float3 reflection = GetAtmosphere(r);
        float3 scattering = new float3(0.016f, 0.043f, 0.122f)
            * (0.085f * (0.2f + (waterHitPos.Y + WATER_DEPTH) / WATER_DEPTH));

        float3 color = reflection * fresnel + scattering;
        float3 mapped = AcesTonemap(color * 2.0f);
        return new float4(mapped.X, mapped.Y, mapped.Z, 1.0f);
    }
}

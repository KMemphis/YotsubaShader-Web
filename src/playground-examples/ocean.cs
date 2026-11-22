using System;
using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;
using YotsubaShader.SpirvSyntax.Resources;
using YotsubaShader.Language.Native.Types.Vector;

namespace Ocean;

// ------------------------------------------------------------------ own vectors

[Vector]
public struct float2
{
    [VectorComponent(0)] public float X;
    [VectorComponent(1)] public float Y;

    public float2(float x, float y) { X = x; Y = y; }
}

[Vector]
public struct float3
{
    [VectorComponent(0)] public float X;
    [VectorComponent(1)] public float Y;
    [VectorComponent(2)] public float Z;

    public float3(float x, float y, float z) { X = x; Y = y; Z = z; }

    public static float3 operator +(float3 a, float3 b)
    {
        return new float3(a.X + b.X, a.Y + b.Y, a.Z + b.Z);
    }

    public static float3 operator -(float3 a, float3 b)
    {
        return new float3(a.X - b.X, a.Y - b.Y, a.Z - b.Z);
    }

    public static float3 operator *(float3 a, float s)
    {
        return new float3(a.X * s, a.Y * s, a.Z * s);
    }

    public static float3 operator *(float s, float3 a)
    {
        return new float3(a.X * s, a.Y * s, a.Z * s);
    }
}

[Vector]
public struct float4
{
    [VectorComponent(0)] public float X;
    [VectorComponent(1)] public float Y;
    [VectorComponent(2)] public float Z;
    [VectorComponent(3)] public float W;

    public float4(float x, float y, float z, float w) { X = x; Y = y; Z = z; W = w; }
}

// ------------------------------------------------------------------ interface between stages

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

public class ProceduralOcean
{
    const float DRAG_MULT = 0.38f;
    const int ITERATIONS_RAYMARCH = 12;
    const int ITERATIONS_NORMAL = 36;
    const float WATER_DEPTH = 1.0f;

    [Uniform] [DescriptorSet(0)] [Binding(0)]
    public OceanParams Globals;

    // ------------------------------------------------------------------ math helpers

    static float Saturate(float x)
    {
        return Math.Clamp(x, 0f, 1f);
    }

    static float Frac(float x)
    {
        return x - MathF.Floor(x);
    }

    static float Lerp(float a, float b, float t)
    {
        return a + (b - a) * t;
    }

    static float3 Lerp3(float3 a, float3 b, float t)
    {
        return new float3(Lerp(a.X, b.X, t), Lerp(a.Y, b.Y, t), Lerp(a.Z, b.Z, t));
    }

    static float SmoothStep(float edge0, float edge1, float x)
    {
        float t = Saturate((x - edge0) / (edge1 - edge0));
        return t * t * (3f - 2f * t);
    }

    static float Dot3(float3 a, float3 b)
    {
        return a.X * b.X + a.Y * b.Y + a.Z * b.Z;
    }

    static float Length3(float3 a)
    {
        return MathF.Sqrt(Dot3(a, a));
    }

    static float Distance3(float3 a, float3 b)
    {
        return Length3(a - b);
    }

    static float3 Normalize3(float3 a)
    {
        return a * (1f / Length3(a));
    }

    static float3 Cross3(float3 a, float3 b)
    {
        return new float3(
            a.Y * b.Z - a.Z * b.Y,
            a.Z * b.X - a.X * b.Z,
            a.X * b.Y - a.Y * b.X);
    }

    static float3 Reflect3(float3 incident, float3 n)
    {
        return incident - n * (2f * Dot3(n, incident));
    }

    // ------------------------------------------------------------------ waves

    float2 WaveDx(float2 position, float2 direction, float frequency, float timeshift)
    {
        float x = (direction.X * position.X + direction.Y * position.Y) * frequency + timeshift;
        float wave = MathF.Exp(MathF.Sin(x) - 1f);
        float dx = wave * MathF.Cos(x);
        return new float2(wave, -dx);
    }

    // Sums octaves of waves with different parameters.
    float GetWaves(float2 position, int iterations)
    {
        float px = position.X;
        float py = position.Y;

        float wavePhaseShift = MathF.Sqrt(px * px + py * py) * 0.1f; // keeps all the octaves from being in phase
        float iter = 0.0f;           // generates well distributed wave directions
        float frequency = 1.0f;
        float timeMultiplier = 2.0f;
        float weight = 1.0f;
        float sumOfValues = 0.0f;
        float sumOfWeights = 0.0f;

        for (int i = 0; i < iterations; i++)
        {
            // "random" wave direction
            float2 p = new float2(MathF.Sin(iter), MathF.Cos(iter));

            float2 res = WaveDx(
                new float2(px, py), p, frequency,
                Globals.Time * timeMultiplier + wavePhaseShift);

            // moves the position by the drag and the derivative of the wave
            px = px + p.X * res.Y * weight * DRAG_MULT;
            py = py + p.Y * res.Y * weight * DRAG_MULT;

            sumOfValues = sumOfValues + res.X * weight;
            sumOfWeights = sumOfWeights + weight;

            // changes the next octave
            weight = Lerp(weight, 0.0f, 0.2f);
            frequency = frequency * 1.18f;
            timeMultiplier = timeMultiplier * 1.07f;

            iter = iter + 1232.399963f;
        }

        return sumOfValues / sumOfWeights;
    }

    // Raymarch from the top layer of the water to the bottom one.
    float RaymarchWater(float3 camera, float3 start, float3 end, float depth)
    {
        float3 pos = start;
        float3 dir = Normalize3(end - start);

        for (int i = 0; i < 64; i++)
        {
            // the height goes from 0 to -depth
            float height = GetWaves(new float2(pos.X, pos.Z), ITERATIONS_RAYMARCH) * depth - depth;

            // if the wave height almost matches the ray height, it is a hit
            if (height + 0.01f > pos.Y)
            {
                return Distance3(pos, camera);
            }

            pos = pos + dir * (pos.Y - height);
        }

        // no hit: the top layer is assumed
        return Distance3(start, camera);
    }

    // Normal by finite differences: height at pos and at two very close points.
    float3 WaterNormal(float2 pos, float e, float depth)
    {
        float h = GetWaves(pos, ITERATIONS_NORMAL) * depth;
        float3 a = new float3(pos.X, h, pos.Y);
        float3 b = new float3(pos.X - e, GetWaves(new float2(pos.X - e, pos.Y), ITERATIONS_NORMAL) * depth, pos.Y);
        float3 c = new float3(pos.X, GetWaves(new float2(pos.X, pos.Y + e), ITERATIONS_NORMAL) * depth, pos.Y + e);
        return Normalize3(Cross3(a - b, a - c));
    }

    // ------------------------------------------------------------------ camera

    // Rotation of v around "axis" by "angle". It equals mul(createRotationMatrixAxisAngle(axis, angle), v):
    // each row of the HLSL matrix is multiplied (dot product) by v.
    static float3 RotateAxisAngle(float3 axis, float angle, float3 v)
    {
        float s = MathF.Sin(angle);
        float c = MathF.Cos(angle);
        float oc = 1.0f - c;

        float3 row0 = new float3(
            oc * axis.X * axis.X + c,
            oc * axis.X * axis.Y - axis.Z * s,
            oc * axis.Z * axis.X + axis.Y * s);
        float3 row1 = new float3(
            oc * axis.X * axis.Y + axis.Z * s,
            oc * axis.Y * axis.Y + c,
            oc * axis.Y * axis.Z - axis.X * s);
        float3 row2 = new float3(
            oc * axis.Z * axis.X - axis.Y * s,
            oc * axis.Y * axis.Z + axis.X * s,
            oc * axis.Z * axis.Z + c);

        return new float3(Dot3(row0, v), Dot3(row1, v), Dot3(row2, v));
    }

    // fragCoord is already normalised (0..1) from the full-screen quad.
    float3 GetRay(float2 fragCoord)
    {
        float uvX = fragCoord.X;
        float uvY = 1.0f - fragCoord.Y; // Y is flipped, as in the original

        float screenX = (uvX * 2.0f - 1.0f) * (Globals.Resolution.X / Globals.Resolution.Y);
        float screenY = (uvY * 2.0f - 1.0f);

        float3 proj = Normalize3(new float3(screenX, screenY, 1.5f));

        if (Globals.Resolution.X < 600.0f)
        {
            return proj;
        }

        float3 pitched = RotateAxisAngle(new float3(1.0f, 0.0f, 0.0f), Globals.CameraAngles.Y, proj);
        return RotateAxisAngle(new float3(0.0f, -1.0f, 0.0f), Globals.CameraAngles.X, pitched);
    }

    static float IntersectPlane(float3 origin, float3 direction, float3 pnt, float3 n)
    {
        return Math.Clamp(Dot3(pnt - origin, n) / Dot3(direction, n), -1.0f, 9991999.0f);
    }

    // ------------------------------------------------------------------ sky

    float3 GetCelestialDirection(float phaseOffset)
    {
        float cycle = Globals.Time * 0.09f + 0.2f + phaseOffset;
        return Normalize3(new float3(-0.55f, MathF.Sin(cycle) * 0.75f, MathF.Cos(cycle)));
    }

    float3 GetSunDirection()
    {
        return GetCelestialDirection(0.0f);
    }

    float3 GetMoonDirection()
    {
        return GetCelestialDirection(3.14159265f);
    }

    static float GetNightAmount(float sunHeight)
    {
        return Saturate((-sunHeight + 0.04f) * 2.6f);
    }

    static float3 ExtraCheapAtmosphere(float3 raydir, float3 sundir)
    {
        float up = Saturate(raydir.Y * 0.5f + 0.5f);
        float sunDot = MathF.Max(0.0f, Dot3(sundir, raydir));
        float solarAltitude = Saturate(sundir.Y * 0.5f + 0.5f);
        float dayAmount = SmoothStep(-0.1f, 0.16f, sundir.Y);
        float nightAmount = GetNightAmount(sundir.Y);
        float twilightAmount = (1.0f - nightAmount) * (1.0f - SmoothStep(0.03f, 0.2f, MathF.Abs(sundir.Y)));
        float horizon = MathF.Pow(Saturate(1.0f - MathF.Max(raydir.Y, 0.0f)), 2.2f);

        float3 daySky = Lerp3(new float3(0.24f, 0.35f, 0.55f), new float3(0.09f, 0.29f, 0.62f), up);
        float3 twilightSky = Lerp3(new float3(0.48f, 0.24f, 0.18f), new float3(0.06f, 0.1f, 0.24f), up);
        float3 nightSky = Lerp3(new float3(0.01f, 0.02f, 0.05f), new float3(0.0f, 0.005f, 0.02f), up);
        float3 sky = Lerp3(nightSky, daySky, dayAmount);
        sky = Lerp3(sky, twilightSky, twilightAmount * (1.0f - nightAmount));
        sky = sky * Lerp(0.95f, 1.18f, solarAltitude);
        sky = sky + new float3(0.02f, 0.035f, 0.05f) * solarAltitude * up;

        float sunsetGlow = MathF.Pow(sunDot, 10.0f);
        float3 glowColor = Lerp3(
            new float3(1.0f, 0.94f, 0.9f),
            new float3(1.0f, 0.68f, 0.4f),
            Saturate((0.22f - sundir.Y) * 3.0f));
        float3 mie = glowColor * sunsetGlow * (0.16f + horizon * 0.22f);
        float3 horizonFill = new float3(0.08f, 0.11f, 0.18f) * horizon * nightAmount;

        return sky + mie + horizonFill;
    }

    // Small hash to place stars in a stable way per cell.
    static float Hash21(float2 position)
    {
        float px = Frac(position.X * 123.34f);
        float py = Frac(position.Y * 456.21f);
        float d = px * (px + 45.32f) + py * (py + 45.32f); // dot(position, position + 45.32)
        px = px + d;
        py = py + d;
        return Frac(px * py);
    }

    static float3 GetStarTint(float seed)
    {
        return Lerp3(new float3(1.0f, 0.82f, 0.72f), new float3(0.67f, 0.81f, 1.0f), Saturate(seed * 1.2f));
    }

    float3 GetStars(float3 direction)
    {
        if (direction.Y <= 0.0f)
        {
            return new float3(0.0f, 0.0f, 0.0f);
        }

        float uvX = direction.X / (direction.Y + 0.24f);
        float uvY = direction.Z / (direction.Y + 0.24f);
        float time = Globals.Time;

        // Layer 1: background stars of medium density.
        float p1x = uvX * 180.0f;
        float p1y = uvY * 180.0f;
        float l1x = Frac(p1x) - 0.5f;
        float l1y = Frac(p1y) - 0.5f;
        float primarySeed = Hash21(new float2(MathF.Floor(p1x), MathF.Floor(p1y)));
        float primaryProfile = MathF.Pow(
            Saturate(1.0f - MathF.Sqrt(l1x * l1x + l1y * l1y) * 2.05f),
            11.0f + primarySeed * 7.0f);
        float primaryStar = SmoothStep(0.9958f, 1.0f, primarySeed) * primaryProfile;

        // Layer 2: smaller and denser stars.
        float p2x = uvX * 320.0f + 37.0f;
        float p2y = uvY * 320.0f + 37.0f;
        float l2x = Frac(p2x) - 0.5f;
        float l2y = Frac(p2y) - 0.5f;
        float secondarySeed = Hash21(new float2(MathF.Floor(p2x), MathF.Floor(p2y)));
        float secondaryProfile = MathF.Pow(
            Saturate(1.0f - MathF.Sqrt(l2x * l2x + l2y * l2y) * 2.45f),
            14.0f + secondarySeed * 10.0f);
        float secondaryStar = SmoothStep(0.9978f, 1.0f, secondarySeed) * secondaryProfile;

        // Layer 3: large and rare stars.
        float p3x = uvX * 92.0f - 19.0f;
        float p3y = uvY * 92.0f - 19.0f;
        float l3x = Frac(p3x) - 0.5f;
        float l3y = Frac(p3y) - 0.5f;
        float tertiarySeed = Hash21(new float2(MathF.Floor(p3x), MathF.Floor(p3y)));
        float tertiaryProfile = MathF.Pow(
            Saturate(1.0f - MathF.Sqrt(l3x * l3x + l3y * l3y) * 1.7f),
            7.0f + tertiarySeed * 5.0f);
        float tertiaryStar = SmoothStep(0.9915f, 1.0f, tertiarySeed) * tertiaryProfile;

        // Twinkle at different rhythms so they do not pulse together.
        float primaryTwinkle = 0.68f + 0.32f * MathF.Sin(time * (1.1f + primarySeed * 2.0f) + primarySeed * 19.0f);
        float secondaryTwinkle = 0.75f + 0.25f * MathF.Sin(time * (1.7f + secondarySeed * 1.7f) + secondarySeed * 23.0f + 1.2f);
        float tertiaryTwinkle = 0.82f + 0.18f * MathF.Sin(time * (0.8f + tertiarySeed * 1.3f) + tertiarySeed * 13.0f + 2.0f);

        float3 stars = new float3(0.0f, 0.0f, 0.0f);
        stars = stars + GetStarTint(primarySeed) * (primaryStar * (0.45f + primarySeed * 0.7f) * primaryTwinkle);
        stars = stars + GetStarTint(secondarySeed * 0.85f + 0.1f) * (secondaryStar * (0.25f + secondarySeed * 0.5f) * secondaryTwinkle);
        stars = stars + GetStarTint(tertiarySeed * 0.6f + 0.2f) * (tertiaryStar * (0.9f + tertiarySeed * 1.4f) * tertiaryTwinkle);
        return stars;
    }

    static float3 GetSun(float3 dir, float3 sundir)
    {
        float d = MathF.Max(0.0f, Dot3(dir, sundir));
        float sunAmount = MathF.Pow(d, 960.0f) * 135.0f;
        float halo = MathF.Pow(d, 64.0f) * 0.32f;
        float sunsetAmount = Saturate((0.22f - sundir.Y) * 3.0f);
        float3 sunColor = Lerp3(new float3(1.0f, 0.97f, 0.92f), new float3(1.0f, 0.7f, 0.45f), sunsetAmount);
        return sunColor * (sunAmount + halo);
    }

    static float3 GetMoon(float3 direction, float3 moonDirection, float nightAmount)
    {
        float moonDot = MathF.Max(0.0f, Dot3(direction, moonDirection));

        float3 moonUp = new float3(0.0f, 1.0f, 0.0f);
        if (MathF.Abs(moonDirection.Y) > 0.98f)
        {
            moonUp = new float3(1.0f, 0.0f, 0.0f);
        }

        float3 moonTangent = Normalize3(Cross3(moonUp, moonDirection));
        float3 moonBitangent = Cross3(moonDirection, moonTangent);
        float moonRadius = 0.031f;
        float moonUvX = Dot3(direction, moonTangent) / moonRadius;
        float moonUvY = Dot3(direction, moonBitangent) / moonRadius;
        float moonDistance = MathF.Sqrt(moonUvX * moonUvX + moonUvY * moonUvY);
        float moonDisc = (1.0f - SmoothStep(0.9f, 1.0f, moonDistance)) * SmoothStep(0.9975f, 0.9994f, moonDot);
        float moonHalo = (SmoothStep(0.992f, 0.9985f, moonDot) - moonDisc) * 0.018f;

        float maria = 0.9f + 0.08f * MathF.Sin(moonUvX * 7.0f + 0.8f) * MathF.Sin(moonUvY * 8.0f - 1.3f);
        float craterBand = 0.96f - 0.05f * MathF.Sin((moonUvX + moonUvY) * 11.0f);
        float surface = maria * craterBand;
        float rimShade = Lerp(0.82f, 1.0f, Saturate(1.0f - moonDistance * 0.85f));
        float3 moonColor = new float3(0.56f, 0.6f, 0.68f);

        return (moonColor * (moonDisc * surface * rimShade * 1.35f) + moonColor * moonHalo) * nightAmount;
    }

    float3 GetAtmosphere(float3 dir)
    {
        float3 sundir = GetSunDirection();
        float3 moondir = GetMoonDirection();
        float nightAmount = GetNightAmount(sundir.Y);
        float3 stars = GetStars(dir) * (nightAmount * nightAmount);
        float3 atmosphere = ExtraCheapAtmosphere(dir, sundir);
        float3 sun = GetSun(dir, sundir);
        float3 moon = GetMoon(dir, moondir, nightAmount);
        return atmosphere * 0.5f + sun + moon + stars;
    }

    // ACES tonemapping. mul(m1, color) / mul(m2, x) = dot product of each row with the vector.
    static float AcesCurve(float v)
    {
        float a = v * (v + 0.0245786f) - 0.000090537f;
        float b = v * (0.983729f * v + 0.4329510f) + 0.238081f;
        return a / b;
    }

    static float3 AcesTonemap(float3 color)
    {
        float3 v = new float3(
            0.59719f * color.X + 0.07600f * color.Y + 0.02840f * color.Z,
            0.35458f * color.X + 0.90834f * color.Y + 0.13383f * color.Z,
            0.04823f * color.X + 0.01566f * color.Y + 0.83777f * color.Z);

        float3 c = new float3(AcesCurve(v.X), AcesCurve(v.Y), AcesCurve(v.Z));

        float r = 1.60475f * c.X - 0.10208f * c.Y - 0.00327f * c.Z;
        float g = -0.53108f * c.X + 1.10813f * c.Y - 0.07276f * c.Z;
        float b = -0.07367f * c.X - 0.00605f * c.Y + 1.07602f * c.Z;

        float invGamma = 1.0f / 2.2f;
        return new float3(
            MathF.Pow(Math.Clamp(r, 0.0f, 1.0f), invGamma),
            MathF.Pow(Math.Clamp(g, 0.0f, 1.0f), invGamma),
            MathF.Pow(Math.Clamp(b, 0.0f, 1.0f), invGamma));
    }

    // ------------------------------------------------------------------ stages

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
        n = Lerp3(n, up, 0.8f * MathF.Min(1.0f, MathF.Sqrt(dist * 0.01f) * 1.1f));

        float fresnel = 0.04f + (1.0f - 0.04f) * MathF.Pow(1.0f - MathF.Max(0.0f, -Dot3(n, ray)), 5.0f);

        // reflects the ray and forces it to bounce upwards
        float3 r = Normalize3(Reflect3(ray, n));
        r = new float3(r.X, MathF.Abs(r.Y), r.Z);

        float3 reflection = GetAtmosphere(r);
        float3 scattering = new float3(0.016f, 0.043f, 0.122f)
            * (0.085f * (0.2f + (waterHitPos.Y + WATER_DEPTH) / WATER_DEPTH));

        float3 color = reflection * fresnel + scattering;
        float3 mapped = AcesTonemap(color * 2.0f);
        return new float4(mapped.X, mapped.Y, mapped.Z, 1.0f);
    }
}

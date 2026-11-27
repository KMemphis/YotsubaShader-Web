using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.GlslSyntax.Resources;
using static YotsubaShader.GlslSyntax.Methods.Math;

namespace Ocean;

public partial class ProceduralOcean
{
    // helpers
    static float Saturate(float x)
    {
        return clamp(x, 0f, 1f);
    }

    vec2 WaveDx(vec2 position, vec2 direction, float frequency, float timeshift)
    {
        float x = (direction.X * position.X + direction.Y * position.Y) * frequency + timeshift;
        float wave = exp(sin(x) - 1f);
        float dx = wave * cos(x);
        return new vec2(wave, -dx);
    }

    // Sums octaves of waves with different parameters.
    float GetWaves(vec2 position, int iterations)
    {
        float px = position.X;
        float py = position.Y;

        float wavePhaseShift = sqrt(px * px + py * py) * 0.1f; // keeps all the octaves from being in phase
        float iter = 0.0f;           // generates well distributed wave directions
        float frequency = 1.0f;
        float timeMultiplier = 2.0f;
        float weight = 1.0f;
        float sumOfValues = 0.0f;
        float sumOfWeights = 0.0f;

        for (int i = 0; i < iterations; i++)
        {
            // "random" wave direction
            vec2 p = new vec2(sin(iter), cos(iter));

            vec2 res = WaveDx(
                new vec2(px, py), p, frequency,
                Globals.Time * timeMultiplier + wavePhaseShift);

            // moves the position by the drag and the derivative of the wave
            px = px + p.X * res.Y * weight * DRAG_MULT;
            py = py + p.Y * res.Y * weight * DRAG_MULT;

            sumOfValues = sumOfValues + res.X * weight;
            sumOfWeights = sumOfWeights + weight;

            // changes the next octave
            weight = mix(weight, 0.0f, 0.2f);
            frequency = frequency * 1.18f;
            timeMultiplier = timeMultiplier * 1.07f;

            iter = iter + 1232.399963f;
        }

        return sumOfValues / sumOfWeights;
    }

    // Raymarch from the top layer of the water to the bottom one.
    float RaymarchWater(vec3 camera, vec3 start, vec3 end, float depth)
    {
        vec3 pos = start;
        vec3 dir = normalize(end - start);

        for (int i = 0; i < 64; i++)
        {
            // the height goes from 0 to -depth
            float height = GetWaves(new vec2(pos.X, pos.Z), ITERATIONS_RAYMARCH) * depth - depth;

            // if the wave height almost matches the ray height, it is a hit
            if (height + 0.01f > pos.Y)
            {
                return distance(pos, camera);
            }

            pos = pos + dir * (pos.Y - height);
        }

        // no hit: the top layer is assumed
        return distance(start, camera);
    }

    // Normal by finite differences: height at pos and at two very close points.
    vec3 WaterNormal(vec2 pos, float e, float depth)
    {
        float h = GetWaves(pos, ITERATIONS_NORMAL) * depth;
        vec3 a = new vec3(pos.X, h, pos.Y);
        vec3 b = new vec3(pos.X - e, GetWaves(new vec2(pos.X - e, pos.Y), ITERATIONS_NORMAL) * depth, pos.Y);
        vec3 c = new vec3(pos.X, GetWaves(new vec2(pos.X, pos.Y + e), ITERATIONS_NORMAL) * depth, pos.Y + e);
        return normalize(cross(a - b, a - c));
    }

    // Rotation of v around "axis" by "angle". It equals mul(createRotationMatrixAxisAngle(axis, angle), v):
    // each row of the HLSL matrix is multiplied (dot product) by v.
    static vec3 RotateAxisAngle(vec3 axis, float angle, vec3 v)
    {
        float s = sin(angle);
        float c = cos(angle);
        float oc = 1.0f - c;

        vec3 row0 = new vec3(
            oc * axis.X * axis.X + c,
            oc * axis.X * axis.Y - axis.Z * s,
            oc * axis.Z * axis.X + axis.Y * s);
        vec3 row1 = new vec3(
            oc * axis.X * axis.Y + axis.Z * s,
            oc * axis.Y * axis.Y + c,
            oc * axis.Y * axis.Z - axis.X * s);
        vec3 row2 = new vec3(
            oc * axis.Z * axis.X - axis.Y * s,
            oc * axis.Y * axis.Z + axis.X * s,
            oc * axis.Z * axis.Z + c);

        return new vec3(dot(row0, v), dot(row1, v), dot(row2, v));
    }

    // fragCoord is already normalised (0..1) from the full-screen quad.
    vec3 GetRay(vec2 fragCoord)
    {
        float uvX = fragCoord.X;
        float uvY = 1.0f - fragCoord.Y; // Y is flipped, as in the original

        float screenX = (uvX * 2.0f - 1.0f) * (Globals.Resolution.X / Globals.Resolution.Y);
        float screenY = (uvY * 2.0f - 1.0f);

        vec3 proj = normalize(new vec3(screenX, screenY, 1.5f));

        if (Globals.Resolution.X < 600.0f)
        {
            return proj;
        }

        vec3 pitched = RotateAxisAngle(new vec3(1.0f, 0.0f, 0.0f), Globals.CameraAngles.Y, proj);
        return RotateAxisAngle(new vec3(0.0f, -1.0f, 0.0f), Globals.CameraAngles.X, pitched);
    }

    static float IntersectPlane(vec3 origin, vec3 direction, vec3 pnt, vec3 n)
    {
        return clamp(dot(pnt - origin, n) / dot(direction, n), -1.0f, 9991999.0f);
    }

    vec3 GetCelestialDirection(float phaseOffset)
    {
        // day and night alternate every 5 seconds
        float cycle = Globals.Time * 0.6283f + 0.2f + phaseOffset;
        return normalize(new vec3(-0.55f, sin(cycle) * 0.75f, cos(cycle)));
    }

    vec3 GetSunDirection()
    {
        return GetCelestialDirection(0.0f);
    }

    vec3 GetMoonDirection()
    {
        return GetCelestialDirection(3.14159265f);
    }

    static float GetNightAmount(float sunHeight)
    {
        return Saturate((-sunHeight + 0.04f) * 2.6f);
    }

    static vec3 ExtraCheapAtmosphere(vec3 raydir, vec3 sundir)
    {
        float up = Saturate(raydir.Y * 0.5f + 0.5f);
        float sunDot = max(0.0f, dot(sundir, raydir));
        float solarAltitude = Saturate(sundir.Y * 0.5f + 0.5f);
        float dayAmount = smoothstep(-0.1f, 0.16f, sundir.Y);
        float nightAmount = GetNightAmount(sundir.Y);
        float twilightAmount = (1.0f - nightAmount) * (1.0f - smoothstep(0.03f, 0.2f, abs(sundir.Y)));
        float horizon = pow(Saturate(1.0f - max(raydir.Y, 0.0f)), 2.2f);

        vec3 daySky = mix(new vec3(0.24f, 0.35f, 0.55f), new vec3(0.09f, 0.29f, 0.62f), up);
        vec3 twilightSky = mix(new vec3(0.48f, 0.24f, 0.18f), new vec3(0.06f, 0.1f, 0.24f), up);
        vec3 nightSky = mix(new vec3(0.01f, 0.02f, 0.05f), new vec3(0.0f, 0.005f, 0.02f), up);
        vec3 sky = mix(nightSky, daySky, dayAmount);
        sky = mix(sky, twilightSky, twilightAmount * (1.0f - nightAmount));
        sky = sky * mix(0.95f, 1.18f, solarAltitude);
        sky = sky + new vec3(0.02f, 0.035f, 0.05f) * solarAltitude * up;

        float sunsetGlow = pow(sunDot, 10.0f);
        vec3 glowColor = mix(
            new vec3(1.0f, 0.94f, 0.9f),
            new vec3(1.0f, 0.68f, 0.4f),
            Saturate((0.22f - sundir.Y) * 3.0f));
        vec3 mie = glowColor * sunsetGlow * (0.16f + horizon * 0.22f);
        vec3 horizonFill = new vec3(0.08f, 0.11f, 0.18f) * horizon * nightAmount;

        return sky + mie + horizonFill;
    }

    // Small hash to place stars in a stable way per cell.
    static float Hash21(vec2 position)
    {
        float px = fract(position.X * 123.34f);
        float py = fract(position.Y * 456.21f);
        float d = px * (px + 45.32f) + py * (py + 45.32f); // dot(position, position + 45.32)
        px = px + d;
        py = py + d;
        return fract(px * py);
    }

    static vec3 GetStarTint(float seed)
    {
        return mix(new vec3(1.0f, 0.82f, 0.72f), new vec3(0.67f, 0.81f, 1.0f), Saturate(seed * 1.2f));
    }

    vec3 GetStars(vec3 direction)
    {
        if (direction.Y <= 0.0f)
        {
            return new vec3(0.0f, 0.0f, 0.0f);
        }

        float uvX = direction.X / (direction.Y + 0.24f);
        float uvY = direction.Z / (direction.Y + 0.24f);
        float time = Globals.Time;

        // Layer 1: background stars of medium density.
        float p1x = uvX * 180.0f;
        float p1y = uvY * 180.0f;
        float l1x = fract(p1x) - 0.5f;
        float l1y = fract(p1y) - 0.5f;
        float primarySeed = Hash21(new vec2(floor(p1x), floor(p1y)));
        float primaryProfile = pow(
            Saturate(1.0f - sqrt(l1x * l1x + l1y * l1y) * 2.05f),
            11.0f + primarySeed * 7.0f);
        float primaryStar = smoothstep(0.9958f, 1.0f, primarySeed) * primaryProfile;

        // Layer 2: smaller and denser stars.
        float p2x = uvX * 320.0f + 37.0f;
        float p2y = uvY * 320.0f + 37.0f;
        float l2x = fract(p2x) - 0.5f;
        float l2y = fract(p2y) - 0.5f;
        float secondarySeed = Hash21(new vec2(floor(p2x), floor(p2y)));
        float secondaryProfile = pow(
            Saturate(1.0f - sqrt(l2x * l2x + l2y * l2y) * 2.45f),
            14.0f + secondarySeed * 10.0f);
        float secondaryStar = smoothstep(0.9978f, 1.0f, secondarySeed) * secondaryProfile;

        // Layer 3: large and rare stars.
        float p3x = uvX * 92.0f - 19.0f;
        float p3y = uvY * 92.0f - 19.0f;
        float l3x = fract(p3x) - 0.5f;
        float l3y = fract(p3y) - 0.5f;
        float tertiarySeed = Hash21(new vec2(floor(p3x), floor(p3y)));
        float tertiaryProfile = pow(
            Saturate(1.0f - sqrt(l3x * l3x + l3y * l3y) * 1.7f),
            7.0f + tertiarySeed * 5.0f);
        float tertiaryStar = smoothstep(0.9915f, 1.0f, tertiarySeed) * tertiaryProfile;

        // Twinkle at different rhythms so they do not pulse together.
        float primaryTwinkle = 0.68f + 0.32f * sin(time * (1.1f + primarySeed * 2.0f) + primarySeed * 19.0f);
        float secondaryTwinkle = 0.75f + 0.25f * sin(time * (1.7f + secondarySeed * 1.7f) + secondarySeed * 23.0f + 1.2f);
        float tertiaryTwinkle = 0.82f + 0.18f * sin(time * (0.8f + tertiarySeed * 1.3f) + tertiarySeed * 13.0f + 2.0f);

        vec3 stars = new vec3(0.0f, 0.0f, 0.0f);
        stars = stars + GetStarTint(primarySeed) * (primaryStar * (0.45f + primarySeed * 0.7f) * primaryTwinkle);
        stars = stars + GetStarTint(secondarySeed * 0.85f + 0.1f) * (secondaryStar * (0.25f + secondarySeed * 0.5f) * secondaryTwinkle);
        stars = stars + GetStarTint(tertiarySeed * 0.6f + 0.2f) * (tertiaryStar * (0.9f + tertiarySeed * 1.4f) * tertiaryTwinkle);
        return stars;
    }

    static vec3 GetSun(vec3 dir, vec3 sundir)
    {
        float d = max(0.0f, dot(dir, sundir));
        float sunAmount = pow(d, 960.0f) * 135.0f;
        float halo = pow(d, 64.0f) * 0.32f;
        float sunsetAmount = Saturate((0.22f - sundir.Y) * 3.0f);
        vec3 sunColor = mix(new vec3(1.0f, 0.97f, 0.92f), new vec3(1.0f, 0.7f, 0.45f), sunsetAmount);
        return sunColor * (sunAmount + halo);
    }

    static vec3 GetMoon(vec3 direction, vec3 moonDirection, float nightAmount)
    {
        float moonDot = max(0.0f, dot(direction, moonDirection));

        vec3 moonUp = new vec3(0.0f, 1.0f, 0.0f);
        if (abs(moonDirection.Y) > 0.98f)
        {
            moonUp = new vec3(1.0f, 0.0f, 0.0f);
        }

        vec3 moonTangent = normalize(cross(moonUp, moonDirection));
        vec3 moonBitangent = cross(moonDirection, moonTangent);
        float moonRadius = 0.031f;
        float moonUvX = dot(direction, moonTangent) / moonRadius;
        float moonUvY = dot(direction, moonBitangent) / moonRadius;
        float moonDistance = sqrt(moonUvX * moonUvX + moonUvY * moonUvY);
        float moonDisc = (1.0f - smoothstep(0.9f, 1.0f, moonDistance)) * smoothstep(0.9975f, 0.9994f, moonDot);
        float moonHalo = (smoothstep(0.992f, 0.9985f, moonDot) - moonDisc) * 0.018f;

        float maria = 0.9f + 0.08f * sin(moonUvX * 7.0f + 0.8f) * sin(moonUvY * 8.0f - 1.3f);
        float craterBand = 0.96f - 0.05f * sin((moonUvX + moonUvY) * 11.0f);
        float surface = maria * craterBand;
        float rimShade = mix(0.82f, 1.0f, Saturate(1.0f - moonDistance * 0.85f));
        vec3 moonColor = new vec3(0.56f, 0.6f, 0.68f);

        return (moonColor * (moonDisc * surface * rimShade * 1.35f) + moonColor * moonHalo) * nightAmount;
    }

    vec3 GetAtmosphere(vec3 dir)
    {
        vec3 sundir = GetSunDirection();
        vec3 moondir = GetMoonDirection();
        float nightAmount = GetNightAmount(sundir.Y);
        vec3 stars = GetStars(dir) * (nightAmount * nightAmount);
        vec3 atmosphere = ExtraCheapAtmosphere(dir, sundir);
        vec3 sun = GetSun(dir, sundir);
        vec3 moon = GetMoon(dir, moondir, nightAmount);
        return atmosphere * 0.5f + sun + moon + stars;
    }

    // ACES tonemapping. mul(m1, color) / mul(m2, x) = dot product of each row with the vector.
    static float AcesCurve(float v)
    {
        float a = v * (v + 0.0245786f) - 0.000090537f;
        float b = v * (0.983729f * v + 0.4329510f) + 0.238081f;
        return a / b;
    }

    static vec3 AcesTonemap(vec3 color)
    {
        vec3 v = new vec3(
            0.59719f * color.X + 0.07600f * color.Y + 0.02840f * color.Z,
            0.35458f * color.X + 0.90834f * color.Y + 0.13383f * color.Z,
            0.04823f * color.X + 0.01566f * color.Y + 0.83777f * color.Z);

        vec3 c = new vec3(AcesCurve(v.X), AcesCurve(v.Y), AcesCurve(v.Z));

        float r = 1.60475f * c.X - 0.10208f * c.Y - 0.00327f * c.Z;
        float g = -0.53108f * c.X + 1.10813f * c.Y - 0.07276f * c.Z;
        float b = -0.07367f * c.X - 0.00605f * c.Y + 1.07602f * c.Z;

        float invGamma = 1.0f / 2.2f;
        return new vec3(
            pow(clamp(r, 0.0f, 1.0f), invGamma),
            pow(clamp(g, 0.0f, 1.0f), invGamma),
            pow(clamp(b, 0.0f, 1.0f), invGamma));
    }
}

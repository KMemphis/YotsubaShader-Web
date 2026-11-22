using System;
using YotsubaShader.Language;
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Resources;
using YotsubaShader.Language.Native.Types.Vector;

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

    public static float3 operator +(float3 a, float3 b) { return new float3(a.X + b.X, a.Y + b.Y, a.Z + b.Z); }
    public static float3 operator -(float3 a, float3 b) { return new float3(a.X - b.X, a.Y - b.Y, a.Z - b.Z); }
    public static float3 operator *(float3 a, float3 b) { return new float3(a.X * b.X, a.Y * b.Y, a.Z * b.Z); }
    public static float3 operator *(float3 a, float s) { return new float3(a.X * s, a.Y * s, a.Z * s); }
    public static float3 operator *(float s, float3 a) { return new float3(a.X * s, a.Y * s, a.Z * s); }
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

// ------------------------------------------------------------------ interface

public struct Globals
{
    public float Time;
    public float2 Resolution;
    public float4 Mouse;
}

public struct VertexOutput
{
    [gl_Position]
    public float4 Position;
}

public class Mandelbulb
{
    [uniform, layout(0, 0)]
    public Globals Params;

    // One triangle that covers the whole screen, built from the vertex index.
    [ShaderStage(Stage.Vertex)]
    public VertexOutput Vertex([gl_VertexIndex] uint id)
    {
        float x = (id << 1) & 2;
        float y = id & 2;

        VertexOutput output;
        output.Position = new float4(x * 2.0f - 1.0f, y * 2.0f - 1.0f, 0.0f, 1.0f);
        return output;
    }

    // ------------------------------------------------------------------ helpers

    static float Saturate(float x) => Math.Clamp(x, 0.0f, 1.0f);
    static float Frac(float x) => x - MathF.Floor(x);
    static float Dot(float3 a, float3 b) => a.X * b.X + a.Y * b.Y + a.Z * b.Z;
    static float Length(float3 a) => MathF.Sqrt(Dot(a, a));
    static float3 Normalize(float3 a) => a * (1.0f / Length(a));
    static float3 Mix(float3 a, float3 b, float t) => a + (b - a) * t;

    static float3 Cross(float3 a, float3 b)
    {
        return new float3(a.Y * b.Z - a.Z * b.Y, a.Z * b.X - a.X * b.Z, a.X * b.Y - a.Y * b.X);
    }

    static float Smoothstep(float a, float b, float x)
    {
        float t = Saturate((x - a) / (b - a));
        return t * t * (3.0f - 2.0f * t);
    }

    // Every colour of the rainbow, one full turn for each unit of t.
    static float3 Rainbow(float t)
    {
        return new float3(
            0.5f + 0.5f * MathF.Cos(6.28318f * t),
            0.5f + 0.5f * MathF.Cos(6.28318f * (t + 0.33f)),
            0.5f + 0.5f * MathF.Cos(6.28318f * (t + 0.67f)));
    }

    // ------------------------------------------------------------------ the bulb

    // The exponent breathes between 4 and 10, so the shape keeps melting into a new one.
    float Power()
    {
        return 7.0f + 3.0f * MathF.Sin(Params.Time * 0.23f);
    }

    // The whole bulb turns on two axes at once.
    float3 Spin(float3 p)
    {
        float a = Params.Time * 0.17f;
        float b = Params.Time * 0.11f;
        float3 q = new float3(p.X * MathF.Cos(a) - p.Z * MathF.Sin(a), p.Y, p.X * MathF.Sin(a) + p.Z * MathF.Cos(a));
        return new float3(q.X, q.Y * MathF.Cos(b) - q.Z * MathF.Sin(b), q.Y * MathF.Sin(b) + q.Z * MathF.Cos(b));
    }

    // Distance from a point to the surface: z = z^power + c in spherical coordinates, repeated.
    float Bulb(float3 position)
    {
        float3 c = Spin(position);
        float power = Power();
        float3 z = c;
        float dr = 1.0f;
        float r = 0.0f;
        for (int i = 0; i < 8; i++)
        {
            r = Length(z);
            if (r > 2.0f) break;
            float theta = MathF.Acos(Math.Clamp(z.Y / r, -1.0f, 1.0f)) * power;
            float phi = MathF.Atan2(z.Z, z.X) * power;
            float zr = MathF.Pow(r, power);
            dr = zr / r * power * dr + 1.0f;
            z = new float3(MathF.Sin(theta) * MathF.Cos(phi), MathF.Cos(theta), MathF.Sin(theta) * MathF.Sin(phi)) * zr + c;
        }
        return 0.5f * MathF.Log(r) * r / dr;
    }

    // Where the orbit of a surface point went: closest to the centre, closest to the plane y = 0, and how long it lasted.
    float3 Trap(float3 position)
    {
        float3 c = Spin(position);
        float power = Power();
        float3 z = c;
        float centre = 100.0f;
        float plane = 100.0f;
        float steps = 0.0f;
        for (int i = 0; i < 8; i++)
        {
            float r = Length(z);
            if (r > 2.0f) break;
            centre = MathF.Min(centre, r);
            plane = MathF.Min(plane, MathF.Abs(z.Y));
            steps += 1.0f;
            float theta = MathF.Acos(Math.Clamp(z.Y / r, -1.0f, 1.0f)) * power;
            float phi = MathF.Atan2(z.Z, z.X) * power;
            float zr = MathF.Pow(r, power);
            z = new float3(MathF.Sin(theta) * MathF.Cos(phi), MathF.Cos(theta), MathF.Sin(theta) * MathF.Sin(phi)) * zr + c;
        }
        return new float3(centre, plane, steps / 8.0f);
    }

    float3 Normal(float3 p)
    {
        float e = 0.0008f;
        float3 a = new float3(1.0f, -1.0f, -1.0f);
        float3 b = new float3(-1.0f, -1.0f, 1.0f);
        float3 c = new float3(-1.0f, 1.0f, -1.0f);
        float3 d = new float3(1.0f, 1.0f, 1.0f);
        return Normalize(a * Bulb(p + a * e) + b * Bulb(p + b * e) + c * Bulb(p + c * e) + d * Bulb(p + d * e));
    }

    // Cracks and folds receive less light than the open surface.
    float Occlusion(float3 p, float3 n)
    {
        float hidden = 0.0f;
        float weight = 1.0f;
        for (int i = 0; i < 5; i++)
        {
            float h = 0.01f + 0.03f * i;
            hidden += (h - Bulb(p + n * h)) * weight;
            weight *= 0.7f;
        }
        return Saturate(1.0f - 3.0f * hidden);
    }

    // ------------------------------------------------------------------ space

    float3 Space(float3 direction)
    {
        float t = Params.Time;
        float3 color = Mix(new float3(0.03f, 0.0f, 0.06f), new float3(0.0f, 0.02f, 0.08f), direction.Y * 0.5f + 0.5f);

        // A slow nebula that changes colour with time.
        float swirl = MathF.Sin(direction.X * 3.0f + t * 0.3f) * MathF.Sin(direction.Y * 4.0f - t * 0.2f) * MathF.Sin(direction.Z * 5.0f + t * 0.25f);
        color = color + Rainbow(swirl * 0.4f + t * 0.03f) * (0.12f * swirl * swirl);

        // Stars: one random number per small cell of the sky.
        float seed = Frac(MathF.Sin(MathF.Floor(direction.X * 180.0f) * 12.9898f + MathF.Floor(direction.Y * 180.0f) * 78.233f + MathF.Floor(direction.Z * 180.0f) * 37.719f) * 43758.5453f);
        float star = Smoothstep(0.996f, 1.0f, seed) * (0.6f + 0.4f * MathF.Sin(t * 3.0f + seed * 90.0f));
        return color + new float3(1.0f, 0.92f, 0.96f) * (star * 1.6f);
    }

    // ------------------------------------------------------------------ the picture

    [ShaderStage(Stage.Fragment)]
    public float4 Fragment([gl_FragCoord] float4 fragCoord)
    {
        float t = Params.Time;
        float x = (fragCoord.X * 2.0f - Params.Resolution.X) / Params.Resolution.Y;
        float y = (fragCoord.Y * 2.0f - Params.Resolution.Y) / Params.Resolution.Y;

        // The camera circles the bulb. Press and drag inside the preview to turn it yourself.
        float yaw = t * 0.15f;
        float pitch = 0.3f + 0.25f * MathF.Sin(t * 0.1f);
        if (Params.Mouse.Z > 0.5f)
        {
            yaw = (Params.Mouse.X / Params.Resolution.X - 0.5f) * 6.2832f;
            pitch = Math.Clamp((Params.Mouse.Y / Params.Resolution.Y - 0.5f) * 3.0f, -1.3f, 1.3f);
        }
        float away = 2.5f + 0.35f * MathF.Sin(t * 0.13f);
        float3 origin = new float3(MathF.Sin(yaw) * MathF.Cos(pitch), MathF.Sin(pitch), MathF.Cos(yaw) * MathF.Cos(pitch)) * away;
        float3 forward = Normalize(origin * -1.0f);
        float3 right = Normalize(Cross(forward, new float3(0.0f, 1.0f, 0.0f)));
        float3 up = Cross(right, forward);
        float3 direction = Normalize(forward * 1.8f + right * x + up * y);

        // Only rays that enter the sphere around the bulb need to march.
        float travelled = 0.0f;
        float glow = 0.0f;
        bool hit = false;
        float b = Dot(origin, direction);
        float inside = b * b - Dot(origin, origin) + 2.25f;
        if (inside > 0.0f)
        {
            travelled = MathF.Max(0.0f, -b - MathF.Sqrt(inside));
            float exit = -b + MathF.Sqrt(inside);
            for (int i = 0; i < 110; i++)
            {
                float d = Bulb(origin + direction * travelled);
                // Every near miss adds a little light: that is the halo around the edges.
                glow += 1.0f / (1.0f + d * d * 2500.0f);
                if (d < 0.0004f * travelled)
                {
                    hit = true;
                    break;
                }
                travelled += d * 0.9f;
                if (travelled > exit) break;
            }
        }

        float3 color = Space(direction);
        if (hit)
        {
            float3 p = origin + direction * travelled;
            float3 n = Normal(p);
            float3 trap = Trap(p);
            float3 albedo = Rainbow(trap.X * 3.0f + trap.Y * 5.0f + trap.Z * 0.7f + t * 0.06f);
            albedo = Mix(albedo, new float3(1.0f, 0.95f, 0.9f), Saturate(1.0f - trap.Y * 12.0f) * 0.5f);

            // A white key light from above and a magenta one from below.
            float3 light = Normalize(new float3(0.6f, 0.8f, -0.4f));
            float3 under = Normalize(new float3(-0.5f, -0.7f, 0.5f));
            float diffuse = Saturate(Dot(n, light));
            float bounce = Saturate(Dot(n, under));
            float specular = MathF.Pow(Saturate(Dot(n, Normalize(light - direction))), 40.0f);
            float fresnel = MathF.Pow(1.0f - Saturate(-Dot(n, direction)), 3.0f);
            float occlusion = Occlusion(p, n);

            color = albedo * ((diffuse * 1.5f + 0.08f) * occlusion)
                + new float3(1.0f, 0.15f, 0.65f) * (bounce * 0.6f * occlusion)
                + new float3(1.0f, 1.0f, 1.0f) * (specular * 0.9f * occlusion)
                + Rainbow(fresnel * 1.5f + t * 0.1f) * (fresnel * 0.8f);
            glow *= 0.35f;
        }
        color = color + Rainbow(t * 0.05f + 0.6f) * (glow * 0.016f);

        // Darker corners, a soft tone curve, then gamma.
        color = color * (1.0f - 0.18f * (x * x + y * y));
        return new float4(
            MathF.Pow(color.X / (1.0f + color.X), 0.4545f),
            MathF.Pow(color.Y / (1.0f + color.Y), 0.4545f),
            MathF.Pow(color.Z / (1.0f + color.Z), 0.4545f),
            1.0f);
    }
}

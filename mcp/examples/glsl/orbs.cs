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

public class Orbs
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

    vec3 Vec3(float x, float y, float z)
    {
        vec3 v;
        v.X = x;
        v.Y = y;
        v.Z = z;
        return v;
    }

    // The point reached after walking t units from origin along direction.
    vec3 Along(vec3 origin, vec3 direction, float t)
    {
        return Vec3(origin.X + direction.X * t, origin.Y + direction.Y * t, origin.Z + direction.Z * t);
    }

    vec3 OrbCenter(int index)
    {
        float k = index;
        float a = Params.Time * 0.5f + k * 2.0944f;
        return Vec3(cos(a) * 1.7f, -0.25f + 0.28f * sin(Params.Time * 1.3f + k * 2.0f), sin(a) * 1.7f + 1.0f);
    }

    // Distance to the closest surface: three spheres floating above a floor.
    float Scene(vec3 p)
    {
        float d = p.Y + 1.0f;
        for (int i = 0; i < 3; i++)
        {
            d = min(d, distance(p, OrbCenter(i)) - 0.8f);
        }
        return d;
    }

    vec3 Normal(vec3 p)
    {
        float e = 0.002f;
        return normalize(Vec3(
            Scene(Vec3(p.X + e, p.Y, p.Z)) - Scene(Vec3(p.X - e, p.Y, p.Z)),
            Scene(Vec3(p.X, p.Y + e, p.Z)) - Scene(Vec3(p.X, p.Y - e, p.Z)),
            Scene(Vec3(p.X, p.Y, p.Z + e)) - Scene(Vec3(p.X, p.Y, p.Z - e))));
    }

    vec3 Sky(vec3 direction, vec3 sun)
    {
        float h = clamp(direction.Y * 2.6f + 0.05f, 0.0f, 1.0f);
        vec3 color = mix(Vec3(1.00f, 0.42f, 0.38f), Vec3(0.04f, 0.07f, 0.26f), sqrt(h));
        float glow = pow(clamp(dot(direction, sun), 0.0f, 1.0f), 18.0f) * 1.1f;
        return Vec3(color.X + 1.00f * glow, color.Y + 0.70f * glow, color.Z + 0.40f * glow);
    }

    float Shadow(vec3 origin, vec3 direction)
    {
        float result = 1.0f;
        float travelled = 0.04f;
        for (int i = 0; i < 28; i++)
        {
            float h = Scene(Along(origin, direction, travelled));
            result = min(result, 9.0f * h / travelled);
            travelled += max(h, 0.03f);
            if (result < 0.001f || travelled > 9.0f) break;
        }
        return clamp(result, 0.0f, 1.0f);
    }

    // Distance travelled until the ray touches something, or -1 when it escapes.
    float March(vec3 origin, vec3 direction)
    {
        float travelled = 0.0f;
        for (int i = 0; i < 90; i++)
        {
            float d = Scene(Along(origin, direction, travelled));
            if (d < 0.0015f) return travelled;
            travelled += d;
            if (travelled > 24.0f) break;
        }
        return -1.0f;
    }

    vec3 Surface(vec3 p)
    {
        float closest = 1000.0f;
        int which = 3;
        for (int i = 0; i < 3; i++)
        {
            float d = distance(p, OrbCenter(i)) - 0.8f;
            if (d < closest)
            {
                closest = d;
                which = i;
            }
        }
        if (closest > 0.02f)
        {
            // Floor: a checker that fades into the distance.
            float check = mod(abs(floor(p.X) + floor(p.Z)), 2.0f);
            float fade = clamp(1.0f - sqrt(p.X * p.X + (p.Z - 1.0f) * (p.Z - 1.0f)) * 0.07f, 0.0f, 1.0f);
            vec3 tile = mix(Vec3(0.03f, 0.04f, 0.08f), Vec3(0.20f, 0.22f, 0.34f), check);
            return Vec3(tile.X * fade, tile.Y * fade, tile.Z * fade);
        }
        if (which == 0) return Vec3(1.00f, 0.30f, 0.22f);
        if (which == 1) return Vec3(0.10f, 0.72f, 1.00f);
        return Vec3(0.74f, 0.30f, 1.00f);
    }

    // Light, shadow and a mirror-like sheen for one point of the scene.
    vec3 Shade(vec3 position, vec3 direction, vec3 sun)
    {
        vec3 normal = Normal(position);
        vec3 albedo = Surface(position);

        float diffuse = clamp(dot(normal, sun), 0.0f, 1.0f) * Shadow(Along(position, normal, 0.01f), sun);
        vec3 halfway = normalize(Vec3(sun.X - direction.X, sun.Y - direction.Y, sun.Z - direction.Z));
        float specular = pow(clamp(dot(normal, halfway), 0.0f, 1.0f), 80.0f) * diffuse;
        float fresnel = pow(1.0f - clamp(-dot(normal, direction), 0.0f, 1.0f), 4.0f);

        float ambient = 0.5f + 0.5f * normal.Y;
        vec3 lit = Vec3(
            albedo.X * (1.00f * diffuse * 1.5f + 0.16f * ambient),
            albedo.Y * (0.82f * diffuse * 1.5f + 0.20f * ambient),
            albedo.Z * (0.62f * diffuse * 1.5f + 0.42f * ambient));

        vec3 color = mix(lit, Sky(reflect(direction, normal), sun), 0.10f + 0.6f * fresnel);
        return Vec3(color.X + 1.00f * specular, color.Y + 0.95f * specular, color.Z + 0.85f * specular);
    }

    [ShaderStage(Stage.Fragment)]
    public vec4 Fragment([gl_FragCoord] vec4 fragCoord)
    {
        float aspect = Params.Resolution.X / Params.Resolution.Y;
        float x = (fragCoord.X / Params.Resolution.X - 0.5f) * aspect;
        float y = fragCoord.Y / Params.Resolution.Y - 0.5f;
        vec3 origin = Vec3(0.0f, 1.3f, -5.2f);
        vec3 direction = normalize(Vec3(x, y - 0.16f, 1.25f));
        vec3 sun = normalize(Vec3(cos(Params.Time * 0.35f) * 0.9f, 0.45f, -0.6f));

        vec3 color = Sky(direction, sun);
        float travelled = March(origin, direction);
        if (travelled > 0.0f)
        {
            vec3 hit = Along(origin, direction, travelled);
            color = Shade(hit, direction, sun);

            // The floor also mirrors the orbs.
            if (hit.Y < -0.98f)
            {
                vec3 bounce = reflect(direction, Vec3(0.0f, 1.0f, 0.0f));
                vec3 start = Vec3(hit.X, hit.Y + 0.02f, hit.Z);
                float bounceDistance = March(start, bounce);
                vec3 mirror = Sky(bounce, sun);
                if (bounceDistance > 0.0f) mirror = Shade(Along(start, bounce, bounceDistance), bounce, sun);
                color = mix(color, mirror, 0.38f);
            }
            color = mix(color, Sky(direction, sun), smoothstep(10.0f, 24.0f, travelled));
        }

        // Soft tone curve, then gamma.
        vec4 result;
        result.X = pow(color.X / (1.0f + color.X * 0.3f), 0.4545f);
        result.Y = pow(color.Y / (1.0f + color.Y * 0.3f), 0.4545f);
        result.Z = pow(color.Z / (1.0f + color.Z * 0.3f), 0.4545f);
        result.W = 1.0f;
        return result;
    }
}

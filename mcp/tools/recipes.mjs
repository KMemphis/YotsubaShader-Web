// The 20 shared effects. Each one is written once, in the GLSL dialect of the syntaxes, with the same skeleton the
// playground uses; styles.mjs turns it into the five syntaxes. `body` runs after these locals are declared:
//   uv     0..1 coordinates of the pixel
//   p      centred coordinates, y in -0.5..0.5, x scaled by the aspect ratio
//   t      time in seconds

const HASH = `    float Hash(vec2 q)
    {
        return fract(sin(dot(q, vec2(127.1f, 311.7f))) * 43758.5453f);
    }
`;
const NOISE = `${HASH}
    float Noise(vec2 q)
    {
        vec2 i = vec2(floor(q.X), floor(q.Y));
        vec2 f = q - i;
        f = f * f * (vec2(3.0f) - f * 2.0f);
        float a = Hash(i);
        float b = Hash(i + vec2(1.0f, 0.0f));
        float c = Hash(i + vec2(0.0f, 1.0f));
        float d = Hash(i + vec2(1.0f, 1.0f));
        return mix(mix(a, b, f.X), mix(c, d, f.X), f.Y);
    }
`;
const FBM = `${NOISE}
    float Fbm(vec2 q)
    {
        float sum = 0.0f;
        float amp = 0.5f;
        for (int i = 0; i < 5; i++)
        {
            sum += amp * Noise(q);
            q = q * 2.03f + vec2(17.0f, 9.0f);
            amp *= 0.5f;
        }
        return sum;
    }
`;

export const RECIPES = [
  {
    id: 'plasma', tags: ['procedural', 'demoscene', 'animated'],
    title: ['Plasma', 'Plasma'],
    desc: ['Sum of sines mapped to a rainbow palette: the demoscene plasma.', 'Suma de senos con una paleta arcoíris: el plasma de la demoscene.'],
    credit: 'Classic demoscene effect, written from scratch.',
    helpers: '',
    body: `        float v = sin(p.X * 6.0f + t) + sin(p.Y * 7.0f - t * 1.3f) + sin((p.X + p.Y) * 5.0f + t * 0.7f) + sin(length(p) * 9.0f - t * 2.0f);
        v = v * 0.25f * 6.2832f;
        vec3 col = vec3(0.5f + 0.5f * sin(v), 0.5f + 0.5f * sin(v + 2.094f), 0.5f + 0.5f * sin(v + 4.188f));
        return vec4(col, 1.0f);`,
  },
  {
    id: 'voronoi', tags: ['procedural', 'noise', 'cells'],
    title: ['Voronoi cells', 'Celdas de Voronoi'],
    desc: ['Animated Voronoi diagram: distance to the nearest of a jittered grid of points.', 'Diagrama de Voronoi animado: distancia al punto más cercano de una rejilla con jitter.'],
    credit: 'Classic cellular noise (Worley), written from scratch.',
    helpers: `    vec2 Hash2(vec2 q)
    {
        float a = dot(q, vec2(127.1f, 311.7f));
        float b = dot(q, vec2(269.5f, 183.3f));
        return vec2(fract(sin(a) * 43758.5453f), fract(sin(b) * 43758.5453f));
    }
`,
    body: `        vec2 x = p * 6.0f;
        vec2 cell = vec2(floor(x.X), floor(x.Y));
        vec2 f = x - cell;
        float best = 8.0f;
        for (int j = -1; j <= 1; j++)
        {
            for (int i = -1; i <= 1; i++)
            {
                float gi = i;
                float gj = j;
                vec2 g = vec2(gi, gj);
                vec2 o = Hash2(cell + g);
                o = vec2(0.5f + 0.5f * sin(t + 6.2831f * o.X), 0.5f + 0.5f * sin(t + 6.2831f * o.Y));
                vec2 r = g + o - f;
                best = min(best, dot(r, r));
            }
        }
        float d = sqrt(best);
        vec3 col = vec3(d, d * d, 1.0f - d) * 0.9f + vec3(0.05f);
        return vec4(col, 1.0f);`,
  },
  {
    id: 'fbm-clouds', tags: ['procedural', 'noise', 'sky'],
    title: ['Fractal clouds', 'Nubes fractales'],
    desc: ['Fractal Brownian motion over value noise, scrolling across a sky gradient.', 'Movimiento browniano fractal sobre ruido de valor, desplazándose sobre un cielo.'],
    credit: 'Classic fBm clouds, written from scratch.',
    helpers: FBM,
    body: `        float n = Fbm(p * 3.0f + vec2(t * 0.15f, 0.0f));
        float cloud = smoothstep(0.45f, 0.85f, n);
        vec3 sky = Mix3(vec3(0.25f, 0.5f, 0.95f), vec3(0.75f, 0.88f, 1.0f), uv.Y);
        vec3 col = Mix3(sky, vec3(1.0f), cloud);
        return vec4(col, 1.0f);`,
  },
  {
    id: 'raymarch-sphere', tags: ['raymarching', 'sdf', 'lighting'],
    title: ['Raymarched sphere', 'Esfera con raymarching'],
    desc: ['Sphere traced through a signed distance function with diffuse light and a bobbing animation.', 'Esfera trazada con una función de distancia con signo, luz difusa y un movimiento vertical.'],
    credit: 'Sphere tracing after the usual SDF technique (iquilezles.org), written from scratch.',
    helpers: `    float Map(vec3 q, float time)
    {
        vec3 center = vec3(0.0f, 0.15f * sin(time * 1.5f), 3.0f);
        return length(q - center) - 1.0f;
    }
`,
    body: `        vec3 ro = vec3(0.0f);
        vec3 rd = normalize(vec3(p.X, p.Y, 1.5f));
        float dist = 0.0f;
        for (int i = 0; i < 48; i++)
        {
            float h = Map(ro + rd * dist, t);
            dist += h;
        }
        vec3 hit = ro + rd * dist;
        float e = 0.002f;
        vec3 n = normalize(vec3(
            Map(hit + vec3(e, 0.0f, 0.0f), t) - Map(hit - vec3(e, 0.0f, 0.0f), t),
            Map(hit + vec3(0.0f, e, 0.0f), t) - Map(hit - vec3(0.0f, e, 0.0f), t),
            Map(hit + vec3(0.0f, 0.0f, e), t) - Map(hit - vec3(0.0f, 0.0f, e), t)));
        vec3 light = normalize(vec3(-0.5f, 0.8f, -0.6f));
        float diff = clamp(dot(n, light), 0.0f, 1.0f);
        vec3 bg = vec3(0.08f, 0.1f, 0.16f) + vec3(0.1f) * uv.Y;
        vec3 shade = vec3(0.9f, 0.45f, 0.3f) * (0.15f + 0.85f * diff);
        float isHit = 1.0f - smoothstep(0.0f, 0.02f, Map(hit, t));
        return vec4(Mix3(bg, shade, isHit), 1.0f);`,
  },
  {
    id: 'mandelbrot', tags: ['fractal', 'math'],
    title: ['Mandelbrot set', 'Conjunto de Mandelbrot'],
    desc: ['Escape-time Mandelbrot with a smooth palette and a slow zoom.', 'Mandelbrot por tiempo de escape con una paleta suave y un zoom lento.'],
    credit: 'The Mandelbrot set, written from scratch.',
    helpers: '',
    body: `        float zoom = 1.0f + 0.5f * sin(t * 0.3f);
        vec2 c = vec2(p.X * 2.4f / zoom - 0.6f, p.Y * 2.4f / zoom);
        vec2 z = vec2(0.0f);
        float n = 0.0f;
        for (int i = 0; i < 64; i++)
        {
            if (dot(z, z) < 16.0f)
            {
                z = vec2(z.X * z.X - z.Y * z.Y + c.X, 2.0f * z.X * z.Y + c.Y);
                n += 1.0f;
            }
        }
        float k = n / 64.0f;
        vec3 col = vec3(0.5f + 0.5f * cos(6.2832f * (k + 0.0f)), 0.5f + 0.5f * cos(6.2832f * (k + 0.33f)), 0.5f + 0.5f * cos(6.2832f * (k + 0.67f)));
        return vec4(col * (1.0f - step(63.5f, n)), 1.0f);`,
  },
  {
    id: 'julia', tags: ['fractal', 'math', 'animated'],
    title: ['Julia set', 'Conjunto de Julia'],
    desc: ['Julia set whose constant orbits a circle, morphing the shape.', 'Conjunto de Julia cuya constante recorre un círculo y transforma la forma.'],
    credit: 'The Julia set, written from scratch.',
    helpers: '',
    body: `        vec2 c = vec2(0.7885f * cos(t * 0.4f), 0.7885f * sin(t * 0.4f));
        vec2 z = p * 2.6f;
        float n = 0.0f;
        for (int i = 0; i < 48; i++)
        {
            if (dot(z, z) < 16.0f)
            {
                z = vec2(z.X * z.X - z.Y * z.Y + c.X, 2.0f * z.X * z.Y + c.Y);
                n += 1.0f;
            }
        }
        float k = n / 48.0f;
        return vec4(sqrt(k), k * k, k * 0.6f + 0.1f, 1.0f);`,
  },
  {
    id: 'metaballs', tags: ['procedural', 'sdf', 'animated'],
    title: ['Metaballs', 'Metabolas'],
    desc: ['Five orbiting blobs whose fields add up and merge when they get close.', 'Cinco manchas en órbita cuyos campos se suman y se funden al acercarse.'],
    credit: 'Classic metaballs effect, written from scratch.',
    helpers: '',
    body: `        float field = 0.0f;
        for (int i = 0; i < 5; i++)
        {
            float k = i;
            vec2 c = vec2(0.35f * sin(t * (0.6f + 0.17f * k) + k * 1.9f), 0.25f * cos(t * (0.5f + 0.13f * k) + k * 2.3f));
            vec2 d = p - c;
            field += 0.012f / (dot(d, d) + 0.001f);
        }
        float edge = smoothstep(0.9f, 1.1f, field);
        vec3 col = Mix3(vec3(0.05f, 0.06f, 0.12f), vec3(0.3f, 0.9f, 0.7f), edge);
        col = col + vec3(0.6f, 0.2f, 0.5f) * (1.0f - smoothstep(1.1f, 1.5f, field)) * edge;
        return vec4(col, 1.0f);`,
  },
  {
    id: 'kaleidoscope', tags: ['procedural', 'symmetry', 'animated'],
    title: ['Kaleidoscope', 'Caleidoscopio'],
    desc: ['Folds the plane into six mirrored wedges and paints rings over it.', 'Pliega el plano en seis sectores simétricos y pinta anillos encima.'],
    credit: 'Classic polar-fold kaleidoscope, written from scratch.',
    helpers: '',
    body: `        float r = length(p);
        float a = atan2(p.Y, p.X) + t * 0.2f;
        float seg = 6.2832f / 6.0f;
        a = abs(a - seg * floor(a / seg) - seg * 0.5f);
        vec2 q = vec2(cos(a), sin(a)) * r;
        float v = sin(q.X * 18.0f - t * 2.0f) * sin(q.Y * 18.0f + t);
        vec3 col = vec3(0.5f + 0.5f * sin(v * 3.0f + r * 8.0f), 0.5f + 0.5f * sin(v * 3.0f + 2.0f), 0.5f + 0.5f * sin(v * 3.0f + 4.0f));
        return vec4(col * (1.2f - r), 1.0f);`,
  },
  {
    id: 'truchet', tags: ['procedural', 'tiles'],
    title: ['Truchet tiles', 'Teselas de Truchet'],
    desc: ['Quarter-circle tiles flipped at random: endless winding paths.', 'Teselas de cuarto de círculo volteadas al azar: caminos que serpentean sin fin.'],
    credit: 'Truchet tiling (Sébastien Truchet), written from scratch.',
    helpers: HASH,
    body: `        vec2 x = (p + vec2(t * 0.05f, 0.0f)) * 8.0f;
        vec2 cell = vec2(floor(x.X), floor(x.Y));
        vec2 f = x - cell;
        if (Hash(cell) > 0.5f)
        {
            f = vec2(1.0f - f.X, f.Y);
        }
        float d1 = abs(length(f) - 0.5f);
        float d2 = abs(length(f - vec2(1.0f)) - 0.5f);
        float d = min(d1, d2);
        float line = 1.0f - smoothstep(0.04f, 0.07f, d);
        vec3 col = Mix3(vec3(0.95f, 0.92f, 0.85f), vec3(0.12f, 0.16f, 0.35f), line);
        return vec4(col, 1.0f);`,
  },
  {
    id: 'checkerboard', tags: ['procedural', 'perspective'],
    title: ['Checkerboard floor', 'Suelo de ajedrez'],
    desc: ['An infinite checkerboard plane in perspective with a fading horizon.', 'Un plano infinito de ajedrez en perspectiva con el horizonte difuminado.'],
    credit: 'Classic perspective floor, written from scratch.',
    helpers: '',
    body: `        float horizon = 0.05f;
        float h = horizon - p.Y;
        vec3 sky = Mix3(vec3(0.95f, 0.6f, 0.4f), vec3(0.2f, 0.3f, 0.6f), uv.Y);
        if (h > 0.0f)
        {
            float depth = 0.5f / h;
            float x = p.X * depth * 2.0f;
            float z = depth + t * 2.0f;
            float c = fract((floor(x) + floor(z)) * 0.5f) * 2.0f;
            vec3 floorColor = Mix3(vec3(0.1f), vec3(0.9f), c);
            float fog = clamp(1.0f - depth * 0.05f, 0.0f, 1.0f);
            return vec4(Mix3(sky, floorColor, fog), 1.0f);
        }
        return vec4(sky, 1.0f);`,
  },
  {
    id: 'hex-grid', tags: ['procedural', 'tiles', 'grid'],
    title: ['Hexagonal grid', 'Rejilla hexagonal'],
    desc: ['Hexagon cells with a pulsing border, from the hexagonal distance function.', 'Celdas hexagonales con un borde que pulsa, con la función de distancia hexagonal.'],
    credit: 'Hex tiling after the usual hexagonal grid technique, written from scratch.',
    helpers: `    float HexDist(vec2 q)
    {
        vec2 a = vec2(abs(q.X), abs(q.Y));
        float c = dot(a, normalize(vec2(1.0f, 1.7321f)));
        return max(c, a.X);
    }
`,
    body: `        vec2 s = vec2(1.0f, 1.7321f);
        vec2 x = p * 6.0f;
        vec2 a = x - s * vec2(floor(x.X / s.X + 0.5f), floor(x.Y / s.Y + 0.5f));
        vec2 b = x - s * (vec2(floor(x.X / s.X), floor(x.Y / s.Y)) + vec2(0.5f));
        vec2 g = a;
        if (dot(b, b) < dot(a, a))
        {
            g = b;
        }
        float d = HexDist(g);
        float edge = smoothstep(0.42f, 0.5f, d);
        float pulse = 0.5f + 0.5f * sin(t * 2.0f + length(x) * 1.5f);
        vec3 col = Mix3(vec3(0.08f, 0.12f, 0.2f) + vec3(0.25f) * pulse * (1.0f - d), vec3(0.4f, 0.9f, 1.0f), edge);
        return vec4(col, 1.0f);`,
  },
  {
    id: 'starfield', tags: ['procedural', 'space', 'animated'],
    title: ['Starfield', 'Campo de estrellas'],
    desc: ['Three layers of twinkling stars drifting at different speeds for depth.', 'Tres capas de estrellas titilantes que se mueven a distinta velocidad para dar profundidad.'],
    credit: 'Classic parallax starfield, written from scratch.',
    helpers: HASH,
    body: `        vec3 col = vec3(0.01f, 0.01f, 0.04f);
        for (int layer = 0; layer < 3; layer++)
        {
            float k = layer;
            float scale = 14.0f + k * 12.0f;
            vec2 x = (p + vec2(t * (0.02f + 0.02f * k), 0.0f)) * scale;
            vec2 cell = vec2(floor(x.X), floor(x.Y));
            vec2 f = x - cell - vec2(0.5f);
            float h = Hash(cell + vec2(k * 31.0f));
            vec2 offset = vec2(Hash(cell * 1.7f) - 0.5f, Hash(cell * 2.3f) - 0.5f) * 0.6f;
            float d = length(f - offset);
            float twinkle = 0.6f + 0.4f * sin(t * 3.0f + h * 40.0f);
            float star = step(0.9f, h) * twinkle * (1.0f - smoothstep(0.0f, 0.12f, d));
            col += vec3(0.8f, 0.85f, 1.0f) * star;
        }
        return vec4(col, 1.0f);`,
  },
  {
    id: 'tunnel', tags: ['procedural', 'polar', 'animated'],
    title: ['Tunnel', 'Túnel'],
    desc: ['Polar coordinates turned into a texture that rushes toward the viewer.', 'Coordenadas polares convertidas en una textura que avanza hacia el espectador.'],
    credit: 'Classic demoscene tunnel, written from scratch.',
    helpers: '',
    body: `        float r = length(p) + 0.001f;
        float a = atan2(p.Y, p.X);
        float u = 0.3f / r + t * 0.8f;
        float v = a * 1.5915f + t * 0.1f;
        float checker = fract((floor(u * 4.0f) + floor(v * 6.0f)) * 0.5f) * 2.0f;
        vec3 col = Mix3(vec3(0.1f, 0.05f, 0.3f), vec3(0.9f, 0.4f, 0.7f), checker);
        return vec4(col * clamp(r * 2.5f, 0.0f, 1.0f), 1.0f);`,
  },
  {
    id: 'fire', tags: ['procedural', 'noise', 'animated'],
    title: ['Fire', 'Fuego'],
    desc: ['Noise scrolling upward and shaped into a flame, from black to white-hot.', 'Ruido que sube y se moldea como una llama, de negro a blanco incandescente.'],
    credit: 'Classic noise-driven flame, written from scratch.',
    helpers: FBM,
    body: `        vec2 q = vec2(p.X * 3.0f, p.Y * 2.0f - t * 1.2f);
        float n = Fbm(q * 1.5f);
        float shape = 1.0f - length(vec2(p.X * 1.6f, (uv.Y - 0.1f) * 1.2f));
        float flame = clamp(shape * 1.6f + (n - 0.5f) * 1.2f, 0.0f, 1.0f);
        vec3 col = vec3(flame * 1.6f, flame * flame * 1.1f, flame * flame * flame * 0.8f);
        return vec4(col, 1.0f);`,
  },
  {
    id: 'rainbow', tags: ['gradient', 'color', 'animated'],
    title: ['Rainbow waves', 'Ondas arcoíris'],
    desc: ['A cosine palette that flows diagonally across the screen.', 'Una paleta de cosenos que fluye en diagonal por la pantalla.'],
    credit: 'Cosine palettes as described by Inigo Quilez, written from scratch.',
    helpers: `    vec3 Palette(float k)
    {
        return vec3(0.5f + 0.5f * cos(6.2832f * (k + 0.0f)), 0.5f + 0.5f * cos(6.2832f * (k + 0.33f)), 0.5f + 0.5f * cos(6.2832f * (k + 0.67f)));
    }
`,
    body: `        float k = (uv.X + uv.Y) * 0.8f + 0.15f * sin(uv.Y * 9.0f + t * 2.0f) - t * 0.15f;
        return vec4(Palette(k), 1.0f);`,
  },
  {
    id: 'crt', tags: ['post-process', 'retro', 'color'],
    title: ['CRT screen', 'Pantalla CRT'],
    desc: ['A gradient seen through scanlines, an RGB mask and a vignette, like an old monitor.', 'Un degradado visto con líneas de barrido, máscara RGB y viñeta, como un monitor antiguo.'],
    credit: 'Classic CRT look, written from scratch.',
    helpers: '',
    body: `        vec3 tint = vec3(0.5f + 0.5f * sin(uv.X * 6.0f + t), 0.5f + 0.5f * sin(uv.Y * 5.0f - t * 0.7f), 0.5f + 0.5f * sin((uv.X + uv.Y) * 4.0f));
        float scan = 0.75f + 0.25f * sin(fragCoord.Y * 3.14159f);
        float mask = 0.85f + 0.15f * sin(fragCoord.X * 2.0944f);
        float vignette = 1.0f - 1.6f * dot(p, p) * 0.5f;
        float flicker = 0.97f + 0.03f * sin(t * 60.0f);
        return vec4(tint * scan * mask * clamp(vignette, 0.0f, 1.0f) * flicker, 1.0f);`,
  },
  {
    id: 'sdf-shapes', tags: ['sdf', '2d', 'shapes'],
    title: ['SDF shapes', 'Formas con SDF'],
    desc: ['A circle and a rounded box blended with a smooth minimum, drawn with distance bands.', 'Un círculo y una caja redondeada unidos con un mínimo suave y dibujados con bandas de distancia.'],
    credit: '2D signed distance functions as described by Inigo Quilez, written from scratch.',
    helpers: `    float SdBox(vec2 q, vec2 b)
    {
        vec2 d = vec2(abs(q.X) - b.X, abs(q.Y) - b.Y);
        return length(vec2(max(d.X, 0.0f), max(d.Y, 0.0f))) + min(max(d.X, d.Y), 0.0f);
    }

    float SmoothMin(float a, float b, float k)
    {
        float h = clamp(0.5f + 0.5f * (b - a) / k, 0.0f, 1.0f);
        return mix(b, a, h) - k * h * (1.0f - h);
    }
`,
    body: `        float circle = length(p - vec2(0.2f * sin(t), 0.0f)) - 0.18f;
        float box = SdBox(p + vec2(0.15f, 0.0f), vec2(0.15f, 0.1f)) - 0.05f;
        float d = SmoothMin(circle, box, 0.12f);
        vec3 col = Mix3(vec3(0.9f, 0.5f, 0.2f), vec3(0.2f, 0.4f, 0.8f), step(0.0f, d));
        col = col * (0.8f + 0.2f * cos(d * 120.0f));
        col = Mix3(col, vec3(1.0f), 1.0f - smoothstep(0.0f, 0.01f, abs(d)));
        return vec4(col, 1.0f);`,
  },
  {
    id: 'moire', tags: ['procedural', 'interference'],
    title: ['Moiré rings', 'Anillos de moiré'],
    desc: ['Two sets of concentric rings that interfere as their centres move.', 'Dos juegos de anillos concéntricos que interfieren cuando sus centros se mueven.'],
    credit: 'Moiré interference pattern, written from scratch.',
    helpers: '',
    body: `        vec2 c1 = vec2(0.25f * cos(t * 0.5f), 0.2f * sin(t * 0.7f));
        vec2 c2 = vec2(-0.25f * cos(t * 0.6f), -0.2f * sin(t * 0.4f));
        float a = sin(length(p - c1) * 120.0f);
        float b = sin(length(p - c2) * 120.0f);
        float v = 0.5f + 0.5f * a * b;
        return vec4(vec3(v) * vec3(0.9f, 0.95f, 1.0f), 1.0f);`,
  },
  {
    id: 'domain-warp', tags: ['procedural', 'noise', 'animated'],
    title: ['Domain warping', 'Distorsión de dominio'],
    desc: ['Noise that feeds its own coordinates, producing marbled, flowing colour.', 'Ruido que alimenta sus propias coordenadas y produce un color marmoleado que fluye.'],
    credit: 'Domain warping technique (iquilezles.org), written from scratch.',
    helpers: FBM,
    body: `        vec2 q = vec2(Fbm(p * 2.0f + vec2(0.0f, t * 0.1f)), Fbm(p * 2.0f + vec2(5.2f, 1.3f - t * 0.1f)));
        vec2 r = vec2(Fbm(p * 2.0f + q * 3.0f + vec2(1.7f, 9.2f)), Fbm(p * 2.0f + q * 3.0f + vec2(8.3f, 2.8f)));
        float f = Fbm(p * 2.0f + r * 3.0f);
        vec3 col = Mix3(vec3(0.1f, 0.15f, 0.3f), vec3(0.9f, 0.6f, 0.3f), f);
        col = Mix3(col, vec3(0.2f, 0.7f, 0.7f), clamp(length(q), 0.0f, 1.0f) * 0.6f);
        return vec4(col * (0.4f + 1.2f * f * f), 1.0f);`,
  },
  {
    id: 'sunset', tags: ['gradient', 'sky', 'scene'],
    title: ['Sunset', 'Atardecer'],
    desc: ['A sky gradient with a sun, banding and a dark sea that reflects it.', 'Un degradado de cielo con sol, bandas y un mar oscuro que lo refleja.'],
    credit: 'Written from scratch.',
    helpers: '',
    body: `        float horizon = 0.0f;
        vec3 sky = Mix3(vec3(1.0f, 0.55f, 0.25f), vec3(0.15f, 0.1f, 0.35f), clamp(p.Y * 1.8f, 0.0f, 1.0f));
        vec2 sunPos = vec2(0.0f, 0.12f + 0.02f * sin(t * 0.5f));
        float sun = 1.0f - smoothstep(0.17f, 0.18f, length(p - sunPos));
        float bands = step(0.5f, fract(p.Y * 40.0f + 0.4f)) * step(p.Y, 0.12f);
        sky = Mix3(sky, vec3(1.0f, 0.85f, 0.4f), sun * (1.0f - bands * 0.5f));
        if (p.Y < horizon)
        {
            float wave = 0.5f + 0.5f * sin(p.Y * 90.0f + t * 2.0f + p.X * 4.0f);
            float glow = (1.0f - smoothstep(0.0f, 0.3f, abs(p.X))) * (0.3f + 0.5f * wave);
            return vec4(vec3(0.05f, 0.05f, 0.15f) + vec3(1.0f, 0.5f, 0.2f) * glow * 0.6f, 1.0f);
        }
        return vec4(sky, 1.0f);`,
  },
];

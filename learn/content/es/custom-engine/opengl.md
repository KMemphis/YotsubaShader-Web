---
title: Compilar para OpenGL
summary: Convierte un shader de C# ya escrito en archivos GLSL y cárgalos en un programa OpenGL.
order: 4
---

Este capítulo parte de un shader que ya está escrito. Lo copias, lo compilas a GLSL con la CLI y cargas el resultado en OpenGL. Aquí no se aprende a escribir shaders; eso lo enseña [Get Started](../get-started/index.md).

## El shader

Instala la CLI una sola vez y crea un proyecto para el shader:

```bash
dotnet tool install --global YotsubaShader.Compiler.CLI
dotnet new classlib -n MisShaders -f net8.0
dotnet add MisShaders package YotsubaShader.GlslSyntax
```

Borra el `Class1.cs` que crea la plantilla y guarda esto como `MisShaders/Plasma.cs`:

```csharp
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Resources;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.Language;
using static YotsubaShader.GlslSyntax.Methods.Math;

namespace MisShaders;

public struct Vertice
{
    [location(0)] public vec2 Posicion;
    [location(1)] public vec2 Uv;
}

public struct Pixel
{
    [gl_Position] public vec4 Posicion;
    [location(0)] public vec2 Uv;
}

public struct PixelIn
{
    [location(0)] public vec2 Uv;
}

public struct Reloj
{
    public float Segundos;
}

public class Plasma
{
    [uniform, layout(0, 0)]
    public Reloj Tiempo;

    [ShaderStage(Stage.Vertex)]
    public Pixel Vertex(Vertice vertice)
    {
        Pixel pixel;
        pixel.Posicion = Crear.Vec4(vertice.Posicion.X, vertice.Posicion.Y, 0f, 1f);
        pixel.Uv = vertice.Uv;
        return pixel;
    }

    [ShaderStage(Stage.Fragment)]
    [return: location(0)]
    public vec4 Fragment(PixelIn pixel)
    {
        float x = pixel.Uv.X * 2f - 1f;
        float y = pixel.Uv.Y * 2f - 1f;
        float t = Tiempo.Segundos;

        float olas = sin(x * 6f + t)
                   + sin(y * 6f + t * 1.3f)
                   + sin((x + y) * 6f + t * 0.7f)
                   + sin(sqrt(x * x + y * y) * 9f - t * 2f);

        float rojo = 0.5f + 0.5f * sin(olas * 1.5f);
        float verde = 0.5f + 0.5f * sin(olas * 1.5f + 2.1f);
        float azul = 0.5f + 0.5f * sin(olas * 1.5f + 4.2f);
        return Crear.Vec4(rojo, verde, azul, 1f);
    }
}

public static class Crear
{
    public static vec4 Vec4(float x, float y, float z, float w)
    {
        vec4 v;
        v.X = x;
        v.Y = y;
        v.Z = z;
        v.W = w;
        return v;
    }
}
```

Cubre toda la pantalla con un plasma en movimiento. El método vertex recibe una posición y una coordenada de textura. El método fragment pinta a partir de `Tiempo.Segundos`, un valor que tu programa escribe en un buffer uniform en cada frame.

## Qué formato lee OpenGL

OpenGL recibe GLSL como texto, un código por stage. El target es `glsl`:

```bash
yotsuba compile MisShaders/MisShaders.csproj --target glsl --output shaders
```

No imprime nada si todo sale bien y termina con código `0`. La carpeta de `--output` se cuenta desde la carpeta del `.csproj`, y las subcarpetas siguen el namespace:

```text
MisShaders/shaders/
└── MisShaders/
    ├── Plasma.Fragment.glsl
    └── Plasma.Vertex.glsl
```

Hay un archivo por stage, con el nombre `<Clase>.<Stage>.glsl`. Este es el archivo vertex, tal como lo escribió el compilador:

```glsl
#version 450

struct Pixel
{
    vec4 Posicion;
    vec2 Uv;
};

layout(set = 0, binding = 0, std140) uniform Reloj
{
    float Segundos;
} Tiempo;

layout(location = 0) in vec2 vertice_Posicion;
layout(location = 1) in vec2 vertice_Uv;
layout(location = 0) out vec2 _return_Uv;

vec4 Vec4(float x, float y, float z, float w)
{
    vec4 v;
    v.x = x;
    v.y = y;
    v.z = z;
    v.w = w;
    return v;
}

void main()
{
    Pixel pixel;
    pixel.Posicion = Vec4(vertice_Posicion.x, vertice_Posicion.y, 0.0, 1.0);
    pixel.Uv = vertice_Uv;
    gl_Position = pixel.Posicion;
    _return_Uv = pixel.Uv;
}
```

Los números que escribiste en C# son los que ve OpenGL. Los dos atributos de vértice:

```csharp
public struct Vertice
{
    [location(0)] public vec2 Posicion;
    [location(1)] public vec2 Uv;
}
```

```glsl
layout(location = 0) in vec2 vertice_Posicion;
layout(location = 1) in vec2 vertice_Uv;
```

Y el buffer uniform:

```csharp
[uniform, layout(0, 0)]
public Reloj Tiempo;
```

```glsl
layout(set = 0, binding = 0, std140) uniform Reloj
{
    float Segundos;
} Tiempo;
```

`#version 450` significa que necesitas un contexto de OpenGL 4.5. macOS se queda en OpenGL 4.1, así que estos archivos no cargan allí; en ese sistema usa [Metal](metal.md).

## Cárgalo en OpenGL

Los ejemplos usan Silk.NET, y cada llamada tiene el mismo nombre en cualquier binding de OpenGL. Los punteros necesitan `<AllowUnsafeBlocks>true</AllowUnsafeBlocks>` en el `.csproj` del proyecto que dibuja. Crea la ventana y el contexto como siempre (`GL gl = window.CreateOpenGL();`) y compila cada archivo como un objeto shader. El GLSL generado habla Vulkan (`set = 0`) y OpenGL no tiene descriptor sets, así que quita esa palabra antes de que el driver vea el texto:

```csharp
static uint Compile(GL gl, ShaderType type, string source)
{
    uint shader = gl.CreateShader(type);
    gl.ShaderSource(shader, source);
    gl.CompileShader(shader);

    gl.GetShader(shader, ShaderParameterName.CompileStatus, out int ok);
    if (ok == 0) throw new Exception(gl.GetShaderInfoLog(shader));
    return shader;
}

static uint CreateProgram(GL gl)
{
    string vertexSource = File.ReadAllText("shaders/MisShaders/Plasma.Vertex.glsl");
    string fragmentSource = File.ReadAllText("shaders/MisShaders/Plasma.Fragment.glsl");

    vertexSource = vertexSource.Replace("set = 0, ", "");
    fragmentSource = fragmentSource.Replace("set = 0, ", "");

    uint vertex = Compile(gl, ShaderType.VertexShader, vertexSource);
    uint fragment = Compile(gl, ShaderType.FragmentShader, fragmentSource);

    uint program = gl.CreateProgram();
    gl.AttachShader(program, vertex);
    gl.AttachShader(program, fragment);
    gl.LinkProgram(program);

    gl.GetProgram(program, ProgramPropertyARB.LinkStatus, out int linked);
    if (linked == 0) throw new Exception(gl.GetProgramInfoLog(program));

    gl.DeleteShader(vertex);
    gl.DeleteShader(fragment);
    return program;
}
```

El buffer de vértices tiene cuatro floats por vértice, y los números de atributo son los valores de `location` de la struct de C#. No buscas los atributos por nombre:

```csharp
float[] quad =
{
    -1f, -1f, 0f, 0f,
     1f, -1f, 1f, 0f,
    -1f,  1f, 0f, 1f,
    -1f,  1f, 0f, 1f,
     1f, -1f, 1f, 0f,
     1f,  1f, 1f, 1f,
};

uint vao = gl.GenVertexArray();
gl.BindVertexArray(vao);

uint vbo = gl.GenBuffer();
gl.BindBuffer(BufferTargetARB.ArrayBuffer, vbo);
gl.BufferData<float>(BufferTargetARB.ArrayBuffer, quad, BufferUsageARB.StaticDraw);

// [location(0)] vec2 Posicion
gl.EnableVertexAttribArray(0);
gl.VertexAttribPointer(0, 2, VertexAttribPointerType.Float, false, 16, (void*)0);

// [location(1)] vec2 Uv
gl.EnableVertexAttribArray(1);
gl.VertexAttribPointer(1, 2, VertexAttribPointerType.Float, false, 16, (void*)8);
```

El bloque `Reloj` está en `binding = 0`, así que el buffer va al punto de enlace 0 de los uniforms. Un bloque con layout `std140` ocupa al menos 16 bytes, por eso el buffer tiene 16 aunque `Segundos` sea un solo `float`:

```csharp
uint reloj = gl.GenBuffer();
gl.BindBuffer(BufferTargetARB.UniformBuffer, reloj);
gl.BufferData(BufferTargetARB.UniformBuffer, 16, null, BufferUsageARB.DynamicDraw);
gl.BindBufferBase(BufferTargetARB.UniformBuffer, 0, reloj);
```

En cada frame, escribe el tiempo y dibuja:

```csharp
float segundos = (float)window.Time;
gl.BindBuffer(BufferTargetARB.UniformBuffer, reloj);
gl.BufferSubData(BufferTargetARB.UniformBuffer, 0, sizeof(float), &segundos);

gl.UseProgram(program);
gl.DrawArrays(PrimitiveType.Triangles, 0, 6);
```

## Inclúyelo con `add`

Si no quieres distribuir los archivos `.glsl`, `add` escribe los shaders dentro del proyecto como métodos de C#:

```bash
yotsuba add MisShaders/MisShaders.csproj --target glsl
```

```text
Archivo generado: /home/tu/Tutorial/MisShaders/YotsubaShader.g.cs
```

En el proyecto que dibuja, que referencia a `MisShaders`, pide cada stage por su nombre. El texto es el mismo que `compile` escribe en disco:

```csharp
using MisShaders;
using YotsubaShader;
using YotsubaShader.Language;

var plasma = new Plasma();
string vertexSource = plasma.ToGlsl(Stage.Vertex).Replace("set = 0, ", "");
string fragmentSource = plasma.ToGlsl(Stage.Fragment).Replace("set = 0, ", "");
```

Pasa esos dos textos a `Compile` de arriba. El resto del programa no cambia.

## Qué comando usar

Usa `compile` cuando tu motor carga los assets desde disco, o cuando quieres abrir el GLSL y leerlo. Usa `add` cuando el renderer está escrito en C# y quieres que el compilador de C# compruebe el nombre del shader. Las opciones de los dos están en [El comando compile](../reference/compile.md) y [El comando add](../reference/add.md).

El mismo shader va a las otras APIs gráficas cambiando solo el target: [Direct3D](direct3d.md), [Vulkan](vulkan.md), [Metal](metal.md) y [WebGL](webgl.md).

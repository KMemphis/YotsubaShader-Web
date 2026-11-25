---
title: Referencia de raylib-cs
summary: raylib-cs: paquete, formato de salida, datos de vértice, bloque de uniforms con GL crudo y un visor completo.
order: 12
---

raylib carga un shader como **dos textos** GLSL, uno por etapa. Yotsuba Shader compila tu shader de C# a esos textos con el destino `glsl:330`, y tu juego se los pasa a `Raylib.LoadShaderFromMemory`. No hay plugin ni método generado: la CLI escribe archivos y tu programa los lee. Para el recorrido paso a paso, usa la ruta de raylib-cs de [Get Started](../get-started/index.md).

## De un vistazo

| | |
| --- | --- |
| Destino | `glsl:330` (`--target glsl:330`) |
| Salida | `<Shader>.Vertex.glsl` y `<Shader>.Fragment.glsl`, uno por etapa |
| Paquete para el juego | `Raylib-cs` 8.1.0 |
| Cómo se carga | `Raylib.LoadShaderFromMemory(vertice, fragmento)` |
| Probado con | raylib-cs 8.1.0, OpenGL 3.3 |

## Compilar los shaders

Con el compilador instalado (`dotnet tool install --global YotsubaShader.Compiler.CLI`), desde la carpeta que contiene tu proyecto de shaders:

```bash
yotsuba compile MisShaders/MisShaders.csproj --target glsl:330 --output out
```

`glsl:330` es la versión de GLSL del OpenGL 3.3 que usa raylib. Con otra versión (`glsl:410`, por ejemplo) los nombres de las variables que viajan entre las etapas cambian y el programa no se enlaza. Los archivos quedan en `MisShaders/out/MisShaders/`. Para ejecutar el comando en cada compilación, mira [El comando compile](../reference/compile.md).

## El proyecto del juego

Un proyecto de consola basta, porque el shader llega como texto:

```bash
dotnet new console -n Visor -f net8.0
dotnet add Visor package Raylib-cs --version 8.1.0
```

Agrega `<AllowUnsafeBlocks>true</AllowUnsafeBlocks>` a `Visor.csproj`: el ayudante de OpenGL de más abajo llama funciones por puntero.

## Datos de vértice: la ranura 0 es la posición, la 1 el Uv

El shader del tutorial recibe un vértice con dos campos: `[location(0)] vec2 Position` y `[location(1)] vec2 Uv`. raylib enlaza sus atributos por posición: la ranura 0 es `vertexPosition` y la 1 es `vertexTexCoord`. Por eso basta con enviar la posición y el `Uv` con `Rlgl`:

```csharp
Rlgl.Begin(DrawMode.Quads);
Rlgl.TexCoord2f(0f, 0f); Rlgl.Vertex2f(-1f, 1f);
Rlgl.TexCoord2f(0f, 1f); Rlgl.Vertex2f(-1f, -1f);
Rlgl.TexCoord2f(1f, 1f); Rlgl.Vertex2f(1f, -1f);
Rlgl.TexCoord2f(1f, 0f); Rlgl.Vertex2f(1f, 1f);
Rlgl.End();
```

El shader escribe la posición directo en el espacio de recorte (de `-1` a `1`), así que el rectángulo cubre la ventana sin matrices.

## Uniforms: un bloque con GL crudo

Los uniforms de tu shader salen como un **bloque** (`layout(std140) uniform Context { ... } Data;`). raylib no asigna bloques por nombre ni los envuelve, así que se usan tres llamadas de OpenGL: crear un buffer, decirle al programa en qué dirección está cada bloque y escribir el buffer en cada cuadro. Como GLSL 3.30 no puede escribir la dirección en el texto, el visor asigna `0` a todos los bloques.

```csharp
uint data = Gl.GenBuffer();
int blocks = Gl.GetProgram(shader.Id, Gl.ActiveUniformBlocks);
for (uint block = 0; block < blocks; block++) Gl.UniformBlockBinding(shader.Id, block, 0);
Gl.BindBufferBase(Gl.UniformBuffer, 0, data);

// en cada cuadro
Gl.BindBuffer(Gl.UniformBuffer, data);
Gl.BufferData(Gl.UniformBuffer, values, Gl.DynamicDraw);
```

Las funciones de `Gl` se piden a raylib con `Rlgl.GetProcAddress`, porque raylib ya creó el contexto:

```csharp title="Visor/Gl.cs"
using System.Runtime.InteropServices;
using Raylib_cs;

// Las pocas funciones de OpenGL que raylib no envuelve. raylib ya creó el contexto;
// solo le preguntamos dónde están.
public static unsafe class Gl
{
    public const uint UniformBuffer = 0x8A11;
    public const uint DynamicDraw = 0x88E8;
    public const uint ActiveUniformBlocks = 0x8A36;

    private delegate void GenBuffersFn(int n, out uint buffers);
    private delegate void BindBufferFn(uint target, uint buffer);
    private delegate void BufferDataFn(uint target, nint size, float[] data, uint usage);
    private delegate void BindBufferBaseFn(uint target, uint index, uint buffer);
    private delegate void GetProgramFn(uint program, uint name, out int value);
    private delegate void UniformBlockBindingFn(uint program, uint blockIndex, uint binding);

    private static T Load<T>(string name) where T : Delegate
    {
        nint text = Marshal.StringToHGlobalAnsi(name);
        void* address = Rlgl.GetProcAddress((sbyte*)text);
        Marshal.FreeHGlobal(text);
        return Marshal.GetDelegateForFunctionPointer<T>((nint)address);
    }

    private static readonly GenBuffersFn GenBuffersFunction = Load<GenBuffersFn>("glGenBuffers");
    private static readonly BindBufferFn BindBufferFunction = Load<BindBufferFn>("glBindBuffer");
    private static readonly BufferDataFn BufferDataFunction = Load<BufferDataFn>("glBufferData");
    private static readonly BindBufferBaseFn BindBufferBaseFunction = Load<BindBufferBaseFn>("glBindBufferBase");
    private static readonly GetProgramFn GetProgramFunction = Load<GetProgramFn>("glGetProgramiv");
    private static readonly UniformBlockBindingFn UniformBlockBindingFunction = Load<UniformBlockBindingFn>("glUniformBlockBinding");

    public static uint GenBuffer() { GenBuffersFunction(1, out uint id); return id; }
    public static void BindBuffer(uint target, uint buffer) => BindBufferFunction(target, buffer);
    public static void BufferData(uint target, float[] data, uint usage) => BufferDataFunction(target, data.Length * sizeof(float), data, usage);
    public static void BindBufferBase(uint target, uint index, uint buffer) => BindBufferBaseFunction(target, index, buffer);
    public static int GetProgram(uint program, uint name) { GetProgramFunction(program, name, out int value); return value; }
    public static void UniformBlockBinding(uint program, uint block, uint binding) => UniformBlockBindingFunction(program, block, binding);
}
```

## Un visor completo

Este es el `Program.cs` del tutorial: abre la ventana, carga el shader que le indiques, entrega el ancho, el alto y los segundos, y lo dibuja sobre un rectángulo. Si existe `pez.png`, lo entrega como textura.

```csharp title="Visor/Program.cs"
using Raylib_cs;

string name = args.Length > 0 ? args[0] : "Degradado";
// Los shaders que declaran solo el reloj (un Reloj con Segundos) leen primero los segundos; los demás leen ancho, alto y segundos.
bool clockOnly = name is "Plasma" or "BajoElAgua";

Raylib.SetConfigFlags(ConfigFlags.ResizableWindow);
Raylib.InitWindow(800, 450, name);

// Las dos etapas del shader, tal como las escribió el compilador.
string folder = "MisShaders/out/MisShaders";
Shader shader = Raylib.LoadShaderFromMemory(
    File.ReadAllText($"{folder}/{name}.Vertex.glsl"),
    File.ReadAllText($"{folder}/{name}.Fragment.glsl"));

// El bloque de uniforms (ancho, alto, segundos) va en la dirección 0.
uint data = Gl.GenBuffer();
int blocks = Gl.GetProgram(shader.Id, Gl.ActiveUniformBlocks);
for (uint block = 0; block < blocks; block++)
{
    Gl.UniformBlockBinding(shader.Id, block, 0);
}
Gl.BindBufferBase(Gl.UniformBuffer, 0, data);

// La foto para los shaders que declaran una textura. Si el archivo no existe, la textura es blanca.
Texture2D photo = File.Exists("pez.png") ? Raylib.LoadTexture("pez.png") : default;

while (!Raylib.WindowShouldClose())
{
    // Si tu shader declara estos datos, el visor se los entrega.
    float seconds = (float)Raylib.GetTime();
    float[] values = clockOnly ? [seconds, 0f, 0f, 0f] : [Raylib.GetScreenWidth(), Raylib.GetScreenHeight(), seconds, 0f];
    Gl.BindBuffer(Gl.UniformBuffer, data);
    Gl.BufferData(Gl.UniformBuffer, values, Gl.DynamicDraw);

    Raylib.BeginDrawing();
    Raylib.ClearBackground(Color.Black);
    Raylib.BeginShaderMode(shader);

    // El rectángulo: cuatro esquinas con su Uv. Las posiciones van de -1 a 1.
    Rlgl.SetTexture(photo.Id);
    Rlgl.Begin(DrawMode.Quads);
    Rlgl.TexCoord2f(0f, 0f); Rlgl.Vertex2f(-1f, 1f);
    Rlgl.TexCoord2f(0f, 1f); Rlgl.Vertex2f(-1f, -1f);
    Rlgl.TexCoord2f(1f, 1f); Rlgl.Vertex2f(1f, -1f);
    Rlgl.TexCoord2f(1f, 0f); Rlgl.Vertex2f(1f, 1f);
    Rlgl.End();
    Rlgl.SetTexture(0);

    Raylib.EndShaderMode();
    Raylib.EndDrawing();
}

Raylib.UnloadShader(shader);
Raylib.CloseWindow();
```

## Dentro de un juego

Un shader de Yotsuba Shader es un `Shader` de raylib como cualquier otro. Dibuja lo que quieras entre `BeginShaderMode` y `EndShaderMode`:

```csharp
Raylib.BeginShaderMode(shader);
Raylib.DrawTexture(sprite, 100, 100, Color.White);
Raylib.EndShaderMode();
```

El shader del tutorial escribe la posición sin transformarla, así que sirve para pantallas completas. Para dibujar sprites, declara la matriz de raylib como uniform en tu shader y multiplícala por la posición.

## Si algo falla

| Qué ves | Qué significa | Qué hacer |
| --- | --- | --- |
| `Could not find file '.../Degradado.Vertex.glsl'` | El shader no se compiló, o el programa se ejecuta desde otra carpeta. | Ejecuta `compile` y lanza el visor desde la carpeta que contiene `MisShaders`. |
| La ventana sale negra y la consola de raylib muestra un error del shader | El texto no es GLSL 3.30, o una variable entre las etapas no coincide. | Compila con `--target glsl:330`, no con otra versión. |
| `NullReferenceException` al cargar las funciones de `Gl` | `GetProcAddress` se llamó antes de `InitWindow`. | Crea la ventana primero: el contexto de OpenGL nace con ella. |
| El shader no ve el tiempo ni el tamaño | El bloque no está en la dirección 0. | Llama a `UniformBlockBinding` con la dirección 0 para cada bloque, como arriba. |
| Un shader con foto sale negro | raylib no leyó la imagen. | Usa un PNG: `pez.png`. |

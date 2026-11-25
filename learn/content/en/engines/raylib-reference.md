---
title: raylib-cs reference
summary: raylib-cs: package, output format, vertex data, uniform block with raw GL and a complete viewer.
order: 12
---

raylib loads a shader as **two GLSL texts**, one per stage. Yotsuba Shader compiles your C# shader into those texts with the `glsl:330` target, and your game passes them to `Raylib.LoadShaderFromMemory`. There is no plugin and no generated method: the CLI writes files and your program reads them. For the step-by-step path, use the raylib-cs route of [Get Started](../get-started/index.md).

## At a glance

| | |
| --- | --- |
| Target | `glsl:330` (`--target glsl:330`) |
| Output | `<Shader>.Vertex.glsl` and `<Shader>.Fragment.glsl`, one per stage |
| Package for the game | `Raylib-cs` 8.1.0 |
| How it is loaded | `Raylib.LoadShaderFromMemory(vertex, fragment)` |
| Tested with | raylib-cs 8.1.0, OpenGL 3.3 |

## Build the shaders

With the compiler installed (`dotnet tool install --global YotsubaShader.Compiler.CLI`), from the folder that contains your shader project:

```bash
yotsuba compile MyShaders/MyShaders.csproj --target glsl:330 --output out
```

`glsl:330` is the GLSL version of the OpenGL 3.3 that raylib uses. With another version (`glsl:410`, for example) the names of the variables that travel between the stages change and the program does not link. The files land in `MyShaders/out/MyShaders/`. To run the command on every build, see [The compile command](../reference/compile.md).

## The game project

A console project is enough, because the shader arrives as text:

```bash
dotnet new console -n Viewer -f net8.0
dotnet add Viewer package Raylib-cs --version 8.1.0
```

Add `<AllowUnsafeBlocks>true</AllowUnsafeBlocks>` to `Viewer.csproj`: the OpenGL helper below calls functions through pointers.

## Vertex data: slot 0 is the position, slot 1 the Uv

The shader of the tutorial receives a vertex with two fields: `[location(0)] vec2 Position` and `[location(1)] vec2 Uv`. raylib binds its attributes by position: slot 0 is `vertexPosition` and slot 1 is `vertexTexCoord`. So it is enough to send the position and the `Uv` with `Rlgl`:

```csharp
Rlgl.Begin(DrawMode.Quads);
Rlgl.TexCoord2f(0f, 0f); Rlgl.Vertex2f(-1f, 1f);
Rlgl.TexCoord2f(0f, 1f); Rlgl.Vertex2f(-1f, -1f);
Rlgl.TexCoord2f(1f, 1f); Rlgl.Vertex2f(1f, -1f);
Rlgl.TexCoord2f(1f, 0f); Rlgl.Vertex2f(1f, 1f);
Rlgl.End();
```

The shader writes the position straight into clip space (from `-1` to `1`), so the rectangle covers the window without matrices.

## Uniforms: a block with raw GL

The uniforms of your shader come out as a **block** (`layout(std140) uniform Context { ... } Data;`). raylib does not assign blocks by name or wrap them, so three OpenGL calls are used: create a buffer, tell the program at which address each block lives, and write the buffer on every frame. Since GLSL 3.30 cannot write the address in the text, the viewer gives `0` to every block.

```csharp
uint data = Gl.GenBuffer();
int blocks = Gl.GetProgram(shader.Id, Gl.ActiveUniformBlocks);
for (uint block = 0; block < blocks; block++) Gl.UniformBlockBinding(shader.Id, block, 0);
Gl.BindBufferBase(Gl.UniformBuffer, 0, data);

// on every frame
Gl.BindBuffer(Gl.UniformBuffer, data);
Gl.BufferData(Gl.UniformBuffer, values, Gl.DynamicDraw);
```

The `Gl` functions are requested from raylib with `Rlgl.GetProcAddress`, because raylib has already created the context:

```csharp title="Viewer/Gl.cs"
using System.Runtime.InteropServices;
using Raylib_cs;

// The few OpenGL functions that raylib does not wrap. raylib already created the context;
// we only ask it where those functions live.
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

## A complete viewer

This is the `Program.cs` of the tutorial: it opens the window, loads the shader you name, hands over the width, the height and the seconds, and draws it on a rectangle. If `pez.png` exists, it hands it over as a texture.

```csharp title="Viewer/Program.cs"
using Raylib_cs;

string name = args.Length > 0 ? args[0] : "Gradient";
// Shaders that declare only the clock (a Clock with Seconds) read the seconds first; the others read width, height and seconds.
bool clockOnly = name is "Plasma" or "Underwater";

Raylib.SetConfigFlags(ConfigFlags.ResizableWindow);
Raylib.InitWindow(800, 450, name);

// The two stages of the shader, as the compiler wrote them.
string folder = "MyShaders/out/MyShaders";
Shader shader = Raylib.LoadShaderFromMemory(
    File.ReadAllText($"{folder}/{name}.Vertex.glsl"),
    File.ReadAllText($"{folder}/{name}.Fragment.glsl"));

// The uniform block (width, height, seconds) goes at address 0.
uint data = Gl.GenBuffer();
int blocks = Gl.GetProgram(shader.Id, Gl.ActiveUniformBlocks);
for (uint block = 0; block < blocks; block++)
{
    Gl.UniformBlockBinding(shader.Id, block, 0);
}
Gl.BindBufferBase(Gl.UniformBuffer, 0, data);

// The photo for shaders that declare a texture. If the file does not exist, the texture is white.
Texture2D photo = File.Exists("pez.png") ? Raylib.LoadTexture("pez.png") : default;

while (!Raylib.WindowShouldClose())
{
    // If your shader declares this data, the viewer hands it over.
    float seconds = (float)Raylib.GetTime();
    float[] values = clockOnly ? [seconds, 0f, 0f, 0f] : [Raylib.GetScreenWidth(), Raylib.GetScreenHeight(), seconds, 0f];
    Gl.BindBuffer(Gl.UniformBuffer, data);
    Gl.BufferData(Gl.UniformBuffer, values, Gl.DynamicDraw);

    Raylib.BeginDrawing();
    Raylib.ClearBackground(Color.Black);
    Raylib.BeginShaderMode(shader);

    // The rectangle: four corners with their Uv. Positions go from -1 to 1.
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

## Inside a game

A Yotsuba Shader shader is a raylib `Shader` like any other. Draw what you want between `BeginShaderMode` and `EndShaderMode`:

```csharp
Raylib.BeginShaderMode(shader);
Raylib.DrawTexture(sprite, 100, 100, Color.White);
Raylib.EndShaderMode();
```

The shader of the tutorial writes the position without transforming it, so it suits full-screen passes. To draw sprites, declare raylib's matrix as a uniform in your shader and multiply it by the position.

## If something fails

| What you see | What it means | What to do |
| --- | --- | --- |
| `Could not find file '.../Gradient.Vertex.glsl'` | The shader was not compiled, or the program runs from another folder. | Run `compile` and launch the viewer from the folder that contains `MyShaders`. |
| The window is black and raylib's console shows a shader error | The text is not GLSL 3.30, or a variable between the stages does not match. | Compile with `--target glsl:330`, not another version. |
| `NullReferenceException` when loading the `Gl` functions | `GetProcAddress` was called before `InitWindow`. | Create the window first: the OpenGL context is born with it. |
| The shader does not see the time or the size | The block is not at address 0. | Call `UniformBlockBinding` with address 0 for every block, as above. |
| A shader with a photo comes out black | raylib did not read the image. | Use a PNG: `pez.png`. |

---
title: El comando compile
summary: Compila los shaders de un proyecto en archivos separados, uno por formato y etapa.
order: 6
---

`compile` lee un proyecto C#, encuentra cada clase que tiene métodos marcados con `[ShaderStage]` y escribe cada shader como archivos separados dentro de una carpeta. Úsalo cuando lo que carga los shaders no es C# (un engine, una pipeline de build, una herramienta), o cuando quieres abrir los archivos y leerlos.

```bash
dotnet yotsuba compile MyShaders/MyShaders.csproj --target glsl --target spirv --output out
```

## Sintaxis

```text
yotsuba compile <proyecto.csproj> --target <destino> [--target <destino> ...] [--output <carpeta>]
```

| Argumento | Obligatorio | Significado |
| --- | --- | --- |
| `<proyecto.csproj>` | Sí | El proyecto a compilar. Solo un proyecto por llamada. |
| `--target <destino>` | Sí, al menos uno | El formato a generar. Repítelo para pedir varios. Mira la tabla de abajo. |
| `--output <carpeta>` | No | Dónde van los archivos. La ruta se cuenta desde la carpeta del `.csproj`, no desde donde ejecutas el comando. Por defecto: `artifacts`. |

`dotnet yotsuba` es como se llama la herramienta después de `dotnet tool install YotsubaShader.Compiler.CLI` en una carpeta con manifiesto de herramientas. El mismo programa se publica como ejecutable independiente (`YotsubaShader.Compiler.CLI` en Linux y macOS, `YotsubaShader.Compiler.CLI.exe` en Windows), donde el comando es `yotsuba`.

## Qué hace

1. Abre el `.csproj` con MSBuild y compila el C# del proyecto.
2. Si el proyecto tiene un error de C#, imprime todos los errores y termina con código de salida `1`. No se escribe ningún shader.
3. Encuentra las clases con métodos `[ShaderStage]` y compila cada una a la representación intermedia compartida.
4. Para cada shader y cada `--target`, escribe los archivos que se describen abajo.
5. Los destinos de plugin (`monogame`, `kni`, `fna`, `godot`) se cargan después de los incluidos, instalando antes el plugin si falta. Mira [Plugins](plugins.md).

## Destinos

| `--target` | Alias | Genera | Extensión | Archivos por shader |
| --- | --- | --- | --- | --- |
| `spirv` | `spv` | SPIR-V (Vulkan) | `.spv` | Uno, con todas las etapas dentro |
| `glsl` | | GLSL (OpenGL) | `.glsl` | Uno por etapa |
| `gles` | `glsles` | GLSL ES (móvil y web) | `.gles` | Uno por etapa |
| `hlsl` | | HLSL (DirectX) | `.hlsl` | Uno por etapa |
| `msl` | `metal` | Metal Shading Language | `.msl` | Uno por etapa |
| `cpp` | | C++ | `.cpp` | Uno por etapa |
| `monogame` | `mgfx` | Efecto de MonoGame (plugin) | `.mgfx` | Uno por plataforma |
| `kni` | `kni-webgl` | Efecto de KNI (plugin) | `.knifx` | Uno |
| `fna` | | Efecto de FNA (plugin) | `.fxb` | Uno |
| `godot` | `gdshader` | Shader de Godot (plugin) | `.gdshader` | Uno por tipo |

Un nombre que no está en la tabla se toma como nombre de plugin. Si ningún plugin se llama así, la CLI avisa de que no existe y lista los que sí.

## Dónde quedan los archivos

La estructura de carpetas sigue el `namespace` de tus clases. Para una clase `MyShaders.Gradient` con etapa vertex y fragment:

```text
MyShaders/out/MyShaders/
├── Gradient.Fragment.glsl
├── Gradient.Vertex.glsl
└── Gradient.spv
```

- Una clase en `Game.Effects` escribe en `out/Game/Effects/`.
- Los formatos de texto escriben un archivo por etapa: `<Clase>.<Etapa><extensión>`, con `Vertex`, `Fragment` o `Compute` como etapa.
- SPIR-V escribe `<Clase>.spv`.
- Un plugin con opciones escribe un archivo por opción, con la opción en minúsculas antes de la extensión: `Gradient.desktopgl.mgfx`, `Gradient.spatial.gdshader`. Un plugin sin opciones escribe `<Clase><extensión>`.

## Códigos de salida y errores

| Código | Cuándo |
| --- | --- |
| `0` | Se escribió todo. |
| `1` | El proyecto tiene errores de C#, o falló un archivo o un plugin. Los demás archivos sí se escriben. El mensaje nombra la clase y la extensión que falló. |
| `2` | Los argumentos están mal: falta `--target`, falta el proyecto, una opción desconocida, un segundo proyecto o un comando desconocido. |

La CLI imprime sus mensajes en español. La lista completa de mensajes está en el [capítulo de Get Started sobre la CLI](../get-started/cli.md).

## Ejemplos

Todos los formatos de texto a la vez:

```bash
dotnet yotsuba compile Game.Graphics/Game.Graphics.csproj \
  --target glsl --target gles --target hlsl --target msl \
  --output build/shaders
```

SPIR-V más los shaders de Godot, dentro de un script de build:

```bash
dotnet yotsuba compile Shaders/Shaders.csproj --target spirv --target godot --output ../Game/shaders
```

Cuando el programa que usa los shaders está escrito en C#, [`add`](add.md) suele convenir más: deja el resultado dentro del proyecto como métodos, y el compilador de C# comprueba los nombres por ti.

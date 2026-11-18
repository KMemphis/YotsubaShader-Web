---
title: Prepara tu proyecto
summary: Instala lo necesario y crea el proyecto donde vivirán tus shaders.
order: 3
---

En este capítulo no vas a escribir ningún shader todavía. Vas a dejar lista la carpeta de trabajo, para que en los capítulos siguientes solo tengas que preocuparte por el código.

Todo el tutorial lo vas a hacer en una librería de C# que no depende de ningún Game Engine. No usa MonoGame, ni Unity, ni Stride, ni ningún otro. Los shaders que escribas ahí sirven para todos, porque el Game Engine se elige al final, cuando compilas.

Cuando termines el tutorial, esa misma librería la vas a poder usar en tu Game Engine sin cambiarle una línea. En el último capítulo, [¿Y ahora qué?](next-steps.md), hay un botón por cada Game Engine con los pasos para conectarla.

## Lo que necesitas

- **El SDK de .NET 10 o más nuevo.** Para saber cuál tienes, abre una terminal y escribe `dotnet --version`. Si te sale un número menor que 10, descarga el nuevo desde [dotnet.microsoft.com](https://dotnet.microsoft.com/download).

  Ojo con un detalle: el SDK es el programa que compila, y no tiene por qué ser de la misma versión que tu proyecto. Por eso más abajo creamos los proyectos con `-f net8.0`: el SDK 10 sabe compilarlos igual. Si tu juego usa otra versión, no pasa nada.
- **Un editor de C#.** El que ya uses: Rider, Visual Studio o Visual Studio Code.

Por eso no necesitas instalar ningún Game Engine para seguir el tutorial.

## Cómo va a quedar la carpeta

Al terminar este capítulo tendrás esto:

```text
Tutorial/
├── MisShaders/       una librería de C# normal: aquí escribes los shaders
└── Probar/           un programa de consola para usar los shaders ya compilados
```

Mira que `MisShaders` es una librería de C# como cualquier otra. Eso es lo bueno de escribir shaders en C#: un proyecto de shaders es simplemente un proyecto de .NET. Esta es la librería que después vas a llevar a tu Game Engine.

`Probar` solo existe para ver el resultado mientras aprendes. Cuando uses los shaders en tu juego, su lugar lo ocupa el proyecto de tu juego.

## 1. Crea la carpeta e instala el compilador

```bash
mkdir Tutorial
```

```bash
cd Tutorial
```

```bash
dotnet new tool-manifest
```

```bash
dotnet tool install YotsubaShader.Compiler.CLI
```

El primer comando crea un archivo pequeño, `.config/dotnet-tools.json`, donde .NET anota qué herramientas usa esta carpeta. El segundo descarga el compilador de Yotsuba Shader desde NuGet y lo anota ahí. Desde ahora, en esta carpeta, al compilador se le llama con `dotnet yotsuba`.

## 2. Crea el proyecto de shaders

Desde la carpeta `Tutorial`:

```bash
dotnet new classlib -n MisShaders -f net8.0
```

La plantilla crea un archivo `Class1.cs` que no vas a usar. Bórralo.

Ahora dile al proyecto que va a usar Yotsuba Shader. Es una sola referencia:

```bash
dotnet add MisShaders package YotsubaShader.GlslSyntax
```

Con esa línea te llegan dos cosas:

| Paquete | Qué te da |
| --- | --- |
| `YotsubaShader.GlslSyntax` | Los nombres con los que vas a escribir: `vec4`, `[location]`, `sin`, `texture`... |
| `YotsubaShader.Language` | Lo básico: `[ShaderStage]`, con lo que marcas qué método es un shader. |

`YotsubaShader.Language` no la añades tú. `GlslSyntax` ya la usa por dentro, y cuando un paquete usa otro, NuGet te trae los dos.

> [!NOTE]
> `GlslSyntax` es uno de los cinco "estilos" que trae Yotsuba Shader. Usa los mismos nombres que GLSL, el lenguaje de shaders que más vas a encontrar en tutoriales de internet. Si vienes de HLSL, Metal, Vulkan o WGSL, hay un estilo para cada uno, y el resultado es el mismo. Lo verás en [Otros estilos de escritura](how-it-works.md). En este tutorial usamos GLSL de principio a fin.

## 3. Crea el programa para probar

```bash
dotnet new console -n Probar -f net8.0
```

```bash
dotnet add Probar reference MisShaders/MisShaders.csproj
```

`Probar` es un programa de consola cualquiera. Hace el papel de "tu juego" o "tu aplicación": el programa que va a pedir los shaders ya compilados. Lo usaremos para ver con nuestros propios ojos lo que produce el compilador.

## 4. Comprueba que todo compila

```bash
dotnet build Probar
```

Si al final ves `Build succeeded`, ya está todo listo. Aún no hay ningún shader, pero las referencias están bien puestas.

## Un atajo para llamar al compilador

El compilador de Yotsuba Shader es un programa de terminal (una CLI). Lo vas a ejecutar así, desde la carpeta `Tutorial`:

```bash
dotnet yotsuba add MisShaders/MisShaders.csproj --target spirv
```

No lo ejecutes todavía. Solo fíjate en sus partes:

| Parte | Qué significa |
| --- | --- |
| `dotnet yotsuba` | "Ejecuta el compilador". `yotsuba` es el nombre de la herramienta que acabas de instalar. Todo lo que va después son las órdenes para él. |
| `add` | El comando. `add` significa: "compila mis shaders y **añade** el resultado a mi proyecto". |
| `MisShaders/MisShaders.csproj` | El proyecto donde están los shaders. |
| `--target spirv` | Un formato de salida. Hoy la CLI siempre pide al menos uno, aunque `add` te entrega todos los formatos. |

En el siguiente capítulo lo vas a usar de verdad.

Siguiente: [Shader 1: un atardecer](first-shader.md).

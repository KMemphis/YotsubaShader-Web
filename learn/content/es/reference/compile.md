---
title: El comando compile
summary: Compila los shaders de un proyecto en archivos separados, uno por formato y etapa.
order: 6
---

`compile` lee un proyecto C#, encuentra cada clase que tiene métodos marcados con `[ShaderStage]` y escribe cada shader como archivos separados dentro de una carpeta. Úsalo cuando lo que carga los shaders no es C# (un engine, una pipeline de build, una herramienta), o cuando quieres abrir los archivos y leerlos.

```bash
yotsuba compile MyShaders/MyShaders.csproj --target glsl --target spirv --output out
```

## Sintaxis

```text
yotsuba compile <proyecto.csproj> --target <destino>[:<versión>] [--target <destino>[:<versión>] ...] [--output <carpeta>]
```

| Argumento | Obligatorio | Significado |
| --- | --- | --- |
| `<proyecto.csproj>` | Sí | El proyecto a compilar. Solo un proyecto por llamada. |
| `--target <destino>[:<versión>]` | Sí, al menos uno | El formato a generar, si quieres con la versión de su lenguaje después de dos puntos (`glsl:430`). Repítelo para pedir varios. Mira las tablas de abajo. |
| `--output <carpeta>` | No | Dónde van los archivos. La ruta se cuenta desde la carpeta del `.csproj`, no desde donde ejecutas el comando. Por defecto: `artifacts`. |

`yotsuba` es como se llama la herramienta después de `dotnet tool install --global YotsubaShader.Compiler.CLI`. Si prefieres fijar su versión en el proyecto (por ejemplo en CI), instálala como herramienta local con `dotnet new tool-manifest` y `dotnet tool install YotsubaShader.Compiler.CLI`, y llámala con `dotnet tool run yotsuba`. El mismo programa se publica como ejecutable independiente (`YotsubaShader.Compiler.CLI` en Linux y macOS, `YotsubaShader.Compiler.CLI.exe` en Windows), donde el comando es `yotsuba`.

## Qué hace

1. Abre el `.csproj` con MSBuild y compila el C# del proyecto. Si el proyecto nunca se restauró, antes ejecuta `dotnet restore` una vez.
2. Si el proyecto tiene un error de C#, imprime todos los errores y termina con código de salida `1`. No se escribe ningún shader.
3. Encuentra las clases con métodos `[ShaderStage]` y compila cada una a la representación intermedia compartida.
4. Para cada shader y cada `--target`, escribe los archivos que se describen abajo. Una etapa que el lenguaje de un destino no puede expresar (por ejemplo `double` en GLSL ES) se informa, y los demás archivos se escriben igual.
5. Los destinos de plugin (`monogame`, `kni`, `fna`, `godot`) se cargan después de los incluidos, instalando antes el plugin si falta. Mira [Plugins](plugins.md).

## Destinos

| `--target` | Alias | Genera | Extensión | Archivos por shader |
| --- | --- | --- | --- | --- |
| `spirv` | `spv` | SPIR-V (Vulkan) | `.spv` | Uno, con todas las etapas dentro |
| `glsl` | | GLSL (OpenGL) | `.glsl` | Uno por etapa |
| `gles` | `glsles` | GLSL ES (móvil y web) | `.gles` | Uno por etapa |
| `hlsl` | | HLSL (DirectX) | `.hlsl` | Uno por etapa |
| `msl` | `metal` | Metal Shading Language | `.msl` | Uno por etapa |
| `wgsl` | | WGSL (WebGPU) | `.wgsl` | Uno, con todas las etapas dentro |
| `cpp` | | C++ | `.cpp` | Uno por etapa |
| `monogame` | `mgfx` | Efecto de MonoGame (plugin) | `.mgfx` | Uno por plataforma |
| `kni` | `kni-webgl` | Efecto de KNI (plugin) | `.knifx` | Uno |
| `fna` | | Efecto de FNA (plugin) | `.fxb` | Uno |
| `godot` | `gdshader` | Shader de Godot (plugin) | `.gdshader` | Uno por tipo |

Un nombre que no está en la tabla se toma como nombre de plugin. Si ningún plugin se llama así, la CLI avisa de que no existe y lista los que sí.

## Versiones del lenguaje

Añade dos puntos y una versión a un destino para elegir la versión del lenguaje que escribe. Sin versión, el destino usa la suya por defecto.

| Destino | Versiones | Por defecto |
| --- | --- | --- |
| `spirv` | `1.3` (Vulkan 1.1), `1.4`, `1.5` (Vulkan 1.2), `1.6` (Vulkan 1.3) | `1.6` |
| `glsl` | `110`, `120`, `130`, `140`, `150`, `330`, `400`, `410`, `420`, `430`, `440`, `450`, `460`; también escrito como `4.3` | `450` |
| `gles` | `100`, `300`, `310`, `320`; también escrito como `3.0` | `310` |
| `msl` | `1.0` a `4.x`, como `mayor.menor` o `mayor.menor.parche` (`2.4`, `3.1`) | `1.2` |
| `hlsl` | Shader model `3.0`, `4.0`, `4.1`, `5.0`, `5.1`, `6.0` a `6.8`; también escrito como `50`, `60` | `5.0` |

`wgsl`, `cpp` y los destinos de plugin no llevan versión.

```bash
yotsuba compile MisShaders/MisShaders.csproj --target spirv:1.3 --target glsl:410 --target gles:300
```

- Una versión que no está en la tabla detiene el comando con código `2` y lista las que sí:

  ```text
  SPIR-V '1.2' no está soportado. Versiones: 1.3 (Vulkan 1.1), 1.4, 1.5 (Vulkan 1.2) y 1.6 (Vulkan 1.3).
  ```

- SPIR-V siempre se compila como 1.6. Para `1.3` a `1.5` el módulo se reescribe para drivers más antiguos, y las copias de structs entre un buffer y una variable (una instrucción de 1.4) se escriben con instrucciones de 1.0. Si el shader usa otra cosa que no existe en la versión que pediste, ese archivo falla con el motivo.
- MSL se queda en 1.2 si no pides otra versión. Un shader que necesita algo más nuevo (`PrimitiveId` necesita 2.2, por ejemplo) falla con el motivo hasta que pides esa versión.
- GLSL ES `300` no tiene compute shaders: una etapa compute falla y las demás etapas se escriben.
- Puedes pedir varias versiones de un destino en el mismo comando; entonces la versión va en el nombre del archivo (mira abajo). Pedir un destino con versión y sin ella es un error (código `2`).

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
- SPIR-V escribe `<Clase>.spv`, y WGSL escribe `<Clase>.wgsl`, con todas las etapas en un archivo.
- Con varias versiones de un destino, la versión va antes de la extensión:

  ```bash
  yotsuba compile MisShaders/MisShaders.csproj --target glsl:330 --target glsl:430 --output out
  ```

  ```text
  MisShaders/out/MisShaders/
  ├── Plasma.Fragment.330.glsl
  ├── Plasma.Fragment.430.glsl
  ├── Plasma.Vertex.330.glsl
  └── Plasma.Vertex.430.glsl
  ```

- Un plugin con opciones escribe un archivo por opción, con la opción en minúsculas antes de la extensión: `Gradient.desktopgl.mgfx`, `Gradient.spatial.gdshader`. Un plugin sin opciones escribe `<Clase><extensión>`.

## Códigos de salida y errores

| Código | Cuándo |
| --- | --- |
| `0` | Se escribió todo. |
| `1` | El proyecto tiene errores de C#, o falló un archivo o un plugin. Los demás archivos sí se escriben. El mensaje nombra la clase, la etapa y el destino que falló. |
| `2` | Los argumentos están mal: falta `--target`, falta el proyecto, el proyecto no existe, una versión que no existe, una opción desconocida, un segundo proyecto o un comando desconocido. |

Un archivo que falla nombra su clase, su etapa y su destino, con el motivo:

```text
MisShaders.Plasma.Vertex (gles): FP64 not supported in ES profile.
```

Ese archivo no se escribe, y si una ejecución anterior lo había escrito, se borra: la carpeta de salida nunca guarda una versión vieja junto a las nuevas.

La CLI imprime sus mensajes en español. La lista completa de mensajes está en el [capítulo de Get Started sobre la CLI](../get-started/cli.md).

## Ejemplos

Todos los formatos de texto a la vez:

```bash
yotsuba compile Game.Graphics/Game.Graphics.csproj \
  --target glsl --target gles --target hlsl --target msl \
  --output build/shaders
```

Cada API gráfica en la versión que lee (Vulkan 1.1, OpenGL de macOS, WebGL 2 y WebGPU):

```bash
yotsuba compile Game.Graphics/Game.Graphics.csproj \
  --target spirv:1.3 --target glsl:410 --target gles:300 --target wgsl \
  --output build/shaders
```

SPIR-V más los shaders de Godot, dentro de un script de build:

```bash
yotsuba compile Shaders/Shaders.csproj --target spirv --target godot --output ../Game/shaders
```

Cuando el programa que usa los shaders está escrito en C#, [`add`](add.md) suele convenir más: deja el resultado dentro del proyecto como métodos, y el compilador de C# comprueba los nombres por ti.

---
title: Comandos de la CLI
summary: Todos los comandos de la herramienta yotsuba y lo que hace cada uno.
order: 6
---

Todos los comandos de la herramienta `yotsuba` (el paquete `YotsubaShader.Compiler.CLI`) y lo que hace cada uno. Para todas las opciones, destinos y códigos de salida de un comando, sigue el enlace al final de cada entrada.

```bash
dotnet new tool-manifest
dotnet tool install YotsubaShader.Compiler.CLI
```

Instalada como herramienta local, cada comando empieza con `dotnet yotsuba`. Instalada de forma global (`dotnet tool install --global YotsubaShader.Compiler.CLI`), o con el ejecutable independiente de un release, empieza con `yotsuba`.

## compile

```text
yotsuba compile <proyecto.csproj> --target <destino>[:<versión>] [--target <destino>[:<versión>] ...] [--output <carpeta>]
```

Compila el proyecto de C#, busca cada clase con métodos `[ShaderStage]` y escribe cada shader como archivos en una carpeta: un archivo por etapa para los formatos de texto, un `.spv` por shader para SPIR-V, un `.wgsl` por shader para WGSL y los archivos del engine para los destinos de plugin. La carpeta es `artifacts` junto al `.csproj`, salvo que `--output` diga otra.

| `--target` | Escribe | Versiones (por defecto) |
| --- | --- | --- |
| `spirv` (`spv`) | `<Clase>.spv` | `1.3` a `1.6` (`1.6`) |
| `glsl` | `<Clase>.<Etapa>.glsl` | `110` a `460` (`450`) |
| `gles` (`glsles`) | `<Clase>.<Etapa>.gles` | `100`, `300`, `310`, `320` (`310`) |
| `hlsl` | `<Clase>.<Etapa>.hlsl` | shader model `3.0` a `6.8` (`5.0`) |
| `msl` (`metal`) | `<Clase>.<Etapa>.msl` | `1.0` a `4.x` (`1.2`) |
| `wgsl` | `<Clase>.wgsl` | ninguna |
| `cpp` | `<Clase>.<Etapa>.cpp` | ninguna |
| `monogame`, `kni`, `fna`, `godot` | los archivos del engine (plugins) | ninguna |

La versión va después de dos puntos: `--target glsl:430`. Un archivo que un lenguaje no puede expresar (por ejemplo `double` en GLSL ES) se informa con su clase, su etapa y su destino; los demás archivos se escriben y el código de salida es `1`.

```bash
dotnet yotsuba compile MisShaders/MisShaders.csproj --target spirv --target glsl:430 --target wgsl --output out
```

Detalles: [El comando compile](../reference/compile.md) y [Versiones del lenguaje](../reference/compile.md#versiones-del-lenguaje).

## add

```text
yotsuba add <proyecto.csproj> --target <destino> [--target <destino> ...]
```

Compila el proyecto de C# y escribe `YotsubaShader.g.cs` junto al `.csproj`. El archivo agrega métodos de extensión a cada clase shader, así el programa obtiene el resultado desde C#: `ToSpirV()`, `ToGlsl(stage)`, `ToGlslEs(stage)`, `ToHlsl(stage)`, `ToMSL(stage)`, `ToWgsl()` con `--target wgsl`, y el método de cada destino de plugin, como `ToMGFX(platform)` o `ToGodotShader(type)`. Una versión en `--target` (`gles:300`) es la versión que devuelve ese método. El archivo solo se reescribe cuando cambia su contenido, y un `YotsubaShader.g.cs` viejo que ya no compila (una clase shader renombrada) no lo detiene.

```bash
dotnet yotsuba add MisShaders/MisShaders.csproj --target spirv --target monogame
```

Detalles: [El comando add](../reference/add.md).

## plugin list

```text
yotsuba plugin list
```

Muestra los plugins del catálogo, si cada uno está instalado y en qué versión.

## plugin install

```text
yotsuba plugin install <nombre>
```

Descarga un plugin (`monogame`, `kni`, `fna`, `godot`) antes de que un comando lo necesite, en la versión más nueva compatible con la CLI: la misma versión mayor y menor, nunca una más nueva. Un `--target` de un plugin que falta lo instala solo, así que este comando es opcional.

```bash
dotnet yotsuba plugin install godot
```

## plugin update

```text
yotsuba plugin update [nombre]
```

Con un nombre, trae la versión más nueva de ese plugin que es compatible con la CLI. Sin nombre, actualiza todos los plugins instalados.

## plugin remove

```text
yotsuba plugin remove <nombre>
```

Borra un plugin instalado.

Detalles de los cuatro comandos de plugins: [Plugins](../reference/plugins.md).

## lsp

```text
yotsuba lsp <proyecto.csproj>
```

Inicia un servidor de lenguaje por la entrada y la salida estándar, para un editor. Abre el proyecto con Roslyn y, mientras escribes, publica los errores de C# y los diagnósticos de los analizadores de Yotsuba Shader (`YS....`). También responde a autocompletado, información al pasar el ratón y acciones de código. Lo inicia el editor; no se ejecuta a mano.

## version

```text
yotsuba --version
```

Imprime la versión de la CLI, por ejemplo `0.9.0`. Los plugins que instala tienen la misma versión mayor y menor.

## help

```text
yotsuba --help
yotsuba compile --help
yotsuba add --help
```

Muestra el uso de cada comando y la lista de destinos. `-h` y `help` hacen lo mismo.

## Variables de entorno

| Variable | Qué hace |
| --- | --- |
| `YOTSUBA_HOME` | Carpeta de los plugins y de la copia del catálogo. Por defecto: `~/.yotsuba`. |
| `YOTSUBA_PLUGINS_URL` | Catálogo de plugins, como URL o como ruta de archivo. |
| `YOTSUBA_NUGET_SOURCE` | Feed de NuGet (v3 flat container) del que se descargan los plugins. |
| `YOTSUBA_NAGA_PATH` | Biblioteca nativa de naga para `--target wgsl`, cuando no está junto a la CLI. |
| `YOTSUBA_DEBUG` | Ponla en `1` para imprimir la pila completa de un error interno y cada aviso de MSBuild. |

> [!NOTE]
> La CLI escribe sus mensajes en español. La lista de mensajes está en el [capítulo de Get Started sobre la CLI](../get-started/cli.md).

---
title: La CLI
summary: Los comandos del compilador (add, compile y plugin), los plugins de cada motor, y cómo hacer que add se ejecute solo.
order: 18
---

Durante todo el tutorial usaste un solo comando, `add`. En este capítulo ves la CLI completa: qué otro comando tiene, qué formatos puede generar y cómo dejar de escribir el comando a mano.

## Los dos comandos

La CLI tiene dos comandos. Los dos compilan lo mismo. Lo que cambia es **dónde dejan el resultado**:

| Comando | Dónde deja el resultado | Cuándo te conviene |
| --- | --- | --- |
| `add` | En un archivo de C#, `YotsubaShader.g.cs`, dentro de tu proyecto. | Cuando el programa que usa los shaders está hecho en C#. Es lo normal. |
| `compile` | En archivos sueltos (`.glsl`, `.hlsl`, `.spv`...) dentro de una carpeta. | Cuando los shaders los va a cargar algo que no es C#, o cuando quieres abrir los archivos y mirarlos. |

## `add`: el resultado dentro de tu proyecto

Ya lo conoces:

```bash
dotnet yotsuba add MisShaders/MisShaders.csproj --target spirv
```

Lo que hace, paso a paso:

1. Abre tu `.csproj` y lee todos sus archivos de C#.
2. Comprueba que el proyecto compila. Si hay un error de C#, lo muestra y se detiene.
3. Busca todas las clases que tengan métodos con `[ShaderStage]`.
4. Compila cada una.
5. Escribe `YotsubaShader.g.cs` junto a tu `.csproj`.

Por cada clase de shader, ese archivo añade estos métodos:

| Método | Devuelve | Para |
| --- | --- | --- |
| `ToSpirV()` | `byte[]` | Vulkan |
| `ToGlsl(Stage)` | `string` | OpenGL |
| `ToGlslEs(Stage)` | `string` | OpenGL ES y WebGL |
| `ToHlsl(Stage)` | `string` | DirectX |
| `ToMSL(Stage)` | `string` | Metal |

Los que piden un `Stage` devuelven una etapa cada vez: `Stage.Vertex` o `Stage.Fragment`.

Lo bueno de `add` es que el compilador de C# te cuida. Si renombras la clase `Degradado`, tu programa deja de compilar hasta que lo arregles. Con archivos sueltos, un nombre mal escrito solo lo descubres al ejecutar.

Los cinco primeros vienen con la CLI. Los métodos de los motores vienen de **plugins**, y cada uno se pide con su propio `--target`:

| Método | Devuelve | Para | Se pide con |
| --- | --- | --- | --- |
| `ToMGFX(MonoGamePlatform)` | `byte[]` | MonoGame | `--target monogame` |
| `ToKNIWebGL_FX()` | `byte[]` | KNI | `--target kni` |
| `ToFNA_FX()` | `byte[]` | FNA | `--target fna` |
| `ToGodotShader(GodotShaderType)` | `string` | Godot | `--target godot` |

Por ejemplo, para usar tus shaders en {{engine}}:

```bash
dotnet yotsuba add MisShaders/MisShaders.csproj --target spirv --target {{plugin}}
```

> [!NOTE]
> La CLI exige al menos un `--target` también con `add`. `spirv` es el que usa el tutorial, y los métodos de la primera tabla se generan sin importar cuál elijas.

### Plugins

Un plugin es un paquete NuGet pequeño que le enseña a la CLI un formato más. La CLI lo descarga la primera vez que lo pides con `--target`, y lo guarda en una carpeta de tu usuario. Estos son los comandos para manejarlos:

| Comando | Qué hace |
| --- | --- |
| `dotnet yotsuba plugin list` | Muestra los plugins que existen y cuáles tienes instalados. |
| `dotnet yotsuba plugin install monogame` | Descarga un plugin antes de necesitarlo. |
| `dotnet yotsuba plugin update monogame` | Trae su última versión. Sin nombre, actualiza todos los instalados. |
| `dotnet yotsuba plugin remove monogame` | Lo borra. |

El plugin lo usa solo la CLI, al compilar. Tu juego no lo referencia. Las [guías de MonoGame, KNI y FNA](../engines/index.md) muestran el camino completo, paso a paso.

## `compile`: el resultado en archivos

Con `compile` eliges los formatos que quieres, repitiendo `--target`, y la carpeta donde dejarlos, con `--output`:

```bash
dotnet yotsuba compile MisShaders/MisShaders.csproj --target glsl --target hlsl --target msl --target spirv --output salida
```

Con los dos primeros shaders del tutorial en el proyecto, esto es lo que aparece:

```text
MisShaders/salida/MisShaders/
├── Degradado.Fragment.glsl
├── Degradado.Fragment.hlsl
├── Degradado.Fragment.msl
├── Degradado.Vertex.glsl
├── Degradado.Vertex.hlsl
├── Degradado.Vertex.msl
├── Degradado.spv
├── Mandelbrot.Fragment.glsl
├── Mandelbrot.Fragment.hlsl
├── Mandelbrot.Fragment.msl
├── Mandelbrot.Vertex.glsl
├── Mandelbrot.Vertex.hlsl
├── Mandelbrot.Vertex.msl
└── Mandelbrot.spv
```

Cómo leer esos nombres:

- La carpeta `MisShaders` de dentro es el `namespace` de tus clases. Si la clase fuera `Juego.Efectos.Degradado`, el archivo estaría en `salida/Juego/Efectos/`.
- Los formatos de texto generan un archivo por etapa: `Degradado.Vertex.glsl` y `Degradado.Fragment.glsl`.
- SPIR-V genera un solo archivo por shader, con todas las etapas dentro.

Dos detalles de `--output`:

- La ruta se cuenta desde la carpeta del `.csproj`, no desde donde ejecutas el comando. Por eso `salida` acabó dentro de `MisShaders`.
- Si no pones `--output`, la carpeta se llama `artifacts`.

### Los formatos que puedes pedir con `--target`

| `--target` | Qué genera | Extensión |
| --- | --- | --- |
| `spirv` (o `spv`) | SPIR-V, para Vulkan | `.spv` |
| `glsl` | GLSL, para OpenGL | `.glsl` |
| `gles` (o `glsles`) | GLSL ES, para móviles y web | `.gles` |
| `hlsl` | HLSL, para DirectX | `.hlsl` |
| `msl` (o `metal`) | Metal, para Apple | `.msl` |
| `cpp` | C++ | `.cpp` |
| `monogame` (o `mgfx`) | Efectos de MonoGame, uno por plataforma. Necesita el plugin `monogame`. | `.mgfx` |
| `kni` (o `kni-webgl`) | Efecto de KNI. Necesita el plugin `kni`. | `.knifx` |
| `fna` | Efecto de FNA. Necesita el plugin `fna`. | `.fxb` |
| `godot` (o `gdshader`) | Shaders de Godot, uno por tipo (`spatial`, `canvas_item`). Necesita el plugin `godot`. | `.gdshader` |

## Haz que `add` se ejecute solo

Escribir el comando después de cada cambio cansa, y si se te olvida, tu programa usa un shader viejo. Puedes pedirle a .NET que ejecute `add` cada vez que compila el proyecto.

Abre `MisShaders/MisShaders.csproj` y añade el bloque `<Target>`. El archivo completo queda así:

```xml title="MisShaders/MisShaders.csproj"
<Project Sdk="Microsoft.NET.Sdk">

  <ItemGroup>
    <PackageReference Include="YotsubaShader.GlslSyntax" Version="0.8.1" />
  </ItemGroup>

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>

  <Target Name="CompilarShaders" BeforeTargets="CoreCompile" Condition="'$(DesignTimeBuild)' != 'true'">
    <Exec Command="dotnet yotsuba add &quot;$(MSBuildProjectFullPath)&quot; --target spirv --target {{plugin}}" />
    <ItemGroup>
      <Compile Remove="YotsubaShader.g.cs" />
      <Compile Include="YotsubaShader.g.cs" />
    </ItemGroup>
  </Target>

</Project>
```

Qué dice ese bloque:

- `BeforeTargets="CoreCompile"`: "ejecuta esto justo antes de compilar el C#". Así `YotsubaShader.g.cs` siempre está al día cuando se compila.
- `<Exec Command="...">`: el comando `add` de siempre. `$(MSBuildProjectFullPath)` es la ruta de este mismo `.csproj`, y `&quot;` son comillas, por si la ruta tiene espacios.
- Las dos líneas de `<Compile>` se aseguran de que el archivo recién generado entre en la compilación, incluso la primera vez, cuando todavía no existía.
- `Condition="'$(DesignTimeBuild)' != 'true'"` evita que se ejecute mientras el editor analiza el proyecto en segundo plano.

Desde ahora te basta con esto, y los shaders se compilan por el camino:

```bash
dotnet run --project Probar
```

Cambia un número en `Degradado.cs`, ejecuta ese comando, y el cambio ya sale en la consola.

## Cuando algo sale mal

Estos son los mensajes que más vas a ver, y lo que significan:

| Mensaje | Qué pasó | Cómo se arregla |
| --- | --- | --- |
| `Debes indicar al menos un --target.` | Faltó el formato. | Añade `--target spirv`. |
| `Falta el proyecto .csproj.` | No le dijiste qué proyecto compilar. | Pon la ruta del `.csproj` después del comando. |
| `Target desconocido 'x'.` | Ese formato no existe. | Usa uno de la tabla de formatos. |
| `Comando desconocido 'x'.` | Solo existen `add`, `compile` y `plugin`. | Revisa cómo lo escribiste. |
| Un error que empieza por `CS`, como `error CS0103` | Es un error de C# normal: tu proyecto no compila. | Arréglalo como cualquier error de C#. La CLI no sigue hasta que el proyecto compile. |
| `error CS0234` justo después de borrar o renombrar una clase de shader | `YotsubaShader.g.cs` todavía nombra la clase vieja, y `add` compila el proyecto antes de reescribirlo. | Borra `YotsubaShader.g.cs` y ejecuta `add` otra vez. |
| `... no hay código disponible para compilarlo en GPU.` | Llamaste a una función que no es tuya y que la GPU no conoce, por ejemplo `System.Math.Sqrt`. | Usa las funciones de `YotsubaShader.GlslSyntax.Methods.Math` o escribe la tuya. |
| `'new ...vec4()' sin constructor declarado no está soportado para vectores.` | Creaste un vector con `new vec4 { ... }`. | Usa `Crear.Vec4(...)`, el ayudante del primer shader. |

Si el error aparece nada más abrir el proyecto, antes de compilar ningún shader, ejecuta primero `dotnet build MisShaders`. La CLI necesita que el proyecto ya haya descargado sus dependencias.

## Lo que aprendiste

- `add` deja el resultado dentro de tu proyecto, como métodos de tus clases. `compile` lo deja en archivos.
- `--target` elige el formato y se puede repetir. `--output` elige la carpeta.
- MonoGame, KNI, FNA y Godot son plugins: los pides con `--target monogame`, `kni`, `fna` o `godot`, y la CLI los descarga la primera vez.
- Con un `<Target>` en el `.csproj`, `add` se ejecuta solo cada vez que compilas.

Siguiente: [Otros estilos de escritura](how-it-works.md).

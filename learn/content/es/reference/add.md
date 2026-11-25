---
title: El comando add
summary: Compila los shaders y los escribe dentro de tu proyecto como métodos de C#.
order: 7
---

`add` compila los shaders de un proyecto y escribe el resultado en un archivo C#, `YotsubaShader.g.cs`, dentro de ese mismo proyecto. Cada clase de shader recibe métodos de extensión que devuelven el shader compilado, así tu programa lo pide por nombre y el compilador de C# comprueba ese nombre.

```bash
yotsuba add MyShaders/MyShaders.csproj --target spirv
```

## Sintaxis

```text
yotsuba add <proyecto.csproj> --target <destino>[:<versión>] [--target <destino>[:<versión>] ...]
```

| Argumento | Obligatorio | Significado |
| --- | --- | --- |
| `<proyecto.csproj>` | Sí | El proyecto que contiene las clases de shader. El archivo se escribe a su lado. |
| `--target <destino>[:<versión>]` | Sí, al menos uno | Los destinos de plugin (`monogame`, `kni`, `fna`, `godot`) añaden sus propios métodos, y `wgsl` añade `ToWgsl()`. Los incluidos (`spirv`, `glsl`, `gles`, `hlsl`, `msl`) se aceptan, y los métodos de la primera tabla de abajo se generan siempre; con una versión (`gles:300`), ese método devuelve esa versión. Una versión por destino. |

## Qué hace

1. Abre el `.csproj` y compila su C#. Con un error de C# imprime los errores y termina con código de salida `1`. Si el proyecto nunca se restauró, antes ejecuta `dotnet restore` una vez. El `YotsubaShader.g.cs` anterior queda fuera de esta compilación (mira [Comportamiento que conviene conocer](#comportamiento-que-conviene-conocer)).
2. Encuentra cada clase con métodos `[ShaderStage]` y la compila.
3. Carga los plugins que nombra `--target` (instalándolos o actualizándolos si hace falta).
4. Escribe `YotsubaShader.g.cs` junto al `.csproj` e imprime `Archivo generado: <ruta>`. Si el contenido es igual al del archivo que ya está, no lo toca e imprime `Sin cambios: <ruta>`, así un proyecto sin cambios no se vuelve a compilar. Si un plugin que pediste no se pudo cargar, conserva el archivo anterior.

## Qué se genera

El archivo declara una `static class YotsubaShader_ShadersCompilations` en el namespace `YotsubaShader`, oculta del IntelliSense. Para cada clase de shader añade estos métodos de extensión:

| Método | Devuelve | Para |
| --- | --- | --- |
| `ToSpirV()` | `byte[]` | Vulkan |
| `ToGlsl(Stage)` | `string` | OpenGL |
| `ToGlslEs(Stage)` | `string` | OpenGL ES y WebGL |
| `ToHlsl(Stage)` | `string` | DirectX |
| `ToMSL(Stage)` | `string` | Metal |
| `ToWgsl()` | `string` | WebGPU. Solo con `--target wgsl`; devuelve el archivo entero, con todas las etapas |

Los métodos de texto reciben un `Stage` (`Stage.Vertex`, `Stage.Fragment` o `Stage.Compute`) y devuelven esa etapa. Lanzan `ArgumentOutOfRangeException` si el shader no tiene la etapa.

Sin versión en `--target`, cada método devuelve la versión por defecto de su lenguaje: SPIR-V 1.6, GLSL 450, GLSL ES 310, HLSL shader model 5.0 y MSL 1.2. Con `--target gles:300`, `ToGlslEs` devuelve GLSL ES 3.00, y lo mismo vale para `spirv`, `glsl`, `hlsl` y `msl`. Las versiones aceptadas están en [Versiones del lenguaje](compile.md#versiones-del-lenguaje).

Una etapa que un lenguaje no puede expresar (por ejemplo `double` en GLSL ES) no detiene el comando. Ese caso del método lanza `NotSupportedException` con el motivo, y `add` lo imprime:

```text
Aviso: MisShaders.Plasma.ToGlslEs(Fragment): FP64 not supported in ES profile.
```

Es solo un aviso, salvo que hayas pedido ese destino con `--target`: entonces es un error y el código de salida es `1`.

Cada plugin que pides añade un método más, y las opciones del plugin se vuelven un `enum` en el mismo namespace:

| Plugin | Método | Devuelve | Parámetro |
| --- | --- | --- | --- |
| `monogame` | `ToMGFX(MonoGamePlatform platform)` | `byte[]` | `DesktopGL`, `WindowsDX11`, `WindowsDirectX12`, `DesktopVulkan`, `iOS`, `Android`, `GL4` |
| `kni` | `ToKNIWebGL_FX()` | `byte[]` | ninguno |
| `fna` | `ToFNA_FX()` | `byte[]` | ninguno |
| `godot` | `ToGodotShader(GodotShaderType type)` | `string` | `Spatial`, `CanvasItem` |

Los shaders van incrustados en el archivo: SPIR-V como una cadena Base64 y los formatos de texto como literales de cadena crudos. En tiempo de ejecución no se lee nada del disco.

## Usar los métodos

Los métodos son métodos de extensión de tus propias clases de shader:

```csharp
using YotsubaShader;
using YotsubaShader.Language;

var gradient = new MyShaders.Gradient();

byte[] spirv = gradient.ToSpirV();
string vertex = gradient.ToGlsl(Stage.Vertex);
string fragment = gradient.ToGlsl(Stage.Fragment);
```

Con un plugin, por ejemplo `--target monogame`:

```csharp
byte[] effect = gradient.ToMGFX(MonoGamePlatform.DesktopGL);
```

Si renombras o borras la clase `Gradient`, tu programa deja de compilar hasta que arregles los lugares que la usan.

## Ejecutarlo en cada build

Escribir el comando después de cada cambio es fácil de olvidar. Añade un `<Target>` al `.csproj` del proyecto de shaders para que .NET ejecute `add` justo antes de compilar el C#:

```xml
<Target Name="CompileShaders" BeforeTargets="CoreCompile" Condition="'$(DesignTimeBuild)' != 'true'">
  <Exec Command="yotsuba add &quot;$(MSBuildProjectFullPath)&quot; --target spirv --target monogame" />
  <ItemGroup>
    <Compile Remove="YotsubaShader.g.cs" />
    <Compile Include="YotsubaShader.g.cs" />
  </ItemGroup>
</Target>
```

- `BeforeTargets="CoreCompile"` lo ejecuta justo antes de compilar el C#.
- Las dos líneas `<Compile>` añaden el archivo generado al build, incluso la primera vez, cuando no existía.
- La `Condition` lo salta mientras el editor analiza el proyecto en segundo plano.

## Comportamiento que conviene conocer

- Si borras o renombras una clase de shader, el `YotsubaShader.g.cs` viejo todavía la nombra y ya no compila. `add` deja ese archivo fuera al compilar el proyecto, e ignora los errores del código que llama a un método generado que todavía no existe, así que escribe el archivo nuevo sin que borres el viejo.
- Códigos de salida: `0` si todo sale bien (con avisos incluidos), `1` por errores de C#, un plugin que falla o un destino que pediste y falla, `2` por argumentos incorrectos, también dos versiones de un mismo destino.

Para escribir archivos separados, usa [`compile`](compile.md).

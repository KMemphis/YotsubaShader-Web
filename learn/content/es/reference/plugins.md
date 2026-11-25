---
title: Plugins
summary: Instala, actualiza y usa los plugins que añaden formatos de engine al compilador.
order: 8
---

El compilador trae SPIR-V, GLSL, GLSL ES, HLSL, Metal, WGSL y C++. Cualquier otro formato es un **plugin**: un paquete NuGet pequeño que le enseña a la CLI una salida más. Hoy existen los plugins de MonoGame, KNI, FNA y Godot.

Un plugin lo usa solo la CLI, mientras compila. Tu juego no lo referencia.

## Usar un plugin

Pídelo con `--target`. La CLI lo descarga la primera vez, con sus dependencias y las bibliotecas nativas de tu plataforma, en `~/.yotsuba/plugins` (o `$YOTSUBA_HOME/plugins`):

```bash
yotsuba add MyShaders/MyShaders.csproj --target spirv --target monogame
```

## Qué versión se instala

Un plugin se compila contra la CLI, así que la CLI instala la versión más nueva del plugin que es compatible con ella: la misma versión mayor y menor que la CLI (`0.9.x` para una CLI `0.9.2`), y nunca una más nueva. Un plugin más nuevo que la CLI no carga en ella. `yotsuba --version` imprime la versión de la CLI.

- Cuando el plugin instalado ya tiene la versión de la CLI, la CLI no usa la red para nada.
- Si no, busca una versión compatible en cada ejecución, y la instala si es más nueva que la instalada.
- Sin internet, la CLI avisa de que no pudo buscar actualizaciones y usa la copia instalada. Si el plugin nunca se instaló, el comando falla y dice que no lo pudo descargar.
- Varios comandos `yotsuba` pueden ejecutarse a la vez (un build de varios proyectos): si dos instalan el mismo plugin, uno espera al otro.

## El comando plugin

```text
yotsuba plugin list | install <nombre> | update [nombre] | remove <nombre>
```

| Comando | Qué hace |
| --- | --- |
| `plugin list` | Imprime los plugins del catálogo y si cada uno está instalado y en qué versión. |
| `plugin install <nombre>` | Descarga el plugin, en la versión compatible con la CLI, antes de que lo necesites. No hace nada si esa versión ya está instalada. |
| `plugin update <nombre>` | Igual que `install`: trae la versión compatible más nueva. |
| `plugin update` | Actualiza todos los plugins que tienes instalados. |
| `plugin remove <nombre>` | Borra el plugin instalado. |

Códigos de salida: `0` si todo sale bien, `1` cuando falla el plugin o la red, `2` por argumentos incorrectos.

## El catálogo

| Plugin | `--target` | Paquete NuGet | Salida | Método que genera `add` |
| --- | --- | --- | --- | --- |
| `monogame` | `monogame` (o `mgfx`) | `YotsubaShader.Extensions.MonoGame` | `.mgfx`, uno por plataforma | `ToMGFX(MonoGamePlatform)` |
| `kni` | `kni` (o `kni-webgl`) | `YotsubaShader.Extensions.KNI` | `.knifx` | `ToKNIWebGL_FX()` |
| `fna` | `fna` | `YotsubaShader.Extensions.FNA` | `.fxb` | `ToFNA_FX()` |
| `godot` | `godot` (o `gdshader`) | `YotsubaShader.Extensions.Godot` | `.gdshader`, uno por tipo (`Spatial`, `CanvasItem`) | `ToGodotShader(GodotShaderType)` |

Cada entrada del catálogo declara su nombre, descripción, paquete, extensión, el método que genera `add` y, opcionalmente, un enum de opciones con sus valores y si el resultado es texto. `add` y `compile` leen esa entrada para decidir qué escribir.

## Dónde vive cada cosa

| Qué | Por defecto | Cómo cambiarlo |
| --- | --- | --- |
| Plugins instalados | `~/.yotsuba/plugins/<nombre>` | Define `YOTSUBA_HOME` con otra carpeta. |
| Catálogo | `https://yotsubashader.com/plugins.json` | Define `YOTSUBA_PLUGINS_URL` con una URL o una ruta de archivo. La CLI guarda una copia en `YOTSUBA_HOME` y la usa cuando no hay conexión. |
| Feed de NuGet | `https://api.nuget.org/v3-flatcontainer/` | Define `YOTSUBA_NUGET_SOURCE` con un feed privado o de pruebas. |

## De qué está hecho un plugin

Un paquete de plugin contiene un ensamblado con una clase que implementa `IShaderTargetBackend`. La CLI lo carga en su propio contexto, crea la clase y llama a su método `Compile` una vez por shader (y una vez por opción, cuando el plugin tiene opciones). `Compile` recibe el shader compilado y el valor numérico de la opción, y devuelve los bytes del archivo. En los formatos de texto, esos bytes son texto UTF-8.

Para los detalles de cada plugin en su engine (cómo el engine carga lo que se genera, datos de vértice, uniforms), mira [MonoGame](../engines/monogame-reference.md), [KNI](../engines/kni-reference.md), [FNA](../engines/fna-reference.md) y [Godot](../engines/godot-reference.md).

Los comandos que usan plugins son [`compile`](compile.md) y [`add`](add.md).

# Video promocional: qué es Yotsuba Shader, qué puede hacer y qué tan fácil es

Borrador para aprobar antes de producir. Duración objetivo: 2 min 30 s. Misma voz (Charon), mismo estilo visual de los videos de capítulo (paleta rosa/violeta/menta + grafito, formas planas, sin chips ni paneles translúcidos) y misma pantalla de logo al inicio y al final.

## 1. Mensaje central

Una sola frase: **escribes tus shaders en C#, en tu mismo proyecto, y Yotsuba Shader los compila para la API gráfica o el motor que uses.**

Tres ideas, en este orden:
1. **Qué es:** un SDK para escribir shaders en C#.
2. **Qué puede hacer:** una fuente, muchas salidas; estilos de escritura que ya conoces; funciona con tus tipos y motores.
3. **Qué tan fácil es:** tres comandos y ya está en tu proyecto.

## 2. Capacidades (lo que el video puede afirmar)

Solo se muestra lo que existe hoy. Cada punto indica de dónde sale y qué hay que comprobar antes de rodarlo.

| # | Capacidad | Respaldo | Comprobar |
| --- | --- | --- | --- |
| 1 | Shaders escritos como clases, structs y métodos normales de C#, con `[ShaderStage(Stage.Vertex / Fragment)]`; también cómputo | Tutorial capítulos 1–20 | — |
| 2 | Salidas desde el mismo código: SPIR-V, GLSL, GLSL ES, HLSL, MSL (Metal), C++ | `compile --target glsl/hlsl/msl/spirv/cpp` en el capítulo de la CLI | Mostrar la salida real de un shader pequeño |
| 3 | Efectos para motores: MonoGame (`.mgfx`), KNI (`.knifx`, web), FNA (`.fxb`) | Tabla de `add` en el capítulo de la CLI y páginas de motores | Rodar el mismo shader en una ventana de MonoGame |
| 4 | Cinco estilos de escritura (GLSL, HLSL, MSL, WGSL, SPIR-V): eliges el vocabulario que conoces, el resultado es el mismo | Capítulo "How it works" | Mostrar el mismo shader en dos estilos lado a lado |
| 5 | El compilador revisa tu C#: si renombras o te equivocas, el error sale al compilar, no al ejecutar | Capítulo de la CLI (`add` abre el `.csproj` y compila) | Capturar un error real |
| 6 | Instalación por NuGet: `dotnet tool install YotsubaShader.Compiler.CLI` y `dotnet add package YotsubaShader.GlslSyntax` | Probado en copia (versión 0.8.1) | — |
| 7 | `add` se ejecuta solo al compilar el proyecto (bloque `<Target>`) | Probado en copia | — |
| 8 | Todo es C# administrado, sin binarios nativos que empaquetar | Documento de visión (`PROMO_VISION_AND_SCRIPT.md`) | Confirmar con el repo antes de decirlo |
| 9 | Analizador para el IDE (diagnósticos de Roslyn) | Paquete `YotsubaShader.IDE.Analyzer` en NuGet | Mostrar un subrayado real en el editor, o no decirlo |

No se afirma: ejecución en WebGPU, salida WGSL (el README dice que está planeada), ni soporte de Unity o Stride como motores terminados hasta confirmar el estado de esas páginas. `VERIFIED_FEATURES.md` está desactualizado (dice que la CLI no existe); hay que regenerarlo antes de producir.

Ejemplos reales a mostrar, todos de los capítulos del tutorial: degradado de atardecer, fractal de Mandelbrot, anillo de neón, plasma animado, foto bajo el agua.

## 3. Guion por escenas

Locución en español primero; el inglés se escribe cuando se apruebe este. Cada escena dice qué se ve y cuándo (colgado de la frase, no de segundos).

### Escena 1 · Logo (0:00–0:04)
Pantalla del logo, igual que la portada de la web. Sin voz.

### Escena 2 · El problema (0:04–0:32)
**Voz:** "Un shader es el programa que decide el color de cada píxel. Y cada motor lo pide a su manera. MonoGame usa una variante de HLSL. Stride tiene la suya, también basada en HLSL. Unity escribe HLSL dentro de su propio formato. Unreal tiene sus archivos de shader en HLSL. Y Godot inventó su propio lenguaje. Si cambias de motor o de plataforma, hay que escribirlo de nuevo."

**Imagen:** una fila de cinco bloques de color que entran uno por uno, cada uno con su nombre y un fragmento de código distinto: MonoGame (HLSL de MonoGame), Stride (SDSL), Unity (HLSL en ShaderLab), Unreal (HLSL en `.usf`), Godot (lenguaje propio de Godot). Debajo, el mismo degradado de atardecer repetido cinco veces, una por bloque. Titular: "Un shader, cinco maneras de escribirlo".

### Escena 3 · La idea (0:25–0:45)
**Voz:** "Yotsuba Shader parte de otra idea. Escribes el shader en C#, igual que el resto de tu juego: con clases, structs y métodos. Y el compilador lo convierte al formato que necesite cada API."

**Imagen:** a la izquierda el código C# del shader rojo/atardecer; una flecha animada lo parte en seis salidas (SPIR-V, GLSL, GLSL ES, HLSL, Metal, C++) que aparecen como pestañas con el texto real generado. Cierra con "Escribe shaders en C#" resaltando "in C#".

### Escena 4 · Capacidad 1: una fuente, muchas salidas (0:45–1:08)
**Voz:** "Un mismo código, y obtienes el shader en los lenguajes base: GLSL, HLSL, Metal y SPIR-V, además de GLSL ES y C++. WGSL, para WebGPU, llegará más adelante."

**Imagen:** pantalla dividida: el C# a la izquierda; a la derecha, la lista de archivos de salida aparece de arriba abajo con el nombre del archivo en grande y entre paréntesis la API a la que pertenece. El texto real de cada salida cambia en pestañas al ritmo de la voz: `.glsl` (OpenGL), `.hlsl` (DirectX), `.msl` (Metal), `.spv` (SPIR-V, Vulkan), `.gles` (OpenGL ES y WebGL), `.cpp` (C++). WGSL (WebGPU) cierra la lista en gris con la etiqueta "Próximamente"; es la única excepción.
Aquí no aparecen archivos de motor (ni `.mgfx`, `.knifx` o `.fxb`, ni Stride, Unity o Godot): los motores se muestran solo en `add` (escena 7).

### Escena 5 · Capacidad 2: tu estilo (1:10–1:30)
**Voz:** "Si vienes de HLSL, escribes con nombres de HLSL. Si vienes de GLSL, con los de GLSL. También hay Metal, WGSL y SPIR-V. Eliges el que conoces; el resultado es el mismo."

**Imagen:** el mismo fragmento de código dos veces, lado a lado (GLSL | HLSL), con una línea de color uniendo `location(0)` con `SV_Target`. Una ventana de salida debajo demuestra que ambos producen el mismo GLSL.

### Escena 6 · Ejemplos con movimiento (1:30–1:58)
**Voz:** "Con él se hace desde un degradado hasta un fractal, un anillo de neón, un plasma que se mueve o una foto bajo el agua. Todo el código es C# normal."

**Imagen:** motion graphics a pantalla completa, uno tras otro, cada uno con su código a un lado, resaltado línea por línea mientras el efecto aparece:
1. Atardecer: el cielo se rellena con el degradado; la línea `Mix` del código se ilumina.
2. Mandelbrot: el fractal se dibuja y hace zoom hacia un borde; resalta el bucle `for`.
3. Anillo de neón: el círculo se enciende; resalta `Distance` y `Smoothstep`.
4. Plasma: ondas de color en movimiento controladas por `Time`; resalta `Sin`.
5. Foto bajo el agua: una imagen se ondula; resalta la lectura de la textura.
Los efectos salen de ejecutar los shaders reales del tutorial (grabación del Viewer), animados con Remotion para que entren y salgan limpios.

### Escena 7 · Qué tan fácil es (1:58–2:35)
**Voz:** "Empezar toma tres comandos. Creas el manifiesto de herramientas, instalas el compilador desde NuGet y agregas el paquete a tu proyecto. Después tienes dos maneras de usarlo. Con add, el compilador escribe el resultado dentro de tu proyecto: aparece una función nueva para cada formato, y la llamas como cualquier método de C#. También agrega los métodos para cada motor: MonoGame, KNI, FNA, Stride, Unity y Godot. Con compile, eliges una carpeta, y el compilador deja ahí un archivo por cada formato que pidas. Si te equivocas, el error aparece al compilar, no cuando ya está corriendo."

**Imagen (motion graphics, tres tiempos):**
1. **Instalación:** los tres comandos se teclean en una terminal; cada uno marca una casilla de color al terminar.
```bash
dotnet new tool-manifest
dotnet tool install YotsubaShader.Compiler.CLI
dotnet add MyShaders package YotsubaShader.GlslSyntax
```
2. **`add`:** a la izquierda `MyShaders/Gradient.cs`; se ejecuta `dotnet yotsuba add MyShaders/MyShaders.csproj --target spirv`. Una flecha de color lleva el resultado a un archivo nuevo, `YotsubaShader.g.cs`, que se abre a la derecha. Aparecen líneas nuevas en rosa: `Gradient.ToSpirV()`, `ToGlsl(Stage)`, `ToHlsl(Stage)`, `ToMSL(Stage)`.  La etiqueta dice: "`add` agregó estas funciones a tu proyecto".
   Después `add` muestra que también agregó métodos para motores específicos. En el mismo archivo se iluminan, uno tras otro, y debajo se ve cada llamada:
   - `Gradient.ToMGFX(...)` (MonoGame)
   - `Gradient.ToKNIWebGL_FX()` (KNI)
   - `Gradient.ToFNA_FX()` (FNA)
   - Stride, Unity y Godot, con su método y su llamada. **Nombres por confirmar:** los tres primeros existen hoy en el código generado; para Stride, Unity y Godot no hay método todavía, y no los invento. Dime cómo se llamarán.

3. **`compile`:** se ejecuta `dotnet yotsuba compile MyShaders/MyShaders.csproj --target glsl --target hlsl --target msl --target spirv --output out`. Una carpeta `out/` se abre y los archivos caen dentro uno por uno: `Gradient.Fragment.glsl`, `Gradient.Vertex.glsl`, lo mismo para `.hlsl` y `.msl` (un archivo por etapa) y un único `Gradient.spv` con todas las etapas. La carpeta es `MyShaders/out/MyShaders/`, como en el capítulo de la CLI. No se muestran los formatos de MonoGame, KNI ni FNA en esta escena. La etiqueta dice: "`compile` deja un archivo por formato en la carpeta que elijas".
4. **Error:** un error de compilación real en rosa y su corrección.

### Escena 8 · Cierre (2:20–2:30 + logo)
**Voz:** "Prueba el tutorial en yotsubashader.com."

**Imagen:** pantalla del logo con la dirección web debajo. No se promete nada que no exista.

## 4. Decisiones tomadas

- Se puede nombrar Unity, Stride, Unreal y Godot (como ejemplos del problema), además de MonoGame, KNI y FNA.
- No se menciona la licencia.
- El Playground no se incluye; los ejemplos son motion graphics con código.
- Solo voz, sin música.
- Español primero, inglés después.

## 5. Producción (cuando se apruebe)

- Remotion, 1920×1080 a 60 fps, mismo motor de `remotion/src/chapters/`; locución con Gemini (Charon), tiempos desde el JSON de cada frase.
- Capturas reales: ejecutar los shaders del tutorial en el Viewer y grabar la ventana; salidas de compilación generadas con la CLI instalada desde NuGet.
- Se reemplaza el promocional de 58 s anterior solo cuando el usuario apruebe el nuevo.

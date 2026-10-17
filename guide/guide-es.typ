// Integrar Yotsuba Shader en tu motor: edición en español.
// Edita este archivo y ejecuta `typst compile --root . guide-es.typ` (ver README.md).
#import "template.typ": *

#show: guide.with(
  lang: "es",
  title: "Integrar Yotsuba Shader en tu motor",
  subtitle: "Todo lo que necesitas para dar a quienes usan tu framework shaders escritos en C\# con tipado fuerte y validados",
  edition: "Edición 1.0 · Octubre de 2026 · Yotsuba Shader se publica bajo la licencia MIT",
  toc-title: "Contenido",
)

#[
#set heading(numbering: none)
= Antes de empezar

Esta guía es para quien construye un motor, un framework o una herramienta de contenido en C\# y quiere que ejecute shaders escritos con Yotsuba Shader. Sigue un motor imaginario, `MyEngine`, desde una solución vacía hasta un paquete probado y publicado. Cada paso es algo que copias en tu propio proyecto.

== Qué vas a construir

Al terminar, los programadores que usen tu motor escribirán esto:

#snippet(name: "Game.cs", lang: "cs", "var lit = new Lit(program.Parameters);\n\nlit.Material = new MaterialData { Roughness = 0.4f };\nlit.Albedo = assets.Load<Texture2D>(\"brick.png\");")

y cada parte de esa línea estará comprobada: el nombre, el tipo y la existencia del parámetro. Para llegar ahí construirás siete cosas:

#grid-table(
  ("N.º", "Qué construyes", "Capítulo"),
  ("1", "Los tipos de tu motor, marcados para que la GPU los entienda", "3"),
  ("2", "Las convenciones de slots y de frecuencia de actualización", "5"),
  ("3", "El paso de compilación que genera cada shader en los formatos que necesitas", "6"),
  ("4", "Una clase base que convierte los uniforms en propiedades tipadas", "7"),
  ("5", "Un cargador que crea pipelines a partir del shader compilado", "8"),
  ("6", "Pruebas que se ejecutan sin tarjeta gráfica", "10"),
  ("7", "Un paquete que tus usuarios instalan", "12"),
)

== Cómo leerla

- Los capítulos 1 y 2 dan el mapa y la preparación. Léelos primero.
- Los capítulos 3 a 5 tratan del lenguaje de shaders y de los datos. Puedes leerlos en cualquier orden cuando necesites un tema.
- Los capítulos 6 a 9 son la integración en sí. Síguelos en orden.
- Los capítulos 10 a 13 tratan de calidad, adopción en un motor existente, publicación y solución de problemas.

Cada listado de código tiene un nombre de archivo arriba. Los listados de esta guía son archivos reales de la carpeta `code/` junto a este documento, y los de C\# se compilan contra el paquete del lenguaje cada vez que se construye la guía, así que puedes copiarlos con confianza. La edición en inglés tiene la misma estructura.

#note[Un listado muestra el código de un archivo. Cuando un archivo solo muestra algunos miembros, un comentario en la primera línea indica a qué clase pertenecen.]

]

= Cómo encaja Yotsuba Shader en un motor

== El pipeline

Yotsuba Shader convierte una clase de C\# en binarios de shader. Tu motor nunca analiza texto de shaders y nunca incluye un segundo lenguaje. El compilador lee la clase, comprueba sus interfaces y recursos, y produce SPIR-V. Los demás formatos salen de SPIR-V.

#flow(("Clase C\#", "tu shader"), ("Compilador", "comprueba y baja"), ("SPIR-V", "siempre se produce"), ("Otros formatos", "HLSL, MSL, WGSL, GLSL, GLSL ES"))

Dos traductores están detrás de los otros formatos: SPIRV-Cross escribe HLSL y Metal Shading Language, y Naga escribe WGSL y GLSL. No los llamas directamente. Pides un formato y recibes su texto.

== Qué hace Yotsuba Shader y qué hace tu motor

#grid-table(
  ("Yotsuba Shader", "Tu motor"),
  ("Define los atributos que describen tipos, etapas, slots y recursos", "Los aplica a sus propios tipos de vector, matriz y textura"),
  ("Encuentra los shaders de tu proyecto y los comprueba mientras compilas", "Decide la convención de bindings y la frecuencia de actualización de cada grupo de datos"),
  ("Genera cada binario que pides y una descripción de cada shader", "Elige en tiempo de ejecución el formato que corresponde a la API gráfica"),
  ("Expone los mismos dos objetos en cada shader: su código y su reflexión", "Crea pipelines, buffers y descriptores a partir de ellos"),
  ("Ignora el código de CPU de la clase del shader que marcas con un atributo", "Da a cada shader una API tipada en la CPU"),
)

La línea entre las dos columnas es el tema de esta guía. La columna izquierda ya está hecha. La derecha es lo que construyes tú.

== Los cinco puntos de integración

#grid-table(
  ("Punto", "Pregunta que responde", "Capítulo"),
  ("Tipos", "¿Cuáles de mis tipos son un vector, una matriz, una textura o un sampler?", "3"),
  ("Lenguaje", "¿Cómo describen mis usuarios las etapas, las entradas y las salidas?", "4"),
  ("Recursos", "¿Adónde va cada uniform, buffer y textura?", "5"),
  ("Compilación", "¿Qué formatos genero, y cuándo?", "6"),
  ("API de CPU", "¿Cómo asigna el juego un uniform y carga un shader?", "7 y 8"),
)

== Tres decisiones que debes tomar ahora

Escribe tus respuestas antes de empezar. Cambiarlas después es posible, pero afecta a todos los shaders que tus usuarios hayan escrito.

+ *¿Qué sintaxis recomiendas?* Las sintaxis HLSL, GLSL, MSL, SPIR-V y WGSL expresan la misma intención. La sintaxis no elige la salida. Elige la que la mayoría de tus usuarios ya conoce y úsalo en todos tus ejemplos. Ver el capítulo 4.
+ *¿Qué formatos publicas?* Solo las APIs gráficas que tu motor soporta. Cada formato que quitas hace la compilación más rápida y el paquete más pequeño. Ver el capítulo 6.
+ *¿Cuál es tu convención de bindings?* Una regla que dice qué `set` contiene la cámara, cuál el material y cuál el objeto. El capítulo 5 propone una.

= Prepara la solución

== Los proyectos

Divide el motor para que los tipos, la capa gráfica y los shaders puedan cambiar a distinto ritmo.

#snippet(name: "Estructura de la solución", "MyEngine/\n├── MyEngine.sln\n├── src/\n│   ├── MyEngine.Core/            tipos de vector, matriz y textura\n│   │   ├── Vector2.cs  Vector3.cs  Vector4.cs  Matrix4.cs\n│   │   └── Texture2D.cs  SamplerState.cs\n│   ├── MyEngine.Graphics/        la capa de la API gráfica\n│   │   ├── IGraphicsDevice.cs  IParameterSet.cs\n│   │   ├── ShaderProgram.cs  Std140.cs\n│   │   └── Vulkan/  Direct3D12/  Metal/  OpenGL/\n│   └── MyEngine.Shaders/         clase base y shaders del motor\n│       ├── ShaderBase.cs\n│       └── Lit.cs  Unlit.cs  Tonemap.cs\n├── samples/\n│   └── Game/                     un juego que usa el motor\n└── tests/\n    └── MyEngine.Shaders.Tests/")

#grid-table(
  ("Proyecto", "Referencia", "Por qué"),
  ("MyEngine.Core", "YotsubaShader.Language", "Tus tipos llevan los atributos. El paquete solo contiene metadatos, así que no cambia su comportamiento ni cómo se disponen en memoria."),
  ("MyEngine.Graphics", "MyEngine.Core, YotsubaShader.Language", "Lee los shaders compilados y habla con la API gráfica."),
  ("MyEngine.Shaders", "Core, Graphics, el generador de código", "Contiene los shaders que tu motor incluye. El generador los compila durante la compilación."),
  ("Game", "MyEngine.Shaders", "Usa los shaders mediante su API tipada."),
)

== El paquete del lenguaje

El paquete con los atributos va en el proyecto que define tus tipos.

#listing("core.csproj.xml", name: "MyEngine.Core.csproj")

== El paso de compilación

El proyecto de shaders referencia el generador de código y lista en `YotsubaTargets` los formatos que publicas.

#listing("shaders.csproj.xml", name: "MyEngine.Shaders.csproj")

El generador se ejecuta dentro de `dotnet build`. No necesita ninguna herramienta adicional en tu máquina ni ningún paso en tu CI aparte de la propia compilación. Un shader que no compila hace fallar la compilación como cualquier error de C\#. El capítulo 6 explica cada destino.

#tip[Usa `PrivateAssets="all"` en el generador. Así queda fuera del paquete que publicas, y tus usuarios no reciben una herramienta de compilación que nunca pidieron.]

== Requisitos

- El SDK de .NET 8, en macOS, Linux o Windows.
- Nada más para compilar shaders. Los SDK gráficos que ya usas en tus backends siguen siendo cosa tuya.

= Tus tipos se convierten en tipos de GPU

Si construyes un motor, ya tienes `Vector2`, `Matrix4` y `Texture2D`. No necesitas un segundo conjunto de tipos para shaders. Añades atributos a los tipos que ya tienes, y los programadores que usan tu motor escriben shaders con los mismos tipos que usan en todo lo demás.

== Cómo ve la GPU tus tipos

Para la GPU, una struct sin atributos es solo un grupo de campos. El nombre no importa: una struct llamada `Vector2` no es un vector a menos que lo digas. Marcas solo los tipos que deben comportarse como vector, matriz, textura o sampler.

#flow(("Escalares", "sin atributo"), ("Vectores", "[Vector]"), ("Matrices", "[Matrix]"), ("Texturas", "[Texture]"), ("Samplers", "[Sampler]"))

== Escalares: no hay que hacer nada

`bool`, `int`, `uint`, `float` y `double` ya son tipos de GPU. Úsalos solos o dentro de structs.

== Vectores

Pon `[Vector]` en la struct y `[VectorComponent(i)]` en cada componente, empezando en 0. El índice es la posición del componente en el vector de la GPU, así que `X` es 0, `Y` es 1, y así. El número de miembros que marcas es el tamaño del vector.

#listing("Vector2.cs")

Tus constructores, operadores y métodos se quedan como están. Los componentes pueden ser campos o propiedades, y un vector puede tener componentes `int` o `uint` cuando todos comparten un tipo.

#listing("Vector3.cs")
#listing("Vector4.cs")
#listing("IntVectors.cs")

#warn[Los componentes de un vector deben tener el mismo tipo, y solo son válidos `float`, `int` y `uint`. Un vector mixto lanza `InconsistentVectorComponentTypeException` y un componente `double` lanza `VectorComponentTypeNotValidException`. Ambos aparecen cuando el compilador procesa un shader que usa el tipo, así que compila un shader que use cada uno de tus tipos antes de publicarlos.]

== Matrices

Una matriz es una struct marcada con `[Matrix]` cuyas columnas son vectores. Marca cada columna con `[MatrixColumn(i)]`, empezando en 0. El tipo de la columna es uno de los vectores que declaraste.

#listing("Matrix4.cs")

== Texturas

`[Texture]` va en una clase o una struct. Necesita dos valores: la dimensión (`D1`, `D2`, `D3` o `Cube`) y el tipo de valores que contiene (`Float`, `Int` o `Uint`). Los ajustes opcionales describen el resto.

#listing("Textures.cs")

#grid-table(
  ("Ajuste", "Valores", "Por defecto"),
  ("`Usage`", "`Sampled` (el shader la lee), `Storage` (el shader escribe en ella)", "`Sampled`"),
  ("`Depth`", "`No`, `Yes`, `Unknown`", "`No`"),
  ("`Format`", "`Unknown`, `Rgba8`, `Rgba16f`, `Rgba32f`, `R32f`, `R32i`, `R32ui` y otros", "`Unknown`"),
  ("`Arrayed`", "`true` para un arreglo de texturas", "`false`"),
  ("`Multisampled`", "`true` para una textura multimuestra", "`false`"),
)

Una textura de almacenamiento también necesita su `Format` de píxel, porque el shader escribe en ella.

== Samplers

Un sampler decide cómo se lee una textura. No tiene ajustes: `[Sampler]` solo dice que el tipo lo representa.

#listing("SamplerState.cs")

== Structs y arreglos

Cualquier otra struct se convierte campo por campo, incluidas las structs anidadas. Los arreglos no necesitan atributo. Lo que cambia es de dónde vienen los datos: `[Uniform]` y `[StorageBuffer]` marcan valores que tu motor sube antes de dibujar. El capítulo 5 los cubre.

== Un tipo que no es tuyo

Los atributos van en tipos que controlas. No puedes marcar `System.Numerics.Vector3` ni un tipo de otro paquete. Conserva tu propia struct y convierte en los bordes de tu código. Una struct `partial` te permite añadir las conversiones en otro archivo.

#listing("Interop.cs")

== Comprueba que funciona

Abre el playground o compila un proyecto pequeño, pon tus tipos en un archivo y un shader que use cada uno en otro. Deben pasar dos cosas: no hay errores y se listan los puntos de entrada del shader. Hazlo una vez por cada tipo que publiques. Es la prueba más barata que escribirás.

= Escribe shaders con tus tipos

== Etapas

Un shader es una clase. Sus puntos de entrada son métodos marcados con `[ShaderStage]`. Una clase puede tener cualquier número de etapas, y los métodos sin el atributo son C\# normal que el compilador ignora.

#grid-table(
  ("Etapa", "Recibe", "Devuelve"),
  ("`Stage.Vertex`", "Entrada por vértice", "Una struct que incluye la posición en clip space"),
  ("`Stage.Fragment`", "Los valores interpolados de la etapa vertex", "El color para el render target"),
  ("`Stage.Compute`", "Un built-in como el id de invocación global", "Nada: escribe en storage buffers"),
)

== Slots de interfaz

Cada valor que cruza el límite entre etapas tiene un slot. Hay dos tipos que escribes tú: ubicaciones numeradas y valores built-in.

#listing("Types.cs")

`[Location(n)]` une una salida de una etapa con la entrada de la siguiente con el mismo número. `[SV_Position]` es un built-in: la posición en clip space que necesita la GPU. Cada sintaxis nombra los built-in a su manera. El apéndice B los lista lado a lado.

== Elige una sintaxis para tu motor

Las cinco sintaxis son equivalentes. Cada una es su propio paquete, con un namespace del mismo nombre, construido sobre `YotsubaShader.Language`. La sintaxis HLSL no exige un destino Direct3D, y la sintaxis WGSL no exige WebGPU. Elige según las costumbres de tus usuarios, no según la API gráfica que soportas.

#grid-table(
  ("Si tus usuarios…", "Recomienda"),
  ("vienen de Unity, Direct3D o XNA y MonoGame", "HLSL: `YotsubaShader.HlslSyntax`"),
  ("vienen de OpenGL o Godot", "GLSL: `YotsubaShader.GlslSyntax`"),
  ("escriben para plataformas de Apple", "MSL: `YotsubaShader.MslSyntax`"),
  ("trabajan cerca de Vulkan y SPIR-V", "SPIR-V: `YotsubaShader.SpirvSyntax`"),
  ("escriben para la web", "WGSL: `YotsubaShader.WgslSyntax`"),
  ("aún no tienen costumbre", "HLSL: la relación entre etapas se ve fácil"),
)

#warn[Varios nombres existen en más de una sintaxis (`uniform` y `buffer`, por ejemplo). Importa un espacio de nombres de sintaxis por archivo, y pide lo mismo a tus usuarios.]

== Un ejemplo completo

El shader de abajo es el que llevarás durante el resto de la guía. Usa los tipos del capítulo anterior, tres grupos de uniforms y una textura con su sampler.

#listing("UniformData.cs")
#listing("Lit.cs")

Todavía no has visto `ShaderBase`, `Get` y `Set`. Son el lado de CPU del shader y el capítulo 7 los construye. Por ahora, lee los métodos de las etapas y los atributos de las propiedades.

= Recursos y la convención de bindings

== Uniforms, storage buffers, texturas y samplers

#grid-table(
  ("Atributo", "Para qué sirve", "Tamaño típico"),
  ("`[Uniform]`", "Un valor que se mantiene igual durante un draw o dispatch: una cámara, un tiempo, un material", "Pequeño"),
  ("`[StorageBuffer]`", "Un arreglo que el shader puede leer y escribir: partículas, resultados de un cálculo", "Grande"),
  ("Un campo de textura", "Los píxeles de una imagen, con `[Texture]` en su tipo", "Cualquiera"),
  ("Un campo de sampler", "Cómo se lee una textura, con `[Sampler]` en su tipo", "—"),
)

Un storage buffer es de lectura y escritura por defecto. Indica el acceso cuando el shader solo lee o solo escribe: `Access = ResourceAccess.ReadOnly` o `WriteOnly`. Un tipo también puede decirlo por ti. `ImmutableArray<T>`, `ReadOnlyMemory<T>` y `ReadOnlySpan<T>` son de solo lectura por lo que son. En un campo de clase usa `ImmutableArray<T>` o `ReadOnlyMemory<T>`, porque C\# no permite spans como campos.

#warn[Un campo no puede ser a la vez `[Uniform]` y `[StorageBuffer]`. El compilador lanza `InvalidOperationException`. Elige un uniform para un valor pequeño que no cambia durante el draw, y un storage buffer para un arreglo.]

== Slots de binding

Tu motor necesita saber adónde va cada recurso. El atributo compartido `[Binding(set, binding)]` funciona en todas las sintaxis, y cada sintaxis también tiene la grafía de su lenguaje de origen.

#snippet(name: "El mismo slot en cada sintaxis", lang: "cs", "[Uniform, Binding(1, 0)]                  // cualquier sintaxis\n[cbuffer, register(RegisterPrefix.b, 0)]   // HLSL\n[uniform, layout(1, 0)]                   // GLSL\n[constant, buffer(0)]                     // MSL\n[Uniform, DescriptorSet(1), @Binding(0)]  // SPIR-V\n[uniform, @group(1), @binding(0)]         // WGSL")

Los slots son solo números. El significado de cada número es tu convención.

== Una convención que escala

Una buena convención hace visible la frecuencia de actualización. Pon lo que cambia menos en un set más bajo. Así el motor enlaza cada set una vez por grupo de draws, no una vez por draw.

#listing("Sets.cs")

#grid-table(
  ("Set", "Contiene", "Cambia", "Se enlaza"),
  ("0 · Frame", "Cámara, tiempo, luces", "Una vez por fotograma", "Una vez por fotograma"),
  ("1 · Material", "Texturas, samplers, factores del material", "Una vez por material", "Cuando cambia el material"),
  ("2 · Object", "Matriz de mundo, datos por objeto", "Una vez por objeto", "Una vez por draw"),
)

Pide a tus usuarios que usen estas constantes y nunca números. Un shader escrito con `Sets.Material` sigue funcionando si más adelante reordenas los sets.

== Datos de uniforms y memoria

Una struct de uniforms se sube como memoria simple. Las reglas de cómo se colocan los campos en esa memoria vienen de la API gráfica, no de Yotsuba Shader. Los atributos no cambian la disposición de tus tipos. El capítulo 8 muestra un pequeño ayudante que calcula la disposición estándar `std140` a partir de los mismos atributos que añadiste en el capítulo 3, para que tu cargador de datos y el shader coincidan.

= Compila tus shaders

== El generador de código

Esta es la forma principal de compilar. Un generador de código de Roslyn se ejecuta como parte de `dotnet build`. Encuentra cada método `[ShaderStage]`, lo compila y escribe el resultado en la otra mitad de la clase. Para esto la clase debe ser `partial`.

#listing("Triangle.cs")

El generador añade esta mitad. Declara dos campos y los rellena con código generado.

#listing("Triangle.g.cs")

Ambos campos llevan `[ShaderIgnore]`, que le dice a Yotsuba Shader que no los trate como parte del shader. La mitad generada no añade ninguna clase base, así que tu propia clase base, como el `ShaderBase` del capítulo 7, nunca entra en conflicto con ella.

== Dos objetos en cada shader

Cada shader expone los mismos dos tipos. Eso permite a tu motor cargar cualquier shader de la misma forma.

#snippet(name: "YotsubaShader.Language.Compilation", lang: "cs", "public sealed class ShaderCompiledCode\n{\n    public bool Has(string entryPoint, Binaries format);\n    public ReadOnlySpan<byte> Get(string entryPoint, Binaries format);\n    public string GetText(string entryPoint, Binaries format);\n}\n\npublic sealed class ShaderReflection\n{\n    public IReadOnlyList<Binaries> BinaryFormats { get; }\n    public IReadOnlyList<EntryPointInfo> EntryPoints { get; }\n    public IReadOnlyList<ResourceBinding> Resources { get; }\n}")

- `ShaderCompiledCode` contiene un binario por punto de entrada y formato. La clave es el nombre del método de C\#, así que `nameof(Triangle.Vertex)` lo comprueba el compilador. Los formatos de texto vuelven como bytes UTF-8, y `GetText` los decodifica.
- `ShaderReflection` lista los formatos generados, los puntos de entrada (nombre y etapa) y los recursos (nombre, tipo, acceso y slot). Nunca lees un binario para construir un pipeline.

#listing("ReadBinaries.cs")

Los datos viven como datos estáticos en tu ensamblado, así que leerlos no copia ni reserva memoria.

== Los formatos

#grid-table(
  ("Destino", "`Binaries`", "Qué contiene", "Se usa para"),
  ("`spirv`", "`Binaries.SpirV`", "Binario SPIR-V", "Vulkan"),
  ("`hlsl`", "`Binaries.Hlsl`", "Texto UTF-8", "Direct3D 11 y 12"),
  ("`msl`", "`Binaries.Msl`", "Texto UTF-8", "Metal"),
  ("`wgsl`", "`Binaries.Wgsl`", "Texto UTF-8", "WebGPU"),
  ("`glsl`", "`Binaries.Glsl`", "Texto UTF-8", "OpenGL"),
  ("`glsles`", "`Binaries.GlslEs`", "Texto UTF-8", "OpenGL ES, WebGL"),
)

Solo se generan los destinos listados en `YotsubaTargets`. SPIR-V es el formato que escribe el compilador. HLSL y MSL se traducen desde él con SPIRV-Cross, y WGSL y GLSL con Naga.

== Del texto a algo que ejecuta la GPU

Los formatos de texto aún necesitan un último paso, y es trabajo de la plataforma:

#grid-table(
  ("API", "Quién compila el texto", "Tú publicas"),
  ("Vulkan", "Nadie: SPIR-V es el binario final", "SPIR-V"),
  ("Metal", "El framework Metal, al crear la biblioteca", "Texto MSL"),
  ("WebGPU", "El navegador", "Texto WGSL"),
  ("OpenGL, WebGL", "El controlador gráfico", "Texto GLSL"),
  ("Direct3D 11 y 12", "DXC (Shader Model 6) o FXC (Shader Model 5.x), el que ya uses", "Texto HLSL"),
)

Yotsuba Shader se detiene en el texto HLSL. No produce DXIL ni DXBC. Si quieres bytecode de Direct3D dentro de tu paquete, compila el HLSL con tu propio DXC o FXC en el mismo paso de compilación y publica el resultado.

== La línea de comandos

Para CI, scripts y herramientas de contenido, el mismo compilador está disponible como comando. Le das el archivo de tu proyecto y escribe un binario por punto de entrada.

#snippet(name: "Terminal", lang: "bash", "yotsuba compile YourGame.csproj \\\n  --target spirv \\\n  --output artifacts/shaders")

La carpeta de salida contiene `Triangle.Vertex.spv`, `Triangle.Fragment.spv` y así. Añade `--entry Triangle.Vertex` para compilar un solo punto de entrada. También es la forma más fácil de inspeccionar la salida con `spirv-val` y `spirv-dis`.

#grid-table(
  ("Flujo", "Se ejecuta", "Ideal para", "Salida"),
  ("Generador de código", "Durante `dotnet build`", "Motores y juegos que publican shaders con el código", "Datos estáticos en una clase `partial`"),
  ("Línea de comandos", "En scripts y CI", "Pipelines de contenido, inspección, validación", "Archivos `.spv`"),
)

== Traducir en tiempo de ejecución

La mayoría de los motores nunca necesita esto: el generador ya produjo todos los formatos. Cuando tu herramienta crea shaders mientras se ejecuta, como un editor, entrega el SPIR-V a la API `Transpile` y recibe texto.

#snippet(name: "Transpile.cs", lang: "cs", "using YotsubaShader.Transpile;\n\nvar hlslOptions = new HlslOptions { ShaderModel = 51, EntryPoint = \"Vertex\" };\nvar glslOptions = new GlslOptions { Es = true, Version = 300 };\n\nstring hlsl = Transpile.FromSpirVToHlsl(spirv, hlslOptions);\nstring msl  = Transpile.FromSpirVToMsl(spirv);\nstring wgsl = Transpile.FromSpirVToWgsl(spirv);\nstring glsl = Transpile.FromSpirVToGlsl(spirv, glslOptions);")

Ambos traductores son código nativo, así que cada plataforma necesita su propia compilación. En consolas, traduce en tiempo de compilación: ninguno de los dos traductores se verificó contra una cadena de herramientas de consola.

= El lado de CPU: parámetros de shader tipados

== El problema

Todo motor asigna un uniform por nombre, normalmente con una cadena:

#snippet(name: "La forma habitual", lang: "cs", "parameters.Set(\"Exposure\", 1.2f);\nparameters.Set(\"LightDirection\", direction);")

Un error tipográfico, un parámetro renombrado en el shader pero no en el juego, o un valor del tipo equivocado compilan sin errores. Fallan cuando esa línea se ejecuta, no cuando compilas. Yotsuba Shader elimina el problema porque la clase del shader es C\#: el nombre y el tipo de cada uniform se escriben una vez, y el compilador de C\# los comprueba al compilar el shader y cuando el juego lo usa.

== Paso 1: oculta cómo la API gráfica asigna un uniform

Vulkan, Direct3D, Metal y OpenGL asignan uniforms de formas distintas. Pon esa diferencia detrás de una interfaz. Es la única parte de este capítulo que depende de la API gráfica.

#listing("IParameterSet.cs")

Cada backend la implementa una vez. Una versión de Vulkan escribe en un uniform buffer, y una de OpenGL llama a las funciones de uniforms. Los datos simples pasan por `Get` y `Set`, por eso `T` es `unmanaged`. Las texturas y los samplers son objetos de tu motor y tienen sus propios métodos.

== Paso 2: una clase base para cada shader

La clase base guarda el conjunto de parámetros y da a cada shader los ayudantes que necesita. El nombre del uniform no es un parámetro que escriba el programador: `[CallerMemberName]` hace que el compilador de C\# lo rellene con el nombre de la propiedad que llama al ayudante.

#listing("ShaderBase.cs")

Dentro de `public MaterialData Material { get => Get<MaterialData>(); }` el nombre es `"Material"`. No hay cadena ni `nameof` que olvidar, y renombrar la propiedad renombra el uniform. Todo lo de esta clase es código de CPU, así que lleva `[ShaderIgnore]`.

== Paso 3: un shader encima

El shader del capítulo 4 ya tiene esta forma. Mira sus propiedades otra vez:

#snippet(name: "Lit.cs (fragmento)", lang: "cs", "[Uniform, Binding(Sets.Material, 0)]\npublic MaterialData Material { get => Get<MaterialData>(); set => Set(value); }\n\n[Binding(Sets.Material, 1)]\npublic Texture2D Albedo { get => GetTexture(); set => SetTexture(value); }")

Una línea por recurso. El constructor pasa la reflexión del shader a la clase base: `base(parameters, Reflection)`. `Reflection` es el campo estático que declara la mitad generada.

== Paso 4: lógica en la CPU, una vez por draw

Un shader ejecuta su código por cada vértice y cada píxel. Todo lo que es igual para todo el draw es más barato en la CPU. Añádelo a la misma clase y márcalo `[ShaderIgnore]`.

#listing("LitLogic.cs")

El juego nunca tiene que saber cómo se guarda el tinte.

== Paso 5: falla cuando el shader se carga

El constructor de `ShaderBase` compara `reflection.Resources` con el conjunto de parámetros. Un recurso que el shader compilado tiene y que el motor no puede proporcionar lanza una excepción al cargar el shader, con el nombre del recurso en el mensaje. Sin esta comprobación, el mismo error aparecería como una pantalla negra en el primer fotograma que dibuja.

== Cuando tu motor ya tiene un tipo base

Algunos motores te dan una clase de la que heredar. La idea no cambia: la propiedad llama al motor, y el resto del juego usa la propiedad.

#grid-table(
  ("Motor", "Cómo la clase llega a él", "Listado"),
  ("XNA, MonoGame, FNA", "Hereda de `Microsoft.Xna.Framework.Graphics.Effect` y usa `Parameters`", "LitXna.cs"),
  ("Unity", "Guarda el `Material` en un campo marcado `[ShaderIgnore]`", "LitUnity.cs"),
  ("Godot", "Hereda de `ShaderMaterial` y usa `SetShaderParameter`", "LitGodot.cs"),
)

#listing("LitXna.cs")
#listing("LitUnity.cs")
#listing("LitGodot.cs")

Un campo que guarda un objeto del motor no es un tipo de GPU, así que lleva `[ShaderIgnore]`. Heredar de un tipo del motor no entra en conflicto con la mitad generada, porque esa mitad no añade ninguna clase base.

= Carga shaders y crea pipelines

== Una interfaz para la API gráfica

El cargador necesita cuatro cosas de tu capa gráfica. Mantén la interfaz pequeña. Cada backend la implementa una vez.

#listing("IGraphicsDevice.cs")

Fíjate en que `CreatePipelineLayout` recibe los recursos directamente de la reflexión. Tu backend no sabe nada de shaders de C\#: solo recibe una lista de nombres, tipos, accesos y slots, y construye sus propios descriptor sets, root signature o bind group layout.

== Elige el formato para el dispositivo

Una función asigna a cada API gráfica el formato que tu motor publica para ella.

#listing("ShaderFormats.cs")

== El cargador

`ShaderProgram.Load<TShader>` lee los dos campos estáticos de la mitad generada, elige el formato, crea un módulo por punto de entrada y construye el layout a partir de la reflexión. Guarda el resultado en caché por dispositivo y shader.

#listing("ShaderProgram.cs")

#note[El cargador lee los campos estáticos por nombre. No necesita un registro ni una interfaz en el shader. Si tu motor se compila por adelantado y recorta los miembros no usados, conserva `CompiledCode` y `Reflection` con las anotaciones habituales de recorte.]

Si falta el formato, el mensaje le dice a tu usuario qué cambiar: agregarlo a `YotsubaTargets`. Es un ajuste de compilación, no un cambio de código.

== Qué hace cada backend con un módulo

#grid-table(
  ("API", "Entrada", "Crea"),
  ("Vulkan", "Bytes SPIR-V", "Un módulo de shader"),
  ("Direct3D 11 y 12", "Texto HLSL, compilado con DXC o FXC", "Un objeto de shader o una etapa del pipeline state"),
  ("Metal", "Texto MSL", "Una biblioteca y luego una función con el nombre del punto de entrada"),
  ("WebGPU", "Texto WGSL", "Un módulo de shader"),
  ("OpenGL, WebGL", "Texto GLSL", "Un objeto de shader y luego un programa"),
)

== Uniform buffers y la disposición `std140`

El shader lee una struct de uniforms de memoria con una disposición que depende de la API gráfica. La elección común para uniform buffers es `std140`. Sus reglas son pocas: un escalar ocupa 4 bytes. Un vector de dos componentes ocupa 8 bytes y se alinea a 8. Un vector de tres o cuatro componentes se alinea a 16, así que uno de tres componentes ocupa 12 bytes y el siguiente campo puede rellenar el hueco. Una matriz se guarda como columnas de cuatro componentes. Una struct se alinea a 16 y su tamaño se redondea a 16.

No necesitas escribir esos números en ningún sitio. El ayudante de abajo lee los mismos atributos que pusiste en tus tipos en el capítulo 3.

#listing("Std140.cs")

#listing("Std140Test.cs")

#warn[Usa `uint` o `int` para banderas en structs de uniforms, no `bool`. Un `bool` ocupa un byte en la CPU y cuatro en la GPU.]

= Materiales y el bucle de render

== Usar un shader en un juego

Este es todo el código de carga y actualización que necesita un juego. No tiene cadenas ni conversiones.

#listing("Game.cs")

La última línea muestra el sentido del trabajo: un tipo equivocado es un error de compilación en el juego, no un fallo durante un fotograma.

== Mantén visible la frecuencia de actualización

La convención del capítulo 5 se convierte en el bucle de render:

#flow(("Fotograma", "enlaza el set 0"), ("Material", "enlaza el set 1"), ("Objeto", "enlaza el set 2 y dibuja"))

+ Una vez por fotograma, asigna `lit.Frame` y enlaza el set 0.
+ Cuando cambie el material, asigna sus propiedades y enlaza el set 1. Ordena los draws por material para que ocurra lo menos posible.
+ Por cada objeto, asigna `lit.Object` y dibuja.

Como cada grupo es una struct, cada grupo es una sola subida. No asignes los campos de una struct de uniforms uno a uno: construye la struct y asígnala.

== Un objeto de shader por material

`ShaderProgram` es compartido: guarda los módulos y el layout. Un objeto `Lit` guarda los valores de un material. Crea un `Lit` por material y un `ShaderProgram` por shader y dispositivo. Libera los programas cuando el dispositivo desaparezca.

== Notas de rendimiento

- *Resuelve los nombres una vez.* La cadena de `[CallerMemberName]` es una constante que el compilador de C\# escribe en tu código, así que el nombre no cuesta nada en ejecución. Haz que tu `IParameterSet` resuelva cada nombre a un desplazamiento o un slot al crearse, a partir de la reflexión, para que cada `Set` posterior sea una escritura en un arreglo y no una búsqueda por texto.
- *Sin boxing.* `Get` y `Set` son genéricos y `unmanaged`, así que un `float` o una struct nunca se encajan en un objeto.
- *Una subida por grupo.* Una struct de uniforms es una sola escritura. Asigna la struct completa y deja que el backend la suba una vez por set.
- *Crea los objetos de material al cargar, no al dibujar.* Un `Lit` es barato, pero un bucle que crea uno por objeto y por fotograma genera basura sin necesidad.

== Iteración en caliente

Durante el desarrollo, la compilación es tu recarga. Cambia el shader, ejecuta `dotnet build` y el generador reescribe los binarios. Si tu editor debe compilar shaders mientras se ejecuta, usa la API de traducción del capítulo 6 sobre el SPIR-V que produce el compilador.

= Prueba sin tarjeta gráfica

== El lado de CPU es C\# normal

Como el shader habla con el motor a través de `IParameterSet`, una prueba puede usar uno falso. La lógica de tus clases de shader se ejecuta en el servidor de compilación, donde no hay tarjeta gráfica.

#listing("FakeParameterSet.cs")
#listing("LitTests.cs")

== Prueba la reflexión

Cada shader expone sus recursos. Una prueba que lista los nombres que esperas detecta un uniform renombrado antes que tus usuarios.

#listing("ReflectionTest.cs", name: "ReflectionTests.cs")

== Prueba la disposición

El ayudante `Std140` es código normal, así que las pruebas del capítulo 8 se ejecutan en cualquier sitio. Añade una prueba para cada struct de uniforms de cada shader que publiques: es la diferencia entre una imagen correcta y un desalineamiento silencioso.

== Valida los binarios en CI

La compilación ya falla cuando un shader no compila. Añade un paso más: valida el SPIR-V con `spirv-val` de SPIRV-Tools.

#listing("ci.yml", name: ".github/workflows/build.yml")

= Adóptalo en un motor existente

La mayoría de los motores ya tienen efectos, materiales y parámetros por cadena. No tienes que reemplazarlos en un solo paso. Este orden mantiene el motor funcionando después de cada paso.

== Paso 1: marca tus tipos

Añade los atributos del capítulo 3 a los tipos de vector, matriz, textura y sampler que ya tienes. Los atributos son metadatos: nada cambia en ejecución, así que este paso se puede publicar solo.

== Paso 2: escribe un shader nuevo

Elige un shader pequeño y autónomo, como un paso de posprocesado o un material de depuración. Escríbelo con Yotsuba Shader, cárgalo con el cargador del capítulo 8 y dibuja con él. Deja todos los demás efectos como están.

#flow(("Efectos antiguos", "sin cambios"), ("Un shader nuevo", "API tipada"), ("Ambos en el mismo fotograma", "sin conflicto"))

== Paso 3: ejecuta ambos a la vez

El cargador nuevo y el antiguo pueden convivir, porque ambos terminan en la misma API gráfica. Si ya tienes un sistema de materiales, dale un segundo tipo de material que guarde un objeto `ShaderBase` en lugar de un nombre y un diccionario de valores. Dibuja los dos tipos en el mismo bucle de render.

== Paso 4: reemplaza los parámetros por cadena

Busca en el código de tu juego las llamadas que asignan un parámetro por nombre. Cada una es candidata a convertirse en una propiedad:

#snippet(name: "Antes y después", lang: "cs", "// Antes: una cadena, un valor de cualquier tipo\nparameters.Set(\"Exposure\", 1.2f);\n\n// Después: una propiedad, comprobada por el compilador\nlit.Exposure = 1.2f;")

Reemplázalas shader por shader. Después de cada shader, compila: un nombre o un tipo que no coincide ahora es un error del compilador, que es la lista de lo que falta.

== Paso 5: elimina el camino antiguo

Cuando ningún efecto use el formato antiguo, elimina el cargador antiguo y el código de parámetros antiguo. Si los archivos de efectos eran de texto, bórralos: los shaders ahora son archivos C\# del proyecto, junto con el resto de tu código.

== Qué medir

- *Tiempo de compilación.* El generador compila shaders durante la compilación. Limita `YotsubaTargets` a los formatos que publicas y compara el tiempo antes y después.
- *Tamaño del paquete.* Cada formato añade sus binarios al ensamblado. Quita los formatos que no uses.
- *Tiempo de fotograma.* No debería cambiar: la GPU recibe el mismo tipo de shader que antes.

= Publícalo

== Empaqueta tu motor

Tus usuarios referencian un solo paquete. Contiene tus tipos, que llevan los atributos, así que una referencia a `YotsubaShader.Language` viaja con él.

#listing("engine-package.xml", name: "MyEngine.csproj")

Publica los shaders como parte del paquete. Los binarios son datos estáticos dentro de tu ensamblado, así que no hay archivos extra que copiar.

== Mantén esto estable

Tus usuarios escriben shaders contra tus tipos y tus convenciones. Tres cosas los rompen cuando cambian:

- *El orden de los componentes.* El índice 0 es el primer componente. Si `X` deja de ser 0, cada shader que construye un vector cambia de significado.
- *La disposición en memoria que tu motor usa para subir datos.* Los atributos nunca la cambian, así que sigue las reglas de la API gráfica.
- *Los nombres de recursos y los slots.* Renombrar `Frame` o moverlo a otro set rompe cada shader y cada prueba de reflexión.

Trata un cambio en cualquiera de las tres como una versión mayor.

== Bibliotecas de shaders

Una biblioteca de shaders es una biblioteca normal de .NET. Reutiliza tus tipos, construye sobre bibliotecas de otros y comparte las tuyas como paquete. Como los tipos son tuyos, una biblioteca puede describir sus entradas con los tipos que tu motor ya define, y su API de CPU viaja con ella.

== Licencias

#grid-table(
  ("Componente", "Licencia", "Dónde importa"),
  ("Yotsuba Shader", "MIT", "Tu paquete puede ser comercial o no, sin tarifa"),
  ("Roslyn", "MIT", "Dentro del compilador"),
  ("SPIRV-Cross", "Apache-2.0", "Si usas `Transpile` para HLSL o MSL"),
  ("Naga", "MIT o Apache-2.0", "Si usas `Transpile` para WGSL o GLSL"),
  ("Gramática SPIR-V de Khronos", "MIT", "En las tablas del compilador"),
)

Conserva los avisos de los componentes de terceros en el archivo `NOTICE` de tu paquete. El nombre y el logotipo de Yotsuba Shader no están cubiertos por la licencia.

== Documéntalo para tus usuarios

Tus usuarios no deberían necesitar esta guía. Dales tres páginas: cómo agregar el paquete, un shader que compila y dibuja, y una lista de tus convenciones (sets, unidades, sistema de coordenadas). Usa tus propios tipos en cada ejemplo.

= Solución de problemas

#grid-table(
  ("Lo que ves", "Por qué", "Qué hacer"),
  cols: (1.5fr, 1.2fr, 1.4fr),
  ("`InconsistentVectorComponentTypeException`", "Un vector tiene componentes de tipos distintos", "Da a todos los componentes del vector un tipo: `float`, `int` o `uint`"),
  ("`VectorComponentTypeNotValidException`", "Un componente de vector no es `float`, `int` ni `uint`", "Usa uno de los tres, por ejemplo `float` en vez de `double`"),
  ("`InvalidOperationException` en un recurso", "Un campo es a la vez `[Uniform]` y `[StorageBuffer]`", "Elige uno"),
  ("Una struct se trata como un simple grupo de campos", "El tipo no tiene `[Vector]`, `[Matrix]`, `[Texture]` ni `[Sampler]`", "Añade el atributo al tipo que posees, no a un tipo de otro paquete"),
  ("No se encuentra la clase del shader", "Ningún método tiene `[ShaderStage]`, o la clase está en otro proyecto", "Marca al menos un método. Solo se inspeccionan los tipos del proyecto que referencia el generador"),
  ("`CompiledCode` no existe", "La clase no es `partial`, o no se referencia el generador", "Haz la clase `partial` y referencia el generador"),
  ("`Binaries.Msl` no está disponible", "El formato no está en `YotsubaTargets`", "Agrega `msl` y compila de nuevo"),
  ("`El shader no tiene ningún parámetro llamado …`", "El motor no puede proporcionar un recurso que el shader tiene", "Agrega el parámetro en el backend o renombra la propiedad"),
  ("Una pantalla negra sin errores", "Una struct de uniforms tiene distinta disposición en la CPU y en la GPU", "Calcula los desplazamientos con el ayudante del capítulo 8 y pruébalos"),
  ("Dos atributos con el mismo nombre", "Dos espacios de nombres de sintaxis importados en un archivo", "Importa un espacio de nombres de sintaxis por archivo"),
)

#[
#set heading(numbering: none)
= Apéndice A: Lista de verificación

Úsala antes de publicar una nueva versión de tu motor.

#grid-table(
  ("", "Elemento"),
  ("#box(width: 7pt, height: 7pt, stroke: 0.6pt + gray)", "Cada tipo público de vector, matriz, textura y sampler tiene su atributo"),
  ("#box(width: 7pt, height: 7pt, stroke: 0.6pt + gray)", "Un shader que usa cada uno de esos tipos compila sin errores"),
  ("#box(width: 7pt, height: 7pt, stroke: 0.6pt + gray)", "`YotsubaTargets` lista cada API gráfica que el motor soporta, y ninguna más"),
  ("#box(width: 7pt, height: 7pt, stroke: 0.6pt + gray)", "La convención de bindings está documentada y se usa mediante constantes"),
  ("#box(width: 7pt, height: 7pt, stroke: 0.6pt + gray)", "`ShaderBase` valida la reflexión cuando se carga un shader"),
  ("#box(width: 7pt, height: 7pt, stroke: 0.6pt + gray)", "Cada struct de uniforms tiene una prueba de disposición"),
  ("#box(width: 7pt, height: 7pt, stroke: 0.6pt + gray)", "Cada shader tiene una prueba de reflexión con los nombres que el motor espera"),
  ("#box(width: 7pt, height: 7pt, stroke: 0.6pt + gray)", "CI compila, ejecuta las pruebas y valida el SPIR-V"),
  ("#box(width: 7pt, height: 7pt, stroke: 0.6pt + gray)", "El paquete lleva los avisos de sus componentes de terceros"),
  ("#box(width: 7pt, height: 7pt, stroke: 0.6pt + gray)", "Un cambio en el orden de componentes, la disposición en memoria, los nombres de recursos o los slots sube la versión mayor"),
)

#set page(flipped: true)

= Apéndice B: Valores built-in en cada sintaxis

El mismo valor tiene un nombre distinto en cada vocabulario. Para el compilador, todos significan lo mismo.

#include "generated/builtins-es.typ"

= Apéndice C: Atributos de recursos en cada sintaxis

#include "generated/resources-es.typ"

#set page(flipped: false)

= Apéndice D: Glosario

#grid-table(
  ("Término", "Significado"),
  ("Punto de entrada", "Un método marcado con `[ShaderStage]`. La GPU empieza a ejecutar una etapa ahí"),
  ("Etapa", "Un paso del pipeline: vertex, fragment o compute"),
  ("Location", "Un número que une una salida de una etapa con una entrada de la siguiente"),
  ("Built-in", "Un valor que el pipeline proporciona o consume, como la posición en clip space"),
  ("Uniform", "Un valor que se mantiene igual durante un draw o dispatch"),
  ("Storage buffer", "Un arreglo que un shader puede leer y escribir"),
  ("Set y binding", "Dos números que dicen dónde se enlaza un recurso"),
  ("Reflexión", "La descripción de un shader: sus formatos, puntos de entrada y recursos"),
  ("SPIR-V", "El formato binario de shaders que escribe el compilador. Los demás formatos se traducen desde él"),
  ("SPIRV-Cross, Naga", "Los traductores que escriben HLSL y MSL, y WGSL y GLSL"),
  ("`std140`", "Un conjunto de reglas sobre cómo se colocan los campos de una struct en un uniform buffer"),
  ("`[ShaderIgnore]`", "Un atributo que le dice a Yotsuba Shader que un miembro es código de CPU, no parte del shader"),
)

= Apéndice E: Preguntas frecuentes

#grid-table(
  ("Pregunta", "Respuesta"),
  cols: (1fr, 2fr),
  ("¿Mi juego necesita Roslyn o el compilador en tiempo de ejecución?", "No. El compilador se ejecuta durante la compilación. Al juego solo llegan los binarios generados, que son datos estáticos en tu ensamblado."),
  ("¿Puedo publicar solo SPIR-V y traducir en tiempo de ejecución?", "Sí, con la API `Transpile`. Está pensada para editores y herramientas. Para un juego publicado, traduce en tiempo de compilación y evita llevar un traductor en el reproductor."),
  ("¿Qué formatos necesito para un motor Direct3D?", "Solo `hlsl`. Compila el texto con el DXC o FXC que ya uses. Yotsuba Shader no produce DXIL ni DXBC."),
  ("¿Pueden dos shaders usar sintaxis distintas?", "Sí. La sintaxis no cambia el resultado. Importa un espacio de nombres de sintaxis por archivo."),
  ("¿Tengo que hacer mis clases de shader `partial`?", "Solo cuando usas el generador de código, porque añade la otra mitad de la clase. La línea de comandos no lo necesita."),
  ("¿A qué se aplica `[ShaderIgnore]`?", "A cualquier miembro o tipo que sea código de CPU: campos, propiedades, métodos y clases enteras, como una clase base."),
  ("¿Pueden convivir mi clase base y la mitad generada?", "Sí. La mitad generada no añade ninguna clase base, así que sirve cualquier clase de la que heredes, incluido el tipo de otro motor."),
  ("¿Y si mi API gráfica no está en la lista?", "Elige el formato más cercano de `YotsubaTargets`. SPIR-V siempre está disponible, y los formatos de texto cubren casi todas las APIs."),
  ("¿Puedo leer SPIR-V de vuelta a C\\#?", "Esa dirección está planeada y todavía no tiene API."),
)

]

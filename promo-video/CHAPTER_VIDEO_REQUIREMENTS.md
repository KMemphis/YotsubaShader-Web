# Requisitos de los videos de capítulo

Este documento reúne todo lo que debe cumplir el video de un capítulo del tutorial de Yotsuba Shader. Está escrito para pasárselo a Claude como contexto antes de producir cualquier capítulo nuevo. Cada punto viene de una observación del usuario o de un error que ya se corrigió.

Capítulo piloto de referencia: `what-is-a-shader` (inglés). Su código de escenas está en `remotion/src/chapters/whatIsAShader.tsx`.

## 1. Qué es el video

- Hay un video por capítulo, 20 por idioma (inglés y español).
- **El video es el tutorial escrito, no una adaptación.** El texto es el mismo. Lo único que cambia es que se añade mucho contenido visual encima de lo que ya dice el escrito.
- La voz es la del audio de la web (Charon). No se genera otra voz y no se reescribe el texto. El video dura lo mismo que el audio del capítulo más una cola de 6 s con la pantalla final.
- Formato: 1920×1080, 60 fps, H.264.

## 2. Orden de trabajo de cada capítulo

1. El capítulo debe tener su `> [!SAY]` en cada bloque de código, tabla e imagen (ver sección 3). Sin eso el audio los salta.
2. Regenerar el audio de ese capítulo: `node tts.mjs --lang <l> --only get-started/<página> --force --voice Charon --model gemini-3.8-flash-tts`. El modelo `gemini-2.5-flash-preview-tts` tiene un cupo de 100 peticiones al día y suele agotarse; el 3.8 funcionó cuando el 2.5 no.
3. Reconstruir la web (`node build.mjs`) y extraer los datos: `node automation/chapter-data.mjs <lang> get-started/<página>`. Esto crea `remotion/src/chapters/data/<lang>.<página>.json`, copia el mp3 y copia las imágenes del capítulo a `remotion/public/chapters/`.
4. Montar las escenas (sección 6), revisar fotogramas sueltos, y recién entonces renderizar el video completo.
5. El primer capítulo de cada idioma se revisa con el usuario antes de replicar.

## 3. El audio debe describir lo que se ve

El audio del escrito no lee código, tablas ni imágenes. Para el video hay que describirlos con `> [!SAY]` (texto que solo dice el audio):

- Describir de forma creativa, no robótica. Ejemplo de imagen: "En esta imagen podemos ver el concepto de forma visual. Hay un cuadrado con cuatro esquinas…".
- Ejemplo de código: "Crearemos una clase estática llamada Crear, y colocaremos tres métodos, uno llamado Vec2, otro Vec3 y otro Vec4…". Se explica qué hace el código y por qué, no se deletrean los símbolos.
- Las tablas se leen de izquierda a derecha, fila por fila, diciendo qué significa cada una.
- El `[!SAY]` va justo **después** del bloque que describe.
- Pronunciación: el audio usa "C sharp" y "Yot soo ba" en inglés, y "Ce sharp" y "Yot su ba" en español (reemplazos en `tts.mjs`). El texto escrito sigue siendo "C#" y "Yotsuba".
- Nada de relleno ni palabras absolutas que no aportan ("exactamente", "exactly", "always", "extremely", "completely") y nada de frases típicas de IA ("Let's dive in", "Imagine", listas de tres por reflejo, "No es X, es Y").

## 4. Estilos de código (GLSL, HLSL, MSL, WGSL, SPIR-V)

- En la **web escrita** cada ejemplo existe en los cinco estilos, con un desplegable "Estilo" abajo del encabezado a la derecha, como el "Language: Swift" de la documentación de Apple.
- En el **video** el código siempre se muestra en **pantalla dividida GLSL | HLSL**. No se muestran los otros tres estilos.
- Hay que mencionar, una vez, que existen más estilos: mostrar el desplegable de la documentación, explicar qué implica elegir un estilo u otro (solo cambian las palabras de la interfaz, como `location` o `TEXCOORD`; el compilador da el mismo resultado) y decir que **el tutorial escrito tiene el paso a paso de cada estilo**.
- En los primeros videos con un shader completo se muestra un ejemplo con las 5 pestañas de salida: GLSL/GLSL ES, HLSL, Metal, SPIR-V y C++. En los siguientes basta un recordatorio breve.
- Los capítulos sin código de shader (por ejemplo `what-is-a-shader`, cuyo código es C# normal) usan un solo panel.

## 5. Estilo visual

Debe parecerse a los visuales actuales, pero más Apple y menos aspecto de IA.

- **Paleta: solo la de la web y la del logo.** Rosa `#ff7ab2`, violeta `#c5a3ff`, menta `#62f0d0`, más grafito (`#0e0e10`, `#1c1c1e`) y blanco. Nada de coral, ámbar, azul ni colores inventados. Las fotos reales conservan sus colores y el código usa los colores de sintaxis de la web.
- **Artístico en el sentido del arte**: color, composición y proporción. Formas planas de un solo color, mucho aire, un foco por escena, composiciones tipo cartel (círculos, cuadrados y medios círculos). No artístico al estilo "tecnología/futurista": nada de neón, brillos, rejillas de circuitos, degradados sobre negro ni hologramas.
- Sin chips ni píldoras, sin paneles translúcidos ni vidrio. Formas sólidas y planas, etiquetas simples con una línea de color.
- Tipografía grande y limpia (Inter), pesos 600–700, espaciado ajustado.
- Los textos nunca se solapan y nada de contenido importante debajo de y≈900 (ahí van los subtítulos).
- Cada sección (`h2`) abre con una tarjeta de color liso con su título. Los números grandes de las partes van como marca de agua.

## 6. Imágenes

- **Prioridad: usar las imágenes que ya están en el tutorial escrito** (`Web/learn/content/assets/get-started/...`) si el capítulo ya tiene una para ese momento. No buscar ni hacer una nueva en su lugar.
- Mostrarlas grandes (ancho 1620) sobre fondo blanco, mientras dura el `[!SAY]` que las describe.
- Solo donde el capítulo no tiene imagen se añade material nuevo: fotos de licencia libre (Wikimedia Commons), diagramas animados propios o capturas reales de los shaders.
- Toda foto de terceros lleva su crédito en pantalla (autor, Wikimedia Commons y licencia) y se repite en una tarjeta final de créditos.
- Fotos ya descargadas en `remotion/public/chapters/photos/`: `gpu.jpg` (ya estaba en el tutorial), `cpu-die.jpg` y `pixels.jpg`.

## 7. Sincronización

- **El audio no se toca.** Lo que se desfasa son las imágenes cuando se ponen en segundos fijos adivinados. Está prohibido temporizar con "5 segundos después del párrafo".
- Toda aparición, resaltado o animación se cuelga del momento exacto de la frase: `S(c, bloque, frase)` (inicio de una frase) o `W(c, bloque, frase, fracción)` (un punto dentro de la frase). Los tiempos salen del `.json` del audio.
- Las frases de un bloque coinciden con pausas reales del audio, así que se puede confiar en ellas.
- Comprobar el desfase con: `ffmpeg -i <video> -af silencedetect=noise=-38dB:d=0.35 -f null -` y comparar con las pausas del mp3 original. El desfase aceptable es el de 0,05 s constantes.
- Los subtítulos son la frase que se está leyendo, centrada abajo, con las palabras ya dichas en blanco y las que faltan en gris. En escenas con fondo de color liso o blanco el texto cambia a tinta oscura.

## 8. Contenido que no puede faltar o contradecirse

- Si el audio dice "comparamos dos chips", se ven los dos chips. Cada cosa que menciona el audio debe aparecer en pantalla cuando se menciona.
- Cada escena que enseña código resalta la línea que se está explicando, siguiendo la voz.
- Los números (por ejemplo 1920×1080, 2.073.600 píxeles, 124 millones de colores por segundo) aparecen en la frase en que se dicen.

## 9. Pantalla final

- **Todos los videos terminan con el logo de Yotsuba Shader**, en una pantalla igual a la de la portada de la web: fondo `#070c12`, el logo con "Yotsuba Shader" (Yotsuba en blanco, Shader con el degradado rosa-violeta-menta), el titular "Write shaders in C#" con "in C#" en rosa, y debajo "An SDK for many graphics APIs and game engines" en gris. En español: "Escribe shaders en C#" y "Un SDK para muchas APIs gráficas y motores de juego".
- Aparece cuando termina la voz y dura 6 s (`TAIL` en `core.tsx`; el componente es `EndCard`). Va después de los créditos de fotos del capítulo.

## 9b. Apertura, animación e idiomas

- **El video empieza igual que termina:** la misma pantalla del logo durante los primeros 4 s (`LEAD` en `core.tsx`; el audio arranca después de ese tramo y todos los tiempos se desplazan).
- **Todo concepto debe entenderse sin audio.** Cada idea lleva una animación o un esquema propio (flujo, comparación, carrera, contador, grilla que cambia), no solo texto. El público se aburre con pantallas estáticas: nada queda quieto más de unos segundos, y los fondos de color llevan formas que se mueven despacio.
- **Español:** se genera con la misma escena (`c.lang`, helper `X(c)(en, es)`), con su propio audio, sus datos (`data/es.<página>.json`) y su composición `Chapter-<página>-es`. El código usa nombres en español (`entidades`, `indice`). Las imágenes del tutorial en español están en `chapters/assets/get-started/` (sin `en/`). Si las frases de un bloque no coinciden entre idiomas, ajustar los índices por idioma.
- El tutorial usa NuGet (`dotnet yotsuba`), nunca `git clone`: cualquier código o texto de instalación en el video sigue eso.

## 10. Producción técnica

- Código: `remotion/src/chapters/` (`core.tsx` motor, `auto.tsx` escenas automáticas, un archivo por capítulo para los ajustes a mano). Extractor: `automation/chapter-data.mjs`.
- Comprobar con fotogramas antes del render completo: `npx remotion still remotion/index.ts <Composición> <archivo.png> --frame=<segundo×60> --public-dir=remotion/public`.
- Render: `npx remotion render remotion/index.ts <Composición> out/chapters/<capítulo>.<lang>.mp4 --public-dir=remotion/public --codec=h264 --crf=16 --pixel-format=yuv420p --audio-codec=aac --audio-bitrate=320k --timeout=120000`. Un capítulo de 9 minutos tarda unos 25 minutos. Si se queda colgado ("Session closed"), matar el proceso y repetir.
- Publicar en la web: subtítulos `.vtt`, portada y `publish-video.mjs`, y poner `video:` en el frontmatter del capítulo. Solo después de que el usuario apruebe.
- Se trabaja solo dentro de `Web/` y en Markdown. La compilación de C# se hace en copias de la carpeta temporal.

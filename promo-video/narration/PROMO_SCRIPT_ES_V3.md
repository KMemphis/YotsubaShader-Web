# Guion de reemplazo — vídeo de presentación en español

**Formato:** 16:9, 4K, 60 fps · **Duración objetivo:** 75 segundos ·
**Generación:** Remotion (`Web/promo-video/remotion/`) · **Tono:** claro,
técnico y directo.

Este guion separa lo disponible hoy de la hoja de ruta. Las afirmaciones sobre
compilación completa, configuración de destinos y diagnósticos por backend se
presentan como trabajo en desarrollo, tal como lo hace el sitio.

## 0:00–0:08 — La propuesta

**Imagen:** logotipo sobre fondo oscuro; aparece una clase C# y se transforma
en un diagrama de shader.

**Locución:**

> Yotsuba Shader es un SDK para escribir shaders en C#. Tu shader forma parte
> de tu proyecto: usa el mismo lenguaje, los mismos tipos y las mismas
> bibliotecas.

**Texto en pantalla:** `Shaders en C#` · `Un solo proyecto`

## 0:08–0:19 — Etapas del pipeline

**Imagen:** una línea de pipeline. Se iluminan Vertex, Fragment y Compute;
las demás etapas aparecen con una etiqueta discreta «En la hoja de ruta».

**Locución:**

> Hoy puedes declarar puntos de entrada de vertex, fragment y compute con C#
> normal. Geometry, hull, domain y las etapas de ray tracing forman parte de
> la hoja de ruta.

**Texto en pantalla:** `Vertex · Fragment · Compute` / `Próximamente: Geometry · Hull · Domain · Ray tracing`

## 0:19–0:32 — Cinco vocabularios conocidos

**Imagen:** el mismo shader alterna, mediante pestañas, entre HLSL, GLSL, MSL,
SPIR-V y WGSL; los nombres equivalentes convergen hacia una IR común.

**Locución:**

> Escribe con el vocabulario de shaders que tu equipo ya conoce. Las bibliotecas
> de sintaxis HLSL, GLSL, MSL, SPIR-V y WGSL comparten el mismo modelo
> semántico, para que atributos, tipos y recursos conserven un significado
> común.

**Texto en pantalla:** `HLSL · GLSL · MSL · SPIR-V · WGSL` · `Un modelo semántico`

## 0:32–0:44 — Los mismos tipos, CPU y GPU

**Imagen:** `MyEngine.Vector3` y una textura del proyecto reciben atributos;
una flecha los conecta con tipos nativos de GPU. Mostrar una grabación real del
Playground al final del plano.

**Locución:**

> Reutiliza los vectores, matrices, texturas y estructuras de tu aplicación.
> Con atributos explícitos se convierten en tipos nativos de GPU, sin mantener
> dos versiones del mismo modelo de datos.

**Texto en pantalla:** `Tipos de tu proyecto → tipos de GPU` · `Sin duplicación`

## 0:44–0:57 — Destinos de compilación

**Imagen:** flujo visual `C# → Yotsuba IR → SPIR-V → ShaderCross →` tarjetas
de SPIR-V, HLSL, GLSL, GLSL ES y MSL. La tarjeta WGSL se muestra con una chapa
«Planificado».

**Locución:**

> El flujo de compilación en desarrollo parte de C#, genera una representación
> intermedia y apunta a SPIR-V. Desde ahí, Yotsuba ShaderCross prepara HLSL,
> GLSL, GLSL ES y MSL. WGSL continúa planificado.

**Texto en pantalla:** `Flujo en desarrollo` · `SPIR-V · HLSL · GLSL · GLSL ES · MSL` · `WGSL: planificado`

## 0:57–1:07 — Integración y diagnósticos

**Imagen:** un `.csproj` conceptual con destinos marcados y después el editor
mostrando errores de C#. Las dos vistas llevan la etiqueta «En desarrollo».

**Locución:**

> La integración de build permitirá elegir los destinos desde el proyecto, y
> los diagnósticos específicos de shader y compatibilidad por backend están
> previstos. Mientras tanto, el Playground ya descubre shaders y muestra los
> diagnósticos de C#.

**Texto en pantalla:** `Build y diagnósticos por backend: en desarrollo` · `Playground: descubrimiento y diagnósticos de C#`

## 1:07–1:15 — Cierre y llamada a la acción

**Imagen:** grabación real del Playground seguida del logotipo, URL del
repositorio y botón de llamada a la acción.

**Locución:**

> Escribe shaders como escribes el resto de tu motor. Explora el Playground,
> consulta la documentación y ayúdanos a definir los próximos destinos.

**Texto en pantalla:** `Yotsuba Shader` · `Prueba el Playground` · `github.com/KMemphis/YotsubaShader`

## Notas de producción para Remotion

- Mantener las grabaciones del sitio y del Playground como evidencia de las
  funciones actuales; no simular resultados de compilación como si ya fueran
  reales.
- Usar una chapa visual constante: `EN DESARROLLO` para el flujo completo de
  compilación, `.csproj` y diagnósticos por backend; `PLANIFICADO` para WGSL y
  las etapas futuras.
- La composición debe sustituir las salidas que consume la portada:
  `promo-es-1080.mp4`, `promo-es-2160.mp4` y `poster-es.webp`; crear una
  equivalente en inglés solo tras traducir y revisar la locución.
- La implementación debe vivir en `Web/promo-video/remotion/`; las fuentes de
  vídeo resultantes se publican en `Web/src/static/video/`.

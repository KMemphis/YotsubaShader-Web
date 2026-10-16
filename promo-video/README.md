# Video promocional (4K, 60 fps)

Entregables en esta carpeta:

| Archivo | Qué es |
|---|---|
| `YotsubaShader_Promo_en_4K60.mp4` | Video de 58 s en inglés, 3840×2160 a 60 fps |
| `YotsubaShader_Promo_es_4K60.mp4` | El mismo video en español |
| `YotsubaShader_Intro_Memphis_4K60.mp4` | Tu video de introducción, suelto, a 4K 60 fps con su sonido |

Los dos videos de 58 s no incluyen tu introducción: se colocan después de ella. La voz en off está en `narration/VOZ_EN_OFF.md`.

Código y fuentes: `remotion/` (proyecto editable), `remotion/public/*.mp4` (grabaciones reales 4K60 del sitio y del Playground), `automation/` (scripts), `VERIFIED_FEATURES.md`.

```bash
npm install
node ../build.mjs --serve           # el sitio en http://localhost:4173 (otra terminal, desde Web/)
node automation/sync-snippets.mjs   # copia los ejemplos de código del sitio
npm run record                      # graba el Playground y el sitio en inglés
LOCALE=es npm run record            # lo mismo en español
npm run render:all                  # renderiza los dos videos
npm run studio                      # editar en Remotion Studio
```

- **Cuando cambie la web**, vuelve a ejecutar `sync-snippets`, `record` (en los dos idiomas) y `render:all`. Los videos muestran la web tal como está en ese momento.
- **Música:** `remotion/public/music.wav` es un colchón ambiental sintetizado con FFmpeg; puedes cambiarlo por una pista con licencia.
- Los videos que se ven en la home están en `../src/static/video/` (1080p y 2160p, codificados desde estos).

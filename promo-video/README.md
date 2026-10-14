# Video promocional (4K, 60 fps)

Entregables: `YotsubaShader_Promo.mp4` (final, 3840×2160 a 60 fps), `YotsubaShader_Promo_v1.mp4` y `_v2_apple.mp4` (versiones anteriores), `remotion/` (proyecto editable),
`remotion/public/*.mp4` (grabaciones originales 4K60; los fotogramas sueltos se borran al codificar), `automation/` (scripts), `VERIFIED_FEATURES.md`.

```bash
npm install
node ../build.mjs --serve           # el sitio en http://localhost:4173 (otra terminal, desde Web/)
npm run narration                   # voz temporal (macOS `say`) ajustada a cada escena → narration/*.wav
node automation/sync-snippets.mjs   # copia los ejemplos de código del sitio
npm run record                      # graba el Playground y el sitio con Playwright (fotograma a fotograma)
npm run verify                      # compila los ejemplos del Playground con el compilador real
npm run studio                      # editar en Remotion Studio
npm run render                      # YotsubaShader_Promo.mp4
```

- **Tu voz:** sustituye `narration/<id>.wav` (s1, s2, s3a…s5) por tus grabaciones y copia a `remotion/public/narr/`. La duración y los subtítulos salen de `narration/script.json` y `timing.json`.
- **Tu cara:** guarda `remotion/public/presenter.mp4` (10 s); la primera escena lo usa de fondo automáticamente.
- **Música:** `remotion/public/music.wav` es un colchón ambiental sintetizado con FFmpeg; puedes cambiarlo por una pista con licencia.

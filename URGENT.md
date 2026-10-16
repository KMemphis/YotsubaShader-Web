# URGENTE: poner la URL pública de la web

La web todavía no tiene dominio. Por eso el SEO bilingüe está a medias.

## Qué pasa hoy (sin `SITE_URL`)

| Pieza | Estado |
|---|---|
| `canonical` | Sale, pero con dirección relativa (`../es/...`). |
| `hreflang` (en, es, x-default) | Sale, pero con direcciones relativas. |
| `robots.txt` | Sale, sin línea `Sitemap:`. |
| `sitemap.xml` | **No se genera.** Exige direcciones absolutas. |
| Página 404 | Lleva `noindex`. |

Los buscadores esperan direcciones absolutas en `canonical`, `hreflang` y el sitemap. Con direcciones relativas pueden ignorarlas y mezclar `/` y `/es/`.

## Qué hacer cuando haya dominio

1. Construye la web indicando la URL, sin barra final:

   ```bash
   SITE_URL=https://tu-dominio.com node build.mjs --strict-i18n
   ```

2. Comprueba que existen `dist/sitemap.xml` y `dist/robots.txt` (con la línea `Sitemap:`).
3. Comprueba que `dist/index.html` tiene `canonical` y `hreflang` absolutos.
4. Si prefieres dejarla fija, cámbiala en `src/site.mjs` (`SITE.url`) en vez de usar la variable.
5. Publica el sitemap en Google Search Console y Bing Webmaster Tools.

## Importante

- La web usa enlaces que empiezan por `/` (`/css/site.css`). Solo funciona en la **raíz** de un dominio. No sirve en una subcarpeta como `usuario.github.io/YotsubaShader-Web/`. Hace falta un dominio propio o un sitio de usuario/organización de GitHub Pages.
- Mientras no haya dominio, `og:image` también queda relativa. Las redes sociales piden una dirección absoluta, así que las vistas previas al compartir pueden no mostrar la imagen.

## Dónde está el código

- `src/site.mjs`: `SITE.url` (lee `SITE_URL`).
- `src/layout.mjs`: `seoTags()` (canonical y alternates).
- `build.mjs`: genera `robots.txt` y `sitemap.xml`.

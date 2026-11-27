# Yotsuba Shader website

Static website for Yotsuba Shader, modelled on the Apple Developer site: a thin global bar, a
sub-navigation strip per section. **Every navigation entry is its own URL**; nothing relies on in-page scrolling.
The documentation is not part of this site: it lives at https://learn.yotsubashader.com (`learn/`).

| Section | URL | Sub-pages |
| --- | --- | --- |
| Home | `/` | `/whats-new/` (`/resources/` redirects to learn.yotsubashader.com) |
| Get Started | `/get-started/` | `first-shader/`, `build-from-source/` |
| Styles | `/styles/` | `hlsl/`, `glsl/`, `metal/`, `vulkan/`, `wgsl/` |
| Technologies | `/technologies/` | `language/`, `compiler/`, `intermediate-representation/`, `spir-v/` |
| Community | `/community/` | `contributing/`, `licensing/` |
| Documentation | https://learn.yotsubashader.com/en/reference/ | 8 pages (5 syntaxes, `compile`, `add`, plugins), in `learn/` |
| Donations | `/donations/` | `sponsors/` |

## Run it

Requires Node 18 or newer. There are no dependencies to install.

```bash
cd Web
npm run dev      # build, serve on http://localhost:4173 and rebuild on change
npm run build    # write the static site to Web/dist
```

`dist/` is plain static HTML/CSS/JS and can be hosted anywhere (GitHub Pages, Netlify, S3...).
Internal links are relative, so it also works under a sub-path such as `/YotsubaShader/`.
The build fails if any internal link is broken.

## Layout

```
build.mjs                 generator (pages -> dist, search index, link check, dev server)
src/site.mjs              navigation and sub-navigation
src/layout.mjs            global bar, sub-nav, footer
src/components.mjs        icons, code blocks, tabs, tables, callouts, cards
src/highlight.mjs         build-time C# / bash / SPIR-V syntax highlighting
src/snippets.mjs          code samples shared by several pages (mirror the README)
src/reference.mjs         reads ../Core/Syntax/YotsubaShader.*Syntax (read-only; paths in src/repo-paths.mjs) to generate attribute reference
src/pages/*.mjs           the marketing pages
src/i18n/                 translation engine (index.mjs) and dictionaries (es/*.json)
src/data/releases.json     releases and contributors of the repo, read by What's New (refresh: npm run releases)
src/static/               css, js and images copied as-is
```

- **Add a page:** add an object `{ path, section, title, description, body }` to a file in
  `src/pages/` (the path is the URL). Add it to `SECTIONS` in `src/site.mjs` if it should appear in a
  sub-navigation strip.
- **Link to the documentation:** write `__LEARN__/reference/<page>/` in an `href`; the build turns it into
  `https://learn.yotsubashader.com/<lang>/reference/<page>/` for each language. Old `/documentation/...` addresses are
  redirect pages (`DOC_REDIRECTS` in `build.mjs`).
- **Attribute reference:** `src/reference.mjs` still reads the `YotsubaShader.*Syntax` projects for the Syntaxes pages, and
  `learn/tools/gen-syntax-reference.mjs` uses it to write the five syntax pages of the documentation. The cross-syntax
  tables in `src/reference.mjs` are curated by hand; update them when attributes are added.
- Visitors can pick an authoring style (HLSL, GLSL, Metal, Vulkan, WGSL) once; every code tab on
  the site follows it (stored in `localStorage`).
- Search (`Ctrl/⌘ K`) uses `dist/search-index.js`, built from the page text.

## Languages

The site is written in English and built twice: English at `/` and Spanish at `/es/`. Pages are not duplicated:
the generator renders each page in English and translates the final HTML with the dictionaries in
`src/i18n/es/*.json`, where every entry maps a piece of English HTML (a paragraph, a heading, a table cell…) to
its translation. Code is never translated, except its comments (`comments.json`); strings used by the browser
scripts live in `ui.json`; names that must stay as they are (brands, API names) are listed in `keep.json`.

```bash
node build.mjs                      # builds both languages and prints what is not translated yet
node build.mjs --i18n-all           # lists every missing text and every unused entry
node build.mjs --i18n-missing       # prints the missing texts as JSON, ready to be translated
node build.mjs --strict-i18n        # fails when something is missing or unused (for CI)
```

When you change an English text, its dictionary entry stops matching: the build reports the new text as missing
and the old one as unused. The language menu links to the same page in the other language, remembers the choice
(`localStorage`, key `ys-lang`) and English pages open the Spanish version when the browser is set to Spanish.

## Content notes

- The site describes the product as released: there are no status badges. Keep the output-targets table in
  `src/pages/technologies.mjs` and the package and command names in `src/snippets.mjs` in sync with what ships.
- The Donations pages describe the Sponsors / commercial-license mechanism from the repository, but
  do not link a payment channel. Add one in `src/pages/community.mjs` when it exists.

## Logos of third-party technologies

Logos are used only where the owner publishes them for reference; everything else is shown by name.

| Logo | Source | Terms |
| --- | --- | --- |
| Vulkan, OpenGL, WebGL, SPIR-V | `khronos.org/assets/images/api_logos/*.svg` (see khronos.org/trademarks) | Khronos trademark and logo guidelines; trademark legends are in the site footer |
| WebGPU | W3C `webgpu-notext.svg` (w3.org/2023/02/webgpu-logos.html) | CC BY 4.0, credited "WebGPU logo by W3C" in the footer |
| Metal, Direct3D / DirectX | not used | Apple and Microsoft do not license their logos to third parties; names only |

The diagram and the backend list come from `src/backends.mjs`. Logos are drawn on light chips so they keep
their official colors on the dark theme. Add or change a target there; the home diagram, the home card and
the SPIR-V "Output targets" table all update.

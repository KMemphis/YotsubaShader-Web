# learn.yotsubashader.com

Guides, tutorials and reference for Yotsuba Shader, generated from Markdown. Static output, no dependencies (Node 18+).

```bash
cd Web/learn
npm run dev     # http://localhost:4174, rebuilds on change
npm run build   # writes dist/ ; fails on broken links or missing frontmatter
```

## Sections

Four sections, defined in `site.config.mjs` (`SECTIONS`): `custom-engine`, `engines`, `get-started`, `reference`.
Each one is a folder `content/<lang>/<section>/` with an `index.md` (the section overview) plus one `.md` per chapter.
Languages: `en` and `es`, mirrored by file name (the language menu keeps you on the same page).

## Writing a chapter

```markdown
---
title: Your first shader
summary: One sentence shown under the title and in search.
order: 2                 # position in the sidebar
status: planned          # optional: shows a "Planned" badge (use it for anything not implemented)
---
```

Supported Markdown: headings (`##`/`###` feed "On this page"), lists, tables, images (`![alt](../../assets/x.png)` with files in `content/assets/`),
links between chapters (`[text](../reference/compiler.md#targets)`, validated at build time), fenced code, and callouts:

```markdown
> [!NOTE]  > [!TIP]  > [!WARNING]  > [!IMPORTANT]  > [!PLANNED]
```

**Buttons:** a `buttons` fence with one link per line becomes a row of buttons (links are validated like any other).

````markdown
```buttons
[MonoGame](../engines/monogame.md)
[Unity](../engines/unity.md)
```
````

**Style tabs:** consecutive fences with `style=hlsl|glsl|metal|vulkan|wgsl` become one tab group; the reader's choice is remembered site-wide.

````markdown
```csharp style=hlsl
...
```
```csharp style=glsl
...
```
````

## Routes (one Get Started per engine)

`content/<lang>/get-started/*.md` is a single source rendered once per route: MonoGame (default URLs), `/kni/`, `/fna/` and `/godot/`. Routes live in `ROUTES` and `ROUTE_TEXT` in `site.config.mjs`; the engine is resolved in `lib/routes.mjs`.

- `{{var}}` and `{{macro arg}}` insert route text (for example `{{register Colors}}` or `{{vertexType}}`).
- `:::godot ... :::` and `:::xna ... :::` (MonoGame + KNI + FNA) emit a block in that route only.
- Restart `node build.mjs --serve` after editing `site.config.mjs`: it caches modules.
- Godot screenshots go in `content/assets/get-started/godot/en/` and are shared by the English and Spanish chapters.

## Engines

The engine row on the home page comes from `ENGINES` in `site.config.mjs` and shows names only (no logos). Each engine needs `content/<lang>/engines/<id>.md`.
The MonoGame, KNI, FNA and Godot guides are complete (the Godot one is the reference for the Godot route); the other engines (Stride, Unity, Silk.NET) are placeholders marked `status: planned`.

## Deploy

Published with GitHub Pages at `https://learn.yotsubashader.com`. Pages gives one site per repository and the main site already uses the one of this repo, so `learn` is published from the compiler repo (`KMemphis/YotsubaShader`, workflow `.github/workflows/learn.yml`), which checks out this repo, builds `learn/` and deploys `learn/dist`.

- Setup, once: in the compiler repo, Settings → Pages → Source "GitHub Actions", custom domain `learn.yotsubashader.com`, Enforce HTTPS. In the DNS add a `CNAME` record `learn` → `kmemphis.github.io`.
- If this repo is private, add the secret `WEB_REPO_TOKEN` (read access to this repo) to the compiler repo.
- A push that changes `learn/**` runs `.github/workflows/learn-notify.yml` here, which sends `repository_dispatch` (`learn-updated`) to the compiler repo. It needs the secret `LEARN_DISPATCH_TOKEN` (a token with write access to the compiler repo). Without it, run the workflow by hand (`workflow_dispatch`).
- Manual build: `SITE_URL=https://learn.yotsubashader.com npm run build` (adds absolute `canonical`/`hreflang`, `sitemap.xml`, `robots.txt`).
- Optionally 301 `docs.yotsubashader.com` to `learn.`. Set `SITE.editUrl` in `site.config.mjs` to show an "Edit this page" link.

Paths are root-absolute (`/en/...`), so the site must be served from the root of its own (sub)domain.

## Chapter videos

A chapter shows a video at the top when its frontmatter has `video: <id>` (e.g. `video: ep01`). Each language page only loads the file of its own language,
`videos/<lang>/<id>.mp4` with its `.vtt` subtitles, `.jpg` poster and `.json` (title, minutes). If the file for a language is missing, the page is built without a video.

Publish a rendered episode (from `Web/promo-video`, after rendering `Ep0N-en` and `Ep0N-es` and exporting subtitles with `automation/ep01-export.mjs`):

```bash
node automation/publish-video.mjs ep01 "What is a shader?" en
node automation/publish-video.mjs ep01 "¿Qué es un shader?" es
```

Then add `video: ep01` to the first chapter that video covers, in both languages. The `.mp4` files are git-ignored (too big); deploy them with the site.

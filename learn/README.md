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
links between chapters (`[text](../reference/compile.md#targets)`, validated at build time), fenced code, and callouts:

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
`engines/<id>.md` for MonoGame, KNI, FNA and Godot are stubs with `redirect: <routeId>`: the sidebar links straight to the Get Started of that engine. The real engine documentation lives in `engines/<id>-reference.md`. The other engines (Stride, Unity, Silk.NET) are placeholders marked `status: planned`.

## Documentation (`reference/`)

The Documentation section has exactly eight pages, in English and Spanish: the five syntaxes (`hlsl`, `glsl`, `msl`, `spirv`, `wgsl`), and the three commands of the compiler (`compile`, `add`, `plugins`), plus the `index` hub. The main site (`Web/`) has no documentation of its own: it links here with `__LEARN__/reference/...`.

- The five syntax pages are generated: `node tools/gen-syntax-reference.mjs` reads the `YotsubaShader.*Syntax` projects of the compiler repository (the folder that contains `Web/`) and rewrites `content/<lang>/reference/{hlsl,glsl,msl,spirv,wgsl}.md`. Run it when the attributes change and commit the result; building `learn` never needs the compiler repository.
- `compile`, `add` and `plugins` describe the CLI of `Core/YotsubaShader.Compiler.CLI`. Check them against `Program.cs`, `Args.cs` and `PluginCommand.cs` when the CLI changes.

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

## Listen stage (motion graphics while a page is read aloud)

On a wide screen (1100px or more), pressing **Listen** on a page that has a stage folds the chapter list into a three-dot button, hides "On this page",
moves the text to the left half and shows motion graphics on the right half. The stage has no audio or subtitles of its own: everything on it follows
the page's narration (`audio.currentTime`), so pause, a click on a word or a click on the stage's progress bar always shows the right frame.
Below 1100px, or on a page without a stage, Listen works as before.

A stage has two parts:

1. **Cues in the chapter**: one line per scene, placed before the paragraph (or heading) where the scene starts. They only add lines: the text of the
   chapter, and so its audio, does not change.

   ```markdown
   > [!SCENE] cores

   A MacBook Air M5 usually has 10 cores in its CPU. ...
   ```

2. **The scenes**, in `stage/<section>/<page>.mjs` (e.g. `stage/get-started/what-is-a-shader.mjs`), one array for both languages:

   ```js
   export default [
     {
       id: 'cores',
       // phrases of the narration, one per language; items appear when the voice says them
       beats: { ten: { en: '10 cores', es: '10 núcleos' }, gpu: { en: 'A GPU, on the other hand', es: 'Una GPU, en cambio' } },
       items: [
         { k: 'kicker', text: { en: 'Threads at the same time', es: 'Hilos a la vez' } },
         { k: 'cores', cpu: 'ten', gpu: 'gpu' },
         { k: 'text', at: 'gpu+1.5', text: { en: '<b>thousands</b>', es: '<b>miles</b>' } },
       ],
     },
   ];
   ```

   - A scene starts at the first spoken word after its cue and ends where the next scene starts.
   - `at` / `out` / `strike` take a beat name, `'beat+0.5'` (seconds after it) or a number of seconds from the start of the scene.
   - `{ en, es }` becomes the page's language, `{{engine}}` and the other route vars are replaced, and `{ title, code, lang: 'csharp' }` is highlighted
     like the article's code.
   - Item kinds (`k`): `kicker`, `title`, `text`, `word`, `big` (with `count`), `box`, `arrow`, `img`, `logo`, `code` / `term` (types itself from
     `type` at `cps` characters per second, with `hl` line highlights, `marks`, `tags`), `row` (items side by side), `slot` (items on top of each
     other, shown by `at` / `out`) and `morph` (a code block that turns into another: `from`, `to`, `morph` beat, `dur`, `fresh`, `hl`).
   - `gl` is the workhorse: live WebGL2 shaders, written as the GLSL body of `vec4 shade(vec2 uv, float t)` (`uRes` is the tile size, `uTex` the
     texture when the block has `tex: '/path.jpg'` and the tile `tex: true`). `uv.y` grows upwards here, the opposite of the tutorial's `Uv`.
     A block has `tiles: [{ frag, aspect, cap, at, modes: [{ at, frag }], marks }]`, `cols`, `gap`, `radius` and `cls`: `cls: 'window w50'` draws
     an engine window (`title`, `logo`) and `w40` … `w86` set its width. Beware: a local variable called `t` clashes with the `t` parameter.
   - Other kinds: `shader` (older single canvas), `file`, `bytes`, `keys`, `rule`, `list`, `race`, `trip` (the journey of a drawing), the
     diagrams `stack`, `cores`, `array`, `grid`, `pixels`, `fragment`, `stages`, `pipeline`, `tri`, `shapes`, `coords`, `calls`, `transform`, `rgba`,
     `uv`, and `world` scenes (every item has a place, a `cam` moves over them). Their options are in `static/js/stage.js` (`KINDS`).
   - Any item also takes `fx` (`up`, `pop`, `left`, `right`, `fade`), `mark: { at, kind: 'check' | 'x' }` and `strike`.
   - `{ route: { godot: …, default: … } }` picks a value per Get Started route (e.g. Godot's door A). `dense: true` on a scene packs many lines
     (summaries) so they fit.
   - Cues outside `:::xna` / `:::godot` blocks give every route the scene. A chapter whose text differs per route (`visor`, `next-steps`) puts
     route-specific cues inside the blocks (`x_…`, `g_…`): the build keeps only the scenes whose cue is on that route's page.
   - Phrases are matched as whole words, so write them the way they are spoken (inline code is spoken, tables and code blocks are not).

The build fails if a cue has no scene. A beat phrase that is not in the narration is reported in the browser console when Listen starts.
The stage only appears on pages whose audio is up to date (the same rule as the Listen button).

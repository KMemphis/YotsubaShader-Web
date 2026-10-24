# Integrating Yotsuba Shader into your engine · Integrar Yotsuba Shader en tu motor

> **API status (2026-10-23): historical design guide.** The PDF editions and code listings in this folder have not been migrated to the current API. They include proposed source-generator, CLI, runtime, and resource interfaces. They are no longer linked as current website documentation. Use the website reference and `Web/tools/check-api-examples.py` for the reviewed examples.

A step-by-step guide in English and Spanish, as editable source and as PDF.
Una guía paso a paso en español e inglés, como fuente editable y como PDF.

## Format: Typst

The text is written in [Typst](https://typst.app): plain text files (`.typ`) that compile to a PDF in about a second.
Why Typst: code listings with syntax colors, tables and diagrams without extra packages, and a file that is easy to read and to keep in Git.

El texto está escrito en [Typst](https://typst.app): archivos de texto (`.typ`) que se compilan a PDF en aproximadamente un segundo.

## Edit it · Edítalo

Pick one:

1. **In the browser, nothing to install:** create a free project at [typst.app](https://typst.app), upload this whole folder, open `guide-en.typ` or `guide-es.typ`, and use *Download PDF*.
2. **In VS Code:** install the *Tinymist Typst* extension. It previews the PDF while you type.
3. **From the terminal:**

   ```bash
   ./build.sh
   ```

   It needs [Typst](https://github.com/typst/typst) (`brew install typst`) and Node.js 18 or newer.

## What is where · Qué hay dónde

| Path | What it is |
|---|---|
| `guide-en.typ`, `guide-es.typ` | The text of each edition. One chapter per `=` heading. |
| `template.typ` | The look: colors, fonts, cover, boxes. Edit once, both editions change. |
| `code/en/` | The code listings. **Edit these.** Every `#listing("File.cs")` in the text reads one of them. |
| `code/es/` | Generated from `code/en/` by `tools/translate-code.mjs` (only comments and messages change). |
| `generated/` | The two reference appendices, generated from the website's data. |
| `assets/` | The logo. |
| `tools/check/` | Compiles every C# listing against the real `YotsubaShader.Language` project. |

## Edit a code listing · Edita un listado

1. Change the file in `code/en/`.
2. If you add or change a comment, add its Spanish translation to `tools/translate-code.mjs` (the script stops and lists what is missing).
3. Run `CHECK=1 ./build.sh` to compile the C# and rebuild the PDFs.

## Text helpers · Funciones del texto

```typst
#listing("Vector2.cs")                  // a real file from code/<lang>/
#snippet(name: "Terminal", lang: "bash", "yotsuba compile ...")   // a few inline lines
#note[...]  #tip[...]  #warn[...]      // colored boxes
#grid-table(("A", "B"), ("1", "2"))    // a table; cells accept `code` and *bold*
#flow(("Step", "detail"), ("Next", "detail"))   // boxes joined by arrows
```

In the text, write `C\#` (not `C#`) and avoid a bare `$`, `@` or `<name>`: Typst reads them as code.
En el texto escribe `C\#` y evita `$`, `@` o `<nombre>` sueltos: Typst los lee como código.

## Fonts · Fuentes

The text uses Helvetica Neue and Menlo (macOS). On another system Typst falls back to a similar font. Change them at the top of `template.typ` (`sans` and `mono`).

## License · Licencia

MS-PL, like Yotsuba Shader. The name and the logo of Yotsuba Shader are not covered by the license.

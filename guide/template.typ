// Shared look of the guide. Edit the colors and fonts here; both languages use it.
// The language of the edition. guide-en.typ and guide-es.typ set it with `lang: "en"` or `lang: "es"`.
#let cur-lang = state("lang", "en")

#let accent = rgb("#0071e3")
#let ink = rgb("#1d1d1f")
#let muted = rgb("#6e6e73")
#let line-color = rgb("#d2d2d7")
#let code-bg = rgb("#f5f5f7")

#let sans = ("Helvetica Neue", "Helvetica", "Arial")
#let mono = ("Menlo", "DejaVu Sans Mono")

// ---------------------------------------------------------------- code listings
#let ext-lang(file) = {
  if file.ends-with(".cs") { "cs" }
  else if file.ends-with(".xml") { "xml" }
  else if file.ends-with(".yml") { "yaml" }
  else if file.ends-with(".sh") { "bash" }
  else { none }
}

// A listing read from code/<lang>/<file>. `name` is the label shown on top.
#let listing(file, name: none) = context {
  let lang = cur-lang.get()
  let src = read("code/" + lang + "/" + file)
  let label = if name == none { file } else { name }
  let long = src.split("\n").len() > 34
  block(width: 100%, breakable: long, above: 1.1em, below: 1.1em, stroke: 0.6pt + line-color, radius: 6pt, clip: true)[
    #set block(spacing: 0pt)
    #block(width: 100%, fill: rgb("#ececf0"), inset: (x: 10pt, y: 5pt))[
      #text(font: mono, size: 7.5pt, fill: muted)[#label]
    ]
    #block(width: 100%, fill: code-bg, inset: (x: 10pt, y: 8pt))[
      #set text(font: mono, size: 7.6pt)
      #set par(leading: 0.55em)
      #set block(spacing: 0pt)
      #raw(src.trim("\n", at: end), lang: ext-lang(file), block: true)
    ]
  ]
}

// Code written inline in the text (a few lines, not compiled).
#let snippet(body, name: none, lang: none) = {
  block(width: 100%, breakable: true, above: 1.1em, below: 1.1em, stroke: 0.6pt + line-color, radius: 6pt, clip: true)[
    #set block(spacing: 0pt)
    #if name != none [
      #block(width: 100%, fill: rgb("#ececf0"), inset: (x: 10pt, y: 5pt))[#text(font: mono, size: 7.5pt, fill: muted)[#name]]
    ]
    #block(width: 100%, fill: code-bg, inset: (x: 10pt, y: 8pt))[
      #set text(font: mono, size: 7.6pt)
      #set par(leading: 0.55em)
      #set block(spacing: 0pt)
      #raw(body, lang: lang, block: true)
    ]
  ]
}

// ---------------------------------------------------------------- boxes
#let callout(kind, title, body) = {
  let color = if kind == "warn" { rgb("#b25000") } else if kind == "tip" { rgb("#1a7f37") } else { accent }
  let tint = if kind == "warn" { rgb("#fff4e5") } else if kind == "tip" { rgb("#eafaf0") } else { rgb("#eaf3ff") }
  block(width: 100%, above: 1em, below: 1em, breakable: false, fill: tint, stroke: (left: 3pt + color), inset: (x: 12pt, y: 9pt), radius: (right: 5pt))[
    #text(weight: "bold", fill: color, size: 8.5pt)[#upper(title)]
    #v(2pt)
    #body
  ]
}
#let titled(kind, en, es, title, body) = context {
  let t = if title != auto { title } else if cur-lang.get() == "es" { es } else { en }
  callout(kind, t, body)
}
#let note(title: auto, body) = titled("note", "Note", "Nota", title, body)
#let tip(title: auto, body) = titled("tip", "Tip", "Consejo", title, body)
#let warn(title: auto, body) = titled("warn", "Careful", "Cuidado", title, body)

// ---------------------------------------------------------------- tables and diagrams
#let cell(c) = if type(c) == str { eval(c, mode: "markup") } else { c }

#let grid-table(head, cols: none, ..rows) = {
  let cells = rows.pos().flatten()
  let widths = if cols != none { cols } else { (auto,) + (1fr,) * (head.len() - 1) }
  table(
    columns: widths,
    stroke: (x: none, y: 0.5pt + line-color),
    inset: (x: 7pt, y: 6pt),
    fill: (_, y) => if y == 0 { rgb("#f5f5f7") } else { none },
    table.header(..head.map(h => text(weight: "bold", size: 8.5pt)[#cell(h)])),
    ..cells.map(c => text(size: 8.5pt)[#cell(c)]),
  )
}

// A row of boxes joined by arrows.
#let flow(..steps) = {
  let items = steps.pos()
  let cells = ()
  for (i, s) in items.enumerate() {
    cells.push(box(fill: rgb("#f5f5f7"), stroke: 0.6pt + line-color, radius: 6pt, inset: (x: 8pt, y: 8pt), width: 100%)[
      #align(center)[#text(size: 8.5pt, weight: "semibold")[#cell(s.at(0))]#linebreak()#text(size: 7.5pt, fill: muted)[#cell(s.at(1))]]
    ])
    if i < items.len() - 1 { cells.push(align(center + horizon)[#text(fill: accent, size: 12pt)[→]]) }
  }
  block(above: 1em, below: 1em, width: 100%)[
    #grid(columns: range(items.len() * 2 - 1).map(i => if calc.even(i) { 1fr } else { 14pt }), gutter: 3pt, align: horizon, ..cells)
  ]
}

// ---------------------------------------------------------------- the document
#let guide(lang: "en", title: "", subtitle: "", edition: "", toc-title: "", body) = {
  cur-lang.update(lang)
  set document(title: title, author: "Yotsuba Shader")
  set page(paper: "a4", margin: (x: 22mm, top: 24mm, bottom: 22mm))
  set text(font: sans, size: 10pt, fill: ink, lang: lang)
  set par(justify: false, leading: 0.68em, spacing: 1em)
  show link: set text(fill: accent)
  show raw.where(block: false): it => box(fill: code-bg, inset: (x: 3pt), outset: (y: 2.5pt), radius: 3pt, text(font: mono, size: 0.88em, it))
  set heading(numbering: "1.1")

  show heading.where(level: 1): it => {
    pagebreak(weak: true)
    v(18pt)
    block(below: 14pt)[
      #if it.numbering != none [
        #text(size: 11pt, fill: accent, weight: "bold")[#context if cur-lang.get() == "es" [CAPÍTULO] else [CHAPTER] #counter(heading).display("1")]
        #v(-4pt)
      ]
      #text(size: 24pt, weight: "bold", tracking: -0.4pt)[#it.body]
    ]
  }
  show heading.where(level: 2): it => block(above: 18pt, below: 8pt)[#text(size: 14pt, weight: "bold")[#if it.numbering != none [#counter(heading).display() #h(4pt)]#it.body]]
  show heading.where(level: 3): it => block(above: 12pt, below: 5pt)[#text(size: 11pt, weight: "bold")[#it.body]]

  // Cover
  page(margin: (x: 25mm, y: 30mm), header: none, footer: none)[
    #align(left)[
      #image("assets/logo.png", width: 34mm)
      #v(38mm)
      #text(size: 11pt, fill: accent, weight: "bold", tracking: 1pt)[#upper(if lang == "es" { "Guía paso a paso" } else { "Step-by-step guide" })]
      #v(4pt)
      #text(size: 36pt, weight: "bold", tracking: -0.8pt)[#title]
      #v(8pt)
      #text(size: 14pt, fill: muted)[#subtitle]
    ]
    #align(bottom)[
      #line(length: 100%, stroke: 0.6pt + line-color)
      #v(4pt)
      #text(size: 9pt, fill: muted)[#edition]
    ]
  ]

  // Contents
  page(header: none, footer: none)[
    #text(size: 22pt, weight: "bold")[#toc-title]
    #v(10pt)
    #show outline.entry.where(level: 1): it => { v(6pt, weak: true); strong(it) }
    #outline(title: none, depth: 2, indent: 12pt)
  ]

  set page(
    header: context {
      let h = query(heading.where(level: 1).before(here())).last(default: none)
      set text(size: 8pt, fill: muted)
      grid(columns: (1fr, auto), [#title], [#if h != none { h.body }])
      v(-4pt)
      line(length: 100%, stroke: 0.5pt + line-color)
    },
    footer: context {
      set text(size: 8pt, fill: muted)
      align(center)[#counter(page).display()]
    },
  )
  counter(page).update(1)
  body
}

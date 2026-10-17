// Shared look of the two reference PDFs (syntax reference and backend compatibility).
// Colors and fonts come from the engine guide, so all the PDFs of the site look the same.
#import "../guide/template.typ": accent, ink, muted, line-color, code-bg, sans, mono, cur-lang

// Colors of the compatibility statuses.
#let ok-color = rgb("#1e8e3e")
#let ext-color = rgb("#b06000")
#let bad-color = rgb("#c5221f")
#let na-color = rgb("#8e8e93")

// A small colored label: `pill("Yes", ok-color)`.
#let pill(label, color) = box(
  inset: (x: 4pt, y: 1.6pt),
  radius: 3pt,
  fill: color.transparentize(86%),
  text(size: 6.8pt, weight: "bold", fill: color)[#label],
)

// Code in a table cell.
#let c(s) = text(font: mono, size: 6.6pt)[#s]
#let none-cell = text(fill: muted)[—]

// The document: landscape A4, a title block and page numbers.
#let refdoc(lang: "en", title: "", subtitle: "", edition: "", body) = {
  cur-lang.update(lang)
  set document(title: title, author: "Yotsuba Shader")
  set page(
    paper: "a4",
    flipped: true,
    margin: (x: 15mm, top: 16mm, bottom: 15mm),
    footer: context {
      set text(size: 7.5pt, fill: muted)
      [Yotsuba Shader · #title #h(1fr) #counter(page).display()]
    },
  )
  set text(font: sans, size: 9pt, fill: ink, lang: lang)
  set par(leading: 0.62em)
  show link: set text(fill: accent)
  show raw: set text(font: mono, size: 8pt)
  show heading.where(level: 1): it => block(above: 18pt, below: 8pt, text(size: 14pt, weight: "bold", it.body))
  show heading.where(level: 2): it => block(above: 12pt, below: 6pt, text(size: 10.5pt, weight: "bold", it.body))
  block(below: 16pt)[
    #text(size: 8.5pt, fill: accent, weight: "bold", tracking: 0.08em)[YOTSUBA SHADER]
    #v(1pt)
    #text(size: 22pt, weight: "bold")[#title]
    #v(1pt)
    #text(size: 11pt, fill: muted)[#subtitle]
    #v(1pt)
    #text(size: 7.5pt, fill: muted)[#edition]
  ]
  body
}

// A table with the look of the site's reference tables.
#let ref-table(columns: (), header: (), ..cells) = table(
  columns: columns,
  stroke: (x: none, y: 0.4pt + line-color),
  inset: (x: 4pt, y: 3.6pt),
  align: left + horizon,
  fill: (_, y) => if y == 0 { rgb("#f5f5f7") } else { none },
  table.header(..header.map(h => text(weight: "bold", size: 7.2pt)[#h])),
  ..cells,
)

// A row that names a group of the table (Vertex stage, Resources...).
#let group-row(n, label) = table.cell(colspan: n, fill: rgb("#eaf3ff"))[#text(weight: "bold", size: 7.4pt)[#label]]

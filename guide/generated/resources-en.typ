#import "../template.typ": *
#table(
  columns: (1.5fr, 1.3fr, 1.3fr, 1.3fr, 1.3fr, 1.3fr),
  stroke: (x: none, y: 0.4pt + line-color),
  inset: (x: 4pt, y: 4pt),
  fill: (_, y) => if y == 0 { rgb("#f5f5f7") } else { none },
  table.header(text(weight: "bold", size: 7pt)[Concept], text(weight: "bold", size: 7pt)[HLSL], text(weight: "bold", size: 7pt)[GLSL], text(weight: "bold", size: 7pt)[Metal], text(weight: "bold", size: 7pt)[Vulkan], text(weight: "bold", size: 7pt)[WGSL]),
  text(size: 7pt)[Uniform buffer], [#text(font: mono, size: 6.3pt)[#"cbuffer, ConstantBuffer<T>"]], [#text(font: mono, size: 6.3pt)[#"uniform"]], [#text(font: mono, size: 6.3pt)[#"constant"]], [#text(font: mono, size: 6.3pt)[#"Uniform"]], [#text(font: mono, size: 6.3pt)[#"uniform"]],
  text(size: 7pt)[Read/write storage buffer], [#text(font: mono, size: 6.3pt)[#"RWStructuredBuffer<T>"]], [#text(font: mono, size: 6.3pt)[#"buffer"]], [#text(font: mono, size: 6.3pt)[#"device"]], [#text(font: mono, size: 6.3pt)[#"StorageBuffer"]], [#text(font: mono, size: 6.3pt)[#"storage(storage_use.read_write)"]],
  text(size: 7pt)[Read-only storage buffer], [#text(font: mono, size: 6.3pt)[#"StructuredBuffer<T>"]], [#text(font: mono, size: 6.3pt)[#"buffer"]], [#text(font: mono, size: 6.3pt)[#"device(readOnly: true)"]], [#text(font: mono, size: 6.3pt)[#"StorageBuffer"]], [#text(font: mono, size: 6.3pt)[#"storage(storage_use.read)"]],
  text(size: 7pt)[Binding slot], [#text(font: mono, size: 6.3pt)[#"register(RegisterPrefix.b, n)"]], [#text(font: mono, size: 6.3pt)[#"layout(set, binding)"]], [#text(font: mono, size: 6.3pt)[#"buffer(n), texture(n), sampler(n)"]], [#text(font: mono, size: 6.3pt)[#"DescriptorSet(s) + Binding(n)"]], [#text(font: mono, size: 6.3pt)[#"@group(s) + @binding(n)"]],
)

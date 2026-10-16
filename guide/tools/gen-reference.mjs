// Builds the two reference appendices (built-in values and resource attributes) from the website's own data,
// so they never drift away from it. Output: generated/*.typ
import fs from 'node:fs';
import { BUILTIN_MAP, RESOURCE_MAP } from '../../src/reference.mjs';

const OUT = new URL('../generated/', import.meta.url).pathname;
fs.mkdirSync(OUT, { recursive: true });

const ES = {
  'Vertex stage': 'Etapa vertex',
  'Clip-space position (vertex output)': 'Posición en clip space (salida del vertex)',
  'Vertex index': 'Índice de vértice',
  'Instance index': 'Índice de instancia',
  'Base vertex': 'Vértice base',
  'Base instance': 'Instancia base',
  'Clip distance': 'Distancia de recorte',
  'Render target layer': 'Capa del render target',
  'Viewport index': 'Índice de viewport',
  'Fragment stage': 'Etapa fragment',
  'Fragment coordinate': 'Coordenada del fragmento',
  'Front-facing flag': 'Indicador de cara frontal',
  'Fragment depth (output)': 'Profundidad del fragmento (salida)',
  'Conservative depth': 'Profundidad conservadora',
  'Stencil reference (output)': 'Referencia de stencil (salida)',
  'Sample index': 'Índice de muestra',
  'Sample mask': 'Máscara de muestras',
  'Primitive index': 'Índice de primitiva',
  'Barycentric coordinates': 'Coordenadas baricéntricas',
  'Helper invocation': 'Invocación auxiliar',
  'Sample position': 'Posición de la muestra',
  'Compute stage': 'Etapa compute',
  'Global invocation id': 'Id de invocación global',
  'Local invocation id': 'Id de invocación local',
  'Local invocation index': 'Índice de invocación local',
  'Workgroup id': 'Id del grupo de trabajo',
  'Number of workgroups': 'Número de grupos de trabajo',
  'Workgroup size (method attribute)': 'Tamaño del grupo (atributo de método)',
  'Workgroup size (built-in value)': 'Tamaño del grupo (valor built-in)',
  'Subgroup size': 'Tamaño del subgrupo',
  'Subgroup invocation id': 'Id de invocación del subgrupo',
  'Subgroup id': 'Id del subgrupo',
  'Number of subgroups': 'Número de subgrupos',
  'Uniform buffer': 'Uniform buffer',
  'Read/write storage buffer': 'Storage buffer de lectura y escritura',
  'Read-only storage buffer': 'Storage buffer de solo lectura',
  'Binding slot': 'Slot de binding',
};
const unesc = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const q = (s) => JSON.stringify(unesc(s));       // a Typst string literal
const code = (s) => (s ? `text(font: mono, size: 6.3pt)[#${q(s)}]` : `text(fill: muted)[—]`);

function table(rows, lang, withGroups) {
  const head = [lang === 'es' ? 'Concepto' : 'Concept', 'HLSL', 'GLSL', 'Metal', 'Vulkan', 'WGSL'];
  let out = `#table(\n  columns: (1.5fr, 1.3fr, 1.3fr, 1.3fr, 1.3fr, 1.3fr),\n  stroke: (x: none, y: 0.4pt + line-color),\n  inset: (x: 4pt, y: 4pt),\n  fill: (_, y) => if y == 0 { rgb("#f5f5f7") } else { none },\n`;
  out += `  table.header(${head.map((h) => `text(weight: "bold", size: 7pt)[${h}]`).join(', ')}),\n`;
  for (const r of rows) {
    const label = lang === 'es' ? ES[r[0]] || r[0] : r[0];
    if (r[1] === null) {
      out += `  table.cell(colspan: 6, fill: rgb("#eaf3ff"))[#text(weight: "bold", size: 7pt)[${label}]],\n`;
      continue;
    }
    out += `  text(size: 7pt)[${label}], ${r.slice(1).map((v) => `[#${code(v)}]`).join(', ')},\n`;
  }
  return out + ')\n';
}

for (const lang of ['en', 'es']) {
  fs.writeFileSync(`${OUT}builtins-${lang}.typ`, `#import "../template.typ": *\n` + table(BUILTIN_MAP, lang));
  fs.writeFileSync(`${OUT}resources-${lang}.typ`, `#import "../template.typ": *\n` + table(RESOURCE_MAP, lang));
}
console.log('generated/ written');

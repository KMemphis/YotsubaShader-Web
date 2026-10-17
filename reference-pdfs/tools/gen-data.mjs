// Writes the tables of the two reference PDFs as Typst, from the website's own data, so they never drift away:
//   - src/reference.mjs        concept × syntax tables and the attribute counts of each YotsubaShader.<X>Syntax project
//   - tools/compat/compat.json concept × backend results of the compatibility harness
// Output: generated/{syntax,compat}-{en,es}.typ
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BUILTIN_MAP, RESOURCE_MAP, CORE_MAP, SYNTAX_META, SYNTAX_IDS, scanSyntaxes } from '../../src/reference.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const WEB = path.resolve(HERE, '..', '..');
const OUT = path.resolve(HERE, '..', 'generated');
const COMPAT = path.join(WEB, 'tools', 'compat', 'compat.json');
fs.mkdirSync(OUT, { recursive: true });

/* ------------------------------------------------------------------ helpers */
const unesc = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
/** A Typst string literal. */
const q = (s) => `"${unesc(String(s)).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
/** Code in a cell; several spellings separated by " / " stay on separate lines. */
const code = (s) => (s ? s.split(' / ').map((p) => `#c(${q(p)})`).join(' #linebreak() ') : '#none-cell');
/** Plain text for a table cell, written in code mode (inside the arguments of ref-table). */
const txt = (s) => `text(size: 7.2pt)[#${q(s)}]`;

/* ---------------------------------------------------------- concept names */
const ES = {
  'Vertex stage': 'Etapa vertex',
  'Fragment stage': 'Etapa fragment',
  'Compute stage': 'Etapa compute',
  'Clip-space position (vertex output)': 'Posición en clip space (salida del vertex)',
  'Vertex index': 'Índice de vértice',
  'Instance index': 'Índice de instancia',
  'Base vertex': 'Vértice base',
  'Base instance': 'Instancia base',
  'Clip distance': 'Distancia de recorte',
  'Render target layer': 'Capa del render target',
  'Viewport index': 'Índice de viewport',
  'Fragment coordinate': 'Coordenada del fragmento',
  'Front-facing flag': 'Indicador de cara frontal',
  'Fragment depth (output)': 'Profundidad del fragmento (salida)',
  'Conservative depth': 'Profundidad conservadora',
  'Stencil reference (output)': 'Referencia de stencil (salida)',
  'Sample index': 'Índice de muestra',
  'Sample mask': 'Máscara de muestras',
  'Primitive index': 'Índice de primitiva',
  'Barycentric coordinates': 'Coordenadas baricéntricas',
  'Barycentric coordinates (no perspective)': 'Coordenadas baricéntricas (sin perspectiva)',
  'Helper invocation': 'Invocación auxiliar',
  'Sample position': 'Posición de la muestra',
  'Global invocation id': 'Id de invocación global',
  'Local invocation id': 'Id de invocación local',
  'Local invocation index': 'Índice de invocación local',
  'Workgroup id': 'Id del grupo de trabajo',
  'Number of workgroups': 'Número de grupos de trabajo',
  'Workgroup size (method attribute)': 'Tamaño del grupo (atributo de método)',
  'Workgroup size (built-in value)': 'Tamaño del grupo (valor integrado)',
  'Subgroup size': 'Tamaño del subgrupo',
  'Subgroup invocation id': 'Id de invocación del subgrupo',
  'Subgroup id': 'Id del subgrupo',
  'Number of subgroups': 'Número de subgrupos',
  'Uniform buffer': 'Uniform buffer',
  'Read/write storage buffer': 'Storage buffer de lectura y escritura',
  'Read-only storage buffer': 'Storage buffer de solo lectura',
  'Binding slot': 'Slot de binding',
  'Texture slot': 'Slot de textura',
  'Sampler slot': 'Slot de sampler',
  'Interface location (vertex inputs, varyings, fragment outputs)': 'Ubicación de interfaz (entradas de vértice, varyings, salidas de fragmento)',
  'Uniform buffer (neutral spelling)': 'Uniform buffer (forma neutra)',
  'Storage buffer (neutral spelling)': 'Storage buffer (forma neutra)',
  'Set and binding (neutral spelling)': 'Set y binding (forma neutra)',
  'Shader stage of a method': 'Etapa de shader de un método',
};
const tr = (s, lang) => (lang === 'es' ? ES[s] || s : s);

/** Concepts of the compatibility harness: id → [English, Spanish]. */
const COMPAT_NAMES = {
  Position: ['Clip-space position (vertex output)'],
  VertexIndex: ['Vertex index'],
  InstanceIndex: ['Instance index'],
  BaseVertex: ['Base vertex'],
  BaseInstance: ['Base instance'],
  ClipDistance: ['Clip distance'],
  Layer: ['Render target layer'],
  ViewportIndex: ['Viewport index'],
  FragCoord: ['Fragment coordinate'],
  PrimitiveId: ['Primitive index'],
  FrontFacing: ['Front-facing flag'],
  FragDepth: ['Fragment depth (output)'],
  FragStencilRef: ['Stencil reference (output)'],
  SampleId: ['Sample index'],
  SampleMask: ['Sample mask'],
  SamplePosition: ['Sample position'],
  HelperInvocation: ['Helper invocation'],
  BaryCoord: ['Barycentric coordinates'],
  BaryCoordNoPerspective: ['Barycentric coordinates (no perspective)'],
  ConservativeDepth: ['Conservative depth'],
  GlobalInvocationId: ['Global invocation id'],
  LocalInvocationId: ['Local invocation id'],
  LocalInvocationIndex: ['Local invocation index'],
  WorkgroupId: ['Workgroup id'],
  NumWorkgroups: ['Number of workgroups'],
  WorkgroupSize: ['Workgroup size (built-in value)'],
  LocalSize: ['Workgroup size (method attribute)'],
  SubgroupSize: ['Subgroup size'],
  SubgroupInvocationId: ['Subgroup invocation id'],
  SubgroupId: ['Subgroup id'],
  NumSubgroups: ['Number of subgroups'],
  Location: ['Interface location', 'Ubicación de interfaz'],
  UniformBuffer: ['Uniform buffer'],
  StorageBufferReadOnly: ['Read-only storage buffer'],
  StorageBufferReadWrite: ['Read/write storage buffer'],
  TextureSampler: ['Sampled texture and sampler', 'Textura muestreada y sampler'],
  DescriptorSetBinding: ['Explicit set and binding', 'Set y binding explícitos'],
  Double: ['64-bit float (double)', 'Float de 64 bits (double)'],
  VertexStage: ['Vertex stage'],
  FragmentStage: ['Fragment stage'],
  ComputeStage: ['Compute stage'],
};
const compatName = (id, lang) => {
  const [en, es] = COMPAT_NAMES[id] || [id];
  return lang === 'es' ? es || ES[en] || en : en;
};

const GROUPS = {
  vertex: ['Vertex stage built-ins', 'Valores integrados de la etapa vertex'],
  fragment: ['Fragment stage built-ins', 'Valores integrados de la etapa fragment'],
  compute: ['Compute stage', 'Etapa compute'],
  subgroup: ['Subgroups', 'Subgrupos'],
  interface: ['Interface', 'Interfaz'],
  resource: ['Resources', 'Recursos'],
  type: ['Types', 'Tipos'],
  stage: ['Stages', 'Etapas'],
};

/* ----------------------------------------------------- 1. syntax reference */
function syntaxDoc(lang) {
  const es = lang === 'es';
  const syntaxes = scanSyntaxes(path.resolve(WEB, '..'));
  const heads = SYNTAX_IDS.map((id) => SYNTAX_META[id].label);
  let out = '#import "../template.typ": *\n\n';

  out += `= ${es ? 'Los cinco paquetes de sintaxis' : 'The five syntax packages'}\n\n`;
  out += `#ref-table(columns: (0.8fr, 1.6fr, 2fr, 1.6fr, 0.7fr), header: (${q(es ? 'Sintaxis' : 'Syntax')}, ${q(es ? 'Paquete y namespace' : 'Package and namespace')}, ${q(es ? 'Namespace de recursos' : 'Resources namespace')}, ${q(es ? 'Inspirada en' : 'Inspired by')}, ${q(es ? 'Atributos' : 'Attributes')}),\n`;
  for (const id of SYNTAX_IDS) {
    const m = SYNTAX_META[id];
    const inspired = es ? m.inspired.replace(/^the /, '').replace('Vulkan GLSL', 'GLSL de Vulkan') : m.inspired.replace(/^the /, '');
    out += `  [*${m.label}*], [#c(${q(m.project)})], [#c(${q(m.project + '.Resources')})], ${txt(inspired)}, ${txt(String(syntaxes[id]?.total ?? '—'))},\n`;
  }
  out += ')\n\n';

  out += `= ${es ? 'Núcleo neutro: YotsubaShader.Language' : 'Neutral core: YotsubaShader.Language'}\n\n`;
  out += `#text(size: 8.5pt)[#${q(es ? 'Estos atributos son los mismos en todas las sintaxis. Los motores y frameworks se apoyan en este núcleo; cada paquete de sintaxis solo añade nombres.' : 'These attributes are the same in every syntax. Engines and frameworks build on this core; each syntax package only adds names.')}]\n\n`;
  out += `#ref-table(columns: (2fr, 2fr), header: (${q(es ? 'Concepto' : 'Concept')}, ${q(es ? 'Atributo' : 'Attribute')}),\n`;
  for (const [concept, attr] of CORE_MAP) out += `  ${txt(tr(concept, lang))}, [#c(${q('[' + attr + ']')})],\n`;
  out += ')\n\n';

  const mapTable = (rows) => {
    let t = `#ref-table(columns: (1.7fr, 1.35fr, 1.35fr, 1.35fr, 1.35fr, 1.35fr), header: (${q(es ? 'Concepto' : 'Concept')}, ${heads.map(q).join(', ')}),\n`;
    for (const r of rows) {
      if (r[1] === null) t += `  group-row(6, ${q(tr(r[0], lang))}),\n`;
      else t += `  ${txt(tr(r[0], lang))}, ${r.slice(1).map((v) => `[${code(v)}]`).join(', ')},\n`;
    }
    return t + ')\n\n';
  };
  out += `= ${es ? 'Valores integrados' : 'Built-in values'}\n\n` + mapTable(BUILTIN_MAP);
  out += `= ${es ? 'Recursos y slots de binding' : 'Resources and binding slots'}\n\n` + mapTable(RESOURCE_MAP);
  return out;
}

/* ------------------------------------------------- 2. backend compatibility */
const STATUS = {
  ok: ['Yes', 'Sí', 'ok-color'],
  extension: ['Extension', 'Extensión', 'ext-color'],
  dropped: ['Lost', 'Se pierde', 'bad-color'],
  invalid: ['Invalid', 'Inválido', 'bad-color'],
  rejected: ['No', 'No', 'bad-color'],
  'n/a': ['No stage', 'Sin etapa', 'na-color'],
};
const pillOf = (status, lang) => {
  const [en, es, color] = STATUS[status] || [status, status, 'na-color'];
  return `#pill(${q(lang === 'es' ? es : en)}, ${color})`;
};

function compatDoc(lang) {
  const es = lang === 'es';
  const data = JSON.parse(fs.readFileSync(COMPAT, 'utf8'));
  const backends = data.backends;
  let out = '#import "../template.typ": *\n\n';

  out += `= ${es ? 'Compatibilidad por concepto' : 'Compatibility by concept'}\n\n`;
  out += `#ref-table(columns: (2.1fr, ${backends.map(() => '1fr').join(', ')}), header: (${q(es ? 'Concepto' : 'Concept')}, ${backends.map((b) => q(b.label)).join(', ')}),\n`;
  let group = null;
  for (const cpt of data.concepts) {
    if (cpt.group !== group) {
      group = cpt.group;
      const g = GROUPS[group] || [group, group];
      out += `  group-row(${backends.length + 1}, ${q(es ? g[1] : g[0])}),\n`;
    }
    out += `  [#${txt(compatName(cpt.id, lang))} #linebreak() #text(size: 6pt, fill: muted, font: mono)[#${q(cpt.id)}]], ${backends.map((b) => `[${pillOf(cpt.results[b.id]?.status, lang)}]`).join(', ')},\n`;
  }
  out += ')\n\n';

  // Every cell that is not a plain "Yes", with the reason the tools gave.
  out += `= ${es ? 'Detalle de cada limitación' : 'Details of every limitation'}\n\n`;
  out += `#ref-table(columns: (1.4fr, 1.1fr, 0.7fr, 3.6fr), header: (${q(es ? 'Concepto' : 'Concept')}, ${q('Backend')}, ${q(es ? 'Estado' : 'Status')}, ${q(es ? 'Motivo (herramientas)' : 'Reason (tools)')}),\n`;
  for (const cpt of data.concepts) {
    for (const b of backends) {
      const r = cpt.results[b.id];
      if (!r || r.status === 'ok') continue;
      out += `  ${txt(compatName(cpt.id, lang))}, ${txt(b.label)}, [${pillOf(r.status, lang)}], [${reason(r, lang)}],\n`;
    }
  }
  out += ')\n\n';

  out += `= ${es ? 'Herramientas y versiones' : 'Tools and versions'}\n\n`;
  out += `#ref-table(columns: (0.8fr, 4fr), header: (${q(es ? 'Herramienta' : 'Tool')}, ${q(es ? 'Versión' : 'Version')}),\n`;
  for (const [tool, version] of Object.entries(data.tools)) out += `  [#c(${q(tool)})], ${txt(version)},\n`;
  out += ')\n\n';
  out += `#text(size: 7.5pt, fill: muted)[#${q((es ? 'Generado: ' : 'Generated: ') + data.generated)}]\n`;
  return out;
}

/** The short reason of a cell: the extensions it needs, or the first error of each translator. */
function reason(r, lang) {
  const es = lang === 'es';
  const parts = [];
  for (const [name, t] of [['naga', r.naga], ['SPIRV-Cross', r.spirvCross], ['spirv-val', r.spirvVal]]) {
    if (!t || t.status === 'n/a') continue;
    const ext = (t.extensions || []).join(', ');
    let msg = ext ? `${es ? 'necesita' : 'needs'} ${ext}` : (t.message || '').split('\n').map((l) => l.trim()).find(Boolean) || '';
    if (!msg && t.status === 'ok') continue;
    if (!msg) msg = t.status;
    if (t.unverified) msg += es ? ' (sin verificar: el compilador no implementa la extensión)' : ' (unverified: the compiler does not implement the extension)';
    msg = msg.replace(/\s+/g, ' ').slice(0, 150);
    parts.push(`#text(size: 6.6pt, weight: "bold")[#${q(name)}:] #text(size: 6.6pt)[#${q(msg)}]`);
  }
  return parts.join(' #linebreak() ') || '#none-cell';
}

for (const lang of ['en', 'es']) {
  fs.writeFileSync(path.join(OUT, `syntax-${lang}.typ`), syntaxDoc(lang));
  if (fs.existsSync(COMPAT)) fs.writeFileSync(path.join(OUT, `compat-${lang}.typ`), compatDoc(lang));
}
console.log(`generated/ written${fs.existsSync(COMPAT) ? '' : ' (no compat.json: compatibility tables skipped)'}`);

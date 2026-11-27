#!/usr/bin/env node
// Writes the diagnostics pages of the Documentation section:
//   content/<lang>/reference/diagnostics.md                     index
//   content/<lang>/reference/diagnostics-<area>.md              the rules that do not depend on a graphics API
//   content/<lang>/reference/validate-<api>.md                  one page per validation target (graphics API)
//
// Nothing is written by hand: every message, severity, example and per-version result comes from the analyzer itself.
// Export it first (from the compiler repository, the folder that contains Web/):
//
//   YOTSUBA_DOCS_JSON=/some/folder dotnet test Core/Analyzers/YotsubaShader.IDE.Analyzer.Tests --filter Export_the_documentation_data
//   node tools/gen-diagnostics-reference.mjs /some/folder
//
// The pages are committed as plain Markdown, so building learn never needs the compiler.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = (lang) => path.join(HERE, '..', 'content', lang, 'reference');
const DATA = process.argv[2];
if (!DATA) { console.error('usage: node tools/gen-diagnostics-reference.mjs <folder with en.json and es.json>'); process.exit(1); }

/* ---------------------------------------------------------------------------------------------- structure */
const AREAS = [
  { id: 'types', prefix: '00', order: 11 },
  { id: 'entry-points', prefix: '01', order: 12 },
  { id: 'interface', prefix: '02', order: 13 },
  { id: 'resources', prefix: '03', order: 14 },
  { id: 'methods', prefix: '04', order: 15 },
  { id: 'csharp', prefix: '05', order: 16 },
  { id: 'stages', prefix: '06', order: 17 },
  { id: 'portability', prefix: '07', order: 18 },
];

// One page per validation target. `api` is ApiProfile.Api in the analyzer.
const TARGETS = [
  { id: 'vulkan', api: 'Vulkan', order: 20 },
  { id: 'opengl', api: 'OpenGL', order: 21 },
  { id: 'opengles', api: 'OpenGL ES', order: 22 },
  { id: 'direct3d', api: 'Direct3D', order: 23 },
  { id: 'metal', api: 'Metal', order: 24 },
  { id: 'webgpu', api: 'WebGPU', order: 25 },
];

const FEATURES = ['Float64', 'Float16', 'Int16', 'Int64', 'Compute', 'StorageBuffer', 'StorageTexture', 'StorageTextureWithoutFormat',
  'UnsignedInt', 'IntegerBitOps', 'TexelFetch', 'TextureGather', 'TextureOffset', 'TextureQuerySize', 'Derivatives'];

const T = {
  en: {
    areas: {
      types: ['Types and vectors', 'Errors about the types a shader can use and how vectors are declared.'],
      'entry-points': ['Entry points', 'Errors about the methods marked with [ShaderStage]: shape, stage and compute group size.'],
      interface: ['Stage interface', 'Errors about the inputs and outputs of each stage: built-ins, locations and semantics.'],
      resources: ['Resources', 'Errors about textures, samplers and buffers: bindings and memory layout.'],
      methods: ['Methods', 'Errors about the helper functions that are compiled for the GPU.'],
      csharp: ['C# without a translation', 'Errors about C# constructs that do not exist on the GPU.'],
      stages: ['Use per stage', 'Errors about operations that exist in one stage only.'],
      portability: ['Portability', 'Diagnostics about what only some graphics APIs have. The pages of each validation target show them version by version.'],
    },
    targets: {
      vulkan: 'Vulkan', opengl: 'OpenGL', opengles: 'OpenGL ES', direct3d: 'Direct3D', metal: 'Metal', webgpu: 'WebGPU',
    },
    features: {
      Float64: '`double`', Float16: '`half`', Int16: '16-bit integers', Int64: '64-bit integers', Compute: 'Compute shaders',
      StorageBuffer: 'Storage buffers', StorageTexture: 'Storage textures', StorageTextureWithoutFormat: 'Storage textures without a format',
      UnsignedInt: '`uint`', IntegerBitOps: 'Bitwise operators', TexelFetch: 'Texel fetch (`Load`)', TextureGather: 'Gather',
      TextureOffset: 'Texture offsets', TextureQuerySize: 'Texture size queries', Derivatives: 'Derivatives and implicit LOD',
    },
    examples: {
      Float64: '`double`', Compute: 'A compute shader', StorageBuffer: 'A storage buffer', StorageTexture: 'A storage texture',
      UnsignedInt: '`uint`', IntegerBitOps: 'A bitwise operator', TexelFetch: 'Reading a texel with `Load`', TextureGather: 'Gather',
      TextureOffset: 'A texture offset', TextureQuerySize: 'Asking the size of a texture', Derivatives: 'A screen-space derivative',
      UniformBuffer: 'A large uniform buffer', Workgroup: 'A large compute group',
    },
    severity: { error: 'Error', warning: 'Warning', info: 'Info', hidden: 'Hidden' },
    sampleTag: 'Shader that triggers it',
    noSample: 'This diagnostic has no example shader yet.',
    msgLabel: 'Message',
    sevLabel: 'Severity',
    indexTitle: 'Diagnostics',
    indexSummary: 'Every error and warning of the analyzer, by validation target: what each graphics API rejects and why.',
    indexIntro:
      'The analyzer checks your shader **while you type**, in the editor and in the build, with the same rules the compiler uses: a shader without errors compiles. ' +
      'Each diagnostic has an id (`YS` and four digits), a severity and a message.',
    indexSev:
      '- **Error**: the shader would not compile for the GPU, or a graphics API you declared with `[ShaderTargets]` does not have what the shader uses.\n' +
      '- **Warning**: it compiles, but something is not guaranteed everywhere (an optional feature, a hardware limit, a value that is undefined on some GPUs).',
    indexByTarget: 'By validation target',
    indexByTargetText: 'What a graphics API accepts depends on the target you declare. One page per API, with a table of every version and the exact message each one gives:',
    indexByArea: 'All the diagnostics, by area',
    indexByAreaText: 'Every id with its message and a shader that triggers it. Most apply to every shader, whatever `[ShaderTargets]` says; portability is the one that depends on it:',
    seeTargets: 'To choose the graphics APIs a shader is checked against, see [Graphics APIs and engines](targets.md).',
    areaIntro: (n) => `${n} diagnostics. They apply to every shader, whatever graphics API you declare.`,
    targetTitle: (n) => `Validating for ${n}`,
    targetSummary: (n) => `What the analyzer rejects when a shader declares ${n}, version by version, with the exact message of each diagnostic.`,
    targetIntro: (n, example) =>
      `Declare ${n} with \`[ShaderTargets]\` and the analyzer reports everything the shader uses that this graphics API does not have. ` +
      `${example}`,
    declare: 'Declare it like this:',
    versions: 'Versions',
    matrixTitle: 'What each version has',
    matrixText: '`✓` guaranteed, `~` optional (a warning), `✗` not available (an error when you declare it), `·` not modeled.',
    limitsTitle: 'Limits',
    limitsText: 'The limits the analyzer checks. A shader that goes over one gets a diagnostic that names the version.',
    limitRows: { colorAttachments: 'Render targets', vertexInputs: 'Vertex inputs', interStageVariables: 'Variables between stages', descriptorSets: 'Descriptor sets', uniformBufferBytes: 'Uniform buffer (bytes)', workgroup: 'Compute group (invocations)' },
    notes: 'Notes',
    casesTitle: 'What happens in each case',
    versionCol: 'Version',
    resultCol: 'Result',
    ok: 'valid',
    noBackend: 'No YotsubaShader backend generates these versions; the analyzer validates them anyway, so you can declare them and compile for another language.',
    affected: 'Affected versions',
    seeAlsoRules: 'The diagnostic ids are described in [Diagnostics](diagnostics.md).',
  },
  es: {
    areas: {
      types: ['Tipos y vectores', 'Errores sobre los tipos que puede usar un shader y cómo se declaran los vectores.'],
      'entry-points': ['Puntos de entrada', 'Errores sobre los métodos marcados con [ShaderStage]: forma, etapa y tamaño de grupo de compute.'],
      interface: ['Interfaz entre etapas', 'Errores sobre las entradas y salidas de cada etapa: built-ins, locations y semánticas.'],
      resources: ['Recursos', 'Errores sobre texturas, samplers y buffers: bindings y layout de memoria.'],
      methods: ['Métodos', 'Errores sobre las funciones auxiliares que se compilan a la GPU.'],
      csharp: ['C# sin traducción', 'Errores sobre construcciones de C# que no existen en la GPU.'],
      stages: ['Uso por etapa', 'Errores sobre operaciones que solo existen en una etapa.'],
      portability: ['Portabilidad', 'Diagnósticos sobre lo que solo tienen algunas APIs gráficas. Las páginas de cada target de validación los muestran versión por versión.'],
    },
    targets: {
      vulkan: 'Vulkan', opengl: 'OpenGL', opengles: 'OpenGL ES', direct3d: 'Direct3D', metal: 'Metal', webgpu: 'WebGPU',
    },
    features: {
      Float64: '`double`', Float16: '`half`', Int16: 'Enteros de 16 bits', Int64: 'Enteros de 64 bits', Compute: 'Compute shaders',
      StorageBuffer: 'Storage buffers', StorageTexture: 'Storage textures', StorageTextureWithoutFormat: 'Storage textures sin formato',
      UnsignedInt: '`uint`', IntegerBitOps: 'Operadores de bits', TexelFetch: 'Leer un texel (`Load`)', TextureGather: 'Gather',
      TextureOffset: 'Offsets de textura', TextureQuerySize: 'Consultar el tamaño de una textura', Derivatives: 'Derivadas y LOD implícito',
    },
    examples: {
      Float64: '`double`', Compute: 'Un compute shader', StorageBuffer: 'Un storage buffer', StorageTexture: 'Una storage texture',
      UnsignedInt: '`uint`', IntegerBitOps: 'Un operador de bits', TexelFetch: 'Leer un texel con `Load`', TextureGather: 'Gather',
      TextureOffset: 'Un offset de textura', TextureQuerySize: 'Preguntar el tamaño de una textura', Derivatives: 'Una derivada de pantalla',
      UniformBuffer: 'Un uniform buffer grande', Workgroup: 'Un grupo de compute grande',
    },
    severity: { error: 'Error', warning: 'Aviso', info: 'Información', hidden: 'Oculto' },
    sampleTag: 'Shader que lo provoca',
    noSample: 'Este diagnóstico todavía no tiene un shader de ejemplo.',
    msgLabel: 'Mensaje',
    sevLabel: 'Severidad',
    indexTitle: 'Diagnósticos',
    indexSummary: 'Todos los errores y avisos del analizador, por target de validación: qué rechaza cada API gráfica y por qué.',
    indexIntro:
      'El analizador revisa tu shader **mientras escribes**, en el editor y en el build, con las mismas reglas que usa el compilador: un shader sin errores compila. ' +
      'Cada diagnóstico tiene un id (`YS` y cuatro dígitos), una severidad y un mensaje.',
    indexSev:
      '- **Error**: el shader no compilaría para la GPU, o una API gráfica que declaraste con `[ShaderTargets]` no tiene lo que el shader usa.\n' +
      '- **Aviso**: compila, pero algo no está garantizado en todas partes (una característica opcional, un límite de hardware, un valor indefinido en algunas GPU).',
    indexByTarget: 'Por target de validación',
    indexByTargetText: 'Lo que acepta una API gráfica depende del target que declares. Una página por API, con una tabla de todas sus versiones y el mensaje exacto de cada una:',
    indexByArea: 'Todos los diagnósticos, por área',
    indexByAreaText: 'Cada id con su mensaje y un shader que lo provoca. Casi todos valen para cualquier shader, diga lo que diga `[ShaderTargets]`; portabilidad es el que depende de él:',
    seeTargets: 'Para elegir contra qué APIs gráficas se revisa un shader, mira [APIs gráficas y motores](targets.md).',
    areaIntro: (n) => `${n} diagnósticos. Valen para cualquier shader, sea cual sea la API gráfica que declares.`,
    targetTitle: (n) => `Validar para ${n}`,
    targetSummary: (n) => `Qué rechaza el analizador cuando un shader declara ${n}, versión por versión, con el mensaje exacto de cada diagnóstico.`,
    targetIntro: (n, example) =>
      `Declara ${n} con \`[ShaderTargets]\` y el analizador avisa de todo lo que el shader usa y esta API gráfica no tiene. ` +
      `${example}`,
    declare: 'Se declara así:',
    versions: 'Versiones',
    matrixTitle: 'Qué tiene cada versión',
    matrixText: '`✓` garantizada, `~` opcional (un aviso), `✗` no disponible (un error al declararla), `·` no modelada.',
    limitsTitle: 'Límites',
    limitsText: 'Los límites que revisa el analizador. Un shader que se pasa de uno recibe un diagnóstico que nombra la versión.',
    limitRows: { colorAttachments: 'Render targets', vertexInputs: 'Entradas de vértice', interStageVariables: 'Variables entre etapas', descriptorSets: 'Descriptor sets', uniformBufferBytes: 'Uniform buffer (bytes)', workgroup: 'Grupo de compute (invocaciones)' },
    notes: 'Notas',
    casesTitle: 'Qué pasa en cada caso',
    versionCol: 'Versión',
    resultCol: 'Resultado',
    ok: 'válido',
    noBackend: 'Ningún backend de YotsubaShader genera estas versiones; el analizador las valida igualmente, así que puedes declararlas y compilar a otro lenguaje.',
    affected: 'Versiones afectadas',
    seeAlsoRules: 'Los ids de los diagnósticos se describen en [Diagnósticos](diagnostics.md).',
  },
};

/* ------------------------------------------------------------------------------------------------- helpers */
const mark = { Guaranteed: '✓', Optional: '~', Unavailable: '✗', Unknown: '·' };
const esc = (s) => s.replace(/\|/g, '\\|');
const blank = (message) => message.replace(/\{\d+\}/g, '…');
const fence = (code, lang = 'csharp') => '```' + lang + '\n' + code.trim() + '\n```';
const out = (d) => `${d.severity} ${d.id}: ${d.message}`;
const wrap = (text, width = 96) => {
  const lines = []; let line = '';
  for (const word of text.split(' ')) {
    if (line && (line + ' ' + word).length > width) { lines.push(line); line = '    ' + word; } else line = line ? line + ' ' + word : word;
  }
  if (line) lines.push(line);
  return lines.join('\n');
};

const front = (title, summary, order) => `---\ntitle: ${JSON.stringify(title)}\nsummary: ${JSON.stringify(summary)}\norder: ${order}\n---\n\n`;

function familyNames(profiles) {
  const n = profiles.map((p) => p.name);
  return n.length > 2 ? `${n[0]}–${profiles[profiles.length - 1].version}` : n.join(', ');
}

/* ------------------------------------------------------------------------------------------------- pages */
function areaPage(lang, data, area) {
  const t = T[lang];
  const [title, summary] = t.areas[area.id];
  const rules = data.rules.filter((r) => r.id.slice(2, 4) === area.prefix);
  let md = front(title, summary, area.order);
  md += `${summary} ${t.areaIntro(rules.length)} ${t.seeAlsoRules}\n\n`;

  for (const rule of rules) {
    md += `## ${rule.id}: ${rule.title}\n\n`;
    md += `**${t.sevLabel}:** ${t.severity[rule.severity]}\n\n`;
    md += `**${t.msgLabel}:** ${blank(rule.message)}\n\n`;
    const cases = data.cases.filter((c) => c.id === rule.id).slice(0, 2);
    if (cases.length === 0) { md += `*${t.noSample}*\n\n`; continue; }
    for (const c of cases) {
      md += `${t.sampleTag}:\n\n${fence(c.code)}\n\n${fence(wrap(out(c)), 'text')}\n\n`;
    }
  }
  return md;
}

function targetPage(lang, data, target) {
  const t = T[lang];
  const name = t.targets[target.id];
  const profiles = data.profiles.filter((p) => p.api === target.api);
  const first = profiles[0], last = profiles[profiles.length - 1];
  const prefixes = [...new Set(profiles.map((p) => p.target.split('_')[0]))];
  const declare = `\`[ShaderTargets(Target.${first.target})]\``;
  let md = front(t.targetTitle(name), t.targetSummary(name), target.order);
  md += t.targetIntro(name, `${t.declare} ${declare}.`) + '\n\n';
  md += fence(`using YotsubaShader.Compiler.Metadata;\n\n[ShaderTargets(Target.${last.target})]\npublic class MyShader { /* ... */ }`) + '\n\n';
  md += `${t.versions}: ${profiles.map((p) => `\`Target.${p.target}\``).join(', ')}.\n\n`;
  const noBackend = profiles.filter((p) => !p.hasBackend);
  if (noBackend.length > 0) md += `> [!NOTE]\n> ${noBackend.map((p) => p.name).join(', ')}: ${t.noBackend}\n\n`;

  // What each version has
  md += `## ${t.matrixTitle}\n\n${t.matrixText}\n\n`;
  md += `| | ${profiles.map((p) => p.version).join(' | ')} |\n| --- | ${profiles.map(() => ':---:').join(' | ')} |\n`;
  for (const f of FEATURES) {
    md += `| ${t.features[f]} | ${profiles.map((p) => mark[p.features[f]?.level ?? 'Unknown']).join(' | ')} |\n`;
  }
  md += '\n';

  // Notes: why each feature is not guaranteed
  const noteLines = [];
  for (const f of FEATURES) {
    const groups = new Map();
    for (const p of profiles) {
      const level = p.features[f]?.level;
      const note = p.features[f]?.note;
      if ((level === 'Optional' || level === 'Unavailable') && note) {
        if (!groups.has(note)) groups.set(note, []);
        groups.get(note).push(p);
      }
    }
    for (const [note, list] of groups) noteLines.push(`- ${t.features[f]}, ${familyNames(list)}: ${note}.`);
  }
  if (noteLines.length > 0) md += `**${t.notes}**\n\n${noteLines.join('\n')}\n\n`;

  // Limits
  const limitKeys = ['colorAttachments', 'vertexInputs', 'interStageVariables', 'descriptorSets', 'uniformBufferBytes', 'workgroup'];
  const cell = (p, k) => {
    const v = p.limits[k];
    if (v === null || v === undefined) return '·';
    return k === 'workgroup' ? `${v.Invocations}` : `${v}`;
  };
  const usedLimits = limitKeys.filter((k) => profiles.some((p) => cell(p, k) !== '·'));
  if (usedLimits.length > 0) {
    md += `## ${t.limitsTitle}\n\n${t.limitsText}\n\n`;
    md += `| | ${profiles.map((p) => p.version).join(' | ')} |\n| --- | ${profiles.map(() => ':---:').join(' | ')} |\n`;
    for (const k of usedLimits) md += `| ${t.limitRows[k]} | ${profiles.map((p) => cell(p, k)).join(' | ')} |\n`;
    md += '\n';
  }

  // Examples: the same shader against every version of this API
  const interesting = data.examples.filter((e) => profiles.some((p) => e.results[p.target].length > 0));
  if (interesting.length > 0) {
    md += `## ${t.casesTitle}\n\n`;
    for (const e of interesting) {
      md += `### ${t.examples[e.key]}\n\n${fence(e.code)}\n\n`;
      // Group the versions that give exactly the same diagnostics.
      const groups = new Map();
      for (const p of profiles) {
        const diags = e.results[p.target];
        const key = diags.length === 0 ? '' : diags.map(out).join('\n');
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(p);
      }
      md += `| ${t.versionCol} | ${t.resultCol} |\n| --- | --- |\n`;
      for (const [key, list] of groups) {
        const severity = key === '' ? t.ok : [...new Set(key.split('\n').map((l) => l.split(' ')[0]))].map((s) => t.severity[s] ?? s).join(', ');
        md += `| ${list.map((p) => p.version).join(', ')} | ${esc(severity)} |\n`;
      }
      md += '\n';
      for (const [key, list] of groups) {
        if (key === '') continue;
        md += `${t.affected}: ${list.map((p) => p.name).join(', ')}\n\n${fence(key.split('\n').map((l) => wrap(l)).join('\n'), 'text')}\n\n`;
      }
    }
  }
  md += t.seeAlsoRules + '\n';
  return md;
}

function indexPage(lang) {
  const t = T[lang];
  let md = front(t.indexTitle, t.indexSummary, 10);
  md += `${t.indexIntro}\n\n${t.indexSev}\n\n${t.seeTargets}\n\n`;
  md += `## ${t.indexByTarget}\n\n${t.indexByTargetText}\n\n`;
  for (const tg of TARGETS) md += `- [${t.targetTitle(t.targets[tg.id])}](validate-${tg.id}.md)\n`;
  md += `\n## ${t.indexByArea}\n\n${t.indexByAreaText}\n\n`;
  for (const a of AREAS) md += `- [${t.areas[a.id][0]}](diagnostics-${a.id}.md): ${t.areas[a.id][1]}\n`;
  return md + '\n';
}

/* --------------------------------------------------------------------------------------------------- main */
for (const lang of ['en', 'es']) {
  const data = JSON.parse(fs.readFileSync(path.join(DATA, `${lang}.json`), 'utf8'));
  const dir = OUT(lang);
  fs.writeFileSync(path.join(dir, 'diagnostics.md'), indexPage(lang));
  for (const a of AREAS) fs.writeFileSync(path.join(dir, `diagnostics-${a.id}.md`), areaPage(lang, data, a));
  for (const tg of TARGETS) fs.writeFileSync(path.join(dir, `validate-${tg.id}.md`), targetPage(lang, data, tg));
}
console.log('diagnostics pages written for en and es');

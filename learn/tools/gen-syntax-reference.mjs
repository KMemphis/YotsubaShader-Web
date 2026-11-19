#!/usr/bin/env node
// Writes the five syntax reference pages (HLSL, GLSL, MSL, SPIR-V, WGSL) of the Documentation section:
//   content/<lang>/reference/{hlsl,glsl,msl,spirv,wgsl}.md
//
// The attribute lists are read from the YotsubaShader.<X>Syntax projects of the compiler repository (the folder that
// contains Web/), with the same reader and the same example generators the main site used to render these pages.
// The pages are committed as plain Markdown, so building learn never needs the compiler repository.
//
//   node tools/gen-syntax-reference.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { translateSourceComments } from '../../src/i18n/index.mjs';
import { SYNTAX_META, SYNTAX_IDS, scanSyntaxes, BUILTIN_MAP, RESOURCE_MAP } from '../../src/reference.mjs';
import { attributeGroupCode, builtinValuesCode, textureBindingCode } from '../../src/examples.mjs';
import { resourcesCode } from '../../src/pages/syntaxes.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LEARN = path.join(HERE, '..');
const REPO = path.join(LEARN, '..', '..');

const syntaxes = scanSyntaxes(REPO);
const missing = SYNTAX_IDS.filter((id) => !syntaxes[id].total);
if (missing.length) throw new Error(`No attributes found for ${missing.join(', ')}: is the compiler repository next to Web/?`);

const NAME = { hlsl: 'HLSL', glsl: 'GLSL', msl: 'MSL', spirv: 'SPIR-V', wgsl: 'WGSL' };
const EXAMPLE_ATTR = { hlsl: 'SV_Position', glsl: 'gl_Position', msl: 'position', spirv: 'BuiltIn_Position', wgsl: '@builtin_position' };
const ORDER = { hlsl: 1, glsl: 2, msl: 3, spirv: 4, wgsl: 5 };
const GROUPS = ['Input', 'Input / Output', 'Output', 'Method', 'Resource', 'Type'];

const T = {
  en: {
    title: (n) => `${n} syntax`,
    summary: (id) => `Every attribute of the ${NAME[id]} syntax: ${SYNTAX_META[id].summary.charAt(0).toLowerCase()}${SYNTAX_META[id].summary.slice(1)}`,
    overview: 'Overview',
    intro: (id, total) =>
      `The ${NAME[id]} syntax is inspired by **${SYNTAX_META[id].inspired}**. It has ${total} attributes in the \`${SYNTAX_META[id].project}\` package. The syntax you write with does not decide the output: the same shader compiles to any target.`,
    builtins: 'Built-in values by stage',
    builtinsText: 'Every built-in value the syntax declares, grouped by the stage that uses it.',
    resources: 'Resources and binding slots',
    resourcesText: 'Uniform buffers, storage buffers, textures and samplers, each with its slot written in this syntax.',
    map: 'Equivalents in the other syntaxes',
    mapText: (n) => `The same concept in ${n} and in the other four syntaxes. A dash means that the syntax has no spelling for it.`,
    mapBuiltin: 'Built-in values',
    mapResource: 'Resources',
    concept: 'Concept',
    attributes: 'Attributes',
    attrText: 'The attributes declared by the package, in groups, applied to real members.',
    groups: {
      Input: ['Input attributes', 'Apply to fields, parameters and properties that receive values from the pipeline.'],
      'Input / Output': ['Input and output attributes', 'Apply to values that can be received or produced, depending on the stage.'],
      Output: ['Output attributes', 'Apply to fields, parameters and return values the stage produces.'],
      Method: ['Method attributes', 'Apply to methods, for example to set a compute workgroup size.'],
      Resource: ['Resource attributes', 'Declare uniforms, buffers, textures, samplers and binding slots.'],
      Type: ['Supporting types', 'Structs, classes and enums used together with the attributes.'],
    },
    note: 'These listings show what the package declares. They do not mean that every concept is lowered by every output target.',
    others: 'The other syntaxes',
  },
  es: {
    title: (n) => `Sintaxis ${n}`,
    summary: (id) => `Todos los atributos de la sintaxis ${NAME[id]}, con ejemplos en C#.`,
    overview: 'Resumen',
    intro: (id, total) =>
      `La sintaxis ${NAME[id]} está inspirada en **${SYNTAX_META[id].inspired}**. Tiene ${total} atributos en el paquete \`${SYNTAX_META[id].project}\`. La sintaxis con la que escribes no decide el resultado: el mismo shader compila a cualquier destino.`,
    builtins: 'Valores integrados por etapa',
    builtinsText: 'Todos los valores integrados que declara la sintaxis, agrupados por la etapa que los usa.',
    resources: 'Recursos y ranuras',
    resourcesText: 'Buffers uniformes, buffers de almacenamiento, texturas y samplers, cada uno con su ranura escrita en esta sintaxis.',
    map: 'Equivalencias en las otras sintaxis',
    mapText: (n) => `El mismo concepto en ${n} y en las otras cuatro sintaxis. Un guion significa que esa sintaxis no tiene forma de escribirlo.`,
    mapBuiltin: 'Valores integrados',
    mapResource: 'Recursos',
    concept: 'Concepto',
    attributes: 'Atributos',
    attrText: 'Los atributos que declara el paquete, en grupos y aplicados a miembros reales.',
    groups: {
      Input: ['Atributos de entrada', 'Se aplican a campos, parámetros y propiedades que reciben valores del pipeline.'],
      'Input / Output': ['Atributos de entrada y salida', 'Se aplican a valores que se pueden recibir o producir, según la etapa.'],
      Output: ['Atributos de salida', 'Se aplican a campos, parámetros y valores de retorno que produce la etapa.'],
      Method: ['Atributos de método', 'Se aplican a métodos, por ejemplo para fijar el tamaño del grupo de trabajo de un compute.'],
      Resource: ['Atributos de recurso', 'Declaran uniforms, buffers, texturas, samplers y ranuras.'],
      Type: ['Tipos de apoyo', 'Structs, clases y enums que se usan junto con los atributos.'],
    },
    note: 'Estos listados muestran lo que declara el paquete. No significan que todos los destinos de salida traduzcan todos los conceptos.',
    others: 'Las otras sintaxis',
  },
};

// The concept names double as the code comments of the examples, so their Spanish text is in the comment table.
const concept = (s) => (LANG === 'es' ? translateSourceComments(`// ${s}`, 'es').replace(/^\/\/ /, '') : s);
const cell = (v) => (v ? '`' + v.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\|/g, '\\|') + '`' : '—');
let LANG = 'en';
// Code comments are translated with the same table the main site used for its code samples.
const fence = (code) => '```csharp\n' + (LANG === 'es' ? translateSourceComments(code.trim(), 'es') : code.trim()) + '\n```';

function mapTable(t, id, rows, groupRows) {
  const i = SYNTAX_IDS.indexOf(id);
  const others = SYNTAX_IDS.filter((x) => x !== id);
  const head = `| ${t.concept} | ${NAME[id]} | ${others.map((x) => NAME[x]).join(' | ')} |`;
  const sep = `| --- | ${SYNTAX_IDS.map(() => '---').join(' | ')} |`;
  const body = [];
  for (const r of rows) {
    if (groupRows && r[1] === null) {
      body.push(`| **${concept(r[0])}** |${' |'.repeat(SYNTAX_IDS.length)}`);
      continue;
    }
    const vals = r.slice(1);
    body.push(`| ${concept(r[0])} | ${[vals[i], ...others.map((x) => vals[SYNTAX_IDS.indexOf(x)])].map(cell).join(' | ')} |`);
  }
  return [head, sep, ...body].join('\n');
}

function page(lang, id) {
  LANG = lang;
  const t = T[lang];
  const meta = SYNTAX_META[id];
  const items = syntaxes[id].items;
  const out = [];
  out.push(`---\ntitle: ${t.title(NAME[id])}\nsummary: ${t.summary(id)}\norder: ${ORDER[id]}\n---\n`);
  out.push(`${t.intro(id, syntaxes[id].total)}\n`);
  out.push(fence(`using YotsubaShader.Language;\nusing ${meta.namespace};\n\npublic struct VertexOutput\n{\n    [${EXAMPLE_ATTR[id]}]\n    public Vector4 Position;\n}`) + '\n');
  out.push(`## ${t.builtins}\n\n${t.builtinsText}\n\n${fence(builtinValuesCode(id))}\n`);
  out.push(`## ${t.resources}\n\n${t.resourcesText}\n\n${fence(resourcesCode(id))}\n\n${fence(textureBindingCode(id))}\n`);
  out.push(`## ${t.map}\n\n${t.mapText(NAME[id])}\n\n### ${t.mapBuiltin}\n\n${mapTable(t, id, BUILTIN_MAP, true)}\n\n### ${t.mapResource}\n\n${mapTable(t, id, RESOURCE_MAP, false)}\n`);
  out.push(`## ${t.attributes}\n\n${t.attrText}\n`);
  for (const g of GROUPS) {
    if (!items.some((x) => x.kind === g)) continue;
    out.push(`### ${t.groups[g][0]}\n\n${t.groups[g][1]}\n\n${fence(attributeGroupCode(id, items, g))}\n`);
  }
  out.push(`> [!NOTE]\n> ${t.note}\n`);
  out.push(`${t.others}: ${SYNTAX_IDS.filter((x) => x !== id).map((x) => `[${NAME[x]}](${x}.md)`).join(', ')}.\n`);
  return out.join('\n');
}

for (const lang of ['en', 'es']) {
  const dir = path.join(LEARN, 'content', lang, 'reference');
  fs.mkdirSync(dir, { recursive: true });
  for (const id of SYNTAX_IDS) {
    fs.writeFileSync(path.join(dir, `${id}.md`), page(lang, id));
    console.log(`${lang}/reference/${id}.md  (${syntaxes[id].total} attributes)`);
  }
}

#!/usr/bin/env node
// Writes the five syntax pages of the API Reference section (HLSL, GLSL, MSL, SPIR-V, WGSL):
//   content/<lang>/api/{hlsl,glsl,msl,spirv,wgsl}.md
//
// Every declaration is read from the YotsubaShader.<X>Syntax projects of the compiler repository (the folder that
// contains Web/): the attribute usage, the concept it maps to, the constructor and the public members, exactly as
// the source declares them. The pages are committed as plain Markdown, so building learn never needs the compiler.
//
//   node tools/gen-api-reference.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LEARN = path.join(HERE, '..');
const REPO = path.join(LEARN, '..', '..');
const SYNTAX_DIR = path.join(REPO, 'Core', 'Syntax');

const IDS = ['hlsl', 'glsl', 'msl', 'spirv', 'wgsl'];
const META = {
  hlsl: { project: 'YotsubaShader.HlslSyntax', name: 'HLSL', inspired: 'HLSL (Direct3D)', order: 1 },
  glsl: { project: 'YotsubaShader.GlslSyntax', name: 'GLSL', inspired: 'GLSL (OpenGL / Vulkan GLSL)', order: 2 },
  msl: { project: 'YotsubaShader.MslSyntax', name: 'MSL', inspired: 'Metal Shading Language', order: 3 },
  spirv: { project: 'YotsubaShader.SpirvSyntax', name: 'SPIR-V', inspired: 'SPIR-V (Vulkan)', order: 4 },
  wgsl: { project: 'YotsubaShader.WgslSyntax', name: 'WGSL', inspired: 'WGSL (WebGPU)', order: 5 },
};

/* ------------------------------------------------------------------------------------------------ concepts */

// The concept attributes of YotsubaShader.Concepts that the syntax attributes are marked with.
// stage: where the value lives; type: the C# type used in the examples; field: the member name used in the examples.
const CONCEPTS = {
  ClipSpacePosition: { stage: 'vertex', type: 'Vector4', field: 'Position', en: 'Clip-space position written by the vertex stage.', es: 'Posición en espacio de recorte que escribe la etapa de vértices.' },
  FragmentCoordinate: { stage: 'fragment', type: 'Vector4', field: 'FragCoord', en: 'Window coordinate of the fragment, read by the fragment stage.', es: 'Coordenada en ventana del fragmento, que lee la etapa de fragmentos.' },
  VertexIndex: { stage: 'vertex', type: 'uint', field: 'VertexIndex', en: 'Index of the vertex being processed.', es: 'Índice del vértice que se está procesando.' },
  InstanceIndex: { stage: 'vertex', type: 'uint', field: 'InstanceIndex', en: 'Index of the instance being drawn.', es: 'Índice de la instancia que se está dibujando.' },
  BaseVertex: { stage: 'vertex', type: 'uint', field: 'BaseVertex', en: 'Base vertex of the draw call.', es: 'Vértice base de la llamada de dibujo.' },
  BaseInstance: { stage: 'vertex', type: 'uint', field: 'BaseInstance', en: 'Base instance of the draw call.', es: 'Instancia base de la llamada de dibujo.' },
  ClipInstance: { stage: 'vertex', type: 'float', field: 'ClipDistance', en: 'Clip distance: a negative value clips the primitive against a user plane.', es: 'Distancia de recorte: un valor negativo recorta la primitiva contra un plano del usuario.' },
  RenderTargetLayer: { stage: 'vertex', type: 'uint', field: 'Layer', en: 'Layer of a layered render target that receives the primitive.', es: 'Capa del render target por capas que recibe la primitiva.' },
  ViewportIndex: { stage: 'vertex', type: 'uint', field: 'ViewportIndex', en: 'Viewport that receives the primitive.', es: 'Viewport que recibe la primitiva.' },
  FrontFacingFlag: { stage: 'fragment', type: 'bool', field: 'IsFrontFace', en: '`true` when the fragment belongs to a front-facing primitive.', es: '`true` cuando el fragmento pertenece a una primitiva de cara frontal.' },
  FragDepth: { stage: 'fragment', type: 'float', field: 'Depth', en: 'Depth written by the fragment stage, replacing the interpolated one.', es: 'Profundidad que escribe la etapa de fragmentos, en lugar de la interpolada.' },
  ConservativeDepth: { stage: 'fragment', type: 'float', field: 'Depth', en: 'Conservative depth: the fragment promises to move the depth only in one direction, so early depth testing stays on.', es: 'Profundidad conservadora: el fragmento promete mover la profundidad en una sola dirección, así la prueba de profundidad temprana sigue activa.' },
  StencilReference: { stage: 'fragment', type: 'uint', field: 'StencilRef', en: 'Stencil reference value written by the fragment stage.', es: 'Valor de referencia de stencil que escribe la etapa de fragmentos.' },
  SampleIndex: { stage: 'fragment', type: 'uint', field: 'SampleIndex', en: 'Index of the sample being shaded (multisampling).', es: 'Índice de la muestra que se está sombreando (multimuestreo).' },
  SampleMask: { stage: 'fragment', type: 'uint', field: 'SampleMask', en: 'Coverage mask of the samples of the fragment.', es: 'Máscara de cobertura de las muestras del fragmento.' },
  PrimitiveIndex: { stage: 'fragment', type: 'uint', field: 'PrimitiveId', en: 'Index of the primitive the fragment belongs to.', es: 'Índice de la primitiva a la que pertenece el fragmento.' },
  BarycentricCoordinates: { stage: 'fragment', type: 'Vector3', field: 'Barycentrics', en: 'Barycentric coordinates of the fragment inside its triangle.', es: 'Coordenadas baricéntricas del fragmento dentro de su triángulo.' },
  BarycentricCoordinatesNoPerspective: { stage: 'fragment', type: 'Vector3', field: 'BarycentricsNoPersp', en: 'Barycentric coordinates without perspective correction.', es: 'Coordenadas baricéntricas sin corrección de perspectiva.' },
  HelperInvocation: { stage: 'fragment', type: 'bool', field: 'IsHelper', en: '`true` for helper invocations, which run only to compute derivatives.', es: '`true` en las invocaciones auxiliares, que solo corren para calcular derivadas.' },
  SamplePosition: { stage: 'fragment', type: 'Vector2', field: 'SamplePosition', en: 'Position of the current sample inside the pixel.', es: 'Posición de la muestra actual dentro del píxel.' },
  GlobalInvocationId: { stage: 'compute', type: 'UInt3', field: 'GlobalId', en: 'Position of the invocation in the whole dispatch.', es: 'Posición de la invocación en todo el dispatch.' },
  LocalInvocationId: { stage: 'compute', type: 'UInt3', field: 'LocalId', en: 'Position of the invocation inside its workgroup.', es: 'Posición de la invocación dentro de su grupo de trabajo.' },
  LocalInvocationIndex: { stage: 'compute', type: 'uint', field: 'LocalIndex', en: 'Flattened index of the invocation inside its workgroup.', es: 'Índice aplanado de la invocación dentro de su grupo de trabajo.' },
  WorkgroupId: { stage: 'compute', type: 'UInt3', field: 'GroupId', en: 'Position of the workgroup in the dispatch.', es: 'Posición del grupo de trabajo en el dispatch.' },
  NumberOfWorkgroups: { stage: 'compute', type: 'UInt3', field: 'GroupCount', en: 'Number of workgroups of the dispatch.', es: 'Cantidad de grupos de trabajo del dispatch.' },
  WorkgroupSizeBuiltInValue: { stage: 'compute', type: 'UInt3', field: 'GroupSize', en: 'Size of the workgroup, read as a value.', es: 'Tamaño del grupo de trabajo, leído como un valor.' },
  WorkgroupSizeMethod: { stage: 'compute', method: true, en: 'Sets the workgroup size of a compute entry point.', es: 'Fija el tamaño del grupo de trabajo de un punto de entrada compute.' },
  SubgroupSize: { stage: 'compute', type: 'uint', field: 'SubgroupSize', en: 'Number of invocations in a subgroup.', es: 'Cantidad de invocaciones de un subgrupo.' },
  SubgroupInvocationId: { stage: 'compute', type: 'uint', field: 'SubgroupLane', en: 'Index of the invocation inside its subgroup.', es: 'Índice de la invocación dentro de su subgrupo.' },
  SubgroupId: { stage: 'compute', type: 'uint', field: 'SubgroupId', en: 'Index of the subgroup inside the workgroup.', es: 'Índice del subgrupo dentro del grupo de trabajo.' },
  NumberOfSubgroups: { stage: 'compute', type: 'uint', field: 'SubgroupCount', en: 'Number of subgroups in the workgroup.', es: 'Cantidad de subgrupos del grupo de trabajo.' },
  Location: { stage: 'interface', type: 'Vector4', field: 'Color', en: 'Numbered interface slot: vertex inputs, values passed between stages and fragment outputs.', es: 'Ranura numerada de la interfaz: entradas de vértice, valores que pasan entre etapas y salidas de fragmento.' },
  UserSemantic: { stage: 'interface', type: 'Vector4', field: 'Value', en: 'Named user semantic. The backend turns it into a numbered location.', es: 'Semántica de usuario con nombre. El backend la convierte en una ubicación numerada.' },
  UniformBuffer: { stage: 'resource', en: 'Marks the field as a uniform (constant) buffer.', es: 'Marca el campo como un buffer uniforme (constante).' },
  RWStorageBuffer: { stage: 'resource', en: 'Marks the field as a storage buffer, read/write or read-only.', es: 'Marca el campo como un storage buffer, de lectura y escritura o de solo lectura.' },
  ReadOnlyStorageBuffer: { stage: 'resource', en: 'Read-only storage buffer.', es: 'Storage buffer de solo lectura.' },
  BindingSlot: { stage: 'resource', en: 'Binding slot of a resource.', es: 'Ranura de binding de un recurso.' },
  TextureSlot: { stage: 'resource', en: 'Binding slot of a texture.', es: 'Ranura de binding de una textura.' },
  SamplerSlot: { stage: 'resource', en: 'Binding slot of a sampler.', es: 'Ranura de binding de un sampler.' },
};

// Text written for one attribute when the concept alone is not precise enough.
const OVERRIDE = {
  register: {
    en: 'Binding slot written as an HLSL register: a prefix (`b` buffer, `t` texture, `s` sampler, `u` read/write) and a number, optionally with a space, or the same thing as a string such as `"b0"`.',
    es: 'Ranura de binding escrita como un registro de HLSL: un prefijo (`b` buffer, `t` textura, `s` sampler, `u` lectura y escritura) y un número, con un espacio opcional, o lo mismo como texto, por ejemplo `"b0"`.',
  },
  layout: { en: 'Descriptor set and binding of a buffer, texture or sampler.', es: 'Descriptor set y binding de un buffer, textura o sampler.' },
  DescriptorSet: { en: 'Descriptor set of a resource. Use it together with `Binding`.', es: 'Descriptor set de un recurso. Se usa junto con `Binding`.' },
  Binding: { en: 'Binding number of a resource inside its descriptor set. Written `@Binding` in C#.', es: 'Número de binding de un recurso dentro de su descriptor set. En C# se escribe `@Binding`.' },
  '@group': { en: 'Bind group of a resource. Use it together with `@binding`.', es: 'Grupo de binding de un recurso. Se usa junto con `@binding`.' },
  '@binding': { en: 'Binding number of a resource inside its bind group.', es: 'Número de binding de un recurso dentro de su grupo.' },
  buffer: {
    msl: { en: 'Buffer argument table slot, `[[buffer(n)]]` in Metal.', es: 'Ranura de la tabla de argumentos de buffers, `[[buffer(n)]]` en Metal.' },
    glsl: { en: 'Marks the field as a storage buffer (`buffer` block in GLSL), read/write or read-only.', es: 'Marca el campo como un storage buffer (bloque `buffer` de GLSL), de lectura y escritura o de solo lectura.' },
  },
  texture: { en: 'Texture argument table slot, `[[texture(n)]]` in Metal.', es: 'Ranura de la tabla de argumentos de texturas, `[[texture(n)]]` en Metal.' },
  sampler: { en: 'Sampler argument table slot, `[[sampler(n)]]` in Metal.', es: 'Ranura de la tabla de argumentos de samplers, `[[sampler(n)]]` en Metal.' },
  device: { en: 'Storage buffer in the `device` address space. `readOnly: true` makes it read-only.', es: 'Storage buffer en el espacio de direcciones `device`. `readOnly: true` lo hace de solo lectura.' },
  storage: { en: 'Storage buffer. `storage_use.read` makes it read-only, `storage_use.read_write` read/write.', es: 'Storage buffer. `storage_use.read` lo hace de solo lectura y `storage_use.read_write` de lectura y escritura.' },
  depth: { en: 'Fragment depth output. The mode `"any"` (default) writes any depth; `"greater"` and `"less"` are conservative depth.', es: 'Salida de profundidad del fragmento. El modo `"any"` (por defecto) escribe cualquier profundidad; `"greater"` y `"less"` son profundidad conservadora.' },
  SV_DepthGreaterEqual: { en: 'Fragment depth that is never smaller than the interpolated one (conservative depth).', es: 'Profundidad del fragmento que nunca es menor que la interpolada (profundidad conservadora).' },
  SV_DepthLessEqual: { en: 'Fragment depth that is never greater than the interpolated one (conservative depth).', es: 'Profundidad del fragmento que nunca es mayor que la interpolada (profundidad conservadora).' },
  SV_Target: { en: 'Fragment output written to the color target `n`.', es: 'Salida del fragmento que se escribe en el color target `n`.' },
  color: { en: 'Fragment output written to the color attachment `n`, `[[color(n)]]` in Metal.', es: 'Salida del fragmento que se escribe en el color attachment `n`, `[[color(n)]]` en Metal.' },
  attribute: { en: 'Vertex input read from the attribute `n`, `[[attribute(n)]]` in Metal.', es: 'Entrada de vértice que se lee del atributo `n`, `[[attribute(n)]]` en Metal.' },
  gl_SampleMaskIn: { en: 'Coverage mask of the samples of the fragment, as received.', es: 'Máscara de cobertura de las muestras del fragmento, tal como llega.' },
  gl_SampleMask: { en: 'Coverage mask written by the fragment stage.', es: 'Máscara de cobertura que escribe la etapa de fragmentos.' },
};

/* ------------------------------------------------------------------------------------------------- text */

const T = {
  en: {
    title: (n) => `${n} syntax API`,
    summary: (n, p) => `Every attribute and type of the ${p} package, with its declaration, its concept and an example.`,
    intro: (id, n) =>
      `API of the \`${META[id].project}\` package: the ${n} attributes and the types of the ${META[id].name} syntax, inspired by **${META[id].inspired}**. Each entry shows the declaration as the package writes it, the concept the compiler reads from it, the same concept in the other four syntaxes, and an example.`,
    install: 'Add the package to the shader project:',
    guide: (link) => `For a guided tour of the syntax, with every built-in value grouped by stage, see the [${link.label}](${link.href}) page of the Documentation.`,
    namespaces: 'Namespaces',
    namespacesText: 'The package splits its API in these namespaces. The attributes shared by every syntax (`ShaderStage`, `Location`, `Uniform`...) are in `YotsubaShader.Language`.',
    nsComment: { root: 'Built-in values, interface slots and method attributes', resources: 'Resource attributes and resource types', resTypes: 'Texture and sampler types', types: 'Vector, matrix and helper types' },
    groups: {
      Input: ['Input attributes', 'Fields, parameters and properties that receive a value from the pipeline.'],
      Output: ['Output attributes', 'Fields, parameters and return values that the stage produces.'],
      'Input / Output': ['Input and output attributes', 'Values that a stage can receive or produce. The stage decides which.'],
      Method: ['Method attributes', 'Attributes applied to an entry point method.'],
      Resource: ['Resource attributes', 'Uniform buffers, storage buffers and the binding slots of buffers, textures and samplers.'],
    },
    namespace: 'Namespace', appliesTo: 'Applies to', concept: 'Concept', also: 'Same concept in', none: 'no other syntax',
    targets: { Input: 'fields, parameters, properties', Output: 'fields, parameters, return values', 'Input / Output': 'fields, parameters, properties, return values', Method: 'methods', Resource: 'fields, parameters, properties' },
    example: 'Example:',
    types: 'Types',
    typesText: 'The types declared by the package. Members are listed without their bodies.',
    typeGroups: { types: 'Vector, matrix and helper types', resources: 'Resource types', resTypes: 'Texture and sampler types' },
    comments: { material: 'The contents of the uniform buffer', vertexOut: 'Vertex stage output', fragmentOut: 'Fragment stage output', fragmentIn: 'Fragment stage input', vertexIn: 'Vertex stage input', compute: 'Compute stage input', entry: 'Compute entry point' },
    others: 'The other syntaxes',
    note: 'The listings show what the package declares. Not every concept is lowered by every output target.',
  },
  es: {
    title: (n) => `API de la sintaxis ${n}`,
    summary: (n, p) => `Todos los atributos y tipos del paquete ${p}, con su declaración, su concepto y un ejemplo.`,
    intro: (id, n) =>
      `API del paquete \`${META[id].project}\`: los ${n} atributos y los tipos de la sintaxis ${META[id].name}, inspirada en **${META[id].inspired}**. Cada entrada muestra la declaración tal como la escribe el paquete, el concepto que el compilador lee de ella, el mismo concepto en las otras cuatro sintaxis y un ejemplo.`,
    install: 'Agrega el paquete al proyecto de shaders:',
    guide: (link) => `Para un recorrido guiado por la sintaxis, con cada valor integrado agrupado por etapa, mira la página [${link.label}](${link.href}) de la Documentación.`,
    namespaces: 'Espacios de nombres',
    namespacesText: 'El paquete reparte su API en estos espacios de nombres. Los atributos comunes a todas las sintaxis (`ShaderStage`, `Location`, `Uniform`...) están en `YotsubaShader.Language`.',
    nsComment: { root: 'Valores integrados, ranuras de interfaz y atributos de método', resources: 'Atributos de recursos y tipos de recursos', resTypes: 'Tipos de texturas y samplers', types: 'Tipos de vectores, matrices y auxiliares' },
    groups: {
      Input: ['Atributos de entrada', 'Campos, parámetros y propiedades que reciben un valor del pipeline.'],
      Output: ['Atributos de salida', 'Campos, parámetros y valores de retorno que produce la etapa.'],
      'Input / Output': ['Atributos de entrada y salida', 'Valores que una etapa puede recibir o producir. La etapa decide cuál.'],
      Method: ['Atributos de método', 'Atributos que se aplican a un método punto de entrada.'],
      Resource: ['Atributos de recursos', 'Buffers uniformes, storage buffers y las ranuras de binding de buffers, texturas y samplers.'],
    },
    namespace: 'Espacio de nombres', appliesTo: 'Se aplica a', concept: 'Concepto', also: 'El mismo concepto en', none: 'ninguna otra sintaxis',
    targets: { Input: 'campos, parámetros, propiedades', Output: 'campos, parámetros, valores de retorno', 'Input / Output': 'campos, parámetros, propiedades, valores de retorno', Method: 'métodos', Resource: 'campos, parámetros, propiedades' },
    example: 'Ejemplo:',
    types: 'Tipos',
    typesText: 'Los tipos que declara el paquete. Los miembros aparecen sin su cuerpo.',
    typeGroups: { types: 'Tipos de vectores, matrices y auxiliares', resources: 'Tipos de recursos', resTypes: 'Tipos de texturas y samplers' },
    comments: { material: 'El contenido del buffer uniforme', vertexOut: 'Salida de la etapa de vértices', fragmentOut: 'Salida de la etapa de fragmentos', fragmentIn: 'Entrada de la etapa de fragmentos', vertexIn: 'Entrada de la etapa de vértices', compute: 'Entrada de la etapa compute', entry: 'Punto de entrada compute' },
    others: 'Las otras sintaxis',
    note: 'Los listados muestran lo que declara el paquete. No todos los conceptos los traduce cada destino de salida.',
  },
};

/* ----------------------------------------------------------------------------------------------- reading */

/** The source without the license header, `using` lines and comments that are not XML docs. */
function clean(src) {
  const end = src.indexOf('#endregion');
  if (end >= 0) src = src.slice(end + '#endregion'.length);
  return src
    .replace(/^﻿/, '')
    .split('\n')
    .filter((l) => !/^\s*using\s+[\w.]+\s*;/.test(l) && !/^\s*\/\/\/?/.test(l))
    .join('\n');
}

/** Index of the brace that closes the one at `open`. */
function matchBrace(s, open) {
  let depth = 0;
  for (let i = open; i < s.length; i++) {
    if (s[i] === '{') depth++;
    else if (s[i] === '}' && --depth === 0) return i;
  }
  return s.length - 1;
}

/** The text of `s` from `i` up to the first `stop` character outside parentheses, brackets and angle brackets. */
function until(s, i, stops) {
  let depth = 0;
  let j = i;
  for (; j < s.length; j++) {
    const c = s[j];
    if ('([<'.includes(c)) depth++;
    else if (')]>'.includes(c)) depth = Math.max(0, depth - 1);
    else if (depth === 0 && stops.includes(c)) break;
    if (depth === 0 && stops.includes('=>') && s.startsWith('=>', j)) break;
  }
  return j;
}

const squash = (s) => s.replace(/\s+/g, ' ').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').replace(/\s+,/g, ',').trim();
const noConceptKey = (s) => s.replace(/\[ConceptKey\([^)]*\)\]\s*/g, '');

/** Public members of a type body, as signatures without bodies or initializers. */
function members(body) {
  const out = [];
  let i = 0;
  let pendingAttrs = [];
  while (i < body.length) {
    while (i < body.length && /\s/.test(body[i])) i++;
    if (i >= body.length) break;
    if (body[i] === '[') {
      let depth = 0, j = i;
      for (; j < body.length; j++) { if (body[j] === '[') depth++; else if (body[j] === ']' && --depth === 0) break; }
      pendingAttrs.push(squash(body.slice(i, j + 1)));
      i = j + 1;
      continue;
    }
    const stop = until(body, i, ['{', ';', '=']);
    const head = squash(noConceptKey(body.slice(i, stop)));
    let next;
    let kind;
    if (body[stop] === '{') {
      const close = matchBrace(body, stop);
      kind = /\bget\b|\bset\b/.test(body.slice(stop, close)) && !/\(/.test(head.replace(/this\[[^\]]*\]/, '')) ? 'property' : 'block';
      next = close + 1;
    } else if (body.startsWith('=>', stop)) {
      next = until(body, stop + 2, [';']) + 1;
      kind = /\(/.test(head.replace(/this\[[^\]]*\]/, '')) ? 'method' : 'expr';
    } else if (body[stop] === '=') {
      next = until(body, stop + 1, [';']) + 1;
      kind = 'field';
    } else {
      next = stop + 1;
      kind = 'field';
    }
    if (/^public\b/.test(head) && !/^public\s+(static\s+)?(class|struct|enum|record)\b/.test(head)) {
      let sig = head;
      if (kind === 'property' || kind === 'expr') sig += ' { get; }';
      else sig += ';';
      out.push(...pendingAttrs, sig);
    }
    pendingAttrs = [];
    i = next;
  }
  return out;
}

const TYPE_RE = /((?:\s*\[[^\]]*(?:\[[^\]]*\][^\]]*)*\]\s*)*)\bpublic\s+((?:static\s+|sealed\s+|partial\s+|readonly\s+)*)(class|struct|enum|record)\s+(@?\w+)(<[\w, ]+>)?/g;

/** Every public type declared in a file, with its attributes, signature and public members. */
function readFile(file) {
  const src = clean(fs.readFileSync(file, 'utf8'));
  const ns = /namespace\s+([\w.]+)\s*[;{]/.exec(src)?.[1] || '';
  const out = [];
  for (const m of src.matchAll(TYPE_RE)) {
    const [whole, attrBlock, mods, form, rawName, generic = ''] = m;
    const start = m.index + whole.length;
    // primary constructor and base list, up to the body or the semicolon
    const stop = until(src, start, ['{', ';']);
    const tail = squash(noConceptKey(src.slice(start, stop))).replace(/\)\s*:/, ") :");
    const attrs = [...attrBlock.matchAll(/\[([^\]]*(?:\[[^\]]*\][^\]]*)*)\]/g)].map((a) => `[${squash(a[1])}]`);
    let body = [];
    let enumBody = '';
    if (src[stop] === '{') {
      const close = matchBrace(src, stop);
      const inner = src.slice(stop + 1, close);
      if (form === 'enum') enumBody = inner.split(',').map((s) => squash(s)).filter(Boolean).join(', ');
      else body = members(inner);
    }
    const usage = attrs.find((a) => a.startsWith('[AttributeUsage'));
    const concepts = attrs
      .filter((a) => !a.startsWith('[AttributeUsage'))
      .flatMap((a) => a.slice(1, -1).split(/,\s*(?![^()]*\))/))
      .map((s) => s.trim().replace(/^YotsubaShader\.Concepts\./, '').replace(/Attribute$/, '').replace(/\(.*$/, ''));
    const base = /:\s*([\w.]+)/.exec(tail)?.[1];
    if (base && base !== 'YotsubaShaderConcept' && CONCEPTS[base] && !concepts.includes(base)) concepts.push(base);
    const params = /^\(([^)]*)\)/.exec(tail)?.[1] || ctorParams(src, rawName);
    out.push({
      name: rawName,
      generic,
      ns,
      form,
      attribute: form === 'class' && !!usage,
      usage,
      kind: usageKind(usage || ''),
      concepts: concepts.filter((c) => CONCEPTS[c]),
      attrs,
      params,
      decl: [...attrs, `public ${mods}${form} ${rawName}${generic}${tail ? (tail.startsWith('(') ? '' : ' ') + tail : ''}${form === 'enum' ? ` { ${enumBody} }` : body.length ? '' : ';'}`],
      body,
    });
  }
  return out;
}

/** Parameters of the first public constructor, for attributes without a primary constructor. */
function ctorParams(src, name) {
  const m = new RegExp(`public\\s+${name.replace('@', '@?')}\\s*\\(([^)]*)\\)`).exec(noConceptKey(src));
  return m ? squash(m[1]) : '';
}

function usageKind(text) {
  if (/InputOutput/.test(text)) return 'Input / Output';
  if (/AttributeUsagesTable\.Input/.test(text)) return 'Input';
  if (/AttributeUsagesTable\.Output/.test(text)) return 'Output';
  if (/Method/.test(text)) return 'Method';
  if (/Resource/.test(text)) return 'Resource';
  return 'Type';
}

function scan(id) {
  const root = path.join(SYNTAX_DIR, META[id].project);
  const items = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name !== 'bin' && e.name !== 'obj') walk(full);
      } else if (e.name.endsWith('.cs')) {
        for (const item of readFile(full)) {
          // Files named "@builtin_x.cs" declare "builtin_x"; users write it with the @ prefix.
          if (e.name.startsWith('@') && !item.name.startsWith('@')) item.name = '@' + item.name;
          item.rel = path.relative(root, full);
          items.push(item);
        }
      }
    }
  };
  if (fs.existsSync(root)) walk(root);
  const key = (s) => s.replace('@', '').toLowerCase();
  items.sort((a, b) => key(a.name).localeCompare(key(b.name), 'en'));
  return items;
}

/* --------------------------------------------------------------------------------------------- examples */

const BIND = {
  hlsl: { uniform: ['cbuffer', 'register(RegisterPrefix.b, 0)'], storage: ['', 'register(RegisterPrefix.u, 0)'], texture: 'register(RegisterPrefix.t, 0)', sampler: 'register("s0")' },
  glsl: { uniform: ['uniform', 'layout(0, 0)'], storage: ['buffer', 'layout(0, 1)'], texture: 'layout(0, 2)', sampler: 'layout(0, 3)' },
  msl: { uniform: ['constant', 'buffer(0)'], storage: ['device', 'buffer(1)'], texture: 'texture(0)', sampler: 'sampler(0)' },
  spirv: { uniform: ['Uniform', 'DescriptorSet(0), @Binding(0)'], storage: ['StorageBuffer', 'DescriptorSet(0), @Binding(1)'], texture: 'DescriptorSet(0), @Binding(2)', sampler: 'DescriptorSet(0), @Binding(3)' },
  wgsl: { uniform: ['uniform', '@group(0), @binding(0)'], storage: ['storage(storage_use.read_write)', '@group(0), @binding(1)'], texture: '@group(0), @binding(2)', sampler: '@group(0), @binding(3)' },
};

// The vector types of each syntax (YotsubaShader.<X>Syntax.Types) for the logical types used by CONCEPTS.
const VEC = {
  hlsl: { Vector4: 'float4', Vector3: 'float3', Vector2: 'float2', UInt3: 'uint3' },
  glsl: { Vector4: 'vec4', Vector3: 'vec3', Vector2: 'vec2', UInt3: 'uvec3' },
  msl: { Vector4: 'float4', Vector3: 'float3', Vector2: 'float2', UInt3: 'uint3' },
  spirv: { Vector4: 'vec4', Vector3: 'vec3', Vector2: 'vec2', UInt3: 'uvec3' },
  wgsl: { Vector4: 'vec4<float>', Vector3: 'vec3<float>', Vector2: 'vec2<float>', UInt3: 'vec3<uint>' },
};

// A texture and a sampler of each syntax (YotsubaShader.<X>Syntax.Resources.Types).
const TEX = {
  hlsl: ['Texture2D', 'SamplerState'],
  glsl: ['sampler2D', 'sampler2D'],
  msl: ['texture2d<float>', 'sampler'],
  spirv: ['sampler2D', 'sampler2D'],
  wgsl: ['texture_2d<float>', 'sampler'],
};

/** Arguments for the required parameters of an attribute. */
function sampleArgs(params) {
  if (!params) return '';
  const args = [];
  for (const part of params.split(/,\s*(?![^()]*\))/)) {
    if (/=/.test(part)) continue;
    const m = /^(\S+)\s+(\w+)$/.exec(part.trim());
    if (!m) continue;
    const [, type, name] = m;
    if (type === 'RegisterPrefix') args.push('RegisterPrefix.b');
    else if (type === 'storage_use') args.push('storage_use.read_write');
    else if (type === 'string') args.push('"b0"');
    else if (type === 'bool') args.push('false');
    else if (type === 'uint') args.push({ x: '8', y: '8', z: '1' }[name] || '0');
    else args.push('0');
  }
  return args.length ? `(${args.join(', ')})` : '';
}

/** A short, valid C# example that uses the attribute. */
function example(id, item, t) {
  const attr = (item.name === 'Binding' ? '@Binding' : item.name) + sampleArgs(item.params);
  const ns = `using YotsubaShader.Language;\nusing ${META[id].project};\n`;
  const resNs = `using ${META[id].project}.Resources;\n`;
  const texNs = `using ${META[id].project}.Resources.Types;\n`;
  const [tex, smp] = TEX[id];
  const c = item.concepts[0] && CONCEPTS[item.concepts[0]];
  const b = BIND[id];
  if (item.kind === 'Method') {
    return `${ns}\npublic class Blur\n{\n    // ${t.comments.entry}\n    [ShaderStage(Stage.Compute)]\n    [${attr}]\n    public void Main() { }\n}`;
  }
  if (item.kind === 'Resource') {
    const material = `public struct Material\n{\n    // ${t.comments.material}\n    public float Exposure;\n}\n\n`;
    const has = (x) => item.concepts.includes(x);
    if (has('UniformBuffer')) {
      return `${ns}${resNs}\n${material}public class Resources\n{\n    [${attr}, ${b.uniform[1]}]\n    public Material Material;\n}`;
    }
    if (has('RWStorageBuffer') || has('ReadOnlyStorageBuffer')) {
      return `${ns}${resNs}\npublic class Resources\n{\n    [${attr}, ${b.storage[1]}]\n    public float[] Output;\n}`;
    }
    // binding slots: the attribute together with the other half of the slot, when the syntax splits it
    const pair = { DescriptorSet: 'DescriptorSet(0), @Binding(0)', Binding: 'DescriptorSet(0), @Binding(0)', '@group': '@group(0), @binding(0)', '@binding': '@group(0), @binding(0)' }[item.name];
    if (item.name === 'buffer' && id === 'msl') {
      return `${ns}${resNs}\n${material}public class Resources\n{\n    [constant, buffer(0)]\n    public Material Material;\n}`;
    }
    if (item.name === 'sampler') return `${ns}${resNs}${texNs}\npublic class Surface\n{\n    [sampler(0)]\n    public ${smp} Sampler;\n}`;
    if (item.name === 'register') {
      return `${ns}${resNs}${texNs}\n${material}public class Resources\n{\n    [cbuffer, register(RegisterPrefix.b, 0)]\n    public Material Material;\n\n    [register(RegisterPrefix.t, 0)]\n    public ${tex} Albedo;\n\n    [register("s0")]\n    public ${smp} Sampler;\n}`;
    }
    const slot = pair || attr;
    return `${ns}${resNs}${texNs}\npublic class Surface\n{\n    [${slot}]\n    public ${tex} Albedo;\n}`;
  }
  // built-in values and interface slots
  const type = c?.type || 'Vector4';
  const field = c?.field || 'Value';
  const fieldType = /^(Vertex|Instance|BaseVertex|BaseInstance)/.test(item.concepts[0] || '') && ['glsl', 'spirv'].includes(id) ? 'int' : type;
  let holder;
  if (c?.stage === 'compute') holder = ['ComputeInput', t.comments.compute];
  else if (item.kind === 'Output') holder = c?.stage === 'vertex' ? ['VertexOutput', t.comments.vertexOut] : ['FragmentOutput', t.comments.fragmentOut];
  else if (item.kind === 'Input') holder = c?.stage === 'vertex' ? ['VertexInput', t.comments.vertexIn] : ['FragmentInput', t.comments.fragmentIn];
  else holder = c?.stage === 'fragment' ? ['FragmentInput', t.comments.fragmentIn] : ['VertexOutput', t.comments.vertexOut];
  const native = VEC[id][fieldType] || fieldType;
  const typesNs = native !== fieldType ? `using ${META[id].project}.Types;\n` : '';
  const line = `[${attr}] public ${native} ${field};`;
  return `${ns}${typesNs}\n// ${holder[1]}\npublic struct ${holder[0]}\n{\n    ${line}\n}`;
}

/* ------------------------------------------------------------------------------------------------ write */

const scanned = Object.fromEntries(IDS.map((id) => [id, scan(id)]));
const missing = IDS.filter((id) => !scanned[id].some((i) => i.attribute));
if (missing.length) throw new Error(`No attributes found for ${missing.join(', ')}: is the compiler repository next to Web/?`);

// concept -> syntax -> [names]
const byConcept = {};
for (const id of IDS) {
  for (const item of scanned[id].filter((i) => i.attribute)) {
    for (const c of item.concepts) ((byConcept[c] ||= {})[id] ||= []).push(item.name);
  }
}

const GROUP_ORDER = ['Input', 'Output', 'Input / Output', 'Method', 'Resource'];
// the same rule as slugify() in lib/markdown.mjs, which gives the headings their ids
const anchor = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

function describe(id, item, lang) {
  const o = OVERRIDE[item.name];
  const text = o && (o[id] ? o[id][lang] : o[lang]);
  if (text) return text;
  const c = item.concepts.find((x) => CONCEPTS[x]);
  return c ? CONCEPTS[c][lang] : '';
}

function page(id, lang) {
  const t = T[lang];
  const items = scanned[id];
  const attrs = items.filter((i) => i.attribute);
  const types = items.filter((i) => !i.attribute);
  const out = [];
  const guide = { label: lang === 'es' ? `Sintaxis ${META[id].name}` : `${META[id].name} syntax`, href: `../reference/${id}.md` };
  out.push('---');
  out.push(`title: ${t.title(META[id].name)}`);
  out.push(`summary: ${t.summary(META[id].name, META[id].project)}`);
  out.push(`order: ${META[id].order}`);
  out.push('---');
  out.push('');
  out.push(t.intro(id, attrs.length));
  out.push('');
  out.push(t.install);
  out.push('');
  out.push('```bash');
  out.push(`dotnet add package ${META[id].project}`);
  out.push('```');
  out.push('');
  out.push(t.guide(guide));
  out.push('');

  // namespaces
  const nss = [...new Set(items.map((i) => i.ns))].sort();
  out.push(`## ${t.namespaces}`);
  out.push('');
  out.push(t.namespacesText);
  out.push('');
  out.push('```csharp');
  out.push('using YotsubaShader.Language;');
  for (const ns of nss) {
    const rest = ns.slice(META[id].project.length);
    const label = rest === '' ? t.nsComment.root : rest === '.Resources' ? t.nsComment.resources : rest === '.Resources.Types' ? t.nsComment.resTypes : t.nsComment.types;
    out.push(`using ${ns}; // ${label}`);
  }
  out.push('```');
  out.push('');

  for (const group of GROUP_ORDER) {
    const list = attrs.filter((i) => i.kind === group);
    if (!list.length) continue;
    out.push(`## ${t.groups[group][0]}`);
    out.push('');
    out.push(t.groups[group][1]);
    out.push('');
    for (const item of list) {
      out.push(`### ${item.name}`);
      out.push('');
      const d = describe(id, item, lang);
      if (d) {
        out.push(d);
        out.push('');
      }
      out.push('```csharp');
      out.push(`namespace ${item.ns};`);
      out.push('');
      out.push(...item.decl);
      if (item.body.length) {
        out.push('{');
        out.push(...item.body.map((l) => `    ${l}`));
        out.push('}');
      }
      out.push('```');
      out.push('');
      const facts = [`**${t.namespace}:** \`${item.ns}\``, `**${t.appliesTo}:** ${t.targets[group]}`];
      if (item.concepts.length) facts.push(`**${t.concept}:** ${item.concepts.map((c) => `\`${c}\``).join(', ')}`);
      const same = [];
      for (const other of IDS.filter((x) => x !== id)) {
        const names = [...new Set(item.concepts.flatMap((c) => byConcept[c]?.[other] || []))];
        if (names.length) same.push(`${META[other].name} ${names.map((n) => `[${n}](${other}.md#${anchor(n)})`).join(', ')}`);
      }
      if (item.concepts.length) facts.push(`**${t.also}:** ${same.length ? same.join(' · ') : t.none}`);
      out.push(facts.map((f) => `- ${f}`).join('\n'));
      out.push('');
      out.push(t.example);
      out.push('');
      out.push('```csharp');
      out.push(example(id, item, t));
      out.push('```');
      out.push('');
    }
  }

  // types
  if (types.length) {
    out.push(`## ${t.types}`);
    out.push('');
    out.push(t.typesText);
    out.push('');
    const buckets = { types: [], resources: [], resTypes: [] };
    for (const ty of types) {
      const rest = ty.ns.slice(META[id].project.length);
      if (rest === '.Resources') buckets.resources.push(ty);
      else if (rest === '.Resources.Types') buckets.resTypes.push(ty);
      else buckets.types.push(ty);
    }
    for (const key of ['resources', 'resTypes', 'types']) {
      const list = buckets[key];
      if (!list.length) continue;
      out.push(`### ${t.typeGroups[key]}`);
      out.push('');
      out.push('```csharp');
      out.push(`namespace ${list[0].ns};`);
      for (const ty of list) {
        out.push('');
        out.push(...ty.decl);
        if (ty.body.length) {
          out.push('{');
          out.push(...ty.body.map((l) => `    ${l}`));
          out.push('}');
        }
      }
      out.push('```');
      out.push('');
    }
  }

  out.push('> [!NOTE]');
  out.push(`> ${t.note}`);
  out.push('');
  out.push(`## ${t.others}`);
  out.push('');
  out.push('```buttons');
  for (const other of IDS.filter((x) => x !== id)) out.push(`[${META[other].name}](${other}.md)`);
  out.push('```');
  out.push('');
  return out.join('\n');
}

for (const lang of ['en', 'es']) {
  const dir = path.join(LEARN, 'content', lang, 'api');
  fs.mkdirSync(dir, { recursive: true });
  for (const id of IDS) {
    fs.writeFileSync(path.join(dir, `${id}.md`), page(id, lang));
    console.log(`content/${lang}/api/${id}.md  ${scanned[id].filter((i) => i.attribute).length} attributes, ${scanned[id].filter((i) => !i.attribute).length} types`);
  }
}

#!/usr/bin/env node
// Shader-compatibility harness.
//
// For every concept in concepts.mjs: compile the shader to SPIR-V (dxc or
// glslang), validate it with spirv-val, translate it to every backend with
// naga and spirv-cross, validate each output with the backend's own compiler,
// and write the verified table to compat.json.
//
// Run from Web/:  node tools/compat/run.mjs [--only Id,Id] [--jobs N]

import { execFile } from 'node:child_process';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { homedir, cpus } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONCEPTS } from './concepts.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SHADERS = path.join(HERE, 'shaders');
const OUT = path.join(HERE, 'out');
const RESULT = path.join(HERE, 'compat.json');

const args = process.argv.slice(2);
const argValue = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const ONLY = argValue('--only')?.split(',');
const JOBS = Number(argValue('--jobs') ?? Math.max(2, Math.min(8, cpus().length)));

// ---------------------------------------------------------------- tools

const findTool = (envName, candidates) => {
  if (process.env[envName]) return process.env[envName];
  return candidates.find((c) => !c.includes('/') || existsSync(c)) ?? candidates.at(-1);
};

const TOOL = {
  dxc: findTool('DXC', ['dxc']),
  naga: findTool('NAGA', [path.join(homedir(), '.cargo/bin/naga'), 'naga']),
  spirvCross: findTool('SPIRV_CROSS', ['spirv-cross']),
  glslang: findTool('GLSLANG', ['glslangValidator']),
  spirvVal: findTool('SPIRV_VAL', ['spirv-val']),
  spirvDis: findTool('SPIRV_DIS', ['spirv-dis']),
  xcrun: findTool('XCRUN', ['xcrun']),
};

const TARGET_ENV = 'vulkan1.2';
const MSL_VERSION = { naga: '3.0', spirvCross: '30000', std: 'metal3.0' };
// Shader models tried for Direct3D 12, lowest first. The first one whose
// output compiles is recorded as `requires`.
const SHADER_MODELS = ['60', '61', '62', '63', '64', '65', '66', '67'];

// WebGPU validation of the WGSL output: naga re-parses it with only the
// capabilities WebGPU guarantees, then with the optional WebGPU features that
// are switched on by an `enable` directive (or a device feature).
const WGSL_CORE_CAPS = ['MULTISAMPLED_SHADING', 'CUBE_ARRAY_TEXTURES'];
const WGSL_OPTIONAL_CAPS = {
  SHADER_FLOAT16: 'f16',
  CLIP_DISTANCES: 'clip_distances',
  DUAL_SOURCE_BLENDING: 'dual_source_blending',
  PRIMITIVE_INDEX: 'primitive_index',
  SUBGROUP: 'subgroups',
  SUBGROUP_BARRIER: 'subgroups',
};

// SPIR-V extensions that are core (possibly behind a device feature) in Vulkan 1.2.
const VULKAN12_CORE_SPV_EXTENSIONS = new Set([
  'SPV_KHR_shader_draw_parameters',
  'SPV_KHR_storage_buffer_storage_class',
  'SPV_KHR_variable_pointers',
  'SPV_KHR_16bit_storage',
  'SPV_KHR_8bit_storage',
  'SPV_KHR_multiview',
  'SPV_KHR_device_group',
  'SPV_KHR_float_controls',
  'SPV_KHR_vulkan_memory_model',
  'SPV_KHR_physical_storage_buffer',
  'SPV_EXT_descriptor_indexing',
  'SPV_EXT_shader_viewport_index_layer',
]);

export const BACKENDS = [
  { id: 'vulkan', label: 'Vulkan (SPIR-V)' },
  { id: 'd3d12', label: 'Direct3D 12 (HLSL SM6)' },
  { id: 'metal', label: 'Metal (MSL)' },
  { id: 'webgpu', label: 'WebGPU (WGSL)' },
  { id: 'opengl', label: 'OpenGL 4.5 (GLSL)' },
  { id: 'webgl2', label: 'WebGL 2 (GLSL ES 3.00)' },
];

const STAGE_PROFILE = { vert: 'vs', frag: 'ps', comp: 'cs' };
const GLSL_STAGE_EXT = { vert: 'vert', frag: 'frag', comp: 'comp' };
const RANK = { ok: 4, extension: 3, dropped: 2, invalid: 1, rejected: 0 };

// ---------------------------------------------------------------- helpers

function run(cmd, argv, { cwd } = {}) {
  return new Promise((resolve) => {
    execFile(cmd, argv, { cwd, maxBuffer: 16 * 1024 * 1024, timeout: 60_000 }, (err, stdout, stderr) => {
      const code = err ? (typeof err.code === 'number' ? err.code : 1) : 0;
      const spawnError = err && typeof err.code === 'string' ? `${err.code}: ${cmd}` : '';
      resolve({ ok: code === 0, code, stdout: String(stdout), stderr: String(stderr) + spawnError });
    });
  });
}

// First meaningful error from tool output, with naga's detail lines
// ("= ..." notes, or the line after a trailing colon) appended.
function firstError(text) {
  const lines = text
    .split('\n')
    .map((l) => l.replace(/\x1b\[[0-9;]*m/g, '').trim())
    .filter(
      (l) =>
        l &&
        !/^[│┌└─┬╭╰]/.test(l) &&
        !/^\d+ │/.test(l) &&
        !/^Generating \w+ output requires validation/.test(l) &&
        !/compilation terminated|compilation errors\.|^Validation failed\.$/.test(l),
    );
  const pattern = /\berror\b|ERROR:|unsupported|not supported|invalid|failed|missing|conflict|exception|doesn't|Could not/i;
  const i = Math.max(0, lines.findIndex((l) => pattern.test(l)));
  let message = lines[i] ?? '';
  const details = [];
  for (let j = i + 1; j < lines.length && details.length < 2; j++) {
    if (lines[j].startsWith('=')) details.push(lines[j].replace(/^=\s*/, ''));
    else if (!details.length && message.endsWith(':')) details.push(lines[j]);
    else break;
  }
  if (details.length) message = `${message.replace(/:$/, '')}: ${details.join('; ')}`;
  // dxc prints "error: validation errors" before the actual rule.
  if (/^error: validation errors$/.test(message)) {
    const rule = lines.find((l, k) => k > i && /error:/.test(l));
    if (rule) message = rule.replace(/^.*?error:\s*/, 'validation: ');
  }
  return message.split(`${HERE}${path.sep}`).join('').slice(0, 300);
}

const firstLine = (text) => text.split('\n').map((l) => l.trim()).find(Boolean) ?? '';

function glslExtensions(text) {
  const names = [...text.matchAll(/^\s*#\s*extension\s+(\w+)\s*:\s*(require|enable|warn)\b/gm)].map((m) => m[1]);
  return [...new Set(names)];
}

function wgslExtensions(text) {
  const names = [];
  for (const m of text.matchAll(/^\s*enable\s+([^;]+);/gm)) names.push(...m[1].split(',').map((s) => s.trim()));
  return [...new Set(names.filter(Boolean))];
}

function parseDisassembly(dis) {
  const builtins = new Set();
  const capabilities = new Set();
  const extensions = new Set();
  const executionModes = new Set();
  for (const m of dis.matchAll(/Op(?:Member)?Decorate %\S+(?: \d+)? BuiltIn (\w+)/g)) builtins.add(m[1]);
  for (const m of dis.matchAll(/OpCapability (\w+)/g)) capabilities.add(m[1]);
  for (const m of dis.matchAll(/OpExtension "([^"]+)"/g)) extensions.add(m[1]);
  for (const m of dis.matchAll(/OpExecutionMode(?:Id)? %\S+ (\w+(?: [\d ]+)?)/g)) executionModes.add(m[1].trim());
  return {
    builtins: [...builtins],
    capabilities: [...capabilities],
    spirvExtensions: [...extensions],
    executionModes: [...executionModes],
  };
}

async function pool(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return results;
}

// ---------------------------------------------------------------- validators

async function validateGlsl(file, stage) {
  const r = await run(TOOL.glslang, ['-S', stage, file]);
  if (r.ok) return { ok: true, message: '' };
  const out = r.stdout + r.stderr;
  // glslang does not implement every Khronos extension for every profile. When
  // the only errors are unknown #extension lines, the output cannot be verified.
  const errors = out.split('\n').filter((l) => /^ERROR: \d+:\d+:/.test(l));
  const unknown = [...out.matchAll(/'#extension' : extension not supported: (\w+)/g)].map((m) => m[1]);
  const lineOf = (l) => l.match(/^ERROR: \d+:(\d+):/)?.[1];
  const extLines = new Set(errors.filter((l) => l.includes("'#extension'")).map(lineOf));
  if (unknown.length && errors.every((l) => extLines.has(lineOf(l)))) {
    return { ok: false, unverified: unknown, message: `glslang does not implement ${unknown.join(', ')} for this profile; output not compiled` };
  }
  return { ok: false, message: firstError(out) };
}

async function validateMsl(file) {
  const r = await run(TOOL.xcrun, ['-sdk', 'macosx', 'metal', `-std=${MSL_VERSION.std}`, '-c', file, '-o', `${file}.air`]);
  await rm(`${file}.air`, { force: true });
  return { ok: r.ok, message: r.ok ? '' : firstError(r.stderr + r.stdout) };
}

async function validateHlsl(file, stage, sm) {
  const text = await readFile(file, 'utf8');
  const profile = `${STAGE_PROFILE[stage]}_${sm[0]}_${sm[1]}`;
  const candidates = ['main', 'main_', 'main0', 'vert_main', 'frag_main', 'comp_main'].filter(
    (n) => n === 'main' || new RegExp(`\\b${n}\\s*\\(`).test(text),
  );
  let last;
  for (const entry of candidates) {
    const r = await run(TOOL.dxc, ['-T', profile, '-E', entry, file, '-Fo', `${file}.dxil`]);
    await rm(`${file}.dxil`, { force: true });
    last = { ok: r.ok, entry, message: r.ok ? '' : firstError(r.stderr + r.stdout) };
    if (r.ok || !/missing entry point/i.test(r.stderr + r.stdout)) return last;
  }
  return last;
}

async function validateWgsl(file) {
  const text = await readFile(file, 'utf8');
  const extensions = wgslExtensions(text);
  const core = await run(TOOL.naga, ['--capabilities', WGSL_CORE_CAPS.join(','), file]);
  if (core.ok) return { ok: true, extensions, message: '' };
  const coreMessage = firstError(core.stderr + core.stdout);
  const optionalCaps = [...WGSL_CORE_CAPS, ...Object.keys(WGSL_OPTIONAL_CAPS)];
  const opt = await run(TOOL.naga, ['--capabilities', optionalCaps.join(','), file]);
  if (opt.ok) {
    // Which optional feature unlocked it? Add them one at a time.
    const needed = [];
    for (const [cap, feature] of Object.entries(WGSL_OPTIONAL_CAPS)) {
      const r = await run(TOOL.naga, ['--capabilities', [...WGSL_CORE_CAPS, cap].join(','), file]);
      if (r.ok) needed.push(feature);
    }
    const names = [...new Set([...extensions, ...needed])];
    return { ok: true, extensions: names.length ? names : ['webgpu-optional-feature'], message: coreMessage };
  }
  // Valid for naga with every capability (wgpu-native) but not for WebGPU.
  const all = await run(TOOL.naga, ['--capabilities', 'all', file]);
  const message = all.ok ? `${coreMessage} (accepted by naga only with non-WebGPU capabilities)` : coreMessage;
  return { ok: false, extensions, message };
}

// ---------------------------------------------------------------- translators

const NA = (message) => ({ status: 'n/a', message });

// Status of one translator's output. `expect` are patterns the output must keep.
function verdict(validation, extensions = [], text = '', expect = []) {
  if (validation.unverified) {
    return { status: 'extension', message: validation.message, extensions, unverified: true };
  }
  if (!validation.ok) return { status: 'invalid', message: validation.message, extensions };
  const missing = expect.filter((re) => !new RegExp(re).test(text));
  if (missing.length) {
    return { status: 'dropped', message: `output compiles but lacks /${missing.join('/, /')}/`, extensions };
  }
  return { status: extensions.length ? 'extension' : 'ok', message: validation.message || '', extensions };
}

async function translateGlsl(translator, spv, dir, stage, es, expect = []) {
  const name = `${es ? 'webgl2' : 'opengl'}.${translator}.${GLSL_STAGE_EXT[stage]}`;
  const out = path.join(dir, name);
  const t =
    translator === 'naga'
      ? await run(TOOL.naga, [spv, out, '--profile', es ? 'es300' : 'core450'])
      : await run(TOOL.spirvCross, [spv, ...(es ? ['--es', '--version', '300'] : ['--no-es', '--version', '450']), '--output', out]);
  if (!t.ok || !existsSync(out)) return { status: 'rejected', message: firstError(t.stderr + t.stdout), extensions: [] };
  const text = await readFile(out, 'utf8');
  const extensions = glslExtensions(text);
  return { ...verdict(await validateGlsl(out, stage), extensions, text, expect), file: path.relative(HERE, out) };
}

async function translateMsl(translator, spv, dir, expect = []) {
  const out = path.join(dir, `metal.${translator}.metal`);
  const t =
    translator === 'naga'
      ? await run(TOOL.naga, [spv, out, '--metal-version', MSL_VERSION.naga])
      : await run(TOOL.spirvCross, [spv, '--msl', '--msl-version', MSL_VERSION.spirvCross, '--output', out]);
  if (!t.ok || !existsSync(out)) return { status: 'rejected', message: firstError(t.stderr + t.stdout), extensions: [] };
  const text = await readFile(out, 'utf8');
  return { ...verdict(await validateMsl(out), [], text, expect), file: path.relative(HERE, out) };
}

async function translateHlsl(translator, spv, dir, stage, expect = []) {
  let firstFailure;
  for (const sm of SHADER_MODELS) {
    const out = path.join(dir, `d3d12.${translator}.sm${sm}.hlsl`);
    const t =
      translator === 'naga'
        ? await run(TOOL.naga, [spv, out, '--shader-model', sm])
        : await run(TOOL.spirvCross, [spv, '--hlsl', '--shader-model', sm, '--output', out]);
    let result;
    if (!t.ok || !existsSync(out)) {
      result = { status: 'rejected', message: firstError(t.stderr + t.stdout), extensions: [] };
    } else {
      const v = await validateHlsl(out, stage, sm);
      const text = await readFile(out, 'utf8');
      result = { ...verdict(v, [], text, expect), entry: v.entry, file: path.relative(HERE, out) };
    }
    if (result.status === 'ok') {
      if (sm !== SHADER_MODELS[0]) result.requires = `SM ${sm[0]}.${sm[1]}`;
      if (firstFailure) result.message = `SM ${SHADER_MODELS[0][0]}.${SHADER_MODELS[0][1]}: ${firstFailure.message}`;
      return result;
    }
    // Keep the best failure: an invalid output beats a rejected translation.
    if (!firstFailure || RANK[result.status] > RANK[firstFailure.status]) firstFailure = result;
    // A translator that cannot ingest the module will not succeed at a higher SM.
    if (translator === 'naga' && result.status === 'rejected' && /Could not parse/i.test(t.stderr)) break;
  }
  return firstFailure;
}

async function translateWgsl(spv, dir, expect = []) {
  const out = path.join(dir, 'webgpu.naga.wgsl');
  const t = await run(TOOL.naga, [spv, out]);
  if (!t.ok || !existsSync(out)) return { status: 'rejected', message: firstError(t.stderr + t.stdout), extensions: [] };
  const v = await validateWgsl(out);
  const text = await readFile(out, 'utf8');
  return { ...verdict(v, v.ok ? v.extensions : [], text, expect), file: path.relative(HERE, out) };
}

// ---------------------------------------------------------------- per shader

async function compileToSpirv(shader, dir) {
  const src = path.join(SHADERS, shader.file);
  const spv = path.join(dir, 'shader.spv');
  const r =
    shader.frontend === 'hlsl'
      ? await run(TOOL.dxc, [
          '-spirv',
          `-fspv-target-env=${TARGET_ENV}`,
          '-T',
          `${STAGE_PROFILE[shader.stage]}_6_6`,
          '-E',
          'main',
          ...shader.dxcArgs,
          src,
          '-Fo',
          spv,
        ])
      : await run(TOOL.glslang, ['-V', '--target-env', TARGET_ENV, '-S', shader.stage, src, '-o', spv]);
  return { ok: r.ok && existsSync(spv), spv, message: r.ok ? '' : firstError(r.stderr + r.stdout) };
}

async function processShader(shader, conceptId) {
  const dir = path.join(OUT, conceptId, shader.file.replace(/\.[^.]+$/, '').replace(/\./g, '-'));
  await mkdir(dir, { recursive: true });
  const compiled = await compileToSpirv(shader, dir);
  const info = { file: shader.file, stage: shader.stage, frontend: shader.frontend };
  if (!compiled.ok) return { ...info, compileError: compiled.message, results: null };

  const { spv } = compiled;
  const val = await run(TOOL.spirvVal, ['--target-env', TARGET_ENV, spv]);
  const dis = await run(TOOL.spirvDis, [spv, '-o', path.join(dir, 'shader.spvasm')]);
  const parsed = parseDisassembly(dis.ok ? await readFile(path.join(dir, 'shader.spvasm'), 'utf8') : '');
  const nonCore = parsed.spirvExtensions.filter((e) => !VULKAN12_CORE_SPV_EXTENSIONS.has(e));

  const results = {};
  results.vulkan = {
    spirvVal: val.ok
      ? { status: nonCore.length ? 'extension' : 'ok', message: '', extensions: nonCore }
      : { status: 'invalid', message: firstError(val.stderr + val.stdout), extensions: nonCore },
    naga: NA('SPIR-V is the native format; validated with spirv-val'),
    spirvCross: NA('SPIR-V is the native format; validated with spirv-val'),
  };

  const ex = shader.expect ?? {};
  const noCompute = NA('WebGL 2 has no compute stage');
  const [wgsl, mslN, mslS, hlslN, hlslS, glN, glS, esN, esS] = await Promise.all([
    translateWgsl(spv, dir, ex.wgsl),
    translateMsl('naga', spv, dir, ex.msl),
    translateMsl('spirvCross', spv, dir, ex.msl),
    translateHlsl('naga', spv, dir, shader.stage, ex.hlsl),
    translateHlsl('spirvCross', spv, dir, shader.stage, ex.hlsl),
    translateGlsl('naga', spv, dir, shader.stage, false, ex.glsl),
    translateGlsl('spirvCross', spv, dir, shader.stage, false, ex.glsl),
    shader.stage === 'comp' ? noCompute : translateGlsl('naga', spv, dir, shader.stage, true, ex.essl),
    shader.stage === 'comp' ? noCompute : translateGlsl('spirvCross', spv, dir, shader.stage, true, ex.essl),
  ]);
  results.webgpu = { naga: wgsl, spirvCross: NA('spirv-cross has no WGSL backend') };
  results.metal = { naga: mslN, spirvCross: mslS };
  results.d3d12 = { naga: hlslN, spirvCross: hlslS };
  results.opengl = { naga: glN, spirvCross: glS };
  results.webgl2 = { naga: esN, spirvCross: esS, stageMissing: shader.stage === 'comp' };

  return { ...info, spirvValid: val.ok, ...parsed, results };
}

// ---------------------------------------------------------------- merge

// Worst result across the shaders of one concept (all of them must work).
function mergeTranslator(list) {
  const applicable = list.filter((r) => r && r.status !== 'n/a');
  if (!applicable.length) return list.find(Boolean) ?? NA('');
  const worst = applicable.reduce((a, b) => (RANK[b.status] < RANK[a.status] ? b : a));
  const merged = {
    status: worst.status,
    message: worst.message ?? '',
    extensions: [...new Set(applicable.flatMap((r) => r.extensions ?? []))],
  };
  const requires = applicable.map((r) => r.requires).filter(Boolean).sort().at(-1);
  if (requires) merged.requires = requires;
  if (applicable.some((r) => r.unverified)) merged.unverified = true;
  const files = applicable.map((r) => r.file).filter(Boolean);
  if (files.length) merged.files = files;
  const entries = [...new Set(applicable.map((r) => r.entry).filter(Boolean))];
  if (entries.length) merged.entry = entries.join(',');
  return merged;
}

// Backend status: the best translator wins.
function backendStatus(byTranslator) {
  const applicable = byTranslator.filter((r) => r.status !== 'n/a');
  if (!applicable.length) return 'n/a';
  return applicable.reduce((a, b) => (RANK[b.status] > RANK[a.status] ? b : a)).status;
}

function buildConcept(concept, shaderResults) {
  const failed = shaderResults.find((s) => !s.results);
  const entry = {
    id: concept.id,
    group: concept.group,
    source: [...new Set(shaderResults.map((s) => s.frontend))].join('+'),
    shaders: shaderResults.map((s) => ({ file: s.file, stage: s.stage, frontend: s.frontend })),
    builtins: [...new Set(shaderResults.flatMap((s) => s.builtins ?? []))],
    capabilities: [...new Set(shaderResults.flatMap((s) => s.capabilities ?? []))],
    spirvExtensions: [...new Set(shaderResults.flatMap((s) => s.spirvExtensions ?? []))],
    executionModes: [...new Set(shaderResults.flatMap((s) => s.executionModes ?? []))],
    results: {},
  };
  if (failed) {
    entry.compileError = `${failed.file}: ${failed.compileError}`;
    for (const b of BACKENDS) entry.results[b.id] = { status: 'rejected', message: entry.compileError };
    return entry;
  }
  for (const b of BACKENDS) {
    const per = shaderResults.map((s) => s.results[b.id]);
    if (b.id === 'vulkan') {
      const spirvVal = mergeTranslator(per.map((p) => p.spirvVal));
      entry.results.vulkan = { status: spirvVal.status, spirvVal, naga: per[0].naga, spirvCross: per[0].spirvCross };
      continue;
    }
    if (b.id === 'webgl2' && per.some((p) => p.stageMissing)) {
      entry.results.webgl2 = {
        status: 'n/a',
        message: 'WebGL 2 has no compute stage',
        naga: NA('WebGL 2 has no compute stage'),
        spirvCross: NA('WebGL 2 has no compute stage'),
      };
      continue;
    }
    const naga = mergeTranslator(per.map((p) => p.naga));
    const spirvCross = mergeTranslator(per.map((p) => p.spirvCross));
    entry.results[b.id] = { status: backendStatus([naga, spirvCross]), naga, spirvCross };
  }
  return entry;
}

// ---------------------------------------------------------------- versions

async function toolVersions() {
  const [dxc, naga, cross, glslang, tools, metal] = await Promise.all([
    run(TOOL.dxc, ['--version']),
    run(TOOL.naga, ['--version']),
    run(TOOL.spirvCross, ['--revision']),
    run(TOOL.glslang, ['--version']),
    run(TOOL.spirvVal, ['--version']),
    run(TOOL.xcrun, ['-sdk', 'macosx', 'metal', '--version']),
  ]);
  return {
    dxc: firstLine(dxc.stdout + dxc.stderr),
    naga: firstLine(naga.stdout),
    'spirv-cross': firstLine(cross.stdout + cross.stderr),
    glslang: firstLine(glslang.stdout),
    'spirv-tools': firstLine(tools.stdout),
    metal: firstLine(metal.stdout + metal.stderr),
  };
}

// ---------------------------------------------------------------- main

async function main() {
  const concepts = ONLY ? CONCEPTS.filter((c) => ONLY.includes(c.id)) : CONCEPTS;
  if (!ONLY) await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });

  const tools = await toolVersions();
  for (const [name, v] of Object.entries(tools)) if (!v) console.warn(`warning: could not read ${name} version`);

  const jobs = concepts.flatMap((c) => c.shaders.map((s) => ({ concept: c, shader: s })));
  let done = 0;
  const shaderResults = await pool(jobs, JOBS, async ({ concept, shader }) => {
    const r = await processShader(shader, concept.id);
    process.stdout.write(`\r${++done}/${jobs.length} ${concept.id}`.padEnd(60));
    return r;
  });
  process.stdout.write('\n');

  const built = concepts.map((c) => buildConcept(c, shaderResults.filter((_, i) => jobs[i].concept === c)));

  let entries = built;
  if (ONLY && existsSync(RESULT)) {
    // Partial run: replace only the selected concepts in the existing table.
    const previous = JSON.parse(await readFile(RESULT, 'utf8'));
    const byId = new Map(built.map((c) => [c.id, c]));
    entries = CONCEPTS.map((c) => byId.get(c.id) ?? previous.concepts.find((p) => p.id === c.id)).filter(Boolean);
  }

  const json = {
    generated: new Date().toISOString(),
    targetEnv: TARGET_ENV,
    mslVersion: MSL_VERSION.std,
    tools,
    backends: BACKENDS,
    statuses: {
      ok: 'At least one translator produced output that the backend compiler accepts without extensions.',
      extension: 'Output only validates with a non-core extension (listed per translator). "unverified": true means the backend compiler does not implement that extension, so the output could not be compiled.',
      dropped: 'Output compiles, but the translator silently removed the concept (checked with the patterns in concepts.mjs).',
      invalid: 'Translation succeeded but no output validates.',
      rejected: 'Every translator failed to translate the shader.',
      'n/a': 'The shader stage does not exist on this backend.',
    },
    concepts: entries,
  };
  await writeFile(RESULT, JSON.stringify(json, null, 2) + '\n');

  printSummary(entries);
  console.log(`\nwrote ${path.relative(process.cwd(), RESULT)}`);
}

function printSummary(entries) {
  const short = { ok: 'ok', extension: 'ext', dropped: 'dropped', invalid: 'INVALID', rejected: 'REJECTED', 'n/a': 'n/a' };
  const w = Math.max(...entries.map((e) => e.id.length)) + 2;
  console.log('\n' + 'concept'.padEnd(w) + BACKENDS.map((b) => b.id.padEnd(10)).join(''));
  for (const e of entries) {
    const cell = (r) => (short[r?.status] ?? '?') + (r?.naga?.unverified || r?.spirvCross?.unverified ? '?' : '');
    console.log(e.id.padEnd(w) + BACKENDS.map((b) => cell(e.results[b.id]).padEnd(10)).join(''));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

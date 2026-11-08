/* Yotsuba Shader playground UI (multi-file).
 *
 * The UI is complete; the compiler attaches through a small backend object:
 *
 *   YotsubaPlayground.setBackend({
 *     name: 'Yotsuba compiler (WebAssembly)',
 *     compile(files, { style })            -> CompileResult            (required)
 *     analyze?(files)                      -> { diagnostics: [...] }   live errors while typing
 *     complete?(files, file, offset)       -> [{ label, kind, sortText?, filterText?, detail? }]
 *     hover?(files, file, offset)          -> { text, start, length } | null
 *     signatureHelp?(files, file, offset)  -> { signatures: [{ label, parameters: [string] }], active, activeSignature } | null
 *   })
 *
 *   files = [{ name: 'Shader.cs', source: '...' }, ...]
 *   CompileResult = { ok, diagnostics: [{ severity: 'error'|'warning'|'info', message, line, column, endLine?, endColumn?,
 *                     id?, file? }], shaders: [{ name, fullName?, entryPoints: [{ name, stage, returnType,
 *                     parameters: [{ name, type, slot? }] }] }], spirv?: { text, base64? }, outputs?: [{ stages: [{ interface: { inputs, outputs } }] }] }
 *
 * A Blazor WebAssembly build is detected automatically when it is published to ./playground-app/ and a demo
 * backend is available with ?demo=1. See Web/playground/README.md.
 */
(() => {
  'use strict';
  const T = window.ysT || ((s, v) => (v ? s.replace(/\{(\w+)\}/g, (_, k) => v[k]) : s));

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement.dataset.root || './';
  const MONACO = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs';
  const STORE = 'ys-pg-project';
  const examples = JSON.parse($('#pg-examples').textContent);
  const el = {
    example: $('#pg-example'), run: $('#pg-run'), share: $('#pg-share'), status: $('#pg-status'), banner: $('#pg-banner'),
    root: $('#pg'), loading: $('#pg-loading'), loadingDetail: $('#pg-loading-detail'), host: $('#pg-editor'),
    files: $('#pg-files'), add: $('#pg-add'), activeFile: $('#pg-active-file'),
    navigator: $('#pg-navigator'), navigatorToggle: $('#pg-navigator-toggle'), inspector: $('#pg-inspector'),
    inspectorToggle: $('#pg-inspector-toggle'), backdrop: $('#pg-backdrop'),
    diagnostics: $('#pg-editor-diagnostics'),
    previewCanvas: $('#pg-preview-canvas'),
    previewMessage: $('#pg-preview-message'), previewDetail: $('#pg-preview-detail'),
    panels: Object.fromEntries($$('[data-panel]').map((p) => [p.dataset.panel, p])),
  };
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const emptyState = (text, title = '') => `<div class="pg-empty">${title ? `<h2>${esc(title)}</h2>` : ''}<p>${text}</p></div>`;
  const setState = (state) => { el.status.dataset.state = state; };
  function setLoading(loading, detail = T('Preparing the compiler…')) {
    el.loading.hidden = !loading;
    el.loading.setAttribute('aria-busy', String(loading));
    el.loadingDetail.textContent = detail;
    if (loading) el.root.setAttribute('aria-busy', 'true');
    else el.root.removeAttribute('aria-busy');
    [...el.root.children].forEach((child) => {
      if (child !== el.loading) child.inert = loading;
    });
  }
  /** Tiny highlighter for SPIR-V assembly: opcodes, %ids, numbers and ; comments. */
  const hl = (text) => esc(text).split('\n').map((line) => {
    if (/^\s*;/.test(line)) return `<span class="hl-c">${line}</span>`;
    return line.replace(/(%[\w.]+)/g, '<span class="hl-id">$1</span>').replace(/\b(Op[A-Za-z]+)\b/g, '<span class="hl-op">$1</span>').replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="hl-n">$1</span>');
  }).join('\n');
  /** Present one complete SPIR-V instruction per numbered row. Long instructions
   * remain intact and use horizontal scrolling, like a conventional disassembler. */
  const spirvAssembly = (text) => String(text).replace(/\r\n?/g, '\n').split('\n').map((raw) => {
    // SpirVModule.ToText() pads result-less instructions so their opcode aligns
    // with the opcode after `%result =`, matching conventional spirv-dis output.
    const line = raw.trimEnd();
    return `<div class="pg-spirv-line"><span class="pg-spirv-line-number" aria-hidden="true"></span><code>${hl(line) || '&nbsp;'}</code></div>`;
  }).join('');
  const clone = (files) => files.map((f) => ({ name: f.name, source: f.source }));

  /* ------------------------------------------------------------- project */
  const project = { files: [], active: '' };
  const current = () => project.files.find((f) => f.name === project.active);
  const save = () => { try { localStorage.setItem(STORE, JSON.stringify(project)); } catch { /* storage unavailable */ } };
  const mobileViewport = matchMedia('(max-width: 760px)');
  const navigatorDrawerViewport = matchMedia('(max-width: 900px)');

  function setNavigator(open) {
    el.root.classList.toggle('pg--navigator-hidden', !open);
    el.navigatorToggle.setAttribute('aria-expanded', String(open));
    const label = open ? T('Hide navigator') : T('Show navigator');
    el.navigatorToggle.title = label;
    $('.sr-only', el.navigatorToggle).textContent = label;
    el.backdrop.hidden = !open || !navigatorDrawerViewport.matches;
  }

  function setInspector(open) {
    el.root.classList.toggle('pg--inspector-hidden', !open);
    el.inspectorToggle.setAttribute('aria-expanded', String(open));
    const label = open ? T('Hide inspector') : T('Show inspector');
    el.inspectorToggle.title = label;
    $('.sr-only', el.inspectorToggle).textContent = label;
  }

  function setMobileView(view) {
    el.root.dataset.mobileView = view;
    $$('[data-mobile-view]').forEach((button) => {
      button.setAttribute('aria-selected', String(button.dataset.mobileView === view));
      button.tabIndex = button.dataset.mobileView === view ? 0 : -1;
    });
  }

  /* ------------------------------------------------------------- backend */
  const api = (window.YotsubaPlayground = window.YotsubaPlayground || {});
  let backend = null;
  api.setBackend = (b) => { backend = b; showBackend(); scheduleAnalyze(0); scheduleLiveCompile(120); };
  api.getBackend = () => backend;

  /** Attach a Blazor WebAssembly app exposing the static [JSInvokable] methods of PlaygroundApi. */
  api.connectBlazor = async ({ base = root + 'playground-app/', assembly = 'Playground' } = {}) => {
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = base + '_framework/blazor.webassembly.js';
      s.setAttribute('autostart', 'false');
      s.onload = resolve; s.onerror = () => reject(new Error('blazor.webassembly.js not found'));
      document.head.appendChild(s);
    });
    await window.Blazor.start({
      loadBootResource: (_type, _name, uri) => new URL(uri.slice(uri.indexOf('_framework/')), new URL(base, location.href)).href,
    });
    const call = async (method, ...args) => {
      const out = await window.DotNet.invokeMethodAsync(assembly, method, ...args);
      return typeof out === 'string' ? JSON.parse(out) : out;
    };
    api.setBackend({
      name: 'Yotsuba compiler (WebAssembly)',
      compile: (files, o) => call('Compile', JSON.stringify(files), o?.style || ''),
      analyze: (files) => call('Analyze', JSON.stringify(files)),
      complete: (files, file, offset) => call('Complete', JSON.stringify(files), file, offset),
      hover: (files, file, offset) => call('Hover', JSON.stringify(files), file, offset),
      signatureHelp: (files, file, offset) => call('SignatureHelp', JSON.stringify(files), file, offset),
    });
  };

  function demoBackend() {
    return {
      name: 'Demo data',
      demo: true,
      async compile(files) {
        await new Promise((r) => setTimeout(r, 250));
        const src = files.map((f) => f.source).join('\n');
        const names = [...src.matchAll(/class\s+(\w+)/g)].map((m) => m[1]);
        const stages = [...src.matchAll(/\[ShaderStage\(Stage\.(\w+)\)\]\s*public\s+([\w<>]+)\s+(\w+)\(([^)]*)\)/g)];
        return {
          ok: true,
          diagnostics: [{ severity: 'info', message: 'Demo output. Connect the compiler to see real results.', line: 1, column: 1 }],
          shaders: [{ name: names[names.length - 1] || 'Shader', entryPoints: stages.map((m) => ({ name: m[3], stage: m[1], returnType: m[2], parameters: [] })) }],
          spirv: { text: '; demo: SPIR-V text appears here\nOpCapability Shader\nOpMemoryModel Logical GLSL450' },
          outputs: [{ name: names[names.length - 1] || 'Shader', stages: stages.map((m) => ({ name: m[3], stage: m[1], hlsl: '// HLSL output', glsl: '#version 450\n// GLSL output', glslEs: '#version 300 es\n// GLSL ES output', msl: '// MSL output', cpp: '// C++ output' })) }],
        };
      },
    };
  }

  function showBackend() {
    if (backend) setLoading(false);
    el.banner.hidden = !!backend && !backend.demo;
    if (!backend) {
      el.banner.textContent = T('The compiler could not be loaded. Check your connection and reload the page.');
      el.banner.hidden = false;
    } else if (backend.demo) {
      el.banner.textContent = T('Demo data: these results are placeholders, not the output of the compiler.');
      el.banner.hidden = false;
    }
    el.status.textContent = backend ? backend.name : T('Compiler unavailable');
    setState(backend && !backend.demo ? 'ok' : 'off');
  }

  /* -------------------------------------------------------- WebGL preview */
  const livePreview = {
    gl: null,
    program: null,
    vao: null,
    buffers: [],
    textures: [],
    uniforms: [],
    raf: 0,
    startedAt: performance.now(),
    frame: 0,
  };

  function setPreviewState(detail, message = '') {
    el.previewDetail.textContent = detail;
    el.previewMessage.textContent = message;
    el.previewMessage.hidden = !message;
  }

  function disposePreviewProgram() {
    const gl = livePreview.gl;
    cancelAnimationFrame(livePreview.raf);
    livePreview.raf = 0;
    if (!gl) return;
    livePreview.buffers.forEach((buffer) => gl.deleteBuffer(buffer));
    livePreview.textures.forEach((texture) => gl.deleteTexture(texture));
    if (livePreview.vao) gl.deleteVertexArray(livePreview.vao);
    if (livePreview.program) gl.deleteProgram(livePreview.program);
    livePreview.program = null;
    livePreview.vao = null;
    livePreview.buffers = [];
    livePreview.textures = [];
    livePreview.uniforms = [];
  }

  function ensurePreviewContext() {
    if (livePreview.gl) return livePreview.gl;
    const gl = el.previewCanvas.getContext('webgl2', { antialias: true, alpha: false, depth: true });
    if (!gl) {
      setPreviewState(T('This browser cannot create a WebGL2 context.'), T('Open the playground in a browser with WebGL2 enabled.'));
      return null;
    }
    livePreview.gl = gl;
    new ResizeObserver(() => drawPreviewFrame(performance.now(), false)).observe(el.previewCanvas);
    return gl;
  }

  function compilePreviewShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const stage = type === gl.VERTEX_SHADER ? T('Vertex') : T('Fragment');
      const log = gl.getShaderInfoLog(shader) || T('Unknown WebGL shader error');
      gl.deleteShader(shader);
      throw new Error(`${stage}: ${log.trim()}`);
    }
    return shader;
  }

  function linkPreviewProgram(gl, vertexSource, fragmentSource) {
    let vertex = null;
    let fragment = null;
    let program = null;
    try {
      vertex = compilePreviewShader(gl, gl.VERTEX_SHADER, vertexSource);
      fragment = compilePreviewShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
      program = gl.createProgram();
      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error((gl.getProgramInfoLog(program) || T('Unknown WebGL program error')).trim());
      return program;
    } catch (error) {
      if (program) gl.deleteProgram(program);
      throw error;
    } finally {
      if (vertex) gl.deleteShader(vertex);
      if (fragment) gl.deleteShader(fragment);
    }
  }

  function splitArguments(value) {
    const result = [];
    let start = 0;
    let depth = 0;
    for (let index = 0; index < value.length; index++) {
      const character = value[index];
      if ('([{'.includes(character)) depth++;
      else if (')]}'.includes(character)) depth--;
      else if (character === ',' && depth === 0) {
        result.push(value.slice(start, index).trim());
        start = index + 1;
      }
    }
    result.push(value.slice(start).trim());
    return result;
  }

  function sourceInterface() {
    const source = project.files.map((file) => file.source).join('\n');
    const vertex = /\[ShaderStage\s*\(\s*Stage\.Vertex\s*\)\][\s\S]*?public\s+([\w.]+)\s+\w+\s*\(/.exec(source);
    const fragment = /\[ShaderStage\s*\(\s*Stage\.Fragment\s*\)\][\s\S]*?public\s+[\w.]+\s+\w+\s*\(\s*([\w.]+)\s+(\w+)/.exec(source);
    const structName = vertex?.[1]?.split('.').pop();
    if (!structName) return null;
    const escapedName = structName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const body = new RegExp(`struct\\s+${escapedName}\\s*\\{([\\s\\S]*?)\\n\\}`, 'm').exec(source)?.[1];
    if (!body) return null;
    const fields = [];
    const fieldPattern = /((?:\s*\[[^\]]+\]\s*)*)public\s+([\w.]+)\s+(\w+)\s*;/g;
    for (const match of body.matchAll(fieldPattern)) {
      fields.push({ name: match[3], type: match[2].split('.').pop(), position: /(?:SV_Position|BuiltIn_Position|gl_Position|\bposition\b)/i.test(`${match[1]} ${match[3]}`) });
    }
    return { fields, fragmentParameter: fragment?.[2] || 'fragment' };
  }

  function glslType(type) {
    return ({ Vector2: 'vec2', Vector3: 'vec3', Vector4: 'vec4', Float2: 'vec2', Float3: 'vec3', Float4: 'vec4', float: 'float' })[type] || 'vec4';
  }

  function insertShaderDeclarations(source, declarations) {
    const newline = source.indexOf('\n');
    return newline < 0 ? `${source}\n${declarations}\n` : `${source.slice(0, newline + 1)}${declarations}\n${source.slice(newline + 1)}`;
  }

  function interfacePosition(item) {
    return String(item?.builtIn || '').toLowerCase() === 'position';
  }

  function interfaceName(item, index) {
    const name = String(item?.name || `varying${index}`).replace(/[^A-Za-z0-9_]/g, '_');
    return `_pg_${name || `varying${index}`}`;
  }

  function sameInterfaceSlot(left, right) {
    if (left?.location == null || right?.location == null) return false;
    return Number(left.location) === Number(right.location);
  }

  function extractReturnAssignment(source) {
    const match = /(^|\n)\s*_return\s*=\s*([^;]+);/.exec(source);
    if (!match) return null;
    const expression = match[2].trim();
    const constructor = /^[A-Za-z_]\w*\s*\((.*)\)$/.exec(expression);
    return {
      text: match[0].trim(),
      expression,
      isConstructor: Boolean(constructor),
      arguments: constructor ? splitArguments(constructor[1]) : [expression],
    };
  }

  function removeInterfaceBlocks(source, qualifier, items) {
    const memberNames = new Set(items.map((item) => String(item?.name || '')).filter(Boolean));
    if (!memberNames.size) return source;
    const block = new RegExp(`\\b${qualifier}\\s+[A-Za-z_]\\w*\\s*\\{([\\s\\S]*?)\\}\\s*[A-Za-z_]\\w*\\s*;`, 'g');
    return source.replace(block, (declaration, body) => {
      const containsReflectedMember = [...memberNames].some((name) =>
        new RegExp(`\\b${name.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\b`).test(body));
      return containsReflectedMember ? '' : declaration;
    });
  }

  function flatInterfaceVariables(source, qualifier) {
    const declaration = new RegExp(
      `(?:layout\\s*\\([^)]*\\)\\s*)?\\b${qualifier}\\s+` +
      `(?:(?:highp|mediump|lowp)\\s+)?([A-Za-z_]\\w*)\\s+([A-Za-z_]\\w*)\\s*;`,
      'g');
    return [...source.matchAll(declaration)].map((match) => ({ type: match[1], name: match[2] }));
  }

  function reflectedVariable(variables, item, index) {
    const member = String(item?.name || '');
    const exact = variables.find((variable) =>
      variable.name === member || variable.name.endsWith(`_${member}`));
    return exact || variables[index] || null;
  }

  function renameShaderIdentifier(source, currentName, nextName) {
    if (!currentName || currentName === nextName) return source;
    const escaped = currentName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return source.replace(new RegExp(`\\b${escaped}\\b`, 'g'), nextName);
  }

  function adaptFlatReflectedSources(vertexSource, fragmentSource, varyings) {
    const vertexVariables = flatInterfaceVariables(vertexSource, 'out');
    const fragmentVariables = flatInterfaceVariables(fragmentSource, 'in');
    if (!vertexVariables.length || !fragmentVariables.length) return null;

    let vertex = vertexSource;
    let fragment = fragmentSource;
    let renamed = false;
    varyings.forEach((varying, index) => {
      const vertexVariable = reflectedVariable(vertexVariables, varying.output, index);
      const fragmentVariable = reflectedVariable(fragmentVariables, varying.input, index);
      if (!vertexVariable || !fragmentVariable) return;
      vertex = renameShaderIdentifier(vertex, vertexVariable.name, varying.name);
      fragment = renameShaderIdentifier(fragment, fragmentVariable.name, varying.name);
      renamed = true;
    });

    return renamed ? { vertex, fragment, geometryFallback: false } : null;
  }

  function adaptReflectedSourcesForWebgl(vertexSource, fragmentSource, vertexInterface, fragmentInterface) {
    const outputs = (vertexInterface?.outputs || []).filter((item) => item?.builtIn || item?.location != null);
    const inputs = (fragmentInterface?.inputs || []).filter((item) => item?.builtIn || item?.location != null);
    if (!outputs.length) return null;

    const position = outputs.find(interfacePosition);
    const varyingOutputs = outputs.filter((item) => !interfacePosition(item));
    const varyings = varyingOutputs
      .map((output, index) => ({
        output,
        input: inputs.find((candidate) => sameInterfaceSlot(output, candidate)),
        name: interfaceName(output, index),
      }))
      .filter((item) => item.input);

    // SPIRV-Cross often emits interface members as flat variables such as
    // `_return_Color` and `fragment_Color`. WebGL links by variable name, so
    // normalize both stages to the same location-derived reflected name.
    const flatSources = adaptFlatReflectedSources(
      vertexSource,
      fragmentSource,
      varyings);
    if (flatSources) return flatSources;

    const assignment = extractReturnAssignment(vertexSource);
    if (!assignment) return null;

    const outputArguments = assignment.arguments;
    const returnOutputs = outputs.filter((item) => item.isReturnValue !== false);
    const argumentFor = (item) => {
      if (item?.isReturnValue === false) return null;
      const index = returnOutputs.indexOf(item);
      if (index < 0) return null;
      if (assignment.isConstructor) return outputArguments[index] || null;
      const expression = assignment.expression;
      const member = String(item?.name || '');
      return member && member !== '__return' && member !== '_return'
        ? `${expression}.${member}`
        : expression;
    };

    const positionArgument = position ? argumentFor(position) : null;
    const hasPositionWrite = /\bgl_Position\s*=/.test(vertexSource);
    const replacement = [];
    if (positionArgument && !hasPositionWrite) replacement.push(`gl_Position = ${positionArgument};`);
    else if (!hasPositionWrite) return null;

    for (const varying of varyings) {
      const value = argumentFor(varying.output);
      if (value) replacement.push(`${varying.name} = ${value};`);
    }

    if (!replacement.length) return null;

    let vertex = vertexSource.replace(assignment.text, replacement.join('\n    '));
    let fragment = fragmentSource;
    const vertexByLocation = new Map(varyings.map((varying) => [varying.output.location, varying.name]));
    for (const input of inputs) {
      const name = vertexByLocation.get(input.location);
      if (!name) continue;
      const escaped = String(input.name || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (!escaped) continue;
      fragment = fragment.replace(new RegExp(`\\b[A-Za-z_]\\w*\\.${escaped}\\b`, 'g'), name);
    }

    // WebGL/ANGLE can flatten interface blocks using their instance names,
    // making otherwise compatible blocks link as different varyings. Once the
    // reflected members use canonical location-based names, remove the old
    // blocks so only the canonical varyings participate in linking.
    vertex = removeInterfaceBlocks(vertex, 'out', varyingOutputs);
    fragment = removeInterfaceBlocks(fragment, 'in', inputs);

    const vertexDeclarations = varyings
      .map((varying) => `out highp ${glslType(varying.output.type)} ${varying.name};`)
      .join('\n');
    const fragmentDeclarations = varyings
      .map((varying) => `in highp ${glslType(varying.output.type)} ${varying.name};`)
      .join('\n');

    if (vertexDeclarations) vertex = insertShaderDeclarations(vertex, vertexDeclarations);
    if (fragmentDeclarations) fragment = insertShaderDeclarations(fragment, fragmentDeclarations);
    fragment = fragment.replace(/\.X\b/g, '.x').replace(/\.Y\b/g, '.y').replace(/\.Z\b/g, '.z').replace(/\.W\b/g, '.w');
    return { vertex, fragment, geometryFallback: false };
  }

  function adaptSourcesForWebgl(vertexSource, fragmentSource, vertexInterface, fragmentInterface) {
    if (vertexInterface?.outputs?.length || fragmentInterface?.inputs?.length) {
      return adaptReflectedSourcesForWebgl(vertexSource, fragmentSource, vertexInterface, fragmentInterface);
    }

    const descriptor = sourceInterface();
    if (!descriptor?.fields.length) return null;
    const assignment = /_return\s*=\s*[A-Za-z_]\w*\(([^;]*)\);/.exec(vertexSource);
    if (!assignment) return null;
    const argumentsList = splitArguments(assignment[1]);
    if (argumentsList.length < descriptor.fields.length) return null;
    const positionIndex = Math.max(0, descriptor.fields.findIndex((field) => field.position));
    const varyings = descriptor.fields.map((field, index) => ({ ...field, index, location: index < positionIndex ? index : index - 1 })).filter((field) => !field.position);
    const vertexDeclarations = varyings.map((field) => `out highp ${glslType(field.type)} _pg_${field.name};`).join('\n');
    const fragmentDeclarations = varyings.map((field) => `in highp ${glslType(field.type)} _pg_${field.name};`).join('\n');
    const positionAssignment = `gl_Position = ${argumentsList[positionIndex]};`;
    const replacement = [positionAssignment, ...varyings.map((field) => `_pg_${field.name} = ${argumentsList[field.index]};`)].join('\n    ');
    let vertex = vertexSource.replace(assignment[0], replacement);
    let fragment = fragmentSource;
    for (const field of varyings) {
      const reference = new RegExp(`\\b${descriptor.fragmentParameter}\\.${field.name}\\b`, 'g');
      fragment = fragment.replace(reference, `_pg_${field.name}`);
    }
    fragment = fragment.replace(/\.X\b/g, '.x').replace(/\.Y\b/g, '.y').replace(/\.Z\b/g, '.z').replace(/\.W\b/g, '.w');
    if (vertexDeclarations) vertex = insertShaderDeclarations(vertex, vertexDeclarations);
    if (fragmentDeclarations) fragment = insertShaderDeclarations(fragment, fragmentDeclarations);
    return { vertex, fragment, geometryFallback: false };
  }

  function attributeValues(name, components) {
    const lower = name.toLowerCase();
    const position = [[-.78, -.68, 0, 1], [.0, .78, 0, 1], [.78, -.68, 0, 1]];
    const color = [[1, .25, .48, 1], [.27, .83, .78, 1], [.53, .42, 1, 1]];
    const uv = [[0, 0, 0, 1], [.5, 1, 0, 1], [1, 0, 0, 1]];
    const source = lower.includes('position') ? position : lower.includes('color') ? color : lower.includes('uv') || lower.includes('texcoord') ? uv : [[0, 0, 0, 1], [0, 0, 0, 1], [0, 0, 0, 1]];
    return new Float32Array(source.flatMap((value) => value.slice(0, components)));
  }

  function preparePreviewInputs(gl, program) {
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    livePreview.vao = vao;
    const componentCount = new Map([[gl.FLOAT, 1], [gl.FLOAT_VEC2, 2], [gl.FLOAT_VEC3, 3], [gl.FLOAT_VEC4, 4]]);
    const attributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    for (let index = 0; index < attributes; index++) {
      const info = gl.getActiveAttrib(program, index);
      const components = componentCount.get(info.type);
      const location = gl.getAttribLocation(program, info.name);
      if (!components || location < 0) continue;
      const buffer = gl.createBuffer();
      livePreview.buffers.push(buffer);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, attributeValues(info.name, components), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, components, gl.FLOAT, false, 0, 0);
    }

    const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let index = 0; index < uniformCount; index++) {
      const info = gl.getActiveUniform(program, index);
      livePreview.uniforms.push({ info, location: gl.getUniformLocation(program, info.name) });
    }
    gl.bindVertexArray(null);
  }

  function setPreviewUniforms(gl, elapsed) {
    let textureUnit = 0;
    for (const { info, location } of livePreview.uniforms) {
      if (location === null) continue;
      const name = info.name.toLowerCase();
      if (info.type === gl.FLOAT && (name.includes('time') || name.includes('itime'))) gl.uniform1f(location, elapsed);
      else if (info.type === gl.INT && name.includes('frame')) gl.uniform1i(location, livePreview.frame);
      else if (info.type === gl.FLOAT_VEC2 && name.includes('resolution')) gl.uniform2f(location, el.previewCanvas.width, el.previewCanvas.height);
      else if (info.type === gl.FLOAT_VEC3 && name.includes('resolution')) gl.uniform3f(location, el.previewCanvas.width, el.previewCanvas.height, 1);
      else if (info.type === gl.FLOAT_MAT4) gl.uniformMatrix4fv(location, false, new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]));
      else if (info.type === gl.SAMPLER_2D && livePreview.frame === 0) {
        const texture = gl.createTexture();
        livePreview.textures.push(texture);
        gl.activeTexture(gl.TEXTURE0 + textureUnit);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([244, 92, 157, 255]));
        gl.uniform1i(location, textureUnit++);
      }
    }
  }

  function drawPreviewFrame(now, animate = true) {
    const gl = livePreview.gl;
    if (!gl || !livePreview.program) return;
    const rect = el.previewCanvas.getBoundingClientRect();
    const scale = Math.min(devicePixelRatio || 1, 2);
    const cssWidth = rect.width || el.previewCanvas.clientWidth || 320;
    const cssHeight = rect.height || el.previewCanvas.clientHeight || 185;
    const width = Math.max(1, Math.round(cssWidth * scale));
    const height = Math.max(1, Math.round(cssHeight * scale));
    if (el.previewCanvas.width !== width || el.previewCanvas.height !== height) {
      el.previewCanvas.width = width;
      el.previewCanvas.height = height;
    }
    gl.viewport(0, 0, width, height);
    gl.clearColor(.035, .025, .065, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(livePreview.program);
    gl.bindVertexArray(livePreview.vao);
    setPreviewUniforms(gl, (now - livePreview.startedAt) / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
    livePreview.frame++;
    if (animate) livePreview.raf = requestAnimationFrame((time) => drawPreviewFrame(time));
  }

  function previewPair(outputs) {
    for (const shader of outputs || []) {
      const stages = shader.stages || [];
      const vertex = stages.find((stage) => String(stage.stage).toLowerCase() === 'vertex' && stage.glslEs);
      const fragment = stages.find((stage) => String(stage.stage).toLowerCase() === 'fragment' && stage.glslEs);
      if (vertex && fragment) return { shader, vertex, fragment };
    }
    return null;
  }

  function updateLivePreview(outputs) {
    const pair = previewPair(outputs);
    if (!pair) {
      disposePreviewProgram();
      setPreviewState(T('The preview needs one vertex and one fragment entry point.'), T('Add compatible vertex and fragment entry points to start the preview.'));
      return;
    }
    const gl = ensurePreviewContext();
    if (!gl) return;
    try {
      let program;
      let adapted = false;
      let geometryFallback = false;
      try {
        program = linkPreviewProgram(gl, pair.vertex.glslEs, pair.fragment.glslEs);
      } catch (originalError) {
        const sources = adaptSourcesForWebgl(
          pair.vertex.glslEs,
          pair.fragment.glslEs,
          pair.vertex.interface,
          pair.fragment.interface);
        if (!sources) throw originalError;
        program = linkPreviewProgram(gl, sources.vertex, sources.fragment);
        adapted = true;
        geometryFallback = sources.geometryFallback;
      }
      disposePreviewProgram();
      livePreview.program = program;
      livePreview.startedAt = performance.now();
      livePreview.frame = 0;
      preparePreviewInputs(gl, program);
      const previewNotes = [
        adapted ? T('WebGL interface adapter') : '',
        geometryFallback ? T('Preview geometry') : '',
      ].filter(Boolean);
      setPreviewState(`${pair.shader.fullName || pair.shader.name} · ${pair.vertex.name} + ${pair.fragment.name}${previewNotes.length ? ` · ${previewNotes.join(' · ')}` : ''}`);
      drawPreviewFrame(performance.now());
    } catch (error) {
      const message = String(error?.message || error).replace(/^ERROR:\s*/i, '');
      setPreviewState(T('The last valid frame remains visible.'), message);
    }
  }

  /* ------------------------------------------------------------- editors */
  // Both editors implement: show(name), add(name, src), remove(name), rename(old, new), set(name, src),
  // markers({ [file]: diag[] }), reveal(name, line), onChange(fn(name, source)).
  function textareaEditor(files) {
    const ta = document.createElement('textarea');
    ta.className = 'pg-textarea'; ta.spellcheck = false; ta.setAttribute('aria-label', T('Shader source'));
    el.host.replaceChildren(ta);
    const data = new Map(files.map((f) => [f.name, f.source]));
    let active = '';
    let listener = () => {};
    ta.addEventListener('input', () => { data.set(active, ta.value); listener(active, ta.value); });
    ta.addEventListener('keydown', (e) => { if (e.key === 'Tab') { e.preventDefault(); ta.setRangeText('    ', ta.selectionStart, ta.selectionEnd, 'end'); ta.dispatchEvent(new Event('input')); } });
    return {
      show(name) { active = name; ta.value = data.get(name) ?? ''; },
      add(name, src) { data.set(name, src); }, remove(name) { data.delete(name); },
      rename(a, b) { data.set(b, data.get(a)); data.delete(a); if (active === a) active = b; },
      set(name, src) { data.set(name, src); if (active === name) ta.value = src; },
      markers() {},
      reveal(name, line) { this.show(name); const L = ta.value.split('\n'); ta.focus(); ta.setSelectionRange(L.slice(0, line - 1).join('\n').length, L.slice(0, line).join('\n').length); },
      onChange(fn) { listener = fn; },
    };
  }

  function loadMonaco(files) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = MONACO + '/loader.js';
      s.onerror = () => reject(new Error('Monaco unavailable'));
      s.onload = () => {
        window.require.config({ paths: { vs: MONACO } });
        window.require(['vs/editor/editor.main'], () => resolve(monacoEditor(window.monaco, files)));
      };
      document.head.appendChild(s);
    });
  }

  async function monacoEditor(m, files) {
    // Extend Monaco's C# lexer; retain its string, comment and keyword handling.
    // These lexical colors do not imply Roslyn semantic classification.
    const csharp = m.languages.getLanguages().find((language) => language.id === 'csharp');
    if (csharp?.loader) {
      const { language } = await csharp.loader();
      const identifier = {
        cases: {
          '@keywords': 'keyword.$0',
          '@shaderAttributes': 'annotation',
          '[A-Z]\\w*': 'type.identifier',
          '@default': 'identifier',
        },
      };
      const method = [/\@?[a-zA-Z_]\w*(?=\s*\()/, {
        cases: {
          '@keywords': 'keyword.$0',
          '@shaderAttributes': 'annotation',
          '@shaderTypes': 'type.identifier',
          '@default': 'method',
        },
      }];
      const contextual = [
        [/(\[)(\s*)([A-Za-z_]\w*)(?=\s*[\](,])/, ['delimiter.square', '', 'annotation']],
        [/\b(Stage|RegisterPrefix)(\.)([A-Za-z_]\w*)/, ['type.identifier', 'delimiter', 'enum.member']],
        [/([A-Z]\w*(?:<[^>\n]+>)?|float|double|int|uint|bool)(\s+)([A-Za-z_]\w*)(?=\s*[;={])/, ['type.identifier', '', 'field']],
        [/(\.)([A-Za-z_]\w*)(?=\s*\()/, ['delimiter', 'method']],
        [/(\.)([A-Za-z_]\w*)/, ['delimiter', 'field']],
      ];
      const colorIdentifiers = (rules) => [...contextual, method, ...rules.map((rule) => {
        if (Array.isArray(rule) && rule[1]?.cases?.['@default'] &&
            (rule[1].cases['@default'] === 'identifier' || rule[1].cases['@default'].token === 'identifier')) {
          return [rule[0], { cases: { ...rule[1].cases,
            '@default': { ...identifier, ...(rule[1].cases['@default'].next ? { next: rule[1].cases['@default'].next } : {}) },
          } }];
        }
        return rule;
      })];
      m.languages.setMonarchTokensProvider('csharp', {
        ...language,
        shaderTypes: [...new Set([...examples.flatMap(e => e.files), ...files].flatMap(f =>
          [...f.source.matchAll(/\b(?:class|struct|enum)\s+(\w+)/g)].map(match => match[1])))],
        shaderAttributes: ['ShaderStage', 'SV_Target', 'TEXCOORD', 'COLOR', 'POSITION', 'NORMAL',
          'register', 'cbuffer', 'numthreads', 'packoffset', 'VectorComponent'],
        tokenizer: { ...language.tokenizer,
          root: colorIdentifiers(language.tokenizer.root),
          qualified: colorIdentifiers(language.tokenizer.qualified),
        },
      });
    }
    const models = new Map();
    let listener = () => {};
    const uri = (name) => m.Uri.parse(`file:///${encodeURIComponent(name)}`);
    const make = (name, src) => {
      const model = m.editor.createModel(src, 'csharp', uri(name));
      model.onDidChangeContent(() => listener(nameOf(model), model.getValue()));
      models.set(name, model);
      return model;
    };
    const nameOf = (model) => [...models].find(([, v]) => v === model)?.[0];
    files.forEach((f) => make(f.name, f.source));
    m.editor.defineTheme('yotsuba', {
      base: 'vs-dark', inherit: true,
      rules: [
        { token: 'keyword', foreground: '569CD6' }, { token: 'keyword.cs', foreground: '569CD6' },
        ...['return', 'if', 'else', 'for', 'foreach', 'while', 'do', 'switch', 'case',
          'break', 'continue', 'throw', 'try', 'catch', 'finally', 'yield'].map(word =>
          ({ token: `keyword.${word}`, foreground: 'C586C0' })),
        { token: 'type.identifier', foreground: '4EC9B0' }, { token: 'type', foreground: '4EC9B0' },
        { token: 'annotation', foreground: '4EC9B0' },
        { token: 'method', foreground: 'DCDCAA' },
        { token: 'identifier', foreground: '9CDCFE' }, { token: 'field', foreground: 'DCDCDC' },
        { token: 'enum.member', foreground: 'B8D7A3' },
        { token: 'string', foreground: 'CE9178' }, { token: 'string.escape', foreground: 'D7BA7D' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'comment', foreground: '6A9955' },
        ...['delimiter', 'delimiter.square', 'delimiter.curly', 'delimiter.parenthesis',
          'delimiter.angle'].map(token => ({ token, foreground: 'D4D4D4' })),
      ],
      colors: {
        'editor.background': '#101012', 'editor.foreground': '#D4D4D4', 'editor.lineHighlightBackground': '#1c1c1e',
        'editor.selectionBackground': '#fa679f42', 'editor.inactiveSelectionBackground': '#fa679f24', 'editorCursor.foreground': '#FA679F',
        'editorLineNumber.foreground': '#5c5c60', 'editorLineNumber.activeForeground': '#a1a1a6', 'editorIndentGuide.background1': '#242426',
        'editorIndentGuide.activeBackground1': '#3a3a3c', 'editorWidget.background': '#1c1c1e', 'editorWidget.border': '#333336',
        'editorSuggestWidget.background': '#1c1c1e', 'editorSuggestWidget.border': '#333336', 'editorSuggestWidget.selectedBackground': '#2c2c2e',
        'editorSuggestWidget.highlightForeground': '#FA679F', 'editorHoverWidget.background': '#1c1c1e', 'editorHoverWidget.border': '#333336',
        'editorBracketMatch.background': '#fa679f26', 'editorBracketMatch.border': '#fa679f99', 'scrollbarSlider.background': '#48484a66',
        'scrollbarSlider.hoverBackground': '#63636699', 'editorGutter.background': '#101012',
      },
    });
    const ed = m.editor.create(el.host, {
      model: null, theme: 'yotsuba', automaticLayout: true, fontSize: 14, fontFamily: '"JetBrains Mono", SFMono-Regular, Menlo, monospace',
      minimap: { enabled: false }, bracketPairColorization: { enabled: false }, scrollBeyondLastLine: false, padding: { top: 14 }, tabSize: 4, ariaLabel: T('Shader source'),
      quickSuggestions: { other: true, comments: false, strings: false }, fixedOverflowWidgets: true,
    });
    ed.addCommand(m.KeyMod.CtrlCmd | m.KeyCode.Enter, () => run());

    const kinds = {
      Class: m.languages.CompletionItemKind.Class, Struct: m.languages.CompletionItemKind.Struct, Interface: m.languages.CompletionItemKind.Interface,
      Enum: m.languages.CompletionItemKind.Enum, EnumMember: m.languages.CompletionItemKind.EnumMember, Method: m.languages.CompletionItemKind.Method,
      ExtensionMethod: m.languages.CompletionItemKind.Method, Property: m.languages.CompletionItemKind.Property, Field: m.languages.CompletionItemKind.Field,
      Event: m.languages.CompletionItemKind.Event, Constant: m.languages.CompletionItemKind.Constant, Keyword: m.languages.CompletionItemKind.Keyword,
      Namespace: m.languages.CompletionItemKind.Module, Local: m.languages.CompletionItemKind.Variable, Parameter: m.languages.CompletionItemKind.Variable,
      Delegate: m.languages.CompletionItemKind.Function, Snippet: m.languages.CompletionItemKind.Snippet, TypeParameter: m.languages.CompletionItemKind.TypeParameter,
    };

    m.languages.registerCompletionItemProvider('csharp', {
      triggerCharacters: ['.', ' ', '(', '[', '<'],
      async provideCompletionItems(model, position) {
        const name = nameOf(model);
        if (!backend || !backend.complete || !name) return { suggestions: [] };
        let items;
        try { items = await backend.complete(clone(project.files), name, model.getOffsetAt(position)); } catch { return { suggestions: [] }; }
        const word = model.getWordUntilPosition(position);
        const range = { startLineNumber: position.lineNumber, endLineNumber: position.lineNumber, startColumn: word.startColumn, endColumn: word.endColumn };
        return {
          suggestions: (items || []).map((i) => ({
            label: i.label, kind: kinds[i.kind] ?? m.languages.CompletionItemKind.Text, insertText: i.label, range,
            sortText: i.sortText || i.label, filterText: i.filterText || i.label, detail: i.detail || undefined,
          })),
        };
      },
    });

    m.languages.registerHoverProvider('csharp', {
      async provideHover(model, position) {
        const name = nameOf(model);
        if (!backend || !backend.hover || !name) return null;
        let info;
        try { info = await backend.hover(clone(project.files), name, model.getOffsetAt(position)); } catch { return null; }
        if (!info || !info.text) return null;
        const [head, ...rest] = info.text.split('\n\n');
        const a = model.getPositionAt(info.start), b = model.getPositionAt(info.start + info.length);
        return {
          range: new m.Range(a.lineNumber, a.column, b.lineNumber, b.column),
          contents: [{ value: '```csharp\n' + head + '\n```' }, ...rest.map((t) => ({ value: t }))],
        };
      },
    });

    m.languages.registerSignatureHelpProvider('csharp', {
      signatureHelpTriggerCharacters: ['(', ','],
      async provideSignatureHelp(model, position) {
        const name = nameOf(model);
        if (!backend || !backend.signatureHelp || !name) return null;
        let info;
        try { info = await backend.signatureHelp(clone(project.files), name, model.getOffsetAt(position)); } catch { return null; }
        if (!info || !info.signatures) return null;
        return {
          value: {
            signatures: info.signatures.map((s) => ({ label: s.label, parameters: s.parameters.map((p) => ({ label: p })) })),
            activeSignature: info.activeSignature || 0, activeParameter: info.active || 0,
          },
          dispose() {},
        };
      },
    });

    return {
      show(name) { ed.setModel(models.get(name)); },
      add(name, src) { make(name, src); },
      remove(name) { const x = models.get(name); if (x) { m.editor.setModelMarkers(x, 'yotsuba', []); x.dispose(); } models.delete(name); },
      rename(a, b) { const src = models.get(a).getValue(); const wasActive = ed.getModel() === models.get(a); m.editor.setModelMarkers(models.get(a), 'yotsuba', []); models.get(a).dispose(); models.delete(a); make(b, src); if (wasActive) this.show(b); },
      set(name, src) { models.get(name)?.setValue(src); },
      markers(byFile) {
        models.forEach((model, name) => {
          m.editor.setModelMarkers(model, 'yotsuba', (byFile[name] || []).map((d) => ({
            severity: { error: m.MarkerSeverity.Error, warning: m.MarkerSeverity.Warning }[d.severity] || m.MarkerSeverity.Info,
            message: (d.id ? `${d.id}: ` : '') + d.message, startLineNumber: d.line || 1, startColumn: d.column || 1,
            endLineNumber: d.endLine || d.line || 1, endColumn: d.endColumn || (d.column || 1) + 1,
          })));
        });
      },
      reveal(name, line) { this.show(name); ed.revealLineInCenter(line); ed.setPosition({ lineNumber: line, column: 1 }); ed.focus(); },
      onChange(fn) { listener = fn; },
    };
  }

  let editor = null;

  /* ---------------------------------------------------------- file tabs */
  function renderFiles() {
    el.files.replaceChildren(...project.files.map((f) => {
      const tab = document.createElement('div');
      tab.className = 'pg-file'; tab.setAttribute('role', 'tab'); tab.tabIndex = f.name === project.active ? 0 : -1;
      tab.id = 'pg-file-' + project.files.indexOf(f);
      tab.setAttribute('aria-controls', 'pg-editor');
      if (f.name === project.active) el.host.setAttribute('aria-labelledby', tab.id);
      tab.setAttribute('aria-selected', String(f.name === project.active));
      tab.dataset.name = f.name;
      const dot = document.createElement('span'); dot.className = 'pg-file-symbol'; dot.setAttribute('aria-hidden', 'true');
      dot.innerHTML = '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor"><path d="M9.5 1.5h-6v13h9V5Zm0 0V5h3"/></svg>';
      const label = document.createElement('span'); label.textContent = f.name;
      tab.append(dot, label);
      if (project.files.length > 1) {
        const x = document.createElement('button');
        x.type = 'button'; x.className = 'pg-file-x'; x.setAttribute('aria-label', T('Delete {name}', { name: f.name })); x.dataset.del = f.name;
        x.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>';
        tab.append(x);
      }
      return tab;
    }));
  }

  function openFile(name) {
    project.active = name;
    el.activeFile.textContent = name;
    editor.show(name);
    renderFiles();
    save();
    if (navigatorDrawerViewport.matches) setNavigator(false);
  }

  function validName(raw, except) {
    let name = raw.trim().replace(/[\\/:*?"<>|]/g, '');
    if (!name) return null;
    if (!/\.cs$/i.test(name)) name += '.cs';
    if (project.files.some((f) => f.name.toLowerCase() === name.toLowerCase() && f.name !== except)) return null;
    return name;
  }

  function newFile() {
    let n = 1; while (project.files.some((f) => f.name === `File${n}.cs`)) n++;
    const name = `File${n}.cs`;
    project.files.push({ name, source: `using YotsubaShader.Language;\n\n// ${name}\n` });
    editor.add(name, project.files[project.files.length - 1].source);
    openFile(name);
    startRename(name);
  }

  function startRename(name) {
    const tab = $$('.pg-file', el.files).find((t) => t.dataset.name === name);
    if (!tab) return;
    const input = document.createElement('input');
    input.value = name; input.setAttribute('aria-label', T('File name'));
    tab.replaceChildren(input);
    input.focus(); input.setSelectionRange(0, name.replace(/\.cs$/i, '').length);
    let done = false;
    const finish = (commit) => {
      if (done) return; done = true;
      const next = commit ? validName(input.value, name) : null;
      if (next && next !== name) {
        const f = project.files.find((x) => x.name === name);
        f.name = next; editor.rename(name, next);
        if (project.active === name) project.active = next;
        save(); scheduleAnalyze(); scheduleLiveCompile();
      }
      renderFiles();
    };
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') finish(true); else if (e.key === 'Escape') finish(false); e.stopPropagation(); });
    input.addEventListener('blur', () => finish(true));
  }

  function deleteFile(name) {
    if (project.files.length < 2 || !confirm(T('Delete {name}?', { name }))) return;
    const idx = project.files.findIndex((f) => f.name === name);
    project.files.splice(idx, 1); editor.remove(name);
    if (project.active === name) project.active = project.files[Math.max(0, idx - 1)].name;
    editor.show(project.active); renderFiles(); save(); scheduleAnalyze(); scheduleLiveCompile();
  }

  /* ----------------------------------------------------------- rendering */
  let lastDiagnostics = [];
  const selectedOutput = {};
  const copyIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>';
  const expandIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4H4v5M15 4h5v5M20 15v5h-5M4 15v5h5"/></svg>';

  function codeActions(panel, copyLabel, expandLabel) {
    const expanded = el.root.classList.contains('pg--output-expanded');
    const currentExpandLabel = expanded ? T('Restore workspace') : expandLabel;
    return `<button class="pg-icon-button" type="button" data-copy-output="${esc(panel)}" aria-label="${esc(copyLabel)}" title="${esc(copyLabel)}">${copyIcon}</button>
      <button class="pg-icon-button" type="button" data-expand-output="${esc(panel)}" aria-pressed="${expanded}" aria-label="${esc(currentExpandLabel)}" title="${esc(currentExpandLabel)}">${expandIcon}</button>`;
  }

  function wireCodeActions(container, text, labels) {
    const status = $('[data-output-status]', container);
    $('[data-copy-output]', container)?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(text);
        status.textContent = labels.copied;
      } catch {
        status.textContent = labels.copyFailed;
      }
    });
    $('[data-expand-output]', container)?.addEventListener('click', (event) => {
      const button = event.currentTarget;
      const expanded = el.root.classList.toggle('pg--output-expanded');
      const label = expanded ? T('Restore workspace') : labels.expand;
      button.setAttribute('aria-pressed', String(expanded));
      button.setAttribute('aria-label', label);
      button.title = label;
    });
  }

  function renderSpirv(sp) {
    if (!sp?.text) {
      el.panels.spirv.innerHTML = emptyState(T('SPIR-V Assembly will appear here once the pipeline produces it.'));
      return;
    }

    const instructions = String(sp.text).replace(/\r\n?/g, '\n').split('\n').filter((line) => line.trim()).length;
    el.panels.spirv.innerHTML = `<section class="pg-spirv-explorer" aria-label="SPIR-V Assembly">
      <header class="pg-spirv-header">
        <div class="pg-spirv-title"><span>SPIR-V</span><strong>${instructions} ${esc(T('instructions'))}</strong></div>
        <div class="pg-spirv-actions">
          ${sp.base64 ? `<button type="button" class="pg-btn" id="pg-dl">${T('Download .spv')}</button>` : ''}
          ${codeActions('spirv', T('Copy SPIR-V'), T('Expand SPIR-V'))}
        </div>
      </header>
      <div class="pg-spirv-code" role="region" aria-label="SPIR-V Assembly" tabindex="0">
        <div class="pg-spirv-assembly">${spirvAssembly(sp.text)}</div>
      </div>
      <p class="pg-spirv-status" data-output-status aria-live="polite"></p>
    </section>`;

    $('#pg-dl')?.addEventListener('click', () => {
      const bin = Uint8Array.from(atob(sp.base64), (c) => c.charCodeAt(0));
      const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([bin])), download: 'shader.spv' });
      a.click(); URL.revokeObjectURL(a.href);
    });
    wireCodeActions(el.panels.spirv, sp.text, {
      copied: T('SPIR-V copied'),
      copyFailed: T('Could not copy SPIR-V'),
      expand: T('Expand SPIR-V'),
    });
  }

  function renderBackendOutput(panel, label, property, outputs) {
    const variants = outputs.flatMap((shader) => (shader.stages || []).map((stage) => ({
      key: `${shader.fullName || shader.name}:${stage.stage}:${stage.name}`,
      label: `${shader.fullName || shader.name} · ${stage.name} (${stage.stage})`,
      text: stage[property] || '',
    }))).filter((variant) => variant.text);

    if (!variants.length) {
      el.panels[panel].innerHTML = emptyState(T('{language} output will appear here once the compiler produces it.', { language: label }));
      return;
    }

    if (!variants.some((variant) => variant.key === selectedOutput[panel])) {
      selectedOutput[panel] = variants[0].key;
    }

    const selected = variants.find((variant) => variant.key === selectedOutput[panel]) || variants[0];

    el.panels[panel].innerHTML = `<section class="pg-output-explorer" aria-label="${esc(label)}">
      <header class="pg-output-header">
        <div><span class="pg-eyebrow">${esc(T('Generated code'))}</span><h2>${esc(label)}</h2></div>
        <div class="pg-output-actions">
          <span class="pg-output-count">${variants.length} ${esc(variants.length === 1 ? T('entry point') : T('entry points'))}</span>
          ${codeActions(panel, `${T('Copy code')} · ${label}`, `${T('Expand code')} · ${label}`)}
        </div>
      </header>
      <div class="pg-variant-cards" role="tablist" aria-label="${esc(T('Entry point'))}">
        ${variants.map((variant) => {
          const match = /\(([^)]+)\)$/.exec(variant.label);
          const stage = match?.[1] || '';
          const name = variant.label.replace(/\s*\([^)]+\)$/, '');
          return `<button class="pg-variant-card" type="button" role="tab" data-output-key="${esc(variant.key)}" aria-selected="${variant.key === selected.key}"><span class="pg-stage">${esc(stage)}</span><strong>${esc(name)}</strong></button>`;
        }).join('')}
      </div>
      <div class="pg-output-code" role="region" aria-label="${esc(label)}" tabindex="0"><pre><code>${esc(selected.text)}</code></pre></div>
      <p class="pg-output-status" data-output-status aria-live="polite"></p>
    </section>`;

    $$('.pg-variant-card', el.panels[panel]).forEach((card) => card.addEventListener('click', () => {
      selectedOutput[panel] = card.dataset.outputKey;
      renderBackendOutput(panel, label, property, outputs);
    }));
    wireCodeActions(el.panels[panel], selected.text, {
      copied: T('Code copied'),
      copyFailed: T('Could not copy code'),
      expand: `${T('Expand code')} · ${label}`,
    });
  }

  function renderDiagnostics(diags) {
    lastDiagnostics = diags;
    const errors = diags.filter((d) => d.severity === 'error').length;
    const byFile = {};
    diags.forEach((d) => { (byFile[d.file || project.active] ||= []).push(d); });
    editor.markers(byFile);
    el.diagnostics.innerHTML = diags.length
      ? `<ul class="pg-diags">${diags.map((d) => `<li class="pg-diag pg-diag--${esc(d.severity)}"><button type="button" data-file="${esc(d.file || '')}" data-line="${d.line || 1}"><span class="pg-diag-icon" aria-hidden="true">${d.severity === 'error' ? '×' : d.severity === 'warning' ? '△' : 'i'}</span><span><span class="pg-diag-severity">${esc(T(d.severity))}</span><span>${esc(d.message)}</span><small>${d.id ? esc(d.id) + ' · ' : ''}${d.file ? `<b>${esc(d.file)}</b> · ` : ''}${T('Line {line}, column {column}', { line: d.line || '?', column: d.column || '?' })}</small></span></button></li>`).join('')}</ul>`
      : `<p class="pg-editor-diagnostics-empty">${esc(T('No diagnostics. Your code compiles cleanly.'))}</p>`;
    return errors;
  }

  function render(result, { focusResults = true } = {}) {
    const errors = renderDiagnostics(result.diagnostics || []);

    if (errors || result.ok === false) {
      setPreviewState(T('The last valid frame remains visible while the code contains errors.'), T('Fix the diagnostics to update the live preview.'));
      if (focusResults && mobileViewport.matches) setMobileView('results');
      return errors;
    }

    const shaders = result.shaders || [];
    $('#pg-count-shaders').textContent = shaders.length ? String(shaders.length) : '';
    el.panels.shaders.innerHTML = shaders.length
      ? shaders.map((s) => {
          const entries = s.entryPoints || [];
          return `<section class="pg-shader"><header class="pg-shader-heading"><h3>${esc(s.fullName || s.name)}</h3></header><ul>${entries.map((e) => {
            const stage = String(e.stage).toLowerCase();
            const parameters = e.parameters || [];
            const type = (value) => `<span class="pg-signature-type${value === 'void' ? ' pg-signature-keyword' : ''}">${esc(value)}</span>`;
            return `<li class="pg-entry pg-entry--${esc(stage)}"><div class="pg-entry-heading"><span class="pg-stage pg-stage--${esc(stage)}">${esc(e.stage)}</span></div><code class="pg-entry-signature">${type(e.returnType || 'void')} <span class="pg-signature-method">${esc(e.name)}</span><span class="pg-signature-punctuation">(</span>${parameters.map((p) => `${type(p.type)} <span class="pg-signature-parameter">${esc(p.name)}</span>`).join('<span class="pg-signature-punctuation">, </span>')}<span class="pg-signature-punctuation">)</span></code>${parameters.some(p => p.slot) ? `<div class="pg-entry-bindings">${parameters.filter(p => p.slot).map(p => `<span class="pg-entry-binding"><span>${esc(p.name)}</span><span aria-hidden="true">:</span><code>${esc(p.slot)}</code></span>`).join('')}</div>` : ''}</li>`;
          }).join('')}</ul></section>`;
        }).join('')
      : emptyState(T('No shaders found yet. Mark a method with <code>[ShaderStage(Stage.Vertex)]</code>.'));

    const sp = result.spirv;
    renderSpirv(sp);
    const outputs = result.outputs || [];
    renderBackendOutput('hlsl', 'HLSL', 'hlsl', outputs);
    renderBackendOutput('glsl', 'GLSL', 'glsl', outputs);
    renderBackendOutput('gles', 'GLSL ES', 'glslEs', outputs);
    renderBackendOutput('msl', 'MSL', 'msl', outputs);
    renderBackendOutput('cpp', 'C++', 'cpp', outputs);
    updateLivePreview(outputs);
    if (focusResults) selectTab(sp && sp.text ? 'spirv' : 'shaders');
    if (focusResults && mobileViewport.matches) setMobileView('results');
    return errors;
  }

  /** The "Input image" tab only exists for examples that come with an image. */
  function syncImage() {
    const ex = examples.find((e) => e.id === el.example.value) || {};
    const tab = $('.pg-output-card[data-tab="image"]');
    if (!tab) return;
    // Keep the preview implementation available, but hide it until rendering is ready.
    tab.hidden = true;
    if (tab.getAttribute('aria-selected') === 'true') selectTab('shaders');
  }

  function selectTab(name) {
    $$('.pg-output-cards [role="tab"]').forEach((t) => {
      const selected = t.dataset.tab === name;
      t.setAttribute('aria-selected', String(selected));
      t.tabIndex = selected ? 0 : -1;
    });
    Object.entries(el.panels).forEach(([k, p]) => (p.hidden = k !== name));
  }

  /* -------------------------------------------------------------- analyze */
  let analyzeTimer = 0;
  let analyzeSeq = 0;
  function scheduleAnalyze(delay = 450) {
    clearTimeout(analyzeTimer);
    if (!backend || !backend.analyze || !editor) return;
    analyzeTimer = setTimeout(async () => {
      const seq = ++analyzeSeq;
      try {
        const res = await backend.analyze(clone(project.files));
        if (seq === analyzeSeq && res) renderDiagnostics(res.diagnostics || []);
      } catch { /* analysis is best effort */ }
    }, delay);
  }

  let liveCompileTimer = 0;
  let liveCompileSequence = 0;
  let liveCompiling = false;
  function scheduleLiveCompile(delay = 900) {
    clearTimeout(liveCompileTimer);
    const sequence = ++liveCompileSequence;
    if (!backend || !editor) return;
    liveCompileTimer = setTimeout(async () => {
      if (running || liveCompiling) { scheduleLiveCompile(300); return; }
      liveCompiling = true;
      setPreviewState(T('Compiling the latest changes…'));
      try {
        const style = (examples.find((e) => e.id === el.example.value) || {}).style || '';
        const result = await backend.compile(clone(project.files), { style });
        if (sequence === liveCompileSequence) render(result, { focusResults: false });
      } catch (error) {
        if (sequence === liveCompileSequence) {
          setPreviewState(T('The live compiler could not update the preview.'), String(error?.message || error));
        }
      } finally {
        liveCompiling = false;
      }
    }, delay);
  }

  /* ---------------------------------------------------------------- run */
  let running = false;
  async function run() {
    if (running) return;
    if (!backend) { renderDiagnostics([{ severity: 'info', message: T('The compiler could not be loaded. See the notice above.'), line: 1, column: 1 }]); return; }
    clearTimeout(liveCompileTimer);
    liveCompileSequence++;
    running = true; el.run.disabled = true; el.status.textContent = T('Compiling…'); setState('busy');
    const t0 = performance.now();
    try {
      const style = (examples.find((e) => e.id === el.example.value) || {}).style || '';
      const errors = render(await backend.compile(clone(project.files), { style }));
      el.status.textContent = `${errors ? T('Compilation failed') : T('Analysis completed')} · ${Math.round(performance.now() - t0)} ms`;
      setState(errors ? 'error' : 'ok');
    } catch (err) {
      render({ diagnostics: [{ severity: 'error', message: T('Compiler error: {message}', { message: err && err.message ? err.message : err }), line: 1, column: 1 }] });
      el.status.textContent = T('Compiler error'); setState('error');
    } finally { running = false; el.run.disabled = false; }
  }

  /* --------------------------------------------------------------- share */
  const b64 = {
    enc: (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''),
    dec: (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0)),
  };
  async function pipe(bytes, stream) {
    return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer());
  }
  async function encodeProject() {
    const raw = new TextEncoder().encode(JSON.stringify(project.files));
    if ('CompressionStream' in window) return 'z' + b64.enc(await pipe(raw, new CompressionStream('deflate-raw')));
    return 'j' + b64.enc(raw);
  }
  async function decodeProject(token) {
    const bytes = b64.dec(token.slice(1));
    const raw = token[0] === 'z' ? await pipe(bytes, new DecompressionStream('deflate-raw')) : bytes;
    const files = JSON.parse(new TextDecoder().decode(raw));
    if (!Array.isArray(files) || !files.every((f) => typeof f.name === 'string' && typeof f.source === 'string')) throw new Error('bad project');
    return files;
  }

  /* --------------------------------------------------------------- start */
  async function start() {
    setLoading(!backend);
    const params = new URLSearchParams(location.search);
    const hash = new URLSearchParams(location.hash.slice(1));
    let files = null;
    let active = '';

    if (hash.get('p')) { try { files = await decodeProject(hash.get('p')); } catch { /* bad link */ } }
    if (!files) {
      try {
        const saved = JSON.parse(localStorage.getItem(STORE) || 'null');
        if (saved && Array.isArray(saved.files) && saved.files.length) { files = saved.files; active = saved.active; project.example = saved.example; }
      } catch { /* ignore */ }
    }
    if (!files) {
      const ex = examples.find((e) => e.id === params.get('example')) || examples[0];
      el.example.value = ex.id; files = clone(ex.files);
    }
    const matchedExample = examples.find(e => JSON.stringify(e.files) === JSON.stringify(files));
    project.example = matchedExample?.id || project.example || el.example.value;
    if (examples.some(e => e.id === project.example)) el.example.value = project.example;
    // Saved projects and old shared links use earlier namespaces: Language.Attributes, then Language.StylesAttributes.
    // The vocabularies are now the YotsubaShader.<X>Syntax packages and [Location] lives in YotsubaShader.Language.
    const SYNTAX = { Hlsl: 'Hlsl', Glsl: 'Glsl', Metal: 'Msl', Vulkan: 'Spirv', Wgsl: 'Wgsl' };
    const migrate = (src) => src
      .replace(/\bYotsubaShader\.Language\.(?:Styles)?Attributes\.(Hlsl|Glsl|Metal|Vulkan|Wgsl)Style\.Reso?u?rces\b/g, (_, n) => `YotsubaShader.${SYNTAX[n]}Syntax.Resources`)
      .replace(/\bYotsubaShader\.Language\.(?:Styles)?Attributes\.(Hlsl|Glsl|Metal|Vulkan|Wgsl)Style\b/g, (_, n) => `YotsubaShader.${SYNTAX[n]}Syntax`)
      .replace(/^using YotsubaShader\.Language\.(?:Styles)?Attributes;[^\n]*\n/gm, '');
    project.files = clone(files).map((f) => ({ name: f.name, source: migrate(f.source) }));
    project.active = project.files.some((f) => f.name === active) ? active : (project.files.find((f) => f.name === 'Shader.cs') || project.files[0]).name;

    try { editor = await loadMonaco(project.files); } catch { editor = textareaEditor(project.files); }
    editor.onChange((name, source) => {
      const f = project.files.find((x) => x.name === name);
      if (f && f.source !== source) { f.source = source; save(); scheduleAnalyze(); scheduleLiveCompile(); }
    });
    editor.show(project.active);
    el.activeFile.textContent = project.active;
    renderFiles();

    // files
    el.files.addEventListener('click', (e) => {
      const del = e.target.closest('[data-del]');
      if (del) { e.stopPropagation(); deleteFile(del.dataset.del); return; }
      const tab = e.target.closest('.pg-file');
      if (tab && !tab.querySelector('input')) openFile(tab.dataset.name);
    });
    el.files.addEventListener('dblclick', (e) => { const tab = e.target.closest('.pg-file'); if (tab) startRename(tab.dataset.name); });
    el.files.addEventListener('keydown', (e) => {
      const tab = e.target.closest('.pg-file');
      if (!tab || tab.querySelector('input') || e.target.closest('[data-del]')) return;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) {
        e.preventDefault();
        const tabs = [...el.files.querySelectorAll('[role="tab"]')];
        const index = tabs.indexOf(tab);
        const forward = e.key === 'ArrowRight' || e.key === 'ArrowDown';
        const next = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : (index + (forward ? 1 : -1) + tabs.length) % tabs.length;
        openFile(tabs[next].dataset.name);
        el.files.querySelector('[aria-selected="true"]').focus();
      } else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openFile(tab.dataset.name); }
      else if (e.key === 'F2') startRename(tab.dataset.name);
    });
    el.add.addEventListener('click', newFile);

    // Workspace visibility. Desktop uses side panels; mobile uses a navigator drawer and one content surface.
    el.navigatorToggle.addEventListener('click', () => setNavigator(el.root.classList.contains('pg--navigator-hidden')));
    el.inspectorToggle.addEventListener('click', () => setInspector(el.root.classList.contains('pg--inspector-hidden')));
    el.backdrop.addEventListener('click', () => setNavigator(false));
    $$('[data-mobile-view]').forEach((button) => button.addEventListener('click', () => setMobileView(button.dataset.mobileView)));
    $('.pg-mobile-scope').addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const tabs = $$('[data-mobile-view]');
      const currentIndex = tabs.indexOf(document.activeElement);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (currentIndex + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      setMobileView(tabs[next].dataset.mobileView);
      tabs[next].focus();
    });
    const syncViewport = () => {
      setNavigator(!navigatorDrawerViewport.matches);
      if (mobileViewport.matches) setMobileView('editor');
      else setInspector(true);
    };
    mobileViewport.addEventListener('change', syncViewport);
    navigatorDrawerViewport.addEventListener('change', syncViewport);
    syncViewport();

    // examples replace the whole project (asking first if the user changed something)
    let loaded = JSON.stringify((examples.find((e) => e.id === el.example.value) || examples[0]).files);
    el.example.addEventListener('change', () => {
      const ex = examples.find((e) => e.id === el.example.value);
      const dirty = JSON.stringify(project.files.map(({ name, source }) => ({ name, source }))) !== loaded;
      if (dirty && !confirm(T('Replace the current files with this example?'))) { el.example.value = examples.find((e) => JSON.stringify(e.files) === loaded)?.id || examples[0].id; return; }
      project.example = ex.id;
      project.files.forEach((f) => editor.remove(f.name));
      project.files = clone(ex.files); project.files.forEach((f) => editor.add(f.name, f.source));
      loaded = JSON.stringify(ex.files);
      openFile((project.files.find((f) => f.name === 'Shader.cs') || project.files[0]).name);
      editor.markers({}); scheduleAnalyze(0); scheduleLiveCompile(120); syncImage();
    });

    el.run.addEventListener('click', run);
    el.share.addEventListener('click', async () => {
      const link = `${location.origin}${location.pathname}#p=${await encodeProject()}`;
      try { await navigator.clipboard.writeText(link); el.status.textContent = T('Link copied'); } catch { location.hash = `p=${await encodeProject()}`; }
    });
    $$('.pg-output-cards [role="tab"]').forEach((t) => {
      t.id = 'pg-tab-' + t.dataset.tab;
      t.setAttribute('aria-controls', 'pg-panel-' + t.dataset.tab);
      el.panels[t.dataset.tab].id = 'pg-panel-' + t.dataset.tab;
      el.panels[t.dataset.tab].setAttribute('aria-labelledby', t.id);
      el.panels[t.dataset.tab].tabIndex = 0;
      t.addEventListener('click', () => selectTab(t.dataset.tab));
    });
    $('.pg-output-cards').addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const tabs = $$('.pg-output-cards [role="tab"]').filter(tab => !tab.hidden);
      const index = tabs.indexOf(document.activeElement);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      selectTab(tabs[next].dataset.tab);
      tabs[next].focus();
    });
    el.diagnostics.addEventListener('click', (e) => {
      const b = e.target.closest('[data-line]');
      if (!b) return;
      const file = b.dataset.file || project.active;
      if (project.files.some((f) => f.name === file)) {
        project.active = file;
        el.activeFile.textContent = file;
        renderFiles(); save(); editor.reveal(file, Number(b.dataset.line));
        if (mobileViewport.matches) setMobileView('editor');
      }
    });
    document.addEventListener('keydown', (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); run(); } });

    Object.entries(el.panels).filter(([k]) => k !== 'image').forEach(([, p]) => { p.innerHTML = emptyState(T('Compile your code to inspect shader entry points and generated code.'), T('Ready when you are')); });
    selectTab('shaders');
    syncImage();

    // Backend: explicit demo, an already-registered one, or a Blazor app published next to the site.
    if (params.has('demo')) api.setBackend(demoBackend());
    else if (backend) showBackend();
    else {
      showBackend();
      try {
        const head = await fetch(root + 'playground-app/_framework/blazor.boot.json', { method: 'HEAD' });
        if (head.ok) {
          el.loadingDetail.textContent = T('Loading compiler…');
          el.status.textContent = T('Loading compiler…');
          setState('busy');
          await api.connectBlazor();
        } else if (!backend) {
          setLoading(false);
          el.status.textContent = T('Compiler unavailable');
        }
      } catch {
        if (!backend) {
          setLoading(false);
          el.status.textContent = T('Compiler unavailable');
        }
      }
    }
  }
  start();
})();

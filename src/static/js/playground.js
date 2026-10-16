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
 *                     parameters: [{ name, type, slot? }] }] }], ir?: string, spirv?: { text, base64? } }
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
    host: $('#pg-editor'), files: $('#pg-files'), add: $('#pg-add'),
    panels: Object.fromEntries($$('[data-panel]').map((p) => [p.dataset.panel, p])),
  };
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const emptyState = (text) => `<div class="pg-empty"><img src="${root}img/yotsuba-shader.webp" alt="" width="64" height="64"><p>${text}</p></div>`;
  const setState = (state) => { el.status.dataset.state = state; };
  /** Tiny highlighter for IR / SPIR-V text: opcodes, %ids, numbers and ; comments. */
  const hl = (text) => esc(text).split('\n').map((line) => {
    if (/^\s*;/.test(line)) return `<span class="hl-c">${line}</span>`;
    return line.replace(/(%[\w.]+)/g, '<span class="hl-id">$1</span>').replace(/\b(Op[A-Za-z]+)\b/g, '<span class="hl-op">$1</span>').replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="hl-n">$1</span>');
  }).join('\n');
  const clone = (files) => files.map((f) => ({ name: f.name, source: f.source }));

  /* ------------------------------------------------------------- project */
  const project = { files: [], active: '' };
  const current = () => project.files.find((f) => f.name === project.active);
  const save = () => { try { localStorage.setItem(STORE, JSON.stringify(project)); } catch { /* storage unavailable */ } };

  /* ------------------------------------------------------------- backend */
  const api = (window.YotsubaPlayground = window.YotsubaPlayground || {});
  let backend = null;
  api.setBackend = (b) => { backend = b; showBackend(); scheduleAnalyze(0); };
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
          ir: '; demo: the IR dump of the connected compiler appears here',
          spirv: { text: '; demo: SPIR-V text appears here\nOpCapability Shader\nOpMemoryModel Logical GLSL450' },
        };
      },
    };
  }

  function showBackend() {
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

  function monacoEditor(m, files) {
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
        { token: 'keyword', foreground: 'ff7eb6' }, { token: 'keyword.cs', foreground: 'ff7eb6' },
        { token: 'type.identifier', foreground: 'c3a6ff' }, { token: 'type', foreground: 'c3a6ff' },
        { token: 'string', foreground: '5ef0cf' }, { token: 'number', foreground: 'ffc774' },
        { token: 'comment', foreground: '7d6fa3', fontStyle: 'italic' }, { token: 'identifier', foreground: 'ece7fb' },
        { token: 'delimiter', foreground: 'a99bd0' }, { token: 'delimiter.square', foreground: 'ffc774' }, { token: 'annotation', foreground: 'ffc774' },
      ],
      colors: {
        'editor.background': '#0f0b1b', 'editor.foreground': '#ece7fb', 'editor.lineHighlightBackground': '#1a1430',
        'editor.selectionBackground': '#4a2f8a88', 'editor.inactiveSelectionBackground': '#3a2a6b55', 'editorCursor.foreground': '#ff7eb6',
        'editorLineNumber.foreground': '#4d4272', 'editorLineNumber.activeForeground': '#c3a6ff', 'editorIndentGuide.background1': '#221a38',
        'editorIndentGuide.activeBackground1': '#3a2d5e', 'editorWidget.background': '#17122a', 'editorWidget.border': '#2d2447',
        'editorSuggestWidget.background': '#17122a', 'editorSuggestWidget.border': '#2d2447', 'editorSuggestWidget.selectedBackground': '#2a2050',
        'editorSuggestWidget.highlightForeground': '#ff7eb6', 'editorHoverWidget.background': '#17122a', 'editorHoverWidget.border': '#2d2447',
        'editorBracketMatch.background': '#ff7eb633', 'editorBracketMatch.border': '#ff7eb688', 'scrollbarSlider.background': '#3a2d5e66',
        'scrollbarSlider.hoverBackground': '#4d3f7a99', 'editorGutter.background': '#0f0b1b',
      },
    });
    const ed = m.editor.create(el.host, {
      model: null, theme: 'yotsuba', automaticLayout: true, fontSize: 14, fontFamily: '"JetBrains Mono", SFMono-Regular, Menlo, monospace',
      minimap: { enabled: false }, scrollBeyondLastLine: false, padding: { top: 14 }, tabSize: 4, ariaLabel: T('Shader source'),
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
      tab.className = 'pg-file'; tab.setAttribute('role', 'tab'); tab.tabIndex = 0;
      tab.setAttribute('aria-selected', String(f.name === project.active));
      tab.dataset.name = f.name;
      const dot = document.createElement('i'); dot.className = 'pg-dot-file'; dot.dataset.c = String(project.files.indexOf(f) % 4);
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
    project.active = name; editor.show(name); renderFiles(); save();
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
        save(); scheduleAnalyze();
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
    editor.show(project.active); renderFiles(); save(); scheduleAnalyze();
  }

  /* ----------------------------------------------------------- rendering */
  let lastDiagnostics = [];

  function renderDiagnostics(diags) {
    lastDiagnostics = diags;
    const errors = diags.filter((d) => d.severity === 'error').length;
    $('#pg-count-diagnostics').textContent = diags.length ? String(diags.length) : '';
    $('#pg-count-diagnostics').dataset.error = errors ? '1' : '';
    const byFile = {};
    diags.forEach((d) => { (byFile[d.file || project.active] ||= []).push(d); });
    editor.markers(byFile);
    el.panels.diagnostics.innerHTML = diags.length
      ? `<ul class="pg-diags">${diags.map((d) => `<li class="pg-diag pg-diag--${esc(d.severity)}"><button type="button" data-file="${esc(d.file || '')}" data-line="${d.line || 1}"><b>${esc(T(d.severity))}</b><span>${esc(d.message)}</span><small>${d.id ? esc(d.id) + ' · ' : ''}${d.file ? `<b>${esc(d.file)}</b> · ` : ''}line ${d.line || '?'}, col ${d.column || '?'}</small></button></li>`).join('')}</ul>`
      : emptyState(T('No diagnostics. Your code compiles cleanly.'));
    return errors;
  }

  function render(result) {
    const errors = renderDiagnostics(result.diagnostics || []);

    const shaders = result.shaders || [];
    $('#pg-count-shaders').textContent = shaders.length ? String(shaders.length) : '';
    el.panels.shaders.innerHTML = shaders.length
      ? shaders.map((s) => `<div class="pg-shader"><h3>${esc(s.fullName || s.name)}</h3><ul>${(s.entryPoints || []).map((e) => `<li><span class="pg-stage pg-stage--${esc(String(e.stage).toLowerCase())}">${esc(e.stage)}</span><code>${esc(e.returnType || 'void')} ${esc(e.name)}(${(e.parameters || []).map((p) => `${esc(p.type)} ${esc(p.name)}${p.slot ? ` <i>${esc(p.slot)}</i>` : ''}`).join(', ')})</code></li>`).join('')}</ul></div>`).join('')
      : emptyState(T('No shaders found yet. Mark a method with <code>[ShaderStage(Stage.Vertex)]</code>.'));

    el.panels.ir.innerHTML = result.ir ? `<pre>${hl(result.ir)}</pre>` : emptyState(T('The IR will appear here once the pipeline produces it.'));

    const sp = result.spirv;
    el.panels.spirv.innerHTML = sp && sp.text
      ? `${sp.base64 ? `<div class="pg-actions"><button type="button" class="pg-btn" id="pg-dl">${T('Download .spv')}</button></div>` : ''}<pre>${hl(sp.text)}</pre>`
      : emptyState(T('SPIR-V will appear here once the pipeline produces it.'));
    $('#pg-dl')?.addEventListener('click', () => {
      const bin = Uint8Array.from(atob(sp.base64), (c) => c.charCodeAt(0));
      const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([bin])), download: 'shader.spv' });
      a.click(); URL.revokeObjectURL(a.href);
    });
    if (errors) selectTab('diagnostics');
  }

  function selectTab(name) {
    $$('.pg-tabs [role="tab"]').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.tab === name)));
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

  /* ---------------------------------------------------------------- run */
  let running = false;
  async function run() {
    if (running) return;
    if (!backend) { renderDiagnostics([{ severity: 'info', message: T('The compiler could not be loaded. See the notice above.'), line: 1, column: 1 }]); selectTab('diagnostics'); return; }
    running = true; el.run.disabled = true; el.status.textContent = T('Compiling…'); setState('busy');
    const t0 = performance.now();
    try {
      const style = (examples.find((e) => e.id === el.example.value) || {}).style || '';
      render(await backend.compile(clone(project.files), { style }));
      el.status.textContent = `${backend.name} · ${Math.round(performance.now() - t0)} ms`; setState('ok');
      const bar = $('.pg-bar'); bar.classList.remove('pg-pulse'); void bar.offsetWidth; bar.classList.add('pg-pulse');
    } catch (err) {
      render({ diagnostics: [{ severity: 'error', message: T('Compiler error: {message}', { message: err && err.message ? err.message : err }), line: 1, column: 1 }] });
      el.status.textContent = T('Compiler error'); setState('off');
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
    const params = new URLSearchParams(location.search);
    const hash = new URLSearchParams(location.hash.slice(1));
    let files = null;
    let active = '';

    if (hash.get('p')) { try { files = await decodeProject(hash.get('p')); } catch { /* bad link */ } }
    if (!files) {
      try {
        const saved = JSON.parse(localStorage.getItem(STORE) || 'null');
        if (saved && Array.isArray(saved.files) && saved.files.length) { files = saved.files; active = saved.active; }
      } catch { /* ignore */ }
    }
    if (!files) {
      const ex = examples.find((e) => e.id === params.get('example')) || examples[0];
      el.example.value = ex.id; files = clone(ex.files);
    }
    // Saved projects and old shared links still say Language.Attributes (renamed to StylesAttributes).
    project.files = clone(files).map((f) => ({ name: f.name, source: f.source.replace(/\bYotsubaShader\.Language\.Attributes\b/g, 'YotsubaShader.Language.StylesAttributes') }));
    project.active = project.files.some((f) => f.name === active) ? active : (project.files.find((f) => f.name === 'Shader.cs') || project.files[0]).name;

    try { editor = await loadMonaco(project.files); } catch { editor = textareaEditor(project.files); }
    editor.onChange((name, source) => {
      const f = project.files.find((x) => x.name === name);
      if (f && f.source !== source) { f.source = source; save(); scheduleAnalyze(); }
    });
    editor.show(project.active);
    renderFiles();

    // files
    el.files.addEventListener('click', (e) => {
      const del = e.target.closest('[data-del]');
      if (del) { e.stopPropagation(); deleteFile(del.dataset.del); return; }
      const tab = e.target.closest('.pg-file');
      if (tab && !tab.querySelector('input')) openFile(tab.dataset.name);
    });
    el.files.addEventListener('dblclick', (e) => { const tab = e.target.closest('.pg-file'); if (tab) startRename(tab.dataset.name); });
    el.files.addEventListener('keydown', (e) => { const tab = e.target.closest('.pg-file'); if (tab && (e.key === 'Enter' || e.key === ' ') && !tab.querySelector('input')) { e.preventDefault(); openFile(tab.dataset.name); } else if (tab && e.key === 'F2') startRename(tab.dataset.name); });
    el.add.addEventListener('click', newFile);

    // examples replace the whole project (asking first if the user changed something)
    let loaded = JSON.stringify((examples.find((e) => e.id === el.example.value) || examples[0]).files);
    el.example.addEventListener('change', () => {
      const ex = examples.find((e) => e.id === el.example.value);
      const dirty = JSON.stringify(project.files.map(({ name, source }) => ({ name, source }))) !== loaded;
      if (dirty && !confirm(T('Replace the current files with this example?'))) { el.example.value = examples.find((e) => JSON.stringify(e.files) === loaded)?.id || examples[0].id; return; }
      project.files.forEach((f) => editor.remove(f.name));
      project.files = clone(ex.files); project.files.forEach((f) => editor.add(f.name, f.source));
      loaded = JSON.stringify(ex.files);
      openFile((project.files.find((f) => f.name === 'Shader.cs') || project.files[0]).name);
      editor.markers({}); scheduleAnalyze(0);
    });

    el.run.addEventListener('click', run);
    el.share.addEventListener('click', async () => {
      const link = `${location.origin}${location.pathname}#p=${await encodeProject()}`;
      try { await navigator.clipboard.writeText(link); el.status.textContent = T('Link copied'); } catch { location.hash = `p=${await encodeProject()}`; }
    });
    $$('.pg-tabs [role="tab"]').forEach((t) => t.addEventListener('click', () => selectTab(t.dataset.tab)));
    el.panels.diagnostics.addEventListener('click', (e) => {
      const b = e.target.closest('[data-line]');
      if (!b) return;
      const file = b.dataset.file || project.active;
      if (project.files.some((f) => f.name === file)) { project.active = file; renderFiles(); save(); editor.reveal(file, Number(b.dataset.line)); }
    });
    document.addEventListener('keydown', (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); run(); } });

    Object.values(el.panels).forEach((p) => { p.innerHTML = emptyState(T('Press <b>Compile</b> (Ctrl/⌘ Enter) to see the results.')); });
    selectTab('diagnostics');

    // Backend: explicit demo, an already-registered one, or a Blazor app published next to the site.
    if (params.has('demo')) api.setBackend(demoBackend());
    else if (backend) showBackend();
    else {
      showBackend();
      try {
        const head = await fetch(root + 'playground-app/_framework/blazor.boot.json', { method: 'HEAD' });
        if (head.ok) { el.status.textContent = T('Loading compiler…'); setState('busy'); await api.connectBlazor(); }
      } catch { if (!backend) el.status.textContent = T('Compiler unavailable'); }
    }
  }
  start();
})();

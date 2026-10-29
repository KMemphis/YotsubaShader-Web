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
    root: $('#pg'), host: $('#pg-editor'), files: $('#pg-files'), add: $('#pg-add'), activeFile: $('#pg-active-file'),
    navigator: $('#pg-navigator'), navigatorToggle: $('#pg-navigator-toggle'), inspector: $('#pg-inspector'),
    inspectorToggle: $('#pg-inspector-toggle'), backdrop: $('#pg-backdrop'),
    panels: Object.fromEntries($$('[data-panel]').map((p) => [p.dataset.panel, p])),
  };
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const emptyState = (text, title = '') => `<div class="pg-empty">${title ? `<h2>${esc(title)}</h2>` : ''}<p>${text}</p></div>`;
  const setState = (state) => { el.status.dataset.state = state; };
  /** Tiny highlighter for IR / SPIR-V text: opcodes, %ids, numbers and ; comments. */
  const hl = (text) => esc(text).split('\n').map((line) => {
    if (/^\s*;/.test(line)) return `<span class="hl-c">${line}</span>`;
    return line.replace(/(%[\w.]+)/g, '<span class="hl-id">$1</span>').replace(/\b(Op[A-Za-z]+)\b/g, '<span class="hl-op">$1</span>').replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="hl-n">$1</span>');
  }).join('\n');
  const hlOperands = (text) => esc(text)
    .replace(/(%[\w.]+)/g, '<span class="hl-id">$1</span>')
    .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="hl-n">$1</span>');
  /** Present one SPIR-V instruction per row. The four assembly columns preserve
   * the conventional `result = opcode operands` layout: header instructions leave
   * the result columns empty, so their opcode aligns with typed instructions. */
  const spirvAssembly = (text) => String(text).replace(/\r\n?/g, '\n').split('\n').map((raw) => {
    const line = raw.trim();
    if (/^\s*;/.test(line)) return `<div class="pg-spirv-line pg-spirv-line--plain"><span class="hl-c">${esc(line)}</span></div>`;
    const instruction = line.match(/^(?:(%[\w.]+)\s*(=)\s*)?(Op[A-Za-z]+)(?:\s+(.*))?$/);
    if (!instruction) return `<div class="pg-spirv-line pg-spirv-line--plain">${hl(line)}</div>`;
    const [, result = '', equals = '', opcode, operands = ''] = instruction;
    return `<div class="pg-spirv-line"><span class="pg-spirv-result">${hlOperands(result) || '&nbsp;'}</span><span class="pg-spirv-equals">${esc(equals) || '&nbsp;'}</span><span class="pg-spirv-op">${esc(opcode)}</span><span class="pg-spirv-operands">${hlOperands(operands) || '&nbsp;'}</span></div>`;
  }).join('');
  /**
   * The browser receives a human-readable IR document, not a JSON dump of its
   * object graph. The compiler owns that document; this is deliberately only a
   * view-model parser for its function headers, so the inspector can offer
   * useful navigation without inventing an alternative IR format in JavaScript.
   */
  const splitIrFunctions = (text) => {
    const lines = String(text || '').replace(/\r\n?/g, '\n').split('\n');
    const functions = [];
    let current = null;
    lines.forEach((line) => {
      const header = line.match(/^function\s+(.+?)\s+\[([^\]]+)]\s*$/);
      if (header) {
        if (current) functions.push(current);
        current = { name: header[1], stage: header[2], lines: [line] };
      } else if (current) {
        current.lines.push(line);
      }
    });
    if (current) functions.push(current);
    return functions.length ? functions : [{ name: T('Module'), stage: '', lines }];
  };
  const hlIrLine = (line) => {
    if (/^\s*;/.test(line)) return `<span class="hl-c">${esc(line)}</span>`;
    return esc(line)
      .replace(/\b(function|input|output|local|store|return)\b/g, '<span class="hl-ir-keyword">$1</span>')
      .replace(/\b(Vertex|Fragment|Compute)\b/g, '<span class="hl-ir-stage">$1</span>')
      .replace(/\b(float32|float64|int32|uint32|bool|void|vector\d+|matrix\d+x\d+)\b/g, '<span class="hl-ir-type">$1</span>')
      .replace(/\b(\d+(?:\.\d+)?(?:f)?)\b/g, '<span class="hl-n">$1</span>');
  };
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
        'editor.background': '#0f0b1b', 'editor.foreground': '#D4D4D4', 'editor.lineHighlightBackground': '#1a1430',
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
  let selectedIrFunction = '';

  function renderIr(ir) {
    if (!ir) {
      el.panels.ir.innerHTML = emptyState(T('The IR will appear here once the pipeline produces it.'));
      return;
    }

    const functions = splitIrFunctions(ir).map((item, index) => ({ ...item, key: String(index) }));
    if (!functions.some((item) => item.key === selectedIrFunction)) selectedIrFunction = functions[0].key;
    const item = functions.find((candidate) => candidate.key === selectedIrFunction) || functions[0];
    const lineCount = item.lines.length;
    const stage = item.stage || T('Module');
    const code = item.lines.map((line, index) => `<li><span class="pg-ir-line-number" aria-hidden="true">${index + 1}</span><code>${hlIrLine(line) || '&nbsp;'}</code></li>`).join('');

    el.panels.ir.innerHTML = `<section class="pg-ir-explorer" aria-label="${esc(T('Lowered IR explorer'))}">
      <header class="pg-ir-header">
        <div class="pg-ir-title"><span>${esc(T('Lowered IR'))}</span><strong>${esc(item.name)}</strong></div>
        <div class="pg-ir-actions">
          <button class="pg-icon-button" type="button" id="pg-ir-copy" aria-label="${esc(T('Copy IR'))}" title="${esc(T('Copy IR'))}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="1"/><path d="M15 9V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h4"/></svg>
          </button>
          <button class="pg-icon-button" type="button" id="pg-ir-expand" aria-pressed="${el.root.classList.contains('pg--ir-expanded')}" aria-label="${esc(T('Expand IR'))}" title="${esc(T('Expand IR'))}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4H4v5M15 4h5v5M20 15v5h-5M4 15v5h5"/></svg>
          </button>
        </div>
      </header>
      <div class="pg-ir-function-picker">
        <label for="pg-ir-function">${esc(T('Function'))}</label>
        <select id="pg-ir-function">${functions.map((candidate) => `<option value="${esc(candidate.key)}"${candidate.key === item.key ? ' selected' : ''}>${esc(candidate.name)}${candidate.stage ? ` · ${esc(candidate.stage)}` : ''}</option>`).join('')}</select>
      </div>
      <dl class="pg-ir-metadata">
        <div><dt>${esc(T('Stage'))}</dt><dd class="pg-ir-stage">${esc(stage)}</dd></div>
        <div><dt>${esc(T('Lines'))}</dt><dd>${lineCount}</dd></div>
      </dl>
      <div class="pg-ir-code" role="region" aria-label="${esc(T('IR code for {name}', { name: item.name }))}" tabindex="0"><ol>${code}</ol></div>
      <p class="pg-ir-status" aria-live="polite"></p>
    </section>`;

    $('#pg-ir-function')?.addEventListener('change', (event) => {
      selectedIrFunction = event.target.value;
      renderIr(ir);
    });
    $('#pg-ir-copy')?.addEventListener('click', async () => {
      const status = $('.pg-ir-status', el.panels.ir);
      try {
        await navigator.clipboard.writeText(item.lines.join('\n'));
        status.textContent = T('IR copied');
      } catch {
        status.textContent = T('Could not copy IR');
      }
    });
    $('#pg-ir-expand')?.addEventListener('click', () => {
      const expanded = el.root.classList.toggle('pg--ir-expanded');
      $('#pg-ir-expand').setAttribute('aria-pressed', String(expanded));
      $('#pg-ir-expand').setAttribute('aria-label', T(expanded ? 'Restore workspace' : 'Expand IR'));
      $('#pg-ir-expand').title = T(expanded ? 'Restore workspace' : 'Expand IR');
    });
  }

  function renderDiagnostics(diags) {
    lastDiagnostics = diags;
    const errors = diags.filter((d) => d.severity === 'error').length;
    $('#pg-count-diagnostics').textContent = diags.length ? String(diags.length) : '';
    $('#pg-count-diagnostics').dataset.error = errors ? '1' : '';
    const byFile = {};
    diags.forEach((d) => { (byFile[d.file || project.active] ||= []).push(d); });
    editor.markers(byFile);
    el.panels.diagnostics.innerHTML = diags.length
      ? `<ul class="pg-diags">${diags.map((d) => `<li class="pg-diag pg-diag--${esc(d.severity)}"><button type="button" data-file="${esc(d.file || '')}" data-line="${d.line || 1}"><span class="pg-diag-icon" aria-hidden="true">${d.severity === 'error' ? '×' : d.severity === 'warning' ? '△' : 'i'}</span><span><span class="pg-diag-severity">${esc(T(d.severity))}</span><span>${esc(d.message)}</span><small>${d.id ? esc(d.id) + ' · ' : ''}${d.file ? `<b>${esc(d.file)}</b> · ` : ''}${T('Line {line}, column {column}', { line: d.line || '?', column: d.column || '?' })}</small></span></button></li>`).join('')}</ul>`
      : emptyState(T('No diagnostics. Your code compiles cleanly.'), T('No issues found'));
    return errors;
  }

  function render(result) {
    const errors = renderDiagnostics(result.diagnostics || []);

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

    renderIr(result.ir);

    const sp = result.spirv;
    el.panels.spirv.innerHTML = sp && sp.text
      ? `${sp.base64 ? `<div class="pg-actions"><button type="button" class="pg-btn" id="pg-dl">${T('Download .spv')}</button></div>` : ''}<section class="pg-spirv-assembly" aria-label="SPIR-V Assembly">${spirvAssembly(sp.text)}</section>`
      : emptyState(T('SPIR-V Assembly will appear here once the pipeline produces it.'));
    $('#pg-dl')?.addEventListener('click', () => {
      const bin = Uint8Array.from(atob(sp.base64), (c) => c.charCodeAt(0));
      const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([bin])), download: 'shader.spv' });
      a.click(); URL.revokeObjectURL(a.href);
    });
    selectTab(errors ? 'diagnostics' : result.ir ? 'ir' : 'shaders');
    if (mobileViewport.matches) setMobileView('results');
    return errors;
  }

  /** The "Input image" tab only exists for examples that come with an image. */
  function syncImage() {
    const ex = examples.find((e) => e.id === el.example.value) || {};
    const tab = $('.pg-tabs [data-tab="image"]');
    if (!tab) return;
    // Keep the preview implementation available, but hide it until rendering is ready.
    tab.hidden = true;
    if (tab.getAttribute('aria-selected') === 'true') selectTab('diagnostics');
  }

  function selectTab(name) {
    $$('.pg-tabs [role="tab"]').forEach((t) => {
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

  /* ---------------------------------------------------------------- run */
  let running = false;
  async function run() {
    if (running) return;
    if (!backend) { renderDiagnostics([{ severity: 'info', message: T('The compiler could not be loaded. See the notice above.'), line: 1, column: 1 }]); selectTab('diagnostics'); return; }
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
      if (f && f.source !== source) { f.source = source; save(); scheduleAnalyze(); }
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
      editor.markers({}); scheduleAnalyze(0); syncImage();
    });

    el.run.addEventListener('click', run);
    el.share.addEventListener('click', async () => {
      const link = `${location.origin}${location.pathname}#p=${await encodeProject()}`;
      try { await navigator.clipboard.writeText(link); el.status.textContent = T('Link copied'); } catch { location.hash = `p=${await encodeProject()}`; }
    });
    $$('.pg-tabs [role="tab"]').forEach((t) => {
      t.id = 'pg-tab-' + t.dataset.tab;
      t.setAttribute('aria-controls', 'pg-panel-' + t.dataset.tab);
      el.panels[t.dataset.tab].id = 'pg-panel-' + t.dataset.tab;
      el.panels[t.dataset.tab].setAttribute('aria-labelledby', t.id);
      el.panels[t.dataset.tab].tabIndex = 0;
      t.addEventListener('click', () => selectTab(t.dataset.tab));
    });
    $('.pg-tabs').addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const tabs = $$('.pg-tabs [role="tab"]').filter(tab => !tab.hidden);
      const index = tabs.indexOf(document.activeElement);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      selectTab(tabs[next].dataset.tab);
      tabs[next].focus();
    });
    el.panels.diagnostics.addEventListener('click', (e) => {
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

    Object.entries(el.panels).filter(([k]) => k !== 'image').forEach(([, p]) => { p.innerHTML = emptyState(T('Compile your code to inspect diagnostics and shader entry points.'), T('Ready when you are')); });
    selectTab('diagnostics');
    syncImage();

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

import { icon } from '../components.mjs';
import { BASIC_COLOR, STYLE_TRIANGLE, TYPES_CS, TYPES_TEXTURE_CS, TEXTURE_BINDING, withoutXna } from '../snippets.mjs';
import { STYLES } from '../components.mjs';

// The playground UI is complete; the compiler is attached through one function (see src/static/js/playground.js
// and Web/playground/README.md for the JSON contract).
export default function playground() {
  // Every example is a small project: Types.cs (GPU types) + Shader.cs (the shader).
  const project = (source) => [
    { name: 'Types.cs', source: TYPES_CS },
    { name: 'Shader.cs', source: withoutXna(source) },
  ];
  const examples = [
    { id: 'basic-color', name: 'Basic color shader', files: project(BASIC_COLOR) },
    ...STYLES.map((s) => ({ id: `triangle-${s.id}`, name: `Triangle (${s.label})`, files: project(STYLE_TRIANGLE[s.id]), style: s.id })),
    {
      id: 'texture-binding',
      name: 'Texture and sampler',
      files: [{ name: 'Types.cs', source: TYPES_TEXTURE_CS }, { name: 'Shader.cs', source: withoutXna(TEXTURE_BINDING) }],
      image: '/img/enuma.webp',
    },
  ];
  const defaultIndex = examples.findIndex(example => example.id === 'texture-binding');
  examples.unshift(...examples.splice(defaultIndex, 1));

  return [
    {
      path: '/playground/',
      section: 'playground',
      title: 'Playground',
      description: 'Edit C# shader declarations, inspect diagnostics and discovered entry points, and review IR when the connected compiler produces it.',
      bodyClass: 'playground',
      noFooter: true,
      styles: ['/css/playground.css'],
      scripts: ['/js/playground.js'],
      body: `
<div class="pg" id="pg">
  <header class="pg-toolbar">
    <div class="pg-toolbar-leading">
      <button class="pg-icon-button" type="button" id="pg-navigator-toggle" aria-controls="pg-navigator" aria-expanded="true" title="Hide navigator">
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/></svg>
        <span class="sr-only">Hide navigator</span>
      </button>
      <div class="pg-title"><h1>Playground</h1><span>C# shaders</span></div>
      <label class="pg-select"><span class="sr-only">Example</span>
        <select id="pg-example" aria-label="Example">${examples.map((e) => `<option value="${e.id}">${e.name}</option>`).join('')}</select>
      </label>
    </div>

    <div class="pg-mobile-scope" role="tablist" aria-label="Workspace view">
      <button type="button" role="tab" data-mobile-view="editor" aria-selected="true">Editor</button>
      <button type="button" role="tab" data-mobile-view="results" aria-selected="false">Results</button>
    </div>

    <div class="pg-toolbar-actions">
      <details class="pg-info">
        <summary class="pg-icon-button" aria-label="Availability" title="Availability">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 10v6M12 7h.01"/></svg>
        </summary>
        <div class="pg-popover"><h2>Current availability</h2><p>The playground provides C# analysis, shader discovery, and compiler inspection. The IR and SPIR-V Assembly tabs show the text produced by the connected pipeline; the assembly view can be partial while the backend is under development. Rendering is not available here yet.</p></div>
      </details>
      __LANGSWITCH__
      <button class="pg-btn" type="button" id="pg-share" title="Copy a link to this code">${icon('external')}<span>Share</span></button>
      <button class="pg-btn pg-btn--primary" type="button" id="pg-run" title="Compile (Ctrl/⌘ Enter)"><svg class="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m8 5 11 7-11 7Z"/></svg><span>Compile</span></button>
      <button class="pg-icon-button" type="button" id="pg-inspector-toggle" aria-controls="pg-inspector" aria-expanded="true" title="Hide inspector">
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16"/></svg>
        <span class="sr-only">Hide inspector</span>
      </button>
    </div>
  </header>
  <div class="pg-banner" id="pg-banner" role="status" hidden></div>

  <div class="pg-workspace">
    <aside class="pg-navigator" id="pg-navigator" aria-label="Project navigator">
      <header class="pg-panel-heading">
        <h2>Project</h2>
        <button class="pg-add" type="button" id="pg-add" aria-label="New file" title="New file">${icon('plus')}</button>
      </header>
      <div class="pg-files" id="pg-files" role="tablist" aria-label="Files"></div>
    </aside>

    <section class="pg-editor" aria-label="Source code">
      <header class="pg-editor-heading"><span id="pg-active-file">Shader.cs</span></header>
      <div class="pg-editor-host" id="pg-editor" role="tabpanel" tabindex="0"></div>
    </section>

    <aside class="pg-inspector" id="pg-inspector" aria-label="Results inspector">
      <header class="pg-inspector-heading">
        <h2 class="sr-only">Results</h2>
        <div class="pg-tabs" role="tablist" aria-label="Output">
        <button role="tab" type="button" data-tab="diagnostics" aria-selected="true">Diagnostics <i class="pg-count" id="pg-count-diagnostics"></i></button>
        <button role="tab" type="button" data-tab="shaders" aria-selected="false">Shaders <i class="pg-count" id="pg-count-shaders"></i></button>
        <button role="tab" type="button" data-tab="ir" aria-selected="false">IR</button>
        <button role="tab" type="button" data-tab="spirv" aria-selected="false">SPIR-V Assembly</button>
        <button role="tab" type="button" data-tab="image" aria-selected="false" hidden>Input image</button>
        </div>
      </header>
      <div class="pg-panels">
        <div class="pg-panel" data-panel="diagnostics" role="tabpanel"></div>
        <div class="pg-panel" data-panel="shaders" role="tabpanel" hidden></div>
        <div class="pg-panel" data-panel="ir" role="tabpanel" hidden></div>
        <div class="pg-panel" data-panel="spirv" role="tabpanel" hidden></div>
        <div class="pg-panel" data-panel="image" role="tabpanel" hidden>
          <figure class="pg-figure">
            <img id="pg-image" alt="" width="720" height="1080" decoding="async">
            <figcaption>Example input image. This is the kind of image your engine binds to <code>Albedo</code> when it draws. The playground compiles the shader; it does not render it.</figcaption>
          </figure>
        </div>
      </div>
    </aside>
  </div>
  <button class="pg-backdrop" id="pg-backdrop" type="button" aria-label="Close navigator" hidden></button>
  <footer class="pg-statusbar"><span class="pg-status" id="pg-status" role="status" data-state="off"></span><span class="pg-shortcut">Ctrl / ⌘ Enter <span>to compile</span></span></footer>
</div>
<script type="application/json" id="pg-examples">${JSON.stringify(examples).replace(/</g, '\\u003c')}</script>
<noscript><p style="padding:24px">The playground needs JavaScript.</p></noscript>`,
    },
  ];
}

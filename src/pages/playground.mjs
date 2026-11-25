import fs from 'node:fs';
import { icon } from '../components.mjs';
import { BASIC_COLOR_PLAYGROUND } from '../snippets.mjs';

// The playground UI is complete; the compiler is attached through one function (see src/static/js/playground.js
// and Web/playground/README.md for the JSON contract).
export default function playground() {
  // Examples live as real .cs files in src/playground-examples/. Each one is a single Shader.cs that only uses
  // the types and functions of the YotsubaShader libraries.
  const read = (file) => fs.readFileSync(new URL(`../playground-examples/${file}`, import.meta.url), 'utf8').replace(/\r\n/g, '\n');
  const visual = (id, name, shader, extra = {}) => ({
    id, name, ...extra,
    files: [{ name: 'Shader.cs', source: read(shader) }],
  });
  const examples = [
    // This one draws a screen quad (POSITION + TEXCOORD) and reads the camera from the uniform buffer, so the preview
    // is told to cover the screen and which values to put in the fields the page does not know.
    visual('ocean', 'Procedural ocean', 'ocean.cs', {
      preview: { screen: true, values: { cameraposition: [0, 2, 0], cameraangles: [0, 0] } },
    }),
    visual('mandelbulb', 'Mandelbulb', 'mandelbulb.cs'),
    visual('aurora', 'Aurora', 'aurora.cs'),
    visual('mesh-gradient', 'Mesh gradient', 'mesh-gradient.cs'),
    visual('orbs', 'Mirror orbs', 'orbs.cs'),
    visual('bricks', 'Brick wall', 'bricks.cs', {
      textures: [{ sampler: 'Albedo', file: 'img/playground/red-brick.webp' }, { sampler: 'Height', file: 'img/playground/red-brick-height.webp' }],
    }),
    visual('pool', 'Pool water', 'pool.cs', { textures: [{ sampler: 'Tiles', file: 'img/playground/marble.webp' }] }),
    visual('fractal', 'Fractal zoom', 'fractal.cs'),
    { id: 'basic-color', name: 'Basic color shader', files: [{ name: 'Shader.cs', source: BASIC_COLOR_PLAYGROUND }] },
  ];

  return [
    {
      path: '/playground/',
      section: 'playground',
      title: 'Playground',
      description: 'Edit C# shader declarations, inspect diagnostics and discovered entry points, and review generated backend code from the connected compiler.',
      bodyClass: 'playground',
      noFooter: true,
      styles: ['/css/playground.css'],
      scripts: ['/js/playground.js'],
      body: `
<div class="pg" id="pg">
  <div class="pg-loading" id="pg-loading" role="status" aria-live="polite" aria-busy="true">
    <div class="pg-loading-card">
      <span class="pg-loading-spinner" aria-hidden="true"></span>
      <div>
        <p class="pg-loading-title">Loading Playground</p>
        <p class="pg-loading-detail" id="pg-loading-detail">Preparing the compiler…</p>
      </div>
    </div>
  </div>
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
        <div class="pg-popover"><h2>Current availability</h2><p>The playground provides C# analysis, shader discovery, SPIR-V assembly, generated backend code, and a live WebGL2 preview for compatible vertex and fragment shaders. In the preview, the fields Time, Resolution and Mouse of a uniform buffer are filled in for you, and each sampler receives the image listed by the example.</p></div>
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
      <section class="pg-editor-diagnostics" id="pg-editor-diagnostics" aria-label="Diagnostics" aria-live="polite"></section>
    </section>

    <aside class="pg-inspector" id="pg-inspector" aria-label="Results inspector">
      <section class="pg-preview" aria-labelledby="pg-preview-title">
        <header class="pg-preview-header">
          <div>
            <span class="pg-eyebrow">WebGL2</span>
            <h2 id="pg-preview-title">Live preview</h2>
          </div>
        </header>
        <div class="pg-preview-surface">
          <canvas id="pg-preview-canvas" aria-label="Live shader preview"></canvas>
          <div class="pg-preview-message" id="pg-preview-message" role="status">Add compatible vertex and fragment entry points to start the preview.</div>
        </div>
        <p class="pg-preview-detail" id="pg-preview-detail">The preview updates automatically after you stop typing.</p>
      </section>

      <nav class="pg-output-nav" aria-label="Generated outputs">
        <div class="pg-output-cards" role="tablist" aria-label="Output format">
          <button class="pg-output-card" role="tab" type="button" data-tab="shaders" aria-selected="false"><span class="pg-output-card-symbol" aria-hidden="true">${icon('layers')}</span><span><strong>Shaders <i class="pg-count" id="pg-count-shaders"></i></strong><small>Entry points</small></span></button>
          <button class="pg-output-card" role="tab" type="button" data-tab="spirv" aria-selected="false"><span class="pg-output-card-symbol pg-output-card-symbol--logo" aria-hidden="true"><img src="/img/backends/spirv.svg" alt=""></span><span><strong>SPIR-V</strong><small>Assembly</small></span></button>
          <button class="pg-output-card" role="tab" type="button" data-tab="hlsl" aria-selected="false"><span class="pg-output-card-symbol" aria-hidden="true">${icon('layers')}</span><span><strong>HLSL</strong><small>DirectX</small></span></button>
          <button class="pg-output-card" role="tab" type="button" data-tab="glsl" aria-selected="false"><span class="pg-output-card-symbol pg-output-card-symbol--logo" aria-hidden="true"><img src="/img/backends/opengl.svg" alt=""></span><span><strong>GLSL</strong><small>OpenGL</small></span></button>
          <button class="pg-output-card" role="tab" type="button" data-tab="gles" aria-selected="false"><span class="pg-output-card-symbol pg-output-card-symbol--logo" aria-hidden="true"><img src="/img/backends/webgl.svg" alt=""></span><span><strong>GLSL ES</strong><small>WebGL</small></span></button>
          <button class="pg-output-card" role="tab" type="button" data-tab="msl" aria-selected="false"><span class="pg-output-card-symbol" aria-hidden="true">${icon('box')}</span><span><strong>MSL</strong><small>Metal</small></span></button>
          <button class="pg-output-card" role="tab" type="button" data-tab="cpp" aria-selected="false"><span class="pg-output-card-symbol" aria-hidden="true">${icon('cpu')}</span><span><strong>C++</strong><small>CPU</small></span></button>
          <button class="pg-output-card" role="tab" type="button" data-tab="image" aria-selected="false" hidden><span><strong>Input image</strong></span></button>
        </div>
      </nav>
      <div class="pg-panels">
        <div class="pg-panel" data-panel="shaders" role="tabpanel" hidden></div>
        <div class="pg-panel" data-panel="spirv" role="tabpanel" hidden></div>
        <div class="pg-panel" data-panel="hlsl" role="tabpanel" hidden></div>
        <div class="pg-panel" data-panel="glsl" role="tabpanel" hidden></div>
        <div class="pg-panel" data-panel="gles" role="tabpanel" hidden></div>
        <div class="pg-panel" data-panel="msl" role="tabpanel" hidden></div>
        <div class="pg-panel" data-panel="cpp" role="tabpanel" hidden></div>
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
  <footer class="pg-statusbar"><span class="pg-status sr-only" id="pg-status" role="status" data-state="off"></span><span class="pg-shortcut">Ctrl / ⌘ Enter <span>to compile</span></span></footer>
</div>
<script type="application/json" id="pg-examples">${JSON.stringify(examples).replace(/</g, '\\u003c')}</script>
<noscript><p style="padding:24px">The playground needs JavaScript.</p></noscript>`,
    },
  ];
}

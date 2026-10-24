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

  return [
    {
      path: '/playground/',
      section: 'playground',
      title: 'Playground',
      description: 'Edit C# shader declarations and inspect C# diagnostics and discovered entry points. IR and SPIR-V output are not yet implemented in the playground.',
      bodyClass: 'playground',
      noFooter: true,
      scripts: ['/js/playground.js'],
      body: `
<div class="pg" id="pg">
  <div class="pg-bar">
    <div class="pg-group">
      <label class="pg-select"><span>Example</span>
        <select id="pg-example" aria-label="Example">${examples.map((e) => `<option value="${e.id}">${e.name}</option>`).join('')}</select>
      </label>
    </div>
    <div class="pg-group pg-group--end">
      __LANGSWITCH__
      <span class="pg-status" id="pg-status" role="status" data-state="off"></span>
      <button class="pg-btn" type="button" id="pg-share" title="Copy a link to this code">${icon('external')}<span>Share</span></button>
      <button class="pg-btn pg-btn--primary" type="button" id="pg-run" title="Compile (Ctrl/⌘ Enter)">${icon('zap')}<span>Compile</span></button>
    </div>
  </div>

  <p class="pg-banner">The playground currently provides C# analysis and shader discovery. IR generation, SPIR-V output, and rendering are not available here yet.</p>
  <div class="pg-banner" id="pg-banner" hidden></div>

  <div class="pg-panes">
    <section class="pg-pane pg-editor" aria-label="Source code">
      <div class="pg-filebar">
        <div class="pg-files" id="pg-files" role="tablist" aria-label="Files"></div>
        <button class="pg-add" type="button" id="pg-add" aria-label="New file" title="New file">${icon('plus')}</button>
      </div>
      <div class="pg-editor-host" id="pg-editor"></div>
    </section>

    <section class="pg-pane pg-output" aria-label="Output">
      <div class="pg-tabs" role="tablist" aria-label="Output">
        <button role="tab" type="button" data-tab="diagnostics" aria-selected="true">Diagnostics <i class="pg-count" id="pg-count-diagnostics"></i></button>
        <button role="tab" type="button" data-tab="shaders" aria-selected="false">Shaders <i class="pg-count" id="pg-count-shaders"></i></button>
        <button role="tab" type="button" data-tab="ir" aria-selected="false" hidden>IR</button>
        <button role="tab" type="button" data-tab="spirv" aria-selected="false" hidden>SPIR-V</button>
        <button role="tab" type="button" data-tab="image" aria-selected="false" hidden>Input image</button>
      </div>
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
    </section>
  </div>
</div>
<script type="application/json" id="pg-examples">${JSON.stringify(examples).replace(/</g, '\\u003c')}</script>
<noscript><p style="padding:24px">The playground needs JavaScript.</p></noscript>`,
    },
  ];
}

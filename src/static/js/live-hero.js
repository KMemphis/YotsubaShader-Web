// Home hero: the C# shader types itself, runs (WebGL) beside its code, then two constants are edited. The visitor picks the file and the style (HLSL or GLSL); nothing changes by itself. Everything degrades to the finished C# and a still gradient.
(() => {
  const root = document.querySelector('[data-live]');
  const dataEl = document.getElementById('live-data');
  if (!root || !dataEl) return;
  const { variants, files, gles } = JSON.parse(dataEl.textContent);
  const $ = (s, r = root) => r.querySelector(s);
  const code = $('.live-code code');
  const tabs = [...root.querySelectorAll('.live-files button')];
  const canvas = $('.live-canvas');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------ preview */
  // the GLSL ES that `yotsuba compile --target gles:300` wrote for the ocean, run as it is in WebGL2; only the two
  // constants are replaced by the values the demo edits, the same way the C# edit changes them for the compiler
  const gl = gles && canvas.getContext('webgl2', { antialias: false, alpha: false });
  const state = { drag: 0.38, depth: 1, dragTo: 0.38, depthTo: 1, time: 0 };
  let draw = () => {};
  let rebuild = () => {};
  if (gl) {
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const vs = sh(gl.VERTEX_SHADER, gles.vert);
    const ubo = gl.createBuffer();
    const buf = gl.createBuffer();
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    // position (clip space) and texture coordinate of the full-screen quad; v grows downwards, like the screen
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 0, 1, 1, -1, 1, 1, -1, 1, 0, 0, 1, 1, 1, 0]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);
    // std140 layout of OceanParams: Time, Resolution, CameraAngles, CameraPosition
    const params = new Float32Array(12);
    params.set([canvas.width, canvas.height], 2);
    params.set([0, -0.25], 4);
    params.set([0, 2, 0], 8);
    let prog = null, built = '';
    rebuild = () => {
      // the values are rounded to two decimals so the program is only rebuilt a few times while a number glides
      const key = `${state.drag.toFixed(2)}/${state.depth.toFixed(2)}`;
      if (key === built) return;
      const f = sh(gl.FRAGMENT_SHADER, gles.frag.replace(/@DRAG@/g, state.drag.toFixed(4)).replace(/@DEPTH@/g, state.depth.toFixed(4)));
      const p = gl.createProgram();
      gl.attachShader(p, vs); gl.attachShader(p, f);
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return;
      gl.uniformBlockBinding(p, gl.getUniformBlockIndex(p, 'OceanParams'), 0);
      if (prog) gl.deleteProgram(prog);
      prog = p; built = key;
      root.classList.add('has-gl');
    };
    rebuild();
    draw = () => {
      if (!prog) return;
      gl.useProgram(prog);
      params[0] = state.time;
      gl.bindBuffer(gl.UNIFORM_BUFFER, ubo);
      gl.bufferData(gl.UNIFORM_BUFFER, params, gl.DYNAMIC_DRAW);
      gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, ubo);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.bindVertexArray(vao);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
  }

  let visible = true, last = performance.now();
  const frame = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    // the constants glide to their new value, so the waves visibly change shape
    const k = 1 - Math.exp(-dt * 5);
    state.drag += (state.dragTo - state.drag) * k;
    state.depth += (state.depthTo - state.depth) * k;
    state.time += dt;
    if (visible && !document.hidden) { rebuild(); draw(); }
    requestAnimationFrame(frame);
  };
  if (root.classList.contains('has-gl')) {
    if (reduced) { state.time = 2; draw(); } else requestAnimationFrame(frame);
  }
  if ('IntersectionObserver' in window) new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(root);

  const caret = Object.assign(document.createElement('span'), { className: 'live-caret' });

  /* ------------------------------------------- files, styles and the C# source */
  // The code on screen is one of four files (two styles x two files). The constants the demo edits live in OceanShader.cs;
  // whatever file or style the visitor picks, it shows the current values of those two constants.
  const styleBtns = [...root.querySelectorAll('.live-style button')];
  let style = 'hlsl', current = 'cs', variant = 0;
  const f1 = (n) => `${Number.isInteger(n) ? n.toFixed(1) : n}f`;
  const values = { drag: f1(variants[0]?.drag ?? 0.38), depth: f1(variants[0]?.depth ?? 1) };

  let nodes = [], edits = {};
  let typed = Infinity;
  const total = () => nodes.reduce((s, n) => s + n.full.length, 0);
  function bindNodes() {
    nodes = [];
    const w = document.createTreeWalker(code, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) nodes.push({ node: n, full: n.nodeValue });
    edits = {};
    code.querySelectorAll('[data-edit]').forEach((el) => { edits[el.dataset.edit] = el; });
  }
  function applyCs() {
    let left = typed, lastNode = null;
    for (const n of nodes) {
      const take = Math.max(0, Math.min(n.full.length, left));
      n.node.nodeValue = n.full.slice(0, take);
      left -= take;
      if (take > 0) lastNode = n.node;
    }
    caret.remove();
    if (typed < total() && lastNode) lastNode.parentNode.insertBefore(caret, lastNode.nextSibling);
  }
  const setEdit = (key, text, flash) => {
    const el = edits[key];
    if (!el) return;
    el.firstChild.nodeValue = text;
    const n = nodes.find((x) => x.node === el.firstChild);
    if (n) n.full = text;
    if (flash) { el.classList.remove('is-edit'); void el.offsetWidth; el.classList.add('is-edit'); }
  };

  const show = (file, st = style) => {
    caret.remove();
    typed = Infinity; // picking a file or a style while it is being typed shows the finished code
    current = file; style = st;
    tabs.forEach((t) => { const on = t.dataset.tab === file; t.classList.toggle('is-active', on); t.setAttribute('aria-selected', on); });
    styleBtns.forEach((b) => { const on = b.dataset.style === st; b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', on); });
    code.innerHTML = files[st][file];
    if (file === 'cs') { bindNodes(); setEdit('drag', values.drag); setEdit('depth', values.depth); }
    root.classList.toggle('is-output', file !== 'cs');
    code.parentElement.scrollTop = 0;
    code.parentElement.classList.remove('is-flash'); void code.offsetWidth; code.parentElement.classList.add('is-flash');
  };
  tabs.forEach((t) => t.addEventListener('click', () => show(t.dataset.tab)));
  styleBtns.forEach((b) => b.addEventListener('click', () => show(current, b.dataset.style)));
  bindNodes();

  /* --------------------------------------------------------------- show */
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const awaitVisible = async () => { while (!visible || document.hidden) await sleep(250); };
  const wait = async (ms) => { await sleep(ms); await awaitVisible(); };

  // whoever scrolls the code is reading it: the demo stops moving it
  const box = code.parentElement;
  let touched = 0;
  for (const ev of ['wheel', 'touchstart', 'pointerdown', 'keydown']) box.addEventListener(ev, () => { touched = Date.now(); }, { passive: true });
  const reading = () => Date.now() - touched < 10000;

  // keeps the line being typed in view
  const follow = () => {
    if (reading()) return;
    const y = caret.offsetTop - box.clientHeight * 0.55;
    if (y > box.scrollTop) box.scrollTop = y;
  };

  async function type() {
    const n = total();
    // the whole file is typed in about 14 seconds: a few characters per tick, whatever its length
    const step = Math.max(1, Math.ceil(n / 800));
    typed = 0;
    for (; typed < n; typed += step) {
      applyCs();
      follow();
      await wait(16);
    }
    if (current === 'cs') { typed = Infinity; applyCs(); }
  }

  const KEYS = ['drag', 'depth', 'drag', 'depth'];
  async function edit(step) {
    variant = (variant + 1) % variants.length;
    const key = KEYS[step % KEYS.length];
    values[key] = f1(variants[variant][key]);
    state.dragTo = variants[variant].drag;
    state.depthTo = variants[variant].depth;
    setEdit(key, values[key], true);
    // brings the edited constant into view, unless the visitor is reading somewhere else or already sees it
    const el = edits[key];
    if (!el || reading()) return;
    const r = el.getBoundingClientRect(), b = box.getBoundingClientRect();
    if (r.top < b.top || r.bottom > b.bottom - 40) box.scrollTo({ top: Math.max(0, box.scrollTop + r.top - b.top - 60), behavior: 'smooth' });
  }

  async function run() {
    await wait(700);
    await type();
    await wait(1400);
    for (let step = 0; ; step++) {
      // the constants are in OceanShader.cs: the demo waits until that file is the one on screen
      while (current !== 'cs') await wait(400);
      await edit(step);
      await wait(4000);
    }
  }

  if (reduced || !variants.length) return;
  // start from an empty file, like the first keystroke, but only once the card is on screen
  typed = 0; applyCs();
  const start = () => run().catch(() => { typed = Infinity; applyCs(); });
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((e) => { if (e[0].isIntersecting) { io.disconnect(); start(); } });
    io.observe(root);
  } else start();
})();

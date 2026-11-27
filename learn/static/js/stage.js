// learn.yotsubashader.com — the listen "stage". Only on pages that carry #stage-data (stage/<section>/<page>.mjs).
// While the page is read aloud on a wide screen, the right half shows motion graphics that follow the narration.
// Everything on it is a function of audio.currentTime: pause, seek or a click on a word always shows the right frame.
//
// Timing comes from the text: `> [!SCENE] id` cues in the Markdown say where each scene starts (at the first spoken
// word after the cue), and `beats: { name: 'a phrase' }` in a scene are found among the spoken words of that scene,
// so the same scene fits the English and the Spanish audio.
(() => {
  const dataEl = document.getElementById('stage-data');
  if (!dataEl) return;
  const DATA = JSON.parse(dataEl.textContent);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const stage = $('#stage'), screen = $('#stage-screen'), dots = $('#stage-dots'), side = $('#sidebar'), scrim = $('#scrim');
  const bar = $('#stage-bar'), progress = $('#stage-progress');
  const wide = matchMedia('(min-width: 1100px)');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const FADE = 0.45; // seconds of cross-fade between scenes
  const fmt = new Intl.NumberFormat(DATA.lang);

  /* ------------------------------------------------------------------ helpers */
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const ease = (x) => 1 - Math.pow(1 - clamp(x), 3);
  const easeIO = (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  const prog = (t, a, d = 0.6) => (reduce.matches ? (t >= a ? 1 : 0) : clamp((t - a) / d));
  const lerp = (a, b, k) => a + (b - a) * k;
  const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/[^\p{L}\p{N}]+/gu, '');
  const DPR = () => Math.min(window.devicePixelRatio || 1, 2);
  /** keeps a canvas' pixel size equal to its CSS size; returns its CSS width and height */
  function fit(c, aspect) {
    const w = c.clientWidth || 600, hgt = aspect ? w / aspect : c.clientHeight || 400, d = DPR();
    if (c.width !== Math.round(w * d) || c.height !== Math.round(hgt * d)) { c.width = Math.round(w * d); c.height = Math.round(hgt * d); }
    return { w, h: hgt, d };
  }
  const C = { bg: '#14141c', bg2: '#1e1e2a', line: 'rgba(255,255,255,.12)', text: '#f2f2f7', text2: '#a0a0b4', accent: '#ff7ab2', cpu: '#ffb454', gpu: '#5ad1ff', ok: '#7fe3a8', bad: '#ff6b6b' };
  const rr = (g, x, y, w, hh, r) => { g.beginPath(); g.roundRect ? g.roundRect(x, y, w, hh, r) : g.rect(x, y, w, hh); };
  const sunset = (u, v) => { // the colour of a pixel in a little sunset, u,v in 0..1 (v = 0 at the top)
    const k = clamp(v);
    let r = lerp(255, 120, k), g = lerp(170, 40, k), b = lerp(90, 130, k);
    const dx = u - 0.5, dy = v - 0.62, d = Math.sqrt(dx * dx * 1.8 + dy * dy);
    if (d < 0.14) { r = 255; g = 236; b = 170; }
    if (v > 0.66) { r = lerp(40, 20, (v - 0.66) * 3); g = lerp(30, 18, (v - 0.66) * 3); b = lerp(70, 40, (v - 0.66) * 3); }
    return [r | 0, g | 0, b | 0];
  };

  /* ------------------------------------------------------------- widgets */
  // Every item kind returns { el, render(t) } where t is seconds since the scene started.
  const KINDS = {};
  const textKind = (cls) => (spec) => ({ el: h('div', cls + (spec.cls ? ' ' + spec.cls : ''), spec.text ?? '') });
  KINDS.kicker = textKind('s-kicker');
  KINDS.title = textKind('s-title');
  KINDS.text = textKind('s-text');
  KINDS.word = textKind('s-word');
  KINDS.html = (spec) => ({ el: h('div', spec.cls || '', spec.html || '') });
  KINDS.arrow = (spec) => ({ el: h('div', 's-arrow' + (spec.down ? ' down' : '')) });
  KINDS.box = (spec) => ({ el: h('div', 's-box ' + (spec.cls || ''), (spec.text || '') + (spec.sub ? `<small>${spec.sub}</small>` : '')) });
  KINDS.big = (spec, api) => {
    const el = h('div', 's-big ' + (spec.cls || ''), spec.text ?? '');
    if (!spec.count) return { el };
    const c = spec.count, a = api.at(c.at ?? spec.at), d = c.dur ?? 1.6;
    const pre = c.prefix || '', post = c.suffix || '';
    let last = null;
    return { el, render(t) { const v = Math.round(lerp(c.from || 0, c.to, easeIO(prog(t, a, d)))); if (v !== last) { last = v; el.textContent = pre + fmt.format(v) + post; } } };
  };
  KINDS.img = (spec) => {
    const el = h('div', 's-img ' + (spec.cls || ''));
    const img = h('img'); img.src = spec.src; img.alt = ''; img.decoding = 'async'; el.append(img);
    if (spec.credit) el.append(h('div', 's-credit', spec.credit));
    return { el, render(t) { if (spec.kenburns) img.style.transform = `scale(${lerp(1.0, 1.08, clamp(t / 14))}) translateX(${lerp(0, -1.5, clamp(t / 14))}%)`; } };
  };
  KINDS.logo = (spec) => ({ el: h('div', 's-logo', `<img src="${spec.src}" alt="">${spec.text ? `<span>${spec.text}</span>` : ''}`) });

  /* code that types itself; hl / marks / tags light up lines at beats */
  KINDS.code = KINDS.term = (spec, api) => {
    const el = h('div', 's-code' + (spec.k === 'term' ? ' term' : '') + (spec.cls ? ' ' + spec.cls : ''));
    if (spec.code.title) el.append(h('div', 's-code-title', spec.code.title));
    const pre = h('pre'), lines = [];
    for (const html of spec.code.lines) {
      const ln = h('div', 'ln'), src = h('span', 'src', html);
      ln.append(src); pre.append(ln);
      const nodes = [];
      const w = document.createTreeWalker(src, NodeFilter.SHOW_TEXT);
      while (w.nextNode()) nodes.push([w.currentNode, w.currentNode.nodeValue]);
      lines.push({ ln, nodes, len: nodes.reduce((a, [, s]) => a + s.length, 0) });
    }
    el.append(pre);
    const total = lines.reduce((a, l) => a + l.len + 1, 0);
    const typeAt = spec.type == null ? null : api.at(spec.type);
    const cps = spec.cps || 38;
    const hl = (spec.hl || []).map((x) => ({ a: api.at(x.at), b: x.until != null ? api.at(x.until) : Infinity, lines: new Set(x.lines) }));
    const dim = (spec.dim || []).map((x) => ({ a: api.at(x.at), b: x.until != null ? api.at(x.until) : Infinity, lines: new Set(x.lines) }));
    const marks = (spec.marks || []).map((x) => { const m = h('span', 's-mark ' + (x.kind || 'x'), x.kind === 'check' ? '✓' : '✗'); m.style.opacity = 0; lines[x.line]?.ln.append(m); return { a: api.at(x.at), m }; });
    const tags = (spec.tags || []).map((x) => { const m = h('span', 's-tag', x.text); m.style.opacity = 0; lines[x.line]?.ln.append(m); return { a: api.at(x.at), m }; });
    let lastN = -1;
    return {
      el,
      render(t) {
        const n = typeAt == null || reduce.matches ? total : Math.floor(Math.max(0, t - typeAt) * cps);
        if (n !== lastN) {
          lastN = n;
          let left = n;
          for (const l of lines) {
            let r = left;
            for (const [node, s] of l.nodes) { const k = clamp(r, 0, s.length); if (node.nodeValue.length !== k) node.nodeValue = s.slice(0, k); r -= s.length; }
            l.ln.classList.toggle('cur', left >= 0 && left <= l.len && n < total);
            left -= l.len + 1;
          }
        }
        lines.forEach((l, i) => {
          l.ln.classList.toggle('hl', hl.some((x) => t >= x.a && t < x.b && x.lines.has(i)));
          l.ln.classList.toggle('dim', dim.some((x) => t >= x.a && t < x.b && !x.lines.has(i)));
        });
        for (const m of [...marks, ...tags]) { const p = prog(t, m.a, 0.35); m.m.style.opacity = p; m.m.style.transform = `translateY(-50%) scale(${lerp(1.6, 1, ease(p))})`; }
      },
    };
  };

  /* a row or a slot (items on top of each other) */
  KINDS.row = (spec, api) => group('s-row', spec, api);
  KINDS.slot = (spec, api) => group('s-slot', spec, api);
  function group(cls, spec, api) {
    const el = h('div', cls + (spec.cls ? ' ' + spec.cls : ''));
    const kids = (spec.items || []).map((s) => item(s, { ...api, world: false }));
    kids.forEach((k) => el.append(k.el));
    return { el, render(t) { kids.forEach((k) => k.render(t)); } };
  }

  /* live shaders: a GLSL body `vec4 shade(vec2 uv, float t)`; modes switch at beats */
  KINDS.shader = (spec, api) => {
    const el = h('div', 's-shader' + (spec.cls ? ' ' + spec.cls : ''));
    const cv = h('canvas'); el.append(cv);
    const modes = (spec.modes || [{ frag: spec.frag }]).map((m) => ({ ...m, a: api.at(m.at) }));
    let gl = null, failed = false, progs = [], buf = null, last = -1;
    const VS = '#version 300 es\nin vec2 p;void main(){gl_Position=vec4(p,0,1);}';
    const FS = (body) => `#version 300 es\nprecision highp float;uniform vec2 uRes;uniform float uTime;out vec4 o;\n${spec.lib || ''}\nvec4 shade(vec2 uv,float t){${body}}\nvoid main(){o=shade(gl_FragCoord.xy/uRes,uTime);}`;
    const compile = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    function init() {
      try {
        gl = cv.getContext('webgl2', { antialias: false, premultipliedAlpha: false });
        if (!gl) throw new Error('no webgl2');
        progs = modes.map((m) => {
          const p = gl.createProgram();
          gl.attachShader(p, compile(gl.VERTEX_SHADER, VS)); gl.attachShader(p, compile(gl.FRAGMENT_SHADER, FS(m.frag)));
          gl.linkProgram(p);
          if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
          return { p, res: gl.getUniformLocation(p, 'uRes'), time: gl.getUniformLocation(p, 'uTime'), pos: gl.getAttribLocation(p, 'p') };
        });
        buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      } catch (e) { failed = true; console.warn('stage shader:', e.message); el.classList.add('no-gl'); if (spec.fallback) { cv.replaceWith(Object.assign(h('img'), { src: spec.fallback, alt: '' })); } }
    }
    return {
      el,
      render(t) {
        if (failed) return;
        if (!gl) init();
        if (failed) return;
        let i = 0; modes.forEach((m, n) => { if (t >= m.a) i = n; });
        const time = reduce.matches ? 2 : Math.max(0, t - modes[i].a);
        if (time === last && i === last) return;
        const { w, h: hh, d } = fit(cv, spec.aspect || 1.6);
        const P = progs[i];
        gl.viewport(0, 0, Math.round(w * d), Math.round(hh * d));
        gl.useProgram(P.p);
        gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.enableVertexAttribArray(P.pos); gl.vertexAttribPointer(P.pos, 2, gl.FLOAT, false, 0, 0);
        gl.uniform2f(P.res, Math.round(w * d), Math.round(hh * d)); gl.uniform1f(P.time, time);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      },
    };
  };

  /* a stack of layers (an app on an operating system on hardware): layers can leave, fail or change their name */
  KINDS.stack = (spec, api) => {
    const el = h('div', 's-stack');
    const layers = spec.layers.map((L) => {
      const e = h('div', 's-layer', `<span class="a">${L.text}</span>${L.alt ? `<span class="b" style="position:absolute;inset:0;display:grid;place-items:center;opacity:0">${L.alt.text}</span>` : ''}`);
      e.style.borderColor = L.color || ''; e.style.color = L.color || '';
      const m = h('span', 's-mark x', '✗'); m.style.cssText = 'opacity:0;right:-1.6em'; e.append(m);
      el.append(e);
      return { e, m, L, remove: L.remove != null ? api.at(L.remove) : null, fail: L.fail != null ? api.at(L.fail) : null, alt: L.alt ? api.at(L.alt.at) : null };
    });
    return {
      el,
      render(t) {
        for (const x of layers) {
          if (x.remove != null) { const p = ease(prog(t, x.remove, 0.7)); x.e.style.opacity = 1 - p; x.e.style.transform = `translateX(${p * 60}%)`; x.e.style.marginTop = x.e.style.marginBottom = `${-p * 2.4}cqh`; x.e.style.maxHeight = p > 0.99 ? '0px' : ''; x.e.style.padding = p > 0.99 ? '0' : ''; x.e.style.borderWidth = p > 0.99 ? '0' : ''; }
          if (x.fail != null) {
            const p = prog(t, x.fail, 0.5), shake = p > 0 && p < 1 ? Math.sin(t * 60) * (1 - p) * 8 : 0;
            x.e.style.transform = `translateX(${shake}px) rotate(${ease(p) * -2}deg)`;
            x.e.style.borderColor = p > 0 ? C.bad : x.L.color || ''; x.m.style.opacity = p;
          }
          if (x.alt != null) { const p = ease(prog(t, x.alt, 0.6)); x.e.querySelector('.a').style.opacity = 1 - p; x.e.querySelector('.b').style.opacity = p; if (x.L.alt.color && p > 0.5) { x.e.style.color = x.L.alt.color; if (!(x.fail != null && t >= x.fail)) x.e.style.borderColor = x.L.alt.color; } }
        }
      },
    };
  };

  /* CPU: 10 big cores; GPU: a field of thousands of small ones */
  KINDS.cores = (spec, api) => {
    const el = h('div', 's-row'); el.style.cssText = 'width:100%;gap:5cqw;align-items:flex-start;flex-wrap:nowrap';
    const left = h('div'), right = h('div');
    left.style.cssText = right.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;gap:2cqh;min-width:0';
    left.innerHTML = `<div class="s-word s-cpu">CPU</div>`;
    right.innerHTML = `<div class="s-word s-gpu">GPU</div>`;
    const grid = h('div'); grid.style.cssText = 'display:grid;grid-template-columns:repeat(5,1fr);gap:1.2cqw;width:100%;max-width:34cqw';
    const cores = Array.from({ length: 10 }, () => { const c = h('div'); c.style.cssText = `aspect-ratio:1;border-radius:22%;border:2px solid ${C.cpu};background:#3a2a14`; grid.append(c); return c; });
    left.append(grid);
    const cl = h('div', 's-text', spec.cpuText || ''); left.append(cl);
    const cv = h('canvas'); cv.style.cssText = 'width:100%;max-width:38cqw;display:block';
    right.append(cv);
    const gl = h('div', 's-text', spec.gpuText || ''); right.append(gl);
    el.append(left, right);
    const aCpu = api.at(spec.cpu), aGpu = api.at(spec.gpu);
    const COLS = 44, ROWS = 26;
    return {
      el,
      render(t) {
        cores.forEach((c, i) => {
          const p = prog(t, aCpu + i * 0.14, 0.4);
          const pulse = p >= 1 && !reduce.matches ? 0.75 + 0.25 * Math.sin(t * 3 + i * 0.7) : 1;
          c.style.opacity = p * pulse; c.style.transform = `scale(${lerp(0.4, 1, ease(p))})`;
        });
        cl.style.opacity = prog(t, aCpu + 1.4, 0.5);
        gl.style.opacity = prog(t, aGpu + 1.6, 0.5);
        right.firstElementChild.style.opacity = prog(t, aGpu - 0.2, 0.5);
        const { w, h: hh, d } = fit(cv, COLS / ROWS);
        const g = cv.getContext('2d'); g.setTransform(d, 0, 0, d, 0, 0); g.clearRect(0, 0, w, hh);
        const cw = w / COLS, ch = hh / ROWS;
        for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
          const on = prog(t, aGpu + ((x + y) / (COLS + ROWS)) * 1.4, 0.25);
          if (!on) continue;
          const wave = reduce.matches ? 1 : 0.55 + 0.45 * Math.sin(t * 4 - (x + y) * 0.35);
          g.globalAlpha = on * wave; g.fillStyle = C.gpu;
          g.fillRect(x * cw + cw * 0.14, y * ch + ch * 0.14, cw * 0.72, ch * 0.72);
        }
        g.globalAlpha = 1;
      },
    };
  };

  /* an array processed by a `for` (one index after another) or by Parallel.For (all at once) */
  KINDS.array = (spec, api) => {
    const el = h('div', 's-array');
    const vals = spec.values || [1, 2, 3, 4, 5];
    const cells = vals.map((v, i) => { const c = h('div', 's-cell', `<small>[${i}]</small><b>${v}</b>`); const th = h('i', 's-thread'); c.append(th); el.append(c); return { c, b: c.querySelector('b'), th, v }; });
    const a = api.at(spec.run), step = spec.step || 0.8, n = vals.length;
    return {
      el,
      render(t) {
        const r = t - a;
        if (r < 0) { cells.forEach((x) => { x.b.textContent = x.v; x.c.className = 's-cell'; x.th.style.height = '0'; }); return; }
        if (spec.mode === 'parallel') {
          const cyc = 3.2, k = reduce.matches ? 1.5 : r % cyc;
          cells.forEach((x) => {
            const grow = clamp(k / 0.6);
            x.th.style.height = k < 2.4 ? `${grow * 7}cqh` : '0';
            x.c.className = 's-cell' + (k >= 0.6 && k < 2.6 ? ' done' : k < 0.6 ? ' now' : '');
            x.b.textContent = k >= 0.6 && k < 2.6 ? x.v * 2 : x.v;
          });
        } else {
          const cyc = n * step + 1.6, k = reduce.matches ? n * step : r % cyc, i = Math.floor(k / step);
          cells.forEach((x, j) => {
            x.th.style.height = '0';
            x.c.className = 's-cell' + (j < i ? ' done' : j === i ? ' now' : '');
            x.b.textContent = j < i || (j === i && k - i * step > step * 0.5) ? x.v * 2 : x.v;
          });
        }
      },
    };
  };

  /* a big grid of cells that all work at the same time (about 1000 threads) */
  KINDS.grid = (spec, api) => {
    const el = h('div', 's-canvas'); const cv = h('canvas'); el.append(cv);
    const COLS = spec.cols || 40, ROWS = spec.rows || 25, a = api.at(spec.at);
    return {
      el,
      render(t) {
        const { w, h: hh, d } = fit(cv, COLS / ROWS * 1.0);
        const g = cv.getContext('2d'); g.setTransform(d, 0, 0, d, 0, 0); g.clearRect(0, 0, w, hh);
        const cw = w / COLS, ch = hh / ROWS, r = t - a, cyc = 1.8, k = reduce.matches ? 1 : (r % cyc) / cyc;
        const lit = k < 0.55 ? ease(k / 0.25) : 1 - ease((k - 0.55) / 0.45);
        for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
          g.fillStyle = C.bg2; g.fillRect(x * cw + 1, y * ch + 1, cw - 2, ch - 2);
          g.globalAlpha = lit; g.fillStyle = spec.color || C.ok; g.fillRect(x * cw + 1, y * ch + 1, cw - 2, ch - 2); g.globalAlpha = 1;
        }
      },
    };
  };

  /* a screen made of pixels: it zooms in until the grid shows */
  KINDS.pixels = (spec, api) => {
    const el = h('div', 's-canvas'); const cv = h('canvas'); el.append(cv);
    const W = 192, H = 108, off = document.createElement('canvas'); off.width = W; off.height = H;
    const og = off.getContext('2d'), img = og.createImageData(W, H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const [r, g, b] = sunset(x / W, y / H); const i = (y * W + x) * 4; img.data[i] = r; img.data[i + 1] = g; img.data[i + 2] = b; img.data[i + 3] = 255; }
    og.putImageData(img, 0, 0);
    const a = api.at(spec.zoom), mark = spec.index != null ? api.at(spec.index) : null;
    return {
      el,
      render(t) {
        const { w, h: hh, d } = fit(cv, 16 / 9);
        const g = cv.getContext('2d'); g.setTransform(d, 0, 0, d, 0, 0);
        g.fillStyle = C.bg; g.fillRect(0, 0, w, hh);
        const z = Math.pow(10, easeIO(prog(t, a, 3.2)));
        const cell = (w / W) * z, cx = w / 2, cy = hh / 2, fx = 0.6 * W, fy = 0.52 * H; // zoom towards the edge of the sun: several colours
        g.imageSmoothingEnabled = false;
        g.save(); rr(g, 0, 0, w, hh, 14); g.clip();
        g.drawImage(off, cx - fx * cell, cy - fy * cell, W * cell, H * cell);
        if (cell > 5) { // the gaps between pixels
          g.strokeStyle = C.bg; g.lineWidth = Math.min(3, cell * 0.08) * clamp((cell - 5) / 10);
          g.beginPath();
          const x0 = cx - fx * cell, y0 = cy - fy * cell;
          for (let x = Math.max(0, Math.floor(-x0 / cell)); x <= Math.min(W, Math.ceil((w - x0) / cell)); x++) { g.moveTo(x0 + x * cell, 0); g.lineTo(x0 + x * cell, hh); }
          for (let y = Math.max(0, Math.floor(-y0 / cell)); y <= Math.min(H, Math.ceil((hh - y0) / cell)); y++) { g.moveTo(0, y0 + y * cell); g.lineTo(w, y0 + y * cell); }
          g.stroke();
        }
        if (mark != null && cell > 20) { // number some pixels like the indexes of an array
          const p = prog(t, mark, 0.6);
          g.globalAlpha = p; g.fillStyle = 'rgba(0,0,0,.55)'; g.font = `600 ${Math.min(14, cell * 0.28)}px ui-monospace, monospace`; g.textAlign = 'center'; g.textBaseline = 'middle';
          const x0 = cx - fx * cell, y0 = cy - fy * cell;
          for (let y = Math.floor(-y0 / cell); y <= (hh - y0) / cell; y++) for (let x = Math.floor(-x0 / cell); x <= (w - x0) / cell; x++) {
            if (x < 0 || y < 0 || x >= W || y >= H) continue;
            g.fillText(String(y * W + x), x0 + (x + 0.5) * cell, y0 + (y + 0.5) * cell);
          }
          g.globalAlpha = 1;
        }
        g.restore();
      },
    };
  };

  /* pixels travel to the Fragment function and come back with a colour; then all of them at once */
  KINDS.fragment = (spec, api) => {
    const el = h('div', 's-canvas'); const cv = h('canvas'); el.append(cv);
    const a = api.at(spec.start ?? 0), all = api.at(spec.all), COLS = 8, ROWS = 6;
    const demo = [[1, 1], [5, 2], [3, 4]], ONE = 1.6;
    const color = (x, y) => { const [r, g, b] = sunset((x + 0.5) / COLS, (y + 0.5) / ROWS); return `rgb(${r},${g},${b})`; };
    return {
      el,
      render(t) {
        const { w, h: hh, d } = fit(cv, 16 / 9);
        const g = cv.getContext('2d'); g.setTransform(d, 0, 0, d, 0, 0); g.clearRect(0, 0, w, hh);
        const gw = w * 0.46, cell = gw / COLS, gx = w * 0.04, gy = (hh - cell * ROWS) / 2;
        const bx = w * 0.64, by = hh * 0.34, bw = w * 0.32, bh = hh * 0.32;
        const filled = (x, y) => {
          const n = demo.findIndex(([px, py]) => px === x && py === y);
          if (n >= 0) return t >= a + n * ONE + ONE * 0.95;
          return t >= all + ((x + y) / (COLS + ROWS)) * 0.9;
        };
        for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
          rr(g, gx + x * cell + 2, gy + y * cell + 2, cell - 4, cell - 4, 5);
          g.fillStyle = filled(x, y) ? color(x, y) : C.bg2; g.fill();
          g.strokeStyle = C.line; g.lineWidth = 1; g.stroke();
        }
        const glow = demo.some((_, n) => { const k = (t - a - n * ONE) / ONE; return k > 0.35 && k < 0.6; }) || (t >= all && t < all + 1.2);
        rr(g, bx, by, bw, bh, 14); g.fillStyle = C.bg2; g.fill(); g.lineWidth = glow ? 3 : 1.5; g.strokeStyle = glow ? C.accent : C.line; g.stroke();
        g.fillStyle = C.accent; g.font = `700 ${Math.max(14, w * 0.032)}px -apple-system, system-ui, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText('Fragment', bx + bw / 2, by + bh * 0.4);
        g.fillStyle = C.text2; g.font = `500 ${Math.max(10, w * 0.019)}px ui-monospace, monospace`; g.fillText(spec.sig || 'pixel → color', bx + bw / 2, by + bh * 0.68);
        demo.forEach(([px, py], n) => {
          const k = (t - a - n * ONE) / ONE;
          if (k <= 0 || k >= 1) return;
          const sx = gx + (px + 0.5) * cell, sy = gy + (py + 0.5) * cell, ex = bx, ey = by + bh / 2;
          let x, y, col;
          if (k < 0.35) { const p = easeIO(k / 0.35); x = lerp(sx, ex, p); y = lerp(sy, ey, p); col = C.text; }
          else if (k < 0.6) return;
          else { const p = easeIO((k - 0.6) / 0.35); x = lerp(ex, sx, p); y = lerp(ey, sy, p); col = color(px, py); }
          g.beginPath(); g.arc(x, y, cell * 0.22, 0, Math.PI * 2); g.fillStyle = col; g.fill();
          g.setLineDash([4, 6]); g.strokeStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.moveTo(sx, sy); g.lineTo(ex, ey); g.stroke(); g.setLineDash([]);
        });
        if (t >= all && t < all + 1.2) { // many threads at once
          g.globalAlpha = 1 - clamp((t - all) / 1.2);
          for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) { g.strokeStyle = color(x, y); g.beginPath(); g.moveTo(gx + (x + 0.5) * cell, gy + (y + 0.5) * cell); g.lineTo(bx, by + bh / 2); g.stroke(); }
          g.globalAlpha = 1;
        }
      },
    };
  };

  /* the three stages, each with a small animation of what it runs over */
  KINDS.stages = (spec, api) => {
    const el = h('div', 's-stages');
    const rows = spec.rows.map((r) => {
      const e = h('div', 's-stage-row'); const cv = h('canvas'); const txt = h('div', '', `<b>${r.name}</b><span>${r.text}</span>`);
      e.append(cv, txt); el.append(e);
      return { e, cv, r, a: api.at(r.at) };
    });
    const draw = { // little loops, t in seconds
      vertex(g, w, hh, t) {
        const k = reduce.matches ? 1 : easeIO(clamp((t % 3) / 1.4)), pts = [[0.5, 0.15], [0.15, 0.85], [0.85, 0.85]], from = [[0.2, 0.3], [0.7, 0.5], [0.35, 0.7]];
        const P = pts.map((p, i) => [lerp(from[i][0], p[0], k) * w, lerp(from[i][1], p[1], k) * hh]);
        g.globalAlpha = clamp((k - 0.8) * 5); g.beginPath(); g.moveTo(...P[0]); g.lineTo(...P[1]); g.lineTo(...P[2]); g.closePath(); g.strokeStyle = C.accent; g.lineWidth = 2; g.stroke(); g.globalAlpha = 1;
        P.forEach((p) => { g.beginPath(); g.arc(p[0], p[1], 5, 0, Math.PI * 2); g.fillStyle = C.text; g.fill(); });
      },
      fragment(g, w, hh, t) {
        const cols = 8, rows = 5, cw = w / cols, ch = hh / rows, k = reduce.matches ? 99 : (t % 3) * 1.4;
        for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
          const on = k * 6 > x + y * 0.5; const [r, gg, b] = sunset((x + 0.5) / cols, (y + 0.5) / rows);
          g.fillStyle = on ? `rgb(${r},${gg},${b})` : C.bg; g.fillRect(x * cw + 1, y * ch + 1, cw - 2, ch - 2);
        }
      },
      compute(g, w, hh, t) {
        const n = 8, cw = w / n, k = reduce.matches ? 0.5 : (t % 2) / 2;
        for (let i = 0; i < n; i++) {
          g.fillStyle = k > 0.3 && k < 0.8 ? C.ok : C.bg; g.fillRect(i * cw + 2, hh * 0.45, cw - 4, cw - 4);
          g.strokeStyle = C.gpu; g.globalAlpha = k < 0.8 ? 1 : 0.2; g.beginPath(); g.moveTo(i * cw + cw / 2, hh * 0.05); g.lineTo(i * cw + cw / 2, lerp(hh * 0.05, hh * 0.42, clamp(k / 0.3))); g.stroke(); g.globalAlpha = 1;
        }
      },
    };
    return {
      el,
      render(t) {
        let cur = -1; rows.forEach((x, i) => { if (t >= x.a) cur = i; });
        rows.forEach((x, i) => {
          const p = prog(t, x.a, 0.5);
          x.e.style.opacity = lerp(0, i === cur ? 1 : 0.55, p); x.e.style.transform = `translateY(${(1 - ease(p)) * 16}px)`;
          x.e.classList.toggle('on', i === cur);
          if (!p) return;
          const { w, h: hh, d } = fit(x.cv, 1.6); const g = x.cv.getContext('2d'); g.setTransform(d, 0, 0, d, 0, 0); g.clearRect(0, 0, w, hh);
          draw[x.r.kind](g, w, hh, t - x.a);
        });
      },
    };
  };

  /* from three points to a coloured triangle: Vertex, the GPU fills it in, Fragment colours it */
  KINDS.pipeline = (spec, api) => {
    const el = h('div', 's-canvas'); const cv = h('canvas'); el.append(cv);
    const first = [api.at(spec.vertex), api.at(spec.raster), api.at(spec.fragment)];
    // `again`: the narration walks through the drawing a second time; from that beat on, the drawing starts over
    const again = spec.again ? { at: api.at(spec.again.at), beats: [api.at(spec.again.vertex), api.at(spec.again.raster), api.at(spec.again.fragment)] } : null;
    const labels = spec.labels || ['Vertex', 'GPU', 'Fragment'];
    const N = 22;
    const inside = (px, py, A, B, Cc) => { const s = (P, Q, R) => (P[0] - R[0]) * (Q[1] - R[1]) - (Q[0] - R[0]) * (P[1] - R[1]); const d1 = s([px, py], A, B), d2 = s([px, py], B, Cc), d3 = s([px, py], Cc, A); return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0)); };
    return {
      el,
      render(t) {
        const { w, h: hh, d } = fit(cv, 16 / 10);
        const g = cv.getContext('2d'); g.setTransform(d, 0, 0, d, 0, 0); g.clearRect(0, 0, w, hh);
        const [aV, aR, aF] = again && t >= again.at ? again.beats : first;
        // step labels
        const step = t >= aF ? 2 : t >= aR ? 1 : t >= aV ? 0 : -1;
        g.font = `700 ${Math.max(12, w * 0.028)}px -apple-system, system-ui, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
        labels.forEach((L, i) => { g.fillStyle = i === step ? C.accent : i < step ? C.text : 'rgba(255,255,255,.28)'; g.fillText(L, w * (0.2 + i * 0.3), hh * 0.07); if (i < 2) { g.fillStyle = 'rgba(255,255,255,.25)'; g.fillText('→', w * (0.35 + i * 0.3), hh * 0.07); } });
        const area = { x: w * 0.18, y: hh * 0.16, w: w * 0.64, h: hh * 0.8 };
        const cell = Math.min(area.w, area.h) / N, ox = w / 2 - (cell * N) / 2, oy = area.y;
        const A = [0.5, 0.06], B = [0.08, 0.94], Cc = [0.92, 0.94];
        const from = [[0.12, 0.2], [0.45, 0.6], [0.82, 0.35]];
        const kv = easeIO(prog(t, aV, 1.2));
        const P = [A, B, Cc].map((p, i) => [ox + lerp(from[i][0], p[0], kv) * cell * N, oy + lerp(from[i][1], p[1], kv) * cell * N]);
        const kr = prog(t, aR, 1.6), kf = prog(t, aF, 1.4);
        // faint pixel grid once the GPU looks for pixels
        if (kr > 0) {
          for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
            const cx = ox + (x + 0.5) * cell, cy = oy + (y + 0.5) * cell;
            const inTri = inside(cx, cy, P[0], P[1], P[2]);
            g.globalAlpha = 0.5 * kr; g.strokeStyle = 'rgba(255,255,255,.08)'; g.strokeRect(ox + x * cell, oy + y * cell, cell, cell); g.globalAlpha = 1;
            if (!inTri) continue;
            const order = y / N; // scanlines from top to bottom
            const on = kr * 1.15 > order;
            if (!on) continue;
            const colored = kf * 1.2 > (x + y) / (2 * N);
            if (colored) { const [r, gg, b] = sunset(x / N, y / N); g.fillStyle = `rgb(${r},${gg},${b})`; }
            else g.fillStyle = 'rgba(255,255,255,.22)';
            g.fillRect(ox + x * cell + 1, oy + y * cell + 1, cell - 2, cell - 2);
          }
        }
        // edges and points
        if (kv > 0.6) { g.globalAlpha = clamp((kv - 0.6) * 2.5); g.beginPath(); g.moveTo(...P[0]); g.lineTo(...P[1]); g.lineTo(...P[2]); g.closePath(); g.strokeStyle = C.accent; g.lineWidth = 2; g.stroke(); g.globalAlpha = 1; }
        P.forEach((p) => { g.beginPath(); g.arc(p[0], p[1], Math.max(5, w * 0.009), 0, Math.PI * 2); g.fillStyle = C.text; g.fill(); });
      },
    };
  };

  /* a canvas widget: draw(g, w, h, t) on a canvas of the given aspect */
  const canvasKind = (aspect, setup) => (spec, api) => {
    const el = h('div', 's-canvas'); const cv = h('canvas'); el.append(cv);
    if (spec.width) el.style.width = `min(100%, ${spec.width}cqw)`;
    const draw = setup(spec, api);
    return { el, render(t) { const { w, h: hh, d } = fit(cv, spec.aspect || aspect); const g = cv.getContext('2d'); g.setTransform(d, 0, 0, d, 0, 0); g.clearRect(0, 0, w, hh); draw(g, w, hh, t); } };
  };
  const font = (g, w, k, weight = 600, mono = false) => { g.font = `${weight} ${Math.max(11, w * k)}px ${mono ? 'ui-monospace, SFMono-Regular, Menlo, monospace' : '-apple-system, system-ui, sans-serif'}`; };
  const dot = (g, x, y, r, col) => { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = col; g.fill(); };
  const at = (api, v, dflt = Infinity) => (v == null ? dflt : api.at(v));
  const RGB3 = [[1, 0.23, 0.23], [0.2, 0.84, 0.36], [0.22, 0.5, 1]];
  const heat = (k) => { k = clamp(k); return [lerp(0.2, 1, k), lerp(0.55, 0.3, Math.abs(k - 0.5) * 2) * (k < 0.5 ? 1 : 0.8), lerp(1, 0.15, k)]; };
  const css = ([r, g, b], a = 1) => `rgba(${(r * 255) | 0},${(g * 255) | 0},${(b * 255) | 0},${a})`;

  /* a triangle: corners appear, edges, then the GPU "spreads" the corner values over every pixel; probes read one pixel */
  KINDS.tri = canvasKind(4 / 3, (spec, api) => {
    const cA = (spec.corners || [0, 0, 0]).map((x) => api.at(x)), aE = at(api, spec.edges, cA[2] + 0.4), aF = at(api, spec.fill);
    const probes = (spec.probes || []).map((p) => ({ ...p, a: api.at(p.at) }));
    const vals = spec.values; // heat mode: one number per corner
    const colOf = (wts) => vals ? heat((wts[0] * vals[0] + wts[1] * vals[1] + wts[2] * vals[2] - spec.min) / (spec.max - spec.min)) : [0, 1, 2].map((c) => wts[0] * RGB3[0][c] + wts[1] * RGB3[1][c] + wts[2] * RGB3[2][c]);
    const cornerCol = (i) => colOf([0, 1, 2].map((j) => (j === i ? 1 : 0)));
    const off = document.createElement('canvas'); off.width = 240; off.height = 180;
    const P = [[0.5, 0.08], [0.1, 0.92], [0.9, 0.92]];
    { // the filled triangle, computed once
      const o = off.getContext('2d'), img = o.createImageData(240, 180);
      for (let y = 0; y < 180; y++) for (let x = 0; x < 240; x++) {
        const px = (x + 0.5) / 240, py = (y + 0.5) / 180;
        const [A, B, Cc] = P, den = (B[1] - Cc[1]) * (A[0] - Cc[0]) + (Cc[0] - B[0]) * (A[1] - Cc[1]);
        const w0 = ((B[1] - Cc[1]) * (px - Cc[0]) + (Cc[0] - B[0]) * (py - Cc[1])) / den, w1 = ((Cc[1] - A[1]) * (px - Cc[0]) + (A[0] - Cc[0]) * (py - Cc[1])) / den, w2 = 1 - w0 - w1;
        if (w0 < 0 || w1 < 0 || w2 < 0) continue;
        const c = colOf([w0, w1, w2]), i = (y * 240 + x) * 4;
        img.data[i] = c[0] * 255; img.data[i + 1] = c[1] * 255; img.data[i + 2] = c[2] * 255; img.data[i + 3] = 255;
      }
      o.putImageData(img, 0, 0);
    }
    return (g, w, hh, t) => {
      const X = (u) => w * (0.1 + u * 0.8), Y = (v) => hh * (0.06 + v * 0.88);
      const kf = prog(t, aF, 1.6);
      if (kf > 0) { // fills from top to bottom, like the GPU going through the rows
        g.save(); g.beginPath(); g.rect(0, 0, w, Y(lerp(0, 1.02, easeIO(kf)))); g.clip();
        g.imageSmoothingEnabled = true; g.drawImage(off, X(0), Y(0), w * 0.8, hh * 0.88); g.restore();
      }
      const ke = prog(t, aE, 0.8);
      if (ke > 0) {
        g.globalAlpha = ke; g.beginPath(); g.moveTo(X(P[0][0]), Y(P[0][1])); g.lineTo(X(P[1][0]), Y(P[1][1])); g.lineTo(X(P[2][0]), Y(P[2][1])); g.closePath();
        g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 1.5; g.stroke(); g.globalAlpha = 1;
      }
      P.forEach((p, i) => {
        const k = ease(prog(t, cA[i], 0.5)); if (!k) return;
        dot(g, X(p[0]), Y(p[1]), Math.max(6, w * 0.016) * k, css(cornerCol(i)));
        if (spec.labels?.[i]) { font(g, w, 0.03, 700, true); g.fillStyle = C.text; g.textAlign = i === 0 ? 'center' : i === 1 ? 'right' : 'left'; g.textBaseline = 'middle'; g.globalAlpha = k; g.fillText(spec.labels[i], X(p[0]) + (i === 0 ? 0 : i === 1 ? -16 : 16), Y(p[1]) + (i === 0 ? -2 : 0) - (i === 0 ? 18 : 0)); g.globalAlpha = 1; }
      });
      let shown = null; probes.forEach((p) => { if (t >= p.a) shown = p; });
      if (shown) {
        const k = ease(prog(t, shown.a, 0.5)), wts = shown.p, s = wts[0] + wts[1] + wts[2];
        const u = (wts[0] * P[0][0] + wts[1] * P[1][0] + wts[2] * P[2][0]) / s, v = (wts[0] * P[0][1] + wts[1] * P[1][1] + wts[2] * P[2][1]) / s;
        g.globalAlpha = k; g.beginPath(); g.arc(X(u), Y(v), Math.max(9, w * 0.022), 0, Math.PI * 2); g.lineWidth = 3; g.strokeStyle = '#fff'; g.stroke();
        const text = shown.label ?? (vals ? `${Math.round((wts[0] * vals[0] + wts[1] * vals[1] + wts[2] * vals[2]) / s)}${spec.unit || ''}` : wts.map((x, i) => `${'RGB'[i]} ${(x / s).toFixed(2)}`).join('  '));
        font(g, w, 0.028, 700, true); const tw = g.measureText(text).width + 20, bx = clamp(X(u) - tw / 2, 4, w - tw - 4), by = Y(v) + Math.max(16, w * 0.04);
        rr(g, bx, by, tw, Math.max(24, w * 0.05), 8); g.fillStyle = 'rgba(10,10,16,.85)'; g.fill();
        g.fillStyle = C.text; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(text, bx + 10, by + Math.max(12, w * 0.025)); g.globalAlpha = 1;
      }
    };
  });

  /* everything is triangles: a triangle, a rectangle (2) and a round shape (8) */
  KINDS.shapes = canvasKind(16 / 6.5, (spec, api) => {
    const a = [api.at(spec.tri), api.at(spec.rect), api.at(spec.round)], aV = at(api, spec.vertex), aS = at(api, spec.shared);
    return (g, w, hh, t) => {
      const cell = w / 3, R = Math.min(cell, hh) * 0.36, cy = hh * 0.48;
      const shapes = [
        (cx) => ({ tris: [[[cx, cy - R], [cx - R * 0.95, cy + R * 0.75], [cx + R * 0.95, cy + R * 0.75]]] }),
        (cx) => { const p = [[cx - R, cy - R * 0.7], [cx + R, cy - R * 0.7], [cx + R, cy + R * 0.7], [cx - R, cy + R * 0.7]]; return { tris: [[p[0], p[1], p[3]], [p[1], p[2], p[3]]], shared: [p[1], p[3]] }; },
        (cx) => { const pts = Array.from({ length: 8 }, (_, i) => [cx + Math.cos((i / 8) * Math.PI * 2) * R, cy + Math.sin((i / 8) * Math.PI * 2) * R]); return { tris: pts.map((p, i) => [[cx, cy], p, pts[(i + 1) % 8]]) }; },
      ];
      shapes.forEach((mk, n) => {
        const k = prog(t, a[n], 0.8); if (!k) return;
        const s = mk(cell * (n + 0.5));
        s.tris.forEach((tr, i) => {
          const kk = clamp(k * s.tris.length - i * 0.6 * (k < 1 ? 1 : 0)); if (kk <= 0) return;
          g.globalAlpha = kk; g.beginPath(); g.moveTo(...tr[0]); g.lineTo(...tr[1]); g.lineTo(...tr[2]); g.closePath();
          g.fillStyle = i % 2 ? 'rgba(255,122,178,.20)' : 'rgba(255,122,178,.32)'; g.fill(); g.strokeStyle = C.accent; g.lineWidth = 1.5; g.stroke();
        });
        g.globalAlpha = 1;
        const kv = prog(t, aV, 0.5), pulse = kv > 0 && !reduce.matches ? 1 + 0.35 * Math.sin(t * 6) * (1 - prog(t, aV + 2, 1)) : 1;
        const verts = [...new Map(s.tris.flat().map((p) => [p.map((x) => x.toFixed(1)).join(), p])).values()];
        verts.forEach((p) => dot(g, p[0], p[1], Math.max(3.5, w * 0.007) * (1 + kv * 0.4) * pulse, C.text));
        if (n === 1 && t >= aS) {
          const ks = prog(t, aS, 0.5); g.globalAlpha = ks;
          s.shared.forEach((p) => { g.beginPath(); g.arc(p[0], p[1], Math.max(10, w * 0.02), 0, Math.PI * 2); g.strokeStyle = C.gpu; g.lineWidth = 2.5; g.stroke(); });
          font(g, w, 0.03, 700); g.fillStyle = C.gpu; g.textAlign = 'center'; g.fillText(spec.sharedText || '4', cell * 1.5, hh * 0.95); g.globalAlpha = 1;
        }
        font(g, w, 0.026, 600); g.fillStyle = C.text2; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
        if (spec.captions?.[n] && n !== 1 || (n === 1 && spec.captions?.[1] && t < aS)) { g.globalAlpha = k; g.fillText(spec.captions[n], cell * (n + 0.5), hh * 0.95); g.globalAlpha = 1; }
      });
    };
  });

  /* the screen as the GPU sees it: -1..1 on both axes, Y up */
  KINDS.coords = canvasKind(16 / 10, (spec, api) => {
    const aR = api.at(spec.ruler), aC = at(api, spec.center), aE = at(api, spec.edges), aU = at(api, spec.up);
    const pts = (spec.points || []).map((p) => ({ ...p, a: api.at(p.at) }));
    const sizes = (spec.sizes || []).map((s) => ({ ...s, a: api.at(s.at) }));
    return (g, w, hh, t) => {
      let sw = 1, label = '';
      sizes.forEach((s) => { if (t >= s.a) { sw = s.w; label = s.label; } });
      const kr = prog(t, aR, 0.8);
      const W0 = w * 0.84 * lerp(sw, 1, kr), H0 = hh * 0.8, x0 = (w - W0) / 2, y0 = hh * 0.1;
      rr(g, x0, y0, W0, H0, 12); g.fillStyle = C.bg2; g.fill(); g.strokeStyle = C.line; g.lineWidth = 1.5; g.stroke();
      if (label && kr < 1) { font(g, w, 0.05, 750); g.fillStyle = C.text; g.globalAlpha = 1 - kr; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(label, w / 2, y0 + H0 / 2); g.globalAlpha = 1; }
      if (!kr) return;
      const X = (u) => x0 + ((u + 1) / 2) * W0, Y = (v) => y0 + ((1 - v) / 2) * H0;
      g.globalAlpha = kr; g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(X(-1), Y(0)); g.lineTo(X(1), Y(0)); g.moveTo(X(0), Y(-1)); g.lineTo(X(0), Y(1)); g.stroke();
      const ku = prog(t, aU, 0.5);
      if (ku) { // Y grows upward
        g.strokeStyle = C.accent; g.lineWidth = 3; const yy = lerp(Y(-0.6), Y(0.8), easeIO(clamp(((t - aU) % 2.4) / 1.4)));
        g.beginPath(); g.moveTo(X(0), Y(-0.6)); g.lineTo(X(0), yy); g.stroke();
        g.beginPath(); g.moveTo(X(0) - 9, yy + 12); g.lineTo(X(0), yy); g.lineTo(X(0) + 9, yy + 12); g.stroke();
        font(g, w, 0.04, 800); g.fillStyle = C.accent; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('Y ↑', X(0) + 14, Y(0.5));
      }
      font(g, w, 0.028, 700, true); g.textBaseline = 'middle';
      const tag = (txt, x, y, al, k, col = C.text) => { if (!k) return; g.globalAlpha = k; g.fillStyle = col; g.textAlign = al; g.fillText(txt, x, y); };
      tag('(0, 0)', X(0) + 8, Y(0) + 16, 'left', prog(t, aC, 0.4));
      const ke = prog(t, aE, 0.4);
      tag('-1', X(-1) + 8, Y(0) - 14, 'left', ke); tag('1', X(1) - 8, Y(0) - 14, 'right', ke);
      tag('1', X(0) + 8, Y(1) + 14, 'left', ke); tag('-1', X(0) + 8, Y(-1) - 14, 'left', ke);
      tag('(-1, 1)', X(-1) + 8, Y(1) + 14, 'left', ke, C.text2); tag('(1, -1)', X(1) - 8, Y(-1) - 14, 'right', ke, C.text2);
      pts.forEach((p) => { const k = ease(prog(t, p.a, 0.5)); if (!k) return; g.globalAlpha = k; dot(g, X(p.x), Y(p.y), Math.max(7, w * 0.014), p.color || C.accent); tag(`(${p.x}, ${p.y})`, X(p.x) + (p.x > 0.5 ? -16 : 16), Y(p.y), p.x > 0.5 ? 'right' : 'left', k); });
      g.globalAlpha = 1;
    };
  });

  /* the Vertex function, called once per vertex: each one goes in alone and comes out placed */
  KINDS.calls = canvasKind(16 / 8, (spec, api) => {
    const a = api.at(spec.start), ONE = spec.one || 1.8, n = 3, cols = [C.bad, C.ok, C.gpu];
    const labels = spec.labels || ['(0, 0.8)', '(-0.8, -0.7)', '(0.8, -0.7)'];
    const out = [[0.5, 0.12], [0.18, 0.88], [0.82, 0.88]];
    return (g, w, hh, t) => {
      const bx = w * 0.38, by = hh * 0.3, bw = w * 0.24, bh = hh * 0.4;
      const inX = w * 0.08, inY = (i) => hh * (0.22 + i * 0.28), oX = (u) => w * (0.7 + u * 0.26), oY = (v) => hh * (0.1 + v * 0.8);
      const k = (t - a) / ONE, cur = Math.floor(k), f = k - cur;
      const busy = cur >= 0 && cur < n && f < 0.75;
      rr(g, bx, by, bw, bh, 14); g.fillStyle = C.bg2; g.fill(); g.lineWidth = busy ? 3 : 1.5; g.strokeStyle = busy ? C.accent : C.line; g.stroke();
      font(g, w, 0.036, 750); g.fillStyle = C.accent; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Vertex', bx + bw / 2, by + bh / 2);
      if (cur >= 0 && cur < n) { font(g, w, 0.022, 600); g.fillStyle = C.text2; g.fillText(`${spec.callWord || 'call'} ${cur + 1} / ${n}`, bx + bw / 2, by + bh + 22); }
      for (let i = 0; i < n; i++) {
        const done = i < cur || (i === cur && f >= 0.75) || cur >= n;
        const active = i === cur;
        let x = inX, y = inY(i), alpha = cur >= 0 && cur < n && !active && !done ? 0.35 : 1;
        if (active && f < 0.35) { const p = easeIO(f / 0.35); x = lerp(inX, bx + bw / 2, p); y = lerp(inY(i), by + bh / 2, p); }
        else if (active && f < 0.75) { const p = easeIO((f - 0.35) / 0.4); x = lerp(bx + bw / 2, oX(out[i][0]), p); y = lerp(by + bh / 2, oY(out[i][1]), p); }
        else if (done) { x = oX(out[i][0]); y = oY(out[i][1]); }
        g.globalAlpha = alpha; dot(g, x, y, Math.max(7, w * 0.014), cols[i]);
        if (!active || f >= 0.75) { font(g, w, 0.022, 600, true); g.fillStyle = C.text2; g.textAlign = done ? 'center' : 'left'; g.fillText(labels[i], x + (done ? 0 : 16), y + (done ? (i ? 20 : -20) : 0)); }
        g.globalAlpha = 1;
      }
      if (cur >= n) { g.globalAlpha = clamp(f + cur - n); g.beginPath(); g.moveTo(oX(out[0][0]), oY(out[0][1])); g.lineTo(oX(out[1][0]), oY(out[1][1])); g.lineTo(oX(out[2][0]), oY(out[2][1])); g.closePath(); g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 1.5; g.stroke(); g.globalAlpha = 1; }
    };
  });

  /* the Vertex stage moves, rotates and scales a shape that was sent only once */
  KINDS.transform = canvasKind(16 / 9, (spec, api) => {
    const aM = api.at(spec.move), aR = api.at(spec.rotate), aS = api.at(spec.small);
    const ship = [[0, -1], [0.7, 0.8], [0, 0.4], [-0.7, 0.8]];
    const tris = [[0, 1, 2], [0, 2, 3]];
    return (g, w, hh, t) => {
      // a faint map
      g.strokeStyle = 'rgba(255,255,255,.06)'; g.lineWidth = 1;
      for (let x = 0; x < w; x += w / 16) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, hh); g.stroke(); }
      for (let y = 0; y < hh; y += w / 16) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
      const km = easeIO(prog(t, aM, 1.4)), kr = easeIO(prog(t, aR, 1.2)), ks = easeIO(prog(t, aS, 1.2));
      const cx = lerp(w * 0.25, w * 0.68, km), cy = lerp(hh * 0.62, hh * 0.38, km), ang = kr * Math.PI * 0.75 + (kr >= 1 && !reduce.matches ? Math.sin(t) * 0.08 : 0), sc = Math.min(w, hh) * 0.22 * lerp(1, 0.4, ks);
      const P = ship.map(([x, y]) => [cx + (x * Math.cos(ang) - y * Math.sin(ang)) * sc, cy + (x * Math.sin(ang) + y * Math.cos(ang)) * sc]);
      tris.forEach((tr, i) => { g.beginPath(); g.moveTo(...P[tr[0]]); g.lineTo(...P[tr[1]]); g.lineTo(...P[tr[2]]); g.closePath(); g.fillStyle = i ? 'rgba(90,209,255,.25)' : 'rgba(90,209,255,.4)'; g.fill(); g.strokeStyle = C.gpu; g.lineWidth = 1.5; g.stroke(); });
      P.forEach((p) => dot(g, p[0], p[1], Math.max(3.5, w * 0.007), C.text));
      font(g, w, 0.026, 700); g.textAlign = 'left'; g.textBaseline = 'top';
      (spec.words || []).forEach((wd, i) => { const k = [km, kr, ks][i]; g.fillStyle = k > 0 ? C.accent : 'rgba(255,255,255,.25)'; g.fillText(wd, w * 0.04 + i * w * 0.22, hh * 0.05); });
    };
  });

  /* a colour as four numbers from 0 to 1 */
  KINDS.rgba = (spec, api) => {
    const el = h('div', 's-row'); el.style.cssText = 'gap:4cqw;flex-wrap:nowrap';
    const sw = h('div'); sw.style.cssText = 'width:22cqw;aspect-ratio:1;border-radius:18px;border:1.5px solid rgba(255,255,255,.15);background-image:conic-gradient(#2a2a35 25%,#3a3a48 0 50%,#2a2a35 0 75%,#3a3a48 0);background-size:20px 20px;position:relative;overflow:hidden';
    const fill = h('div'); fill.style.cssText = 'position:absolute;inset:0'; sw.append(fill);
    const nums = h('div'); nums.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:1.4cqw;text-align:center';
    const names = spec.channels || ['R', 'G', 'B', 'A'];
    const cells = names.map((n, i) => { const c = h('div', 's-cell', `<small>${n}</small><b></b>`); c.style.color = [C.bad, C.ok, C.gpu, C.text][i]; nums.append(c); return c.querySelector('b'); });
    const label = h('div', 's-text'); label.style.cssText = 'grid-column:1/-1;margin-top:1.5cqh';
    nums.append(label); el.append(sw, nums);
    const a = api.at(spec.start), aO = at(api, spec.opacity), list = spec.colors;
    const f2 = (x) => (Math.round(x * 100) / 100).toString();
    return {
      el,
      render(t) {
        const opa = t >= aO;
        let c;
        if (!opa) { const i = clamp(Math.floor(Math.max(0, t - a) / (spec.every || 1.8)), 0, list.length - 1); c = list[reduce.matches ? 0 : Math.floor(Math.max(0, t - a) / (spec.every || 1.8)) % list.length] ?? list[i]; }
        else { const al = reduce.matches ? 0.5 : 0.6 + 0.4 * Math.cos((t - aO) * 2); c = { v: [1, 0.48, 0.7, Math.round(al * 100) / 100], name: spec.opacityName || '' }; }
        fill.style.background = `rgba(${c.v[0] * 255},${c.v[1] * 255},${c.v[2] * 255},${c.v[3]})`;
        c.v.forEach((x, i) => { const s = f2(x); if (cells[i].textContent !== s) cells[i].textContent = s; });
        if (label.textContent !== c.name) label.textContent = c.name;
      },
    };
  };

  /* the Uv square: corners labelled (0,0)..(1,1) with (0,0) at the top left, the spreading fills it, probes read one pixel */
  KINDS.uv = canvasKind(16 / 11, (spec, api) => {
    const aC = api.at(spec.corners), aF = at(api, spec.fill), aY = at(api, spec.y);
    const probes = (spec.probes || []).map((p) => ({ ...p, a: api.at(p.at) }));
    const N = 24, off = document.createElement('canvas'); off.width = N; off.height = N;
    { const o = off.getContext('2d'), img = o.createImageData(N, N); for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const i = (y * N + x) * 4; img.data[i] = (x / (N - 1)) * 255; img.data[i + 1] = (y / (N - 1)) * 200; img.data[i + 2] = 90; img.data[i + 3] = 255; } o.putImageData(img, 0, 0); }
    return (g, w, hh, t) => {
      const S = Math.min(w * 0.5, hh * 0.78), x0 = (w - S) / 2, y0 = (hh - S) / 2;
      const X = (u) => x0 + u * S, Y = (v) => y0 + v * S;
      const kf = prog(t, aF, 1.6), ky = prog(t, aY, 0.8);
      rr(g, x0, y0, S, S, 10); g.fillStyle = C.bg2; g.fill();
      if (kf > 0) { g.save(); rr(g, x0, y0, S, S, 10); g.clip(); g.globalAlpha = easeIO(kf) * (1 - ky); g.imageSmoothingEnabled = true; g.drawImage(off, x0, y0, S, S); g.globalAlpha = 1; g.restore(); }
      if (ky > 0) { // the gradient that Uv.Y gives: pink at the top, yellow at the bottom
        const gr = g.createLinearGradient(0, y0, 0, y0 + S); gr.addColorStop(0, 'rgb(255,64,115)'); gr.addColorStop(1, 'rgb(255,217,26)');
        g.save(); rr(g, x0, y0, S, S, 10); g.clip(); g.globalAlpha = easeIO(ky); g.fillStyle = gr; g.fillRect(x0, y0, S, S); g.globalAlpha = 1; g.restore();
      }
      rr(g, x0, y0, S, S, 10); g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1.5; g.stroke();
      const kc = prog(t, aC, 0.6);
      if (kc > 0) {
        font(g, w, 0.028, 700, true); g.textBaseline = 'middle'; g.globalAlpha = kc;
        [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([u, v], i) => {
          const k = ease(prog(t, aC + i * 0.25, 0.4)); if (!k) return;
          dot(g, X(u), Y(v), Math.max(6, w * 0.012) * k, C.text);
          g.fillStyle = C.text; g.textAlign = u ? 'left' : 'right'; g.fillText(`(${u}, ${v})`, X(u) + (u ? 14 : -14), Y(v));
        });
        g.globalAlpha = 1;
      }
      let shown = null; probes.forEach((p) => { if (t >= p.a) shown = p; });
      if (shown) {
        const k = ease(prog(t, shown.a, 0.5)); g.globalAlpha = k;
        g.beginPath(); g.arc(X(shown.u), Y(shown.v), Math.max(9, w * 0.018), 0, Math.PI * 2); g.lineWidth = 3; g.strokeStyle = '#fff'; g.stroke();
        dot(g, X(shown.u), Y(shown.v), 4, C.cpu);
        font(g, w, 0.03, 700, true); g.fillStyle = C.cpu; g.textAlign = 'center'; g.fillText(`(${shown.u}, ${shown.v})`, X(shown.u), Y(shown.v) + (shown.v > 0.5 ? -28 : 28)); g.globalAlpha = 1;
      }
      if (ky > 0) { font(g, w, 0.026, 700, true); g.globalAlpha = ky; g.textAlign = 'left'; g.fillStyle = C.text; g.fillText('Uv.Y = 0', X(1) + 14, Y(0.08)); g.fillText('Uv.Y = 1', X(1) + 14, Y(0.92)); g.globalAlpha = 1; }
    };
  });

  /* ------------------------------------------------- motion-graphics kinds */

  /* gl: one WebGL canvas that draws several live shaders, one per tile. HTML lays the tiles out (a grid of boxes with
     captions) and the canvas draws each shader into the box of its tile, so a dozen live shaders cost one GL context.
     spec: { tiles: [{ frag, modes?, at?, cap?, html?, marks? }], cols, gap, aspect, fill, title, logo, tex, lib } */
  const glCache = new Map();
  KINDS.gl = (spec, api) => {
    const el = h('div', 's-gl' + (spec.fill ? ' fill' : '') + (spec.cls ? ' ' + spec.cls : ''));
    if (spec.title) el.append(h('div', 's-gl-bar', `${spec.logo ? `<img src="${spec.logo}" alt="">` : ''}<span>${spec.title}</span>`));
    const body = h('div', 's-gl-body'), grid = h('div', 's-gl-grid'), cv = h('canvas');
    grid.style.gridTemplateColumns = `repeat(${spec.cols || spec.tiles.length}, minmax(0, 1fr))`;
    if (spec.gap != null) grid.style.gap = `${spec.gap}cqw`;
    body.append(cv, grid); el.append(body);
    const tiles = spec.tiles.map((T) => {
      const box = h('div', 't'), img = h('div', 't-img' + (T.html ? ' html' : ''), T.html || '');
      if (!spec.fill) img.style.aspectRatio = T.aspect || spec.aspect || '16 / 10';
      box.append(img);
      const cap = T.cap ? h('div', 't-cap', T.cap) : null;
      if (cap) box.append(cap);
      const marks = (T.marks || []).map((m) => { const e = h('span', 't-mark ' + (m.kind || 'x'), m.kind === 'check' ? '✓' : '✗'); img.append(e); return { a: api.at(m.at), out: m.out != null ? api.at(m.out) : Infinity, e }; });
      grid.append(box);
      const modes = (T.modes || (T.frag ? [{ frag: T.frag }] : [])).map((m) => ({ ...m, a: api.at(m.at) }));
      return { T, box, img, cap, marks, modes, a: T.at != null ? api.at(T.at) : -1, out: T.out != null ? api.at(T.out) : Infinity };
    });
    let gl = null, failed = false, buf = null, tex = null, texReady = false;
    const VS = '#version 300 es\nin vec2 p;void main(){gl_Position=vec4(p,0,1);}';
    const FS = (body) => `#version 300 es\nprecision highp float;uniform vec2 uRes;uniform vec2 uOff;uniform float uTime;uniform float uK;uniform float uRad;uniform sampler2D uTex;out vec4 o;\n${spec.lib || ''}\nvec4 shade(vec2 uv,float t){${body}}\nvoid main(){vec2 px=gl_FragCoord.xy-uOff;vec4 c=shade(px/uRes,uTime);vec2 q=abs(px-uRes*.5)-uRes*.5+uRad;float d=length(max(q,0.))+min(max(q.x,q.y),0.)-uRad;o=vec4(c.rgb,c.a*clamp(.5-d,0.,1.)*uK);}`;
    const progs = new Map();
    const program = (frag) => {
      if (progs.has(frag)) return progs.get(frag);
      const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
      const p = gl.createProgram();
      gl.attachShader(p, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, FS(frag))); gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
      const P = { p, pos: gl.getAttribLocation(p, 'p') };
      for (const u of ['uRes', 'uOff', 'uTime', 'uK', 'uRad', 'uTex']) P[u] = gl.getUniformLocation(p, u);
      progs.set(frag, P); return P;
    };
    function init() {
      try {
        gl = cv.getContext('webgl2', { antialias: false, premultipliedAlpha: false, alpha: true });
        if (!gl) throw new Error('no webgl2');
        buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.enable(gl.SCISSOR_TEST);
        tiles.forEach((x) => x.modes.forEach((m) => program(m.frag)));
        if (spec.tex) {
          tex = gl.createTexture(); const im = new Image();
          im.onload = () => { gl.bindTexture(gl.TEXTURE_2D, tex); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im); gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT); texReady = true; };
          im.src = spec.tex;
        }
      } catch (e) { failed = true; console.warn('stage gl:', e.message); el.classList.add('no-gl'); }
    }
    setTimeout(() => { if (!gl && !failed) init(); }, 0); // compile every program while the page loads, not in the middle of a scene
    const offset = (e) => { let x = 0, y = 0; while (e && e !== body) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; } return [x, y]; };
    return {
      el,
      render(t) {
        // tiles and captions: reveal, marks
        for (const x of tiles) {
          const k = x.a < 0 ? 1 : ease(prog(t, x.a, 0.7)), q = x.out === Infinity ? 0 : ease(prog(t, x.out, 0.45));
          x.k = k * (1 - q);
          if (x.cap) { x.cap.style.opacity = x.k; x.cap.style.transform = `translateY(${(1 - k) * 8}px)`; }
          if (x.T.html) { x.img.style.opacity = x.k; x.img.style.transform = `scale(${lerp(0.92, 1, k)})`; }
          for (const m of x.marks) { const p = prog(t, m.a, 0.35) * (1 - prog(t, m.out, 0.3)); m.e.style.opacity = p; m.e.style.transform = `scale(${lerp(1.6, 1, ease(p))})`; }
        }
        if (failed) return;
        if (!gl) init();
        if (failed) return;
        const d = DPR() * (spec.res || 1), W = body.clientWidth, H = body.clientHeight;
        if (cv.width !== Math.round(W * d) || cv.height !== Math.round(H * d)) { cv.width = Math.round(W * d); cv.height = Math.round(H * d); }
        gl.disable(gl.SCISSOR_TEST); gl.viewport(0, 0, cv.width, cv.height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.enable(gl.SCISSOR_TEST);
        for (const x of tiles) {
          if (!x.modes.length || x.k <= 0.001) continue;
          let i = 0; x.modes.forEach((m, n) => { if (t >= m.a) i = n; });
          const [ox, oy] = offset(x.img), s = lerp(0.9, 1, x.k);
          const w = x.img.offsetWidth * s, hh = x.img.offsetHeight * s;
          const px = Math.round((ox + (x.img.offsetWidth - w) / 2) * d), py = Math.round((H - oy - (x.img.offsetHeight + hh) / 2) * d);
          const pw = Math.round(w * d), ph = Math.round(hh * d);
          if (pw < 1 || ph < 1) continue;
          const P = program(x.modes[i].frag);
          gl.viewport(px, py, pw, ph); gl.scissor(px, py, pw, ph);
          gl.useProgram(P.p);
          gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.enableVertexAttribArray(P.pos); gl.vertexAttribPointer(P.pos, 2, gl.FLOAT, false, 0, 0);
          gl.uniform2f(P.uRes, pw, ph); gl.uniform2f(P.uOff, px, py);
          gl.uniform1f(P.uTime, reduce.matches ? 2 : Math.max(0, t - Math.max(0, x.modes[i].a)) + (x.T.t0 || 0));
          gl.uniform1f(P.uK, x.k); gl.uniform1f(P.uRad, (spec.fill ? parseFloat(getComputedStyle(el).getPropertyValue("--r")) || 0 : (spec.radius ?? 12)) * d);
          if (tex) { if (!texReady && x.modes[i].frag.includes('uTex')) continue; gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex); gl.uniform1i(P.uTex, 0); }
          gl.drawArrays(gl.TRIANGLES, 0, 3);
        }
      },
    };
  };


  /* race: the same array on several lanes (CPU, GPU…). Each lane has runs: one index after another (seq) or all its
     indexes at once (par), with the time one step takes; a run with win: true gets a check when it finishes */
  KINDS.race = (spec, api) => {
    const el = h('div', 's-race');
    const vals = spec.values || [1, 2, 3, 4, 5];
    const lanes = spec.lanes.map((L) => {
      const row = h('div', 's-lane ' + (L.cls || '')), lab = h('div', 's-lane-label', L.label), arr = h('div', 's-array');
      const cells = vals.map((v, i) => { const c = h('div', 's-cell', `<small>[${i}]</small><b>${v}</b>`); const th = h('i', 's-thread'); c.append(th); arr.append(c); return { c, b: c.querySelector('b'), th, v }; });
      const mark = h('span', 's-lane-mark', '✓');
      row.append(lab, arr, mark); el.append(row);
      return { cells, mark, runs: L.runs.map((r) => ({ ...r, a: api.at(r.at) })) };
    });
    return {
      el,
      render(t) {
        for (const L of lanes) {
          let run = null; L.runs.forEach((r) => { if (t >= r.a) run = r; });
          const n = L.cells.length;
          if (!run) { L.cells.forEach((x) => { x.c.className = 's-cell'; x.b.textContent = x.v; x.th.style.height = '0'; }); L.mark.style.opacity = 0; continue; }
          const r = reduce.matches ? 1e9 : t - run.a, step = run.step || 0.6, total = run.mode === 'par' ? step : n * step;
          L.cells.forEach((x, j) => {
            let done, now;
            if (run.mode === 'par') { done = r >= step; now = !done; x.th.style.height = now ? `${clamp(r / (step * 0.5)) * 6}cqh` : '0'; }
            else { const i = Math.floor(r / step); done = j < i; now = j === i; x.th.style.height = '0'; }
            x.c.className = 's-cell' + (done ? ' done' : now ? ' now' : '');
            x.b.textContent = done ? x.v * 2 : x.v;
          });
          const k = run.win ? prog(r, total, 0.35) : 0;
          L.mark.style.opacity = k; L.mark.style.transform = `scale(${lerp(1.6, 1, ease(k))})`;
        }
      },
    };
  };


  /* trip: the journey of a drawing as a map — game, door A, Vertex, door B, the GPU, Fragment, door C, the screen.
     Three coloured vertices travel it (flow), become a triangle of pixels at the GPU and land on the screen. Stations can
     be focused, each door can show its numbered slots, and the stations can be tagged with who does the work.
     spec: { show, flow: [beats], focus: [{ at, ids }], slots, zeros, star, owners: { game, you, gpu }, names, slotNames, ownerNames } */
  KINDS.trip = (spec, api) => {
    const el = h('div', 's-canvas s-trip'); const cv = h('canvas'); el.append(cv);
    const T = (x) => (x == null ? null : api.at(x));
    const N = spec.names || {}, SN = spec.slotNames || { pos: 'position', color: 'color' }, ON = spec.ownerNames || {};
    const ST = [['game', 0.06, 'box'], ['A', 0.175, 'door'], ['vertex', 0.3, 'fn'], ['B', 0.425, 'door'], ['gpu', 0.55, 'gpu'], ['fragment', 0.675, 'fn'], ['C', 0.8, 'door'], ['screen', 0.94, 'screen']];
    const XS = Object.fromEntries(ST.map(([id, x]) => [id, x]));
    const show = T(spec.show ?? 0), flows = (spec.flow || []).map(T), focus = (spec.focus || []).map((f) => ({ a: T(f.at), ids: f.ids ? new Set(f.ids) : null }));
    const aSlots = T(spec.slots), aZeros = T(spec.zeros), aStar = T(spec.star), own = spec.owners ? { game: T(spec.owners.game), you: T(spec.owners.you), gpu: T(spec.owners.gpu) } : {};
    const SLOTS = { A: [['0', SN.pos], ['1', SN.color]], B: [['★', SN.pos], ['0', SN.color]], C: [['0', SN.color]] };
    const COL = [[255, 59, 59], [51, 214, 92], [56, 128, 255]];
    const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
    const colorOf = { game: C.cpu, vertex: C.accent, fragment: C.accent, gpu: C.gpu, screen: C.text2, A: C.ok, B: C.ok, C: C.ok };
    // a small triangle made of pixels; k (0..1) mixes grey into the spread colours
    function tri(g, cx, cy, s, k, a) {
      const n = 11, cell = s / n;
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
        const u = (c + 0.5) / n, v = (r + 0.5) / n; // v = 0 at the top
        const half = v * 0.5; if (u < 0.5 - half || u > 0.5 + half) continue;
        const q = clamp((u - (0.5 - half)) / Math.max(v, 1e-3)), wTop = 1 - v, wL = v * (1 - q), wR = v * q;
        const col = [0, 1, 2].map((i) => COL[0][i] * wTop + COL[1][i] * wL + COL[2][i] * wR);
        const grey = [70, 70, 90];
        g.fillStyle = rgb(grey.map((x, i) => lerp(x, col[i], k)), a);
        g.fillRect(cx - s / 2 + c * cell + 0.5, cy - s / 2 + r * cell + 0.5, cell - 1, cell - 1);
      }
    }
    return {
      el,
      render(t) {
        const { w, h: H, d } = fit(cv, spec.aspect || 3);
        const g = cv.getContext('2d'); g.setTransform(d, 0, 0, d, 0, 0); g.clearRect(0, 0, w, H);
        const cy = H * 0.4, bw = w * 0.1, bh = H * 0.3, fs = w * 0.021;
        const X = (id) => XS[id] * w;
        let foc = null; focus.forEach((f) => { if (t >= f.a) foc = f.ids; });
        const alphaOf = (id) => (foc && !foc.has(id) ? 0.28 : 1);
        // the road
        const kLine = easeIO(prog(t, show, 1.8));
        g.strokeStyle = 'rgba(255,255,255,.16)'; g.lineWidth = 2; g.beginPath(); g.moveTo(X('game'), cy); g.lineTo(lerp(X('game'), X('screen'), kLine), cy); g.stroke();
        // stations
        ST.forEach(([id, , kind], i) => {
          const k = ease(prog(t, show + 0.25 + i * 0.22, 0.5)); if (!k) return;
          const x = X(id), col = colorOf[id];
          g.globalAlpha = k * alphaOf(id);
          if (kind === 'door') {
            const dw = w * 0.014, dh = H * 0.46;
            rr(g, x - dw / 2, cy - dh / 2, dw, dh, 3); g.fillStyle = C.bg; g.fill(); g.strokeStyle = col; g.lineWidth = 2; g.stroke();
            g.fillStyle = col; g.font = `800 ${fs * 1.5}px -apple-system, system-ui, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'bottom';
            g.fillText(id, x, cy - dh / 2 - fs * 0.4);
          } else {
            rr(g, x - bw / 2, cy - bh / 2, bw, bh, 10); g.fillStyle = C.bg2; g.fill(); g.strokeStyle = col; g.lineWidth = foc && foc.has(id) ? 3 : 1.6; g.stroke();
            g.fillStyle = kind === 'screen' ? C.text : col; g.font = `700 ${fs}px -apple-system, system-ui, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
            if (kind === 'screen') { rr(g, x - bw * 0.36, cy - bh * 0.3, bw * 0.72, bh * 0.5, 4); g.fillStyle = '#0b0b10'; g.fill(); g.fillStyle = C.text2; g.fillText(N.screen || 'Screen', x, cy + bh * 0.36); }
            else g.fillText(N[id] || id, x, cy);
          }
          g.globalAlpha = 1;
        });
        // the slots of each door
        if (aSlots != null) {
          const k = ease(prog(t, aSlots, 0.6));
          if (k) for (const door of ['A', 'B', 'C']) {
            const x = X(door); g.globalAlpha = k * alphaOf(door);
            SLOTS[door].forEach(([num, name], j) => {
              const y = cy + H * 0.3 + j * H * 0.14, rw = w * 0.11, rh = H * 0.11;
              const flash = aZeros != null && num === '0' && t >= aZeros && t < aZeros + 3 ? 0.5 + 0.5 * Math.sin((t - aZeros) * 8) : 0;
              rr(g, x - rw / 2, y - rh / 2, rw, rh, 6); g.fillStyle = flash ? `rgba(255,122,178,${0.18 + flash * 0.3})` : C.bg2; g.fill(); g.strokeStyle = num === '★' ? C.gpu : C.line; g.lineWidth = 1.2; g.stroke();
              g.font = `800 ${fs}px ui-monospace, monospace`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = num === '★' ? C.gpu : C.ok; g.fillText(num, x - rw / 2 + rw * 0.1, y);
              g.font = `600 ${fs * 0.85}px -apple-system, system-ui, sans-serif`; g.fillStyle = C.text; g.fillText(name, x - rw / 2 + rw * 0.3, y);
            });
            g.globalAlpha = 1;
          }
        }
        // door B: the special position goes to the GPU, your data goes to Fragment
        if (aStar != null) {
          const k = ease(prog(t, aStar, 0.9));
          if (k) {
            const arrow = (x0, y0, x1, y1, col, kk) => {
              const mx = (x0 + x1) / 2, my = Math.max(y0, y1) + H * 0.1;
              g.strokeStyle = col; g.lineWidth = 2.5; g.setLineDash([6, 6]); g.beginPath(); g.moveTo(x0, y0);
              const N2 = 30; for (let i = 1; i <= N2 * kk; i++) { const s = i / N2; g.lineTo((1 - s) * (1 - s) * x0 + 2 * (1 - s) * s * mx + s * s * x1, (1 - s) * (1 - s) * y0 + 2 * (1 - s) * s * my + s * s * y1); }
              g.stroke(); g.setLineDash([]);
            };
            const yS = cy + H * 0.3, x0 = X("B") + w * 0.055;
            arrow(x0, yS, X('gpu'), cy + bh / 2, C.gpu, k);
            arrow(x0, yS + H * 0.14, X("fragment"), cy + bh / 2, C.accent, ease(prog(t, aStar + 0.8, 0.9)));
          }
        }
        // who does what
        const tag = (id, text, col, a) => { const k = ease(prog(t, a, 0.5)); if (!k) return; g.globalAlpha = k; g.font = `700 ${fs * 0.95}px -apple-system, system-ui, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'bottom'; g.fillStyle = col; g.fillText(text, X(id), cy - bh / 2 - H * 0.13); g.globalAlpha = 1; };
        if (own.game != null) tag('game', ON.game || 'Your game', C.cpu, own.game);
        if (own.you != null) { tag('vertex', ON.you || 'You', C.accent, own.you); tag('fragment', ON.you || 'You', C.accent, own.you + 0.15); }
        if (own.gpu != null) tag('gpu', ON.gpu || 'GPU', C.gpu, own.gpu);
        // the journey of the three vertices
        let f0 = null; flows.forEach((a) => { if (t >= a) f0 = a; });
        if (f0 != null) {
          const k = reduce.matches ? 99 : t - f0, r = H * 0.045;
          const dots = (xa, xb, p) => COL.forEach((c, i) => { const x = lerp(xa, xb, easeIO(p)), y = cy + (i - 1) * H * 0.07; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = rgb(c); g.fill(); });
          const s = bh * 0.85;
          if (k < 1.4) dots(X('game'), X('vertex'), k / 1.4);
          else if (k < 2) { dots(X('vertex'), X('vertex'), 1); }
          else if (k < 3.2) dots(X('vertex'), X('gpu'), (k - 2) / 1.2);
          else if (k < 4.2) tri(g, X('gpu'), cy, s * ease(clamp((k - 3.2) / 0.5)), clamp((k - 3.5) / 0.7), 1);
          else if (k < 5.4) tri(g, lerp(X('gpu'), X('fragment'), easeIO((k - 4.2) / 1.2)), cy, s, 1, 1);
          else if (k < 6) tri(g, X('fragment'), cy, s * (1 + 0.08 * Math.sin((k - 5.4) * 12)), 1, 1);
          else if (k < 7.2) tri(g, lerp(X('fragment'), X('screen'), easeIO((k - 6) / 1.2)), cy, s, 1, 1);
          else tri(g, X('screen'), cy - bh * 0.05, bh * 0.5, 1, 1);
        }
      },
    };
  };

  /* file: an output file of the compiler, with the logo of its API */
  KINDS.file = (spec) => ({ el: h('div', 's-file' + (spec.cls ? ' ' + spec.cls : ''), `${spec.logo ? `<img src="${spec.logo}" alt="">` : ''}<b>${spec.ext}</b>${spec.sub ? `<small>${spec.sub}</small>` : ''}`) });

  /* bytes: hex bytes that type themselves (the compiled SPIR-V) */
  KINDS.bytes = (spec, api) => {
    const el = h('div', 's-bytes' + (spec.cls ? ' ' + spec.cls : ''));
    if (spec.label) el.append(h('div', 's-bytes-label', spec.label));
    const pre = h('div', 's-bytes-body'); el.append(pre);
    const all = spec.bytes.trim().split(/\s+/), a = api.at(spec.type ?? spec.at), cps = spec.cps || 30, per = spec.per || 8;
    const spans = all.map((b, i) => { const s = h('span', '', b); pre.append(s, ' '); if ((i + 1) % per === 0 && i < all.length - 1) pre.append(h('br')); return s; });
    return { el, render(t) { const n = reduce.matches ? all.length : Math.floor(Math.max(0, t - a) * cps); spans.forEach((s, i) => { s.style.opacity = i < n ? 1 : 0; s.classList.toggle('hot', i >= n - 3 && i < n); }); } };
  };

  /* keys: keycaps that press down at a beat */
  KINDS.keys = (spec, api) => {
    const el = h('div', 's-keys');
    const caps = spec.caps.map((K) => { const e = h('kbd', 's-key', K.text); el.append(e); if (K.plus) el.append(h('span', 's-key-plus', '+')); return { e, a: K.press != null ? api.at(K.press) : null, len: K.len || 0.5 }; });
    return { el, render(t) { for (const c of caps) { const on = c.a != null && t >= c.a && t < c.a + c.len; c.e.classList.toggle('down', on); } } };
  };

  /* rule: a line that draws itself from left to right */
  KINDS.rule = (spec, api) => {
    const el = h('div', 's-rule'), a = api.at(spec.grow ?? spec.at);
    return { el, render(t) { el.style.transform = `scaleX(${easeIO(prog(t, a, spec.dur || 1.6))})`; } };
  };

  /* list: words in a dry column (a reference list); can strike through at a beat */
  KINDS.list = (spec, api) => {
    const el = h('div', 's-list');
    const rows = spec.words.map((w, i) => { const e = h('div', 's-list-w', w); el.append(e); return { e, a: api.at(spec.at) + i * (spec.step ?? 0.08) }; });
    const sA = spec.strike != null ? api.at(spec.strike) : null;
    return { el, render(t) { rows.forEach((r, i) => { const p = ease(prog(t, r.a, 0.4)); r.e.style.opacity = p * (sA != null ? 1 - 0.65 * prog(t, sA + i * 0.04, 0.3) : 1); r.e.classList.toggle('struck', sA != null && t >= sA + i * 0.04); }); } };
  };

  /* morph: one piece of code turns into another. Lines both have in common slide to their new place; a line that
     changed cross-fades into its new text while it moves; new lines open a gap and fade in. `hl` lights lines of `to`. */
  KINDS.morph = (spec, api) => {
    const el = h('div', 's-code s-morph' + (spec.cls ? ' ' + spec.cls : ''));
    const titleA = spec.from.title, titleB = spec.to.title;
    const tEl = titleA || titleB ? h('div', 's-code-title', `<span class="ta">${titleA || ''}</span><span class="tb">${titleB || ''}</span>`) : null;
    if (tEl) el.append(tEl);
    const pre = h('pre'); el.append(pre);
    const A = spec.from.code.replace(/\n$/, '').split('\n'), B = spec.to.code.replace(/\n$/, '').split('\n');
    const LA = spec.from.lines, LB = spec.to.lines;
    // longest common subsequence of lines (trimmed)
    const n = A.length, m = B.length, L = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = A[i].trim() === B[j].trim() ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    const ents = [];
    let i = 0, j = 0, gapA = [], gapB = [];
    const flush = () => {
      // pair the removed lines with the last added lines of the gap: new lines open above them
      const k = Math.min(gapA.length, gapB.length), offB = gapB.length - k;
      gapA.forEach((ia, x) => { if (x < k) { const ib = gapB[offB + x]; ents.push({ html: LA[ia], y0: ia, y1: ib, role: 'old' }); ents.push({ html: LB[ib], y0: ia, y1: ib, role: 'new', b: ib }); } else ents.push({ html: LA[ia], y0: ia, y1: null, role: 'gone' }); });
      gapB.forEach((ib, x) => { if (x < offB) ents.push({ html: LB[ib], y0: null, y1: ib, role: 'add', b: ib }); });
      gapA = []; gapB = [];
    };
    while (i < n || j < m) {
      if (i < n && j < m && A[i].trim() === B[j].trim()) { flush(); ents.push({ html: LB[j], y0: i, y1: j, role: 'keep', b: j }); i++; j++; }
      else if (j >= m || (i < n && L[i + 1][j] >= L[i][j + 1])) gapA.push(i++);
      else gapB.push(j++);
    }
    flush();
    for (const e of ents) { e.el = h('div', 'ln', `<span class="src">${e.html}</span>`); e.el.style.cssText = 'position:absolute;left:0;right:0;'; pre.append(e.el); }
    const a0 = api.at(spec.at), aM = api.at(spec.morph), dM = spec.dur || 1.3;
    const hl = (spec.hl || []).map((x) => ({ a: api.at(x.at), b: x.until != null ? api.at(x.until) : Infinity, lines: x.lines === 'all' ? null : new Set(x.lines), step: x.step || 0 }));
    const fresh = spec.fresh != null ? api.at(spec.fresh) : null;
    const err = spec.err ? { a: api.at(spec.err.at), lines: new Set(spec.err.lines) } : null;
    return {
      el,
      render(t) {
        const p = reduce.matches ? (t >= aM ? 1 : 0) : easeIO(prog(t, aM, dM));
        pre.style.height = `${lerp(n, m, p) * 1.62}em`;
        if (tEl) { tEl.querySelector('.ta').style.opacity = 1 - p; tEl.querySelector('.tb').style.opacity = p; }
        for (const e of ents) {
          const y = e.y0 == null ? e.y1 : e.y1 == null ? e.y0 : lerp(e.y0, e.y1, p);
          e.el.style.top = `${y * 1.62}em`;
          let o = 1, x = 0;
          if (e.role === 'old' || e.role === 'gone') { o = 1 - clamp(p * 1.8); x = -p * 14; }
          if (e.role === 'new' || e.role === 'add') { o = clamp((p - 0.35) / 0.65); x = (1 - o) * 14; }
          if (e.y0 != null && e.role !== 'add') o *= clamp((t - a0 - e.y0 * 0.12) / 0.35); // the first code comes in line by line
          e.el.style.opacity = o; e.el.style.transform = x ? `translateX(${x}px)` : '';
          const isNew = fresh != null && (e.role === 'new' || e.role === 'add') && t >= aM + dM * 0.6 && t < fresh;
          e.el.classList.toggle('fresh', isNew);
          if (err && (e.role === 'gone' || e.role === 'old')) e.el.classList.toggle('err', t >= err.a && err.lines.has(e.y0));
          e.el.classList.toggle('hl', e.b != null && hl.some((H) => t >= H.a + (H.step ? e.b * H.step : 0) && t < H.b && (!H.lines || H.lines.has(e.b))));
        }
      },
    };
  };

  /* --------------------------------------------------------- items + scenes */
  function item(spec, api) {
    const make = KINDS[spec.k];
    if (!make) { console.warn('stage: unknown item kind', spec.k); return { el: h('div'), render() {} }; }
    const w = make(spec, api);
    const wrap = h('div', 's-item'); wrap.append(w.el);
    if (spec.k === 'row' || spec.k === 'slot') wrap.style.width = '100%';
    if (spec.strike != null) wrap.dataset.strike = '';
    if (spec.mark && typeof spec.mark === 'object') { const m = h('span', 's-mark ' + (spec.mark.kind || 'x'), spec.mark.kind === 'check' ? '✓' : '✗'); m.style.opacity = 0; wrap.append(m); spec._m = m; }
    const a = api.at(spec.at), out = spec.out != null ? api.at(spec.out) : Infinity;
    const sA = spec.strike != null ? api.at(spec.strike) : null, mA = spec._m ? api.at(spec.mark.at) : null;
    const fx = spec.fx || 'up';
    const ON = spec.on && spec.on.map((c) => ({ cls: c.cls, a: api.at(c.at), out: c.out != null ? api.at(c.out) : Infinity }));
    // keys: the item lives at a place of the scene (x, y from the centre in cqw / cqh, width w in cqw, height h in cqh,
    // scale s, opacity o, corner radius r in px) and moves from one key to the next at its beat (d seconds, eased)
    const keys = spec.keys || (spec.pos ? [spec.pos] : api.world ? [{}] : null);
    const K = keys && keys.map((x, i) => ({ ...x, a: i ? api.at(x.at) : 0, d: x.d ?? 1 }));
    if (K) wrap.classList.add('s-at');
    const pose = (t) => {
      const P = { x: 0, y: 0, s: 1, o: 1, ...K[0] };
      for (let i = 1; i < K.length; i++) {
        const k = reduce.matches ? (t >= K[i].a ? 1 : 0) : easeIO(prog(t, K[i].a, K[i].d));
        if (k <= 0) continue;
        for (const f of ['x', 'y', 'w', 'h', 's', 'o', 'r']) if (K[i][f] != null) P[f] = P[f] == null ? K[i][f] : lerp(P[f], K[i][f], k);
      }
      return P;
    };
    return {
      el: wrap,
      render(t) {
        const p = ease(prog(t, a, spec.dur || 0.6)), q = out === Infinity ? 0 : ease(prog(t, out, 0.45));
        let o = p * (1 - q), P = null;
        if (K) { P = pose(t); o *= P.o; }
        wrap.style.opacity = o;
        wrap.style.visibility = o > 0.001 ? '' : 'hidden';
        const tr = fx === 'pop' ? `scale(${lerp(0.7, 1, p)})` : fx === 'left' ? `translateX(${(1 - p) * -30}px)` : fx === 'right' ? `translateX(${(1 - p) * 30}px)` : fx === 'none' || fx === 'fade' ? '' : `translateY(${(1 - p) * 18 - q * 12}px)`;
        if (P) {
          wrap.style.left = `calc(50% + ${P.x}cqw)`; wrap.style.top = `calc(50% + ${P.y}cqh)`;
          if (P.w != null) wrap.style.width = `${P.w}cqw`;
          if (P.h != null) wrap.style.height = `${P.h}cqh`;
          if (P.r != null) wrap.style.setProperty('--r', `${P.r}px`);
          wrap.style.transform = `translate(-50%, -50%) ${tr} scale(${P.s})`;
        } else wrap.style.transform = tr;
        if (sA != null) { const k = ease(prog(t, sA, 0.4)); wrap.style.setProperty('--k', k); wrap.classList.toggle('struck', k > 0.5); }
        if (mA != null) { const k = prog(t, mA, 0.35); spec._m.style.opacity = k; spec._m.style.transform = `translateY(-50%) scale(${lerp(1.6, 1, ease(k))})`; }
        // on: classes that switch on at a beat (and off at `out`), for CSS-drawn parts such as the SVG illustrations
        if (ON) for (const c of ON) w.el.classList.toggle(c.cls, t >= c.a && t < c.out);
        if (o > 0.001 && w.render) w.render(t);
      },
    };
  }

  /* --------------------------------------------------------------- timeline */
  let audio = null, timeline = [], raf = 0, closed = false;

  function build(words) {
    screen.querySelectorAll('.scene').forEach((e) => e.remove());
    bar.querySelectorAll('i').forEach((e) => e.remove());
    timeline = [];
    const startOf = new Map(words.map((w) => [w.el, w.start]));
    // words and cues in reading order
    const seq = [], cues = [];
    for (const el of $$('.article .scene-cue, .article .w[data-b]')) {
      if (el.classList.contains('scene-cue')) cues.push({ id: el.dataset.scene, at: seq.length });
      else if (startOf.has(el)) seq.push({ el, start: startOf.get(el), n: norm(el.textContent) });
    }
    const find = (phrase, from, to) => {
      const toks = phrase.split(/\s+/).map(norm).filter(Boolean);
      if (!toks.length) return -1;
      const look = (a, b) => { for (let i = a; i < b; i++) { let k = 0, j = i; while (k < toks.length && j < seq.length) { if (!seq[j].n) { j++; continue; } if (seq[j].n !== toks[k]) break; k++; j++; } if (k === toks.length) return i; } return -1; };
      const r = look(from, to);
      return r >= 0 ? r : look(from, seq.length);
    };
    cues.forEach((cue, i) => {
      const scene = DATA.scenes.find((s) => s.id === cue.id);
      if (!scene) return;
      const next = cues[i + 1]?.at ?? seq.length;
      const start = i === 0 ? 0 : seq[cue.at]?.start ?? Infinity;
      const end = cues[i + 1] ? seq[next]?.start ?? Infinity : Infinity;
      const beats = { end: end - start };
      for (const [name, phrase] of Object.entries(scene.beats || {})) {
        const j = typeof phrase === 'string' ? find(phrase, cue.at, next) : -1;
        if (j < 0) { console.warn(`stage: beat "${name}" (“${phrase}”) of scene "${scene.id}" is not in the narration`); beats[name] = 0; }
        else beats[name] = seq[j].start - start;
      }
      const api = {
        world: !!scene.world,
        dur: end - start,
        at(spec) {
          if (spec == null) return 0;
          if (typeof spec === 'number') return spec;
          const m = /^([A-Za-z_]\w*)\s*([+-]\s*[\d.]+)?$/.exec(spec);
          if (!m || !(m[1] in beats)) { console.warn(`stage: unknown beat "${spec}" in scene "${scene.id}"`); return 0; }
          return beats[m[1]] + (m[2] ? parseFloat(m[2].replace(/\s/g, '')) : 0);
        },
      };
      const root = h('div', 'scene' + (scene.dense ? ' dense' : '') + (scene.world ? ' world' : '')); root.dataset.id = scene.id;
      const items = (scene.items || []).map((s) => item(s, api));
      // world scenes: every item has a place, and a camera (cam keys: x, y in cqw / cqh, scale s) moves over them
      const cam = scene.world ? h('div', 'cam') : null;
      if (cam) {
        root.append(cam);
        const CK = (scene.cam || [{}]).map((x, i) => ({ x: 0, y: 0, s: 1, ...x, a: i ? api.at(x.at) : 0, d: x.d ?? 1.2 }));
        items.push({ render(t) {
          const P = { ...CK[0] };
          for (let i = 1; i < CK.length; i++) { const k = reduce.matches ? (t >= CK[i].a ? 1 : 0) : easeIO(prog(t, CK[i].a, CK[i].d)); if (k > 0) for (const f of ['x', 'y', 's']) if (CK[i][f] != null) P[f] = lerp(P[f], CK[i][f], k); }
          cam.style.transform = `scale(${P.s}) translate(${-P.x}cqw, ${-P.y}cqh)`;
        } });
      }
      items.forEach((x) => x.el && (cam || root).append(x.el));
      screen.append(root);
      timeline.push({ id: scene.id, start, end, root, items, on: false });
    });
    timeline.sort((x, y) => x.start - y.start);
  }

  function ticks() {
    if (!audio || !isFinite(audio.duration)) return;
    bar.querySelectorAll('i').forEach((e) => e.remove());
    timeline.forEach((s, i) => { if (!i || !isFinite(s.start)) return; const m = h('i'); m.style.left = (s.start / audio.duration) * 100 + '%'; bar.append(m); });
  }

  function frame() {
    if (!audio) return;
    const T = audio.currentTime;
    if (isFinite(audio.duration)) progress.style.width = (T / audio.duration) * 100 + '%';
    let cur = 0;
    timeline.forEach((s, i) => { if (T >= s.start) cur = i; });
    timeline.forEach((s, i) => {
      const fadeIn = i === 0 ? 1 : reduce.matches ? 1 : clamp((T - s.start) / FADE);
      const prevOut = i === cur - 1 && fadeInOf(cur, T) < 1;
      const vis = i === cur || prevOut;
      if (!vis) { if (s.on) { s.root.classList.remove('on'); s.on = false; } return; }
      if (!s.on) { s.root.classList.add('on'); s.on = true; }
      s.root.style.opacity = i === cur ? fadeIn : 1 - fadeInOf(cur, T);
      s.root.style.zIndex = i === cur ? 2 : 1;
      const lt = Math.max(0, T - s.start);
      s.items.forEach((x) => x.render(lt));
    });
  }
  const fadeInOf = (i, T) => (i === 0 || reduce.matches ? 1 : clamp((T - timeline[i].start) / FADE));
  const loop = () => { frame(); raf = requestAnimationFrame(loop); };

  function enter() {
    if (!wide.matches || closed) return;
    if (!document.body.classList.contains('is-stage')) {
      document.body.classList.add('is-stage');
      stage.hidden = false; dots.hidden = false;
    }
    frame();
  }
  function exit() {
    document.body.classList.remove('is-stage');
    side?.classList.remove('open'); if (scrim) scrim.hidden = true;
    dots.setAttribute('aria-expanded', 'false');
    stage.hidden = true; dots.hidden = true;
  }

  document.addEventListener('narration:start', (e) => {
    audio = e.detail.audio;
    closed = false;
    build(e.detail.words);
    audio.addEventListener('loadedmetadata', ticks);
    audio.addEventListener('play', () => { closed = false; enter(); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); });
    audio.addEventListener('pause', () => { cancelAnimationFrame(raf); frame(); });
    audio.addEventListener('seeked', frame);
    audio.addEventListener('ended', () => { cancelAnimationFrame(raf); exit(); });
    audio.addEventListener('error', () => { cancelAnimationFrame(raf); exit(); });
    enter();
  });

  $('#stage-close').addEventListener('click', () => { closed = true; exit(); });
  // clicking the animation pauses / resumes the narration, like the Pause button
  $('#stage-screen').addEventListener('click', (e) => {
    if (!audio || e.target.closest('a, button, input, select, textarea')) return;
    if (String(getSelection()).trim()) return; // selecting text is not a click
    if (audio.paused) audio.play(); else audio.pause();
  });
  dots.addEventListener('click', () => {
    const open = !side.classList.contains('open');
    side.classList.toggle('open', open); scrim.hidden = !open; dots.setAttribute('aria-expanded', open);
  });
  scrim?.addEventListener('click', () => dots.setAttribute('aria-expanded', 'false'));
  bar.addEventListener('click', (e) => {
    if (!audio || !isFinite(audio.duration)) return;
    const r = bar.getBoundingClientRect();
    audio.currentTime = clamp((e.clientX - r.left) / r.width) * audio.duration;
  });
  wide.addEventListener('change', () => { if (!wide.matches) exit(); else if (audio && !audio.paused) enter(); });
  addEventListener('resize', () => { if (document.body.classList.contains('is-stage') && audio?.paused) frame(); });
})();

// learn.yotsubashader.com — progressive enhancement. The site is fully readable without this script.
(() => {
  const { lang, ui } = window.LEARN;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
  };
  store.set('ys-lang', lang);

  /* settings popover + theme */
  const sBtn = $('#settings-btn'), pop = $('#settings');
  const setPop = (open) => { pop.hidden = !open; sBtn.setAttribute('aria-expanded', open); };
  sBtn.addEventListener('click', (e) => { e.stopPropagation(); setPop(pop.hidden); });
  document.addEventListener('click', (e) => { if (!pop.hidden && !pop.contains(e.target)) setPop(false); });
  const applyTheme = (t) => {
    if (t === 'auto') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = t;
    $$('#theme-seg button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.theme === t));
  };
  applyTheme(store.get('ys-theme') || 'auto');
  $$('#theme-seg button').forEach((b) => b.addEventListener('click', () => { store.set('ys-theme', b.dataset.theme); applyTheme(b.dataset.theme); }));

  /* mobile chapter drawer */
  const side = $('#sidebar'), scrim = $('#scrim'), menuBtn = $('#menu-btn');
  const drawer = (open) => { if (!side) return; side.classList.toggle('open', open); scrim.hidden = !open; menuBtn?.setAttribute('aria-expanded', open); };
  menuBtn?.addEventListener('click', () => drawer(true));
  $('#side-close')?.addEventListener('click', () => drawer(false));
  scrim.addEventListener('click', () => drawer(false));

  /* copy buttons */
  $$('.code .copy').forEach((b) => b.addEventListener('click', async () => {
    const text = b.parentElement.querySelector('pre').innerText;
    try { await navigator.clipboard.writeText(text); b.textContent = ui.copied; setTimeout(() => (b.textContent = ui.copy), 1500); } catch {}
  }));

  /* code style (HLSL/GLSL/...) shared by every tab group and remembered */
  const groups = $$('.code-group[data-styles]');
  /* local tab groups (tab="..."): only switch their own panels */
  $$('.code-group[data-local]').forEach((g) => $$('.code-tabs button', g).forEach((b) => b.addEventListener('click', () => {
    $$('.code-tabs button', g).forEach((x) => x.setAttribute('aria-selected', x === b));
    $$('.code-panel', g).forEach((p) => (p.hidden = p.dataset.tab !== b.dataset.tab));
  })));
  const setStyle = (style, persist) => {
    if (persist) store.set('ys-style', style);
    groups.forEach((g) => {
      const has = g.dataset.styles.split(' ').includes(style);
      const use = has ? style : g.dataset.styles.split(' ')[0];
      $$('.code-tabs button', g).forEach((b) => b.setAttribute('aria-selected', b.dataset.style === use));
      $$('.code-panel', g).forEach((p) => (p.hidden = p.dataset.style !== use));
    });
    const sel = $('#style-select');
    if (sel) sel.value = style;
  };
  if (groups.length) {
    setStyle(store.get('ys-style') || 'glsl');
    groups.forEach((g) => $$('.code-tabs button', g).forEach((b) => b.addEventListener('click', () => setStyle(b.dataset.style, true))));
    $('#style-select')?.addEventListener('change', (e) => setStyle(e.target.value, true));
  }

  /* route (XNA, Godot...): remember the explicit choice; if the reader is in another route, offer to switch */
  const here = document.body.dataset.route;
  $$('#route-pick a').forEach((a) => a.addEventListener('click', () => store.set('ys-route', a.dataset.route)));
  $$('a[data-pick-route]').forEach((a) => a.addEventListener('click', () => store.set('ys-route', a.dataset.pickRoute)));
  // narrow screens: the route pills scroll sideways, so bring the current one into view
  const current = $('#route-pick a[aria-current]');
  if (current) current.parentElement.scrollLeft = current.offsetLeft - 16;
  const saved = store.get('ys-route');
  const altRoutes = window.LEARN.routes;
  if (here && saved && saved !== here && altRoutes?.[saved]) {
    const n = document.createElement('p');
    n.className = 'route-notice';
    n.innerHTML = `${String(ui.routeNotice).replace('{name}', altRoutes[saved].name)}: <a href="${altRoutes[saved].url}">${altRoutes[saved].name} →</a>`;
    $('.article')?.prepend(n);
  }

  /* progress: mark chapters as viewed */
  const chapters = $$('.chapters a');
  if (chapters.length) {
    const key = 'ys-seen';
    let seen = [];
    try { seen = JSON.parse(store.get(key) || '[]'); } catch {}
    const here = $('.chapters a[aria-current]');
    if (here && !seen.includes(here.pathname)) { seen.push(here.pathname); store.set(key, JSON.stringify(seen)); }
    chapters.forEach((a) => a.classList.toggle('seen', seen.includes(a.pathname)));
    const n = chapters.filter((a) => a.classList.contains('seen')).length;
    $('#progress-bar').style.width = Math.round((n / chapters.length) * 100) + '%';
    $('.progress')?.setAttribute('title', `${ui.progress}: ${n}/${chapters.length}`);
    here?.scrollIntoView({ block: 'nearest' });
  }

  /* "On this page" scroll-spy */
  const links = $$('.toc a');
  if (links.length && 'IntersectionObserver' in window) {
    const map = new Map(links.map((a) => [a.hash.slice(1), a]));
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { links.forEach((l) => l.classList.remove('active')); map.get(e.target.id)?.classList.add('active'); }
    }, { rootMargin: '-72px 0px -70% 0px' });
    $$('.article h2[id], .article h3[id]').forEach((h) => io.observe(h));
  }

  /* prefetch internal pages on hover */
  const seenPrefetch = new Set();
  document.addEventListener('pointerover', (e) => {
    const a = e.target.closest?.('a[href^="/"]');
    if (!a || seenPrefetch.has(a.href) || a.pathname === location.pathname) return;
    seenPrefetch.add(a.href);
    const l = document.createElement('link'); l.rel = 'prefetch'; l.href = a.href; document.head.append(l);
  });

  /* search (⌘K / Ctrl K, "/" too) */
  const dlg = $('#search-dialog'), input = $('#search-input'), list = $('#search-results');
  let index = null, active = -1;
  const load = async () => { if (!index) { try { index = await (await fetch(`/search-${lang}.json`)).json(); } catch { index = []; } } };
  const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const run = () => {
    const q = norm(input.value.trim());
    if (!q) { list.innerHTML = ''; return; }
    const terms = q.split(/\s+/);
    const hits = [];
    for (const p of index) {
      const title = norm(p.t), text = norm(p.x);
      if (!terms.every((t) => title.includes(t) || text.includes(t))) continue;
      let score = terms.reduce((s, t) => s + (title.includes(t) ? 10 : 0) + (text.includes(t) ? 1 : 0), 0);
      const h = p.h.find(([, txt]) => terms.every((t) => norm(txt).includes(t)));
      if (h) score += 5;
      const at = text.indexOf(terms[0]);
      hits.push({ p, h, score, snippet: at >= 0 ? p.x.slice(Math.max(0, at - 40), at + 120).replace(at > 40 ? /^\S*\s/ : /^/, '') : p.x.slice(0, 120) });
    }
    hits.sort((a, b) => b.score - a.score);
    list.innerHTML = hits.length
      ? hits.slice(0, 12).map(({ p, h, snippet }) => `<li><a href="${p.u}${h ? '#' + h[0] : ''}"><small>${esc(p.s)}</small>${esc(p.t)}${h ? ' › ' + esc(h[1]) : ''}<p>${esc(snippet)}…</p></a></li>`).join('')
      : `<li class="sd-empty">${ui.noResults} “${esc(input.value)}”</li>`;
    active = -1;
  };
  const items = () => $$('#search-results a');
  const highlight = (i) => { const els = items(); if (!els.length) return; active = (i + els.length) % els.length; els.forEach((a, n) => a.setAttribute('aria-selected', n === active)); els[active].scrollIntoView({ block: 'nearest' }); };
  const openSearch = async () => { await load(); dlg.showModal(); input.select(); };
  input.addEventListener('input', run);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); highlight(active + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); highlight(active - 1); }
    else if (e.key === 'Enter') { const a = items()[Math.max(active, 0)]; if (a) location.href = a.href; }
  });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  $('#search-btn').addEventListener('click', openSearch);
  $('#hero-search')?.addEventListener('click', openSearch);
  document.addEventListener('keydown', (e) => {
    const typing = /input|textarea|select/i.test(document.activeElement?.tagName);
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); dlg.open ? dlg.close() : openSearch(); }
    else if (e.key === '/' && !typing && !dlg.open) { e.preventDefault(); openSearch(); }
    else if (e.key === 'Escape') { setPop(false); drawer(false); }
  });
  if (!/Mac|iPhone|iPad/.test(navigator.platform)) $$('.search-btn kbd, .hero-search kbd').forEach((k) => (k.textContent = 'Ctrl K'));

  /* listen to the page: audio from tts.mjs + word-by-word highlight */
  const listen = $('#listen');
  if (listen) {
    const label = $('span', listen);
    let audio = null, words = [], byBlock = new Map(), cur = -1, active = -1, raf = 0, lastUserScroll = 0, starting = false;
    const setState = (st) => {
      listen.dataset.state = st;
      listen.setAttribute('aria-pressed', st === 'playing');
      label.textContent = { idle: ui.listen, loading: ui.loading, playing: ui.pause, paused: ui.resume, error: ui.error }[st];
    };
    setState('idle');
    ['wheel', 'touchmove', 'keydown'].forEach((ev) => addEventListener(ev, () => (lastUserScroll = Date.now()), { passive: true }));

    const build = (meta) => {
      // one entry per word: its time is its block's time spread over the words by length
      $$('.article .w[data-b]').forEach((el) => {
        const b = +el.dataset.b;
        if (!byBlock.has(b)) byBlock.set(b, []);
        byBlock.get(b).push(el);
      });
      for (const [b, els] of byBlock) {
        const segs = meta.blocks[b]; // sentences: [start, end, fraction of the block's text where the sentence ends]
        if (!segs) continue;
        const total = els.reduce((a, el) => a + el.textContent.length + 1, 0);
        let acc = 0, s = 0;
        for (const el of els) {
          const p = acc / total; // where this word starts inside the block, 0..1
          while (s < segs.length - 1 && p >= segs[s][2] - 1e-6) s++;
          const prevF = s ? segs[s - 1][2] : 0;
          const [t0, t1, f1] = segs[s];
          words.push({ el, b, start: t0 + ((t1 - t0) * Math.min(Math.max((p - prevF) / Math.max(f1 - prevF, 1e-6), 0), 1)) });
          acc += el.textContent.length + 1;
        }
      }
      words.sort((a, c) => a.start - c.start);
    };

    const clearBlock = (b) => byBlock.get(b)?.forEach((el) => { el.classList.remove('read', 'now'); el.closest('.say')?.classList.remove('on'); });
    const show = (i) => {
      if (i === cur) return;
      cur = i;
      const w = words[i];
      if (!w) { clearBlock(active); active = -1; return; }
      if (w.b !== active) { clearBlock(active); active = w.b; }
      const els = byBlock.get(w.b);
      w.el.closest('.say')?.classList.add('on');
      const pos = els.indexOf(w.el);
      els.forEach((el, n) => { el.classList.toggle('read', n < pos); el.classList.toggle('now', n === pos); });
      const r = w.el.getBoundingClientRect();
      if (Date.now() - lastUserScroll > 3500 && (r.top < 90 || r.bottom > innerHeight - 110))
        w.el.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    };

    const wordAt = (t) => {
      let lo = 0, hi = words.length - 1, r = -1;
      while (lo <= hi) { const m = (lo + hi) >> 1; if (words[m].start <= t) { r = m; lo = m + 1; } else hi = m - 1; }
      return r;
    };
    const tick = () => { show(wordAt(audio.currentTime)); raf = requestAnimationFrame(tick); };

    const start = async () => {
      if (starting) return;
      starting = true;
      setState('loading');
      try {
        const meta = await (await fetch(listen.dataset.src)).json();
        build(meta);
        audio = new Audio(meta.src);
        audio.preload = 'auto';
        audio.addEventListener('play', () => { setState('playing'); cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); });
        audio.addEventListener('pause', () => { if (!audio.ended) setState('paused'); cancelAnimationFrame(raf); });
        audio.addEventListener('seeked', () => show(wordAt(audio.currentTime)));
        audio.addEventListener('ended', () => { cancelAnimationFrame(raf); show(-1); setState('idle'); document.body.classList.remove('is-listening'); audio.currentTime = 0; });
        audio.addEventListener('error', () => { cancelAnimationFrame(raf); setState('error'); });
        document.body.classList.add('is-listening');
        // the stage (stage.js) follows the same audio: it gets the audio element and every word with its start time
        document.dispatchEvent(new CustomEvent('narration:start', { detail: { audio, words: words.map(({ el, start }) => ({ el, start })) } }));
        await audio.play();
      } catch { setState('error'); } finally { starting = false; }
    };

    listen.addEventListener('click', () => {
      if (!audio || listen.dataset.state === 'error') { audio = null; words = []; byBlock = new Map(); cur = active = -1; return start(); }
      if (audio.paused) audio.play(); else audio.pause();
    });
    // click any spoken word to jump there
    $('.article').addEventListener('click', (e) => {
      const el = e.target.closest?.('.w');
      if (!audio || !el || el.closest('a')) return;
      const w = words.find((x) => x.el === el);
      if (w) { audio.currentTime = w.start; if (audio.paused) audio.play(); }
    });
  }
})();

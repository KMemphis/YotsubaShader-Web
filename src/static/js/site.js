/* Yotsuba Shader site behaviour — dependency-free. */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement.dataset.root || './';
  const lang = document.documentElement.lang || 'en';
  // Client-side strings: pages in other languages carry their translations in window.__YS_T__.
  window.ysT = (key, vars) => {
    const text = (window.__YS_T__ && window.__YS_T__[key]) || key;
    return vars ? text.replace(/\{(\w+)\}/g, (_, k) => vars[k]) : text;
  };
  const T = window.ysT;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } },
  };

  /* ---------------------------------------------------- mobile navigation */
  const navToggle = $('.nav-toggle');
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const open = document.body.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
  }

  /* ------------------------------------------------------------ copy code */
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.copy');
    if (!btn) return;
    const text = btn.closest('.code')?.querySelector('pre')?.innerText ?? '';
    try {
      await navigator.clipboard.writeText(text);
      const label = $('span', btn);
      const old = label.textContent;
      label.textContent = T('Copied');
      setTimeout(() => (label.textContent = old), 1400);
    } catch { /* clipboard blocked */ }
  });

  /* ----------------------------------------------------------------- film */
  const film = $('[data-film]');
  if (film) {
    const video = $('video', film);
    const play = $('.film-play', film);
    const start = () => { video.controls = true; film.classList.add('is-playing'); video.play().catch(() => { video.controls = true; }); };
    play.addEventListener('click', start);
    video.addEventListener('ended', () => { video.controls = false; film.classList.remove('is-playing'); video.currentTime = 0; video.load(); });
  }

  /* ------------------------------------------------------- language menu */
  const langMenu = $('[data-lang-menu]');
  if (langMenu) {
    // Choosing a language is remembered: English pages stop redirecting to Spanish (and the other way round).
    langMenu.addEventListener('click', (e) => {
      const link = e.target.closest('a[data-lang]');
      if (link) store.set('ys-lang', link.dataset.lang);
    });
    document.addEventListener('click', (e) => { if (!langMenu.contains(e.target)) langMenu.open = false; });
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || !langMenu.open) return;
      langMenu.open = false;
      $('summary', langMenu).focus();
    });
  }

  /* ---------------------------------------------- authoring-style switcher */
  const STYLE_KEY = 'ys-style';
  const styleSelect = $('[data-style-select]');
  function applyStyle(style, persist) {
    document.documentElement.dataset.style = style;
    $$('[data-style-group]').forEach((group) => {
      const tabs = $$('[role="tab"]', group);
      if (!tabs.some((t) => t.dataset.style === style)) return;
      tabs.forEach((t) => {
        const on = t.dataset.style === style;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      $$('.tabpanel', group).forEach((p) => (p.hidden = p.dataset.style !== style));
    });
    if (styleSelect) styleSelect.value = style;
    if (persist) store.set(STYLE_KEY, style);
  }
  const saved = store.get(STYLE_KEY);
  if (saved) applyStyle(saved, false);
  else if (styleSelect) styleSelect.value = 'hlsl';
  if (styleSelect) styleSelect.addEventListener('change', () => applyStyle(styleSelect.value, true));
  $$('[data-style-group]').forEach((group) => {
    group.addEventListener('click', (e) => {
      const tab = e.target.closest('[role="tab"]');
      if (tab) applyStyle(tab.dataset.style, true);
    });
    group.addEventListener('keydown', (e) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      const tabs = $$('[role="tab"]', group);
      const i = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
      const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      applyStyle(next.dataset.style, true);
      next.focus();
    });
  });

  /* -------------------------------------------------------- docs sidebar */
  const sidebar = $('#doc-sidebar');
  if (sidebar) {
    const toggle = $('.sidebar-toggle');
    const setOpen = (open) => {
      document.body.classList.toggle('sidebar-open', open);
      toggle?.setAttribute('aria-expanded', String(open));
    };
    toggle?.addEventListener('click', () => setOpen(!document.body.classList.contains('sidebar-open')));
    $('[data-sidebar-close]')?.addEventListener('click', () => setOpen(false));

    const GROUPS = 'ys-groups';
    let openGroups = [];
    try { openGroups = JSON.parse(sessionStorage.getItem(GROUPS) || '[]'); } catch { /* ignore */ }
    $$('.side-group', sidebar).forEach((g) => {
      if (openGroups.includes(g.dataset.group)) g.classList.add('is-open');
      const head = $('.side-group-head', g);
      head.setAttribute('aria-expanded', String(g.classList.contains('is-open')));
      head.addEventListener('click', () => {
        const open = g.classList.toggle('is-open');
        head.setAttribute('aria-expanded', String(open));
        const set = new Set(openGroups);
        open ? set.add(g.dataset.group) : set.delete(g.dataset.group);
        openGroups = [...set];
        try { sessionStorage.setItem(GROUPS, JSON.stringify(openGroups)); } catch { /* ignore */ }
      });
    });
    $('.side-link.is-current', sidebar)?.scrollIntoView({ block: 'center' });

    // Filter (press "/" to focus, like the Apple docs)
    const filter = $('[data-sidebar-filter]', sidebar);
    const none = $('.side-none', sidebar);
    filter?.addEventListener('input', () => {
      const q = filter.value.trim().toLowerCase();
      let any = false;
      $$('.side-link', sidebar).forEach((a) => {
        const hit = !q || a.dataset.filterText.includes(q);
        a.hidden = !hit;
        any ||= hit;
      });
      $$('.side-group', sidebar).forEach((g) => {
        const has = $$('.side-link', g).some((a) => !a.hidden);
        g.hidden = !has;
        if (q) g.classList.toggle('is-open', has);
      });
      $$('.side-label', sidebar).forEach((l) => {
        const block = l.closest('.side-block');
        l.hidden = !!q && !$$('.side-link', block).some((a) => !a.hidden);
      });
      none.hidden = any;
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
        e.preventDefault();
        if (matchMedia('(max-width: 960px)').matches) setOpen(true);
        filter?.focus();
      }
      if (e.key === 'Escape') setOpen(false);
    });
  }

  /* ---------------------------------------------------- TOC scroll-spy */
  const tocLinks = $$('.doc-toc a');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    const map = new Map(tocLinks.map((a) => [a.getAttribute('href').slice(1), a]));
    const heads = [...map.keys()].map((id) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            tocLinks.forEach((a) => a.classList.remove('is-active'));
            map.get(en.target.id)?.classList.add('is-active');
          }
        });
      },
      { rootMargin: '-110px 0px -70% 0px' },
    );
    heads.forEach((h) => io.observe(h));
  }

  /* --------------------------------------------------------------- search */
  const dialog = $('#search');
  if (dialog) {
    const input = $('input', dialog);
    const list = $('.search-results', dialog);
    const empty = $('.search-empty', dialog);
    let index = null;
    let results = [];
    let active = 0;
    let lastFocus = null;

    const load = () =>
      index ||
      (index = new Promise((resolve) => {
        const s = document.createElement('script');
        s.src = root + (lang === 'en' ? 'search-index.js' : `search-index.${lang}.js`);
        s.onload = () => resolve(window.__YS_SEARCH__ || []);
        s.onerror = () => resolve([]);
        document.head.appendChild(s);
      }));

    const escapeHtml = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    const mark = (text, terms) => {
      let out = escapeHtml(text);
      terms.forEach((t) => {
        if (t.length < 2) return;
        out = out.replace(new RegExp(`(${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig'), '<mark>$1</mark>');
      });
      return out;
    };

    const render = () => {
      list.innerHTML = results
        .map(
          (r, i) =>
            `<li><a href="${root + r.u.slice(1)}" class="${i === active ? 'is-active' : ''}" role="option"><small>${escapeHtml(r.s)}</small>${mark(r.t, r.terms)}${r.snippet ? `<span>${mark(r.snippet, r.terms)}</span>` : ''}</a></li>`,
        )
        .join('');
      empty.hidden = results.length > 0 || !input.value.trim();
    };

    const search = async () => {
      const data = await load();
      const terms = input.value.toLowerCase().split(/\s+/).filter(Boolean);
      if (!terms.length) { results = []; return render(); }
      results = data
        .map((d) => {
          const title = d.t.toLowerCase();
          const text = d.x.toLowerCase();
          let score = 0;
          for (const t of terms) {
            if (title.includes(t)) score += title.startsWith(t) ? 12 : 8;
            if (d.s.toLowerCase().includes(t)) score += 2;
            if (text.includes(t)) score += 3;
            else score -= 100;
          }
          if (score <= 0) return null;
          const at = text.indexOf(terms[0]);
          const snippet = at > -1 ? (at > 40 ? '…' : '') + d.x.slice(Math.max(0, at - 40), at + 110).trim() + '…' : '';
          return { ...d, score, terms, snippet };
        })
        .filter(Boolean)
        .sort((a, b) => b.score - a.score)
        .slice(0, 8);
      active = 0;
      render();
    };

    const open = () => {
      lastFocus = document.activeElement;
      dialog.hidden = false;
      document.body.style.overflow = 'hidden';
      input.value = '';
      results = [];
      render();
      input.focus();
      load();
    };
    const close = () => {
      dialog.hidden = true;
      document.body.style.overflow = '';
      lastFocus?.focus?.();
    };

    $$('[data-search-open]').forEach((b) => b.addEventListener('click', open));
    dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });
    input.addEventListener('input', search);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!results.length) return;
        active = (active + (e.key === 'ArrowDown' ? 1 : results.length - 1)) % results.length;
        render();
      } else if (e.key === 'Enter' && results[active]) {
        location.href = root + results[active].u.slice(1);
      }
    });
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        dialog.hidden ? open() : close();
      } else if (e.key === 'Escape' && !dialog.hidden) {
        close();
      }
    });
  }
})();

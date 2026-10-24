import { NAV, DONATIONS, SECTIONS, SITE } from './site.mjs';
import { icon, STYLES, wordmark } from './components.mjs';
import { esc } from './highlight.mjs';
import { BACKENDS } from './backends.mjs';
import { LOCALES, localizeHtml, localePath, clientStrings } from './i18n/index.mjs';

const FONTS =
  'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Outfit:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap';

/** Turns root-relative links ("/syntaxes/") into links relative to the page being written. */
export function relativize(html, pagePath) {
  const depth = pagePath.split('/').filter(Boolean).length;
  const prefix = depth === 0 ? './' : '../'.repeat(depth);
  return html
    .replace(/__ROOT__/g, prefix)
    .replace(/(href|src|poster|content|data-src)="\/(?!\/)/g, `$1="${prefix}`)
    .replace(/url\(\/(?!\/)/g, `url(${prefix}`);
}

/** Language dropdown: real links to the same page in each locale, so it also works without JavaScript. */
function langSwitch(locale, pagePath) {
  const cur = LOCALES[locale];
  const items = Object.values(LOCALES)
    .map(
      (L) =>
        `<li><a href="${localePath(pagePath, L.id)}" lang="${L.htmlLang}" hreflang="${L.htmlLang}" data-lang="${L.id}"${L.id === locale ? ' aria-current="true"' : ''}>${L.label}</a></li>`,
    )
    .join('');
  return `<details class="lang" data-lang-menu><summary aria-label="${cur.langLabel}: ${cur.label}">${icon('globe')}<span>${cur.label}</span>${icon('chevron-down')}</summary><ul class="lang-menu">${items}</ul></details>`;
}

/** Canonical address and the same page in every language. Absolute when SITE.url is set, root-relative otherwise. */
function seoTags(pagePath, locale) {
  const at = (id) => `${SITE.url}${localePath(pagePath, id)}`;
  const alternates = Object.values(LOCALES).map((L) => `<link rel="alternate" hreflang="${L.htmlLang}" href="${at(L.id)}">`);
  return [`<link rel="canonical" href="${at(locale)}">`, ...alternates, `<link rel="alternate" hreflang="x-default" href="${at('en')}">`].join('\n');
}

/** Last step of a page: translate (non-English locales), fill the locale placeholders and make links relative. */
function finalize(html, pagePath, locale) {
  const L = LOCALES[locale];
  if (locale !== 'en') html = localizeHtml(html, locale);
  const redirect =
    locale === 'en'
      ? `<script>try{var l=localStorage.getItem('ys-lang')||(navigator.languages&&navigator.languages[0])||navigator.language||'';if(/^es/i.test(l))location.replace('__ROOT__es${pagePath}'+location.hash)}catch(e){}</script>`
      : '';
  const strings =
    locale === 'en' ? '' : `<script>window.__YS_T__=${JSON.stringify(clientStrings(locale)).replace(/</g, '\\u003c')}</script>`;
  html = html
    .replace(/__FILM_LANG__/g, () => L.htmlLang)
    .replace('__HTMLLANG__', () => L.htmlLang)
    .replace('<!--LANGREDIRECT-->', () => redirect)
    .replace('<!--SEO-->', () => seoTags(pagePath, locale))
    .replace('<!--I18N-->', () => strings)
    .replace(/__LANGSWITCH__/g, () => langSwitch(locale, pagePath));
  return relativize(html, localePath(pagePath, locale));
}

function globalNav(currentSection) {
  const links = NAV.map(
    (n) =>
      `<a href="${n.href}"${n.id === currentSection ? ' aria-current="true"' : ''}>${n.label}</a>`,
  ).join('');
  const drawer = [
    ...NAV,
    DONATIONS,
  ]
    .map((n) => `<a href="${n.href}"${n.id === currentSection ? ' aria-current="true"' : ''}>${n.label}${icon('chevron-right')}</a>`)
    .join('');
  return `<header class="gnav" id="top">
  <div class="gnav-inner">
    <a class="brand" href="/" aria-label="${SITE.name} home">${wordmark({ size: 'nav' })}</a>
    <nav class="gnav-links" aria-label="Main">${links}</nav>
    <div class="gnav-actions">
      <button class="icon-btn" type="button" data-search-open aria-label="Search the site" title="Search (Ctrl/⌘ K)">${icon('search')}</button>
      <a class="icon-btn gnav-gh" href="${SITE.repo}" aria-label="GitHub repository" rel="noopener">${icon('github')}</a>
      <a class="support-btn" href="${DONATIONS.href}"${currentSection === 'donations' ? ' aria-current="true"' : ''}>${icon('heart')}<span>Donations</span></a>
      <button class="icon-btn nav-toggle" type="button" aria-label="Menu" aria-expanded="false" aria-controls="gnav-drawer">${icon('menu', 'i-open')}${icon('close', 'i-close')}</button>
    </div>
  </div>
  <nav class="gnav-drawer" id="gnav-drawer" aria-label="Mobile">${drawer}</nav>
</header>`;
}

function subNav(sectionId, currentPath) {
  const s = SECTIONS[sectionId];
  if (!s) return '';
  const links = s.sub
    .map(([label, href]) => `<a href="${href}"${href === currentPath ? ' aria-current="page"' : ''}>${label}</a>`)
    .join('');
  return `<div class="subnav"><div class="subnav-inner">${s.standard
    ? `<a class="subnav-title subnav-title--std" href="/technologies/compilation/" aria-label="Compiles to ${BACKENDS.map((b) => b.format).join(', ')}"><span class="std-lead">Compiles to</span><span class="spirv-chip spirv-chip--sm"><img src="/img/backends/spirv.svg" alt="SPIR-V"></span>${BACKENDS.filter((b) => b.format !== 'SPIR-V').map((b) => `<span class="fmt${b.logo ? ' fmt--logo' : ''}" title="${esc(b.name)}">${b.logo ? `<img src="${b.logo}" alt="${esc(b.name)}">` : ''}${esc(b.format)}</span>`).join('')}<span class="fmt fmt--more" title="${BACKENDS.filter((b) => b.format !== 'SPIR-V').map((b) => b.format).join(', ')}">+${BACKENDS.length - 1}</span></a>`
    : `<a class="subnav-title" href="${s.href}">${s.title}</a>`}<nav class="subnav-links" aria-label="${s.title}">${links}</nav></div></div>`;
}

function footer() {
  const col = (title, items) =>
    `<div class="foot-col"><h2>${title}</h2><ul>${items.map(([l, h]) => `<li><a href="${h}">${l}</a></li>`).join('')}</ul></div>`;
  return `<footer class="site-footer">
  <div class="foot-inner">
    <div class="foot-brand">
      ${wordmark({ size: 'foot' })}
      <p>${SITE.tagline}</p>
      <p><a href="mailto:${SITE.email}">${SITE.email}</a></p>
    </div>
    <div class="foot-cols">
      ${col('Explore', [['Get Started', '/get-started/'], ['Syntaxes', '/syntaxes/'], ['Playground', '/playground/'], ["What's New", '/whats-new/'], ['Resources', '/resources/']])}
      ${col('Documentation', [['All documentation', '/documentation/'], ['Your first shader', '/documentation/yotsuba-shader/writing-your-first-shader/'], ['Syntaxes', '/documentation/yotsuba-shader/choosing-a-syntax/'], ['Attribute reference', '/documentation/yotsuba-shader/builtin-values-across-syntaxes/']])}
      ${col('Community', [['Community', '/community/'], ['Contributing', '/community/contributing/'], ['Contact', '/community/contact/'], ['GitHub', SITE.repo], ['Sponsor on GitHub', SITE.sponsors], ['Donations', '/donations/']])}
      ${col('Legal', [['Licensing', '/community/licensing/'], ['Sponsors', '/donations/sponsors/']])}
    </div>
  </div>
  <div class="foot-legal">
    <p>Copyright © ${SITE.year} Yotsuba Shader contributors. Released under the Microsoft Public License (MS-PL).</p>
    <p class="foot-marks">Vulkan and the Vulkan logo are registered trademarks of the Khronos Group Inc. OpenGL® and the oval logo are trademarks or registered trademarks of Hewlett Packard Enterprise in the United States and/or other countries worldwide. WebGL and the WebGL logo are trademarks of the Khronos Group Inc. SPIR, SPIR-V and the SPIR logo are trademarks of the Khronos Group Inc. WebGPU logo by <a href="https://www.w3.org/" rel="noopener">W3C</a>, used under <a href="https://creativecommons.org/licenses/by/4.0/" rel="noopener">CC BY 4.0</a>. Metal is a trademark of Apple Inc.; Direct3D and DirectX are trademarks of Microsoft Corporation. These names and logos are used only to describe compilation targets and do not imply endorsement by or affiliation with their owners.</p>
  </div>
</footer>`;
}

const searchDialog = `<div class="search" id="search" hidden role="dialog" aria-modal="true" aria-label="Search">
  <div class="search-panel">
    <div class="search-field">${icon('search')}<input type="search" placeholder="Search Yotsuba Shader" autocomplete="off" spellcheck="false" aria-label="Search query"><kbd>esc</kbd></div>
    <ul class="search-results" role="listbox"></ul>
    <p class="search-empty" hidden>No results. Try “stage”, “SPIR-V”, “uniform” or “Metal”.</p>
  </div>
</div>`;

function head({ title, description, pagePath, fullTitle, noindex = false, styles = [] }) {
  return `<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="theme-color" content="#000000">
<title>${esc(fullTitle || `${title} - ${SITE.name}`)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:title" content="${esc(fullTitle || `${title} - ${SITE.name}`)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
<meta property="og:image" content="/img/yotsuba-shader.webp">
<link rel="icon" type="image/png" href="/img/favicon.png">
<link rel="apple-touch-icon" href="/img/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FONTS}" rel="stylesheet">
<link rel="stylesheet" href="/css/site.css">
${styles.map(src => `<link rel="stylesheet" href="${esc(src)}">`).join('\n')}
<script>try{var s=localStorage.getItem('ys-style');s={metal:'msl',vulkan:'spirv'}[s]||s;if(s)document.documentElement.dataset.style=s}catch(e){}</script>
<!--LANGREDIRECT-->
${noindex ? '<meta name="robots" content="noindex">' : '<!--SEO-->'}
</head>`;
}

/** Standard page (home, get started, syntaxes, ...). */
export function renderPage(page, locale = 'en') {
  const { path: pagePath, section, title, description, body, fullTitle, bodyClass = '', noFooter = false, scripts = [], styles = [], noindex = false } = page;
  const html = `<!doctype html>
<html lang="__HTMLLANG__" data-root="__ROOT__">
${head({ title, description, pagePath, fullTitle, noindex, styles })}
<body class="${bodyClass}">
<a class="skip" href="#main">Skip to content</a>
${globalNav(section)}
${subNav(section, pagePath)}
<main id="main">
${body.includes('__LANGSWITCH__') ? '' : '<div class="langbar">__LANGSWITCH__</div>\n'}${body}
</main>
${noFooter ? '' : footer()}
${searchDialog}
<!--I18N-->
<script src="/js/site.js" defer></script>
${scripts.map((src) => `<script src="${src}" defer></script>`).join('\n')}
</body>
</html>`;
  return finalize(html, pagePath, locale);
}

/* ------------------------------------------------------------------ docs */

function sidebar(tree, articlesBySlug, currentSlug, setHref) {
  const link = (slug) => {
    const a = articlesBySlug.get(slug);
    const href = `${setHref}${slug}/`;
    const current = slug === currentSlug;
    return `<a class="side-link${current ? ' is-current' : ''}" href="${href}"${current ? ' aria-current="page"' : ''} data-filter-text="${esc(a.title.toLowerCase())}">${icon(a.icon || 'doc')}<span>${esc(a.title)}</span></a>`;
  };

  return tree
    .map((block) => {
      if (block.items && !block.group) {
        return `<div class="side-block">${block.label ? `<p class="side-label">${block.label}</p>` : ''}${block.items.map(link).join('')}</div>`;
      }
      return `<div class="side-block">${block.label ? `<p class="side-label">${block.label}</p>` : ''}${block.groups
        .map((g) => {
          const open = g.items.includes(currentSlug);
          return `<div class="side-group${open ? ' is-open' : ''}" data-group="${esc(g.title)}">
  <button class="side-group-head" type="button" aria-expanded="${open}"><span class="chev">${icon('chevron-right')}</span>${icon('list')}<span>${esc(g.title)}</span></button>
  <div class="side-group-items">${g.items.map(link).join('')}</div>
</div>`;
        })
        .join('')}</div>`;
    })
    .join('');
}

/** Documentation article page (left tree + hero + body + TOC). */
export function renderDoc({ set, article, tree, articlesBySlug, prev, next, toc, body, pagePath, locale = 'en' }) {
  const setHref = `/documentation/${set.slug}/`;
  const tocHtml = toc.length && !article.wide
    ? `<aside class="doc-toc" aria-label="On this page"><p>On this page</p><ul>${toc
        .map((t) => `<li><a href="#${t.id}">${esc(t.text)}</a></li>`)
        .join('')}</ul></aside>`
    : '';
  const styleSelect = `<label class="style-select"><span>Syntax:</span><select data-style-select aria-label="Syntax for code samples">${STYLES.map((s) => `<option value="${s.id}">${s.label}</option>`).join('')}</select></label>`;
  const pager = `<nav class="doc-pager" aria-label="Previous and next">
  ${prev ? `<a class="prev" href="${prev.slug === 'index' ? setHref : setHref + prev.slug + '/'}">${icon('chevron-left')}<span><small>Previous</small>${esc(prev.title)}</span></a>` : '<span></span>'}
  ${next ? `<a class="next" href="${setHref}${next.slug}/"><span><small>Next</small>${esc(next.title)}</span>${icon('chevron-right')}</a>` : '<span></span>'}
</nav>`;
  const crumbs = `<nav class="crumbs" aria-label="Breadcrumb"><a href="/documentation/">Documentation</a><span>/</span><a href="${setHref}">${esc(set.title)}</a>${article.slug === 'index' ? '' : `<span>/</span><span aria-current="page">${esc(article.title)}</span>`}</nav>`;

  const html = `<!doctype html>
<html lang="__HTMLLANG__" data-root="__ROOT__">
${head({ title: article.title, description: article.summary, pagePath, fullTitle: `${article.title} | Documentation - ${SITE.name}` })}
<body class="docs">
<a class="skip" href="#main">Skip to content</a>
${globalNav('documentation')}
<div class="docbar">
  <div class="docbar-inner">
    <button class="icon-btn sidebar-toggle" type="button" aria-label="Toggle navigation" aria-controls="doc-sidebar" aria-expanded="false">${icon('sidebar')}</button>
    <a class="docbar-title" href="/documentation/">Documentation</a>
    ${styleSelect}
    <div class="lang-slot">__LANGSWITCH__</div>
  </div>
</div>
<div class="doc-shell">
  <aside class="doc-sidebar" id="doc-sidebar" aria-label="Documentation navigation">
    <div class="side-top">
      <a class="side-back" href="/documentation/">${icon('chevron-left')}<span>All Documentation</span></a>
      <h2 class="side-title"><a href="${setHref}">${esc(set.title)}</a></h2>
    </div>
    <nav class="side-scroll" data-sidebar>
      ${sidebar(tree, articlesBySlug, article.slug, setHref)}
      <p class="side-none" hidden>No matching topics.</p>
    </nav>
    <div class="side-filter">
      <label class="filter">${icon('list')}<input type="search" placeholder="Filter" aria-label="Filter topics" data-sidebar-filter></label>
      <kbd title="Press / to filter">/</kbd>
    </div>
  </aside>
  <div class="doc-backdrop" data-sidebar-close></div>
  <main class="doc-main" id="main">
    <header class="doc-hero doc-hero--${article.heroKind || 'article'}">
      <div class="doc-hero-inner">
        ${crumbs}
        <p class="doc-kind">${esc(article.kind || 'Article')}</p>
        <h1>${esc(article.title)}</h1>
        <p class="doc-summary">${esc(article.summary)}</p>
        <span class="doc-hero-icon">${icon(article.heroIcon || article.icon || 'doc')}</span>
      </div>
    </header>
    <div class="doc-content${article.wide ? ' doc-content--wide' : ''}">
      <article class="doc-body prose">${body}</article>
      ${tocHtml}
    </div>
    ${pager}
    <div class="doc-foot">Copyright © ${SITE.year} Yotsuba Shader contributors · <a href="/community/licensing/">Licensing</a> · <a href="${SITE.repo}" rel="noopener">GitHub</a></div>
  </main>
</div>
${searchDialog}
<!--I18N-->
<script src="/js/site.js" defer></script>
</body>
</html>`;
  return finalize(html, pagePath, locale);
}

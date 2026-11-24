// HTML templates: shell (top bar, footer), home, section viewer, 404.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { esc } from './highlight.mjs';
import { speakable } from './tts.mjs';
import { SITE, LANGS, SECTIONS, ENGINES, ROUTES, SOURCE_LANGUAGES, UI } from '../site.config.mjs';

const ICONS = {
  cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>',
  puzzle: '<path d="M10 4a2 2 0 1 1 4 0v1h4a1 1 0 0 1 1 1v4h-1a2 2 0 1 0 0 4h1v4a1 1 0 0 1-1 1h-4v-1a2 2 0 1 0-4 0v1H6a1 1 0 0 1-1-1v-4h1a2 2 0 1 0 0-4H5V6a1 1 0 0 1 1-1h4z"/>',
  spark: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
  code: '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5M8 7h7M8 11h7"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  chevron: '<path d="M9 5l7 7-7 7"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/>',
  left: '<path d="M15 5l-7 7 7 7"/>',
  play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor"/>',
  pause: '<path d="M8 5v14M16 5v14" stroke-width="2.6"/>',
  right: '<path d="M9 5l7 7-7 7"/>',
  dots: '<circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
};
export const icon = (n, cls = '') =>
  `<svg class="icon ${cls}" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]}</svg>`;

const url = (...p) => '/' + p.filter(Boolean).join('/') + (p.length ? '/' : '');

const subbarOf = (body) => (body.match(/<!--SUBBAR:([\s\S]*?)-->/) || [])[1] || '';

function shell({ lang, title, description, path, alt, body, bodyClass = '', section = null, noindex = false, usesStyles = false, route = null, routeAlt = null, stage = false }) {
  const t = UI[lang];
  const fullTitle = path === '' ? `${t.homeTitle}` : `${title} · ${t.siteName} ${t.siteTag}`;
  const canon = SITE.url + (path === '' ? url(lang) : url(lang, path));
  const alternates = Object.keys(LANGS)
    .filter((l) => alt?.[l] !== undefined)
    .map((l) => `<link rel="alternate" hreflang="${l}" href="${SITE.url}${alt[l]}">`)
    .join('');
  const sectionLinks = SECTIONS.map(
    (s) => `<a href="${url(lang, s.id)}"${section === s.id ? ' aria-current="page"' : ''}>${t.sections[s.id].short}</a>`,
  ).join('');
  const otherLangs = Object.keys(LANGS)
    .map((l) => `<a href="${alt?.[l] ?? url(l)}" hreflang="${l}" lang="${l}"${l === lang ? ' aria-current="true"' : ''}>${LANGS[l].label}</a>`)
    .join('');
  return `<!doctype html>
<html lang="${LANGS[lang].html}" data-lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description || t.metaDescription)}">
<meta name="color-scheme" content="light dark">
${noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${canon}">${alternates}`}
<meta property="og:title" content="${esc(fullTitle)}"><meta property="og:description" content="${esc(description || t.metaDescription)}"><meta property="og:type" content="website"><meta property="og:image" content="${SITE.url}/img/logo.png">
<link rel="icon" href="/img/favicon.png"><link rel="apple-touch-icon" href="/img/apple-touch-icon.png">
<script>try{var th=localStorage.getItem('ys-theme');if(th)document.documentElement.dataset.theme=th}catch(e){}</script>
<link rel="stylesheet" href="/css/learn.css">
${bodyClass === 'home' ? '<link rel="stylesheet" href="/css/banner.css">' : ''}
${stage ? '<link rel="stylesheet" href="/css/stage.css">' : ''}
</head>
<body class="${bodyClass}" data-uses-styles="${usesStyles}"${route ? ` data-route="${route}"` : ''}>
<a class="skip" href="#main">${t.skip}</a>
<header class="topbar">
  <div class="topbar-in">
    <button class="icon-btn only-narrow" id="menu-btn" type="button" aria-label="${t.menu}" aria-controls="sidebar" aria-expanded="false">${icon('menu')}</button>
    <a class="brand" href="${url(lang)}"><img src="/img/logo.png" alt="" width="28" height="28"><span>${t.siteName}</span><em>${t.siteTag}</em></a>
    <nav class="sections" aria-label="${t.siteName}">${sectionLinks}</nav>
    <div class="topbar-end">
      <button class="search-btn" id="search-btn" type="button" aria-label="${t.search}">${icon('search')}<span>${t.search}</span><kbd>⌘K</kbd></button>
      <div class="menu-wrap">
        <button class="icon-btn" id="settings-btn" type="button" aria-haspopup="true" aria-expanded="false" aria-label="${t.language} / ${t.theme}">${icon('globe')}</button>
        <div class="popover" id="settings" hidden>
          <div class="pop-label">${t.language}</div><div class="pop-list">${otherLangs}</div>
          <div class="pop-label">${t.theme}</div>
          <div class="seg" id="theme-seg" role="group" aria-label="${t.theme}">${['auto', 'light', 'dark'].map((k) => `<button type="button" data-theme="${k}">${t.themes[k]}</button>`).join('')}</div>
        </div>
      </div>
    </div>
  </div>
</header>
${subbarOf(body)}
${body}
<footer class="footer"><div class="wrap"><span>${t.footer}</span><span><a href="${SITE.mainSite}">${t.mainSite}</a> · ${t.trademarks}</span></div></footer>
<div class="scrim" id="scrim" hidden></div>
<dialog id="search-dialog" aria-label="${t.search}"><form method="dialog"><div class="sd-box">${icon('search')}<input id="search-input" type="search" placeholder="${t.searchPlaceholder}" autocomplete="off" spellcheck="false" aria-label="${t.search}"><button class="sd-close" value="close" aria-label="${t.close}">Esc</button></div></form><ul id="search-results" role="listbox"></ul></dialog>
<script>window.LEARN=${JSON.stringify({ lang, routes: routeAlt, ui: { copy: t.copy, copied: t.copied, noResults: t.noResults, progress: t.progress, routeNotice: t.routeNotice('{name}'), listen: t.listen, pause: t.listenPause, resume: t.listenResume, loading: t.listenLoading, error: t.listenError } })}</script>
<script src="/js/learn.js" defer></script>
${bodyClass === 'home' ? '<script src="/js/banner.js" defer></script>' : ''}
${stage ? '<script src="/js/stage.js" defer></script>' : ''}

</body></html>`;
}

const LOGOS = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'static', 'img', 'engines');

/* ----------------------------------------------------------------- banners */
// One banner per source language, stacked one under the other. On the left, squares choose what is shown: the
// language name alone, or an example shader written in that language; on the right, a card; along the bottom, the sections as buttons. Each
// button opens the chapter of that section written for the language (or the section index when it has none of its
// own, as C# does for the original chapters).
function banners(lang) {
  const t = UI[lang];
  const slides = SOURCE_LANGUAGES.map((s) => {
    const copy = t.banners[s.id];
    const links = s.buttons
      ? s.buttons.map((b) => `<a class="slide-link" href="${url(lang, ...b.page)}"><img class="engine-logo${b.wide ? ' wide' : ''}" src="/img/apis/${b.logo}" alt="" width="${b.wide ? 76 : 32}" height="32"><span>${esc(b.name)}</span><i>${icon('right')}</i></a>`).join('')
      : ENGINES.filter((e) => ROUTES.some((x) => x.id === e.id)).map((e) => {
      const r = ROUTES.find((x) => x.id === e.id);
      const href = r ? url(lang, 'get-started', r.prefix.replace(/\/$/, '') || undefined) : url(lang, 'engines', e.id);
      const logo = ['svg', 'png'].find((x) => fs.existsSync(path.join(LOGOS, `${e.id}.${x}`)));
      return `<a class="slide-link" href="${href}">${logo ? `<img class="engine-logo" src="/img/engines/${e.id}.${logo}" alt="" width="32" height="32">` : ''}<span>${esc(e.name)}</span><i>${icon('right')}</i></a>`;
    }).join('');
    const dots = [t.paneLogo, t.paneExample]
      .map((label, n) => `<li><button type="button" data-pane="${n}" aria-label="${esc(label)}" title="${esc(label)}" aria-current="${n === 0}"></button></li>`)
      .join('');
    return `<article class="slide" id="${s.id}" style="--c1:${s.c1};--c2:${s.c2};--c3:${s.c3}" aria-label="${esc(s.name)}">
      <ol class="slide-dots" aria-label="${t.examplesLabel(s.name)}">${dots}</ol>
      <div class="slide-art">
        <div class="art-pane art-logo is-active" aria-hidden="true"><span class="art-word${s.name.length > 4 ? ' long' : ''}">${esc(s.name)}</span></div>
        <pre class="art-pane art-code" aria-hidden="true">${esc(s.example)}</pre>
      </div>
      <div class="slide-card">
        <p class="kicker">${t.bannerKicker} · ${esc(s.name)}</p>
        <h2>${esc(copy.title)}</h2>
        <p class="slide-text">${esc(copy.text)}</p>
      </div>
      <nav class="slide-links" aria-label="${esc(s.name)}">${links}</nav>
    </article>`;
  }).join('');
  return `<section class="banner" id="banner" aria-label="${t.bannerLabel}">${slides}</section>`;
}

/* ------------------------------------------------------------------- home */
export function homePage({ lang, sections, alt }) {
  const t = UI[lang];
  const cards = SECTIONS.map((s, n) => {
    const info = sections[s.id];
    const copy = t.sections[s.id];
    const engines =
      s.id === 'engines'
        ? `<ul class="engine-row" aria-label="${t.enginesRowLabel}">${ENGINES.map(
            (e) => { const r = ROUTES.find((x) => x.id === e.id); return `<li><a href="${r ? url(lang, 'get-started', r.prefix.replace(/\/$/, '') || undefined) : url(lang, 'engines', e.id)}" title="${e.name}">${e.name}</a></li>`; },
          ).join('')}</ul>`
        : '';
    return `<article class="tile tile-${s.id}">
      <a class="tile-link" href="${url(lang, s.id)}" aria-label="${copy.title}"></a>
      <div class="tile-ico">${icon(s.icon, 'big')}</div>
      <h2>${copy.title}</h2>
      <p>${copy.blurb}</p>
      ${engines}
      <div class="tile-foot"><span class="meta">${t.chapters(info.count)} · ${t.minutes(info.minutes)}</span><span class="open">${t.open}${icon('chevron')}</span></div>
    </article>`;
  }).join('');
  return shell({
    lang, title: t.homeTitle, path: '', alt, bodyClass: 'home',
    body: `<main id="main">${banners(lang)}<section class="hero wrap"><h1>${t.homeTitle}</h1><p>${t.homeLead}</p><button class="hero-search" id="hero-search" type="button">${icon('search')}<span>${t.searchPlaceholder}</span><kbd>⌘K</kbd></button></section><section class="tiles wrap">${cards}</section></main>`,
  });
}

/* ---------------------------------------------------------------- chapter */
export function chapterPage({ lang, section, pages, page, index, alt, speech, routes = null, stage = null }) {
  const t = UI[lang];
  const sec = t.sections[section];
  const prev = pages[index - 1], next = pages[index + 1];
  const sidebar = pages
    .map((p) => `<li><a href="${p.href || p.url}" data-page="${p.id}"${p === page ? ' aria-current="page"' : ''}><span class="num">${p.num}</span><span class="lbl">${esc(p.title)}</span>${p.status === 'planned' ? `<span class="badge">${t.planned}</span>` : ''}<span class="done" aria-hidden="true">${icon('check')}</span></a></li>`)
    .join('');
  const toc = page.headings.length
    ? `<nav class="toc" aria-label="${t.onThisPage}"><div class="toc-title">${t.onThisPage}</div><ul>${page.headings.map((h) => `<li class="l${h.level}"><a href="#${h.id}">${esc(h.text)}</a></li>`).join('')}</ul></nav>`
    : '';
  const STYLE_OPTIONS = { glsl: 'GLSL', hlsl: 'HLSL', msl: 'MSL (Metal)', wgsl: 'WGSL', spirv: 'SPIR-V' };
  // Like Apple's documentation: a bar under the header with a "Language" dropdown on the right; here it picks the code style.
  const routePicker = routes
    ? `<div class="route-pick" id="route-pick" role="group" aria-label="${t.route}"><span>${t.route}:</span>${routes.map((r) => `<a href="${r.url}" data-route="${r.id}" title="${esc(r.hint)}"${r.current ? ' aria-current="true"' : ''}>${esc(r.name)}</a>`).join('')}</div>`
    : '';
  const styleSelect = page.usesStyles
    ? `<label class="style-select"><span>${t.codeStyle}:</span><select id="style-select" aria-label="${t.codeStyle}">${Object.entries(STYLE_OPTIONS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></label>`
    : '';
  const styleBar = page.usesStyles || routes
    ? `<div class="subbar" id="style-picker"><div class="subbar-in"><span class="subbar-title">${sec.title}</span><div class="subbar-end">${routePicker}${styleSelect}</div></div></div>`
    : '';
  const sectionUrl = pages.find((p) => p.slug === 'index')?.url || url(lang, section);
  const pager = `<nav class="pager" aria-label="${t.chaptersLabel}">${
    prev ? `<a class="prev" href="${prev.url}"><small>${icon('left')}${t.prev}</small><span>${esc(prev.title)}</span></a>` : '<span></span>'
  }${next ? `<a class="next" href="${next.url}"><small>${t.next}${icon('right')}</small><span>${esc(next.title)}</span></a>` : '<span></span>'}</nav>`;
  const edit = SITE.editUrl ? `<a class="edit" href="${SITE.editUrl}/${lang}/${page.file}" rel="noopener" target="_blank">${t.edit}</a>` : '';
  const v = page.video;
  const videoCard = v
    ? `<figure class="video-card"><video controls preload="metadata" playsinline${v.poster ? ` poster="${v.poster}"` : ''} aria-label="${esc(v.title || page.title)}"><source src="${v.src}" type="video/mp4">${v.vtt ? `<track kind="subtitles" src="${v.vtt}" srclang="${lang}" label="${t.videoSubtitles}" default>` : ''}</video><figcaption><span class="vc-tag">${icon('play', 'i-play')}${t.video}</span><span>${esc(v.title || page.title)}</span>${v.minutes ? `<span class="vc-min">${t.videoMin(v.minutes)}</span>` : ''}</figcaption></figure>`
    : '';
  const rawArticle = `<header><div class="title-row"><h1>${esc(page.title)}</h1><!--LISTEN--></div><p class="meta">${t.minRead(page.minutes)}${page.status === 'planned' ? ` · <span class="badge">${t.planned}</span>` : ''}</p>${page.summary ? `<p class="lead">${esc(page.summary)}</p>` : ''}</header>
      ${videoCard}
      ${page.status === 'planned' ? `<aside class="callout planned" role="note"><div class="callout-title">${t.planned}</div><p>${t.planNote}</p></aside>` : ''}
      ${page.html}`;
  // every spoken word gets its own <span> so the player can light it up; speech.audioFor() says if matching audio exists
  const spoken = speakable(rawArticle);
  const audioSrc = speech ? speech.audioFor(spoken.blocks) : null;
  const listenBtn = audioSrc
    ? `<button class="listen" id="listen" type="button" data-src="${audioSrc}" aria-pressed="false" title="${t.listenTitle}">${icon('play', 'i-play')}${icon('pause', 'i-pause')}<span>${t.listen}</span></button>`
    : '';
  const article = spoken.html.replace('<!--LISTEN-->', listenBtn);
  // the stage: motion graphics on the right half while the page is read aloud (desktop only, see stage.js)
  const hasStage = !!(audioSrc && stage?.length);
  const stageHtml = hasStage
    ? `<aside class="stage" id="stage" aria-label="${t.stageLabel}" hidden><div class="stage-screen" id="stage-screen"></div><button class="stage-close" id="stage-close" type="button" aria-label="${t.stageClose}" title="${t.stageClose}">${icon('close')}</button><div class="stage-bar" id="stage-bar" aria-hidden="true"><span id="stage-progress"></span></div></aside>
  <button class="stage-dots" id="stage-dots" type="button" aria-label="${t.stageMenu}" title="${t.stageMenu}" aria-controls="sidebar" aria-expanded="false" hidden>${icon('dots')}</button>
  <script type="application/json" id="stage-data">${JSON.stringify({ lang, seek: t.stageSeek, scenes: stage }).replace(/</g, '\\u003c')}</script>`
    : '';
  const body = `<!--SUBBAR:${styleBar}-->
<div class="doc${hasStage ? ' has-stage' : ''}">
  <aside class="sidebar" id="sidebar" aria-label="${t.chaptersLabel}">
    <div class="side-head"><a class="crumb-sec" href="${sectionUrl}">${sec.title}</a><button class="icon-btn only-narrow" id="side-close" type="button" aria-label="${t.close}">✕</button></div>
    <div class="progress" aria-hidden="true"><span id="progress-bar"></span></div>
    <ol class="chapters">${sidebar}</ol>
  </aside>
  <main id="main" class="article-wrap">
    <nav class="crumbs" aria-label="breadcrumb"><a href="${url(lang)}">${t.siteTag}</a>${icon('chevron')}<a href="${sectionUrl}">${sec.short}</a>${icon('chevron')}<span>${esc(page.title)}</span></nav>
    <article class="article">${article}
      ${edit}
    </article>
    ${pager}
  </main>
  ${toc}
  ${stageHtml}
</div>`;
  return shell({ lang, title: page.title, description: page.summary, path: page.path, alt, body, bodyClass: 'doc-page', section, usesStyles: page.usesStyles, route: page.route, routeAlt: routes ? Object.fromEntries(routes.map((r) => [r.id, { url: r.url, name: r.name }])) : null, stage: hasStage });
}

export function notFoundPage(lang) {
  const t = UI[lang];
  return shell({ lang, title: t.notFound, path: '404', noindex: true, body: `<main id="main" class="wrap nf"><h1>${t.notFound}</h1><p>${t.notFoundText}</p><a class="btn" href="${url(lang)}">${t.backHome}</a></main>` });
}

export function rootRedirect() {
  const langs = Object.keys(LANGS);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Yotsuba Shader Learn</title><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="canonical" href="${SITE.url}/${SITE.defaultLang}/">${langs.map((l) => `<link rel="alternate" hreflang="${l}" href="${SITE.url}/${l}/">`).join('')}<link rel="alternate" hreflang="x-default" href="${SITE.url}/${SITE.defaultLang}/"><meta http-equiv="refresh" content="1;url=/${SITE.defaultLang}/"><script>try{var s=localStorage.getItem('ys-lang');var l=s||((navigator.language||'en').slice(0,2));location.replace('/'+(${JSON.stringify(langs)}.indexOf(l)>=0?l:'${SITE.defaultLang}')+'/')}catch(e){location.replace('/${SITE.defaultLang}/')}</script></head><body><p>${langs.map((l) => `<a href="/${l}/">${LANGS[l].label}</a>`).join(' · ')}</p></body></html>`;
}

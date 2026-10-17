// Localization for the static site. The generator renders every page in English; for another locale the final HTML
// is translated with a dictionary (src/i18n/<locale>/*.json): one entry per unit of text, keyed by its English HTML.
// Dependency-free, like the rest of the generator.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

export const LOCALES = {
  en: { id: 'en', label: 'English', prefix: '', htmlLang: 'en', langLabel: 'Language' },
  es: { id: 'es', label: 'Español', prefix: '/es', htmlLang: 'es', langLabel: 'Idioma' },
};

/** Root-relative path of a page in a locale ("/syntaxes/" → "/es/syntaxes/"). */
export const localePath = (pagePath, locale) => `${LOCALES[locale].prefix}${pagePath}`;

/* ------------------------------------------------------------ dictionaries */
const cache = new Map();

function loadLocale(locale) {
  if (cache.has(locale)) return cache.get(locale);
  const dir = path.join(HERE, locale);
  const dict = new Map();
  const comments = new Map();
  let ui = {};
  const keep = new Set();
  if (fs.existsSync(dir)) {
    for (const file of fs.readdirSync(dir).sort()) {
      if (!file.endsWith('.json')) continue;
      const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
      if (file === 'comments.json') Object.entries(data).forEach(([k, v]) => comments.set(k, v));
      else if (file === 'ui.json') ui = data;
      else if (file === 'keep.json') data.forEach((k) => keep.add(k));
      else for (const [k, v] of Object.entries(data)) dict.set(k, v);
    }
  }
  const entry = { id: locale, dict, comments, ui, keep, used: new Set(), missing: new Set(), missingComments: new Set() };
  cache.set(locale, entry);
  return entry;
}

/** Report of what is missing or unused for a locale, valid after the pages have been rendered. */
export function i18nReport(locale) {
  const l = loadLocale(locale);
  const unused = [...l.dict.keys()].filter((k) => !l.used.has(k));
  return { missing: [...l.missing], missingComments: [...l.missingComments], unused, entries: l.dict.size };
}

export const clientStrings = (locale) => loadLocale(locale).ui;

/* ------------------------------------------------------------------ parser */
const VOID = new Set(['meta', 'link', 'img', 'br', 'hr', 'input', 'source', 'area', 'base', 'col', 'embed', 'track', 'wbr']);
const RAW = new Set(['script', 'style', 'pre', 'textarea']);
const TAG = /<!--[\s\S]*?-->|<![^>]*>|<(\/?)([A-Za-z][\w:-]*)((?:"[^"]*"|'[^']*'|[^'">])*)>/g;

function parse(html) {
  const root = { type: 'root', children: [] };
  const stack = [root];
  let last = 0;
  TAG.lastIndex = 0;
  let m;
  while ((m = TAG.exec(html))) {
    const top = stack[stack.length - 1];
    if (m.index > last) top.children.push({ type: 'text', raw: html.slice(last, m.index) });
    const raw = m[0];
    last = m.index + raw.length;
    if (raw.startsWith('<!')) {
      top.children.push({ type: 'raw', raw });
      continue;
    }
    const name = m[2].toLowerCase();
    if (m[1] === '/') {
      let i = stack.length - 1;
      while (i > 0 && stack[i].name !== name) i--;
      if (i > 0) {
        stack[i].close = raw;
        stack.length = i;
      } else top.children.push({ type: 'raw', raw });
      continue;
    }
    const el = { type: 'el', name, open: raw, children: [], close: '' };
    top.children.push(el);
    if (/\/\s*>$/.test(raw) || VOID.has(name)) continue;
    if (RAW.has(name)) {
      const re = new RegExp(`</${name}\\s*>`, 'i');
      const rest = html.slice(last);
      const end = re.exec(rest);
      if (end) {
        el.children.push({ type: 'raw', raw: rest.slice(0, end.index) });
        el.close = end[0];
        last += end.index + end[0].length;
        TAG.lastIndex = last;
      }
      continue;
    }
    stack.push(el);
  }
  if (last < html.length) stack[0].children.push({ type: 'text', raw: html.slice(last) });
  return root;
}

const ser = (n) =>
  n.type === 'el' ? n.open + n.children.map(ser).join('') + n.close : n.type === 'root' ? n.children.map(ser).join('') : n.raw;

const textOf = (n) =>
  n.type === 'text' ? n.raw : n.type === 'el' ? n.children.map(textOf).join('') : '';

/* ------------------------------------------------------------- translation */
const INLINE = new Set(['a', 'span', 'code', 'strong', 'em', 'b', 'i', 'kbd', 'abbr', 'sup', 'sub', 'mark', 'u', 'br', 'img', 'wbr', 'svg']);
const SKIP = new Set(['script', 'style', 'pre', 'code', 'kbd', 'textarea']);

const collapse = (s) => s.replace(/\s+/g, ' ').trim();
const plain = (s) => s.replace(/<[^>]+>/g, '').replace(/&[a-z]+;|&#\d+;/gi, ' ').trim();

/** False for text that is not prose: symbols, identifiers, acronyms and names kept as they are. */
function needsTranslation(key, l) {
  const text = plain(key);
  if (!/[A-Za-z]{2}/.test(text)) return false;
  if (l.keep.has(text)) return false;
  if (!/\s/.test(text) && /[0-9_.:#\-/()+@\\]|^[A-Z0-9]+$|[a-z][A-Z]/.test(text)) return false;
  return true;
}

const isInlineOnly = (n) =>
  n.type !== 'el' || (INLINE.has(n.name) && n.children.every(isInlineOnly));

const isPeelable = (n) =>
  (n.type === 'text' && !n.raw.trim()) ||
  (n.type === 'el' && (n.name === 'svg' || n.name === 'img' || (n.name === 'a' && /class="[^"]*\banchor\b/.test(n.open))));

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function lookup(l, key) {
  const tr = l.dict.get(key);
  if (tr != null) l.used.add(key);
  return tr;
}

function translateRun(run, l) {
  const lead = [];
  const trail = [];
  while (run.length && isPeelable(run[0])) lead.push(run.shift());
  while (run.length && isPeelable(run[run.length - 1])) trail.unshift(run.pop());
  if (!run.length) return [...lead, ...trail];
  const inner = run.map(ser).join('');
  const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(inner);
  const key = collapse(m[2]);
  if (!key) return [...lead, ...run, ...trail];
  const tr = lookup(l, key);
  if (tr == null) {
    if (needsTranslation(key, l)) l.missing.add(key);
    return [...lead, ...run, ...trail];
  }
  return [...lead, { type: 'raw', raw: m[1] + tr + m[3] }, ...trail];
}

/** Segments of a page title ("Styles - Yotsuba Shader"): each part is translated on its own. */
function translateTitle(value, l) {
  return value
    .split(/( - | \| )/)
    .map((part) => {
      const key = collapse(part);
      if (!key || /^( - | \| )$/.test(part)) return part;
      const tr = lookup(l, key);
      if (tr == null) {
        if (needsTranslation(key, l)) l.missing.add(key);
        return part;
      }
      return tr;
    })
    .join('');
}

const ATTRS = /(\s(?:title|aria-label|placeholder)=")([^"]*)(")/g;
const META = /\s(?:name="description"|property="og:(?:title|description)")/;

function translateAttrs(el, l) {
  let open = el.open;
  open = open.replace(ATTRS, (all, a, value, z) => {
    const key = collapse(value);
    if (!key || !needsTranslation(key, l)) return all;
    const tr = lookup(l, key);
    if (tr == null) {
      if (/\s/.test(key)) l.missing.add(key);
      return all;
    }
    return a + tr + z;
  });
  if (el.name === 'meta' && META.test(open)) {
    open = open.replace(/(\scontent=")([^"]*)(")/, (all, a, value, z) => a + translateTitle(value, l) + z);
  }
  el.open = open;
}

function translateComments(src, l) {
  return src.replace(/(<span class="tok-c">)([\s\S]*?)(<\/span>)/g, (all, a, text, z) => {
    if (!/[A-Za-z]{3}/.test(text)) return all;
    const tr = l.comments.get(text);
    if (tr == null) {
      l.missingComments.add(text);
      return all;
    }
    l.used.add(`comment:${text}`);
    return a + tr + z;
  });
}

/** `//` comments inside raw source text (the playground examples). */
export function translateSourceComments(src, locale) {
  const l = loadLocale(locale);
  return src.replace(/\/\/[^\n]*/g, (c) => {
    const key = esc(c.trimEnd());
    const tr = l.comments.get(key);
    if (tr == null) {
      if (/[A-Za-z]{3}/.test(c)) l.missingComments.add(key);
      return c;
    }
    l.used.add(`comment:${key}`);
    return tr.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  });
}

function process(el, l) {
  if (el.type !== 'el') return;
  translateAttrs(el, l);
  if (el.name === 'pre') {
    el.children = el.children.map((c) => (c.type === 'raw' ? { type: 'raw', raw: translateComments(c.raw, l) } : c));
    return;
  }
  if (el.name === 'script') {
    if (/\bid="pg-examples"/.test(el.open) && el.children[0]) {
      const data = JSON.parse(el.children[0].raw);
      for (const ex of data) for (const f of ex.files) f.source = translateSourceComments(f.source, l.id);
      el.children[0] = { type: 'raw', raw: JSON.stringify(data).replace(/</g, '\\u003c') };
    }
    return;
  }
  if (SKIP.has(el.name)) return;
  if (el.name === 'title') {
    el.children = el.children.map((c) => (c.type === 'text' ? { type: 'raw', raw: translateTitle(c.raw, l) } : c));
    return;
  }
  const hasText = el.children.some((c) => c.type === 'text' && c.raw.trim());
  if (!hasText) {
    el.children.forEach((c) => process(c, l));
  } else {
    const out = [];
    let run = [];
    const flush = () => {
      if (run.length) out.push(...translateRun(run, l));
      run = [];
    };
    for (const c of el.children) {
      if (c.type === 'text' || (c.type === 'el' && INLINE.has(c.name) && isInlineOnly(c))) {
        run.push(c);
      } else {
        flush();
        process(c, l);
        out.push(c);
      }
    }
    flush();
    el.children = out;
  }
  if (/\sdata-filter-text="/.test(el.open)) {
    const text = collapse(textOf(el)).toLowerCase();
    el.open = el.open.replace(/(\sdata-filter-text=")[^"]*(")/, `$1${esc(text)}$2`);
  }
}

/** Paths that are files, not pages: they keep the same URL in every locale. */
const ASSET = /^\/(?:css|js|img|downloads|playground-app|search-index)/;

function localizeLinks(html, locale) {
  const prefix = LOCALES[locale].prefix;
  if (!prefix) return html;
  return html.replace(/(\shref=")(\/(?!\/)[^"]*)(")/g, (all, a, href, z) => (ASSET.test(href) ? all : `${a}${prefix}${href}${z}`));
}

/** Images with text in them live in one folder per language: /img/l10n/en/... becomes /img/l10n/<locale>/... */
function localizeImages(html, locale) {
  return html.replace(/(\s(?:src|srcset)=")\/img\/l10n\/en\//g, `$1/img/l10n/${locale}/`);
}

/** Translates a piece of HTML (a page body or a complete page) and rewrites its page links for the locale. */
export function localizeHtml(html, locale, { links = true } = {}) {
  if (locale === 'en') return html;
  const l = loadLocale(locale);
  const tree = parse(html);
  tree.children.forEach((c) => process(c, l));
  let out = ser(tree);
  if (links) out = localizeLinks(out, locale);
  return localizeImages(out, locale);
}

/** Translates a single short string (titles in the search index). */
export function translateText(text, locale) {
  if (locale === 'en') return text;
  const l = loadLocale(locale);
  const key = collapse(text);
  if (!needsTranslation(key, l)) return text;
  const tr = lookup(l, key);
  if (tr == null) {
    l.missing.add(key);
    return text;
  }
  return plain(tr.replace(/&amp;/g, '&'));
}

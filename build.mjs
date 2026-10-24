#!/usr/bin/env node
// Static site generator for the Yotsuba Shader website. No dependencies: Node >= 18.
//
//   node build.mjs                 build into ./dist
//   node build.mjs --serve         build, serve ./dist on http://localhost:4173 and rebuild on change
//   node build.mjs --serve --no-build
//
// Every page is a real URL (dist/<path>/index.html). Internal links are written relative to
// each page, so the site works from any sub-path (e.g. GitHub Pages project sites).

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

import { renderPage, renderDoc, relativize } from './src/layout.mjs';
import { scanSyntaxes, SYNTAX_META } from './src/reference.mjs';
import { SECTIONS, SITE } from './src/site.mjs';
import { LOCALES, localePath, localizeHtml, translateText, i18nReport } from './src/i18n/index.mjs';
import buildDocs from './src/docs/docs.mjs';

import homePages from './src/pages/home.mjs';
import getStarted from './src/pages/get-started.mjs';
import syntaxes from './src/pages/syntaxes.mjs';
import technologies from './src/pages/technologies.mjs';
import compilation from './src/pages/compilation.mjs';
import community from './src/pages/community.mjs';
import playground from './src/pages/playground.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(ROOT, 'dist');
const STATIC = path.join(ROOT, 'src', 'static');
const REPO_DIR = path.resolve(ROOT, '..');

const args = new Set(process.argv.slice(2));

/* ----------------------------------------------------------------- helpers */
const slugify = (s) =>
  s
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z]+;/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

function decorateHeadings(html) {
  const used = new Set();
  const toc = [];
  const out = html.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (_, level, inner) => {
    let id = slugify(inner) || 'section';
    for (let n = 2; used.has(id); n++) id = `${slugify(inner)}-${n}`;
    used.add(id);
    if (level === '2') toc.push({ id, text: inner.replace(/<[^>]+>/g, '') });
    return `<h${level} id="${id}">${inner}<a class="anchor" href="#${id}" aria-label="Link to this section">#</a></h${level}>`;
  });
  return { body: out, toc };
}

const plainText = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

const write = (rel, content) => {
  const file = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
};

const outFile = (pagePath) => (pagePath === '/' ? 'index.html' : path.posix.join(pagePath.slice(1), 'index.html'));

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    entry.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}

/* --------------------------------------------------------------- redirects */
// Pages renamed when the authoring "styles" became the YotsubaShader.<X>Syntax packages.
const DOC = '/documentation/yotsuba-shader/';
const REDIRECTS = {
  '/technologies/spir-v/': '/technologies/compilation/',
  '/technologies/compiler/': '/technologies/compilation/',
  '/technologies/intermediate-representation/': '/technologies/compilation/',
  [`${DOC}shader-discovery/`]: '/technologies/compilation/',
  [`${DOC}intermediate-representation/`]: '/technologies/compilation/',
  [`${DOC}building-spirv-modules/`]: '/technologies/compilation/',
  [`${DOC}spirv-operation-generator/`]: '/technologies/compilation/',
  [`${DOC}repository-architecture/`]: '/technologies/compilation/',

  '/styles/': '/syntaxes/',
  '/styles/hlsl/': '/syntaxes/hlsl/',
  '/styles/glsl/': '/syntaxes/glsl/',
  '/styles/metal/': '/syntaxes/msl/',
  '/styles/vulkan/': '/syntaxes/spirv/',
  '/styles/wgsl/': '/syntaxes/wgsl/',
  [`${DOC}choosing-an-authoring-style/`]: `${DOC}choosing-a-syntax/`,
  [`${DOC}builtin-values-across-styles/`]: `${DOC}builtin-values-across-syntaxes/`,
  [`${DOC}resource-attributes-across-styles/`]: `${DOC}resource-attributes-across-syntaxes/`,
  [`${DOC}hlsl-style-attributes/`]: `${DOC}hlsl-syntax-attributes/`,
  [`${DOC}glsl-style-attributes/`]: `${DOC}glsl-syntax-attributes/`,
  [`${DOC}metal-style-attributes/`]: `${DOC}msl-syntax-attributes/`,
  [`${DOC}vulkan-style-attributes/`]: `${DOC}spirv-syntax-attributes/`,
  [`${DOC}wgsl-style-attributes/`]: `${DOC}wgsl-syntax-attributes/`,
};

function redirectPage(oldPath, newPath, locale) {
  const depth = oldPath.split('/').filter(Boolean).length;
  const rel = '../'.repeat(depth) + newPath.slice(1);
  const canonical = SITE.url ? `${SITE.url}${newPath}` : rel;
  return `<!doctype html>
<html lang="${LOCALES[locale].htmlLang}">
<head>
<meta charset="utf-8">
<title>${SITE.name}</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="${canonical}">
<meta http-equiv="refresh" content="0; url=${rel}">
<script>location.replace(${JSON.stringify(rel)} + location.hash);</script>
</head>
<body><p><a href="${rel}">${SITE.name}</a></p></body>
</html>
`;
}

/* ------------------------------------------------------------------- build */
function build() {
  const started = Date.now();
  fs.rmSync(DIST, { recursive: true, force: true });
  copyDir(STATIC, DIST);

  const missing = Object.values(SYNTAX_META).filter((m) => !fs.existsSync(path.join(REPO_DIR, m.project)));
  if (missing.length) console.warn(`! ${missing.map((m) => m.project).join(', ')} not found next to Web/: their attribute reference pages will be empty.`);
  const ctx = { syntaxes: scanSyntaxes(REPO_DIR) };

  const resolve = (mod) => (typeof mod === 'function' ? mod(ctx) : mod);
  const docs = buildDocs(ctx);

  const pages = [
    ...resolve(homePages),
    ...resolve(getStarted),
    ...resolve(syntaxes),
    ...resolve(technologies),
    ...resolve(compilation),
    ...resolve(community),
    ...resolve(playground),
    docs.hub,
  ];

  const locales = Object.keys(LOCALES);
  const indexes = Object.fromEntries(locales.map((l) => [l, []]));
  const seen = new Set();
  const emit = (pagePath, html) => {
    if (seen.has(pagePath)) throw new Error(`Duplicate page path: ${pagePath}`);
    seen.add(pagePath);
    write(outFile(pagePath), html);
  };

  for (const locale of locales) {
    const text = (html) => plainText(localizeHtml(html, locale, { links: false })).slice(0, 1800);

    for (const page of pages) {
      emit(localePath(page.path, locale), renderPage(page, locale));
      indexes[locale].push({
        t: translateText(page.title, locale),
        u: localePath(page.path, locale),
        s: translateText(SECTIONS[page.section]?.title || (page.section === 'documentation' ? 'Documentation' : SITE.name), locale),
        x: text(page.body),
      });
    }

    for (const article of docs.articles) {
      const pagePath = article.slug === 'index' ? `/documentation/${docs.set.slug}/` : `/documentation/${docs.set.slug}/${article.slug}/`;
      const { body, toc } = decorateHeadings(article.body);
      emit(
        localePath(pagePath, locale),
        renderDoc({
          set: docs.set,
          article,
          tree: docs.tree,
          articlesBySlug: docs.bySlug,
          prev: article.prev,
          next: article.next,
          toc,
          body,
          pagePath,
          locale,
        }),
      );
      indexes[locale].push({ t: translateText(article.title, locale), u: localePath(pagePath, locale), s: translateText('Documentation', locale), x: text(article.body) });
    }
  }

  // Search indexes as scripts, so they also work when the files are opened from disk.
  write('search-index.js', `window.__YS_SEARCH__=${JSON.stringify(indexes.en)};`);
  for (const locale of locales.filter((l) => l !== 'en')) {
    write(`search-index.${locale}.js`, `window.__YS_SEARCH__=${JSON.stringify(indexes[locale])};`);
  }

  // 404 (served from the site root on most static hosts).
  const notFound = renderPage({
    path: '/',
    section: 'home',
    title: 'Page not found',
    noindex: true,
    description: 'The page you were looking for does not exist.',
    body: `<section class="notfound"><div><h1 class="h-xl">Page not found</h1><p class="lead" style="margin:18px auto 28px">That URL does not exist on this site.</p><a class="btn btn-primary" href="/">Back to the home page</a></div></section>`,
  });
  write('404.html', notFound);

  // Old addresses of pages that moved: a small page that sends the visitor (and search engines) to the new one.
  // They are not part of `seen`, so they stay out of the sitemap and the search index.
  for (const [from, to] of Object.entries(REDIRECTS)) {
    for (const locale of locales) {
      const oldPath = localePath(from, locale);
      const newPath = localePath(to, locale);
      if (seen.has(oldPath)) throw new Error(`Redirect would replace a real page: ${oldPath}`);
      if (!seen.has(newPath)) throw new Error(`Redirect points to a missing page: ${oldPath} -> ${newPath}`);
      write(outFile(oldPath), redirectPage(oldPath, newPath, locale));
    }
  }
  write('.nojekyll', '');

  // robots.txt always; the sitemap needs absolute addresses, so it waits for SITE_URL.
  write('robots.txt', `User-agent: *\nAllow: /\n${SITE.url ? `\nSitemap: ${SITE.url}/sitemap.xml\n` : ''}`);
  if (SITE.url) {
    const base = [...seen].filter((p) => !p.startsWith('/es/')).sort();
    const entry = (p) =>
      `  <url>\n    <loc>${SITE.url}${p}</loc>\n${locales.map((l) => `    <xhtml:link rel="alternate" hreflang="${LOCALES[l].htmlLang}" href="${SITE.url}${localePath(p, l)}"/>`).join('\n')}\n  </url>`;
    const urls = locales.flatMap((l) => base.map((p) => entry(p).replace(`<loc>${SITE.url}${p}</loc>`, `<loc>${SITE.url}${localePath(p, l)}</loc>`)));
    write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`);
  }

  const broken = checkLinks();
  const ms = Date.now() - started;
  console.log(`✓ ${seen.size} pages (${locales.join(', ')}) + 404 + search indexes (${indexes.en.length} entries each) in ${ms} ms → ${path.relative(process.cwd(), DIST) || 'dist'}`);
  reportI18n(locales);
  if (broken.length) {
    console.error(`✗ ${broken.length} broken internal link(s):`);
    for (const b of broken.slice(0, 40)) console.error(`  ${b.from}  →  ${b.href}`);
    if (!args.has('--serve')) process.exitCode = 1;
  } else {
    console.log('✓ all internal links resolve');
  }
}

/** Translation coverage: what is missing (and what is left over) in each non-English locale. */
function reportI18n(locales) {
  for (const locale of locales.filter((l) => l !== 'en')) {
    const r = i18nReport(locale);
    if (args.has('--i18n-missing')) {
      const all = Object.fromEntries([...r.missing, ...r.missingComments].map((k) => [k, '']));
      console.log(JSON.stringify(all, null, 2));
      continue;
    }
    const gaps = r.missing.length + r.missingComments.length;
    if (!gaps) console.log(`✓ ${locale}: every text is translated (${r.entries} entries)`);
    else {
      console.warn(`! ${locale}: ${r.missing.length} texts and ${r.missingComments.length} code comments are not translated yet`);
      for (const k of [...r.missing, ...r.missingComments].slice(0, args.has('--i18n-all') ? Infinity : 8)) console.warn(`    ${k.slice(0, 110)}`);
    }
    if (args.has('--i18n-prune') && r.unused.length) {
      const dir = path.join(ROOT, 'src', 'i18n', locale);
      for (const f of fs.readdirSync(dir)) {
        if (!f.endsWith('.json') || ['comments.json', 'keep.json', 'ui.json'].includes(f)) continue;
        const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
        for (const k of r.unused) delete d[k];
        fs.writeFileSync(path.join(dir, f), JSON.stringify(d, null, 1) + '\n');
      }
      console.log(`✓ ${locale}: removed ${r.unused.length} unused entries`);
    } else if (r.unused.length) {
      console.warn(`! ${locale}: ${r.unused.length} unused entries`);
      if (args.has('--i18n-all')) for (const k of r.unused) console.warn(`    ${k.slice(0, 110)}`);
    }
    if (args.has('--strict-i18n') && (gaps || r.unused.length)) process.exitCode = 1;
  }
}

function listHtml(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) listHtml(p, acc);
    else if (e.name.endsWith('.html')) acc.push(p);
  }
  return acc;
}

function checkLinks() {
  const broken = [];
  for (const file of listHtml(DIST)) {
    if (path.basename(file) === '404.html' || file.includes(`${path.sep}playground-app${path.sep}`)) continue;
    const html = fs.readFileSync(file, 'utf8');
    for (const m of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      const href = m[1];
      if (/^(https?:|mailto:|#|data:|javascript:|\/\/)/.test(href)) continue;
      const clean = href.split('#')[0].split('?')[0];
      if (!clean) continue;
      let target = path.resolve(path.dirname(file), clean);
      if (!target.startsWith(DIST)) {
        broken.push({ from: path.relative(DIST, file), href });
        continue;
      }
      if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
      if (!fs.existsSync(target)) broken.push({ from: path.relative(DIST, file), href });
    }
  }
  return broken;
}

/* ------------------------------------------------------------- dev server */
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
  '.zip': 'application/zip',
  '.json': 'application/json',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

function serve(port = Number(process.env.PORT) || 4173) {
  const server = http.createServer((req, res) => {
    let rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = path.join(DIST, rel);
    if (!file.startsWith(DIST)) {
      res.writeHead(403).end();
      return;
    }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
      if (!rel.endsWith('/')) {
        res.writeHead(301, { Location: rel + '/' }).end();
        return;
      }
      file = path.join(file, 'index.html');
    }
    if (!fs.existsSync(file)) {
      res.writeHead(404, { 'Content-Type': TYPES['.html'] });
      res.end(fs.existsSync(path.join(DIST, '404.html')) ? fs.readFileSync(path.join(DIST, '404.html')) : 'Not found');
      return;
    }
    const type = TYPES[path.extname(file)] || 'application/octet-stream';
    const size = fs.statSync(file).size;
    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
    if (range) {
      // Byte ranges: browsers need them to seek in video.
      const start = range[1] ? Number(range[1]) : 0;
      const end = range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
      res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1, 'Cache-Control': 'no-store' });
      fs.createReadStream(file, { start, end }).pipe(res);
      return;
    }
    res.writeHead(200, { 'Content-Type': type, 'Content-Length': size, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-store' });
    fs.createReadStream(file).pipe(res);
  });
  server.listen(port, () => console.log(`→ http://localhost:${port}/`));
}

if (!args.has('--no-build')) build();

if (args.has('--serve')) {
  serve();
  let timer;
  const rebuild = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      // A fresh process each time: this one has the page modules cached from startup.
      spawnSync(process.execPath, [fileURLToPath(import.meta.url)], { stdio: 'inherit' });
    }, 150);
  };
  try {
    fs.watch(path.join(ROOT, 'src'), { recursive: true }, rebuild);
  } catch {
    console.warn('! File watching is unavailable on this platform; restart to rebuild.');
  }
}

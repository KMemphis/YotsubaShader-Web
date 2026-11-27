// Renders the releases of the repository (src/data/releases.json, written by tools/fetch-releases.mjs) as the timeline of
// the What's New page. Text that comes from GitHub (titles, notes, dates, names) is marked translate="no": the page
// translator leaves it as it is, and only the labels written here are translated.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { icon } from './components.mjs';
import { esc } from './highlight.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'src', 'data', 'releases.json');

const NO = ' translate="no"';
const avatar = (login, size = 28) =>
  `<img class="rel-avatar" src="https://github.com/${esc(login)}.png?size=${size * 2}" width="${size}" height="${size}" alt="${esc(login)}" loading="lazy" decoding="async">`;
const person = (login) => `<a class="rel-person" href="https://github.com/${esc(login)}" rel="noopener"${NO}>${avatar(login, 22)}<span>${esc(login)}</span></a>`;
const version = (tag) => tag.replace(/^v/i, '');
const day = (iso) => new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
const mb = (bytes) => `${(bytes / 1048576).toFixed(bytes > 1e8 ? 0 : 1)} MB`;
const plural = (n, one, many) => `<b${NO}>${n}</b> <span>${n === 1 ? one : many}</span>`;

/** Inline Markdown of a release note: `code`, **bold**, [text](url). Everything else is escaped text. */
function inline(text) {
  const parts = [];
  const stash = (html) => `\u0000${parts.push(html) - 1}\u0000`;
  let s = text
    .replace(/`([^`]+)`/g, (_, c) => stash(`<code>${esc(c)}</code>`))
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, (_, t, u) => stash(`<a href="${esc(u)}" rel="noopener">${esc(t)}</a>`));
  s = esc(s).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => parts[+i]);
}

/** Splits a release body into the notes written by hand, the pull requests, the new contributors and the compare link. */
export function parseBody(body) {
  const notes = [];
  const changes = [];
  const firsts = [];
  let compare = null;
  for (const line of body.split('\n')) {
    let m;
    if ((m = /^[*-]\s+(.+?)\s+by\s+@(\S+)\s+in\s+(https:\/\/github\.com\/\S+\/pull\/(\d+))\s*$/.exec(line))) {
      changes.push({ title: m[1], author: m[2], url: m[3], number: m[4] });
    } else if ((m = /^[*-]\s+@(\S+)\s+made their first contribution in\s+(\S+)/.exec(line))) {
      firsts.push({ login: m[1], url: m[2] });
    } else if ((m = /\*\*Full Changelog\*\*:\s*(\S+)/.exec(line))) {
      compare = m[1];
    } else if (!/^#{1,3}\s*(What's Changed|New Contributors)\s*$/i.test(line)) {
      notes.push(line);
    }
  }
  return { notes: notes.join('\n').trim(), changes, firsts, compare };
}

/** Block Markdown of the notes: paragraphs, lists and ##/### headings. Breaking-change lists get a warning frame. */
function notesHtml(text) {
  if (!text) return '';
  const out = [];
  let list = null;
  let para = [];
  let breaking = false;
  const flushPara = () => { if (para.length) out.push(`<p>${inline(para.join(' '))}</p>`); para = []; };
  const flushList = () => { if (list) out.push(`<ul${breaking ? ' class="rel-breaking-list"' : ''}>${list.map((i) => `<li>${inline(i)}</li>`).join('')}</ul>`); list = null; };
  for (const line of text.split('\n')) {
    let m;
    if ((m = /^#{1,4}\s+(.+)$/.exec(line))) {
      flushPara(); flushList();
      breaking = /breaking/i.test(m[1]);
      out.push(`<h4 class="rel-sub${breaking ? ' rel-sub--breaking' : ''}">${inline(m[1])}</h4>`);
    } else if ((m = /^\s*[*-]\s+(.+)$/.exec(line))) {
      flushPara();
      (list ||= []).push(m[1]);
    } else if (!line.trim()) {
      flushPara(); flushList();
    } else if (list && /^\s{2,}/.test(line)) {
      list[list.length - 1] += ` ${line.trim()}`;
    } else {
      flushList();
      para.push(line.trim());
    }
  }
  flushPara(); flushList();
  return out.join('\n');
}

const PLATFORMS = [
  [/linux-x64/, 'Linux', 'x64'],
  [/linux-arm64/, 'Linux', 'ARM64'],
  [/osx-arm64/, 'macOS', 'Apple silicon'],
  [/osx-x64/, 'macOS', 'Intel'],
  [/win-x64/, 'Windows', 'x64'],
  [/win-arm64/, 'Windows', 'ARM64'],
];
const platform = (name) => {
  const p = PLATFORMS.find(([re]) => re.test(name));
  return p ? { os: p[1], arch: p[2] } : { os: name, arch: '' };
};

function releaseCard(r, i, latest) {
  const p = parseBody(r.body);
  const people = [...new Set([...p.changes.map((c) => c.author), ...(p.changes.length || !r.author ? [] : [r.author])])];
  const stats = [
    p.changes.length ? `<span class="rel-stat">${icon('code')}${plural(p.changes.length, 'change', 'changes')}</span>` : '',
    people.length ? `<span class="rel-stat">${icon('users')}${plural(people.length, 'contributor', 'contributors')}</span>` : '',
    r.assets.length ? `<span class="rel-stat">${icon('box')}${plural(r.assets.length, 'download', 'downloads')}</span>` : '',
  ].join('');
  const changes = p.changes.length
    ? `<h4 class="rel-sub">Changes</h4>
      <ul class="rel-changes">${p.changes.map((c) => `<li>
        <a class="rel-pr" href="${esc(c.url)}" rel="noopener"${NO}>#${c.number}</a>
        <span class="rel-title"${NO}>${esc(c.title)}</span>
        <a class="rel-by" href="https://github.com/${esc(c.author)}" rel="noopener" title="${esc(c.author)}"${NO}>${avatar(c.author, 20)}</a>
      </li>`).join('')}</ul>`
    : '';
  const notes = p.notes ? `<div class="rel-notes"${NO}>${notesHtml(p.notes)}</div>` : '';
  const contributors = people.length
    ? `<div class="rel-people"><h4 class="rel-sub">Contributors</h4><div class="rel-people-row">${people.map(person).join('')}</div>
      ${p.firsts.length ? `<p class="rel-first">${icon('heart')}<span>First contribution</span> ${p.firsts.map((f) => `<a href="https://github.com/${esc(f.login)}" rel="noopener"${NO}>@${esc(f.login)}</a>`).join(', ')}</p>` : ''}</div>`
    : '';
  const downloads = r.assets.length
    ? `<h4 class="rel-sub">Downloads</h4>
      <div class="rel-assets">${r.assets.map((a) => { const pl = platform(a.name); return `<a class="rel-asset" href="${esc(a.url)}" rel="noopener" title="${esc(a.name)}"${NO}>${icon('box')}<span class="rel-asset-os">${esc(pl.os)}</span><span class="rel-asset-arch">${esc(pl.arch)}</span><span class="rel-asset-size">${mb(a.size)}</span></a>`; }).join('')}</div>`
    : '';
  const empty = !p.notes && !p.changes.length ? '<p class="rel-empty">No notes were published for this release.</p>' : '';
  const compare = p.compare ? `<a class="link-more" href="${esc(p.compare)}" rel="noopener">Full changelog ${icon('chevron-right')}</a>` : '';
  return `
<li class="rel${i === 0 ? ' rel--latest' : ''}" id="${esc(r.tag)}">
  <span class="rel-dot" aria-hidden="true"></span>
  <article class="rel-card">
    <header class="rel-head">
      <h3 class="rel-ver"${NO}>${esc(version(r.tag))}</h3>
      ${i === latest ? '<span class="rel-pill">Latest</span>' : ''}${r.prerelease ? '<span class="rel-pill rel-pill--pre">Pre-release</span>' : ''}
      <time class="rel-date" datetime="${esc(r.date.slice(0, 10))}"${NO}>${day(r.date)}</time>
    </header>
    ${stats ? `<div class="rel-stats">${stats}</div>` : ''}
    ${notes}
    ${changes}
    ${empty}
    ${contributors}
    ${downloads}
    <footer class="rel-foot"><a class="link-more" href="${esc(r.url)}" rel="noopener">Release on GitHub ${icon('external')}</a>${compare}</footer>
  </article>
</li>`;
}

export function loadReleases() {
  if (!fs.existsSync(DATA)) return null;
  return JSON.parse(fs.readFileSync(DATA, 'utf8'));
}

/** The "Releases" section: totals, a jump bar, the timeline and the people behind the project. */
export function releasesSection(aside = '') {
  const data = loadReleases();
  if (!data?.releases.length) return '';
  const { releases, contributors, repo } = data;
  const parsed = releases.map((r) => parseBody(r.body));
  const changeCount = parsed.reduce((n, p) => n + p.changes.length, 0);
  const latest = releases.findIndex((r) => !r.prerelease);
  const first = releases[releases.length - 1];
  const big = (value, label) => `<div class="rel-total"><b${NO}>${value}</b><span>${label}</span></div>`;
  return `
<section class="section rel-section" id="releases">
  <div class="container">
    <p class="eyebrow">Releases</p>
    <h2 class="h-lg">Every release, with everything that changed</h2>
    <p class="lead rel-lead">Each version of Yotsuba Shader, newest first: what changed, who made it, and the files to download. It is read from the project's GitHub releases.</p>
    <div class="rel-totals">
      ${big(releases.length, 'Releases')}
      ${big(changeCount, 'Changes merged')}
      ${big(contributors.length, 'Contributors')}
      ${big(version(releases[latest >= 0 ? latest : 0].tag), 'Latest version')}
    </div>
    <div class="rel-layout${aside ? ' rel-layout--aside' : ''}">
    <div class="rel-main">
    <nav class="rel-jump" aria-label="Jump to a release"><span class="rel-jump-label">Jump to</span>${releases.map((r) => `<a href="#${esc(r.tag)}"${NO}>${esc(version(r.tag))}</a>`).join('')}</nav>
    <ol class="rel-timeline">${releases.map((r, i) => releaseCard(r, i, latest)).join('')}</ol>
    <div class="rel-timeline-end"><span>Since <time datetime="${esc(first.date.slice(0, 10))}"${NO}>${day(first.date)}</time></span></div>
    ${contributors.length ? `
    <div class="panel rel-contributors">
      <h3 class="h-md">The people behind the code</h3>
      <p class="card-body">Everyone who has committed to the repository, by number of commits.</p>
      <div class="rel-crew">${contributors.map((c) => `<a class="rel-member" href="${esc(c.url)}" rel="noopener">${avatar(c.login, 56)}<b${NO}>${esc(c.login)}</b><span>${plural(c.commits, 'commit', 'commits')}</span></a>`).join('')}</div>
      <p class="don-note">Want to be here? <a href="/community/contributing/">Read how to contribute</a>.</p>
    </div>` : ''}
    <p class="rel-source">Source: <a href="https://github.com/${esc(repo)}/releases" rel="noopener">github.com/${esc(repo)}/releases</a>${data.fetched ? ` · updated <time datetime="${esc(data.fetched)}"${NO}>${esc(data.fetched)}</time>` : ''}</p>
    </div>
    ${aside ? `<aside class="rel-aside" id="subscribe">${aside}</aside>` : ''}
    </div>
  </div>
</section>`;
}

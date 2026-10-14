import { highlight, esc } from './highlight.mjs';

const ICONS = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  heart:
    '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  'chevron-right': '<path d="m9 6 6 6-6 6"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  'chevron-left': '<path d="m15 6-6 6 6 6"/>',
  doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  braces:
    '<path d="M8 3H7a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2 2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h1M16 3h1a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2 2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-1"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  sidebar: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/>',
  'arrow-right': '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  'arrow-left': '<path d="M19 12H5m6-6-6 6 6 6"/>',
  external: '<path d="M7 17 17 7M8 7h9v9"/>',
  check: '<path d="m5 12 5 5 9-10"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>',
  terminal: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3M13 15h4"/>',
  cpu: '<rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
  code: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>',
  box: '<path d="M12 3 4 7v10l8 4 8-4V7z"/><path d="m4 7 8 4 8-4M12 11v10"/>',
  scale:
    '<path d="M12 3v18M7 21h10M5 7h14"/><path d="m5 7-3 7a3.5 3.5 0 0 0 6 0zM19 7l-3 7a3.5 3.5 0 0 0 6 0z"/>',
  users:
    '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6.5 6.5 0 0 1 3.5 6"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M6.5 17H20v4H6.5A2.5 2.5 0 0 1 4 19.5"/>',
  zap: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  shield: '<path d="M12 3 5 6v6c0 4.5 3 8 7 9 4-1 7-4.5 7-9V6z"/>',
  flask: '<path d="M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3"/><path d="M7 15h10"/>',
  tree: '<path d="M5 4h6v5H5zM13 15h6v5h-6zM13 9h6v4h-6z"/><path d="M8 9v9h5M8 11h5"/>',
};

const GITHUB_PATH =
  'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12';

export function icon(name, cls = '') {
  if (name === 'github') {
    return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${GITHUB_PATH}"/></svg>`;
  }
  const body = ICONS[name];
  if (!body) throw new Error(`Unknown icon: ${name}`);
  return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}

/** A single highlighted code block. */
export function code(lang, src, file = '') {
  const body = src.replace(/^\n+|\s+$/g, '');
  const label = file || { csharp: 'C#', bash: 'Terminal', spirv: 'SPIR-V', text: '' }[lang] || '';
  return `<figure class="code" data-lang="${lang}">
  <figcaption><span class="code-file">${esc(label)}</span><button class="copy" type="button" aria-label="Copy code">${icon('copy')}<span>Copy</span></button></figcaption>
  <pre><code>${highlight(lang, body)}</code></pre>
</figure>`;
}

export const STYLES = [
  { id: 'hlsl', label: 'HLSL-like' },
  { id: 'glsl', label: 'GLSL-like' },
  { id: 'metal', label: 'Metal-like' },
  { id: 'vulkan', label: 'Vulkan-like' },
  { id: 'wgsl', label: 'WGSL-like' },
];

/** Tabbed code that follows the visitor's chosen authoring style across the whole site. */
export function styleTabs(snippets, { file = 'Triangle.cs' } = {}) {
  const tabs = STYLES.map(
    (s, i) =>
      `<button role="tab" type="button" data-style="${s.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${s.label}</button>`,
  ).join('');
  const panels = STYLES.map(
    (s, i) =>
      `<div class="tabpanel" role="tabpanel" data-style="${s.id}"${i === 0 ? '' : ' hidden'}>${code('csharp', snippets[s.id], file)}</div>`,
  ).join('');
  return `<div class="style-tabs" data-style-group><div class="tablist" role="tablist" aria-label="Authoring style">${tabs}</div>${panels}</div>`;
}

export function table(head, rows, { cls = '' } = {}) {
  const th = head.map((h) => `<th scope="col">${h}</th>`).join('');
  const tr = rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('');
  return `<div class="table-wrap"><table class="table ${cls}"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table></div>`;
}

export function note(kind, html) {
  const titles = { note: 'Note', important: 'Important', tip: 'Tip' };
  return `<aside class="callout callout--${kind}"><strong>${titles[kind] || 'Note'}</strong><div>${html}</div></aside>`;
}

export function pill(text) {
  return `<span class="badge badge--plain">${text}</span>`;
}

export function cardLink({ href, title, body, icon: ic }) {
  return `<a class="card card--link" href="${href}">
  ${ic ? `<span class="card-icon">${icon(ic)}</span>` : ''}
  <span class="card-title">${title}</span>
  <span class="card-body">${body}</span>
  <span class="card-more">Learn more ${icon('chevron-right')}</span>
</a>`;
}

/**
 * The Yotsuba Shader wordmark, built in HTML so it stays crisp, themeable and searchable.
 * Everything scales from the element's font-size (see .wm in site.css), so one component serves the nav,
 * footer and headings. `mark: false` renders the text only.
 */
export function wordmark({ size = 'md', mark = true } = {}) {
  return `<span class="wm wm--${size}">${mark ? '<img class="wm-mark" src="/img/yotsuba-shader.webp" alt="" width="64" height="64">' : ''}<span class="wm-text"><span class="wm-a">Yotsuba</span> <span class="wm-b">Shader</span></span></span>`;
}

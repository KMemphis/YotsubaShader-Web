// Small dependency-free Markdown renderer for the learn site.
// Supports: frontmatter, headings, paragraphs, lists (nested), blockquotes, callouts
// (> [!NOTE|TIP|WARNING|IMPORTANT|PLANNED]), fenced code, code groups (style=hlsl|glsl|...),
// tables, images, links, bold/italic/code, horizontal rules, button rows (```buttons, one link per line).

import { esc, highlight } from './highlight.mjs';

export const STYLES = { glsl: 'GLSL', hlsl: 'HLSL', msl: 'MSL', wgsl: 'WGSL', spirv: 'SPIR-V' };

export function slugify(s) {
  return s
    .replace(/<[^>]+>/g, '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function parseFrontmatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { meta: {}, body: src };
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim().replace(/^(["'])(.*)\1$/, '$2');
    if (/^-?\d+(\.\d+)?$/.test(v)) v = Number(v);
    meta[kv[1]] = v;
  }
  return { meta, body: src.slice(m[0].length) };
}

/* ------------------------------------------------------------------ inline */
function inline(text, ctx) {
  const stash = [];
  const keep = (html) => `\u0000${stash.push(html) - 1}\u0000`;
  let s = text.replace(/`([^`]+)`/g, (_, c) => keep(`<code>${esc(c)}</code>`));
  s = esc(s);
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g, (_, alt, src, title) =>
    keep(`<img src="${ctx.resolveAsset(src)}" alt="${alt}" loading="lazy"${title ? ` title="${title}"` : ''}>`),
  );
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => {
    const external = /^https?:\/\//.test(href);
    const url = external ? href : ctx.resolveLink(href);
    return keep(`<a href="${url}"${external ? ' rel="noopener" target="_blank"' : ''}>${label}</a>`);
  });
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*\w])\*([^*\n]+)\*(?!\w)/g, '$1<em>$2</em>');
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => stash[i]);
}

/* ------------------------------------------------------------------ blocks */
const CALLOUTS = { NOTE: 'Note', TIP: 'Tip', WARNING: 'Warning', IMPORTANT: 'Important', PLANNED: 'Planned' };

function tokenize(src) {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let i = 0;
  const isBlank = (l) => /^\s*$/.test(l);
  const listRe = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
  const startsBlock = (l) =>
    /^(#{1,6})\s/.test(l) || /^```/.test(l) || /^>/.test(l) || /^(-{3,}|\*{3,})\s*$/.test(l) || listRe.test(l);

  while (i < lines.length) {
    const line = lines[i];
    if (isBlank(line)) { i++; continue; }

    const fence = line.match(/^```(\w+)?\s*(.*)$/);
    if (fence) {
      const code = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) code.push(lines[i++]);
      i++;
      const attrs = {};
      for (const m of fence[2].matchAll(/(\w+)=("([^"]*)"|\S+)/g)) attrs[m[1]] = m[3] ?? m[2];
      out.push({ t: 'code', lang: fence[1] || '', attrs, code: code.join('\n') });
      continue;
    }
    const h = line.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/);
    if (h) { out.push({ t: 'h', level: h[1].length, text: h[2] }); i++; continue; }
    if (/^(-{3,}|\*{3,})\s*$/.test(line)) { out.push({ t: 'hr' }); i++; continue; }

    if (/^>/.test(line)) {
      const q = [];
      while (i < lines.length && /^>/.test(lines[i])) q.push(lines[i++].replace(/^>\s?/, ''));
      out.push({ t: 'quote', lines: q });
      continue;
    }
    if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1])) {
      const rows = [];
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) rows.push(lines[i++]);
      out.push({ t: 'table', rows });
      continue;
    }
    const lm = line.match(listRe);
    if (lm) {
      const base = lm[1].length;
      const ordered = /\d/.test(lm[2]);
      const items = [];
      while (i < lines.length) {
        const l = lines[i];
        const m = l.match(listRe);
        if (m && m[1].length === base) { items.push([m[3]]); i++; }
        else if (items.length && !isBlank(l) && /^\s+/.test(l) && l.search(/\S/) > base) { items[items.length - 1].push(l.slice(Math.min(l.search(/\S/), base + 2))); i++; }
        else if (isBlank(l) && i + 1 < lines.length && (listRe.test(lines[i + 1]) && lines[i + 1].match(listRe)[1].length === base)) i++;
        else break;
      }
      out.push({ t: 'list', ordered, items });
      continue;
    }
    const para = [];
    while (i < lines.length && !isBlank(lines[i]) && !(para.length && startsBlock(lines[i]))) para.push(lines[i++]);
    out.push({ t: 'p', text: para.join(' ') });
  }
  return out;
}

function renderTable(rows, ctx) {
  const cells = (r) => r.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
  const head = cells(rows[0]);
  const body = rows.slice(2).map(cells);
  return `<div class="table-wrap"><table><thead><tr>${head.map((c) => `<th>${inline(c, ctx)}</th>`).join('')}</tr></thead><tbody>${body
    .map((r) => `<tr>${r.map((c) => `<td>${inline(c, ctx)}</td>`).join('')}</tr>`)
    .join('')}</tbody></table></div>`;
}

function codeBlock(tok, ctx) {
  const lang = tok.lang === 'cs' ? 'csharp' : tok.lang;
  const title = tok.attrs.title ? `<div class="code-title">${esc(tok.attrs.title)}</div>` : '';
  return `<div class="code">${title}<button class="copy" type="button" aria-label="${ctx.t.copy}">${ctx.t.copy}</button><pre><code${lang ? ` data-lang="${esc(lang)}"` : ''}>${highlight(lang, tok.code)}</code></pre></div>`;
}

function render(tokens, ctx, headings) {
  let html = '';
  for (let k = 0; k < tokens.length; k++) {
    const tk = tokens[k];
    switch (tk.t) {
      case 'h': {
        if (tk.level === 1) break; // title comes from frontmatter
        const id = ctx.uniqueId(slugify(tk.text) || 'section');
        if (tk.level === 2 || tk.level === 3) headings.push({ id, text: tk.text.replace(/`/g, ''), level: tk.level });
        html += `<h${tk.level} id="${id}">${inline(tk.text, ctx)}<a class="anchor" href="#${id}" aria-label="${ctx.t.linkHere}">#</a></h${tk.level}>`;
        break;
      }
      case 'p': html += `<p>${inline(tk.text, ctx)}</p>`; break;
      case 'hr': html += '<hr>'; break;
      case 'table': html += renderTable(tk.rows, ctx); break;
      case 'list': {
        const tag = tk.ordered ? 'ol' : 'ul';
        html += `<${tag}>${tk.items
          .map((it) => {
            const inner = render(tokenize(it.join('\n')), ctx, headings);
            return `<li>${inner.replace(/^<p>([\s\S]*?)<\/p>(?=<(ul|ol)|$)/, '$1')}</li>`;
          })
          .join('')}</${tag}>`;
        break;
      }
      case 'quote': {
        const m = tk.lines[0].match(/^\[!(\w+)\]\s*(.*)$/);
        if (m && m[1].toUpperCase() === 'SAY') {
          // > [!SAY] text: said by the "listen" audio only (it describes a table, code or picture); shown as a caption while it is read
          const say = [m[2], ...tk.lines.slice(1)].filter((l, n) => n || l).join(' ');
          html += `<p class="say" aria-hidden="true">${inline(say, ctx)}</p>`;
        } else if (m && CALLOUTS[m[1].toUpperCase()]) {
          const kind = m[1].toUpperCase();
          const rest = [m[2], ...tk.lines.slice(1)].filter((l, n) => n || l).join('\n');
          html += `<aside class="callout ${kind.toLowerCase()}" role="note"><div class="callout-title">${ctx.t.callouts[kind]}</div>${render(tokenize(rest), ctx, headings)}</aside>`;
        } else html += `<blockquote>${render(tokenize(tk.lines.join('\n')), ctx, headings)}</blockquote>`;
        break;
      }
      case 'code': {
        if (tk.lang === 'buttons') {
          // ```buttons: one Markdown link per line, drawn as a row of buttons.
          html += `<div class="buttons">${tk.code.split('\n').filter((l) => l.trim()).map((l) => inline(l.trim(), ctx).replace('<a ', '<a class="button" ')).join('')}</div>`;
          break;
        }
        if (tk.attrs.tab) {
          // consecutive blocks with tab="Name" become one local tab group (independent of the code-style picker)
          const group = [tk];
          while (tokens[k + 1]?.t === 'code' && tokens[k + 1].attrs.tab) group.push(tokens[++k]);
          const gid = ctx.uniqueId('tabs');
          html += `<div class="code-group" data-local="true"><div class="code-tabs" role="tablist">${group
            .map((g, n) => `<button role="tab" type="button" data-tab="${n}" aria-selected="${n === 0}">${g.attrs.tab.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</button>`)
            .join('')}</div>${group.map((g, n) => `<div class="code-panel" role="tabpanel" data-tab="${n}"${n ? ' hidden' : ''}>${codeBlock(g, ctx)}</div>`).join('')}</div>`;
          void gid;
        } else if (tk.attrs.style && STYLES[tk.attrs.style]) {
          const group = [tk];
          while (tokens[k + 1]?.t === 'code' && tokens[k + 1].attrs.style && STYLES[tokens[k + 1].attrs.style]) group.push(tokens[++k]);
          ctx.usesStyles = true;
          html += `<div class="code-group" data-styles="${group.map((g) => g.attrs.style).join(' ')}"><div class="code-tabs" role="tablist" aria-label="${ctx.t.codeStyle}">${group
            .map((g, n) => `<button role="tab" type="button" data-style="${g.attrs.style}" aria-selected="${n === 0}">${STYLES[g.attrs.style]}</button>`)
            .join('')}</div>${group.map((g, n) => `<div class="code-panel" role="tabpanel" data-style="${g.attrs.style}"${n ? ' hidden' : ''}>${codeBlock(g, ctx)}</div>`).join('')}</div>`;
        } else html += codeBlock(tk, ctx);
        break;
      }
    }
  }
  return html;
}

/** ctx: { resolveLink(href), resolveAsset(src), t } -> { html, headings, text, usesStyles } */
export function renderMarkdown(body, ctx) {
  const used = new Set();
  const full = {
    ...ctx,
    usesStyles: false,
    uniqueId(id) {
      let u = id;
      for (let n = 2; used.has(u); n++) u = `${id}-${n}`;
      used.add(u);
      return u;
    },
  };
  const headings = [];
  const html = render(tokenize(body), full, headings);
  const text = html.replace(/<pre[\s\S]*?<\/pre>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();
  return { html, headings, text, usesStyles: full.usesStyles };
}

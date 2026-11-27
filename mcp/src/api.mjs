// The queries behind the tools. Pure functions over the generated data, so the stdio server, the HTTP worker and the
// tests all share them.

export const STYLES = ['hlsl', 'glsl', 'msl', 'vulkan', 'wgsl'];
const STYLE_ALIASES = { spirv: 'vulkan', 'spir-v': 'vulkan', metal: 'msl', webgpu: 'wgsl', direct3d: 'hlsl', opengl: 'glsl' };

export const normalizeStyle = (s) => {
  if (!s) return undefined;
  const k = String(s).toLowerCase();
  return STYLES.includes(k) ? k : STYLE_ALIASES[k];
};

const words = (q) => String(q).toLowerCase().split(/[^\p{L}\p{N}_.#-]+/u).filter((w) => w.length > 1);

function score(text, terms) {
  const hay = text.toLowerCase();
  let s = 0;
  for (const t of terms) {
    let i = hay.indexOf(t);
    let n = 0;
    while (i !== -1 && n < 20) { n++; i = hay.indexOf(t, i + t.length); }
    s += n;
  }
  return s;
}

function snippet(text, terms, size = 220) {
  const hay = text.toLowerCase();
  let at = -1;
  for (const t of terms) { at = hay.indexOf(t); if (at !== -1) break; }
  if (at === -1) return text.slice(0, size).replace(/\s+/g, ' ');
  const from = Math.max(0, at - 60);
  return (from ? '…' : '') + text.slice(from, from + size).replace(/\s+/g, ' ') + '…';
}

export function makeApi(data) {
  const lang = (l) => (data.docs[l] ? l : 'en');
  const docsOf = (l) => data.docs[lang(l)].docs;
  const diagsOf = (l) => data.docs[lang(l)].diagnostics;
  const examples = data.examples;

  return {
    listDocs(l = 'en') {
      return docsOf(l).map(({ slug, title, summary, url }) => ({ slug, title, summary, url }));
    },

    getDoc(slug, l = 'en', style) {
      const doc = docsOf(l).find((d) => d.slug === slug);
      if (!doc) return undefined;
      const st = normalizeStyle(style);
      if (!st) return doc;
      const only = doc.blocks.filter((b) => !b.style || b.style === st);
      return { ...doc, blocks: only, markdown: doc.markdown.replace(/```\w*[^\n]*style=(\w+)[^\n]*\n[\s\S]*?```\n?/g, (m, s) => (s === st ? m : '')) };
    },

    searchDocs(query, l = 'en', limit = 8) {
      const terms = words(query);
      if (!terms.length) return [];
      const hits = [];
      for (const d of docsOf(l)) {
        const s = score(d.title, terms) * 8 + score(d.summary, terms) * 3 + score(d.markdown, terms);
        if (s > 0) hits.push({ slug: d.slug, title: d.title, url: d.url, score: s, snippet: snippet(d.markdown, terms) });
      }
      for (const g of diagsOf(l)) {
        const s = score(g.code + ' ' + g.title, terms) * 8 + score(g.message, terms) * 2;
        if (s > 0) hits.push({ slug: g.page, title: `${g.code}: ${g.title}`, url: docsOf(l).find((d) => d.slug === g.page)?.url, score: s, snippet: g.message });
      }
      return hits.sort((a, b) => b.score - a.score).slice(0, limit);
    },

    listDiagnostics(l = 'en', filter) {
      const f = filter ? words(filter) : [];
      return diagsOf(l)
        .filter((g) => !f.length || score(`${g.code} ${g.title} ${g.page}`, f) > 0)
        .map(({ code, title, severity, page }) => ({ code, title, severity, page }));
    },

    getDiagnostic(code, l = 'en') {
      const k = String(code).toUpperCase();
      return diagsOf(l).filter((g) => g.code === k);
    },

    listExamples({ style, tag } = {}) {
      const st = normalizeStyle(style);
      return examples
        .filter((e) => (!st || e.style === st) && (!tag || e.tags.includes(String(tag).toLowerCase())))
        .map(({ id, style: s, title, description, tags }) => ({ id, style: s, title: title[0], description: description[0], tags }));
    },

    getExample(id, l = 'en') {
      const e = examples.find((x) => x.id === id);
      if (!e) return undefined;
      const i = l === 'es' ? 1 : 0;
      return { id: e.id, style: e.style, syntax: e.label, title: e.title[i], description: e.description[i], tags: e.tags, credit: e.credit, notes: e.notes, code: e.code };
    },

    searchExamples(query, style, limit = 10) {
      const terms = words(query);
      const st = normalizeStyle(style);
      return examples
        .filter((e) => !st || e.style === st)
        .map((e) => ({ e, s: score(`${e.title.join(' ')} ${e.description.join(' ')} ${e.tags.join(' ')} ${e.id}`, terms) * 5 + score(e.code, terms) }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, limit)
        .map(({ e }) => ({ id: e.id, style: e.style, title: e.title[0], description: e.description[0], tags: e.tags }));
    },
  };
}

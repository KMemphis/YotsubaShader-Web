// Reads the pages of reference/ (both languages) and writes mcp/data/docs-{en,es}.json for the MCP server, plus
// learn/dist-independent llms.txt / llms-full.txt copies in static/ so assistants without MCP can read the same pages.
//   node tools/gen-mcp-data.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const learn = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(learn, '..', 'mcp', 'data');
const SITE = 'https://learn.yotsubashader.com';
const SECTION = 'reference';

function frontmatter(text) {
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(text);
  const meta = {};
  if (m) for (const line of m[1].split('\n')) {
    const kv = /^(\w+):\s*(.*)$/.exec(line);
    if (kv) meta[kv[1]] = kv[2].replace(/^"(.*)"$/, '$1');
  }
  return { meta, body: m ? text.slice(m[0].length) : text };
}

/** Code blocks of the page: { style, code } (style is the `style=` attribute of the fence, if any). */
function blocks(body) {
  const list = [];
  const re = /```(\w*)([^\n]*)\n([\s\S]*?)```/g;
  let m;
  while ((m = re.exec(body))) {
    const style = /style=(\w+)/.exec(m[2]);
    list.push({ lang: m[1], style: style ? style[1] : null, code: m[3].replace(/\n$/, '') });
  }
  return list;
}

/** One entry per `## YS0000: Title` of the diagnostics pages. */
function diagnostics(slug, body) {
  const list = [];
  const parts = body.split(/^## (?=YS\d{4}\b)/m).slice(1);
  for (const part of parts) {
    const head = /^(YS\d{4}):\s*(.*)\n/.exec(part);
    if (!head) continue;
    const field = (name) => (new RegExp(`\\*\\*${name}:\\*\\*\\s*(.*)`).exec(part) || [, ''])[1].trim();
    list.push({ code: head[1], title: head[2].trim(), severity: field('Severity') || field('Gravedad'), message: field('Message') || field('Mensaje'), page: slug, markdown: `## ${part}`.trim() });
  }
  return list;
}

fs.mkdirSync(out, { recursive: true });
for (const lang of ['en', 'es']) {
  const dir = path.join(learn, 'content', lang, SECTION);
  const docs = [];
  const diags = [];
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.md')).sort()) {
    const slug = file.replace(/\.md$/, '');
    const { meta, body } = frontmatter(fs.readFileSync(path.join(dir, file), 'utf8'));
    docs.push({
      slug, title: meta.title || slug, summary: meta.summary || '', order: Number(meta.order || 0),
      url: `${SITE}/${lang}/${SECTION}/${slug === 'index' ? '' : slug + '/'}`,
      markdown: body.trim(), blocks: blocks(body),
    });
    diags.push(...diagnostics(slug, body));
  }
  docs.sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
  fs.writeFileSync(path.join(out, `docs-${lang}.json`), JSON.stringify({ lang, docs, diagnostics: diags }, null, 1) + '\n');

  // llms.txt: index; llms-full.txt: everything, for assistants that cannot use MCP.
  const staticDir = path.join(learn, 'static');
  const suffix = lang === 'en' ? '' : `-${lang}`;
  const index = [`# Yotsuba Shader documentation (${lang})`, '', `> ${lang === 'en' ? 'Write shaders in C# and compile them to SPIR-V, GLSL, HLSL, MSL and WGSL.' : 'Escribe shaders en C# y compílalos a SPIR-V, GLSL, HLSL, MSL y WGSL.'}`, '', ...docs.map((d) => `- [${d.title}](${d.url}): ${d.summary}`), ''].join('\n');
  fs.writeFileSync(path.join(staticDir, `llms${suffix}.txt`), index);
  fs.writeFileSync(path.join(staticDir, `llms-full${suffix}.txt`), [index, ...docs.map((d) => `\n---\n\n# ${d.title}\n\nSource: ${d.url}\n\n${d.markdown}\n`)].join('\n'));
  console.log(lang, docs.length, 'pages,', diags.length, 'diagnostics');
}

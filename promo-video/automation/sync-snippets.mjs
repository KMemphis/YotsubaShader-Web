// Pulls the code samples straight from the website's own source so the video shows exactly what the site documents.
// Also writes the Spanish variant: only the comments change (the same translations the Spanish site uses).
import fs from 'node:fs';
import { GEN_CSPROJ, GEN_OUTPUT, GEN_USE, CLI_SNIPPET, GEN_INPUT } from '../../src/snippets.mjs';
const OUT = new URL('../remotion/src/', import.meta.url).pathname;
const base = { GEN_CSPROJ, GEN_OUTPUT, GEN_USE, CLI_SNIPPET, GEN_INPUT };
fs.writeFileSync(OUT + 'snippets.json', JSON.stringify(base, null, 1));

const un = (s) => s.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const dict = JSON.parse(fs.readFileSync(new URL('../../src/i18n/es/comments.json', import.meta.url), 'utf8'));
const es = {};
for (const [k, v] of Object.entries(base)) {
  let t = v;
  for (const [a, b] of Object.entries(dict)) t = t.split(un(a)).join(un(b));
  es[k] = t;
}
fs.writeFileSync(OUT + 'snippets.es.json', JSON.stringify(es, null, 1));
console.log('snippets (en, es) →', OUT);

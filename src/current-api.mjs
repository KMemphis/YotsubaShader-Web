// Public declarations read from the checkout at build time; no compiler code is modified.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export function apiSource(file) {
  const text = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const marker = text.lastIndexOf('#endregion');
  return text.slice(marker < 0 ? 0 : marker + '#endregion'.length)
    .replace(/\/\/\/[^\n]*\n/g, '').trim();
}

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data');
const read = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));

export function loadData() {
  return { docs: { en: read('docs-en.json'), es: read('docs-es.json') }, examples: read('examples.json') };
}

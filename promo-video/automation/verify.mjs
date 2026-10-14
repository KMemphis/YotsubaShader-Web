// Verifies against the REAL playground what the video claims: every bundled example is compiled with the Yotsuba
// pipeline (Roslyn + ShaderDiscovery/ShaderProcessor) running in WebAssembly. Writes verification.json.
import fs from 'node:fs';
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:4173';
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1600, height: 900 } })).newPage();
await page.goto(`${BASE}/playground/`, { waitUntil: 'networkidle' });
await page.waitForFunction(() => window.monaco && document.querySelector('#pg-status')?.textContent.includes('compiler'), null, { timeout: 120000 });
const ids = await page.$$eval('#pg-example option', (o) => o.map((x) => [x.value, x.textContent]));
const results = [];
for (const [id, name] of ids) {
  await page.selectOption('#pg-example', id);
  await page.waitForTimeout(400);
  await page.click('#pg-run');
  await page.waitForFunction(() => /ms$/.test(document.querySelector('#pg-status').textContent), null, { timeout: 60000 });
  const errors = await page.evaluate(() => document.querySelectorAll('.pg-diag--error').length);
  const shaders = await page.evaluate(() => [...document.querySelectorAll('[data-panel="shaders"] .pg-shader')].map((s) => ({ name: s.querySelector('h3')?.textContent, entryPoints: [...s.querySelectorAll('li')].map((l) => l.innerText.replace(/\s+/g, ' ').trim()) })));
  const spirv = await page.evaluate(() => document.querySelector('[data-panel="spirv"]').innerText.slice(0, 80));
  results.push({ example: name, errors, shaders, spirvPanel: spirv });
  console.log(errors === 0 ? '✓' : '✗', name, JSON.stringify(shaders.map((s) => s.entryPoints.length)));
}
await browser.close();
fs.writeFileSync(new URL('../verification.json', import.meta.url), JSON.stringify({ date: new Date().toISOString(), results }, null, 1));

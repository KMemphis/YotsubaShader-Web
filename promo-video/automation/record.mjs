// Frame-stepped recordings of the REAL site and playground (Playwright). Every frame is a screenshot taken after the
// browser performed the next action, so clips are exactly 30 fps and sync with the edit. Needs `node build.mjs --serve`
// running (default http://localhost:4173).
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';

const BASE = (process.env.BASE || 'http://localhost:4173');
const OUT = new URL('../recordings/', import.meta.url).pathname;
const PUBLIC = new URL('../remotion/public/', import.meta.url).pathname;
fs.mkdirSync(PUBLIC, { recursive: true });
const only = process.argv[2];
const LOC = process.env.LOCALE === 'es' ? '/es' : '';   // record the Spanish site
const SFX = LOC ? '-es' : '';
const K = 2; // 60 fps: every action below is written for 30 fps and spread over K frames

const SHADER = `using YotsubaShader.Language;
using YotsubaShader.Language.Attributes.HlslStyle;

public struct VertexOutput
{
    [SV_Position]
    public Vector4 Position;
}

public class Triangle
{
    [ShaderStage(Stage.Vertex)]
    public VertexOutput Vertex([SV_VertexID] uint id)
    {
        VertexOutput output;
        output.Position = new Vector4(0, 0, 0, 1);
        return output;
    }

    [ShaderStage(Stage.Fragment)]
    public Vector4 Fragment(VertexOutput input)
    {
        return new Vector4(1, 0.4f, 0.7f, 1);
    }
}
`;

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function session(name, fn) {
  if (only && only !== name) return;
  const baseName = name; name = name + SFX;
  const dir = `${OUT}${name}/`;
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2, colorScheme: 'dark', locale: 'en-US' });
  const page = await ctx.newPage();
  let n = 0;
  const rec = {
    page,
    get frames() { return n; },
    async frame(count = 1) {
      for (let i = 0; i < count; i++) {
        await page.screenshot({ path: `${dir}f${String(n++).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 92 });
      }
    },
    async hold(frames) { await sleep(60); await this.frame(frames * K); },
  };
  await page.addInitScript(() => {
    // A visible mouse pointer (screenshots do not include the OS cursor).
    window.addEventListener('DOMContentLoaded', () => {
      const c = document.createElement('div');
      c.id = '__cursor';
      c.style.cssText = 'position:fixed;z-index:99999;left:0;top:0;width:26px;height:26px;pointer-events:none;transition:none;filter:drop-shadow(0 2px 4px rgba(0,0,0,.6))';
      c.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26"><path d="M4 2l15 9-6.5 1.6L9 19z" fill="#fff" stroke="#000" stroke-width="1.4" stroke-linejoin="round"/></svg>';
      document.body.appendChild(c);
      document.addEventListener('mousemove', (e) => { c.style.left = e.clientX - 3 + 'px'; c.style.top = e.clientY - 2 + 'px'; }, true);
    });
  });
  console.log(`▶ ${name}`);
  await fn(rec, page);
  await browser.close();
  const mp4 = `${PUBLIC}${name}.mp4`;
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-framerate', '60', '-i', `${dir}f%05d.jpg`, '-c:v', 'libx264', '-crf', '13', '-pix_fmt', 'yuv420p', '-r', '60', mp4]);
  fs.writeFileSync(`${OUT}${name}.json`, JSON.stringify({ frames: n, fps: 60 }));
  fs.rmSync(dir, { recursive: true, force: true }); // 4K frames are huge: the encoded MP4 is the original recording
  console.log(`  ${n} frames → ${path.relative(process.cwd(), mp4)}`);
}

async function moveMouse(rec, x, y, frames = 14) {
  const { page } = rec;
  frames *= K;
  const from = await page.evaluate(() => { const c = document.getElementById('__cursor'); return c ? [parseFloat(c.style.left) || 960, parseFloat(c.style.top) || 540] : [960, 540]; });
  for (let i = 1; i <= frames; i++) {
    const t = ease(i / frames);
    await page.mouse.move(from[0] + (x - from[0]) * t, from[1] + (y - from[1]) * t);
    await rec.frame();
  }
}
async function moveToEl(rec, selector, frames = 14) {
  const b = await rec.page.locator(selector).first().boundingBox();
  await moveMouse(rec, b.x + b.width / 2, b.y + b.height / 2, frames);
}
async function scrollTo(rec, y, frames = 45) {
  const { page } = rec;
  frames *= K;
  const from = await page.evaluate(() => window.scrollY);
  for (let i = 1; i <= frames; i++) {
    await page.evaluate((v) => window.scrollTo(0, v), from + (y - from) * ease(i / frames));
    await rec.frame();
  }
}
const elTop = (page, sel) => page.evaluate((s) => document.querySelector(s).getBoundingClientRect().top + window.scrollY, sel);

/* ---------------------------------------------------------------- playground */
await session('playground', async (rec, page) => {
  await page.goto(`${BASE}${LOC}/playground/`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.monaco && document.querySelector('#pg-status')?.textContent.includes('compiler'), null, { timeout: 120000 });
  await page.evaluate((src) => {
    const ed = monaco.editor.getEditors()[0];
    ed.updateOptions({ autoClosingBrackets: 'never', autoClosingQuotes: 'never', autoSurround: 'never', autoIndent: 'none', formatOnType: false, quickSuggestions: false, suggestOnTriggerCharacters: false, parameterHints: { enabled: false }, acceptSuggestionOnEnter: 'off', wordBasedSuggestions: 'off', fontSize: 27, lineHeight: 40 });
  }, SHADER);
  // Types.cs first: the project's own types.
  await page.locator('.pg-file', { hasText: 'Types.cs' }).first().click();
  await sleep(500);
  await moveMouse(rec, 1500, 700, 1);
  await rec.hold(54);
  // Shader.cs, emptied, then typed.
  await page.locator('.pg-file', { hasText: 'Shader.cs' }).first().click();
  await page.evaluate(() => { const ed = monaco.editor.getEditors()[0]; ed.setValue(''); ed.focus(); });
  await sleep(500);
  await rec.hold(10);
  const chunk = 4 / K;
  for (let i = 0; i < SHADER.length; i += chunk) {
    const part = SHADER.slice(i, i + chunk);
    for (const ch of part) {
      if (ch === '\n') await page.keyboard.press('Enter');
      else await page.keyboard.insertText(ch);
    }
    await rec.frame();
  }
  await rec.hold(20);
  // Real compile.
  await moveToEl(rec, '#pg-run', 22);
  await page.locator('#pg-run').click();
  const t0 = Date.now();
  while (Date.now() - t0 < 60000) {
    await rec.frame();
    const done = await page.evaluate(() => /ms$/.test(document.querySelector('#pg-status').textContent));
    if (done) break;
  }
  await rec.hold(12);
  await moveToEl(rec, '[data-tab="shaders"]', 14);
  await page.locator('[data-tab="shaders"]').click();
  await rec.hold(75);
});

/* ---------------------------------------------------------------------- site */
await session('site-home', async (rec, page) => {
  await page.goto(`${BASE}${LOC}/`, { waitUntil: 'networkidle' });
  await rec.hold(45);
  await scrollTo(rec, (await elTop(page, '.flow')) - 130, 70);
  await rec.hold(60);
});
await session('site-docs', async (rec, page) => {
  await page.goto(`${BASE}${LOC}/documentation/yotsuba-shader/generating-shader-binaries/`, { waitUntil: 'networkidle' });
  await rec.hold(30);
  const code = await page.evaluate(() => [...document.querySelectorAll('.doc-body .code')].findIndex((c) => c.textContent.includes('CompiledCode')));
  const top = await page.evaluate((i) => document.querySelectorAll('.doc-body .code')[i].getBoundingClientRect().top + window.scrollY, code);
  await scrollTo(rec, top - 200, 80);
  await rec.hold(60);
});
await session('site-sponsors', async (rec, page) => {
  await page.goto(`${BASE}${LOC}/donations/`, { waitUntil: 'networkidle' });
  await rec.hold(40);
  await scrollTo(rec, 560, 60);
  await rec.hold(40);
});

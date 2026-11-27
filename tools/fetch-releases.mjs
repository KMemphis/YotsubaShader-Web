// Downloads the releases and contributors of the repository from the GitHub API and writes src/data/releases.json,
// which the What's New page renders. The site build never calls the network: run this when there is a new release,
// then commit the JSON.
//
//   node tools/fetch-releases.mjs
//   GITHUB_TOKEN=... node tools/fetch-releases.mjs     (optional: raises the rate limit from 60 to 5000 per hour)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO = 'KMemphis/YotsubaShader';
const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'yotsuba-shader-web-build', ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}) };

async function all(endpoint) {
  const out = [];
  for (let page = 1; ; page++) {
    const res = await fetch(`https://api.github.com/repos/${REPO}/${endpoint}${endpoint.includes('?') ? '&' : '?'}per_page=100&page=${page}`, { headers });
    if (!res.ok) throw new Error(`${endpoint}: HTTP ${res.status}`);
    const rows = await res.json();
    out.push(...rows);
    if (rows.length < 100) return out;
  }
}

const releases = (await all('releases'))
  .filter((r) => !r.draft)
  .map((r) => ({
    tag: r.tag_name,
    name: r.name || r.tag_name,
    date: r.published_at,
    prerelease: r.prerelease,
    url: r.html_url,
    author: r.author?.login || null,
    body: (r.body || '').replace(/\r\n/g, '\n'),
    assets: r.assets.map((a) => ({ name: a.name, size: a.size, url: a.browser_download_url })),
  }))
  .sort((a, b) => b.date.localeCompare(a.date));

const contributors = (await all('contributors'))
  .filter((c) => c.type === 'User')
  .map((c) => ({ login: c.login, url: c.html_url, commits: c.contributions }));

const file = path.join(ROOT, 'src', 'data', 'releases.json');
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, JSON.stringify({ repo: REPO, fetched: new Date().toISOString().slice(0, 10), releases, contributors }, null, 2) + '\n');
console.log(`${releases.length} releases and ${contributors.length} contributors -> src/data/releases.json`);

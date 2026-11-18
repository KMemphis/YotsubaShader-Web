// Prepares an article's HTML for "listen to this page":
//  - wraps every spoken word in <span class="w" data-b="N"> (N = block number) so the player can light it up
//  - returns the list of spoken blocks (headings, paragraphs, list items) in reading order
// The tts.mjs script sends exactly these blocks to the speech API, so text and audio always line up.
import crypto from 'node:crypto';

const BLOCK = new Set(['h1', 'h2', 'h3', 'p', 'li']);
const SKIP = new Set(['pre', 'button', 'script', 'style', 'table', 'svg']);
const VOID = new Set(['br', 'hr', 'img', 'input', 'meta', 'link', 'wbr']);
const ENT = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' };
const decode = (s) => s.replace(/&(?:amp|lt|gt|quot|#39|nbsp);/g, (m) => ENT[m]);

export function speakable(html) {
  const blocks = [];
  const stack = []; // { tag, skip, block }
  let out = '';
  let gap = false; // was the last text we saw followed by whitespace?
  const re = /(<[^>]+>)|([^<]+)/g;
  let m;
  while ((m = re.exec(html))) {
    if (m[1]) {
      const tag = m[1];
      const name = (tag.match(/^<\/?([a-zA-Z0-9]+)/) || [])[1]?.toLowerCase();
      out += tag;
      if (!name || tag.startsWith('<!')) continue;
      if (tag[1] === '/') {
        // close: pop to the matching open element
        for (let i = stack.length - 1; i >= 0; i--) if (stack[i].tag === name) { stack.length = i; break; }
      } else if (!VOID.has(name) && !tag.endsWith('/>')) {
        const cls = (tag.match(/class="([^"]*)"/) || [])[1] || '';
        const skip =
          SKIP.has(name) ||
          /\b(anchor|meta|callout-title|code-title|crumbs|badge|video-card)\b/.test(cls);
        const parent = stack[stack.length - 1];
        let block = parent ? parent.block : -1;
        if (BLOCK.has(name) && !skip) { blocks.push(''); block = blocks.length - 1; }
        stack.push({ tag: name, skip: skip || !!parent?.skip, block });
      }
      continue;
    }
    const top = stack[stack.length - 1];
    if (!top || top.skip || top.block < 0) { out += m[2]; continue; }
    out += m[2].replace(/(\s+)|(\S+)/g, (_, space, word) => {
      if (space) { gap = true; return space; }
      blocks[top.block] += (gap && blocks[top.block] ? ' ' : '') + decode(word);
      gap = false;
      return `<span class="w" data-b="${top.block}">${word}</span>`;
    });
  }
  // keep only blocks that actually contain words; the player needs the same numbering, so we do not renumber:
  // empty blocks are kept as '' and skipped by the audio script.
  return { html: out, blocks };
}

export const hashBlocks = (blocks) => crypto.createHash('sha1').update(JSON.stringify(blocks)).digest('hex').slice(0, 12);

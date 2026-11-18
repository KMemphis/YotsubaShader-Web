import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT, C } from './kit';
import { H, Word, getLang, ramp, timing, useT } from './data';

type Page = { start: number; end: number; words: Word[] };

const MAX_CHARS = 72; // two lines at the caption size
const SOFT_BREAK = 38; // after this many characters a comma is a good place to turn the page

/** Caption pages: never cross a sentence, at most ~72 characters, preferably split after a comma. */
const build = (): Page[] => {
  const out: Page[] = [];
  for (const sc of timing.scenes) {
    for (const sen of sc.sentences) {
      let cur: Word[] = [];
      let len = 0;
      const flush = () => { if (cur.length) out.push({ start: cur[0].start, end: cur[cur.length - 1].end, words: cur }); cur = []; len = 0; };
      sen.words.forEach((w, i) => {
        if (cur.length && len + 1 + w.w.length > MAX_CHARS) flush();
        cur.push(w);
        len += (len ? 1 : 0) + w.w.length;
        const last = i === sen.words.length - 1;
        if (!last && len >= SOFT_BREAK && /[,;:]$/.test(w.w)) flush();
      });
      flush();
      // a lonely last word looks wrong: pull it back into the previous page when it still fits
      const n = out.length;
      if (n >= 2 && out[n - 1].words.length === 1 && out[n - 2].end >= sen.start) {
        const prev = out[n - 2], last = out[n - 1];
        const total = prev.words.reduce((a, w) => a + w.w.length + 1, 0) + last.words[0].w.length;
        if (total <= MAX_CHARS + 10) { prev.words.push(last.words[0]); prev.end = last.end; out.pop(); }
      }
    }
  }
  return out;
};
const cache: Record<string, Page[]> = {};
const getPages = (): Page[] => (cache[getLang() + timing.duration] ??= build());

export const Captions: React.FC = () => {
  const t = useT();
  const pages = getPages();
  const idx = pages.findIndex((p, i) => t >= p.start - 0.12 && (i === pages.length - 1 || t < pages[i + 1].start - 0.12));
  const page = pages[idx];
  if (!page || t > page.end + 0.5) return null;
  const a = ramp(t, page.start - 0.12, page.start + 0.06) * (1 - ramp(t, page.end + 0.25, page.end + 0.5));
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 210, background: '#070c12' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 56, display: 'flex', justifyContent: 'center', opacity: a }}>
        <div style={{ width: 1460, textAlign: 'center', fontFamily: FONT, fontSize: 50, fontWeight: 600, lineHeight: 1.28, letterSpacing: '-0.012em' }}>
          {page.words.map((w, i) => {
            const state = t >= w.end ? 'past' : t >= w.start ? 'now' : 'next';
            return (
              <span key={i} style={{ color: state === 'now' ? C.pink : state === 'past' ? C.ink : '#5e7177', transition: 'none' }}>
                {w.w}{i < page.words.length - 1 ? ' ' : ''}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export { getPages as captionPages };

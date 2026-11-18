import React, { createContext, useContext } from 'react';
import { AbsoluteFill, Easing, Img, Sequence, interpolate, useCurrentFrame } from 'remotion';
import { Audio } from '@remotion/media';
import { staticFile } from 'remotion';
import { FONT, MONO, WORDMARK, GRAD } from '../ui';
// @ts-ignore  (same build-time highlighter as the website)
import { highlight } from '../highlight.mjs';

export const FPS = 60;
/** Seconds after the last word: the closing screen with the logo. */
export const TAIL = 6;
/** Seconds before the first word: the opening screen, the same as the closing one. */
export const LEAD = 4;

/** Palette: quiet graphite, paper white, and a handful of flat colours used one at a time. */
export const P = {
  bg: '#0e0e10', raised: '#1c1c1e', line: '#2c2c2e', ink: '#f5f5f7', dim: '#8e8e93',
  paper: '#ffffff', paperInk: '#1d1d1f', paperDim: '#6e6e73',
  pink: '#ff7ab2', violet: '#c5a3ff', mint: '#62f0d0', // the colours of the website and the logo, nothing else
};
export { FONT, MONO };

export type Sentence = { start: number; end: number; text: string };
export type Item = {
  kind: string; block?: number | null; text?: string; start?: number; end?: number; sentences?: Sentence[];
  silent?: boolean; styles?: { style: string; code: string }[]; tabs?: { label: string; code: string }[]; code?: string; title?: string; rows?: string[][]; src?: string; alt?: string;
};
export type ChapterData = { lang: string; page: string; title: string; duration: number; items: Item[] };

export type Ctx = {
  t: number; t0: number; t1: number; lt: number; p: number; lang: string;
  /** the written text of block n */
  text: (n: number) => string;
  bs: (n: number) => number; be: (n: number) => number; sent: (n: number) => Sentence[];
  /** progress 0..1 of time t between the start of block a and the end of block b */
  span: (a: number, b: number) => number;
};
export type SceneDef = { from: number; to: number; light?: boolean; field?: boolean; lead?: number; tail?: number; render: (c: Ctx) => React.ReactNode };

export const ease = Easing.bezier(0.2, 0.8, 0.2, 1);
export const ramp = (t: number, a: number, b: number) => ease(Math.min(1, Math.max(0, (t - a) / Math.max(1e-6, b - a))));
export const lin = (t: number, a: number, b: number) => Math.min(1, Math.max(0, (t - a) / Math.max(1e-6, b - a)));
export const mix = (a: string, b: string, k: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const m = pa.map((v, i) => Math.round(v + (pb[i] - v) * k));
  return '#' + m.map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
};

const TimeCtx = createContext<number>(0);
export const useT = () => useContext(TimeCtx);

/** Fade + rise, driven by the scene's clock (seconds). */
export const Fade: React.FC<{ at: number; dur?: number; rise?: number; out?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, dur = 0.8, rise = 24, out, children, style }) => {
  const t = useT();
  const k = ramp(t, at, at + dur);
  const o = out === undefined ? 1 : 1 - ramp(t, out, out + 0.5);
  if (k <= 0 || o <= 0) return null;
  return <div style={{ opacity: k * o, transform: `translateY(${(1 - k) * rise}px)`, ...style }}>{children}</div>;
};

export const Kicker: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties }> = ({ children, color = P.dim, style }) => (
  <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: '0.02em', color, ...style }}>{children}</div>
);
export const Big: React.FC<{ children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties }> = ({ children, size = 120, color = P.ink, style }) => (
  <div style={{ fontSize: size, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.02, color, ...style }}>{children}</div>
);

export const Code: React.FC<{
  code: string; title: string; x: number; y: number; w: number; fs?: number; chars?: number;
  hl?: { from: number; to: number; color?: string }[]; dim?: number[];
}> = ({ code, title, x, y, w, fs = 30, chars, hl = [], dim = [] }) => {
  const lines = code.split('\n');
  let left = chars === undefined ? Infinity : chars;
  const lh = fs * 1.55;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, background: P.raised, borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ height: 54, display: 'flex', alignItems: 'center', padding: '0 26px', fontFamily: FONT, fontSize: 20, fontWeight: 600, color: P.dim }}>{title}</div>
      <div style={{ padding: '6px 0 26px', position: 'relative' }}>
        {lines.map((ln, i) => {
          const shown = Math.max(0, Math.min(ln.length, left));
          left -= ln.length + 1;
          const h = hl.find((q) => i >= q.from && i <= q.to);
          return (
            <div key={i} style={{ height: lh, padding: '0 26px', display: 'flex', alignItems: 'center', background: h ? mix(P.raised, h.color ?? P.violet, 0.2) : 'transparent', borderLeft: `5px solid ${h ? h.color ?? P.violet : 'transparent'}`, opacity: dim.includes(i) ? 0.4 : 1 }}>
              <pre style={{ margin: 0, fontFamily: MONO, fontSize: fs, color: '#e5e5e7', whiteSpace: 'pre' }} dangerouslySetInnerHTML={{ __html: ln === '' || shown <= 0 ? '&nbsp;' : highlight('csharp', ln.slice(0, shown)) }} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** The subtitle: the sentence being read, with the words already said at full strength. */
const Caption: React.FC<{ items: Item[]; t: number; light: boolean; field: boolean }> = ({ items, t, light, field }) => {
  let cur: Sentence | null = null;
  for (const it of items) for (const s of it.sentences ?? []) if (t >= s.start - 0.1 && t <= s.end + 0.35) cur = s;
  if (!cur || !cur.text) return null;
  const k = lin(t, cur.start, cur.end);
  const words = cur.text.split(' ');
  const total = cur.text.length;
  let pos = 0;
  const a = ramp(t, cur.start - 0.1, cur.start + 0.1) * (1 - ramp(t, cur.end + 0.1, cur.end + 0.35));
  const on = light || field ? (field ? P.bg : P.paperInk) : P.ink;
  const off = field ? 'rgba(14,14,16,0.45)' : light ? '#a1a1a6' : '#7a7a80';
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 62, display: 'flex', justifyContent: 'center', opacity: a }}>
      <div style={{ width: 1500, textAlign: 'center', fontFamily: FONT, fontSize: 42, fontWeight: 600, lineHeight: 1.3, letterSpacing: '-0.01em' }}>
        {words.map((w, i) => {
          const done = pos / total <= k;
          pos += w.length + 1;
          return <span key={i} style={{ color: done ? on : off }}>{w}{i < words.length - 1 ? ' ' : ''}</span>;
        })}
      </div>
    </div>
  );
};

/** Closing screen, the same as the home page of the website: logo, headline and tagline. */
const EndCard: React.FC<{ lang: string; t: number; at: number; until?: number }> = ({ lang, t, at, until }) => {
  const k = ramp(t, at, at + 0.9) * (until === undefined ? 1 : 1 - ramp(t, until, until + 0.6));
  if (k <= 0) return null;
  const es = lang === 'es';
  return (
    <AbsoluteFill style={{ background: '#070c12', opacity: k, alignItems: 'center', justifyContent: 'center', fontFamily: FONT }}>
      <div style={{ transform: `translateY(${(1 - k) * 18}px)`, textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 28, fontFamily: WORDMARK, fontSize: 92, letterSpacing: '-0.02em' }}>
          <Img src={staticFile('logo.webp')} style={{ width: 118, height: 118 }} />
          <span><span style={{ fontWeight: 600, color: '#edf8f4' }}>Yotsuba</span> <span style={{ fontWeight: 500, background: GRAD, WebkitBackgroundClip: 'text', color: 'transparent' }}>Shader</span></span>
        </div>
        <div style={{ marginTop: 70, fontSize: 124, fontWeight: 700, letterSpacing: '-0.035em', color: '#edf8f4', lineHeight: 1.05 }}>
          {es ? 'Escribe shaders ' : 'Write shaders '}<span style={{ color: P.pink }}>{es ? 'en C#' : 'in C#'}</span>
        </div>
        <div style={{ marginTop: 28, fontSize: 52, fontWeight: 500, color: '#819aa0', letterSpacing: '-0.01em' }}>
          {es ? 'Un SDK para muchas APIs gráficas y motores de juego' : 'An SDK for many graphics APIs and game engines'}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Inner: React.FC<{ f: (c: Ctx) => React.ReactNode; ctx: Ctx }> = ({ f, ctx }) => <>{f(ctx)}</>;

export const Chapter: React.FC<{ data: ChapterData; scenes: SceneDef[]; audio: string }> = ({ data, scenes, audio }) => {
  const t = useCurrentFrame() / FPS - LEAD; // 0 = the first word; negative while the opening screen shows
  const blocks = new Map<number, Item>();
  for (const it of data.items) if (it.block != null) blocks.set(it.block, it);
  const timed = [...blocks.values()].filter((b) => b.start != null).sort((a, b) => (a.block as number) - (b.block as number));
  // a block without voice (an image-only paragraph) borrows the time of its neighbour
  const bs = (n: number) => (timed.find((b) => (b.block as number) >= n) ?? timed[timed.length - 1]).start as number;
  const be = (n: number) => ([...timed].reverse().find((b) => (b.block as number) <= n) ?? timed[0]).end as number;
  const sent = (n: number) => blocks.get(n)?.sentences ?? [];
  let lightNow = false;
  let fieldNow = false;
  const nodes = scenes.map((s, i) => {
    const t0 = bs(s.from) - (s.lead ?? 0.5);
    const t1 = be(s.to) + (s.tail ?? 0.6);
    if (t < t0 - 0.01 || t > t1 + 0.01) return null;
    const o = ramp(t, t0, t0 + 0.5) * (1 - ramp(t, t1 - 0.5, t1));
    if (o > 0.5 && s.light) lightNow = true;
    if (o > 0.5 && s.field) fieldNow = true;
    const ctx: Ctx = {
      t, t0, t1, lt: t - t0, p: lin(t, bs(s.from), be(s.to)), lang: data.lang, text: (n) => blocks.get(n)?.text ?? '', bs, be, sent,
      span: (a, b) => lin(t, bs(a), be(b)),
    };
    return (
      <AbsoluteFill key={i} style={{ opacity: i === 0 && t < t0 + 0.5 ? 1 : o, background: s.light ? P.paper : P.bg }}>
        <TimeCtx.Provider value={t - t0}><Inner f={s.render} ctx={ctx} /></TimeCtx.Provider>
      </AbsoluteFill>
    );
  });
  return (
    <AbsoluteFill style={{ background: P.bg, fontFamily: FONT, color: P.ink }}>
      <style>{`.tok-k{color:#ff7ab2}.tok-t{color:#6ab7ff}.tok-f{color:#7fe3a8}.tok-p{color:#c4a7ff}.tok-ns{color:#9fb0c8}.tok-s{color:#ff8170}.tok-n{color:#d9c97c}.tok-c{color:#7f8c98;font-style:italic}.tok-a{color:#ffa14f}`}</style>
      <Sequence from={Math.round(LEAD * FPS)}><Audio src={staticFile(audio)} /></Sequence>
      {nodes}
      <Caption items={data.items} t={t} light={lightNow} field={fieldNow} />
      <EndCard lang={data.lang} t={t} at={data.duration + 0.8} />
      <EndCard lang={data.lang} t={t + LEAD} at={-1} until={LEAD - 0.5} />
    </AbsoluteFill>
  );
};

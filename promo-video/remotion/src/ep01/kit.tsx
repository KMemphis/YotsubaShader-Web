import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { FONT, MONO, WORDMARK, GRAD } from '../ui';
// @ts-ignore  (same build-time highlighter as the website)
import { highlight } from '../highlight.mjs';
import { H, W, ramp, scene, timing, useT } from './data';

export { FONT, MONO, WORDMARK, GRAD };

export const C = {
  bg: '#070c12',
  panel: '#0e1620',
  panel2: '#131d29',
  line: '#1f2b39',
  ink: '#edf8f4',
  dim: '#819aa0',
  pink: '#ff7ab2',
  violet: '#c5a3ff',
  mint: '#62f0d0',
  blue: '#6bdfff',
  red: '#ff6b6b',
  green: '#7fe3a8',
  amber: '#ffa14f',
};

export const TOKENS = `
.tok-k{color:#ff7ab2}.tok-t{color:#6bdfff}.tok-f{color:#7fe3a8}.tok-p{color:#c4a7ff}.tok-ns{color:#9fb0c8}
.tok-s{color:#ff8170}.tok-n{color:#d9c97c}.tok-c{color:#7f8c98;font-style:italic}.tok-a{color:#ffa14f}`;

/** Flat dark stage. */
export const Backdrop: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: C.bg, fontFamily: FONT, color: C.ink }}>
    <style>{TOKENS}</style>
    {children}
  </AbsoluteFill>
);

/**
 * Wraps one scene: visible from `lead` seconds before its first word until `hold` seconds after the next scene starts,
 * fading at both ends so scenes dissolve into each other.
 */
export const SceneFrame: React.FC<{ id: string; children: React.ReactNode; lead?: number; hold?: number }> = ({ id, children, lead = 0.5, hold = 0.5 }) => {
  const t = useT();
  const i = timing.scenes.findIndex((s) => s.id === id);
  const s = scene(id);
  const next = timing.scenes[i + 1];
  const inStart = s.start - lead;
  const outStart = next ? next.start - 0.05 : timing.duration + 100; // the last scene stays until the end
  if (t < inStart - 0.01 || t > outStart + hold + 0.05) return null;
  const opacity = ramp(t, inStart, s.start) * (1 - ramp(t, outStart, outStart + hold));
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

/** Everything above the subtitle zone. */
export const Content: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H - 200, ...style }}>{children}</div>
);

/** Fade + rise-in driven by time. */
export const Appear: React.FC<{ at: number; dur?: number; rise?: number; out?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, dur = 0.7, rise = 26, out, children, style }) => {
  const t = useT();
  const k = ramp(t, at, at + dur);
  const o = out === undefined ? 1 : 1 - ramp(t, out, out + 0.5);
  if (k <= 0 || o <= 0) return null;
  return <div style={{ opacity: k * o, transform: `translateY(${(1 - k) * rise}px)`, ...style }}>{children}</div>;
};

export const Kicker: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = C.dim }) => (
  <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color }}>{children}</div>
);

export const Headline: React.FC<{ children: React.ReactNode; size?: number; style?: React.CSSProperties }> = ({ children, size = 84, style }) => (
  <div style={{ fontSize: size, fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.05, ...style }}>{children}</div>
);

/** Emphasis: one solid accent colour (no gradient text). */
export const Gradient: React.FC<{ children: React.ReactNode }> = ({ children }) => <span style={{ color: C.pink }}>{children}</span>;

/** A label: plain text with a solid coloured rule on the left. No pill, no tint. */
export const Chip: React.FC<{ children: React.ReactNode; color?: string; mono?: boolean; size?: number; style?: React.CSSProperties }> = ({ children, color = C.ink, mono, size = 34, style }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', borderLeft: `${Math.max(4, Math.round(size * 0.14))}px solid ${color}`, paddingLeft: size * 0.5, color: C.ink, fontSize: size, fontWeight: 600, fontFamily: mono ? MONO : FONT, letterSpacing: mono ? 0 : '-0.01em', whiteSpace: 'nowrap', lineHeight: 1.25, ...style }}>{children}</div>
);

/** Code window with the site's own syntax colours. `reveal` = characters shown (typed), `hl` = highlighted line ranges. */
export const CodeWin: React.FC<{
  title: string; code: string; width: number; height?: number; size?: number; chars?: number; lang?: string;
  hl?: { from: number; to: number; color?: string; opacity?: number }[]; style?: React.CSSProperties; caret?: boolean;
}> = ({ title, code, width, height, size = 30, chars, lang = 'csharp', hl = [], style, caret = true }) => {
  const t = useT();
  const n = chars === undefined ? code.length : Math.max(0, Math.min(code.length, Math.floor(chars)));
  const typing = n < code.length;
  const html = highlight(lang, code.slice(0, n)) + (caret && (typing || Math.floor(t * 2) % 2 === 0) ? `<span style="display:inline-block;width:.55em;height:1.15em;vertical-align:-0.2em;background:#edf8f4;opacity:.8"></span>` : '');
  const lineH = size * 1.5;
  const pad = 30;
  const lines = code.split('\n').length;
  return (
    <div style={{ width, height: height ?? lines * lineH + pad * 2 + 58, borderRadius: 6, background: '#0b1119', border: `1px solid ${C.line}`, overflow: 'hidden', ...style }}>
      <div style={{ height: 58, display: 'flex', alignItems: 'center', padding: '0 24px', background: '#101a26', borderBottom: `1px solid ${C.line}`, fontSize: 20, color: C.dim, fontWeight: 500, fontFamily: MONO }}>{title}</div>
      <div style={{ position: 'relative' }}>
        {hl.map((h, k) => (
          <div key={k} style={{ position: 'absolute', left: 10, right: 10, top: pad + h.from * lineH - 4, height: (h.to - h.from + 1) * lineH + 8, borderRadius: 4, background: mixHex('#0b1119', h.color ?? C.pink, 0.16), border: `2px solid ${h.color ?? C.pink}`, opacity: h.opacity ?? 1 }} />
        ))}
        <pre style={{ position: 'relative', margin: 0, padding: pad, fontFamily: MONO, fontSize: size, lineHeight: `${lineH}px`, color: '#e5eef0', whiteSpace: 'pre' }} dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
};

export const Logo: React.FC<{ size?: number }> = ({ size = 56 }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.3, fontFamily: WORDMARK, fontSize: size, letterSpacing: '-0.02em' }}>
    <Img src={staticFile('logo.webp')} style={{ width: size * 1.25, height: size * 1.25 }} />
    <span><span style={{ fontWeight: 600 }}>Yotsuba</span> <span style={{ fontWeight: 500, background: GRAD, WebkitBackgroundClip: 'text', color: 'transparent' }}>Shader</span></span>
  </div>
);

/** Typing progress: characters shown at time t for a block that starts typing at `at`. */
export const typed = (t: number, at: number, length: number, cps = 46) => Math.max(0, (t - at) * cps) * (length > 0 ? 1 : 0);

/** Mix two hex colours. */
export const mixHex = (a: string, b: string, k: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const m = pa.map((v, i) => Math.round(v + (pb[i] - v) * k));
  return `rgb(${m[0]},${m[1]},${m[2]})`;
};
/** Pink -> violet -> mint ramp, k in 0..1. */
export const ramp3 = (k: number) => (k < 0.5 ? mixHex(C.pink, C.violet, k * 2) : mixHex(C.violet, C.mint, (k - 0.5) * 2));

/** Opaque tint of an accent colour over the panel colour (replaces translucent fills). */
export const tint = (color: string, k = 0.14) => mixHex(C.panel, color, k);

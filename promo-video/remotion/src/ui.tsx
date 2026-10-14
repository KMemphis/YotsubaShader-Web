import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';

/** The edit is authored in 30 fps units; the composition runs at 60 fps. */
export const useFrame = () => useCurrentFrame() / 2;
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { loadFont as loadMono } from '@remotion/google-fonts/JetBrainsMono';
import { loadFont as loadOutfit } from '@remotion/google-fonts/Outfit';
// @ts-ignore  (copied from Web/src/highlight.mjs: the same build-time highlighter the website uses)
import { highlight } from './highlight.mjs';

const inter = loadInter('normal', { weights: ['400', '500', '600', '700'] });
const mono = loadMono('normal', { weights: ['400', '500'] });
const outfit = loadOutfit('normal', { weights: ['500', '600'] });
export const FONT = inter.fontFamily;
export const MONO = mono.fontFamily;
export const WORDMARK = outfit.fontFamily;
export const GRAD = 'linear-gradient(95deg,#ff8fc0,#c5a3ff,#62f0d0)';

const TOKENS = `
.tok-k{color:#ff7ab2}.tok-t{color:#6bdfff}.tok-f{color:#7fe3a8}.tok-p{color:#c4a7ff}.tok-ns{color:#9fb0c8}
.tok-s{color:#ff8170}.tok-n{color:#d9c97c}.tok-c{color:#7f8c98;font-style:italic}.tok-a{color:#ffa14f}`;

export const Stage: React.FC<{ children: React.ReactNode; glow?: string; glow2?: string }> = ({ children }) => (
  <AbsoluteFill style={{ background: 'linear-gradient(to bottom,#2a3347 0%,#141a26 38%,#05070b 78%,#000 100%)', fontFamily: FONT, color: '#f5f5f7' }}>
    <style>{TOKENS}</style>
    {children}
  </AbsoluteFill>
);

/** Slow push-in over the whole scene. */
export const Cam: React.FC<{ children: React.ReactNode; dur: number; from?: number; to?: number }> = ({ children, dur, from = 1, to = 1.045 }) => {
  const frame = useFrame();
  return <AbsoluteFill style={{ scale: interpolate(frame, [0, dur], [from, to], { extrapolateRight: 'clamp', easing: Easing.bezier(0.3, 0, 0.7, 1) }) }}>{children}</AbsoluteFill>;
};

/** Headline revealed word by word (blur + rise), the way Apple type builds on screen. */
export const Reveal: React.FC<{ text: string; from?: number; size?: number; weight?: number; color?: string; gradientFrom?: number; stagger?: number; align?: 'left' | 'center'; lineHeight?: number; maxWidth?: number }> = ({ text, from = 0, size = 104, weight = 700, color = '#f5f5f7', gradientFrom = -1, stagger = 3, align = 'center', lineHeight = 1.05, maxWidth }) => {
  const frame = useFrame();
  const words = text.split(' ');
  return (
    <div style={{ fontSize: size, fontWeight: weight, letterSpacing: '-0.04em', lineHeight, textAlign: align, color, maxWidth, display: 'flex', flexWrap: 'wrap', justifyContent: align === 'center' ? 'center' : 'flex-start', columnGap: size * 0.26 }}>
      {words.map((w, i) => {
        const t = interpolate(frame, [from + i * stagger, from + i * stagger + 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) });
        const grad = gradientFrom >= 0 && i >= gradientFrom;
        return (
          <span key={i} style={{ display: 'inline-block', opacity: t, translate: `0 ${(1 - t) * 34}px`, ...(grad ? { background: GRAD, WebkitBackgroundClip: 'text', color: 'transparent' } : {}) }}>{w}</span>
        );
      })}
    </div>
  );
};

export const Wordmark: React.FC<{ size?: number }> = ({ size = 48 }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.3, fontFamily: WORDMARK, fontSize: size, letterSpacing: '-0.02em' }}>
    <Img src={staticFile('logo.webp')} style={{ width: size * 1.25, height: size * 1.25 }} />
    <span>
      <span style={{ fontWeight: 600 }}>Yotsuba</span>{' '}
      <span style={{ fontWeight: 500, background: GRAD, WebkitBackgroundClip: 'text', color: 'transparent' }}>Shader</span>
    </span>
  </div>
);

/** Plain footnote, like the small print under Apple product shots. */
export const Footnote: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: 'absolute', left: 60, bottom: 16, fontFamily: FONT, fontSize: 21, color: '#86868b', letterSpacing: '0.005em' }}>{children}</div>
);

export const Win: React.FC<{ title: string; width: number; height: number; kind?: string; children: React.ReactNode; style?: React.CSSProperties; glow?: string }> = ({ title, width, height, children, style }) => (
  <div style={{ width, height, position: 'relative', ...style }}>
    <div style={{ position: 'absolute', inset: 0, borderRadius: 24, background: '#101012', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,.12)', boxShadow: '0 50px 110px rgba(0,0,0,.6)' }}>
      <div style={{ height: 58, display: 'flex', alignItems: 'center', padding: '0 22px', position: 'relative', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
        <span style={{ width: 14, height: 14, borderRadius: 14, background: '#ff5f57', marginRight: 10 }} /><span style={{ width: 14, height: 14, borderRadius: 14, background: '#febc2e', marginRight: 10 }} /><span style={{ width: 14, height: 14, borderRadius: 14, background: '#28c840' }} />
        <span style={{ position: 'absolute', left: 0, right: 0, textAlign: 'center', fontSize: 21, color: '#86868b', fontFamily: FONT, fontWeight: 500 }}>{title}</span>
      </div>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>{children}</div>
    </div>
  </div>
);

/** Code typed progressively, with the site's own syntax highlighting. */
export const Typed: React.FC<{ code: string; lang?: string; from?: number; cps?: number; size?: number; pad?: number; caret?: boolean }> = ({ code, lang = 'csharp', from = 0, cps = 70, size = 30, pad = 34, caret = true }) => {
  const frame = useFrame();
  const n = Math.max(0, Math.min(code.length, Math.floor(((frame - from) / 30) * cps)));
  const html = highlight(lang, code.slice(0, n)) + (caret && (n < code.length || Math.floor(frame / 15) % 2 === 0) ? '<span style="display:inline-block;width:.55em;height:1.15em;vertical-align:-0.2em;background:#f5f5f7;opacity:.85"></span>' : '');
  return <pre style={{ margin: 0, padding: pad, fontFamily: MONO, fontSize: size, lineHeight: 1.5, color: '#e5e5e7', whiteSpace: 'pre' }} dangerouslySetInnerHTML={{ __html: html }} />;
};

export const fade = (frame: number, a: number, b: number, c?: number, d?: number) =>
  interpolate(frame, c === undefined ? [a, b] : [a, b, c, d as number], c === undefined ? [0, 1] : [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) });

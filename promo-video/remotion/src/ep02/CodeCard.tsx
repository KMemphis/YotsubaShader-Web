import React from 'react';
import { C, MONO, mixHex } from '../ep01/kit';
// @ts-ignore  (same build-time highlighter as the website)
import { highlight } from '../highlight.mjs';

/** A small flat code window used by the language-comparison scene. `bands` colors lines (index -> color, with opacity). */
export const CodeCard: React.FC<{
  title: string; lines: string[]; x: number; y: number; w: number; fs?: number; lh?: number;
  bands?: { line: number; color: string; o: number }[]; titleColor?: string; opacity?: number;
}> = ({ title, lines, x, y, w, fs = 24, lh = 36, bands = [], titleColor = C.dim, opacity = 1 }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, opacity, background: '#0b1119', border: `1px solid ${C.line}`, borderRadius: 6, overflow: 'hidden' }}>
    <div style={{ height: 40, display: 'flex', alignItems: 'center', padding: '0 18px', background: '#101a26', borderBottom: `1px solid ${C.line}`, fontFamily: MONO, fontSize: 18, color: titleColor, fontWeight: 600, letterSpacing: '0.12em' }}>{title}</div>
    <div style={{ padding: '12px 0' }}>
      {lines.map((ln, i) => {
        const b = bands.find((q) => q.line === i && q.o > 0.02);
        return (
          <div key={i} style={{ height: lh, display: 'flex', alignItems: 'center', paddingLeft: 18, background: b ? mixHex('#0b1119', b.color, 0.22 * b.o) : 'transparent', borderLeft: b ? `4px solid ${mixHex('#0b1119', b.color, b.o)}` : '4px solid transparent' }}>
            <pre style={{ margin: 0, fontFamily: MONO, fontSize: fs, lineHeight: `${lh}px`, color: '#e5eef0', whiteSpace: 'pre' }} dangerouslySetInnerHTML={{ __html: ln === '' ? '&nbsp;' : highlight('csharp', ln) }} />
          </div>
        );
      })}
    </div>
  </div>
);

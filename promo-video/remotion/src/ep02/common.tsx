import React from 'react';
import { C, MONO, mixHex } from '../ep01/kit';
import { lerp } from '../ep01/data';

/** Vertex colours of the tutorial triangle: red, green, blue. */
export const VC = ['#ff4d4d', '#3ddc84', '#4d8dff'];
/** Its three vertices in the GPU's own ruler (-1..1, Y up): top, bottom left, bottom right. */
export const NDC: [number, number][] = [[0, 0.8], [-0.8, -0.7], [0.8, -0.7]];

export const toPx = (n: [number, number], w: number, h: number): [number, number] => [((n[0] + 1) / 2) * w, ((1 - n[1]) / 2) * h];

/** Barycentric weights of a point in the triangle P (pixel coordinates). */
export const bary = (x: number, y: number, P: [number, number][]) => {
  const [a, b, c] = P;
  const d = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1]);
  const l1 = ((b[1] - c[1]) * (x - c[0]) + (c[0] - b[0]) * (y - c[1])) / d;
  const l2 = ((c[1] - a[1]) * (x - c[0]) + (a[0] - c[0]) * (y - c[1])) / d;
  return [l1, l2, 1 - l1 - l2];
};

export const blend = (l: number[]) => {
  const rgb = [0, 1, 2].map((j) => Math.round([0, 1, 2].reduce((acc, k) => acc + l[k] * parseInt(VC[k].slice(1 + j * 2, 3 + j * 2), 16), 0)));
  return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
};

/** A solid panel: flat fill, one hairline border, small radius. */
export const Box: React.FC<{ children?: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 6, ...style }}>{children}</div>
);

/** Small mono tag used for names of things (positions, slots, numbers). */
export const Mono: React.FC<{ children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties }> = ({ children, color = C.ink, size = 32, style }) => (
  <span style={{ fontFamily: MONO, fontSize: size, color, ...style }}>{children}</span>
);

/**
 * The screen as the GPU draws the triangle. Cells are evaluated with `cellFn(weights, col, row)`; the triangle outline grows
 * with `outline` (0..1) and the vertex dots with `dots`.
 */
export const TriPanel: React.FC<{
  w: number; h: number; cell?: number; cellFn?: (l: number[], c: number, r: number) => string | null;
  outline?: number; dots?: [number, number, number]; labelDots?: boolean; marks?: { x: number; y: number; color?: string }[];
  P?: [number, number][]; bg?: string; children?: React.ReactNode;
}> = ({ w, h, cell = 12, cellFn, outline = 0, dots = [0, 0, 0], marks = [], P: PP, bg = '#05080c', children }) => {
  const P = PP ?? NDC.map((n) => toPx(n, w, h));
  const cols = Math.floor(w / cell), rows = Math.floor(h / cell);
  const cells: React.ReactNode[] = [];
  if (cellFn) {
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const x = c * cell + cell / 2, y = r * cell + cell / 2;
      const l = bary(x, y, P);
      if (l.every((v) => v >= 0)) {
        const f = cellFn(l, c, r);
        if (f) cells.push(<rect key={r * cols + c} x={c * cell} y={r * cell} width={cell - 1} height={cell - 1} fill={f} />);
      }
    }
  }
  const edge = (i: number, j: number, k: number) => {
    const a = P[i], b = P[j];
    return <line key={i} x1={a[0]} y1={a[1]} x2={lerp(a[0], b[0], k)} y2={lerp(a[1], b[1], k)} stroke="#edf8f4" strokeWidth={3} strokeLinecap="round" />;
  };
  return (
    <svg width={w} height={h} style={{ background: bg, border: `1px solid ${C.line}`, borderRadius: 6, display: 'block' }}>
      {cells}
      {outline > 0 ? [edge(0, 1, Math.min(1, outline * 3)), outline > 1 / 3 ? edge(1, 2, Math.min(1, outline * 3 - 1)) : null, outline > 2 / 3 ? edge(2, 0, Math.min(1, outline * 3 - 2)) : null] : null}
      {P.map((p, i) => (dots[i] > 0 ? <circle key={i} cx={p[0]} cy={p[1]} r={lerp(0, 13, dots[i])} fill={VC[i]} stroke="#edf8f4" strokeWidth={3} /> : null))}
      {marks.map((m, i) => <rect key={i} x={m.x - cell / 2 - 3} y={m.y - cell / 2 - 3} width={cell + 6} height={cell + 6} fill="none" stroke={m.color ?? '#edf8f4'} strokeWidth={3} />)}
      {children}
    </svg>
  );
};

/** A numbered label: big mono number in a square, then text. */
export const Num: React.FC<{ n: string | number; color: string; size?: number }> = ({ n, color, size = 56 }) => (
  <div style={{ width: size, height: size, border: `3px solid ${color}`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontSize: size * 0.5, fontWeight: 500, color, flex: 'none' }}>{n}</div>
);

export { mixHex };

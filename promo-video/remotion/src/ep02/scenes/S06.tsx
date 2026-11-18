import React from 'react';
import { Appear, C, Kicker, SceneFrame } from '../../ep01/kit';
import { cue, ramp, scene, useT, T } from '../../ep01/data';
import { Mono, VC } from '../common';
import { Workbench } from '../workbench';

const ID = 'v2-s06-coordinates';
const X0 = 90, Y0 = 130, W = 520, H = 520; // the square that stands for the screen, in the left area

export const S06: React.FC = () => {
  const t = useT();
  const s = scene(ID);
  const px = cue(ID, '1920');
  const ruler = cue(ID, 'one ruler');
  const center = cue(ID, 'The center of the screen');
  const left = cue(ID, 'The left edge');
  const bottom = cue(ID, 'The bottom edge');
  const top = cue(ID, 'the top vertex');
  const warn = cue(ID, 'One warning');
  const yup = cue(ID, 'Y grows upward');
  const k = (a: number, b = a + 0.5) => ramp(t, a, b);
  const cx = X0 + W / 2, cy = Y0 + H / 2;
  const topPt: [number, number] = [cx, cy - 0.8 * (H / 2)];
  const lab = (x: number, y: number, txt: string, o: number, color = C.ink, anchor: 'start' | 'middle' | 'end' = 'middle') => (
    <text x={x} y={y} fill={color} opacity={o} fontSize={30} fontFamily="JetBrains Mono, monospace" textAnchor={anchor}>{txt}</text>
  );
  return (
    <SceneFrame id={ID}>
      <Workbench id={ID} hl={[{ cs: ['c2'], hl: ['c2'], color: C.pink, from: top, to: warn }]}>
        <Appear at={s.start + 0.3} dur={0.7} style={{ position: 'absolute', left: 0, top: 20 }}><Kicker>{T('The position is not in pixels')}</Kicker></Appear>
        <div style={{ position: 'absolute', left: 0, top: 80, width: 700, height: 700 }}>
          <svg width={700} height={700}>
            <rect x={X0} y={Y0} width={W} height={H} fill="#05080c" stroke={C.line} strokeWidth={2} opacity={k(px - 0.2)} />
            {/* pixel sizes of different screens fade out when the single ruler arrives */}
            <g opacity={k(px) * (1 - k(ruler, ruler + 0.4))}>
              {lab(cx, Y0 - 24, '1920 px', 1, C.dim)}
              {lab(X0 - 14, cy, '800 px', 1, C.dim, 'end')}
            </g>
            <g opacity={k(ruler)}>
              <line x1={X0} y1={cy} x2={X0 + W} y2={cy} stroke={C.dim} strokeWidth={2} />
              <line x1={cx} y1={Y0} x2={cx} y2={Y0 + H} stroke={C.dim} strokeWidth={2} />
            </g>
            <circle cx={cx} cy={cy} r={9} fill={C.amber} opacity={k(center)} />
            {lab(cx + 16, cy + 36, '(0, 0)', k(center), C.amber, 'start')}
            <line x1={X0} y1={Y0} x2={X0} y2={Y0 + H} stroke={C.blue} strokeWidth={5} opacity={k(left)} />
            {lab(X0, Y0 + H + 40, '-1', k(left), C.blue)}
            <line x1={X0 + W} y1={Y0} x2={X0 + W} y2={Y0 + H} stroke={C.blue} strokeWidth={5} opacity={k(left + 0.8)} />
            {lab(X0 + W, Y0 + H + 40, '1', k(left + 0.8), C.blue)}
            <line x1={X0} y1={Y0 + H} x2={X0 + W} y2={Y0 + H} stroke={C.mint} strokeWidth={5} opacity={k(bottom)} />
            {lab(X0 - 14, Y0 + H + 10, '-1', k(bottom), C.mint, 'end')}
            <line x1={X0} y1={Y0} x2={X0 + W} y2={Y0} stroke={C.mint} strokeWidth={5} opacity={k(bottom + 0.8)} />
            {lab(X0 - 14, Y0 + 10, '1', k(bottom + 0.8), C.mint, 'end')}
            <circle cx={topPt[0]} cy={topPt[1]} r={14} fill={VC[0]} stroke="#edf8f4" strokeWidth={3} opacity={k(top)} />
            {lab(topPt[0] + 26, topPt[1] + 10, '(0, 0.8)', k(top), VC[0], 'start')}
            <g opacity={k(warn)}>
              <line x1={X0 + W + 40} y1={Y0 + H} x2={X0 + W + 40} y2={Y0 + 40} stroke={C.pink} strokeWidth={5} />
              <polygon points={`${X0 + W + 40},${Y0 + 20} ${X0 + W + 24},${Y0 + 52} ${X0 + W + 56},${Y0 + 52}`} fill={C.pink} />
            </g>
          </svg>
          <Appear at={yup - 0.1} dur={0.6} style={{ position: 'absolute', left: 0, top: 690, width: 700, fontSize: 34, fontWeight: 600 }}>
            {T('Y grows upward')}
          </Appear>
        </div>
      </Workbench>
    </SceneFrame>
  );
};

import React from 'react';
import { Appear, C, Kicker, SceneFrame } from '../../ep01/kit';
import { cue, ramp, scene, useT, T } from '../../ep01/data';
import { Box, Mono, NDC, TriPanel, VC, blend, toPx } from '../common';
import { Workbench } from '../workbench';

const ID = 'v2-s10-spread';
const W = 560, H = 340, cell = 10;

export const S10: React.FC = () => {
  const t = useT();
  const s = scene(ID);
  const rare = cue(ID, 'rarely explained');
  const which = cue(ID, 'Which color does each one get');
  const spread = cue(ID, 'The GPU spreads them');
  const nearRed = cue(ID, 'next to the red vertex');
  const half = cue(ID, 'halfway between red and green');
  const center = cue(ID, 'in the center');
  const field = cue(ID, 'the Color field of Pixel');
  const notWhat = cue(ID, 'is not what the Fragment function receives');
  const k = (a: number, b = a + 0.5) => ramp(t, a, b);
  const P = NDC.map((n) => toPx(n, W, H));
  const probes = [
    { at: nearRed, l: [0.86, 0.07, 0.07], name: 'Next to the red vertex' },
    { at: half, l: [0.5, 0.5, 0], name: 'Halfway between red and green' },
    { at: center, l: [1 / 3, 1 / 3, 1 / 3], name: 'In the center' },
  ];
  const at = (l: number[]): [number, number] => [l[0] * P[0][0] + l[1] * P[1][0] + l[2] * P[2][0], l[0] * P[0][1] + l[1] * P[1][1] + l[2] * P[2][1]];
  const cur = [...probes].reverse().find((p) => t >= p.at - 0.1);
  const shown = probes.filter((p) => t >= p.at - 0.1);
  const fill = k(spread, spread + 1.5);
  return (
    <SceneFrame id={ID}>
      <Workbench id={ID} hl={[{ cs: ['p3'], hl: ['p3'], color: C.mint, from: field, to: notWhat }]}>
        <Appear at={s.start + 0.3} dur={0.7} style={{ position: 'absolute', left: 0, top: 20 }}><Kicker>{T('Spreading (interpolation)')}</Kicker></Appear>
        <Appear at={rare} dur={0.6} style={{ position: 'absolute', left: 70, top: 90 }}>
          <TriPanel w={W} h={H} cell={cell} outline={1} dots={[1, 1, 1]}
            cellFn={(l) => (fill > 0.02 ? blend(l) : '#17222f')}
            marks={shown.map((p) => { const a = at(p.l); return { x: a[0], y: a[1], color: '#edf8f4' }; })} />
        </Appear>
        <div style={{ position: 'absolute', left: 0, top: 460, width: 700 }}>
          <Appear at={which - 0.2} dur={0.6} style={{ fontSize: 32, fontWeight: 600, color: C.dim, marginBottom: 14 }}>{T('Vertex returns 3 colors. Pixels: thousands.')}</Appear>
          {probes.map((p, i) => {
            const on = k(p.at - 0.1);
            return (
              <div key={i} style={{ opacity: on, marginBottom: 14, display: 'grid', gridTemplateColumns: '1fr 300px 50px', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 26, fontWeight: 600 }}>{T(p.name)}</span>
                <div style={{ display: 'flex', height: 26 }}>
                  {p.l.map((v, j) => <div key={j} style={{ width: v * 300, background: VC[j] }} />)}
                </div>
                <div style={{ width: 40, height: 40, background: blend(p.l) }} />
              </div>
            );
          })}
        </div>
        <Appear at={notWhat - 0.3} dur={0.6} style={{ position: 'absolute', left: 0, top: 740, width: 700, fontSize: 32, fontWeight: 600 }}>
          {T('Vertex: 3 values')} <span style={{ color: C.dim }}>→</span> {T('Fragment: one per pixel')}
        </Appear>
      </Workbench>
    </SceneFrame>
  );
};

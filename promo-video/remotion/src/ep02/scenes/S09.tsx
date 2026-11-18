import React from 'react';
import { Appear, C, Kicker, SceneFrame } from '../../ep01/kit';
import { cue, fmt, lerp, ramp, scene, useT, T } from '../../ep01/data';
import { Mono, NDC, TriPanel } from '../common';
import { Workbench } from '../workbench';

const ID = 'v2-s09-pixels';

export const S09: React.FC = () => {
  const t = useT();
  const s = scene(ID);
  const knows = cue(ID, 'knows where the triangle is');
  const inside = cue(ID, 'which pixels fall inside');
  const few = cue(ID, 'a few hundred');
  const many = cue(ID, 'more than two million');
  const k = (a: number, b = a + 0.5) => ramp(t, a, b);
  const sweep = ramp(t, inside, inside + 2.2);
  const W = 560, H = 360, cell = 14;
  return (
    <SceneFrame id={ID}>
      <Workbench id={ID} hl={[{ cs: ['p2'], hl: ['p2'], color: C.blue, from: knows, to: inside }]}>
        <Appear at={s.start + 0.3} dur={0.7} style={{ position: 'absolute', left: 0, top: 20 }}><Kicker>{T('The GPU works this out, no code')}</Kicker></Appear>
        <Appear at={s.start + 0.5} dur={0.6} style={{ position: 'absolute', left: 70, top: 90 }}>
          <TriPanel w={W} h={H} cell={cell} outline={k(knows)} dots={[k(knows), k(knows), k(knows)]}
            cellFn={(l, c, r) => (r * cell < sweep * H ? '#3a6a62' : null)} />
        </Appear>
        <div style={{ position: 'absolute', left: 0, top: 450, width: 700 }}>
          <Appear at={few - 0.1} dur={0.6}>
            <div style={{ fontSize: 34, fontWeight: 600, color: C.dim }}>{T('Small triangle')}</div>
            <Mono size={72} color={C.mint}>{T('a few hundred')}</Mono>
          </Appear>
          <Appear at={many - 0.1} dur={0.6} style={{ marginTop: 28 }}>
            <div style={{ fontSize: 34, fontWeight: 600, color: C.dim }}>{T('Rectangle over a Full HD screen')}</div>
            <Mono size={72} color={C.pink}>{fmt(2073600)}</Mono>
          </Appear>
        </div>
      </Workbench>
    </SceneFrame>
  );
};

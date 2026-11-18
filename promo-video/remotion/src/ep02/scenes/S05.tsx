import React from 'react';
import { Appear, C, Kicker, SceneFrame } from '../../ep01/kit';
import { cue, ramp, scene, useT, T } from '../../ep01/data';
import { Box, Mono, VC } from '../common';
import { Workbench } from '../workbench';

const ID = 'v2-s05-slots';

export const S05: React.FC = () => {
  const t = useT();
  const s = scene(ID);
  const brackets = cue(ID, 'the number between brackets');
  const p0 = cue(ID, 'position in slot zero');
  const hlsl = cue(ID, 'In HLSL the slot is written');
  const rule = cue(ID, 'is not the position by rule');
  const swap = cue(ID, 'You could put the color in slot zero');
  const only = cue(ID, 'only sees the number and the type');
  const four = cue(ID, 'up to four numbers');
  const sixteen = cue(ID, 'at least sixteen');
  const wrong = cue(ID, 'no error appears');
  const k = (a: number, b = a + 0.5) => ramp(t, a, b);
  const sw = ramp(t, swap + 0.6, swap + 0.62) * (1 - ramp(t, only - 0.4, only - 0.38)); // 1 while the swapped example is shown
  const item = (slot: number) => {
    const isPos = (slot === 0) !== (sw > 0.5);
    return { name: isPos ? T('position') : T('color'), col: isPos ? C.pink : C.mint, ty: isPos ? 'vec2' : 'vec4' };
  };
  const row = (slot: number, at: number) => {
    const it = item(slot);
    return (
      <Appear key={slot} at={at} dur={0.5} rise={10} style={{ position: 'absolute', left: 0, top: 110 + slot * 120, width: 700 }}>
        <Box style={{ padding: '20px 26px', display: 'flex', alignItems: 'center', gap: 24, borderLeft: `6px solid ${it.col}` }}>
          <Mono size={52} color={C.amber}>{slot}</Mono><span style={{ fontSize: 36, fontWeight: 600, color: it.col }}>{it.name}</span><Mono size={28} color={C.dim} style={{ marginLeft: 'auto', opacity: k(only) }}>{it.ty}</Mono>
        </Box>
      </Appear>
    );
  };
  return (
    <SceneFrame id={ID}>
      <Workbench
        id={ID}
        swapAt={hlsl}
        hl={[
          { cs: ['c2', 'c3'], hl: ['c2', 'c3'], color: C.blue, from: brackets, to: hlsl },
          { hl: ['c2', 'c3'], color: C.violet, from: hlsl, to: rule },
          { cs: ['c2'], hl: ['c2'], color: C.pink, from: rule, to: swap },
          { cs: ['c3'], hl: ['c3'], color: C.mint, from: swap, to: only },
        ]}
      >
        <Appear at={s.start + 0.3} dur={0.7} style={{ position: 'absolute', left: 0, top: 20 }}><Kicker>{T('Door A: the data of each vertex')}</Kicker></Appear>
        {row(0, p0)}
        {row(1, p0 + 1.2)}
        <Appear at={rule} dur={0.6} style={{ position: 'absolute', left: 0, top: 350, width: 700, fontSize: 34, fontWeight: 600 }}>
          {T('The number is your choice, if the game does the same.')}
        </Appear>
        <Appear at={four} dur={0.6} style={{ position: 'absolute', left: 0, top: 450, width: 700 }}>
          <Kicker>{T('Each slot holds up to 4 numbers')}</Kicker>
          <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>{[0, 1, 2, 3].map((i) => <div key={i} style={{ width: 70, height: 46, background: i < 2 ? VC[2] : '#16212d', opacity: 0.4 + 0.15 * i }} />)}</div>
        </Appear>
        <Appear at={sixteen} dur={0.6} style={{ position: 'absolute', left: 0, top: 590, width: 700, fontSize: 34, fontWeight: 600 }}>
          <Mono size={50} color={C.mint}>16</Mono> {T('slots at least, on every GPU')}
        </Appear>
        <Appear at={wrong} dur={0.6} style={{ position: 'absolute', left: 0, top: 700, width: 700, fontSize: 34, fontWeight: 600, color: C.red }}>
          {T('Wrong number: no error, wrong drawing.')}
        </Appear>
      </Workbench>
    </SceneFrame>
  );
};

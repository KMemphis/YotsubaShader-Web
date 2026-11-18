import React from 'react';
import { Appear, C, Kicker, SceneFrame } from '../../ep01/kit';
import { cue, ramp, scene, useT, T } from '../../ep01/data';
import { Box, Mono } from '../common';
import { Workbench } from '../workbench';

const ID = 'v2-s12-doors';

export const S12: React.FC = () => {
  const t = useT();
  const s = scene(ID);
  const three = cue(ID, 'three, one for each door');
  const A = cue(ID, 'Door A is');
  const B = cue(ID, 'Door B is');
  const Cc = cue(ID, 'Door C is');
  const zero = cue(ID, 'Each door counts from zero');
  const thrice = cue(ID, 'slot zero appears three times');
  const build = cue(ID, 'three buildings');
  const rules = cue(ID, 'Three rules');
  const r1 = cue(ID, 'Inside one door');
  const r2 = cue(ID, 'Both sides of a door');
  const r3 = cue(ID, 'And between different doors');
  const fin = cue(ID, 'the final position has no slot');
  const k = (a: number, b = a + 0.5) => ramp(t, a, b);
  const doors = [
    { at: A, to: B, n: 'A', col: C.blue, a: 'Game → Vertex', b: 'Corner', d: 'Position', ty: 'vec2' },
    { at: B, to: Cc, n: 'B', col: C.violet, a: 'Vertex → Fragment', b: 'Pixel', d: 'Color', ty: 'vec4' },
    { at: Cc, to: zero, n: 'C', col: C.mint, a: 'Fragment → screen', b: 'return', d: 'Pixel color', ty: 'vec4' },
  ];
  const fade = 1 - k(rules - 0.3, rules + 0.3);
  return (
    <SceneFrame id={ID}>
      <Workbench
        id={ID}
        hl={[
          { cs: ['c2'], hl: ['c2'], color: C.blue, from: A, to: B },
          { cs: ['p3'], hl: ['p3'], color: C.violet, from: B, to: Cc },
          { cs: ['f2', 'f3'], hl: ['f3'], color: C.mint, from: Cc, to: zero },
          { cs: ['c2', 'p3', 'f2'], hl: ['c2', 'p3', 'f3'], color: C.amber, from: thrice, to: build },
          { cs: ['p2'], hl: ['p2'], color: C.blue, from: fin, to: fin + 6 },
        ]}
      >
        <Appear at={s.start + 0.3} dur={0.7} style={{ position: 'absolute', left: 0, top: 20 }}><Kicker>{T('Three doors, three rows of slots')}</Kicker></Appear>
        <div style={{ position: 'absolute', left: 0, top: 80, width: 700 }}>
          {doors.map((d) => {
            const on = k(d.at - 0.2);
            const act = k(d.at) * (1 - k(d.to));
            return (
              <Appear key={d.n} at={d.at - 0.2} dur={0.5} rise={10}>
                <Box style={{ marginBottom: 16, padding: '18px 24px', display: 'grid', gridTemplateColumns: '64px 1fr auto', alignItems: 'center', gap: 20, borderLeft: `6px solid ${d.col}` }}>
                  <div style={{ fontSize: 44, fontWeight: 700, color: d.col }}>{d.n}</div>
                  <div><div style={{ fontSize: 24, color: C.dim, fontWeight: 600 }}>{T(d.a)}</div><div style={{ fontSize: 32, fontWeight: 600 }}>{d.b} · {T(d.d)}</div></div>
                  <div style={{ textAlign: 'right', opacity: k(zero) }}><Mono size={26} color={C.dim}>{T('slot')}</Mono> <Mono size={50} color={C.amber}>0</Mono></div>
                </Box>
              </Appear>
            );
          })}
        </div>
        <div style={{ position: 'absolute', left: 0, top: 480, width: 700 }}>
          <Appear at={build} dur={0.6} style={{ opacity: fade, fontSize: 32, fontWeight: 600, color: C.dim }}>{T('Three buildings on one street. Each has an apartment 1.')}</Appear>
        </div>
        <div style={{ position: 'absolute', left: 0, top: 480, width: 700 }}>
          <Appear at={rules} dur={0.6}><Kicker color={C.amber}>{T('Three rules')}</Kicker></Appear>
          {[[r1, 'Inside one door, a number is not repeated.'], [r2, 'Both sides of a door agree on number and type. The name does not matter.'], [r3, 'Between doors, numbers have no relation.']].map(([at, txt], i) => (
            <Appear key={i} at={(at as number) - 0.1} dur={0.5} rise={10} style={{ marginTop: 18, display: 'flex', gap: 18, fontSize: 30, fontWeight: 600, lineHeight: 1.3 }}>
              <Mono size={30} color={C.amber}>{i + 1}</Mono><span>{T(txt as string)}</span>
            </Appear>
          ))}
          <Appear at={fin - 0.2} dur={0.6} style={{ marginTop: 34, fontSize: 30, fontWeight: 600, color: C.blue }}>{T('The final position has no slot: it is for the GPU.')}</Appear>
        </div>
      </Workbench>
    </SceneFrame>
  );
};

import React from 'react';
import { Appear, C, Kicker, SceneFrame } from '../../ep01/kit';
import { cue, lerp, ramp, scene, useT, T } from '../../ep01/data';
import { Box, Mono, NDC, TriPanel, VC, toPx } from '../common';
import { Workbench } from '../workbench';

const ID = 'v2-s08-position';

export const S08: React.FC = () => {
  const t = useT();
  const s = scene(ID);
  const why = cue(ID, 'why return it again');
  const moves = cue(ID, 'moves it around the map');
  const nothing = cue(ID, 'it changes nothing');
  const four = cue(ID, 'asks for the final position with four');
  const depth = cue(ID, 'the depth');
  const zo = cue(ID, 'zero and one');
  const col = cue(ID, 'the color goes through unchanged');
  const k = (a: number, b = a + 0.5) => ramp(t, a, b);
  // the triangle is moved by the Vertex stage while it is explained, and stays in place for ours
  const mv = k(moves, moves + 1.2) * (1 - k(nothing, nothing + 0.8));
  const dx = 0.35 * mv, dy = -0.15 * mv, sc = 1 - 0.25 * mv;
  const pts = NDC.map((n) => toPx([n[0] * sc + dx, n[1] * sc + dy], 520, 320));
  return (
    <SceneFrame id={ID}>
      <Workbench
        id={ID}
        intro={{ v3: why, v4: why + 0.4, v5: col, v6: col + 0.7 }}
        hl={[
          { cs: ['v4'], hl: ['v4'], color: C.pink, from: four, to: col - 0.2 },
          { cs: ['v5'], hl: ['v5'], color: C.mint, from: col, to: col + 6 },
        ]}
      >
        <Appear at={s.start + 0.3} dur={0.7} style={{ position: 'absolute', left: 0, top: 20 }}><Kicker>{T('Why Vertex returns the position')}</Kicker></Appear>
        <Appear at={why} dur={0.6} style={{ position: 'absolute', left: 90, top: 90 }}>
          <TriPanel w={520} h={320} P={pts} outline={1} dots={[1, 1, 1]} />
        </Appear>
        <div style={{ position: 'absolute', left: 0, top: 460, width: 700 }}>
          <Appear at={four - 0.2} dur={0.6}>
            <Box style={{ padding: '22px 28px' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center' }}>
                {[['x', C.blue, 0], ['y', C.blue, 0], ['z', C.violet, depth], ['w', C.violet, depth]].map(([n, c, at], i) => (
                  <div key={n as string} style={{ width: 148, textAlign: 'center' }}>
                    <div style={{ height: 90, width: 148, border: `3px solid ${c}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 44, color: c as string }}>
                      {i < 2 ? n : (k(zo) > 0 ? (i === 2 ? '0' : '1') : n)}
                    </div>
                    <div style={{ marginTop: 8, fontSize: 21, color: C.dim, fontWeight: 600 }}>{i < 2 ? T(i === 0 ? 'your X' : 'your Y') : i === 2 ? T('depth') : T('perspective')}</div>
                  </div>
                ))}
              </div>
            </Box>
          </Appear>
          <Appear at={col} dur={0.6} style={{ marginTop: 24, fontSize: 34, fontWeight: 600 }}>
            {T('Color:')} <span style={{ color: C.mint }}>{T('goes through unchanged')}</span>
          </Appear>
        </div>
      </Workbench>
    </SceneFrame>
  );
};

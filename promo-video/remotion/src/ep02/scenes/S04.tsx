import React from 'react';
import { Appear, C, Kicker, SceneFrame } from '../../ep01/kit';
import { cue, ramp, scene, useT, T } from '../../ep01/data';
import { Box, Mono } from '../common';
import { Workbench } from '../workbench';

const ID = 'v2-s04-carry';

export const S04: React.FC = () => {
  const t = useT();
  const s = scene(ID);
  const uv = cue(ID, 'the UV');
  const normal = cue(ID, 'the normal');
  const tangent = cue(ID, 'the tangent');
  const bones = cue(ID, 'bone indices');
  const temp = cue(ID, 'a temperature');
  const types = cue(ID, 'a float, an int');
  const v4 = cue(ID, 'a vec4, with opacity');
  const v3 = cue(ID, 'a vec3 if you do not need it');
  const posT = cue(ID, 'A position can be');
  const matrix = cue(ID, 'a matrix');
  const meaning = cue(ID, 'does not know what the data means');
  const rows = [
    { at: uv, n: 'UV', ty: 'vec2', d: 'point of a texture' },
    { at: normal, n: 'Normal', ty: 'vec3', d: 'where the surface points' },
    { at: tangent, n: 'Tangent', ty: 'vec4', d: 'direction along the surface' },
    { at: bones, n: 'Bone indices and weights', ty: 'vec4', d: 'animate a character' },
    { at: temp, n: 'Temperature', ty: 'float', d: 'your own number' },
  ];
  const A = 1 - ramp(t, types - 0.3, types + 0.3);
  return (
    <SceneFrame id={ID}>
      <Workbench
        id={ID}
        intro={{ g1: uv, g2: normal, g3: temp }}
        hl={[
          { cs: ['g1'], hl: ['g1'], color: C.violet, from: uv, to: normal },
          { cs: ['g2'], hl: ['g2'], color: C.violet, from: normal, to: tangent },
          { cs: ['g3'], hl: ['g3'], color: C.violet, from: temp, to: types },
          { cs: ['c3'], hl: ['c3'], color: C.mint, from: v4, to: v3 },
          { cs: ['c2'], hl: ['c2'], color: C.pink, from: posT, to: matrix },
        ]}
      >
        <Appear at={s.start + 0.3} dur={0.7} style={{ position: 'absolute', left: 0, top: 20 }}><Kicker>{T('You decide what a vertex carries')}</Kicker></Appear>
        <div style={{ position: 'absolute', left: 0, top: 80, width: 700, opacity: A }}>
          <Box style={{ padding: '6px 0' }}>
            {rows.map((r) => (
              <Appear key={r.n} at={r.at - 0.1} dur={0.5} rise={10}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', alignItems: 'center', padding: '16px 26px', borderTop: `1px solid ${C.line}` }}>
                  <div><div style={{ fontSize: 32, fontWeight: 600 }}>{T(r.n)}</div><div style={{ fontSize: 24, color: C.dim, fontWeight: 500 }}>{T(r.d)}</div></div>
                  <Mono size={30} color={C.violet}>{r.ty}</Mono>
                </div>
              </Appear>
            ))}
          </Box>
        </div>
        <div style={{ position: 'absolute', left: 0, top: 80, width: 700, opacity: ramp(t, types, types + 0.5) }}>
          <Kicker color={C.mint}>{T('Each piece of data')}</Kicker>
          <Box style={{ marginTop: 20, padding: '24px 28px' }}>
            {[['float', 'vec2', 'vec3', 'vec4'], ['int', 'x2', 'x3', 'x4'], ['uint', 'x2', 'x3', 'x4']].map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 1fr 1fr', padding: '12px 0', borderTop: i ? `1px solid ${C.line}` : 'none' }}>
                {row.map((c, j) => <Mono key={j} size={32} color={j === 0 ? C.ink : C.dim}>{c}</Mono>)}
              </div>
            ))}
          </Box>
          <Appear at={v4} dur={0.5} style={{ marginTop: 26, fontSize: 32, fontWeight: 600 }}>{T('color')}: <Mono size={32} color={C.mint}>vec4</Mono> {T('or')} <Mono size={32} color={C.mint} style={{ opacity: ramp(t, v3, v3 + 0.4) }}>vec3</Mono></Appear>
          <Appear at={posT} dur={0.5} style={{ marginTop: 14, fontSize: 32, fontWeight: 600 }}>{T('position')}: <Mono size={32} color={C.pink}>vec2 · vec3 · vec4</Mono></Appear>
          <Appear at={matrix} dur={0.5} style={{ marginTop: 14, fontSize: 32, fontWeight: 600 }}>{T('matrix')}: <span style={{ color: C.dim }}>{T('several slots')}</span></Appear>
        </div>
        <Appear at={meaning} dur={0.7} style={{ position: 'absolute', left: 0, top: 640, width: 700 }}>
          <Kicker color={C.amber}>{T('The GPU does not know what it means')}</Kicker>
          <div style={{ marginTop: 10, fontSize: 32, fontWeight: 600 }}><Mono size={32}>vec4</Mono> = {T('four numbers')}</div>
        </Appear>
      </Workbench>
    </SceneFrame>
  );
};

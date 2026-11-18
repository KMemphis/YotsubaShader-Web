import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Appear, C, Kicker, SceneFrame } from '../../ep01/kit';
import { cue, ramp, scene, useT, T } from '../../ep01/data';
import { Box } from '../common';
import { Workbench } from '../workbench';

const ID = 'v2-s13-blueprint';

export const S13: React.FC = () => {
  const t = useT();
  const s = scene(ID);
  const five = cue(ID, 'five things');
  const d = [
    cue(ID, 'What data each vertex carries'),
    cue(ID, 'What Vertex passes to Fragment'),
    cue(ID, 'What the Vertex function does'),
    cue(ID, 'What the Fragment function does'),
    cue(ID, 'where the color goes'),
  ];
  const game = cue(ID, 'Your game sends');
  const gpu = cue(ID, 'The GPU calls your functions');
  const notice = cue(ID, 'Notice what you');
  const k = (a: number, b = a + 0.5) => ramp(t, a, b);
  const colors = [C.blue, C.violet, C.pink, C.mint, C.green];
  const names = ['Data per vertex', 'Passed to Fragment', 'Vertex function', 'Fragment function', 'Where the color goes'];
  const code = 1 - k(game - 0.4, game + 0.2);
  const end = game + 40;
  return (
    <SceneFrame id={ID}>
      <AbsoluteFill style={{ opacity: code }}>
        <Workbench
          id={ID}
          full
          hl={[
            { cs: ['c0', 'c1', 'c2', 'c3', 'c4'], hl: ['c0', 'c1', 'c2', 'c3', 'c4'], color: colors[0], from: d[0], to: game },
            { cs: ['p0', 'p1', 'p2', 'p3', 'p4'], hl: ['p0', 'p1', 'p2', 'p3', 'p4'], color: colors[1], from: d[1], to: game },
            { cs: ['v0', 'v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7'], hl: ['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7'], color: colors[2], from: d[2], to: game },
            { cs: ['f1', 'f3', 'f4', 'f5', 'f6'], hl: ['f3', 'f4', 'f5', 'f6'], color: colors[3], from: d[3], to: game },
            { cs: ['f2'], hl: ['f3'], color: colors[4], from: d[4], to: game },
          ]}
        />
        <div style={{ position: 'absolute', left: 80, top: 832, width: 1760, display: 'flex', gap: 28 }}>
          {names.map((n, i) => (
            <Appear key={n} at={d[i] - 0.1} dur={0.4} rise={8}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 24, fontWeight: 600 }}>
                <span style={{ width: 30, height: 30, border: `2px solid ${colors[i]}`, color: colors[i], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{i + 1}</span>{T(n)}
              </div>
            </Appear>
          ))}
        </div>
      </AbsoluteFill>
      <Appear at={s.start + 0.3} dur={0.7} style={{ position: 'absolute', left: 80, top: 20, opacity: code }}><Kicker>{T('Five decisions')}</Kicker></Appear>
      <div style={{ position: 'absolute', left: 120, top: 120, width: 1680, opacity: k(game - 0.1) }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 28 }}>
          {[
            { h: 'Your game', c: C.amber, at: game, items: ['Sends the vertices'] },
            { h: 'You', c: C.pink, at: game + 1.4, items: ['Write the two functions', 'Declare the three doors'] },
            { h: 'The GPU', c: C.mint, at: gpu, items: ['Calls your functions', 'Assembles the triangles', 'Finds the pixels', 'Spreads the data'] },
          ].map((col) => (
            <Appear key={col.h} at={col.at - 0.1} dur={0.6} rise={16}>
              <Box style={{ padding: '30px 34px', borderTop: `6px solid ${col.c}`, minHeight: 360 }}>
                <div style={{ fontSize: 44, fontWeight: 700, color: col.c }}>{T(col.h)}</div>
                {col.items.map((it) => <div key={it} style={{ marginTop: 22, fontSize: 32, fontWeight: 500 }}>{T(it)}</div>)}
              </Box>
            </Appear>
          ))}
        </div>
        <Appear at={notice} dur={0.7} style={{ marginTop: 50 }}>
          <Kicker color={C.red}>{T('What you do not write')}</Kicker>
          <div style={{ marginTop: 16, fontSize: 40, fontWeight: 600, lineHeight: 1.4 }}>{T('The loop over the vertices · the loop over the pixels · the spreading')}</div>
        </Appear>
      </div>
    </SceneFrame>
  );
};

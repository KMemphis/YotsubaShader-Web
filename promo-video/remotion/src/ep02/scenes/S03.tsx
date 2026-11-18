import React from 'react';
import { Appear, C, Kicker, SceneFrame } from '../../ep01/kit';
import { cue, ramp, scene, useT, T } from '../../ep01/data';
import { Box, Mono, VC } from '../common';
import { Workbench } from '../workbench';

const ID = 'v2-s03-struct';
const ROWS = [
  { name: 'top', pos: '( 0.0,  0.8)', col: 0, cn: 'red' },
  { name: 'bottom left', pos: '(-0.8, -0.7)', col: 1, cn: 'green' },
  { name: 'bottom right', pos: '( 0.8, -0.7)', col: 2, cn: 'blue' },
];

export const S03: React.FC = () => {
  const t = useT();
  const s = scene(ID);
  const list = cue(ID, 'a list with its three vertices');
  const packet = cue(ID, 'A packet of data');
  const pos = cue(ID, 'It has a position');
  const col = cue(ID, 'and a color, with four');
  const hold = cue(ID, 'does not hold the values');
  const rowAt = [cue(ID, 'the top vertex'), cue(ID, 'The bottom left one is green'), cue(ID, 'the bottom right one is blue')];
  const k = (a: number, b = a + 0.5) => ramp(t, a, b);
  return (
    <SceneFrame id={ID}>
      <Workbench
        id={ID}
        intro={{ c0: packet, c1: packet + 0.3, c2: pos, c3: col, c4: col + 1.2 }}
        hl={[
          { cs: ['c2'], hl: ['c2'], color: C.pink, from: pos, to: col },
          { cs: ['c3'], hl: ['c3'], color: C.mint, from: col, to: hold },
        ]}
      >
        <Appear at={s.start + 0.3} dur={0.7} style={{ position: 'absolute', left: 0, top: 20 }}><Kicker>{T('The game sends a list')}</Kicker></Appear>
        <Box style={{ position: 'absolute', left: 0, top: 80, width: 700, padding: '8px 0', opacity: k(list - 0.2) }}>
          <div style={{ display: 'grid', gridTemplateColumns: '250px 230px 1fr', padding: '14px 28px', color: C.dim, fontSize: 22, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            <span>{T('vertex')}</span><span style={{ opacity: k(pos) }}>{T('position')}</span><span style={{ opacity: k(col) }}>{T('color')}</span>
          </div>
          {ROWS.map((r, i) => (
            <Appear key={r.name} at={rowAt[i] - 0.1} dur={0.5} rise={12}>
              <div style={{ display: 'grid', gridTemplateColumns: '250px 230px 1fr', alignItems: 'center', padding: '22px 28px', borderTop: `1px solid ${C.line}`, fontSize: 28, fontWeight: 600 }}>
                <span>{T(r.name)}</span>
                <Mono size={28}>{r.pos}</Mono>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}><span style={{ width: 40, height: 40, background: VC[r.col] }} /><Mono size={26} color={C.dim}>{T(r.cn)}</Mono></span>
              </div>
            </Appear>
          ))}
        </Box>
        <Appear at={hold} dur={0.7} style={{ position: 'absolute', left: 0, top: 560, width: 700, fontSize: 34, color: C.dim, fontWeight: 500, lineHeight: 1.3 }}>
          {T('The struct describes the shape of a vertex. The values come from the game.')}
        </Appear>
      </Workbench>
    </SceneFrame>
  );
};

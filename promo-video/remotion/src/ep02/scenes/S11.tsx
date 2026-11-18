import React from 'react';
import { Appear, C, Kicker, SceneFrame } from '../../ep01/kit';
import { cue, ramp, scene, useT, T } from '../../ep01/data';
import { Box, Mono } from '../common';
import { Workbench } from '../workbench';

const ID = 'v2-s11-fragment';

export const S11: React.FC = () => {
  const t = useT();
  const s = scene(ID);
  const once = cue(ID, 'once for each pixel');
  const ret = cue(ID, 'return the color of that pixel');
  const four = cue(ID, 'four numbers');
  const unit = cue(ID, 'zero to one');
  const rows = [
    { at: cue(ID, 'Red is one'), name: 'Red', v: '1, 0, 0', c: '#ff0000' },
    { at: cue(ID, 'White is one'), name: 'White', v: '1, 1, 1', c: '#ffffff' },
    { at: cue(ID, 'Black is zero'), name: 'Black', v: '0, 0, 0', c: '#000000' },
    { at: cue(ID, 'Gray is point five'), name: 'Gray', v: '0.5, 0.5, 0.5', c: '#808080' },
  ];
  const opac = cue(ID, 'the opacity');
  const recv = cue(ID, 'the color it receives');
  const dark = cue(ID, 'darken it');
  const limit = cue(ID, 'One limit');
  const k = (a: number, b = a + 0.5) => ramp(t, a, b);
  return (
    <SceneFrame id={ID}>
      <Workbench
        id={ID}
        intro={{ f0: once, f1: once, f3: once, f4: once, f6: once, f2: ret, f5: recv }}
        hl={[
          { cs: ['f1', 'f3'], hl: ['f3'], color: C.pink, from: once, to: ret },
          { cs: ['f2', 'f3'], hl: ['f3'], color: C.mint, from: ret, to: opac },
          { cs: ['f5'], hl: ['f5'], color: C.violet, from: recv, to: limit },
        ]}
      >
        <Appear at={s.start + 0.3} dur={0.7} style={{ position: 'absolute', left: 0, top: 20 }}><Kicker>{T('The Fragment function')}</Kicker></Appear>
        <div style={{ position: 'absolute', left: 0, top: 80, width: 700, opacity: 1 - k(limit - 0.2) }}>
          <Appear at={four - 0.2} dur={0.6}>
            <div style={{ display: 'flex', gap: 14 }}>
              {['R', 'G', 'B', 'A'].map((n, i) => (
                <div key={n} style={{ width: 120, height: 90, border: `3px solid ${[C.red, C.green, C.blue, C.dim][i]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 44, color: [C.red, C.green, C.blue, C.dim][i] }}>{n}</div>
              ))}
              <Mono size={30} color={C.dim} style={{ alignSelf: 'center', opacity: k(unit) }}>0 … 1</Mono>
            </div>
          </Appear>
          <Box style={{ marginTop: 24 }}>
            {rows.map((r, i) => (
              <Appear key={r.name} at={r.at - 0.1} dur={0.4} rise={8}>
                <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 260px', alignItems: 'center', padding: '14px 24px', borderTop: i ? `1px solid ${C.line}` : 'none' }}>
                  <div style={{ width: 40, height: 40, background: r.c, border: `1px solid ${C.line}` }} />
                  <span style={{ fontSize: 30, fontWeight: 600 }}>{T(r.name)}</span>
                  <Mono size={28} color={C.dim}>{r.v}</Mono>
                </div>
              </Appear>
            ))}
          </Box>
          <Appear at={opac} dur={0.6} style={{ marginTop: 24 }}>
            <div style={{ fontSize: 32, fontWeight: 600 }}>{T('Opacity')}: <Mono size={32} color={C.mint}>1</Mono> {T('solid')} · <Mono size={32} color={C.mint}>0</Mono> {T('transparent')}</div>
          </Appear>
          <Appear at={dark} dur={0.6} style={{ marginTop: 18, fontSize: 30, color: C.dim, fontWeight: 600 }}>
            {T('Darken it · ignore it · compute a new one')}
          </Appear>
        </div>
        <Appear at={limit} dur={0.7} style={{ position: 'absolute', left: 0, top: 120, width: 700 }}>
          <Kicker color={C.amber}>{T('One limit')}</Kicker>
          <div style={{ marginTop: 20, fontSize: 40, fontWeight: 700, lineHeight: 1.25 }}>{T('Each call lives alone.')}</div>
          <div style={{ marginTop: 18, fontSize: 32, color: C.dim, fontWeight: 500, lineHeight: 1.35 }}>{T('It does not see other pixels, remembers nothing, and there is no loop. The loop is the GPU.')}</div>
        </Appear>
      </Workbench>
    </SceneFrame>
  );
};

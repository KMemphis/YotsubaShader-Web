import React from 'react';
import { Appear, C, Kicker, SceneFrame } from '../../ep01/kit';
import { cue, ramp, scene, useT, T } from '../../ep01/data';
import { Box, Mono, VC } from '../common';
import { Workbench } from '../workbench';

const ID = 'v2-s07-vertex';

export const S07: React.FC = () => {
  const t = useT();
  const s = scene(ID);
  const once = cue(ID, 'once for each vertex');
  const alone = cue(ID, 'does not see the other two');
  const attr = cue(ID, 'the attribute ShaderStage Vertex');
  const first = cue(ID, 'First, say where');
  const second = cue(ID, 'Second, pass on');
  const slot = cue(ID, 'the color, and this one');
  const k = (a: number, b = a + 0.5) => ramp(t, a, b);
  const names = ['top', 'bottom left', 'bottom right'];
  return (
    <SceneFrame id={ID}>
      <Workbench
        id={ID}
        intro={{ b1: attr, k0: attr, k1: attr, v0: attr, v1: attr, v2: attr, v7: attr, p0: attr + 2.2, p1: attr + 2.2, p2: first, p3: second, p4: second + 0.6, b2: second + 0.6, k2: attr }}
        hl={[
          { cs: ['v0', 'v1'], hl: ['v1'], color: C.pink, from: attr, to: first },
          { cs: ['p2'], hl: ['p2'], color: C.blue, from: first, to: second },
          { cs: ['p3'], hl: ['p3'], color: C.mint, from: second, to: slot + 3 },
        ]}
      >
        <Appear at={s.start + 0.3} dur={0.7} style={{ position: 'absolute', left: 0, top: 20 }}><Kicker>{T('The Vertex function')}</Kicker></Appear>
        <div style={{ position: 'absolute', left: 0, top: 80, width: 700 }}>
          {names.map((n, i) => {
            const at = once + i * 0.9;
            const on = k(at, at + 0.4) * (1 - k(at + 0.8, at + 1.2) * (i < 2 ? 1 : 0));
            return (
              <Appear key={n} at={at - 0.1} dur={0.5} rise={10}>
                <Box style={{ marginBottom: 14, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 18, borderLeft: `6px solid ${VC[i]}` }}>
                  <Mono size={30}>Vertex(</Mono>
                  <span style={{ width: 28, height: 28, background: VC[i] }} />
                  <span style={{ fontSize: 28, fontWeight: 600 }}>{T(n)}</span>
                  <Mono size={30}>)</Mono>
                  <span style={{ marginLeft: 'auto', fontSize: 24, color: C.dim, fontWeight: 600 }}>{T('call')} {i + 1}</span>
                </Box>
              </Appear>
            );
          })}
          <Appear at={alone} dur={0.6} style={{ fontSize: 32, fontWeight: 600, color: C.dim, marginTop: 6 }}>{T('Each call sees only its own Corner.')}</Appear>
        </div>
        <div style={{ position: 'absolute', left: 0, top: 460, width: 700 }}>
          <Appear at={first - 0.2} dur={0.6} rise={12}>
            <Box style={{ padding: '18px 26px', borderLeft: `6px solid ${C.blue}` }}>
              <div style={{ fontSize: 24, color: C.dim, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{T('Job 1 · mandatory')}</div>
              <div style={{ fontSize: 34, fontWeight: 600, marginTop: 6 }}>{T('Where it ends up')}</div>
              <div style={{ marginTop: 8, fontSize: 28, color: C.dim }}><Mono size={28} color={C.blue}>gl_Position</Mono> · <Mono size={28} color={C.blue}>SV_Position</Mono> · {T('no slot')}</div>
            </Box>
          </Appear>
          <Appear at={second - 0.2} dur={0.6} rise={12} style={{ marginTop: 18 }}>
            <Box style={{ padding: '18px 26px', borderLeft: `6px solid ${C.mint}` }}>
              <div style={{ fontSize: 24, color: C.dim, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{T('Job 2 · optional')}</div>
              <div style={{ fontSize: 34, fontWeight: 600, marginTop: 6 }}>{T('Data for the next stage')}</div>
              <div style={{ marginTop: 8, fontSize: 28, color: C.dim, opacity: k(slot) }}>{T('Color')} · <Mono size={28} color={C.mint}>location(0)</Mono></div>
            </Box>
          </Appear>
        </div>
      </Workbench>
    </SceneFrame>
  );
};

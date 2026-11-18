import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Appear, C, Chip, Headline, Kicker, SceneFrame, mixHex } from '../../ep01/kit';
import { cue, lerp, ramp, scene, useT, T } from '../../ep01/data';
import { Mono } from '../common';

const ID = 'v2-s02-triangles';
const FILL = '#17222f';
const EDGE = '#edf8f4';

type Pt = [number, number];
const Poly: React.FC<{ pts: Pt[]; fill?: string; stroke?: string; sw?: number }> = ({ pts, fill = FILL, stroke = EDGE, sw = 3 }) => (
  <polygon points={pts.map((p) => p.join(',')).join(' ')} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
);
const Dot: React.FC<{ p: Pt; k: number; color?: string; r?: number }> = ({ p, k, color = C.pink, r = 11 }) => (k > 0 ? <circle cx={p[0]} cy={p[1]} r={r * k} fill={color} stroke={C.bg} strokeWidth={3} /> : null);

export const S02: React.FC = () => {
  const t = useT();
  const s = scene(ID);
  const all = cue(ID, 'Everything on screen');
  const rect = cue(ID, 'A rectangle is two triangles');
  const round = cue(ID, 'A round shape');
  const char = cue(ID, 'A character in a 3D game');
  const corner = cue(ID, 'Each corner');
  const vertexWord = cue(ID, 'a vertex');
  const four = cue(ID, 'four vertices');
  const share = cue(ID, 'share two corners');
  const why = cue(ID, 'Why triangles');
  const flat = cue(ID, 'make a flat surface');
  const fast = cue(ID, 'fill it fast');
  const k = (a: number, b = a + 0.5) => ramp(t, a, b);

  // three shapes drawn in boxes 480 wide
  const tri: Pt[] = [[240, 60], [60, 330], [420, 330]];
  const rc: Pt[] = [[60, 60], [420, 60], [420, 330], [60, 330]]; // 0 TL, 1 TR, 2 BR, 3 BL
  const fan: Pt[] = Array.from({ length: 8 }, (_, i) => [240 + 175 * Math.cos((i / 8) * Math.PI * 2 - Math.PI / 2), 195 + 150 * Math.sin((i / 8) * Math.PI * 2 - Math.PI / 2)] as Pt);
  const ctr: Pt = [240, 195];
  const sharedOn = k(share - 1.2, share - 0.6) * (1 - k(why - 0.3));

  return (
    <SceneFrame id={ID}>
      <AbsoluteFill style={{ paddingBottom: 200 }}>
        <Appear at={s.start} dur={0.7} style={{ position: 'absolute', left: 120, top: 80, opacity: 1 - k(why - 0.3) }}><Kicker>{T('The only shape the GPU draws')}</Kicker></Appear>

        <div style={{ position: 'absolute', left: 120, top: 150, display: 'flex', gap: 40 }}>
          <Appear at={all} dur={0.7}>
            <svg width={480} height={390}>
              <Poly pts={tri} />
              {tri.map((p, i) => <Dot key={i} p={p} k={k(vertexWord + i * 0.25, vertexWord + i * 0.25 + 0.3) * (1 - 0 * i)} />)}
            </svg>
            <div style={{ fontSize: 32, fontWeight: 600, textAlign: 'center' }}>{T('triangle · 3 vertices')}</div>
          </Appear>
          <Appear at={rect} dur={0.7}>
            <svg width={480} height={390}>
              <Poly pts={rc} />
              <line x1={rc[1][0]} y1={rc[1][1]} x2={rc[3][0]} y2={rc[3][1]} stroke={EDGE} strokeWidth={3} />
              {rc.map((p, i) => <Dot key={i} p={p} k={k(four + i * 0.3, four + i * 0.3 + 0.3)} color={i === 1 || i === 3 ? C.amber : C.pink} />)}
              {sharedOn > 0 ? <line x1={rc[1][0]} y1={rc[1][1]} x2={rc[3][0]} y2={rc[3][1]} stroke={C.amber} strokeWidth={6} opacity={sharedOn} /> : null}
            </svg>
            <div style={{ fontSize: 32, fontWeight: 600, textAlign: 'center' }}>{T('rectangle · 2 triangles, 4 vertices')}</div>
          </Appear>
          <Appear at={round} dur={0.7}>
            <svg width={480} height={390}>
              {fan.map((p, i) => <Poly key={i} pts={[ctr, p, fan[(i + 1) % 8]]} fill={mixHex(FILL, C.violet, 0.06 + 0.04 * (i % 2))} stroke="#4b5b6b" sw={2} />)}
              <Poly pts={fan} fill="none" />
              {k(char - 0.2) > 0 ? fan.map((p, i) => <Dot key={i} p={p} k={0.55} color={C.violet} r={9} />) : null}
            </svg>
            <div style={{ fontSize: 32, fontWeight: 600, textAlign: 'center' }}>{T('round shape · many triangles')}</div>
          </Appear>
        </div>

        <Appear at={char} dur={0.7} style={{ position: 'absolute', left: 120, top: 600 }}>
          <Chip color={C.violet} size={36}>{T('a 3D character: thousands of triangles')}</Chip>
        </Appear>
        <Appear at={corner} dur={0.7} style={{ position: 'absolute', left: 1020, top: 590, width: 780 }}>
          <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-0.02em' }}>
            <span style={{ color: C.pink }}>{T('vertex')}</span> = {T('a point, a corner')}
          </div>
        </Appear>

        <Appear at={why} dur={0.8} style={{ position: 'absolute', left: 0, right: 0, top: 80, textAlign: 'center', background: C.bg, paddingBottom: 14 }}>
          <Headline size={68}>{T('Why triangles?')}</Headline>
        </Appear>
        <Appear at={flat} dur={0.7} style={{ position: 'absolute', left: 120, top: 690 }}>
          <div style={{ fontSize: 40, fontWeight: 600 }}>{T('Three points make a flat surface.')}</div>
        </Appear>
        <Appear at={fast} dur={0.7} style={{ position: 'absolute', left: 120, top: 760 }}>
          <div style={{ fontSize: 40, fontWeight: 600, color: C.mint }}>{T('Easy to fill, so the GPU fills it fast.')}</div>
        </Appear>
      </AbsoluteFill>
    </SceneFrame>
  );
};

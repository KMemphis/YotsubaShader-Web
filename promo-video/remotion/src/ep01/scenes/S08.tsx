import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Appear, C, Chip, Headline, Kicker, MONO, SceneFrame, mixHex } from '../kit';
import { clamp01, cue, lerp, ramp, scene, useT, T } from '../data';

const ID = 's08-stages';

const Row: React.FC<{ at: number; name: string; color: string; each: string; decides: string; tag?: { at: number; text: string } }> = ({ at, name, color, each, decides, tag }) => (
  <Appear at={at} dur={0.7} rise={24}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 36, padding: '30px 40px', borderRadius: 6, background: C.panel, border: `1px solid ${C.line}`, width: 1620 }}>
      <div style={{ width: 250, fontSize: 56, fontWeight: 700, letterSpacing: '-0.03em', color }}>{name}</div>
      <div style={{ width: 560 }}>
        <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '0.14em', color: C.dim, textTransform: 'uppercase' }}>{T('runs once for each')}</div>
        <div style={{ marginTop: 6, fontSize: 38, fontWeight: 600 }}>{T(each)}</div>
      </div>
      <div style={{ width: 430 }}>
        <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '0.14em', color: C.dim, textTransform: 'uppercase' }}>{T('decides')}</div>
        <div style={{ marginTop: 6, fontSize: 38, fontWeight: 600 }}>{T(decides)}</div>
      </div>
      {tag ? <Appear at={tag.at} dur={0.5} rise={10} style={{ marginLeft: 'auto' }}><Chip size={28} color={color}>{T(tag.text)}</Chip></Appear> : null}
    </div>
  </Appear>
);

// triangle on a 24 x 14 grid of 44 px cells
const CW = 44, COLS = 24, ROWS = 14;
const P = [{ x: 150, y: 520 }, { x: 560, y: 70 }, { x: 930, y: 440 }];
const COL = [C.pink, C.violet, C.mint];
const bary = (px: number, py: number) => {
  const [a, b, c] = P;
  const d = (b.y - c.y) * (a.x - c.x) + (c.x - b.x) * (a.y - c.y);
  const l1 = ((b.y - c.y) * (px - c.x) + (c.x - b.x) * (py - c.y)) / d;
  const l2 = ((c.y - a.y) * (px - c.x) + (a.x - c.x) * (py - c.y)) / d;
  return [l1, l2, 1 - l1 - l2];
};

export const S08: React.FC = () => {
  const t = useT();
  const s = scene(ID);
  const vert = cue(ID, 'The Vertex stage');
  const frag = cue(ID, 'The Fragment stage');
  const comp = cue(ID, 'And Compute');
  const three = cue(ID, 'three calls');
  const hundred = cue(ID, 'a hundred thousand calls');
  const draw = cue(ID, 'To draw something');
  const send = cue(ID, 'You send three points');
  const place = cue(ID, 'Vertex places each one');
  const work = cue(ID, 'works out which pixels');
  const color = cue(ID, 'Fragment gives each one');
  const next = cue(ID, 'The next video');
  const stageB = draw - 0.5;

  const cells: { x: number; y: number; l: number[] }[] = [];
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
    const l = bary(x * CW + CW / 2, y * CW + CW / 2);
    if (l.every((v) => v >= 0)) cells.push({ x, y, l });
  }

  const steps = [
    { at: send, label: T('Three points'), color: C.ink },
    { at: place, label: T('Vertex places each one'), color: C.pink },
    { at: work, label: T('The GPU finds the pixels'), color: C.violet },
    { at: color, label: T('Fragment colors each one'), color: C.mint },
  ];
  const activeStep = steps.reduce((n, st, i) => (t >= st.at - 0.1 ? i : n), -1);

  return (
    <SceneFrame id={ID}>
      <AbsoluteFill style={{ paddingBottom: 200 }}>
        <Appear at={s.start} dur={0.7} out={stageB} style={{ position: 'absolute', left: 150, top: 70 }}><Kicker>{T('The stages of a shader')}</Kicker></Appear>
        <div style={{ position: 'absolute', left: 150, top: 130, display: 'flex', flexDirection: 'column', gap: 24, opacity: 1 - ramp(t, stageB, stageB + 0.6) }}>
          <Row at={vert - 0.2} name="Vertex" color={C.pink} each="point of the shape" decides="where it lands on screen" tag={{ at: three - 0.2, text: 'triangle: 3 calls' }} />
          <Row at={frag - 0.2} name="Fragment" color={C.mint} each="pixel the shape covers" decides="its color" tag={{ at: hundred - 0.2, text: '100,000 pixels: 100,000 calls' }} />
          <Row at={comp - 0.2} name="Compute" color={C.blue} each="index you ask for" decides="anything · draws nothing" />
        </div>

        {/* B: drawing a triangle */}
        <div style={{ position: 'absolute', inset: 0, opacity: ramp(t, stageB + 0.2, stageB + 0.9) }}>
          <svg width={COLS * CW} height={ROWS * CW} style={{ position: 'absolute', left: 100, top: 90, background: '#05080c', borderRadius: 6, border: `1px solid ${C.line}` }}>
            {Array.from({ length: COLS * ROWS }, (_, n) => {
              const x = n % COLS, y = Math.floor(n / COLS);
              return <rect key={n} x={x * CW + 2} y={y * CW + 2} width={CW - 4} height={CW - 4} rx={4} fill="#0f1822" />;
            })}
            {cells.map((c, i) => {
              const sweep = (c.x / COLS) * 0.9 + (c.y / ROWS) * 0.1;
              const found = ramp(t, work + sweep * 1.1, work + sweep * 1.1 + 0.3);
              const painted = ramp(t, color + sweep * 1.1, color + sweep * 1.1 + 0.35);
              const rgb = [0, 1, 2].reduce((acc, k) => acc.map((v, j) => v + c.l[k] * parseInt(COL[k].slice(1 + j * 2, 3 + j * 2), 16)), [0, 0, 0]);
              const fill = mixHex('#8fa3ad', `#${rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`, painted);
              return <rect key={i} x={c.x * CW + 2} y={c.y * CW + 2} width={CW - 4} height={CW - 4} rx={4} fill={fill} opacity={found * lerp(0.45, 1, painted)} />;
            })}
            {P.map((p, i) => {
              const k = ramp(t, send + i * 0.45, send + i * 0.45 + 0.35);
              const ring = ramp(t, place + i * 0.3, place + i * 0.3 + 0.4) * (1 - ramp(t, place + i * 0.3 + 0.5, place + i * 0.3 + 1.0));
              return (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r={lerp(0, 14, k)} fill={COL[i]} stroke="#fff" strokeWidth={3} />
                  <circle cx={p.x} cy={p.y} r={14 + ring * 38} fill="none" stroke={COL[i]} strokeWidth={4} opacity={ring} />
                </g>
              );
            })}
            {[[0, 1], [1, 2], [2, 0]].map(([a, b], i) => {
              const k = ramp(t, work - 0.9 + i * 0.25, work - 0.3 + i * 0.25);
              return <line key={i} x1={P[a].x} y1={P[a].y} x2={lerp(P[a].x, P[b].x, k)} y2={lerp(P[a].y, P[b].y, k)} stroke="#fff" strokeWidth={3} strokeLinecap="round" opacity={0.85} />;
            })}
          </svg>
          <div style={{ position: 'absolute', left: 1250, top: 110, display: 'flex', flexDirection: 'column', gap: 20, width: 560 }}>
            {steps.map((st, i) => (
              <Appear key={i} at={st.at - 0.1} dur={0.5} rise={14}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 38, fontWeight: 600, color: i === activeStep ? st.color : C.dim, opacity: i === activeStep ? 1 : 0.7 }}>
                  <span style={{ width: 46, height: 46, borderRadius: 4, border: `2px solid ${i === activeStep ? st.color : C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontSize: 26 }}>{i + 1}</span>
                  {st.label}
                </div>
              </Appear>
            ))}
          </div>
          <Appear at={next - 0.1} dur={0.7} style={{ position: 'absolute', left: 1250, top: 520 }}>
            <Chip color={C.violet} size={32}>{T('Next video: step by step')}</Chip>
          </Appear>
        </div>
      </AbsoluteFill>
    </SceneFrame>
  );
};

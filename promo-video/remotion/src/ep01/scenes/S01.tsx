import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Appear, C, Chip, Gradient, Headline, Kicker, Logo, MONO, SceneFrame, ramp3, mixHex } from '../kit';
import { H, W, clamp01, cue, fmt, lerp, pulse, ramp, rnd, scene, useT, T } from '../data';

const ID = 's01-hook';
const COLS = 48;
const ROWS = 27;
const CELL = 40;

const smooth = (a: number, b: number, x: number) => { const k = clamp01((x - a) / (b - a)); return k * k * (3 - 2 * k); };

/** The pixel grid: the same colour function is evaluated in every cell, a diagonal wave switches them on. */
const Grid: React.FC<{ dim: number }> = ({ dim }) => {
  const t = useT();
  const s = scene(ID);
  const end = cue(ID, 'That function is called a shader');
  const k = clamp01((t - (s.start - 0.1)) / (end - s.start + 0.2));
  const probe = Math.floor(t * 9);
  const px = Math.floor(rnd(probe) * COLS), py = Math.floor(rnd(probe + 99) * ROWS);
  const cells: React.ReactNode[] = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const d = (x / COLS) * 0.72 + (y / ROWS) * 0.28;
      const lit = smooth(d - 0.08, d + 0.08, k * 1.16 - 0.04);
      const shimmer = 0.86 + 0.14 * Math.sin(t * 2.2 + x * 0.35 + y * 0.5);
      const col = ramp3(clamp01((x / COLS) * 0.85 + (y / ROWS) * 0.15));
      cells.push(
        <rect key={y * COLS + x} x={x * CELL + 2} y={y * CELL + 2} width={CELL - 4} height={CELL - 4} rx={6}
          fill={mixHex('#0f1822', col, lerp(0.07, 0.95 * shimmer, lit))} />,
      );
    }
  }
  const probeOn = ramp(t, cue(ID, 'a tiny function') - 0.2, cue(ID, 'a tiny function') + 0.3) * (1 - ramp(t, end + 0.6, end + 1));
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity: dim }}>
      {cells}
      <rect x={px * CELL - 1} y={py * CELL - 1} width={CELL + 2} height={CELL + 2} rx={8} fill="none" stroke="#fff" strokeWidth={3.5} opacity={probeOn} />
    </svg>
  );
};

const Panel: React.FC<{ children: React.ReactNode; w?: number }> = ({ children, w = 1180 }) => (
  <div style={{ width: w, padding: '54px 70px', borderRadius: 6, background: C.panel, border: `1px solid ${C.line}`, textAlign: 'center' }}>{children}</div>
);

export const S01: React.FC = () => {
  const t = useT();
  const fn = cue(ID, 'a tiny function');
  const two = cue(ID, 'over two million times');
  const sixty = cue(ID, 'sixty times every second');
  const name = cue(ID, 'That function is called a shader');
  const series = cue(ID, "And in this series");
  const count = Math.round(2073600 * ramp(t, two - 0.1, two + 2.1));
  const dim = 1 - 0.78 * ramp(t, series - 0.2, series + 0.9);

  return (
    <SceneFrame id={ID} lead={0.6}>
      <Grid dim={dim} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 150 }}>
        {/* a tiny function */}
        <Appear at={fn} dur={0.6} out={two - 0.1} style={{ position: 'absolute' }}>
          <Panel w={1020}>
            <Kicker>{T('every pixel, the same function')}</Kicker>
            <div style={{ marginTop: 26, fontFamily: MONO, fontSize: 92, fontWeight: 500, letterSpacing: '-0.02em' }}>
              <span style={{ color: C.pink }}>color</span> <span style={{ color: C.dim }}>=</span> <span style={{ color: C.green }}>f</span><span style={{ color: C.dim }}>(</span><span style={{ color: C.blue }}>x</span><span style={{ color: C.dim }}>, </span><span style={{ color: C.blue }}>y</span><span style={{ color: C.dim }}>)</span>
            </div>
          </Panel>
        </Appear>
        {/* two million, sixty times a second */}
        <Appear at={two - 0.05} dur={0.6} out={name - 0.1} style={{ position: 'absolute' }}>
          <Panel w={1080}>
            <Kicker>{T('pixels on a Full HD screen')}</Kicker>
            <div style={{ marginTop: 18, fontSize: 150, fontWeight: 700, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums' }}>{fmt(count)}</div>
            <div style={{ marginTop: 6, height: 76 }}>
              <Appear at={sixty} dur={0.5} rise={14}>
                <Chip color={C.mint} size={44}>{T('× 60 every second')}</Chip>
              </Appear>
            </div>
          </Panel>
        </Appear>
        {/* shader */}
        <Appear at={name} dur={0.7} out={series - 0.15} style={{ position: 'absolute' }}>
          <Panel w={1020}>
            <Kicker>{T('that function is called a')}</Kicker>
            <Headline size={190} style={{ marginTop: 6 }}><Gradient>shader</Gradient></Headline>
          </Panel>
        </Appear>
        {/* title card */}
        <Appear at={series + 0.1} dur={0.9} style={{ position: 'absolute', textAlign: 'center' }}>
          <Logo size={62} />
          <div style={{ height: 42 }} />
          <Kicker color={C.pink}>{T('Get Started · 1')}</Kicker>
          <Headline size={118} style={{ marginTop: 14 }}>{T('What is a shader?')}</Headline>
        </Appear>
      </AbsoluteFill>
    </SceneFrame>
  );
};

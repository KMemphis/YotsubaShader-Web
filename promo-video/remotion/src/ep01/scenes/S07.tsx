import React from 'react';
import { AbsoluteFill, staticFile } from 'remotion';
import { Appear, C, Chip, CodeWin, Gradient, Headline, Kicker, MONO, SceneFrame, mixHex, ramp3, typed, tint } from '../kit';
import { clamp01, cue, fmt, lerp, ramp, scene, useT, T } from '../data';

const ID = 's07-pixels';
const FRAG = `public vec4 Fragment(Pixel pixel)
{
    return Make.Vec4(1f, 0f, 0f, 1f);
}`;

const Stat: React.FC<{ at: number; big: string; small: string; color?: string; out: number }> = ({ at, big, small, color = C.ink, out }) => (
  <Appear at={at} dur={0.6} rise={18} out={out}>
    <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: '-0.035em', color, fontVariantNumeric: 'tabular-nums' }}>{big}</div>
    <div style={{ fontSize: 30, fontWeight: 500, color: C.dim, marginTop: 2 }}>{small}</div>
  </Appear>
);

/** A screen drawn as a grid of pixels. `fn` gives the colour of each cell. */
const Screen: React.FC<{ w: number; h: number; cols: number; rows: number; fn: (x: number, y: number) => string; mark?: [number, number] | null; markOpacity?: number }> = ({ w, h, cols, rows, fn, mark, markOpacity = 1 }) => {
  const cw = w / cols, ch = h / rows;
  return (
    <svg width={w} height={h} style={{ borderRadius: 6, background: '#05080c', border: `1px solid ${C.line}`, }}>
      {Array.from({ length: cols * rows }, (_, n) => {
        const x = n % cols, y = Math.floor(n / cols);
        return <rect key={n} x={x * cw + 1} y={y * ch + 1} width={cw - 2} height={ch - 2} rx={2} fill={fn(x, y)} />;
      })}
      {mark ? <rect x={mark[0] * cw - 2} y={mark[1] * ch - 2} width={cw + 4} height={ch + 4} rx={4} fill="none" stroke="#fff" strokeWidth={4} opacity={markOpacity} /> : null}
    </svg>
  );
};

/** Slices of the photo pushed sideways by a wave: the "underwater" effect from the tutorial. */
const Underwater: React.FC<{ w: number; h: number; t: number }> = ({ w, h, t }) => {
  const n = 46, sh = h / n;
  return (
    <div style={{ width: w, height: h, borderRadius: 6, overflow: 'hidden', border: `1px solid ${C.line}`, position: 'relative', background: '#06202a' }}>
      {Array.from({ length: n }, (_, i) => {
        const off = Math.sin(t * 2.4 + i * 0.38) * 9 + Math.sin(t * 1.3 + i * 0.15) * 5;
        return <div key={i} style={{ position: 'absolute', left: 0, top: i * sh, width: w, height: sh + 1, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: off - 14, top: -i * sh, width: w + 28, height: h, backgroundImage: `url(${staticFile('ep01/img/agua-1.png')})`, backgroundSize: '100% 100%' }} />
        </div>;
      })}
    </div>
  );
};

export const S07: React.FC = () => {
  const t = useT();
  const s = scene(ID);
  const dots = cue(ID, 'each dot is a pixel');
  const res = cue(ID, '1920');
  const two = cue(ID, 'two million pixels');
  const sixty = cue(ID, 'sixty times every second');
  const mil = cue(ID, '120 million');
  const micro = cue(ID, 'one microsecond');
  const loop = cue(ID, 'A loop on the CPU');
  const same = cue(ID, 'same problem as the array');
  const recv = cue(ID, 'receives a pixel');
  const red = cue(ID, 'Always return red');
  const pos = cue(ID, 'depend on the position');
  const img = cue(ID, 'depend on an image');
  const wat = cue(ID, 'Water, fire, shadows');
  const statsOut = same - 0.3;
  const stageC = same - 0.2;
  const stageD = pos - 0.5;
  const counter = Math.round(2073600 * ramp(t, two - 0.1, two + 1.2));
  const big = Math.round(124416000 * ramp(t, mil - 0.1, mil + 1.4));

  // the evaluated pixel hops around in stage C
  const hop = Math.floor(t * 3);
  const mark: [number, number] = [(hop * 7 + 3) % 32, (hop * 5 + 2) % 18];
  const gridFn = (x: number, y: number) => ramp3(clamp01(x / 32 * 0.85 + y / 18 * 0.15));

  return (
    <SceneFrame id={ID}>
      <AbsoluteFill style={{ paddingBottom: 200 }}>
        {/* A + B + C: the screen on the left */}
        <div style={{ position: 'absolute', left: 120, top: 120, opacity: 1 - ramp(t, stageD, stageD + 0.5) }}>
          <Appear at={s.start} dur={0.8}>
            <Screen w={900} h={506} cols={32} rows={18} fn={gridFn} mark={t > stageC ? mark : null} markOpacity={ramp(t, stageC, stageC + 0.4)} />
          </Appear>
          <Appear at={res - 0.2} dur={0.6} out={statsOut} style={{ position: 'absolute', left: 0, right: 0, top: -58, textAlign: 'center', fontFamily: MONO, fontSize: 34, color: C.dim }}>1920 px</Appear>
          <Appear at={res - 0.2} dur={0.6} out={statsOut} style={{ position: 'absolute', left: -118, top: 236, width: 160, textAlign: 'center', fontFamily: MONO, fontSize: 34, color: C.dim, transform: 'rotate(-90deg)' }}>1080 px</Appear>
        </div>

        <div style={{ position: 'absolute', left: 1130, top: 110, width: 700, display: 'flex', flexDirection: 'column', gap: 26 }}>
          <Stat at={res} out={statsOut} big="1920 × 1080" small={T('a Full HD screen')} />
          <Stat at={two} out={statsOut} big={fmt(counter)} small={T('pixels')} color={C.blue} />
          <Stat at={sixty} out={statsOut} big={big > 0 ? fmt(big) : '× 60'} small={big > 0 ? T('colors, every second') : T('times per second')} color={C.pink} />
          <Appear at={micro - 0.2} dur={0.6} out={statsOut} rise={14}>
            <div style={{ fontFamily: MONO, fontSize: 32, color: C.amber, padding: '16px 22px', borderRadius: 6, border: `2px solid ${C.amber}`, background: tint(C.amber, 0.1) }}>{T('1 µs × 2,073,600 = 2.07 s per frame')}</div>
          </Appear>
        </div>

        {/* C: one pixel in, one colour out */}
        <Appear at={stageC + 0.3} dur={0.8} out={stageD - 0.1} style={{ position: 'absolute', left: 1130, top: 120, width: 700 }}>
          <Kicker>{T('It is the same problem')}</Kicker>
          <Headline size={60} style={{ marginTop: 12 }}>{T('The array is now the ')}<Gradient>{T('pixels')}</Gradient></Headline>
          <div style={{ marginTop: 36 }}>
            <CodeWin title="Fragment.cs" code={FRAG} width={700} size={26} chars={typed(t, recv - 0.1, FRAG.length, 38)} />
          </div>
          <Appear at={red} dur={0.5} rise={10} style={{ marginTop: 22 }}>
            <Chip color={C.red} size={32}>{T('pixel in → color out')}</Chip>
          </Appear>
        </Appear>

        {/* D: three results */}
        {t > stageD ? (
          <div style={{ position: 'absolute', left: 90, top: 190, width: 1740, display: 'flex', gap: 42, justifyContent: 'center', opacity: ramp(t, stageD, stageD + 0.6) }}>
            {[
              { at: red, label: T('always red'), node: <div style={{ width: 540, height: 304, borderRadius: 6, background: '#ff2d2d', border: `1px solid ${C.line}`, }} /> },
              { at: pos, label: T('depends on the position'), node: <div style={{ width: 540, height: 304, borderRadius: 6, background: 'linear-gradient(to bottom, #ff6a9a, #ffc13b)', border: `1px solid ${C.line}`, }} /> },
              { at: img, label: T('depends on an image and on time'), node: <Underwater w={540} h={304} t={t} /> },
            ].map((c, i) => (
              <Appear key={i} at={Math.max(c.at - 0.2, stageD + 0.1)} dur={0.7} rise={30}>
                {c.node}
                <div style={{ marginTop: 20, fontSize: 34, fontWeight: 600, textAlign: 'center', color: C.ink }}>{c.label}</div>
              </Appear>
            ))}
          </div>
        ) : null}
        <Appear at={wat} dur={0.8} style={{ position: 'absolute', left: 0, right: 0, top: 650, textAlign: 'center' }}>
          <Headline size={70}>{T('Water, fire, shadows, lights: ')}<Gradient>{T('a color per pixel')}</Gradient></Headline>
        </Appear>
      </AbsoluteFill>
    </SceneFrame>
  );
};

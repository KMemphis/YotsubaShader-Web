import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Appear, C, Chip, CodeWin, Gradient, Headline, Kicker, MONO, SceneFrame, typed, tint } from '../kit';
import { clamp01, cue, lerp, pulse, ramp, rnd, scene, useT, T } from '../data';

const ID = 's06-for';

const CODE1 = `int[] entities = [1, 2, 3, 4, 5];

for (int index = 0; index < entities.Length; index++)
{
    entities[index] = entities[index] * 2;
}`;

const CODE2 = `int[] entities = [1, 2, 3, 4, 5];

Parallel.For(0, entities.Length, index =>
{
    RandomOperation(index);
});

void RandomOperation(int index)
{
    entities[index] = entities[index] * 2;
}`;

const CORE = [C.amber, C.blue, C.green, C.violet];

export const S06: React.FC = () => {
  const t = useT();
  const s = scene(ID);
  const arr = cue(ID, 'array with five numbers');
  const seq = cue(ID, 'one index after another');
  const cpuWins = cue(ID, 'the CPU would win');
  const par = cue(ID, 'Parallel.For');
  const noLoop = cue(ID, 'We no longer write the loop');
  const oneIdx = cue(ID, 'works on one index');
  const gpu = cue(ID, 'The GPU does exactly the same');
  const single = cue(ID, 'works on a single index');
  const shader = cue(ID, 'what we call a shader');
  const remember = cue(ID, 'Remember this idea');
  const mode = t < par ? 1 : t < gpu ? 2 : 3;

  // sequential walk of the for loop
  const step = 0.6;
  const walk = Math.floor((t - seq - 0.1) / step);
  const done = mode === 1 ? Math.min(walk, 4) : 4;
  const values = [1, 2, 3, 4, 5];

  const code = mode === 1 ? CODE1 : CODE2;
  const chars = mode === 1 ? typed(t, arr + 0.5, CODE1.length, 34) : typed(t, par + 0.15, CODE2.length, 62);
  const hl: { from: number; to: number; color?: string; opacity?: number }[] = [];
  if (mode === 1 && walk >= 0 && walk <= 4) hl.push({ from: 2, to: 5, color: C.amber, opacity: ramp(t, seq, seq + 0.4) });
  if (mode >= 2) hl.push({ from: 2, to: 5, color: C.blue, opacity: pulse(t, par + 0.6, par + 1.1, noLoop + 1.5, noLoop + 2.2) });
  if (mode >= 2) hl.push({ from: 7, to: 10, color: C.pink, opacity: ramp(t, oneIdx, oneIdx + 0.5) });

  const modeLabel = mode === 1 ? T('for loop · one index at a time') : mode === 2 ? T('Parallel.For · all cores at once') : T('GPU · one thread per index');
  const modeColor = mode === 1 ? C.amber : mode === 2 ? C.blue : C.pink;

  return (
    <SceneFrame id={ID}>
      <AbsoluteFill style={{ paddingBottom: 200 }}>
        <Appear at={arr - 0.1} dur={0.7} style={{ position: 'absolute', left: 100, top: 70 }}>
          <CodeWin title="Program.cs" code={code} width={960} height={640} size={30} chars={chars} hl={hl} />
        </Appear>

        <Appear at={arr + 0.3} dur={0.7} style={{ position: 'absolute', left: 1130, top: 90, width: 700 }}>
          <Kicker color={modeColor}>{modeLabel}</Kicker>
          <div style={{ marginTop: 30, display: 'flex', gap: 18 }}>
            {values.map((v, i) => {
              const finished = mode === 1 ? i <= done && walk >= i : true;
              const active = mode === 1 ? walk === i : mode === 2 ? true : true;
              const colour = mode === 1 ? C.amber : mode === 2 ? CORE[i % 4] : C.pink;
              const beat = mode === 1 ? (active ? 1 : 0.25) : 0.55 + 0.45 * Math.sin(t * 7 + i * 0.4);
              const shown = mode === 1 ? (finished ? v * 2 : v) : (t > (mode === 2 ? par + 1.4 : gpu + 0.4) ? v * 2 : v);
              return (
                <div key={i} style={{ width: 120 }}>
                  <div style={{ height: 120, borderRadius: 6, border: `3px solid ${colour}`, background: tint(colour, mode === 1 ? (active ? 0.3 : 0.1) : 0.22), display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontSize: 52, fontWeight: 500, opacity: mode === 1 ? 1 : 0.6 + 0.4 * beat, transform: `scale(${mode === 1 && active ? 1.06 : 1})` }}>{shown}</div>
                  <div style={{ marginTop: 10, textAlign: 'center', fontFamily: MONO, fontSize: 26, color: C.dim }}>[{i}]</div>
                </div>
              );
            })}
          </div>
          {mode === 2 ? (
            <div style={{ marginTop: 26, display: 'flex', gap: 14 }}>
              {CORE.map((c, i) => <Chip key={i} size={26} color={c}>{T('core')} {i + 1}</Chip>)}
            </div>
          ) : null}
          {mode === 3 ? (
            <Appear at={gpu + 0.2} dur={0.6} style={{ marginTop: 26 }}>
              <svg width={700} height={92}>
                {Array.from({ length: 12 * 2 }, (_, n) => (
                  <rect key={n} x={(n % 12) * 58} y={Math.floor(n / 12) * 46} width={48} height={36} rx={8} fill={C.pink} opacity={0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 6 + rnd(n) * 9))} />
                ))}
              </svg>
              <div style={{ marginTop: 8, fontSize: 30, color: C.dim, fontWeight: 500 }}>{T('Thousands of threads, each takes an index.')}</div>
            </Appear>
          ) : null}
        </Appear>

        {/* the shader tag */}
        <Appear at={single} dur={0.6} style={{ position: 'absolute', left: 1130, top: 520 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <span style={{ fontSize: 56, color: C.pink }}>←</span>
            <Headline size={78} style={{ opacity: lerp(0.65, 1, ramp(t, shader, shader + 0.4)) }}>{ramp(t, shader, shader + 0.4) > 0.5 ? <Gradient>{T('a shader')}</Gradient> : T('one index')}</Headline>
          </div>
        </Appear>
        <Appear at={remember} dur={0.7} style={{ position: 'absolute', left: 1130, top: 680, width: 660 }}>
          <Chip color={C.mint} size={34}>{T('Everything else builds on this idea')}</Chip>
        </Appear>
      </AbsoluteFill>
    </SceneFrame>
  );
};

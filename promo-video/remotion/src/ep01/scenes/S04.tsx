import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Appear, C, Chip, CodeWin, Headline, Kicker, MONO, SceneFrame, typed, tint } from '../kit';
import { cue, cueEnd, lerp, ramp, scene, useT, T } from '../data';

const ID = 's04-no-os';
const CODE = `File.WriteAllText("file.txt", "hello");`;

/** One layer of a software stack. */
const Layer: React.FC<{ label: string; at: number; color: string; dashed?: boolean; w?: number; ghost?: boolean }> = ({ label, at, color, dashed, w = 560, ghost }) => (
  <Appear at={at} dur={0.6} rise={18}>
    <div style={{ width: w, height: 92, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, fontWeight: 600,
      border: `2px ${dashed ? 'dashed' : 'solid'} ${color}`, background: ghost ? C.bg : tint(color, 0.16), color: ghost ? color : C.ink }}>{T(label)}</div>
  </Appear>
);

export const S04: React.FC = () => {
  const t = useT();
  const s = scene(ID);
  const node = cue(ID, 'Think about Node');
  const os = cue(ID, 'operating system itself');
  const gpuSame = cue(ID, 'The GPU is the same');
  const fs = cue(ID, 'reach the file system');
  const strings = cue(ID, 'no strings');
  const lists = cue(ID, 'No lists');
  const inh = cue(ID, 'No inheritance');
  const exc = cue(ID, 'No exceptions');
  const math = cue(ID, 'is, above all, math');
  const fast = cue(ID, "it's also why the GPU is so fast");
  const stageB = fs - 0.5;

  const cross = (at: number) => ramp(t, at, at + 0.35);
  const items: { label: string; at: number }[] = [
    { label: 'string', at: strings },
    { label: 'List<T>', at: lists },
    { label: 'class B : A', at: inh },
    { label: 'try / catch', at: exc },
  ];
  const mathK = ramp(t, math - 0.1, math + 0.6);

  return (
    <SceneFrame id={ID}>
      <AbsoluteFill style={{ paddingBottom: 200 }}>
        {/* A: stacks */}
        <div style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 200, opacity: 1 - ramp(t, stageB, stageB + 0.6) }}>
          <Appear at={s.start + 0.3} dur={0.7} style={{ position: 'absolute', left: 170, top: 120 }}><Kicker>{T('A program on a computer')}</Kicker></Appear>
          <div style={{ position: 'absolute', left: 170, top: 190, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Layer label="Your JavaScript" at={node} color={C.amber} />
            <Layer label="Node" at={node + 0.5} color={C.green} />
            <Layer label="Operating system" at={os - 0.2} color={C.blue} />
            <Layer label="Hardware" at={os + 0.4} color={C.dim} />
          </div>
          <Appear at={os + 1.2} dur={0.6} style={{ position: 'absolute', left: 170, top: 700 }}>
            <div style={{ fontSize: 34, color: C.dim, fontWeight: 500, width: 560 }}>{T('Node needs the OS underneath.')}</div>
          </Appear>

          <Appear at={gpuSame - 0.1} dur={0.7} style={{ position: 'absolute', left: 1190, top: 120 }}><Kicker color={C.pink}>{T('A program on the GPU')}</Kicker></Appear>
          <div style={{ position: 'absolute', left: 1190, top: 190, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Layer label="Your C#?" at={gpuSame} color={C.pink} />
            <Layer label="Node?" at={gpuSame + 0.3} color={C.red} dashed ghost />
            <Layer label="no operating system" at={gpuSame + 0.6} color={C.red} dashed ghost />
            <Layer label="GPU" at={gpuSame + 0.9} color={C.dim} />
          </div>
        </div>

        {/* B: what is missing */}
        <Appear at={stageB + 0.3} dur={0.8} style={{ position: 'absolute', left: 150, top: 120 }}>
          <CodeWin title={T('Program.cs · on the CPU')} code={CODE} width={1000} size={34} chars={typed(t, fs + 0.2, CODE.length, 30)} />
          <Appear at={fs + 1.5} dur={0.5} rise={10} style={{ marginTop: 18 }}>
            <Chip color={C.red} size={34}>{T('✕ There is no file system on the GPU')}</Chip>
          </Appear>
        </Appear>
        <Appear at={stageB + 0.5} dur={0.8} style={{ position: 'absolute', left: 1210, top: 120, width: 560 }}>
          <Kicker>{T('Not on the GPU')}</Kicker>
          <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'flex-start' }}>
            {items.map((it) => {
              const k = cross(it.at);
              return (
                <div key={it.label} style={{ position: 'relative' }}>
                  <Chip mono color={k > 0.01 ? C.red : C.ink} size={42} style={{ opacity: lerp(1, 0.55, k) }}>{it.label}</Chip>
                  <div style={{ position: 'absolute', left: 8, top: '50%', height: 4, borderRadius: 2, background: C.red, width: `calc(${k * 100}% - 16px)` }} />
                </div>
              );
            })}
          </div>
        </Appear>

        {/* C: only math */}
        <Appear at={math - 0.1} dur={0.8} style={{ position: 'absolute', left: 150, top: 560 }}>
          <Kicker color={C.green}>{T('What is left')}</Kicker>
          <div style={{ marginTop: 22, display: 'flex', gap: 22, fontFamily: MONO, fontSize: 96, fontWeight: 500, color: C.green, letterSpacing: '0.02em' }}>
            {['+', '−', '×', '÷', '<', '>'].map((m, i) => (
              <span key={m} style={{ opacity: ramp(t, math + 0.15 * i, math + 0.15 * i + 0.4), transform: `translateY(${(1 - ramp(t, math + 0.15 * i, math + 0.15 * i + 0.4)) * 20}px)` }}>{m}</span>
            ))}
          </div>
        </Appear>
        <Appear at={fast} dur={0.8} style={{ position: 'absolute', left: 1010, top: 730, width: 790 }}>
          <Headline size={64}>{T('No baggage. That is why the GPU is so ')}<span style={{ color: C.mint }}>{T('fast')}</span>.</Headline>
        </Appear>
      </AbsoluteFill>
    </SceneFrame>
  );
};

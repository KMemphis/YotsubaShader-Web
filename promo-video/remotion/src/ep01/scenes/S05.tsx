import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Appear, C, Chip, Headline, Kicker, SceneFrame, mixHex } from '../kit';
import { clamp01, cue, lerp, ramp, rnd, scene, useT, T } from '../data';

const ID = 's05-parallel';

const Bar: React.FC<{ label: string; color: string; start: number; secs: number; w: number }> = ({ label, color, start, secs, w }) => {
  const t = useT();
  const k = clamp01((t - start) / secs);
  const done = k >= 1;
  return (
    <div style={{ marginTop: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 28, fontWeight: 600, color: done ? color : C.dim }}>
        <span>{T(label)}</span><span>{done ? T('✓ done') : ''}</span>
      </div>
      <div style={{ marginTop: 10, width: w, height: 26, borderRadius: 4, background: C.panel2, overflow: 'hidden' }}>
        <div style={{ width: `${k * 100}%`, height: '100%', borderRadius: 4, background: color }} />
      </div>
    </div>
  );
};

export const S05: React.FC = () => {
  const t = useT();
  const s = scene(ID);
  const ten = cue(ID, 'around ten cores');
  const truly = cue(ID, 'truly happening');
  const gpu = cue(ID, 'thousands of small workers');
  const cash = cue(ID, 'ten very fast cashiers');
  const huge = cue(ID, 'one huge customer');
  const small = cue(ID, 'a thousand small customers');
  const why = cue(ID, 'why not run everything');
  const split = cue(ID, 'split in a very particular way');
  const stageB = cash - 0.6;
  const stageC = why - 0.2;
  const A = 1 - ramp(t, stageB, stageB + 0.6);
  const B = ramp(t, stageB + 0.2, stageB + 0.8) * (1 - ramp(t, stageC, stageC + 0.6));

  const cols = 40, rows = 17, cs = 15, gap = 4;
  const cpu = Array.from({ length: 10 }, (_, i) => i);

  return (
    <SceneFrame id={ID}>
      <AbsoluteFill style={{ paddingBottom: 200 }}>
        {/* A: cores */}
        <div style={{ position: 'absolute', inset: 0, opacity: A }}>
          <Appear at={s.start + 0.2} dur={0.7} style={{ position: 'absolute', left: 150, top: 130 }}>
            <Kicker>CPU</Kicker>
            <Headline size={72} style={{ marginTop: 10 }}>{T('around ')}<span style={{ color: C.amber }}>10</span>{T(' cores')}</Headline>
          </Appear>
          <div style={{ position: 'absolute', left: 150, top: 330, display: 'grid', gridTemplateColumns: 'repeat(5, 120px)', gap: 18 }}>
            {cpu.map((i) => {
              const at = ten + 0.12 * i;
              const k = ramp(t, at, at + 0.35);
              const hot = ramp(t, truly, truly + 0.4);
              const beat = 0.5 + 0.5 * Math.sin((t - truly) * 5 + i);
              return <div key={i} style={{ width: 120, height: 120, borderRadius: 6, background: mixHex('#0f1822', C.amber, lerp(0.08, 1, k) * lerp(1, 0.72 + 0.28 * beat, hot)) }} />;
            })}
          </div>
          <Appear at={truly} dur={0.6} style={{ position: 'absolute', left: 150, top: 660, fontSize: 34, color: C.dim, fontWeight: 500, width: 700 }}>
            {T('Ten things at the same time. Each one is a thread.')}
          </Appear>

          <Appear at={gpu - 0.3} dur={0.7} style={{ position: 'absolute', left: 1000, top: 130 }}>
            <Kicker color={C.pink}>GPU</Kicker>
            <Headline size={72} style={{ marginTop: 10 }}><span style={{ color: C.pink }}>{T('thousands')}</span>{T(' of workers')}</Headline>
          </Appear>
          <svg width={cols * (cs + gap)} height={rows * (cs + gap)} style={{ position: 'absolute', left: 1000, top: 330 }}>
            {Array.from({ length: cols * rows }, (_, n) => {
              const x = n % cols, y = Math.floor(n / cols);
              const wave = (x + y * 0.6) / (cols + rows * 0.6);
              const k = ramp(t, gpu + wave * 1.6, gpu + wave * 1.6 + 0.3);
              const flick = 0.78 + 0.22 * Math.sin(t * 6 + rnd(n) * 12);
              return <rect key={n} x={x * (cs + gap)} y={y * (cs + gap)} width={cs} height={cs} rx={4} fill={mixHex('#0f1822', C.pink, lerp(0.07, flick, k))} />;
            })}
          </svg>
          <Appear at={gpu + 1.4} dur={0.6} style={{ position: 'absolute', left: 1000, top: 660, fontSize: 34, color: C.dim, fontWeight: 500, width: 700 }}>
            {T('Each one calculates without waiting for anyone.')}
          </Appear>
        </div>

        {/* B: cashiers */}
        <div style={{ position: 'absolute', inset: 0, opacity: B }}>
          <div style={{ position: 'absolute', left: 150, top: 120, width: 780 }}>
            <Kicker>{T('One huge customer')}</Kicker>
            <Bar label="10 fast cashiers · CPU" color={C.amber} start={huge} secs={1.4} w={780} />
            <Bar label="1,000 slower cashiers · GPU" color={C.pink} start={huge} secs={3.4} w={780} />
          </div>
          <div style={{ position: 'absolute', left: 1000, top: 120, width: 780, opacity: ramp(t, small - 0.4, small + 0.4) }}>
            <Kicker>{T('A thousand small customers')}</Kicker>
            <Bar label="10 fast cashiers · CPU" color={C.amber} start={small + 0.2} secs={3.6} w={780} />
            <Bar label="1,000 slower cashiers · GPU" color={C.pink} start={small + 0.2} secs={1.3} w={780} />
          </div>
        </div>

        {/* C: the condition */}
        <Appear at={stageC + 0.2} dur={0.9} style={{ position: 'absolute', left: 150, right: 150, top: 330, textAlign: 'center' }}>
          <Headline size={92}>{T('The GPU only wins when the work ')}<span style={{ color: C.pink }}>{T('can be split')}</span>.</Headline>
        </Appear>
        <Appear at={split + 0.4} dur={0.6} style={{ position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center' }}>
          <Chip color={C.violet} size={36}>{T('in a very particular way')}</Chip>
        </Appear>
      </AbsoluteFill>
    </SceneFrame>
  );
};

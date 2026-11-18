import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { Appear, C, Chip, Gradient, Headline, Kicker, Logo, SceneFrame } from '../kit';
import { H, W, cue, lerp, ramp, scene, useT, T } from '../data';

const ID = 's02-welcome';
const img = (n: string) => staticFile(`ep01/img/${n}`);

const Step: React.FC<{ n: string; label: string; at: number; color: string }> = ({ n, label, at, color }) => (
  <Appear at={at} dur={0.6} rise={20}>
    <div style={{ width: 340, padding: '34px 30px', borderRadius: 6, background: C.panel, border: `1px solid ${C.line}` }}>
      <div style={{ fontSize: 24, fontWeight: 700, color, letterSpacing: '0.14em' }}>{n}</div>
      <div style={{ marginTop: 10, fontSize: 52, fontWeight: 700, letterSpacing: '-0.03em' }}>{T(label)}</div>
    </div>
  </Appear>
);

const Shot: React.FC<{ src: string; label: string; at: number; w?: number }> = ({ src, label, at, w = 252 }) => (
  <Appear at={at} dur={0.7} rise={30}>
    <div style={{ width: w }}>
      <div style={{ width: w, height: w * 0.62, borderRadius: 6, overflow: 'hidden', border: `1px solid ${C.line}`, }}>
        <Img src={img(src)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ marginTop: 12, fontSize: 26, fontWeight: 600, color: C.dim, textAlign: 'center' }}>{T(label)}</div>
    </div>
  </Appear>
);

export const S02: React.FC = () => {
  const t = useT();
  const s = scene(ID);
  const engines = cue(ID, 'many graphics APIs and game engines');
  const what = cue(ID, 'what a shader is');
  const why = cue(ID, 'why it runs on the GPU');
  const csharp = cue(ID, 'You only need to know C#');
  const write = cue(ID, 'write code');
  const run = cue(ID, 'run it');
  const watch = cue(ID, 'and watch');
  const fundamentals = cue(ID, 'start with the fundamentals');
  const workshop = cue(ID, 'Then a workshop');
  const finally_ = cue(ID, 'And finally the shaders themselves');
  const stageB = what - 0.4;
  const stageC = fundamentals - 0.5;

  const chips = ['colors', 'coordinates', 'conditions', 'loops', 'time'];
  const chipAt = [cue(ID, 'colors'), cue(ID, 'coordinates'), cue(ID, 'conditions'), cue(ID, 'loops'), cue(ID, 'and time')];
  const lineK = ramp(t, fundamentals, finally_ + 1.6, (x) => x);

  return (
    <SceneFrame id={ID}>
      <AbsoluteFill style={{ paddingBottom: 200 }}>
        {/* A: what it is */}
        <Appear at={s.start} dur={0.8} out={stageB} style={{ position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center' }}>
          <Logo size={64} />
          <Headline size={92} style={{ marginTop: 46 }}>{T('Write shaders')} <Gradient>{T('in C#')}</Gradient></Headline>
          <div style={{ marginTop: 20, fontSize: 38, color: C.dim, fontWeight: 500 }}>{T('An SDK for many graphics APIs and game engines')}</div>
        </Appear>
        <Appear at={engines} dur={0.8} out={stageB} style={{ position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34 }}>
          <div style={{ display: 'flex', gap: 44, fontSize: 40, fontWeight: 600, color: C.blue }}>
            {['Vulkan', 'OpenGL', 'WebGPU', 'Metal', 'Direct3D'].map((n) => <span key={n}>{n}</span>)}
          </div>
          <div style={{ display: 'flex', gap: 44, fontSize: 40, fontWeight: 600, color: C.ink }}>
            {['Unity', 'MonoGame', 'Stride', 'FNA', 'Silk.NET'].map((n) => <span key={n}>{n}</span>)}
          </div>
        </Appear>

        {/* B: what you will learn */}
        <Appear at={stageB + 0.2} dur={0.8} out={stageC} style={{ position: 'absolute', left: 150, right: 150, top: 120 }}>
          <Kicker>{T('In this video')}</Kicker>
          <div style={{ marginTop: 34, display: 'flex', flexDirection: 'column', gap: 26 }}>
            <Appear at={what} dur={0.6}><Headline size={88}>{T('What is a ')}<Gradient>shader</Gradient>{T('?')}</Headline></Appear>
            <Appear at={why} dur={0.6}><Headline size={88}>{T('Why does it run on the ')}<Gradient>GPU</Gradient>{T('?')}</Headline></Appear>
          </div>
        </Appear>
        <Appear at={csharp - 0.1} dur={0.7} out={stageC} style={{ position: 'absolute', left: 150, top: 560 }}>
          <Chip color={C.green} size={44}>{T('All you need: C#')}</Chip>
        </Appear>
        <div style={{ position: 'absolute', left: 150, top: 700, display: 'flex', alignItems: 'center', gap: 26, opacity: 1 - ramp(t, stageC, stageC + 0.5) }}>
          <Step n="01" label="Write code" at={write - 0.15} color={C.pink} />
          <Appear at={run - 0.2} dur={0.4} rise={0}><div style={{ fontSize: 56, color: C.dim }}>→</div></Appear>
          <Step n="02" label="Run it" at={run - 0.15} color={C.violet} />
          <Appear at={watch - 0.2} dur={0.4} rise={0}><div style={{ fontSize: 56, color: C.dim }}>→</div></Appear>
          <Step n="03" label="Watch it" at={watch - 0.15} color={C.mint} />
        </div>

        {/* C: the path */}
        <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H - 200, opacity: ramp(t, stageC, stageC + 0.7) }}>
          <svg width={W} height={400} style={{ position: 'absolute', left: 0, top: 130 }}>
            <line x1={330} y1={90} x2={1590} y2={90} stroke={C.line} strokeWidth={4} strokeLinecap="round" />
            <line x1={330} y1={90} x2={lerp(330, 1590, lineK)} y2={90} stroke={C.pink} strokeWidth={4} strokeLinecap="round" />
            <defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stopColor={C.pink} /><stop offset=".5" stopColor={C.violet} /><stop offset="1" stopColor={C.mint} /></linearGradient></defs>
            {[330, 960, 1590].map((x, i) => {
              const at = [fundamentals, workshop, finally_][i];
              const k = ramp(t, at - 0.1, at + 0.5);
              return <circle key={x} cx={x} cy={90} r={lerp(10, 24, k)} fill={k > 0.05 ? [C.pink, C.violet, C.mint][i] : C.panel} stroke={C.bg} strokeWidth={6} />;
            })}
          </svg>
          {[
            { x: 330, at: fundamentals, title: 'Fundamentals', sub: 'for someone who has never seen a shader', c: C.pink },
            { x: 960, at: workshop, title: 'Workshop', sub: 'one tool at a time', c: C.violet },
            { x: 1590, at: finally_, title: 'The shaders', sub: 'four complete effects', c: C.mint },
          ].map((n) => (
            <Appear key={n.title} at={n.at} dur={0.7} style={{ position: 'absolute', left: n.x - 260, top: 290, width: 520, textAlign: 'center' }}>
              <div style={{ fontSize: 60, fontWeight: 700, letterSpacing: '-0.03em', color: n.c }}>{T(n.title)}</div>
              <div style={{ marginTop: 8, fontSize: 30, color: C.dim, fontWeight: 500 }}>{T(n.sub)}</div>
            </Appear>
          ))}
          <div style={{ position: 'absolute', left: 700, top: 470, width: 520, display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            {chips.map((c, i) => <Appear key={c} at={chipAt[i] - 0.1} dur={0.5} rise={16}><Chip size={32} color={C.violet}>{T(c)}</Chip></Appear>)}
          </div>
          <div style={{ position: 'absolute', left: 1230, top: 460, width: 560, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
            <Shot src="mandelbrot.png" label="a fractal" at={cue(ID, 'a fractal') - 0.1} w={260} />
            <Shot src="neon.png" label="a neon ring" at={cue(ID, 'a neon ring') - 0.1} w={260} />
            <Shot src="plasma-2.png" label="a moving plasma" at={cue(ID, 'a moving plasma') - 0.1} w={260} />
            <Shot src="agua-1.png" label="underwater" at={cue(ID, 'underwater') - 0.1} w={260} />
          </div>
        </div>
      </AbsoluteFill>
    </SceneFrame>
  );
};

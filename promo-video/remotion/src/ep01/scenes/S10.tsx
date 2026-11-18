import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Appear, C, Gradient, Headline, Kicker, Logo, MONO, SceneFrame } from '../kit';
import { cue, getLang, ramp, scene, useT, T } from '../data';

const ID = 's10-recap';

export const S10: React.FC = () => {
  const t = useT();
  const s = scene(ID);
  const lines = [
    { at: cue(ID, 'A shader is a function'), color: C.pink, node: <>{T('A shader is a function that runs on the ')}<Gradient>GPU</Gradient>.</> },
    { at: cue(ID, 'once per vertex'), color: C.violet, node: <>{T('It runs once per vertex, per pixel or per index.')}</> },
    { at: cue(ID, 'Inside it you can only'), color: C.blue, node: <>{T('Inside: only calculations. No files, no text, no lists.')}</> },
    { at: cue(ID, 'you write that function in C#'), color: C.mint, node: <>{T('With Yotsuba Shader, you write it in ')}<span style={{ color: C.blue }}>C#</span>.</> },
  ];
  const next = cue(ID, 'In the next video');
  const dim = 1 - ramp(t, next - 0.3, next + 0.6); // the list leaves completely before the end card
  return (
    <SceneFrame id={ID}>
      <AbsoluteFill style={{ paddingBottom: 200 }}>
        <Appear at={cue(ID, 'To sum up') - 0.1} dur={0.7} style={{ position: 'absolute', left: 200, top: 100, opacity: dim }}><Kicker>{T('To sum up')}</Kicker></Appear>
        <div style={{ position: 'absolute', left: 200, top: 170, display: 'flex', flexDirection: 'column', gap: 44, opacity: dim }}>
          {lines.map((l, i) => (
            <Appear key={i} at={l.at - 0.15} dur={0.7} rise={22}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 34 }}>
                <span style={{ fontFamily: MONO, fontSize: 36, color: l.color, width: 70, height: 70, borderRadius: 4, border: `2px solid ${l.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                <span style={{ fontSize: getLang() === 'es' ? 54 : 62, fontWeight: 700, letterSpacing: '-0.03em' }}>{l.node}</span>
              </div>
            </Appear>
          ))}
        </div>
        <Appear at={next + 0.1} dur={0.9} style={{ position: 'absolute', left: 0, right: 0, top: 280, textAlign: 'center' }}>
          <Logo size={54} />
          <div style={{ height: 50 }} />
          <Kicker color={C.pink}>{T('Next · Get Started · 2')}</Kicker>
          <Headline size={110} style={{ marginTop: 16 }}>{T('How a shader is built')}</Headline>
        </Appear>
      </AbsoluteFill>
    </SceneFrame>
  );
};

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Appear, C, Headline, Kicker, Logo, MONO, SceneFrame } from '../../ep01/kit';
import { cue, getLang, ramp, scene, useT, T } from '../../ep01/data';

const ID = 'v2-s14-recap';

export const S14: React.FC = () => {
  const t = useT();
  const lines = [
    { at: cue(ID, 'Everything is drawn'), color: C.pink, text: 'Everything is drawn with triangles. Each corner is a vertex.' },
    { at: cue(ID, 'numbered slots'), color: C.blue, text: 'A vertex carries the data you choose, in numbered slots.' },
    { at: cue(ID, 'Vertex runs once per vertex'), color: C.violet, text: 'Vertex runs once per vertex and returns the final position.' },
    { at: cue(ID, 'The GPU spreads'), color: C.amber, text: 'The GPU spreads the data among the pixels.' },
    { at: cue(ID, 'Fragment runs once per pixel'), color: C.mint, text: 'Fragment runs once per pixel and returns its color.' },
    { at: cue(ID, 'each door has its own'), color: C.green, text: 'Each door has its own slots, counting from zero.' },
    { at: cue(ID, 'GLSL or HLSL attributes'), color: C.blue, text: 'Write it with GLSL or HLSL attributes, as you prefer.' },
  ];
  const next = cue(ID, 'In the next video');
  const dim = 1 - ramp(t, next - 0.3, next + 0.6);
  return (
    <SceneFrame id={ID}>
      <AbsoluteFill style={{ paddingBottom: 200 }}>
        <Appear at={cue(ID, 'To sum up') - 0.1} dur={0.7} style={{ position: 'absolute', left: 160, top: 70, opacity: dim }}><Kicker>{T('To sum up')}</Kicker></Appear>
        <div style={{ position: 'absolute', left: 160, top: 130, display: 'flex', flexDirection: 'column', gap: 24, opacity: dim }}>
          {lines.map((l, i) => (
            <Appear key={i} at={l.at - 0.15} dur={0.6} rise={18}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                <span style={{ fontFamily: MONO, fontSize: 30, color: l.color, width: 60, height: 60, borderRadius: 4, border: `2px solid ${l.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{i + 1}</span>
                <span style={{ fontSize: getLang() === 'es' ? 42 : 46, fontWeight: 700, letterSpacing: '-0.02em' }}>{T(l.text)}</span>
              </div>
            </Appear>
          ))}
        </div>
        <Appear at={next + 0.1} dur={0.9} style={{ position: 'absolute', left: 0, right: 0, top: 280, textAlign: 'center' }}>
          <Logo size={54} />
          <div style={{ height: 50 }} />
          <Kicker color={C.pink}>{T('Next · Get Started · 3')}</Kicker>
          <Headline size={110} style={{ marginTop: 16 }}>{T('Set up your project')}</Headline>
        </Appear>
      </AbsoluteFill>
    </SceneFrame>
  );
};

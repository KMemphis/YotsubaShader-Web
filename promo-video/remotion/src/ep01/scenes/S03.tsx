import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { Appear, C, Chip, CodeWin, Gradient, Headline, SceneFrame, typed } from '../kit';
import { cue, lerp, ramp, scene, useT, T } from '../data';

const ID = 's03-function';
const CODE = `public vec4 Fragment(Pixel pixel)
{
    return Make.Vec4(1f, 0.25f, 0.45f, 1f);
}`;

export const S03: React.FC = () => {
  const t = useT();
  const s = scene(ID);
  const simply = cue(ID, 'A shader is a function');
  const gpu = cue(ID, 'The GPU is your');
  const separate = cue(ID, 'a separate card');
  const inside = cue(ID, 'inside the processor');
  const why = cue(ID, 'But why do we need');
  const move = ramp(t, gpu - 0.1, gpu + 0.9);
  const fadeAll = ramp(t, why - 0.2, why + 0.5);

  return (
    <SceneFrame id={ID}>
      <AbsoluteFill style={{ paddingBottom: 200 }}>
        <div style={{ opacity: 1 - fadeAll }}>
          <Appear at={s.start} dur={0.8} out={simply - 0.1} style={{ position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center' }}>
            <Headline size={130}>{T('So, what is a ')}<Gradient>shader</Gradient>{T('?')}</Headline>
          </Appear>

          <Appear at={simply} dur={0.7} style={{ position: 'absolute', left: lerp(560, 1010, move), top: 210 }}>
            <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: '0.16em', color: C.pink, marginBottom: 18, textTransform: 'uppercase' }}>{T('A shader is a function')}</div>
            <CodeWin title="Fragment.cs" code={CODE} width={820} size={26} chars={typed(t, simply + 0.3, CODE.length, 38)} />
            <div style={{ marginTop: 26, display: 'flex', alignItems: 'center', gap: 16, fontSize: 34, color: C.dim, fontWeight: 500 }}>
              <span style={{ width: 16, height: 16, borderRadius: 6, background: C.mint, }} />
              {T('runs on the GPU')}
            </div>
          </Appear>

          <Appear at={gpu} dur={0.9} rise={40} style={{ position: 'absolute', left: 110, top: 170 }}>
            <div style={{ width: 780, height: 520, borderRadius: 6, overflow: 'hidden', border: `1px solid ${C.line}` }}>
              <Img src={staticFile('ep01/img/gpu.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ marginTop: 22, display: 'flex', gap: 14 }}>
              <Appear at={separate} dur={0.5} rise={12}><Chip size={30} color={C.blue}>{T('Separate card')}</Chip></Appear>
              <Appear at={inside} dur={0.5} rise={12}><Chip size={30} color={C.violet}>{T('Inside the processor')}</Chip></Appear>
            </div>
            <div style={{ marginTop: 20, fontSize: 19, color: '#5f7479', maxWidth: 780, lineHeight: 1.35 }}>
              Palit GeForce RTX 5090 GameRock · PantheraLeo1359531, Wikimedia Commons, CC BY 4.0
            </div>
          </Appear>
        </div>

        <Appear at={why + 0.2} dur={0.9} style={{ position: 'absolute', left: 140, right: 140, top: 330, textAlign: 'center' }}>
          <Headline size={104}>{T('Why can’t the ')}<span style={{ color: C.blue }}>C#</span>{T(' we already write just run there?')}</Headline>
        </Appear>
      </AbsoluteFill>
    </SceneFrame>
  );
};

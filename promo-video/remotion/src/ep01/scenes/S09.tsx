import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Appear, C, Chip, CodeWin, Gradient, Headline, Kicker, SceneFrame, typed } from '../kit';
import { cue, lerp, ramp, scene, useT, T } from '../data';

const ID = 's09-yotsuba';

// the Fragment of the tutorial's gradient shader (content/en/get-started/first-shader.md)
const CODE = `[ShaderStage(Stage.Fragment)]
[return: location(0)]
public vec4 Fragment(Pixel pixel)
{
    float red = 1f;
    float green = 0.25f + 0.6f * pixel.Uv.Y;
    float blue = 0.45f - 0.35f * pixel.Uv.Y;
    return Make.Vec4(red, green, blue, 1f);
}`;

const OUT = [
  { n: 'SPIR-V', c: C.blue },
  { n: 'HLSL', c: C.violet },
  { n: 'GLSL', c: C.pink },
  { n: 'GLSL ES', c: C.amber },
  { n: 'Metal', c: C.green },
  { n: 'C++', c: C.mint },
];

export const S09: React.FC = () => {
  const t = useT();
  const s = scene(ID);
  const noC = cue(ID, "doesn't understand C#");
  const langs = cue(ID, 'HLSL, GLSL, Metal');
  const classes = cue(ID, 'knows about the classes');
  const yotsuba = cue(ID, 'With Yotsuba Shader');
  const editor = cue(ID, 'your own editor');
  const check = cue(ID, 'The compiler checks');
  const translate = cue(ID, 'translates the result');
  const look = cue(ID, "Here's what that looks like");
  const stageB = yotsuba - 0.5;

  const checks = [
    { at: check, text: 'no files' },
    { at: check + 0.7, text: 'no strings' },
    { at: check + 1.4, text: 'only what the GPU can do' },
  ];

  return (
    <SceneFrame id={ID}>
      <AbsoluteFill style={{ paddingBottom: 200 }}>
        {/* A: every API has its own language */}
        <div style={{ position: 'absolute', inset: 0, opacity: 1 - ramp(t, stageB, stageB + 0.6) }}>
          <Appear at={s.start} dur={0.8} style={{ position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center' }}>
            <Headline size={110}>{T('The GPU does not understand ')}<span style={{ color: C.blue }}>C#</span></Headline>
          </Appear>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 420, display: 'flex', justifyContent: 'center', gap: 30 }}>
            {['HLSL', 'GLSL', 'Metal'].map((n, i) => (
              <Appear key={n} at={langs + i * 0.55} dur={0.6} rise={20}><Chip size={70} color={[C.violet, C.pink, C.green][i]}>{n}</Chip></Appear>
            ))}
          </div>
          <Appear at={classes} dur={0.7} style={{ position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', fontSize: 40, color: C.dim, fontWeight: 500 }}>
            {T('One for each API. None of them knows the classes in your project.')}
          </Appear>
        </div>

        {/* B: write it in C#, get every language */}
        <Appear at={stageB + 0.4} dur={0.8} style={{ position: 'absolute', left: 80, top: 80 }}>
          <Kicker color={C.pink}>{T('You write')}</Kicker>
          <div style={{ marginTop: 16 }}>
            <CodeWin title="MyShaders/Gradient.cs" code={CODE} width={900} size={26} chars={typed(t, yotsuba + 0.4, CODE.length, 34)} />
          </div>
        </Appear>
        <Appear at={editor} dur={0.6} style={{ position: 'absolute', left: 80, top: 640 }}>
          <Chip color={C.green} size={30}>{T('your project · your editor')}</Chip>
        </Appear>

        <Appear at={check - 0.2} dur={0.8} style={{ position: 'absolute', left: 1030, top: 150, width: 330 }}>
          <Kicker>{T('Compiler checks')}</Kicker>
          <div style={{ marginTop: 20, padding: '28px 26px', borderRadius: 6, background: C.panel, border: `1px solid ${C.line}`, display: 'flex', flexDirection: 'column', gap: 22 }}>
            {checks.map((c) => (
              <Appear key={c.text} at={c.at} dur={0.5} rise={10}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', fontSize: 30, fontWeight: 600 }}>
                  <span style={{ color: C.green, fontSize: 34, lineHeight: 1 }}>✓</span>{T(c.text)}
                </div>
              </Appear>
            ))}
          </div>
        </Appear>
        <Appear at={translate - 0.1} dur={0.5} rise={0} style={{ position: 'absolute', left: 1385, top: 330, fontSize: 70, color: C.dim }}>→</Appear>

        <div style={{ position: 'absolute', left: 1500, top: 120, width: 330 }}>
          <Appear at={translate} dur={0.7}><Kicker color={C.mint}>{T('You get')}</Kicker></Appear>
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {OUT.map((o, i) => (
              <Appear key={o.n} at={translate + 0.25 + i * 0.28} dur={0.5} rise={16}><Chip size={38} color={o.c} style={{ width: 300, justifyContent: 'center' }}>{o.n}</Chip></Appear>
            ))}
          </div>
        </div>
        <Appear at={look + 0.3} dur={0.8} style={{ position: 'absolute', left: 1030, top: 600, width: 440 }}>
          <div style={{ fontSize: 36, fontWeight: 600, color: C.ink }}>{T('A complete shader, ')}<Gradient>{T('written in C#')}</Gradient>.</div>
        </Appear>
      </AbsoluteFill>
    </SceneFrame>
  );
};

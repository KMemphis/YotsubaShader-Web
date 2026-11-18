import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Appear, C, Headline, Kicker, Logo, SceneFrame } from '../../ep01/kit';
import { cue, lerp, ramp, scene, useT, T, fmt } from '../../ep01/data';
import { NDC, TriPanel, blend, toPx, bary, Mono } from '../common';

const ID = 'v2-s01-hook';
const W = 960, H = 540, CELL = 12;
const P = NDC.map((n) => toPx(n, W, H));
const COUNT = (() => { let n = 0; for (let r = 0; r < H / CELL; r++) for (let c = 0; c < W / CELL; c++) if (bary(c * CELL + 6, r * CELL + 6, P).every((v) => v >= 0)) n++; return n; })();

export const S01: React.FC = () => {
  const t = useT();
  const s = scene(ID);
  const corners = cue(ID, 'three corners');
  const colors = cue(ID, 'red, green and blue');
  const many = cue(ID, 'thousands of colored pixels');
  const video = cue(ID, 'In this video');
  const k = (a: number, b: number) => ramp(t, a, b);
  const hide = 1 - ramp(t, video - 0.3, video + 0.2);
  const filled = Math.round(COUNT * ramp(t, many, many + 1.8));

  return (
    <SceneFrame id={ID} lead={0.6}>
      <AbsoluteFill style={{ paddingBottom: 200 }}>
        <div style={{ position: 'absolute', inset: 0, opacity: hide }}>
          <Appear at={s.start + 0.2} dur={0.8} style={{ position: 'absolute', left: 120, top: 150 }}>
            <TriPanel
              w={W} h={H} cell={CELL}
              outline={k(corners, corners + 1.4)}
              dots={[k(colors, colors + 0.4), k(colors + 0.7, colors + 1.1), k(colors + 1.4, colors + 1.8)]}
              cellFn={(l, c, r) => (ramp(t, many + (r / (H / CELL)) * 1.4, many + (r / (H / CELL)) * 1.4 + 0.3) > 0.5 ? blend(l) : null)}
            />
          </Appear>
          <div style={{ position: 'absolute', left: 1180, top: 190, width: 640 }}>
            <Appear at={corners} dur={0.6}>
              <Kicker>{T('what you send')}</Kicker>
              <div style={{ fontSize: 120, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1 }}>3</div>
              <div style={{ fontSize: 36, color: C.dim, fontWeight: 500 }}>{T('points, each with a color')}</div>
            </Appear>
            <Appear at={many} dur={0.6} style={{ marginTop: 56 }}>
              <Kicker color={C.pink}>{T('what you get')}</Kicker>
              <div style={{ fontSize: 120, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1, color: C.pink, fontVariantNumeric: 'tabular-nums' }}>{fmt(filled)}</div>
              <div style={{ fontSize: 36, color: C.dim, fontWeight: 500 }}>{T('colored pixels')}</div>
            </Appear>
          </div>
        </div>
        <Appear at={video + 0.1} dur={0.9} style={{ position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center' }}>
          <Logo size={62} />
          <div style={{ height: 42 }} />
          <Kicker color={C.pink}>{T('Get Started · 2')}</Kicker>
          <Headline size={118} style={{ marginTop: 14 }}>{T('How a shader is built')}</Headline>
        </Appear>
      </AbsoluteFill>
    </SceneFrame>
  );
};

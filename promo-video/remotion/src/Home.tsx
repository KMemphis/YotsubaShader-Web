import React from 'react';
import { AbsoluteFill, Easing, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { Audio } from '@remotion/media';
import { Cam, MONO, Reveal, Stage, Typed, Win, Wordmark, fade, useFrame } from './ui';
import timingEn from './ep01/timing.home.json';
import timingEs from './ep01/timing.home.es.json';

/**
 * The film on the home page: four lines of narration, one idea each (what it is, plain C#, targets, where to try it).
 * Every cue comes from the narration timing (automation/ep01-narration.mjs --ep home [--lang es]).
 * The previous 106 s film (Promo.tsx, PromoA-*) stays in the repo for comparison.
 */
export type HomeLang = 'en' | 'es';
type Word = { w: string; start: number; end: number };
type Scene = { id: string; start: number; end: number; sentences: { words: Word[] }[] };
type Timing = { duration: number; scenes: Scene[] };

const TIMING: Record<HomeLang, Timing> = { en: timingEn as Timing, es: timingEs as Timing };
const FPS = 60;
export const TAIL = 2.6;
export const homeFrames = (l: HomeLang) => Math.ceil((TIMING[l].duration + TAIL) * FPS);

const TXT = {
  en: { h1: 'Write shaders in C#.', h2: 'A plain C# class.', to: 'Compiles to', cta: 'Try the Playground', lic: 'Free and open source · MS-PL License' },
  es: { h1: 'Escribe shaders en C#.', h2: 'Una clase de C# normal.', to: 'Compila a', cta: 'Prueba el Playground', lic: 'Gratis y de código abierto · Licencia MS-PL' },
};

// The shader typed on screen is the one the Playground starts with.
const CODE = `public struct VertexOutput
{
    [SV_Position]
    public Vector4 Position;
}

public class Triangle
{
    [ShaderStage(Stage.Vertex)]
    public VertexOutput Vertex([SV_VertexID] uint id)
    {
        VertexOutput output;
        output.Position = new Vector4(0, 0, 0, 1);
        return output;
    }

    [ShaderStage(Stage.Fragment)]
    public Vector4 Fragment(VertexOutput input)
    {
        return new Vector4(1, 0.4f, 0.7f, 1);
    }
}`;

const TARGETS: string[][] = [['SPIR-V'], ['HLSL'], ['GLSL'], ['GLSL', 'ES'], ['Metal']];
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const Center: React.FC<{ children: React.ReactNode; top: number; style?: React.CSSProperties }> = ({ children, top, style }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, top, display: 'flex', flexDirection: 'column', alignItems: 'center', ...style }}>{children}</div>
);

/** Seconds since this sequence began. */
const useSec = () => useCurrentFrame() / FPS;

/**
 * When each target name starts in the voice track (seconds on the film's clock), measured on the rendered narration
 * (ffmpeg silencedetect): the voice spells the acronyms, so counting characters drifts by up to half a second.
 * Re-measure after regenerating the voice.
 */
const TARGET_TIMES: Record<HomeLang, number[]> = {
  en: [16.5, 18.7, 19.55, 20.7, 22.3],
  es: [19.25, 22.6, 24.0, 24.95, 26.95],
};

const Intro: React.FC<{ lang: HomeLang; dur: number }> = ({ lang, dur }) => {
  const s = useSec();
  const t = TXT[lang];
  return (
    <Stage>
      <Cam dur={dur * 30} to={1.05}>
        <Center top={64} style={{ opacity: fade(s * 30, 0, 24) }}><Wordmark size={46} /></Center>
        <Center top={400}>
          <Reveal text={t.h1} size={lang === 'en' ? 150 : 128} from={6} gradientFrom={2} maxWidth={1800} />
        </Center>
      </Cam>
    </Stage>
  );
};

const CodeAndTargets: React.FC<{ lang: HomeLang; timing: Timing; t0: number; dur: number }> = ({ lang, timing, t0, dur }) => {
  const s = useSec();
  const t = TXT[lang];
  const code = timing.scenes[1];
  const targets = timing.scenes[2];
  const times = TARGET_TIMES[lang];
  // Rel. to this sequence (which starts at t0)
  const codeStart = 0.5;
  const typeSecs = Math.max(2, code.end - t0 - 0.6 - codeStart);
  const cps = CODE.length / typeSecs;
  const shiftT = targets.start - t0 - 0.2;
  const shift = interpolate(s, [shiftT, shiftT + 0.9], [0, 1], { ...clamp, easing: ease });
  const headOut = 1 - interpolate(s, [shiftT, shiftT + 0.5], [0, 1], clamp);
  const winW = 880;
  const left = interpolate(shift, [0, 1], [(1920 - winW) / 2, 130]);
  return (
    <Stage>
      <Cam dur={dur * 30} to={1.03}>
        <Center top={50} style={{ opacity: headOut }}>
          <Reveal text={t.h2} size={88} from={4} />
        </Center>
        <div style={{ position: 'absolute', left, top: 170, opacity: fade(s * 30, 6, 30), translate: `0 ${(1 - fade(s * 30, 6, 30)) * 50}px` }}>
          <Win title="Triangle.cs" width={winW} height={850}>
            <Typed code={CODE} from={codeStart * 30} cps={cps} size={23} pad={28} />
          </Win>
        </div>
        <div style={{ position: 'absolute', left: 1120, top: 250, width: 680, opacity: shift }}>
          <div style={{ fontSize: 40, fontWeight: 500, color: '#86868b', letterSpacing: '-0.01em', marginBottom: 18 }}>{t.to}</div>
          {TARGETS.map((tokens, i) => {
            const a = interpolate(s, [times[i] - t0 - 0.05, times[i] - t0 + 0.35], [0, 1], { ...clamp, easing: ease });
            return (
              <div key={i} style={{ fontSize: 112, lineHeight: 1.12, fontWeight: 700, letterSpacing: '-0.04em', opacity: a, translate: `0 ${(1 - a) * 28}px`, color: '#f5f5f7' }}>{tokens.join(' ')}</div>
            );
          })}
        </div>
      </Cam>
    </Stage>
  );
};

const Close: React.FC<{ lang: HomeLang; dur: number }> = ({ lang, dur }) => {
  const s = useSec();
  const t = TXT[lang];
  const rise = (d: number, dist = 26) => {
    const a = interpolate(s, [d, d + 0.55], [0, 1], { ...clamp, easing: ease });
    return { opacity: a, translate: `0 ${(1 - a) * dist}px` } as React.CSSProperties;
  };
  return (
    <Stage>
      <Cam dur={dur * 30} to={1.04}>
        <Center top={300}>
          <div style={rise(0.1, 34)}><Wordmark size={118} /></div>
          <div style={{ height: 56 }} />
          <div style={{ ...rise(0.55), fontSize: 52, fontWeight: 600, color: '#2997ff', letterSpacing: '-0.02em' }}>{t.cta}</div>
          <div style={{ ...rise(0.8, 18), marginTop: 26, fontSize: 30, fontFamily: MONO, color: '#f5f5f7' }}>github.com/KMemphis/YotsubaShader</div>
          <div style={{ ...rise(1.05, 12), marginTop: 40, fontSize: 24, color: '#86868b' }}>{t.lic}</div>
        </Center>
      </Cam>
    </Stage>
  );
};

export const Home: React.FC<{ lang: HomeLang }> = ({ lang }) => {
  const timing = TIMING[lang];
  const total = timing.duration + TAIL;
  const [, h2, , h4] = timing.scenes;
  const f = (sec: number) => Math.round(sec * FPS);
  const scene = (from: number, to: number, el: (dur: number) => React.ReactNode, first = false) => (
    <Sequence from={f(from)} durationInFrames={f(to - from)} layout="none">
      <FadeBox len={to - from} first={first}>{el(to - from)}</FadeBox>
    </Sequence>
  );
  const cut1 = h2.start - 0.4, cut2 = h4.start - 0.4;
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {scene(0, cut1 + 0.4, (d) => <Intro lang={lang} dur={d} />, true)}
      {scene(cut1, cut2 + 0.4, (d) => <CodeAndTargets lang={lang} timing={timing} t0={cut1} dur={d} />)}
      {scene(cut2, total, (d) => <Close lang={lang} dur={d} />)}
      <Audio src={staticFile(lang === 'en' ? 'home/voice.wav' : 'home/voice.es.wav')} />
    </AbsoluteFill>
  );
};

/** Dissolves a scene in and out (0.4 s overlap with its neighbours, so no gap of black). */
const FadeBox: React.FC<{ len: number; first: boolean; children: React.ReactNode }> = ({ len, first, children }) => {
  const s = useSec();
  const o = interpolate(s, [0, first ? 0.001 : 0.4, len - 0.4, len], [first ? 1 : 0, 1, 1, first ? 1 : 0], clamp);
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

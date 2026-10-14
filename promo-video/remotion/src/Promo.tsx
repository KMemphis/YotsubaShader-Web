import React, { createContext, useContext } from 'react';
import { AbsoluteFill, Easing, Sequence, getStaticFiles, interpolate, staticFile } from 'remotion';
import { Audio, Video } from '@remotion/media';
import { Cam, FONT, MONO, Footnote, Reveal, Stage, Typed, Win, Wordmark, fade, useFrame } from './ui';
import SEN from './snippets.json';
import SES from './snippets.es.json';
import PGEN from './playground.json';
import PGES from './playground-es.json';

export type Lang = 'en' | 'es';
const FPS = 30; // authoring units; the composition itself runs at 60 fps
const f = (sec: number) => Math.round(sec * FPS);
const X2 = (n: number) => Math.round(n * 2);
const ease = Easing.bezier(0.16, 1, 0.3, 1);

export const INTRO_FRAMES = 272;   // the recorded intro, conformed to 4K60 (4.53 s)
export const OVERLAP = 12;         // dissolve between the intro and the animated part (60 fps frames)
export const CONTENT_FRAMES = 58 * 60;

/* ------------------------------------------------------------------- texts */
const TXT = {
  en: {
    l1: 'Shaders in a C# engine', l2: 'usually live somewhere else.',
    items: ['Another language', 'Another toolchain', 'Another copy of your types'], gone: 'Gone.',
    plain: 'Plain C#. Your own types.',
    of: (n: string) => `${n} of 3`,
    gen: 'Source generator', genSub: 'Compiles at build time',
    cli: 'Command line', cliSub: 'For CI and content pipelines',
    lib: 'Library', libSub: 'For editors, importers and hot reload',
    genNote: 'Building the project generates Triangle.g.cs.', cliNote: 'Writes one .spv file per entry point.',
    concept: 'Concept illustration. Not a live recording.',
    refl: 'Same two fields. Every shader.',
    out: 'Write shaders in C#.', try: 'Try the Playground', lic: 'Free and open source · MIT License',
  },
  es: {
    l1: 'Los shaders de un motor en C#', l2: 'suelen vivir en otro lugar.',
    items: ['Otro lenguaje', 'Otra herramienta', 'Otra copia de tus tipos'], gone: 'Se acabó.',
    plain: 'C# normal. Tus propios tipos.',
    of: (n: string) => `${n} de 3`,
    gen: 'Generador de código', genSub: 'Se compila al construir el proyecto',
    cli: 'Línea de comandos', cliSub: 'Para CI y pipelines de contenido',
    lib: 'Biblioteca', libSub: 'Para editores, importadores y recarga en caliente',
    genNote: 'Al compilar el proyecto se genera Triangle.g.cs.', cliNote: 'Genera un archivo .spv por cada punto de entrada.',
    concept: 'Ilustración conceptual. No es una grabación real.',
    refl: 'Los mismos dos campos. Todos los shaders.',
    out: 'Escribe shaders en C#.', try: 'Prueba el Playground', lic: 'Gratis y de código abierto · Licencia MIT',
  },
};
const LangCtx = createContext<Lang>('es');
const useT = () => TXT[useContext(LangCtx)];
const useS = () => (useContext(LangCtx) === 'es' ? SES : SEN);
const sfx = (l: Lang) => (l === 'es' ? '-es' : '');
const useClip = () => { const l = useContext(LangCtx); return (n: string) => staticFile(`${n}${sfx(l)}.mp4`); };

/** Floats an element in: rise + fade + slight scale. */
const Rise: React.FC<{ children: React.ReactNode; delay?: number; dist?: number; style?: React.CSSProperties }> = ({ children, delay = 0, dist = 60, style }) => {
  const frame = useFrame();
  const t = interpolate(frame, [delay, delay + 28], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
  return <div style={{ opacity: t, translate: `0 ${(1 - t) * dist}px`, scale: 0.96 + t * 0.04, ...style }}>{children}</div>;
};
const Center: React.FC<{ children: React.ReactNode; top: number; style?: React.CSSProperties }> = ({ children, top, style }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, top, display: 'flex', flexDirection: 'column', alignItems: 'center', ...style }}>{children}</div>
);
const Note: React.FC<{ children: React.ReactNode; delay: number; style?: React.CSSProperties }> = ({ children, delay, style }) => (
  <Rise delay={delay} dist={14} style={{ fontSize: 28, color: '#86868b', fontWeight: 500, ...style }}>{children}</Rise>
);

/* -------------------------------------------------------------- 0:00 – 0:10 */
const Problem: React.FC = () => {
  const t = useT();
  const frame = useFrame();
  const at = [2.3, 4.0, 5.6];
  const shrink = interpolate(frame, [f(2.0), f(2.7)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
  // the three lines are struck through while still fully visible, and only then fade away
  const out = interpolate(frame, [f(8.0), f(8.5)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
  return (
    <Stage>
      <Cam dur={300} to={1.06}>
        <Center top={70} style={{ opacity: fade(frame, 0, 24) }}><Wordmark size={40} /></Center>
        <Center top={400} style={{ opacity: (1 - shrink * 0.62) * (1 - out), translate: `0 ${-shrink * 250}px`, scale: 1 - shrink * 0.5 }}>
          <Reveal text={t.l1} size={116} from={8} />
          <Reveal text={t.l2} size={116} from={20} color="#86868b" />
        </Center>
        <Center top={470} style={{ gap: 26, opacity: 1 - out }}>
          {t.items.map((label, i) => {
            const a = interpolate(frame, [f(at[i]), f(at[i]) + 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
            const s0 = f(6.4) + i * 9;
            const strike = interpolate(frame, [s0, s0 + 16], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.5, 0, 0.2, 1) });
            return (
              <div key={i} style={{ fontSize: 82, fontWeight: 650, letterSpacing: '-0.035em', opacity: a * (1 - strike * 0.35), translate: `0 ${(1 - a) * 30}px`, position: 'relative'}}>
                {label}
                <span style={{ position: 'absolute', left: -10, top: '56%', height: 8, width: `calc(${strike * 100}% + ${strike * 20}px)`, background: '#f5f5f7', borderRadius: 8 }} />
              </div>
            );
          })}
        </Center>
        <Center top={380}><Reveal text={t.gone} size={250} from={f(8.3)} /></Center>
      </Cam>
    </Stage>
  );
};

/* ---------------------------------------------------- 0:10 – 0:18 playground */
const Playground: React.FC = () => {
  const frame = useFrame();
  const t = useT();
  const l = useContext(LangCtx);
  const clip = useClip();
  const PG = (l === 'es' ? PGES : PGEN).frames / 2;
  const k = interpolate(frame, [4, 34], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
  return (
    <Stage>
      <Cam dur={240} to={1.035}>
        <Center top={52}><Reveal text={t.plain} size={66} from={2} /></Center>
        <div style={{ position: 'absolute', left: 160, top: 170, width: 1600, height: 900, opacity: k, translate: `0 ${(1 - k) * 90}px`, scale: 0.93 + k * 0.07 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: 28, overflow: 'hidden', border: '1px solid rgba(255,255,255,.16)', boxShadow: '0 80px 150px rgba(0,0,0,.7)' }}>
            <Video src={clip('playground')} playbackRate={PG / 228} muted style={{ width: '100%', height: '100%', objectFit: 'cover', transformOrigin: '78% 24%', scale: interpolate(frame, [168, 202], [1, 1.55], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease }) }} />
          </div>
        </div>
      </Cam>
    </Stage>
  );
};

/* --------------------------------------------------------- 0:18 – 0:38 ways */
const WayTitle: React.FC<{ n: string; label: string; sub: string }> = ({ n, label, sub }) => {
  const t = useT();
  return (
    <Center top={40}>
      <Rise dist={14} style={{ fontSize: 30, fontWeight: 600, color: '#86868b', letterSpacing: '0.01em' }}>{t.of(n)}</Rise>
      <Reveal text={label} size={92} from={2} />
      <Rise delay={14} dist={16} style={{ fontSize: 36, color: '#86868b', marginTop: 8, fontWeight: 500 }}>{sub}</Rise>
    </Center>
  );
};

const Generator: React.FC = () => {
  const t = useT(); const S = useS();
  return (
    <Stage>
      <Cam dur={200}>
        <WayTitle n="1" label={t.gen} sub={t.genSub} />
        <Rise delay={8} style={{ position: 'absolute', left: 90, top: 280 }}>
          <Win title="YourGame.csproj" width={870} height={410}><Typed code={S.GEN_CSPROJ} lang="xml" from={14} cps={150} size={22} pad={26} /></Win>
        </Rise>
        <Rise delay={16} style={{ position: 'absolute', left: 90, top: 730 }}>
          <Win title="Terminal" width={870} height={118}><Typed code={'$ dotnet build'} lang="bash" from={56} cps={20} size={28} pad={22} /></Win>
        </Rise>
        <Note delay={64} style={{ position: 'absolute', left: 90, top: 868, width: 870 }}>{t.genNote}</Note>
        <Rise delay={24} style={{ position: 'absolute', right: 70, top: 280 }}>
          <Win title="Triangle.g.cs" width={880} height={620}><Typed code={S.GEN_OUTPUT} from={72} cps={240} size={22} pad={26} /></Win>
        </Rise>
      </Cam>
    </Stage>
  );
};

const Cli: React.FC = () => {
  const t = useT(); const S = useS();
  return (
    <Stage>
      <Cam dur={200}>
        <WayTitle n="2" label={t.cli} sub={t.cliSub} />
        <Rise delay={8} style={{ position: 'absolute', left: 210, top: 320 }}>
          <Win title="Terminal" width={1500} height={390}><Typed code={'$ ' + S.CLI_SNIPPET} lang="bash" from={14} cps={50} size={44} pad={44} /></Win>
        </Rise>
        <Center top={760}><Note delay={70} style={{ fontSize: 36 }}>{t.cliNote}</Note></Center>
      </Cam>
    </Stage>
  );
};

const Library: React.FC = () => {
  const t = useT(); const S = useS();
  return (
    <Stage>
      <Cam dur={200}>
        <WayTitle n="3" label={t.lib} sub={t.libSub} />
        <Rise delay={8} style={{ position: 'absolute', left: 210, top: 270 }}>
          <Win title="Importer.cs" width={1500} height={650}><Typed code={S.LIB_SNIPPET} from={14} cps={140} size={32} pad={36} /></Win>
        </Rise>
      </Cam>
    </Stage>
  );
};

/* ---------------------------------------------------- 0:38 – 0:48 reflection */
const Reflection: React.FC = () => {
  const frame = useFrame();
  const t = useT(); const S = useS(); const clip = useClip();
  const clipIn = interpolate(frame, [136, 170], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
  const codeOut = interpolate(frame, [140, 172], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
  return (
    <Stage>
      <Cam dur={300}>
        <Center top={64} style={{ opacity: codeOut }}><Reveal text={t.refl} size={72} from={2} /></Center>
        <div style={{ opacity: codeOut, translate: `0 ${(1 - codeOut) * -30}px` }}>
          <Rise delay={8} style={{ position: 'absolute', left: 250, top: 170 }}>
            <Win title="Renderer.cs" width={1420} height={780}><Typed code={S.GEN_USE} from={14} cps={150} size={24} pad={26} /></Win>
          </Rise>
        </div>
        <div style={{ position: 'absolute', left: 150, top: 150, width: 1620, height: 840, opacity: clipIn, translate: `0 ${(1 - clipIn) * 70}px`, scale: 0.94 + clipIn * 0.06 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: 28, overflow: 'hidden', background: '#000', border: '1px solid rgba(255,255,255,.16)', boxShadow: '0 80px 150px rgba(0,0,0,.7)' }}>
            <Video src={clip('site-home')} trimBefore={120} playbackRate={115 / 150} muted style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
          </div>
        </div>
      </Cam>
    </Stage>
  );
};

/* ------------------------------------------------------------ 0:48 – 0:58 */
const SiteClip: React.FC<{ src: string; rate: number }> = ({ src, rate }) => {
  const clip = useClip();
  return (
    <div style={{ position: 'absolute', left: 130, top: 150, width: 1660, height: 880 }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: 28, overflow: 'hidden', border: '1px solid rgba(255,255,255,.16)', boxShadow: '0 80px 150px rgba(0,0,0,.7)' }}>
        <Video src={clip(src)} playbackRate={rate} muted style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
      </div>
    </div>
  );
};

const Outro: React.FC = () => {
  const frame = useFrame();
  const t = useT();
  const clip = (el: React.ReactNode, from: number, len: number) => (
    <Sequence from={X2(from)} durationInFrames={X2(len)} layout="none">
      <AbsoluteFill style={{ opacity: fade(frame - from, 0, 14, len - 12, len), scale: interpolate(frame - from, [0, len], [0.985, 1.03]) }}>{el}</AbsoluteFill>
    </Sequence>
  );
  return (
    <Stage>
      {clip(<SiteClip src="site-docs" rate={170 / 95} />, 0, 95)}
      {clip(<SiteClip src="site-sponsors" rate={140 / 85} />, 95, 88)}
      <Sequence from={X2(180)} durationInFrames={X2(120)} layout="none">
        <Cam dur={120} to={1.05}>
          <Center top={250}>
            <Rise dist={30}><Wordmark size={104} /></Rise>
            <div style={{ height: 40 }} />
            <Reveal text={t.out} size={128} from={8} />
            <Rise delay={34} dist={24} style={{ marginTop: 56, fontSize: 40, fontWeight: 500, color: '#2997ff' }}>{t.try}</Rise>
            <Rise delay={46} dist={16} style={{ marginTop: 22, fontSize: 32, fontFamily: MONO, color: '#f5f5f7' }}>github.com/KMemphis/YotsubaShader</Rise>
            <Rise delay={58} dist={12} style={{ marginTop: 40, fontSize: 26, color: '#86868b' }}>{t.lic}</Rise>
          </Center>
        </Cam>
      </Sequence>
    </Stage>
  );
};

/* ------------------------------------------------------------ the animated part */
const Content: React.FC<{ dissolve: number }> = ({ dissolve }) => {
  const frame = useFrame();
  const local = frame * 2;
  const t = useT();
  const scene = (from: number, len: number, el: React.ReactNode) => (
    <Sequence from={X2(from)} durationInFrames={X2(len)} layout="none">
      <AbsoluteFill style={{ opacity: fade(frame - from, 0, 10, len - 8, len) }}>{el}</AbsoluteFill>
    </Sequence>
  );
  const third = Math.round(f(20) / 3);
  // One continuous note for the whole stretch that shows concept code (not repeated per scene).
  const noteOpacity = interpolate(frame, [f(18) + 14, f(18) + 34, f(42.7), f(43.4)], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: '#000', opacity: dissolve ? interpolate(local, [0, dissolve], [0, 1], { extrapolateRight: 'clamp' }) : 1 }}>
      {scene(0, f(10), <Problem />)}
      {scene(f(10), f(8), <Playground />)}
      {scene(f(18), third + 1, <Generator />)}
      {scene(f(18) + third, third + 1, <Cli />)}
      {scene(f(18) + 2 * third, f(20) - 2 * third, <Library />)}
      {scene(f(38), f(10), <Reflection />)}
      {scene(f(48), f(10), <Outro />)}
      <div style={{ opacity: noteOpacity }}><Footnote>{t.concept}</Footnote></div>
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- compositions */
export type PromoProps = { lang: Lang; intro: boolean };

export const Promo: React.FC<PromoProps> = ({ lang, intro }) => {
  const offset = intro ? INTRO_FRAMES - OVERLAP : 0;
  const total = offset + CONTENT_FRAMES;
  const hasIntro = getStaticFiles().some((x) => x.name.endsWith('intro_4k60.mp4'));
  return (
    <LangCtx.Provider value={lang}>
      <AbsoluteFill style={{ background: '#000' }}>
        {intro && hasIntro ? (
          <Sequence from={0} durationInFrames={INTRO_FRAMES} layout="none">
            <Video src={staticFile('intro/intro_4k60.mp4')} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <Audio src={staticFile('intro/intro.wav')} volume={(fr) => interpolate(fr, [INTRO_FRAMES - 8, INTRO_FRAMES - 1], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} />
          </Sequence>
        ) : null}
        <Sequence from={offset} durationInFrames={CONTENT_FRAMES} layout="none">
          <Content dissolve={intro ? OVERLAP : 0} />
        </Sequence>
        {/* A quiet bed under everything; lower while the presenter speaks. No narration here: the voice-over is recorded separately. */}
        <Audio src={staticFile('music.wav')} loop volume={(fr) => (intro ? interpolate(fr, [0, 90, offset, offset + 120, total - 180, total], [0, 0.07, 0.07, 0.2, 0.2, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : interpolate(fr, [0, 90, total - 180, total], [0, 0.2, 0.2, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }))} />
      </AbsoluteFill>
    </LangCtx.Provider>
  );
};

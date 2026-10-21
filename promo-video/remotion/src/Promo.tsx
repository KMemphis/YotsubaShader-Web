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

export const INTRO_FRAMES = 272;
export const OVERLAP = 12;
export const CONTENT_FRAMES = 106 * 60; // 106 seconds at 60 fps matching audio (105.16s + clean tail)

/* ------------------------------------------------------------------- texts */
const TXT = {
  en: {
    l1: 'Shaders in a C# engine', l2: 'are always a headache.',
    items: ['Native C++ dependencies', 'Calling C/C++ to transpile', 'Duplicated types (CPU vs GPU)'], gone: 'Gone.',
    mapTitle: "Map your engine's own types", mapSub: 'Native GPU types with simple attributes',
    mapEq: '1:1 GPU Equivalence', mapZero: 'Zero marshalling · Zero data duplication',
    pipeTitle: 'Graphics & Compute in C#', pipeSub: 'At development time, right in your IDE',
    gen: 'Source generator', genSub: 'Compiles to binary SPIR-V at build time',
    cli: 'Command line tool', cliSub: 'For asset pipelines and CI/CD',
    cross: 'YotsubaShaderCross', crossSub: '1:1 SPIRV-Cross in pure C# · Zero C++ dependencies',
    out: 'The shader toolchain for C# engine developers.', try: 'Try the Playground', lic: 'Free and open source · MS-PL License',
    concept: 'Concept illustration. Not a live recording.',
  },
  es: {
    l1: 'Los shaders en un motor de C#', l2: 'siempre son un dolor de cabeza.',
    items: ['Dependencias nativas', 'Librerías C/C++ para transpilar', 'Tipos duplicados (CPU vs GPU)'], gone: 'Se acabó.',
    mapTitle: 'Mapea los tipos de tu motor', mapSub: 'Tipos nativos de GPU con simples atributos',
    mapEq: 'Equivalencia 1:1 en GPU', mapZero: 'Cero marshalling · Sin duplicar datos',
    pipeTitle: 'Graphics y Compute en C#', pipeSub: 'En tiempo de desarrollo, en tu mismo IDE',
    gen: 'Generador de código', genSub: 'Compila a SPIR-V binario al compilar',
    cli: 'Línea de comandos', cliSub: 'Para pipelines de contenido y CI/CD',
    cross: 'YotsubaShaderCross', crossSub: 'Transpilación 1 a 1 de SPIRV-Cross en C# puro · Sin C++',
    out: 'El pipeline de shaders para motores en C#.', try: 'Prueba el Playground', lic: 'Gratis y de código abierto · Licencia MS-PL',
    concept: 'Ilustración conceptual. No es una grabación real.',
  },
};

const LangCtx = createContext<Lang>('es');
const useT = () => TXT[useContext(LangCtx)];
const useS = () => (useContext(LangCtx) === 'es' ? SES : SEN);
const sfx = (l: Lang) => (l === 'es' ? '-es' : '');
const useClip = () => { const l = useContext(LangCtx); return (n: string) => staticFile(`${n}${sfx(l)}.mp4`); };

const Rise: React.FC<{ children: React.ReactNode; delay?: number; dist?: number; style?: React.CSSProperties }> = ({ children, delay = 0, dist = 60, style }) => {
  const frame = useFrame();
  const t = interpolate(frame, [delay, delay + 28], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
  return <div style={{ opacity: t, translate: `0 ${(1 - t) * dist}px`, scale: 0.96 + t * 0.04, ...style }}>{children}</div>;
};

const Center: React.FC<{ children: React.ReactNode; top: number; style?: React.CSSProperties }> = ({ children, top, style }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, top, display: 'flex', flexDirection: 'column', alignItems: 'center', ...style }}>{children}</div>
);

/* ------------------------------------------------ 0:00 – 0:17.2 scene 1: Problem */
const Problem: React.FC = () => {
  const t = useT();
  const frame = useFrame();
  const at = [6.0, 9.2, 13.0];
  const shrink = interpolate(frame, [f(4.8), f(5.6)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
  const out = interpolate(frame, [f(16.6), f(17.1)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
  return (
    <Stage>
      <Cam dur={f(17.2)} to={1.06}>
        <Center top={60} style={{ opacity: fade(frame, 0, 24) }}><Wordmark size={44} /></Center>
        <Center top={380} style={{ opacity: (1 - shrink * 0.62) * (1 - out), translate: `0 ${-shrink * 240}px`, scale: 1 - shrink * 0.45 }}>
          <Reveal text={t.l1} size={110} from={8} />
          <Reveal text={t.l2} size={110} from={24} color="#86868b" />
        </Center>
        <Center top={460} style={{ gap: 26, opacity: 1 - out }}>
          {t.items.map((label, i) => {
            const a = interpolate(frame, [f(at[i]), f(at[i]) + 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
            const s0 = f(15.5) + i * 4;
            const strike = interpolate(frame, [s0, s0 + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.5, 0, 0.2, 1) });
            return (
              <div key={i} style={{ fontSize: 72, fontWeight: 650, letterSpacing: '-0.03em', opacity: a * (1 - strike * 0.35), translate: `0 ${(1 - a) * 30}px`, position: 'relative' }}>
                {label}
                <span style={{ position: 'absolute', left: -10, top: '56%', height: 8, width: `calc(${strike * 100}% + ${strike * 20}px)`, background: '#f5f5f7', borderRadius: 8 }} />
              </div>
            );
          })}
        </Center>
        <Center top={360}><Reveal text={t.gone} size={250} from={f(16.0)} /></Center>
      </Cam>
    </Stage>
  );
};

/* ------------------------------------------- 0:17.2 – 0:39.1 scene 2: TypeMapping */
const TypeMapping: React.FC = () => {
  const t = useT();
  const S = useS();
  const frame = useFrame();
  const cardIn = interpolate(frame, [f(7.5), f(9.0)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
  return (
    <Stage>
      <Cam dur={f(21.9)}>
        <Center top={36}>
          <Reveal text={t.mapTitle} size={76} from={2} />
          <Rise delay={12} dist={14} style={{ fontSize: 32, color: '#86868b', marginTop: 6, fontWeight: 500 }}>{t.mapSub}</Rise>
        </Center>
        <Rise delay={6} style={{ position: 'absolute', left: 80, top: 175 }}>
          <Win title="MyEngine/Vector2.cs" width={860} height={780}>
            <Typed code={S.MAP_VECTOR} from={8} cps={90} size={25} pad={30} />
          </Win>
        </Rise>
        <div style={{ position: 'absolute', left: 980, top: 175, width: 860, height: 780, opacity: cardIn, translate: `0 ${(1 - cardIn) * 50}px`, scale: 0.95 + cardIn * 0.05 }}>
          <div style={{ height: '100%', borderRadius: 24, background: '#101012', border: '1px solid rgba(255,255,255,.14)', boxShadow: '0 50px 110px rgba(0,0,0,.6)', padding: 40, display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#6bdfff', letterSpacing: '-0.02em' }}>{t.mapEq}</div>
            <div style={{ fontSize: 22, color: '#86868b', marginTop: 6, marginBottom: 30 }}>{t.mapZero}</div>
            {[
              { from: 'MyEngine.Vector2', to: 'OpTypeVector %float 2', tag: 'SPIR-V' },
              { from: 'MyEngine.Vector2', to: 'float2', tag: 'HLSL' },
              { from: 'MyEngine.Vector2', to: 'vec2', tag: 'GLSL / GL450' },
              { from: 'Gl450.Dot(uv, light)', to: 'dot(a, b)', tag: 'GPU Math' },
            ].map((row, i) => {
              const rIn = interpolate(frame, [f(9.5) + i * 16, f(9.5) + i * 16 + 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 16, marginBottom: 16, opacity: rIn, translate: `0 ${(1 - rIn) * 20}px` }}>
                  <span style={{ fontFamily: MONO, fontSize: 24, color: '#f5f5f7' }}>{row.from}</span>
                  <span style={{ color: '#86868b', fontSize: 26, margin: '0 12px' }}>→</span>
                  <span style={{ fontFamily: MONO, fontSize: 24, color: '#7fe3a8', fontWeight: 600 }}>{row.to}</span>
                  <span style={{ fontSize: 16, color: '#ffa14f', background: 'rgba(255,161,79,.12)', padding: '4px 10px', borderRadius: 8, marginLeft: 16, fontWeight: 600 }}>{row.tag}</span>
                </div>
              );
            })}
            <div style={{ marginTop: 'auto', padding: '16px 20px', background: 'rgba(41,151,255,.08)', border: '1px solid rgba(41,151,255,.2)', borderRadius: 14, color: '#86c2ff', fontSize: 20, textAlign: 'center' }}>
              Works across [Uniform], [Location], [StorageBuffer] &amp; Entry Points
            </div>
          </div>
        </div>
      </Cam>
    </Stage>
  );
};

/* --------------------------------------------- 0:39.1 – 0:49.3 scene 3: Pipelines */
const Pipelines: React.FC = () => {
  const frame = useFrame();
  const t = useT();
  const l = useContext(LangCtx);
  const clip = useClip();
  const PG = (l === 'es' ? PGES : PGEN).frames / 2;
  const k = interpolate(frame, [4, 28], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
  return (
    <Stage>
      <Cam dur={f(10.2)} to={1.035}>
        <Center top={40}>
          <Reveal text={t.pipeTitle} size={74} from={2} />
          <Rise delay={12} dist={14} style={{ fontSize: 32, color: '#86868b', marginTop: 6, fontWeight: 500 }}>{t.pipeSub}</Rise>
        </Center>
        <div style={{ position: 'absolute', left: 160, top: 175, width: 1600, height: 830, opacity: k, translate: `0 ${(1 - k) * 70}px`, scale: 0.94 + k * 0.06 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: 28, overflow: 'hidden', border: '1px solid rgba(255,255,255,.16)', boxShadow: '0 80px 150px rgba(0,0,0,.7)' }}>
            <Video src={clip('playground')} playbackRate={PG / f(9.8)} muted style={{ width: '100%', height: '100%', objectFit: 'cover', transformOrigin: '78% 24%', scale: interpolate(frame, [f(6.0), f(8.5)], [1, 1.4], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease }) }} />
          </div>
        </div>
      </Cam>
    </Stage>
  );
};

/* --------------------------------------------- 0:49.3 – 0:64.2 scene 4: Generator */
const Generator: React.FC = () => {
  const t = useT();
  const S = useS();
  return (
    <Stage>
      <Cam dur={f(14.9)}>
        <Center top={36}>
          <Reveal text={t.gen} size={74} from={2} />
          <Rise delay={10} dist={14} style={{ fontSize: 32, color: '#86868b', marginTop: 6, fontWeight: 500 }}>{t.genSub}</Rise>
        </Center>
        <Rise delay={6} style={{ position: 'absolute', left: 80, top: 175 }}>
          <Win title="Terminal" width={820} height={350}>
            <Typed code={'$ dotnet build\n\n  Scanning shaders in project...\n  Building YourGame -> bin/Debug/YourGame.dll\n  Build succeeded. 0 Warning(s), 0 Error(s).'} lang="bash" from={12} cps={45} size={23} pad={24} />
          </Win>
        </Rise>
        <Rise delay={30} style={{ position: 'absolute', left: 80, top: 560 }}>
          <Win title="Renderer.cs" width={820} height={395}>
            <Typed code={S.GEN_USE} from={42} cps={90} size={23} pad={24} />
          </Win>
        </Rise>
        <Rise delay={14} style={{ position: 'absolute', right: 80, top: 175 }}>
          <Win title="LitShader.g.cs (Autogenerated)" width={880} height={780}>
            <Typed code={S.GEN_OUTPUT} from={20} cps={160} size={22} pad={26} />
          </Win>
        </Rise>
      </Cam>
    </Stage>
  );
};

/* --------------------------------------------------- 0:64.2 – 0:74.6 scene 5: Cli */
const Cli: React.FC = () => {
  const t = useT();
  const S = useS();
  return (
    <Stage>
      <Cam dur={f(10.4)}>
        <Center top={40}>
          <Reveal text={t.cli} size={76} from={2} />
          <Rise delay={12} dist={14} style={{ fontSize: 32, color: '#86868b', marginTop: 6, fontWeight: 500 }}>{t.cliSub}</Rise>
        </Center>
        <Rise delay={6} style={{ position: 'absolute', left: 160, top: 210 }}>
          <Win title="Terminal" width={1600} height={680}>
            <Typed code={'$ ' + S.CLI_SNIPPET + '\n\n  Scanning project...\n  ✓ Discovered 12 shaders in EngineShaders.csproj\n  ✓ Compiled to bin/shaders/*.spv in 34ms\n  Done.'} lang="bash" from={10} cps={70} size={36} pad={40} />
          </Win>
        </Rise>
      </Cam>
    </Stage>
  );
};

/* ------------------------------------------------- 0:74.6 – 0:94.5 scene 6: Cross */
const Cross: React.FC = () => {
  const t = useT();
  const S = useS();
  const frame = useFrame();
  const cardIn = interpolate(frame, [f(8.0), f(9.5)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
  return (
    <Stage>
      <Cam dur={f(19.9)}>
        <Center top={36}>
          <Reveal text={t.cross} size={76} from={2} />
          <Rise delay={12} dist={14} style={{ fontSize: 32, color: '#86868b', marginTop: 6, fontWeight: 500 }}>{t.crossSub}</Rise>
        </Center>
        <Rise delay={6} style={{ position: 'absolute', left: 90, top: 180 }}>
          <Win title="EngineRenderer.cs" width={980} height={780}>
            <Typed code={S.CROSS_SNIPPET} from={12} cps={65} size={23} pad={28} />
          </Win>
        </Rise>
        <div style={{ position: 'absolute', left: 1110, top: 180, width: 720, height: 780, opacity: cardIn, translate: `0 ${(1 - cardIn) * 50}px`, scale: 0.95 + cardIn * 0.05 }}>
          <div style={{ height: '100%', borderRadius: 24, background: '#101012', border: '1px solid rgba(255,255,255,.14)', boxShadow: '0 50px 110px rgba(0,0,0,.6)', padding: 44, display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#ffa14f', textTransform: 'uppercase', letterSpacing: '0.08em' }}>NuGet Package</div>
            <div style={{ fontSize: 44, fontWeight: 800, color: '#f5f5f7', marginTop: 8, letterSpacing: '-0.03em' }}>YotsubaShaderCross</div>
            <div style={{ fontSize: 24, color: '#7fe3a8', marginTop: 12, fontWeight: 600 }}>1:1 Managed C# Port of SPIRV-Cross</div>
            <div style={{ height: 2, background: 'rgba(255,255,255,.08)', margin: '28px 0' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {['Pure .NET 8 (No unmanaged code)', 'Zero native .dll, .dylib, or .so', 'Target HLSL, Metal, GLSL & GLSL ES', 'Transpile at runtime or in build pipelines'].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ color: '#28c840', fontSize: 24, fontWeight: 800 }}>✓</span>
                  <span style={{ fontSize: 22, color: '#d1d1d6', fontWeight: 500 }}>{item}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 'auto', padding: '16px 20px', background: 'rgba(107,223,255,.08)', border: '1px solid rgba(107,223,255,.2)', borderRadius: 14, color: '#6bdfff', fontSize: 20, textAlign: 'center' }}>
              Works everywhere .NET runs
            </div>
          </div>
        </div>
      </Cam>
    </Stage>
  );
};

/* ------------------------------------------------- 0:94.5 – 1:46.0 scene 7: Outro */
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
      <AbsoluteFill style={{ opacity: fade(frame - from, 0, 10, len - 10, len), scale: interpolate(frame - from, [0, len], [0.985, 1.03]) }}>{el}</AbsoluteFill>
    </Sequence>
  );
  return (
    <Stage>
      {clip(<SiteClip src="site-docs" rate={170 / f(2.5)} />, 0, f(2.5))}
      {clip(<SiteClip src="site-sponsors" rate={140 / f(3.0)} />, f(2.5), f(3.0))}
      <Sequence from={X2(f(5.5))} durationInFrames={X2(f(6.0))} layout="none">
        <Cam dur={f(6.0)} to={1.05}>
          <Center top={230}>
            <Rise dist={30}><Wordmark size={104} /></Rise>
            <div style={{ height: 40 }} />
            <Reveal text={t.out} size={64} from={6} maxWidth={1400} />
            <Rise delay={26} dist={24} style={{ marginTop: 46, fontSize: 38, fontWeight: 500, color: '#2997ff' }}>{t.try}</Rise>
            <Rise delay={36} dist={16} style={{ marginTop: 20, fontSize: 30, fontFamily: MONO, color: '#f5f5f7' }}>github.com/KMemphis/YotsubaShader</Rise>
            <Rise delay={46} dist={12} style={{ marginTop: 36, fontSize: 24, color: '#86868b' }}>{t.lic}</Rise>
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
      <AbsoluteFill style={{ opacity: fade(frame - from, 0, 8, len - 8, len) }}>{el}</AbsoluteFill>
    </Sequence>
  );
  return (
    <AbsoluteFill style={{ background: '#000', opacity: dissolve ? interpolate(local, [0, dissolve], [0, 1], { extrapolateRight: 'clamp' }) : 1 }}>
      {scene(0, f(17.2), <Problem />)}
      {scene(f(17.2), f(21.9), <TypeMapping />)}
      {scene(f(39.1), f(10.2), <Pipelines />)}
      {scene(f(49.3), f(14.9), <Generator />)}
      {scene(f(64.2), f(10.4), <Cli />)}
      {scene(f(74.6), f(19.9), <Cross />)}
      {scene(f(94.5), f(11.5), <Outro />)}
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- compositions */
export type PromoProps = { lang: Lang; intro: boolean };

export const Promo: React.FC<PromoProps> = ({ lang, intro }) => {
  const offset = intro ? INTRO_FRAMES - OVERLAP : 0;
  return (
    <LangCtx.Provider value={lang}>
      <AbsoluteFill style={{ background: '#000' }}>
        <Sequence from={offset} durationInFrames={CONTENT_FRAMES} layout="none">
          <Content dissolve={intro ? OVERLAP : 0} />
        </Sequence>
        {/* Pista de voz sincronizada; se silencia la musica */}
        <Audio src={staticFile('voice.wav')} />
      </AbsoluteFill>
    </LangCtx.Provider>
  );
};

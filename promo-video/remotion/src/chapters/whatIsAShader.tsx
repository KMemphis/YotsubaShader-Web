import React from 'react';
import { Img, staticFile } from 'remotion';
import { Big, Code, Ctx, Fade, Kicker, MONO, P, SceneDef, lin, mix, ramp, useT } from './core';

/* Chapter 1 · What is a shader?  (English and Spanish share these scenes.)
   Only website/logo colours; tutorial images first; every visual hangs on the sentence of the narration. */

const photo = (n: string) => staticFile(`chapters/photos/${n}`);
const rel = (c: Ctx, n: number) => c.bs(n) - c.t0;
const S = (c: Ctx, n: number, k: number) => (c.sent(n)[Math.min(k, c.sent(n).length - 1)]?.start ?? c.bs(n)) - c.t0;
const W = (c: Ctx, n: number, k: number, f: number) => { const s = c.sent(n)[Math.min(k, c.sent(n).length - 1)]; return (s ? s.start + f * (s.end - s.start) : c.bs(n)) - c.t0; };
const F = (c: Ctx, n: number, f: number) => c.bs(n) + f * (c.be(n) - c.bs(n)) - c.t0;
const X = (c: Ctx) => (en: string, es: string) => (c.lang === 'es' ? es : en);

const Pad: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ position: 'absolute', left: 150, right: 150, top: 120, bottom: 190, ...style }}>{children}</div>
);

/** Flat shapes that keep moving, slowly. */
const MovingArt: React.FC<{ a: string; b: string; d: string }> = ({ a, b, d }) => {
  const t = useT();
  return (
    <div style={{ position: 'absolute', right: 0, top: 0, width: 760, height: 900, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 120, top: 150 + Math.sin(t * 0.6) * 24, width: 560, height: 560, borderRadius: '50%', background: a }} />
      <div style={{ position: 'absolute', left: 260 + Math.cos(t * 0.5) * 18, top: 420, width: 400, height: 400, background: b, transform: `rotate(${t * 4}deg)` }} />
      <div style={{ position: 'absolute', left: 20 + Math.sin(t * 0.4) * 30, top: 460, width: 520, height: 260, borderRadius: '260px 260px 0 0', background: d }} />
    </div>
  );
};

const Cells: React.FC<{ n: number; x: number; y: number; size: number; gap: number; lit: (i: number) => number; color: string }> = ({ n, x, y, size, gap, lit, color }) => (
  <div style={{ position: 'absolute', left: x, top: y, display: 'grid', gridTemplateColumns: `repeat(${n}, ${size}px)`, gap }}>
    {Array.from({ length: n }, (_, i) => <div key={i} style={{ width: size, height: size, borderRadius: 6, background: mix(P.raised, color, lit(i)) }} />)}
  </div>
);

const PixelGrid: React.FC<{ cols: number; rows: number; size: number; x: number; y: number; color: (u: number, v: number) => string }> = ({ cols, rows, size, x, y, color }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: cols * size, height: rows * size, display: 'grid', gridTemplateColumns: `repeat(${cols}, ${size}px)` }}>
    {Array.from({ length: cols * rows }, (_, k) => {
      const i = k % cols, j = Math.floor(k / cols);
      return <div key={k} style={{ width: size, height: size, background: color(i / (cols - 1), j / (rows - 1)), boxShadow: `inset 0 0 0 1px ${P.bg}` }} />;
    })}
  </div>
);

const FadeImg: React.FC<{ src: string; p: number }> = ({ src, p }) => {
  const t = useT();
  return <Img src={src} style={{ width: 1620, height: 760, objectFit: 'contain', transform: `scale(${1 + 0.04 * p})`, opacity: ramp(t, 0.3, 1.1) }} />;
};
const ImageScene = (from: number, to: number, file: string): SceneDef => ({
  from, to, light: true, lead: 0.5, tail: 0.5,
  render: (c) => (
    <div style={{ position: 'absolute', inset: 0, background: P.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: 190 }}>
      <FadeImg src={staticFile(`chapters/assets/get-started/${c.lang === 'es' ? '' : 'en/'}${file}`)} p={c.p} />
    </div>
  ),
});

const Section = (from: number, color: string, label: [string, string], title: [string, string], number?: string): SceneDef => ({
  from, to: from, lead: 0.6, tail: 1.4, field: true,
  render: (c) => {
    const t = useT();
    const x = X(c);
    const ttl = x(...title);
    return (
      <div style={{ position: 'absolute', inset: 0, background: color, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -160 + Math.sin(t * 0.7) * 30, top: 120 + Math.cos(t * 0.5) * 30, width: 720, height: 720, borderRadius: '50%', background: P.bg, opacity: 0.1 }} />
        <Pad style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Fade at={0.5}><Kicker color={P.bg} style={{ opacity: 0.7, fontSize: 34 }}>{x(...label)}</Kicker></Fade>
          <Fade at={0.7}><Big color={P.bg} size={ttl.length > 46 ? 88 : ttl.length > 30 ? 104 : 132} style={{ marginTop: 20, maxWidth: 1450 }}>{ttl}</Big></Fade>
        </Pad>
        {number ? <div style={{ position: 'absolute', right: 150, bottom: 200, fontSize: 420, fontWeight: 700, letterSpacing: '-0.06em', color: P.bg, opacity: 0.12, lineHeight: 0.8 }}>{number}</div> : null}
      </div>
    );
  },
});

const LOOP_EN = `int[] entities = [1, 2, 3, 4, 5];

for (int index = 0; index < entities.Length; index++)
{
    entities[index] = entities[index] * 2; // example logic
}`;
const LOOP_ES = `int[] entidades = [1, 2, 3, 4, 5];

for (int indice = 0; indice < entidades.Length; indice++)
{
    entidades[indice] = entidades[indice] * 2; // lógica de ejemplo
}`;
const PARALLEL_EN = `int[] entities = [1, 2, 3, 4, 5];

// Each index can be processed by a different core, and they all run at the same time
Parallel.For(0, entities.Length, index =>
{
    RandomOperation(index);
});

// The RandomOperation function
void RandomOperation(int index)
{
    entities[index] = entities[index] * 2; // example logic
}`;
const PARALLEL_ES = `int[] entidades = [1, 2, 3, 4, 5];

// Cada índice lo puede procesar un núcleo distinto, y todos corren al mismo tiempo
Parallel.For(0, entidades.Length, indice =>
{
    RandomOperation(indice);
});

// Función RandomOperation
void RandomOperation(int indice)
{
    entidades[indice] = entidades[indice] * 2; // lógica de ejemplo
}`;

export const scenes: SceneDef[] = [
  // 1 · title
  {
    from: 1, to: 1, lead: 0.4, tail: 0.6,
    render: (c) => {
      const x = X(c);
      return (
        <>
          <MovingArt a={P.pink} b={P.mint} d={P.violet} />
          <Pad style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', right: 800 }}>
            <Fade at={0.3}><Kicker color={P.pink}>{x('Get started · Chapter 1', 'Primeros pasos · Capítulo 1')}</Kicker></Fade>
            <Fade at={0.5}><Big size={150} style={{ marginTop: 24 }}>{x('What is a shader?', '¿Qué es un shader?')}</Big></Fade>
          </Pad>
          <div style={{ position: 'absolute', left: 150, top: 70, fontSize: 30, fontWeight: 600 }}><span>Yotsuba</span> <span style={{ color: P.dim }}>Shader</span></div>
        </>
      );
    },
  },
  // 2 · a function the GPU runs
  {
    from: 2, to: 2, lead: 0.4, tail: 0.5,
    render: (c) => {
      const t = useT();
      const x = X(c);
      const a = S(c, 2, 0);
      const flow = (i: number) => (((t - a - 0.8) * 0.5 + i / 4) % 1 + 1) % 1;
      const cols = 14, rows = 8, s = 30;
      return (
        <>
          <Fade at={a} style={{ position: 'absolute', left: 150, top: 110 }}><Kicker>{x('A shader, in one sentence', 'Un shader, en una frase')}</Kicker></Fade>
          <Fade at={a + 0.3} style={{ position: 'absolute', left: 150, top: 220, width: 560, background: P.raised, borderRadius: 14, padding: '30px 34px' }}>
            <div style={{ fontSize: 22, fontWeight: 600, color: P.dim }}>{x('Your code', 'Tu código')}</div>
            <pre style={{ margin: '14px 0 0', fontFamily: MONO, fontSize: 36, color: P.ink }}>{'result = '}<span style={{ color: P.pink }}>Shader</span>{'(x);'}</pre>
          </Fade>
          <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>
            <line x1={730} y1={330} x2={1040} y2={330} stroke={P.line} strokeWidth={4} />
            {[0, 1, 2, 3].map((i) => <circle key={i} cx={730 + 310 * flow(i)} cy={330} r={11} fill={P.pink} opacity={ramp(t, a + 1.2, a + 1.8)} />)}
          </svg>
          <Fade at={a + 1.6} style={{ position: 'absolute', left: 1080, top: 190, width: 690 }}>
            <div style={{ fontSize: 22, fontWeight: 600, color: P.dim }}>{x('Runs on the GPU', 'Se ejecuta en la GPU')}</div>
            <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: `repeat(${cols}, ${s}px)`, gap: 14 }}>
              {Array.from({ length: cols * rows }, (_, k) => {
                const w = 0.5 + 0.5 * Math.sin(t * 3 + (k % cols) * 0.5 + Math.floor(k / cols) * 0.7);
                return <div key={k} style={{ width: s, height: s, borderRadius: 5, background: mix(P.raised, P.mint, 0.2 + 0.8 * w * w) }} />;
              })}
            </div>
          </Fade>
          <Fade at={a + 3.2} style={{ position: 'absolute', left: 150, top: 690, fontSize: 64, fontWeight: 700, letterSpacing: '-0.03em', maxWidth: 1500 }}>
            {x('A function the GPU runs.', 'Una función que ejecuta la GPU.')}
          </Fade>
        </>
      );
    },
  },
  // 3-5 · the graphics card
  {
    from: 3, to: 5, light: true,
    render: (c) => {
      const t = useT();
      const x = X(c);
      const inset = S(c, 3, 1);
      return (
        <>
          <div style={{ position: 'absolute', right: 0, top: 0, width: 1160, height: 930, overflow: 'hidden' }}>
            <Img src={photo('gpu.jpg')} style={{ width: 1160, height: 'auto', position: 'absolute', top: 40, transform: `scale(${1 + 0.06 * c.p})`, transformOrigin: '60% 50%' }} />
          </div>
          <Pad style={{ right: 1100, display: 'flex', flexDirection: 'column', justifyContent: 'center', bottom: 360 }}>
            <Fade at={0.5}><Kicker color={P.paperDim}>{x('The GPU', 'La GPU')}</Kicker></Fade>
            <Fade at={0.7}><Big color={P.paperInk} size={96} style={{ marginTop: 18 }}>{x("Your computer's graphics card.", 'La tarjeta gráfica de tu computador.')}</Big></Fade>
          </Pad>
          <Fade at={inset} style={{ position: 'absolute', left: 150, top: 640, display: 'flex', gap: 56 }}>
            <div>
              <div style={{ width: 210, height: 130, borderRadius: 12, background: P.paperInk, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 80, height: 80, borderRadius: 8, background: P.mint }} /></div>
              <div style={{ marginTop: 12, fontSize: 26, fontWeight: 600, color: P.paperInk }}>{x('A separate part', 'Una pieza aparte')}</div>
            </div>
            <Fade at={inset + 1.6}>
              <div style={{ width: 210, height: 130, borderRadius: 12, background: P.violet, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 90, height: 90, borderRadius: 8, background: P.paperInk, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 40, height: 40, borderRadius: 6, background: P.mint, opacity: 0.6 + 0.4 * Math.sin(t * 4) }} /></div></div>
              <div style={{ marginTop: 12, fontSize: 26, fontWeight: 600, color: P.paperInk }}>{x('Inside the processor', 'Dentro del procesador')}</div>
            </Fade>
          </Fade>
          <div style={{ position: 'absolute', left: 150, bottom: 200, fontSize: 19, color: P.paperDim }}>Palit GeForce RTX 5090 GameRock · PantheraLeo1359531 · Wikimedia Commons · CC BY 4.0</div>
        </>
      );
    },
  },
  // 6-7 · CPU stack vs GPU
  {
    from: 6, to: 7,
    render: (c) => {
      const x = X(c);
      const row = (label: string, color: string, at: number, ghost = false) => (
        <Fade at={at} style={{ marginBottom: 18 }}>
          <div style={{ height: 112, borderRadius: 10, display: 'flex', alignItems: 'center', padding: '0 34px', fontSize: 40, fontWeight: 600, background: ghost ? 'transparent' : color, color: ghost ? P.dim : P.bg, border: ghost ? `3px dashed ${P.line}` : 'none' }}>{label}</div>
        </Fade>
      );
      return (
        <Pad>
          <div style={{ display: 'flex', gap: 120 }}>
            <div style={{ width: 640 }}>
              <Fade at={S(c, 6, 0)}><Kicker>{x('On the CPU', 'En la CPU')}</Kicker></Fade>
              <div style={{ marginTop: 28 }}>
                {row(x('Your program', 'Tu programa'), P.mint, W(c, 6, 0, 0.12))}
                {row(x('Node, the runtime', 'Node, el entorno'), P.violet, W(c, 6, 0, 0.3))}
                {row(x('Operating system', 'Sistema operativo'), P.pink, W(c, 6, 0, 0.5))}
              </div>
            </div>
            <div style={{ width: 640 }}>
              <Fade at={S(c, 6, 1)}><Kicker>{x('On the GPU', 'En la GPU')}</Kicker></Fade>
              <div style={{ marginTop: 28 }}>
                {row(x('Your C# program', 'Tu programa en C#'), P.mint, W(c, 6, 1, 0.5))}
                {row(x('No runtime', 'Sin entorno'), P.line, S(c, 7, 1), true)}
                {row(x('No operating system', 'Sin sistema operativo'), P.line, W(c, 7, 1, 0.6), true)}
              </div>
            </div>
          </div>
        </Pad>
      );
    },
  },
  Section(8, P.pink, ['Examples', 'Ejemplos'], ['Things the GPU cannot do', 'Cosas que la GPU no puede hacer']),
  // 9-13 · what the GPU cannot do
  {
    from: 9, to: 13,
    render: (c) => {
      const t = useT();
      const x = X(c);
      const code = x('File.WriteAllText("file.txt", "hello");', 'File.WriteAllText("file.txt", "hola");');
      const n = Math.max(0, Math.min(code.length, (t - rel(c, 10)) * 22));
      const stamp = ramp(t, S(c, 11, 2), S(c, 11, 2) + 0.6);
      const list = ['string', 'List<T>', 'class Animal : Base', 'try { } catch { }'];
      const labels = [x('no strings', 'sin strings'), x('no lists', 'sin listas'), x('no inheritance', 'sin herencia'), x('no exceptions', 'sin excepciones')];
      const at = [F(c, 12, 0.1), F(c, 12, 0.3), F(c, 12, 0.5), F(c, 12, 0.82)];
      const l0 = rel(c, 12);
      const m0 = rel(c, 13);
      const maths: [string, string, string][] = [['+', x('adding', 'sumar'), P.pink], ['×', x('multiplying', 'multiplicar'), P.violet], ['<', x('comparing', 'comparar'), P.mint]];
      const mt = [W(c, 13, 2, 0.0), W(c, 13, 2, 0.36), W(c, 13, 2, 0.72)];
      return (
        <>
          <Fade at={0.3} out={l0 - 0.2} style={{ position: 'absolute', left: 150, top: 120 }}><Kicker>{x('On the CPU, this works', 'En la CPU, esto funciona')}</Kicker></Fade>
          <div style={{ opacity: 1 - ramp(t, l0 - 0.3, l0 + 0.2) }}>
            <Code code={`${code}\n// ${x('There is no file system on the GPU', 'No existe un sistema de archivos en la GPU')}`} title="C#" x={150} y={230} w={1620} fs={40} chars={n + (n >= code.length ? 80 : 0)} />
            <div style={{ position: 'absolute', left: 150, top: 540, width: 1620, display: 'flex', alignItems: 'center', gap: 28, opacity: stamp }}>
              <div style={{ fontSize: 120, color: P.pink, fontWeight: 700, lineHeight: 1 }}>✕</div>
              <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: '-0.03em' }}>{x('No disk on the GPU.', 'No hay disco en la GPU.')}</div>
            </div>
          </div>
          <div style={{ position: 'absolute', left: 150, top: 150, right: 150 }}>
            {list.map((s, i) => {
              const a = ramp(t, at[i], at[i] + 0.6);
              return (
                <div key={i} style={{ opacity: a * (1 - ramp(t, m0 - 0.3, m0 + 0.2)), display: 'flex', alignItems: 'center', gap: 36, height: 128, borderBottom: `2px solid ${P.line}` }}>
                  <div style={{ fontFamily: MONO, fontSize: 56, color: P.dim, textDecoration: 'line-through', textDecorationColor: P.pink, textDecorationThickness: 5 }}>{s}</div>
                  <div style={{ marginLeft: 'auto', fontSize: 30, color: P.pink, fontWeight: 600 }}>{labels[i]}</div>
                </div>
              );
            })}
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 190, textAlign: 'center', opacity: ramp(t, S(c, 13, 1), S(c, 13, 1) + 0.7) }}>
            <div style={{ fontSize: 40, fontWeight: 600, color: P.dim }}>{x('Math, and only math', 'Matemática, y nada más')}</div>
            <div style={{ marginTop: 60, display: 'flex', justifyContent: 'center', gap: 170 }}>
              {maths.map(([s, w, col], i) => (
                <div key={i} style={{ opacity: ramp(t, mt[i], mt[i] + 0.5), textAlign: 'center' }}>
                  <div style={{ fontSize: 190, fontWeight: 600, color: col, lineHeight: 1 }}>{s}</div>
                  <div style={{ fontSize: 36, fontWeight: 600, color: P.dim, marginTop: 14 }}>{w}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      );
    },
  },
  Section(14, P.mint, ['The reason', 'El motivo'], ['Why run code on the GPU?', '¿Por qué ejecutar código en la GPU?']),
  // 15 · good reasons
  {
    from: 15, to: 15, lead: 0.4, tail: 0.5,
    render: (c) => {
      const x = X(c);
      return (
        <>
          <MovingArt a={P.violet} b={P.pink} d={P.mint} />
          <Pad style={{ right: 860, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Fade at={0.4}><Kicker color={P.violet}>{x('Not everything runs there', 'No todo corre allí')}</Kicker></Fade>
            <Fade at={S(c, 15, 0) + 2.2}><Big size={84} style={{ marginTop: 22 }}>{x('But a few things run there very well.', 'Pero algunas cosas corren allí muy bien.')}</Big></Fade>
          </Pad>
        </>
      );
    },
  },
  Section(16, P.violet, ['Reason 1', 'Motivo 1'], ['Many calculations at once', 'Muchos cálculos a la vez'], '1'),
  // 17 · CPU
  {
    from: 17, to: 17, lead: 0.6, tail: 0.3,
    render: (c) => {
      const t = useT();
      const x = X(c);
      const all = ramp(t, S(c, 17, 1) + 0.4, S(c, 17, 1) + 0.7);
      return (
        <>
          <div style={{ position: 'absolute', left: 150, top: 110, width: 860, height: 570, borderRadius: 10, overflow: 'hidden' }}>
            <Img src={photo('cpu-die.jpg')} style={{ width: 860, height: 570, objectFit: 'cover', transform: `scale(${1.04 + 0.05 * lin(t, 0, 12)})` }} />
          </div>
          <div style={{ position: 'absolute', left: 150, top: 700, fontSize: 19, color: P.dim }}>Intel 4th generation Core die · Intel in Deutschland · Wikimedia Commons · CC BY-SA 2.0</div>
          <Fade at={S(c, 17, 0) + 0.8} style={{ position: 'absolute', left: 1090, top: 150 }}>
            <Big size={260} color={P.violet}>10</Big>
            <div style={{ fontSize: 46, fontWeight: 600, marginTop: 6 }}>{x('cores in the CPU', 'núcleos en la CPU')}</div>
            <div style={{ fontSize: 34, color: P.dim, marginTop: 14, lineHeight: 1.3 }}>{x('Ten things at the same time, at most. Each one is a thread.', 'Diez cosas a la vez, como máximo. Cada una es un hilo.')}</div>
          </Fade>
          <Cells n={10} x={1090} y={640} size={60} gap={14} color={P.violet} lit={() => all} />
        </>
      );
    },
  },
  // 18-19 · GPU workers
  {
    from: 18, to: 19, lead: 0.5, tail: 0.3,
    render: (c) => {
      const t = useT();
      const x = X(c);
      const cols = 48, rows = 22, s = 26;
      return (
        <>
          <Fade at={S(c, 18, 0)}><div style={{ position: 'absolute', left: 150, top: 120, fontSize: 40, fontWeight: 600, color: P.dim }}>{x('On the GPU, thousands of small workers', 'En la GPU, miles de pequeños trabajadores')}</div></Fade>
          <div style={{ position: 'absolute', left: 150, top: 220, width: cols * s, height: rows * s, display: 'grid', gridTemplateColumns: `repeat(${cols}, ${s}px)`, opacity: ramp(t, S(c, 18, 1), S(c, 18, 1) + 1) }}>
            {Array.from({ length: cols * rows }, (_, k) => {
              const i = k % cols, j = Math.floor(k / cols);
              const w = 0.5 + 0.5 * Math.sin(t * 2.2 + i * 0.35 + j * 0.28);
              return <div key={k} style={{ width: s, height: s, padding: 4 }}><div style={{ width: '100%', height: '100%', borderRadius: 3, background: mix(P.raised, P.mint, 0.18 + 0.82 * w * w) }} /></div>;
            })}
          </div>
        </>
      );
    },
  },
  ImageScene(20, 20, 'cpu-vs-gpu.svg'),
  // 21-23 · the loop
  {
    from: 21, to: 23,
    render: (c) => {
      const t = useT();
      const x = X(c);
      const LOOP = c.lang === 'es' ? LOOP_ES : LOOP_EN;
      const s22 = c.sent(22);
      const sa = (k: number) => (s22[Math.min(k, s22.length - 1)]?.start ?? 0) - c.t0;
      const hl = t < sa(1) ? [{ from: 0, to: 0 }] : t < sa(2) ? [{ from: 2, to: 2 }] : t < sa(3) ? [{ from: 4, to: 4 }] : [{ from: 2, to: 5 }];
      const step = Math.min(4, Math.floor(Math.max(0, t - sa(2)) / 1.1));
      const done = (i: number) => (t > sa(2) + (i + 1) * 1.1 || t > rel(c, 23));
      return (
        <>
          <Code code={LOOP} title={x('C#  ·  on the CPU', 'C#  ·  en la CPU')} x={150} y={200} w={1100} fs={29} chars={ramp(t, 0.5, 2.4) * LOOP.length} hl={t > sa(0) ? hl : []} />
          <div style={{ position: 'absolute', left: 1330, top: 230, width: 440 }}>
            <Fade at={0.8}><Kicker>{x('One index after another', 'Un índice tras otro')}</Kicker></Fade>
            <div style={{ marginTop: 30, display: 'grid', gridTemplateColumns: 'repeat(5, 76px)', gap: 12 }}>
              {[1, 2, 3, 4, 5].map((v, i) => {
                const lit = t > sa(2) ? (i === step && !done(i) ? 1 : done(i) ? 0.45 : 0.15) : 0.15;
                return <div key={i} style={{ height: 100, borderRadius: 10, background: mix(P.raised, P.violet, lit), color: lit > 0.5 ? P.bg : P.dim, fontSize: 42, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{done(i) ? v * 2 : v}</div>;
              })}
            </div>
          </div>
        </>
      );
    },
  },
  // 24 · the race
  {
    from: 24, to: 24, lead: 0.5, tail: 0.4,
    render: (c) => {
      const t = useT();
      const x = X(c);
      const a0 = S(c, 24, 3);
      const r0 = S(c, 24, 6) + 0.4;
      const cpuItem = (i: number) => lin(t, r0 + i * 0.9, r0 + (i + 1) * 0.9);
      const gpuItem = () => lin(t, r0, r0 + 2.6);
      const cpuDone = r0 + 4.5, gpuDone = r0 + 2.6;
      const lane = (name: string, sub: string, col: string, prog: (i: number) => number, done: number, at: number, mt: number) => (
        <Fade at={at} style={{ marginTop: mt }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
            <div style={{ width: 300, fontSize: 42, fontWeight: 700, color: col }}>{name}<div style={{ fontSize: 26, fontWeight: 500, color: P.dim, marginTop: 4 }}>{sub}</div></div>
            <div style={{ display: 'flex', gap: 14 }}>
              {[0, 1, 2, 3, 4].map((i) => <div key={i} style={{ width: 150, height: 90, borderRadius: 10, background: P.raised, overflow: 'hidden' }}><div style={{ width: `${prog(i) * 100}%`, height: '100%', background: col }} /></div>)}
            </div>
            <div style={{ fontSize: 34, fontWeight: 700, color: col, opacity: ramp(t, done, done + 0.4) }}>{x('done', 'listo')}</div>
          </div>
        </Fade>
      );
      return (
        <Pad style={{ top: 130 }}>
          <Fade at={a0 - 0.3}><Kicker>{x('Faster at everything? It depends.', '¿Más rápida en todo? Depende.')}</Kicker></Fade>
          {lane('CPU', x('one fast core', 'un núcleo rápido'), P.violet, cpuItem, cpuDone, a0, 44)}
          {lane('GPU', x('slower threads, all at once', 'hilos más lentos, todos a la vez'), P.mint, gpuItem, gpuDone, a0 + 0.8, 56)}
          <Fade at={gpuDone + 0.6} style={{ marginTop: 60, fontSize: 52, fontWeight: 700, letterSpacing: '-0.03em' }}>{x('Each thread takes a different index.', 'Cada hilo toma un índice distinto.')}</Fade>
        </Pad>
      );
    },
  },
  // 25-30 · Parallel.For
  {
    from: 25, to: 30,
    render: (c) => {
      const t = useT();
      const x = X(c);
      const PARALLEL = c.lang === 'es' ? PARALLEL_ES : PARALLEL_EN;
      const s26 = c.sent(26);
      const sa = (k: number) => (s26[Math.min(k, s26.length - 1)]?.start ?? 0) - c.t0;
      const hl = t < sa(1) ? [] : t < sa(2) ? [{ from: 3, to: 6 }] : t < sa(3) ? [{ from: 9, to: 12 }] : t < rel(c, 28) ? [{ from: 9, to: 12 }] : t < rel(c, 30) ? [{ from: 3, to: 6 }, { from: 9, to: 12 }] : [{ from: 9, to: 12, color: P.mint }];
      const flip = ramp(t, S(c, 28, 1), S(c, 28, 1) + 0.5);
      const pulse = 1 - lin(t, S(c, 28, 1), S(c, 28, 1) + 1.2);
      return (
        <>
          <Code code={PARALLEL} title="C#  ·  Parallel.For" x={130} y={120} w={1260} fs={23} chars={ramp(t, 0.5, 3.5) * PARALLEL.length} hl={hl} />
          <div style={{ position: 'absolute', left: 1440, top: 150, width: 350 }}>
            <Fade at={rel(c, 27)}><Kicker>{x('One index, one function', 'Un índice, una función')}</Kicker></Fade>
            <div style={{ marginTop: 30, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              {[1, 2, 3, 4, 5].map((v, i) => (
                <div key={i} style={{ opacity: ramp(t, rel(c, 27) + 0.3 + i * 0.2, rel(c, 27) + 0.8 + i * 0.2) }}>
                  <div style={{ height: 100, borderRadius: 10, background: mix(P.raised, P.mint, flip * (0.55 + 0.45 * pulse)), color: flip > 0.5 ? P.bg : P.ink, fontSize: 44, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1 + 0.08 * pulse * flip})` }}>{flip > 0.5 ? v * 2 : v}</div>
                  <div style={{ marginTop: 6, fontSize: 20, color: P.dim, fontWeight: 600, textAlign: 'center' }}>{x('thread', 'hilo')} {i}</div>
                </div>
              ))}
            </div>
          </div>
          <Fade at={rel(c, 30)} style={{ position: 'absolute', left: 0, right: 0, top: 790, textAlign: 'center' }}>
            <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: '-0.03em' }}><span style={{ fontFamily: MONO, color: P.mint }}>RandomOperation</span> {x('is what we call a shader.', 'es lo que llamamos un shader.')}</div>
          </Fade>
        </>
      );
    },
  },
  Section(31, P.violet, ['Reason 2', 'Motivo 2'], ['The color of every pixel', 'El color de cada píxel'], '2'),
  // 32-34 · the numbers
  {
    from: 32, to: 34,
    render: (c) => {
      const fmt = (n: number) => Math.round(n).toLocaleString(c.lang === 'es' ? 'es-CL' : 'en-US');
      const t = useT();
      const x = X(c);
      const aF = S(c, 32, 2), aP = W(c, 32, 2, 0.6), aS = W(c, 33, 0, 0.55), aC = S(c, 33, 1), aQ = S(c, 33, 3);
      const px = 2073600 * ramp(t, aP, aP + 1.6);
      const ps = 124416000 * ramp(t, aC, aC + 2.4);
      const frame = Math.floor((((t - aS) % 1) + 1) % 1 * 60);
      return (
        <>
          <div style={{ position: 'absolute', right: 0, top: 0, width: 760, height: 860, overflow: 'hidden' }}>
            <Img src={photo('pixels.jpg')} style={{ width: 860, height: 860, objectFit: 'cover', position: 'absolute', right: 0, top: 0, transform: `scale(${1 + 0.08 * c.p})` }} />
          </div>
          <div style={{ position: 'absolute', right: 20, top: 868, fontSize: 18, color: P.dim, textAlign: 'right' }}>RGB pixel matrix · Selçuk Oral · Wikimedia Commons · CC BY-SA 3.0</div>
          <Pad style={{ right: 840, top: 130 }}>
            <Fade at={S(c, 32, 0)}><Kicker>{x('Your screen', 'Tu pantalla')}</Kicker></Fade>
            <Fade at={aF}><Big size={118} style={{ marginTop: 14, letterSpacing: '-0.05em' }}>1920 × 1080</Big></Fade>
            <Fade at={aP}><Big size={88} color={P.violet} style={{ marginTop: 22 }}>{fmt(px)}</Big><div style={{ fontSize: 32, color: P.dim, marginTop: 4 }}>{x('pixels', 'píxeles')}</div></Fade>
            <Fade at={aS}>
              <div style={{ marginTop: 28, fontSize: 44, fontWeight: 600 }}>{x('× 60 times per second', '× 60 veces por segundo')}</div>
              <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(30, 14px)', gap: 10 }}>
                {Array.from({ length: 60 }, (_, i) => <div key={i} style={{ width: 14, height: 30, borderRadius: 3, background: i <= frame ? P.pink : P.raised }} />)}
              </div>
            </Fade>
            <Fade at={aC}><Big size={88} color={P.pink} style={{ marginTop: 20 }}>{fmt(ps)}</Big><div style={{ fontSize: 32, color: P.dim, marginTop: 4 }}>{x('colors every second', 'colores cada segundo')}</div></Fade>
          </Pad>
          <Fade at={aQ} style={{ position: 'absolute', left: 150, top: 820, fontSize: 38, fontWeight: 600 }}>{x('Same problem as the array. Now the array is the screen.', 'El mismo problema del arreglo. Ahora el arreglo es la pantalla.')}</Fade>
        </>
      );
    },
  },
  ImageScene(35, 36, 'pixeles.svg'),
  // 37 · what the function can decide
  {
    from: 37, to: 37, lead: 0.6,
    render: (c) => {
      const t = useT();
      const x = X(c);
      const eR = S(c, 37, 1), eG = S(c, 37, 2), eW = S(c, 37, 3);
      const mode = t < eR ? -1 : t < eG ? 0 : t < eW ? 1 : 2;
      const color = (u: number, v: number) => {
        if (mode < 0) return mix(P.raised, P.dim, 0.18);
        if (mode === 0) return P.pink;
        if (mode === 1) return mix(mix(P.pink, P.violet, u), P.mint, v);
        const w = Math.sin(u * 14 - t * 3) * 0.5 + 0.5, w2 = Math.sin(v * 9 + t * 2) * 0.5 + 0.5;
        return mix(mix(P.bg, P.violet, w * 0.55), P.mint, w2 * 0.6);
      };
      const label = [x('return red', 'devuelve rojo'), x('the color depends on the position', 'el color depende de la posición'), x('position + time = water', 'posición + tiempo = agua')][Math.max(0, mode)];
      return (
        <>
          <PixelGrid cols={30} rows={17} size={42} x={150} y={110} color={color} />
          <Fade at={eR} style={{ position: 'absolute', left: 150, top: 840, fontSize: 40, fontWeight: 600 }}>{label}</Fade>
        </>
      );
    },
  },
  Section(38, P.mint, ['Three kinds', 'Tres tipos'], ['The stages of a shader', 'Las etapas de un shader']),
  // 39-40 · the table
  {
    from: 39, to: 40,
    render: (c) => {
      const x = X(c);
      const s = c.sent(40);
      const at = (k: number) => (s[Math.min(k, s.length - 1)]?.start ?? c.be(40)) - c.t0 - 0.2;
      const rows: [string, string, string, string][] = [
        ['Vertex', x('point (vertex) of the shape you send', 'punto (vértice) de la figura que mandas a dibujar'), x('Where on the screen that point lands.', 'En qué lugar de la pantalla cae ese punto.'), P.pink],
        ['Fragment', x('pixel the shape covers', 'píxel que ocupa la figura'), x('What color that pixel is painted.', 'De qué color se pinta ese píxel.'), P.mint],
        ['Compute', x('index you ask for', 'índice que tú le pidas'), x('Whatever you want. It draws nothing.', 'Lo que tú quieras. No dibuja nada.'), P.violet],
      ];
      return (
        <Pad style={{ top: 150 }}>
          <Fade at={0.4}><div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 1fr', fontSize: 26, fontWeight: 600, color: P.dim, paddingBottom: 20, borderBottom: `2px solid ${P.line}` }}><div>{x('Stage', 'Etapa')}</div><div>{x('Runs once for each…', 'Se ejecuta una vez por cada…')}</div><div>{x('It decides', 'Lo que decide')}</div></div></Fade>
          {rows.map((r, i) => (
            <Fade key={i} at={at(i + 1)} style={{ display: 'grid', gridTemplateColumns: '300px 1fr 1fr', alignItems: 'center', height: 190, borderBottom: `2px solid ${P.line}`, gap: 30 }}>
              <div style={{ fontSize: 60, fontWeight: 700, color: r[3], letterSpacing: '-0.03em' }}>{r[0]}</div>
              <div style={{ fontSize: 38, fontWeight: 500, lineHeight: 1.25 }}>{r[1]}</div>
              <div style={{ fontSize: 38, fontWeight: 500, color: P.dim, lineHeight: 1.25 }}>{r[2]}</div>
            </Fade>
          ))}
        </Pad>
      );
    },
  },
  // 41 · order of the three steps
  {
    from: 41, to: 41, lead: 0.5, tail: 0.5,
    render: (c) => {
      const x = X(c);
      const steps: [string, string, number, string][] = [['1', 'Vertex', W(c, 41, 1, 0.3), P.pink], ['2', x('The GPU finds the pixels', 'La GPU encuentra los píxeles'), W(c, 41, 1, 0.55), P.violet], ['3', 'Fragment', W(c, 41, 1, 0.82), P.mint]];
      return (
        <Pad style={{ top: 140 }}>
          <Fade at={S(c, 41, 0)}><Kicker>{x('To draw something', 'Para dibujar algo')}</Kicker></Fade>
          <div style={{ marginTop: 40 }}>
            {steps.map(([n, txt, at, col], i) => (
              <Fade key={i} at={at} style={{ display: 'flex', alignItems: 'center', gap: 44, height: 170, borderBottom: `2px solid ${P.line}` }}>
                <div style={{ fontSize: 90, fontWeight: 700, color: col, width: 90, letterSpacing: '-0.04em' }}>{n}</div>
                <div style={{ fontSize: 78, fontWeight: 700, letterSpacing: '-0.035em' }}>{txt}</div>
              </Fade>
            ))}
          </div>
        </Pad>
      );
    },
  },
  ImageScene(43, 43, 'etapas.svg'),
  // 44 · next chapter
  {
    from: 44, to: 44, lead: 0.4, tail: 0.5,
    render: (c) => {
      const x = X(c);
      return (
        <>
          <MovingArt a={P.mint} b={P.violet} d={P.pink} />
          <Pad style={{ right: 860, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Fade at={0.3}><Kicker color={P.mint}>{x('Do not worry if it is not clear yet', 'No te preocupes si aún no queda claro')}</Kicker></Fade>
            <Fade at={S(c, 44, 1)}><div style={{ marginTop: 40, fontSize: 30, fontWeight: 600, color: P.dim }}>{x('Next chapter', 'Siguiente capítulo')}</div><Big size={92} style={{ marginTop: 10 }}>{x('How a shader is built', 'Cómo se construye un shader')}</Big></Fade>
          </Pad>
        </>
      );
    },
  },
  Section(45, P.pink, ['Yotsuba Shader', 'Yotsuba Shader'], ['Where does it come in?', '¿Dónde entra Yotsuba Shader?']),
  // 46-47
  {
    from: 46, to: 47,
    render: (c) => {
      const t = useT();
      const x = X(c);
      const langs: [string, string, string][] = [['HLSL', 'DirectX', P.violet], ['GLSL', x('OpenGL and Vulkan', 'OpenGL y Vulkan'), P.mint], ['Metal (MSL)', 'Apple', P.pink]];
      const y0 = rel(c, 47);
      const l0 = S(c, 46, 1);
      return (
        <>
          <Pad style={{ right: 900 }}>
            <Fade at={S(c, 46, 0)}><Kicker>{x('Until now', 'Hasta ahora')}</Kicker></Fade>
            <Fade at={S(c, 46, 0) + 0.3}><Big size={96} style={{ marginTop: 16 }}>{x('A different language for each graphics API.', 'Un lenguaje distinto para cada API gráfica.')}</Big></Fade>
          </Pad>
          <div style={{ position: 'absolute', left: 1100, top: 160, width: 670 }}>
            {langs.map(([n, a, col], i) => (
              <Fade key={i} at={l0 + i * 0.8} style={{ marginBottom: 26 }}>
                <div style={{ height: 150, borderRadius: 12, background: col, color: P.bg, padding: '0 38px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: '-0.03em' }}>{n}</div><div style={{ fontSize: 28, fontWeight: 600, opacity: 0.7 }}>{a}</div>
                </div>
              </Fade>
            ))}
          </div>
          <div style={{ position: 'absolute', inset: 0, background: P.bg, padding: '150px 150px', opacity: ramp(t, y0 - 0.2, y0 + 0.5) }}>
            <Fade at={y0 + 0.1}><Kicker color={P.mint}>{x('With Yotsuba Shader', 'Con Yotsuba Shader')}</Kicker></Fade>
            <Fade at={y0 + 0.2}><Big size={130} style={{ marginTop: 20 }}>{x('You write it in C#.', 'Lo escribes en C#.')}</Big></Fade>
            <div style={{ marginTop: 56, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 40, maxWidth: 1500 }}>
              {([[x('Same project', 'El mismo proyecto'), P.mint, W(c, 47, 0, 0.55)], [x('Same editor', 'El mismo editor'), P.violet, W(c, 47, 0, 0.85)], [x('A compiler that checks it', 'Un compilador que lo revisa'), P.pink, S(c, 47, 1)]] as [string, string, number][]).map(([txt, col, at], i) => (
                <Fade key={i} at={at}><div style={{ borderTop: `6px solid ${col}`, paddingTop: 24, fontSize: 46, fontWeight: 600, lineHeight: 1.2 }}>{txt}</div></Fade>
              ))}
            </div>
          </div>
        </>
      );
    },
  },
  // 48-53 · summary
  {
    from: 48, to: 53,
    render: (c) => {
      const x = X(c);
      const items = [49, 50, 51, 52];
      const text = [x('A shader is a function that runs on the GPU.', 'Un shader es una función que se ejecuta en la GPU.'), x('The GPU calls it a huge number of times at once.', 'La GPU la llama muchísimas veces a la vez.'), x('Inside it, only calculations.', 'Dentro, solo cálculos.'), x('With Yotsuba Shader, you write it in C#.', 'Con Yotsuba Shader, la escribes en C#.')];
      const cols = [P.pink, P.violet, P.mint, P.pink];
      return (
        <Pad style={{ top: 140 }}>
          <Fade at={0.3}><Kicker>{x('To sum up', 'En resumen')}</Kicker></Fade>
          <div style={{ marginTop: 36 }}>
            {items.map((b, i) => (
              <Fade key={b} at={rel(c, b) - 0.1} style={{ display: 'flex', alignItems: 'center', gap: 40, height: 150, borderBottom: `2px solid ${P.line}` }}>
                <div style={{ width: 16, height: 16, borderRadius: 8, background: cols[i] }} />
                <div style={{ fontSize: 58, fontWeight: 600, letterSpacing: '-0.025em' }}>{text[i]}</div>
              </Fade>
            ))}
          </div>
          <Fade at={rel(c, 53) - 0.1} style={{ marginTop: 50, fontSize: 40, color: P.dim, fontWeight: 600 }}>{x('Next: How a shader is built →', 'Siguiente: Cómo se construye un shader →')}</Fade>
        </Pad>
      );
    },
  },
  // 54 · credits
  {
    from: 54, to: 54, lead: 0.6, tail: 1.5,
    render: (c) => {
      const x = X(c);
      return (
        <Pad style={{ top: 160 }}>
          <Fade at={0.3}><Kicker>{x('Photographs', 'Fotografías')}</Kicker></Fade>
          {[['Palit GeForce RTX 5090 GameRock', 'PantheraLeo1359531, Wikimedia Commons, CC BY 4.0'], ['4th Generation Intel Core processor die', 'Intel in Deutschland, Wikimedia Commons, CC BY-SA 2.0'], ['RGB pixel matrix of a shadow mask display', 'Selçuk Oral, Wikimedia Commons, CC BY-SA 3.0']].map(([a, b], i) => (
            <Fade key={i} at={0.6 + i * 0.5} style={{ marginTop: 44 }}><div style={{ fontSize: 44, fontWeight: 600 }}>{a}</div><div style={{ fontSize: 30, color: P.dim, marginTop: 6 }}>{b}</div></Fade>
          ))}
        </Pad>
      );
    },
  },
];

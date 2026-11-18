import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, MONO, mixHex } from '../ep01/kit';
import { lerp, ramp, scene, useT } from '../ep01/data';
// @ts-ignore  (same build-time highlighter as the website)
import { highlight } from '../highlight.mjs';

/**
 * The shader that is built on screen during the whole video: C# on one side, HLSL on the other.
 * Every line belongs to the scene that introduces it. Earlier lines are already there, later ones are hidden,
 * and `intro` says at what second each new line appears (so it follows the narration).
 */
export const ORDER = [
  'v2-s03-struct', 'v2-s04-carry', 'v2-s05-slots', 'v2-s05b-languages', 'v2-s06-coordinates', 'v2-s07-vertex', 'v2-s08-position',
  'v2-s09-pixels', 'v2-s10-spread', 'v2-s11-fragment', 'v2-s12-doors', 'v2-s13-blueprint',
];
const S3 = ORDER[0], S4 = ORDER[1], S7 = 'v2-s07-vertex', S8 = 'v2-s08-position', S11 = 'v2-s11-fragment';
const S5B = 'v2-s05b-languages';

type L = { id: string; at: string; cs: string | null; hl: string | null; csh?: string | null; gl?: string | null; only?: boolean };
export const LINES: L[] = [
  { id: 'c0', at: S3, cs: 'public struct Corner', hl: 'struct Corner' },
  { id: 'c1', at: S3, cs: '{', hl: '{' },
  { id: 'c2', at: S3, cs: '    [location(0)] public vec2 Position;', csh: '    [TEXCOORD(0)] public vec2 Position;', gl: 'layout(location = 0) in vec2 corner_Position;', hl: '    float2 Position : TEXCOORD0;' },
  { id: 'c3', at: S3, cs: '    [location(1)] public vec4 Color;', csh: '    [TEXCOORD(1)] public vec4 Color;', gl: 'layout(location = 1) in vec4 corner_Color;', hl: '    float4 Color    : TEXCOORD1;' },
  { id: 'g1', at: S4, only: true, cs: '    [location(2)] public vec2 Uv;', gl: 'layout(location = 2) in vec2 corner_Uv;', hl: '    float2 Uv       : TEXCOORD2;' },
  { id: 'g2', at: S4, only: true, cs: '    [location(3)] public vec3 Normal;', gl: 'layout(location = 3) in vec3 corner_Normal;', hl: '    float3 Normal   : TEXCOORD3;' },
  { id: 'g3', at: S4, only: true, cs: '    [location(4)] public float Temperature;', gl: 'layout(location = 4) in float corner_Temperature;', hl: '    float  Temperature : TEXCOORD4;' },
  { id: 'c4', at: S3, cs: '}', hl: '};' },
  { id: 'b1', at: S7, cs: '', hl: '' },
  { id: 'p0', at: S7, cs: 'public struct Pixel', hl: 'struct Pixel' },
  { id: 'p1', at: S7, cs: '{', hl: '{' },
  { id: 'p2', at: S7, cs: '    [gl_Position] public vec4 Position;', csh: '    [SV_Position] public vec4 Position;', hl: '    float4 Position : SV_Position;' },
  { id: 'p3', at: S7, cs: '    [location(0)] public vec4 Color;', csh: '    [TEXCOORD(0)] public vec4 Color;', hl: '    float4 Color    : TEXCOORD0;' },
  { id: 'p4', at: S7, cs: '}', hl: '};' },
  { id: 'b2', at: S7, cs: '', hl: '' },
  { id: 'k0', at: S7, cs: 'public class Triangle', hl: null },
  { id: 'k1', at: S7, cs: '{', hl: null },
  { id: 'v0', at: S7, cs: '    [ShaderStage(Stage.Vertex)]', hl: null },
  { id: 'v1', at: S7, cs: '    public Pixel Vertex(Corner corner)', hl: 'Pixel Vertex(Corner corner)' },
  { id: 'v2', at: S7, cs: '    {', hl: '{' },
  { id: 'v3', at: S8, cs: '        Pixel pixel;', hl: '    Pixel pixel;' },
  { id: 'v4', at: S8, cs: '        pixel.Position = Make.Vec4(corner.Position.X, corner.Position.Y, 0f, 1f);', hl: '    pixel.Position = float4(corner.Position.x, corner.Position.y, 0.0, 1.0);' },
  { id: 'v5', at: S8, cs: '        pixel.Color = corner.Color;', hl: '    pixel.Color = corner.Color;' },
  { id: 'v6', at: S8, cs: '        return pixel;', hl: '    return pixel;' },
  { id: 'v7', at: S7, cs: '    }', hl: '}' },
  { id: 'f0', at: S11, cs: '', hl: '' },
  { id: 'f1', at: S11, cs: '    [ShaderStage(Stage.Fragment)]', hl: null },
  { id: 'f2', at: S11, cs: '    [return: location(0)]', csh: '    [return: SV_Target]', hl: null },
  { id: 'f3', at: S11, cs: '    public vec4 Fragment(Pixel pixel)', hl: 'float4 Fragment(Pixel pixel) : SV_Target0' },
  { id: 'f4', at: S11, cs: '    {', hl: '{' },
  { id: 'f5', at: S11, cs: '        return pixel.Color;', hl: '    return pixel.Color;' },
  { id: 'f6', at: S11, cs: '    }', hl: '}' },
  { id: 'k2', at: S7, cs: '}', hl: null },
];

export type HL = { ids?: string[]; cs?: string[]; hl?: string[]; color: string; from: number; to?: number };

const LH = 27, FS = 19, TITLE = 38, PAD = 12;

type Row = { l: L; v: number };
type Mode = { cs: 'glsl' | 'hlsl'; out: 'glsl' | 'hlsl' };
/** Before the languages scene the shader is shown in GLSL style; after it, in HLSL style. `swapAt` flips the lower pane to HLSL early. */
const modeAt = (sceneId: string, t: number, swapAt?: number): Mode => {
  const hlsl = ORDER.indexOf(sceneId) > ORDER.indexOf(S5B);
  return { cs: hlsl ? 'hlsl' : 'glsl', out: hlsl || (swapAt !== undefined && t >= swapAt) ? 'hlsl' : 'glsl' };
};
const textOf = (l: L, pane: 'cs' | 'hl', m: Mode): string | null =>
  pane === 'cs' ? (m.cs === 'hlsl' ? (l.csh ?? l.cs) : l.cs) : m.out === 'hlsl' ? l.hl : (l.gl ?? null);
const rowsFor = (sceneId: string, t: number, intro: Record<string, number>, sceneStart: number, pane: 'cs' | 'hl', swapAt?: number): Row[] => {
  const cur = ORDER.indexOf(sceneId);
  const out: Row[] = [];
  for (const l of LINES) {
    if (textOf(l, pane, modeAt(sceneId, t, swapAt)) === null) continue;
    const idx = ORDER.indexOf(l.at);
    let v = 0;
    if (idx < cur) v = l.only ? 0 : 1;
    else if (idx === cur) { const a = intro[l.id] ?? sceneStart; v = ramp(t, a, a + 0.45); }
    if (v > 0) out.push({ l, v });
  }
  return out;
};

const hlOpacity = (h: HL, t: number, end: number) => Math.min(ramp(t, h.from, h.from + 0.35), 1 - ramp(t, (h.to ?? end) - 0.2, h.to ?? end));

const Pane: React.FC<{ pane: 'cs' | 'hl'; x: number; y: number; w: number; h: number; sceneId: string; intro: Record<string, number>; hls: HL[]; lh: number; fs: number; swapAt?: number }> = ({ pane, x, y, w, h, sceneId, intro, hls, lh, fs, swapAt }) => {
  const t = useT();
  const sc = scene(sceneId);
  const cap = Math.floor((h - TITLE - PAD * 2) / lh);
  const rowsAt = (tt: number) => rowsFor(sceneId, tt, intro, sc.start, pane, swapAt);
  const m = modeAt(sceneId, t, swapAt);
  const title = pane === 'cs' ? (m.cs === 'hlsl' ? 'C# · HLSL style' : 'C# · GLSL style') : m.out === 'hlsl' ? 'HLSL' : 'GLSL';
  const active = (tt: number) => hls.filter((q) => hlOpacity(q, tt, sc.end) > 0.05);
  const idsOf = (q: HL) => [...(q.ids ?? []), ...(q[pane] ?? [])];
  // scroll so that what is being talked about (or the newest line) stays in view; averaged over a short window so it glides
  const target = (tt: number) => {
    const rows = rowsAt(tt);
    const act = active(tt).flatMap(idsOf);
    let focus = rows.length - 1;
    if (act.length) focus = Math.max(...rows.map((r, i) => (act.includes(r.l.id) ? i : -1)));
    return Math.max(0, Math.min(rows.length - cap, focus - (cap - 3)));
  };
  let off = 0;
  for (let i = 0; i < 6; i++) off += target(t - i * 0.08);
  off /= 6;
  const rows = rowsAt(t);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, background: '#0b1119', border: `1px solid ${C.line}`, borderRadius: 6, overflow: 'hidden' }}>
      <div style={{ height: TITLE, display: 'flex', alignItems: 'center', padding: '0 18px', background: '#101a26', borderBottom: `1px solid ${C.line}`, fontFamily: MONO, fontSize: 17, color: C.dim, fontWeight: 600, letterSpacing: '0.12em' }}>{title}</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: TITLE + PAD, bottom: PAD, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: -off * lh }}>
          {rows.map((r, i) => {
            const hit = hls.map((q) => ({ q, o: idsOf(q).includes(r.l.id) ? hlOpacity(q, t, sc.end) : 0 })).filter((z) => z.o > 0.02).sort((a, b) => b.o - a.o)[0];
            const text = textOf(r.l, pane, m) as string;
            return (
              <div key={r.l.id} style={{ position: 'absolute', left: 0, right: 0, top: i * lh, height: lh, opacity: r.v, transform: `translateX(${(1 - r.v) * -14}px)`, display: 'flex', alignItems: 'center', paddingLeft: 18, background: hit ? mixHex('#0b1119', hit.q.color, 0.22 * hit.o) : 'transparent', borderLeft: hit ? `4px solid ${mixHex('#0b1119', hit.q.color, hit.o)}` : '4px solid transparent' }}>
                <pre style={{ margin: 0, fontFamily: MONO, fontSize: fs, lineHeight: `${lh}px`, color: '#e5eef0', whiteSpace: 'pre' }} dangerouslySetInnerHTML={{ __html: text === '' ? '&nbsp;' : highlight('csharp', text) }} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/** Concept visual on the left, the shader being built on the right. `full` gives the whole screen to the code. */
export const Workbench: React.FC<{ id: string; intro?: Record<string, number>; hl?: HL[]; full?: boolean; swapAt?: number; children?: React.ReactNode }> = ({ id, intro = {}, hl = [], full = false, swapAt, children }) => (
  <AbsoluteFill style={{ paddingBottom: 0 }}>
    {children ? <div style={{ position: 'absolute', left: 80, top: 80, width: 700, height: 790 }}>{children}</div> : null}
    {full ? (
      <>
        <Pane pane="cs" swapAt={swapAt} x={80} y={80} w={880} h={740} sceneId={id} intro={intro} hls={hl} lh={22} fs={16} />
        <Pane pane="hl" swapAt={swapAt} x={980} y={80} w={860} h={740} sceneId={id} intro={intro} hls={hl} lh={22} fs={16} />
      </>
    ) : (
      <>
        <Pane pane="cs" swapAt={swapAt} x={810} y={80} w={1040} h={388} sceneId={id} intro={intro} hls={hl} lh={LH} fs={FS} />
        <Pane pane="hl" swapAt={swapAt} x={810} y={486} w={1040} h={388} sceneId={id} intro={intro} hls={hl} lh={LH} fs={FS} />
      </>
    )}
  </AbsoluteFill>
);

export { lerp };

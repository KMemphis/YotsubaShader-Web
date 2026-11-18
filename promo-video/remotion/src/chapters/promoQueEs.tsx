import React, { useEffect, useRef } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';
import { Code, Ctx, Fade, Kicker, MONO, P, SceneDef, lin, mix, ramp, useT } from './core';
import { OUT, REAL_GRADIENT, SPV_BYTES } from './promoData';
import DATA from './data/es.promo-que-es.json';

/** seconds to keep a scene after its last sentence: until the next scene starts (no black gaps) */
const hold = (n: number) => {
  const items = (DATA as any).items as { block: number; start: number; end: number }[];
  const it = items.find((x) => x.block === n)!;
  const next = items.find((x) => x.block === n + 1);
  return Math.max(0.35, (next ? next.start : (DATA as any).duration + 0.8) - it.end + 0.15);
};

/* Promo · Qué es Yotsuba Shader (español), v2.
   Rules: on screen only data and code (the voice and the captions carry the sentences); every cue hangs on a sentence;
   code at 24 px or more; site/logo palette (the shaders keep their real colours). */

const S = (c: Ctx, n: number, k: number) => (c.sent(n)[Math.min(k, c.sent(n).length - 1)]?.start ?? c.bs(n)) - c.t0;
const W = (c: Ctx, n: number, k: number, f: number) => { const s = c.sent(n)[Math.min(k, c.sent(n).length - 1)]; return (s ? s.start + f * (s.end - s.start) : c.bs(n)) - c.t0; };
const SUNSET = 'linear-gradient(180deg, rgb(255,64,115), rgb(255,217,25))';

const Typed: React.FC<{ text: string; from: number; to: number; color?: string; fs?: number }> = ({ text, from, to, color = P.ink, fs = 30 }) => {
  const t = useT();
  const n = Math.floor(lin(t, from, to) * text.length);
  return <span style={{ fontFamily: MONO, fontSize: fs, color, whiteSpace: 'pre' }}>{text.slice(0, n)}</span>;
};

const Terminal: React.FC<{ x: number; y: number; w: number; h: number; children: React.ReactNode }> = ({ x, y, w, h, children }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, background: P.raised, borderRadius: 14, padding: '24px 34px', overflow: 'hidden' }}>
    <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>{[P.pink, P.violet, P.mint].map((c, i) => <div key={i} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />)}</div>
    {children}
  </div>
);

/** A flat move: slides in from the right and out to the left. */
const Slide: React.FC<{ at: number; out?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, out, children, style }) => {
  const t = useT();
  const a = ramp(t, at, at + 0.6);
  const o = out === undefined ? 0 : ramp(t, out, out + 0.5);
  if (a <= 0 || o >= 1) return null;
  return <div style={{ position: 'absolute', inset: 0, opacity: a * (1 - o), transform: `translateX(${(1 - a) * 80 - o * 80}px)`, ...style }}>{children}</div>;
};

/* ---------- WebGL: the fragment shaders run in the page ---------- */
const VERT = `#version 300 es
in vec2 aPos; out vec2 pixel_Uv;
void main(){ pixel_Uv = vec2(aPos.x*0.5+0.5, 0.5-aPos.y*0.5); gl_Position = vec4(aPos,0.0,1.0); }`;
const HEAD = `#version 300 es
precision highp float; in vec2 pixel_Uv; out vec4 o; uniform float uTime; uniform float uAspect; uniform sampler2D uPhoto;`;
const FRAG: Record<string, string> = {
  // the compiler's real GLSL ES output (version line and locations adapted to WebGL 2)
  gradient: REAL_GRADIENT,
  // the tutorial's CountSteps and Palette; the slow zoom is added for the video
  mandelbrot: HEAD + `
int CountSteps(float cx, float cy){ float x=0.0; float y=0.0; int steps=0;
  while(steps<100){ float nx=x*x-y*y+cx; float ny=2.0*x*y+cy; x=nx; y=ny; if(x*x+y*y>4.0){break;} steps++; } return steps; }
vec4 Palette(float t){ float r=1.0-t; return vec4(9.0*r*t*t*t, 15.0*r*r*t*t, 8.5*r*r*r*t, 1.0); }
void main(){
  float k = smoothstep(0.2, 3.3, uTime);
  vec2 center = mix(vec2(-0.65, 0.0), vec2(-0.745, 0.112), k);
  float z = mix(1.0, 0.16, k);
  vec2 c = center + vec2((pixel_Uv.x-0.5)*1.9*uAspect, (pixel_Uv.y-0.5)*1.9) * z;
  int s = CountSteps(c.x, c.y);
  if(s==100){ o=vec4(0.,0.,0.,1.); return; }
  o = Palette(float(s)/100.0);
}`,
  neon: HEAD + `
void main(){ float x=(pixel_Uv.x*2.0-1.0)*uAspect/1.7778; float y=pixel_Uv.y*2.0-1.0;
  float d=sqrt(x*x+y*y); float r=abs(d-0.6); float glow=clamp(0.03/r,0.0,1.0);
  vec3 pink=vec3(1.0,0.2,0.7); vec3 cyan=vec3(0.2,0.8,1.0); vec3 tube=mix(pink,cyan,pixel_Uv.x);
  vec3 bg=vec3(0.02,0.02,0.06); o=vec4(mix(bg,tube,glow),1.0); }`,
  plasma: HEAD + `
vec4 Rainbow(float v){ return vec4(0.5+0.5*sin(v*1.5), 0.5+0.5*sin(v*1.5+2.1), 0.5+0.5*sin(v*1.5+4.2), 1.0); }
void main(){ float x=(pixel_Uv.x*2.0-1.0)*uAspect/1.7778; float y=pixel_Uv.y*2.0-1.0; float t=uTime;
  float w = sin(x*6.0+t)+sin(y*6.0+t*1.3)+sin((x+y)*6.0+t*0.7)+sin(sqrt(x*x+y*y)*9.0-t*2.0); o=Rainbow(w); }`,
  // the photo is square: crop it to the frame instead of stretching it
  underwater: HEAD + `
void main(){ float t=uTime;
  float u=pixel_Uv.x+sin(pixel_Uv.y*25.0+t*2.0)*0.012; float v=pixel_Uv.y+sin(pixel_Uv.x*20.0+t*1.5)*0.012;
  vec2 q=vec2(u, 0.5+(v-0.5)/uAspect);
  vec4 p=texture(uPhoto, q); vec3 orig=p.rgb; vec3 sea=vec3(p.r*0.2,p.g*0.7,p.b*1.0+0.1); vec3 col=mix(orig,sea,0.6);
  float x=pixel_Uv.x*2.0-1.0; float y=pixel_Uv.y*2.0-1.0; float d=sqrt(x*x+y*y); float shade=1.0-smoothstep(0.5,1.4,d);
  o=vec4(col*shade,1.0); }`,
};

const ShaderCanvas: React.FC<{ name: string; x: number; y: number; w: number; h: number; time?: number; cw?: number; ch?: number; radius?: number }> = ({ name, x, y, w, h, time, cw = 800, ch = 450, radius = 8 }) => {
  const t = useT();
  const ref = useRef<HTMLCanvasElement>(null);
  const tm = time ?? t;
  useEffect(() => {
    const handle = delayRender('shader ' + name);
    const cv = ref.current;
    const done = () => continueRender(handle);
    if (!cv) { done(); return; }
    const gl = cv.getContext('webgl2', { preserveDrawingBuffer: true });
    if (!gl) { done(); return; }
    const mk = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(name, gl.getShaderInfoLog(s)); return s; };
    const pr = gl.createProgram()!;
    gl.attachShader(pr, mk(gl.VERTEX_SHADER, VERT)); gl.attachShader(pr, mk(gl.FRAGMENT_SHADER, FRAG[name]));
    gl.bindAttribLocation(pr, 0, 'aPos'); gl.linkProgram(pr); gl.useProgram(pr);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.viewport(0, 0, cv.width, cv.height);
    const set = (n: string, v: number) => { const u = gl.getUniformLocation(pr, n); if (u) gl.uniform1f(u, v); };
    const draw = () => { set('uTime', tm); set('uAspect', cw / ch); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); done(); };
    if (name === 'underwater') {
      const img = new window.Image();
      img.onload = () => {
        const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
        gl.uniform1i(gl.getUniformLocation(pr, 'uPhoto'), 0); draw();
      };
      img.onerror = done;
      img.src = staticFile('chapters/photos/pez.jpg');
    } else draw();
  }, [name, tm, cw, ch]);
  return <canvas ref={ref} width={cw} height={ch} style={{ position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: radius }} />;
};

/** The five tutorial shaders together: 3 on top, 2 below. */
const Mosaic: React.FC<{ at: number; step?: number }> = ({ at, step = 0.35 }) => {
  const t = useT();
  const names = ['plasma', 'mandelbrot', 'neon', 'underwater', 'gradient'];
  const tw = 540, th = 304, gap = 30;
  const pos = (i: number) => i < 3 ? { x: 150 + i * (tw + gap), y: 110 } : { x: 150 + (tw + gap) / 2 + (i - 3) * (tw + gap), y: 110 + th + gap };
  return (
    <>
      {names.map((n, i) => {
        const k = ramp(t, at + i * step, at + i * step + 0.6);
        if (k <= 0) return null;
        const p = pos(i);
        return <div key={n} style={{ position: 'absolute', left: 0, top: 0, opacity: k, transform: `translateY(${(1 - k) * 30}px)` }}><ShaderCanvas name={n} x={p.x} y={p.y} w={tw} h={th} cw={640} ch={360} time={n === 'mandelbrot' ? 0 : t + i * 3} /></div>;
      })}
    </>
  );
};

/* ---------- code shown in the video (from the tutorial, wrapped to fit) ---------- */
const GRADIENT_CS = `public class Gradient
{
    [ShaderStage(Stage.Fragment)]
    [return: location(0)]
    public vec4 Fragment(Pixel pixel)
    {
        float red = 1f;
        float green = 0.25f + 0.6f * pixel.Uv.Y;
        float blue = 0.45f - 0.35f * pixel.Uv.Y;
        return Make.Vec4(red, green, blue, 1f);
    }
}`;
const EX: { name: string; file: string; code: string; hl: { from: number; to: number }[] }[] = [
  { name: 'gradient', file: 'Gradient.cs', code: `float red = 1f;
float green = 0.25f + 0.6f * pixel.Uv.Y;
float blue = 0.45f - 0.35f * pixel.Uv.Y;
return Make.Vec4(red, green, blue, 1f);`, hl: [{ from: 0, to: 2 }] },
  { name: 'mandelbrot', file: 'Mandelbrot.cs · CountSteps', code: `while (steps < 100)
{
    float newX = x * x - y * y + cx;
    float newY = 2f * x * y + cy;
    x = newX;
    y = newY;
    if (x * x + y * y > 4f) { break; }
    steps++;
}`, hl: [{ from: 0, to: 0 }, { from: 6, to: 7 }] },
  { name: 'neon', file: 'Neon.cs', code: `float distanceToCenter = sqrt(x * x + y * y);
float distanceToRing =
    abs(distanceToCenter - 0.6f);
float glow =
    clamp(0.03f / distanceToRing, 0f, 1f);
vec3 tube = mix(pink, cyan, pixel.Uv.X);`, hl: [{ from: 0, to: 4 }] },
  { name: 'plasma', file: 'Plasma.cs', code: `float t = Time.Seconds;

float waves = sin(x * 6f + t)
    + sin(y * 6f + t * 1.3f)
    + sin((x + y) * 6f + t * 0.7f)
    + sin(sqrt(x * x + y * y) * 9f - t * 2f);

return Rainbow(waves);`, hl: [{ from: 0, to: 0 }, { from: 2, to: 5 }] },
  { name: 'underwater', file: 'Underwater.cs', code: `float u = pixel.Uv.X
    + sin(pixel.Uv.Y * 25f + t * 2f) * 0.012f;
float v = pixel.Uv.Y
    + sin(pixel.Uv.X * 20f + t * 1.5f) * 0.012f;

vec4 photo = texture(Photo, Make.Vec2(u, v));`, hl: [{ from: 0, to: 3 }] },
];

const ENGINES: { name: string; sub: string; color: string; code: string }[] = [
  { name: 'MonoGame', sub: 'HLSL de MonoGame · .fx', color: P.pink, code: 'float4 PS(float2 uv : TEXCOORD0) : COLOR0\n{\n    return float4(1, 0.4, 0.5, 1);\n}\n\ntechnique Sunset\n{\n    pass P0 { PixelShader = compile ps_3_0 PS(); }\n}' },
  { name: 'Stride', sub: 'SDSL · .sdsl', color: P.violet, code: 'shader Sunset : ComputeColor\n{\n    override float4 Compute()\n    {\n        return float4(1, 0.4, 0.5, 1);\n    }\n};' },
  { name: 'Unity', sub: 'HLSL dentro de ShaderLab · .shader', color: P.mint, code: 'Shader "Sunset" { SubShader { Pass {\n    HLSLPROGRAM\n    half4 frag(v2f i) : SV_Target\n    {\n        return half4(1, 0.4, 0.5, 1);\n    }\n    ENDHLSL\n} } }' },
  { name: 'Unreal', sub: 'HLSL · .usf', color: P.pink, code: 'void MainPS(\n    in float4 Position : SV_Position,\n    out float4 OutColor : SV_Target0)\n{\n    OutColor = float4(1, 0.4, 0.5, 1);\n}' },
  { name: 'Godot', sub: 'Lenguaje de Godot · .gdshader', color: P.violet, code: 'shader_type canvas_item;\n\nvoid fragment()\n{\n    COLOR = vec4(1.0, 0.4, 0.5, 1.0);\n}' },
];

const FILES: { name: string; api: string; key: string }[] = [
  { name: 'Gradient.Fragment.glsl', api: 'OpenGL', key: 'glsl' },
  { name: 'Gradient.Fragment.hlsl', api: 'DirectX', key: 'hlsl' },
  { name: 'Gradient.Fragment.msl', api: 'Metal', key: 'msl' },
  { name: 'Gradient.spv', api: 'SPIR-V · Vulkan', key: 'spv' },
  { name: 'Gradient.Fragment.gles', api: 'OpenGL ES · WebGL', key: 'gles' },
  { name: 'Gradient.Fragment.cpp', api: 'C++', key: 'cpp' },
];

export const scenes: SceneDef[] = [
  // 1 · hook: the five shaders, running
  {
    from: 1, to: 1, lead: 0.3, tail: hold(1),
    render: (c) => (
      <>
        <Mosaic at={S(c, 1, 0) - 0.1} step={0.3} />
        <Fade at={S(c, 1, 1)} style={{ position: 'absolute', left: 150, top: 790, fontSize: 34, fontWeight: 600, color: P.dim }}>Cinco shaders · escritos en <span style={{ color: P.pink }}>C#</span></Fade>
      </>
    ),
  },
  // 2 · each engine, its own language
  {
    from: 2, to: 2, lead: 0.3, tail: hold(2),
    render: (c) => {
      const t = useT();
      const at = [S(c, 2, 2), S(c, 2, 3), S(c, 2, 4), S(c, 2, 5), S(c, 2, 6)];
      const end = S(c, 2, 7);
      let active = -1; at.forEach((a, i) => { if (t >= a) active = i; });
      const cols = 16, rows = 9, s = 50;
      const fill = lin(t, S(c, 2, 0) + 0.4, S(c, 2, 0) + 2.6);
      return (
        <>
          {/* before the engines: a grid of pixels takes its colour, one row after another */}
          <div style={{ position: 'absolute', left: 150, top: 140, display: 'grid', gridTemplateColumns: `repeat(${cols}, ${s}px)`, gap: 4, opacity: 1 - ramp(t, at[0] - 0.4, at[0] + 0.1) }}>
            {Array.from({ length: cols * rows }, (_, k) => {
              const j = Math.floor(k / cols);
              const on = fill * (rows + 2) - j - (k % cols) / cols;
              const v = j / (rows - 1);
              const col = `rgb(255, ${Math.round(255 * (0.25 + 0.6 * v))}, ${Math.round(255 * Math.max(0, 0.45 - 0.35 * v))})`;
              return <div key={k} style={{ width: s, height: s, borderRadius: 3, background: on > 0 ? col : P.raised, opacity: on > 0 ? Math.min(1, 0.3 + on) : 1 }} />;
            })}
          </div>
          {ENGINES.map((e, i) => (
            <Slide key={e.name} at={at[i]} out={i < 4 ? at[i + 1] - 0.3 : end - 0.2} style={{ left: 150, top: 140, width: 1000, height: 640 }}>
              <div style={{ background: e.color, color: P.bg, padding: '20px 32px', borderRadius: '12px 12px 0 0' }}>
                <div style={{ fontSize: 52, fontWeight: 700, letterSpacing: '-0.03em' }}>{e.name}</div>
                <div style={{ fontSize: 24, fontWeight: 600, opacity: 0.75 }}>{e.sub}</div>
              </div>
              <pre style={{ margin: 0, background: P.raised, padding: '26px 32px', fontFamily: MONO, fontSize: 27, lineHeight: 1.5, color: P.ink, height: 380, overflow: 'hidden' }}>{e.code}</pre>
              <div style={{ height: 70, background: SUNSET, borderRadius: '0 0 12px 12px' }} />
            </Slide>
          ))}
          {/* the end: the same shader, five times */}
          <div style={{ position: 'absolute', left: 150, top: 140, width: 1000, opacity: ramp(t, end, end + 0.6) }}>
            {ENGINES.map((e, i) => (
              <div key={e.name} style={{ display: 'flex', alignItems: 'center', gap: 24, height: 116, borderBottom: `2px solid ${P.line}`, opacity: ramp(t, end + i * 0.15, end + i * 0.15 + 0.4) }}>
                <div style={{ width: 230, fontSize: 36, fontWeight: 700, color: e.color }}>{e.name}</div>
                <div style={{ flex: 1, fontFamily: MONO, fontSize: 22, color: P.dim, whiteSpace: 'nowrap', overflow: 'hidden' }}>{e.code.split('\n')[0]}</div>
                <div style={{ width: 120, height: 64, borderRadius: 6, background: SUNSET }} />
              </div>
            ))}
          </div>
          {/* the list on the right */}
          <div style={{ position: 'absolute', left: 1250, top: 150, width: 520, opacity: ramp(t, S(c, 2, 1), S(c, 2, 1) + 0.6) }}>
            <Kicker style={{ fontSize: 26 }}>Un lenguaje por motor</Kicker>
            {ENGINES.map((e, i) => {
              const on = i <= active || t >= end;
              return (
                <div key={e.name} style={{ display: 'flex', alignItems: 'center', gap: 20, height: 104, borderBottom: `2px solid ${P.line}` }}>
                  <div style={{ width: 14, height: 56, borderRadius: 3, background: on ? e.color : P.line }} />
                  <div style={{ fontSize: 42, fontWeight: 700, color: on ? P.ink : P.dim, letterSpacing: '-0.02em' }}>{e.name}</div>
                </div>
              );
            })}
            <div style={{ marginTop: 26, fontSize: 64, fontWeight: 700, color: P.pink, letterSpacing: '-0.03em', opacity: ramp(t, end + 0.8, end + 1.3) }}>× 5</div>
          </div>
        </>
      );
    },
  },
  // 3 · the idea: one C# source, the compiler converts it
  {
    from: 3, to: 3, lead: 0.3, tail: hold(3),
    render: (c) => {
      const t = useT();
      const targets = ['SPIR-V', 'GLSL', 'GLSL ES', 'HLSL', 'Metal', 'C++'];
      const cols = [P.pink, P.violet, P.mint, P.pink, P.violet, P.mint];
      const a0 = S(c, 3, 0), a1 = S(c, 3, 1), a2 = S(c, 3, 2);
      const conv = lin(t, a0 + 0.4, a1 - 0.3);
      return (
        <>
          {/* the five engine names fold into one word */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center', opacity: 1 - ramp(t, a1 - 0.3, a1 + 0.2) }}>
            {ENGINES.map((e, i) => {
              const x0 = (i - 2) * 330;
              return <div key={e.name} style={{ position: 'absolute', left: 960 - 160 + x0 * (1 - conv), width: 320, fontSize: 46, fontWeight: 700, color: e.color, opacity: 1 - lin(conv, 0.7, 0.98) }}>{e.name}</div>;
            })}
            <div style={{ position: 'absolute', left: 0, right: 0, top: -60, fontSize: 220, fontWeight: 700, color: P.pink, letterSpacing: '-0.04em', opacity: ramp(t, a0 + 1.6, a0 + 2.1) }}>C#</div>
          </div>
          <Fade at={a1} style={{ position: 'absolute', left: 150, top: 120 }}>
            <Code code={GRADIENT_CS} title="Gradient.cs" x={0} y={0} w={760} fs={25} chars={ramp(t, a1, a1 + 2.2) * GRADIENT_CS.length} />
          </Fade>
          <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>
            {targets.map((_, i) => {
              const y = 170 + i * 108;
              const p = ramp(t, a2 + i * 0.22, a2 + i * 0.22 + 0.5);
              return <path key={i} d={`M 930 470 C 1060 470, 1060 ${y + 38}, 1190 ${y + 38}`} stroke={cols[i]} strokeWidth={5} fill="none" strokeDasharray="700" strokeDashoffset={700 * (1 - p)} />;
            })}
          </svg>
          {targets.map((n, i) => (
            <Fade key={n} at={a2 + 0.3 + i * 0.22} style={{ position: 'absolute', left: 1190, top: 170 + i * 108, width: 580 }}>
              <div style={{ height: 76, background: cols[i], color: P.bg, borderRadius: 10, display: 'flex', alignItems: 'center', padding: '0 30px', fontSize: 40, fontWeight: 700 }}>{n}</div>
            </Fade>
          ))}
        </>
      );
    },
  },
  // 4 · the output files, with their real text
  {
    from: 4, to: 4, lead: 0.3, tail: hold(4),
    render: (c) => {
      const t = useT();
      const at = [W(c, 4, 1, 0.0), W(c, 4, 1, 0.25), W(c, 4, 1, 0.5), W(c, 4, 1, 0.75), S(c, 4, 2), W(c, 4, 2, 0.5)];
      const wg = S(c, 4, 3);
      let active = -1; at.forEach((a, i) => { if (t >= a) active = i; });
      const showWg = t >= wg;
      const tile = (i: number) => ({ left: 150 + (i % 4) * 410, top: 110 + Math.floor(i / 4) * 116 });
      const key = active >= 0 ? FILES[active].key : '';
      return (
        <>
          {FILES.map((f, i) => {
            const on = ramp(t, at[i], at[i] + 0.35);
            return (
              <div key={f.name} style={{ position: 'absolute', ...tile(i), width: 390, height: 96, background: P.raised, borderRadius: 10, padding: '14px 20px', opacity: ramp(t, 0.2 + i * 0.08, 0.6 + i * 0.08) * (0.35 + 0.65 * on), boxShadow: i === active && !showWg ? `inset 0 0 0 3px ${P.mint}` : 'none' }}>
                <div style={{ fontFamily: MONO, fontSize: 23, fontWeight: 600 }}>{f.name}</div>
                <div style={{ fontSize: 22, color: P.dim, fontWeight: 600, marginTop: 6 }}>{f.api}</div>
              </div>
            );
          })}
          <Fade at={wg} dur={0.35} rise={12} style={{ position: 'absolute', ...tile(6), width: 390, height: 96, border: `2px dashed ${P.line}`, borderRadius: 10, padding: '14px 20px', boxShadow: showWg ? `inset 0 0 0 3px ${P.violet}` : 'none' }}>
            <div style={{ fontFamily: MONO, fontSize: 23, fontWeight: 600, color: P.dim }}>WGSL</div>
            <div style={{ fontSize: 22, color: P.dim, fontWeight: 600, marginTop: 6 }}>WebGPU · Próximamente</div>
          </Fade>
          {/* the preview: the C# source first, then the real text of each file */}
          {active < 0 ? <Fade at={0.4}><Code code={GRADIENT_CS.split('\n').slice(6, 10).map((l) => l.slice(8)).join('\n')} title="Gradient.cs · tu código" x={150} y={380} w={1620} fs={30} /></Fade> : null}
          {active >= 0 && !showWg && key !== 'spv' ? <Code key={key} code={OUT[key]} title={FILES[active].name + ' · generado'} x={150} y={380} w={1620} fs={24} chars={ramp(t, at[active], at[active] + 0.5) * OUT[key].length} /> : null}
          {key === 'spv' && !showWg ? (
            <div style={{ position: 'absolute', left: 150, top: 380, width: 1620, height: 460, background: P.raised, borderRadius: 14, padding: '28px 34px' }}>
              <div style={{ fontSize: 22, fontWeight: 600, color: P.dim }}>Gradient.spv · generado</div>
              <div style={{ fontSize: 44, fontWeight: 700, marginTop: 18 }}>Binario SPIR-V · {SPV_BYTES.toLocaleString('es-CL')} bytes</div>
              <div style={{ marginTop: 26, display: 'grid', gridTemplateColumns: 'repeat(60, 20px)', gap: 5 }}>
                {Array.from({ length: 360 }, (_, k) => {
                  const v = (Math.sin(k * 12.9898) * 43758.5453) % 1;
                  return <div key={k} style={{ width: 20, height: 20, borderRadius: 3, background: mix(P.bg, [P.pink, P.violet, P.mint][k % 3], 0.25 + 0.6 * Math.abs(v)), opacity: ramp(t, at[3] + k * 0.003, at[3] + k * 0.003 + 0.2) }} />;
                })}
              </div>
            </div>
          ) : null}
          {showWg ? (
            <Fade at={wg} style={{ position: 'absolute', left: 150, top: 380, width: 1620, height: 460, border: `2px dashed ${P.line}`, borderRadius: 14, padding: '40px 40px' }}>
              <div style={{ fontSize: 60, fontWeight: 700, color: P.dim, letterSpacing: '-0.03em' }}>WGSL · WebGPU</div>
              <div style={{ fontSize: 36, fontWeight: 600, color: P.violet, marginTop: 12 }}>Próximamente</div>
            </Fade>
          ) : null}
        </>
      );
    },
  },
  // 5 · your style: two vocabularies, one output
  {
    from: 5, to: 5, lead: 0.3, tail: hold(5),
    render: (c) => {
      const t = useT();
      const hS = S(c, 5, 0), gS = S(c, 5, 1), tS = S(c, 5, 2), rS = S(c, 5, 3);
      const struct = (a: string, b: string) => `public struct Corner\n{\n    [${a}] public vec2 Position;\n    [${b}] public vec4 Color;\n}`;
      const hlGl = t >= gS && t < tS ? [{ from: 2, to: 3 }] : [];
      const hlHl = t >= hS && t < gS ? [{ from: 2, to: 3 }] : [];
      const tags: [string, string, string, number][] = [['Metal', 'attribute(0)', P.pink, W(c, 5, 2, 0.3)], ['WGSL', 'location(0)', P.violet, W(c, 5, 2, 0.55)], ['SPIR-V', 'Location(0)', P.mint, W(c, 5, 2, 0.8)]];
      const merge = ramp(t, rS, rS + 0.8);
      return (
        <>
          <Fade at={0.2} style={{ position: 'absolute', left: 150, top: 96 }}><Kicker style={{ fontSize: 26 }}>Estilo de escritura</Kicker></Fade>
          <Code code={struct('location(0)', 'location(1)')} title="Estilo GLSL" x={150} y={150} w={790} fs={31} hl={hlGl} />
          <Code code={struct('TEXCOORD(0)', 'TEXCOORD(1)')} title="Estilo HLSL" x={980} y={150} w={790} fs={31} hl={hlHl} />
          <div style={{ opacity: 1 - merge }}>
            {tags.map(([n, a, col, at], i) => (
              <Fade key={n} at={at} style={{ position: 'absolute', left: 150 + i * 545, top: 540, width: 500 }}>
                <div style={{ borderTop: `6px solid ${col}`, paddingTop: 16 }}>
                  <div style={{ fontSize: 44, fontWeight: 700 }}>{n}</div>
                  <div style={{ fontFamily: MONO, fontSize: 32, color: P.dim, marginTop: 6 }}>[{a}]</div>
                </div>
              </Fade>
            ))}
          </div>
          <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, opacity: merge }}>
            <path d="M 545 470 C 545 600, 960 560, 960 650" stroke={P.mint} strokeWidth={5} fill="none" />
            <path d="M 1375 470 C 1375 600, 960 560, 960 650" stroke={P.mint} strokeWidth={5} fill="none" />
          </svg>
          <div style={{ position: 'absolute', left: 560, top: 660, width: 800, height: 150, background: P.raised, borderRadius: 12, padding: '20px 28px', opacity: merge, boxShadow: `inset 0 0 0 3px ${P.mint}` }}>
            <div style={{ fontSize: 22, fontWeight: 600, color: P.dim }}>Gradient.Vertex.glsl · la misma salida</div>
            <div style={{ fontFamily: MONO, fontSize: 30, marginTop: 14 }}>layout(location = 0) in vec2 Position;</div>
          </div>
        </>
      );
    },
  },
  // 6 · the examples, full width, with their code
  {
    from: 6, to: 6, lead: 0.3, tail: hold(6),
    render: (c) => {
      const t = useT();
      const cues = [S(c, 6, 0), S(c, 6, 2), S(c, 6, 3), S(c, 6, 4), S(c, 6, 5)];
      const allAt = S(c, 6, 6);
      let idx = 0; cues.forEach((q, i) => { if (t >= q) idx = i; });
      const ex = EX[idx];
      const local = t - cues[idx];
      const all = t >= allAt;
      const swap = 1 - ramp(local, 0, 0.35);
      if (all) {
        return (
          <>
            <Mosaic at={allAt - 0.05} step={0.12} />
            <Fade at={allAt + 0.4} style={{ position: 'absolute', left: 150, top: 790, fontSize: 34, fontWeight: 600, color: P.dim }}>Todo en <span style={{ color: P.pink }}>C#</span></Fade>
          </>
        );
      }
      return (
        <>
          <ShaderCanvas key={ex.name} name={ex.name} x={0} y={0} w={1920} h={860} cw={960} ch={430} time={local} radius={0} />
          {ex.name === 'gradient' ? <div style={{ position: 'absolute', left: 0, top: 860 * ramp(local, 0.1, 1.8), width: 1920, height: 860 * (1 - ramp(local, 0.1, 1.8)), background: P.bg }} /> : null}
          <div style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 860, background: P.bg, opacity: swap }} />
          <div style={{ position: 'absolute', left: 100, top: 860 - 30 - 64 - ex.code.split('\n').length * 38 - 70 }}>
            <Code key={ex.name} code={ex.code} title={ex.file} x={0} y={0} w={800} fs={25} chars={ex.code.indexOf('\n') + ramp(local, 0.2, 1.4) * (ex.code.length - ex.code.indexOf('\n'))} hl={local > 1.4 ? ex.hl : []} />
          </div>
          <div style={{ position: 'absolute', right: 100, top: 60, display: 'flex', gap: 12 }}>
            {EX.map((e, i) => <div key={e.name} style={{ width: 70, height: 10, borderRadius: 5, background: i <= idx ? P.pink : 'rgba(0,0,0,0)', boxShadow: `inset 0 0 0 2px ${P.pink}` }} />)}
          </div>
        </>
      );
    },
  },
  // 7 · install
  {
    from: 7, to: 7, lead: 0.3, tail: hold(7),
    render: (c) => {
      const t = useT();
      const cmds: [string, string, number, number][] = [
        ['dotnet new tool-manifest', 'manifiesto de herramientas', W(c, 7, 1, 0.0), W(c, 7, 1, 0.26)],
        ['dotnet tool install YotsubaShader.Compiler.CLI', 'compilador desde NuGet', W(c, 7, 1, 0.33), W(c, 7, 1, 0.62)],
        ['dotnet add MyShaders package YotsubaShader.GlslSyntax', 'paquete en tu proyecto', W(c, 7, 1, 0.68), W(c, 7, 1, 0.97)],
      ];
      return (
        <>
          <Fade at={S(c, 7, 0)} style={{ position: 'absolute', left: 150, top: 110 }}><Kicker style={{ fontSize: 26 }}>Instalación</Kicker></Fade>
          <Terminal x={150} y={170} w={1620} h={560}>
            {cmds.map(([cmd, lbl, a, b], i) => (
              <div key={i} style={{ height: 150, borderBottom: i < 2 ? `2px solid ${P.line}` : 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  <span style={{ fontSize: 40, fontWeight: 700, color: P.violet, width: 40 }}>{i + 1}</span>
                  <span style={{ fontFamily: MONO, fontSize: 34, color: P.pink }}>$</span>
                  <Typed text={cmd} from={a} to={b} fs={34} />
                </div>
                <div style={{ marginLeft: 64, fontSize: 26, fontWeight: 600, color: P.mint, opacity: ramp(t, b, b + 0.4) }}>✓ {lbl}</div>
              </div>
            ))}
          </Terminal>
        </>
      );
    },
  },
  // 8 · add: functions in your project, engine methods, and the game
  {
    from: 8, to: 8, lead: 0.3, tail: hold(8),
    render: (c) => {
      const t = useT();
      const s0 = S(c, 8, 0), s1 = S(c, 8, 1), s2 = S(c, 8, 2), s4 = S(c, 8, 3);
      const methods = ['byte[] ToSpirV(this Gradient shader)', 'string ToGlsl(this Gradient shader, Stage stage)', 'string ToHlsl(this Gradient shader, Stage stage)', 'string ToMSL(this Gradient shader, Stage stage)'];
      const engines: [string, string, string, number][] = [
        ['MonoGame', 'byte[] mgfx = shader.ToMGFX(MonoGamePlatform.DesktopGL);', P.pink, W(c, 8, 2, 0.45)], ['KNI', 'byte[] knifx = shader.ToKNIWebGL_FX();', P.violet, W(c, 8, 2, 0.62)], ['FNA', 'byte[] fxb = shader.ToFNA_FX();', P.mint, W(c, 8, 2, 0.8)],
      ];
      return (
        <>
          <Terminal x={150} y={90} w={1620} h={130}><div style={{ display: 'flex', gap: 20, alignItems: 'center' }}><span style={{ fontFamily: MONO, fontSize: 30, color: P.pink }}>$</span><Typed text="dotnet yotsuba add MyShaders/MyShaders.csproj --target spirv" from={s0 + 0.2} to={s0 + 1.8} fs={30} /></div></Terminal>
          {/* A: the file that add wrote */}
          <Slide at={s0 + 1.6} out={s2 - 0.3}>
            <div style={{ position: 'absolute', left: 150, top: 260, width: 1620, background: P.raised, borderRadius: 14, padding: '22px 32px 26px' }}>
              <div style={{ fontSize: 24, fontWeight: 600, color: P.dim, marginBottom: 14 }}>MyShaders/YotsubaShader.g.cs · lo escribió add</div>
              {methods.map((m, i) => (
                <div key={m} style={{ fontFamily: MONO, fontSize: 31, height: 54, opacity: ramp(t, s1 + i * 0.5, s1 + i * 0.5 + 0.35) }}><span style={{ color: P.violet }}>public static </span><span style={{ color: P.pink }}>{m.split(' ')[0]} </span>{m.slice(m.indexOf(' ') + 1)}</div>
              ))}
            </div>
            <div style={{ position: 'absolute', left: 150, top: 630, fontFamily: MONO, fontSize: 34, lineHeight: 1.6, opacity: ramp(t, W(c, 8, 1, 0.6), W(c, 8, 1, 0.6) + 0.5) }}>
              <div style={{ color: P.dim }}>var shader = new Gradient();</div>
              <div>string glsl = shader.<span style={{ color: P.pink }}>ToGlsl</span>(Stage.Fragment);</div>
            </div>
          </Slide>
          {/* B: the engine methods */}
          <Slide at={s2} out={s4 - 0.3}>
            <div style={{ position: 'absolute', left: 150, top: 262 }}><Kicker style={{ fontSize: 26 }}>MonoGame, KNI y FNA: un método cada uno</Kicker></div>
            {engines.map(([n, m, col, at], i) => (
              <div key={n} style={{ position: 'absolute', left: 150, top: 320 + i * 150, width: 1620, height: 130, borderBottom: `2px solid ${P.line}`, opacity: ramp(t, at, at + 0.35) }}>
                <div style={{ fontSize: 38, fontWeight: 700, color: col }}>{n}</div>
                <div style={{ fontFamily: MONO, fontSize: 32, marginTop: 10 }}>{m}</div>
              </div>
            ))}
          </Slide>
          {/* C: the game window */}
          <Slide at={s4}>
            <div style={{ position: 'absolute', left: 150, top: 300, width: 560, fontFamily: MONO, fontSize: 28, lineHeight: 1.6 }}>
              <div style={{ color: P.dim }}>// en tu juego</div>
              <div>byte[] effect =</div>
              <div>&nbsp;&nbsp;shader.<span style={{ color: P.pink }}>ToMGFX</span>(</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;MonoGamePlatform.DesktopGL);</div>
            </div>
            <div style={{ position: 'absolute', left: 760, top: 260, width: 1010, height: 610, background: P.raised, borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ height: 50, display: 'flex', alignItems: 'center', gap: 10, padding: '0 18px' }}>{[P.pink, P.violet, P.mint].map((x, i) => <div key={i} style={{ width: 14, height: 14, borderRadius: 7, background: x }} />)}<div style={{ marginLeft: 16, fontSize: 22, fontWeight: 600, color: P.dim }}>MyGame</div></div>
              <ShaderCanvas name="gradient" x={0} y={50} w={1010} h={560} cw={800} ch={444} radius={0} />
            </div>
          </Slide>
        </>
      );
    },
  },
  // 9 · compile: a folder with one file per format
  {
    from: 9, to: 9, lead: 0.3, tail: hold(9),
    render: (c) => {
      const t = useT();
      const a = S(c, 9, 0);
      const b = S(c, 9, 1);
      const files: [string, string, string, number][] = [
        ['Gradient.Fragment.glsl', '', P.ink, 0], ['Gradient.Vertex.glsl', '', P.ink, 0], ['Gradient.Fragment.hlsl', '', P.ink, 0], ['Gradient.Vertex.hlsl', '', P.ink, 0],
        ['Gradient.Fragment.msl', '', P.ink, 0], ['Gradient.Vertex.msl', '', P.ink, 0], ['Gradient.spv', '', P.ink, 0],
        ['Gradient.sdsl', 'Stride', P.pink, W(c, 9, 1, 0.7)], ['Gradient.shader', 'Unity', P.violet, W(c, 9, 1, 0.8)], ['Gradient.gdshader', 'Godot', P.mint, W(c, 9, 1, 0.9)],
      ];
      return (
        <>
          <Terminal x={150} y={70} w={1620} h={220}>
            <div><span style={{ fontFamily: MONO, fontSize: 27, color: P.pink }}>$ </span><Typed text="dotnet yotsuba compile MyShaders/MyShaders.csproj --output out" from={a + 0.1} to={a + 0.9} fs={27} /></div>
            <div style={{ marginTop: 8, marginLeft: 33 }}><Typed text="--target glsl --target hlsl --target msl --target spirv" from={a + 0.9} to={a + 1.4} fs={27} /></div>
            <div style={{ marginTop: 8, marginLeft: 33 }}><Typed text="--target stride --target unity --target godot" from={a + 1.4} to={a + 1.8} fs={27} /></div>
          </Terminal>
          <Fade at={a + 1.9} style={{ position: 'absolute', left: 150, top: 320, display: 'flex', alignItems: 'center', gap: 22 }}>
            <div style={{ width: 84, height: 64, background: P.violet, borderRadius: '6px 6px 10px 10px' }} />
            <div style={{ fontFamily: MONO, fontSize: 40, fontWeight: 600 }}>MyShaders/out/MyShaders/</div>
          </Fade>
          {files.map(([f, eng, col, when], i) => {
            const at = when || b + 0.1 + i * 0.28;
            const k = ramp(t, at, at + 0.45);
            return <div key={f} style={{ position: 'absolute', left: 250 + (i % 2) * 760, top: 420 + Math.floor(i / 2) * 84 - (1 - k) * 20, opacity: k, fontFamily: MONO, fontSize: 34, color: P.ink, display: 'flex', alignItems: 'center', gap: 18 }}><div style={{ width: 24, height: 30, borderRadius: 4, background: eng ? col : P.line }} />{f}{eng ? <span style={{ fontFamily: 'inherit', fontSize: 26, color: col, fontWeight: 600 }}>({eng})</span> : null}</div>;
          })}
        </>
      );
    },
  },
  // 10 · the editor warns while you type: the GPU has no disk
  {
    from: 10, to: 10, lead: 0.3, tail: hold(10),
    render: (c) => {
      const t = useT();
      const tyA = W(c, 10, 0, 0.12), tyB = W(c, 10, 0, 0.5);
      const warn = W(c, 10, 0, 0.56);
      const tip = W(c, 10, 0, 0.62);
      const bad = '        string[] files = Directory.GetFiles("Textures");';
      const n = Math.floor(lin(t, tyA, tyB) * bad.length);
      const before = ['public vec4 Fragment(Pixel pixel)', '{', '        float red = 1f;'];
      const sq = ramp(t, warn, warn + 0.4);
      const fs = 34, lh = fs * 1.6;
      return (
        <>
          <Fade at={0.2} style={{ position: 'absolute', left: 150, top: 96 }}><Kicker style={{ fontSize: 26 }}>En tu editor, mientras escribes</Kicker></Fade>
          <div style={{ position: 'absolute', left: 150, top: 150, width: 1620, height: 520, background: P.raised, borderRadius: 14, padding: '22px 34px' }}>
            <div style={{ fontSize: 22, fontWeight: 600, color: P.dim, marginBottom: 16 }}>MyShaders/Gradient.cs</div>
            {before.map((l, i) => <div key={i} style={{ fontFamily: MONO, fontSize: fs, height: lh, color: i === 0 ? P.violet : P.ink, whiteSpace: 'pre' }}>{i === 0 ? l.replace('    ', '') : l.replace('        ', '    ')}</div>)}
            <div style={{ position: 'relative', fontFamily: MONO, fontSize: fs, height: lh, whiteSpace: 'pre' }}>
              {bad.slice(0, n).replace('        ', '    ')}
              <svg width={1200} height={14} style={{ position: 'absolute', left: fs * 0.6 * 21, top: fs * 1.32, opacity: sq }}>
                <path d={Array.from({ length: 70 }, (_, i) => `${i === 0 ? 'M' : 'L'} ${i * 8} ${i % 2 ? 2 : 10}`).join(' ')} stroke={P.pink} strokeWidth={3} fill="none" strokeDasharray="1200" strokeDashoffset={1200 - 600 * sq} />
              </svg>
            </div>
            <div style={{ fontFamily: MONO, fontSize: fs, height: lh }}>{'}'}</div>
          </div>
          <div style={{ position: 'absolute', left: 150 + 34 + fs * 0.6 * 21, top: 150 + 22 + 38 + lh * 4 + 10, width: 900, background: P.bg, border: `2px solid ${P.pink}`, borderRadius: 10, padding: '18px 24px', opacity: ramp(t, tip, tip + 0.4), transform: `translateY(${(1 - ramp(t, tip, tip + 0.4)) * 12}px)` }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: P.pink }}>Directory.GetFiles no se puede usar en un shader</div>
            <div style={{ fontSize: 24, color: P.dim, marginTop: 8 }}>La GPU no tiene sistema de archivos.</div>
          </div>
          <Fade at={S(c, 10, 1)} style={{ position: 'absolute', left: 150, top: 760, display: 'flex', gap: 60, fontSize: 34, fontWeight: 600 }}>
            <div><span style={{ color: P.mint }}>✓</span> Sin compilar</div>
            <div><span style={{ color: P.mint }}>✓</span> Sin ejecutar</div>
            <div><span style={{ color: P.mint }}>✓</span> En el mismo editor</div>
          </Fade>
        </>
      );
    },
  },
  // 11 · where to start
  {
    from: 11, to: 11, lead: 0.4, tail: hold(11),
    render: (c) => (
      <Fade at={S(c, 11, 0) - 0.1} style={{ position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center' }}>
        <div style={{ fontSize: 40, fontWeight: 600, color: P.dim }}>Tutorial</div>
        <div style={{ fontSize: 130, fontWeight: 700, letterSpacing: '-0.04em', marginTop: 14 }}>yotsubashader<span style={{ color: P.pink }}>.com</span></div>
      </Fade>
    ),
  },
];

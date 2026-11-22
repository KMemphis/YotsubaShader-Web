// Stage of "What is a shader?" — motion graphics shown next to the text while the chapter is read aloud.
// Each scene starts at its `> [!SCENE] id` cue in content/<lang>/get-started/what-is-a-shader.md.
// `beats` are phrases of the narration (one per language); items appear at a beat (`at: 'name'` or 'name+0.5').
// Item kinds and their options: static/js/stage.js (KINDS). Format of this file: README.md, "Listen stage".
//
// The stage shows what the voice says instead of writing it, and never repeats the article's pictures: the GPU is a
// flat drawing whose fans and connector light up when the voice names them, the CPU and the GPU race on the same
// array, the `for` turns into Parallel.For, and every image is a live shader. World scenes (`world: true`) place
// each item with `keys` (x, y from the centre in cqw / cqh) and move a `cam`.

const csharp = (title, code) => ({ title, code, lang: 'csharp' });
const L = (en, es) => ({ en, es });
const cap = (text) => (typeof text === 'object' ? { en: cap(text.en), es: cap(text.es) } : `<b>${text}</b>`);

/* ------------------------------------------------------------------ C# on the stage */
const sunsetCs = (make) => `[ShaderStage(Stage.Fragment)]
[return: location(0)]
public vec4 Fragment(PixelIn pixel)
{
    float y = pixel.Uv.Y;
    return ${make}.Vec4(1f, 0.25f + 0.6f * y, 0.45f - 0.35f * y, 1f);
}`;
const SUNSET_CS = L(csharp('MyShaders/Sunset.cs', sunsetCs('Make')), csharp('MisShaders/Atardecer.cs', sunsetCs('Crear')));

const forCs = (arr, i) => `int[] ${arr} = [1, 2, 3, 4, 5];

for (int ${i} = 0; ${i} < ${arr}.Length; ${i}++)
{
    ${arr}[${i}] = ${arr}[${i}] * 2;
}`;
const parCs = (arr, i) => `int[] ${arr} = [1, 2, 3, 4, 5];

Parallel.For(0, ${arr}.Length, ${i} =>
{
    RandomOperation(${i});
});

void RandomOperation(int ${i})
{
    ${arr}[${i}] = ${arr}[${i}] * 2;
}`;
const opCs = (arr, i) => `void RandomOperation(int ${i})
{
    ${arr}[${i}] = ${arr}[${i}] * 2;
}`;
const FOR_CS = L(csharp('Program.cs', forCs('entities', 'index')), csharp('Program.cs', forCs('entidades', 'indice')));
const PAR_CS = L(csharp('Program.cs', parCs('entities', 'index')), csharp('Program.cs', parCs('entidades', 'indice')));
const OP_CS = L(csharp('Program.cs', opCs('entities', 'index')), csharp('Program.cs', opCs('entidades', 'indice')));

const redCs = (make, file) => `[ShaderStage(Stage.Fragment)]
[return: location(0)]
public vec4 Fragment(PixelIn pixel)
{
${file ? `    File.WriteAllText("log.txt", "${file}");\n` : ''}    return ${make}.Vec4(1f, 0f, 0f, 1f);
}`;
const RED_BAD = L(csharp('MyShaders/Red.cs', redCs('Make', 'hello')), csharp('MisShaders/Rojo.cs', redCs('Crear', 'hola')));
const RED_OK = L(csharp('MyShaders/Red.cs', redCs('Make')), csharp('MisShaders/Rojo.cs', redCs('Crear')));

// the same red shader in the languages of three graphics APIs
const HLSL = { title: 'Red.hlsl', lang: 'csharp', code: 'float4 main() : SV_Target\n{\n    return float4(1, 0, 0, 1);\n}' };
const GLSL = { title: 'red.frag', lang: 'csharp', code: 'out vec4 color;\n\nvoid main()\n{\n    color = vec4(1, 0, 0, 1);\n}' };
const MSL = { title: 'Red.metal', lang: 'csharp', code: 'fragment float4 red()\n{\n    return float4(1, 0, 0, 1);\n}' };

/* ------------------------------------------------------------------ live shaders: vec4 shade(vec2 uv, float t), uv from the bottom left */
const PINK = 'vec3(1.,.48,.7)', VIOLET = 'vec3(.77,.64,1.)', MINT = 'vec3(.38,.94,.82)', ORANGE = 'vec3(1.,.71,.33)';
const SH = {
  sunset: 'float y=1.-uv.y+.015*sin(uv.x*9.+t*1.3);return vec4(1.,.25+.6*y,.45-.35*y,1.);',
  cores: `vec2 n=vec2(44.,27.);vec2 g=floor(uv*n),f=fract(uv*n);float h=fract(sin(dot(g,vec2(12.9898,78.233)))*43758.5453);float on=smoothstep(.7,.95,.5+.5*sin(t*(1.+h*1.6)+h*40.));float sq=step(.16,f.x)*step(.16,f.y)*step(f.x,.9)*step(f.y,.9);vec3 hot=mix(${MINT},${VIOLET},h);return vec4(mix(vec3(.07,.07,.1),mix(vec3(.17,.17,.23),hot,on),sq),1.);`,
  // 40 × 25 = 1000 cells, all of them at once
  all: `vec2 n=vec2(40.,25.);vec2 g=floor(uv*n),f=fract(uv*n);float sq=step(.14,f.x)*step(.14,f.y)*step(f.x,.86)*step(f.y,.86);float k=fract(t/1.6);float lit=smoothstep(0.,.06,k)*(1.-smoothstep(.45,.75,k));return vec4(mix(vec3(.07,.07,.1),mix(vec3(.17,.17,.23),${MINT},lit),sq),1.);`,
  // the same 1000 cells, one after another
  one: `vec2 n=vec2(40.,25.);vec2 g=floor(uv*n),f=fract(uv*n);float sq=step(.14,f.x)*step(.14,f.y)*step(f.x,.86)*step(f.y,.86);float i=mod(floor(t*14.),1000.);float id=(n.y-1.-g.y)*n.x+g.x;vec3 c=id<i?vec3(.42,.31,.17):vec3(.17,.17,.23);if(id==i)c=${ORANGE};return vec4(mix(vec3(.07,.07,.1),c,sq),1.);`,
  red: 'return vec4(1.,0.,0.,1.);',
  gradient: 'return vec4(uv.x,1.-uv.y,.6,1.);',
  water: 'vec2 p=uv;p.x+=sin(uv.y*16.+t*2.)*.012;p.y+=cos(uv.x*13.+t*1.7)*.012;vec3 c=mix(vec3(.01,.16,.32),vec3(.08,.62,.78),p.y);vec2 q=p*7.;float ca=0.;for(int i=0;i<3;i++){q+=vec2(sin(q.y+t*.9),cos(q.x+t*1.1));ca+=.06/(.05+abs(sin(q.x+q.y)));}c+=ca*.09;float f=smoothstep(.09,.08,length((p-vec2(.5+.08*sin(t*.7),.45))*vec2(1.,2.2)));c=mix(c,vec3(1.,.5,.15),f);return vec4(c,1.);',
  fire: 'float n=fbm(vec2(uv.x*5.,uv.y*3.-t*2.2));float f=clamp((1.-uv.y)*1.25-n*.95+.12,0.,1.);vec3 c=mix(vec3(.06,.02,.04),vec3(1.,.32,.05),smoothstep(.25,.6,f));c=mix(c,vec3(1.,.88,.5),smoothstep(.62,.95,f));return vec4(c,1.);',
  // a light moving over a dotted floor
  light: `vec2 p=(uv-.5)*vec2(uRes.x/uRes.y,1.);vec2 l=vec2(.45*sin(t*1.3),.18*cos(t*1.1));float d=length(p-l);vec3 c=vec3(.06,.06,.09)+vec3(1.,.85,.6)*.09/(d*d*6.+.08);vec2 g=fract(p*8.);c+=smoothstep(.12,.08,length(g-.5))*${VIOLET}*.35/(d*4.+.3);return vec4(c,1.);`,
  // the effect when you get hit: a shake and a red edge that fades
  hit: 'float k=exp(-mod(t,1.4)*3.5);vec2 q=uv+vec2(sin(t*40.),cos(t*37.))*.008*k;float y=1.-q.y;vec3 c=vec3(1.,.25+.6*y,.45-.35*y);float v=length(uv-.5)*1.5;return vec4(mix(c,vec3(.75,0.,.05),clamp(v*v*k*1.8,0.,.85)),1.);',
  rgbTriangle: `vec2 p=vec2((uv.x-.5)*uRes.x/uRes.y+.5,uv.y);vec2 a=vec2(.5,.9),b=vec2(.14,.12),c=vec2(.86,.12);vec2 v0=b-a,v1=c-a,v2=p-a;float d00=dot(v0,v0),d01=dot(v0,v1),d11=dot(v1,v1),d20=dot(v2,v0),d21=dot(v2,v1);float den=d00*d11-d01*d01;float v=(d11*d20-d01*d21)/den,w=(d00*d21-d01*d20)/den,u=1.-v-w;if(min(u,min(v,w))<0.)return vec4(vec3(.1,.1,.14),1.);return vec4(u*${PINK}+v*${VIOLET}+w*${MINT},1.);`,
};
const NOISE = `float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vnoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*vnoise(p);p*=2.03;a*=.5;}return v;}`;

// a triangle on a grid of 32 × 20 pixels: its 3 points (Vertex), then the 184 pixels whose centre falls inside (Fragment)
const TRI = `const vec2 A=vec2(.5,.88),B=vec2(.14,.12),C=vec2(.86,.12);const vec2 N=vec2(32.,20.);
float ed(vec2 a,vec2 b,vec2 p){return (b.x-a.x)*(p.y-a.y)-(b.y-a.y)*(p.x-a.x);}
bool inside(vec2 p){float a=ed(A,B,p),b=ed(B,C,p),c=ed(C,A,p);return (a>=0.&&b>=0.&&c>=0.)||(a<=0.&&b<=0.&&c<=0.);}
float seg(vec2 p,vec2 a,vec2 b,float r){vec2 pa=(p-a)*vec2(r,1.),ba=(b-a)*vec2(r,1.);float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h);}
vec3 cells(vec2 uv){vec2 f=fract(uv*N);return mix(vec3(.07,.07,.1),vec3(.13,.13,.18),step(.08,f.x)*step(.08,f.y));}`;
const TRI_VERTEX = `float r=uRes.x/uRes.y;vec3 c=cells(uv);float l=min(min(seg(uv,A,B,r),seg(uv,B,C,r)),seg(uv,C,A,r));c=mix(c,${PINK},smoothstep(.006,.002,l)*.7);float k=t/.7;vec2 V[3]=vec2[3](A,B,C);for(int i=0;i<3;i++){float d=length((uv-V[i])*vec2(r,1.));float on=float(i)<k?1.:.3;c=mix(c,vec3(1.),smoothstep(.03,.024,d)*on);}return vec4(c,1.);`;
const TRI_FRAGMENT = 'vec2 g=floor(uv*N);vec2 ctr=(g+.5)/N;vec3 c=cells(uv);float id=(N.y-1.-g.y)*N.x+g.x;vec2 f=fract(uv*N);float sq=step(.08,f.x)*step(.08,f.y);if(inside(ctr)&&id<t*260.){float y=1.-ctr.y;c=mix(c,vec3(1.,.25+.6*y,.45-.35*y),sq);}return vec4(c,1.);';

/* ------------------------------------------------------------------ flat drawings (inline SVG) */
const fan = (x) => `<g class="fan" transform="translate(${x} 58)"><circle class="part" r="40" fill="#14141c" stroke="#55556a" stroke-width="2"/><g>${[0, 72, 144, 216, 288].map((a) => `<path d="M0 -6 C12 -14 14 -30 4 -36 C0 -24 -6 -14 0 -6Z" fill="#3a3a4c" transform="rotate(${a})"/>`).join('')}<animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="1.6s" repeatCount="indefinite"/></g><circle r="9" fill="#2a2a38" stroke="#55556a"/></g>`;
const CARD_SVG = `<svg class="s-art" viewBox="0 0 320 136" aria-hidden="true"><rect x="4" y="6" width="312" height="104" rx="12" fill="#22222e" stroke="#4a4a5c" stroke-width="2"/>${fan(70)}${fan(160)}${fan(250)}<rect class="part edge" x="34" y="110" width="200" height="14" rx="2" fill="#2a2a38" stroke="#4a4a5c" stroke-width="2"/>${Array.from({ length: 24 }, (_, i) => `<rect x="${40 + i * 8}" y="114" width="4" height="8" fill="#55556a"/>`).join('')}</svg>`;
const CHIP_SVG = `<svg class="s-art" viewBox="0 0 160 160" aria-hidden="true">${Array.from({ length: 8 }, (_, i) => `<rect x="${26 + i * 15}" y="2" width="6" height="12" fill="#55556a"/><rect x="${26 + i * 15}" y="146" width="6" height="12" fill="#55556a"/><rect x="2" y="${26 + i * 15}" width="12" height="6" fill="#55556a"/><rect x="146" y="${26 + i * 15}" width="12" height="6" fill="#55556a"/>`).join('')}<rect x="14" y="14" width="132" height="132" rx="12" fill="#22222e" stroke="#4a4a5c" stroke-width="2"/><rect x="26" y="26" width="48" height="108" rx="6" fill="#1a1a24" stroke="#c5a3ff" stroke-width="2"/><text x="50" y="84" text-anchor="middle">CPU</text><rect class="part gpu-area" x="82" y="26" width="52" height="108" rx="6" fill="#1a1a24" stroke="#4a4a5c" stroke-width="2"/><g>${Array.from({ length: 30 }, (_, i) => `<rect class="part" x="${88 + (i % 5) * 9}" y="${34 + Math.floor(i / 5) * 9}" width="6" height="6" fill="#33334a"/>`).join('')}</g><text x="108" y="104" text-anchor="middle">GPU</text></svg>`;
const DISK_SVG = `<svg class="s-art" viewBox="0 0 160 110" aria-hidden="true"><rect x="4" y="4" width="152" height="102" rx="12" fill="#22222e" stroke="#4a4a5c" stroke-width="2"/><circle cx="62" cy="55" r="34" fill="#1a1a24" stroke="#55556a" stroke-width="2"/><circle cx="62" cy="55" r="6" fill="#55556a"/><rect x="108" y="22" width="34" height="8" rx="2" fill="#33334a"/><rect class="part slot" x="108" y="40" width="34" height="8" rx="2" fill="#33334a"/><rect x="108" y="58" width="34" height="8" rx="2" fill="#33334a"/><circle cx="138" cy="92" r="4" fill="#62f0d0"/></svg>`;

const FILE = { k: 'file', ext: 'file.txt', sub: L('"hello"', '"hola"') };

export default [
  /* 0:00 — the picture first: a live shader fills the screen; then it turns out to be one C# method, and the method
     goes into the picture */
  {
    id: 'intro',
    world: true,
    beats: { fn: L('a function', 'una función'), gpu: L('runs on the GPU', 'se ejecute en la GPU') },
    items: [
      { k: 'gl', fill: true, tiles: [{ frag: SH.sunset }], fx: 'fade', dur: 1.2,
        keys: [{ x: 0, y: 0, w: 100, h: 100, r: 0 }, { at: 'fn', x: 0, y: -18, w: 70, h: 36, r: 14, d: 1.2 }, { at: 'gpu', s: 0.92, d: 0.8 }] },
      { k: 'title', cls: 's-over', at: 0.3, out: 'fn', text: L('What is a <em>shader</em>?', '¿Qué es un <em>Shader</em>?'), keys: [{ x: 0, y: 0 }] },
      { k: 'code', at: 'fn+0.3', type: 'fn+0.5', cps: 70, cls: 'wide', code: SUNSET_CS,
        keys: [{ x: 0, y: 22, w: 96 }, { at: 'gpu+0.2', y: -18, s: 0.25, o: 0, d: 1 }] },
    ],
  },

  /* 0:13 — the GPU: a card with three fans (desktop) or a block inside the processor (laptops, phones). When the voice
     describes the card, its fans and its connector light up */
  {
    id: 'gpu',
    world: true,
    beats: { apart: L('a separate part', 'una pieza aparte'), inside: L('inside the processor', 'dentro del mismo procesador'), phones: L('phones', 'teléfonos'), photo: L('In the photo', 'En la foto'), fans: L('three round fans', 'tres ventiladores'), edge: L('a metal edge', 'un borde de metal'), hand: L('take in your hand', 'tomar con la mano') },
    items: [
      { k: 'html', at: 0.2, fx: 'pop', html: CARD_SVG,
        on: [{ at: 'apart', out: 'inside', cls: 'fans' }, { at: 'fans', out: 'edge', cls: 'fans' }, { at: 'edge', cls: 'edge' }],
        keys: [{ x: -21, y: -6, w: 50 }, { at: 'photo', x: 0, y: -4, w: 88, d: 1.4 }, { at: 'hand', s: 1.05, d: 0.6 }] },
      { k: 'word', at: 'apart', out: 'photo', cls: 's-dim', text: L('Desktop', 'Escritorio'), keys: [{ x: -21, y: 14 }] },
      { k: 'html', at: 'inside', out: 'photo', fx: 'pop', html: CHIP_SVG, on: [{ at: 'inside+0.7', cls: 'lit' }], keys: [{ x: 27, y: -6, w: 30 }] },
      { k: 'word', at: 'phones', out: 'photo', cls: 's-dim', text: L('Laptop · phone', 'Portátil · teléfono'), keys: [{ x: 27, y: 14 }] },
    ],
  },

  /* 0:41 — Node needs an operating system; take the system away and it falls. C# and the GPU were the same story */
  {
    id: 'node',
    beats: { node: L('JavaScript with Node', 'JavaScript con Node'), clean: L('clean', 'limpio'), cs: L('with C# and the GPU', 'con C# y la GPU'), before: L('before Yotsuba Shader', 'antes de Yotsuba Shader') },
    items: [
      { k: 'kicker', text: L('Without an operating system', 'Sin sistema operativo') },
      { k: 'stack', at: 'node', layers: [
        { text: 'Node.js', color: '#7fe3a8', fail: 'clean+0.6', alt: { at: 'cs', text: 'C#', color: '#ff7ab2' } },
        { text: L('Operating system', 'Sistema operativo'), remove: 'clean' },
        { text: 'Hardware', alt: { at: 'cs', text: 'GPU', color: '#5ad1ff' } },
      ] },
      { k: 'text', at: 'before', text: L('…before <b>Yotsuba Shader</b>', '…antes de <b>Yotsuba Shader</b>') },
    ],
  },

  /* 1:01 — the languages we know walk up to the GPU and bounce off */
  {
    id: 'langs',
    world: true,
    beats: { cs: 'C#', js: 'JavaScript', java: 'Java', rust: 'Rust', hard: L('very hard to translate', 'muy difíciles de traducir') },
    items: [
      { k: 'gl', at: 0.2, fx: 'pop', keys: [{ x: 25, y: 0, w: 40 }], tiles: [{ frag: SH.cores, cap: cap('GPU') }] },
      ...[['.cs', 'C#', 'cs'], ['.js', 'JavaScript', 'js'], ['.java', 'Java', 'java'], ['.rs', 'Rust', 'rust']].map(([ext, sub, beat], i) => ({
        k: 'file', ext, sub, at: beat, fx: 'left', mark: { at: `hard+${0.6 + i * 0.25}`, kind: 'x' },
        keys: [{ x: -28, y: -27 + i * 18, w: 26 }, { at: `hard+${i * 0.25}`, x: -2, d: 0.45 }, { at: `hard+${0.5 + i * 0.25}`, x: -28, d: 0.6 }],
      })),
    ],
  },

  /* 1:22 — the same line on both sides: on the CPU the file lands on the disk; on the GPU there is nowhere to go */
  {
    id: 'file',
    world: true,
    beats: { line: L('a line like this one', 'algo como esta línea'), saves: L('saves it', 'lo guarda'), gpuline: L('On the GPU this line', 'En la GPU esta línea'), nodisk: L('there is no disk', 'no hay un disco'), comment: L('the comment', 'el comentario') },
    items: [
      { k: 'kicker', at: 0.2, cls: 's-cpu', text: 'CPU', keys: [{ x: -25, y: 2 }] },
      { k: 'html', at: 0.3, fx: 'pop', html: DISK_SVG, on: [{ at: 'saves+0.5', cls: 'saved' }], mark: { at: 'saves+0.6', kind: 'check' }, keys: [{ x: -25, y: 22, w: 30 }] },
      { k: 'kicker', at: 0.4, cls: 's-gpu', text: 'GPU', keys: [{ x: 25, y: 2 }] },
      { k: 'gl', at: 0.5, fx: 'pop', keys: [{ x: 25, y: 22, w: 36 }], tiles: [{ frag: SH.cores, marks: [{ at: 'nodisk', kind: 'x' }] }] },
      { k: 'code', at: 'line', type: 'line+0.2', cps: 34, cls: 'wide', keys: [{ x: 0, y: -28, w: 96 }],
        code: L(csharp('Program.cs', '// There is no file system on the GPU\nFile.WriteAllText("file.txt", "hello");'), csharp('Program.cs', '// No existe un sistema de archivos en la GPU\nFile.WriteAllText("file.txt", "hola");')),
        hl: [{ at: 'comment', lines: [0] }] },
      { ...FILE, at: 'saves-1.2', fx: 'fade', keys: [{ x: 0, y: -12, w: 20, s: 0.6 }, { at: 'saves-1.2', s: 1, d: 0.4 }, { at: 'saves-0.5', x: -25, y: 18, s: 0.45, o: 0, d: 1.1 }] },
      { ...FILE, at: 'gpuline', fx: 'fade', keys: [{ x: 0, y: -12, w: 20, s: 0.6 }, { at: 'gpuline', s: 1, d: 0.4 }, { at: 'gpuline+0.6', x: 25, y: 4, d: 1.2 }, { at: 'nodisk', o: 0, s: 0.6, d: 0.7 }] },
    ],
  },

  /* 1:50 — the rest of what is missing on the GPU, struck out */
  {
    id: 'nope',
    beats: { lists: L('no lists', 'las listas'), inherit: L('inheritance', 'herencia'), exc: L('exceptions', 'excepciones') },
    items: [
      { k: 'kicker', text: L('Not on the GPU either', 'Tampoco en la GPU') },
      { k: 'word', cls: 's-mono', text: 'string', at: 0.1, strike: 0.7 },
      { k: 'word', cls: 's-mono', text: 'List&lt;T&gt;', at: 'lists', strike: 'lists+0.5' },
      { k: 'word', cls: 's-mono', text: 'class B : A', at: 'inherit', strike: 'inherit+0.5' },
      { k: 'word', cls: 's-mono', text: 'try { } catch { }', at: 'exc', strike: 'exc+0.5' },
    ],
  },

  /* 1:55 — what is left is math: three operations with their results; then the question, and a field of thousands
     of small operations that answers it */
  {
    id: 'math',
    world: true,
    beats: { add: L('adding', 'sumar'), mul: L('multiplying', 'multiplicar'), cmp: L('comparing', 'comparar'), why: L('Why do we want', '¿Por qué queremos'), many: L('many calculations at once', 'muchas cuentas a la vez') },
    items: [
      { k: 'word', cls: 's-mono', at: 'add', out: 'why', fx: 'pop', text: '2 + 3 = <span class="s-ok">5</span>', keys: [{ x: 0, y: -16 }] },
      { k: 'word', cls: 's-mono', at: 'mul', out: 'why', fx: 'pop', text: '4 × 6 = <span class="s-ok">24</span>', keys: [{ x: 0, y: 0 }] },
      { k: 'word', cls: 's-mono', at: 'cmp', out: 'why', fx: 'pop', text: L('7 &lt; 9 → <span class="s-ok">true</span>', '7 &lt; 9 → <span class="s-ok">sí</span>'), keys: [{ x: 0, y: 16 }] },
      { k: 'title', at: 'why', out: 'many', text: L('Why?', '¿Por qué?'), keys: [{ x: 0, y: 0 }] },
      { k: 'gl', at: 'many', fx: 'pop', keys: [{ x: 0, y: 2, w: 88 }], tiles: [{ frag: SH.cores }] },
    ],
  },

  /* 2:26 — 10 big cores against thousands of small ones; the camera flies into the GPU, where each small worker is
     a pixel of a live picture, and comes back for the description of the comparison */
  {
    id: 'cores',
    world: true,
    beats: { ten: L('10 cores', '10 núcleos'), gpu: L('A GPU, on the other hand', 'Una GPU, en cambio'), why: L('a game, an AI', 'un juego, una IA'), image: L('In this image', 'En esta imagen'), left: L('On the left', 'A la izquierda'), right: L('On the right', 'A la derecha'), crowd: L('a crowd', 'una multitud') },
    cam: [{ s: 1 }, { at: 'why', x: 24.2, y: 1.4, s: 1.8, d: 1.4 }, { at: 'image', x: 0, y: 0, s: 1, d: 1.4 }, { at: 'left', x: -24, s: 1.5 }, { at: 'right', x: 24, s: 1.5 }, { at: 'crowd', x: 0, s: 1, d: 1.4 }],
    items: [
      { k: 'cores', cpu: 'ten', gpu: 'gpu', cpuText: L('<b>10</b> threads', '<b>10</b> hilos'), gpuText: L('<b>thousands</b>', '<b>miles</b>'), keys: [{ x: 0, y: 0, w: 92 }] },
      { k: 'gl', at: 'why+0.9', out: 'image', fx: 'fade', radius: 6, keys: [{ x: 24.2, y: 1.4, w: 38 }], tiles: [{ frag: SH.sunset, aspect: '44 / 26' }] },
    ],
  },

  /* 3:24 — a for goes through the array; then the CPU and the GPU race on it, one index after another, and the CPU
     wins. When each GPU thread takes a different index, the GPU does all of them in one step and wins */
  {
    id: 'for',
    world: true,
    beats: { loop: L('a for loop', 'un for lo recorre'), measure: L('measured', 'midiéramos'), each: L('each GPU thread', 'cada hilo de la GPU') },
    items: [
      { k: 'code', at: 0.2, out: 'measure', type: 0.4, cps: 60, cls: 'wide', code: FOR_CS, hl: [{ at: 'loop', lines: [2, 4] }], keys: [{ x: 0, y: -18, w: 94 }] },
      { k: 'array', at: 0.6, out: 'measure', run: 'loop', mode: 'for', step: 0.75, keys: [{ x: 0, y: 26 }] },
      { k: 'race', at: 'measure', keys: [{ x: 0, y: 2, w: 92 }], lanes: [
        { label: 'CPU', cls: 'cpu', runs: [{ at: 'measure+0.4', mode: 'seq', step: 0.5, win: true }, { at: 'each+0.6', mode: 'seq', step: 0.5 }] },
        { label: 'GPU', cls: 'gpu', runs: [{ at: 'measure+0.4', mode: 'seq', step: 1.3 }, { at: 'each+0.6', mode: 'par', step: 1.3, win: true }] },
      ] },
    ],
  },

  /* 4:25 — the for turns into Parallel.For; the loop is gone and only the function on one index remains. Then 5
     indexes become 1000, the CPU lights one cell at a time while the GPU lights all of them, and the function on one
     index gets its name */
  {
    id: 'parallel',
    world: true,
    beats: { par: L('It is called', 'Se llama'), spread: L('spreading the indexes', 'repartiendo los índices'), one: L('You only write the', 'Solo escribes la función'), many: L('many, many more threads', 'muchísimos más hilos'), k: L('around 1000 indexes', 'alrededor de 1000'), cpu1: L('the CPU works on', 'la CPU trabaja sobre'), gpu1000: L('the GPU can do the same', 'la GPU puede hacer lo mismo'), shader: L('is exactly what we call a shader', 'es justo lo que llamamos Shader') },
    items: [
      { k: 'morph', at: 0.1, morph: 'par', dur: 1.5, fresh: 'one', from: FOR_CS, to: PAR_CS, hl: [{ at: 'one', lines: [7, 8, 9, 10] }],
        out: 'shader', keys: [{ x: 0, y: -14, w: 94 }, { at: 'many', x: -27, y: -30, s: 0.42, d: 1.2 }] },
      { k: 'array', at: 'spread', out: 'many', run: 'spread', mode: 'parallel', keys: [{ x: 0, y: 30 }] },
      { k: 'gl', at: 'many+0.4', out: 'cpu1', fx: 'pop', radius: 8, keys: [{ x: 0, y: 8, w: 86 }], tiles: [{ frag: SH.all, aspect: '40 / 25' }] },
      { k: 'big', cls: 's-ok', at: 'k', out: 'cpu1', count: { to: 1000, dur: 1.2 }, text: '0', keys: [{ x: 27, y: -30 }] },
      { k: 'gl', at: 'cpu1', out: 'shader', cols: 2, gap: 3, radius: 8, keys: [{ x: 0, y: 6, w: 94 }], tiles: [
        { frag: SH.one, aspect: '40 / 25', cap: L('<b>CPU</b> · 1 index at a time', '<b>CPU</b> · 1 índice cada vez') },
        { frag: SH.all, at: 'gpu1000', aspect: '40 / 25', cap: L('<b>GPU</b> · about 1000 at once', '<b>GPU</b> · unos 1000 a la vez') },
      ] },
      { k: 'code', at: 'shader', fx: 'pop', cls: 'wide', code: OP_CS, hl: [{ at: 'shader', lines: [0, 1, 2, 3] }], tags: [{ at: 'shader+0.4', line: 0, text: 'Shader' }], keys: [{ x: 0, y: 0, w: 94 }] },
    ],
  },

  /* 5:57 — the screen is a grid; Full HD is 2 million pixels, 60 times a second */
  {
    id: 'pixels',
    beats: { pixel: L('Each dot is a pixel', 'Cada punto es un píxel'), hd: '1920', million: L('2 million', '2 millones'), sixty: L('60 times per second', '60 veces por segundo'), array: L('the array is the pixels', 'el arreglo son los píxeles') },
    items: [
      { k: 'pixels', zoom: 'pixel', index: 'array' },
      { k: 'slot', at: 'hd', items: [
        { k: 'big', text: '1920 × 1080', at: 'hd', out: 'million' },
        { k: 'big', at: 'million', out: 'sixty', count: { from: 0, to: 2073600, dur: 1.4 }, text: '0' },
        { k: 'big', cls: 's-accent', at: 'sixty', count: { from: 2073600, to: 124416000, dur: 1.8, suffix: ' /s' }, text: '' },
      ] },
      { k: 'text', at: 'million+0.6', text: L('pixels · <b>× 60</b> every second', 'píxeles · <b>× 60</b> cada segundo') },
    ],
  },

  /* 6:32 — every pixel goes to the same function and comes back with a colour; then all of them at once */
  {
    id: 'fragment',
    beats: { recv: L('receives a pixel', 'recibe un píxel'), all: L('all of them at the same time', 'a todos al mismo tiempo') },
    items: [
      { k: 'fragment', start: 'recv', all: 'all', sig: L('pixel → color', 'píxel → color') },
    ],
  },

  /* 6:59 — the same window, a different function each time the voice names one: red, a gradient, water, fire,
     a light, the hit effect */
  {
    id: 'shade',
    beats: { red: L('always return red', 'devuelves siempre rojo'), grad: L('position of the pixel', 'posición del píxel'), water: L('underwater', 'bajo el agua'), fire: L('fire', 'fuego'), lights: L('lights', 'luces'), hit: L('get hit', 'golpean') },
    items: [
      { k: 'shader', lib: NOISE, modes: [
        { at: 0, frag: 'return vec4(mix(vec3(.07,.07,.1),vec3(.12,.1,.17),uv.y),1.);' },
        { at: 'red', frag: SH.red },
        { at: 'grad', frag: SH.gradient },
        { at: 'water', frag: SH.water },
        { at: 'fire', frag: SH.fire },
        { at: 'lights', frag: SH.light },
        { at: 'hit', frag: SH.hit },
      ] },
      { k: 'slot', items: [
        { k: 'code', at: 'red', out: 'grad', code: L(csharp('Fragment', 'return Make.Vec4(1f, 0f, 0f, 1f);'), csharp('Fragment', 'return Crear.Vec4(1f, 0f, 0f, 1f);')) },
        { k: 'code', at: 'grad', out: 'water', code: L(csharp('Fragment', 'return Make.Vec4(pixel.Uv.X, pixel.Uv.Y, 0.6f, 1f);'), csharp('Fragment', 'return Crear.Vec4(pixel.Uv.X, pixel.Uv.Y, 0.6f, 1f);')) },
      ] },
    ],
  },

  /* 7:31 — one triangle, three ways to call a function: 3 times (its points), 184 times (its pixels), and 5 times
     for the entities array, which draws nothing */
  {
    id: 'stages',
    world: true,
    beats: { stage: L('is called a stage', 'se le llama etapa'), v: L('Vertex runs once', 'Vertex se ejecuta'), f: L('Fragment runs once', 'Fragment se ejecuta'), c: L('And Compute runs', 'Y Compute se ejecuta') },
    items: [
      ...['Vertex', 'Fragment', 'Compute'].map((name, i) => ({
        k: 'word', cls: 's-dim', text: name, at: `stage+${i * 0.25}`, fx: 'pop',
        on: [{ at: ['v', 'f', 'c'][i], out: ['f', 'c', null][i], cls: 'hot' }],
        keys: [{ x: -30 + i * 30, y: 0 }, { at: 'v', y: -38, s: 0.8, d: 0.9 }],
      })),
      { k: 'gl', at: 'v-0.3', out: 'c', fx: 'fade', lib: TRI, radius: 10, keys: [{ x: 0, y: -2, w: 76 }],
        tiles: [{ modes: [{ frag: TRI_VERTEX }, { at: 'f', frag: TRI_FRAGMENT }] }] },
      { k: 'big', at: 'v+0.6', out: 'f', count: { to: 3, dur: 2.1, prefix: '× ' }, text: '× 0', keys: [{ x: 0, y: 32 }] },
      { k: 'big', at: 'f+0.3', out: 'c', count: { to: 184, dur: 2.4, prefix: '× ' }, text: '× 0', keys: [{ x: 0, y: 32 }] },
      { k: 'array', at: 'c+0.2', run: 'c+0.8', mode: 'parallel', keys: [{ x: 0, y: -2 }] },
      { k: 'big', at: 'c+0.8', count: { to: 5, dur: 0.6, prefix: '× ' }, text: '× 0', keys: [{ x: 0, y: 26 }] },
    ],
  },

  /* 8:06 — three points, Vertex, the GPU fills it in, Fragment colours it (twice: the voice goes through it again) */
  {
    id: 'pipeline',
    beats: { v: L('the Vertex stage places', 'la etapa Vertex coloca'), r: L('figures out which pixels', 'averigua qué píxeles'), f: L('the Fragment stage gives', 'la etapa Fragment le pone'), again: L('On the left there are three points', 'A la izquierda hay tres puntos'), v2: L('They go through Vertex', 'Pasan por Vertex'), r2: L('the GPU marks', 'la GPU marca'), f2: L('finally Fragment', 'por último Fragment') },
    items: [
      { k: 'pipeline', vertex: 'v', raster: 'r', fragment: 'f', again: { at: 'again', vertex: 'v2', raster: 'r2', fragment: 'f2' } },
    ],
  },

  /* 8:51 — every API has its own language (the same red shader three times); with Yotsuba Shader it is one C# file:
     the compiler rejects the line the GPU cannot run, and translates the rest to each API */
  {
    id: 'yotsuba',
    world: true,
    beats: { hlsl: 'HLSL', glsl: 'GLSL', metal: 'Metal', none: L('none of them knows', 'ninguno conoce'), with: L('With Yotsuba Shader', 'Con Yotsuba Shader'), checks: L('The compiler checks', 'El compilador revisa'), translates: L('translates it', 'lo traduce') },
    items: [
      ...[[HLSL, 'hlsl'], [GLSL, 'glsl'], [MSL, 'metal']].map(([code, beat], i) => ({
        k: 'code', at: beat, fx: 'pop', code, cls: 'wide',
        keys: [{ x: -20 + i * 20, y: -20 + i * 12, w: 56, s: 0.9 }, { at: 'with', x: 0, y: -8, s: 0.3, o: 0, d: 0.9 }],
      })),
      { k: 'file', ext: '.cs', sub: L('your project', 'tu proyecto'), at: 'none', out: 'with', mark: { at: 'none+0.6', kind: 'x' }, keys: [{ x: 0, y: 32, w: 20 }] },
      { k: 'morph', at: 'with+0.3', morph: 'checks+2', dur: 1.2, from: RED_BAD, to: RED_OK, err: { at: 'checks+0.3', lines: [4] },
        keys: [{ x: 0, y: -6, w: 94 }, { at: 'translates', y: -16, d: 0.8 }] },
      ...[
        ['.spv', 'Vulkan', '/img/apis/vulkan.svg'],
        ['.hlsl', 'DirectX', '/img/apis/directx.svg'],
        ['.glsl', 'OpenGL', '/img/apis/opengl.svg'],
        ['.metal', 'Metal', '/img/apis/metal.svg'],
      ].map(([ext, sub, logo], i) => ({
        k: 'file', ext, sub, logo, at: `translates+${0.2 + i * 0.1}`, fx: 'fade', dur: 0.3,
        keys: [{ x: 0, y: -12, w: 18, s: 0.4 }, { at: `translates+${0.2 + i * 0.1}`, x: -33 + i * 22, y: 26, s: 1, d: 0.8 }],
      })),
    ],
  },

  /* 9:24 — the four ideas, each with its picture from this chapter; then the next chapter, and the photo credit */
  {
    id: 'summary',
    world: true,
    beats: { a: L('A shader is a function', 'Un Shader es una función'), b: L('The GPU calls it', 'La GPU la llama'), c: L('Inside it you can only', 'Dentro solo puedes'), d: L('you write that function in', 'esa función la escribes'), next: L('Next', 'Siguiente'), credit: L('Graphics card photo', 'Foto de la tarjeta') },
    items: [
      { k: 'gl', cols: 2, gap: 3, out: 'next', keys: [{ x: 0, y: -2, w: 90 }], tiles: [
        { frag: SH.sunset, at: 'a', cap: cap(L('A function that runs on the GPU', 'Una función que corre en la GPU')) },
        { frag: SH.all, at: 'b', cap: cap(L('Called thousands of times at once', 'Llamada miles de veces a la vez')) },
        { at: 'c', cap: cap(L('Only math inside', 'Dentro, solo cuentas')), html: '<div class="s-mini-term">2 + 3 · a × b · a &lt; b<br><s>File</s> · <s>string</s> · <s>List&lt;T&gt;</s></div>' },
        { at: 'd', cap: cap(L('Written in C#', 'Escrita en C#')), html: '<div class="s-mini-term"><i>[ShaderStage(Stage.Fragment)]</i><br>public vec4 Fragment(PixelIn pixel)</div>' },
      ] },
      { k: 'gl', at: 'next', fx: 'pop', radius: 12, keys: [{ x: 0, y: -4, w: 70 }],
        tiles: [{ frag: SH.rgbTriangle, cap: cap(L('Next: How a shader is built', 'Siguiente: Cómo se construye un shader')) }] },
      { k: 'text', at: 'credit', cls: 's-credit-line', text: 'Palit GeForce RTX 5090 GameRock · PantheraLeo1359531 · Wikimedia Commons · CC BY 4.0', keys: [{ x: 0, y: 36 }] },
    ],
  },
];

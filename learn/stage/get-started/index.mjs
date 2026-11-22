// Stage of the Get Started overview — motion graphics shown next to the text while the page is read aloud.
// Each scene starts at its `> [!SCENE] id` cue in content/<lang>/get-started/index.md. {{engine}} is the route's engine.
//
// The scenes show what the voice says instead of writing it: the live shaders of the tutorial, the C# that makes them,
// what the compiler turns it into, and a camera that travels the path of the chapters. Every image on this stage is a
// live shader (GLSL here, the same maths as the C# of the chapters), so nothing repeats the pictures of the article.
// World scenes (`world: true`) place every item with `keys` (x, y from the centre in cqw / cqh) and move a `cam`.

const csharp = (title, code) => ({ title, code, lang: 'csharp' });
const L = (en, es) => ({ en, es });

/* ---------------------------------------------------------------- C# shown on the stage (from the chapters) */
const fragGradient = (make) => `[ShaderStage(Stage.Fragment)]
[return: location(0)]
public vec4 Fragment(PixelIn pixel)
{
    return ${make}.Vec4(pixel.Uv.X, pixel.Uv.Y, 0.6f, 1f);
}`;
const GRADIENT_CS = L(csharp('MyShaders/Gradient.cs', fragGradient('Make')), csharp('MisShaders/Degradado.cs', fragGradient('Crear')));

// the same method in the C# everybody knows (System.Numerics): the shader is that, plus two attributes
const PLAIN_CS = csharp('Program.cs', `public Vector4 Color(Vector2 uv)
{
    return new Vector4(uv.X, uv.Y, 0.6f, 1f);
}`);

// the heart of Plasma.cs (chapter "A plasma that moves"), wrapped to fit the card
const plasma = (time, waves, rainbow) => `float t = ${time};
float ${waves} = sin(x * 6f + t)
    + sin(y * 6f + t * 1.3f)
    + sin((x + y) * 6f + t * 0.7f)
    + sin(sqrt(x*x + y*y) * 9f - t * 2f);
return ${rainbow}(${waves});`;
const PLASMA_CS = L(csharp('MyShaders/Plasma.cs', plasma('Time.Seconds', 'waves', 'Rainbow')), csharp('MisShaders/Plasma.cs', plasma('Tiempo.Segundos', 'olas', 'Arcoiris')));

const ADD_CMD = L({ title: 'Terminal', code: 'yotsuba add MyShaders/MyShaders.csproj', lang: 'bash' }, { title: 'Terminal', code: 'yotsuba add MisShaders/MisShaders.csproj', lang: 'bash' });

// the first bytes of a SPIR-V module: magic number, version, generator, bound, schema, then OpCapability / OpExtInstImport "GLSL"
const SPIRV = '03 02 23 07 00 00 01 00 0b 00 08 00 2a 00 00 00 00 00 00 00 11 00 02 00 01 00 00 00 0b 00 06 00 01 00 00 00 47 4c 53 4c';

/* ---------------------------------------------------------------- live shaders: vec4 shade(vec2 uv, float t), uv from the bottom left */
const ASPECT = 'vec2 p=(uv-.5)*vec2(uRes.x/uRes.y,1.);';
const BG = 'vec3(.1,.1,.14)';
const PINK = 'vec3(1.,.48,.7)', VIOLET = 'vec3(.77,.64,1.)', MINT = 'vec3(.38,.94,.82)';

const SH = {
  // Plasma.cs, line for line (Uv.Y grows downwards in the tutorial)
  plasma: 'float x=uv.x*2.-1.,y=(1.-uv.y)*2.-1.;float v=sin(x*6.+t)+sin(y*6.+t*1.3)+sin((x+y)*6.+t*.7)+sin(sqrt(x*x+y*y)*9.-t*2.);return vec4(.5+.5*sin(v*1.5),.5+.5*sin(v*1.5+2.1),.5+.5*sin(v*1.5+4.2),1.);',
  // Gradient.cs: Make.Vec4(Uv.X, Uv.Y, 0.6, 1)
  gradient: 'return vec4(uv.x,1.-uv.y,.6,1.);',
  // the same with X and Y swapped: what you see when something is off
  gradientWrong: 'return vec4(1.-uv.y,uv.x,.6,1.);',
  // thousands of small cores, each one lighting up on its own
  cores: `vec2 n=vec2(44.,27.);vec2 g=floor(uv*n),f=fract(uv*n);float h=fract(sin(dot(g,vec2(12.9898,78.233)))*43758.5453);float on=smoothstep(.7,.95,.5+.5*sin(t*(1.+h*1.6)+h*40.));float sq=step(.16,f.x)*step(.16,f.y)*step(f.x,.9)*step(f.y,.9);vec3 hot=mix(${MINT},${VIOLET},h);return vec4(mix(vec3(.07,.07,.1),mix(vec3(.17,.17,.23),hot,on),sq),1.);`,
  // a triangle: three vertices, the colour blended in between
  triangle: `vec2 p=vec2((uv.x-.5)*uRes.x/uRes.y+.5,uv.y);vec2 a=vec2(.5,.9),b=vec2(.14,.12),c=vec2(.86,.12);vec2 v0=b-a,v1=c-a,v2=p-a;float d00=dot(v0,v0),d01=dot(v0,v1),d11=dot(v1,v1),d20=dot(v2,v0),d21=dot(v2,v1);float den=d00*d11-d01*d01;float v=(d11*d20-d01*d21)/den,w=(d00*d21-d01*d20)/den,u=1.-v-w;if(min(u,min(v,w))<0.)return vec4(${BG},1.);return vec4(u*${PINK}+v*${VIOLET}+w*${MINT},1.);`,
  sunset: 'float y=1.-uv.y+.015*sin(uv.x*9.+t*1.3);return vec4(1.,.25+.6*y,.45-.35*y,1.);',
  sunsetBroken: 'float y=uv.y;return vec4(.25+.6*y,1.,.45-.35*y,1.);',
  colors: 'vec3 c=vec3(uv.x*2.,uv.x*1.3,.35+.3*uv.y);return vec4(min(c,1.),1.);',
  circle: `${ASPECT}float d=length(p);return vec4(d<.32?${PINK}:${BG},1.);`,
  checker: `vec2 g=floor(vec2(uv.x*uRes.x/uRes.y,uv.y)*6.);float k=mod(g.x+g.y,2.);return vec4(mix(vec3(.12,.12,.17),${VIOLET},k),1.);`,
  functions: `${ASPECT}vec3 c=${BG};for(int i=0;i<3;i++){vec2 o=vec2(-.42+.42*float(i),.12*sin(t*1.5+float(i)*2.));if(length(p-o)<.15)c=i==0?${PINK}:i==1?${VIOLET}:${MINT};}return vec4(c,1.);`,
  smooth: `${ASPECT}float k=1.-smoothstep(.1,.42,length(p));return vec4(mix(${BG},${MINT},k),1.);`,
  rings: `${ASPECT}float v=0.;for(int i=1;i<=6;i++){float r=float(i)*.068;v=max(v,smoothstep(.012,.0,abs(length(p)-r-.012*sin(t*2.+float(i)))));}return vec4(mix(${BG},${VIOLET},v),1.);`,
  time: `${ASPECT}vec2 o=vec2(.5*sin(t*1.2),.16*cos(t*2.4));float k=1.-smoothstep(.1,.115,length(p-o));return vec4(mix(${BG},${PINK},k),1.);`,
  mandelbrot: 'vec2 c=vec2(-.7436,.1318)+(uv-.5)*vec2(uRes.x/uRes.y,1.)*2.8*exp(-.2*mod(t,22.));vec2 z=vec2(0.);float n=0.;for(int i=0;i<180;i++){z=vec2(z.x*z.x-z.y*z.y,2.*z.x*z.y)+c;if(dot(z,z)>4.)break;n++;}float k=n/180.;vec3 col=n>=179.?vec3(0.):vec3(.1,.3,1.)*pow(k,.4)+vec3(.6,.8,1.)*pow(k,3.);return vec4(col,1.);',
  neon: `${ASPECT}float d=abs(length(p)-.3);float g=.007/max(d,.001);float a=atan(p.y,p.x);vec3 c=mix(${PINK},vec3(.35,.82,1.),.5+.5*sin(a*2.+t));return vec4(c*min(g,1.4),1.);`,
  water: 'vec2 q=uv+.008*vec2(sin(uv.y*28.+t*2.),cos(uv.x*24.+t*1.7));vec3 c=texture(uTex,q).rgb;return vec4(c*vec3(.45,.8,1.05)+vec3(0.,.04,.1),1.);',
};

const FISH = '/assets/get-started/pez.jpg';
const ENGINE_LOGO = { route: { kni: '/img/engines/kni.png', fna: '/img/engines/fna.png', godot: '/img/engines/godot.svg', default: '/img/engines/monogame.png' } };
const cap = (text, logo) => (typeof text === 'object'
  ? { en: cap(text.en, logo), es: cap(text.es, logo) }
  : `${logo ? `<img src="${logo}" alt="">` : ''}<b>${text}</b>`);

export default [
  /* 0:00 — the result first: a live shader fills the screen, then it turns out to be a few lines of C#,
     the compiler fans those lines out to every graphics API, and the same image runs in every engine */
  {
    id: 'welcome',
    world: true,
    beats: { hello: L('Welcome', 'Bienvenido'), cs: L('in C#', 'en C#'), apis: L('graphics APIs', 'APIs gráficas'), engines: L('game engines', 'Game Engines') },
    items: [
      { k: 'gl', fill: true, tiles: [{ frag: SH.plasma }], fx: 'fade', dur: 1.2,
        keys: [{ x: 0, y: 0, w: 100, h: 100, r: 0 }, { at: 'cs', x: 26, y: -21, w: 42, h: 27, r: 14, d: 1.2 }] },
      { k: 'img', src: '/img/logo.png', cls: 's-logo-big', at: 'hello', out: 'cs', fx: 'pop', keys: [{ x: 0, y: 8 }] },
      { k: 'title', cls: 's-over', at: 0.4, out: 'cs', text: L('Write shaders in <em>C#</em>', 'Escribe shaders en <em>C#</em>'), keys: [{ x: 0, y: 26 }] },
      { k: 'code', at: 'cs+0.3', fx: 'left', code: PLASMA_CS, keys: [{ x: -24, y: -21, w: 62, s: 0.74 }] },
      ...[
        ['.spv', 'Vulkan', '/img/apis/vulkan.svg'],
        ['.hlsl', 'DirectX', '/img/apis/directx.svg'],
        ['.metal', 'Metal', '/img/apis/metal.svg'],
        ['.glsl', 'OpenGL', '/img/apis/opengl.svg'],
      ].map(([ext, sub, logo], i) => ({
        k: 'file', ext, sub, logo, at: `apis+${i * 0.1}`, out: 'engines', fx: 'fade', dur: 0.3,
        keys: [{ x: -24, y: -21, w: 18, s: 0.4 }, { at: `apis+${i * 0.1}`, x: -33 + i * 22, y: 20, s: 1, d: 0.8 }],
      })),
      { k: 'gl', at: 'engines', fx: 'fade', cols: 4, gap: 2, radius: 10, keys: [{ x: 0, y: 21, w: 92 }],
        tiles: [['MonoGame', '/img/engines/monogame.png'], ['KNI', '/img/engines/kni.png'], ['FNA', '/img/engines/fna.png'], ['Godot', '/img/engines/godot.svg']]
          .map(([name, logo], i) => ({ frag: SH.plasma, at: `engines+${i * 0.15}`, cap: cap(name, logo) })) },
    ],
  },

  /* 0:15 — write → compile → GPU → three ways to get there. The code types itself, shrinks into a corner, its compiled
     bytes fly into a GPU full of cores, and the image of that code appears in the three places the voice names */
  {
    id: 'learn',
    world: true,
    beats: { write: L('how to write shaders', 'a escribir shaders'), compile: L('how to compile them', 'a compilarlos'), gpu: L('to the GPU', 'a la GPU'), existing: L('an existing game engine', 'un Game Engine existente'), own: L('your own engine', 'tu propio Game Engine'), api: L('straight from a graphics API', 'directamente desde alguna API') },
    items: [
      { k: 'code', at: 0.1, type: 0.4, cps: 50, cls: 'wide', code: GRADIENT_CS, keys: [{ x: 0, y: -4, w: 88 }, { at: 'compile', x: -26, y: -27, s: 0.54 }] },
      { k: 'bytes', label: 'SPIR-V', bytes: SPIRV, at: 'compile+0.2', type: 'compile+0.5', cps: 26, fx: 'fade',
        keys: [{ x: -26, y: 2, w: 44 }, { at: 'gpu', x: 25, y: -26, s: 0.3, o: 0, d: 0.9 }] },
      { k: 'gl', at: 'gpu-0.9', fx: 'pop', radius: 12, keys: [{ x: 25, y: -26, w: 40 }], tiles: [{ frag: SH.cores, cap: cap('GPU') }] },
      { k: 'gl', cols: 3, gap: 2.4, keys: [{ x: 0, y: 24, w: 92 }], tiles: [
        { frag: SH.gradient, at: 'existing', cap: cap('{{engine}}') },
        { frag: SH.gradient, at: 'own', cap: cap(L('Your own engine', 'Tu propio motor')) },
        { frag: SH.gradient, at: 'api', cap: cap('Vulkan · Metal · DX') },
      ] },
    ],
  },

  /* 0:32 — "all you need is C#": a plain C# method turns into a shader by gaining two attributes and a new type,
     then every line of it lights up, because every line of a shader written with Yotsuba Shader is C# */
  {
    id: 'basics',
    beats: { need: L('You do not need to know', 'No tienes que saber'), cs: L('program in C#', 'programar en C#') },
    items: [
      { k: 'slot', items: [
        { k: 'kicker', at: 0.1, out: 'need', text: L('C# you already write', 'El C# que ya escribes') },
        { k: 'kicker', at: 'need+0.8', out: 'cs', text: L('A shader in Yotsuba Shader', 'Un shader en Yotsuba Shader') },
        { k: 'kicker', at: 'cs+0.2', cls: 's-ok', text: L('Every line is C#', 'Todas las líneas son C#') },
      ] },
      { k: 'morph', at: 0.1, morph: 'need', dur: 1.4, fresh: 'cs', from: PLAIN_CS, to: GRADIENT_CS, hl: [{ at: 'cs', lines: 'all', step: 0.14 }] },
    ],
  },

  /* 0:45 — not a list to read: the dry list is struck out, and the camera follows the loop of every chapter:
     type in the editor, run in the terminal, see the window; then the wrong picture next to the right one */
  {
    id: 'steps',
    world: true,
    beats: { list: L('a list of attributes', 'una lista de atributos'), write: L('write code and see it work', 'escribir código y verlo funcionar'), command: L('a command to run', 'un comando para ejecutar'), image: L('an image that you should see', 'una imagen que debes ver'), differ: L('If something does not look the same', 'Si algo no se ve igual'), check: L('what to check', 'qué revisar') },
    cam: [{ x: 0, y: 0, s: 1 }, { at: 'write', x: -32, y: -20, s: 1.5 }, { at: 'command', x: -32, y: 19, s: 1.5 }, { at: 'image', x: 31, y: -14, s: 1.3 }, { at: 'differ', x: 0, y: 2, s: 0.82, d: 1.5 }],
    items: [
      { k: 'list', at: 0.2, step: 0.09, strike: 'list+0.4', out: 'write', keys: [{ x: 0, y: 0 }],
        words: ['[ShaderStage]', '[location]', '[uniform]', '[cbuffer]', 'vec4', 'mat4', 'sampler2D', 'texture()', 'smoothstep()', 'clamp()', 'mix()', 'discard'] },
      { k: 'code', at: 'write', type: 'write+0.4', cps: 42, cls: 'wide', code: GRADIENT_CS, keys: [{ x: -32, y: -20, w: 88, s: 0.6 }] },
      { k: 'term', at: 'command-0.2', type: 'command+0.2', cps: 38, code: ADD_CMD, keys: [{ x: -32, y: 19, w: 88, s: 0.6 }] },
      { k: 'gl', cls: 'window', title: '{{engine}}', logo: ENGINE_LOGO, at: 'image-0.3', fx: 'pop', radius: 10, keys: [{ x: 31, y: -14, w: 40 }],
        tiles: [{ frag: SH.gradient, at: 'image', marks: [{ at: 'check+0.5', kind: 'check' }] }] },
      { k: 'gl', cls: 'window', title: '{{engine}}', logo: ENGINE_LOGO, at: 'differ', fx: 'pop', radius: 10, keys: [{ x: 31, y: 24, w: 40 }],
        tiles: [{ frag: SH.gradientWrong, at: 'differ', marks: [{ at: 'check', kind: 'x' }] }] },
    ],
  },

  /* 1:07 — the path as a place: the whole map first, then the camera flies over each stretch, where every chapter
     is a live shader of what you make in it, and ends at the chapter for when something goes wrong */
  {
    id: 'path',
    world: true,
    beats: { a: L('1. The fundamentals', '1. Los fundamentos'), b: L('2. The workshop', '2. El taller'), c: L('3. The shaders', '3. Los shaders'), debug: L('When something does not work out', 'Cuando algo no salga'), method: L('a method for finding errors', 'un método para encontrar') },
    cam: [{ x: 168, y: 0, s: 0.225 }, { at: 'a', x: 0, y: 0, s: 1, d: 1.7 }, { at: 'b', x: 120, s: 0.96, d: 1.5 }, { at: 'c', x: 240, s: 1, d: 1.5 }, { at: 'debug', x: 345, s: 1.05, d: 1.5 }, { at: 'end-2.4', x: 168, s: 0.225, d: 2 }],
    items: [
      { k: 'rule', grow: 0.2, dur: 2.4, fx: 'none', keys: [{ x: 167, y: -29, w: 430 }] },
      ...[[0, L('Stretch 1', 'Tramo 1'), L('Fundamentals', 'Fundamentos')], [120, L('Stretch 2', 'Tramo 2'), L('Workshop', 'Taller')], [240, L('Stretch 3', 'Tramo 3'), 'Shaders'], [345, L('Help', 'Ayuda'), L('When it goes wrong', 'Si algo sale mal')]]
        .flatMap(([x, kick, name], i) => [
          { k: 'kicker', at: 0.3 + i * 0.3, fx: 'fade', text: kick, keys: [{ x, y: -42 }] },
          { k: 'title', at: 0.35 + i * 0.3, fx: 'fade', text: name, keys: [{ x, y: -35 }] },
        ]),
      { k: 'gl', cols: 2, gap: 3, keys: [{ x: 0, y: 6, w: 74 }], tiles: [
        { frag: SH.cores, at: 0.5, cap: cap(L('What is a shader?', '¿Qué es un Shader?')) },
        { frag: SH.triangle, at: 0.6, cap: cap(L('How a shader is built', 'Cómo se construye')) },
        { at: 0.7, cap: cap(L('Set up your project', 'Prepara tu proyecto')), html: '<div class="s-mini-term"><i>$</i> dotnet tool install --global …<br><i>$</i> dotnet new classlib</div>' },
        { frag: SH.sunset, at: 0.8, cap: cap(L('Shader 1: a sunset', 'Shader 1: un atardecer')) },
      ] },
      { k: 'gl', cols: 4, gap: 2, radius: 10, keys: [{ x: 120, y: 4, w: 96 }], tiles: [
        [SH.gradient, L('Your window', 'Tu ventana')], [SH.colors, L('Colors', 'Los colores')], [SH.circle, L('Coordinates', 'Coordenadas')], [SH.checker, L('Deciding with if', 'Decidir con if')],
        [SH.functions, L('Functions', 'Funciones')], [SH.smooth, L('Mix and smooth', 'Mezclar')], [SH.rings, L('Loops', 'Bucles')], [SH.time, L('Time', 'El tiempo')],
      ].map(([frag, name], i) => ({ frag, at: 1 + i * 0.08, cap: cap(name) })) },
      { k: 'gl', cols: 2, gap: 3, tex: FISH, keys: [{ x: 240, y: 6, w: 78 }], tiles: [
        { frag: SH.mandelbrot, at: 1.7, cap: cap(L('2 · A fractal', '2 · Un fractal')) },
        { frag: SH.neon, at: 1.8, cap: cap(L('3 · A neon ring', '3 · Un anillo de neón')) },
        { frag: SH.plasma, at: 1.9, cap: cap(L('4 · A plasma', '4 · Un plasma')) },
        { frag: SH.water, tex: true, at: 2, cap: cap(L('5 · Under water', '5 · Bajo el agua')) },
      ] },
      { k: 'gl', cls: 'window', title: '{{engine}}', logo: ENGINE_LOGO, at: 2.2, fx: 'fade', radius: 10, keys: [{ x: 345, y: 4, w: 56 }],
        tiles: [{ modes: [{ frag: SH.sunsetBroken }, { at: 'method', frag: SH.sunset }], marks: [{ at: 'debug+0.8', out: 'method', kind: 'x' }, { at: 'method+0.4', kind: 'check' }] }] },
    ],
  },

  /* 1:42 — the engine of this route, running the shaders you will have made; ⌘K is pressed when the voice says it;
     and the window lands on the first chapter */
  {
    id: 'finale',
    world: true,
    beats: { made: L('the shaders you made', 'los shaders que hiciste'), press: L('Press', 'Pulsa'), start: L('Start with', 'Empieza por') },
    cam: [{ s: 1 }, { at: 'start', s: 1.05, d: 3 }],
    items: [
      { k: 'gl', cls: 'window', title: '{{engine}}', logo: ENGINE_LOGO, tex: FISH, at: 0.1, fx: 'pop', radius: 10, keys: [{ x: 0, y: -10, w: 80 }],
        tiles: [{ tex: true, modes: [
          { frag: SH.sunset }, { at: 'made-2', frag: SH.mandelbrot }, { at: 'made-0.6', frag: SH.neon }, { at: 'made+0.8', frag: SH.plasma },
          { at: 'made+2.2', frag: SH.water }, { at: 'start', frag: SH.cores },
        ] }] },
      { k: 'keys', at: 'press', out: 'start', caps: [{ text: '⌘', press: 'press+0.5', plus: true }, { text: 'K', press: 'press+0.55' }], keys: [{ x: 0, y: 30 }] },
      { k: 'word', at: 'start+0.4', text: L('1 · What is a shader?', '1 · ¿Qué es un Shader?'), keys: [{ x: 0, y: 30 }] },
    ],
  },
];

// Stage of "What now?" — motion graphics shown next to the text while the chapter is read aloud.
// Each scene starts at its `> [!SCENE] id` cue in content/<lang>/get-started/next-steps.md. x_engine is the MonoGame/KNI/FNA route,
// g_next the Godot route (a cue exists only on the page of its route); intro, own and lookup are common.

const L = (en, es) => ({ en, es });
const cs = (title, code) => ({ title, code, lang: 'csharp' });
const ENGINE_LOGO = { route: { kni: '/img/engines/kni.png', fna: '/img/engines/fna.png', godot: '/img/engines/godot.svg', default: '/img/engines/monogame.png' } };
const win = (modes, at, extra = {}) => ({ k: 'gl', cls: 'window w40', title: '{{engine}}', logo: ENGINE_LOGO, at, fx: 'pop', radius: 10, tiles: [{ modes, aspect: '16 / 10', at }], ...extra });
const BG = 'vec3(.1,.1,.14)';
const SH = {
  sunset: 'return vec4(1.,1.-uv.y,uv.y*.6,1.);',
  plasma: 'float x=uv.x*2.-1.,y=(1.-uv.y)*2.-1.;float v=sin(x*6.+t)+sin(y*6.+t*1.3)+sin((x+y)*6.+t*.7)+sin(sqrt(x*x+y*y)*9.-t*2.);return vec4(.5+.5*sin(v*1.5),.5+.5*sin(v*1.5+2.1),.5+.5*sin(v*1.5+4.2),1.);',
  mandelbrot: 'float cx=(uv.x-.5)*3.*uRes.x/uRes.y-.7,cy=(uv.y-.5)*3.;float x=0.,y=0.;int n=0;for(int i=0;i<100;i++){float nx=x*x-y*y+cx;float ny=2.*x*y+cy;x=nx;y=ny;if(x*x+y*y>4.)break;n++;}float k=float(n)/100.,r=1.-k;if(n==100)return vec4(0.,0.,0.,1.);return vec4(9.*r*k*k*k,15.*r*r*k*k,8.5*r*r*r*k,1.);',
  neon: 'float x=(uv.x*2.-1.)*uRes.x/uRes.y,y=uv.y*2.-1.;float dr=abs(sqrt(x*x+y*y)-.6);float g=clamp(.03/dr,0.,1.);return vec4(mix(vec3(.02,.02,.06),mix(vec3(1.,.2,.7),vec3(.2,.8,1.),uv.x),g),1.);',
};
const NEW = L(cs('Program.cs', 'var shader = new Gradient();\nbyte[] compiled = shader.ToMGFX(MonoGamePlatform.DesktopGL);'), cs('Program.cs', 'var shader = new Degradado();\nbyte[] compilado = shader.ToMGFX(MonoGamePlatform.DesktopGL);'));
const logo = (src, text, at) => ({ k: 'logo', src, text, at, fx: 'pop' });

export default [
  /* what you drew and what you learned: eight things, checked off */
  {
    id: 'intro',
    beats: { fin: L('You finished the tutorial', 'Terminaste el tutorial'), drew: L('You drew colors', 'Dibujaste colores'), five: L('You made five shaders', 'Hiciste cinco shaders'), a: L('What a shader is', 'Qué es un shader'), b: L('How the data that goes in and out is declared', 'Cómo se declaran los datos'), c: L('To look inside a shader', 'A mirar dentro de un shader'), d: L('That inside a shader you can use', 'Que dentro de un shader puedes usar'), e: L('How something moves', 'Cómo se mueve algo'), f: L('math functions', 'funciones matemáticas'), g: L('How to send data to a shader', 'Cómo mandarle datos a un shader'), h: L('How to compile with', 'Cómo compilar con') },
    items: [
      { k: 'kicker', text: L('You finished the tutorial', 'Terminaste el tutorial') },
      win([{ frag: SH.sunset }, { at: 'drew+2', frag: SH.mandelbrot }, { at: 'drew+3.5', frag: SH.neon }, { at: 'five', frag: SH.plasma }], 'fin', { cls: 'window w40' }),
      ...[['a', 'what a shader is · the stages', 'qué es un shader · las etapas'], ['b', '[location] · the doors count from 0', '[location] · las puertas cuentan desde 0'], ['c', 'paint the value · a method for errors', 'pinta el valor · un método para errores'], ['d', 'if · loops · arrays · functions', 'if · bucles · arrays · funciones'], ['e', 'motion = computing from the time', 'movimiento = cálculo a partir del tiempo'], ['f', 'sqrt · sin · mix', 'sqrt · sin · mix'], ['g', 'uniform + texture', 'uniform + textura'], ['h', 'add → your own class', 'add → tu propia clase']]
        .map(([b, en, es]) => ({ k: 'word', cls: 's-mono', at: b, fx: 'left', text: L(en, es), mark: { at: `${b}+0.4`, kind: 'check' } })),
    ],
  },

  /* MonoGame / KNI / FNA: drawing on screen is the missing piece; pick your engine */
  {
    id: 'x_engine',
    beats: { missing: L('What is missing', 'Lo que falta'), screen: L('drawing on screen', 'dibujar en pantalla'), open: L('Opening a window', 'Abrir una ventana'), send: L('sending the rectangle', 'mandar el rectángulo'), hand: L('handing it the clock and the photo', 'entregarle el reloj y la foto'), depends: L('depends on what you work with', 'depende de con qué trabajes'), good: L('The good news', 'La buena noticia'), pick: L('Pick your game engine', 'Elige tu Game Engine') },
    items: [
      { k: 'kicker', text: L('What is missing', 'Lo que falta') },
      { k: 'row', at: 'open', out: 'good', items: [
        { k: 'box', cls: 's-mono', text: L('a window', 'una ventana'), at: 'open' },
        { k: 'box', cls: 's-mono', text: L('the rectangle', 'el rectángulo'), sub: L('to the GPU', 'a la GPU'), at: 'send' },
        { k: 'box', cls: 'accent s-mono', text: L('clock + photo', 'reloj + foto'), at: 'hand' },
      ] },
      { k: 'text', at: 'depends', out: 'good', text: L('It depends on <b>what you work with</b>', 'Depende de <b>con qué trabajes</b>') },
      { k: 'code', at: 'good', type: 'good+0.5', cps: 40, code: NEW },
      { k: 'row', at: 'pick', items: [
        logo('/img/engines/monogame.png', 'MonoGame', 'pick'), logo('/img/engines/kni.png', 'KNI', 'pick+0.4'), logo('/img/engines/fna.png', 'FNA', 'pick+0.8'), logo('/img/engines/godot.svg', 'Godot', 'pick+1.2'),
      ] },
    ],
  },
  /* Godot: you already drew on screen; the reference and a real object */
  {
    id: 'g_next',
    beats: { drew: L('You already drew on screen', 'Ya dibujaste en pantalla'), ref: L('Godot reference', 'referencia de Godot'), best: L('the best way to learn', 'la mejor forma de aprender'), real: L('use it on a real object', 'usarlo en un objeto real'), meshes: L('MeshInstance3D', 'MeshInstance3D') },
    items: [
      { k: 'kicker', text: L('What now?', '¿Y ahora qué?') },
      { k: 'row', at: 'drew', out: 'ref', items: [
        { k: 'box', cls: 's-mono', text: L('viewer scene', 'escena del visor'), at: 'drew', mark: { at: 'drew+1', kind: 'check' } },
        { k: 'box', cls: 's-mono', text: L('your shaders in Godot', 'tus shaders en Godot'), at: 'drew+1.2', mark: { at: 'drew+2.2', kind: 'check' } },
        { k: 'box', cls: 's-mono', text: L('a 3D scene seen through them', 'una escena 3D vista a través'), at: 'drew+2.4', mark: { at: 'drew+3.4', kind: 'check' } },
      ] },
      { k: 'row', at: 'ref', out: 'best', items: [
        { k: 'box', cls: 'accent s-mono', text: L('Godot reference', 'referencia de Godot'), sub: L('the 14 vertex attributes and more', 'los 14 atributos del vértice y más'), at: 'ref' },
      ] },
      { k: 'row', at: 'real', items: [
        { k: 'box', cls: 's-mono', text: L('your shader', 'tu shader'), at: 'best' },
        { k: 'arrow', at: 'real-0.4' },
        { k: 'box', cls: 'accent s-mono', text: 'MeshInstance3D', sub: 'VERTEX · NORMAL', at: 'real' },
      ] },
    ],
  },
  /* your own engine: the raw APIs */
  {
    id: 'own',
    beats: { own: L('your own engine', 'tu propio motor'), apis: L('Vulkan, DirectX, Metal or OpenGL', 'Vulkan, DirectX, Metal u OpenGL'), here: L('continue here', 'sigue por aquí') },
    items: [
      { k: 'kicker', text: L('Your own engine', 'Tu propio motor') },
      { k: 'row', at: 'apis', out: 'here', items: ['Vulkan', 'DirectX', 'Metal', 'OpenGL'].map((w, i) => ({ k: 'box', cls: 's-mono', text: w, at: `apis+${(i * 0.5).toFixed(1)}` })) },
      { k: 'row', at: 'here', items: [
        { k: 'box', cls: 'accent s-mono', text: L('Custom engine', 'Motor propio'), sub: L('continue here', 'sigue por aquí'), at: 'here' },
      ] },
    ],
  },
  /* looking things up */
  {
    id: 'lookup',
    beats: { find: L('find a specific attribute or format', 'buscar un atributo o un formato'), reread: L('without rereading the tutorial', 'sin releer el tutorial') },
    items: [
      { k: 'kicker', text: L('For looking things up', 'Para consultar') },
      { k: 'row', at: 'find', items: [
        { k: 'box', cls: 's-mono', text: L('an attribute', 'un atributo'), at: 'find' },
        { k: 'box', cls: 's-mono', text: L('a format', 'un formato'), at: 'find+0.6' },
        { k: 'box', cls: 'accent s-mono', text: L('Reference', 'Referencia'), sub: L('no rereading', 'sin releer'), at: 'reread' },
      ] },
    ],
  },
];

// Stage of "Time" — motion graphics shown next to the text while the chapter is read aloud.
// Each scene starts at its `> [!SCENE] id` cue in content/<lang>/get-started/time.md. Every image is a live shader driven by the
// same number the chapter talks about: the seconds the program hands over. It shows the sawtooth, the triangle wave and the ball.

const L = (en, es) => ({ en, es });
const cs = (title, code) => ({ title, code, lang: 'csharp' });
const ENGINE_LOGO = { route: { kni: '/img/engines/kni.png', fna: '/img/engines/fna.png', godot: '/img/engines/godot.svg', raylib: '/img/engines/raylib.png', silknet: '/img/engines/silknet.svg', default: '/img/engines/monogame.png' } };
const win = (tiles, at, extra = {}) => ({ k: 'gl', cls: 'window w50', title: '{{engine}}', logo: ENGINE_LOGO, at, fx: 'pop', radius: 10, tiles, ...extra });
const tiles = (arr, at, extra = {}) => ({ k: 'gl', cls: 'w86', gap: 2, radius: 10, at, fx: 'fade', tiles: arr, ...extra });

const BG = 'vec3(.1,.1,.14)';
const PINK = 'vec3(1.,.48,.7)', VIOLET = 'vec3(.77,.64,1.)', MINT = 'vec3(.38,.94,.82)';

const ENTORNO = L(cs('MyShaders/Context.cs', `public struct Context
{
    public float Width;
    public float Height;
    public float Seconds;
}`), cs('MisShaders/Entorno.cs', `public struct Entorno
{
    public float Ancho;
    public float Alto;
    public float Segundos;
}`));
const code = (en, es) => L(cs('Fragment', en), cs('Fragment', es));
const FLASH = code('float t = Data.Seconds % 1f;\nreturn new vec4(t, t, t, 1f);', 'float t = Datos.Segundos % 1f;\nreturn new vec4(t, t, t, 1f);');
const TRI = code('float t = Data.Seconds % 1f;\nif (t > 0.5f) t = 1f - t;\nreturn new vec4(t * 2f, t * 2f, t * 2f, 1f);', 'float t = Datos.Segundos % 1f;\nif (t > 0.5f) t = 1f - t;\nreturn new vec4(t * 2f, t * 2f, t * 2f, 1f);');
const BALL = code('float progress = Data.Seconds * 0.4f % 1f;\nif (progress > 0.5f) progress = 1f - progress;\nprogress *= 2f;\nfloat centerX = 0.15f + progress * (aspect - 0.3f);',
  'float avance = Datos.Segundos * 0.4f % 1f;\nif (avance > 0.5f) avance = 1f - avance;\navance *= 2f;\nfloat centroX = 0.15f + avance * (aspecto - 0.3f);');

// a moving ball; the bar under it is `progress`, the only thing the shader knows about the trip
const BALLSH = (tint, bar) => `float asp=uRes.x/uRes.y;float uy=1.-uv.y;float p=mod(t*.4,1.);float av=(p>.5?1.-p:p)*2.;float cx=.15+av*(asp-.3);vec2 q=vec2(uv.x*asp-cx,uy-.45);float r=length(q);vec3 col=${tint ? 'vec3(1.,av,.2)' : PINK};vec3 c=mix(${BG},col,smoothstep(.121,.115,r));${bar ? 'float by=step(abs(uy-.88),.02);float bx=step(.15,uv.x*asp)*step(uv.x*asp,asp-.15);c=mix(c,vec3(.2,.2,.27),by*bx);c=mix(c,' + VIOLET + ',by*step(.15,uv.x*asp)*step(uv.x*asp,.15+av*(asp-.3)));' : ''}return vec4(c,1.);`;

const SH = {
  still: (frag) => frag.replace(/\bt\b/g, '0.7'),
  water: 'float w=sin(uv.x*14.+t*2.)*.03+sin(uv.x*27.-t*3.)*.015;float y=uv.y+w;return vec4(vec3(.05,.3+.35*y,.55+.4*y),1.);',
  fire: 'float y=1.-uv.y;float n=sin(uv.x*14.+t*3.)*.5+sin(uv.x*27.-t*5.)*.25;float f=clamp(y*1.5+n*.25*y-.2,0.,1.);return vec4(vec3(1.,.35+.6*f,.1+.5*f*f)*f*1.4,1.);',
  light: 'vec2 p=(uv-vec2(.5+.25*sin(t*.8),.5));p.x*=uRes.x/uRes.y;float k=smoothstep(.45,.0,length(p));return vec4(vec3(1.,.8,.4)*k+vec3(.05,.05,.09),1.);',
  flash: 'float k=mod(t,1.);return vec4(vec3(k),1.);',
  breathe: (speed) => `float k=mod(t*${speed},1.);k=k>.5?1.-k:k;return vec4(vec3(k*2.),1.);`,
  // the number itself: seconds on the horizontal axis, the value on the vertical one; a dot rides the curve as time passes
  graph: (fn, span = '3.') => `float s=uv.x*${span};float y=uv.y;vec3 c=${BG};c=mix(c,vec3(.3,.3,.4),step(abs(y),.012)+step(abs(y-1.),.006));float f=${fn.replace(/S/g, 's')};c=mix(c,${VIOLET},smoothstep(.03,.015,abs(y-f)));float ts=mod(t,${span});float fs=${fn.replace(/S/g, 'ts')};float dx=(uv.x-ts/${span})*uRes.x/uRes.y,dy=(y-fs);c=mix(c,${PINK},smoothstep(.05,.04,length(vec2(dx,dy))));c=mix(c,${PINK},step(abs(uv.x-ts/${span}),.003)*.4);return vec4(c,1.);`,
};
const SAW = 'mod(S,1.)', TRIW = 'abs(mod(S,1.)*2.-1.)', SINW = '.5+.5*sin(S*6.2832)';

export default [
  /* still images vs. a shader that moves: the water, the fire, the light; and no new tool is needed */
  {
    id: 'intro',
    beats: { still: L('images are still', 'imágenes están quietas'), water: L('water ripples', 'el agua ondula'), fire: L('fire flickers', 'el fuego parpadea'), light: L('light changes', 'la luz cambia'), nothing: L('nothing new', 'nada nuevo') },
    items: [
      { k: 'kicker', text: L('Time', 'El tiempo') },
      tiles([
        { modes: [{ frag: SH.still(SH.water) }, { at: 'water', frag: SH.water }], at: 0.2, cap: L('<b>Water</b>', '<b>Agua</b>') },
        { modes: [{ frag: SH.still(SH.fire) }, { at: 'fire', frag: SH.fire }], at: 0.4, cap: L('<b>Fire</b>', '<b>Fuego</b>') },
        { modes: [{ frag: SH.still(SH.light) }, { at: 'light', frag: SH.light }], at: 0.6, cap: L('<b>Light</b>', '<b>Luz</b>') },
      ], 0.2, { cols: 3, aspect: '4 / 3' }),
      { k: 'text', at: 'nothing', text: L('Nothing new to learn: <b>one number</b>', 'Nada nuevo que aprender: <b>un solo número</b>') },
    ],
  },
  /* a normal game remembers the ball; the shader forgets everything and is told what time it is */
  {
    id: 'memory',
    beats: { game: L('In a normal game', 'En un juego normal'), remembers: L('Your program remembers', 'Tu programa recuerda'), nothing: L('A shader remembers nothing', 'Un shader no recuerda nada'), zero: L('starts from zero', 'empieza de cero'), time: L('what time it is', 'qué hora es'), uniform: L('That number is a uniform', 'Ese número es un uniform') },
    items: [
      { k: 'kicker', text: L('A shader has no memory', 'Un shader no tiene memoria') },
      { k: 'slot', items: [
        { k: 'code', at: 'game', out: 'nothing', type: 'game+0.3', cps: 35, code: L(cs('Game.cs', 'ball.X += 0.01f;   // remembers where it was'), cs('Juego.cs', 'bola.X += 0.01f;   // recuerda dónde estaba')), hl: [{ at: 'remembers', lines: [0] }] },
        { k: 'code', at: 'nothing', out: 'time', type: 'nothing+0.3', cps: 30, code: L(cs('Fragment', 'return …;   // every frame starts from zero'), cs('Fragment', 'return …;   // cada fotograma empieza de cero')), hl: [{ at: 'zero', lines: [0] }] },
        { k: 'row', at: 'time', items: [
          { k: 'box', cls: 'accent s-mono', text: L('Your program', 'Tu programa'), sub: L('seconds = 12.4', 'segundos = 12.4'), at: 'time' },
          { k: 'arrow', at: 'time+0.5' },
          { k: 'box', cls: 'gpu', text: 'Shader', sub: 'uniform', at: 'uniform' },
        ] },
      ] },
      { k: 'big', cls: 's-mono', at: 'time', count: { at: 'time', from: 0, to: 12, dur: 6, suffix: ' s' }, text: '0 s' },
    ],
  },
  /* Step 1: a third field in the struct: Seconds, which the viewer fills in every frame */
  {
    id: 'clock',
    beats: { open: L('Open', 'Abre'), third: L('a third field', 'un tercer campo'), exists: L('exists', 'existe'), viewer: L('already knows how to fill it', 'ya sabe llenarlo') },
    items: [
      { k: 'kicker', text: L('Step 1 · the clock', 'Paso 1 · el reloj') },
      { k: 'code', at: 'open', type: 'open+0.3', cps: 40, code: ENTORNO, hl: [{ at: 'third', lines: [4] }], tags: [{ at: 'third+0.4', line: 4, text: L('new', 'nuevo') }] },
      { k: 'row', at: 'viewer', items: [
        { k: 'box', cls: 'accent s-mono', text: L('Viewer', 'Visor'), sub: L('every frame', 'cada fotograma'), at: 'viewer' },
        { k: 'arrow', at: 'viewer+0.5' },
        { k: 'box', cls: 'gpu s-mono', text: L('Data_Seconds', 'Datos_Segundos'), sub: L('= time open', '= tiempo abierto'), at: 'viewer+1' },
      ] },
    ],
  },
  /* Step 2: % 1 makes the time a sawtooth: the window brightens for one second and snaps to black */
  {
    id: 'flash',
    beats: { replace: L('Replace the line', 'Reemplaza la línea'), lighter: L('lighter and lighter', 'cada vez más clara'), black: L('goes back to black', 'vuelve a negro'), grows: L('grows without stopping', 'crece sin parar'), keeps: L('only keeps the decimal part', 'solo se queda con la parte decimal'), abrupt: L('abrupt jump', 'salto brusco') },
    items: [
      { k: 'kicker', text: L('Step 2 · a color that comes and goes', 'Paso 2 · un color que va y viene') },
      { k: 'code', at: 'replace', type: 'replace+0.3', cps: 45, code: FLASH, hl: [{ at: 'keeps', lines: [0] }] },
      { k: 'gl', cls: 'w86', cols: 2, gap: 2, radius: 10, at: 'lighter', fx: 'fade', tiles: [
        { frag: SH.flash, aspect: '4 / 3', at: 'lighter', cap: L('<b>The window</b>', '<b>La ventana</b>') },
        { frag: SH.graph(SAW), aspect: '4 / 3', at: 'grows', cap: L('<b>Seconds % 1</b>', '<b>Segundos % 1</b>') },
      ] },
      { k: 'text', at: 'abrupt', text: L('White → black in one jump', 'De blanco a negro de golpe'), mark: { at: 'abrupt+0.8', kind: 'x' } },
    ],
  },
  /* Step 3: the triangle wave: up for half a second and down for the other half; slower and faster */
  {
    id: 'breathe',
    beats: { half: L('the halfway point', 'al pasar de la mitad'), behaves: L('how t behaves', 'cómo se comporta'), breathes: L('The light breathes', 'La luz respira'), triangle: L('triangle wave', 'onda triangular'), slower: L('breathe slower', 'respirará más lento'), faster: L('four times faster', 'cuatro veces más') },
    items: [
      { k: 'kicker', text: L('Step 3 · up and down', 'Paso 3 · subir y bajar') },
      { k: 'code', at: 'half-4', type: 'half-3', cps: 45, code: TRI, hl: [{ at: 'half', lines: [1] }] },
      { k: 'gl', cls: 'w86', cols: 2, gap: 2, radius: 10, at: 'behaves', fx: 'fade', tiles: [
        { modes: [{ frag: SH.breathe('1.') }, { at: 'slower', frag: SH.breathe('.333') }, { at: 'faster', frag: SH.breathe('4.') }], aspect: '4 / 3', at: 'behaves', cap: L('<b>The light breathes</b>', '<b>La luz respira</b>') },
        { modes: [{ frag: SH.graph(TRIW) }], aspect: '4 / 3', at: 'behaves+0.3', cap: L('<b>Triangle wave</b>', '<b>Onda triangular</b>') },
      ] },
    ],
  },
  /* Step 4: the bouncing ball: the shader never moves it, it works out where it should be and draws it there */
  {
    id: 'ball',
    beats: { combine: L('combine what you already know', 'combina lo que ya sabes'), apart: L('take it apart', 'desmontarlo'), same: L('does the same as', 'hace lo mismo que'), part: L('what part of the trip', 'qué parte del recorrido'), turns: L('turns that number', 'convierte ese número'), rest: L('The rest is the usual circle', 'El resto es el círculo de siempre'), never: L('never moved the ball', 'nunca movió la bola') },
    items: [
      { k: 'kicker', text: L('Step 4 · a bouncing ball', 'Paso 4 · una bola que rebota') },
      win([{ frag: BALLSH(false, true), aspect: '16 / 9', at: 'combine' }], 'combine', { cls: 'window w60' }),
      { k: 'code', at: 'apart', type: 'apart+0.3', cps: 60, code: BALL, hl: [{ at: 'same', until: 'part', lines: [0, 1, 2] }, { at: 'part', until: 'turns', lines: [2] }, { at: 'turns', lines: [3] }] },
      { k: 'text', at: 'never', text: L('It does not <b>move</b> the ball: it works out <b>where it should be</b>', 'No <b>mueve</b> la bola: calcula <b>dónde le toca estar</b>') },
    ],
  },
  /* Step 5: the colour depends on progress: reddish on the left, yellow on the right; three moments */
  {
    id: 'color',
    beats: { practice: L('to practice mixing', 'para practicar mezclar'), reddish: L('reddish at the left end', 'rojiza en el extremo izquierdo'), three: L('three different moments', 'tres momentos distintos') },
    items: [
      { k: 'kicker', text: L('Step 5 · changing color too', 'Paso 5 · que también cambie de color') },
      win([{ frag: BALLSH(true, true), aspect: '16 / 9', at: 'practice' }], 'practice', { cls: 'window w60' }),
      tiles([
        { frag: BALLSH(true, false).replace('float p=mod(t*.4,1.);float av=(p>.5?1.-p:p)*2.;', 'float av=0.;'), at: 'three', cap: '<b>0</b>' },
        { frag: BALLSH(true, false).replace('float p=mod(t*.4,1.);float av=(p>.5?1.-p:p)*2.;', 'float av=.5;'), at: 'three+0.6', cap: '<b>0.5</b>' },
        { frag: BALLSH(true, false).replace('float p=mod(t*.4,1.);float av=(p>.5?1.-p:p)*2.;', 'float av=1.;'), at: 'three+1.2', cap: '<b>1</b>' },
      ], 'three', { cols: 3, aspect: '16 / 9' }),
    ],
  },
  /* what else: triangle vs the smoother sine */
  {
    id: 'more',
    beats: { lights: L('lights that flicker', 'luces que parpadean'), smoother: L('a wave smoother', 'una onda más suave'), sine: L('the sine', 'la del seno'), natural: L('natural movements', 'movimientos naturales') },
    items: [
      { k: 'kicker', text: L('What else can be done with time', 'Qué más se puede hacer con el tiempo') },
      tiles([
        { frag: SH.light, at: 'lights', cap: L('<b>A light that flickers</b>', '<b>Una luz que parpadea</b>') },
        { frag: SH.graph(TRIW), at: 'smoother', cap: L('<b>Triangle</b>', '<b>Triangular</b>') },
        { frag: SH.graph(SINW), at: 'sine', cap: '<b>sin</b>' },
      ], 'lights', { cols: 3, aspect: '4 / 3' }),
      { k: 'text', at: 'natural', text: L('Waves, pulses, breathing: <b>sin</b>', 'Olas, pulsos, respiraciones: <b>sin</b>') },
    ],
  },
  {
    id: 'learned',
    dense: true,
    beats: { a: L('has no memory', 'no tiene memoria'), b: L('To animate', 'Para animar'), c: L('turns a time', 'convierte un tiempo'), d: L('goes up and then down', 'suba y luego baje'), e: L('changes the speed', 'cambia la velocidad') },
    items: [
      { k: 'kicker', text: L('What you learned', 'Lo que aprendiste') },
      ...[['a', 'no memory between frames', 'sin memoria entre fotogramas'], ['b', 'time = a uniform → compute', 'tiempo = un uniform → calcular'], ['c', 'Seconds % 1 = a cycle', 'Segundos % 1 = un ciclo'], ['d', 'if + 1 - t = up and down', 'if + 1 - t = sube y baja'], ['e', 'Seconds * 4 = faster', 'Segundos * 4 = más rápido']]
        .map(([b, en, es]) => ({ k: 'word', cls: 's-mono', at: b, fx: 'left', text: L(en, es), mark: { at: `${b}+0.4`, kind: 'check' } })),
    ],
  },
];

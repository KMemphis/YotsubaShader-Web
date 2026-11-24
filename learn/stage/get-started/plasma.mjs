// Stage of "Shader 4: a plasma" — motion graphics shown next to the text while the chapter is read aloud.
// Each scene starts at its `> [!SCENE] id` cue in content/<lang>/get-started/plasma.md (outside the :::godot block, so every
// route has every scene). Every image is the live plasma or one of its parts: one wave, four waves, the three phased sines.

const L = (en, es) => ({ en, es });
const cs = (title, code) => ({ title, code, lang: 'csharp' });
const ENGINE_LOGO = { route: { kni: '/img/engines/kni.png', fna: '/img/engines/fna.png', godot: '/img/engines/godot.svg', default: '/img/engines/monogame.png' } };
const win = (tiles, at, extra = {}) => ({ k: 'gl', cls: 'window w50', title: '{{engine}}', logo: ENGINE_LOGO, at, fx: 'pop', radius: 10, tiles, ...extra });
const tiles = (arr, at, extra = {}) => ({ k: 'gl', cls: 'w86', gap: 2, radius: 10, at, fx: 'fade', tiles: arr, ...extra });
const BG = 'vec3(.1,.1,.14)';
const PINK = 'vec3(1.,.48,.7)', VIOLET = 'vec3(.77,.64,1.)', MINT = 'vec3(.38,.94,.82)';

const RELOJ = L(cs('MyShaders/Context.cs', `public struct Clock
{
    public float Seconds;
}`), cs('MisShaders/Entorno.cs', `public struct Reloj
{
    public float Segundos;
}`));
const FIELD = L(cs('MyShaders/Plasma.cs', `[uniform]
[layout(0, 0)]
public Clock Time;

// in Fragment:
float t = Time.Seconds;`), cs('MisShaders/Plasma.cs', `[uniform]
[layout(0, 0)]
public Reloj Tiempo;

// en Fragment:
float t = Tiempo.Segundos;`));
const GLSL = L({ title: 'GLSL', lang: 'glsl', code: `layout(binding = 0, std140) uniform Clock
{
    float Seconds;
} Time;` }, { title: 'GLSL', lang: 'glsl', code: `layout(binding = 0, std140) uniform Reloj
{
    float Segundos;
} Tiempo;` });

// the plasma of the chapter, with its speed and colour scale as parameters
const PLASMA = (speed = '1.', scale = '1.5') => `float t2=t*${speed};float x=uv.x*2.-1.,y=(1.-uv.y)*2.-1.;float v=sin(x*6.+t2)+sin(y*6.+t2*1.3)+sin((x+y)*6.+t2*.7)+sin(sqrt(x*x+y*y)*9.-t2*2.);return vec4(.5+.5*sin(v*${scale}),.5+.5*sin(v*${scale}+2.1),.5+.5*sin(v*${scale}+4.2),1.);`;
const WAVE = (expr) => `float x=uv.x*2.-1.,y=(1.-uv.y)*2.-1.;float w=${expr};return vec4(vec3(.5+.5*w),1.);`;
// a plot of curves over time (x axis = 0..1), the dot rides the first curve
const GRAPH = (curves) => `float x=uv.x;float y=(uv.y-.5)*2.4;vec3 c=${BG};c=mix(c,vec3(.3,.3,.4),step(abs(y),.02));${curves.map(([f, col]) => `c=mix(c,${col},smoothstep(.07,.035,abs(y-(${f.replace(/X/g, 'x*12.566')}))));`).join('')}return vec4(c,1.);`;
const SH = {
  still: PLASMA('0.'),
  stripes: 'float x=uv.x*2.-1.;float w=sin(x*6.);return vec4(vec3(.5+.5*w),1.);',
  slide: 'float x=uv.x*2.-1.;float w=sin(x*6.+t*2.);return vec4(vec3(.5+.5*w),1.);',
  sinGraph: GRAPH([['sin(X+t*2.)', 'vec3(.77,.64,1.)']]),
  rgbGraph: GRAPH([['sin(X*.6+t)', 'vec3(1.,.35,.4)'], ['sin(X*.6+t+2.1)', 'vec3(.4,.9,.5)'], ['sin(X*.6+t+4.2)', 'vec3(.4,.6,1.)']]),
  w1: WAVE('sin(x*6.+t)'), w2: WAVE('sin(y*6.+t*1.3)'), w3: WAVE('sin((x+y)*6.+t*.7)'), w4: WAVE('sin(sqrt(x*x+y*y)*9.-t*2.)'),
  sum: 'float x=uv.x*2.-1.,y=(1.-uv.y)*2.-1.;float v=sin(x*6.+t)+sin(y*6.+t*1.3)+sin((x+y)*6.+t*.7)+sin(sqrt(x*x+y*y)*9.-t*2.);return vec4(vec3(.5+.5*v/4.),1.);',
};

export default [
  /* the shaders so far draw one image; the plasma is the same shader at three moments, melting in motion */
  {
    id: 'intro',
    beats: { same: L('always draw the same image', 'dibujan siempre la misma imagen'), move: L('For something to move', 'Para que algo se mueva'), moments: L('three moments of the same shader', 'tres momentos del mismo shader'), motion: L('In motion', 'En movimiento') },
    items: [
      { k: 'kicker', text: L('Shader 4 · a plasma', 'Shader 4 · un plasma') },
      win([{ frag: SH.still, at: 'same', aspect: '16 / 9' }], 'same', { cls: 'window w50' }),
      tiles([
        { frag: PLASMA('0.'), at: 'moments', cap: '<b>t = 0</b>' },
        { frag: PLASMA('0.').replace('float t2=t*0.;', 'float t2=3.;'), at: 'moments+0.5', cap: '<b>t = 3</b>' },
        { frag: PLASMA('0.').replace('float t2=t*0.;', 'float t2=6.;'), at: 'moments+1', cap: '<b>t = 6</b>' },
      ], 'moments', { cols: 3, aspect: '4 / 3' }),
      win([{ frag: PLASMA(), at: 'motion', aspect: '16 / 9' }], 'motion', { cls: 'window w60' }),
    ],
  },
  /* a uniform: data from your program, the same for every pixel; two steps; read, never written */
  {
    id: 'uniform',
    beats: { called: L('is called a uniform', 'se le llama uniform'), same: L('the same value for every pixel', 'lo mismo para todos los píxeles'), two: L('two steps', 'dos pasos'), first: L('First', 'Primero'), then: L('Then', 'Después'), address: L('is its address', 'es su dirección'), read: L('can read a uniform', 'puede leer un uniform'), oneway: L('one direction only', 'un solo sentido') },
    items: [
      { k: 'kicker', text: 'uniform' },
      { k: 'row', at: 'called', out: 'two', items: [
        { k: 'box', cls: 'accent s-mono', text: L('Your program', 'Tu programa'), sub: L('seconds = 3.2', 'segundos = 3.2'), at: 'called' },
        { k: 'arrow', at: 'called+0.6' },
        { k: 'box', cls: 'gpu', text: 'GPU', sub: L('same for every pixel', 'igual para cada píxel'), at: 'same' },
      ] },
      { k: 'slot', items: [
        { k: 'code', at: 'first', out: 'then', type: 'first+0.3', cps: 50, code: RELOJ },
        { k: 'code', at: 'then', type: 'then+0.3', cps: 50, code: FIELD, hl: [{ at: 'address', lines: [1] }, { at: 'read', lines: [5] }] },
      ] },
      { k: 'row', at: 'oneway', items: [
        { k: 'box', cls: 's-mono', text: L('Program', 'Programa'), at: 'oneway' },
        { k: 'arrow', at: 'oneway+0.3' },
        { k: 'box', cls: 's-mono', text: 'GPU', at: 'oneway+0.6', mark: { at: 'oneway+1.2', kind: 'check' } },
      ] },
    ],
  },
  /* sin: stripes; add the time and they slide */
  {
    id: 'sin',
    beats: { sine: L('is the sine', 'es el seno'), paint: L('if we paint each pixel', 'si pintamos cada píxel'), stripes: L('Stripes come out', 'Salen franjas'), twelve: L('twice as many', 'el doble'), time: L('add the time', 'sumas el tiempo'), slide: L('slide to one side', 'se deslizan hacia un lado') },
    items: [
      { k: 'kicker', text: 'sin' },
      tiles([
        { modes: [{ at: 'sine', frag: SH.sinGraph }], aspect: '4 / 3', at: 'sine', cap: L('<b>sin(x)</b>', '<b>sin(x)</b>') },
        { modes: [{ at: 'paint', frag: SH.stripes }, { at: 'time', frag: SH.slide }], aspect: '4 / 3', at: 'paint', cap: L('<b>sin(x * 6f + t)</b>', '<b>sin(x * 6f + t)</b>') },
      ], 'sine', { cols: 2 }),
      { k: 'text', at: 'slide', text: L('Add the time: <b>movement</b>', 'Suma el tiempo: <b>movimiento</b>') },
    ],
  },
  /* four waves in four directions, added: the plasma never repeats */
  {
    id: 'four',
    beats: { boring: L('are boring', 'son aburridas'), sum: L('adding several waves', 'sumar varias ondas'), one: L('One by one', 'Una por una'), pace: L('at its own pace', 'a su ritmo') },
    items: [
      { k: 'kicker', text: L('Four waves together', 'Cuatro ondas juntas') },
      tiles([
        { frag: SH.w1, at: 'one', cap: L('<b>→</b> x', '<b>→</b> x') },
        { frag: SH.w2, at: 'one+1.2', cap: L('<b>↓</b> y', '<b>↓</b> y') },
        { frag: SH.w3, at: 'one+2.4', cap: L('<b>↘</b> x + y', '<b>↘</b> x + y') },
        { frag: SH.w4, at: 'one+3.6', cap: L('<b>◎</b> distance', '<b>◎</b> distancia') },
      ], 'one', { cols: 4, aspect: '1 / 1' }),
      win([{ frag: SH.sum, at: 'pace', aspect: '16 / 9' }], 'pace', { cls: 'window w50' }),
    ],
  },
  /* from a number to a rainbow: the same sin three times, out of step */
  {
    id: 'rainbow',
    beats: { single: L('is a single number', 'es un solo número'), three: L('three times', 'tres veces'), range: L('turns the result of the sine', 'convierte el resultado del seno'), phase: L('out of step', 'desfasados') },
    items: [
      { k: 'kicker', text: L('From a number to a rainbow', 'De un número a un arcoíris') },
      { k: 'gl', cls: 'w86', cols: 2, gap: 2, radius: 10, at: 'three', fx: 'fade', tiles: [
        { frag: SH.rgbGraph, aspect: '4 / 3', at: 'three', cap: L('<b>sin · sin + 2.1 · sin + 4.2</b>', '<b>sin · sin + 2.1 · sin + 4.2</b>') },
        { frag: PLASMA(), aspect: '4 / 3', at: 'phase', cap: L('<b>R · G · B together</b>', '<b>R · G · B juntos</b>') },
      ] },
    ],
  },
  /* what the compiler writes for a uniform: binding = slot; the group (set) only reaches the SPIR-V */
  {
    id: 'compile',
    beats: { add: L('processes a shader with a uniform', 'procesa un shader con un uniform'), glsl: L('In GLSL they look like this', 'En GLSL quedan así'), binding: L('is the slot', 'es el casillero'), group: L('The other number, the group', 'El otro número, el grupo') },
    items: [
      { k: 'kicker', text: L('The uniform, compiled', 'El uniform, compilado') },
      { k: 'code', at: 'glsl', type: 'glsl+0.3', cps: 55, code: GLSL, hl: [{ at: 'binding', lines: [0] }], tags: [{ at: 'binding+0.3', line: 0, text: 'binding = 0' }, { at: 'group+0.3', line: 0, text: 'set → SPIR-V' }] },
    ],
  },
  /* what your program does every frame: four steps; steps 1 and 2 are plain C# */
  {
    id: 'program',
    beats: { frame: L('On every frame you draw', 'En cada cuadro que dibujas'), s1: L('how many seconds have passed', 'cuántos segundos han pasado'), s2: L('You store that number', 'Guardas ese número'), s3: L('You hand', 'Le entregas'), s4: L('You draw', 'Dibujas'), diff: L('is different in each engine', 'es distinto en cada engine'), bytes: L('4 bytes', '4 bytes') },
    items: [
      { k: 'kicker', text: L('Every frame', 'En cada cuadro') },
      { k: 'row', at: 'frame', items: [
        { k: 'box', cls: 's-mono', text: '1', sub: L('read the clock', 'mira el reloj'), at: 's1' },
        { k: 'arrow', at: 's1+0.5' },
        { k: 'box', cls: 's-mono', text: '2', sub: L('store in Clock', 'guarda en Reloj'), at: 's2' },
        { k: 'arrow', at: 's2+0.5' },
        { k: 'box', cls: 'accent s-mono', text: '3', sub: L('hand to the GPU', 'entrega a la GPU'), at: 's3' },
        { k: 'arrow', at: 's3+0.5' },
        { k: 'box', cls: 'gpu s-mono', text: '4', sub: L('draw', 'dibuja'), at: 's4' },
      ] },
      { k: 'text', at: 'diff', text: L('Step 3 changes per engine · steps 1 and 2 are <b>plain C#</b>', 'El paso 3 cambia por engine · los pasos 1 y 2 son <b>C# normal</b>') },
      { k: 'big', cls: 's-mono s-accent', at: 'bytes', text: L('4 bytes = 1 float', '4 bytes = 1 float'), fx: 'pop' },
    ],
  },
  /* play: slower colours, faster time */
  {
    id: 'play',
    beats: { change: L('Change the', 'Cambia el'), mult: L('Multiply the time', 'Multiplica el tiempo'), add: L('Add a second piece of data', 'Añade un segundo dato') },
    items: [
      { k: 'kicker', text: L('Play with it', 'Juega con él') },
      win([{ modes: [{ frag: PLASMA() }, { at: 'change', frag: PLASMA('1.', '.5') }, { at: 'mult', frag: PLASMA('3.') }, { at: 'add', frag: PLASMA() }], aspect: '16 / 9', at: 0.2 }], 0.2, { cls: 'window w60' }),
      { k: 'row', at: 'change', items: [
        { k: 'box', cls: 's-mono', text: '1.5f → 0.5f', sub: L('bigger blobs', 'manchas grandes'), at: 'change' },
        { k: 'box', cls: 's-mono', text: 'Seconds * 3f', sub: L('3× faster', '3× más rápido'), at: 'mult' },
        { k: 'box', cls: 's-mono', text: 'Speed', sub: L('your program decides', 'lo decide tu programa'), at: 'add' },
      ] },
    ],
  },
  {
    id: 'learned',
    dense: true,
    beats: { a: L('A uniform is data', 'Un uniform es un dato'), b: L('It is declared with', 'Se declara con'), c: L('The shader reads it', 'El shader lo lee'), d: L('The same struct works', 'El mismo struct sirve'), e: L('makes waves', 'hace ondas') },
    items: [
      { k: 'kicker', text: L('What you learned', 'Lo que aprendiste') },
      ...[['a', 'uniform = data from your program', 'uniform = dato de tu programa'], ['b', 'struct + [uniform, layout(g, s)]', 'struct + [uniform, layout(g, s)]'], ['c', 'the shader reads, never writes', 'el shader lee, nunca escribe'], ['d', 'the same struct: shader + program', 'el mismo struct: shader + programa'], ['e', 'sin + time = waves that move', 'sin + tiempo = ondas que se mueven']]
        .map(([b, en, es]) => ({ k: 'word', cls: 's-mono', at: b, fx: 'left', text: L(en, es), mark: { at: `${b}+0.4`, kind: 'check' } })),
    ],
  },
];

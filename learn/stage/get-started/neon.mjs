// Stage of "Shader 3: a neon ring" — motion graphics shown next to the text while the chapter is read aloud.
// Each scene starts at its `> [!SCENE] id` cue in content/<lang>/get-started/neon.md. Every image is the ring in one of its stages:
// the corner/centre axes, the distance as grey, the distance to the ring, the glow curve, the colours and the final tube.

const L = (en, es) => ({ en, es });
const cs = (title, code) => ({ title, code, lang: 'csharp' });
const term = (code) => ({ title: 'Terminal', code, lang: 'bash' });
const ENGINE_LOGO = { route: { kni: '/img/engines/kni.png', fna: '/img/engines/fna.png', godot: '/img/engines/godot.svg', raylib: '/img/engines/raylib.png', silknet: '/img/engines/silknet.svg', default: '/img/engines/monogame.png' } };
const win = (tiles, at, extra = {}) => ({ k: 'gl', cls: 'window w50', title: '{{engine}}', logo: ENGINE_LOGO, at, fx: 'pop', radius: 10, tiles, ...extra });
const tiles = (arr, at, extra = {}) => ({ k: 'gl', cls: 'w86', gap: 2, radius: 10, at, fx: 'fade', tiles: arr, ...extra });
const BG = 'vec3(.1,.1,.14)';
const PINK = 'vec3(1.,.2,.7)', CYAN = 'vec3(.2,.8,1.)', DARK = 'vec3(.02,.02,.06)';

const USING = { title: 'MyShaders/Neon.cs', code: 'using static YotsubaShader.GlslSyntax.Methods.Math;', lang: 'csharp' };
const CENTER = L(cs('Fragment', `float x = pixel.Uv.X * 2f - 1f;
float y = pixel.Uv.Y * 2f - 1f;`), cs('Fragment', `float x = pixel.Uv.X * 2f - 1f;
float y = pixel.Uv.Y * 2f - 1f;`));
const DIST = L(cs('Fragment', 'float distanceToCenter = sqrt(x * x + y * y);'), cs('Fragment', 'float distanciaAlCentro = sqrt(x * x + y * y);'));
const RING = L(cs('Fragment', 'float distanceToRing = abs(distanceToCenter - 0.6f);'), cs('Fragment', 'float distanciaAlAnillo = abs(distanciaAlCentro - 0.6f);'));
const GLOW = L(cs('Fragment', 'float glow = clamp(0.03f / distanceToRing, 0f, 1f);'), cs('Fragment', 'float brillo = clamp(0.03f / distanciaAlAnillo, 0f, 1f);'));
const TUBE = L(cs('Fragment', `vec3 pink = new vec3(1f, 0.2f, 0.7f);
vec3 cyan = new vec3(0.2f, 0.8f, 1f);
vec3 tube = mix(pink, cyan, pixel.Uv.X);`), cs('Fragment', `vec3 rosa = new vec3(1f, 0.2f, 0.7f);
vec3 celeste = new vec3(0.2f, 0.8f, 1f);
vec3 tubo = mix(rosa, celeste, pixel.Uv.X);`));
const MIXBG = L(cs('Fragment', `vec3 background = new vec3(0.02f, 0.02f, 0.06f);
vec3 color = mix(background, tube, glow);`), cs('Fragment', `vec3 fondo = new vec3(0.02f, 0.02f, 0.06f);
vec3 color = mix(fondo, tubo, brillo);`));
const BUILD = L(term('dotnet build MyShaders\n\nBuild succeeded.'), term('dotnet build MisShaders\n\nBuild succeeded.'));

// distance from point p to segment a-b (GLSL expression)
const SEG = (a, b) => `length(p-(${a})-((${b})-(${a}))*clamp(dot(p-(${a}),(${b})-(${a}))/dot((${b})-(${a}),(${b})-(${a})),0.,1.))`;
// the neon: ring radius R, glow thickness K, a second ring, vertical gradient
const NEON = ({ R = '.6', K = '.03', two = false, vert = false, glowOnly = false } = {}) => `float x=uv.x*2.-1.,y=uv.y*2.-1.;float d=sqrt(x*x+y*y);float dr=abs(d-${R});float g=clamp(${K}/dr,0.,1.);${two ? `float dr2=abs(d-${R}*.5);g=clamp(g+clamp(${K}/dr2,0.,1.),0.,1.);` : ''}${glowOnly ? 'return vec4(vec3(g),1.);' : `vec3 tube=mix(${PINK},${CYAN},${vert ? '1.-uv.y' : 'uv.x'});return vec4(mix(${DARK},tube,g),1.);`}`;
const SH = {
  full: NEON(),
  glowGray: NEON({ glowOnly: true }),
  thin: NEON({ K: '.01' }), thick: NEON({ K: '.1' }),
  small: NEON({ R: '.3' }), vert: NEON({ vert: true }), two: NEON({ two: true }),
  // axes: origin at the corner or at the centre; faint grid; a point on the circle with its legs when `tri`
  axes: (centered, tri) => `vec2 p=vec2(uv.x,1.-uv.y);vec2 o=${centered ? 'vec2(.5)' : 'vec2(0.)'};vec3 c=${BG};vec2 q=(p-o)*2.;c=mix(c,vec3(.2,.2,.28),step(abs(fract(q.x*2.+.5)-.5),.01)*0.+step(abs(fract(p.x*4.)-.0),.012)+step(abs(fract(p.y*4.)),.012));c=mix(c,vec3(1.,.48,.7),smoothstep(.012,.006,abs(p.x-o.x)));c=mix(c,vec3(.38,.94,.82),smoothstep(.012,.006,abs(p.y-o.y)));c=mix(c,vec3(1.),smoothstep(.035,.02,length(p-o)));${tri ? `vec2 P=o+.3*vec2(cos(t),sin(t));vec2 A=vec2(P.x,o.y);c=mix(c,vec3(1.,.48,.7),smoothstep(.01,.004,${SEG('o', 'A').replace(/length\(p-/g, 'length(p-')}));c=mix(c,vec3(.38,.94,.82),smoothstep(.01,.004,${SEG('A', 'P')}));c=mix(c,vec3(1.,.82,.4),smoothstep(.01,.004,${SEG('o', 'P')}));c=mix(c,vec3(1.),smoothstep(.03,.018,length(p-P)));` : ''}return vec4(c,1.);`,
  distGray: 'float x=uv.x*2.-1.,y=uv.y*2.-1.;return vec4(vec3(sqrt(x*x+y*y)*.8),1.);',
  ringGray: 'float x=uv.x*2.-1.,y=uv.y*2.-1.;float dr=abs(sqrt(x*x+y*y)-.6);return vec4(vec3(dr*1.5),1.);',
  // the ring with a dot at radius r on the right and a segment to the ring
  probe: (r) => `float x=uv.x*2.-1.,y=uv.y*2.-1.;float d=sqrt(x*x+y*y);vec3 c=vec3(abs(d-.6)*.5)+.07;c=mix(c,vec3(.38,.94,.82),smoothstep(.014,.006,abs(d-.6)));vec2 p=vec2(x,y);c=mix(c,vec3(1.,.48,.7),smoothstep(.014,.006,${SEG('vec2(.6,0.)', `vec2(${r},0.)`)}));c=mix(c,vec3(1.),smoothstep(.05,.035,length(p-vec2(${r},0.))));return vec4(c,1.);`,
  // 0.03 / d as a curve, clamped, with the plateau at 1 and the long tail
  curve: (K) => `float x=uv.x,y=uv.y*1.15-.05;float f=clamp(${K}/max(x*1.,.001),0.,1.);vec3 c=${BG};c=mix(c,vec3(.3,.3,.4),step(abs(y-1.),.006)+step(abs(y),.006));c=mix(c,vec3(1.,.48,.7),smoothstep(.022,.008,abs(y-f)));return vec4(c,1.);`,
  stripe: `return vec4(mix(${PINK},${CYAN},uv.x),1.);`,
  mask: NEON({ glowOnly: true }),
};

export default [
  /* a handful of functions the GPU already has */
  {
    id: 'intro',
    beats: { sqrt: L('square root', 'raíz cuadrada'), sine: L('sine', 'seno'), abs: L('absolute value', 'valor absoluto'), mix: L('mixing two colors', 'mezclar dos colores'), tube: L('draw a neon tube', 'dibujar un tubo de neón') },
    items: [
      { k: 'kicker', text: L('Shader 3 · a neon ring', 'Shader 3 · un anillo de neón') },
      { k: 'row', at: 'sqrt', out: 'tube', items: [
        { k: 'box', cls: 's-mono', text: 'sqrt', at: 'sqrt' },
        { k: 'box', cls: 's-mono', text: 'sin', at: 'sine' },
        { k: 'box', cls: 's-mono', text: 'abs', at: 'abs' },
        { k: 'box', cls: 'accent s-mono', text: 'mix', at: 'mix' },
      ] },
      win([{ frag: SH.full, aspect: '1 / 1', at: 'tube' }], 'tube', { cls: 'window w50' }),
    ],
  },
  /* using static Math: sqrt instead of Math.sqrt; lowercase on purpose; System.Math does not exist on the GPU */
  {
    id: 'use',
    beats: { cls: L('a class called', 'una clase llamada'), line: L('put this line', 'poner esta línea'), lets: L('lets you call', 'te deja llamar'), instead: L('instead of', 'en vez de'), low: L('names are lowercase', 'nombres van en minúscula'), sys: L('do not work in a shader', 'no funcionan en un shader'), four: L('the four you will use', 'cuatro que vas a usar') },
    items: [
      { k: 'kicker', text: 'Math' },
      { k: 'code', at: 'cls', out: 'four-1', type: 'line', cps: 40, code: USING, hl: [{ at: 'lets', lines: [0] }] },
      { k: 'row', at: 'instead', out: 'four-1', items: [
        { k: 'box', cls: 's-mono', text: 'Math.sqrt(x)', at: 'instead' },
        { k: 'arrow', at: 'instead+0.6' },
        { k: 'box', cls: 'accent s-mono', text: 'sqrt(x)', at: 'instead+0.9' },
      ] },
      { k: 'row', at: 'sys', out: 'four-1', items: [
        { k: 'box', cls: 's-bad s-mono', text: 'System.Math', sub: L('not on the GPU', 'no existe en la GPU'), at: 'sys', mark: { at: 'sys+0.8', kind: 'x' } },
      ] },
      { k: 'row', at: 'four', items: [
        { k: 'box', cls: 's-mono', text: 'sqrt(9f)', sub: '= 3', at: 'four' },
        { k: 'box', cls: 's-mono', text: 'abs(-0.2f)', sub: '= 0.2', at: 'four+0.3' },
        { k: 'box', cls: 's-mono', text: 'clamp(7f, 0f, 1f)', sub: '= 1', at: 'four+0.6' },
        { k: 'box', cls: 'accent s-mono', text: 'mix(0f, 10f, .5f)', sub: '= 5', at: 'four+0.9' },
      ] },
    ],
  },
  /* step 1: move the centre, then the distance by Pythagoras, then as grey */
  {
    id: 'dist',
    beats: { circle: L('to draw a circle', 'para dibujar un círculo'), move: L('First we move the center', 'Primero movemos el centro'), corner: L('top left corner', 'esquina de arriba a la izquierda'), now: L('Now', 'Ahora'), range: L('go from', 'van de'), pyth: L('Pythagorean theorem', 'teorema de Pitágoras'), paint: L('If you painted each pixel', 'Si pintaras cada píxel'), black: L('Black in the center', 'Negro en el centro'), lighter: L('Lighter and lighter', 'Cada vez más claro') },
    items: [
      { k: 'kicker', text: L('Step 1 · the distance to the center', 'Paso 1 · la distancia al centro') },
      tiles([
        { modes: [{ at: 'circle', frag: SH.axes(false) }, { at: 'now', frag: SH.axes(true) }, { at: 'pyth', frag: SH.axes(true, true) }], aspect: '1 / 1', at: 'circle', cap: L('<b>(0, 0)</b> at the center', '<b>(0, 0)</b> en el centro') },
        { frag: SH.distGray, aspect: '1 / 1', at: 'paint', cap: L('<b>distance</b> as grey', '<b>distancia</b> como gris') },
      ], 'circle', { cols: 2 }),
      { k: 'code', at: 'move', out: 'pyth', type: 'move+0.3', cps: 40, code: CENTER, hl: [{ at: 'corner', lines: [0, 1] }, { at: 'range', lines: [0, 1] }] },
      { k: 'code', at: 'pyth', type: 'pyth+0.3', cps: 35, code: DIST, hl: [{ at: 'pyth', lines: [0] }] },
      { k: 'text', at: 'black', text: L('Center <b>0</b> · farther, whiter', 'Centro <b>0</b> · más lejos, más blanco') },
    ],
  },
  /* step 2: distance to the ring, abs; a probe dot at 0.6, 0.8, 0.4 */
  {
    id: 'ring',
    beats: { radius: L('a ring of radius', 'un anillo de radio'), on: L('right on the ring', 'justo sobre el anillo'), p08: L('If it is at', 'Si está a'), p04: L('if it is at 0.4', 'si está a 0.4'), abs: L('abs removes the sign', 'abs le quita el signo'), care: L('we do not care', 'nos da igual'), see: L('You can already see the ring', 'Ya se ve el anillo') },
    items: [
      { k: 'kicker', text: L('Step 2 · the distance to the ring', 'Paso 2 · la distancia al anillo') },
      { k: 'code', at: 'radius', out: 'on', type: 'radius+0.2', cps: 40, code: RING, hl: [{ at: 'radius', lines: [0] }] },
      tiles([
        { modes: [{ at: 'radius', frag: SH.probe('.6') }, { at: 'p08', frag: SH.probe('.8') }, { at: 'p04', frag: SH.probe('.4') }, { at: 'see', frag: SH.ringGray }], aspect: '1 / 1', at: 'radius', cap: L('<b>|distance − 0.6|</b>', '<b>|distancia − 0.6|</b>') },
      ], 'radius', { cols: 1 }),
      { k: 'row', at: 'on', items: [
        { k: 'box', cls: 's-mono', text: '0.6', sub: '→ 0', at: 'on' },
        { k: 'box', cls: 's-mono', text: '0.8', sub: '→ 0.2', at: 'p08+1' },
        { k: 'box', cls: 's-mono', text: '0.4', sub: '→ −0.2 → 0.2', at: 'abs-2' },
      ] },
      { k: 'text', at: 'care', text: L('Inside or outside: <b>only how far</b>', 'Dentro o fuera: <b>solo cuánto falta</b>') },
    ],
  },
  /* step 3: 0.03 / distance clamped = light that fades; the thickness changes the halo */
  {
    id: 'glow',
    beats: { opp: L('the opposite of the previous image', 'lo contrario de la imagen anterior'), trick: L('divide a small number by the distance', 'dividir un número pequeño entre la distancia'), think: L('Think about what happens', 'Piensa en lo que pasa'), near: L('Near the ring', 'Cerca del anillo'), clamp: L('leaves it at 1', 'lo deja en 1'), fade: L('fading out', 'se va apagando'), tip: L('is the thickness', 'es el grosor'), thin: L('thin thread', 'hilo fino'), halo: L('a huge halo', 'resplandor enorme') },
    items: [
      { k: 'kicker', text: L('Step 3 · the glow', 'Paso 3 · el brillo') },
      { k: 'code', at: 'trick', out: 'think', type: 'trick+0.2', cps: 40, code: GLOW, hl: [{ at: 'trick', lines: [0] }] },
      tiles([
        { frag: SH.curve('.03'), aspect: '4 / 3', at: 'think', cap: L('<b>0.03 / distance</b>', '<b>0.03 / distancia</b>') },
        { modes: [{ at: 'near', frag: SH.glowGray }, { at: 'thin', frag: NEON({ K: '.01', glowOnly: true }) }, { at: 'halo', frag: NEON({ K: '.1', glowOnly: true }) }], aspect: '4 / 3', at: 'near', cap: L('<b>glow</b> · 0.03', '<b>brillo</b> · 0.03') },
      ], 'think', { cols: 2 }),
      { k: 'row', at: 'near', items: [
        { k: 'box', cls: 's-mono', text: '0.01', sub: L('→ 3 → 1', '→ 3 → 1'), at: 'near' },
        { k: 'box', cls: 's-mono', text: '0.03', sub: L('→ 1 → 1', '→ 1 → 1'), at: 'near+0.4' },
        { k: 'box', cls: 'accent s-mono', text: '0.2', sub: L('→ 0.15', '→ 0.15'), at: 'fade-1' },
      ] },
      { k: 'row', at: 'thin', items: [
        { k: 'box', cls: 's-mono', text: '0.01', sub: L('a thin thread', 'un hilo fino'), at: 'thin' },
        { k: 'box', cls: 's-mono', text: '0.1', sub: L('a huge halo', 'un resplandor enorme'), at: 'halo' },
      ] },
    ],
  },
  /* step 4: a gradient from pink to cyan, then glow chooses between background and tube */
  {
    id: 'color',
    beats: { need: L('what color the light is', 'de qué color es la luz'), mix: L('comes in', 'entra mix'), left: L('pink on the left', 'rosa a la izquierda'), right: L('cyan on the right', 'celeste a la derecha'), grad: L('the gradient from the first shader', 'el degradado del primer shader'), again: L('we mix again', 'mezclamos otra vez'), zero: L('Where the glow is 0', 'Donde el brillo es 0'), one: L('Where it is 1', 'Donde es 1'), halo: L('In the halo', 'En el resplandor'), vec3: L('We use vec3', 'Usamos vec3'), opac: L('does not need opacity', 'no le hace falta la opacidad') },
    items: [
      { k: 'kicker', text: L('Step 4 · color', 'Paso 4 · color') },
      { k: 'code', at: 'mix', out: 'again', type: 'mix+0.2', cps: 55, code: TUBE, hl: [{ at: 'left', lines: [2] }] },
      { k: 'code', at: 'again', out: 'vec3', type: 'again+0.2', cps: 45, code: MIXBG, hl: [{ at: 'zero', lines: [1] }] },
      tiles([
        { frag: SH.stripe, aspect: '4 / 3', at: 'left', cap: L('<b>mix(pink, cyan, Uv.X)</b>', '<b>mix(rosa, celeste, Uv.X)</b>') },
        { frag: SH.full, aspect: '4 / 3', at: 'zero', cap: L('<b>mix(background, tube, glow)</b>', '<b>mix(fondo, tubo, brillo)</b>') },
      ], 'left', { cols: 2 }),
      { k: 'row', at: 'zero', items: [
        { k: 'box', cls: 's-mono', text: 'glow = 0', sub: L('background', 'fondo'), at: 'zero' },
        { k: 'box', cls: 'accent s-mono', text: 'glow = 1', sub: L('tube', 'tubo'), at: 'one' },
      ] },
      { k: 'text', at: 'vec3', text: L('<b>vec3</b> · the opacity goes on at the end', '<b>vec3</b> · la opacidad va al final') },
    ],
  },
  /* check: it builds */
  {
    id: 'check',
    beats: { build: L('build the C# project', 'compila el proyecto de C#'), ok: L('Build succeeded', 'Build succeeded'), used: L('used just like', 'se usa igual') },
    items: [
      { k: 'kicker', text: L('It is valid C#', 'Es C# válido') },
      { k: 'term', at: 'build', type: 'build+0.3', cps: 30, code: BUILD, marks: [{ at: 'ok+0.3', line: 2, kind: 'check' }] },
      win([{ frag: SH.full, aspect: '1 / 1', at: 'used' }], 'used', { cls: 'window w40' }),
    ],
  },
  /* play: smaller ring, vertical colour, two rings */
  {
    id: 'play',
    beats: { small: L('a smaller ring', 'un anillo más pequeño'), vert: L('from top to bottom', 'de arriba abajo'), two: L('Draw two rings', 'Dibuja dos anillos') },
    items: [
      { k: 'kicker', text: L('Play with it', 'Juega con él') },
      win([{ modes: [{ at: 0.2, frag: SH.full }, { at: 'small', frag: SH.small }, { at: 'vert', frag: SH.vert }, { at: 'two', frag: SH.two }], aspect: '1 / 1', at: 0.2 }], 0.2, { cls: 'window w50' }),
      { k: 'row', at: 'small', items: [
        { k: 'box', cls: 's-mono', text: '0.6f → 0.3f', sub: L('smaller ring', 'anillo más pequeño'), at: 'small' },
        { k: 'box', cls: 's-mono', text: 'Uv.X → Uv.Y', sub: L('top to bottom', 'de arriba abajo'), at: 'vert' },
        { k: 'box', cls: 'accent s-mono', text: 'glow + glow', sub: L('two rings', 'dos anillos'), at: 'two' },
      ] },
    ],
  },
  {
    id: 'learned',
    dense: true,
    beats: { a: L('The GPU comes with math functions', 'La GPU trae funciones'), b: L('Almost any shape', 'Casi cualquier figura'), c: L('blends two numbers', 'mezcla dos números'), d: L('Dividing a small number', 'Dividir un número pequeño') },
    items: [
      { k: 'kicker', text: L('What you learned', 'Lo que aprendiste') },
      ...[['a', 'using static …Math → sqrt, abs, mix', 'using static …Math → sqrt, abs, mix'], ['b', 'a shape = a distance to it', 'una figura = una distancia a ella'], ['c', 'mix blends · clamp limits', 'mix mezcla · clamp limita'], ['d', 'small ÷ distance = fading light', 'pequeño ÷ distancia = luz que se apaga']]
        .map(([b, en, es]) => ({ k: 'word', cls: 's-mono', at: b, fx: 'left', text: L(en, es), mark: { at: `${b}+0.4`, kind: 'check' } })),
    ],
  },
];

// Stage of "Deciding with if" — motion graphics shown next to the text while the chapter is read aloud.
// Each scene starts at its `> [!SCENE] id` cue in content/<lang>/get-started/decisions.md. Every image is a live shader that makes
// the same decision as the C# on screen: a split, three stripes, a rectangle, a circle, a chessboard and the hard edge they all share.

const L = (en, es) => ({ en, es });
const cs = (title, code) => ({ title, code, lang: 'csharp' });
const ENGINE_LOGO = { route: { kni: '/img/engines/kni.png', fna: '/img/engines/fna.png', godot: '/img/engines/godot.svg', raylib: '/img/engines/raylib.png', silknet: '/img/engines/silknet.svg', default: '/img/engines/monogame.png' } };
const win = (tiles, at, extra = {}) => ({ k: 'gl', cls: 'window w50', title: '{{engine}}', logo: ENGINE_LOGO, at, fx: 'pop', radius: 10, tiles, ...extra });
const tiles = (arr, at, extra = {}) => ({ k: 'gl', cls: 'w86', gap: 2, radius: 10, at, fx: 'fade', tiles: arr, ...extra });
const frag = (en, es) => L(cs('Fragment', en), cs('Fragment', es));
const both = (s) => frag(s, s);

const BG = 'vec3(.1,.1,.14)';
const ORANGE = 'vec3(1.,.5,.1)', BLUE = 'vec3(.1,.4,1.)';
const ASPECT = 'float asp=uRes.x/uRes.y;';

const SPLIT = both('if (pixel.Uv.X < 0.5f)\n{\n    return new vec4(1f, 0.5f, 0.1f, 1f);\n}\nreturn new vec4(0.1f, 0.4f, 1f, 1f);');
const ELSEIF = both('float x = pixel.Uv.X;\nif (x < 0.33f)\n    return new vec4(1f, 0.5f, 0.1f, 1f);\nelse if (x < 0.66f)\n    return new vec4(1f, 1f, 1f, 1f);\nelse\n    return new vec4(0.1f, 0.4f, 1f, 1f);');
const RECT = L(cs('Fragment', 'float x = pixel.Uv.X;\nfloat y = pixel.Uv.Y;\nif (x > 0.2f && x < 0.8f && y > 0.25f && y < 0.75f)\n    return new vec4(1f, 0.5f, 0.1f, 1f);\nreturn new vec4(0.1f, 0.1f, 0.14f, 1f);'), cs('Fragment', 'float x = pixel.Uv.X;\nfloat y = pixel.Uv.Y;\nif (x > 0.2f && x < 0.8f && y > 0.25f && y < 0.75f)\n    return new vec4(1f, 0.5f, 0.1f, 1f);\nreturn new vec4(0.1f, 0.1f, 0.14f, 1f);'));
const CIRCLE = L(cs('Fragment', 'if (dx * dx + dy * dy < 0.3f * 0.3f)\n    return new vec4(1f, 0.5f, 0.1f, 1f);\nreturn new vec4(0.1f, 0.1f, 0.14f, 1f);'), cs('Fragment', 'if (dx * dx + dy * dy < 0.3f * 0.3f)\n    return new vec4(1f, 0.5f, 0.1f, 1f);\nreturn new vec4(0.1f, 0.1f, 0.14f, 1f);'));
const CHECKER = L(cs('Fragment', 'int column = (int)(pixel.Uv.X * 8f);\nint row = (int)(pixel.Uv.Y * 8f);\nif ((column + row) % 2 == 0)\n    return new vec4(1f, 1f, 1f, 1f);\nreturn new vec4(0.1f, 0.1f, 0.14f, 1f);'), cs('Fragment', 'int columna = (int)(pixel.Uv.X * 8f);\nint fila = (int)(pixel.Uv.Y * 8f);\nif ((columna + fila) % 2 == 0)\n    return new vec4(1f, 1f, 1f, 1f);\nreturn new vec4(0.1f, 0.1f, 0.14f, 1f);'));
const IF_FORM = both('Vec4 color;\nif (x < 0.5f)\n    color = new vec4(1f, 0.5f, 0.1f, 1f);\nelse\n    color = new vec4(0.1f, 0.4f, 1f, 1f);');
const TERNARY = both('Vec4 color = x < 0.5f\n    ? new vec4(1f, 0.5f, 0.1f, 1f)\n    : new vec4(0.1f, 0.4f, 1f, 1f);');

const SH = {
  // every pixel decides on its own: the little cells show each pixel's decision at the same time
  cells: `vec2 g=vec2(28.,18.);vec2 id=floor(uv*g),f=fract(uv*g);float cut=.5+.18*sin(t*.8);float on=step(id.x/g.x+.5/g.x,cut);float edge=step(.1,f.x)*step(.1,f.y)*step(f.x,.9)*step(f.y,.9);vec3 c=mix(${BLUE},${ORANGE},on)*edge+vec3(.05)*(1.-edge);return vec4(c,1.);`,
  split: (x) => `return vec4(uv.x<${x}?${ORANGE}:${BLUE},1.);`,
  splitMove: `float x=mix(.5,.2,smoothstep(0.,1.,.5+.5*sin(t*.9)));return vec4(uv.x<x?${ORANGE}:${BLUE},1.);`,
  stripes: `float x=uv.x;float cur=.5+.45*sin(t*.7);vec3 c=x<.33?${ORANGE}:x<.66?vec3(1.):${BLUE};float line=step(abs(x-cur),.004);return vec4(mix(c,vec3(.1),line),1.);`,
  // the half planes of the rectangle appearing one after the other, then their intersection
  rect: (n) => `float x=uv.x,y=1.-uv.y;float a=step(.2,x),b=step(x,.8),c=step(.25,y),d=step(y,.75);float m=${n >= 4 ? 'a*b*c*d' : n === 3 ? 'a*b*c' : n === 2 ? 'a*b' : 'a'};vec3 col=mix(${BG},${ORANGE},m);return vec4(col,1.);`,
  rectFull: `float x=uv.x,y=1.-uv.y;float tall=.5+.5*sin(t*.8);float w=mix(.3,.18,tall),h=mix(.2,.36,tall);float m=step(.5-w,x)*step(x,.5+w)*step(.5-h,y)*step(y,.5+h);return vec4(mix(${BG},${ORANGE},m),1.);`,
  circle: (r, cx = '.5') => `${ASPECT}float dx=(uv.x-${cx})*asp,dy=(1.-uv.y)-.5;float m=step(dx*dx+dy*dy,${r}*${r});return vec4(mix(${BG},${ORANGE},m),1.);`,
  circleAnim: `${ASPECT}float k=.5+.5*sin(t*.9);float r=mix(.3,.1,smoothstep(0.,1.,k));float cx=.5-mix(0.,.2,smoothstep(.5,1.,k));float dx=(uv.x-cx)*asp,dy=(1.-uv.y)-.5;float m=step(dx*dx+dy*dy,r*r);float ring=smoothstep(.006,.0,abs(length(vec2(dx,dy))-r));return vec4(mix(mix(${BG},${ORANGE},m),vec3(1.),ring*.6),1.);`,
  checker: (n) => `float cx=floor(uv.x*${n}.),cy=floor((1.-uv.y)*${n}.);float m=1.-mod(cx+cy,2.);return vec4(mix(${BG},vec3(1.),m),1.);`,
  checkerRect: `float cx=floor(uv.x*4.),cy=floor((1.-uv.y)*20.);float m=1.-mod(cx+cy,2.);return vec4(mix(${BG},vec3(1.),m),1.);`,
  // the same circle with hard and soft edges, seen through big pixels so the stair steps show
  hardEdge: `${ASPECT}vec2 q=(floor(uv*vec2(22.*asp/1.6,22.))+.5)/vec2(22.*asp/1.6,22.);float dx=(q.x-.5)*asp,dy=(1.-q.y)-.5;float m=step(dx*dx+dy*dy,.3*.3);return vec4(mix(${BG},${ORANGE},m),1.);`,
  softEdge: `${ASPECT}vec2 q=(floor(uv*vec2(22.*asp/1.6,22.))+.5)/vec2(22.*asp/1.6,22.);float dx=(q.x-.5)*asp,dy=(1.-q.y)-.5;float d=sqrt(dx*dx+dy*dy);float m=1.-smoothstep(.2,.4,d);return vec4(mix(${BG},${ORANGE},m),1.);`,
};

export default [
  /* until now: a calculation; now: choose. And what you can draw with a choice: shapes with a hard edge */
  {
    id: 'intro',
    beats: { choose: L('you want to choose', 'quieres elegir'), shapes: L('draw shapes', 'dibujar figuras'), hard: L('hard edge', 'borde duro') },
    items: [
      { k: 'kicker', text: 'if' },
      { k: 'code', at: 'choose', type: 'choose+0.2', cps: 40, code: both('if (condition)\n{\n    …\n}') },
      tiles([
        { frag: SH.circleAnim, at: 'shapes', aspect: '1 / 1', cap: L('<b>Circles</b>', '<b>Círculos</b>') },
        { frag: SH.rectFull, at: 'shapes+0.4', aspect: '1 / 1', cap: L('<b>Rectangles</b>', '<b>Rectángulos</b>') },
        { frag: SH.checker(6), at: 'shapes+0.8', aspect: '1 / 1', cap: L('<b>Boards</b>', '<b>Tableros</b>') },
      ], 'shapes', { cols: 3 }),
      { k: 'text', at: 'hard', text: L('Everything with a <b>hard edge</b>', 'Todo lo que tenga un <b>borde duro</b>') },
    ],
  },
  /* every pixel runs the shader on its own: it only knows about itself */
  {
    id: 'alone',
    beats: { own: L('on its own', 'por su cuenta'), single: L('a single pixel', 'un solo píxel'), left: L('The pixel on the left', 'El píxel de la izquierda') },
    items: [
      { k: 'kicker', text: L('Each pixel decides alone', 'Cada píxel decide solo') },
      tiles([{ frag: SH.cells, aspect: '16 / 10', at: 'own', cap: L('<b>Thousands of pixels, each running Fragment</b>', '<b>Miles de píxeles, cada uno ejecuta Fragment</b>') }], 'own', { cols: 1 }),
      { k: 'row', at: 'left', items: [
        { k: 'box', cls: 's-mono', text: L('"orange"', '"naranja"'), sub: L('pixel on the left', 'píxel izquierdo'), at: 'left' },
        { k: 'box', cls: 's-mono', text: L('"blue"', '"azul"'), sub: L('pixel on the right', 'píxel derecho'), at: 'left+1.2' },
      ] },
    ],
  },
  /* Step 1: if X < 0.5 orange, else blue; the split line then moves */
  {
    id: 'split',
    beats: { sentence: L('Read it like a sentence', 'Léelo como una frase'), cond: L('the condition', 'la condición'), braces: L('Between braces', 'Entre llaves'), skips: L('skips the braces', 'se salta las llaves'), move: L('Move the', 'Mueve el') },
    items: [
      { k: 'kicker', text: L('Step 1 · splitting the screen in two', 'Paso 1 · partir la pantalla en dos') },
      { k: 'code', at: 0.2, type: 0.4, cps: 50, code: SPLIT, hl: [{ at: 'cond', until: 'braces', lines: [0] }, { at: 'braces', until: 'skips', lines: [2] }, { at: 'skips', until: 'move', lines: [4] }] },
      win([{ modes: [{ at: 'sentence-4', frag: SH.split('.5') }, { at: 'move', frag: SH.splitMove }] }], 'sentence-4'),
    ],
  },
  /* Step 2: else if / else, top to bottom, the first true one wins */
  {
    id: 'elseif',
    beats: { three: L('three stripes', 'tres franjas'), elseif: L('means', 'significa'), els: L('without a condition', 'sin condición'), order: L('Order matters', 'El orden importa'), var: L('a float x at the start', 'float x al principio') },
    items: [
      { k: 'kicker', text: L('Step 2 · else if', 'Paso 2 · else if') },
      { k: 'code', at: 'three', type: 'three+0.3', cps: 55, code: ELSEIF, hl: [{ at: 'elseif', until: 'els', lines: [3, 4] }, { at: 'els', until: 'order', lines: [5, 6] }, { at: 'order', lines: [1, 2] }] },
      win([{ frag: SH.stripes, at: 'three' }], 'three'),
    ],
  },
  /* the comparison operators; = assigns, == compares; floats and == */
  {
    id: 'operators',
    beats: { these: L('These are the ones', 'Estos son los que'), assign: L('To compare', 'Para comparar'), common: L('very common mistake', 'error muy común'), floats: L('with float numbers', 'con números float') },
    items: [
      { k: 'kicker', text: L('Comparison operators', 'Operadores de comparación') },
      { k: 'row', at: 'these', items: ['<', '>', '<=', '>=', '==', '!='].map((o, i) => ({ k: 'box', cls: 'accent s-mono', text: o, at: `these+${(0.2 + i * 0.35).toFixed(2)}`, fx: 'pop' })) },
      { k: 'row', at: 'assign-3', items: [
        { k: 'box', cls: 's-mono', text: 'x = 5f', sub: L('assigns', 'asigna'), at: 'assign-3' },
        { k: 'box', cls: 'accent s-mono', text: 'x == 5f', sub: L('compares', 'compara'), at: 'assign' },
      ] },
      { k: 'row', at: 'floats', items: [
        { k: 'box', cls: 's-mono', text: '0.5', at: 'floats' },
        { k: 'word', text: '≠', at: 'floats+0.5', fx: 'pop' },
        { k: 'box', cls: 's-bad s-mono', text: '0.5000001', at: 'floats+1' },
      ] },
    ],
  },
  /* Step 3: four conditions at once make a rectangle; && || ! */
  {
    id: 'combine',
    beats: { four: L('four things at once', 'cuatro cosas a la vez'), three: L('three ways', 'tres formas'), edges: L('true at the left and right edges', 'verdadero en los bordes izquierdo y derecho'), tall: L('taller than wide', 'más alto que ancho') },
    items: [
      { k: 'kicker', text: L('Step 3 · combining conditions', 'Paso 3 · combinar condiciones') },
      { k: 'code', at: 'four-3', type: 'four-2.4', cps: 55, code: RECT, hl: [{ at: 'four', lines: [2] }] },
      win([{ modes: [{ at: 'four-3', frag: SH.rect(1) }, { at: 'four', frag: SH.rect(2) }, { at: 'four+2', frag: SH.rect(3) }, { at: 'four+4', frag: SH.rect(4) }, { at: 'tall', frag: SH.rectFull }] }], 'four-3'),
      { k: 'row', at: 'three', items: [
        { k: 'box', cls: 'accent s-mono', text: '&&', sub: L('and', 'y'), at: 'three' },
        { k: 'box', cls: 's-mono', text: '||', sub: L('or', 'o'), at: 'three+0.6' },
        { k: 'box', cls: 's-mono', text: '!', sub: L('not', 'no'), at: 'three+1.2' },
      ] },
    ],
  },
  /* Step 4: a circle: closer to the centre than the edge is */
  {
    id: 'circle',
    beats: { closer: L('closer to the center', 'más cerca del centro'), cond: L('The condition', 'La condición'), small: L('gets small', 'se hace pequeño'), left: L('moves to the left', 'se mueve a la izquierda') },
    items: [
      { k: 'kicker', text: L('Step 4 · a circle', 'Paso 4 · un círculo') },
      { k: 'code', at: 'closer-5', type: 'closer-4.4', cps: 45, code: CIRCLE, hl: [{ at: 'cond', lines: [0] }] },
      win([{ modes: [{ at: 'closer-5', frag: SH.circle('.3') }, { at: 'small', frag: SH.circleAnim }] }], 'closer-5'),
    ],
  },
  /* Step 5: a chessboard: which square am I in, is the sum even or odd */
  {
    id: 'checker',
    beats: { count: L('count which square', 'contar en qué casilla'), cut: L('cuts off the decimals', 'corta los decimales'), rem: L('remainder of dividing by 2', 'resto de dividir entre 2'), alternate: L('squares alternate', 'se van alternando'), rect: L('rectangular squares', 'casillas rectangulares') },
    items: [
      { k: 'kicker', text: L('Step 5 · a chessboard', 'Paso 5 · un tablero de ajedrez') },
      { k: 'code', at: 'count', type: 'count+0.3', cps: 55, code: CHECKER, hl: [{ at: 'cut', until: 'rem', lines: [0, 1] }, { at: 'rem', lines: [2] }] },
      win([{ modes: [{ at: 'count', frag: SH.checker(8) }, { at: 'rect', frag: SH.checkerRect }] }], 'count'),
      { k: 'row', at: 'alternate', items: [
        { k: 'box', cls: 's-mono', text: '(3 + 2) % 2 = 1', at: 'alternate' },
        { k: 'box', cls: 's-mono', text: '(4 + 2) % 2 = 0', at: 'alternate+0.8' },
      ] },
    ],
  },
  /* the ? operator: the if with one value, written on one line */
  {
    id: 'ternary',
    beats: { shorter: L('a shorter way', 'una forma más corta'), reads: L('It reads', 'Se lee'), same: L('It is the same as', 'Es lo mismo que'), use: L('Use', 'Usa') },
    items: [
      { k: 'kicker', text: L('A shortcut · the ? operator', 'Un atajo · el operador ?') },
      { k: 'morph', at: 'shorter', morph: 'same', dur: 1.4, fresh: 'use', from: IF_FORM, to: TERNARY, hl: [{ at: 'reads', lines: 'all', step: 0.3 }] },
    ],
  },
  /* the flaw: the edge is a clean cut; with big pixels the stair steps show; soft edges come later */
  {
    id: 'flaw',
    beats: { edge: L('the edge of the circle', 'el borde del círculo'), cut: L('clean cut', 'corte limpio'), all: L('all or nothing', 'todo o nada'), later: L('two chapters later', 'dos capítulos más') },
    items: [
      { k: 'kicker', text: L('The flaw of if', 'El defecto del if') },
      tiles([
        { frag: SH.hardEdge, aspect: '16 / 10', at: 'edge', cap: L('<b>if · all or nothing</b>', '<b>if · todo o nada</b>'), marks: [{ at: 'all+0.5', kind: 'x' }] },
        { frag: SH.softEdge, aspect: '16 / 10', at: 'later-3', cap: L('<b>Soft edge · two chapters later</b>', '<b>Borde suave · dos capítulos después</b>'), marks: [{ at: 'later', kind: 'check' }] },
      ], 'edge', { cols: 2 }),
    ],
  },
  {
    id: 'learned',
    dense: true,
    beats: { a: L('Each pixel runs the shader', 'Cada píxel ejecuta el shader'), b: L('choose which color to return', 'eligen qué color devolver'), c: L('is “and”', 'es "y"'), d: L('cuts off the decimals', 'corta los decimales'), e: L('Shapes made with', 'Las figuras hechas con') },
    items: [
      { k: 'kicker', text: L('What you learned', 'Lo que aprendiste') },
      ...[['a', 'every pixel decides alone', 'cada píxel decide solo'], ['b', 'if · else if · else', 'if · else if · else'], ['c', '&&  ||  !', '&&  ||  !'], ['d', '(int) cuts · % counts', '(int) corta · % cuenta'], ['e', 'if → hard edge', 'if → borde duro']]
        .map(([b, en, es]) => ({ k: 'word', cls: 's-mono', at: b, fx: 'left', text: L(en, es), mark: { at: `${b}+0.4`, kind: 'check' } })),
    ],
  },
];

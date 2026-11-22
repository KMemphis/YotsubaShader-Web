// Stage of "Functions and structs" — motion graphics shown next to the text while the chapter is read aloud.
// Each scene starts at its `> [!SCENE] id` cue in content/<lang>/get-started/functions.md. The face of the chapter is drawn layer
// by layer as a live shader (sky, head, eyes, mouth), and the code that repeats turns into a function, then into a struct.

const L = (en, es) => ({ en, es });
const cs = (title, code) => ({ title, code, lang: 'csharp' });
const ENGINE_LOGO = { route: { kni: '/img/engines/kni.png', fna: '/img/engines/fna.png', godot: '/img/engines/godot.svg', default: '/img/engines/monogame.png' } };
const win = (tiles, at, extra = {}) => ({ k: 'gl', cls: 'window w50', title: '{{engine}}', logo: ENGINE_LOGO, at, fx: 'pop', radius: 10, tiles, ...extra });
const both = (s, title = 'Fragment') => L(cs(title, s), cs(title, s));
const pair = (en, es, title = 'Fragment') => L(cs(title, en), cs(title, es));

const BLOCK = pair(`float dx = x - 0.5f;
float dy = y - 0.5f;
if (dx * dx + dy * dy < 0.4f * 0.4f)
    color = skin;`, `float dx = x - 0.5f;
float dy = y - 0.5f;
if (dx * dx + dy * dy < 0.4f * 0.4f)
    color = piel;`);
const CALL = pair('if (InCircle(x, y, middle, 0.5f, 0.4f))\n    color = skin;', 'if (EnCirculo(x, y, medio, 0.5f, 0.4f))\n    color = piel;');
const EYES = pair(`dx = x - (middle - 0.15f);
dy = y - 0.4f;
if (dx * dx + dy * dy < 0.06f * 0.06f)
    color = ink;`, `dx = x - (medio - 0.15f);
dy = y - 0.4f;
if (dx * dx + dy * dy < 0.06f * 0.06f)
    color = tinta;`);
const HEAD = pair(`float dx = x - middle;
float dy = y - 0.5f;
if (dx * dx + dy * dy < 0.4f * 0.4f)
    color = Make.Vec4(1f, 0.85f, 0.3f, 1f);`, `float dx = x - medio;
float dy = y - 0.5f;
if (dx * dx + dy * dy < 0.4f * 0.4f)
    color = Crear.Vec4(1f, 0.85f, 0.3f, 1f);`);
const MEASURE = pair(`float aspect = Data.Width / Data.Height;
float x = pixel.Uv.X * aspect;
float y = pixel.Uv.Y;
float middle = aspect / 2f;
vec4 color = Make.Vec4(0.45f, 0.7f, 1f, 1f);`, `float aspecto = Datos.Ancho / Datos.Alto;
float x = pixel.Uv.X * aspecto;
float y = pixel.Uv.Y;
float medio = aspecto / 2f;
vec4 color = Crear.Vec4(0.45f, 0.7f, 1f, 1f);`);
const INCIRCLE = pair(`static bool InCircle(float x, float y, float cx, float cy, float r)
{
    float dx = x - cx;
    float dy = y - cy;
    return dx * dx + dy * dy < r * r;
}`, `static bool EnCirculo(float x, float y, float cx, float cy, float r)
{
    float dx = x - cx;
    float dy = y - cy;
    return dx * dx + dy * dy < r * r;
}`, 'Face.cs');
const INRECT = pair('static bool InRect(float x, float y, float x0, float y0, float x1, float y1)\n{\n    return x > x0 && x < x1 && y > y0 && y < y1;\n}', 'static bool EnRect(float x, float y, float x0, float y0, float x1, float y1)\n{\n    return x > x0 && x < x1 && y > y0 && y < y1;\n}', 'Face.cs');
const PALETTE = pair(`vec4 sky = Make.Vec4(0.45f, 0.7f, 1f, 1f);
vec4 skin = Make.Vec4(1f, 0.85f, 0.3f, 1f);
vec4 ink = Make.Vec4(0.1f, 0.1f, 0.1f, 1f);
vec4 color = sky;`, `vec4 cielo = Crear.Vec4(0.45f, 0.7f, 1f, 1f);
vec4 piel = Crear.Vec4(1f, 0.85f, 0.3f, 1f);
vec4 tinta = Crear.Vec4(0.1f, 0.1f, 0.1f, 1f);
vec4 color = cielo;`);
const STRUCT = pair(`struct Circle
{
    public float X, Y, R;
}

static Circle NewCircle(float x, float y, float r)
{
    Circle c; c.X = x; c.Y = y; c.R = r;
    return c;
}

static bool Contains(Circle c, float x, float y)
{
    float dx = x - c.X, dy = y - c.Y;
    return dx * dx + dy * dy < c.R * c.R;
}`, `struct Circulo
{
    public float X, Y, R;
}

static Circulo NuevoCirculo(float x, float y, float r)
{
    Circulo c; c.X = x; c.Y = y; c.R = r;
    return c;
}

static bool Contiene(Circulo c, float x, float y)
{
    float dx = x - c.X, dy = y - c.Y;
    return dx * dx + dy * dy < c.R * c.R;
}`, 'Face.cs');
const FINAL = pair(`Circle head = NewCircle(middle, 0.5f, 0.4f);
Circle leftEye = NewCircle(middle - 0.15f, 0.4f, 0.06f);
Circle rightEye = NewCircle(middle + 0.15f, 0.4f, 0.06f);

if (Contains(head, x, y)) color = skin;
if (Contains(leftEye, x, y)) color = ink;
if (Contains(rightEye, x, y)) color = ink;`, `Circulo cabeza = NuevoCirculo(medio, 0.5f, 0.4f);
Circulo ojoIzq = NuevoCirculo(medio - 0.15f, 0.4f, 0.06f);
Circulo ojoDer = NuevoCirculo(medio + 0.15f, 0.4f, 0.06f);

if (Contiene(cabeza, x, y)) color = piel;
if (Contiene(ojoIzq, x, y)) color = tinta;
if (Contiene(ojoDer, x, y)) color = tinta;`);

// the face: sky, then head, eyes, mouth; `skin` can turn green (step 7: one line changes)
const BG = 'vec3(.1,.1,.14)';
const FACE = (level, skin = 'vec3(1.,.85,.3)') => `float asp=uRes.x/uRes.y;float x=uv.x*asp,y=1.-uv.y;float mid=asp/2.;vec3 c=vec3(.45,.7,1.);vec3 ink=vec3(.1);${level >= 1 ? `if(length(vec2(x-mid,y-.5))<.4)c=${skin};` : ''}${level >= 2 ? 'if(length(vec2(x-(mid-.15),y-.4))<.06||length(vec2(x-(mid+.15),y-.4))<.06)c=ink;' : ''}${level >= 3 ? 'if(x>mid-.15&&x<mid+.15&&y>.65&&y<.7)c=ink;' : ''}return vec4(c,1.);`;
const FACE_GREEN = FACE(3, 'vec3(.4,.85,.4)');
const REPEAT = `${'float asp=uRes.x/uRes.y;float x=uv.x*asp,y=1.-uv.y;float mid=asp/2.;vec3 c=vec3(.45,.7,1.);'}float k=.5+.5*sin(t*1.4);if(length(vec2(x-mid,y-.5))<.4)c=vec3(1.,.85,.3);if(length(vec2(x-(mid-.15),y-.4))<.06||length(vec2(x-(mid+.15),y-.4))<.06)c=vec3(.1);if(length(vec2(x-mid,y-.58))<.04*k)c=vec3(.9,.45,.3);return vec4(c,1.);`;

export default [
  /* as a shader grows it repeats itself; the face is where you see it */
  {
    id: 'intro',
    beats: { repeat: L('starts to repeat itself', 'empieza a repetirse'), face: L('drawing a face', 'dibujando una cara') },
    items: [
      { k: 'kicker', text: L('Functions and structs', 'Funciones y structs') },
      { k: 'slot', items: [
        { k: 'code', at: 0.3, out: 'face', type: 0.5, cps: 40, code: BLOCK },
        win([{ frag: FACE(3), at: 'face', aspect: '16 / 10' }], 'face', { cls: 'window w50' }),
      ] },
    ],
  },
  /* Step 1: the measures: x from 0 to aspect, y from 0 to 1, middle; the sky */
  {
    id: 'sky',
    beats: { height: L('the windows height measure 1', 'la altura de la ventana'), middle: L('half the width', 'la mitad del ancho'), color: L('a variable of type', 'una variable de tipo'), plain: L('plain sky blue', 'azul cielo liso') },
    items: [
      { k: 'kicker', text: L('Step 1 · the sky and the measures', 'Paso 1 · el cielo y las medidas') },
      { k: 'code', at: 'height-6', type: 'height-5.4', cps: 50, code: MEASURE, hl: [{ at: 'height', until: 'middle', lines: [1, 2] }, { at: 'middle', until: 'color', lines: [3] }, { at: 'color', lines: [4] }] },
      win([{ frag: FACE(0), at: 'plain', aspect: '16 / 9' }], 'plain'),
    ],
  },
  /* Step 2: the head: a yellow circle on the sky */
  {
    id: 'head',
    beats: { circle: L('It is the circle from the previous chapter', 'Es el círculo del capítulo anterior'), yellow: L('a yellow circle', 'un círculo amarillo') },
    items: [
      { k: 'kicker', text: L('Step 2 · the head', 'Paso 2 · la cabeza') },
      { k: 'code', at: 'circle', type: 'circle+0.3', cps: 45, code: HEAD },
      win([{ modes: [{ frag: FACE(0) }, { at: 'yellow', frag: FACE(1) }], at: 'circle+1', aspect: '16 / 9' }], 'circle+1'),
    ],
  },
  /* Step 3: the eyes: dx and dy reused; the order of painting matters */
  {
    id: 'eyes',
    beats: { eyes: L('two eyes', 'dos ojos'), reuse: L('we reuse dx and dy', 'reusamos dx y dy'), order: L('the order in which you paint', 'el orden en que pintas') },
    items: [
      { k: 'kicker', text: L('Step 3 · the eyes', 'Paso 3 · los ojos') },
      { k: 'code', at: 'eyes', type: 'eyes+0.3', cps: 45, code: EYES, hl: [{ at: 'reuse', lines: [0, 1] }] },
      win([{ modes: [{ frag: FACE(1) }, { at: 'reuse+3', frag: FACE(2) }], at: 'eyes', aspect: '16 / 9' }], 'eyes'),
      { k: 'text', at: 'order', text: L('What you paint <b>last</b> stays on top', 'Lo que pintas <b>último</b> queda encima') },
    ],
  },
  /* Step 4: the mouth: a rectangle */
  {
    id: 'mouth',
    beats: { mouth: L('The mouth will be a rectangle', 'La boca será un rectángulo'), works: L('It works', 'Funciona') },
    items: [
      { k: 'kicker', text: L('Step 4 · the mouth', 'Paso 4 · la boca') },
      { k: 'code', at: 'mouth', type: 'mouth+0.3', cps: 45, code: pair('if (x > middle - 0.15f && x < middle + 0.15f && y > 0.65f && y < 0.7f)\n    color = ink;', 'if (x > medio - 0.15f && x < medio + 0.15f && y > 0.65f && y < 0.7f)\n    color = tinta;') },
      win([{ modes: [{ frag: FACE(2) }, { at: 'mouth+3', frag: FACE(3) }], at: 'mouth', aspect: '16 / 9' }], 'mouth'),
    ],
  },
  /* the problem: the same block over and over; a nose would be another copy */
  {
    id: 'repeat',
    beats: { same: L('almost the same code', 'casi el mismo código'), nose: L('a nose', 'una nariz'), sign: L('sign that a function is missing', 'señal de que falta una función') },
    items: [
      { k: 'kicker', text: L('The problem: it repeats', 'El problema: se repite') },
      { k: 'row', at: 'same', items: [
        { k: 'box', cls: 's-mono', text: L('head', 'cabeza'), sub: 'if (…)', at: 'same' },
        { k: 'box', cls: 's-mono', text: L('eye', 'ojo'), sub: 'if (…)', at: 'same+0.5' },
        { k: 'box', cls: 's-mono', text: L('eye', 'ojo'), sub: 'if (…)', at: 'same+1' },
        { k: 'box', cls: 's-bad s-mono', text: L('nose', 'nariz'), sub: 'if (…)', at: 'nose', fx: 'pop' },
      ] },
      win([{ frag: REPEAT, at: 'nose', aspect: '16 / 9' }], 'nose'),
      { k: 'text', at: 'sign', text: L('Copy + paste + change a few numbers = a <b>function</b> is missing', 'Copiar + pegar + cambiar unos números = falta una <b>función</b>') },
    ],
  },
  /* Step 5: the function InCircle; each circle now takes three lines; parameters are copies */
  {
    id: 'func',
    beats: { fn: L('A function is a piece of code with a name', 'Una función es un trozo de código con nombre'), question: L('is this point inside this circle', 'este punto está dentro de este círculo'), use: L('Now use it', 'Ahora úsala'), same: L('the image is identical', 'la imagen es idéntica'), params: L('are called parameters', 'se llaman parámetros') },
    items: [
      { k: 'kicker', text: L('Step 5 · your first function', 'Paso 5 · tu primera función') },
      { k: 'slot', items: [
        { k: 'code', at: 'fn', out: 'use', type: 'fn+0.3', cps: 50, code: INCIRCLE, hl: [{ at: 'question', lines: [0] }] },
        { k: 'morph', at: 'use', morph: 'same', dur: 1.4, from: BLOCK, to: CALL },
      ] },
      win([{ frag: FACE(3), at: 'same', aspect: '16 / 9' }], 'same', { cls: 'window w40' }),
      { k: 'text', at: 'params', text: L('Parameters are <b>copies</b>', 'Los parámetros son <b>copias</b>') },
    ],
  },
  /* Step 6: a second function, for the rectangle */
  {
    id: 'rect',
    beats: { better: L('can also be written better', 'también se puede escribir mejor'), reads: L('how well the call reads', 'lo bien que se lee') },
    items: [
      { k: 'kicker', text: L('Step 6 · another function', 'Paso 6 · otra función') },
      { k: 'code', at: 'better', type: 'better+0.3', cps: 50, code: INRECT },
      { k: 'code', at: 'reads-2', code: pair('if (InRect(x, y, middle - 0.15f, 0.65f, middle + 0.15f, 0.7f))\n    color = ink;', 'if (EnRect(x, y, medio - 0.15f, 0.65f, medio + 0.15f, 0.7f))\n    color = tinta;'), marks: [{ at: 'reads+1', line: 0, kind: 'check' }] },
    ],
  },
  /* Step 7: name the colours: change one line and the whole face turns green */
  {
    id: 'colors',
    beats: { three: L('the same color written three times', 'el mismo color escrito tres veces'), name: L('a good name', 'un buen nombre'), green: L('the face to be green', 'la cara sea verde') },
    items: [
      { k: 'kicker', text: L('Step 7 · name the colors', 'Paso 7 · ponle nombre a los colores') },
      { k: 'code', at: 'name-4', type: 'name-3.4', cps: 50, code: PALETTE, hl: [{ at: 'green', lines: [1] }] },
      win([{ modes: [{ frag: FACE(3) }, { at: 'green', frag: FACE_GREEN }], at: 'name-4', aspect: '16 / 9' }], 'name-4', { cls: 'window w40' }),
    ],
  },
  /* Step 8: a struct: three loose numbers become one box; declare circles once, then use them */
  {
    id: 'struct',
    beats: { loose: L('three loose numbers', 'tres números sueltos'), box: L('a named box', 'una caja con nombre'), newType: L('is the new type', 'es el tipo nuevo'), declared: L('declared once', 'se declaran una vez') },
    items: [
      { k: 'kicker', text: L('Step 8 · your own types', 'Paso 8 · tus propios tipos de datos') },
      { k: 'slot', items: [
        { k: 'row', at: 'loose', out: 'box', items: [
          { k: 'box', cls: 's-mono', text: 'x', at: 'loose' },
          { k: 'box', cls: 's-mono', text: 'y', at: 'loose+0.3' },
          { k: 'box', cls: 's-mono', text: 'r', at: 'loose+0.6' },
        ] },
        { k: 'code', at: 'box', out: 'declared', type: 'box+0.3', cps: 60, code: STRUCT, cls: 'wide', hl: [{ at: 'newType', lines: [0, 1, 2, 3] }] },
        { k: 'code', at: 'declared', type: 'declared+0.2', cps: 55, code: FINAL },
      ] },
    ],
  },
  /* what a GPU does not allow in functions */
  {
    id: 'cannot',
    beats: { recursion: L('cannot call itself', 'no puede llamarse a sí misma'), loop: L('use a loop', 'usa un bucle'), ref: L('cannot be marked', 'no pueden llevar'), stat: L('must be static', 'deben ser static') },
    items: [
      { k: 'kicker', text: L('What cannot be done', 'Qué no se puede hacer') },
      { k: 'row', at: 'recursion', items: [
        { k: 'box', cls: 's-bad s-mono', text: L('recursion', 'recursión'), sub: 'F() → F()', at: 'recursion', mark: { at: 'recursion+1', kind: 'x' } },
        { k: 'box', cls: 'accent s-mono', text: 'for', sub: L('use a loop', 'usa un bucle'), at: 'loop', mark: { at: 'loop+0.6', kind: 'check' } },
      ] },
      { k: 'row', at: 'ref', items: [
        { k: 'box', cls: 's-bad s-mono', text: 'ref · out · in', sub: L('not in parameters', 'no en parámetros'), at: 'ref', mark: { at: 'ref+1', kind: 'x' } },
        { k: 'box', cls: 'accent s-mono', text: 'struct', sub: L('return it instead', 'devuélvelo'), at: 'ref+1.4' },
      ] },
      { k: 'word', cls: 's-mono s-accent', at: 'stat', text: 'static', fx: 'pop' },
    ],
  },
  {
    id: 'learned',
    dense: true,
    beats: { a: L('copy and paste a block', 'copias y pegas un bloque'), b: L('A function has three parts', 'Una función tiene tres partes'), c: L('helper functions', 'funciones de ayuda'), d: L('Order matters', 'El orden importa'), e: L('A struct groups data', 'Un struct agrupa datos') },
    items: [
      { k: 'kicker', text: L('What you learned', 'Lo que aprendiste') },
      ...[['a', 'copy + paste → a function', 'copiar + pegar → una función'], ['b', 'return · name · parameters (copies)', 'devuelve · nombre · parámetros (copias)'], ['c', 'public static inside the class', 'public static dentro de la clase'], ['d', 'order matters: last on top', 'el orden importa: lo último encima'], ['e', 'struct = a named box', 'struct = una caja con nombre']]
        .map(([b, en, es]) => ({ k: 'word', cls: 's-mono', at: b, fx: 'left', text: L(en, es), mark: { at: `${b}+0.4`, kind: 'check' } })),
    ],
  },
];

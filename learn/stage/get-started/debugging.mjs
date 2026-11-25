// Stage of "When something goes wrong" — motion graphics shown next to the text while the chapter is read aloud.
// Each scene starts at its `> [!SCENE] id` cue in content/<lang>/get-started/debugging.md. A shader cannot print, so everything
// here is about painting: a solid colour, a number as grey, a return halfway, and then the questions everyone asks.

const L = (en, es) => ({ en, es });
const cs = (title, code) => ({ title, code, lang: 'csharp' });
const ENGINE_LOGO = { route: { kni: '/img/engines/kni.png', fna: '/img/engines/fna.png', godot: '/img/engines/godot.svg', raylib: '/img/engines/raylib.png', silknet: '/img/engines/silknet.svg', default: '/img/engines/monogame.png' } };
const win = (modes, at, extra = {}) => ({ k: 'gl', cls: 'window w40', title: '{{engine}}', logo: ENGINE_LOGO, at, fx: 'pop', radius: 10, tiles: [{ modes, aspect: '16 / 10', at }], ...extra });
const tiles = (arr, at, extra = {}) => ({ k: 'gl', cls: 'w86', gap: 2, radius: 10, at, fx: 'fade', tiles: arr, ...extra });
const stagger = (arr, at, step = 0.5) => arr.map((a, i) => ({ ...a, at: `${at}+${(i * step).toFixed(1)}` }));

const SOLID = L(cs('Fragment', 'return new vec4(1f, 0f, 0f, 1f);'), cs('Fragment', 'return new vec4(1f, 0f, 0f, 1f);'));
const PAINT = L(cs('Fragment', `float dx = pixel.Uv.X - 0.5f;
float dy = pixel.Uv.Y - 0.5f;
float light = 1f - (dx * dx + dy * dy) * 40f;

// return new vec4(light, light, light, 1f);
return new vec4(dx, dx, dx, 1f);`), cs('Fragment', `float dx = pixel.Uv.X - 0.5f;
float dy = pixel.Uv.Y - 0.5f;
float luz = 1f - (dx * dx + dy * dy) * 40f;

// return new vec4(luz, luz, luz, 1f);
return new vec4(dx, dx, dx, 1f);`));
const SPLIT = L(cs('Fragment', `float a = pixel.Uv.X * 2f - 1f;
float b = a * a;

return new vec4(b, b, b, 1f); // try here: does b look right?

float c = 1f - b;
return new vec4(c, c, c, 1f);`), cs('Fragment', `float a = pixel.Uv.X * 2f - 1f;
float b = a * a;

return new vec4(b, b, b, 1f); // prueba aquí: ¿se ve bien b?

float c = 1f - b;
return new vec4(c, c, c, 1f);`));
const ADD1 = L(cs('Fragment', 'vec3 sum = new vec3(a.X + b.X, a.Y + b.Y, a.Z + b.Z);'), cs('Fragment', 'vec3 suma = new vec3(a.X + b.X, a.Y + b.Y, a.Z + b.Z);'));
const ADD2 = L(cs('MyShaders/Gradient.cs', `public static vec3 Add(vec3 a, vec3 b)
{
    return new vec3(a.X + b.X, a.Y + b.Y, a.Z + b.Z);
}

public static vec3 Scale(vec3 a, float k)
{
    return new vec3(a.X * k, a.Y * k, a.Z * k);
}`), cs('MisShaders/Degradado.cs', `public static vec3 Sumar(vec3 a, vec3 b)
{
    return new vec3(a.X + b.X, a.Y + b.Y, a.Z + b.Z);
}

public static vec3 Escalar(vec3 a, float k)
{
    return new vec3(a.X * k, a.Y * k, a.Z * k);
}`));
const ADD3 = L(cs('Fragment', `vec3 red = new vec3(1f, 0f, 0f);
vec3 green = new vec3(0f, 1f, 0f);
vec3 blend = Add(Scale(red, pixel.Uv.X), Scale(green, pixel.Uv.Y));
return new vec4(blend.X, blend.Y, blend.Z, 1f);`), cs('Fragment', `vec3 rojo = new vec3(1f, 0f, 0f);
vec3 verde = new vec3(0f, 1f, 0f);
vec3 mezcla = Sumar(Escalar(rojo, pixel.Uv.X), Escalar(verde, pixel.Uv.Y));
return new vec4(mezcla.X, mezcla.Y, mezcla.Z, 1f);`));
const RATIO = L(cs('Fragment', `float ratio = 0f;
if (width > 0f)
{
    ratio = height / width;
}`), cs('Fragment', `float razon = 0f;
if (ancho > 0f)
{
    razon = alto / ancho;
}`));

const SH = {
  black: 'return vec4(0.,0.,0.,1.);',
  red: 'return vec4(1.,0.,0.,1.);',
  dx: 'return vec4(vec3(clamp(uv.x-.5,0.,1.)),1.);',
  dy: 'return vec4(vec3(clamp(uv.y-.5,0.,1.)),1.);',
  sum: 'vec2 d=uv-.5;return vec4(vec3(clamp(dot(d,d)*4.,0.,1.)),1.);',
  light: 'vec2 d=uv-.5;return vec4(vec3(clamp(1.-dot(d,d)*8.,0.,1.)),1.);',
  b: 'float a=uv.x*2.-1.;float b=a*a;return vec4(vec3(b),1.);',
  c: 'float a=uv.x*2.-1.;float b=a*a;return vec4(vec3(1.-b),1.);',
  blend: 'return vec4(uv.x,1.-uv.y,0.,1.);',
};

export default [
  /* sooner or later: a black screen; the method */
  {
    id: 'intro',
    beats: { black: L('a black screen', 'una pantalla negra'), all: L('It happens to everyone', 'Le pasa a todo el mundo'), years: L('for years', 'llevan años'), method: L('have a method', 'tienen un método'), learn: L('you learn it', 'lo aprendes') },
    items: [
      { k: 'kicker', text: L('When something goes wrong', 'Cuando algo sale mal') },
      win([{ frag: SH.black }], 'black', { cls: 'window w40' }),
      { k: 'text', at: 'all', text: L('It happens to <b>everyone</b>', 'Le pasa a <b>todo el mundo</b>') },
      { k: 'row', at: 'method', items: [
        { k: 'box', cls: 's-mono', text: L('no method', 'sin método'), sub: L('you guess', 'adivinas'), at: 'years' },
        { k: 'box', cls: 'accent s-mono', text: L('a method', 'un método'), sub: L('you find it', 'lo encuentras'), at: 'method' },
      ] },
    ],
  },
  /* no console: all you have is colour */
  {
    id: 'console',
    beats: { console: L('write to the console', 'escribir en la consola'), none: L('There is no', 'No existe'), gpu: L('runs on the GPU', 'corre en la GPU'), print: L('nowhere to print', 'dónde imprimir'), color: L('What you do have is color', 'Lo que sí tienes es el color'), paint: L('paint what you want to see', 'pintar lo que quieres ver') },
    items: [
      { k: 'kicker', text: L('No console', 'Sin consola') },
      { k: 'row', at: 'console', out: 'color', items: [
        { k: 'box', cls: 's-bad s-mono', text: 'Console.WriteLine', sub: L('does not exist in a shader', 'no existe en un shader'), at: 'none', mark: { at: 'none+0.8', kind: 'x' } },
        { k: 'box', cls: 'gpu s-mono', text: 'GPU', sub: L('thousands at once', 'miles a la vez'), at: 'gpu' },
        { k: 'box', cls: 's-mono', text: '¿?', sub: L('nowhere to print', 'sin dónde imprimir'), at: 'print' },
      ] },
      { k: 'row', at: 'color', items: [
        { k: 'box', cls: 'accent s-mono', text: L('color', 'color'), sub: L('your only way to look inside', 'tu única forma de mirar dentro'), at: 'color' },
        { k: 'arrow', at: 'paint-0.5' },
        { k: 'box', cls: 's-mono', text: L('paint what you want to see', 'pinta lo que quieres ver'), at: 'paint' },
      ] },
    ],
  },
  /* the four questions, in order */
  {
    id: 'method',
    beats: { order: L('in this order', 'en este orden'), q1: L('Does it compile', 'Compila'), q2: L('Is my shader running', 'Se ejecuta mi shader'), q3: L('Is the data arriving correctly', 'Llegan bien los datos'), q4: L('Is my math right', 'Está bien mi cuenta') },
    items: [
      { k: 'kicker', text: L('The method', 'El método') },
      { k: 'row', at: 'order', items: [
        { k: 'box', cls: 's-mono', text: '1', sub: L('Does it compile?', '¿Compila?'), at: 'q1' },
        { k: 'box', cls: 's-mono', text: '2', sub: L('Is my shader running?', '¿Se ejecuta mi shader?'), at: 'q2' },
        { k: 'box', cls: 's-mono', text: '3', sub: L('Is the data arriving?', '¿Llegan los datos?'), at: 'q3' },
        { k: 'box', cls: 'accent s-mono', text: '4', sub: L('Is my math right?', '¿Está bien mi cuenta?'), at: 'q4' },
      ] },
    ],
  },
  /* technique 1: a solid colour as the first line */
  {
    id: 't1',
    beats: { first: L('first line', 'primera línea'), red: L('comes out red', 'sale roja'), runs: L('your shader runs', 'tu shader se ejecuta'), math: L('The problem is in your math', 'El problema está en tu cuenta'), not: L('does not come out red', 'no sale roja'), deeper: L('the problem is deeper', 'el problema es más profundo'), where: L('where it is not', 'dónde no está') },
    items: [
      { k: 'kicker', text: L('Technique 1 · a solid color', 'Técnica 1 · un color sólido') },
      { k: 'code', at: 'first', type: 'first+0.3', cps: 35, code: SOLID, hl: [{ at: 'first', lines: [0] }] },
      win([{ frag: SH.black }, { at: 'red', frag: SH.red }], 'red-1', { cls: 'window w40' }),
      { k: 'row', at: 'runs', items: [
        { k: 'box', cls: 'accent s-mono', text: L('red', 'roja'), sub: L('your math is the problem', 'el problema es tu cuenta'), at: 'math' },
        { k: 'box', cls: 's-bad s-mono', text: L('not red', 'no roja'), sub: L('deeper', 'más profundo'), at: 'not' },
      ] },
      { k: 'text', at: 'where', text: L('First: where it is <b>not</b>', 'Primero: dónde <b>no</b> está') },
    ],
  },
  /* technique 2: paint the number */
  {
    id: 't2',
    beats: { imagine: L('Imagine your shader', 'Imagina que tu shader'), paint: L('paint the number', 'Pintemos el número'), commented: L('commented out', 'quedó comentada'), left: L('black on the left', 'negro a la izquierda'), dy: L('paint dy', 'pinta dy'), more: L('and so on', 'y así vas avanzando'), two: L('Two things to remember', 'Dos cosas para recordar'), tip: L('scale them', 'escálalos'), visible: L('the visible range', 'rango visible') },
    items: [
      { k: 'kicker', text: L('Technique 2 · paint the number', 'Técnica 2 · pintar el número') },
      tiles([{ modes: [{ at: 'imagine', frag: SH.black }, { at: 'left', frag: SH.dx }, { at: 'dy', frag: SH.dy }, { at: 'dy+4', frag: SH.sum }, { at: 'more+3', frag: SH.light }], aspect: '16 / 9', at: 'imagine', cap: L('<b>what you paint</b> · step by step', '<b>lo que pintas</b> · paso a paso') }], 'imagine', { cols: 1, cls: 'w50' }),
      { k: 'code', at: 'paint', out: 'two', type: 'paint+0.3', cps: 45, code: PAINT, hl: [{ at: 'commented', lines: [4, 5] }] },
      { k: 'row', at: 'two', items: [
        { k: 'box', cls: 's-mono', text: 'x / 10f', sub: L('0 … 10 → 0 … 1', '0 … 10 → 0 … 1'), at: 'tip' },
        { k: 'box', cls: 'accent s-mono', text: 'x * 0.5f + 0.5f', sub: L('−1 … 1 → 0 … 1', '−1 … 1 → 0 … 1'), at: 'visible-1' },
      ] },
      { k: 'row', at: 'two+0.5', items: [
        { k: 'box', cls: 's-mono', text: L('all black', 'todo negro'), sub: L('0 or negative', '0 o negativo'), at: 'two+0.5' },
        { k: 'box', cls: 's-mono', text: L('all white', 'todo blanco'), sub: L('1 or more', '1 o más'), at: 'two+1.2' },
        { k: 'box', cls: 'accent s-mono', text: L('stripes', 'franjas'), sub: L('right track', 'buen camino'), at: 'two+1.9' },
      ] },
    ],
  },
  /* technique 3: a solid return halfway */
  {
    id: 't3',
    beats: { many: L('has many lines', 'tiene muchas líneas'), half: L('halfway through', 'a la mitad'), good: L('If b looks right', 'Si b se ve bien'), bad: L('If it looks wrong', 'Si se ve mal'), dict: L('looking up a word in a dictionary', 'buscar una palabra en un diccionario'), warn: L('unreachable code', 'código inalcanzable'), want: L('exactly what we want', 'justo lo que queremos') },
    items: [
      { k: 'kicker', text: L('Technique 3 · split and cut', 'Técnica 3 · parte y corta') },
      { k: 'code', at: 'half', out: 'dict+2', type: 'half+0.3', cps: 45, code: SPLIT, hl: [{ at: 'half', lines: [3] }, { at: 'good', until: 'bad', lines: [3] }, { at: 'bad', lines: [0, 1] }] },
      tiles([
        { frag: SH.b, aspect: '4 / 3', at: 'good', cap: L('<b>b</b> · looks right?', '<b>b</b> · ¿se ve bien?') },
        { frag: SH.c, aspect: '4 / 3', at: 'bad+1', cap: L('<b>c</b> · after', '<b>c</b> · después') },
      ], 'good', { cols: 2 }),
      { k: 'text', at: 'dict', text: L('Like a <b>dictionary</b>: up or down', 'Como un <b>diccionario</b>: arriba o abajo') },
      { k: 'text', at: 'warn', text: L('<b>Unreachable code</b> · expected', '<b>Código inalcanzable</b> · esperado') },
    ],
  },
  /* the symptoms table */
  {
    id: 'symptoms',
    beats: { table: L('most common problems', 'problemas más comunes'), most: L('you will consult most', 'más vas a consultar'), godot: { route: { godot: L('In Godot there are a few more cases', 'En Godot hay algunos casos más'), default: L('you will consult most', 'más vas a consultar') } } },
    items: [
      { k: 'kicker', text: L('Symptoms and causes', 'Síntomas y causas') },
      { k: 'row', at: 'table', items: stagger([
        { k: 'box', cls: 's-mono', text: L('all black', 'todo negro'), sub: L('run the full cycle', 'ejecuta el ciclo completo') },
        { k: 'box', cls: 's-mono', text: L('old version', 'versión vieja'), sub: L('translate again', 'traduce otra vez') },
        { k: 'box', cls: 's-mono', text: L('all white', 'todo blanco'), sub: L('value over 1', 'valor sobre 1') },
        { k: 'box', cls: 's-mono', text: L('oval', 'óvalo'), sub: L('use the aspect', 'usa el aspecto') },
        { k: 'box', cls: 's-mono', text: L('upside down', 'al revés'), sub: '1f - Uv.Y' },
        { k: 'box', cls: 'accent s-mono', text: L('always 0 or 1', 'siempre 0 o 1'), sub: L('integer division', 'división de enteros') },
      ], 'table', 0.8) },
      { k: 'text', at: 'godot', text: { route: { godot: L('Godot adds a few more', 'Godot añade algunos más'), default: '' } } },
    ],
  },
  /* compile errors */
  {
    id: 'errors',
    beats: { first: L('compiles your project first', 'compila tu proyecto primero'), common: L('the ones that show up most', 'los que más aparecen') },
    items: [
      { k: 'kicker', text: L('Common compilation errors', 'Errores de compilación frecuentes') },
      { k: 'row', at: 'first', items: stagger([
        { k: 'box', cls: 's-bad s-mono', text: 'CS0664', sub: L('0.5 → 0.5f', '0.5 → 0.5f') },
        { k: 'box', cls: 's-bad s-mono', text: 'CS0019', sub: L('no operators on vectors', 'sin operadores en vectores') },
        { k: 'box', cls: 's-bad s-mono', text: 'CS0165', sub: L('fill every field', 'rellena cada campo') },
        { k: 'box', cls: 's-bad s-mono', text: 'CS1503', sub: L('wrong number of values in new vec4', 'valores de más o de menos en new vec4') },
        { k: 'box', cls: 's-bad s-mono', text: 'CS0234', sub: L('delete YotsubaShader.g.cs', 'borra YotsubaShader.g.cs') },
      ], 'common', 0.8) },
    ],
  },
  { id: 'faq', beats: { f: L('Questions everyone asks', 'Preguntas que todo el mundo se hace') }, items: [{ k: 'kicker', text: 'FAQ' }, { k: 'big', cls: 's-mono s-accent', at: 'f', text: '?', fx: 'pop' }] },
  /* can't add vectors with + */
  {
    id: 'q_plus',
    beats: { glsl: L('In GLSL or HLSL you can', 'En GLSL o HLSL sí puedes'), struct: L('is a C# struct', 'es un struct de C#'), options: L('you have two options', 'tienes dos opciones'), field: L('field by field', 'campo por campo'), often: L('if you do it often', 'si lo haces seguido'), blend: L('mixing two lights', 'mezclar dos luces') },
    items: [
      { k: 'kicker', text: L('Why not a + b?', '¿Por qué no a + b?') },
      { k: 'row', at: 'glsl', out: 'options', items: [
        { k: 'box', cls: 's-mono', text: 'vec3 a + b', sub: 'GLSL · HLSL', at: 'glsl', mark: { at: 'glsl+1', kind: 'check' } },
        { k: 'box', cls: 's-bad s-mono', text: 'vec3 a + b', sub: L('a C# struct', 'un struct de C#'), at: 'struct', mark: { at: 'struct+1', kind: 'x' } },
      ] },
      { k: 'code', at: 'field', out: 'often', type: 'field+0.3', cps: 50, code: ADD1 },
      { k: 'code', at: 'often', out: 'blend', type: 'often+0.3', cps: 55, code: ADD2 },
      { k: 'code', at: 'blend', type: 'blend+0.3', cps: 50, code: ADD3 },
      win([{ frag: SH.blend }], 'blend+3', { cls: 'window w40' }),
    ],
  },
  /* the f on numbers */
  {
    id: 'q_f',
    beats: { dbl: L('is a double', 'es un double'), mem: L('takes more memory', 'ocupa más memoria'), gpu: L('work with float', 'trabajan con float'), f: L('The f tells C#', 'La f le dice a C#'), without: L('Without it, it does not compile', 'Sin ella no compila') },
    items: [
      { k: 'kicker', text: L('The f on numbers', 'La f en los números') },
      { k: 'row', at: 'dbl', out: 'f', items: [
        { k: 'box', cls: 's-bad s-mono', text: '0.5', sub: 'double · 8 bytes', at: 'dbl' },
        { k: 'box', cls: 'gpu s-mono', text: 'GPU', sub: 'float · 4 bytes', at: 'gpu' },
      ] },
      { k: 'row', at: 'f', items: [
        { k: 'box', cls: 'accent s-mono', text: '0.5f', sub: L('this one is a float', 'este es un float'), at: 'f', mark: { at: 'f+1', kind: 'check' } },
        { k: 'box', cls: 's-bad s-mono', text: '0.5', sub: L('does not compile', 'no compila'), at: 'without', mark: { at: 'without+0.8', kind: 'x' } },
      ] },
    ],
  },
  /* vertex data vs uniform vs spread-out data */
  {
    id: 'q_kinds',
    beats: { forums: L('most repeated question', 'más repetida'), three: L('data that enters the shader', 'datos que entran al shader'), rule: L('The rule for deciding', 'La regla para decidir'), vertex: L('from one vertex to another', 'de un vértice a otro'), uniform: L('It is a uniform', 'Es un uniform'), spread: L('smoothly spread out', 'suavemente repartido'), door: L('through a door', 'por una puerta') },
    items: [
      { k: 'kicker', text: L('Three kinds of data', 'Tres tipos de datos') },
      { k: 'row', at: 'three', items: [
        { k: 'box', cls: 's-mono', text: L('Vertex data', 'Datos del vértice'), sub: L('one per vertex', 'uno por vértice'), at: 'vertex' },
        { k: 'box', cls: 'accent s-mono', text: 'Uniform', sub: L('one for the whole draw', 'uno para todo el dibujo'), at: 'uniform' },
        { k: 'box', cls: 's-mono', text: L('Spread out', 'Repartido'), sub: L('one per pixel · Uv', 'uno por píxel · Uv'), at: 'spread' },
      ] },
      { k: 'text', at: 'door', text: L('Vertex → <b>door</b> → Fragment', 'Vertex → <b>puerta</b> → Fragment') },
    ],
  },
  /* a neighbouring pixel: no; two passes */
  {
    id: 'q_neigh',
    beats: { sep: L('computed separately', 'se calcula por separado'), same: L('at the same time as the others', 'a la vez que los demás'), blur: L('a blur', 'un desenfoque'), two: L('two passes', 'dos pasadas'), read: L('reads it as a texture', 'la lee como textura'), adv: L('an advanced topic', 'tema avanzado') },
    items: [
      { k: 'kicker', text: L('A neighbouring pixel?', '¿Un píxel vecino?') },
      { k: 'row', at: 'sep', out: 'blur', items: [
        { k: 'box', cls: 's-mono', text: L('pixel', 'píxel'), at: 'sep' },
        { k: 'box', cls: 's-bad s-mono', text: '?', sub: L('there is no "first"', 'no hay un "primero"'), at: 'same', mark: { at: 'same+1', kind: 'x' } },
        { k: 'box', cls: 's-mono', text: L('pixel', 'píxel'), at: 'sep+0.3' },
      ] },
      { k: 'row', at: 'two', items: [
        { k: 'box', cls: 's-mono', text: L('pass 1', 'pasada 1'), sub: L('draws an image', 'dibuja una imagen'), at: 'two' },
        { k: 'arrow', at: 'read-0.5' },
        { k: 'box', cls: 'accent s-mono', text: L('pass 2', 'pasada 2'), sub: L('reads it as a texture', 'la lee como textura'), at: 'read' },
      ] },
      { k: 'text', at: 'adv', text: L('Advanced · <b>not needed yet</b>', 'Avanzado · <b>aún no lo necesitas</b>') },
    ],
  },
  /* divide by zero */
  {
    id: 'q_zero',
    beats: { cs: L('In normal C#', 'En C# normal'), nan: L('not a number', 'no es un número'), gpu: L('On the GPU there is no telling', 'En la GPU no se sabe'), black: L('a black pixel or a flicker', 'píxel negro o un parpadeo'), protect: L('protect it', 'protégelo') },
    items: [
      { k: 'kicker', text: L('Dividing by zero', 'Dividir entre cero') },
      { k: 'row', at: 'cs', out: 'protect', items: [
        { k: 'box', cls: 's-mono', text: 'C#', sub: 'x / 0 → ∞ · NaN', at: 'cs' },
        { k: 'box', cls: 's-bad s-mono', text: 'GPU', sub: L('who knows · black or flicker', 'quién sabe · negro o parpadeo'), at: 'gpu' },
      ] },
      { k: 'code', at: 'protect', type: 'protect+0.3', cps: 35, code: RATIO, hl: [{ at: 'protect', lines: [1] }] },
    ],
  },
  /* is my shader slow */
  {
    id: 'q_slow',
    beats: { works: L('First make sure it works', 'Primero asegúrate de que funciona'), measured: L('measured, not guessed', 'se mide, no se adivina'), loops: L('loops with many laps', 'bucles con muchas vueltas'), ifs: L('very complex', 'muy complejos'), reduce: L('reducing the laps', 'reduciendo las vueltas') },
    items: [
      { k: 'kicker', text: L('Is it slow?', '¿Es lento?') },
      { k: 'row', at: 'works', out: 'loops', items: [
        { k: 'box', cls: 's-mono', text: '1', sub: L('make it work', 'que funcione'), at: 'works' },
        { k: 'box', cls: 'accent s-mono', text: '2', sub: L('measure', 'mide'), at: 'measured' },
      ] },
      { k: 'row', at: 'loops', items: [
        { k: 'box', cls: 's-mono', text: L('loops with many laps', 'bucles con muchas vueltas'), at: 'loops' },
        { k: 'box', cls: 's-mono', text: L('complex ifs', 'ifs complejos'), at: 'ifs' },
        { k: 'box', cls: 'accent s-mono', text: L('fewer laps', 'menos vueltas'), sub: L('check if it improves', 'comprueba si mejora'), at: 'reduce' },
      ] },
    ],
  },
  /* a real tool: RenderDoc */
  {
    id: 'q_tool',
    beats: { tool: L('graphics debuggers', 'depuradores gráficos'), doc: L('RenderDoc', 'RenderDoc'), freeze: L('freeze a frame', 'congelar un fotograma'), data: L('the problem is in the data', 'problema es de datos'), yet: L('do not need them yet', 'no los necesitas todavía') },
    items: [
      { k: 'kicker', text: L('A real tool', 'Una herramienta de verdad') },
      { k: 'row', at: 'tool', out: 'yet', items: [
        { k: 'box', cls: 'accent s-mono', text: 'RenderDoc', at: 'doc' },
        { k: 'arrow', at: 'freeze-0.4' },
        { k: 'box', cls: 's-mono', text: L('one frozen frame', 'un fotograma congelado'), sub: L('what the GPU received and drew', 'lo que recibió y dibujó la GPU'), at: 'freeze' },
      ] },
      { k: 'text', at: 'data', text: L('For <b>data</b> problems, not math', 'Para problemas de <b>datos</b>, no de cuentas') },
      { k: 'text', at: 'yet', text: L('Not needed in this tutorial · yet', 'No hace falta en este tutorial · todavía') },
    ],
  },
  {
    id: 'learned',
    dense: true,
    beats: { a: L('you cannot print', 'no se puede imprimir'), b: L('A solid color at the start', 'Un color sólido al inicio'), c: L('Split and cut', 'Parte y corta'), d: L('To see values outside', 'Para ver valores fuera'), e: L('Most compilation errors', 'La mayoría de los errores de compilación') },
    items: [
      { k: 'kicker', text: L('What you learned', 'Lo que aprendiste') },
      ...[['a', 'you cannot print · you paint the value', 'no se imprime · se pinta el valor'], ['b', 'a solid color first: is it your math?', 'un color sólido primero: ¿es tu cuenta?'], ['c', 'split and cut: a return halfway', 'parte y corta: un return a la mitad'], ['d', 'outside 0–1? scale it', '¿fuera de 0–1? escálalo'], ['e', 'known errors · quick fixes', 'errores conocidos · soluciones rápidas']]
        .map(([b, en, es]) => ({ k: 'word', cls: 's-mono', at: b, fx: 'left', text: L(en, es), mark: { at: `${b}+0.4`, kind: 'check' } })),
    ],
  },
];

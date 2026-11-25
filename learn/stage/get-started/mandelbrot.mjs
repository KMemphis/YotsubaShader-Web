// Stage of "Shader 2: a fractal" — motion graphics shown next to the text while the chapter is read aloud.
// Each scene starts at its `> [!SCENE] id` cue in content/<lang>/get-started/mandelbrot.md. Every image is the live fractal or one
// of its parts: the orbit of a point that stays or escapes, the lap counter as grey, the palette curves, the stretched view and the fix.

const L = (en, es) => ({ en, es });
const cs = (title, code) => ({ title, code, lang: 'csharp' });
const ENGINE_LOGO = { route: { kni: '/img/engines/kni.png', fna: '/img/engines/fna.png', godot: '/img/engines/godot.svg', raylib: '/img/engines/raylib.png', silknet: '/img/engines/silknet.svg', default: '/img/engines/monogame.png' } };
const win = (tiles, at, extra = {}) => ({ k: 'gl', cls: 'window w50', title: '{{engine}}', logo: ENGINE_LOGO, at, fx: 'pop', radius: 10, tiles, ...extra });
const tiles = (arr, at, extra = {}) => ({ k: 'gl', cls: 'w86', gap: 2, radius: 10, at, fx: 'fade', tiles: arr, ...extra });
const BG = 'vec3(.1,.1,.14)';

const STEPS = L(cs('MyShaders/Mandelbrot.cs', `public static int CountSteps(float cx, float cy)
{
    float x = 0f;
    float y = 0f;
    int steps = 0;

    while (steps < 100)
    {
        float newX = x * x - y * y + cx;
        float newY = 2f * x * y + cy;
        x = newX;
        y = newY;

        if (x * x + y * y > 4f)
        {
            break;
        }

        steps++;
    }

    return steps;
}`), cs('MisShaders/Mandelbrot.cs', `public static int ContarPasos(float cx, float cy)
{
    float x = 0f;
    float y = 0f;
    int pasos = 0;

    while (pasos < 100)
    {
        float nuevaX = x * x - y * y + cx;
        float nuevaY = 2f * x * y + cy;
        x = nuevaX;
        y = nuevaY;

        if (x * x + y * y > 4f)
        {
            break;
        }

        pasos++;
    }

    return pasos;
}`));
const FORMULA = L(cs('Fragment', `x = x * x - y * y + cx;
y = 2f * x * y + cy;`), cs('Fragment', `x = x * x - y * y + cx;
y = 2f * x * y + cy;`));
const CXY = L(cs('Fragment', `float cx = pixel.Uv.X * 3f - 2.2f;
float cy = pixel.Uv.Y * 3f - 1.5f;`), cs('Fragment', `float cx = pixel.Uv.X * 3f - 2.2f;
float cy = pixel.Uv.Y * 3f - 1.5f;`));
const COLOR = L(cs('Fragment', `int steps = CountSteps(cx, cy);

if (steps == 100)
{
    return new vec4(0f, 0f, 0f, 1f);
}

float t = steps / 100f;
return Palette(t);`), cs('Fragment', `int pasos = ContarPasos(cx, cy);

if (pasos == 100)
{
    return new vec4(0f, 0f, 0f, 1f);
}

float t = pasos / 100f;
return Paleta(t);`));
const PALETTE = L(cs('MyShaders/Mandelbrot.cs', `public static vec4 Palette(float t)
{
    float rest = 1f - t;
    float red = 9f * rest * t * t * t;
    float green = 15f * rest * rest * t * t;
    float blue = 8.5f * rest * rest * rest * t;
    return new vec4(red, green, blue, 1f);
}`), cs('MisShaders/Mandelbrot.cs', `public static vec4 Paleta(float t)
{
    float resto = 1f - t;
    float rojo = 9f * resto * t * t * t;
    float verde = 15f * resto * resto * t * t;
    float azul = 8.5f * resto * resto * resto * t;
    return new vec4(rojo, verde, azul, 1f);
}`));
const ZOOM = L(cs('Fragment', `float cx = pixel.Uv.X * 0.05f - 0.76f;
float cy = pixel.Uv.Y * 0.05f + 0.06f;`), cs('Fragment', `float cx = pixel.Uv.X * 0.05f - 0.76f;
float cy = pixel.Uv.Y * 0.05f + 0.06f;`));
const ASPECT = L(cs('Fragment', `float aspect = Data.Width / Data.Height;
float cx = (pixel.Uv.X - 0.5f) * 3f * aspect - 0.7f;
float cy = (pixel.Uv.Y - 0.5f) * 3f;`), cs('Fragment', `float aspecto = Datos.Ancho / Datos.Alto;
float cx = (pixel.Uv.X - 0.5f) * 3f * aspecto - 0.7f;
float cy = (pixel.Uv.Y - 0.5f) * 3f;`));

// the fractal. cx,cy are GLSL expressions; N = max laps; out = what to return from the laps count n (float k = n/N)
const MB = ({ cx = 'uv.x*3.-2.2', cy = '(uv.y)*3.-1.5', N = 100, out = 'color' } = {}) => {
  const head = `float cx=${cx},cy=${cy};float x=0.,y=0.;int n=0;for(int i=0;i<${N};i++){float nx=x*x-y*y+cx;float ny=2.*x*y+cy;x=nx;y=ny;if(x*x+y*y>4.)break;n++;}float k=float(n)/${N}.;float r=1.-k;`;
  const pal = 'vec3(9.*r*k*k*k,15.*r*r*k*k,8.5*r*r*r*k)';
  const body = {
    color: `if(n==${N})return vec4(0.,0.,0.,1.);return vec4(${pal},1.);`,
    gray: `return vec4(vec3(k),1.);`,
    inside: `return vec4(n==${N}?vec3(1.):${BG}*.6,1.);`,
    fast: `return vec4(n<4?vec3(.38,.6,1.):${BG}*.6,1.);`,
    edge: `return vec4((n>=4&&n<${N})?vec3(1.,.82,.4):${BG}*.6,1.);`,
    dim: `return vec4(${pal}*.45+${BG}*.3,1.);`,
  }[out];
  return head + body;
};
const ASP = 'uRes.x/uRes.y';
const stretched = (out = 'color') => MB({ out });
const fixed = (out = 'color') => `float asp=${ASP};` + MB({ cx: '(uv.x-.5)*3.*asp-.7', cy: '(uv.y-.5)*3.', out });
// the orbit of the point c: z walks 0, c, c²+c … ; the dots appear one by one (looping)
const ORBIT = (cx, cy) => `float x=uv.x*3.-2.2,y=uv.y*3.-1.5;vec3 c=${BG};c=mix(c,vec3(.3,.3,.4),step(abs(x),.012)+step(abs(y),.012));float zx=0.,zy=0.;int vis=int(mod(t*5.,26.));for(int i=0;i<24;i++){if(i>=vis)break;float nx=zx*zx-zy*zy+${cx};float ny=2.*zx*zy+${cy};zx=nx;zy=ny;float d=length(vec2(x-zx,y-zy));c=mix(c,vec3(1.,.48,.7),smoothstep(.07,.04,d)*(float(i)<float(vis)-.5?1.:0.));if(zx*zx+zy*zy>9.)break;}float dc=length(vec2(x-(${cx}),y-(${cy})));c=mix(c,vec3(.38,.94,.82),smoothstep(.06,.04,dc));return vec4(c,1.);`;
// the palette curves r, g, b as a function of t (x axis 0..1)
const CURVES = `float x=uv.x,y=uv.y;float r=1.-x;float cr=9.*r*x*x*x,cg=15.*r*r*x*x,cb=8.5*r*r*r*x;vec3 c=${BG};c=mix(c,vec3(.3,.3,.4),step(y,.01));c=mix(c,vec3(1.,.35,.4),smoothstep(.03,.012,abs(y-cr*.9-.04)));c=mix(c,vec3(.4,.9,.5),smoothstep(.03,.012,abs(y-cg*.9-.04)));c=mix(c,vec3(.4,.6,1.),smoothstep(.03,.012,abs(y-cb*.9-.04)));return vec4(c,1.);`;
// a gradient of the palette from 0 to 1
const STRIP = `float k=uv.x;float r=1.-k;return vec4(vec3(9.*r*k*k*k,15.*r*r*k*k,8.5*r*r*r*k),1.);`;
// remap strip: x from 0..1 to cx -2.2..0.8
const MAPSTRIP = `float x=uv.x;float cxv=x*3.-2.2;vec3 c=${BG};c=mix(c,vec3(.38,.94,.82),step(abs(x-.0),.01)+step(abs(x-1.),.01));float tick=smoothstep(.012,.005,abs(fract(cxv)-0.));c=mix(c,vec3(.45,.45,.6),tick*step(.4,uv.y));c=mix(c,vec3(1.,.48,.7),smoothstep(.02,.008,abs(x-(.5+.5*sin(t*1.3))))*step(uv.y,.7));return vec4(c,1.);`;
// the zooms: the filament and the seahorse valley, drawn at higher laps
const Z1 = MB({ cx: 'uv.x*.05-.76', cy: 'uv.y*.05+.06', N: 200 });

export default [
  /* what we will draw: no image stored; a two-line formula repeated */
  {
    id: 'intro',
    beats: { turns: L('up to 100 turns', 'hasta 100 vueltas'), draw: L('you will draw this', 'vas a dibujar esto'), named: L('Mandelbrot fractal', 'fractal de Mandelbrot'), stored: L('there is no image stored', 'no hay ninguna imagen guardada'), formula: L('formula, repeated many times', 'fórmula de dos líneas, repetida muchas veces'), nothing: L('no new C# in this chapter', 'nada nuevo de C# en este capítulo') },
    items: [
      { k: 'kicker', text: L('Shader 2 · a fractal', 'Shader 2 · un fractal') },
      { k: 'row', at: 'turns', out: 'draw', items: [
        { k: 'box', cls: 's-mono', text: L('every pixel', 'cada píxel'), at: 'turns' },
        { k: 'arrow', at: 'turns+0.6' },
        { k: 'box', cls: 'accent s-mono', text: '× 100', sub: L('turns', 'vueltas'), at: 'turns+1' },
      ] },
      win([{ frag: MB(), aspect: '1 / 1', at: 'draw', cap: '' }], 'draw', { cls: 'window w50' }),
      { k: 'text', at: 'stored', text: L('<b>No image</b> stored anywhere', '<b>Ninguna imagen</b> guardada'), mark: { at: 'stored+1', kind: 'x' } },
      { k: 'code', at: 'formula', type: 'formula+0.2', cps: 40, code: FORMULA },
    ],
  },
  /* five steps of the idea: orbit stays small or escapes; then the three kinds of pixel painted separately */
  {
    id: 'idea',
    beats: { s1: L('We take two numbers', 'Tomamos dos números'), s2: L('at zero', 'en cero'), s3: L('We apply a formula', 'Aplicamos una fórmula'), small: L('always stay small', 'se quedan siempre pequeños'), grow: L('grow without stopping', 'crecen sin parar'), s5: L('We count how many turns', 'Contamos cuántas vueltas'), black: L('are the black shape', 'son la figura negra'), quick: L('escape quickly', 'escapan rápido'), edges: L('bright edges', 'bordes brillantes'), done: L('That is all', 'Eso es todo') },
    items: [
      { k: 'kicker', text: L('The idea', 'La idea') },
      tiles([
        { modes: [{ at: 'black-8', frag: MB({ out: 'dim' }) }, { at: 'black', frag: MB({ out: 'inside' }) }, { at: 'quick', frag: MB({ out: 'fast' }) }, { at: 'edges', frag: MB({ out: 'edge' }) }, { at: 'done', frag: MB() }], aspect: '1 / 1', at: 's1', cap: L('<b>cx, cy</b> · where the pixel is', '<b>cx, cy</b> · dónde está el píxel') },
        { modes: [{ at: 's2', frag: ORBIT('-.5', '0.') }, { at: 'grow', frag: ORBIT('.45', '.55') }], aspect: '1 / 1', at: 's2', cap: L('<b>x, y</b> · the formula, again and again', '<b>x, y</b> · la fórmula, una y otra vez') },
      ], 's1', { cols: 2 }),
      { k: 'row', at: 'black', items: [
        { k: 'box', cls: 's-mono', text: L('never escape', 'nunca escapan'), sub: L('black shape', 'figura negra'), at: 'black' },
        { k: 'box', cls: 's-mono', text: L('escape fast', 'escapan rápido'), sub: L('dark background', 'fondo oscuro'), at: 'quick' },
        { k: 'box', cls: 'accent s-mono', text: L('escape slowly', 'tardan en escapar'), sub: L('bright edges', 'bordes brillantes'), at: 'edges' },
      ] },
    ],
  },
  /* Step 1: the function that counts; each line lights as it is read aloud; the count as a grey image */
  {
    id: 'count',
    beats: { fn: L('the function that does the turns', 'la función que hace las vueltas'), top: L('Read it from top to bottom', 'Léela de arriba abajo'), whl: L('takes at most 100 turns', 'da como máximo 100 vueltas'), form: L('are the formula', 'son la fórmula'), chk: L('checks whether the point has already escaped', 'comprueba si el punto ya se escapó'), brk: L('cuts the loop', 'corta el bucle'), carry: L('carry on', 'seguimos'), ret: L('The function returns how many turns', 'La función devuelve cuántas vueltas'), look: L('Look at what is here', 'Fíjate en lo que hay aquí'), gpu: L('works inside the GPU', 'funciona dentro de la GPU'), warn: L('must always have a sure end', 'siempre debe tener un final seguro'), freeze: L('freezes the GPU', 'congela la GPU') },
    items: [
      { k: 'kicker', text: L('Step 1 · counting the turns', 'Paso 1 · contar las vueltas') },
      { k: 'code', at: 'fn', out: 'ret+2.5', type: 'fn+0.2', cps: 55, code: STEPS, hl: [{ at: 'whl', until: 'form', lines: [6] }, { at: 'form', until: 'chk', lines: [8, 9, 10, 11] }, { at: 'chk', until: 'brk', lines: [13] }, { at: 'brk', until: 'carry', lines: [15] }, { at: 'carry', until: 'ret', lines: [18] }, { at: 'ret', lines: [21] }, { at: 'warn', lines: [6] }] },
      win([{ frag: MB({ out: 'gray' }), aspect: '1 / 1', at: 'ret+2.5', cap: L('<b>steps / 100</b> as grey', '<b>pasos / 100</b> como gris') }], 'ret+2.5', { cls: 'window w40' }),
      { k: 'row', at: 'look', items: ['while', 'if', 'break', 'int', '++'].map((w, i) => ({ k: 'box', cls: 's-mono', text: w, at: `look+${(i * 0.4).toFixed(1)}`, mark: { at: 'gpu', kind: 'check' } })) },
      { k: 'text', at: 'freeze', text: L('An endless loop <b>freezes the whole screen</b>', 'Un bucle sin fin <b>congela la pantalla entera</b>'), mark: { at: 'freeze+1', kind: 'x' } },
    ],
  },
  /* Step 2: from 0..1 to -2.2..0.8: the strip stretches and moves */
  {
    id: 'map',
    beats: { need: L('needs two numbers', 'necesita dos números'), uv: L('goes from 0 to 1', 'va de 0 a 1'), lives: L('lives between', 'vive entre'), conv: L('has to be turned into', 'hay que convertir'), code: L('check it with the extremes', 'compruébalo con los extremos'), zero: L('is 0', 'es 0'), one: L('When it is 1', 'Cuando es 1'), always: L('in every shader', 'en todos los shaders') },
    items: [
      { k: 'kicker', text: L('Step 2 · from the pixel to cx, cy', 'Paso 2 · del píxel a cx, cy') },
      { k: 'code', at: 'need', type: 'need+0.3', cps: 40, code: CXY, hl: [{ at: 'conv', lines: [0] }] },
      { k: 'row', at: 'uv', items: [
        { k: 'box', cls: 's-mono', text: '0 → 1', sub: 'Uv.X', at: 'uv' },
        { k: 'arrow', at: 'lives' },
        { k: 'box', cls: 'accent s-mono', text: '-2.2 → 0.8', sub: 'cx', at: 'lives' },
      ] },
      tiles([{ frag: MAPSTRIP, aspect: '8 / 1', at: 'conv' }], 'conv', { cols: 1 }),
      { k: 'row', at: 'zero', items: [
        { k: 'box', cls: 's-mono', text: '0 × 3 − 2.2', sub: '= −2.2', at: 'zero' },
        { k: 'box', cls: 's-mono', text: '1 × 3 − 2.2', sub: '= 0.8', at: 'one' },
      ] },
      { k: 'text', at: 'always', text: L('Multiply to <b>stretch</b> · subtract to <b>move</b>', 'Multiplica para <b>estirar</b> · resta para <b>mover</b>') },
    ],
  },
  /* Step 3: the count becomes a colour; division of integers trap; the palette curves */
  {
    id: 'color',
    beats: { all: L('took all 100 turns', 'dio las 100 vueltas'), black: L('we paint it black', 'lo pintamos de negro'), tt: L('between 0 and 1', 'entre 0 y 1'), f: L('with the f', 'con la f'), zero: L('the result would always be 0', 'el resultado sería siempre 0'), pal: L('turns t into a color', 'convierte t en un color'), memo: L('memorize those numbers', 'memorizar esos números'), blue: L('blue show up with small values', 'el azul aparezca con valores pequeños'), green: L('green with middle values', 'el verde con valores medios'), red: L('red with high values', 'el rojo con valores altos') },
    items: [
      { k: 'kicker', text: L('Step 3 · from turns to color', 'Paso 3 · de vueltas a color') },
      { k: 'code', at: 'all', out: 'pal', type: 'all+0.2', cps: 50, code: COLOR, hl: [{ at: 'black', until: 'tt', lines: [2, 3, 4, 5] }, { at: 'tt', lines: [7] }] },
      { k: 'row', at: 'f', out: 'pal', items: [
        { k: 'box', cls: 's-bad s-mono', text: 'steps / 100', sub: L('int → 0', 'int → 0'), at: 'zero' },
        { k: 'box', cls: 'accent s-mono', text: 'steps / 100f', sub: L('float → 0.37', 'float → 0.37'), at: 'f' },
      ] },
      { k: 'code', at: 'pal', type: 'pal+0.2', cps: 55, code: PALETTE, hl: [{ at: 'blue', until: 'green', lines: [4] }, { at: 'green', until: 'red', lines: [3] }, { at: 'red', lines: [2] }] },
      tiles([
        { frag: CURVES, aspect: '4 / 3', at: 'memo', cap: L('<b>R · G · B</b> as t grows', '<b>R · G · B</b> al crecer t') },
        { frag: STRIP, aspect: '4 / 3', at: 'blue', cap: L('<b>t: 0 → 1</b>', '<b>t: 0 → 1</b>') },
      ], 'memo', { cols: 2 }),
    ],
  },
  /* three things worth noticing about the complete shader */
  {
    id: 'notice',
    beats: { vtx: L('Vertex method is the same', 'método Vertex es el mismo'), shared: L('all your shaders share them', 'los comparten todos tus shaders'), helper: L('do not have', 'no llevan') },
    items: [
      { k: 'kicker', text: L('Worth noticing', 'Conviene notar') },
      { k: 'row', at: 'vtx', items: [
        { k: 'box', cls: 's-mono', text: 'Vertex', sub: L('unchanged', 'igual que antes'), at: 'vtx', mark: { at: 'vtx+1', kind: 'check' } },
        { k: 'box', cls: 'accent s-mono', text: 'Fragment', sub: L('the interesting part', 'lo interesante'), at: 'vtx+1.2' },
      ] },
      { k: 'row', at: 'shared', items: [
        { k: 'box', cls: 's-mono', text: 'Screen.cs', at: 'shared' },
        { k: 'arrow', at: 'shared+0.5' },
        { k: 'box', cls: 's-mono', text: 'Gradient', at: 'shared+0.7' },
        { k: 'box', cls: 's-mono', text: 'Mandelbrot', at: 'shared+0.9' },
      ] },
      { k: 'text', at: 'helper', text: L('<b>[ShaderStage]</b> only on the stages · the helpers are found by themselves', '<b>[ShaderStage]</b> solo en las etapas · las ayudas se encuentran solas') },
    ],
  },
  /* compile: the view opens; the stretched sideways fractal; 360,000 pixels × 100 */
  {
    id: 'compile',
    beats: { open: L('The viewer opens', 'Se abre el visor'), stretched: L('stretched sideways', 'estirado a lo ancho'), square: L('make it square', 'hazla cuadrada'), glsl: L('look for your', 'busca tu función'), pixels: L('360,000 pixels', '360.000 píxeles'), millions: L('36 million turns', '36 millones de vueltas'), reason: L('reason 1', 'razón 1') },
    items: [
      { k: 'kicker', text: L('Compile and look', 'Compila y mira') },
      win([{ modes: [{ at: 'open-1', frag: stretched() }, { at: 'square', frag: MB() }], aspect: '16 / 9', at: 'open-1' }], 'open-1', { cls: 'window w60' }),
      { k: 'text', at: 'stretched', text: L('Stretched sideways · a <b>wide window</b>', 'Estirado a lo ancho · una <b>ventana ancha</b>') },
      { k: 'row', at: 'pixels', items: [
        { k: 'box', cls: 's-mono', text: '360 000', sub: L('pixels', 'píxeles'), at: 'pixels' },
        { k: 'word', text: '×', at: 'pixels+0.4', fx: 'pop' },
        { k: 'box', cls: 's-mono', text: '100', sub: L('turns', 'vueltas'), at: 'pixels+0.6' },
      ] },
      { k: 'big', cls: 's-mono s-accent', at: 'millions', count: { at: 'millions', from: 0, to: 36000000, dur: 1.6 }, text: '0' },
    ],
  },
  /* play: zoom in; the fractal always has more detail */
  {
    id: 'play',
    beats: { zoom: L('get as close as you want', 'acercarte todo lo que quieras'), two: L('the two lines', 'las dos líneas'), smaller: L('a smaller number', 'un número más pequeño'), twenty: L('Change both', 'Cambia los dos'), swap: L('swap', 'intercambia') },
    items: [
      { k: 'kicker', text: L('Play with it', 'Juega con él') },
      win([{ modes: [{ at: 'zoom-1', frag: MB() }, { at: 'smaller', frag: Z1 }, { at: 'twenty', frag: MB({ N: 20 }) }, { at: 'swap', frag: MB().replace('vec4(9.*r*k*k*k,15.*r*r*k*k,8.5*r*r*r*k', 'vec4(8.5*r*r*r*k,15.*r*r*k*k,9.*r*k*k*k') }], aspect: '1 / 1', at: 'zoom-1' }], 'zoom-1', { cls: 'window w50' }),
      { k: 'code', at: 'two', type: 'two+0.2', cps: 40, code: ZOOM, hl: [{ at: 'smaller', lines: [0, 1] }] },
      { k: 'row', at: 'twenty', items: [
        { k: 'box', cls: 's-mono', text: '100 → 20', sub: L('less detail at the edge', 'borde con menos detalle'), at: 'twenty' },
        { k: 'box', cls: 's-mono', text: 'red ⇄ blue', sub: L('blue becomes orange', 'azul pasa a naranja'), at: 'swap' },
      ] },
    ],
  },
  /* challenge: stretched vs fixed with the aspect */
  {
    id: 'challenge',
    beats: { wide: L('stretched', 'estirado'), solved: L('You already know how to fix it', 'Ya sabes arreglarlo'), three: L('You need three things', 'Necesitas tres cosas'), centre: L('measure from the center', 'medir desde el centro'), solution: L('One possible solution', 'Una solución posible'), replace: L('replace the two lines', 'reemplaza las dos líneas'), nums: L('are the ones that used to come', 'son los que antes salían') },
    items: [
      { k: 'kicker', text: L('Challenge · stop it stretching', 'Reto · que no se estire') },
      win([{ modes: [{ at: 'wide-4', frag: stretched() }, { at: 'solution', frag: fixed() }], aspect: '16 / 9', at: 'wide-4' }], 'wide-4', { cls: 'window w60' }),
      { k: 'row', at: 'three', items: [
        { k: 'box', cls: 's-mono', text: L('uniform Data', 'uniform Datos'), at: 'three' },
        { k: 'box', cls: 's-mono', text: 'aspect', at: 'three+0.6' },
        { k: 'box', cls: 'accent s-mono', text: 'cx', at: 'three+1.2' },
      ] },
      { k: 'code', at: 'replace', type: 'replace+0.2', cps: 55, code: ASPECT, hl: [{ at: 'centre', lines: [1, 2] }, { at: 'nums', lines: [1] }] },
    ],
  },
  /* what you can use in a shader */
  {
    id: 'allowed',
    beats: { much: L('a lot of C# works', 'mucho de C# funciona'), rule: L('only knows how to do calculations', 'solo sabe hacer cuentas'), memory: L('memory that grows', 'memoria que crece') },
    items: [
      { k: 'kicker', text: L('What works in a shader', 'Qué funciona en un shader') },
      { k: 'row', at: 'much', items: ['if', 'while', 'for', 'static', 'float', 'int'].map((w, i) => ({ k: 'box', cls: 's-mono', text: w, at: `much+${(i * 0.3).toFixed(1)}`, mark: { at: `much+${(i * 0.3 + 0.6).toFixed(1)}`, kind: 'check' } })) },
      { k: 'row', at: 'memory', items: [L('List<T>', 'List<T>'), 'string', 'File'].map((w, i) => ({ k: 'box', cls: 's-bad s-mono', text: w, at: `memory+${(i * 0.5).toFixed(1)}`, mark: { at: `memory+${(i * 0.5 + 0.5).toFixed(1)}`, kind: 'x' } })) },
      { k: 'text', at: 'rule', text: L('The GPU only knows <b>calculations</b>', 'La GPU solo sabe hacer <b>cuentas</b>') },
    ],
  },
  {
    id: 'learned',
    dense: true,
    beats: { a: L('you can use', 'puedes usar'), b: L('static functions', 'funciones static'), c: L('runs its own loop', 'ejecuta su propio bucle'), d: L('multiply to stretch', 'multiplicas para estirar'), e: L('Be careful when dividing integers', 'Cuidado con dividir enteros') },
    items: [
      { k: 'kicker', text: L('What you learned', 'Lo que aprendiste') },
      ...[['a', 'if · while · for · break', 'if · while · for · break'], ['b', 'static functions, no attribute', 'funciones static, sin atributo'], ['c', 'each pixel, its own loop', 'cada píxel, su propio bucle'], ['d', '× to stretch · − to move', '× para estirar · − para mover'], ['e', '100f, not 100', '100f, no 100']]
        .map(([b, en, es]) => ({ k: 'word', cls: 's-mono', at: b, fx: 'left', text: L(en, es), mark: { at: `${b}+0.4`, kind: 'check' } })),
    ],
  },
];

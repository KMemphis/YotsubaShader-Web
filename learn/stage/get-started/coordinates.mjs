// Stage of "The coordinates" — motion graphics shown next to the text while the chapter is read aloud.
// Each scene starts at its `> [!SCENE] id` cue in content/<lang>/get-started/coordinates.md. Every image is a live shader
// (GLSL here, the same maths as the C#): Uv as colour, stripes, the origin moving to the centre, an oval turning into a circle.

const L = (en, es) => ({ en, es });
const cs = (title, code) => ({ title, code, lang: 'csharp' });
const VEC = (args) => L(cs('Fragment', `return new vec4(${args}, 1f);`), cs('Fragment', `return new vec4(${args}, 1f);`));
const FRAG = (body, bodyEs = body) => L(cs('Fragment', body), cs('Fragment', bodyEs));

const ENGINE_LOGO = { route: { kni: '/img/engines/kni.png', fna: '/img/engines/fna.png', godot: '/img/engines/godot.svg', raylib: '/img/engines/raylib.png', silknet: '/img/engines/silknet.svg', default: '/img/engines/monogame.png' } };
const win = (tiles, at, extra = {}) => ({ k: 'gl', cls: 'window w50', title: '{{engine}}', logo: ENGINE_LOGO, at, fx: 'pop', radius: 10, tiles, ...extra });
const tiles = (arr, at, extra = {}) => ({ k: 'gl', cls: 'w86', gap: 2, radius: 10, at, fx: 'fade', tiles: arr, ...extra });

const BG = 'vec3(.1,.1,.14)';
// every shader reads uv with Y growing downwards, like the tutorial: y = 1 - uv.y (uv.y is 0 at the bottom in GLSL)
const Y = 'float uy=1.-uv.y;';
const SH = {
  flat: 'return vec4(.55,.2,.35,1.);',
  uvX: 'return vec4(uv.x,0.,0.,1.);',
  uvY: `${Y}return vec4(0.,uy,0.,1.);`,
  uvXY: `${Y}return vec4(uv.x,uy,0.,1.);`,
  // one pixel of the window being "asked" where it is: it travels, the shader shows its Uv as colour
  where: `${Y}vec2 g=vec2(24.,15.);vec2 id=floor(vec2(uv.x,uy)*g);vec2 f=fract(vec2(uv.x,uy)*g);vec2 pr=floor(vec2(.5+.4*sin(t*.9),.5+.38*sin(t*1.3+1.))*g);float on=float(id==pr);float edge=step(.08,f.x)*step(.08,f.y)*step(f.x,.92)*step(f.y,.92);vec3 c=mix(vec3(.12,.12,.17),vec3(uv.x,uy,.5)*.9,.35+.65*on);return vec4(c*edge+vec3(.05)*(1.-edge),1.);`,
  stripes: (n) => `${Y}float v=mod(uv.x*${n}.,1.);return vec4(v,0.,0.,1.);`,
  stripesG: `${Y}float v=mod(uv.x*10.,1.);return vec4(v,0.,0.,1.);`,
  // origin moving from the corner to the centre
  corner: `${Y}vec2 o=vec2(.0,.0);float d=length((vec2(uv.x,uy)-o)*vec2(uRes.x/uRes.y,1.));vec3 c=vec3(uv.x,uy,0.);c=mix(c,vec3(1.),smoothstep(.04,.03,d));float ax=step(abs(uv.x),.004)+step(abs(uy),.006);return vec4(mix(c*.5,vec3(1.),ax),1.);`,
  centre: `${Y}vec2 o=vec2(.5);float d=length((vec2(uv.x,uy)-o)*vec2(uRes.x/uRes.y,1.));vec3 c=vec3(uv.x,uy,0.)*.5;c=mix(c,vec3(1.),smoothstep(.04,.03,d));float ax=step(abs(uv.x-.5),.004)+step(abs(uy-.5),.006);return vec4(mix(c,vec3(1.),ax),1.);`,
  shifted: `${Y}return vec4(uv.x-.5,uy-.5,0.,1.);`,
  oval: `${Y}float dx=uv.x-.5,dy=uy-.5;float k=1.-(dx*dx+dy*dy)*4.;return vec4(vec3(k),1.);`,
  ring: `${Y}float dx=uv.x-.5,dy=uy-.5;float k=dx*dx+dy*dy;return vec4(vec3(fract(k*14.-t*.5)),1.);`,
  circle: 'float dx=(uv.x-.5)*uRes.x/uRes.y,dy=(1.-uv.y)-.5;float k=1.-(dx*dx+dy*dy)*4.;return vec4(vec3(k),1.);',
  // 0.1 wide and 0.1 tall in Uv are not the same length on screen
  tenth: `${Y}vec2 a=step(vec2(.0,.0),vec2(uv.x,uy))*step(vec2(uv.x,uy),vec2(.1));vec3 c=vec3(.12,.12,.17);c=mix(c,vec3(1.,.48,.7),a.x*a.y);float line=step(abs(uv.x-.1),.003)*step(uy,.1)+step(abs(uy-.1),.005)*step(uv.x,.1);return vec4(mix(c,vec3(1.),clamp(line,0.,1.)),1.);`,
  // a window whose width changes: the oval stretches with it, the corrected circle stays round
  stretch: (fixed) => `vec2 c=uv-.5;c.x*=uRes.x/uRes.y;float A=1.35+.8*(.5+.5*sin(t*.8));vec2 h=vec2(.3*A,.3);vec3 col=${BG};if(abs(c.x)<h.x&&abs(c.y)<h.y){vec2 l=c/(2.*h);vec2 d=${fixed ? 'l*vec2(A,1.)' : 'l'};col=mix(vec3(.17,.17,.23),vec3(${fixed ? '.38,.94,.82' : '1.,.48,.7'}),smoothstep(.3,.28,length(d)));}float fr=step(abs(abs(c.x)-h.x),.004)*step(abs(c.y),h.y)+step(abs(abs(c.y)-h.y),.004)*step(abs(c.x),h.x);return vec4(mix(col,vec3(.6,.6,.7),fr),1.);`,
  // the same value reaches every pixel: a uniform
  uniformCores: `vec2 n=vec2(34.,21.);vec2 g=floor(uv*n),f=fract(uv*n);float h=fract(sin(dot(g,vec2(12.9898,78.233)))*43758.5453);float on=.5+.5*sin(t*1.5+h*6.);float sq=step(.14,f.x)*step(.14,f.y)*step(f.x,.9)*step(f.y,.9);vec3 hot=vec3(.38,.94,.82);return vec4(mix(vec3(.07,.07,.1),mix(vec3(.17,.17,.23),hot,on*.35+.2),sq),1.);`,
};

const ENV = L(cs('MyShaders/Context.cs', `public struct Context
{
    public float Width;
    public float Height;
}`), cs('MisShaders/Entorno.cs', `public struct Entorno
{
    public float Ancho;
    public float Alto;
}`));
const DECL = L(cs('MyShaders/Coordinates.cs', `[uniform]
[layout(0, 0)]
public Context Data;`), cs('MisShaders/Coordenadas.cs', `[uniform]
[layout(0, 0)]
public Entorno Datos;`));
const FIX = L(cs('Fragment', `float aspect = Data.Width / Data.Height;
float dx = (pixel.Uv.X - 0.5f) * aspect;
float dy = pixel.Uv.Y - 0.5f;
float k = 1f - (dx * dx + dy * dy) * 4f;`), cs('Fragment', `float aspecto = Datos.Ancho / Datos.Alto;
float dx = (pixel.Uv.X - 0.5f) * aspecto;
float dy = pixel.Uv.Y - 0.5f;
float k = 1f - (dx * dx + dy * dy) * 4f;`));

export default [
  /* every pixel had the same colour; now each one gets its own, and for that it needs to know where it is */
  {
    id: 'intro',
    beats: { same: L('every pixel had the same color', 'todos los píxeles tenían el mismo color'), own: L('each pixel getting its own', 'que cada píxel tenga el suyo'), where: L('where is this pixel', 'dónde está este píxel'), uv: L('That answer is the', 'Esa respuesta es el') },
    items: [
      { k: 'kicker', text: L('Coordinates', 'Coordenadas') },
      win([{ modes: [{ at: 'same', frag: SH.flat }, { at: 'own', frag: SH.uvXY }, { at: 'where', frag: SH.where }] }], 'same'),
      { k: 'big', cls: 's-mono s-accent', at: 'uv', text: 'Uv' },
    ],
  },
  /* Step 1: Uv.X painted as red: black on the left, red on the right */
  {
    id: 'uvcolor',
    beats: { using: L('Here we are using', 'Aquí estamos usando'), black: L('Black on the left', 'Negro a la izquierda'), zero: L('at the left edge', 'en el borde izquierdo'), one: L('at the right edge', 'en el derecho'), tool: L('the best tool', 'la mejor herramienta') },
    items: [
      { k: 'kicker', text: L('Step 1 · Uv.X as red', 'Paso 1 · Uv.X como rojo') },
      { k: 'code', at: 'using', type: 'using+0.2', cps: 45, code: VEC('pixel.Uv.X, 0f, 0f') },
      win([{ frag: SH.uvX, at: 'black' }], 'black'),
      { k: 'row', at: 'zero', items: [
        { k: 'box', cls: 's-mono', text: 'Uv.X = 0', sub: L('no red', 'sin rojo'), at: 'zero' },
        { k: 'arrow', at: 'zero+0.4' },
        { k: 'box', cls: 'accent s-mono', text: 'Uv.X = 1', sub: L('full red', 'rojo completo'), at: 'one' },
      ] },
      { k: 'text', at: 'tool', text: L('Turn a number into <b>color</b> to see it', 'Convierte un número en <b>color</b> para verlo') },
    ],
  },
  /* Step 2: Uv.Y in green grows downwards */
  {
    id: 'down',
    beats: { look: L('Look closely', 'Fíjate bien'), top: L('At the top', 'Arriba'), text: L('the way text is read', 'como se lee un texto'), upside: L('upside down', 'al revés') },
    items: [
      { k: 'kicker', text: L('Step 2 · Uv.Y as green', 'Paso 2 · Uv.Y como verde') },
      { k: 'code', at: 0.3, type: 0.5, cps: 45, code: VEC('0f, pixel.Uv.Y, 0f') },
      win([{ frag: SH.uvY, at: 'look' }], 'look'),
      { k: 'text', at: 'text', text: L('Y grows <b>downward</b>, like reading text', 'Y crece <b>hacia abajo</b>, como se lee un texto') },
      { k: 'text', at: 'upside', text: L('A drawing <b>upside down</b>? Check your Y', '¿Un dibujo <b>al revés</b>? Revisa tu Y'), mark: { at: 'upside+0.6', kind: 'x' } },
    ],
  },
  /* both together: the coordinate map and what each corner looks like */
  {
    id: 'map',
    beats: { both: L('Now put both coordinates together', 'Ahora pon las dos coordenadas juntas'), map: L('coordinate map', 'mapa de coordenadas'), corner: L('Each corner tells you', 'Cada esquina te cuenta'), doubt: L('If you ever doubt', 'Si alguna vez dudas') },
    items: [
      { k: 'kicker', text: L('Uv.X · Uv.Y', 'Uv.X · Uv.Y') },
      { k: 'code', at: 'both+0.3', type: 'both+0.5', cps: 45, code: VEC('pixel.Uv.X, pixel.Uv.Y, 0f') },
      win([{ frag: SH.uvXY, at: 'map' }], 'map'),
      { k: 'row', at: 'corner', items: [
        { k: 'box', cls: 's-mono', text: '(0, 0)', sub: L('black', 'negro'), at: 'corner' },
        { k: 'box', cls: 's-bad s-mono', text: '(1, 0)', sub: L('red', 'rojo'), at: 'corner+0.8' },
        { k: 'box', cls: 's-ok s-mono', text: '(0, 1)', sub: L('green', 'verde'), at: 'corner+1.6' },
        { k: 'box', cls: 's-mono', text: '(1, 1)', sub: L('yellow', 'amarillo'), at: 'corner+2.4' },
      ] },
      { k: 'text', at: 'doubt', text: L('Doubt a position? <b>Paint it</b>', '¿Dudas de una posición? <b>Píntala</b>') },
    ],
  },
  /* Step 3: multiply and take the remainder: stripes */
  {
    id: 'repeat',
    beats: { first: L('Multiply first', 'Multiplica primero'), two: L('two new things', 'dos cosas nuevas'), rem: L('remainder of the division', 'resto de la división'), four: L('four times', 'cuatro veces'), ten: L('ten stripes', 'diez franjas') },
    items: [
      { k: 'kicker', text: L('Step 3 · repeating', 'Paso 3 · repetir') },
      { k: 'slot', items: [
        { k: 'code', at: 'first', out: 'four', type: 'first+0.3', cps: 45, code: VEC('pixel.Uv.X, 0f, 0f') },
        { k: 'code', at: 'four-8', out: 'ten', code: FRAG('return new vec4((pixel.Uv.X * 4f) % 1f, 0f, 0f, 1f);', 'return new vec4((pixel.Uv.X * 4f) % 1f, 0f, 0f, 1f);') },
        { k: 'code', at: 'ten', code: FRAG('return new vec4((pixel.Uv.X * 10f) % 1f, 0f, 0f, 1f);', 'return new vec4((pixel.Uv.X * 10f) % 1f, 0f, 0f, 1f);') },
      ] },
      win([{ modes: [{ at: 'first', frag: SH.uvX }, { at: 'two', frag: SH.stripes(4) }, { at: 'ten', frag: SH.stripes(10) }] }], 'first'),
      { k: 'row', at: 'rem', items: [
        { k: 'box', cls: 's-mono', text: '0.3 → 0.3', at: 'rem' },
        { k: 'box', cls: 's-mono', text: '1.3 → 0.3', at: 'rem+0.6' },
        { k: 'box', cls: 's-mono', text: '3.7 → 0.7', at: 'rem+1.2' },
      ] },
    ],
  },
  /* Step 4: the origin moves to the centre: subtract 0.5; negatives are clipped */
  {
    id: 'center',
    beats: { origin: L('we need the point', 'necesitamos que el punto'), sub: L('we subtract', 'restamos'), far: L('how far I am from the center', 'cuánto me alejo del centro'), result: L('Look at the result carefully', 'Mira el resultado con atención'), clips: L('clips negatives', 'recorta') },
    items: [
      { k: 'kicker', text: L('Step 4 · origin at the center', 'Paso 4 · origen en el centro') },
      { k: 'code', at: 'origin', type: 'origin+0.3', cps: 40, code: FRAG('float dx = pixel.Uv.X - 0.5f;\nfloat dy = pixel.Uv.Y - 0.5f;\nreturn new vec4(dx, dy, 0f, 1f);', 'float dx = pixel.Uv.X - 0.5f;\nfloat dy = pixel.Uv.Y - 0.5f;\nreturn new vec4(dx, dy, 0f, 1f);') },
      win([{ modes: [{ at: 0, frag: SH.corner }, { at: 'sub', frag: SH.centre }, { at: 'result', frag: SH.shifted }] }], 0.5),
      { k: 'text', at: 'far', text: L('<b>dx</b> and <b>dy</b>: how far from the center', '<b>dx</b> y <b>dy</b>: cuánto me alejo del centro') },
    ],
  },
  /* Step 5: distance to the centre squared; a spot of light, but it comes out oval */
  {
    id: 'dist',
    beats: { far: L('how far each pixel is', 'qué tan lejos está cada píxel'), read: L('Let us read the third line', 'Leamos la tercera línea'), grow: L('makes it grow faster', 'la hace crecer más rápido'), flip: L('flips it', 'le da la vuelta'), oval: L('an oval came out', 'salió un óvalo') },
    items: [
      { k: 'kicker', text: L('Step 5 · distance to the center', 'Paso 5 · distancia al centro') },
      win([{ modes: [{ at: 'far', frag: SH.ring }, { at: 'flip', frag: SH.oval }] }], 'far'),
      { k: 'row', at: 'read', items: [
        { k: 'box', cls: 's-mono', text: 'dx² + dy²', sub: '1', at: 'read' },
        { k: 'box', cls: 's-mono', text: '× 4', sub: '2', at: 'grow' },
        { k: 'box', cls: 'accent s-mono', text: '1 − …', sub: '3', at: 'flip' },
      ] },
      { k: 'text', at: 'oval', text: L('We asked for a <b>round</b> spot', 'Pedimos una mancha <b>redonda</b>'), mark: { at: 'oval+1', kind: 'x' } },
    ],
  },
  /* the oval problem: 0.1 of width is not 0.1 of height */
  {
    id: 'oval',
    beats: { uv: L('always goes from', 'siempre va de'), win: L('800 by 450', '800 por 450'), wide: L('wider than tall', 'más ancha que alta'), stretch: L('the circle stretches', 'el círculo se estira'), know: L('know the width and height', 'saber el ancho y el alto') },
    items: [
      { k: 'kicker', text: L('The oval problem', 'El problema del óvalo') },
      win([{ frag: SH.tenth, aspect: '16 / 9', at: 'win' }], 'uv', { cls: 'window w60' }),
      { k: 'row', at: 'wide', items: [
        { k: 'box', cls: 's-mono', text: '800 × 450', sub: L('window', 'ventana'), at: 'win' },
        { k: 'box', cls: 's-mono', text: '0.1 → 80 px', sub: L('wide', 'ancho'), at: 'wide' },
        { k: 'box', cls: 's-mono', text: '0.1 → 45 px', sub: L('tall', 'alto'), at: 'wide+0.8' },
      ] },
      { k: 'text', at: 'know', text: L('The shader has to <b>know</b> the size of the window', 'El shader tiene que <b>saber</b> el tamaño de la ventana') },
    ],
  },
  /* Step 6: a uniform: the program hands the same value to every pixel; the three steps to declare it */
  {
    id: 'uniform',
    beats: { uniform: L('is called a uniform', 'se llama uniform'), same: L('the same value for all', 'lo mismo para todos'), three: L('three steps', 'tres pasos'), first: L('create a file', 'crea un archivo'), second: L('Second', 'Segundo'), third: L('Third inside', 'Tercero dentro'), parts: L('three parts', 'tres partes') },
    items: [
      { k: 'kicker', text: 'uniform' },
      { k: 'slot', items: [
        { k: 'row', at: 'uniform', out: 'three', items: [
          { k: 'box', cls: 'accent s-mono', text: L('Your program', 'Tu programa'), sub: 'Width = 800', at: 'uniform' },
          { k: 'arrow', at: 'same' },
          { k: 'box', cls: 'gpu', text: 'GPU', sub: L('same for every pixel', 'igual para cada píxel'), at: 'same' },
        ] },
        { k: 'code', at: 'first', out: 'second', type: 'first+0.3', cps: 60, code: ENV },
        { k: 'code', at: 'second', out: 'third', type: 'second+0.2', cps: 60, code: L(cs('MyShaders/Coordinates.cs', 'using YotsubaShader.GlslSyntax.Resources;'), cs('MisShaders/Coordenadas.cs', 'using YotsubaShader.GlslSyntax.Resources;')) },
        { k: 'code', at: 'third', type: 'third+0.2', cps: 45, code: DECL, hl: [{ at: 'parts', until: 'parts+3', lines: [0] }, { at: 'parts+3', until: 'parts+6', lines: [1] }, { at: 'parts+6', lines: [2] }],
          tags: [{ at: 'parts+0.4', line: 0, text: L('from outside', 'viene de fuera') }, { at: 'parts+3.4', line: 1, text: L('address', 'dirección') }, { at: 'parts+6.4', line: 2, text: L('the data', 'el dato') }] },
      ] },
    ],
  },
  /* Step 7: with the aspect the circle is round, and it stays round whatever the window does */
  {
    id: 'fix',
    beats: { new: L('The new line is the first one', 'La línea nueva es la primera'), run: L('Run the work cycle', 'Ejecuta el ciclo de trabajo'), stretch: L('stretch the window', 'estira la ventana'), recompute: L('recomputes the aspect', 'vuelve a calcular el aspecto') },
    items: [
      { k: 'kicker', text: L('Step 7 · fixing the circle', 'Paso 7 · arreglar el círculo') },
      { k: 'code', at: 0.2, type: 0.4, cps: 50, code: FIX, hl: [{ at: 'new', until: 'run', lines: [0] }] },
      { k: 'gl', cls: 'w86', cols: 2, gap: 2, radius: 10, at: 'run', fx: 'fade', tiles: [
        { frag: SH.stretch(false), aspect: '16 / 10', at: 'run', cap: L('<b>Without aspect</b>', '<b>Sin aspecto</b>'), marks: [{ at: 'stretch', kind: 'x' }] },
        { frag: SH.stretch(true), aspect: '16 / 10', at: 'run+0.3', cap: L('<b>With aspect</b>', '<b>Con aspecto</b>'), marks: [{ at: 'stretch', kind: 'check' }] },
      ] },
    ],
  },
  {
    id: 'learned',
    dense: true,
    beats: { a: L("the pixel's position", 'la posición del píxel'), b: L('To see a number', 'Para ver un número'), c: L('repeats a pattern', 'repite un patrón'), d: L('To tell how far', 'Para saber qué tan lejos'), e: L('An oval circle', 'Un círculo ovalado') },
    items: [
      { k: 'kicker', text: L('What you learned', 'Lo que aprendiste') },
      ...[['a', 'Uv: X → 0…1, Y ↓ 0…1', 'Uv: X → 0…1, Y ↓ 0…1'], ['b', 'number → color', 'número → color'], ['c', '%  repeats · − 0.5  centers', '%  repite · − 0.5  centra'], ['d', 'dx * dx + dy * dy', 'dx * dx + dy * dy'], ['e', 'oval → uniform → aspect', 'óvalo → uniform → aspecto']]
        .map(([b, en, es]) => ({ k: 'word', cls: 's-mono', at: b, fx: 'left', text: L(en, es), mark: { at: `${b}+0.4`, kind: 'check' } })),
    ],
  },
];

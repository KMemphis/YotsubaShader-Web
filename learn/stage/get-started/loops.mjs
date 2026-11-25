// Stage of "Repeating with loops" — motion graphics shown next to the text while the chapter is read aloud.
// Each scene starts at its `> [!SCENE] id` cue in content/<lang>/get-started/loops.md. Every image is a live shader with a real
// loop inside: the lap that is running lights up, a skipped lap goes dark, the first match stops the loop, bars read from an array.

const L = (en, es) => ({ en, es });
const cs = (title, code) => ({ title, code, lang: 'csharp' });
const ENGINE_LOGO = { route: { kni: '/img/engines/kni.png', fna: '/img/engines/fna.png', godot: '/img/engines/godot.svg', raylib: '/img/engines/raylib.png', silknet: '/img/engines/silknet.svg', default: '/img/engines/monogame.png' } };
const win = (tiles, at, extra = {}) => ({ k: 'gl', cls: 'window w50', title: '{{engine}}', logo: ENGINE_LOGO, at, fx: 'pop', radius: 10, tiles, ...extra });
const tiles = (arr, at, extra = {}) => ({ k: 'gl', cls: 'w86', gap: 2, radius: 10, at, fx: 'fade', tiles: arr, ...extra });
const both = (s) => L(cs('Fragment', s), cs('Fragment', s));
const BG = 'vec3(.1,.1,.14)';
const PINK = 'vec3(1.,.48,.7)', VIOLET = 'vec3(.77,.64,1.)', MINT = 'vec3(.38,.94,.82)';
const ASPECT = 'float asp=uRes.x/uRes.y;';

const FOR = L(cs('Fragment', `int steps = 0;
for (int i = 0; i < 5; i++)
{
    if (pixel.Uv.X > i * 0.2f)
        steps++;
}
float gray = steps / 5f;`), cs('Fragment', `int escalones = 0;
for (int i = 0; i < 5; i++)
{
    if (pixel.Uv.X > i * 0.2f)
        escalones++;
}
float gris = escalones / 5f;`));
const CIRCLES = both(`for (int i = 0; i < 6; i++)
{
    float cx = (i + 0.5f) / 6f * aspect;
    float dx = pixel.Uv.X * aspect - cx;
    if (dx * dx + dy * dy < 0.03f)
        color = …;
}`);
const CONTINUE = both(`for (int i = 0; i < 6; i++)
{
    if (i % 2 == 1)
        continue;
    …
}`);
const BREAK = both(`for (int i = 0; i < 6; i++)
{
    if (inside)
    {
        color = …;
        break;
    }
}`);
const ARRAY = L(cs('Fragment', `float[] heights = new float[5];
heights[0] = 0.3f;
heights[1] = 0.8f;
heights[2] = 0.5f;
// …`), cs('Fragment', `float[] alturas = new float[5];
alturas[0] = 0.3f;
alturas[1] = 0.8f;
alturas[2] = 0.5f;
// …`));
const FOR_FORM = both('for (int i = 0; i < 5; i++)\n{\n    …\n}');
const WHILE_FORM = both('int i = 0;\nwhile (i < 5)\n{\n    …\n    i++;\n}');

const SH = {
  // n circles across the width, one lap each; `cur` lights the lap that is running, `skip` darkens the odd laps
  circles: (n, o = {}) => `${ASPECT}vec2 p=vec2(uv.x*asp,1.-uv.y);vec3 c=${BG};float cur=floor(mod(t*1.4,${n}.));for(int i=0;i<${n};i++){float fi=float(i);float cx=(fi+.5)/${n}.*asp;float r=min(.4*asp/${n}.,.2);float inside=step(length(p-vec2(cx,.5)),r);vec3 col=${o.hl ? `(fi==cur?${PINK}:${VIOLET})` : VIOLET};${o.skip ? `if(mod(fi,2.)==1.){col=vec3(.2,.2,.27);}` : ''}c=mix(c,col,inside);}return vec4(c,1.);`,
  steps: (n) => `float s=0.;for(int i=0;i<${n};i++){if(uv.x>float(i)/${n}.)s++;}return vec4(vec3(s/${n}.),1.);`,
  manyCircles: `${ASPECT}vec2 p=vec2(uv.x*asp,1.-uv.y);vec2 g=vec2(10.*asp/1.6,5.);vec2 id=floor(uv*vec2(10.,5.)),f=fract(uv*vec2(10.,5.))-.5;f.x*=asp/2.;float on=step(length(f),.38);float h=fract(sin(dot(id,vec2(12.9898,78.233)))*43758.5453);return vec4(mix(${BG},mix(${VIOLET},${PINK},h),on),1.);`,
  one: `${ASPECT}vec2 p=vec2((uv.x-.5)*asp,.5-uv.y);return vec4(mix(${BG},${VIOLET},step(length(p),.22)),1.);`,
  mandel: 'vec2 c=vec2(-.7436,.1318)+(uv-.5)*vec2(uRes.x/uRes.y,1.)*2.8*exp(-.2*mod(t,22.));vec2 z=vec2(0.);float n=0.;for(int i=0;i<120;i++){z=vec2(z.x*z.x-z.y*z.y,2.*z.x*z.y)+c;if(dot(z,z)>4.)break;n++;}float k=n/120.;return vec4(n>=119.?vec3(0.):vec3(.1,.3,1.)*pow(k,.4)+vec3(.6,.8,1.)*pow(k,3.),1.);',
  // overlapping circles: the last lap paints over the others, or `break` keeps the first one that matches
  overlap: (brk) => `${ASPECT}vec2 p=vec2(uv.x*asp,1.-uv.y);vec3 c=${BG};for(int i=0;i<6;i++){float fi=float(i);float cx=(fi+.5)/6.*asp;float r=.26;if(length(p-vec2(cx,.5))<r){c=mix(${PINK},${MINT},fi/5.);${brk ? 'break;' : ''}}}return vec4(c,1.);`,
  // a bar chart: one lap per bar, the height comes from the list
  bars: (anim) => `float h[5];h[0]=.3;h[1]=.8;h[2]=.5;h[3]=.9;h[4]=.4;${anim ? 'for(int j=0;j<5;j++){h[j]=.2+.7*(.5+.5*sin(t*1.1+float(j)*1.7));}' : ''}vec3 c=${BG};float y=1.-uv.y;for(int i=0;i<5;i++){float x0=.1+float(i)*.16,x1=x0+.12;if(uv.x>x0&&uv.x<x1&&uv.y<h[i])c=mix(${VIOLET},${PINK},uv.y/h[i]*.7);}return vec4(c,1.);`,
};

export default [
  /* a circle you know; six, fifty? one block repeated; and the fractal is just a loop */
  {
    id: 'intro',
    beats: { six: L('And six circles', 'seis círculos'), fifty: L('fifty', 'cincuenta'), paste: L('copy and paste', 'copiar y pegar'), loop: L('That is what loops are for', 'Para eso existen'), mandel: L('The Mandelbrot fractal', 'El fractal de Mandelbrot') },
    items: [
      { k: 'kicker', text: L('Loops', 'Bucles') },
      win([{ aspect: '16 / 6', modes: [{ frag: SH.one }, { at: 'six', frag: SH.circles(6) }, { at: 'fifty', frag: SH.manyCircles }, { at: 'mandel', frag: SH.mandel }] }], 0.2, { cls: 'window w70' }),
      { k: 'code', at: 'loop', type: 'loop+0.3', cps: 40, code: FOR_FORM },
    ],
  },
  /* Step 1: the for line, its three parts, and five laps counted by each pixel on its own */
  {
    id: 'for',
    beats: { stripes: L('Five stripes of gray', 'Cinco franjas de gris'), parts: L('three parts', 'tres partes'), laps: L('five laps', 'cinco vueltas'), own: L('does its own count', 'hace su propio recuento'), ten: L('ten stripes', 'diez franjas') },
    items: [
      { k: 'kicker', text: L('Step 1 · counting with a for', 'Paso 1 · contar con un for') },
      { k: 'code', at: 'stripes-5', type: 'stripes-4.4', cps: 45, code: FOR, hl: [{ at: 'parts', until: 'laps', lines: [1] }, { at: 'laps', until: 'own', lines: [1, 2, 3, 4, 5] }, { at: 'own', lines: [3, 4] }] },
      win([{ modes: [{ at: 'stripes-5', frag: SH.steps(5) }, { at: 'ten', frag: SH.steps(10) }] }], 'stripes-5'),
      { k: 'row', at: 'own', items: [
        { k: 'box', cls: 's-mono', text: '0', sub: L('left pixel', 'píxel izquierdo'), at: 'own' },
        { k: 'box', cls: 'accent s-mono', text: '5', sub: L('right pixel', 'píxel derecho'), at: 'own+0.8' },
      ] },
    ],
  },
  /* Step 2: six circles from a single block; the counter is used in the maths */
  {
    id: 'circles',
    beats: { once: L('only once', 'una sola vez'), counter: L('the counter', 'el contador'), middle: L('in the middle of its', 'en el medio de su'), seven: L('seven circles', 'siete círculos'), trap: L('integer division', 'división de enteros') },
    items: [
      { k: 'kicker', text: L('Step 2 · six circles, one block', 'Paso 2 · seis círculos con un solo bloque') },
      { k: 'code', at: 'once-6', type: 'once-5.4', cps: 45, code: CIRCLES, hl: [{ at: 'counter', until: 'middle', lines: [2] }, { at: 'middle', lines: [2, 3] }] },
      win([{ modes: [{ at: 'once-6', frag: SH.circles(6, { hl: true }) }, { at: 'seven', frag: SH.circles(7, { hl: true }) }] }], 'once-6'),
      { k: 'row', at: 'trap', items: [
        { k: 'box', cls: 's-bad s-mono', text: 'i / 6', sub: L('int → 0', 'int → 0'), at: 'trap' },
        { k: 'box', cls: 'accent s-mono', text: 'i / 6f', sub: L('float → 0.16', 'float → 0.16'), at: 'trap+0.8' },
      ] },
    ],
  },
  /* Step 3: continue skips the odd laps */
  {
    id: 'continue',
    beats: { skip: L('end this lap here', 'termina esta vuelta aquí'), odd: L('is true when', 'es verdadero cuando'), only: L('Only the circles', 'Solo se dibujan') },
    items: [
      { k: 'kicker', text: 'continue' },
      { k: 'code', at: 'skip-3', type: 'skip-2.4', cps: 40, code: CONTINUE, hl: [{ at: 'odd', lines: [2, 3] }] },
      win([{ modes: [{ at: 'skip-3', frag: SH.circles(6) }, { at: 'odd', frag: SH.circles(6, { skip: true }) }] }], 'skip-3'),
      { k: 'text', at: 'only', text: L('Laps <b>0 · 2 · 4</b> are drawn', 'Se dibujan las vueltas <b>0 · 2 · 4</b>') },
    ],
  },
  /* Step 4: break stops at the first circle that matches; without it the last one wins */
  {
    id: 'break',
    beats: { leave: L('leave the loop right now', 'sal del bucle ahora mismo'), compare: L('Compare this result', 'Compara este resultado'), last: L('the last circle wins', 'gana el último círculo') },
    items: [
      { k: 'kicker', text: 'break' },
      { k: 'code', at: 'leave-3', type: 'leave-2.4', cps: 40, code: BREAK, hl: [{ at: 'leave', lines: [5] }] },
      tiles([
        { frag: SH.overlap(false), aspect: '16 / 9', at: 'compare', cap: L('<b>Without break · the last wins</b>', '<b>Sin break · gana el último</b>') },
        { frag: SH.overlap(true), aspect: '16 / 9', at: 'last', cap: L('<b>With break · the first wins</b>', '<b>Con break · gana el primero</b>') },
      ], 'compare', { cols: 2 }),
    ],
  },
  /* Step 5: an array: numbered slots; a bar chart with one lap per bar */
  {
    id: 'array',
    beats: { arr: L('the array', 'el array'), five: L('five slots', 'cinco casilleros'), slot: L('slot number', 'el casillero número'), chart: L('a bar chart', 'un gráfico de barras'), change: L('Change the numbers in the list', 'Cambia los números de la lista') },
    items: [
      { k: 'kicker', text: 'array' },
      { k: 'code', at: 'arr', type: 'arr+0.3', cps: 45, code: ARRAY, hl: [{ at: 'five', until: 'slot', lines: [0] }, { at: 'slot', lines: [3] }] },
      { k: 'row', at: 'five', items: ['0.3', '0.8', '0.5', '0.9', '0.4'].map((v, i) => ({ k: 'box', cls: i === 2 ? 'accent s-mono' : 's-mono', text: v, sub: `[${i}]`, at: `five+${(i * 0.3).toFixed(1)}` })) },
      win([{ modes: [{ at: 'chart', frag: SH.bars(false) }, { at: 'change', frag: SH.bars(true) }] }], 'chart'),
    ],
  },
  /* the while loop: the same as a for, with the counter in your hands */
  {
    id: 'while',
    beats: { other: L('Another loop', 'Otro bucle'), cond: L('as long as a condition is true', 'mientras una condición sea verdadera'), same: L('the same as a for', 'lo mismo que un for'), unknown: L('do not know before starting', 'no sepas antes de empezar') },
    items: [
      { k: 'kicker', text: 'while' },
      { k: 'morph', at: 'other', morph: 'same', dur: 1.4, from: FOR_FORM, to: WHILE_FORM, hl: [{ at: 'unknown', lines: 'all', step: 0.2 }] },
    ],
  },
  /* loops cost: 360,000 pixels × 100 laps; an endless loop freezes the screen */
  {
    id: 'cost',
    beats: { pixels: L('360,000 pixels', '360.000 píxeles'), laps: L('36 million', '36 millones'), never: L('never becomes false', 'nunca se vuelve falsa'), rule: L('start with few laps', 'empieza con pocas vueltas') },
    items: [
      { k: 'kicker', text: L('Loops cost', 'Los bucles cuestan') },
      { k: 'row', at: 'pixels', items: [
        { k: 'box', cls: 's-mono', text: '360 000', sub: L('pixels', 'píxeles'), at: 'pixels' },
        { k: 'word', text: '×', at: 'pixels+0.5', fx: 'pop' },
        { k: 'box', cls: 's-mono', text: '100', sub: L('laps', 'vueltas'), at: 'pixels+0.8' },
      ] },
      { k: 'big', cls: 's-mono s-accent', at: 'laps', count: { at: 'laps', from: 0, to: 36000000, dur: 1.6 }, text: '0' },
      { k: 'text', at: 'never', text: L('A loop that never ends <b>freezes the screen</b>', 'Un bucle que no termina <b>congela la pantalla</b>'), mark: { at: 'never+1', kind: 'x' } },
      { k: 'text', at: 'rule', text: L('Few laps first, then more if you need them', 'Pocas vueltas primero, más si hace falta') },
    ],
  },
  {
    id: 'learned',
    dense: true,
    beats: { a: L('repeats a block', 'repite un bloque'), b: L('can be used in the calculations', 'se puede usar en las cuentas'), c: L('jumps to the next lap', 'salta a la siguiente vuelta'), d: L('fixed-size list', 'lista de datos de tamaño fijo'), e: L('Dividing two integers', 'Dividir dos enteros'), f: L('must always have a limit', 'siempre debe tener tope') },
    items: [
      { k: 'kicker', text: L('What you learned', 'Lo que aprendiste') },
      ...[['a', 'for (int i = 0; i < n; i++)', 'for (int i = 0; i < n; i++)'], ['b', 'i inside the maths', 'i dentro de las cuentas'], ['c', 'continue · break', 'continue · break'], ['d', 'array = fixed-size list', 'array = lista de tamaño fijo'], ['e', 'int / int drops decimals', 'int / int pierde decimales'], ['f', 'every loop needs a limit', 'todo bucle necesita tope']]
        .map(([b, en, es]) => ({ k: 'word', cls: 's-mono', at: b, fx: 'left', text: L(en, es), mark: { at: `${b}+0.4`, kind: 'check' } })),
    ],
  },
];

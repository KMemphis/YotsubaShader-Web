// Stage of "Mix and smooth" — motion graphics shown next to the text while the chapter is read aloud.
// Each scene starts at its `> [!SCENE] id` cue in content/<lang>/get-started/mixing.md. Every image is a live shader (the same
// maths as the C# of the chapter): a number line with `t` travelling it, curves of clamp / smoothstep, and the sunset built layer by layer.

const L = (en, es) => ({ en, es });
const cs = (title, code) => ({ title, code, lang: 'csharp' });
const ENGINE_LOGO = { route: { kni: '/img/engines/kni.png', fna: '/img/engines/fna.png', godot: '/img/engines/godot.svg', raylib: '/img/engines/raylib.png', silknet: '/img/engines/silknet.svg', default: '/img/engines/monogame.png' } };
const win = (tiles, at, extra = {}) => ({ k: 'gl', cls: 'window w50', title: '{{engine}}', logo: ENGINE_LOGO, at, fx: 'pop', radius: 10, tiles, ...extra });
const tiles = (arr, at, extra = {}) => ({ k: 'gl', cls: 'w86', gap: 2, radius: 10, at, fx: 'fade', tiles: arr, ...extra });

const BG = 'vec3(.1,.1,.14)';
const PINK = 'vec3(1.,.48,.7)', VIOLET = 'vec3(.77,.64,1.)', MINT = 'vec3(.38,.94,.82)';

// the three functions as the chapter writes them (Spanish and English names)
const MIX = L(cs('Mix', `float Mix(float a, float b, float t)
{
    return a + (b - a) * t;
}`), cs('Mezclar', `float Mezclar(float a, float b, float t)
{
    return a + (b - a) * t;
}`));
const CLAMP = L(cs('Clamp', `float Clamp(float x, float min, float max)
{
    if (x < min) return min;
    if (x > max) return max;
    return x;
}`), cs('Limitar', `float Limitar(float x, float min, float max)
{
    if (x < min) return min;
    if (x > max) return max;
    return x;
}`));
const SMOOTH = L(cs('Smooth', `float Smooth(float start, float end, float value)
{
    float t = Clamp((value - start) / (end - start), 0f, 1f);
    return t * t * (3f - 2f * t);
}`), cs('Suavizar', `float Suavizar(float desde, float hasta, float valor)
{
    float t = Limitar((valor - desde) / (hasta - desde), 0f, 1f);
    return t * t * (3f - 2f * t);
}`));

// a sunset built in layers: sky, halo (added), disc (mixed), ground. `sun` is the height of the sun.
const SUN = (layers, sun = '.62') => `float uy=1.-uv.y;float dx=(uv.x-.5)*uRes.x/uRes.y,dy=uy-(${sun});float d2=dx*dx+dy*dy;vec3 c=mix(vec3(.16,.1,.38),vec3(1.,.5,.32),smoothstep(0.,.9,uy));${layers >= 1 ? 'c+=(1.-smoothstep(0.,.25,d2))*vec3(1.,.55,.25)*.9;' : ''}${layers >= 2 ? 'c=mix(c,vec3(1.,.93,.7),1.-smoothstep(.012,.018,d2));' : ''}${layers >= 3 ? 'c=mix(c,vec3(.07,.05,.12),smoothstep(.78,.8,uy));' : ''}return vec4(min(c,1.),1.);`;

const SH = {
  // two colours mixed over time: mix(a, b, t)
  mixTime: `float k=.5+.5*sin(t*1.1);return vec4(mix(${PINK},${MINT},k),1.);`,
  mixGrad: `return vec4(mix(${VIOLET},${PINK},uv.x),1.);`,
  mixFade: `float k=smoothstep(.0,1.,fract(t*.35));vec3 a=vec3(.2,.5,1.),b=vec3(1.,.5,.2);return vec4(mix(a,b,uv.x*.5+k*.5),1.);`,
  // a number line: a on the left, b on the right, t travelling between them
  line: `vec2 p=vec2(uv.x*uRes.x/uRes.y,uv.y);float W=uRes.x/uRes.y;float a=.14*W,b=.86*W;float k=.5+.5*sin(t*.9);float x=mix(a,b,k);vec3 c=${BG};float yy=abs(p.y-.5);c=mix(c,vec3(.3,.3,.4),step(yy,.006)*step(a,p.x)*step(p.x,b));c=mix(c,${VIOLET},step(yy,.013)*step(a,p.x)*step(p.x,x));c=mix(c,vec3(1.),smoothstep(.045,.04,length(p-vec2(a,.5))));c=mix(c,${MINT},smoothstep(.045,.04,length(p-vec2(b,.5))));c=mix(c,${PINK},smoothstep(.05,.044,length(p-vec2(x,.5))));return vec4(c,1.);`,
  // a plot of f(x) for x in -0.3 .. 1.3, with the square 0..1 behind it
  plot: (f, col = PINK, f2 = null, col2 = MINT) => `float x=uv.x*1.6-.3,y=uv.y*1.6-.3;vec3 c=${BG};float box=step(0.,x)*step(x,1.)*step(0.,y)*step(y,1.);c=mix(c,vec3(.15,.15,.21),box);c=mix(c,vec3(.3,.3,.4),step(abs(x),.006)+step(abs(y),.006)+step(abs(x-1.),.004)*step(0.,y)+step(abs(y-1.),.004)*step(0.,x));float fx=${f};c=mix(c,${col},smoothstep(.024,.014,abs(y-fx)));${f2 ? `float gx=${f2};c=mix(c,${col2},smoothstep(.024,.014,abs(y-gx)));` : ''}return vec4(c,1.);`,
  // a hard edge and a soft one
  edgeHard: 'float dx=(uv.x-.5)*uRes.x/uRes.y,dy=(1.-uv.y)-.5;float k=1.-step(.09,dx*dx+dy*dy);return vec4(vec3(1.,.5,.2)*k,1.);',
  edgeSoft: (a, b) => `float dx=(uv.x-.5)*uRes.x/uRes.y,dy=(1.-uv.y)-.5;float k=1.-smoothstep(${a},${b},dx*dx+dy*dy);return vec4(vec3(k,k*.6,k*.1),1.);`,
};

export default [
  /* the function everybody uses most: go from one value to another little by little (colour, position, light) */
  {
    id: 'intro',
    beats: { most: L('use the most', 'más usa'), mix: L('mix', 'mix'), little: L('little by little', 'poco a poco'), other: L('the GPU already comes', 'La GPU ya trae') },
    items: [
      { k: 'kicker', text: L('The most used function', 'La función más usada') },
      { k: 'big', cls: 's-mono s-accent', at: 'mix', fx: 'pop', text: 'mix(a, b, t)' },
      tiles([
        { frag: SH.mixTime, at: 'little', cap: L('<b>One color to another</b>', '<b>De un color a otro</b>') },
        { frag: SH.mixGrad, at: 'little+0.4', cap: L('<b>A gradient</b>', '<b>Un degradado</b>') },
        { frag: SH.mixFade, at: 'little+0.8', cap: L('<b>A fade</b>', '<b>Un fundido</b>') },
      ], 'little', { cols: 3, aspect: '4 / 3' }),
      { k: 'row', at: 'other', items: [
        { k: 'word', cls: 's-mono s-accent', text: 'mix', at: 'other' },
        { k: 'word', cls: 's-mono', text: 'clamp', at: 'other+0.4' },
        { k: 'word', cls: 's-mono', text: 'smoothstep', at: 'other+0.8' },
      ] },
    ],
  },
  /* Step 1: a + (b - a) * t, tried on paper with 10 and 20 and 0.3 */
  {
    id: 'mix',
    beats: { idea: L('The idea of mixing is this', 'La idea de mezclar es esta'), middle: L('exactly in the middle', 'justo en el medio'), formula: L('The formula is', 'La fórmula es'), paper: L('Try it with paper', 'Pruébala con papel'), thirty: L('30% of the way', 'Un 30 % del camino'), sky: L('a sky gradient', 'degradado de cielo'), blue: L('Notice the blue', 'Fíjate en el azul'), sunset: L('A sunset sky', 'Un cielo de atardecer') },
    items: [
      { k: 'kicker', text: L('Step 1 · mixing two numbers', 'Paso 1 · mezclar dos números') },
      { k: 'slot', items: [
        { k: 'gl', cls: 'w86', radius: 10, at: 'idea', out: 'formula', fx: 'fade', tiles: [{ frag: SH.line, aspect: '16 / 5', at: 'idea', cap: 'a ·········· t ·········· b' }] },
        { k: 'code', at: 'formula', out: 'sky', type: 'formula+0.2', cps: 40, code: MIX },
        { k: 'row', at: 'paper', out: 'sky', items: [
          { k: 'box', cls: 's-mono', text: 'a = 10', at: 'paper' },
          { k: 'box', cls: 's-mono', text: 'b = 20', at: 'paper+0.5' },
          { k: 'box', cls: 's-mono', text: 't = 0.3', at: 'paper+1' },
          { k: 'box', cls: 'accent s-mono', text: '= 13', at: 'thirty', fx: 'pop' },
        ] },
        win([{ frag: `float k=1.-uv.y;return vec4(mix(.1,1.,k),mix(.0,.55,k),mix(.6,.2,k),1.);`, at: 'sky' }], 'sky', { cls: 'window w50' }),
      ] },
    ],
  },
  /* Step 2: past 1 the formula does not stop; clamp holds it at the limit */
  {
    id: 'clamp',
    beats: { over: L('does not stop at', 'no se detiene en'), tool: L('That tool is called', 'Esa herramienta se llama'), less: L('less than the minimum', 'menor que el mínimo'), more: L('greater than the maximum', 'mayor que el máximo') },
    items: [
      { k: 'kicker', text: 'clamp' },
      { k: 'gl', cls: 'w60', radius: 10, at: 'over-6', fx: 'fade', tiles: [{ aspect: '16 / 10', modes: [{ at: 'over-6', frag: SH.plot('x') }, { at: 'tool', frag: SH.plot('x', PINK, 'clamp(x,0.,1.)') }], at: 'over-6' }] },
      { k: 'code', at: 'tool+0.5', type: 'tool+0.8', cps: 55, code: CLAMP, hl: [{ at: 'less', until: 'more', lines: [2] }, { at: 'more', lines: [3] }] },
    ],
  },
  /* Step 3: a hard edge vs a soft edge; smoothstep: ramp + S-curve; at a quarter of the way only 16% */
  {
    id: 'smooth',
    beats: { hard: L('makes hard edges', 'hace bordes duros'), job: L('That is the job of', 'Esa es la tarea de'), three: L('You give it three things', 'Le das tres cosas'), ramp: L('Up to here it is a', 'Hasta aquí es una'), s: L('an S-shaped letter', 'una letra S'), quarter: L('at a quarter of the way', 'a un cuarto del camino'), slow: L('slow start', 'arranque lento') },
    items: [
      { k: 'kicker', text: 'smoothstep' },
      tiles([
        { frag: SH.edgeHard, at: 'hard', cap: L('<b>if · hard edge</b>', '<b>if · borde duro</b>'), marks: [{ at: 'job-1', kind: 'x' }] },
        { frag: SH.edgeSoft('.02', '.12'), at: 'job', cap: L('<b>smoothstep · soft edge</b>', '<b>smoothstep · borde suave</b>'), marks: [{ at: 'job+1', kind: 'check' }] },
      ], 'hard', { cols: 2, aspect: '4 / 3' }),
      { k: 'gl', cls: 'w60', radius: 10, at: 'ramp', fx: 'fade', tiles: [{ aspect: '16 / 10', at: 'ramp', modes: [{ at: 'ramp', frag: SH.plot('clamp(x,0.,1.)') }, { at: 's', frag: SH.plot('clamp(x,0.,1.)', PINK, 'smoothstep(0.,1.,x)') }] }] },
      { k: 'text', at: 'quarter', text: L('A quarter of the way → <b>16 %</b> of the height', 'Un cuarto del camino → <b>16 %</b> de la altura') },
    ],
  },
  /* Step 4: a circle with a soft edge; the orange tint; widen / narrow the edge */
  {
    id: 'circle',
    beats: { middle: L('the two middle lines', 'las dos líneas del medio'), flip: L('flips it', 'lo da vuelta'), tint: L('tint the light orange', 'tiñen la luz de naranja'), compare: L('Compare it with the circle', 'Compara con el círculo'), sharp: L('almost sharp', 'casi afilado'), blur: L('the light blurs', 'la luz se difumina') },
    items: [
      { k: 'kicker', text: L('Step 4 · a soft circle', 'Paso 4 · un círculo suave') },
      { k: 'code', at: 0.2, type: 0.4, cps: 60, code: L(cs('Fragment', 'float d2 = dx * dx + dy * dy;\nfloat brightness = 1f - Smooth(0.04f, 0.09f, d2);\nreturn new vec4(brightness, brightness * 0.6f, brightness * 0.1f, 1f);'), cs('Fragment', 'float d2 = dx * dx + dy * dy;\nfloat brillo = 1f - Suavizar(0.04f, 0.09f, d2);\nreturn new vec4(brillo, brillo * 0.6f, brillo * 0.1f, 1f);')),
        hl: [{ at: 'middle', until: 'flip', lines: [1] }, { at: 'flip', until: 'tint', lines: [1] }, { at: 'tint', lines: [2] }] },
      win([{ modes: [{ at: 'middle', frag: SH.edgeSoft('.04', '.09') }, { at: 'compare', frag: SH.edgeHard }, { at: 'compare+2', frag: SH.edgeSoft('.04', '.09') }, { at: 'sharp', frag: SH.edgeSoft('.085', '.09') }, { at: 'blur', frag: SH.edgeSoft('.04', '.2') }] }], 'middle'),
    ],
  },
  /* Step 5: the sunset, one layer at a time */
  {
    id: 'sunset',
    beats: { sky: L('which is the sky', 'que es el cielo'), halo: L('Layer 1', 'Capa 1'), disc: L('Layer 2', 'Capa 2'), ground: L('Layer 3', 'Capa 3'), play: L('Play with it', 'Juega con él') },
    items: [
      { k: 'kicker', text: L('Step 5 · a complete sunset', 'Paso 5 · un atardecer completo') },
      win([{ modes: [{ at: 'sky-8', frag: SUN(0) }, { at: 'halo+3', frag: SUN(1) }, { at: 'disc+3', frag: SUN(2) }, { at: 'ground+3', frag: SUN(3) }, { at: 'play', frag: SUN(3, '.62+.08*sin(t*1.2)') }] }], 'sky-8', { cls: 'window w60' }),
      { k: 'row', at: 'sky-8', items: [
        { k: 'box', cls: 's-mono', text: L('sky', 'cielo'), sub: 'mix', at: 'sky-8' },
        { k: 'box', cls: 's-mono', text: L('halo', 'halo'), sub: '+', at: 'halo+1' },
        { k: 'box', cls: 's-mono', text: L('disc', 'disco'), sub: 'mix', at: 'disc+1' },
        { k: 'box', cls: 's-mono', text: L('ground', 'suelo'), sub: 'mix', at: 'ground+1' },
      ] },
    ],
  },
  {
    id: 'learned',
    dense: true,
    beats: { a: L('goes from', 'va de'), b: L('cuts a value', 'corta un valor'), c: L('slowly at the start', 'despacio al principio'), d: L('is an if with soft edges', 'es un if con bordes suaves'), e: L('built in layers', 'arma por capas'), f: L('In GLSL', 'En GLSL') },
    items: [
      { k: 'kicker', text: L('What you learned', 'Lo que aprendiste') },
      ...[['a', 'mix(a, b, t)', 'mix(a, b, t)'], ['b', 'clamp(x, min, max)', 'clamp(x, min, max)'], ['c', 'smoothstep(start, end, x)', 'smoothstep(desde, hasta, x)'], ['d', 'mix with t = 0 or 1 ≈ if', 'mix con t = 0 o 1 ≈ if'], ['e', 'a scene = layers', 'una escena = capas'], ['f', 'mix · clamp · smoothstep', 'mix · clamp · smoothstep']]
        .map(([b, en, es]) => ({ k: 'word', cls: 's-mono', at: b, fx: 'left', text: L(en, es), mark: { at: `${b}+0.4`, kind: 'check' } })),
    ],
  },
];

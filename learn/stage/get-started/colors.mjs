// Stage of "The colors" — motion graphics shown next to the text while the chapter is read aloud.
// Each scene starts at its `> [!SCENE] id` cue in content/<lang>/get-started/colors.md. Everything on the stage is a live shader
// (GLSL here, the same maths as the C# of the chapter), so it never repeats the screenshots of the article.

const L = (en, es) => ({ en, es });
const cs = (title, code) => ({ title, code, lang: 'csharp' });
const make = L('Make', 'Crear');
const VEC = (v) => L(cs('Fragment', `return Make.Vec4(${v}, 1f);`), cs('Fragment', `return Crear.Vec4(${v}, 1f);`));

const ENGINE_LOGO = { route: { kni: '/img/engines/kni.png', fna: '/img/engines/fna.png', godot: '/img/engines/godot.svg', default: '/img/engines/monogame.png' } };
const win = (tiles, at, extra = {}) => ({ k: 'gl', cls: 'window w50', title: '{{engine}}', logo: ENGINE_LOGO, at, fx: 'pop', radius: 10, tiles, ...extra });
const tiles = (arr, at, extra = {}) => ({ k: 'gl', cls: 'w86', gap: 2, radius: 10, at, fx: 'fade', tiles: arr, ...extra });

const ASPECT = 'vec2 p=(uv-.5)*vec2(uRes.x/uRes.y,1.);';
const BG = 'vec3(.1,.1,.14)';
const flat = (r, g, b) => `return vec4(${r},${g},${b},1.);`;
const SH = {
  shadow: `${ASPECT}float d=length(p-vec2(.08,-.04));float s=smoothstep(.34,.0,d);vec3 c=mix(vec3(.88,.82,.7),vec3(.18,.16,.2),s);float b=smoothstep(.12,.0,length(p-vec2(-.1,.08)));return vec4(c+b*.1,1.);`,
  fire: 'float y=1.-uv.y;float n=sin(uv.x*14.+t*3.)*.5+sin(uv.x*27.-t*5.)*.25;float f=clamp(y*1.5+n*.25*y-.2,0.,1.);return vec4(vec3(1.,.35+.6*f,.1+.5*f*f)*f*1.4,1.);',
  water: 'float w=sin(uv.x*16.+t*2.)*.03+sin(uv.x*31.-t*3.)*.015;float y=uv.y+w;return vec4(vec3(.05,.3+.35*y,.55+.4*y),1.);',
  fractal: 'vec2 c=vec2(-.7436,.1318)+(uv-.5)*vec2(uRes.x/uRes.y,1.)*2.8*exp(-.2*mod(t,22.));vec2 z=vec2(0.);float n=0.;for(int i=0;i<120;i++){z=vec2(z.x*z.x-z.y*z.y,2.*z.x*z.y)+c;if(dot(z,z)>4.)break;n++;}float k=n/120.;return vec4(n>=119.?vec3(0.):vec3(.1,.3,1.)*pow(k,.4)+vec3(.6,.8,1.)*pow(k,3.),1.);',
  // the light of one pixel of the screen: three small lights, red, green and blue, shining as much as the shader says
  subpixels: `vec2 g=vec2(22.,13.);vec2 id=floor(uv*g),f=fract(uv*g);vec3 want=.5+.5*sin(vec3(0.,2.1,4.2)+t*.9+id.x*.35+id.y*.5);float band=floor(f.x*3.);vec3 mask=vec3(float(band<.5),float(band>.5&&band<1.5),float(band>1.5));float lit=step(.1,f.y)*step(f.y,.92)*step(.12,fract(f.x*3.))*step(fract(f.x*3.),.88);return vec4(mask*want*lit+vec3(.05,.05,.08)*(1.-lit),1.);`,
  // red, green and blue lights that add up where they overlap
  venn: `${ASPECT}float s=.19+.015*sin(t*1.6);vec2 a=vec2(0.,.12+.012*sin(t*1.1)),b=vec2(-.11,-.08),c=vec2(.11,-.08);vec3 col=vec3(smoothstep(s,s-.006,length(p-a)),smoothstep(s,s-.006,length(p-b)),smoothstep(s,s-.006,length(p-c)));return vec4(col.xzy*vec3(1.,1.,1.),1.);`,
  vennOff: `${ASPECT}float s=.19;vec2 a=vec2(0.,.12),b=vec2(-.11,-.08),c=vec2(.11,-.08);vec3 col=vec3(smoothstep(s,s-.006,length(p-a)),smoothstep(s,s-.006,length(p-b)),smoothstep(s,s-.006,length(p-c)));return vec4(col,1.);`,
  // the ramp of grays: left dark, right light
  gray: 'float g=uv.x;return vec4(vec3(g),1.);',
  grayBars: 'float g=floor(uv.x*8.)/7.;return vec4(vec3(g),1.);',
  // a pulsing multiplier on orange: 1, then half, then 0
  dim: (k) => flat(`${k}`, `.5*${k}`, '0.'),
  checker: (a) => `vec2 g=floor(vec2(uv.x*uRes.x/uRes.y,uv.y)*8.);float k=mod(g.x+g.y,2.);vec3 bg=mix(vec3(.16,.16,.21),vec3(.26,.26,.32),k);vec3 fg=vec3(1.,.48,.7);float box=step(.15,uv.x)*step(uv.x,.85)*step(.15,uv.y)*step(uv.y,.85);return vec4(mix(bg,fg,box*(${a})),1.);`,
  cycle: 'return vec4(.5+.5*sin(t+vec3(0.,2.1,4.2)),1.);',
};

export default [
  /* Everything a shader does ends in one thing: a colour. Four different looks, and all of them are "return a colour" */
  {
    id: 'intro',
    beats: { shadow: L('A shadow', 'Una sombra'), fractal: L('a fractal', 'un fractal'), pixel: L('this pixel goes', 'este píxel va de'), paints: L('the GPU paints it', 'la GPU lo pinta') },
    items: [
      { k: 'kicker', text: L('What every pixel shader ends in', 'En lo que termina todo shader de píxeles') },
      tiles([
        { frag: SH.shadow, at: 'shadow', cap: `<b>${'Shadow'}</b>` },
        { frag: SH.fire, at: 'shadow+0.6', cap: '<b>Fire</b>' },
        { frag: SH.water, at: 'shadow+1.2', cap: '<b>Water</b>' },
        { frag: SH.fractal, at: 'fractal', cap: '<b>Fractal</b>' },
      ], 'shadow', { cols: 4 }),
      { k: 'big', cls: 's-mono s-accent', at: 'pixel', text: L('return color;', 'return color;') },
      { k: 'text', at: 'paints', text: L('This pixel is <b>this</b> color, the GPU paints it', 'Este píxel va de <b>este</b> color, la GPU lo pinta') },
    ],
  },
  /* Step 1: the template shader returns four zeros; the window is black. Then: the four numbers and their job */
  {
    id: 'first',
    beats: { black: L('The window comes out black', 'La ventana sale negra'), four: L('Those four numbers are the color', 'Esos cuatro números son el color'), job: L('Each one has a job', 'Cada uno tiene un trabajo') },
    items: [
      { k: 'kicker', text: L('Step 1 · your first color', 'Paso 1 · tu primer color') },
      { k: 'code', at: 0.2, type: 0.4, cps: 50, code: VEC('0f, 0f, 0f'), hl: [{ at: 'four', lines: [1] }] },
      win([{ frag: flat('0.', '0.', '0.'), at: 'black' }], 'black'),
      { k: 'row', at: 'job', items: [
        { k: 'box', cls: 's-bad s-mono', text: 'X', sub: L('Red', 'Rojo'), at: 'job' },
        { k: 'box', cls: 's-ok s-mono', text: 'Y', sub: L('Green', 'Verde'), at: 'job+0.5' },
        { k: 'box', cls: 's-gpu s-mono', text: 'Z', sub: L('Blue', 'Azul'), at: 'job+1' },
        { k: 'box', cls: 's-mono', text: 'W', sub: L('Alpha', 'Alfa'), at: 'job+1.5' },
      ] },
    ],
  },
  /* RGB: the screen is made of tiny pixels and each one has three lights; the shader decides how bright each one shines */
  {
    id: 'channels',
    beats: { rgb: L('RGB', 'RGB'), pixels: L('Your screen is made of tiny pixels', 'Tu pantalla está hecha de píxeles diminutos'), three: L('three lights', 'tres luces'), decides: L('The shader decides', 'El shader decide') },
    items: [
      { k: 'kicker', text: L('Red · green · blue', 'Rojo · verde · azul') },
      { k: 'gl', cls: 'w86', radius: 12, at: 'pixels', fx: 'fade', tiles: [{ frag: SH.subpixels, aspect: '16 / 9', at: 'pixels', cap: L('<b>Your screen, up close</b>', '<b>Tu pantalla, de cerca</b>') }] },
      { k: 'row', at: 'three', items: [
        { k: 'word', cls: 's-mono s-bad', text: L('R', 'R'), at: 'three', fx: 'pop' },
        { k: 'word', cls: 's-mono s-ok', text: 'G', at: 'three+0.3', fx: 'pop' },
        { k: 'word', cls: 's-mono s-gpu', text: 'B', at: 'three+0.6', fx: 'pop' },
      ] },
      { k: 'text', at: 'decides', text: L('The shader decides <b>how bright</b> each one shines', 'El shader decide <b>cuánto brilla</b> cada una') },
    ],
  },
  /* Step 2: turn on one light at a time; the window follows */
  {
    id: 'light',
    beats: { change: L('Change the color to this', 'Cambia el color por esto'), red: L('Red at the maximum', 'Rojo al máximo'), pure: L('It is pure red', 'Es rojo puro'), you: L('Now do it yourself', 'Ahora hazlo tú'), green: L('pure green', 'verde puro'), blue: L('pure blue', 'azul puro') },
    items: [
      { k: 'kicker', text: L('Step 2 · turn on a light', 'Paso 2 · enciende una luz') },
      { k: 'slot', items: [
        { k: 'code', at: 'change', out: 'you', type: 'change+0.2', cps: 50, code: VEC('1f, 0f, 0f'), hl: [{ at: 'red', lines: [1] }] },
        { k: 'code', at: 'you', out: 'green+1', code: VEC('0f, 1f, 0f') },
        { k: 'code', at: 'green+1', code: VEC('0f, 0f, 1f') },
      ] },
      win([{ modes: [{ at: 'change', frag: flat('1.', '0.', '0.') }, { at: 'you', frag: flat('0.', '1.', '0.') }, { at: 'green+1', frag: flat('0.', '0.', '1.') }] }], 'change'),
    ],
  },
  /* Step 3: light adds up (not paint): red + green = yellow, all three = white, none = black */
  {
    id: 'mix',
    beats: { two: L('turn on two lights', 'enciende dos luces'), yellow: L('Red plus green gives', 'Rojo más verde da'), paint: L('red and green paint make brown', 'rojo con verde en pintura da marrón'), light: L('you are mixing light', 'mezclas luz'), white: L('you get white', 'sale blanco'), off: L('all three off', 'las tres apagadas'), recipes: L('Try these recipes', 'Prueba estas recetas') },
    items: [
      { k: 'kicker', text: L('Step 3 · mixing lights', 'Paso 3 · mezcla luces') },
      { k: 'slot', items: [
        { k: 'code', at: 'two', out: 'paint', type: 'two+0.2', cps: 50, code: VEC('1f, 1f, 0f') },
        { k: 'row', at: 'paint', out: 'light', items: [
          { k: 'box', cls: 's-bad s-mono', text: L('red + green', 'rojo + verde'), sub: L('paint', 'pintura'), at: 'paint' },
          { k: 'arrow', at: 'paint+0.4' },
          { k: 'box', cls: 's-mono', text: L('brown', 'marrón'), sub: '✗', at: 'paint+0.8' },
        ] },
        { k: 'row', at: 'light', out: 'recipes', items: [
          { k: 'box', cls: 'accent s-mono', text: L('red + green', 'rojo + verde'), sub: L('light', 'luz'), at: 'light' },
          { k: 'arrow', at: 'light+0.4' },
          { k: 'box', cls: 's-ok s-mono', text: L('yellow', 'amarillo'), sub: '✓', at: 'light+0.8' },
        ] },
        tiles([
          { frag: flat('0.', '0.', '0.'), at: 'recipes', cap: L('<b>Black</b>', '<b>Negro</b>') },
          { frag: flat('1.', '1.', '1.'), at: 'recipes+0.2', cap: L('<b>White</b>', '<b>Blanco</b>') },
          { frag: flat('1.', '1.', '0.'), at: 'recipes+0.4', cap: L('<b>Yellow</b>', '<b>Amarillo</b>') },
          { frag: flat('0.', '1.', '1.'), at: 'recipes+0.6', cap: '<b>Cyan</b>' },
          { frag: flat('1.', '0.', '1.'), at: 'recipes+0.8', cap: '<b>Magenta</b>' },
          { frag: flat('1.', '.5', '0.'), at: 'recipes+1', cap: L('<b>Orange</b>', '<b>Naranja</b>') },
        ], 'recipes', { cols: 6, aspect: '1 / 1' }),
      ] },
      { k: 'gl', cls: 'w50', radius: 12, at: 'yellow', out: 'recipes', fx: 'pop', tiles: [{ frag: SH.venn, aspect: '1 / 1', at: 'yellow' }] },
    ],
  },
  /* the trick with grays: three equal lights, the bigger the lighter */
  {
    id: 'grays',
    beats: { trick: L('There is a trick with grays', 'Hay un truco con los grises'), same: L('have the same value', 'valen lo mismo'), higher: L('The higher the number', 'Cuanto mayor el número'), medium: L('That is a medium gray', 'Ese es un gris medio'), almost: L('almost black', 'casi negro'), white: L('almost white', 'casi blanco') },
    items: [
      { k: 'kicker', text: L('Grays', 'Grises') },
      { k: 'code', at: 'same', type: 'same+0.2', cps: 50, code: VEC('0.5f, 0.5f, 0.5f') },
      tiles([
        { frag: flat('.2', '.2', '.2'), at: 'almost', cap: '<b>0.2</b>' },
        { frag: flat('.5', '.5', '.5'), at: 'medium', cap: '<b>0.5</b>' },
        { frag: flat('.9', '.9', '.9'), at: 'white', cap: '<b>0.9</b>' },
      ], 'higher', { cols: 3, aspect: '16 / 9' }),
      { k: 'gl', cls: 'w86', radius: 10, at: 'higher', fx: 'fade', tiles: [{ frag: SH.gray, aspect: '16 / 2', at: 'higher' }] },
    ],
  },
  /* why 0 to 1: #FF8000 divided by 255, and the multiplications that need it */
  {
    id: 'range',
    beats: { hex: L('or a code like', 'o un código como'), divide: L('divide by 255', 'divide entre 255'), half: L('Multiplying a color by', 'Multiplicar un color por'), off: L('turns it off', 'lo apaga'), same: L('does not change it', 'no lo cambia') },
    items: [
      { k: 'kicker', text: L('0 to 255 → 0 to 1', 'De 0-255 a 0-1') },
      { k: 'row', at: 'hex', items: [
        { k: 'box', cls: 's-mono', text: '#FF8000', at: 'hex' },
        { k: 'arrow', at: 'divide' },
        { k: 'box', cls: 's-mono', text: '255,128,0', sub: '÷ 255', at: 'divide' },
        { k: 'arrow', at: 'divide+0.8' },
        { k: 'box', cls: 'accent s-mono', text: '1,0.5,0', at: 'divide+1.2' },
      ] },
      tiles([
        { frag: SH.dim('1.'), at: 'half', cap: '<b>× 1</b>' },
        { frag: SH.dim('.5'), at: 'half+0.5', cap: '<b>× 0.5</b>' },
        { frag: SH.dim('0.'), at: 'off', cap: '<b>× 0</b>' },
      ], 'half', { cols: 3, aspect: '16 / 9' }),
    ],
  },
  /* Step 4: an impossible colour; the GPU clips it to the limit and you get the same orange */
  {
    id: 'clip',
    beats: { impossible: L('Write an impossible color', 'Escribe un color imposible'), double: L('double the maximum', 'el doble del máximo'), less: L('less than nothing', 'menos que nada'), same: L('the same orange', 'el mismo naranja'), clips: L('clips the values', 'recorta los valores') },
    items: [
      { k: 'kicker', text: L('Step 4 · going over', 'Paso 4 · pasarse') },
      { k: 'code', at: 'impossible', type: 'impossible+0.2', cps: 40, code: VEC('2f, 0.5f, -3f'), hl: [{ at: 'double', until: 'less', lines: [1] }, { at: 'less', lines: [1] }], tags: [{ at: 'double', line: 1, text: L('→ 1', '→ 1') }, { at: 'less+0.4', line: 1, text: L('→ 0', '→ 0') }] },
      win([{ frag: flat('1.', '.5', '0.'), at: 'same' }], 'same'),
      { k: 'row', at: 'clips', items: [
        { k: 'box', cls: 's-bad s-mono', text: '2 → 1', at: 'clips' },
        { k: 'box', cls: 's-ok s-mono', text: '0.5 → 0.5', at: 'clips+0.4' },
        { k: 'box', cls: 's-gpu s-mono', text: '-3 → 0', at: 'clips+0.8' },
      ] },
    ],
  },
  /* alpha: how opaque, glass, smoke; leave it at 1 */
  {
    id: 'alpha',
    beats: { opaque: L('how opaque', 'qué tan opaco'), glass: L('glass', 'cristal'), safe: L('the safe value', 'el valor seguro') },
    items: [
      { k: 'kicker', text: L('The fourth number · alpha', 'El cuarto número · alfa') },
      tiles([
        { frag: SH.checker('1.'), at: 'opaque', cap: '<b>1</b>' },
        { frag: SH.checker('.5'), at: 'opaque+0.8', cap: '<b>0.5</b>' },
        { frag: SH.checker('0.'), at: 'glass', cap: '<b>0</b>' },
      ], 'opaque', { cols: 3, aspect: '16 / 10' }),
      { k: 'text', at: 'safe', text: L('Leave it at <b>1f</b>', 'Déjalo en <b>1f</b>'), mark: { at: 'safe+0.5', kind: 'check' } },
    ],
  },
  /* the challenge: dark green, pink, yours */
  {
    id: 'challenge',
    beats: { forest: L('dark green', 'verde oscuro'), pink: L('pink', 'rosa'), yours: L('Your favorite color', 'El color que más te guste') },
    items: [
      { k: 'kicker', text: L('A challenge', 'Un reto') },
      tiles([
        { frag: flat('.05', '.35', '.1'), at: 'forest', cap: L('<b>Dark green</b>', '<b>Verde oscuro</b>') },
        { frag: flat('1.', '.5', '.7'), at: 'pink', cap: L('<b>Pink</b>', '<b>Rosa</b>') },
        { frag: SH.cycle, at: 'yours', cap: L('<b>Yours</b>', '<b>El tuyo</b>') },
      ], 'forest', { cols: 3, aspect: '16 / 10' }),
    ],
  },
  {
    id: 'learned',
    dense: true,
    beats: { a: L('A color is a', 'Un color es un'), b: L('The numbers go from', 'Los números van de'), c: L('Lights add', 'Las luces se'), d: L('go over', 'te pasas de'), e: L('So far every pixel', 'Hasta ahora todos los píxeles') },
    items: [
      { k: 'kicker', text: L('What you learned', 'Lo que aprendiste') },
      ...[['a', 'vec4 = R G B A', 'vec4 = R G B A'], ['b', '0 … 1  (÷ 255)', '0 … 1  (÷ 255)'], ['c', 'red + green = yellow', 'rojo + verde = amarillo'], ['d', 'over 1 → clipped to 1', 'más de 1 → se recorta a 1'], ['e', L('Next: where is each pixel?', '¿Dónde está cada píxel?'), null]]
        .map(([b, en, es]) => ({ k: 'word', cls: 's-mono', at: b, fx: 'left', text: es === null ? en : L(en, es), mark: { at: `${b}+0.4`, kind: 'check' } })),
    ],
  },
];

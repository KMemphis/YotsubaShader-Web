// Stage of "Shader 5: a photo underwater" — motion graphics shown next to the text while the chapter is read aloud.
// Each scene starts at its `> [!SCENE] id` cue in content/<lang>/get-started/underwater.md. The images are the real clownfish photo
// read through live shaders: shifted, rippled, tinted and darkened at the edges, one piece at a time.

const L = (en, es) => ({ en, es });
const cs = (title, code) => ({ title, code, lang: 'csharp' });
const FISH = '/assets/get-started/pez.jpg';
const ENGINE_LOGO = { route: { kni: '/img/engines/kni.png', fna: '/img/engines/fna.png', godot: '/img/engines/godot.svg', raylib: '/img/engines/raylib.png', silknet: '/img/engines/silknet.svg', default: '/img/engines/monogame.png' } };
const win = (tiles, at, extra = {}) => ({ k: 'gl', cls: 'window w50', title: '{{engine}}', logo: ENGINE_LOGO, tex: FISH, at, fx: 'pop', radius: 10, tiles, ...extra });
const tiles = (arr, at, extra = {}) => ({ k: 'gl', cls: 'w86', gap: 2, radius: 10, tex: FISH, at, fx: 'fade', tiles: arr, ...extra });
const BG = 'vec3(.1,.1,.14)';
const T = (frag, extra = {}) => ({ frag, tex: true, aspect: '4 / 3', ...extra });

const FIELD = L(cs('MyShaders/Underwater.cs', `[layout(0, 1)]
public sampler2D Photo;`), cs('MisShaders/BajoElAgua.cs', `[layout(0, 1)]
public sampler2D Foto;`));
const READ = L(cs('Fragment', 'vec4 photo = texture(Photo, new vec2(u, v));'), cs('Fragment', 'vec4 foto = texture(Foto, new vec2(u, v));'));
const ASIS = L(cs('Fragment', 'vec4 photo = texture(Photo, new vec2(pixel.Uv.X, pixel.Uv.Y));'), cs('Fragment', 'vec4 foto = texture(Foto, new vec2(pixel.Uv.X, pixel.Uv.Y));'));
const INTRINSIC = cs('MyShaders/Underwater.cs', 'using static YotsubaShader.GlslSyntax.Methods.Intrinsic;');
const WAVE = L(cs('Fragment', `float u = pixel.Uv.X
    + sin(pixel.Uv.Y * 25f + t * 2f) * 0.012f;
float v = pixel.Uv.Y
    + sin(pixel.Uv.X * 20f + t * 1.5f) * 0.012f;

vec4 photo = texture(Photo, new vec2(u, v));`), cs('Fragment', `float u = pixel.Uv.X
    + sin(pixel.Uv.Y * 25f + t * 2f) * 0.012f;
float v = pixel.Uv.Y
    + sin(pixel.Uv.X * 20f + t * 1.5f) * 0.012f;

vec4 foto = texture(Foto, new vec2(u, v));`));
const TINT = L(cs('Fragment', `vec3 original = new vec3(photo.X, photo.Y, photo.Z);
vec3 seaBlue = new vec3(photo.X * 0.2f,
    photo.Y * 0.7f, photo.Z * 1f + 0.1f);
vec3 color = mix(original, seaBlue, 0.6f);`), cs('Fragment', `vec3 original = new vec3(foto.X, foto.Y, foto.Z);
vec3 azulMar = new vec3(foto.X * 0.2f,
    foto.Y * 0.7f, foto.Z * 1f + 0.1f);
vec3 color = mix(original, azulMar, 0.6f);`));
const VIGNETTE = L(cs('MyShaders/Underwater.cs', `public static float Vignette(float u, float v)
{
    float x = u * 2f - 1f;
    float y = v * 2f - 1f;
    float distance = sqrt(x * x + y * y);
    return 1f - smoothstep(0.5f, 1.4f, distance);
}`), cs('MisShaders/BajoElAgua.cs', `public static float Vineta(float u, float v)
{
    float x = u * 2f - 1f;
    float y = v * 2f - 1f;
    float distancia = sqrt(x * x + y * y);
    return 1f - smoothstep(0.5f, 1.4f, distancia);
}`));
const SHADE = L(cs('Fragment', `float shade = Vignette(pixel.Uv.X, pixel.Uv.Y);

return new vec4(color.X * shade, color.Y * shade, color.Z * shade, 1f);`), cs('Fragment', `float sombra = Vineta(pixel.Uv.X, pixel.Uv.Y);

return new vec4(color.X * sombra, color.Y * sombra, color.Z * sombra, 1f);`));

// shader pieces. q = where the pixel reads from; amp = the ripple size
const RIP = (amp = '.012') => `vec2 q=uv+vec2(sin(uv.y*25.+t*2.),sin(uv.x*20.+t*1.5))*${amp};`;
const TINTED = 'vec3 o=c;vec3 sb=vec3(o.r*.2,o.g*.7,o.b+.1);c=mix(o,sb,.6);';
const VIG = 'float x=uv.x*2.-1.,y=uv.y*2.-1.;float vg=1.-smoothstep(.5,1.4,sqrt(x*x+y*y));';
const SH = {
  photo: 'return vec4(texture(uTex,uv).rgb,1.);',
  right: 'return vec4(texture(uTex,uv+vec2(.06,0.)).rgb,1.);',
  rows: 'return vec4(texture(uTex,uv+vec2(.05*sin(uv.y*25.),0.)).rgb,1.);',
  ripple: `${RIP('.02')}return vec4(texture(uTex,q).rgb,1.);`,
  water: `${RIP()}vec3 c=texture(uTex,q).rgb;${TINTED}${VIG}return vec4(c*vg,1.);`,
  waveOnly: `${RIP()}return vec4(texture(uTex,q).rgb,1.);`,
  waveBig: `${RIP('.05')}return vec4(texture(uTex,q).rgb,1.);`,
  waveGray: `${RIP()}vec3 c=texture(uTex,q).rgb;float g=(c.r+c.g+c.b)/3.;return vec4(vec3(g),1.);`,
  waterNoTint: `${RIP()}vec3 c=texture(uTex,q).rgb;${VIG}return vec4(c*vg,1.);`,
  tintOnly: `vec3 c=texture(uTex,uv).rgb;${TINTED}return vec4(c,1.);`,
  blueFull: 'vec3 o=texture(uTex,uv).rgb;return vec4(vec3(o.r*.2,o.g*.7,o.b+.1),1.);',
  vigOnly: `${VIG}return vec4(vec3(vg),1.);`,
  vigPhoto: `${VIG}return vec4(texture(uTex,uv).rgb*vg,1.);`,
  uvmap: 'return vec4(uv.x,uv.y,0.,1.);',
  // smoothstep(.5,1.4,d): the curve and its flipped twin, x axis = distance 0..1.6
  step: `float x=uv.x*1.6,y=uv.y;float s=smoothstep(.5,1.4,x);vec3 c=${BG};c=mix(c,vec3(.3,.3,.4),step(y,.01)+step(abs(x-.5),.006)+step(abs(x-1.4),.006));c=mix(c,vec3(.38,.94,.82),smoothstep(.02,.008,abs(y-s*.9-.04)));c=mix(c,vec3(1.,.48,.7),smoothstep(.02,.008,abs(y-(1.-s)*.9-.04)));return vec4(c,1.);`,
};

export default [
  /* the photo and the result; what you already know + the only new thing */
  {
    id: 'intro',
    beats: { prev: L('made up the color', 'inventaban el color'), image: L('the color comes from an image', 'el color sale de una imagen'), take: L('You will take this photo', 'Vas a tomar esta foto'), look: L('look like this', 'se vea así'), all: L('comes together', 'se junta todo'), news: L('The only new thing', 'Lo único nuevo') },
    items: [
      { k: 'kicker', text: L('Shader 5 · a photo underwater', 'Shader 5 · una foto bajo el agua') },
      { k: 'row', at: 'prev', out: 'take', items: [
        { k: 'box', cls: 's-mono', text: 'x · y · sin', sub: L('invented colors', 'colores inventados'), at: 'prev' },
        { k: 'arrow', at: 'image-0.5' },
        { k: 'box', cls: 'accent s-mono', text: L('an image', 'una imagen'), sub: 'texture', at: 'image' },
      ] },
      tiles([T(SH.photo, { at: 'take', cap: L('<b>The photo</b>', '<b>La foto</b>') }), T(SH.water, { at: 'look', cap: L('<b>Seen through water</b>', '<b>Vista a través del agua</b>') })], 'take', { cols: 2 }),
      { k: 'row', at: 'all', items: ['Uv', L('functions', 'funciones'), 'sin', 'mix', L('time', 'tiempo')].map((w, i) => ({ k: 'box', cls: 's-mono', text: w, at: `all+${(i * 0.3).toFixed(1)}`, mark: { at: 'news', kind: 'check' } })) },
      { k: 'word', cls: 's-mono s-accent', text: 'texture()', at: 'news', fx: 'pop' },
    ],
  },
  /* a texture is a field with an address; slot 0 is the clock, slot 1 the photo */
  {
    id: 'texture',
    beats: { called: L('is called a texture', 'se le llama textura'), addr: L('with its address', 'con su dirección'), sampler: L('is the type', 'es el tipo'), addr2: L('is its address', 'es su dirección'), taken: L('already taken by the clock', 'ya lo ocupa el reloj'), prog: L('Your program is the one', 'Tu programa es quien'), same: L('just as it did with the clock', 'igual que hacía con el reloj') },
    items: [
      { k: 'kicker', text: L('Texture', 'Textura') },
      { k: 'code', at: 'addr', type: 'addr+0.2', cps: 35, code: FIELD, hl: [{ at: 'sampler', until: 'addr2', lines: [1] }, { at: 'addr2', lines: [0] }] },
      { k: 'row', at: 'addr2', items: [
        { k: 'box', cls: 's-mono', text: '(0, 0)', sub: L('the clock', 'el reloj'), at: 'taken' },
        { k: 'box', cls: 'accent s-mono', text: '(0, 1)', sub: L('the photo', 'la foto'), at: 'addr2' },
      ] },
      { k: 'row', at: 'prog', items: [
        { k: 'box', cls: 's-mono', text: L('Your program', 'Tu programa'), at: 'prog' },
        { k: 'arrow', at: 'prog+0.6' },
        { k: 'box', cls: 'accent s-mono', text: '(0, 1)', sub: L('the photo', 'la foto'), at: 'prog+0.9' },
      ] },
    ],
  },
  /* texture(photo, point): the point is Uv, so the photo comes out as it is */
  {
    id: 'read',
    beats: { fn: L('use the texture function', 'se usa la función texture'), ret: L('returns the color at that point', 'te devuelve el color'), range: L('from 0 to 1', 'de 0 a 1'), same: L('exactly the same as', 'exactamente lo mismo que'), asis: L('as is, unchanged', 'tal cual'), intr: L('in another one called', 'en otra llamada'), using: L('another using static', 'otro using static') },
    items: [
      { k: 'kicker', text: 'texture' },
      { k: 'code', at: 'fn', out: 'same', type: 'fn+0.3', cps: 40, code: READ, hl: [{ at: 'ret', lines: [0] }] },
      tiles([
        T(SH.uvmap, { at: 'range', cap: L('<b>Uv</b> · 0 → 1', '<b>Uv</b> · 0 → 1') }),
        T(SH.photo, { at: 'same+1', cap: L('<b>the photo</b> · same coordinates', '<b>la foto</b> · mismas coordenadas') }),
      ], 'range', { cols: 2 }),
      { k: 'code', at: 'asis', out: 'intr', type: 'asis+0.3', cps: 45, code: ASIS },
      { k: 'code', at: 'using', type: 'using+0.3', cps: 45, code: INTRINSIC, hl: [{ at: 'using', lines: [0] }] },
    ],
  },
  /* the trick: read a little to the side; each row a different amount; a wave; moving */
  {
    id: 'trick',
    beats: { nobody: L('Nobody forces you', 'Nadie te obliga'), side: L('a little to the side', 'un poquito al lado'), right: L('a little to the right', 'un poco a la derecha'), diff: L('a different amount', 'una cantidad distinta'), wave: L('follows a wave', 'sigue una ola'), first: L('Look at the first line', 'Mira la primera línea'), p1: L('is the point where the pixel would normally read', 'es el punto donde le tocaría leer'), p2: L('is a wave that depends on the height', 'es una ola que depende de la altura'), p3: L('makes the wave very small', 'hace la ola muy pequeña'), p4: L('is the trick from the previous chapter', 'es el truco del capítulo anterior'), second: L('The second line', 'La segunda línea'), nomove: L('did not move', 'no se movió'), changed: L('which point each pixel reads from', 'de qué punto lee') },
    items: [
      { k: 'kicker', text: L('The trick', 'El truco') },
      tiles([T(SH.photo, { modes: [{ at: 'nobody', frag: SH.photo }, { at: 'right', frag: SH.right }, { at: 'diff', frag: SH.rows }, { at: 'wave', frag: SH.ripple }], at: 'nobody', cap: L('<b>Where each pixel reads</b>', '<b>De dónde lee cada píxel</b>') })], 'nobody', { cols: 1, cls: 'w60' }),
      { k: 'code', at: 'first', out: 'nomove', type: 'first+0.3', cps: 60, code: WAVE, hl: [{ at: 'p1', until: 'p2', lines: [0] }, { at: 'p2', until: 'p3', lines: [1] }, { at: 'p3', until: 'p4', lines: [1] }, { at: 'p4', until: 'second', lines: [1] }, { at: 'second', lines: [2, 3] }] },
      { k: 'text', at: 'changed', text: L('The photo <b>did not move</b> · the pixels read from another place', 'La foto <b>no se movió</b> · los píxeles leen de otro sitio') },
    ],
  },
  /* tint: water dims red; 60% blue version, 40% original */
  {
    id: 'tint',
    beats: { dims: L('water dims the red', 'el agua apaga el rojo'), lower: L('lower the red a lot', 'bajar mucho el rojo'), channels: L('are the red', 'son el rojo'), sea: L('is that same color', 'es ese mismo color'), mix: L('The final mix', 'El mix final'), fish: L('the fish is still orange', 'el pez sigue siendo naranja'), deeper: L('deeper water', 'agua más profunda') },
    items: [
      { k: 'kicker', text: L('Tinting it blue', 'Teñir de azul') },
      tiles([
        T(SH.photo, { at: 'dims', cap: L('<b>original</b>', '<b>original</b>') }),
        T(SH.blueFull, { at: 'sea', cap: L('<b>sea blue</b> · 100 %', '<b>azul mar</b> · 100 %') }),
        T(SH.tintOnly, { at: 'mix', cap: L('<b>60 %</b> blue + 40 % original', '<b>60 %</b> azul + 40 % original') }),
      ], 'dims', { cols: 3 }),
      { k: 'code', at: 'lower', out: 'mix', type: 'lower+0.3', cps: 55, code: TINT, hl: [{ at: 'channels', until: 'sea', lines: [0] }, { at: 'sea', lines: [1, 2] }] },
      { k: 'row', at: 'mix', items: [
        { k: 'box', cls: 's-mono', text: L('red', 'rojo'), sub: '× 0.2', at: 'lower' },
        { k: 'box', cls: 's-mono', text: L('green', 'verde'), sub: '× 0.7', at: 'lower+0.4' },
        { k: 'box', cls: 'accent s-mono', text: L('blue', 'azul'), sub: '× 1', at: 'lower+0.8' },
      ] },
      { k: 'text', at: 'deeper', text: L('Raise the <b>0.6</b> for deeper water', 'Sube el <b>0.6</b> para agua más profunda') },
    ],
  },
  /* vignette: smoothstep, flipped, multiplied by the photo */
  {
    id: 'vignette',
    beats: { last: L('The last touch', 'El último toque'), name: L('a vignette', 'viñeta'), smooth: L('A new function', 'Una función nueva'), rises: L('rises from 0 to 1 smoothly', 'sube de 0 a 1 con suavidad'), here: L('In this case', 'En este caso'), flip: L('we flip it', 'le damos la vuelta'), alone: L('on its own', 'sola'), mult: L('you multiply the color', 'Al multiplicar'), dark: L('is how you darken it', 'es la forma de oscurecerlo'), full: L('The complete shader', 'El shader completo') },
    items: [
      { k: 'kicker', text: L('Darkening the edges', 'Oscurecer los bordes') },
      { k: 'code', at: 'last', out: 'smooth', type: 'last+0.4', cps: 45, code: VIGNETTE, hl: [{ at: 'flip', lines: [5] }, { at: 'smooth', lines: [5] }] },
      tiles([
        T(SH.step, { at: 'smooth', cap: L('<b>smoothstep</b> · and flipped', '<b>smoothstep</b> · y al revés') }),
        T(SH.vigOnly, { at: 'alone', cap: L('<b>vignette</b> alone', '<b>viñeta</b> sola') }),
        T(SH.vigPhoto, { at: 'mult', cap: L('<b>photo × vignette</b>', '<b>foto × viñeta</b>') }),
      ], 'smooth', { cols: 3 }),
      { k: 'code', at: 'mult', type: 'mult+0.3', cps: 50, code: SHADE, hl: [{ at: 'dark', lines: [2] }] },
    ],
  },
  /* shared clock; then (Godot route) the long Godot text runs over the finished result */
  {
    id: 'shared',
    beats: { again: L('is not declared again', 'no se vuelve a declarar'), two: L('Two shaders can share', 'Dos shaders pueden compartir'), both: L('the same clock to both', 'el mismo reloj a los dos') },
    items: [
      { k: 'kicker', text: L('One clock for two shaders', 'Un reloj para dos shaders') },
      { k: 'row', at: 'two', items: [
        { k: 'box', cls: 's-mono', text: L('Your program', 'Tu programa'), at: 'two' },
        { k: 'arrow', at: 'two+0.5' },
        { k: 'box', cls: 'accent s-mono', text: L('Clock', 'Reloj'), sub: 'Seconds', at: 'again' },
        { k: 'arrow', at: 'both-0.5' },
        { k: 'box', cls: 's-mono', text: 'Plasma · Underwater', at: 'both' },
      ] },
      win([{ frag: SH.water, tex: true, aspect: '16 / 10' }], 'both', { cls: 'window w60' }),
    ],
  },
  /* the ten lines and where each comes from; then the pieces of every game effect */
  {
    id: 'far',
    beats: { read: L('Read the', 'Lee el método'), ten: L('ten lines of calculations', 'diez líneas de cuentas'), each: L('each one is something you learned', 'cada una es algo que aprendiste'), almost: L('Almost every effect', 'Casi todos los efectos'), pieces: L('reading an image', 'leer una imagen') },
    items: [
      { k: 'kicker', text: L('Look how far you have come', 'Mira lo lejos que llegaste') },
      { k: 'row', at: 'ten', out: 'almost', items: [
        { k: 'box', cls: 's-mono', text: 'pixel.Uv.X · new vec4', sub: L('Shader 1', 'Shader 1'), at: 'each' },
        { k: 'box', cls: 's-mono', text: 'Vignette()', sub: L('Shader 2', 'Shader 2'), at: 'each+1' },
        { k: 'box', cls: 's-mono', text: 'sqrt · mix', sub: L('Shader 3', 'Shader 3'), at: 'each+2' },
        { k: 'box', cls: 's-mono', text: 'Time.Seconds · sin', sub: L('Shader 4', 'Shader 4'), at: 'each+3' },
        { k: 'box', cls: 'accent s-mono', text: 'texture(Photo, …)', sub: L('This chapter', 'Este capítulo'), at: 'each+4' },
      ] },
      { k: 'row', at: 'almost', items: [L('read an image', 'leer una imagen'), L('shift where it is read', 'desviar de dónde se lee'), L('mix colors', 'mezclar colores'), L('use distances', 'usar distancias')].map((w, i) => ({ k: 'box', cls: 's-mono', text: w, at: `pieces+${(i * 0.9).toFixed(1)}` })) },
    ],
  },
  /* play: much more ripple, no tint, black and white */
  {
    id: 'play',
    beats: { big: L('deforms much more', 'se deforma mucho más'), notint: L('Remove the blue tint', 'Quita el tinte azul'), gray: L('black and white', 'blanco y negro') },
    items: [
      { k: 'kicker', text: L('Play with it', 'Juega con él') },
      win([{ modes: [{ at: 0.2, frag: SH.water }, { at: 'big-3', frag: SH.waveBig }, { at: 'notint', frag: SH.waveOnly }, { at: 'gray', frag: SH.waveGray }], tex: true, aspect: '16 / 10', at: 0.2 }], 0.2, { cls: 'window w60' }),
      { k: 'row', at: 'big-3', items: [
        { k: 'box', cls: 's-mono', text: '0.012f → 0.05f', sub: L('deforms much more', 'se deforma mucho más'), at: 'big-3' },
        { k: 'box', cls: 's-mono', text: 'return original', sub: L('only the ripples', 'solo las ondas'), at: 'notint' },
        { k: 'box', cls: 'accent s-mono', text: '(R + G + B) / 3', sub: L('black and white', 'blanco y negro'), at: 'gray' },
      ] },
    ],
  },
  {
    id: 'learned',
    dense: true,
    beats: { a: L('A texture is an image', 'Una textura es una imagen'), b: L('returns the color of the image', 'devuelve el color de la imagen'), c: L('Reading the image at a different point', 'Leer la imagen en un punto distinto'), d: L('Multiplying a color by a number', 'Multiplicar un color por un número'), e: L('You have finished all five shaders', 'Ya terminaste los cinco shaders') },
    items: [
      { k: 'kicker', text: L('What you learned', 'Lo que aprendiste') },
      ...[['a', 'sampler2D + layout = a texture', 'sampler2D + layout = una textura'], ['b', 'texture(image, point) → color', 'texture(imagen, punto) → color'], ['c', 'read elsewhere = distortion', 'leer en otro punto = deformación'], ['d', '× 0…1 darkens · smoothstep is smooth', '× 0…1 oscurece · smoothstep es suave'], ['e', '5 / 5 shaders', '5 / 5 shaders']]
        .map(([b, en, es]) => ({ k: 'word', cls: 's-mono', at: b, fx: 'left', text: L(en, es), mark: { at: `${b}+0.4`, kind: 'check' } })),
    ],
  },
];

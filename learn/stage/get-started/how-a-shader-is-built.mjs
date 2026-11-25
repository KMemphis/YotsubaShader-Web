// Stage of "How a shader is built" — motion graphics shown next to the text while the chapter is read aloud.
// Each scene starts at its `> [!SCENE] id` cue in content/<lang>/get-started/how-a-shader-is-built.md.
// The Spanish chapter has fewer [!SAY] blocks than the English one, so beats use phrases that both texts say.

const csharp = (title, code) => ({ title, code, lang: 'csharp' });
const L = (en, es) => ({ en, es });

// barycentric RGB triangle in GLSL (uv: 0..1, y up)
const TRI = `vec3 bary(vec2 p){vec2 a=vec2(.5,.92),b=vec2(.14,.08),c=vec2(.86,.08);vec2 v0=b-a,v1=c-a,v2=p-a;float d00=dot(v0,v0),d01=dot(v0,v1),d11=dot(v1,v1),d20=dot(v2,v0),d21=dot(v2,v1);float den=d00*d11-d01*d01;float v=(d11*d20-d01*d21)/den,w=(d00*d21-d01*d20)/den;return vec3(1.-v-w,v,w);}
bool inside(vec2 uv){vec3 b=bary(uv);return min(b.x,min(b.y,b.z))>=0.;}
vec3 mixc(vec2 uv){vec3 b=bary(uv);return b.x*vec3(1.,.23,.23)+b.y*vec3(.2,.84,.36)+b.z*vec3(.22,.5,1.);}
const vec3 BG=vec3(.08,.08,.11);`;

const shader = (en, es) => L(csharp('MyShaders/Triangle.cs', en), csharp('MyShaders/Triangle.cs', es));
const WHOLE_EN = `[ShaderStage(Stage.Vertex)]
public Pixel Vertex({{vertexType}} corner)
{
    Pixel pixel;
    pixel.Position = new vec4(corner.{{pos}}.X, corner.{{pos}}.Y, 0f, 1f);
    pixel.Color = corner.{{color}};
    return pixel;
}

[ShaderStage(Stage.Fragment)]
[return: location(0)]
public vec4 Fragment(PixelIn pixel)
{
    return pixel.Color;
}`;
const WHOLE_ES = WHOLE_EN.replace(/\{\{vertexType\}\}/g, '{{cornerType}}').replace(/\{\{pos\}\}/g, '{{cornerPos}}');

// The journey map (kind 'trip'): game → door A → Vertex → door B → GPU → Fragment → door C → screen. It comes back in
// several scenes, so the reader always sees where on the journey the voice is. In a world scene the map is 240 cqw
// wide; its stations sit at x = game -108, A -78, Vertex -48, B -18, GPU 12, Fragment 42, C 72, screen 103.
const TRIP = {
  k: 'trip', aspect: 3,
  names: { game: L('Game', 'Juego'), vertex: 'Vertex', gpu: 'GPU', fragment: 'Fragment', screen: L('Screen', 'Pantalla') },
  slotNames: { pos: L('position', 'posición'), color: 'color' },
  ownerNames: { game: L('Your game', 'Tu juego'), you: L('You', 'Tú'), gpu: L('The GPU', 'La GPU') },
};
const trip = (o, keys = [{ x: 0, y: 0, w: 240 }]) => ({ ...TRIP, ...o, keys });
const OVERVIEW = { x: 0, y: 4, s: 0.4 };

// the live triangle of the chapter (the colours of the article's picture)
const RGB_TRI = 'vec2 p=vec2((uv.x-.5)*uRes.x/uRes.y+.5,uv.y);vec2 a=vec2(.5,.88),b=vec2(.16,.14),c=vec2(.84,.14);vec2 v0=b-a,v1=c-a,v2=p-a;float d00=dot(v0,v0),d01=dot(v0,v1),d11=dot(v1,v1),d20=dot(v2,v0),d21=dot(v2,v1);float den=d00*d11-d01*d01;float v=(d11*d20-d01*d21)/den,w=(d00*d21-d01*d20)/den,u=1.-v-w;if(min(u,min(v,w))<0.)return vec4(.07,.07,.1,1.);return vec4(u*vec3(1.,.23,.23)+v*vec3(.2,.84,.36)+w*vec3(.22,.5,1.),1.);';

export default [
  /* 0:00 — the drawing we will follow, live and full screen; then the three questions of the chapter, one per beat */
  {
    id: 'intro',
    world: true,
    beats: { recv: L('What does that function receive', 'Qué recibe esa función'), ret: L('What does it have to return', 'Qué tiene que devolver'), who: L('Who calls it', 'Quién la llama') },
    items: [
      { k: 'gl', fill: true, tiles: [{ frag: RGB_TRI }], fx: 'fade', dur: 1.2,
        keys: [{ x: 0, y: 0, w: 100, h: 100, r: 0 }, { at: 'recv-0.6', x: 0, y: -16, w: 64, h: 40, r: 14, d: 1.2 }] },
      { k: 'title', cls: 's-over', at: 0.3, out: 'recv-0.6', text: L('How a shader is <em>built</em>', 'Cómo se <em>construye</em> un shader'), keys: [{ x: 0, y: 30 }] },
      { k: 'word', cls: 's-mono', at: 'recv', fx: 'left', text: L('in&nbsp;&nbsp;→ <span class="s-accent">?</span>', 'entra → <span class="s-accent">?</span>'), keys: [{ x: 0, y: 14 }] },
      { k: 'word', cls: 's-mono', at: 'ret', fx: 'left', text: L('out&nbsp;→ <span class="s-accent">?</span>', 'sale&nbsp;→ <span class="s-accent">?</span>'), keys: [{ x: 0, y: 24 }] },
      { k: 'word', cls: 's-mono', at: 'who', fx: 'left', text: L('who calls it → <span class="s-accent">?</span>', 'quién la llama → <span class="s-accent">?</span>'), keys: [{ x: 0, y: 34 }] },
    ],
  },
  /* 0:27 — the whole journey as a map that draws itself; three vertices travel it and land on the screen as a triangle */
  {
    id: 'journey',
    world: true,
    beats: { trip: L('complete journey of a drawing', 'viaje completo de un dibujo'), steps: L('one step after another', 'un paso detrás de otro'), self: L('the code explains itself', 'el código se explica solo') },
    cam: [OVERVIEW],
    items: [
      trip({ show: 'trip-0.6', flow: ['steps', 'self+0.4'] }),
    ],
  },
  {
    id: 'triangle',
    beats: { red: L('a red corner', 'una esquina roja'), green: L('a green one', 'una verde'), blue: L('a blue one', 'una azul'), blend: L('blend into each other', 'se van mezclando'), every: L('every piece a shader has', 'todas las piezas que tiene un shader') },
    items: [
      { k: 'tri', width: 70, corners: ['red', 'green', 'blue'], edges: 'blue+0.3', fill: 'blend' },
      { k: 'text', at: 'every', text: L('It takes <b>every piece</b> of a shader', 'Hacen falta <b>todas las piezas</b> de un shader') },
    ],
  },
  {
    id: 'shapes',
    beats: { tri: L('the one used for almost everything is the triangle', 'la que se usa para casi todo es el triángulo'), rect: L('A rectangle is two triangles', 'Un rectángulo son dos triángulos'), round: L('Something round', 'Algo redondo'), thousands: L('A character in a 3D game is thousands', 'El personaje de un juego en 3D son miles'), vertex: L('is called a vertex', 'se le llama vértice'), shared: L('4 vertices and not 6', '4 vértices y no 6') },
    items: [
      { k: 'kicker', text: L('Everything is triangles', 'Todo son triángulos') },
      { k: 'shapes', tri: 'tri', rect: 'rect', round: 'round', vertex: 'vertex', shared: 'shared', captions: L(['1', '2', '8'], ['1', '2', '8']), sharedText: L('4 vertices, not 6', '4 vértices, no 6') },
      { k: 'slot', items: [
        { k: 'text', at: 'thousands', out: 'vertex', text: L('A 3D character: <b>thousands</b>', 'Un personaje 3D: <b>miles</b>') },
        { k: 'big', at: 'vertex', cls: 's-accent', text: L('vertex = corner', 'vértice = esquina') },
      ] },
    ],
  },
  /* 2:10 — the list your game sends: a position and a colour per vertex… and what the GPU actually gets: numbers */
  {
    id: 'list',
    beats: { list: L('a list with its three vertices', 'una lista con sus tres vértices'), two: L('where it is and what color it is', 'dónde está y de qué color es'), numbers: L('For the GPU they are just numbers', 'Para la GPU son solo números') },
    items: [
      { k: 'slot', items: [
        { k: 'kicker', at: 0.2, out: 'numbers', text: L('What your game sends', 'Lo que manda tu juego') },
        { k: 'kicker', at: 'numbers+0.6', cls: 's-gpu', text: L('What the GPU sees', 'Lo que ve la GPU') },
      ] },
      { k: 'morph', at: 'list', morph: 'numbers', dur: 1.4, hl: [{ at: 'two', until: 'numbers', lines: [0] }],
        from: L({ title: L('vertices', 'vértices').en, lang: 'text', code: '// position      color\n( 0.0,  0.8)    red\n(-0.8, -0.7)    green\n( 0.8, -0.7)    blue' }, { title: 'vértices', lang: 'text', code: '// posición      color\n( 0.0,  0.8)    rojo\n(-0.8, -0.7)    verde\n( 0.8, -0.7)    azul' }),
        to: { title: 'GPU', lang: 'text', code: '// float  float  float float float float\n 0.0    0.8    1  0  0  1\n-0.8   -0.7    0  1  0  1\n 0.8   -0.7    0  0  1  1' } },
    ],
  },
  {
    id: 'carry',
    beats: { usual: L('These are the usual ones', 'Estos son los habituales'), each: L('Each piece of data is a', 'Cada dato es un'), vec4: L('is four numbers', 'son cuatro números') },
    items: [
      { k: 'kicker', text: L('What a vertex can carry', 'Lo que puede llevar un vértice') },
      { k: 'row', at: 'usual', items: [
        { k: 'box', text: L('Position', 'Posición'), sub: 'vec2 · vec3 · vec4', at: 'usual' },
        { k: 'box', text: 'Color', sub: 'vec3 · vec4', at: 'usual+0.25' },
        { k: 'box', text: 'UV', sub: 'vec2', at: 'usual+0.5' },
        { k: 'box', text: 'Normal', sub: 'vec3', at: 'usual+0.75' },
        { k: 'box', text: 'Tangent', sub: 'vec4', at: 'usual+1' },
        { k: 'box', text: L('Bones', 'Huesos'), sub: 'vec4 · uint', at: 'usual+1.25' },
        { k: 'box', cls: 'accent', text: L('Your own', 'Lo tuyo'), sub: 'float · int · uint', at: 'usual+1.5' },
      ] },
      { k: 'row', at: 'vec4', items: [
        { k: 'word', cls: 's-mono s-accent', text: 'vec4 =', at: 'vec4' },
        { k: 'box', cls: 's-mono', text: '0.2', at: 'vec4+0.2' },
        { k: 'box', cls: 's-mono', text: '0.5', at: 'vec4+0.35' },
        { k: 'box', cls: 's-mono', text: '0.9', at: 'vec4+0.5' },
        { k: 'box', cls: 's-mono', text: '1.0', at: 'vec4+0.65' },
      ] },
    ],
  },
  {
    id: 'coords',
    beats: { w1920: L('1920 pixels wide', '1920 píxeles de ancho'), w800: L('or 800', 'o 800'), w4000: L('or 4000', 'o 4000'), ruler: L('the same ruler', 'la misma regla'), center: L('The center of the screen', 'El centro de la pantalla'), left: L('The left edge', 'El borde izquierdo'), top: L('So the vertex', 'Así que el vértice'), low: L('is to the left and at the bottom', 'está a la izquierda y abajo'), up: L('Y grows upward', 'la Y crece hacia arriba') },
    items: [
      { k: 'coords', width: 86, ruler: 'ruler', center: 'center', edges: 'left', up: 'up',
        sizes: [{ at: 'w1920', w: 1, label: '1920 px' }, { at: 'w800', w: 0.5, label: '800 px' }, { at: 'w4000', w: 1, label: '4000 px' }],
        points: [{ at: 'top', x: 0, y: 0.8, color: '#ff6b6b' }, { at: 'low', x: -0.8, y: -0.7, color: '#7fe3a8' }] },
    ],
  },
  {
    id: 'vertex',
    beats: { first: L('the first function you write', 'la primera función que escribes'), calls: L('Three vertices, three calls', 'Tres vértices, tres llamadas'), job1: L('Say where that vertex ends up', 'Decir dónde queda ese vértice'), job2: L('Let through the data', 'Dejar pasar los datos') },
    items: [
      { k: 'kicker', text: L('Stage 1 · Vertex', 'Etapa 1 · Vertex'), at: 'first' },
      { k: 'calls', start: 'calls', callWord: L('call', 'llamada') },
      { k: 'text', at: 'job1', fx: 'left', text: L('1 · Where it lands <b>(required)</b>', '1 · Dónde cae <b>(obligatorio)</b>'), mark: { at: 'job1+0.5', kind: 'check' } },
      { k: 'text', at: 'job2', fx: 'left', text: L('2 · Data for the next stage', '2 · Datos para la siguiente etapa'), mark: { at: 'job2+0.5', kind: 'check' } },
    ],
  },
  {
    id: 'why',
    beats: { once: L('sent only once', 'se manda una sola vez'), move: L('moves it around the map', 'lo mueve por el mapa'), rotate: L('rotates it', 'lo gira'), small: L('makes it small', 'lo hace pequeño') },
    items: [
      { k: 'kicker', text: L('What Vertex is for', 'Para qué existe Vertex') },
      { k: 'transform', width: 86, move: 'move', rotate: 'rotate', small: 'small', words: L(['move', 'rotate', 'scale'], ['mover', 'girar', 'escalar']) },
      { k: 'text', at: 'once', text: L('The shape is sent <b>once</b>; Vertex places it', 'La forma se manda <b>una vez</b>; Vertex la coloca') },
    ],
  },
  {
    id: 'four',
    beats: { four: L('the final position with four', 'la posición final con cuatro'), only: L('The last two only matter in 3D', 'Los dos últimos solo importan en 3D') },
    items: [
      { k: 'kicker', text: L('The final position', 'La posición final') },
      { k: 'row', items: [
        { k: 'box', cls: 'accent s-mono', text: 'X', sub: L('yours', 'tuyo'), at: 0.2 },
        { k: 'box', cls: 'accent s-mono', text: 'Y', sub: L('yours', 'tuyo'), at: 0.4 },
        { k: 'box', cls: 's-mono', text: 'Z = 0', sub: L('depth', 'profundidad'), at: 'four', fx: 'pop' },
        { k: 'box', cls: 's-mono', text: 'W = 1', sub: L('perspective', 'perspectiva'), at: 'four+0.3', fx: 'pop' },
      ] },
      { k: 'code', at: 'only', code: csharp('2D', 'new vec4(x, y, 0f, 1f)') },
    ],
  },
  {
    id: 'raster',
    beats: { self: L('The GPU does it by itself', 'Lo hace la GPU sola'), inside: L('which pixels fall inside', 'qué píxeles quedan dentro'), bigger: L('The bigger the shape', 'Cuanto más grande sea la figura'), million: L('covers the two million', 'toca los dos millones') },
    items: [
      { k: 'kicker', text: L('Step 4 · the GPU, on its own', 'Paso 4 · la GPU, sola'), at: 'self' },
      { k: 'pipeline', vertex: 0.2, raster: 'inside', fragment: 99999, labels: ['Vertex', L('Pixels', 'Píxeles'), 'Fragment'] },
      { k: 'slot', items: [
        { k: 'text', at: 'bigger', out: 'million', text: L('Small triangle: <b>hundreds</b> of pixels', 'Triángulo pequeño: <b>cientos</b> de píxeles') },
        { k: 'text', at: 'million', text: L('Full HD screen: <b>2 million</b>', 'Pantalla Full HD: <b>2 millones</b>') },
      ] },
    ],
  },
  {
    id: 'spread',
    beats: { three: L('returned three colors', 'devolvió tres colores'), which: L('Which color reaches each one', 'Qué color le llega a cada uno'), spreads: L('spreads', 'reparte'), near: L('right next to the red vertex', 'pegado al vértice rojo'), half: L('halfway between', 'a mitad de camino'), center: L('right in the center', 'justo en el centro') },
    items: [
      { k: 'kicker', text: L('The spreading', 'El reparto') },
      { k: 'tri', width: 64, corners: ['three', 'three+0.2', 'three+0.4'], edges: 'which', fill: 'spreads',
        probes: [{ at: 'near', p: [0.9, 0.05, 0.05] }, { at: 'half', p: [0.5, 0.5, 0] }, { at: 'center', p: [1, 1, 1] }] },
      { k: 'slot', items: [
        { k: 'text', at: 'which', out: 'spreads', text: L('3 values… <b>thousands</b> of pixels?', '3 valores… ¿<b>miles</b> de píxeles?') },
        { k: 'text', at: 'spreads', text: L('Each pixel gets a <b>mix</b>', 'Cada píxel recibe una <b>mezcla</b>') },
      ] },
    ],
  },
  {
    id: 'heat',
    beats: { any: L('any', 'cualquier'), temp: L('a temperature', 'una temperatura') },
    items: [
      { k: 'kicker', text: L('Not only colors', 'No solo colores') },
      { k: 'tri', width: 64, corners: ['temp', 'temp+0.15', 'temp+0.3'], edges: 'temp+0.4', fill: 'temp+0.6', values: [10, 40, 25], min: 10, max: 40, unit: '°', labels: ['10°', '40°', '25°'],
        probes: [{ at: 'temp+2.4', p: [1, 1, 1] }] },
      { k: 'text', at: 'any', text: L('The GPU spreads <b>any number</b>', 'La GPU reparte <b>cualquier número</b>') },
    ],
  },
  /* 7:15 — the key idea on the map: three exact values leave Vertex, and Fragment gets a whole triangle of mixes */
  {
    id: 'important',
    world: true,
    beats: { ret: L('What the Vertex function returns', 'Lo que devuelve la función Vertex'), exact: L('three exact values', 'tres valores exactos'), thousands: L('Fragment receives thousands', 'Fragment recibe miles'), interp: L('interpolation', 'interpolación') },
    cam: [{ x: -3, y: 2, s: 0.75 }],
    items: [
      trip({ show: 0, flow: ['exact-1.5', 'thousands-4.2'], focus: [{ at: 0, ids: ['vertex', 'B', 'gpu', 'fragment'] }] }),
      { k: 'big', at: 'interp', cls: 's-accent', text: L('interpolation', 'interpolación'), keys: [{ x: -3, y: 46, s: 1.33 }] },
    ],
  },
  {
    id: 'fragment',
    beats: { second: L('the second function you write', 'la segunda función que escribes'), job: L('return the color of that pixel', 'devolver el color de ese píxel'), four: L('A color is four numbers', 'Un color son cuatro números'), not255: L('Not from 0 to 255', 'No de 0 a 255'), opacity: L('The fourth number is the opacity', 'El cuarto número es la opacidad') },
    items: [
      { k: 'kicker', text: L('Stage 2 · Fragment', 'Etapa 2 · Fragment'), at: 'second' },
      { k: 'text', at: 'job', text: L('One job: <b>the color of one pixel</b>', 'Un solo trabajo: <b>el color de un píxel</b>') },
      { k: 'rgba', at: 'four', start: 'four', opacity: 'opacity', opacityName: L('opacity', 'opacidad'),
        colors: [{ v: [1, 0, 0, 1], name: L('red', 'rojo') }, { v: [1, 1, 1, 1], name: L('white', 'blanco') }, { v: [0, 0, 0, 1], name: L('black', 'negro') }, { v: [0.5, 0.5, 0.5, 1], name: L('gray', 'gris') }, { v: [1, 1, 0, 1], name: L('yellow', 'amarillo') }] },
      { k: 'row', at: 'not255', items: [
        { k: 'word', cls: 's-mono', text: '0 – 255', at: 'not255', strike: 'not255+0.4' },
        { k: 'word', cls: 's-mono s-ok', text: '0 – 1', at: 'not255+0.6', mark: { at: 'not255+0.9', kind: 'check' } },
      ] },
    ],
  },
  {
    id: 'freedom',
    beats: { simplest: L('does the simplest thing there is', 'hace lo más simple que existe'), dark: L('darken it', 'oscurecerlo'), red: L('ignore it and return red', 'ignorarlo y devolver rojo'), formula: L('with a formula', 'con una fórmula') },
    items: [
      { k: 'shader', lib: TRI, modes: [
        { at: 0, frag: 'return vec4(inside(uv)?mixc(uv):BG,1.);' },
        { at: 'dark', frag: 'return vec4(inside(uv)?mixc(uv)*.4:BG,1.);' },
        { at: 'red', frag: 'return vec4(inside(uv)?vec3(1.,0.,0.):BG,1.);' },
        { at: 'formula', frag: 'vec3 c=vec3(.5+.5*sin(uv.x*28.+t*2.),.5+.5*sin(uv.y*22.-t*1.4),.85);return vec4(inside(uv)?c:BG,1.);' },
      ] },
      { k: 'slot', items: [
        { k: 'code', at: 'simplest', out: 'dark', code: csharp('Fragment', 'return pixel.Color;') },
        { k: 'code', at: 'dark', out: 'red', code: csharp('Fragment', 'return pixel.Color * 0.4f;') },
        { k: 'code', at: 'red', out: 'formula', code: csharp('Fragment', 'return new vec4(1f, 0f, 0f, 1f);') },
        { k: 'code', at: 'formula', code: csharp('Fragment', 'return Stripes(pixel.Uv, time);') },
      ] },
    ],
  },
  {
    id: 'isolated',
    dense: true,
    beats: { others: L('It knows nothing about the other pixels', 'No sabe nada de los otros píxeles'), mem: L('It remembers nothing', 'No recuerda nada'), loop: L('There is no loop', 'No hay un bucle'), game: L('your game has to send it', 'se lo tiene que mandar tu juego') },
    items: [
      { k: 'kicker', text: L('Each pixel, on its own', 'Cada píxel, por su cuenta') },
      { k: 'text', at: 'others', fx: 'left', text: L('The pixel next to it', 'El píxel de al lado'), mark: { at: 'others+0.5', kind: 'x' } },
      { k: 'text', at: 'mem', fx: 'left', text: L('Memory between calls', 'Memoria entre llamadas'), mark: { at: 'mem+0.5', kind: 'x' } },
      { k: 'text', at: 'loop', fx: 'left', text: L('A loop over the pixels', 'Un bucle sobre los píxeles'), mark: { at: 'loop+0.5', kind: 'x' } },
      { k: 'row', at: 'game', items: [
        { k: 'box', text: L('Your game', 'Tu juego'), at: 'game' },
        { k: 'arrow', at: 'game+0.2' },
        { k: 'box', cls: 'accent', text: L('time · a photo', 'tiempo · una foto'), at: 'game+0.4' },
      ] },
    ],
  },
  /* 9:30 — the GPU does not know names, only numbered slots: door A gets its two slots, then the same idea in GLSL
     and in HLSL */
  {
    id: 'slots',
    world: true,
    beats: { names: L('the GPU does not understand names', 'la GPU no entiende de nombres'), put: L('I put the position in slot 0', 'pongo la posición en el casillero 0'), loc: L('That number is called', 'A ese número se le llama'), wrong: L('If you get a number wrong', 'Si te equivocas de número'), hlsl: L('In HLSL the slot', 'En HLSL el casillero') },
    cam: [{ x: -63, y: 0, s: 0.7 }],
    items: [
      trip({ show: 0, slots: 'put', focus: [{ at: 0, ids: ['game', 'A', 'vertex'] }] }),
      { k: 'slot', keys: [{ x: -63, y: 46, w: 100, s: 1.35 }], items: [
        { k: 'code', at: 'loc', out: 'hlsl', code: csharp('GLSL', '[location(0)] public vec2 Position;\n[location(1)] public vec4 Color;'), marks: [{ at: 'wrong', line: 1, kind: 'x' }] },
        { k: 'code', at: 'hlsl', code: csharp('HLSL', '[TEXCOORD(0)] public vec2 Position;\n[TEXCOORD(1)] public vec4 Color;') },
      ] },
    ],
  },
  /* 10:42 — three doors, three rows of slots; every door has its own slot 0, and the three of them light up together */
  {
    id: 'doors',
    world: true,
    beats: { three: L('There are three', 'Hay tres'), cross: L('three doors', 'tres puertas'), each: L('Each door starts counting from 0', 'Cada puerta empieza a contar desde 0'), build: L('three buildings', 'tres edificios') },
    cam: [OVERVIEW],
    items: [
      trip({ show: 0, slots: 'three', zeros: 'each', flow: ['cross'], focus: [{ at: 'cross', ids: ['A', 'B', 'C'] }] }),
      { k: 'text', at: 'build', text: L('Building <b>and</b> number', 'Edificio <b>y</b> número'), keys: [{ x: 0, y: 86, s: 2.5 }] },
    ],
  },
  {
    id: 'rules',
    beats: { r1: L('Within the same door', 'Dentro de una misma puerta'), r2: L('Both sides of a door', 'Los dos lados de una puerta'), r3: L('Between different doors', 'Entre puertas distintas') },
    items: [
      { k: 'kicker', text: L('Three rules', 'Tres reglas') },
      { k: 'text', at: 'r1', fx: 'left', text: L('1 · No repeated number in a door', '1 · Sin números repetidos en una puerta') },
      { k: 'text', at: 'r2', fx: 'left', text: L('2 · Both sides agree: number <b>and</b> type', '2 · Los dos lados coinciden: número <b>y</b> tipo') },
      { k: 'text', at: 'r3', fx: 'left', text: L('3 · Different doors: no relation', '3 · Puertas distintas: ninguna relación') },
    ],
  },
  /* 12:19 — door B carries two kinds of data: the ★ position goes to the GPU, your colour goes on to Fragment */
  {
    id: 'special',
    world: true,
    beats: { star: L('marked with a star', 'marcada con una estrella'), gpu: L('the GPU itself', 'la propia GPU'), kinds: L('two kinds of data', 'dos clases de datos') },
    cam: [{ x: -18, y: 6, s: 1.1 }, { at: 'gpu', x: 12, y: 8, s: 0.8, d: 1.4 }],
    items: [
      trip({ show: 0, slots: 0, star: 'gpu', focus: [{ at: 0, ids: ['B'] }, { at: 'gpu', ids: ['B', 'gpu', 'fragment'] }] }),
    ],
  },
  {
    id: 'styles',
    beats: { glsl: L('is how GLSL names a slot', 'es como GLSL nombra un casillero'), hlsl: L('HLSL, the language of DirectX', 'HLSL, el lenguaje de DirectX'), five: L('Yotsuba Shader has five styles', 'Yotsuba Shader tiene cinco estilos'), same: L('stay exactly the same', 'quedan exactamente igual') },
    items: [
      { k: 'kicker', text: L('Five styles', 'Cinco estilos') },
      { k: 'code', at: 'glsl', type: 'glsl', cps: 60, code: { title: 'Corner', lang: 'csharp', code: '[location(0)]    // GLSL\n[TEXCOORD(0)]    // HLSL\n[attribute(0)]   // MSL\n[location(0)]    // WGSL\n[Location(0)]    // SPIR-V' },
        dim: [{ at: 'glsl', until: 'hlsl', lines: [0] }, { at: 'hlsl', until: 'five', lines: [1] }] },
      { k: 'text', at: 'same', text: L('Only the words change; the C# stays the same', 'Solo cambian las palabras; el C# es el mismo'), mark: { at: 'same+0.5', kind: 'check' } },
    ],
  },
  {
    id: 'dict',
    beats: { look: L('They look different', 'Se ven distintos'), choose: L('you choose the number', 'tú eliges el número'), compiler: L('the compiler can choose the number', 'el compilador puede elegir el número') },
    items: [
      { k: 'kicker', text: L('One idea, five words', 'Una idea, cinco palabras') },
      { k: 'code', at: 'look', type: 'look+0.2', cps: 80, code: { title: L('dictionary', 'diccionario'), lang: '', code: L('vertex data:     location · TEXCOORD · attribute\nfinal position:  gl_Position · SV_Position · position\ncolor (door C):  location(0) · SV_Target · color(0)', 'dato de vértice: location · TEXCOORD · attribute\nposición final:  gl_Position · SV_Position · position\ncolor (puerta C): location(0) · SV_Target · color(0)') } },
      { k: 'row', at: 'choose', items: [
        { k: 'box', cls: 's-mono', text: 'location(0)', sub: L('you choose', 'eliges tú'), at: 'choose' },
        { k: 'box', cls: 's-mono', text: 'TEXCOORD', sub: L('the compiler can choose', 'puede elegir el compilador'), at: 'compiler' },
      ] },
    ],
  },
  /* 15:47 — the five decisions, each one lit on the map when the voice reads its row */
  {
    id: 'blueprint',
    world: true,
    beats: { five: L('decide five things', 'decidir cinco cosas'), r1: L('In the first row', 'En la primera fila'), r2: L('In the second', 'En la segunda'), r3: L('The third says', 'La tercera dice'), r4: L('The fourth', 'La cuarta'), r5: L('And the fifth', 'Y la quinta') },
    cam: [OVERVIEW],
    items: [
      trip({ show: 0, slots: 0, focus: [{ at: 'r1', ids: ['game', 'A'] }, { at: 'r2', ids: ['B'] }, { at: 'r3', ids: ['vertex'] }, { at: 'r4', ids: ['fragment'] }, { at: 'r5', ids: ['C', 'screen'] }] }),
      ...[['r1', '1'], ['r2', '2'], ['r3', '3'], ['r4', '4'], ['r5', '5']].map(([beat, n], i, all) => ({
        k: 'big', cls: 's-accent', text: n, at: beat, out: all[i + 1]?.[0], fx: 'pop', keys: [{ x: 0, y: -84, s: 2.5 }],
      })),
    ],
  },
  /* 16:27 — who does what: your game, you, the GPU; then the three loops you never write, struck out */
  {
    id: 'who',
    world: true,
    beats: { game: L('Your game sends the list', 'Tu juego manda la lista'), you: L('You, in the shader', 'Tú, en el shader'), gpu: L('everything else', 'todo lo demás'), not: L('have to write', 'tienes que escribir') },
    cam: [OVERVIEW],
    items: [
      trip({ show: 0, owners: { game: 'game', you: 'you', gpu: 'gpu' }, flow: ['gpu'], focus: [{ at: 'game', ids: ['game'] }, { at: 'you', ids: ['game', 'A', 'vertex', 'B', 'fragment', 'C'] }, { at: 'gpu', ids: null }] }),
      { k: 'word', at: 'not', text: L('loop over vertices', 'bucle de vértices'), strike: 'not+0.5', keys: [{ x: 0, y: 64, s: 2 }] },
      { k: 'word', at: 'not+0.3', text: L('loop over pixels', 'bucle de píxeles'), strike: 'not+0.8', keys: [{ x: 0, y: 79, s: 2 }] },
      { k: 'word', at: 'not+0.6', text: L('the spreading', 'el reparto'), strike: 'not+1.1', keys: [{ x: 0, y: 94, s: 2 }] },
    ],
  },
  /* 17:10 — the whole shader types itself; then the compiler's six outputs fan out of it. SPIR-V comes first (the
     others are made from it), and the four that come out identical whatever style you write get a check */
  {
    id: 'whole',
    world: true,
    beats: { outputs: L('generates the same outputs', 'genera las mismas salidas'), identical: L('come out identical', 'salen idénticos'), spirv: L('into SPIR-V first', 'primero a SPIR-V') },
    items: [
      { k: 'code', at: 0, type: 0.2, cps: 70, cls: 'wide xwide', code: shader(WHOLE_EN, WHOLE_ES), keys: [{ x: 0, y: -8, w: 96 }, { at: 'outputs', y: -22, s: 0.7, d: 1 }] },
      ...[
        ['.spv', 'SPIR-V', '/img/apis/vulkan.svg', false],
        ['.glsl', 'GLSL', '/img/apis/opengl.svg', true],
        ['.glsl', 'GLSL ES', '/img/apis/webgl.svg', true],
        ['.hlsl', 'HLSL', '/img/apis/directx.svg', false],
        ['.metal', 'Metal', '/img/apis/metal.svg', true],
        ['.cpp', 'C++', null, true],
      ].map(([ext, sub, logo, same], i) => ({
        k: 'file', ext, sub, logo, at: `outputs+${0.3 + i * 0.12}`, fx: 'fade', dur: 0.3,
        ...(same ? { mark: { at: `identical+${i * 0.15}`, kind: 'check' } } : {}),
        keys: [{ x: 0, y: -10, w: 14, s: 0.4 }, { at: `outputs+${0.3 + i * 0.12}`, x: -40 + i * 16, y: 30, s: 1, d: 0.8 },
          ...(i === 0 ? [{ at: 'spirv', y: 22, s: 1.25, d: 0.8 }] : [])],
      })),
    ],
  },
  /* 19:13 — what you learned, as one more trip: each line lights the part of the map it talks about */
  {
    id: 'learned',
    world: true,
    beats: { a: L('Everything is drawn with triangles', 'Todo se dibuja con triángulos'), b: L('Your game sends the vertices', 'Tu juego manda los vértices'), c: L('For the GPU the screen goes', 'Para la GPU la pantalla va'), d: L('The Vertex function runs once per vertex', 'La función Vertex se ejecuta una vez por vértice'), e: L('The GPU spreads that data', 'La GPU reparte esos datos'), f: L('The Fragment function runs once per pixel', 'La función Fragment se ejecuta una vez por píxel'), g: L('The data travels in numbered slots', 'Los datos viajan en casilleros numerados') },
    cam: [OVERVIEW],
    items: [
      trip({ show: 0, slots: 'g', zeros: 'g+0.6', flow: ['a', 'e-3'], focus: [{ at: 'b', ids: ['game', 'A'] }, { at: 'c', ids: ['screen'] }, { at: 'd', ids: ['vertex'] }, { at: 'e', ids: ['gpu'] }, { at: 'f', ids: ['fragment'] }, { at: 'g', ids: ['A', 'B', 'C'] }] }),
    ],
  },
];

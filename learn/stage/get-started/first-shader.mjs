// Stage of "Shader 1: a sunset" — motion graphics shown next to the text while the chapter is read aloud.
// Each scene starts at its `> [!SCENE] id` cue in content/<lang>/get-started/first-shader.md. Cues are outside the
// :::xna / :::godot blocks, so every route has every scene; `{ route: { godot, default } }` picks route-specific code.

const L = (en, es) => ({ en, es });
const cs = (title, code) => ({ title, code, lang: 'csharp' });
const term = (code) => ({ title: 'Terminal', code, lang: 'bash' });

// the sunset gradient in GLSL (uv.y = 0 at the bottom here, so "top" is 1 - uv.y)
const ENGINE_LOGO = { route: { kni: '/img/engines/kni.png', fna: '/img/engines/fna.png', godot: '/img/engines/godot.svg', raylib: '/img/engines/raylib.png', silknet: '/img/engines/silknet.svg', default: '/img/engines/monogame.png' } };
// a live shader inside the window of this route's engine (gl = one WebGL canvas behind the tiles; w60 = 60% of the stage width)
const win = (frag, at, extra = {}) => ({ k: 'gl', cls: 'window w60', title: '{{engine}}', logo: ENGINE_LOGO, at, fx: 'pop', radius: 10, tiles: [{ frag, at }], ...extra });
const SUNSET = 'float y=1.-uv.y;return vec4(1.,.25+.6*y,.45-.35*y,1.);';
const SUNSET_LIVE = 'float y=1.-uv.y+.015*sin(uv.x*9.+t*1.3);return vec4(1.,.25+.6*y,.45-.35*y,1.);';

const MAKE = L(cs('C#', `vec2 uv = new vec2(0.5f, 0.25f);
vec3 orange = new vec3(1f, 0.5f, 0.1f);
vec4 red = new vec4(1f, 0f, 0f, 1f);`), cs('C#', `vec2 uv = new vec2(0.5f, 0.25f);
vec3 naranja = new vec3(1f, 0.5f, 0.1f);
vec4 rojo = new vec4(1f, 0f, 0f, 1f);`));

const DOOR_A = { route: {
  godot: cs('Screen.cs', `public struct {{vertexType}}
{
    public vec3 VERTEX;
    public vec2 UV;
    // …the 14 fields of Godot, by name
}`),
  default: L(cs('MyShaders/Screen.cs', `public struct {{vertexType}}
{
    [location(0)] public vec2 {{pos}};
    [location(1)] public vec2 {{uv}};
}`), cs('MisShaders/Pantalla.cs', `public struct {{vertexType}}
{
    [location(0)] public vec2 {{pos}};
    [location(1)] public vec2 {{uv}};
}`)),
} };

const DOOR_B = L(cs('MyShaders/Screen.cs', `public struct Pixel
{
    [gl_Position] public vec4 Position;
    [location(0)] public vec2 Uv;
}

public struct PixelIn
{
    [location(0)] public vec2 Uv;
}`), cs('MisShaders/Pantalla.cs', `public struct Pixel
{
    [gl_Position] public vec4 Posicion;
    [location(0)] public vec2 Uv;
}

public struct PixelIn
{
    [location(0)] public vec2 Uv;
}`));

const VERTEX = L(cs('Vertex', `[ShaderStage(Stage.Vertex)]
public Pixel Vertex({{vertexType}} corner)
{
    Pixel pixel;
    pixel.Position = new vec4(corner.{{pos}}.X, corner.{{pos}}.Y, 0f, 1f);
    pixel.Uv = corner.{{uv}};
    return pixel;
}`), cs('Vertex', `[ShaderStage(Stage.Vertex)]
public Pixel Vertex({{vertexType}} vertice)
{
    Pixel pixel;
    pixel.Posicion = new vec4(vertice.{{pos}}.X, vertice.{{pos}}.Y, 0f, 1f);
    pixel.Uv = vertice.{{uv}};
    return pixel;
}`));

const FRAGMENT_RED = L(cs('Fragment', `[ShaderStage(Stage.Fragment)]
[return: location(0)]
public vec4 Fragment(PixelIn pixel)
{
    return new vec4(1f, 0f, 0f, 1f);
}`), cs('Fragment', `[ShaderStage(Stage.Fragment)]
[return: location(0)]
public vec4 Fragment(PixelIn pixel)
{
    return new vec4(1f, 0f, 0f, 1f);
}`));

const FRAGMENT_SUNSET = L(cs('MyShaders/Gradient.cs', `public vec4 Fragment(PixelIn pixel)
{
    float red = 1f;
    float green = 0.25f + 0.6f * pixel.Uv.Y;
    float blue = 0.45f - 0.35f * pixel.Uv.Y;
    return new vec4(red, green, blue, 1f);
}`), cs('MisShaders/Degradado.cs', `public vec4 Fragment(PixelIn pixel)
{
    float rojo = 1f;
    float verde = 0.25f + 0.6f * pixel.Uv.Y;
    float azul = 0.45f - 0.35f * pixel.Uv.Y;
    return new vec4(rojo, verde, azul, 1f);
}`));

export default [
  {
    id: 'goal',
    beats: { paints: L('It paints the whole screen', 'Pinta toda la pantalla'), five: L('the five things', 'las cinco cosas'), parts: L('use exactly these same parts', 'usan exactamente estas mismas partes') },
    items: [
      { k: 'kicker', text: L('Shader 1 · a sunset', 'Shader 1 · un atardecer') },
      win(SUNSET_LIVE, 'paints'),
      { k: 'row', at: 'five', items: [1, 2, 3, 4, 5].map((n, i) => ({ k: 'box', cls: 'accent s-mono', text: String(n), at: `five+${(i * 0.2).toFixed(1)}`, fx: 'pop' })) },
      { k: 'text', at: 'parts', text: L('The next four shaders use these same parts', 'Los cuatro shaders siguientes usan estas mismas partes') },
    ],
  },
  {
    id: 'plan',
    beats: { a: L('door A, is written as a struct', 'la puerta A, se escriben con un struct'), b: L('door B, is another struct', 'la puerta B, es otro struct'), fns: L('The two functions', 'Las dos funciones'), c: L('door C', 'la puerta C'), nothing: L('There is nothing else', 'No hay nada más') },
    items: [
      { k: 'kicker', text: L('The plan · 5 decisions in C#', 'El plan · 5 decisiones en C#') },
      { k: 'code', at: 0.2, code: L({ title: 'C#', lang: '', code: '1  door A    →  struct + [location]\n2  door B    →  another struct\n3  Vertex    →  [ShaderStage(Stage.Vertex)]\n4  Fragment  →  [ShaderStage(Stage.Fragment)]\n5  door C    →  [return: location(0)]' }, { title: 'C#', lang: '', code: '1  puerta A  →  struct + [location]\n2  puerta B  →  otro struct\n3  Vertex    →  [ShaderStage(Stage.Vertex)]\n4  Fragment  →  [ShaderStage(Stage.Fragment)]\n5  puerta C  →  [return: location(0)]' }),
        hl: [{ at: 'a', until: 'b', lines: [0] }, { at: 'b', until: 'fns', lines: [1] }, { at: 'fns', until: 'c', lines: [2, 3] }, { at: 'c', until: 'nothing', lines: [4] }] },
      { k: 'text', at: 'nothing', text: L('A few <b>structs</b> and a <b>class with two methods</b>', 'Unos <b>struct</b> y una <b>clase con dos métodos</b>') },
    ],
  },
  {
    id: 'rect',
    beats: { cover: L('covers it from edge to edge', 'la cubra de borde a borde'), corners: L('The four corners of the screen', 'Las cuatro esquinas de la pantalla'), uv: L('usually called', 'se suele llamar') },
    items: [
      { k: 'coords', width: 80, ruler: 0, center: 0.3, edges: 0.3, points: [
        { at: 'corners', x: -1, y: 1, color: '#f2f2f7' }, { at: 'corners+0.3', x: 1, y: 1, color: '#f2f2f7' }, { at: 'corners+0.6', x: -1, y: -1, color: '#f2f2f7' }, { at: 'corners+0.9', x: 1, y: -1, color: '#f2f2f7' }] },
      { k: 'row', at: 'cover', items: [
        { k: 'box', text: L('2 triangles', '2 triángulos'), at: 'cover' },
        { k: 'box', text: L('4 vertices', '4 vértices'), at: 'cover+0.3' },
        { k: 'box', cls: 'accent s-mono', text: 'Uv', sub: L('new', 'nuevo'), at: 'uv', fx: 'pop' },
      ] },
    ],
  },
  {
    id: 'uv',
    beats: { top: L('whether it is at the top or at the bottom', 'si está arriba o abajo'), corner: L('which corner of the rectangle it is', 'en qué esquina del rectángulo está'), rest: L('the spreading does the rest', 'el reparto hace el resto'), half: L('A pixel halfway between', 'Un píxel a mitad de camino'), center: L('One right in the center', 'Uno justo en el centro'), name: L('is a custom', 'es una costumbre') },
    items: [
      { k: 'kicker', text: 'Uv' },
      { k: 'uv', width: 86, corners: 'corner', fill: 'rest', probes: [{ at: 'half', u: 0.5, v: 0 }, { at: 'center', u: 0.5, v: 0.5 }] },
      { k: 'text', at: 'name', text: L('<b>U, V</b> so they are not confused with X, Y', '<b>U, V</b> para no confundirlas con X, Y') },
    ],
  },
  {
    id: 'doors',
    beats: { same: L('the same drawing of the three doors', 'el mismo dibujo de las tres puertas'), line: L('is going to be a line of C#', 'va a ser una línea de C#') },
    items: [
      { k: 'kicker', text: L('The three doors of this shader', 'Las tres puertas de este shader') },
      { k: 'code', at: 0.2, type: 0.4, cps: 50, code: L({ title: L('doors', 'puertas'), lang: '', code: 'A  ·  0 Position   1 Uv\nB  ·  ★ Position   0 Uv\nC  ·  0 color' }, { title: 'puertas', lang: '', code: 'A  ·  0 Posicion   1 Uv\nB  ·  ★ Posicion   0 Uv\nC  ·  0 color' }),
        hl: [{ at: 'same', lines: [0, 1, 2] }], tags: [{ at: 'line', line: 0, text: 'C#' }, { at: 'line+0.2', line: 1, text: 'C#' }, { at: 'line+0.4', line: 2, text: 'C#' }] },
    ],
  },
  {
    id: 'vectors',
    beats: { two: L('A position is two numbers', 'Una posición son dos números'), four: L('A color is four', 'Un color son cuatro'), called: L('These types are called vectors', 'A estos tipos se les llama vectores'), order: L('remember the order', 'acordarte del orden') },
    items: [
      { k: 'kicker', text: L('Vectors', 'Vectores'), at: 'called' },
      { k: 'row', at: 'two', items: [
        { k: 'box', cls: 's-mono', text: 'vec2', sub: 'X Y', at: 'two' },
        { k: 'box', cls: 's-mono', text: 'vec3', sub: 'X Y Z', at: 'two+0.6' },
        { k: 'box', cls: 'accent s-mono', text: 'vec4', sub: 'X Y Z W', at: 'four' },
      ] },
      { k: 'row', at: 'order', items: [
        { k: 'word', cls: 's-mono s-bad', text: L('X = red', 'X = rojo'), at: 'order+0.2' },
        { k: 'word', cls: 's-mono s-ok', text: L('Y = green', 'Y = verde'), at: 'order+0.5' },
        { k: 'word', cls: 's-mono s-gpu', text: L('Z = blue', 'Z = azul'), at: 'order+0.8' },
        { k: 'word', cls: 's-mono', text: L('W = opacity', 'W = opacidad'), at: 'order+1.1' },
      ] },
    ],
  },
  {
    id: 'make',
    beats: { ctor: L('with new and its constructor', 'con new y su constructor'), red: L('To have the color red', 'Para tener el color rojo'), types: L('the types vec2, vec3 and vec4 come from', 'de donde salen los tipos vec2, vec3 y vec4') },
    items: [
      { k: 'code', at: 'ctor', type: 'ctor+0.3', cps: 40, code: MAKE, tags: [{ at: 'red+0.5', line: 2, text: L('red', 'rojo') }] },
      { k: 'text', at: 'types', text: L('vec2, vec3 and vec4 come from GlslSyntax.Types', 'vec2, vec3 y vec4 salen de GlslSyntax.Types'), mark: { at: 'types+0.5', kind: 'check' } },
    ],
  },
  {
    id: 'doorA',
    beats: { file: L('Both go in a file called', 'Van las dos en un archivo que se llama'), two: L('in two parts', 'en dos partes') },
    items: [
      { k: 'kicker', text: L('Door A', 'Puerta A') },
      { k: 'code', at: 'file', type: 'file+0.3', cps: 45, code: DOOR_A, hl: [{ at: 'two', lines: [2, 3] }] },
      { k: 'text', at: 'two+1', text: L('What your game sends for each vertex', 'Lo que tu juego manda por cada vértice') },
    ],
  },
  {
    id: 'doorB',
    beats: { add: L('Add the second', 'Añade el segundo'), kinds: L('the special one and', 'el especial y'), special: L('is the special data', 'es el dato especial'), yours: L('is data of yours', 'es un dato tuyo') },
    items: [
      { k: 'kicker', text: L('Door B', 'Puerta B') },
      { k: 'code', at: 'add', type: 'add+0.3', cps: 55, code: DOOR_B,
        hl: [{ at: 'special', until: 'yours', lines: [2] }, { at: 'yours', lines: [3, 8] }],
        tags: [{ at: 'special+0.4', line: 2, text: '★ GPU' }, { at: 'yours+0.4', line: 3, text: L('slot 0', 'casillero 0') }] },
    ],
  },
  {
    id: 'zero',
    beats: { yes: L('this is the moment to look at it carefully', 'es el momento de mirarlo bien'), gaps: L('without leaving gaps', 'sin dejar huecos') },
    items: [
      { k: 'kicker', text: L('location(0) again?', '¿Otra vez location(0)?') },
      { k: 'row', at: 'yes', items: [
        { k: 'box', cls: 'accent', text: L('Door A · 0', 'Puerta A · 0'), sub: '{{pos}}', at: 'yes' },
        { k: 'word', text: '≠', at: 'yes+0.4', fx: 'pop' },
        { k: 'box', cls: 'gpu', text: L('Door B · 0', 'Puerta B · 0'), sub: 'Uv', at: 'yes+0.8' },
      ] },
      { k: 'text', at: 'gaps', text: L('Each door counts from <b>0</b>, without gaps', 'Cada puerta cuenta desde <b>0</b>, sin huecos') },
    ],
  },
  {
    id: 'pixel',
    beats: { reach: L('it is what reaches each pixel', 'es lo que le llega a cada píxel'), notwhole: L('does not receive the whole', 'no recibe el'), agree: L('The two sides of door B have to agree', 'Los dos lados de la puerta B tienen que coincidir') },
    items: [
      { k: 'row', at: 'reach', items: [
        { k: 'box', cls: 'accent', text: 'Vertex', sub: L('fills it per vertex', 'lo llena por vértice'), at: 'reach' },
        { k: 'arrow', at: 'reach+0.4' },
        { k: 'box', cls: 'gpu', text: 'GPU', sub: L('spreads it', 'lo reparte'), at: 'reach+0.8' },
        { k: 'arrow', at: 'reach+1.2' },
        { k: 'box', cls: 'accent', text: 'Fragment', sub: L('once per pixel', 'una vez por píxel'), at: 'reach+1.6' },
      ] },
      { k: 'code', at: 'notwhole', code: cs('Pixel · PixelIn', 'Pixel:    [location(0)] public vec2 Uv;\nPixelIn:  [location(0)] public vec2 Uv;'), marks: [{ at: 'agree+0.6', line: 0, kind: 'check' }, { at: 'agree+0.8', line: 1, kind: 'check' }], hl: [{ at: 'agree', lines: [0, 1] }] },
      { k: 'text', at: 'agree', text: L('Same number, same type', 'Mismo número, mismo tipo') },
    ],
  },
  {
    id: 'vertexfn',
    beats: { left: L('Decisions 3, 4 and 5 are left', 'Quedan las decisiones 3, 4 y 5'), sig: L('Start with the first line', 'Empieza por la primera línea'), job1: L('Job 1', 'Trabajo 1'), job2: L('Job 2', 'Trabajo 2') },
    items: [
      { k: 'kicker', text: L('The Vertex function', 'La función Vertex') },
      { k: 'code', at: 'left', type: 'left+0.3', cps: 55, code: VERTEX,
        hl: [{ at: 'sig', until: 'job1', lines: [0, 1] }, { at: 'job1', until: 'job2', lines: [4] }, { at: 'job2', lines: [5] }],
        tags: [{ at: 'job1+0.3', line: 4, text: L('job 1', 'trabajo 1') }, { at: 'job2+0.3', line: 5, text: L('job 2', 'trabajo 2') }] },
    ],
  },
  {
    id: 'fragfn',
    beats: { doorC: L('is door C', 'es la puerta C'), red: L('which is red', 'que es rojo'), screen: L('the whole screen is going to be red', 'toda la pantalla va a quedar roja') },
    items: [
      { k: 'kicker', text: L('The Fragment function', 'La función Fragment') },
      { k: 'code', at: 0.2, type: 0.4, cps: 55, code: FRAGMENT_RED, hl: [{ at: 'doorC', until: 'red', lines: [1] }, { at: 'red', lines: [4] }], tags: [{ at: 'doorC+0.3', line: 1, text: L('door C', 'puerta C') }] },
      win('return vec4(1.,0.,0.,1.);', 'screen', { cls: 'window w50' }),
    ],
  },
  {
    id: 'zeros',
    beats: { three: L('Three zeros, three doors', 'Tres ceros, tres puertas') },
    items: [
      { k: 'kicker', text: L('The three zeros', 'Los tres ceros') },
      { k: 'code', at: 0.2, type: 0.4, cps: 50, code: L({ title: 'location(0)', lang: '', code: '[location(0)]  {{pos}}        → A\n[location(0)]  Uv             → B\n[return: location(0)]  color  → C' }, { title: 'location(0)', lang: '', code: '[location(0)]  {{pos}}        → A\n[location(0)]  Uv             → B\n[return: location(0)]  color  → C' }),
        hl: [{ at: 'three', lines: [0, 1, 2] }] },
      { k: 'text', at: 'three', text: L('Three zeros, three doors, <b>three different things</b>', 'Tres ceros, tres puertas, <b>tres cosas distintas</b>') },
    ],
  },
  {
    id: 'file',
    beats: { create: L('with the two functions inside a class', 'con las dos funciones dentro de una clase'), cls: L('A shader is a normal class', 'Un shader es una clase normal'), using: L('There is a new', 'Hay un') },
    items: [
      { k: 'code', at: 'create', type: 'create+0.2', cps: 90, code: L(cs('MyShaders/Gradient.cs', 'using YotsubaShader.Language;\n\npublic class Gradient\n{\n    [ShaderStage(Stage.Vertex)]\n    public Pixel Vertex(…) { … }\n\n    [ShaderStage(Stage.Fragment)]\n    [return: location(0)]\n    public vec4 Fragment(PixelIn pixel) { … }\n}'), cs('MisShaders/Degradado.cs', 'using YotsubaShader.Language;\n\npublic class Degradado\n{\n    [ShaderStage(Stage.Vertex)]\n    public Pixel Vertex(…) { … }\n\n    [ShaderStage(Stage.Fragment)]\n    [return: location(0)]\n    public vec4 Fragment(PixelIn pixel) { … }\n}')),
        hl: [{ at: 'cls', until: 'using', lines: [2] }, { at: 'using', lines: [0] }],
        tags: [{ at: 'cls+0.4', line: 2, text: L('new Gradient()', 'new Degradado()') }] },
    ],
  },
  {
    id: 'targets',
    beats: { attr: L('Look at the line above', 'Mira la línea encima de'), tells: L('It tells the analyzer', 'Le dice al analizador'), which: L('which graphics APIs does', 'en qué APIs gráficas corre') },
    items: [
      { k: 'kicker', text: L('ShaderTargets', 'ShaderTargets') },
      { k: 'code', at: 'attr', type: 'attr+0.2', cps: 40, code: L(cs('MyShaders/Gradient.cs', '{{shaderAttrs}}\npublic class Gradient'), cs('MisShaders/Degradado.cs', '{{shaderAttrs}}\npublic class Degradado')),
        hl: [{ at: 'tells', lines: [0] }] },
      { k: 'text', at: 'which', text: L('Not what is generated: <b>where it runs</b>', 'No lo que se genera: <b>dónde corre</b>') },
    ],
  },
  {
    id: 'add',
    beats: { run: L('run the command you saw', 'ejecuta el comando que viste'), first: L('The first time it takes a while', 'La primera vez tarda un poco'), file: L('There is a new file you did not write', 'Hay un archivo nuevo que tú no escribiste'), adds: L('compiles every shader in your project', 'compila todos los shaders de tu proyecto'), cls: L('Your shader is a class', 'Tu shader es una clase') },
    items: [
      { k: 'term', at: 'run', type: 'run+0.2', cps: 40, code: L(term('yotsuba add MyShaders/MyShaders.csproj --target spirv'), term('yotsuba add MisShaders/MisShaders.csproj --target spirv')) },
      { k: 'row', at: 'file', items: [
        { k: 'box', cls: 's-mono', text: L('Gradient.cs', 'Degradado.cs'), at: 'file' },
        { k: 'arrow', at: 'file+0.3' },
        { k: 'box', cls: 'accent s-mono', text: 'add', at: 'file+0.6', fx: 'pop' },
        { k: 'arrow', at: 'file+0.9' },
        { k: 'box', cls: 'gpu s-mono', text: 'YotsubaShader.g.cs', at: 'file+1.2' },
      ] },
      { k: 'row', at: 'adds', items: ['ToGlsl', 'ToGlslEs', 'ToHlsl', 'ToMSL', 'ToSpirV'].map((m, i) => ({ k: 'word', cls: 's-mono s-gpu', text: m + '()', at: `adds+${(0.6 + i * 0.25).toFixed(2)}` })) },
      { k: 'text', at: 'cls', text: L('No files to load: <b>ask the class</b>', 'Sin archivos que cargar: <b>se lo pides a la clase</b>') },
    ],
  },
  {
    id: 'use',
    beats: { ask: L('its GLSL version', 'su versión en GLSL'), run: L('And run it', 'Y ejecútalo'), out: L('This is what comes out', 'Esto es lo que sale'), two: L('Look at these two lines', 'Mira estas dos líneas'), inn: L('The first one says', 'La primera dice'), outt: L('The second one says', 'La segunda dice'), real: L('is a real GLSL shader', 'es un shader de GLSL de verdad') },
    items: [
      { k: 'slot', items: [
        { k: 'code', at: 'ask', out: 'run', type: 'ask+0.3', cps: 45, code: L(cs('TryIt/Program.cs', 'var shader = new Gradient();\nConsole.WriteLine(shader.ToGlsl(Stage.Fragment));'), cs('Probar/Program.cs', 'var shader = new Degradado();\nConsole.WriteLine(shader.ToGlsl(Stage.Fragment));')) },
        { k: 'term', at: 'run', out: 'out', type: 'run+0.2', cps: 35, code: L(term('dotnet run --project TryIt'), term('dotnet run --project Probar')) },
        { k: 'code', at: 'out', type: 'out+0.2', cps: 110, code: { title: 'GLSL', lang: '', code: '#version 450\n\nlayout(location = 0) in vec2 pixel_Uv;\nlayout(location = 0) out vec4 _return;\n\nvec4 Vec4(float x, float y, float z, float w) { … }\n\nvoid main()\n{\n    _return = Vec4(1.0, 0.0, 0.0, 1.0);\n}' },
          hl: [{ at: 'inn', until: 'outt', lines: [2] }, { at: 'outt', until: 'real', lines: [3] }],
          tags: [{ at: 'inn+0.3', line: 2, text: L('door B', 'puerta B') }, { at: 'outt+0.3', line: 3, text: L('door C', 'puerta C') }] },
      ] },
      { k: 'text', at: 'real', text: L('A real GLSL shader, written from your C#', 'Un shader de GLSL de verdad, salido de tu C#'), mark: { at: 'real+0.5', kind: 'check' } },
    ],
  },
  {
    id: 'gradient',
    beats: { diff: L('what is different about one pixel', 'qué tiene de distinto un píxel'), uvy: L('is `0` at the top pixels', 'vale `0` en los píxeles de arriba'), replace: L('Replace the', 'Cambia el método'), math: L('Do the math for two pixels', 'Haz la cuenta para dos píxeles'), noloop: L('You did not write any loop', 'No escribiste ningún bucle') },
    items: [
      { k: 'slot', items: [
        { k: 'uv', width: 70, at: 0, out: 'replace', corners: 0, fill: 0, y: 'uvy' },
        { k: 'code', at: 'replace', out: 'math', type: 'replace+0.3', cps: 50, code: FRAGMENT_SUNSET },
        win(SUNSET_LIVE, 'math', { cls: 'window w60' }),
      ] },
      { k: 'row', at: 'math', items: [
        { k: 'box', cls: 's-mono', text: L('top · (1, 0.25, 0.45)', 'arriba · (1, 0.25, 0.45)'), sub: L('pink', 'rosa'), at: 'math+0.5' },
        { k: 'box', cls: 's-mono', text: L('bottom · (1, 0.85, 0.10)', 'abajo · (1, 0.85, 0.10)'), sub: L('orange-yellow', 'amarillo anaranjado'), at: 'math+1.5' },
      ] },
      { k: 'text', at: 'noloop', text: L('No loop: the GPU runs it <b>for each pixel</b>', 'Sin bucle: la GPU lo ejecuta <b>para cada píxel</b>') },
    ],
  },
  {
    id: 'apis',
    beats: { every: L('carries every format', 'trae todos los formatos'), three: L('three different languages', 'tres lenguajes distintos'), once: L('You wrote the shader only once', 'Escribiste el shader una sola vez') },
    items: [
      { k: 'box', cls: 'accent', text: 'C#', sub: L('written once', 'escrito una vez'), at: 'every', fx: 'pop' },
      { k: 'arrow', down: true, at: 'three' },
      { k: 'row', at: 'three', items: [
        { k: 'word', cls: 's-mono', text: 'GLSL', at: 'three+0.2' },
        { k: 'word', cls: 's-mono', text: 'HLSL', at: 'three+0.4' },
        { k: 'word', cls: 's-mono', text: 'SPIR-V', at: 'three+0.6' },
      ] },
      { k: 'gl', cls: 'w86', cols: 4, gap: 2, radius: 10, at: 'once', fx: 'fade', tiles: [['OpenGL', 'opengl'], ['DirectX', 'directx'], ['Metal', 'metal'], ['Vulkan', 'vulkan']]
        .map(([name, f], i) => ({ frag: SUNSET_LIVE, at: `once+${(0.2 + i * 0.2).toFixed(1)}`, cap: `<img src="/img/apis/${f}.svg" alt=""><b>${name}</b>` })) },
    ],
  },
  {
    id: 'screen',
    beats: { window: L('you need a window', 'hace falta una ventana'), viewer: L('That is why the next chapter', 'Por eso el siguiente capítulo') },
    items: [
      win(SUNSET_LIVE, 0.1, { cls: 'window w70' }),
      { k: 'text', at: 'window', text: L('To see it drawn: a <b>window</b> that sends the rectangle', 'Para verlo dibujado: una <b>ventana</b> que mande el rectángulo') },
      { k: 'text', at: 'viewer', text: L('Next: <b>your viewer</b>', 'Siguiente: <b>tu visor</b>') },
    ],
  },
  {
    id: 'learned',
    dense: true,
    beats: { a: L('A shader in C# is a few', 'Un shader en C# son unos'), b: L('Door A is a', 'La puerta A es un'), c: L('Door B is another', 'La puerta B es otro'), d: L('Door C is', 'La puerta C es'), e: L('Each door counts its slots from 0', 'Cada puerta cuenta sus casilleros desde 0'), f: L('Each stage is a method', 'Cada etapa es un método'), g: L('What Vertex returns reaches Fragment', 'Lo que devuelve Vertex le llega a Fragment'), h: L('The `add` command compiles', 'El comando `add` compila') },
    items: [
      { k: 'kicker', text: L('What you learned', 'Lo que aprendiste') },
      ...[['a', 'structs + a class', 'structs + una clase'], ['b', 'Door A · [location(n)]', 'Puerta A · [location(n)]'], ['c', 'Door B · [gl_Position]', 'Puerta B · [gl_Position]'], ['d', 'Door C · [return: location(0)]', 'Puerta C · [return: location(0)]'], ['e', 'Three location(0)', 'Tres location(0)'], ['f', '[ShaderStage]', '[ShaderStage]'], ['g', 'Uv, spread per pixel', 'Uv, repartido por píxel'], ['h', 'add → YotsubaShader.g.cs', 'add → YotsubaShader.g.cs']]
        .map(([b, en, es]) => ({ k: 'word', cls: 's-mono', at: b, fx: 'left', text: L(en, es), mark: { at: `${b}+0.4`, kind: 'check' } })),
    ],
  },
];

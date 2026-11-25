// Stage of "Your window for seeing shaders" — motion graphics shown next to the text while the chapter is read aloud.
// Each scene starts at its `> [!SCENE] id` cue in content/<lang>/get-started/visor.md. Scenes x_* are the MonoGame/KNI/FNA route,
// g_* the Godot route (a cue exists only on the page of its route); intro, template and learned are common to all.
// Every window is the live sunset gradient: blue while the window is empty, the shader once it is added, the red experiment.

const L = (en, es) => ({ en, es });
const term = (code) => ({ title: 'Terminal', code, lang: 'bash' });
const cs = (title, code) => ({ title, code, lang: 'csharp' });
const ENGINE_LOGO = { route: { kni: '/img/engines/kni.png', fna: '/img/engines/fna.png', godot: '/img/engines/godot.svg', raylib: '/img/engines/raylib.png', silknet: '/img/engines/silknet.svg', default: '/img/engines/monogame.png' } };
const win = (modes, at, extra = {}) => ({ k: 'gl', cls: 'window w50', title: '{{engine}}', logo: ENGINE_LOGO, at, fx: 'pop', radius: 10, tiles: [{ modes, aspect: '16 / 9', at }], ...extra });
const BLUE = 'return vec4(.39,.58,.93,1.);';
const SUNSET = 'return vec4(1.,1.-uv.y,uv.y*.6,1.);';
const REDX = 'return vec4(uv.x,1.-uv.y,uv.y*.6,1.);';
const BLACK = 'return vec4(0.,0.,0.,1.);';
const TREE = (n) => `.${n}`;

const NEW_PROJECT = L(term('dotnet new console -n Viewer -f net8.0\ndotnet add Viewer package {{enginePackage}}\ndotnet add Viewer reference MyShaders/MyShaders.csproj'), term('dotnet new console -n Visor -f net8.0\ndotnet add Visor package {{enginePackage}}\ndotnet add Visor reference MisShaders/MisShaders.csproj'));
const CYCLE_CMD = L(term('yotsuba add MyShaders/MyShaders.csproj \\\n  --target spirv --target {{plugin}} \\\n  && dotnet run --project Viewer -- Gradient'), term('yotsuba add MisShaders/MisShaders.csproj \\\n  --target spirv --target {{plugin}} \\\n  && dotnet run --project Visor -- Degradado'));
const RED_OLD = L(cs('MyShaders/Gradient.cs', 'float red = 1f;'), cs('MisShaders/Degradado.cs', 'float rojo = 1f;'));
const RED_NEW = L(cs('MyShaders/Gradient.cs', 'float red = pixel.Uv.X;'), cs('MisShaders/Degradado.cs', 'float rojo = pixel.Uv.X;'));
const NODES = (n) => [
  { k: 'box', cls: 'accent s-mono', text: L('Viewer', 'Visor'), sub: L('the root · the script', 'la raíz · el script'), at: n[0] },
  { k: 'box', cls: 's-mono', text: L('Screen', 'Pantalla'), sub: 'MeshInstance3D', at: n[1] },
  { k: 'box', cls: 's-mono', text: 'Camera3D', sub: L('to look through', 'para mirar'), at: n[2] },
];
const COMMAND_CYCLE = (steps) => ['1', '2', '3'].map((n, i) => ({ k: 'box', cls: i === 1 ? 'accent s-mono' : 's-mono', text: steps[i][0], sub: steps[i][1], at: steps[i][2] }));

export default [
  /* seeing is the point; the four-step loop; the window for step 3 */
  {
    id: 'intro',
    beats: { seen: L('is made to be seen', 'se hace para verse'), recipe: L('a recipe you never cook', 'una receta que nunca cocinas'), way: L('the way of working changes', 'cambia la forma de trabajar'), s1: L('You write a little code', 'Escribes un poco de código'), s2: L('You compile it', 'Lo compilas'), s3: L('You look at it in a window', 'Lo miras en una ventana'), s4: L('You change one number', 'Cambias un número'), win: L('you need that window', 'necesitas esa ventana'), once: L('just once', 'una sola vez') },
    items: [
      { k: 'kicker', text: L('Your window for seeing shaders', 'Tu ventana para ver shaders') },
      { k: 'text', at: 'seen', out: 'way', text: L('A shader is made to be <b>seen</b>', 'Un shader se hace para <b>verse</b>'), mark: { at: 'recipe', kind: 'x' } },
      { k: 'row', at: 'way', items: [
        { k: 'box', cls: 's-mono', text: '1', sub: L('write code', 'escribes'), at: 's1' },
        { k: 'arrow', at: 's1+0.6' },
        { k: 'box', cls: 's-mono', text: '2', sub: L('compile', 'compilas'), at: 's2' },
        { k: 'arrow', at: 's2+0.6' },
        { k: 'box', cls: 'accent s-mono', text: '3', sub: L('look', 'miras'), at: 's3' },
        { k: 'arrow', at: 's3+0.6' },
        { k: 'box', cls: 's-mono', text: '4', sub: L('change a number', 'cambias un número'), at: 's4' },
      ] },
      win([{ frag: SUNSET }], 'win', { cls: 'window w50' }),
    ],
  },

  /* ——— MonoGame / KNI / FNA ——— */
  {
    id: 'x_viewer',
    beats: { prog: L('a program of about 70 lines', 'un programa de unas 70 líneas'), a: L('It opens a window', 'Abre una ventana'), b: L('It draws a rectangle', 'Dibuja un rectángulo'), c: L('It puts on it the shader', 'Le pone encima el shader'), not: L('not part of your shader', 'no forma parte de tu shader'), bench: L('a bench for testing parts', 'un banco para probar piezas'), same: L('works the same on', 'funciona igual en') },
    items: [
      { k: 'kicker', text: L('What the viewer is', 'Qué es el visor') },
      { k: 'row', at: 'prog', out: 'not', items: [
        { k: 'box', cls: 's-mono', text: L('window', 'ventana'), sub: L('opens', 'abre'), at: 'a' },
        { k: 'box', cls: 's-mono', text: L('rectangle', 'rectángulo'), sub: L('covers it all', 'la cubre entera'), at: 'b' },
        { k: 'box', cls: 'accent s-mono', text: 'shader', sub: L('the one you name', 'el que indiques'), at: 'c' },
      ] },
      { k: 'row', at: 'not', items: [
        { k: 'box', cls: 's-mono', text: L('Viewer', 'Visor'), sub: L('a tool', 'una herramienta'), at: 'not' },
        { k: 'word', text: '≠', at: 'not+0.5', fx: 'pop' },
        { k: 'box', cls: 'accent s-mono', text: L('MyShaders', 'MisShaders'), sub: L('know nothing about windows', 'no saben de ventanas'), at: 'not+0.8' },
      ] },
      { k: 'text', at: 'same', text: L('Windows · Mac · Linux', 'Windows · Mac · Linux') },
    ],
  },
  {
    id: 'x_project',
    beats: { from: L('From the Tutorial folder', 'Desde la carpeta Tutorial'), l1: L('creates an empty console program', 'crea un programa de consola vacío'), l2: L('The second', 'La segunda'), l3: L('The third', 'La tercera'), tree: L('Your folder looks like this', 'Tu carpeta queda así') },
    items: [
      { k: 'kicker', text: L('Step 1 · the project', 'Paso 1 · el proyecto') },
      { k: 'term', at: 'from', out: 'tree', type: 'from+0.5', cps: 28, code: NEW_PROJECT, hl: [{ at: 'l1', until: 'l2', lines: [0] }, { at: 'l2', until: 'l3', lines: [1] }, { at: 'l3', lines: [2] }] },
      { k: 'row', at: 'tree', items: [
        { k: 'box', cls: 's-mono', text: L('MyShaders', 'MisShaders'), sub: L('your shaders', 'tus shaders'), at: 'tree' },
        { k: 'box', cls: 's-mono', text: L('TryIt', 'Probar'), sub: L('the console', 'la consola'), at: 'tree+0.5' },
        { k: 'box', cls: 'accent s-mono', text: L('Viewer', 'Visor'), sub: L('new: the window', 'nuevo: la ventana'), at: 'tree+1' },
      ] },
    ],
  },
  {
    id: 'x_vertex',
    beats: { saw: L('the game hands the shader a list of vertices', 'el juego le entrega al shader una lista de vértices'), same: L('the same thing on the plain C# side', 'lo mismo del lado de C# normal'), match: L('matches your', 'coincida con tu'), slot0: L('slot 0', 'ranura 0'), slot1: L('slot 1', 'ranura 1'), change: L('you will have to change', 'tendrás que cambiar') },
    items: [
      { k: 'kicker', text: L('Step 2 · the vertex, on the window side', 'Paso 2 · el vértice, del lado de la ventana') },
      { k: 'row', at: 'same', items: [
        { k: 'box', cls: 's-mono', text: L('Corner', 'Vertice'), sub: L('in the shader', 'en el shader'), at: 'same' },
        { k: 'word', text: '=', at: 'match', fx: 'pop' },
        { k: 'box', cls: 'accent s-mono', text: L('ScreenCorner', 'Esquina'), sub: L('in plain C#', 'en C# normal'), at: 'match' },
      ] },
      { k: 'row', at: 'slot0', items: [
        { k: 'box', cls: 's-mono', text: '0', sub: L('position · 2 numbers', 'posición · 2 números'), at: 'slot0' },
        { k: 'box', cls: 's-mono', text: '1', sub: L('Uv · 2 numbers', 'Uv · 2 números'), at: 'slot1' },
      ] },
      { k: 'text', at: 'change', text: L('Change one, change <b>both</b>', 'Cambia uno, cambia <b>los dos</b>') },
    ],
  },
  {
    id: 'x_window',
    beats: { parts: L('Look at the three parts', 'Mira las tres partes'), name: L('takes the name of the shader', 'toma el nombre del shader'), size: L('800 by 450 pixels', '800 por 450 píxeles'), esc: L('when you press', 'cuando pulsas'), blue: L('paints it blue', 'la pinta de azul'), run: L('Run it', 'Ejecútalo'), see: L('A blue window should appear', 'Debe aparecer una ventana azul') },
    items: [
      { k: 'kicker', text: L('Step 3 · an empty window', 'Paso 3 · una ventana vacía') },
      { k: 'row', at: 'parts', out: 'run', items: [
        { k: 'box', cls: 's-mono', text: 'args[0]', sub: L('the shader name', 'el nombre del shader'), at: 'name' },
        { k: 'box', cls: 's-mono', text: '800 × 450', sub: L('wide on purpose', 'ancha a propósito'), at: 'size' },
        { k: 'box', cls: 'accent s-mono', text: 'Esc', sub: L('closes the window', 'cierra la ventana'), at: 'esc' },
      ] },
      { k: 'term', at: 'run', type: 'run+0.3', cps: 30, code: term('dotnet run --project Viewer') },
      win([{ frag: BLUE }], 'see', { cls: 'window w50' }),
    ],
  },
  {
    id: 'x_shader',
    beats: { four: L('four changes in the same file', 'cuatro cambios en el mismo archivo'), c1: L('Change 1', 'Cambio 1'), c2: L('Change 2', 'Cambio 2'), c3: L('Change 3', 'Cambio 3'), c4: L('Change 4', 'Cambio 4'), preview: L('are a preview', 'son un adelanto'), whole: L('this is the complete file', 'así queda el archivo completo') },
    items: [
      { k: 'kicker', text: L('Step 4 · add the shader', 'Paso 4 · agrega el shader') },
      { k: 'row', at: 'four', items: [
        { k: 'box', cls: 's-mono', text: '1', sub: L('two using lines', 'dos using'), at: 'c1' },
        { k: 'box', cls: 's-mono', text: '2', sub: L('the shader + 4 corners', 'el shader + 4 esquinas'), at: 'c2' },
        { k: 'box', cls: 's-mono', text: '3', sub: L('a method that loads it', 'un método que lo carga'), at: 'c3' },
        { k: 'box', cls: 'accent s-mono', text: '4', sub: L('Draw draws it', 'Draw lo dibuja'), at: 'c4' },
      ] },
      win([{ frag: BLUE }, { at: 'c4+4', frag: SUNSET }], 'c4', { cls: 'window w50' }),
      { k: 'text', at: 'preview', text: L('<b>Parameters</b>: size and time, for later', '<b>Parameters</b>: tamaño y tiempo, para más adelante') },
    ],
  },
  {
    id: 'x_see',
    beats: { now: L('Now for real', 'Ahora sí'), run: L('enough to run the viewer', 'basta con ejecutar el visor'), after: L('What comes after', 'Lo que va después de'), yours: L('That is your shader', 'Ese es tu shader'), esc: L('Close it with', 'Ciérralo con') },
    items: [
      { k: 'kicker', text: L('Step 5 · your first shader', 'Paso 5 · tu primer shader') },
      { k: 'term', at: 'run', out: 'yours', type: 'run+0.3', cps: 30, code: L(term('dotnet run --project Viewer -- Gradient'), term('dotnet run --project Visor -- Degradado')), hl: [{ at: 'after', lines: [0] }] },
      win([{ frag: SUNSET }], 'yours', { cls: 'window w60' }),
    ],
  },
  {
    id: 'x_cycle',
    beats: { cycle: L('the cycle you will use', 'el ciclo que usarás'), edit: L('You edit', 'Editas'), compile: L('You compile', 'Compilas'), look: L('You look', 'Miras'), one: L('fit on one line', 'caben en una línea'), and: L('and if that went well', 'y si salió bien'), target: L('There is one new thing in the command', 'Hay algo nuevo en el comando'), first: L('Try it now', 'Pruébalo ahora'), change: L('Change it to this', 'Cámbiala por esta'), grows: L('now it grows from left to right', 'ahora crece de izquierda a derecha'), back: L('put the line back', 'devuelve la línea') },
    items: [
      { k: 'kicker', text: L('The work cycle', 'El ciclo de trabajo') },
      { k: 'row', at: 'cycle', out: 'one', items: [
        { k: 'box', cls: 's-mono', text: L('edit', 'editar'), sub: 'MyShaders', at: 'edit' },
        { k: 'arrow', at: 'edit+0.6' },
        { k: 'box', cls: 'accent s-mono', text: L('compile', 'compilar'), sub: 'add', at: 'compile' },
        { k: 'arrow', at: 'compile+0.6' },
        { k: 'box', cls: 's-mono', text: L('look', 'mirar'), sub: L('the viewer', 'el visor'), at: 'look' },
      ] },
      { k: 'term', at: 'one', out: 'first', type: 'one+0.3', cps: 45, code: CYCLE_CMD, hl: [{ at: 'and', lines: [2] }, { at: 'target', lines: [1] }] },
      { k: 'code', at: 'first', out: 'change+1', type: 'first+0.5', cps: 30, code: RED_OLD, hl: [{ at: 'first', lines: [0] }] },
      { k: 'code', at: 'change', type: 'change+0.3', cps: 30, code: RED_NEW },
      win([{ frag: SUNSET }, { at: 'change+3', frag: REDX }, { at: 'back', frag: SUNSET }], 'change+2', { cls: 'window w50' }),
    ],
  },

  /* ——— Godot ——— */
  {
    id: 'g_viewer',
    beats: { small: L('a small Godot scene', 'pequeña escena de Godot'), a: L('It draws a rectangle', 'Dibuja un rectángulo'), b: L('It puts on it the shader you name', 'Le pone encima el shader que le nombres'), c: L('the window size and the time', 'el tamaño de la ventana y el tiempo'), not: L('not part of your shader', 'no forma parte de tu shader'), bench: L('a bench for testing parts', 'un banco para probar piezas') },
    items: [
      { k: 'kicker', text: L('What the viewer is', 'Qué es el visor') },
      { k: 'row', at: 'small', out: 'not', items: [
        { k: 'box', cls: 's-mono', text: L('rectangle', 'rectángulo'), sub: L('covers the window', 'cubre la ventana'), at: 'a' },
        { k: 'box', cls: 'accent s-mono', text: 'shader', sub: L('the one you name', 'el que nombres'), at: 'b' },
        { k: 'box', cls: 's-mono', text: L('size + time', 'tamaño + tiempo'), sub: L('if it asks', 'si los pide'), at: 'c' },
      ] },
      { k: 'row', at: 'not', items: [
        { k: 'box', cls: 's-mono', text: L('Viewer', 'Visor'), sub: L('a tool', 'una herramienta'), at: 'not' },
        { k: 'word', text: '≠', at: 'not+0.5', fx: 'pop' },
        { k: 'box', cls: 'accent s-mono', text: L('MyShaders', 'MisShaders'), sub: L('know nothing about Godot', 'no saben de Godot'), at: 'not+0.8' },
      ] },
    ],
  },
  {
    id: 'g_scene',
    beats: { key: L('the key idea of this route', 'la idea clave de esta ruta'), meshes: L('meshes', 'mallas'), three: L('a scene with three nodes', 'una escena con tres nodos'), root: L('The root', 'La raíz'), screen: L('node', 'nodo'), cam: L('The camera', 'La cámara'), margin: L('The margin', 'El margen'), why: L('do not throw this object away', 'no tires este objeto'), script: L('The script', 'El script'), corners: L('The corners are the same table', 'Las esquinas son la misma tabla'), flip: L('goes the other way', 'va al revés'), ready: L('runs once', 'se ejecuta una vez') },
    items: [
      { k: 'kicker', text: L('Step 1 · the rectangle and the window', 'Paso 1 · el rectángulo y la ventana') },
      { k: 'row', at: 'three', out: 'margin', items: NODES(['root', 'screen', 'cam']) },
      { k: 'row', at: 'margin', out: 'script', items: [
        { k: 'box', cls: 's-mono', text: 'Extra Cull Margin', sub: '16384', at: 'margin' },
        { k: 'text', at: 'why', text: L('"do not throw this object away"', '"no tires este objeto"') },
      ] },
      { k: 'row', at: 'script', items: [
        { k: 'box', cls: 's-mono', text: L('Viewer', 'Visor'), sub: L('+ script', '+ script'), at: 'script' },
        { k: 'box', cls: 's-mono', text: '_ready()', sub: L('once', 'una vez'), at: 'ready' },
        { k: 'box', cls: 'accent s-mono', text: '_process()', sub: L('every frame', 'cada fotograma'), at: 'ready+1' },
      ] },
      { k: 'text', at: 'flip', text: L('Godot: <b>Y = −1</b> is the top', 'Godot: <b>Y = −1</b> es arriba') },
    ],
  },
  {
    id: 'g_see',
    beats: { save: L('Save the scene', 'Guarda la escena'), play: L('Press', 'Pulsa'), select: L('Select Current', 'Select Current'), translates: L('the addon translates', 'el addon traduce'), yours: L('That is your shader', 'Ese es tu shader'), close: L('Close the window', 'Cierra la ventana') },
    items: [
      { k: 'kicker', text: L('Step 2 · your first shader', 'Paso 2 · tu primer shader') },
      { k: 'row', at: 'save', out: 'play', items: NODES(['save', 'save+0.4', 'save+0.8']) },
      { k: 'row', at: 'play', out: 'yours', items: [
        { k: 'box', cls: 's-mono', text: 'Play ▶', at: 'play' },
        { k: 'arrow', at: 'translates-0.4' },
        { k: 'box', cls: 'accent s-mono', text: 'yotsuba', sub: L('translates MyShaders', 'traduce MisShaders'), at: 'translates' },
      ] },
      win([{ frag: SUNSET }], 'yours', { cls: 'window w60' }),
    ],
  },
  {
    id: 'g_cycle',
    beats: { cycle: L('the rest of the tutorial', 'el resto del tutorial'), edit: L('You edit', 'Editas'), play: L('You press Play', 'Pulsas Play'), look: L('You look', 'Miras'), first: L('Try it with your first experiment', 'Pruébalo con tu primer experimento'), change: L('Change it to this', 'Cámbiala por esta'), grows: L('now it grows from left to right', 'ahora crece de izquierda a derecha'), back: L('put the line back', 'vuelve la línea') },
    items: [
      { k: 'kicker', text: L('The work cycle', 'El ciclo de trabajo') },
      { k: 'row', at: 'cycle', out: 'first', items: [
        { k: 'box', cls: 's-mono', text: L('edit', 'editar'), sub: 'MyShaders', at: 'edit' },
        { k: 'arrow', at: 'edit+0.6' },
        { k: 'box', cls: 'accent s-mono', text: 'Play ▶', sub: L('compiles for you', 'compila por ti'), at: 'play' },
        { k: 'arrow', at: 'play+0.8' },
        { k: 'box', cls: 's-mono', text: L('look', 'mirar'), at: 'look' },
      ] },
      { k: 'code', at: 'first', out: 'change+1', type: 'first+0.5', cps: 30, code: RED_OLD },
      { k: 'code', at: 'change', type: 'change+0.3', cps: 30, code: RED_NEW },
      win([{ frag: SUNSET }, { at: 'change+3', frag: REDX }, { at: 'back', frag: SUNSET }], 'change+2', { cls: 'window w50' }),
    ],
  },

  /* ——— common ——— */
  {
    id: 'template',
    beats: { every: L('create a new shader', 'vas a crear un shader nuevo'), mold: L('as a mold', 'como molde'), copy: L('Copy the file', 'Copia el archivo'), rename: L('change public class', 'cambia public class'), same: L('has to match', 'tiene que coincidir'), black: L('returns black', 'devuelve negro'), ready: L('ready for you', 'listo para que tú'), check: L('Check that everything works', 'Comprueba que todo funciona'), dark: L('completely black window', 'ventana completamente negra') },
    items: [
      { k: 'kicker', text: L('A starting file', 'Un archivo de partida') },
      { k: 'row', at: 'every', out: 'copy', items: [
        { k: 'box', cls: 'accent s-mono', text: 'Template.cs', sub: L('the mold', 'el molde'), at: 'mold' },
        { k: 'arrow', at: 'mold+0.6' },
        { k: 'box', cls: 's-mono', text: 'Colors.cs', at: 'mold+0.9' },
        { k: 'box', cls: 's-mono', text: 'Plasma.cs', at: 'mold+1.2' },
      ] },
      { k: 'code', at: 'copy', out: 'black', type: 'copy+0.3', cps: 40, code: L(cs('MyShaders/Colors.cs', 'public class Template  →  public class Colors'), cs('MisShaders/Colores.cs', 'public class Plantilla  →  public class Colores')), hl: [{ at: 'rename', lines: [0] }] },
      win([{ frag: BLACK }], 'black', { cls: 'window w40' }),
    ],
  },
  {
    id: 'learned',
    dense: true,
    beats: { a: L('To see a shader you need a window', 'Para ver un shader hace falta una ventana'), b: L('The work cycle', 'El ciclo de trabajo'), c: L('is the mold for all the shaders', 'es el molde de todos los shaders') },
    items: [
      { k: 'kicker', text: L('What you learned', 'Lo que aprendiste') },
      ...[['a', 'the viewer = a window, apart from your shaders', 'el visor = una ventana, aparte de tus shaders'], ['b', 'edit → add → look', 'editar → add → mirar'], ['c', 'Template.cs = the mold', 'Plantilla.cs = el molde']]
        .map(([b, en, es]) => ({ k: 'word', cls: 's-mono', at: b, fx: 'left', text: L(en, es), mark: { at: `${b}+0.4`, kind: 'check' } })),
    ],
  },
];

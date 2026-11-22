// Stage of "The CLI" — motion graphics shown next to the text while the chapter is read aloud.
// Each scene starts at its `> [!SCENE] id` cue in content/<lang>/get-started/cli.md. Everything here is a command, a file or a flow:
// add vs compile, the five steps of add, the methods it writes, plugins, the output folder, the formats and the <Target> in the .csproj.

const L = (en, es) => ({ en, es });
const cs = (title, code) => ({ title, code, lang: 'csharp' });
const term = (code) => ({ title: 'Terminal', code, lang: 'bash' });
const text = (title, code) => ({ title, code, lang: 'text' });
const SH = L('MyShaders', 'MisShaders');

const ADD = L(term('yotsuba add MyShaders/MyShaders.csproj --target spirv'), term('yotsuba add MisShaders/MisShaders.csproj --target spirv'));
const ADD_ENGINE = L(term('yotsuba add MyShaders/MyShaders.csproj \\\n  --target spirv --target {{plugin}}'), term('yotsuba add MisShaders/MisShaders.csproj \\\n  --target spirv --target {{plugin}}'));
const PLUGINS = term('yotsuba plugin list\nyotsuba plugin install monogame\nyotsuba plugin update monogame\nyotsuba plugin remove monogame');
const COMPILE = L(term('yotsuba compile MyShaders/MyShaders.csproj \\\n  --target glsl --target hlsl --target msl --target spirv \\\n  --output out'), term('yotsuba compile MisShaders/MisShaders.csproj \\\n  --target glsl --target hlsl --target msl --target spirv \\\n  --output salida'));
const TREE = L(text('MyShaders/out/', `MyShaders/out/MyShaders/
├── Gradient.Fragment.glsl
├── Gradient.Vertex.glsl
├── Gradient.Fragment.hlsl
├── Gradient.Vertex.hlsl
├── Gradient.spv
└── …`), text('MisShaders/salida/', `MisShaders/salida/MisShaders/
├── Degradado.Fragment.glsl
├── Degradado.Vertex.glsl
├── Degradado.Fragment.hlsl
├── Degradado.Vertex.hlsl
├── Degradado.spv
└── …`));
const TARGET = { title: 'MyShaders/MyShaders.csproj', lang: 'xml', code: `<Target Name="CompileShaders"
        BeforeTargets="CoreCompile"
        Condition="'$(DesignTimeBuild)' != 'true'">
  <Exec Command="yotsuba add … --target spirv" />
  <ItemGroup>
    <Compile Remove="YotsubaShader.g.cs" />
    <Compile Include="YotsubaShader.g.cs" />
  </ItemGroup>
</Target>` };
const RUN = L(term('dotnet run --project TryIt'), term('dotnet run --project Probar'));
const stagger = (arr, beat, start = 0, step = 0.5) => arr.map((a, i) => ({ ...a, at: `${beat}+${(start + i * step).toFixed(1)}` }));

export default [
  /* the whole CLI: one command used so far, what else exists */
  {
    id: 'intro',
    beats: { one: L('a single command', 'un solo comando'), whole: L('the whole CLI', 'la CLI completa'), other: L('what other command it has', 'qué otro comando tiene'), formats: L('what formats it can generate', 'qué formatos puede generar'), stop: L('stop typing the command by hand', 'dejar de escribir el comando a mano') },
    items: [
      { k: 'kicker', text: L('The CLI', 'La CLI') },
      { k: 'term', at: 'one', out: 'whole', type: 'one+0.2', cps: 40, code: ADD },
      { k: 'row', at: 'whole', items: [
        { k: 'box', cls: 'accent s-mono', text: 'add', at: 'whole' },
        { k: 'box', cls: 's-mono', text: 'compile', sub: L('what other command', 'qué otro comando'), at: 'other' },
        { k: 'box', cls: 's-mono', text: 'plugin', at: 'other+0.6' },
      ] },
      { k: 'row', at: 'formats', items: [
        { k: 'box', cls: 's-mono', text: L('formats', 'formatos'), sub: 'spirv · glsl · hlsl · msl', at: 'formats' },
        { k: 'box', cls: 'accent s-mono', text: L('automatic', 'automático'), sub: 'add', at: 'stop' },
      ] },
    ],
  },
  /* the two commands compile the same thing; they differ in where the result goes */
  {
    id: 'two',
    beats: { both: L('Both compile the same thing', 'Los dos compilan lo mismo'), where: L('where they leave the result', 'dónde dejan el resultado') },
    items: [
      { k: 'kicker', text: L('The two commands', 'Los dos comandos') },
      { k: 'row', at: 'both', items: [
        { k: 'box', cls: 's-mono', text: L('Your C# shaders', 'Tus shaders en C#'), at: 'both' },
        { k: 'arrow', at: 'both+0.6' },
        { k: 'box', cls: 'gpu s-mono', text: L('the compiler', 'el compilador'), at: 'both+0.9' },
      ] },
      { k: 'row', at: 'where', items: [
        { k: 'box', cls: 'accent s-mono', text: 'add', sub: L('inside your project', 'dentro de tu proyecto'), at: 'where' },
        { k: 'box', cls: 's-mono', text: 'compile', sub: L('in files', 'en archivos'), at: 'where+0.6' },
      ] },
      { k: 'row', at: 'where+1.6', items: [
        { k: 'box', cls: 'accent s-mono', text: 'YotsubaShader.g.cs', sub: L('a C# file · the normal case', 'un archivo de C# · lo normal'), at: 'where+1.6' },
        { k: 'box', cls: 's-mono', text: '.glsl · .hlsl · .spv', sub: L('separate files · for anything not C#', 'archivos separados · para lo que no es C#'), at: 'where+2.4' },
      ] },
    ],
  },
  /* add: five steps, the methods it writes, the C# compiler looks after you */
  {
    id: 'add',
    beats: { known: L('You already know it', 'Ya lo conoces'), s1: L('It opens your', 'Abre tu'), s2: L('It checks that the project compiles', 'Comprueba que el proyecto compila'), s3: L('It looks for every class', 'Busca todas las clases'), s4: L('It compiles each one', 'Compila cada una'), s5: L('It writes', 'Escribe'), methods: L('adds these methods', 'añade estos métodos'), stage: L('The ones that ask for a', 'Los que piden un'), good: L('the C# compiler looks after you', 'el compilador de C# te cuida'), rename: L('If you rename the', 'Si renombras la clase'), fix: L('until you fix it', 'hasta que lo arregles') },
    items: [
      { k: 'kicker', text: 'add' },
      { k: 'term', at: 'known', out: 's1', type: 'known+0.2', cps: 40, code: ADD },
      { k: 'row', at: 's1', out: 'methods', items: [
        { k: 'box', cls: 's-mono', text: '1', sub: L('reads the .csproj', 'lee el .csproj'), at: 's1' },
        { k: 'box', cls: 's-mono', text: '2', sub: L('checks it compiles', 'comprueba que compila'), at: 's2' },
        { k: 'box', cls: 's-mono', text: '3', sub: '[ShaderStage]', at: 's3' },
        { k: 'box', cls: 's-mono', text: '4', sub: L('compiles each', 'compila cada una'), at: 's4' },
        { k: 'box', cls: 'accent s-mono', text: '5', sub: 'YotsubaShader.g.cs', at: 's5' },
      ] },
      { k: 'row', at: 'methods', out: 'good', items: [
        { k: 'box', cls: 's-mono', text: 'ToSpirV()', sub: 'Vulkan', at: 'methods' },
        { k: 'box', cls: 's-mono', text: 'ToGlsl(Stage)', sub: 'OpenGL', at: 'methods+0.4' },
        { k: 'box', cls: 's-mono', text: 'ToGlslEs(Stage)', sub: 'OpenGL ES · WebGL', at: 'methods+0.8' },
        { k: 'box', cls: 's-mono', text: 'ToHlsl(Stage)', sub: 'DirectX', at: 'methods+1.2' },
        { k: 'box', cls: 's-mono', text: 'ToMSL(Stage)', sub: 'Metal', at: 'methods+1.6' },
      ] },
      { k: 'row', at: 'stage', out: 'good', items: [
        { k: 'box', cls: 's-mono', text: 'Stage.Vertex', at: 'stage' },
        { k: 'box', cls: 's-mono', text: 'Stage.Fragment', at: 'stage+0.6' },
      ] },
      { k: 'row', at: 'good', items: [
        { k: 'box', cls: 's-bad s-mono', text: L('class Gradient → Gradient2', 'class Degradado → Degradado2'), sub: L('your program stops compiling', 'tu programa deja de compilar'), at: 'rename', mark: { at: 'rename+1', kind: 'x' } },
        { k: 'box', cls: 'accent s-mono', text: L('you find out at compile time', 'lo descubres al compilar'), at: 'fix' },
      ] },
    ],
  },
  /* the engine methods come from plugins, one --target each */
  {
    id: 'targets',
    beats: { five: L('The first five come with the CLI', 'Los cinco primeros vienen con la CLI'), plug: L('come from plugins', 'vienen de plugins'), example: L('For example', 'Por ejemplo'), note: L('requires at least one', 'exige al menos un') },
    items: [
      { k: 'kicker', text: L('Engines come from plugins', 'Los motores vienen de plugins') },
      { k: 'row', at: 'five', out: 'plug', items: [
        { k: 'box', cls: 's-mono', text: 'ToSpirV · ToGlsl · ToGlslEs · ToHlsl · ToMSL', sub: L('come with the CLI', 'vienen con la CLI'), at: 'five' },
      ] },
      { k: 'row', at: 'plug', out: 'example', items: [
        { k: 'box', cls: 's-mono', text: 'ToMGFX', sub: '--target monogame', at: 'plug' },
        { k: 'box', cls: 's-mono', text: 'ToKNIWebGL_FX', sub: '--target kni', at: 'plug+0.4' },
        { k: 'box', cls: 's-mono', text: 'ToFNA_FX', sub: '--target fna', at: 'plug+0.8' },
        { k: 'box', cls: 's-mono', text: 'ToGodotShader', sub: '--target godot', at: 'plug+1.2' },
      ] },
      { k: 'term', at: 'example', type: 'example+0.3', cps: 35, code: ADD_ENGINE, hl: [{ at: 'note', lines: [1] }] },
      { k: 'text', at: 'note', text: L('At least <b>one --target</b> · always', 'Al menos <b>un --target</b> · siempre') },
    ],
  },
  /* plugins: a small NuGet package that teaches the CLI a format; four commands; your game does not reference it */
  {
    id: 'plugins',
    beats: { what: L('A plugin is a small NuGet package', 'Un plugin es un paquete NuGet'), first: L('downloads it the first time', 'descarga la primera vez'), cmds: L('commands to manage them', 'comandos para manejarlos'), only: L('used only by the CLI', 'lo usa solo la CLI'), game: L('Your game does not reference it', 'Tu juego no lo referencia') },
    items: [
      { k: 'kicker', text: 'Plugins' },
      { k: 'row', at: 'what', out: 'cmds', items: [
        { k: 'box', cls: 's-mono', text: 'CLI', at: 'what' },
        { k: 'arrow', at: 'first-0.4' },
        { k: 'box', cls: 'accent s-mono', text: 'plugin', sub: 'NuGet', at: 'first' },
        { k: 'word', text: '+ format', at: 'first+0.8', fx: 'pop' },
      ] },
      { k: 'term', at: 'cmds', out: 'only', type: 'cmds+0.3', cps: 28, code: PLUGINS },
      { k: 'row', at: 'only', items: [
        { k: 'box', cls: 'accent s-mono', text: 'CLI', sub: L('uses the plugin', 'usa el plugin'), at: 'only' },
        { k: 'box', cls: 's-bad s-mono', text: L('your game', 'tu juego'), sub: L('does not reference it', 'no lo referencia'), at: 'game', mark: { at: 'game+1', kind: 'x' } },
      ] },
    ],
  },
  /* compile: choose the formats and the folder; how to read the file names */
  {
    id: 'compile',
    beats: { with: L('you choose the formats', 'eliges los formatos'), out: L('the folder to put them in', 'la carpeta donde dejarlos'), appears: L('this is what appears', 'esto es lo que aparece'), read: L('How to read those names', 'Cómo leer esos nombres'), ns: L('is the namespace', 'es el namespace'), one: L('one file per stage', 'un archivo por etapa'), spv: L('SPIR-V generates a single file', 'SPIR-V genera un solo archivo'), details: L('Two details', 'Dos detalles'), path: L('The path is counted from', 'La ruta se cuenta desde'), artifacts: L('is called artifacts', 'se llama artifacts') },
    items: [
      { k: 'kicker', text: 'compile' },
      { k: 'term', at: 'with', out: 'appears', type: 'with+0.2', cps: 55, code: COMPILE, hl: [{ at: 'with', until: 'out', lines: [1] }, { at: 'out', lines: [2] }] },
      { k: 'code', at: 'appears', type: 'appears+0.3', cps: 35, code: TREE, hl: [{ at: 'ns', lines: [0] }, { at: 'one', lines: [1, 2, 3, 4] }, { at: 'spv', lines: [5] }] },
      { k: 'row', at: 'details', items: [
        { k: 'box', cls: 's-mono', text: '--output out', sub: L('counted from the .csproj', 'desde la carpeta del .csproj'), at: 'path' },
        { k: 'box', cls: 's-mono', text: L('no --output', 'sin --output'), sub: 'artifacts', at: 'artifacts' },
      ] },
    ],
  },
  /* the formats you can ask for with --target */
  {
    id: 'formats',
    beats: { f: L('The formats you can ask for', 'Los formatos que puedes pedir') },
    items: [
      { k: 'kicker', text: '--target' },
      { k: 'row', at: 'f', items: stagger([
        { k: 'box', cls: 's-mono', text: 'spirv', sub: '.spv · Vulkan' },
        { k: 'box', cls: 's-mono', text: 'glsl', sub: '.glsl · OpenGL' },
        { k: 'box', cls: 's-mono', text: 'gles', sub: '.gles · mobile, web' },
        { k: 'box', cls: 's-mono', text: 'hlsl', sub: '.hlsl · DirectX' },
        { k: 'box', cls: 's-mono', text: 'msl', sub: '.msl · Metal' },
        { k: 'box', cls: 's-mono', text: 'cpp', sub: '.cpp' },
      ], 'f', 0.2, 0.15) },
      { k: 'row', at: 'f+1.4', items: stagger([
        { k: 'box', cls: 'accent s-mono', text: 'monogame', sub: '.mgfx · plugin' },
        { k: 'box', cls: 'accent s-mono', text: 'kni', sub: '.knifx · plugin' },
        { k: 'box', cls: 'accent s-mono', text: 'fna', sub: '.fxb · plugin' },
        { k: 'box', cls: 'accent s-mono', text: 'godot', sub: '.gdshader · plugin' },
      ], 'f', 1.4, 0.15) },
    ],
  },
  /* make add run on its own: a <Target> in the csproj that runs before compiling */
  {
    id: 'auto',
    beats: { tiring: L('gets tiring', 'cansa'), forget: L('you forget', 'se te olvida'), ask: L('You can ask .NET', 'Puedes pedirle a .NET'), open: L('Open', 'Abre'), before: L('right before compiling', 'justo antes de compilar'), exec: L('the usual add command', 'el comando add de siempre'), two: L('The two', 'Las dos líneas de'), cond: L('keeps it from running', 'evita que se ejecute'), enough: L('this is all you need', 'te basta con esto'), change: L('Change a number', 'Cambia un número') },
    items: [
      { k: 'kicker', text: L('Make add run on its own', 'Que add se ejecute solo') },
      { k: 'text', at: 'tiring', out: 'ask', text: L('Typing it after every change <b>gets tiring</b>', 'Escribirlo tras cada cambio <b>cansa</b>'), mark: { at: 'forget', kind: 'x' } },
      { k: 'code', at: 'open', out: 'enough', type: 'open+0.3', cps: 60, code: TARGET, hl: [{ at: 'before', until: 'exec', lines: [1] }, { at: 'exec', until: 'two', lines: [3] }, { at: 'two', until: 'cond', lines: [5, 6] }, { at: 'cond', lines: [2] }] },
      { k: 'term', at: 'enough', type: 'enough+0.3', cps: 30, code: RUN },
      { k: 'text', at: 'change', text: L('Change a number · run · <b>it shows up</b>', 'Cambia un número · ejecuta · <b>ya sale</b>') },
    ],
  },
  /* common errors: four of them and their fixes; the build-first tip */
  {
    id: 'wrong',
    beats: { msgs: L('you will see most', 'que más vas a ver'), build: L('run dotnet build', 'ejecuta primero dotnet build'), deps: L('already downloaded its dependencies', 'ya haya descargado sus dependencias') },
    items: [
      { k: 'kicker', text: L('When something goes wrong', 'Cuando algo sale mal') },
      { k: 'row', at: 'msgs', out: 'build', items: stagger([
        { k: 'box', cls: 's-bad s-mono', text: 'error CS…', sub: L('fix it like any C# error', 'arréglalo como un error de C#') },
        { k: 'box', cls: 's-bad s-mono', text: 'CS0234', sub: L('delete YotsubaShader.g.cs', 'borra YotsubaShader.g.cs') },
        { k: 'box', cls: 's-bad s-mono', text: 'System.Math.Sqrt', sub: L('use …Methods.Math', 'usa …Methods.Math') },
        { k: 'box', cls: 's-bad s-mono', text: 'new vec4 { … }', sub: L('use Make.Vec4(…)', 'usa Crear.Vec4(…)') },
      ], 'msgs', 0.3, 1.2) },
      { k: 'term', at: 'build', type: 'build+0.3', cps: 30, code: L(term('dotnet build MyShaders'), term('dotnet build MisShaders')) },
    ],
  },
  {
    id: 'learned',
    dense: true,
    beats: { a: L('leaves the result inside your project', 'deja el resultado dentro de tu proyecto'), b: L('chooses the format and can be repeated', 'elige el formato y se puede repetir'), c: L('are plugins', 'son plugins'), d: L('With a', 'Con un') },
    items: [
      { k: 'kicker', text: L('What you learned', 'Lo que aprendiste') },
      ...[['a', 'add = inside your project · compile = files', 'add = dentro del proyecto · compile = archivos'], ['b', '--target (repeatable) · --output', '--target (repetible) · --output'], ['c', 'monogame · kni · fna · godot = plugins', 'monogame · kni · fna · godot = plugins'], ['d', '<Target> in the .csproj = add on its own', '<Target> en el .csproj = add solo']]
        .map(([b, en, es]) => ({ k: 'word', cls: 's-mono', at: b, fx: 'left', text: L(en, es), mark: { at: `${b}+0.4`, kind: 'check' } })),
    ],
  },
];

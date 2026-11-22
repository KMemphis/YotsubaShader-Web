// Stage of "Set up your project" — motion graphics shown next to the text while the chapter is read aloud.
// Each scene starts at its `> [!SCENE] id` cue in content/<lang>/get-started/setup.md. {{engine}} is the route's engine.

const L = (en, es) => ({ en, es });
const term = (code) => ({ title: 'Terminal', code, lang: 'bash' });
const SH = L('MyShaders', 'MisShaders'), TRY = L('TryIt', 'Probar');

// live shaders (GLSL body of vec4 shade(vec2 uv, float t)): the same image in every window of this stage
const GRADIENT = 'return vec4(uv.x,1.-uv.y,.6,1.);';
const PLASMA = 'float x=uv.x*2.-1.,y=(1.-uv.y)*2.-1.;float v=sin(x*6.+t)+sin(y*6.+t*1.3)+sin((x+y)*6.+t*.7)+sin(sqrt(x*x+y*y)*9.-t*2.);return vec4(.5+.5*sin(v*1.5),.5+.5*sin(v*1.5+2.1),.5+.5*sin(v*1.5+4.2),1.);';
const ENGINE_LOGO = { route: { kni: '/img/engines/kni.png', fna: '/img/engines/fna.png', godot: '/img/engines/godot.svg', default: '/img/engines/monogame.png' } };
const win = (frag, at, extra = {}) => ({ k: 'gl', cls: 'window w40', title: '{{engine}}', logo: ENGINE_LOGO, at, fx: 'pop', radius: 10, tiles: [{ frag, at }], ...extra });

export default [
  {
    id: 'intro',
    beats: { folder: L('get the working folder ready', 'dejar lista la carpeta de trabajo'), lib: L('in a C# library', 'en una librería de C#'), engine: L('You will see them run with', 'Los vas a ver funcionar con'), game: L('that same library', 'esa misma librería') },
    items: [
      { k: 'kicker', text: L('Set up your project', 'Prepara tu proyecto') },
      { k: 'title', at: 'folder', text: 'Tutorial/' },
      { k: 'row', at: 'lib', items: [
        { k: 'box', cls: 'accent', text: L('C# library', 'Librería de C#'), sub: L('your shaders', 'tus shaders'), at: 'lib' },
        { k: 'arrow', at: 'engine' },
        { k: 'box', cls: 'gpu', text: '{{engine}}', at: 'engine+0.3', fx: 'pop' },
      ] },
      win(PLASMA, 'game', { keys: undefined }),
      { k: 'text', at: 'game+0.4', text: L('The same library goes into your <b>{{engine}}</b> game', 'La misma librería va a tu juego de <b>{{engine}}</b>') },
    ],
  },
  {
    id: 'need',
    beats: { sdk: L('The .NET 10 SDK', 'El SDK de .NET 10'), type: L('open a terminal and type', 'abre una terminal y escribe'), lower: L('lower than 10', 'menor que 10'), compiles: L('the SDK is the program that compiles', 'el SDK es el programa que compila'), fine: L('that is fine', 'no pasa nada'), editor: L('A C# editor', 'Un editor de C#') },
    items: [
      { k: 'kicker', text: L('What you need', 'Lo que necesitas') },
      { k: 'slot', items: [
        { k: 'term', at: 'sdk', out: 'compiles', type: 'type', cps: 18, code: term('dotnet --version'), marks: [{ at: 'lower+0.6', line: 0, kind: 'check' }] },
        { k: 'row', at: 'compiles', out: 'editor', items: [
          { k: 'box', cls: 'accent', text: 'SDK 10', sub: L('compiles', 'compila'), at: 'compiles' },
          { k: 'arrow', at: 'compiles+0.4' },
          { k: 'box', cls: 's-mono', text: 'net8.0', sub: L('your project', 'tu proyecto'), at: 'compiles+0.8', mark: { at: 'fine', kind: 'check' } },
        ] },
        { k: 'row', at: 'editor', items: [
          { k: 'word', text: 'Rider', at: 'editor+0.3', fx: 'pop' },
          { k: 'word', text: 'Visual Studio', at: 'editor+0.5', fx: 'pop' },
          { k: 'word', text: 'VS Code', at: 'editor+0.7', fx: 'pop' },
        ] },
      ] },
    ],
  },
  {
    id: 'tree',
    beats: { have: L('you will have this', 'tendrás esto'), lib: L('is a C# library like any other', 'es una librería de C# como cualquier otra'), net: L('simply a .NET project', 'simplemente un proyecto de .NET'), only: L('only exists so you can see', 'solo existe para ver'), place: L('takes its place', 'su lugar lo ocupa') },
    items: [
      { k: 'code', at: 'have', type: 'have', cps: 70, hl: [{ at: 'lib', until: 'only', lines: [1] }, { at: 'only', lines: [2] }],
        tags: [{ at: 'net', line: 1, text: '.NET' }, { at: 'place', line: 2, text: L('→ your game', '→ tu juego') }],
        code: L({ title: 'Tutorial/', lang: '', code: 'Tutorial/\n├── MyShaders/\n└── TryIt/' }, { title: 'Tutorial/', lang: '', code: 'Tutorial/\n├── MisShaders/\n└── Probar/' }) },
      { k: 'text', at: 'lib', out: 'only', text: L('A shader project is a <b>.NET project</b>', 'Un proyecto de shaders es un <b>proyecto de .NET</b>') },
      win(GRADIENT, 'place', { dur: 0.6 }),
    ],
  },
  {
    id: 'install',
    beats: { first: L('The command downloads', 'El comando descarga'), called: L('the compiler is called with', 'al compilador se le llama con') },
    items: [
      { k: 'term', at: 0, type: 0.3, cps: 30, code: term('mkdir Tutorial\ncd Tutorial\ndotnet tool install --global \\\n  YotsubaShader.Compiler.CLI'),
        hl: [{ at: 'first', until: 'called', lines: [2, 3] }] },
      { k: 'row', at: 'first', items: [
        { k: 'box', cls: 'accent', text: 'NuGet', sub: 'YotsubaShader.Compiler.CLI', at: 'first+0.2' },
        { k: 'arrow', at: 'first+1.0' },
        { k: 'box', cls: 's-mono', text: 'yotsuba', sub: L('on your whole computer', 'en todo tu equipo'), at: 'first+1.4' },
      ] },
      { k: 'big', cls: 's-mono s-accent', at: 'called', text: 'yotsuba' },
    ],
  },
  {
    id: 'project',
    beats: { from: L('From the', 'Desde la carpeta'), template: L('The template creates', 'La plantilla crea'), del: L('Delete it', 'Bórralo'), single: L('It is a single reference', 'Es una sola referencia'), two: L('brings you two things', 'te llegan dos cosas'), both: L('brings you both', 'te trae los dos') },
    items: [
      { k: 'slot', items: [
        { k: 'term', at: 'from', out: 'single', type: 'from+0.2', cps: 40, code: L(term('dotnet new classlib -n MyShaders -f net8.0'), term('dotnet new classlib -n MisShaders -f net8.0')) },
        { k: 'term', at: 'single', type: 'single+0.2', cps: 40, code: L(term('dotnet add MyShaders package YotsubaShader.GlslSyntax'), term('dotnet add MisShaders package YotsubaShader.GlslSyntax')) },
      ] },
      { k: 'word', cls: 's-mono', at: 'template', out: 'single', text: 'Class1.cs', strike: 'del' },
      { k: 'row', at: 'two', items: [
        { k: 'box', cls: 'accent s-mono', text: 'GlslSyntax', sub: 'vec4 · [location] · sin', at: 'two' },
        { k: 'box', cls: 's-mono', text: 'Language', sub: '[ShaderStage]', at: 'two+0.6' },
      ] },
      { k: 'text', at: 'both', text: L('One reference, <b>both</b> packages', 'Una referencia, <b>los dos</b> paquetes') },
    ],
  },
  {
    id: 'styles',
    beats: { five: L('one of the five', 'uno de los cinco'), most: L('you will find most often', 'que más vas a encontrar'), same: L('the result is the same', 'el resultado es el mismo'), start: L('from start to finish', 'de principio a fin') },
    items: [
      { k: 'kicker', text: L('Five styles', 'Cinco estilos') },
      { k: 'row', at: 'five', items: [
        { k: 'word', cls: 's-mono s-accent', text: 'GLSL', at: 'five', mark: { at: 'most', kind: 'check' } },
        { k: 'word', cls: 's-mono', text: 'HLSL', at: 'five+0.2' },
        { k: 'word', cls: 's-mono', text: 'MSL', at: 'five+0.4' },
        { k: 'word', cls: 's-mono', text: 'WGSL', at: 'five+0.6' },
        { k: 'word', cls: 's-mono', text: 'SPIR-V', at: 'five+0.8' },
      ] },
      { k: 'gl', cls: 'w86', cols: 5, gap: 2, radius: 10, at: 'same-1', fx: 'fade', tiles: ['GLSL', 'HLSL', 'MSL', 'WGSL', 'SPIR-V'].map((n, i) => ({ frag: GRADIENT, at: `same+${i * 0.15}`, cap: `<b>${n}</b>` })) },
      { k: 'text', at: 'same', text: L('Different words, <b>the same result</b>', 'Palabras distintas, <b>el mismo resultado</b>') },
      { k: 'text', at: 'start', text: L('This tutorial: <b>GLSL</b>', 'Este tutorial: <b>GLSL</b>') },
    ],
  },
  {
    id: 'tryit',
    beats: { console: L('is an ordinary console program', 'es un programa de consola cualquiera'), role: L('plays the role of', 'Hace el papel de'), see: L('see with our own eyes', 'ver con nuestros propios ojos') },
    items: [
      { k: 'term', at: 0, type: 0.3, cps: 40, code: L(term('dotnet new console -n TryIt -f net8.0\ndotnet add TryIt reference MyShaders/MyShaders.csproj'), term('dotnet new console -n Probar -f net8.0\ndotnet add Probar reference MisShaders/MisShaders.csproj')) },
      { k: 'row', at: 'console', items: [
        { k: 'box', cls: 'accent', text: SH, sub: L('shaders', 'shaders'), at: 'console' },
        { k: 'arrow', at: 'console+0.3' },
        { k: 'box', text: TRY, sub: L('“your game”', '“tu juego”'), at: 'role' },
      ] },
      win(PLASMA, 'see', { dur: 0.6 }),
      { k: 'text', at: 'see', text: L('To see what the compiler produces', 'Para ver lo que produce el compilador') },
    ],
  },
  {
    id: 'build',
    beats: { see: L('If you see', 'Si al final ves'), ready: L('There is no shader yet', 'Aún no hay ningún shader') },
    items: [
      { k: 'term', at: 0, type: 0.3, cps: 30, code: L(term('dotnet build TryIt'), term('dotnet build Probar')) },
      { k: 'big', cls: 's-ok', at: 'see', text: 'Build succeeded', mark: { at: 'see+0.6', kind: 'check' } },
      { k: 'text', at: 'ready', text: L('No shader yet, but everything is in place', 'Aún sin shaders, pero todo en su sitio') },
    ],
  },
  {
    id: 'cli',
    beats: { run: L('You will run it like this', 'Lo vas a ejecutar así'), parts: L('look at its parts', 'fíjate en sus partes'), real: L('you will use it for real', 'lo vas a usar de verdad') },
    items: [
      { k: 'kicker', text: 'CLI' },
      { k: 'term', at: 'run', type: 'run+0.2', cps: 40, code: L(term('yotsuba add MyShaders/MyShaders.csproj --target spirv'), term('yotsuba add MisShaders/MisShaders.csproj --target spirv')) },
      { k: 'row', at: 'parts', items: [
        { k: 'box', cls: 'accent s-mono', text: 'yotsuba', sub: L('run the compiler', 'ejecuta el compilador'), at: 'parts' },
        { k: 'box', cls: 's-mono', text: 'add', sub: L('compile + add', 'compila + añade'), at: 'parts+1.5' },
        { k: 'box', cls: 's-mono', text: '.csproj', sub: L('your shaders', 'tus shaders'), at: 'parts+3' },
        { k: 'box', cls: 'gpu s-mono', text: '--target spirv', sub: L('output format', 'formato de salida'), at: 'parts+4.5' },
      ] },
      { k: 'text', at: 'real', text: L('Next: <b>Shader 1 · a sunset</b>', 'Siguiente: <b>Shader 1 · un atardecer</b>') },
    ],
  },
];

// Site configuration: sections, engines and interface strings. Chapter content lives in content/<lang>/.

export const SITE = {
  url: process.env.SITE_URL || 'https://learn.yotsubashader.com',
  mainSite: 'https://yotsubashader.com',
  editUrl: null, // e.g. 'https://github.com/<org>/<repo>/edit/main/Web/learn/content' -> shows "Edit this page"
  defaultLang: 'en',
};

export const LANGS = { en: { label: 'English', html: 'en' }, es: { label: 'Español', html: 'es' } };

// Section order = order in the home page and the top bar. `dir` is the folder under content/<lang>/.
export const SECTIONS = [
  { id: 'custom-engine', icon: 'cpu' },
  { id: 'engines', icon: 'puzzle' },
  { id: 'get-started', icon: 'spark', routes: true },
  { id: 'reference', icon: 'book' },
];

// Engines are listed by name only (no logos). Graphics APIs may use their official logos.
export const ENGINES = [
  { id: 'monogame', name: 'MonoGame' },
  { id: 'kni', name: 'KNI' },
  { id: 'stride', name: 'Stride' },
  { id: 'unity', name: 'Unity' },
  { id: 'fna', name: 'FNA' },
  { id: 'godot', name: 'Godot' },
  { id: 'silknet', name: 'Silk.NET' },
];

// Routes of the Get Started: the same chapters, one page per route. `prefix` is the URL folder under /<lang>/get-started/
// (the default route has none, so its URLs never change). Text per route and language: `vars` ({{name}}) and `macros`
// ({{name arg}}, with $1, $2), see lib/routes.mjs.
export const ROUTES = [
  { id: 'monogame', prefix: '', default: true, groups: ['xna'], name: { en: 'MonoGame', es: 'MonoGame' }, hint: { en: 'MonoGame DesktopGL', es: 'MonoGame DesktopGL' } },
  { id: 'kni', prefix: 'kni/', groups: ['xna'], name: { en: 'KNI', es: 'KNI' }, hint: { en: 'KNI with SDL2 and OpenGL', es: 'KNI con SDL2 y OpenGL' } },
  { id: 'fna', prefix: 'fna/', groups: ['xna'], name: { en: 'FNA', es: 'FNA' }, hint: { en: 'FNA with SDL3', es: 'FNA con SDL3' } },
  { id: 'godot', prefix: 'godot/', groups: [], name: { en: 'Godot', es: 'Godot' }, hint: { en: 'Godot 4, GDScript and C#', es: 'Godot 4, GDScript y C#' } },
];


// The vertex struct fields, per route, language and code style. XNA: the two fields of the tutorial, numbered slots.
// Godot: all the data Godot delivers per vertex, named exactly as Godot names it (the plugin reads the name).
const SLOT = { glsl: (n) => `[location(${n})]`, hlsl: (n) => `[TEXCOORD(${n})]`, msl: (n) => `[attribute(${n})]`, wgsl: (n) => `[location(${n})]`, spirv: (n) => `[Location(${n})]` };
const GODOT_HLSL = ['[POSITION]', '[NORMAL]', '[TANGENT]', '[BINORMAL]', '[TEXCOORD(0)]', '[TEXCOORD(1)]', '[COLOR]', '[TEXCOORD(2)]', '[TEXCOORD(3)]', '[TEXCOORD(4)]', '[TEXCOORD(5)]', '[TEXCOORD(6)]', '[TEXCOORD(7)]', '[TEXCOORD(8)]'];
const GODOT_FIELDS = [['vec3', 'VERTEX'], ['vec3', 'NORMAL'], ['vec3', 'TANGENT'], ['vec3', 'BINORMAL'], ['vec2', 'UV'], ['vec2', 'UV2'], ['vec4', 'COLOR'], ['vec4', 'CUSTOM0'], ['vec4', 'CUSTOM1'], ['vec4', 'CUSTOM2'], ['vec4', 'CUSTOM3'], ['uvec4', 'BONE_INDICES'], ['vec4', 'BONE_WEIGHTS'], ['float', 'POINT_SIZE']];
const xnaFields = (pos) => (style) => [`${SLOT[style](0)} public vec2 ${pos};`, `${SLOT[style](1)} public vec2 Uv;`].join('\n');
const xnaFieldsColor = (pos) => (style) => [`${SLOT[style](0)} public vec2 ${pos};`, `${SLOT[style](1)} public vec4 Color;`].join('\n');
const godotFields = (style) => GODOT_FIELDS.map(([t, n], i) => `${style === 'hlsl' ? GODOT_HLSL[i] : SLOT[style](i)} public ${t} ${n};`).join('\n');

// Text of an XNA-family route (MonoGame, KNI, FNA): same viewer and chapters, other plugin, method and package.
function xnaText(name, plugin, toFx, extra) {
  const mk = (lang) => {
    const es = lang === 'es';
    const shaders = es ? 'MisShaders' : 'MyShaders', viewer = es ? 'Visor' : 'Viewer';
    const loadLine = (c) => `            "${c}" => ${toFx(c)},`;
    const register = (c) => es
      ? `Pero primero, avisa al visor del nuevo shader. En \`${viewer}/Program.cs\`, agrega esta línea al \`switch\`, encima de la línea \`_ =>\`:\n\n\`\`\`csharp\n${loadLine(c)}\n\`\`\`\n\nAhora sí, ejecútalo:\n\n\`\`\`bash\nyotsuba add ${shaders}/${shaders}.csproj --target spirv --target ${plugin} && dotnet run --project ${viewer} -- ${c}\n\`\`\``
      : `But first, tell the viewer about the new shader. In \`${viewer}/Program.cs\`, add this line to the \`switch\`, above the \`_ =>\` line:\n\n\`\`\`csharp\n${loadLine(c)}\n\`\`\`\n\nNow run it:\n\n\`\`\`bash\nyotsuba add ${shaders}/${shaders}.csproj --target spirv --target ${plugin} && dotnet run --project ${viewer} -- ${c}\n\`\`\``;
    const pos = es ? 'Posicion' : 'Position';
    return {
      vars: es
        ? { engine: name, plugin, vertexType: 'Vertice', pos: 'Posicion', uv: 'Uv', color: 'Color', cornerType: 'Corner', cornerPos: 'Position', cornerColor: 'Color', enginePackage: extra.pkg, toMethod: extra.method, loadPrefix: extra.pre }
        : { engine: name, plugin, vertexType: 'Corner', pos: 'Position', uv: 'Uv', color: 'Color', cornerType: 'Corner', cornerPos: 'Position', cornerColor: 'Color', enginePackage: extra.pkg, toMethod: extra.method, loadPrefix: extra.pre },
      macros: { vertexFields: xnaFields(pos), vertexFieldsColor: xnaFieldsColor(pos), cornerFieldsColor: xnaFieldsColor('Position'), register, toFx: (c) => toFx(c) },
    };
  };
  return { en: mk('en'), es: mk('es') };
}

export const ROUTE_TEXT = {
  monogame: xnaText('MonoGame', 'monogame', (c) => `new ${c}().ToMGFX(gl)`, { method: 'ToMGFX', pkg: 'MonoGame.Framework.DesktopGL --version 3.8.6.1', pre: '        MonoGamePlatform gl = MonoGamePlatform.DesktopGL;\n' }),
  kni: xnaText('KNI', 'kni', (c) => `new ${c}().ToKNIWebGL_FX()`, { method: 'ToKNIWebGL_FX', pkg: 'nkast.Kni.Platform.SDL2.GL', pre: '' }),
  fna: xnaText('FNA', 'fna', (c) => `new ${c}().ToFNA_FX()`, { method: 'ToFNA_FX', pkg: 'FNA.SDL3', pre: '' }),
  godot: {
    en: {
      vars: { engine: 'Godot', plugin: 'godot', enginePackage: '', toMethod: 'ToGodotShader', loadPrefix: '', vertexType: 'GodotVertex', pos: 'VERTEX', uv: 'UV', color: 'COLOR' },
      macros: {
        vertexFields: godotFields,
        vertexFieldsColor: godotFields,
        cornerFieldsColor: godotFields,
        register: 'Now run it. In Godot, select the `Viewer` node, write `$1` in the **Shader Name** field of the Inspector and press **Play** (`F5`). The addon translates `MyShaders` first, and then the window opens.',
      },
    },
    es: {
      vars: { engine: 'Godot', plugin: 'godot', enginePackage: '', toMethod: 'ToGodotShader', loadPrefix: '', vertexType: 'VerticeGodot', pos: 'VERTEX', uv: 'UV', color: 'COLOR', cornerType: 'GodotVertex', cornerPos: 'VERTEX', cornerColor: 'COLOR' },
      macros: {
        vertexFields: godotFields,
        vertexFieldsColor: godotFields,
        cornerFieldsColor: godotFields,
        register: 'Ahora ejecútalo. En Godot, selecciona el nodo `Visor`, escribe `$1` en el campo **Nombre Shader** del Inspector y pulsa **Play** (`F5`). El addon traduce primero `MisShaders` y después se abre la ventana.',
      },
    },
  },
};

// Source languages shown as banners on the home page, stacked in this order. Each has its own colours (c1 bright, c2 mid,
// c3 deep) and an `example`: the shader drawn on the left side. The left side has two panes, chosen with the squares:
// the first shows only the language name, the second only the example. `links`: for each section the chapter (slug)
// written for this language; a section with no entry opens the section index. The copy lives in UI.<lang>.banners.<id>.
export const SOURCE_LANGUAGES = [
  {
    id: 'csharp', name: 'C#', c1: '#b98cff', c2: '#6b3fc4', c3: '#1e0f47', links: {},
    example: `public class BasicColorShader
{
    [ShaderStage(Stage.Vertex)]
    public VertexOutput Vertex(VertexInput input)
    {
        var output = new VertexOutput();
        output.Position = new Vector4(
            input.Position.X, input.Position.Y, 0f, 1f);
        output.Color = input.Color;
        return output;
    }

    [ShaderStage(Stage.Fragment)]
    public Vector4 Fragment(VertexOutput input)
        => input.Color;
}`,
  },
  {
    id: 'custom', name: 'Engine', c1: '#5eead4', c2: '#0f766e', c3: '#042f2e', links: {},
    // buttons of this banner (instead of the engines): graphics APIs, each opening its own chapter of the Custom engine section
    buttons: [
      { name: 'OpenGL', logo: 'opengl.svg', wide: true, page: ['custom-engine', 'opengl'] },
      { name: 'Direct3D', logo: 'directx.svg', wide: true, page: ['custom-engine', 'direct3d'] },
      { name: 'Vulkan', logo: 'vulkan.svg', wide: true, page: ['custom-engine', 'vulkan'] },
      { name: 'Metal', logo: 'metal.svg', page: ['custom-engine', 'metal'] },
      { name: 'WebGL', logo: 'webgl.svg', wide: true, page: ['custom-engine', 'webgl'] },
    ],
    example: `yotsuba compile Game.Shaders.csproj \\
  --target spirv --target glsl \\
  --target hlsl --target msl \\
  --output shaders

byte[] spirv = File.ReadAllBytes(
    "shaders/Game/Sweep.spv");`,
  },
];

export const UI = {
  en: {
    siteName: 'Yotsuba Shader',
    siteTag: 'Learn',
    homeTitle: 'Learn Yotsuba Shader',
    homeLead: 'Guides, tutorials and reference for writing shaders in C# and compiling them for any backend.',
    bannerLabel: 'Source languages',
    bannerKicker: 'Tutorial',
    bannerDots: 'Choose a source language',
    bannerStart: (n) => `Start with ${n}`,
    examplesLabel: (n) => `${n}: what to show`,
    paneLogo: 'Language',
    paneExample: 'Example shader',
    bannerSlide: (i, n) => `${i} of ${n}`,
    banners: {
      custom: { title: 'Implement in your own engine', text: 'Compile the shaders in your build and load them in your renderer. The same C# shader comes out as SPIR-V, GLSL, HLSL and Metal, with the locations and bindings you write. Pick your graphics API:' },
      csharp: { title: 'Get Started', text: 'Learn from scratch how to write shaders in C# and see them run. The tutorial has one guide for each engine: MonoGame, KNI, FNA and Godot. The chapters and the shaders are the same; only the window, the project and the commands change. Pick your engine:' },
    },
    sections: {
      'custom-engine': { title: 'Implement in your own engine', short: 'Custom engine', blurb: 'Embed the compiler and the runtime contract in an engine you control.' },
      engines: { title: 'Use it in existing engines', short: 'Engines', blurb: 'Step-by-step integration for the engines your team already uses.' },
      'get-started': { title: 'Get Started', short: 'Get Started', blurb: 'Learn from scratch how to create shaders with Yotsuba Shader.' },
      reference: { title: 'Documentation', short: 'Documentation', blurb: 'Language, attributes, compiler and backends, in detail.' },
    },
    route: 'Route',
    routeNotice: (n) => `You chose the ${n} route. See this page in that route`,
    routePick: 'Choose your route',
    chapters: (n) => `${n} ${n === 1 ? 'chapter' : 'chapters'}`,
    minutes: (n) => `${n} min`,
    minRead: (n) => `${n} min read`,
    open: 'Open',
    enginesRowLabel: 'Supported engines',
    onThisPage: 'On this page',
    chaptersLabel: 'Chapters',
    prev: 'Previous',
    next: 'Next',
    search: 'Search',
    searchPlaceholder: 'Search the documentation',
    noResults: 'No results for',
    language: 'Language',
    theme: 'Theme',
    themes: { auto: 'Auto', light: 'Light', dark: 'Dark' },
    codeStyle: 'Code style',
    copy: 'Copy',
    copied: 'Copied',
    video: 'Video', videoSubtitles: 'English', videoMin: (n) => `${n} min`,
    listen: 'Listen', listenPause: 'Pause', listenResume: 'Resume', listenLoading: 'Loading…', listenTitle: 'Listen to this page', listenError: 'Audio unavailable',
    stageLabel: 'Visual guide for the narration', stageClose: 'Close the visual guide', stageMenu: 'Chapters', stageSeek: 'Jump to this part',
    linkHere: 'Link to this section',
    skip: 'Skip to content',
    menu: 'Menu',
    close: 'Close',
    planned: 'Planned',
    planNote: 'This chapter describes planned behavior that is not implemented yet.',
    edit: 'Edit this page',
    progress: 'Viewed',
    notFound: 'Page not found',
    notFoundText: 'The page you are looking for does not exist or has moved.',
    backHome: 'Back to home',
    mainSite: 'Main site',
    footer: 'Yotsuba Shader. Documentation is written in Markdown.',
    trademarks: 'Engine and graphics API names belong to their respective owners.',
    callouts: { NOTE: 'Note', TIP: 'Tip', WARNING: 'Warning', IMPORTANT: 'Important', PLANNED: 'Planned' },
  },
  es: {
    siteName: 'Yotsuba Shader',
    siteTag: 'Aprende',
    homeTitle: 'Aprende Yotsuba Shader',
    homeLead: 'Guías, tutoriales y referencia para escribir shaders en C# y compilarlos para cualquier backend.',
    bannerLabel: 'Lenguajes de origen',
    bannerKicker: 'Tutorial',
    bannerDots: 'Elige un lenguaje de origen',
    bannerStart: (n) => `Empezar con ${n}`,
    examplesLabel: (n) => `${n}: qué mostrar`,
    paneLogo: 'Lenguaje',
    paneExample: 'Shader de ejemplo',
    bannerSlide: (i, n) => `${i} de ${n}`,
    banners: {
      custom: { title: 'Implementar en tu propio motor', text: 'Compila los shaders en tu build y cárgalos en tu renderer. El mismo shader de C# sale como SPIR-V, GLSL, HLSL y Metal, con las ubicaciones y los bindings que escribes. Elige tu API gráfica:' },
      csharp: { title: 'Get Started', text: 'Aprende desde cero a escribir shaders en C# y verlos funcionar. El tutorial tiene una guía para cada engine: MonoGame, KNI, FNA y Godot. Los capítulos y los shaders son los mismos; solo cambian la ventana, el proyecto y los comandos. Elige tu engine:' },
    },
    sections: {
      'custom-engine': { title: 'Implementar en tu propio motor', short: 'Motor propio', blurb: 'Integra el compilador y el contrato de ejecución en un motor que controlas.' },
      engines: { title: 'Usar en engines existentes', short: 'Engines', blurb: 'Integración paso a paso para los engines que tu equipo ya usa.' },
      'get-started': { title: 'Get Started', short: 'Get Started', blurb: 'Aprende desde cero a crear shaders con Yotsuba Shader.' },
      reference: { title: 'Documentación', short: 'Documentación', blurb: 'Lenguaje, atributos, compilador y backends, en detalle.' },
    },
    route: 'Ruta',
    routeNotice: (n) => `Elegiste la ruta ${n}. Ver esta página en esa ruta`,
    routePick: 'Elige tu ruta',
    chapters: (n) => `${n} ${n === 1 ? 'capítulo' : 'capítulos'}`,
    minutes: (n) => `${n} min`,
    minRead: (n) => `${n} min de lectura`,
    open: 'Abrir',
    enginesRowLabel: 'Engines compatibles',
    onThisPage: 'En esta página',
    chaptersLabel: 'Capítulos',
    prev: 'Anterior',
    next: 'Siguiente',
    search: 'Buscar',
    searchPlaceholder: 'Buscar en la documentación',
    noResults: 'Sin resultados para',
    language: 'Idioma',
    theme: 'Tema',
    themes: { auto: 'Automático', light: 'Claro', dark: 'Oscuro' },
    codeStyle: 'Estilo de código',
    copy: 'Copiar',
    copied: 'Copiado',
    video: 'Video', videoSubtitles: 'Español', videoMin: (n) => `${n} min`,
    listen: 'Escuchar', listenPause: 'Pausar', listenResume: 'Continuar', listenLoading: 'Cargando…', listenTitle: 'Escuchar esta página', listenError: 'Audio no disponible',
    stageLabel: 'Guía visual de la narración', stageClose: 'Cerrar la guía visual', stageMenu: 'Capítulos', stageSeek: 'Ir a esta parte',
    linkHere: 'Enlace a esta sección',
    skip: 'Saltar al contenido',
    menu: 'Menú',
    close: 'Cerrar',
    planned: 'Planificado',
    planNote: 'Este capítulo describe comportamiento planificado que todavía no está implementado.',
    edit: 'Editar esta página',
    progress: 'Vistos',
    notFound: 'Página no encontrada',
    notFoundText: 'La página que buscas no existe o se ha movido.',
    backHome: 'Volver al inicio',
    mainSite: 'Web principal',
    footer: 'Yotsuba Shader. La documentación está escrita en Markdown.',
    trademarks: 'Los nombres de engines y APIs gráficas pertenecen a sus respectivos propietarios.',
    callouts: { NOTE: 'Nota', TIP: 'Consejo', WARNING: 'Aviso', IMPORTANT: 'Importante', PLANNED: 'Planificado' },
  },
};

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
  { id: 'get-started', icon: 'spark' },
  { id: 'reference', icon: 'book' },
];

// Engines are listed by name only (no logos). Graphics APIs may use their official logos.
export const ENGINES = [
  { id: 'monogame', name: 'MonoGame' },
  { id: 'stride', name: 'Stride' },
  { id: 'unity', name: 'Unity' },
  { id: 'fna', name: 'FNA' },
  { id: 'silknet', name: 'Silk.NET' },
];

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
];

export const UI = {
  en: {
    siteName: 'Yotsuba Shader',
    siteTag: 'Learn',
    homeTitle: 'Learn Yotsuba Shader',
    homeLead: 'Guides, tutorials and reference for writing shaders in C# and compiling them for any backend.',
    bannerLabel: 'Source languages',
    bannerKicker: 'Source language',
    bannerDots: 'Choose a source language',
    bannerStart: (n) => `Start with ${n}`,
    examplesLabel: (n) => `${n}: what to show`,
    paneLogo: 'Language',
    paneExample: 'Example shader',
    bannerSlide: (i, n) => `${i} of ${n}`,
    banners: {
      csharp: { title: 'Write shaders in the C# you already use.', text: 'Structs, attributes and methods in your own project. Roslyn reads them, lowers them to one intermediate representation and compiles to SPIR-V, HLSL, GLSL, GLSL ES, Metal or C++.' },
    },
    sections: {
      'custom-engine': { title: 'Implement in your own engine', short: 'Custom engine', blurb: 'Embed the compiler and the runtime contract in an engine you control.' },
      engines: { title: 'Use it in existing engines', short: 'Engines', blurb: 'Step-by-step integration for the engines your team already uses.' },
      'get-started': { title: 'Get Started', short: 'Get Started', blurb: 'Learn from scratch how to create shaders with Yotsuba Shader.' },
      reference: { title: 'Documentation', short: 'Documentation', blurb: 'Language, attributes, compiler and backends, in detail.' },
    },
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
    bannerKicker: 'Lenguaje de origen',
    bannerDots: 'Elige un lenguaje de origen',
    bannerStart: (n) => `Empezar con ${n}`,
    examplesLabel: (n) => `${n}: qué mostrar`,
    paneLogo: 'Lenguaje',
    paneExample: 'Shader de ejemplo',
    bannerSlide: (i, n) => `${i} de ${n}`,
    banners: {
      csharp: { title: 'Escribe shaders en el C# que ya usas.', text: 'Structs, atributos y métodos en tu propio proyecto. Roslyn los lee, los baja a una representación intermedia única y compila a SPIR-V, HLSL, GLSL, GLSL ES, Metal o C++.' },
    },
    sections: {
      'custom-engine': { title: 'Implementar en tu propio motor', short: 'Motor propio', blurb: 'Integra el compilador y el contrato de ejecución en un motor que controlas.' },
      engines: { title: 'Usar en engines existentes', short: 'Engines', blurb: 'Integración paso a paso para los engines que tu equipo ya usa.' },
      'get-started': { title: 'Get Started', short: 'Get Started', blurb: 'Aprende desde cero a crear shaders con Yotsuba Shader.' },
      reference: { title: 'Documentación', short: 'Documentación', blurb: 'Lenguaje, atributos, compilador y backends, en detalle.' },
    },
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

// Stage of "Other writing styles" — motion graphics shown next to the text while the chapter is read aloud.
// Each scene starts at its `> [!SCENE] id` cue in content/<lang>/get-started/how-it-works.md. The same shader changes style
// (only the `using` and two attribute names), the style is not the target, and a vector is any struct marked [Vector].

const L = (en, es) => ({ en, es });
const cs = (title, code) => ({ title, code, lang: 'csharp' });
const BG = 'vec3(.1,.1,.14)';
const PINK = 'vec3(1.,.48,.7)', VIOLET = 'vec3(.77,.64,1.)', MINT = 'vec3(.38,.94,.82)';

// the three lines that change from one style to the next, in the order the tabs show them
const STYLES = [
  ['GLSL', 'GlslSyntax', 'gl_Position', 'gl_VertexIndex'],
  ['HLSL', 'HlslSyntax', 'SV_Position', 'gl_VertexIndex'],
  ['MSL', 'MslSyntax', 'position', 'gl_VertexIndex'],
  ['WGSL', 'WgslSyntax', '@builtin_position', 'gl_VertexIndex'],
  ['SPIR-V', 'SpirvSyntax', 'BuiltIn_Position', 'gl_VertexIndex'],
];
const sample = (lib, attr) => cs(lib, `using YotsubaShader.Language;
using YotsubaShader.${lib};

public struct VertexOutput
{
    [${attr}] public Float4 Position;
}

public class Triangle
{
    [ShaderStage(Stage.Vertex)]
    public VertexOutput Vertex(…)
    {
        …
    }
}`);

const FLOAT4 = cs('Float4.cs', `[Vector]
public struct Float4
{
    [VectorComponent(0)] public float X;
    [VectorComponent(1)] public float Y;
    [VectorComponent(2)] public float Z;
    [VectorComponent(3)] public float W;
}`);
const REF_A = { title: 'MyShaders.csproj', lang: 'xml', code: '<PackageReference Include="YotsubaShader.GlslSyntax" />' };
const REF_B = { title: 'MyShaders.csproj', lang: 'xml', code: '<PackageReference Include="YotsubaShader.HlslSyntax" />' };
const REF_A_ES = { ...REF_A, title: 'MisShaders.csproj' }, REF_B_ES = { ...REF_B, title: 'MisShaders.csproj' };

export default [
  /* GLSL names all along; five styles: a library each, with the same attributes under other names */
  {
    id: 'intro',
    beats: { names: L('GLSL names', 'nombres de GLSL'), other: L('another language', 'otro lenguaje'), five: L('five styles', 'cinco estilos'), lib: L('Each one is a library', 'Cada uno es una librería') },
    items: [
      { k: 'kicker', text: L('Other writing styles', 'Otros estilos de escritura') },
      { k: 'row', at: 'names', items: [
        { k: 'word', cls: 's-mono s-accent', text: '[gl_Position]', at: 'names', fx: 'pop' },
        { k: 'word', cls: 's-mono s-accent', text: '[location(0)]', at: 'names+0.5', fx: 'pop' },
        { k: 'word', cls: 's-mono s-accent', text: 'vec4', at: 'names+1', fx: 'pop' },
      ] },
      { k: 'row', at: 'five', items: STYLES.map(([n], i) => ({ k: 'box', cls: i === 0 ? 'accent s-mono' : 's-mono', text: n, at: `five+${(0.2 + i * 0.4).toFixed(1)}`, fx: 'pop' })) },
      { k: 'text', at: 'lib', text: L('Five libraries · the <b>same</b> attributes', 'Cinco librerías · los <b>mismos</b> atributos') },
    ],
  },
  /* the style is not the target: HLSL names compile to Metal; GLSL names compile to DirectX */
  {
    id: 'target',
    beats: { important: L('most important thing', 'más importante'), decide: L('decide', 'decide'), hlsl: L('write with HLSL names', 'escribir con nombres de HLSL'), metal: L('compile to Metal', 'compilar a Metal'), glsl: L('write with GLSL names', 'escribir con nombres de GLSL'), dx: L('compile to DirectX', 'compilar a DirectX'), when: L('You choose the target', 'El destino lo eliges') },
    items: [
      { k: 'kicker', text: L('The style is not the target', 'El estilo no es el destino') },
      { k: 'slot', items: [
        { k: 'row', at: 'hlsl', out: 'glsl', items: [
          { k: 'box', cls: 's-mono', text: 'HLSL', sub: L('how you write', 'cómo escribes'), at: 'hlsl' },
          { k: 'arrow', at: 'metal-0.8' },
          { k: 'logo', src: '/img/apis/metal.svg', text: 'Metal', at: 'metal' },
        ] },
        { k: 'row', at: 'glsl', items: [
          { k: 'box', cls: 'accent s-mono', text: 'GLSL', sub: L('how you write', 'cómo escribes'), at: 'glsl' },
          { k: 'arrow', at: 'dx-0.8' },
          { k: 'logo', src: '/img/apis/directx.svg', text: 'DirectX', at: 'dx' },
        ] },
      ] },
      { k: 'text', at: 'when', text: L('The target is chosen <b>when compiling</b>', 'El destino se elige <b>al compilar</b>') },
    ],
  },
  /* the same shader in five styles: only the using and two attributes change */
  {
    id: 'five',
    beats: { minimal: L('a minimal shader', 'un shader mínimo'), tabs: L('Use the tabs', 'Usa las pestañas'), only: L('the only thing that changes', 'lo único que cambia'), rest: L('The rest is identical', 'El resto es idéntico') },
    items: [
      { k: 'kicker', text: L('The same shader · five styles', 'El mismo shader · cinco estilos') },
      { k: 'slot', items: STYLES.map(([n, lib, attr], i) => {
        const at = (k, d = 0) => (k === 0 ? 'minimal' : `tabs+${((k - 1) * 2.4 + 1 + d).toFixed(1)}`);
        return { k: 'code', at: at(i), out: i === STYLES.length - 1 ? undefined : at(i + 1), fx: i === 0 ? 'up' : 'fade', dur: 0.3,
          code: sample(lib, attr), hl: [{ at: i === 0 ? 'only' : at(i, 0.4), lines: [1, 5] }], tags: [{ at: i === 0 ? 'only' : at(i, 0.6), line: 5, text: n }] };
      }) },
      { k: 'text', at: 'rest+0.5', text: L('Everything else <b>stays the same</b>', 'Todo lo demás <b>queda igual</b>') },
    ],
  },
  /* a vector is any struct marked [Vector]; its fields carry their position; then the style changes in one reference */
  {
    id: 'vectors',
    beats: { f4: L('the Float4 vector', 'el vector Float4'), marked: L('marked with', 'marcado con'), pos: L('with its position', 'con su posición'), between: L('between 2 and 4 components', 'entre 2 y 4 componentes'), name: L('however you like', 'como quieras'), ref: L('replace the reference', 'cambia la referencia') },
    items: [
      { k: 'kicker', text: L('Your own vectors', 'Tus propios vectores') },
      { k: 'slot', items: [
        { k: 'code', at: 'f4', out: 'ref', type: 'f4+0.3', cps: 60, code: FLOAT4, hl: [{ at: 'marked', until: 'pos', lines: [0] }, { at: 'pos', lines: [3, 4, 5, 6] }], tags: [{ at: 'marked+0.4', line: 0, text: L('a vector', 'un vector') }] },
        { k: 'morph', at: 'ref', morph: 'ref+3', dur: 1.2, from: L(REF_A, REF_A_ES), to: L(REF_B, REF_B_ES) },
      ] },
      { k: 'row', at: 'between', out: 'ref', items: [
        { k: 'box', cls: 's-mono', text: '2', sub: L('components', 'componentes'), at: 'between' },
        { k: 'box', cls: 's-mono', text: '3', at: 'between+0.4' },
        { k: 'box', cls: 'accent s-mono', text: '4', at: 'between+0.8' },
      ] },
      { k: 'row', at: 'name', out: 'ref', items: ['Float4', 'Color', 'MiVec'].map((n, i) => ({ k: 'word', cls: 's-mono s-accent', text: n, at: `name+${(i * 0.4).toFixed(1)}`, fx: 'pop' })) },
    ],
  },
];

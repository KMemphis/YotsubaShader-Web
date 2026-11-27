// How each of the five syntaxes spells the skeleton of a fullscreen shader: the usings, the type names, the
// attributes and the math functions. The recipes are written in the GLSL dialect and rewritten with this table.

const word = (s) => new RegExp(`\\b${s}\\b`, 'g');

export const STYLES = {
  hlsl: {
    label: 'HLSL', ns: 'HlslSyntax',
    usings: ['YotsubaShader.Language', 'YotsubaShader.HlslSyntax', 'YotsubaShader.HlslSyntax.Types', 'YotsubaShader.HlslSyntax.Resources'],
    statics: ['YotsubaShader.HlslSyntax.Methods.Math', 'YotsubaShader.HlslSyntax.Methods.Intrinsic', 'YotsubaShader.HlslSyntax.Methods.Constructors'],
    vec: { 2: 'float2', 3: 'float3', 4: 'float4' },
    fn: { fract: 'frac', mix: 'lerp', atan2: 'atan2' },
    uniform: '[cbuffer, register(RegisterPrefix.b, 0)]',
    positionAttr: '[SV_Position]', vertexId: '[SV_VertexID] uint id', fragCoord: '[SV_Position] float4 fragCoord',
    fragReturn: '[return: SV_Target]\n    ',
  },
  glsl: {
    label: 'GLSL', ns: 'GlslSyntax',
    usings: ['YotsubaShader.Language', 'YotsubaShader.GlslSyntax', 'YotsubaShader.GlslSyntax.Types', 'YotsubaShader.GlslSyntax.Resources'],
    statics: ['YotsubaShader.GlslSyntax.Methods.Math', 'YotsubaShader.GlslSyntax.Methods.Intrinsic', 'YotsubaShader.GlslSyntax.Methods.Constructors'],
    vec: { 2: 'vec2', 3: 'vec3', 4: 'vec4' },
    fn: { atan2: 'atan' },
    uniform: '[uniform, layout(0, 0)]',
    positionAttr: '[gl_Position]', vertexId: '[gl_VertexIndex] uint id', fragCoord: '[gl_FragCoord] vec4 fragCoord',
    fragReturn: '',
  },
  msl: {
    label: 'MSL', ns: 'MslSyntax',
    usings: ['YotsubaShader.Language', 'YotsubaShader.MslSyntax', 'YotsubaShader.MslSyntax.Types', 'YotsubaShader.MslSyntax.Resources'],
    statics: ['YotsubaShader.MslSyntax.Methods.Math', 'YotsubaShader.MslSyntax.Methods.Intrinsic', 'YotsubaShader.MslSyntax.Methods.Constructors'],
    vec: { 2: 'float2', 3: 'float3', 4: 'float4' },
    fn: { atan2: 'atan2' },
    uniform: '[constant, buffer(0)]',
    positionAttr: '[position]', vertexId: '[vertex_id] uint id', fragCoord: '[position] float4 fragCoord',
    fragReturn: '',
  },
  vulkan: {
    label: 'SPIR-V', ns: 'SpirvSyntax',
    usings: ['YotsubaShader.Language', 'YotsubaShader.SpirvSyntax', 'YotsubaShader.SpirvSyntax.Types', 'YotsubaShader.SpirvSyntax.Resources'],
    statics: ['YotsubaShader.SpirvSyntax.Methods.Math', 'YotsubaShader.SpirvSyntax.Methods.Intrinsic', 'YotsubaShader.SpirvSyntax.Methods.Constructors'],
    vec: { 2: 'vec2', 3: 'vec3', 4: 'vec4' },
    fn: { sin: 'Sin', cos: 'Cos', abs: 'FAbs', floor: 'Floor', fract: 'Fract', mix: 'FMix', clamp: 'FClamp', min: 'FMin', max: 'FMax', pow: 'Pow', sqrt: 'Sqrt', length: 'Length', dot: 'OpDot', normalize: 'Normalize', smoothstep: 'SmoothStep', step: 'Step', atan2: 'Atan2' },
    uniform: '[Uniform] [DescriptorSet(0)] [Binding(0)]',
    positionAttr: '[BuiltIn_Position]', vertexId: '[BuiltIn_VertexIndex] int id', fragCoord: '[BuiltIn_FragCoord] vec4 fragCoord',
    fragReturn: '',
  },
  wgsl: {
    label: 'WGSL', ns: 'WgslSyntax',
    usings: ['YotsubaShader.Language', 'YotsubaShader.WgslSyntax', 'YotsubaShader.WgslSyntax.Types', 'YotsubaShader.WgslSyntax.Resources'],
    statics: ['YotsubaShader.WgslSyntax.Methods.Math', 'YotsubaShader.WgslSyntax.Methods.Intrinsic', 'YotsubaShader.WgslSyntax.Methods.Constructors'],
    vec: { 2: 'vec2<float>', 3: 'vec3<float>', 4: 'vec4<float>' },
    ctor: { 2: 'vec2f', 3: 'vec3f', 4: 'vec4f' },
    fn: { atan2: 'atan2' },
    uniform: '[uniform, @group(0), @binding(0)]',
    positionAttr: '[@builtin_position]', vertexId: '[@builtin_vertex_index] uint id', fragCoord: '[@builtin_position] vec4 fragCoord',
    fragReturn: '',
  },
};

export const STYLE_IDS = Object.keys(STYLES);

/** Rewrites a GLSL-dialect snippet (types, constructors and function names) into the given style. */
export function dialect(code, style) {
  const s = STYLES[style];
  let out = code;
  for (const n of [2, 3, 4]) {
    if (s.ctor) out = out.replace(new RegExp(`\\bvec${n}\\(`, 'g'), `${s.ctor[n]}(`);
    out = out.replace(word(`vec${n}`), s.vec[n]);
  }
  const names = Object.keys(s.fn).filter((k) => k !== s.fn[k]);
  if (names.length) {
    const re = new RegExp(`\\b(${names.join('|')})\\(`, 'g');
    out = out.replace(re, (_, n) => `${s.fn[n]}(`);
  }
  return out;
}

const pascal = (id) => id.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join('');

/** The full C# source of a recipe in the given style. */
export function render(recipe, style) {
  const s = STYLES[style];
  const v = { 2: 'vec2', 3: 'vec3', 4: 'vec4' }; // GLSL dialect; dialect() rewrites it at the end
  const usings = [...s.usings.map((u) => `using ${u};`), ...s.statics.map((u) => `using static ${u};`)].join('\n');
  const body = [
    `        float aspect = Params.Resolution.X / Params.Resolution.Y;`,
    `        ${v[2]} uv = ${v[2]}(fragCoord.X / Params.Resolution.X, fragCoord.Y / Params.Resolution.Y);`,
    `        ${v[2]} p = ${v[2]}((uv.X - 0.5f) * aspect, uv.Y - 0.5f);`,
    `        float t = Params.Time;`,
    '',
    recipe.body,
  ].join('\n');
  // Mixing two colours by a single weight: the vector overload of mix wants a weight per component.
  const MIX3 = `    vec3 Mix3(vec3 a, vec3 b, float k)
    {
        return mix(a, b, vec3(k));
    }
`;
  const helpers = (/\bMix3\(/.test(recipe.body) ? MIX3 + '\n' : '') + recipe.helpers;
  const code = `// ${recipe.title[0]} (${s.label} style): ${recipe.desc[0]}
// ${recipe.credit}
${usings}

public struct Globals
{
    public float Time;
    public ${v[2]} Resolution;
}

public struct VertexOutput
{
    ${s.positionAttr}
    public ${v[4]} Position;
}

public class ${pascal(recipe.id)}
{
    ${s.uniform}
    public Globals Params;

    // A single triangle that covers the screen, built from the vertex index.
    [ShaderStage(Stage.Vertex)]
    public VertexOutput Vertex(${s.vertexId})
    {
        ${v[4]} position;
        position.X = ((id << 1) & 2) * 2.0f - 1.0f;
        position.Y = (id & 2) * 2.0f - 1.0f;
        position.Z = 0.0f;
        position.W = 1.0f;

        VertexOutput output;
        output.Position = position;
        return output;
    }
${helpers ? '\n' + helpers.replace(/\n+$/, '') + '\n' : ''}
    [ShaderStage(Stage.Fragment)]
    ${s.fragReturn}public ${v[4]} Fragment(${s.fragCoord})
    {
${body}
    }
}
`;
  return dialect(code, style);
}

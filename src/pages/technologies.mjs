import { icon, code, table, note, cardLink } from '../components.mjs';
import { SYNTAX_META } from '../reference.mjs';
import { BASIC_COLOR } from '../snippets.mjs';

export default function technologies(ctx) {

  const overview = {
    path: '/technologies/',
    section: 'technologies',
    title: 'Technologies',
    description: 'The language, frontend, intermediate representation and SPIR-V compiler behind Yotsuba Shader.',
    body: `
<section class="hero hero--compact">
  <div class="container">
    <h1 class="h-xl">From your shader to the graphics API.</h1>
    <p class="lead">Learn how C# shader declarations become the formats used by graphics APIs. You write shader code; the compiler handles its internal representation.</p>
  </div>
  <hr class="hero-rule">
</section>
<section class="section">
  <div class="container"><div class="grid grid-2">
    ${cardLink({ href: '/technologies/language/', icon: 'braces', title: 'Language', body: 'Declare shader stages, inputs, outputs, and resources in C#.' })}
    ${cardLink({ href: '/technologies/compilation/', icon: 'layers', title: 'Compilation process', body: 'Follow C# through Yotsuba Shader, SPIR-V, and ShaderCross to the output formats.' })}
  </div></div>
</section>`,
  };

  const language = {
    path: '/technologies/language/',
    section: 'technologies',
    title: 'Language',
    description: 'Write C# shaders with HLSL-style stages, inputs, outputs, resources, and compatible project types.',
    body: `
<section class="hero hero--compact language-hero"><div class="container">
<p class="eyebrow">C# SHADERS</p>
<h1 class="h-xl">Your shader, written in C#.</h1>
<p class="lead">Use classes, structs, and methods to describe your shader. Attributes identify the stages, the values passed between them, and the resources supplied by your application.</p>
<div class="hero-actions"><a class="btn btn-primary" href="/get-started/first-shader/">Write your first shader ${icon('arrow-right')}</a><a class="btn btn-secondary" href="/syntaxes/hlsl/">Explore the HLSL vocabulary</a></div>
</div></section>
<section class="section language-foundations"><div class="container">
<p class="language-status">This is a pre-release authoring API. The examples below use declarations present in the repository; complete shader compilation is still in development. HLSL is the default syntax throughout this guide.</p>
<div class="grid grid-4 language-concepts"><article class="language-concept"><span class="language-step">01</span><h2>Stages</h2><p>A method declares vertex, fragment, or compute work.</p></article><article class="language-concept"><span class="language-step">02</span><h2>Inputs and outputs</h2><p>Structs describe the values received and returned by a stage.</p></article><article class="language-concept"><span class="language-step">03</span><h2>Resources</h2><p>Buffers, textures, and samplers carry data provided by your application.</p></article><article class="language-concept"><span class="language-step">04</span><h2>Your types</h2><p>Type annotations describe how compatible C# data maps to shader types.</p></article></div></div></section>
<section class="section"><div class="container"><div class="language-example">
<div><h2 class="h-lg">One class. Two connected stages.</h2><p>The vertex method receives a position and color. It writes a clip-space position and passes the color to the fragment method, which returns the interpolated color.</p><p>Both methods share <code>VS_Output</code>. You do not need a second struct just to receive the same data in the fragment stage.</p><p>The application supplies vertex data, configures the graphics pipeline, and issues draw calls. These attributes describe the shader; they do not perform those application tasks.</p><p class="language-caption">This example uses MonoGame types for familiarity. Their names alone do not make them native GPU vectors; native mapping requires compatible type metadata.</p>
</div><div>${code('csharp', BASIC_COLOR, 'BasicColorShader.cs')}</div>
</div></div></section>
<section class="section language-surface"><div class="container container--narrow">
<h2 class="h-lg">What each attribute says</h2>
${table(['Attribute', 'Purpose'], [
 ['<code>[ShaderStage(Stage.Vertex)]</code>', 'Marks the vertex entry point.'],
 ['<code>[ShaderStage(Stage.Fragment)]</code>', 'Marks the fragment entry point.'],
 ['<code>[POSITION]</code>', 'Identifies a vertex position supplied by the application.'],
 ['<code>[COLOR]</code>', 'Identifies color data, including the value passed between stages.'],
 ['<code>[SV_Position]</code>', 'Declares the vertex clip-space position; as a fragment input it describes the rasterized position.'],
 ['<code>[return: SV_Target(0)]</code>', 'Routes the fragment return value to color target 0.'],
])}
<p>For additional vertex data, use HLSL semantics such as <code>[TEXCOORD(0)]</code> or <code>[NORMAL]</code>. The separate SPIR-V vocabulary also offers numbered locations; you do not need to mix it into an HLSL example.</p>
</div></section>
<section class="section"><div class="container"><div class="language-example">
<div><h2 class="h-lg">Declare what your application provides.</h2><p>Use <code>cbuffer</code> for uniform data and <code>register</code> to identify resource slots. The register prefix distinguishes constant buffers (<code>b</code>), textures (<code>t</code>), samplers (<code>s</code>), and writable resources (<code>u</code>).</p><p>These are resource declarations. Your engine creates and binds the actual GPU resources. The current metadata types do not provide a texture sampling method or a complete runtime binding system.</p>
<a class="compilation-text-link" href="/documentation/yotsuba-shader/uniforms-and-storage-buffers/">Read about resources and bindings →</a></div><div>${code('csharp', `using YotsubaShader.HlslSyntax.Resources;
using YotsubaShader.HlslSyntax.Resources.Types;

public struct MaterialData
{
    public float Exposure;
    public float Roughness;
}

public class SurfaceResources
{
    [cbuffer, register(RegisterPrefix.b, 0)]
    public MaterialData Material;

    [register(RegisterPrefix.t, 0)]
    public Texture2D Albedo;

    [register(RegisterPrefix.s, 0)]
    public SamplerState Sampler;
}`, 'SurfaceResources.cs')}</div></div></div></section>
<section class="section language-surface"><div class="container"><div class="language-example">
<div><h2 class="h-lg">Keep compatible types from your project.</h2><p>A C# struct can describe a native shader vector when its type and components carry the corresponding annotations. This makes the mapping explicit without relying on the type name.</p><p>Annotate types you own. Importing a third-party namespace does not add metadata to its types. You can share declarations as NuGet libraries, while GPU compilation of arbitrary library methods remains unfinished.</p>
<a class="compilation-text-link" href="/documentation/yotsuba-shader/reusing-your-types-and-libraries/">Learn how to map your types →</a></div><div>${code('csharp', `using YotsubaShader.Language.Native.Types.Vector;

[Vector]
public struct Float2
{
    [VectorComponent(0)] public float X;
    [VectorComponent(1)] public float Y;

    public Float2(float x, float y)
    {
        X = x;
        Y = y;
    }
}`, 'Float2.cs')}</div></div></div></section>
<section class="section"><div class="container"><div class="language-example">
<div><h2 class="h-lg">Compute is a separate stage.</h2><p>A compute method uses <code>Stage.Compute</code>. In the HLSL vocabulary, <code>numthreads(8, 8, 1)</code> declares the local workgroup dimensions. It does not use a vertex-to-fragment connection.</p><p>The example declares an empty compute entry point. Executing useful GPU work requires supported body operations, compiled output, resource bindings, and a dispatch from your application.</p></div><div>${code('csharp', `using YotsubaShader.Language;
using YotsubaShader.HlslSyntax;

public class ComputeShader
{
    [ShaderStage(Stage.Compute)]
    [numthreads(8, 8, 1)]
    public void CS()
    {
    }
}`, 'ComputeShader.cs')}</div></div></div></section>
<section class="section language-surface"><div class="container">
<h2 class="h-lg">Start with HLSL. Explore other vocabularies when you need them.</h2><p>The syntax controls the attribute names you write. It does not select the output graphics API. WGSL-inspired authoring attributes already exist; generating WGSL output is planned for 2027.</p>
<div class="language-vocabularies">${Object.entries(SYNTAX_META).map(([id, meta]) => `<a class="btn btn-secondary" href="/syntaxes/${id}/">${meta.label}</a>`).join('')}</div>
<p class="mt-32"><a class="compilation-text-link" href="/technologies/compilation/">See how the shader is compiled →</a></p>
</div></section>`,
  };

  return [overview, language];
}

// Integrating Yotsuba Shader into your engine: English edition.
// Edit this file and run `typst compile --root . guide-en.typ` (see README.md).
#import "template.typ": *

#show: guide.with(
  lang: "en",
  title: "Integrating Yotsuba Shader into your engine",
  subtitle: "Everything you need to give the programmers who use your framework typed, validated shaders written in C\#",
  edition: "Edition 1.0 · October 2026 · Yotsuba Shader is released under the Microsoft Public License (MS-PL)",
  toc-title: "Contents",
)

#[
#set heading(numbering: none)
= Before you start

This guide is for the person who builds an engine, a framework or a content tool in C\# and wants it to run shaders written with Yotsuba Shader. It follows one imaginary engine, `MyEngine`, from an empty solution to a tested and published package. Every step is something you copy into your own project.

== What you will build

When you finish, the programmers who use your engine will write this:

#snippet(name: "Game.cs", lang: "cs", "var lit = new Lit(program.Parameters);\n\nlit.Material = new MaterialData { Roughness = 0.4f };\nlit.Albedo = assets.Load<Texture2D>(\"brick.png\");")

and every part of that line will be checked: the name, the type and the existence of the parameter. To get there you will build seven things:

#grid-table(
  ("No.", "You build", "Chapter"),
  ("1", "The types of your engine, marked so the GPU understands them", "3"),
  ("2", "The conventions for slots and update frequency", "5"),
  ("3", "The build step that compiles every shader to the formats you need", "6"),
  ("4", "A base class that turns uniforms into typed properties", "7"),
  ("5", "A loader that creates pipelines from the compiled shader", "8"),
  ("6", "Tests that run without a graphics card", "10"),
  ("7", "A package that your users install", "12"),
)

== How to read it

- Chapters 1 and 2 give the map and the setup. Read them first.
- Chapters 3 to 5 are about the shader language and the data. You can read them in any order when you need one topic.
- Chapters 6 to 9 are the integration itself. Follow them in order.
- Chapters 10 to 13 are quality, adoption in an existing engine, shipping and troubleshooting.

Every code listing has a file name on top. The listings in this guide are real files in the `code/` folder next to this document, and the C\# ones are compiled against the language package every time the guide is built, so you can copy them with confidence. The Spanish edition has the same structure.

#note[A listing shows the code of one file. When a file only shows a few members, a comment on the first line tells you which class they belong to.]

]

= How Yotsuba Shader fits into an engine

== The pipeline

Yotsuba Shader turns a C\# class into shader binaries. Your engine never parses shader text and never ships a second language. The compiler reads the class, checks its interfaces and resources, and produces SPIR-V. The other formats come from SPIR-V.

#flow(("C\# class", "your shader"), ("Compiler", "checks and lowers"), ("SPIR-V", "always produced"), ("Other formats", "HLSL, MSL, WGSL, GLSL, GLSL ES"))

Two translators sit behind the other formats: SPIRV-Cross writes HLSL and Metal Shading Language, and Naga writes WGSL and GLSL. You do not call them directly. You ask for a format and receive its text.

== What Yotsuba Shader does, and what your engine does

#grid-table(
  ("Yotsuba Shader", "Your engine"),
  ("Defines the attributes that describe types, stages, slots and resources", "Applies them to its own vector, matrix and texture types"),
  ("Finds the shaders in your project and checks them while you build", "Decides the binding convention and the update frequency of each group of data"),
  ("Generates every binary you ask for and a description of each shader", "Picks the format that matches the graphics API at run time"),
  ("Exposes the same two objects on every shader: its code and its reflection", "Creates pipelines, buffers and descriptors from them"),
  ("Skips CPU code in the shader class that you mark with an attribute", "Gives every shader a typed API on the CPU"),
)

The line between the two columns is the subject of this guide. The left column is already done. The right column is what you build.

== The five integration points

#grid-table(
  ("Point", "Question it answers", "Chapter"),
  ("Types", "Which of my types are a vector, a matrix, a texture or a sampler?", "3"),
  ("Language", "How do my users describe stages, inputs and outputs?", "4"),
  ("Resources", "Where does each uniform, buffer and texture go?", "5"),
  ("Compilation", "Which formats do I generate, and when?", "6"),
  ("CPU API", "How does the game set a uniform and load a shader?", "7 and 8"),
)

== Three decisions to make now

Write down your answers before you begin. Changing them later is possible, but it touches every shader your users have written.

+ *Which syntax do you recommend?* The HLSL, GLSL, MSL, SPIR-V and WGSL syntaxes express the same intent. The syntax does not choose the output. Choose the one most of your users already know, and use it in all your examples. See Chapter 4.
+ *Which formats do you ship?* Only the graphics APIs your engine supports. Each format you drop makes the build faster and the package smaller. See Chapter 6.
+ *What is your binding convention?* A rule that says which `set` holds the camera, which one holds the material and which one holds the object. Chapter 5 proposes one.

= Set up the solution

== The projects

Split the engine so that the types, the graphics layer and the shaders can change at different speeds.

#snippet(name: "Solution layout", "MyEngine/\n├── MyEngine.sln\n├── src/\n│   ├── MyEngine.Core/            vector, matrix and texture types\n│   │   ├── Vector2.cs  Vector3.cs  Vector4.cs  Matrix4.cs\n│   │   └── Texture2D.cs  SamplerState.cs\n│   ├── MyEngine.Graphics/        the graphics API layer\n│   │   ├── IGraphicsDevice.cs  IParameterSet.cs\n│   │   ├── ShaderProgram.cs  Std140.cs\n│   │   └── Vulkan/  Direct3D12/  Metal/  OpenGL/\n│   └── MyEngine.Shaders/         shader base class and engine shaders\n│       ├── ShaderBase.cs\n│       └── Lit.cs  Unlit.cs  Tonemap.cs\n├── samples/\n│   └── Game/                     a game that uses the engine\n└── tests/\n    └── MyEngine.Shaders.Tests/")

#grid-table(
  ("Project", "References", "Why"),
  ("MyEngine.Core", "YotsubaShader.Language", "Your types carry the attributes. The package only holds metadata, so it does not change how they behave or how they sit in memory."),
  ("MyEngine.Graphics", "MyEngine.Core, YotsubaShader.Language", "Reads the compiled shaders and talks to the graphics API."),
  ("MyEngine.Shaders", "Core, Graphics, the source generator", "Contains the shaders your engine ships. The generator compiles them during the build."),
  ("Game", "MyEngine.Shaders", "Uses the shaders through their typed API."),
)

== The language package

The package with the attributes goes in the project that defines your types.

#listing("core.csproj.xml", name: "MyEngine.Core.csproj")

== The compilation step

The shader project references the source generator and lists the formats you ship in `YotsubaTargets`.

#listing("shaders.csproj.xml", name: "MyEngine.Shaders.csproj")

The generator runs inside `dotnet build`. It needs no extra tool on your machine and no step in your CI beyond the build itself. A shader that does not compile fails the build like any C\# error. Chapter 6 explains each target.

#tip[Use `PrivateAssets="all"` on the generator. It keeps the generator out of the package you publish, so your users do not receive a build tool they never asked for.]

== Requirements

- The .NET 8 SDK, on macOS, Linux or Windows.
- Nothing else to compile shaders. The graphics SDKs you already use for your backends are still yours to install.

= Your types become GPU types

If you build an engine, you already have `Vector2`, `Matrix4` and `Texture2D`. You do not need a second set of types for shaders. You add attributes to the types you already have, and the programmers who use your engine write shaders with the types they use everywhere else.

== How the GPU sees your types

To the GPU, a struct without attributes is only a group of fields. The name does not matter: a struct called `Vector2` is not a vector unless you say so. You mark only the types that must behave as a vector, a matrix, a texture or a sampler.

#flow(("Scalars", "no attribute"), ("Vectors", "[Vector]"), ("Matrices", "[Matrix]"), ("Textures", "[Texture]"), ("Samplers", "[Sampler]"))

== Scalars: nothing to do

`bool`, `int`, `uint`, `float` and `double` are GPU types as they are. Use them alone or inside structs.

== Vectors

Put `[Vector]` on the struct and `[VectorComponent(i)]` on each component, starting at 0. The index is the position of the component in the GPU vector, so `X` is 0, `Y` is 1, and so on. The number of members you mark is the size of the vector.

#listing("Vector2.cs")

Your constructors, operators and methods stay as they are. Components can be fields or properties, and a vector can have `int` or `uint` components when all of them share one type.

#listing("Vector3.cs")
#listing("Vector4.cs")
#listing("IntVectors.cs")

#warn[The components of one vector must have the same type, and only `float`, `int` and `uint` are valid. A mixed vector throws `InconsistentVectorComponentTypeException` and a `double` component throws `VectorComponentTypeNotValidException`. Both appear when the compiler processes a shader that uses the type, so compile one shader that uses each of your types before you publish them.]

== Matrices

A matrix is a struct marked with `[Matrix]` whose columns are vectors. Mark each column with `[MatrixColumn(i)]`, starting at 0. The column type is one of the vectors you declared.

#listing("Matrix4.cs")

== Textures

`[Texture]` goes on a class or a struct. It needs two values: the dimension (`D1`, `D2`, `D3` or `Cube`) and the kind of values it holds (`Float`, `Int` or `Uint`). The optional settings describe the rest.

#listing("Textures.cs")

#grid-table(
  ("Setting", "Values", "Default"),
  ("`Usage`", "`Sampled` (the shader reads it), `Storage` (the shader writes it)", "`Sampled`"),
  ("`Depth`", "`No`, `Yes`, `Unknown`", "`No`"),
  ("`Format`", "`Unknown`, `Rgba8`, `Rgba16f`, `Rgba32f`, `R32f`, `R32i`, `R32ui` and others", "`Unknown`"),
  ("`Arrayed`", "`true` for an array of textures", "`false`"),
  ("`Multisampled`", "`true` for a multisampled texture", "`false`"),
)

A storage texture also needs its pixel `Format`, because the shader writes to it.

== Samplers

A sampler decides how a texture is read. It has no settings: `[Sampler]` only says that the type represents one.

#listing("SamplerState.cs")

== Structs and arrays

Any other struct is converted field by field, including nested structs. Arrays need no attribute. What changes is where the data comes from: `[Uniform]` and `[StorageBuffer]` mark values that your engine uploads before drawing. Chapter 5 covers them.

== A type you do not own

Attributes go on types you control. You cannot mark `System.Numerics.Vector3` or a type from another package. Keep your own struct and convert at the edges of your code. A `partial` struct lets you add the conversions in a separate file.

#listing("Interop.cs")

== Check that it works

Open the playground or compile a small project, put your types in one file and a shader that uses each of them in another. Two things should happen: there are no errors, and the entry points of the shader are listed. Do this once for every type you publish. It is the cheapest test you will write.

= Write shaders with your types

== Stages

A shader is a class. Its entry points are methods marked with `[ShaderStage]`. A class can have any number of stages, and methods without the attribute are ordinary C\# that the compiler ignores.

#grid-table(
  ("Stage", "Receives", "Returns"),
  ("`Stage.Vertex`", "Per-vertex input", "A struct that includes the clip-space position"),
  ("`Stage.Fragment`", "The interpolated values of the vertex stage", "The color for the render target"),
  ("`Stage.Compute`", "A built-in such as the global invocation id", "Nothing: it writes to storage buffers"),
)

== Interface slots

Every value that crosses a stage boundary has a slot. There are two kinds you write: numbered locations and built-in values.

#listing("Types.cs")

`[Location(n)]` links an output of one stage to the input of the next with the same number. `[SV_Position]` is a built-in: the clip-space position that the GPU needs. Each syntax names the built-ins in its own way. Appendix B lists them side by side.

== Choose one syntax for your engine

The five syntaxes are equivalent. Each one is its own package, with a namespace of the same name, built on `YotsubaShader.Language`. The HLSL syntax does not require a Direct3D target, and the WGSL syntax does not require WebGPU. Choose by the habits of your users, not by the graphics API you support.

#grid-table(
  ("If your users…", "Recommend"),
  ("come from Unity, Direct3D or XNA and MonoGame", "HLSL: `YotsubaShader.HlslSyntax`"),
  ("come from OpenGL or Godot", "GLSL: `YotsubaShader.GlslSyntax`"),
  ("write for Apple platforms", "MSL: `YotsubaShader.MslSyntax`"),
  ("work close to Vulkan and SPIR-V", "SPIR-V: `YotsubaShader.SpirvSyntax`"),
  ("write for the web", "WGSL: `YotsubaShader.WgslSyntax`"),
  ("have no habit yet", "HLSL: the link between stages is easy to see"),
)

#warn[Several names exist in more than one syntax (`uniform` and `buffer`, for example). Import one syntax namespace per file, and tell your users to do the same.]

== A complete example

The shader below is the one you will carry through the rest of the guide. It uses the types of the previous chapter, three uniform groups and a texture with its sampler.

#listing("UniformData.cs")
#listing("Lit.cs")

You have not seen `ShaderBase`, `Get` and `Set` yet. They are the CPU side of the shader and Chapter 7 builds them. For now, read the stage methods and the attributes on the properties.

= Resources and the binding convention

== Uniforms, storage buffers, textures and samplers

#grid-table(
  ("Attribute", "What it is for", "Typical size"),
  ("`[Uniform]`", "A value that stays the same during a draw or dispatch: a camera, a time, a material", "Small"),
  ("`[StorageBuffer]`", "An array the shader can read and write: particles, results of a computation", "Large"),
  ("A texture field", "The pixels of an image, with `[Texture]` on its type", "Any"),
  ("A sampler field", "How a texture is read, with `[Sampler]` on its type", "—"),
)

A storage buffer is read and write by default. State the access when the shader only reads or only writes: `Access = ResourceAccess.ReadOnly` or `WriteOnly`. A type can also say it for you. `ImmutableArray<T>`, `ReadOnlyMemory<T>` and `ReadOnlySpan<T>` are read-only because of what they are. In a class field use `ImmutableArray<T>` or `ReadOnlyMemory<T>`, because C\# does not allow spans as fields.

#warn[A field cannot be both `[Uniform]` and `[StorageBuffer]`. The compiler throws `InvalidOperationException`. Choose a uniform for a small value that does not change during the draw, and a storage buffer for an array.]

== Binding slots

Your engine needs to know where each resource goes. The shared `[Binding(set, binding)]` attribute works in every syntax, and each syntax also has the spelling of its source language.

#snippet(name: "The same slot in each syntax", lang: "cs", "[Uniform, Binding(1, 0)]                  // any syntax\n[cbuffer, register(RegisterPrefix.b, 0)]   // HLSL\n[uniform, layout(1, 0)]                   // GLSL\n[constant, buffer(0)]                     // MSL\n[Uniform, DescriptorSet(1), @Binding(0)]  // SPIR-V\n[uniform, @group(1), @binding(0)]         // WGSL")

The slots are only numbers. The meaning of each number is your convention.

== A convention that scales

A good convention makes the update frequency visible. Put what changes less in a lower set. The engine then binds each set once per group of draws, not once per draw.

#listing("Sets.cs")

#grid-table(
  ("Set", "Holds", "Changes", "Bound"),
  ("0 · Frame", "Camera, time, lights", "Once per frame", "Once per frame"),
  ("1 · Material", "Textures, samplers, material factors", "Once per material", "When the material changes"),
  ("2 · Object", "World matrix, per-object data", "Once per object", "Once per draw"),
)

Tell your users to use these constants and never numbers. A shader written with `Sets.Material` keeps working if you later reorder the sets.

== Uniform data and memory

A uniform struct is uploaded as plain memory. The rules for how the fields sit in that memory come from the graphics API, not from Yotsuba Shader. The attributes do not change the layout of your types. Chapter 8 shows a small helper that computes the standard `std140` layout from the same attributes you added in Chapter 3, so your uploader and the shader agree.

= Compile your shaders

== The source generator

This is the main way to compile. A Roslyn source generator runs as part of `dotnet build`. It finds every `[ShaderStage]` method, compiles it and writes the result into the other half of the class. For this the class must be `partial`.

#listing("Triangle.cs")

The generator adds this half. It declares two fields and fills them with generated code.

#listing("Triangle.g.cs")

Both fields carry `[ShaderIgnore]`, which tells Yotsuba Shader not to treat them as part of the shader. The generated half adds no base class, so your own base class, such as the `ShaderBase` of Chapter 7, never conflicts with it.

== Two objects on every shader

Every shader exposes the same two types. That is what lets your engine load any shader in the same way.

#snippet(name: "YotsubaShader.Language.Compilation", lang: "cs", "public sealed class ShaderCompiledCode\n{\n    public bool Has(string entryPoint, Binaries format);\n    public ReadOnlySpan<byte> Get(string entryPoint, Binaries format);\n    public string GetText(string entryPoint, Binaries format);\n}\n\npublic sealed class ShaderReflection\n{\n    public IReadOnlyList<Binaries> BinaryFormats { get; }\n    public IReadOnlyList<EntryPointInfo> EntryPoints { get; }\n    public IReadOnlyList<ResourceBinding> Resources { get; }\n}")

- `ShaderCompiledCode` holds one binary per entry point and format. The key is the name of the C\# method, so `nameof(Triangle.Vertex)` is checked by the compiler. Text formats come back as UTF-8 bytes, and `GetText` decodes them.
- `ShaderReflection` lists the formats that were generated, the entry points (name and stage) and the resources (name, kind, access and slot). You never read a binary to build a pipeline.

#listing("ReadBinaries.cs")

The data lives as static data in your assembly, so reading it neither copies nor allocates.

== The formats

#grid-table(
  ("Target", "`Binaries`", "What it holds", "Used for"),
  ("`spirv`", "`Binaries.SpirV`", "SPIR-V binary", "Vulkan"),
  ("`hlsl`", "`Binaries.Hlsl`", "UTF-8 text", "Direct3D 11 and 12"),
  ("`msl`", "`Binaries.Msl`", "UTF-8 text", "Metal"),
  ("`wgsl`", "`Binaries.Wgsl`", "UTF-8 text", "WebGPU"),
  ("`glsl`", "`Binaries.Glsl`", "UTF-8 text", "OpenGL"),
  ("`glsles`", "`Binaries.GlslEs`", "UTF-8 text", "OpenGL ES, WebGL"),
)

Only the targets listed in `YotsubaTargets` are generated. SPIR-V is the format the compiler writes. HLSL and MSL are translated from it by SPIRV-Cross, and WGSL and GLSL by Naga.

== From text to something the GPU runs

The text formats still need a last step, and it is the job of the platform:

#grid-table(
  ("API", "Who compiles the text", "You ship"),
  ("Vulkan", "Nobody: SPIR-V is the final binary", "SPIR-V"),
  ("Metal", "The Metal framework, when you create the library", "MSL text"),
  ("WebGPU", "The browser", "WGSL text"),
  ("OpenGL, WebGL", "The graphics driver", "GLSL text"),
  ("Direct3D 11 and 12", "DXC (Shader Model 6) or FXC (Shader Model 5.x), which you already use", "HLSL text"),
)

Yotsuba Shader stops at the HLSL text. It does not produce DXIL or DXBC. If you want Direct3D bytecode inside your package, compile the HLSL with your own DXC or FXC in the same build step and ship the result.

== The command line

For CI, scripts and content tools, the same compiler is available as a command. You give it your project file and it writes one binary per entry point.

#snippet(name: "Terminal", lang: "bash", "yotsuba compile YourGame.csproj \\\n  --target spirv \\\n  --output artifacts/shaders")

The output folder holds `Triangle.Vertex.spv`, `Triangle.Fragment.spv` and so on. Add `--entry Triangle.Vertex` to compile one entry point. This is also the easiest way to inspect the output with `spirv-val` and `spirv-dis`.

#grid-table(
  ("Workflow", "Runs", "Best for", "Output"),
  ("Source generator", "During `dotnet build`", "Engines and games that ship shaders with the code", "Static data in a `partial` class"),
  ("Command line", "In scripts and CI", "Content pipelines, inspection, validation", "`.spv` files"),
)

== Translating at run time

Most engines never need this: the generator already produced every format. When your tool creates shaders while it runs, such as an editor, hand the SPIR-V to the `Transpile` API and receive text.

#snippet(name: "Transpile.cs", lang: "cs", "using YotsubaShader.Transpile;\n\nvar hlslOptions = new HlslOptions { ShaderModel = 51, EntryPoint = \"Vertex\" };\nvar glslOptions = new GlslOptions { Es = true, Version = 300 };\n\nstring hlsl = Transpile.FromSpirVToHlsl(spirv, hlslOptions);\nstring msl  = Transpile.FromSpirVToMsl(spirv);\nstring wgsl = Transpile.FromSpirVToWgsl(spirv);\nstring glsl = Transpile.FromSpirVToGlsl(spirv, glslOptions);")

Both translators are native code, so each platform needs its own build. On consoles, translate at build time: neither translator was verified against any console toolchain.

= The CPU side: typed shader parameters

== The problem

Every engine sets a uniform by name, usually with a string:

#snippet(name: "The usual way", lang: "cs", "parameters.Set(\"Exposure\", 1.2f);\nparameters.Set(\"LightDirection\", direction);")

A typo, a parameter renamed in the shader but not in the game, or a value of the wrong type all compile without errors. They fail when that line runs, not when you build. Yotsuba Shader removes the problem because the shader class is C\#: the name and the type of each uniform are written once, and the C\# compiler checks them when the shader is built and when the game uses it.

== Step 1: hide how the graphics API sets a uniform

Vulkan, Direct3D, Metal and OpenGL set uniforms in different ways. Put that difference behind one interface. It is the only part of this chapter that depends on the graphics API.

#listing("IParameterSet.cs")

Each backend implements it once. A Vulkan version writes into a uniform buffer, and an OpenGL version calls the uniform functions. Plain data goes through `Get` and `Set`, so `T` is `unmanaged`. Textures and samplers are objects of your engine and have their own methods.

== Step 2: a base class for every shader

The base class holds the parameter set and gives each shader the helpers it needs. The name of the uniform is not a parameter that the programmer writes: `[CallerMemberName]` makes the C\# compiler fill it with the name of the property that calls the helper.

#listing("ShaderBase.cs")

Inside `public MaterialData Material { get => Get<MaterialData>(); }` the name is `"Material"`. There is no string and no `nameof` to forget, and renaming the property renames the uniform. Everything in this class is CPU code, so it carries `[ShaderIgnore]`.

== Step 3: a shader on top of it

The shader of Chapter 4 already has this shape. Look at its properties again:

#snippet(name: "Lit.cs (excerpt)", lang: "cs", "[Uniform, Binding(Sets.Material, 0)]\npublic MaterialData Material { get => Get<MaterialData>(); set => Set(value); }\n\n[Binding(Sets.Material, 1)]\npublic Texture2D Albedo { get => GetTexture(); set => SetTexture(value); }")

One line per resource. The constructor passes the reflection of the shader to the base class: `base(parameters, Reflection)`. `Reflection` is the static field that the generated half declares.

== Step 4: logic on the CPU, once per draw

A shader runs its code for every vertex and every pixel. Anything that is the same for the whole draw is cheaper on the CPU. Add it to the same class and mark it `[ShaderIgnore]`.

#listing("LitLogic.cs")

The game never has to know how the tint is stored.

== Step 5: fail when the shader loads

The constructor of `ShaderBase` compares `reflection.Resources` with the parameter set. A resource that the compiled shader has and the engine cannot provide throws when the shader loads, with the name of the resource in the message. Without this check the same mistake would appear as a black screen on the first frame that draws.

== When your engine already has a base type

Some engines give you a class to inherit from. The idea does not change: the property calls the engine, and the rest of the game uses the property.

#grid-table(
  ("Engine", "How the class reaches it", "Listing"),
  ("XNA, MonoGame, FNA", "Inherit from `Microsoft.Xna.Framework.Graphics.Effect` and use `Parameters`", "LitXna.cs"),
  ("Unity", "Hold the `Material` in a field marked `[ShaderIgnore]`", "LitUnity.cs"),
  ("Godot", "Inherit from `ShaderMaterial` and use `SetShaderParameter`", "LitGodot.cs"),
)

#listing("LitXna.cs")
#listing("LitUnity.cs")
#listing("LitGodot.cs")

A field that holds an engine object is not a GPU type, so it carries `[ShaderIgnore]`. Inheriting from an engine type does not conflict with the generated half, because that half adds no base class.

= Load shaders and create pipelines

== One interface for the graphics API

The loader needs four things from your graphics layer. Keep the interface small. Each backend implements it once.

#listing("IGraphicsDevice.cs")

Note that `CreatePipelineLayout` receives the resources straight from the reflection. Your backend does not know about C\# shaders: it only receives a list of names, kinds, accesses and slots, and builds its own descriptor sets, root signature or bind group layout.

== Choose the format for the device

One function maps the graphics API to the format that your engine ships for it.

#listing("ShaderFormats.cs")

== The loader

`ShaderProgram.Load<TShader>` reads the two static fields of the generated half, chooses the format, creates one module per entry point and builds the layout from the reflection. It caches the result per device and shader.

#listing("ShaderProgram.cs")

#note[The loader reads the static fields by name. It needs no registry and no interface on the shader. If your engine is compiled ahead of time and trims unused members, keep `CompiledCode` and `Reflection` with the usual trimming annotations.]

If the format is missing, the message tells your user what to change: add it to `YotsubaTargets`. It is a build setting, not a code change.

== What each backend does with a module

#grid-table(
  ("API", "Input", "Creates"),
  ("Vulkan", "SPIR-V bytes", "A shader module"),
  ("Direct3D 11 and 12", "HLSL text, compiled by DXC or FXC", "A shader object or a pipeline state stage"),
  ("Metal", "MSL text", "A library, then a function with the entry point name"),
  ("WebGPU", "WGSL text", "A shader module"),
  ("OpenGL, WebGL", "GLSL text", "A shader object, then a program"),
)

== Uniform buffers and the `std140` layout

The shader reads a uniform struct from memory with a layout that depends on the graphics API. The common choice for uniform buffers is `std140`. Its rules are small: a scalar takes 4 bytes. A two-component vector takes 8 bytes and aligns to 8. A three- or four-component vector aligns to 16, so a three-component vector takes 12 bytes and the next field may fill the gap. A matrix is stored as columns of four components. A struct aligns to 16 and its size rounds up to 16.

You do not need to type those numbers anywhere. The helper below reads the same attributes you put on your types in Chapter 3.

#listing("Std140.cs")

#listing("Std140Test.cs")

#warn[Use `uint` or `int` for flags in uniform structs, not `bool`. A `bool` takes one byte on the CPU and four on the GPU.]

= Materials and the render loop

== Using a shader in a game

This is the whole loading and update code a game needs. It has no strings and no casts.

#listing("Game.cs")

The last line shows the point of the work: a wrong type is a build error in the game, not a failure during a frame.

== Keep the update frequency visible

The convention of Chapter 5 turns into the render loop:

#flow(("Frame", "bind set 0"), ("Material", "bind set 1"), ("Object", "bind set 2 and draw"))

+ Once per frame, set `lit.Frame` and bind set 0.
+ When the material changes, set its properties and bind set 1. Sort draws by material so this happens as little as possible.
+ For each object, set `lit.Object` and draw.

Because each group is one struct, each group is one upload. Do not set the fields of a uniform struct one at a time: build the struct and assign it.

== A shader object per material

`ShaderProgram` is shared: it holds the modules and the layout. A `Lit` object holds the values of one material. Create one `Lit` per material and one `ShaderProgram` per shader and device. Dispose the programs when the device goes away.

== Performance notes

- *Resolve names once.* The `[CallerMemberName]` string is a constant that the C\# compiler writes into your code, so the name costs nothing at run time. Make your `IParameterSet` resolve each name to an offset or a slot when it is created, from the reflection, so every later `Set` is a write into an array and not a lookup by text.
- *No boxing.* `Get` and `Set` are generic and `unmanaged`, so a `float` or a struct is never boxed.
- *One upload per group.* A uniform struct is one write. Assign the whole struct and let the backend upload it once per set.
- *Create material objects when you load, not when you draw.* A `Lit` is cheap, but a loop that creates one per object per frame creates garbage for nothing.

== Hot iteration

During development, the build is your reload. Change the shader, run `dotnet build`, and the generator rewrites the binaries. If your editor must compile shaders while it runs, use the translation API of Chapter 6 on the SPIR-V that the compiler produces.

= Test without a graphics card

== The CPU side is plain C\#

Because the shader talks to the engine through `IParameterSet`, a test can use a fake one. The logic of your shader classes runs on the build server, where there is no graphics card.

#listing("FakeParameterSet.cs")
#listing("LitTests.cs")

== Test the reflection

Every shader exposes its resources. A test that lists the names you expect catches a renamed uniform before your users do.

#listing("ReflectionTest.cs", name: "ReflectionTests.cs")

== Test the layout

The `Std140` helper is plain code, so the tests of Chapter 8 run anywhere. Add a test for every uniform struct of every shader you ship: it is the difference between a correct image and a quiet misalignment.

== Validate the binaries in CI

The build already fails when a shader does not compile. Add one more step: validate the SPIR-V with `spirv-val` from SPIRV-Tools.

#listing("ci.yml", name: ".github/workflows/build.yml")

= Adopt it in an existing engine

Most engines already have effects, materials and string parameters. You do not have to replace them in one step. This order keeps the engine working after every step.

== Step 1: mark your types

Add the attributes of Chapter 3 to the vector, matrix, texture and sampler types you already have. The attributes are metadata: nothing changes at run time, so this step is safe to release on its own.

== Step 2: write one new shader

Choose a small, self-contained shader, such as a post-processing pass or a debug material. Write it with Yotsuba Shader, load it with the loader of Chapter 8 and draw with it. Keep every other effect as it is.

#flow(("Old effects", "unchanged"), ("One new shader", "typed API"), ("Both in the same frame", "no conflict"))

== Step 3: run both side by side

The new loader and your old one can coexist, because both end in the same graphics API. If you already have a material system, give it a second kind of material that holds a `ShaderBase` object instead of a name and a dictionary of values. Draw both kinds in the same render loop.

== Step 4: replace string parameters

Search your game code for the calls that set a parameter by name. Each one is a candidate for a property:

#snippet(name: "Before and after", lang: "cs", "// Before: a string, a value of any type\nparameters.Set(\"Exposure\", 1.2f);\n\n// After: a property, checked by the compiler\nlit.Exposure = 1.2f;")

Replace them shader by shader. After each shader, build: a name or a type that does not match is now a compiler error, which is the list of what is left to fix.

== Step 5: remove the old path

When no effect uses the old format, remove the old loader and the old parameter code. If the old effect files were text, delete them: the shaders are now C\# files in the project, with the rest of your code.

== What to measure

- *Build time.* The generator compiles shaders during the build. Keep `YotsubaTargets` to the formats you ship and compare the time before and after.
- *Package size.* Each format adds its binaries to the assembly. Drop the formats you do not use.
- *Frame time.* It should not change: the GPU receives the same kind of shader as before.

= Ship it

== Package your engine

Your users reference one package. It contains your types, which carry the attributes, so a reference to `YotsubaShader.Language` travels with it.

#listing("engine-package.xml", name: "MyEngine.csproj")

Ship the shaders as part of the package. The binaries are static data inside your assembly, so there are no extra files to copy.

== Keep these stable

Your users write shaders against your types and your conventions. Three things break them when they change:

- *The order of the components.* Index 0 is the first component. If `X` stops being 0, every shader that builds a vector changes meaning.
- *The memory layout your engine uses to upload data.* The attributes never change it, so keep following the rules of the graphics API.
- *Resource names and slots.* Renaming `Frame` or moving it to another set breaks every shader and every reflection test.

Treat a change to any of the three as a major version.

== Shader libraries

A shader library is a normal .NET library. Reuse your types, build on libraries written by others and share yours as a package. Because the types are yours, a library can describe its inputs with the types your engine already defines, and its CPU API comes with it.

== Licenses

#grid-table(
  ("Component", "License", "Where it matters"),
  ("Yotsuba Shader", "MS-PL", "Your package can be commercial or not, with no fee"),
  ("Roslyn", "MIT", "Inside the compiler"),
  ("SPIRV-Cross", "Apache-2.0 OR MIT (MIT used)", "If you use `Transpile` for HLSL or MSL"),
  ("Naga", "MIT or Apache-2.0", "If you use `Transpile` for WGSL or GLSL"),
  ("Khronos SPIR-V grammar", "MIT", "In the compiler's tables"),
)

Keep the notices of the third-party components in the `NOTICE` file of your package. The name and the logo of Yotsuba Shader are not covered by the license.

== Document it for your users

Your users should not need this guide. Give them three pages: how to add the package, a shader that compiles and draws, and a list of your conventions (sets, units, coordinate system). Use your own types in every example.

= Troubleshooting

#grid-table(
  ("What you see", "Why", "What to do"),
  cols: (1.5fr, 1.2fr, 1.4fr),
  ("`InconsistentVectorComponentTypeException`", "A vector has components of different types", "Give all components of the vector one type: `float`, `int` or `uint`"),
  ("`VectorComponentTypeNotValidException`", "A vector component is not `float`, `int` or `uint`", "Use one of the three, for example `float` instead of `double`"),
  ("`InvalidOperationException` on a resource", "A field is both `[Uniform]` and `[StorageBuffer]`", "Choose one"),
  ("A struct is treated as a plain group of fields", "The type has no `[Vector]`, `[Matrix]`, `[Texture]` or `[Sampler]`", "Add the attribute to the type you own, not to a type of another package"),
  ("The shader class is not found", "No method has `[ShaderStage]`, or the class is in another project", "Mark at least one method. Only types of the project that references the generator are inspected"),
  ("`CompiledCode` does not exist", "The class is not `partial`, or the generator is not referenced", "Make the class `partial` and reference the generator"),
  ("`Binaries.Msl` is not available", "The format is not listed in `YotsubaTargets`", "Add `msl` and build again"),
  ("`The shader has no parameter named …`", "The engine cannot provide a resource that the shader has", "Add the parameter in the backend, or rename the property"),
  ("A black screen with no errors", "A uniform struct has a different layout on the CPU and on the GPU", "Compute the offsets with the helper of Chapter 8 and test them"),
  ("Two attributes with the same name", "Two syntax namespaces imported in one file", "Import one syntax namespace per file"),
)

#[
#set heading(numbering: none)
= Appendix A: Checklist

Use it before you publish a new version of your engine.

#grid-table(
  ("", "Item"),
  ("#box(width: 7pt, height: 7pt, stroke: 0.6pt + gray)", "Every public vector, matrix, texture and sampler type has its attribute"),
  ("#box(width: 7pt, height: 7pt, stroke: 0.6pt + gray)", "One shader that uses each of those types compiles without errors"),
  ("#box(width: 7pt, height: 7pt, stroke: 0.6pt + gray)", "`YotsubaTargets` lists every graphics API the engine supports, and no other"),
  ("#box(width: 7pt, height: 7pt, stroke: 0.6pt + gray)", "The binding convention is documented and used through constants"),
  ("#box(width: 7pt, height: 7pt, stroke: 0.6pt + gray)", "`ShaderBase` validates the reflection when a shader loads"),
  ("#box(width: 7pt, height: 7pt, stroke: 0.6pt + gray)", "Every uniform struct has a layout test"),
  ("#box(width: 7pt, height: 7pt, stroke: 0.6pt + gray)", "Every shader has a reflection test with the names the engine expects"),
  ("#box(width: 7pt, height: 7pt, stroke: 0.6pt + gray)", "CI builds, runs the tests and validates the SPIR-V"),
  ("#box(width: 7pt, height: 7pt, stroke: 0.6pt + gray)", "The package carries the notices of its third-party components"),
  ("#box(width: 7pt, height: 7pt, stroke: 0.6pt + gray)", "A change to component order, memory layout, resource names or slots bumps the major version"),
)

#set page(flipped: true)

= Appendix B: Built-in values across syntaxes

The same value has a different name in each vocabulary. All of them mean the same thing to the compiler.

#include "generated/builtins-en.typ"

= Appendix C: Resource attributes across syntaxes

#include "generated/resources-en.typ"

#set page(flipped: false)

= Appendix D: Glossary

#grid-table(
  ("Term", "Meaning"),
  ("Entry point", "A method marked with `[ShaderStage]`. The GPU starts running a stage there"),
  ("Stage", "A step of the pipeline: vertex, fragment or compute"),
  ("Location", "A number that links an output of one stage to an input of the next"),
  ("Built-in", "A value that the pipeline provides or consumes, such as the clip-space position"),
  ("Uniform", "A value that stays the same during a draw or dispatch"),
  ("Storage buffer", "An array that a shader can read and write"),
  ("Set and binding", "Two numbers that say where a resource is bound"),
  ("Reflection", "The description of a shader: its formats, entry points and resources"),
  ("SPIR-V", "The binary shader format that the compiler writes. The other formats are translated from it"),
  ("SPIRV-Cross, Naga", "The translators that write HLSL and MSL, and WGSL and GLSL"),
  ("`std140`", "A set of rules for how the fields of a struct sit in a uniform buffer"),
  ("`[ShaderIgnore]`", "An attribute that tells Yotsuba Shader that a member is CPU code, not part of the shader"),
)

= Appendix E: Frequently asked questions

#grid-table(
  ("Question", "Answer"),
  cols: (1fr, 2fr),
  ("Does my game need Roslyn or the compiler at run time?", "No. The compiler runs during the build. Only the generated binaries, which are static data in your assembly, reach the game."),
  ("Can I ship only SPIR-V and translate at run time?", "Yes, with the `Transpile` API. It is meant for editors and tools. For a shipped game, translate at build time and avoid carrying a translator in the player."),
  ("Which formats do I need for a Direct3D engine?", "Only `hlsl`. Compile the text with the DXC or FXC you already use. Yotsuba Shader does not produce DXIL or DXBC."),
  ("Can two shaders use different syntaxes?", "Yes. The syntax does not change the result. Import one syntax namespace per file."),
  ("Do I have to make my shader classes `partial`?", "Only when you use the source generator, because it adds the other half of the class. The command line does not need it."),
  ("What does `[ShaderIgnore]` apply to?", "To any member or type that is CPU code: fields, properties, methods and whole classes, such as a base class."),
  ("Can my base class and the generated half coexist?", "Yes. The generated half adds no base class, so any class you inherit from works, including the type of another engine."),
  ("What if my graphics API is not on the list?", "Choose the closest format from `YotsubaTargets`. SPIR-V is always available, and the text formats cover most APIs."),
  ("Can I read SPIR-V back into C\\#?", "That direction is planned and has no API yet."),
)

]

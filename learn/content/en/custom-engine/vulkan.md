---
title: Compile for Vulkan
summary: Turn a finished C# shader into a SPIR-V file and load it in a Vulkan program.
order: 6
---

This chapter starts from a shader that is already written. You copy it, compile it to SPIR-V with the CLI and load the result in Vulkan. Writing shaders is not the subject here; that is what [Get Started](../get-started/index.md) teaches.

## The shader

Install the CLI once and create a project for the shader:

```bash
dotnet tool install --global YotsubaShader.Compiler.CLI
dotnet new classlib -n MyShaders -f net8.0
dotnet add MyShaders package YotsubaShader.GlslSyntax
```

Delete the `Class1.cs` that the template creates and save this as `MyShaders/Plasma.cs`:

```csharp
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Resources;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.Language;
using static YotsubaShader.GlslSyntax.Methods.Math;

namespace MyShaders;

public struct Corner
{
    [location(0)] public vec2 Position;
    [location(1)] public vec2 Uv;
}

public struct Pixel
{
    [gl_Position] public vec4 Position;
    [location(0)] public vec2 Uv;
}

public struct PixelIn
{
    [location(0)] public vec2 Uv;
}

public struct Clock
{
    public float Seconds;
}

public class Plasma
{
    [uniform, layout(0, 0)]
    public Clock Time;

    [ShaderStage(Stage.Vertex)]
    public Pixel Vertex(Corner corner)
    {
        Pixel pixel;
        pixel.Position = Make.Vec4(corner.Position.X, corner.Position.Y, 0f, 1f);
        pixel.Uv = corner.Uv;
        return pixel;
    }

    [ShaderStage(Stage.Fragment)]
    [return: location(0)]
    public vec4 Fragment(PixelIn pixel)
    {
        float x = pixel.Uv.X * 2f - 1f;
        float y = pixel.Uv.Y * 2f - 1f;
        float t = Time.Seconds;

        float waves = sin(x * 6f + t)
                    + sin(y * 6f + t * 1.3f)
                    + sin((x + y) * 6f + t * 0.7f)
                    + sin(sqrt(x * x + y * y) * 9f - t * 2f);

        float red = 0.5f + 0.5f * sin(waves * 1.5f);
        float green = 0.5f + 0.5f * sin(waves * 1.5f + 2.1f);
        float blue = 0.5f + 0.5f * sin(waves * 1.5f + 4.2f);
        return Make.Vec4(red, green, blue, 1f);
    }
}

public static class Make
{
    public static vec4 Vec4(float x, float y, float z, float w)
    {
        vec4 v;
        v.X = x;
        v.Y = y;
        v.Z = z;
        v.W = w;
        return v;
    }
}
```

It covers the whole screen with a moving plasma. The vertex method receives a position and a texture coordinate. The fragment method paints from `Time.Seconds`, a value your program writes into a uniform buffer on every frame.

## Which format Vulkan reads

Vulkan does not take source text. It takes SPIR-V, a binary format. The target is `spirv`:

```bash
yotsuba compile MyShaders/MyShaders.csproj --target spirv --output shaders
```

It prints nothing when it works and exits with code `0`. The `--output` folder is counted from the folder of the `.csproj`, and the subfolders follow the namespace:

```text
MyShaders/shaders/
└── MyShaders/
    └── Plasma.spv
```

Unlike the text formats, SPIR-V is a single file per class, with every stage inside. If you have the Vulkan SDK, `spirv-dis` shows what is in it. These are the entry points and the placement of the uniform buffer:

```bash
spirv-dis MyShaders/shaders/MyShaders/Plasma.spv | grep -E "OpEntryPoint|DescriptorSet|Binding"
```

```text
OpEntryPoint Vertex %Vertex "Vertex" %corner_Position %corner_Uv %__return_Position %__return_Uv %Time
OpEntryPoint Fragment %Fragment "Fragment" %pixel_Uv %__return %Time
OpDecorate %Time DescriptorSet 0
OpDecorate %Time Binding 0
```

The names between quotes are the names of your C# methods, and they are what `PName` receives when you build the pipeline. The numbers you wrote are the ones Vulkan sees. The two vertex attributes:

```csharp
public struct Corner
{
    [location(0)] public vec2 Position;
    [location(1)] public vec2 Uv;
}
```

They are the attribute `location` 0 and 1 of your vertex input description. And the uniform buffer:

```csharp
[uniform, layout(0, 0)]
public Clock Time;
```

It is `DescriptorSet 0`, `Binding 0`.

The file is SPIR-V 1.6, which Vulkan accepts from version 1.3. The validator says so if you point it at an older version:

```bash
spirv-val --target-env vulkan1.0 MyShaders/shaders/MyShaders/Plasma.spv
```

```text
error: line 0: Invalid SPIR-V binary version 1.6 for target environment SPIR-V 1.0 (under Vulkan 1.0 semantics).
```

```bash
spirv-val --target-env vulkan1.3 MyShaders/shaders/MyShaders/Plasma.spv
```

The second command prints nothing, which means the file is valid. In your program, ask for Vulkan 1.3 when you create the instance:

```csharp
var app = new ApplicationInfo
{
    SType = StructureType.ApplicationInfo,
    ApiVersion = Vk.Version13,
};
```

## Load it in Vulkan

The examples use Silk.NET.Vulkan, and each call has the name of the native function. The pointers need `<AllowUnsafeBlocks>true</AllowUnsafeBlocks>` in the `.csproj` of the project that draws. The instance, the device and the render pass are the ones you already have. Read the file and create the shader module:

```csharp
static ShaderModule CreateModule(Vk vk, Device device, byte[] spirv)
{
    fixed (byte* code = spirv)
    {
        var info = new ShaderModuleCreateInfo
        {
            SType = StructureType.ShaderModuleCreateInfo,
            CodeSize = (nuint)spirv.Length,
            PCode = (uint*)code,
        };

        if (vk.CreateShaderModule(device, in info, null, out ShaderModule module) != Result.Success)
            throw new Exception("vkCreateShaderModule failed");
        return module;
    }
}

byte[] spirv = File.ReadAllBytes("shaders/MyShaders/Plasma.spv");
ShaderModule module = CreateModule(vk, device, spirv);
```

One module serves both stages. Each stage of the pipeline points to the same module and names its own entry point:

```csharp
var stages = stackalloc PipelineShaderStageCreateInfo[2];
stages[0] = new PipelineShaderStageCreateInfo
{
    SType = StructureType.PipelineShaderStageCreateInfo,
    Stage = ShaderStageFlags.VertexBit,
    Module = module,
    PName = (byte*)SilkMarshal.StringToPtr("Vertex"),
};
stages[1] = new PipelineShaderStageCreateInfo
{
    SType = StructureType.PipelineShaderStageCreateInfo,
    Stage = ShaderStageFlags.FragmentBit,
    Module = module,
    PName = (byte*)SilkMarshal.StringToPtr("Fragment"),
};
```

The vertex input description repeats the `location` numbers of the C# struct. The buffer has four floats per vertex, two for each attribute:

```csharp
var binding = new VertexInputBindingDescription
{
    Binding = 0,
    Stride = 16,
    InputRate = VertexInputRate.Vertex,
};

var attributes = stackalloc VertexInputAttributeDescription[2];
attributes[0] = new VertexInputAttributeDescription { Binding = 0, Location = 0, Format = Format.R32G32Sfloat, Offset = 0 };
attributes[1] = new VertexInputAttributeDescription { Binding = 0, Location = 1, Format = Format.R32G32Sfloat, Offset = 8 };

var vertexInput = new PipelineVertexInputStateCreateInfo
{
    SType = StructureType.PipelineVertexInputStateCreateInfo,
    VertexBindingDescriptionCount = 1,
    PVertexBindingDescriptions = &binding,
    VertexAttributeDescriptionCount = 2,
    PVertexAttributeDescriptions = attributes,
};
```

The `Clock` buffer is the binding 0 of the descriptor set 0. The vertex entry point lists it too, so the layout makes it visible to both stages:

```csharp
var clock = new DescriptorSetLayoutBinding
{
    Binding = 0,
    DescriptorType = DescriptorType.UniformBuffer,
    DescriptorCount = 1,
    StageFlags = ShaderStageFlags.VertexBit | ShaderStageFlags.FragmentBit,
};
var layoutInfo = new DescriptorSetLayoutCreateInfo
{
    SType = StructureType.DescriptorSetLayoutCreateInfo,
    BindingCount = 1,
    PBindings = &clock,
};
vk.CreateDescriptorSetLayout(device, in layoutInfo, null, out DescriptorSetLayout setLayout);

var pipelineLayoutInfo = new PipelineLayoutCreateInfo
{
    SType = StructureType.PipelineLayoutCreateInfo,
    SetLayoutCount = 1,
    PSetLayouts = &setLayout,
};
vk.CreatePipelineLayout(device, in pipelineLayoutInfo, null, out PipelineLayout pipelineLayout);
```

With `stages`, `vertexInput` and `pipelineLayout` you fill the rest of `GraphicsPipelineCreateInfo` as in any Vulkan program. The uniform buffer is an ordinary buffer with the `UniformBufferBit` usage. It needs 16 bytes: the block uses the `std140` layout, and `Seconds` is the first four of them. Write the time into it before each frame.

## Embed it with `add`

If you do not want to ship the `.spv` file, `add` writes the shader into the project as a C# method:

```bash
yotsuba add MyShaders/MyShaders.csproj --target spirv
```

```text
Archivo generado: /home/you/Tutorial/MyShaders/YotsubaShader.g.cs
```

In the project that draws, which references `MyShaders`, the bytes come from the shader itself:

```csharp
using MyShaders;
using YotsubaShader;

byte[] spirv = new Plasma().ToSpirV();
ShaderModule module = CreateModule(vk, device, spirv);
```

`CreateModule` is the one above, and the rest of the program does not change. The SPIR-V travels inside the C# file as Base64, so there is nothing to copy next to the executable.

## Which command to use

Use `compile` when your engine loads assets from disk, or when you want to inspect the file with the SDK tools. Use `add` when the renderer is written in C# and you want the C# compiler to check the shader name. The options of both are in [The compile command](../reference/compile.md) and [The add command](../reference/add.md).

The same shader goes to the other graphics APIs by changing only the target: [OpenGL](opengl.md), [Direct3D](direct3d.md), [Metal](metal.md) and [WebGL](webgl.md).

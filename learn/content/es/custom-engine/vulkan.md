---
title: Compilar para Vulkan
summary: Convierte un shader de C# ya escrito en un archivo SPIR-V y cárgalo en un programa Vulkan.
order: 6
---

Este capítulo parte de un shader que ya está escrito. Lo copias, lo compilas a SPIR-V con la CLI y cargas el resultado en Vulkan. Aquí no se aprende a escribir shaders; eso lo enseña [Get Started](../get-started/index.md).

## El shader

Instala la CLI una sola vez y crea un proyecto para el shader:

```bash
dotnet tool install --global YotsubaShader.Compiler.CLI
dotnet new classlib -n MisShaders -f net8.0
dotnet add MisShaders package YotsubaShader.GlslSyntax
```

Borra el `Class1.cs` que crea la plantilla y guarda esto como `MisShaders/Plasma.cs`:

```csharp
using YotsubaShader.GlslSyntax;
using YotsubaShader.GlslSyntax.Resources;
using YotsubaShader.GlslSyntax.Types;
using YotsubaShader.Language;
using static YotsubaShader.GlslSyntax.Methods.Math;

namespace MisShaders;

public struct Vertice
{
    [location(0)] public vec2 Posicion;
    [location(1)] public vec2 Uv;
}

public struct Pixel
{
    [gl_Position] public vec4 Posicion;
    [location(0)] public vec2 Uv;
}

public struct PixelIn
{
    [location(0)] public vec2 Uv;
}

public struct Reloj
{
    public float Segundos;
}

public class Plasma
{
    [uniform, layout(0, 0)]
    public Reloj Tiempo;

    [ShaderStage(Stage.Vertex)]
    public Pixel Vertex(Vertice vertice)
    {
        Pixel pixel;
        pixel.Posicion = new vec4(vertice.Posicion.X, vertice.Posicion.Y, 0f, 1f);
        pixel.Uv = vertice.Uv;
        return pixel;
    }

    [ShaderStage(Stage.Fragment)]
    [return: location(0)]
    public vec4 Fragment(PixelIn pixel)
    {
        float x = pixel.Uv.X * 2f - 1f;
        float y = pixel.Uv.Y * 2f - 1f;
        float t = Tiempo.Segundos;

        float olas = sin(x * 6f + t)
                   + sin(y * 6f + t * 1.3f)
                   + sin((x + y) * 6f + t * 0.7f)
                   + sin(sqrt(x * x + y * y) * 9f - t * 2f);

        float rojo = 0.5f + 0.5f * sin(olas * 1.5f);
        float verde = 0.5f + 0.5f * sin(olas * 1.5f + 2.1f);
        float azul = 0.5f + 0.5f * sin(olas * 1.5f + 4.2f);
        return new vec4(rojo, verde, azul, 1f);
    }
}
```

Cubre toda la pantalla con un plasma en movimiento. El método vertex recibe una posición y una coordenada de textura. El método fragment pinta a partir de `Tiempo.Segundos`, un valor que tu programa escribe en un buffer uniform en cada frame.

## Qué formato lee Vulkan

Vulkan no recibe código fuente. Recibe SPIR-V, un formato binario. El target es `spirv`:

```bash
yotsuba compile MisShaders/MisShaders.csproj --target spirv --output shaders
```

No imprime nada si todo sale bien y termina con código `0`. La carpeta de `--output` se cuenta desde la carpeta del `.csproj`, y las subcarpetas siguen el namespace:

```text
MisShaders/shaders/
└── MisShaders/
    └── Plasma.spv
```

A diferencia de los formatos de texto, SPIR-V es un solo archivo por clase, con todos los stages dentro. Si tienes el Vulkan SDK, `spirv-dis` muestra lo que hay en él. Estos son los puntos de entrada y dónde queda el buffer uniform:

```bash
spirv-dis MisShaders/shaders/MisShaders/Plasma.spv | grep -E "OpEntryPoint|DescriptorSet|Binding"
```

```text
OpEntryPoint Vertex %Vertex "Vertex" %vertice_Posicion %vertice_Uv %__return_Posicion %__return_Uv %Tiempo
OpEntryPoint Fragment %Fragment "Fragment" %pixel_Uv %__return %Tiempo
OpDecorate %Tiempo DescriptorSet 0
OpDecorate %Tiempo Binding 0
```

Los nombres entre comillas son los de tus métodos de C#, y son lo que recibe `PName` al crear el pipeline. Los números que escribiste son los que ve Vulkan. Los dos atributos de vértice:

```csharp
public struct Vertice
{
    [location(0)] public vec2 Posicion;
    [location(1)] public vec2 Uv;
}
```

Son el `location` 0 y 1 de la descripción de entrada de vértices. Y el buffer uniform:

```csharp
[uniform, layout(0, 0)]
public Reloj Tiempo;
```

Es `DescriptorSet 0`, `Binding 0`.

El archivo es SPIR-V 1.6, que Vulkan acepta desde la versión 1.3. El validador lo dice si lo apuntas a una versión anterior:

```bash
spirv-val --target-env vulkan1.0 MisShaders/shaders/MisShaders/Plasma.spv
```

```text
error: line 0: Invalid SPIR-V binary version 1.6 for target environment SPIR-V 1.0 (under Vulkan 1.0 semantics).
```

```bash
spirv-val --target-env vulkan1.3 MisShaders/shaders/MisShaders/Plasma.spv
```

El segundo comando no imprime nada, y eso significa que el archivo es válido. En tu programa, pide Vulkan 1.3 al crear la instancia:

```csharp
var app = new ApplicationInfo
{
    SType = StructureType.ApplicationInfo,
    ApiVersion = Vk.Version13,
};
```

Si tu programa tiene que funcionar en Vulkan 1.1 o 1.2, pide la versión de SPIR-V que leen: `--target spirv:1.3` para Vulkan 1.1 y `--target spirv:1.5` para Vulkan 1.2. El validador la acepta para esa versión (`spirv-val --target-env vulkan1.1`), y pides esa versión de Vulkan al crear la instancia.

## Cárgalo en Vulkan

Los ejemplos usan Silk.NET.Vulkan, y cada llamada tiene el nombre de la función nativa. Los punteros necesitan `<AllowUnsafeBlocks>true</AllowUnsafeBlocks>` en el `.csproj` del proyecto que dibuja. La instancia, el device y el render pass son los que ya tienes. Lee el archivo y crea el shader module:

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

byte[] spirv = File.ReadAllBytes("shaders/MisShaders/Plasma.spv");
ShaderModule module = CreateModule(vk, device, spirv);
```

Un módulo sirve para los dos stages. Cada stage del pipeline apunta al mismo módulo y nombra su propio punto de entrada:

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

La descripción de entrada de vértices repite los números `location` de la struct de C#. El buffer tiene cuatro floats por vértice, dos para cada atributo:

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

El buffer `Reloj` es el binding 0 del descriptor set 0. El punto de entrada vertex también lo lista, así que el layout lo hace visible a los dos stages:

```csharp
var reloj = new DescriptorSetLayoutBinding
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
    PBindings = &reloj,
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

Con `stages`, `vertexInput` y `pipelineLayout` completas el resto de `GraphicsPipelineCreateInfo` como en cualquier programa Vulkan. El buffer uniform es un buffer normal con el uso `UniformBufferBit`. Necesita 16 bytes: el bloque usa el layout `std140`, y `Segundos` ocupa los primeros cuatro. Escribe el tiempo en él antes de cada frame.

## Inclúyelo con `add`

Si no quieres distribuir el archivo `.spv`, `add` escribe el shader dentro del proyecto como un método de C#:

```bash
yotsuba add MisShaders/MisShaders.csproj --target spirv
```

```text
Archivo generado: /home/tu/Tutorial/MisShaders/YotsubaShader.g.cs
```

En el proyecto que dibuja, que referencia a `MisShaders`, los bytes salen del propio shader:

```csharp
using MisShaders;
using YotsubaShader;

byte[] spirv = new Plasma().ToSpirV();
ShaderModule module = CreateModule(vk, device, spirv);
```

`CreateModule` es el de arriba, y el resto del programa no cambia. El SPIR-V viaja dentro del archivo de C# como Base64, así que no hay nada que copiar junto al ejecutable.

## Qué comando usar

Usa `compile` cuando tu motor carga los assets desde disco, o cuando quieres inspeccionar el archivo con las herramientas del SDK. Usa `add` cuando el renderer está escrito en C# y quieres que el compilador de C# compruebe el nombre del shader. Las opciones de los dos están en [El comando compile](../reference/compile.md) y [El comando add](../reference/add.md).

El mismo shader va a las otras APIs gráficas cambiando solo el target: [OpenGL](opengl.md), [Direct3D](direct3d.md), [Metal](metal.md), [WebGL](webgl.md) y [WebGPU](webgpu.md).

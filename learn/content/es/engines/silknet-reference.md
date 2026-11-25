---
title: Referencia de Silk.NET
summary: Silk.NET: paquetes, formato de salida y un visor completo para OpenGL, OpenGL ES, Vulkan y WebGPU.
order: 13
---

Silk.NET es un conjunto de bindings de .NET para OpenGL, OpenGL ES, Vulkan, WebGPU y más. Yotsuba Shader no necesita plugin para usarlo: la CLI escribe el shader en el formato de tu API y tu programa lo lee. Esta página tiene el visor completo de las **cuatro APIs**, con el mismo peso, para que compares cómo cada una recibe el mismo shader. Para el recorrido paso a paso, usa la ruta de Silk.NET de [Get Started](../get-started/index.md).

## De un vistazo

| | OpenGL | OpenGL ES | Vulkan | WebGPU |
| --- | --- | --- | --- | --- |
| Destino | `glsl:330` | `gles:300` | `spirv` | `wgsl` |
| Salida | `.Vertex.glsl` y `.Fragment.glsl` | `.Vertex.gles` y `.Fragment.gles` | `.spv` | `.wgsl` |
| Paquete | `Silk.NET.OpenGL` | `Silk.NET.OpenGLES` | `Silk.NET.Vulkan` | `Silk.NET.WebGPU` |
| Direcciones | `layout(0, 0)` y `layout(0, 1)` | `layout(0, 0)` y `layout(0, 1)` | set 0, binding 0 y 1 | grupo 0, binding 0, 1 y 2 |

## Compilar los shaders

Con el compilador instalado (`dotnet tool install --global YotsubaShader.Compiler.CLI`), desde la carpeta que contiene tu proyecto de shaders, cada API pide su destino:

```bash tab="OpenGL"
yotsuba compile MisShaders/MisShaders.csproj --target glsl:330 --output out
```
```bash tab="OpenGL ES"
yotsuba compile MisShaders/MisShaders.csproj --target gles:300 --output out
```
```bash tab="Vulkan"
yotsuba compile MisShaders/MisShaders.csproj --target spirv --output out
```
```bash tab="WebGPU"
yotsuba compile MisShaders/MisShaders.csproj --target wgsl --output out
```

Para ejecutar el comando en cada compilación, mira [El comando compile](../reference/compile.md).

## El proyecto del juego

Un proyecto de consola con los paquetes de tu API. Agrega también `<AllowUnsafeBlocks>true</AllowUnsafeBlocks>` a `Visor.csproj`:

```bash
dotnet new console -n Visor -f net8.0
```

```bash tab="OpenGL"
dotnet add Visor package Silk.NET.OpenGL --version 2.23.0
dotnet add Visor package Silk.NET.Windowing --version 2.23.0
dotnet add Visor package Silk.NET.Input --version 2.23.0
dotnet add Visor package StbImageSharp --version 2.23.0
```
```bash tab="OpenGL ES"
dotnet add Visor package Silk.NET.OpenGLES --version 2.23.0
dotnet add Visor package Silk.NET.Windowing --version 2.23.0
dotnet add Visor package Silk.NET.Input --version 2.23.0
dotnet add Visor package StbImageSharp --version 2.23.0
```
```bash tab="Vulkan"
dotnet add Visor package Silk.NET.Vulkan --version 2.23.0
dotnet add Visor package Silk.NET.Vulkan.Extensions.KHR --version 2.23.0
dotnet add Visor package Silk.NET.Windowing --version 2.23.0
dotnet add Visor package Silk.NET.Windowing.Sdl --version 2.23.0
dotnet add Visor package Silk.NET.Input --version 2.23.0
dotnet add Visor package Silk.NET.Input.Sdl --version 2.23.0
dotnet add Visor package StbImageSharp --version 2.23.0
```
```bash tab="WebGPU"
dotnet add Visor package Silk.NET.WebGPU --version 2.23.0
dotnet add Visor package Silk.NET.WebGPU.Native.WGPU --version 2.23.0
dotnet add Visor package Silk.NET.Windowing --version 2.23.0
dotnet add Visor package Silk.NET.Input --version 2.23.0
dotnet add Visor package StbImageSharp --version 2.23.0
```

Vulkan usa SDL para la ventana (`Window.PrioritizeSdl()`), porque la ventana de GLFW que trae Silk.NET no ofrece Vulkan en macOS.

## Datos de vértice: la ranura 0 es la posición, la 1 el Uv

El shader del tutorial recibe un vértice con `[location(0)] vec2 Position` y `[location(1)] vec2 Uv`. En las cuatro APIs el rectángulo son cuatro esquinas de cuatro `float` (16 bytes) y cada API describe esas dos ranuras a su manera: `VertexAttribPointer(0, 2, ..., 16, 0)` y `(1, 2, ..., 16, 8)` en OpenGL y OpenGL ES, un `VertexInputAttributeDescription` por ranura en Vulkan y un `VertexAttribute` por ranura en WebGPU.

## Uniforms

Los uniforms de tu shader son un bloque en la dirección `layout(0, 0)`. El visor crea un buffer de 16 bytes (ancho, alto, segundos y un relleno) y lo escribe en cada cuadro. Los shaders que declaran solo el reloj (`Plasma` y `BajoElAgua`) leen los segundos al comienzo del buffer. En OpenGL el bloque se asocia a la dirección 0 con `UniformBlockBinding`, porque GLSL 3.30 no puede escribirla en el texto; en Vulkan y WebGPU la dirección ya viaja en el shader.

## OpenGL

Pide un contexto 4.1 de perfil core (el máximo de macOS) y carga `glsl:330`. `Compile` es un ayudante pequeño que compila una etapa y lanza el registro de errores si falla.

```csharp title="Visor/Program.cs"
using Silk.NET.Input;
using Silk.NET.Maths;
using Silk.NET.OpenGL;
using Silk.NET.Windowing;
using StbImageSharp;

string name = args.Length > 0 ? args[0] : "Degradado";
// Los shaders que declaran solo el reloj (un Reloj con Segundos) leen primero los segundos; los demás leen ancho, alto y segundos.
bool clockOnly = name is "Plasma" or "BajoElAgua";

var options = WindowOptions.Default with
{
    Size = new Vector2D<int>(800, 450),
    Title = name,
    API = new GraphicsAPI(ContextAPI.OpenGL, ContextProfile.Core, ContextFlags.ForwardCompatible, new APIVersion(4, 1)),
};

using IWindow window = Window.Create(options);
GL gl = null!;
uint program = 0, vao = 0, data = 0, photo = 0;

window.Load += () =>
{
    gl = window.CreateOpenGL();

    IInputContext input = window.CreateInput();
    foreach (IKeyboard keyboard in input.Keyboards)
    {
        keyboard.KeyDown += (_, key, _) =>
        {
            if (key == Key.Escape) window.Close();
        };
    }

    // Las dos etapas del shader, tal como las escribió el compilador.
    string folder = "MisShaders/out/MisShaders";
    uint vertex = Compile(gl, ShaderType.VertexShader, File.ReadAllText($"{folder}/{name}.Vertex.glsl"));
    uint fragment = Compile(gl, ShaderType.FragmentShader, File.ReadAllText($"{folder}/{name}.Fragment.glsl"));
    program = gl.CreateProgram();
    gl.AttachShader(program, vertex);
    gl.AttachShader(program, fragment);
    gl.LinkProgram(program);
    gl.GetProgram(program, ProgramPropertyARB.LinkStatus, out int linked);
    if (linked == 0) throw new Exception(gl.GetProgramInfoLog(program));
    gl.DeleteShader(vertex);
    gl.DeleteShader(fragment);

    // El rectángulo: cuatro esquinas, cada una con su posición (ranura 0) y su Uv (ranura 1).
    float[] screen =
    {
        -1f,  1f, 0f, 0f,
         1f,  1f, 1f, 0f,
        -1f, -1f, 0f, 1f,
         1f, -1f, 1f, 1f,
    };
    vao = gl.GenVertexArray();
    gl.BindVertexArray(vao);
    uint vbo = gl.GenBuffer();
    gl.BindBuffer(BufferTargetARB.ArrayBuffer, vbo);
    gl.BufferData<float>(BufferTargetARB.ArrayBuffer, screen, BufferUsageARB.StaticDraw);
    unsafe
    {
        gl.EnableVertexAttribArray(0);
        gl.VertexAttribPointer(0, 2, VertexAttribPointerType.Float, false, 16, (void*)0);
        gl.EnableVertexAttribArray(1);
        gl.VertexAttribPointer(1, 2, VertexAttribPointerType.Float, false, 16, (void*)8);
    }

    // El bloque de uniforms (ancho, alto, segundos) va en la dirección 0.
    data = gl.GenBuffer();
    gl.BindBuffer(BufferTargetARB.UniformBuffer, data);
    unsafe { gl.BufferData(BufferTargetARB.UniformBuffer, 16, null, BufferUsageARB.DynamicDraw); }
    gl.BindBufferBase(BufferTargetARB.UniformBuffer, 0, data);
    gl.GetProgram(program, ProgramPropertyARB.ActiveUniformBlocks, out int blocks);
    for (uint block = 0; block < blocks; block++)
    {
        gl.UniformBlockBinding(program, block, 0);
    }

    // La foto para los shaders que declaran una textura.
    if (File.Exists("pez.jpg"))
    {
        ImageResult image = ImageResult.FromStream(File.OpenRead("pez.jpg"), ColorComponents.RedGreenBlueAlpha);
        photo = gl.GenTexture();
        gl.BindTexture(TextureTarget.Texture2D, photo);
        gl.TexImage2D<byte>(TextureTarget.Texture2D, 0, InternalFormat.Rgba8, (uint)image.Width, (uint)image.Height, 0, PixelFormat.Rgba, PixelType.UnsignedByte, image.Data);
        gl.TexParameter(TextureTarget.Texture2D, TextureParameterName.TextureMinFilter, (int)GLEnum.Linear);
        gl.TexParameter(TextureTarget.Texture2D, TextureParameterName.TextureMagFilter, (int)GLEnum.Linear);
        gl.TexParameter(TextureTarget.Texture2D, TextureParameterName.TextureWrapS, (int)GLEnum.ClampToEdge);
        gl.TexParameter(TextureTarget.Texture2D, TextureParameterName.TextureWrapT, (int)GLEnum.ClampToEdge);
    }
};

window.Resize += size => gl.Viewport(size);

window.Render += _ =>
{
    gl.Clear(ClearBufferMask.ColorBufferBit);
    gl.UseProgram(program);

    // Si tu shader declara estos datos, el visor se los entrega.
    float seconds = (float)window.Time;
    float[] values = clockOnly ? [seconds, 0f, 0f, 0f] : [window.FramebufferSize.X, window.FramebufferSize.Y, seconds, 0f];
    gl.BindBuffer(BufferTargetARB.UniformBuffer, data);
    gl.BufferSubData<float>(BufferTargetARB.UniformBuffer, 0, values);

    if (photo != 0)
    {
        gl.ActiveTexture(TextureUnit.Texture0);
        gl.BindTexture(TextureTarget.Texture2D, photo);
    }

    gl.BindVertexArray(vao);
    gl.DrawArrays(PrimitiveType.TriangleStrip, 0, 4);
};

window.Run();

static uint Compile(GL gl, ShaderType type, string source)
{
    uint shader = gl.CreateShader(type);
    gl.ShaderSource(shader, source);
    gl.CompileShader(shader);
    gl.GetShader(shader, ShaderParameterName.CompileStatus, out int ok);
    if (ok == 0) throw new Exception(gl.GetShaderInfoLog(shader));
    return shader;
}
```

## OpenGL ES

Es el mismo visor con `Silk.NET.OpenGLES` y `CreateOpenGLES()`: pide un contexto ES 3.0 y carga `gles:300`. Necesita un driver con OpenGL ES 3.0; donde no hay ninguno, pon `libEGL` y `libGLESv2` de ANGLE junto al programa.

```csharp title="Visor/Program.cs"
using Silk.NET.Input;
using Silk.NET.Maths;
using Silk.NET.OpenGLES;
using Silk.NET.Windowing;
using StbImageSharp;

string name = args.Length > 0 ? args[0] : "Degradado";
// Los shaders que declaran solo el reloj (un Reloj con Segundos) leen primero los segundos; los demás leen ancho, alto y segundos.
bool clockOnly = name is "Plasma" or "BajoElAgua";

var options = WindowOptions.Default with
{
    Size = new Vector2D<int>(800, 450),
    Title = name,
    API = new GraphicsAPI(ContextAPI.OpenGLES, new APIVersion(3, 0)),
};

using IWindow window = Window.Create(options);
GL gl = null!;
uint program = 0, vao = 0, data = 0, photo = 0;

window.Load += () =>
{
    gl = window.CreateOpenGLES();

    IInputContext input = window.CreateInput();
    foreach (IKeyboard keyboard in input.Keyboards)
    {
        keyboard.KeyDown += (_, key, _) =>
        {
            if (key == Key.Escape) window.Close();
        };
    }

    // Las dos etapas del shader, tal como las escribió el compilador.
    string folder = "MisShaders/out/MisShaders";
    uint vertex = Compile(gl, ShaderType.VertexShader, File.ReadAllText($"{folder}/{name}.Vertex.gles"));
    uint fragment = Compile(gl, ShaderType.FragmentShader, File.ReadAllText($"{folder}/{name}.Fragment.gles"));
    program = gl.CreateProgram();
    gl.AttachShader(program, vertex);
    gl.AttachShader(program, fragment);
    gl.LinkProgram(program);
    gl.GetProgram(program, ProgramPropertyARB.LinkStatus, out int linked);
    if (linked == 0) throw new Exception(gl.GetProgramInfoLog(program));
    gl.DeleteShader(vertex);
    gl.DeleteShader(fragment);

    // El rectángulo: cuatro esquinas, cada una con su posición (ranura 0) y su Uv (ranura 1).
    float[] screen =
    {
        -1f,  1f, 0f, 0f,
         1f,  1f, 1f, 0f,
        -1f, -1f, 0f, 1f,
         1f, -1f, 1f, 1f,
    };
    vao = gl.GenVertexArray();
    gl.BindVertexArray(vao);
    uint vbo = gl.GenBuffer();
    gl.BindBuffer(BufferTargetARB.ArrayBuffer, vbo);
    gl.BufferData<float>(BufferTargetARB.ArrayBuffer, screen, BufferUsageARB.StaticDraw);
    unsafe
    {
        gl.EnableVertexAttribArray(0);
        gl.VertexAttribPointer(0, 2, VertexAttribPointerType.Float, false, 16, (void*)0);
        gl.EnableVertexAttribArray(1);
        gl.VertexAttribPointer(1, 2, VertexAttribPointerType.Float, false, 16, (void*)8);
    }

    // El bloque de uniforms (ancho, alto, segundos) va en la dirección 0.
    data = gl.GenBuffer();
    gl.BindBuffer(BufferTargetARB.UniformBuffer, data);
    unsafe { gl.BufferData(BufferTargetARB.UniformBuffer, 16, null, BufferUsageARB.DynamicDraw); }
    gl.BindBufferBase(BufferTargetARB.UniformBuffer, 0, data);
    gl.GetProgram(program, ProgramPropertyARB.ActiveUniformBlocks, out int blocks);
    for (uint block = 0; block < blocks; block++)
    {
        gl.UniformBlockBinding(program, block, 0);
    }

    // La foto para los shaders que declaran una textura.
    if (File.Exists("pez.jpg"))
    {
        ImageResult image = ImageResult.FromStream(File.OpenRead("pez.jpg"), ColorComponents.RedGreenBlueAlpha);
        photo = gl.GenTexture();
        gl.BindTexture(TextureTarget.Texture2D, photo);
        gl.TexImage2D<byte>(TextureTarget.Texture2D, 0, InternalFormat.Rgba8, (uint)image.Width, (uint)image.Height, 0, PixelFormat.Rgba, PixelType.UnsignedByte, image.Data);
        gl.TexParameter(TextureTarget.Texture2D, TextureParameterName.TextureMinFilter, (int)GLEnum.Linear);
        gl.TexParameter(TextureTarget.Texture2D, TextureParameterName.TextureMagFilter, (int)GLEnum.Linear);
        gl.TexParameter(TextureTarget.Texture2D, TextureParameterName.TextureWrapS, (int)GLEnum.ClampToEdge);
        gl.TexParameter(TextureTarget.Texture2D, TextureParameterName.TextureWrapT, (int)GLEnum.ClampToEdge);
    }
};

window.Resize += size => gl.Viewport(size);

window.Render += _ =>
{
    gl.Clear(ClearBufferMask.ColorBufferBit);
    gl.UseProgram(program);

    // Si tu shader declara estos datos, el visor se los entrega.
    float seconds = (float)window.Time;
    float[] values = clockOnly ? [seconds, 0f, 0f, 0f] : [window.FramebufferSize.X, window.FramebufferSize.Y, seconds, 0f];
    gl.BindBuffer(BufferTargetARB.UniformBuffer, data);
    gl.BufferSubData<float>(BufferTargetARB.UniformBuffer, 0, values);

    if (photo != 0)
    {
        gl.ActiveTexture(TextureUnit.Texture0);
        gl.BindTexture(TextureTarget.Texture2D, photo);
    }

    gl.BindVertexArray(vao);
    gl.DrawArrays(PrimitiveType.TriangleStrip, 0, 4);
};

window.Run();

static uint Compile(GL gl, ShaderType type, string source)
{
    uint shader = gl.CreateShader(type);
    gl.ShaderSource(shader, source);
    gl.CompileShader(shader);
    gl.GetShader(shader, ShaderParameterName.CompileStatus, out int ok);
    if (ok == 0) throw new Exception(gl.GetShaderInfoLog(shader));
    return shader;
}
```

## Vulkan: el renderizador

Vulkan no dibuja en una sola llamada: tú creas la instancia, el dispositivo, la swapchain, los recursos, el pipeline y la sincronización. `Program.cs` solo abre la ventana y llama a `Renderer`; el renderizador está repartido en archivos `partial` de una sola clase, uno por responsabilidad. Cópialos todos en `Visor/`. El visor usa Vulkan 1.3 con dibujo dinámico (sin render passes ni framebuffers); en macOS necesita el [Vulkan SDK](https://vulkan.lunarg.com/sdk/home) para MoltenVK. El viewport tiene altura negativa para que `+Y` apunte hacia arriba como en las otras APIs.

```csharp title="Visor/Program.cs"
using Silk.NET.Input;
using Silk.NET.Maths;
using Silk.NET.Windowing;

string name = args.Length > 0 ? args[0] : "Degradado";

var options = WindowOptions.DefaultVulkan with
{
    Size = new Vector2D<int>(800, 450),
    Title = name,
};

// SDL abre ventanas Vulkan en todos los sistemas.
Window.PrioritizeSdl();
using IWindow window = Window.Create(options);
Renderer? renderer = null;

window.Load += () =>
{
    IInputContext input = window.CreateInput();
    foreach (IKeyboard keyboard in input.Keyboards)
    {
        keyboard.KeyDown += (_, key, _) =>
        {
            if (key == Key.Escape) window.Close();
        };
    }

    renderer = new Renderer(window, name);
};

window.FramebufferResize += _ =>
{
    if (renderer != null) renderer.Resized = true;
};
window.Render += _ => renderer!.Draw();
window.Closing += () => renderer?.Dispose();

window.Run();
```

```csharp title="Visor/Renderer.cs"
using System.Runtime.InteropServices;
using Silk.NET.Core;
using Silk.NET.Core.Native;
using Silk.NET.Vulkan;
using Silk.NET.Vulkan.Extensions.KHR;
using Silk.NET.Windowing;
using StbImageSharp;
using Buffer = Silk.NET.Vulkan.Buffer;
using Image = Silk.NET.Vulkan.Image;
using Semaphore = Silk.NET.Vulkan.Semaphore;

public unsafe partial class Renderer : IDisposable
{
    private readonly IWindow _window;
    private readonly Vk _vk = Vk.GetApi();

    private Instance _instance;
    private KhrSurface _khrSurface = null!;
    private SurfaceKHR _surface;
    private PhysicalDevice _physical;
    private Device _device;
    private Queue _queue;
    private uint _family;
    private KhrSwapchain _khrSwapchain = null!;
    private SwapchainKHR _swapchain;
    private Format _format = Format.B8G8R8A8Unorm;
    private Extent2D _extent;
    private Image[] _images = [];
    private ImageView[] _views = [];
    private Semaphore[] _renderFinished = [];

    private DescriptorSetLayout _setLayout;
    private PipelineLayout _pipelineLayout;
    private Pipeline _pipeline;
    private DescriptorPool _pool;
    private DescriptorSet _set;

    private Buffer _vertexBuffer;
    private Buffer _dataBuffer;
    private float* _dataPointer;
    private Image _photo;
    private ImageView _photoView;
    private Sampler _sampler;

    private CommandPool _commandPool;
    private CommandBuffer _commands;
    private Semaphore _imageAvailable;
    private Fence _inFlight;

    public bool Resized;
    private readonly bool _clockOnly;

    public Renderer(IWindow window, string name)
    {
        _window = window;
        // Los shaders que declaran solo el reloj (un Reloj con Segundos) leen primero los segundos; los demás leen ancho, alto y segundos.
        _clockOnly = name is "Plasma" or "BajoElAgua";
        CreateInstance();
        _surface = _window.VkSurface!.Create<AllocationCallbacks>(_instance.ToHandle(), null).ToSurface();
        PickDevice();
        CreateSwapchain();
        CreateResources(name);
        CreateSync();
    }
}
```

```csharp title="Visor/Renderer.Device.cs"
using System.Runtime.InteropServices;
using Silk.NET.Core;
using Silk.NET.Core.Native;
using Silk.NET.Vulkan;
using Silk.NET.Vulkan.Extensions.KHR;
using Silk.NET.Windowing;
using StbImageSharp;
using Buffer = Silk.NET.Vulkan.Buffer;
using Image = Silk.NET.Vulkan.Image;
using Semaphore = Silk.NET.Vulkan.Semaphore;

public unsafe partial class Renderer
{
    private void CreateInstance()
    {
        var app = new ApplicationInfo { SType = StructureType.ApplicationInfo, ApiVersion = Vk.Version13 };

        var extensions = new List<string>(SilkMarshal.PtrToStringArray((nint)_window.VkSurface!.GetRequiredExtensions(out uint count), (int)count));
        var flags = InstanceCreateFlags.None;
        if (_vk.IsInstanceExtensionPresent("VK_KHR_portability_enumeration"))
        {
            // MoltenVK va encima de Metal y es un driver de "portabilidad": el cargador lo oculta si no lo pides.
            extensions.Add("VK_KHR_portability_enumeration");
            extensions.Add("VK_KHR_get_physical_device_properties2");
            flags |= InstanceCreateFlags.EnumeratePortabilityBitKhr;
        }

        nint names = SilkMarshal.StringArrayToPtr(extensions);
        var info = new InstanceCreateInfo
        {
            SType = StructureType.InstanceCreateInfo,
            Flags = flags,
            PApplicationInfo = &app,
            EnabledExtensionCount = (uint)extensions.Count,
            PpEnabledExtensionNames = (byte**)names,
        };
        Check(_vk.CreateInstance(in info, null, out _instance));
        SilkMarshal.Free(names);

        _vk.TryGetInstanceExtension(_instance, out _khrSurface);
    }

    private void PickDevice()
    {
        uint count = 0;
        _vk.EnumeratePhysicalDevices(_instance, ref count, null);
        var devices = new PhysicalDevice[count];
        fixed (PhysicalDevice* list = devices)
        {
            _vk.EnumeratePhysicalDevices(_instance, ref count, list);
        }
        _physical = devices[0];

        uint families = 0;
        _vk.GetPhysicalDeviceQueueFamilyProperties(_physical, ref families, null);
        var properties = new QueueFamilyProperties[families];
        fixed (QueueFamilyProperties* list = properties)
        {
            _vk.GetPhysicalDeviceQueueFamilyProperties(_physical, ref families, list);
        }
        for (uint i = 0; i < families; i++)
        {
            _khrSurface.GetPhysicalDeviceSurfaceSupport(_physical, i, _surface, out Bool32 present);
            if (properties[i].QueueFlags.HasFlag(QueueFlags.GraphicsBit) && present)
            {
                _family = i;
                break;
            }
        }

        float priority = 1f;
        var queueInfo = new DeviceQueueCreateInfo
        {
            SType = StructureType.DeviceQueueCreateInfo,
            QueueFamilyIndex = _family,
            QueueCount = 1,
            PQueuePriorities = &priority,
        };

        // Vulkan 1.3 puede dibujar sin render passes ni framebuffers si activas esta función.
        var features13 = new PhysicalDeviceVulkan13Features
        {
            SType = StructureType.PhysicalDeviceVulkan13Features,
            DynamicRendering = true,
        };

        var extensions = new List<string> { "VK_KHR_swapchain" };
        if (_vk.IsDeviceExtensionPresent(_physical, "VK_KHR_portability_subset"))
        {
            extensions.Add("VK_KHR_portability_subset");
        }

        nint names = SilkMarshal.StringArrayToPtr(extensions);
        var info = new DeviceCreateInfo
        {
            SType = StructureType.DeviceCreateInfo,
            PNext = &features13,
            QueueCreateInfoCount = 1,
            PQueueCreateInfos = &queueInfo,
            EnabledExtensionCount = (uint)extensions.Count,
            PpEnabledExtensionNames = (byte**)names,
        };
        Check(_vk.CreateDevice(_physical, in info, null, out _device));
        SilkMarshal.Free(names);

        _vk.GetDeviceQueue(_device, _family, 0, out _queue);
        _vk.TryGetDeviceExtension(_instance, _device, out _khrSwapchain);
    }
}
```

```csharp title="Visor/Renderer.Swapchain.cs"
using System.Runtime.InteropServices;
using Silk.NET.Core;
using Silk.NET.Core.Native;
using Silk.NET.Vulkan;
using Silk.NET.Vulkan.Extensions.KHR;
using Silk.NET.Windowing;
using StbImageSharp;
using Buffer = Silk.NET.Vulkan.Buffer;
using Image = Silk.NET.Vulkan.Image;
using Semaphore = Silk.NET.Vulkan.Semaphore;

public unsafe partial class Renderer
{
    private void CreateSwapchain()
    {
        _khrSurface.GetPhysicalDeviceSurfaceCapabilities(_physical, _surface, out SurfaceCapabilitiesKHR caps);
        _extent = caps.CurrentExtent.Width != uint.MaxValue
            ? caps.CurrentExtent
            : new Extent2D((uint)_window.FramebufferSize.X, (uint)_window.FramebufferSize.Y);

        uint imageCount = Math.Min(caps.MinImageCount + 1, caps.MaxImageCount == 0 ? uint.MaxValue : caps.MaxImageCount);
        var info = new SwapchainCreateInfoKHR
        {
            SType = StructureType.SwapchainCreateInfoKhr,
            Surface = _surface,
            MinImageCount = imageCount,
            ImageFormat = _format,
            ImageColorSpace = ColorSpaceKHR.SpaceSrgbNonlinearKhr,
            ImageExtent = _extent,
            ImageArrayLayers = 1,
            ImageUsage = ImageUsageFlags.ColorAttachmentBit,
            ImageSharingMode = SharingMode.Exclusive,
            PreTransform = caps.CurrentTransform,
            CompositeAlpha = CompositeAlphaFlagsKHR.OpaqueBitKhr,
            PresentMode = PresentModeKHR.FifoKhr,
            Clipped = true,
        };
        Check(_khrSwapchain.CreateSwapchain(_device, in info, null, out _swapchain));

        uint count = 0;
        _khrSwapchain.GetSwapchainImages(_device, _swapchain, ref count, null);
        _images = new Image[count];
        fixed (Image* list = _images)
        {
            _khrSwapchain.GetSwapchainImages(_device, _swapchain, ref count, list);
        }

        _views = new ImageView[count];
        _renderFinished = new Semaphore[count];
        for (int i = 0; i < count; i++)
        {
            var viewInfo = new ImageViewCreateInfo
            {
                SType = StructureType.ImageViewCreateInfo,
                Image = _images[i],
                ViewType = ImageViewType.Type2D,
                Format = _format,
                SubresourceRange = new ImageSubresourceRange(ImageAspectFlags.ColorBit, 0, 1, 0, 1),
            };
            Check(_vk.CreateImageView(_device, in viewInfo, null, out _views[i]));

            var semaphoreInfo = new SemaphoreCreateInfo { SType = StructureType.SemaphoreCreateInfo };
            Check(_vk.CreateSemaphore(_device, in semaphoreInfo, null, out _renderFinished[i]));
        }
    }

    private void DestroySwapchain()
    {
        foreach (ImageView view in _views) _vk.DestroyImageView(_device, view, null);
        foreach (Semaphore semaphore in _renderFinished) _vk.DestroySemaphore(_device, semaphore, null);
        _khrSwapchain.DestroySwapchain(_device, _swapchain, null);
    }

    private void RecreateSwapchain()
    {
        while (_window.FramebufferSize.X == 0 || _window.FramebufferSize.Y == 0)
        {
            _window.DoEvents();
        }
        _vk.DeviceWaitIdle(_device);
        DestroySwapchain();
        CreateSwapchain();
        Resized = false;
    }
}
```

```csharp title="Visor/Renderer.Resources.cs"
using System.Runtime.InteropServices;
using Silk.NET.Core;
using Silk.NET.Core.Native;
using Silk.NET.Vulkan;
using Silk.NET.Vulkan.Extensions.KHR;
using Silk.NET.Windowing;
using StbImageSharp;
using Buffer = Silk.NET.Vulkan.Buffer;
using Image = Silk.NET.Vulkan.Image;
using Semaphore = Silk.NET.Vulkan.Semaphore;

public unsafe partial class Renderer
{
    private void CreateResources(string name)
    {
        // El buffer de vértices: cuatro esquinas, cada una con su posición y su Uv (16 bytes).
        float[] screen =
        [
            -1f,  1f, 0f, 0f,
             1f,  1f, 1f, 0f,
            -1f, -1f, 0f, 1f,
             1f, -1f, 1f, 1f,
        ];
        _vertexBuffer = CreateBuffer((ulong)(screen.Length * sizeof(float)), BufferUsageFlags.VertexBufferBit, out DeviceMemory vertexMemory);
        void* mapped;
        _vk.MapMemory(_device, vertexMemory, 0, Vk.WholeSize, 0, &mapped);
        screen.AsSpan().CopyTo(new Span<float>(mapped, screen.Length));
        _vk.UnmapMemory(_device, vertexMemory);

        // El bloque de uniforms (ancho, alto, segundos): 16 bytes, que se escriben en cada cuadro.
        _dataBuffer = CreateBuffer(16, BufferUsageFlags.UniformBufferBit, out DeviceMemory dataMemory);
        _vk.MapMemory(_device, dataMemory, 0, Vk.WholeSize, 0, &mapped);
        _dataPointer = (float*)mapped;

        CreatePhoto();
        CreatePipeline(name);
    }

    private void CreatePhoto()
    {
        byte[] pixels = [255, 255, 255, 255];
        int width = 1, height = 1;
        if (File.Exists("pez.jpg"))
        {
            ImageResult image = ImageResult.FromStream(File.OpenRead("pez.jpg"), ColorComponents.RedGreenBlueAlpha);
            pixels = image.Data;
            width = image.Width;
            height = image.Height;
        }

        Buffer staging = CreateBuffer((ulong)pixels.Length, BufferUsageFlags.TransferSrcBit, out DeviceMemory stagingMemory);
        void* mapped;
        _vk.MapMemory(_device, stagingMemory, 0, Vk.WholeSize, 0, &mapped);
        pixels.AsSpan().CopyTo(new Span<byte>(mapped, pixels.Length));
        _vk.UnmapMemory(_device, stagingMemory);

        var imageInfo = new ImageCreateInfo
        {
            SType = StructureType.ImageCreateInfo,
            ImageType = ImageType.Type2D,
            Format = Format.R8G8B8A8Unorm,
            Extent = new Extent3D((uint)width, (uint)height, 1),
            MipLevels = 1,
            ArrayLayers = 1,
            Samples = SampleCountFlags.Count1Bit,
            Tiling = ImageTiling.Optimal,
            Usage = ImageUsageFlags.TransferDstBit | ImageUsageFlags.SampledBit,
            InitialLayout = ImageLayout.Undefined,
        };
        Check(_vk.CreateImage(_device, in imageInfo, null, out _photo));
        _vk.GetImageMemoryRequirements(_device, _photo, out MemoryRequirements requirements);
        var allocate = new MemoryAllocateInfo { SType = StructureType.MemoryAllocateInfo, AllocationSize = requirements.Size, MemoryTypeIndex = FindMemoryType(requirements.MemoryTypeBits, MemoryPropertyFlags.DeviceLocalBit) };
        Check(_vk.AllocateMemory(_device, in allocate, null, out DeviceMemory memory));
        _vk.BindImageMemory(_device, _photo, memory, 0);

        CommandPool pool = CreateCommandPool();
        CommandBuffer commands = BeginOneTime(pool);
        Transition(commands, _photo, ImageLayout.Undefined, ImageLayout.TransferDstOptimal, 0, AccessFlags.TransferWriteBit, PipelineStageFlags.TopOfPipeBit, PipelineStageFlags.TransferBit);
        var region = new BufferImageCopy { ImageSubresource = new ImageSubresourceLayers(ImageAspectFlags.ColorBit, 0, 0, 1), ImageExtent = new Extent3D((uint)width, (uint)height, 1) };
        _vk.CmdCopyBufferToImage(commands, staging, _photo, ImageLayout.TransferDstOptimal, 1, in region);
        Transition(commands, _photo, ImageLayout.TransferDstOptimal, ImageLayout.ShaderReadOnlyOptimal, AccessFlags.TransferWriteBit, AccessFlags.ShaderReadBit, PipelineStageFlags.TransferBit, PipelineStageFlags.FragmentShaderBit);
        EndOneTime(pool, commands);
        _vk.DestroyCommandPool(_device, pool, null);
        _vk.DestroyBuffer(_device, staging, null);
        _vk.FreeMemory(_device, stagingMemory, null);

        var viewInfo = new ImageViewCreateInfo { SType = StructureType.ImageViewCreateInfo, Image = _photo, ViewType = ImageViewType.Type2D, Format = Format.R8G8B8A8Unorm, SubresourceRange = new ImageSubresourceRange(ImageAspectFlags.ColorBit, 0, 1, 0, 1) };
        Check(_vk.CreateImageView(_device, in viewInfo, null, out _photoView));

        var samplerInfo = new SamplerCreateInfo
        {
            SType = StructureType.SamplerCreateInfo,
            MagFilter = Filter.Linear,
            MinFilter = Filter.Linear,
            AddressModeU = SamplerAddressMode.ClampToEdge,
            AddressModeV = SamplerAddressMode.ClampToEdge,
            AddressModeW = SamplerAddressMode.ClampToEdge,
        };
        Check(_vk.CreateSampler(_device, in samplerInfo, null, out _sampler));
    }

    private void CreateSync()
    {
        _commandPool = CreateCommandPool(reset: true);
        var allocate = new CommandBufferAllocateInfo { SType = StructureType.CommandBufferAllocateInfo, CommandPool = _commandPool, Level = CommandBufferLevel.Primary, CommandBufferCount = 1 };
        Check(_vk.AllocateCommandBuffers(_device, in allocate, out _commands));

        var semaphoreInfo = new SemaphoreCreateInfo { SType = StructureType.SemaphoreCreateInfo };
        Check(_vk.CreateSemaphore(_device, in semaphoreInfo, null, out _imageAvailable));
        var fenceInfo = new FenceCreateInfo { SType = StructureType.FenceCreateInfo, Flags = FenceCreateFlags.SignaledBit };
        Check(_vk.CreateFence(_device, in fenceInfo, null, out _inFlight));
    }
}
```

```csharp title="Visor/Renderer.Pipeline.cs"
using System.Runtime.InteropServices;
using Silk.NET.Core;
using Silk.NET.Core.Native;
using Silk.NET.Vulkan;
using Silk.NET.Vulkan.Extensions.KHR;
using Silk.NET.Windowing;
using StbImageSharp;
using Buffer = Silk.NET.Vulkan.Buffer;
using Image = Silk.NET.Vulkan.Image;
using Semaphore = Silk.NET.Vulkan.Semaphore;

public unsafe partial class Renderer
{
    private void CreatePipeline(string name)
    {
        // Set 0: el binding 0 es el bloque de uniforms y el binding 1 es la textura.
        var bindings = stackalloc DescriptorSetLayoutBinding[2];
        bindings[0] = new DescriptorSetLayoutBinding { Binding = 0, DescriptorType = DescriptorType.UniformBuffer, DescriptorCount = 1, StageFlags = ShaderStageFlags.VertexBit | ShaderStageFlags.FragmentBit };
        bindings[1] = new DescriptorSetLayoutBinding { Binding = 1, DescriptorType = DescriptorType.CombinedImageSampler, DescriptorCount = 1, StageFlags = ShaderStageFlags.FragmentBit };
        var layoutInfo = new DescriptorSetLayoutCreateInfo { SType = StructureType.DescriptorSetLayoutCreateInfo, BindingCount = 2, PBindings = bindings };
        Check(_vk.CreateDescriptorSetLayout(_device, in layoutInfo, null, out _setLayout));

        DescriptorSetLayout setLayout = _setLayout;
        var pipelineLayoutInfo = new PipelineLayoutCreateInfo { SType = StructureType.PipelineLayoutCreateInfo, SetLayoutCount = 1, PSetLayouts = &setLayout };
        Check(_vk.CreatePipelineLayout(_device, in pipelineLayoutInfo, null, out _pipelineLayout));

        var sizes = stackalloc DescriptorPoolSize[2];
        sizes[0] = new DescriptorPoolSize(DescriptorType.UniformBuffer, 1);
        sizes[1] = new DescriptorPoolSize(DescriptorType.CombinedImageSampler, 1);
        var poolInfo = new DescriptorPoolCreateInfo { SType = StructureType.DescriptorPoolCreateInfo, MaxSets = 1, PoolSizeCount = 2, PPoolSizes = sizes };
        Check(_vk.CreateDescriptorPool(_device, in poolInfo, null, out _pool));

        var allocate = new DescriptorSetAllocateInfo { SType = StructureType.DescriptorSetAllocateInfo, DescriptorPool = _pool, DescriptorSetCount = 1, PSetLayouts = &setLayout };
        Check(_vk.AllocateDescriptorSets(_device, in allocate, out _set));

        var dataInfo = new DescriptorBufferInfo { Buffer = _dataBuffer, Offset = 0, Range = 16 };
        var photoInfo = new DescriptorImageInfo { Sampler = _sampler, ImageView = _photoView, ImageLayout = ImageLayout.ShaderReadOnlyOptimal };
        var writes = stackalloc WriteDescriptorSet[2];
        writes[0] = new WriteDescriptorSet { SType = StructureType.WriteDescriptorSet, DstSet = _set, DstBinding = 0, DescriptorCount = 1, DescriptorType = DescriptorType.UniformBuffer, PBufferInfo = &dataInfo };
        writes[1] = new WriteDescriptorSet { SType = StructureType.WriteDescriptorSet, DstSet = _set, DstBinding = 1, DescriptorCount = 1, DescriptorType = DescriptorType.CombinedImageSampler, PImageInfo = &photoInfo };
        _vk.UpdateDescriptorSets(_device, 2, writes, 0, null);

        // Un módulo con las dos etapas y un nombre de punto de entrada para cada una.
        byte[] spirv = File.ReadAllBytes($"MisShaders/out/MisShaders/{name}.spv");
        ShaderModule module;
        fixed (byte* code = spirv)
        {
            var moduleInfo = new ShaderModuleCreateInfo { SType = StructureType.ShaderModuleCreateInfo, CodeSize = (nuint)spirv.Length, PCode = (uint*)code };
            Check(_vk.CreateShaderModule(_device, in moduleInfo, null, out module));
        }

        var stages = stackalloc PipelineShaderStageCreateInfo[2];
        stages[0] = new PipelineShaderStageCreateInfo { SType = StructureType.PipelineShaderStageCreateInfo, Stage = ShaderStageFlags.VertexBit, Module = module, PName = (byte*)SilkMarshal.StringToPtr("Vertex") };
        stages[1] = new PipelineShaderStageCreateInfo { SType = StructureType.PipelineShaderStageCreateInfo, Stage = ShaderStageFlags.FragmentBit, Module = module, PName = (byte*)SilkMarshal.StringToPtr("Fragment") };

        var binding = new VertexInputBindingDescription { Binding = 0, Stride = 16, InputRate = VertexInputRate.Vertex };
        var attributes = stackalloc VertexInputAttributeDescription[2];
        attributes[0] = new VertexInputAttributeDescription { Binding = 0, Location = 0, Format = Format.R32G32Sfloat, Offset = 0 };
        attributes[1] = new VertexInputAttributeDescription { Binding = 0, Location = 1, Format = Format.R32G32Sfloat, Offset = 8 };
        var vertexInput = new PipelineVertexInputStateCreateInfo { SType = StructureType.PipelineVertexInputStateCreateInfo, VertexBindingDescriptionCount = 1, PVertexBindingDescriptions = &binding, VertexAttributeDescriptionCount = 2, PVertexAttributeDescriptions = attributes };
        var assembly = new PipelineInputAssemblyStateCreateInfo { SType = StructureType.PipelineInputAssemblyStateCreateInfo, Topology = PrimitiveTopology.TriangleStrip };
        var viewport = new PipelineViewportStateCreateInfo { SType = StructureType.PipelineViewportStateCreateInfo, ViewportCount = 1, ScissorCount = 1 };
        var raster = new PipelineRasterizationStateCreateInfo { SType = StructureType.PipelineRasterizationStateCreateInfo, PolygonMode = PolygonMode.Fill, CullMode = CullModeFlags.None, FrontFace = FrontFace.CounterClockwise, LineWidth = 1f };
        var multisample = new PipelineMultisampleStateCreateInfo { SType = StructureType.PipelineMultisampleStateCreateInfo, RasterizationSamples = SampleCountFlags.Count1Bit };
        var attachment = new PipelineColorBlendAttachmentState { ColorWriteMask = ColorComponentFlags.RBit | ColorComponentFlags.GBit | ColorComponentFlags.BBit | ColorComponentFlags.ABit };
        var blend = new PipelineColorBlendStateCreateInfo { SType = StructureType.PipelineColorBlendStateCreateInfo, AttachmentCount = 1, PAttachments = &attachment };
        var dynamicStates = stackalloc DynamicState[2] { DynamicState.Viewport, DynamicState.Scissor };
        var dynamic = new PipelineDynamicStateCreateInfo { SType = StructureType.PipelineDynamicStateCreateInfo, DynamicStateCount = 2, PDynamicStates = dynamicStates };

        Format colorFormat = _format;
        var rendering = new PipelineRenderingCreateInfo { SType = StructureType.PipelineRenderingCreateInfo, ColorAttachmentCount = 1, PColorAttachmentFormats = &colorFormat };

        var pipelineInfo = new GraphicsPipelineCreateInfo
        {
            SType = StructureType.GraphicsPipelineCreateInfo,
            PNext = &rendering,
            StageCount = 2,
            PStages = stages,
            PVertexInputState = &vertexInput,
            PInputAssemblyState = &assembly,
            PViewportState = &viewport,
            PRasterizationState = &raster,
            PMultisampleState = &multisample,
            PColorBlendState = &blend,
            PDynamicState = &dynamic,
            Layout = _pipelineLayout,
        };
        Check(_vk.CreateGraphicsPipelines(_device, default, 1, in pipelineInfo, null, out _pipeline));

        _vk.DestroyShaderModule(_device, module, null);
        SilkMarshal.Free((nint)stages[0].PName);
        SilkMarshal.Free((nint)stages[1].PName);
    }
}
```

```csharp title="Visor/Renderer.Draw.cs"
using System.Runtime.InteropServices;
using Silk.NET.Core;
using Silk.NET.Core.Native;
using Silk.NET.Vulkan;
using Silk.NET.Vulkan.Extensions.KHR;
using Silk.NET.Windowing;
using StbImageSharp;
using Buffer = Silk.NET.Vulkan.Buffer;
using Image = Silk.NET.Vulkan.Image;
using Semaphore = Silk.NET.Vulkan.Semaphore;

public unsafe partial class Renderer
{
    public void Draw()
    {
        _vk.WaitForFences(_device, 1, in _inFlight, true, ulong.MaxValue);

        uint index = 0;
        Result result = _khrSwapchain.AcquireNextImage(_device, _swapchain, ulong.MaxValue, _imageAvailable, default, ref index);
        if (result == Result.ErrorOutOfDateKhr || Resized)
        {
            RecreateSwapchain();
            return;
        }
        _vk.ResetFences(_device, 1, in _inFlight);

        // Si tu shader declara estos datos, el visor se los entrega.
        if (_clockOnly)
        {
            _dataPointer[0] = (float)_window.Time;
        }
        else
        {
            _dataPointer[0] = _extent.Width;
            _dataPointer[1] = _extent.Height;
            _dataPointer[2] = (float)_window.Time;
        }

        _vk.ResetCommandBuffer(_commands, 0);
        var begin = new CommandBufferBeginInfo { SType = StructureType.CommandBufferBeginInfo };
        _vk.BeginCommandBuffer(_commands, in begin);

        Transition(_commands, _images[index], ImageLayout.Undefined, ImageLayout.ColorAttachmentOptimal, 0, AccessFlags.ColorAttachmentWriteBit, PipelineStageFlags.TopOfPipeBit, PipelineStageFlags.ColorAttachmentOutputBit);

        var color = new RenderingAttachmentInfo
        {
            SType = StructureType.RenderingAttachmentInfo,
            ImageView = _views[index],
            ImageLayout = ImageLayout.ColorAttachmentOptimal,
            LoadOp = AttachmentLoadOp.Clear,
            StoreOp = AttachmentStoreOp.Store,
            ClearValue = new ClearValue(new ClearColorValue(0f, 0f, 0f, 1f)),
        };
        var rendering = new RenderingInfo
        {
            SType = StructureType.RenderingInfo,
            RenderArea = new Rect2D(new Offset2D(0, 0), _extent),
            LayerCount = 1,
            ColorAttachmentCount = 1,
            PColorAttachments = &color,
        };
        _vk.CmdBeginRendering(_commands, in rendering);

        _vk.CmdBindPipeline(_commands, PipelineBindPoint.Graphics, _pipeline);
        // Una altura negativa voltea el viewport, así +Y apunta hacia arriba como en las otras APIs.
        var viewport = new Viewport(0, _extent.Height, _extent.Width, -(float)_extent.Height, 0, 1);
        var scissor = new Rect2D(new Offset2D(0, 0), _extent);
        _vk.CmdSetViewport(_commands, 0, 1, in viewport);
        _vk.CmdSetScissor(_commands, 0, 1, in scissor);
        Buffer vertexBuffer = _vertexBuffer;
        ulong offset = 0;
        _vk.CmdBindVertexBuffers(_commands, 0, 1, in vertexBuffer, in offset);
        DescriptorSet set = _set;
        _vk.CmdBindDescriptorSets(_commands, PipelineBindPoint.Graphics, _pipelineLayout, 0, 1, in set, 0, null);
        _vk.CmdDraw(_commands, 4, 1, 0, 0);
        _vk.CmdEndRendering(_commands);

        Transition(_commands, _images[index], ImageLayout.ColorAttachmentOptimal, ImageLayout.PresentSrcKhr, AccessFlags.ColorAttachmentWriteBit, 0, PipelineStageFlags.ColorAttachmentOutputBit, PipelineStageFlags.BottomOfPipeBit);
        _vk.EndCommandBuffer(_commands);

        Semaphore wait = _imageAvailable;
        Semaphore signal = _renderFinished[index];
        PipelineStageFlags stage = PipelineStageFlags.ColorAttachmentOutputBit;
        CommandBuffer commands = _commands;
        var submit = new SubmitInfo
        {
            SType = StructureType.SubmitInfo,
            WaitSemaphoreCount = 1,
            PWaitSemaphores = &wait,
            PWaitDstStageMask = &stage,
            CommandBufferCount = 1,
            PCommandBuffers = &commands,
            SignalSemaphoreCount = 1,
            PSignalSemaphores = &signal,
        };
        Check(_vk.QueueSubmit(_queue, 1, in submit, _inFlight));

        SwapchainKHR swapchain = _swapchain;
        var present = new PresentInfoKHR
        {
            SType = StructureType.PresentInfoKhr,
            WaitSemaphoreCount = 1,
            PWaitSemaphores = &signal,
            SwapchainCount = 1,
            PSwapchains = &swapchain,
            PImageIndices = &index,
        };
        result = _khrSwapchain.QueuePresent(_queue, in present);
        if (result == Result.ErrorOutOfDateKhr || result == Result.SuboptimalKhr)
        {
            Resized = true;
        }
    }
}
```

```csharp title="Visor/Renderer.Helpers.cs"
using System.Runtime.InteropServices;
using Silk.NET.Core;
using Silk.NET.Core.Native;
using Silk.NET.Vulkan;
using Silk.NET.Vulkan.Extensions.KHR;
using Silk.NET.Windowing;
using StbImageSharp;
using Buffer = Silk.NET.Vulkan.Buffer;
using Image = Silk.NET.Vulkan.Image;
using Semaphore = Silk.NET.Vulkan.Semaphore;

public unsafe partial class Renderer
{
    private Buffer CreateBuffer(ulong size, BufferUsageFlags usage, out DeviceMemory memory)
    {
        var info = new BufferCreateInfo { SType = StructureType.BufferCreateInfo, Size = size, Usage = usage, SharingMode = SharingMode.Exclusive };
        Check(_vk.CreateBuffer(_device, in info, null, out Buffer buffer));
        _vk.GetBufferMemoryRequirements(_device, buffer, out MemoryRequirements requirements);
        var allocate = new MemoryAllocateInfo
        {
            SType = StructureType.MemoryAllocateInfo,
            AllocationSize = requirements.Size,
            MemoryTypeIndex = FindMemoryType(requirements.MemoryTypeBits, MemoryPropertyFlags.HostVisibleBit | MemoryPropertyFlags.HostCoherentBit),
        };
        Check(_vk.AllocateMemory(_device, in allocate, null, out memory));
        _vk.BindBufferMemory(_device, buffer, memory, 0);
        return buffer;
    }

    private uint FindMemoryType(uint bits, MemoryPropertyFlags wanted)
    {
        _vk.GetPhysicalDeviceMemoryProperties(_physical, out PhysicalDeviceMemoryProperties memory);
        for (uint i = 0; i < memory.MemoryTypeCount; i++)
        {
            if ((bits & (1u << (int)i)) != 0 && memory.MemoryTypes[(int)i].PropertyFlags.HasFlag(wanted))
            {
                return i;
            }
        }
        throw new Exception("No memory type with those properties.");
    }

    private CommandPool CreateCommandPool(bool reset = false)
    {
        var info = new CommandPoolCreateInfo { SType = StructureType.CommandPoolCreateInfo, QueueFamilyIndex = _family, Flags = reset ? CommandPoolCreateFlags.ResetCommandBufferBit : 0 };
        Check(_vk.CreateCommandPool(_device, in info, null, out CommandPool pool));
        return pool;
    }

    private CommandBuffer BeginOneTime(CommandPool pool)
    {
        var allocate = new CommandBufferAllocateInfo { SType = StructureType.CommandBufferAllocateInfo, CommandPool = pool, Level = CommandBufferLevel.Primary, CommandBufferCount = 1 };
        _vk.AllocateCommandBuffers(_device, in allocate, out CommandBuffer commands);
        var begin = new CommandBufferBeginInfo { SType = StructureType.CommandBufferBeginInfo, Flags = CommandBufferUsageFlags.OneTimeSubmitBit };
        _vk.BeginCommandBuffer(commands, in begin);
        return commands;
    }

    private void EndOneTime(CommandPool pool, CommandBuffer commands)
    {
        _vk.EndCommandBuffer(commands);
        var submit = new SubmitInfo { SType = StructureType.SubmitInfo, CommandBufferCount = 1, PCommandBuffers = &commands };
        _vk.QueueSubmit(_queue, 1, in submit, default);
        _vk.QueueWaitIdle(_queue);
    }

    private void Transition(CommandBuffer commands, Image image, ImageLayout from, ImageLayout to, AccessFlags srcAccess, AccessFlags dstAccess, PipelineStageFlags srcStage, PipelineStageFlags dstStage)
    {
        var barrier = new ImageMemoryBarrier
        {
            SType = StructureType.ImageMemoryBarrier,
            OldLayout = from,
            NewLayout = to,
            SrcQueueFamilyIndex = Vk.QueueFamilyIgnored,
            DstQueueFamilyIndex = Vk.QueueFamilyIgnored,
            Image = image,
            SubresourceRange = new ImageSubresourceRange(ImageAspectFlags.ColorBit, 0, 1, 0, 1),
            SrcAccessMask = srcAccess,
            DstAccessMask = dstAccess,
        };
        _vk.CmdPipelineBarrier(commands, srcStage, dstStage, 0, 0, null, 0, null, 1, in barrier);
    }

    private static void Check(Result result)
    {
        if (result != Result.Success)
        {
            throw new Exception($"Vulkan error: {result}");
        }
    }

    public void Dispose()
    {
        _vk.DeviceWaitIdle(_device);
    }
}
```

## WebGPU

Silk.NET.WebGPU dibuja con wgpu-native (Direct3D 12, Metal o Vulkan). WebGPU no abre la ventana por ti: `WindowSurface.cs` crea la superficie con el manejador nativo de cada sistema. El shader es un solo archivo WGSL con las dos etapas; el visor le cambia el nombre a la struct `VertexOutput` por `VertexOut`, porque el backend de Metal de wgpu ya usa ese nombre. La textura y su sampler son dos recursos (bindings 1 y 2).

```csharp title="Visor/Program.cs"
using Silk.NET.Core.Native;
using Silk.NET.Input;
using Silk.NET.Maths;
using Silk.NET.WebGPU;
using Silk.NET.Windowing;
using StbImageSharp;
using Buffer = Silk.NET.WebGPU.Buffer;

string name = args.Length > 0 ? args[0] : "Degradado";
// Los shaders que declaran solo el reloj (un Reloj con Segundos) leen primero los segundos; los demás leen ancho, alto y segundos.
bool clockOnly = name is "Plasma" or "BajoElAgua";

var options = WindowOptions.Default with
{
    Size = new Vector2D<int>(800, 450),
    Title = name,
    API = GraphicsAPI.None,
};

using IWindow window = Window.Create(options);
unsafe
{
    WebGPU wgpu = WebGPU.GetApi();
    Instance* instance = null;
    Surface* surface = null;
    Adapter* adapter = null;
    Device* device = null;
    Queue* queue = null;
    RenderPipeline* pipeline = null;
    BindGroup* bindGroup = null;
    Buffer* vertexBuffer = null;
    Buffer* dataBuffer = null;
    TextureFormat format = TextureFormat.Bgra8Unorm;

    window.Load += () =>
    {
        IInputContext input = window.CreateInput();
        foreach (IKeyboard keyboard in input.Keyboards)
        {
            keyboard.KeyDown += (_, key, _) =>
            {
                if (key == Key.Escape) window.Close();
            };
        }

        // Instancia, superficie, adaptador (la tarjeta gráfica) y dispositivo (tu conexión con ella).
        var instanceDescriptor = new InstanceDescriptor();
        instance = wgpu.CreateInstance(in instanceDescriptor);
        surface = WindowSurface.Create(wgpu, instance, window);

        var adapterOptions = new RequestAdapterOptions { CompatibleSurface = surface };
        wgpu.InstanceRequestAdapter(instance, in adapterOptions, new PfnRequestAdapterCallback((status, result, message, _) =>
        {
            if (status != RequestAdapterStatus.Success) throw new Exception($"No adapter: {SilkMarshal.PtrToString((nint)message)}");
            adapter = result;
        }), null);

        var deviceDescriptor = new DeviceDescriptor();
        wgpu.AdapterRequestDevice(adapter, in deviceDescriptor, new PfnRequestDeviceCallback((status, result, message, _) =>
        {
            if (status != RequestDeviceStatus.Success) throw new Exception($"No device: {SilkMarshal.PtrToString((nint)message)}");
            device = result;
        }), null);
        queue = wgpu.DeviceGetQueue(device);

        Configure();

        // El shader: un archivo WGSL con las dos etapas.
        // El backend Metal de wgpu ya usa el nombre VertexOutput, así que a la struct de salida le damos otro.
        string wgsl = File.ReadAllText($"MisShaders/out/MisShaders/{name}.wgsl")
            .Replace("VertexOutput", "VertexOut");
        var wgslDescriptor = new ShaderModuleWGSLDescriptor
        {
            Chain = new ChainedStruct { SType = SType.ShaderModuleWgsldescriptor },
            Code = (byte*)SilkMarshal.StringToPtr(wgsl),
        };
        var moduleDescriptor = new ShaderModuleDescriptor { NextInChain = (ChainedStruct*)&wgslDescriptor };
        ShaderModule* module = wgpu.DeviceCreateShaderModule(device, in moduleDescriptor);

        // El rectángulo: cuatro esquinas, cada una con su posición (ranura 0) y su Uv (ranura 1).
        // La Y de las posiciones está invertida porque el WGSL compilado mantiene la convención de Vulkan.
        float[] screen =
        [
            -1f, -1f, 0f, 0f,
             1f, -1f, 1f, 0f,
            -1f,  1f, 0f, 1f,
             1f,  1f, 1f, 1f,
        ];
        vertexBuffer = CreateBuffer(BufferUsage.Vertex | BufferUsage.CopyDst, (ulong)(screen.Length * sizeof(float)));
        fixed (float* p = screen) wgpu.QueueWriteBuffer(queue, vertexBuffer, 0, p, (nuint)(screen.Length * sizeof(float)));

        // El bloque de uniforms (ancho, alto, segundos): 16 bytes, que se escriben en cada cuadro.
        dataBuffer = CreateBuffer(BufferUsage.Uniform | BufferUsage.CopyDst, 16);

        // La foto: WebGPU mantiene separadas la textura y su sampler.
        Texture* photo = CreatePhoto();
        var viewDescriptor = new TextureViewDescriptor
        {
            Format = TextureFormat.Rgba8Unorm,
            Dimension = TextureViewDimension.Dimension2D,
            MipLevelCount = 1,
            ArrayLayerCount = 1,
            Aspect = TextureAspect.All,
        };
        TextureView* photoView = wgpu.TextureCreateView(photo, in viewDescriptor);
        var samplerDescriptor = new SamplerDescriptor
        {
            MagFilter = FilterMode.Linear,
            MinFilter = FilterMode.Linear,
            AddressModeU = AddressMode.ClampToEdge,
            AddressModeV = AddressMode.ClampToEdge,
            AddressModeW = AddressMode.ClampToEdge,
            MaxAnisotropy = 1,
            LodMaxClamp = 32,
        };
        Sampler* sampler = wgpu.DeviceCreateSampler(device, in samplerDescriptor);

        // Grupo 0: el binding 0 es el bloque de uniforms, el 1 la textura y el 2 el sampler.
        var layoutEntries = stackalloc BindGroupLayoutEntry[3];
        layoutEntries[0] = new BindGroupLayoutEntry { Binding = 0, Visibility = ShaderStage.Vertex | ShaderStage.Fragment, Buffer = new BufferBindingLayout { Type = BufferBindingType.Uniform } };
        layoutEntries[1] = new BindGroupLayoutEntry { Binding = 1, Visibility = ShaderStage.Fragment, Texture = new TextureBindingLayout { SampleType = TextureSampleType.Float, ViewDimension = TextureViewDimension.Dimension2D } };
        layoutEntries[2] = new BindGroupLayoutEntry { Binding = 2, Visibility = ShaderStage.Fragment, Sampler = new SamplerBindingLayout { Type = SamplerBindingType.Filtering } };
        var layoutDescriptor = new BindGroupLayoutDescriptor { EntryCount = 3, Entries = layoutEntries };
        BindGroupLayout* bindLayout = wgpu.DeviceCreateBindGroupLayout(device, in layoutDescriptor);

        var entries = stackalloc BindGroupEntry[3];
        entries[0] = new BindGroupEntry { Binding = 0, Buffer = dataBuffer, Offset = 0, Size = 16 };
        entries[1] = new BindGroupEntry { Binding = 1, TextureView = photoView };
        entries[2] = new BindGroupEntry { Binding = 2, Sampler = sampler };
        var groupDescriptor = new BindGroupDescriptor { Layout = bindLayout, EntryCount = 3, Entries = entries };
        bindGroup = wgpu.DeviceCreateBindGroup(device, in groupDescriptor);

        var pipelineLayoutDescriptor = new PipelineLayoutDescriptor { BindGroupLayoutCount = 1, BindGroupLayouts = &bindLayout };
        PipelineLayout* pipelineLayout = wgpu.DeviceCreatePipelineLayout(device, in pipelineLayoutDescriptor);

        // Los atributos de vértice repiten los números de location del struct de C#.
        var attributes = stackalloc VertexAttribute[2];
        attributes[0] = new VertexAttribute { Format = VertexFormat.Float32x2, Offset = 0, ShaderLocation = 0 };
        attributes[1] = new VertexAttribute { Format = VertexFormat.Float32x2, Offset = 8, ShaderLocation = 1 };
        var vertexLayout = new VertexBufferLayout { ArrayStride = 16, StepMode = VertexStepMode.Vertex, AttributeCount = 2, Attributes = attributes };

        var blend = new BlendState
        {
            Color = new BlendComponent { Operation = BlendOperation.Add, SrcFactor = BlendFactor.One, DstFactor = BlendFactor.Zero },
            Alpha = new BlendComponent { Operation = BlendOperation.Add, SrcFactor = BlendFactor.One, DstFactor = BlendFactor.Zero },
        };
        var target = new ColorTargetState { Format = format, Blend = &blend, WriteMask = ColorWriteMask.All };
        var fragment = new FragmentState { Module = module, EntryPoint = (byte*)SilkMarshal.StringToPtr("Fragment"), TargetCount = 1, Targets = &target };

        var pipelineDescriptor = new RenderPipelineDescriptor
        {
            Layout = pipelineLayout,
            Vertex = new VertexState { Module = module, EntryPoint = (byte*)SilkMarshal.StringToPtr("Vertex"), BufferCount = 1, Buffers = &vertexLayout },
            Primitive = new PrimitiveState { Topology = PrimitiveTopology.TriangleStrip, FrontFace = FrontFace.Ccw, CullMode = CullMode.None },
            Multisample = new MultisampleState { Count = 1, Mask = ~0u },
            Fragment = &fragment,
        };
        pipeline = wgpu.DeviceCreateRenderPipeline(device, in pipelineDescriptor);
    };

    window.FramebufferResize += _ =>
    {
        if (device != null) Configure();
    };

    window.Render += _ =>
    {
        // Si tu shader declara estos datos, el visor se los entrega.
        float seconds = (float)window.Time;
    float[] values = clockOnly ? [seconds, 0f, 0f, 0f] : [window.FramebufferSize.X, window.FramebufferSize.Y, seconds, 0f];
        fixed (float* p = values) wgpu.QueueWriteBuffer(queue, dataBuffer, 0, p, 16);

        SurfaceTexture current;
        wgpu.SurfaceGetCurrentTexture(surface, &current);
        TextureView* view = wgpu.TextureCreateView(current.Texture, null);
        CommandEncoder* encoder = wgpu.DeviceCreateCommandEncoder(device, null);

        var color = new RenderPassColorAttachment
        {
            View = view,
            LoadOp = LoadOp.Clear,
            StoreOp = StoreOp.Store,
            ClearValue = new Color(0, 0, 0, 1),
        };
        var passDescriptor = new RenderPassDescriptor { ColorAttachmentCount = 1, ColorAttachments = &color };
        RenderPassEncoder* pass = wgpu.CommandEncoderBeginRenderPass(encoder, in passDescriptor);
        wgpu.RenderPassEncoderSetPipeline(pass, pipeline);
        wgpu.RenderPassEncoderSetBindGroup(pass, 0, bindGroup, 0, null);
        wgpu.RenderPassEncoderSetVertexBuffer(pass, 0, vertexBuffer, 0, 64);
        wgpu.RenderPassEncoderDraw(pass, 4, 1, 0, 0);
        wgpu.RenderPassEncoderEnd(pass);

        CommandBuffer* commands = wgpu.CommandEncoderFinish(encoder, null);
        wgpu.QueueSubmit(queue, 1, &commands);
        wgpu.SurfacePresent(surface);

        wgpu.CommandBufferRelease(commands);
        wgpu.RenderPassEncoderRelease(pass);
        wgpu.CommandEncoderRelease(encoder);
        wgpu.TextureViewRelease(view);
        wgpu.TextureRelease(current.Texture);
    };

    window.Run();

    void Configure()
    {
        var configuration = new SurfaceConfiguration
        {
            Device = device,
            Format = format,
            Usage = TextureUsage.RenderAttachment,
            Width = (uint)window.FramebufferSize.X,
            Height = (uint)window.FramebufferSize.Y,
            PresentMode = PresentMode.Fifo,
            AlphaMode = CompositeAlphaMode.Auto,
        };
        wgpu.SurfaceConfigure(surface, in configuration);
    }

    Buffer* CreateBuffer(BufferUsage usage, ulong size)
    {
        var descriptor = new BufferDescriptor { Usage = usage, Size = size };
        return wgpu.DeviceCreateBuffer(device, in descriptor);
    }

    Texture* CreatePhoto()
    {
        // Si la foto no existe, la textura es un solo píxel blanco.
        byte[] pixels = [255, 255, 255, 255];
        int width = 1, height = 1;
        if (File.Exists("pez.jpg"))
        {
            ImageResult image = ImageResult.FromStream(File.OpenRead("pez.jpg"), ColorComponents.RedGreenBlueAlpha);
            pixels = image.Data;
            width = image.Width;
            height = image.Height;
        }

        var descriptor = new TextureDescriptor
        {
            Usage = TextureUsage.TextureBinding | TextureUsage.CopyDst,
            Dimension = TextureDimension.Dimension2D,
            Size = new Extent3D((uint)width, (uint)height, 1),
            Format = TextureFormat.Rgba8Unorm,
            MipLevelCount = 1,
            SampleCount = 1,
        };
        Texture* texture = wgpu.DeviceCreateTexture(device, in descriptor);
        var destination = new ImageCopyTexture { Texture = texture, MipLevel = 0, Aspect = TextureAspect.All };
        var layout = new TextureDataLayout { Offset = 0, BytesPerRow = (uint)(width * 4), RowsPerImage = (uint)height };
        var size = new Extent3D((uint)width, (uint)height, 1);
        fixed (byte* p = pixels) wgpu.QueueWriteTexture(queue, in destination, p, (nuint)pixels.Length, in layout, in size);
        return texture;
    }
}
```

```csharp title="Visor/WindowSurface.cs"
using System.Runtime.InteropServices;
using Silk.NET.Core.Contexts;
using Silk.NET.WebGPU;
using Silk.NET.Windowing;

// WebGPU dibuja en una "superficie" que pertenece a la ventana del sistema operativo.
// Cada sistema nombra su ventana a su manera.
public static unsafe class WindowSurface
{
    public static Surface* Create(WebGPU wgpu, Instance* instance, IWindow window)
    {
        INativeWindow native = window.Native!;
        var descriptor = new SurfaceDescriptor();

        if (native.Win32 is { } win32)
        {
            var chained = new SurfaceDescriptorFromWindowsHWND
            {
                Chain = new ChainedStruct { SType = SType.SurfaceDescriptorFromWindowsHwnd },
                Hwnd = (void*)win32.Hwnd,
                Hinstance = (void*)win32.HInstance,
            };
            descriptor.NextInChain = (ChainedStruct*)&chained;
            return wgpu.InstanceCreateSurface(instance, in descriptor);
        }

        if (native.X11 is { } x11)
        {
            var chained = new SurfaceDescriptorFromXlibWindow
            {
                Chain = new ChainedStruct { SType = SType.SurfaceDescriptorFromXlibWindow },
                Display = (void*)x11.Display,
                Window = (uint)x11.Window,
            };
            descriptor.NextInChain = (ChainedStruct*)&chained;
            return wgpu.InstanceCreateSurface(instance, in descriptor);
        }

        if (native.Wayland is { } wayland)
        {
            var chained = new SurfaceDescriptorFromWaylandSurface
            {
                Chain = new ChainedStruct { SType = SType.SurfaceDescriptorFromWaylandSurface },
                Display = (void*)wayland.Display,
                Surface = (void*)wayland.Surface,
            };
            descriptor.NextInChain = (ChainedStruct*)&chained;
            return wgpu.InstanceCreateSurface(instance, in descriptor);
        }

        if (native.Cocoa is { } cocoa)
        {
            var chained = new SurfaceDescriptorFromMetalLayer
            {
                Chain = new ChainedStruct { SType = SType.SurfaceDescriptorFromMetalLayer },
                Layer = (void*)MetalLayer(cocoa),
            };
            descriptor.NextInChain = (ChainedStruct*)&chained;
            return wgpu.InstanceCreateSurface(instance, in descriptor);
        }

        throw new PlatformNotSupportedException("This window system has no WebGPU surface here.");
    }

    // En macOS la ventana necesita una CAMetalLayer, que le pides a Objective-C.
    private static nint MetalLayer(nint nsWindow)
    {
        NativeLibrary.Load("/System/Library/Frameworks/QuartzCore.framework/QuartzCore");
        nint view = Send(nsWindow, Selector("contentView"));
        Send(view, Selector("setWantsLayer:"), 1);
        nint layer = Send(GetClass("CAMetalLayer"), Selector("layer"));
        Send(view, Selector("setLayer:"), layer);
        return layer;
    }

    [DllImport("/usr/lib/libobjc.dylib", EntryPoint = "objc_getClass")]
    private static extern nint GetClass(string name);

    [DllImport("/usr/lib/libobjc.dylib", EntryPoint = "sel_registerName")]
    private static extern nint Selector(string name);

    [DllImport("/usr/lib/libobjc.dylib", EntryPoint = "objc_msgSend")]
    private static extern nint Send(nint receiver, nint selector);

    [DllImport("/usr/lib/libobjc.dylib", EntryPoint = "objc_msgSend")]
    private static extern nint Send(nint receiver, nint selector, nint argument);
}
```

## Si algo falla

| Qué ves | Qué significa | Qué hacer |
| --- | --- | --- |
| `Could not find file '.../Degradado.Fragment.glsl'` (o `.gles`, `.spv`, `.wgsl`) | El shader no se compiló con el destino de tu API, o el visor se ejecuta desde otra carpeta. | Ejecuta `compile` con el destino correcto y lanza el visor desde la carpeta que contiene `MisShaders`. |
| OpenGL: la ventana no se crea | El driver no ofrece un contexto 4.1 core. | Baja la versión en `APIVersion` y compila con el `glsl` que le corresponde. |
| Vulkan: una excepción al crear la instancia | No hay cargador ni driver de Vulkan. | Instala el driver de tu tarjeta, o el Vulkan SDK en macOS. |
| WebGPU: `compile --target wgsl` falla con un shader que tiene `sampler2D` | WGSL separa la textura y el sampler, y el estilo GLSL los declara juntos. | Escribe el shader en el estilo WGSL, con la textura y el sampler por separado. |
| Un shader con foto sale negro | El visor no encontró `pez.jpg`. | Pon la imagen dentro de la carpeta desde la que ejecutas el visor. |
| El shader no ve el tiempo ni el tamaño | Declara un bloque de datos que el visor no conoce. | Conserva los nombres del tutorial: `Entorno` (ancho, alto, segundos) y `Reloj`. |

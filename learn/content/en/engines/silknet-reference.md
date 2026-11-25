---
title: Silk.NET reference
summary: Silk.NET: packages, output format and a complete viewer for OpenGL, OpenGL ES, Vulkan and WebGPU.
order: 13
---

Silk.NET is a set of .NET bindings for OpenGL, OpenGL ES, Vulkan, WebGPU and more. Yotsuba Shader needs no plugin to use it: the CLI writes the shader in the format of your API and your program reads it. This page has the complete viewer of the **four APIs**, with the same weight, so you can compare how each one receives the same shader. For the step-by-step path, use the Silk.NET route of [Get Started](../get-started/index.md).

## At a glance

| | OpenGL | OpenGL ES | Vulkan | WebGPU |
| --- | --- | --- | --- | --- |
| Target | `glsl:330` | `gles:300` | `spirv` | `wgsl` |
| Output | `.Vertex.glsl` and `.Fragment.glsl` | `.Vertex.gles` and `.Fragment.gles` | `.spv` | `.wgsl` |
| Package | `Silk.NET.OpenGL` | `Silk.NET.OpenGLES` | `Silk.NET.Vulkan` | `Silk.NET.WebGPU` |
| Addresses | `layout(0, 0)` and `layout(0, 1)` | `layout(0, 0)` and `layout(0, 1)` | set 0, binding 0 and 1 | group 0, binding 0, 1 and 2 |

## Build the shaders

With the compiler installed (`dotnet tool install --global YotsubaShader.Compiler.CLI`), from the folder that contains your shader project, each API asks for its target:

```bash tab="OpenGL"
yotsuba compile MyShaders/MyShaders.csproj --target glsl:330 --output out
```
```bash tab="OpenGL ES"
yotsuba compile MyShaders/MyShaders.csproj --target gles:300 --output out
```
```bash tab="Vulkan"
yotsuba compile MyShaders/MyShaders.csproj --target spirv --output out
```
```bash tab="WebGPU"
yotsuba compile MyShaders/MyShaders.csproj --target wgsl --output out
```

To run the command on every build, see [The compile command](../reference/compile.md).

## The game project

A console project with the packages of your API. Also add `<AllowUnsafeBlocks>true</AllowUnsafeBlocks>` to `Viewer.csproj`:

```bash
dotnet new console -n Viewer -f net8.0
```

```bash tab="OpenGL"
dotnet add Viewer package Silk.NET.OpenGL --version 2.23.0
dotnet add Viewer package Silk.NET.Windowing --version 2.23.0
dotnet add Viewer package Silk.NET.Input --version 2.23.0
dotnet add Viewer package StbImageSharp --version 2.23.0
```
```bash tab="OpenGL ES"
dotnet add Viewer package Silk.NET.OpenGLES --version 2.23.0
dotnet add Viewer package Silk.NET.Windowing --version 2.23.0
dotnet add Viewer package Silk.NET.Input --version 2.23.0
dotnet add Viewer package StbImageSharp --version 2.23.0
```
```bash tab="Vulkan"
dotnet add Viewer package Silk.NET.Vulkan --version 2.23.0
dotnet add Viewer package Silk.NET.Vulkan.Extensions.KHR --version 2.23.0
dotnet add Viewer package Silk.NET.Windowing --version 2.23.0
dotnet add Viewer package Silk.NET.Windowing.Sdl --version 2.23.0
dotnet add Viewer package Silk.NET.Input --version 2.23.0
dotnet add Viewer package Silk.NET.Input.Sdl --version 2.23.0
dotnet add Viewer package StbImageSharp --version 2.23.0
```
```bash tab="WebGPU"
dotnet add Viewer package Silk.NET.WebGPU --version 2.23.0
dotnet add Viewer package Silk.NET.WebGPU.Native.WGPU --version 2.23.0
dotnet add Viewer package Silk.NET.Windowing --version 2.23.0
dotnet add Viewer package Silk.NET.Input --version 2.23.0
dotnet add Viewer package StbImageSharp --version 2.23.0
```

Vulkan uses SDL for the window (`Window.PrioritizeSdl()`), because the GLFW window that Silk.NET ships does not offer Vulkan on macOS.

## Vertex data: slot 0 is the position, slot 1 the Uv

The shader of the tutorial receives a vertex with `[location(0)] vec2 Position` and `[location(1)] vec2 Uv`. In all four APIs the rectangle is four corners of four `float` (16 bytes), and each API describes those two slots in its own way: `VertexAttribPointer(0, 2, ..., 16, 0)` and `(1, 2, ..., 16, 8)` in OpenGL and OpenGL ES, one `VertexInputAttributeDescription` per slot in Vulkan and one `VertexAttribute` per slot in WebGPU.

## Uniforms

The uniforms of your shader are a block at `layout(0, 0)`. The viewer creates a 16-byte buffer (width, height, seconds and a padding) and writes it on every frame. Shaders that declare only the clock (`Plasma` and `Underwater`) read the seconds at the start of the buffer. In OpenGL the block is tied to address 0 with `UniformBlockBinding`, because GLSL 3.30 cannot write it in the text; in Vulkan and WebGPU the address already travels in the shader.

## OpenGL

It asks for a 4.1 core context (the most macOS offers) and loads `glsl:330`. `Compile` is a small helper that compiles one stage and throws the error log if it fails.

```csharp title="Viewer/Program.cs"
using Silk.NET.Input;
using Silk.NET.Maths;
using Silk.NET.OpenGL;
using Silk.NET.Windowing;
using StbImageSharp;

string name = args.Length > 0 ? args[0] : "Gradient";
// Shaders that declare only the clock (a Clock with Seconds) read the seconds first; the others read width, height and seconds.
bool clockOnly = name is "Plasma" or "Underwater";

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

    // The two stages of the shader, as the compiler wrote them.
    string folder = "MyShaders/out/MyShaders";
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

    // The rectangle: four corners, each with its position (slot 0) and its Uv (slot 1).
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

    // The uniform block (width, height, seconds) goes at address 0.
    data = gl.GenBuffer();
    gl.BindBuffer(BufferTargetARB.UniformBuffer, data);
    unsafe { gl.BufferData(BufferTargetARB.UniformBuffer, 16, null, BufferUsageARB.DynamicDraw); }
    gl.BindBufferBase(BufferTargetARB.UniformBuffer, 0, data);
    gl.GetProgram(program, ProgramPropertyARB.ActiveUniformBlocks, out int blocks);
    for (uint block = 0; block < blocks; block++)
    {
        gl.UniformBlockBinding(program, block, 0);
    }

    // The photo for shaders that declare a texture.
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

    // If your shader declares this data, the viewer hands it over.
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

The same viewer with `Silk.NET.OpenGLES` and `CreateOpenGLES()`: it asks for an ES 3.0 context and loads `gles:300`. It needs a driver with OpenGL ES 3.0; where there is none, put ANGLE's `libEGL` and `libGLESv2` next to the program.

```csharp title="Viewer/Program.cs"
using Silk.NET.Input;
using Silk.NET.Maths;
using Silk.NET.OpenGLES;
using Silk.NET.Windowing;
using StbImageSharp;

string name = args.Length > 0 ? args[0] : "Gradient";
// Shaders that declare only the clock (a Clock with Seconds) read the seconds first; the others read width, height and seconds.
bool clockOnly = name is "Plasma" or "Underwater";

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

    // The two stages of the shader, as the compiler wrote them.
    string folder = "MyShaders/out/MyShaders";
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

    // The rectangle: four corners, each with its position (slot 0) and its Uv (slot 1).
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

    // The uniform block (width, height, seconds) goes at address 0.
    data = gl.GenBuffer();
    gl.BindBuffer(BufferTargetARB.UniformBuffer, data);
    unsafe { gl.BufferData(BufferTargetARB.UniformBuffer, 16, null, BufferUsageARB.DynamicDraw); }
    gl.BindBufferBase(BufferTargetARB.UniformBuffer, 0, data);
    gl.GetProgram(program, ProgramPropertyARB.ActiveUniformBlocks, out int blocks);
    for (uint block = 0; block < blocks; block++)
    {
        gl.UniformBlockBinding(program, block, 0);
    }

    // The photo for shaders that declare a texture.
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

    // If your shader declares this data, the viewer hands it over.
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

## Vulkan: the renderer

Vulkan does not draw in a single call: you create the instance, the device, the swapchain, the resources, the pipeline and the synchronization. `Program.cs` only opens the window and calls `Renderer`; the renderer is split in `partial` files of one class, one per responsibility. Copy all of them into `Viewer/`. The viewer uses Vulkan 1.3 with dynamic rendering (no render passes or framebuffers); on macOS it needs the [Vulkan SDK](https://vulkan.lunarg.com/sdk/home) for MoltenVK. The viewport has a negative height so `+Y` points up like in the other APIs.

```csharp title="Viewer/Program.cs"
using Silk.NET.Input;
using Silk.NET.Maths;
using Silk.NET.Windowing;

string name = args.Length > 0 ? args[0] : "Gradient";

var options = WindowOptions.DefaultVulkan with
{
    Size = new Vector2D<int>(800, 450),
    Title = name,
};

// SDL opens Vulkan windows on every system.
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

```csharp title="Viewer/Renderer.cs"
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
        // Shaders that declare only the clock (a Clock with Seconds) read the seconds first; the others read width, height and seconds.
        _clockOnly = name is "Plasma" or "Underwater";
        CreateInstance();
        _surface = _window.VkSurface!.Create<AllocationCallbacks>(_instance.ToHandle(), null).ToSurface();
        PickDevice();
        CreateSwapchain();
        CreateResources(name);
        CreateSync();
    }
}
```

```csharp title="Viewer/Renderer.Device.cs"
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
            // MoltenVK sits on top of Metal and is a "portability" driver: the loader hides it unless you ask.
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

        // Vulkan 1.3 can draw without render passes or framebuffers if you turn this feature on.
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

```csharp title="Viewer/Renderer.Swapchain.cs"
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

```csharp title="Viewer/Renderer.Resources.cs"
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
        // The vertex buffer: four corners, each with a position and a Uv (16 bytes).
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

        // The uniform block (width, height, seconds): 16 bytes, written every frame.
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

```csharp title="Viewer/Renderer.Pipeline.cs"
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
        // Set 0: binding 0 is the uniform block, binding 1 is the texture.
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

        // One module with both stages, and an entry point name for each.
        byte[] spirv = File.ReadAllBytes($"MyShaders/out/MyShaders/{name}.spv");
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

```csharp title="Viewer/Renderer.Draw.cs"
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

        // If your shader declares this data, the viewer hands it over.
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
        // A negative height flips the viewport, so +Y points up like in the other APIs.
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

```csharp title="Viewer/Renderer.Helpers.cs"
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

Silk.NET.WebGPU draws with wgpu-native (Direct3D 12, Metal or Vulkan). WebGPU does not open the window for you: `WindowSurface.cs` creates the surface with the native handle of each system. The shader is a single WGSL file with both stages; the viewer renames the `VertexOutput` struct to `VertexOut`, because wgpu's Metal backend already uses that name. The texture and its sampler are two resources (bindings 1 and 2).

```csharp title="Viewer/Program.cs"
using Silk.NET.Core.Native;
using Silk.NET.Input;
using Silk.NET.Maths;
using Silk.NET.WebGPU;
using Silk.NET.Windowing;
using StbImageSharp;
using Buffer = Silk.NET.WebGPU.Buffer;

string name = args.Length > 0 ? args[0] : "Gradient";
// Shaders that declare only the clock (a Clock with Seconds) read the seconds first; the others read width, height and seconds.
bool clockOnly = name is "Plasma" or "Underwater";

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

        // Instance, surface, adapter (the graphics card) and device (your connection to it).
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

        // The shader: one WGSL file with both stages.
        // wgpu's Metal backend already uses the name VertexOutput, so the output struct gets another one.
        string wgsl = File.ReadAllText($"MyShaders/out/MyShaders/{name}.wgsl")
            .Replace("VertexOutput", "VertexOut");
        var wgslDescriptor = new ShaderModuleWGSLDescriptor
        {
            Chain = new ChainedStruct { SType = SType.ShaderModuleWgsldescriptor },
            Code = (byte*)SilkMarshal.StringToPtr(wgsl),
        };
        var moduleDescriptor = new ShaderModuleDescriptor { NextInChain = (ChainedStruct*)&wgslDescriptor };
        ShaderModule* module = wgpu.DeviceCreateShaderModule(device, in moduleDescriptor);

        // The rectangle: four corners, each with its position (slot 0) and its Uv (slot 1).
        // The Y of the positions is flipped because the compiled WGSL keeps Vulkan's convention.
        float[] screen =
        [
            -1f, -1f, 0f, 0f,
             1f, -1f, 1f, 0f,
            -1f,  1f, 0f, 1f,
             1f,  1f, 1f, 1f,
        ];
        vertexBuffer = CreateBuffer(BufferUsage.Vertex | BufferUsage.CopyDst, (ulong)(screen.Length * sizeof(float)));
        fixed (float* p = screen) wgpu.QueueWriteBuffer(queue, vertexBuffer, 0, p, (nuint)(screen.Length * sizeof(float)));

        // The uniform block (width, height, seconds): 16 bytes, written every frame.
        dataBuffer = CreateBuffer(BufferUsage.Uniform | BufferUsage.CopyDst, 16);

        // The photo: WebGPU keeps the texture and its sampler apart.
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

        // Group 0: binding 0 is the uniform block, 1 the texture and 2 the sampler.
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

        // The vertex attributes repeat the location numbers of the C# struct.
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
        // If your shader declares this data, the viewer hands it over.
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
        // If the photo does not exist, the texture is a single white pixel.
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

```csharp title="Viewer/WindowSurface.cs"
using System.Runtime.InteropServices;
using Silk.NET.Core.Contexts;
using Silk.NET.WebGPU;
using Silk.NET.Windowing;

// WebGPU draws into a "surface" that belongs to the operating system window.
// Each system names its window in its own way.
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

    // On macOS the window needs a CAMetalLayer, which you ask Objective-C for.
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

## If something fails

| What you see | What it means | What to do |
| --- | --- | --- |
| `Could not find file '.../Gradient.Fragment.glsl'` (or `.gles`, `.spv`, `.wgsl`) | The shader was not compiled with the target of your API, or the viewer runs from another folder. | Run `compile` with the right target and launch the viewer from the folder that contains `MyShaders`. |
| OpenGL: the window is not created | The driver does not offer a 4.1 core context. | Lower the version in `APIVersion` and compile with the matching `glsl`. |
| Vulkan: an exception when creating the instance | There is no Vulkan loader or driver. | Install your graphics card driver, or the Vulkan SDK on macOS. |
| WebGPU: `compile --target wgsl` fails with a shader that has a `sampler2D` | WGSL keeps the texture and the sampler apart, and the GLSL style declares them together. | Write the shader in the WGSL style, with the texture and the sampler apart. |
| A shader with a photo comes out black | The viewer did not find `pez.jpg`. | Put the image inside the folder you run the viewer from. |
| The shader does not see the time or the size | It declares a data block the viewer does not know. | Keep the names of the tutorial: `Context` (width, height, seconds) and `Clock`. |

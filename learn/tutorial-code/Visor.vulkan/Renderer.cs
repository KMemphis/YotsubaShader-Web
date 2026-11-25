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

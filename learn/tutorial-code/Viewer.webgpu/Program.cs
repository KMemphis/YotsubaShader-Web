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

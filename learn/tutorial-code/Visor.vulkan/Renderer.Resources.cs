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

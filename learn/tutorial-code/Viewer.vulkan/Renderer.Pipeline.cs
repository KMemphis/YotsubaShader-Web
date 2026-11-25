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

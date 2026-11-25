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

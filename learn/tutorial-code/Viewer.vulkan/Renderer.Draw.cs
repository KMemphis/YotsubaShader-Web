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

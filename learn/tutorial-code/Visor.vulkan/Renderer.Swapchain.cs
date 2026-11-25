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

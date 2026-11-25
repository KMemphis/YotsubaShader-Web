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

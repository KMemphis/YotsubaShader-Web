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

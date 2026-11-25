using Silk.NET.Input;
using Silk.NET.Maths;
using Silk.NET.Windowing;

string name = args.Length > 0 ? args[0] : "Degradado";

var options = WindowOptions.DefaultVulkan with
{
    Size = new Vector2D<int>(800, 450),
    Title = name,
};

// SDL abre ventanas Vulkan en todos los sistemas.
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

using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;
using MyShaders;
using YotsubaShader;

string name = args.Length > 0 ? args[0] : "Gradient";

using var viewer = new Viewer(name);
viewer.Run();

public class Viewer : Game
{
    private readonly string _name;
    private Effect _shader = null!;

    private readonly ScreenCorner[] _screen =
    [
        new(new Vector2(-1f,  1f), new Vector2(0f, 0f)),
        new(new Vector2( 1f,  1f), new Vector2(1f, 0f)),
        new(new Vector2(-1f, -1f), new Vector2(0f, 1f)),
        new(new Vector2( 1f, -1f), new Vector2(1f, 1f)),
    ];

    public Viewer(string name)
    {
        _name = name;
        var graphics = new GraphicsDeviceManager(this)
        {
            PreferredBackBufferWidth = 800,
            PreferredBackBufferHeight = 450,
        };
        Window.AllowUserResizing = true;
        Window.Title = name;
    }

    protected override void LoadContent()
    {
        MonoGamePlatform gl = MonoGamePlatform.DesktopGL;

        // One line per shader of the tutorial: the name you type after `--`, and its class.
        byte[] compiled = _name switch
        {
            "Gradient" => new Gradient().ToMGFX(gl),
            "Template" => new Template().ToMGFX(gl),
            "Mandelbrot" => new Mandelbrot().ToMGFX(gl),
            "Neon" => new Neon().ToMGFX(gl),
            "Plasma" => new Plasma().ToMGFX(gl),
            "Underwater" => new Underwater().ToMGFX(gl),
            _ => throw new Exception($"The viewer does not know a shader called \"{_name}\". Add it to the switch."),
        };

        _shader = new Effect(GraphicsDevice, compiled);
    }

    protected override void Update(GameTime gameTime)
    {
        if (Keyboard.GetState().IsKeyDown(Keys.Escape))
        {
            Exit();
        }
        base.Update(gameTime);
    }

    protected override void Draw(GameTime gameTime)
    {
        GraphicsDevice.Clear(Color.Black);
        GraphicsDevice.RasterizerState = RasterizerState.CullNone;

        // If your shader declares this data, the viewer hands it over.
        _shader.Parameters["Data_Width"]?.SetValue((float)GraphicsDevice.Viewport.Width);
        _shader.Parameters["Data_Height"]?.SetValue((float)GraphicsDevice.Viewport.Height);
        _shader.Parameters["Data_Seconds"]?.SetValue((float)gameTime.TotalGameTime.TotalSeconds);

        _shader.CurrentTechnique.Passes[0].Apply();
        GraphicsDevice.DrawUserPrimitives(PrimitiveType.TriangleStrip, _screen, 0, 2);

        base.Draw(gameTime);
    }
}

using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;
using MisShaders;
using YotsubaShader;

string nombre = args.Length > 0 ? args[0] : "Degradado";

using var visor = new Visor(nombre);
visor.Run();

public class Visor : Game
{
    private readonly string _nombre;
    private Effect _shader = null!;

    private readonly Esquina[] _pantalla =
    [
        new(new Vector2(-1f,  1f), new Vector2(0f, 0f)),
        new(new Vector2( 1f,  1f), new Vector2(1f, 0f)),
        new(new Vector2(-1f, -1f), new Vector2(0f, 1f)),
        new(new Vector2( 1f, -1f), new Vector2(1f, 1f)),
    ];

    public Visor(string nombre)
    {
        _nombre = nombre;
        var graficos = new GraphicsDeviceManager(this)
        {
            PreferredBackBufferWidth = 800,
            PreferredBackBufferHeight = 450,
        };
        Window.AllowUserResizing = true;
        Window.Title = nombre;
    }

    protected override void LoadContent()
    {
        MonoGamePlatform gl = MonoGamePlatform.DesktopGL;

        // Una línea por cada shader del tutorial: el nombre que escribes tras `--` y su clase.
        byte[] compilado = _nombre switch
        {
            "Degradado" => new Degradado().ToMGFX(gl),
            "Plantilla" => new Plantilla().ToMGFX(gl),
            "Mandelbrot" => new Mandelbrot().ToMGFX(gl),
            "Neon" => new Neon().ToMGFX(gl),
            "Plasma" => new Plasma().ToMGFX(gl),
            "BajoElAgua" => new BajoElAgua().ToMGFX(gl),
            _ => throw new Exception($"El visor no conoce ningún shader llamado \"{_nombre}\". Agrégalo al switch."),
        };

        _shader = new Effect(GraphicsDevice, compilado);
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

        // Si tu shader declara estos datos, el visor se los entrega.
        _shader.Parameters["Datos_Ancho"]?.SetValue((float)GraphicsDevice.Viewport.Width);
        _shader.Parameters["Datos_Alto"]?.SetValue((float)GraphicsDevice.Viewport.Height);
        _shader.Parameters["Datos_Segundos"]?.SetValue((float)gameTime.TotalGameTime.TotalSeconds);

        _shader.CurrentTechnique.Passes[0].Apply();
        GraphicsDevice.DrawUserPrimitives(PrimitiveType.TriangleStrip, _pantalla, 0, 2);

        base.Draw(gameTime);
    }
}

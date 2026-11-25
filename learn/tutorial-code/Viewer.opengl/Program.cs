using Silk.NET.Input;
using Silk.NET.Maths;
using Silk.NET.OpenGL;
using Silk.NET.Windowing;
using StbImageSharp;

string name = args.Length > 0 ? args[0] : "Gradient";
// Shaders that declare only the clock (a Clock with Seconds) read the seconds first; the others read width, height and seconds.
bool clockOnly = name is "Plasma" or "Underwater";

var options = WindowOptions.Default with
{
    Size = new Vector2D<int>(800, 450),
    Title = name,
    API = new GraphicsAPI(ContextAPI.OpenGL, ContextProfile.Core, ContextFlags.ForwardCompatible, new APIVersion(4, 1)),
};

using IWindow window = Window.Create(options);
GL gl = null!;
uint program = 0, vao = 0, data = 0, photo = 0;

window.Load += () =>
{
    gl = window.CreateOpenGL();

    IInputContext input = window.CreateInput();
    foreach (IKeyboard keyboard in input.Keyboards)
    {
        keyboard.KeyDown += (_, key, _) =>
        {
            if (key == Key.Escape) window.Close();
        };
    }

    // The two stages of the shader, as the compiler wrote them.
    string folder = "MyShaders/out/MyShaders";
    uint vertex = Compile(gl, ShaderType.VertexShader, File.ReadAllText($"{folder}/{name}.Vertex.glsl"));
    uint fragment = Compile(gl, ShaderType.FragmentShader, File.ReadAllText($"{folder}/{name}.Fragment.glsl"));
    program = gl.CreateProgram();
    gl.AttachShader(program, vertex);
    gl.AttachShader(program, fragment);
    gl.LinkProgram(program);
    gl.GetProgram(program, ProgramPropertyARB.LinkStatus, out int linked);
    if (linked == 0) throw new Exception(gl.GetProgramInfoLog(program));
    gl.DeleteShader(vertex);
    gl.DeleteShader(fragment);

    // The rectangle: four corners, each with its position (slot 0) and its Uv (slot 1).
    float[] screen =
    {
        -1f,  1f, 0f, 0f,
         1f,  1f, 1f, 0f,
        -1f, -1f, 0f, 1f,
         1f, -1f, 1f, 1f,
    };
    vao = gl.GenVertexArray();
    gl.BindVertexArray(vao);
    uint vbo = gl.GenBuffer();
    gl.BindBuffer(BufferTargetARB.ArrayBuffer, vbo);
    gl.BufferData<float>(BufferTargetARB.ArrayBuffer, screen, BufferUsageARB.StaticDraw);
    unsafe
    {
        gl.EnableVertexAttribArray(0);
        gl.VertexAttribPointer(0, 2, VertexAttribPointerType.Float, false, 16, (void*)0);
        gl.EnableVertexAttribArray(1);
        gl.VertexAttribPointer(1, 2, VertexAttribPointerType.Float, false, 16, (void*)8);
    }

    // The uniform block (width, height, seconds) goes at address 0.
    data = gl.GenBuffer();
    gl.BindBuffer(BufferTargetARB.UniformBuffer, data);
    unsafe { gl.BufferData(BufferTargetARB.UniformBuffer, 16, null, BufferUsageARB.DynamicDraw); }
    gl.BindBufferBase(BufferTargetARB.UniformBuffer, 0, data);
    gl.GetProgram(program, ProgramPropertyARB.ActiveUniformBlocks, out int blocks);
    for (uint block = 0; block < blocks; block++)
    {
        gl.UniformBlockBinding(program, block, 0);
    }

    // The photo for shaders that declare a texture.
    if (File.Exists("pez.jpg"))
    {
        ImageResult image = ImageResult.FromStream(File.OpenRead("pez.jpg"), ColorComponents.RedGreenBlueAlpha);
        photo = gl.GenTexture();
        gl.BindTexture(TextureTarget.Texture2D, photo);
        gl.TexImage2D<byte>(TextureTarget.Texture2D, 0, InternalFormat.Rgba8, (uint)image.Width, (uint)image.Height, 0, PixelFormat.Rgba, PixelType.UnsignedByte, image.Data);
        gl.TexParameter(TextureTarget.Texture2D, TextureParameterName.TextureMinFilter, (int)GLEnum.Linear);
        gl.TexParameter(TextureTarget.Texture2D, TextureParameterName.TextureMagFilter, (int)GLEnum.Linear);
        gl.TexParameter(TextureTarget.Texture2D, TextureParameterName.TextureWrapS, (int)GLEnum.ClampToEdge);
        gl.TexParameter(TextureTarget.Texture2D, TextureParameterName.TextureWrapT, (int)GLEnum.ClampToEdge);
    }
};

window.Resize += size => gl.Viewport(size);

window.Render += _ =>
{
    gl.Clear(ClearBufferMask.ColorBufferBit);
    gl.UseProgram(program);

    // If your shader declares this data, the viewer hands it over.
    float seconds = (float)window.Time;
    float[] values = clockOnly ? [seconds, 0f, 0f, 0f] : [window.FramebufferSize.X, window.FramebufferSize.Y, seconds, 0f];
    gl.BindBuffer(BufferTargetARB.UniformBuffer, data);
    gl.BufferSubData<float>(BufferTargetARB.UniformBuffer, 0, values);

    if (photo != 0)
    {
        gl.ActiveTexture(TextureUnit.Texture0);
        gl.BindTexture(TextureTarget.Texture2D, photo);
    }

    gl.BindVertexArray(vao);
    gl.DrawArrays(PrimitiveType.TriangleStrip, 0, 4);
};

window.Run();

static uint Compile(GL gl, ShaderType type, string source)
{
    uint shader = gl.CreateShader(type);
    gl.ShaderSource(shader, source);
    gl.CompileShader(shader);
    gl.GetShader(shader, ShaderParameterName.CompileStatus, out int ok);
    if (ok == 0) throw new Exception(gl.GetShaderInfoLog(shader));
    return shader;
}

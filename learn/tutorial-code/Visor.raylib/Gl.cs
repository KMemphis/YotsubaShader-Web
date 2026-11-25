using System.Runtime.InteropServices;
using Raylib_cs;

// Las pocas funciones de OpenGL que raylib no envuelve. raylib ya creó el contexto;
// solo le preguntamos dónde están.
public static unsafe class Gl
{
    public const uint UniformBuffer = 0x8A11;
    public const uint DynamicDraw = 0x88E8;
    public const uint ActiveUniformBlocks = 0x8A36;

    private delegate void GenBuffersFn(int n, out uint buffers);
    private delegate void BindBufferFn(uint target, uint buffer);
    private delegate void BufferDataFn(uint target, nint size, float[] data, uint usage);
    private delegate void BindBufferBaseFn(uint target, uint index, uint buffer);
    private delegate void GetProgramFn(uint program, uint name, out int value);
    private delegate void UniformBlockBindingFn(uint program, uint blockIndex, uint binding);

    private static T Load<T>(string name) where T : Delegate
    {
        nint text = Marshal.StringToHGlobalAnsi(name);
        void* address = Rlgl.GetProcAddress((sbyte*)text);
        Marshal.FreeHGlobal(text);
        return Marshal.GetDelegateForFunctionPointer<T>((nint)address);
    }

    private static readonly GenBuffersFn GenBuffersFunction = Load<GenBuffersFn>("glGenBuffers");
    private static readonly BindBufferFn BindBufferFunction = Load<BindBufferFn>("glBindBuffer");
    private static readonly BufferDataFn BufferDataFunction = Load<BufferDataFn>("glBufferData");
    private static readonly BindBufferBaseFn BindBufferBaseFunction = Load<BindBufferBaseFn>("glBindBufferBase");
    private static readonly GetProgramFn GetProgramFunction = Load<GetProgramFn>("glGetProgramiv");
    private static readonly UniformBlockBindingFn UniformBlockBindingFunction = Load<UniformBlockBindingFn>("glUniformBlockBinding");

    public static uint GenBuffer() { GenBuffersFunction(1, out uint id); return id; }
    public static void BindBuffer(uint target, uint buffer) => BindBufferFunction(target, buffer);
    public static void BufferData(uint target, float[] data, uint usage) => BufferDataFunction(target, data.Length * sizeof(float), data, usage);
    public static void BindBufferBase(uint target, uint index, uint buffer) => BindBufferBaseFunction(target, index, buffer);
    public static int GetProgram(uint program, uint name) { GetProgramFunction(program, name, out int value); return value; }
    public static void UniformBlockBinding(uint program, uint block, uint binding) => UniformBlockBindingFunction(program, block, binding);
}

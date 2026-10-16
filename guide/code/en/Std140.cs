using System.Reflection;
using YotsubaShader.Language.Native.Types.Matrix;
using YotsubaShader.Language.Native.Types.Vector;

namespace MyEngine.Graphics;

// Size and alignment of a type in a uniform buffer (std140 rules).
public static class Std140
{
    public static int AlignUp(int value, int alignment)
        => (value + alignment - 1) / alignment * alignment;

    public static (int Size, int Alignment) Measure(Type type)
    {
        if (type == typeof(float) || type == typeof(int) || type == typeof(uint))
            return (4, 4);

        if (type.IsDefined(typeof(VectorAttribute), false))
        {
            int n = Count(type, typeof(VectorComponentAttribute));
            return (n * 4, n == 2 ? 8 : 16);     // a vec3 has size 12, alignment 16
        }

        if (type.IsDefined(typeof(MatrixAttribute), false))
        {
            int columns = Count(type, typeof(MatrixColumnAttribute));
            return (columns * 16, 16);           // every column takes a full vec4
        }

        // A struct: fields in order, each one at its own alignment
        int offset = 0;
        foreach (var field in type.GetFields(BindingFlags.Public | BindingFlags.Instance))
        {
            var (size, alignment) = Measure(field.FieldType);
            offset = AlignUp(offset, alignment) + size;
        }
        return (AlignUp(offset, 16), 16);        // a struct rounds up to 16
    }

    public static int OffsetOf(Type structType, string fieldName)
    {
        int offset = 0;
        foreach (var field in structType.GetFields(BindingFlags.Public | BindingFlags.Instance))
        {
            var (size, alignment) = Measure(field.FieldType);
            offset = AlignUp(offset, alignment);
            if (field.Name == fieldName) return offset;
            offset += size;
        }
        throw new ArgumentException($"No field named '{fieldName}'.");
    }

    private static int Count(Type type, Type attribute)
        => type.GetMembers(BindingFlags.Public | BindingFlags.Instance)
               .Count(m => m.IsDefined(attribute, false));
}

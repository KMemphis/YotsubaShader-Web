namespace MyEngine;

// No puedes poner atributos a System.Numerics.Vector3: no es tu tipo.
// Conserva tu propia struct y convierte en los bordes de tu código.
public partial struct Vector3
{
    public static implicit operator Vector3(System.Numerics.Vector3 v)
    {
        return new Vector3(v.X, v.Y, v.Z);
    }

    public static implicit operator System.Numerics.Vector3(Vector3 v)
    {
        return new System.Numerics.Vector3(v.X, v.Y, v.Z);
    }
}

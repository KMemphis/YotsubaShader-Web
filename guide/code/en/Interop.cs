namespace MyEngine;

// You cannot put attributes on System.Numerics.Vector3: it is not your type.
// Keep your own struct and convert at the edges of your code.
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

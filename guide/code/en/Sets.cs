namespace MyEngine.Shaders;

// One rule for the whole engine: what changes less lives in a lower set.
public static class Sets
{
    public const int Frame = 0;      // once per frame: camera, time, lights
    public const int Material = 1;   // once per material: textures, factors
    public const int Object = 2;     // once per object: world matrix
}

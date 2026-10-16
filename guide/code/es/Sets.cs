namespace MyEngine.Shaders;

// Una regla para todo el motor: lo que cambia menos va en un set más bajo.
public static class Sets
{
    public const int Frame = 0;      // una vez por fotograma: cámara, tiempo, luces
    public const int Material = 1;   // una vez por material: texturas, factores
    public const int Object = 2;     // una vez por objeto: matriz de mundo
}

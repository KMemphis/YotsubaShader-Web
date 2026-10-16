// Dentro de la clase Lit

// Solo CPU: el compilador la ignora
[ShaderIgnore]
public float Brightness
{
    get => Material.Tint.W;
    set
    {
        var material = Material;
        material.Tint.W = value;
        Material = material;
    }
}

[ShaderIgnore]
public void Fade(float factor) => Brightness *= factor;

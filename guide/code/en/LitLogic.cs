// Inside the Lit class

// CPU only: the compiler skips it
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

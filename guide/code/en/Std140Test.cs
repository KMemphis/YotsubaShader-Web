public struct Particle
{
    public Vector3 Position;
    public float Size;
}

public class Std140Tests
{
    [Fact]
    public void A_vec3_takes_12_bytes_and_the_next_float_fills_the_gap()
    {
        Assert.Equal(0, Std140.OffsetOf(typeof(Particle), nameof(Particle.Position)));
        Assert.Equal(12, Std140.OffsetOf(typeof(Particle), nameof(Particle.Size)));
        Assert.Equal(16, Std140.Measure(typeof(Particle)).Size);
    }

    [Fact]
    public void A_matrix_takes_four_full_columns()
    {
        Assert.Equal(64, Std140.Measure(typeof(Matrix4)).Size);
    }
}

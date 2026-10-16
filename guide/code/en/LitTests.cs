public class LitTests
{
    [Fact]
    public void Fade_halves_the_alpha_of_the_tint()
    {
        var lit = new Lit(new FakeParameterSet());
        lit.Brightness = 1;

        lit.Fade(0.5f);

        Assert.Equal(0.5f, lit.Brightness);
    }

    [Fact]
    public void The_material_is_stored_under_its_property_name()
    {
        var parameters = new FakeParameterSet();
        var lit = new Lit(parameters);

        lit.Material = new MaterialData { Roughness = 0.4f };

        Assert.Equal(0.4f, parameters.Get<MaterialData>("Material").Roughness);
    }
}

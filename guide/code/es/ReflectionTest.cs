public class ReflectionTests
{
    [Fact]
    public void Lit_exposes_the_resources_the_engine_expects()
    {
        var names = Lit.Reflection.Resources.Select(r => r.Name).ToHashSet();

        Assert.Contains("Frame", names);
        Assert.Contains("Material", names);
        Assert.Contains("Albedo", names);
    }
}

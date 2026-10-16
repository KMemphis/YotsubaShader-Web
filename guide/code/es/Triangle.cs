public partial class Triangle
{
    [ShaderStage(Stage.Vertex)]
    public VertexOutput Vertex([SV_VertexID] uint id) { /* ... */ }

    [ShaderStage(Stage.Fragment)]
    public Vector4 Fragment(VertexOutput input) { /* ... */ }
}

var device = window.CreateDevice(GraphicsApi.Vulkan);

var program = ShaderProgram.Load<Lit>(device);
var lit = new Lit(program.Parameters);

lit.Frame = new FrameData { ViewProjection = camera.ViewProjection, Time = time };
lit.Material = new MaterialData { Tint = new Vector4(1, 1, 1, 1), Roughness = 0.4f };
lit.Albedo = assets.Load<Texture2D>("brick.png");

lit.Material = "rough";   // error CS0029: No se puede convertir implícitamente el tipo 'string' en 'MaterialData'

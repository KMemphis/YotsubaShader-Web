float4 main([[vk::builtin("BaseInstance")]] int bi : BASEINSTANCE) : SV_Position { return float4(float(bi), 0, 0, 1); }

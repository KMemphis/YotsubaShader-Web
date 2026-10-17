float4 main([[vk::builtin("BaseVertex")]] int bv : BASEVERTEX) : SV_Position { return float4(float(bv), 0, 0, 1); }

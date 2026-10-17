float4 main(bool ff : SV_IsFrontFace) : SV_Target { return ff ? float4(1, 0, 0, 1) : float4(0, 0, 1, 1); }

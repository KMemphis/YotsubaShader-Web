float4 main(uint id : SV_PrimitiveID) : SV_Target { return float4(float(id), 0, 0, 1); }

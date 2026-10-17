float4 main(float3 b : SV_Barycentrics) : SV_Target { return float4(b, 1); }

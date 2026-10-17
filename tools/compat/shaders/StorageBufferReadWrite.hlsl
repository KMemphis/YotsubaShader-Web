RWStructuredBuffer<uint> data : register(u0);
float4 main() : SV_Target { data[0] = data[1] + 1u; return float4(1, 0, 0, 1); }

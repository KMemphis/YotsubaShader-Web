StructuredBuffer<float4> data : register(t0);
float4 main() : SV_Target { return data[0]; }

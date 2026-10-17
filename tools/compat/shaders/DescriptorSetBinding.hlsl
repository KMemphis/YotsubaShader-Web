[[vk::binding(2, 1)]] cbuffer Params { float4 tint; };
float4 main() : SV_Target { return tint; }

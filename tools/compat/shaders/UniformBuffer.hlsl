cbuffer Params : register(b0) { float4 tint; };
float4 main() : SV_Target { return tint; }

cbuffer Params : register(b0) { double a; double b; };
float4 main() : SV_Target { double c = a * b + a; return float4(float(c), 0, 0, 1); }

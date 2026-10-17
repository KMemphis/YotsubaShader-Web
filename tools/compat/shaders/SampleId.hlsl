float4 main(uint s : SV_SampleIndex) : SV_Target { return float4(float(s), 0, 0, 1); }

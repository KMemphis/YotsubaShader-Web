struct PSOut { float4 color : SV_Target; uint mask : SV_Coverage; };
PSOut main(uint cov : SV_Coverage) { PSOut o; o.color = float4(1, 0, 0, 1); o.mask = cov & 1u; return o; }

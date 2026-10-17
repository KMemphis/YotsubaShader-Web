struct VSOut { float4 pos : SV_Position; };
VSOut main(float4 p : POSITION) { VSOut o; o.pos = p; return o; }

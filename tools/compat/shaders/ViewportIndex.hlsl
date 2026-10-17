struct VSOut { float4 pos : SV_Position; uint vp : SV_ViewportArrayIndex; };
VSOut main(float4 p : POSITION) { VSOut o; o.pos = p; o.vp = 1; return o; }

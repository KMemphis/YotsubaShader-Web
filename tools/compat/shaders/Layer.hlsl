struct VSOut { float4 pos : SV_Position; uint layer : SV_RenderTargetArrayIndex; };
VSOut main(float4 p : POSITION) { VSOut o; o.pos = p; o.layer = 1; return o; }

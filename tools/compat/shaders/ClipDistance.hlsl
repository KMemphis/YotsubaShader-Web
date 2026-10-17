struct VSOut { float4 pos : SV_Position; float clip : SV_ClipDistance0; };
VSOut main(float4 p : POSITION) { VSOut o; o.pos = p; o.clip = p.x; return o; }

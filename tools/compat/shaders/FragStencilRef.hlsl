uint main(float4 pos : SV_Position) : SV_StencilRef { return uint(pos.x) & 0xff; }

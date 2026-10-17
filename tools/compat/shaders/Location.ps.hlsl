float4 main([[vk::location(1)]] float2 uv : TEXCOORD0) : SV_Target { return float4(uv, 0, 1); }

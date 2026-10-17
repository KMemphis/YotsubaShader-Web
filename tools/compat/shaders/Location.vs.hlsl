struct VSOut { float4 pos : SV_Position; [[vk::location(1)]] float2 uv : TEXCOORD0; };
VSOut main([[vk::location(0)]] float4 p : POSITION, [[vk::location(3)]] float2 uv : TEXCOORD0) { VSOut o; o.pos = p; o.uv = uv; return o; }

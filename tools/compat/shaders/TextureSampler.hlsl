[[vk::binding(0, 0)]] Texture2D<float4> tex : register(t0);
[[vk::binding(1, 0)]] SamplerState smp : register(s0);
float4 main(float2 uv : TEXCOORD0) : SV_Target { return tex.Sample(smp, uv); }

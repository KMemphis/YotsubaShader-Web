RWStructuredBuffer<uint> result : register(u0);
[numthreads(64, 1, 1)]
void main(uint3 tid : SV_GroupThreadID) { result[tid.x] = WaveGetLaneIndex(); }

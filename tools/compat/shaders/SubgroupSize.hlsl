RWStructuredBuffer<uint> result : register(u0);
[numthreads(64, 1, 1)]
void main() { result[0] = WaveGetLaneCount(); }

RWStructuredBuffer<uint> result : register(u0);
[numthreads(1, 1, 1)]
void main(uint v : SV_GroupIndex) { result[0] = v; }

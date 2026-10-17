RWStructuredBuffer<uint4> result : register(u0);
[numthreads(1, 1, 1)]
void main(uint3 v : SV_GroupID) { result[0] = uint4(v, 0); }

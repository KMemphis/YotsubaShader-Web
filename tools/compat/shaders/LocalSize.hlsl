RWStructuredBuffer<uint> result : register(u0);
[numthreads(8, 4, 2)]
void main() { result[0] = 1u; }

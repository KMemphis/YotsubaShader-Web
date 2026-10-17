float4 main(uint iid : SV_InstanceID) : SV_Position { return float4(float(iid), 0, 0, 1); }

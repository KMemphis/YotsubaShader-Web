struct Pixel
{
    float4 Position;
    float4 Color;
};

static float4 pixel_Color;
static float4 _return;

struct SPIRV_Cross_Input
{
    float4 pixel_Color : TEXCOORD0;
};

struct SPIRV_Cross_Output
{
    float4 _return : SV_Target0;
};

void Fragment_inner()
{
    _return = pixel_Color;
}

SPIRV_Cross_Output Fragment(SPIRV_Cross_Input stage_input)
{
    pixel_Color = stage_input.pixel_Color;
    Fragment_inner();
    SPIRV_Cross_Output stage_output;
    stage_output._return = _return;
    return stage_output;
}

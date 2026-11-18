struct Pixel
{
    float4 Position;
    float4 Color;
};

static float4 gl_Position;
static float2 corner_Position;
static float4 corner_Color;
static float4 _return_Color;

struct SPIRV_Cross_Input
{
    float2 corner_Position : POSITION;
    float4 corner_Color : COLOR0;
};

struct SPIRV_Cross_Output
{
    float4 _return_Color : TEXCOORD0;
    float4 gl_Position : SV_Position;
};

float4 Vec4(float x, float y, float z, float w)
{
    float4 v;
    v.x = x;
    v.y = y;
    v.z = z;
    v.w = w;
    return v;
}

void Vertex_inner()
{
    Pixel pixel;
    pixel.Position = Vec4(corner_Position.x, corner_Position.y, 0.0f, 1.0f);
    pixel.Color = corner_Color;
    gl_Position = pixel.Position;
    _return_Color = pixel.Color;
}

SPIRV_Cross_Output Vertex(SPIRV_Cross_Input stage_input)
{
    corner_Position = stage_input.corner_Position;
    corner_Color = stage_input.corner_Color;
    Vertex_inner();
    SPIRV_Cross_Output stage_output;
    stage_output.gl_Position = gl_Position;
    stage_output._return_Color = _return_Color;
    return stage_output;
}

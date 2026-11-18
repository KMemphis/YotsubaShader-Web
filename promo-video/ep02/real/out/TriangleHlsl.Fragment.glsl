#version 450

struct Pixel
{
    vec4 Position;
    vec4 Color;
};

layout(location = 0) in vec4 pixel_Color;
layout(location = 0) out vec4 _return;

void main()
{
    _return = pixel_Color;
}


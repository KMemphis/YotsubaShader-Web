#version 450
layout(location = 0) out vec4 color;
void main() { color = gl_HelperInvocation ? vec4(1.0) : vec4(0.0); }

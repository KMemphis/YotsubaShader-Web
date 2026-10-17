// Output targets of the compiler: graphics API, the shader format it consumes, and how real the backend is.
// Logos are used only where the owner publishes them for reference (Khronos, W3C). Metal and Direct3D are
// shown by name: Apple and Microsoft do not license their logos to third parties.

export const BACKENDS = [
  { id: 'vulkan', name: 'Vulkan', format: 'SPIR-V', logo: '/img/backends/vulkan.svg', ratio: 1300 / 500 },
  { id: 'd3d', name: 'Direct3D 11 / 12', format: 'HLSL', logo: null },
  { id: 'metal', name: 'Metal', format: 'MSL', logo: null },
  { id: 'webgpu', name: 'WebGPU', format: 'WGSL', logo: '/img/backends/webgpu.svg', ratio: 768 / 600, iconOnly: true },
  { id: 'opengl', name: 'OpenGL', format: 'GLSL', logo: '/img/backends/opengl.svg', ratio: 1200 / 500 },
  { id: 'webgl', name: 'WebGL', format: 'GLSL ES', logo: '/img/backends/webgl.svg', ratio: 1200 / 500 },
];

export const SPIRV_LOGO = { src: '/img/backends/spirv.svg', ratio: 1500 / 500 };

export const STYLE_INPUTS = ['HLSL', 'GLSL', 'MSL', 'SPIR-V', 'WGSL'];

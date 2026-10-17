// Concept manifest for the compatibility harness.
//
// Each concept is one tiny shader (or two, for interface rows) in ./shaders.
// `.hlsl` files are compiled with dxc to SPIR-V; `.vert/.frag/.comp` files are
// Vulkan GLSL compiled with glslangValidator (used only where HLSL cannot spell
// the concept).
//
// `expect` lists patterns that a translated output must still contain, per
// output language (glsl = OpenGL 4.5, essl = GLSL ES 3.00, hlsl, msl, wgsl).
// Output that compiles but lacks them is reported as "dropped": the translator
// silently lost the concept. Languages that cannot spell the concept in source
// (e.g. Metal workgroup size, ES 3.00 varying locations) have no entry.

const hlsl = (file, stage, expect) => ({ file, stage, frontend: 'hlsl', dxcArgs: [], expect });
const glsl = (file, stage, expect) => ({ file, stage, frontend: 'glsl', expect });

export const CONCEPTS = [
  // Vertex built-ins
  { id: 'Position', group: 'vertex', shaders: [hlsl('Position.hlsl', 'vert')] },
  { id: 'VertexIndex', group: 'vertex', shaders: [hlsl('VertexIndex.hlsl', 'vert')] },
  { id: 'InstanceIndex', group: 'vertex', shaders: [hlsl('InstanceIndex.hlsl', 'vert')] },
  { id: 'BaseVertex', group: 'vertex', shaders: [hlsl('BaseVertex.hlsl', 'vert')] },
  { id: 'BaseInstance', group: 'vertex', shaders: [hlsl('BaseInstance.hlsl', 'vert')] },
  { id: 'ClipDistance', group: 'vertex', shaders: [hlsl('ClipDistance.hlsl', 'vert')] },
  { id: 'Layer', group: 'vertex', shaders: [hlsl('Layer.hlsl', 'vert')] },
  { id: 'ViewportIndex', group: 'vertex', shaders: [hlsl('ViewportIndex.hlsl', 'vert')] },

  // Fragment built-ins
  { id: 'FragCoord', group: 'fragment', shaders: [hlsl('FragCoord.hlsl', 'frag')] },
  { id: 'PrimitiveId', group: 'fragment', shaders: [hlsl('PrimitiveId.hlsl', 'frag')] },
  { id: 'FrontFacing', group: 'fragment', shaders: [hlsl('FrontFacing.hlsl', 'frag')] },
  { id: 'FragDepth', group: 'fragment', shaders: [hlsl('FragDepth.hlsl', 'frag')] },
  { id: 'FragStencilRef', group: 'fragment', shaders: [hlsl('FragStencilRef.hlsl', 'frag')] },
  { id: 'SampleId', group: 'fragment', shaders: [hlsl('SampleId.hlsl', 'frag')] },
  { id: 'SampleMask', group: 'fragment', shaders: [hlsl('SampleMask.hlsl', 'frag')] },
  { id: 'SamplePosition', group: 'fragment', shaders: [glsl('SamplePosition.frag', 'frag')] },
  { id: 'HelperInvocation', group: 'fragment', shaders: [glsl('HelperInvocation.frag', 'frag')] },
  { id: 'BaryCoord', group: 'fragment', shaders: [hlsl('BaryCoord.hlsl', 'frag')] },
  { id: 'BaryCoordNoPerspective', group: 'fragment', shaders: [glsl('BaryCoordNoPerspective.frag', 'frag')] },
  {
    id: 'ConservativeDepth',
    group: 'fragment',
    shaders: [
      hlsl('ConservativeDepth.hlsl', 'frag', {
        glsl: ['depth_greater'],
        essl: ['depth_greater'],
        hlsl: ['SV_DepthGreaterEqual'],
        msl: ['depth\\(greater\\)'],
        wgsl: ['early_depth_test\\(greater_equal\\)'],
      }),
    ],
  },

  // Compute built-ins
  { id: 'GlobalInvocationId', group: 'compute', shaders: [hlsl('GlobalInvocationId.hlsl', 'comp')] },
  { id: 'LocalInvocationId', group: 'compute', shaders: [hlsl('LocalInvocationId.hlsl', 'comp')] },
  { id: 'LocalInvocationIndex', group: 'compute', shaders: [hlsl('LocalInvocationIndex.hlsl', 'comp')] },
  { id: 'WorkgroupId', group: 'compute', shaders: [hlsl('WorkgroupId.hlsl', 'comp')] },
  { id: 'NumWorkgroups', group: 'compute', shaders: [glsl('NumWorkgroups.comp', 'comp')] },
  { id: 'WorkgroupSize', group: 'compute', shaders: [glsl('WorkgroupSize.comp', 'comp')] },
  {
    id: 'LocalSize',
    group: 'compute',
    shaders: [
      hlsl('LocalSize.hlsl', 'comp', {
        glsl: ['local_size_x\\s*=\\s*8,\\s*local_size_y\\s*=\\s*4,\\s*local_size_z\\s*=\\s*2'],
        hlsl: ['numthreads\\(8,\\s*4,\\s*2\\)'],
        wgsl: ['@workgroup_size\\(8,\\s*4,\\s*2\\)'],
      }),
    ],
  },

  // Subgroup built-ins
  { id: 'SubgroupSize', group: 'subgroup', shaders: [hlsl('SubgroupSize.hlsl', 'comp')] },
  { id: 'SubgroupInvocationId', group: 'subgroup', shaders: [hlsl('SubgroupInvocationId.hlsl', 'comp')] },
  { id: 'SubgroupId', group: 'subgroup', shaders: [glsl('SubgroupId.comp', 'comp')] },
  { id: 'NumSubgroups', group: 'subgroup', shaders: [glsl('NumSubgroups.comp', 'comp')] },

  // Stage interface
  {
    id: 'Location',
    group: 'interface',
    shaders: [
      hlsl('Location.vs.hlsl', 'vert', {
        glsl: ['location\\s*=\\s*0', 'location\\s*=\\s*3', 'location\\s*=\\s*1'],
        essl: ['location\\s*=\\s*0', 'location\\s*=\\s*3'],
        hlsl: ['(TEXCOORD|LOC)3\\b', '(TEXCOORD|LOC)1\\b'],
        msl: ['attribute\\(0\\)', 'attribute\\(3\\)', 'user\\(locn?1\\)'],
        wgsl: ['@location\\(0\\)', '@location\\(3\\)', '@location\\(1\\)'],
      }),
      hlsl('Location.ps.hlsl', 'frag', {
        glsl: ['location\\s*=\\s*1'],
        hlsl: ['(TEXCOORD|LOC)1\\b'],
        msl: ['user\\(locn?1\\)'],
        wgsl: ['@location\\(1\\)'],
      }),
    ],
  },

  // Resources
  { id: 'UniformBuffer', group: 'resource', shaders: [hlsl('UniformBuffer.hlsl', 'frag')] },
  { id: 'StorageBufferReadOnly', group: 'resource', shaders: [hlsl('StorageBufferReadOnly.hlsl', 'frag')] },
  { id: 'StorageBufferReadWrite', group: 'resource', shaders: [hlsl('StorageBufferReadWrite.hlsl', 'frag')] },
  { id: 'TextureSampler', group: 'resource', shaders: [hlsl('TextureSampler.hlsl', 'frag')] },
  {
    id: 'DescriptorSetBinding',
    group: 'resource',
    // Metal and GLSL ES 3.00 have no in-source equivalent of set 1 / binding 2.
    shaders: [
      hlsl('DescriptorSetBinding.hlsl', 'frag', {
        glsl: ['binding\\s*=\\s*2'],
        hlsl: ['register\\(b2,\\s*space1\\)'],
        wgsl: ['@group\\(1\\)\\s*@binding\\(2\\)'],
      }),
    ],
  },

  // Types
  { id: 'Double', group: 'type', shaders: [hlsl('Double.hlsl', 'frag')] },

  // Stages
  { id: 'VertexStage', group: 'stage', shaders: [hlsl('VertexStage.hlsl', 'vert')] },
  { id: 'FragmentStage', group: 'stage', shaders: [hlsl('FragmentStage.hlsl', 'frag')] },
  { id: 'ComputeStage', group: 'stage', shaders: [hlsl('ComputeStage.hlsl', 'comp')] },
];

// Reads the attribute vocabularies straight from YotsubaShader.Language (read-only) so the
// reference pages never drift away from the source. If the folder is missing the site still
// builds; the reference pages just show the curated cross-style table.

import fs from 'node:fs';
import path from 'node:path';

export const STYLE_META = {
  hlsl: {
    dir: 'HlslStyle',
    name: 'HLSL-style',
    namespace: 'YotsubaShader.Language.Attributes.HlslStyle',
    inspired: 'HLSL (Direct3D)',
    summary: 'System-value semantics such as SV_Position and numthreads, plus cbuffer and register for resources.',
  },
  glsl: {
    dir: 'GlslStyle',
    name: 'GLSL-style',
    namespace: 'YotsubaShader.Language.Attributes.GlslStyle',
    inspired: 'GLSL (OpenGL / Vulkan GLSL)',
    summary: 'gl_* built-ins, layout(set, binding), uniform and buffer.',
  },
  metal: {
    dir: 'MetalStyle',
    name: 'Metal-style',
    namespace: 'YotsubaShader.Language.Attributes.MetalStyle',
    inspired: 'Metal Shading Language',
    summary: 'Attribute names from MSL such as position, vertex_id and thread_position_in_grid, plus buffer(n), texture(n) and sampler(n).',
  },
  vulkan: {
    dir: 'VulkanStyle',
    name: 'Vulkan-style',
    namespace: 'YotsubaShader.Language.Attributes.VulkanStyle',
    inspired: 'Vulkan / SPIR-V',
    summary: 'SPIR-V BuiltIn names (BuiltIn_Position), DescriptorSet and Binding.',
  },
  wgsl: {
    dir: 'WgslStyle',
    name: 'WGSL-style',
    namespace: 'YotsubaShader.Language.Attributes.WgslStyle',
    inspired: 'WGSL (WebGPU)',
    summary: 'The @builtin(...), @group and @binding vocabulary of WebGPU, written with @ identifiers that remain valid C#.',
  },
};

const KIND_ORDER = ['Input', 'Output', 'Input / Output', 'Method', 'Resource', 'Type'];

function usageKind(text) {
  if (/InputOutput/.test(text)) return 'Input / Output';
  if (/AttributeUsagesTable\.Input/.test(text)) return 'Input';
  if (/AttributeUsagesTable\.Output/.test(text)) return 'Output';
  if (/AttributeUsagesTable\.Method|AttributeTargets\.Method/.test(text)) return 'Method';
  if (/AttributeUsagesTable\.Resource/.test(text)) return 'Resource';
  return 'Input';
}

function scanFile(file) {
  const src = fs.readFileSync(file, 'utf8');
  const out = [];
  const typeRe = /public\s+(?:sealed\s+)?(class|struct|enum)\s+(@?\w+)(<[\w, ]+>)?\s*(?:\(([^)]*)\))?/g;
  for (const m of src.matchAll(typeRe)) {
    const [, form, name, generic = '', primary] = m;
    const before = src.slice(Math.max(0, m.index - 260), m.index);
    const usage = [...before.matchAll(/AttributeUsage\(([^)]*)\)/g)].pop();
    const isAttribute = /:\s*Attribute/.test(src.slice(m.index, m.index + 160)) || (form === 'class' && !!usage);
    let params = primary ? primary.trim() : '';
    if (!params && isAttribute) {
      const ctor = new RegExp(`public\\s+${name.replace('@', '@?')}\\s*\\(([^)]*)\\)`).exec(src);
      if (ctor) params = ctor[1].trim().replace(/\s+/g, ' ');
    }
    out.push({
      name,
      display: name + generic,
      form,
      attribute: isAttribute,
      params,
      kind: isAttribute ? usageKind(usage ? usage[1] : '') : 'Type',
    });
  }
  return out;
}

/** @returns {Record<string, {items: any[], total: number}>} */
export function scanStyles(languageDir) {
  const result = {};
  for (const [id, meta] of Object.entries(STYLE_META)) {
    const root = path.join(languageDir, 'StylesAttributes', meta.dir);
    const items = [];
    if (fs.existsSync(root)) {
      const walk = (dir) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) walk(full);
          else if (entry.name.endsWith('.cs')) {
            const resource = /Resour?ces$/.test(path.basename(dir));
            for (const item of scanFile(full)) {
              if (resource && item.attribute) item.kind = 'Resource';
              // Files named "@builtin_x.cs" declare "builtin_x"; users write it with the @ prefix.
              if (path.basename(full).startsWith('@') && !item.name.startsWith('@') && item.attribute) {
                item.name = '@' + item.name;
                item.display = '@' + item.display;
              }
              items.push(item);
            }
          }
        }
      };
      walk(root);
    }
    items.sort(
      (a, b) =>
        KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) ||
        a.name.replace('@', '').localeCompare(b.name.replace('@', ''), 'en', { sensitivity: 'base' }),
    );
    result[id] = { items, total: items.filter((i) => i.attribute).length };
  }
  return result;
}

const NONE = '<span class="muted">—</span>';
const c = (s) => (s ? `<code>${s}</code>` : NONE);

/** Curated cross-style equivalence of the built-in values (checked against the attribute files). */
export const BUILTIN_MAP = [
  ['Vertex stage', null],
  ['Clip-space position (vertex output)', 'SV_Position', 'gl_Position', 'position', 'BuiltIn_Position', '@builtin_position'],
  ['Vertex index', 'SV_VertexID', 'gl_VertexIndex', 'vertex_id', 'BuiltIn_VertexIndex', '@builtin_vertex_index'],
  ['Instance index', 'SV_InstanceID', 'gl_InstanceIndex', 'instance_id', 'BuiltIn_InstanceIndex', '@builtin_instance_index'],
  ['Base vertex', 'SV_StartVertexLocation', 'gl_BaseVertex', 'base_vertex', 'BuiltIn_BaseVertex', ''],
  ['Base instance', 'SV_StartInstanceLocation', 'gl_BaseInstance', 'base_instance', 'BuiltIn_BaseInstance', ''],
  ['Clip distance', 'SV_ClipDistanceN', 'gl_ClipDistance', 'clip_distance', 'BuiltIn_ClipDistance', '@builtin_clip_distances'],
  ['Render target layer', 'SV_RenderTargetArrayIndex', 'gl_Layer', 'render_target_array_index', 'BuiltIn_Layer', ''],
  ['Viewport index', 'SV_ViewportArrayIndex', 'gl_ViewportIndex', 'viewport_array_index', 'BuiltIn_ViewportIndex', ''],
  ['Fragment stage', null],
  ['Fragment coordinate', 'SV_Position', 'gl_FragCoord', 'position', 'BuiltIn_FragCoord', '@builtin_position'],
  ['Front-facing flag', 'SV_IsFrontFace', 'gl_FrontFacing', 'front_facing', 'BuiltIn_FrontFacing', '@builtin_front_facing'],
  ['Fragment depth (output)', 'SV_Depth', 'gl_FragDepth', 'depth', 'BuiltIn_FragDepth', '@builtin_frag_depth'],
  ['Conservative depth', 'SV_DepthGreaterEqual / SV_DepthLessEqual', '', '', '', ''],
  ['Stencil reference (output)', 'SV_StencilRef', 'gl_FragStencilRefARB', 'stencil', 'BuiltIn_FragStencilRef', ''],
  ['Sample index', 'SV_SampleIndex', 'gl_SampleID', 'sample_id', 'BuiltIn_SampleId', '@builtin_sample_index'],
  ['Sample mask', 'SV_Coverage', 'gl_SampleMask', 'sample_mask', 'BuiltIn_SampleMask', '@builtin_sample_mask'],
  ['Primitive index', 'SV_PrimitiveID', 'gl_PrimitiveID', 'primitive_id', 'BuiltIn_PrimitiveId', '@builtin_primitive_index'],
  ['Barycentric coordinates', 'SV_Barycentrics', 'gl_BaryCoordEXT', 'barycentric_coord', 'BuiltIn_BaryCoord', ''],
  ['Helper invocation', '', 'gl_HelperInvocation', '', 'BuiltIn_HelperInvocation', ''],
  ['Sample position', '', 'gl_SamplePosition', '', 'BuiltIn_SamplePosition', ''],
  ['Compute stage', null],
  ['Global invocation id', 'SV_DispatchThreadID', 'gl_GlobalInvocationID', 'thread_position_in_grid', 'BuiltIn_GlobalInvocationId', '@builtin_global_invocation_id'],
  ['Local invocation id', 'SV_GroupThreadID', 'gl_LocalInvocationID', 'thread_position_in_threadgroup', 'BuiltIn_LocalInvocationId', '@builtin_local_invocation_id'],
  ['Local invocation index', 'SV_GroupIndex', 'gl_LocalInvocationIndex', 'thread_index_in_threadgroup', 'BuiltIn_LocalInvocationIndex', '@builtin_local_invocation_index'],
  ['Workgroup id', 'SV_GroupID', 'gl_WorkGroupID', 'threadgroup_position_in_grid', 'BuiltIn_WorkgroupId', '@builtin_workgroup_id'],
  ['Number of workgroups', '', 'gl_NumWorkGroups', 'threadgroups_per_grid', 'BuiltIn_NumWorkgroups', '@builtin_num_workgroups'],
  ['Workgroup size (method attribute)', 'numthreads', 'layout_local_size', '', '', '@workgroup_size'],
  ['Workgroup size (built-in value)', '', 'gl_WorkGroupSize', 'threads_per_threadgroup', 'BuiltIn_WorkgroupSize', ''],
  ['Subgroup size', '', 'gl_SubgroupSize', 'threads_per_simdgroup', 'BuiltIn_SubgroupSize', '@builtin_subgroup_size'],
  ['Subgroup invocation id', '', 'gl_SubgroupInvocationID', 'thread_index_in_simdgroup', 'BuiltIn_SubgroupInvocationId', '@builtin_subgroup_invocation_id'],
  ['Subgroup id', '', 'gl_SubgroupID', 'simdgroup_index_in_threadgroup', 'BuiltIn_SubgroupId', '@builtin_subgroup_id'],
  ['Number of subgroups', '', 'gl_NumSubgroups', 'simdgroups_per_threadgroup', 'BuiltIn_NumSubgroups', '@builtin_num_subgroups'],
];

export const RESOURCE_MAP = [
  ['Uniform buffer', 'cbuffer, ConstantBuffer&lt;T&gt;', 'uniform', 'constant', 'Uniform', 'uniform'],
  ['Read/write storage buffer', 'RWStructuredBuffer&lt;T&gt;', 'buffer', 'device', 'StorageBuffer', 'storage(storage_use.read_write)'],
  ['Read-only storage buffer', 'StructuredBuffer&lt;T&gt;', 'buffer', 'device(readOnly: true)', 'StorageBuffer', 'storage(storage_use.read)'],
  ['Binding slot', 'register(RegisterPrefix.b, n)', 'layout(set, binding)', 'buffer(n), texture(n), sampler(n)', 'DescriptorSet(s) + Binding(n)', '@group(s) + @binding(n)'],
];

export function builtinMapTable() {
  const head = ['Concept', 'HLSL', 'GLSL', 'Metal', 'Vulkan', 'WGSL'];
  let html = '<div class="table-wrap"><table class="table table--map"><thead><tr>';
  html += head.map((h) => `<th scope="col">${h}</th>`).join('');
  html += '</tr></thead><tbody>';
  for (const row of BUILTIN_MAP) {
    if (row[1] === null) {
      html += `<tr class="group-row"><th colspan="6" scope="colgroup">${row[0]}</th></tr>`;
      continue;
    }
    html += `<tr><th scope="row">${row[0]}</th>${row
      .slice(1)
      .map((v) => `<td>${c(v)}</td>`)
      .join('')}</tr>`;
  }
  return html + '</tbody></table></div>';
}

export function resourceMapTable() {
  const head = ['Concept', 'HLSL', 'GLSL', 'Metal', 'Vulkan', 'WGSL'];
  let html = '<div class="table-wrap"><table class="table table--map"><thead><tr>';
  html += head.map((h) => `<th scope="col">${h}</th>`).join('');
  html += '</tr></thead><tbody>';
  for (const row of RESOURCE_MAP) {
    html += `<tr><th scope="row">${row[0]}</th>${row
      .slice(1)
      .map((v) => `<td>${c(v)}</td>`)
      .join('')}</tr>`;
  }
  return html + '</tbody></table></div>';
}

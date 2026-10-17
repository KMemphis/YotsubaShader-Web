#import "../template.typ": *

= Los cinco paquetes de sintaxis

#ref-table(columns: (0.8fr, 1.6fr, 2fr, 1.6fr, 0.7fr), header: ("Sintaxis", "Paquete y namespace", "Namespace de recursos", "Inspirada en", "Atributos"),
  [*HLSL*], [#c("YotsubaShader.HlslSyntax")], [#c("YotsubaShader.HlslSyntax.Resources")], text(size: 7.2pt)[#"HLSL (Direct3D)"], text(size: 7.2pt)[#"24"],
  [*GLSL*], [#c("YotsubaShader.GlslSyntax")], [#c("YotsubaShader.GlslSyntax.Resources")], text(size: 7.2pt)[#"GLSL (OpenGL / GLSL de Vulkan)"], text(size: 7.2pt)[#"34"],
  [*MSL*], [#c("YotsubaShader.MslSyntax")], [#c("YotsubaShader.MslSyntax.Resources")], text(size: 7.2pt)[#"Metal Shading Language"], text(size: 7.2pt)[#"30"],
  [*SPIR-V*], [#c("YotsubaShader.SpirvSyntax")], [#c("YotsubaShader.SpirvSyntax.Resources")], text(size: 7.2pt)[#"SPIR-V (Vulkan)"], text(size: 7.2pt)[#"33"],
  [*WGSL*], [#c("YotsubaShader.WgslSyntax")], [#c("YotsubaShader.WgslSyntax.Resources")], text(size: 7.2pt)[#"WGSL (WebGPU)"], text(size: 7.2pt)[#"23"],
)

= Núcleo neutro: YotsubaShader.Language

#text(size: 8.5pt)[#"Estos atributos son los mismos en todas las sintaxis. Los motores y frameworks se apoyan en este núcleo; cada paquete de sintaxis solo añade nombres."]

#ref-table(columns: (2fr, 2fr), header: ("Concepto", "Atributo"),
  text(size: 7.2pt)[#"Ubicación de interfaz (entradas de vértice, varyings, salidas de fragmento)"], [#c("[Location(n)]")],
  text(size: 7.2pt)[#"Uniform buffer (forma neutra)"], [#c("[Uniform]")],
  text(size: 7.2pt)[#"Storage buffer (forma neutra)"], [#c("[StorageBuffer]")],
  text(size: 7.2pt)[#"Set y binding (forma neutra)"], [#c("[Binding(set, binding)]")],
  text(size: 7.2pt)[#"Etapa de shader de un método"], [#c("[ShaderStage(Stage.Vertex | Fragment | Compute)]")],
)

= Valores integrados

#ref-table(columns: (1.7fr, 1.35fr, 1.35fr, 1.35fr, 1.35fr, 1.35fr), header: ("Concepto", "HLSL", "GLSL", "MSL", "SPIR-V", "WGSL"),
  group-row(6, "Etapa vertex"),
  text(size: 7.2pt)[#"Posición en clip space (salida del vertex)"], [#c("SV_Position")], [#c("gl_Position")], [#c("position")], [#c("BuiltIn_Position")], [#c("@builtin_position")],
  text(size: 7.2pt)[#"Índice de vértice"], [#c("SV_VertexID")], [#c("gl_VertexIndex")], [#c("vertex_id")], [#c("BuiltIn_VertexIndex")], [#c("@builtin_vertex_index")],
  text(size: 7.2pt)[#"Índice de instancia"], [#c("SV_InstanceID")], [#c("gl_InstanceIndex")], [#c("instance_id")], [#c("BuiltIn_InstanceIndex")], [#c("@builtin_instance_index")],
  text(size: 7.2pt)[#"Vértice base"], [#c("SV_StartVertexLocation")], [#c("gl_BaseVertex")], [#c("base_vertex")], [#c("BuiltIn_BaseVertex")], [#none-cell],
  text(size: 7.2pt)[#"Instancia base"], [#c("SV_StartInstanceLocation")], [#c("gl_BaseInstance")], [#c("base_instance")], [#c("BuiltIn_BaseInstance")], [#none-cell],
  text(size: 7.2pt)[#"Distancia de recorte"], [#c("SV_ClipDistanceN")], [#c("gl_ClipDistance")], [#c("clip_distance")], [#c("BuiltIn_ClipDistance")], [#c("@builtin_clip_distances")],
  text(size: 7.2pt)[#"Capa del render target"], [#c("SV_RenderTargetArrayIndex")], [#c("gl_Layer")], [#c("render_target_array_index")], [#c("BuiltIn_Layer")], [#none-cell],
  text(size: 7.2pt)[#"Índice de viewport"], [#c("SV_ViewportArrayIndex")], [#c("gl_ViewportIndex")], [#c("viewport_array_index")], [#c("BuiltIn_ViewportIndex")], [#none-cell],
  group-row(6, "Etapa fragment"),
  text(size: 7.2pt)[#"Coordenada del fragmento"], [#c("SV_Position")], [#c("gl_FragCoord")], [#c("position")], [#c("BuiltIn_FragCoord")], [#c("@builtin_position")],
  text(size: 7.2pt)[#"Indicador de cara frontal"], [#c("SV_IsFrontFace")], [#c("gl_FrontFacing")], [#c("front_facing")], [#c("BuiltIn_FrontFacing")], [#c("@builtin_front_facing")],
  text(size: 7.2pt)[#"Profundidad del fragmento (salida)"], [#c("SV_Depth")], [#c("gl_FragDepth")], [#c("depth")], [#c("BuiltIn_FragDepth")], [#c("@builtin_frag_depth")],
  text(size: 7.2pt)[#"Profundidad conservadora"], [#c("SV_DepthGreaterEqual") #linebreak() #c("SV_DepthLessEqual")], [#none-cell], [#c("depth(\"greater\")") #linebreak() #c("depth(\"less\")")], [#none-cell], [#none-cell],
  text(size: 7.2pt)[#"Referencia de stencil (salida)"], [#c("SV_StencilRef")], [#c("gl_FragStencilRefARB")], [#c("stencil")], [#c("BuiltIn_FragStencilRef")], [#none-cell],
  text(size: 7.2pt)[#"Índice de muestra"], [#c("SV_SampleIndex")], [#c("gl_SampleID")], [#c("sample_id")], [#c("BuiltIn_SampleId")], [#c("@builtin_sample_index")],
  text(size: 7.2pt)[#"Máscara de muestras"], [#c("SV_Coverage")], [#c("gl_SampleMask") #linebreak() #c("gl_SampleMaskIn")], [#c("sample_mask")], [#c("BuiltIn_SampleMask")], [#c("@builtin_sample_mask")],
  text(size: 7.2pt)[#"Índice de primitiva"], [#c("SV_PrimitiveID")], [#c("gl_PrimitiveID")], [#c("primitive_id")], [#c("BuiltIn_PrimitiveId")], [#c("@builtin_primitive_index")],
  text(size: 7.2pt)[#"Coordenadas baricéntricas"], [#c("SV_Barycentrics")], [#c("gl_BaryCoordEXT")], [#c("barycentric_coord")], [#c("BuiltIn_BaryCoord")], [#none-cell],
  text(size: 7.2pt)[#"Coordenadas baricéntricas (sin perspectiva)"], [#none-cell], [#c("gl_BaryCoordNoPerspEXT")], [#none-cell], [#c("BuiltIn_BaryCoordNoPersp")], [#none-cell],
  text(size: 7.2pt)[#"Invocación auxiliar"], [#none-cell], [#c("gl_HelperInvocation")], [#none-cell], [#c("BuiltIn_HelperInvocation")], [#none-cell],
  text(size: 7.2pt)[#"Posición de la muestra"], [#none-cell], [#c("gl_SamplePosition")], [#none-cell], [#c("BuiltIn_SamplePosition")], [#none-cell],
  group-row(6, "Etapa compute"),
  text(size: 7.2pt)[#"Id de invocación global"], [#c("SV_DispatchThreadID")], [#c("gl_GlobalInvocationID")], [#c("thread_position_in_grid")], [#c("BuiltIn_GlobalInvocationId")], [#c("@builtin_global_invocation_id")],
  text(size: 7.2pt)[#"Id de invocación local"], [#c("SV_GroupThreadID")], [#c("gl_LocalInvocationID")], [#c("thread_position_in_threadgroup")], [#c("BuiltIn_LocalInvocationId")], [#c("@builtin_local_invocation_id")],
  text(size: 7.2pt)[#"Índice de invocación local"], [#c("SV_GroupIndex")], [#c("gl_LocalInvocationIndex")], [#c("thread_index_in_threadgroup")], [#c("BuiltIn_LocalInvocationIndex")], [#c("@builtin_local_invocation_index")],
  text(size: 7.2pt)[#"Id del grupo de trabajo"], [#c("SV_GroupID")], [#c("gl_WorkGroupID")], [#c("threadgroup_position_in_grid")], [#c("BuiltIn_WorkgroupId")], [#c("@builtin_workgroup_id")],
  text(size: 7.2pt)[#"Número de grupos de trabajo"], [#none-cell], [#c("gl_NumWorkGroups")], [#c("threadgroups_per_grid")], [#c("BuiltIn_NumWorkgroups")], [#c("@builtin_num_workgroups")],
  text(size: 7.2pt)[#"Tamaño del grupo (atributo de método)"], [#c("numthreads")], [#c("layout_local_size")], [#none-cell], [#none-cell], [#c("@workgroup_size")],
  text(size: 7.2pt)[#"Tamaño del grupo (valor integrado)"], [#none-cell], [#c("gl_WorkGroupSize")], [#c("threads_per_threadgroup")], [#c("BuiltIn_WorkgroupSize")], [#none-cell],
  text(size: 7.2pt)[#"Tamaño del subgrupo"], [#none-cell], [#c("gl_SubgroupSize")], [#c("threads_per_simdgroup")], [#c("BuiltIn_SubgroupSize")], [#c("@builtin_subgroup_size")],
  text(size: 7.2pt)[#"Id de invocación del subgrupo"], [#none-cell], [#c("gl_SubgroupInvocationID")], [#c("thread_index_in_simdgroup")], [#c("BuiltIn_SubgroupInvocationId")], [#c("@builtin_subgroup_invocation_id")],
  text(size: 7.2pt)[#"Id del subgrupo"], [#none-cell], [#c("gl_SubgroupID")], [#c("simdgroup_index_in_threadgroup")], [#c("BuiltIn_SubgroupId")], [#c("@builtin_subgroup_id")],
  text(size: 7.2pt)[#"Número de subgrupos"], [#none-cell], [#c("gl_NumSubgroups")], [#c("simdgroups_per_threadgroup")], [#c("BuiltIn_NumSubgroups")], [#c("@builtin_num_subgroups")],
)

= Recursos y slots de binding

#ref-table(columns: (1.7fr, 1.35fr, 1.35fr, 1.35fr, 1.35fr, 1.35fr), header: ("Concepto", "HLSL", "GLSL", "MSL", "SPIR-V", "WGSL"),
  text(size: 7.2pt)[#"Uniform buffer"], [#c("cbuffer, ConstantBuffer<T>")], [#c("uniform")], [#c("constant")], [#c("Uniform")], [#c("uniform")],
  text(size: 7.2pt)[#"Storage buffer de lectura y escritura"], [#c("RWStructuredBuffer<T>")], [#c("buffer")], [#c("device")], [#c("StorageBuffer")], [#c("storage(storage_use.read_write)")],
  text(size: 7.2pt)[#"Storage buffer de solo lectura"], [#c("StructuredBuffer<T>")], [#c("buffer")], [#c("device(readOnly: true)")], [#c("StorageBuffer")], [#c("storage(storage_use.read)")],
  text(size: 7.2pt)[#"Slot de binding"], [#c("register(RegisterPrefix.b, n)")], [#c("layout(set, binding)")], [#c("buffer(n), texture(n), sampler(n)")], [#c("DescriptorSet(s) + Binding(n)")], [#c("@group(s) + @binding(n)")],
  text(size: 7.2pt)[#"Slot de textura"], [#c("register(RegisterPrefix.t, n)")], [#c("layout(set, binding)")], [#c("texture(n)")], [#c("DescriptorSet(s) + Binding(n)")], [#c("@group(s) + @binding(n)")],
  text(size: 7.2pt)[#"Slot de sampler"], [#c("register(RegisterPrefix.s, n)")], [#c("layout(set, binding)")], [#c("sampler(n)")], [#c("DescriptorSet(s) + Binding(n)")], [#c("@group(s) + @binding(n)")],
)


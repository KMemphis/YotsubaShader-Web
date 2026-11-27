---
title: "Diagnósticos"
summary: "Todos los errores y avisos del analizador, por target de validación: qué rechaza cada API gráfica y por qué."
order: 10
---

El analizador revisa tu shader **mientras escribes**, en el editor y en el build, con las mismas reglas que usa el compilador: un shader sin errores compila. Cada diagnóstico tiene un id (`YS` y cuatro dígitos), una severidad y un mensaje.

- **Error**: el shader no compilaría para la GPU, o una API gráfica que declaraste con `[ShaderTargets]` no tiene lo que el shader usa.
- **Aviso**: compila, pero algo no está garantizado en todas partes (una característica opcional, un límite de hardware, un valor indefinido en algunas GPU).

Para elegir contra qué APIs gráficas se revisa un shader, mira [APIs gráficas y motores](targets.md).

## Por target de validación

Lo que acepta una API gráfica depende del target que declares. Una página por API, con una tabla de todas sus versiones y el mensaje exacto de cada una:

- [Validar para Vulkan](validate-vulkan.md)
- [Validar para OpenGL](validate-opengl.md)
- [Validar para OpenGL ES](validate-opengles.md)
- [Validar para Direct3D](validate-direct3d.md)
- [Validar para Metal](validate-metal.md)
- [Validar para WebGPU](validate-webgpu.md)

## Todos los diagnósticos, por área

Cada id con su mensaje y un shader que lo provoca. Casi todos valen para cualquier shader, diga lo que diga `[ShaderTargets]`; portabilidad es el que depende de él:

- [Tipos y vectores](diagnostics-types.md): Errores sobre los tipos que puede usar un shader y cómo se declaran los vectores.
- [Puntos de entrada](diagnostics-entry-points.md): Errores sobre los métodos marcados con [ShaderStage]: forma, etapa y tamaño de grupo de compute.
- [Interfaz entre etapas](diagnostics-interface.md): Errores sobre las entradas y salidas de cada etapa: built-ins, locations y semánticas.
- [Recursos](diagnostics-resources.md): Errores sobre texturas, samplers y buffers: bindings y layout de memoria.
- [Métodos](diagnostics-methods.md): Errores sobre las funciones auxiliares que se compilan a la GPU.
- [C# sin traducción](diagnostics-csharp.md): Errores sobre construcciones de C# que no existen en la GPU.
- [Uso por etapa](diagnostics-stages.md): Errores sobre operaciones que solo existen en una etapa.
- [Portabilidad](diagnostics-portability.md): Diagnósticos sobre lo que solo tienen algunas APIs gráficas. Las páginas de cada target de validación los muestran versión por versión.


---
title: Implementar en tu propio motor
summary: Integra el compilador y el contrato de ejecución en un motor que controlas.
order: 0
---

Si el motor es tuyo, decides cómo llegan los shaders a la GPU. Yotsuba Shader te entrega el shader compilado en el formato que lee tu API gráfica y un contrato fijo que dice qué ranura ocupa cada entrada, salida y recurso. El cargador lo escribes una sola vez.

## Mapa de integración

| Pieza | Qué haces | Capítulo |
| --- | --- | --- |
| Compilador | Convertir los shaders de C# a archivos SPIR-V, GLSL, GLSL ES, HLSL, MSL, WGSL o C++ | [Compilar en tu build](compile-in-your-build.md) |
| Contrato de interfaz | Crear los layouts de vértices, los buffers uniformes y las texturas en las ranuras que el shader espera | [Enlazar recursos](binding-resources.md) |
| Ejecución | Llevar el shader compilado a tu renderer, desde un archivo o desde C# | [Cargar en ejecución](load-at-runtime.md) |

## La versión corta

1. Escribe el shader en C# en un proyecto aparte.
2. Ejecuta `yotsuba compile` en tu build, una vez por cada target que tu renderer necesite.
3. En el renderer, crea el pipeline con las ubicaciones de vértice y los números `set`/`binding` que declara el shader.
4. Carga el archivo (o llama al método generado) y entrégalo a la API gráfica.

```bash
yotsuba compile Game.Shaders.csproj --target spirv --target hlsl --output shaders
```

---
title: Implementar en tu propio motor
summary: Integra el compilador y el contrato de ejecución en un motor que controlas.
order: 0
---

Si el motor es tuyo, controlas todo el pipeline: compilación, enlace de recursos y ejecución. Esta sección explica las piezas que integras.

## Mapa de integración

| Pieza | Responsabilidad | Capítulo |
| --- | --- | --- |
| Compilador | Convierte shaders C# al formato del backend | [Compilar en tu build](compile-in-your-build.md) |
| Contrato de interfaz | Entradas, salidas, recursos, bindings | [Enlazar recursos](binding-resources.md) |
| Runtime | Carga la salida para tu API gráfica | [Enlazar recursos](binding-resources.md) |

> [!IMPORTANT]
> Este es un capítulo de ejemplo. Sustitúyelo por los pasos reales de integración.

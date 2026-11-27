---
title: "Portabilidad"
summary: "Diagnósticos sobre lo que solo tienen algunas APIs gráficas. Las páginas de cada target de validación los muestran versión por versión."
order: 18
---

Diagnósticos sobre lo que solo tienen algunas APIs gráficas. Las páginas de cada target de validación los muestran versión por versión. 13 diagnósticos. Valen para cualquier shader, sea cual sea la API gráfica que declares. Los ids de los diagnósticos se describen en [Diagnósticos](diagnostics.md).

## YS0701: Tipo no portable

**Severidad:** Aviso

**Mensaje:** '…' no está disponible en todas las APIs gráficas: …. Afecta a: ….

*Este diagnóstico todavía no tiene un shader de ejemplo.*

## YS0702: Built-in no portable

**Severidad:** Aviso

**Mensaje:** […] (…) …. Afecta a: ….

*Este diagnóstico todavía no tiene un shader de ejemplo.*

## YS0703: Intrínseca no portable

**Severidad:** Aviso

**Mensaje:** '…' …. Afecta a: ….

*Este diagnóstico todavía no tiene un shader de ejemplo.*

## YS0704: Límite de hardware no portable

**Severidad:** Aviso

**Mensaje:** … Afecta a: ….

*Este diagnóstico todavía no tiene un shader de ejemplo.*

## YS0705: Recurso no portable

**Severidad:** Aviso

**Mensaje:** '…' …. Afecta a: ….

*Este diagnóstico todavía no tiene un shader de ejemplo.*

## YS0706: Layout de buffer distinto entre APIs

**Severidad:** Aviso

**Mensaje:** '…' en '…' …. Afecta a: ….

*Este diagnóstico todavía no tiene un shader de ejemplo.*

## YS0707: Operación con derivadas en control de flujo no uniforme

**Severidad:** Aviso

**Mensaje:** '…' está dentro de un … cuya condición depende de una entrada del shader. Es un error en WGSL y da resultados indefinidos en las demás APIs. Afecta a: ….

*Este diagnóstico todavía no tiene un shader de ejemplo.*

## YS0708: NaN e infinito no fiables

**Severidad:** Aviso

**Mensaje:** '…' puede devolver siempre false con las optimizaciones de coma flotante de ….

*Este diagnóstico todavía no tiene un shader de ejemplo.*

## YS0709: División entera por cero

**Severidad:** Aviso

**Mensaje:** La división entera por cero da un resultado indefinido en la GPU (en C# lanza una excepción).

*Este diagnóstico todavía no tiene un shader de ejemplo.*

## YS0710: No disponible en Godot

**Severidad:** Aviso

**Mensaje:** '…' …. Afecta a: Godot.

*Este diagnóstico todavía no tiene un shader de ejemplo.*

## YS0711: Característica no disponible en la API declarada

**Severidad:** Aviso

**Mensaje:** … …. Afecta a: ….

*Este diagnóstico todavía no tiene un shader de ejemplo.*

## YS0712: Versión de API gráfica sin backend

**Severidad:** Error

**Mensaje:** …

*Este diagnóstico todavía no tiene un shader de ejemplo.*

## YS0713: Uniform buffer demasiado grande

**Severidad:** Aviso

**Mensaje:** El uniform buffer '…' ocupa … bytes (std140), más de lo que garantiza …. Afecta a: ….

*Este diagnóstico todavía no tiene un shader de ejemplo.*


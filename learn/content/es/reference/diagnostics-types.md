---
title: "Tipos y vectores"
summary: "Errores sobre los tipos que puede usar un shader y cómo se declaran los vectores."
order: 11
---

Errores sobre los tipos que puede usar un shader y cómo se declaran los vectores. 11 diagnósticos. Valen para cualquier shader, sea cual sea la API gráfica que declares. Los ids de los diagnósticos se describen en [Diagnósticos](diagnostics.md).

## YS0001: Número de componentes inválido

**Severidad:** Error

**Mensaje:** El vector '…' tiene … componentes; un vector de GPU tiene entre 2 y 4. Ajusta los campos [VectorComponent].

*Este diagnóstico todavía no tiene un shader de ejemplo.*

## YS0002: Índice de componente negativo

**Severidad:** Error

**Mensaje:** El componente '…' usa el índice …; los índices empiezan en 0.

*Este diagnóstico todavía no tiene un shader de ejemplo.*

## YS0003: Índice de componente repetido

**Severidad:** Error

**Mensaje:** El índice … está repetido en el vector '…'. Cada componente necesita un índice distinto.

*Este diagnóstico todavía no tiene un shader de ejemplo.*

## YS0004: Falta un índice de componente

**Severidad:** Error

**Mensaje:** Al vector '…' le falta el componente …; los índices deben ser consecutivos desde 0.

*Este diagnóstico todavía no tiene un shader de ejemplo.*

## YS0005: Componentes con tipos distintos

**Severidad:** Error

**Mensaje:** Los componentes del vector '…' tienen tipos distintos (… y …). Usa el mismo tipo en todos.

*Este diagnóstico todavía no tiene un shader de ejemplo.*

## YS0006: Tipo de componente no soportado

**Severidad:** Error

**Mensaje:** El componente '…' es de tipo '…'. Los vectores admiten bool, short, ushort, int, uint, Half, float y double.

*Este diagnóstico todavía no tiene un shader de ejemplo.*

## YS0007: Miembro del vector sin [VectorComponent]

**Severidad:** Aviso

**Mensaje:** '…' no es un componente del vector '…' y no existe en la GPU. Márcalo con [VectorComponent] o quítalo.

*Este diagnóstico todavía no tiene un shader de ejemplo.*

## YS0008: [VectorComponent] ignorado

**Severidad:** Aviso

**Mensaje:** [VectorComponent] en '…' se ignora: un componente debe ser un campo o propiedad de instancia.

*Este diagnóstico todavía no tiene un shader de ejemplo.*

## YS0009: [VectorComponent] fuera de un vector

**Severidad:** Aviso

**Mensaje:** '…' tiene [VectorComponent] pero el tipo '…' no está marcado con [Vector].

*Este diagnóstico todavía no tiene un shader de ejemplo.*

## YS0010: Valor inicial no constante

**Severidad:** Aviso

**Mensaje:** El valor inicial de '…' no es constante; en la GPU el componente empieza en 0.

*Este diagnóstico todavía no tiene un shader de ejemplo.*

## YS0011: Tipo sin representación en la GPU

**Severidad:** Error

**Mensaje:** El tipo '…' no existe en la GPU (…). Usa escalares, vectores, matrices, arrays o structs de esos tipos.

*Este diagnóstico todavía no tiene un shader de ejemplo.*


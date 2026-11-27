---
title: "Métodos"
summary: "Errores sobre las funciones auxiliares que se compilan a la GPU."
order: 15
---

Errores sobre las funciones auxiliares que se compilan a la GPU. 7 diagnósticos. Valen para cualquier shader, sea cual sea la API gráfica que declares. Los ids de los diagnósticos se describen en [Diagnósticos](diagnostics.md).

## YS0401: Método genérico en un shader

**Severidad:** Error

**Mensaje:** '…' es genérico; los shaders no tienen genéricos. Escribe una versión por tipo.

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS() { return Id(1f); } T Id<T>(T x) { return x; } }
```

```text
error YS0401: 'Id' es genérico; los shaders no tienen genéricos. Escribe una versión por tipo.
```

## YS0402: Parámetro ref, in u out en una función auxiliar

**Severidad:** Error

**Mensaje:** El parámetro '…' de '…' es '…'; las funciones auxiliares todavía no admiten parámetros por referencia. Devuelve el valor.

*Este diagnóstico todavía no tiene un shader de ejemplo.*

## YS0403: Parámetro params en un shader

**Severidad:** Error

**Mensaje:** El parámetro '…' de '…' es params; usa un array de longitud fija.

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS() { return Sum(1f, 2f); } float Sum(params float[] v) { return v[0]; } }
```

```text
error YS0403: El parámetro 'v' de 'Sum' es params; usa un array de longitud fija.
```

## YS0404: Recursión

**Severidad:** Error

**Mensaje:** '…' es recursiva (…). La GPU no admite recursión; reescríbela con un bucle.

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS() { return F(3); } float F(int n) { return n <= 0 ? 0f : F(n - 1); } }
```

```text
error YS0404: 'F' es recursiva (F → F). La GPU no admite recursión; reescríbela con un bucle.
```

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS() { return A(3); } float A(int n) { return B(n); } float B(int n) { return A(n); } }
```

```text
error YS0404: 'A' es recursiva (A → B → A). La GPU no admite recursión; reescríbela con un
    bucle.
```

## YS0405: Llamada virtual

**Severidad:** Error

**Mensaje:** '…' es …; en la GPU solo hay llamadas directas a métodos concretos.

*Este diagnóstico todavía no tiene un shader de ejemplo.*

## YS0406: Método sin traducción a la GPU

**Severidad:** Error

**Mensaje:** '…' no tiene traducción a la GPU. Usa una intrínseca de YotsubaShader o escribe la función en el shader.

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS() { return float.Parse("1"); } }
```

```text
error YS0406: 'float.Parse(string)' no tiene traducción a la GPU. Usa una intrínseca de
    YotsubaShader o escribe la función en el shader.
```

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS() { return System.Math.BigMul(2, 3); } }
```

```text
error YS0406: 'Math.BigMul' no tiene traducción a la GPU. Usa una intrínseca de YotsubaShader o
    escribe la función en el shader.
```

## YS0407: Método async o iterador

**Severidad:** Error

**Mensaje:** '…' es …; los shaders no tienen async ni iteradores.

*Este diagnóstico todavía no tiene un shader de ejemplo.*


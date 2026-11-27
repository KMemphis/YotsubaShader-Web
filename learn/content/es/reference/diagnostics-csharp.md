---
title: "C# sin traducción"
summary: "Errores sobre construcciones de C# que no existen en la GPU."
order: 16
---

Errores sobre construcciones de C# que no existen en la GPU. 8 diagnósticos. Valen para cualquier shader, sea cual sea la API gráfica que declares. Los ids de los diagnósticos se describen en [Diagnósticos](diagnostics.md).

## YS0501: Sentencia no soportada

**Severidad:** Error

**Mensaje:** '…' no existe en la GPU. …

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS() { try { return 1f; } catch { return 0f; } } }
```

```text
error YS0501: 'try/catch/finally' no existe en la GPU. La GPU no tiene excepciones.
```

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS() { throw new System.Exception(); } }
```

```text
error YS0501: 'throw' no existe en la GPU. La GPU no tiene excepciones; usa un valor por defecto
    o discard.
```

## YS0502: Expresión no soportada

**Severidad:** Error

**Mensaje:** '…' no tiene traducción a la GPU. …

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS() { System.Func<float> f = () => 1f; return 1f; } }
```

```text
error YS0502: 'lambda' no tiene traducción a la GPU. Los shaders no tienen delegados; escribe un
    método.
```

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public unsafe float FS() { float x = 1f; float* p = &x; return *p; } }
```

```text
error YS0502: 'puntero' no tiene traducción a la GPU. La GPU no tiene punteros en el código del
    shader.
```

## YS0503: Tipo no soportado en el shader

**Severidad:** Error

**Mensaje:** '…' usa el tipo '…', que no existe en la GPU.

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS() { string s = "a"; return 1f; } }
```

```text
error YS0503: 's' usa el tipo 'string', que no existe en la GPU.
```

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS() { decimal d = 1m; return 1f; } }
```

```text
error YS0503: 'd' usa el tipo 'decimal', que no existe en la GPU.
```

## YS0504: Creación de objeto sin usar

**Severidad:** Error

**Mensaje:** El 'new …(...)' no se usa; en la GPU no tiene efecto. Asígnalo o quítalo.

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS() { new float4(); return 1f; } }
```

```text
error YS0504: El 'new float4(...)' no se usa; en la GPU no tiene efecto. Asígnalo o quítalo.
```

## YS0505: Campo estático mutable

**Severidad:** Error

**Mensaje:** '…' es un campo estático que no es constante. La GPU no tiene estado global mutable; usa 'const' o un recurso.

Shader que lo provoca:

```csharp
public class S { static float counter; [ShaderStage(Stage.Fragment)] public float FS() { counter += 1f; return counter; } }
```

```text
error YS0505: 'counter' es un campo estático que no es constante. La GPU no tiene estado global
    mutable; usa 'const' o un recurso.
```

## YS0506: switch sin caso por defecto

**Severidad:** Error

**Mensaje:** La expresión switch no cubre todos los valores. Añade un brazo '_ => ...'.

*Este diagnóstico todavía no tiene un shader de ejemplo.*

## YS0507: Array no soportado

**Severidad:** Error

**Mensaje:** …. En la GPU los arrays tienen una dimensión y una longitud constante.

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS([TEXCOORD(0)] int n) { float[] a = new float[n]; return 1f; } }
```

```text
error YS0507: La longitud del array no es constante. En la GPU los arrays tienen una dimensión y
    una longitud constante.
```

Shader que lo provoca:

```csharp
public class S { [ShaderStage(Stage.Fragment)] public float FS() { float[,] a = new float[2, 2]; return 1f; } }
```

```text
error YS0507: Los arrays multidimensionales no existen en la GPU. En la GPU los arrays tienen
    una dimensión y una longitud constante.
```

## YS0508: Intrínseca no soportada con estos argumentos

**Severidad:** Error

**Mensaje:** '…' ….

*Este diagnóstico todavía no tiene un shader de ejemplo.*


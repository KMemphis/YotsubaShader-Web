---
title: Cuando algo sale mal
summary: Cómo encontrar el error en un shader que no funciona, y respuestas a las preguntas que casi todo el mundo se hace.
order: 17
---

Tarde o temprano, tu shader mostrará una pantalla negra y no sabrás por qué. Le pasa a todo el mundo, incluso a quien lleva años haciendo shaders. La diferencia es que los que llevan años tienen un método para encontrar el problema. En este capítulo lo aprendes.

Hay una dificultad que conviene aceptar desde ya: **en un shader no puedes escribir en la consola**. No existe `Console.WriteLine`. Un shader corre en la GPU, miles de veces a la vez, y no tiene dónde imprimir. Lo que sí tienes es el color: *tu única forma de mirar dentro del shader es pintar lo que quieres ver*.

## El método: cuatro preguntas, en orden

Cuando algo no funciona, hazte estas preguntas **en este orden**. Casi siempre la respuesta está en una de las primeras.

1. **¿Compila?** Si `add` muestra un error, lo demás no importa todavía. Lee el mensaje.
2. **¿Se ejecuta mi shader?** Quizás estás mirando otro, o uno viejo.
3. **¿Llegan bien los datos?** El tamaño de la ventana, el tiempo, los `Uv`.
4. **¿Está bien mi cuenta?** Aquí entran las técnicas de pintar valores.

## Técnica 1: un color sólido

Lo más simple y lo más útil. Pon esto como **primera línea** de `Fragment`:

```csharp
return Crear.Vec4(1f, 0f, 0f, 1f);
```

Si la ventana sale roja, tu shader se ejecuta, el rectángulo se dibuja y la GPU funciona. El problema está en tu cuenta, que viene después de esa línea. Si **no** sale roja, el problema es más profundo: mira la tabla de más abajo.

Este truco sirve porque te quita dudas de encima. Cuando no sabes dónde está el fallo, lo primero es saber dónde **no** está.

## Técnica 2: pintar el número

Imagina que tu shader dibuja una mancha de luz y sale todo negro. No sabes si la cuenta da `0`, o negativo, o algo enorme. Pintemos el número:

```csharp
float dx = pixel.Uv.X - 0.5f;
float dy = pixel.Uv.Y - 0.5f;
float luz = 1f - (dx * dx + dy * dy) * 40f;

// return Crear.Vec4(luz, luz, luz, 1f);
return Crear.Vec4(dx, dx, dx, 1f);
```

La línea original quedó comentada, y en su lugar se pinta `dx`. Ahora ves cómo se comporta: negro a la izquierda (valores negativos recortados) y claro a la derecha. Si ahí algo está mal, ya lo sabes. Si está bien, pinta `dy`, luego `dx * dx + dy * dy`, y así vas avanzando por la cuenta hasta encontrar el paso donde la imagen deja de ser lo que esperabas.

Dos cosas para recordar cuando interpretes lo que ves:

| Lo que ves | Qué significa |
|---|---|
| Todo negro | El valor es `0` o negativo (el negativo se recorta a `0`). |
| Todo blanco | El valor es `1` o mayor (también se recorta). |
| Franjas de color claras y oscuras | El valor cambia con la posición. Va por buen camino. |

> [!TIP]
> Para ver valores que se salen de `0`-`1`, **escálalos**: si sospechas que `x` va de `0` a `10`, pinta `x / 10f`. Si va de `-1` a `1`, pinta `x * 0.5f + 0.5f`. Así caben en el rango visible.

## Técnica 3: parte y corta

Si tu shader tiene muchas líneas, no sabes cuál falla. Pon un `return` de color sólido **a la mitad**, y mira si se ve:

```csharp
float a = pixel.Uv.X * 2f - 1f;
float b = a * a;

return Crear.Vec4(b, b, b, 1f); // prueba aquí: ¿se ve bien b?

float c = 1f - b;
return Crear.Vec4(c, c, c, 1f);
```

Si `b` se ve bien, el problema está después. Si se ve mal, está antes. Mueve el `return` hacia arriba o hacia abajo hasta acorralar el problema, como al buscar una palabra en un diccionario.

C# te avisará de que hay "código inalcanzable" debajo del `return`. Es solo una advertencia, y en este caso es justo lo que queremos.

## Síntomas y causas

Esta tabla reúne los problemas más comunes. Es la que más vas a consultar.

| Lo que ves | Causa probable | Qué hacer |
|---|---|---|
| La ventana sale **negra** y no cambia nada | Tu `Fragment` devuelve negro (como en `Plantilla`) o no llegó el cambio. | Ejecuta el ciclo completo, con `add`. Prueba la técnica del color sólido. |
| `No existe la clase MisShaders.X` | El nombre tras `--` no coincide con la clase. | Revisa mayúsculas y que el archivo declare esa clase. |
| La ventana muestra una versión **vieja** | Guardaste pero el shader no se tradujo de nuevo. | Ejecuta el ciclo completo cada vez, como dice el capítulo. |
| Todo **blanco** | Un valor se pasó de `1`. | Pinta el valor dividido (técnica 2). |
| Todo **negro** con una cuenta de luz | El valor es negativo o `0`. | Pinta el valor. Revisa signos y el orden de una resta. |
| El círculo sale **ovalado** | La ventana es más ancha que alta y el shader no lo tiene en cuenta. | Mira el capítulo de [coordenadas](coordinates.md). |
| El dibujo sale **al revés** | La `Y` crece hacia abajo. | Usa `1f - pixel.Uv.Y`. |
| Un valor es siempre `0` o siempre `1` | Dividiste dos enteros. | Escribe un decimal: `a / 6f`, no `a / 6`. |
| Se ve bien en el visor y mal en mi juego | Los datos que le entrega tu juego no coinciden. | Revisa que el vértice de tu juego tenga el orden de tu struct `Vertice`. |

:::godot
En Godot hay algunos casos más:

| Lo que ves | Causa probable | Qué hacer |
| --- | --- | --- |
| La ventana sale **gris** y no dibuja nada | El archivo `.gdshader` aún no existe o no se pudo cargar. | Revisa que `GodotGame/yotsuba_shaders/MisShaders/` tenga el archivo y usa **Project → Reload Current Project**. |
| Godot no ve un shader recién creado | El addon solo lee los archivos al abrir el editor o al recuperar el foco. | **Project → Reload Current Project** (pide detener el juego si está corriendo). |
| No se encuentra `dotnet` al pulsar Play | En macOS, Godot no siempre hereda el `PATH` de tu terminal. | Abre Godot desde una terminal donde `dotnet --version` funcione. |
| `Unknown command 'yotsuba'` | Ejecutaste el comando fuera de la carpeta `Tutorial`. | Entra a `Tutorial` (donde está `dotnet-tools.json`) y ejecuta una vez `dotnet tool restore`. |
| Un shader con textura sale negro | El visor no tiene imagen en **Foto**. | Arrastra la imagen a la propiedad **Foto** del nodo `Visor`. |
:::

## Errores de compilación frecuentes

`add` compila tu proyecto primero, así que verás errores de C# normal. Estos son los que más aparecen:

| Error | Qué pasó | Solución |
|---|---|---|
| `CS0664` (`Literal of type double...`) | Escribiste `0.5` en vez de `0.5f`. | Agrega la `f`. |
| `CS0019` (`Operator '+' cannot be applied...`) | Sumaste dos `vec4` o multiplicaste un `vec2` por un número con `+` o `*`. | Los vectores no tienen operadores todavía. Opera campo por campo, o escribe tu función (más abajo). |
| `CS0165` (`Use of unassigned local variable`) | Declaraste un `struct` y no llenaste todos sus campos. | Asigna cada campo antes de usarlo. |
| `CS1729` (`does not contain a constructor`) | Escribiste `new vec4(...)`. | Usa `Crear.Vec4(...)`. |
| `... no hay código disponible para compilarlo en GPU` | Llamaste a `Math.Sqrt`, `Math.Sin` o similar. | Todavía no existen en Yotsuba Shader. Escríbelas tú o espera los capítulos planeados. |
| `CS0234` tras renombrar una clase | `YotsubaShader.g.cs` nombra una clase que ya no existe. | Bórralo y vuelve a ejecutar `add`. |

## Preguntas que todo el mundo se hace

### ¿Por qué no puedo sumar dos vectores con `+`?

En GLSL o HLSL sí puedes, porque los vectores son parte del lenguaje. Aquí `vec3` es un `struct` de C#, y C# no sabe qué significa sumar dos structs, a menos que alguien se lo enseñe. Mientras tanto, tienes dos opciones. La más directa es operar campo por campo:

```csharp
vec3 suma = Crear.Vec3(a.X + b.X, a.Y + b.Y, a.Z + b.Z);
```

Y si lo haces seguido, escribe una función una vez y úsala siempre:

```csharp
public static vec3 Sumar(vec3 a, vec3 b)
{
    return Crear.Vec3(a.X + b.X, a.Y + b.Y, a.Z + b.Z);
}

public static vec3 Escalar(vec3 a, float k)
{
    return Crear.Vec3(a.X * k, a.Y * k, a.Z * k);
}
```

Con ellas, mezclar dos luces queda así:

```csharp
vec3 rojo = Crear.Vec3(1f, 0f, 0f);
vec3 verde = Crear.Vec3(0f, 1f, 0f);
vec3 mezcla = Sumar(Escalar(rojo, pixel.Uv.X), Escalar(verde, pixel.Uv.Y));
return Crear.Vec4(mezcla.X, mezcla.Y, mezcla.Z, 1f);
```

### ¿Por qué hay que poner la `f` en los números?

Porque en C# un número con decimales, como `0.5`, es un `double`, otro tipo de número que ocupa más memoria. Y las GPU trabajan con `float`. La `f` le dice a C# "este es un `float`". Sin ella no compila.

### ¿Qué diferencia hay entre los datos del vértice, un uniform y el `Uv`?

Es la pregunta más repetida en los foros de shaders, y la confusión es lógica: los tres son "datos que entran al shader", pero llegan de formas distintas.

| | De dónde viene | Cuántas veces cambia | Ejemplo |
|---|---|---|---|
| **Dato de vértice** | La lista de vértices que manda el juego | Uno por cada vértice | `[location(0)] public vec2 Posicion;` en `Vertice` |
| **Uniform** | El programa, antes de dibujar | **Uno solo** para todo el dibujo | `[uniform, layout(0, 0)] public Entorno Datos;` |
| **Dato repartido** | La GPU, entre `Vertex` y `Fragment` | Uno distinto **por cada píxel** | `[location(0)] public vec2 Uv;` en `Pixel` |

La regla para decidir dónde poner un dato: ¿cambia de un vértice a otro? Va en el vértice. ¿Es igual para todo el dibujo (el tiempo, el tamaño, un color elegido)? Es un uniform. ¿Quieres que el `Fragment` lo reciba suavemente repartido? Se pasa del `Vertex` al `Fragment` por una puerta, como hiciste con el `Uv`.

### ¿Puedo preguntarle a un píxel vecino qué color tiene?

No. Cada píxel se calcula por separado y a la vez que los demás, así que no hay un "primero" ni un "después" entre ellos. Si necesitas algo que dependa de los vecinos (un desenfoque, por ejemplo), se hace en dos pasadas: primero se dibuja una imagen completa, y luego otro shader la **lee** como textura. Es un tema avanzado, y no lo necesitas para empezar.

### ¿Qué pasa si divido entre cero?

En C# normal, dividir un `float` entre cero da infinito, o un valor que no es un número (`NaN`). En la GPU no se sabe qué va a salir, y suele verse como un píxel negro o un parpadeo. Si un divisor puede llegar a ser cero, protégelo:

```csharp
float razon = 0f;
if (ancho > 0f)
{
    razon = alto / ancho;
}
```

### ¿Mi shader es lento?

Primero asegúrate de que funciona. La velocidad se mide, no se adivina. Como guía: los bucles con muchas vueltas y los `if` muy complejos son lo que más cuesta, porque cada píxel los ejecuta. Si notas que va lento, empieza reduciendo las vueltas de un bucle y comprueba si mejora.

### Quiero una herramienta de verdad para depurar

Existen depuradores gráficos, como **RenderDoc**, que permiten congelar un fotograma y mirar qué recibió y qué dibujó la GPU. Son útiles cuando el problema es de datos, no de cuentas. Para lo que haces en este tutorial no los necesitas todavía.

## Lo que aprendiste

- En un shader no se puede imprimir: **se pinta el valor** para verlo.
- Un color sólido al inicio de `Fragment` te dice si el problema está en tu cuenta o en otra parte.
- Parte y corta: un `return` a la mitad te dice si el fallo está antes o después.
- Para ver valores fuera de `0`-`1`, escálalos.
- La mayoría de los errores de compilación tienen una causa conocida y una solución rápida.

Siguiente: [La línea de comandos](cli.md).

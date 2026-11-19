---
title: ¿Y ahora qué?
summary: Lleva tus shaders al Game Engine que uses.
order: 20
---

Terminaste el tutorial. Dibujaste colores, formas, una cara, un atardecer y una bola que rebota. Hiciste cinco shaders, y por el camino aprendiste:

- Qué es un shader y qué hace cada etapa.
- Cómo se declaran los datos que entran y salen, con `[location]` y `[gl_Position]`, y por qué cada puerta (del juego al Vertex, del Vertex al Fragment, del Fragment a la pantalla) cuenta sus ranuras desde 0.
- A mirar dentro de un shader pintando los valores como color, y a encontrar un error con un método.
- Que dentro de un shader puedes usar `if`, bucles, arrays y tus propias funciones.
- Cómo se mueve algo que no tiene memoria: calculando todo a partir del tiempo que le da el programa.
- Las funciones matemáticas de la GPU, como `sqrt`, `sin` y `mix`.
- Cómo mandarle datos a un shader con un uniform, y cómo leer una imagen con una textura.
- Cómo compilar con `add` y pedirle el resultado a tu propia clase.

:::xna
Lo que falta es lo único que este tutorial no podía enseñarte de una sola manera: **dibujar en pantalla**. Abrir una ventana, mandar el rectángulo a la GPU, entregarle el reloj y la foto. Eso depende de con qué trabajes.

La buena noticia es que el punto de partida es siempre el mismo y ya lo tienes: `new Degradado()` y uno de los métodos que le puso `add`.

## Elige tu Game Engine

```buttons
[MonoGame](../reference/monogame.md)
[KNI](../reference/kni.md)
[FNA](../reference/fna.md)
[Godot](../reference/godot.md)
[Stride](../engines/stride.md)
[Unity](../engines/unity.md)
[Silk.NET](../engines/silknet.md)
```
:::

:::godot
Ya dibujaste en pantalla: la escena del visor, tus shaders corriendo en Godot e incluso una escena 3D vista a través de ellos. Lo que no viste es todo lo que Godot puede hacer alrededor, y está reunido en la [referencia de Godot](../reference/godot.md): los nombres de los 14 atributos del vértice y lo que soporta el traductor.

A partir de aquí, la mejor forma de aprender es tomar uno de tus shaders y usarlo en un objeto real, con el `VERTEX` y el `NORMAL` de un `MeshInstance3D`.
:::

## ¿Tienes tu propio motor?

Si usas directamente Vulkan, DirectX, Metal u OpenGL, o estás haciendo tu propio Game Engine, sigue por aquí:

```buttons
[Usar Yotsuba Shader en tu propio motor](../custom-engine/index.md)
```

## Para consultar

Cuando quieras buscar un atributo o un formato concreto sin releer el tutorial:

```buttons
[Documentación](../reference/index.md)
```

---
title: Atributos de metadatos
summary: ShaderTargetsAttribute, ShaderEnginesAttribute, Target y GameEngine, de YotsubaShader.Compiler.Metadata.
order: 8
---

Los atributos que le dicen al analizador en qué APIs gráficas y engines de juego debe funcionar un shader. El paquete es `YotsubaShader.Compiler.Metadata`; todos los paquetes de sintaxis dependen de él, así que nunca lo instalas a mano. Para ver cómo se usan, mira [APIs gráficas y engines](../reference/targets.md).

```csharp
using YotsubaShader.Compiler.Metadata;
```

## ShaderTargetsAttribute

```csharp
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Assembly)]
public sealed class ShaderTargetsAttribute(Target graphicsApi) : Attribute
{
    public Target GraphicsApi { get; }
}
```

Las APIs gráficas para las que el shader debe ser válido. En una clase se aplica a esa clase (y a las anidadas en ella); en el ensamblado, a toda clase que no tenga la suya. Sin el atributo, el shader se comprueba contra `Target.Vulkan_13`.

```csharp
[ShaderTargets(Target.Vulkan_13 | Target.WebGpu)]
public class Gradient { /* ... */ }

[assembly: ShaderTargets(Target.OpenGL_46 | Target.DirectX_12)]
```

## ShaderEnginesAttribute

```csharp
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Assembly)]
public sealed class ShaderEnginesAttribute(GameEngine engines) : Attribute
{
    public GameEngine Engines { get; }
}
```

Los engines de juego cuyas reglas se comprueban además de las de la API gráfica. Se combina con `[ShaderTargets]`.

```csharp
[ShaderEngines(GameEngine.Godot)]
public class Plasma { /* ... */ }
```

## Target

```csharp
[Flags]
public enum Target : ulong
{
    None = 0,

    Vulkan_10, Vulkan_11, Vulkan_12, Vulkan_13, Vulkan_14,

    OpenGL_20, OpenGL_30, OpenGL_31, OpenGL_32, OpenGL_33,
    OpenGL_40, OpenGL_41, OpenGL_42, OpenGL_43, OpenGL_44, OpenGL_45, OpenGL_46,

    OpenGLES_20, OpenGLES_30, OpenGLES_31, OpenGLES_32,

    DirectX_80, DirectX_81, DirectX_90, DirectX_90c, DirectX_10, DirectX_11, DirectX_12,

    Metal_1, Metal_2, Metal_3, Metal_4,

    WebGpu,

    AllVulkan, AllOpenGL, AllOpenGLES, AllDirectX, AllMetal,
    All
}
```

`Target.None` cuenta como "nada declarado": se aplica el Vulkan 1.3 por defecto. Los miembros son bits sueltos, así que se combinan con `|`. `Vulkan_10`, `DirectX_80`, `DirectX_81` y `DirectX_90` no tienen backend y dan [YS0712](../reference/targets.md#versiones-que-ningún-backend-genera), igual que los grupos que los contienen.

## GameEngine

```csharp
[Flags]
public enum GameEngine : ulong
{
    None = 0,
    Godot,
    All
}
```

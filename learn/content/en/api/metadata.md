---
title: Metadata attributes
summary: ShaderTargetsAttribute, ShaderEnginesAttribute, Target and GameEngine, from YotsubaShader.Compiler.Metadata.
order: 8
---

The attributes that tell the analyzer which graphics APIs and game engines a shader must work on. The package is `YotsubaShader.Compiler.Metadata`; every syntax package depends on it, so you never install it by hand. For how to use them, see [Graphics APIs and engines](../reference/targets.md).

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

The graphics APIs the shader must be valid for. On a class it applies to that class (and the classes nested in it); on the assembly, to every class without its own. Without the attribute the shader is checked against `Target.Vulkan_13`.

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

The game engines whose rules are checked on top of the graphics API. It combines with `[ShaderTargets]`.

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

`Target.None` counts as "nothing declared": the Vulkan 1.3 default applies. The members are single bits, so combine them with `|`. `Vulkan_10`, `DirectX_80`, `DirectX_81` and `DirectX_90` have no backend and report [YS0712](../reference/targets.md#versions-that-no-backend-generates), and so do the groups that contain them.

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

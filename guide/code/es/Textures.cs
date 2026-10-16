using YotsubaShader.Language.Native.Types.Texture;

namespace MyEngine;

[Texture(TextureDimension.D2, TextureComponentTypes.Float)]
public class Texture2D { /* la textura de tu motor */ }

[Texture(TextureDimension.Cube, TextureComponentTypes.Float)]
public class TextureCube { /* ... */ }

[Texture(TextureDimension.D2, TextureComponentTypes.Float,
    Depth = TextureDepth.Yes)]
public class DepthTexture2D { /* ... */ }

[Texture(TextureDimension.D2, TextureComponentTypes.Float,
    Usage = TextureUsage.Storage, Format = TextureFormat.Rgba8)]
public class StorageTexture2D { /* ... */ }

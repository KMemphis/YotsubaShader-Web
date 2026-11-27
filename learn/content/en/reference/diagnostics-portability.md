---
title: "Portability"
summary: "Diagnostics about what only some graphics APIs have. The pages of each validation target show them version by version."
order: 18
---

Diagnostics about what only some graphics APIs have. The pages of each validation target show them version by version. 13 diagnostics. They apply to every shader, whatever graphics API you declare. The diagnostic ids are described in [Diagnostics](diagnostics.md).

## YS0701: Non-portable type

**Severity:** Warning

**Message:** '…' is not available in all graphics APIs: …. Affects: ….

*This diagnostic has no example shader yet.*

## YS0702: Non-portable built-in

**Severity:** Warning

**Message:** […] (…) …. Affects: ….

*This diagnostic has no example shader yet.*

## YS0703: Non-portable intrinsic

**Severity:** Warning

**Message:** '…' …. Affects: ….

*This diagnostic has no example shader yet.*

## YS0704: Non-portable hardware limit

**Severity:** Warning

**Message:** … Affects: ….

*This diagnostic has no example shader yet.*

## YS0705: Non-portable resource

**Severity:** Warning

**Message:** '…' …. Affects: ….

*This diagnostic has no example shader yet.*

## YS0706: Buffer layout differs between APIs

**Severity:** Warning

**Message:** '…' in '…' …. Affects: ….

*This diagnostic has no example shader yet.*

## YS0707: Derivative operation in non-uniform control flow

**Severity:** Warning

**Message:** '…' is inside a … whose condition depends on a shader input. It is an error in WGSL and gives undefined results in the other APIs. Affects: ….

*This diagnostic has no example shader yet.*

## YS0708: NaN and infinity not reliable

**Severity:** Warning

**Message:** '…' may always return false with the floating-point optimizations of ….

*This diagnostic has no example shader yet.*

## YS0709: Integer division by zero

**Severity:** Warning

**Message:** Integer division by zero gives an undefined result on the GPU (in C# it throws an exception).

*This diagnostic has no example shader yet.*

## YS0710: Not available in Godot

**Severity:** Warning

**Message:** '…' …. Affects: Godot.

*This diagnostic has no example shader yet.*

## YS0711: Feature not available in the declared API

**Severity:** Warning

**Message:** … …. Affects: ….

*This diagnostic has no example shader yet.*

## YS0712: Graphics API version without a backend

**Severity:** Error

**Message:** …

*This diagnostic has no example shader yet.*

## YS0713: Uniform buffer too large

**Severity:** Warning

**Message:** The uniform buffer '…' takes … bytes (std140), more than what is guaranteed by …. Affects: ….

*This diagnostic has no example shader yet.*


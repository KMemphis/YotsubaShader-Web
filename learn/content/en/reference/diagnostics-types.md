---
title: "Types and vectors"
summary: "Errors about the types a shader can use and how vectors are declared."
order: 11
---

Errors about the types a shader can use and how vectors are declared. 11 diagnostics. They apply to every shader, whatever graphics API you declare. The diagnostic ids are described in [Diagnostics](diagnostics.md).

## YS0001: Invalid component count

**Severity:** Error

**Message:** The vector '…' has … components; a GPU vector has between 2 and 4. Adjust the [VectorComponent] fields.

*This diagnostic has no example shader yet.*

## YS0002: Negative component index

**Severity:** Error

**Message:** The component '…' uses index …; indices start at 0.

*This diagnostic has no example shader yet.*

## YS0003: Duplicate component index

**Severity:** Error

**Message:** Index … is repeated in the vector '…'. Each component needs a distinct index.

*This diagnostic has no example shader yet.*

## YS0004: Missing component index

**Severity:** Error

**Message:** The vector '…' is missing component …; indices must be consecutive starting at 0.

*This diagnostic has no example shader yet.*

## YS0005: Components with different types

**Severity:** Error

**Message:** The components of the vector '…' have different types (… and …). Use the same type for all of them.

*This diagnostic has no example shader yet.*

## YS0006: Unsupported component type

**Severity:** Error

**Message:** The component '…' is of type '…'. Vectors support bool, short, ushort, int, uint, Half, float and double.

*This diagnostic has no example shader yet.*

## YS0007: Vector member without [VectorComponent]

**Severity:** Warning

**Message:** '…' is not a component of the vector '…' and does not exist on the GPU. Mark it with [VectorComponent] or remove it.

*This diagnostic has no example shader yet.*

## YS0008: [VectorComponent] ignored

**Severity:** Warning

**Message:** [VectorComponent] on '…' is ignored: a component must be an instance field or property.

*This diagnostic has no example shader yet.*

## YS0009: [VectorComponent] outside a vector

**Severity:** Warning

**Message:** '…' has [VectorComponent] but the type '…' is not marked with [Vector].

*This diagnostic has no example shader yet.*

## YS0010: Non-constant initial value

**Severity:** Warning

**Message:** The initial value of '…' is not constant; on the GPU the component starts at 0.

*This diagnostic has no example shader yet.*

## YS0011: Type without a GPU representation

**Severity:** Error

**Message:** The type '…' does not exist on the GPU (…). Use scalars, vectors, matrices, arrays or structs of those types.

*This diagnostic has no example shader yet.*


---
title: Language
summary: Stages, structures and attributes.
order: 1
---

## Stages

`[ShaderStage(Stage.Vertex)]`, `[ShaderStage(Stage.Fragment)]` and `[ShaderStage(Stage.Compute)]` mark entry points.

## Structures

Plain C# `struct` types describe stage inputs and outputs. Fields carry attributes that identify built-ins, locations and semantics.

### Attribute vocabularies

Five equivalent vocabularies exist; see [How it works](../get-started/how-it-works.md).

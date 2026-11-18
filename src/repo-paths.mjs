// Where each project of the compiler repository lives, relative to its root (the folder that contains Web/).
// The folders follow the solution folders of YotsubaShader.sln. Update this table if a project moves.
export const PROJECT_DIRS = {
  'YotsubaShader.Compiler.Library': 'Core/YotsubaShader.Compiler.Library',
  'YotsubaShader.Compiler.CLI': 'Core/YotsubaShader.Compiler.CLI',
  'YotsubaShader.Compiler.SpirV': 'Core/Compilers/YotsubaShader.Compiler.SpirV',
  'YotsubaShader.Roslyn': 'Core/Analyzers/YotsubaShader.Roslyn',
  'YotsubaShader.IDE.Analyzer': 'Core/Analyzers/YotsubaShader.IDE.Analyzer',
  'YotsubaShader.IR': 'Core/Representations/YotsubaShader.IR',
  'YotsubaShader.Language': 'Core/Representations/YotsubaShader.Language',
  'YotsubaShader.Concepts': 'Core/Syntax/YotsubaShader.Concepts',
  'YotsubaShader.GlslSyntax': 'Core/Syntax/YotsubaShader.GlslSyntax',
  'YotsubaShader.HlslSyntax': 'Core/Syntax/YotsubaShader.HlslSyntax',
  'YotsubaShader.MslSyntax': 'Core/Syntax/YotsubaShader.MslSyntax',
  'YotsubaShader.SpirvSyntax': 'Core/Syntax/YotsubaShader.SpirvSyntax',
  'YotsubaShader.WgslSyntax': 'Core/Syntax/YotsubaShader.WgslSyntax',
  'YotsubaShader.Extensions': 'Plugins/YotsubaShader.Extensions',
  'YotsubaShader.Generator': 'Tools/YotsubaShader.Generator',
  'YotsubaShader.Example': 'Examples/YotsubaShader.Example',
};

/** 'YotsubaShader.IR/Intermediate/Shader.cs' -> 'Core/Representations/YotsubaShader.IR/Intermediate/Shader.cs' */
export function repoPath(file) {
  const [project, ...rest] = file.split('/');
  return [PROJECT_DIRS[project] ?? project, ...rest].join('/');
}

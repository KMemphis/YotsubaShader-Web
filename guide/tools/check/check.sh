#!/bin/sh
# Compiles every C# listing of the guide. Run it after editing anything in code/en/.
cd "$(dirname "$0")"
CODE=../../code/en
rm -rf obj/wrapped && mkdir -p obj/wrapped
{ echo 'using YotsubaShader.Language.Compiler; public partial class Lit {'; sed 1,2d "$CODE/LitLogic.cs"; echo '}'; } > obj/wrapped/LitLogic.cs
cp "$CODE/ReflectionTest.cs" obj/wrapped/ReflectionTest.cs
dotnet build Check.csproj -nologo -v q 2>&1 | grep -E "error|Warn|Error|Elapsed" | sort -u | head -40

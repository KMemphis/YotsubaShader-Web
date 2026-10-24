#!/usr/bin/env python3
"""Compile website examples against the checkout's authoring declarations.

Run: python3 Web/tools/check-api-examples.py
Only temporary files under Web/ are written. No repository project is built.
This checks C# API compatibility, not GPU lowering or SPIR-V correctness.
"""
import json
from pathlib import Path
import re
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[2]
EXAMPLES = r"""
import {BASIC_COLOR, STYLE_TRIANGLE, TYPES_CS, TYPES_TEXTURE_CS, TEXTURE_BINDING, withoutXna} from './Web/src/snippets.mjs';
import {resourcesCode} from './Web/src/pages/syntaxes.mjs';
import {builtinValuesCode,attributeGroupCode} from './Web/src/examples.mjs';
import {scanSyntaxes} from './Web/src/reference.mjs';
import buildDocs from './Web/src/docs/docs.mjs';
import technologies from './Web/src/pages/technologies.mjs';
const list=[['basic',withoutXna(BASIC_COLOR),TYPES_CS],['texture',TEXTURE_BINDING,TYPES_TEXTURE_CS]];
const syntaxes=scanSyntaxes(process.cwd());
for(const id of Object.keys(STYLE_TRIANGLE)) {
 list.push([`triangle-${id}`,STYLE_TRIANGLE[id],TYPES_CS]);
 list.push([`resources-${id}`,resourcesCode(id),TYPES_CS]);
 list.push([`builtins-${id}`,builtinValuesCode(id),TYPES_CS]);
 for(const group of ['Input','Output','Input / Output','Method','Resource','Type']) {
  const code=attributeGroupCode(id,syntaxes[id].items,group);
  if(code) list.push([`reference-${id}-${group.replace(/\W/g,'')}`,code,TYPES_CS]);
 }
}
const selected = new Set(['writing-your-first-shader','reusing-your-types-and-libraries','types-for-engines-and-frameworks','interface-slots-and-locations','uniforms-and-storage-buffers','shader-parameters-for-your-engine']);
for(const article of buildDocs({syntaxes}).articles.filter(a=>selected.has(a.slug))) {
 let index=0;
 for(const block of article.body.matchAll(/<figure class="code" data-lang="csharp">[\s\S]*?<pre><code>([\s\S]*?)<\/code><\/pre>/g)) {
  const source=withoutXna(block[1].replace(/<[^>]+>/g,'').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,'&'));
  list.push([`article-${article.slug}-${++index}`,source,source.includes('public struct Vector2') ? '' : TYPES_CS]);
 }
}
for(const page of technologies({}).filter(p=>p.path==='/technologies/language/')) {
 let index=0;
 for(const block of page.body.matchAll(/<figure class="code" data-lang="csharp">[\s\S]*?<pre><code>([\s\S]*?)<\/code><\/pre>/g)) {
  const source=withoutXna(block[1].replace(/<[^>]+>/g,'').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,'&'));
  list.push([`language-${++index}`,source,TYPES_CS]);
 }
}
console.log(JSON.stringify(list));
"""


def main():
    sdks = subprocess.check_output(['dotnet', '--list-sdks'], text=True)
    sdk = next((Path(folder) / version for version, folder in
                re.findall(r'^(8\.\S+) \[([^\]]+)\]', sdks, re.M)), None)
    if sdk is None:
        raise SystemExit('.NET 8 SDK is required for the API example check.')
    pack_root = sdk.parent.parent / 'packs' / 'Microsoft.NETCore.App.Ref'
    packs = sorted(pack_root.glob('8.0.*/ref/net8.0'),
                   key=lambda p: tuple(map(int, p.parents[1].name.split('.'))))
    if not packs:
        raise SystemExit('.NET 8 reference assemblies were not found.')
    csc = sdk / 'Roslyn/bincore/csc.dll'
    command = ['dotnet', str(csc), '-nologo', '-target:library',
               '-langversion:latest', '-nullable:enable']
    command += ['-r:' + str(p) for p in packs[-1].glob('*.dll')]
    cases = json.loads(subprocess.check_output(
        ['node', '--input-type=module', '-e', EXAMPLES], cwd=ROOT, text=True))
    failed = []
    with tempfile.TemporaryDirectory(prefix='.api-check-', dir=ROOT / 'Web') as temp:
        folder = Path(temp)
        globals_file = folder / 'Globals.cs'
        globals_file.write_text('\n'.join('global using ' + name + ';' for name in [
            'System', 'System.Collections.Generic', 'System.Linq', 'System.Threading',
            'System.Threading.Tasks', 'YotsubaShader.Concepts',
            'YotsubaShader.Concepts.Vertex', 'YotsubaShader.Concepts.Fragment',
            'YotsubaShader.Concepts.Compute']))
        sources = [str(globals_file)]
        for name in ['Language', 'Concepts', 'HlslSyntax', 'GlslSyntax',
                     'MslSyntax', 'SpirvSyntax', 'WgslSyntax']:
            sources.extend(str(p) for p in (ROOT / ('YotsubaShader.' + name)).rglob('*.cs')
                           if 'obj' not in p.parts and 'bin' not in p.parts)
        assembly = folder / 'Authoring.dll'
        result = subprocess.run(command + ['-out:' + str(assembly)] + sources,
                                capture_output=True, text=True)
        if result.returncode:
            raise SystemExit(result.stdout + result.stderr)
        for name, source, types in cases:
            (folder / 'Example.cs').write_text(source)
            (folder / 'Types.cs').write_text(types)
            (folder / 'UserGlobals.cs').write_text(
                'global using System;\nglobal using System.Collections.Generic;')
            result = subprocess.run(command + ['-r:' + str(assembly),
                '-out:' + str(folder / 'Example.dll'), str(folder / 'Example.cs'),
                str(folder / 'Types.cs'), str(folder / 'UserGlobals.cs')],
                capture_output=True, text=True)
            if result.returncode:
                failed.append(name)
                print(name + '\n' + result.stdout + result.stderr)
    print(f'{len(cases) - len(failed)}/{len(cases)} examples compile against current authoring sources.')
    if failed:
        raise SystemExit(1)


if __name__ == '__main__':
    main()

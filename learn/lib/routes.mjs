// Route templating for the Get Started: one source file, one page per route (XNA, Godot...).
//   :::godot            block that only exists in the Godot route (several routes: `:::xna godot`)
//   ...
//   :::
//   {{name}}            variable of the route (ROUTE_TEXT.<route>.<lang>.vars.name)
//   {{macro a b}}       template of the route (ROUTE_TEXT.<route>.<lang>.macros.macro) with $1, $2 replaced
// It runs on the Markdown text before it is tokenized, so it also works inside code blocks.

export function applyRoute(body, routeIds, text) {
  const ids = [].concat(routeIds);
  const out = [];
  const lines = body.replace(/\r\n/g, '\n').split('\n');
  let skip = null; // depth of the block being skipped
  const stack = [];
  for (const line of lines) {
    const open = line.match(/^:::([\w-]+(?:\s+[\w-]+)*)\s*$/);
    if (open) {
      const keep = open[1].split(/\s+/).some((n) => ids.includes(n));
      stack.push(keep);
      continue;
    }
    if (/^:::\s*$/.test(line)) { stack.pop(); continue; }
    if (stack.every(Boolean)) out.push(line);
  }
  if (stack.length) throw new Error('unclosed ::: block');
  const { vars = {}, macros = {} } = text || {};
  const missing = new Set();
  const expand = (name, argStr) => {
    const args = argStr.trim() ? argStr.trim().split(/\s+/) : [];
    if (name in macros) return typeof macros[name] === 'function' ? macros[name](...args) : macros[name].replace(/\$(\d)/g, (_, n) => args[n - 1] ?? '');
    if (name in vars) return vars[name];
    missing.add(name);
    return null;
  };
  const re = /\{\{\s*([\w.-]+)((?:\s+[^\s}]+)*)\s*\}\}/g;
  const res = out
    .map((line) => {
      // a macro alone on its line keeps the line's indentation on every line it expands to
      const alone = line.match(/^(\s*)\{\{\s*([\w.-]+)((?:\s+[^\s}]+)*)\s*\}\}\s*$/);
      if (alone) { const t = expand(alone[2], alone[3]); if (t === '') return null; return t === null ? line : t.split('\n').map((l) => alone[1] + l).join('\n'); }
      return line.replace(re, (all, name, argStr) => expand(name, argStr) ?? all);
    })
    .filter((l) => l !== null)
    .join('\n');
  if (missing.size) throw new Error(`unknown route variable(s): ${[...missing].join(', ')}`);
  return res;
}

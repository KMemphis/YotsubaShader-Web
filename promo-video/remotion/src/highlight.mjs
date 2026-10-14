// Tiny dependency-free syntax highlighter (C#, bash, SPIR-V assembly, JSON-ish).
// It runs at build time, so the published pages need no client-side library.

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const CS_KEYWORDS = new Set(
  `public private protected internal static sealed readonly partial abstract override virtual class struct
   enum interface record namespace using new return if else for foreach while do switch case break continue
   var const void uint int float double bool string byte long short ushort ulong char object true false null
   this base get set init required in out ref is as typeof nameof default where async await yield throw try
   catch finally lock`
    .split(/\s+/),
);

const CS_TOKEN = new RegExp(
  [
    '(?<comment>//[^\\n]*|/\\*[\\s\\S]*?\\*/)',
    '(?<string>\\$?@?"(?:[^"\\\\\\n]|\\\\.)*")',
    '(?<attr>(?<=\\[)@?[A-Za-z_][\\w.]*)',
    '(?<number>\\b\\d[\\d_]*(?:\\.\\d+)?(?:[fFuUdDmM]|[eE][+-]?\\d+)?\\b)',
    '(?<word>@?[A-Za-z_]\\w*)',
  ].join('|'),
  'g',
);


// Colors a capitalized identifier by its role: namespace, type, method or member (field, property, enum value).
function roleOf(src, index, text, after) {
  const before = src.slice(0, index);
  const lineStart = before.slice(before.lastIndexOf('\n') + 1);
  if (/^\s*(using|namespace)\s+[\w.]*$/.test(lineStart)) return 'ns';
  const trimmed = before.trimEnd();
  const prevChar = trimmed.slice(-1);
  const prevWord = (/([@A-Za-z_]\w*)$/.exec(trimmed) || [])[1];
  if (prevChar === '.') return after === '(' ? 'f' : 'p';
  // Later items of an attribute list: [StorageBuffer, DescriptorSet(0)]
  if (prevChar === ',') {
    const open = lineStart.lastIndexOf('[');
    if (open > -1 && !lineStart.slice(open).includes(']') && !/[\w)\]]/.test(lineStart[open - 1] || ' ')) return 'a';
  }
  if (prevWord === 'new' || prevWord === 'class' || prevWord === 'struct' || prevWord === 'interface' || prevWord === 'enum' || prevWord === 'record') return 't';
  if (after === '(') return 'f';
  // A name that follows a type is a declaration: field, property or parameter.
  const afterType = (prevWord && !CS_KEYWORDS.has(prevWord)) || prevChar === '>' || prevChar === ']';
  return afterType ? 'p' : 't';
}

function highlightCSharp(src) {
  let out = '';
  let last = 0;
  for (const m of src.matchAll(CS_TOKEN)) {
    out += esc(src.slice(last, m.index));
    const text = m[0];
    const g = m.groups;
    const after = src[m.index + text.length];
    if (g.comment) out += `<span class="tok-c">${esc(text)}</span>`;
    else if (g.string) out += `<span class="tok-s">${esc(text)}</span>`;
    else if (g.attr) out += `<span class="tok-a">${esc(text)}</span>`;
    else if (g.number) out += `<span class="tok-n">${esc(text)}</span>`;
    else if (CS_KEYWORDS.has(text)) out += `<span class="tok-k">${esc(text)}</span>`;
    else if (/^@?[A-Z]/.test(text)) out += `<span class="tok-${roleOf(src, m.index, text, after)}">${esc(text)}</span>`;
    else out += esc(text);
    last = m.index + text.length;
  }
  return out + esc(src.slice(last));
}

function highlightBash(src) {
  return src
    .split('\n')
    .map((line) => {
      const hash = line.indexOf(' #');
      let body = line;
      let comment = '';
      if (/^\s*#/.test(line)) {
        return `<span class="tok-c">${esc(line)}</span>`;
      }
      if (hash > -1) {
        body = line.slice(0, hash);
        comment = `<span class="tok-c">${esc(line.slice(hash))}</span>`;
      }
      const html = esc(body)
        .replace(/(^|\s)(--?[A-Za-z][\w-]*)/g, '$1<span class="tok-a">$2</span>')
        .replace(/^(\s*)(dotnet|git|yotsuba|spirv-val|spirv-dis|cd|npm|node)\b/, '$1<span class="tok-k">$2</span>');
      return html + comment;
    })
    .join('\n');
}

function highlightSpirv(src) {
  return src
    .split('\n')
    .map((line) => {
      if (/^\s*;/.test(line)) return `<span class="tok-c">${esc(line)}</span>`;
      return esc(line)
        .replace(/(%[\w.]+)/g, '<span class="tok-t">$1</span>')
        .replace(/\b(Op[A-Za-z]+)\b/g, '<span class="tok-k">$1</span>')
        .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="tok-n">$1</span>');
    })
    .join('\n');
}

function highlightXml(src) {
  return esc(src)
    .replace(/(&lt;\/?)([\w.]+)/g, '$1<span class="tok-k">$2</span>')
    .replace(/([\w.]+)=(&quot;[^&]*?&quot;)/g, '<span class="tok-a">$1</span>=<span class="tok-s">$2</span>');
}

export function highlight(lang, src) {
  switch (lang) {
    case 'xml':
      return highlightXml(src);
    case 'csharp':
    case 'cs':
      return highlightCSharp(src);
    case 'bash':
    case 'sh':
      return highlightBash(src);
    case 'spirv':
      return highlightSpirv(src);
    default:
      return esc(src);
  }
}

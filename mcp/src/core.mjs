import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { makeApi, STYLES } from './api.mjs';

const text = (value) => ({ content: [{ type: 'text', text: typeof value === 'string' ? value : JSON.stringify(value, null, 2) }] });
const missing = (what) => ({ isError: true, content: [{ type: 'text', text: what }] });

const lang = z.enum(['en', 'es']).optional().describe('Language of the documentation: "en" (default) or "es".');
const style = z.string().optional().describe(`Syntax (style): ${STYLES.join(', ')}. Aliases: spirv, metal, webgpu.`);

/**
 * Builds the MCP server. `data` is { docs: { en, es }, examples } as written by gen-mcp-data.mjs and
 * build-examples.mjs.
 */
export function createServer(data, version = '0.1.0') {
  const api = makeApi(data);
  const server = new McpServer({ name: 'yotsubashader', version }, {
    instructions: 'Yotsuba Shader lets you write shaders in C# and compile them to SPIR-V, GLSL, HLSL, MSL and WGSL. ' +
      'Search the documentation with search_docs, read a page with get_doc, look up a diagnostic (YS0000) with get_diagnostic, ' +
      'and start from a working shader with list_examples / get_example. There are five syntaxes (styles): hlsl, glsl, msl, vulkan (SPIR-V) and wgsl; the style only changes how the shader is written, not which backends it compiles to.',
  });

  server.registerTool('search_docs', {
    title: 'Search the documentation',
    description: 'Full-text search over the Yotsuba Shader reference (language, attributes, compiler, targets, diagnostics). Returns the best pages with a snippet.',
    inputSchema: { query: z.string().describe('Words to look for, e.g. "uniform buffer" or "YS0508".'), lang, limit: z.number().int().min(1).max(25).optional() },
  }, ({ query, lang: l, limit }) => text(api.searchDocs(query, l, limit)));

  server.registerTool('list_docs', {
    title: 'List documentation pages',
    description: 'Lists every page of the reference with its slug, title and summary. Use the slug with get_doc.',
    inputSchema: { lang },
  }, ({ lang: l }) => text(api.listDocs(l)));

  server.registerTool('get_doc', {
    title: 'Read a documentation page',
    description: 'Returns the Markdown of a reference page. With `style`, the code tabs of the other styles are left out.',
    inputSchema: { slug: z.string().describe('Page slug from list_docs, e.g. "hlsl", "targets", "validate-vulkan".'), lang, style },
  }, ({ slug, lang: l, style: s }) => {
    const doc = api.getDoc(slug, l, s);
    return doc ? text(`# ${doc.title}\n\nSource: ${doc.url}\n\n${doc.markdown}`) : missing(`No page "${slug}". Use list_docs to see the slugs.`);
  });

  server.registerTool('list_diagnostics', {
    title: 'List diagnostics',
    description: 'Lists the analyzer diagnostics (YS0000 codes) with severity. `filter` narrows by code, title or page.',
    inputSchema: { lang, filter: z.string().optional() },
  }, ({ lang: l, filter }) => text(api.listDiagnostics(l, filter)));

  server.registerTool('get_diagnostic', {
    title: 'Explain a diagnostic',
    description: 'Returns the description, message and example shader of a diagnostic such as YS0508.',
    inputSchema: { code: z.string().describe('Diagnostic id, e.g. "YS0508".'), lang },
  }, ({ code, lang: l }) => {
    const found = api.getDiagnostic(code, l);
    return found.length ? text(found.map((g) => g.markdown).join('\n\n')) : missing(`No diagnostic "${code}". Use list_diagnostics.`);
  });

  server.registerTool('list_examples', {
    title: 'List example shaders',
    description: '100 working example shaders, 20 for each style. Filter by `style` and/or `tag` (e.g. raymarching, noise, fractal, gradient).',
    inputSchema: { style, tag: z.string().optional() },
  }, ({ style: s, tag }) => text(api.listExamples({ style: s, tag })));

  server.registerTool('get_example', {
    title: 'Get an example shader',
    description: 'Returns the C# source of an example. Every example compiles for all the targets of its style.',
    inputSchema: { id: z.string().describe('Example id from list_examples, e.g. "hlsl-plasma".'), lang },
  }, ({ id, lang: l }) => {
    const e = api.getExample(id, l);
    return e ? text(`# ${e.title} (${e.syntax})\n\n${e.description}\n\n${e.credit}${e.notes ? `\n\nNote: ${e.notes}` : ''}\n\n\`\`\`csharp\n${e.code}\n\`\`\``) : missing(`No example "${id}". Use list_examples.`);
  });

  server.registerTool('search_examples', {
    title: 'Search example shaders',
    description: 'Finds examples by effect or technique, e.g. "fractal", "water", "voronoi".',
    inputSchema: { query: z.string(), style, limit: z.number().int().min(1).max(25).optional() },
  }, ({ query, style: s, limit }) => text(api.searchExamples(query, s, limit)));

  server.registerResource('doc', new ResourceTemplate('yotsuba://docs/{lang}/{slug}', {
    list: () => ({ resources: ['en', 'es'].flatMap((l) => api.listDocs(l).map((d) => ({ uri: `yotsuba://docs/${l}/${d.slug}`, name: `${d.title} (${l})`, description: d.summary, mimeType: 'text/markdown' }))) }),
  }), { title: 'Documentation page', mimeType: 'text/markdown' }, (uri, { lang: l, slug }) => {
    const doc = api.getDoc(slug, l);
    if (!doc) throw new Error(`No page ${slug}`);
    return { contents: [{ uri: uri.href, mimeType: 'text/markdown', text: `# ${doc.title}\n\n${doc.markdown}` }] };
  });

  server.registerResource('example', new ResourceTemplate('yotsuba://examples/{id}', {
    list: () => ({ resources: api.listExamples().map((e) => ({ uri: `yotsuba://examples/${e.id}`, name: `${e.title} (${e.style})`, description: e.description, mimeType: 'text/x-csharp' })) }),
  }), { title: 'Example shader', mimeType: 'text/x-csharp' }, (uri, { id }) => {
    const e = api.getExample(id);
    if (!e) throw new Error(`No example ${id}`);
    return { contents: [{ uri: uri.href, mimeType: 'text/x-csharp', text: e.code }] };
  });

  server.registerPrompt('write_shader', {
    title: 'Write a shader',
    description: 'Asks for a new shader in a given style, grounded on the closest example and the documentation.',
    argsSchema: { style: z.string().describe(`One of ${STYLES.join(', ')}`), goal: z.string().describe('What the shader should draw or compute.') },
  }, ({ style: s, goal }) => ({
    messages: [{ role: 'user', content: { type: 'text', text: `Write a Yotsuba Shader in the ${s} style that does this: ${goal}\n\nFirst call search_examples and get_example to start from the closest working example, and get_doc for the syntax page of ${s}. Return one complete C# file.` } }],
  }));

  return server;
}

export { makeApi };

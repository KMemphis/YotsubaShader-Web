// Cloudflare Worker: the same server over Streamable HTTP, stateless (one server per request).
//   npx wrangler deploy
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { createServer } from './core.mjs';
import en from '../data/docs-en.json' with { type: 'json' };
import es from '../data/docs-es.json' with { type: 'json' };
import examples from '../data/examples.json' with { type: 'json' };

const data = { docs: { en, es }, examples };
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET, POST, DELETE, OPTIONS', 'access-control-expose-headers': 'mcp-session-id' };

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    if (url.pathname !== '/mcp') {
      return new Response('Yotsuba Shader MCP server. Connect an MCP client to /mcp (Streamable HTTP).\nDocs: https://learn.yotsubashader.com/en/reference/mcp/\n', { headers: { 'content-type': 'text/plain; charset=utf-8', ...CORS } });
    }
    const server = createServer(data);
    const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
    await server.connect(transport);
    const response = await transport.handleRequest(request);
    const headers = new Headers(response.headers);
    for (const [k, v] of Object.entries(CORS)) headers.set(k, v);
    return new Response(response.body, { status: response.status, headers });
  },
};

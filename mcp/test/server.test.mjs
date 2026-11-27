import test from 'node:test';
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../src/core.mjs';
import { loadData } from '../src/data.mjs';

async function connect() {
  const [a, b] = InMemoryTransport.createLinkedPair();
  await createServer(loadData()).connect(b);
  const client = new Client({ name: 'test', version: '0' });
  await client.connect(a);
  return client;
}

test('the server exposes the tools, resources and the prompt', async () => {
  const client = await connect();
  const tools = (await client.listTools()).tools.map((t) => t.name).sort();
  assert.deepEqual(tools, ['get_diagnostic', 'get_doc', 'get_example', 'list_diagnostics', 'list_docs', 'list_examples', 'search_docs', 'search_examples']);
  const data = loadData();
  assert.equal((await client.listResources()).resources.length, data.docs.en.docs.length + data.docs.es.docs.length + data.examples.length);
  assert.equal((await client.listPrompts()).prompts[0].name, 'write_shader');
});

test('tools answer over the protocol', async () => {
  const client = await connect();
  const r = await client.callTool({ name: 'get_example', arguments: { id: 'wgsl-plasma' } });
  assert.match(r.content[0].text, /```csharp/);
  const bad = await client.callTool({ name: 'get_example', arguments: { id: 'nope' } });
  assert.equal(bad.isError, true);
  const res = await client.readResource({ uri: 'yotsuba://examples/msl-voronoi' });
  assert.match(res.contents[0].text, /ShaderStage/);
});

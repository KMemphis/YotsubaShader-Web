#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './core.mjs';
import { loadData } from './data.mjs';

await createServer(loadData()).connect(new StdioServerTransport());

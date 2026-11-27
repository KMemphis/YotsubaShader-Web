import test from 'node:test';
import assert from 'node:assert/strict';
import { makeApi, STYLES } from '../src/api.mjs';
import { loadData } from '../src/data.mjs';

const api = makeApi(loadData());

test('20 examples for each of the five styles', () => {
  for (const s of STYLES) assert.equal(api.listExamples({ style: s }).length, 20, s);
  assert.equal(api.listExamples().length, 100);
});

test('example ids are unique and carry code', () => {
  const ids = api.listExamples().map((e) => e.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.match(api.getExample(id).code, /ShaderStage/);
});

test('aliases resolve to styles', () => {
  assert.equal(api.listExamples({ style: 'spirv' }).length, 20);
  assert.equal(api.listExamples({ style: 'Metal' }).length, 20);
});

test('search_docs finds the diagnostics and the syntax pages', () => {
  assert.ok(api.searchDocs('YS0508').some((h) => h.title.startsWith('YS0508')));
  assert.ok(api.searchDocs('SV_Position', 'en').some((h) => h.slug === 'hlsl'));
  assert.ok(api.searchDocs('uniforme', 'es').length > 0);
});

test('get_doc filters code tabs by style', () => {
  const doc = api.getDoc('targets', 'en', 'hlsl');
  assert.ok(doc);
  assert.ok(!/style=glsl/.test(doc.markdown));
});

test('get_diagnostic and unknown ids', () => {
  assert.equal(api.getDiagnostic('ys0508').length, 1);
  assert.equal(api.getDiagnostic('YS9999').length, 0);
  assert.equal(api.getDoc('nope'), undefined);
});

test('search_examples finds by technique', () => {
  assert.ok(api.searchExamples('voronoi').length >= 5);
  assert.ok(api.searchExamples('raymarching', 'wgsl').every((e) => e.style === 'wgsl'));
});

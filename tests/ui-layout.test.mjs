import test from 'node:test';
import assert from 'node:assert/strict';

import { renderHtml } from '../.tmp-test-build/ui.js';

test('renderHtml should expose inline feature navigation instead of manager drawer', () => {
  const html = renderHtml('测试项目');

  assert.match(html, /id="featureNav"/);
  assert.match(html, /data-panel="create"/);
  assert.match(html, /data-panel="backup"/);
  assert.match(html, /data-panel="list"/);

  assert.doesNotMatch(html, /id="openManager"/);
  assert.doesNotMatch(html, /id="manager"/);
  assert.doesNotMatch(html, /id="managerMask"/);
});

test('renderHtml should not include random popup or browser popup APIs', () => {
  const html = renderHtml('测试项目');

  assert.doesNotMatch(html, /id="randomOverlay"/);
  assert.doesNotMatch(html, /window\.alert\(/);
  assert.doesNotMatch(html, /window\.prompt\(/);
});

test('renderHtml should include dialog confirmation for risky actions', () => {
  const html = renderHtml('测试项目');

  assert.match(html, /id="confirmOverlay"/);
  assert.match(html, /id="undoDelete"/);
  assert.match(html, /覆盖导入会替换当前全部愿望/);
  assert.doesNotMatch(html, /id="replaceConfirmText"/);
  assert.doesNotMatch(html, /id="replaceConfirm"/);
});

test('renderHtml should include Pico.css baseline stylesheet', () => {
  const html = renderHtml('测试项目');
  assert.match(html, /@picocss\/pico@2\/css\/pico\.min\.css/);
  assert.doesNotMatch(html, /<style>/);
});

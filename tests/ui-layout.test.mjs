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

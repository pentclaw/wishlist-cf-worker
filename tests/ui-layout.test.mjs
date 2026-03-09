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
  assert.match(html, /<style>/);
});

test('renderHtml should expose accessible live status regions and labels', () => {
  const html = renderHtml('测试项目');

  assert.match(html, /<label for="loginPassword">验证密码<\/label>/);
  assert.match(html, /id="setupStatus"[^>]*role="status"[^>]*aria-live="polite"/);
  assert.match(html, /id="loginStatus"[^>]*role="status"[^>]*aria-live="polite"/);
  assert.match(html, /id="createStatus"[^>]*role="status"[^>]*aria-live="polite"/);
  assert.match(html, /id="manageStatus"[^>]*role="status"[^>]*aria-live="polite"/);
  assert.match(html, /id="backupStatus"[^>]*role="status"[^>]*aria-live="polite"/);
});

test('renderHtml should keep client validation limits aligned with server', () => {
  const html = renderHtml('测试项目');

  assert.match(html, /id="setupName"[^>]*maxlength="40"/);
  assert.match(html, /id="setupPassword"[^>]*minlength="8"[^>]*maxlength="128"/);
  assert.match(html, /id="wishTitle"[^>]*maxlength="120"/);
  assert.match(html, /id="wishDesc"[^>]*maxlength="2000"/);
});

test('renderHtml should keep login form compatible with legacy short passwords', () => {
  const html = renderHtml('测试项目');

  assert.match(html, /id="loginPassword"[^>]*minlength="4"/);
  assert.doesNotMatch(html, /id="loginPassword"[^>]*minlength="8"/);
});

test('renderHtml should include responsive rules for mobile layout', () => {
  const html = renderHtml('测试项目');

  assert.match(html, /@media\s*\(max-width:\s*768px\)/);
  assert.match(html, /#featureNav ul/);
  assert.match(html, /#mainLayout nav ul/);
});

test('renderHtml should include manage list page cache helpers', () => {
  const html = renderHtml('测试项目');

  assert.match(html, /managePageCache:\s*new Map\(\)/);
  assert.match(html, /function manageCacheKey\(/);
  assert.match(html, /function invalidateManageCache\(/);
  assert.match(html, /const cached = state\.managePageCache\.get\(cacheKey\)/);
});

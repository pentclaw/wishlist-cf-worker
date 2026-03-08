export function renderHtml(projectName: string): string {
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
    <style>
      :root {
        --bg: #fffaf0;
        --surface: #ffffff;
        --text: #2f1d0f;
        --muted: #7e6656;
        --primary: #da6931;
        --primary-soft: #ffe2d0;
        --accent: #2a9d8f;
        --border: #f1d8c8;
        --danger: #b23a48;
        --shadow: 0 16px 40px rgba(73, 34, 12, 0.12);
        --space-1: 6px;
        --space-2: 8px;
        --space-3: 10px;
        --space-4: 12px;
        --space-5: 16px;
        --space-6: 18px;
        --space-7: 24px;
        --space-8: 28px;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        font-family: "Noto Serif SC", "Songti SC", "STKaiti", "Baskerville", serif;
        color: var(--text);
        background: var(--bg);
        min-height: 100dvh;
      }

      .wrap {
        max-width: 1080px;
        margin: 0 auto;
        padding: var(--space-7) var(--space-5) calc(var(--space-7) * 2);
      }

      .topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-4);
        margin-bottom: var(--space-5);
      }

      .brand {
        margin: 0;
        font-size: clamp(1.6rem, 2vw + 1rem, 2.4rem);
      }

      h1,
      h2,
      h3 {
        text-wrap: balance;
      }

      p {
        text-wrap: pretty;
      }

      .owner {
        margin: var(--space-1) 0 0;
        color: var(--muted);
      }

      .button {
        border: 1px solid transparent;
        background: var(--primary);
        color: #fff;
        border-radius: 999px;
        font-weight: 700;
        cursor: pointer;
        padding: var(--space-3) var(--space-5);
        line-height: 1.2;
        transition: transform 120ms ease, box-shadow 120ms ease, opacity 120ms ease;
      }

      .button:focus-visible {
        outline: 3px solid color-mix(in srgb, var(--primary) 45%, #fff);
        outline-offset: 2px;
      }

      .button:hover {
        transform: translateY(-1px);
        box-shadow: 0 8px 16px rgba(218, 105, 49, 0.22);
      }

      .button:disabled {
        opacity: 0.55;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }

      .button.secondary {
        background: var(--surface);
        color: var(--text);
        border-color: var(--border);
      }

      .button.ghost {
        background: transparent;
        color: var(--muted);
        border-color: var(--border);
      }

      .button.danger {
        background: var(--danger);
      }

      .layout {
        display: grid;
        grid-template-columns: 1.2fr 1fr;
        gap: var(--space-5);
      }

      .card {
        border-radius: 18px;
        border: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.88);
        box-shadow: var(--shadow);
        padding: var(--space-6);
      }

      .card h2,
      .card h3 {
        margin: 0 0 var(--space-4);
        font-size: 1.15rem;
      }

      .card h3 {
        font-size: 1.05rem;
      }

      .summary {
        color: var(--muted);
        margin: 0;
      }

      .completed-list,
      .manage-list {
        display: grid;
        gap: var(--space-3);
      }

      .wish-item {
        border: 1px solid var(--border);
        border-radius: 14px;
        background: #fff;
        padding: var(--space-4);
      }

      .wish-item.done {
        border-color: #bfe5dc;
        background: #f3fffb;
      }

      .wish-title {
        font-weight: 700;
        margin-bottom: var(--space-1);
      }

      .wish-desc {
        margin: 0;
        color: var(--muted);
        white-space: pre-wrap;
      }

      .wish-meta {
        margin-top: var(--space-2);
        font-size: 0.82rem;
        color: #9e8372;
        font-variant-numeric: tabular-nums;
      }

      .empty {
        color: #9e8372;
        margin: 0;
      }

      .setup {
        display: none;
        max-width: 560px;
        margin: var(--space-8) auto 0;
      }

      .public-hint {
        display: none;
        max-width: 760px;
        margin: var(--space-8) auto 0;
        text-align: center;
        gap: var(--space-4);
      }

      .public-hint-visual {
        width: min(100%, 360px);
        margin: var(--space-1) auto 0;
        display: block;
      }

      .public-hint-title {
        margin: var(--space-2) 0 0;
        font-size: clamp(1.2rem, 1.6vw + 0.8rem, 1.8rem);
      }

      .public-hint-desc {
        margin: var(--space-1) auto 0;
        max-width: 44ch;
        color: var(--muted);
      }

      .form {
        display: grid;
        gap: var(--space-4);
      }

      .field {
        display: grid;
        gap: var(--space-2);
      }

      label {
        font-weight: 700;
      }

      input,
      textarea {
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: var(--space-3) var(--space-4);
        font: inherit;
        background: #fff;
      }

      textarea {
        min-height: 92px;
        resize: vertical;
      }

      .inline {
        display: flex;
        align-items: center;
        gap: var(--space-2);
      }

      .status {
        margin: 0;
        color: var(--muted);
        min-height: 1.2em;
      }

      .overlay {
        position: fixed;
        inset: 0;
        background: rgba(52, 32, 18, 0.48);
        display: none;
        align-items: center;
        justify-content: center;
        padding:
          max(var(--space-5), env(safe-area-inset-top))
          max(var(--space-5), env(safe-area-inset-right))
          max(var(--space-5), env(safe-area-inset-bottom))
          max(var(--space-5), env(safe-area-inset-left));
        z-index: 20;
      }

      .overlay.open {
        display: flex;
      }

      .popup {
        max-width: 420px;
        width: 100%;
        background: #fff;
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: var(--space-6);
      }

      .dialog {
        max-width: 420px;
        width: 100%;
        background: #fff;
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: var(--space-6);
      }

      .dialog-message {
        margin: 0;
        color: var(--text);
      }

      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        flex-wrap: wrap;
        gap: var(--space-3);
        margin-top: var(--space-4);
      }

      .manager {
        position: fixed;
        top: 0;
        right: 0;
        width: min(520px, 100%);
        height: 100dvh;
        background: #fffefc;
        border-left: 1px solid var(--border);
        box-shadow: -14px 0 30px rgba(71, 38, 17, 0.12);
        padding:
          calc(var(--space-6) + env(safe-area-inset-top))
          calc(var(--space-6) + env(safe-area-inset-right))
          calc(var(--space-6) + env(safe-area-inset-bottom))
          calc(var(--space-6) + env(safe-area-inset-left));
        transform: translateX(100%);
        transition: transform 180ms ease;
        z-index: 30;
        overflow-y: auto;
      }

      .manager.open {
        transform: translateX(0);
      }

      .manager-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .section-gap-sm {
        margin-top: var(--space-3);
      }

      .section-gap-md {
        margin-top: var(--space-4);
      }

      .wish-actions {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-3);
        margin-top: var(--space-3);
      }

      .wish-actions .button {
        padding: var(--space-1) var(--space-3);
        font-size: 0.86rem;
      }

      .manage-toolbar {
        display: grid;
        gap: var(--space-4);
        margin-bottom: var(--space-4);
      }

      .backup-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--space-3);
        margin-top: var(--space-3);
      }

      .backup-modes {
        flex-direction: column;
        align-items: flex-start;
      }

      .search-form {
        display: flex;
        gap: var(--space-3);
      }

      .search-input {
        flex: 1;
      }

      .manage-meta {
        color: var(--muted);
        font-size: 0.9rem;
        font-variant-numeric: tabular-nums;
      }

      .pager {
        margin-top: var(--space-4);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-3);
      }

      .pager-info {
        color: var(--muted);
        font-size: 0.9rem;
        font-variant-numeric: tabular-nums;
      }

      @media (prefers-reduced-motion: reduce) {
        * {
          animation: none !important;
          transition: none !important;
          scroll-behavior: auto !important;
        }
      }

      @media (max-width: 860px) {
        .layout {
          grid-template-columns: 1fr;
        }

        .topbar {
          flex-direction: column;
          align-items: flex-start;
        }

        .search-form {
          flex-wrap: wrap;
        }
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <header class="topbar">
        <div>
          <h1 class="brand">${projectName}</h1>
          <p class="owner" id="ownerName">加载中...</p>
        </div>
        <button class="button" id="openManager">管理愿望</button>
      </header>

      <section class="setup card" id="setupCard">
        <h2>初始化愿望清单</h2>
        <p class="summary">首次使用时请先配置许愿人姓名和验证密码。</p>
        <form class="form" id="setupForm">
          <div class="field">
            <label for="setupName">许愿人姓名</label>
            <input id="setupName" maxlength="40" required placeholder="例如：小林" />
          </div>
          <div class="field">
            <label for="setupPassword">验证密码（至少 4 位）</label>
            <input id="setupPassword" type="password" minlength="4" required />
          </div>
          <button class="button" type="submit">保存配置</button>
          <p class="status" id="setupStatus"></p>
        </form>
      </section>

      <section class="public-hint card" id="publicHint">
        <img
          class="public-hint-visual"
          src="https://raw.githubusercontent.com/balazser/undraw-svg-collection/main/svgs/authentication.svg"
          alt="卡通风格登录验证插画"
          loading="lazy"
        />
        <h2 class="public-hint-title">这是私密愿望清单</h2>
        <p class="public-hint-desc" id="publicHintDesc">
          出于隐私保护，未登录状态下仅展示提示信息。请进入管理台并验证密码后查看完整内容。
        </p>
        <div>
          <button class="button" type="button" id="goLogin">进入管理台登录</button>
        </div>
      </section>

      <main class="layout" id="mainLayout" style="display:none;">
        <section class="card">
          <h2>今日随机种草</h2>
          <p class="summary" id="randomSummary">正在抽取未实现愿望...</p>
          <button class="button secondary" id="showRandom">再抽一个</button>
        </section>

        <section class="card">
          <h2>已实现愿望清单</h2>
          <div id="completedList" class="completed-list"></div>
        </section>
      </main>
    </div>

    <div class="overlay" id="randomOverlay">
      <div class="popup">
        <h2>随机未实现愿望</h2>
        <p class="wish-title" id="popupTitle"></p>
        <p class="wish-desc" id="popupDesc"></p>
        <div class="wish-actions">
          <button class="button secondary" id="closeRandom">我记下了</button>
        </div>
      </div>
    </div>

    <div class="overlay" id="confirmOverlay">
      <div class="dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirmTitle" aria-describedby="confirmMessage">
        <h2 id="confirmTitle">请确认操作</h2>
        <p class="dialog-message" id="confirmMessage"></p>
        <div class="dialog-actions">
          <button class="button ghost" id="confirmCancel">取消</button>
          <button class="button danger" id="confirmOk">确认</button>
        </div>
      </div>
    </div>

    <div class="overlay" id="managerMask"></div>
    <aside class="manager" id="manager">
      <div class="manager-head">
        <h2>愿望管理台</h2>
        <button class="button ghost" id="closeManager">关闭</button>
      </div>

      <div id="loginBox" class="card section-gap-sm">
        <h3>输入验证密码</h3>
        <form class="form" id="loginForm">
          <input id="loginPassword" type="password" placeholder="请输入密码" required />
          <button class="button" type="submit">验证并进入</button>
          <p class="status" id="loginStatus"></p>
        </form>
      </div>

      <div id="managerBody" class="section-gap-sm" style="display:none;">
        <section class="card">
          <h3>新增愿望</h3>
          <form class="form" id="createForm">
            <div class="field">
              <label for="wishTitle">项目名称</label>
              <input id="wishTitle" maxlength="80" required placeholder="例如：入手降噪耳机" />
            </div>
            <div class="field">
              <label for="wishDesc">描述</label>
              <textarea id="wishDesc" maxlength="300" placeholder="写下你想实现它的理由"></textarea>
            </div>
            <label class="inline">
              <input id="wishDone" type="checkbox" />
              已实现
            </label>
            <button class="button" type="submit">创建愿望</button>
            <p class="status" id="createStatus"></p>
          </form>
        </section>

        <section class="card section-gap-md">
          <h3>备份与恢复</h3>
          <p class="summary">导出和导入都需要先登录管理台。导入支持覆盖和合并模式。</p>
          <div class="backup-row">
            <button type="button" class="button secondary" id="exportData">导出 JSON 备份</button>
          </div>
          <div class="backup-row">
            <input id="importFile" type="file" accept=".json,application/json" />
            <span class="manage-meta" id="importFileName">未选择文件</span>
          </div>
          <div class="backup-row backup-modes">
            <label class="inline">
              <input type="radio" name="importMode" value="replace" checked />
              覆盖现有数据
            </label>
            <label class="inline">
              <input type="radio" name="importMode" value="merge" />
              合并到现有数据
            </label>
          </div>
          <button type="button" class="button" id="importData">开始导入</button>
          <p class="status" id="backupStatus"></p>
        </section>

        <section class="card section-gap-md">
          <h3>全部愿望</h3>
          <div class="manage-toolbar">
            <form id="searchForm" class="search-form">
              <input id="searchInput" class="search-input" placeholder="搜索项目名称或描述" />
              <button type="submit" class="button secondary">搜索</button>
              <button type="button" class="button ghost" id="clearSearch">清空</button>
            </form>
            <div class="manage-meta" id="manageMeta">共 0 条</div>
          </div>
          <div class="manage-list" id="manageList"></div>
          <div class="pager">
            <button type="button" class="button secondary" id="prevPage">上一页</button>
            <span class="pager-info" id="pagerInfo">第 1 / 1 页</span>
            <button type="button" class="button secondary" id="nextPage">下一页</button>
          </div>
        </section>
      </div>
    </aside>

    <script>
      const state = {
        hasConfig: false,
        hasPrivateData: false,
        ownerName: '',
        password: '',
        authed: false,
        wishes: [],
        manageQuery: '',
        managePage: 1,
        managePageSize: 8,
        manageTotal: 0,
        manageTotalPages: 0,
        randomWish: null,
        completedWishes: [],
        pendingBackup: null
      };

      const ownerNameEl = document.getElementById('ownerName');
      const setupCard = document.getElementById('setupCard');
      const publicHint = document.getElementById('publicHint');
      const publicHintDesc = document.getElementById('publicHintDesc');
      const goLogin = document.getElementById('goLogin');
      const setupForm = document.getElementById('setupForm');
      const setupStatus = document.getElementById('setupStatus');
      const mainLayout = document.getElementById('mainLayout');
      const completedList = document.getElementById('completedList');
      const randomSummary = document.getElementById('randomSummary');
      const showRandomBtn = document.getElementById('showRandom');
      const randomOverlay = document.getElementById('randomOverlay');
      const popupTitle = document.getElementById('popupTitle');
      const popupDesc = document.getElementById('popupDesc');
      const closeRandom = document.getElementById('closeRandom');
      const confirmOverlay = document.getElementById('confirmOverlay');
      const confirmMessage = document.getElementById('confirmMessage');
      const confirmCancel = document.getElementById('confirmCancel');
      const confirmOk = document.getElementById('confirmOk');

      const openManager = document.getElementById('openManager');
      const closeManager = document.getElementById('closeManager');
      const manager = document.getElementById('manager');
      const managerMask = document.getElementById('managerMask');
      const loginBox = document.getElementById('loginBox');
      const managerBody = document.getElementById('managerBody');
      const loginForm = document.getElementById('loginForm');
      const loginPassword = document.getElementById('loginPassword');
      const loginStatus = document.getElementById('loginStatus');
      const createForm = document.getElementById('createForm');
      const createStatus = document.getElementById('createStatus');
      const manageList = document.getElementById('manageList');
      const searchForm = document.getElementById('searchForm');
      const searchInput = document.getElementById('searchInput');
      const clearSearch = document.getElementById('clearSearch');
      const manageMeta = document.getElementById('manageMeta');
      const pagerInfo = document.getElementById('pagerInfo');
      const prevPage = document.getElementById('prevPage');
      const nextPage = document.getElementById('nextPage');
      const exportData = document.getElementById('exportData');
      const importFile = document.getElementById('importFile');
      const importFileName = document.getElementById('importFileName');
      const importData = document.getElementById('importData');
      const backupStatus = document.getElementById('backupStatus');
      let confirmResolve = null;

      function setText(el, value) {
        if (el) {
          el.textContent = value;
        }
      }

      function authHeaders(includeJson) {
        const headers = { 'x-wishlist-password': state.password };
        if (includeJson) {
          headers['content-type'] = 'application/json';
        }
        return headers;
      }

      function publicHeaders() {
        if (!state.authed || !state.password) {
          return {};
        }
        return { 'x-wishlist-password': state.password };
      }

      async function fetchJson(url, options) {
        const resp = await fetch(url, options || {});
        let data = {};
        try {
          data = await resp.json();
        } catch (err) {
          data = {};
        }
        if (!resp.ok) {
          const msg = data && data.error ? data.error : '请求失败';
          throw new Error(msg);
        }
        return data;
      }

      function renderCompleted() {
        completedList.innerHTML = '';
        if (!state.hasPrivateData) {
          const p = document.createElement('p');
          p.className = 'empty';
          p.textContent = '登录后可查看已实现愿望。';
          completedList.appendChild(p);
          return;
        }

        if (!state.completedWishes.length) {
          const p = document.createElement('p');
          p.className = 'empty';
          p.textContent = '还没有实现的项目，去管理台把愿望标记为已实现。';
          completedList.appendChild(p);
          return;
        }

        state.completedWishes.forEach(function(wish) {
          const node = document.createElement('article');
          node.className = 'wish-item done';

          const title = document.createElement('div');
          title.className = 'wish-title';
          title.textContent = wish.title;

          const desc = document.createElement('p');
          desc.className = 'wish-desc';
          desc.textContent = wish.description || '已实现，暂无补充描述。';

          const meta = document.createElement('div');
          meta.className = 'wish-meta';
          meta.textContent = '完成于 ' + new Date(wish.completedAt || wish.updatedAt).toLocaleString();

          node.appendChild(title);
          node.appendChild(desc);
          node.appendChild(meta);
          completedList.appendChild(node);
        });
      }

      function showRandomWish() {
        if (!state.hasPrivateData) {
          setText(randomSummary, '登录后可查看未实现愿望。');
          return;
        }

        if (!state.randomWish) {
          setText(randomSummary, '目前没有未实现愿望。');
          return;
        }
        setText(popupTitle, state.randomWish.title);
        setText(popupDesc, state.randomWish.description || '这个愿望还没有补充说明。');
        setText(randomSummary, '还有 ' + state.unfinishedCount + ' 个未实现愿望，随机展示中。');
        randomOverlay.classList.add('open');
      }

      function closeRandomWish() {
        randomOverlay.classList.remove('open');
      }

      function closeConfirmDialog(confirmed) {
        if (confirmOverlay) {
          confirmOverlay.classList.remove('open');
        }
        if (confirmResolve) {
          const done = confirmResolve;
          confirmResolve = null;
          done(confirmed);
        }
      }

      function openConfirmDialog(message, okText) {
        return new Promise(function(resolve) {
          confirmResolve = resolve;
          if (confirmMessage) {
            confirmMessage.textContent = message;
          }
          if (confirmOk && okText) {
            confirmOk.textContent = okText;
          }
          if (confirmOverlay) {
            confirmOverlay.classList.add('open');
          }
          if (confirmCancel) {
            confirmCancel.focus();
          }
        });
      }

      function renderOwner() {
        if (!state.hasConfig) {
          setText(ownerNameEl, '请先初始化愿望清单');
          return;
        }
        setText(ownerNameEl, state.ownerName + ' 的愿望清单');
      }

      async function loadPublicState(showPopup) {
        const data = await fetchJson('/api/public', {
          headers: publicHeaders()
        });
        state.hasConfig = Boolean(data.hasConfig);
        state.hasPrivateData = Boolean(data.authenticated);
        state.ownerName = data.ownerName || '';
        state.randomWish = data.randomWish || null;
        state.completedWishes = data.completedWishes || [];
        state.unfinishedCount = data.unfinishedCount || 0;

        renderOwner();

        if (!state.hasConfig) {
          setupCard.style.display = 'block';
          publicHint.style.display = 'none';
          mainLayout.style.display = 'none';
          return;
        }

        setupCard.style.display = 'none';
        if (!state.hasPrivateData) {
          publicHint.style.display = 'grid';
          if (publicHintDesc) {
            publicHintDesc.textContent =
              state.ownerName + ' 的愿望清单已开启隐私模式，登录后可查看和管理内容。';
          }
          mainLayout.style.display = 'none';
          setText(randomSummary, '登录后可查看未实现愿望。');
          return;
        }

        publicHint.style.display = 'none';
        mainLayout.style.display = 'grid';
        renderCompleted();

        if (showPopup && state.randomWish) {
          setTimeout(showRandomWish, 280);
        } else if (!state.randomWish) {
          setText(randomSummary, '目前没有未实现愿望。');
        }
      }

      async function verifyPassword(password) {
        await fetchJson('/api/auth', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ password: password })
        });
      }

      async function loadManageWishes() {
        const params = new URLSearchParams();
        params.set('page', String(state.managePage));
        params.set('pageSize', String(state.managePageSize));
        if (state.manageQuery) {
          params.set('q', state.manageQuery);
        }

        const data = await fetchJson('/api/wishes?' + params.toString(), {
          headers: authHeaders(false)
        });
        state.wishes = data.wishes || [];
        const pagination = data.pagination || {};
        state.manageTotal = Number(pagination.total) || 0;
        state.managePage = Number(pagination.page) || 1;
        state.managePageSize = Number(pagination.pageSize) || state.managePageSize;
        state.manageTotalPages = Number(pagination.totalPages) || 0;
        renderManageList();
        renderPager();
      }

      function makeBackupFilename() {
        return 'wishlist-backup-' + new Date().toISOString().replace(/[:.]/g, '-') + '.json';
      }

      function getImportMode() {
        const modeInput = document.querySelector('input[name="importMode"]:checked');
        return modeInput && modeInput.value === 'merge' ? 'merge' : 'replace';
      }

      async function readBackupFile(file) {
        const text = await file.text();
        let parsed = null;
        try {
          parsed = JSON.parse(text);
        } catch (err) {
          throw new Error('备份文件不是合法 JSON。');
        }
        if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.wishes)) {
          throw new Error('备份文件格式错误，缺少 wishes 数组。');
        }
        return parsed;
      }

      async function exportBackup() {
        const data = await fetchJson('/api/wishes/export', {
          headers: authHeaders(false)
        });
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = makeBackupFilename();
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(link.href);
      }

      async function importBackup() {
        if (!state.pendingBackup) {
          throw new Error('请先选择备份文件。');
        }

        const mode = getImportMode();
        if (mode === 'replace') {
          const confirmed = await openConfirmDialog('覆盖导入会替换当前全部愿望，确定继续吗？', '确认覆盖');
          if (!confirmed) {
            return null;
          }
        }

        const result = await fetchJson('/api/wishes/import', {
          method: 'POST',
          headers: authHeaders(true),
          body: JSON.stringify({
            mode: mode,
            backup: state.pendingBackup
          })
        });

        state.managePage = 1;
        await Promise.all([
          loadManageWishes(),
          loadPublicState(false)
        ]);

        return result;
      }

      function renderManageList() {
        manageList.innerHTML = '';
        if (!state.wishes.length) {
          const p = document.createElement('p');
          p.className = 'empty';
          p.textContent = state.manageQuery ? '没有匹配的愿望。' : '还没有愿望，先创建一个吧。';
          manageList.appendChild(p);
          return;
        }

        state.wishes.forEach(function(wish) {
          const node = document.createElement('article');
          node.className = 'wish-item' + (wish.done ? ' done' : '');

          const title = document.createElement('div');
          title.className = 'wish-title';
          title.textContent = wish.title;

          const desc = document.createElement('p');
          desc.className = 'wish-desc';
          desc.textContent = wish.description || '暂无描述';

          const meta = document.createElement('div');
          meta.className = 'wish-meta';
          meta.textContent = (wish.done ? '已实现' : '未实现') + ' · 更新于 ' + new Date(wish.updatedAt).toLocaleString();

          const actions = document.createElement('div');
          actions.className = 'wish-actions';

          const toggleBtn = document.createElement('button');
          toggleBtn.className = 'button secondary';
          toggleBtn.textContent = wish.done ? '标记未实现' : '标记已实现';
          toggleBtn.addEventListener('click', function() {
            updateWish(wish.id, {
              done: !wish.done
            });
          });

          const editBtn = document.createElement('button');
          editBtn.className = 'button ghost';
          editBtn.textContent = '编辑';
          editBtn.addEventListener('click', function() {
            const newTitle = window.prompt('修改项目名称', wish.title);
            if (newTitle === null) {
              return;
            }
            const nextTitle = newTitle.trim();
            if (!nextTitle) {
              window.alert('项目名称不能为空');
              return;
            }
            const newDesc = window.prompt('修改描述', wish.description || '');
            if (newDesc === null) {
              return;
            }
            updateWish(wish.id, {
              title: nextTitle,
              description: newDesc.trim()
            });
          });

          const deleteBtn = document.createElement('button');
          deleteBtn.className = 'button danger';
          deleteBtn.textContent = '删除';
          deleteBtn.addEventListener('click', async function() {
            const confirmed = await openConfirmDialog('确定删除这个愿望吗？该操作不可恢复。', '确认删除');
            if (!confirmed) {
              return;
            }
            deleteWish(wish.id);
          });

          actions.appendChild(toggleBtn);
          actions.appendChild(editBtn);
          actions.appendChild(deleteBtn);

          node.appendChild(title);
          node.appendChild(desc);
          node.appendChild(meta);
          node.appendChild(actions);
          manageList.appendChild(node);
        });
      }

      function renderPager() {
        const total = state.manageTotal;
        const page = state.managePage;
        const totalPages = state.manageTotalPages;

        if (manageMeta) {
          if (state.manageQuery) {
            manageMeta.textContent = '关键词：' + state.manageQuery + ' · 共 ' + total + ' 条';
          } else {
            manageMeta.textContent = '共 ' + total + ' 条';
          }
        }

        if (pagerInfo) {
          pagerInfo.textContent = '第 ' + page + ' / ' + Math.max(totalPages, 1) + ' 页';
        }

        if (prevPage) {
          prevPage.disabled = page <= 1;
        }
        if (nextPage) {
          nextPage.disabled = totalPages === 0 || page >= totalPages;
        }
      }

      async function updateWish(id, payload) {
        try {
          await fetchJson('/api/wishes/' + encodeURIComponent(id), {
            method: 'PUT',
            headers: authHeaders(true),
            body: JSON.stringify(payload)
          });
          await Promise.all([
            loadManageWishes(),
            loadPublicState(false)
          ]);
        } catch (err) {
          window.alert(err.message);
        }
      }

      async function deleteWish(id) {
        try {
          await fetchJson('/api/wishes/' + encodeURIComponent(id), {
            method: 'DELETE',
            headers: authHeaders(false)
          });
          await Promise.all([
            loadManageWishes(),
            loadPublicState(false)
          ]);
        } catch (err) {
          window.alert(err.message);
        }
      }

      setupForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const name = document.getElementById('setupName').value.trim();
        const password = document.getElementById('setupPassword').value;

        try {
          await fetchJson('/api/setup', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ name: name, password: password })
          });
          setText(setupStatus, '配置已保存。你可以进入管理台添加愿望。');
          await loadPublicState(true);
        } catch (err) {
          setText(setupStatus, err.message);
        }
      });

      showRandomBtn.addEventListener('click', async function() {
        try {
          await loadPublicState(false);
          showRandomWish();
        } catch (err) {
          window.alert(err.message);
        }
      });

      closeRandom.addEventListener('click', closeRandomWish);
      randomOverlay.addEventListener('click', function(event) {
        if (event.target === randomOverlay) {
          closeRandomWish();
        }
      });
      confirmCancel.addEventListener('click', function() {
        closeConfirmDialog(false);
      });
      confirmOk.addEventListener('click', function() {
        closeConfirmDialog(true);
      });
      confirmOverlay.addEventListener('click', function(event) {
        if (event.target === confirmOverlay) {
          closeConfirmDialog(false);
        }
      });
      document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && confirmOverlay.classList.contains('open')) {
          closeConfirmDialog(false);
        }
      });

      function openManagerPanel() {
        manager.classList.add('open');
        managerMask.classList.add('open');
      }

      function closeManagerPanel() {
        manager.classList.remove('open');
        managerMask.classList.remove('open');
      }

      openManager.addEventListener('click', function() {
        openManagerPanel();
      });

      goLogin.addEventListener('click', function() {
        openManagerPanel();
      });

      closeManager.addEventListener('click', closeManagerPanel);
      managerMask.addEventListener('click', closeManagerPanel);

      loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const password = loginPassword.value;
        try {
          await verifyPassword(password);
          state.password = password;
          state.authed = true;
          loginBox.style.display = 'none';
          managerBody.style.display = 'block';
          setText(loginStatus, '');
          setText(backupStatus, '');
          await Promise.all([
            loadManageWishes(),
            loadPublicState(false)
          ]);
        } catch (err) {
          setText(loginStatus, err.message);
        }
      });

      createForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const title = document.getElementById('wishTitle').value.trim();
        const description = document.getElementById('wishDesc').value.trim();
        const done = document.getElementById('wishDone').checked;

        if (!title) {
          setText(createStatus, '项目名称不能为空');
          return;
        }

        try {
          await fetchJson('/api/wishes', {
            method: 'POST',
            headers: authHeaders(true),
            body: JSON.stringify({
              title: title,
              description: description,
              done: done
            })
          });
          createForm.reset();
          setText(createStatus, '已创建愿望。');
          await Promise.all([
            loadManageWishes(),
            loadPublicState(false)
          ]);
        } catch (err) {
          setText(createStatus, err.message);
        }
      });

      searchForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        state.manageQuery = searchInput.value.trim();
        state.managePage = 1;
        try {
          await loadManageWishes();
        } catch (err) {
          window.alert(err.message);
        }
      });

      clearSearch.addEventListener('click', async function() {
        searchInput.value = '';
        state.manageQuery = '';
        state.managePage = 1;
        try {
          await loadManageWishes();
        } catch (err) {
          window.alert(err.message);
        }
      });

      prevPage.addEventListener('click', async function() {
        if (state.managePage <= 1) {
          return;
        }
        state.managePage -= 1;
        try {
          await loadManageWishes();
        } catch (err) {
          window.alert(err.message);
        }
      });

      nextPage.addEventListener('click', async function() {
        if (state.manageTotalPages > 0 && state.managePage >= state.manageTotalPages) {
          return;
        }
        state.managePage += 1;
        try {
          await loadManageWishes();
        } catch (err) {
          window.alert(err.message);
        }
      });

      exportData.addEventListener('click', async function() {
        try {
          setText(backupStatus, '正在导出备份...');
          await exportBackup();
          setText(backupStatus, '导出成功，请妥善保存备份文件。');
        } catch (err) {
          setText(backupStatus, err.message);
        }
      });

      importFile.addEventListener('change', async function() {
        const file = importFile.files && importFile.files[0];
        if (!file) {
          state.pendingBackup = null;
          setText(importFileName, '未选择文件');
          return;
        }

        try {
          const parsed = await readBackupFile(file);
          state.pendingBackup = parsed;
          setText(importFileName, file.name);
          setText(backupStatus, '已加载备份：共 ' + parsed.wishes.length + ' 条记录。');
        } catch (err) {
          state.pendingBackup = null;
          importFile.value = '';
          setText(importFileName, '未选择文件');
          setText(backupStatus, err.message);
        }
      });

      importData.addEventListener('click', async function() {
        try {
          setText(backupStatus, '正在导入备份...');
          const result = await importBackup();
          if (!result) {
            setText(backupStatus, '已取消导入。');
            return;
          }
          const overwriteText = result.mode === 'merge' ? '，覆盖同 ID ' + result.overwrittenCount + ' 条' : '';
          setText(
            backupStatus,
            '导入完成：接收 ' + result.acceptedCount + ' 条，当前共 ' + result.totalAfter + ' 条' + overwriteText + '。',
          );
        } catch (err) {
          setText(backupStatus, err.message);
        }
      });

      loadPublicState(true).catch(function(err) {
        setText(ownerNameEl, '加载失败：' + err.message);
      });
    </script>
  </body>
</html>`;
}

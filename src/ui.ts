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
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        font-family: "Noto Serif SC", "Songti SC", "STKaiti", "Baskerville", serif;
        color: var(--text);
        background:
          radial-gradient(circle at 10% 10%, #ffe6cf 0%, transparent 38%),
          radial-gradient(circle at 90% 5%, #d7f7ef 0%, transparent 30%),
          linear-gradient(160deg, #fffaf0 0%, #fff1e4 42%, #fffaf5 100%);
        min-height: 100vh;
      }

      .wrap {
        max-width: 1080px;
        margin: 0 auto;
        padding: 24px 16px 48px;
      }

      .topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 16px;
      }

      .brand {
        margin: 0;
        letter-spacing: 0.03em;
        font-size: clamp(1.6rem, 2vw + 1rem, 2.4rem);
      }

      .owner {
        margin: 6px 0 0;
        color: var(--muted);
      }

      .button {
        border: 1px solid transparent;
        background: var(--primary);
        color: #fff;
        border-radius: 999px;
        font-weight: 700;
        cursor: pointer;
        padding: 10px 16px;
        transition: transform 120ms ease, box-shadow 120ms ease, opacity 120ms ease;
      }

      .button:hover {
        transform: translateY(-1px);
        box-shadow: 0 8px 16px rgba(218, 105, 49, 0.22);
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
        gap: 16px;
      }

      .card {
        border-radius: 18px;
        border: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.88);
        box-shadow: var(--shadow);
        padding: 18px;
        backdrop-filter: blur(2px);
      }

      .card h2 {
        margin: 0 0 10px;
        font-size: 1.15rem;
      }

      .summary {
        color: var(--muted);
        margin: 0;
      }

      .completed-list,
      .manage-list {
        display: grid;
        gap: 10px;
      }

      .wish-item {
        border: 1px solid var(--border);
        border-radius: 14px;
        background: #fff;
        padding: 12px;
      }

      .wish-item.done {
        border-color: #bfe5dc;
        background: #f3fffb;
      }

      .wish-title {
        font-weight: 700;
        margin-bottom: 6px;
      }

      .wish-desc {
        margin: 0;
        color: var(--muted);
        white-space: pre-wrap;
      }

      .wish-meta {
        margin-top: 8px;
        font-size: 0.82rem;
        color: #9e8372;
      }

      .empty {
        color: #9e8372;
        margin: 0;
      }

      .setup {
        display: none;
        max-width: 560px;
        margin: 28px auto 0;
      }

      .form {
        display: grid;
        gap: 12px;
      }

      .field {
        display: grid;
        gap: 6px;
      }

      label {
        font-weight: 700;
      }

      input,
      textarea {
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 10px 12px;
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
        gap: 8px;
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
        padding: 16px;
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
        padding: 18px;
        animation: pop-in 220ms ease;
      }

      @keyframes pop-in {
        from {
          transform: scale(0.95) translateY(8px);
          opacity: 0;
        }
        to {
          transform: scale(1) translateY(0);
          opacity: 1;
        }
      }

      .manager {
        position: fixed;
        top: 0;
        right: 0;
        width: min(520px, 100%);
        height: 100vh;
        background: #fffefc;
        border-left: 1px solid var(--border);
        box-shadow: -14px 0 30px rgba(71, 38, 17, 0.12);
        padding: 18px;
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

      .wish-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 10px;
      }

      .wish-actions .button {
        padding: 6px 10px;
        font-size: 0.86rem;
      }

      @media (max-width: 860px) {
        .layout {
          grid-template-columns: 1fr;
        }

        .topbar {
          flex-direction: column;
          align-items: flex-start;
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

    <div class="overlay" id="managerMask"></div>
    <aside class="manager" id="manager">
      <div class="manager-head">
        <h2>愿望管理台</h2>
        <button class="button ghost" id="closeManager">关闭</button>
      </div>

      <div id="loginBox" class="card" style="margin-top:10px;">
        <h3>输入验证密码</h3>
        <form class="form" id="loginForm">
          <input id="loginPassword" type="password" placeholder="请输入密码" required />
          <button class="button" type="submit">验证并进入</button>
          <p class="status" id="loginStatus"></p>
        </form>
      </div>

      <div id="managerBody" style="display:none; margin-top:10px;">
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

        <section class="card" style="margin-top:12px;">
          <h3>全部愿望</h3>
          <div class="manage-list" id="manageList"></div>
        </section>
      </div>
    </aside>

    <script>
      const state = {
        hasConfig: false,
        ownerName: '',
        password: '',
        authed: false,
        wishes: [],
        randomWish: null,
        completedWishes: []
      };

      const ownerNameEl = document.getElementById('ownerName');
      const setupCard = document.getElementById('setupCard');
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
        if (!state.completedWishes.length) {
          const p = document.createElement('p');
          p.className = 'empty';
          p.textContent = '还没有实现的项目，继续努力。';
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

      function renderOwner() {
        if (!state.hasConfig) {
          setText(ownerNameEl, '请先初始化愿望清单');
          return;
        }
        setText(ownerNameEl, state.ownerName + ' 的愿望清单');
      }

      async function loadPublicState(showPopup) {
        const data = await fetchJson('/api/public');
        state.hasConfig = Boolean(data.hasConfig);
        state.ownerName = data.ownerName || '';
        state.randomWish = data.randomWish || null;
        state.completedWishes = data.completedWishes || [];
        state.unfinishedCount = data.unfinishedCount || 0;

        renderOwner();

        if (!state.hasConfig) {
          setupCard.style.display = 'block';
          mainLayout.style.display = 'none';
          return;
        }

        setupCard.style.display = 'none';
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
        const data = await fetchJson('/api/wishes', {
          headers: authHeaders(false)
        });
        state.wishes = data.wishes || [];
        renderManageList();
      }

      function renderManageList() {
        manageList.innerHTML = '';
        if (!state.wishes.length) {
          const p = document.createElement('p');
          p.className = 'empty';
          p.textContent = '还没有愿望，先创建一个吧。';
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
          deleteBtn.addEventListener('click', function() {
            if (window.confirm('确定删除这个愿望吗？')) {
              deleteWish(wish.id);
            }
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
          await loadManageWishes();
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

      loadPublicState(true).catch(function(err) {
        setText(ownerNameEl, '加载失败：' + err.message);
      });
    </script>
  </body>
</html>`;
}

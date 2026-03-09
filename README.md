# ♥️の种草

基于 **Hono + Cloudflare Workers + KV** 的愿望清单应用。

支持：

- 首次初始化：许愿人姓名 + 验证密码
- 密码验证后增删改查愿望
- 密码验证后导出/导入备份（JSON）
- 主页面导航分区：随机愿望 / 已实现清单 / 登录验证 / 新增 / 备份恢复 / 全部愿望
- 登录后在主页面查看随机未实现愿望与已实现愿望清单（不使用随机弹窗）
- 覆盖导入使用确认弹框，删除支持二次确认与可撤销倒计时
- PC / 移动端响应式适配
- 服务端统一输入校验（密码最少 8 位、标题/描述长度限制）
- 内置安全响应头与 API `Cache-Control: no-store`
- 管理列表分页结果前端缓存，降低重复翻页请求

## 一键部署（Deploy to Cloudflare）

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/pentclaw/wishlist-cf-worker)

使用说明：

1. 先把本项目推到 GitHub 仓库（公开仓库最稳妥）。
2. 把上面按钮链接中的 `https://github.com/<your-org>/<your-repo>` 替换成你的真实仓库地址。
3. 点击按钮后按向导完成授权与部署。
4. 部署完成后，到 Cloudflare 控制台确认 `WISHLIST_KV` 绑定是否正确。

## 手动部署到 Cloudflare Workers

### 1. 前置准备

- 一个 Cloudflare 账号
- Node.js 20+
- Wrangler（项目已内置依赖）

### 2. 安装依赖

```bash
npm install
```

### 3. 登录 Cloudflare

```bash
npx wrangler login
```

### 4. 创建 KV（生产 + 预览）

```bash
npx wrangler kv namespace create WISHLIST_KV
npx wrangler kv namespace create WISHLIST_KV --preview
```

执行后你会拿到两个 ID：

- `id`（生产）
- `preview_id`（预览）

把它们填入 [wrangler.toml](./wrangler.toml) 对应字段。

### 5. 本地调试

```bash
npm run dev
```

启动后默认访问：

- `http://127.0.0.1:8787`

如端口冲突，可自定义端口：

```bash
npx wrangler dev src/index.ts --local --port 8788
```

### 6. 正式部署

```bash
npm run deploy
```

## 项目结构

- [src/index.ts](./src/index.ts): Hono Worker、KV 存储、鉴权与 CRUD API
- [src/ui.ts](./src/ui.ts): 前端页面模板与交互逻辑（基于 Pico.css 语义化 UI）
- [src/types.ts](./src/types.ts): 服务端共享类型定义
- [src/validator.ts](./src/validator.ts): 输入与导入数据校验/归一化逻辑
- [wrangler.toml](./wrangler.toml): Worker 配置与 KV 绑定

## API 速览

### 公共接口

- `GET /api/public`：获取公开页面基础数据（默认仅返回项目名/许愿人）；携带 `x-wishlist-password` 或已登录 Cookie（`wishlist_auth`）且验证通过后，返回随机未实现愿望、已实现列表等私有数据
- `POST /api/setup`：首次初始化（name + password，密码至少 8 位）
- `POST /api/auth`：密码验证，成功后下发 `HttpOnly` 登录 Cookie（`wishlist_auth`）

### 管理接口（需请求头 `x-wishlist-password` 或已登录 Cookie）

- `GET /api/wishes?page=1&pageSize=8&q=关键词`（支持分页和搜索）
- `GET /api/wishes/export`：导出备份 JSON
- `POST /api/wishes/import`：导入备份 JSON（`mode` 支持 `replace` 或 `merge`）
- `POST /api/wishes`
- `PUT /api/wishes/:id`
- `DELETE /api/wishes/:id`

## 数据存储（KV）

使用两个 key：

- `wishlist:config`：保存姓名、盐值、密码哈希、创建时间
- `wishlist:wishes`：保存 `{ wishes: Wish[] }`

## KV 与 D1 选型建议

当前这个愿望清单（读多写少、查询简单、数据量中小）用 KV 足够。

建议切到 D1 的场景：

- 需要复杂筛选/搜索/统计
- 并发写入明显增多，需要更强一致性
- 需要关系型查询和长期扩展

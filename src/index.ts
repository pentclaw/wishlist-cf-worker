import { Hono } from 'hono';
import { renderHtml } from './ui';

type Bindings = {
  WISHLIST_KV: KVNamespace;
};

type AppConfig = {
  name: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
};

type Wish = {
  id: string;
  title: string;
  description: string;
  done: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
};

type WishState = {
  wishes: Wish[];
};

const PROJECT_NAME = '♥️の种草';
const CONFIG_KEY = 'wishlist:config';
const WISHES_KEY = 'wishlist:wishes';

const app = new Hono<{ Bindings: Bindings }>();

app.get('/', (c) => {
  return c.html(renderHtml(PROJECT_NAME));
});

app.get('/api/public', async (c) => {
  const config = await getConfig(c.env.WISHLIST_KV);
  const state = await loadWishState(c.env.WISHLIST_KV);

  const completedWishes = state.wishes
    .filter((wish) => wish.done)
    .sort((a, b) => (b.completedAt ?? b.updatedAt).localeCompare(a.completedAt ?? a.updatedAt));
  const unfinishedWishes = state.wishes.filter((wish) => !wish.done);

  const randomWish =
    unfinishedWishes.length > 0
      ? unfinishedWishes[Math.floor(Math.random() * unfinishedWishes.length)]
      : null;

  return c.json({
    projectName: PROJECT_NAME,
    hasConfig: Boolean(config),
    ownerName: config?.name ?? '',
    randomWish,
    completedWishes,
    unfinishedCount: unfinishedWishes.length,
    totalCount: state.wishes.length,
  });
});

app.post('/api/setup', async (c) => {
  const existingConfig = await getConfig(c.env.WISHLIST_KV);
  if (existingConfig) {
    return c.json({ error: '配置已存在，如需修改请扩展设置接口。' }, 409);
  }

  const body = await readJson<{ name?: string; password?: string }>(c);
  if (!body) {
    return c.json({ error: '请求体必须为 JSON。' }, 400);
  }

  const name = (body.name ?? '').trim();
  const password = body.password ?? '';

  if (!name) {
    return c.json({ error: '许愿人姓名不能为空。' }, 400);
  }

  if (password.length < 4) {
    return c.json({ error: '密码长度至少为 4 位。' }, 400);
  }

  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);

  const config: AppConfig = {
    name,
    salt,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  await c.env.WISHLIST_KV.put(CONFIG_KEY, JSON.stringify(config));

  const existingState = await c.env.WISHLIST_KV.get(WISHES_KEY, 'json');
  if (!existingState) {
    await saveWishState(c.env.WISHLIST_KV, { wishes: [] });
  }

  return c.json({ ok: true });
});

app.post('/api/auth', async (c) => {
  const config = await getConfig(c.env.WISHLIST_KV);
  if (!config) {
    return c.json({ error: '请先初始化配置。' }, 400);
  }

  const body = await readJson<{ password?: string }>(c);
  if (!body) {
    return c.json({ error: '请求体必须为 JSON。' }, 400);
  }

  const password = body.password ?? '';
  const passed = await verifyPassword(config, password);

  if (!passed) {
    return c.json({ error: '密码错误。' }, 401);
  }

  return c.json({ ok: true });
});

app.use('/api/wishes*', async (c, next) => {
  const config = await getConfig(c.env.WISHLIST_KV);
  if (!config) {
    return c.json({ error: '请先初始化配置。' }, 400);
  }

  const password = (c.req.header('x-wishlist-password') ?? '').trim();
  if (!password) {
    return c.json({ error: '缺少验证密码。' }, 401);
  }

  const passed = await verifyPassword(config, password);
  if (!passed) {
    return c.json({ error: '验证失败。' }, 401);
  }

  await next();
});

app.get('/api/wishes', async (c) => {
  const state = await loadWishState(c.env.WISHLIST_KV);
  const q = (c.req.query('q') ?? '').trim().toLowerCase();
  const page = normalizePositiveInt(c.req.query('page'), 1);
  const pageSize = normalizePositiveInt(c.req.query('pageSize'), 8, 1, 50);

  let wishes = [...state.wishes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  if (q) {
    wishes = wishes.filter((wish) => {
      const title = wish.title.toLowerCase();
      const description = wish.description.toLowerCase();
      return title.includes(q) || description.includes(q);
    });
  }

  const total = wishes.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
  const currentPage = totalPages === 0 ? 1 : Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pagedWishes = wishes.slice(start, start + pageSize);

  return c.json({
    wishes: pagedWishes,
    pagination: {
      total,
      page: currentPage,
      pageSize,
      totalPages,
    },
    query: {
      q,
    },
  });
});

app.post('/api/wishes', async (c) => {
  const body = await readJson<{ title?: string; description?: string; done?: boolean }>(c);
  if (!body) {
    return c.json({ error: '请求体必须为 JSON。' }, 400);
  }

  const title = (body.title ?? '').trim();
  const description = (body.description ?? '').trim();
  const done = Boolean(body.done);

  if (!title) {
    return c.json({ error: '项目名称不能为空。' }, 400);
  }

  const now = new Date().toISOString();
  const wish: Wish = {
    id: crypto.randomUUID(),
    title,
    description,
    done,
    createdAt: now,
    updatedAt: now,
  };

  if (done) {
    wish.completedAt = now;
  }

  const state = await loadWishState(c.env.WISHLIST_KV);
  state.wishes.unshift(wish);
  await saveWishState(c.env.WISHLIST_KV, state);

  return c.json({ wish }, 201);
});

app.put('/api/wishes/:id', async (c) => {
  const id = c.req.param('id');
  const body = await readJson<{ title?: string; description?: string; done?: boolean }>(c);
  if (!body) {
    return c.json({ error: '请求体必须为 JSON。' }, 400);
  }

  const state = await loadWishState(c.env.WISHLIST_KV);
  const index = state.wishes.findIndex((wish) => wish.id === id);

  if (index < 0) {
    return c.json({ error: '愿望不存在。' }, 404);
  }

  const target = state.wishes[index];

  if (typeof body.title === 'string') {
    const nextTitle = body.title.trim();
    if (!nextTitle) {
      return c.json({ error: '项目名称不能为空。' }, 400);
    }
    target.title = nextTitle;
  }

  if (typeof body.description === 'string') {
    target.description = body.description.trim();
  }

  if (typeof body.done === 'boolean' && body.done !== target.done) {
    target.done = body.done;
    if (target.done) {
      target.completedAt = new Date().toISOString();
    } else {
      delete target.completedAt;
    }
  }

  target.updatedAt = new Date().toISOString();
  await saveWishState(c.env.WISHLIST_KV, state);

  return c.json({ wish: target });
});

app.delete('/api/wishes/:id', async (c) => {
  const id = c.req.param('id');
  const state = await loadWishState(c.env.WISHLIST_KV);
  const nextWishes = state.wishes.filter((wish) => wish.id !== id);

  if (nextWishes.length === state.wishes.length) {
    return c.json({ error: '愿望不存在。' }, 404);
  }

  state.wishes = nextWishes;
  await saveWishState(c.env.WISHLIST_KV, state);

  return c.json({ ok: true });
});

async function getConfig(kv: KVNamespace): Promise<AppConfig | null> {
  return kv.get(CONFIG_KEY, 'json');
}

async function loadWishState(kv: KVNamespace): Promise<WishState> {
  const state = await kv.get(WISHES_KEY, 'json');
  if (!state || typeof state !== 'object' || !Array.isArray((state as WishState).wishes)) {
    return { wishes: [] };
  }
  return state as WishState;
}

async function saveWishState(kv: KVNamespace, state: WishState): Promise<void> {
  await kv.put(WISHES_KEY, JSON.stringify(state));
}

async function readJson<T>(c: { req: { json: <J>() => Promise<J> } }): Promise<T | null> {
  try {
    return (await c.req.json<T>()) ?? null;
  } catch {
    return null;
  }
}

function generateSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return bytesToBase64(bytes);
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const encoded = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return bytesToBase64(new Uint8Array(digest));
}

async function verifyPassword(config: AppConfig, password: string): Promise<boolean> {
  if (!password) {
    return false;
  }
  const inputHash = await hashPassword(password, config.salt);
  return timingSafeEqual(inputHash, config.passwordHash);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const value of bytes) {
    binary += String.fromCharCode(value);
  }
  return btoa(binary);
}

function normalizePositiveInt(
  raw: string | undefined,
  fallback: number,
  min = 1,
  max = Number.MAX_SAFE_INTEGER,
): number {
  const value = Number(raw);
  if (!Number.isInteger(value) || value < min) {
    return fallback;
  }
  return Math.min(value, max);
}

export default app;

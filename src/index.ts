import { Hono } from 'hono';
import type {
  AppConfig,
  Bindings,
  PasswordHashAlgorithm,
  RequestAuthState,
  Wish,
  WishExportPayload,
  WishState,
} from './types.js';
import {
  MAX_OWNER_NAME_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  dedupeWishesById,
  isValidWishId,
  normalizeConfig,
  normalizeImportedWish,
  normalizePositiveInt,
  normalizeSearchQuery,
  parseImportMode,
  parseImportedWishes,
  parseWishMutation,
} from './validator.js';
import { renderHtml } from './ui.js';

const PROJECT_NAME = '♥️の种草';
const CONFIG_KEY = 'wishlist:config';
const WISHES_KEY = 'wishlist:wishes';
const BACKUP_VERSION = 1;
const AUTH_COOKIE_NAME = 'wishlist_auth';
const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const PASSWORD_HASH_ITERATIONS = 120_000;
const DEFAULT_PASSWORD_ALGORITHM: PasswordHashAlgorithm = 'pbkdf2-v2';
const AUTH_TOKEN_PREFIX = 'wishlist-auth';

const APP_CSP = [
  "default-src 'self'",
  "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
  "script-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "base-uri 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
].join('; ');

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', async (c, next) => {
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('Referrer-Policy', 'no-referrer');
  c.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  c.header('Content-Security-Policy', APP_CSP);
  if (c.req.path.startsWith('/api/')) {
    c.header('Cache-Control', 'no-store');
  }
  await next();
});

app.onError((err, c) => {
  console.error('[wishlist] unhandled error', err);
  if (c.req.path.startsWith('/api/')) {
    return c.json({ error: '服务器内部错误，请稍后重试。' }, 500);
  }
  return c.text('服务器内部错误，请稍后重试。', 500);
});

app.get('/', (c) => {
  return c.html(renderHtml(PROJECT_NAME));
});

app.get('/api/public', async (c) => {
  const config = await getConfig(c.env.WISHLIST_KV);
  if (!config) {
    return c.json({
      projectName: PROJECT_NAME,
      hasConfig: false,
      ownerName: '',
      authenticated: false,
      randomWish: null,
      completedWishes: [],
      unfinishedCount: 0,
      totalCount: 0,
    });
  }

  const authState = await resolveRequestAuthState(c, config);
  if (authState === 'missing' || authState === 'invalid-cookie') {
    if (authState === 'invalid-cookie') {
      c.header('Set-Cookie', buildClearAuthCookie(isSecureRequest(c.req.url)));
    }
    return c.json({
      projectName: PROJECT_NAME,
      hasConfig: true,
      ownerName: config.name,
      authenticated: false,
      randomWish: null,
      completedWishes: [],
      unfinishedCount: 0,
      totalCount: 0,
    });
  }

  if (authState !== 'ok') {
    return c.json({ error: '验证失败。' }, 401);
  }

  const state = await loadWishState(c.env.WISHLIST_KV);
  const completedWishes: Wish[] = [];
  const unfinishedWishes: Wish[] = [];
  for (const wish of state.wishes) {
    if (wish.done) {
      completedWishes.push(wish);
    } else {
      unfinishedWishes.push(wish);
    }
  }

  completedWishes.sort((a, b) => (b.completedAt ?? b.updatedAt).localeCompare(a.completedAt ?? a.updatedAt));

  const randomWish =
    unfinishedWishes.length > 0
      ? unfinishedWishes[Math.floor(Math.random() * unfinishedWishes.length)]
      : null;

  return c.json({
    projectName: PROJECT_NAME,
    hasConfig: true,
    ownerName: config.name,
    authenticated: true,
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

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!name) {
    return c.json({ error: '许愿人姓名不能为空。' }, 400);
  }

  if (name.length > MAX_OWNER_NAME_LENGTH) {
    return c.json({ error: `许愿人姓名不能超过 ${MAX_OWNER_NAME_LENGTH} 个字符。` }, 400);
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return c.json({ error: `密码长度至少为 ${MIN_PASSWORD_LENGTH} 位。` }, 400);
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    return c.json({ error: `密码长度不能超过 ${MAX_PASSWORD_LENGTH} 位。` }, 400);
  }

  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt, DEFAULT_PASSWORD_ALGORITHM);

  const config: AppConfig = {
    name,
    salt,
    passwordHash,
    createdAt: new Date().toISOString(),
    passwordAlgorithm: DEFAULT_PASSWORD_ALGORITHM,
  };

  const existingState = await c.env.WISHLIST_KV.get(WISHES_KEY, 'json');
  const writes: Array<[string, string]> = [[CONFIG_KEY, JSON.stringify(config)]];
  if (!existingState) {
    writes.push([WISHES_KEY, JSON.stringify({ wishes: [] } satisfies WishState)]);
  }
  await putEntries(c.env.WISHLIST_KV, writes);

  return c.json({ ok: true });
});

app.post('/api/auth', async (c) => {
  let config = await getConfig(c.env.WISHLIST_KV);
  if (!config) {
    return c.json({ error: '请先初始化配置。' }, 400);
  }

  const body = await readJson<{ password?: string }>(c);
  if (!body) {
    return c.json({ error: '请求体必须为 JSON。' }, 400);
  }

  const password = typeof body.password === 'string' ? body.password : '';
  if (!password || password.length > MAX_PASSWORD_LENGTH) {
    return c.json({ error: '密码错误。' }, 401);
  }
  const passed = await verifyPassword(config, password);

  if (!passed) {
    return c.json({ error: '密码错误。' }, 401);
  }

  if ((config.passwordAlgorithm ?? 'sha256-v1') !== DEFAULT_PASSWORD_ALGORITHM) {
    config = await upgradeConfigPassword(config, password);
    await c.env.WISHLIST_KV.put(CONFIG_KEY, JSON.stringify(config));
  }

  const token = await createAuthCookieToken(config);
  c.header('Set-Cookie', buildAuthCookie(token, isSecureRequest(c.req.url)));

  return c.json({ ok: true });
});

app.use('/api/wishes*', async (c, next) => {
  const config = await getConfig(c.env.WISHLIST_KV);
  if (!config) {
    return c.json({ error: '请先初始化配置。' }, 400);
  }

  const authState = await resolveRequestAuthState(c, config);
  if (authState === 'missing') {
    return c.json({ error: '缺少验证密码。' }, 401);
  }

  if (authState !== 'ok') {
    if (authState === 'invalid-cookie') {
      c.header('Set-Cookie', buildClearAuthCookie(isSecureRequest(c.req.url)));
    }
    return c.json({ error: '验证失败。' }, 401);
  }

  await next();
});

app.get('/api/wishes', async (c) => {
  const state = await loadWishState(c.env.WISHLIST_KV);
  const q = normalizeSearchQuery(c.req.query('q'));
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

app.get('/api/wishes/export', async (c) => {
  const [config, state] = await Promise.all([getConfig(c.env.WISHLIST_KV), loadWishState(c.env.WISHLIST_KV)]);

  const payload: WishExportPayload = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    projectName: PROJECT_NAME,
    ownerName: config?.name ?? '',
    wishes: [...state.wishes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
  };

  return c.json(payload);
});

app.post('/api/wishes/import', async (c) => {
  const body = await readJson<{ backup?: unknown; mode?: unknown }>(c);
  if (!body) {
    return c.json({ error: '请求体必须为 JSON。' }, 400);
  }

  const mode = parseImportMode(body.mode);
  if (!mode) {
    return c.json({ error: '导入模式无效，仅支持 replace 或 merge。' }, 400);
  }

  const importedWishes = parseImportedWishes(body.backup ?? body);
  if (!importedWishes) {
    return c.json({ error: '备份文件格式无效。' }, 400);
  }

  const dedupedImported = dedupeWishesById(importedWishes);
  const state = await loadWishState(c.env.WISHLIST_KV);
  const previousTotal = state.wishes.length;
  let mergedOverwritten = 0;

  if (mode === 'replace') {
    state.wishes = dedupedImported;
  } else {
    const merged = new Map(state.wishes.map((wish) => [wish.id, wish] as const));
    for (const wish of dedupedImported) {
      if (merged.has(wish.id)) {
        mergedOverwritten += 1;
      }
      merged.set(wish.id, wish);
    }
    state.wishes = [...merged.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  await saveWishState(c.env.WISHLIST_KV, state);

  return c.json({
    ok: true,
    mode,
    importedCount: importedWishes.length,
    acceptedCount: dedupedImported.length,
    overwrittenCount: mergedOverwritten,
    totalBefore: previousTotal,
    totalAfter: state.wishes.length,
  });
});

app.post('/api/wishes', async (c) => {
  const body = await readJson<{ title?: string; description?: string; done?: boolean }>(c);
  if (!body) {
    return c.json({ error: '请求体必须为 JSON。' }, 400);
  }

  const parsed = parseWishMutation(body, { requireTitle: true });
  if (parsed.ok === false) {
    return c.json({ error: parsed.error }, 400);
  }

  const now = new Date().toISOString();
  const title = parsed.value.title ?? '';
  const description = parsed.value.description ?? '';
  const done = parsed.value.done ?? false;
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
  if (!isValidWishId(id)) {
    return c.json({ error: '愿望 ID 无效。' }, 400);
  }
  const body = await readJson<{ title?: string; description?: string; done?: boolean }>(c);
  if (!body) {
    return c.json({ error: '请求体必须为 JSON。' }, 400);
  }

  const parsed = parseWishMutation(body, { requireTitle: false });
  if (parsed.ok === false) {
    return c.json({ error: parsed.error }, 400);
  }

  const state = await loadWishState(c.env.WISHLIST_KV);
  const index = state.wishes.findIndex((wish) => wish.id === id);

  if (index < 0) {
    return c.json({ error: '愿望不存在。' }, 404);
  }

  const target = state.wishes[index];
  let changed = false;

  if (typeof parsed.value.title === 'string' && parsed.value.title !== target.title) {
    target.title = parsed.value.title;
    changed = true;
  }

  if (typeof parsed.value.description === 'string' && parsed.value.description !== target.description) {
    target.description = parsed.value.description;
    changed = true;
  }

  if (typeof parsed.value.done === 'boolean' && parsed.value.done !== target.done) {
    target.done = parsed.value.done;
    changed = true;
    if (target.done) {
      target.completedAt = new Date().toISOString();
    } else {
      delete target.completedAt;
    }
  }

  if (!changed) {
    return c.json({ wish: target });
  }

  target.updatedAt = new Date().toISOString();
  await saveWishState(c.env.WISHLIST_KV, state);

  return c.json({ wish: target });
});

app.delete('/api/wishes/:id', async (c) => {
  const id = c.req.param('id');
  if (!isValidWishId(id)) {
    return c.json({ error: '愿望 ID 无效。' }, 400);
  }
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
  const raw = await kv.get(CONFIG_KEY, 'json');
  return normalizeConfig(raw);
}

async function loadWishState(kv: KVNamespace): Promise<WishState> {
  const raw = await kv.get(WISHES_KEY, 'json');
  if (!raw || typeof raw !== 'object') {
    return { wishes: [] };
  }

  const rawWishes = (raw as { wishes?: unknown }).wishes;
  if (!Array.isArray(rawWishes)) {
    return { wishes: [] };
  }

  const now = new Date().toISOString();
  const normalized: Wish[] = [];
  for (const item of rawWishes) {
    const wish = normalizeImportedWish(item, now);
    if (wish) {
      normalized.push(wish);
    }
  }

  return { wishes: dedupeWishesById(normalized) };
}

async function saveWishState(kv: KVNamespace, state: WishState): Promise<void> {
  await kv.put(WISHES_KEY, JSON.stringify(state));
}

async function putEntries(kv: KVNamespace, entries: Array<[string, string]>): Promise<void> {
  await Promise.all(entries.map(([key, value]) => kv.put(key, value)));
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

async function hashPassword(password: string, salt: string, algorithm: PasswordHashAlgorithm): Promise<string> {
  if (algorithm === 'pbkdf2-v2') {
    return hashPasswordPbkdf2(password, salt);
  }
  return hashPasswordLegacy(password, salt);
}

async function hashPasswordLegacy(password: string, salt: string): Promise<string> {
  const encoded = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return bytesToBase64(new Uint8Array(digest));
}

async function hashPasswordPbkdf2(password: string, salt: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      iterations: PASSWORD_HASH_ITERATIONS,
      salt: new TextEncoder().encode(`wishlist:${salt}`),
    },
    key,
    256,
  );
  return bytesToBase64(new Uint8Array(bits));
}

async function verifyPassword(config: AppConfig, password: string): Promise<boolean> {
  if (!password) {
    return false;
  }
  const algorithm = config.passwordAlgorithm ?? 'sha256-v1';
  const inputHash = await hashPassword(password, config.salt, algorithm);
  return timingSafeEqual(inputHash, config.passwordHash);
}

async function resolveRequestAuthState(
  c: {
    req: {
      header: (name: string) => string | undefined;
      url: string;
    };
  },
  config: AppConfig,
): Promise<RequestAuthState> {
  const password = (c.req.header('x-wishlist-password') ?? '').trim();
  if (password) {
    const passed = await verifyPassword(config, password);
    return passed ? 'ok' : 'invalid-header';
  }

  const cookieRaw = c.req.header('cookie') ?? '';
  const token = readCookie(cookieRaw, AUTH_COOKIE_NAME);
  if (!token) {
    return 'missing';
  }

  const cookiePassed = await verifyAuthCookieToken(config, token);
  return cookiePassed ? 'ok' : 'invalid-cookie';
}

async function createAuthCookieToken(config: AppConfig): Promise<string> {
  const expiresAt = Math.floor(Date.now() / 1000) + AUTH_COOKIE_MAX_AGE_SECONDS;
  const signature = await signAuthCookieToken(config, expiresAt);
  return `${expiresAt}.${signature}`;
}

async function verifyAuthCookieToken(config: AppConfig, token: string): Promise<boolean> {
  const dotIndex = token.indexOf('.');
  if (dotIndex <= 0 || dotIndex === token.length - 1) {
    return false;
  }

  const expiresAtRaw = token.slice(0, dotIndex);
  const signature = token.slice(dotIndex + 1);
  const expiresAt = Number(expiresAtRaw);
  if (!Number.isInteger(expiresAt)) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  if (expiresAt <= now) {
    return false;
  }

  if (expiresAt > now + AUTH_COOKIE_MAX_AGE_SECONDS + 60) {
    return false;
  }

  const expected = await signAuthCookieToken(config, expiresAt);
  return timingSafeEqual(signature, expected);
}

async function signAuthCookieToken(config: AppConfig, expiresAt: number): Promise<string> {
  const encoded = new TextEncoder().encode(`${AUTH_TOKEN_PREFIX}:${expiresAt}:${config.passwordHash}:${config.salt}`);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return bytesToBase64(new Uint8Array(digest));
}

function readCookie(cookieHeader: string, name: string): string {
  if (!cookieHeader) {
    return '';
  }

  const target = `${name}=`;
  const chunks = cookieHeader.split(';');
  for (const chunk of chunks) {
    const part = chunk.trim();
    if (part.startsWith(target)) {
      return part.slice(target.length);
    }
  }
  return '';
}

function isSecureRequest(url: string): boolean {
  try {
    return new URL(url).protocol === 'https:';
  } catch {
    return false;
  }
}

function buildAuthCookie(token: string, secure: boolean): string {
  const parts = [
    `${AUTH_COOKIE_NAME}=${token}`,
    'Path=/',
    `Max-Age=${AUTH_COOKIE_MAX_AGE_SECONDS}`,
    'HttpOnly',
    'SameSite=Lax',
  ];
  if (secure) {
    parts.push('Secure');
  }
  return parts.join('; ');
}

function buildClearAuthCookie(secure: boolean): string {
  const parts = [
    `${AUTH_COOKIE_NAME}=`,
    'Path=/',
    'Max-Age=0',
    'HttpOnly',
    'SameSite=Lax',
  ];
  if (secure) {
    parts.push('Secure');
  }
  return parts.join('; ');
}

function timingSafeEqual(a: string, b: string): boolean {
  let diff = 0;
  const maxLength = Math.max(a.length, b.length);
  for (let i = 0; i < maxLength; i += 1) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0 && a.length === b.length;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const value of bytes) {
    binary += String.fromCharCode(value);
  }
  return btoa(binary);
}

async function upgradeConfigPassword(config: AppConfig, password: string): Promise<AppConfig> {
  const nextSalt = generateSalt();
  const nextHash = await hashPassword(password, nextSalt, DEFAULT_PASSWORD_ALGORITHM);
  return {
    ...config,
    salt: nextSalt,
    passwordHash: nextHash,
    passwordAlgorithm: DEFAULT_PASSWORD_ALGORITHM,
  };
}

export default app;

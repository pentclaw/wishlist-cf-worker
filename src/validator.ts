import type {
  AppConfig,
  PasswordHashAlgorithm,
  Wish,
  WishImportMode,
  WishMutationBody,
  WishMutationResult,
} from './types.js';

export const MAX_IMPORT_WISHES = 5000;
export const MAX_WISH_ID_LENGTH = 128;
export const MAX_WISH_TITLE_LENGTH = 120;
export const MAX_WISH_DESCRIPTION_LENGTH = 2000;
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;
export const MAX_OWNER_NAME_LENGTH = 40;
export const MAX_QUERY_LENGTH = 200;

export function normalizePositiveInt(
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

export function normalizeSearchQuery(raw: string | undefined): string {
  return (raw ?? '').trim().slice(0, MAX_QUERY_LENGTH).toLowerCase();
}

export function parseImportMode(raw: unknown): WishImportMode | null {
  if (raw === 'replace' || raw === 'merge') {
    return raw;
  }
  return null;
}

export function parseImportedWishes(raw: unknown): Wish[] | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const wishes = (raw as { wishes?: unknown }).wishes;
  if (!Array.isArray(wishes) || wishes.length > MAX_IMPORT_WISHES) {
    return null;
  }

  const now = new Date().toISOString();
  const normalized: Wish[] = [];
  for (const item of wishes) {
    const wish = normalizeImportedWish(item, now);
    if (!wish) {
      return null;
    }
    normalized.push(wish);
  }

  return normalized;
}

export function parseWishMutation(
  body: WishMutationBody,
  options: {
    requireTitle: boolean;
  },
): WishMutationResult {
  const out: {
    title?: string;
    description?: string;
    done?: boolean;
  } = {};

  if (options.requireTitle || body.title !== undefined) {
    if (typeof body.title !== 'string') {
      return { ok: false, error: '项目名称不能为空。' };
    }
    const title = body.title.trim();
    if (!title) {
      return { ok: false, error: '项目名称不能为空。' };
    }
    if (title.length > MAX_WISH_TITLE_LENGTH) {
      return { ok: false, error: `项目名称不能超过 ${MAX_WISH_TITLE_LENGTH} 个字符。` };
    }
    out.title = title;
  }

  if (body.description !== undefined) {
    if (typeof body.description !== 'string') {
      return { ok: false, error: '描述必须是字符串。' };
    }
    const description = body.description.trim();
    if (description.length > MAX_WISH_DESCRIPTION_LENGTH) {
      return { ok: false, error: `描述不能超过 ${MAX_WISH_DESCRIPTION_LENGTH} 个字符。` };
    }
    out.description = description;
  } else if (options.requireTitle) {
    out.description = '';
  }

  if (body.done !== undefined) {
    if (typeof body.done !== 'boolean') {
      return { ok: false, error: 'done 字段必须是布尔值。' };
    }
    out.done = body.done;
  } else if (options.requireTitle) {
    out.done = false;
  }

  return { ok: true, value: out };
}

export function isValidWishId(id: string): boolean {
  const normalized = id.trim();
  return normalized.length > 0 && normalized.length <= MAX_WISH_ID_LENGTH;
}

export function normalizeConfig(raw: unknown): AppConfig | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const input = raw as Record<string, unknown>;
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const passwordHash = typeof input.passwordHash === 'string' ? input.passwordHash.trim() : '';
  const salt = typeof input.salt === 'string' ? input.salt.trim() : '';
  const createdAt = normalizeDateString(input.createdAt, new Date(0).toISOString());
  const passwordAlgorithm = normalizePasswordAlgorithm(input.passwordAlgorithm);

  if (!name) {
    return null;
  }
  if (!passwordHash || !salt) {
    return null;
  }

  return {
    name,
    passwordHash,
    salt,
    createdAt,
    passwordAlgorithm,
  };
}

export function normalizeImportedWish(raw: unknown, fallbackTime: string): Wish | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const input = raw as Record<string, unknown>;

  const title = typeof input.title === 'string' ? input.title.trim() : '';
  if (!title || title.length > MAX_WISH_TITLE_LENGTH) {
    return null;
  }

  const description = typeof input.description === 'string' ? input.description.trim() : '';
  if (description.length > MAX_WISH_DESCRIPTION_LENGTH) {
    return null;
  }

  const done = typeof input.done === 'boolean' ? input.done : false;
  const createdAt = normalizeDateString(input.createdAt, fallbackTime);
  const updatedAt = normalizeDateString(input.updatedAt, createdAt);
  const completedAt = done ? normalizeDateString(input.completedAt, updatedAt) : undefined;
  const normalizedId = typeof input.id === 'string' ? input.id.trim() : '';
  const id = normalizedId && normalizedId.length <= MAX_WISH_ID_LENGTH ? normalizedId : crypto.randomUUID();

  const wish: Wish = {
    id,
    title,
    description,
    done,
    createdAt,
    updatedAt,
  };

  if (completedAt) {
    wish.completedAt = completedAt;
  }

  return wish;
}

export function dedupeWishesById(wishes: Wish[]): Wish[] {
  const unique = new Map<string, Wish>();
  for (const wish of wishes) {
    unique.set(wish.id, wish);
  }
  return [...unique.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function normalizePasswordAlgorithm(raw: unknown): PasswordHashAlgorithm {
  if (raw === 'pbkdf2-v2') {
    return 'pbkdf2-v2';
  }
  return 'sha256-v1';
}

function normalizeDateString(raw: unknown, fallback: string): string {
  if (typeof raw !== 'string') {
    return fallback;
  }
  const value = raw.trim();
  if (!value) {
    return fallback;
  }
  const ts = Date.parse(value);
  if (Number.isNaN(ts)) {
    return fallback;
  }
  return new Date(ts).toISOString();
}

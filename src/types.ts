export type Bindings = {
  WISHLIST_KV: KVNamespace;
};

export type PasswordHashAlgorithm = 'sha256-v1' | 'pbkdf2-v2';

export type AppConfig = {
  name: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  passwordAlgorithm?: PasswordHashAlgorithm;
};

export type Wish = {
  id: string;
  title: string;
  description: string;
  done: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
};

export type WishState = {
  wishes: Wish[];
};

export type WishExportPayload = {
  version: number;
  exportedAt: string;
  projectName: string;
  ownerName: string;
  wishes: Wish[];
};

export type WishImportMode = 'replace' | 'merge';

export type RequestAuthState = 'ok' | 'missing' | 'invalid-header' | 'invalid-cookie';

export type WishMutationBody = {
  title?: unknown;
  description?: unknown;
  done?: unknown;
};

export type WishMutationResult =
  | {
      ok: true;
      value: {
        title?: string;
        description?: string;
        done?: boolean;
      };
    }
  | {
      ok: false;
      error: string;
    };

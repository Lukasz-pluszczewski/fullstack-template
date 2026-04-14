import fs from 'node:fs/promises';
import path from 'node:path';
import JSON5 from 'json5';

const CACHE_FILES_PATH = path.resolve('data');

type CacheRecord<T> = {
  v: number; // record version (lets you expire individual keys if you ever need it)
  expiresAt: number; // unix ms; 0 = never
  accessedAt: number; // unix ms; for LRU eviction
  value: T;
};

type CacheFile<T> = {
  /** Cache format / invalidation version */
  version: number;
  /** unix ms when file last written */
  updatedAt: number;
  /** per-key records */
  records: Record<string, CacheRecord<T>>;
};

const now = () => Date.now();

const ensureDir = async (dir: string) => {
  await fs.mkdir(dir, { recursive: true });
};

const writeFileAtomic = async (filePath: string, content: string) => {
  // Atomic-ish on most platforms: write to temp, then rename over target.
  const tmpPath = `${filePath}.tmp-${process.pid}-${Math.random().toString(16).slice(2)}`;
  await fs.writeFile(tmpPath, content, 'utf8');
  await fs.rename(tmpPath, filePath);
};

const isExpired = (expiresAt: number, t = now()) =>
  expiresAt !== 0 && expiresAt <= t;

/** Simple in-process mutex to avoid concurrent read-modify-write races */
const createMutex = () => {
  let chain = Promise.resolve<void>(undefined);

  return async <R>(fn: () => Promise<R>): Promise<R> => {
    const prev = chain;
    let release!: () => void;
    chain = new Promise<void>(res => (release = res));
    await prev;
    try {
      return await fn();
    } finally {
      release();
    }
  };
};

type CacheOptions = {
  /** Default TTL in milliseconds. 0 = never expires. */
  defaultTtl?: number;
  /** Maximum number of entries. When exceeded, least recently used entries are evicted. 0 = unlimited. */
  maxEntries?: number;
};

export type Cache<T> = Awaited<ReturnType<typeof createCache<T>>>;

export class CacheError<T> extends Error {
  constructor(
    public data: T,
    message?: string
  ) {
    super(message);
  }
}
export const isCacheError = <T>(value: any): value is CacheError<T> =>
  value instanceof CacheError;
export function assertNotCacheError<T, TError>(
  value: T
): asserts value is Exclude<T, CacheError<TError>> {
  if (isCacheError(value)) {
    throw value;
  }
}

/**
 * Creates cache instance, saved to json5 file.
 *
 * TTL values are in **milliseconds**.
 * - ttl = 0 uses defaultTtl (and if that is also 0 => never expires)
 *
 * Version invalidation:
 * - If the cache file has a different version than requested, the whole file is treated as expired (emptied).
 * - Each record also stores a version; a record with different version is treated as expired.
 */
export const createCache = async <T>(
  name: string,
  version: number,
  options: CacheOptions = {}
) => {
  const { defaultTtl = 0, maxEntries = 0 } = options;
  await ensureDir(CACHE_FILES_PATH);

  const filePath = path.join(CACHE_FILES_PATH, `${name}.json5`);
  const withLock = createMutex();

  let loaded = false;
  let state: CacheFile<T> = {
    version,
    updatedAt: now(),
    records: {},
  };

  const load = async () => {
    if (loaded) return;

    try {
      const raw = await fs.readFile(filePath, 'utf8');
      const parsed = JSON5.parse(raw) as Partial<CacheFile<T>>;

      // If file version mismatches, treat as expired (reset).
      if (!parsed || typeof parsed !== 'object' || parsed.version !== version) {
        state = { version, updatedAt: now(), records: {} };
      } else {
        state = {
          version,
          updatedAt:
            typeof parsed.updatedAt === 'number' ? parsed.updatedAt : now(),
          records: (parsed.records ?? {}) as CacheFile<T>['records'],
        };
      }
    } catch (e: any) {
      // File missing or unreadable => start fresh.
      if (e?.code !== 'ENOENT') {
        // If it exists but is corrupted/unreadable, treat as expired (reset).
        state = { version, updatedAt: now(), records: {} };
      }
    } finally {
      loaded = true;
    }
  };

  const save = async () => {
    state.updatedAt = now();
    const content = JSON5.stringify(state, null, 2);
    await writeFileAtomic(filePath, content);
  };

  const normalizeTtl = (ttl: number) => {
    const effective = ttl === 0 ? defaultTtl : ttl;
    return effective <= 0 ? 0 : effective;
  };

  const purgeExpiredInternal = (t: number): number => {
    let removed = 0;

    for (const [key, rec] of Object.entries(state.records)) {
      // Record version mismatch counts as expired too.
      if (!rec || rec.v !== version || isExpired(rec.expiresAt, t)) {
        delete state.records[key];
        removed++;
      }
    }

    return removed;
  };

  /** Evicts least recently used entries until we're at or below maxEntries. Returns number evicted. */
  const evictLruInternal = (): number => {
    if (maxEntries <= 0) return 0;

    const entries = Object.entries(state.records);
    const excess = entries.length - maxEntries;
    if (excess <= 0) return 0;

    // Sort by accessedAt ascending (oldest first)
    const sorted = entries.sort((a, b) => a[1].accessedAt - b[1].accessedAt);

    for (let i = 0; i < excess; i++) {
      delete state.records[sorted[i][0]];
    }

    return excess;
  };

  return {
    async get(key: string): Promise<T | null> {
      return withLock(async () => {
        const t = now();
        await load();

        const rec = state.records[key];
        if (!rec) return null;

        // Version mismatch => expired.
        if (rec.v !== version) {
          delete state.records[key];
          await save();
          return null;
        }

        if (isExpired(rec.expiresAt, t)) {
          delete state.records[key];
          await save();
          return null;
        }

        // Update access time for LRU
        rec.accessedAt = t;
        await save();
        return rec.value;
      });
    },

    async has(key: string): Promise<boolean> {
      return withLock(async () => {
        const t = now();
        await load();

        const rec = state.records[key];
        if (!rec) return false;

        // Version mismatch or expired => doesn't exist
        return rec.v === version && !isExpired(rec.expiresAt, t);
      });
    },

    async getBatch(keys: string[]): Promise<(T | null)[]> {
      return withLock(async () => {
        const t = now();
        await load();

        let needsSave = false;
        const results: (T | null)[] = [];

        for (const key of keys) {
          const rec = state.records[key];

          if (!rec) {
            results.push(null);
            continue;
          }

          // Version mismatch => expired
          if (rec.v !== version) {
            delete state.records[key];
            needsSave = true;
            results.push(null);
            continue;
          }

          if (isExpired(rec.expiresAt, t)) {
            delete state.records[key];
            needsSave = true;
            results.push(null);
            continue;
          }

          // Update access time for LRU
          rec.accessedAt = t;
          needsSave = true;
          results.push(rec.value);
        }

        if (needsSave) await save();
        return results;
      });
    },

    async set(key: string, value: T, ttl: number = 0): Promise<void> {
      return withLock(async () => {
        const t = now();
        await load();

        const effTtl = normalizeTtl(ttl);
        const expiresAt = effTtl === 0 ? 0 : t + effTtl;

        state.records[key] = {
          v: version,
          expiresAt,
          accessedAt: t,
          value,
        };

        // Evict LRU entries if over limit
        evictLruInternal();

        await save();
      });
    },

    async delete(key: string): Promise<boolean> {
      return withLock(async () => {
        await load();

        if (!(key in state.records)) return false;

        delete state.records[key];
        await save();
        return true;
      });
    },

    /** Removes all expired keys (and any keys with a mismatched record version). Returns number removed. */
    async purgeExpired(): Promise<number> {
      return withLock(async () => {
        const t = now();
        await load();
        const removed = purgeExpiredInternal(t);
        if (removed > 0) await save();
        return removed;
      });
    },

    /** Clears all keys. Returns number removed. */
    async clear(): Promise<number> {
      return withLock(async () => {
        await load();

        const count = Object.keys(state.records).length;
        if (count === 0) return 0;

        state.records = {};
        await save();
        return count;
      });
    },

    async withCache<TError>(
      key: string,
      cb: () => T | CacheError<TError> | Promise<T | CacheError<TError>>,
      ttl: number = 0
    ): Promise<T | CacheError<TError>> {
      return withLock(async () => {
        const t = now();
        await load();

        // Fast path: return if present and valid.
        const rec = state.records[key];
        if (rec && rec.v === version && !isExpired(rec.expiresAt, t)) {
          // Update access time for LRU
          rec.accessedAt = t;
          await save();
          return rec.value;
        }

        // If present but invalid, delete it (will be overwritten below, no need to save yet).
        if (rec) {
          delete state.records[key];
        }

        const value = await cb();
        if (value instanceof CacheError) {
          return value;
        }

        const effTtl = normalizeTtl(ttl);
        const expiresAt = effTtl === 0 ? 0 : t + effTtl;

        state.records[key] = { v: version, expiresAt, accessedAt: t, value };

        // Evict LRU entries if over limit
        evictLruInternal();

        await save();

        return value;
      });
    },
  };
};

const toString = (value: any): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'boolean') return value ? '_true_' : '_false_';
  if (value === null) return '_null_';
  if (value === undefined) return '';
  return String(value);
};
export const getStableKey = (
  keyData: string | (string | number | null | undefined)[] | Record<string, any>
): string => {
  if (typeof keyData === 'string') return keyData;
  if (Array.isArray(keyData))
    return keyData.map(value => toString(value)).join('__-__');
  return Object.entries(keyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}__:__${toString(v)}`)
    .join('__-__');
};

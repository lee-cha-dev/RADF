/**
 * @module core/query/cache
 * @description LRU-style cache for query results.
 */

const createStore = () => new Map();

const touch = (store, key, entry) => {
  if (store.has(key)) {
    store.delete(key);
  }
  store.set(key, entry);
};

/**
 * Creates an LRU-style cache for query results.
 *
 * @param {{ maxSize?: number }} [options]
 * @returns {{
 *   get: (key: string) => any,
 *   set: (key: string, entry: any) => any,
 *   has: (key: string) => boolean,
 *   delete: (key: string) => boolean,
 *   clear: () => void,
 *   entries: () => Array<[string, any]>,
 *   size: () => number,
 *   prune: () => void
 * }} Cache API with LRU eviction behavior.
 */
export const createQueryCache = ({ maxSize = 500 } = {}) => {
  const store = createStore();

  const prune = () => {
    if (maxSize <= 0) {
      store.clear();
      return;
    }
    while (store.size > maxSize) {
      const oldestKey = store.keys().next().value;
      store.delete(oldestKey);
    }
  };

  return {
    get: (key) => {
      if (!store.has(key)) {
        return undefined;
      }
      const entry = store.get(key);
      touch(store, key, entry);
      return entry;
    },
    set: (key, entry) => {
      touch(store, key, entry);
      prune();
      return entry;
    },
    has: (key) => store.has(key),
    delete: (key) => store.delete(key),
    clear: () => store.clear(),
    entries: () => Array.from(store.entries()),
    size: () => store.size,
    prune,
  };
};

/**
 * Default in-memory query cache shared by useQuery.
 *
 * @type {ReturnType<typeof createQueryCache>}
 */
export const queryCache = createQueryCache();

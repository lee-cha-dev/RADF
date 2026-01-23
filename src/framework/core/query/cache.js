export const createQueryCache = () => {
  const store = new Map();

  return {
    get: (key) => store.get(key),
    set: (key, entry) => {
      store.set(key, entry);
      return entry;
    },
    has: (key) => store.has(key),
    delete: (key) => store.delete(key),
    clear: () => store.clear(),
    entries: () => Array.from(store.entries()),
  };
};

export const queryCache = createQueryCache();

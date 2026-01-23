const createRegistry = (label = 'registry') => {
  const entries = new Map();

  const register = (key, component) => {
    if (!key) {
      throw new Error(`${label} key is required.`);
    }
    if (!component) {
      throw new Error(`${label} component is required.`);
    }
    entries.set(key, component);
    return component;
  };

  return {
    label,
    register,
    get: (key) => entries.get(key),
    has: (key) => entries.has(key),
    list: () => Array.from(entries.keys()),
  };
};

export const vizRegistry = createRegistry('vizRegistry');
export const insightRegistry = createRegistry('insightRegistry');

export const registerViz = (vizType, component) => vizRegistry.register(vizType, component);
export const registerInsight = (insightType, analyzer) =>
  insightRegistry.register(insightType, analyzer);

export { createRegistry };

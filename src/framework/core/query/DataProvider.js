export const createDataProvider = (execute, { validateResult } = {}) => ({
  execute,
  validateResult,
});

export const isDataProvider = (provider) =>
  Boolean(provider && typeof provider.execute === 'function');

export const assertDataProvider = (provider) => {
  if (!isDataProvider(provider)) {
    throw new Error('DataProvider must implement execute(querySpec, options)');
  }
  return provider;
};

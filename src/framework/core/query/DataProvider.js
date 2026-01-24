/**
 * @module core/query/DataProvider
 * @description Utilities for creating and validating query data providers.
 */

/**
 * @typedef {import('../docs/jsdocTypes').DataProvider} DataProvider
 * @typedef {import('../docs/jsdocTypes').ProviderResult} ProviderResult
 * @typedef {import('../docs/jsdocTypes').QuerySpec} QuerySpec
 */

/**
 * Creates a DataProvider contract wrapper around an execute function.
 *
 * @param {(querySpec: QuerySpec, context: { signal: AbortSignal }) => Promise<ProviderResult>} execute
 *   Function that executes a query against a backend.
 * @param {{ validateResult?: DataProvider['validateResult'] }} [options]
 * @returns {DataProvider} Provider object with execute + optional validation.
 *
 * @example
 * const MyProvider = createDataProvider(async (querySpec, { signal }) => {
 *   const response = await fetch('/api/query', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify(querySpec),
 *     signal,
 *   });
 *   const json = await response.json();
 *   return { rows: json.rows, meta: json.meta };
 * }, {
 *   validateResult: (result) => Array.isArray(result?.rows) || 'rows must be an array',
 * });
 */
export const createDataProvider = (execute, { validateResult } = {}) => ({
  execute,
  validateResult,
});

/**
 * Type guard to check whether a value matches the DataProvider contract.
 *
 * @param {unknown} provider
 * @returns {provider is DataProvider} True when execute(querySpec, options) exists.
 */
export const isDataProvider = (provider) =>
  Boolean(provider && typeof provider.execute === 'function');

/**
 * Ensures a DataProvider is available before executing queries.
 *
 * @param {unknown} provider
 * @returns {DataProvider} The validated provider instance.
 * @throws {Error} When the provider does not implement execute().
 */
export const assertDataProvider = (provider) => {
  if (!isDataProvider(provider)) {
    throw new Error('DataProvider must implement execute(querySpec, options)');
  }
  return provider;
};

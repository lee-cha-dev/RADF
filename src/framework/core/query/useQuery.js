/**
 * @module core/query/useQuery
 * @description React hook for executing QuerySpecs with caching and validation.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { assertDataProvider } from './DataProvider';
import { hashQuerySpec } from './hashQuerySpec';
import { queryCache } from './cache';

/**
 * @typedef {import('../docs/jsdocTypes').QuerySpec} QuerySpec
 * @typedef {import('../docs/jsdocTypes').DataProvider} DataProvider
 * @typedef {import('../docs/jsdocTypes').ProviderResult} ProviderResult
 */

/**
 * @typedef {Object} QueryCache
 * @property {function(string): any} get - Fetch an entry by hash.
 * @property {function(string, Object): any} set - Store an entry by hash.
 * @property {function(): void} [prune] - Optional prune hook for cache eviction.
 */

/**
 * @typedef {Object} UseQueryOptions
 * @property {DataProvider} provider - Provider instance with execute().
 * @property {QueryCache} [cache] - Cache implementation (LRU-style by default).
 * @property {number} [staleTime=30000] - Milliseconds until cached data is stale.
 * @property {boolean} [enabled=true] - When false, skip executing the query.
 * @property {function(QueryState): void} [onSuccess] - Called after successful fetch.
 * @property {function(Error): void} [onError] - Called after failed fetch.
 * @property {function(ProviderResult, QuerySpec): (boolean|string|string[]|{valid: boolean=, errors: string[]=, error: string=})} [validateResult]
 *   - Custom validation for provider results.
 * @property {boolean} [strictResultValidation=false]
 *   - When true, throw on validation errors instead of warning.
 */

/**
 * @typedef {Object} QueryState
 * @property {'idle'|'loading'|'success'|'error'} status
 * @property {Array<Object>|null} data
 * @property {Record<string, unknown>|null} meta
 * @property {Error|null} error
 * @property {number|null} updatedAt
 */

/**
 * @typedef {Object} UseQueryResult
 * @property {Array<Object>|null} data
 * @property {Record<string, unknown>|null} meta
 * @property {boolean} loading
 * @property {Error|null} error
 * @property {'idle'|'loading'|'success'|'error'} status
 * @property {number|null} updatedAt
 * @property {boolean} isStale
 * @property {function(): Promise<QueryState|null>} refetch
 */

/**
 * @returns {number} Epoch milliseconds.
 */
const now = () => Date.now();

/**
 * @param {unknown} value - Candidate value.
 * @returns {boolean} True when value is a plain object.
 */
const isPlainObject = (value) =>
  Boolean(value && typeof value === 'object' && !Array.isArray(value));

/**
 * @param {ProviderResult} result - Provider result to validate.
 * @returns {string[]} Validation error messages.
 */
const getDefaultValidationErrors = (result) => {
  const errors = [];
  if (!Array.isArray(result?.rows)) {
    errors.push('rows must be an array');
  }
  if (result?.meta != null && !isPlainObject(result.meta)) {
    errors.push('meta must be an object when provided');
  }
  return errors;
};

/**
 * @param {UseQueryOptions['validateResult']} validator - Custom validator.
 * @param {ProviderResult} result - Provider result to validate.
 * @param {QuerySpec} querySpec - Query spec that was executed.
 * @returns {string[]} Validation error messages.
 */
const getCustomValidationErrors = (validator, result, querySpec) => {
  if (!validator) {
    return [];
  }
  try {
    const outcome = validator(result, querySpec);
    if (outcome == null || outcome === true) {
      return [];
    }
    if (outcome === false) {
      return ['custom validation failed'];
    }
    if (typeof outcome === 'string') {
      return [outcome];
    }
    if (Array.isArray(outcome)) {
      return outcome;
    }
    if (typeof outcome === 'object' && outcome.valid === false) {
      if (Array.isArray(outcome.errors)) {
        return outcome.errors;
      }
      if (typeof outcome.error === 'string') {
        return [outcome.error];
      }
      return ['custom validation failed'];
    }
    return [];
  } catch (error) {
    return [error?.message || 'custom validation threw an error'];
  }
};

/**
 * Normalize a provider result into rows/meta.
 *
 * @param {ProviderResult} result - Provider result.
 * @returns {{rows: Array<Object>, meta: Record<string, unknown>|null}} Normalized result.
 */
const normalizeProviderResult = (result) => ({
  rows: Array.isArray(result?.rows) ? result.rows : [],
  meta: isPlainObject(result?.meta) ? result.meta : null,
});

/**
 * @param {QueryState|null} entry - Cached entry.
 * @returns {QueryState} Initial state for hook.
 */
const createInitialState = (entry) => ({
  status: entry?.status ?? 'idle',
  data: entry?.data ?? null,
  meta: entry?.meta ?? null,
  error: entry?.error ?? null,
  updatedAt: entry?.updatedAt ?? null,
});

/**
 * @param {QueryState|null} entry - Cached entry.
 * @param {number} staleTime - Milliseconds until stale.
 * @returns {boolean} True when data is stale.
 */
const isStale = (entry, staleTime) => {
  if (!entry?.updatedAt) {
    return true;
  }
  if (staleTime === 0) {
    return true;
  }
  if (staleTime === Infinity) {
    return false;
  }
  return now() - entry.updatedAt > staleTime;
};

/**
 * Executes a QuerySpec through a provider with cache, stale checking, and aborting.
 *
 * Lifecycle notes:
 * - Cache hit: returns cached data immediately, refetches if stale.
 * - Cache miss: sets status to loading and executes provider.
 * - In-flight requests are shared via cache promise.
 * - Aborts on unmount or query spec changes.
 * - Validation failures warn by default and return empty rows; strict mode throws.
 *
 * @param {QuerySpec} querySpec
 * @param {UseQueryOptions} [options]
 * @returns {UseQueryResult}
 *
 * @example
 * const querySpec = {
 *   datasetId: 'sales_dataset',
 *   measures: ['total_revenue'],
 *   dimensions: ['order_month'],
 * };
 *
 * const { data, loading, error, refetch } = useQuery(querySpec, {
 *   provider: myProvider,
 *   staleTime: 60000,
 * });
 */
export const useQuery = (
  querySpec,
  {
    provider,
    cache = queryCache,
    staleTime = 30000,
    enabled = true,
    onSuccess,
    onError,
    validateResult,
    strictResultValidation = false,
  } = {}
) => {
  const activeProvider = useMemo(() => assertDataProvider(provider), [provider]);
  const hash = useMemo(() => hashQuerySpec(querySpec), [querySpec]);
  const abortRef = useRef(null);
  const [state, setState] = useState(() =>
    createInitialState(cache.get(hash))
  );

  const fetchData = useCallback(async (currentHash) => {
    const cached = cache.get(currentHash);
    if (cached?.promise) {
      return cached.promise;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    const promise = activeProvider
      .execute(querySpec, { signal: controller.signal })
      .then((result) => {
        const validator = validateResult || activeProvider?.validateResult;
        const errors = [
          ...getDefaultValidationErrors(result),
          ...getCustomValidationErrors(validator, result, querySpec),
        ].filter(Boolean);

        if (errors.length > 0) {
          const message = `Invalid provider result: ${errors.join('; ')}`;
          if (strictResultValidation) {
            throw new Error(message);
          }
          console.warn(message, { result, querySpec });
        }

        const normalized = normalizeProviderResult(result);
        const entry = {
          status: 'success',
          data: errors.length > 0 ? [] : normalized.rows,
          meta: errors.length > 0 ? null : normalized.meta,
          error: null,
          updatedAt: now(),
        };
        cache.set(currentHash, entry);
        if (cache.prune) {
          cache.prune();
        }
        setState(entry);
        if (onSuccess) {
          onSuccess(entry);
        }
        return entry;
      })
      .catch((error) => {
        if (error?.name === 'AbortError') {
          return null;
        }
        const entry = {
          status: 'error',
          data: null,
          meta: null,
          error,
          updatedAt: now(),
        };
        cache.set(currentHash, entry);
        if (cache.prune) {
          cache.prune();
        }
        setState(entry);
        if (onError) {
          onError(error);
        }
        return entry;
      })
      .finally(() => {
        const current = cache.get(currentHash);
        if (current?.promise === promise) {
          cache.set(currentHash, { ...current, promise: null });
        }
      });

    cache.set(currentHash, {
      status: cached?.status ?? 'loading',
      data: cached?.data ?? null,
      meta: cached?.meta ?? null,
      error: cached?.error ?? null,
      updatedAt: cached?.updatedAt ?? null,
      promise,
    });
    if (cache.prune) {
      cache.prune();
    }

    return promise;
  }, [
    activeProvider,
    cache,
    onError,
    onSuccess,
    querySpec,
    strictResultValidation,
    validateResult,
  ]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const cached = cache.get(hash);
    if (cached?.data) {
      setState(createInitialState(cached));
    } else if (!cached) {
      setState((prev) => ({
        ...prev,
        status: 'loading',
        error: null,
      }));
    }

    if (!cached || isStale(cached, staleTime)) {
      void fetchData(hash);
    }

    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [hash, enabled, staleTime, cache, fetchData]);

  return {
    data: state.data,
    meta: state.meta,
    loading: state.status === 'loading',
    error: state.error,
    status: state.status,
    updatedAt: state.updatedAt,
    isStale: isStale(cache.get(hash), staleTime),
    refetch: () => fetchData(hash),
  };
};

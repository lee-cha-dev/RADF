import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { assertDataProvider } from './DataProvider';
import { hashQuerySpec } from './hashQuerySpec';
import { queryCache } from './cache';

const now = () => Date.now();

const isPlainObject = (value) =>
  Boolean(value && typeof value === 'object' && !Array.isArray(value));

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

const normalizeProviderResult = (result) => ({
  rows: Array.isArray(result?.rows) ? result.rows : [],
  meta: isPlainObject(result?.meta) ? result.meta : null,
});

const createInitialState = (entry) => ({
  status: entry?.status ?? 'idle',
  data: entry?.data ?? null,
  meta: entry?.meta ?? null,
  error: entry?.error ?? null,
  updatedAt: entry?.updatedAt ?? null,
});

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

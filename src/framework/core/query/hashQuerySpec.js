/**
 * @module core/query/hashQuerySpec
 * @description Generates stable cache keys from QuerySpec objects.
 */

import { normalizeQuerySpec } from './normalizeQuerySpec';

/**
 * @typedef {import('../docs/jsdocTypes').QuerySpec} QuerySpec
 */

const stableStringify = (value) => {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    const keys = Object.keys(value).sort();
    return `{${keys
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
};

const hashString = (value) => {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 33) ^ value.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
};

/**
 * Hashes a QuerySpec into a stable cache key string.
 *
 * @param {Partial<QuerySpec>} [querySpec={}]
 * @returns {string} Cache key prefixed with `qs_`.
 */
export const hashQuerySpec = (querySpec = {}) => {
  const normalized = normalizeQuerySpec(querySpec);
  const serialized = stableStringify(normalized);
  return `qs_${hashString(serialized)}`;
};

/**
 * @module core/query/normalizeQuerySpec
 * @description Canonicalizes QuerySpec values for hashing and cache keys.
 */

/**
 * @typedef {import('../docs/jsdocTypes').QuerySpec} QuerySpec
 */

const isPlainObject = (value) =>
  Boolean(value && typeof value === 'object' && !Array.isArray(value));

/**
 * Normalize object keys and nested objects for stable ordering.
 *
 * @param {Object} value - Object to normalize.
 * @returns {Object} Normalized object.
 */
const normalizeObject = (value) => {
  if (!isPlainObject(value)) {
    return value;
  }
  return Object.keys(value)
    .sort()
    .reduce((acc, key) => {
      const nextValue = value[key];
      if (nextValue === undefined) {
        return acc;
      }
      acc[key] = Array.isArray(nextValue)
        ? nextValue.map((item) => normalizeObject(item))
        : isPlainObject(nextValue)
        ? normalizeObject(nextValue)
        : nextValue;
      return acc;
    }, {});
};

/**
 * Normalize array values, sorting primitives for stable ordering.
 *
 * @param {Array} values - Values to normalize.
 * @returns {Array} Normalized values.
 */
const normalizeValues = (values) => {
  if (!Array.isArray(values)) {
    return values;
  }
  const normalized = values.map((value) =>
    isPlainObject(value) ? normalizeObject(value) : value
  );
  const allPrimitive = normalized.every(
    (value) => value === null || ['string', 'number', 'boolean'].includes(typeof value)
  );
  if (!allPrimitive) {
    return normalized;
  }
  return [...normalized].sort();
};

/**
 * Normalize a filter object by expanding value/values and sorting arrays.
 *
 * @param {Object} filter - Filter entry.
 * @returns {Object} Normalized filter.
 */
const normalizeFilter = (filter) => {
  if (!isPlainObject(filter)) {
    return filter;
  }
  const values = normalizeValues(
    filter.values ?? (filter.value !== undefined ? [filter.value] : [])
  );

  return {
    ...filter,
    values,
  };
};

/**
 * Normalize filter arrays by sorting into a stable order.
 *
 * @param {Array} filters - Filter list.
 * @returns {Array} Normalized filters.
 */
const normalizeFilterArray = (filters) => {
  if (!Array.isArray(filters)) {
    return [];
  }
  const normalized = filters
    .filter(Boolean)
    .map((filter) => normalizeFilter(filter));

  return normalized
    .map((filter) => ({
      sortKey: JSON.stringify(filter),
      filter,
    }))
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .map((entry) => entry.filter);
};

/**
 * Normalize a string array and remove falsy values.
 *
 * @param {string[]} values - Values to normalize.
 * @returns {string[]} Sorted string list.
 */
const normalizeStringArray = (values) => {
  if (!Array.isArray(values)) {
    return [];
  }
  return [...values.filter(Boolean)].sort();
};

/**
 * Normalizes a QuerySpec by sorting arrays and removing undefined values.
 *
 * @param {Partial<QuerySpec>} [querySpec={}]
 * @returns {QuerySpec} Normalized query spec with stable ordering.
 */
export const normalizeQuerySpec = (querySpec = {}) => ({
  datasetId: querySpec.datasetId ?? null,
  measures: normalizeStringArray(querySpec.measures),
  dimensions: normalizeStringArray(querySpec.dimensions),
  filters: normalizeFilterArray(querySpec.filters),
  timeRange: querySpec.timeRange ?? null,
  grain: querySpec.grain ?? null,
  sort: normalizeObject(querySpec.sort ?? null),
  limit: querySpec.limit ?? null,
  offset: querySpec.offset ?? null,
  timezone: querySpec.timezone ?? null,
  transforms: Array.isArray(querySpec.transforms)
    ? querySpec.transforms.map((transform) => normalizeObject(transform))
    : [],
});

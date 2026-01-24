/**
 * @module core/query/QuerySpec
 * @description Helpers for building and validating QuerySpec objects.
 */

/**
 * @typedef {import('../docs/jsdocTypes').QuerySpec} QuerySpec
 * @typedef {import('../docs/jsdocTypes').Filter} Filter
 */

/**
 * Normalizes a partial QuerySpec into a complete, immutable shape.
 *
 * @param {Partial<QuerySpec>} [spec={}]
 * @returns {QuerySpec} Normalized QuerySpec with defaulted fields.
 */
export const createQuerySpec = (spec = {}) => ({
  datasetId: spec.datasetId ?? null,
  measures: Array.isArray(spec.measures) ? [...spec.measures] : [],
  dimensions: Array.isArray(spec.dimensions) ? [...spec.dimensions] : [],
  filters: Array.isArray(spec.filters) ? [...spec.filters] : [],
  timeRange: spec.timeRange ?? null,
  grain: spec.grain ?? null,
  sort: spec.sort ?? null,
  limit: spec.limit ?? null,
  offset: spec.offset ?? null,
  timezone: spec.timezone ?? null,
  transforms: Array.isArray(spec.transforms) ? [...spec.transforms] : [],
});

/**
 * Checks whether a value resembles a filter object (field + op).
 *
 * @param {unknown} value
 * @returns {boolean} True when a filter-like object is provided.
 */
export const isFilterObject = (value) =>
  Boolean(value && typeof value === 'object' && value.field && value.op);

/**
 * Normalizes a single filter or list of filters into an array.
 *
 * @param {Filter|Filter[]|null|undefined} filters
 * @returns {Filter[]} Array of filter objects.
 */
export const toFilterArray = (filters) => {
  if (!filters) {
    return [];
  }
  return Array.isArray(filters) ? filters : [filters];
};

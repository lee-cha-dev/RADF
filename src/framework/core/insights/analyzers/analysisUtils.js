/**
 * @module core/insights/analyzers/analysisUtils
 * @description Utilities shared by insight analyzers.
 */

/**
 * @typedef {import('../../docs/jsdocTypes.js').QuerySpec} QuerySpec
 */

/**
 * Find the primary measure id from a QuerySpec or the first numeric field in data.
 * @param {Object[]} rows - Data rows to inspect.
 * @param {QuerySpec|null} querySpec - QuerySpec that supplied the rows.
 * @returns {string|null} Measure id or null when unavailable.
 */
export const findMeasureId = (rows, querySpec) => {
  if (querySpec?.measures?.length) {
    return querySpec.measures[0];
  }
  const sample = rows?.[0];
  if (!sample) {
    return null;
  }
  const numericKey = Object.keys(sample).find((key) => typeof sample[key] === 'number');
  return numericKey || null;
};

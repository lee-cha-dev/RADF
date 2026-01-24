/**
 * @module core/viz/palettes/seriesColors
 * @description Helpers for resolving series color variables.
 */
import { getSeriesVar } from './paletteRegistry';

const DEFAULT_SERIES_COUNT = 12;

/**
 * Normalize keys for series color mapping.
 * @param {Array<*>} keys - Raw keys list.
 * @returns {string[]} Normalized keys.
 */
const normalizeKeys = (keys) => {
  if (!Array.isArray(keys)) {
    return [];
  }
  const seen = new Set();
  const ordered = [];
  keys.forEach((key) => {
    if (key == null) {
      return;
    }
    const normalized = String(key);
    if (seen.has(normalized)) {
      return;
    }
    seen.add(normalized);
    ordered.push(normalized);
  });
  return ordered;
};

/**
 * Resolve the series color variable for an index.
 * @param {number} index - Series index.
 * @param {number} [seriesCount] - Total series count.
 * @returns {string} CSS variable reference.
 */
export const getSeriesColor = (index, seriesCount = DEFAULT_SERIES_COUNT) =>
  getSeriesVar(index, seriesCount);

/**
 * Build a color map for a list of series keys.
 * @param {Array<*>} keys - Series keys.
 * @returns {Object<string, string>} Key-to-color map.
 */
export const getSeriesColorsForKeys = (keys) => {
  const orderedKeys = normalizeKeys(keys);
  return orderedKeys.reduce((acc, key, index) => {
    acc[key] = getSeriesColor(index, DEFAULT_SERIES_COUNT);
    return acc;
  }, {});
};

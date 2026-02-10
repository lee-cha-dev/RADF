/**
 * @module core/interactions/brushZoom
 * @description Utilities for turning chart brush interactions into filters.
 */

/**
 * @typedef {import('../docs/jsdocTypes.js').BrushRange} BrushRange
 * @typedef {import('../docs/jsdocTypes.js').Filter} Filter
 */

/**
 * Clamp a numeric index to a range.
 * @param {number} value - Proposed index.
 * @param {number} min - Minimum index.
 * @param {number} max - Maximum index.
 * @returns {number} Clamped index.
 */
const clampIndex = (value, min, max) => Math.min(max, Math.max(min, value));

/**
 * Build a normalized brush range from chart indices.
 *
 * Edge cases:
 * - Returns null when the data array is empty or the xKey is missing.
 * - Normalizes reversed indices to ensure startIndex <= endIndex.
 *
 * @param {Object} params
 * @param {Object[]} params.data - Chart data array.
 * @param {number} [params.startIndex] - Raw start index from the brush.
 * @param {number} [params.endIndex] - Raw end index from the brush.
 * @param {string} params.xKey - Key used to read x-axis values.
 * @returns {BrushRange|null} Normalized brush range or null when invalid.
 *
 * @example
 * const range = getBrushRange({
 *   data: rows,
 *   startIndex: 2,
 *   endIndex: 6,
 *   xKey: 'order_day',
 * });
 */
export const getBrushRange = ({ data, startIndex, endIndex, xKey }) => {
  if (!Array.isArray(data) || data.length === 0 || !xKey) {
    return null;
  }

  const safeStart = clampIndex(startIndex ?? 0, 0, data.length - 1);
  const safeEnd = clampIndex(endIndex ?? data.length - 1, 0, data.length - 1);
  const normalizedStart = Math.min(safeStart, safeEnd);
  const normalizedEnd = Math.max(safeStart, safeEnd);

  const startValue = data[normalizedStart]?.[xKey];
  const endValue = data[normalizedEnd]?.[xKey];

  if (startValue === undefined || endValue === undefined) {
    return null;
  }

  return {
    startIndex: normalizedStart,
    endIndex: normalizedEnd,
    startValue,
    endValue,
  };
};

/**
 * Render a human-friendly brush label for UI chips.
 *
 * @param {BrushRange|null} range - Brush range from {@link getBrushRange}.
 * @returns {string} Label for display, falling back to "Full range".
 */
export const formatBrushRangeLabel = (range) => {
  if (!range) {
    return 'Full range';
  }
  if (range.startValue === range.endValue) {
    return `${range.startValue}`;
  }
  return `${range.startValue} – ${range.endValue}`;
};

/**
 * Convert a brush range into a BETWEEN filter payload.
 *
 * @param {Object} params
 * @param {string} params.field - Field to filter.
 * @param {BrushRange|null} params.range - Brush range from {@link getBrushRange}.
 * @returns {Filter|null} Filter payload or null when incomplete.
 */
export const buildBrushFilter = ({ field, range }) => {
  if (!field || !range || range.startValue === undefined || range.endValue === undefined) {
    return null;
  }
  const [startValue, endValue] =
    range.startValue <= range.endValue
      ? [range.startValue, range.endValue]
      : [range.endValue, range.startValue];
  return {
    field,
    op: 'BETWEEN',
    values: [startValue, endValue],
  };
};

/**
 * Upsert a brush filter in the provided filter list.
 *
 * @param {Filter[]} [filters=[]] - Existing filter array.
 * @param {Filter|null} brushFilter - Brush filter to insert.
 * @returns {Filter[]} Next filter array with the brush filter replaced/added.
 */
export const upsertBrushFilter = (filters = [], brushFilter) => {
  if (!brushFilter) {
    return filters;
  }
  return [
    ...filters.filter((filter) => filter.field !== brushFilter.field),
    brushFilter,
  ];
};

/**
 * Remove a brush filter for a given field.
 *
 * @param {Filter[]} [filters=[]] - Existing filter array.
 * @param {string} field - Field to remove.
 * @returns {Filter[]} Filter array without the matching field.
 */
export const removeBrushFilter = (filters = [], field) => {
  if (!field) {
    return filters;
  }
  return filters.filter((filter) => filter.field !== field);
};

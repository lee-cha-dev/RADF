/**
 * @module core/query/transforms/rolling
 * @description Rolling window average transform for time series data.
 */

const sortRowsByField = (rows, field, order) => {
  const direction = order === 'desc' ? -1 : 1;
  return [...rows].sort((left, right) => {
    const leftValue = left?.[field];
    const rightValue = right?.[field];

    if (leftValue === rightValue) {
      return 0;
    }
    if (leftValue === undefined || leftValue === null) {
      return 1;
    }
    if (rightValue === undefined || rightValue === null) {
      return -1;
    }
    if (leftValue > rightValue) {
      return 1 * direction;
    }
    if (leftValue < rightValue) {
      return -1 * direction;
    }
    return 0;
  });
};

/**
 * Computes a rolling average over a numeric field.
 *
 * @param {Array<Object>} [rows=[]]
 * @param {object} [options={}]
 * @param {string} options.field - Field to aggregate.
 * @param {number} [options.window=3] - Window size for the rolling average.
 * @param {string} [options.sortBy] - Optional field used to sort rows.
 * @param {'asc'|'desc'} [options.order='asc'] - Sort order for the window.
 * @param {string} [options.resultField] - Output field name override.
 * @returns {Array<Object>} Rows with the rolling field appended.
 */
export const rollingRows = (
  rows = [],
  { field, window = 3, sortBy, order = 'asc', resultField } = {}
) => {
  if (!field) {
    return Array.isArray(rows) ? [...rows] : [];
  }

  const list = Array.isArray(rows) ? rows : [];
  const sorted = sortRowsByField(list, sortBy || field, order);
  const outputField = resultField || `${field}_rolling_${window}`;

  return sorted.map((row, index) => {
    const start = Math.max(0, index - window + 1);
    const windowRows = sorted.slice(start, index + 1);
    const values = windowRows
      .map((item) => Number(item?.[field]))
      .filter((value) => Number.isFinite(value));
    const total = values.reduce((sum, value) => sum + value, 0);
    const average = values.length ? total / values.length : null;

    return {
      ...row,
      [outputField]: average,
    };
  });
};

/**
 * @module core/query/transforms/sort
 * @description Sorting transform for query result rows.
 */

/**
 * Sorts rows based on a field or custom comparator.
 *
 * @param {Array<Object>} [rows=[]]
 * @param {object} [options={}]
 * @param {string} [options.field] - Field used for sorting.
 * @param {'asc'|'desc'} [options.order='asc'] - Sort order.
 * @param {(left: Object, right: Object) => number} [options.comparator]
 *   - Custom comparator to override field-based comparison.
 * @returns {Array<Object>} Sorted rows.
 */
export const sortRows = (rows = [], { field, order = 'asc', comparator } = {}) => {
  const list = Array.isArray(rows) ? [...rows] : [];
  if (!field && !comparator) {
    return list;
  }

  const direction = order === 'desc' ? -1 : 1;
  const compare =
    comparator ||
    ((left, right) => {
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
        return 1;
      }
      if (leftValue < rightValue) {
        return -1;
      }
      return 0;
    });

  return list.sort((left, right) => compare(left, right) * direction);
};

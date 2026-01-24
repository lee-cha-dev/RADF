/**
 * @module core/query/transforms/pivot
 * @description Pivot a column of values into a wide table.
 */

/**
 * Pivot rows from long format into wide format.
 *
 * @param {Array<Object>} [rows=[]]
 * @param {object} [options={}]
 * @param {string} options.index - Field used as the row index.
 * @param {string} options.column - Field whose values become column headers.
 * @param {string} options.value - Field whose values populate pivoted columns.
 * @param {number} [options.fill=0] - Fill value for missing combinations.
 * @param {boolean} [options.sortColumns=true] - Sort pivoted columns alphabetically.
 * @returns {Array<Object>} Pivoted rows.
 */
export const pivotRows = (
  rows = [],
  { index, column, value, fill = 0, sortColumns = true } = {}
) => {
  const list = Array.isArray(rows) ? rows : [];
  if (!index || !column || !value) {
    return [...list];
  }

  const columnValues = Array.from(
    new Set(list.map((row) => row?.[column]).filter((val) => val !== undefined))
  );
  const orderedColumns = sortColumns ? [...columnValues].sort() : columnValues;
  const grouped = new Map();

  list.forEach((row) => {
    const indexValue = row?.[index];
    const columnValue = row?.[column];
    if (indexValue === undefined || columnValue === undefined) {
      return;
    }
    const current = grouped.get(indexValue) || { [index]: indexValue };
    current[columnValue] = row?.[value];
    grouped.set(indexValue, current);
  });

  return Array.from(grouped.values()).map((row) => {
    const filledRow = { ...row };
    orderedColumns.forEach((columnKey) => {
      if (filledRow[columnKey] === undefined) {
        filledRow[columnKey] = fill;
      }
    });
    return filledRow;
  });
};

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

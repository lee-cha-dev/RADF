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

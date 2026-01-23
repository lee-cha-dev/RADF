const clampIndex = (value, min, max) => Math.min(max, Math.max(min, value));

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

export const formatBrushRangeLabel = (range) => {
  if (!range) {
    return 'Full range';
  }
  if (range.startValue === range.endValue) {
    return `${range.startValue}`;
  }
  return `${range.startValue} – ${range.endValue}`;
};

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

export const upsertBrushFilter = (filters = [], brushFilter) => {
  if (!brushFilter) {
    return filters;
  }
  return [
    ...filters.filter((filter) => filter.field !== brushFilter.field),
    brushFilter,
  ];
};

export const removeBrushFilter = (filters = [], field) => {
  if (!field) {
    return filters;
  }
  return filters.filter((filter) => filter.field !== field);
};

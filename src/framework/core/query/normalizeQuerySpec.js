const isPlainObject = (value) =>
  Boolean(value && typeof value === 'object' && !Array.isArray(value));

const normalizeObject = (value) => {
  if (!isPlainObject(value)) {
    return value;
  }
  return Object.keys(value)
    .sort()
    .reduce((acc, key) => {
      const nextValue = value[key];
      if (nextValue === undefined) {
        return acc;
      }
      acc[key] = Array.isArray(nextValue)
        ? nextValue.map((item) => normalizeObject(item))
        : isPlainObject(nextValue)
        ? normalizeObject(nextValue)
        : nextValue;
      return acc;
    }, {});
};

const normalizeValues = (values) => {
  if (!Array.isArray(values)) {
    return values;
  }
  const normalized = values.map((value) =>
    isPlainObject(value) ? normalizeObject(value) : value
  );
  const allPrimitive = normalized.every(
    (value) => value === null || ['string', 'number', 'boolean'].includes(typeof value)
  );
  if (!allPrimitive) {
    return normalized;
  }
  return [...normalized].sort();
};

const normalizeFilter = (filter) => {
  if (!isPlainObject(filter)) {
    return filter;
  }
  const values = normalizeValues(
    filter.values ?? (filter.value !== undefined ? [filter.value] : [])
  );

  return {
    ...filter,
    values,
  };
};

const normalizeFilterArray = (filters) => {
  if (!Array.isArray(filters)) {
    return [];
  }
  const normalized = filters
    .filter(Boolean)
    .map((filter) => normalizeFilter(filter));

  return normalized
    .map((filter) => ({
      sortKey: JSON.stringify(filter),
      filter,
    }))
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .map((entry) => entry.filter);
};

const normalizeStringArray = (values) => {
  if (!Array.isArray(values)) {
    return [];
  }
  return [...values.filter(Boolean)].sort();
};

export const normalizeQuerySpec = (querySpec = {}) => ({
  datasetId: querySpec.datasetId ?? null,
  measures: normalizeStringArray(querySpec.measures),
  dimensions: normalizeStringArray(querySpec.dimensions),
  filters: normalizeFilterArray(querySpec.filters),
  timeRange: querySpec.timeRange ?? null,
  grain: querySpec.grain ?? null,
  sort: normalizeObject(querySpec.sort ?? null),
  limit: querySpec.limit ?? null,
  offset: querySpec.offset ?? null,
  timezone: querySpec.timezone ?? null,
  transforms: Array.isArray(querySpec.transforms)
    ? querySpec.transforms.map((transform) => normalizeObject(transform))
    : [],
});

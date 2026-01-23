export const createQuerySpec = (spec = {}) => ({
  datasetId: spec.datasetId ?? null,
  measures: Array.isArray(spec.measures) ? [...spec.measures] : [],
  dimensions: Array.isArray(spec.dimensions) ? [...spec.dimensions] : [],
  filters: Array.isArray(spec.filters) ? [...spec.filters] : [],
  timeRange: spec.timeRange ?? null,
  grain: spec.grain ?? null,
  sort: spec.sort ?? null,
  limit: spec.limit ?? null,
  offset: spec.offset ?? null,
  timezone: spec.timezone ?? null,
  transforms: Array.isArray(spec.transforms) ? [...spec.transforms] : [],
});

export const isFilterObject = (value) =>
  Boolean(value && typeof value === 'object' && value.field && value.op);

export const toFilterArray = (filters) => {
  if (!filters) {
    return [];
  }
  return Array.isArray(filters) ? filters : [filters];
};

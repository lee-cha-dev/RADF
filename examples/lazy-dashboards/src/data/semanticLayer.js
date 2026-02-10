/**
 * @typedef {Object} MetricOperator
 * @property {string} key
 * @property {string} label
 * @property {string} op
 * @property {string} format
 */

/**
 * @typedef {Object} DatasetColumn
 * @property {string} id
 * @property {string} [label]
 * @property {string} [type]
 * @property {string} [inferredType]
 * @property {string} [role]
 * @property {string} [inferredRole]
 */

/**
 * @type {MetricOperator[]}
 */
export const METRIC_OPERATORS = [
  { key: 'sum', label: 'Sum', op: 'SUM', format: 'number' },
  { key: 'avg', label: 'Average', op: 'AVG', format: 'number' },
  { key: 'min', label: 'Minimum', op: 'MIN', format: 'number' },
  { key: 'max', label: 'Maximum', op: 'MAX', format: 'number' },
  { key: 'count', label: 'Count', op: 'COUNT', format: 'integer' },
];

const getColumnLabel = (column) => column?.label || column?.id || 'Field';

const getColumnType = (column) => column?.type || column?.inferredType;

const getColumnRole = (column) => column?.role || column?.inferredRole;

const normalizeDimensionType = (type) => {
  if (type === 'bool') {
    return 'boolean';
  }
  if (type === 'date' || type === 'number' || type === 'boolean') {
    return type;
  }
  return 'string';
};

const isMetricColumn = (column) => {
  const role = getColumnRole(column);
  if (role === 'metric') {
    return true;
  }
  if (role === 'dimension') {
    return false;
  }
  return getColumnType(column) === 'number';
};

const isDimensionColumn = (column) => {
  const role = getColumnRole(column);
  if (role === 'dimension') {
    return true;
  }
  if (role === 'metric') {
    return false;
  }
  return getColumnType(column) !== 'number';
};

/**
 * Builds dimension suggestions from dataset columns.
 *
 * @param {DatasetColumn[]} [columns]
 * @returns {Object[]} The dimension suggestions.
 */
export const buildDimensionSuggestions = (columns = []) => {
  const dimensionColumns = columns.filter(
    (column) => column?.id && isDimensionColumn(column)
  );
  const fallbackColumns = dimensionColumns.length ? dimensionColumns : columns;

  return fallbackColumns
    .filter((column) => column?.id)
    .map((column) => ({
      id: column.id,
      label: getColumnLabel(column),
      type: normalizeDimensionType(getColumnType(column)),
      sourceField: column.id,
    }));
};

/**
 * Builds metric suggestions from dataset columns.
 *
 * @param {DatasetColumn[]} [columns]
 * @returns {Object[]} The metric groups with operator variants.
 */
export const buildMetricSuggestions = (columns = []) =>
  columns
    .filter((column) => column?.id && isMetricColumn(column))
    .map((column) => ({
      fieldId: column.id,
      fieldLabel: getColumnLabel(column),
      metrics: METRIC_OPERATORS.map((operator) => ({
        id: `${operator.key}_${column.id}`,
        label: `${operator.label} ${getColumnLabel(column)}`,
        format: operator.format,
        opKey: operator.key,
        opLabel: operator.label,
        query: { op: operator.op, field: column.id },
        sourceField: column.id,
      })),
    }));

/**
 * Builds a default semantic layer from dataset columns.
 *
 * @param {DatasetColumn[]} [columns]
 * @returns {{ dimensions: Object[], metrics: Object[] }} The semantic layer.
 */
export const buildDefaultSemanticLayer = (columns = []) => ({
  dimensions: buildDimensionSuggestions(columns),
  metrics: buildMetricSuggestions(columns).flatMap((group) => group.metrics),
});

/**
 * @module core/model/createDataset
 * @description Factory helper for defining dataset schemas in the semantic layer.
 */

/**
 * Create a dataset schema for use in dashboards and query specs.
 *
 * Validation:
 * - Requires `id` and `label`.
 * - Defaults `dimensions`, `metrics`, and `hierarchies` to empty arrays.
 * - Sets `timezone` to `"UTC"` if not provided.
 *
 * @param {object} config - Dataset configuration.
 * @param {string} config.id - Unique dataset id.
 * @param {string} config.label - Human-readable dataset label.
 * @param {Array} config.dimensions - Dimension definitions for the dataset.
 * @param {Array} config.metrics - Metric definitions for the dataset.
 * @param {Array} [config.hierarchies] - Optional custom hierarchies.
 * @param {object} [config.defaultGrain] - Default grain metadata for the dataset.
 * @param {string} [config.timezone] - Dataset timezone (defaults to UTC).
 * @returns {object} Dataset definition with derived lookup maps.
 * @throws {Error} When `id` or `label` are missing.
 * @example
 * import createDataset from './createDataset';
 * import createMetric from './createMetric';
 * import createDimension from './createDimension';
 *
 * const totalRevenue = createMetric({
 *   id: 'total_revenue',
 *   label: 'Total Revenue',
 *   format: 'currency',
 *   query: { field: 'revenue', op: 'SUM' },
 * });
 *
 * const orderMonth = createDimension({
 *   id: 'order_month',
 *   label: 'Order Month',
 *   type: 'date',
 *   hierarchy: {
 *     id: 'order_date',
 *     type: 'date',
 *     levels: ['order_year', 'order_quarter', 'order_month', 'order_day'],
 *   },
 * });
 *
 * export const salesDataset = createDataset({
 *   id: 'sales',
 *   label: 'Sales Dataset',
 *   dimensions: [orderMonth],
 *   metrics: [totalRevenue],
 * });
 *
 * // Reference from a dashboard config:
 * // { datasetId: salesDataset.id, query: { measures: ['total_revenue'] } }
 */
const createDataset = ({
  id,
  label,
  dimensions = [],
  metrics = [],
  hierarchies = [],
  defaultGrain = null,
  timezone = "UTC",
} = {}) => {
  if (!id) {
    throw new Error("Dataset requires an id");
  }

  if (!label) {
    throw new Error(`Dataset ${id} requires a label`);
  }

  const dimensionById = Object.fromEntries(
    dimensions.map((dimension) => [dimension.id, dimension])
  );
  const metricById = Object.fromEntries(
    metrics.map((metric) => [metric.id, metric])
  );

  return {
    id,
    label,
    dimensions,
    metrics,
    hierarchies,
    defaultGrain,
    timezone,
    fields: {
      dimensions,
      metrics,
      dimensionById,
      metricById,
    },
  };
};

export default createDataset;

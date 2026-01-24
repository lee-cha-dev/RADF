/**
 * @module core/model/createMetric
 * @description Factory helper for defining semantic metrics.
 */

/**
 * Create a metric schema for use in datasets and query specs.
 *
 * Validation:
 * - Requires `id` and `label`.
 * - Must define either `query` (provider aggregation) or `compute` (client calc).
 *
 * @param {object} config - Metric configuration.
 * @param {string} config.id - Unique metric id.
 * @param {string} config.label - Display label for UI surfaces.
 * @param {string} [config.format] - Formatting hint (currency, percent, etc.).
 * @param {string[]} [config.dependsOn] - Other metric ids required for compute.
 * @param {object} [config.query] - Provider aggregation spec (field/op/etc.).
 * @param {function} [config.compute] - Client-side compute function.
 * @param {string[]} [config.validGrains] - Allowed grains for the metric.
 * @param {object} [config.constraints] - Optional constraint metadata.
 * @returns {object} Metric definition.
 * @throws {Error} When required fields are missing or no query/compute defined.
 * @example
 * import createMetric from './createMetric';
 *
 * const totalRevenue = createMetric({
 *   id: 'total_revenue',
 *   label: 'Total Revenue',
 *   format: 'currency',
 *   query: { field: 'revenue', op: 'SUM' },
 * });
 */
const createMetric = ({
  id,
  label,
  format,
  dependsOn,
  query,
  compute,
  validGrains,
  constraints,
} = {}) => {
  if (!id) {
    throw new Error("Metric requires an id");
  }

  if (!label) {
    throw new Error(`Metric ${id} requires a label`);
  }

  if (!query && !compute) {
    throw new Error(`Metric ${id} must define query or compute`);
  }

  return {
    id,
    label,
    format: format || "number",
    dependsOn: dependsOn || [],
    query: query || null,
    compute: compute || null,
    validGrains: validGrains || [],
    constraints: constraints || null,
  };
};

export default createMetric;

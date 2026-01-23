/**
 * @param {object} config
 * @param {string} config.id
 * @param {string} config.label
 * @param {Array} config.dimensions
 * @param {Array} config.metrics
 * @param {Array} [config.hierarchies]
 * @param {object} [config.defaultGrain]
 * @param {string} [config.timezone]
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

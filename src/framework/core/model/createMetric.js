/**
 * @param {object} config
 * @param {string} config.id
 * @param {string} config.label
 * @param {string} [config.format]
 * @param {string[]} [config.dependsOn]
 * @param {object} [config.query]
 * @param {function} [config.compute]
 * @param {string[]} [config.validGrains]
 * @param {object} [config.constraints]
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

import { FIELD_TYPES, isFieldType } from "./fieldTypes";

/**
 * @param {object} config
 * @param {string} config.id
 * @param {string} config.label
 * @param {string} config.type
 * @param {object} [config.hierarchy]
 * @param {function} [config.formatter]
 */
const createDimension = ({ id, label, type, hierarchy, formatter } = {}) => {
  if (!id) {
    throw new Error("Dimension requires an id");
  }

  if (!label) {
    throw new Error(`Dimension ${id} requires a label`);
  }

  if (!isFieldType(type)) {
    throw new Error(
      `Dimension ${id} has invalid type. Expected one of ${Object.values(
        FIELD_TYPES
      ).join(", ")}.`
    );
  }

  return {
    id,
    label,
    type,
    hierarchy: hierarchy || null,
    formatter: formatter || null,
  };
};

export default createDimension;

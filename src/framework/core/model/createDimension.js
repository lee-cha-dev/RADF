import { FIELD_TYPES, isFieldType } from "./fieldTypes";

/**
 * @module core/model/createDimension
 * @description Factory helper for defining semantic dimensions.
 */

/**
 * Create a dimension schema for use in datasets and query specs.
 *
 * Validation:
 * - Requires `id` and `label`.
 * - `type` must be one of the FIELD_TYPES values.
 *
 * @param {object} config - Dimension configuration.
 * @param {string} config.id - Unique dimension id.
 * @param {string} config.label - Display label for UI surfaces.
 * @param {string} config.type - Dimension field type.
 * @param {object} [config.hierarchy] - Optional hierarchy metadata for drilldowns.
 * @param {function} [config.formatter] - Optional value formatter.
 * @returns {object} Dimension definition.
 * @throws {Error} When required fields are missing or `type` is invalid.
 * @example
 * import { FIELD_TYPES } from './fieldTypes';
 * import createDimension from './createDimension';
 *
 * const orderMonth = createDimension({
 *   id: 'order_month',
 *   label: 'Order Month',
 *   type: FIELD_TYPES.DATE,
 *   hierarchy: {
 *     id: 'order_date',
 *     type: 'date',
 *     levels: ['order_year', 'order_quarter', 'order_month', 'order_day'],
 *   },
 * });
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

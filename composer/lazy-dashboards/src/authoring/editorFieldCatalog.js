/**
 * @typedef {Object} FieldSchema
 * @property {string} [type]
 * @property {string} [control]
 */

const FIELD_CATALOG = {
  boolean: { control: 'toggle' },
  enum: { control: 'select' },
  number: { control: 'number' },
  string: { control: 'text' },
  stringList: { control: 'list' },
  color: { control: 'color' },
};

/**
 * Resolves the editor control for a field schema.
 *
 * @param {FieldSchema} [schema]
 * @returns {string} The editor control id.
 */
export const resolveEditorControl = (schema = {}) =>
  schema.control || FIELD_CATALOG[schema.type]?.control || 'text';

/**
 * Lists the supported field types in the catalog.
 *
 * @returns {string[]} The available field types.
 */
export const listEditorFieldTypes = () => Object.keys(FIELD_CATALOG);

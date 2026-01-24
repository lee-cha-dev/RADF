/**
 * @module core/model/fieldTypes
 * @description Field type utilities for semantic dimensions.
 */

/**
 * Supported field type identifiers for dimension definitions.
 * @type {Record<string, string>}
 */
export const FIELD_TYPES = {
  STRING: "string",
  NUMBER: "number",
  DATE: "date",
  BOOLEAN: "boolean",
  GEO: "geo",
};

/**
 * Cached list of FIELD_TYPES values.
 * @type {string[]}
 */
export const FIELD_TYPE_VALUES = Object.values(FIELD_TYPES);

/**
 * Check whether a value is a supported field type.
 * @param {string} value - Candidate field type.
 * @returns {boolean} True if the value is a supported field type.
 */
export const isFieldType = (value) => FIELD_TYPE_VALUES.includes(value);

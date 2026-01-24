/**
 * @module core/model/hierarchies
 * @description Helpers for dimension hierarchy metadata.
 */

/**
 * Built-in hierarchy type identifiers.
 * @type {Record<string, string>}
 */
export const HIERARCHY_TYPES = {
  DATE: "date",
  ORG: "org",
  GEO: "geo",
};

/**
 * Default date hierarchy levels used for drilldowns.
 * @type {{type: string, levels: string[]}}
 */
export const DEFAULT_DATE_HIERARCHY = {
  type: HIERARCHY_TYPES.DATE,
  levels: ["date_year", "date_quarter", "date_month", "date_day"],
};

/**
 * Create a hierarchy metadata object for dimensions.
 *
 * @param {object} config - Hierarchy configuration.
 * @param {string} config.id - Unique hierarchy id.
 * @param {string} config.type - Hierarchy type identifier.
 * @param {string[]} config.levels - Ordered drill levels.
 * @param {string} [config.label] - Optional display label.
 * @returns {{id: string, type: string, levels: string[], label: string}}
 * @example
 * import { createHierarchy, HIERARCHY_TYPES } from './hierarchies';
 *
 * const orgHierarchy = createHierarchy({
 *   id: 'org_levels',
 *   type: HIERARCHY_TYPES.ORG,
 *   levels: ['org_company', 'org_department', 'org_team'],
 * });
 */
export const createHierarchy = ({ id, type, levels, label }) => ({
  id,
  type,
  levels,
  label: label || id,
});

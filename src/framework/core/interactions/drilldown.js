/**
 * @module core/interactions/drilldown
 * @description Utilities for building drilldown path entries and labels.
 */

import { getCrossFilterValueFromEvent } from './crossFilter';

/**
 * @typedef {import('../docs/jsdocTypes.js').DrilldownPath} DrilldownPath
 * @typedef {import('../docs/jsdocTypes.js').Filter} Filter
 */

/**
 * Build a stable drilldown entry id.
 * @param {Object} params - Drilldown identity inputs.
 * @param {string|null|undefined} params.panelId - Source panel id.
 * @param {string} params.dimension - Dimension name.
 * @param {string|number|Date} params.value - Selected dimension value.
 * @returns {string} Drilldown id.
 */
const buildDrilldownId = ({ panelId, dimension, value }) =>
  `${panelId || 'panel'}:${dimension}:${String(value)}`;

/**
 * Create a drilldown entry for a clicked value.
 *
 * @param {Object} params
 * @param {string|null} [params.panelId] - Source panel id.
 * @param {string} params.dimension - Dimension being drilled.
 * @param {string} [params.to] - Next dimension in the hierarchy.
 * @param {string|number|Date} params.value - Selected value.
 * @param {string} [params.label] - Optional label override.
 * @returns {DrilldownPath|null} Drilldown entry or null when invalid.
 *
 * @example
 * const entry = createDrilldownEntry({
 *   panelId: panel.id,
 *   dimension: 'order_month',
 *   to: 'order_day',
 *   value: '2024-01',
 * });
 */
export const createDrilldownEntry = ({
  panelId,
  dimension,
  to,
  value,
  label,
}) => {
  if (!dimension || value === undefined || value === null) {
    return null;
  }
  const resolvedLabel = label
    ? `${label}: ${value}`
    : `${dimension}: ${value}`;
  return {
    id: buildDrilldownId({ panelId, dimension, value }),
    sourcePanelId: panelId || null,
    dimension,
    to,
    value,
    label: resolvedLabel,
    /** @type {Filter} */
    filter: {
      field: dimension,
      op: 'IN',
      values: [value],
    },
  };
};

/**
 * Build a drilldown entry from a chart event payload.
 *
 * @param {Object} params
 * @param {Object} params.event - Recharts event payload.
 * @param {string|null} [params.panelId] - Source panel id.
 * @param {string} params.dimension - Dimension to read from the event.
 * @param {string} [params.to] - Next dimension in the hierarchy.
 * @param {string} [params.label] - Optional label override.
 * @returns {DrilldownPath|null} Drilldown entry or null when missing values.
 *
 * @example
 * const entry = buildDrilldownEntryFromEvent({
 *   event,
 *   panelId: panel.id,
 *   dimension: 'order_month',
 *   to: 'order_day',
 * });
 *
 * if (entry) {
 *   dashboardActions.pushDrillPath(entry);
 * }
 */
export const buildDrilldownEntryFromEvent = ({
  event,
  panelId,
  dimension,
  to,
  label,
}) => {
  const value = getCrossFilterValueFromEvent(event, dimension);
  if (value === null || value === undefined) {
    return null;
  }
  return createDrilldownEntry({
    panelId,
    dimension,
    to,
    value,
    label,
  });
};

/**
 * Replace dimensions based on the active drill path.
 *
 * @param {Object} params
 * @param {string[]} [params.dimensions=[]] - Original dimension list.
 * @param {DrilldownPath[]} [params.drillPath=[]] - Active drill entries.
 * @param {Object} params.drilldownConfig - Drilldown config presence indicator.
 * @returns {string[]} Dimensions with drilldown substitutions applied.
 */
export const applyDrilldownToDimensions = ({
  dimensions = [],
  drillPath = [],
  drilldownConfig,
}) => {
  if (!drilldownConfig || !drillPath.length) {
    return dimensions;
  }
  return drillPath.reduce((nextDimensions, entry) => {
    if (!entry?.dimension || !entry?.to) {
      return nextDimensions;
    }
    return nextDimensions.map((dimension) =>
      dimension === entry.dimension ? entry.to : dimension
    );
  }, [...dimensions]);
};

/**
 * Determine if a drilldown entry already exists.
 *
 * @param {DrilldownPath[]} [drillPath=[]] - Existing drilldown entries.
 * @param {DrilldownPath|null} entry - Candidate entry.
 * @returns {boolean} True when a duplicate id is found.
 */
export const isDrilldownDuplicate = (drillPath = [], entry) => {
  if (!entry) {
    return false;
  }
  return drillPath.some((existing) => existing.id === entry.id);
};

/**
 * Resolve a human-friendly drilldown label.
 *
 * @param {DrilldownPath|null} entry - Drilldown entry.
 * @returns {string} Display label (empty string when missing).
 */
export const getDrilldownLabel = (entry) => {
  if (!entry) {
    return '';
  }
  if (entry.label) {
    return entry.label;
  }
  return `${entry.dimension || 'Dimension'}: ${entry.value}`;
};

/**
 * @module core/interactions/crossFilter
 * @description Helpers for building cross-filter selections from chart events.
 */

/**
 * @typedef {import('../docs/jsdocTypes.js').Selection} Selection
 * @typedef {import('../docs/jsdocTypes.js').Filter} Filter
 */

/**
 * Build a stable selection id string.
 * @param {Object} params - Selection identity inputs.
 * @param {string|null|undefined} params.panelId - Source panel id.
 * @param {string} params.field - Selected field.
 * @param {string|number} params.value - Selected value identifier.
 * @returns {string} Selection id.
 */
const buildSelectionId = ({ panelId, field, value }) =>
  `${panelId || 'panel'}:${field}:${String(value)}`;

/**
 * Create a selection payload for cross-filter interactions.
 *
 * @param {Object} params
 * @param {string|null} [params.panelId] - Source panel id.
 * @param {string} params.field - Field to filter.
 * @param {string|string[]|number|number[]} params.value - Selected value(s).
 * @param {string} [params.op='IN'] - Filter operator to use.
 * @param {string} [params.label] - Optional label override.
 * @returns {Selection|null} Selection payload or null when missing fields.
 *
 * @example
 * const selection = createCrossFilterSelection({
 *   panelId: panel.id,
 *   field: 'region',
 *   value: 'West',
 * });
 */
export const createCrossFilterSelection = ({
  panelId,
  field,
  value,
  op = 'IN',
  label,
}) => {
  if (!field) {
    return null;
  }
  const values = Array.isArray(value) ? value : [value];
  const resolvedLabel = label
    ? `${label}: ${values.join(', ')}`
    : `${field}: ${values.join(', ')}`;
  return {
    id: buildSelectionId({ panelId, field, value: values.join('|') }),
    sourcePanelId: panelId || null,
    label: resolvedLabel,
    /** @type {Filter} */
    filter: {
      field,
      op,
      values,
    },
  };
};

/**
 * Extract a field value from a Recharts event payload.
 *
 * This helper checks multiple event shapes to accommodate line, bar, and
 * brush interactions.
 *
 * @param {Object} event - Recharts event payload.
 * @param {string} field - Field to read from the payload.
 * @returns {string|number|null} Extracted value or null when missing.
 */
export const getCrossFilterValueFromEvent = (event, field) => {
  if (!event || !field) {
    return null;
  }
  if (event.payload && event.payload[field] !== undefined) {
    return event.payload[field];
  }
  if (event.payload?.payload && event.payload.payload[field] !== undefined) {
    return event.payload.payload[field];
  }
  const activePayload = event.activePayload?.[0]?.payload;
  if (activePayload && activePayload[field] !== undefined) {
    return activePayload[field];
  }
  if (event.activeLabel !== undefined && field === event.activeLabelField) {
    return event.activeLabel;
  }
  if (event[field] !== undefined) {
    return event[field];
  }
  return null;
};

/**
 * Convenience wrapper that builds a selection from a chart event.
 *
 * @param {Object} params
 * @param {Object} params.event - Recharts event payload.
 * @param {string|null} [params.panelId] - Source panel id.
 * @param {string} params.field - Field to read from the event.
 * @param {string} [params.op] - Filter operator to use.
 * @param {string} [params.label] - Optional label override.
 * @returns {Selection|null} Selection payload or null when missing values.
 *
 * @example
 * const selection = buildCrossFilterSelectionFromEvent({
 *   event,
 *   panelId: panel.id,
 *   field: 'region',
 * });
 *
 * if (selection) {
 *   dashboardActions.addSelection(selection);
 * }
 */
export const buildCrossFilterSelectionFromEvent = ({
  event,
  panelId,
  field,
  op,
  label,
}) => {
  const value = getCrossFilterValueFromEvent(event, field);
  if (value === null || value === undefined) {
    return null;
  }
  return createCrossFilterSelection({
    panelId,
    field,
    value,
    op,
    label,
  });
};

/**
 * Resolve a human-friendly selection label.
 *
 * @param {Selection|null} selection - Selection payload.
 * @returns {string} Display label (empty string when missing).
 */
export const getSelectionLabel = (selection) => {
  if (!selection) {
    return '';
  }
  if (selection.label) {
    return selection.label;
  }
  const values = selection.filter?.values || [];
  return `${selection.filter?.field || 'Filter'}: ${values.join(', ')}`;
};

/**
 * Test whether a selection already exists in the array.
 *
 * @param {Selection[]} [selections=[]] - Existing selections.
 * @param {Selection|null} selection - Candidate selection.
 * @returns {boolean} True when the selection id already exists.
 */
export const isSelectionDuplicate = (selections = [], selection) => {
  if (!selection) {
    return false;
  }
  return selections.some((existing) => existing.id === selection.id);
};

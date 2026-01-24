/**
 * @module core/dashboard/dashboardSelectors
 * @description Selectors for dashboard state, filters, and derived query inputs.
 */

import { toFilterArray } from '../query/QuerySpec';
import { buildQuerySpec } from '../query/buildQuerySpec';
import { getSelectionLabel } from '../interactions/crossFilter';
import { getDrilldownLabel } from '../interactions/drilldown';

/**
 * @typedef {import('../docs/jsdocTypes').DashboardState} DashboardState
 * @typedef {import('../docs/jsdocTypes').Filter} Filter
 * @typedef {import('../docs/jsdocTypes').PanelConfig} PanelConfig
 * @typedef {import('../docs/jsdocTypes').QuerySpec} QuerySpec
 */

/**
 * @typedef {Object} ActiveFilterSummary
 * @property {string} id - Stable id for rendering.
 * @property {'global'|'selection'|'drill'|'panel'} source - Source of the filter.
 * @property {string} field - Filter field.
 * @property {string} op - Filter operator.
 * @property {Array<string|number|boolean|Date>} values - Filter values.
 * @property {string} label - Human-friendly label.
 */

/**
 * @typedef {Object} DrillBreadcrumb
 * @property {string} id - Breadcrumb id.
 * @property {string} label - Breadcrumb label.
 * @property {Object} entry - Drill entry payload.
 * @property {number} index - Index in the drill path.
 */

/**
 * @typedef {Object} SelectedEntity
 * @property {string} selectionId - Selection identifier.
 * @property {string|null} sourcePanelId - Originating panel id.
 * @property {string} label - Display label.
 * @property {string[]} fields - Filter fields touched by the selection.
 * @property {Array<string|number|boolean|Date>} values - Selected values.
 */

const toValueArray = (values) => (Array.isArray(values) ? values : []);

const buildFilterLabel = (filter, fallback = 'Filter') => {
  if (!filter) {
    return fallback;
  }
  const values = toValueArray(filter.values);
  const valueLabel = values.length ? values.join(', ') : 'Any';
  return `${filter.field || fallback} ${filter.op || 'IN'} ${valueLabel}`;
};

const buildFilterFromDrillEntry = (entry) => {
  if (!entry) {
    return null;
  }
  if (entry.filter) {
    return entry.filter;
  }
  if (entry.filters) {
    return entry.filters;
  }
  if (entry.dimension && entry.value !== undefined) {
    return {
      field: entry.dimension,
      op: 'IN',
      values: [entry.value],
    };
  }
  return null;
};

const collectSelectionFilters = (selections = []) =>
  selections.flatMap((selection) => {
    if (selection.filter) {
      return toFilterArray(selection.filter);
    }
    if (selection.filters) {
      return toFilterArray(selection.filters);
    }
    return [];
  });

const collectDrillFilters = (drillPath = []) =>
  drillPath.flatMap((entry) => toFilterArray(buildFilterFromDrillEntry(entry)));

/**
 * Selects the active dashboard id.
 *
 * @param {DashboardState} state
 * @returns {string|null} Dashboard id.
 */
export const selectDashboardId = (state) => state.dashboardId;

/**
 * Selects the active dataset id.
 *
 * @param {DashboardState} state
 * @returns {string|null} Dataset id.
 */
export const selectDatasetId = (state) => state.datasetId;

/**
 * Selects the global filters array.
 *
 * @param {DashboardState} state
 * @returns {Filter[]} Global filters.
 */
export const selectGlobalFilters = (state) => state.globalFilters;

/**
 * Selects the active selections.
 *
 * @param {DashboardState} state
 * @returns {import('../docs/jsdocTypes').Selection[]} Selection array.
 */
export const selectSelections = (state) => state.selections;

/**
 * Selects the current drilldown path entries.
 *
 * @param {DashboardState} state
 * @returns {import('../docs/jsdocTypes').DrilldownPath[]} Drilldown path entries.
 */
export const selectDrillPath = (state) => state.drillPath;

/**
 * Selects per-panel UI state map.
 *
 * @param {DashboardState} state
 * @returns {Record<string, Record<string, unknown>>} Panel state map.
 */
export const selectPanelStateById = (state) => state.panelStateById;

/**
 * Selects local state for a specific panel.
 *
 * @param {DashboardState} state
 * @param {string} panelId
 * @returns {Record<string, unknown>} Panel UI state.
 */
export const selectPanelState = (state, panelId) =>
  state.panelStateById[panelId] || {};

/**
 * Builds a summary of active filters for display (global, selection, drill, panel).
 *
 * @param {DashboardState} state
 * @param {PanelConfig|null} [panelConfig=null]
 * @returns {ActiveFilterSummary[]} Filter summaries for UI rendering.
 */
export const selectActiveFiltersSummary = (state, panelConfig = null) => {
  const summaries = [];
  const globalFilters = toFilterArray(state.globalFilters);
  globalFilters.forEach((filter, index) => {
    summaries.push({
      id: `global-${filter.field || 'filter'}-${index}`,
      source: 'global',
      field: filter.field,
      op: filter.op,
      values: toValueArray(filter.values),
      label: buildFilterLabel(filter, 'Global filter'),
    });
  });

  (state.selections || []).forEach((selection) => {
    const selectionFilters = toFilterArray(selection.filter || selection.filters);
    selectionFilters.forEach((filter, index) => {
      summaries.push({
        id: `selection-${selection.id || index}`,
        source: 'selection',
        field: filter.field,
        op: filter.op,
        values: toValueArray(filter.values),
        label: selection.label || getSelectionLabel(selection),
      });
    });
  });

  (state.drillPath || []).forEach((entry, index) => {
    const drillFilters = toFilterArray(buildFilterFromDrillEntry(entry));
    drillFilters.forEach((filter) => {
      summaries.push({
        id: `drill-${entry.id || index}`,
        source: 'drill',
        field: filter.field,
        op: filter.op,
        values: toValueArray(filter.values),
        label: entry.label || getDrilldownLabel(entry),
      });
    });
  });

  const panelFilters = toFilterArray(panelConfig?.query?.filters);
  panelFilters.forEach((filter, index) => {
    summaries.push({
      id: `panel-${panelConfig?.id || 'panel'}-${index}`,
      source: 'panel',
      field: filter.field,
      op: filter.op,
      values: toValueArray(filter.values),
      label: buildFilterLabel(filter, 'Panel filter'),
    });
  });

  return summaries;
};

/**
 * Maps drilldown path entries to breadcrumb descriptors.
 *
 * @param {DashboardState} state
 * @returns {DrillBreadcrumb[]} Breadcrumbs derived from the drill path.
 */
export const selectDrillBreadcrumbs = (state) =>
  (state.drillPath || []).map((entry, index) => ({
    id: entry.id || `${entry.dimension || 'dimension'}-${index}`,
    label: entry.label || getDrilldownLabel(entry),
    entry,
    index,
  }));

/**
 * Summarizes selections as entity descriptors for UI badges or chips.
 *
 * @param {DashboardState} state
 * @returns {SelectedEntity[]} Selection summaries.
 */
export const selectSelectedEntities = (state) =>
  (state.selections || []).map((selection) => {
    const filters = toFilterArray(selection.filter || selection.filters);
    const fields = filters.map((filter) => filter.field).filter(Boolean);
    const values = filters.flatMap((filter) => toValueArray(filter.values));
    return {
      selectionId: selection.id,
      sourcePanelId: selection.sourcePanelId ?? null,
      label: selection.label || getSelectionLabel(selection),
      fields,
      values,
    };
  });

/**
 * Builds the effective QuerySpec for a panel given current dashboard state.
 *
 * Note: This selector is not memoized; wrap it in useMemo if needed.
 *
 * @param {DashboardState} state
 * @param {PanelConfig} panelConfig
 * @returns {QuerySpec} Derived query spec.
 */
export const selectDerivedQueryInputs = (state, panelConfig) =>
  buildQuerySpec(panelConfig, state);

/**
 * Flattens selection filters into a single list.
 *
 * @param {DashboardState} state
 * @returns {Filter[]} Flattened selection filters.
 */
export const selectSelectionFilters = (state) =>
  collectSelectionFilters(state.selections);

/**
 * Flattens drilldown filters into a single list.
 *
 * @param {DashboardState} state
 * @returns {Filter[]} Flattened drilldown filters.
 */
export const selectDrillFilters = (state) =>
  collectDrillFilters(state.drillPath);

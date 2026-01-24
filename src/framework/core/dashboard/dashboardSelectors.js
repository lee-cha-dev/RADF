import { toFilterArray } from '../query/QuerySpec';
import { buildQuerySpec } from '../query/buildQuerySpec';
import { getSelectionLabel } from '../interactions/crossFilter';
import { getDrilldownLabel } from '../interactions/drilldown';

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

export const selectDashboardId = (state) => state.dashboardId;

export const selectDatasetId = (state) => state.datasetId;

export const selectGlobalFilters = (state) => state.globalFilters;

export const selectSelections = (state) => state.selections;

export const selectDrillPath = (state) => state.drillPath;

export const selectPanelStateById = (state) => state.panelStateById;

export const selectPanelState = (state, panelId) =>
  state.panelStateById[panelId] || {};

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

export const selectDrillBreadcrumbs = (state) =>
  (state.drillPath || []).map((entry, index) => ({
    id: entry.id || `${entry.dimension || 'dimension'}-${index}`,
    label: entry.label || getDrilldownLabel(entry),
    entry,
    index,
  }));

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

export const selectDerivedQueryInputs = (state, panelConfig) =>
  buildQuerySpec(panelConfig, state);

export const selectSelectionFilters = (state) =>
  collectSelectionFilters(state.selections);

export const selectDrillFilters = (state) =>
  collectDrillFilters(state.drillPath);

/**
 * @module core/query/buildQuerySpec
 * @description Composes a QuerySpec from panel configuration and dashboard state.
 */

import { createQuerySpec, toFilterArray } from './QuerySpec';
import { applyDrilldownToDimensions } from '../interactions/drilldown';

/**
 * @typedef {import('../docs/jsdocTypes').DashboardState} DashboardState
 * @typedef {import('../docs/jsdocTypes').PanelConfig} PanelConfig
 * @typedef {import('../docs/jsdocTypes').QuerySpec} QuerySpec
 * @typedef {import('../docs/jsdocTypes').Filter} Filter
 */

/**
 * Coerces drilldown entries into filter objects.
 *
 * @param {object|null|undefined} entry
 * @returns {Filter|Filter[]|null}
 */
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

/**
 * Aggregates filters from dashboard state and panel-level query config.
 *
 * @param {object} params
 * @param {Filter[]|null|undefined} params.globalFilters
 * @param {Array<object>} params.selections
 * @param {Array<object>} params.drillPath
 * @param {Filter[]|null|undefined} params.panelFilters
 * @returns {Filter[]} Combined filter list.
 */
const collectFilters = ({ globalFilters, selections, drillPath, panelFilters }) => {
  const selectionFilters = (selections || []).flatMap((selection) => {
    if (selection.filter) {
      return toFilterArray(selection.filter);
    }
    if (selection.filters) {
      return toFilterArray(selection.filters);
    }
    return [];
  });

  const drillFilters = (drillPath || []).flatMap((entry) =>
    toFilterArray(buildFilterFromDrillEntry(entry))
  );

  return [
    ...toFilterArray(globalFilters),
    ...selectionFilters,
    ...drillFilters,
    ...toFilterArray(panelFilters),
  ].filter(Boolean);
};

/**
 * Builds a QuerySpec for a panel by merging panel config with dashboard state.
 *
 * @param {Partial<PanelConfig>} [panelConfig={}]
 * @param {Partial<DashboardState>} [dashboardState={}]
 * @returns {QuerySpec} QuerySpec ready to execute with a DataProvider.
 */
export const buildQuerySpec = (panelConfig = {}, dashboardState = {}) => {
  const panelQuery = panelConfig.query || {};
  const datasetId = panelConfig.datasetId ?? dashboardState.datasetId ?? null;
  const baseDimensions = panelQuery.dimensions || [];

  const filters = collectFilters({
    globalFilters: dashboardState.globalFilters,
    selections: dashboardState.selections,
    drillPath: dashboardState.drillPath,
    panelFilters: panelQuery.filters,
  });

  return createQuerySpec({
    datasetId,
    measures: panelQuery.measures || [],
    dimensions: applyDrilldownToDimensions({
      dimensions: baseDimensions,
      drillPath: dashboardState.drillPath,
      drilldownConfig: panelConfig.interactions?.drilldown,
    }),
    filters,
    timeRange: panelQuery.timeRange ?? dashboardState.timeRange ?? null,
    grain: panelQuery.grain ?? null,
    sort: panelQuery.sort ?? null,
    limit: panelQuery.limit ?? null,
    offset: panelQuery.offset ?? null,
    timezone: panelQuery.timezone ?? dashboardState.timezone ?? null,
    transforms: panelQuery.transforms || [],
  });
};

import { createQuerySpec, toFilterArray } from './QuerySpec';
import { applyDrilldownToDimensions } from '../interactions/drilldown';

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

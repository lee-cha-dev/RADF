export const selectDashboardState = (state) => state;

export const selectDashboardId = (state) => state.dashboardId;

export const selectDatasetId = (state) => state.datasetId;

export const selectGlobalFilters = (state) => state.globalFilters;

export const selectSelections = (state) => state.selections;

export const selectDrillPath = (state) => state.drillPath;

export const selectPanelStateById = (state) => state.panelStateById;

export const selectPanelState = (state, panelId) => {
  if (!panelId) {
    return undefined;
  }
  return state.panelStateById[panelId];
};

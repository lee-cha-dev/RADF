export const DashboardActionTypes = {
  SET_CONTEXT: 'dashboard/SET_CONTEXT',
  SET_GLOBAL_FILTERS: 'dashboard/SET_GLOBAL_FILTERS',
  ADD_SELECTION: 'dashboard/ADD_SELECTION',
  REMOVE_SELECTION: 'dashboard/REMOVE_SELECTION',
  CLEAR_SELECTIONS: 'dashboard/CLEAR_SELECTIONS',
  PUSH_DRILL: 'dashboard/PUSH_DRILL',
  POP_DRILL: 'dashboard/POP_DRILL',
  SET_PANEL_STATE: 'dashboard/SET_PANEL_STATE',
  SET_PALETTE_ID: 'dashboard/SET_PALETTE_ID',
};

export const setDashboardContext = ({ dashboardId, datasetId }) => ({
  type: DashboardActionTypes.SET_CONTEXT,
  payload: { dashboardId, datasetId },
});

export const setGlobalFilters = (filters) => ({
  type: DashboardActionTypes.SET_GLOBAL_FILTERS,
  payload: { filters },
});

export const addSelection = (selection) => ({
  type: DashboardActionTypes.ADD_SELECTION,
  payload: { selection },
});

export const removeSelection = (selectionId) => ({
  type: DashboardActionTypes.REMOVE_SELECTION,
  payload: { selectionId },
});

export const clearSelections = () => ({
  type: DashboardActionTypes.CLEAR_SELECTIONS,
});

export const pushDrillPath = (entry) => ({
  type: DashboardActionTypes.PUSH_DRILL,
  payload: { entry },
});

export const popDrillPath = () => ({
  type: DashboardActionTypes.POP_DRILL,
});

export const setPanelState = (panelId, nextState) => ({
  type: DashboardActionTypes.SET_PANEL_STATE,
  payload: { panelId, nextState },
});

export const setPaletteId = (paletteId) => ({
  type: DashboardActionTypes.SET_PALETTE_ID,
  payload: { paletteId },
});

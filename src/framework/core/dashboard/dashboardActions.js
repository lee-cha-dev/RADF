export const DASHBOARD_ACTIONS = {
  SET_CONTEXT: "dashboard/SET_CONTEXT",
  SET_GLOBAL_FILTERS: "dashboard/SET_GLOBAL_FILTERS",
  ADD_SELECTION: "dashboard/ADD_SELECTION",
  REMOVE_SELECTION: "dashboard/REMOVE_SELECTION",
  CLEAR_SELECTIONS: "dashboard/CLEAR_SELECTIONS",
  PUSH_DRILL_PATH: "dashboard/PUSH_DRILL_PATH",
  POP_DRILL_PATH: "dashboard/POP_DRILL_PATH",
  SET_PANEL_STATE: "dashboard/SET_PANEL_STATE",
  RESET_PANEL_STATE: "dashboard/RESET_PANEL_STATE",
};

export const setDashboardContext = ({ dashboardId, datasetId }) => ({
  type: DASHBOARD_ACTIONS.SET_CONTEXT,
  payload: { dashboardId, datasetId },
});

export const setGlobalFilters = (filters) => ({
  type: DASHBOARD_ACTIONS.SET_GLOBAL_FILTERS,
  payload: { filters },
});

export const addSelection = (selection) => ({
  type: DASHBOARD_ACTIONS.ADD_SELECTION,
  payload: { selection },
});

export const removeSelection = (selection) => ({
  type: DASHBOARD_ACTIONS.REMOVE_SELECTION,
  payload: { selection },
});

export const clearSelections = () => ({
  type: DASHBOARD_ACTIONS.CLEAR_SELECTIONS,
});

export const pushDrillPath = (entry) => ({
  type: DASHBOARD_ACTIONS.PUSH_DRILL_PATH,
  payload: { entry },
});

export const popDrillPath = () => ({
  type: DASHBOARD_ACTIONS.POP_DRILL_PATH,
});

export const setPanelState = (panelId, panelState) => ({
  type: DASHBOARD_ACTIONS.SET_PANEL_STATE,
  payload: { panelId, panelState },
});

export const resetPanelState = (panelId) => ({
  type: DASHBOARD_ACTIONS.RESET_PANEL_STATE,
  payload: { panelId },
});

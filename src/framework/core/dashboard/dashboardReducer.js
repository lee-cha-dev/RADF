import { DashboardActionTypes } from './dashboardActions';
import { DEFAULT_PALETTE } from '../viz/palettes/paletteRegistry';

export const createInitialDashboardState = (overrides = {}) => ({
  dashboardId: null,
  datasetId: null,
  globalFilters: [],
  selections: [],
  drillPath: [],
  panelStateById: {},
  selectedPaletteId: DEFAULT_PALETTE,
  ...overrides,
});

const mergePanelState = (panelStateById, panelId, nextState) => ({
  ...panelStateById,
  [panelId]: {
    ...(panelStateById[panelId] || {}),
    ...nextState,
  },
});

export const dashboardReducer = (state, action) => {
  switch (action.type) {
    case DashboardActionTypes.SET_CONTEXT:
      return {
        ...state,
        dashboardId: action.payload.dashboardId ?? state.dashboardId,
        datasetId: action.payload.datasetId ?? state.datasetId,
      };
    case DashboardActionTypes.SET_GLOBAL_FILTERS:
      return {
        ...state,
        globalFilters: action.payload.filters,
      };
    case DashboardActionTypes.ADD_SELECTION:
      return {
        ...state,
        selections: [...state.selections, action.payload.selection],
      };
    case DashboardActionTypes.REMOVE_SELECTION:
      return {
        ...state,
        selections: state.selections.filter(
          (selection) => selection.id !== action.payload.selectionId
        ),
      };
    case DashboardActionTypes.CLEAR_SELECTIONS:
      return {
        ...state,
        selections: [],
      };
    case DashboardActionTypes.PUSH_DRILL:
      return {
        ...state,
        drillPath: [...state.drillPath, action.payload.entry],
      };
    case DashboardActionTypes.POP_DRILL:
      return {
        ...state,
        drillPath: state.drillPath.slice(0, -1),
      };
    case DashboardActionTypes.SET_PANEL_STATE:
      return {
        ...state,
        panelStateById: mergePanelState(
          state.panelStateById,
          action.payload.panelId,
          action.payload.nextState
        ),
      };
    case DashboardActionTypes.SET_PALETTE_ID:
      return {
        ...state,
        selectedPaletteId: action.payload.paletteId ?? state.selectedPaletteId,
      };
    default:
      return state;
  }
};

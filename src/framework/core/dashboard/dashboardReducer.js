/**
 * @module core/dashboard/dashboardReducer
 * @description Reducer and state factory for dashboard context.
 */

import { DashboardActionTypes } from './dashboardActions';

/**
 * @typedef {import('../docs/jsdocTypes').DashboardState} DashboardState
 * @typedef {import('../docs/jsdocTypes').DashboardAction} DashboardAction
 */

/**
 * Creates a normalized dashboard state object with defaults.
 *
 * Invariants:
 * - `globalFilters`, `selections`, and `drillPath` are always arrays.
 * - `panelStateById` is an object keyed by panel id.
 *
 * @param {Partial<DashboardState>} [overrides={}] - Optional overrides for initial state.
 * @returns {DashboardState} Initialized dashboard state.
 */
export const createInitialDashboardState = (overrides = {}) => ({
  dashboardId: null,
  datasetId: null,
  globalFilters: [],
  selections: [],
  drillPath: [],
  panelStateById: {},
  ...overrides,
});

/**
 * Merges a panel's UI state into the shared panel state map.
 *
 * @param {Record<string, Record<string, unknown>>} panelStateById
 * @param {string} panelId
 * @param {Record<string, unknown>} nextState
 * @returns {Record<string, Record<string, unknown>>} Updated panel state map.
 */
const mergePanelState = (panelStateById, panelId, nextState) => ({
  ...panelStateById,
  [panelId]: {
    ...(panelStateById[panelId] || {}),
    ...nextState,
  },
});

/**
 * Reducer for dashboard state transitions.
 *
 * @param {DashboardState} state
 * @param {DashboardAction} action
 * @returns {DashboardState} Next dashboard state.
 */
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
    default:
      return state;
  }
};

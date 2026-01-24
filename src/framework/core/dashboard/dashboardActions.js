/**
 * @module core/dashboard/dashboardActions
 * @description Action constants and creators for dashboard state updates.
 */

/**
 * @typedef {import('../docs/jsdocTypes').DashboardAction} DashboardAction
 * @typedef {import('../docs/jsdocTypes').Filter} Filter
 * @typedef {import('../docs/jsdocTypes').Selection} Selection
 * @typedef {import('../docs/jsdocTypes').DrilldownPath} DrilldownPath
 */

/**
 * Action type constants for the dashboard reducer.
 *
 * @type {Record<string, string>}
 */
export const DashboardActionTypes = {
  SET_CONTEXT: 'dashboard/SET_CONTEXT',
  SET_GLOBAL_FILTERS: 'dashboard/SET_GLOBAL_FILTERS',
  ADD_SELECTION: 'dashboard/ADD_SELECTION',
  REMOVE_SELECTION: 'dashboard/REMOVE_SELECTION',
  CLEAR_SELECTIONS: 'dashboard/CLEAR_SELECTIONS',
  PUSH_DRILL: 'dashboard/PUSH_DRILL',
  POP_DRILL: 'dashboard/POP_DRILL',
  SET_PANEL_STATE: 'dashboard/SET_PANEL_STATE',
};

/**
 * Sets the active dashboard and dataset identifiers.
 *
 * @param {{dashboardId?: string, datasetId?: string}} payload
 * @returns {DashboardAction} Action with context payload.
 */
export const setDashboardContext = ({ dashboardId, datasetId }) => ({
  type: DashboardActionTypes.SET_CONTEXT,
  payload: { dashboardId, datasetId },
});

/**
 * Replaces all global filters.
 *
 * @param {Filter[]} filters
 * @returns {DashboardAction} Action with filter payload.
 */
export const setGlobalFilters = (filters) => ({
  type: DashboardActionTypes.SET_GLOBAL_FILTERS,
  payload: { filters },
});

/**
 * Adds a selection to the dashboard.
 *
 * @param {Selection} selection
 * @returns {DashboardAction} Action with selection payload.
 */
export const addSelection = (selection) => ({
  type: DashboardActionTypes.ADD_SELECTION,
  payload: { selection },
});

/**
 * Removes a selection by id.
 *
 * @param {string} selectionId
 * @returns {DashboardAction} Action with selection id payload.
 */
export const removeSelection = (selectionId) => ({
  type: DashboardActionTypes.REMOVE_SELECTION,
  payload: { selectionId },
});

/**
 * Clears all selections.
 *
 * @returns {DashboardAction} Action without payload.
 */
export const clearSelections = () => ({
  type: DashboardActionTypes.CLEAR_SELECTIONS,
});

/**
 * Pushes a drilldown entry onto the path stack.
 *
 * @param {DrilldownPath} entry
 * @returns {DashboardAction} Action with drilldown entry payload.
 */
export const pushDrillPath = (entry) => ({
  type: DashboardActionTypes.PUSH_DRILL,
  payload: { entry },
});

/**
 * Pops the most recent drilldown entry.
 *
 * @returns {DashboardAction} Action without payload.
 */
export const popDrillPath = () => ({
  type: DashboardActionTypes.POP_DRILL,
});

/**
 * Merges local UI state for a panel.
 *
 * @param {string} panelId
 * @param {Record<string, unknown>} nextState
 * @returns {DashboardAction} Action with panel state payload.
 */
export const setPanelState = (panelId, nextState) => ({
  type: DashboardActionTypes.SET_PANEL_STATE,
  payload: { panelId, nextState },
});

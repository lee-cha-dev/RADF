import { DASHBOARD_ACTIONS } from "./dashboardActions";

export const createInitialDashboardState = ({ dashboardId = null, datasetId = null } = {}) => ({
  dashboardId,
  datasetId,
  globalFilters: [],
  selections: [],
  drillPath: [],
  panelStateById: {},
});

const normalizeSelection = (selection) => {
  if (!selection) {
    return null;
  }

  if (selection.id) {
    return selection.id;
  }

  const { field, op, values } = selection;
  return JSON.stringify({ field, op, values });
};

const selectionsEqual = (selectionA, selectionB) => {
  if (!selectionA || !selectionB) {
    return false;
  }

  if (selectionA.id || selectionB.id) {
    return selectionA.id === selectionB.id;
  }

  return (
    selectionA.field === selectionB.field &&
    selectionA.op === selectionB.op &&
    JSON.stringify(selectionA.values || []) === JSON.stringify(selectionB.values || [])
  );
};

const addSelectionUnique = (selections, selection) => {
  const selectionKey = normalizeSelection(selection);
  if (!selectionKey) {
    return selections;
  }

  const alreadySelected = selections.some((existing) => normalizeSelection(existing) === selectionKey);
  if (alreadySelected) {
    return selections;
  }

  return [...selections, selection];
};

const removeSelectionMatch = (selections, selection) => {
  if (!selection) {
    return selections;
  }

  return selections.filter((existing) => !selectionsEqual(existing, selection));
};

export const dashboardReducer = (state, action) => {
  switch (action.type) {
    case DASHBOARD_ACTIONS.SET_CONTEXT: {
      const { dashboardId, datasetId } = action.payload;
      return {
        ...state,
        dashboardId,
        datasetId,
      };
    }
    case DASHBOARD_ACTIONS.SET_GLOBAL_FILTERS: {
      const { filters } = action.payload;
      return {
        ...state,
        globalFilters: Array.isArray(filters) ? filters : [],
      };
    }
    case DASHBOARD_ACTIONS.ADD_SELECTION: {
      const { selection } = action.payload;
      return {
        ...state,
        selections: addSelectionUnique(state.selections, selection),
      };
    }
    case DASHBOARD_ACTIONS.REMOVE_SELECTION: {
      const { selection } = action.payload;
      return {
        ...state,
        selections: removeSelectionMatch(state.selections, selection),
      };
    }
    case DASHBOARD_ACTIONS.CLEAR_SELECTIONS: {
      return {
        ...state,
        selections: [],
      };
    }
    case DASHBOARD_ACTIONS.PUSH_DRILL_PATH: {
      const { entry } = action.payload;
      if (!entry) {
        return state;
      }
      return {
        ...state,
        drillPath: [...state.drillPath, entry],
      };
    }
    case DASHBOARD_ACTIONS.POP_DRILL_PATH: {
      if (state.drillPath.length === 0) {
        return state;
      }
      return {
        ...state,
        drillPath: state.drillPath.slice(0, -1),
      };
    }
    case DASHBOARD_ACTIONS.SET_PANEL_STATE: {
      const { panelId, panelState } = action.payload;
      if (!panelId) {
        return state;
      }
      return {
        ...state,
        panelStateById: {
          ...state.panelStateById,
          [panelId]: {
            ...(state.panelStateById[panelId] || {}),
            ...(panelState || {}),
          },
        },
      };
    }
    case DASHBOARD_ACTIONS.RESET_PANEL_STATE: {
      const { panelId } = action.payload;
      if (!panelId || !state.panelStateById[panelId]) {
        return state;
      }
      const nextPanelStateById = { ...state.panelStateById };
      delete nextPanelStateById[panelId];
      return {
        ...state,
        panelStateById: nextPanelStateById,
      };
    }
    default:
      return state;
  }
};

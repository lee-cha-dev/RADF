import React, { useMemo, useReducer } from 'react';
import { dashboardReducer, createInitialDashboardState } from './dashboardReducer';
import {
  addSelection,
  clearSelections,
  popDrillPath,
  pushDrillPath,
  removeSelection,
  setDashboardContext,
  setGlobalFilters,
  setPanelState,
} from './dashboardActions';
import {
  DashboardActionsContext,
  DashboardStateContext,
} from './DashboardContext';

const bindDashboardActions = (dispatch) => ({
  setDashboardContext: (payload) => dispatch(setDashboardContext(payload)),
  setGlobalFilters: (filters) => dispatch(setGlobalFilters(filters)),
  addSelection: (selection) => dispatch(addSelection(selection)),
  removeSelection: (selectionId) => dispatch(removeSelection(selectionId)),
  clearSelections: () => dispatch(clearSelections()),
  pushDrillPath: (entry) => dispatch(pushDrillPath(entry)),
  popDrillPath: () => dispatch(popDrillPath()),
  setPanelState: (panelId, nextState) => dispatch(setPanelState(panelId, nextState)),
});

const DashboardProvider = ({ children, initialState }) => {
  const [state, dispatch] = useReducer(
    dashboardReducer,
    createInitialDashboardState(initialState)
  );

  const actions = useMemo(() => bindDashboardActions(dispatch), [dispatch]);

  return (
    <DashboardStateContext.Provider value={state}>
      <DashboardActionsContext.Provider value={actions}>
        {children}
      </DashboardActionsContext.Provider>
    </DashboardStateContext.Provider>
  );
};

export default DashboardProvider;

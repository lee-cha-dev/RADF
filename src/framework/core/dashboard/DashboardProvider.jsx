/**
 * @module core/dashboard/DashboardProvider
 * @description Provides dashboard state/actions via context for RADF dashboards.
 */

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

/**
 * @typedef {import('../docs/jsdocTypes').DashboardState} DashboardState
 * @typedef {import('../docs/jsdocTypes').Filter} Filter
 * @typedef {import('../docs/jsdocTypes').Selection} Selection
 * @typedef {import('../docs/jsdocTypes').DrilldownPath} DrilldownPath
 * @typedef {import('./DashboardContext').DashboardActions} DashboardActions
 */

/**
 * @typedef {Object} DashboardProviderProps
 * @property {React.ReactNode} children - Dashboard subtree to wrap.
 * @property {Partial<DashboardState>} [initialState]
 *   - Optional state overrides used to seed the dashboard reducer.
 */

/**
 * Binds action creators to the reducer dispatch function.
 *
 * @param {React.Dispatch<import('../docs/jsdocTypes').DashboardAction>} dispatch
 * @returns {DashboardActions} Bound dashboard actions.
 */
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

/**
 * Supplies dashboard state and actions to descendant components.
 *
 * The provider composes reducer state with a memoized action API so panels,
 * filters, and interactions can read/write dashboard state consistently.
 *
 * @param {DashboardProviderProps} props
 * @returns {JSX.Element} Context providers wrapping the dashboard tree.
 *
 * @example
 * import DashboardProvider from './core/dashboard/DashboardProvider.jsx';
 * import { useDashboardState, useDashboardActions } from './core/dashboard';
 *
 * const DashboardShell = () => {
 *   const { dashboardId, globalFilters } = useDashboardState();
 *   const { setGlobalFilters } = useDashboardActions();
 *
 *   return (
 *     <section>
 *       <h1>{dashboardId}</h1>
 *       <button onClick={() => setGlobalFilters([])}>Clear</button>
 *     </section>
 *   );
 * };
 *
 * const App = () => (
 *   <DashboardProvider initialState={{ dashboardId: 'sales', datasetId: 'sales_ds' }}>
 *     <DashboardShell />
 *   </DashboardProvider>
 * );
 */
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

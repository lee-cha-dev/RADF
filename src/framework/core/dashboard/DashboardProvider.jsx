import { createContext, useMemo, useReducer } from "react";

import { createInitialDashboardState, dashboardReducer } from "./dashboardReducer";

export const DashboardStateContext = createContext(null);
export const DashboardDispatchContext = createContext(null);

export const DashboardProvider = ({ children, initialState }) => {
  const seedState = useMemo(
    () => ({
      ...createInitialDashboardState(),
      ...(initialState || {}),
    }),
    [initialState]
  );

  const [state, dispatch] = useReducer(dashboardReducer, seedState);

  return (
    <DashboardStateContext.Provider value={state}>
      <DashboardDispatchContext.Provider value={dispatch}>
        {children}
      </DashboardDispatchContext.Provider>
    </DashboardStateContext.Provider>
  );
};

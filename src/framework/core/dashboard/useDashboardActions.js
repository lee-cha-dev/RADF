import { useContext, useMemo } from "react";

import { DashboardDispatchContext } from "./DashboardProvider";
import {
  addSelection,
  clearSelections,
  popDrillPath,
  pushDrillPath,
  removeSelection,
  resetPanelState,
  setDashboardContext,
  setGlobalFilters,
  setPanelState,
} from "./dashboardActions";

export const useDashboardActions = () => {
  const dispatch = useContext(DashboardDispatchContext);

  if (!dispatch) {
    throw new Error("useDashboardActions must be used within DashboardProvider");
  }

  return useMemo(
    () => ({
      setDashboardContext: (context) => dispatch(setDashboardContext(context)),
      setGlobalFilters: (filters) => dispatch(setGlobalFilters(filters)),
      addSelection: (selection) => dispatch(addSelection(selection)),
      removeSelection: (selection) => dispatch(removeSelection(selection)),
      clearSelections: () => dispatch(clearSelections()),
      pushDrillPath: (entry) => dispatch(pushDrillPath(entry)),
      popDrillPath: () => dispatch(popDrillPath()),
      setPanelState: (panelId, panelState) => dispatch(setPanelState(panelId, panelState)),
      resetPanelState: (panelId) => dispatch(resetPanelState(panelId)),
    }),
    [dispatch]
  );
};

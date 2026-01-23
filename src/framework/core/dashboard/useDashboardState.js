import { useContext } from "react";

import { DashboardStateContext } from "./DashboardProvider";

export const useDashboardState = () => {
  const state = useContext(DashboardStateContext);

  if (!state) {
    throw new Error("useDashboardState must be used within DashboardProvider");
  }

  return state;
};

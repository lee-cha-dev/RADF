import { useContext } from 'react';
import { DashboardStateContext } from './DashboardContext';

export const useDashboardState = () => {
  const context = useContext(DashboardStateContext);

  if (!context) {
    throw new Error('useDashboardState must be used within a DashboardProvider');
  }

  return context;
};

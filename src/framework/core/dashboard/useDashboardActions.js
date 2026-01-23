import { useContext } from 'react';
import { DashboardActionsContext } from './DashboardProvider';

export const useDashboardActions = () => {
  const context = useContext(DashboardActionsContext);

  if (!context) {
    throw new Error('useDashboardActions must be used within a DashboardProvider');
  }

  return context;
};

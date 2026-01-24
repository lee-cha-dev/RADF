/**
 * @module core/dashboard/useDashboardState
 * @description React hook for accessing dashboard state from context.
 */

import { useContext } from 'react';
import { DashboardStateContext } from './DashboardContext';

/**
 * @typedef {import('../docs/jsdocTypes').DashboardState} DashboardState
 */

/**
 * Returns the current dashboard state.
 *
 * @returns {DashboardState} Dashboard state object.
 * @throws {Error} When used outside of DashboardProvider.
 *
 * @example
 * import { useDashboardState } from './core/dashboard/useDashboardState';
 *
 * const DashboardTitle = () => {
 *   const { dashboardId } = useDashboardState();
 *   return <h1>{dashboardId}</h1>;
 * };
 */
export const useDashboardState = () => {
  const context = useContext(DashboardStateContext);

  if (!context) {
    throw new Error('useDashboardState must be used within a DashboardProvider');
  }

  return context;
};

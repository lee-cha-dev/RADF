/**
 * @module core/dashboard/useDashboardActions
 * @description React hook for accessing dashboard action helpers.
 */

import { useContext } from 'react';
import { DashboardActionsContext } from './DashboardContext';

/**
 * @typedef {import('./DashboardContext').DashboardActions} DashboardActions
 */

/**
 * Returns the bound dashboard action creators.
 *
 * @returns {DashboardActions} Dashboard actions API.
 * @throws {Error} When used outside of DashboardProvider.
 *
 * @example
 * import { useDashboardActions } from './core/dashboard/useDashboardActions';
 *
 * const FiltersToolbar = () => {
 *   const { setGlobalFilters } = useDashboardActions();
 *   return (
 *     <button onClick={() => setGlobalFilters([])}>
 *       Clear filters
 *     </button>
 *   );
 * };
 */
export const useDashboardActions = () => {
  const context = useContext(DashboardActionsContext);

  if (!context) {
    throw new Error('useDashboardActions must be used within a DashboardProvider');
  }

  return context;
};

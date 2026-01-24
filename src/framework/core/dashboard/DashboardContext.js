/**
 * @module core/dashboard/DashboardContext
 * @description React contexts that hold dashboard state and bound actions.
 */

import { createContext } from 'react';

/**
 * @typedef {import('../docs/jsdocTypes').DashboardState} DashboardState
 * @typedef {import('../docs/jsdocTypes').Filter} Filter
 * @typedef {import('../docs/jsdocTypes').Selection} Selection
 * @typedef {import('../docs/jsdocTypes').DrilldownPath} DrilldownPath
 */

/**
 * @typedef {Object} DashboardActions
 * @property {(payload: {dashboardId?: string, datasetId?: string}) => void} setDashboardContext
 *   - Updates the active dashboard and dataset identifiers.
 * @property {(filters: Filter[]) => void} setGlobalFilters
 *   - Replaces the global filter list.
 * @property {(selection: Selection) => void} addSelection
 *   - Adds a selection (typically from cross-filter interactions).
 * @property {(selectionId: string) => void} removeSelection
 *   - Removes a selection by id.
 * @property {() => void} clearSelections
 *   - Clears all active selections.
 * @property {(entry: DrilldownPath) => void} pushDrillPath
 *   - Adds a drilldown entry to the path.
 * @property {() => void} popDrillPath
 *   - Removes the most recent drilldown entry.
 * @property {(panelId: string, nextState: Record<string, unknown>) => void} setPanelState
 *   - Merges panel-level UI state.
 */

/**
 * Dashboard state context (read-only).
 *
 * @type {import('react').Context<DashboardState|null>}
 */
export const DashboardStateContext = createContext(null);

/**
 * Dashboard actions context (write-only).
 *
 * @type {import('react').Context<DashboardActions|null>}
 */
export const DashboardActionsContext = createContext(null);

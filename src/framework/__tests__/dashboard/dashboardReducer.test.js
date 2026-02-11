import { describe, expect, it } from 'vitest';
import {
  createInitialDashboardState,
  dashboardReducer,
} from '../../core/dashboard/dashboardReducer.js';
import { DashboardActionTypes } from '../../core/dashboard/dashboardActions.js';

describe('dashboardReducer', () => {
  it('creates default state with overrides', () => {
    const state = createInitialDashboardState({ dashboardId: 'dash-1' });

    expect(state).toMatchObject({
      dashboardId: 'dash-1',
      datasetId: null,
      globalFilters: [],
      selections: [],
      drillPath: [],
      panelStateById: {},
    });
  });

  it('handles context, filters, selections, and drill actions', () => {
    const initial = createInitialDashboardState();

    const withContext = dashboardReducer(initial, {
      type: DashboardActionTypes.SET_CONTEXT,
      payload: { dashboardId: 'dash-2', datasetId: 'ds-1' },
    });
    expect(withContext.dashboardId).toBe('dash-2');
    expect(withContext.datasetId).toBe('ds-1');

    const withFilters = dashboardReducer(withContext, {
      type: DashboardActionTypes.SET_GLOBAL_FILTERS,
      payload: { filters: [{ field: 'region', op: 'IN', values: ['West'] }] },
    });
    expect(withFilters.globalFilters).toEqual([
      { field: 'region', op: 'IN', values: ['West'] },
    ]);

    const selection = {
      id: 'sel-1',
      filter: { field: 'tier', op: 'IN', values: ['A'] },
    };
    const withSelection = dashboardReducer(withFilters, {
      type: DashboardActionTypes.ADD_SELECTION,
      payload: { selection },
    });
    expect(withSelection.selections).toEqual([selection]);

    const clearedSelection = dashboardReducer(withSelection, {
      type: DashboardActionTypes.CLEAR_SELECTIONS,
    });
    expect(clearedSelection.selections).toEqual([]);

    const withDrill = dashboardReducer(clearedSelection, {
      type: DashboardActionTypes.PUSH_DRILL,
      payload: { entry: { id: 'drill-1', dimension: 'region', value: 'West' } },
    });
    expect(withDrill.drillPath).toHaveLength(1);

    const popped = dashboardReducer(withDrill, {
      type: DashboardActionTypes.POP_DRILL,
    });
    expect(popped.drillPath).toHaveLength(0);
  });

  it('merges panel state by id', () => {
    const initial = createInitialDashboardState({
      panelStateById: { 'panel-1': { hidden: true } },
    });

    const next = dashboardReducer(initial, {
      type: DashboardActionTypes.SET_PANEL_STATE,
      payload: { panelId: 'panel-1', nextState: { expanded: false } },
    });

    expect(next.panelStateById['panel-1']).toEqual({
      hidden: true,
      expanded: false,
    });
  });
});

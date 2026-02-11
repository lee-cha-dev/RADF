import { describe, expect, it } from 'vitest';
import {
  selectActiveFiltersSummary,
  selectDrillBreadcrumbs,
  selectSelectedEntities,
  selectSelectionFilters,
  selectDrillFilters,
} from '../../core/dashboard/dashboardSelectors.js';

const buildState = () => ({
  dashboardId: 'dash-1',
  datasetId: 'ds-1',
  globalFilters: [{ field: 'region', op: 'IN', values: ['West'] }],
  selections: [
    {
      id: 'sel-1',
      sourcePanelId: 'panel-1',
      label: 'Region: West',
      filter: { field: 'region', op: 'IN', values: ['West'] },
    },
  ],
  drillPath: [
    {
      id: 'drill-1',
      dimension: 'order_month',
      value: '2024-01',
      label: 'order_month: 2024-01',
    },
  ],
  panelStateById: { 'panel-1': { focused: true } },
});

describe('dashboardSelectors', () => {
  it('summarizes active filters with sources', () => {
    const state = buildState();
    const panelConfig = {
      id: 'panel-9',
      query: { filters: [{ field: 'channel', op: 'IN', values: ['Online'] }] },
    };

    const summaries = selectActiveFiltersSummary(state, panelConfig);

    expect(summaries).toHaveLength(4);
    expect(summaries.map((item) => item.source)).toEqual([
      'global',
      'selection',
      'drill',
      'panel',
    ]);
  });

  it('builds drill breadcrumbs and selected entity summaries', () => {
    const state = buildState();

    const breadcrumbs = selectDrillBreadcrumbs(state);
    expect(breadcrumbs[0]).toMatchObject({
      id: 'drill-1',
      label: 'order_month: 2024-01',
      index: 0,
    });

    const entities = selectSelectedEntities(state);
    expect(entities[0]).toMatchObject({
      selectionId: 'sel-1',
      sourcePanelId: 'panel-1',
      label: 'Region: West',
      fields: ['region'],
      values: ['West'],
    });
  });

  it('flattens selection and drill filters', () => {
    const state = buildState();

    const selectionFilters = selectSelectionFilters(state);
    expect(selectionFilters).toEqual([
      { field: 'region', op: 'IN', values: ['West'] },
    ]);

    const drillFilters = selectDrillFilters(state);
    expect(drillFilters).toEqual([
      { field: 'order_month', op: 'IN', values: ['2024-01'] },
    ]);
  });
});
